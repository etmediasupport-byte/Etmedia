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
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { initDatabase, pool, ensureEventsTable, ensureGalleryTable, ensureNewAdminTables } from "./db.js";

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

async function sendPartnerConfirmationEmail(data: {
  contactPerson: string;
  email: string;
  companyName: string;
}) {
  const mailOptions = {
    from: `"ET Media Business Intelligence" <${smtpUser.trim()}>`,
    to: data.email,
    subject: `Partnership Interest Received — ET Media Business Intelligence`,
    text: `Dear ${data.contactPerson},

Thank you for expressing your interest in partnering with ET Media Business Intelligence.
Our team will get in touch with you shortly.

We will review your requirements and discuss the available branding, sponsorship and business engagement opportunities.

We look forward to building a successful partnership with your organisation.

Regards,
ET Media Business Intelligence
partner.support@etmedia.in
www.etmedia.in`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #00AEEF;">
          <h2 style="color: #00AEEF; margin: 0; font-size: 20px;">ET MEDIA BUSINESS INTELLIGENCE</h2>
          <p style="color: #4B1FA7; font-weight: bold; margin-top: 5px; font-size: 13px;">Strategic Partnerships & Business Development</p>
        </div>
        <div style="padding: 25px 0; color: #334155; line-height: 1.6; font-size: 15px;">
          <p>Dear <strong>${data.contactPerson}</strong>,</p>
          <p>Thank you for expressing your interest in partnering with <strong>ET Media Business Intelligence</strong>.</p>
          <p style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; color: #166534; font-weight: 600; border-radius: 8px;">
            🤝 Our team will get in touch with you shortly.
          </p>
          <p>We will review your requirements and discuss the available branding, sponsorship and business engagement opportunities.</p>
          <p>We look forward to building a successful partnership with your organisation.</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 13px;">
          <p style="margin: 0; font-weight: bold; color: #1e293b;">Regards,</p>
          <p style="margin: 2px 0; font-weight: bold; color: #0f172a;">ET Media Business Intelligence</p>
          <p style="margin: 4px 0 0 0;"><a href="mailto:partner.support@etmedia.in" style="color: #00AEEF; text-decoration: none;">partner.support@etmedia.in</a></p>
          <p style="margin: 2px 0 0 0;"><a href="https://www.etmedia.in" style="color: #00AEEF; text-decoration: none;">www.etmedia.in</a></p>
        </div>
      </div>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Partner confirmation email sent to ${data.email} (${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer] Error sending partner email to ${data.email}:`, err.message);
    return false;
  }
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "et_media_super_secret_jwt_key_2026";

// Enable CORS & Body Parser
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Security Middleware: Helmet HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP to allow external image/embed sources (Unsplash, YouTube, Google Fonts)
    crossOriginEmbedderPolicy: false,
  })
);

// Rate Limiting Middlewares
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again after 15 minutes." },
});

app.use("/api/", apiRateLimiter);
app.use("/api/admin/login", authRateLimiter);

// Input Sanitization Helper
function sanitizeText(input: any): string {
  if (typeof input !== "string") return input;
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();
}


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

// Middleware: Require Specific Admin Role
const requireRole = (allowedRoles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const admin = (req as any).admin;
    if (!admin || !allowedRoles.includes(admin.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient administrative privileges." });
    }
    next();
  };
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
// 1b. Dynamic Sitemap XML for SEO
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const baseUrl = "https://www.etmedia.in";
    let eventSlugs: string[] = [];

    if (pool) {
      await ensureEventsTable();
      const [rows]: any = await pool.query("SELECT slug FROM events WHERE status = 'published'");
      eventSlugs = rows.map((r: any) => r.slug);
    }

    const staticRoutes = [
      "",
      "/about",
      "/events",
      "/events/upcoming",
      "/events/past",
      "/events/register",
      "/events/partner",
      "/magazine",
      "/careers",
      "/gallery",
      "/contact",
    ];

    const now = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>${route === "" ? "1.0" : "0.8"}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const slug of eventSlugs) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/events/${slug}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    return res.send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return res.status(500).send("Error generating sitemap");
  }
});

// 1c. Robots.txt for Search Crawlers
app.get("/robots.txt", (_req, res) => {
  const robots = `User-agent: *\nAllow: /\nDisallow: /api/admin/\nDisallow: /admin/\n\nSitemap: https://www.etmedia.in/sitemap.xml\n`;
  res.setHeader("Content-Type", "text/plain");
  return res.send(robots);
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

// Admin Logout Route
app.post("/api/admin/logout", authenticateAdmin, (_req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

// Admin Refresh Token Route
app.post("/api/admin/refresh", authenticateAdmin, (req, res) => {
  const admin = (req as any).admin;
  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
  res.json({ success: true, token, admin });
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

// Admin Get All Event Registrations
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

// Admin Get All CMS Delegate Registrations (Separate Corporate Submissions)
app.get("/api/admin/delegate-registrations", authenticateAdmin, async (_req, res) => {
  try {
    if (!pool) return res.json({ success: true, delegateRegistrations: [] });
    const [rows]: any = await pool.query("SELECT * FROM delegate_registrations ORDER BY created_at DESC");
    res.json({ success: true, delegateRegistrations: rows });
  } catch (err) {
    console.error("Fetch CMS Delegate Registrations Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch delegate registrations." });
  }
});

// Admin Update Event Registration Status
app.patch("/api/admin/registrations/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (pool) {
      await pool.query("UPDATE registrations SET status = ? WHERE id = ?", [status, id]);
    }
    res.json({ success: true, message: "Registration status updated successfully." });
  } catch (err) {
    console.error("Update Registration Status Error:", err);
    res.status(500).json({ success: false, message: "Failed to update registration status." });
  }
});

// Admin Update CMS Delegate Registration Status
app.patch("/api/admin/delegate-registrations/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (pool) {
      await pool.query("UPDATE delegate_registrations SET status = ? WHERE id = ?", [status, id]);
    }
    res.json({ success: true, message: "Delegate registration status updated successfully." });
  } catch (err) {
    console.error("Update Delegate Registration Status Error:", err);
    res.status(500).json({ success: false, message: "Failed to update delegate registration status." });
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

// Admin Update Contact Status
app.patch("/api/admin/contacts/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (pool) {
      await pool.query("UPDATE contacts SET status = ? WHERE id = ?", [status, id]);
    }
    res.json({ success: true, message: "Contact status updated successfully." });
  } catch (err) {
    console.error("Update Contact Status Error:", err);
    res.status(500).json({ success: false, message: "Failed to update contact status." });
  }
});

