package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.CriteriaTemplate;
import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.dto.criteria.CriteriaTemplateRequest;
import com.seal.hackathon.dto.criteria.CriteriaTemplateResponse;
import com.seal.hackathon.dto.criteria.CriterionRequest;
import com.seal.hackathon.dto.criteria.CriterionResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriteriaTemplateRepository;
import com.seal.hackathon.repository.CriterionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CriteriaTemplateService {

    private final CriteriaTemplateRepository templateRepository;
    private final CriterionRepository criterionRepository;
    private final CriterionWeightPolicy weightPolicy;

    public CriteriaTemplateService(CriteriaTemplateRepository templateRepository, CriterionRepository criterionRepository, CriterionWeightPolicy weightPolicy) {
        this.templateRepository = templateRepository;
        this.criterionRepository = criterionRepository;
        this.weightPolicy = weightPolicy;
    }

    @Transactional
    public CriteriaTemplateResponse create(CriteriaTemplateRequest request) {
        CriteriaTemplate template = CriteriaTemplate.builder()
                .name(request.name())
                .description(request.description())
                .isDefault(false)
                .build();
        template = templateRepository.save(template);
        return CriteriaTemplateResponse.from(template, List.of());
    }

    @Transactional(readOnly = true)
    public List<CriteriaTemplateResponse> list() {
        return templateRepository.findAll().stream()
                .map(t -> CriteriaTemplateResponse.from(t, criteriaOf(t.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CriteriaTemplateResponse get(UUID id) {
        CriteriaTemplate template = findOrThrow(id);
        return CriteriaTemplateResponse.from(template, criteriaOf(id));
    }

    @Transactional
    public CriterionResponse addCriterion(UUID templateId, CriterionRequest request) {
        CriteriaTemplate template = findOrThrow(templateId);
        // Trần trọng số 100 phải chặn ngay tại mẫu, không chỉ ở vòng thi.
        // RoundService.create() sao nguyên xi tiêu chí của mẫu vào vòng bằng
        // criterionRepository.saveAll(), không đi qua RoundCriterionService.add()
        // nên luật trọng số ở đó không hề được gọi. Một mẫu tổng 150 sẽ đẻ ra
        // vòng thi tổng 150, và điểm quy đổi của mọi đội đều sai kể từ đó.
        weightPolicy.assertFits(criterionRepository.findByTemplateId(templateId), null, request.weight());
        Criterion criterion = Criterion.builder()
                .template(template)
                .name(request.name())
                .description(request.description())
                .weight(request.weight())
                .maxScore(request.maxScore())
                .build();
        return CriterionResponse.from(criterionRepository.save(criterion));
    }

    @Transactional
    public void removeCriterion(UUID templateId, UUID criterionId) {
        Criterion criterion = criterionRepository.findById(criterionId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy tiêu chí"));
        if (criterion.getTemplate() == null || !criterion.getTemplate().getId().equals(templateId)) {
            throw ApiException.badRequest("Tiêu chí không thuộc mẫu này");
        }
        criterionRepository.delete(criterion);
    }

    private List<CriterionResponse> criteriaOf(UUID templateId) {
        return criterionRepository.findByTemplateId(templateId).stream()
                .map(CriterionResponse::from).collect(Collectors.toList());
    }

    CriteriaTemplate findOrThrow(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy mẫu tiêu chí"));
    }
}
