import { createBrowserRouter } from "react-router-dom";
import { App } from "../App";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { JoinRegisterPage } from "../pages/JoinRegisterPage";
import { RequireAuth } from "../components/RequireAuth";
import { AdminRegisterPage } from "../pages/admin/AdminRegisterPage";
import { ROUTES } from "../constants/routes";
import { lazy } from "react";

const AdminLayout = lazy(() => import("../components/AdminLayout"));
const AdminDashboardPage = lazy(
  () => import("../pages/admin/AdminDashboardPage"),
);
const AdminPreferencesPage = lazy(
  () => import("../pages/admin/AdminPreferencesPage"),
);
const AdminSetupPage = lazy(() => import("../pages/admin/AdminSetupPage"));
const AdminQrPage = lazy(() => import("../pages/admin/AdminQrPage"));
const AdminPlansPage = lazy(() => import("../pages/admin/AdminPlansPage"));
const AdminMembersPage = lazy(() => import("../pages/admin/AdminMembersPage"));
const AdminTrainersPage = lazy(
  () => import("../pages/admin/AdminTrainersPage"),
);
const AdminAttendancePage = lazy(
  () => import("../pages/admin/AdminAttendancePage"),
);
const AdminExportsPage = lazy(() => import("../pages/admin/AdminExportsPage"));
const AdminAuditPage = lazy(() => import("../pages/admin/AdminAuditPage"));
const MemberHomePage = lazy(() => import("../pages/MemberHomePage"));
const TrainerHomePage = lazy(() => import("../pages/TrainerHomePage"));
const MemberScanPage = lazy(() => import("../pages/MemberScanPage"));

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTES.ADMIN_REGISTER,
        element: <AdminRegisterPage />,
      },
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <JoinRegisterPage />,
      },
      {
        path: ROUTES.ADMIN,
        element: (
          <RequireAuth roles={["ADMIN"]}>
            <AdminLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: ROUTES.ADMIN_PREFERENCES,
            element: <AdminPreferencesPage />,
          },
          {
            path: ROUTES.ADMIN_SETUP,
            element: <AdminSetupPage />,
          },
          {
            path: ROUTES.ADMIN_QR,
            element: <AdminQrPage />,
          },
          {
            path: ROUTES.ADMIN_PLANS,
            element: <AdminPlansPage />,
          },
          {
            path: ROUTES.ADMIN_MEMBERS,
            element: <AdminMembersPage />,
          },
          {
            path: ROUTES.ADMIN_TRAINERS,
            element: <AdminTrainersPage />,
          },
          {
            path: ROUTES.ADMIN_ATTENDANCE,
            element: <AdminAttendancePage />,
          },
          {
            path: ROUTES.ADMIN_EXPORTS,
            element: <AdminExportsPage />,
          },
          {
            path: ROUTES.ADMIN_AUDIT,
            element: <AdminAuditPage />,
          },
        ],
      },
      {
        path: ROUTES.MEMBER,
        element: (
          <RequireAuth roles={["MEMBER"]}>
            <MemberHomePage />
          </RequireAuth>
        ),
      },
      {
        path: ROUTES.TRAINER,
        element: (
          <RequireAuth roles={["TRAINER"]}>
            <TrainerHomePage />
          </RequireAuth>
        ),
      },
      {
        path: ROUTES.MEMBER_SCAN,
        element: (
          <RequireAuth roles={["TRAINER", "MEMBER"]}>
            <MemberScanPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);