// Admin Delete Contact Submission
app.delete("/api/admin/contacts/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (pool) {
      await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
    }
    res.json({ success: true, message: "Contact message deleted successfully." });
  } catch (err) {
    console.error("Delete Contact Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete contact message." });
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

// ==========================================
// PARTNERS & COLLABORATORS API ENDPOINTS
// ==========================================

// Get all partners (Public for carousel)
app.get("/api/partners", async (req, res) => {
  try {
    if (pool) {
      await ensureNewAdminTables();
      const [rows]: any = await pool.query("SELECT * FROM partners ORDER BY priority ASC, created_at DESC");
      return res.json({ success: true, partners: rows });
    }
    return res.json({ success: true, partners: [] });
  } catch (err: any) {
    console.error("Fetch Partners Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch partners" });
  }
});

// Admin create partner
app.post("/api/admin/partners", authenticateAdmin, async (req, res) => {
  const { brand_name, logo, website, category, priority, status } = req.body;
  if (!brand_name || !logo) {
    return res.status(400).json({ success: false, message: "Brand name and logo are required" });
  }

  const id = `PTR-${Date.now().toString().slice(-6)}`;
  const prioVal = Number(priority) || 0;
  const statusVal = status === "Inactive" ? "Inactive" : "Active";

  try {
    if (pool) {
      await pool.query(
        "INSERT INTO partners (id, brand_name, logo, website, category, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, brand_name, logo, website || "", category || "Strategic Partner", prioVal, statusVal]
      );
    }
    const newPartner = {
      id,
      brand_name,
      logo,
      website: website || "",
      category: category || "Strategic Partner",
      priority: prioVal,
      status: statusVal,
      created_at: new Date(),
    };
    io.emit("partner_updated", { type: "add", partner: newPartner });
    return res.json({ success: true, partner: newPartner, message: "Partner collaborator added successfully!" });
  } catch (err: any) {
    console.error("Create Partner Error:", err);
    return res.status(500).json({ success: false, message: "Failed to create partner" });
  }
});

// Admin edit/update partner
app.put("/api/admin/partners/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { brand_name, logo, website, category, priority, status } = req.body;
  const prioVal = Number(priority) || 0;
  const statusVal = status === "Inactive" ? "Inactive" : "Active";

  try {
    if (pool) {
      await pool.query(
        "UPDATE partners SET brand_name = ?, logo = ?, website = ?, category = ?, priority = ?, status = ? WHERE id = ?",
        [brand_name, logo, website || "", category || "Strategic Partner", prioVal, statusVal, id]
      );
    }
    io.emit("partner_updated", { type: "update", id });
    return res.json({ success: true, message: "Partner updated successfully!" });
  } catch (err: any) {
    console.error("Update Partner Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update partner" });
  }
});

