package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.dto.rbl.VarianceStatResponse;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiem thu UC-24 "Bang do lech diem giua cac giam khao" (VarianceDashboardService).
 *
 * Ban to chuc dung do lech chuan o day de quyet dinh co goi giam khao ra
 * hieu chuan lai hay khong. Mot con so sai dan toi hai kieu thiet hai deu
 * that: bo qua mot giam khao cham lech that, hoac goi nham mot giam khao
 * cham dung ra "kiem diem".
 *
 * Vi vay test khong chi kiem "co tra ve so hay khong" ma doi chieu tung gia
 * tri voi ket qua tinh tay.
 */
@ExtendWith(MockitoExtension.class)
class VarianceDashboardServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private ScoreRepository scoreRepository;

    @Mock
    private CriterionRepository criterionRepository;

    @InjectMocks
    private VarianceDashboardService varianceDashboardService;

    private UUID roundId;
    private Criterion sangTao;

    @BeforeEach
    void setUp() {
        roundId = UUID.randomUUID();
        sangTao = Criterion.builder().name("Sáng tạo").weight(new BigDecimal("40")).build();
        sangTao.setId(UUID.randomUUID());
    }

    private Submission baiNop() {
        Submission s = Submission.builder().build();
        s.setId(UUID.randomUUID());
        return s;
    }

    private Score diem(Submission baiNop, Criterion tieuChi, String giaTri, boolean chot) {
        Score s = Score.builder()
                .submission(baiNop)
                .criterion(tieuChi)
                .scoreValue(new BigDecimal(giaTri))
                .finalized(chot)
                .build();
        s.setId(UUID.randomUUID());
        return s;
    }

    @Test
    @DisplayName("computeForRound: Tinh dung trung binh, do lech chuan mau, min va max")
    void computeForRound_DoiChieuVoiKetQuaTinhTay() {
        Submission bai = baiNop();
        // 5 giam khao cham cung mot tieu chi: 6, 7, 8, 9, 10
        //   trung binh = 8
        //   tong binh phuong do lech = 4+1+0+1+4 = 10
        //   phuong sai MAU (chia n-1 = 4) = 2.5  -> do lech chuan = 1.58
        //   neu cai nham thanh phuong sai TONG THE (chia n = 5) thi ra 1.41
        List<Score> diemSo = List.of(
                diem(bai, sangTao, "6", true),
                diem(bai, sangTao, "7", true),
                diem(bai, sangTao, "8", true),
                diem(bai, sangTao, "9", true),
                diem(bai, sangTao, "10", true));

        when(submissionRepository.findByRoundId(roundId)).thenReturn(List.of(bai));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(sangTao));
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(diemSo);

        List<VarianceStatResponse> ketQua = varianceDashboardService.computeForRound(roundId);

        assertThat(ketQua).hasSize(1);
        VarianceStatResponse stat = ketQua.get(0);
        assertThat(stat.criterionId()).isEqualTo(sangTao.getId());
        assertThat(stat.criterionName()).isEqualTo("Sáng tạo");
        assertThat(stat.sampleCount()).isEqualTo(5);
        assertThat(stat.mean()).isEqualByComparingTo("8.00");
        assertThat(stat.stdDev())
                .as("phuong sai mau chia n-1, khong phai chia n")
                .isEqualByComparingTo("1.58");
        assertThat(stat.min()).isEqualByComparingTo("6");
        assertThat(stat.max()).isEqualByComparingTo("10");
    }

    @Test
    @DisplayName("computeForRound: Bo qua diem nhap do dang, chi tinh tren diem da chot")
    void computeForRound_ChiTinhDiemDaChot() {
        Submission bai = baiNop();
        // Hai diem da chot (8 va 8) cho do lech 0. Diem nhap do dang 0 neu bi
        // tinh vao se day do lech vot len va bao dong gia mot giam khao lech.
        List<Score> diemSo = List.of(
                diem(bai, sangTao, "8", true),
                diem(bai, sangTao, "8", true),
                diem(bai, sangTao, "0", false));

        when(submissionRepository.findByRoundId(roundId)).thenReturn(List.of(bai));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(sangTao));
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(diemSo);

        VarianceStatResponse stat = varianceDashboardService.computeForRound(roundId).get(0);

        assertThat(stat.sampleCount()).isEqualTo(2);
        assertThat(stat.mean()).isEqualByComparingTo("8.00");
        assertThat(stat.stdDev()).isEqualByComparingTo("0.00");
        assertThat(stat.min()).isEqualByComparingTo("8");
    }

    @Test
    @DisplayName("computeForRound: Tieu chi chua ai cham thi tra ve 0 mau va cac o de trong")
    void computeForRound_TieuChiChuaCoDiem() {
        Criterion chuaCham = Criterion.builder().name("Thuyết trình").build();
        chuaCham.setId(UUID.randomUUID());

        when(submissionRepository.findByRoundId(roundId)).thenReturn(List.of(baiNop()));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(chuaCham));
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(List.of());

        VarianceStatResponse stat = varianceDashboardService.computeForRound(roundId).get(0);

        assertThat(stat.sampleCount()).isZero();
        assertThat(stat.mean()).isNull();
        assertThat(stat.stdDev()).isNull();
        assertThat(stat.min()).isNull();
        assertThat(stat.max()).isNull();
    }

    @Test
    @DisplayName("computeForRound: Chi mot giam khao cham thi do lech la 0, khong phai NaN")
    void computeForRound_MotMauThiDoLechBang0() {
        Submission bai = baiNop();
        when(submissionRepository.findByRoundId(roundId)).thenReturn(List.of(bai));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(sangTao));
        when(scoreRepository.findBySubmissionIdIn(anyList()))
                .thenReturn(List.of(diem(bai, sangTao, "7.5", true)));

        VarianceStatResponse stat = varianceDashboardService.computeForRound(roundId).get(0);

        // Phuong sai mau chia cho n-1 = 0. Neu khong chan truong hop nay thi
        // phep chia se no ArithmeticException hoac ra NaN.
        assertThat(stat.sampleCount()).isEqualTo(1);
        assertThat(stat.mean()).isEqualByComparingTo("7.50");
        assertThat(stat.stdDev()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("computeForRound: Khong tron diem cua tieu chi nay sang tieu chi kia")
    void computeForRound_TachRiengTungTieuChi() {
        Criterion kyThuat = Criterion.builder().name("Kỹ thuật").build();
        kyThuat.setId(UUID.randomUUID());
        Submission bai = baiNop();

        when(submissionRepository.findByRoundId(roundId)).thenReturn(List.of(bai));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(sangTao, kyThuat));
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(List.of(
                diem(bai, sangTao, "9", true),
                diem(bai, sangTao, "9", true),
                diem(bai, kyThuat, "3", true),
                diem(bai, kyThuat, "3", true)));

        List<VarianceStatResponse> ketQua = varianceDashboardService.computeForRound(roundId);

        assertThat(ketQua).hasSize(2);
        assertThat(ketQua.get(0).criterionName()).isEqualTo("Sáng tạo");
        assertThat(ketQua.get(0).mean()).isEqualByComparingTo("9.00");
        assertThat(ketQua.get(1).criterionName()).isEqualTo("Kỹ thuật");
        assertThat(ketQua.get(1).mean()).isEqualByComparingTo("3.00");
    }

    @Test
    @DisplayName("computeForRound: Chi MOT truy van diem du co bao nhieu bai nop (chan N+1)")
    void computeForRound_ChiMotTruyVanDiem() {
        List<Submission> nhieuBai = new ArrayList<>();
        List<Score> diemSo = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            Submission bai = baiNop();
            nhieuBai.add(bai);
            diemSo.add(diem(bai, sangTao, "8", true));
        }

        when(submissionRepository.findByRoundId(roundId)).thenReturn(nhieuBai);
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(sangTao));
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(diemSo);

        varianceDashboardService.computeForRound(roundId);

        // 30 bai nop van chi duoc phep mot vong di ve co so du lieu.
        verify(scoreRepository, times(1)).findBySubmissionIdIn(anyList());
        verify(scoreRepository, times(0)).findBySubmissionId(any());
    }
}
