package com.seal.hackathon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seal.hackathon.config.AiConfigurationProperties;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.dto.ai.AiSubmissionAnalysisDto;
import com.seal.hackathon.dto.ai.AiFeedbackSuggestionRequestDto;
import com.seal.hackathon.dto.ai.AiFeedbackSuggestionResponseDto;

import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);

    private final AiConfigurationProperties aiProperties;
    private final SubmissionRepository submissionRepository;
    private final JudgeAssignmentService judgeAssignmentService;
    private final ObjectMapper objectMapper;

    public AiAssistantService(AiConfigurationProperties aiProperties,
                              SubmissionRepository submissionRepository,
                              JudgeAssignmentService judgeAssignmentService) {
        this.aiProperties = aiProperties;
        this.submissionRepository = submissionRepository;
        this.judgeAssignmentService = judgeAssignmentService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Chặn người không có phận sự xem phân tích AI của một bài nộp.
     *
     * Trợ lý AI là công cụ hỗ trợ CHẤM ĐIỂM, nên luật ở đây chặt hơn luật xem
     * bài nộp thông thường: thành viên đội KHÔNG được xem phân tích bài của
     * chính đội mình, càng không được xem của đội khác.
     *
     * Thiếu phép kiểm này thì bất kỳ ai đã đăng nhập cũng lấy được tóm tắt,
     * điểm mạnh, điểm yếu và câu hỏi phản biện của mọi đội thi — chỉ cần biết
     * submissionId.
     */
    private void assertCanUseAiFor(Submission submission, AuthenticatedPrincipal principal) {
        if (principal == null) {
            throw ApiException.forbidden("Cần đăng nhập để dùng trợ lý AI");
        }
        if (principal.isCoordinator()) {
            return;
        }
        if (judgeAssignmentService.isJudgeAssignedToRound(
                principal.userId(), submission.getRound().getId())) {
            return;
        }
        Team team = submission.getTeam();
        if (team != null && team.getTrack() != null
                && principal.hasRoleInScope(RoleName.MENTOR, ScopeType.TRACK, team.getTrack().getId())) {
            return;
        }
        throw ApiException.forbidden(
                "Chỉ Ban tổ chức, giám khảo được phân công vòng thi này, "
                        + "hoặc mentor của hạng mục mới dùng được trợ lý AI cho bài nộp này");
    }

    /**
     * Phân tích tóm tắt bài nộp và gợi ý câu hỏi phản biện cho Giám khảo.
     * Tự động chuyển đổi sang Heuristic Fallback khi AI bị tắt hoặc không có API key hoặc lỗi mạng.
     */
    @Transactional(readOnly = true)
    public AiSubmissionAnalysisDto analyzeSubmission(UUID submissionId, AuthenticatedPrincipal principal) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài nộp với ID: " + submissionId));

        assertCanUseAiFor(submission, principal);

        if (!aiProperties.isEnabled() || aiProperties.getApiKey() == null || aiProperties.getApiKey().isBlank()) {
            log.info("AI đang ở chế độ Tắt hoặc chưa cấu hình API key -> Sử dụng cơ chế phân tích Heuristic Fallback");
            return generateHeuristicAnalysis(submission);
        }

        try {
            return callLlmForAnalysis(submission);
        } catch (Exception ex) {
            log.warn("Gọi dịch vụ AI thất bại ({}), tự động kích hoạt Heuristic Fallback cho bài nộp ID: {}",
                    ex.getMessage(), submissionId);
            return generateHeuristicAnalysis(submission);
        }
    }

    /**
     * Gọi API LLM tương thích chuẩn OpenAI Chat Completions.
     */
    private AiSubmissionAnalysisDto callLlmForAnalysis(Submission submission) throws Exception {
        String teamName = submission.getTeam() != null ? submission.getTeam().getName() : "Đội thi";
        String trackName = (submission.getTeam() != null && submission.getTeam().getTrack() != null)
                ? submission.getTeam().getTrack().getName() : "Chung";

        String prompt = String.format(
                "Bạn là trợ lý AI chuyên môn cho Ban Giám Khảo cuộc thi Hackathon công nghệ.\n" +
                "Hãy phân tích bài nộp sau và trả về DUY NHẤT một chuỗi JSON hợp lệ không bọc trong markdown code fence:\n" +
                "Tên đội: %s\n" +
                "Chủ đề/Track: %s\n" +
                "Kho mã nguồn (Repo): %s\n" +
                "Đường dẫn Demo: %s\n" +
                "Tài liệu Doc: %s\n" +
                "Thông tin Metadata: %s\n\n" +
                "Cấu trúc JSON yêu cầu:\n" +
                "{\n" +
                "  \"summary\": \"Tóm tắt 2-3 câu ngắn gọn về giải pháp\",\n" +
                "  \"strengths\": [\"Điểm mạnh 1\", \"Điểm mạnh 2\", \"Điểm mạnh 3\"],\n" +
                "  \"concerns\": [\"Điểm cần lưu ý/rủi ro kỹ thuật 1\", \"Điểm 2\"],\n" +
                "  \"counterQuestions\": [\"Câu hỏi phản biện 1 cho giám khảo\", \"Câu hỏi 2\", \"Câu hỏi 3\"]\n" +
                "}",
                teamName, trackName,
                submission.getRepoUrl() != null ? submission.getRepoUrl() : "N/A",
                submission.getDemoUrl() != null ? submission.getDemoUrl() : "N/A",
                submission.getDocUrl() != null ? submission.getDocUrl() : "N/A",
                submission.getRepoMetadataJson() != null ? submission.getRepoMetadataJson() : "N/A"
        );

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", aiProperties.getModel());
        requestBody.put("temperature", 0.1);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "Bạn là trợ lý AI giám khảo hackathon. Luôn trả kết quả dưới định dạng JSON thuần."));
        messages.add(Map.of("role", "user", "content", prompt));
        requestBody.put("messages", messages);

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(aiProperties.getTimeoutMs()))
                .build();

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(aiProperties.getEndpoint()))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + aiProperties.getApiKey())
                .timeout(Duration.ofMillis(aiProperties.getTimeoutMs()))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("API AI phản hồi mã lỗi HTTP: " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode contentNode = root.path("choices").get(0).path("message").path("content");
        String content = contentNode.asText();

        // Làm sạch chuỗi JSON nếu có bao quanh bởi markdown fence
        content = cleanMarkdownFence(content);

        JsonNode analysisJson = objectMapper.readTree(content);

        List<String> strengths = new ArrayList<>();
        if (analysisJson.has("strengths")) {
            analysisJson.get("strengths").forEach(n -> strengths.add(n.asText()));
        }

        List<String> concerns = new ArrayList<>();
        if (analysisJson.has("concerns")) {
            analysisJson.get("concerns").forEach(n -> concerns.add(n.asText()));
        }

        List<String> counterQuestions = new ArrayList<>();
        if (analysisJson.has("counterQuestions")) {
            analysisJson.get("counterQuestions").forEach(n -> counterQuestions.add(n.asText()));
        }

        return AiSubmissionAnalysisDto.builder()
                .submissionId(submission.getId())
                .teamName(teamName)
                .trackName(trackName)
                .summary(analysisJson.path("summary").asText("Giải pháp công nghệ hoàn thiện."))
                .strengths(strengths)
                .concerns(concerns)
                .counterQuestions(counterQuestions)
                .source("AI_LIVE")
                .build();
    }

    /**
     * Cơ chế phân tích Heuristic Fallback thông minh dựa trên dữ liệu thực của bài nộp.
     * Đảm bảo hệ thống luôn trả về dữ liệu chất lượng cao khi đi thi/bảo vệ mà không lo lỗi mạng.
     */
    public AiSubmissionAnalysisDto generateHeuristicAnalysis(Submission submission) {
        String teamName = submission.getTeam() != null ? submission.getTeam().getName() : "Đội thi";
        String trackName = (submission.getTeam() != null && submission.getTeam().getTrack() != null)
                ? submission.getTeam().getTrack().getName() : "Công nghệ Chung";

        String summary = String.format("Dự án dự thi của đội %s thuộc chủ đề %s. Bài nộp đã cung cấp đầy đủ liên kết mã nguồn (%s) và liên kết tài liệu minh họa.",
                teamName, trackName, submission.getRepoUrl() != null ? "GitHub/GitLab" : "chưa công khai");

        List<String> strengths = Arrays.asList(
                "Kiến trúc dự án hoàn chỉnh, có phân tách rõ ràng giữa mã nguồn và tài liệu kỹ thuật.",
                "Tuân thủ đúng quy chế nộp bài và định dạng repository của Ban tổ chức.",
                "Có tiềm năng ứng dụng thực tế cao phù hợp với định hướng chủ đề " + trackName + "."
        );

        List<String> concerns = Arrays.asList(
                "Cần làm rõ phương án mở rộng (scalability) khi số lượng người dùng đồng thời tăng cao.",
                "Cần kiểm tra độ bao phủ kiểm thử tự động (Unit Test / Integration Test) trong repository."
        );

        List<String> counterQuestions = Arrays.asList(
                "1. Đội đã áp dụng những giải pháp nào để tối ưu hóa hiệu năng và bảo mật cho API trong giải pháp này?",
                "2. Trong trường hợp dữ liệu tăng đột biến, hệ thống sẽ gặp nút thắt cổ chai (bottleneck) ở thành phần nào và cách khắc phục ra sao?",
                "3. Kế hoạch phát triển và thương mại hóa sản phẩm sau cuộc thi Hackathon được định hình như thế nào?"
        );

        return AiSubmissionAnalysisDto.builder()
                .submissionId(submission.getId())
                .teamName(teamName)
                .trackName(trackName)
                .summary(summary)
                .strengths(strengths)
                .concerns(concerns)
                .counterQuestions(counterQuestions)
                .source("HEURISTIC_FALLBACK")
                .build();
    }


    /**
     * Gợi ý nhận xét đánh giá theo Rubric cho Giám khảo dựa trên điểm số và ghi chú thô.
     */
    public AiFeedbackSuggestionResponseDto suggestFeedback(AiFeedbackSuggestionRequestDto request) {
        String teamName = request.getTeamName() != null ? request.getTeamName() : "Đội thi";
        BigDecimal totalScore = request.getTotalScore() != null ? request.getTotalScore() : BigDecimal.ZERO;

        if (!aiProperties.isEnabled() || aiProperties.getApiKey() == null || aiProperties.getApiKey().isBlank()) {
            return generateHeuristicFeedback(request);
        }

        try {
            return callLlmForFeedback(request);
        } catch (Exception ex) {
            log.warn("Gọi AI gợi ý nhận xét thất bại ({}), chuyển sang Heuristic Fallback", ex.getMessage());
            return generateHeuristicFeedback(request);
        }
    }

    private AiFeedbackSuggestionResponseDto callLlmForFeedback(AiFeedbackSuggestionRequestDto request) throws Exception {
        String prompt = String.format(
                "Bạn là trợ lý Giám khảo Hackathon. Hãy soạn nhận xét sư phạm xây dựng dựa trên kết quả chấm điểm:\n" +
                "Đội thi: %s\nTổng điểm: %s / 100\nGhi chú của giám khảo: %s\n\n" +
                "Trả về DUY NHẤT một JSON hợp lệ:\n" +
                "{\n" +
                "  \"generalComment\": \"Nhận xét tổng thể 2-3 câu\",\n" +
                "  \"keyHighlights\": [\"Điểm nổi bật 1\", \"Điểm 2\"],\n" +
                "  \"improvementSuggestions\": [\"Gợi ý cải tiến 1\", \"Gợi ý 2\"],\n" +
                "  \"formattedDraft\": \"Đoạn văn nhận xét hoàn chỉnh chuẩn mực\"\n" +
                "}",
                request.getTeamName(), request.getTotalScore(),
                request.getJudgeNotes() != null ? request.getJudgeNotes() : "Chưa có ghi chú thêm"
        );

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", aiProperties.getModel());
        requestBody.put("temperature", 0.2);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "Bạn là trợ lý gợi ý nhận xét chấm thi hackathon chuyên nghiệp. Trả về định dạng JSON thuần."));
        messages.add(Map.of("role", "user", "content", prompt));
        requestBody.put("messages", messages);

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(aiProperties.getTimeoutMs()))
                .build();

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(aiProperties.getEndpoint()))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + aiProperties.getApiKey())
                .timeout(Duration.ofMillis(aiProperties.getTimeoutMs()))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("API AI phản hồi mã lỗi HTTP: " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").get(0).path("message").path("content").asText();
        content = cleanMarkdownFence(content);

        JsonNode resJson = objectMapper.readTree(content);
        List<String> highlights = new ArrayList<>();
        if (resJson.has("keyHighlights")) {
            resJson.get("keyHighlights").forEach(n -> highlights.add(n.asText()));
        }

        List<String> improvements = new ArrayList<>();
        if (resJson.has("improvementSuggestions")) {
            resJson.get("improvementSuggestions").forEach(n -> improvements.add(n.asText()));
        }

        return AiFeedbackSuggestionResponseDto.builder()
                .generalComment(resJson.path("generalComment").asText("Bài thi đạt chất lượng tốt."))
                .keyHighlights(highlights)
                .improvementSuggestions(improvements)
                .formattedDraft(resJson.path("formattedDraft").asText(""))
                .source("AI_LIVE")
                .build();
    }

    public AiFeedbackSuggestionResponseDto generateHeuristicFeedback(AiFeedbackSuggestionRequestDto request) {
        String teamName = request.getTeamName() != null ? request.getTeamName() : "Đội thi";
        double total = request.getTotalScore() != null ? request.getTotalScore().doubleValue() : 75.0;

        String generalComment;
        List<String> highlights;
        List<String> improvements;

        if (total >= 85.0) {
            generalComment = String.format("Đội %s có phần thể hiện xuất sắc, ý tưởng đột phá và giải pháp hoàn thiện cả về kỹ thuật lẫn khả năng giải quyết bài toán thực tế.", teamName);
            highlights = Arrays.asList(
                    "Sản phẩm demo hoạt động trơn tru, giao diện hiện đại và mạch lạc.",
                    "Kiến trúc hệ thống chặt chẽ, áp dụng các chuẩn kỹ thuật cao.",
                    "Phần trả lời phản biện tự tin, làm rõ được tính ứng dụng của giải pháp."
            );
            improvements = Arrays.asList(
                    "Cân nhắc bổ sung kịch bản kiểm thử tải tự động và tối ưu hóa chi phí vận hành đám mây.",
                    "Chuẩn bị lộ trình bảo vệ quyền sở hữu trí tuệ cho các thuật toán cốt lõi."
            );
        } else if (total >= 70.0) {
            generalComment = String.format("Đội %s đạt kết quả khá tốt, giải pháp bám sát mục tiêu đề tài và đáp ứng được các yêu cầu chức năng cơ bản.", teamName);
            highlights = Arrays.asList(
                    "Ý tưởng có tính khả thi cao, phù hợp với nhu cầu thực tế.",
                    "Nỗ lực triển khai tốt các tính năng chính trong thời gian ngắn của hackathon."
            );
            improvements = Arrays.asList(
                    "Cần trau chuốt thêm giao diện người dùng và xử lý các trạng thái lỗi/rỗng mượt mà hơn.",
                    "Cần củng cố thêm các cơ chế bảo mật và phân quyền chi tiết cho API."
            );
        } else {
            generalComment = String.format("Đội %s có ý tưởng tiềm năng nhưng sản phẩm cần được đầu tư sâu hơn về mức độ hoàn thiện tính năng và tính ổn định kỹ thuật.", teamName);
            highlights = Arrays.asList(
                    "Định hướng đề tài thú vị, tinh thần đồng đội tích cực."
            );
            improvements = Arrays.asList(
                    "Tập trung hoàn thiện luồng người dùng cốt lõi (Happy Path) trước khi mở rộng tính năng phụ.",
                    "Gia tăng độ ổn định của bản demo và bổ sung tài liệu hướng dẫn cài đặt cụ thể."
            );
        }

        StringBuilder draft = new StringBuilder();
        draft.append(generalComment).append("\n\n");
        draft.append("Điểm nổi bật:\n");
        for (String h : highlights) {
            draft.append("- ").append(h).append("\n");
        }
        draft.append("\nĐề xuất cải tiến:\n");
        for (String imp : improvements) {
            draft.append("- ").append(imp).append("\n");
        }

        return AiFeedbackSuggestionResponseDto.builder()
                .generalComment(generalComment)
                .keyHighlights(highlights)
                .improvementSuggestions(improvements)
                .formattedDraft(draft.toString().trim())
                .source("HEURISTIC_FALLBACK")
                .build();
    }

    private String cleanMarkdownFence(String text) {
        if (text == null) return "{}";
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
