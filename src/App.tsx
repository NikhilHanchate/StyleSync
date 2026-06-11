import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import { getStorageItem, seedInitialData } from "./utils/storage";
import { User } from "./types";
import { useEffect } from "react";

// Global Redirector for standard / or * paths based on role
function RootRedirector() {
  const currentUser = getStorageItem<User | null>("currentUser", null);

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Route them to their respective home dashboard base
  switch (currentUser.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "owner":
      return <Navigate to="/owner/dashboard" replace />;
    case "user":
    default:
      return <Navigate to="/user/dashboard" replace />;
  }
}

export default function App() {
  // Pre-seed any initial database entries on bootstrap
  useEffect(() => {
    seedInitialData();
  }, []);

  return (
    <Router>
      <div id="stylesync-app-viewport" className="min-h-screen bg-[#08090c] text-[#e5e7eb] flex flex-col font-sans transition-colors duration-350">
        
        {/* Render global responsive navbar */}
        <Navbar />

        {/* Global Page core content viewports */}
        <main className="flex-1 w-full pb-16">
          <Routes>
            {/* Authenticators */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected Client Dashboard */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected Salon Owner Dashboard */}
            <Route 
              path="/owner/dashboard" 
              element={
                <ProtectedRoute allowedRole="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected Platform Administrative Citadel */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Layout redirects */}
            <Route path="/" element={<RootRedirector />} />
            <Route path="*" element={<RootRedirector />} />
          </Routes>
        </main>
        
        {/* Elegant design footer signature block matching premium guidelines */}
        <footer className="py-6 border-t border-zinc-900 bg-zinc-950/40 text-center text-[10px] uppercase tracking-[0.25em] text-zinc-650 select-none">
          © 2026 StyleSync alliance • Crafted for Elite Gentlemen’s Care
        </footer>

      </div>
    </Router>
  );
}
