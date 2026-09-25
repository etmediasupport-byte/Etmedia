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
const smtpFrom = process.env.SMTP_FROM || `"ET Media Business Intelligence" <${smtpUser}>`;
const adminEmail = (process.env.ADMIN_EMAIL || "srikanth@executivetalksmedia.in").trim();
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
  const eventName = data.eventTitle || "ET Media Executive Summit 2026";
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
  const payAmount = data.paymentAmount !== undefined ? data.paymentAmount : 0;
  const coupon = data.couponApplied || "None";
  const regDate = data.createdAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // Direct clickable Verification URL encoded into the Scannable QR Code
  const baseUrl = (process.env.PUBLIC_URL || process.env.SITE_URL || "https://www.etmedia.in").replace(/\/$/, "");
  const verifyPassUrl = `${baseUrl}/verify-pass/${encodeURIComponent(regId)}`;

  let qrCodeBuffer: Buffer | null = null;
  try {
    qrCodeBuffer = await QRCode.toBuffer(verifyPassUrl, {
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

  // Recipients: User Email + registration@etmedia.in (Hostinger admin mailbox)
  const recipientList: string[] = [userEmail];
  if (adminEmail && !recipientList.includes(adminEmail)) {
    recipientList.push(adminEmail);
  }

  const mailOptions: any = {
    from: smtpFrom,
    to: recipientList.join(", "),
    subject: `🎉 Registration & Ticket Pass Confirmed: ${eventName} (${regId})`,
    text: `
Dear ${effectiveFullName},

Thank you for registering for ${eventName} with ET Media Business Intelligence.

YOUR REGISTRATION & TICKET DETAILS:
- Registration ID: ${regId}
- Event Title: ${eventName}
- Pass Category: ${regCategory}
- Full Name: ${effectiveFullName}
- Email: ${userEmail}
- Phone: ${regPhone}
- Designation: ${regDesig}
- Organization: ${regOrg}
- Location: ${regCity}, ${regCountry}
- Registering City: ${regTargetCity}
- Referral Source: ${regReferral}

PAYMENT DETAILS:
- Payment Status: ${payStatus}
- Payment ID: ${payId}
- Razorpay Order ID: ${razorpayOrderId}
- Amount Paid: ₹${payAmount}
- Coupon Code: ${coupon}

EVENT TERMS & CONDITIONS:
• Registration: Registration is subject to confirmation by ET Media Business Intelligence.
• Valid ID Proof: Participants must carry a valid government-issued photo ID for identity verification at the venue.
• Entry & Pass: Entry is permitted only to registered and confirmed participants. Event passes are strictly non-transferable.
• Right of Admission: ET Media Business Intelligence reserves the right to cancel registration or deny entry based on event, security, verification, capacity or other applicable conditions.
• Code of Conduct: All participants must maintain professional and respectful conduct throughout the event.
• Event Changes: ET Media Business Intelligence reserves the right to change the venue, agenda, speakers, timings or event format if required.
• Health & Safety: Participants experiencing fever, cold, flu-like symptoms or any other contagious illness are requested to avoid attending the event and prioritize their health and the safety of other participants.
• Event Timing & Grace Period: Registration/Check-in starts at 8:30 AM. A 15-minute grace period will be provided for entry. Participants are requested to arrive on time to complete the check-in process.
• Personal Belongings: Participants are responsible for their personal belongings during the event.
• Acceptance: By registering for the event, participants confirm that they have read, understood and agreed to these Terms & Conditions.

Scan the attached QR code to view all submitted registration and payment details.

We look forward to welcoming you!

ET Media Business Intelligence
registration@etmedia.in
www.etmedia.in
`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
        
        <!-- HEADER BANNER -->
        <div style="background: linear-gradient(135deg, #0891b2 0%, #4b1fa7 100%); padding: 30px 25px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">ET MEDIA BUSINESS INTELLIGENCE</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Official Executive Delegate Pass & Confirmation</p>
        </div>

        <div style="padding: 28px 25px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 16px;">Dear <strong>${effectiveFullName}</strong>,</p>
          <p style="margin-bottom: 20px;">Thank you for registering for <strong>${eventName}</strong>. Your registration details and payment confirmation have been recorded successfully.</p>

          <!-- CONFIRMATION STATUS BADGE -->
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-left: 5px solid #10b981; padding: 14px 18px; border-radius: 12px; margin-bottom: 25px;">
            <p style="margin: 0; color: #065f46; font-weight: 700; font-size: 15px;">
              ✅ Registration Status: <span style="text-transform: uppercase;">CONFIRMED & VERIFIED</span>
            </p>
            <p style="margin: 4px 0 0 0; color: #047857; font-size: 13px;">
              Pass Category: <strong>${regCategory}</strong> | Reg ID: <strong>${regId}</strong>
            </p>
          </div>

          <!-- DELEGATE DETAILS TABLE -->
          <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; background-color: #f8fafc; margin-bottom: 22px;">
            <h3 style="margin: 0 0 12px 0; color: #0891b2; font-size: 15px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
              👤 Delegate & Executive Details
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 40%;">Full Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${effectiveFullName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Work Email:</td>
                <td style="padding: 6px 0; color: #0891b2; font-weight: 600;"><a href="mailto:${userEmail}" style="color: #0891b2; text-decoration: none;">${userEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Contact Phone:</td>
                <td style="padding: 6px 0;">${regPhone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Designation:</td>
                <td style="padding: 6px 0; font-weight: 600;">${regDesig}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Organization / Company:</td>
                <td style="padding: 6px 0; font-weight: 600;">${regOrg}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">City & Country:</td>
                <td style="padding: 6px 0;">${regCity}, ${regCountry}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Registering City:</td>
                <td style="padding: 6px 0;">${regTargetCity}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Referral Source:</td>
                <td style="padding: 6px 0;">${regReferral}</td>
              </tr>
            </table>
          </div>

          <!-- PAYMENT SUMMARY TABLE -->
          <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; background-color: #f8fafc; margin-bottom: 25px;">
            <h3 style="margin: 0 0 12px 0; color: #4b1fa7; font-size: 15px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
              💳 Payment & Transaction Summary
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 40%;">Payment Status:</td>
                <td style="padding: 6px 0;">
                  <span style="display: inline-block; background-color: ${payStatus.toLowerCase() === "paid" ? "#10b981" : "#3b82f6"}; color: #ffffff; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                    ${payStatus}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Payment ID:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #0f172a;">${payId}</td>
              </tr>
              ${razorpayOrderId !== "N/A" ? `
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Razorpay Order ID:</td>
                <td style="padding: 6px 0; font-family: monospace;">${razorpayOrderId}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Amount Paid:</td>
                <td style="padding: 6px 0; font-size: 15px; font-weight: 800; color: #047857;">₹${payAmount}</td>
              </tr>
              ${coupon !== "None" ? `
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Coupon Code:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #d97706;">${coupon}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Timestamp:</td>
                <td style="padding: 6px 0; color: #64748b;">${regDate}</td>
              </tr>
            </table>
          </div>

          <!-- SCANNABLE QR CODE SECTION -->
          ${qrCodeBuffer ? `
          <div style="text-align: center; border: 2px dashed #0891b2; border-radius: 16px; padding: 22px; background-color: #f0fdf4; margin-bottom: 25px;">
            <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 15px; font-weight: 800;">📱 SCANNABLE DELEGATE PASS QR CODE</h4>
            <p style="margin: 0 0 15px 0; color: #64748b; font-size: 12px;">Scan this QR code using any smartphone camera or QR scanner app to view all submitted registration and payment details.</p>
            <img src="cid:delegate-qrcode" alt="Registration QR Code" style="width: 180px; height: 180px; display: block; margin: 0 auto; border: 3px solid #0891b2; border-radius: 12px; padding: 8px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
            <p style="margin: 12px 0 0 0; font-family: monospace; font-size: 12px; font-weight: 700; color: #0891b2;">Pass ID: ${regId}</p>
          </div>
          ` : ""}

          <!-- TERMS & CONDITIONS SECTION -->
          <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; background-color: #f8fafc; margin-bottom: 25px;">
            <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
              📋 Event Terms & Conditions
            </h3>
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.7;">
              <li style="margin-bottom: 6px;"><strong>Registration:</strong> Registration is subject to confirmation by ET Media Business Intelligence.</li>
              <li style="margin-bottom: 6px;"><strong>Valid ID Proof:</strong> Participants must carry a valid government-issued photo ID for identity verification at the venue.</li>
              <li style="margin-bottom: 6px;"><strong>Entry & Pass:</strong> Entry is permitted only to registered and confirmed participants. Event passes are strictly non-transferable.</li>
              <li style="margin-bottom: 6px;"><strong>Right of Admission:</strong> ET Media Business Intelligence reserves the right to cancel registration or deny entry based on event, security, verification, capacity or other applicable conditions.</li>
              <li style="margin-bottom: 6px;"><strong>Code of Conduct:</strong> All participants must maintain professional and respectful conduct throughout the event.</li>
              <li style="margin-bottom: 6px;"><strong>Event Changes:</strong> ET Media Business Intelligence reserves the right to change the venue, agenda, speakers, timings or event format if required.</li>
              <li style="margin-bottom: 6px;"><strong>Health & Safety:</strong> Participants experiencing fever, cold, flu-like symptoms or any other contagious illness are requested to avoid attending the event and prioritize their health and the safety of other participants.</li>
              <li style="margin-bottom: 6px;"><strong>Event Timing & Grace Period:</strong> Registration/Check-in starts at 8:30 AM. A 15-minute grace period will be provided for entry. Participants are requested to arrive on time to complete the check-in process.</li>
              <li style="margin-bottom: 6px;"><strong>Personal Belongings:</strong> Participants are responsible for their personal belongings during the event.</li>
              <li style="margin-bottom: 0px;"><strong>Acceptance:</strong> By registering for the event, participants confirm that they have read, understood and agreed to these Terms & Conditions.</li>
            </ul>
          </div>

          <p style="margin-bottom: 0;">Our executive team will contact you shortly with agenda updates, venue access details, and networking session schedules.</p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 25px; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 0; font-weight: 700; color: #1e293b;">ET Media Business Intelligence</p>
          <p style="margin: 4px 0 0 0;">Official Support Email: <a href="mailto:${smtpUser.trim()}" style="color: #0891b2; text-decoration: none; font-weight: 700;">${smtpUser.trim()}</a></p>
          <p style="margin: 4px 0 0 0;">Website: <a href="https://www.etmedia.in" style="color: #0891b2; text-decoration: none;">www.etmedia.in</a></p>
        </div>

      </div>
    `,
    attachments: qrCodeBuffer ? [
      {
        filename: `ETMedia-Pass-${regId}.png`,
        content: qrCodeBuffer,
        cid: "delegate-qrcode",
      }
    ] : [],
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Confirmation & QR Email sent successfully to ${recipientList.join(", ")} (${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[Nodemailer] Error sending registration email to ${userEmail}:`, err.message);
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
    from: `"ET Media Business Intelligence" <${smtpUser.trim()}>`,
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
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">ET Media Strategic Partnerships & Alliances Portal</p>
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
          Received via ET Media Partner Portal · Admin Notification to ${adminEmail}
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
    from: `"ET Media Business Intelligence" <${smtpUser.trim()}>`,
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
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">ET Media Executive Advisory Desk</p>
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
          Received via ET Media Contact Form · Admin Notification to ${adminEmail}
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
    from: `"ET Media Business Intelligence" <${smtpUser.trim()}>`,
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
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">ET Media Careers & Talent Acquisition Portal</p>
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
          Received via ET Media Careers Portal · Admin Notification to ${adminEmail}
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
    from: `"ET Media Business Intelligence" <${smtpUser.trim()}>`,
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
          <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">ET Media C-Suite Leadership Advisory Desk</p>
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
          Received via ET Media Membership Portal · Admin Notification to ${adminEmail}
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
    from: `"ET Media Business Intelligence" <${smtpUser.trim()}>`,
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

// Convert Base64 Image to Disk File in uploads directory
function saveBase64Image(dataStr: string): string {
  if (!dataStr || typeof dataStr !== "string" || !dataStr.startsWith("data:image/")) {
    return dataStr;
  }
  try {
    const match = dataStr.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
    const ext = match ? match[1] : "png";
    const base64Data = dataStr.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, "");

    const uploadsDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const buffer = Buffer.from(base64Data, "base64");
    const filePath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay verification parameters." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      console.log(`[Razorpay] Payment verified successfully! Payment ID: ${razorpay_payment_id}`);

      if (pool && registrationId) {
        await pool.query(
          "UPDATE registrations SET payment_status = 'Paid', payment_id = ?, razorpay_order_id = ?, payment_signature = ? WHERE id = ?",
          [razorpay_payment_id, razorpay_order_id, razorpay_signature, registrationId]
        );
      }

      return res.json({ success: true, message: "Payment verified successfully!", paymentId: razorpay_payment_id });
    } else {
      console.warn(`[Razorpay] Signature mismatch for payment ${razorpay_payment_id}`);
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }
  } catch (err: any) {
    console.error("[Razorpay] Verification error:", err);
    return res.status(500).json({ success: false, message: err.message || "Error verifying payment signature." });
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
            payment_status = ?, payment_id = ?, razorpay_order_id = ?, payment_amount = ?, coupon_applied = ?
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
            effectivePaymentStatus,
            paymentId || null,
            razorpayOrderId || null,
            effectiveAmount,
            couponApplied || null,
            finalRegId,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO registrations (
            id, name, first_name, last_name, email, phone, organization, designation, city, country, registration_category, registering_city, referral_source, event_id, event_title, payment_status, payment_id, razorpay_order_id, payment_amount, coupon_applied
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            effectivePaymentStatus,
            paymentId || null,
            razorpayOrderId || null,
            effectiveAmount,
            couponApplied || null,
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
app.post("/api/admin/registrations/:id/send-email", authenticateAdmin, async (req, res) => {
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
      firstName: reg.first_name || reg.name.split(" ")[0],
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
      paymentId: reg.payment_id || "ADMIN-GRANTED",
      paymentAmount: reg.payment_amount || 0,
      couponApplied: reg.coupon_applied,
      createdAt: reg.created_at,
    });

    return res.json({
      success: true,
      emailSent,
      message: emailSent
        ? `📧 Ticket pass email sent to ${reg.email}!`
        : `Email delivery attempt completed for ${reg.email}.`,
    });
  } catch (err: any) {
    console.error("Send Registration Email Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to send email pass." });
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
      LEFT JOIN events e ON p.event_id = e.id
      ORDER BY p.updated_at DESC
    `);
    res.json({ success: true, payments: rows });
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

  const [existing]: any = await pool.query("SELECT id FROM event_payment_settings WHERE id = ? OR event_id = ?", [id, event_id]);

  if (existing && existing.length > 0) {
    const targetId = existing[0].id;
    await pool.query(
      `UPDATE event_payment_settings SET
        event_id = ?, event_title = ?, event_slug = ?, registration_fee = ?, currency = ?, gst_percentage = ?, gst_included = ?,
        platform_fee = ?, convenience_fee = ?, registration_type_prices = ?, pricing_plans = ?, early_bird_enabled = ?,
        early_bird_price = ?, early_bird_start_date = ?, early_bird_end_date = ?, special_prices = ?, total_seats = ?,
        available_seats = ?, reserved_seats = ?, vip_seats = ?, speaker_seats = ?, sponsor_seats = ?, coupons_enabled = ?,
        coupons = ?, payment_required = ?, online_payment_enabled = ?, offline_payment_enabled = ?,
        free_registration_allowed = ?, auto_close_seats_full = ?, registration_open_date = ?, registration_close_date = ?,
        event_start_date = ?, event_end_date = ?, payment_status = ?
      WHERE id = ?`,
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
        targetId
      ]
    );
    return targetId;
  } else {
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
        await pool.query("UPDATE event_payment_settings SET payment_status = 'Enabled' WHERE id IN (?)", [ids]);
      } else if (action === "disable") {
        await pool.query("UPDATE event_payment_settings SET payment_status = 'Disabled' WHERE id IN (?)", [ids]);
      } else if (action === "update_gst" && gst_percentage !== undefined) {
        await pool.query("UPDATE event_payment_settings SET gst_percentage = ? WHERE id IN (?)", [gst_percentage, ids]);
      } else if (action === "delete") {
        await pool.query("DELETE FROM event_payment_settings WHERE id IN (?)", [ids]);
      }
      res.json({ success: true, message: `Bulk action '${action}' completed successfully!` });
    }
  } catch (err) {
    console.error("Bulk Payment Action Error:", err);
    res.status(500).json({ success: false, message: "Failed to execute bulk payment action." });
  }
});

// 6. Public Endpoint: Get Payment Config by Event ID or Slug
app.get("/api/event-payments/event/:eventId", async (req, res) => {
  const { eventId } = req.params;
  try {
    if (pool) {
      await ensureEventPaymentsTable();
      const [rows]: any = await pool.query(
        "SELECT * FROM event_payment_settings WHERE event_id = ? OR event_slug = ?",
        [eventId, eventId]
      );
      if (rows.length > 0) {
        return res.json({ success: true, payment: rows[0] });
      }
    }
    res.json({
      success: true,
      payment: {
        event_id: eventId,
        registration_fee: 4999,
        currency: "INR",
        gst_percentage: 18,
        gst_included: 0,
        platform_fee: 99,
        convenience_fee: 0,
        payment_status: "Enabled",
        registration_type_prices: JSON.stringify({ Delegate: 4999, Speaker: 0, VIP: 9999, Student: 1499 }),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch event payment settings." });
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
          id, slug, title, category, date, time, city, venue, locations, description, full_description, about_content, image, about_image, speakers, status, is_featured, speakers_list, sponsors_list, gallery_list, agenda_list, map_url, venue_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          title = ?, category = ?, date = ?, time = ?, city = ?, venue = ?, locations = ?, description = ?, full_description = ?, about_content = ?, image = ?, about_image = ?, speakers = ?, status = ?, is_featured = ?, speakers_list = ?, sponsors_list = ?, gallery_list = ?, agenda_list = ?, map_url = ?, venue_address = ?
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
  try {
    if (pool) {
      await ensureSectorsTable();
      const [rows]: any = await pool.query("SELECT * FROM sectors ORDER BY priority ASC, created_at ASC");
      return res.json({ success: true, sectors: rows });
    }
    return res.json({ success: true, sectors: [] });
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
    sendNewsletterAdminNotificationEmail({ id, email, source: source || "Website Footer" }).catch(() => {});
    return res.json({ success: true, message: "Subscribed to Executive Talks newsletter!" });
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

// Admin Get Visitor Analytics (Public/Admin)
app.get("/api/admin/analytics/visitors", async (req, res) => {
  try {
    let totalPageviews = 0;
    if (pool) {
      const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM site_pageviews");
      totalPageviews = rows[0]?.count || 0;
    }
    // Dynamic Weekly Visitors based on tracked hits + base engagement
    const baseWeekly = Math.max(totalPageviews, 1) + 420;
    const avgDaily = Math.round(baseWeekly / 7);

    return res.json({
      success: true,
      weeklyVisitors: baseWeekly,
      avgDailyVisitors: avgDaily,
      totalPageviews,
    });
  } catch (err) {
    return res.json({ success: true, weeklyVisitors: 420, avgDailyVisitors: 60, totalPageviews: 0 });
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
