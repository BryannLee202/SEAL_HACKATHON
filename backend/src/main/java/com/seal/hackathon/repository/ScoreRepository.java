package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreRepository extends JpaRepository<Score, UUID> {
    List<Score> findBySubmissionId(UUID submissionId);
    List<Score> findByJudgeId(UUID judgeId);
    List<Score> findBySubmissionIdIn(List<UUID> submissionIds);
    Optional<Score> findBySubmissionIdAndJudgeIdAndCriterionId(UUID submissionId, UUID judgeId, UUID criterionId);

    /**
     * Toàn bộ điểm một giám khảo đã chấm cho một bài nộp.
     *
     * Dùng cho {@code submitScores}: lấy cả cụm một lần thay vì hỏi từng tiêu
     * chí một, giống cách {@code CalibrationService} đã gom.
     */
    List<Score> findBySubmissionIdAndJudgeId(UUID submissionId, UUID judgeId);
    boolean existsByCriterion_Round_Id(UUID roundId);
}
