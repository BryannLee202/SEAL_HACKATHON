package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.RblExportService;
import com.seal.hackathon.service.VarianceDashboardService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phan quyen cho mo-dun nghien cuu RBL (UC-24).
 *
 * Bang do lech diem va ban xuat CSV cho biet giam khao nao cham chat, cham
 * long. Lot ra ngoai la vua lo du lieu nghien cuu, vua anh huong uy tin cua
 * tung giam khao.
 *
 * RblController khoa o MUC LOP. Test nay chot lai dieu do: neu ai do go
 * @PreAuthorize khoi lop vi "them mot endpoint cong khai", ca bon test chan
 * se do cung luc.
 */
@WebMvcTest(RblController.class)
@Import(MethodSecurityTestConfig.class)
class RblControllerTest extends PhanQuyenTestBase {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private VarianceDashboardService varianceDashboardService;
    @MockitoBean private RblExportService rblExportService;
    @MockitoBean private JwtService jwtService;

    @Test
    @DisplayName("variance: THI SINH bi chan")
    void variance_ChanThiSinh() throws Exception {
        mockMvc.perform(get("/api/rounds/{id}/rbl/variance", UUID.randomUUID())
                        .with(authentication(thiSinh())))
                .andExpect(status().isForbidden());
        verifyNoInteractions(varianceDashboardService);
    }

    @Test
    @DisplayName("variance: GIAM KHAO bi chan - khong xem duoc do lech cua dong nghiep")
    void variance_ChanGiamKhao() throws Exception {
        mockMvc.perform(get("/api/rounds/{id}/rbl/variance", UUID.randomUUID())
                        .with(authentication(giamKhao())))
                .andExpect(status().isForbidden());
        verifyNoInteractions(varianceDashboardService);
    }

    @Test
    @DisplayName("variance: MENTOR bi chan")
    void variance_ChanMentor() throws Exception {
        mockMvc.perform(get("/api/rounds/{id}/rbl/variance", UUID.randomUUID())
                        .with(authentication(mentor())))
                .andExpect(status().isForbidden());
        verifyNoInteractions(varianceDashboardService);
    }

    @Test
    @DisplayName("exportCsv: GIAM KHAO khong tai duoc ban xuat du lieu nghien cuu")
    void exportCsv_ChanGiamKhao() throws Exception {
        mockMvc.perform(get("/api/rounds/{id}/rbl/export.csv", UUID.randomUUID())
                        .with(authentication(giamKhao())))
                .andExpect(status().isForbidden());
        verifyNoInteractions(rblExportService);
    }

    @Test
    @DisplayName("variance: BAN TO CHUC xem duoc")
    void variance_ChoPhepBanToChuc() throws Exception {
        when(varianceDashboardService.computeForRound(any())).thenReturn(List.of());
        mockMvc.perform(get("/api/rounds/{id}/rbl/variance", UUID.randomUUID())
                        .with(authentication(banToChuc())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("exportCsv: BAN TO CHUC tai duoc")
    void exportCsv_ChoPhepBanToChuc() throws Exception {
        when(rblExportService.exportAnonymizedCsv(any())).thenReturn("judge_alias,score_value\n");
        mockMvc.perform(get("/api/rounds/{id}/rbl/export.csv", UUID.randomUUID())
                        .with(authentication(banToChuc())))
                .andExpect(status().isOk());
    }
}
