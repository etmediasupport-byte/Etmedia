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
        const fallbackDb = DB_NAME; // Always use u409108324_ETMedia

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

        console.log(`[MySQL] Connected via local root fallback to database '${fallbackDb}'`);
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
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) DEFAULT 'N/A',
        organization VARCHAR(255) DEFAULT 'Independent Leader',
        designation VARCHAR(255) DEFAULT 'Executive Delegate',
        city VARCHAR(255),
        country VARCHAR(255) DEFAULT 'India',
        registration_category VARCHAR(100) DEFAULT 'Delegate',
        registering_city VARCHAR(255),
        referral_source VARCHAR(100),
        event_id VARCHAR(255) NOT NULL,
        event_title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try { await pool.query("ALTER TABLE registrations ADD COLUMN first_name VARCHAR(255);"); } catch (e) {}
    try { await pool.query("ALTER TABLE registrations ADD COLUMN last_name VARCHAR(255);"); } catch (e) {}
    try { await pool.query("ALTER TABLE registrations ADD COLUMN city VARCHAR(255);"); } catch (e) {}
    try { await pool.query("ALTER TABLE registrations ADD COLUMN country VARCHAR(255) DEFAULT 'India';"); } catch (e) {}
    try { await pool.query("ALTER TABLE registrations ADD COLUMN registration_category VARCHAR(100) DEFAULT 'Delegate';"); } catch (e) {}
    try { await pool.query("ALTER TABLE registrations ADD COLUMN registering_city VARCHAR(255);"); } catch (e) {}
    try { await pool.query("ALTER TABLE registrations ADD COLUMN referral_source VARCHAR(100);"); } catch (e) {}
    try { await pool.query("ALTER TABLE registrations ADD COLUMN event_title VARCHAR(255);"); } catch (e) {}


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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS delegate_registrations (
        id VARCHAR(100) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        official_email VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(100) NOT NULL,
        city VARCHAR(255) NOT NULL,
        awards_nomination VARCHAR(50) DEFAULT 'No',
        company_name VARCHAR(255) NOT NULL,
        website VARCHAR(255),
        industry VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        gst_number VARCHAR(100),
        contact_person_name VARCHAR(255) NOT NULL,
        contact_person_designation VARCHAR(255) NOT NULL,
        contact_person_email VARCHAR(255) NOT NULL,
        contact_person_phone VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create events table for Dynamic CMS management
    await ensureEventsTable();

    // Create partners and partner_submissions tables
    await ensurePartnersTables();
    await seedDefaultPartners();

    // Create magazines table for Executive Talks Magazine CMS
    await ensureMagazinesTable();
    await seedDefaultMagazines();

    // Create jobs and job_applications tables for Careers CMS
    await ensureJobsTables();
    await seedDefaultJobs();

    // Create gallery_items table and seed default media
    await ensureGalleryTable();
    await seedDefaultGalleryItems();

    // Create new admin modules tables (testimonials, newsletter, seo, settings)
    await ensureNewAdminTables();
    await seedNewAdminTables();

    // Seed default initial events if empty
    const [existingEvents]: any = await pool.query("SELECT COUNT(*) as count FROM events");
    if (existingEvents[0]?.count === 0) {
      const initialEvents = [
        {
          id: "EVT-101",
          slug: "cfo-leadership-summit-2026",
          title: "India CFO & Finance Leadership Summit 2026",
          category: "Conference & Leadership",
          date: "",
          time: "",
          city: "",
          venue: "",
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
        full_description LONGTEXT,
        image TEXT,
        speakers INT DEFAULT 20,
        status VARCHAR(50) DEFAULT 'published',
        is_featured TINYINT(1) DEFAULT 0,
        speakers_list LONGTEXT,
        sponsors_list LONGTEXT,
        gallery_list LONGTEXT,
        agenda_list LONGTEXT,
        map_url TEXT,
        venue_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    try { await pool.query("ALTER TABLE events ADD COLUMN locations TEXT;"); } catch (colErr) {}
    try { await pool.query("ALTER TABLE events ADD COLUMN full_description LONGTEXT;"); } catch (colErr) {}
    try { await pool.query("ALTER TABLE events ADD COLUMN speakers_list LONGTEXT;"); } catch (colErr) {}
    try { await pool.query("ALTER TABLE events ADD COLUMN sponsors_list LONGTEXT;"); } catch (colErr) {}
    try { await pool.query("ALTER TABLE events ADD COLUMN gallery_list LONGTEXT;"); } catch (colErr) {}
    try { await pool.query("ALTER TABLE events ADD COLUMN agenda_list LONGTEXT;"); } catch (colErr) {}
    try { await pool.query("ALTER TABLE events ADD COLUMN map_url TEXT;"); } catch (colErr) {}
    try { await pool.query("ALTER TABLE events ADD COLUMN venue_address TEXT;"); } catch (colErr) {}
  } catch (err) {
    console.error("[MySQL] Error auto-creating events table:", err);
  }
}

export async function ensurePartnersTables() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id VARCHAR(100) PRIMARY KEY,
        brand_name VARCHAR(255) NOT NULL,
        logo TEXT NOT NULL,
        website VARCHAR(255),
        category VARCHAR(100) DEFAULT 'Strategic Partner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS partner_submissions (
        id VARCHAR(100) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        website VARCHAR(255),
        industry VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        partnership_type VARCHAR(255) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error("[MySQL] Error auto-creating partners tables:", err);
  }
}

