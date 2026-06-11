import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getStorageItem } from "../utils/storage";
import { supabase } from "../utils/supabaseClient";
import { api } from "../utils/api";
import { User, UserRole } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const currentUser = getStorageItem<User | null>("currentUser", null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const checkUserStatus = async () => {
      try {
        const allUsers = await api.getUsers();
        const dbUser = allUsers.find((u) => u.id === currentUser.id);
        if (dbUser && dbUser.status === "suspended") {
          setIsSuspended(true);
          await supabase.auth.signOut();
          localStorage.removeItem("currentUser");
        } else if (!dbUser) {
          // User was removed entirely from the database
          setIsSuspended(true);
          await supabase.auth.signOut();
          localStorage.removeItem("currentUser");
        }
      } catch (err) {
        console.error("Failed to verify user suspension status against active Node.js server:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [currentUser?.id]);

  // If not logged in, reject instantly
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Show a premium thematic gold loader during dynamic backend status validation
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  // Suspended users redirect back to auth
  if (isSuspended) {
    return <Navigate to="/auth" replace />;
  }

  // If role mismatch, route them to their valid home portal
  if (currentUser.role !== allowedRole) {
    switch (currentUser.role) {
      case "owner":
        return <Navigate to="/owner/dashboard" replace />;
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "user":
      default:
        return <Navigate to="/user/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
