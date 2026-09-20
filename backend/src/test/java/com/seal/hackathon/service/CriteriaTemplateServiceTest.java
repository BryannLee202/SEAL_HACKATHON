package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.CriteriaTemplate;
import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.dto.criteria.CriteriaTemplateRequest;
import com.seal.hackathon.dto.criteria.CriteriaTemplateResponse;
import com.seal.hackathon.dto.criteria.CriterionRequest;
import com.seal.hackathon.dto.criteria.CriterionResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriteriaTemplateRepository;
import com.seal.hackathon.repository.CriterionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
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
 * Kiem thu UC-10 "Quan ly mau tieu chi cham diem" (CriteriaTemplateService).
 *
 * Mau tieu chi khong phai du lieu tham khao: RoundService.create() sao nguyen
 * xi tieu chi cua mau vao vong thi moi. Vi vay sai sot o mau se chay thang
 * xuong vong thi that, va tu do vao bang diem cua moi doi.
 *
 * Do la ly do nhom test addCriterion_* o duoi kiem tran trong so 100 NGAY TAI
 * MAU chu khong doi den luc tao vong thi moi kiem.
 */
@ExtendWith(MockitoExtension.class)
class CriteriaTemplateServiceTest {

    @Mock
    private CriteriaTemplateRepository templateRepository;

    @Mock
    private CriterionRepository criterionRepository;

    @Spy
    private CriterionWeightPolicy weightPolicy = new CriterionWeightPolicy();

    @InjectMocks
    private CriteriaTemplateService criteriaTemplateService;

    private UUID templateId;
    private CriteriaTemplate template;

    @BeforeEach
    void setUp() {
        templateId = UUID.randomUUID();
        template = CriteriaTemplate.builder()
                .name("Mẫu chuẩn SEAL 2025")
                .description("Bộ tiêu chí dùng chung cho mọi hạng mục")
                .isDefault(false)
                .build();
        template.setId(templateId);
    }

    private Criterion tieuChiCuaMau(CriteriaTemplate thuocMau, String ten, String trongSo) {
        Criterion c = Criterion.builder()
                .template(thuocMau)
                .name(ten)
                .weight(new BigDecimal(trongSo))
                .maxScore(new BigDecimal("10"))
                .build();
        c.setId(UUID.randomUUID());
        return c;
    }

    private CriterionRequest yeuCau(String ten, String trongSo) {
        return new CriterionRequest(ten, "mo ta", new BigDecimal(trongSo), new BigDecimal("10"));
    }

    private void choPhepLuuTieuChi() {
        when(criterionRepository.save(any(Criterion.class))).thenAnswer(inv -> {
            Criterion c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });
    }

    // ------------------------------------------------------------------
    // Tao va doc mau
    // ------------------------------------------------------------------

    @Test
    @DisplayName("create: Mau moi luon khong phai mau mac dinh va chua co tieu chi nao")
    void create_MauMoiKhongPhaiMacDinh() {
        when(templateRepository.save(any(CriteriaTemplate.class))).thenAnswer(inv -> {
            CriteriaTemplate t = inv.getArgument(0);
            t.setId(templateId);
            return t;
        });

        CriteriaTemplateResponse ketQua = criteriaTemplateService.create(
                new CriteriaTemplateRequest("Mẫu chuẩn SEAL 2025", "Dùng chung"));

        assertThat(ketQua.name()).isEqualTo("Mẫu chuẩn SEAL 2025");
        // Khong client nao duoc tu phong mau cua minh len lam mau mac dinh cua
        // he thong - co muon dat mac dinh thi phai la mot thao tac rieng.
        assertThat(ketQua.isDefault()).isFalse();
        assertThat(ketQua.criteria()).isEmpty();
    }

    @Test
    @DisplayName("get: Tra ve mau kem day du tieu chi cua no")
    void get_TraVeKemTieuChi() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(criterionRepository.findByTemplateId(templateId)).thenReturn(List.of(
                tieuChiCuaMau(template, "Sáng tạo", "40"),
                tieuChiCuaMau(template, "Kỹ thuật", "60")));

        CriteriaTemplateResponse ketQua = criteriaTemplateService.get(templateId);

