export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    ME: "/auth/me",
    REGISTER_ADMIN: "/auth/register/admin",
    REGISTER_MEMBER: "/auth/register",
  },
  GYM: {
    GET: "/gym",
    SETUP: "/gym/setup",
    SETTINGS: "/gym/settings",
  },
  DASHBOARD: {
    GET: "/dashboard",
  },
  PLANS: {
    LIST: "/plans",
    CREATE: "/plans",
    DEACTIVATE: (id: string) => `/plans/${id}/deactivate` as const,
  },
  PLAN_REQUESTS: {
    CREATE: "/plan-requests",
    LIST: "/plan-requests",
    APPROVE: (id: string) => `/plan-requests/${id}/approve` as const,
    REJECT: (id: string) => `/plan-requests/${id}/reject` as const,
  },
  PAYMENTS: {
    OFFLINE: "/payments/offline",
    RAZORPAY_ORDER: "/payments/razorpay/order",
  },
  MEMBERSHIPS: {
    ASSIGN: "/memberships/assign",
    RENEW: "/memberships/renew",
    SWITCH: "/memberships/switch",
  },
  USERS: {
    MEMBERS: "/users/members",
  },
  TRAINERS: {
    LIST: "/trainers",
    LINK: "/trainer-members",
    UNLINK: (trainerId: string, memberId: string) => `/trainer-members/${trainerId}/${memberId}` as const,
    MY_MEMBERS: "/trainer/members",
  },
  ATTENDANCE: {
    LIST: "/attendance",
    MANUAL: "/attendance/manual",
    SCAN: "/attendance/scan",
  },
  EXPORTS: {
    MEMBERS: "/exports/members",
    ATTENDANCE: "/exports/attendance",
    TRAINERS: "/exports/trainers",
    AUDIT: "/exports/audit",
  },
  AUDIT_LOGS: {
    LIST: "/audit-logs",
  },
  QR: {
    TOKEN: "/qr/token",
  },
} as const;
