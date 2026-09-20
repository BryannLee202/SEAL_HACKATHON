package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.UserRoleAssignment;
import com.seal.hackathon.domain.enums.JudgeType;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.UserRoleAssignmentRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RblExportService {

    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;
    private final UserRoleAssignmentRepository roleAssignmentRepository;

    public RblExportService(
            SubmissionRepository submissionRepository,
            ScoreRepository scoreRepository,
            UserRoleAssignmentRepository roleAssignmentRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.scoreRepository = scoreRepository;
        this.roleAssignmentRepository = roleAssignmentRepository;
    }

    @Transactional(readOnly = true)
    public String exportAnonymizedCsv(UUID roundId) {
        List<Submission> submissions = submissionRepository.findByRoundId(roundId);

        Map<UUID, String> judgeAlias = new HashMap<>();
        Map<UUID, String> submissionAlias = new HashMap<>();
        Map<UUID, JudgeType> judgeTypeCache = new HashMap<>();

        StringWriter writer = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                .setHeader("judge_alias", "judge_type", "judge_calibrated", "submission_alias", "criterion_name", "score_value")
                .build())) {

            // Lay diem cua MOI bai nop trong MOT cau truy van thay vi moi bai mot
            // cau. Vong chung ket 6 doi truoc day ton 6 cau; neu su kien co 60
            // doi thi la 60 cau, moi cau mot vong di ve co so du lieu.
            //
            // scoreRepository.findBySubmissionIdIn() von da co san trong
            // ScoreRepository, chi la cho nay khong dung toi.
            List<UUID> submissionIds = submissions.stream()
                    .map(Submission::getId)
                    .collect(Collectors.toList());

            Map<UUID, List<Score>> scoresBySubmission = scoreRepository.findBySubmissionIdIn(submissionIds)
                    .stream()
                    .collect(Collectors.groupingBy(score -> score.getSubmission().getId()));

            for (Submission submission : submissions) {
                String subAlias = submissionAlias.computeIfAbsent(submission.getId(), id -> "S" + (submissionAlias.size() + 1));
                List<Score> scores = scoresBySubmission.getOrDefault(submission.getId(), List.of());
                for (Score score : scores) {
                    if (!score.isFinalized()) {
                        continue;
                    }
                    UUID judgeId = score.getJudge().getId();
                    String jAlias = judgeAlias.computeIfAbsent(judgeId, id -> "J" + (judgeAlias.size() + 1));
                    JudgeType judgeType = judgeTypeCache.computeIfAbsent(judgeId, id -> resolveJudgeType(id, roundId));

                    printer.printRecord(
                            jAlias,
                            judgeType == null ? "" : judgeType.name(),
                            score.isJudgeCalibrated(),
                            subAlias,
                            score.getCriterion().getName(),
                            score.getScoreValue()
                    );
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Không thể tạo file CSV", e);
        }
        return writer.toString();
    }

    private JudgeType resolveJudgeType(UUID judgeId, UUID roundId) {
        return roleAssignmentRepository.findByRoleNameAndScopeTypeAndScopeId(RoleName.JUDGE, ScopeType.ROUND, roundId)
                .stream()
                .filter(a -> a.getUser().getId().equals(judgeId))
                .map(UserRoleAssignment::getJudgeType)
                .findFirst()
                .orElse(null);
    }
}
