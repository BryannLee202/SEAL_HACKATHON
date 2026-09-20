import MyTeam from "./pages/team/MyTeam";
import Mentor from "./pages/mentor/Mentor";

import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LandingPage } from "./pages/LandingPage";
import { VotingPage } from "./pages/public/VotingPage";
import { RankingPage } from "./pages/public/RankingPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JudgePage } from "./pages/judge/JudgePage";
import { NotFoundPage } from "./pages/NotFound";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import { DEFAULT_TAB } from "@/pages/tabConfig";
import { ToastContainer } from "./components/Toast";
import { MascotChatDrawer } from "./components/MascotChatDrawer";
import AuditLogPage from "./pages/coordinator/AuditLogPage";
import "@/styles/global.css";
import "@/styles/team-mentor.css";
import { RegisterPage } from "./pages/RegisterPage";
import UsersApprovalPage from "./pages/coordinator/UsersApprovalPage";

// /coordinator/events/:eventId (khong co doan tab) -> nhay ve tab mac dinh.
// Tach thanh component rieng de khong lam roi doan :eventId khi resolve duong dan.
function DefaultTabRedirect() {
  const { eventId } = useParams<{ eventId: string }>();
  return <Navigate to={`/coordinator/events/${eventId}/${DEFAULT_TAB}`} replace />;
}

function AppRoutes() {
  return (
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
            {/* Đặt quanh AppRoutes chứ không quanh cả cây: một trang lỗi thì
                khung ứng dụng, thanh thông báo và trợ lý vẫn còn, người dùng
                bấm sang mục khác được thay vì nhìn trang trắng. */}
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