        assertThat(ketQua.criteria()).hasSize(2);
        assertThat(ketQua.criteria()).extracting(CriterionResponse::name)
                .containsExactly("Sáng tạo", "Kỹ thuật");
        assertThat(ketQua.criteria().get(0).templateId()).isEqualTo(templateId);
        assertThat(ketQua.criteria().get(0).roundId())
                .as("tieu chi cua mau chua gan vao vong thi nao")
                .isNull();
    }

    @Test
    @DisplayName("get: Bao NotFound khi mau khong ton tai")
    void get_KhongTimThayMau() {
        UUID khongTonTai = UUID.randomUUID();
        when(templateRepository.findById(khongTonTai)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> criteriaTemplateService.get(khongTonTai))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy mẫu tiêu chí");
    }

    // ------------------------------------------------------------------
    // Tran trong so 100 tai mau
    // ------------------------------------------------------------------

    @Test
    @DisplayName("addCriterion: Chan khi tong trong so cua mau vuot qua 100")
    void addCriterion_ChanKhiVuotTran100() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(criterionRepository.findByTemplateId(templateId)).thenReturn(List.of(
                tieuChiCuaMau(template, "Sáng tạo", "40"),
                tieuChiCuaMau(template, "Kỹ thuật", "40")));

        assertThatThrownBy(() -> criteriaTemplateService.addCriterion(templateId, yeuCau("Thuyết trình", "30")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("vuot qua 100");

        // Mau hong khong duoc luu. Neu luu, RoundService.create() se sao no
        // thang vao vong thi that ma khong ai chan lai.
        verify(criterionRepository, never()).save(any());
    }

    @Test
    @DisplayName("addCriterion: Cho phep khi tong trong so cua mau vua dung 100")
    void addCriterion_ChoPhepKhiVuaDu100() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(criterionRepository.findByTemplateId(templateId)).thenReturn(List.of(
                tieuChiCuaMau(template, "Sáng tạo", "40"),
                tieuChiCuaMau(template, "Kỹ thuật", "40")));
        choPhepLuuTieuChi();

        CriterionResponse ketQua = criteriaTemplateService.addCriterion(templateId, yeuCau("Thuyết trình", "20"));

        assertThat(ketQua.name()).isEqualTo("Thuyết trình");
        assertThat(ketQua.weight()).isEqualByComparingTo("20");
        assertThat(ketQua.templateId()).isEqualTo(templateId);
    }

    @Test
    @DisplayName("addCriterion: Them tieu chi dau tien vao mau rong van duoc du chua du 100")
    void addCriterion_TieuChiDauTienVaoMauRong() {
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(template));
        when(criterionRepository.findByTemplateId(templateId)).thenReturn(List.of());
        choPhepLuuTieuChi();

        // Co y khong bat buoc du 100 ngay tu tieu chi dau - neu bat buoc thi
        // khong ai them duoc tieu chi nao ca.
        CriterionResponse ketQua = criteriaTemplateService.addCriterion(templateId, yeuCau("Sáng tạo", "40"));

        assertThat(ketQua.weight()).isEqualByComparingTo("40");
    }

    @Test
    @DisplayName("addCriterion: Bao NotFound khi them vao mau khong ton tai")
    void addCriterion_MauKhongTonTai() {
        UUID khongTonTai = UUID.randomUUID();
        when(templateRepository.findById(khongTonTai)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> criteriaTemplateService.addCriterion(khongTonTai, yeuCau("Sáng tạo", "40")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Không tìm thấy mẫu tiêu chí");

        verify(criterionRepository, never()).save(any());
    }

    // ------------------------------------------------------------------
    // Doi chieu tieu chi voi mau tren URL
    // ------------------------------------------------------------------

    @Test
    @DisplayName("removeCriterion: KHONG cho xoa tieu chi thuoc mau khac qua URL cua mau nay")
    void removeCriterion_ChanXoaTieuChiCuaMauKhac() {
        CriteriaTemplate mauKhac = CriteriaTemplate.builder().name("Mẫu hạng mục IoT").build();
        mauKhac.setId(UUID.randomUUID());
        Criterion cuaMauKhac = tieuChiCuaMau(mauKhac, "Tính khả thi", "30");

        when(criterionRepository.findById(cuaMauKhac.getId())).thenReturn(Optional.of(cuaMauKhac));

        assertThatThrownBy(() -> criteriaTemplateService.removeCriterion(templateId, cuaMauKhac.getId()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không thuộc mẫu này");

        verify(criterionRepository, never()).delete(any());
    }

    @Test
    @DisplayName("removeCriterion: KHONG cho xoa tieu chi cua vong thi (template null) qua duong mau")
    void removeCriterion_ChanXoaTieuChiCuaVongThi() {
        Criterion cuaVongThi = Criterion.builder().name("Sáng tạo").weight(new BigDecimal("40")).build();
        cuaVongThi.setId(UUID.randomUUID());

        when(criterionRepository.findById(cuaVongThi.getId())).thenReturn(Optional.of(cuaVongThi));

        // Tieu chi cua vong thi co template = null. Neu khong chan, mot tieu chi
        // dang duoc cham diem se bi xoa qua duong /api/criteria-templates.
        assertThatThrownBy(() -> criteriaTemplateService.removeCriterion(templateId, cuaVongThi.getId()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không thuộc mẫu này");

        verify(criterionRepository, never()).delete(any());
    }

    @Test
    @DisplayName("removeCriterion: Xoa duoc tieu chi dung mau")
    void removeCriterion_XoaDuocTieuChiDungMau() {
        Criterion cuaMauNay = tieuChiCuaMau(template, "Sáng tạo", "40");
        when(criterionRepository.findById(cuaMauNay.getId())).thenReturn(Optional.of(cuaMauNay));

        criteriaTemplateService.removeCriterion(templateId, cuaMauNay.getId());

        verify(criterionRepository).delete(cuaMauNay);
    }
}
