import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

/** Thành phần cố tình ném lỗi lúc render. */
function NemLoi(): never {
  throw new Error("vo lúc render");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React ghi lỗi ra console khi boundary bắt được - chặn lại cho log test sạch.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hiển thị bình thường khi không có lỗi", () => {
    render(
      <ErrorBoundary>
        <p>Nội dung bình thường</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Nội dung bình thường")).toBeInTheDocument();
  });

  it("bắt lỗi render và hiện màn báo lỗi thay vì trang trắng", () => {
    render(
      <ErrorBoundary>
        <NemLoi />
      </ErrorBoundary>,
    );

    // Không có boundary thì React gỡ sạch cây và người dùng thấy trang trắng.
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Trang gặp sự cố")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thử hiển thị lại/ })).toBeInTheDocument();
  });

  it("dùng fallback riêng khi được truyền vào", () => {
    render(
      <ErrorBoundary fallback={<p>Màn thay thế riêng</p>}>
        <NemLoi />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Màn thay thế riêng")).toBeInTheDocument();
    expect(screen.queryByText("Trang gặp sự cố")).not.toBeInTheDocument();
  });

  it("nút Thử hiển thị lại dựng lại nội dung khi lỗi đã hết", async () => {
    function ComponentDoiDuoc() {
      const [hong, setHong] = useState(true);
      return (
        <>
          <button onClick={() => setHong(false)}>Sửa nguồn lỗi</button>
          <ErrorBoundary>{hong ? <NemLoi /> : <p>Đã chạy lại được</p>}</ErrorBoundary>
        </>
      );
    }

    render(<ComponentDoiDuoc />);
    expect(screen.getByText("Trang gặp sự cố")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Sửa nguồn lỗi"));
    await userEvent.click(screen.getByRole("button", { name: /Thử hiển thị lại/ }));

    expect(screen.getByText("Đã chạy lại được")).toBeInTheDocument();
  });

  it("ghi lỗi ra console de con lan duoc vet", () => {
    render(
      <ErrorBoundary>
        <NemLoi />
      </ErrorBoundary>,
    );
    expect(console.error).toHaveBeenCalled();
  });
});
