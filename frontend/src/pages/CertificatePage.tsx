import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  Printer,
  Download,
  Share2,
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  User,
  ShieldCheck,
  ExternalLink,
  Copy,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/site/SEOHead";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";

interface CertificateData {
  id: string;
  certId: string;
  candidateName: string;
  designation?: string;
  organization?: string;
  eventTitle: string;
  city?: string;
  checkinStatus: string;
  checkedInAt: string;
  issueDate: string;
  verified: boolean;
}

export default function CertificatePage() {
  const { regId } = useParams<{ regId: string }>();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!regId) {
      setLoading(false);
      setErrorMsg("No certificate identifier provided.");
      return;
    }

    setLoading(true);
    fetch(`/api/certificate/${encodeURIComponent(regId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.certificate) {
          setCert(data.certificate);
        } else {
          setErrorMsg(data.message || "Certificate record not found or unverified.");
        }
      })
      .catch((err) => {
        console.error("Certificate fetch error:", err);
        setErrorMsg("Failed to connect to verification server.");
      })
      .finally(() => setLoading(false));
  }, [regId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Certificate verification link copied to clipboard!");
  };

  return (
    <>
      <SEOHead
        title={cert ? `Certificate of Attendance - ${cert.candidateName} | Executive Talks Media` : "Official E-Certificate Verification | Executive Talks Media"}
        description="Official verifiable Certificate of Attendance and Participation from Executive Talks Media Business Intelligence."
      />

      {/* PRINT-ONLY CSS */}
      <style>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-certificate-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: landscape A4;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white print:bg-white print:text-black">
        {/* TOP CONTROLS BAR (HIDDEN IN PRINT) */}
        <header className="no-print border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-8">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Executive Talks Media</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-xs"
                title="Copy public verification link"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share Link</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CERTIFICATE CANVAS */}
        <main className="flex-1 flex items-center justify-center p-3 sm:p-8 overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 space-y-4">
              <div className="h-12 w-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Verifying accredited certificate record...</p>
            </div>
          ) : errorMsg || !cert ? (
            <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4 shadow-2xl">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-3xl font-bold">
                ⚠️
              </div>
              <h2 className="text-lg font-black text-white">Certificate Verification Notice</h2>
              <p className="text-xs text-slate-400">{errorMsg || "Unable to locate attendee certificate record."}</p>
              <Link
                to="/"
                className="inline-block mt-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-5xl space-y-6">
              {/* STATUS BADGE (NO PRINT) */}
              <div className="no-print flex items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Official Authenticated Credential
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Certificate ID: <strong className="text-amber-400">{cert.certId}</strong>
                </span>
              </div>

              {/* THE LUXURY CERTIFICATE (A4 LANDSCAPE RATIO) */}
              <div
                ref={certRef}
                className="print-certificate-container w-full bg-[#fdfbf7] text-slate-900 rounded-3xl shadow-2xl border-8 border-double border-amber-600/40 p-6 sm:p-12 relative overflow-hidden flex flex-col justify-between min-h-[580px]"
                style={{
                  backgroundImage:
                    "radial-gradient(#e5e7eb 0.75px, transparent 0.75px), radial-gradient(#f3f4f6 0.75px, #fdfbf7 0.75px)",
                  backgroundSize: "30px 30px",
                  backgroundPosition: "0 0, 15px 15px",
                }}
              >
                {/* ORNAMENTAL CORNER FLOURISHES */}
                <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 border-amber-600 pointer-events-none" />
                <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-amber-600 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 border-amber-600 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-amber-600 pointer-events-none" />

                {/* WATERMARK BACKGROUND EMBLEM */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                  <img src={executivetalksLogo} alt="" className="w-[500px] h-[500px] object-contain grayscale" />
                </div>

                {/* 1. LETTERHEAD HEADER */}
                <div className="relative z-10 text-center space-y-3 pb-6 border-b border-amber-500/20">
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src={executivetalksLogo}
                      alt="Executive Talks Media Logo"
                      className="h-12 sm:h-14 w-auto object-contain rounded-lg shadow-2xs"
                    />
                    <div className="text-left">
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 leading-none">
                        Executive Talks Media
                      </h2>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mt-0.5">
                        Business Intelligence & Conclaves
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <span>Global Leadership Conclaves</span>
                    <span>•</span>
                    <span>C-Suite Summits</span>
                    <span>•</span>
                    <span>Excellence Awards</span>
                  </div>
                </div>

                {/* 2. CERTIFICATE CORE CONTENT */}
                <div className="relative z-10 text-center py-6 sm:py-8 space-y-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest border border-amber-300">
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      <span>Certificate of Participation & Leadership</span>
                    </div>
                    <p className="text-xs font-serif italic text-slate-500 pt-1">
                      This official certificate is proudly presented to
                    </p>
                  </div>

                  {/* CANDIDATE NAME IN LARGE LUXURY FONT */}
                  <div className="py-2">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif uppercase tracking-wide text-slate-950 drop-shadow-xs border-b-2 border-amber-500 inline-block px-6 pb-2">
                      {cert.candidateName}
                    </h1>
                  </div>

                  {/* CANDIDATE TITLE & ORG */}
                  <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-xl mx-auto">
                    {cert.designation ? `${cert.designation} — ` : ""}
                    <span className="text-slate-900">{cert.organization || "Distinguished Executive Delegate"}</span>
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-serif">
                    in recognition of active attendance, valuable thought leadership, and executive participation in
                  </p>

                  {/* EVENT TITLE BOX */}
                  <div className="max-w-xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 via-white to-amber-50/60 border border-amber-200/80 shadow-xs space-y-1">
                    <h3 className="text-sm sm:text-lg font-black text-cyan-900 uppercase tracking-wide">
                      {cert.eventTitle}
                    </h3>
                    <div className="flex items-center justify-center gap-3 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-amber-600" />
                        {new Date(cert.checkedInAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-amber-600" />
                        {cert.city || "Hyderabad, India"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. SIGNATORIES & GOLD EMBOSSED SEAL */}
                <div className="relative z-10 pt-6 border-t border-amber-500/20 grid grid-cols-3 items-end text-center gap-2">
                  {/* Left Signatory */}
                  <div className="space-y-1">
                    <div className="font-serif italic text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-400 pb-1 mx-auto max-w-[140px]">
                      Srikanth
                    </div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                      Founder & Managing Director
                    </div>
                    <div className="text-[10px] text-slate-500">Executive Talks Media</div>
                  </div>

                  {/* Center Official Gold Medallion Seal */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-double border-amber-600 bg-gradient-to-br from-amber-400 via-amber-200 to-amber-500 shadow-md flex flex-col items-center justify-center text-slate-950 p-2 text-center select-none">
                      <ShieldCheck className="h-5 w-5 text-amber-900" />
                      <span className="text-[8px] font-black uppercase tracking-tighter text-amber-950 leading-tight">
                        OFFICIAL
                      </span>
                      <span className="text-[9px] font-black uppercase text-amber-950">VERIFIED</span>
                      <span className="text-[7px] font-bold text-amber-900 leading-none">ATTENDANCE</span>
                    </div>
                  </div>

                  {/* Right Signatory */}
                  <div className="space-y-1">
                    <div className="font-serif italic text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-400 pb-1 mx-auto max-w-[140px]">
                      Executive Council
                    </div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                      Conference Convenor
                    </div>
                    <div className="text-[10px] text-slate-500">Summit & Awards Jury Board</div>
                  </div>
                </div>

                {/* 4. FOOTER VERIFICATION STRIP */}
                <div className="relative z-10 pt-4 mt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
                  <span>
                    Certificate ID: <strong className="text-slate-900">{cert.certId}</strong>
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified Real Database Admission</span>
                  </span>
                  <span>Issued: {new Date(cert.issueDate).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
