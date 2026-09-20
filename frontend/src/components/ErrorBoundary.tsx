import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Nội dung thay thế khi có lỗi. Bỏ trống thì dùng màn báo lỗi mặc định. */
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Chặn lỗi render, giữ lại khung ứng dụng.
 *
 * React gỡ bỏ toàn bộ cây component khi một lần render ném lỗi. Không có lớp
 * chặn này thì một lỗi nhỏ — đọc thuộc tính của `undefined` trong một thẻ nào
 * đó — làm trắng cả trang, và người dùng không còn gì để bấm ngoài việc tải
 * lại. Giữa buổi bảo vệ thì đó là kết thúc phần trình bày.
 *
 * Chỉ bắt lỗi lúc RENDER. Lỗi trong hàm xử lý sự kiện hay promise không đi qua
 * đây — những chỗ đó vẫn bắt bằng try/catch và `toast` như cũ.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Ghi ra console để còn lần được vết khi dựng lại lỗi.
    console.error("Lỗi render bị ErrorBoundary chặn lại:", error, info.componentStack);
  }

  private thuLai = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }
    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="state-feedback error" role="alert" style={{ padding: 32, textAlign: "center" }}>
        <h2 style={{ marginBottom: 8 }}>Trang gặp sự cố</h2>
        <p className="muted" style={{ marginBottom: 20 }}>
          Đã có lỗi khi hiển thị nội dung. Các phần khác của hệ thống vẫn hoạt động
          bình thường.
        </p>
        <div className="flex wrap" style={{ gap: 12, justifyContent: "center" }}>
          <button className="btn" onClick={this.thuLai}>
            Thử hiển thị lại
          </button>
          <a className="btn secondary" href="/">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }
}