export async function seedDefaultPartners() {
  if (!pool) return;
  try {
    const [existing]: any = await pool.query("SELECT COUNT(*) as count FROM partners");
    if (existing[0]?.count === 0) {
      const defaultPartners = [
        {
          id: "PTR-101",
          brand_name: "NorthBridge Capital",
          logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300",
          website: "https://northbridge.com",
          category: "Strategic Partner",
        },
        {
          id: "PTR-102",
          brand_name: "Vantage Systems",
          logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300",
          website: "https://vantage.com",
          category: "Tech Partner",
        },
        {
          id: "PTR-103",
          brand_name: "Axiom Cloud",
          logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300",
          website: "https://axiomcloud.com",
          category: "Media Partner",
        },
        {
          id: "PTR-104",
          brand_name: "Helix Enterprise",
          logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300",
          website: "https://helixent.com",
          category: "Award Partner",
        },
      ];

      for (const ptr of defaultPartners) {
        await pool.query(
          "INSERT INTO partners (id, brand_name, logo, website, category) VALUES (?, ?, ?, ?, ?)",
          [ptr.id, ptr.brand_name, ptr.logo, ptr.website, ptr.category]
        );
      }
      console.log("[MySQL] Seeded initial default partner collaborators!");
    }
  } catch (err) {
    console.error("[MySQL] Error seeding partners:", err);
  }
}

export async function ensureMagazinesTable() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS magazines (
        id VARCHAR(100) PRIMARY KEY,
        issue VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        month VARCHAR(100),
        cover VARCHAR(255) NOT NULL,
        pdf_url TEXT,
        pages_list LONGTEXT,
        category VARCHAR(100) DEFAULT 'Leadership',
        is_featured TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error("[MySQL] Error auto-creating magazines table:", err);
  }
}

