export const ROUTES = {
  home: "/",
  adminRegister: "/auth/admin/register",
  login: "/auth/login",
  register: "/auth/register",
  admin: "/admin",
  adminSetup: "/admin/setup",
  adminPreferences: "/admin/preferences",
  adminQr: "/admin/qr",
  adminPlans: "/admin/plans",
  adminMembers: "/admin/members",
  adminTrainers: "/admin/trainers",
  adminAttendance: "/admin/attendance",
  adminExports: "/admin/exports",
  adminAudit: "/admin/audit",
  member: "/member",
  memberScan: "/member/scan",
  trainer: "/trainer",
} as const;

export const STORAGE_TOKEN_KEY = "gymtrac_token";
