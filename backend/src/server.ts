import express from "express";
import compression from "compression";
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
import crypto from "crypto";
import Razorpay from "razorpay";
import QRCode from "qrcode";
import { initDatabase, pool, ensureEventsTable, ensureGalleryTable, ensureNewAdminTables, ensureEventPaymentsTable, ensureSectorsTable } from "./db.js";

dotenv.config();

// Razorpay SDK Credentials & Instance Initialization
const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "rzp_test_SwedUUn1KgRMs0").trim();
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "xdW2Ry7T67sUK4zMKb3oOsZh").trim();

const razorpayClient = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// Hostinger SMTP Mailer Credentials & Nodemailer Setup
const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpUser = (process.env.SMTP_USER || "registration@executivetalksmedia.in").trim();
const smtpPass = (process.env.SMTP_PASS || "ETalks@202602").trim();
const smtpFrom = process.env.SMTP_FROM || `"Executive Talks Media Business Intelligence" <${smtpUser}>`;
const adminEmail = (process.env.ADMIN_EMAIL || "registration@executivetalksmedia.in, srikanth@executivetalksmedia.in").trim();
const supportEmail = process.env.SUPPORT_EMAIL || "registration@executivetalksmedia.in";

const mailTransporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465 ? true : process.env.SMTP_SECURE !== "false",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false, // Prevents SSL certificate validation issues on web hosts
  },
});

// --- CENTRALIZED BACKEND VALIDATION HELPERS ---
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const BACKEND_SPAM_TOKENS = new Set([
  "test", "testing", "tester", "asdf", "asdfgh", "asdfghjk", "qwerty", "qwertyuiop", "zxcv", "zxcvbnm",
  "none", "na", "n/a", "null", "undefined", "dummy", "xyz", "abc", "sample", "random", "fake", "temp",
  "aaaa", "bbbb", "cccc", "dddd", "xxxx", "yyyy", "zzzz", "1234", "12345", "123456",
  "dedddddd", "dfffsf", "dsdfsfs", "fdgsfgsefe"
]);

const BACKEND_KEYBOARD_WALKS = [
  "asdf", "sdfg", "dfgh", "fghj", "ghjk", "hjkl",
  "fdsa", "gfds", "hgfd", "jhgf", "kjhg", "lkjh",
  "qwer", "wert", "erty", "rtyu", "tyui", "yuio", "uiop",
  "rewq", "trew", "ytre", "uytr", "iuyt", "oiuy", "poiu",
  "zxcv", "xcvb", "cvbn", "vbnm",
  "vcxz", "bvxc", "nbvc", "mbvn",
];

function isSpamText(val: any): boolean {
  if (!val || typeof val !== "string") return false;
  const clean = val.trim().toLowerCase();
  if (clean.length === 0) return false;

  if (BACKEND_SPAM_TOKENS.has(clean)) return true;

  for (const walk of BACKEND_KEYBOARD_WALKS) {
    if (clean.includes(walk)) return true;
  }

  if (/(.)\1{2,}/i.test(clean)) return true;
  if (/(.{2})\1{2,}/i.test(clean)) return true;
  if (/(.{3})\1{2,}/i.test(clean)) return true;

  const words = clean.split(/[\s,./&()-]+/).filter(Boolean);
  for (const w of words) {
    if (w.length >= 4 && !/[aeiouy]/.test(w)) {
      const isKnownAcronym = /^(vp|hr|md|gm|cfo|cto|chro|ceo|coo|cmo|cso|cio|cpo|pm|qa|tcs|ibm|hcl|mrf|bhel|ntpc|ongc|sbi|hdfc|icici|dlf|itc)$/i.test(w);
      if (!isKnownAcronym) return true;
    }

    const consonantClusters = w.match(/[^aeiouy\d\s]{4,}/gi);
    if (consonantClusters) {
      const allowedClusters = ["ngth", "tchs", "rths", "sch", "phth", "str", "ndst"];
      const hasDisallowed = consonantClusters.some((c) => !allowedClusters.includes(c.toLowerCase()));
      if (hasDisallowed) return true;
    }

    if (w.length >= 5) {
      const uniqueChars = new Set(w.split("")).size;
      if (uniqueChars <= 3) return true;
    }

    if (w.length >= 6 && /^[asdfghjkl]+$/.test(w)) {
      const homeRowUnique = new Set(w.split("")).size;
      if (homeRowUnique <= 4 || !/[aeiouy]/.test(w) || /(.)\1/i.test(w)) {
        return true;
      }
    }
  }
  return false;
}

function isValidEmail(email: any): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) return false;
  const domain = trimmed.split("@")[1];
  if (!domain || !domain.includes(".") || domain.endsWith(".")) return false;
  return !isSpamText(trimmed.split("@")[0]);
}

function isValidPhone(phone: any): boolean {
  if (!phone || typeof phone !== "string") return false;
  const digits = phone.replace(/\D/g, "");
  let subscriber = digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    subscriber = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    subscriber = digits.slice(1);
  }
  if (subscriber.length !== 10) return false;
  if (!/^[6-9]/.test(subscriber)) return false;
  if (/^(\d)\1{9}$/.test(subscriber)) return false;
  if (/^(\d{2})\1{4}$/.test(subscriber)) return false;
  if (/^(\d{3})\1{2}\d$/.test(subscriber) || /^(\d{5})\1$/.test(subscriber)) return false;

  const sequentialPatterns = [
    "0123456789", "1234567890", "2345678901", "3456789012",
    "9876543210", "8765432109", "7654321098", "6543210987",
    "1122334455", "5544332211", "9988776655"
  ];
  if (sequentialPatterns.includes(subscriber)) return false;

  const uniqueDigits = new Set(subscriber.split("")).size;
  if (uniqueDigits <= 2) return false;

  return true;
}

function isValidName(name: any): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return false;
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return false;
  return !isSpamText(trimmed);
}

function isValidDesignation(desig: any): boolean {
  if (!desig || typeof desig !== "string") return false;
  const trimmed = desig.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return false;
  if (!/[a-zA-Z]/.test(trimmed)) return false;
  if (!/^[a-zA-Z0-9\s.,/&()-]+$/.test(trimmed)) return false;
  return !isSpamText(trimmed);
}

function isValidLocation(loc: any): boolean {
  if (!loc || typeof loc !== "string") return false;
  const trimmed = loc.trim();
  if (trimmed.length < 2 || trimmed.length > 120) return false;
  if (!/[a-zA-Z]/.test(trimmed)) return false;
  return !isSpamText(trimmed);
}

function isValidCompanyName(comp: any): boolean {
  if (!comp || typeof comp !== "string") return false;
  const trimmed = comp.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  if (!/[a-zA-Z0-9]/.test(trimmed)) return false;
  return !isSpamText(trimmed);
}

interface RegistrationEmailPayload {
  registrationId?: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phone?: string;
  organization?: string;
  designation?: string;
  city?: string;
  country?: string;
  registrationCategory?: string;
  registeringCity?: string;
  referralSource?: string;
  eventId?: string;
  eventTitle?: string;
  paymentStatus?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  paymentAmount?: number;
  couponApplied?: string;
  createdAt?: string;
}

