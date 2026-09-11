import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { initDatabase, pool } from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "et_media_super_secret_jwt_key_2026";

// Enable CORS for Express and Socket.IO
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(express.json());

// Serve static assets from public folder (including compiled frontend build)
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Candidate paths for frontend build
const candidatePaths = [
  publicPath,
  path.resolve(process.cwd(), "backend", "public"),
  path.resolve(process.cwd(), "frontend", "dist"),
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../frontend/dist"),
];

let activeFrontendDist: string | null = null;
for (const candidate of candidatePaths) {
  if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, "index.html"))) {
    activeFrontendDist = candidate;
    break;
  }
}

if (activeFrontendDist) {
  console.log(`[Static] Serving frontend build from: ${activeFrontendDist}`);
  app.use(express.static(activeFrontendDist));
}

app.get(["/favicon.ico", "/favicon.png"], (_req, res) => {
  res.sendFile(path.join(publicPath, "favicon.ico"));
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let liveActiveUsers = 0;

// Socket.IO real-time event handlers
io.on("connection", (socket) => {
  liveActiveUsers++;
  console.log(`[Socket.IO] Client connected: ${socket.id} (Active Users: ${liveActiveUsers})`);

  io.emit("live_users_update", { activeUsers: liveActiveUsers });

  socket.on("disconnect", () => {
    liveActiveUsers = Math.max(0, liveActiveUsers - 1);
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (Active Users: ${liveActiveUsers})`);
    io.emit("live_users_update", { activeUsers: liveActiveUsers });
  });

  socket.on("get_initial_data", async () => {
    try {
      let totalRegistrations = 0;
      let recentRegistrations: any[] = [];

      if (pool) {
        const [regCount]: any = await pool.query("SELECT COUNT(*) as count FROM registrations");
        totalRegistrations = regCount[0]?.count || 0;

        const [recent]: any = await pool.query("SELECT * FROM registrations ORDER BY created_at DESC LIMIT 5");
        recentRegistrations = recent;
      }

      socket.emit("initial_data", {
        activeUsers: liveActiveUsers,
        totalRegistrations,
        recentRegistrations,
      });
    } catch (err) {
      console.error("[Socket.IO] Error fetching initial data:", err);
    }
  });
});

// Middleware: Authenticate Admin Token
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized access. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (req as any).admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
};

// --- PUBLIC REST API ENDPOINTS ---

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ET Media Business Intelligence Backend",
    timestamp: new Date().toISOString(),
    activeSockets: liveActiveUsers,
    database: pool ? "connected" : "disconnected",
  });
});

// 2. Events listing
app.get("/api/events", (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: "cfo-leadership-summit",
        slug: "cfo-leadership-summit-2026",
        title: "India CFO & Finance Leadership Summit 2026",
        category: "Conference & Leadership",
        date: "October 24, 2026",
        city: "Mumbai",
        time: "09:00 AM — 06:00 PM",
        speakers: 28,
        status: "upcoming",
        description: "Reinventing capital allocation, enterprise risk and AI-driven financial strategies.",
      },
      {
        id: "hr-excellence-awards",
        slug: "hr-excellence-awards-2026",
        title: "National HR Excellence & Workplace Awards",
        category: "Awards & Recognition",
        date: "November 18, 2026",
        city: "Bengaluru",
        time: "05:00 PM — 10:00 PM",
        speakers: 16,
        status: "upcoming",
        description: "Honouring chief human resource officers and organisations building elite work cultures.",
      },
      {
        id: "tech-enterprise-summit",
        slug: "tech-enterprise-summit-2026",
        title: "Enterprise Technology & AI Leadership Conclave",
        category: "Summit & Tech",
        date: "December 05, 2026",
        city: "Hyderabad",
        time: "09:30 AM — 05:30 PM",
        speakers: 34,
        status: "upcoming",
        description: "Connecting CIOs, CTOs, and tech leaders deploying generative AI and cloud infrastructure.",
      },
    ],
  });
});

// 3. Event registration endpoint
app.post("/api/events/register", async (req, res) => {
  const { name, email, phone, organization, designation, eventId } = req.body;

  if (!name || !email || !eventId) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and event ID are required fields.",
    });
  }

  const regId = `REG-${Date.now()}`;
  const newRegistration = {
    id: regId,
    name,
    email,
    phone: phone || "N/A",
    organization: organization || "Independent Leader",
    designation: designation || "Executive Delegate",
    eventId,
    registeredAt: new Date().toISOString(),
  };

  try {
    if (pool) {
      await pool.query(
        "INSERT INTO registrations (id, name, email, phone, organization, designation, event_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [regId, name, email, newRegistration.phone, newRegistration.organization, newRegistration.designation, eventId]
      );
    }

    // Get total count
    let totalCount = 1;
    if (pool) {
      const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM registrations");
      totalCount = rows[0]?.count || 1;
    }

    // REALTIME BROADCAST
    io.emit("new_registration", {
      registration: newRegistration,
      totalRegistrations: totalCount,
      message: `🎉 ${name} from ${newRegistration.organization} just registered!`,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: newRegistration,
    });
  } catch (err) {
    console.error("Registration DB Error:", err);
    return res.status(500).json({ success: false, message: "Database registration error." });
  }
});

// 4. Contact form submission
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, enquiryType, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required.",
    });
  }

  const enqId = `ENQ-${Date.now()}`;
  const newEnquiry = {
    id: enqId,
    name,
    email,
    phone: phone || "N/A",
    enquiryType: enquiryType || "General Enquiry",
    message,
    submittedAt: new Date().toISOString(),
  };

  try {
    if (pool) {
      await pool.query(
        "INSERT INTO contacts (id, name, email, phone, enquiry_type, message) VALUES (?, ?, ?, ?, ?, ?)",
        [enqId, name, email, newEnquiry.phone, newEnquiry.enquiryType, message]
      );
    }

    // REALTIME BROADCAST
    io.emit("new_contact_enquiry", {
      enquiry: newEnquiry,
      notification: `📩 New enquiry received from ${name} (${newEnquiry.enquiryType})`,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been received! Our team will get back to you shortly.",
      data: newEnquiry,
    });
  } catch (err) {
    console.error("Contact DB Error:", err);
    return res.status(500).json({ success: false, message: "Database enquiry error." });
  }
});

// --- ADMIN AUTH & DASHBOARD ENDPOINTS ---

// Admin Login Route
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    if (!pool) {
      return res.status(500).json({ success: false, message: "Database not connected." });
    }

    const [rows]: any = await pool.query("SELECT * FROM admins WHERE email = ?", [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid admin email or password." });
    }

    const admin = rows[0];
    const passwordValid = await bcrypt.compare(password, admin.password);

    if (!passwordValid) {
      return res.status(401).json({ success: false, message: "Invalid admin email or password." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      success: true,
      message: "Admin login successful!",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    return res.status(500).json({ success: false, message: "Internal server authentication error." });
  }
});

// Admin Me Route
app.get("/api/admin/me", authenticateAdmin, (req, res) => {
  res.json({ success: true, admin: (req as any).admin });
});

// Admin Stats Route
app.get("/api/admin/stats", authenticateAdmin, async (_req, res) => {
  try {
    let totalRegistrations = 0;
    let totalContacts = 0;

    if (pool) {
      const [regRows]: any = await pool.query("SELECT COUNT(*) as count FROM registrations");
      totalRegistrations = regRows[0]?.count || 0;

      const [conRows]: any = await pool.query("SELECT COUNT(*) as count FROM contacts");
      totalContacts = conRows[0]?.count || 0;
    }

    res.json({
      success: true,
      stats: {
        totalRegistrations,
        totalContacts,
        activeLiveUsers: liveActiveUsers,
        serverUptime: Math.floor(process.uptime()),
        databaseStatus: "Connected (Hostinger MySQL u409108324_ETMedia)",
      },
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard stats." });
  }
});

// Admin Get All Registrations
app.get("/api/admin/registrations", authenticateAdmin, async (_req, res) => {
  try {
    if (!pool) return res.json({ success: true, registrations: [] });
    const [rows]: any = await pool.query("SELECT * FROM registrations ORDER BY created_at DESC");
    res.json({ success: true, registrations: rows });
  } catch (err) {
    console.error("Fetch Registrations Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch registrations." });
  }
});

// Admin Get All Contacts
app.get("/api/admin/contacts", authenticateAdmin, async (_req, res) => {
  try {
    if (!pool) return res.json({ success: true, contacts: [] });
    const [rows]: any = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json({ success: true, contacts: rows });
  } catch (err) {
    console.error("Fetch Contacts Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch contacts." });
  }
});

// SPA Wildcard Route Fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  if (activeFrontendDist) {
    const indexPath = path.join(activeFrontendDist, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  return res.send("ET Media Business Intelligence Backend Server Running!");
});

// Initialize DB and start HTTP server
initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ET Media Business Intelligence Realtime Server Running!`);
    console.log(`📡 HTTP API: http://localhost:${PORT}/api/health`);
    console.log(`⚡ WebSocket Server (Socket.IO): ws://localhost:${PORT}`);
    console.log(`🔑 Admin Login API: http://localhost:${PORT}/api/admin/login`);
    console.log(`=======================================================`);
  });
});
