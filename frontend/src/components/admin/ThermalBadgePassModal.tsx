import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Printer, X, CheckCircle2, Copy, Sparkles, RefreshCw } from "lucide-react";
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
  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    try {
      return localStorage.getItem("etmedia_gate_autoprint") === "true";
    } catch {
      return false;
    }
  });

  const slipRef = useRef<HTMLDivElement | null>(null);

  const eventTitle =
    attendee?.event_title ||
    attendee?.eventTitle ||
    defaultEventTitle ||
    "Executive Talks Media Summit 2026";

  const delegateName = attendee?.name || "Summit Attendee";
  const delegateEmail = attendee?.email || "";
  const delegateOrg =
    attendee?.organization || attendee?.company_name || "";
  const delegateRole = attendee?.designation || "";
  const passCategory =
    attendee?.pass_name ||
    attendee?.registration_category ||
    "Official Delegate Pass";
  const passId = attendee?.id || "ETM-PASS-0000";

  const checkinTimeFormatted = (() => {
    const timeStr = attendee?.checked_in_at || attendee?.checkedInAt;
    const dateObj = timeStr ? new Date(timeStr) : new Date();
    return dateObj.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  })();

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
      width: 200,
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

    // Create a hidden print iframe to reliably print ONLY the TVS pass slip
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
                border: 2.5px solid #000;
                border-radius: 4px;
                padding: 3mm 2.5mm;
                text-align: center;
              }
              .pass-header {
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-bottom: 2px;
              }
              .event-title {
                font-size: 11px;
                font-weight: 900;
                line-height: 1.2;
                text-transform: uppercase;
                padding: 3px 0;
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
                margin: 3px 0 5px 0;
              }
              .pass-tag {
                display: inline-block;
                font-size: 9px;
                font-weight: 900;
                border: 1.5px solid #000;
                padding: 1px 6px;
                border-radius: 2px;
                text-transform: uppercase;
                margin-bottom: 4px;
              }
              .delegate-name {
                font-size: 15px;
                font-weight: 900;
                text-transform: uppercase;
                line-height: 1.15;
                margin: 4px 0 2px 0;
                word-break: break-word;
              }
              .delegate-meta {
                font-size: 8.5px;
                font-weight: 700;
                line-height: 1.25;
                margin-bottom: 2px;
                word-break: break-word;
              }
              .delegate-email {
                font-size: 8.5px;
                font-weight: 600;
                margin-bottom: 5px;
                word-break: break-all;
              }
              .qr-container {
                margin: 4px auto;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .qr-img {
                width: 32mm;
                height: 32mm;
                display: block;
                margin: 0 auto;
                image-rendering: pixelated;
              }
              .pass-id {
                font-family: monospace;
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 0.5px;
                margin-top: 2px;
              }
              .footer-divider {
                border-top: 1px dashed #000;
                margin: 4px 0 3px 0;
              }
              .footer-text {
                font-size: 7.5px;
                font-weight: 700;
                text-transform: uppercase;
                line-height: 1.2;
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
            {/* The printable slip component */}
            <div
              ref={slipRef}
              className="thermal-pass-card w-full border-[2.5px] border-black rounded-[4px] p-3 text-center bg-white text-black select-none"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}
            >
              {/* Header: Company & Summit Brand */}
              <div className="pass-header text-[10px] font-black uppercase tracking-[1.5px] text-black">
                EXECUTIVE TALKS MEDIA
              </div>

              {/* Event Name */}
              <div className="event-title text-[11px] font-black uppercase leading-tight py-1 my-1.5 border-t border-b border-dashed border-black text-black">
                {eventTitle}
              </div>

              {/* Pass Category Tag */}
              <div className="my-1">
                <span className="pass-tag inline-block text-[9px] font-black uppercase border-[1.5px] border-black px-2 py-0.5 rounded-[2px] tracking-wider text-black">
                  {passCategory}
                </span>
              </div>

              {/* Attendee Name (Prominent & Extra Bold) */}
              <div className="delegate-name text-[16px] font-black uppercase leading-snug my-1 tracking-tight text-black break-words">
                {delegateName}
              </div>

              {/* Organization & Designation (if provided) */}
              {(delegateRole || delegateOrg) && (
                <div className="delegate-meta text-[9px] font-bold text-black leading-tight mb-1 break-words">
                  {[delegateRole, delegateOrg].filter(Boolean).join(" • ")}
                </div>
              )}

              {/* Attendee Email */}
              {delegateEmail && (
                <div className="delegate-email text-[9px] font-semibold text-black break-all mb-1.5">
                  ✉ {delegateEmail}
                </div>
              )}

              {/* Black & White High Contrast QR Code */}
              <div className="qr-container my-1.5 flex justify-center items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Attendee Verification QR Code"
                    className="qr-img w-[115px] h-[115px] mx-auto block border border-black/30 p-1"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div className="w-[115px] h-[115px] mx-auto flex items-center justify-center bg-slate-100 border border-black text-[10px] font-mono">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Pass ID */}
              <div className="pass-id font-mono text-[9.5px] font-black tracking-wider text-black">
                ID: {passId}
              </div>

              {/* Dashed Separator */}
              <div className="footer-divider border-t border-dashed border-black my-1.5" />

              {/* Checkin Timestamp & Footer Validation */}
              <div className="footer-text text-[8px] font-bold uppercase tracking-tight text-black space-y-0.5">
                <div>GATE IN: {checkinTimeFormatted}</div>
                <div>★ OFFICIAL SUMMIT BADGE • VALID ENTRY ★</div>
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

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Close (Esc)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (attendee?.id) {
                  navigator.clipboard.writeText(attendee.id);
                  toast.success(`Copied Pass ID: ${attendee.id}`);
                }
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copy Pass ID"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy ID</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || !qrDataUrl}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-black hover:from-slate-800 hover:to-slate-900 dark:from-cyan-600 dark:to-teal-600 dark:hover:from-cyan-500 dark:hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPrinting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              <span>Print Badge Slip (TVS Thermal)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
