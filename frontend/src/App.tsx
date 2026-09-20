import { lazy, Suspense } from "react";
import { StateFeedback } from "@/components/ui/StateFeedback";

// Tach goi theo route: chi cac trang CONG KHAI (landing, dang nhap, dang ky)
// duoc goi kem goi chinh, vi do la thu nguoi dung thay dau tien. Moi trang
// phia sau dang nhap tai theo nhu cau.
//
// Truoc day toan bo ung dung nam trong mot goi 449 kB: khach vao xem bang xep
// hang cong khai van phai tai ca man cham diem, tab quan tri va trang doi thi
// - nhung thu ho khong bao gio mo.
const VotingPage = lazy(() => import("./pages/public/VotingPage").then(m => ({ default: m.VotingPage })));
const RankingPage = lazy(() => import("./pages/public/RankingPage").then(m => ({ default: m.RankingPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const JudgePage = lazy(() => import("./pages/judge/JudgePage").then(m => ({ default: m.JudgePage })));
const MyTeam = lazy(() => import("./pages/team/MyTeam"));
const Mentor = lazy(() => import("./pages/mentor/Mentor"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const EventDetailPage = lazy(() => import("@/pages/EventDetailPage"));
const AuditLogPage = lazy(() => import("./pages/coordinator/AuditLogPage"));
const UsersApprovalPage = lazy(() => import("./pages/coordinator/UsersApprovalPage"));

import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFound";
import { DEFAULT_TAB } from "@/pages/tabConfig";
import { ToastContainer } from "./components/Toast";
import { MascotChatDrawer } from "./components/MascotChatDrawer";
import "@/styles/global.css";
import "@/styles/team-mentor.css";
import { RegisterPage } from "./pages/RegisterPage";

// /coordinator/events/:eventId (khong co doan tab) -> nhay ve tab mac dinh.
// Tach thanh component rieng de khong lam roi doan :eventId khi resolve duong dan.
function DefaultTabRedirect() {
  const { eventId } = useParams<{ eventId: string }>();
  return <Navigate to={`/coordinator/events/${eventId}/${DEFAULT_TAB}`} replace />;
}

function AppRoutes() {
  return (
    <Suspense
      fallback={<StateFeedback state="loading" title="Đang tải trang..." />}
    >
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/vote" element={<VotingPage />} />
      <Route path="/rankings" element={<RankingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/judge"
        element={
          <ProtectedRoute requireRole="JUDGE">
            <JudgePage />
          </ProtectedRoute>
        }
      />

      {/* Cau truc cuoc thi (JAV-12) - chi Coordinator vao duoc */}
      <Route
        path="/coordinator/events"
        element={
          <ProtectedRoute requireRole="COORDINATOR">
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator/events/:eventId"
        element={
          <ProtectedRoute requireRole="COORDINATOR">
            <DefaultTabRedirect />
          </ProtectedRoute>
        }
      />
	  <Route
	    path="/coordinator/audit-logs"
	    element={
	      <ProtectedRoute requireRole="COORDINATOR">
	        <AuditLogPage />
	      </ProtectedRoute>
	    }
	  />
      <Route
        path="/coordinator/events/:eventId/:tab"
        element={
          <ProtectedRoute requireRole="COORDINATOR">
            <EventDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute requireRole={["TEAM_MEMBER", "TEAM_LEADER"]}>
            <MyTeam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor"
        element={
          <ProtectedRoute requireRole="MENTOR">
            <Mentor />
          </ProtectedRoute>
        }
      />

	    <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/coordinator/users"
        element={
          <ProtectedRoute requireRole="COORDINATOR">
            <UsersApprovalPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastContainer />
            <MascotChatDrawer />
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
