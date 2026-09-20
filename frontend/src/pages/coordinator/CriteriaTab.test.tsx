import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../../api/criteria", async () => {
  const that = await vi.importActual<typeof import("../../api/criteria")>("../../api/criteria");
  return {
    ...that,
    listRoundCriteria: vi.fn(),
    listTemplates: vi.fn(),
    addRoundCriterion: vi.fn(),
    updateRoundCriterion: vi.fn(),
    removeRoundCriterion: vi.fn(),
    applyTemplateToRound: vi.fn(),
    // totalWeight và isWeightValid giữ NGUYÊN hàm thật: chúng là luật nghiệp vụ
    // đang được kiểm, mock đi thì test mất hết ý nghĩa.
  };
});

import CriteriaTab from "./CriteriaTab";
import * as criteriaApi from "../../api/criteria";

const vongThi = [
  { id: "r1", name: "Vòng loại", orderIndex: 1 },
  { id: "r2", name: "Chung kết", orderIndex: 2 },
] as never;

function moTab() {
  return render(<CriteriaTab eventId="e1" rounds={vongThi} tracks={[] as never} />);
}

function tieuChi(ten: string, trongSo: number) {
  return { id: ten, name: ten, description: "", weight: trongSo, maxScore: 10, roundId: "r1", templateId: null };
}

/**
 * CriteriaTab là nơi quyết định THƯỚC ĐO chấm điểm của cả cuộc thi. 500 dòng,
 * trước đây không có test nào.
 *
 * Luật quan trọng nhất ở đây là tổng trọng số phải bằng 100. Backend đã có luật
 * này (CriterionWeightPolicy) và đã được kiểm, nhưng backend chỉ CHẶN khi vượt
 * quá 100 — nó cố ý không bắt buộc đủ 100, vì nếu bắt buộc thì không ai thêm
 * được tiêu chí đầu tiên. Nghĩa là "tổng chưa đủ 100" chỉ có giao diện cảnh báo.
 * Nếu cảnh báo đó hỏng, ban tổ chức chốt bộ tiêu chí tổng 80 mà không ai biết,
 * và mọi điểm quy đổi đều sai.
 */
describe("CriteriaTab — bộ tiêu chí chấm điểm", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(criteriaApi.listTemplates).mockResolvedValue([] as never);
    vi.mocked(criteriaApi.listRoundCriteria).mockResolvedValue([] as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("hiện danh sách tiêu chí của vòng thi", async () => {
    vi.mocked(criteriaApi.listRoundCriteria).mockResolvedValue([
      tieuChi("Sáng tạo", 40),
      tieuChi("Kỹ thuật", 60),
    ] as never);

    moTab();

    await waitFor(() => expect(screen.getByText("Sáng tạo")).toBeInTheDocument());
    expect(screen.getByText("Kỹ thuật")).toBeInTheDocument();
  });

  it("tổng trọng số hiển thị đúng bằng tổng các tiêu chí", async () => {
    vi.mocked(criteriaApi.listRoundCriteria).mockResolvedValue([
      tieuChi("Sáng tạo", 40),
      tieuChi("Kỹ thuật", 35),
    ] as never);

    moTab();

    await waitFor(() => expect(screen.getByText("Sáng tạo")).toBeInTheDocument());
    // 40 + 35 = 75, chưa đủ 100.
    expect(document.body.textContent).toContain("75");
  });

  it("tổng chưa đủ 100 thì KHÁC với tổng vừa đủ 100 trên màn hình", async () => {
    vi.mocked(criteriaApi.listRoundCriteria).mockResolvedValue([
      tieuChi("Sáng tạo", 40),
      tieuChi("Kỹ thuật", 35),
    ] as never);
    const chuaDu = moTab();
    await waitFor(() => expect(screen.getByText("Sáng tạo")).toBeInTheDocument());
    const manChuaDu = document.body.textContent ?? "";
    chuaDu.unmount();

    vi.mocked(criteriaApi.listRoundCriteria).mockResolvedValue([
      tieuChi("Sáng tạo", 40),
      tieuChi("Kỹ thuật", 60),
    ] as never);
    moTab();
    await waitFor(() => expect(screen.getByText("Sáng tạo")).toBeInTheDocument());
    const manDu = document.body.textContent ?? "";

    // Backend cố ý KHÔNG chặn "tổng chưa đủ 100" (chặn thì không thêm được tiêu
    // chí đầu tiên), nên cảnh báo này chỉ có ở giao diện. Hỏng nó thì ban tổ
    // chức chốt bộ tiêu chí tổng 75 mà không ai biết.
    expect(manChuaDu).not.toBe(manDu);
  });

  it("vòng thi chưa có tiêu chí nào thì không báo lỗi", async () => {
    vi.mocked(criteriaApi.listRoundCriteria).mockResolvedValue([] as never);

    moTab();

    await waitFor(() => expect(criteriaApi.listRoundCriteria).toHaveBeenCalled());
    expect(document.body.textContent).not.toContain("Không thể tải");
  });

  it("totalWeight cộng đúng, kể cả khi trọng số là chuỗi", () => {
    // Backend trả BigDecimal, qua JSON có thể thành chuỗi. Number() trong
    // totalWeight lo việc đó — nếu ai bỏ đi thì "40" + "60" thành "4060".
    expect(criteriaApi.totalWeight([{ weight: 40 }, { weight: 60 }] as never)).toBe(100);
    expect(criteriaApi.totalWeight([{ weight: "40" }, { weight: "60" }] as never)).toBe(100);
  });

  it("isWeightValid chỉ đúng khi tổng bằng 100", () => {
    expect(criteriaApi.isWeightValid([{ weight: 40 }, { weight: 60 }] as never)).toBe(true);
    expect(criteriaApi.isWeightValid([{ weight: 40 }, { weight: 35 }] as never)).toBe(false);
    expect(criteriaApi.isWeightValid([{ weight: 50 }, { weight: 60 }] as never)).toBe(false);
  });
});
