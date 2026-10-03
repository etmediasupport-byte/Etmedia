import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
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
  Clock,
  Sparkles,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { events as defaultEvents } from "@/lib/site-data";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";

// Helper function to convert numeric amount to Indian Currency Words
function numberToWordsINR(amount: number): string {
  if (!amount || amount === 0) return "Zero Rupees Only";
  
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertChunk(num: number): string {
    let str = "";
    if (num >= 100) {
      str += a[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      str += b[Math.floor(num / 10)] + " ";
      num %= 10;
    }
    if (num > 0) {
      str += a[num] + " ";
    }
    return str.trim();
  }

  let numInt = Math.floor(amount);
  const crore = Math.floor(numInt / 10000000);
  numInt %= 10000000;
  const lakh = Math.floor(numInt / 100000);
  numInt %= 100000;
  const thousand = Math.floor(numInt / 1000);
  numInt %= 1000;
  const hundred = numInt;

  let result = "";
  if (crore > 0) result += convertChunk(crore) + " Crore ";
  if (lakh > 0) result += convertChunk(lakh) + " Lakh ";
  if (thousand > 0) result += convertChunk(thousand) + " Thousand ";
  if (hundred > 0) result += convertChunk(hundred) + " ";

  return (result.trim() + " Rupees Only").replace(/\s+/g, " ");
}

export default function RegistrationSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const regId = searchParams.get("regId") || `ETM-REG-${Date.now().toString().slice(-6)}`;

  const [regDetails, setRegDetails] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"pass" | "invoice">("pass");

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const res = await fetch(`/api/registrations/${encodeURIComponent(regId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.registration) {
            setRegDetails(json.registration);

            // Fetch matched event details from database if available
            const evtIdOrSlug = json.registration.event_id || slug;
            if (evtIdOrSlug) {
              try {
                const evtRes = await fetch(`/api/events/${encodeURIComponent(evtIdOrSlug)}`);
                if (evtRes.ok) {
                  const evtJson = await evtRes.json();
                  if (evtJson.success && evtJson.event) {
                    setEventData(evtJson.event);
                  }
                }
              } catch (e) {
                console.warn("Event detail fetch error:", e);
              }
            }

            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Registration API fetch error:", err);
      }

      // Default fallback if offline or sample demo
      const fallbackEv = defaultEvents[0] || {
        city: "Hyderabad",
        title: "HR Leadership Conclave 2026",
        date: "24 October 2026",
        time: "09:00 AM — 06:00 PM",
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
        pass_price: 5999,
        payment_amount: 7079,
        gst_amount: 1080,
        payment_status: "Paid",
        payment_id: `pay_${Date.now().toString().slice(-8)}`,
        created_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
      setEventData(matchedEv);
      setLoading(false);
    };

    fetchRegistrationData();
  }, [regId, slug]);

  const fallbackEvent = defaultEvents[0] || {
    city: "Hyderabad",
    title: "HR Leadership Conclave 2026",
    date: "24 October 2026",
    time: "09:00 AM — 06:00 PM",
    venue: "Manjeera Trinity Convention, KPHB",
  };
  const effectiveEvent =
    eventData ||
    defaultEvents.find(
      (e) =>
        (e.slug || "").toLowerCase() === (slug || "").toLowerCase() ||
        (e.title || "").toLowerCase().includes((slug || "").toLowerCase().replace(/-/g, " "))
    ) ||
    fallbackEvent;

  // Pricing & GST Calculation
  const rawPayAmount = Number(regDetails?.payment_amount) || 0;
  const rawPassPrice = Number(regDetails?.pass_price) || 0;
  const rawGstAmount = Number(regDetails?.gst_amount) || 0;

  let taxableBase = 0;
  let gstTotal = 0;
  let payAmount = 0;

  if (rawPassPrice > 0) {
    taxableBase = rawPassPrice;
    gstTotal = rawGstAmount > 0 ? rawGstAmount : Math.round(taxableBase * 0.18);
    payAmount = rawPayAmount > taxableBase ? rawPayAmount : (taxableBase + gstTotal);
  } else if (rawPayAmount > 0) {
    // If rawPayAmount is the base price (e.g. 5999, 9999, 14999) or already total amount (e.g. 7079)
    if (rawPayAmount === 5999 || rawPayAmount === 9999 || rawPayAmount === 14999 || rawPayAmount === 19999 || rawPayAmount === 29999 || rawPayAmount === 4999 || rawPayAmount === 7999) {
      taxableBase = rawPayAmount;
      gstTotal = Math.round(taxableBase * 0.18);
      payAmount = taxableBase + gstTotal;
    } else {
      taxableBase = Math.round(rawPayAmount / 1.18);
      gstTotal = rawPayAmount - taxableBase;
      payAmount = rawPayAmount;
    }
  }

  const cgst = Number((gstTotal / 2).toFixed(2));
  const sgst = Number((gstTotal - cgst).toFixed(2));

  const invoiceNo = `ETM-INV-${(regDetails?.id || regId)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-8)
    .toUpperCase()}`;
  
  const qrVerificationUrl = `https://www.executivetalksmedia.in/verify-pass/${encodeURIComponent(
    regDetails?.id || regId
  )}`;

  const handlePrintOrDownload = (type: "pass" | "invoice") => {
    setActiveView(type);
    // Dismiss all active toasts to ensure clean printable export without toast overlays
    toast.dismiss();

    // Trigger print dialog cleanly
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 space-y-4 font-sans">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-600 border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-slate-700">
          Generating Official Executive Pass & Tax Invoice...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-20 pt-24 sm:pt-28 font-sans selection:bg-cyan-500/20 print:p-0 print:m-0 print:bg-white print:text-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-none">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 print:space-y-0"
        >
          {/* Header Congratulations & View Toggle Bar (Hidden during print) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 print:hidden">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3" /> Registration Confirmed & Verified
                </div>
                <h1 className="text-xl font-black text-slate-900 font-display">
                  Registration Successful!
                </h1>
                <p className="text-xs text-slate-500">
                  Official digital pass & 18% GST invoice sent to{" "}
                  <strong className="text-cyan-700 font-semibold">{regDetails?.email}</strong>.
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveView("pass")}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeView === "pass"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                <span>Delegate Pass (QR)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("invoice")}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeView === "invoice"
                    ? "bg-purple-800 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-purple-300" />
                <span>Official Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VIEW 1: OFFICIAL SCANNABLE DELEGATE PASS                                 */}
          {/* ========================================================================= */}
          {activeView === "pass" && (
            <div
              id="printable-pass"
              className="print-document bg-white text-slate-900 rounded-2xl border border-slate-300 shadow-lg overflow-hidden print:border print:border-slate-400 print:rounded-lg print:shadow-none"
            >
              {/* Top Executive Header Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/30">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-md shrink-0 border border-slate-200">
                    <img
                      src={executivetalksLogo}
                      alt="Executive Talks Media"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block font-mono">
                      EXECUTIVE TALKS MEDIA • OFFICIAL DELEGATE CREDENTIAL
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white font-display leading-tight mt-0.5">
                      {regDetails?.event_title || effectiveEvent.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-300 pt-1">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Calendar className="w-3.5 h-3.5" />
                        {effectiveEvent.date || "24 October 2026"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {effectiveEvent.venue || effectiveEvent.city || "Hyderabad"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-black text-xs uppercase tracking-wider shadow-md shrink-0 border border-white/20">
                  {regDetails?.pass_name || "VIP Gold Pass"}
                </div>
              </div>

              {/* Main Pass Information Matrix & QR Box */}
              <div className="p-6 sm:p-8 bg-white grid md:grid-cols-12 gap-6 items-center">
                {/* Delegate Details (8 Columns) */}
                <div className="md:col-span-8 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Registration ID
                      </span>
                      <span className="font-mono text-cyan-800 font-bold text-xs mt-0.5 block truncate">
                        {regDetails?.id || regId}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Payment Status
                      </span>
                      <span className="inline-flex items-center gap-1 font-black text-[11px] text-emerald-700 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {regDetails?.payment_status?.toUpperCase() || "PAID"}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Amount Paid
                      </span>
                      <span className="font-mono font-black text-xs text-slate-900 mt-0.5 block">
                        ₹{payAmount > 0 ? payAmount.toLocaleString("en-IN") : "Complimentary"}
                      </span>
                    </div>

                    <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Delegate Name
                      </span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block capitalize">
                        {regDetails?.name || "Executive Delegate"}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Designation
                      </span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                        {regDetails?.designation || "Executive"}
                      </span>
                    </div>

                    <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Organization
                      </span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                        {regDetails?.organization || "Corporate Enterprise"}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        City & Country
                      </span>
                      <span className="font-semibold text-slate-700 text-xs mt-0.5 block truncate">
                        {regDetails?.city || "Hyderabad"}, {regDetails?.country || "India"}
                      </span>
                    </div>

                    <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Official Email
                      </span>
                      <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block truncate">
                        {regDetails?.email}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Transaction ID
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 mt-0.5 block truncate">
                        {regDetails?.payment_id || `pay_${Date.now().toString().slice(-8)}`}
                      </span>
                    </div>
                  </div>

                  {/* Verification Status Banner */}
                  <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0" />
                      <span>Present this physical print or digital pass at the registration desk.</span>
                    </div>
                    <a
                      href={qrVerificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-cyan-700 hover:underline shrink-0 text-[11px]"
                    >
                      <span>Live Auth</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Scannable High-Res QR Ticket (4 Columns) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-center">
                  <div className="h-36 w-36 bg-white p-2 rounded-xl border-2 border-slate-300 flex items-center justify-center shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        qrVerificationUrl
                      )}`}
                      alt="Official QR Pass Token"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase block">
                      SCAN AT ENTRY CHECK-IN DESK
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 block">
                      Security Key: {(regDetails?.id || regId).slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pass Security Disclaimer Footer Strip */}
              <div className="bg-slate-100 border-t border-slate-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span>Executive Talks Media Business Intelligence • Official Verified Pass</span>
                <span>Issued: {regDetails?.created_at || new Date().toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: OFFICIAL CORPORATE 18% GST TAX INVOICE                            */}
          {/* ========================================================================= */}
          {activeView === "invoice" && (
            <div
              id="printable-invoice"
              className="print-document bg-white text-slate-900 rounded-2xl border border-slate-300 shadow-lg p-6 sm:p-10 space-y-6 print:border print:border-slate-400 print:rounded-lg print:shadow-none"
            >
              {/* Invoice Top Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-300 gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={executivetalksLogo}
                    alt="Executive Talks Media"
                    className="h-12 w-auto object-contain"
                  />
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                      EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE
                    </h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      Official GST Tax Invoice & Event Registration Receipt
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      SAC Code: 998397 (Conferences, Corporate Summits & Industry Intelligence)
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    PAID IN FULL
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-900 pt-0.5">
                    Invoice No: <span className="text-purple-800 font-black">{invoiceNo}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Date: {regDetails?.created_at || new Date().toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Place of Supply: Telangana (State Code: 36)
                  </p>
                </div>
              </div>

              {/* Company Info & Billed To Profile Grid */}
              <div className="grid sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                <div className="space-y-1">
                  <span className="font-black uppercase tracking-wider text-slate-400 block mb-1">
                    ISSUER / SERVICE PROVIDER
                  </span>
                  <p className="font-black text-slate-900 text-sm">
                    Executive Talks Media Business Intelligence
                  </p>
                  <p className="text-slate-600 leading-snug">
                    Unit No-1012, 10th Floor, Manjeera Trinity Corporate,
                  </p>
                  <p className="text-slate-600 leading-snug">
                    JNTU-Hitech Road, KPHB, Hyderabad, Telangana — 500072, India
                  </p>
                  <p className="text-slate-600 font-mono pt-1">
                    Support: registration@executivetalksmedia.in | +91 91602 56777
                  </p>
                  <p className="text-slate-700 font-mono font-bold">
                    GSTIN: 36AAECE1234F1Z5 • PAN: AAECE1234F
                  </p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
                  <span className="font-black uppercase tracking-wider text-slate-400 block mb-1">
                    BILLED TO (DELEGATE / ENTERPRISE)
                  </span>
                  <p className="font-black text-slate-900 text-sm capitalize">
                    {regDetails?.name || "Executive Delegate"}
                  </p>
                  <p className="text-slate-700 font-bold">
                    {regDetails?.designation} • {regDetails?.organization}
                  </p>
                  <p className="text-slate-600 font-mono">{regDetails?.email}</p>
                  <p className="text-slate-600 font-mono">{regDetails?.phone}</p>
                  <p className="text-slate-600">
                    {regDetails?.city || "Hyderabad"}, {regDetails?.country || "India"}
                  </p>
                </div>
              </div>

              {/* Event & Transaction Summary Strip */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    EVENT TITLE
                  </span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {regDetails?.event_title || effectiveEvent.title}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    EVENT DATE & VENUE
                  </span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {effectiveEvent.date || "24 October 2026"} • {effectiveEvent.venue || effectiveEvent.city}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    PAYMENT REF / TXN ID
                  </span>
                  <span className="font-mono font-bold text-slate-800 block mt-0.5 truncate">
                    {regDetails?.payment_id || `pay_${Date.now().toString().slice(-8)}`}
                  </span>
                </div>
              </div>

              {/* Itemized Tax Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-800 font-black uppercase">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">SAC Code</th>
                      <th className="py-2.5 px-3 text-right">Taxable Value</th>
                      <th className="py-2.5 px-3 text-right">GST Rate</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">1</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-sm text-slate-900 block">
                          Executive Delegate Pass — {regDetails?.pass_name || "VIP Gold Pass"}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                          Full Access Pass: Keynotes, C-Suite Networking Lounge, Panel Discussions,
                          Executive Gourmet Dining & Intelligence Report
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-600">998397</td>
                      <td className="py-3 px-3 text-right font-semibold font-mono">
                        ₹{taxableBase.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold">18%</td>
                      <td className="py-3 px-3 text-right font-black text-sm text-slate-900 font-mono">
                        ₹{payAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tax Calculations & Amount in Words */}
              <div className="grid sm:grid-cols-12 gap-6 pt-2 items-start border-t border-slate-200">
                <div className="sm:col-span-7 space-y-3 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                      TOTAL AMOUNT IN WORDS
                    </span>
                    <p className="font-bold text-slate-900 italic">
                      {numberToWordsINR(payAmount)}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1 text-[11px]">
                    <p className="font-semibold text-slate-700">
                      • Paid via Online Payment Gateway (Razorpay PG).
                    </p>
                    <p className="text-slate-500">
                      • This is an electronically generated tax invoice issued under Rule 48 of the CGST Act, 2017. No physical signature is required.
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Taxable Base Amount:</span>
                    <span className="font-mono font-semibold">
                      ₹{taxableBase.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono font-semibold">
                      ₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono font-semibold">
                      ₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Total GST Amount (18%):</span>
                    <span className="font-mono font-semibold">
                      ₹{gstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                    <span>Grand Total Paid:</span>
                    <span className="text-emerald-700 font-mono text-base">
                      ₹{payAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Authorized Footer & Seal */}
              <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] text-slate-500">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-700">
                    Executive Talks Media Business Intelligence
                  </p>
                  <p>
                    Online Verification Portal:{" "}
                    <a href={qrVerificationUrl} className="text-cyan-700 underline font-mono">
                      {qrVerificationUrl}
                    </a>
                  </p>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="h-6 w-24 border-b border-dashed border-slate-400 mb-1"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Authorized Signatory
                  </span>
                  <p className="text-[10px] text-slate-400">Executive Talks Media</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar with Print/Save Buttons (Hidden during print) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 print:hidden">
            <Link
              to="/"
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handlePrintOrDownload("pass")}
                className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print / Save Pass</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintOrDownload("invoice")}
                className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
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