// Admin delete partner
app.delete("/api/admin/partners/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("DELETE FROM partners WHERE id = ?", [id]);
    }
    io.emit("partner_updated", { type: "delete", id });
    return res.json({ success: true, message: "Partner deleted successfully" });
  } catch (err: any) {
    console.error("Delete Partner Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete partner" });
  }
});

// Submit Partner Form (Public)
app.post("/api/partners/submit", async (req, res) => {
  const {
    company_name,
    website,
    industry,
    location,
    contact_person,
    designation,
    email,
    phone,
    partnership_type,
    message,
  } = req.body;

  if (!company_name || !industry || !location || !contact_person || !designation || !email || !phone || !partnership_type) {
    return res.status(400).json({ success: false, message: "Please fill in all required fields marked with *" });
  }

  const id = `PRT-SUB-${Date.now().toString().slice(-6)}`;
  const submissionData = {
    id,
    company_name,
    website: website || "",
    industry,
    location,
    contact_person,
    designation,
    email,
    phone,
    partnership_type,
    message: message || "",
    created_at: new Date().toISOString(),
  };

  try {
    if (pool) {
      await pool.query(
        `INSERT INTO partner_submissions (id, company_name, website, industry, location, contact_person, designation, email, phone, partnership_type, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, company_name, website || "", industry, location, contact_person, designation, email, phone, partnership_type, message || ""]
      );
    }

    io.emit("new_partner_submission", submissionData);

    // Send auto confirmation email async
    sendPartnerConfirmationEmail({
      contactPerson: contact_person,
      email,
      companyName: company_name,
    }).catch(err => console.error("Partner email sending error:", err));

    return res.json({
      success: true,
      message: "Partner application submitted successfully!",
      submission: submissionData,
    });
  } catch (err: any) {
    console.error("Partner Submission Error:", err);
    return res.status(500).json({ success: false, message: "Failed to submit partner application." });
  }
});

// Admin fetch partner submissions
app.get("/api/admin/partner-submissions", authenticateAdmin, async (req, res) => {
  try {
    if (pool) {
      const [rows]: any = await pool.query("SELECT * FROM partner_submissions ORDER BY created_at DESC");
      return res.json({ success: true, submissions: rows });
    }
    return res.json({ success: true, submissions: [] });
  } catch (err: any) {
    console.error("Fetch Partner Submissions Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch partner submissions" });
  }
});

// Admin delete partner submission
app.delete("/api/admin/partner-submissions/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("DELETE FROM partner_submissions WHERE id = ?", [id]);
    }
    return res.json({ success: true, message: "Partner inquiry deleted" });
  } catch (err: any) {
    console.error("Delete Partner Submission Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete submission" });
  }
});

// Admin reply to partner form submission
app.post("/api/admin/partner-submissions/:id/reply", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { reply_message, recipient_email, contact_person } = req.body;

  if (!reply_message || !recipient_email) {
    return res.status(400).json({ success: false, message: "Reply message and recipient email are required." });
  }

  try {
    if (pool) {
      await pool.query("UPDATE partner_submissions SET status = 'Replied' WHERE id = ?", [id]);
    }

    // Send email response
    await mailTransporter.sendMail({
      from: `"ET Media Business Intelligence" <${smtpUser.trim()}>`,
      to: recipient_email,
      subject: `Response to your Partnership Inquiry — ET Media Business Intelligence`,
      text: reply_message,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h3 style="color: #00AEEF; margin-top: 0;">ET Media Strategic Partnerships</h3>
          <p>Dear <strong>${contact_person || "Partner"}</strong>,</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #00AEEF; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #1e293b;">
            ${reply_message.replace(/\n/g, "<br/>")}
          </div>
          <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
            Best regards,<br/>
            <strong>ET Media Strategic Partnerships Team</strong><br/>
            <a href="mailto:${supportEmail}" style="color: #00AEEF; text-decoration: none;">${supportEmail}</a>
          </p>
        </div>
      `,
    });

    return res.json({ success: true, message: `Reply sent successfully to ${recipient_email}!` });
  } catch (err: any) {
    console.error("Partner Reply Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to send partner reply." });
  }
});


// ==========================================
// EXECUTIVE TALKS MAGAZINE API ENDPOINTS
// ==========================================

// Get all magazines (Public)
app.get("/api/magazines", async (req, res) => {
  try {
    if (pool) {
      const [rows]: any = await pool.query("SELECT * FROM magazines ORDER BY is_featured DESC, created_at DESC");
      return res.json({ success: true, magazines: rows });
    }
    return res.json({ success: true, magazines: [] });
  } catch (err: any) {
    console.error("Fetch Magazines Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch magazines" });
  }
});

