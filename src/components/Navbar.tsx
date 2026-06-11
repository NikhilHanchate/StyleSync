import { useNavigate } from "react-router-dom";
import { getStorageItem, setStorageItem } from "../utils/storage";
import { supabase } from "../utils/supabaseClient";
import { User } from "../types";
import { Scissors, LogOut, Shield, User as UserIcon, Store } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const currentUser = getStorageItem<User | null>("currentUser", null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("currentUser");
    navigate("/auth");
  };

  if (!currentUser) return null;

  // Premium, thematic title badges for our user roles
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-full">
            <Shield className="w-3.5 h-3.5" /> Platform Admin
          </span>
        );
      case "owner":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-full">
            <Store className="w-3.5 h-3.5" /> Salon Partner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-full">
            <UserIcon className="w-3.5 h-3.5" /> Member
          </span>
        );
    }
  };

  return (
    <nav id="stylesync-navbar" className="sticky top-0 z-50 backdrop-blur-md bg-[#0f1115]/90 border-b border-zinc-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => {
              if (currentUser.role === "admin") navigate("/admin/dashboard");
              else if (currentUser.role === "owner") navigate("/owner/dashboard");
              else navigate("/user/dashboard");
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2.5 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-xl shadow-md shadow-amber-500/10 group-hover:scale-105 transition-all duration-300">
              <Scissors className="w-6 h-6 text-[#08090c] stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-wider text-white gap-1 select-none">
                Style<span className="text-yellow-400">Sync</span>
              </span>
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-zinc-500 font-medium">Men's Grooming Alliance</p>
            </div>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* User Profile Info */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-white tracking-wide">
                {currentUser.name}
              </span>
              <p className="text-[11px] text-zinc-400 font-mono select-none mt-0.5">
                {currentUser.email}
              </p>
            </div>

            {/* Role Badge */}
            <div className="scale-95 sm:scale-100">
              {getRoleBadge(currentUser.role)}
            </div>

            {/* Vertical Splitter */}
            <div className="h-6 w-px bg-zinc-800" />

            {/* Logout Trigger */}
            <button
              onClick={handleLogout}
              className="group flex items-center justify-center p-2.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-all duration-200"
              title="Logout session"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

          </div>

        </div>
      </div>
    </nav>
  );
}
