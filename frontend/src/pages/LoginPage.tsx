import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { IconArrowRight } from "../components/icons";
import { AuthHero } from "../components/AuthHero";
import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

export function LoginPage() {
  const { login } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthHero />
      <div className="auth-form-side">
        <div style={{ position: "absolute", top: 20, right: 24, display: "flex", gap: 10, alignItems: "center", zIndex: 10 }}>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <div className="auth-card">
          <h1>{isEn ? "Welcome Back" : "Chào mừng trở lại"}</h1>
          <p className="subtitle">
            {isEn
              ? "Sign in to access the SEAL Hackathon platform"
              : "Đăng nhập để vào hệ thống SEAL Hackathon"}
          </p>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="email">{isEn ? "Email Address" : "Email"}</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="form-row">
              <label htmlFor="password">{isEn ? "Password" : "Mật khẩu"}</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting
                ? (isEn ? "Signing in..." : "Đang đăng nhập...")
                : (isEn ? "Sign In" : "Đăng nhập")}
              {!submitting && <IconArrowRight width={15} height={15} />}
            </button>
            <p style={{ marginTop: "1rem", textAlign: "center" }}>
              {isEn ? "Don't have an account?" : "Chưa có tài khoản?"}{" "}
              <Link to="/register">{isEn ? "Register now" : "Đăng ký"}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