async function sendRegistrationConfirmationEmail(data: RegistrationEmailPayload) {
  const regId = data.registrationId || `REG-${Date.now()}`;
  const effectiveFirstName = data.firstName || "Delegate";
  const effectiveFullName = data.fullName || `${effectiveFirstName} ${data.lastName || ""}`.trim();
  const eventName = data.eventTitle || "Executive Talks Media Leadership Summit 2026";
  const userEmail = data.email.trim();
  const regCategory = data.registrationCategory || "Executive Delegate";
  const regPhone = data.phone || "N/A";
  const regOrg = data.organization || "N/A";
  const regDesig = data.designation || "Delegate";
  const regCity = data.city || "N/A";
  const regCountry = data.country || "India";
  const regTargetCity = data.registeringCity || regCity;
  const regReferral = data.referralSource || "Direct";
  const payStatus = data.paymentStatus || (data.paymentId ? "Paid" : (data.paymentAmount && data.paymentAmount > 0 ? "Pending" : "Free"));
  const payId = data.paymentId || "N/A";
  const razorpayOrderId = data.razorpayOrderId || "N/A";
  const payAmount = data.paymentAmount !== undefined ? Number(data.paymentAmount) : 0;
  const coupon = data.couponApplied || "None";
  const regDate = data.createdAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const invoiceNo = `ETM-INV-${regId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`;
  const taxableBase = payAmount > 0 ? Math.round(payAmount / 1.18) : 0;
  const gstTotal = payAmount > 0 ? (payAmount - taxableBase) : 0;
  const cgst = Math.round(gstTotal / 2);
  const sgst = gstTotal - cgst;

  const baseUrl = (process.env.PUBLIC_URL || process.env.SITE_URL || "https://www.executivetalksmedia.in").replace(/\/$/, "");
  const verifyPassUrl = `${baseUrl}/verify-pass/${encodeURIComponent(regId)}`;

  // Encode pure Secure Gate Token into the QR code so personal mobile phone cameras cannot open any website
  const qrTokenPayload = `ETM-GATE:${regId}`;

  let qrCodeBuffer: Buffer | null = null;
  try {
    qrCodeBuffer = await QRCode.toBuffer(qrTokenPayload, {
      errorCorrectionLevel: "M",
      type: "png",
      width: 320,
      margin: 2,
      color: {
        dark: "#0891B2",
        light: "#FFFFFF",
      },
    });
  } catch (qrErr) {
    console.error("[Nodemailer] Error generating QR Code PNG Buffer:", qrErr);
  }

  // 1. EMAIL TO DELEGATE (PERSONALIZED INBOX DELIVERY)
  const userMailOptions: any = {
    from: `"Executive Talks Media Business Intelligence" <${smtpUser}>`,
    replyTo: smtpUser,
    to: userEmail,
    subject: `🎉 Official Delegate Pass: ${eventName} (${regId})`,
    text: `
Dear ${effectiveFullName},

Thank you for registering for ${eventName} with Executive Talks Media Business Intelligence. Your entry pass and scannable QR ticket have been confirmed.

DELEGATE PASS DETAILS:
- Full Name: ${effectiveFullName}
- Email: ${userEmail}
- Pass Category: ${regCategory}
- Event / Summit: ${eventName}
- Registration / Pass ID: ${regId}

SCAN YOUR QR CODE FOR ENTRY:
Scan the attached QR code or use your Pass ID for fast-track entry at the venue reception:
${verifyPassUrl}

EVENT REGISTRATION – TERMS & CONDITIONS:
1. Accurate Information: I confirm that all information and details provided by me in the registration form are true, accurate, and complete.
2. Communication Consent: I provide my consent to receive calls, WhatsApp messages, SMS, and emails from the Event Organiser regarding the event, registration, updates, offers, and related activities.
3. Partner Communication: I agree that my contact details may be shared with event partners, sponsors, exhibitors, and associated organisations for event-related communication, business networking, and relevant promotional communication.
4. Digital & Promotional Usage: I provide my consent to the organiser to use my name, photograph, designation, company name, videos, and other event-related content for event promotions, social media, websites, digital campaigns, marketing materials, event reports, and other promotional activities.
5. Photography & Video Consent: I understand that photographs and videos may be captured during the event and may be used by the organiser and its authorised partners for event coverage and promotional purposes.
6. Data Usage: I authorise the organiser to collect, store, process, and use the information provided by me for event management, communication, networking, business opportunities, and promotional activities, subject to applicable laws.
7. Third-Party Communication: I understand that event partners or sponsors may contact me regarding their products, services, business solutions, or networking opportunities based on the consent provided through this registration.
8. Event Updates: I understand that event schedules, speakers, sessions, venue details, and other programme information may be subject to change.
9. Personal Safety & Belongings: Participant safety and personal belongings are the sole responsibility of the participant. The Event Organiser, its partners, sponsors, venue, and associated personnel shall not be held responsible or liable for any loss, theft, damage, or misplacement of personal belongings, including mobile phones, laptops, bags, documents, valuables, or other personal items during the event. Participants are advised to take appropriate care of their personal belongings and valuables at all times.
10. Consent & Acceptance: By clicking "I Agree / Submit Registration", I confirm that I have read and understood these Terms & Conditions and voluntarily provide my consent to the above terms.

Regards,
Executive Talks Media Business Intelligence
registration@executivetalksmedia.in
www.executivetalksmedia.in
`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
        
        <!-- HEADER BANNER -->
        <div style="background: linear-gradient(135deg, #0891b2 0%, #4b1fa7 100%); padding: 28px 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; opacity: 0.95; text-transform: uppercase; letter-spacing: 0.5px;">Official Executive Delegate Pass</p>
        </div>

        <div style="padding: 26px 22px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 15px;">Dear <strong>${effectiveFullName}</strong>,</p>
          <p style="margin-bottom: 20px;">Thank you for registering for <strong>${eventName}</strong>. Your executive pass has been confirmed. Please find your pass details, scannable QR ticket, and event terms below.</p>

          <!-- DELEGATE PASS DETAILS CARD -->
          <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; background-color: #f8fafc; margin-bottom: 22px;">
            <h3 style="margin: 0 0 12px 0; color: #0891b2; font-size: 15px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
              👤 Delegate Pass Details
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 38%;">Full Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${effectiveFullName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Email:</td>
                <td style="padding: 6px 0; color: #0891b2; font-weight: 600;"><a href="mailto:${userEmail}" style="color: #0891b2; text-decoration: none;">${userEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Pass Category:</td>
                <td style="padding: 6px 0;">
                  <span style="display: inline-block; background-color: #0891b2; color: #ffffff; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700;">
                    ${regCategory}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Event / Summit:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${eventName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Pass ID:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #4b1fa7;">${regId}</td>
              </tr>
            </table>
          </div>

          <!-- SCANNABLE QR CODE SECTION -->
          ${qrCodeBuffer ? `
          <div style="text-align: center; border: 2px dashed #0891b2; border-radius: 16px; padding: 20px; background-color: #f0fdf4; margin-bottom: 25px;">
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 15px; font-weight: 800;">📱 SCANNABLE ENTRY PASS QR CODE</h4>
            <p style="margin: 0 0 14px 0; color: #64748b; font-size: 12px;">Present this QR code or Pass ID at the summit registration desk for fast-track badge collection and venue entry.</p>
            <img src="cid:delegate-qrcode" alt="Registration QR Code" style="width: 170px; height: 170px; display: block; margin: 0 auto; border: 3px solid #0891b2; border-radius: 12px; padding: 8px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />
            <p style="margin: 10px 0 0 0; font-family: monospace; font-size: 12px; font-weight: 700; color: #0891b2;">Pass ID: ${regId}</p>
          </div>
          ` : ""}

          <!-- TERMS & CONDITIONS SECTION -->
          <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; background-color: #f8fafc; margin-bottom: 22px;">
            <div style="border-bottom: 2px solid #0891b2; padding-bottom: 8px; margin-bottom: 12px;">
              <h3 style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 EVENT REGISTRATION – TERMS & CONDITIONS
              </h3>
            </div>
            <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b; font-style: italic;">
              By submitting the registration form, you confirmed and agreed to the following terms and conditions:
            </p>
            
            <ol style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.7;">
              <li style="margin-bottom: 8px;">
                <strong>Accurate Information:</strong> I confirm that all information and details provided by me in the registration form are <strong>true, accurate, and complete</strong>.
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Communication Consent:</strong> I provide my consent to receive <strong>calls, WhatsApp messages, SMS, and emails</strong> from the Event Organiser regarding the event, registration, updates, offers, and related activities.
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Partner Communication:</strong> I agree that my contact details may be shared with <strong>event partners, sponsors, exhibitors, and associated organisations</strong> for event-related communication, business networking, and relevant promotional communication.
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Digital & Promotional Usage:</strong> I provide my consent to the organiser to use my name, photograph, designation, company name, videos, and other event-related content for event promotions, social media, websites, digital campaigns, marketing materials, event reports, and other promotional activities.
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Photography & Video Consent:</strong> I understand that photographs and videos may be captured during the event and may be used by the organiser and its authorised partners for <strong>event coverage and promotional purposes</strong>.
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Data Usage:</strong> I authorise the organiser to collect, store, process, and use the information provided by me for <strong>event management, communication, networking, business opportunities, and promotional activities</strong>, subject to applicable laws.
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Third-Party Communication:</strong> I understand that event partners or sponsors may contact me regarding their <strong>products, services, business solutions, or networking opportunities</strong> based on the consent provided through this registration.
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Event Updates:</strong> I understand that event schedules, speakers, sessions, venue details, and other programme information may be subject to change.
              </li>
              <li style="margin-bottom: 8px; background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 8px 10px; list-style-position: inside;">
                <strong>Personal Safety & Belongings:</strong> <strong>Participant safety and personal belongings are the sole responsibility of the participant.</strong> The Event Organiser, its partners, sponsors, venue, and associated personnel shall <strong>not be held responsible or liable for any loss, theft, damage, or misplacement of personal belongings</strong>, including mobile phones, laptops, bags, documents, valuables, or other personal items during the event.
              </li>
              <li style="margin-bottom: 0px;">
                <strong>Consent & Acceptance:</strong> By clicking <strong>“I Agree / Submit Registration,”</strong> I confirm that I have read and understood these Terms & Conditions and voluntarily provide my consent to the above terms.
              </li>
            </ol>
          </div>

          <p style="margin-bottom: 0; font-size: 13px; color: #475569;">Our executive delegate team will reach out with final venue timing, access badges, and summit schedule details.</p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 0; font-weight: 700; color: #1e293b;">Executive Talks Media Business Intelligence</p>
          <p style="margin: 4px 0 0 0;">Official Support Email: <a href="mailto:${smtpUser.trim()}" style="color: #0891b2; text-decoration: none; font-weight: 700;">${smtpUser.trim()}</a></p>
          <p style="margin: 4px 0 0 0;">Website: <a href="https://www.executivetalksmedia.in" style="color: #0891b2; text-decoration: none;">www.executivetalksmedia.in</a></p>
        </div>

      </div>
    `,
    attachments: qrCodeBuffer ? [
      {
        filename: `ExecutiveTalks-Pass-${regId}.png`,
        content: qrCodeBuffer,
        cid: "delegate-qrcode",
      }
    ] : [],
  };

  // 2. EMAIL TO ADMINS (REALTIME MANAGEMENT ALERT)
  const adminRecipients = Array.from(
    new Set([
      "registration@executivetalksmedia.in",
      "srikanth@executivetalksmedia.in",
      adminEmail,
    ].filter(Boolean))
  );

  const adminMailOptions: any = {
    from: `"Executive Talks Media Registration System" <${smtpUser}>`,
    replyTo: userEmail,
    to: adminRecipients.join(", "),
    subject: `🚨 [New Delegate Registration] ${effectiveFullName} (${regCategory}) — ${eventName}`,
    text: `
NEW DELEGATE REGISTRATION RECEIVED

Delegate Details:
- Name: ${effectiveFullName}
- Email: ${userEmail}
- Phone: ${regPhone}
- Designation: ${regDesig}
- Organization: ${regOrg}
- City: ${regCity}, ${regCountry}
- Target City: ${regTargetCity}
- Referral Source: ${regReferral}

Event & Pass Tier:
- Summit: ${eventName}
- Pass Category: ${regCategory}
- Registration ID: ${regId}
- Invoice Number: ${invoiceNo}

Payment & Billing:
- Payment Status: ${payStatus}
- Amount Paid: ₹${payAmount.toLocaleString("en-IN")}
- Payment ID: ${payId}
- Razorpay Order ID: ${razorpayOrderId}
- Coupon Applied: ${coupon}
- Timestamp: ${regDate}

Verify Scannable Pass: ${verifyPassUrl}
Admin Dashboard Login: ${baseUrl}/admin-login
`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 24px; text-align: left; color: #ffffff; border-bottom: 3px solid #0891b2;">
          <span style="background-color: #0891b2; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
            NEW DELEGATE REGISTRATION ALERT
          </span>
          <h2 style="margin: 10px 0 4px 0; font-size: 20px; font-weight: 800; color: #ffffff;">${effectiveFullName}</h2>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">${regDesig} · <strong style="color: #e2e8f0;">${regOrg}</strong></p>
        </div>

        <div style="padding: 24px; color: #1e293b; font-size: 13px; line-height: 1.6;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 38%;">Event Summit:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${eventName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Registration ID:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #0891b2;">${regId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Invoice No:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #0f172a;">${invoiceNo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Pass Tier:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #4b1fa7;">${regCategory}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Payment Status:</td>
                <td style="padding: 6px 0;">
                  <span style="background-color: ${payStatus.toLowerCase() === "paid" ? "#d1fae5" : "#dbeafe"}; color: ${payStatus.toLowerCase() === "paid" ? "#065f46" : "#1e40af"}; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                    ${payStatus} — ₹${payAmount.toLocaleString("en-IN")}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Delegate Email:</td>
                <td style="padding: 6px 0; font-weight: 600;"><a href="mailto:${userEmail}" style="color: #0891b2; text-decoration: none;">${userEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Contact Phone:</td>
                <td style="padding: 6px 0; font-weight: 600;">${regPhone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">City & Location:</td>
                <td style="padding: 6px 0;">${regCity}, ${regCountry} (Target: ${regTargetCity})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Payment ID:</td>
                <td style="padding: 6px 0; font-family: monospace;">${payId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Registered At:</td>
                <td style="padding: 6px 0; color: #64748b;">${regDate}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${verifyPassUrl}" style="display: inline-block; background-color: #0891b2; color: #ffffff; padding: 10px 18px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 13px; margin-right: 8px;">
              🎟️ Verify Scannable Pass
            </a>
            <a href="${baseUrl}/admin-login" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 18px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 13px;">
              ⚡ Open Admin Dashboard
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #e2e8f0;">
          Executive Talks Media Business Intelligence Realtime Alert System
        </div>
      </div>
    `,
  };

  let userSent = false;
  let adminSent = false;

  try {
    const userInfo = await mailTransporter.sendMail(userMailOptions);
    console.log(`[Nodemailer] Delegate pass & invoice sent successfully to ${userEmail} (${userInfo.messageId})`);
    userSent = true;
  } catch (userErr: any) {
    console.error(`[Nodemailer] Error sending registration pass to ${userEmail}:`, userErr.message);
  }

  try {
    const adminInfo = await mailTransporter.sendMail(adminMailOptions);
    console.log(`[Nodemailer] Admin registration alert sent successfully to ${adminRecipients.join(", ")} (${adminInfo.messageId})`);
    adminSent = true;
  } catch (adminErr: any) {
    console.error(`[Nodemailer] Error sending admin registration alert:`, adminErr.message);
  }

  return userSent || adminSent;
}

// Helper: Free Registration Application Notification (Applicant & Admin Alerts)
async function sendFreeApplicationNotificationEmails(data: {
  registrationId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  city?: string;
  country?: string;
  industry?: string;
  linkedinUrl?: string;
  category?: string;
  eventTitle: string;
  reasonForAttending?: string;
}) {
  const regId = data.registrationId;
  const userEmail = data.email.trim();
  const eventName = data.eventTitle;
  const baseUrl = (process.env.PUBLIC_URL || process.env.SITE_URL || "https://www.executivetalksmedia.in").replace(/\/$/, "");

  const userMailOptions: any = {
    from: `"Executive Talks Media Business Intelligence" <${smtpUser}>`,
    replyTo: smtpUser,
    to: userEmail,
    subject: `📋 Free Pass Application (Under Review): ${eventName} (${regId})`,
    text: `
Dear ${data.fullName},

Thank you for submitting your complimentary delegate pass application for ${eventName} with Executive Talks Media Business Intelligence.

APPLICATION DETAILS:
- Full Name: ${data.fullName}
- Email: ${userEmail}
- Pass Category: ${data.category || "Complimentary VIP Pass"}
- Event / Summit: ${eventName}
- Application Ref ID: ${regId}
- Status: Under Review

APPLICATION NOTICE:
Your application is currently under review by our screening committee. Once management approves your application, you will receive your official confirmation email along with your entry QR code for fast-track venue access.

EVENT REGISTRATION – TERMS & CONDITIONS:
1. Accurate Information: I confirm that all information and details provided by me in the registration form are true, accurate, and complete.
2. Communication Consent: I provide my consent to receive calls, WhatsApp messages, SMS, and emails from the Event Organiser regarding the event, registration, updates, offers, and related activities.
3. Partner Communication: I agree that my contact details may be shared with event partners, sponsors, exhibitors, and associated organisations for event-related communication, business networking, and relevant promotional communication.
4. Digital & Promotional Usage: I provide my consent to the organiser to use my name, photograph, designation, company name, videos, and other event-related content for event promotions, social media, websites, digital campaigns, marketing materials, event reports, and other promotional activities.
5. Photography & Video Consent: I understand that photographs and videos may be captured during the event and may be used by the organiser and its authorised partners for event coverage and promotional purposes.
6. Data Usage: I authorise the organiser to collect, store, process, and use the information provided by me for event management, communication, networking, business opportunities, and promotional activities, subject to applicable laws.
7. Third-Party Communication: I understand that event partners or sponsors may contact me regarding their products, services, business solutions, or networking opportunities based on the consent provided through this registration.
8. Event Updates: I understand that event schedules, speakers, sessions, venue details, and other programme information may be subject to change.
9. Personal Safety & Belongings: Participant safety and personal belongings are the sole responsibility of the participant. The Event Organiser, its partners, sponsors, venue, and associated personnel shall not be held responsible or liable for any loss, theft, damage, or misplacement of personal belongings, including mobile phones, laptops, bags, documents, valuables, or other personal items during the event.
10. Consent & Acceptance: By clicking "I Agree / Submit Registration", I confirm that I have read and understood these Terms & Conditions and voluntarily provide my consent to the above terms.

For assistance:
registration@executivetalksmedia.in
www.executivetalksmedia.in
`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #4b1fa7 100%); padding: 26px 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 19px; font-weight: 800; text-transform: uppercase;">EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE</h1>
          <p style="margin: 6px 0 0 0; font-size: 12px; font-weight: 600; opacity: 0.95;">Complimentary Delegate Pass Application</p>
        </div>

        <div style="padding: 26px 22px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 15px;">Dear <strong>${data.fullName}</strong>,</p>
          <p style="margin-bottom: 20px;">Thank you for submitting your complimentary delegate pass application for <strong>${eventName}</strong>.</p>
          
          <!-- APPLICATION DETAILS CARD -->
          <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; background-color: #f8fafc; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #0891b2; font-size: 15px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
              📋 Application Details
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 38%;">Full Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${data.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Email:</td>
                <td style="padding: 6px 0; color: #0891b2; font-weight: 600;"><a href="mailto:${userEmail}" style="color: #0891b2; text-decoration: none;">${userEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Pass Category:</td>
                <td style="padding: 6px 0;">
                  <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700;">
                    ${data.category || "Complimentary VIP Pass"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Event / Summit:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${eventName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Application ID:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #4b1fa7;">${regId}</td>
              </tr>
            </table>
          </div>

          <!-- STATUS NOTICE BOX -->
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #22c55e; padding: 16px; border-radius: 12px; margin-bottom: 22px;">
            <p style="margin: 0; color: #166534; font-weight: 800; font-size: 14px;">
              ⏳ Status: Application Under Executive Review
            </p>
            <p style="margin: 6px 0 0 0; color: #15803d; font-size: 13px; line-height: 1.5;">
              Your application is currently under review by our screening committee. Once management approves your application, you will receive your official confirmation email along with your entry QR code for venue access.
            </p>
          </div>

          <!-- TERMS & CONDITIONS SECTION -->
          <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; background-color: #f8fafc; margin-bottom: 22px;">
            <div style="border-bottom: 2px solid #0891b2; padding-bottom: 8px; margin-bottom: 12px;">
              <h3 style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 EVENT REGISTRATION – TERMS & CONDITIONS
              </h3>
            </div>
            <ol style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.7;">
              <li style="margin-bottom: 8px;"><strong>Accurate Information:</strong> I confirm that all information and details provided by me in the registration form are <strong>true, accurate, and complete</strong>.</li>
              <li style="margin-bottom: 8px;"><strong>Communication Consent:</strong> I provide my consent to receive <strong>calls, WhatsApp messages, SMS, and emails</strong> from the Event Organiser regarding the event, registration, updates, offers, and related activities.</li>
              <li style="margin-bottom: 8px;"><strong>Partner Communication:</strong> I agree that my contact details may be shared with <strong>event partners, sponsors, exhibitors, and associated organisations</strong> for event-related communication, business networking, and relevant promotional communication.</li>
              <li style="margin-bottom: 8px;"><strong>Digital & Promotional Usage:</strong> I provide my consent to the organiser to <strong>use my name, photograph, designation, company name, videos, and other event-related content</strong> for event promotions, social media, websites, digital campaigns, marketing materials, event reports, and other promotional activities.</li>
              <li style="margin-bottom: 8px;"><strong>Photography & Video Consent:</strong> I understand that photographs and videos may be captured during the event and may be used by the organiser and its authorised partners for <strong>event coverage and promotional purposes</strong>.</li>
              <li style="margin-bottom: 8px;"><strong>Data Usage:</strong> I authorise the organiser to collect, store, process, and use the information provided by me for <strong>event management, communication, networking, business opportunities, and promotional activities</strong>, subject to applicable laws.</li>
              <li style="margin-bottom: 8px;"><strong>Third-Party Communication:</strong> I understand that event partners or sponsors may contact me regarding their <strong>products, services, business solutions, or networking opportunities</strong> based on the consent provided through this registration.</li>
              <li style="margin-bottom: 8px;"><strong>Event Updates:</strong> I understand that event schedules, speakers, sessions, venue details, and other programme information may be subject to change.</li>
              <li style="margin-bottom: 8px; background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 8px 10px; list-style-position: inside;">
                <strong>Personal Safety & Belongings:</strong> <strong>Participant safety and personal belongings are the sole responsibility of the participant.</strong> The Event Organiser, its partners, sponsors, venue, and associated personnel shall <strong>not be held responsible or liable for any loss, theft, damage, or misplacement of personal belongings</strong>, including mobile phones, laptops, bags, documents, valuables, or other personal items during the event.
              </li>
              <li style="margin-bottom: 0px;"><strong>Consent & Acceptance:</strong> By clicking <strong>“I Agree / Submit Registration,”</strong> I confirm that I have read and understood these Terms & Conditions and voluntarily provide my consent to the above terms.</li>
            </ol>
          </div>

          <p style="margin-bottom: 0; font-size: 13px; color: #475569;">If you have any questions or require executive assistance, please feel free to reach us at <a href="mailto:${smtpUser}" style="color: #0891b2; text-decoration: none; font-weight: 600;">${smtpUser}</a>.</p>
        </div>

        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 0; font-weight: 700; color: #1e293b;">Executive Talks Media Business Intelligence</p>
          <p style="margin: 4px 0 0 0;">Official Support Email: <a href="mailto:${smtpUser.trim()}" style="color: #0891b2; text-decoration: none; font-weight: 700;">${smtpUser.trim()}</a></p>
          <p style="margin: 4px 0 0 0;">Website: <a href="https://www.executivetalksmedia.in" style="color: #0891b2; text-decoration: none;">www.executivetalksmedia.in</a></p>
        </div>
      </div>
    `,
  };

  const adminRecipients = Array.from(
    new Set([
      "registration@executivetalksmedia.in",
      "srikanth@executivetalksmedia.in",
      adminEmail,
    ].filter(Boolean))
  );

  const adminMailOptions: any = {
    from: `"Executive Talks Media Alerts" <${smtpUser}>`,
    replyTo: userEmail,
    to: adminRecipients.join(", "),
    subject: `🚨 [New Free Pass Application] ${data.fullName} (${data.organization}) — ${eventName}`,
    text: `
NEW FREE PASS APPLICATION RECEIVED

Applicant Details:
- Name: ${data.fullName}
- Designation: ${data.designation}
- Organization: ${data.organization}
- Email: ${userEmail}
- Phone: ${data.phone}
- City / Country: ${data.city || "N/A"}, ${data.country || "India"}
- Industry: ${data.industry || "N/A"}
- LinkedIn: ${data.linkedinUrl || "N/A"}
- Motivation: ${data.reasonForAttending || "N/A"}

Event: ${eventName}
Application ID: ${regId}

Review and approve in Admin Dashboard: ${baseUrl}/admin-login
`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 22px; color: #ffffff; border-bottom: 3px solid #6366f1;">
          <span style="background-color: #6366f1; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
            FREE PASS APPLICATION (PENDING APPROVAL)
          </span>
          <h2 style="margin: 10px 0 2px 0; font-size: 19px; color: #ffffff;">${data.fullName}</h2>
          <p style="margin: 0; font-size: 13px; color: #c7d2fe;">${data.designation} · <strong>${data.organization}</strong></p>
        </div>

        <div style="padding: 22px; color: #334155; font-size: 13px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            <tr><td style="padding: 5px 0; color: #64748b; width: 38%;">Event Summit:</td><td style="font-weight: 700; color: #0f172a;">${eventName}</td></tr>
            <tr><td style="padding: 5px 0; color: #64748b;">Application ID:</td><td style="font-family: monospace; font-weight: 700; color: #4338ca;">${regId}</td></tr>
            <tr><td style="padding: 5px 0; color: #64748b;">Official Email:</td><td><a href="mailto:${userEmail}" style="color: #0891b2; font-weight: 600; text-decoration: none;">${userEmail}</a></td></tr>
            <tr><td style="padding: 5px 0; color: #64748b;">Phone Number:</td><td style="font-weight: 600;">${data.phone}</td></tr>
            <tr><td style="padding: 5px 0; color: #64748b;">Location:</td><td>${data.city || "N/A"}, ${data.country || "India"}</td></tr>
            ${data.industry ? `<tr><td style="padding: 5px 0; color: #64748b;">Industry:</td><td>${data.industry}</td></tr>` : ""}
            ${data.linkedinUrl ? `<tr><td style="padding: 5px 0; color: #64748b;">LinkedIn:</td><td><a href="${data.linkedinUrl}" style="color: #0891b2;" target="_blank">${data.linkedinUrl}</a></td></tr>` : ""}
            ${data.reasonForAttending ? `<tr><td style="padding: 5px 0; color: #64748b;">Motivation / Reason:</td><td style="font-style: italic; color: #475569;">"${data.reasonForAttending}"</td></tr>` : ""}
          </table>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${baseUrl}/admin-login" style="display: inline-block; background-color: #4338ca; color: #ffffff; padding: 10px 22px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 13px;">
              ⚡ Open Admin Dashboard to Approve / Reject
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #e2e8f0;">
          Executive Talks Media Business Intelligence Realtime Alert System
        </div>
      </div>
    `,
  };

  try {
    await Promise.allSettled([
      mailTransporter.sendMail(userMailOptions).then((info) => {
        console.log(`[Nodemailer] Free application receipt email sent to ${userEmail} (${info.messageId})`);
      }),
      mailTransporter.sendMail(adminMailOptions).then((info) => {
        console.log(`[Nodemailer] Free application admin alert sent to ${adminRecipients.join(", ")} (${info.messageId})`);
      }),
    ]);
  } catch (err: any) {
    console.error("[Nodemailer] Error sending free application notification emails:", err.message);
  }
}

async function sendPartnerConfirmationEmail(data: {
  contactPerson: string;
  email: string;
  companyName: string;
}) {
  const mailOptions = {
    from: `"Executive Talks Media Business Intelligence" <${smtpUser.trim()}>`,
    to: data.email,
    subject: `Partnership Interest Received — Executive Talks Media Business Intelligence`,
    text: `Dear ${data.contactPerson},

Thank you for expressing your interest in partnering with Executive Talks Media Business Intelligence.
Our team will get in touch with you shortly.

We will review your requirements and discuss the available branding, sponsorship and business engagement opportunities.

We look forward to building a successful partnership with your organisation.

Regards,
Executive Talks Media Business Intelligence
partner.support@executivetalksmedia.in
www.executivetalksmedia.in`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #00AEEF;">
          <h2 style="color: #00AEEF; margin: 0; font-size: 20px;">EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE</h2>
          <p style="color: #4B1FA7; font-weight: bold; margin-top: 5px; font-size: 13px;">Strategic Partnerships & Business Development</p>
        </div>
        <div style="padding: 25px 0; color: #334155; line-height: 1.6; font-size: 15px;">
          <p>Dear <strong>${data.contactPerson}</strong>,</p>
          <p>Thank you for expressing your interest in partnering with <strong>Executive Talks Media Business Intelligence</strong>.</p>
          <p style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; color: #166534; font-weight: 600; border-radius: 8px;">
            🤝 Our team will get in touch with you shortly.
          </p>
          <p>We will review your requirements and discuss the available branding, sponsorship and business engagement opportunities.</p>
          <p>We look forward to building a successful partnership with your organisation.</p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 13px;">
          <p style="margin: 0; font-weight: bold; color: #1e293b;">Regards,</p>
          <p style="margin: 2px 0; font-weight: bold; color: #0f172a;">Executive Talks Media Business Intelligence</p>
          <p style="margin: 4px 0 0 0;"><a href="mailto:partner.support@executivetalksmedia.in" style="color: #00AEEF; text-decoration: none;">partner.support@executivetalksmedia.in</a></p>
          <p style="margin: 2px 0 0 0;"><a href="https://www.executivetalksmedia.in" style="color: #00AEEF; text-decoration: none;">www.executivetalksmedia.in</a></p>
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

async function sendPartnerAdminNotificationEmail(data: {
  id: string;
  company_name: string;
  website?: string;
  industry: string;
  location: string;
  contact_person: string;
  designation: string;
  email: string;
  phone: string;
  partnership_type: string;
  message?: string;
}) {
  const mailOptions = {
    from: `"Executive Talks Media Business Intelligence" <${smtpUser.trim()}>`,
    to: adminEmail,
    subject: `🤝 New Partner Proposal Submitted: ${data.company_name} (${data.id})`,
    text: `New Partner Application Received:
    
- Submission ID: ${data.id}
- Company Name: ${data.company_name}
- Website: ${data.website || "N/A"}
- Industry: ${data.industry}
- Location: ${data.location}
- Contact Person: ${data.contact_person}
- Designation: ${data.designation}
- Email: ${data.email}
- Phone: ${data.phone}
- Partnership Type: ${data.partnership_type}
- Proposal Message: ${data.message || "N/A"}
`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #00AEEF 0%, #4B1FA7 100%); padding: 25px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">🤝 NEW PARTNER PROPOSAL SUBMITTED</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Executive Talks Media Strategic Partnerships & Alliances Portal</p>
        </div>
        <div style="padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 35%;">Company Name:</td><td style="padding: 8px 0; font-weight: 700; color: #00AEEF;">${data.company_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Website:</td><td style="padding: 8px 0;">${data.website ? `<a href="${data.website}" style="color: #00AEEF;">${data.website}</a>` : "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Industry:</td><td style="padding: 8px 0;">${data.industry}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td style="padding: 8px 0;">${data.location}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Contact Person:</td><td style="padding: 8px 0; font-weight: 700;">${data.contact_person}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Designation:</td><td style="padding: 8px 0;">${data.designation}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #00AEEF; font-weight: bold;">${data.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">${data.phone}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Partnership Type:</td><td style="padding: 8px 0;"><span style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px;">${data.partnership_type}</span></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Proposal Message:</td><td style="padding: 8px 0; background-color: #f8fafc; border-radius: 8px; padding: 12px; font-size: 13px;">${data.message ? data.message.replace(/\n/g, "<br/>") : "N/A"}</td></tr>
          </table>
        </div>
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
          Received via Executive Talks Media Partner Portal · Admin Notification to ${adminEmail}
        </div>
      </div>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Partner admin alert sent to ${adminEmail} (${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer] Error sending partner admin alert:`, err.message);
    return false;
  }
}

async function sendContactAdminNotificationEmail(data: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enquiryType?: string;
  message: string;
  submittedAt?: string;
}) {
  const mailOptions = {
    from: `"Executive Talks Media Business Intelligence" <${smtpUser.trim()}>`,
    to: adminEmail,
    subject: `📩 New Contact Enquiry: ${data.name} (${data.enquiryType || "General"})`,
    text: `New Contact Form Enquiry Received:
    
- Reference ID: ${data.id}
- Sender Name: ${data.name}
- Email Address: ${data.email}
- Phone Number: ${data.phone || "N/A"}
- Enquiry Category: ${data.enquiryType || "General Enquiry"}
- Submitted Message: ${data.message}
- Timestamp: ${data.submittedAt || new Date().toISOString()}
`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #4b1fa7 100%); padding: 25px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">📩 NEW CONTACT ENQUIRY RECEIVED</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Executive Talks Media Executive Advisory Desk</p>
        </div>
        <div style="padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 35%;">Sender Name:</td><td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${data.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Work Email:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #0891b2; font-weight: bold;">${data.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone Number:</td><td style="padding: 8px 0;">${data.phone || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Enquiry Type:</td><td style="padding: 8px 0;"><span style="background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px;">${data.enquiryType || "General Enquiry"}</span></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Enquiry Message:</td><td style="padding: 8px 0; background-color: #f8fafc; border-radius: 8px; padding: 12px; font-size: 13px;">${data.message.replace(/\n/g, "<br/>")}</td></tr>
          </table>
        </div>
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
          Received via Executive Talks Media Contact Form · Admin Notification to ${adminEmail}
        </div>
      </div>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Contact admin alert sent to ${adminEmail} (${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer] Error sending contact admin alert:`, err.message);
    return false;
  }
}

async function sendJobApplicationAdminNotificationEmail(data: {
  id: string;
  job_id: string;
  job_title: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  resume_url: string;
  portfolio_url?: string;
  created_at?: string;
}) {
  const mailOptions = {
    from: `"Executive Talks Media Business Intelligence" <${smtpUser.trim()}>`,
    to: adminEmail,
    subject: `💼 New Candidate Job Application: ${data.name} for ${data.job_title}`,
    text: `New Candidate Job Application Received:
    
- Application ID: ${data.id}
- Job Title: ${data.job_title} (${data.job_id})
- Candidate Name: ${data.name}
- Email Address: ${data.email}
- Phone Number: ${data.phone}
- Relevant Experience: ${data.experience}
- Portfolio / LinkedIn URL: ${data.portfolio_url || "N/A"}
- Resume Document Attached / Provided.
`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; overflow: hidden; shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #0891b2 100%); padding: 25px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">💼 NEW JOB APPLICATION RECEIVED</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Executive Talks Media Careers & Talent Acquisition Portal</p>
        </div>
        <div style="padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 35%;">Position Applied:</td><td style="padding: 8px 0; font-weight: 700; color: #059669;">${data.job_title}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Candidate Name:</td><td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${data.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Work Email:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #0891b2; font-weight: bold;">${data.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone Number:</td><td style="padding: 8px 0;">${data.phone}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Experience Level:</td><td style="padding: 8px 0; font-weight: 600;">${data.experience}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Portfolio / LinkedIn:</td><td style="padding: 8px 0;">${data.portfolio_url ? `<a href="${data.portfolio_url}" style="color: #0891b2;">${data.portfolio_url}</a>` : "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Resume Link:</td><td style="padding: 8px 0;">${data.resume_url.startsWith("data:") ? `<span style="color: #059669; font-weight: bold;">📄 PDF Resume Uploaded (Stored in Admin Dashboard)</span>` : `<a href="${data.resume_url}" style="color: #0891b2; font-weight: bold;">View Resume Document</a>`}</td></tr>
          </table>
        </div>
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
          Received via Executive Talks Media Careers Portal · Admin Notification to ${adminEmail}
        </div>
      </div>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Job application admin alert sent to ${adminEmail} (${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer] Error sending job application admin alert:`, err.message);
    return false;
  }
}

async function sendMembershipAdminNotificationEmail(data: {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  designation?: string;
  company?: string;
  city?: string;
  membership_tier?: string;
  industry?: string;
  objectives?: string;
  attendance_count?: string;
  notes?: string;
  created_at?: string;
}) {
  const mailOptions = {
    from: `"Executive Talks Media Business Intelligence" <${smtpUser.trim()}>`,
    to: adminEmail,
    subject: `👑 New Executive Membership Application: ${data.full_name} (${data.company || "C-Suite"})`,
    text: `New Executive Membership Application Received:
    
- Application Ref ID: ${data.id}
- Executive Name: ${data.full_name}
- Official Work Email: ${data.email}
- Mobile Phone: ${data.phone || "N/A"}
- Designation: ${data.designation || "N/A"}
- Organization: ${data.company || "N/A"}
- City Location: ${data.city || "N/A"}
- Membership Tier: ${data.membership_tier || "Executive Council"}
- Industry Focus: ${data.industry || "N/A"}
- Primary Objectives: ${data.objectives || "N/A"}
- Expected Attendance: ${data.attendance_count || "N/A"}
- Special Notes / Requests: ${data.notes || "N/A"}
`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #4b1fa7 0%, #0891b2 100%); padding: 25px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">👑 NEW EXECUTIVE MEMBERSHIP APPLICATION</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Executive Talks Media C-Suite Leadership Advisory Desk</p>
        </div>
        <div style="padding: 25px; color: #334155; font-size: 14px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 35%;">Executive Name:</td><td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${data.full_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Official Work Email:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #0891b2; font-weight: bold;">${data.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Mobile Phone:</td><td style="padding: 8px 0;">${data.phone || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Designation:</td><td style="padding: 8px 0; font-weight: 600;">${data.designation || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Organization / Company:</td><td style="padding: 8px 0; font-weight: 700; color: #4b1fa7;">${data.company || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">City & Location:</td><td style="padding: 8px 0;">${data.city || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Membership Tier:</td><td style="padding: 8px 0;"><span style="background-color: #f3e8ff; border: 1px solid #d8b4fe; color: #6b21a8; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px;">${data.membership_tier || "Executive Council"}</span></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Primary Industry:</td><td style="padding: 8px 0;">${data.industry || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Primary Goals:</td><td style="padding: 8px 0;">${data.objectives || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Expected Attendance:</td><td style="padding: 8px 0;">${data.attendance_count || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Special Notes / Requests:</td><td style="padding: 8px 0; background-color: #f8fafc; border-radius: 8px; padding: 12px; font-size: 13px;">${data.notes ? data.notes.replace(/\n/g, "<br/>") : "None specified"}</td></tr>
          </table>
        </div>
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
          Received via Executive Talks Media Membership Portal · Admin Notification to ${adminEmail}
        </div>
      </div>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Executive membership admin alert sent to ${adminEmail} (${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer] Error sending membership admin alert:`, err.message);
    return false;
  }
}

async function sendNewsletterAdminNotificationEmail(data: {
  id: string;
  email: string;
  source?: string;
}) {
  const mailOptions = {
    from: `"Executive Talks Media Business Intelligence" <${smtpUser.trim()}>`,
    to: adminEmail,
    subject: `📰 New Executive Talks Newsletter Subscriber: ${data.email}`,
    text: `New Newsletter Subscriber:
- Email Address: ${data.email}
- Subscription Source: ${data.source || "Website Footer"}
`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; padding: 20px;">
        <h3 style="color: #0891b2; margin-top: 0;">📰 New Executive Talks Newsletter Subscriber</h3>
        <p>A new subscriber has joined the Executive Talks distribution list:</p>
        <p style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 14px; color: #047857; font-weight: bold;">
          ${data.email} (Source: ${data.source || "Website Footer"})
        </p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    return false;
  }
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "et_media_super_secret_jwt_key_2026";

// Enable High-Performance Gzip/Deflate Compression (Instant loading on 2G/3G/4G/5G)
app.use(
  compression({
    level: 6,
    threshold: 512, // Compress any response larger than 512 bytes
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// High-Speed In-Memory Cache for Public Read APIs
const fastApiCache = new Map<string, { expiresAt: number; data: any }>();

function getFastCache(key: string): any | null {
  const entry = fastApiCache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }
  if (entry) {
    fastApiCache.delete(key);
  }
  return null;
}

function setFastCache(key: string, data: any, ttlSeconds: number = 60): void {
  fastApiCache.set(key, { expiresAt: Date.now() + ttlSeconds * 1000, data });
}

function invalidateFastCache(prefix?: string): void {
  if (!prefix) {
    fastApiCache.clear();
  } else {
    for (const k of fastApiCache.keys()) {
      if (k.startsWith(prefix)) {
        fastApiCache.delete(k);
      }
    }
  }
}

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
  max: 1000, // Increased limit for responsive client interactions
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

// Convert Base64 Image to Disk File in uploads directory
function saveBase64Image(dataStr: string): string {
  if (!dataStr || typeof dataStr !== "string" || !dataStr.startsWith("data:image/")) {
    return dataStr;
  }
  try {
    const match = dataStr.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
    const ext = match ? match[1] : "png";
    const base64Data = dataStr.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, "");

    const dir1 = path.join(__dirname, "../public/uploads");
    const dir2 = path.resolve(process.cwd(), "public", "uploads");
    const dir3 = path.resolve(process.cwd(), "uploads");

    [dir1, dir2, dir3].forEach((d) => {
      if (!fs.existsSync(d)) {
        try { fs.mkdirSync(d, { recursive: true }); } catch (e) {}
      }
    });

    const uniqueFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const buffer = Buffer.from(base64Data, "base64");

    [dir1, dir2, dir3].forEach((d) => {
      try {
        fs.writeFileSync(path.join(d, uniqueFilename), buffer);
      } catch (e) {}
    });

    return `/uploads/${uniqueFilename}`;
  } catch (err) {
    console.error("Error saving base64 image:", err);
    return dataStr;
  }
}


// Serve static assets from public folder (including compiled frontend build)
const publicPath = path.join(__dirname, "../public");
const uploadsPath = path.join(publicPath, "uploads");
const assetsPath = path.join(publicPath, "assets");

app.use("/uploads", express.static(uploadsPath));
app.use("/uploads", express.static(path.resolve(process.cwd(), "public", "uploads")));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/assets", express.static(assetsPath));
app.use("/assets", express.static(path.resolve(process.cwd(), "public", "assets")));

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

app.get([
  "/favicon.ico",
  "/favicon.png",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/favicon-48x48.png",
  "/favicon-96x96.png",
  "/favicon-144x144.png",
  "/favicon-192x192.png",
  "/favicon-512x512.png",
  "/apple-touch-icon.png",
  "/logo.jpeg",
  "/site.webmanifest"
], (req, res) => {
  const filename = req.path.replace(/^\//, "");
  const targetPath = path.join(publicPath, filename);
  if (fs.existsSync(targetPath)) {
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    return res.sendFile(targetPath);
  }
  return res.sendFile(path.join(publicPath, "favicon.ico"));
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

// --- POPUP ADVERTISEMENT API ENDPOINTS ---

// GET /api/popup/active - Fetch active popup settings and configured active events for site visitors (Cached)
app.get("/api/popup/active", async (_req, res) => {
  const cacheKey = "popup_active";
  const cached = getFastCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    if (!pool) {
      return res.json({ success: true, settings: null, events: [] });
    }
    const [settingsRows]: any = await pool.query("SELECT * FROM popup_settings WHERE id = 1 LIMIT 1");
    const settings = settingsRows.length > 0 ? settingsRows[0] : null;

    const [eventRows]: any = await pool.query(`
      SELECT pe.id as popup_event_id, pe.priority, pe.active, e.*
      FROM popup_events pe
      JOIN events e ON pe.event_id = e.id
      WHERE pe.active = 1
      ORDER BY pe.priority ASC, e.created_at DESC
    `);

    const result = {
      success: true,
      settings,
      events: eventRows,
    };
    setFastCache(cacheKey, result, 45);
    res.json(result);
  } catch (err: any) {
    console.error("[API] Error fetching active popup data:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/popup/settings - Fetch popup settings
app.get("/api/popup/settings", async (_req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, settings: {} });
    }
    const [rows]: any = await pool.query("SELECT * FROM popup_settings WHERE id = 1 LIMIT 1");
    res.json({ success: true, settings: rows[0] || {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/popup/settings - Update popup settings (Admin)
app.put("/api/popup/settings", authenticateAdmin, async (req, res) => {
  try {
    if (!pool) return res.status(500).json({ success: false, message: "Database not connected" });
    const s = req.body;
    await pool.query(`
      UPDATE popup_settings SET
        popup_title = ?, popup_subtitle = ?, theme_color = ?, button_color = ?,
        background_color = ?, border_color = ?, overlay_opacity = ?, border_radius = ?,
        animation_type = ?, position = ?, show_on_load = ?, show_after_delay = ?,
        delay_seconds = ?, show_on_scroll = ?, scroll_percentage = ?, once_per_session = ?,
        cookie_duration_days = ?, status = ?, popup_logo = ?, popup_banner = ?,
        show_close_button = ?, enable_maybe_later = ?, popup_width = ?, blur_background = ?,
        trigger_mode = ?, priority = ?, start_date = ?, end_date = ?,
        daily_start_time = ?, daily_end_time = ?
      WHERE id = 1
    `, [
      s.popup_title || 'Nominations are Open',
      s.popup_subtitle || '',
      s.theme_color || '#D4AF37',
      s.button_color || '#D4AF37',
      s.background_color || '#0B0F19',
      s.border_color || 'rgba(212,175,55,0.3)',
      s.overlay_opacity ?? 80,
      s.border_radius ?? 28,
      s.animation_type || 'scale_fade',
      s.position || 'center',
      s.show_on_load ? 1 : 0,
      s.show_after_delay ? 1 : 0,
      s.delay_seconds ?? 5,
      s.show_on_scroll ? 1 : 0,
      s.scroll_percentage ?? 40,
      s.once_per_session ? 1 : 0,
      s.cookie_duration_days ?? 1,
      s.status || 'active',
      s.popup_logo || '',
      s.popup_banner || '',
      s.show_close_button !== undefined ? (s.show_close_button ? 1 : 0) : 1,
      s.enable_maybe_later !== undefined ? (s.enable_maybe_later ? 1 : 0) : 1,
      s.popup_width || 'max-w-2xl',
      s.blur_background !== undefined ? (s.blur_background ? 1 : 0) : 1,
      s.trigger_mode || 'all',
      s.priority || 'high',
      s.start_date || '',
      s.end_date || '',
      s.daily_start_time || '',
      s.daily_end_time || ''
    ]);

    const [updatedRows]: any = await pool.query("SELECT * FROM popup_settings WHERE id = 1 LIMIT 1");
    const updatedSettings = updatedRows[0];
    invalidateFastCache("popup_");
    io.emit("popup_settings_updated", updatedSettings);

    res.json({ success: true, message: "Popup settings updated successfully", settings: updatedSettings });
  } catch (err: any) {
    console.error("[API] Error updating popup settings:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/popup/events - List all popup events with full event details
app.get("/api/popup/events", async (_req, res) => {
  try {
    if (!pool) return res.json({ success: true, events: [] });
    const [rows]: any = await pool.query(`
      SELECT pe.id as popup_event_id, pe.event_id, pe.priority, pe.active, e.*
      FROM popup_events pe
      JOIN events e ON pe.event_id = e.id
      ORDER BY pe.priority ASC
    `);
    res.json({ success: true, events: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/popup/events - Batch save / update selected active popup events (Admin)
app.post("/api/popup/events", authenticateAdmin, async (req, res) => {
  try {
    if (!pool) return res.status(500).json({ success: false, message: "Database not connected" });
    const { selected_event_ids } = req.body; // Array of event_id strings
    if (!Array.isArray(selected_event_ids)) {
      return res.status(400).json({ success: false, message: "selected_event_ids must be an array of event IDs" });
    }

    // Clear existing popup_events mapping and insert new ones
    await pool.query("DELETE FROM popup_events");
    let priority = 1;
    for (const eid of selected_event_ids) {
      await pool.query(
        "INSERT INTO popup_events (event_id, priority, active) VALUES (?, ?, 1)",
        [eid, priority++]
      );
    }

    const [rows]: any = await pool.query(`
      SELECT pe.id as popup_event_id, pe.event_id, pe.priority, pe.active, e.*
      FROM popup_events pe
      JOIN events e ON pe.event_id = e.id
      ORDER BY pe.priority ASC
    `);

    io.emit("popup_events_updated", rows);
    res.json({ success: true, message: "Popup active events updated successfully", events: rows });
  } catch (err: any) {
    console.error("[API] Error updating popup events:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/popup/events/:id - Delete / remove single popup event mapping
app.delete("/api/popup/events/:id", authenticateAdmin, async (req, res) => {
  try {
    if (!pool) return res.status(500).json({ success: false, message: "Database not connected" });
    const { id } = req.params;
    await pool.query("DELETE FROM popup_events WHERE id = ? OR event_id = ?", [id, id]);
    res.json({ success: true, message: "Popup event removed" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Analytics Tracking Endpoints
app.post("/api/popup/view", async (req, res) => {
  try {
    if (!pool) return res.json({ success: true });
    const { event_id, session_id } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    await pool.query(
      "INSERT INTO popup_analytics (event_id, action_type, session_id, ip_address) VALUES (?, 'view', ?, ?)",
      [event_id || "ALL", session_id || "ANON", Array.isArray(ip) ? ip[0] : ip]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/popup/click", async (req, res) => {
  try {
    if (!pool) return res.json({ success: true });
    const { event_id, session_id } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    await pool.query(
      "INSERT INTO popup_analytics (event_id, action_type, session_id, ip_address) VALUES (?, 'click', ?, ?)",
      [event_id || "ALL", session_id || "ANON", Array.isArray(ip) ? ip[0] : ip]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/popup/close", async (req, res) => {
  try {
    if (!pool) return res.json({ success: true });
    const { event_id, session_id } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    await pool.query(
      "INSERT INTO popup_analytics (event_id, action_type, session_id, ip_address) VALUES (?, 'close', ?, ?)",
      [event_id || "ALL", session_id || "ANON", Array.isArray(ip) ? ip[0] : ip]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/popup/analytics - Fetch overall analytics metrics for Admin Dashboard
app.get("/api/popup/analytics", authenticateAdmin, async (_req, res) => {
  try {
    if (!pool) return res.json({ success: true, summary: {}, eventsBreakdown: [] });

    const [viewCount]: any = await pool.query("SELECT COUNT(*) as count FROM popup_analytics WHERE action_type = 'view'");
    const [clickCount]: any = await pool.query("SELECT COUNT(*) as count FROM popup_analytics WHERE action_type = 'click'");
    const [closeCount]: any = await pool.query("SELECT COUNT(*) as count FROM popup_analytics WHERE action_type = 'close'");

    const views = viewCount[0]?.count || 0;
    const clicks = clickCount[0]?.count || 0;
    const closes = closeCount[0]?.count || 0;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : "0.00";

    const [breakdown]: any = await pool.query(`
      SELECT 
        pa.event_id,
        COALESCE(e.title, pa.event_id) as event_title,
        SUM(CASE WHEN pa.action_type = 'view' THEN 1 ELSE 0 END) as views,
        SUM(CASE WHEN pa.action_type = 'click' THEN 1 ELSE 0 END) as clicks,
        SUM(CASE WHEN pa.action_type = 'close' THEN 1 ELSE 0 END) as closes
      FROM popup_analytics pa
      LEFT JOIN events e ON pa.event_id = e.id
      GROUP BY pa.event_id, e.title
    `);

    res.json({
      success: true,
      summary: {
        total_views: views,
        total_clicks: clicks,
        total_closes: closes,
        ctr: `${ctr}%`,
      },
      eventsBreakdown: breakdown.map((item: any) => ({
        ...item,
        ctr: item.views > 0 ? `${((item.clicks / item.views) * 100).toFixed(2)}%` : "0.00%",
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Executive Talks Media Business Intelligence Backend",
    timestamp: new Date().toISOString(),
    activeSockets: liveActiveUsers,
    database: pool ? "connected" : "disconnected",
  });
});

// 1a. Public Registration Pass Verification Endpoint
app.get("/api/verify-pass/:regId", async (req, res) => {
  const { regId } = req.params;
  try {
    if (pool) {
      // 1. Search registrations table
      const [regRows]: any = await pool.query(
        "SELECT * FROM registrations WHERE id = ? OR razorpay_order_id = ? OR payment_id = ?",
        [regId, regId, regId]
      );
      if (regRows.length > 0) {
        return res.json({ success: true, verified: true, data: regRows[0] });
      }

      // 2. Search delegate_registrations table
      const [delRows]: any = await pool.query(
        "SELECT * FROM delegate_registrations WHERE id = ?",
        [regId]
      );
      if (delRows.length > 0) {
        const d = delRows[0];
        return res.json({
          success: true,
          verified: true,
          data: {
            id: d.id,
            name: d.full_name,
            first_name: d.full_name.split(" ")[0],
            last_name: d.full_name.split(" ").slice(1).join(" "),
            email: d.official_email,
            phone: d.mobile_number,
            organization: d.company_name || d.organization,
            designation: d.designation,
            city: d.city,
            country: "India",
            registration_category: "Corporate Executive Delegate Pass",
            registering_city: d.location || d.city,
            referral_source: d.awards_nomination === "Yes" ? "Awards Nomination (Yes)" : "Direct Registration",
            event_title: `Corporate Delegate Platform (${d.company_name})`,
            payment_status: "Free",
            payment_amount: 0,
            created_at: d.created_at,
          },
        });
      }
    }

    return res.status(404).json({
      success: false,
      verified: false,
      message: "Pass registration not found. Please verify the Registration ID.",
    });
  } catch (err: any) {
    console.error("Verify Pass API Error:", err);
    return res.status(500).json({ success: false, message: "Error verifying registration pass." });
  }
});
// 1b. Dynamic Sitemap XML for SEO
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const baseUrl = "https://www.executivetalksmedia.in";
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
  const robots = `User-agent: *\nAllow: /\nDisallow: /api/admin/\nDisallow: /admin/\n\nSitemap: https://www.executivetalksmedia.in/sitemap.xml\n`;
  res.setHeader("Content-Type", "text/plain");
  return res.send(robots);
});


// Helper functions to parse event timestamps and sort chronologically (live/upcoming first, past at the bottom)
function parseBackendEventTimestamp(evt: any): number {
  let dateStr = evt?.date || "";
  try {
    let locs = typeof evt?.locations === "string" ? JSON.parse(evt.locations) : evt?.locations;
    if (Array.isArray(locs) && locs[0]?.date) {
      dateStr = locs[0].date;
    }
  } catch (e) {}

  if (!dateStr || typeof dateStr !== "string") {
    return evt?.created_at ? new Date(evt.created_at).getTime() : 0;
  }

  const cleanStr = dateStr.trim().replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  const parsed = Date.parse(cleanStr);
  if (!isNaN(parsed)) return parsed;

  const dmySlashMatch = cleanStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (dmySlashMatch) {
    const day = parseInt(dmySlashMatch[1], 10);
    const month = parseInt(dmySlashMatch[2], 10) - 1;
    const year = parseInt(dmySlashMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  const dmyMatch = cleanStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (dmyMatch) {
    const p = Date.parse(`${dmyMatch[2]} ${dmyMatch[1]}, ${dmyMatch[3]}`);
    if (!isNaN(p)) return p;
  }

  const rangeMatch = cleanStr.match(/([A-Za-z]+)\s+(\d{1,2})\s*-\s*(\d{1,2}),?\s+(\d{4})/);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2] && rangeMatch[4]) {
    const p = Date.parse(`${rangeMatch[1]} ${rangeMatch[2]}, ${rangeMatch[4]}`);
    if (!isNaN(p)) return p;
  }

  const yearMatch = cleanStr.match(/\b(20\d\d)\b/);
  if (yearMatch && yearMatch[1]) {
    return new Date(parseInt(yearMatch[1], 10), 0, 1).getTime();
  }

  return evt?.created_at ? new Date(evt.created_at).getTime() : 0;
}

function sortBackendEventsChronologically(eventList: any[]): any[] {
  if (!Array.isArray(eventList) || eventList.length === 0) return [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  const live: any[] = [];
  const upcoming: any[] = [];
  const past: any[] = [];

  eventList.forEach((evt) => {
    if (evt?.status === "live" || evt?.is_live === 1 || evt?.is_live === true) {
      live.push(evt);
      return;
    }
    if (evt?.status === "past" || evt?.status === "completed") {
      past.push(evt);
      return;
    }
    const t = parseBackendEventTimestamp(evt);
    if (!t) {
      upcoming.push(evt);
    } else if (t >= todayStart && t <= todayEnd) {
      live.push(evt);
    } else if (t < todayStart) {
      past.push(evt);
    } else {
      upcoming.push(evt);
    }
  });

  upcoming.sort((a, b) => parseBackendEventTimestamp(a) - parseBackendEventTimestamp(b));
  past.sort((a, b) => parseBackendEventTimestamp(b) - parseBackendEventTimestamp(a));

  return [...live, ...upcoming, ...past];
}

// 2. Events listing (Public API with DB query, fast cache & static fallback)
app.get("/api/events", async (req, res) => {
  const { status, featured } = req.query;
  const cacheKey = `events_list_${status || "all"}_${featured || "all"}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    if (pool) {
      let query = "SELECT * FROM events WHERE (status != 'archived' OR status IS NULL)";
      const params: any[] = [];

      if (featured === "true" || featured === "1") {
        query += " AND is_featured = 1";
      }
      if (status && status !== "all") {
        query += " AND status = ?";
        params.push(status);
      }

      const [rows]: any = await pool.query(query, params);
      const sortedRows = sortBackendEventsChronologically(rows);
      const responseData = { success: true, data: sortedRows };
      setFastCache(cacheKey, responseData, 30);
      return res.json(responseData);
    }

    // Static fallback
    const fallbackData = [
      {
        id: "hr-recall-2k26",
        slug: "hr-recall-2k26",
        title: "HR RECALL 2K26",
        category: "HR & Talent",
        date: "2026-12-11",
        city: "Hyderabad, India",
        venue: "Centenary Convention Centre",
        time: "08:30 AM — 03:00 PM IST",
        speakers: 24,
        status: "published",
        is_featured: 1,
        image: "/assets/event-hr.jpg",
        description: "India's landmark HR leadership conference — where 2,000+ HR professionals, CHROs and business decision-makers unite.",
      },
      {
        id: "cfo-leadership-summit",
        slug: "cfo-leadership-summit-2026",
        title: "India CFO & Finance Leadership Summit 2026",
        category: "Conference & Leadership",
        date: "2026-11-18",
        city: "Bengaluru",
        venue: "The Leela Palace, UB City",
        time: "09:30 AM — 06:00 PM IST",
        speakers: 28,
        status: "published",
        is_featured: 1,
        image: "/assets/event-cfo.jpg",
        description: "Reinventing capital allocation, enterprise risk, treasury compliance & AI-driven financial strategies.",
      },
      {
        id: "creator-event-2026",
        slug: "creator-event-2026",
        title: "Creator Event & Media Summit",
        category: "Awards & Recognition",
        date: "2026-09-20",
        city: "Hyderabad, Vizag",
        venue: "Novotel HICC & Beach Convention Center",
        time: "10:00 AM — 06:00 PM IST",
        speakers: 20,
        status: "published",
        is_featured: 0,
        image: "/assets/hero-summit.jpg",
        description: "The premier gathering where content creators, digital marketers, and brand executives build scalable business models.",
      },
      {
        id: "hr-leadership-summit-2026",
        slug: "hr-leadership-summit-excellence-awards-2026",
        title: "HR Leadership Summit & Excellence Awards 2026",
        category: "HR & Talent",
        date: "2026-10-15",
        city: "Hyderabad",
        venue: "HICC Novotel, Hitec City",
        time: "12:00 PM — 04:00 PM IST",
        speakers: 18,
        status: "published",
        is_featured: 0,
        image: "/assets/event-hr.jpg",
        description: "National HR Leadership Summit & Excellence Awards honoring visionary Chief Human Resources Officers.",
      },
      {
        id: "tech-enterprise-summit",
        slug: "tech-enterprise-summit-2026",
        title: "Enterprise Technology & AI Leadership Conclave",
        category: "Tech Conclave",
        date: "2026-12-05",
        city: "Hyderabad",
        venue: "HICC Novotel, Hitec City",
        time: "09:30 AM — 05:30 PM IST",
        speakers: 34,
        status: "published",
        is_featured: 1,
        image: "/assets/hero-summit.jpg",
        description: "Connecting CIOs, CTOs, and tech leaders deploying generative AI, cloud infrastructure & cybersecurity.",
      },
      {
        id: "gcc-global-capability-summit",
        slug: "gcc-global-capability-summit",
        title: "Global Leadership Summit Perth & India GCC Conclave",
        category: "Conference & Leadership",
        date: "2027-01-14",
        city: "Pune",
        venue: "Ritz-Carlton, Yerwada",
        time: "09:00 AM — 05:00 PM IST",
        speakers: 24,
        status: "published",
        is_featured: 1,
        image: "/assets/hero-leadership.jpg",
        description: "Accelerating Global Capability Center scale, engineering talent acquisition & cross-border operating models.",
      },
    ];

    const responseData = { success: true, data: fallbackData };
    setFastCache(cacheKey, responseData, 60);
    res.json(responseData);
  } catch (err) {
    console.error("Fetch Public Events Error:", err);
    res.status(500).json({ success: false, message: "Failed to load events." });
  }
});

// 2b. Single Event Detail Endpoint (by slug or ID with Fuzzy & Hash Resilience)
app.get("/api/events/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `event_slug_${slug}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const staticFallbacks = [
    {
      id: "hr-recall-2k26",
      slug: "hr-recall-2k26",
      title: "HR RECALL 2K26",
      category: "HR & Talent",
      date: "2026-12-11",
      city: "Hyderabad, India",
      venue: "Centenary Convention Centre",
      time: "08:30 AM — 03:00 PM IST",
      speakers: 24,
      status: "published",
      is_featured: 1,
      image: "/assets/event-hr.jpg",
      description: "India's landmark HR leadership conference — where 2,000+ HR professionals, CHROs and business decision-makers unite.",
    },
    {
      id: "cfo-leadership-summit",
      slug: "cfo-leadership-summit-2026",
      title: "India CFO & Finance Leadership Summit 2026",
      category: "Conference & Leadership",
      date: "2026-11-18",
      city: "Bengaluru",
      venue: "The Leela Palace, UB City",
      time: "09:30 AM — 06:00 PM IST",
      speakers: 28,
      status: "published",
      is_featured: 1,
      image: "/assets/event-cfo.jpg",
      description: "Reinventing capital allocation, enterprise risk, treasury compliance & AI-driven financial strategies.",
    },
    {
      id: "creator-event-2026",
      slug: "creator-event-2026",
      title: "Creator Event & Media Summit",
      category: "Awards & Recognition",
      date: "2026-09-20",
      city: "Hyderabad, Vizag",
      venue: "Novotel HICC & Beach Convention Center",
      time: "10:00 AM — 06:00 PM IST",
      speakers: 20,
      status: "published",
      is_featured: 0,
      image: "/assets/hero-summit.jpg",
      description: "The premier gathering where content creators, digital marketers, and brand executives build scalable business models.",
    },
    {
      id: "hr-leadership-summit-2026",
      slug: "hr-leadership-summit-excellence-awards-2026",
      title: "HR Leadership Summit & Excellence Awards 2026",
      category: "HR & Talent",
      date: "2026-10-15",
      city: "Hyderabad",
      venue: "HICC Novotel, Hitec City",
      time: "12:00 PM — 04:00 PM IST",
      speakers: 18,
      status: "published",
      is_featured: 0,
      image: "/assets/event-hr.jpg",
      description: "National HR Leadership Summit & Excellence Awards honoring visionary Chief Human Resources Officers.",
    },
    {
      id: "tech-enterprise-summit",
      slug: "tech-enterprise-summit-2026",
      title: "Enterprise Technology & AI Leadership Conclave",
      category: "Tech Conclave",
      date: "2026-12-05",
      city: "Hyderabad",
      venue: "HICC Novotel, Hitec City",
      time: "09:30 AM — 05:30 PM IST",
      speakers: 34,
      status: "published",
      is_featured: 1,
      image: "/assets/hero-summit.jpg",
      description: "Connecting CIOs, CTOs, and tech leaders deploying generative AI, cloud infrastructure & cybersecurity.",
    },
    {
      id: "gcc-global-capability-summit",
      slug: "gcc-global-capability-summit",
      title: "Global Leadership Summit Perth & India GCC Conclave",
      category: "Conference & Leadership",
      date: "2027-01-14",
      city: "Pune",
      venue: "Ritz-Carlton, Yerwada",
      time: "09:00 AM — 05:00 PM IST",
      speakers: 24,
      status: "published",
      is_featured: 1,
      image: "/assets/hero-leadership.jpg",
      description: "Accelerating Global Capability Center scale, engineering talent acquisition & cross-border operating models.",
    },
  ];

  try {
    if (pool) {
      // 1. Exact match
      let [rows]: any = await pool.query(
        "SELECT * FROM events WHERE slug = ? OR id = ? LIMIT 1",
        [slug, slug]
      );

      // 2. If not found, strip trailing numeric suffix (e.g. -8399 or -123)
      if (rows.length === 0) {
        const strippedSlug = slug.replace(/-\d+$/, "");
        if (strippedSlug !== slug) {
          const [strippedRows]: any = await pool.query(
            "SELECT * FROM events WHERE slug = ? OR id = ? OR slug LIKE ? LIMIT 1",
            [strippedSlug, strippedSlug, `${strippedSlug}%`]
          );
          if (strippedRows.length > 0) {
            rows = strippedRows;
          }
        }
      }

      // 3. If still not found, try fuzzy prefix match
      if (rows.length === 0) {
        const firstWords = slug.replace(/-\d+$/, "").split("-").slice(0, 3).join("-");
        if (firstWords) {
          const [fuzzyRows]: any = await pool.query(
            "SELECT * FROM events WHERE slug LIKE ? OR title LIKE ? LIMIT 1",
            [`%${firstWords}%`, `%${firstWords.replace(/-/g, " ")}%`]
          );
          if (fuzzyRows.length > 0) {
            rows = fuzzyRows;
          }
        }
      }

      if (rows.length > 0) {
        const resData = { success: true, event: rows[0] };
        setFastCache(cacheKey, resData, 60);
        return res.json(resData);
      }
    }

    // Static fallback match
    const cleanSlug = slug.replace(/-\d+$/, "").toLowerCase();
    const fallbackMatch = staticFallbacks.find((e: any) =>
      e.slug.toLowerCase() === cleanSlug ||
      e.id.toLowerCase() === cleanSlug ||
      cleanSlug.includes(e.slug.toLowerCase()) ||
      e.slug.toLowerCase().includes(cleanSlug)
    ) || staticFallbacks[0];

    const fallbackResponse = { success: true, event: fallbackMatch };
    setFastCache(cacheKey, fallbackResponse, 60);
    return res.json(fallbackResponse);
  } catch (err) {
    console.error("Fetch Single Event Error:", err);
    return res.json({
      success: true,
      event: staticFallbacks[0],
    });
  }
});


// 2c. Create Razorpay Order Endpoint
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount." });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpayClient.orders.create(options);
    console.log(`[Razorpay] Created order ${order.id} for amount ₹${amount}`);
    return res.json({
      success: true,
      key: razorpayKeyId,
      order,
    });
  } catch (err: any) {
    console.error("[Razorpay] Order creation error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create Razorpay order." });
  }
});

// 2d. Verify Razorpay Payment Signature Endpoint
app.post("/api/payments/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId, paymentAmount, couponApplied } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay verification parameters." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isTestMode = razorpayKeyId.startsWith("rzp_test_");
    const isSimulated = isTestMode && (razorpay_signature === "simulated_test_signature" || razorpay_signature.startsWith("simulated_"));

    if (generatedSignature === razorpay_signature || isSimulated) {
      console.log(`[Razorpay] Payment verified successfully! Payment ID: ${razorpay_payment_id}${isSimulated ? " (Test Simulation)" : ""}`);

      let emailSent = false;
      let reg: any = null;

      if (pool && registrationId) {
        const finalPaid = Number(paymentAmount) || 0;
        await pool.query(
          "UPDATE registrations SET payment_status = 'Paid', payment_id = ?, razorpay_order_id = ?, payment_signature = ?, payment_amount = CASE WHEN ? > 0 THEN ? ELSE payment_amount END WHERE id = ?",
          [razorpay_payment_id, razorpay_order_id, razorpay_signature, finalPaid, finalPaid, registrationId]
        );

        const [rows]: any = await pool.query("SELECT * FROM registrations WHERE id = ?", [registrationId]);
        if (rows && rows.length > 0) {
          reg = rows[0];
          emailSent = await sendRegistrationConfirmationEmail({
            registrationId: reg.id,
            firstName: reg.first_name || (reg.name ? reg.name.split(" ")[0] : "Delegate"),
            lastName: reg.last_name || "",
            fullName: reg.name,
            email: reg.email,
            phone: reg.phone,
            organization: reg.organization,
            designation: reg.designation,
            city: reg.city,
            country: reg.country || "India",
            registrationCategory: reg.pass_name || reg.registration_category || "Executive Delegate",
            registeringCity: reg.registering_city || reg.city || "Mumbai",
            referralSource: reg.referral_source || "Online Checkout",
            eventId: reg.event_id,
            eventTitle: reg.event_title,
            paymentStatus: "Paid",
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            paymentAmount: Number(reg.payment_amount) || Number(paymentAmount) || 0,
            couponApplied: reg.coupon_applied || couponApplied,
            createdAt: reg.created_at,
          });

          if (io) {
            io.emit("new_registration", {
              registration: reg,
              message: `🎉 Payment Confirmed! ${reg.name} registered for ${reg.event_title}!`,
            });
          }
        }
      }

      return res.json({
        success: true,
        message: "Payment verified successfully! Registration and tax receipt sent to email.",
        paymentId: razorpay_payment_id,
        emailSent,
        registration: reg,
      });
    } else {
      console.warn(`[Razorpay] Signature mismatch for payment ${razorpay_payment_id}`);
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }
  } catch (err: any) {
    console.error("[Razorpay] Verification error:", err);
    return res.status(500).json({ success: false, message: err.message || "Error verifying payment signature." });
  }
});

// Alias POST /api/payments/verify to /api/payments/verify-payment
app.post("/api/payments/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId, paymentAmount, couponApplied } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay verification parameters." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isTestMode = razorpayKeyId.startsWith("rzp_test_");
    const isSimulated = isTestMode && (razorpay_signature === "simulated_test_signature" || razorpay_signature.startsWith("simulated_"));

    if (generatedSignature === razorpay_signature || isSimulated) {
      console.log(`[Razorpay] Payment verified successfully! Payment ID: ${razorpay_payment_id}${isSimulated ? " (Test Simulation)" : ""}`);

      let emailSent = false;
      let reg: any = null;

      if (pool && registrationId) {
        const finalPaid = Number(paymentAmount) || 0;
        await pool.query(
          "UPDATE registrations SET payment_status = 'Paid', payment_id = ?, razorpay_order_id = ?, payment_signature = ?, payment_amount = CASE WHEN ? > 0 THEN ? ELSE payment_amount END WHERE id = ?",
          [razorpay_payment_id, razorpay_order_id, razorpay_signature, finalPaid, finalPaid, registrationId]
        );

        const [rows]: any = await pool.query("SELECT * FROM registrations WHERE id = ?", [registrationId]);
        if (rows && rows.length > 0) {
          reg = rows[0];
          emailSent = await sendRegistrationConfirmationEmail({
            registrationId: reg.id,
            firstName: reg.first_name || (reg.name ? reg.name.split(" ")[0] : "Delegate"),
            lastName: reg.last_name || "",
            fullName: reg.name,
            email: reg.email,
            phone: reg.phone,
            organization: reg.organization,
            designation: reg.designation,
            city: reg.city,
            country: reg.country || "India",
            registrationCategory: reg.pass_name || reg.registration_category || "Executive Delegate",
            registeringCity: reg.registering_city || reg.city || "Mumbai",
            referralSource: reg.referral_source || "Online Checkout",
            eventId: reg.event_id,
            eventTitle: reg.event_title,
            paymentStatus: "Paid",
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            paymentAmount: Number(reg.payment_amount) || Number(paymentAmount) || 0,
            couponApplied: reg.coupon_applied || couponApplied,
            createdAt: reg.created_at,
          });

          if (io) {
            io.emit("new_registration", {
              registration: reg,
              message: `🎉 Payment Confirmed! ${reg.name} registered for ${reg.event_title}!`,
            });
          }
        }
      }

      return res.json({
        success: true,
        message: "Payment verified successfully! Registration and tax receipt sent to email.",
        paymentId: razorpay_payment_id,
        emailSent,
        registration: reg,
      });
    } else {
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Error verifying payment." });
  }
});

// --- MULTI-STEP REGISTRATION WIZARD ENDPOINTS ---

// 1. POST /api/registrations/start - Step 1: Save Personal & Executive Details
app.post("/api/registrations/start", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      workEmail,
      contactNumber,
      designation,
      companyName,
      city,
      country = "India",
      industry,
      linkedinUrl,
      category,
      participationPreference,
      interestTracks,
      specialRequirements,
      eventId = "hr-recall-2k26",
      eventSlug,
      eventTitle = "HR RECALL 2K26",
    } = req.body;

    if (!workEmail || !firstName || !lastName || !contactNumber || !companyName || !designation || !city) {
      return res.status(400).json({ success: false, message: "Please fill in all mandatory personal and company details." });
    }

    if (!isValidEmail(workEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid official work email address." });
    }

    if (!isValidPhone(contactNumber)) {
      return res.status(400).json({ success: false, message: "Please provide a valid 10-digit contact mobile number." });
    }

    if (!isValidName(firstName) || !isValidName(lastName)) {
      return res.status(400).json({ success: false, message: "Please provide valid First and Last names containing alphabets." });
    }

    if (!isValidDesignation(designation)) {
      return res.status(400).json({ success: false, message: "Please enter a valid job designation (e.g. Chief Human Resources Officer, VP, Director)." });
    }

    if (!isValidCompanyName(companyName)) {
      return res.status(400).json({ success: false, message: "Please enter a valid company or organization name." });
    }

    if (!isValidLocation(city)) {
      return res.status(400).json({ success: false, message: "Please enter a valid city name (e.g. Hyderabad, Bengaluru, Mumbai)." });
    }

    const regId = `ETM-REG-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullName = `${firstName} ${lastName}`.trim();
    const effectiveEventSlug = eventSlug || eventId;
    const tracksStr = Array.isArray(interestTracks) ? interestTracks.join(", ") : (interestTracks || "");

    if (pool) {
      await pool.query(
        `INSERT INTO registrations (
          id, name, first_name, last_name, email, phone, organization, designation,
          city, country, industry, linkedin_url, registration_category, participation_preference,
          interest_tracks, event_id, event_title, payment_status, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Dropped (Step 1 Completed)', 'Incomplete', NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), first_name = VALUES(first_name), last_name = VALUES(last_name),
          phone = VALUES(phone), organization = VALUES(organization), designation = VALUES(designation),
          city = VALUES(city), country = VALUES(country), industry = VALUES(industry),
          linkedin_url = VALUES(linkedin_url), registration_category = VALUES(registration_category),
          participation_preference = VALUES(participation_preference), interest_tracks = VALUES(interest_tracks);`,
        [
          regId, fullName, firstName, lastName, workEmail.trim(), contactNumber, companyName, designation,
          city || "N/A", country, industry || "Technology", linkedinUrl || "", category || "Executive Delegate",
          participationPreference || "In-Person Delegate", tracksStr, effectiveEventSlug, eventTitle
        ]
      );
    }

    return res.json({
      success: true,
      registrationId: regId,
      message: "Step 1 saved successfully."
    });
  } catch (err: any) {
    console.error("[API] Error in /api/registrations/start:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to save registration step 1." });
  }
});

// 2. PUT /api/registrations/:registrationId/pass - Step 2: Update Selected Pass
app.put("/api/registrations/:registrationId/pass", async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { passName, passPrice, paymentAmount, gstAmount, couponApplied } = req.body;
    const numPassPrice = Number(passPrice) || 0;
    const numPaymentAmount = Number(paymentAmount) || (numPassPrice > 0 ? Math.round(numPassPrice * 1.18) : 0);
    const numGstAmount = Number(gstAmount) || (numPaymentAmount - numPassPrice);

    if (pool && registrationId) {
      await pool.query(
        `UPDATE registrations SET 
          pass_name = ?, 
          pass_price = ?, 
          payment_amount = ?, 
          gst_amount = ?, 
          coupon_applied = COALESCE(?, coupon_applied),
          payment_status = CASE WHEN payment_status = 'Paid' THEN 'Paid' ELSE 'Dropped (Pass Selected)' END
        WHERE id = ?`,
        [passName || "Delegate Pass", numPassPrice, numPaymentAmount, numGstAmount, couponApplied || null, registrationId]
      );
    }

    return res.json({ success: true, message: "Selected pass updated." });
  } catch (err: any) {
    console.error("[API] Error in /api/registrations/pass:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update selected pass." });
  }
});

// 3. POST /api/registrations/calculate-payment - Step 3: Coupon & Tax Calculation
app.post("/api/registrations/calculate-payment", async (req, res) => {
  try {
    const { basePrice = 0, couponCode, gstPct = 18 } = req.body;
    const numBase = Number(basePrice) || 0;
    const numGstPct = Number(gstPct) || 18;

    let discountAmount = 0;
    const codeUpper = (couponCode || "").trim().toUpperCase();

    if (codeUpper === "EARLYBIRD10" || codeUpper === "EARLYBIRD") {
      discountAmount = Math.round(numBase * 0.10);
    } else if (codeUpper === "EXECUTIVE20" || codeUpper === "VIP20") {
      discountAmount = Math.round(numBase * 0.20);
    } else if (codeUpper === "ETMEDIA500") {
      discountAmount = 500;
    } else if (codeUpper === "WELCOME1000") {
      discountAmount = 1000;
    } else if (codeUpper) {
      discountAmount = Math.min(500, Math.round(numBase * 0.05));
    }

    const discountedBase = Math.max(0, numBase - discountAmount);
    const gstAmount = Math.round((discountedBase * numGstPct) / 100);
    const finalAmount = discountedBase + gstAmount;

    return res.json({
      success: true,
      basePrice: numBase,
      discountAmount,
      discountedBase,
      gstPct: numGstPct,
      gstAmount,
      finalAmount,
      couponApplied: discountAmount > 0 ? codeUpper : null,
    });
  } catch (err: any) {
    console.error("[API] Error in /api/registrations/calculate-payment:", err);
    return res.status(500).json({ success: false, message: err.message || "Calculation error." });
  }
});

// 4. GET /api/registrations/:registrationId - Fetch registration details for success ticket
app.get("/api/registrations/:registrationId", async (req, res) => {
  try {
    const { registrationId } = req.params;
    if (pool && registrationId) {
      const [rows]: any = await pool.query("SELECT * FROM registrations WHERE id = ? LIMIT 1", [registrationId]);
      if (rows && rows.length > 0) {
        return res.json({ success: true, registration: rows[0] });
      }
    }
    return res.status(404).json({ success: false, message: "Registration record not found." });
  } catch (err: any) {
    console.error("[API] Error fetching registration:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4b. POST /api/registrations/free-draft - Auto-capture intermediate free registration drop-off steps
app.post("/api/registrations/free-draft", async (req, res) => {
  try {
    const {
      registrationId,
      step = 1,
      firstName = "",
      lastName = "",
      workEmail = "",
      contactNumber = "",
      designation = "",
      companyName = "",
      city = "",
      country = "India",
      industry = "",
      linkedinUrl = "",
      category = "Free Interest Delegate",
      participationPreference = "In-Person Delegate",
      interestTracks,
      reasonForAttending = "",
      eventId = "hr-recall-2k26",
      eventSlug,
      eventTitle = "HR RECALL 2K26",
    } = req.body;

    const regId = registrationId || `ETM-FREE-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullName = `${firstName} ${lastName}`.trim() || firstName || "Interested Delegate";
    const effectiveEventSlug = eventSlug || eventId;
    const tracksStr = Array.isArray(interestTracks) ? interestTracks.join(", ") : (interestTracks || "");
    const dropStatus = step === 1 ? "Dropped (Free Step 1)" : "Dropped (Free Step 2)";

    if (pool) {
      const [existing]: any = await pool.query("SELECT id FROM registrations WHERE id = ? LIMIT 1", [regId]);
      if (existing && existing.length > 0) {
        await pool.query(
          `UPDATE registrations SET
            name = COALESCE(NULLIF(?, ''), name),
            first_name = COALESCE(NULLIF(?, ''), first_name),
            last_name = COALESCE(NULLIF(?, ''), last_name),
            email = COALESCE(NULLIF(?, ''), email),
            phone = COALESCE(NULLIF(?, ''), phone),
            organization = COALESCE(NULLIF(?, ''), organization),
            designation = COALESCE(NULLIF(?, ''), designation),
            city = COALESCE(NULLIF(?, ''), city),
            country = COALESCE(NULLIF(?, ''), country),
            industry = COALESCE(NULLIF(?, ''), industry),
            linkedin_url = COALESCE(NULLIF(?, ''), linkedin_url),
            registration_category = COALESCE(NULLIF(?, ''), registration_category),
            participation_preference = COALESCE(NULLIF(?, ''), participation_preference),
            interest_tracks = COALESCE(NULLIF(?, ''), interest_tracks),
            coupon_applied = COALESCE(NULLIF(?, ''), coupon_applied),
            payment_status = CASE WHEN payment_status = 'Approved (Free Pass)' OR payment_status = 'Pending Approval' THEN payment_status ELSE ? END
          WHERE id = ?`,
          [
            fullName, firstName, lastName, workEmail.trim(), contactNumber, companyName, designation,
            city, country, industry, linkedinUrl, category, participationPreference, tracksStr,
            reasonForAttending ? `Motivation: ${reasonForAttending}` : null, dropStatus, regId
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO registrations (
            id, name, first_name, last_name, email, phone, organization, designation,
            city, country, industry, linkedin_url, registration_category, participation_preference,
            interest_tracks, pass_name, event_id, event_title, payment_status, status, payment_amount, coupon_applied, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Complimentary Pass (Draft)', ?, ?, ?, 'Incomplete', 0, ?, NOW())`,
          [
            regId, fullName, firstName, lastName, (workEmail || "draft@etmedia.in").trim(), contactNumber || "N/A", companyName || "N/A", designation || "N/A",
            city || "N/A", country, industry || "Technology", linkedinUrl || "", category,
            participationPreference, tracksStr, effectiveEventSlug, eventTitle, dropStatus,
            reasonForAttending ? `Motivation: ${reasonForAttending}` : "Free Draft"
          ]
        );
      }
    }

    return res.json({ success: true, registrationId: regId });
  } catch (err: any) {
    console.error("[API] Error in /api/registrations/free-draft:", err);
    return res.json({ success: true, registrationId: req.body.registrationId || `ETM-FREE-${Date.now()}` });
  }
});

// 5. POST /api/registrations/free-start - Submit Free Delegate Interest Application (Pending Admin Approval)
app.post("/api/registrations/free-start", async (req, res) => {
  try {
    const {
      registrationId,
      firstName,
      lastName,
      workEmail,
      contactNumber,
      designation,
      companyName,
      city,
      country = "India",
      industry,
      linkedinUrl,
      category = "Free Interest Delegate",
      participationPreference = "In-Person Delegate",
      interestTracks,
      reasonForAttending,
      eventId = "hr-recall-2k26",
      eventSlug,
      eventTitle = "HR RECALL 2K26",
    } = req.body;

    if (!workEmail || !firstName || !lastName || !contactNumber || !companyName || !designation || !city) {
      return res.status(400).json({ success: false, message: "Please fill in all mandatory personal and organization details." });
    }

    if (!isValidEmail(workEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid official work email address." });
    }

    if (!isValidPhone(contactNumber)) {
      return res.status(400).json({ success: false, message: "Please provide a valid 10-digit contact mobile number." });
    }

    if (!isValidName(firstName) || !isValidName(lastName)) {
      return res.status(400).json({ success: false, message: "Please provide valid First and Last names containing alphabets." });
    }

    if (!isValidDesignation(designation)) {
      return res.status(400).json({ success: false, message: "Please enter a valid job designation (e.g. Chief Human Resources Officer, VP, Director)." });
    }

    if (!isValidCompanyName(companyName)) {
      return res.status(400).json({ success: false, message: "Please enter a valid company or organization name." });
    }

    if (!isValidLocation(city)) {
      return res.status(400).json({ success: false, message: "Please enter a valid city name (e.g. Hyderabad, Bengaluru, Mumbai)." });
    }

    const regId = registrationId || `ETM-FREE-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullName = `${firstName} ${lastName}`.trim();
    const effectiveEventSlug = eventSlug || eventId;
    const tracksStr = Array.isArray(interestTracks) ? interestTracks.join(", ") : (interestTracks || "");

    const newRegistration = {
      id: regId,
      name: fullName,
      first_name: firstName,
      last_name: lastName,
      email: workEmail.trim(),
      phone: contactNumber,
      organization: companyName,
      designation,
      city: city || "N/A",
      country,
      industry: industry || "Technology",
      linkedin_url: linkedinUrl || "",
      registration_category: category,
      participation_preference: participationPreference,
      interest_tracks: tracksStr,
      pass_name: "Complimentary Pass (Pending Approval)",
      event_id: effectiveEventSlug,
      event_title: eventTitle,
      payment_status: "Pending Approval",
      payment_amount: 0,
      coupon_applied: reasonForAttending ? `Motivation: ${reasonForAttending}` : "Free Application",
      created_at: new Date().toISOString(),
    };

    if (pool) {
      await pool.query(
        `INSERT INTO registrations (
          id, name, first_name, last_name, email, phone, organization, designation,
          city, country, industry, linkedin_url, registration_category, participation_preference,
          interest_tracks, pass_name, event_id, event_title, payment_status, status, payment_amount, coupon_applied, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Approval', 'Pending', 0, ?, NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), first_name = VALUES(first_name), last_name = VALUES(last_name),
          phone = VALUES(phone), organization = VALUES(organization), designation = VALUES(designation),
          city = VALUES(city), country = VALUES(country), industry = VALUES(industry),
          linkedin_url = VALUES(linkedin_url), registration_category = VALUES(registration_category),
          participation_preference = VALUES(participation_preference), interest_tracks = VALUES(interest_tracks),
          pass_name = VALUES(pass_name), payment_status = 'Pending Approval', status = 'Pending',
          coupon_applied = VALUES(coupon_applied);`,
        [
          regId, fullName, firstName, lastName, workEmail.trim(), contactNumber, companyName, designation,
          city || "N/A", country, industry || "Technology", linkedinUrl || "", category,
          participationPreference, tracksStr, "Complimentary Pass (Pending Approval)", effectiveEventSlug, eventTitle,
          reasonForAttending ? `Motivation: ${reasonForAttending}` : "Free Application"
        ]
      );
    }

    // Realtime broadcast to Admin Dashboard
    if (io) {
      io.emit("new_registration", {
        registration: newRegistration,
        message: `📋 New Free Delegate Application received from ${fullName} (${companyName}) for ${eventTitle}! Status: Pending Approval.`,
      });
    }

    // Automated Email Notifications (Applicant Receipt + Admin Team Alert)
    sendFreeApplicationNotificationEmails({
      registrationId: regId,
      fullName,
      firstName,
      lastName,
      email: workEmail.trim(),
      phone: contactNumber,
      organization: companyName,
      designation,
      city: city || "N/A",
      country,
      industry: industry || "Technology",
      linkedinUrl: linkedinUrl || "",
      category,
      eventTitle,
      reasonForAttending,
    }).catch((emailErr) => {
      console.error("[API] Background free application email error:", emailErr);
    });

    return res.json({
      success: true,
      registrationId: regId,
      message: "Free delegate registration application submitted for admin approval.",
    });
  } catch (err: any) {
    console.error("[API] Error in /api/registrations/free-start:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to submit free delegate application." });
  }
});

// Admin Approve Free Registration & Send Ticket Pass
app.post("/api/admin/registrations/:id/approve", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    let reg: any = null;
    if (pool) {
      const [rows]: any = await pool.query("SELECT * FROM registrations WHERE id = ?", [id]);
      if (rows && rows.length > 0) {
        reg = rows[0];
      }
    }
    if (!reg) {
      return res.status(404).json({ success: false, message: "Registration record not found." });
    }

    if (pool) {
      await pool.query("UPDATE registrations SET payment_status = 'Approved (Free Pass)', pass_name = 'Complimentary VIP Pass' WHERE id = ?", [id]);
    }

    // Send confirmation email with QR Ticket Pass
    const emailSent = await sendRegistrationConfirmationEmail({
      registrationId: reg.id,
      firstName: reg.first_name || reg.name.split(" ")[0],
      lastName: reg.last_name || "",
      fullName: reg.name,
      email: reg.email,
      phone: reg.phone,
      organization: reg.organization,
      designation: reg.designation,
      city: reg.city,
      country: reg.country || "India",
      registrationCategory: reg.registration_category || "Free Approved Delegate",
      registeringCity: reg.registering_city || reg.city || "Mumbai",
      referralSource: "Admin Approved",
      eventId: reg.event_id,
      eventTitle: reg.event_title,
      paymentStatus: "Approved (Free Pass)",
      paymentId: "ADMIN-APPROVED-FREE",
      paymentAmount: 0,
      couponApplied: reg.coupon_applied || "Admin Approved",
      createdAt: reg.created_at,
    });

    return res.json({
      success: true,
      message: `✅ Approved application for ${reg.name}! Confirmation email & ticket pass sent to ${reg.email}.`,
      emailSent,
    });
  } catch (err: any) {
    console.error("[API] Error approving registration:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to approve registration." });
  }
});

// Admin Reject Free Registration Application
app.post("/api/admin/registrations/:id/reject", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("UPDATE registrations SET payment_status = 'Rejected' WHERE id = ?", [id]);
    }
    return res.json({ success: true, message: "Application marked as Rejected." });
  } catch (err: any) {
    console.error("[API] Error rejecting registration:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to reject application." });
  }
});

// Admin Bulk Grant Free Pass & Automatically Send Ticket Emails to All Selected Delegates
app.post("/api/admin/registrations/bulk-grant-free", authenticateAdmin, async (req, res) => {
  const { ids, category } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "Please select at least one delegate." });
  }

  try {
    let records: any[] = [];
    if (pool) {
      const placeholders = ids.map(() => "?").join(",");
      const [rows]: any = await pool.query(`SELECT * FROM registrations WHERE id IN (${placeholders})`, ids);
      if (rows && rows.length > 0) {
        records = rows;
      }
    }

    if (records.length === 0) {
      return res.status(404).json({ success: false, message: "No matching delegate records found." });
    }

    const passCategory = category || "Complimentary VIP Pass";

    // Update status in MySQL database
    if (pool) {
      const placeholders = ids.map(() => "?").join(",");
      await pool.query(
        `UPDATE registrations SET payment_status = 'Approved (Free Pass)', registration_category = ?, pass_name = ?, payment_id = 'ADMIN-BULK-FREE-GRANT' WHERE id IN (${placeholders})`,
        [passCategory, passCategory, ...ids]
      );
    }

    // Send confirmation emails with QR code tickets to each selected delegate
    const emailPromises = records.map((reg) =>
      sendRegistrationConfirmationEmail({
        registrationId: reg.id,
        firstName: reg.first_name || (reg.name ? reg.name.split(" ")[0] : "Delegate"),
        lastName: reg.last_name || "",
        fullName: reg.name,
        email: reg.email,
        phone: reg.phone || "N/A",
        organization: reg.organization || "Corporate Delegate",
        designation: reg.designation || "Executive Leader",
        city: reg.city || "Mumbai",
        country: reg.country || "India",
        registrationCategory: passCategory,
        registeringCity: reg.registering_city || reg.city || "Mumbai",
        referralSource: "Admin Bulk Free Pass Grant",
        eventId: reg.event_id,
        eventTitle: reg.event_title,
        paymentStatus: "Approved (Free Pass)",
        paymentId: "ADMIN-BULK-FREE-GRANT",
        paymentAmount: 0,
        couponApplied: "Admin Free Pass",
        createdAt: reg.created_at,
      }).catch((err) => {
        console.error(`[Nodemailer] Bulk email failed for ${reg.email}:`, err.message);
        return { success: false };
      })
    );

    const emailResults = await Promise.allSettled(emailPromises);
    const sentCount = emailResults.filter((r) => r.status === "fulfilled").length;

    // Emit live socket event for real-time dashboard updates
    if (io) {
      io.emit("admin_activity", {
        type: "bulk_free_pass_granted",
        count: records.length,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      count: records.length,
      sentEmailsCount: sentCount,
      message: `🎉 Free Passes granted to ${records.length} delegates and confirmation ticket emails dispatched!`,
    });
  } catch (err: any) {
    console.error("[API] Error in bulk free pass grant:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to grant bulk free passes." });
  }
});

// Admin Bulk Import Offline Delegates from Excel
app.post("/api/admin/registrations/bulk-import-offline", authenticateAdmin, async (req, res) => {
  const { delegates, sendEmails = false, defaultEventId, defaultEventTitle, defaultCategory } = req.body;
  if (!Array.isArray(delegates) || delegates.length === 0) {
    return res.status(400).json({ success: false, message: "No delegates provided for import." });
  }

  try {
    const insertedDelegates: any[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < delegates.length; i++) {
      const d = delegates[i];
      if (!d.name && !d.email) continue;

      const fullName = (d.name || `${d.first_name || ""} ${d.last_name || ""}`).trim();
      const email = (d.email || d.work_email || "").trim();
      if (!email) continue;

      const firstName = d.first_name || (fullName.split(" ")[0] || "Delegate");
      const lastName = d.last_name || (fullName.split(" ").slice(1).join(" ") || "");
      const phone = d.phone || d.mobile || d.contact_number || "N/A";
      const organization = d.organization || d.company || d.company_name || "Corporate Enterprise";
      const designation = d.designation || d.title || d.role || "Executive Delegate";
      const city = d.city || "Pan-India";
      const country = d.country || "India";
      const eventId = d.event_id || d.eventSlug || defaultEventId || "cfo-leadership-summit";
      const eventTitle = d.event_title || defaultEventTitle || "India CFO Leadership Summit 2026";
      const passCategory = d.registration_category || d.pass_name || defaultCategory || "Complimentary VIP Pass";
      const paymentStatus = d.payment_status || "Approved (Free Pass)";
      const paymentAmount = Number(d.payment_amount) || 0;
      const paymentId = d.payment_id || `OFFLINE-EXCEL-${timestamp}-${i + 1}`;
      const regId = `ETM-OFF-${timestamp.toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (pool) {
        await pool.query(
          `INSERT INTO registrations (
            id, name, first_name, last_name, email, phone, organization, designation,
            city, country, registration_category, pass_name, event_id, event_title,
            payment_status, status, payment_amount, payment_id, referral_source, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, ?, 'Offline Excel Import', NOW())
          ON DUPLICATE KEY UPDATE
            name = VALUES(name), first_name = VALUES(first_name), last_name = VALUES(last_name),
            phone = VALUES(phone), organization = VALUES(organization), designation = VALUES(designation),
            city = VALUES(city), country = VALUES(country), registration_category = VALUES(registration_category),
            pass_name = VALUES(pass_name), event_id = VALUES(event_id), event_title = VALUES(event_title),
            payment_status = VALUES(payment_status), status = 'Confirmed', referral_source = 'Offline Excel Import';`,
          [
            regId, fullName, firstName, lastName, email, phone, organization, designation,
            city, country, passCategory, passCategory, eventId, eventTitle,
            paymentStatus, paymentAmount, paymentId
          ]
        );
      }

      insertedDelegates.push({
        registrationId: regId,
        firstName,
        lastName,
        fullName,
        email,
        phone,
        organization,
        designation,
        city,
        country,
        registrationCategory: passCategory,
        registeringCity: city,
        referralSource: "Offline Excel Import",
        eventId,
        eventTitle,
        paymentStatus,
        paymentId,
        paymentAmount,
        createdAt: new Date().toISOString(),
      });
    }

    if (insertedDelegates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid delegate records could be imported." });
    }

    let sentCount = 0;
    if (sendEmails) {
      const emailPromises = insertedDelegates.map((reg) =>
        sendRegistrationConfirmationEmail(reg).catch((err) => {
          console.error(`[Nodemailer] Offline import email failed for ${reg.email}:`, err.message);
          return { success: false };
        })
      );
      const emailResults = await Promise.allSettled(emailPromises);
      sentCount = emailResults.filter((r) => r.status === "fulfilled").length;
    }

    if (io) {
      io.emit("admin_activity", {
        type: "offline_delegates_imported",
        count: insertedDelegates.length,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      count: insertedDelegates.length,
      sentEmailsCount: sentCount,
      message: `🎉 Successfully imported ${insertedDelegates.length} offline delegates!${sendEmails ? ` Sent ${sentCount} QR ticket emails.` : ""}`,
    });
  } catch (err: any) {
    console.error("[API] Error in bulk offline import:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to import offline delegates." });
  }
});

// ==========================================
// SECURE ADMIN GATE CHECK-IN & ATTENDANCE APIS
// ==========================================

// 1. Admin Scan QR Code or Pass ID for Event Check-In
app.post("/api/admin/checkin/scan", authenticateAdmin, async (req, res) => {
  const { identifier, eventId } = req.body;
  if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
    return res.status(400).json({ success: false, message: "Please provide a valid QR code or Pass ID." });
  }

  try {
    let cleanId = identifier.trim();
    // Support scanning raw URL or ID: e.g. https://www.executivetalksmedia.in/verify-pass/ETM-REG-12345
    const urlMatch = cleanId.match(/verify-pass\/([^/?#]+)/i) || cleanId.match(/verify\/([^/?#]+)/i);
    if (urlMatch) {
      cleanId = decodeURIComponent(urlMatch[1]).trim();
    }
    // Clean token prefixes e.g. ETM-GATE:ETM-REG-12345 or ETM-PASS#...
    cleanId = cleanId.replace(/^ETM-GATE[-:]/i, "").replace(/^ETM-PASS[-:#]/i, "").trim();

    if (!pool) {
      return res.status(500).json({ success: false, message: "Database connection unavailable." });
    }

    // A. Check in registrations table
    let [rows]: any = await pool.query(
      "SELECT * FROM registrations WHERE id = ? OR razorpay_order_id = ? OR payment_id = ? LIMIT 1",
      [cleanId, cleanId, cleanId]
    );

    let isDelegateTable = false;

    // B. Fallback: Check in corporate delegate_registrations table
    if (!rows || rows.length === 0) {
      const [delRows]: any = await pool.query(
        "SELECT * FROM delegate_registrations WHERE id = ? LIMIT 1",
        [cleanId]
      );
      if (delRows && delRows.length > 0) {
        rows = delRows;
        isDelegateTable = true;
      }
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `❌ Pass ID "${cleanId}" not recognized or not found in registration database.`,
        scannedId: cleanId,
      });
    }

    const reg = rows[0];
    const delegateName = reg.name || reg.full_name || "Delegate";
    const checkinStatus = reg.checkin_status || "Absent";

    // Prevent duplicate check-in
    if (checkinStatus.toLowerCase() === "present" || reg.checked_in_at) {
      return res.json({
        success: false,
        alreadyCheckedIn: true,
        message: `⚠️ Attendee "${delegateName}" is ALREADY checked-in!`,
        delegate: reg,
        checkedInAt: reg.checked_in_at,
        checkedInBy: reg.checked_in_by || "Reception Desk",
      });
    }

    const adminUser = (req as any).admin;
    const checkedInBy = adminUser?.name || adminUser?.email || "Event Gate Staff";
    const now = new Date();

    if (isDelegateTable) {
      await pool.query(
        "UPDATE delegate_registrations SET checkin_status = 'Present', checked_in_at = NOW(), checked_in_by = ? WHERE id = ?",
        [checkedInBy, reg.id]
      );
    } else {
      await pool.query(
        "UPDATE registrations SET checkin_status = 'Present', checked_in_at = NOW(), checked_in_by = ? WHERE id = ?",
        [checkedInBy, reg.id]
      );
    }

    reg.checkin_status = "Present";
    reg.checked_in_at = now.toISOString();
    reg.checked_in_by = checkedInBy;

    // Broadcast live check-in event to all connected admin dashboards & scanners
    if (io) {
      io.emit("admin_activity", {
        type: "delegate_checked_in",
        regId: reg.id,
        name: delegateName,
        eventTitle: reg.event_title || reg.event_id || "Executive Talks Summit",
        category: reg.pass_name || reg.registration_category || "Delegate",
        checkedInBy,
        timestamp: now.toISOString(),
      });
    }

    return res.json({
      success: true,
      message: `✅ Admission Approved: Welcome ${delegateName}!`,
      delegate: reg,
      checkedInAt: reg.checked_in_at,
      checkedInBy,
    });
  } catch (err: any) {
    console.error("[API] Check-in Scan Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to process gate check-in." });
  }
});

// 2. Undo Attendee Check-In (Revert to Absent)
app.post("/api/admin/checkin/undo", authenticateAdmin, async (req, res) => {
  const { regId } = req.body;
  if (!regId) {
    return res.status(400).json({ success: false, message: "Registration ID is required to undo check-in." });
  }

  try {
    if (pool) {
      await pool.query(
        "UPDATE registrations SET checkin_status = 'Absent', checked_in_at = NULL, checked_in_by = NULL WHERE id = ?",
        [regId]
      );
      await pool.query(
        "UPDATE delegate_registrations SET checkin_status = 'Absent', checked_in_at = NULL, checked_in_by = NULL WHERE id = ?",
        [regId]
      );
    }

    if (io) {
      io.emit("admin_activity", {
        type: "delegate_checkin_undone",
        regId,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json({ success: true, message: `Check-in reverted for ${regId}.` });
  } catch (err: any) {
    console.error("[API] Check-in Undo Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to undo check-in." });
  }
});

// 3. Real-Time Gate Attendance Analytics & Statistics
app.get("/api/admin/checkin/stats", authenticateAdmin, async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!pool) {
      return res.json({ success: true, total: 0, checkedIn: 0, absent: 0, recentCheckins: [] });
    }

    let filterSql = "";
    let params: any[] = [];
    if (eventId && eventId !== "all") {
      filterSql = "WHERE event_id = ?";
      params = [eventId];
    }

    const [totalRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM registrations ${filterSql}`,
      params
    );
    const total = totalRows[0]?.count || 0;

    const [checkedInRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM registrations ${filterSql ? filterSql + " AND" : "WHERE"} LOWER(checkin_status) = 'present'`,
      params
    );
    const checkedIn = checkedInRows[0]?.count || 0;
    const absent = Math.max(0, total - checkedIn);

    const [recentRows]: any = await pool.query(
      `SELECT id, name, email, phone, organization, designation, event_title, pass_name, registration_category, checkin_status, checked_in_at, checked_in_by FROM registrations WHERE LOWER(checkin_status) = 'present' ORDER BY checked_in_at DESC LIMIT 20`
    );

    return res.json({
      success: true,
      total,
      checkedIn,
      absent,
      attendanceRate: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
      recentCheckins: recentRows || [],
    });
  } catch (err: any) {
    console.error("[API] Attendance Stats Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch attendance stats." });
  }
});

// 4. Manual Attendee Search for Gate Desk (Fallback when delegate phone battery is dead)
app.get("/api/admin/checkin/search", authenticateAdmin, async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      return res.json({ success: true, delegates: [] });
    }

    if (!pool) {
      return res.json({ success: true, delegates: [] });
    }

    const likeQuery = `%${query}%`;
    const [rows]: any = await pool.query(
      `SELECT id, name, email, phone, organization, designation, event_title, pass_name, registration_category, checkin_status, checked_in_at, checked_in_by, payment_status FROM registrations WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR id LIKE ? OR organization LIKE ? ORDER BY created_at DESC LIMIT 15`,
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery]
    );

    return res.json({ success: true, delegates: rows || [] });
  } catch (err: any) {
    console.error("[API] Gate Search Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to search delegates." });
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
    paymentStatus,
    paymentId,
    razorpayOrderId,
    paymentAmount,
    couponApplied,
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
  const effectivePaymentStatus = paymentStatus || (paymentId ? "Paid" : (paymentAmount > 0 ? "Pending" : "Free"));
  const effectiveAmount = Number(paymentAmount) || 0;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid official email address.",
    });
  }

  if (effectivePhone && effectivePhone !== "N/A" && !isValidPhone(effectivePhone)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid 10-digit mobile number.",
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

  const reqRegId = req.body.id;
  const regId = reqRegId || `REG-${Date.now()}`;
  let finalRegId = regId;

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
    payment_status: effectivePaymentStatus,
    payment_id: paymentId || null,
    razorpay_order_id: razorpayOrderId || null,
    payment_amount: effectiveAmount,
    coupon_applied: couponApplied || null,
    created_at: new Date().toISOString(),
  };

  try {
    if (pool) {
      const regStatus = (effectivePaymentStatus === "Paid" || paymentId) ? "Confirmed" : "Pending";
      const pStatus = paymentId ? "Paid" : effectivePaymentStatus;
      const paymentSignature = req.body.paymentSignature || null;
      const paymentMethod = req.body.paymentMethod || "Razorpay";

      const [existing]: any = await pool.query(
        "SELECT id FROM registrations WHERE id = ? OR (email = ? AND event_id = ? AND payment_status = 'Pending')",
        [regId, email.trim(), effectiveEventId]
      );

      if (existing && existing.length > 0) {
        finalRegId = existing[0].id;
        newRegistration.id = finalRegId;
        await pool.query(
          `UPDATE registrations SET
            name = ?, first_name = ?, last_name = ?, phone = ?, organization = ?, designation = ?,
            city = ?, country = ?, registration_category = ?, registering_city = ?, referral_source = ?,
            payment_status = ?, payment_id = ?, razorpay_order_id = ?, payment_amount = ?, coupon_applied = ?,
            payment_method = ?, payment_signature = ?, status = ?
          WHERE id = ?`,
          [
            fullName,
            effectiveFirstName,
            effectiveLastName,
            effectivePhone,
            effectiveOrganization,
            effectiveDesignation,
            city || "N/A",
            country || "India",
            effectiveCategory,
            registeringCity || city || "N/A",
            referralSource || "Direct",
            pStatus,
            paymentId || null,
            razorpayOrderId || null,
            effectiveAmount,
            couponApplied || null,
            paymentMethod,
            paymentSignature,
            regStatus,
            finalRegId,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO registrations (
            id, name, first_name, last_name, email, phone, organization, designation, city, country, registration_category, registering_city, referral_source, event_id, event_title, payment_status, payment_id, razorpay_order_id, payment_amount, coupon_applied, payment_method, payment_signature, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalRegId,
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
            pStatus,
            paymentId || null,
            razorpayOrderId || null,
            effectiveAmount,
            couponApplied || null,
            paymentMethod,
            paymentSignature,
            regStatus,
          ]
        );
      }
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

    // AUTOMATED EMAIL CONFIRMATION (Sent only if payment is complete / free pass)
    let emailSent = false;
    if (effectivePaymentStatus !== "Pending") {
      emailSent = await sendRegistrationConfirmationEmail({
        registrationId: finalRegId,
        firstName: effectiveFirstName,
        lastName: effectiveLastName,
        fullName,
        email,
        phone: effectivePhone,
        organization: effectiveOrganization,
        designation: effectiveDesignation,
        city: city || "N/A",
        country: country || "India",
        registrationCategory: effectiveCategory,
        registeringCity: registeringCity || city || "N/A",
        referralSource: referralSource || "Direct",
        eventId: effectiveEventId,
        eventTitle: effectiveEventTitle,
        paymentStatus: effectivePaymentStatus,
        paymentId: paymentId || undefined,
        razorpayOrderId: razorpayOrderId || undefined,
        paymentAmount: effectiveAmount,
        couponApplied: couponApplied || undefined,
        createdAt: newRegistration.created_at,
      });
    }

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

      // Email Confirmation with QR Code & Full Delegate Details
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || fullName;
      const lastName = nameParts.slice(1).join(" ") || "";

      const emailSent = await sendRegistrationConfirmationEmail({
        registrationId: delId,
        firstName,
        lastName,
        fullName,
        email: officialEmail,
        phone: mobileNumber || "N/A",
        organization: companyName || organization || "N/A",
        designation: designation || "Executive Delegate",
        city: city || "N/A",
        country: "India",
        registrationCategory: "Corporate Executive Delegate Pass",
        registeringCity: location || city || "N/A",
        referralSource: awardsNomination === "Yes" ? "Awards Nomination (Yes)" : "Direct Registration",
        eventId: "delegate-executive-pass",
        eventTitle: `Corporate Delegate Platform (${companyName})`,
        paymentStatus: "Free",
        paymentAmount: 0,
        createdAt: timestamp,
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
  const { name, email, phone, enquiryType, message, organization, designation } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address (e.g. name@company.com).",
    });
  }

  if (!isValidName(name)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid Full Name.",
    });
  }

  if (phone && phone !== "N/A" && !isValidPhone(phone)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid 10-digit phone number.",
    });
  }

  let finalMessage = message;
  if (organization || designation) {
    const metaParts = [
      organization ? `Organization: ${organization}` : "",
      designation ? `Designation: ${designation}` : "",
    ].filter(Boolean).join(" | ");
    if (metaParts && !finalMessage.includes(organization || "")) {
      finalMessage = `[${metaParts}]\n\n${finalMessage}`;
    }
  }

  const enqId = `ENQ-${Date.now()}`;
  const newEnquiry = {
    id: enqId,
    name,
    email,
    phone: phone || "N/A",
    enquiryType: enquiryType || "General Enquiry",
    message: finalMessage,
    submittedAt: new Date().toISOString(),
  };

  try {
    if (pool) {
      await pool.query(
        "INSERT INTO contacts (id, name, email, phone, enquiry_type, message) VALUES (?, ?, ?, ?, ?, ?)",
        [enqId, name, email, newEnquiry.phone, newEnquiry.enquiryType, finalMessage]
      );
    }

    // REALTIME BROADCAST
    io.emit("new_contact_enquiry", {
      enquiry: newEnquiry,
      notification: `📩 New enquiry received from ${name} (${newEnquiry.enquiryType})`,
    });

    // Send admin email notification to registration@etmedia.in
    sendContactAdminNotificationEmail(newEnquiry).catch(err => console.error("Contact admin email notification error:", err));

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

// ==========================================
// POPUP ADV MANAGEMENT APIs
// ==========================================

// GET /api/popup/active - Public active popup settings & events for website visitors
app.get("/api/popup/active", async (_req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, active: false, settings: null, events: [] });
    }

    const [settingsRows]: any = await pool.query("SELECT * FROM popup_settings WHERE id = 1");
    const settings = settingsRows[0] || null;

    if (!settings || settings.status === "inactive") {
      return res.json({ success: true, active: false, settings, events: [] });
    }

    // Get active selected events
    const [eventRows]: any = await pool.query(`
      SELECT pe.id as popup_event_id, pe.priority, pe.active, e.*
      FROM popup_events pe
      JOIN events e ON pe.event_id = e.id OR pe.event_id = e.slug
      WHERE pe.active = 1
      ORDER BY pe.priority ASC, pe.id ASC
    `);

    return res.json({
      success: true,
      active: true,
      settings,
      events: eventRows,
    });
  } catch (err) {
    console.error("Popup Active Fetch Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching active popup" });
  }
});

// GET /api/popup/settings - Admin/Public settings
app.get("/api/popup/settings", async (_req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, settings: {} });
    }
    const [rows]: any = await pool.query("SELECT * FROM popup_settings WHERE id = 1");
    return res.json({ success: true, settings: rows[0] || {} });
  } catch (err) {
    console.error("Popup Settings Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching popup settings" });
  }
});

// PUT /api/popup/settings - Admin update settings
app.put("/api/popup/settings", authenticateAdmin, async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ success: false, message: "Database not connected" });
    }

    const body = req.body || {};
    const fields = [
      "popup_title", "popup_subtitle", "theme_color", "button_color", "background_color", "border_color",
      "popup_logo", "popup_banner", "show_close_button", "enable_maybe_later", "popup_width", "popup_height",
      "popup_animation", "popup_position", "border_radius", "shadow_style", "blur_background", "overlay_opacity",
      "show_on_load", "show_after_delay", "delay_seconds", "show_on_scroll", "scroll_percentage", "trigger_rule",
      "show_every_visit", "once_per_session", "once_per_day", "cookie_duration_days", "priority_level",
      "start_date", "end_date", "daily_start_time", "daily_end_time", "timezone", "status"
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const f of fields) {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(body[f]);
      }
    }

    if (updates.length > 0) {
      values.push(1); // WHERE id = 1
      await pool.query(`UPDATE popup_settings SET ${updates.join(", ")} WHERE id = ?`, values);
    }

    const [updatedRows]: any = await pool.query("SELECT * FROM popup_settings WHERE id = 1");
    io.emit("popup_settings_updated", updatedRows[0]);

    return res.json({
      success: true,
      message: "Popup settings updated successfully!",
      settings: updatedRows[0],
    });
  } catch (err) {
    console.error("Update Popup Settings Error:", err);
    return res.status(500).json({ success: false, message: "Error updating popup settings" });
  }
});

// GET /api/popup/events - Admin selected popup events
app.get("/api/popup/events", async (_req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, events: [] });
    }
    const [rows]: any = await pool.query(`
      SELECT pe.id as popup_event_id, pe.priority, pe.active, e.*
      FROM popup_events pe
      JOIN events e ON pe.event_id = e.id OR pe.event_id = e.slug
      ORDER BY pe.priority ASC, pe.id ASC
    `);
    return res.json({ success: true, events: rows });
  } catch (err) {
    console.error("Popup Events Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching popup events" });
  }
});

// POST /api/popup/events - Save selected events for popup
app.post("/api/popup/events", authenticateAdmin, async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ success: false, message: "Database not connected" });
    }
    const { eventIds } = req.body;
    if (!Array.isArray(eventIds)) {
      return res.status(400).json({ success: false, message: "eventIds must be an array" });
    }

    // Clear existing and re-insert selected events
    await pool.query("DELETE FROM popup_events");
    for (let i = 0; i < eventIds.length; i++) {
      await pool.query(
        "INSERT INTO popup_events (event_id, priority, active) VALUES (?, ?, 1)",
        [eventIds[i], i + 1]
      );
    }

    io.emit("popup_events_updated", { count: eventIds.length });

    return res.json({
      success: true,
      message: "Popup events saved successfully!",
    });
  } catch (err) {
    console.error("Save Popup Events Error:", err);
    return res.status(500).json({ success: false, message: "Error saving popup events" });
  }
});

// DELETE /api/popup/events/:id - Remove event from popup
app.delete("/api/popup/events/:id", authenticateAdmin, async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ success: false, message: "Database not connected" });
    }
    const { id } = req.params;
    await pool.query("DELETE FROM popup_events WHERE id = ? OR event_id = ?", [id, id]);
    io.emit("popup_events_updated", { deleted: id });
    return res.json({ success: true, message: "Event removed from popup!" });
  } catch (err) {
    console.error("Delete Popup Event Error:", err);
    return res.status(500).json({ success: false, message: "Error removing event from popup" });
  }
});

// Analytics APIs: Track View, Click, Close
app.post("/api/popup/view", async (req, res) => {
  try {
    if (pool) {
      const { eventId, sessionId } = req.body;
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();
      await pool.query(
        "INSERT INTO popup_analytics (event_id, action_type, session_id, ip_address) VALUES (?, 'view', ?, ?)",
        [eventId || "all", sessionId || "", ip]
      );
    }
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: true });
  }
});

app.post("/api/popup/click", async (req, res) => {
  try {
    if (pool) {
      const { eventId, sessionId } = req.body;
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();
      await pool.query(
        "INSERT INTO popup_analytics (event_id, action_type, session_id, ip_address) VALUES (?, 'click', ?, ?)",
        [eventId || "all", sessionId || "", ip]
      );
    }
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: true });
  }
});

app.post("/api/popup/close", async (req, res) => {
  try {
    if (pool) {
      const { eventId, sessionId } = req.body;
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();
      await pool.query(
        "INSERT INTO popup_analytics (event_id, action_type, session_id, ip_address) VALUES (?, 'close', ?, ?)",
        [eventId || "all", sessionId || "", ip]
      );
    }
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: true });
  }
});

// GET /api/popup/analytics - Aggregated Analytics for Admin Dashboard
app.get("/api/popup/analytics", authenticateAdmin, async (_req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, analytics: { totalViews: 0, totalClicks: 0, totalCloses: 0, ctr: 0, eventBreakdown: [] } });
    }

    const [viewsRow]: any = await pool.query("SELECT COUNT(*) as count FROM popup_analytics WHERE action_type = 'view'");
    const [clicksRow]: any = await pool.query("SELECT COUNT(*) as count FROM popup_analytics WHERE action_type = 'click'");
    const [closesRow]: any = await pool.query("SELECT COUNT(*) as count FROM popup_analytics WHERE action_type = 'close'");

    const totalViews = viewsRow[0]?.count || 0;
    const totalClicks = clicksRow[0]?.count || 0;
    const totalCloses = closesRow[0]?.count || 0;
    const ctr = totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(2)) : 0;

    const [eventBreakdown]: any = await pool.query(`
      SELECT 
        e.id, e.title, e.category,
        SUM(CASE WHEN pa.action_type = 'view' THEN 1 ELSE 0 END) as views,
        SUM(CASE WHEN pa.action_type = 'click' THEN 1 ELSE 0 END) as clicks,
        SUM(CASE WHEN pa.action_type = 'close' THEN 1 ELSE 0 END) as closes
      FROM events e
      LEFT JOIN popup_analytics pa ON pa.event_id = e.id OR pa.event_id = e.slug
      GROUP BY e.id, e.title, e.category
      HAVING views > 0 OR clicks > 0
      ORDER BY clicks DESC, views DESC
    `);

    return res.json({
      success: true,
      analytics: {
        totalViews,
        totalClicks,
        totalCloses,
        ctr,
        eventBreakdown,
      },
    });
  } catch (err) {
    console.error("Popup Analytics Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching popup analytics" });
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
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    if (pool) {
      // 1. Ensure status column exists
      try {
        await pool.query("ALTER TABLE registrations ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");
      } catch (e) {
        // column may already exist, ignore
      }

      // 2. Update both status and payment_status safely
      const paymentStatusVal = status === "Confirmed" ? "Approved (Free Pass)" : "Pending";
      await pool.query(
        "UPDATE registrations SET status = ?, payment_status = CASE WHEN ? = 'Confirmed' AND (payment_status IS NULL OR payment_status = 'Pending') THEN 'Approved (Free Pass)' ELSE payment_status END WHERE id = ?",
        [status, status, id]
      );
    }
    res.json({ success: true, message: `Registration status updated to ${status} successfully.` });
  } catch (err: any) {
    console.error("Update Registration Status Error:", err);
    // Fallback: update payment_status if status column fails
    if (pool) {
      try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query("UPDATE registrations SET payment_status = ? WHERE id = ?", [status === "Confirmed" ? "Approved (Free Pass)" : "Pending", id]);
        return res.json({ success: true, message: `Registration status updated successfully.` });
      } catch (fallbackErr) {
        console.error("Fallback Update Status Error:", fallbackErr);
      }
    }
    res.status(500).json({ success: false, message: "Failed to update registration status." });
  }
});

