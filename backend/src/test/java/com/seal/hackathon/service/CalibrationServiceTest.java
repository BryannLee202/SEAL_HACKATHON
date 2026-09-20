package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.CalibrationRound;
import com.seal.hackathon.domain.entity.CalibrationScore;
import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.dto.rbl.CalibrationRoundRequest;
import com.seal.hackathon.dto.rbl.CalibrationRoundResponse;
import com.seal.hackathon.dto.rbl.CalibrationScoreItemRequest;
import com.seal.hackathon.dto.rbl.CalibrationScoreResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CalibrationRoundRepository;
import com.seal.hackathon.repository.CalibrationScoreRepository;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiểm mô-đun hiệu chuẩn giám khảo (UC-22) — phần phục vụ câu hỏi nghiên cứu
 * của đề tài về độ tin cậy liên đánh giá viên.
 *
 * Hai điều quan trọng nhất:
 *   1. Chỉ sự kiện đã BẬT mô-đun RBL mới tạo được vòng hiệu chuẩn
 *   2. Điểm hiệu chuẩn phải lưu RIÊNG từng giám khảo × từng tiêu chí, không
 *      gộp — gộp là mất dữ liệu nghiên cứu, không khôi phục được
 */
@ExtendWith(MockitoExtension.class)
class CalibrationServiceTest {

    @Mock private CalibrationRoundRepository calibrationRoundRepository;
    @Mock private CalibrationScoreRepository calibrationScoreRepository;
    @Mock private SubmissionRepository submissionRepository;
    @Mock private CriterionRepository criterionRepository;
    @Mock private UserRepository userRepository;
    @Mock private EventService eventService;

    @InjectMocks private CalibrationService calibrationService;

    private UUID eventId;
    private UUID sampleId;
    private UUID roundId;
    private UUID judgeId;
    private HackathonEvent event;
    private Submission sample;
    private CalibrationRound round;
    private User judge;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        sampleId = UUID.randomUUID();
        roundId = UUID.randomUUID();
        judgeId = UUID.randomUUID();

        event = HackathonEvent.builder().name("SEAL Hackathon 2026").rblEnabled(true).build();
        event.setId(eventId);

        sample = new Submission();
        sample.setId(sampleId);

        round = CalibrationRound.builder()
                .event(event).sampleSubmission(sample).name("Hieu chuan vong loai").active(true).build();
        round.setId(roundId);

