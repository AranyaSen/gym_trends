import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

type Role = "ADMIN" | "TRAINER" | "MEMBER";

export function RequireAuth({
  roles,
  children,
}: {
  roles?: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: loc }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return children;
}
