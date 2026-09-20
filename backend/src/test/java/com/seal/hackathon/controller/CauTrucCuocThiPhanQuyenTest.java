package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.CriteriaTemplateService;
import com.seal.hackathon.service.EventService;
import com.seal.hackathon.service.RoundCriterionService;
import com.seal.hackathon.service.RoundService;
import com.seal.hackathon.service.TrackService;
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
import java.util.stream.Stream;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phan quyen cho nhom endpoint DUNG NEN cuoc thi: su kien, vong thi, hang muc,
 * tieu chi va mau tieu chi.
 *
 * Khac voi nhom quan tri, cac controller o day chan theo TUNG PHUONG THUC chu
 * khong khoa ca lop - vi duong DOC phai mo cho moi nguoi da dang nhap (giam
 * khao can xem tieu chi de cham, thi sinh can xem vong thi va han nop).
 *
 * Kieu chan nay de sot hon han khoa ca lop: them mot phuong thuc ghi moi ma
 * quen dan @PreAuthorize thi khong co gi bao. Nen test o day liet ke DAY DU
 * cac duong GHI va bat tung cai mot.
 *
 * Neu cac endpoint nay lot ra ngoai: doi trong so tieu chi giua chung ket, doi
 * han nop bai, dong hoac mo lai su kien, xoa hang muc dang co doi thi dang ky.
 */
@WebMvcTest({
        EventController.class,
        RoundController.class,
        RoundCriterionController.class,
        TrackController.class,
        CriteriaTemplateController.class,
})
@Import(MethodSecurityTestConfig.class)
class CauTrucCuocThiPhanQuyenTest extends PhanQuyenTestBase {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private EventService eventService;
    @MockitoBean private RoundService roundService;
    @MockitoBean private RoundCriterionService roundCriterionService;
    @MockitoBean private TrackService trackService;
    @MockitoBean private CriteriaTemplateService criteriaTemplateService;
    @MockitoBean private JwtService jwtService;

    private static final String ID = "11111111-1111-1111-1111-111111111111";
    private static final String THAN_SU_KIEN =
            "{\"name\":\"SEAL Hackathon\",\"startDate\":\"2026-09-01\",\"endDate\":\"2026-09-30\"}";
    private static final String THAN_VONG =
            "{\"name\":\"Vong loai\",\"orderIndex\":1,\"submissionDeadline\":\"2026-09-20T17:00:00Z\"}";
    private static final String THAN_TIEU_CHI =
            "{\"name\":\"Sang tao\",\"weight\":30,\"maxScore\":10}";
    private static final String THAN_HANG_MUC = "{\"name\":\"AI\"}";
    private static final String THAN_MAU = "{\"name\":\"Mau chuan\"}";

    /** MOI duong GHI cua nam controller dung nen cuoc thi. */
    private static Stream<Arguments> duongGhi() {
        return Stream.of(
                Arguments.of(HttpMethod.POST, "/api/events", THAN_SU_KIEN),
                Arguments.of(HttpMethod.PUT, "/api/events/" + ID, THAN_SU_KIEN),
                Arguments.of(HttpMethod.PATCH, "/api/events/" + ID + "/status", "{\"status\":\"OPEN\"}"),
                Arguments.of(HttpMethod.POST, "/api/events/" + ID + "/rounds", THAN_VONG),
                Arguments.of(HttpMethod.PUT, "/api/rounds/" + ID, THAN_VONG),
                Arguments.of(HttpMethod.POST, "/api/rounds/" + ID + "/publish-results", null),
                Arguments.of(HttpMethod.POST, "/api/rounds/" + ID + "/criteria", THAN_TIEU_CHI),
                Arguments.of(HttpMethod.PUT, "/api/rounds/" + ID + "/criteria/" + ID, THAN_TIEU_CHI),
                Arguments.of(HttpMethod.DELETE, "/api/rounds/" + ID + "/criteria/" + ID, null),
                Arguments.of(HttpMethod.POST, "/api/events/" + ID + "/tracks", THAN_HANG_MUC),
                Arguments.of(HttpMethod.PUT, "/api/tracks/" + ID, THAN_HANG_MUC),
                Arguments.of(HttpMethod.DELETE, "/api/tracks/" + ID, null),
                Arguments.of(HttpMethod.POST, "/api/criteria-templates", THAN_MAU),
                Arguments.of(HttpMethod.POST, "/api/criteria-templates/" + ID + "/criteria", THAN_TIEU_CHI),
                Arguments.of(HttpMethod.DELETE, "/api/criteria-templates/" + ID + "/criteria/" + ID, null));
    }

    private static Stream<Arguments> duongGhiXVaiTro() {
        List<RoleName> vaiTro = List.of(RoleName.JUDGE, RoleName.MENTOR, RoleName.TEAM_MEMBER, RoleName.TEAM_LEADER);
        return duongGhi().flatMap(e -> vaiTro.stream()
                .map(r -> Arguments.of(e.get()[0], e.get()[1], e.get()[2], r)));
    }

    @ParameterizedTest(name = "{3} goi {0} {1} -> 403")
    @MethodSource("duongGhiXVaiTro")
    @DisplayName("Moi duong GHI cau truc cuoc thi chi danh cho ban to chuc")
    void duongGhi_ChanVaiTroKhac(HttpMethod phuongThuc, String duong, String than, RoleName vaiTro) throws Exception {
        var yc = request(phuongThuc, duong).with(authentication(nguoiDung(vaiTro))).with(csrf());
        if (than != null) {
            yc = yc.contentType("application/json").content(than);
        }
        mockMvc.perform(yc).andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "ban to chuc goi {0} {1} -> khong bi 403")
    @MethodSource("duongGhi")
    @DisplayName("Ban to chuc khong bi chan o duong ghi nao")
    void duongGhi_ChoPhepBanToChuc(HttpMethod phuongThuc, String duong, String than) throws Exception {
        var yc = request(phuongThuc, duong).with(authentication(banToChuc())).with(csrf());
        if (than != null) {
            yc = yc.contentType("application/json").content(than);
        }
        mockMvc.perform(yc).andExpect(r -> {
            if (r.getResponse().getStatus() == 403) {
                throw new AssertionError("Ban to chuc bi chan 403 o " + phuongThuc + " " + duong);
            }
        });
    }

    /** Duong DOC co y mo cho moi nguoi da dang nhap. */
    private static Stream<Arguments> duongDoc() {
        return Stream.of(
                Arguments.of("/api/events"),
                Arguments.of("/api/events/" + ID),
                Arguments.of("/api/events/" + ID + "/rounds"),
                Arguments.of("/api/rounds/" + ID),
                Arguments.of("/api/rounds/" + ID + "/criteria"),
                Arguments.of("/api/events/" + ID + "/tracks"),
                Arguments.of("/api/tracks/" + ID),
                Arguments.of("/api/criteria-templates"));
    }

    @ParameterizedTest(name = "giam khao doc duoc {0}")
    @MethodSource("duongDoc")
    @DisplayName("Duong DOC mo cho vai tro da dang nhap - giam khao can xem tieu chi de cham")
    void duongDoc_ChoPhepGiamKhao(String duong) throws Exception {
        mockMvc.perform(request(HttpMethod.GET, duong).with(authentication(giamKhao())))
                .andExpect(r -> {
                    if (r.getResponse().getStatus() == 403) {
                        throw new AssertionError("Giam khao bi chan 403 o GET " + duong
                                + " - khong xem duoc tieu chi thi khong cham duoc");
                    }
                });
    }
}
