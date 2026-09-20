package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.dto.ai.AiFeedbackSuggestionResponseDto;
import com.seal.hackathon.dto.ai.AiSubmissionAnalysisDto;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.AiAssistantService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phan quyen cho tro ly AI.
 *
 * Day la noi tung co lo hong nghiem trong nhat cua du an: truoc khi va,
 * /api/ai/submissions/{id}/analyze KHONG kiem gi ca - bat ky ai da dang nhap
 * cung lay duoc tom tat, diem manh, diem yeu va cau hoi phan bien cua MOI doi
 * thi, chi can biet submissionId.
 *
 * Luu y ve cach chan cua hai nhom endpoint:
 * - /status va /rubric-feedback/suggest chan bang @PreAuthorize theo vai tro.
 * - /analyze thi KHONG dan @PreAuthorize, vi quyen phu thuoc bai nop cu the
 *   (giam khao co duoc phan cong vong do khong, mentor co dung hang muc khong).
 *   Luat do nam o AiAssistantService.assertCanUseAiFor va co 10 test rieng.
 */
@WebMvcTest(AiController.class)
@Import(MethodSecurityTestConfig.class)
class AiControllerTest extends PhanQuyenTestBase {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private AiAssistantService aiAssistantService;
    @MockitoBean private JwtService jwtService;

    private static final String THAN_GOI_Y =
            "{\"teamName\":\"AlphaTech\",\"totalScore\":85.0}";

    @Test
    @DisplayName("status: THI SINH khong xem duoc trang thai tro ly AI")
    void status_ChanThiSinh() throws Exception {
        mockMvc.perform(get("/api/ai/status").with(authentication(thiSinh())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("status: GIAM KHAO xem duoc")
    void status_ChoPhepGiamKhao() throws Exception {
        mockMvc.perform(get("/api/ai/status").with(authentication(giamKhao())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("suggest: THI SINH bi chan - khong bien duoc thanh cong goi LLM mien phi")
    void suggest_ChanThiSinh() throws Exception {
        mockMvc.perform(post("/api/ai/rubric-feedback/suggest")
                        .with(authentication(thiSinh())).with(csrf())
                        .contentType("application/json").content(THAN_GOI_Y))
                .andExpect(status().isForbidden());
        verifyNoInteractions(aiAssistantService);
    }

    @Test
    @DisplayName("suggest: MENTOR duoc dung - mentor can cong cu nay de gop y cho doi")
    void suggest_ChoPhepMentor() throws Exception {
        when(aiAssistantService.suggestFeedback(any()))
                .thenReturn(AiFeedbackSuggestionResponseDto.builder().build());
        mockMvc.perform(post("/api/ai/rubric-feedback/suggest")
                        .with(authentication(mentor())).with(csrf())
                        .contentType("application/json").content(THAN_GOI_Y))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("analyze: de cho AiAssistantService quyet dinh theo tung bai nop")
    void analyze_DeChoTangServiceQuyetDinh() throws Exception {
        // Khong dan @PreAuthorize la CO Y: quyen phu thuoc bai nop cu the chu
        // khong phai vai tro chung chung. Test nay xac nhan principal that su
        // duoc truyen xuong service - neu ai do bo tham so
        // @AuthenticationPrincipal thi service khong con gi de kiem.
        when(aiAssistantService.analyzeSubmission(any(), any()))
                .thenReturn(AiSubmissionAnalysisDto.builder().build());
        mockMvc.perform(post("/api/ai/submissions/{id}/analyze", UUID.randomUUID())
                        .with(authentication(giamKhao())).with(csrf()))
                .andExpect(status().isOk());

        org.mockito.Mockito.verify(aiAssistantService)
                .analyzeSubmission(any(), org.mockito.ArgumentMatchers.notNull());
    }
}
