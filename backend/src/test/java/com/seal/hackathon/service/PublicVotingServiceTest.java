package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.entity.Vote;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.domain.enums.EventStatus;
import com.seal.hackathon.dto.event.EventResponse;
import com.seal.hackathon.dto.event.TrackResponse;
import com.seal.hackathon.dto.vote.CastVoteRequest;
import com.seal.hackathon.dto.vote.PublicTeamResponse;
import com.seal.hackathon.dto.vote.TeamVoteTallyResponse;
import com.seal.hackathon.dto.vote.VoteCastResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.VoteRepository;
import com.seal.hackathon.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicVotingServiceTest {

    @Mock
    private EventService eventService;
    @Mock
    private TrackService trackService;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private VoteRepository voteRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private PublicVotingService publicVotingService;

    private UUID eventId;
    private UUID trackId;
    private UUID teamId;
    private HackathonEvent openEvent;
    private Track track;
    private Team team;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        trackId = UUID.randomUUID();
        teamId = UUID.randomUUID();

        openEvent = HackathonEvent.builder()
                .name("SEAL Open Hackathon")
                .status(EventStatus.OPEN)
                .build();
        openEvent.setId(eventId);

        track = Track.builder()
                .event(openEvent)
                .name("Web Dev")
                .build();
        track.setId(trackId);

        team = Team.builder()
                .event(openEvent)
                .track(track)
                .name("Chien Binh SEAL")
                .build();
        team.setId(teamId);
    }

    @Test
    @DisplayName("Loc danh sach su kien co the binh chon (loai bo DRAFT va CANCELLED)")
    void listVotableEvents_ShouldFilterDraftAndCancelledEvents() {
        HackathonEvent draftEvent = HackathonEvent.builder().name("Draft").status(EventStatus.DRAFT).build();
        draftEvent.setId(UUID.randomUUID());
        HackathonEvent cancelledEvent = HackathonEvent.builder().name("Cancelled").status(EventStatus.CANCELLED).build();
        cancelledEvent.setId(UUID.randomUUID());

        when(eventService.list()).thenReturn(List.of(
                EventResponse.from(openEvent),
                EventResponse.from(draftEvent),
                EventResponse.from(cancelledEvent)
        ));

        List<EventResponse> results = publicVotingService.listVotableEvents();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("SEAL Open Hackathon");
    }

    @Test
    @DisplayName("Lay danh sach track theo su kien thanh cong")
    void listTracks_ShouldReturnTracksFromTrackService() {
        when(trackService.listByEvent(eventId)).thenReturn(List.of(TrackResponse.from(track)));

        List<TrackResponse> results = publicVotingService.listTracks(eventId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Web Dev");
        verify(trackService).listByEvent(eventId);
    }

    @Test
    @DisplayName("Bao loi khi lay danh sach track voi eventId null")
    void listTracks_WhenEventIdNull_ShouldThrowBadRequest() {
        assertThatThrownBy(() -> publicVotingService.listTracks(null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Mã sự kiện không được để trống");
    }

    @Test
    @DisplayName("Lay danh sach doi thi cong khai theo track")
    void listTeams_ShouldReturnPublicTeams() {
        when(teamRepository.findByTrackId(trackId)).thenReturn(List.of(team));

        List<PublicTeamResponse> results = publicVotingService.listTeams(trackId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Chien Binh SEAL");
    }

    @Test
    @DisplayName("Tong hop so luong binh chon va sap xep giam dan theo so phieu")
    void tallyByTrack_ShouldCalculateAndSortTallies() {
        UUID teamId2 = UUID.randomUUID();
        Team team2 = Team.builder().event(openEvent).track(track).name("Doi 2").build();
        team2.setId(teamId2);

        when(teamRepository.findByTrackId(trackId)).thenReturn(List.of(team, team2));

        VoteRepository.TeamVoteCount count1 = new VoteRepository.TeamVoteCount() {
            @Override public UUID getTeamId() { return teamId; }
            @Override public Long getVoteCount() { return 10L; }
        };
        VoteRepository.TeamVoteCount count2 = new VoteRepository.TeamVoteCount() {
            @Override public UUID getTeamId() { return teamId2; }
            @Override public Long getVoteCount() { return 25L; }
        };

        when(voteRepository.countGroupedByTeamForTrack(trackId)).thenReturn(List.of(count1, count2));

        List<TeamVoteTallyResponse> tallies = publicVotingService.tallyByTrack(trackId);

        assertThat(tallies).hasSize(2);
        assertThat(tallies.get(0).teamName()).isEqualTo("Doi 2");
        assertThat(tallies.get(0).voteCount()).isEqualTo(25L);
        assertThat(tallies.get(1).teamName()).isEqualTo("Chien Binh SEAL");
        assertThat(tallies.get(1).voteCount()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Bo phieu thanh cong, luu vote va ghi nhan audit")
    void castVote_Success_ShouldSaveVoteAndReturnToken() {
        CastVoteRequest request = new CastVoteRequest(teamId);
        UUID voterId = UUID.randomUUID();

        when(trackService.findOrThrow(trackId)).thenReturn(track);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(jwtService.resolveOrCreateVoterId("incoming-token")).thenReturn(voterId);
        when(jwtService.generateVoterToken(voterId)).thenReturn("new-jwt-token");
        when(voteRepository.findByTrackIdAndVoterIdHash(eq(trackId), anyString())).thenReturn(Optional.empty());
        when(voteRepository.countByTrackIdAndIpHash(eq(trackId), anyString())).thenReturn(3L);
        when(voteRepository.countByTeamId(teamId)).thenReturn(11L);

        VoteCastResponse response = publicVotingService.castVote(trackId, request, "incoming-token", "192.168.1.100");

        assertThat(response).isNotNull();
        assertThat(response.teamId()).isEqualTo(teamId);
        assertThat(response.teamVoteCount()).isEqualTo(11L);
        assertThat(response.voterToken()).isEqualTo("new-jwt-token");

        verify(voteRepository).save(any(Vote.class));
        verify(auditService).record(eq(null), eq(AuditAction.VOTE_CAST), eq("Team"), eq(teamId), eq(null), eq(trackId));
    }

    @Test
    @DisplayName("Doi binh chon sang doi khac (Switch vote) khi da vote cho doi cu")
    void castVote_WhenAlreadyVotedDifferentTeam_ShouldSwitchVote() {
        CastVoteRequest request = new CastVoteRequest(teamId);
        UUID voterId = UUID.randomUUID();
        UUID oldTeamId = UUID.randomUUID();
        Team oldTeam = Team.builder().event(openEvent).track(track).name("Old Team").build();
        oldTeam.setId(oldTeamId);

        Vote existingVote = Vote.builder().team(oldTeam).track(track).voterIdHash("hash").ipHash("old-ip").build();

        when(trackService.findOrThrow(trackId)).thenReturn(track);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(jwtService.resolveOrCreateVoterId("incoming-token")).thenReturn(voterId);
        when(jwtService.generateVoterToken(voterId)).thenReturn("new-jwt-token");
        when(voteRepository.findByTrackIdAndVoterIdHash(eq(trackId), anyString())).thenReturn(Optional.of(existingVote));
        when(voteRepository.countByTeamId(teamId)).thenReturn(5L);

        VoteCastResponse response = publicVotingService.castVote(trackId, request, "incoming-token", "192.168.1.100");

        assertThat(response).isNotNull();
        assertThat(response.teamId()).isEqualTo(teamId);
        assertThat(response.teamVoteCount()).isEqualTo(5L);
        assertThat(existingVote.getTeam()).isEqualTo(team);

        verify(voteRepository).save(existingVote);
        verify(auditService).record(eq(null), eq(AuditAction.VOTE_CAST), eq("Team"), eq(teamId), eq("SWITCHED_FROM:" + oldTeamId), eq(trackId));
    }

    @Test
    @DisplayName("Bao loi khi su kien khong o trang thai OPEN hoac ONGOING")
    void castVote_WhenEventNotOpen_ShouldThrowConflict() {
        openEvent.setStatus(EventStatus.CLOSED);
        CastVoteRequest request = new CastVoteRequest(teamId);

        when(trackService.findOrThrow(trackId)).thenReturn(track);

        assertThatThrownBy(() -> publicVotingService.castVote(trackId, request, null, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Sự kiện hiện không mở bình chọn");
    }

    @Test
    @DisplayName("Bao loi khi doi thi khong thuoc track duoc chon")
    void castVote_WhenTeamNotBelongToTrack_ShouldThrowBadRequest() {
        CastVoteRequest request = new CastVoteRequest(teamId);
        Track otherTrack = Track.builder().event(openEvent).name("Khac").build();
        otherTrack.setId(UUID.randomUUID());
        team.setTrack(otherTrack);

        when(trackService.findOrThrow(trackId)).thenReturn(track);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        assertThatThrownBy(() -> publicVotingService.castVote(trackId, request, null, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Đội thi không thuộc Hạng mục này");
    }

    @Test
    @DisplayName("Bao loi khi voter da tung binh chon cho dung doi thi nay roi")
    void castVote_WhenAlreadyVoted_ShouldThrowConflict() {
        CastVoteRequest request = new CastVoteRequest(teamId);
        UUID voterId = UUID.randomUUID();
        Vote existingVote = Vote.builder().team(team).track(track).voterIdHash("hash").ipHash("ip").build();

        when(trackService.findOrThrow(trackId)).thenReturn(track);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(jwtService.resolveOrCreateVoterId(any())).thenReturn(voterId);
        when(jwtService.generateVoterToken(voterId)).thenReturn("token");
        when(voteRepository.findByTrackIdAndVoterIdHash(eq(trackId), anyString())).thenReturn(Optional.of(existingVote));

        assertThatThrownBy(() -> publicVotingService.castVote(trackId, request, null, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Bạn đã bình chọn cho Hạng mục này rồi");
    }

    @Test
    @DisplayName("Bao loi khi mang IP da vuot qua tran gioi han binh chon")
    void castVote_WhenExceedIpCap_ShouldThrowConflict() {
        CastVoteRequest request = new CastVoteRequest(teamId);
        UUID voterId = UUID.randomUUID();

        when(trackService.findOrThrow(trackId)).thenReturn(track);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(jwtService.resolveOrCreateVoterId(any())).thenReturn(voterId);
        when(jwtService.generateVoterToken(voterId)).thenReturn("token");
        when(voteRepository.findByTrackIdAndVoterIdHash(eq(trackId), anyString())).thenReturn(Optional.empty());
        when(voteRepository.countByTrackIdAndIpHash(eq(trackId), anyString())).thenReturn(20L);

        assertThatThrownBy(() -> publicVotingService.castVote(trackId, request, null, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Đã đạt giới hạn số lượt bình chọn từ mạng này");
    }

    @Test
    @DisplayName("Huy binh chon thanh cong, xoa ban ghi vote va ghi nhan audit")
    void cancelVote_Success_ShouldDeleteVoteAndRecordAudit() {
        UUID voterId = UUID.randomUUID();
        Vote existingVote = Vote.builder().team(team).track(track).voterIdHash("hash").ipHash("ip").build();

        when(jwtService.resolveOrCreateVoterId("token")).thenReturn(voterId);
        when(voteRepository.findByTrackIdAndVoterIdHash(eq(trackId), anyString())).thenReturn(Optional.of(existingVote));

        publicVotingService.cancelVote(trackId, "token");

        verify(voteRepository).delete(existingVote);
        verify(auditService).record(eq(null), eq(AuditAction.VOTE_CAST), eq("Team"), eq(teamId), eq("VOTE_CANCELLED"), eq(trackId));
    }

    @Test
    @DisplayName("Lay thong tin my-vote tra ve teamId khi da binh chon")
    void getMyVote_WhenVoted_ShouldReturnVotedTeamId() {
        UUID voterId = UUID.randomUUID();
        Vote existingVote = Vote.builder().team(team).track(track).voterIdHash("hash").ipHash("ip").build();

        when(jwtService.resolveOrCreateVoterId("token")).thenReturn(voterId);
        when(voteRepository.findByTrackIdAndVoterIdHash(eq(trackId), anyString())).thenReturn(Optional.of(existingVote));

        var res = publicVotingService.getMyVote(trackId, "token");

        assertThat(res.votedTeamId()).isEqualTo(teamId);
    }

    @Test
    @DisplayName("Lay thong tin my-vote tra ve null khi chua binh chon")
    void getMyVote_WhenNotVoted_ShouldReturnNull() {
        UUID voterId = UUID.randomUUID();

        when(jwtService.resolveOrCreateVoterId("token")).thenReturn(voterId);
        when(voteRepository.findByTrackIdAndVoterIdHash(eq(trackId), anyString())).thenReturn(Optional.empty());

        var res = publicVotingService.getMyVote(trackId, "token");

        assertThat(res.votedTeamId()).isNull();
    }
}
