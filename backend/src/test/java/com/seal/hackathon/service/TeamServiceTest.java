package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.TeamMember;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.TeamInviteStatus;
import com.seal.hackathon.domain.enums.TeamMemberRole;
import com.seal.hackathon.dto.team.RegisterTrackRequest;
import com.seal.hackathon.dto.team.TeamInviteRequest;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.TeamInviteRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackRepository;
import com.seal.hackathon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiểm các luật nghiệp vụ mà TeamService giữ.
 *
 * Đây là service giữ nhiều luật của SRS §2.2 nhất — đội 3 đến 5 thành viên,
 * mỗi đội một hạng mục, chỉ đội trưởng mới thao tác — nhưng trước đó chưa có
 * test nào. Luật chỉ nằm trong tài liệu mà không có test thì không ai biết
 * lúc nào nó bị sửa mất.
 */
@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock private TeamRepository teamRepository;
    @Mock private TeamMemberRepository teamMemberRepository;
    @Mock private TeamInviteRepository teamInviteRepository;
    @Mock private UserRepository userRepository;
    @Mock private TrackRepository trackRepository;
    @Mock private EventService eventService;

    @InjectMocks private TeamService teamService;

    private UUID teamId;
    private UUID eventId;
    private UUID leaderId;
    private UUID memberId;
    private Team team;
    private HackathonEvent event;

    @BeforeEach
    void setUp() {
        teamId = UUID.randomUUID();
        eventId = UUID.randomUUID();
        leaderId = UUID.randomUUID();
        memberId = UUID.randomUUID();

        event = new HackathonEvent();
        event.setId(eventId);

        team = Team.builder().name("Alpha AI").event(event).build();
        team.setId(teamId);
    }

    /** Dựng một thành viên đội với vai trò cho trước. */
    private TeamMember member(UUID userId, String email, TeamMemberRole role) {
        User user = User.builder().fullName("Nguoi dung").email(email).build();
        user.setId(userId);
        TeamMember m = TeamMember.builder().team(team).user(user).roleInTeam(role).build();
        m.setId(UUID.randomUUID());
        return m;
    }

    /** Danh sách gồm một đội trưởng và (soLuong - 1) thành viên thường. */
    private List<TeamMember> membersOfSize(int soLuong) {
        List<TeamMember> ds = new ArrayList<>();
        ds.add(member(leaderId, "leader@demo.local", TeamMemberRole.LEADER));
        for (int i = 1; i < soLuong; i++) {
            ds.add(member(UUID.randomUUID(), "thanhvien" + i + "@demo.local", TeamMemberRole.MEMBER));
        }
        return ds;
    }

    private void choPhepTimDoi() {
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
    }

    private void laDoiTruong() {
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, leaderId))
                .thenReturn(Optional.of(member(leaderId, "leader@demo.local", TeamMemberRole.LEADER)));
    }

    // ---------------------------------------------------------------
    // Luật: chỉ đội trưởng mới được mời thành viên và đăng ký hạng mục
    // ---------------------------------------------------------------

    @Test
    @DisplayName("invite: thanh vien thuong khong duoc moi nguoi khac")
    void invite_ChanThanhVienThuong() {
        choPhepTimDoi();
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, memberId))
                .thenReturn(Optional.of(member(memberId, "tv@demo.local", TeamMemberRole.MEMBER)));

        assertThatThrownBy(() -> teamService.invite(teamId, new TeamInviteRequest("ai@demo.local"), memberId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Chỉ đội trưởng");

        verify(teamInviteRepository, never()).save(any());
    }

    @Test
    @DisplayName("invite: nguoi ngoai doi bi chan")
    void invite_ChanNguoiNgoaiDoi() {
        choPhepTimDoi();
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, memberId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.invite(teamId, new TeamInviteRequest("ai@demo.local"), memberId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không phải thành viên");
    }

    // ---------------------------------------------------------------
    // Luật SRS §2.2: đội có từ 3 đến 5 thành viên
    // ---------------------------------------------------------------

    @Test
    @DisplayName("invite: doi da du 5 nguoi thi khong moi them duoc")
    void invite_ChanKhiDaDu5Nguoi() {
        choPhepTimDoi();
        laDoiTruong();
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(membersOfSize(5));

        assertThatThrownBy(() -> teamService.invite(teamId, new TeamInviteRequest("nguoi6@demo.local"), leaderId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("tối đa (5)");

        verify(teamInviteRepository, never()).save(any());
    }

    @Test
    @DisplayName("invite: doi 4 nguoi van moi them duoc nguoi thu 5")
    void invite_ChoPhepKhiChuaDu5() {
        choPhepTimDoi();
        laDoiTruong();
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(membersOfSize(4));
        when(teamInviteRepository.existsByTeamIdAndInvitedEmailIgnoreCaseAndStatus(
                teamId, "nguoi5@demo.local", TeamInviteStatus.PENDING)).thenReturn(false);
        when(teamInviteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        teamService.invite(teamId, new TeamInviteRequest("Nguoi5@Demo.Local"), leaderId);

        verify(teamInviteRepository).save(any());
    }

    @Test
    @DisplayName("registerTrack: doi chua du 3 nguoi thi khong dang ky duoc hang muc")
    void registerTrack_ChanKhiChuaDu3Nguoi() {
        choPhepTimDoi();
        laDoiTruong();
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(membersOfSize(2));

        assertThatThrownBy(() -> teamService.registerTrack(
                teamId, new RegisterTrackRequest(UUID.randomUUID()), leaderId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("tối thiểu 3 thành viên");

        verify(teamRepository, never()).save(any());
    }

    // ---------------------------------------------------------------
    // Luật: hạng mục phải thuộc đúng sự kiện của đội, và chưa đủ chỗ
    // ---------------------------------------------------------------

    @Test
    @DisplayName("registerTrack: chan hang muc cua su kien khac")
    void registerTrack_ChanHangMucKhacSuKien() {
        choPhepTimDoi();
        laDoiTruong();
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(membersOfSize(3));

        HackathonEvent suKienKhac = new HackathonEvent();
        suKienKhac.setId(UUID.randomUUID());
        Track track = Track.builder().name("Hang muc la").event(suKienKhac).build();
        UUID trackId = UUID.randomUUID();
        track.setId(trackId);
        when(trackRepository.findById(trackId)).thenReturn(Optional.of(track));

        assertThatThrownBy(() -> teamService.registerTrack(
                teamId, new RegisterTrackRequest(trackId), leaderId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không thuộc sự kiện");

        verify(teamRepository, never()).save(any());
    }

    @Test
    @DisplayName("registerTrack: chan khi hang muc da du so doi toi da")
    void registerTrack_ChanKhiHangMucDaDay() {
        choPhepTimDoi();
        laDoiTruong();
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(membersOfSize(3));

        Track track = Track.builder().name("AI / Machine Learning").event(event).maxTeams(2).build();
        UUID trackId = UUID.randomUUID();
        track.setId(trackId);
        when(trackRepository.findById(trackId)).thenReturn(Optional.of(track));
        when(teamRepository.findByTrackId(trackId)).thenReturn(List.of(new Team(), new Team()));

        assertThatThrownBy(() -> teamService.registerTrack(
                teamId, new RegisterTrackRequest(trackId), leaderId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("đủ số lượng đội tối đa");
    }

    @Test
    @DisplayName("registerTrack: du 3 nguoi va hang muc hop le thi dang ky duoc")
    void registerTrack_ThanhCong() {
        choPhepTimDoi();
        laDoiTruong();
        when(teamMemberRepository.findByTeamId(teamId)).thenReturn(membersOfSize(3));

        Track track = Track.builder().name("AI / Machine Learning").event(event).build();
        UUID trackId = UUID.randomUUID();
        track.setId(trackId);
        when(trackRepository.findById(trackId)).thenReturn(Optional.of(track));
        when(teamRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(teamMemberRepository.findByTeamId(teamId)).thenReturn(membersOfSize(3));

        teamService.registerTrack(teamId, new RegisterTrackRequest(trackId), leaderId);

        assertThat(team.getTrack()).isEqualTo(track);
        verify(teamRepository).save(team);
    }
}
