package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.dto.criteria.CriterionRequest;
import com.seal.hackathon.dto.criteria.CriterionResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.ScoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiem thu UC-11 "Quan ly tieu chi cham diem cua vong thi".
 *
 * Diem mau chot cua mo-dun nay: mot khi giam khao da bat dau cham, bo tieu
 * chi phai dong bang. Doi trong so giua chung ket khien diem cu va diem moi
 * duoc tinh theo hai thuoc do khac nhau - ket qua chung cuoc khong con bao ve
 * duoc truoc hoi dong.
 *
 * Test remove_ChanXoaTieuChiCuaVongKhac() chan mot lo hong that: remove() cu
 * chi tim tieu chi theo id roi xoa, khong he doi chieu voi roundId tren URL,
 * trong khi update() da doi chieu tu dau. Hau qua: goi
 * DELETE /api/rounds/{vongChuaChamDiem}/criteria/{tieuChiCuaVongDangCham}
 * thi assertNoScoresYet() kiem nham vong chua cham (luon qua) roi xoa tieu chi
 * cua vong dang cham do - keo theo toan bo diem da nhap cho tieu chi do.
 */
@ExtendWith(MockitoExtension.class)
class RoundCriterionServiceTest {

    @Mock
    private CriterionRepository criterionRepository;

    @Mock
    private ScoreRepository scoreRepository;

    @Mock
    private RoundService roundService;

    @Spy
    private CriterionWeightPolicy weightPolicy = new CriterionWeightPolicy();

    @InjectMocks
    private RoundCriterionService roundCriterionService;

    private UUID roundId;
    private Round round;

    @BeforeEach
    void setUp() {
        roundId = UUID.randomUUID();
        round = Round.builder().name("Vòng chung kết").build();
        round.setId(roundId);
    }

    private Criterion tieuChi(Round thuocVong, String ten, String trongSo) {
        Criterion c = Criterion.builder()
                .round(thuocVong)
                .name(ten)
                .weight(new BigDecimal(trongSo))
                .maxScore(new BigDecimal("10"))
                .build();
        c.setId(UUID.randomUUID());
        return c;
    }

    private CriterionRequest yeuCau(String ten, String trongSo) {
        return new CriterionRequest(ten, "mo ta", new BigDecimal(trongSo), new BigDecimal("10"));
    }

    // ------------------------------------------------------------------
    // Khoa bo tieu chi sau khi da co diem
    // ------------------------------------------------------------------

