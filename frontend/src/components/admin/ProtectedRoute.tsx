import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const location = useLocation();
  const token = localStorage.getItem("et_admin_token");
  const adminRaw = localStorage.getItem("et_admin_user");

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole && adminRaw) {
    try {
      const admin = JSON.parse(adminRaw);
      if (admin.role !== requiredRole && admin.role !== "super_admin") {
        return <Navigate to="/admin" replace />;
      }
    } catch (e) {}
  }

  return <>{children}</>;
};
