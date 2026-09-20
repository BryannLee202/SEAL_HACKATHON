package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.dto.scoring.ScoreBatchRequest;
import com.seal.hackathon.dto.scoring.ScoreItemRequest;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CalibrationRoundRepository;
import com.seal.hackathon.repository.CalibrationScoreRepository;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScoreServiceTest {

    @Mock
    private ScoreRepository scoreRepository;
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private CriterionRepository criterionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CalibrationRoundRepository calibrationRoundRepository;
    @Mock
    private CalibrationScoreRepository calibrationScoreRepository;
    @Mock
    private JudgeAssignmentService judgeAssignmentService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private ScoreService scoreService;

    private UUID submissionId;
    private UUID judgeId;
    private UUID roundId;
    private UUID criterionId;
    private Submission submission;
    private Round round;
    private User judge;
    private Criterion criterion;

    @BeforeEach
    void setUp() {
        submissionId = UUID.randomUUID();
        judgeId = UUID.randomUUID();
        roundId = UUID.randomUUID();
        criterionId = UUID.randomUUID();

        HackathonEvent event = HackathonEvent.builder().build();
        event.setId(UUID.randomUUID());

        round = Round.builder().event(event).build();
        round.setId(roundId);

        submission = Submission.builder().round(round).build();
        submission.setId(submissionId);

        judge = User.builder().fullName("Giam Khao A").build();
        judge.setId(judgeId);

        criterion = Criterion.builder().round(round).name("Tinh sang tao").maxScore(BigDecimal.TEN).build();
        criterion.setId(criterionId);

        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
        org.mockito.Mockito.lenient().when(calibrationRoundRepository.findByEventId(event.getId())).thenReturn(List.of());
    }

    @Test
    void submitScores_shouldThrowForbidden_whenJudgeNotAssignedToRound() {
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(8), null)), false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(false);

        assertThatThrownBy(() -> scoreService.submitScores(submissionId, request, judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không được phân công");
    }

    @Test
    void submitScores_shouldThrowBadRequest_whenCriterionDoesNotBelongToRound() {
        // Tieu chi nay thuoc vong thi khac, nen no KHONG nam trong
        // findByRoundId cua vong chua bai nop -> bi tu choi.
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(8), null)), false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of());
        when(scoreRepository.findBySubmissionIdAndJudgeId(submissionId, judgeId)).thenReturn(List.of());

        assertThatThrownBy(() -> scoreService.submitScores(submissionId, request, judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không thuộc vòng thi");
    }

    @Test
    void submitScores_shouldThrowBadRequest_whenScoreValueExceedsMax() {
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(11), null)), false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(criterion));
        when(scoreRepository.findBySubmissionIdAndJudgeId(submissionId, judgeId)).thenReturn(List.of());

        assertThatThrownBy(() -> scoreService.submitScores(submissionId, request, judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("phải trong khoảng");
    }

    @Test
    void submitScores_shouldThrowBadRequest_whenScoreValueIsNegative() {
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(-1), null)), false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(criterion));
        when(scoreRepository.findBySubmissionIdAndJudgeId(submissionId, judgeId)).thenReturn(List.of());

        assertThatThrownBy(() -> scoreService.submitScores(submissionId, request, judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("phải trong khoảng");
    }

    @Test
    void submitScores_shouldSaveNewScore_whenValidRequest() {
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(8), "Tot")), true);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(criterion));
        when(scoreRepository.findBySubmissionIdAndJudgeId(submissionId, judgeId)).thenReturn(List.of());
        when(scoreRepository.save(any(Score.class))).thenAnswer(invocation -> {
            Score score = invocation.getArgument(0);
            score.setId(UUID.randomUUID());
            return score;
        });

        var responses = scoreService.submitScores(submissionId, request, judgeId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).scoreValue()).isEqualByComparingTo(BigDecimal.valueOf(8));
        assertThat(responses.get(0).finalized()).isTrue();
    }

    // ---------------------------------------------------------------
    // Gom truy van cho duong cham diem
    //
    // Truoc day moi muc ton 2 cau (findById tieu chi + tim diem cu), nen mot
    // luot cham 5 tieu chi la 10 cau - nhan voi so bai nop ma giam khao luot
    // qua tren man cham diem.
    // ---------------------------------------------------------------

    private Criterion tieuChi(String ten) {
        Criterion c = Criterion.builder().round(round).name(ten).maxScore(BigDecimal.TEN).build();
        c.setId(UUID.randomUUID());
        return c;
    }

    @org.junit.jupiter.api.Test
    @org.junit.jupiter.api.DisplayName("submitScores: 8 tieu chi van chi hai truy van doc (chan N+1)")
    void submitScores_ChiHaiTruyVanDoc() {
        List<Criterion> tieuChis = new java.util.ArrayList<>();
        List<ScoreItemRequest> muc = new java.util.ArrayList<>();
        for (int i = 0; i < 8; i++) {
            Criterion c = tieuChi("Tieu chi " + i);
            tieuChis.add(c);
            muc.add(new ScoreItemRequest(c.getId(), BigDecimal.valueOf(7), null));
        }

        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(tieuChis);
        when(scoreRepository.findBySubmissionIdAndJudgeId(submissionId, judgeId)).thenReturn(List.of());
        when(scoreRepository.save(any(Score.class))).thenAnswer(inv -> {
            Score sc = inv.getArgument(0);
            if (sc.getId() == null) sc.setId(UUID.randomUUID());
            return sc;
        });

        var ketQua = scoreService.submitScores(submissionId, new ScoreBatchRequest(muc, false), judgeId);

        assertThat(ketQua).hasSize(8);
        org.mockito.Mockito.verify(criterionRepository, org.mockito.Mockito.times(1)).findByRoundId(roundId);
        org.mockito.Mockito.verify(scoreRepository, org.mockito.Mockito.times(1))
                .findBySubmissionIdAndJudgeId(submissionId, judgeId);
        // Duong cu khong duoc dung toi nua.
        org.mockito.Mockito.verify(criterionRepository, org.mockito.Mockito.never()).findById(any());
        org.mockito.Mockito.verify(scoreRepository, org.mockito.Mockito.never())
                .findBySubmissionIdAndJudgeIdAndCriterionId(any(), any(), any());
    }

    @org.junit.jupiter.api.Test
    @org.junit.jupiter.api.DisplayName("submitScores: cham lai thi CAP NHAT diem cu, khong chen ban ghi moi")
    void submitScores_ChamLaiThiCapNhat() {
        Score diemCu = Score.builder().submission(submission).judge(judge).criterion(criterion)
                .scoreValue(BigDecimal.valueOf(5)).build();
        diemCu.setId(UUID.randomUUID());

        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(criterion));
        when(scoreRepository.findBySubmissionIdAndJudgeId(submissionId, judgeId)).thenReturn(List.of(diemCu));
        when(scoreRepository.save(any(Score.class))).thenAnswer(inv -> inv.getArgument(0));

        scoreService.submitScores(submissionId, new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(9), "Sua lai")), false), judgeId);

        var daLuu = org.mockito.ArgumentCaptor.forClass(Score.class);
        org.mockito.Mockito.verify(scoreRepository).save(daLuu.capture());
        assertThat(daLuu.getValue().getId()).isEqualTo(diemCu.getId());
        assertThat(daLuu.getValue().getScoreValue()).isEqualByComparingTo(BigDecimal.valueOf(9));
    }

    @org.junit.jupiter.api.Test
    @org.junit.jupiter.api.DisplayName("submitScores: gui lap cung tieu chi trong mot luot thi chi mot ban ghi")
    void submitScores_LapTieuChiTrongMotLuot() {
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(criterion));
        when(scoreRepository.findBySubmissionIdAndJudgeId(submissionId, judgeId)).thenReturn(List.of());
        when(scoreRepository.save(any(Score.class))).thenAnswer(inv -> {
            Score sc = inv.getArgument(0);
            if (sc.getId() == null) sc.setId(UUID.randomUUID());
            return sc;
        });

        scoreService.submitScores(submissionId, new ScoreBatchRequest(List.of(
                new ScoreItemRequest(criterionId, BigDecimal.valueOf(8), null),
                new ScoreItemRequest(criterionId, BigDecimal.valueOf(6), null)), false), judgeId);

        var daLuu = org.mockito.ArgumentCaptor.forClass(Score.class);
        org.mockito.Mockito.verify(scoreRepository, org.mockito.Mockito.times(2)).save(daLuu.capture());
        var luot = daLuu.getAllValues();
        assertThat(luot.get(1).getId())
                .as("lan thu hai phai ghi de len ban ghi vua tao")
                .isEqualTo(luot.get(0).getId());
    }
}
