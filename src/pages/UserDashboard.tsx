import { useState, useEffect } from "react";
import { getStorageItem, setStorageItem, seedInitialData } from "../utils/storage";
import { api } from "../utils/api";
import { Salon, Booking, User } from "../types";
import { Search, MapPin, Phone, Star, Calendar, Clock, Scissors, Compass, ListRestart, Sparkles, XCircle, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import BookingModal from "../components/BookingModal";
import { motion, AnimatePresence } from "motion/react";

export default function UserDashboard() {
  const currentUser = getStorageItem<User | null>("currentUser", null);

  // States
  const [salons, setSalons] = useState<Salon[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"book" | "history">("book");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Booking Modal trigger
  const [selectedSalonForBooking, setSelectedSalonForBooking] = useState<Salon | null>(null);

  // Curated premium images for distinct salon cards rendering
  const SALON_BANNERS = [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1605497746444-1296151a7db8?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1527799863830-550edd220556?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1634480256802-7cb5b451f99a?auto=format&fit=crop&q=80&w=600"
  ];

  const SALON_LOGOS = [
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1605497746444-1296151a7db8?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1634480256802-7cb5b451f99a?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1527799863830-550edd220556?auto=format&fit=crop&q=80&w=150"
  ];

  const getDeterministicIndex = (str: string, max: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % max;
  };

  // Custom distinct styling parlor images helpers
  const getSalonBanner = (salon: Salon) => {
    const defaultBanners = [
      "photo-1585747860715-2ba37e788b70",
      "photo-1503951914875-452162b0f3f1"
    ];
    const isDefault = !salon.bannerUrl || defaultBanners.some(db => salon.bannerUrl.includes(db));
    if (!isDefault) return salon.bannerUrl;

    const idx = salons.findIndex(s => s.id === salon.id);
    const bannerIdx = idx >= 0 ? idx % SALON_BANNERS.length : getDeterministicIndex(salon.id, SALON_BANNERS.length);
    return SALON_BANNERS[bannerIdx];
  };

  const getSalonLogo = (salon: Salon) => {
    const defaultLogos = [
      "photo-1503951914875-452162b0f3f1",
      "photo-1585747860715-2ba37e788b70"
    ];
    const isDefault = !salon.logoUrl || defaultLogos.some(dl => salon.logoUrl.includes(dl));
    if (!isDefault) return salon.logoUrl;

    const idx = salons.findIndex(s => s.id === salon.id);
    const logoIdx = idx >= 0 ? idx % SALON_LOGOS.length : getDeterministicIndex(salon.id, SALON_LOGOS.length);
    return SALON_LOGOS[logoIdx];
  };

  // Fetch updated records from LocalStorage
  // Fetch updated records from LocalStorage
  const loadDashboardData = async () => {
    try {
      // Only fetch approved salons for the regular user directory
      const storedSalons = await api.getSalons();
      const storedUsers = await api.getUsers();
      const activeOwnerIds = storedUsers.filter(u => u.role === "owner" && u.status !== "suspended").map(u => u.id);

      const approvedSalons = storedSalons.filter(
        (s) => s.status === "approved" && activeOwnerIds.includes(s.ownerId)
      );
      setSalons(approvedSalons);

      // Fetch this user's bookings
      if (currentUser) {
        const storedBookings = await api.getBookings();
        const userBookings = storedBookings.filter(b => b.userId === currentUser.id);
        setBookings(userBookings);
      }
    } catch (err: any) {
      console.error("Failed to load user dashboard database from server:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh from database every 5 seconds to keep real-time alignment
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Handle appointment cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel and permanently remove this elite grooming appointment?")) {
      return;
    }

    try {
      await api.updateBooking(bookingId, { status: "cancelled" });
      loadDashboardData();
    } catch (err: any) {
      console.error("Failed to cancel booking:", err);
    }
  };

  // Filter salons by search query
  const filteredSalons = salons.filter((s) => {
    const term = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.address.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term)
    );
  });

  // Segregate upcoming vs historical appointments
  const upcomingBookings = bookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const completedOrCancelledBookings = bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  // Status Badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            ● Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-full">
            ✓ Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full">
            ✕ Cancelled
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-full animate-pulse">
            ◌ Pending Match
          </span>
        );
    }
  };

  return (
    <div id="user-dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Welcome banner panel */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 to-amber-950/70 border border-zinc-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(circle_at_right,rgba(212,175,55,0.06),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs rounded-full uppercase tracking-widest font-mono">
            <Sparkles className="w-3.5 h-3.5" /> GENTLEMEN SERVICES
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-wide">
            Welcome back, <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">{currentUser?.name}</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Unlock the ultimate grooming potential at New York’s highest ranked barber clubs. View upcoming chair reservations or book styled treatments.
          </p>
        </div>
      </div>

      {/* Core navigation controls: Toggle between directory vs active reservations */}
      <div className="flex border-b border-zinc-900 pb-2">
        <button
          onClick={() => setActiveTab("book")}
          className={`px-6 py-3 font-serif font-bold text-lg tracking-wide border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "book"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Compass className="w-4.5 h-4.5" /> Discover Grooming Hubs
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 font-serif font-bold text-lg tracking-wide border-b-2 flex items-center gap-2 transition-all relative ${
            activeTab === "history"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ListRestart className="w-4.5 h-4.5" /> Appointments History
          {upcomingBookings.length > 0 && (
            <span className="absolute top-2 right-2 flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Central Interactive views */}
      {activeTab === "book" ? (
        <div className="space-y-8">
          
          {/* Active search filter and heading */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white tracking-wide">Available Premier Parlors</h3>
              <p className="text-xs text-zinc-500 mt-1">Select an approved salon partner path to secure grooming services</p>
            </div>
            
            {/* Search Box inputs */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search salons, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-zinc-200 text-sm focus:outline-none placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Salons list rendering */}
          {filteredSalons.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl space-y-3">
              <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="text-zinc-300 font-bold">No Grooming Spots Found</h4>
              <p className="text-zinc-500 text-xs">Try adjusting your search terms or wait for new salon alliances to be added.</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 font-bold text-xs uppercase tracking-wider text-white rounded-xl transition-all"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.map((salon) => (
                <div 
                  key={salon.id}
                  className="bg-zinc-900/40 border border-zinc-850 hover:border-zinc-700/60 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Salon banner images */}
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={getSalonBanner(salon)}
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    
                    {/* Rating flags */}
                    <div className="absolute top-4 left-4 bg-zinc-950/85 backdrop-blur-md px-3 py-1 border border-zinc-850 text-yellow-400 font-bold text-xs rounded-full flex items-center gap-1.5 font-mono select-none">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" /> {salon.rating}
                    </div>

                    {/* Left overlay brand title */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <img 
                        src={getSalonLogo(salon)}
                        alt={salon.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-zinc-900 shadow-md transform group-hover:rotate-3 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Body description parameters */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-serif text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                        {salon.name}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {salon.description}
                      </p>
                    </div>

                    {/* Contacts block */}
                    <div className="space-y-1.5 pt-3 border-t border-zinc-800/60">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span className="truncate">{salon.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span>{salon.phone}</span>
                      </div>
                    </div>

                    {/* Booking Buttons */}
                    <button
                      onClick={() => setSelectedSalonForBooking(salon)}
                      className="w-full py-3 bg-zinc-800/70 border border-zinc-750 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-yellow-500 group-hover:text-[#0f1115] group-hover:border-transparent cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Scissors className="w-4 h-4 text-amber-500 group-hover:text-[#0f1115]" /> Book Styling Chair
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upcoming Reservations */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Upcoming Reservations
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Confirmed or pending matching treatments ready for execution</p>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 space-y-2">
                <Sparkles className="w-6 h-6 text-zinc-700 mx-auto" />
                <p className="text-sm">No current upcoming reservations.</p>
                <p className="text-[11px] text-zinc-600">Discover premium salons to book cutting-edge styling models.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((bk) => (
                  <div 
                    key={bk.id}
                    className="p-5 bg-zinc-900/50 border border-zinc-850 hover:border-zinc-850 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest bg-zinc-800/80 px-2 py-0.5 rounded">
                          {bk.salonName}
                        </span>
                        {getStatusBadge(bk.status)}
                      </div>
                      
                      <h4 className="font-serif text-lg font-bold text-white">{bk.serviceName}</h4>
                      <p className="text-xs text-zinc-400">Stylist / Carver: <span className="text-zinc-200 font-semibold">{bk.staffName}</span></p>
                      
                      {bk.notes && (
                        <p className="text-[11px] italic text-zinc-500 bg-zinc-950/40 p-2 border-l border-amber-500/30 rounded mt-2">
                          "{bk.notes}"
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-400 select-none pt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-amber-500" /> {bk.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" /> {bk.time}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                      <div>
                        <p className="text-[10px] text-zinc-500 text-right uppercase tracking-wider">Amount Paid</p>
                        <p className="text-xl font-black text-yellow-400 font-mono text-right">₹{bk.servicePrice}</p>
                      </div>

                      {/* Cancel Booking only allowed when not completed */}
                      {bk.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelBooking(bk.id)}
                          className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/50 hover:text-red-300 text-xs text-red-400 border border-red-900/30 rounded-lg transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Cancel Chair
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Historical / Completed bookings */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" /> Historical Treatments list
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Grooming sessions successfully accomplished or retracted</p>
            </div>

            {completedOrCancelledBookings.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl text-zinc-600 space-y-2">
                <Sparkles className="w-6 h-6 text-zinc-700/60 mx-auto" />
                <p className="text-sm">No entries logged in booking memory history.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                {completedOrCancelledBookings.map((bk) => (
                  <div 
                    key={bk.id}
                    className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{bk.salonName}</span>
                        {getStatusBadge(bk.status)}
                      </div>
                      <h4 className="text-sm font-bold text-zinc-200">{bk.serviceName}</h4>
                      <p className="text-[10px] text-zinc-500">Stylist: {bk.staffName} • {bk.date} @ {bk.time}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-400 font-mono">₹{bk.servicePrice}</p>
                      <p className="text-[9px] text-zinc-600 font-mono">Invoice Approved</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Appointment Booking Sheet Modals */}
      <AnimatePresence>
        {selectedSalonForBooking && (
          <BookingModal
            salon={selectedSalonForBooking}
            onClose={() => setSelectedSalonForBooking(null)}
            onSuccess={() => {
              loadDashboardData();
              setActiveTab("history"); // Immediately auto-toggle standard history tab to preview!
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
