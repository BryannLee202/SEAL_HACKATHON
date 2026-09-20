package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.AuditLogQueryService;
import com.seal.hackathon.service.AuthService;
import com.seal.hackathon.service.DisqualificationService;
import com.seal.hackathon.service.JudgeAssignmentService;
import com.seal.hackathon.service.PrizeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phan quyen cho toan bo nhom endpoint QUAN TRI.
 *
 * Nam controller o day deu khoa @PreAuthorize("hasRole('COORDINATOR')") o MUC
 * LOP. Do la cach viet gon nhung cung de vo: chi can mot nguoi go dong
 * annotation tren lop - vi "them mot endpoint cho giam khao xem" chang han -
 * la TOAN BO endpoint cua lop do mo toang cung luc, khong mot test service nao
 * biet.
 *
 * Nen test o day quet theo kieu ma tran: moi endpoint x moi vai tro khong phai
 * ban to chuc, tat ca phai 403. Them mot endpoint moi vao cac lop nay thi bo
 * sung mot dong o duoi la no cung duoc bao ve.
 *
 * Nhung gi cac endpoint nay lam duoc, neu lot ra ngoai:
 *   - duyet / tu choi tai khoan, tao tai khoan giam khao khach
 *   - doc toan bo nhat ky kiem toan cua he thong
 *   - loai doi thi khoi cuoc thi
 *   - trao va thu hoi giai thuong
 *   - phan cong giam khao vao vong thi
 */
@WebMvcTest({
        AdminUserController.class,
        AuditLogController.class,
        DisqualificationController.class,
        PrizeController.class,
        JudgeAssignmentController.class,
})
@Import(MethodSecurityTestConfig.class)
class QuanTriPhanQuyenTest extends PhanQuyenTestBase {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private AuthService authService;
    @MockitoBean private AuditLogQueryService auditLogQueryService;
    @MockitoBean private DisqualificationService disqualificationService;
    @MockitoBean private PrizeService prizeService;
    @MockitoBean private JudgeAssignmentService judgeAssignmentService;
    @MockitoBean private JwtService jwtService;

    private static final String ID = "11111111-1111-1111-1111-111111111111";

    /** Moi endpoint quan tri, kem than yeu cau toi thieu de qua duoc buoc rang buoc. */
    private static Stream<Arguments> endpointQuanTri() {
        return Stream.of(
                Arguments.of(HttpMethod.GET, "/api/admin/users/pending", null),
                Arguments.of(HttpMethod.GET, "/api/admin/users/approved", null),
                Arguments.of(HttpMethod.POST, "/api/admin/users/" + ID + "/approval",
                        "{\"approve\":true}"),
                Arguments.of(HttpMethod.POST, "/api/admin/users/guest-judges",
                        "{\"fullName\":\"Giam khao khach\",\"email\":\"khach@seal.edu.vn\"}"),
                Arguments.of(HttpMethod.GET, "/api/admin/audit-logs?entityType=Team&entityId=" + ID, null),
                Arguments.of(HttpMethod.GET, "/api/admin/audit-logs/recent", null),
                Arguments.of(HttpMethod.POST, "/api/disqualifications",
                        "{\"targetType\":\"TEAM\",\"teamId\":\"" + ID + "\",\"reason\":\"vi pham quy che\"}"),
                Arguments.of(HttpMethod.GET, "/api/events/" + ID + "/disqualifications", null),
                Arguments.of(HttpMethod.POST, "/api/events/" + ID + "/prizes",
                        "{\"name\":\"Giai nhat\",\"rankCondition\":1}"),
                Arguments.of(HttpMethod.GET, "/api/events/" + ID + "/prizes", null),
                Arguments.of(HttpMethod.POST, "/api/events/" + ID + "/prizes/auto-assign?finalRoundId=" + ID, null),
                Arguments.of(HttpMethod.POST, "/api/prizes/" + ID + "/revoke", null),
                Arguments.of(HttpMethod.POST, "/api/rounds/" + ID + "/judges",
                        "{\"judgeUserId\":\"" + ID + "\",\"judgeType\":\"INTERNAL\"}"),
                Arguments.of(HttpMethod.GET, "/api/rounds/" + ID + "/judges", null),
                Arguments.of(HttpMethod.POST, "/api/tracks/" + ID + "/mentors",
                        "{\"mentorUserId\":\"" + ID + "\"}"));
    }

    private static Stream<Arguments> endpointXVaiTroKhongPhaiBanToChuc() {
        List<RoleName> vaiTro = List.of(RoleName.JUDGE, RoleName.MENTOR, RoleName.TEAM_MEMBER, RoleName.TEAM_LEADER);
        return endpointQuanTri().flatMap(e -> vaiTro.stream()
                .map(r -> Arguments.of(e.get()[0], e.get()[1], e.get()[2], r)));
    }

    @ParameterizedTest(name = "{3} goi {0} {1} -> 403")
    @MethodSource("endpointXVaiTroKhongPhaiBanToChuc")
    @DisplayName("Moi endpoint quan tri deu chan moi vai tro khong phai ban to chuc")
    void moiEndpointQuanTri_ChanVaiTroKhac(HttpMethod phuongThuc, String duong, String than, RoleName vaiTro)
            throws Exception {
        var yc = request(phuongThuc, duong)
                .with(authentication(nguoiDung(vaiTro)))
                .with(csrf());
        if (than != null) {
            yc = yc.contentType("application/json").content(than);
        }
        mockMvc.perform(yc).andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "ban to chuc goi {0} {1} -> khong bi 403")
    @MethodSource("endpointQuanTri")
    @DisplayName("Ban to chuc KHONG bi chan o bat ky endpoint quan tri nao")
    void moiEndpointQuanTri_ChoPhepBanToChuc(HttpMethod phuongThuc, String duong, String than) throws Exception {
        var yc = request(phuongThuc, duong)
                .with(authentication(banToChuc()))
                .with(csrf());
        if (than != null) {
            yc = yc.contentType("application/json").content(than);
        }
        // Chi quan tam KHONG phai 403. Service da bi mock nen ket qua nghiep vu
        // co the la 200 hoac 500 tuy phuong thuc tra ve null - deu khong sao,
        // dieu can chot la request di qua duoc cua phan quyen.
        mockMvc.perform(yc).andExpect(r -> {
            int ma = r.getResponse().getStatus();
            if (ma == 403) {
                throw new AssertionError("Ban to chuc bi chan 403 o " + phuongThuc + " " + duong);
            }
        });
    }
}
