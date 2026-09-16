import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/api/authApi";
import type { UserCategory } from "@/api/types";
import { IconArrowRight } from "@/components/icons";
import { AuthHero } from "@/components/AuthHero";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export function RegisterPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

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
        <AuthHero
          title={isEn ? "Join the SEAL Hackathon Community." : "Gia nhập cộng đồng SEAL Hackathon."}
          subtitle={isEn ? "Fair, transparent, and professional competitive platform." : "Nền tảng thi đấu công bằng, minh bạch và chuyên nghiệp."}
        />
        <div className="auth-form-side">
          <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 10, alignItems: "center", zIndex: 10 }}>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <div className="auth-card">
            <h1>{isEn ? "Registration Successful" : "Đăng ký thành công"}</h1>
            <p className="subtitle">
              {isEn
                ? "Your account has been registered and is pending review."
                : "Tài khoản của bạn đang ở trạng thái chờ duyệt."}
            </p>
            <Link to="/login" className="btn btn--primary">
              {isEn ? "Return to Sign In" : "Quay lại đăng nhập"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <AuthHero
        title={isEn ? "Join the SEAL Hackathon Community." : "Gia nhập cộng đồng SEAL Hackathon."}
        subtitle={
          isEn
            ? "Create an account to join tracks or accompany as a judge."
            : "Đăng ký tài khoản để tham gia các bảng đấu hoặc đồng hành cùng ban giám khảo."
        }
      />
      <div className="auth-form-side">
        <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 10, alignItems: "center", zIndex: 10 }}>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <div className="auth-card">
          <h1>{isEn ? "Create Account" : "Tạo tài khoản"}</h1>
          <p className="subtitle">
            {isEn ? "Register to participate in SEAL Hackathon" : "Đăng ký để tham gia SEAL Hackathon"}
          </p>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>{isEn ? "Full Name" : "Họ và tên"}</label>
              <input
                required
                value={form.fullName}
                onChange={e => setForm({...form, fullName: e.target.value})}
                placeholder={isEn ? "Nguyen Van A" : "Nguyễn Văn A"}
              />
            </div>
            <div className="form-row">
              <label>{isEn ? "Email Address" : "Email"}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="student@fpt.edu.vn"
              />
            </div>
            <div className="form-row">
              <label>{isEn ? "Password" : "Mật khẩu"}</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <div className="form-row">
              <label>{isEn ? "Category" : "Phân loại"}</label>
              <select value={form.userCategory} onChange={e => setForm({...form, userCategory: e.target.value as UserCategory})}>
                <option value="FPT_STUDENT">{isEn ? "FPT Student" : "Sinh viên FPT"}</option>
                <option value="EXTERNAL_STUDENT">{isEn ? "External Student" : "Sinh viên trường khác"}</option>
                <option value="STAFF">{isEn ? "Staff / Faculty" : "Cán bộ / Giảng viên"}</option>
              </select>
            </div>
            {form.userCategory === "FPT_STUDENT" && (
              <div className="form-row">
                <label>{isEn ? "Student Code" : "Mã số sinh viên"}</label>
                <input
                  required
                  value={form.studentCode}
                  onChange={e => setForm({...form, studentCode: e.target.value})}
                  placeholder="SE170001"
                />
              </div>
            )}
            {form.userCategory === "EXTERNAL_STUDENT" && (
              <div className="form-row">
                <label>{isEn ? "University Name" : "Tên trường"}</label>
                <input
                  required
                  value={form.schoolName}
                  onChange={e => setForm({...form, schoolName: e.target.value})}
                  placeholder={isEn ? "University of Technology" : "Đại học Bách Khoa"}
                />
              </div>
            )}
            <button className="btn" type="submit" disabled={submitting}>
              {submitting
                ? (isEn ? "Processing..." : "Đang xử lý...")
                : (isEn ? "Create Account" : "Đăng ký")}
              {!submitting && <IconArrowRight width={15} height={15} />}
            </button>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
              {isEn ? "Already have an account?" : "Đã có tài khoản?"}{" "}
              <Link to="/login">{isEn ? "Sign in" : "Đăng nhập"}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
