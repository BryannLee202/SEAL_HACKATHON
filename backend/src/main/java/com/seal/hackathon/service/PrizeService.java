package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Prize;
import com.seal.hackathon.domain.entity.Ranking;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.dto.prize.PrizeRequest;
import com.seal.hackathon.dto.prize.PrizeResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.PrizeRepository;
import com.seal.hackathon.repository.RankingRepository;
import com.seal.hackathon.repository.TrackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PrizeService {

    private final PrizeRepository prizeRepository;
    private final TrackRepository trackRepository;
    private final RankingRepository rankingRepository;
    private final EventService eventService;
    private final AuditService auditService;

    public PrizeService(
            PrizeRepository prizeRepository,
            TrackRepository trackRepository,
            RankingRepository rankingRepository,
            EventService eventService,
            AuditService auditService
    ) {
        this.prizeRepository = prizeRepository;
        this.trackRepository = trackRepository;
        this.rankingRepository = rankingRepository;
        this.eventService = eventService;
        this.auditService = auditService;
    }

    @Transactional
    public PrizeResponse create(UUID eventId, PrizeRequest request) {
        HackathonEvent event = eventService.findOrThrow(eventId);
        Track track = null;
        if (request.trackId() != null) {
            track = trackRepository.findById(request.trackId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy Hạng mục"));
        }
        Prize prize = Prize.builder()
                .event(event)
                .track(track)
                .name(request.name())
                .rankCondition(request.rankCondition())
                .revoked(false)
                .build();
        return PrizeResponse.from(prizeRepository.save(prize));
    }

    @Transactional(readOnly = true)
    public List<PrizeResponse> listByEvent(UUID eventId) {
        return prizeRepository.findByEventId(eventId).stream().map(PrizeResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public List<PrizeResponse> autoAssign(UUID eventId, UUID finalRoundId, UUID actorId) {
        List<Prize> prizes = prizeRepository.findByEventId(eventId);

        // Nap toan bo bang xep hang cua vong chung ket MOT lan, roi tra trong bo
        // nho. Truoc day moi giai thuong ton mot cau truy van rieng: su kien 3
        // hang muc x 3 giai + 3 giai toan cuoc la 12 cau, moi cau mot vong di ve
        // co so du lieu.
        List<Ranking> bangXepHang = rankingRepository.findByRoundIdOrderByRankOverallAsc(finalRoundId);

        // Giai theo hang muc tra bang (trackId, thu hang trong hang muc).
        Map<String, Ranking> theoHangMuc = new HashMap<>();
        // Giai toan cuoc tra bang thu hang tong.
        Map<Integer, Ranking> theoToanCuoc = new HashMap<>();

        for (Ranking r : bangXepHang) {
            if (r.getRankOverall() != null) {
                theoToanCuoc.putIfAbsent(r.getRankOverall(), r);
            }
            if (r.getTeam() != null && r.getTeam().getTrack() != null && r.getRankInTrack() != null) {
                theoHangMuc.putIfAbsent(
                        khoaHangMuc(r.getTeam().getTrack().getId(), r.getRankInTrack()), r);
            }
        }

        for (Prize prize : prizes) {
            if (prize.isRevoked()) {
                continue;
            }
            Ranking ranking = prize.getTrack() != null
                    ? theoHangMuc.get(khoaHangMuc(prize.getTrack().getId(), prize.getRankCondition()))
                    : theoToanCuoc.get(prize.getRankCondition());

            if (ranking != null) {
                prize.setAwardedTeam(ranking.getTeam());
            }
            prizeRepository.save(prize);
            if (ranking != null) {
                auditService.record(actorId, AuditAction.PRIZE_AWARD, "Prize", prize.getId(), null, ranking.getTeam().getId());
            }
        }
        return prizes.stream().map(PrizeResponse::from).collect(Collectors.toList());
    }

    /** Khoá tra cứu ghép từ hạng mục và thứ hạng trong hạng mục đó. */
    private static String khoaHangMuc(UUID trackId, Integer rankInTrack) {
        return trackId + "#" + rankInTrack;
    }

    @Transactional
    public PrizeResponse revoke(UUID prizeId, UUID actorId) {
        Prize prize = prizeRepository.findById(prizeId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy giải thưởng"));
        prize.setRevoked(true);
        prize = prizeRepository.save(prize);
        auditService.record(actorId, AuditAction.PRIZE_AWARD, "Prize", prizeId, "awarded", "revoked");
        return PrizeResponse.from(prize);
    }
}
