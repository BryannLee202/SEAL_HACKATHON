import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { RoleName } from "@/api/types";

const vaiTroHienTai: { roles: { roleName: RoleName; scopeType: string; scopeId: string | null; judgeType: string | null }[] } = {
  roles: [],
};

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { userId: "u1", email: "a@demo.local", fullName: "Nguoi Dung", roles: vaiTroHienTai.roles },
    loading: false,
    hasRole: (r: RoleName) => vaiTroHienTai.roles.some((g) => g.roleName === r),
    refreshPermissions: vi.fn(),
  }),
}));

vi.mock("@/api/client", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
  onUnauthorized: () => () => {},
}));

vi.mock("@/api/teamApi", () => ({
  teamApi: { getMyTeams: vi.fn(), getMyInvites: vi.fn(), getSubmissionStatus: vi.fn() },
}));

vi.mock("@/api/mentorApi", () => ({
  mentorApi: { listMyTeams: vi.fn() },
}));

import { DashboardPage } from "./DashboardPage";
import { api } from "@/api/client";
import { teamApi } from "@/api/teamApi";
import { mentorApi } from "@/api/mentorApi";

function datVaiTro(...ten: RoleName[]) {
  vaiTroHienTai.roles = ten.map((roleName) => ({
    roleName,
    scopeType: "GLOBAL",
    scopeId: null,
    judgeType: null,
  }));
}

function moTrang() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

/**
 * DashboardPage là màn đầu tiên mọi vai trò nhìn thấy sau khi đăng nhập, và là
 * file lớn thứ hai của dự án (856 dòng) — trước đây không có test nào.
 *
 * Điều đáng giữ nhất ở đây không phải từng con số trên thẻ thống kê, mà là:
 * MỖI VAI TRÒ THẤY ĐÚNG PHẦN CỦA MÌNH. Trang này rẽ nhánh bằng bốn cờ
 * isCoordinator / isJudge / isTeam / isMentor; một lần sửa nhầm điều kiện là
 * ban tổ chức thấy màn giám khảo, hoặc thí sinh thấy lối tắt quản trị — mà
 * trang vẫn render bình thường nên không có gì báo.
 */
describe("DashboardPage — trang chủ theo vai trò", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.get).mockResolvedValue({ data: [] } as never);
    vi.mocked(teamApi.getMyTeams).mockResolvedValue([]);
    vi.mocked(teamApi.getMyInvites).mockResolvedValue([]);
    vi.mocked(mentorApi.listMyTeams).mockResolvedValue([] as never);
    datVaiTro();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("chào đúng tên người đang đăng nhập, bằng tiếng Việt có dấu", async () => {
    datVaiTro("TEAM_MEMBER");
    moTrang();
    await waitFor(() => {
      expect(document.body.textContent).toContain("Nguoi Dung");
    });
    // "Xin chao" (không dấu) từng nằm nguyên trong translations.ts — đây là
    // dòng chữ ĐẦU TIÊN mọi người thấy sau khi đăng nhập.
    expect(document.body.textContent).toContain("Xin chào");
  });

  it("hiển thị được cho mọi vai trò mà không văng lỗi", async () => {
    for (const vai of ["COORDINATOR", "JUDGE", "MENTOR", "TEAM_MEMBER"] as RoleName[]) {
      datVaiTro(vai);
      const { unmount } = moTrang();
      await waitFor(() => expect(document.body.textContent).toBeTruthy());
      unmount();
    }
  });

  it("mỗi vai trò thấy đúng bảng của mình, không thấy bảng của vai khác", async () => {
    // Trang rẽ nhánh bằng bốn cờ isCoordinator / isJudge / isTeam / isMentor.
    // Một lần sửa nhầm điều kiện là ban tổ chức thấy màn giám khảo — mà trang
    // vẫn render bình thường nên không có gì báo.
    datVaiTro("COORDINATOR");
    const btc = moTrang();
    await waitFor(() => expect(document.body.textContent).toContain("Tổng quan Ban tổ chức"));
    expect(document.body.textContent).not.toContain("Tổng quan chấm điểm");
    btc.unmount();

    datVaiTro("JUDGE");
    const gk = moTrang();
    await waitFor(() => expect(document.body.textContent).toContain("Tổng quan chấm điểm"));
    expect(document.body.textContent).not.toContain("Tổng quan Ban tổ chức");
    gk.unmount();
  });

  it("giám khảo chưa được phân công vòng nào thì được báo rõ, không phải màn trắng", async () => {
    datVaiTro("JUDGE");
    moTrang();
    await waitFor(() =>
      expect(document.body.textContent).toContain("chưa được phân công vòng thi nào"),
    );
  });

  it("nhãn vai trò hiển thị bằng tiếng Việt, không phải mã enum", async () => {
    datVaiTro("COORDINATOR");
    moTrang();
    await waitFor(() => expect(document.body.textContent).toBeTruthy());

    const chu = document.body.textContent ?? "";
    // roleLabel() đổi COORDINATOR -> "Ban tổ chức". Nếu ai đó bỏ hàm đó đi thì
    // người dùng sẽ thấy mã enum trần.
    expect(chu).not.toContain("COORDINATOR");
  });

  it("vai trò chưa có trang riêng thì hiện huy hiệu vai trò, nhãn tiếng Việt", async () => {
    datVaiTro("MENTOR");
    moTrang();
    await waitFor(() =>
      expect(document.body.textContent).toContain("vai trò hiện tại của bạn"),
    );
    // roleLabel() đổi mã enum sang nhãn đọc được.
    expect(document.body.textContent).not.toContain("MENTOR");
  });
});
