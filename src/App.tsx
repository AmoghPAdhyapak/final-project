import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";
import AppLayout from "@/components/layouts/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AttendancePage from "@/pages/AttendancePage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ChatPage from "@/pages/ChatPage";
import NotificationsPage from "@/pages/NotificationsPage";
import TimetablePage from "@/pages/TimetablePage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/attendance"    element={<AttendancePage />} />
              <Route path="/analytics"     element={<AnalyticsPage />} />
              <Route path="/chat"          element={<ChatPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/timetable"     element={<TimetablePage />} />
              <Route path="/profile"       element={<ProfilePage />} />
              <Route path="*"             element={<NotFound />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
