import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Printer, X, CheckCircle2, Copy, Sparkles, RefreshCw, Image as ImageIcon, FileText, RotateCcw } from "lucide-react";
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
  print_count?: number;
  printed_at?: string;
  is_reprint?: boolean;
  [key: string]: any;
}

export type ThermalLabelFormat = "50x75" | "75x50" | "2up";

/**
 * Downloads a high-resolution PNG image containing:
 * - Clean outer border
 * - Attendee Name
 * - Company Name
 * - Centered Scannable QR Code
 * Formats: 50x75mm (Portrait), 75x50mm (Landscape), 2-UP
 */
export const downloadBadgeImage = async (
  name: string,
  company: string,
  qrDataUrl: string,
  formatOrTitle?: ThermalLabelFormat | string
): Promise<void> => {
  const format: ThermalLabelFormat =
    formatOrTitle === "75x50" || formatOrTitle === "2up" || formatOrTitle === "50x75"
      ? formatOrTitle
      : "50x75";
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Canvas context not available");
        return resolve();
      }

      const upperName = (name || "DELEGATE").toUpperCase();
      const upperCompany = (company || "ENTERPRISE DELEGATE").toUpperCase();

      if (format === "75x50") {
        // 75mm x 50mm (3" x 2" Landscape) @ 300 DPI: 900 x 600
        canvas.width = 900;
        canvas.height = 600;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 900, 600);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeRect(18, 18, 864, 564);

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(upperName, 450, 85, 820);

        ctx.fillStyle = "#1E293B";
        ctx.font = "800 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(upperCompany, 450, 145, 820);

        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.onload = () => {
            const qrSize = 370;
            ctx.drawImage(qrImg, (900 - qrSize) / 2, 195, qrSize, qrSize);
            const a = document.createElement("a");
            const safeName = upperName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
            a.download = `Badge_75x50_${safeName || "Pass"}.png`;
            a.href = canvas.toDataURL("image/png");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("75 × 50 mm Badge Image (PNG) downloaded!");
            resolve();
          };
          qrImg.onerror = () => resolve();
          qrImg.src = qrDataUrl;
          return;
        }
      } else {
        // 50mm x 75mm (2" x 3" Portrait - True-Ally DT standard) @ 300 DPI: 600 x 900
        canvas.width = 600;
        canvas.height = 900;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 600, 900);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeRect(18, 18, 564, 864);

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "900 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(upperName, 300, 95, 530);

        ctx.fillStyle = "#1E293B";
        ctx.font = "800 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(upperCompany, 300, 160, 530);

        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.onload = () => {
            const qrSize = 460;
            ctx.drawImage(qrImg, (600 - qrSize) / 2, 230, qrSize, qrSize);
            const a = document.createElement("a");
            const safeName = upperName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
            a.download = `Badge_50x75_${safeName || "Pass"}.png`;
            a.href = canvas.toDataURL("image/png");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("50 × 75 mm Badge Image (PNG) downloaded!");
            resolve();
          };
          qrImg.onerror = () => resolve();
          qrImg.src = qrDataUrl;
          return;
        }
      }
      resolve();
    } catch (err) {
      console.error("Download image error:", err);
      toast.error("Failed to generate image.");
      resolve();
    }
  });
};

/**
 * Downloads a clean PDF formatted for thermal badge sticker printing
 */
