package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Prize;
import com.seal.hackathon.domain.entity.Ranking;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.dto.prize.PrizeRequest;
import com.seal.hackathon.dto.prize.PrizeResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.PrizeRepository;
import com.seal.hackathon.repository.RankingRepository;
import com.seal.hackathon.repository.TrackRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrizeServiceTest {

    @Mock
    private PrizeRepository prizeRepository;
    @Mock
    private TrackRepository trackRepository;
    @Mock
    private RankingRepository rankingRepository;
    @Mock
    private EventService eventService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private PrizeService prizeService;

    private UUID eventId;
    private UUID trackId;
    private UUID prizeId;
    private UUID roundId;
    private UUID actorId;
    private HackathonEvent event;
    private Track track;
    private Team team;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        trackId = UUID.randomUUID();
        prizeId = UUID.randomUUID();
        roundId = UUID.randomUUID();
        actorId = UUID.randomUUID();

        event = HackathonEvent.builder()
                .name("Cuoc Thi SEAL 2026")
                .build();
        event.setId(eventId);

        track = Track.builder()
                .event(event)
                .name("AI Track")
                .build();
        track.setId(trackId);

        team = Team.builder()
                .name("Doi Vang")
                .track(track)
                .build();
        team.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Tao giai thuong theo track thanh cong")
    void create_WithEventAndTrack_ShouldSaveAndReturnResponse() {
        PrizeRequest request = new PrizeRequest("Giai Nhat AI", trackId, 1);

        when(eventService.findOrThrow(eventId)).thenReturn(event);
        when(trackRepository.findById(trackId)).thenReturn(Optional.of(track));
        when(prizeRepository.save(any(Prize.class))).thenAnswer(invocation -> {
            Prize p = invocation.getArgument(0);
            p.setId(prizeId);
            return p;
        });

        PrizeResponse response = prizeService.create(eventId, request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(prizeId);
        assertThat(response.eventId()).isEqualTo(eventId);
        assertThat(response.trackId()).isEqualTo(trackId);
        assertThat(response.name()).isEqualTo("Giai Nhat AI");
        assertThat(response.rankCondition()).isEqualTo(1);
        assertThat(response.revoked()).isFalse();

        verify(prizeRepository).save(any(Prize.class));
    }

    @Test
    @DisplayName("Bao loi khi tao giai thuong voi track khong ton tai")
    void create_WhenTrackNotFound_ShouldThrowNotFound() {
        PrizeRequest request = new PrizeRequest("Giai Nhat", trackId, 1);

        when(eventService.findOrThrow(eventId)).thenReturn(event);
        when(trackRepository.findById(trackId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prizeService.create(eventId, request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy Hạng mục");
    }

    @Test
    @DisplayName("Lay danh sach giai thuong theo su kien")
    void listByEvent_ShouldReturnListOfPrizes() {
        Prize prize = Prize.builder()
                .event(event)
                .track(track)
                .name("Giai Nhat")
                .rankCondition(1)
                .revoked(false)
                .build();
        prize.setId(prizeId);

        when(prizeRepository.findByEventId(eventId)).thenReturn(List.of(prize));

        List<PrizeResponse> results = prizeService.listByEvent(eventId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Giai Nhat");
        verify(prizeRepository).findByEventId(eventId);
    }

    @Test
    @DisplayName("Tu dong trao giai theo ket qua xep hang cua track va ghi nhan audit")
    void autoAssign_WithTrackPrize_ShouldAssignTeamAndAudit() {
        Prize prize = Prize.builder()
                .event(event)
                .track(track)
                .name("Giai Nhat Track")
                .rankCondition(1)
                .revoked(false)
                .build();
        prize.setId(prizeId);

        Ranking ranking = Ranking.builder()
                .team(team)
                .rankInTrack(1)
                .build();

        when(prizeRepository.findByEventId(eventId)).thenReturn(List.of(prize));
        // autoAssign nay nap toan bo bang xep hang mot lan roi tra trong bo nho,
        // thay vi mot cau truy van cho moi giai thuong.
        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId))
                .thenReturn(List.of(ranking));

        List<PrizeResponse> results = prizeService.autoAssign(eventId, roundId, actorId);

        assertThat(results).hasSize(1);
        assertThat(prize.getAwardedTeam()).isEqualTo(team);
        verify(prizeRepository).save(prize);
        verify(auditService).record(eq(actorId), eq(AuditAction.PRIZE_AWARD), eq("Prize"), eq(prizeId), eq(null), eq(team.getId()));
    }

    @Test
    @DisplayName("Bo qua giai thuong da bi thu hoi khi tu dong trao giai")
    void autoAssign_WhenPrizeIsRevoked_ShouldSkip() {
        Prize prize = Prize.builder()
                .event(event)
                .track(track)
                .name("Giai Da Huy")
                .rankCondition(1)
                .revoked(true)
                .build();
        prize.setId(prizeId);

        when(prizeRepository.findByEventId(eventId)).thenReturn(List.of(prize));

        List<PrizeResponse> results = prizeService.autoAssign(eventId, roundId, actorId);

        assertThat(results).hasSize(1);
        verify(prizeRepository, never()).save(prize);
        verify(auditService, never()).record(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Thu hoi giai thuong thanh cong va ghi nhan audit")
    void revoke_WhenPrizeFound_ShouldSetRevokedAndAudit() {
        Prize prize = Prize.builder()
                .event(event)
                .track(track)
                .name("Giai Can Thu Hoi")
                .rankCondition(1)
                .revoked(false)
                .build();
        prize.setId(prizeId);

        when(prizeRepository.findById(prizeId)).thenReturn(Optional.of(prize));
        when(prizeRepository.save(prize)).thenReturn(prize);

        PrizeResponse response = prizeService.revoke(prizeId, actorId);

        assertThat(response).isNotNull();
        assertThat(response.revoked()).isTrue();
        assertThat(prize.isRevoked()).isTrue();

        verify(prizeRepository).save(prize);
        verify(auditService).record(eq(actorId), eq(AuditAction.PRIZE_AWARD), eq("Prize"), eq(prizeId), eq("awarded"), eq("revoked"));
    }

    @Test
    @DisplayName("Bao loi khi thu hoi giai thuong khong ton tai")
    void revoke_WhenPrizeNotFound_ShouldThrowNotFound() {
        when(prizeRepository.findById(prizeId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prizeService.revoke(prizeId, actorId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy giải thưởng");
    }

    @Test
    @DisplayName("autoAssign: chi nap bang xep hang MOT lan du co nhieu giai thuong")
    void autoAssign_ChiNapBangXepHangMotLan() {
        Prize giaiNhat = Prize.builder().event(event).track(track)
                .name("Giai Nhat Track").rankCondition(1).revoked(false).build();
        giaiNhat.setId(UUID.randomUUID());
        Prize giaiNhi = Prize.builder().event(event).track(track)
                .name("Giai Nhi Track").rankCondition(2).revoked(false).build();
        giaiNhi.setId(UUID.randomUUID());
        Prize giaiBa = Prize.builder().event(event).track(track)
                .name("Giai Ba Track").rankCondition(3).revoked(false).build();
        giaiBa.setId(UUID.randomUUID());

        Ranking r1 = Ranking.builder().team(team).rankInTrack(1).build();

        when(prizeRepository.findByEventId(eventId)).thenReturn(List.of(giaiNhat, giaiNhi, giaiBa));
        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId)).thenReturn(List.of(r1));

        prizeService.autoAssign(eventId, roundId, actorId);

        // Ba giai thuong nhung chi mot cau truy van bang xep hang...
        verify(rankingRepository, times(1)).findByRoundIdOrderByRankOverallAsc(roundId);
        // ...va tuyet doi khong goi cac ham tra tung giai mot.
        verify(rankingRepository, never()).findByRoundIdAndTeam_Track_IdAndRankInTrack(any(), any(), any());
        verify(rankingRepository, never()).findByRoundIdAndRankOverall(any(), any());
    }
}
