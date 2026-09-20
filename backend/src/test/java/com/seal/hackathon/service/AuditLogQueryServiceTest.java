package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.AuditLog;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.dto.audit.AuditLogResponse;
import com.seal.hackathon.repository.AuditLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Kiem thu UC-30 "Xem nhat ky he thong" (AuditLogQueryService).
 *
 * Nhat ky kiem toan la bang chung khi co khieu nai ket qua cham thi, nen hai
 * thu phai dung tuyet doi:
 *   1. listRecent() phai tra ve BAN GHI MOI NHAT TRUOC. Neu ai do lo tay doi
 *      Sort.Direction.DESC thanh ASC thi man hinh se hien 20 dong dau tien tu
 *      ngay khoi tao he thong - trong van chay binh thuong, khong test nao do
 *      duoc tru test nay.
 *   2. Ban ghi do he thong tu sinh (actor = null, vi du job tu dong tinh
 *      xep hang cuoi vong) khong duoc lam vo trang. AuditLogResponse.from() phai
 *      doi null thanh "system".
 */
@ExtendWith(MockitoExtension.class)
class AuditLogQueryServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogQueryService auditLogQueryService;

    private AuditLog banGhi(User nguoiThucHien, AuditAction hanhDong, String loaiThucThe, UUID idThucThe) {
        AuditLog log = AuditLog.builder()
                .actor(nguoiThucHien)
                .action(hanhDong)
                .entityType(loaiThucThe)
                .entityId(idThucThe)
                .oldValueJson("{\"status\":\"PENDING\"}")
                .newValueJson("{\"status\":\"ON_TIME\"}")
                .timestamp(Instant.parse("2025-09-15T10:00:00Z"))
                .build();
        log.setId(UUID.randomUUID());
        return log;
    }

    private User nguoiDung(String hoTen) {
        User u = User.builder().email("bantochuc@seal.edu.vn").fullName(hoTen).build();
        u.setId(UUID.randomUUID());
        return u;
    }

    @Test
    @DisplayName("listRecent: LUON sap xep giam dan theo timestamp - moi nhat len dau")
    void listRecent_SapXepGiamDanTheoThoiGian() {
        when(auditLogRepository.findAll(any(Pageable.class))).thenReturn(Page.empty());

        auditLogQueryService.listRecent(0, 20);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(auditLogRepository).findAll(captor.capture());

        Sort.Order thuTu = captor.getValue().getSort().getOrderFor("timestamp");
        assertThat(thuTu)
                .as("phai sap xep theo cot timestamp")
                .isNotNull();
        assertThat(thuTu.getDirection())
                .as("phai la DESC de ban ghi moi nhat nam dau trang")
                .isEqualTo(Sort.Direction.DESC);
    }

    @Test
    @DisplayName("listRecent: Truyen dung so trang va kich thuoc trang xuong repository")
    void listRecent_TruyenDungThamSoPhanTrang() {
        when(auditLogRepository.findAll(any(Pageable.class))).thenReturn(Page.empty());

        auditLogQueryService.listRecent(3, 50);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        org.mockito.Mockito.verify(auditLogRepository).findAll(captor.capture());

        assertThat(captor.getValue().getPageNumber()).isEqualTo(3);
        assertThat(captor.getValue().getPageSize()).isEqualTo(50);
    }

    @Test
    @DisplayName("listRecent: Ban ghi do he thong tu sinh (actor null) hien ten la 'system'")
    void listRecent_ActorNullThiHienSystem() {
        AuditLog logHeThong = banGhi(null, AuditAction.RANKING_COMPUTE, "Round", UUID.randomUUID());
        when(auditLogRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(logHeThong)));

        Page<AuditLogResponse> ketQua = auditLogQueryService.listRecent(0, 20);

        assertThat(ketQua.getContent()).hasSize(1);
        assertThat(ketQua.getContent().get(0).actorName()).isEqualTo("system");
    }

    @Test
    @DisplayName("listByEntity: Loc dung theo loai thuc the va ID duoc yeu cau")
    void listByEntity_LocDungThucThe() {
        UUID submissionId = UUID.randomUUID();
        AuditLog log = banGhi(nguoiDung("Le Minh Tai"), AuditAction.SCORE_FINALIZE, "Submission", submissionId);
        Pageable trang = PageRequest.of(0, 10);

        when(auditLogRepository.findByEntityTypeAndEntityId(eq("Submission"), eq(submissionId), eq(trang)))
                .thenReturn(new PageImpl<>(List.of(log)));

        Page<AuditLogResponse> ketQua = auditLogQueryService.listByEntity("Submission", submissionId, trang);

        assertThat(ketQua.getContent()).hasSize(1);
        assertThat(ketQua.getContent().get(0).entityType()).isEqualTo("Submission");
        assertThat(ketQua.getContent().get(0).entityId()).isEqualTo(submissionId);
    }

    @Test
    @DisplayName("listByEntity: Giu nguyen gia tri cu va gia tri moi de doi chieu khi khieu nai")
    void listByEntity_GiuNguyenGiaTriCuVaMoi() {
        UUID submissionId = UUID.randomUUID();
        AuditLog log = banGhi(nguoiDung("Le Minh Tai"), AuditAction.SCORE_FINALIZE, "Submission", submissionId);
        Pageable trang = PageRequest.of(0, 10);

        when(auditLogRepository.findByEntityTypeAndEntityId("Submission", submissionId, trang))
                .thenReturn(new PageImpl<>(List.of(log)));

        AuditLogResponse dong = auditLogQueryService.listByEntity("Submission", submissionId, trang)
                .getContent().get(0);

        assertThat(dong.actorName()).isEqualTo("Le Minh Tai");
        assertThat(dong.action()).isEqualTo(AuditAction.SCORE_FINALIZE);
        assertThat(dong.oldValueJson()).isEqualTo("{\"status\":\"PENDING\"}");
        assertThat(dong.newValueJson()).isEqualTo("{\"status\":\"ON_TIME\"}");
        assertThat(dong.timestamp()).isEqualTo(Instant.parse("2025-09-15T10:00:00Z"));
    }

    @Test
    @DisplayName("listByEntity: Thuc the chua co thao tac nao thi tra ve trang rong, khong loi")
    void listByEntity_KhongCoBanGhiThiTraVeTrangRong() {
        UUID teamId = UUID.randomUUID();
        Pageable trang = PageRequest.of(0, 10);
        when(auditLogRepository.findByEntityTypeAndEntityId("Team", teamId, trang)).thenReturn(Page.empty());

        Page<AuditLogResponse> ketQua = auditLogQueryService.listByEntity("Team", teamId, trang);

        assertThat(ketQua.getContent()).isEmpty();
        assertThat(ketQua.getTotalElements()).isZero();
    }
}