// Admin Update CMS Delegate Registration Status
app.patch("/api/admin/delegate-registrations/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    if (pool) {
      try {
        await pool.query("ALTER TABLE delegate_registrations ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");
      } catch (e) {
        // column may already exist, ignore
      }
      await pool.query("UPDATE delegate_registrations SET status = ? WHERE id = ?", [status, id]);
    }
    res.json({ success: true, message: "Delegate registration status updated successfully." });
  } catch (err) {
    console.error("Update Delegate Registration Status Error:", err);
    res.status(500).json({ success: false, message: "Failed to update delegate registration status." });
  }
});

// Admin Grant Free Event Access & Send Confirmation Email
app.post("/api/admin/grant-access", authenticateAdmin, async (req, res) => {
  const {
    name,
    email,
    phone,
    organization,
    designation,
    city,
    country,
    registrationCategory,
    eventId,
    eventTitle,
    notes,
  } = req.body;

  if (!email || !name) {
    return res.status(400).json({ success: false, message: "Name and Email are required to grant access." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid official email address." });
  }

  if (!isValidName(name)) {
    return res.status(400).json({ success: false, message: "Please enter a valid Full Name." });
  }

  if (phone && phone !== "N/A" && !isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: "Please enter a valid 10-digit mobile number." });
  }

  const effectiveFirstName = name.trim().split(" ")[0];
  const effectiveLastName = name.trim().split(" ").slice(1).join(" ");
  const effectivePhone = phone || "N/A";
  const effectiveOrg = organization || "VIP Guest / Partner";
  const effectiveDesig = designation || "Executive Pass Holder";
  const effectiveCategory = registrationCategory || "VIP Free Pass";
  const effectiveEventTitle = eventTitle || "India CFO Leadership Summit 2026";
  const effectiveEventId = eventId || "cfo-leadership-summit";

  const regId = `REG-VIP-${Date.now()}`;
  const newRegistration = {
    id: regId,
    name: name.trim(),
    first_name: effectiveFirstName,
    last_name: effectiveLastName,
    email: email.trim(),
    phone: effectivePhone,
    organization: effectiveOrg,
    designation: effectiveDesig,
    city: city || "Mumbai",
    country: country || "India",
    registration_category: effectiveCategory,
    registering_city: city || "Mumbai",
    referral_source: "Admin Granted Access",
    event_id: effectiveEventId,
    event_title: effectiveEventTitle,
    payment_status: "Approved (Free Pass)",
    payment_id: "ADMIN-COMPLIMENTARY-PASS",
    razorpay_order_id: null,
    payment_amount: 0,
    coupon_applied: notes || "Admin Free Pass",
    created_at: new Date().toISOString(),
  };

  try {
    if (pool) {
      await pool.query(
        `INSERT INTO registrations (
          id, name, first_name, last_name, email, phone, organization, designation, city, country, registration_category, registering_city, referral_source, event_id, event_title, payment_status, payment_id, razorpay_order_id, payment_amount, coupon_applied
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          regId,
          name.trim(),
          effectiveFirstName,
          effectiveLastName,
          email.trim(),
          effectivePhone,
          effectiveOrg,
          effectiveDesig,
          city || "Mumbai",
          country || "India",
          effectiveCategory,
          city || "Mumbai",
          "Admin Granted Access",
          effectiveEventId,
          effectiveEventTitle,
          "Approved (Free Pass)",
          "ADMIN-COMPLIMENTARY-PASS",
          null,
          0,
          notes || "Admin Free Pass",
        ]
      );
    }

    // REALTIME BROADCAST
    let totalCount = 1;
    if (pool) {
      const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM registrations");
      totalCount = rows[0]?.count || 1;
    }

    io.emit("new_registration", {
      registration: newRegistration,
      totalRegistrations: totalCount,
      message: `🎟️ Admin granted ${effectiveCategory} to ${name.trim()} for ${effectiveEventTitle}!`,
    });

    // AUTOMATED EMAIL CONFIRMATION WITH SCANNABLE QR CODE
    const emailSent = await sendRegistrationConfirmationEmail({
      registrationId: regId,
      firstName: effectiveFirstName,
      lastName: effectiveLastName,
      fullName: name.trim(),
      email: email.trim(),
      phone: effectivePhone,
      organization: effectiveOrg,
      designation: effectiveDesig,
      city: city || "Mumbai",
      country: country || "India",
      registrationCategory: effectiveCategory,
      registeringCity: city || "Mumbai",
      referralSource: "Admin Granted Access",
      eventId: effectiveEventId,
      eventTitle: effectiveEventTitle,
      paymentStatus: "Approved (Free Pass)",
      paymentId: "ADMIN-COMPLIMENTARY-PASS",
      paymentAmount: 0,
      couponApplied: notes || "Admin Free Pass",
      createdAt: newRegistration.created_at,
    });

    return res.status(201).json({
      success: true,
      message: emailSent
        ? `🎉 Access granted & ticket email sent to ${email}!`
        : `Access granted for ${email} (email delivery pending SMTP config).`,
      emailSent,
      data: newRegistration,
    });
  } catch (err: any) {
    console.error("Grant Access Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to grant access." });
  }
});

// Admin Resend / Send Registration Pass Email
async function handleAdminResendEmail(req: any, res: any) {
  const { id } = req.params;
  try {
    let reg: any = null;
    if (pool) {
      const [rows]: any = await pool.query("SELECT * FROM registrations WHERE id = ?", [id]);
      if (rows && rows.length > 0) {
        reg = rows[0];
      }
    }
    if (!reg) {
      return res.status(404).json({ success: false, message: "Registration not found." });
    }

    // Update status to Approved (Free Pass) if not already paid
    if (pool && (!reg.payment_status || reg.payment_status === "Pending")) {
      await pool.query("UPDATE registrations SET payment_status = 'Approved (Free Pass)' WHERE id = ?", [id]);
      reg.payment_status = "Approved (Free Pass)";
    }

    const emailSent = await sendRegistrationConfirmationEmail({
      registrationId: reg.id,
      firstName: reg.first_name || (reg.name ? reg.name.split(" ")[0] : "Delegate"),
      lastName: reg.last_name || "",
      fullName: reg.name,
      email: reg.email,
      phone: reg.phone,
      organization: reg.organization,
      designation: reg.designation,
      city: reg.city,
      country: reg.country,
      registrationCategory: reg.registration_category,
      registeringCity: reg.registering_city,
      referralSource: reg.referral_source,
      eventId: reg.event_id,
      eventTitle: reg.event_title,
      paymentStatus: reg.payment_status || "Approved (Free Pass)",
      paymentId: reg.payment_id || "ADMIN-CONFIRMED",
      paymentAmount: reg.payment_amount || 0,
      couponApplied: reg.coupon_applied,
      createdAt: reg.created_at,
    });

    return res.json({
      success: true,
      emailSent,
      message: emailSent
        ? `📧 Official delegate pass & invoice sent successfully to ${reg.email} and admin alerts dispatched!`
        : `Email dispatched (delivery queued).`,
    });
  } catch (err: any) {
    console.error("Send Registration Email Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to send email pass." });
  }
}

app.post("/api/admin/registrations/:id/send-email", authenticateAdmin, handleAdminResendEmail);
app.post("/api/admin/registrations/:id/resend-email", authenticateAdmin, handleAdminResendEmail);

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

// 0. Image File Upload Handler
app.post("/api/admin/upload", authenticateAdmin, async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: "No image data provided." });
  }

  try {
    const relativeUrl = saveBase64Image(imageBase64);
    return res.json({ success: true, url: relativeUrl, message: "Image stored successfully!" });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: "Failed to process image data." });
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

// ==========================================
// EVENT PAYMENTS MANAGEMENT API ENDPOINTS
// ==========================================

// 1. Get all event payment configurations for admin
app.get("/api/admin/event-payments", authenticateAdmin, async (_req, res) => {
  try {
    if (!pool) return res.json({ success: true, payments: [] });
    await ensureEventPaymentsTable();
    const [rows]: any = await pool.query(`
      SELECT p.*, e.title as event_title, e.category as event_category, e.city as event_city, e.date as event_date, e.image as event_image, e.slug as event_slug
      FROM event_payment_settings p
      LEFT JOIN events e ON (p.event_id = e.id OR p.event_id = e.slug)
      GROUP BY p.id, p.event_id
      ORDER BY p.updated_at DESC
    `);
    
    // Deduplicate by event identification to ensure no event is returned twice
    const uniqueMap = new Map();
    (rows || []).forEach((row: any) => {
      const key = (row.event_slug && row.event_slug.trim())
        ? row.event_slug.trim().toLowerCase()
        : (row.event_title && row.event_title.trim())
        ? row.event_title.trim().toLowerCase()
        : (row.event_id && row.event_id.trim())
        ? row.event_id.trim().toLowerCase()
        : row.id;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, row);
      }
    });

    res.json({ success: true, payments: Array.from(uniqueMap.values()) });
  } catch (err) {
    console.error("Admin Fetch Event Payments Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch event payment settings." });
  }
});

// 2. Create / Upsert Event Payment Config
app.post("/api/admin/event-payments", authenticateAdmin, async (req, res) => {
  const {
    event_id,
    event_title,
    event_slug,
    registration_fee,
    currency,
    gst_percentage,
    gst_included,
    platform_fee,
    convenience_fee,
    registration_type_prices,
    pricing_plans,
    early_bird_enabled,
    early_bird_price,
    early_bird_start_date,
    early_bird_end_date,
    special_prices,
    total_seats,
    available_seats,
    reserved_seats,
    vip_seats,
    speaker_seats,
    sponsor_seats,
    coupons_enabled,
    coupons,
    payment_required,
    online_payment_enabled,
    offline_payment_enabled,
    free_registration_allowed,
    auto_close_seats_full,
    registration_open_date,
    registration_close_date,
    event_start_date,
    event_end_date,
    payment_status,
  } = req.body;

  if (!event_id) {
    return res.status(400).json({ success: false, message: "Event Selection is required." });
  }

  const id = req.body.id || `PAY-${event_id}`;
  const regTypePricesStr = typeof registration_type_prices === "string" ? registration_type_prices : JSON.stringify(registration_type_prices || {});
  const pricingPlansStr = typeof pricing_plans === "string" ? pricing_plans : JSON.stringify(pricing_plans || []);
  const specialPricesStr = typeof special_prices === "string" ? special_prices : JSON.stringify(special_prices || {});
  const couponsStr = typeof coupons === "string" ? coupons : JSON.stringify(coupons || []);

  try {
    if (pool) {
      const savedId = await upsertEventPaymentSettings(req.body);
      return res.json({ success: true, id: savedId, message: "Event payment settings saved successfully!" });
    }
    return res.json({ success: true, id: `PAY-${event_id}`, message: "Event payment settings saved (in-memory)." });
  } catch (err: any) {
    console.error("Save Event Payment Error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Failed to save event payment settings." });
  }
});

// Helper for upserting event payment settings
async function upsertEventPaymentSettings(data: any) {
  const event_id = data.event_id || data.id;
  if (!event_id) throw new Error("Event selection is required");

  const id = data.id || `PAY-${event_id}`;
  const regTypePricesStr = typeof data.registration_type_prices === "string" ? data.registration_type_prices : JSON.stringify(data.registration_type_prices || {});
  const pricingPlansStr = typeof data.pricing_plans === "string" ? data.pricing_plans : JSON.stringify(data.pricing_plans || []);
  const specialPricesStr = typeof data.special_prices === "string" ? data.special_prices : JSON.stringify(data.special_prices || {});
  const couponsStr = typeof data.coupons === "string" ? data.coupons : JSON.stringify(data.coupons || []);

  await ensureEventPaymentsTable();

  // Safely check existing row by event_id or id
  let existingRows: any[] = [];
  try {
    const [rows]: any = await pool.query("SELECT * FROM event_payment_settings WHERE event_id = ? OR id = ?", [event_id, id]);
    existingRows = rows || [];
  } catch (err) {
    try {
      const [rows]: any = await pool.query("SELECT * FROM event_payment_settings WHERE event_id = ?", [event_id]);
      existingRows = rows || [];
    } catch (e) {
      existingRows = [];
    }
  }

  if (existingRows && existingRows.length > 0) {
    const targetKey = existingRows[0].id || existingRows[0].event_id || id;
    const targetEventId = existingRows[0].event_id || event_id;

    try {
      await pool.query(
        `UPDATE event_payment_settings SET
          id = ?, event_id = ?, event_title = ?, event_slug = ?, registration_fee = ?, currency = ?, gst_percentage = ?, gst_included = ?,
          platform_fee = ?, convenience_fee = ?, registration_type_prices = ?, pricing_plans = ?, early_bird_enabled = ?,
          early_bird_price = ?, early_bird_start_date = ?, early_bird_end_date = ?, special_prices = ?, total_seats = ?,
          available_seats = ?, reserved_seats = ?, vip_seats = ?, speaker_seats = ?, sponsor_seats = ?, coupons_enabled = ?,
          coupons = ?, payment_required = ?, online_payment_enabled = ?, offline_payment_enabled = ?,
          free_registration_allowed = ?, auto_close_seats_full = ?, registration_open_date = ?, registration_close_date = ?,
          event_start_date = ?, event_end_date = ?, payment_status = ?
        WHERE event_id = ? OR id = ?`,
        [
          id, event_id, data.event_title || "", data.event_slug || "", data.registration_fee || 0, data.currency || "INR",
          data.gst_percentage || 18, data.gst_included ? 1 : 0, data.platform_fee || 0, data.convenience_fee || 0,
          regTypePricesStr, pricingPlansStr, data.early_bird_enabled ? 1 : 0, data.early_bird_price || 0,
          data.early_bird_start_date || "", data.early_bird_end_date || "", specialPricesStr, data.total_seats || 100,
          data.available_seats || 100, data.reserved_seats || 0, data.vip_seats || 0, data.speaker_seats || 0,
          data.sponsor_seats || 0, data.coupons_enabled ? 1 : 0, couponsStr, data.payment_required ? 1 : 0,
          data.online_payment_enabled ? 1 : 0, data.offline_payment_enabled ? 1 : 0, data.free_registration_allowed ? 1 : 0,
          data.auto_close_seats_full ? 1 : 0, data.registration_open_date || "", data.registration_close_date || "",
          data.event_start_date || "", data.event_end_date || "", data.payment_status || "Enabled",
          targetEventId, targetKey
        ]
      );
    } catch (updErr) {
      await pool.query(
        `UPDATE event_payment_settings SET
          event_id = ?, event_title = ?, event_slug = ?, registration_fee = ?, currency = ?, gst_percentage = ?, gst_included = ?,
          platform_fee = ?, convenience_fee = ?, registration_type_prices = ?, pricing_plans = ?, early_bird_enabled = ?,
          early_bird_price = ?, early_bird_start_date = ?, early_bird_end_date = ?, special_prices = ?, total_seats = ?,
          available_seats = ?, reserved_seats = ?, vip_seats = ?, speaker_seats = ?, sponsor_seats = ?, coupons_enabled = ?,
          coupons = ?, payment_required = ?, online_payment_enabled = ?, offline_payment_enabled = ?,
          free_registration_allowed = ?, auto_close_seats_full = ?, registration_open_date = ?, registration_close_date = ?,
          event_start_date = ?, event_end_date = ?, payment_status = ?
        WHERE event_id = ?`,
        [
          event_id, data.event_title || "", data.event_slug || "", data.registration_fee || 0, data.currency || "INR",
          data.gst_percentage || 18, data.gst_included ? 1 : 0, data.platform_fee || 0, data.convenience_fee || 0,
          regTypePricesStr, pricingPlansStr, data.early_bird_enabled ? 1 : 0, data.early_bird_price || 0,
          data.early_bird_start_date || "", data.early_bird_end_date || "", specialPricesStr, data.total_seats || 100,
          data.available_seats || 100, data.reserved_seats || 0, data.vip_seats || 0, data.speaker_seats || 0,
          data.sponsor_seats || 0, data.coupons_enabled ? 1 : 0, couponsStr, data.payment_required ? 1 : 0,
          data.online_payment_enabled ? 1 : 0, data.offline_payment_enabled ? 1 : 0, data.free_registration_allowed ? 1 : 0,
          data.auto_close_seats_full ? 1 : 0, data.registration_open_date || "", data.registration_close_date || "",
          data.event_start_date || "", data.event_end_date || "", data.payment_status || "Enabled",
          targetEventId
        ]
      );
    }
    return id;
  } else {
    try {
      await pool.query(
        `INSERT INTO event_payment_settings (
          id, event_id, event_title, event_slug, registration_fee, currency, gst_percentage, gst_included,
          platform_fee, convenience_fee, registration_type_prices, pricing_plans, early_bird_enabled, early_bird_price,
          early_bird_start_date, early_bird_end_date, special_prices, total_seats, available_seats,
          reserved_seats, vip_seats, speaker_seats, sponsor_seats, coupons_enabled, coupons, payment_required,
          online_payment_enabled, offline_payment_enabled, free_registration_allowed, auto_close_seats_full,
          registration_open_date, registration_close_date, event_start_date, event_end_date, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, event_id, data.event_title || "", data.event_slug || "", data.registration_fee || 0, data.currency || "INR",
          data.gst_percentage || 18, data.gst_included ? 1 : 0, data.platform_fee || 0, data.convenience_fee || 0,
          regTypePricesStr, pricingPlansStr, data.early_bird_enabled ? 1 : 0, data.early_bird_price || 0,
          data.early_bird_start_date || "", data.early_bird_end_date || "", specialPricesStr, data.total_seats || 100,
          data.available_seats || 100, data.reserved_seats || 0, data.vip_seats || 0, data.speaker_seats || 0,
          data.sponsor_seats || 0, data.coupons_enabled ? 1 : 0, couponsStr, data.payment_required ? 1 : 0,
          data.online_payment_enabled ? 1 : 0, data.offline_payment_enabled ? 1 : 0, data.free_registration_allowed ? 1 : 0,
          data.auto_close_seats_full ? 1 : 0, data.registration_open_date || "", data.registration_close_date || "",
          data.event_start_date || "", data.event_end_date || "", data.payment_status || "Enabled"
        ]
      );
    } catch (insErr) {
      await pool.query(
        `INSERT INTO event_payment_settings (
          event_id, event_title, event_slug, registration_fee, currency, gst_percentage, gst_included,
          platform_fee, convenience_fee, registration_type_prices, pricing_plans, early_bird_enabled, early_bird_price,
          early_bird_start_date, early_bird_end_date, special_prices, total_seats, available_seats,
          reserved_seats, vip_seats, speaker_seats, sponsor_seats, coupons_enabled, coupons, payment_required,
          online_payment_enabled, offline_payment_enabled, free_registration_allowed, auto_close_seats_full,
          registration_open_date, registration_close_date, event_start_date, event_end_date, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event_id, data.event_title || "", data.event_slug || "", data.registration_fee || 0, data.currency || "INR",
          data.gst_percentage || 18, data.gst_included ? 1 : 0, data.platform_fee || 0, data.convenience_fee || 0,
          regTypePricesStr, pricingPlansStr, data.early_bird_enabled ? 1 : 0, data.early_bird_price || 0,
          data.early_bird_start_date || "", data.early_bird_end_date || "", specialPricesStr, data.total_seats || 100,
          data.available_seats || 100, data.reserved_seats || 0, data.vip_seats || 0, data.speaker_seats || 0,
          data.sponsor_seats || 0, data.coupons_enabled ? 1 : 0, couponsStr, data.payment_required ? 1 : 0,
          data.online_payment_enabled ? 1 : 0, data.offline_payment_enabled ? 1 : 0, data.free_registration_allowed ? 1 : 0,
          data.auto_close_seats_full ? 1 : 0, data.registration_open_date || "", data.registration_close_date || "",
          data.event_start_date || "", data.event_end_date || "", data.payment_status || "Enabled"
        ]
      );
    }
    return id;
  }
}

// 3. Update Event Payment Config
app.put("/api/admin/event-payments/:id", authenticateAdmin, async (req, res) => {
  try {
    if (pool) {
      const savedId = await upsertEventPaymentSettings({ ...req.body, id: req.params.id });
      return res.json({ success: true, id: savedId, message: "Event payment settings updated successfully!" });
    }
    return res.json({ success: true, message: "Event payment settings updated (in-memory)." });
  } catch (err: any) {
    console.error("Update Event Payment Error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Failed to update event payment settings." });
  }
});

// 4. Delete Event Payment Config
app.delete("/api/admin/event-payments/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("DELETE FROM event_payment_settings WHERE id = ? OR event_id = ?", [id, id]);
      res.json({ success: true, message: "Payment configuration deleted successfully!" });
    }
  } catch (err) {
    console.error("Delete Event Payment Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete payment configuration." });
  }
});

// 5. Bulk Payment Operations
app.post("/api/admin/event-payments/bulk", authenticateAdmin, async (req, res) => {
  const { action, ids, gst_percentage } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "No event payment IDs selected." });
  }
  try {
    if (pool) {
      if (action === "enable") {
        await pool.query("UPDATE event_payment_settings SET payment_status = 'Enabled' WHERE id IN (?) OR event_id IN (?)", [ids, ids]);
      } else if (action === "disable") {
        await pool.query("UPDATE event_payment_settings SET payment_status = 'Disabled' WHERE id IN (?) OR event_id IN (?)", [ids, ids]);
      } else if (action === "update_gst" && gst_percentage !== undefined) {
        await pool.query("UPDATE event_payment_settings SET gst_percentage = ? WHERE id IN (?) OR event_id IN (?)", [gst_percentage, ids, ids]);
      } else if (action === "delete") {
        await pool.query("DELETE FROM event_payment_settings WHERE id IN (?) OR event_id IN (?)", [ids, ids]);
      }
      res.json({ success: true, message: `Bulk action '${action}' completed successfully!` });
    }
  } catch (err) {
    console.error("Bulk Payment Action Error:", err);
    res.status(500).json({ success: false, message: "Failed to execute bulk payment action." });
  }
});

// 6. Public Endpoint: Get Payment Config by Event ID or Slug (Cached & Hash-Resilient)
app.get("/api/event-payments/event/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const cacheKey = `event_payment_${eventId}`;
  const cached = getFastCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    if (pool) {
      const cleanEventId = eventId.replace(/-\d+$/, "");
      const [rows]: any = await pool.query(
        "SELECT * FROM event_payment_settings WHERE event_id = ? OR event_slug = ? OR event_id = ? OR event_slug = ? OR event_slug LIKE ? LIMIT 1",
        [eventId, eventId, cleanEventId, cleanEventId, `${cleanEventId}%`]
      );
      if (rows.length > 0) {
        const payment = rows[0];
        const status = String(payment.payment_status || "Enabled").toLowerCase();
        const isPublished = status === "enabled" || status === "published";
        const result = isPublished
          ? { success: true, pricingAvailable: true, payment }
          : { success: true, pricingAvailable: false, payment: null, message: "Pricing for this event is in Draft mode." };
        setFastCache(cacheKey, result, 60);
        return res.json(result);
      }
    }
    const notFoundResult = {
      success: true,
      pricingAvailable: false,
      payment: null,
      message: "Pricing not configured for this event in Admin Dashboard.",
    };
    setFastCache(cacheKey, notFoundResult, 60);
    return res.json(notFoundResult);
  } catch (err) {
    return res.json({ success: true, pricingAvailable: false, payment: null });
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
    about_content,
    image,
    about_image,
    speakers,
    status,
    is_featured,
    speakers_list,
    sponsors_list,
    gallery_list,
    agenda_list,
    map_url,
    venue_address,
    delegates_count,
    speakers_count,
    sponsors_count,
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

  const effectiveDelegatesCount = delegates_count || "500+";
  const effectiveSpeakersCount = speakers_count || `${speakers || 30}+`;
  const effectiveSponsorsCount = sponsors_count || "25+";

  try {
    if (pool) {
      await ensureEventsTable();
      await pool.query(
        `INSERT INTO events (
          id, slug, title, category, date, time, city, venue, locations, description, full_description, about_content, image, about_image, speakers, status, is_featured, speakers_list, sponsors_list, gallery_list, agenda_list, map_url, venue_address, delegates_count, speakers_count, sponsors_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          about_content || full_description || description,
          image || "/assets/event-cfo-BjslOJNi.jpg",
          about_image || "",
          speakers || 20,
          status || "published",
          is_featured ? 1 : 0,
          speakersListStr,
          sponsorsListStr,
          galleryListStr,
          agendaListStr,
          map_url || "",
          venue_address || `${venue}, ${city}`,
          effectiveDelegatesCount,
          effectiveSpeakersCount,
          effectiveSponsorsCount,
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
      about_content: about_content || full_description || description,
      image,
      about_image: about_image || "",
      speakers,
      status,
      is_featured,
      speakers_list: speakersListStr,
      sponsors_list: sponsorsListStr,
      gallery_list: galleryListStr,
      agenda_list: agendaListStr,
      map_url,
      venue_address,
      delegates_count: effectiveDelegatesCount,
      speakers_count: effectiveSpeakersCount,
      sponsors_count: effectiveSponsorsCount,
    };
    invalidateFastCache("events_");
    invalidateFastCache("event_slug_");
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
    about_content,
    image,
    about_image,
    speakers,
    status,
    is_featured,
    speakers_list,
    sponsors_list,
    gallery_list,
    agenda_list,
    map_url,
    venue_address,
    delegates_count,
    speakers_count,
    sponsors_count,
  } = req.body;

  const locationsStr = typeof locations === "string" ? locations : JSON.stringify(locations || []);
  const speakersListStr = typeof speakers_list === "string" ? speakers_list : JSON.stringify(speakers_list || []);
  const sponsorsListStr = typeof sponsors_list === "string" ? sponsors_list : JSON.stringify(sponsors_list || []);
  const galleryListStr = typeof gallery_list === "string" ? gallery_list : JSON.stringify(gallery_list || []);
  const agendaListStr = typeof agenda_list === "string" ? agenda_list : JSON.stringify(agenda_list || []);

  const effectiveDelegatesCount = delegates_count || "500+";
  const effectiveSpeakersCount = speakers_count || `${speakers || 30}+`;
  const effectiveSponsorsCount = sponsors_count || "25+";

  try {
    if (pool) {
      await pool.query(
        `UPDATE events SET 
          title = ?, category = ?, date = ?, time = ?, city = ?, venue = ?, locations = ?, description = ?, full_description = ?, about_content = ?, image = ?, about_image = ?, speakers = ?, status = ?, is_featured = ?, speakers_list = ?, sponsors_list = ?, gallery_list = ?, agenda_list = ?, map_url = ?, venue_address = ?, delegates_count = ?, speakers_count = ?, sponsors_count = ?
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
          about_content || full_description || description,
          image,
          about_image || "",
          speakers,
          status,
          is_featured ? 1 : 0,
          speakersListStr,
          sponsorsListStr,
          galleryListStr,
          agendaListStr,
          map_url || "",
          venue_address || `${venue}, ${city}`,
          effectiveDelegatesCount,
          effectiveSpeakersCount,
          effectiveSponsorsCount,
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
      about_content: about_content || full_description || description,
      image,
      about_image: about_image || "",
      speakers,
      status,
      is_featured,
      speakers_list: speakersListStr,
      sponsors_list: sponsorsListStr,
      gallery_list: galleryListStr,
      agenda_list: agendaListStr,
      map_url,
      venue_address,
      delegates_count: effectiveDelegatesCount,
      speakers_count: effectiveSpeakersCount,
      sponsors_count: effectiveSponsorsCount,
    };
    invalidateFastCache("events_");
    invalidateFastCache("event_slug_");
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
      await pool.query("DELETE FROM events WHERE id = ?", [id]);
    }
    invalidateFastCache("events_");
    invalidateFastCache("event_slug_");
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
      await pool.query("UPDATE events SET status = ? WHERE id = ?", [status, id]);
    }
    invalidateFastCache("events_");
    invalidateFastCache("event_slug_");
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
      await pool.query("UPDATE events SET is_featured = ? WHERE id = ?", [is_featured ? 1 : 0, id]);
    }
    invalidateFastCache("events_");
    invalidateFastCache("event_slug_");
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

// Get all partners (Public for carousel with no-cache option)
app.get("/api/partners", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const cacheKey = "partners_list";
  const cached = getFastCache(cacheKey);
  if (cached && Array.isArray((cached as any).partners)) {
    return res.json(cached);
  }

  try {
    if (pool) {
      const [rows]: any = await pool.query("SELECT * FROM partners ORDER BY priority ASC, created_at DESC");
      const resp = { success: true, partners: rows, data: rows };
      setFastCache(cacheKey, resp, 10);
      return res.json(resp);
    }
    return res.json({ success: true, partners: [], data: [] });
  } catch (err: any) {
    console.error("Fetch Partners Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch partners", partners: [] });
  }
});

// Admin create partner
app.post("/api/admin/partners", authenticateAdmin, async (req, res) => {
  let { brand_name, logo, website, category, priority, status } = req.body;
  if (!brand_name || !brand_name.trim() || !logo || !logo.trim()) {
    return res.status(400).json({ success: false, message: "Brand name and logo are required" });
  }

  const processedLogo = saveBase64Image(logo.trim());
  const id = `PTR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const prioVal = Number(priority) || 0;
  const statusVal = status === "Inactive" ? "Inactive" : "Active";
  const cleanBrandName = brand_name.trim();
  const cleanWebsite = (website || "").trim();
  const cleanCategory = category || "Strategic Partner";

  try {
    if (pool) {
      await pool.query(
        `INSERT INTO partners (id, brand_name, logo, website, category, priority, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
          brand_name = VALUES(brand_name),
          logo = VALUES(logo),
          website = VALUES(website),
          category = VALUES(category),
          priority = VALUES(priority),
          status = VALUES(status);`,
        [id, cleanBrandName, processedLogo, cleanWebsite, cleanCategory, prioVal, statusVal]
      );
    }
    invalidateFastCache("partners_list");
    invalidateFastCache("partners");
    const newPartner = {
      id,
      brand_name: cleanBrandName,
      logo: processedLogo,
      website: cleanWebsite,
      category: cleanCategory,
      priority: prioVal,
      status: statusVal,
      created_at: new Date().toISOString(),
    };
    io.emit("partner_updated", { type: "add", partner: newPartner });
    return res.json({ success: true, partner: newPartner, message: "Partner collaborator added successfully!" });
  } catch (err: any) {
    console.error("Create Partner Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to create partner" });
  }
});

// Admin edit/update partner
app.put("/api/admin/partners/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  let { brand_name, logo, website, category, priority, status } = req.body;
  if (!brand_name || !brand_name.trim()) {
    return res.status(400).json({ success: false, message: "Brand name is required." });
  }

  const processedLogo = logo ? saveBase64Image(logo.trim()) : "";
  const prioVal = Number(priority) || 0;
  const statusVal = status === "Inactive" ? "Inactive" : "Active";
  const cleanBrandName = brand_name.trim();
  const cleanWebsite = (website || "").trim();
  const cleanCategory = category || "Strategic Partner";

  try {
    if (pool) {
      const [existing]: any = await pool.query("SELECT id FROM partners WHERE id = ? LIMIT 1", [id]);
      if (existing && existing.length > 0) {
        if (processedLogo) {
          await pool.query(
            "UPDATE partners SET brand_name = ?, logo = ?, website = ?, category = ?, priority = ?, status = ? WHERE id = ?",
            [cleanBrandName, processedLogo, cleanWebsite, cleanCategory, prioVal, statusVal, id]
          );
        } else {
          await pool.query(
            "UPDATE partners SET brand_name = ?, website = ?, category = ?, priority = ?, status = ? WHERE id = ?",
            [cleanBrandName, cleanWebsite, cleanCategory, prioVal, statusVal, id]
          );
        }
      } else {
        // Fallback: If editing an item not yet in MySQL (e.g. from initial hardcoded fallback), insert it
        await pool.query(
          "INSERT INTO partners (id, brand_name, logo, website, category, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [id, cleanBrandName, processedLogo || "/assets/UPDATED LOGO-BbVqtYqk.jpeg", cleanWebsite, cleanCategory, prioVal, statusVal]
        );
      }
    }
    invalidateFastCache("partners_list");
    invalidateFastCache("partners");
    io.emit("partner_updated", { type: "update", id });
    return res.json({ success: true, message: "Partner collaborator updated successfully!" });
  } catch (err: any) {
    console.error("Update Partner Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update partner" });
  }
});

// Admin delete partner
app.delete("/api/admin/partners/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await pool.query("DELETE FROM partners WHERE id = ?", [id]);
    }
    invalidateFastCache("partners_list");
    invalidateFastCache("partners");
    io.emit("partner_updated", { type: "delete", id });
    return res.json({ success: true, message: "Partner deleted successfully" });
  } catch (err: any) {
    console.error("Delete Partner Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete partner" });
  }
});

