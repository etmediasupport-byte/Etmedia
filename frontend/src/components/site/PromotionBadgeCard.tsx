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
  RefreshCw,
  Camera,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";

export interface PromotionTemplate {
  id: string;
  title: string;
  theme_style?: string;
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
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [localPhoto, setLocalPhoto] = useState<string>(attendee.photo_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Dynamic values with fallbacks
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

  // QR destination
  const qrTarget =
    template.qr_destination_url ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/events/hr-recall-2k26`
      : "https://executivetalksmedia.in/events/hr-recall-2k26");

  // Generate high-resolution scannable QR Code
  useEffect(() => {
    QRCode.toDataURL(qrTarget, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 280,
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

    setUploadingPhoto(true);
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
      setUploadingPhoto(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  // High-Resolution 1200x1200px HTML5 Canvas Image Exporter
  const handleDownloadImage = async () => {
    try {
      setExporting(true);
      const canvas = document.createElement("canvas");
      const width = 1200;
      const height = 1200;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas");

      // 1. Background White
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // 2. Geometric Diagonal Accents
      // Top-right emerald accent
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(width * 0.58, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height * 0.42);
      ctx.lineTo(width * 0.72, height * 0.28);
      ctx.closePath();
      ctx.fill();

      // Top-right dark navy angle
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.moveTo(width * 0.71, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height * 0.29);
      ctx.closePath();
      ctx.fill();

      // Bottom-right emerald polygon
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(width * 0.82, height * 0.88);
      ctx.lineTo(width, height * 0.76);
      ctx.lineTo(width, height * 0.88);
      ctx.closePath();
      ctx.fill();

      // Bottom footer banner
      ctx.fillStyle = footerBg;
      ctx.fillRect(0, height * 0.89, width, height * 0.11);

      // Helper function to load image
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        });
      };

      // 3. Draw Logo (Top-Left)
      try {
        const logoImg = await loadImage(executivetalksLogo);
        ctx.drawImage(logoImg, 50, 40, 240, 75);
      } catch (e) {
        // Fallback logo text
        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 32px sans-serif";
        ctx.fillText("Executive Talks", 50, 80);
      }

      // 4. Top Tagline (e.g. 2,000+ HR PROFESSIONALS / ONE BIG GATHERING)
      ctx.fillStyle = "#0F172A";
      ctx.font = "900 42px sans-serif";
      ctx.textAlign = "left";

      // Split tagline if contains newline or long
      const taglineParts = topTagline.includes("\n")
        ? topTagline.split("\n")
        : topTagline.length > 25
        ? [topTagline.slice(0, 25).trim(), topTagline.slice(25).trim()]
        : [topTagline];

      let tagY = 175;
      taglineParts.forEach((part, idx) => {
        if (idx === 1) ctx.fillStyle = "#1E1B4B";
        ctx.fillText(part, 50, tagY);
        tagY += 48;
      });

      // 5. Summit Logo / Sub-brand Box
      ctx.fillStyle = "#0F172A";
      ctx.font = "800 20px sans-serif";
      ctx.fillText("AWARDS & CONNECT", 50, 310);

      // Event Heading (Styled)
      ctx.fillStyle = "#0284C7";
      ctx.font = "900 48px sans-serif";
      ctx.fillText(eventHeading, 50, 365);

      // Subheading
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(subHeading, 50, 410);

      // 6. Delegate Details (Name, Designation, Company)
      ctx.fillStyle = "#0F172A";
      ctx.font = "900 44px sans-serif";
      ctx.fillText(attendeeName, 50, 510);

      // Designation in bright accent
      ctx.fillStyle = accentColor;
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(attendeeDesignation, 50, 555);

      // Company
      ctx.fillStyle = "#0F172A";
      ctx.font = "900 28px sans-serif";
      ctx.fillText(attendeeCompany, 50, 595);

      // 7. Circular Attendee Photo (Right Side)
      const circleCenterX = width * 0.74;
      const circleCenterY = height * 0.52;
      const circleRadius = 210;

      // Outer ring
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, circleRadius + 12, 0, Math.PI * 2);
      ctx.fillStyle = secondaryColor;
      ctx.fill();

      // White inner ring
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, circleRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      // Draw Photo or Executive Avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
      ctx.clip();

      if (localPhoto) {
        try {
          const photoImg = await loadImage(localPhoto);
          const aspect = photoImg.width / photoImg.height;
          let drawW = circleRadius * 2;
          let drawH = circleRadius * 2;
          let drawX = circleCenterX - circleRadius;
          let drawY = circleCenterY - circleRadius;

          if (aspect > 1) {
            drawW = circleRadius * 2 * aspect;
            drawX = circleCenterX - drawW / 2;
          } else {
            drawH = (circleRadius * 2) / aspect;
            drawY = circleCenterY - drawH / 2;
          }
          ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
        } catch (photoErr) {
          // Draw fallback gradient & initials
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(circleCenterX - circleRadius, circleCenterY - circleRadius, circleRadius * 2, circleRadius * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 90px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(attendeeName.charAt(0) || "E", circleCenterX, circleCenterY + 30);
        }
      } else {
        // Fallback executive graphic
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(circleCenterX - circleRadius, circleCenterY - circleRadius, circleRadius * 2, circleRadius * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 90px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(attendeeName.charAt(0) || "E", circleCenterX, circleCenterY + 30);
      }
      ctx.restore();

      // 8. Badge Pill (Attached to Circular Frame: "I'M ONE OF THE 2,000+")
      const pillX = circleCenterX - circleRadius - 90;
      const pillY = circleCenterY - circleRadius + 40;
      const pillW = 280;
      const pillH = 50;

      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 25);
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#0F172A";
      ctx.font = "900 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(badgeText, pillX + pillW / 2, pillY + 32);

      // 9. Call to Action Box & QR Code (Bottom Left)
      // Green "REGISTER NOW" Pill
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(50, 680, 210, 48, 24);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(ctaText, 155, 712);

      // QR Code
      if (qrDataUrl) {
        try {
          const qrImg = await loadImage(qrDataUrl);
          ctx.drawImage(qrImg, 50, 745, 170, 170);
        } catch (e) {}
      }

      // Bullet Highlights
      ctx.fillStyle = "#0F172A";
      ctx.font = "900 22px sans-serif";
      ctx.textAlign = "left";
      let bulletY = 770;
      highlights.forEach((h) => {
        ctx.fillText(`• ${h}`, 240, bulletY);
        bulletY += 34;
      });

      // 10. Footer Strip
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "600 21px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`For queries & registration: ${contactEmail}`, 50, height * 0.935);

      // Date & Venue on second footer line
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(`📅 Date: ${dateText}          📍 Venue: ${venueText}`, 50, height * 0.975);

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

  // Social Sharing
  const handleShareWhatsApp = () => {
    const text = `Excited to announce that I am attending ${attendee.event_title || template.event_heading || "HR RECALL 2K26"} hosted by Executive Talks Media!\n\nJoin me & industry leaders:\n${qrTarget}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    const postUrl = qrTarget;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      "_blank"
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ============================================================== */}
      {/* 1. VISUAL SQUARE BADGE POSTER (1:1 Aspect Ratio)               */}
      {/* ============================================================== */}
      <div
        id="promotion-badge-container"
        className="relative w-full aspect-square max-w-[620px] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 font-sans select-none"
        style={{
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
        }}
      >
        {/* Dynamic Chevron Background Geometry */}
        <div
          className="absolute top-0 right-0 w-[42%] h-[42%] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 60%, ${secondaryColor} 60%, ${secondaryColor} 100%)`,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 35% 65%)",
          }}
        />
        <div
          className="absolute bottom-[11%] right-0 w-[20%] h-[12%] pointer-events-none opacity-90"
          style={{
            background: primaryColor,
            clipPath: "polygon(30% 100%, 100% 20%, 100% 100%)",
          }}
        />

        {/* Top Header Row (Logo + Tagline) */}
        <div className="relative z-10 p-5 sm:p-7 flex flex-col justify-between h-full">
          <div>
            {/* Logo */}
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/95 backdrop-blur-xs p-1.5 rounded-xl shadow-xs border border-slate-200 inline-block">
                <img
                  src={template.custom_logo_url || executivetalksLogo}
                  alt="Executive Talks"
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </div>
            </div>

            {/* Top Tagline */}
            <div className="max-w-[65%] space-y-0.5">
              <h2 className="text-base sm:text-2xl font-black text-slate-900 leading-tight uppercase font-display tracking-tight">
                {topTagline}
              </h2>
            </div>

            {/* Event Brand Box */}
            <div className="mt-4 sm:mt-5 space-y-1">
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-slate-900 block font-mono">
                AWARDS & CONNECT
              </span>
              <div className="inline-block">
                <h3 className="text-lg sm:text-3xl font-black text-sky-600 uppercase tracking-tight leading-none font-display">
                  {eventHeading}
                </h3>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-700 tracking-tight">
                {subHeading}
              </p>
            </div>

            {/* Attendee Name & Designation */}
            <div className="mt-4 sm:mt-6 space-y-0.5 max-w-[55%]">
              <h4 className="text-base sm:text-2xl font-black text-slate-900 uppercase font-display leading-tight truncate">
                {attendeeName}
              </h4>
              <p
                className="text-xs sm:text-sm font-bold leading-tight"
                style={{ color: accentColor }}
              >
                {attendeeDesignation}
              </p>
              <p className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-tight leading-tight">
                {attendeeCompany}
              </p>
            </div>
          </div>

          {/* Attendee Circular Frame (Positioned top-right) */}
          <div className="absolute top-[32%] right-[5%] sm:right-[6%] flex flex-col items-center">
            {/* Badge Pill Attached to Frame */}
            <div className="relative -mb-3 sm:-mb-4 z-20 bg-white border border-slate-300 shadow-md rounded-full px-3 sm:px-4 py-1 text-[9px] sm:text-[11px] font-black uppercase tracking-wide text-slate-900">
              {badgeText}
            </div>

            {/* Circular Photo Box */}
            <div
              className="relative w-28 h-28 sm:w-44 sm:h-44 rounded-full border-4 sm:border-[6px] border-white shadow-xl overflow-hidden bg-slate-900 flex items-center justify-center group"
              style={{
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              }}
            >
              {localPhoto ? (
                <img
                  src={localPhoto}
                  alt={attendeeName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white space-y-1">
                  <span className="text-3xl sm:text-5xl font-black font-display">
                    {attendeeName.charAt(0) || "E"}
                  </span>
                  <span className="text-[9px] text-slate-300 uppercase tracking-widest font-mono">
                    Delegate
                  </span>
                </div>
              )}

              {/* Upload Overlay Button for user */}
              {allowPhotoUpload && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer backdrop-blur-xs"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-cyan-400" />
                  <span>Change Photo</span>
                </button>
              )}
            </div>

            {/* Mobile upload trigger badge */}
            {allowPhotoUpload && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-[10px] font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1 sm:hidden cursor-pointer"
              >
                <Camera className="w-3 h-3 text-cyan-600" /> Update Photo
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Bottom Call-To-Action & QR Code Area */}
          <div className="pt-4 flex items-end justify-between">
            <div className="space-y-2">
              {/* Register Button */}
              <div
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {ctaText}
              </div>

              {/* QR Code and Highlights */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs shrink-0">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Event QR"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 animate-pulse rounded" />
                  )}
                </div>

                <div className="space-y-0.5 text-[10px] sm:text-xs font-black text-slate-800">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-slate-400">•</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Green Footer Strip */}
        <div
          className="absolute bottom-0 inset-x-0 py-2.5 px-5 sm:px-7 text-white text-[9px] sm:text-xs font-semibold flex flex-col justify-center space-y-0.5 z-20"
          style={{ backgroundColor: footerBg }}
        >
          <p className="text-slate-200 truncate">
            For queries & registration: <span className="text-white font-bold">{contactEmail}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-white font-bold text-[9px] sm:text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-300" /> Date: {dateText}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-300" /> Venue: {venueText}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ACTION CONTROLS: DOWNLOAD & SHARE                           */}
      {/* ============================================================== */}
      {!hideActionButtons && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Photo upload action */}
          {allowPhotoUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-cyan-600" />
              <span>{localPhoto ? "Replace My Photo" : "Upload My Photo"}</span>
            </button>
          )}

          {/* Social Share Group */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareLinkedIn}
              className="py-2.5 px-3.5 rounded-xl bg-[#0A66C2] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#084e96] transition-all cursor-pointer shadow-xs"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1faa53] transition-all cursor-pointer shadow-xs"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* High-Res Download Button */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={exporting}
              className="py-2.5 px-5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Generating PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download High-Res Badge (PNG)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
