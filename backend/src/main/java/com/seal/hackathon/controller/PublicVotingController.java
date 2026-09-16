package com.seal.hackathon.controller;

import com.seal.hackathon.dto.event.EventResponse;
import com.seal.hackathon.dto.event.TrackResponse;
import com.seal.hackathon.dto.vote.CastVoteRequest;
import com.seal.hackathon.dto.vote.MyVoteResponse;
import com.seal.hackathon.dto.vote.PublicTeamResponse;
import com.seal.hackathon.dto.vote.TeamVoteTallyResponse;
import com.seal.hackathon.dto.vote.VoteCastResponse;
import com.seal.hackathon.service.PublicVotingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Toàn bộ endpoint bình chọn công khai (không cần đăng nhập) được gom vào một controller
 * duy nhất để dễ rà soát bề mặt tấn công ẩn danh mới, thay vì rải rác vào các controller khác.
 */
@RestController
@RequestMapping("/api/public/voting")
public class PublicVotingController {

    private final PublicVotingService publicVotingService;

    public PublicVotingController(PublicVotingService publicVotingService) {
        this.publicVotingService = publicVotingService;
    }

    @GetMapping("/events")
    public List<EventResponse> listEvents() {
        return publicVotingService.listVotableEvents();
    }

    @GetMapping("/events/{eventId}/tracks")
    public List<TrackResponse> listTracks(@PathVariable UUID eventId) {
        return publicVotingService.listTracks(eventId);
    }

    @GetMapping("/tracks/{trackId}/teams")
    public List<PublicTeamResponse> listTeams(@PathVariable UUID trackId) {
        return publicVotingService.listTeams(trackId);
    }

    @GetMapping("/tracks/{trackId}/tallies")
    public List<TeamVoteTallyResponse> tallies(@PathVariable UUID trackId) {
        return publicVotingService.tallyByTrack(trackId);
    }

    @GetMapping("/tracks/{trackId}/my-vote")
    public MyVoteResponse getMyVote(
            @PathVariable UUID trackId,
            @RequestHeader(value = "X-Voter-Token", required = false) String voterToken
    ) {
        return publicVotingService.getMyVote(trackId, voterToken);
    }

    @PostMapping("/tracks/{trackId}/votes")
    public VoteCastResponse castVote(
            @PathVariable UUID trackId,
            @Valid @RequestBody CastVoteRequest request,
            @RequestHeader(value = "X-Voter-Token", required = false) String voterToken,
            @RequestHeader(value = "X-Client-Ip", required = false) String forwardedIp,
            HttpServletRequest servletRequest
    ) {
        String clientIp = (forwardedIp != null && !forwardedIp.isBlank()) ? forwardedIp : servletRequest.getRemoteAddr();
        return publicVotingService.castVote(trackId, request, voterToken, clientIp);
    }

    @DeleteMapping("/tracks/{trackId}/votes")
    public ResponseEntity<Map<String, Object>> cancelVote(
            @PathVariable UUID trackId,
            @RequestHeader(value = "X-Voter-Token", required = false) String voterToken
    ) {
        publicVotingService.cancelVote(trackId, voterToken);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã hủy bình chọn thành công"));
    }
}
