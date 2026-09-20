import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const phienDangNhap: { user: unknown } = { user: null };

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: phienDangNhap.user,
    loading: false,
    hasRole: () => false,
    refreshPermissions: vi.fn(),
  }),
}));

import { LandingPage } from "./LandingPage";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

function moTrang() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>
          <LandingPage />
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

/**
 * LandingPage là trang đầu tiên thầy nhìn thấy khi mở hệ thống, và là file lớn
 * thứ ba của dự án (755 dòng) — trước đây không có test nào.
 *
 * Hai thứ đáng giữ: trang render được khi CHƯA đăng nhập (đó là trạng thái mặc
 * định của nó), và các lối vào công khai còn nguyên. Bảng xếp hạng với cổng
 * bình chọn là hai màn khách xem được mà không cần tài khoản — mất lối vào thì
 * phải gõ tay đường dẫn.
 */
describe("LandingPage — trang giới thiệu", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    phienDangNhap.user = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("render được khi chưa đăng nhập", async () => {
    moTrang();
    await waitFor(() => expect(document.body.textContent).toBeTruthy());
    expect(document.body.textContent?.length).toBeGreaterThan(100);
  });

  it("có lối vào đăng nhập cho người chưa có phiên", async () => {
    moTrang();
    await waitFor(() => {
      const duong = Array.from(document.querySelectorAll("a")).map((a) => a.getAttribute("href"));
      expect(duong).toContain("/login");
    });
  });

  it("giữ lối vào bảng xếp hạng và cổng bình chọn công khai", async () => {
    moTrang();
    await waitFor(() => expect(document.body.textContent).toBeTruthy());

    const duong = Array.from(document.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    // Hai màn khách xem được mà không cần tài khoản.
    expect(duong).toContain("/rankings");
    expect(duong).toContain("/vote");
  });

  it("người ĐÃ đăng nhập thấy lối vào bảng điều khiển thay vì đăng nhập lại", async () => {
    phienDangNhap.user = { userId: "u1", email: "a@demo.local", fullName: "Nguoi Dung", roles: [] };

    moTrang();
    await waitFor(() => expect(document.body.textContent).toBeTruthy());

    const duong = Array.from(document.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(duong).toContain("/app");
  });

  it("nội dung trang bằng tiếng Việt theo mặc định", async () => {
    moTrang();
    await waitFor(() => expect(document.body.textContent).toBeTruthy());

    const chu = document.body.textContent ?? "";
    // LanguageProvider mặc định là "vi"; nếu ai đó đổi mặc định sang "en" thì
    // thầy mở hệ thống ra sẽ thấy trang tiếng Anh.
    const coDauTiengViet = /[àáảãạăằắẳâầấèéẻẽẹêềếìíòóỏôồốơờớùúủưừứỳý]/i.test(chu);
    expect(coDauTiengViet).toBe(true);
  });
});
