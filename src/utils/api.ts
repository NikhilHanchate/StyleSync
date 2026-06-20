import { supabase, isConfigured } from "./supabaseClient";
import { getStorageItem, setStorageItem } from "./storage";
import { User, Salon, Service, Staff, Booking } from "../types";

export const api = {
  // Users/Auth
  getUsers: async (): Promise<User[]> => {
    if (!isConfigured) {
      return getStorageItem<User[]>("users", []);
    }
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    return (data || []) as User[];
  },
  
  registerUser: async (user: Partial<User>): Promise<User> => {
    if (!isConfigured) {
      const allUsers = getStorageItem<User[]>("users", []);
      const newUser = {
        id: user.id || `usr_${Date.now()}`,
        name: user.name || "Stylist",
        email: user.email || "",
        password: user.password || "",
        role: user.role || "user",
        status: user.status || "active",
      } as User;
      allUsers.push(newUser);
      setStorageItem("users", allUsers);
      return newUser;
    }
    const { data, error } = await supabase
      .from("users")
      .insert([user])
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  updateUser: async (id: string, fields: Partial<User>): Promise<User> => {
    if (!isConfigured) {
      const allUsers = getStorageItem<User[]>("users", []);
      const index = allUsers.findIndex((u) => u.id === id);
      if (index === -1) throw new Error("User not found locally");
      const updatedUser = { ...allUsers[index], ...fields };
      allUsers[index] = updatedUser;
      setStorageItem("users", allUsers);
      return updatedUser;
    }
    const { data, error } = await supabase
      .from("users")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  // Salons
  getSalons: async (ownerId?: string): Promise<Salon[]> => {
    if (!isConfigured) {
      const salons = getStorageItem<Salon[]>("salons", []);
      return ownerId ? salons.filter((s) => s.ownerId === ownerId) : salons;
    }
    let query = supabase.from("salons").select("*");
    if (ownerId) {
      query = query.eq("ownerId", ownerId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Salon[];
  },

  createSalon: async (salon: Partial<Salon>): Promise<Salon> => {
    if (!isConfigured) {
      const salons = getStorageItem<Salon[]>("salons", []);
      const newSalon = {
        id: salon.id || `salon_${Date.now()}`,
        ownerId: salon.ownerId || "",
        name: salon.name || "",
        description: salon.description || "",
        address: salon.address || "",
        phone: salon.phone || "",
        rating: salon.rating || 5.0,
        logoUrl: salon.logoUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=200",
        bannerUrl: salon.bannerUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
        status: salon.status || "pending",
      } as Salon;
      salons.push(newSalon);
      setStorageItem("salons", salons);
      return newSalon;
    }
    const { data, error } = await supabase
      .from("salons")
      .insert([salon])
      .select()
      .single();
    if (error) throw error;
    return data as Salon;
  },

  updateSalon: async (id: string, fields: Partial<Salon>): Promise<Salon> => {
    if (!isConfigured) {
      const salons = getStorageItem<Salon[]>("salons", []);
      const index = salons.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Salon not found locally");
      const updatedSalon = { ...salons[index], ...fields };
      salons[index] = updatedSalon;
      setStorageItem("salons", salons);
      return updatedSalon;
    }
    const { data, error } = await supabase
      .from("salons")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Salon;
  },

  // Services
  getServices: async (salonId?: string): Promise<Service[]> => {
    if (!isConfigured) {
      const services = getStorageItem<Service[]>("services", []);
      return salonId ? services.filter((s) => s.salonId === salonId) : services;
    }
    let query = supabase.from("services").select("*");
    if (salonId) {
      query = query.eq("salonId", salonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Service[];
  },

  createService: async (service: Partial<Service>): Promise<Service> => {
    if (!isConfigured) {
      const services = getStorageItem<Service[]>("services", []);
      const newService = {
        id: service.id || `srv_${Date.now()}`,
        salonId: service.salonId || "",
        name: service.name || "",
        description: service.description || "",
        price: service.price || 0,
        duration: service.duration || 30,
        category: service.category || "Haircut",
      } as Service;
      services.push(newService);
      setStorageItem("services", services);
      return newService;
    }
    const { data, error } = await supabase
      .from("services")
      .insert([service])
      .select()
      .single();
    if (error) throw error;
    return data as Service;
  },

  deleteService: async (id: string): Promise<{ success: boolean }> => {
    if (!isConfigured) {
      const services = getStorageItem<Service[]>("services", []);
      const updated = services.filter((s) => s.id !== id);
      setStorageItem("services", updated);
      return { success: true };
    }
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // Staff
  getStaff: async (salonId?: string): Promise<Staff[]> => {
    if (!isConfigured) {
      const staff = getStorageItem<Staff[]>("staff", []);
      return salonId ? staff.filter((s) => s.salonId === salonId) : staff;
    }
    let query = supabase.from("staff").select("*");
    if (salonId) {
      query = query.eq("salonId", salonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Staff[];
  },

  createStaff: async (staff: Partial<Staff>): Promise<Staff> => {
    if (!isConfigured) {
      const staffList = getStorageItem<Staff[]>("staff", []);
      const newStaff = {
        id: staff.id || `stf_${Date.now()}`,
        salonId: staff.salonId || "",
        name: staff.name || "",
        role: staff.role || "Barber",
        rating: staff.rating || 5.0,
        avatarUrl: staff.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        skills: staff.skills || [],
      } as Staff;
      staffList.push(newStaff);
      setStorageItem("staff", staffList);
      return newStaff;
    }
    const { skills, ...dbStaff } = staff;
    const { data, error } = await supabase
      .from("staff")
      .insert([dbStaff])
      .select()
      .single();
    if (error) throw error;
    return data as Staff;
  },

  deleteStaff: async (id: string): Promise<{ success: boolean }> => {
    if (!isConfigured) {
      const staffList = getStorageItem<Staff[]>("staff", []);
      const updated = staffList.filter((s) => s.id !== id);
      setStorageItem("staff", updated);
      return { success: true };
    }
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // Bookings
  getBookings: async (salonId?: string): Promise<Booking[]> => {
    if (!isConfigured) {
      const bookings = getStorageItem<Booking[]>("bookings", []);
      return salonId ? bookings.filter((b) => b.salonId === salonId) : bookings;
    }
    let query = supabase.from("bookings").select("*");
    if (salonId) {
      query = query.eq("salonId", salonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Booking[];
  },

  createBooking: async (booking: Partial<Booking>): Promise<Booking> => {
    if (!isConfigured) {
      const bookings = getStorageItem<Booking[]>("bookings", []);
      const newBooking = {
        id: booking.id || `bk_${Date.now()}`,
        userId: booking.userId || "",
        userName: booking.userName || "",
        userEmail: booking.userEmail || "",
        salonId: booking.salonId || "",
        salonName: booking.salonName || "",
        serviceId: booking.serviceId || "",
        serviceName: booking.serviceName || "",
        servicePrice: booking.servicePrice || 0,
        staffId: booking.staffId || "",
        staffName: booking.staffName || "",
        date: booking.date || "",
        time: booking.time || "",
        status: booking.status || "pending",
        notes: booking.notes || "",
        createdAt: booking.createdAt || new Date().toISOString(),
      } as Booking;
      bookings.push(newBooking);
      setStorageItem("bookings", bookings);
      return newBooking;
    }
    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();
    if (error) throw error;
    return data as Booking;
  },

  updateBooking: async (id: string, fields: Partial<Booking>): Promise<Booking> => {
    if (!isConfigured) {
      const bookings = getStorageItem<Booking[]>("bookings", []);
      const index = bookings.findIndex((b) => b.id === id);
      if (index === -1) throw new Error("Booking not found locally");
      const updatedBooking = { ...bookings[index], ...fields };
      bookings[index] = updatedBooking;
      setStorageItem("bookings", bookings);
      return updatedBooking;
    }
    const { data, error } = await supabase
      .from("bookings")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Booking;
  },
};
