import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Printer, X, CheckCircle2, Copy, Sparkles, RefreshCw, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";

export interface ThermalBadgeAttendee {
  id?: string;
  name?: string;
  email?: string;
  event_title?: string;
  eventTitle?: string;
  organization?: string;
  company_name?: string;
  designation?: string;
  pass_name?: string;
  registration_category?: string;
  checked_in_at?: string;
  checkedInAt?: string;
  phone?: string;
  [key: string]: any;
}

/**
 * Downloads a high-resolution PNG image containing:
 * - High contrast outer & inner badge border
 * - Executive Talks Media & Event Title Header
 * - Explicit "NAME OF THE PERSON" label & large bold name
 * - Explicit "NAME OF THE COMPANY" label & bold organization
 * - Centered framed QR Code
 * - Admission Verified footer
 */
export const downloadBadgeImage = async (
  name: string,
  company: string,
  qrDataUrl: string,
  eventTitle?: string
): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 840;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Canvas context not available");
        return resolve();
      }

      // 1. Clean Crisp White Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. High Contrast Outer Border
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, 600, 800);

      // Inner Accent Border
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, 28, 584, 784);

      // 3. Header: Brand & Event
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("EXECUTIVE TALKS MEDIA", 320, 62, 540);

      const upperEvent = (eventTitle || "LEADERSHIP SUMMIT 2026").toUpperCase();
      ctx.font = "700 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#333333";
      ctx.fillText(upperEvent, 320, 92, 540);

      // Badge Pill
      ctx.fillStyle = "#000000";
      ctx.fillRect(180, 114, 280, 26);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("★ OFFICIAL GATE ADMISSION PASS ★", 320, 127);

      // Divider Line
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(40, 155);
      ctx.lineTo(600, 155);
      ctx.stroke();

      // 4. PERSON NAME (With Explicit Label)
      ctx.fillStyle = "#555555";
      ctx.font = "800 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("NAME OF THE PERSON", 320, 185, 520);

      ctx.fillStyle = "#000000";
      ctx.font = "900 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const upperName = (name || "DELEGATE").toUpperCase();
      ctx.fillText(upperName, 320, 225, 520);

      // Dashed Divider
      ctx.strokeStyle = "#888888";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(80, 260);
      ctx.lineTo(560, 260);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. COMPANY NAME (With Explicit Label)
      ctx.fillStyle = "#555555";
      ctx.font = "800 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("NAME OF THE COMPANY", 320, 290, 520);

      ctx.fillStyle = "#000000";
      ctx.font = "800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const upperCompany = (company || "ENTERPRISE DELEGATE").toUpperCase();
      ctx.fillText(upperCompany, 320, 330, 520);

      // Solid Divider
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(40, 365);
      ctx.lineTo(600, 365);
      ctx.stroke();

      // 6. QR Code (Framed & Centered)
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          // QR box frame
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.strokeRect(170, 395, 300, 300);

          ctx.drawImage(qrImg, 185, 410, 270, 270);

          ctx.fillStyle = "#000000";
          ctx.font = "900 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText("SCAN TO VERIFY PASS", 320, 715);

          // Divider
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(40, 740);
          ctx.lineTo(600, 740);
          ctx.stroke();

          // Footer
          ctx.font = "900 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText("✓ ADMISSION VERIFIED • ALL-ACCESS", 320, 770);

          const a = document.createElement("a");
          const safeName = upperName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
          a.download = `Gate_Badge_${safeName || "Pass"}.png`;
          a.href = canvas.toDataURL("image/png");
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.success("Badge Image (PNG) downloaded successfully!");
          resolve();
        };
        qrImg.onerror = () => {
          toast.error("Failed to load QR code image.");
          resolve();
        };
        qrImg.src = qrDataUrl;
      } else {
        toast.error("QR Code not ready yet.");
        resolve();
      }
    } catch (err) {
      console.error("Download image error:", err);
      toast.error("Failed to generate image.");
      resolve();
    }
  });
};

/**
 * Downloads a clean PDF formatted for 80mm thermal paper or badge card printing
 */
