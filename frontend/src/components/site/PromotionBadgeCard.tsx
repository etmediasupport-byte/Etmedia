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

  // Helper to load image for canvas
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  // =========================================================================
  // HIGH-RESOLUTION 1080x1350px (Instagram 4:5 Portrait) CANVAS EXPORTER
  // =========================================================================
  const handleDownloadImage = async () => {
    try {
      setExporting(true);
      const canvas = document.createElement("canvas");
      const W = 1080;
      const H = 1350;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas");

      // Load logo
      let logoImg: HTMLImageElement | null = null;
      try {
        logoImg = await loadImage(template.custom_logo_url || executivetalksLogo);
      } catch (e) {}

      // Load QR
      let qrImg: HTMLImageElement | null = null;
      if (qrDataUrl) {
        try {
          qrImg = await loadImage(qrDataUrl);
        } catch (e) {}
      }

      // Load photo
      let photoImg: HTMLImageElement | null = null;
      if (localPhoto) {
        try {
          photoImg = await loadImage(localPhoto);
        } catch (e) {}
      }

      // -----------------------------------------------------------
      // TEMPLATE 1: "hr-recall-emerald" (The Exact 2nd Image Layout)
      // -----------------------------------------------------------
      if (themeStyle === "hr-recall-emerald") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, W, H);

        // Top right diagonal polygon (emerald + dark navy)
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(W * 0.52, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, H * 0.35);
        ctx.lineTo(W * 0.68, H * 0.22);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(W * 0.68, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, H * 0.22);
        ctx.closePath();
        ctx.fill();

        // Bottom right emerald accent
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(W * 0.80, H * 0.88);
        ctx.lineTo(W, H * 0.76);
        ctx.lineTo(W, H * 0.88);
        ctx.closePath();
        ctx.fill();

        // Logo
        if (logoImg) {
          ctx.drawImage(logoImg, 50, 45, 230, 75);
        } else {
          ctx.fillStyle = "#0F172A";
          ctx.font = "bold 32px sans-serif";
          ctx.fillText("Executive Talks", 50, 85);
        }

        // Top Tagline
        ctx.fillStyle = "#0F172A";
        ctx.font = "900 36px sans-serif";
        ctx.textAlign = "left";
        const tagParts = topTagline.includes("\n")
          ? topTagline.split("\n")
          : topTagline.length > 26
          ? [topTagline.slice(0, 26).trim(), topTagline.slice(26).trim()]
          : [topTagline];
        let ty = 175;
        tagParts.forEach((tp, i) => {
          if (i === 1) ctx.fillStyle = "#1E1B4B";
          ctx.fillText(tp, 50, ty);
          ty += 46;
        });

        // Event Brand
        ctx.fillStyle = "#0F172A";
        ctx.font = "800 18px sans-serif";
        ctx.fillText("AWARDS & CONNECT", 50, ty + 20);

        ctx.fillStyle = "#0284C7";
        ctx.font = "900 44px sans-serif";
        ctx.fillText(eventHeading, 50, ty + 72);

        ctx.fillStyle = "#1E293B";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText(subHeading, 50, ty + 112);

        // Name, Designation, Company
        const ny = ty + 195;
        ctx.fillStyle = "#0F172A";
        ctx.font = "900 46px sans-serif";
        ctx.fillText(attendeeName, 50, ny);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(attendeeDesignation, 50, ny + 46);

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 30px sans-serif";
        ctx.fillText(attendeeCompany, 50, ny + 90);

        // Right side: Circular Photo (Enlarged & Prominent)
        const cx = W * 0.75;
        const cy = 340;
        const cr = 185;

        // Dark ring
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 12, 0, Math.PI * 2);
        ctx.fillStyle = secondaryColor;
        ctx.fill();

        // White ring
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 6, 0, Math.PI * 2);
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
          ctx.font = "bold 80px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "E", cx, cy + 25);
        }
        ctx.restore();

        // Badge Pill attached to top of circle
        const px = cx - 145;
        const py = cy - cr - 24;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(px, py, 290, 48, 24);
        ctx.fill();
        ctx.shadowColor = "transparent";

        ctx.strokeStyle = "#CBD5E1";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 19px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, cx, py + 31);

        // Right side: QR Scanner sitting directly below photo
        if (qrImg) {
          const qrSize = 200;
          const qrX = cx - qrSize / 2;
          const qrY = 570;

          // QR container card
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "rgba(0,0,0,0.15)";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.roundRect(qrX - 18, qrY - 16, qrSize + 36, qrSize + 70, 22);
          ctx.fill();
          ctx.shadowColor = "transparent";

          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          ctx.fillStyle = primaryColor;
          ctx.font = "900 16px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("SCAN FOR EVENT PASS", cx, qrY + qrSize + 36);
        }

        // Left side: CTA Button
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(50, ny + 150, 240, 52, 26);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ctaText, 170, ny + 183);

        // Left side: Bullets
        ctx.fillStyle = "#0F172A";
        ctx.font = "900 24px sans-serif";
        ctx.textAlign = "left";
        let by = ny + 250;
        highlights.slice(0, 4).forEach((h) => {
          ctx.fillText(`• ${h}`, 50, by);
          by += 44;
        });

        // Middle Verification Strip (Fills middle vertical space with prestige)
        ctx.fillStyle = "#F0FDF4";
        ctx.beginPath();
        ctx.roundRect(50, 890, W - 100, 95, 16);
        ctx.fill();
        ctx.strokeStyle = "#BBF7D0";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#065F46";
        ctx.font = "900 22px sans-serif";
        ctx.fillText("✓ OFFICIAL EXECUTIVE DELEGATE PASS & CREDENTIAL", 80, 935);

        ctx.fillStyle = "#166534";
        ctx.font = "bold 17px sans-serif";
        ctx.fillText(`Verified Delegate: ${attendeeName}  |  Pass: ${attendee.regId || "CONCLAVE VIP"}`, 80, 965);

        // Additional VIP Showcase Strip (Eliminates dead vertical space)
        ctx.fillStyle = "#F8FAFC";
        ctx.beginPath();
        ctx.roundRect(50, 1010, W - 100, 155, 18);
        ctx.fill();
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 20px sans-serif";
        ctx.fillText("🏆 AWARDS FELICITATION", 80, 1060);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("National Leadership Recognition", 80, 1095);

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 20px sans-serif";
        ctx.fillText("🤝 5-STAR LUNCHEON", 420, 1060);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("C-Suite & CXO Masterclasses", 420, 1095);

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 20px sans-serif";
        ctx.fillText("🎟️ FAST-TRACK ENTRY", 760, 1060);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Digital Pass QR Check-in", 760, 1095);

        // Bottom Footer (Fixed height & fully visible)
        ctx.fillStyle = footerBg;
        ctx.fillRect(0, 1200, W, 150);

        ctx.fillStyle = "#E2E8F0";
        ctx.font = "600 21px sans-serif";
        ctx.fillText(`For queries & registration: ${contactEmail}`, 50, 1250);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 23px sans-serif";
        ctx.fillText(`📅 Date: ${dateText}          📍 Venue: ${venueText}`, 50, 1300);
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

        // Bottom Split Boxes
        // Left Box: Highlights
        ctx.fillStyle = "#F8FAFC";
        ctx.beginPath();
        ctx.roundRect(80, 770, 500, 240, 20);
        ctx.fill();
        ctx.strokeStyle = "#E2E8F0";
        ctx.stroke();

        ctx.fillStyle = "#0F172A";
        ctx.font = "900 22px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("SUMMIT HIGHLIGHTS", 110, 815);
        let sy = 855;
        highlights.forEach((h) => {
          ctx.font = "bold 19px sans-serif";
          ctx.fillStyle = "#334155";
          ctx.fillText(`✓  ${h}`, 110, sy);
          sy += 35;
        });

        // Right Box: QR Code & CTA
        ctx.fillStyle = "#F8FAFC";
        ctx.beginPath();
        ctx.roundRect(620, 770, 500, 240, 20);
        ctx.fill();
        ctx.strokeStyle = "#E2E8F0";
        ctx.stroke();

        if (qrImg) {
          ctx.drawImage(qrImg, 650, 800, 180, 180);
        }

        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(860, 830, 230, 50, 25);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ctaText, 975, 863);

        ctx.fillStyle = "#475569";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("Scan to register / check in", 975, 920);

        // Footer Strip
        ctx.fillStyle = footerBg;
        ctx.fillRect(0, H * 0.90, W, H * 0.10);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`📅 ${dateText}   |   📍 ${venueText}   |   ✉️ ${contactEmail}`, W / 2, H * 0.955);
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

      // Export as PNG
      const dataUri = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const safeName = attendeeName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "attendee";
      downloadLink.download = `ETMedia-Promotion-Badge-${safeName}.png`;
      downloadLink.href = dataUri;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success("High-Resolution Promotion Badge downloaded successfully!");
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error("Failed to generate download image: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Social Sharing Handlers
  const handleShareWhatsApp = () => {
    const text = `🎉 Excited to announce that I am attending ${attendee.event_title || template.event_heading || "HR RECALL 2K26"} hosted by Executive Talks Media!\n\n📅 Date: ${dateText}\n📍 Venue: ${venueText}\n\nJoin me & 2,000+ HR Leaders:\n${qrTarget}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    const postUrl = qrTarget;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      "_blank"
    );
  };

  const handleShareFacebook = () => {
    const postUrl = qrTarget;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      "_blank"
    );
  };

  const handleShareX = () => {
    const text = `🎉 Excited to announce that I'm attending ${attendee.event_title || template.event_heading || "HR RECALL 2K26"} by Executive Talks Media! 🚀`;
    const postUrl = qrTarget;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      "_blank"
    );
  };

  const handleShareInstagram = async () => {
    await handleDownloadImage();
    const caption = `Excited to announce that I'm attending ${attendee.event_title || template.event_heading || "HR RECALL 2K26"} hosted by Executive Talks Media! 🚀\n\n📅 Date: ${dateText}\n📍 Venue: ${venueText}\n\nJoin 2,000+ HR leaders at the summit: ${qrTarget}\n\n#ExecutiveTalks #HRRecall2k26 #Leadership #Summit #Networking #CorporateAwards`;
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Poster downloaded & caption copied! Ready to share on Instagram stories or feed.", {
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
      {/* 1. VISUAL PORTRAIT BADGE POSTER (1080x1350 / 4:5 Aspect Ratio) */}
      {/* ============================================================== */}
      <div
        id="promotion-badge-container"
        className="relative w-full aspect-[4/5] max-w-[500px] sm:max-w-[540px] mx-auto rounded-3xl shadow-2xl overflow-hidden font-sans select-none border border-slate-300"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* ========================================================= */}
        {/* LAYOUT 1: HR RECALL GEOMETRIC CHEVRON (Exact 2nd Image)   */}
        {/* ========================================================= */}
        {themeStyle === "hr-recall-emerald" && (
          <div className="relative w-full h-full bg-white flex flex-col justify-between overflow-hidden">
            {/* Top-right Angular Chevron Geometry */}
            <div
              className="absolute top-0 right-0 w-[45%] h-[38%] pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 60%, ${secondaryColor} 60%, ${secondaryColor} 100%)`,
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 30% 65%)",
              }}
            />
            <div
              className="absolute bottom-[14%] right-0 w-[20%] h-[10%] pointer-events-none opacity-90"
              style={{
                background: primaryColor,
                clipPath: "polygon(30% 100%, 100% 20%, 100% 100%)",
              }}
            />

            {/* Main 2-Column Content Grid (Evenly Distributed, Zero Middle Gap) */}
            <div className="relative z-10 p-3.5 sm:p-5 grid grid-cols-12 gap-2 sm:gap-3 flex-1 min-h-0 items-center overflow-hidden">
              {/* Left Column: Details & Brand (7 Columns) */}
              <div className="col-span-7 flex flex-col justify-center h-full pr-1 space-y-2 sm:space-y-3.5 overflow-hidden">
                <div className="space-y-1.5 sm:space-y-2">
                  {/* Logo */}
                  <div className="bg-white/95 backdrop-blur-xs p-1 sm:p-1.5 rounded-xl shadow-xs border border-slate-200 inline-block self-start">
                    <img
                      src={template.custom_logo_url || executivetalksLogo}
                      alt="Executive Talks"
                      className="h-6 sm:h-8 w-auto object-contain"
                    />
                  </div>

                  {/* Top Tagline */}
                  <div className="space-y-0.5">
                    <h2 className="text-[11px] sm:text-base font-black text-slate-900 leading-tight uppercase font-display tracking-tight">
                      {topTagline}
                    </h2>
                  </div>

                  {/* Event Brand Box */}
                  <div className="space-y-0.5 pt-0.5">
                    <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-900 block font-mono">
                      AWARDS & CONNECT
                    </span>
                    <h3 className="text-xs sm:text-lg font-black text-sky-600 uppercase tracking-tight leading-none font-display">
                      {eventHeading}
                    </h3>
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-700 tracking-tight">
                      {subHeading}
                    </p>
                  </div>

                  {/* Attendee Name & Designation */}
                  <div className="space-y-0.5 pt-0.5">
                    <h4 className="text-xs sm:text-base font-black text-slate-900 uppercase font-display leading-tight truncate">
                      {attendeeName}
                    </h4>
                    <p
                      className="text-[10px] sm:text-xs font-bold leading-tight truncate"
                      style={{ color: accentColor }}
                    >
                      {attendeeDesignation}
                    </p>
                    <p className="text-[9px] sm:text-[11px] font-black text-slate-800 uppercase tracking-tight leading-tight truncate">
                      {attendeeCompany}
                    </p>
                  </div>
                </div>

                {/* CTA Button & Highlights (Flows naturally in middle) */}
                <div className="space-y-2 pt-1">
                  <div
                    className="inline-flex items-center justify-center px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {ctaText}
                  </div>

                  <div className="space-y-1 text-[8px] sm:text-[10px] font-black text-slate-800 pt-0.5">
                    {highlights.slice(0, 4).map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 leading-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Large Photo Circle + QR Scanner Sitting Directly Below */}
              <div className="col-span-5 flex flex-col items-center justify-center h-full space-y-2 sm:space-y-3 pt-0.5 pb-1 overflow-hidden">
                {/* 1. Large Photo Circle */}
                <div className="flex flex-col items-center relative">
                  {/* Badge Pill attached to top of photo */}
                  <div className="relative -mb-3 z-20 bg-white border border-slate-300 shadow-md rounded-full px-2.5 sm:px-3 py-0.5 text-[7px] sm:text-[9px] font-black uppercase tracking-wide text-slate-900 text-center whitespace-nowrap">
                    {badgeText}
                  </div>

                  {/* Circular Photo Box - Large & Prominent */}
                  <div
                    className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full border-3 sm:border-4 border-white shadow-2xl overflow-hidden bg-slate-900 flex items-center justify-center group shrink-0"
                    style={{
                      boxShadow: "0 10px 25px -4px rgba(0,0,0,0.35)",
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
                        <span className="text-[7px] sm:text-[9px] text-slate-300 uppercase tracking-widest font-mono">
                          Delegate
                        </span>
                      </div>
                    )}

                    {allowPhotoUpload && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[8px] sm:text-[10px] font-bold transition-all cursor-pointer backdrop-blur-xs"
                      >
                        <Camera className="w-4 h-4 mb-0.5 text-cyan-400" />
                        <span>Change Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. QR Code Scanner Placed Directly Below Photo */}
                <a
                  href={qrTarget}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Scan or click to open: ${qrTarget}`}
                  className="flex flex-col items-center p-1.5 sm:p-2 rounded-2xl bg-white/95 border border-slate-200 shadow-md hover:border-emerald-500 hover:shadow-lg transition-all group shrink-0 cursor-pointer"
                >
                  <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-inner">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Event QR Scanner"
                        className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-100 animate-pulse rounded-lg" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[7px] sm:text-[9px] font-black text-slate-700 group-hover:text-emerald-700 uppercase tracking-wider">
                    <span>Scan for Event</span>
                    <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                </a>
              </div>
            </div>

            {/* Middle Executive Credential Bar (Eliminates dead space in 4:5 portrait) */}
            <div className="mx-3.5 sm:mx-5 mb-2 p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-[8px] sm:text-[10px] font-bold text-slate-800 shadow-xs shrink-0">
              <div className="flex items-center gap-1.5 text-emerald-800 font-black">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="uppercase tracking-wider">Official Delegate Credential</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-mono text-[7px] sm:text-[9px]">
                <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">5-Star Luncheon</span>
                <span>ID: {attendee.regId || attendee.id || "DELEGATE"}</span>
              </div>
            </div>

            {/* Bottom Green Footer Strip - 100% Fully Visible & Never Cropped */}
            <div
              className="shrink-0 w-full z-20 py-2 sm:py-2.5 px-4 sm:px-6 text-white text-[8px] sm:text-[10px] font-semibold flex flex-col justify-center space-y-0.5 shadow-md"
              style={{ backgroundColor: footerBg }}
            >
              <p className="text-slate-200 truncate">
                For queries & registration: <span className="text-white font-bold">{contactEmail}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-white font-bold text-[8px] sm:text-[10px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-300 shrink-0" /> Date: {dateText}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-300 shrink-0" /> Venue: {venueText}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LAYOUT 2: SPOTLIGHT CENTER (Centered VIP Arc & Halo)       */}
        {/* ========================================================= */}
        {themeStyle === "spotlight-center" && (
          <div className="relative w-full h-full bg-white flex flex-col justify-between">
            {/* Top Arc Header */}
            <div
              className="py-3 px-5 text-white flex flex-col items-center text-center space-y-1"
              style={{ backgroundColor: secondaryColor }}
            >
              <div className="bg-white/95 p-1 rounded-lg">
                <img src={template.custom_logo_url || executivetalksLogo} alt="Logo" className="h-6 w-auto" />
              </div>
              <h2 className="text-[11px] sm:text-sm font-black uppercase tracking-wide">
                {topTagline}
              </h2>
              <p className="text-[9px] sm:text-[10px] font-bold" style={{ color: primaryColor }}>
                {eventHeading}
              </p>
            </div>
            <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />

            {/* Centered Photo & Details */}
            <div className="p-4 flex flex-col items-center text-center space-y-2">
              <div
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-900 group"
                style={{ outline: `3px solid ${primaryColor}` }}
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
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {/* Centered Pill */}
              <div
                className="px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase text-white shadow-xs"
                style={{ backgroundColor: secondaryColor }}
              >
                {badgeText}
              </div>

              <h4 className="text-sm sm:text-lg font-black text-slate-900 uppercase">
                {attendeeName}
              </h4>
              <p className="text-[10px] sm:text-xs font-bold -mt-1" style={{ color: accentColor }}>
                {attendeeDesignation}
              </p>
              <p className="text-[9px] sm:text-[11px] font-black text-slate-600 uppercase">
                {attendeeCompany}
              </p>

              {/* Split Highlights & QR Box */}
              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-left text-[8px] sm:text-[9px]">
                  <span className="font-black text-slate-900 block mb-1">HIGHLIGHTS</span>
                  {highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="text-slate-700 font-bold">✓ {h}</div>
                  ))}
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-2">
                  {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />}
                  <div className="text-left">
                    <span className="text-[9px] font-black text-emerald-700 block">{ctaText}</span>
                    <span className="text-[8px] text-slate-500 block">Scan to register</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="py-2 px-4 text-white text-[8px] sm:text-[10px] text-center font-bold" style={{ backgroundColor: footerBg }}>
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
              <div className="p-2 rounded-xl text-white text-[8px]" style={{ backgroundColor: footerBg }}>
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
            <div className="grid grid-cols-12 gap-3 items-center py-2">
              <div className="col-span-5 flex flex-col items-center">
                <div
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden relative bg-slate-900 border-2 group shadow-lg"
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
                  className="mt-1.5 px-3 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase text-slate-950"
                  style={{ backgroundColor: primaryColor }}
                >
                  {badgeText}
                </div>
              </div>

              <div className="col-span-7 space-y-1">
                <h4 className="text-xs sm:text-base font-black text-white uppercase">
                  {attendeeName}
                </h4>
                <p className="text-[9px] sm:text-xs font-bold" style={{ color: accentColor }}>
                  {attendeeDesignation}
                </p>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase">
                  {attendeeCompany}
                </p>

                <div className="pt-2 text-[8px] sm:text-[9px] text-slate-300 space-y-0.5">
                  {highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span style={{ color: primaryColor }}>✦</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom QR and Gold Footer */}
            <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: `${primaryColor}40` }}>
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

            <div className="grid grid-cols-12 gap-3 items-center py-2">
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
                  className="w-22 h-22 sm:w-28 sm:h-28 rounded-full overflow-hidden relative bg-slate-900 border-2 group shadow-xl"
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
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[8px] font-mono">
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

          {/* High-Resolution 1080x1350 PNG Download Button */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={exporting}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 border border-slate-700"
          >
            {exporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Generating High-Res 1080×1350 Poster...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Official 1080×1350 Poster (PNG)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
