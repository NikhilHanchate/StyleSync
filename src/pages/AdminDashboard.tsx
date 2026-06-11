import { useState, useEffect } from "react";
import { getStorageItem, setStorageItem, seedInitialData } from "../utils/storage";
import { api } from "../utils/api";
import { User, Salon, Booking, UserRole, SalonStatus } from "../types";
import { 
  ShieldAlert, Store, Users, Calendar, IndianRupee, CheckCircle2, AlertTriangle, 
  Trash2, Shield, UserX, UserCheck, Star, Award, Building2, TrendingUp 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "motion/react";

export default function AdminDashboard() {
  const currentUser = getStorageItem<User | null>("currentUser", null);

  // Schema state structures
  const [users, setUsers] = useState<User[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "salons" | "bookings">("overview");

  // Load administrative registries
  const loadAdminRegistries = async () => {
    try {
      const storedUsers = await api.getUsers();
      const storedSalons = await api.getSalons();
      const storedBookings = await api.getBookings();

      setUsers(storedUsers);
      setSalons(storedSalons);
      setBookings(storedBookings);
    } catch (err: any) {
      console.error("Failed to load admin registries:", err);
    }
  };

  useEffect(() => {
    loadAdminRegistries();
  }, []);

  // Update Salon Status (Approve / Suspend)
  const handleUpdateSalonStatus = async (salonId: string, status: SalonStatus) => {
    try {
      await api.updateSalon(salonId, { status });
      loadAdminRegistries();
    } catch (err: any) {
      console.error("Failed to update salon status:", err);
    }
  };

  // Safe User Suspension (Banning)
  const handleBanUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert("Suicidal administrative commands blocked. You cannot suspend your own session!");
      return;
    }
    if (!window.confirm("Do you want to suspend this account and bar platform access?")) return;

    try {
      await api.updateUser(userId, { status: "suspended" });

      // If the banned user is an owner, suspend all of their salons
      const storedSalons = await api.getSalons();
      const ownerSalons = storedSalons.filter(s => s.ownerId === userId);
      for (const salon of ownerSalons) {
        await api.updateSalon(salon.id, { status: "suspended" });
      }

      loadAdminRegistries();
    } catch (err: any) {
      console.error("Failed to suspend user:", err);
    }
  };

  // Reactivate a suspended user
  const handleActivateUser = async (userId: string) => {
    if (!window.confirm("Do you want to reactivate this account and restore platform access?")) return;

    try {
      await api.updateUser(userId, { status: "active" });

      // Also auto-approve their salons if they are an owner
      const storedSalons = await api.getSalons();
      const suspendedSalons = storedSalons.filter(s => s.ownerId === userId && s.status === "suspended");
      for (const salon of suspendedSalons) {
        await api.updateSalon(salon.id, { status: "approved" });
      }

      loadAdminRegistries();
    } catch (err: any) {
      console.error("Failed to activate user:", err);
    }
  };

  // Formulate Overview metrics
  const totalUserCount = users.length;
  const totalSalonsCount = salons.length;
  const totalBookingsCount = bookings.length;
  const completedBookings = bookings.filter(b => b.status === "completed");
  const systemAggregateRevenue = completedBookings.reduce((sum, current) => sum + current.servicePrice, 0);

  // Chart data: Salon Approval Breakdowns
  const getSalonBreakdownData = () => {
    const approved = salons.filter(s => s.status === "approved").length;
    const pending = salons.filter(s => s.status === "pending").length;
    const suspended = salons.filter(s => s.status === "suspended").length;

    return [
      { name: "Approved", value: approved, color: "#10b981" },
      { name: "Pending", value: pending, color: "#f59e0b" },
      { name: "Suspended", value: suspended, color: "#ef4444" }
    ];
  };

  // Pie chart center calculations
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="bold">
        {percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""}
      </text>
    );
  };

  return (
    <div id="admin-dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title Header with platform capabilities summary */}
      <div className="space-y-1.5 border-b border-zinc-800 pb-2">
        <h2 className="font-serif text-3xl font-bold text-white tracking-wide">Platform Administrator Citadel</h2>
        <p className="text-xs text-zinc-500">Global auditing workspace. Oversee user accounts, verify salon applications, and check global booking history.</p>
      </div>

      {/* Global Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Total Users</p>
            <h4 className="text-xl font-bold font-mono text-white mt-0.5">{totalUserCount} Accounts</h4>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">All Salons</p>
            <h4 className="text-xl font-bold font-mono text-white mt-0.5">{totalSalonsCount} Locations</h4>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Global Bookings</p>
            <h4 className="text-xl font-bold font-mono text-white mt-0.5">{totalBookingsCount} Chairs</h4>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Grooming Vol. Sales</p>
            <h4 className="text-xl font-bold font-mono text-white mt-0.5">₹{systemAggregateRevenue} INR</h4>
          </div>
        </div>

      </div>

      {/* Admin Central Subnavigation */}
      <div className="flex gap-2 pb-1 overflow-x-auto justify-start border-b border-zinc-900 font-mono text-[11px] sm:text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4.5 py-2.5 font-bold uppercase tracking-wider rounded-t-lg transition-all ${
            activeTab === "overview"
              ? "bg-zinc-900 border-t border-x border-zinc-850 text-amber-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Overview Charts
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4.5 py-2.5 font-bold uppercase tracking-wider rounded-t-lg transition-all ${
            activeTab === "users"
              ? "bg-zinc-900 border-t border-x border-zinc-850 text-amber-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          All Register Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("salons")}
          className={`px-4.5 py-2.5 font-bold uppercase tracking-wider rounded-t-lg transition-all ${
            activeTab === "salons"
              ? "bg-zinc-900 border-t border-x border-zinc-850 text-amber-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Salon Audit Queue ({salons.length})
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4.5 py-2.5 font-bold uppercase tracking-wider rounded-t-lg transition-all ${
            activeTab === "bookings"
              ? "bg-zinc-900 border-t border-x border-zinc-850 text-amber-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Global Bookings list ({bookings.length})
        </button>
      </div>

      {/* Main interactive sections details */}
      <div className="py-2">
        
        {/* Overview charts */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Pie Chart: Salon status breaks */}
            <div className="bg-zinc-900/30 border border-zinc-850 rounded-2xl p-6 space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-white tracking-wider">Alliance Salon Breakdown</h4>
                <p className="text-xs text-zinc-500">Distribution of salon partners based on verification status</p>
              </div>

              <div className="h-64 flex flex-col sm:flex-row items-center justify-around gap-4">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getSalonBreakdownData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={75}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getSalonBreakdownData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {getSalonBreakdownData().map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-400 capitalize">{item.name}:</span>
                      <span className="text-white font-bold">{item.value} locations</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform instructions & controls */}
            <div className="bg-zinc-900/30 border border-zinc-850 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded font-mono">
                  <Shield className="w-3.5 h-3.5" /> Administrative Manual
                </div>
                <h4 className="font-serif text-lg font-bold text-white tracking-wider">System Integrity Protocols</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  As the primary system curator of the StyleSync grooming marketplace, you are loaded with full server-style auditing commands:
                </p>
                <ul className="text-xs text-zinc-500 list-disc list-inside space-y-1.5 pl-1.5">
                  <li>Verify and approve pending salons for immediate booking directory inclusion</li>
                  <li>Ban/suspend rogue listings violating community grooming guidelines</li>
                  <li>Perform hard drops on user sessions or inspect complete historical transaction data across New York</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>System Health Level:</span>
                <span className="font-bold font-mono text-emerald-400">100% SECURE CLIENT</span>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Registered user list */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-serif text-xl font-bold text-white">Registered User Alliance Database</h4>
              <p className="text-xs text-zinc-500 mt-1">Full platform user indexes stored securely in client buffers</p>
            </div>

            <div className="overflow-x-auto border border-zinc-850 rounded-2xl bg-zinc-900/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-950/40 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                    <th className="p-4">UserID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email ID</th>
                    <th className="p-4 text-right">System Role</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-zinc-850 text-zinc-300">
                  {users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-zinc-850/20 transition-colors">
                      <td className="p-4 font-mono font-semibold text-zinc-400 select-all">{usr.id}</td>
                      <td className="p-4 font-bold text-white">{usr.name}</td>
                      <td className="p-4 font-mono text-zinc-400">{usr.email}</td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col gap-1 items-end">
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            usr.role === "admin" 
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : usr.role === "owner"
                              ? "bg-yellow-400/10 text-yellow-500 border border-yellow-400/20"
                              : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {usr.role}
                          </span>
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            usr.status === "suspended" 
                              ? "bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          }`}>
                            {usr.status || "active"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Salon verification audit queue */}
        {activeTab === "salons" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-serif text-xl font-bold text-white">Salon Verification Audits Hub</h4>
              <p className="text-xs text-zinc-500 mt-1">Audit, approve or suspend barber parlors waiting for public directory lists</p>
            </div>

            {salons.length === 0 ? (
              <p className="text-center p-12 text-zinc-600 text-xs border border-dashed border-zinc-850 rounded-2xl">
                No salons registered in platform directories.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {salons.map((sal) => (
                  <div 
                    key={sal.id}
                    className="p-5 bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 rounded-2xl flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-lg text-white font-serif">{sal.name}</h5>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          sal.status === "approved" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : sal.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}>
                          {sal.status}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-normal line-clamp-2">{sal.description}</p>
                      
                      <div className="space-y-1 font-mono text-[10px] text-zinc-500 pt-2 border-t border-zinc-850">
                        <p>📍 {sal.address}</p>
                        <p>📞 {sal.phone}</p>
                        <p>👤 Owner ID: {sal.ownerId}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-zinc-850">
                      {sal.status !== "approved" && (
                        <button
                          onClick={() => handleUpdateSalonStatus(sal.id, "approved")}
                          className="px-3 py-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900 hover:bg-emerald-900 hover:text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                        >
                          Approve Salon
                        </button>
                      )}

                      {sal.status !== "suspended" && (
                        <button
                          onClick={() => handleUpdateSalonStatus(sal.id, "suspended")}
                          className="px-3 py-1.5 bg-red-950/20 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                        >
                          Suspend Salon
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Global Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-serif text-xl font-bold text-white">Global Platform Booking Ledger</h4>
              <p className="text-xs text-zinc-500 mt-1">Complete history of platform grooming chairs and reservation transactions</p>
            </div>

            {bookings.length === 0 ? (
              <p className="text-center p-12 text-zinc-600 text-xs border border-dashed border-zinc-850 rounded-2xl">
                No bookings registered in global system memory.
              </p>
            ) : (
              <div className="overflow-x-auto border border-zinc-850 rounded-2xl bg-zinc-900/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 bg-zinc-950/40 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      <th className="p-4">BookingID</th>
                      <th className="p-4">Salon name</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Treatment</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Price</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-zinc-850 text-zinc-300">
                    {bookings.map((bk) => (
                      <tr key={bk.id} className="hover:bg-zinc-850/20 transition-colors">
                        <td className="p-4 font-mono font-semibold text-zinc-400 select-all">{bk.id.replace("bk_", "")}</td>
                        <td className="p-4 font-bold text-white truncate max-w-[150px]">{bk.salonName}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-zinc-200">{bk.userName}</p>
                            <p className="text-[10px] text-zinc-500">{bk.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono">{bk.serviceName}</td>
                        <td className="p-4 whitespace-nowrap">{bk.date} @ {bk.time}</td>
                        <td className="p-4 font-bold text-yellow-400 font-mono">₹{bk.servicePrice}</td>
                        <td className="p-4 text-right">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            bk.status === "confirmed" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : bk.status === "completed" 
                              ? "bg-blue-500/10 text-blue-400"
                              : bk.status === "cancelled"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {bk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