export const downloadBadgePdf = async (
  name: string,
  company: string,
  qrDataUrl: string,
  eventTitle?: string
): Promise<void> => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 125], // 80mm thermal paper standard slip size
    });

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 80, 125, "F");

    // Outer & Inner Borders
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.rect(3, 3, 74, 119);
    doc.setLineWidth(0.2);
    doc.rect(4.2, 4.2, 71.6, 116.6);

    // Header: Brand & Event
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("EXECUTIVE TALKS MEDIA", 40, 11, { align: "center", maxWidth: 68 });

    const upperEvent = (eventTitle || "LEADERSHIP SUMMIT 2026").toUpperCase();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(upperEvent, 40, 16, { align: "center", maxWidth: 68 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("★ GATE ADMISSION PASS ★", 40, 21, { align: "center" });

    // Separator line
    doc.setLineWidth(0.4);
    doc.line(6, 24, 74, 24);

    // 1. PERSON NAME (With Explicit Label)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text("NAME OF THE PERSON", 40, 29, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    const upperName = (name || "DELEGATE").toUpperCase();
    doc.text(upperName, 40, 36, { align: "center", maxWidth: 68 });

    // Separator dashed
    doc.setLineWidth(0.2);
    doc.line(10, 41, 70, 41);

    // 2. COMPANY NAME (With Explicit Label)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text("NAME OF THE COMPANY", 40, 46, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const upperCompany = (company || "ENTERPRISE DELEGATE").toUpperCase();
    doc.text(upperCompany, 40, 52, { align: "center", maxWidth: 68 });

    // Separator line
    doc.setLineWidth(0.4);
    doc.line(6, 57, 74, 57);

    // 3. QR Code with Box
    if (qrDataUrl) {
      doc.setLineWidth(0.3);
      doc.rect(17, 61, 46, 46);
      doc.addImage(qrDataUrl, "PNG", 18.5, 62.5, 43, 43);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text("SCAN TO VERIFY PASS", 40, 111, { align: "center" });
    }

    // Separator line
    doc.setLineWidth(0.3);
    doc.line(6, 114, 74, 114);

    // Footer
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("✓ ADMISSION VERIFIED • ALL-ACCESS", 40, 119, { align: "center" });

    const safeName = upperName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    doc.save(`Gate_Badge_${safeName || "Pass"}.pdf`);
    toast.success("Badge PDF downloaded successfully!");
  } catch (err) {
    console.error("Download PDF error:", err);
    toast.error("Failed to generate PDF.");
  }
};

interface ThermalBadgePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: ThermalBadgeAttendee | null;
  defaultEventTitle?: string;
  autoPrintEnabled?: boolean;
}

