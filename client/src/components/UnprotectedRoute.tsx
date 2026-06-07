import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { ROUTES } from "../constants/routes";

export const UnprotectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.userDetails?.user?.role);

  if (isAuthenticated && role) {
    return <Navigate to={ROUTES[role]} />;
  }
  return children;
};
