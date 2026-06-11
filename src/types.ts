export type UserRole = "user" | "owner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Opt-out password in client responses for safety, but exists in LocalStorage
  role: UserRole;
  status?: "active" | "suspended";
}

export type SalonStatus = "pending" | "approved" | "suspended";

export interface Salon {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  logoUrl?: string;
  bannerUrl?: string;
  status: SalonStatus;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: "Haircut" | "Beard" | "Shave" | "Facial" | "Combo";
}

export interface Staff {
  id: string;
  salonId: string;
  name: string;
  role: string; // e.g. "Master Barber", "Senior Stylist"
  rating: number;
  avatarUrl?: string;
  skills?: string[]; // IDs of services they specialize in
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  userId: string;
  userName: string; // denormalized for easy rendering
  userEmail: string; // denormalized
  salonId: string;
  salonName: string; // denormalized
  serviceId: string;
  serviceName: string; // denormalized
  servicePrice: number; // denormalized
  staffId: string;
  staffName: string; // denormalized
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}