export const ThermalBadgePassModal: React.FC<ThermalBadgePassModalProps> = ({
  isOpen,
  onClose,
  attendee,
  defaultEventTitle = "Executive Talks Media Summit 2026",
  autoPrintEnabled = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    try {
      return localStorage.getItem("etmedia_gate_autoprint") === "true";
    } catch {
      return false;
    }
  });

  const slipRef = useRef<HTMLDivElement | null>(null);

  const delegateName = attendee?.name || "Summit Attendee";
  const delegateOrg =
    attendee?.organization || attendee?.company_name || "";
  const eventTitle =
    attendee?.event_title || attendee?.eventTitle || defaultEventTitle;

  // Generate QR code data URL whenever attendee changes
  useEffect(() => {
    if (!attendee?.id) {
      setQrDataUrl("");
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://executivetalksmedia.in";
    const qrPayload = `${origin}/verify-pass/${encodeURIComponent(attendee.id)}`;

    QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 250,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate thermal badge QR code:", err);
      });
  }, [attendee?.id]);

  // Handle printing
  const handlePrint = () => {
    if (!slipRef.current) return;
    setIsPrinting(true);

    // Use outerHTML so the .thermal-pass-card wrapper and its border are 100% PRESERVED
    const printContent = slipRef.current.outerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gate Badge Pass - ${delegateName}</title>
            <style>
              @page {
                size: auto;
                margin: 4mm;
              }
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #000000 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              html, body {
                width: 100%;
                background: #ffffff !important;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: 4mm 0;
              }
              .thermal-pass-card {
                width: 78mm !important;
                max-width: 95vw !important;
                border: 3px solid #000000 !important;
                border-radius: 8px !important;
                padding: 5mm 4mm !important;
                text-align: center !important;
                background: #ffffff !important;
                page-break-inside: avoid !important;
                margin: 0 auto !important;
              }
              .delegate-name {
                font-size: 20px !important;
                font-weight: 900 !important;
                text-transform: uppercase !important;
                line-height: 1.15 !important;
                margin: 1.5mm 0 !important;
                word-break: break-word !important;
              }
              .company-name {
                font-size: 14.5px !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                line-height: 1.2 !important;
                margin: 1.5mm 0 !important;
                word-break: break-word !important;
              }
              .qr-container {
                margin: 2mm auto 1mm auto !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
              }
              .qr-img {
                width: 44mm !important;
                height: 44mm !important;
                display: block !important;
                margin: 0 auto !important;
                image-rendering: pixelated !important;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.error("Print error:", err);
          window.print();
        } finally {
          setIsPrinting(false);
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1500);
        }
      }, 300);
    } else {
      window.print();
      setIsPrinting(false);
    }
  };

  // Handle Download Image (PNG)
  const handleDownloadImg = async () => {
    if (!qrDataUrl) return;
    setIsDownloadingImage(true);
    await downloadBadgeImage(delegateName, delegateOrg || "Enterprise Delegate", qrDataUrl, eventTitle);
    setIsDownloadingImage(false);
  };

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    if (!qrDataUrl) return;
    setIsDownloadingPdf(true);
    await downloadBadgePdf(delegateName, delegateOrg || "Enterprise Delegate", qrDataUrl, eventTitle);
    setIsDownloadingPdf(false);
  };

  // Keyboard navigation: Enter prints, Escape closes
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        handlePrint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, qrDataUrl]);

  // Auto-print triggered upon modal display
  useEffect(() => {
    if (isOpen && (autoPrint || autoPrintEnabled) && qrDataUrl) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint, autoPrintEnabled, qrDataUrl]);

  if (!isOpen || !attendee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  Gate Admission Badge Slip
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                High-Contrast Monochrome Pass • Thermal & Standard Printer Ready
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close dialog (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Thermal Badge Slip Preview */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-100/70 dark:bg-slate-950/50">
          {/* Slip Container with Thermal Paper Shadow */}
          <div className="mx-auto w-[320px] bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300">
            {/* The printable slip component - Crisp badge card with clear border, labels, and alignment */}
            <div
              ref={slipRef}
              className="thermal-pass-card w-full border-[3px] border-black rounded-[8px] p-4 text-center bg-white text-black select-none shadow-sm"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}
            >
              {/* Header: Organization & Pass Title */}
              <div className="border-b-[2px] border-black pb-2.5 mb-3">
                <div className="text-[12px] font-black uppercase tracking-[1.5px] text-black">
                  Executive Talks Media
                </div>
                <div className="text-[10px] font-bold text-slate-700 uppercase mt-0.5 line-clamp-1">
                  {eventTitle}
                </div>
                <div className="inline-block mt-1.5 px-2.5 py-0.5 rounded-[4px] border border-black text-[9px] font-black uppercase tracking-wider bg-slate-50">
                  ★ Official Gate Admission Pass ★
                </div>
              </div>

              {/* 1. Person Name (With Explicit Label) */}
              <div className="py-1">
                <div className="text-[9.5px] font-black uppercase tracking-[1.2px] text-slate-600 mb-0.5">
                  Name of the Person
                </div>
                <div className="delegate-name text-[21px] font-black uppercase leading-tight tracking-tight text-black break-words">
                  {delegateName}
                </div>
              </div>

              {/* Divider */}
              <div className="my-2 border-t border-dashed border-slate-400" />

              {/* 2. Company Name (With Explicit Label) */}
              <div className="py-1">
                <div className="text-[9.5px] font-black uppercase tracking-[1.2px] text-slate-600 mb-0.5">
                  Name of the Company
                </div>
                <div className="company-name text-[15px] font-black uppercase leading-snug text-black break-words">
                  {delegateOrg || "Enterprise Delegate"}
                </div>
              </div>

              {/* Divider */}
              <div className="my-2.5 border-t-[2px] border-black" />

              {/* 3. Scannable QR Code */}
              <div className="qr-container my-1 flex flex-col justify-center items-center">
                <div className="p-1.5 border-[1.5px] border-black rounded-[6px] bg-white inline-block">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Attendee Verification QR Code"
                      className="qr-img w-[130px] h-[130px] block"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="w-[130px] h-[130px] flex items-center justify-center bg-slate-100 text-[10px] font-mono">
                      Generating QR...
                    </div>
                  )}
                </div>
                <div className="text-[8.5px] font-black uppercase tracking-wider text-slate-700 mt-1">
                  Scan to Verify Pass
                </div>
              </div>

              {/* Footer Divider & Status */}
              <div className="mt-2.5 pt-2 border-t-[2px] border-black">
                <div className="text-[9.5px] font-black uppercase tracking-wide text-black">
                  ✓ Admission Verified • All-Access
                </div>
                {attendee?.checked_in_at && (
                  <div className="text-[8px] font-bold text-slate-500 mt-0.5">
                    Checked In: {new Date(attendee.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              <span>Monochrome vector layout with clear borders & labels</span>
            </span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={(e) => {
                  const val = e.target.checked;
                  setAutoPrint(val);
                  try {
                    localStorage.setItem("etmedia_gate_autoprint", String(val));
                    toast.success(
                      val
                        ? "Auto-print enabled for next scans"
                        : "Auto-print disabled"
                    );
                  } catch {}
                }}
                className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Auto-Print on Scan
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer Controls: Print, Download Image, Download PDF */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Close (Esc)
            </button>

            <button
              type="button"
              onClick={() => {
                if (attendee?.id) {
                  navigator.clipboard.writeText(attendee.id);
                  toast.success(`Copied Pass ID: ${attendee.id}`);
                }
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copy Pass ID"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy ID</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Download Image (PNG) */}
            <button
              type="button"
              onClick={handleDownloadImg}
              disabled={isDownloadingImage || !qrDataUrl}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download Badge as PNG Image"
            >
              {isDownloadingImage ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              <span>Image</span>
            </button>

            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || !qrDataUrl}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-purple-500/40 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download Badge as PDF"
            >
              {isDownloadingPdf ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              <span>PDF</span>
            </button>

            {/* Print Badge Slip */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || !qrDataUrl}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-black hover:from-slate-800 hover:to-slate-900 dark:from-emerald-600 dark:to-teal-600 dark:hover:from-emerald-500 dark:hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPrinting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