export const downloadBadgePdf = async (
  name: string,
  company: string,
  qrDataUrl: string,
  formatOrTitle?: ThermalLabelFormat | string
): Promise<void> => {
  try {
    const format: ThermalLabelFormat =
      formatOrTitle === "75x50" || formatOrTitle === "2up" || formatOrTitle === "50x75"
        ? formatOrTitle
        : "50x75";
    const is75x50 = format === "75x50";
    const W = is75x50 ? 76.2 : 50.8;
    const H = is75x50 ? 50.8 : 76.2;

    const doc = new jsPDF({
      orientation: is75x50 ? "landscape" : "portrait",
      unit: "mm",
      format: is75x50 ? [50.8, 76.2] : [50.8, 76.2],
    });

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, H, "F");

    // Outer Border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.rect(1.8, 1.8, W - 3.6, H - 3.6);

    const upperName = (name || "DELEGATE").toUpperCase();
    const upperCompany = (company || "ENTERPRISE DELEGATE").toUpperCase();

    if (is75x50) {
      // 75x50 Landscape Layout
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(upperName, W / 2, 8.5, { align: "center", maxWidth: W - 8 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(upperCompany, W / 2, 14, { align: "center", maxWidth: W - 8 });

      if (qrDataUrl) {
        const qrSize = 31;
        const qrX = (W - qrSize) / 2;
        const qrY = 16.5;
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      }
    } else {
      // 50x75 Portrait Layout (True-Ally DT 50x75)
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12.5);
      doc.text(upperName, W / 2, 10, { align: "center", maxWidth: W - 6 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(upperCompany, W / 2, 16.5, { align: "center", maxWidth: W - 6 });

      if (qrDataUrl) {
        const qrSize = 38;
        const qrX = (W - qrSize) / 2;
        const qrY = 22;
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      }
    }

    const safeName = upperName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    doc.save(`Badge_${format}_${safeName || "Pass"}.pdf`);
    toast.success(`Badge PDF (${format}) downloaded successfully!`);
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
  onPrintRecorded?: (newPrintCount: number) => void;
}

export const ThermalBadgePassModal: React.FC<ThermalBadgePassModalProps> = ({
  isOpen,
  onClose,
  attendee,
  defaultEventTitle = "Executive Talks Media Summit 2026",
  autoPrintEnabled = false,
  onPrintRecorded,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [printCount, setPrintCount] = useState<number>(0);
  const [labelFormat, setLabelFormat] = useState<ThermalLabelFormat>(() => {
    try {
      return (localStorage.getItem("etmedia_label_format") as ThermalLabelFormat) || "50x75";
    } catch {
      return "50x75";
    }
  });
  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    try {
      return localStorage.getItem("etmedia_gate_autoprint") === "true";
    } catch {
      return false;
    }
  });

  const slipRef = useRef<HTMLDivElement | null>(null);

  const handleSelectFormat = (fmt: ThermalLabelFormat) => {
    setLabelFormat(fmt);
    try {
      localStorage.setItem("etmedia_label_format", fmt);
    } catch {}
  };

  useEffect(() => {
    if (attendee) {
      setPrintCount(Number(attendee.print_count || 0));
    }
  }, [attendee?.id, attendee?.print_count, isOpen]);

  const isReprint = printCount > 0;

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

  // Handle printing calibrated for POSIFLOW PSF423 & True-Ally 50x75 DT Roll
  const handlePrint = () => {
    if (!slipRef.current) return;
    setIsPrinting(true);

    // Call backend to record the print
    if (attendee?.id) {
      const token = localStorage.getItem("etmedia_admin_token") || localStorage.getItem("adminToken");
      fetch("/api/admin/checkin/record-print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ regId: attendee.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && typeof data.print_count === "number") {
            setPrintCount(data.print_count);
            if (onPrintRecorded) onPrintRecorded(data.print_count);
            if (data.is_reprint) {
              toast.info(`Badge Slip Reprinted (Print #${data.print_count})`);
            } else {
              toast.success("Gate Badge Slip Printed & Recorded!");
            }
          }
        })
        .catch((err) => {
          console.error("[ThermalBadge] Error recording print:", err);
        });
    }

    // Instantly increment local count so the UI updates to 'Reprint' without waiting for network
    setPrintCount((prev) => (prev > 0 ? prev + 1 : 1));

    // Dynamic dimensions based on True-Ally 50x75 / 75x50 / 2-UP
    const W_MM = labelFormat === "75x50" ? "75mm" : labelFormat === "2up" ? "104mm" : "50mm";
    const H_MM = labelFormat === "75x50" ? "50mm" : "75mm";

    const printContent = slipRef.current.outerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = W_MM;
    iframe.style.height = H_MM;
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Badge - ${delegateName}</title>
            <style>
              @page {
                size: ${W_MM} ${H_MM};
                margin: 0mm !important;
              }
              * {
                box-sizing: border-box !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                color: #000000 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                width: ${W_MM} !important;
                height: ${H_MM} !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                overflow: hidden !important;
              }
              .thermal-2up-wrapper {
                width: 104mm !important;
                height: 75mm !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 0 1mm !important;
              }
              .thermal-pass-card {
                width: ${labelFormat === "75x50" ? "75mm" : "50mm"} !important;
                height: ${labelFormat === "75x50" ? "50mm" : "75mm"} !important;
                max-width: ${labelFormat === "75x50" ? "75mm" : "50mm"} !important;
                max-height: ${labelFormat === "75x50" ? "50mm" : "75mm"} !important;
                box-sizing: border-box !important;
                border: 2px solid #000000 !important;
                border-radius: 4px !important;
                padding: ${labelFormat === "75x50" ? "2mm 2.5mm" : "2.5mm 2mm"} !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                align-items: center !important;
                text-align: center !important;
                background: #ffffff !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                overflow: hidden !important;
              }
              .delegate-name {
                font-size: ${labelFormat === "75x50" ? "15pt" : "13.5pt"} !important;
                font-weight: 900 !important;
                text-transform: uppercase !important;
                line-height: 1.15 !important;
                margin: 0 !important;
                word-break: break-word !important;
              }
              .company-name {
                font-size: ${labelFormat === "75x50" ? "10.5pt" : "9.5pt"} !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                line-height: 1.15 !important;
                margin-top: 1.2mm !important;
                word-break: break-word !important;
              }
              .qr-container {
                margin: auto 0 0.5mm 0 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
              }
              .qr-img {
                width: ${labelFormat === "75x50" ? "28mm" : "38mm"} !important;
                height: ${labelFormat === "75x50" ? "28mm" : "38mm"} !important;
                display: block !important;
                margin: 0 auto !important;
                image-rendering: pixelated !important;
              }
            </style>
          </head>
          <body>
            ${
              labelFormat === "2up"
                ? `<div class="thermal-2up-wrapper">${printContent}${printContent}</div>`
                : printContent
            }
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
      }, 350);
    } else {
      window.print();
      setIsPrinting(false);
    }
  };

  // Handle Download Image (PNG)
  const handleDownloadImg = async () => {
    if (!qrDataUrl) return;
    setIsDownloadingImage(true);
    await downloadBadgeImage(delegateName, delegateOrg || "Enterprise Delegate", qrDataUrl, labelFormat);
    setIsDownloadingImage(false);
  };

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    if (!qrDataUrl) return;
    setIsDownloadingPdf(true);
    await downloadBadgePdf(delegateName, delegateOrg || "Enterprise Delegate", qrDataUrl, labelFormat);
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
            <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center ${
              isReprint
                ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            }`}>
              {isReprint ? <RotateCcw className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  {isReprint ? "Gate Badge (Reprint)" : "Thermal Badge (POSIFLOW / True-Ally)"}
                </h3>
                {isReprint ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40 flex items-center gap-1">
                    <RotateCcw className="h-2.5 w-2.5" />
                    Reprint {printCount > 1 ? `#${printCount}` : ""}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                    POSIFLOW Ready
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Calibrated for POSIFLOW PSF423 &amp; True-Ally 50×75mm DT Roll
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

        {/* Modal Body: Controls, Printer Tips & Thermal Badge Preview */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-100/70 dark:bg-slate-950/50 flex flex-col items-center">
          
          {/* Label Size / Roll Format Switcher */}
          <div className="w-full max-w-[400px] flex items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl border border-slate-300/80 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSelectFormat("50x75")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                labelFormat === "50x75"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              50 × 75 mm (Vertical)
            </button>
            <button
              type="button"
              onClick={() => handleSelectFormat("75x50")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                labelFormat === "75x50"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              75 × 50 mm (Horizontal)
            </button>
            <button
              type="button"
              onClick={() => handleSelectFormat("2up")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                labelFormat === "2up"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              2-UP (Dual)
            </button>
          </div>

          {/* POSIFLOW PSF423 Direct Setup Tips Box */}
          <div className="w-full max-w-[400px] bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-300/80 dark:border-cyan-800/60 rounded-xl p-2.5 text-[11px] text-cyan-950 dark:text-cyan-200">
            <div className="font-black flex items-center gap-1.5 text-cyan-900 dark:text-cyan-300 mb-1">
              <Printer className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
              <span>POSIFLOW PSF423 Print Dialog Settings:</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10.5px] pl-1 font-medium">
              <div>• Margins: <strong>None</strong></div>
              <div>• Headers/Footers: <strong>OFF</strong></div>
              <div>• Paper: <strong>{labelFormat === "75x50" ? "75×50 mm" : labelFormat === "2up" ? "104×75 mm" : "50×75 mm"}</strong></div>
              <div>• Scale: <strong>100% / Fit</strong></div>
            </div>
          </div>

          {/* Slip Container with Thermal Paper Shadow */}
          <div className="bg-white text-black p-3 rounded-2xl shadow-xl border border-slate-300 flex justify-center items-center">
            {/* The printable slip component */}
            {labelFormat === "2up" ? (
              <div className="flex items-center gap-2">
                {/* Left Sticker */}
                <div
                  ref={slipRef}
                  className="thermal-pass-card w-[150px] h-[225px] border-[2px] border-black rounded-[4px] p-2 text-center bg-white text-black select-none shadow-xs flex flex-col justify-between items-center"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
                    aspectRatio: "50 / 75",
                  }}
                >
                  <div className="w-full pt-0.5 px-0.5">
                    <div className="delegate-name text-[13px] font-black uppercase leading-tight tracking-tight text-black break-words">
                      {delegateName}
                    </div>
                    <div className="company-name text-[9.5px] font-bold uppercase leading-snug text-slate-800 break-words mt-1">
                      {delegateOrg || "Enterprise Delegate"}
                    </div>
                  </div>
                  <div className="qr-container my-auto pb-0.5 flex justify-center items-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="qr-img w-[90px] h-[90px] block"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="w-[90px] h-[90px] flex items-center justify-center bg-slate-100 text-[9px] font-mono">
                        QR...
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sticker (Twin copy on 2-UP roll) */}
                <div
                  className="thermal-pass-card w-[150px] h-[225px] border-[2px] border-black rounded-[4px] p-2 text-center bg-white text-black select-none shadow-xs flex flex-col justify-between items-center opacity-85"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
                    aspectRatio: "50 / 75",
                  }}
                >
                  <div className="w-full pt-0.5 px-0.5">
                    <div className="delegate-name text-[13px] font-black uppercase leading-tight tracking-tight text-black break-words">
                      {delegateName}
                    </div>
                    <div className="company-name text-[9.5px] font-bold uppercase leading-snug text-slate-800 break-words mt-1">
                      {delegateOrg || "Enterprise Delegate"}
                    </div>
                  </div>
                  <div className="qr-container my-auto pb-0.5 flex justify-center items-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="qr-img w-[90px] h-[90px] block"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="w-[90px] h-[90px] flex items-center justify-center bg-slate-100 text-[9px] font-mono">
                        QR...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : labelFormat === "75x50" ? (
              <div
                ref={slipRef}
                className="thermal-pass-card w-[310px] h-[207px] sm:w-[340px] sm:h-[227px] border-[2.5px] border-black rounded-[6px] p-2.5 text-center bg-white text-black select-none shadow-xs flex flex-col justify-between items-center"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
                  aspectRatio: "75 / 50",
                }}
              >
                <div className="w-full pt-1 px-1">
                  <div className="delegate-name text-[18px] sm:text-[20px] font-black uppercase leading-tight tracking-tight text-black break-words">
                    {delegateName}
                  </div>
                  <div className="company-name text-[12px] sm:text-[13.5px] font-bold uppercase leading-snug text-slate-800 break-words mt-1">
                    {delegateOrg || "Enterprise Delegate"}
                  </div>
                </div>
                <div className="qr-container my-auto pb-1 flex justify-center items-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Attendee Verification QR Code"
                      className="qr-img w-[110px] h-[110px] sm:w-[125px] sm:h-[125px] block"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="w-[110px] h-[110px] flex items-center justify-center bg-slate-100 text-[10px] font-mono">
                      Generating QR...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Default 50x75mm Vertical - Exact True-Ally 50x75 roll size */
              <div
                ref={slipRef}
                className="thermal-pass-card w-[210px] h-[315px] sm:w-[230px] sm:h-[345px] border-[2.5px] border-black rounded-[6px] p-3 text-center bg-white text-black select-none shadow-xs flex flex-col justify-between items-center"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
                  aspectRatio: "50 / 75",
                }}
              >
                <div className="w-full pt-1 px-1">
                  <div className="delegate-name text-[16px] sm:text-[18px] font-black uppercase leading-tight tracking-tight text-black break-words">
                    {delegateName}
                  </div>
                  <div className="company-name text-[11px] sm:text-[12.5px] font-bold uppercase leading-snug text-slate-800 break-words mt-1.5">
                    {delegateOrg || "Enterprise Delegate"}
                  </div>
                </div>

                <div className="qr-container my-auto pb-1 flex justify-center items-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Attendee Verification QR Code"
                      className="qr-img w-[135px] h-[135px] sm:w-[150px] sm:h-[150px] block"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="w-[135px] h-[135px] flex items-center justify-center bg-slate-100 text-[10px] font-mono">
                      Generating QR...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Auto-Print Toggle */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 w-full max-w-[400px]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              <span>Border • Name • Company • QR</span>
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

            {/* Print or Reprint Badge Slip */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || !qrDataUrl}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isReprint
                  ? "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20"
                  : "bg-gradient-to-r from-slate-900 to-black hover:from-slate-800 hover:to-slate-900 dark:from-emerald-600 dark:to-teal-600 dark:hover:from-emerald-500 dark:hover:to-teal-500"
              }`}
            >
              {isPrinting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isReprint ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              <span>{isReprint ? `Reprint Slip${printCount > 1 ? ` (#${printCount})` : ""}` : "Print Slip"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
