import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/api/authApi";
import type { UserCategory } from "@/api/types";
import { IconArrowRight } from "@/components/icons";
import { AuthHero } from "@/components/AuthHero";

export function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "",
    userCategory: "FPT_STUDENT" as UserCategory,
    studentCode: "", schoolName: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.register(form);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="auth-shell">
        <AuthHero title="Gia nhập cộng đồng SEAL Hackathon." subtitle="Nền tảng thi đấu công bằng, minh bạch và chuyên nghiệp." />
        <div className="auth-form-side">
          <div className="auth-card">
            <h1>Đăng ký thành công</h1>
            <p className="subtitle">Tài khoản của bạn đang ở trạng thái chờ duyệt.</p>
            <Link to="/login" className="btn btn--primary">Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <AuthHero title="Gia nhập cộng đồng SEAL Hackathon." subtitle="Đăng ký tài khoản để tham gia các bảng đấu hoặc đồng hành cùng ban giám khảo." />
      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Tạo tài khoản</h1>
          <p className="subtitle">Đăng ký để tham gia SEAL Hackathon</p>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Họ và tên</label>
              <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Mật khẩu</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div className="form-row">
              <label>Phân loại</label>
              <select value={form.userCategory} onChange={e => setForm({...form, userCategory: e.target.value as UserCategory})}>
                <option value="FPT_STUDENT">Sinh viên FPT</option>
                <option value="EXTERNAL_STUDENT">Sinh viên trường khác</option>
                <option value="STAFF">Cán bộ / Giảng viên</option>
              </select>
            </div>
            {form.userCategory === "FPT_STUDENT" && (
              <div className="form-row">
                <label>Mã số sinh viên</label>
                <input required value={form.studentCode} onChange={e => setForm({...form, studentCode: e.target.value})} />
              </div>
            )}
            {form.userCategory === "EXTERNAL_STUDENT" && (
              <div className="form-row">
                <label>Tên trường</label>
                <input required value={form.schoolName} onChange={e => setForm({...form, schoolName: e.target.value})} />
              </div>
            )}
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Đăng ký"}
              {!submitting && <IconArrowRight width={15} height={15} />}
            </button>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
