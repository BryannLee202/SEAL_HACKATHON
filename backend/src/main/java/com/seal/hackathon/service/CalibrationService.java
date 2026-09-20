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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CalibrationService {

    private final CalibrationRoundRepository calibrationRoundRepository;
    private final CalibrationScoreRepository calibrationScoreRepository;
    private final SubmissionRepository submissionRepository;
    private final CriterionRepository criterionRepository;
    private final UserRepository userRepository;
    private final EventService eventService;

    public CalibrationService(
            CalibrationRoundRepository calibrationRoundRepository,
            CalibrationScoreRepository calibrationScoreRepository,
            SubmissionRepository submissionRepository,
            CriterionRepository criterionRepository,
            UserRepository userRepository,
            EventService eventService
    ) {
        this.calibrationRoundRepository = calibrationRoundRepository;
        this.calibrationScoreRepository = calibrationScoreRepository;
        this.submissionRepository = submissionRepository;
        this.criterionRepository = criterionRepository;
        this.userRepository = userRepository;
        this.eventService = eventService;
    }

    @Transactional
    public CalibrationRoundResponse create(UUID eventId, CalibrationRoundRequest request) {
        HackathonEvent event = eventService.findOrThrow(eventId);
        if (!event.isRblEnabled()) {
            throw ApiException.conflict("Sự kiện chưa bật mô-đun nghiên cứu RBL");
        }
        Submission sample = submissionRepository.findById(request.sampleSubmissionId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài nộp mẫu"));

        CalibrationRound round = CalibrationRound.builder()
                .event(event)
                .sampleSubmission(sample)
                .name(request.name())
                .active(true)
                .build();
        return CalibrationRoundResponse.from(calibrationRoundRepository.save(round));
    }

    @Transactional(readOnly = true)
    public List<CalibrationRoundResponse> listByEvent(UUID eventId) {
        return calibrationRoundRepository.findByEventId(eventId).stream()
                .map(CalibrationRoundResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public List<CalibrationScoreResponse> submitScores(UUID calibrationRoundId, List<CalibrationScoreItemRequest> items, UUID judgeUserId) {
        CalibrationRound round = calibrationRoundRepository.findById(calibrationRoundId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy vòng hiệu chuẩn"));
        if (!round.isActive()) {
            throw ApiException.conflict(
                    "Phiên hiệu chuẩn \"" + round.getName() + "\" đã đóng, không nhận thêm điểm. "
                            + "Nếu cần chấm bổ sung, ban tổ chức phải mở lại phiên.");
        }
        User judge = userRepository.findById(judgeUserId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy giám khảo"));

        List<CalibrationScore> results = items.stream().map(item -> {
            Criterion criterion = criterionRepository.findById(item.criterionId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy tiêu chí"));
            CalibrationScore score = CalibrationScore.builder()
                    .calibrationRound(round)
                    .judge(judge)
                    .criterion(criterion)
                    .scoreValue(item.scoreValue())
                    .build();
            return calibrationScoreRepository.save(score);
        }).collect(Collectors.toList());

        return results.stream().map(CalibrationScoreResponse::from).collect(Collectors.toList());
    }

    /**
     * Đóng hoặc mở lại một phiên hiệu chuẩn.
     *
     * Cờ {@code active} trước đây được đặt {@code true} lúc tạo rồi không nơi
     * nào đổi được nữa, nên mọi phiên hiệu chuẩn đều mở vĩnh viễn. Hai màn hình
     * đã dựa vào cờ này từ trước: form chấm của giám khảo lọc
     * {@code .filter(cr => cr.active)}, và ô "Cần chú ý" ở trang chủ giám khảo
     * đếm số phiên đang mở. Không đóng được nghĩa là nhắc nhở đó không bao giờ
     * tắt, và giám khảo vẫn nộp thêm điểm hiệu chuẩn sau khi số liệu nghiên cứu
     * đã chốt — làm lệch phân phối dùng để so độ đồng thuận.
     */
    @Transactional
    public CalibrationRoundResponse setActive(UUID calibrationRoundId, boolean active) {
        CalibrationRound round = calibrationRoundRepository.findById(calibrationRoundId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy vòng hiệu chuẩn"));
        round.setActive(active);
        return CalibrationRoundResponse.from(calibrationRoundRepository.save(round));
    }

    @Transactional(readOnly = true)
    public List<CalibrationScoreResponse> distribution(UUID calibrationRoundId) {
        return calibrationScoreRepository.findByCalibrationRoundId(calibrationRoundId).stream()
                .map(CalibrationScoreResponse::from).collect(Collectors.toList());
    }
}