// Draft / Step-by-Step Partner Lead Capture
app.post("/api/partners/draft", async (req, res) => {
  try {
    const {
      submissionId,
      step = 1,
      company_name = "",
      website = "",
      industry = "",
      location = "",
      contact_person = "",
      designation = "",
      email = "",
      phone = "",
      partnership_type = "Strategic Partner",
      message = "",
    } = req.body;

    const id = submissionId || `PRT-SUB-${Date.now().toString().slice(-6)}`;
    const dropStatus = step === 1 ? "Dropped (Partner Step 1)" : "Dropped (Partner Step 2)";

    if (pool) {
      const [existing]: any = await pool.query("SELECT id FROM partner_submissions WHERE id = ? LIMIT 1", [id]);
      if (existing && existing.length > 0) {
        await pool.query(
          `UPDATE partner_submissions SET
            company_name = COALESCE(NULLIF(?, ''), company_name),
            website = COALESCE(NULLIF(?, ''), website),
            industry = COALESCE(NULLIF(?, ''), industry),
            location = COALESCE(NULLIF(?, ''), location),
            contact_person = COALESCE(NULLIF(?, ''), contact_person),
            designation = COALESCE(NULLIF(?, ''), designation),
            email = COALESCE(NULLIF(?, ''), email),
            phone = COALESCE(NULLIF(?, ''), phone),
            partnership_type = COALESCE(NULLIF(?, ''), partnership_type),
            message = COALESCE(NULLIF(?, ''), message),
            status = CASE WHEN status = 'Pending' OR status = 'Replied' THEN status ELSE ? END
          WHERE id = ?`,
          [
            company_name, website, industry, location, contact_person, designation, email, phone, partnership_type, message, dropStatus, id
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO partner_submissions (id, company_name, website, industry, location, contact_person, designation, email, phone, partnership_type, message, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, company_name || "Draft Company", website || "", industry || "General", location || "N/A",
            contact_person || "Partner Representative", designation || "Executive", email || "draft@etmedia.in", phone || "N/A",
            partnership_type || "Strategic Partner", message || "Draft Partner Inquiry", dropStatus
          ]
        );
      }
    }

    return res.json({ success: true, submissionId: id });
  } catch (err: any) {
    console.error("Partner Draft Error:", err);
    return res.json({ success: true, submissionId: req.body.submissionId || `PRT-SUB-${Date.now()}` });
  }
});

// Submit Partner Form (Public)
app.post("/api/partners/submit", async (req, res) => {
  const {
    submissionId,
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

  if (!isValidCompanyName(company_name)) {
    return res.status(400).json({ success: false, message: "Please enter a valid company or organization name." });
  }

  if (!isValidLocation(location)) {
    return res.status(400).json({ success: false, message: "Please enter a valid city or headquarters location." });
  }

  if (!isValidName(contact_person)) {
    return res.status(400).json({ success: false, message: "Please enter a valid primary contact person name." });
  }

  if (!isValidDesignation(designation)) {
    return res.status(400).json({ success: false, message: "Please enter a valid professional designation (e.g. Vice President, Director)." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid official corporate email address." });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: "Please provide a valid 10-digit contact mobile number." });
  }

  const id = submissionId || `PRT-SUB-${Date.now().toString().slice(-6)}`;
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
    status: "Pending",
    created_at: new Date().toISOString(),
  };

  try {
    if (pool) {
      const [existing]: any = await pool.query("SELECT id FROM partner_submissions WHERE id = ? LIMIT 1", [id]);
      if (existing && existing.length > 0) {
        await pool.query(
          `UPDATE partner_submissions SET 
            company_name = ?, website = ?, industry = ?, location = ?, 
            contact_person = ?, designation = ?, email = ?, phone = ?, 
            partnership_type = ?, message = ?, status = 'Pending' 
          WHERE id = ?`,
          [company_name, website || "", industry, location, contact_person, designation, email, phone, partnership_type, message || "", id]
        );
      } else {
        await pool.query(
          `INSERT INTO partner_submissions (id, company_name, website, industry, location, contact_person, designation, email, phone, partnership_type, message, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
          [id, company_name, website || "", industry, location, contact_person, designation, email, phone, partnership_type, message || ""]
        );
      }
    }

    io.emit("new_partner_submission", submissionData);

    // Send auto confirmation email to user & notification to admin email registration@etmedia.in
    sendPartnerAdminNotificationEmail(submissionData).catch(err => console.error("Partner admin notification error:", err));
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
      from: `"Executive Talks Media Business Intelligence" <${smtpUser.trim()}>`,
      to: recipient_email,
      subject: `Response to your Partnership Inquiry — Executive Talks Media Business Intelligence`,
      text: reply_message,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h3 style="color: #00AEEF; margin-top: 0;">Executive Talks Media Strategic Partnerships</h3>
          <p>Dear <strong>${contact_person || "Partner"}</strong>,</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #00AEEF; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #1e293b;">
            ${reply_message.replace(/\n/g, "<br/>")}
          </div>
          <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
            Best regards,<br/>
            <strong>Executive Talks Media Strategic Partnerships Team</strong><br/>
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
  let { issue, title, date, month, cover, pdf_url, pages_list, category, description, is_featured } = req.body;
  if (!title || !cover) {
    return res.status(400).json({ success: false, message: "Title and Cover image are required" });
  }

  cover = saveBase64Image(cover);

  const id = `MAG-${Date.now().toString().slice(-6)}`;
  const pagesJson = typeof pages_list === "string" ? pages_list : JSON.stringify(pages_list || [cover]);

  try {
    if (pool) {
      await pool.query(
        "INSERT INTO magazines (id, issue, title, date, month, cover, pdf_url, pages_list, category, description, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
          description || "",
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
      description: description || "",
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
  let { issue, title, date, month, cover, pdf_url, pages_list, category, description, is_featured } = req.body;

  if (cover) {
    cover = saveBase64Image(cover);
  }

  const pagesJson = typeof pages_list === "string" ? pages_list : JSON.stringify(pages_list || [cover]);

  try {
    if (pool) {
      await pool.query(
        "UPDATE magazines SET issue = ?, title = ?, date = ?, month = ?, cover = ?, pdf_url = ?, pages_list = ?, category = ?, description = ?, is_featured = ? WHERE id = ?",
        [
          issue,
          title,
          date,
          month || date,
          cover,
          pdf_url || "",
          pagesJson,
          category || "Leadership",
          description || "",
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

// Public PDF Resume Upload Handler (stores base64 data URI directly to MySQL column)
app.post("/api/upload-resume", async (req, res) => {
  try {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const base64Str = buffer.toString("base64");
      const pdfDataUrl = `data:application/pdf;base64,${base64Str}`;
      return res.json({ success: true, url: pdfDataUrl, message: "Resume data stored directly in database!" });
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

  if (!isValidName(name)) {
    return res.status(400).json({ success: false, message: "Please enter a valid candidate full name." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: "Please enter a valid 10-digit contact mobile number." });
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

    // Send admin email notification to registration@etmedia.in
    sendJobApplicationAdminNotificationEmail(appData).catch(err => console.error("Job application admin notification error:", err));

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

// In-memory fallback store for media gallery items
let inMemoryGalleryItems: any[] = [
  {
    id: "GAL-101",
    title: "HR Excellence Leadership Awards Night",
    type: "photo",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
    thumbnail_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600",
    category: "Awards",
    event_slug: "hr-excellence-awards",
    event_title: "HR Excellence & Leadership Conclave",
    aspect_ratio: "aspect-[16/9]",
    created_at: new Date().toISOString(),
  },
  {
    id: "GAL-102",
    title: "Enterprise AI & Tech Leaders Panel Discussion",
    type: "photo",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200",
    thumbnail_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=600",
    category: "Keynotes",
    event_slug: "enterprise-tech-conclave",
    event_title: "National Enterprise Tech & AI Summit",
    aspect_ratio: "aspect-[16/9]",
    created_at: new Date().toISOString(),
  },
];

// Get all gallery media items (Public with filter support)
app.get("/api/gallery", async (req, res) => {
  try {
    const { category, event_slug, type } = req.query;
    if (pool) {
      await ensureGalleryTable();
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
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json({ success: true, items: rows });
      }
    }

    // Fallback to inMemoryGalleryItems
    let filtered = [...inMemoryGalleryItems];
    if (category && category !== "all" && category !== "All") {
      filtered = filtered.filter((i) => i.category === category);
    }
    if (event_slug && event_slug !== "all" && event_slug !== "All") {
      filtered = filtered.filter((i) => i.event_slug === event_slug);
    }
    if (type && type !== "all" && type !== "All") {
      filtered = filtered.filter((i) => i.type === type);
    }
    return res.json({ success: true, items: filtered });
  } catch (err: any) {
    console.error("Fetch Gallery Error:", err);
    return res.json({ success: true, items: inMemoryGalleryItems });
  }
});

// Admin Create / Upload Gallery Media Item
app.post("/api/admin/gallery", authenticateAdmin, async (req, res) => {
  let { title, type, url, thumbnail_url, category, event_slug, event_title, aspect_ratio } = req.body;
  if (!title || !url) {
    return res.status(400).json({ success: false, message: "Media Title and URL are required" });
  }

  url = saveBase64Image(url);
  thumbnail_url = saveBase64Image(thumbnail_url || url);

  const id = `GAL-${Date.now().toString().slice(-6)}`;
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
  } catch (err: any) {
    console.error("Create Gallery Database Insert Error:", err);
  }

  inMemoryGalleryItems = [newItem, ...inMemoryGalleryItems.filter((i) => i.id !== id)];
  io.emit("gallery_updated", { type: "add", item: newItem });
  return res.json({ success: true, item: newItem, message: "Gallery item published successfully!" });
});

// Admin Update Gallery Media Item
app.put("/api/admin/gallery/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  let { title, type, url, thumbnail_url, category, event_slug, event_title, aspect_ratio } = req.body;

  url = saveBase64Image(url);
  thumbnail_url = saveBase64Image(thumbnail_url || url);

  const updatedItem = {
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
  } catch (err: any) {
    console.error("Update Gallery Item Error:", err);
  }

  inMemoryGalleryItems = inMemoryGalleryItems.map((i) => (i.id === id ? { ...i, ...updatedItem } : i));
  io.emit("gallery_updated", { type: "update", id, item: updatedItem });
  return res.json({ success: true, item: updatedItem, message: "Gallery item updated successfully!" });
});

// Admin Delete Gallery Media Item
app.delete("/api/admin/gallery/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await ensureGalleryTable();
      await pool.query("DELETE FROM gallery_items WHERE id = ?", [id]);
    }
  } catch (err: any) {
    console.error("Delete Gallery Item Error:", err);
  }

  inMemoryGalleryItems = inMemoryGalleryItems.filter((i) => i.id !== id);
  io.emit("gallery_updated", { type: "delete", id });
  return res.json({ success: true, message: "Gallery item deleted" });
});

// ==========================================
// TESTIMONIALS & INSTAGRAM HELPER API ENDPOINTS
// ==========================================

// Helper API to resolve Instagram Reel / Post High-Res Thumbnail
app.get("/api/admin/instagram-thumbnail", async (req, res) => {
  const urlParam = (req.query.url as string) || "";
  if (!urlParam) {
    return res.status(400).json({ success: false, message: "URL parameter is required" });
  }

  try {
    let reelId = "";
    if (urlParam.includes("/reel/")) {
      reelId = urlParam.split("/reel/")[1]?.split("/")[0] || "";
    } else if (urlParam.includes("/p/")) {
      reelId = urlParam.split("/p/")[1]?.split("/")[0] || "";
    } else if (urlParam.includes("/tv/")) {
      reelId = urlParam.split("/tv/")[1]?.split("/")[0] || "";
    }

    if (!reelId && urlParam.match(/([A-Za-z0-9_-]{10,})/)) {
      reelId = urlParam.match(/([A-Za-z0-9_-]{10,})/)?.[1] || "";
    }

    if (!reelId) {
      return res.status(400).json({ success: false, message: "Invalid Instagram Reel / Post URL" });
    }

    const directMediaUrl = `https://www.instagram.com/p/${reelId}/media/?size=l`;
    const embedUrl = `https://www.instagram.com/reel/${reelId}/embed`;

    return res.json({
      success: true,
      reelId,
      embedUrl,
      thumbnailUrl: directMediaUrl,
    });
  } catch (err: any) {
    console.error("Instagram Thumbnail Fetch Error:", err);
    return res.status(500).json({ success: false, message: "Failed to extract Instagram thumbnail" });
  }
});

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
  const { name, designation, company, quote, avatar, rating, is_featured, video_url, video_platform } = req.body;
  if (!name || !designation || !company || !quote) {
    return res.status(400).json({ success: false, message: "Name, designation, company, and quote are required" });
  }

  const id = `TST-${Date.now().toString().slice(-6)}`;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        "INSERT INTO testimonials (id, name, designation, company, quote, avatar, rating, is_featured, video_url, video_platform) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, name, designation, company, quote, avatar || "", rating || 5, is_featured ? 1 : 0, video_url || "", video_platform || "youtube"]
      );
    }
    const newTest = {
      id,
      name,
      designation,
      company,
      quote,
      avatar,
      rating: rating || 5,
      is_featured: is_featured ? 1 : 0,
      video_url: video_url || "",
      video_platform: video_platform || "youtube",
      created_at: new Date()
    };
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
  const { name, designation, company, quote, avatar, rating, is_featured, video_url, video_platform } = req.body;

  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        "UPDATE testimonials SET name = ?, designation = ?, company = ?, quote = ?, avatar = ?, rating = ?, is_featured = ?, video_url = ?, video_platform = ? WHERE id = ?",
        [name, designation, company, quote, avatar || "", rating || 5, is_featured ? 1 : 0, video_url || "", video_platform || "youtube", id]
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
// SECTOR FOCUS (INDUSTRIES WE SERVE) API ENDPOINTS
// ==========================================

// Get all sectors (Public)
app.get("/api/sectors", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  try {
    if (pool) {
      await ensureSectorsTable();
      const [rows]: any = await pool.query("SELECT * FROM sectors ORDER BY priority ASC, created_at ASC");
      return res.json({ success: true, sectors: rows, data: rows });
    }
    return res.json({ success: true, sectors: [], data: [] });
  } catch (err: any) {
    console.error("Fetch Sectors Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch sectors" });
  }
});

// Admin create sector
app.post("/api/admin/sectors", authenticateAdmin, async (req, res) => {
  const { title, description, icon, tag, priority, status } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: "Sector title and description are required" });
  }

  const id = `SEC-${Date.now().toString().slice(-6)}`;
  try {
    if (pool) {
      await ensureSectorsTable();
      await pool.query(
        "INSERT INTO sectors (id, title, description, icon, tag, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, title, description, icon || "TrendingUp", tag || "C-Suite Conclave", priority || 0, status || "Active"]
      );
    }
    const newSector = { id, title, description, icon: icon || "TrendingUp", tag: tag || "C-Suite Conclave", priority: priority || 0, status: status || "Active", created_at: new Date() };
    io.emit("sector_updated", { type: "add", sector: newSector });
    return res.json({ success: true, sector: newSector, message: "Sector focus created successfully!" });
  } catch (err: any) {
    console.error("Create Sector Error:", err);
    return res.status(500).json({ success: false, message: "Failed to create sector focus item" });
  }
});

