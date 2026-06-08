import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { Button } from "./ui/Button";
import { Settings } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { logoutService } from "../services/auth/auth.services";

const links: { to: string; label: string }[] = [
  { to: ROUTES.ADMIN, label: "Overview" },
  { to: ROUTES.ADMIN_PLANS, label: "Plans" },
  { to: ROUTES.ADMIN_MEMBERS, label: "Members" },
  { to: ROUTES.ADMIN_TRAINERS, label: "Trainers" },
  { to: ROUTES.ADMIN_ATTENDANCE, label: "Attendance" },
  { to: ROUTES.ADMIN_EXPORTS, label: "Exports" },
  { to: ROUTES.ADMIN_AUDIT, label: "Audit" },
  { to: ROUTES.ADMIN_QR, label: "QR" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const logOut = useAuthStore((s) => s.setLogout);

  const logoutMutation = useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      logOut();
      navigate(ROUTES.HOME);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-brand-bg relative flex flex-col">
      {/* Visual background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 glass border-b border-brand-border/30 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={ROUTES.ADMIN} className="group">
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 group-hover:to-brand-accent transition-all duration-300">
                GYM TRAC
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((l) => {
                const isActive = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      isActive
                        ? "text-brand-accent bg-brand-accent/10 neon-border border"
                        : "text-brand-muted hover:text-white hover:bg-white/5"
                    }`}
                    to={l.to}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                navigate(ROUTES.ADMIN_PREFERENCES);
              }}
            >
              <Settings
                className={`w-5 h-5 transition-colors ${
                  location.pathname === ROUTES.ADMIN_PREFERENCES
                    ? "text-brand-accent"
                    : "text-brand-muted hover:text-brand-accent"
                }`}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-8 flex justify-end"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav (simplified for now) */}
      <div className="md:hidden glass border-b border-brand-border/20 px-4 py-2 flex flex-wrap gap-2 overflow-x-auto">
        {links.map((l) => (
          <Link
            key={l.to}
            className="whitespace-nowrap px-2 py-1 text-[10px] font-bold uppercase text-brand-muted"
            to={l.to}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