    @Test
    @DisplayName("add: Chan them tieu chi moi khi vong thi da co diem duoc ghi nhan")
    void add_ChanKhiDaCoDiem() {
        lenient().when(roundService.findOrThrow(roundId)).thenReturn(round);
        when(scoreRepository.existsByCriterion_Round_Id(roundId)).thenReturn(true);

        assertThatThrownBy(() -> roundCriterionService.add(roundId, yeuCau("Sáng tạo", "20")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("sau khi vòng thi đã có điểm");

        verify(criterionRepository, never()).save(any());
    }

    @Test
    @DisplayName("update: Chan sua trong so khi vong thi da co diem duoc ghi nhan")
    void update_ChanKhiDaCoDiem() {
        when(scoreRepository.existsByCriterion_Round_Id(roundId)).thenReturn(true);

        assertThatThrownBy(() -> roundCriterionService.update(roundId, UUID.randomUUID(), yeuCau("Sáng tạo", "20")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("sau khi vòng thi đã có điểm");

        verify(criterionRepository, never()).save(any());
    }

    @Test
    @DisplayName("remove: Chan xoa tieu chi khi vong thi da co diem duoc ghi nhan")
    void remove_ChanKhiDaCoDiem() {
        Criterion c = tieuChi(round, "Sáng tạo", "20");
        when(criterionRepository.findById(c.getId())).thenReturn(Optional.of(c));
        when(scoreRepository.existsByCriterion_Round_Id(roundId)).thenReturn(true);

        assertThatThrownBy(() -> roundCriterionService.remove(roundId, c.getId()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("sau khi vòng thi đã có điểm");

        verify(criterionRepository, never()).delete(any());
    }

    // ------------------------------------------------------------------
    // Doi chieu tieu chi voi vong thi tren URL
    // ------------------------------------------------------------------

    @Test
    @DisplayName("remove: KHONG cho xoa tieu chi thuoc vong thi khac qua URL cua vong nay")
    void remove_ChanXoaTieuChiCuaVongKhac() {
        Round vongKhac = Round.builder().name("Vòng sơ loại").build();
        vongKhac.setId(UUID.randomUUID());
        Criterion cuaVongKhac = tieuChi(vongKhac, "Tính khả thi", "30");

        when(criterionRepository.findById(cuaVongKhac.getId())).thenReturn(Optional.of(cuaVongKhac));

        assertThatThrownBy(() -> roundCriterionService.remove(roundId, cuaVongKhac.getId()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không thuộc vòng thi này");

        verify(criterionRepository, never()).delete(any());
        // Doi chieu phai xay ra TRUOC khi hoi ScoreRepository - neu hoi truoc thi
        // vong chua cham diem se tra ve false va cho xoa nham.
        verify(scoreRepository, never()).existsByCriterion_Round_Id(any());
    }

    @Test
    @DisplayName("update: KHONG cho sua tieu chi thuoc vong thi khac qua URL cua vong nay")
    void update_ChanSuaTieuChiCuaVongKhac() {
        Round vongKhac = Round.builder().name("Vòng sơ loại").build();
        vongKhac.setId(UUID.randomUUID());
        Criterion cuaVongKhac = tieuChi(vongKhac, "Tính khả thi", "30");

        when(scoreRepository.existsByCriterion_Round_Id(roundId)).thenReturn(false);
        when(criterionRepository.findById(cuaVongKhac.getId())).thenReturn(Optional.of(cuaVongKhac));

        assertThatThrownBy(() -> roundCriterionService.update(roundId, cuaVongKhac.getId(), yeuCau("Đổi tên", "30")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không thuộc vòng thi này");

        verify(criterionRepository, never()).save(any());
    }

    @Test
    @DisplayName("remove: Bao NotFound khi tieu chi khong ton tai")
    void remove_KhongTimThayTieuChi() {
        UUID khongTonTai = UUID.randomUUID();
        when(criterionRepository.findById(khongTonTai)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roundCriterionService.remove(roundId, khongTonTai))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy tiêu chí");
    }

    // ------------------------------------------------------------------
    // Tran trong so 100
    // ------------------------------------------------------------------

    @Test
    @DisplayName("add: Chan khi tong trong so vuot qua 100")
    void add_ChanKhiVuotTran100() {
        when(roundService.findOrThrow(roundId)).thenReturn(round);
        when(scoreRepository.existsByCriterion_Round_Id(roundId)).thenReturn(false);
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(
                tieuChi(round, "Sáng tạo", "40"),
                tieuChi(round, "Kỹ thuật", "40")));

        assertThatThrownBy(() -> roundCriterionService.add(roundId, yeuCau("Thuyết trình", "30")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("vuot qua 100");

        verify(criterionRepository, never()).save(any());
    }

    @Test
    @DisplayName("add: Cho phep khi tong trong so vua dung 100")
    void add_ChoPhepKhiVuaDu100() {
        when(roundService.findOrThrow(roundId)).thenReturn(round);
        when(scoreRepository.existsByCriterion_Round_Id(roundId)).thenReturn(false);
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(
                tieuChi(round, "Sáng tạo", "40"),
                tieuChi(round, "Kỹ thuật", "40")));
        when(criterionRepository.save(any(Criterion.class))).thenAnswer(inv -> {
            Criterion c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        CriterionResponse ketQua = roundCriterionService.add(roundId, yeuCau("Thuyết trình", "20"));

        assertThat(ketQua.name()).isEqualTo("Thuyết trình");
        assertThat(ketQua.weight()).isEqualByComparingTo("20");
        assertThat(ketQua.roundId()).isEqualTo(roundId);
    }

    @Test
    @DisplayName("update: Tinh tran 100 sau khi da tru trong so cu cua chinh tieu chi do")
    void update_TruTrongSoCuCuaChinhNo() {
        Criterion dangSua = tieuChi(round, "Sáng tạo", "40");
        when(scoreRepository.existsByCriterion_Round_Id(roundId)).thenReturn(false);
        when(criterionRepository.findById(dangSua.getId())).thenReturn(Optional.of(dangSua));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(
                dangSua, tieuChi(round, "Kỹ thuật", "40")));
        when(criterionRepository.save(any(Criterion.class))).thenAnswer(inv -> inv.getArgument(0));

        // 40 (cu) + 40 = 80. Nang chinh no len 60 thi tong la 100, van hop le.
        CriterionResponse ketQua = roundCriterionService.update(
                roundId, dangSua.getId(), yeuCau("Sáng tạo", "60"));

        assertThat(ketQua.weight()).isEqualByComparingTo("60");
    }
}