export async function seedDefaultMagazines() {
  if (!pool) return;
  try {
    const [existing]: any = await pool.query("SELECT COUNT(*) as count FROM magazines");
    if (existing[0]?.count === 0) {
      const defaultMagazines = [
        {
          id: "MAG-101",
          issue: "Issue 28",
          title: "Leading Beyond Today",
          date: "September 2026",
          month: "September 2026",
          cover: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
          pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          pages_list: JSON.stringify([
            "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Leadership",
          is_featured: 1,
        },
        {
          id: "MAG-102",
          issue: "Issue 27",
          title: "The Talent Equation",
          date: "July 2026",
          month: "July 2026",
          cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800",
          pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          pages_list: JSON.stringify([
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "HR",
          is_featured: 0,
        },
        {
          id: "MAG-103",
          issue: "Issue 26",
          title: "Capital & Confidence",
          date: "May 2026",
          month: "May 2026",
          cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
          pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          pages_list: JSON.stringify([
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800",
          ]),
          category: "Finance",
          is_featured: 0,
        },
      ];

      for (const mag of defaultMagazines) {
        await pool.query(
          "INSERT INTO magazines (id, issue, title, date, month, cover, pdf_url, pages_list, category, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [mag.id, mag.issue, mag.title, mag.date, mag.month, mag.cover, mag.pdf_url, mag.pages_list, mag.category, mag.is_featured]
        );
      }
      console.log("[MySQL] Seeded initial default magazine issues!");
    }
  } catch (err) {
    console.error("[MySQL] Error seeding magazines:", err);
  }
}

export async function ensureJobsTables() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        experience VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        responsibilities LONGTEXT,
        qualifications LONGTEXT,
        benefits LONGTEXT,
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id VARCHAR(100) PRIMARY KEY,
        job_id VARCHAR(100) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        experience VARCHAR(100) NOT NULL,
        resume_url TEXT NOT NULL,
        portfolio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error("[MySQL] Error auto-creating jobs tables:", err);
  }
}

export async function seedDefaultJobs() {
  if (!pool) return;
  try {
    const [existing]: any = await pool.query("SELECT COUNT(*) as count FROM jobs");
    if (existing[0]?.count === 0) {
      const defaultJobs = [
        {
          id: "JOB-101",
          title: "Senior Conference Producer",
          department: "Conference Production",
          location: "Hyderabad (Hybrid)",
          experience: "3 — 5 Years",
          description: "Lead the agenda creation, speaker curation, and editorial direction for national C-suite summits and leadership forums.",
          responsibilities: JSON.stringify([
            "Research industry trends across CFO, HR, and Enterprise AI verticals",
            "Recruit CXO keynotes and VP-level panel speakers",
            "Drive conference stage program execution and outcome reports",
          ]),
          qualifications: JSON.stringify([
            "3+ years experience in B2B conference production or media leadership",
            "Exceptional executive communication and editorial research skills",
            "Proven track record of curating high-impact C-suite events",
          ]),
          benefits: JSON.stringify([
            "Competitive salary with performance bonuses",
            "Comprehensive health insurance for self & dependents",
            "Executive networking passes to all ET Media national summits",
            "Hybrid work flexibility and fast-track leadership career path",
          ]),
          status: "Open",
        },
        {
          id: "JOB-102",
          title: "Corporate Sponsorship & Alliances Manager",
          department: "Sales & Sponsorship",
          location: "Bengaluru / Remote",
          experience: "2 — 4 Years",
          description: "Build strategic partnerships and drive corporate event sponsorship packages across enterprise software, BFSI, and technology brands.",
          responsibilities: JSON.stringify([
            "Engage CMOs, VP Marketing, and Alliance Leaders for title & platinum event sponsorships",
            "Manage end-to-end B2B client proposals and partnership contracts",
            "Collaborate with event operations to deliver maximum sponsor ROI",
          ]),
          qualifications: JSON.stringify([
            "2+ years experience in B2B event sponsorship, media sales, or corporate alliances",
            "Strong network across enterprise marketing decision-makers",
            "Excellent negotiation, presentation, and pipeline management skills",
          ]),
          benefits: JSON.stringify([
            "High uncapped commission structure on top of base salary",
            "Executive travel allowances and luxury venue access",
            "Health & wellness perks",
          ]),
          status: "Open",
        },
        {
          id: "JOB-103",
          title: "Senior Event Operations Lead",
          department: "Event Operations",
          location: "Hyderabad",
          experience: "4 — 6 Years",
          description: "Oversee venue setup, AV technology, VIP delegate hospitality, and logistics execution across major 5-star hotel summits.",
          responsibilities: JSON.stringify([
            "Manage 5-star hotel convention logistics, stage AV, and booth setups",
            "Coordinate VIP delegate check-ins and executive hospitality teams",
            "Ensure flawless timing and vendor management on event days",
          ]),
          qualifications: JSON.stringify([
            "4+ years experience managing large-scale B2B corporate events or luxury hotel summits",
            "Strong vendor negotiation, stage AV, and team leadership skills",
          ]),
          benefits: JSON.stringify([
            "Competitive pay & event milestone incentives",
            "Full travel & accommodation coverage for outstation events",
            "Comprehensive medical coverage",
          ]),
          status: "Open",
        },
      ];

      for (const j of defaultJobs) {
        await pool.query(
          "INSERT INTO jobs (id, title, department, location, experience, description, responsibilities, qualifications, benefits, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [j.id, j.title, j.department, j.location, j.experience, j.description, j.responsibilities, j.qualifications, j.benefits, j.status]
        );
      }
      console.log("[MySQL] Seeded initial default career job openings!");
    }
  } catch (err) {
    console.error("[MySQL] Error seeding jobs:", err);
  }
}

export async function ensureGalleryTable() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type ENUM('photo', 'video') DEFAULT 'photo',
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        category VARCHAR(100) DEFAULT 'Keynotes',
        event_slug VARCHAR(255) DEFAULT 'all',
        event_title VARCHAR(255) DEFAULT 'All Events',
        aspect_ratio VARCHAR(50) DEFAULT 'aspect-square',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error("[MySQL] Error auto-creating gallery_items table:", err);
  }
}

