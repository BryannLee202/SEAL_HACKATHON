import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// Các mock phải khai báo trước khi import component.
vi.mock("@/api/teamApi", () => ({
  teamApi: {
    getMyTeams: vi.fn(),
    getMyInvites: vi.fn(),
    createTeam: vi.fn(),
    inviteMember: vi.fn(),
    getTeam: vi.fn(),
    acceptInvite: vi.fn(),
    declineInvite: vi.fn(),
    removeMember: vi.fn(),
    registerTrack: vi.fn(),
    submitRound: vi.fn(),
    getSubmissionStatus: vi.fn(),
  },
}));

vi.mock("@/api/events", () => ({
  eventsApi: {
    list: vi.fn(),
    listRounds: vi.fn(),
    listTracks: vi.fn(),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { userId: "u1", email: "leader@demo.local", fullName: "Doi Truong", roles: [] },
    loading: false,
    hasRole: () => false,
    refreshPermissions: vi.fn(),
  }),
}));

import MyTeam from "./MyTeam";
import { teamApi } from "@/api/teamApi";
import { eventsApi } from "@/api/events";
import { ToastContainer } from "@/components/Toast";

function moTrang() {
  return render(
    <MemoryRouter>
      <ToastContainer />
      <MyTeam />
    </MemoryRouter>,
  );
}

describe("MyTeam — trang đội thi", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(teamApi.getMyTeams).mockResolvedValue([]);
    vi.mocked(teamApi.getMyInvites).mockResolvedValue([]);
    vi.mocked(eventsApi.list).mockResolvedValue([]);
    // Trang còn ba lần nạp phụ thuộc eventId/teamId. Để chúng chưa được mock thì
    // lời gọi trả về undefined và văng ra ngoài luồng sau khi test đã kết thúc —
    // lúc hiện lúc không tuỳ thứ tự chạy. Mock đủ cho hết hẳn.
    vi.mocked(eventsApi.listRounds).mockResolvedValue([]);
    vi.mocked(eventsApi.listTracks).mockResolvedValue([]);
    vi.mocked(teamApi.getSubmissionStatus).mockResolvedValue({ status: "PENDING" } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("render được khi thí sinh chưa có đội nào", async () => {
    moTrang();
    await waitFor(() => expect(teamApi.getMyTeams).toHaveBeenCalled());
    // Trang phải dựng xong, không văng lỗi.
    expect(document.body.textContent).toBeTruthy();
  });

  it("KHÔNG dùng alert() của trình duyệt nữa", async () => {
    // alert() chặn luồng, không tắt được và nằm ngoài giao diện của ứng dụng.
    // Trước đây trang này có 27 lời gọi alert(), toàn bộ bằng tiếng Anh.
    const alertGia = vi.fn();
    vi.stubGlobal("alert", alertGia);

    moTrang();
    await waitFor(() => expect(teamApi.getMyTeams).toHaveBeenCalled());

    await userEvent.click(screen.getByRole("button", { name: /Tạo đội/ }));

    expect(alertGia).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("nút và nhãn điều hướng bằng tiếng Việt", async () => {
    moTrang();
    await waitFor(() => expect(teamApi.getMyTeams).toHaveBeenCalled());

    expect(screen.getByRole("button", { name: /Đội của tôi/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Đăng xuất/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tạo đội/ })).toBeInTheDocument();
    expect(screen.getByText("Bạn chưa có đội nào")).toBeInTheDocument();
  });

  it("không còn chuỗi tiếng Anh nào hiện ra màn hình", async () => {
    moTrang();
    await waitFor(() => expect(teamApi.getMyTeams).toHaveBeenCalled());

    const chu = document.body.textContent ?? "";
    // Các cụm từng nằm trong alert() tiếng Anh trước đây.
    for (const cum of ["Please ", "Failed to ", "Unable to ", "successfully"]) {
      expect(chu).not.toContain(cum);
    }
  });

  it("placeholder ô nhập bằng tiếng Việt", async () => {
    moTrang();
    await waitFor(() => expect(teamApi.getMyTeams).toHaveBeenCalled());

    const oNhap = Array.from(document.querySelectorAll("input"));
    const placeholderAnh = oNhap
      .map((o) => o.getAttribute("placeholder") ?? "")
      .filter((t) => /^(Enter|Select|Type|Choose) /.test(t));

    expect(placeholderAnh).toEqual([]);
  });

  // -----------------------------------------------------------------
  // Đội trưởng đọc từ vai trò TRONG ĐỘI
  //
  // Trước đây là `hasRole("TEAM_LEADER")`, mà không nơi nào trong backend gán
  // vai trò đó — nên isTeamLeader LUÔN false và ba việc chính của đội trưởng
  // (mời thành viên, xoá thành viên, đăng ký hạng mục) bị chặn với tất cả mọi
  // người. Chú ý: mock useAuth ở trên cố tình để hasRole trả về false, đúng
  // như hệ thống thật.
  // -----------------------------------------------------------------

  const doiCoToiLamDoiTruong = [{
    id: "t1", name: "Mobile Next", eventId: "e1", trackName: null,
    members: [
      { userId: "u1", fullName: "Doi Truong", email: "leader@demo.local", roleInTeam: "LEADER" },
      { userId: "u2", fullName: "Thanh vien", email: "tv@demo.local", roleInTeam: "MEMBER" },
    ],
  }];

  it("đội trưởng thật thấy được nút mời thành viên", async () => {
    vi.mocked(teamApi.getMyTeams).mockResolvedValue(doiCoToiLamDoiTruong as never);

    moTrang();
    await waitFor(() => expect(teamApi.getMyTeams).toHaveBeenCalled());

    // hasRole("TEAM_LEADER") trả false trong mock, nên nếu nút này hiện ra thì
    // đúng là đang đọc từ roleInTeam chứ không phải từ vai trò hệ thống.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mời thành viên/ })).toBeInTheDocument(),
    );
  });

  it("thành viên thường KHÔNG thấy nút mời thành viên", async () => {
    const doiMaToiChiLaThanhVien = [{
      ...doiCoToiLamDoiTruong[0],
      members: [
        { userId: "khac", fullName: "Nguoi khac", email: "k@demo.local", roleInTeam: "LEADER" },
        { userId: "u1", fullName: "Doi Truong", email: "leader@demo.local", roleInTeam: "MEMBER" },
      ],
    }];
    vi.mocked(teamApi.getMyTeams).mockResolvedValue(doiMaToiChiLaThanhVien as never);

    moTrang();
    await waitFor(() => expect(teamApi.getMyTeams).toHaveBeenCalled());

    expect(screen.queryByRole("button", { name: /Mời thành viên/ })).not.toBeInTheDocument();
  });

  it("nhãn vai trò trong đội hiển thị bằng tiếng Việt", async () => {
    vi.mocked(teamApi.getMyTeams).mockResolvedValue(doiCoToiLamDoiTruong as never);

    moTrang();
    await waitFor(() => expect(teamApi.getMyTeams).toHaveBeenCalled());

    const chu = document.body.textContent ?? "";
    expect(chu).toContain("Đội trưởng");
    expect(chu).toContain("Thành viên");
  });
});
