package com.seal.hackathon.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiem thu cong dang nhap voi TAI KHOAN THAT cua bo du lieu demo.
 *
 * Chay voi ca ngu canh ung dung chu khong phai lat cat @WebMvcTest: duong
 * /api/auth/** mo duoc la nho .requestMatchers("/api/auth/**").permitAll()
 * trong SecurityConfig. Lat cat khong nap file do nen moi request deu bi doi
 * dang nhap - da thu va tat ca deu tra 401, ke ca /api/auth/login.
 *
 * Diem dang giu nhat o day KHONG phai "dang nhap dung thi vao duoc" - ma la
 * thong bao khi dang nhap SAI phai giong HET nhau cho hai truong hop:
 *
 *   - email khong ton tai trong he thong
 *   - email co that nhung sai mat khau
 *
 * Neu hai truong hop tra ve hai thong bao khac nhau thi bat ky ai cung do duoc
 * danh sach email da dang ky, chi bang cach thu tung dia chi va doc thong bao.
 * AuthService dong 96 va 99 co tinh nem cung mot cau; rat de bi "cai thien"
 * thanh "Email khong ton tai" cho than thien hon, nen can test chot lai.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class DangNhapTest {

    @Autowired
    private MockMvc mockMvc;

    private String dangNhap(String email, String matKhau) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + matKhau + "\"}"))
                .andReturn().getResponse().getContentAsString();
    }

    @Test
    @DisplayName("Email khong ton tai va sai mat khau tra ve CUNG mot thong bao")
    void haiTruongHopSai_ChungMotThongBao() throws Exception {
        // coordinator@demo.local la tai khoan CO THAT trong bo du lieu demo.
        String saiMatKhau = dangNhap("coordinator@demo.local", "SaiMatKhau@999");
        // Dia chi nay khong ton tai.
        String khongTonTai = dangNhap("khong-ai-dung-dia-chi-nay@demo.local", "SaiMatKhau@999");

        assertThat(saiMatKhau)
                .as("hai truong hop phai khong phan biet duoc tu ben ngoai")
                .contains("Email hoặc mật khẩu không đúng");
        assertThat(khongTonTai).contains("Email hoặc mật khẩu không đúng");
    }

    @Test
    @DisplayName("Dang nhap dung thi nhan duoc token")
    void dangNhapDung_NhanDuocToken() throws Exception {
        String ketQua = dangNhap("coordinator@demo.local", "Demo@123456");
        assertThat(ketQua).contains("accessToken");
    }

    @Test
    @DisplayName("Dang nhap sai thi KHONG tra ve token nao")
    void dangNhapSai_KhongCoToken() throws Exception {
        String ketQua = dangNhap("coordinator@demo.local", "SaiMatKhau@999");
        assertThat(ketQua).doesNotContain("accessToken");
    }

    @Test
    @DisplayName("/me: chua dang nhap thi tra 401, KHONG phai 200 voi than rong")
    void me_ChanKhiChuaDangNhap() throws Exception {
        // SecurityConfig cho /api/auth/** di qua permitAll (de con dang nhap
        // duoc), nen khach vang lai van vao toi day va principal la null.
        // Truoc khi va, ham nay tra ok(null) -> 200 voi than 0 byte, va axios
        // bien no thanh CHUOI RONG. AuthContext dat user = "" thay vi null,
        // nen phep kiem userRef.current !== null thanh true voi nguoi CHUA
        // TUNG dang nhap - dung thu ma ghi chu o AuthContext.tsx dong 51 noi
        // la muon tranh.
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("/me: da dang nhap thi tra ve dung phien cua minh")
    void me_TraVePhienCuaMinh() throws Exception {
        String dn = dangNhap("coordinator@demo.local", "Demo@123456");
        String token = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                .readTree(dn).get("accessToken").asText();

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .jsonPath("$.email").value("coordinator@demo.local"));
    }

    @Test
    @DisplayName("Dang ky thieu truong bat buoc thi bao 400, khong phai 500")
    void dangKy_ThieuTruongThiBao400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Than yeu cau khong phai JSON thi bao 400, khong phai 500")
    void thanHong_ThiBao400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json").content("{ day khong phai json }"))
                .andExpect(status().isBadRequest());
    }
}