// Admin create magazine issue
app.post("/api/admin/magazines", authenticateAdmin, async (req, res) => {
  const { issue, title, date, month, cover, pdf_url, pages_list, category, is_featured } = req.body;
  if (!title || !cover) {
    return res.status(400).json({ success: false, message: "Title and Cover image are required" });
  }

  const id = `MAG-${Date.now().toString().slice(-6)}`;
  const pagesJson = typeof pages_list === "string" ? pages_list : JSON.stringify(pages_list || [cover]);

  try {
    if (pool) {
      await pool.query(
        "INSERT INTO magazines (id, issue, title, date, month, cover, pdf_url, pages_list, category, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          issue || "Special Issue",
          title,
          date || "2026",
          month || date || "2026",
          cover,
          pdf_url || "",
          pagesJson,
          category || "Leadership",
          is_featured ? 1 : 0,
        ]
      );
    }
    const newMag = {
      id,
      issue: issue || "Special Issue",
      title,
      date: date || "2026",
      month: month || date || "2026",
      cover,
      pdf_url: pdf_url || "",
      pages_list: pagesJson,
      category: category || "Leadership",
      is_featured: is_featured ? 1 : 0,
      created_at: new Date(),
    };
    io.emit("magazine_updated", { type: "add", magazine: newMag });
    return res.json({ success: true, magazine: newMag, message: "Magazine issue published successfully!" });
  } catch (err: any) {
    console.error("Create Magazine Error:", err);
    return res.status(500).json({ success: false, message: "Failed to create magazine" });
  }
});

// Admin update magazine issue
app.put("/api/admin/magazines/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { issue, title, date, month, cover, pdf_url, pages_list, category, is_featured } = req.body;

  const pagesJson = typeof pages_list === "string" ? pages_list : JSON.stringify(pages_list || [cover]);

  try {
    if (pool) {
      await pool.query(
        "UPDATE magazines SET issue = ?, title = ?, date = ?, month = ?, cover = ?, pdf_url = ?, pages_list = ?, category = ?, is_featured = ? WHERE id = ?",
        [
          issue,
          title,
          date,
          month || date,
          cover,
          pdf_url || "",
          pagesJson,
          category || "Leadership",
          is_featured ? 1 : 0,
          id,
        ]
      );
    }
    io.emit("magazine_updated", { type: "update", id });
    return res.json({ success: true, message: "Magazine issue updated successfully!" });
  } catch (err: any) {
    console.error("Update Magazine Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update magazine" });
  }
});

// Admin delete magazine issue
app.delete("/api/admin/magazines/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("DELETE FROM magazines WHERE id = ?", [id]);
    }
    io.emit("magazine_updated", { type: "delete", id });
    return res.json({ success: true, message: "Magazine issue deleted" });
  } catch (err: any) {
    console.error("Delete Magazine Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete magazine" });
  }
});

// Admin toggle featured state
app.patch("/api/admin/magazines/:id/featured", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { is_featured } = req.body;
  try {
    if (pool) {
      await pool.query("UPDATE magazines SET is_featured = ? WHERE id = ?", [is_featured ? 1 : 0, id]);
    }
    io.emit("magazine_updated", { type: "featured", id, is_featured });
    return res.json({ success: true, message: "Featured state updated" });
  } catch (err: any) {
    console.error("Toggle Magazine Featured Error:", err);
    return res.status(500).json({ success: false, message: "Failed to toggle featured state" });
  }
});

// ==========================================
// CAREERS & JOBS API ENDPOINTS
// ==========================================

