package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.entity.UserRoleAssignment;
import com.seal.hackathon.domain.enums.JudgeType;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.UserRoleAssignmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiểm việc xuất dữ liệu chấm điểm đã ẩn danh phục vụ nghiên cứu (UC-23).
 *
 * Hai điều cần giữ:
 *   1. Dữ liệu ra phải ẩn danh — không được lộ tên hay email giám khảo
 *   2. Chỉ lấy điểm ĐÃ CHỐT; điểm nháp không được vào tệp nghiên cứu
 *
 * Kèm một test chặn N+1: trước đây mỗi bài nộp tốn một câu truy vấn riêng.
 */
@ExtendWith(MockitoExtension.class)
class RblExportServiceTest {

    @Mock private SubmissionRepository submissionRepository;
    @Mock private ScoreRepository scoreRepository;
    @Mock private UserRoleAssignmentRepository roleAssignmentRepository;

    @InjectMocks private RblExportService rblExportService;

    private UUID roundId;
    private UUID judgeId;
    private User judge;

    @BeforeEach
    void setUp() {
        roundId = UUID.randomUUID();
        judgeId = UUID.randomUUID();
        judge = User.builder().fullName("Nguyen Van Giam Khao").email("judge1@demo.local").build();
        judge.setId(judgeId);
    }

    private Submission submission() {
        Submission s = new Submission();
        s.setId(UUID.randomUUID());
        return s;
    }

    private Score score(Submission submission, String criterionName, String value, boolean finalized) {
        Criterion criterion = Criterion.builder().name(criterionName).build();
        criterion.setId(UUID.randomUUID());

        Score sc = Score.builder()
                .submission(submission)
                .judge(judge)
                .criterion(criterion)
                .scoreValue(new BigDecimal(value))
                .finalized(finalized)
                .build();
        sc.setId(UUID.randomUUID());
        return sc;
    }

    private void judgeLaNoiBo() {
        UserRoleAssignment a = new UserRoleAssignment();
        a.setUser(judge);
        a.setRoleName(RoleName.JUDGE);
        a.setScopeType(ScopeType.ROUND);
        a.setScopeId(roundId);
        a.setJudgeType(JudgeType.INTERNAL);
        when(roleAssignmentRepository.findByRoleNameAndScopeTypeAndScopeId(
                RoleName.JUDGE, ScopeType.ROUND, roundId)).thenReturn(List.of(a));
    }

    @Test
    @DisplayName("Du lieu xuat ra phai an danh, khong lo ten hay email giam khao")
    void exportAnonymizedCsv_AnDanhGiamKhao() {
        Submission s1 = submission();
        when(submissionRepository.findByRoundId(roundId)).thenReturn(List.of(s1));
        when(scoreRepository.findBySubmissionIdIn(anyList()))
                .thenReturn(List.of(score(s1, "Tinh sang tao", "8.5", true)));
        judgeLaNoiBo();

        String csv = rblExportService.exportAnonymizedCsv(roundId);

        assertThat(csv).doesNotContain("Nguyen Van Giam Khao");
        assertThat(csv).doesNotContain("judge1@demo.local");
        assertThat(csv).doesNotContain(judgeId.toString());
        assertThat(csv).contains("J1");
        assertThat(csv).contains("S1");
        assertThat(csv).contains("Tinh sang tao");
        assertThat(csv).contains("8.5");
        assertThat(csv).contains("INTERNAL");
    }

    @Test
    @DisplayName("Chi lay diem DA CHOT, diem nhap khong vao tep nghien cuu")
    void exportAnonymizedCsv_BoQuaDiemChuaChot() {
        Submission s1 = submission();
        when(submissionRepository.findByRoundId(roundId)).thenReturn(List.of(s1));
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(List.of(
                score(s1, "Da chot", "9.0", true),
                score(s1, "Chua chot", "3.0", false)));
        judgeLaNoiBo();

        String csv = rblExportService.exportAnonymizedCsv(roundId);

        assertThat(csv).contains("Da chot");
        assertThat(csv).doesNotContain("Chua chot");
        assertThat(csv).doesNotContain("3.0");
    }

    @Test
    @DisplayName("Chan N+1: lay diem cua moi bai nop trong MOT cau truy van")
    void exportAnonymizedCsv_KhongTruyVanTungBaiNop() {
        List<Submission> ds = List.of(submission(), submission(), submission(), submission());
        when(submissionRepository.findByRoundId(roundId)).thenReturn(ds);
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(List.of());

        rblExportService.exportAnonymizedCsv(roundId);

        // Dung mot cau cho ca bon bai nop...
        verify(scoreRepository, times(1)).findBySubmissionIdIn(anyList());
        // ...va tuyet doi khong goi ham lay tung bai mot.
        verify(scoreRepository, never()).findBySubmissionId(org.mockito.ArgumentMatchers.any());
    }

    @Test
    @DisplayName("Vong chua co bai nop nao thi van tra ve CSV co dong tieu de")
    void exportAnonymizedCsv_KhongCoBaiNop() {
        when(submissionRepository.findByRoundId(roundId)).thenReturn(List.of());
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(List.of());

        String csv = rblExportService.exportAnonymizedCsv(roundId);

        assertThat(csv).contains("judge_alias");
        assertThat(csv).contains("criterion_name");
    }
}
