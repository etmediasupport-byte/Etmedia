import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "etmedia_db";
const DB_PORT = Number(process.env.DB_PORT) || 3306;

// Create database pool after database exists
export let pool: mysql.Pool;

export async function initDatabase() {
  try {
    // 1. Initial connection without database selection to ensure DB exists
    const rootConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await rootConnection.end();

    // 2. Create pool connected to etmedia_db
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

    // 3. Create tables if not exists
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

    // 4. Seed admin user: etmediaworld@gmail.com / ETMedia@2026
    const adminEmail = "etmediaworld@gmail.com";
    const [existingAdmins]: any = await pool.query("SELECT * FROM admins WHERE email = ?", [adminEmail]);

    if (existingAdmins.length === 0) {
      const hashedPassword = await bcrypt.hash("ETMedia@2026", 10);
      await pool.query(
        "INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["ET Media Super Admin", adminEmail, hashedPassword, "super_admin"]
      );
      console.log(`[MySQL] Admin account created: ${adminEmail}`);
    } else {
      // Re-hash to ensure password matches ETMedia@2026
      const hashedPassword = await bcrypt.hash("ETMedia@2026", 10);
      await pool.query("UPDATE admins SET password = ? WHERE email = ?", [hashedPassword, adminEmail]);
      console.log(`[MySQL] Admin password updated for: ${adminEmail}`);
    }

    console.log(`[MySQL] Connected successfully to Laragon database '${DB_NAME}'`);
  } catch (error) {
    console.error("[MySQL] Error initializing database:", error);
  }
}
