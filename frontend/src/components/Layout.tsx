import { MascotChatDrawer } from "./MascotChatDrawer";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { SealLogo } from "./SealLogo";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  IconCalendar,
  IconGavel,
  IconHistory,
  IconHome,
  IconLogOut,
  IconMessageCircle,
  IconShieldCheck,
  IconTrophy,
  IconUsers,
} from "./icons";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, hasRole, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const isEn = language === "en";

  // Hai mục ai đăng nhập cũng thấy. Bảng xếp hạng trước đây chỉ vào được bằng
  // cách gõ tay URL /rankings — không có lối nào trong giao diện dẫn tới nó.
  const navItems: NavItem[] = [
    {
      to: "/app",
      label: isEn ? "Dashboard" : "Trang chủ",
      icon: <IconHome />,
    },
    {
      to: "/rankings",
      label: isEn ? "Leaderboard" : "Bảng xếp hạng",
      icon: <IconTrophy />,
    },
  ];

  if (
    hasRole("TEAM_MEMBER") ||
    hasRole("TEAM_LEADER")
  ) {
    navItems.push({
      to: "/team",
      label: isEn ? "My Team" : "Đội của tôi",
      icon: <IconUsers />,
    });
  }

  if (hasRole("JUDGE")) {
    navItems.push({
      to: "/judge",
      label: isEn ? "Judging" : "Chấm điểm",
      icon: <IconGavel />,
    });
  }

  // Mentor đăng nhập xong trước đây chỉ thấy đúng mục "Trang chủ": màn /mentor
  // có route nhưng không có mục nào trong thanh điều hướng trỏ tới.
  if (hasRole("MENTOR")) {
    navItems.push({
      to: "/mentor",
      label: isEn ? "Assigned Teams" : "Đội được phân công",
      icon: <IconMessageCircle />,
    });
  }

  if (hasRole("COORDINATOR")) {
    navItems.push({
      to: "/coordinator/events",
      label: isEn ? "Competitions" : "Quản lý cuộc thi",
      icon: <IconCalendar />,
    });

    navItems.push({
      to: "/coordinator/users",
      label: isEn ? "User Approvals" : "Duyệt tài khoản",
      icon: <IconShieldCheck />,
    });

    navItems.push({
      to: "/coordinator/audit-logs",
      label: isEn ? "Audit Logs" : "Nhật ký thao tác",
      icon: <IconHistory />,
    });
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const initials = (user?.fullName ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/app" className="sidebar-brand" style={{ textDecoration: "none" }}>
          <SealLogo size={34} showText={true} />
        </Link>

        <div className="nav-section-label">
          {isEn ? "Navigation" : "Điều hướng"}
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-tools" style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {initials}
            </div>

            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.fullName}
              </div>

              <div className="sidebar-user-email">
                {user?.email}
              </div>
            </div>
          </div>

          <button
            className="btn secondary small sidebar-logout-btn"
            onClick={handleLogout}
          >
            <IconLogOut width={15} height={15} />
            <span className="btn-label">
              {isEn ? "Log out" : "Đăng xuất"}
            </span>
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
      <MascotChatDrawer />
    </div>
  );
}