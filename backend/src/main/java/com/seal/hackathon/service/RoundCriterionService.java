package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.dto.criteria.CriterionRequest;
import com.seal.hackathon.dto.criteria.CriterionResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.ScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoundCriterionService {

    private final CriterionRepository criterionRepository;
    private final ScoreRepository scoreRepository;
    private final RoundService roundService;
    private final CriterionWeightPolicy weightPolicy;

    public RoundCriterionService(CriterionRepository criterionRepository, ScoreRepository scoreRepository, RoundService roundService, CriterionWeightPolicy weightPolicy) {
        this.criterionRepository = criterionRepository;
        this.scoreRepository = scoreRepository;
        this.roundService = roundService;
        this.weightPolicy = weightPolicy;
    }

    @Transactional(readOnly = true)
    public List<CriterionResponse> list(UUID roundId) {
        return criterionRepository.findByRoundId(roundId).stream().map(CriterionResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public CriterionResponse add(UUID roundId, CriterionRequest request) {
        Round round = roundService.findOrThrow(roundId);
        assertNoScoresYet(roundId);
        weightPolicy.assertFits(criterionRepository.findByRoundId(roundId), null, request.weight());
        Criterion criterion = Criterion.builder()
                .round(round)
                .name(request.name())
                .description(request.description())
                .weight(request.weight())
                .maxScore(request.maxScore())
                .build();
        return CriterionResponse.from(criterionRepository.save(criterion));
    }

    @Transactional
    public CriterionResponse update(UUID roundId, UUID criterionId, CriterionRequest request) {
        assertNoScoresYet(roundId);
        Criterion criterion = criterionRepository.findById(criterionId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tiêu chí"));
        assertThuocVongThi(criterion, roundId);
        weightPolicy.assertFits(criterionRepository.findByRoundId(roundId), criterionId, request.weight());
        criterion.setName(request.name());
        criterion.setDescription(request.description());
        criterion.setWeight(request.weight());
        criterion.setMaxScore(request.maxScore());
        return CriterionResponse.from(criterionRepository.save(criterion));
    }

    @Transactional
    public void remove(UUID roundId, UUID criterionId) {
        Criterion criterion = criterionRepository.findById(criterionId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tiêu chí"));
        // Phải đối chiếu tiêu chí với vòng thi trên URL TRƯỚC khi kiểm tra điểm.
        // Nếu không, khoá "vòng thi đã có điểm" bị vô hiệu: gọi
        // DELETE /api/rounds/{vongChuaChamDiem}/criteria/{tieuChiCuaVongKhac}
        // sẽ chạy assertNoScoresYet() trên vòng chưa chấm (luôn qua) rồi xoá
        // tiêu chí của vòng đang chấm dở, kéo theo toàn bộ điểm đã nhập.
        // update() đã đối chiếu như vậy từ đầu, chỉ remove() bỏ sót.
        assertThuocVongThi(criterion, roundId);
        assertNoScoresYet(roundId);
        criterionRepository.delete(criterion);
    }

    private void assertThuocVongThi(Criterion criterion, UUID roundId) {
        if (criterion.getRound() == null || !criterion.getRound().getId().equals(roundId)) {
            throw ApiException.badRequest("Tiêu chí không thuộc vòng thi này");
        }
    }

    private void assertNoScoresYet(UUID roundId) {
        if (scoreRepository.existsByCriterion_Round_Id(roundId)) {
            throw ApiException.conflict("Không thể thay đổi tiêu chí sau khi vòng thi đã có điểm được ghi nhận");
        }
    }
}