// Public PDF Resume Upload Handler
app.post("/api/upload-resume", async (req, res) => {
  try {
    const publicPath = path.join(__dirname, "..", "public");
    const resumesDir = path.join(publicPath, "uploads", "resumes");
    if (!fs.existsSync(resumesDir)) {
      fs.mkdirSync(resumesDir, { recursive: true });
    }

    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const filename = `resume-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
      const filePath = path.join(resumesDir, filename);
      fs.writeFileSync(filePath, buffer);
      const resumeUrl = `/uploads/resumes/${filename}`;
      return res.json({ success: true, url: resumeUrl, message: "Resume uploaded successfully!" });
    });
  } catch (err: any) {
    console.error("Resume Upload Error:", err);
    return res.status(500).json({ success: false, message: "Failed to upload resume file." });
  }
});

// Get all jobs (Public)
app.get("/api/jobs", async (req, res) => {
  try {
    if (pool) {
      const [rows]: any = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
      return res.json({ success: true, jobs: rows });
    }
    return res.json({ success: true, jobs: [] });
  } catch (err: any) {
    console.error("Fetch Jobs Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch job openings" });
  }
});

// Get single job details (Public)
app.get("/api/jobs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      const [rows]: any = await pool.query("SELECT * FROM jobs WHERE id = ?", [id]);
      if (rows.length > 0) {
        return res.json({ success: true, job: rows[0] });
      }
    }
    return res.status(404).json({ success: false, message: "Job opening not found" });
  } catch (err: any) {
    console.error("Fetch Job Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch job" });
  }
});

// Admin create job opening
app.post("/api/admin/jobs", authenticateAdmin, async (req, res) => {
  const { title, department, location, experience, description, responsibilities, qualifications, benefits, status } = req.body;
  if (!title || !department || !location || !experience || !description) {
    return res.status(400).json({ success: false, message: "Please complete all required job fields" });
  }

  const id = `JOB-${Date.now().toString().slice(-6)}`;
  const respJson = typeof responsibilities === "string" ? responsibilities : JSON.stringify(responsibilities || []);
  const qualJson = typeof qualifications === "string" ? qualifications : JSON.stringify(qualifications || []);
  const benJson = typeof benefits === "string" ? benefits : JSON.stringify(benefits || []);

  try {
    if (pool) {
      await pool.query(
        "INSERT INTO jobs (id, title, department, location, experience, description, responsibilities, qualifications, benefits, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, title, department, location, experience, description, respJson, qualJson, benJson, status || "Open"]
      );
    }
    const newJob = {
      id,
      title,
      department,
      location,
      experience,
      description,
      responsibilities: respJson,
      qualifications: qualJson,
      benefits: benJson,
      status: status || "Open",
      created_at: new Date(),
    };
    io.emit("job_updated", { type: "add", job: newJob });
    return res.json({ success: true, job: newJob, message: "Job opening published successfully!" });
  } catch (err: any) {
    console.error("Create Job Error:", err);
    return res.status(500).json({ success: false, message: "Failed to create job" });
  }
});

// Admin update job opening
app.put("/api/admin/jobs/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, department, location, experience, description, responsibilities, qualifications, benefits, status } = req.body;

  const respJson = typeof responsibilities === "string" ? responsibilities : JSON.stringify(responsibilities || []);
  const qualJson = typeof qualifications === "string" ? qualifications : JSON.stringify(qualifications || []);
  const benJson = typeof benefits === "string" ? benefits : JSON.stringify(benefits || []);

  try {
    if (pool) {
      await pool.query(
        "UPDATE jobs SET title = ?, department = ?, location = ?, experience = ?, description = ?, responsibilities = ?, qualifications = ?, benefits = ?, status = ? WHERE id = ?",
        [title, department, location, experience, description, respJson, qualJson, benJson, status || "Open", id]
      );
    }
    io.emit("job_updated", { type: "update", id });
    return res.json({ success: true, message: "Job opening updated!" });
  } catch (err: any) {
    console.error("Update Job Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update job" });
  }
});

// Admin toggle hiring status (Open / Closed)
app.patch("/api/admin/jobs/:id/status", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (pool) {
      await pool.query("UPDATE jobs SET status = ? WHERE id = ?", [status, id]);
    }
    io.emit("job_updated", { type: "status", id, status });
    return res.json({ success: true, message: `Job hiring status set to ${status}` });
  } catch (err: any) {
    console.error("Toggle Job Status Error:", err);
    return res.status(500).json({ success: false, message: "Failed to toggle status" });
  }
});

// Admin delete job opening
app.delete("/api/admin/jobs/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("DELETE FROM jobs WHERE id = ?", [id]);
    }
    io.emit("job_updated", { type: "delete", id });
    return res.json({ success: true, message: "Job opening deleted" });
  } catch (err: any) {
    console.error("Delete Job Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete job" });
  }
});

// Submit Candidate Job Application (Public)
app.post("/api/jobs/apply", async (req, res) => {
  const { job_id, job_title, name, email, phone, experience, resume_url, portfolio_url } = req.body;
  if (!job_id || !name || !email || !phone || !experience || !resume_url) {
    return res.status(400).json({ success: false, message: "Please complete all required application fields and upload your resume PDF" });
  }

  const id = `APP-${Date.now().toString().slice(-6)}`;
  const appData = {
    id,
    job_id,
    job_title: job_title || "General Application",
    name,
    email,
    phone,
    experience,
    resume_url,
    portfolio_url: portfolio_url || "",
    created_at: new Date().toISOString(),
  };

  try {
    if (pool) {
      await pool.query(
        "INSERT INTO job_applications (id, job_id, job_title, name, email, phone, experience, resume_url, portfolio_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, job_id, job_title || "General Application", name, email, phone, experience, resume_url, portfolio_url || ""]
      );
    }
    io.emit("new_job_application", appData);
    return res.json({ success: true, application: appData, message: "Job application submitted successfully!" });
  } catch (err: any) {
    console.error("Job Application Error:", err);
    return res.status(500).json({ success: false, message: "Failed to submit application." });
  }
});

// Admin Get All Job Applications
app.get("/api/admin/job-applications", authenticateAdmin, async (req, res) => {
  try {
    if (pool) {
      const [rows]: any = await pool.query("SELECT * FROM job_applications ORDER BY created_at DESC");
      return res.json({ success: true, applications: rows });
    }
    return res.json({ success: true, applications: [] });
  } catch (err: any) {
    console.error("Fetch Job Applications Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch job applications" });
  }
});

// Admin Delete Job Application
app.delete("/api/admin/job-applications/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("DELETE FROM job_applications WHERE id = ?", [id]);
    }
    return res.json({ success: true, message: "Applicant submission deleted" });
  } catch (err: any) {
    console.error("Delete Job Application Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete application" });
  }
});

// Admin Update Candidate Application Status
app.patch("/api/admin/job-applications/:id/status", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (pool) {
      await pool.query("UPDATE job_applications SET status = ? WHERE id = ?", [status, id]);
    }
    io.emit("job_application_updated", { id, status });
    return res.json({ success: true, message: `Candidate status updated to '${status}'` });
  } catch (err: any) {
    console.error("Update Candidate Application Status Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update candidate status" });
  }
});


// ==========================================
// MEDIA GALLERY API ENDPOINTS
// ==========================================

// Get all gallery media items (Public with filter support)
app.get("/api/gallery", async (req, res) => {
  try {
    if (pool) {
      await ensureGalleryTable();
      const { category, event_slug, type } = req.query;
      let query = "SELECT * FROM gallery_items WHERE 1=1";
      const queryParams: any[] = [];

      if (category && category !== "all" && category !== "All") {
        query += " AND category = ?";
        queryParams.push(category);
      }

      if (event_slug && event_slug !== "all" && event_slug !== "All") {
        query += " AND event_slug = ?";
        queryParams.push(event_slug);
      }

      if (type && type !== "all" && type !== "All") {
        query += " AND type = ?";
        queryParams.push(type);
      }

      query += " ORDER BY created_at DESC";

      const [rows]: any = await pool.query(query, queryParams);
      return res.json({ success: true, items: rows });
    }
    return res.json({ success: true, items: [] });
  } catch (err: any) {
    console.error("Fetch Gallery Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch gallery items" });
  }
});

// Admin Create / Upload Gallery Media Item
app.post("/api/admin/gallery", authenticateAdmin, async (req, res) => {
  const { title, type, url, thumbnail_url, category, event_slug, event_title, aspect_ratio } = req.body;
  if (!title || !url) {
    return res.status(400).json({ success: false, message: "Media Title and URL are required" });
  }

  const id = `GAL-${Date.now().toString().slice(-6)}`;
  try {
    if (pool) {
      await ensureGalleryTable();
      await pool.query(
        "INSERT INTO gallery_items (id, title, type, url, thumbnail_url, category, event_slug, event_title, aspect_ratio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          title,
          type || "photo",
          url,
          thumbnail_url || url,
          category || "Keynotes",
          event_slug || "all",
          event_title || "All Events",
          aspect_ratio || "aspect-[16/9]",
        ]
      );
    }

    const newItem = {
      id,
      title,
      type: type || "photo",
      url,
      thumbnail_url: thumbnail_url || url,
      category: category || "Keynotes",
      event_slug: event_slug || "all",
      event_title: event_title || "All Events",
      aspect_ratio: aspect_ratio || "aspect-[16/9]",
      created_at: new Date().toISOString(),
    };

    io.emit("gallery_updated", { type: "add", item: newItem });
    return res.json({ success: true, item: newItem, message: "Gallery item added successfully!" });
  } catch (err: any) {
    console.error("Create Gallery Item Error:", err);
    return res.status(500).json({ success: false, message: "Failed to create gallery item" });
  }
});

// Admin Update Gallery Media Item
app.put("/api/admin/gallery/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, type, url, thumbnail_url, category, event_slug, event_title, aspect_ratio } = req.body;

  try {
    if (pool) {
      await ensureGalleryTable();
      await pool.query(
        "UPDATE gallery_items SET title = ?, type = ?, url = ?, thumbnail_url = ?, category = ?, event_slug = ?, event_title = ?, aspect_ratio = ? WHERE id = ?",
        [
          title,
          type || "photo",
          url,
          thumbnail_url || url,
          category || "Keynotes",
          event_slug || "all",
          event_title || "All Events",
          aspect_ratio || "aspect-[16/9]",
          id,
        ]
      );
    }
    io.emit("gallery_updated", { type: "update", id });
    return res.json({ success: true, message: "Gallery item updated successfully!" });
  } catch (err: any) {
    console.error("Update Gallery Item Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update gallery item" });
  }
});

// Admin Delete Gallery Media Item
app.delete("/api/admin/gallery/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await ensureGalleryTable();
      await pool.query("DELETE FROM gallery_items WHERE id = ?", [id]);
    }
    io.emit("gallery_updated", { type: "delete", id });
    return res.json({ success: true, message: "Gallery item deleted" });
  } catch (err: any) {
    console.error("Delete Gallery Item Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete gallery item" });
  }
});

// ==========================================
// TESTIMONIALS API ENDPOINTS
// ==========================================

// Get all testimonials (Public)
app.get("/api/testimonials", async (req, res) => {
  try {
    if (pool) {
      await ensureNewAdminTables();
      const [rows]: any = await pool.query("SELECT * FROM testimonials ORDER BY is_featured DESC, created_at DESC");
      return res.json({ success: true, testimonials: rows });
    }
    return res.json({ success: true, testimonials: [] });
  } catch (err: any) {
    console.error("Fetch Testimonials Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch testimonials" });
  }
});

// Admin create testimonial
app.post("/api/admin/testimonials", authenticateAdmin, async (req, res) => {
  const { name, designation, company, quote, avatar, rating, is_featured } = req.body;
  if (!name || !designation || !company || !quote) {
    return res.status(400).json({ success: false, message: "Name, designation, company, and quote are required" });
  }

  const id = `TST-${Date.now().toString().slice(-6)}`;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        "INSERT INTO testimonials (id, name, designation, company, quote, avatar, rating, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, name, designation, company, quote, avatar || "", rating || 5, is_featured ? 1 : 0]
      );
    }
    const newTest = { id, name, designation, company, quote, avatar, rating: rating || 5, is_featured: is_featured ? 1 : 0, created_at: new Date() };
    io.emit("testimonial_updated", { type: "add", testimonial: newTest });
    return res.json({ success: true, testimonial: newTest, message: "Testimonial created successfully!" });
  } catch (err: any) {
    console.error("Create Testimonial Error:", err);
    return res.status(500).json({ success: false, message: "Failed to create testimonial" });
  }
});

// Admin update testimonial
app.put("/api/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, designation, company, quote, avatar, rating, is_featured } = req.body;

  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        "UPDATE testimonials SET name = ?, designation = ?, company = ?, quote = ?, avatar = ?, rating = ?, is_featured = ? WHERE id = ?",
        [name, designation, company, quote, avatar || "", rating || 5, is_featured ? 1 : 0, id]
      );
    }
    io.emit("testimonial_updated", { type: "update", id });
    return res.json({ success: true, message: "Testimonial updated successfully!" });
  } catch (err: any) {
    console.error("Update Testimonial Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update testimonial" });
  }
});

// Admin delete testimonial
app.delete("/api/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query("DELETE FROM testimonials WHERE id = ?", [id]);
    }
    io.emit("testimonial_updated", { type: "delete", id });
    return res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (err: any) {
    console.error("Delete Testimonial Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete testimonial" });
  }
});

// ==========================================
// NEWSLETTER SUBSCRIBERS API ENDPOINTS
// ==========================================

// Subscribe to newsletter (Public)
app.post("/api/newsletter/subscribe", async (req, res) => {
  const { email, source } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "Valid email address is required" });
  }

  const id = `SUB-${Date.now().toString().slice(-6)}`;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        "INSERT INTO newsletter_subscribers (id, email, source) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE email=email",
        [id, email, source || "Website Footer"]
      );
    }
    const newSub = { id, email, source: source || "Website Footer", created_at: new Date() };
    io.emit("new_newsletter_subscriber", newSub);
    return res.json({ success: true, message: "Subscribed to Executive Talks newsletter!" });
  } catch (err: any) {
    console.error("Newsletter Subscribe Error:", err);
    return res.status(500).json({ success: false, message: "Failed to subscribe" });
  }
});

// Admin fetch newsletter subscribers
app.get("/api/admin/newsletter", authenticateAdmin, async (req, res) => {
  try {
    if (pool) {
      await ensureNewAdminTables();
      const [rows]: any = await pool.query("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC");
      return res.json({ success: true, subscribers: rows });
    }
    return res.json({ success: true, subscribers: [] });
  } catch (err: any) {
    console.error("Fetch Newsletter Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch subscribers" });
  }
});

// Admin delete newsletter subscriber
app.delete("/api/admin/newsletter/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query("DELETE FROM newsletter_subscribers WHERE id = ?", [id]);
    }
    return res.json({ success: true, message: "Subscriber deleted" });
  } catch (err: any) {
    console.error("Delete Subscriber Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete subscriber" });
  }
});

// Admin export newsletter subscribers (CSV)
app.get("/api/admin/newsletter/export", authenticateAdmin, async (_req, res) => {
  try {
    let rows: any[] = [];
    if (pool) {
      await ensureNewAdminTables();
      const [data]: any = await pool.query("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC");
      rows = data;
    }
    
    let csv = "ID,Email,Source,Subscribed At\n";
    for (const r of rows) {
      const dateStr = r.created_at ? new Date(r.created_at).toISOString() : "";
      csv += `"${r.id}","${r.email}","${r.source || "Website Footer"}","${dateStr}"\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=newsletter_subscribers_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err: any) {
    console.error("Export Newsletter Error:", err);
    return res.status(500).json({ success: false, message: "Failed to export newsletter subscribers" });
  }
});


