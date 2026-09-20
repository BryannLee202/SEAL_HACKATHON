package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.CalibrationScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CalibrationScoreRepository extends JpaRepository<CalibrationScore, UUID> {
    List<CalibrationScore> findByCalibrationRoundId(UUID calibrationRoundId);

    /**
     * Toàn bộ điểm một giám khảo đã chấm trong một phiên hiệu chuẩn.
     *
     * Lấy cả cụm trong một truy vấn để {@code submitScores} biết tiêu chí nào
     * đã có điểm mà cập nhật thay vì chèn thêm — thay vì hỏi từng tiêu chí một.
     */
    List<CalibrationScore> findByCalibrationRoundIdAndJudgeId(UUID calibrationRoundId, UUID judgeId);
}
