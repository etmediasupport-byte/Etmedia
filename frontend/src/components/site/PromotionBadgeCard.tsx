import React, { useRef, useState, useEffect } from "react";
import {
  Download,
  Share2,
  Upload,
  Calendar,
  MapPin,
  Check,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Linkedin,
  Facebook,
  Instagram,
  RefreshCw,
  Camera,
  QrCode,
  ShieldCheck,
  Award,
  BadgeCheck,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";

export interface PromotionTemplate {
  id: string;
  event_id?: string;
  event_slug?: string;
  title: string;
  theme_style?: string; // "hr-recall-emerald" | "spotlight-center" | "editorial-split" | "prestige-gold-framed" | "cyber-tech-conclave"
  badge_text?: string;
  top_tagline?: string;
  event_heading?: string;
  sub_heading?: string;
  highlights?: string[] | string;
  cta_text?: string;
  date_text?: string;
  venue_text?: string;
  contact_email?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  footer_bg?: string;
  qr_destination_url?: string;
  custom_logo_url?: string;
  is_active?: boolean | number;
}

export interface AttendeeBadgeData {
  id?: string;
  name: string;
  designation?: string;
  organization?: string;
  photo_url?: string;
  event_title?: string;
  event_slug?: string;
  date?: string;
  venue?: string;
  regId?: string;
}

interface PromotionBadgeCardProps {
  template: PromotionTemplate;
  attendee: AttendeeBadgeData;
  onPhotoChange?: (photoUrl: string) => void;
  allowPhotoUpload?: boolean;
  className?: string;
  hideActionButtons?: boolean;
}

export default function PromotionBadgeCard({
  template,
  attendee,
  onPhotoChange,
  allowPhotoUpload = true,
  className = "",
  hideActionButtons = false,
}: PromotionBadgeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);
  const [localPhoto, setLocalPhoto] = useState<string>(attendee.photo_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (attendee.photo_url) {
      setLocalPhoto(attendee.photo_url);
    }
  }, [attendee.photo_url]);

  // Parse highlights
  const highlights: string[] = Array.isArray(template.highlights)
    ? template.highlights
    : typeof template.highlights === "string"
    ? template.highlights.startsWith("[")
      ? JSON.parse(template.highlights || "[]")
      : template.highlights.split(",").map((s) => s.trim()).filter(Boolean)
    : [
        "2000+ HR Pros",
        "50+ Speakers",
        "Awards",
        "Networking",
      ];

  // Dynamic values
  const themeStyle = template.theme_style || "hr-recall-emerald";
  const topTagline = template.top_tagline || "2,000+ HR PROFESSIONALS ONE BIG GATHERING";
  const badgeText = template.badge_text || "I'M ONE OF THE 2,000+";
  const eventHeading = template.event_heading || "AWARDS & CONNECT HR RECALL 2K26";
  const subHeading = template.sub_heading || "Remembering 2026. Calling 2027";
  const ctaText = template.cta_text || "REGISTER NOW";
  const dateText = attendee.date || template.date_text || "11th December 2026";
  const venueText = attendee.venue || template.venue_text || "Gachibowli, Hyderabad";
  const contactEmail = template.contact_email || "registration@executivetalksmedia.in";

  const primaryColor = template.primary_color || "#00A86B";
  const secondaryColor = template.secondary_color || "#0F172A";
  const accentColor = template.accent_color || "#EF4444";
  const footerBg = template.footer_bg || "#064E3B";

  const attendeeName = (attendee.name || "VICTOR KOMAVARAPU").toUpperCase();
  const attendeeDesignation = attendee.designation || "Unit Head – HR(Manager)";
  const attendeeCompany = (attendee.organization || "CARE HOSPITALS").toUpperCase();

  // Dynamic QR destination URL linking directly to the specific event's live registration / details page
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://www.executivetalksmedia.in";

  const dynamicSlug =
    (template.event_slug || "").trim() ||
    (attendee.event_slug || "").trim() ||
    (attendee.event_title
      ? attendee.event_title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : "") ||
    (template.title
      ? template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : "") ||
    "hr-recall-2k26";

  const eventPageUrl = `${origin}/events/${dynamicSlug}`;
  const qrTarget = (template.qr_destination_url || "").trim() || eventPageUrl;

  // Generate QR Code
  useEffect(() => {
    QRCode.toDataURL(qrTarget, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [qrTarget]);

  // Handle Photo File Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLocalPhoto(dataUrl);
        if (onPhotoChange) {
          onPhotoChange(dataUrl);
        }
        toast.success("Photo updated on badge!");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  // Helper to load image for canvas safely without CORS taint or rejection issues
  const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    if (!src) return Promise.resolve(null);
    return new Promise((resolve) => {
      // 1. Data URLs and Blob URLs can be loaded directly with zero CORS issues
      if (src.startsWith("data:") || src.startsWith("blob:")) {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
        return;
      }

      // 2. Fetch as Blob for network and relative URLs to ensure untainted canvas export
      fetch(src, { mode: "cors" })
        .then((res) => {
          if (!res.ok) throw new Error("Fetch failed");
          return res.blob();
        })
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = blobUrl;
        })
        .catch(() => {
          // Fallback to standard Image with crossOrigin anonymous
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => {
            // Last fallback without crossOrigin
            const fallback = new Image();
            fallback.onload = () => resolve(fallback);
            fallback.onerror = () => resolve(null);
            fallback.src = src;
          };
          img.src = src;
        });
    });
  };

  // =========================================================================
  // HIGH-RESOLUTION 1080x1080px (Universal Square Social Media) CANVAS EXPORTER
  // =========================================================================
  const generatePosterBlob = async (): Promise<{ blob: Blob; file: File; dataUri: string } | null> => {
    try {
      setExporting(true);
      const canvas = document.createElement("canvas");
      const W = 1080;
      const H = 1080;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas");

      // Load logo, QR and user photo safely
      const [logoImg, qrImg, photoImg] = await Promise.all([
        loadImage(template.custom_logo_url || executivetalksLogo),
        qrDataUrl ? loadImage(qrDataUrl) : Promise.resolve(null),
        localPhoto ? loadImage(localPhoto) : Promise.resolve(null),
      ]);

      // -----------------------------------------------------------
      // TEMPLATE 1: "hr-recall-emerald" (The Exact Image 2 Reference Layout)
      // -----------------------------------------------------------
      if (themeStyle === "hr-recall-emerald") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, W, H);

        // Top right diagonal polygon (emerald + dark navy)
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(W * 0.45, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, H * 0.82);
        ctx.lineTo(W * 0.62, H * 0.44);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(W * 0.62, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, H * 0.44);
        ctx.closePath();
        ctx.fill();

        // Bottom right emerald triangle accent
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(W * 0.68, H * 0.88);
        ctx.lineTo(W * 0.88, H * 0.74);
        ctx.lineTo(W * 0.88, H * 0.88);
        ctx.closePath();
        ctx.fill();

        // Logo
        if (logoImg) {
          ctx.drawImage(logoImg, 50, 40, 240, 78);
        } else {
          ctx.fillStyle = "#0F172A";
          ctx.font = "bold 32px sans-serif";
          ctx.fillText("Executive Talks", 50, 85);
        }

        // Top Tagline
        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 30px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("2,000+ HR PROFESSIONALS", 50, 165);

        ctx.fillStyle = "#1E1B4B";
        ctx.font = "900 40px sans-serif";
        ctx.fillText("ONE BIG GATHERING", 50, 212);

        // Event Brand Box
        ctx.fillStyle = "#0F172A";
        ctx.font = "800 16px sans-serif";
        ctx.fillText("AWARDS & CONNECT", 50, 275);

        ctx.fillStyle = "#0284C7";
        ctx.font = "900 42px sans-serif";
        ctx.fillText(eventHeading, 50, 325);

        ctx.fillStyle = "#1E293B";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(subHeading, 50, 365);

        // Name, Designation, Company
        const ny = 445;
        ctx.fillStyle = "#0F172A";
        ctx.font = "900 42px sans-serif";
        ctx.fillText(attendeeName, 50, ny);

        ctx.fillStyle = accentColor || "#E11D48";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText(attendeeDesignation, 50, ny + 42);

        ctx.fillStyle = "#1E1B4B";
        ctx.font = "900 28px sans-serif";
        ctx.fillText(attendeeCompany, 50, ny + 82);

        // Bottom Left Action Block: REGISTER NOW + Bullets on left, QR on right!
        const actY = ny + 125;
        // REGISTER NOW button
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(50, actY, 205, 48, 24);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ctaText, 152, actY + 31);

        // Bullets below button
        ctx.fillStyle = "#0F172A";
        ctx.font = "900 21px sans-serif";
        ctx.textAlign = "left";
        let by = actY + 85;
        highlights.slice(0, 4).forEach((h) => {
          ctx.fillText(`• ${h}`, 50, by);
          by += 38;
        });

        // QR Scanner (Sitting right beside bullets!)
        if (qrImg) {
          const qrSize = 175;
          const qrX = 285;
          const qrY = actY + 5;
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        }

        // Right side: HUGE Circular Photo (Right-centered!)
        const cx = W * 0.73;
        const cy = 490;
        const cr = 230; // 460px diameter!

        // Dark outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 10, 0, Math.PI * 2);
        ctx.fillStyle = secondaryColor;
        ctx.fill();

        // White inner ring
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        // Photo draw
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.clip();
        if (photoImg) {
          const asp = photoImg.width / photoImg.height;
          let dw = cr * 2;
          let dh = cr * 2;
          let dx = cx - cr;
          let dy = cy - cr;
          if (asp > 1) {
            dw = cr * 2 * asp;
            dx = cx - dw / 2;
          } else {
            dh = (cr * 2) / asp;
            dy = cy - dh / 2;
          }
          ctx.drawImage(photoImg, dx, dy, dw, dh);
        } else {
          ctx.fillStyle = "#0F172A";
          ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 90px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "E", cx, cy + 30);
        }
        ctx.restore();

        // Badge Pill attached to top-left curve of circle
        const px = cx - 210;
        const py = cy - cr + 12;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(px, py, 260, 46, 23);
        ctx.fill();
        ctx.shadowColor = "transparent";

        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, px + 130, py + 29);

        // Bottom Footer (Generous 160px height, flush to bottom, NEVER cropped)
        const fH = 160;
        const fy = H - fH;
        ctx.fillStyle = footerBg;
        ctx.fillRect(0, fy, W, fH);

        ctx.fillStyle = "#E2E8F0";
        ctx.font = "600 23px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`For queries & registration: ${contactEmail}`, 50, fy + 58);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 25px sans-serif";
        ctx.fillText(`📅 Date: ${dateText}          📍: ${venueText}`, 50, fy + 112);
      }

      // -----------------------------------------------------------
      // TEMPLATE 2: "spotlight-center" (Grand Centered Spotlight)
      // -----------------------------------------------------------
      else if (themeStyle === "spotlight-center") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, W, H);

        // Top arc header
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(0, 0, W, 220);

        // Gold/primary trim line
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 216, W, 8);

        // Logo centered at top
        if (logoImg) {
          ctx.drawImage(logoImg, W / 2 - 110, 25, 220, 70);
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(topTagline, W / 2, 145);

        ctx.fillStyle = primaryColor;
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(eventHeading, W / 2, 185);

        // Centered Hero Photo with Glowing Gold Halo
        const cx = W / 2;
        const cy = 410;
        const cr = 150;

        ctx.beginPath();
        ctx.arc(cx, cy, cr + 12, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, cr + 6, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.clip();
        if (photoImg) {
          ctx.drawImage(photoImg, cx - cr, cy - cr, cr * 2, cr * 2);
        } else {
          ctx.fillStyle = "#0F172A";
          ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 90px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "E", cx, cy + 30);
        }
        ctx.restore();

        // Floating Pill below photo
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.roundRect(W / 2 - 140, cy + cr - 15, 280, 44, 22);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, W / 2, cy + cr + 14);

        // Centered Name, Desig, Company
        ctx.fillStyle = "#0F172A";
        ctx.font = "900 44px sans-serif";
        ctx.fillText(attendeeName, W / 2, 635);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 26px sans-serif";
        ctx.fillText(attendeeDesignation, W / 2, 675);

        ctx.fillStyle = "#475569";
        ctx.font = "900 28px sans-serif";
        ctx.fillText(attendeeCompany, W / 2, 715);

        // Bottom Split Boxes: Fits within canvas, never overlaps footer
        // Left Box: Highlights
        ctx.fillStyle = "#F8FAFC";
        ctx.beginPath();
        ctx.roundRect(60, 735, 465, 175, 18);
        ctx.fill();
        ctx.strokeStyle = "#E2E8F0";
        ctx.stroke();

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 20px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("SUMMIT HIGHLIGHTS", 85, 775);
        let sy = 810;
        highlights.slice(0, 3).forEach((h) => {
          ctx.font = "bold 17px sans-serif";
          ctx.fillStyle = "#334155";
          ctx.fillText(`✓  ${h}`, 85, sy);
          sy += 30;
        });

        // Right Box: QR Code & CTA
        ctx.fillStyle = "#F8FAFC";
        ctx.beginPath();
        ctx.roundRect(555, 735, 465, 175, 18);
        ctx.fill();
        ctx.strokeStyle = "#E2E8F0";
        ctx.stroke();

        if (qrImg) {
          ctx.drawImage(qrImg, 575, 750, 145, 145);
        }

        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(735, 775, 265, 46, 23);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ctaText, 868, 805);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("Scan to register / check in", 868, 850);

        // Footer Strip (Flush to bottom, never cropped)
        const fH = 150;
        const fy = H - fH;
        ctx.fillStyle = footerBg;
        ctx.fillRect(0, fy, W, fH);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 23px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`📅 ${dateText}   |   📍 ${venueText}   |   ✉️ ${contactEmail}`, W / 2, fy + 85);
      }

      // -----------------------------------------------------------
      // TEMPLATE 3: "editorial-split" (Forbes/Magazine Keynote Column)
      // -----------------------------------------------------------
      else if (themeStyle === "editorial-split") {
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(0, 0, W, H);

        // Left Column (Photo Card)
        ctx.fillStyle = "#1E293B";
        ctx.beginPath();
        ctx.roundRect(50, 50, 440, H - 100, 24);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(50, 50, 440, H - 100, 24);
        ctx.clip();
        if (photoImg) {
          ctx.drawImage(photoImg, 50, 50, 440, H - 100);
        } else {
          ctx.fillStyle = "#0B0F19";
          ctx.fillRect(50, 50, 440, H - 100);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 100px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "E", 270, H / 2);
        }

        // Overlay gradient at bottom of photo
        const grad = ctx.createLinearGradient(0, H - 350, 0, H - 50);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, "rgba(15,23,42,0.95)");
        ctx.fillStyle = grad;
        ctx.fillRect(50, H - 350, 440, 300);

        // Pill on photo
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(80, H - 140, 380, 50, 25);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, 270, H - 108);

        ctx.restore();

        // Right Column (White Card Details)
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(510, 50, 520, H - 100, 24);
        ctx.fill();

        // Right content
        if (logoImg) {
          ctx.drawImage(logoImg, 550, 90, 200, 65);
        }

        ctx.fillStyle = primaryColor;
        ctx.font = "900 16px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("OFFICIAL DELEGATE CREDENTIAL", 550, 200);

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 36px sans-serif";
        ctx.fillText(topTagline, 550, 245);

        ctx.fillStyle = "#0284C7";
        ctx.font = "900 32px sans-serif";
        ctx.fillText(eventHeading, 550, 320);

        ctx.fillStyle = "#64748B";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(subHeading, 550, 360);

        // Attendee Name
        ctx.fillStyle = "#0F172A";
        ctx.font = "900 40px sans-serif";
        ctx.fillText(attendeeName, 550, 450);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(attendeeDesignation, 550, 490);

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 26px sans-serif";
        ctx.fillText(attendeeCompany, 550, 530);

        // QR Code & Highlights Box
        ctx.fillStyle = "#F1F5F9";
        ctx.beginPath();
        ctx.roundRect(550, 580, 440, 260, 16);
        ctx.fill();

        if (qrImg) {
          ctx.drawImage(qrImg, 570, 610, 190, 190);
        }

        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(ctaText, 780, 635);

        let ey = 675;
        highlights.forEach((h) => {
          ctx.font = "600 16px sans-serif";
          ctx.fillStyle = "#334155";
          ctx.fillText(`• ${h}`, 780, ey);
          ey += 32;
        });

        // Bottom right footer inside card
        ctx.fillStyle = footerBg;
        ctx.beginPath();
        ctx.roundRect(550, 870, 440, 120, 16);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`📅 ${dateText}`, 575, 915);
        ctx.fillText(`📍 ${venueText}`, 575, 950);
        ctx.font = "600 15px sans-serif";
        ctx.fillStyle = "#CBD5E1";
        ctx.fillText(`✉️ ${contactEmail}`, 575, 980);
      }

      // -----------------------------------------------------------
      // TEMPLATE 4: "prestige-gold-framed" (Luxury Gold Obsidian)
      // -----------------------------------------------------------
      else if (themeStyle === "prestige-gold-framed") {
        ctx.fillStyle = "#090D16";
        ctx.fillRect(0, 0, W, H);

        // Double Gold Border
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, W - 60, H - 60);

        ctx.strokeStyle = "rgba(212,175,55,0.4)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(42, 42, W - 84, H - 84);

        // Header Crest
        if (logoImg) {
          ctx.drawImage(logoImg, W / 2 - 110, 65, 220, 70);
        }

        ctx.fillStyle = primaryColor;
        ctx.font = "900 24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(topTagline, W / 2, 175);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 36px sans-serif";
        ctx.fillText(eventHeading, W / 2, 225);

        // Left photo card + Right Details
        const px = 100;
        const py = 290;
        const pw = 340;
        const ph = 400;

        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(px, py, pw, ph);

        ctx.save();
        ctx.beginPath();
        ctx.rect(px + 4, py + 4, pw - 8, ph - 8);
        ctx.clip();
        if (photoImg) {
          ctx.drawImage(photoImg, px + 4, py + 4, pw - 8, ph - 8);
        } else {
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 80px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "E", px + pw / 2, py + ph / 2);
        }
        ctx.restore();

        // VIP Pill over Photo
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(px + 30, py + ph - 25, pw - 60, 46, 23);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "900 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, px + pw / 2, py + ph + 5);

        // Right details
        ctx.textAlign = "left";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 42px sans-serif";
        ctx.fillText(attendeeName, 490, 350);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 26px sans-serif";
        ctx.fillText(attendeeDesignation, 490, 395);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "900 28px sans-serif";
        ctx.fillText(attendeeCompany, 490, 440);

        // Highlights
        let hy = 500;
        highlights.forEach((h) => {
          ctx.fillStyle = primaryColor;
          ctx.font = "bold 20px sans-serif";
          ctx.fillText("✦", 490, hy);
          ctx.fillStyle = "#E2E8F0";
          ctx.fillText(h, 520, hy);
          hy += 38;
        });

        // Bottom QR Section
        if (qrImg) {
          ctx.drawImage(qrImg, 100, 750, 180, 180);
        }

        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(320, 780, 260, 50, 25);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "900 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ctaText, 450, 812);

        // Bottom Gold Footer
        ctx.fillStyle = footerBg;
        ctx.fillRect(42, H - 140, W - 84, 80);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`📅 ${dateText}   •   📍 ${venueText}   •   ✉️ ${contactEmail}`, W / 2, H - 95);
      }

      // -----------------------------------------------------------
      // TEMPLATE: "hr-recall-purple" (The Exact 1st Image Model)
      // -----------------------------------------------------------
      else if (themeStyle === "hr-recall-purple") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, W, H);

        // Top Right Logo
        if (logoImg) {
          ctx.drawImage(logoImg, W - 320, 35, 270, 85);
        } else {
          ctx.fillStyle = "#0F172A";
          ctx.font = "bold 32px sans-serif";
          ctx.fillText("Executive Talks", W - 280, 85);
        }

        // Top Left: ONE BIG GATHERING / 2,000+ HR PROFESSIONALS
        ctx.textAlign = "left";
        ctx.fillStyle = primaryColor || "#200E4B";
        ctx.font = "900 48px sans-serif";
        ctx.fillText("ONE BIG GATHERING", 50, 135);

        ctx.fillStyle = "#1E293B";
        ctx.font = "bold 40px sans-serif";
        ctx.fillText("2,000+ HR PROFESSIONALS", 50, 195);

        // "I'm Attending" Vibrant Blue Pill Badge
        const attendingText = "I'm Attending";
        ctx.fillStyle = secondaryColor || "#0D6EFD";
        ctx.beginPath();
        ctx.roundRect(50, 230, 410, 68, 16);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(attendingText, 255, 277);

        // Event Brand Lockup: AWARDS & CONNECT / HR RECALL 2K26
        ctx.textAlign = "left";
        ctx.fillStyle = "#0F172A";
        ctx.font = "800 20px sans-serif";
        ctx.fillText("AWARDS & CONNECT", 180, 340);

        ctx.strokeStyle = "#0084FF";
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 355, 420, 90);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(52, 357, 416, 86);

        ctx.font = "900 58px sans-serif";
        ctx.fillStyle = "#0084FF";
        ctx.fillText("HR", 60, 420);
        ctx.fillStyle = "#0A1931";
        ctx.fillText("RECALL", 165, 420);
        ctx.fillStyle = "#0084FF";
        ctx.font = "900 48px sans-serif";
        ctx.fillText("2K26", 360, 448);

        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 19px sans-serif";
        ctx.fillText("Remembering 2026. ", 110, 485);
        ctx.fillStyle = "#0084FF";
        ctx.fillText("Calling 2027", 300, 485);

        // Center-Right Circular Avatar with Purple Ring, Red Accents & Dashed Orbit
        const cx = 745;
        const cy = 410;
        const cr = 205; // Inner photo radius

        // Outer Purple Ring
        ctx.beginPath();
        ctx.arc(cx, cy, 236, 0, Math.PI * 2);
        ctx.lineWidth = 44;
        ctx.strokeStyle = primaryColor || "#28107A";
        ctx.stroke();

        // Coral/Red triangular wedge accents on perimeter
        ctx.fillStyle = accentColor || "#EF4444";
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy - 225);
        ctx.lineTo(cx + 80, cy - 250);
        ctx.lineTo(cx + 40, cy - 210);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx - 55, cy + 225);
        ctx.lineTo(cx - 55, cy + 270);
        ctx.lineTo(cx + 40, cy + 230);
        ctx.closePath();
        ctx.fill();

        // White dashed circle orbit inside purple ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 236, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.setLineDash([12, 10]);
        ctx.stroke();
        ctx.restore();

        // Inner delegate photo
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.clip();
        if (photoImg) {
          ctx.drawImage(photoImg, cx - cr, cy - cr, cr * 2, cr * 2);
        } else {
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 95px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "M", cx, cy + 30);
        }
        ctx.restore();

        // Details below circular photo
        ctx.textAlign = "center";
        // Name in Forest Green
        ctx.fillStyle = "#1B4332";
        ctx.font = "900 48px sans-serif";
        ctx.fillText(attendeeName, cx, 685);

        // Designation in Dark Gray
        ctx.fillStyle = "#1E293B";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText(attendeeDesignation, cx, 735);

        // Organization in Royal Blue
        ctx.fillStyle = "#2563EB";
        ctx.font = "900 28px sans-serif";
        ctx.fillText(attendeeCompany, cx, 775);

        // Bottom Left: REGISTER NOW button, QR Code & 4 Bullets
        ctx.fillStyle = secondaryColor || "#0D6EFD";
        ctx.beginPath();
        ctx.roundRect(50, 560, 220, 54, 27);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 23px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("REGISTER NOW", 160, 595);

        // QR Code
        if (qrImg) {
          ctx.drawImage(qrImg, 50, 635, 190, 190);
        }

        // 4 Bullets beside QR
        ctx.textAlign = "left";
        ctx.font = "italic bold 28px sans-serif";
        ctx.fillStyle = "#1E1B4B";
        const bulletItems = highlights.length > 0 ? highlights.slice(0, 4) : ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"];
        bulletItems.forEach((b, idx) => {
          ctx.fillText(`• ${b}`, 265, 685 + idx * 38);
        });

        // Bottom Full-Width Footer Bar (160px height, flush to bottom, NEVER cropped)
        const fH = 160;
        const fy = H - fH;
        ctx.fillStyle = footerBg || "#28107A";
        ctx.fillRect(0, fy, W, fH);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "500 25px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`For queries & registration: ${contactEmail}`, 50, fy + 58);

        ctx.font = "bold 25px sans-serif";
        ctx.fillText(`Date: ${dateText}`, 50, fy + 115);

        ctx.fillStyle = "#FF4B4B";
        ctx.fillText(`📍:`, 620, fy + 115);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(` ${venueText}`, 660, fy + 115);
      }

      // -----------------------------------------------------------
      // TEMPLATE: "dark-ruby-spotlight" (The Exact 2nd Image Model)
      // -----------------------------------------------------------
      else if (themeStyle === "dark-ruby-spotlight") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, W, H);

        // Sweeping glowing ruby red metallic spotlight on the right
        const grad = ctx.createRadialGradient(W * 0.95, H * 0.15, 60, W * 0.95, H * 0.15, 880);
        grad.addColorStop(0, "#C52222");
        grad.addColorStop(0.25, "#8B1010");
        grad.addColorStop(0.5, "#450A0A");
        grad.addColorStop(0.75, "#180305");
        grad.addColorStop(1, "#000000");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Top Left Logo Card
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(40, 45, 305, 115, 20);
        ctx.fill();

        if (logoImg) {
          ctx.drawImage(logoImg, 45, 55, 295, 95);
        } else {
          ctx.fillStyle = "#0F172A";
          ctx.font = "bold 32px sans-serif";
          ctx.fillText("Executive Talks", 60, 110);
        }

        // Center circular delegate photo
        const cx = W / 2;
        const cy = 440;
        const cr = 225; // radius

        // Glowing ruby thin rim
        ctx.save();
        ctx.shadowColor = "#EF4444";
        ctx.shadowBlur = 45;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Photo clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.clip();
        if (photoImg) {
          ctx.drawImage(photoImg, cx - cr, cy - cr, cr * 2, cr * 2);
        } else {
          ctx.fillStyle = "#1F2937";
          ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 95px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "B", cx, cy + 30);
        }
        ctx.restore();

        // Below Circle: Large Bold White Name (e.g. Benjamin Shah)
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 64px sans-serif";
        ctx.fillText(attendeeName, cx, 765);

        // Dark Ruby Pill Capsule Badge for Designation (e.g. Marketing Lead)
        const desigText = attendeeDesignation || "Executive Leader";
        ctx.font = "bold 32px sans-serif";
        const textWidth = ctx.measureText(desigText).width;
        const pillW = Math.max(textWidth + 80, 260);
        const pillH = 70;
        const pillX = cx - pillW / 2;
        const pillY = 800;

        ctx.fillStyle = "rgba(42, 8, 12, 0.85)";
        ctx.strokeStyle = "rgba(185, 28, 28, 0.8)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#F87171"; // soft coral / salmon
        ctx.fillText(desigText, cx, pillY + 46);

        // Organization if present
        if (attendeeCompany) {
          ctx.fillStyle = "#94A3B8";
          ctx.font = "900 24px sans-serif";
          ctx.fillText(attendeeCompany, cx, 915);
        }
      }

      // -----------------------------------------------------------
      // TEMPLATE 5: "cyber-tech-conclave" (Electric Cyan Tech Conclave)
      // -----------------------------------------------------------
      else {
        // Dark Tech Conclave
        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, W, H);

        // Tech grid lines or corner accents
        ctx.strokeStyle = "rgba(6,182,212,0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, W - 80, H - 80);

        // Top Banner
        if (logoImg) {
          ctx.drawImage(logoImg, 60, 60, 220, 70);
        }

        ctx.fillStyle = primaryColor;
        ctx.font = "900 20px monospace";
        ctx.textAlign = "left";
        ctx.fillText("[ OFFICIAL ATTENDEE BADGE ]", 60, 180);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 40px sans-serif";
        ctx.fillText(topTagline, 60, 230);

        ctx.fillStyle = "#38BDF8";
        ctx.font = "900 36px sans-serif";
        ctx.fillText(eventHeading, 60, 280);

        // Hex / Circular Cyber Photo
        const cx = W * 0.76;
        const cy = 460;
        const cr = 180;

        // Glowing cyan ring
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 10, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, cr + 4, 0, Math.PI * 2);
        ctx.fillStyle = "#030712";
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.clip();
        if (photoImg) {
          ctx.drawImage(photoImg, cx - cr, cy - cr, cr * 2, cr * 2);
        } else {
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 80px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "E", cx, cy + 25);
        }
        ctx.restore();

        // Cyber Badge Pill
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(cx - 130, cy + cr - 20, 260, 44, 10);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "900 17px monospace";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, cx, cy + cr + 8);

        // Attendee Details on Left
        ctx.textAlign = "left";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 44px sans-serif";
        ctx.fillText(attendeeName, 60, 390);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 26px sans-serif";
        ctx.fillText(attendeeDesignation, 60, 435);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "900 28px sans-serif";
        ctx.fillText(attendeeCompany, 60, 475);

        // Tech Bullet Tags
        let by = 550;
        highlights.forEach((h) => {
          ctx.fillStyle = "rgba(6,182,212,0.15)";
          ctx.beginPath();
          ctx.roundRect(60, by, 380, 40, 8);
          ctx.fill();
          ctx.strokeStyle = "rgba(6,182,212,0.4)";
          ctx.stroke();

          ctx.fillStyle = "#38BDF8";
          ctx.font = "bold 18px monospace";
          ctx.fillText(`> ${h}`, 80, by + 26);
          by += 50;
        });

        // Bottom QR Section
        if (qrImg) {
          ctx.drawImage(qrImg, 60, 780, 160, 160);
        }

        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(250, 820, 240, 50, 10);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "900 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ctaText, 370, 853);

        // Footer
        ctx.fillStyle = footerBg;
        ctx.fillRect(40, H * 0.90, W - 80, H * 0.08);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`📅 ${dateText}   |   📍 ${venueText}   |   ✉️ ${contactEmail}`, W / 2, H * 0.95);
      }

      // Create Blob & File with high reliability
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const safeName = attendeeName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "attendee";
          const fileName = `ETMedia-Promotion-Badge-${safeName}.png`;
          const file = new File([blob], fileName, { type: "image/png" });
          const dataUri = canvas.toDataURL("image/png");
          resolve({ blob, file, dataUri });
        }, "image/png");
      });
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error("Failed to generate download image: " + err.message);
      return null;
    } finally {
      setExporting(false);
    }
  };

  // Universal Download Handler with URL.createObjectURL for 100% mobile & desktop reliability
  const handleDownloadImage = async () => {
    const res = await generatePosterBlob();
    if (!res) return null;

    const objectUrl = URL.createObjectURL(res.blob);
    const downloadLink = document.createElement("a");
    downloadLink.download = res.file.name;
    downloadLink.href = objectUrl;
    downloadLink.target = "_blank";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => {
      try {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(objectUrl);
      } catch (e) {}
    }, 2000);

    toast.success("Official Social Media Poster (1080×1080 PNG) downloaded successfully!");
    return res;
  };

  // Social Sharing Handlers (Auto-downloads poster & supports native Web Share with image attachment)
  const handleShareWhatsApp = async () => {
    const poster = await handleDownloadImage();
    const text = `🎉 Excited to announce that I am attending ${attendee.event_title || template.event_heading || "HR RECALL 2K26"} hosted by Executive Talks Media!\n\n📅 Date: ${dateText}\n📍 Venue: ${venueText}\n\nJoin me & 2,000+ HR Leaders:\n${qrTarget}`;

    if (poster && navigator.canShare && navigator.canShare({ files: [poster.file] })) {
      try {
        await navigator.share({
          title: "Official Delegate Poster",
          text: text,
          files: [poster.file],
        });
        return;
      } catch (e) {}
    }
    toast.success("Poster downloaded! Attach the downloaded poster to your WhatsApp status or chat.", { duration: 5000 });
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareLinkedIn = async () => {
    const poster = await handleDownloadImage();
    const caption = `Excited to announce that I'm attending ${attendee.event_title || template.event_heading || "HR RECALL 2K26"} hosted by Executive Talks Media! 🚀\n\n📅 Date: ${dateText}\n📍 Venue: ${venueText}\n\nJoin 2,000+ HR leaders at the summit: ${qrTarget}\n\n#ExecutiveTalks #HRRecall2k26 #Leadership #Summit #Networking #CorporateAwards`;

    if (poster && navigator.canShare && navigator.canShare({ files: [poster.file] })) {
      try {
        await navigator.share({
          title: "Official Delegate Poster",
          text: caption,
          files: [poster.file],
        });
        return;
      } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Poster downloaded & caption copied! Attach the downloaded poster to your LinkedIn post.", { duration: 5000 });
    } catch {
      toast.success("Poster downloaded! Ready to share on LinkedIn.", { duration: 4000 });
    }
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(caption)}`, "_blank");
  };

  const handleShareFacebook = async () => {
    const poster = await handleDownloadImage();
    if (poster && navigator.canShare && navigator.canShare({ files: [poster.file] })) {
      try {
        await navigator.share({
          title: "Official Delegate Poster",
          text: `Attending ${attendee.event_title || template.event_heading} - Executive Talks Media! ${qrTarget}`,
          files: [poster.file],
        });
        return;
      } catch (e) {}
    }
    toast.success("Poster downloaded! Attach the poster to your Facebook post or story.", { duration: 5000 });
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(qrTarget)}`, "_blank");
  };

  const handleShareX = async () => {
    const poster = await handleDownloadImage();
    const text = `🎉 Excited to announce that I'm attending ${attendee.event_title || template.event_heading || "HR RECALL 2K26"} by Executive Talks Media! 🚀 ${qrTarget}`;
    if (poster && navigator.canShare && navigator.canShare({ files: [poster.file] })) {
      try {
        await navigator.share({
          title: "Official Delegate Poster",
          text: text,
          files: [poster.file],
        });
        return;
      } catch (e) {}
    }
    toast.success("Poster downloaded! Attach the downloaded poster to your X post.", { duration: 5000 });
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareInstagram = async () => {
    const poster = await handleDownloadImage();
    const caption = `Excited to announce that I'm attending ${attendee.event_title || template.event_heading || "HR RECALL 2K26"} hosted by Executive Talks Media! 🚀\n\n📅 Date: ${dateText}\n📍 Venue: ${venueText}\n\nJoin 2,000+ HR leaders at the summit: ${qrTarget}\n\n#ExecutiveTalks #HRRecall2k26 #Leadership #Summit #Networking #CorporateAwards`;

    if (poster && navigator.canShare && navigator.canShare({ files: [poster.file] })) {
      try {
        await navigator.share({
          title: "Official Delegate Poster",
          text: caption,
          files: [poster.file],
        });
        return;
      } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Poster downloaded & caption copied! Upload the downloaded poster to your Instagram post or story.", {
        duration: 5000,
      });
    } catch {
      toast.success("Poster downloaded! Ready to share on Instagram.", { duration: 4000 });
    }
    window.open("https://www.instagram.com/", "_blank");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ============================================================== */}
      {/* 1. VISUAL SQUARE SOCIAL BADGE POSTER (1:1 / 1080x1080 Zero Gaps) */}
      {/* ============================================================== */}
      <div
        id="promotion-badge-container"
        className="relative w-full aspect-square max-w-[540px] sm:max-w-[580px] mx-auto rounded-2xl shadow-2xl overflow-hidden font-sans select-none border border-slate-300 bg-white flex flex-col"
        style={{
          boxShadow: "0 20px 45px -10px rgba(0,0,0,0.22)",
        }}
      >
        {/* ========================================================= */}
        {/* LAYOUT 1: HR RECALL GEOMETRIC CHEVRON (Exact Match)       */}
        {/* ========================================================= */}
        {themeStyle === "hr-recall-emerald" && (
          <div className="relative w-full h-full bg-white flex flex-col justify-between overflow-hidden">
            {/* Top-right Angular Chevron Geometry (Exact Match with Image 2) */}
            <div
              className="absolute top-0 right-0 w-[55%] h-[55%] pointer-events-none z-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 58%, ${secondaryColor} 58%, ${secondaryColor} 100%)`,
                clipPath: "polygon(18% 0, 100% 0, 100% 82%, 48% 45%)",
              }}
            />
            <div
              className="absolute bottom-[9%] right-[10%] w-[25%] h-[18%] pointer-events-none opacity-90 z-0"
              style={{
                background: primaryColor,
                clipPath: "polygon(35% 100%, 100% 15%, 100% 100%)",
              }}
            />

            {/* Main 2-Column Content Grid: Snug, Filled, Zero Dead Space */}
            <div className="relative z-10 px-3.5 sm:px-5 pt-3 pb-1 grid grid-cols-12 gap-2 flex-1 min-h-0 items-center overflow-hidden">
              {/* Left Column: Brand, Attendee & Side-by-Side Action Row */}
              <div className="col-span-7 flex flex-col justify-between h-full pr-1 py-1 space-y-1.5 overflow-hidden">
                {/* 1. Logo */}
                <div className="inline-block self-start">
                  <img
                    src={template.custom_logo_url || executivetalksLogo}
                    alt="Executive Talks"
                    className="h-9 sm:h-12 md:h-14 w-auto object-contain"
                  />
                </div>

                {/* 2. Top Tagline */}
                <div className="space-y-0.5">
                  <h2 className="text-xs sm:text-base font-extrabold text-slate-900 leading-tight tracking-tight uppercase">
                    2,000+ HR PROFESSIONALS
                  </h2>
                  <h2 className="text-sm sm:text-xl md:text-2xl font-black text-[#1E1B4B] leading-none tracking-tight uppercase">
                    ONE BIG GATHERING
                  </h2>
                </div>

                {/* 3. Event Brand Box */}
                <div className="space-y-0.5 border-l-3 border-sky-500 pl-2">
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-800 block">
                    AWARDS & CONNECT
                  </span>
                  <h3 className="text-sm sm:text-xl font-black text-sky-600 uppercase tracking-tight leading-tight font-display">
                    {eventHeading}
                  </h3>
                  <p className="text-[8px] sm:text-[10.5px] font-bold text-slate-600 tracking-tight">
                    {subHeading}
                  </p>
                </div>

                {/* 4. Attendee Name, Designation, Company */}
                <div className="space-y-0.5 pt-0.5">
                  <h4 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 uppercase font-display leading-tight truncate">
                    {attendeeName}
                  </h4>
                  <p
                    className="text-[10px] sm:text-xs md:text-sm font-bold leading-tight truncate"
                    style={{ color: accentColor || "#E11D48" }}
                  >
                    {attendeeDesignation}
                  </p>
                  <p className="text-[9.5px] sm:text-xs md:text-sm font-black text-[#1E1B4B] uppercase tracking-tight leading-tight truncate">
                    {attendeeCompany}
                  </p>
                </div>

                {/* 5. Bottom Action Area: REGISTER NOW + Bullets on left, QR Code beside it! */}
                <div className="flex items-center gap-2 sm:gap-3 pt-0.5">
                  <div className="space-y-1 shrink-0">
                    <div
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8.5px] sm:text-[10.5px] font-black uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {ctaText}
                    </div>
                    <div className="space-y-0.5 text-[8px] sm:text-[9.5px] font-black text-slate-900">
                      {highlights.slice(0, 4).map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 leading-tight">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QR Code Scanner */}
                  <a
                    href={qrTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Scan or click to open: ${qrTarget}`}
                    className="flex flex-col items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Scanner"
                        className="w-16 h-16 sm:w-22 sm:h-22 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-22 sm:h-22 bg-slate-100 animate-pulse rounded-lg" />
                    )}
                  </a>
                </div>
              </div>

              {/* Right Column: HUGE Circular Photo (Right-Centered!) */}
              <div className="col-span-5 flex flex-col items-center justify-center h-full relative">
                {/* Floating Pill on Top-Left of Circle */}
                <div className="absolute top-[6%] -left-2 sm:-left-3 z-20 bg-white border border-slate-300 shadow-md rounded-full px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-wide text-slate-900 whitespace-nowrap">
                  {badgeText}
                </div>

                {/* HUGE Circular Photo */}
                <div
                  className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-46 md:h-46 rounded-full border-4 sm:border-5 border-[#0F172A] shadow-2xl overflow-hidden bg-slate-900 flex items-center justify-center group shrink-0"
                  style={{
                    boxShadow: "0 15px 35px -5px rgba(0,0,0,0.35)",
                  }}
                >
                  {localPhoto ? (
                    <img
                      src={localPhoto}
                      alt={attendeeName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white space-y-0.5">
                      <span className="text-3xl sm:text-5xl font-black font-display">
                        {attendeeName.charAt(0) || "E"}
                      </span>
                      <span className="text-[7px] sm:text-[8.5px] text-slate-300 uppercase tracking-widest font-mono">
                        Delegate
                      </span>
                    </div>
                  )}

                  {allowPhotoUpload && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[8px] sm:text-[9.5px] font-bold transition-all cursor-pointer backdrop-blur-xs"
                    >
                      <Camera className="w-3.5 h-3.5 mb-0.5 text-cyan-400" />
                      <span>Change Photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Green Footer Strip - Flush to Bottom, 100% Fully Visible */}
            <div
              className="shrink-0 w-full z-20 py-2 sm:py-2.5 px-3.5 sm:px-5 text-white text-[8px] sm:text-[10px] font-semibold flex flex-col justify-center space-y-0.5 shadow-md mt-auto"
              style={{ backgroundColor: footerBg }}
            >
              <p className="text-slate-200 truncate">
                For queries & registration: <span className="text-white font-bold">{contactEmail}</span>
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-white font-bold text-[8px] sm:text-[9.5px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-300 shrink-0" /> Date: {dateText}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-300 shrink-0" /> {venueText}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* LAYOUT 2: SPOTLIGHT CENTER (Centered VIP Arc & Halo)       */}
        {/* ========================================================= */}
        {themeStyle === "spotlight-center" && (
          <div className="relative w-full h-full bg-white flex flex-col justify-between overflow-hidden select-none">
            {/* Top Arc Header */}
            <div
              className="py-2.5 sm:py-3 px-4 sm:px-5 text-white flex flex-col items-center text-center space-y-1 shrink-0"
              style={{ backgroundColor: secondaryColor }}
            >
              <div className="bg-white p-1 rounded-xl shadow-md inline-block">
                <img src={template.custom_logo_url || executivetalksLogo} alt="Logo" className="h-8 sm:h-11 w-auto object-contain" />
              </div>
              <h2 className="text-[11px] sm:text-sm font-black uppercase tracking-wide">
                {topTagline}
              </h2>
              <p className="text-[9.5px] sm:text-xs font-extrabold" style={{ color: primaryColor }}>
                {eventHeading}
              </p>
            </div>
            <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: primaryColor }} />

            {/* Centered Photo & Details */}
            <div className="p-2 sm:p-3 flex flex-col items-center text-center space-y-1.5 flex-1 min-h-0 overflow-hidden my-auto">
              <div
                className="relative w-26 h-26 sm:w-34 sm:h-34 md:w-38 md:h-38 rounded-full border-3 sm:border-4 border-white shadow-xl overflow-hidden bg-slate-900 group shrink-0"
                style={{ outline: `3px solid ${primaryColor}` }}
              >
                {localPhoto ? (
                  <img src={localPhoto} alt={attendeeName} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-3xl sm:text-5xl font-black">
                    {attendeeName.charAt(0) || "E"}
                  </div>
                )}
                {allowPhotoUpload && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-cyan-400 mb-0.5" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {/* Centered Pill */}
              <div
                className="px-3.5 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-black uppercase text-white shadow-xs shrink-0"
                style={{ backgroundColor: secondaryColor }}
              >
                {badgeText}
              </div>

              <h4 className="text-sm sm:text-xl font-black text-slate-900 uppercase font-display leading-tight truncate max-w-full">
                {attendeeName}
              </h4>
              <p className="text-[10px] sm:text-xs font-bold -mt-0.5 truncate max-w-full" style={{ color: accentColor }}>
                {attendeeDesignation}
              </p>
              <p className="text-[9px] sm:text-[11px] font-black text-slate-600 uppercase truncate max-w-full">
                {attendeeCompany}
              </p>

              {/* Split Highlights & QR Box */}
              <div className="grid grid-cols-2 gap-2 w-full pt-0.5">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-left text-[8px] sm:text-[9.5px]">
                  <span className="font-black text-slate-900 block mb-0.5">HIGHLIGHTS</span>
                  {highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="text-slate-700 font-bold leading-tight truncate">✓ {h}</div>
                  ))}
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                  {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-10 h-10 sm:w-13 sm:h-13 object-contain shrink-0" />}
                  <div className="text-left min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 block leading-tight truncate">{ctaText}</span>
                    <span className="text-[7.5px] sm:text-[8px] text-slate-500 block truncate">Scan to check in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 w-full py-2 sm:py-2.5 px-4 text-white text-[8px] sm:text-[10px] text-center font-bold mt-auto" style={{ backgroundColor: footerBg }}>
              📅 {dateText}  •  📍 {venueText}  •  ✉️ {contactEmail}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LAYOUT 3: EDITORIAL SPLIT (Forbes / Magazine Column)      */}
        {/* ========================================================= */}
        {themeStyle === "editorial-split" && (
          <div className="relative w-full h-full bg-slate-950 p-3 sm:p-4 flex gap-3">
            {/* Left 45% Photo Column */}
            <div className="w-[45%] h-full rounded-2xl overflow-hidden relative bg-slate-900 shadow-md group">
              {localPhoto ? (
                <img src={localPhoto} alt={attendeeName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-white text-4xl font-black">
                  {attendeeName.charAt(0) || "E"}
                </div>
              )}

              {/* Bottom Badge Pill on Photo */}
              <div
                className="absolute bottom-3 inset-x-2 py-1 px-2 rounded-xl text-white text-[8px] sm:text-[9px] font-black uppercase text-center shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {badgeText}
              </div>

              {allowPhotoUpload && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Update</span>
                </button>
              )}
            </div>

            {/* Right 55% Card */}
            <div className="w-[55%] h-full bg-white rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="bg-slate-50 p-1 rounded-md inline-block">
                  <img src={template.custom_logo_url || executivetalksLogo} alt="Logo" className="h-6 w-auto" />
                </div>
                <div>
                  <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider block" style={{ color: primaryColor }}>
                    OFFICIAL DELEGATE
                  </span>
                  <h3 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase leading-tight">
                    {eventHeading}
                  </h3>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase truncate">
                    {attendeeName}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] font-bold" style={{ color: accentColor }}>
                    {attendeeDesignation}
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-700 uppercase">
                    {attendeeCompany}
                  </p>
                </div>
              </div>

              {/* QR and Bullet Card */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-10 h-10 object-contain" />}
                <div className="text-[8px] text-slate-700 font-bold">
                  {highlights.slice(0, 2).map((h, i) => (
                    <div key={i}>• {h}</div>
                  ))}
                </div>
              </div>

              {/* Footer strip in card */}
              <div className="p-2 rounded-xl text-white text-[8px] shrink-0 mt-auto" style={{ backgroundColor: footerBg }}>
                <div className="font-bold truncate">📅 {dateText}</div>
                <div className="font-bold truncate">📍 {venueText}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LAYOUT 4: PRESTIGE GOLD FRAMED (Luxury Obsidian & Gold)   */}
        {/* ========================================================= */}
        {themeStyle === "prestige-gold-framed" && (
          <div className="relative w-full h-full bg-slate-950 p-3 sm:p-5 flex flex-col justify-between text-white border-4" style={{ borderColor: primaryColor }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${primaryColor}40` }}>
              <img src={template.custom_logo_url || executivetalksLogo} alt="Logo" className="h-7 w-auto bg-white p-0.5 rounded" />
              <div className="text-right">
                <span className="text-[8px] font-bold uppercase tracking-widest block" style={{ color: primaryColor }}>
                  EXECUTIVE PRESTIGE
                </span>
                <span className="text-[10px] font-black text-white block uppercase">
                  {eventHeading}
                </span>
              </div>
            </div>

            {/* Split Photo & Credentials */}
            <div className="grid grid-cols-12 gap-3 items-center py-1 flex-1 min-h-0 overflow-hidden">
              <div className="col-span-5 flex flex-col items-center">
                <div
                  className="w-22 h-22 sm:w-28 sm:h-28 rounded-xl overflow-hidden relative bg-slate-900 border-2 group shadow-lg shrink-0"
                  style={{ borderColor: primaryColor }}
                >
                  {localPhoto ? (
                    <img src={localPhoto} alt={attendeeName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white text-3xl font-black">
                      {attendeeName.charAt(0) || "E"}
                    </div>
                  )}
                  {allowPhotoUpload && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Change</span>
                    </button>
                  )}
                </div>

                <div
                  className="mt-1.5 px-3 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase text-slate-950 shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {badgeText}
                </div>
              </div>

              <div className="col-span-7 space-y-1">
                <h4 className="text-xs sm:text-base font-black text-white uppercase truncate">
                  {attendeeName}
                </h4>
                <p className="text-[9px] sm:text-xs font-bold truncate" style={{ color: accentColor }}>
                  {attendeeDesignation}
                </p>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase truncate">
                  {attendeeCompany}
                </p>

                <div className="pt-1.5 text-[8px] sm:text-[9px] text-slate-300 space-y-0.5">
                  {highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span style={{ color: primaryColor }}>✦</span>
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom QR and Gold Footer */}
            <div className="flex items-center justify-between border-t pt-2 shrink-0 mt-auto" style={{ borderColor: `${primaryColor}40` }}>
              <div className="flex items-center gap-2">
                {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-10 h-10 bg-white p-0.5 rounded" />}
                <div className="text-[8px]">
                  <span className="font-black block" style={{ color: primaryColor }}>{ctaText}</span>
                  <span className="text-slate-400">Official Pass</span>
                </div>
              </div>

              <div className="text-right text-[8px] text-slate-300 font-bold">
                <div>📅 {dateText}</div>
                <div>📍 {venueText}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LAYOUT 5: CYBER TECH CONCLAVE (Electric Cyan Cyber Mesh)   */}
        {/* ========================================================= */}
        {themeStyle === "cyber-tech-conclave" && (
          <div className="relative w-full h-full bg-slate-950 p-4 flex flex-col justify-between text-white border-2" style={{ borderColor: `${primaryColor}60` }}>
            <div className="flex items-center justify-between">
              <img src={template.custom_logo_url || executivetalksLogo} alt="Logo" className="h-6 w-auto bg-white p-0.5 rounded" />
              <div className="px-2 py-0.5 rounded-md text-[8px] font-mono font-bold text-black uppercase" style={{ backgroundColor: primaryColor }}>
                [ CREDENTIAL ]
              </div>
            </div>

            <div className="space-y-0.5 pt-1">
              <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest block">
                &gt; {topTagline}
              </span>
              <h3 className="text-xs sm:text-base font-black text-white uppercase font-display">
                {eventHeading}
              </h3>
            </div>

            <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center py-1 flex-1 min-h-0 overflow-hidden">
              <div className="col-span-7 space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-white uppercase">
                  {attendeeName}
                </h4>
                <p className="text-[9px] sm:text-[10px] font-mono font-bold" style={{ color: accentColor }}>
                  {attendeeDesignation}
                </p>
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">
                  {attendeeCompany}
                </p>

                <div className="pt-1 flex flex-wrap gap-1">
                  {highlights.slice(0, 3).map((h, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded-sm bg-cyan-950/60 border border-cyan-500/40 text-[7px] text-cyan-300 font-mono">
                      #{h.replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-span-5 flex flex-col items-center">
                <div
                  className="w-22 h-22 sm:w-28 sm:h-28 rounded-full overflow-hidden relative bg-slate-900 border-2 group shadow-xl shrink-0"
                  style={{ borderColor: primaryColor }}
                >
                  {localPhoto ? (
                    <img src={localPhoto} alt={attendeeName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white text-3xl font-black">
                      {attendeeName.charAt(0) || "E"}
                    </div>
                  )}
                  {allowPhotoUpload && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[8px] font-bold cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Change</span>
                    </button>
                  )}
                </div>

                <div className="mt-1 px-2.5 py-0.5 rounded-sm bg-cyan-500 text-black text-[8px] font-mono font-black uppercase">
                  {badgeText}
                </div>
              </div>
            </div>

            {/* Bottom Cyber Bar */}
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[8px] font-mono shrink-0 mt-auto">
              <div className="flex items-center gap-2">
                {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-8 h-8 bg-white p-0.5 rounded" />}
                <div>
                  <span className="text-cyan-400 font-bold block">{ctaText}</span>
                  <span className="text-slate-400">{dateText}</span>
                </div>
              </div>
              <div className="text-right text-slate-400">
                <div>📍 {venueText}</div>
                <div>✉️ {contactEmail}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LAYOUT 6: HR RECALL PURPLE ORBIT (Image 1 Exact Match)    */}
        {/* ========================================================= */}
        {themeStyle === "hr-recall-purple" && (
          <div className="relative w-full h-full bg-white flex flex-col justify-between overflow-hidden text-slate-900 select-none">
            {/* Top Bar: Left Taglines & Right Prominent Big Logo */}
            <div className="pt-3 sm:pt-3.5 px-4 sm:px-6 flex items-start justify-between z-10 shrink-0">
              {/* Left Headlines */}
              <div className="space-y-0.5">
                <h2
                  className="text-sm sm:text-xl md:text-2xl font-black tracking-tight leading-none uppercase font-display"
                  style={{ color: primaryColor || "#200E4B" }}
                >
                  ONE BIG GATHERING
                </h2>
                <p className="text-[11px] sm:text-sm md:text-base font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
                  2,000+ HR PROFESSIONALS
                </p>
                {/* I'm Attending Blue Pill */}
                <div className="pt-1">
                  <span
                    className="inline-block px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-lg text-white font-black text-[10px] sm:text-xs shadow-sm uppercase tracking-wide leading-none"
                    style={{ backgroundColor: secondaryColor || "#0D6EFD" }}
                  >
                    I'm Attending
                  </span>
                </div>
              </div>

              {/* Right Big Company Logo */}
              <div className="shrink-0 pl-2">
                <img
                  src={template.custom_logo_url || executivetalksLogo}
                  alt="Executive Talks"
                  className="h-9 sm:h-12 md:h-14 w-auto object-contain"
                />
              </div>
            </div>

            {/* Middle Section: Left Brand & QR, Right Circular Profile Avatar */}
            <div className="px-4 sm:px-6 grid grid-cols-12 gap-2 sm:gap-3 items-center flex-1 min-h-0 overflow-hidden py-1 z-10 my-auto">
              {/* Left Column: Awards & Connect Box + Bullets & QR */}
              <div className="col-span-6 flex flex-col justify-between space-y-2 pr-1 py-0.5">
                {/* Event Lockup */}
                <div className="space-y-0.5">
                  <span className="text-[7.5px] sm:text-[9px] font-black uppercase tracking-wider text-slate-800 block">
                    AWARDS & CONNECT
                  </span>
                  <div className="border-2 border-sky-500 rounded-lg p-1 sm:p-1.5 bg-white shadow-xs inline-block">
                    <div className="text-sm sm:text-xl font-black leading-none font-display flex items-baseline gap-1">
                      <span className="text-sky-500 font-black">HR </span>
                      <span className="text-[#0A1931] font-black">RECALL </span>
                      <span className="text-sky-500 text-xs sm:text-lg font-black">2K26</span>
                    </div>
                  </div>
                  <p className="text-[7.5px] sm:text-[9.5px] font-bold text-slate-700">
                    Remembering 2026. <span className="text-sky-600 font-black">Calling 2027</span>
                  </p>
                </div>

                {/* Register Now Pill + QR Code + Bullets */}
                <div className="space-y-1 pt-0.5">
                  <div
                    className="inline-block px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9.5px] font-black uppercase text-white shadow-xs"
                    style={{ backgroundColor: secondaryColor || "#0D6EFD" }}
                  >
                    REGISTER NOW
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    {qrDataUrl && (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-13 h-13 sm:w-18 sm:h-18 object-contain border border-slate-300 rounded-lg p-0.5 bg-white shrink-0 shadow-xs"
                      />
                    )}
                    <div className="text-[7.5px] sm:text-[9.5px] font-bold italic text-[#1E1B4B] space-y-0.5 leading-tight">
                      {(highlights.length > 0 ? highlights.slice(0, 4) : ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"]).map((h, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-slate-900 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Purple Ring Circular Photo & Attendee Details */}
              <div className="col-span-6 flex flex-col items-center text-center pl-1">
                {/* Purple Ring Avatar with Dashed Orbit & Accents */}
                <div className="relative flex items-center justify-center">
                  {/* Outer Purple Ring */}
                  <div
                    className="relative w-24 h-24 sm:w-34 sm:h-34 md:w-38 md:h-38 rounded-full border-[6px] sm:border-[9px] flex items-center justify-center shadow-xl group overflow-hidden shrink-0"
                    style={{ borderColor: primaryColor || "#28107A" }}
                  >
                    {/* Subtle dashed white ring overlay */}
                    <div className="absolute inset-1 rounded-full border border-dashed border-white/95 pointer-events-none z-10" />

                    {/* Red wedge decorative indicators */}
                    <div className="absolute top-1 right-3.5 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-red-500 [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rotate-45 pointer-events-none z-10" />
                    <div className="absolute bottom-1 left-3.5 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-red-500 [clip-path:polygon(50%_0%,0%_100%,100%_100%)] -rotate-135 pointer-events-none z-10" />

                    {localPhoto ? (
                      <img
                        src={localPhoto}
                        alt={attendeeName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-white text-3xl sm:text-5xl font-black">
                        {attendeeName.charAt(0) || "M"}
                      </div>
                    )}

                    {allowPhotoUpload && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9.5px] font-bold cursor-pointer rounded-full transition-opacity z-20"
                      >
                        <Camera className="w-4 h-4 text-cyan-400 mb-0.5" />
                        <span>Change Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Attendee Info below photo */}
                <div className="mt-1.5 space-y-0.5 max-w-full px-1">
                  <h4 className="text-xs sm:text-lg md:text-xl font-black text-[#1B4332] truncate uppercase leading-tight font-display tracking-tight">
                    {attendeeName}
                  </h4>
                  <p className="text-[9px] sm:text-xs font-bold text-slate-800 truncate leading-tight">
                    {attendeeDesignation}
                  </p>
                  <p className="text-[8.5px] sm:text-xs font-black text-[#2563EB] uppercase truncate leading-tight">
                    {attendeeCompany}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Purple Strip - 100% Flush & Fully Visible (Never Cropped) */}
            <div
              className="shrink-0 w-full z-20 py-2 sm:py-2.5 px-4 sm:px-6 text-white text-[7.5px] sm:text-[9.5px] md:text-[10px] font-semibold flex flex-col justify-center space-y-0.5 shadow-md mt-auto"
              style={{ backgroundColor: footerBg || "#28107A" }}
            >
              <p className="text-slate-200 truncate">
                For queries & registration: <span className="text-white font-bold">{contactEmail}</span>
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-white font-bold text-[8px] sm:text-[9.5px]">
                <span>Date: {dateText}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400 shrink-0 inline" /> {venueText}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LAYOUT 7: DARK RUBY SPOTLIGHT (Image 2 Exact Match)       */}
        {/* ========================================================= */}
        {themeStyle === "dark-ruby-spotlight" && (
          <div
            className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden text-white select-none"
            style={{
              background: "radial-gradient(circle at 95% 15%, #C52222 0%, #8B1010 25%, #450A0A 50%, #180305 75%, #000000 100%)",
            }}
          >
            {/* Top-Left Logo Card */}
            <div className="p-4 sm:p-6 flex items-start justify-between">
              <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-2xl inline-block">
                <img
                  src={template.custom_logo_url || executivetalksLogo}
                  alt="Executive Talks"
                  className="h-9 sm:h-13 w-auto object-contain"
                />
              </div>
            </div>

            {/* Center Profile Avatar with Glowing Ruby Rim */}
            <div className="flex flex-col items-center text-center px-4 my-auto flex-1 min-h-0 overflow-hidden">
              <div className="relative group shrink-0">
                <div
                  className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden bg-slate-900 border-3 border-red-500/90 shadow-[0_0_45px_rgba(239,68,68,0.8)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0"
                >
                  {localPhoto ? (
                    <img
                      src={localPhoto}
                      alt={attendeeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white text-4xl sm:text-6xl font-black">
                      {attendeeName.charAt(0) || "B"}
                    </div>
                  )}

                  {allowPhotoUpload && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer rounded-full transition-opacity"
                    >
                      <Camera className="w-5 h-5 text-red-400 mb-0.5" />
                      <span>Change</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bold Name */}
              <h3 className="mt-4 text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-display drop-shadow-xl">
                {attendeeName}
              </h3>

              {/* Dark Ruby Pill Capsule Badge */}
              <div className="mt-2.5 inline-block px-6 sm:px-8 py-1.5 sm:py-2 rounded-full bg-[#180305]/95 border border-red-800/80 text-red-400 font-bold text-xs sm:text-base tracking-wide shadow-inner">
                {attendeeDesignation}
                {attendeeCompany && attendeeCompany !== "Organization" && attendeeCompany !== "Executive Talks" && (
                  <span className="text-slate-300 font-normal"> • {attendeeCompany}</span>
                )}
              </div>
            </div>

            {/* Subtle bottom padding */}
            <div className="h-6" />
          </div>
        )}

        {/* Hidden File Input for live photo changes */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoSelect}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* ============================================================== */}
      {/* 2. ACTION CONTROLS: DIRECT SOCIAL SHARING & 1080x1350 DOWNLOAD */}
      {/* ============================================================== */}
      {!hideActionButtons && (
        <div className="flex flex-col gap-3 pt-2">
          {/* Header Row: Social Share Title & Photo Action */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Direct Social Share & Poster Actions:</span>
            </span>
            {allowPhotoUpload && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200 transition-all"
              >
                <Upload className="w-3 h-3 text-cyan-600" />
                <span>{localPhoto ? "Replace My Photo" : "Upload My Photo"}</span>
              </button>
            )}
          </div>

          {/* Social Share Buttons: WhatsApp, Instagram, Facebook, LinkedIn, X */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* 1. WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Share directly to WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            {/* 2. Instagram */}
            <button
              type="button"
              onClick={handleShareInstagram}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Download 1080x1350 Poster & Share to Instagram"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </button>

            {/* 3. Facebook */}
            <button
              type="button"
              onClick={handleShareFacebook}
              className="py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#156cdb] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Share directly to Facebook"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>

            {/* 4. LinkedIn */}
            <button
              type="button"
              onClick={handleShareLinkedIn}
              className="py-2.5 px-3 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Share directly to LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </button>

            {/* 5. X (Twitter) */}
            <button
              type="button"
              onClick={handleShareX}
              className="py-2.5 px-3 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer col-span-2 sm:col-span-1"
              title="Share directly to X (Twitter)"
            >
              <span className="font-mono text-sm leading-none font-bold">𝕏</span>
              <span>X Post</span>
            </button>
          </div>

          {/* Universal High-Resolution 1080x1080 Square PNG Download Button */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={exporting}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 border border-slate-700"
          >
            {exporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Generating High-Res Social Media Poster (1080×1080)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Official Social Media Poster (1080×1080 PNG)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
