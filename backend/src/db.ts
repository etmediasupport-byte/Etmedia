import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Hostinger MySQL credentials provided by user
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "u409108324_ETMedia";
const DB_PASSWORD = process.env.DB_PASSWORD || "ETMedia@2026";
const DB_NAME = process.env.DB_NAME || "u409108324_ETMedia";
const DB_PORT = Number(process.env.DB_PORT) || 3306;

export let pool: mysql.Pool;

export async function initDatabase() {
  // Strategy 1: Connect directly to the Hostinger database (u409108324_ETMedia)
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    await pool.query("SELECT 1");
    console.log(`[MySQL] Connected successfully to Hostinger database '${DB_NAME}' as user '${DB_USER}'`);
  } catch (err: any) {
    (pool as any) = null;
    console.warn(`[MySQL] Direct connection to '${DB_NAME}' failed (${err.message}). Trying localhost root fallback...`);

    // Strategy 2: Fallback for local Laragon/root environment
    try {
      const fallbackUser = "root";
      const fallbackPass = "";
      const fallbackDb = "etmedia_db";

      const rootConnection = await mysql.createConnection({
        host: "127.0.0.1",
        port: DB_PORT,
        user: fallbackUser,
        password: fallbackPass,
      });

      await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${fallbackDb}\`;`);
      await rootConnection.end();

      pool = mysql.createPool({
        host: "127.0.0.1",
        port: DB_PORT,
        user: fallbackUser,
        password: fallbackPass,
        database: fallbackDb,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log(`[MySQL] Connected via root fallback to database '${fallbackDb}'`);
    } catch (fallbackErr: any) {
      console.error("[MySQL] Critical: Could not establish MySQL database connection:", fallbackErr.message);
      (pool as any) = null;
      return;
    }
  }

  // Ensure database tables exist and seed admin user
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) DEFAULT 'N/A',
        organization VARCHAR(255) DEFAULT 'Independent Leader',
        designation VARCHAR(255) DEFAULT 'Executive Delegate',
        event_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) DEFAULT 'N/A',
        enquiry_type VARCHAR(255) DEFAULT 'General Enquiry',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create events table for Dynamic CMS management
    await ensureEventsTable();

    // Seed default initial events if empty
    const [existingEvents]: any = await pool.query("SELECT COUNT(*) as count FROM events");
    if (existingEvents[0]?.count === 0) {
      const initialEvents = [
        {
          id: "EVT-101",
          slug: "cfo-leadership-summit-2026",
          title: "India CFO & Finance Leadership Summit 2026",
          category: "Conference & Leadership",
          date: "October 24, 2026",
          time: "09:00 AM — 06:00 PM",
          city: "Mumbai",
          venue: "The St. Regis, Lower Parel",
          description: "Reinventing capital allocation, enterprise risk, treasury compliance & AI-driven financial strategies.",
          image: "/assets/event-cfo-BjslOJNi.jpg",
          speakers: 28,
          status: "published",
          is_featured: 1,
        },
        {
          id: "EVT-102",
          slug: "hr-excellence-awards-2026",
          title: "National HR Excellence & Workplace Awards",
          category: "Awards & Recognition",
          date: "November 18, 2026",
          time: "05:00 PM — 10:00 PM",
          city: "Bengaluru",
          venue: "JW Marriott Hotel, UB City",
          description: "Honouring chief human resource officers and benchmark organisations building elite workforce cultures.",
          image: "/assets/event-hr-Cswpuq5H.jpg",
          speakers: 16,
          status: "published",
          is_featured: 1,
        },
        {
          id: "EVT-103",
          slug: "tech-enterprise-summit-2026",
          title: "Enterprise Technology & AI Leadership Conclave",
          category: "Summit & Tech",
          date: "December 05, 2026",
          time: "09:30 AM — 05:30 PM",
          city: "Hyderabad",
          venue: "HICC Novotel, Hitec City",
          description: "Connecting CIOs, CTOs, and tech leaders deploying generative AI, cloud infrastructure & cybersecurity.",
          image: "/assets/hero-summit-ClCGVqfO.jpg",
          speakers: 34,
          status: "published",
          is_featured: 1,
        },
        {
          id: "EVT-104",
          slug: "gcc-global-capability-summit",
          title: "India GCC Capability Expansion Summit",
          category: "Global Capability",
          date: "January 14, 2027",
          time: "09:00 AM — 05:00 PM",
          city: "Pune",
          venue: "Ritz-Carlton, Yerwada",
          description: "Accelerating Global Capability Center scale, engineering talent acquisition & cross-border operating models.",
          image: "/assets/hero-leadership-fc7qIRe5.jpg",
          speakers: 24,
          status: "published",
          is_featured: 0,
        },
      ];

      for (const evt of initialEvents) {
        await pool.query(
          "INSERT INTO events (id, slug, title, category, date, time, city, venue, description, image, speakers, status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [evt.id, evt.slug, evt.title, evt.category, evt.date, evt.time, evt.city, evt.venue, evt.description, evt.image, evt.speakers, evt.status, evt.is_featured]
        );
      }
      console.log("[MySQL] Seeded default events into events table!");
    }

    // Seed admin user: etmediaworld@gmail.com / ETMedia@2026
    const adminEmail = "etmediaworld@gmail.com";
    const [existingAdmins]: any = await pool.query("SELECT * FROM admins WHERE email = ?", [adminEmail]);

    const hashedPassword = await bcrypt.hash("ETMedia@2026", 10);
    if (existingAdmins.length === 0) {
      await pool.query(
        "INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["ET Media Super Admin", adminEmail, hashedPassword, "super_admin"]
      );
      console.log(`[MySQL] Admin account created: ${adminEmail}`);
    } else {
      await pool.query("UPDATE admins SET password = ? WHERE email = ?", [hashedPassword, adminEmail]);
      console.log(`[MySQL] Admin password verified for: ${adminEmail}`);
    }
  } catch (tableErr) {
    console.error("[MySQL] Error setting up database tables:", tableErr);
  }
}

export async function ensureEventsTable() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(100) PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(100) NOT NULL,
        time VARCHAR(100) DEFAULT '09:00 AM — 06:00 PM',
        city VARCHAR(100) NOT NULL,
        venue VARCHAR(255) DEFAULT 'Main Convention Center',
        locations TEXT,
        description TEXT NOT NULL,
        image TEXT,
        speakers INT DEFAULT 20,
        status VARCHAR(50) DEFAULT 'published',
        is_featured TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try {
      await pool.query("ALTER TABLE events ADD COLUMN locations TEXT;");
    } catch (colErr) {}
  } catch (err) {
    console.error("[MySQL] Error auto-creating events table:", err);
  }
}
