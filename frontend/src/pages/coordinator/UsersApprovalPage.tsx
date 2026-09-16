import { useEffect, useState, useCallback, useRef } from "react";
import { adminUsersApi } from "@/api/adminUsersApi";
import type { UserSummary } from "@/api/types";
import { Spinner, ErrorState } from "@/components/Feedback";
import { Modal } from "@/components/Modal";
import "@/styles/users-approval.css";

export default function UsersApprovalPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED">("PENDING");
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Modal confirm action
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const statusFilterRef = useRef(statusFilter);
  statusFilterRef.current = statusFilter;

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [pendingRes, approvedRes] = await Promise.all([
        adminUsersApi.listPending(0, 200),
        adminUsersApi.listApproved(0, 200),
      ]);

      setPendingCount(pendingRes.totalElements);
      setApprovedCount(approvedRes.totalElements);

      if (statusFilterRef.current === "PENDING") {
        setUsers(pendingRes.content);
      } else {
        setUsers(approvedRes.content);
      }

      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    } catch (e) {
      if (isInitial) {
        setError((e as Error).message ?? "Không thể tải danh sách tài khoản.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Switch tab filter
  useEffect(() => {
    loadData(false);
  }, [statusFilter, loadData]);

  // Real-time polling every 2.5 seconds so newly registered users appear almost instantly!
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(false);
    }, 2500);
    return () => clearInterval(timer);
  }, [loadData]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleOpenModal = (user: UserSummary, action: "approve" | "reject") => {
    setSelectedUser(user);
    setModalAction(action);
    setRejectionReason("");
  };

  const handleCloseModal = () => {
    if (actionBusy) return;
    setSelectedUser(null);
    setModalAction(null);
    setRejectionReason("");
  };

  const handleExecuteAction = async () => {
    if (!selectedUser || !modalAction) return;

    setActionBusy(true);
    try {
      const isApprove = modalAction === "approve";
      await adminUsersApi.approve(
        selectedUser.id,
        isApprove,
        isApprove ? undefined : (rejectionReason.trim() || "Thông tin đăng ký chưa hợp lệ")
      );

      setToast({
        type: "success",
        message: isApprove
          ? `✓ Đã phê duyệt thành công tài khoản: ${selectedUser.fullName} (${selectedUser.email})`
          : `✕ Đã từ chối tài khoản: ${selectedUser.fullName}`,
      });

      handleCloseModal();
      await loadData(false);
    } catch (e) {
      setToast({
        type: "error",
        message: (e as Error).message || "Có lỗi xảy ra khi xử lý tài khoản.",
      });
    } finally {
      setActionBusy(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderCategoryTag = (category: string) => {
    switch (category) {
      case "FPT_STUDENT":
        return <span className="ua-tag ua-tag--fpt">Sinh viên FPT</span>;
      case "STAFF":
        return <span className="ua-tag ua-tag--staff">Cán bộ / Giảng viên</span>;
      case "EXTERNAL_STUDENT":
      default:
        return <span className="ua-tag ua-tag--external">Sinh viên Ngoài</span>;
    }
  };

  return (
    <div className="page">
      <header className="ua-header-row">
        <div>
          <p className="eyebrow">ĐIỀU PHỐI VIÊN</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.25rem 0" }}>
            Duyệt tài khoản
          </h1>
          <p className="page__subtitle">
            Kiểm tra và cấp quyền truy cập chính thức cho thí sinh đăng ký mới.
          </p>
        </div>

        <div className="ua-sync-status">
          {lastUpdated && <span>Cập nhật: <strong>{lastUpdated}</strong></span>}
          <button
            className="ua-btn-refresh"
            onClick={() => loadData(false)}
            disabled={refreshing}
            title="Nhấn để làm mới danh sách ngay lập tức"
          >
            <span className={refreshing ? "ua-spin" : ""}>🔄</span>
            <span>{refreshing ? "Đang cập nhật…" : "Làm mới"}</span>
          </button>
        </div>
      </header>

      {toast && (
        <div className={`ua-toast ua-toast--${toast.type}`}>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="ua-controls">
        <div className="ua-tabs">
          <button
            type="button"
            className={`ua-tab ${statusFilter === "PENDING" ? "ua-tab--active" : ""}`}
            onClick={() => setStatusFilter("PENDING")}
          >
            <span>Chờ duyệt</span>
            <span className={`ua-badge ${pendingCount > 0 ? "ua-badge--warning" : ""}`}>
              {pendingCount}
            </span>
          </button>
          <button
            type="button"
            className={`ua-tab ${statusFilter === "APPROVED" ? "ua-tab--active" : ""}`}
            onClick={() => setStatusFilter("APPROVED")}
          >
            <span>Đã duyệt</span>
            <span className="ua-badge ua-badge--success">{approvedCount}</span>
          </button>
        </div>

        <span style={{ fontSize: "0.8125rem", color: "var(--c-muted, #64748b)" }}>
          {statusFilter === "PENDING"
            ? `Có ${pendingCount} tài khoản đang chờ quyết định`
            : `Đã cấp quyền cho ${approvedCount} tài khoản`}
        </span>
      </div>

      {loading && <Spinner label="Đang tải danh sách tài khoản…" />}
      {!loading && error && <ErrorState message={error} onRetry={() => loadData(true)} />}

      {!loading && !error && users.length === 0 && (
        <div className="ua-card" style={{ padding: "3.5rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
            {statusFilter === "PENDING" ? "🎉" : "📭"}
          </div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.4rem" }}>
            {statusFilter === "PENDING"
              ? "Hiện không có tài khoản nào chờ duyệt!"
              : "Chưa có tài khoản nào được duyệt."}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--c-muted, #64748b)", maxWidth: 460, margin: "0 auto" }}>
            {statusFilter === "PENDING"
              ? "Khi có thí sinh mới đăng ký, danh sách sẽ tự động xuất hiện tại đây mà không cần tải lại trang."
              : "Các tài khoản sau khi được Ban tổ chức phê duyệt sẽ hiển thị tại danh sách này."}
          </p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <section className="ua-card">
          <table className="ua-table">
            <thead>
              <tr>
                <th style={{ width: "28%" }}>Họ và tên & Email</th>
                <th style={{ width: "16%" }}>Phân loại</th>
                <th style={{ width: "24%" }}>Đơn vị / Mã SV</th>
                <th style={{ width: "14%" }}>Thời gian đăng ký</th>
                <th style={{ width: "18%", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="ua-user-info">
                      <div className="ua-avatar">{getInitials(u.fullName)}</div>
                      <div>
                        <div className="ua-user-name">{u.fullName}</div>
                        <div className="ua-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{renderCategoryTag(u.userCategory)}</td>
                  <td>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {u.schoolName || "Chưa cập nhật trường"}
                    </div>
                    {u.studentCode && (
                      <div style={{ fontSize: "0.78rem", color: "var(--c-muted, #64748b)" }}>
                        MSSV: <strong>{u.studentCode}</strong>
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--c-muted, #64748b)" }}>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    {statusFilter === "PENDING" ? (
                      <div className="ua-actions-cell">
                        {/* NÚT DUYỆT TÁCH BIỆT XANH LỤC BẢO */}
                        <button
                          type="button"
                          className="ua-btn-approve"
                          onClick={() => handleOpenModal(u, "approve")}
                          title="Phê duyệt tài khoản này"
                        >
                          <span>✓</span>
                          <span>Duyệt</span>
                        </button>

                        {/* NÚT TỪ CHỐI TÁCH BIỆT ĐỎ HỒNG */}
                        <button
                          type="button"
                          className="ua-btn-reject"
                          onClick={() => handleOpenModal(u, "reject")}
                          title="Từ chối phê duyệt"
                        >
                          <span>✕</span>
                          <span>Từ chối</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: "right" }}>
                        <span
                          className="ua-tag"
                          style={{
                            background: "#ecfdf5",
                            color: "#047857",
                            border: "1px solid #a7f3d0",
                            fontWeight: 600,
                          }}
                        >
                          ✓ Đã phê duyệt
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── MODAL XÁC NHẬN PHÊ DUYỆT (TÁCH BIỆT, ĐẸP MẮT) ── */}
      {selectedUser && modalAction === "approve" && (
        <Modal
          title="Xác nhận phê duyệt tài khoản"
          onClose={handleCloseModal}
          width={480}
        >
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "50%",
                background: "#d1fae5",
                color: "#059669",
                fontSize: "1.75rem",
                marginBottom: "0.5rem",
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0.25rem 0" }}>
              Cấp quyền truy cập hệ thống
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--c-muted, #64748b)" }}>
              Sau khi được duyệt, thí sinh sẽ có thể đăng nhập ngay và tạo/tham gia đội thi.
            </p>
          </div>

          <div className="ua-modal-user-box">
            <div className="ua-modal-row">
              <span>Họ và tên:</span>
              <span>{selectedUser.fullName}</span>
            </div>
            <div className="ua-modal-row">
              <span>Email:</span>
              <span>{selectedUser.email}</span>
            </div>
            <div className="ua-modal-row">
              <span>Phân loại:</span>
              <span>{renderCategoryTag(selectedUser.userCategory)}</span>
            </div>
            <div className="ua-modal-row">
              <span>Trường / Đơn vị:</span>
              <span>{selectedUser.schoolName || "—"}</span>
            </div>
            {selectedUser.studentCode && (
              <div className="ua-modal-row">
                <span>Mã số sinh viên:</span>
                <span>{selectedUser.studentCode}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button
              type="button"
              className="ua-btn-refresh"
              onClick={handleCloseModal}
              disabled={actionBusy}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="ua-btn-approve"
              onClick={handleExecuteAction}
              disabled={actionBusy}
              style={{ padding: "0.6rem 1.25rem", fontSize: "0.875rem" }}
            >
              {actionBusy ? "Đang duyệt…" : "✓ Xác nhận duyệt tài khoản"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── MODAL XÁC NHẬN TỪ CHỐI (TÁCH BIỆT, ĐẸP MẮT) ── */}
      {selectedUser && modalAction === "reject" && (
        <Modal
          title="Từ chối phê duyệt tài khoản"
          onClose={handleCloseModal}
          width={480}
        >
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#dc2626",
                fontSize: "1.75rem",
                marginBottom: "0.5rem",
              }}
            >
              ✕
            </div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0.25rem 0", color: "#b91c1c" }}>
              Từ chối yêu cầu đăng ký
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--c-muted, #64748b)" }}>
              Người dùng này sẽ không được cấp quyền và không thể đăng nhập vào hệ thống.
            </p>
          </div>

          <div className="ua-modal-user-box">
            <div className="ua-modal-row">
              <span>Họ và tên:</span>
              <span>{selectedUser.fullName}</span>
            </div>
            <div className="ua-modal-row">
              <span>Email:</span>
              <span>{selectedUser.email}</span>
            </div>
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <label
              htmlFor="rejection-reason"
              style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--c-text, #0f172a)" }}
            >
              Lý do từ chối (tùy chọn):
            </label>
            <textarea
              id="rejection-reason"
              className="ua-textarea"
              placeholder="Ví dụ: Thông tin thẻ sinh viên không hợp lệ, không thuộc diện đăng ký..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={actionBusy}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button
              type="button"
              className="ua-btn-refresh"
              onClick={handleCloseModal}
              disabled={actionBusy}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="ua-btn-reject"
              onClick={handleExecuteAction}
              disabled={actionBusy}
              style={{ padding: "0.6rem 1.25rem", fontSize: "0.875rem" }}
            >
              {actionBusy ? "Đang xử lý…" : "✕ Xác nhận từ chối"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}