// ==========================================
// SEO META TAGS API ENDPOINTS
// ==========================================

// Get SEO meta tags (Public)
app.get("/api/seo", async (req, res) => {
  try {
    if (pool) {
      await ensureNewAdminTables();
      const [rows]: any = await pool.query("SELECT * FROM seo_settings");
      return res.json({ success: true, seo: rows });
    }
    return res.json({ success: true, seo: [] });
  } catch (err: any) {
    console.error("Fetch SEO Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch SEO settings" });
  }
});

// Admin update SEO meta tag
app.put("/api/admin/seo/:page_key", authenticateAdmin, async (req, res) => {
  const { page_key } = req.params;
  const { title, description, keywords } = req.body;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        "INSERT INTO seo_settings (page_key, title, description, keywords) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=?, description=?, keywords=?",
        [page_key, title, description, keywords || "", title, description, keywords || ""]
      );
    }
    return res.json({ success: true, message: `SEO meta tags updated for page '${page_key}'` });
  } catch (err: any) {
    console.error("Update SEO Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update SEO settings" });
  }
});

// ==========================================
// ADMIN USERS MANAGEMENT API ENDPOINTS
// ==========================================

// Admin get list of admin users
app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
  try {
    if (pool) {
      const [rows]: any = await pool.query("SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC");
      return res.json({ success: true, users: rows });
    }
    return res.json({ success: true, users: [] });
  } catch (err: any) {
    console.error("Fetch Admin Users Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch admin users" });
  }
});