export async function seedDefaultGalleryItems() {
  if (!pool) return;
  try {
    const [existing]: any = await pool.query("SELECT COUNT(*) as count FROM gallery_items");
    if (existing[0]?.count === 0) {
      const defaultGallery = [
        {
          id: "GAL-101",
          title: "India CFO Leadership Summit Keynote Stage",
          type: "photo",
          url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop",
          category: "Keynotes",
          event_slug: "cfo-leadership-summit",
          event_title: "India CFO Leadership Summit 2026",
          aspect_ratio: "aspect-[4/3]",
        },
        {
          id: "GAL-102",
          title: "CXO Networking & Executive Gala Dinner",
          type: "photo",
          url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop",
          category: "Networking",
          event_slug: "cfo-leadership-summit",
          event_title: "India CFO Leadership Summit 2026",
          aspect_ratio: "aspect-[16/9]",
        },
        {
          id: "GAL-103",
          title: "HR Excellence Leadership Awards Night",
          type: "photo",
          url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=400&auto=format&fit=crop",
          category: "Awards",
          event_slug: "hr-excellence-awards",
          event_title: "HR Excellence & Leadership Conclave",
          aspect_ratio: "aspect-[3/4]",
        },
        {
          id: "GAL-104",
          title: "Enterprise AI & Tech Leaders Panel Discussion",
          type: "photo",
          url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=400&auto=format&fit=crop",
          category: "Keynotes",
          event_slug: "enterprise-tech-conclave",
          event_title: "National Enterprise Tech & AI Summit",
          aspect_ratio: "aspect-[16/9]",
        },
        {
          id: "GAL-105",
          title: "C-Suite Fireside Chat Highlights Video",
          type: "video",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          thumbnail_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop",
          category: "Keynotes",
          event_slug: "cfo-leadership-summit",
          event_title: "India CFO Leadership Summit 2026",
          aspect_ratio: "aspect-[16/9]",
        },
        {
          id: "GAL-106",
          title: "Luxury 5-Star Hotel Stage & AV Production Setup",
          type: "photo",
          url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop",
          category: "Stage & AV",
          event_slug: "cfo-leadership-summit",
          event_title: "India CFO Leadership Summit 2026",
          aspect_ratio: "aspect-[4/3]",
        },
        {
          id: "GAL-107",
          title: "Title Sponsors & Corporate Booth Exhibition",
          type: "photo",
          url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=1200&auto=format&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=400&auto=format&fit=crop",
          category: "Exhibitions",
          event_slug: "enterprise-tech-conclave",
          event_title: "National Enterprise Tech & AI Summit",
          aspect_ratio: "aspect-[16/9]",
        },
        {
          id: "GAL-108",
          title: "Executive Networking Lunch & Coffee Lounge",
          type: "photo",
          url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
          thumbnail_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=400&auto=format&fit=crop",
          category: "Networking",
          event_slug: "hr-excellence-awards",
          event_title: "HR Excellence & Leadership Conclave",
          aspect_ratio: "aspect-[3/4]",
        },
      ];

      for (const g of defaultGallery) {
        await pool.query(
          "INSERT INTO gallery_items (id, title, type, url, thumbnail_url, category, event_slug, event_title, aspect_ratio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [g.id, g.title, g.type, g.url, g.thumbnail_url, g.category, g.event_slug, g.event_title, g.aspect_ratio]
        );
      }
      console.log("[MySQL] Seeded initial default gallery media items!");
    }
  } catch (err) {
    console.error("[MySQL] Error seeding gallery items:", err);
  }
}

