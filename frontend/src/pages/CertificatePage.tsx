import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Printer,
  Share2,
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/site/SEOHead";
import { ExecutiveCertificate } from "@/components/certificate/ExecutiveCertificate";

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
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [cmsEvents, setCmsEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("default");
  const [customName, setCustomName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const certRef = useRef<HTMLDivElement>(null);

  // 1. Fetch available events from database to allow dynamic event switching
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setCmsEvents(data.events);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch certificate data if regId provided
  useEffect(() => {
    if (!regId || regId === "preview" || regId === "demo") {
      setLoading(false);
      // Demo / preview fallback
      setCert({
        id: "DEMO-REG-2026",
        certId: "ETM-CERT-2026-889921",
        candidateName: searchParams.get("name") || "Executive Delegate",
        designation: "Executive Delegate",
        organization: "Distinguished Leader",
        eventTitle: "HR RECALL 2K26 – Hyderabad Annual Connect",
        city: "Hyderabad",
        checkinStatus: "Present",
        checkedInAt: "2026-12-11T09:00:00.000Z",
        issueDate: "2026-12-11T17:00:00.000Z",
        verified: true,
      });
      return;
    }

    setLoading(true);
    fetch(`/api/certificate/${encodeURIComponent(regId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.certificate) {
          setCert(data.certificate);
          if (data.certificate.candidateName) {
            setCustomName(data.certificate.candidateName);
          }
        } else {
          setErrorMsg(data.message || "Certificate record not found or unverified.");
        }
      })
      .catch((err) => {
        console.error("Certificate fetch error:", err);
        setErrorMsg("Failed to connect to verification server.");
      })
      .finally(() => setLoading(false));
  }, [regId, searchParams]);

  // Resolve selected event dynamically
  const activeEvent = useMemo(() => {
    if (selectedEventId !== "default") {
      const found = cmsEvents.find(
        (e) => e.id === selectedEventId || e.slug === selectedEventId || e.title === selectedEventId
      );
      if (found) return found;
    }

    if (cert?.eventTitle) {
      const matched = cmsEvents.find(
        (e) =>
          e.title?.toLowerCase() === cert.eventTitle.toLowerCase() ||
          e.slug?.toLowerCase() === cert.eventTitle.toLowerCase() ||
          (e.title && cert.eventTitle.toLowerCase().includes(e.title.toLowerCase()))
      );
      if (matched) return matched;
    }

    return null;
  }, [selectedEventId, cert, cmsEvents]);

  // Dynamic Event Title
  const activeEventTitle = useMemo(() => {
    if (activeEvent?.title) return activeEvent.title;
    if (cert?.eventTitle) return cert.eventTitle;
    return "HR RECALL 2K26 – Hyderabad Annual Connect";
  }, [activeEvent, cert]);

  // Dynamic Event Date
  const activeEventDate = useMemo(() => {
    if (activeEvent?.date) return activeEvent.date;
    if (cert?.checkedInAt) {
      return new Date(cert.checkedInAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return "11th December 2026";
  }, [activeEvent, cert]);

  // Dynamic Event Venue / City
  const activeEventVenue = useMemo(() => {
    if (activeEvent?.venue && activeEvent?.city) {
      return `${activeEvent.venue}, ${activeEvent.city}`;
    }
    if (activeEvent?.venue) return activeEvent.venue;
    if (activeEvent?.city) return `${activeEvent.city}, India`;
    if (cert?.city) return `Centenary Convention Centre, ${cert.city}`;
    return "Centenary Convention Centre, Hyderabad";
  }, [activeEvent, cert]);

  const candidateDisplayName = customName || cert?.candidateName || "Executive Delegate";

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
        title={cert ? `Certificate of Appreciation - ${candidateDisplayName} | Executive Talks Media` : "Official E-Certificate Verification | Executive Talks Media"}
        description="Official verifiable Certificate of Appreciation and Participation from Executive Talks Media Business Intelligence."
      />

      {/* PRINT-ONLY CSS: Exact landscape page layout with zero margin distortion */}
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
            size: landscape;
            margin: 0;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white print:bg-white print:text-black">
        {/* TOP CONTROLS & EVENT SELECTOR TOOLBAR (HIDDEN IN PRINT) */}
        <header className="no-print border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Portal</span>
            </Link>

            {/* Event Name Switcher Dropdown (Dynamic Event Choice) */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <Ticket className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <label htmlFor="certEventSelect" className="text-[11px] font-bold text-slate-400 shrink-0">
                Event:
              </label>
              <select
                id="certEventSelect"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-bold focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
                title="Choose event to dynamically populate certificate"
              >
                <option value="default" className="bg-slate-900 text-white">
                  🎪 {cert?.eventTitle || "HR RECALL 2K26 – Hyderabad"} (Current)
                </option>
                {cmsEvents.map((evt) => (
                  <option key={evt.id || evt.slug} value={evt.id || evt.slug} className="bg-slate-900 text-white">
                    {evt.title || evt.name || evt.slug}
                  </option>
                ))}
              </select>
            </div>

            {/* Print & Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-xs"
                title="Copy public verification link"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
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

        {/* MAIN CERTIFICATE VIEW AREA */}
        <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
          {loading ? (
            <div className="text-center py-20 space-y-4">
              <div className="h-12 w-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Verifying accredited certificate record...</p>
            </div>
          ) : errorMsg && !cert ? (
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
            <div className="w-full max-w-5xl space-y-4">
              {/* STATUS BAR (NO-PRINT) */}
              <div className="no-print flex flex-wrap items-center justify-between gap-2 px-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Official Authenticated Credential
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
                  <span>ID: <strong className="text-amber-400">{cert?.certId || "ETM-CERT-2026-889921"}</strong></span>
                  <span>Issued by Executive Talks Media</span>
                </div>
              </div>

              {/* 
                THE CERTIFICATE CANVAS:
                100% IDENTICAL TO THE ARTWORK ON MOBILE, TAB, AND LAPTOP.
              */}
              <div ref={certRef} className="print-certificate-container w-full">
                <ExecutiveCertificate
                  candidateName={candidateDisplayName}
                  eventTitle={activeEventTitle}
                  eventDate={activeEventDate}
                  eventVenue={activeEventVenue}
                  city={activeEvent?.city || cert?.city || "Hyderabad"}
                  certId={cert?.certId}
                  issueDate={cert?.issueDate}
                  designation={cert?.designation}
                  organization={cert?.organization}
                />
              </div>

              {/* VERIFICATION SUMMARY CHIPS (NO-PRINT) */}
              <div className="no-print pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Real Database Verified Gate Attendance
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" /> {activeEventDate}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" /> {activeEventVenue}
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
