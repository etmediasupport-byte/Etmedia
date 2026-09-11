import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS for Express and Socket.IO
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(express.json());

// Serve static assets from public folder (including favicon)
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

app.get(["/favicon.ico", "/favicon.png"], (_req, res) => {
  res.sendFile(path.join(publicPath, "favicon.ico"));
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory data store for real-time demonstration
const mockRegistrations: any[] = [];
const mockContactSubmissions: any[] = [];
let liveActiveUsers = 0;

// Socket.IO real-time event handlers
io.on("connection", (socket) => {
  liveActiveUsers++;
  console.log(`[Socket.IO] Client connected: ${socket.id} (Active Users: ${liveActiveUsers})`);

  // Broadcast updated live user count to all connected clients
  io.emit("live_users_update", { activeUsers: liveActiveUsers });

  socket.on("disconnect", () => {
    liveActiveUsers = Math.max(0, liveActiveUsers - 1);
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (Active Users: ${liveActiveUsers})`);
    io.emit("live_users_update", { activeUsers: liveActiveUsers });
  });

  // Client requests initial state
  socket.on("get_initial_data", () => {
    socket.emit("initial_data", {
      activeUsers: liveActiveUsers,
      totalRegistrations: mockRegistrations.length,
      recentRegistrations: mockRegistrations.slice(-5),
    });
  });
});

// REST API Endpoints

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ET Media Business Intelligence Backend",
    timestamp: new Date().toISOString(),
    activeSockets: liveActiveUsers,
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

// 3. Event registration endpoint with real-time broadcast
app.post("/api/events/register", (req, res) => {
  const { name, email, phone, organization, designation, eventId } = req.body;

  if (!name || !email || !eventId) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and event ID are required fields.",
    });
  }

  const newRegistration = {
    id: `REG-${Date.now()}`,
    name,
    email,
    phone: phone || "N/A",
    organization: organization || "Independent Leader",
    designation: designation || "Executive Delegate",
    eventId,
    registeredAt: new Date().toISOString(),
  };

  mockRegistrations.push(newRegistration);

  // REALTIME SOCKET BROADCAST: Notify all connected clients of new registration!
  io.emit("new_registration", {
    registration: newRegistration,
    totalRegistrations: mockRegistrations.length,
    message: `🎉 ${name} from ${newRegistration.organization} just registered!`,
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful!",
    data: newRegistration,
  });
});

// 4. Contact form submission with real-time notification
app.post("/api/contact", (req, res) => {
  const { name, email, phone, enquiryType, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required.",
    });
  }

  const newEnquiry = {
    id: `ENQ-${Date.now()}`,
    name,
    email,
    phone: phone || "N/A",
    enquiryType: enquiryType || "General Enquiry",
    message,
    submittedAt: new Date().toISOString(),
  };

  mockContactSubmissions.push(newEnquiry);

  // REALTIME SOCKET BROADCAST: Broadcast new enquiry to live dashboard
  io.emit("new_contact_enquiry", {
    enquiry: newEnquiry,
    totalEnquiries: mockContactSubmissions.length,
    notification: `📩 New enquiry received from ${name} (${newEnquiry.enquiryType})`,
  });

  return res.status(201).json({
    success: true,
    message: "Your message has been received! Our team will get back to you shortly.",
    data: newEnquiry,
  });
});

// 5. Real-time statistics endpoint
app.get("/api/stats", (_req, res) => {
  res.json({
    success: true,
    data: {
      activeSockets: liveActiveUsers,
      totalRegistrations: mockRegistrations.length,
      totalContactEnquiries: mockContactSubmissions.length,
      uptimeSeconds: process.uptime(),
    },
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 ET Media Business Intelligence Realtime Server Running!`);
  console.log(`📡 HTTP API: http://localhost:${PORT}/api/health`);
  console.log(`⚡ WebSocket Server (Socket.IO): ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});
