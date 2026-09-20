package com.seal.hackathon.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seal.hackathon.config.AiConfigurationProperties;
import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.dto.ai.AiSubmissionAnalysisDto;
import com.seal.hackathon.dto.ai.AiFeedbackSuggestionRequestDto;
import com.seal.hackathon.dto.ai.AiFeedbackSuggestionResponseDto;
import java.math.BigDecimal;
import java.util.Map;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiAssistantServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private JudgeAssignmentService judgeAssignmentService;

    @Spy
    private AiConfigurationProperties aiProperties = new AiConfigurationProperties();

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AiAssistantService aiAssistantService;

    private UUID submissionId;
    private UUID roundId;
    private UUID trackId;
    private Submission mockSubmission;

    /** Ban tổ chức — xem được mọi bài nộp. */
    private AuthenticatedPrincipal coordinator() {
        return principalWith(new AuthenticatedPrincipal.RoleGrant(
                RoleName.COORDINATOR, ScopeType.GLOBAL, null, null));
    }

    /** Giám khảo — quyền phụ thuộc có được phân công vòng thi hay không. */
    private AuthenticatedPrincipal judge() {
        return principalWith(new AuthenticatedPrincipal.RoleGrant(
                RoleName.JUDGE, ScopeType.GLOBAL, null, null));
    }

    /** Mentor của đúng hạng mục chứa bài nộp. */
    private AuthenticatedPrincipal mentorOfTrack() {
        return principalWith(new AuthenticatedPrincipal.RoleGrant(
                RoleName.MENTOR, ScopeType.TRACK, trackId, null));
    }

    /** Thành viên đội — không có vai trò chấm điểm nào. */
    private AuthenticatedPrincipal teamMember() {
        return principalWith(new AuthenticatedPrincipal.RoleGrant(
                RoleName.TEAM_MEMBER, ScopeType.GLOBAL, null, null));
    }

    private AuthenticatedPrincipal principalWith(AuthenticatedPrincipal.RoleGrant grant) {
        return new AuthenticatedPrincipal(UUID.randomUUID(), "a@b.com", "Nguoi dung", List.of(grant));
    }

    @BeforeEach
    void setUp() {
        submissionId = UUID.randomUUID();
        HackathonEvent event = HackathonEvent.builder().name("SEAL AI Hackathon").build();
        Track track = Track.builder().name("AI / Machine Learning").build();
        trackId = UUID.randomUUID();
        track.setId(trackId);

        Team team = Team.builder().name("TechTitans").event(event).track(track).build();

        Round round = Round.builder().name("Chung kết").build();
        roundId = UUID.randomUUID();
        round.setId(roundId);

        mockSubmission = Submission.builder()
                .team(team)
                .round(round)
                .repoUrl("https://github.com/techtitans/seal-solution")
                .demoUrl("https://techtitans.seal.edu.vn")
                .docUrl("https://docs.techtitans.seal.edu.vn")
                .repoMetadataJson("{\"stars\": 42}")
                .submittedAt(Instant.now())
                .isLate(false)
                .build();
        mockSubmission.setId(submissionId);
    }

    @Test
    @DisplayName("analyzeSubmission: Nem loi NotFound khi ID bai nop khong ton tai")
    void analyzeSubmission_NotFound() {
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> aiAssistantService.analyzeSubmission(submissionId, coordinator()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy bài nộp");
    }

    @Test
    @DisplayName("analyzeSubmission: Tu dong su dung Heuristic Fallback khi AI disabled")
    void analyzeSubmission_DisabledFallback() {
        aiProperties.setEnabled(false);
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(mockSubmission));

        AiSubmissionAnalysisDto result = aiAssistantService.analyzeSubmission(submissionId, coordinator());

        assertThat(result).isNotNull();
        assertThat(result.getSubmissionId()).isEqualTo(submissionId);
        assertThat(result.getTeamName()).isEqualTo("TechTitans");
        assertThat(result.getTrackName()).isEqualTo("AI / Machine Learning");
        assertThat(result.getSource()).isEqualTo("HEURISTIC_FALLBACK");
        assertThat(result.getSummary()).contains("TechTitans");
        assertThat(result.getStrengths()).isNotEmpty();
        assertThat(result.getConcerns()).isNotEmpty();
        assertThat(result.getCounterQuestions()).hasSize(3);
    }

    @Test
    @DisplayName("generateHeuristicAnalysis: Tao day du thong tin phan tich truc quan cho bai nop")
    void generateHeuristicAnalysis_Success() {
        AiSubmissionAnalysisDto result = aiAssistantService.generateHeuristicAnalysis(mockSubmission);

        assertThat(result).isNotNull();
        assertThat(result.getTeamName()).isEqualTo("TechTitans");
        assertThat(result.getCounterQuestions().get(0)).contains("hiệu năng");
        assertThat(result.getStrengths()).hasSize(3);
    }

    @Test
    @DisplayName("suggestFeedback: Goi y nhan xet cho diem xuat sac (>= 85)")
    void suggestFeedback_ExcellentScore() {
        AiFeedbackSuggestionRequestDto request = AiFeedbackSuggestionRequestDto.builder()
                .teamName("AlphaTech")
                .totalScore(new BigDecimal("92.5"))
                .criterionScores(Map.of("Innovation", new BigDecimal("9.5"), "Tech", new BigDecimal("9.0")))
                .build();

        AiFeedbackSuggestionResponseDto response = aiAssistantService.suggestFeedback(request);

        assertThat(response).isNotNull();
        assertThat(response.getSource()).isEqualTo("HEURISTIC_FALLBACK");
        assertThat(response.getGeneralComment()).contains("xuất sắc");
        assertThat(response.getKeyHighlights()).isNotEmpty();
        assertThat(response.getImprovementSuggestions()).isNotEmpty();
        assertThat(response.getFormattedDraft()).contains("AlphaTech");
    }

    @Test
    @DisplayName("suggestFeedback: Goi y nhan xet cho diem trung binh (< 70)")
    void suggestFeedback_ModerateScore() {
        AiFeedbackSuggestionRequestDto request = AiFeedbackSuggestionRequestDto.builder()
                .teamName("BetaTeam")
                .totalScore(new BigDecimal("65.0"))
                .build();

        AiFeedbackSuggestionResponseDto response = aiAssistantService.suggestFeedback(request);

        assertThat(response).isNotNull();
        assertThat(response.getSource()).isEqualTo("HEURISTIC_FALLBACK");
        assertThat(response.getGeneralComment()).contains("tiềm năng");
        assertThat(response.getImprovementSuggestions().get(0)).contains("Happy Path");
    }

    // ---------------------------------------------------------------------
    // Phan quyen dung tro ly AI
    //
    // Truoc khi vá, /api/ai/submissions/{id}/analyze khong kiem gi ca: bat ky
    // ai da dang nhap cung lay duoc tom tat, diem manh, diem yeu va cau hoi
    // phan bien cua MOI doi thi - chi can biet submissionId.
    // ---------------------------------------------------------------------

    @Test
    @DisplayName("Phan quyen: thanh vien doi KHONG duoc dung tro ly AI")
    void analyzeSubmission_ChanThanhVienDoi() {
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(mockSubmission));
        lenient().when(judgeAssignmentService.isJudgeAssignedToRound(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> aiAssistantService.analyzeSubmission(submissionId, teamMember()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Chỉ Ban tổ chức, giám khảo");
    }

    @Test
    @DisplayName("Phan quyen: giam khao KHONG duoc phan cong vong nay thi bi chan")
    void analyzeSubmission_ChanGiamKhaoKhongPhuTrachVong() {
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(mockSubmission));
        when(judgeAssignmentService.isJudgeAssignedToRound(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> aiAssistantService.analyzeSubmission(submissionId, judge()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Chỉ Ban tổ chức, giám khảo");
    }

    @Test
    @DisplayName("Phan quyen: giam khao DA duoc phan cong vong nay thi dung duoc")
    void analyzeSubmission_ChoPhepGiamKhaoPhuTrachVong() {
        aiProperties.setEnabled(false);
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(mockSubmission));
        when(judgeAssignmentService.isJudgeAssignedToRound(any(), eq(roundId))).thenReturn(true);

        AiSubmissionAnalysisDto result = aiAssistantService.analyzeSubmission(submissionId, judge());

        assertThat(result).isNotNull();
        assertThat(result.getTeamName()).isEqualTo("TechTitans");
    }

    @Test
    @DisplayName("Phan quyen: mentor cua dung hang muc thi dung duoc")
    void analyzeSubmission_ChoPhepMentorCuaHangMuc() {
        aiProperties.setEnabled(false);
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(mockSubmission));
        lenient().when(judgeAssignmentService.isJudgeAssignedToRound(any(), any())).thenReturn(false);

        AiSubmissionAnalysisDto result = aiAssistantService.analyzeSubmission(submissionId, mentorOfTrack());

        assertThat(result).isNotNull();
        assertThat(result.getTrackName()).isEqualTo("AI / Machine Learning");
    }

    @Test
    @DisplayName("Phan quyen: chua dang nhap (principal null) thi bi chan")
    void analyzeSubmission_ChanKhiChuaDangNhap() {
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(mockSubmission));

        assertThatThrownBy(() -> aiAssistantService.analyzeSubmission(submissionId, null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Cần đăng nhập");
    }
}
