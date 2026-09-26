import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Calendar, MapPin, ArrowLeft, CheckCircle, ShieldCheck, Mail, User, Building2 } from "lucide-react";
import { events as defaultEvents } from "@/lib/site-data";

export default function FreeRegistrationPendingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const regId = searchParams.get("regId") || `ETM-FREE-${Date.now().toString().slice(-6)}`;

  const [regDetails, setRegDetails] = useState<any>(null);

  useEffect(() => {
    const fetchReg = async () => {
      try {
        const res = await fetch(`/api/registrations/${regId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.registration) {
            setRegDetails(json.registration);
            return;
          }
        }
      } catch (e) {}

      const matchedEv = defaultEvents.find((e) => (e.slug || "").toLowerCase() === (slug || "").toLowerCase()) || defaultEvents[0]!;
      setRegDetails({
        id: regId,
        name: "Free Interest Delegate",
        email: "delegate@executivetalksmedia.in",
        phone: "+91 98765 43210",
        organization: "Executive Enterprise",
        designation: "Executive Delegate",
        city: matchedEv.city || "Hyderabad",
        country: "India",
        event_title: matchedEv.title || "Executive Summit 2026",
        payment_status: "Pending Approval",
        created_at: new Date().toLocaleString(),
      });
    };

    fetchReg();
  }, [regId, slug]);

  const matchedEvent = defaultEvents.find((e) => (e.slug || "").toLowerCase() === (slug || "").toLowerCase()) || defaultEvents[0]!;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 text-center space-y-6"
        >
          {/* Status Badge & Icon */}
          <div className="h-20 w-20 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/10">
            <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>

          <div>
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 inline-block mb-2">
              ⏳ Application Submitted — Pending Admin Approval
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              Complimentary Delegate Pass Under Review
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed mt-2">
              Thank you for applying! Your application for <span className="font-bold text-slate-900">{regDetails?.event_title || matchedEvent.title}</span> has been logged under Registration ID <code className="bg-slate-100 text-cyan-700 px-2 py-0.5 rounded font-mono font-bold">{regDetails?.id || regId}</code>.
            </p>
          </div>

          {/* Details Card */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-3 text-left">
            <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
              <span className="font-black uppercase text-slate-400 text-[10px]">APPLICATION STATUS</span>
              <span className="font-extrabold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full text-[11px]">
                PENDING SELECTION COMMITTEE APPROVAL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant Name</span>
                <span className="text-slate-900 font-bold">{regDetails?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Work Email</span>
                <span className="text-slate-900 font-bold">{regDetails?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Organization</span>
                <span className="text-slate-900 font-bold">{regDetails?.organization}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation</span>
                <span className="text-slate-900 font-bold">{regDetails?.designation}</span>
              </div>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="rounded-2xl bg-cyan-50 border border-cyan-200 p-4 text-xs text-cyan-900 text-left space-y-1">
            <h4 className="font-black flex items-center gap-1.5 text-cyan-800">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span>What Happens Next?</span>
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Our selection committee reviews complimentary delegate profiles. Once the Admin approves your application, your scannable QR ticket pass will be automatically dispatched to <strong>{regDetails?.email}</strong>.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/events/${matchedEvent.slug || slug || ""}`}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all text-center cursor-pointer shadow-md"
            >
              Back to Event Details
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto py-3 px-6 rounded-2xl border border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all text-center cursor-pointer"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
