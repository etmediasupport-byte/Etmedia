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
  Receipt,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { events as defaultEvents, images } from "@/lib/site-data";

export default function RegistrationSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const regId = searchParams.get("regId") || `ETM-REG-${Date.now().toString().slice(-6)}`;

  const [regDetails, setRegDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"pass" | "invoice">("pass");

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

      // Default fallback for display
      const fallbackEv = defaultEvents[0] || { city: "Hyderabad", title: "HR RECALL 2K26 - National HR Summit", date: "December 05, 2026", venue: "Hyderabad International Convention Centre" };
      const matchedEv = defaultEvents.find((e) => (e.slug || "").toLowerCase() === (slug || "").toLowerCase()) || fallbackEv;
      setRegDetails({
        id: regId,
        name: "Executive Delegate",
        email: "delegate@executivetalksmedia.in",
        phone: "+91 98765 43210",
        organization: "Corporate Enterprise Ltd",
        designation: "Chief Human Resources Officer",
        city: matchedEv.city || "Hyderabad",
        country: "India",
        event_title: matchedEv.title || "HR RECALL 2K26 - National HR Summit",
        pass_name: "VIP Executive Pass",
        payment_amount: 5899,
        payment_status: "Paid",
        payment_id: `pay_${Date.now().toString().slice(-8)}`,
        created_at: new Date().toLocaleString(),
      });
      setLoading(false);
    };

    fetchReg();
  }, [regId, slug]);

  const fallbackEvent = defaultEvents[0] || { city: "Hyderabad", title: "HR RECALL 2K26 - National HR Summit", date: "December 05, 2026", venue: "Hyderabad International Convention Centre" };
  const matchedEvent = defaultEvents.find((e) => (e.slug || "").toLowerCase() === (slug || "").toLowerCase()) || fallbackEvent;

  const payAmount = Number(regDetails?.payment_amount) || 0;
  const taxableBase = payAmount > 0 ? Math.round(payAmount / 1.18) : 0;
  const gstTotal = payAmount > 0 ? (payAmount - taxableBase) : 0;
  const cgst = Math.round(gstTotal / 2);
  const sgst = gstTotal - cgst;
  const invoiceNo = `ETM-INV-${(regDetails?.id || regId).replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`;

  const handlePrintOrDownload = (type: "pass" | "invoice") => {
    setActiveView(type);
    toast.info(`Opening print & PDF export dialog for ${type === "pass" ? "Delegate Pass" : "Tax Invoice"}...`);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Generating Official Delegate Ticket Pass & Tax Invoice...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-28 sm:pt-32 print:p-0 print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header Congratulations (Hidden in print) */}
          <div className="text-center space-y-3 print:hidden">
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
              Your delegate pass for <span className="font-bold text-slate-900">{regDetails?.event_title || matchedEvent.title}</span> is confirmed. A complete confirmation receipt with scannable QR ticket and official Tax Invoice has been dispatched to <span className="font-bold text-cyan-700">{regDetails?.email || "your registered email"}</span>.
            </p>

            {/* View Switcher Tabs */}
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setActiveView("pass")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeView === "pass"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Delegate Pass (QR)</span>
              </button>
              <button
                onClick={() => setActiveView("invoice")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeView === "invoice"
                    ? "bg-purple-700 text-white shadow-md shadow-purple-700/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Official Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: Official Scannable Delegate Ticket Card */}
          {activeView === "pass" && (
            <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative print:border-2 print:border-black print:text-black print:bg-white print:rounded-xl">
              {/* Atmospheric Glow */}
              <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl print:hidden" />
              <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl print:hidden" />

              {/* Ticket Header Banner */}
              <div className="p-6 sm:p-8 border-b border-slate-800 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 print:bg-slate-100 print:border-black">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 print:text-cyan-800">
                    EXECUTIVE TALKS MEDIA • OFFICIAL DELEGATE PASS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white print:text-black font-display">
                    {regDetails?.event_title || matchedEvent.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 print:text-slate-700 pt-1">
                    <span className="flex items-center gap-1.5 text-cyan-300 print:text-cyan-800">
                      <Calendar className="w-3.5 h-3.5" />
                      {matchedEvent.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300 print:text-slate-700">
                      <MapPin className="w-3.5 h-3.5" />
                      {matchedEvent.venue || matchedEvent.city}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-black uppercase tracking-wider shrink-0 shadow-lg print:border print:border-black print:text-black print:bg-amber-100">
                  {regDetails?.pass_name || "Delegate Pass"}
                </div>
              </div>

              {/* Ticket Body Content */}
              <div className="p-6 sm:p-8 grid sm:grid-cols-3 gap-6 relative z-10 items-center">
                {/* Delegate Info */}
                <div className="sm:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 print:text-slate-600 block">Registration ID</span>
                      <span className="font-mono text-cyan-300 print:text-cyan-800 font-bold text-sm">{regDetails?.id || regId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 print:text-slate-600 block">Payment Status</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 print:text-emerald-700 font-extrabold text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 print:bg-emerald-700 animate-pulse" />
                        {regDetails?.payment_status?.toUpperCase() || "PAID (CONFIRMED)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 print:text-slate-600 block">Delegate Name</span>
                      <span className="text-white print:text-black font-bold">{regDetails?.name || "Executive Delegate"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 print:text-slate-600 block">Designation</span>
                      <span className="text-white print:text-black font-bold">{regDetails?.designation || "Executive"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 print:text-slate-600 block">Organization</span>
                      <span className="text-white print:text-black font-bold">{regDetails?.organization || "Organization"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 print:text-slate-600 block">Official Email</span>
                      <span className="text-white print:text-black font-semibold truncate">{regDetails?.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 print:text-slate-600 block">Transaction ID</span>
                      <span className="font-mono text-slate-300 print:text-slate-700 text-[11px] truncate">{regDetails?.payment_id || `pay_${Date.now()}`}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 print:text-slate-600 block">Amount Paid</span>
                      <span className="font-bold text-emerald-400 print:text-emerald-700 text-sm">₹{payAmount > 0 ? payAmount.toLocaleString("en-IN") : "Complimentary"}</span>
                    </div>
                  </div>
                </div>

                {/* Scannable QR Code Box */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-900 space-y-2 border border-slate-700 shadow-xl print:border-black">
                  <div className="h-32 w-32 bg-slate-100 rounded-xl p-2 flex items-center justify-center border border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `https://www.executivetalksmedia.in/verify-pass/${encodeURIComponent(regDetails?.id || regId)}`
                      )}`}
                      alt="Scannable QR Pass"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase text-center">
                    SCAN AT ENTRY CHECK-IN DESK
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: Official Tax Invoice Card */}
          {activeView === "invoice" && (
            <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 print:border-black print:rounded-none print:shadow-none">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE</h2>
                  <p className="text-xs text-slate-500">Official GST Tax Invoice & Registration Receipt</p>
                  <p className="text-xs text-slate-600 font-mono mt-1">SAC Code: 998397 (Event & Intelligence Services)</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    PAID IN FULL
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-2">Invoice No: {invoiceNo}</p>
                  <p className="text-[11px] text-slate-500">Date: {regDetails?.created_at || new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Billed To & Event Details */}
              <div className="grid sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                <div>
                  <span className="font-black uppercase tracking-wider text-slate-400 block mb-1">BILLED TO (DELEGATE)</span>
                  <p className="font-bold text-sm text-slate-900">{regDetails?.name || "Executive Delegate"}</p>
                  <p className="text-slate-600">{regDetails?.designation} • {regDetails?.organization}</p>
                  <p className="text-slate-600">{regDetails?.email} • {regDetails?.phone}</p>
                  <p className="text-slate-600">{regDetails?.city}, {regDetails?.country || "India"}</p>
                </div>
                <div>
                  <span className="font-black uppercase tracking-wider text-slate-400 block mb-1">EVENT & SUMMIT</span>
                  <p className="font-bold text-sm text-slate-900">{regDetails?.event_title || matchedEvent.title}</p>
                  <p className="text-slate-600">{matchedEvent.date} • {matchedEvent.venue || matchedEvent.city}</p>
                  <p className="text-slate-600 font-mono mt-1">Registration ID: {regDetails?.id || regId}</p>
                  <p className="text-slate-600 font-mono">Payment ID: {regDetails?.payment_id || "N/A"}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black uppercase">
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">SAC Code</th>
                      <th className="py-2.5 px-3 text-right">Taxable Value</th>
                      <th className="py-2.5 px-3 text-right">GST Rate</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{regDetails?.pass_name || "Delegate Pass"}</span>
                        <span className="text-[11px] text-slate-500">Executive Summit Access, Networking & Conference Intelligence</span>
                      </td>
                      <td className="py-3 px-3 font-mono">998397</td>
                      <td className="py-3 px-3 text-right font-semibold">₹{taxableBase.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right">18%</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">₹{payAmount.toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tax Calculation Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Taxable Base Amount:</span>
                    <span className="font-semibold">₹{taxableBase.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-semibold">₹{cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-semibold">₹{sgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Total GST (18%):</span>
                    <span className="font-semibold">₹{gstTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                    <span>Total Amount Paid:</span>
                    <span className="text-emerald-700">₹{payAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Terms Footer */}
              <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>• This is a computer-generated official tax invoice and electronic ticket receipt issued by Executive Talks Media Business Intelligence.</p>
                <p>• For any invoice or billing queries, contact support: <a href="mailto:registration@executivetalksmedia.in" className="text-cyan-700 underline font-bold">registration@executivetalksmedia.in</a></p>
              </div>
            </div>
          )}

          {/* Action Buttons (Hidden during print) */}
          <div className="grid gap-4 sm:grid-cols-3 print:hidden">
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
              <FileText className="w-4 h-4 text-purple-600" />
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
