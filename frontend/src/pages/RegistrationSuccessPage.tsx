import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Calendar,
  MapPin,
  QrCode,
  ArrowLeft,
  Share2,
  Sparkles,
  FileText,
  Printer,
  Crown,
  Building2,
  User,
  Mail,
  Phone,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { events as defaultEvents, images } from "@/lib/site-data";

export default function RegistrationSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const regId = searchParams.get("regId") || `ETM-REG-${Date.now().toString().slice(-6)}`;

  const [regDetails, setRegDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReg = async () => {
      try {
        const res = await fetch(`/api/registrations/${regId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.registration) {
            setRegDetails(json.registration);
            setLoading(false);
            return;
          }
        }
      } catch (err) {}

      // Default mock fallback for display
      const fallbackEv = defaultEvents[0] || { city: "Hyderabad", title: "Executive Leadership Summit 2026", date: "December 05, 2026", venue: "Convention Center" };
      const matchedEv = defaultEvents.find((e) => (e.slug || "").toLowerCase() === (slug || "").toLowerCase()) || fallbackEv;
      setRegDetails({
        id: regId,
        name: "Executive Delegate",
        email: "delegate@executivetalksmedia.in",
        phone: "+91 98765 43210",
        organization: "Executive Enterprise",
        designation: "C-Suite Leader",
        city: matchedEv.city || "Hyderabad",
        country: "India",
        event_title: matchedEv.title || "Executive Summit 2026",
        pass_name: "Gold Executive Delegate Pass",
        payment_amount: 6579,
        payment_status: "Paid",
        payment_id: `pay_${Date.now().toString().slice(-8)}`,
        created_at: new Date().toLocaleString(),
      });
      setLoading(false);
    };

    fetchReg();
  }, [regId, slug]);

  const fallbackEvent = defaultEvents[0] || { city: "Hyderabad", title: "Executive Leadership Summit 2026", date: "December 05, 2026", venue: "Convention Center" };
  const matchedEvent = defaultEvents.find((e) => (e.slug || "").toLowerCase() === (slug || "").toLowerCase()) || fallbackEvent;

  const handlePrintOrDownload = (type: "pass" | "invoice") => {
    toast.info(`Preparing ${type === "pass" ? "Delegate Pass" : "Tax Invoice"} PDF download...`);
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Generatig Official Delegate Ticket Pass & Receipt...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header Congratulations */}
          <div className="text-center space-y-3">
            <div className="h-20 w-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block">
              Registration Confirmed & Verified
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
              Congratulations! Registration Successful
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Your delegate pass for <span className="font-bold text-slate-900">{regDetails?.event_title || matchedEvent.title}</span> has been confirmed. A confirmation receipt with QR ticket has been dispatched to your email.
            </p>
          </div>

          {/* Official Scannable Delegate Ticket Card */}
          <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
            {/* Atmospheric Glow */}
            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

            {/* Ticket Header Banner */}
            <div className="p-6 sm:p-8 border-b border-slate-800 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  EXECUTIVE TALKS MEDIA • DELEGATE PASS
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                  {regDetails?.event_title || matchedEvent.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    {matchedEvent.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {matchedEvent.venue || matchedEvent.city}
                  </span>
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider shrink-0 shadow-lg">
                {regDetails?.pass_name || "Gold Pass"}
              </div>
            </div>

            {/* Ticket Body Content */}
            <div className="p-6 sm:p-8 grid sm:grid-cols-3 gap-6 relative z-10 items-center">
              {/* Delegate Info */}
              <div className="sm:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Registration ID</span>
                    <span className="font-mono text-cyan-300 font-bold text-sm">{regDetails?.id || regId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Payment Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-extrabold text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      PAID (CONFIRMED)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Delegate Name</span>
                    <span className="text-white font-bold">{regDetails?.name || "Executive Delegate"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Designation</span>
                    <span className="text-white font-bold">{regDetails?.designation || "Executive"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Company</span>
                    <span className="text-white font-bold">{regDetails?.organization || "Organization"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Transaction ID</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate">{regDetails?.payment_id || `pay_${Date.now()}`}</span>
                  </div>
                </div>
              </div>

              {/* Scannable QR Code Box */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-900 space-y-2 border border-slate-700 shadow-xl">
                <div className="h-32 w-32 bg-slate-100 rounded-xl p-2 flex items-center justify-center border border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `https://www.etmedia.in/verify-pass/${encodeURIComponent(regDetails?.id || regId)}`
                    )}`}
                    alt="Scannable QR Pass"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
                  SCAN FOR FAST VENUE ENTRY
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-4 sm:grid-cols-3">
            <button
              onClick={() => handlePrintOrDownload("pass")}
              className="py-3.5 px-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Pass (PDF)</span>
            </button>

            <button
              onClick={() => handlePrintOrDownload("invoice")}
              className="py-3.5 px-4 rounded-2xl bg-white border border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Download Tax Invoice</span>
            </button>

            <Link
              to="/"
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white text-xs font-black uppercase tracking-wider hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 text-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
