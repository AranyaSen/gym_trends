import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { RoleTypes } from "../types/common";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

export function RequireAuth({
  roles,
  children,
}: {
  roles?: RoleTypes[];
  children: React.ReactNode;
}) {
  const location = useLocation();

  const userDetails = useAuthStore((s) => s.userDetails);

  useEffect(() => {
    console.log(location.pathname);
  }, [location]);

  if (!userDetails) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If passed role in the router does not match with the user.role then route to home '/'
  if (roles && !roles.includes(userDetails?.user?.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return children;
}
