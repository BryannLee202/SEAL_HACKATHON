package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.ScoreService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Phan quyen tang controller cho viec cham diem (UC-15). */
@WebMvcTest(ScoreController.class)
@Import(MethodSecurityTestConfig.class)
class ScoreControllerTest extends PhanQuyenTestBase {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private ScoreService scoreService;
    @MockitoBean private JwtService jwtService;

    private static final String THAN_DIEM =
            "{\"items\":[{\"criterionId\":\"11111111-1111-1111-1111-111111111111\","
            + "\"scoreValue\":8.0,\"comment\":\"ok\"}],\"finalized\":false}";

    @Test
    @DisplayName("submit: THI SINH khong tu cham diem cho bai cua minh duoc")
    void submit_ChanThiSinh() throws Exception {
        mockMvc.perform(put("/api/submissions/{id}/scores", UUID.randomUUID())
                        .with(authentication(thiSinh())).with(csrf())
                        .contentType("application/json").content(THAN_DIEM))
                .andExpect(status().isForbidden());
        verifyNoInteractions(scoreService);
    }

    @Test
    @DisplayName("submit: MENTOR khong cham diem duoc - mentor huong dan, khong phai giam khao")
    void submit_ChanMentor() throws Exception {
        mockMvc.perform(put("/api/submissions/{id}/scores", UUID.randomUUID())
                        .with(authentication(mentor())).with(csrf())
                        .contentType("application/json").content(THAN_DIEM))
                .andExpect(status().isForbidden());
        verifyNoInteractions(scoreService);
    }

    @Test
    @DisplayName("submit: BAN TO CHUC cung khong cham thay giam khao duoc")
    void submit_ChanBanToChuc() throws Exception {
        mockMvc.perform(put("/api/submissions/{id}/scores", UUID.randomUUID())
                        .with(authentication(banToChuc())).with(csrf())
                        .contentType("application/json").content(THAN_DIEM))
                .andExpect(status().isForbidden());
        verifyNoInteractions(scoreService);
    }

    @Test
    @DisplayName("submit: GIAM KHAO thi cham duoc")
    void submit_ChoPhepGiamKhao() throws Exception {
        when(scoreService.submitScores(any(), any(), any())).thenReturn(List.of());
        mockMvc.perform(put("/api/submissions/{id}/scores", UUID.randomUUID())
                        .with(authentication(giamKhao())).with(csrf())
                        .contentType("application/json").content(THAN_DIEM))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("list: doc diem khong chan o controller - ScoreService.assertCanView quyet dinh")
    void list_DeChoTangServiceQuyetDinh() throws Exception {
        // Co y KHONG dan @PreAuthorize: quyen xem diem phu thuoc bai nop cu the
        // (doi cua minh, vong minh cham...), khong phai vai tro chung chung.
        // Luat that nam o ScoreService.assertCanView va da co test rieng.
        when(scoreService.listBySubmission(any(), any())).thenReturn(List.of());
        mockMvc.perform(get("/api/submissions/{id}/scores", UUID.randomUUID())
                        .with(authentication(thiSinh())))
                .andExpect(status().isOk());
    }
}