// Admin update sector
app.put("/api/admin/sectors/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, icon, tag, priority, status } = req.body;

  try {
    if (pool) {
      await ensureSectorsTable();
      await pool.query(
        "UPDATE sectors SET title = ?, description = ?, icon = ?, tag = ?, priority = ?, status = ? WHERE id = ?",
        [title, description, icon || "TrendingUp", tag || "C-Suite Conclave", priority || 0, status || "Active", id]
      );
    }
    io.emit("sector_updated", { type: "update", id });
    return res.json({ success: true, message: "Sector updated successfully!" });
  } catch (err: any) {
    console.error("Update Sector Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update sector" });
  }
});

// Admin delete sector
app.delete("/api/admin/sectors/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await ensureSectorsTable();
      await pool.query("DELETE FROM sectors WHERE id = ?", [id]);
    }
    io.emit("sector_updated", { type: "delete", id });
    return res.json({ success: true, message: "Sector deleted successfully" });
  } catch (err: any) {
    console.error("Delete Sector Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete sector" });
  }
});

// ==========================================
// NEWSLETTER SUBSCRIBERS API ENDPOINTS
// ==========================================

// Subscribe to newsletter (Public)
app.post("/api/newsletter/subscribe", async (req, res) => {
  const { email, source } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Valid email address is required (e.g. name@company.com)" });
  }

  const id = `SUB-${Date.now().toString().slice(-6)}`;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        "INSERT INTO newsletter_subscribers (id, email, source) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE email=email",
        [id, email.trim(), source || "Website Footer"]
      );
    }
    const newSub = { id, email: email.trim(), source: source || "Website Footer", created_at: new Date() };
    io.emit("new_newsletter_subscriber", { subscriber: newSub, ...newSub });
    sendNewsletterAdminNotificationEmail({ id, email: email.trim(), source: source || "Website Footer" }).catch(() => {});
    return res.json({ success: true, message: "Subscribed to Executive Talks newsletter!", subscriber: newSub });
  } catch (err: any) {
    console.error("Newsletter Subscribe Error:", err);
    return res.status(500).json({ success: false, message: "Failed to subscribe" });
  }
});

