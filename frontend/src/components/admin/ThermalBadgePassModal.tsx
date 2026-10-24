import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Printer, X, CheckCircle2, Copy, Sparkles, RefreshCw, Download, Image as ImageIcon, FileText } from "lucide-react";
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
 * Downloads a high-resolution PNG image containing ONLY:
 * 1. Person Name
 * 2. Company Name
 * 3. Scannable QR Code
 */
export const downloadBadgeImage = async (
  name: string,
  company: string,
  qrDataUrl: string
): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.error("Canvas context not available");
        return resolve();
      }

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Slip Outer Border (High Contrast Monochrome)
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, 560, 680);

      // 1. Person Name (Large, Bold, Centered)
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const upperName = (name || "DELEGATE").toUpperCase();
      ctx.fillText(upperName, 300, 95, 520);

      // 2. Company Name (Bold, Centered)
      ctx.font = "700 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const upperCompany = (company || "ENTERPRISE").toUpperCase();
      ctx.fillText(upperCompany, 300, 155, 520);

      // Divider line
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 195);
      ctx.lineTo(540, 195);
      ctx.stroke();

      // 3. QR Code (High-res, Centered)
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 100, 230, 400, 400);

          const a = document.createElement("a");
          const safeName = upperName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
          a.download = `Badge_${safeName || "Pass"}.png`;
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
 * Downloads a clean PDF file formatted for 80mm thermal slip containing ONLY:
 * 1. Person Name
 * 2. Company Name
 * 3. Scannable QR Code
 */
export const downloadBadgePdf = async (
  name: string,
  company: string,
  qrDataUrl: string
): Promise<void> => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 105], // 80mm thermal paper standard slip size
    });

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 80, 105, "F");

    // Outer border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.rect(3, 3, 74, 99);

    // 1. Person Name (Large, Bold)
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const upperName = (name || "DELEGATE").toUpperCase();
    doc.text(upperName, 40, 15, { align: "center", maxWidth: 68 });

    // 2. Company Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const upperCompany = (company || "ENTERPRISE").toUpperCase();
    doc.text(upperCompany, 40, 24, { align: "center", maxWidth: 68 });

    // Separator
    doc.setLineWidth(0.3);
    doc.line(8, 29, 72, 29);

    // 3. QR Code
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 14, 34, 52, 52);
    }

    const safeName = upperName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    doc.save(`Badge_${safeName || "Pass"}.pdf`);
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

  // Generate QR code data URL whenever attendee changes
  useEffect(() => {
    if (!attendee?.id) {
      setQrDataUrl("");
      return;
    }

    // QR payload can be scanned by verification page or gate scanner
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

    const printContent = slipRef.current.innerHTML;
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
            <title>Badge Pass - ${delegateName}</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 2mm;
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
              body {
                width: 76mm;
                margin: 0 auto;
                padding: 1mm;
                background: #fff;
              }
              .thermal-pass-card {
                width: 100%;
                border: 2px solid #000;
                border-radius: 4px;
                padding: 6mm 3mm;
                text-align: center;
              }
              .delegate-name {
                font-size: 19px;
                font-weight: 900;
                text-transform: uppercase;
                line-height: 1.2;
                margin: 2mm 0 2mm 0;
                word-break: break-word;
              }
              .company-name {
                font-size: 14px;
                font-weight: 800;
                text-transform: uppercase;
                line-height: 1.25;
                margin-bottom: 4mm;
                word-break: break-word;
              }
              .qr-container {
                margin: 2mm auto 1mm auto;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .qr-img {
                width: 44mm;
                height: 44mm;
                display: block;
                margin: 0 auto;
                image-rendering: pixelated;
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
            document.body.removeChild(iframe);
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
    await downloadBadgeImage(delegateName, delegateOrg || "Enterprise", qrDataUrl);
    setIsDownloadingImage(false);
  };

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    if (!qrDataUrl) return;
    setIsDownloadingPdf(true);
    await downloadBadgePdf(delegateName, delegateOrg || "Enterprise", qrDataUrl);
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

  // Handle auto-print if enabled
  useEffect(() => {
    if (!isOpen || !autoPrint || !qrDataUrl) {
      return;
    }
    const timer = setTimeout(() => {
      handlePrint();
    }, 400);
    return () => clearTimeout(timer);
  }, [isOpen, autoPrint, qrDataUrl]);

  if (!isOpen || !attendee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
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
                TVS Electronics Thermal Printer Compatible (80mm / 76mm Slip)
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
          <div className="mx-auto w-[310px] bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300">
            {/* The printable slip component - ONLY Person Name, Company Name, and QR Code */}
            <div
              ref={slipRef}
              className="thermal-pass-card w-full border-[2px] border-black rounded-[4px] p-4 text-center bg-white text-black select-none"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}
            >
              {/* 1. Person Name (Large, Bold) */}
              <div className="delegate-name text-[20px] font-black uppercase leading-tight tracking-tight text-black my-2 break-words">
                {delegateName}
              </div>

              {/* 2. Company Name (Bold) */}
              <div className="company-name text-[14px] font-black uppercase leading-snug text-black mb-3 break-words">
                {delegateOrg || "Enterprise"}
              </div>

              {/* 3. QR Code */}
              <div className="qr-container my-2 flex justify-center items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Attendee Verification QR Code"
                    className="qr-img w-[140px] h-[140px] mx-auto block border border-black/40 p-1"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div className="w-[140px] h-[140px] mx-auto flex items-center justify-center bg-slate-100 border border-black text-[10px] font-mono">
                    Generating QR...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              <span>Crisp monochrome vector output for direct thermal printing</span>
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

