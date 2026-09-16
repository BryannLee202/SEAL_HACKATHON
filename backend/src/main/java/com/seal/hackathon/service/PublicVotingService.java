package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.entity.Vote;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.domain.enums.EventStatus;
import com.seal.hackathon.dto.event.EventResponse;
import com.seal.hackathon.dto.event.TrackResponse;
import com.seal.hackathon.dto.vote.CastVoteRequest;
import com.seal.hackathon.dto.vote.MyVoteResponse;
import com.seal.hackathon.dto.vote.PublicTeamResponse;
import com.seal.hackathon.dto.vote.TeamVoteTallyResponse;
import com.seal.hackathon.dto.vote.VoteCastResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.VoteRepository;
import com.seal.hackathon.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PublicVotingService {

    private static final long IP_VOTE_CAP_PER_TRACK = 20; // rộng rãi: chấp nhận wifi chung tại sự kiện, chỉ chặn script lạm dụng

    private final EventService eventService;
    private final TrackService trackService;
    private final TeamRepository teamRepository;
    private final VoteRepository voteRepository;
    private final JwtService jwtService;
    private final AuditService auditService;

    public PublicVotingService(
            EventService eventService,
            TrackService trackService,
            TeamRepository teamRepository,
            VoteRepository voteRepository,
            JwtService jwtService,
            AuditService auditService
    ) {
        this.eventService = eventService;
        this.trackService = trackService;
        this.teamRepository = teamRepository;
        this.voteRepository = voteRepository;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> listVotableEvents() {
        return eventService.list().stream()
                .filter(e -> e.status() != EventStatus.DRAFT && e.status() != EventStatus.CANCELLED)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrackResponse> listTracks(UUID eventId) {
        if (eventId == null) {
            throw ApiException.badRequest("Mã sự kiện không được để trống");
        }
        return trackService.listByEvent(eventId);
    }

    @Transactional(readOnly = true)
    public List<PublicTeamResponse> listTeams(UUID trackId) {
        if (trackId == null) {
            throw ApiException.badRequest("Mã Hạng mục không được để trống");
        }
        return teamRepository.findByTrackId(trackId).stream()
                .map(PublicTeamResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamVoteTallyResponse> tallyByTrack(UUID trackId) {
        if (trackId == null) {
            throw ApiException.badRequest("Mã Hạng mục không được để trống");
        }
        Map<UUID, Long> counts = voteRepository.countGroupedByTeamForTrack(trackId).stream()
                .collect(Collectors.toMap(
                        VoteRepository.TeamVoteCount::getTeamId,
                        item -> item.getVoteCount() != null ? item.getVoteCount() : 0L));
        return teamRepository.findByTrackId(trackId).stream()
                .map(t -> new TeamVoteTallyResponse(t.getId(), t.getName(), counts.getOrDefault(t.getId(), 0L)))
                .sorted(Comparator.comparingLong(TeamVoteTallyResponse::voteCount).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MyVoteResponse getMyVote(UUID trackId, String incomingVoterToken) {
        if (trackId == null) {
            throw ApiException.badRequest("Mã Hạng mục không được để trống");
        }
        if (incomingVoterToken == null || incomingVoterToken.isBlank()) {
            return new MyVoteResponse(null);
        }
        try {
            UUID voterId = jwtService.resolveOrCreateVoterId(incomingVoterToken);
            String voterIdHash = sha256Hex(voterId.toString());
            Optional<Vote> voteOpt = voteRepository.findByTrackIdAndVoterIdHash(trackId, voterIdHash);
            return new MyVoteResponse(voteOpt.map(v -> v.getTeam().getId()).orElse(null));
        } catch (Exception e) {
            return new MyVoteResponse(null);
        }
    }

    @Transactional
    public void cancelVote(UUID trackId, String incomingVoterToken) {
        if (trackId == null) {
            throw ApiException.badRequest("Mã Hạng mục không được để trống");
        }
        if (incomingVoterToken == null || incomingVoterToken.isBlank()) {
            throw ApiException.badRequest("Chưa có thông tin định danh người bình chọn");
        }
        UUID voterId = jwtService.resolveOrCreateVoterId(incomingVoterToken);
        String voterIdHash = sha256Hex(voterId.toString());
        Optional<Vote> voteOpt = voteRepository.findByTrackIdAndVoterIdHash(trackId, voterIdHash);
        if (voteOpt.isEmpty()) {
            throw ApiException.notFound("Không tìm thấy lượt bình chọn nào để hủy");
        }
        Vote vote = voteOpt.get();
        UUID teamId = vote.getTeam().getId();
        voteRepository.delete(vote);
        auditService.record(null, AuditAction.VOTE_CAST, "Team", teamId, "VOTE_CANCELLED", trackId);
    }

    @Transactional
    public VoteCastResponse castVote(UUID trackId, CastVoteRequest request, String incomingVoterToken, String clientIp) {
        if (trackId == null) {
            throw ApiException.badRequest("Mã Hạng mục không được để trống");
        }
        if (request == null || request.teamId() == null) {
            throw ApiException.badRequest("Mã đội thi không được để trống");
        }
        Track track = trackService.findOrThrow(trackId);
        if (track.getEvent().getStatus() != EventStatus.OPEN && track.getEvent().getStatus() != EventStatus.ONGOING) {
            throw ApiException.conflict("Sự kiện hiện không mở bình chọn");
        }
        Team team = teamRepository.findById(request.teamId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đội thi"));
        if (team.getTrack() == null || !team.getTrack().getId().equals(trackId)) {
            throw ApiException.badRequest("Đội thi không thuộc Hạng mục này");
        }

        UUID voterId = jwtService.resolveOrCreateVoterId(incomingVoterToken);
        String voterToken = jwtService.generateVoterToken(voterId);
        String voterIdHash = sha256Hex(voterId.toString());
        String ipHash = sha256Hex(clientIp == null ? "unknown" : clientIp);

        Optional<Vote> existingVoteOpt = voteRepository.findByTrackIdAndVoterIdHash(trackId, voterIdHash);
        if (existingVoteOpt.isPresent()) {
            Vote existingVote = existingVoteOpt.get();
            if (existingVote.getTeam().getId().equals(team.getId())) {
                throw ApiException.conflict("Bạn đã bình chọn cho Hạng mục này rồi");
            }
            UUID oldTeamId = existingVote.getTeam().getId();
            existingVote.setTeam(team);
            existingVote.setIpHash(ipHash);
            voteRepository.save(existingVote);
            auditService.record(null, AuditAction.VOTE_CAST, "Team", team.getId(), "SWITCHED_FROM:" + oldTeamId, trackId);
            return new VoteCastResponse(team.getId(), voteRepository.countByTeamId(team.getId()), voterToken);
        }

        if (voteRepository.countByTrackIdAndIpHash(trackId, ipHash) >= IP_VOTE_CAP_PER_TRACK) {
            throw ApiException.conflict("Đã đạt giới hạn số lượt bình chọn từ mạng này cho Hạng mục này");
        }

        try {
            voteRepository.save(Vote.builder().team(team).track(track).voterIdHash(voterIdHash).ipHash(ipHash).build());
        } catch (DataIntegrityViolationException raceLoser) {
            throw ApiException.conflict("Bạn đã bình chọn cho Hạng mục này rồi");
        }

        auditService.record(null, AuditAction.VOTE_CAST, "Team", team.getId(), null, trackId);
        return new VoteCastResponse(team.getId(), voteRepository.countByTeamId(team.getId()), voterToken);
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