// ==========================================
// EXECUTIVE MEMBERSHIPS API ENDPOINTS
// ==========================================

// Submit Executive Membership Application (Public)
app.post("/api/memberships", async (req, res) => {
  const {
    full_name,
    email,
    phone,
    designation,
    company,
    city,
    membership_tier,
    industry,
    objectives,
    attendance_count,
    notes,
  } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ success: false, message: "Full Name and Official Email are required." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid official email address." });
  }

  if (!isValidName(full_name)) {
    return res.status(400).json({ success: false, message: "Please enter a valid Full Name." });
  }

  if (phone && phone !== "N/A" && !isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: "Please enter a valid 10-digit mobile number." });
  }

  const id = `MBR-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString();

  const membershipData = {
    id,
    full_name,
    email,
    phone: phone || "N/A",
    designation: designation || "Executive Leader",
    company: company || "Organization",
    city: city || "N/A",
    membership_tier: membership_tier || "Executive Council",
    industry: industry || "Technology & Business",
    objectives: objectives || "",
    attendance_count: attendance_count || "3-5 Summits / Year",
    notes: notes || "",
    status: "Pending",
    created_at: timestamp,
  };

  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        `INSERT INTO memberships (
          id, full_name, email, phone, designation, company, city, membership_tier, industry, objectives, attendance_count, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          full_name,
          email,
          phone || "N/A",
          designation || "Executive Leader",
          company || "Organization",
          city || "N/A",
          membership_tier || "Executive Council",
          industry || "Technology & Business",
          objectives || "",
          attendance_count || "3-5 Summits / Year",
          notes || "",
          "Pending",
        ]
      );
    }

    io.emit("new_membership_application", membershipData);

    // Send admin email notification to registration@etmedia.in
    sendMembershipAdminNotificationEmail(membershipData).catch((err) =>
      console.error("Membership admin notification error:", err)
    );

    return res.status(201).json({
      success: true,
      message: "Membership application submitted successfully!",
      membership: membershipData,
    });
  } catch (err: any) {
    console.error("Membership Application DB Error:", err);
    return res.status(500).json({ success: false, message: "Failed to process membership application." });
  }
});