export async function ensureNewAdminTables() {
  if (!pool) return;
  try {
    // 1. Testimonials Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        quote TEXT NOT NULL,
        avatar VARCHAR(255),
        rating INT DEFAULT 5,
        is_featured TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Newsletter Subscribers Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        source VARCHAR(100) DEFAULT 'Footer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. SEO Meta Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_settings (
        page_key VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        keywords TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 4. Website Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS website_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL
      );
    `);
  } catch (err) {
    console.error("[MySQL] Error creating new admin tables:", err);
  }
}

export async function seedNewAdminTables() {
  if (!pool) return;
  try {
    // Seed Testimonials
    const [testCount]: any = await pool.query("SELECT COUNT(*) as count FROM testimonials");
    if (testCount[0]?.count === 0) {
      const defaultTestimonials = [
        {
          id: "TST-101",
          name: "Vikramaditya Rao",
          designation: "Chief Financial Officer",
          company: "Reliance Retail Digital",
          quote: "ET Media Business Intelligence brings together the finest CFO minds in India. The quality of strategic discussion and peer networking at the CFO Summit is second to none.",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
          rating: 5,
          is_featured: 1,
        },
        {
          id: "TST-102",
          name: "Sunita Krishnamurthy",
          designation: "VP & Head of HR",
          company: "Infosys Enterprise Services",
          quote: "Winning the HR Excellence Award from ET Media was a huge milestone for our organization. The level of panel insights on workforce transformation was truly inspirational.",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
          rating: 5,
          is_featured: 1,
        },
        {
          id: "TST-103",
          name: "Anand Deshmukh",
          designation: "Chief Technology Officer",
          company: "HDFC Bank Digital",
          quote: "The Enterprise AI & Tech Conclave is the premier platform for enterprise tech leaders to align on AI compliance, cloud governance, and cybersecurity.",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
          rating: 5,
          is_featured: 1,
        },
      ];

      for (const t of defaultTestimonials) {
        await pool.query(
          "INSERT INTO testimonials (id, name, designation, company, quote, avatar, rating, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [t.id, t.name, t.designation, t.company, t.quote, t.avatar, t.rating, t.is_featured]
        );
      }
      console.log("[MySQL] Seeded default testimonials!");
    }

    // Seed SEO Meta Tags
    const [seoCount]: any = await pool.query("SELECT COUNT(*) as count FROM seo_settings");
    if (seoCount[0]?.count === 0) {
      const defaultSeo = [
        { page_key: "home", title: "ET Media Business Intelligence | India's Premier CXO Leadership Summit", description: "Curated C-suite summits, corporate awards, Executive Talks Magazine, and executive networking for enterprise leaders.", keywords: "CFO summit, HR awards, CXO conference, ET Media" },
        { page_key: "about", title: "About Us | ET Media Business Intelligence", description: "Learn how ET Media builds India's most credible leadership platforms and enterprise summits.", keywords: "About ET Media, B2B media, leadership platforms" },
        { page_key: "events", title: "Conferences & Summits Directory | ET Media", description: "Browse upcoming India CFO Summits, HR Excellence Awards, and Enterprise AI Conclaves.", keywords: "Conferences, business summits, delegate passes" },
        { page_key: "magazine", title: "Executive Talks Magazine | ET Media", description: "Read Executive Talks Magazine featuring C-suite interviews, leadership insights, and digital flipbooks.", keywords: "Executive Talks, business magazine, CXO interviews" },
        { page_key: "careers", title: "Careers at ET Media | Join Our Team", description: "Explore open career opportunities at ET Media in conference production, sponsorship sales, and event operations.", keywords: "ET Media careers, event jobs, media hiring" },
        { page_key: "gallery", title: "Summit Media Gallery | ET Media", description: "High-definition photos and video highlights from ET Media national summits and gala awards.", keywords: "Summit gallery, event photos, CXO videos" },
        { page_key: "contact", title: "Contact Us | ET Media Business Intelligence", description: "Reach out to ET Media for sponsorship, delegate passes, magazine features, or speaker nominations.", keywords: "Contact ET Media, office address, phone number" },
      ];

      for (const s of defaultSeo) {
        await pool.query(
          "INSERT INTO seo_settings (page_key, title, description, keywords) VALUES (?, ?, ?, ?)",
          [s.page_key, s.title, s.description, s.keywords]
        );
      }
      console.log("[MySQL] Seeded default SEO meta tags!");
    }

    // Seed Website Settings
    const [settCount]: any = await pool.query("SELECT COUNT(*) as count FROM website_settings");
    if (settCount[0]?.count === 0) {
      const defaultSettings = [
        { setting_key: "site_title", setting_value: "ET Media Business Intelligence" },
        { setting_key: "support_phone_1", setting_value: "+91 91002 66777" },
        { setting_key: "support_phone_2", setting_value: "+91 94930 87788" },
        { setting_key: "support_email_1", setting_value: "contact@etmedia.in" },
        { setting_key: "support_email_2", setting_value: "registration@etmedia.in" },
        { setting_key: "whatsapp_link", setting_value: "https://wa.me/919100266777" },
        { setting_key: "office_address", setting_value: "Unit No-1012, 10th Floor, Manjeera Trinity Corporate, JNTU-Hitech Road, KPHB, Hyderabad, Telangana 500072, India" },
        { setting_key: "office_hours", setting_value: "Monday to Sunday · 9 AM — 9 PM" },
        { setting_key: "maintenance_mode", setting_value: "false" },
      ];

      for (const set of defaultSettings) {
        await pool.query(
          "INSERT INTO website_settings (setting_key, setting_value) VALUES (?, ?)",
          [set.setting_key, set.setting_value]
        );
      }
      console.log("[MySQL] Seeded default website settings!");
    }
  } catch (err) {
    console.error("[MySQL] Error seeding new admin tables:", err);
  }
}

