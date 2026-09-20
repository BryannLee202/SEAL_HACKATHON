import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/api/adminUsersApi", () => ({
  adminUsersApi: {
    listPending: vi.fn(),
    listApproved: vi.fn(),
    approve: vi.fn(),
    createGuestJudge: vi.fn(),
  },
}));

import UsersApprovalPage from "./UsersApprovalPage";
import { adminUsersApi } from "@/api/adminUsersApi";

function trang<T>(items: T[]) {
  return { content: items, totalElements: items.length, totalPages: 1, number: 0, size: 200 } as never;
}

const choDuyet = [
  { id: "u1", fullName: "Nguyen Van A", email: "a@ut.edu.vn", accountStatus: "PENDING", userCategory: "FPT_STUDENT" },
  { id: "u2", fullName: "Tran Thi B", email: "b@ut.edu.vn", accountStatus: "PENDING", userCategory: "FPT_STUDENT" },
];

/**
 * UsersApprovalPage là cổng vào hệ thống: không ai thi được cho tới khi ban tổ
 * chức duyệt ở đây. 498 dòng, trước đây không có test nào.
 *
 * Điều đáng giữ nhất: DUYỆT và TỪ CHỐI phải gọi đúng cờ. Hai hành động nằm cạnh
 * nhau, cùng gọi một hàm `approve(userId, approve, reason)` chỉ khác giá trị
 * boolean — đảo nhầm thì hệ thống từ chối người đáng duyệt và ngược lại, mà
 * giao diện vẫn báo thành công.
 */
describe("UsersApprovalPage — duyệt tài khoản", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(adminUsersApi.listPending).mockResolvedValue(trang(choDuyet));
    vi.mocked(adminUsersApi.listApproved).mockResolvedValue(trang([]));
    vi.mocked(adminUsersApi.approve).mockResolvedValue({} as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("hiện danh sách tài khoản đang chờ duyệt", async () => {
    render(<UsersApprovalPage />);
    await waitFor(() => expect(screen.getByText("Nguyen Van A")).toBeInTheDocument());
    expect(screen.getByText("Tran Thi B")).toBeInTheDocument();
  });

  it("Duyệt phải qua bước xác nhận, rồi gọi approve với cờ TRUE", async () => {
    render(<UsersApprovalPage />);
    await waitFor(() => expect(screen.getByText("Nguyen Van A")).toBeInTheDocument());

    await userEvent.click(screen.getAllByRole("button", { name: /✓Duyệt/ })[0]);

    // Bấm Duyệt chỉ MỞ hộp xác nhận, chưa gọi gì cả. Duyệt tài khoản là việc
    // không lùi lại được nên một lần bấm nhầm không được phép đi thẳng.
    expect(adminUsersApi.approve).not.toHaveBeenCalled();

    await userEvent.click((await screen.findAllByRole("button", { name: /Xác nhận duyệt/ }))[0]);

    await waitFor(() => {
      expect(adminUsersApi.approve).toHaveBeenCalled();
      // Tham số thứ hai là cờ duyệt/từ chối. Hai nút nằm cạnh nhau và cùng gọi
      // một hàm, chỉ khác giá trị boolean — đảo nhầm thì hệ thống từ chối
      // người đáng duyệt mà giao diện vẫn báo thành công.
      expect(vi.mocked(adminUsersApi.approve).mock.calls[0][1]).toBe(true);
    });
  });

  it("Từ chối gọi approve với cờ FALSE, không phải true", async () => {
    render(<UsersApprovalPage />);
    await waitFor(() => expect(screen.getByText("Nguyen Van A")).toBeInTheDocument());

    await userEvent.click(screen.getAllByRole("button", { name: /✕Từ chối/ })[0]);
    const xacNhan = (await screen.findAllByRole("button", { name: /Xác nhận/ }))[0];
    await userEvent.click(xacNhan);

    await waitFor(() => {
      expect(adminUsersApi.approve).toHaveBeenCalled();
      expect(vi.mocked(adminUsersApi.approve).mock.calls[0][1]).toBe(false);
    });
  });

  it("tải hỏng thì báo lỗi, không hiện như là không có ai chờ duyệt", async () => {
    vi.mocked(adminUsersApi.listPending).mockRejectedValue(new Error("Mất kết nối máy chủ"));

    render(<UsersApprovalPage />);

    await waitFor(() => {
      expect(document.body.textContent).toContain("Mất kết nối");
    });
  });

  it("không có ai chờ duyệt thì không báo lỗi", async () => {
    vi.mocked(adminUsersApi.listPending).mockResolvedValue(trang([]));

    render(<UsersApprovalPage />);

    await waitFor(() => expect(adminUsersApi.listPending).toHaveBeenCalled());
    expect(document.body.textContent).not.toContain("Mất kết nối");
  });
});