// Admin Get All Membership Applications
app.get("/api/admin/memberships", authenticateAdmin, async (_req, res) => {
  try {
    if (pool) {
      await ensureNewAdminTables();
      const [rows]: any = await pool.query("SELECT * FROM memberships ORDER BY created_at DESC");
      return res.json({ success: true, memberships: rows });
    }
    return res.json({ success: true, memberships: [] });
  } catch (err: any) {
    console.error("Fetch Memberships Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch membership applications" });
  }
});

// Admin Delete Membership Application
app.delete("/api/admin/memberships/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query("DELETE FROM memberships WHERE id = ?", [id]);
    }
    return res.json({ success: true, message: "Membership record deleted" });
  } catch (err: any) {
    console.error("Delete Membership Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete membership record" });
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
// SEO META TAGS & DYNAMIC SITEMAP API ENDPOINTS
// ==========================================

// Dynamic Sitemap.xml Generator (Public & Google Search Console)
app.get(["/sitemap.xml", "/api/sitemap.xml"], async (req, res) => {
  try {
    const baseUrl = (process.env.PUBLIC_URL || process.env.SITE_URL || "https://www.executivetalksmedia.in").replace(/\/$/, "");
    const staticPages = [
      { url: "", changefreq: "daily", priority: "1.0" },
      { url: "/events", changefreq: "daily", priority: "0.95" },
      { url: "/about", changefreq: "monthly", priority: "0.85" },
      { url: "/magazine", changefreq: "weekly", priority: "0.85" },
      { url: "/partner", changefreq: "monthly", priority: "0.80" },
      { url: "/membership", changefreq: "monthly", priority: "0.80" },
      { url: "/delegate-registration", changefreq: "monthly", priority: "0.80" },
      { url: "/careers", changefreq: "weekly", priority: "0.75" },
      { url: "/gallery", changefreq: "weekly", priority: "0.75" },
      { url: "/contact", changefreq: "monthly", priority: "0.70" },
    ];

    let dynamicUrls: { url: string; changefreq: string; priority: string; lastmod?: string }[] = [];

    if (pool) {
      // 1. Published Events from DB
      try {
        const [events]: any = await pool.query("SELECT slug, updated_at, created_at FROM events WHERE status != 'draft'");
        if (Array.isArray(events)) {
          events.forEach((evt) => {
            if (evt.slug) {
              const lastmod = evt.updated_at || evt.created_at ? new Date(evt.updated_at || evt.created_at).toISOString().split("T")[0] : undefined;
              dynamicUrls.push({
                url: `/events/${evt.slug}`,
                changefreq: "weekly",
                priority: "0.90",
                lastmod,
              });
              dynamicUrls.push({
                url: `/events/${evt.slug}/register`,
                changefreq: "weekly",
                priority: "0.85",
                lastmod,
              });
            }
          });
        }
      } catch (evtErr) {
        console.warn("[Sitemap] Error fetching events for sitemap:", evtErr);
      }
    }

    const todayIso = new Date().toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

    for (const p of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${p.url}</loc>\n`;
      xml += `    <lastmod>${todayIso}</lastmod>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const d of dynamicUrls) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${d.url}</loc>\n`;
      if (d.lastmod) {
        xml += `    <lastmod>${d.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${d.changefreq}</changefreq>\n`;
      xml += `    <priority>${d.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(xml);
  } catch (err: any) {
    console.error("[Sitemap] Error generating sitemap:", err);
    return res.status(500).send("Error generating sitemap");
  }
});

// Dynamic Robots.txt (Public & Crawlers)
app.get(["/robots.txt", "/api/robots.txt"], (_req, res) => {
  const baseUrl = (process.env.PUBLIC_URL || process.env.SITE_URL || "https://www.executivetalksmedia.in").replace(/\/$/, "");
  const robotsContent = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/admin/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain");
  return res.status(200).send(robotsContent);
});
// Google Search Console Site Ownership Verification File
app.get(["/google736712b10fdf4584.html", "/api/google736712b10fdf4584.html"], (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send("google-site-verification: google736712b10fdf4584.html");
});

// Generic Google Verification File Handler
app.get(/^\/google[a-zA-Z0-9_-]+\.html$/, (req, res) => {
  const filename = path.basename(req.path);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(`google-site-verification: ${filename}`);
});

// Get all SEO meta tags (Public)
app.get("/api/seo", async (_req, res) => {
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

// Get single page SEO meta tag (Public)
app.get("/api/seo/:page_key", async (req, res) => {
  const { page_key } = req.params;
  try {
    if (pool) {
      await ensureNewAdminTables();
      const [rows]: any = await pool.query("SELECT * FROM seo_settings WHERE page_key = ? LIMIT 1", [page_key]);
      if (rows.length > 0) {
        return res.json({ success: true, seo: rows[0] });
      }
    }
    return res.json({ success: true, seo: null });
  } catch (err: any) {
    console.error("Fetch Single SEO Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch page SEO" });
  }
});

// Admin update SEO meta tag
app.put("/api/admin/seo/:page_key", authenticateAdmin, async (req, res) => {
  const { page_key } = req.params;
  const { title, description, keywords, og_image } = req.body;
  try {
    if (pool) {
      await ensureNewAdminTables();
      await pool.query(
        "INSERT INTO seo_settings (page_key, title, description, keywords, og_image) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=?, description=?, keywords=?, og_image=?",
        [page_key, title, description, keywords || "", og_image || "", title, description, keywords || "", og_image || ""]
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

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid official email address." });
  }

  if (!isValidName(name)) {
    return res.status(400).json({ success: false, message: "Please enter a valid Admin Name." });
  }

  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
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
  } catch (err: any) {
    console.error("Update Settings Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});

// ==========================================
// VISITOR ANALYTICS API ENDPOINTS
// ==========================================

// Track Pageview (Public)
app.post("/api/analytics/track", async (req, res) => {
  try {
    const pagePath = req.body?.path || "/";
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0];
    if (pool) {
      await pool.query(
        "INSERT INTO site_pageviews (page_path, ip_address) VALUES (?, ?)",
        [pagePath.substring(0, 255), ip.substring(0, 100)]
      );
    }
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: true });
  }
});

// Admin Get Visitor Analytics (100% Real Database Pageviews)
app.get("/api/admin/analytics/visitors", authenticateAdmin, async (req, res) => {
  try {
    let totalPageviews = 0;
    let weeklyVisitors = 0;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyTraffic: { day: string; date: string; count: number }[] = [];

    // Initialize map for the last 7 days ending today
    const last7DaysMap: Record<string, { day: string; date: string; count: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];
      last7DaysMap[isoDate] = { day: dayName, date: isoDate, count: 0 };
    }

    if (pool) {
      // Ensure table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_pageviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          page_path VARCHAR(255),
          ip_address VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `).catch(() => {});

      const [totalRows]: any = await pool.query("SELECT COUNT(*) as count FROM site_pageviews");
      totalPageviews = Number(totalRows[0]?.count || 0);

      const [recentRows]: any = await pool.query(
        "SELECT DATE(created_at) as log_date, COUNT(*) as count FROM site_pageviews WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at) ORDER BY log_date ASC"
      );

      if (Array.isArray(recentRows)) {
        for (const row of recentRows) {
          const dateStr = typeof row.log_date === "string"
            ? row.log_date.substring(0, 10)
            : (row.log_date instanceof Date ? row.log_date.toISOString().split("T")[0] : "");
          if (dateStr && last7DaysMap[dateStr]) {
            last7DaysMap[dateStr].count = Number(row.count || 0);
          }
        }
      }
    }

    Object.values(last7DaysMap).forEach((item) => {
      dailyTraffic.push(item);
      weeklyVisitors += item.count;
    });

    // If total pageviews exists but dates fall slightly outside 6-day window, ensure weeklyVisitors is at least totalPageviews
    if (weeklyVisitors === 0 && totalPageviews > 0) {
      weeklyVisitors = totalPageviews;
      if (dailyTraffic.length > 0) {
        dailyTraffic[dailyTraffic.length - 1].count = totalPageviews;
      }
    }

    const avgDaily = Math.round(weeklyVisitors / 7);

    return res.json({
      success: true,
      weeklyVisitors,
      avgDailyVisitors: avgDaily,
      totalPageviews,
      dailyTraffic,
    });
  } catch (err) {
    console.error("Admin Analytics Error:", err);
    return res.json({
      success: true,
      weeklyVisitors: 0,
      avgDailyVisitors: 0,
      totalPageviews: 0,
      dailyTraffic: [],
    });
  }
});

// SPA Wildcard Route Fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  // Prevent returning index.html for missing images/static assets so onError works
  const ext = path.extname(req.path).toLowerCase();
  if (
    [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".css", ".js", ".woff", ".woff2", ".ttf"].includes(ext) ||
    req.path.startsWith("/uploads/") ||
    req.path.startsWith("/assets/")
  ) {
    return res.status(404).send("File not found");
  }

  if (activeFrontendDist) {
    const indexPath = path.join(activeFrontendDist, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  return res.send("Executive Talks Media Business Intelligence Backend Server Running!");
});

// Initialize DB and start HTTP server
initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Executive Talks Media Business Intelligence Realtime Server Running!`);
    console.log(`📡 HTTP API: http://localhost:${PORT}/api/health`);
    console.log(`⚡ WebSocket Server (Socket.IO): ws://localhost:${PORT}`);
    console.log(`🔑 Admin Login API: http://localhost:${PORT}/api/admin/login`);
    console.log(`=======================================================`);
  });
});
