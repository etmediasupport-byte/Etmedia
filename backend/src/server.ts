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
import nodemailer from "nodemailer";
import { initDatabase, pool, ensureEventsTable } from "./db.js";

dotenv.config();

// Nodemailer SMTP Transporter
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpUser = process.env.SMTP_USER || "etmedia.support@gmail.com";
const smtpPass = process.env.SMTP_PASS || "jzqs ibca abyx rhuc";
const supportEmail = process.env.SUPPORT_EMAIL || "partner.support@etmedia.in";

const mailTransporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true,
  auth: {
    user: smtpUser.trim(),
    pass: smtpPass.trim(),
  },
});

async function sendRegistrationConfirmationEmail(data: {
  firstName: string;
  email: string;
  eventTitle: string;
}) {
  const mailOptions = {
    from: `"ET Media Business Intelligence" <${smtpUser.trim()}>`,
    to: data.email,
    subject: `Registration Confirmation: ${data.eventTitle}`,
    text: `Dear ${data.firstName},

Thank you for registering for ${data.eventTitle}.

Your registration has been successfully received.

Our team will verify your details and contact you shortly with confirmation, venue details, agenda, and participation information.

We look forward to welcoming you to India's premier leadership summit.

ET Media Business Intelligence
${supportEmail}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; rounded: 16px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #00AEEF;">
          <h2 style="color: #00AEEF; margin: 0;">ET MEDIA BUSINESS INTELLIGENCE</h2>
          <p style="color: #4B1FA7; font-weight: bold; margin-top: 5px; font-size: 14px;">Leadership Platform & Executive Summits</p>
        </div>
        <div style="padding: 25px 0; color: #334155; line-height: 1.6; font-size: 15px;">
          <p>Dear <strong>${data.firstName}</strong>,</p>
          <p>Thank you for registering for <strong>${data.eventTitle}</strong>.</p>
          <p style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; color: #166534; font-weight: 600; border-radius: 8px;">
            🎉 Your registration has been successfully received.
          </p>
          <p>Our team will verify your details and contact you shortly with confirmation, venue details, agenda, and participation information.</p>
          <p>We look forward to welcoming you to India's premier leadership summit.</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; pt-20px; padding-top: 20px; color: #64748b; font-size: 13px;">
          <p style="margin: 0; font-weight: bold; color: #1e293b;">ET Media Business Intelligence</p>
          <p style="margin: 4px 0 0 0;"><a href="mailto:${supportEmail}" style="color: #00AEEF; text-decoration: none;">${supportEmail}</a></p>
        </div>
      </div>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Confirmation email sent successfully to ${data.email} (${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer] Error sending confirmation email to ${data.email}:`, err.message);
    return false;
  }
}


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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

// 2. Events listing (Public API with DB query & static fallback)
app.get("/api/events", async (req, res) => {
  try {
    const { status, featured } = req.query;
    if (pool) {
      await ensureEventsTable();
      let query = "SELECT * FROM events WHERE status != 'draft'";
      const params: any[] = [];

      if (featured === "true" || featured === "1") {
        query += " AND is_featured = 1";
      }
      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      query += " ORDER BY created_at DESC";
      const [rows]: any = await pool.query(query, params);
      return res.json({ success: true, data: rows });
    }

    // Static fallback
    const fallbackData = [
      {
        id: "cfo-leadership-summit",
        slug: "cfo-leadership-summit-2026",
        title: "India CFO & Finance Leadership Summit 2026",
        category: "Conference & Leadership",
        date: "",
        city: "",
        venue: "",
        time: "",
        speakers: 28,
        status: "published",
        is_featured: 1,
        image: "/assets/event-cfo-BjslOJNi.jpg",
        description: "Reinventing capital allocation, enterprise risk, treasury compliance & AI-driven financial strategies.",
      },
      {
        id: "hr-excellence-awards",
        slug: "hr-excellence-awards-2026",
        title: "National HR Excellence & Workplace Awards",
        category: "Awards & Recognition",
        date: "November 18, 2026",
        city: "Bengaluru",
        venue: "JW Marriott Hotel, UB City",
        time: "05:00 PM — 10:00 PM",
        speakers: 16,
        status: "published",
        is_featured: 1,
        image: "/assets/event-hr-Cswpuq5H.jpg",
        description: "Honouring chief human resource officers and organisations building elite work cultures.",
      },
      {
        id: "tech-enterprise-summit",
        slug: "tech-enterprise-summit-2026",
        title: "Enterprise Technology & AI Leadership Conclave",
        category: "Summit & Tech",
        date: "December 05, 2026",
        city: "Hyderabad",
        venue: "HICC Novotel, Hitec City",
        time: "09:30 AM — 05:30 PM",
        speakers: 34,
        status: "published",
        is_featured: 1,
        image: "/assets/hero-summit-ClCGVqfO.jpg",
        description: "Connecting CIOs, CTOs, and tech leaders deploying generative AI, cloud infrastructure & cybersecurity.",
      },
    ];

    res.json({ success: true, data: fallbackData });
  } catch (err) {
    console.error("Fetch Public Events Error:", err);
    res.status(500).json({ success: false, message: "Failed to load events." });
  }
});

