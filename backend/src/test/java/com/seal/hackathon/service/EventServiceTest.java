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

    /**
     * Test này ghi nhận HÀNH VI HIỆN TẠI chứ không phải hành vi mong muốn.
     *
     * SRS mô tả vòng đời một chiều: Nháp → Mở đăng ký → Đang diễn ra → Kết thúc.
     * Frontend cũng đã có bảng EVENT_STATUS_TRANSITIONS trong
     * frontend/src/types/index.ts. Nhưng backend KHÔNG kiểm gì — gọi thẳng API
     * là quay được từ CLOSED về DRAFT, tức là mở lại một sự kiện đã công bố
     * kết quả.
     *
     * Để test ở đây làm mốc: ngày nào thêm luật chuyển trạng thái thì test này
     * sẽ đỏ, và đó là lúc sửa nó thành assertThatThrownBy.
     */
    @Test
    @DisplayName("changeStatus: HIEN TAI khong chan buoc lui CLOSED -> DRAFT (chua co luat)")
    void changeStatus_ChuaChanBuocLui() {
        event.setStatus(EventStatus.CLOSED);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EventResponse res = eventService.changeStatus(eventId, EventStatus.DRAFT);

        assertThat(res.status()).isEqualTo(EventStatus.DRAFT);
    }
}
