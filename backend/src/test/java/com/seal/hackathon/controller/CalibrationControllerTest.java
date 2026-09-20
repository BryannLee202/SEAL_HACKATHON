package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.CalibrationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiem thu PHAN QUYEN o tang controller cho mo-dun hieu chuan (UC-22).
 *
 * Vi sao can lop test nay rieng, du service da co 18 test:
 * test service goi thang vao phuong thuc Java nen @PreAuthorize KHONG he chay.
 * Mot endpoint quen dan @PreAuthorize van xanh het moi test service. Do dung la
 * cach lo hong /api/ai/submissions/{id}/analyze truoc day lot luoi, va cung la
 * cach /api/calibration-rounds/{id}/distribution lot tiep.
 *
 * distribution() tra ve pho diem cua TUNG giam khao kem ten - cung loai du lieu
 * nghien cuu RBL ma RblController khoa o muc lop cho COORDINATOR. Truoc khi va,
 * endpoint nay khong co guard nao, nen voi .anyRequest().authenticated() thi bat
 * ky ai dang nhap - ke ca thi sinh - deu doc duoc giam khao nao cham chat.
 */
@WebMvcTest(CalibrationController.class)
@Import(MethodSecurityTestConfig.class)
class CalibrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalibrationService calibrationService;

    @MockitoBean
    private JwtService jwtService;

    private Authentication nguoiDung(RoleName vaiTro) {
        AuthenticatedPrincipal principal = new AuthenticatedPrincipal(
                UUID.randomUUID(), "user@example.com", "Nguoi dung",
                List.of(new AuthenticatedPrincipal.RoleGrant(vaiTro, null, null, null)));
        List<GrantedAuthority> quyen = List.of(new SimpleGrantedAuthority("ROLE_" + vaiTro.name()));
        return new UsernamePasswordAuthenticationToken(principal, null, quyen);
    }

    // ------------------------------------------------------------------
    // GET /distribution - pho diem tung giam khao
    // ------------------------------------------------------------------

    @Test
    @DisplayName("distribution: THI SINH khong doc duoc pho diem giam khao")
    void distribution_ChanThiSinh() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(get("/api/calibration-rounds/{id}/distribution", id)
                        .with(authentication(nguoiDung(RoleName.TEAM_MEMBER))))
                .andExpect(status().isForbidden());

        // Chan phai xay ra TRUOC khi cham vao service - khong doc du lieu roi moi loc.
        verifyNoInteractions(calibrationService);
    }

    @Test
    @DisplayName("distribution: GIAM KHAO cung khong doc duoc pho diem cua dong nghiep")
    void distribution_ChanGiamKhao() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(get("/api/calibration-rounds/{id}/distribution", id)
                        .with(authentication(nguoiDung(RoleName.JUDGE))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(calibrationService);
    }

    @Test
    @DisplayName("distribution: MENTOR bi chan - truoc khi va thi mentor doc duoc 200")
    void distribution_ChanMentor() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(get("/api/calibration-rounds/{id}/distribution", id)
                        .with(authentication(nguoiDung(RoleName.MENTOR))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(calibrationService);
    }

    @Test
    @DisplayName("distribution: BAN TO CHUC doc duoc binh thuong")
    void distribution_ChoPhepBanToChuc() throws Exception {
        UUID id = UUID.randomUUID();
        when(calibrationService.distribution(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/calibration-rounds/{id}/distribution", id)
                        .with(authentication(nguoiDung(RoleName.COORDINATOR))))
                .andExpect(status().isOk());
    }

    // ------------------------------------------------------------------
    // PATCH /status - dong / mo lai phien
    // ------------------------------------------------------------------

    @Test
    @DisplayName("setStatus: GIAM KHAO khong tu dong hay mo lai phien duoc")
    void setStatus_ChanGiamKhao() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/api/calibration-rounds/{id}/status", id)
                        .with(authentication(nguoiDung(RoleName.JUDGE)))
                        .with(csrf())
                        .contentType("application/json")
                        .content("{\"active\":true}"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(calibrationService);
    }

    @Test
    @DisplayName("setStatus: BAN TO CHUC dong duoc phien")
    void setStatus_ChoPhepBanToChuc() throws Exception {
        UUID id = UUID.randomUUID();
        when(calibrationService.setActive(any(), anyBoolean())).thenReturn(null);

        mockMvc.perform(patch("/api/calibration-rounds/{id}/status", id)
                        .with(authentication(nguoiDung(RoleName.COORDINATOR)))
                        .with(csrf())
                        .contentType("application/json")
                        .content("{\"active\":false}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("setStatus: thieu truong active thi bao 400, khong phai 500")
    void setStatus_ThieuTruongActive() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/api/calibration-rounds/{id}/status", id)
                        .with(authentication(nguoiDung(RoleName.COORDINATOR)))
                        .with(csrf())
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------
    // PUT /scores - nop diem hieu chuan
    // ------------------------------------------------------------------

    @Test
    @DisplayName("submitScores: THI SINH khong nop duoc diem hieu chuan")
    void submitScores_ChanThiSinh() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .put("/api/calibration-rounds/{id}/scores", id)
                        .with(authentication(nguoiDung(RoleName.TEAM_MEMBER)))
                        .with(csrf())
                        .contentType("application/json")
                        .content("[{\"criterionId\":\"" + UUID.randomUUID() + "\",\"scoreValue\":9.0}]"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(calibrationService);
    }
}