// Admin create new admin user
app.post("/api/admin/users", authenticateAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  try {
    if (pool) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role || "admin"]
      );
    }
    return res.json({ success: true, message: `Admin user '${name}' created successfully!` });
  } catch (err: any) {
    console.error("Create Admin User Error:", err);
    return res.status(500).json({ success: false, message: "Failed to create admin user" });
  }
});

// Admin delete admin user
app.delete("/api/admin/users/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("DELETE FROM admins WHERE id = ?", [id]);
    }
    return res.json({ success: true, message: "Admin user deleted" });
  } catch (err: any) {
    console.error("Delete Admin User Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete admin user" });
  }
});

// ==========================================
// WEBSITE SETTINGS API ENDPOINTS
// ==========================================

// Get site settings (Public)
app.get("/api/settings", async (req, res) => {
  try {
    if (pool) {
      await ensureNewAdminTables();
      const [rows]: any = await pool.query("SELECT * FROM website_settings");
      const settingsMap: Record<string, string> = {};
      for (const row of rows) {
        settingsMap[row.setting_key] = row.setting_value;
      }
      return res.json({ success: true, settings: settingsMap });
    }
    return res.json({ success: true, settings: {} });
  } catch (err: any) {
    console.error("Fetch Settings Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
});

// Admin update site settings
app.put("/api/admin/settings", authenticateAdmin, async (req, res) => {
  const settingsObj = req.body;
  try {
    if (pool) {
      await ensureNewAdminTables();
      for (const [key, val] of Object.entries(settingsObj)) {
        await pool.query(
          "INSERT INTO website_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
          [key, String(val), String(val)]
        );
      }
    }
    io.emit("settings_updated", settingsObj);
    return res.json({ success: true, message: "Website settings saved successfully!" });
  } catch (err: any) {
    console.error("Update Settings Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update settings" });
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
