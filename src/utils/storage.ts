import { User, Salon, Service, Staff, Booking, UserRole } from "../types";

// Helper to safely write to localStorage
export const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Helper to safely read from localStorage
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Initial data seed if LocalStorage is empty
export const seedInitialData = (): void => {
  // 1. Seed Users
  const currentUsers = getStorageItem<User[]>("users", []);
  if (currentUsers.length === 0) {
    const demoUsers: User[] = [
      {
        id: "usr_1",
        name: "Arthur Pendragon",
        email: "user@stylesync.com",
        password: "password",
        role: "user",
        status: "active",
      },
      {
        id: "owner_1",
        name: "Julian Blackstone",
        email: "owner@stylesync.com",
        password: "password",
        role: "owner",
        status: "active",
      },
      {
        id: "adm_1",
        name: "Admin Paramount",
        email: "admin@stylesync.com",
        password: "password",
        role: "admin",
        status: "active",
      },
      {
        id: "usr_2",
        name: "Logan Harrison",
        email: "logan@stylesync.com",
        password: "password",
        role: "user",
        status: "active",
      }
    ];
    setStorageItem("users", demoUsers);
  }

  // 2. Seed Salons
  const currentSalons = getStorageItem<Salon[]>("salons", []);
  if (currentSalons.length === 0) {
    const demoSalons: Salon[] = [
      {
        id: "salon_1",
        ownerId: "owner_1",
        name: "The Golden Razor Elite",
        description: "An authentic, premium grooming club combining traditional wet-shaving luxury with avant-garde modern styling. Indulge in complimentary single-malt scotch during your styling experience.",
        address: "742 Amber Boulevard, Manhattan, NY",
        phone: "+1 (555) 123-4567",
        rating: 4.9,
        logoUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=200",
        bannerUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200",
        status: "approved",
      },
      {
        id: "salon_2",
        ownerId: "owner_1",
        name: "Blackwood Barber Club",
        description: "Rustic dark timber vibes, vintage leather parlor chairs, and masters of the straight razor. StyleSync's signature destination for tailored gentlemen's beard care and executive treatments.",
        address: "18 Executive Arch Lane, Brooklyn, NY",
        phone: "+1 (555) 987-6543",
        rating: 4.7,
        logoUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=200",
        bannerUrl: "https://images.unsplash.com/photo-1605497746444-1296151a7db8?auto=format&fit=crop&q=80&w=1200",
        status: "approved",
      },
      {
        id: "salon_3",
        ownerId: "owner_new_id_placeholder",
        name: "Apex Vanguard Grooming",
        description: "Futuristic men's styling studio focused on precision clipper art, skin fades, and advanced scalp therapy.",
        address: "33 Highline Terrace, Queens, NY",
        phone: "+1 (555) 441-2090",
        rating: 4.5,
        logoUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=200",
        bannerUrl: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=1200",
        status: "pending", // Pending approval so admin can approve!
      }
    ];
    setStorageItem("salons", demoSalons);
  } else {
    // Migration block: Ensure existing local storage data receives the updated distinct image links
    let migrated = false;
    const updated = currentSalons.map((s) => {
      if (s.id === "salon_1" && s.logoUrl?.includes("photo-1503951914875-452162b0f3f1")) {
        s.logoUrl = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=200";
        migrated = true;
      }
      if (s.id === "salon_2" && s.bannerUrl?.includes("photo-1503951914875-452162b0f3f1")) {
        s.bannerUrl = "https://images.unsplash.com/photo-1605497746444-1296151a7db8?auto=format&fit=crop&q=80&w=1200";
        migrated = true;
      }
      if (s.id === "salon_3" && s.logoUrl?.includes("photo-1599351431202-1e0f0137899a")) {
        s.logoUrl = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=200";
        s.bannerUrl = "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=1200";
        migrated = true;
      }
      return s;
    });
    if (migrated) {
      setStorageItem("salons", updated);
    }
  }

  // 3. Seed Services
  const currentServices = getStorageItem<Service[]>("services", []);
  if (currentServices.length === 0) {
    const demoServices: Service[] = [
      // Salon 1: Golden Razor
      {
        id: "srv_1_1",
        salonId: "salon_1",
        name: "Royal Golden Cut",
        description: "Our signature shears style with deep clarifying shampoo wash, relaxing neck massage, and professional pomade finish.",
        price: 55,
        duration: 45,
        category: "Haircut",
      },
      {
        id: "srv_1_2",
        salonId: "salon_1",
        name: "Imperial Hot Towel Shave",
        description: "Traditional straight razor hot lather shave, accompanied by aromatherapy pre-shave oils and sandlewood cooling splash.",
        price: 45,
        duration: 35,
        category: "Shave",
      },
      {
        id: "srv_1_3",
        salonId: "salon_1",
        name: "Golden Beard Sculpting & Razor Trim",
        description: "Detailed beard reshaping, fade integration, line-up with fresh steel razor, and organic wood-infused beard oils.",
        price: 35,
        duration: 30,
        category: "Beard",
      },
      {
        id: "srv_1_4",
        salonId: "salon_1",
        name: "Oxygen Refreshing Facial Service",
        description: "Fine pore-cleansing clay mask, steam therapy, and cold-stone hydration finish to reverse urban air fatigue.",
        price: 40,
        duration: 25,
        category: "Facial",
      },
      {
        id: "srv_1_5",
        salonId: "salon_1",
        name: "The Golden Crown King Package",
        description: "The ultimate styling package: Royal Golden Cut + Imperial Hot Towel Shave + Beard Trim and mud face treatment.",
        price: 110,
        duration: 90,
        category: "Combo",
      },

      // Salon 2: Blackwood Barber Club
      {
        id: "srv_2_1",
        salonId: "salon_2",
        name: "Executive Taper & Cut",
        description: "Contemporary styling with standard razor back-line, complete with fine herbal styling tonic.",
        price: 45,
        duration: 40,
        category: "Haircut",
      },
      {
        id: "srv_2_2",
        salonId: "salon_2",
        name: "Blackwood Signature Shave",
        description: "Double lather shave with premium badger-hair brush, warm steam towels, and restorative cold clay mask.",
        price: 38,
        duration: 30,
        category: "Shave",
      },
      {
        id: "srv_2_3",
        salonId: "salon_2",
        name: "Sleek Beard Trim & Hydrate",
        description: "Clipper trim, mustache sculpting, and beard-butter combing for softness and structural hold.",
        price: 28,
        duration: 20,
        category: "Beard",
      }
    ];
    setStorageItem("services", demoServices);
  }

  // 4. Seed Staff
  const currentStaff = getStorageItem<Staff[]>("staff", []);
  if (currentStaff.length === 0) {
    const demoStaff: Staff[] = [
      // Salon 1
      {
        id: "stf_1_1",
        salonId: "salon_1",
        name: "Viktor Vance",
        role: "Master Barber",
        rating: 4.9,
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        skills: ["srv_1_1", "srv_1_3", "srv_1_5"],
      },
      {
        id: "stf_1_2",
        salonId: "salon_1",
        name: "Marcus Sterling",
        role: "Wet Shave Specialist",
        rating: 4.8,
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        skills: ["srv_1_2", "srv_1_3", "srv_1_4"],
      },
      {
        id: "stf_1_3",
        salonId: "salon_1",
        name: "Julian Stone",
        role: "Top Tier Stylist",
        rating: 4.7,
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
        skills: ["srv_1_1", "srv_1_4", "srv_1_5"],
      },

      // Salon 2
      {
        id: "stf_2_1",
        salonId: "salon_2",
        name: "Silas Vance",
        role: "Lead Barber",
        rating: 4.9,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        skills: ["srv_2_1", "srv_2_3"],
      },
      {
        id: "stf_2_2",
        salonId: "salon_2",
        name: "Daniel Blackwood",
        role: "Shaving Connoisseur",
        rating: 4.6,
        avatarUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=150",
        skills: ["srv_2_2", "srv_2_3"],
      }
    ];
    setStorageItem("staff", demoStaff);
  }

  // 5. Seed Bookings
  const currentBookings = getStorageItem<Booking[]>("bookings", []);
  if (currentBookings.length === 0) {
    const today = new Date();
    const getDateWithOffset = (offset: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      return d.toISOString().split("T")[0];
    };

    const demoBookings: Booking[] = [
      // Historic finished bookings (for robust analytics!)
      {
        id: "bk_1",
        userId: "usr_1",
        userName: "Arthur Pendragon",
        userEmail: "user@stylesync.com",
        salonId: "salon_1",
        salonName: "The Golden Razor Elite",
        serviceId: "srv_1_1",
        serviceName: "Royal Golden Cut",
        servicePrice: 55,
        staffId: "stf_1_1",
        staffName: "Viktor Vance",
        date: getDateWithOffset(-6),
        time: "10:30",
        status: "completed",
        notes: "Keeps his fade extremely short, style neatly.",
        createdAt: new Date(getDateWithOffset(-10)).toISOString(),
      },
      {
        id: "bk_2",
        userId: "usr_2",
        userName: "Logan Harrison",
        userEmail: "logan@stylesync.com",
        salonId: "salon_1",
        salonName: "The Golden Razor Elite",
        serviceId: "srv_1_5",
        serviceName: "The Golden Crown King Package",
        servicePrice: 110,
        staffId: "stf_1_3",
        staffName: "Julian Stone",
        date: getDateWithOffset(-4),
        time: "14:00",
        status: "completed",
        notes: "Wants premium scotch whiskey served cold.",
        createdAt: new Date(getDateWithOffset(-5)).toISOString(),
      },
      {
        id: "bk_3",
        userId: "usr_1",
        userName: "Arthur Pendragon",
        userEmail: "user@stylesync.com",
        salonId: "salon_1",
        salonName: "The Golden Razor Elite",
        serviceId: "srv_1_2",
        serviceName: "Imperial Hot Towel Shave",
        servicePrice: 45,
        staffId: "stf_1_2",
        staffName: "Marcus Sterling",
        date: getDateWithOffset(-3),
        time: "11:00",
        status: "completed",
        createdAt: new Date(getDateWithOffset(-3)).toISOString(),
      },
      {
        id: "bk_4",
        userId: "usr_2",
        userName: "Logan Harrison",
        userEmail: "logan@stylesync.com",
        salonId: "salon_2",
        salonName: "Blackwood Barber Club",
        serviceId: "srv_2_1",
        serviceName: "Executive Taper & Cut",
        servicePrice: 45,
        staffId: "stf_2_1",
        staffName: "Silas Vance",
        date: getDateWithOffset(-2),
        time: "09:00",
        status: "completed",
        createdAt: new Date(getDateWithOffset(-4)).toISOString(),
      },
      {
        id: "bk_5",
        userId: "usr_1",
        userName: "Arthur Pendragon",
        userEmail: "user@stylesync.com",
        salonId: "salon_2",
        salonName: "Blackwood Barber Club",
        serviceId: "srv_2_3",
        serviceName: "Sleek Beard Trim & Hydrate",
        servicePrice: 28,
        staffId: "stf_2_2",
        staffName: "Daniel Blackwood",
        date: getDateWithOffset(-1),
        time: "17:30",
        status: "completed",
        createdAt: new Date(getDateWithOffset(-2)).toISOString(),
      },
      {
        id: "bk_6",
        userId: "usr_2",
        userName: "Logan Harrison",
        userEmail: "logan@stylesync.com",
        salonId: "salon_1",
        salonName: "The Golden Razor Elite",
        serviceId: "srv_1_3",
        serviceName: "Golden Beard Sculpting & Razor Trim",
        servicePrice: 35,
        staffId: "stf_1_1",
        staffName: "Viktor Vance",
        date: getDateWithOffset(-5),
        time: "15:15",
        status: "completed",
        createdAt: new Date(getDateWithOffset(-5)).toISOString(),
      },
      // Cancelled booking for analytics depth
      {
        id: "bk_7",
        userId: "usr_1",
        userName: "Arthur Pendragon",
        userEmail: "user@stylesync.com",
        salonId: "salon_1",
        salonName: "The Golden Razor Elite",
        serviceId: "srv_1_4",
        serviceName: "Oxygen Refreshing Facial Service",
        servicePrice: 40,
        staffId: "stf_1_2",
        staffName: "Marcus Sterling",
        date: getDateWithOffset(-2),
        time: "12:00",
        status: "cancelled",
        createdAt: new Date(getDateWithOffset(-2)).toISOString(),
      },

      // INCOMING ACTIVE BOOKINGS
      {
        id: "bk_8",
        userId: "usr_1",
        userName: "Arthur Pendragon",
        userEmail: "user@stylesync.com",
        salonId: "salon_1",
        salonName: "The Golden Razor Elite",
        serviceId: "srv_1_1",
        serviceName: "Royal Golden Cut",
        servicePrice: 55,
        staffId: "stf_1_1",
        staffName: "Viktor Vance",
        date: getDateWithOffset(1),
        time: "10:00",
        status: "confirmed",
        notes: "Gearing up for a high-profile business meeting.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "bk_9",
        userId: "usr_1",
        userName: "Arthur Pendragon",
        userEmail: "user@stylesync.com",
        salonId: "salon_1",
        salonName: "The Golden Razor Elite",
        serviceId: "srv_1_3",
        serviceName: "Golden Beard Sculpting & Razor Trim",
        servicePrice: 35,
        staffId: "stf_1_2",
        staffName: "Marcus Sterling",
        date: getDateWithOffset(2),
        time: "15:00",
        status: "pending",
        notes: "Keep line clean, fade nicely into sidewalls.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "bk_10",
        userId: "usr_2",
        userName: "Logan Harrison",
        userEmail: "logan@stylesync.com",
        salonId: "salon_2",
        salonName: "Blackwood Barber Club",
        serviceId: "srv_2_1",
        serviceName: "Executive Taper & Cut",
        servicePrice: 45,
        staffId: "stf_2_1",
        staffName: "Silas Vance",
        date: getDateWithOffset(3),
        time: "11:30",
        status: "pending",
        createdAt: new Date().toISOString(),
      }
    ];

    setStorageItem("bookings", demoBookings);
  }
};
