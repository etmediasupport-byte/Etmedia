import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

// Helper to check JWT format and expiration
function isJwtValid(token: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const p1 = parts[1];
    if (!p1) return false;
    const payloadBase64 = p1.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded || !decoded.exp) return false;

    // Check if token expiration time is in the future
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (err) {
    return false;
  }
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const location = useLocation();
  const token = localStorage.getItem("etmedia_admin_token") || localStorage.getItem("et_admin_token");
  const adminRaw = localStorage.getItem("etmedia_admin_user") || localStorage.getItem("et_admin_user");

  const [verifying, setVerifying] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAdminSession = async () => {
      // 1. Initial Local Verification
      if (!token || !isJwtValid(token)) {
        localStorage.removeItem("etmedia_admin_token");
        localStorage.removeItem("et_admin_token");
        localStorage.removeItem("etmedia_admin_user");
        localStorage.removeItem("et_admin_user");
        if (isMounted) {
          setIsAuthenticated(false);
          setVerifying(false);
        }
        return;
      }

      // 2. Server-side cryptographic check
      try {
        const res = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.admin) {
            // Check role if specified
            if (requiredRole && data.admin.role !== requiredRole && data.admin.role !== "super_admin") {
              if (isMounted) {
                setIsAuthenticated(false);
                setVerifying(false);
              }
              return;
            }
            if (isMounted) {
              setIsAuthenticated(true);
              setVerifying(false);
            }
            return;
          }
        }

        // Invalid or expired token on server
        localStorage.removeItem("etmedia_admin_token");
        localStorage.removeItem("et_admin_token");
        localStorage.removeItem("etmedia_admin_user");
        localStorage.removeItem("et_admin_user");
        if (isMounted) {
          setIsAuthenticated(false);
          setVerifying(false);
        }
      } catch (err) {
        // Fallback: If network is offline but client JWT is valid, grant access
        if (isJwtValid(token)) {
          if (isMounted) {
            setIsAuthenticated(true);
            setVerifying(false);
          }
        } else {
          if (isMounted) {
            setIsAuthenticated(false);
            setVerifying(false);
          }
        }
      }
    };

    verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, [token, location.pathname, requiredRole]);

  // If token is missing right away, immediately redirect without delay
  if (!token || !isJwtValid(token)) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Verification loading spinner
  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans selection:bg-cyan-500/30">
        <div className="flex flex-col items-center space-y-4 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display">Verifying Admin Session</h3>
            <p className="text-xs text-slate-400">Authenticating cryptographic credentials with server...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated after verification, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
