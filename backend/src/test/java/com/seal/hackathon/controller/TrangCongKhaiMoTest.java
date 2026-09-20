package com.seal.hackathon.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * Cac trang CONG KHAI phai giu nguyen trang thai mo cho khach chua dang nhap.
 *
 * Vi sao phai chay voi CA NGU CANH ung dung thay vi mot lat cat @WebMvcTest:
 * cac duong nay mo duoc la nho mot dong trong SecurityConfig
 *
 *     .requestMatchers("/api/public/**").permitAll()
 *
 * chu khong phai nho annotation tren controller. Lat cat @WebMvcTest khong nap
 * SecurityConfig that nen moi request deu bi doi dang nhap - kiem o do se cho
 * ket qua sai hoan toan.
 *
 * Cai de sai o nhom nay khong phai "quen chan" ma la nguoc lai: ai do "siet cho
 * chac" - doi mot dong matcher, hoac chen mot matcher rong hon len truoc - roi
 * vo mat cong binh chon va bang xep hang cong khai. Do la hai man hinh de trinh
 * bay nhat trong buoi bao ve, va cung la hai man hinh khong ai dang nhap de thu.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class TrangCongKhaiMoTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "khach xem duoc {0}")
    @ValueSource(strings = {
            "/api/public/rankings/events",
            "/api/public/voting/events",
    })
    @DisplayName("Khach CHUA dang nhap van xem duoc trang cong khai")
    void khachChuaDangNhap_XemDuocTrangCongKhai(String duong) throws Exception {
        mockMvc.perform(get(duong)).andExpect(r -> {
            int ma = r.getResponse().getStatus();
            if (ma == 401 || ma == 403) {
                throw new AssertionError(
                        "Duong cong khai " + duong + " da bi siet lai, khach khong vao duoc nua (HTTP " + ma + ")");
            }
        });
    }

    @ParameterizedTest(name = "duong rieng {0} van doi dang nhap")
    @ValueSource(strings = {
            "/api/events",
            "/api/mentor/teams",
            "/api/admin/audit-logs/recent",
    })
    @DisplayName("Duong KHONG cong khai van doi dang nhap - permitAll khong noi ra qua rong")
    void duongRieng_VanDoiDangNhap(String duong) throws Exception {
        mockMvc.perform(get(duong)).andExpect(r -> {
            int ma = r.getResponse().getStatus();
            if (ma != 401 && ma != 403) {
                throw new AssertionError(
                        "Duong " + duong + " dang mo cho khach chua dang nhap (HTTP " + ma + ")");
            }
        });
    }
}
