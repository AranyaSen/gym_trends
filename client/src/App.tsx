import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { RequireAuth } from "./components/RequireAuth";
import { ROUTES } from "./constants/routes";
import { AdminAuditPage } from "./pages/admin/AdminAuditPage";
import { AdminAttendancePage } from "./pages/admin/AdminAttendancePage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminExportsPage } from "./pages/admin/AdminExportsPage";
import { AdminMembersPage } from "./pages/admin/AdminMembersPage";
import { AdminPlansPage } from "./pages/admin/AdminPlansPage";
import { AdminTrainersPage } from "./pages/admin/AdminTrainersPage";
import { AdminQrPage } from "./pages/admin/AdminQrPage";
import { AdminRegisterPage } from "./pages/admin/AdminRegisterPage";
import { AdminSetupPage } from "./pages/admin/AdminSetupPage";
import { HomePage } from "./pages/HomePage";
import { JoinRegisterPage } from "./pages/JoinRegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { MemberHomePage } from "./pages/MemberHomePage";
import { MemberScanPage } from "./pages/MemberScanPage";
import { TrainerHomePage } from "./pages/TrainerHomePage";
import { AdminPreferencesPage } from "./pages/admin/AdminPreferencesPage";
import { ToastProvider } from "./components/ui/Toast";

const qc = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.adminRegister} element={<AdminRegisterPage />} />
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<JoinRegisterPage />} />

            <Route
              path="/admin"
              element={
                <RequireAuth roles={["ADMIN"]}>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="preferences" element={<AdminPreferencesPage />} />
              <Route path="setup" element={<AdminSetupPage />} />
              <Route path="qr" element={<AdminQrPage />} />
              <Route path="plans" element={<AdminPlansPage />} />
              <Route path="members" element={<AdminMembersPage />} />
              <Route path="trainers" element={<AdminTrainersPage />} />
              <Route path="attendance" element={<AdminAttendancePage />} />
              <Route path="exports" element={<AdminExportsPage />} />
              <Route path="audit" element={<AdminAuditPage />} />
            </Route>

            <Route
              path={ROUTES.member}
              element={
                <RequireAuth roles={["MEMBER"]}>
                  <MemberHomePage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.memberScan}
              element={
                <RequireAuth roles={["MEMBER", "TRAINER"]}>
                  <MemberScanPage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.trainer}
              element={
                <RequireAuth roles={["TRAINER"]}>
                  <TrainerHomePage />
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
