import { supabase } from "./supabaseClient";
import { User, Salon, Service, Staff, Booking } from "../types";

export const api = {
  // Users/Auth
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    return (data || []) as User[];
  },
  
  registerUser: async (user: Partial<User>): Promise<User> => {
    const { data, error } = await supabase
      .from("users")
      .insert([user])
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  updateUser: async (id: string, fields: Partial<User>): Promise<User> => {
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
    let query = supabase.from("salons").select("*");
    if (ownerId) {
      query = query.eq("ownerId", ownerId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Salon[];
  },

  createSalon: async (salon: Partial<Salon>): Promise<Salon> => {
    const { data, error } = await supabase
      .from("salons")
      .insert([salon])
      .select()
      .single();
    if (error) throw error;
    return data as Salon;
  },

  updateSalon: async (id: string, fields: Partial<Salon>): Promise<Salon> => {
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
    let query = supabase.from("services").select("*");
    if (salonId) {
      query = query.eq("salonId", salonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Service[];
  },

  createService: async (service: Partial<Service>): Promise<Service> => {
    const { data, error } = await supabase
      .from("services")
      .insert([service])
      .select()
      .single();
    if (error) throw error;
    return data as Service;
  },

  deleteService: async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // Staff
  getStaff: async (salonId?: string): Promise<Staff[]> => {
    let query = supabase.from("staff").select("*");
    if (salonId) {
      query = query.eq("salonId", salonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Staff[];
  },

  createStaff: async (staff: Partial<Staff>): Promise<Staff> => {
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
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // Bookings
  getBookings: async (salonId?: string): Promise<Booking[]> => {
    let query = supabase.from("bookings").select("*");
    if (salonId) {
      query = query.eq("salonId", salonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Booking[];
  },

  createBooking: async (booking: Partial<Booking>): Promise<Booking> => {
    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();
    if (error) throw error;
    return data as Booking;
  },

  updateBooking: async (id: string, fields: Partial<Booking>): Promise<Booking> => {
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
