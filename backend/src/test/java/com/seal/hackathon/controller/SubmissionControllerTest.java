package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.SubmissionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.notNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phan quyen cho bai nop (UC-13, UC-14).
 *
 * Bai nop chua duong dan ma nguon, ban chay thu va tai lieu cua tung doi -
 * chinh la phan cac doi giau nhau cho den luc cong bo.
 *
 * Cac endpoint o day CO Y khong dan @PreAuthorize: quyen xem phu thuoc tung
 * bai nop cu the (doi cua minh, vong minh cham, hang muc minh phu trach) chu
 * khong phai vai tro chung chung. Luat that nam o SubmissionService.assertCanView
 * va assertCanViewRound.
 *
 * Nen test o day chot mot dieu khac, nhung khong kem quan trong: principal
 * PHAI duoc truyen xuong service. Neu ai do lo tay bo tham so
 * @AuthenticationPrincipal thi service nhan null va moi phep kiem quyen ben
 * duoi mat cho dua - ma khong test service nao phat hien ra.
 */
@WebMvcTest(SubmissionController.class)
@Import(MethodSecurityTestConfig.class)
class SubmissionControllerTest extends PhanQuyenTestBase {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private SubmissionService submissionService;
    @MockitoBean private JwtService jwtService;

    @Test
    @DisplayName("get: truyen principal xuong service de no con kiem quyen duoc")
    void get_TruyenPrincipalXuongService() throws Exception {
        when(submissionService.get(any(), any())).thenReturn(null);

        mockMvc.perform(get("/api/submissions/{id}", UUID.randomUUID())
                        .with(authentication(thiSinh())))
                .andExpect(status().isOk());

        verify(submissionService).get(any(), notNull());
    }

    @Test
    @DisplayName("listByRound: truyen principal xuong service")
    void listByRound_TruyenPrincipalXuongService() throws Exception {
        when(submissionService.listByRound(any(), any(), any())).thenReturn(Page.empty());

        mockMvc.perform(get("/api/rounds/{id}/submissions", UUID.randomUUID())
                        .with(authentication(giamKhao())))
                .andExpect(status().isOk());

        verify(submissionService).listByRound(any(), notNull(), any());
    }

    @Test
    @DisplayName("getStatus: truyen principal xuong service")
    void getStatus_TruyenPrincipalXuongService() throws Exception {
        when(submissionService.getStatus(any(), any(), any())).thenReturn(null);

        mockMvc.perform(get("/api/teams/{teamId}/rounds/{roundId}/submission/status",
                        UUID.randomUUID(), UUID.randomUUID())
                        .with(authentication(thiSinh())))
                .andExpect(status().isOk());

        verify(submissionService).getStatus(any(), any(), notNull());
    }

    @Test
    @DisplayName("get: chua dang nhap thi bi chan truoc khi toi controller")
    void get_ChanKhiChuaDangNhap() throws Exception {
        // Khong gan authentication: SecurityConfig dat .anyRequest().authenticated()
        // nen request bi chan tu vong ngoai. Trong lat cat @WebMvcTest khong co
        // SecurityConfig that, nhung Spring Security mac dinh cung tu choi.
        mockMvc.perform(get("/api/submissions/{id}", UUID.randomUUID()))
                .andExpect(status().is4xxClientError());
    }
}
