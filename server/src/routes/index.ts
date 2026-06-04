import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as gymController from "../controllers/gym.controller";
import * as qrController from "../controllers/qr.controller";
import * as attendanceController from "../controllers/attendance.controller";
import * as planController from "../controllers/plan.controller";
import * as membershipController from "../controllers/membership.controller";
import * as dashboardController from "../controllers/dashboard.controller";
import * as manualAttendanceController from "../controllers/manualAttendance.controller";
import * as trainerController from "../controllers/trainer.controller";
import * as paymentController from "../controllers/payment.controller";
import * as exportController from "../controllers/export.controller";
import * as auditLogsController from "../controllers/auditLogs.controller";
import * as membershipLifecycleController from "../controllers/membershipLifecycle.controller";
import * as userController from "../controllers/user.controller";
import * as attendanceListController from "../controllers/attendanceList.controller";
import { requireAuth, requireGym } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { Role } from "@prisma/client";

import * as planRequestController from "../controllers/planRequest.controller";

export const apiRouter = Router();

apiRouter.post("/auth/register/admin", authController.registerAdmin);
apiRouter.post("/auth/register", authController.registerMember);
apiRouter.post("/auth/login", authController.login);
apiRouter.get("/auth/me", requireAuth, authController.me);

apiRouter.get("/gym", requireAuth, requireGym, gymController.getMyGym);
apiRouter.patch(
  "/gym/setup",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  gymController.completeSetup,
);
apiRouter.patch(
  "/gym/settings",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  gymController.updateSettings,
);

apiRouter.get(
  "/dashboard",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  dashboardController.getDashboard,
);

apiRouter.get("/plans", requireAuth, requireGym, planController.listPlans);

apiRouter.post(
  "/plans",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  planController.createPlan,
);

apiRouter.post(
  "/plans/:id/deactivate",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  planController.deactivatePlan,
);

apiRouter.post(
  "/plan-requests",
  requireAuth,
  requireGym,
  requireRoles(Role.MEMBER),
  planRequestController.createRequest,
);

apiRouter.get(
  "/plan-requests",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  planRequestController.listRequests,
);

apiRouter.post(
  "/plan-requests/:id/approve",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  planRequestController.approveRequest,
);

apiRouter.post(
  "/plan-requests/:id/reject",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  planRequestController.rejectRequest,
);

apiRouter.post(
  "/memberships/assign",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  membershipController.assign,
);

apiRouter.post(
  "/memberships/renew",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  membershipLifecycleController.renew,
);

apiRouter.post(
  "/memberships/switch",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  membershipLifecycleController.switchPlan,
);

apiRouter.post(
  "/payments/offline",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  paymentController.offline,
);

apiRouter.post(
  "/payments/razorpay/order",
  requireAuth,
  requireGym,
  requireRoles(Role.MEMBER),
  paymentController.razorpayOrder,
);

apiRouter.get(
  "/users/members",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  userController.listMembers,
);

apiRouter.get(
  "/trainers",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  trainerController.listTrainers,
);

apiRouter.post(
  "/trainer-members",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  trainerController.linkPair,
);

apiRouter.delete(
  "/trainer-members/:trainerId/:memberId",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  trainerController.unlinkPair,
);

apiRouter.get(
  "/trainer/members",
  requireAuth,
  requireGym,
  requireRoles(Role.TRAINER),
  trainerController.myMembers,
);

apiRouter.get(
  "/attendance",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  attendanceListController.list,
);

apiRouter.post(
  "/attendance/manual",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  manualAttendanceController.createManual,
);

apiRouter.get(
  "/exports/members",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  exportController.members,
);

apiRouter.get(
  "/exports/attendance",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  exportController.attendance,
);

apiRouter.get(
  "/exports/trainers",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  exportController.trainers,
);

apiRouter.get(
  "/exports/audit",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  exportController.audit,
);

apiRouter.get(
  "/audit-logs",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  auditLogsController.list,
);

apiRouter.post(
  "/qr/token",
  requireAuth,
  requireGym,
  requireRoles(Role.ADMIN),
  qrController.mintQr,
);

apiRouter.post(
  "/attendance/scan",
  requireAuth,
  requireGym,
  requireRoles(Role.MEMBER, Role.TRAINER),
  attendanceController.scan,
);
