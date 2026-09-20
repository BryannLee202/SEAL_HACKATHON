package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.MentorService;
import com.seal.hackathon.service.TeamFeedbackService;
import com.seal.hackathon.service.TeamService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.notNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phan quyen cho nhom doi thi, mentor va cac trang cong khai.
 *
 * Ba kieu bao ve khac nhau nam canh nhau o day, va tung kieu co mot cach sai
 * rieng:
 *
 * 1. MentorController khoa theo vai tro - sai kieu thong thuong.
 * 2. TeamController va TeamFeedbackController de cho tang service quyet dinh,
 *    vi quyen phu thuoc doi cu the chu khong phai vai tro. Cai de sai o day la
 *    QUEN TRUYEN principal xuong - service nhan null va moi phep kiem ben duoi
 *    mat cho dua, ma khong test service nao phat hien.
 * Rieng cac trang CONG KHAI (PublicRanking, PublicVoting) khong kiem duoc o
 * day: chung mo duoc la nho .requestMatchers("/api/public/**").permitAll()
 * trong SecurityConfig, ma lat cat @WebMvcTest khong nap SecurityConfig that.
 * Phan do nam o TrangCongKhaiMoTest, chay voi ca ngu canh ung dung.
 */
@WebMvcTest({
        TeamController.class,
        TeamFeedbackController.class,
        MentorController.class,
})
@Import(MethodSecurityTestConfig.class)
class DoiVaCongKhaiPhanQuyenTest extends PhanQuyenTestBase {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private TeamService teamService;
    @MockitoBean private TeamFeedbackService teamFeedbackService;
    @MockitoBean private MentorService mentorService;
    @MockitoBean private JwtService jwtService;

    // ------------------------------------------------------------------
    // 1. Mentor
    // ------------------------------------------------------------------

    @ParameterizedTest
    @EnumSource(value = RoleName.class, names = {"COORDINATOR", "JUDGE", "TEAM_MEMBER", "TEAM_LEADER"})
    @DisplayName("mentor/teams: chi MENTOR vao duoc, ke ca ban to chuc cung khong")
    void mentorTeams_ChanVaiTroKhac(RoleName vaiTro) throws Exception {
        mockMvc.perform(get("/api/mentor/teams").with(authentication(nguoiDung(vaiTro))))
                .andExpect(status().isForbidden());
        verifyNoInteractions(mentorService);
    }

    @Test
    @DisplayName("mentor/teams: MENTOR vao duoc")
    void mentorTeams_ChoPhepMentor() throws Exception {
        when(mentorService.listMyTeams(any())).thenReturn(List.of());
        mockMvc.perform(get("/api/mentor/teams").with(authentication(mentor())))
                .andExpect(status().isOk());
    }

    // ------------------------------------------------------------------
    // 2. Doi thi - quyen do tang service quyet dinh, nhung principal phai xuong
    // ------------------------------------------------------------------

    @Test
    @DisplayName("listEventTeams: chi BAN TO CHUC xem duoc danh sach doi cua ca su kien")
    void listEventTeams_ChanThiSinh() throws Exception {
        mockMvc.perform(get("/api/events/{id}/teams", UUID.randomUUID())
                        .with(authentication(thiSinh())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("getTeam: truyen principal xuong service de no con kiem quyen duoc")
    void getTeam_TruyenPrincipalXuongService() throws Exception {
        when(teamService.get(any(), any())).thenReturn(null);
        mockMvc.perform(get("/api/teams/{id}", UUID.randomUUID())
                        .with(authentication(thiSinh())))
                .andExpect(status().isOk());
        verify(teamService).get(any(), notNull());
    }

    @Test
    @DisplayName("doc trao doi mentor: truyen principal xuong service")
    void docTraoDoi_TruyenPrincipalXuongService() throws Exception {
        when(teamFeedbackService.list(any(), any())).thenReturn(List.of());
        mockMvc.perform(get("/api/teams/{id}/messages", UUID.randomUUID())
                        .with(authentication(thiSinh())))
                .andExpect(status().isOk());
        verify(teamFeedbackService).list(any(), notNull());
    }

    @Test
    @DisplayName("gui trao doi mentor: truyen principal xuong service")
    void guiTraoDoi_TruyenPrincipalXuongService() throws Exception {
        when(teamFeedbackService.post(any(), any(), any())).thenReturn(null);
        mockMvc.perform(post("/api/teams/{id}/messages", UUID.randomUUID())
                        .with(authentication(mentor())).with(csrf())
                        .contentType("application/json")
                        .content("{\"body\":\"Cac em nen do lai thoi gian phan hoi API\"}"))
                .andExpect(status().isOk());
        verify(teamFeedbackService).post(any(), any(), notNull());
    }
}
