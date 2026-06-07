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
import { authMiddleWare, requireGym } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { Role } from "@prisma/client";

import * as planRequestController from "../controllers/planRequest.controller";

export const apiRouter = Router();

apiRouter.post("/auth/register/admin", authController.registerAdmin);
apiRouter.post("/auth/register", authController.registerMember);
apiRouter.post("/auth/login", authController.login);
apiRouter.get("/auth/me", authMiddleWare, authController.me);

apiRouter.get("/gym", authMiddleWare, requireGym, gymController.getMyGym);
apiRouter.patch(
  "/gym/setup",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  gymController.completeSetup,
);
apiRouter.patch(
  "/gym/settings",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  gymController.updateSettings,
);

apiRouter.get(
  "/dashboard",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  dashboardController.getDashboard,
);

apiRouter.get("/plans", authMiddleWare, requireGym, planController.listPlans);

apiRouter.post(
  "/plans",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  planController.createPlan,
);

apiRouter.post(
  "/plans/:id/deactivate",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  planController.deactivatePlan,
);

apiRouter.post(
  "/plan-requests",
  authMiddleWare,
  requireGym,
  requireRoles(Role.MEMBER),
  planRequestController.createRequest,
);

apiRouter.get(
  "/plan-requests",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  planRequestController.listRequests,
);

apiRouter.post(
  "/plan-requests/:id/approve",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  planRequestController.approveRequest,
);

apiRouter.post(
  "/plan-requests/:id/reject",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  planRequestController.rejectRequest,
);

apiRouter.post(
  "/memberships/assign",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  membershipController.assign,
);

apiRouter.post(
  "/memberships/renew",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  membershipLifecycleController.renew,
);

apiRouter.post(
  "/memberships/switch",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  membershipLifecycleController.switchPlan,
);

apiRouter.post(
  "/payments/offline",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  paymentController.offline,
);

apiRouter.post(
  "/payments/razorpay/order",
  authMiddleWare,
  requireGym,
  requireRoles(Role.MEMBER),
  paymentController.razorpayOrder,
);

apiRouter.get(
  "/users/members",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  userController.listMembers,
);

apiRouter.get(
  "/trainers",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  trainerController.listTrainers,
);

apiRouter.post(
  "/trainer-members",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  trainerController.linkPair,
);

apiRouter.delete(
  "/trainer-members/:trainerId/:memberId",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  trainerController.unlinkPair,
);

apiRouter.get(
  "/trainer/members",
  authMiddleWare,
  requireGym,
  requireRoles(Role.TRAINER),
  trainerController.myMembers,
);

apiRouter.get(
  "/attendance",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  attendanceListController.list,
);

apiRouter.post(
  "/attendance/manual",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  manualAttendanceController.createManual,
);

apiRouter.get(
  "/exports/members",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  exportController.members,
);

apiRouter.get(
  "/exports/attendance",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  exportController.attendance,
);

apiRouter.get(
  "/exports/trainers",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  exportController.trainers,
);

apiRouter.get(
  "/exports/audit",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  exportController.audit,
);

apiRouter.get(
  "/audit-logs",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  auditLogsController.list,
);

apiRouter.post(
  "/qr/token",
  authMiddleWare,
  requireGym,
  requireRoles(Role.ADMIN),
  qrController.mintQr,
);

apiRouter.post(
  "/attendance/scan",
  authMiddleWare,
  requireGym,
  requireRoles(Role.MEMBER, Role.TRAINER),
  attendanceController.scan,
);
