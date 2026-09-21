package com.seal.hackathon.controller;

import com.seal.hackathon.dto.event.RoundResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.service.PublicVotingService;
import com.seal.hackathon.service.RankingService;
import com.seal.hackathon.service.RoundService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Luat quan trong nhat cua trang cong khai: KHONG LO DIEM TRUOC GIO CONG BO.
 *
 * Bang xep hang la thu duy nhat ca hoi truong cho doi. Lo ra som thi hong
 * toan bo phan cong bo ket qua - va khong lay lai duoc.
 *
 * Chay voi CA NGU CANH ung dung: duong /api/public/** mo duoc la nho mot dong
 * permitAll trong SecurityConfig, ma lat cat @WebMvcTest khong nap file do -
 * da thu va ca sau test deu tra 401 truoc khi cham toi controller.
 *
 * Duong nay khong co @PreAuthorize vi no CO Y mo cho khach chua dang nhap.
 * Luat bao ve nam trong than ham: doc round truoc, kiem resultsPublished, chua
 * cong bo thi khong dua diem ra. Kieu bao ve nay khong co annotation nao lam
 * dau hieu, nen rat de bi bo mat khi ai do don dep ma khong ai nhan ra.
 *
 * Hai endpoint cung mot dieu kien nhung hanh xu KHAC nhau, va ca hai deu dung:
 *   /rounds/{id}        -> tra DANH SACH RONG  (man hinh hien "chua co ket qua")
 *   /rounds/{id}/export -> nem 403             (tai file thi phai bao ro)
 * Test chot ca hai de khong ai "thong nhat lai cho gon" ma doi mat mot cai.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class CongKhaiKhongLoDiemTest {

    @Autowired private MockMvc mockMvc;

    // Thay ba bean nay bang ban gia de dat duoc trang thai "chua cong bo" ma
    // khong phai gieo du lieu. Phan con lai cua ung dung - ke ca SecurityConfig
    // that voi permitAll cho /api/public/** - van la ban that.
    @MockitoBean private RoundService roundService;
    @MockitoBean private RankingService rankingService;
    @MockitoBean private PublicVotingService publicVotingService;

    private RoundResponse vong(boolean daCongBo) {
        return new RoundResponse(
                UUID.randomUUID(), UUID.randomUUID(), "Chung kết", 1,
                Instant.parse("2026-09-20T17:00:00Z"), 3, daCongBo);
    }

    @Test
    @DisplayName("CHUA cong bo: khong dua diem ra, va khong he doc bang xep hang")
    void chuaCongBo_KhongDuaDiemRa() throws Exception {
        when(roundService.get(any())).thenReturn(vong(false));

        mockMvc.perform(get("/api/public/rankings/rounds/{id}", UUID.randomUUID()))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        // Khong chi "loc rong" - phai KHONG HE doc bang xep hang. Doc roi moi
        // loc thi diem da di qua tang service, chi con mot buoc nua la lo.
        verify(rankingService, never()).listByRound(any());
    }

    @Test
    @DisplayName("DA cong bo: dua bang xep hang ra binh thuong")
    void daCongBo_DuaRaBinhThuong() throws Exception {
        when(roundService.get(any())).thenReturn(vong(true));
        when(rankingService.listByRound(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/public/rankings/rounds/{id}", UUID.randomUUID()))
                .andExpect(status().isOk());

        verify(rankingService).listByRound(any());
    }

    @Test
    @DisplayName("Xuat CSV khi CHUA cong bo: bao 403 chu khong tai file rong")
    void xuatCsv_ChuaCongBoThiBao403() throws Exception {
        when(roundService.get(any())).thenReturn(vong(false));

        mockMvc.perform(get("/api/public/rankings/rounds/{id}/export", UUID.randomUUID()))
                .andExpect(status().isForbidden());

        // Tai file ma nhan duoc file rong thi nguoi dung tuong he thong hong.
        // O day bao ro la "chua cong bo" - khac voi duong xem tren man hinh.
        verify(rankingService, never()).exportCsvByRound(any());
    }

    @Test
    @DisplayName("Xuat CSV khi DA cong bo: tai duoc")
    void xuatCsv_DaCongBoThiTaiDuoc() throws Exception {
        when(roundService.get(any())).thenReturn(vong(true));
        when(rankingService.exportCsvByRound(any())).thenReturn("rank,team\n1,Alpha AI\n");

        mockMvc.perform(get("/api/public/rankings/rounds/{id}/export", UUID.randomUUID()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Binh chon: khan gia bo phieu khong can tai khoan")
    void binhChon_KhongCanTaiKhoan() throws Exception {
        when(publicVotingService.tallyByTrack(any())).thenReturn(List.of());

        // Khong gan authentication: cong binh chon danh cho khan gia.
        mockMvc.perform(get("/api/public/voting/tracks/{id}/tallies", UUID.randomUUID()))
                .andExpect(r -> {
                    int ma = r.getResponse().getStatus();
                    if (ma == 401 || ma == 403) {
                        throw new AssertionError("Khan gia khong xem duoc ket qua binh chon (HTTP " + ma + ")");
                    }
                });
    }

    @Test
    @DisplayName("Binh chon: ma hang muc khong hop le thi bao loi ro rang")
    void binhChon_MaHangMucSaiThiBaoRo() throws Exception {
        when(publicVotingService.tallyByTrack(any()))
                .thenThrow(ApiException.badRequest("Mã Hạng mục không được để trống"));

        mockMvc.perform(get("/api/public/voting/tracks/{id}/tallies", UUID.randomUUID()))
                .andExpect(status().isBadRequest());
    }
}
