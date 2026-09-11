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
