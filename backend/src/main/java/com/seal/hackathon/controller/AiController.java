package com.seal.hackathon.controller;

import com.seal.hackathon.dto.ai.AiSubmissionAnalysisDto;
import com.seal.hackathon.dto.ai.AiFeedbackSuggestionRequestDto;
import com.seal.hackathon.dto.ai.AiFeedbackSuggestionResponseDto;
import org.springframework.web.bind.annotation.RequestBody;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.AiAssistantService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "Các endpoint Trợ lý Trí tuệ Nhân tạo thông minh cho Hackathon")
public class AiController {

    private final AiAssistantService aiAssistantService;

    @Operation(summary = "Kiểm tra trạng thái cấu hình AI")
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAiStatus() {
        return ResponseEntity.ok(Map.of(
                "status", "ACTIVE",
                "service", "SHMS Hybrid AI Assistant",
                "fallbackMode", "AUTO_HEURISTIC"
        ));
    }

    @Operation(summary = "Phân tích bài nộp, tóm tắt và gợi ý câu hỏi phản biện cho Giám khảo")
    @PostMapping("/submissions/{submissionId}/analyze")
    public ResponseEntity<AiSubmissionAnalysisDto> analyzeSubmission(
            @PathVariable UUID submissionId,
            @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        AiSubmissionAnalysisDto analysis = aiAssistantService.analyzeSubmission(submissionId, principal);
        return ResponseEntity.ok(analysis);
    }
    @Operation(summary = "Gợi ý nhận xét chấm điểm theo Rubric cho Giám khảo")
    @PostMapping("/rubric-feedback/suggest")
    public ResponseEntity<AiFeedbackSuggestionResponseDto> suggestRubricFeedback(
            @RequestBody AiFeedbackSuggestionRequestDto request) {
        AiFeedbackSuggestionResponseDto response = aiAssistantService.suggestFeedback(request);
        return ResponseEntity.ok(response);
    }
}
