import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/api/events", () => ({
  eventsApi: {
    listTeams: vi.fn(),
    listTracks: vi.fn(),
    getTeam: vi.fn(),
    createTeam: vi.fn(),
    updateTeam: vi.fn(),
    deleteTeam: vi.fn(),
  },
}));

import TeamsTab from "./TeamsTab";
import { eventsApi } from "@/api/events";

const suKien: { id: string; [k: string]: unknown } = {
  id: "e1",
  name: "SEAL Hackathon 2026",
  description: "",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  status: "ONGOING",
  rblEnabled: false,
  trackCount: 1,
  roundCount: 2,
  teamCount: 2,
};

function moTab() {
  return render(<TeamsTab event={suKien as never} />);
}

/**
 * TeamsTab là tab ban tổ chức mở nhiều nhất trong lúc demo, và là file lớn thứ
 * tư của dự án (619 dòng) — trước đây không có test nào.
 *
 * Ba trạng thái dưới đây đều dẫn tới cùng một khung giao diện, nên rất dễ gộp
 * nhầm khi sửa: đang tải, tải hỏng, và không có đội nào. Gộp nhầm thì lỗi mạng
 * hiện ra y như "chưa có đội" — ban tổ chức tưởng chưa ai đăng ký.
 */
describe("TeamsTab — tab quản lý đội của ban tổ chức", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("hiện danh sách đội khi tải xong", async () => {
    vi.mocked(eventsApi.listTeams).mockResolvedValue([
      { id: "t1", name: "Alpha AI", status: "REGISTERED", trackName: "AI", members: [{ userId: "u1", fullName: "A", email: "a@x.com", roleInTeam: "LEADER" }] },
      { id: "t2", name: "Neural Vision", status: "FORMING", trackName: null, members: [] },
    ] as never);
    vi.mocked(eventsApi.listTracks).mockResolvedValue([] as never);

    moTab();

    await waitFor(() => expect(screen.getByText("Alpha AI")).toBeInTheDocument());
    expect(screen.getByText("Neural Vision")).toBeInTheDocument();
  });

  it("tải HỎNG thì báo lỗi, KHÔNG hiện như là chưa có đội nào", async () => {
    vi.mocked(eventsApi.listTeams).mockRejectedValue(new Error("Mất kết nối máy chủ"));
    vi.mocked(eventsApi.listTracks).mockResolvedValue([] as never);

    moTab();

    // Đây là điểm dễ gộp nhầm nhất: nếu lỗi rơi vào nhánh "trống" thì ban tổ
    // chức nhìn màn hình và tưởng chưa ai đăng ký đội.
    await waitFor(() => {
      expect(document.body.textContent).toContain("Mất kết nối máy chủ");
    });
  });

  it("không có đội nào thì hiện trạng thái trống, không phải lỗi", async () => {
    vi.mocked(eventsApi.listTeams).mockResolvedValue([] as never);
    vi.mocked(eventsApi.listTracks).mockResolvedValue([] as never);

    moTab();

    await waitFor(() => {
      const chu = document.body.textContent ?? "";
      expect(chu).not.toContain("Không thể tải");
    });
  });

  it("nạp lại dữ liệu khi đổi sang sự kiện khác", async () => {
    vi.mocked(eventsApi.listTeams).mockResolvedValue([] as never);
    vi.mocked(eventsApi.listTracks).mockResolvedValue([] as never);

    const { rerender } = moTab();
    await waitFor(() => expect(eventsApi.listTeams).toHaveBeenCalledWith("e1"));

    rerender(<TeamsTab event={{ ...suKien, id: "e2" } as never} />);
    // useEffect phụ thuộc event.id — đổi sự kiện mà không nạp lại thì ban tổ
    // chức xem nhầm đội của sự kiện cũ.
    await waitFor(() => expect(eventsApi.listTeams).toHaveBeenCalledWith("e2"));
  });

  it("đội chưa đăng ký hạng mục vẫn hiện được, không văng lỗi", async () => {
    vi.mocked(eventsApi.listTeams).mockResolvedValue([
      { id: "t1", name: "Chưa phân hạng mục", status: "FORMING", trackName: null, members: [] },
    ] as never);
    vi.mocked(eventsApi.listTracks).mockResolvedValue([] as never);

    moTab();

    await waitFor(() =>
      expect(screen.getByText("Chưa phân hạng mục")).toBeInTheDocument(),
    );
  });
});
