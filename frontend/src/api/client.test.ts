import { describe, it, expect } from "vitest";
import { ApiError } from "./client";

/**
 * Trước đây interceptor reject bằng `new Error(message)` nên mã HTTP bị mất
 * sạch. Màn hình chỉ có chuỗi thông báo, không phân biệt nổi 403 với 409 hay
 * 500 — và `onUnauthorized` phải tồn tại như một kênh riêng chỉ để bắt 401.
 */
describe("ApiError", () => {
  it("giữ lại mã HTTP", () => {
    const err = new ApiError("Bạn không có quyền", 403);
    expect(err.status).toBe(403);
    expect(err.message).toBe("Bạn không có quyền");
  });

  it("vẫn là Error, nên mọi chỗ đang đọc .message không phải sửa gì", () => {
    const err = new ApiError("Lỗi gì đó", 500);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe("Lỗi gì đó");
  });

  it("phân biệt được 401, 403 và 409", () => {
    expect(new ApiError("x", 401).isUnauthorized).toBe(true);
    expect(new ApiError("x", 401).isForbidden).toBe(false);

    expect(new ApiError("x", 403).isForbidden).toBe(true);
    expect(new ApiError("x", 403).isConflict).toBe(false);

    expect(new ApiError("x", 409).isConflict).toBe(true);
    expect(new ApiError("x", 409).isUnauthorized).toBe(false);
  });

  it("không tới được máy chủ khác với máy chủ trả về lỗi", () => {
    // Mất mạng / timeout: không có response nên không có status.
    const mangHong = new ApiError("Network Error", undefined);
    expect(mangHong.isNetworkError).toBe(true);

    // Máy chủ trả 500 là chuyện khác hẳn - request tới nơi rồi.
    const mayChuLoi = new ApiError("Lỗi máy chủ", 500);
    expect(mayChuLoi.isNetworkError).toBe(false);
  });

  it("mang ten ApiError de phan biet trong log", () => {
    expect(new ApiError("x", 400).name).toBe("ApiError");
  });
});
