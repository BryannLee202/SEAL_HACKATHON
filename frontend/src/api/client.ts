import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BFF_URL ?? "http://localhost:4000",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
});

/**
 * Lỗi từ một lời gọi API, có giữ lại mã HTTP.
 *
 * Trước đây interceptor reject bằng `new Error(message)` nên mã trạng thái bị
 * mất sạch: màn hình chỉ có chuỗi thông báo, không phân biệt nổi 403 (không có
 * quyền) với 409 (xung đột nghiệp vụ) hay 500 (lỗi máy chủ). Bằng chứng là
 * `onUnauthorized` phải tồn tại như một kênh riêng chỉ để bắt 401 — thứ lẽ ra
 * đọc thẳng từ lỗi là xong.
 */
export class ApiError extends Error {
  /** Mã HTTP, hoặc `undefined` khi request không tới được máy chủ (mất mạng, timeout). */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** Không đủ quyền cho hành động này. */
  get isForbidden() {
    return this.status === 403;
  }

  /** Hết phiên đăng nhập. */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** Xung đột nghiệp vụ: nộp trùng, vòng thi đã chốt, phiên đã đóng... */
  get isConflict() {
    return this.status === 409;
  }

  /** Không tới được máy chủ — khác hẳn với việc máy chủ trả về lỗi. */
  get isNetworkError() {
    return this.status === undefined;
  }
}

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/** Subscribe to session-expiry (401) events from any API call. Returns an unsubscribe function. */
export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error.response?.status;

    if (status === 401) {
      unauthorizedListeners.forEach((listener) => listener());
    }

    const message =
      error.response?.data?.message ??
      error.message ??
      "Đã xảy ra lỗi không xác định";

    // ApiError kế thừa Error nên mọi chỗ đang bắt `err as Error` và đọc
    // `.message` vẫn chạy y như cũ; chỗ nào cần mã thì đọc thêm `.status`.
    return Promise.reject(new ApiError(message, status));
  },
);
