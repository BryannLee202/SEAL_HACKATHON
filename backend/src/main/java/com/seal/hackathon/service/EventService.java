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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final HackathonEventRepository eventRepository;
    private final CriteriaTemplateRepository criteriaTemplateRepository;
    private final TrackRepository trackRepository;
    private final RoundRepository roundRepository;
    private final TeamRepository teamRepository;

    public EventService(HackathonEventRepository eventRepository,
                        CriteriaTemplateRepository criteriaTemplateRepository,
                        TrackRepository trackRepository,
                        RoundRepository roundRepository,
                        TeamRepository teamRepository) {
        this.eventRepository = eventRepository;
        this.criteriaTemplateRepository = criteriaTemplateRepository;
        this.trackRepository = trackRepository;
        this.roundRepository = roundRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional
    public EventResponse create(EventRequest request) {
        CriteriaTemplate template = null;
        if (request.baseCriteriaTemplateId() != null) {
            template = criteriaTemplateRepository.findById(request.baseCriteriaTemplateId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy mẫu tiêu chí"));
        }
        HackathonEvent event = HackathonEvent.builder()
                .name(request.name())
                .description(request.description())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .status(EventStatus.DRAFT)
                .baseCriteriaTemplate(template)
                .rblEnabled(request.rblEnabledOrDefault())
                .build();
        return EventResponse.from(eventRepository.save(event));
    }

    @Transactional(readOnly = true)
    public List<EventResponse> list() {
        return eventRepository.findAll().stream().map(this::toResponseWithCounts).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse get(UUID id) {
        return toResponseWithCounts(findOrThrow(id));
    }

    /**
     * Gắn ba số liệu đếm vào một sự kiện.
     *
     * Chỉ dùng cho hai đường đọc (list và get) — ba đường ghi bên dưới vẫn trả
     * EventResponse.from() vì màn hình gọi chúng không hiện mấy ô số liệu này.
     */
    private EventResponse toResponseWithCounts(HackathonEvent event) {
        UUID eventId = event.getId();
        return EventResponse.withCounts(
                event,
                trackRepository.countByEventId(eventId),
                roundRepository.countByEventId(eventId),
                teamRepository.countByEventId(eventId));
    }

    @Transactional
    public EventResponse update(UUID id, EventRequest request) {
        HackathonEvent event = findOrThrow(id);
        CriteriaTemplate template = event.getBaseCriteriaTemplate();
        if (request.baseCriteriaTemplateId() != null) {
            template = criteriaTemplateRepository.findById(request.baseCriteriaTemplateId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy mẫu tiêu chí"));
        }
        event.setName(request.name());
        event.setDescription(request.description());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setBaseCriteriaTemplate(template);
        event.setRblEnabled(request.rblEnabledOrDefault());
        return EventResponse.from(eventRepository.save(event));
    }

    /**
     * Các bước chuyển trạng thái hợp lệ của một sự kiện.
     *
     * Vòng đời SRS mô tả là MỘT CHIỀU: Nháp → Mở đăng ký → Đang diễn ra →
     * Kết thúc. Huỷ được từ bất kỳ trạng thái nào chưa kết thúc.
     *
     * Trước đây backend không kiểm gì — gọi thẳng API là quay được từ CLOSED
     * về DRAFT, tức là mở lại một sự kiện đã công bố kết quả, trong khi bảng
     * xếp hạng và giải thưởng đã trao vẫn còn nguyên.
     *
     * Bảng này ánh xạ đúng EVENT_STATUS_TRANSITIONS mà frontend đã có sẵn ở
     * frontend/src/types/index.ts, cộng thêm ACTIVE — giá trị không nằm trong
     * bảng của frontend nhưng V006__demo_seed_users.sql có seed thật, nên phải
     * cho nó một lối ra, không thì sự kiện demo bị kẹt.
     */
    private static final Map<EventStatus, Set<EventStatus>> BUOC_CHUYEN_HOP_LE = buildTransitions();

    private static Map<EventStatus, Set<EventStatus>> buildTransitions() {
        Map<EventStatus, Set<EventStatus>> m = new EnumMap<>(EventStatus.class);
        m.put(EventStatus.DRAFT, EnumSet.of(EventStatus.OPEN, EventStatus.CANCELLED));
        m.put(EventStatus.OPEN, EnumSet.of(EventStatus.ACTIVE, EventStatus.ONGOING, EventStatus.CANCELLED));
        m.put(EventStatus.ACTIVE, EnumSet.of(EventStatus.ONGOING, EventStatus.CLOSED, EventStatus.CANCELLED));
        m.put(EventStatus.ONGOING, EnumSet.of(EventStatus.CLOSED, EventStatus.CANCELLED));
        m.put(EventStatus.CLOSED, EnumSet.noneOf(EventStatus.class));
        m.put(EventStatus.CANCELLED, EnumSet.noneOf(EventStatus.class));
        return m;
    }

    @Transactional
    public EventResponse changeStatus(UUID id, EventStatus status) {
        HackathonEvent event = findOrThrow(id);
        assertBuocChuyenHopLe(event.getStatus(), status);
        event.setStatus(status);
        return EventResponse.from(eventRepository.save(event));
    }

    /**
     * Đặt lại đúng trạng thái đang có thì cho qua — giao diện có thể gửi lại
     * trạng thái hiện tại mà không có ý đổi gì, chặn chỗ đó chỉ gây phiền.
     */
    private void assertBuocChuyenHopLe(EventStatus hienTai, EventStatus moi) {
        if (hienTai == moi) {
            return;
        }
        Set<EventStatus> choPhep = BUOC_CHUYEN_HOP_LE.getOrDefault(hienTai, EnumSet.noneOf(EventStatus.class));
        if (!choPhep.contains(moi)) {
            throw ApiException.conflict(String.format(
                    "Không thể chuyển sự kiện từ %s sang %s. Các bước hợp lệ từ %s: %s",
                    hienTai, moi, hienTai,
                    choPhep.isEmpty() ? "không còn bước nào (trạng thái kết thúc)" : choPhep));
        }
    }

    HackathonEvent findOrThrow(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy sự kiện"));
    }
}
