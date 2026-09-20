package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.MentorFeedbackMessage;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.domain.enums.FeedbackAuthorRole;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.dto.mentor.FeedbackMessageRequest;
import com.seal.hackathon.dto.mentor.FeedbackMessageResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.MentorFeedbackMessageRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.UserRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
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
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiem thu UC-19 "Trao doi giua Mentor va Doi thi" (TeamFeedbackService).
 *
 * Khung trao doi nay chua goi y chien luoc ma mentor danh rieng cho mot doi.
 * Neu doi khac doc duoc, hoac neu mentor cua hang muc Web doc duoc trao doi
 * cua hang muc AI, thi loi the canh tranh bi lo - va cuoc thi mat cong bang.
 *
 * Nhom test thu hai khang dinh mot diem thiet ke: vai tro tac gia LUON duoc
 * suy ra tu phia may chu. Client khong gui len duoc truong authorRole, nen
 * khong the gia danh MENTOR de loi khuyen cua minh trong co trong luong hon.
 */
@ExtendWith(MockitoExtension.class)
class TeamFeedbackServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private MentorFeedbackMessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private TeamFeedbackService teamFeedbackService;

    private UUID teamId;
    private UUID trackId;
    private Team team;

    @BeforeEach
    void setUp() {
        teamId = UUID.randomUUID();
        trackId = UUID.randomUUID();

        Track track = Track.builder().name("AI / Machine Learning").build();
        track.setId(trackId);

        team = Team.builder().name("TechTitans").track(track).build();
        team.setId(teamId);
    }

    private AuthenticatedPrincipal nguoiDung(AuthenticatedPrincipal.RoleGrant... vaiTro) {
        return new AuthenticatedPrincipal(UUID.randomUUID(), "a@b.com", "Nguoi dung", List.of(vaiTro));
    }

    /** Ban to chuc - xem duoc trao doi cua moi doi. */
    private AuthenticatedPrincipal banToChuc() {
        return nguoiDung(new AuthenticatedPrincipal.RoleGrant(
                RoleName.COORDINATOR, ScopeType.GLOBAL, null, null));
    }

    /** Mentor cua dung hang muc chua doi nay. */
    private AuthenticatedPrincipal mentorDungHangMuc() {
        return nguoiDung(new AuthenticatedPrincipal.RoleGrant(
                RoleName.MENTOR, ScopeType.TRACK, trackId, null));
    }

    /** Mentor nhung cua hang muc khac. */
    private AuthenticatedPrincipal mentorHangMucKhac() {
        return nguoiDung(new AuthenticatedPrincipal.RoleGrant(
                RoleName.MENTOR, ScopeType.TRACK, UUID.randomUUID(), null));
    }

    /** Thi sinh thuoc mot doi khac. */
    private AuthenticatedPrincipal thiSinhDoiKhac() {
        return nguoiDung(new AuthenticatedPrincipal.RoleGrant(
                RoleName.TEAM_MEMBER, ScopeType.GLOBAL, null, null));
    }

    private void choPhepLaThanhVien(AuthenticatedPrincipal principal, boolean laThanhVien) {
        lenient().when(teamMemberRepository.existsByTeamIdAndUserId(teamId, principal.userId()))
                .thenReturn(laThanhVien);
    }

    private void chuanBiLuuTinNhan(AuthenticatedPrincipal principal) {
        User tacGia = User.builder().email("a@b.com").fullName("Nguoi dung").build();
        tacGia.setId(principal.userId());
        lenient().when(userRepository.findById(principal.userId())).thenReturn(Optional.of(tacGia));
        lenient().when(messageRepository.save(any(MentorFeedbackMessage.class))).thenAnswer(inv -> {
            MentorFeedbackMessage m = inv.getArgument(0);
            m.setId(UUID.randomUUID());
            return m;
        });
    }

    // ------------------------------------------------------------------
    // Pham vi doc
    // ------------------------------------------------------------------

    @Test
    @DisplayName("list: Thanh vien cua doi doc duoc trao doi cua doi minh")
    void list_ThanhVienDocDuocTraoDoiCuaDoiMinh() {
        AuthenticatedPrincipal thanhVien = thiSinhDoiKhac();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        choPhepLaThanhVien(thanhVien, true);
        when(messageRepository.findByTeamIdWithAuthorOrderByCreatedAtAsc(teamId)).thenReturn(List.of());

        assertThat(teamFeedbackService.list(teamId, thanhVien)).isEmpty();
    }

    @Test
    @DisplayName("list: Thi sinh doi KHAC khong doc duoc trao doi cua doi nay")
    void list_ChanThiSinhDoiKhac() {
        AuthenticatedPrincipal nguoiLa = thiSinhDoiKhac();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        choPhepLaThanhVien(nguoiLa, false);

        assertThatThrownBy(() -> teamFeedbackService.list(teamId, nguoiLa))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không có quyền truy cập trao đổi");

        verify(messageRepository, never()).findByTeamIdWithAuthorOrderByCreatedAtAsc(any());
    }

    @Test
    @DisplayName("list: Mentor cua hang muc KHAC khong doc duoc trao doi cua doi nay")
    void list_ChanMentorHangMucKhac() {
        AuthenticatedPrincipal mentorLa = mentorHangMucKhac();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        choPhepLaThanhVien(mentorLa, false);

        assertThatThrownBy(() -> teamFeedbackService.list(teamId, mentorLa))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không có quyền truy cập trao đổi");

        verify(messageRepository, never()).findByTeamIdWithAuthorOrderByCreatedAtAsc(any());
    }

    @Test
    @DisplayName("list: Bao NotFound khi doi thi khong ton tai")
    void list_KhongTimThayDoi() {
        when(teamRepository.findById(teamId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamFeedbackService.list(teamId, banToChuc()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy đội thi");
    }

    // ------------------------------------------------------------------
    // Vai tro tac gia suy ra tu phia may chu
    // ------------------------------------------------------------------

    @Test
    @DisplayName("post: Thanh vien doi gui tin thi vai tro luu la TEAM_MEMBER")
    void post_ThanhVienDoiThiVaiTroLaTeamMember() {
        AuthenticatedPrincipal thanhVien = thiSinhDoiKhac();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        choPhepLaThanhVien(thanhVien, true);
        chuanBiLuuTinNhan(thanhVien);

        FeedbackMessageResponse ketQua = teamFeedbackService.post(
                teamId, new FeedbackMessageRequest("Nhóm em đã sửa phần đăng nhập ạ"), thanhVien);

        assertThat(ketQua.authorRole()).isEqualTo(FeedbackAuthorRole.TEAM_MEMBER);
        assertThat(ketQua.teamId()).isEqualTo(teamId);
    }

    @Test
    @DisplayName("post: Mentor dung hang muc gui tin thi vai tro luu la MENTOR")
    void post_MentorDungHangMucThiVaiTroLaMentor() {
        AuthenticatedPrincipal mentor = mentorDungHangMuc();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        choPhepLaThanhVien(mentor, false);
        chuanBiLuuTinNhan(mentor);

        FeedbackMessageResponse ketQua = teamFeedbackService.post(
                teamId, new FeedbackMessageRequest("Các em nên đo lại thời gian phản hồi API"), mentor);

        assertThat(ketQua.authorRole()).isEqualTo(FeedbackAuthorRole.MENTOR);
    }

    @Test
    @DisplayName("post: Thi sinh doi khac gui tin bi chan va khong luu gi")
    void post_ChanThiSinhDoiKhac() {
        AuthenticatedPrincipal nguoiLa = thiSinhDoiKhac();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        choPhepLaThanhVien(nguoiLa, false);

        assertThatThrownBy(() -> teamFeedbackService.post(
                teamId, new FeedbackMessageRequest("Cho mình xem ké với"), nguoiLa))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không có quyền truy cập trao đổi");

        verify(messageRepository, never()).save(any());
        verify(auditService, never()).record(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("post: Cat khoang trang thua o dau va cuoi noi dung truoc khi luu")
    void post_CatKhoangTrangThua() {
        AuthenticatedPrincipal mentor = mentorDungHangMuc();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        choPhepLaThanhVien(mentor, false);
        chuanBiLuuTinNhan(mentor);

        FeedbackMessageResponse ketQua = teamFeedbackService.post(
                teamId, new FeedbackMessageRequest("   Nhớ nộp trước 17h   \n"), mentor);

        assertThat(ketQua.body()).isEqualTo("Nhớ nộp trước 17h");
    }

    @Test
    @DisplayName("post: Ghi nhat ky kiem toan MENTOR_MESSAGE_SEND kem vai tro nguoi gui")
    void post_GhiNhatKyKiemToan() {
        AuthenticatedPrincipal mentor = mentorDungHangMuc();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        choPhepLaThanhVien(mentor, false);
        chuanBiLuuTinNhan(mentor);

        teamFeedbackService.post(teamId, new FeedbackMessageRequest("Góp ý kiến trúc"), mentor);

        verify(auditService).record(
                eq(mentor.userId()),
                eq(AuditAction.MENTOR_MESSAGE_SEND),
                eq("Team"),
                eq(teamId),
                isNull(),
                eq(FeedbackAuthorRole.MENTOR.name()));
    }

    @Test
    @DisplayName("post: Doi chua duoc xep hang muc thi mentor khong vao duoc, tranh NullPointerException")
    void post_DoiChuaCoHangMuc() {
        Team doiChuaCoHangMuc = Team.builder().name("Chưa phân hạng mục").track(null).build();
        doiChuaCoHangMuc.setId(teamId);

        AuthenticatedPrincipal mentor = mentorDungHangMuc();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(doiChuaCoHangMuc));
        choPhepLaThanhVien(mentor, false);

        assertThatThrownBy(() -> teamFeedbackService.post(
                teamId, new FeedbackMessageRequest("Chào các em"), mentor))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không có quyền truy cập trao đổi");
    }

    @Test
    @DisplayName("post: Ban to chuc vao duoc moi doi, ke ca doi chua co hang muc")
    void post_BanToChucVaoDuocMoiDoi() {
        Team doiChuaCoHangMuc = Team.builder().name("Chưa phân hạng mục").track(null).build();
        doiChuaCoHangMuc.setId(teamId);

        AuthenticatedPrincipal btc = banToChuc();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(doiChuaCoHangMuc));
        choPhepLaThanhVien(btc, false);
        chuanBiLuuTinNhan(btc);

        FeedbackMessageResponse ketQua = teamFeedbackService.post(
                teamId, new FeedbackMessageRequest("Nhắc lịch nộp bài"), btc);

        assertThat(ketQua.authorRole()).isEqualTo(FeedbackAuthorRole.MENTOR);
    }
}
