import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ROUTES } from "../constants/routes";

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their default home if they hit a forbidden route
    return <Navigate to={user.role === "admin" ? ROUTES.DASHBOARD : ROUTES.SCAN} replace />;
  }

  return <Outlet />;
};

export const AuthRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? ROUTES.DASHBOARD : ROUTES.SCAN} replace />;
  }

  return <Outlet />;
};
