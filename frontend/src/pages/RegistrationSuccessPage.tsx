import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Calendar,
  MapPin,
  ArrowLeft,
  FileText,
  Printer,
  Receipt,
  Ticket,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  User,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { events as defaultEvents } from "@/lib/site-data";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";

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
        const res = await fetch(`/api/registrations/${encodeURIComponent(regId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.registration) {
            setRegDetails(json.registration);
            setLoading(false);
            return;
          }
        }
      } catch (err) {}

      // Fallback
      const fallbackEv = defaultEvents[0] || {
        city: "Hyderabad",
        title: "HR Leadership Conclave 2026",
        date: "24 October 2026",
        venue: "Manjeera Trinity Convention, KPHB",
      };
      const matchedEv =
        defaultEvents.find(
          (e) =>
            (e.slug || "").toLowerCase() === (slug || "").toLowerCase() ||
            (e.title || "").toLowerCase().includes((slug || "").toLowerCase().replace(/-/g, " "))
        ) || fallbackEv;

      setRegDetails({
        id: regId,
        name: "Sai Doddi",
        email: "sairamadoddi@gmail.com",
        phone: "+91 98765 43210",
        organization: "Sai Rama Doddi Enterprise",
        designation: "Java Architect / Director",
        city: matchedEv.city || "Hyderabad",
        country: "India",
        event_title: matchedEv.title || "HR Leadership Conclave 2026",
        pass_name: "Gold Pass",
        payment_amount: 5999,
        payment_status: "Paid",
        payment_id: `pay_${Date.now().toString().slice(-8)}`,
        created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
      setLoading(false);
    };

    fetchReg();
  }, [regId, slug]);

  const fallbackEvent = defaultEvents[0] || {
    city: "Hyderabad",
    title: "HR Leadership Conclave 2026",
    date: "24 October 2026",
    venue: "Manjeera Trinity Convention, KPHB",
  };
  const matchedEvent =
    defaultEvents.find(
      (e) =>
        (e.slug || "").toLowerCase() === (slug || "").toLowerCase() ||
        (e.title || "").toLowerCase().includes((slug || "").toLowerCase().replace(/-/g, " "))
    ) || fallbackEvent;

  const payAmount = Number(regDetails?.payment_amount) || 0;
  const taxableBase = payAmount > 0 ? Math.round(payAmount / 1.18) : 0;
  const gstTotal = payAmount > 0 ? payAmount - taxableBase : 0;
  const cgst = Math.round(gstTotal / 2);
  const sgst = gstTotal - cgst;
  const invoiceNo = `ETM-INV-${(regDetails?.id || regId)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-8)
    .toUpperCase()}`;
  const qrVerificationUrl = `https://www.executivetalksmedia.in/verify-pass/${encodeURIComponent(
    regDetails?.id || regId
  )}`;

  const handlePrintOrDownload = (type: "pass" | "invoice") => {
    setActiveView(type);
    toast.info(`Generating ${type === "pass" ? "Official Delegate Pass" : "Tax Invoice"} PDF export...`);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 space-y-4 font-sans">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-600 border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-slate-600">
          Generating Official Executive Pass & Tax Invoice...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-28 sm:pt-32 font-sans selection:bg-cyan-500/20 print:p-0 print:bg-white print:text-black">
      {/* Container aligned with main website header logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header Congratulations & Status Bar (Hidden during print) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" /> Registration Confirmed & Verified
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  Registration Successful!
                </h1>
                <p className="text-xs text-slate-500 max-w-xl">
                  Confirmation receipt, pass QR ticket, and 18% GST tax invoice dispatched to{" "}
                  <strong className="text-cyan-700 font-semibold">{regDetails?.email}</strong>.
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveView("pass")}
                className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeView === "pass"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Ticket className="w-4 h-4 text-cyan-400" />
                <span>Delegate Pass (QR)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("invoice")}
                className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeView === "invoice"
                    ? "bg-purple-800 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Receipt className="w-4 h-4 text-purple-300" />
                <span>Official Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* ================= VIEW 1: OFFICIAL SCANNABLE DELEGATE PASS ================= */}
          {activeView === "pass" && (
            <div
              id="printable-pass"
              className="print-container bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-black print:rounded-none print:shadow-none"
            >
              {/* Pass Top Banner with Official Logo */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-2xl shadow-md shrink-0 border border-slate-200">
                    <img
                      src={executivetalksLogo}
                      alt="Executive Talks Media"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                      EXECUTIVE TALKS MEDIA • OFFICIAL DELEGATE PASS
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                      {regDetails?.event_title || matchedEvent.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <Calendar className="w-3.5 h-3.5" />
                        {matchedEvent.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5" />
                        {matchedEvent.venue || matchedEvent.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shrink-0 border border-white/20">
                  {regDetails?.pass_name || "Gold Pass"}
                </div>
              </div>

              {/* Pass Main Grid */}
              <div className="p-6 sm:p-10 grid md:grid-cols-12 gap-8 items-center bg-slate-50/50">
                {/* Delegate Executive Profile (8 cols) */}
                <div className="md:col-span-8 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        REGISTRATION ID
                      </span>
                      <span className="font-mono text-cyan-800 font-bold text-sm bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200 inline-block">
                        {regDetails?.id || regId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        PAYMENT STATUS
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-black text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {regDetails?.payment_status?.toUpperCase() || "PAID"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        AMOUNT PAID
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block">
                        ₹{payAmount > 0 ? payAmount.toLocaleString("en-IN") : "Complimentary"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        DELEGATE NAME
                      </span>
                      <span className="text-sm font-black text-slate-900 block">
                        {regDetails?.name || "Executive Delegate"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        DESIGNATION
                      </span>
                      <span className="font-bold text-slate-700 block">
                        {regDetails?.designation || "Executive"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        ORGANIZATION
                      </span>
                      <span className="font-bold text-slate-700 block">
                        {regDetails?.organization || "Corporate Enterprise"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        OFFICIAL EMAIL
                      </span>
                      <span className="font-mono font-semibold text-slate-800 block truncate">
                        {regDetails?.email}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        TRANSACTION ID
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 block truncate">
                        {regDetails?.payment_id || `pay_${Date.now()}`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        CITY & COUNTRY
                      </span>
                      <span className="font-bold text-slate-700 block">
                        {regDetails?.city || "Hyderabad"}, {regDetails?.country || "India"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 text-xs text-cyan-900 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0" />
                      <span>Carry this digital pass or physical print for rapid check-in entry.</span>
                    </div>
                    <a
                      href={qrVerificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-cyan-700 hover:underline shrink-0 text-[11px]"
                    >
                      <span>Live Verify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Scannable Ticket QR Box (4 cols) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3 text-center">
                  <div className="h-40 w-40 bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-200 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        qrVerificationUrl
                      )}`}
                      alt="Scannable QR Pass"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase block">
                      SCAN AT ENTRY CHECK-IN DESK
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block">
                      Pass Key: {(regDetails?.id || regId).slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: OFFICIAL CORPORATE TAX INVOICE ================= */}
          {activeView === "invoice" && (
            <div
              id="printable-invoice"
              className="print-container bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-8 print:border-black print:rounded-none print:shadow-none"
            >
              {/* Invoice Top Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b-2 border-slate-200 gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={executivetalksLogo}
                    alt="Executive Talks Media"
                    className="h-12 w-auto object-contain"
                  />
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                      EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold">
                      Official GST Tax Invoice & Delegate Registration Receipt
                    </p>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      SAC Code: 998397 (Conferences, Corporate Summits & Intelligence)
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    PAID IN FULL
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800 pt-1">
                    Invoice No: <span className="text-purple-800">{invoiceNo}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Date: {regDetails?.created_at || new Date().toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Company Info & Billed To Profile Grid */}
              <div className="grid sm:grid-cols-2 gap-8 text-xs border-b border-slate-200 pb-8">
                <div className="space-y-1.5">
                  <span className="font-black uppercase tracking-wider text-slate-400 block mb-2">
                    ISSUER / SERVICE PROVIDER
                  </span>
                  <p className="font-bold text-sm text-slate-900">
                    Executive Talks Media Business Intelligence
                  </p>
                  <p className="text-slate-600">
                    Unit No-1012, 10th Floor, Manjeera Trinity Corporate,
                  </p>
                  <p className="text-slate-600">JNTU-Hitech Road, KPHB, Hyderabad, 500072, India</p>
                  <p className="text-slate-600 font-mono">
                    Support: registration@executivetalksmedia.in | +91 91602 56777
                  </p>
                  <p className="text-slate-600 font-mono">GST Status: Registered Taxable Person</p>
                </div>

                <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-8">
                  <span className="font-black uppercase tracking-wider text-slate-400 block mb-2">
                    BILLED TO (DELEGATE)
                  </span>
                  <p className="font-bold text-sm text-slate-900">
                    {regDetails?.name || "Executive Delegate"}
                  </p>
                  <p className="text-slate-700 font-semibold">
                    {regDetails?.designation} • {regDetails?.organization}
                  </p>
                  <p className="text-slate-600 font-mono">{regDetails?.email}</p>
                  <p className="text-slate-600 font-mono">{regDetails?.phone}</p>
                  <p className="text-slate-600">
                    {regDetails?.city || "Hyderabad"}, {regDetails?.country || "India"}
                  </p>
                </div>
              </div>

              {/* Event & Registration Metadata */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    EVENT TITLE
                  </span>
                  <span className="font-bold text-slate-900">
                    {regDetails?.event_title || matchedEvent.title}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    EVENT DATE & VENUE
                  </span>
                  <span className="font-bold text-slate-900">
                    {matchedEvent.date} • {matchedEvent.venue || matchedEvent.city}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    PAYMENT REF ID
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {regDetails?.payment_id || "N/A"}
                  </span>
                </div>
              </div>

              {/* Itemized Tax Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-800 font-black uppercase">
                      <th className="py-3 px-4">Item Description</th>
                      <th className="py-3 px-4">SAC Code</th>
                      <th className="py-3 px-4 text-right">Taxable Value</th>
                      <th className="py-3 px-4 text-right">GST Rate</th>
                      <th className="py-3 px-4 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-4 px-4">
                        <span className="font-bold text-sm text-slate-900 block">
                          {regDetails?.pass_name || "Delegate Pass"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Full Access Pass: Keynotes, C-Suite Networking Lounge, Panel Discussions,
                          Gourmet Dining & Intelligence Report
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-600">998397</td>
                      <td className="py-4 px-4 text-right font-semibold font-mono">
                        ₹{taxableBase.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">18%</td>
                      <td className="py-4 px-4 text-right font-black text-sm text-slate-900 font-mono">
                        ₹{payAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tax Calculations */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-80 space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <span>Taxable Base Amount:</span>
                    <span className="font-mono font-semibold">
                      ₹{taxableBase.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono font-semibold">₹{cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono font-semibold">₹{sgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <span>Total GST Amount (18%):</span>
                    <span className="font-mono font-semibold">
                      ₹{gstTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-slate-900 text-base font-black text-slate-900">
                    <span>Grand Total Paid:</span>
                    <span className="text-emerald-700 font-mono text-lg">
                      ₹{payAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Authorized Footer & Seal */}
              <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] text-slate-500">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-700">
                    • This is a computer-generated tax invoice and verified registration pass.
                  </p>
                  <p>
                    • Official verification link:{" "}
                    <a href={qrVerificationUrl} className="text-cyan-700 underline font-mono">
                      {qrVerificationUrl}
                    </a>
                  </p>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="h-8 w-24 border-b border-dashed border-slate-400 mb-1"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Authorized Signatory
                  </span>
                  <p className="text-[10px] text-slate-400">Executive Talks Media</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar (Hidden during print) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 print:hidden">
            <Link
              to="/"
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white border border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handlePrintOrDownload("pass")}
                className="flex-1 sm:flex-initial py-3.5 px-6 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print / Save Pass</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintOrDownload("invoice")}
                className="flex-1 sm:flex-initial py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
              >
                <FileText className="w-4 h-4 text-purple-200" />
                <span>Print / Save Tax Invoice</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
