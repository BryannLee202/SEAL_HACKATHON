package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Ranking;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.RankingRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiểm xuất bảng xếp hạng ra Excel (UC-27).
 *
 * Điểm quan trọng nhất: phải CHẶN QUYỀN TRƯỚC khi đọc dữ liệu. Xuất ra file
 * Excel rồi mới kiểm quyền thì dữ liệu đã nằm trong bộ nhớ, và một lỗi nhỏ ở
 * tầng trên là nó ra ngoài.
 */
@ExtendWith(MockitoExtension.class)
class ReportExportServiceTest {

    @Mock private RankingRepository rankingRepository;
    @Mock private RoundService roundService;

    @InjectMocks private ReportExportService reportExportService;

    private UUID roundId;
    private AuthenticatedPrincipal principal;

    @BeforeEach
    void setUp() {
        roundId = UUID.randomUUID();
        principal = new AuthenticatedPrincipal(UUID.randomUUID(), "a@b.com", "Nguoi dung", List.of());
    }

    private Ranking ranking(String teamName, String trackName, int overall, int inTrack,
                            String score, boolean promoted) {
        Track track = trackName == null ? null : Track.builder().name(trackName).build();
        if (track != null) track.setId(UUID.randomUUID());

        Team team = Team.builder().name(teamName).track(track).build();
        team.setId(UUID.randomUUID());

        Ranking r = Ranking.builder()
                .team(team)
                .rankOverall(overall)
                .rankInTrack(inTrack)
                .totalWeightedScore(new BigDecimal(score))
                .promoted(promoted)
                .build();
        r.setId(UUID.randomUUID());
        return r;
    }

    /** Đọc lại file Excel vừa sinh để kiểm nội dung thật, không chỉ kiểm độ dài mảng byte. */
    private Sheet docSheet(byte[] bytes) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            // Giữ lại dữ liệu trước khi workbook đóng.
            Sheet s = wb.getSheetAt(0);
            assertThat(s.getSheetName()).isEqualTo("Ranking");
            return s;
        }
    }

    @Test
    @DisplayName("Chan quyen TRUOC khi doc du lieu xep hang")
    void exportRankingExcel_ChanQuyenTruocKhiDocDuLieu() {
        doThrow(ApiException.forbidden("Bạn không có quyền xem bảng xếp hạng vòng này"))
                .when(roundService).findOrThrowVisibleForRankings(roundId, principal);

        assertThatThrownBy(() -> reportExportService.exportRankingExcel(roundId, principal))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không có quyền");

        // Quan trong: khong duoc doc du lieu khi da bi chan quyen.
        verify(rankingRepository, never()).findByRoundIdOrderByRankOverallAsc(any());
    }

    @Test
    @DisplayName("Xuat dung so dong va dung noi dung tung o")
    void exportRankingExcel_DungNoiDung() throws Exception {
        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId)).thenReturn(List.of(
                ranking("Alpha AI", "AI / Machine Learning", 1, 1, "87.5", true),
                ranking("Cloud Scale", "Web / Cloud", 2, 1, "81.25", false)));

        byte[] bytes = reportExportService.exportRankingExcel(roundId, principal);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = wb.getSheetAt(0);

            Row header = sheet.getRow(0);
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("Hạng tổng");
            assertThat(header.getCell(2).getStringCellValue()).isEqualTo("Đội thi");
            assertThat(header.getCell(5).getStringCellValue()).isEqualTo("Thăng vòng");

            Row r1 = sheet.getRow(1);
            assertThat(r1.getCell(0).getNumericCellValue()).isEqualTo(1);
            assertThat(r1.getCell(2).getStringCellValue()).isEqualTo("Alpha AI");
            assertThat(r1.getCell(3).getStringCellValue()).isEqualTo("AI / Machine Learning");
            assertThat(r1.getCell(4).getNumericCellValue()).isEqualTo(87.5);
            assertThat(r1.getCell(5).getStringCellValue()).isEqualTo("Có");

            Row r2 = sheet.getRow(2);
            assertThat(r2.getCell(2).getStringCellValue()).isEqualTo("Cloud Scale");
            assertThat(r2.getCell(5).getStringCellValue()).isEqualTo("Không");

            // Hai doi thi -> dong tieu de + 2 dong du lieu.
            assertThat(sheet.getLastRowNum()).isEqualTo(2);
        }
    }

    @Test
    @DisplayName("Doi chua co hang muc thi o Hang muc de trong, khong vang loi")
    void exportRankingExcel_DoiChuaCoHangMuc() throws Exception {
        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId))
                .thenReturn(List.of(ranking("Doi chua dang ky", null, 1, 0, "50", false)));

        byte[] bytes = reportExportService.exportRankingExcel(roundId, principal);

        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertThat(wb.getSheetAt(0).getRow(1).getCell(3).getStringCellValue()).isEmpty();
        }
    }

    @Test
    @DisplayName("Vong chua co xep hang thi van ra file Excel co dong tieu de")
    void exportRankingExcel_ChuaCoXepHang() throws Exception {
        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId)).thenReturn(List.of());

        byte[] bytes = reportExportService.exportRankingExcel(roundId, principal);

        assertThat(bytes).isNotEmpty();
        try (XSSFWorkbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = wb.getSheetAt(0);
            assertThat(sheet.getRow(0).getCell(0).getStringCellValue()).isEqualTo("Hạng tổng");
            assertThat(sheet.getLastRowNum()).isZero();
        }
    }
}