        judge = User.builder().fullName("Judge One").email("judge1@demo.local").build();
        judge.setId(judgeId);
    }

    private Criterion criterion(String name) {
        Criterion c = Criterion.builder().name(name).maxScore(new BigDecimal("10")).build();
        c.setId(UUID.randomUUID());
        return c;
    }

    // ---------------------------------------------------------------
    // Tạo vòng hiệu chuẩn
    // ---------------------------------------------------------------

    @Test
    @DisplayName("create: su kien chua bat RBL thi khong tao duoc vong hieu chuan")
    void create_ChanKhiChuaBatRbl() {
        event.setRblEnabled(false);
        when(eventService.findOrThrow(eventId)).thenReturn(event);

        assertThatThrownBy(() -> calibrationService.create(
                eventId, new CalibrationRoundRequest("Hieu chuan", sampleId)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("chưa bật mô-đun nghiên cứu RBL");

        verify(calibrationRoundRepository, never()).save(any());
    }

    @Test
    @DisplayName("create: bao loi khi bai nop mau khong ton tai")
    void create_ChanKhiBaiNopMauKhongTonTai() {
        when(eventService.findOrThrow(eventId)).thenReturn(event);
        when(submissionRepository.findById(sampleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calibrationService.create(
                eventId, new CalibrationRoundRequest("Hieu chuan", sampleId)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy bài nộp mẫu");
    }

    @Test
    @DisplayName("create: vong hieu chuan moi tao luon o trang thai dang mo")
    void create_MacDinhDangMo() {
        when(eventService.findOrThrow(eventId)).thenReturn(event);
        when(submissionRepository.findById(sampleId)).thenReturn(Optional.of(sample));
        when(calibrationRoundRepository.save(any())).thenAnswer(inv -> {
            CalibrationRound r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        CalibrationRoundResponse res = calibrationService.create(
                eventId, new CalibrationRoundRequest("Hieu chuan vong loai", sampleId));

        assertThat(res.active()).isTrue();
        assertThat(res.name()).isEqualTo("Hieu chuan vong loai");
    }

    // ---------------------------------------------------------------
    // Nộp điểm hiệu chuẩn — phần dữ liệu nghiên cứu
    // ---------------------------------------------------------------

    @Test
    @DisplayName("submitScores: luu RIENG tung tieu chi, khong gop lai")
    void submitScores_LuuRiengTungTieuChi() {
        Criterion c1 = criterion("Tinh sang tao");
        Criterion c2 = criterion("Kha thi ky thuat");
        Criterion c3 = criterion("Thuyet trinh");

        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(c1.getId())).thenReturn(Optional.of(c1));
        when(criterionRepository.findById(c2.getId())).thenReturn(Optional.of(c2));
        when(criterionRepository.findById(c3.getId())).thenReturn(Optional.of(c3));
        when(calibrationScoreRepository.save(any())).thenAnswer(inv -> {
            CalibrationScore sc = inv.getArgument(0);
            sc.setId(UUID.randomUUID());
            return sc;
        });

        List<CalibrationScoreResponse> res = calibrationService.submitScores(roundId, List.of(
                new CalibrationScoreItemRequest(c1.getId(), new BigDecimal("8.0")),
                new CalibrationScoreItemRequest(c2.getId(), new BigDecimal("7.5")),
                new CalibrationScoreItemRequest(c3.getId(), new BigDecimal("9.0"))), judgeId);

        // Ba tieu chi phai thanh BA ban ghi rieng, khong phai mot ban ghi tong.
        assertThat(res).hasSize(3);
        verify(calibrationScoreRepository, times(3)).save(any());
        assertThat(res).extracting(CalibrationScoreResponse::scoreValue)
                .containsExactly(new BigDecimal("8.0"), new BigDecimal("7.5"), new BigDecimal("9.0"));
    }

    @Test
    @DisplayName("submitScores: bao loi khi vong hieu chuan khong ton tai")
    void submitScores_ChanVongKhongTonTai() {
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calibrationService.submitScores(roundId, List.of(), judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy vòng hiệu chuẩn");
    }

    @Test
    @DisplayName("submitScores: bao loi khi tieu chi khong ton tai")
    void submitScores_ChanTieuChiKhongTonTai() {
        UUID criterionLa = UUID.randomUUID();
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(criterionLa)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calibrationService.submitScores(roundId,
                List.of(new CalibrationScoreItemRequest(criterionLa, new BigDecimal("5"))), judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy tiêu chí");
    }

    // ---------------------------------------------------------------
    // Phân phối điểm — dữ liệu để so độ lệch giữa các giám khảo
    // ---------------------------------------------------------------

    @Test
    @DisplayName("distribution: tra ve diem cua MOI giam khao de so do lech")
    void distribution_TraVeDiemMoiGiamKhao() {
        User judge2 = User.builder().fullName("Judge Two").email("judge2@demo.local").build();
        judge2.setId(UUID.randomUUID());
        Criterion c = criterion("Tinh sang tao");

        CalibrationScore s1 = CalibrationScore.builder()
                .calibrationRound(round).judge(judge).criterion(c).scoreValue(new BigDecimal("9.0")).build();
        s1.setId(UUID.randomUUID());
        CalibrationScore s2 = CalibrationScore.builder()
                .calibrationRound(round).judge(judge2).criterion(c).scoreValue(new BigDecimal("5.0")).build();
        s2.setId(UUID.randomUUID());

        when(calibrationScoreRepository.findByCalibrationRoundId(roundId)).thenReturn(List.of(s1, s2));

        List<CalibrationScoreResponse> res = calibrationService.distribution(roundId);

        // Hai giam khao cham cung mot bai mau lech nhau 4 diem — day chinh la
        // du lieu ma vong hieu chuan sinh ra de Ban to chuc nhin thay.
        assertThat(res).hasSize(2);
        assertThat(res).extracting(CalibrationScoreResponse::scoreValue)
                .containsExactlyInAnyOrder(new BigDecimal("9.0"), new BigDecimal("5.0"));
    }

    @Test
    @DisplayName("listByEvent: liet ke duoc cac vong hieu chuan cua su kien")
    void listByEvent_LietKeDuoc() {
        when(calibrationRoundRepository.findByEventId(eventId)).thenReturn(List.of(round));

        assertThat(calibrationService.listByEvent(eventId)).hasSize(1);
    }

    // ---------------------------------------------------------------
    // Đóng và mở lại phiên hiệu chuẩn
    //
    // Cờ active trước đây là cờ chết: đặt true lúc tạo rồi không nơi nào đổi
    // được. Nhóm test này giữ lại hai điều sau khi vá: đóng được thật, và
    // phiên đã đóng thì không nhận thêm điểm.
    // ---------------------------------------------------------------

    @Test
    @DisplayName("setActive: ban to chuc dong duoc phien hieu chuan da du so lieu")
    void setActive_DongDuocPhien() {
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(calibrationRoundRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CalibrationRoundResponse res = calibrationService.setActive(roundId, false);

        assertThat(res.active()).isFalse();
        assertThat(round.isActive()).isFalse();
    }

    @Test
    @DisplayName("setActive: mo lai duoc phien lo tay dong nham, khong roi vao ngo cut")
    void setActive_MoLaiDuocPhienDongNham() {
        round.setActive(false);
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(calibrationRoundRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CalibrationRoundResponse res = calibrationService.setActive(roundId, true);

        assertThat(res.active()).isTrue();
    }

    @Test
    @DisplayName("setActive: bao loi khi phien hieu chuan khong ton tai")
    void setActive_ChanPhienKhongTonTai() {
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calibrationService.setActive(roundId, false))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy vòng hiệu chuẩn");

        verify(calibrationRoundRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitScores: phien da dong thi KHONG nhan them diem")
    void submitScores_ChanKhiPhienDaDong() {
        round.setActive(false);
        Criterion c = criterion("Tinh sang tao");
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));

        assertThatThrownBy(() -> calibrationService.submitScores(roundId,
                List.of(new CalibrationScoreItemRequest(c.getId(), new BigDecimal("8.0"))), judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("đã đóng, không nhận thêm điểm");

        // Khong duoc luu gi ca. Neu lot mot ban ghi vao sau khi so lieu da chot
        // thi phan phoi dung de so do dong thuan bi lech, va khong co cach nao
        // biet ban ghi nao la thua.
        verify(calibrationScoreRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitScores: thong bao tu choi neu ro ten phien da dong")
    void submitScores_ThongBaoNeuRoTenPhien() {
        round.setActive(false);
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));

        assertThatThrownBy(() -> calibrationService.submitScores(roundId,
                List.of(new CalibrationScoreItemRequest(UUID.randomUUID(), new BigDecimal("8.0"))), judgeId))
                .hasMessageContaining("Hieu chuan vong loai");
    }

    @Test
    @DisplayName("submitScores: phien dang mo thi van nop diem binh thuong")
    void submitScores_PhienDangMoVanNopDuoc() {
        Criterion c = criterion("Tinh sang tao");
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(c.getId())).thenReturn(Optional.of(c));
        when(calibrationScoreRepository.save(any())).thenAnswer(inv -> {
            CalibrationScore sc = inv.getArgument(0);
            sc.setId(UUID.randomUUID());
            return sc;
        });

        List<CalibrationScoreResponse> res = calibrationService.submitScores(roundId,
                List.of(new CalibrationScoreItemRequest(c.getId(), new BigDecimal("8.0"))), judgeId);

        assertThat(res).hasSize(1);
    }

    // ---------------------------------------------------------------
    // Nộp lại điểm — sửa điểm chấm nhầm
    //
    // calibration_score có UNIQUE (round, judge, criterion). Trước đây mỗi
    // lần nộp đều dựng bản ghi mới, nên nộp lại là vỡ ràng buộc và giám khảo
    // không có cách nào sửa điểm chấm nhầm.
    // ---------------------------------------------------------------

    @Test
    @DisplayName("submitScores: nop lai cung tieu chi thi CAP NHAT diem cu, khong chen ban ghi moi")
    void submitScores_NopLaiThiCapNhat() {
        Criterion c = criterion("Tinh sang tao");
        CalibrationScore diemCu = CalibrationScore.builder()
                .calibrationRound(round).judge(judge).criterion(c).scoreValue(new BigDecimal("8.0")).build();
        diemCu.setId(UUID.randomUUID());

        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(c.getId())).thenReturn(Optional.of(c));
        when(calibrationScoreRepository.findByCalibrationRoundIdAndJudgeId(roundId, judgeId))
                .thenReturn(List.of(diemCu));
        when(calibrationScoreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        List<CalibrationScoreResponse> res = calibrationService.submitScores(roundId,
                List.of(new CalibrationScoreItemRequest(c.getId(), new BigDecimal("6.5"))), judgeId);

        // Phai ghi de len CHINH ban ghi cu, chi doi gia tri - khong phai ban
        // ghi thu hai. Bat thuc the that su duoc luu de doi chieu id.
        assertThat(res).hasSize(1);
        ArgumentCaptor<CalibrationScore> daLuu = ArgumentCaptor.forClass(CalibrationScore.class);
        verify(calibrationScoreRepository, times(1)).save(daLuu.capture());
        assertThat(daLuu.getValue().getId()).isEqualTo(diemCu.getId());
        assertThat(daLuu.getValue().getScoreValue()).isEqualByComparingTo("6.5");
    }

    @Test
    @DisplayName("submitScores: tieu chi chua cham thi van chen moi nhu cu")
    void submitScores_TieuChiChuaChamThiChenMoi() {
        Criterion daCham = criterion("Tinh sang tao");
        Criterion chuaCham = criterion("Thuyet trinh");
        CalibrationScore diemCu = CalibrationScore.builder()
                .calibrationRound(round).judge(judge).criterion(daCham).scoreValue(new BigDecimal("8.0")).build();
        diemCu.setId(UUID.randomUUID());

        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(chuaCham.getId())).thenReturn(Optional.of(chuaCham));
        when(calibrationScoreRepository.findByCalibrationRoundIdAndJudgeId(roundId, judgeId))
                .thenReturn(List.of(diemCu));
        when(calibrationScoreRepository.save(any())).thenAnswer(inv -> {
            CalibrationScore sc = inv.getArgument(0);
            if (sc.getId() == null) sc.setId(UUID.randomUUID());
            return sc;
        });

        List<CalibrationScoreResponse> res = calibrationService.submitScores(roundId,
                List.of(new CalibrationScoreItemRequest(chuaCham.getId(), new BigDecimal("7.0"))), judgeId);

        assertThat(res).hasSize(1);
        ArgumentCaptor<CalibrationScore> daLuu = ArgumentCaptor.forClass(CalibrationScore.class);
        verify(calibrationScoreRepository).save(daLuu.capture());
        assertThat(daLuu.getValue().getId())
                .as("phai la ban ghi moi, khong phai ghi de len diem cua tieu chi khac")
                .isNotEqualTo(diemCu.getId());
        assertThat(daLuu.getValue().getCriterion().getId()).isEqualTo(chuaCham.getId());
        assertThat(diemCu.getScoreValue())
                .as("diem cua tieu chi khac khong duoc dong toi")
                .isEqualByComparingTo("8.0");
    }

    @Test
    @DisplayName("submitScores: mot luot nop lap cung tieu chi hai lan thi chi ra MOT ban ghi")
    void submitScores_LapTieuChiTrongCungMotLuot() {
        Criterion c = criterion("Tinh sang tao");

        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(c.getId())).thenReturn(Optional.of(c));
        when(calibrationScoreRepository.findByCalibrationRoundIdAndJudgeId(roundId, judgeId))
                .thenReturn(List.of());
        when(calibrationScoreRepository.save(any())).thenAnswer(inv -> {
            CalibrationScore sc = inv.getArgument(0);
            if (sc.getId() == null) sc.setId(UUID.randomUUID());
            return sc;
        });

        // Giao dien gui trung do bam hai lan, hoac do loi dung mang.
        List<CalibrationScoreResponse> res = calibrationService.submitScores(roundId, List.of(
                new CalibrationScoreItemRequest(c.getId(), new BigDecimal("8.0")),
                new CalibrationScoreItemRequest(c.getId(), new BigDecimal("6.0"))), judgeId);

        // Hai muc nhung chi MOT ban ghi that: lan luu thu hai phai ghi de len
        // chinh ban ghi vua tao, neu khong se vo rang buoc UNIQUE.
        ArgumentCaptor<CalibrationScore> daLuu = ArgumentCaptor.forClass(CalibrationScore.class);
        verify(calibrationScoreRepository, times(2)).save(daLuu.capture());
        List<CalibrationScore> luot = daLuu.getAllValues();
        assertThat(luot.get(1).getId())
                .as("lan thu hai phai la chinh ban ghi vua tao")
                .isEqualTo(luot.get(0).getId());
        assertThat(res).hasSize(2);
        assertThat(res.get(1).scoreValue())
                .as("gia tri nop sau cung thang")
                .isEqualByComparingTo("6.0");
    }

    @Test
    @DisplayName("submitScores: chi MOT truy van doc diem cu du nop bao nhieu tieu chi (chan N+1)")
    void submitScores_ChiMotTruyVanDocDiemCu() {
        when(calibrationRoundRepository.findById(roundId)).thenReturn(Optional.of(round));
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(calibrationScoreRepository.findByCalibrationRoundIdAndJudgeId(roundId, judgeId))
                .thenReturn(List.of());
        when(calibrationScoreRepository.save(any())).thenAnswer(inv -> {
            CalibrationScore sc = inv.getArgument(0);
            sc.setId(UUID.randomUUID());
            return sc;
        });

        List<CalibrationScoreItemRequest> muc = new java.util.ArrayList<>();
        for (int i = 0; i < 8; i++) {
            Criterion c = criterion("Tieu chi " + i);
            when(criterionRepository.findById(c.getId())).thenReturn(Optional.of(c));
            muc.add(new CalibrationScoreItemRequest(c.getId(), new BigDecimal("7.0")));
        }

        calibrationService.submitScores(roundId, muc, judgeId);

        // 8 tieu chi van chi doc diem cu dung mot lan.
        verify(calibrationScoreRepository, times(1)).findByCalibrationRoundIdAndJudgeId(roundId, judgeId);
    }
}
