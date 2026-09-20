package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.CalibrationRound;
import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.dto.scoring.ScoreBatchRequest;
import com.seal.hackathon.dto.scoring.ScoreItemRequest;
import com.seal.hackathon.dto.scoring.ScoreResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CalibrationRoundRepository;
import com.seal.hackathon.repository.CalibrationScoreRepository;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.UserRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final SubmissionRepository submissionRepository;
    private final CriterionRepository criterionRepository;
    private final UserRepository userRepository;
    private final CalibrationRoundRepository calibrationRoundRepository;
    private final CalibrationScoreRepository calibrationScoreRepository;
    private final JudgeAssignmentService judgeAssignmentService;
    private final AuditService auditService;
    private final TeamMemberRepository teamMemberRepository;

    public ScoreService(
            ScoreRepository scoreRepository,
            SubmissionRepository submissionRepository,
            CriterionRepository criterionRepository,
            UserRepository userRepository,
            CalibrationRoundRepository calibrationRoundRepository,
            CalibrationScoreRepository calibrationScoreRepository,
            JudgeAssignmentService judgeAssignmentService,
            AuditService auditService,
            TeamMemberRepository teamMemberRepository
    ) {
        this.scoreRepository = scoreRepository;
        this.submissionRepository = submissionRepository;
        this.criterionRepository = criterionRepository;
        this.userRepository = userRepository;
        this.calibrationRoundRepository = calibrationRoundRepository;
        this.calibrationScoreRepository = calibrationScoreRepository;
        this.judgeAssignmentService = judgeAssignmentService;
        this.auditService = auditService;
        this.teamMemberRepository = teamMemberRepository;
    }

    @Transactional
    public List<ScoreResponse> submitScores(UUID submissionId, ScoreBatchRequest request, UUID judgeUserId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài nộp"));
        UUID roundId = submission.getRound().getId();

        if (!judgeAssignmentService.isJudgeAssignedToRound(judgeUserId, roundId)) {
            throw ApiException.forbidden("Bạn không được phân công chấm điểm vòng thi này");
        }
        User judge = userRepository.findById(judgeUserId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy giám khảo"));

        boolean judgeCalibrated = isJudgeCalibrated(submission, judgeUserId);

        // Đọc TIÊU CHÍ của vòng thi và ĐIỂM CŨ của giám khảo này, mỗi thứ một
        // truy vấn, thay vì hỏi lại cho từng tiêu chí trong vòng lặp.
        //
        // Trước đây mỗi mục tốn 2 câu (findById tiêu chí + tìm điểm cũ), nên
        // một lượt chấm 5 tiêu chí là 10 câu — trên màn chấm điểm, nhân với số
        // bài nộp mà giám khảo lướt qua. Đây cũng chính là cách CalibrationService
        // đã gom, nay làm nốt cho đường chấm điểm chính.
        //
        // Đọc tiêu chí theo VÒNG THI (không phải theo id gửi lên) còn giữ luôn
        // được luật "tiêu chí phải thuộc vòng thi của bài nộp": id lạ đơn giản
        // là không có trong bản đồ.
        Map<UUID, Criterion> tieuChiCuaVong = criterionRepository.findByRoundId(roundId).stream()
                .collect(Collectors.toMap(Criterion::getId, c -> c));

        Map<UUID, Score> diemDaCham = scoreRepository
                .findBySubmissionIdAndJudgeId(submissionId, judgeUserId).stream()
                .collect(Collectors.toMap(sc -> sc.getCriterion().getId(), sc -> sc, (a, b) -> a));

        List<Score> results = new ArrayList<>();
        for (ScoreItemRequest item : request.items()) {
            Criterion criterion = tieuChiCuaVong.get(item.criterionId());
            if (criterion == null) {
                // Gộp hai trường hợp cũ thành một thông báo: tiêu chí không tồn
                // tại, hoặc tồn tại nhưng thuộc vòng thi khác. Cả hai đều là
                // "không dùng được cho bài nộp này".
                throw ApiException.badRequest("Tiêu chí không thuộc vòng thi của bài nộp này");
            }
            validateScoreRange(item, criterion);

            Score score = diemDaCham.get(item.criterionId());
            if (score == null) {
                score = Score.builder().submission(submission).judge(judge).criterion(criterion).build();
            }
            BigDecimal oldValue = score.getScoreValue();
            boolean isNew = score.getId() == null;

            score.setScoreValue(item.scoreValue());
            score.setComment(item.comment());
            score.setFinalized(request.finalized());
            score.setScoredAt(Instant.now());
            score.setJudgeCalibrated(judgeCalibrated);
            score = scoreRepository.save(score);

            auditService.record(judgeUserId,
                    isNew ? AuditAction.SCORE_CREATE : (request.finalized() ? AuditAction.SCORE_FINALIZE : AuditAction.SCORE_UPDATE),
                    "Score", score.getId(), oldValue, score.getScoreValue());

            // Cùng một tiêu chí gửi lặp trong một lượt thì lần sau ghi đè lên
            // bản ghi vừa lưu, không dựng thêm bản ghi mới rồi vỡ ràng buộc.
            diemDaCham.put(item.criterionId(), score);
            results.add(score);
        }

        return results.stream().map(ScoreResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ScoreResponse> listBySubmission(UUID submissionId, AuthenticatedPrincipal principal) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài nộp"));
        assertCanView(submission, principal);
        return scoreRepository.findBySubmissionId(submissionId).stream()
                .map(ScoreResponse::from).collect(Collectors.toList());
    }

    private void assertCanView(Submission submission, AuthenticatedPrincipal principal) {
        if (principal.isCoordinator()) {
            return;
        }
        UUID roundId = submission.getRound().getId();
        if (judgeAssignmentService.isJudgeAssignedToRound(principal.userId(), roundId)) {
            return;
        }
        Team team = submission.getTeam();
        boolean isTeamMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), principal.userId());
        if (isTeamMember && submission.getRound().isResultsPublished()) {
            return;
        }
        if (team.getTrack() != null
                && principal.hasRoleInScope(RoleName.MENTOR, ScopeType.TRACK, team.getTrack().getId())
                && submission.getRound().isResultsPublished()) {
            return;
        }
        throw ApiException.forbidden("Bạn không có quyền xem điểm của bài nộp này");
    }

    private void validateScoreRange(ScoreItemRequest item, Criterion criterion) {
        if (item.scoreValue().compareTo(BigDecimal.ZERO) < 0 || item.scoreValue().compareTo(criterion.getMaxScore()) > 0) {
            throw ApiException.badRequest(
                    "Điểm cho tiêu chí '" + criterion.getName() + "' phải trong khoảng 0 - " + criterion.getMaxScore());
        }
    }

    private boolean isJudgeCalibrated(Submission submission, UUID judgeUserId) {
        UUID eventId = submission.getRound().getEvent().getId();
        List<CalibrationRound> rounds = calibrationRoundRepository.findByEventId(eventId);
        if (rounds.isEmpty()) {
            return true; // RBL calibration not configured for this event - not applicable.
        }
        return rounds.stream().anyMatch(cr ->
                !calibrationScoreRepository.findByCalibrationRoundId(cr.getId()).stream()
                        .filter(cs -> cs.getJudge().getId().equals(judgeUserId))
                        .toList().isEmpty());
    }
}