// 2b. Single Event Detail Endpoint (by slug or ID)
app.get("/api/events/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    if (pool) {
      await ensureEventsTable();
      const [rows]: any = await pool.query(
        "SELECT * FROM events WHERE slug = ? OR id = ?",
        [slug, slug]
      );
      if (rows.length > 0) {
        return res.json({ success: true, event: rows[0] });
      }
    }
    return res.status(404).json({ success: false, message: "Event not found." });
  } catch (err) {
    console.error("Fetch Single Event Error:", err);
    return res.status(500).json({ success: false, message: "Failed to load event details." });
  }
});


// 3. Event registration endpoint
app.post("/api/events/register", async (req, res) => {
  const {
    firstName,
    lastName,
    name: bodyName,
    email,
    phone,
    contactNumber,
    companyName,
    organization,
    designation,
    city,
    country,
    registrationCategory,
    registeringCity,
    referralSource,
    eventId,
    eventTitle,
  } = req.body;

  const effectiveFirstName = firstName || (bodyName ? bodyName.split(" ")[0] : "Delegate");
  const effectiveLastName = lastName || (bodyName ? bodyName.split(" ").slice(1).join(" ") : "");
  const fullName = bodyName || `${effectiveFirstName} ${effectiveLastName}`.trim();
  const effectivePhone = phone || contactNumber || "N/A";
  const effectiveOrganization = companyName || organization || "Independent Leader";
  const effectiveDesignation = designation || "Executive Delegate";
  const effectiveCategory = registrationCategory || "Delegate";
  const effectiveEventTitle = eventTitle || "CISO Conclave & Awards 2026";
  const effectiveEventId = eventId || "ciso-conclave-2026";

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is a required field.",
    });
  }

  // Server-side Google reCAPTCHA verification
  const recaptchaToken = req.body.recaptchaToken;
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || "6LfeDbgtAAAAALb87t1p3iLvdYbrfwPKSu-UzTgh";

  if (recaptchaToken) {
    try {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(recaptchaSecret)}&response=${encodeURIComponent(recaptchaToken)}`;
      const verifyRes = await fetch(verifyUrl, { method: "POST" });
      const verifyData: any = await verifyRes.json();
      if (!verifyData.success) {
        console.warn("[reCAPTCHA] Google siteverify response:", verifyData);
      } else {
        console.log("[reCAPTCHA] Verification successful!");
      }
    } catch (reErr) {
      console.error("[reCAPTCHA] Server verification error:", reErr);
    }
  }


  const regId = `REG-${Date.now()}`;
  const newRegistration = {
    id: regId,
    name: fullName,
    first_name: effectiveFirstName,
    last_name: effectiveLastName,
    email,
    phone: effectivePhone,
    organization: effectiveOrganization,
    designation: effectiveDesignation,
    city: city || "N/A",
    country: country || "India",
    registration_category: effectiveCategory,
    registering_city: registeringCity || city || "N/A",
    referral_source: referralSource || "Direct",
    event_id: effectiveEventId,
    event_title: effectiveEventTitle,
    created_at: new Date().toISOString(),
  };

  try {
    if (pool) {
      await pool.query(
        `INSERT INTO registrations (
          id, name, first_name, last_name, email, phone, organization, designation, city, country, registration_category, registering_city, referral_source, event_id, event_title
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          regId,
          fullName,
          effectiveFirstName,
          effectiveLastName,
          email,
          effectivePhone,
          effectiveOrganization,
          effectiveDesignation,
          city || "N/A",
          country || "India",
          effectiveCategory,
          registeringCity || city || "N/A",
          referralSource || "Direct",
          effectiveEventId,
          effectiveEventTitle,
        ]
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
      message: `🎉 ${effectiveFirstName} (${effectiveCategory}) registered for ${effectiveEventTitle}!`,
    });

    // AUTOMATED EMAIL CONFIRMATION
    const emailSent = await sendRegistrationConfirmationEmail({
      firstName: effectiveFirstName,
      email,
      eventTitle: effectiveEventTitle,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      emailSent,
      data: newRegistration,
    });
  } catch (err: any) {
    console.error("Registration DB Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Database registration error." });
  }
});

  // 3b. CMS Managed Delegate Registration endpoint
  app.post("/api/delegate-registrations", async (req, res) => {
    const {
      fullName,
      designation,
      organization,
      officialEmail,
      mobileNumber,
      city,
      awardsNomination,
      companyName,
      website,
      industry,
      location,
      gstNumber,
      contactPersonName,
      contactPersonDesignation,
      contactPersonEmail,
      contactPersonPhone,
    } = req.body;

    if (!fullName || !officialEmail || !companyName) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Official Email, and Company Name are required.",
      });
    }

    const delId = `DEL-${Date.now()}`;
    const timestamp = new Date().toISOString();

    try {
      if (pool) {
        // 1. Insert into delegate_registrations table
        await pool.query(
          `INSERT INTO delegate_registrations (
            id, full_name, designation, organization, official_email, mobile_number, city, awards_nomination, company_name, website, industry, location, gst_number, contact_person_name, contact_person_designation, contact_person_email, contact_person_phone
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            delId,
            fullName,
            designation || "N/A",
            organization || companyName || "N/A",
            officialEmail,
            mobileNumber || "N/A",
            city || "N/A",
            awardsNomination || "No",
            companyName,
            website || "",
            industry || "Technology & IT",
            location || city || "N/A",
            gstNumber || "",
            contactPersonName || fullName,
            contactPersonDesignation || designation || "N/A",
            contactPersonEmail || officialEmail,
            contactPersonPhone || mobileNumber || "N/A",
          ]
        );

        // 2. Also sync to registrations table for instant Admin Dashboard visibility
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0] || fullName;
        const lastName = nameParts.slice(1).join(" ") || "";
        await pool.query(
          `INSERT INTO registrations (
            id, name, first_name, last_name, email, phone, organization, designation, city, country, registration_category, registering_city, referral_source, event_id, event_title
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            delId,
            fullName,
            firstName,
            lastName,
            officialEmail,
            mobileNumber,
            organization || companyName,
            designation,
            city,
            "India",
            "Executive Delegate Pass",
            location || city,
            awardsNomination === "Yes" ? "Awards Nomination (Yes)" : "Direct Registration",
            "delegate-executive-pass",
            `Corporate Delegate Pass (${companyName})`,
          ]
        );
      }

      const newRegData = {
        id: delId,
        name: fullName,
        email: officialEmail,
        phone: mobileNumber,
        organization: organization || companyName,
        designation,
        event_id: "delegate-executive-pass",
        event_title: `Corporate Delegate Pass (${companyName})`,
        created_at: timestamp,
      };

      // Realtime Broadcast
      io.emit("new_registration", {
        registration: newRegData,
        message: `🎉 Executive Delegate: ${fullName} (${companyName}) registered!`,
      });

      // Email Confirmation
      const emailSent = await sendRegistrationConfirmationEmail({
        firstName: fullName.split(" ")[0] || fullName,
        email: officialEmail,
        eventTitle: `ET Media Executive Platform (${companyName})`,
      });

      return res.status(201).json({
        success: true,
        message: "Delegate Registration submitted successfully!",
        emailSent,
        data: newRegData,
      });
    } catch (err: any) {
      console.error("Delegate Registration DB Error:", err);
      return res.status(500).json({ success: false, message: err.message || "Database insertion error." });
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

// 0. Image File Upload Handler (saves uploaded image to /public/uploads/)
app.post("/api/admin/upload", authenticateAdmin, async (req, res) => {
  const { imageBase64, filename } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: "No image data provided." });
  }

  try {
    const uploadsDir = path.join(publicPath, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const ext = matches && matches[1] ? matches[1].split("/")[1] : "jpg";
    const cleanFilename = `banner_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, cleanFilename);
    const base64Data = matches ? matches[2] : imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${cleanFilename}`;
    return res.json({ success: true, url: imageUrl, message: "Image banner uploaded successfully!" });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: "Failed to upload image file." });
  }
});

