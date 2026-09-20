package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.CriteriaTemplate;
import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.enums.EventStatus;
import com.seal.hackathon.dto.event.EventRequest;
import com.seal.hackathon.dto.event.EventResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriteriaTemplateRepository;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.repository.RoundRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Kiểm EventService — vòng đời sự kiện và các số liệu đếm gắn kèm.
 */
@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock private HackathonEventRepository eventRepository;
    @Mock private CriteriaTemplateRepository criteriaTemplateRepository;
    @Mock private TrackRepository trackRepository;
    @Mock private RoundRepository roundRepository;
    @Mock private TeamRepository teamRepository;

    @InjectMocks private EventService eventService;

    private UUID eventId;
    private HackathonEvent event;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        event = HackathonEvent.builder()
                .name("SEAL Hackathon 2026")
                .description("Su kien demo")
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 30))
                .status(EventStatus.DRAFT)
                .rblEnabled(true)
                .build();
        event.setId(eventId);
    }

    private EventRequest request(UUID templateId) {
        return new EventRequest("SEAL Hackathon 2026", "Su kien demo",
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30), templateId, true);
    }

    // ---------------------------------------------------------------
    // Tạo sự kiện
    // ---------------------------------------------------------------

    @Test
    @DisplayName("create: su kien moi luon bat dau o trang thai DRAFT")
    void create_LuonBatDauODRAFT() {
        when(eventRepository.save(any())).thenAnswer(inv -> {
            HackathonEvent e = inv.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });

        EventResponse res = eventService.create(request(null));

        assertThat(res.status()).isEqualTo(EventStatus.DRAFT);
    }

    @Test
    @DisplayName("create: bao loi khi mau tieu chi goc khong ton tai")
    void create_ChanMauTieuChiKhongTonTai() {
        UUID templateId = UUID.randomUUID();
        when(criteriaTemplateRepository.findById(templateId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.create(request(templateId)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy mẫu tiêu chí");

        verify(eventRepository, never()).save(any());
    }

    @Test
    @DisplayName("create: gan duoc mau tieu chi goc khi mau ton tai")
    void create_GanMauTieuChiGoc() {
        UUID templateId = UUID.randomUUID();
        CriteriaTemplate template = new CriteriaTemplate();
        template.setId(templateId);
        when(criteriaTemplateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(eventRepository.save(any())).thenAnswer(inv -> {
            HackathonEvent e = inv.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });

        EventResponse res = eventService.create(request(templateId));

        assertThat(res.baseCriteriaTemplateId()).isEqualTo(templateId);
    }

    // ---------------------------------------------------------------
    // Số liệu đếm gắn kèm khi đọc
    // ---------------------------------------------------------------

    @Test
    @DisplayName("get: gan dung so hang muc, vong thi va doi thi")
    void get_GanDungSoLieuDem() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(trackRepository.countByEventId(eventId)).thenReturn(3L);
        when(roundRepository.countByEventId(eventId)).thenReturn(2L);
        when(teamRepository.countByEventId(eventId)).thenReturn(6L);

        EventResponse res = eventService.get(eventId);

        assertThat(res.trackCount()).isEqualTo(3L);
        assertThat(res.roundCount()).isEqualTo(2L);
        assertThat(res.teamCount()).isEqualTo(6L);
    }

    @Test
    @DisplayName("get: bao loi ro rang khi su kien khong ton tai")
    void get_BaoLoiKhiKhongTonTai() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.get(eventId))
                .isInstanceOf(ApiException.class);
    }

    @Test
    @DisplayName("list: moi su kien deu duoc gan so lieu dem rieng")
    void list_GanSoLieuChoTungSuKien() {
        when(eventRepository.findAll()).thenReturn(List.of(event));
        when(trackRepository.countByEventId(eventId)).thenReturn(1L);
        when(roundRepository.countByEventId(eventId)).thenReturn(4L);
        when(teamRepository.countByEventId(eventId)).thenReturn(9L);

        List<EventResponse> res = eventService.list();

        assertThat(res).hasSize(1);
        assertThat(res.get(0).roundCount()).isEqualTo(4L);
        assertThat(res.get(0).teamCount()).isEqualTo(9L);
    }

    // ---------------------------------------------------------------
    // Vòng đời trạng thái
    // ---------------------------------------------------------------

    @Test
    @DisplayName("changeStatus: doi duoc trang thai va luu lai")
    void changeStatus_DoiDuocTrangThai() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EventResponse res = eventService.changeStatus(eventId, EventStatus.OPEN);

        assertThat(res.status()).isEqualTo(EventStatus.OPEN);
        verify(eventRepository).save(event);
    }

    // ---------------------------------------------------------------
    // Luật chuyển trạng thái
    //
    // Test changeStatus_ChuaChanBuocLui trước đây ghi nhận hành vi CHƯA có
    // luật và được để làm mốc. Nay luật đã thêm nên nó đỏ đúng như dự kiến, và
    // được thay bằng nhóm test dưới đây.
    // ---------------------------------------------------------------

    @Test
    @DisplayName("changeStatus: chan buoc lui CLOSED -> DRAFT")
    void changeStatus_ChanBuocLui() {
        event.setStatus(EventStatus.CLOSED);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.changeStatus(eventId, EventStatus.DRAFT))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không thể chuyển sự kiện từ CLOSED sang DRAFT");

        verify(eventRepository, never()).save(any());
    }

    @Test
    @DisplayName("changeStatus: su kien da HUY thi khong mo lai duoc")
    void changeStatus_ChanMoLaiSuKienDaHuy() {
        event.setStatus(EventStatus.CANCELLED);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.changeStatus(eventId, EventStatus.OPEN))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("trạng thái kết thúc");
    }

    @Test
    @DisplayName("changeStatus: chan nhay coc DRAFT -> CLOSED")
    void changeStatus_ChanNhayCoc() {
        event.setStatus(EventStatus.DRAFT);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> eventService.changeStatus(eventId, EventStatus.CLOSED))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không thể chuyển");
    }

    @Test
    @DisplayName("changeStatus: di dung vong doi mot chieu thi cho qua")
    void changeStatus_ChoPhepDungVongDoi() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        event.setStatus(EventStatus.DRAFT);
        assertThat(eventService.changeStatus(eventId, EventStatus.OPEN).status())
                .isEqualTo(EventStatus.OPEN);

        event.setStatus(EventStatus.OPEN);
        assertThat(eventService.changeStatus(eventId, EventStatus.ONGOING).status())
                .isEqualTo(EventStatus.ONGOING);

        event.setStatus(EventStatus.ONGOING);
        assertThat(eventService.changeStatus(eventId, EventStatus.CLOSED).status())
                .isEqualTo(EventStatus.CLOSED);
    }

    @Test
    @DisplayName("changeStatus: huy duoc tu moi trang thai chua ket thuc")
    void changeStatus_ChoPhepHuy() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        for (EventStatus tu : List.of(EventStatus.DRAFT, EventStatus.OPEN,
                EventStatus.ACTIVE, EventStatus.ONGOING)) {
            event.setStatus(tu);
            assertThat(eventService.changeStatus(eventId, EventStatus.CANCELLED).status())
                    .as("phai huy duoc tu %s", tu)
                    .isEqualTo(EventStatus.CANCELLED);
        }
    }

    /**
     * ACTIVE không nằm trong bảng EVENT_STATUS_TRANSITIONS của frontend, nhưng
     * V006__demo_seed_users.sql seed sự kiện demo với đúng trạng thái đó. Nếu
     * không cho nó lối ra thì sự kiện demo bị kẹt vĩnh viễn.
     */
    @Test
    @DisplayName("changeStatus: ACTIVE (trang thai V006 seed) van co loi ra")
    void changeStatus_ActiveKhongBiKet() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        event.setStatus(EventStatus.ACTIVE);
        assertThat(eventService.changeStatus(eventId, EventStatus.CLOSED).status())
                .isEqualTo(EventStatus.CLOSED);
    }

    @Test
    @DisplayName("changeStatus: dat lai dung trang thai dang co thi cho qua")
    void changeStatus_ChoPhepDatLaiChinhNo() {
        event.setStatus(EventStatus.CLOSED);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThat(eventService.changeStatus(eventId, EventStatus.CLOSED).status())
                .isEqualTo(EventStatus.CLOSED);
    }

    // ---------------------------------------------------------------
    // Co rblEnabled bo trong
    //
    // Truong nay truoc day la kieu nguyen thuy boolean. Jackson phai goi ham
    // dung chuan cua record voi du moi thanh phan, nen mot truong KHONG duoc
    // gui len se thanh null - va null khong ep duoc ve kieu nguyen thuy. Ket
    // qua la TOAN BO yeu cau bi tu choi chu khong phai truong do nhan gia tri
    // mac dinh.
    //
    // Form tao su kien o giao dien (EventsPage.tsx dong 210) chi gui name,
    // description, startDate va endDate. Nen truoc khi sua, ban to chuc khong
    // tao duoc su kien nao tu giao dien.
    // ---------------------------------------------------------------

    @Test
    @DisplayName("create: bo trong rblEnabled thi mac dinh la khong bat, khong phai loi")
    void create_BoTrongRblEnabledThiMacDinhTat() {
        when(eventRepository.save(any())).thenAnswer(inv -> {
            HackathonEvent e = inv.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });

        EventRequest yeuCau = new EventRequest(
                "SEAL Hackathon 2026", "mo ta",
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30),
                null, null);

        EventResponse ketQua = eventService.create(yeuCau);

        assertThat(ketQua.rblEnabled()).isFalse();
    }

    @Test
    @DisplayName("create: gui rblEnabled = true thi bat that")
    void create_GuiRblEnabledTrue() {
        when(eventRepository.save(any())).thenAnswer(inv -> {
            HackathonEvent e = inv.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });

        EventResponse ketQua = eventService.create(new EventRequest(
                "SEAL Hackathon 2026", "mo ta",
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30),
                null, true));

        assertThat(ketQua.rblEnabled()).isTrue();
    }

    @Test
    @DisplayName("rblEnabledOrDefault: null va false deu ra false, true ra true")
    void rblEnabledOrDefault_DoiChieuBaGiaTri() {
        assertThat(new EventRequest("x", null, null, null, null, null).rblEnabledOrDefault()).isFalse();
        assertThat(new EventRequest("x", null, null, null, null, false).rblEnabledOrDefault()).isFalse();
        assertThat(new EventRequest("x", null, null, null, null, true).rblEnabledOrDefault()).isTrue();
    }
}
