package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.PrizeService;
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
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Loi do phia GOI sai phai tra ve 400, khong phai 500.
 *
 * Ba truong hop duoi day truoc kia roi het vao bo bat Exception.class o cuoi
 * GlobalExceptionHandler va tra ve 500 "Da xay ra loi, vui long thu lai sau":
 *   - thieu tham so truy van bat buoc
 *   - UUID tren duong dan sai dinh dang
 *   - than yeu cau khong phai JSON hop le
 *
 * Ca ba deu la loi cua phia goi. Go nham mot ky tu trong UUID tren thanh dia
 * chi cung ra man hinh loi may chu, va nguoi dung khong co cach nao biet minh
 * sai o dau. Giua buoi bao ve thi 500 trong nhu he thong hong.
 *
 * Phat hien duoc trong luc viet test phan quyen: endpoint auto-assign tra ve
 * 500 thay vi 403 khi thieu finalRoundId, va lan ra thi thay nguyen nhan nam
 * o cho khac han.
 */
@WebMvcTest(PrizeController.class)
@Import(MethodSecurityTestConfig.class)
class LoiDauVaoTest extends PhanQuyenTestBase {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private PrizeService prizeService;
    @MockitoBean private JwtService jwtService;

    private static final String ID = "11111111-1111-1111-1111-111111111111";

    @Test
    @DisplayName("Thieu tham so truy van bat buoc -> 400 kem ten tham so, khong phai 500")
    void thieuThamSo_TraVe400() throws Exception {
        // auto-assign doi @RequestParam UUID finalRoundId.
        mockMvc.perform(post("/api/events/{id}/prizes/auto-assign", ID)
                        .with(authentication(banToChuc())).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("finalRoundId")));
    }

    @Test
    @DisplayName("UUID tren duong dan sai dinh dang -> 400 kem ten tham so")
    void uuidSaiDinhDang_TraVe400() throws Exception {
        mockMvc.perform(get("/api/events/{id}/prizes", "khong-phai-uuid")
                        .with(authentication(banToChuc())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("eventId")));
    }

    @Test
    @DisplayName("Than yeu cau khong phai JSON hop le -> 400, khong phai 500")
    void jsonHong_TraVe400() throws Exception {
        mockMvc.perform(post("/api/events/{id}/prizes", ID)
                        .with(authentication(banToChuc())).with(csrf())
                        .contentType("application/json")
                        .content("{ day khong phai json }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("JSON")));
    }

    @Test
    @DisplayName("Yeu cau dung dinh dang thi van chay binh thuong")
    void yeuCauDung_VanChay() throws Exception {
        when(prizeService.listByEvent(any())).thenReturn(List.of());
        mockMvc.perform(get("/api/events/{id}/prizes", UUID.randomUUID())
                        .with(authentication(banToChuc())))
                .andExpect(status().isOk());
    }
}
