import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(express.json());

// Custom self-contained CORS middleware (avoids external dependency issues)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const DB_PATH = path.join(__dirname, "db.json");

interface Database {
  users: any[];
  salons: any[];
  services: any[];
  staff: any[];
  bookings: any[];
}

// Seeding helpers
const today = new Date();
const getDateWithOffset = (offset: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const getInitialData = (): Database => {
  return {
    users: [
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
    ],
    salons: [
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
        status: "pending",
      }
    ],
    services: [
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
    ],
    staff: [
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
    ],
    bookings: [
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
    ]
  };
};

const readDB = (): Database => {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = getInitialData();
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), "utf8");
    return defaultData;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data) as Database;
  } catch (e) {
    const defaultData = getInitialData();
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), "utf8");
    return defaultData;
  }
};

const writeDB = (db: Database) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
};

// --- AUTH / USER ENDPOINTS ---
app.get("/api/users", (req, res) => {
  const db = readDB();
  res.json(db.users);
});

app.post("/api/users", (req, res) => {
  const db = readDB();
  const newUser = req.body;
  if (!newUser.id) {
    newUser.id = "usr_" + Date.now();
  }
  if (!newUser.status) {
    newUser.status = "active";
  }
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updatedUserFields = req.body;
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx >= 0) {
    db.users[idx] = { ...db.users[idx], ...updatedUserFields };
    writeDB(db);
    return res.json(db.users[idx]);
  }
  res.status(404).json({ error: "User not found" });
});

// --- SALON ENDPOINTS ---
app.get("/api/salons", (req, res) => {
  const db = readDB();
  res.json(db.salons);
});

app.post("/api/salons", (req, res) => {
  const db = readDB();
  const newSalon = req.body;
  if (!newSalon.id) {
    newSalon.id = "salon_" + Date.now();
  }
  db.salons.push(newSalon);
  writeDB(db);
  res.status(201).json(newSalon);
});

app.put("/api/salons/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updatedFields = req.body;
  const idx = db.salons.findIndex((s) => s.id === id);
  if (idx >= 0) {
    db.salons[idx] = { ...db.salons[idx], ...updatedFields };
    writeDB(db);
    return res.json(db.salons[idx]);
  }
  res.status(404).json({ error: "Salon not found" });
});

// --- SERVICES ENDPOINTS ---
app.get("/api/services", (req, res) => {
  const db = readDB();
  res.json(db.services);
});

app.post("/api/services", (req, res) => {
  const db = readDB();
  const newService = req.body;
  if (!newService.id) {
    newService.id = "srv_" + Date.now();
  }
  db.services.push(newService);
  writeDB(db);
  res.status(201).json(newService);
});

app.delete("/api/services/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.services = db.services.filter((s) => s.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// --- STAFF ENDPOINTS ---
app.get("/api/staff", (req, res) => {
  const db = readDB();
  res.json(db.staff);
});

app.post("/api/staff", (req, res) => {
  const db = readDB();
  const newStaff = req.body;
  if (!newStaff.id) {
    newStaff.id = "stf_" + Date.now();
  }
  db.staff.push(newStaff);
  writeDB(db);
  res.status(201).json(newStaff);
});

app.delete("/api/staff/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.staff = db.staff.filter((s) => s.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// --- BOOKINGS ENDPOINTS ---
app.get("/api/bookings", (req, res) => {
  const db = readDB();
  res.json(db.bookings);
});

app.post("/api/bookings", (req, res) => {
  const db = readDB();
  const newBooking = req.body;
  if (!newBooking.id) {
    newBooking.id = "bk_" + Date.now();
  }
  db.bookings.push(newBooking);
  writeDB(db);
  res.status(201).json(newBooking);
});

app.put("/api/bookings/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updatedFields = req.body;
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx >= 0) {
    db.bookings[idx] = { ...db.bookings[idx], ...updatedFields };
    writeDB(db);
    return res.json(db.bookings[idx]);
  }
  res.status(404).json({ error: "Booking not found" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`StyleSync Node.js backend server listening at http://localhost:${port}`);
});