// 1. Get all events for admin (including drafts & published)
app.get("/api/admin/events", authenticateAdmin, async (_req, res) => {
  try {
    if (!pool) return res.json({ success: true, events: [] });
    await ensureEventsTable();
    const [rows]: any = await pool.query("SELECT * FROM events ORDER BY created_at DESC");
    res.json({ success: true, events: rows });
  } catch (err) {
    console.error("Admin Fetch Events Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch events." });
  }
});

// 2. Create new event
app.post("/api/admin/events", authenticateAdmin, async (req, res) => {
  const {
    title,
    category,
    date,
    time,
    city,
    venue,
    locations,
    description,
    full_description,
    image,
    speakers,
    status,
    is_featured,
    speakers_list,
    sponsors_list,
    gallery_list,
    agenda_list,
    map_url,
    venue_address,
  } = req.body;

  if (!title || !category || !date || !city || !description) {
    return res.status(400).json({ success: false, message: "Title, category, date, city, and description are required." });
  }

  const id = `EVT-${Date.now()}`;
  const rawSlug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = `${rawSlug}-${Date.now().toString().slice(-4)}`;
  const locationsStr = typeof locations === "string" ? locations : JSON.stringify(locations || []);

  const speakersListStr = typeof speakers_list === "string" ? speakers_list : JSON.stringify(speakers_list || []);
  const sponsorsListStr = typeof sponsors_list === "string" ? sponsors_list : JSON.stringify(sponsors_list || []);
  const galleryListStr = typeof gallery_list === "string" ? gallery_list : JSON.stringify(gallery_list || []);
  const agendaListStr = typeof agenda_list === "string" ? agenda_list : JSON.stringify(agenda_list || []);

  try {
    if (pool) {
      await ensureEventsTable();
      await pool.query(
        `INSERT INTO events (
          id, slug, title, category, date, time, city, venue, locations, description, full_description, image, speakers, status, is_featured, speakers_list, sponsors_list, gallery_list, agenda_list, map_url, venue_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          slug,
          title,
          category,
          date,
          time || "09:00 AM — 06:00 PM",
          city,
          venue || `${city} Main Convention Center`,
          locationsStr,
          description,
          full_description || description,
          image || "/assets/event-cfo-BjslOJNi.jpg",
          speakers || 20,
          status || "published",
          is_featured ? 1 : 0,
          speakersListStr,
          sponsorsListStr,
          galleryListStr,
          agendaListStr,
          map_url || "",
          venue_address || `${venue}, ${city}`,
        ]
      );
    }

    const newEvent = {
      id,
      slug,
      title,
      category,
      date,
      time,
      city,
      venue,
      locations: locationsStr,
      description,
      full_description,
      image,
      speakers,
      status,
      is_featured,
      speakers_list: speakersListStr,
      sponsors_list: sponsorsListStr,
      gallery_list: galleryListStr,
      agenda_list: agendaListStr,
      map_url,
      venue_address,
    };
    io.emit("event_created", newEvent);

    return res.status(201).json({ success: true, message: "Event created successfully!", data: newEvent });
  } catch (err: any) {
    console.error("Create Event DB Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create event." });
  }
});

// 3. Update existing event
app.put("/api/admin/events/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    date,
    time,
    city,
    venue,
    locations,
    description,
    full_description,
    image,
    speakers,
    status,
    is_featured,
    speakers_list,
    sponsors_list,
    gallery_list,
    agenda_list,
    map_url,
    venue_address,
  } = req.body;

  const locationsStr = typeof locations === "string" ? locations : JSON.stringify(locations || []);
  const speakersListStr = typeof speakers_list === "string" ? speakers_list : JSON.stringify(speakers_list || []);
  const sponsorsListStr = typeof sponsors_list === "string" ? sponsors_list : JSON.stringify(sponsors_list || []);
  const galleryListStr = typeof gallery_list === "string" ? gallery_list : JSON.stringify(gallery_list || []);
  const agendaListStr = typeof agenda_list === "string" ? agenda_list : JSON.stringify(agenda_list || []);

  try {
    if (pool) {
      await ensureEventsTable();
      await pool.query(
        `UPDATE events SET 
          title = ?, category = ?, date = ?, time = ?, city = ?, venue = ?, locations = ?, description = ?, full_description = ?, image = ?, speakers = ?, status = ?, is_featured = ?, speakers_list = ?, sponsors_list = ?, gallery_list = ?, agenda_list = ?, map_url = ?, venue_address = ?
         WHERE id = ?`,
        [
          title,
          category,
          date,
          time,
          city,
          venue,
          locationsStr,
          description,
          full_description || description,
          image,
          speakers,
          status,
          is_featured ? 1 : 0,
          speakersListStr,
          sponsorsListStr,
          galleryListStr,
          agendaListStr,
          map_url || "",
          venue_address || `${venue}, ${city}`,
          id,
        ]
      );
    }

    const updatedEvent = {
      id,
      title,
      category,
      date,
      time,
      city,
      venue,
      locations: locationsStr,
      description,
      full_description,
      image,
      speakers,
      status,
      is_featured,
      speakers_list: speakersListStr,
      sponsors_list: sponsorsListStr,
      gallery_list: galleryListStr,
      agenda_list: agendaListStr,
      map_url,
      venue_address,
    };
    io.emit("event_updated", updatedEvent);

    return res.json({ success: true, message: "Event updated successfully!", data: updatedEvent });
  } catch (err: any) {
    console.error("Update Event DB Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update event." });
  }
});


// 4. Delete event
app.delete("/api/admin/events/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (pool) {
      await ensureEventsTable();
      await pool.query("DELETE FROM events WHERE id = ?", [id]);
    }
    io.emit("event_deleted", { id });
    return res.json({ success: true, message: "Event deleted successfully!" });
  } catch (err) {
    console.error("Delete Event DB Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete event." });
  }
});

// 5. Toggle Publish / Draft status
app.patch("/api/admin/events/:id/status", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (pool) {
      await ensureEventsTable();
      await pool.query("UPDATE events SET status = ? WHERE id = ?", [status, id]);
    }
    io.emit("event_status_changed", { id, status });
    return res.json({ success: true, message: `Event status changed to ${status}!` });
  } catch (err) {
    console.error("Status Toggle Error:", err);
    return res.status(500).json({ success: false, message: "Failed to change status." });
  }
});

// 6. Toggle Featured state
app.patch("/api/admin/events/:id/featured", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_featured } = req.body;

  try {
    if (pool) {
      await ensureEventsTable();
      await pool.query("UPDATE events SET is_featured = ? WHERE id = ?", [is_featured ? 1 : 0, id]);
    }
    io.emit("event_featured_changed", { id, is_featured });
    return res.json({ success: true, message: `Event featured state updated!` });
  } catch (err) {
    console.error("Featured Toggle Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update featured state." });
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
