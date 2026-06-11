import React, { useState, useEffect } from "react";
import { getStorageItem } from "../utils/storage";
import { api } from "../utils/api";
import { Salon, Service, Staff, Booking, User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Clock, User as UserIcon, ShieldAlert, Sparkles, AlertCircle, FileText, Check } from "lucide-react";

interface BookingModalProps {
  salon: Salon;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ salon, onClose, onSuccess }: BookingModalProps) {
  const currentUser = getStorageItem<User | null>("currentUser", null);
  
  // States
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  // Selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("09:00");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Get current date string for minimum date selection limits
  const todayString = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        // Read services for this salon
        const filteredServices = await api.getServices(salon.id);
        setServices(filteredServices);
        if (filteredServices.length > 0) {
          setSelectedServiceId(filteredServices[0].id);
        }

        // Read staff for this salon
        const filteredStaff = await api.getStaff(salon.id);
        setStaff(filteredStaff);
        if (filteredStaff.length > 0) {
          setSelectedStaffId(filteredStaff[0].id);
        }
      } catch (err: any) {
        setError("Failed to retrieve salon configuration from the database.");
      }
    };

    fetchSalonDetails();
  }, [salon.id]);

  // Handle booking form submission
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (!selectedServiceId) {
      setError("Please select a haircut or beard treatment.");
      return;
    }
    if (!selectedStaffId) {
      setError("Please choose your stylist / master barber.");
      return;
    }
    if (!date) {
      setError("Please select a date for your appointment.");
      return;
    }

    const selectedService = services.find(s => s.id === selectedServiceId);
    const selectedStaff = staff.find(st => st.id === selectedStaffId);

    if (!selectedService || !selectedStaff) {
      setError("Invalid service or staff member selected.");
      return;
    }

    // Prepare booking body
    const newBooking: Booking = {
      id: "bk_" + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      salonId: salon.id,
      salonName: salon.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      date,
      time,
      status: "pending",
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await api.createBooking(newBooking);
      // Done callbacks
      onSuccess();
      onClose();
    } catch (err: any) {
      setError("Failed to secure appointment on the server.");
    }
  };

  // Safe service details getter
  const activeService = services.find(s => s.id === selectedServiceId);

  // Time Slot list
  const availableHours = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Dark Overlay backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Styled Card Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-10"
      >
        {/* Banner Section */}
        <div className="relative h-28 bg-gradient-to-r from-amber-900/60 to-zinc-900 px-6 flex items-center">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 hover:text-white rounded-full text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] rounded uppercase font-semibold tracking-wider font-mono">
              <Sparkles className="w-3 h-3" /> Booking Room
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide mt-1.5">
              Secure Grooming Chair
            </h3>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              at {salon.name}
            </p>
          </div>
        </div>

        {/* Modal Form content */}
        <form onSubmit={handleBookAppointment} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-[12px]">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {services.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-xl space-y-2">
              <ShieldAlert className="w-8 h-8 text-yellow-500 mx-auto" />
              <p className="text-sm">This salon has no grooming services configured yet.</p>
              <p className="text-xs text-zinc-500">Please contact our system administrator or explore another stylist.</p>
              <button 
                type="button" 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-zinc-800 text-xs text-white uppercase tracking-wider font-semibold hover:bg-zinc-700 rounded"
              >
                Go Back
              </button>
            </div>
          ) : (
            <>
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Select Treatment / Service
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                  {services.map((srv) => (
                    <label
                      key={srv.id}
                      className={`flex items-start justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        selectedServiceId === srv.id
                          ? "bg-amber-500/5 border-amber-500/40 text-white"
                          : "bg-zinc-800/20 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="service_selection"
                          value={srv.id}
                          checked={selectedServiceId === srv.id}
                          onChange={() => setSelectedServiceId(srv.id)}
                          className="mt-1 accent-amber-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{srv.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{srv.description}</p>
                          <span className="inline-block px-1.5 py-0.5 bg-zinc-800 text-[10px] text-zinc-400 rounded mt-1.5 font-mono select-none">
                            {srv.duration} mins • {srv.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-yellow-400 font-mono pl-3">
                        ₹{srv.price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Staff Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Select Barber / Stylist
                </label>
                {staff.length === 0 ? (
                  <p className="text-xs text-yellow-500 italic">No barbers available, assigning our best general chair.</p>
                ) : (
                  <div className="flex gap-2.5 overflow-x-auto pb-1.5 justify-start">
                    {staff.map((stf) => {
                      const isSelected = selectedStaffId === stf.id;
                      return (
                        <div
                          key={stf.id}
                          onClick={() => setSelectedStaffId(stf.id)}
                          className={`flex items-center gap-2.5 p-2 px-3 rounded-xl border shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-500/5 border-amber-500/40 text-zinc-100"
                              : "bg-zinc-800/20 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <img
                            src={stf.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"}
                            alt={stf.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold">{stf.name}</p>
                            <p className="text-[10px] text-zinc-500">{stf.role}</p>
                          </div>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-amber-500 ml-1 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date & Time Selections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Date
                  </label>
                  <input
                    type="date"
                    min={todayString}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500/55 rounded-xl text-zinc-200 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Slot Time
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500/55 rounded-xl text-zinc-200 text-sm focus:outline-none"
                  >
                    {availableHours.map((slot) => (
                      <option key={slot} value={slot} className="bg-zinc-900 text-white">
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="flex items-center gap-1 block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Special Requests / Style Instruction
                </label>
                <textarea
                  rows={2}
                  maxLength={250}
                  placeholder="e.g. Skin fade, leave the pomade heavy, sensitive skin shave, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500/55 rounded-xl text-zinc-200 text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Summary and Button */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Total Investment</p>
                  <p className="text-2xl font-black text-yellow-400 font-mono">
                    ₹{activeService ? activeService.price : 0}
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-[#0f1115] hover:brightness-110 active:scale-[0.98] transition-all rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" /> Book Chair Now
                </button>
              </div>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
