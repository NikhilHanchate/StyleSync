import React, { useState, useEffect } from "react";
import { getStorageItem, setStorageItem } from "../utils/storage";
import { api } from "../utils/api";
import { User, Salon, Service, Staff, Booking, BookingStatus } from "../types";
import {
  Building, Scissors, Users, Calendar, TrendingUp, IndianRupee, Plus, Trash,
  Check, X, Award, MapPin, Phone, Info, Sparkles, Sliders, ChevronRight, BarChart3, AlertCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

export default function OwnerDashboard() {
  const currentUser = getStorageItem<User | null>("currentUser", null);

  // States
  const [salons, setSalons] = useState<Salon[]>([]);
  const [activeSalonId, setActiveSalonId] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Tab Selection
  const [activeTab, setActiveTab] = useState<"analytics" | "bookings" | "services" | "staff" | "profile">("analytics");

  // Input Forms
  const [isCreatingSalon, setIsCreatingSalon] = useState<boolean>(false);
  const [newSalonName, setNewSalonName] = useState<string>("");
  const [newSalonDesc, setNewSalonDesc] = useState<string>("");
  const [newSalonAddr, setNewSalonAddr] = useState<string>("");
  const [newSalonPhone, setNewSalonPhone] = useState<string>("");
  const [newSalonLogo, setNewSalonLogo] = useState<string>("");
  const [newSalonBanner, setNewSalonBanner] = useState<string>("");

  // Category values for new treatments
  const [newServiceName, setNewServiceName] = useState<string>("");
  const [newServicePrice, setNewServicePrice] = useState<number>(30);
  const [newServiceDuration, setNewServiceDuration] = useState<number>(30);
  const [newServiceDesc, setNewServiceDesc] = useState<string>("");
  const [newServiceCat, setNewServiceCat] = useState<"Haircut" | "Beard" | "Shave" | "Facial" | "Combo">("Haircut");

  // Barber values for roster
  const [newStaffName, setNewStaffName] = useState<string>("");
  const [newStaffRole, setNewStaffRole] = useState<string>("Master Barber");
  const [newStaffAvatar, setNewStaffAvatar] = useState<string>("");

  // Status updates
  const [error, setError] = useState<string>("");

  // Load and assemble data for Owner's salons
  const loadOwnerData = async () => {
    if (!currentUser) return;

    try {
      // Fetch salons owned by this owner from backend API
      const ownerSalons = await api.getSalons(currentUser.id);
      setSalons(ownerSalons);

      if (ownerSalons.length > 0) {
        // Auto-select first salon if none is active
        const activeId = activeSalonId || ownerSalons[0].id;
        setActiveSalonId(activeId);

        // Load bookings for active salon
        const activeBookings = await api.getBookings(activeId);
        setBookings(activeBookings);

        // Load services for active salon
        const activeServices = await api.getServices(activeId);
        setServices(activeServices);

        // Load staff for active salon
        const activeStaff = await api.getStaff(activeId);
        setStaff(activeStaff);
      } else {
        setBookings([]);
        setServices([]);
        setStaff([]);
      }
    } catch (err: any) {
      console.error("Failed to load owner data:", err);
      setError("Failed to retrieve salon configurations from system database.");
    }
  };

  useEffect(() => {
    loadOwnerData();

    // Auto-refresh from database every 5 seconds to keep real-time alignment
    const interval = setInterval(() => {
      loadOwnerData();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser?.id, activeSalonId]);

  // Create a brand new salon
  const handleCreateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newSalonName || !newSalonDesc || !newSalonAddr || !newSalonPhone) {
      setError("Please declare all essential salon parameters.");
      return;
    }

    try {
      const allSalons = await api.getSalons();

      const CREATION_BANNERS = [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1605497746444-1296151a7db8?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1527799863830-550edd220556?auto=format&fit=crop&q=80&w=1200"
      ];

      const CREATION_LOGOS = [
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1605497746444-1296151a7db8?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1634480256802-7cb5b451f99a?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=200"
      ];

      const logoIdx = allSalons.length % CREATION_LOGOS.length;
      const bannerIdx = allSalons.length % CREATION_BANNERS.length;

      const newSalon: Salon = {
        id: "salon_" + Date.now(),
        ownerId: currentUser.id,
        name: newSalonName,
        description: newSalonDesc,
        address: newSalonAddr,
        phone: newSalonPhone,
        rating: 5.0,
        logoUrl: newSalonLogo || CREATION_LOGOS[logoIdx],
        bannerUrl: newSalonBanner || CREATION_BANNERS[bannerIdx],
        status: "approved", // Fast approval for demonstration!
      };

      await api.createSalon(newSalon);
      setActiveSalonId(newSalon.id);

      // reset fields
      setNewSalonName("");
      setNewSalonDesc("");
      setNewSalonAddr("");
      setNewSalonPhone("");
      setNewSalonLogo("");
      setNewSalonBanner("");
      setIsCreatingSalon(false);
      setError("");

      loadOwnerData();
    } catch (err: any) {
      console.error("Failed to create salon:", err);
      setError("Failed to create salon in backend database.");
    }
  };

  // Add Treatment Service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSalonId) return;

    if (!newServiceName || newServicePrice <= 0 || newServiceDuration <= 0) {
      setError("Provide realistic service descriptors.");
      return;
    }

    try {
      const newService: Service = {
        id: "srv_" + Date.now(),
        salonId: activeSalonId,
        name: newServiceName,
        description: newServiceDesc,
        price: Number(newServicePrice),
        duration: Number(newServiceDuration),
        category: newServiceCat,
      };

      await api.createService(newService);
      setNewServiceName("");
      setNewServiceDesc("");
      setNewServicePrice(30);
      setNewServiceDuration(30);
      setError("");

      loadOwnerData();
    } catch (err: any) {
      console.error("Failed to create service:", err);
      setError("Failed to register treatment menu on server.");
    }
  };

  // Delete Service
  const handleDeleteService = async (serviceId: string) => {
    try {
      await api.deleteService(serviceId);
      loadOwnerData();
    } catch (err: any) {
      console.error("Failed to delete service:", err);
      setError("Failed to remove treatment from server.");
    }
  };

  // Add Staff Roster
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSalonId) return;

    if (!newStaffName || !newStaffRole) {
      setError("Please input the barber's full honorable name.");
      return;
    }

    try {
      const newBarber: Staff = {
        id: "stf_" + Date.now(),
        salonId: activeSalonId,
        name: newStaffName,
        role: newStaffRole,
        rating: 4.8,
        avatarUrl: newStaffAvatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        skills: [],
      };

      await api.createStaff(newBarber);
      setNewStaffName("");
      setNewStaffRole("Master Barber");
      setNewStaffAvatar("");
      setError("");

      loadOwnerData();
    } catch (err: any) {
      console.error("Failed to add staff:", err);
      setError("Failed to register barber roster profile on server.");
    }
  };

  // Remove Staff member
  const handleDeleteStaff = async (staffId: string) => {
    try {
      await api.deleteStaff(staffId);
      loadOwnerData();
    } catch (err: any) {
      console.error("Failed to delete staff:", err);
      setError("Failed to dismiss barber profile from server.");
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await api.updateBooking(bookingId, { status });
      loadOwnerData();
    } catch (err: any) {
      console.error("Failed to update booking status:", err);
      setError("Failed to finalize reservation update on server.");
    }
  };

  // Calculate Metrics from bookings list
  const totalBookingsCount = bookings.length;
  const completedBookings = bookings.filter(b => b.status === "completed");
  const totalRevenue = completedBookings.reduce((sum, current) => sum + current.servicePrice, 0);

  // Chart data 1: Service popularity analytics
  const servicePopularityData = () => {
    const popularityMap: { [key: string]: number } = {};
    bookings.forEach((bk) => {
      if (bk.status !== "cancelled") {
        popularityMap[bk.serviceName] = (popularityMap[bk.serviceName] || 0) + 1;
      }
    });

    return Object.keys(popularityMap).map((key) => ({
      name: key,
      appointments: popularityMap[key],
    }));
  };

  // Chart data 2: Daily revenue stream distribution
  const revenueHistoryData = () => {
    const revenueMap: { [key: string]: number } = {};
    completedBookings.forEach((bk) => {
      // extract date YYYY-MM-DD
      revenueMap[bk.date] = (revenueMap[bk.date] || 0) + bk.servicePrice;
    });

    // sort keys chronologically
    const sortedDates = Object.keys(revenueMap).sort();
    return sortedDates.map((d) => ({
      date: d,
      revenue: revenueMap[d],
    }));
  };

  const chartColors = ["#d4af37", "#f6d365", "#b89222", "#937118", "#c5c6c7"];
  const activeSalon = salons.find(s => s.id === activeSalonId);

  return (
    <div id="owner-dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Top Controller Bar - Select which Salon to manage, or button to launch new Salon */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center sm:justify-between py-2 border-b border-zinc-800">
        <div className="space-y-1">
          <h2 className="font-serif text-3xl font-bold text-white tracking-wide">Owner Management Board</h2>
          <p className="text-xs text-zinc-500">Configure salon settings, treatments catalog, staff scheduling, and business charts</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">


          <button
            onClick={() => setIsCreatingSalon(!isCreatingSalon)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 text-[#0f1115] hover:text-[#050608] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" /> Launch Parlor
          </button>
        </div>
      </div>

      {/* Launcher/Form for a New Salon */}
      <AnimatePresence>
        {isCreatingSalon && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateSalon} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                <Building className="w-5 h-5 text-amber-500" />
                <span className="font-serif text-lg font-bold text-white">Establish Your Grooming Headquarters</span>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono"> parlor Business name</label>
                  <input
                    type="text"
                    required
                    placeholder="Classic Timber Barber Co."
                    value={newSalonName}
                    onChange={(e) => setNewSalonName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono"> phone number contact</label>
                  <input
                    type="phone"
                    required
                    placeholder="+1 (555) 440-1010"
                    value={newSalonPhone}
                    onChange={(e) => setNewSalonPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono"> parlor Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="24 Walnut Court, Manhattan, NY"
                  value={newSalonAddr}
                  onChange={(e) => setNewSalonAddr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono"> business ethos biography</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain the unique luxury details you provide (dry scalp grooming, complimentary beers...)"
                  value={newSalonDesc}
                  onChange={(e) => setNewSalonDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono"> LOGO URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newSalonLogo}
                    onChange={(e) => setNewSalonLogo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono"> BANNER IMAGE URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newSalonBanner}
                    onChange={(e) => setNewSalonBanner(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSalon(false)}
                  className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-750 font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase rounded-lg"
                >
                  Confirm Setup Brand
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {salons.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-zinc-800 rounded-3xl space-y-4">
          <Building className="w-12 h-12 text-zinc-700 mx-auto" />
          <h3 className="font-serif text-2xl text-white font-bold">No Salon Brand Active</h3>
          <p className="text-zinc-500 max-w-sm mx-auto text-xs">
            To begin receiving bookings and managing master barbers, you must create your salon profile details using the button above.
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Active Salon Info Card strip */}
          {activeSalon && (
            <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeSalon.logoUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=100"}
                  alt={activeSalon.name}
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-850"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-lg text-white">{activeSalon.name}</h3>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> {activeSalon.address}
                  </p>
                </div>
              </div>

              {/* Status information */}
              <div className="flex items-center gap-4 select-none">
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${activeSalon.status === "approved"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : activeSalon.status === "pending"
                    ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/25"
                    : "text-red-400 bg-red-500/10 border-red-500/25"
                  }`}>
                  Status: {activeSalon.status}
                </span>

                {activeSalon.status !== "approved" && (
                  <p className="text-xs text-yellow-500 italic max-w-xs text-right leading-tight">
                    * Salon is currently waiting for Administrator verification before listing publicly.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Owners Navigation Sub-tabs */}
          <div className="flex gap-2 pb-1 overflow-x-auto justify-start border-b border-zinc-800/60 font-mono text-[11px] sm:text-xs">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4.5 py-2.5 font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === "analytics"
                ? "bg-zinc-900 border-t border-x border-zinc-800 text-yellow-400"
                : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Analytics Hub</span>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4.5 py-2.5 font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === "bookings"
                ? "bg-zinc-900 border-t border-x border-zinc-800 text-yellow-400"
                : "text-zinc-500 hover:text-zinc-300 pointer-events-auto"
                }`}
            >
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Client Bookings ({bookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4.5 py-2.5 font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === "services"
                ? "bg-zinc-900 border-t border-x border-zinc-800 text-yellow-400"
                : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              <span className="flex items-center gap-1.5"><Scissors className="w-4 h-4" /> Treatments Menu ({services.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`px-4.5 py-2.5 font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === "staff"
                ? "bg-zinc-900 border-t border-x border-zinc-800 text-yellow-400"
                : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Barbers Roster ({staff.length})</span>
            </button>
          </div>

          {/* Sub-tab Panes */}
          <div className="py-2">

            {/* 1. Analytics Hub Panel */}
            {activeTab === "analytics" && (
              <div className="space-y-8">

                {/* Micro Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                  {/* Revenue Card */}
                  <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex items-center gap-4">
                    <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Completed Revenue</p>
                      <h4 className="text-2xl font-black text-white font-mono mt-0.5">₹{totalRevenue}</h4>
                    </div>
                  </div>

                  {/* Total Bookings */}
                  <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex items-center gap-4">
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Total Bookings Logged</p>
                      <h4 className="text-2xl font-black text-white font-mono mt-0.5">{totalBookingsCount}</h4>
                    </div>
                  </div>

                  {/* Active Barbers count */}
                  <div className="p-6 bg-zinc-900/40 border border-zinc-850 rounded-2xl flex items-center gap-4">
                    <div className="p-3.5 bg-zinc-800 border border-zinc-700/80 rounded-xl text-zinc-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Assigned Master Barbers</p>
                      <h4 className="text-2xl font-black text-white font-mono mt-0.5">{staff.length} Members</h4>
                    </div>
                  </div>

                </div>

                {/* Analytical Charts Block via Recharts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                  {/* Barchart - service popularity */}
                  <div className="lg:col-span-7 bg-zinc-900/20 border border-zinc-850 rounded-2xl p-6 space-y-4">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white tracking-wide">Popular Hair & Beard Treatments</h4>
                      <p className="text-xs text-zinc-500">Breakdown of reservation quantities by treatment model</p>
                    </div>

                    <div className="h-72">
                      {servicePopularityData().length === 0 ? (
                        <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
                          No booking records to generate graphs. Complete appointments to load statistics.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={servicePopularityData()}>
                            <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#52525b" fontSize={10} tickLine={false} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "10px", fontSize: "12px" }}
                              itemStyle={{ color: "#d4af37" }}
                            />
                            <Bar dataKey="appointments" fill="#d4af37" radius={[4, 4, 0, 0]}>
                              {servicePopularityData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Line/Area stream: Completed Revenue distribution */}
                  <div className="lg:col-span-5 bg-zinc-900/20 border border-zinc-850 rounded-2xl p-6 space-y-4">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white tracking-wide">Financial Flow stream</h4>
                      <p className="text-xs text-zinc-500">Timeline stream of generated sales invoice values</p>
                    </div>

                    <div className="h-72 flex flex-col justify-between">
                      {revenueHistoryData().length === 0 ? (
                        <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
                          No invoice records to graph. Check status values.
                        </div>
                      ) : (
                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-1">
                          {revenueHistoryData().reverse().map((data) => (
                            <div key={data.date} className="flex items-center justify-between p-2.5 bg-zinc-950/40 rounded-xl border border-zinc-850/60 hover:border-zinc-800">
                              <span className="text-xs font-mono font-medium text-zinc-400">{data.date}</span>
                              <span className="text-sm font-bold text-emerald-400 font-mono">+₹{data.revenue}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-zinc-850/60 flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-medium">Accumulating Sum:</span>
                        <span className="font-black text-yellow-400 font-mono">₹{totalRevenue}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 2. Client Bookings Board */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-serif text-xl font-bold text-white tracking-wide">Client Chairs Reservation List</h4>
                  <p className="text-xs text-zinc-500 mt-1">Alter reservation states below. Transitions trigger instant user dashboard refreshes.</p>
                </div>

                {bookings.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 space-y-1.5">
                    <Calendar className="w-8 h-8 text-zinc-700 mx-auto" />
                    <p className="text-sm">No appointment records logged for this salon location.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {bookings.map((bk) => (
                      <div
                        key={bk.id}
                        className="p-5 bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                              ID: {bk.id.replace("bk_", "")}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${bk.status === "confirmed"
                              ? "text-emerald-400 bg-emerald-500/10"
                              : bk.status === "completed"
                                ? "text-blue-400 bg-blue-500/10"
                                : bk.status === "cancelled"
                                  ? "text-red-400 bg-red-500/10"
                                  : "text-yellow-400 bg-yellow-500/10 animate-pulse"
                              }`}>
                              {bk.status}
                            </span>
                          </div>

                          <h5 className="font-serif text-lg font-bold text-white">
                            {bk.serviceName}
                          </h5>

                          <p className="text-xs text-zinc-400">
                            Client: <span className="text-zinc-200 font-semibold">{bk.userName}</span> (<span className="font-mono text-[11px]">{bk.userEmail}</span>)
                          </p>
                          <p className="text-xs text-zinc-400">
                            Carver Staff: <span className="text-zinc-200 font-semibold">{bk.staffName}</span>
                          </p>

                          {bk.notes && (
                            <p className="text-[11px] italic text-zinc-500 bg-zinc-950/40 p-2 border-l border-amber-500/30 rounded mt-2">
                              "{bk.notes}"
                            </p>
                          )}

                          <div className="flex gap-4 text-xs font-mono text-zinc-500 pt-1">
                            <span>📅 {bk.date}</span>
                            <span>⏰ {bk.time}</span>
                          </div>
                        </div>

                        {/* Status Change controls */}
                        <div className="flex flex-col items-end gap-3.5 border-t md:border-t-0 border-zinc-850 pt-3 md:pt-0">
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">service bill</p>
                            <p className="text-2xl font-black text-yellow-400 font-mono">₹{bk.servicePrice}</p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {bk.status === "pending" && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, "confirmed")}
                                className="px-3 py-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900 hover:bg-emerald-900 hover:text-white text-[11px] font-bold uppercase rounded-lg transition-all flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve Reservation
                              </button>
                            )}

                            {bk.status === "confirmed" && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, "completed")}
                                className="px-3 py-1.5 bg-blue-950/40 text-blue-400 border border-blue-900 hover:bg-blue-900 hover:text-white text-[11px] font-bold uppercase rounded-lg transition-all flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Mark Completed
                              </button>
                            )}

                            {bk.status !== "completed" && bk.status !== "cancelled" && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, "cancelled")}
                                className="px-3 py-1.5 bg-red-950/20 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white text-[11px] font-bold uppercase rounded-lg transition-all flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Reject / Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* 3. Treatments Menu Config */}
            {activeTab === "services" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left section: Add form */}
                <div className="lg:col-span-5 bg-zinc-900/10 border border-zinc-850 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-850">
                    <Scissors className="w-4.5 h-4.5 text-amber-500" />
                    <span className="font-serif text-md font-bold text-white">Create New Grooming Service</span>
                  </div>

                  {error && <p className="text-red-400 text-xs italic">{error}</p>}

                  <form onSubmit={handleAddService} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Service Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Razor Edge Fade"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Category Style Unit</label>
                      <select
                        value={newServiceCat}
                        onChange={(e) => setNewServiceCat(e.target.value as any)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
                      >
                        <option value="Haircut" className="bg-zinc-900">Haircut (Shears, Fades)</option>
                        <option value="Beard" className="bg-zinc-900">Beard (Lather lines, Shaping)</option>
                        <option value="Shave" className="bg-zinc-900">Shave (Dry Straight Razors)</option>
                        <option value="Facial" className="bg-zinc-900">Facial (Clay pore, Steam)</option>
                        <option value="Combo" className="bg-zinc-900">Combo (All-inclusive packs)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Price (₹ INR)</label>
                        <input
                          type="number"
                          min={5}
                          max={300}
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg text-xs text-white font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Duration (Minutes)</label>
                        <input
                          type="number"
                          min={10}
                          max={180}
                          value={newServiceDuration}
                          onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg text-xs text-white font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Short Description</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Signature scissors razor cut styled with standard wood-wax."
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg text-xs text-white placeholder-zinc-650 resize-none outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
                    >
                      Publish to Catalog Menu
                    </button>
                  </form>
                </div>

                {/* Right section: catalog render */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="border-b border-zinc-800 pb-2 flex justify-between items-center">
                    <span className="font-serif text-md font-bold text-white">Active Catalog</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded uppercase">
                      Approved Menu
                    </span>
                  </div>

                  {services.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 bg-zinc-900/10 border border-dashed border-zinc-850 rounded-2xl text-xs">
                      No treatments have been added to the online catalog list.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                      {services.map((srv) => (
                        <div
                          key={srv.id}
                          className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl relative group flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-bold text-zinc-200 text-sm">{srv.name}</h5>
                              <span className="text-xs text-yellow-400 font-bold font-mono shrink-0">
                                ₹{srv.price}
                              </span>
                            </div>
                            <span className="inline-block px-1.5 py-0.5 bg-zinc-850 text-zinc-400 text-[9px] font-mono rounded uppercase">
                              {srv.category} • {srv.duration} mins
                            </span>
                            <p className="text-[11px] text-zinc-400 leading-normal pt-1.5">{srv.description}</p>
                          </div>

                          <div className="pt-3 border-t border-zinc-850 mt-2 flex justify-end">
                            <button
                              onClick={() => handleDeleteService(srv.id)}
                              className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                              title="Delete service"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 4. Barbers Staff Roster Pane */}
            {activeTab === "staff" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Add dynamic barber profiles form */}
                <div className="lg:col-span-5 bg-zinc-900/10 border border-zinc-850 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-850">
                    <Award className="w-4.5 h-4.5 text-amber-500" />
                    <span className="font-serif text-md font-bold text-white">Enroll Master Barber / Staff</span>
                  </div>

                  <form onSubmit={handleAddStaff} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Full Staff Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Marcus Sterling"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg text-xs text-white placeholder-zinc-650 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Designated Title</label>
                        <input
                          type="text"
                          required
                          placeholder="Master Barber, Skin Shave Specialist..."
                          value={newStaffRole}
                          onChange={(e) => setNewStaffRole(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Profile Avatar Photo URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={newStaffAvatar}
                        onChange={(e) => setNewStaffAvatar(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
                    >
                      Hire & Assign to Chair
                    </button>
                  </form>
                </div>

                {/* Right section: listing active barbers */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="border-b border-zinc-800 pb-2 font-serif text-md font-bold text-white">
                    Styling Team Directory
                  </div>

                  {staff.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 bg-zinc-900/10 border border-dashed border-zinc-850 rounded-2xl text-xs">
                      No staff members enrolled in team records directories.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                      {staff.map((stf) => (
                        <div
                          key={stf.id}
                          className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={stf.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"}
                              alt={stf.name}
                              className="w-11 h-11 rounded-full object-cover border border-zinc-800"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h5 className="font-bold text-zinc-100 text-sm">{stf.name}</h5>
                              <p className="text-xs text-zinc-500 font-medium">{stf.role}</p>
                              <p className="text-[10px] text-yellow-400 mt-1 select-none font-mono">★ {stf.rating} Rating</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteStaff(stf.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Dismiss Barber"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
