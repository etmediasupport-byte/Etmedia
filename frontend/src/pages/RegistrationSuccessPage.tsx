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
  Sparkles,
  Check,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { events as defaultEvents } from "@/lib/site-data";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";
import PromotionBadgeCard, { PromotionTemplate } from "@/components/site/PromotionBadgeCard";

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
  const [activeView, setActiveView] = useState<"pass" | "invoice" | "promotion">("pass");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [globalInvoiceEnabled, setGlobalInvoiceEnabled] = useState<boolean | null>(null);
  const [activePromotionTemplate, setActivePromotionTemplate] = useState<PromotionTemplate | null>(null);
  const [attendeePhoto, setAttendeePhoto] = useState<string>("");

  // Directly fetch global invoice visibility & active promotion template from server
  useEffect(() => {
    fetch("/api/global-invoice-visibility")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setGlobalInvoiceEnabled(data.show_invoice === 1);
        }
      })
      .catch((err) => console.warn("Global invoice visibility fetch err:", err));
  }, []);

  // Fetch active promotion template from server (event-specific or global fallback)
  useEffect(() => {
    const targetEventId = regDetails?.event_id || eventData?.id || "";
    const targetSlug = slug || regDetails?.event_slug || eventData?.slug || "";
    const query = new URLSearchParams();
    if (targetEventId) query.set("eventId", targetEventId);
    if (targetSlug) query.set("slug", targetSlug);

    fetch(`/api/promotion-templates/active${query.toString() ? `?${query.toString()}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.template) {
          setActivePromotionTemplate(data.template);
        }
      })
      .catch((err) => console.warn("Active promotion template fetch err:", err));
  }, [slug, regDetails?.event_id, eventData?.id]);

  const handleSaveAttendeePhoto = async (newPhotoUrl: string) => {
    setAttendeePhoto(newPhotoUrl);
    const activeId = regDetails?.id || regId;
    if (!activeId) return;
    try {
      await fetch(`/api/registrations/${encodeURIComponent(activeId)}/photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: newPhotoUrl }),
      });
      toast.success("Photo synced to your registration profile!");
    } catch (err) {
      console.warn("Error updating photo to database:", err);
    }
  };

  // Admin view detection: Only active when opened explicitly from Admin Dashboard with ?admin=true
  const isAdmin = searchParams.get("admin") === "true";

  // User invoice visibility set globally by Admin in dashboard:
  // When Admin hides invoices, NO user can view or print invoice, and NO payment/amount details appear on pass!
  const isUserInvoiceHidden = (
    globalInvoiceEnabled === false ||
    (globalInvoiceEnabled === null && (
      regDetails?.global_show_invoice === 0 ||
      regDetails?.global_show_invoice === false ||
      regDetails?.show_invoice_to_user === 0 ||
      regDetails?.show_invoice_to_user === false ||
      regDetails?.show_invoice === 0 ||
      regDetails?.show_invoice === false ||
      eventData?.show_invoice_to_user === 0 ||
      eventData?.show_invoice_to_user === false
    ))
  );

  const canShowInvoice = isAdmin || !isUserInvoiceHidden;

  // Auto fallback to pass view if invoice view is hidden from user
  useEffect(() => {
    if (!canShowInvoice && activeView === "invoice") {
      setActiveView("pass");
    }
  }, [canShowInvoice, activeView]);

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

  // Generate High-Res Scannable QR Code Data URL locally without relying on external third-party servers
  useEffect(() => {
    const activePassId = regDetails?.id || regId;
    if (!activePassId) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "https://executivetalksmedia.in";
    // Universal QR payload: Scanning via mobile phone camera opens verify-pass page; scanning via gate scanner checks in
    const qrPayload = `${origin}/verify-pass/${encodeURIComponent(activePassId)}`;

    QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error("Local QR code generation error:", err);
        setQrCodeDataUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrPayload)}`
        );
      });
  }, [regDetails?.id, regId]);

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

  // Pricing & Amount Calculation
  const rawPayAmount = Number(regDetails?.payment_amount) || 0;
  const rawPassPrice = Number(regDetails?.pass_price) || 0;
  const rawAwardFee = Number(regDetails?.award_nomination_fee) || 0;
  const rawTeamFee = Number(regDetails?.team_award_fee) || 0;
  const rawOrgFee = Number(regDetails?.org_award_fee) || 0;
  const rawDiscount = Number(regDetails?.discount_amount) || 0;
  const isAwardNominated = regDetails?.award_nomination === "Yes";
  const isTeamNominated = regDetails?.team_award_nomination === "Yes" || Boolean(regDetails?.team_award_category);
  const isOrgNominated = regDetails?.org_award_nomination === "Yes" || Boolean(regDetails?.org_award_category);

  const awardAmount = isAwardNominated && rawAwardFee > 0 ? rawAwardFee : 0;
  const teamAmount = isTeamNominated && rawTeamFee > 0 ? rawTeamFee : 0;
  const orgAmount = isOrgNominated && rawOrgFee > 0 ? rawOrgFee : 0;
  const totalExtraFees = awardAmount + teamAmount + orgAmount;

  // Effective Total Paid by user (invoice shows full paid amount without GST breakdown)
  const payAmount = rawPayAmount > 0
    ? rawPayAmount
    : Math.max(0, rawPassPrice + totalExtraFees - rawDiscount);

  const passAmount = payAmount > 0
    ? (totalExtraFees > 0 ? Math.max(0, payAmount + rawDiscount - totalExtraFees) : (payAmount + rawDiscount))
    : rawPassPrice;

  const invoiceNo = `ETM-INV-${(regDetails?.id || regId)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-8)
    .toUpperCase()}`;
  
  const qrTokenPayload = `ETM-GATE:${regDetails?.id || regId}`;

  const handlePrintOrDownload = (type: "pass" | "invoice") => {
    setActiveView(type);
    // Dismiss all active toasts to ensure clean printable export without toast overlays
    toast.dismiss();

    // Trigger print dialog cleanly after DOM render
    setTimeout(() => {
      window.print();
    }, 250);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 space-y-4 font-sans">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-600 border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-slate-700">
          Generating Official Executive Pass & Invoice...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-20 pt-24 sm:pt-28 font-sans selection:bg-cyan-500/20 print:p-0 print:m-0 print:bg-white print:text-black">
      <style>{`
        @media print {
          @page {
            margin: 8mm;
            size: auto;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          img {
            max-width: 100% !important;
            display: block !important;
            visibility: visible !important;
          }
          .print-document {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
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
                  {canShowInvoice ? (
                    <>
                      Official digital pass & receipt invoice sent to{" "}
                      <strong className="text-cyan-700 font-semibold">{regDetails?.email}</strong>.
                    </>
                  ) : (
                    <>
                      Official digital delegate pass sent to{" "}
                      <strong className="text-cyan-700 font-semibold">{regDetails?.email}</strong>.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* View Switcher Tabs (Pass, Invoice, and Social Promotion Badge) */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
              {isAdmin && isUserInvoiceHidden && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                  Admin View: Invoice Hidden from User
                </span>
              )}

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

                {canShowInvoice && (
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
                    <span>Official Invoice</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveView("promotion")}
                  className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeView === "promotion"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Social Promotion Badge</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VIEW 1: OFFICIAL SCANNABLE DELEGATE PASS                                 */}
          {/* ========================================================================= */}
          {activeView === "pass" && (
            <>
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
                      ET MEDIA BUSINESS INTELLIGENCE • OFFICIAL DELEGATE CREDENTIAL
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
                    {/* 1. Registration ID */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Registration ID
                      </span>
                      <span className="font-mono text-cyan-800 font-bold text-xs mt-0.5 block truncate">
                        {regDetails?.id || regId}
                      </span>
                    </div>

                    {/* 2. Pass Category */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Pass Category
                      </span>
                      <span className="font-bold text-amber-700 text-xs mt-0.5 block truncate">
                        {regDetails?.pass_name || "Official Delegate Pass"}
                      </span>
                    </div>

                    {/* 3. If invoice is allowed, show Payment & Amount. If invoice is hidden, show Admission Status */}
                    {canShowInvoice ? (
                      <>
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
                      </>
                    ) : (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Admission Status
                        </span>
                        <span className="inline-flex items-center gap-1 font-black text-[11px] text-emerald-700 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          CONFIRMED
                        </span>
                      </div>
                    )}

                    {/* 4. Delegate Name */}
                    <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Delegate Name
                      </span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block capitalize">
                        {regDetails?.name || "Executive Delegate"}
                      </span>
                    </div>

                    {/* 5. Designation */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Designation
                      </span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                        {regDetails?.designation || "Executive"}
                      </span>
                    </div>

                    {/* 6. Organization */}
                    <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Organization
                      </span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                        {regDetails?.organization || "Corporate Enterprise"}
                      </span>
                    </div>

                    {/* 7. City & Country */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        City & Country
                      </span>
                      <span className="font-semibold text-slate-700 text-xs mt-0.5 block truncate">
                        {regDetails?.city || "Hyderabad"}, {regDetails?.country || "India"}
                      </span>
                    </div>

                    {/* 8. Official Email */}
                    <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Official Email
                      </span>
                      <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block truncate">
                        {regDetails?.email}
                      </span>
                    </div>

                    {/* 9. Transaction ID if invoice enabled, or Event Date if invoice is hidden */}
                    {canShowInvoice ? (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Transaction ID
                        </span>
                        <span className="font-mono text-[11px] text-slate-600 mt-0.5 block truncate">
                          {regDetails?.payment_id || `pay_${Date.now().toString().slice(-8)}`}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Event Date
                        </span>
                        <span className="font-semibold text-cyan-800 text-xs mt-0.5 block truncate">
                          {effectiveEvent.date || "Upcoming Summit"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Verification Status Banner */}
                  <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0" />
                      <span>Present this physical print or digital pass at the registration desk.</span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-bold text-cyan-800 shrink-0 text-[11px] bg-cyan-100/60 px-2 py-0.5 rounded-full border border-cyan-300/60">
                      <ShieldCheck className="w-3 h-3 text-cyan-600" />
                      <span>Official Gate Pass</span>
                    </span>
                  </div>
                </div>

                {/* Scannable High-Res QR Ticket (4 Columns) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-center">
                  <div className="h-36 w-36 bg-white p-2 rounded-xl border-2 border-slate-300 flex items-center justify-center shadow-sm overflow-hidden print:border-slate-400 print:bg-white">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Official QR Pass Token"
                        className="w-full h-full object-contain block"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono">
                        <div className="h-5 w-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mb-1" />
                        <span>Generating QR...</span>
                      </div>
                    )}
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
                <span>ET Media Business Intelligence • Official Verified Pass</span>
                <span>Issued: {regDetails?.created_at || new Date().toLocaleDateString("en-IN")}</span>
              </div>
            </div>

            {/* Social Promotion Badge Teaser Callout Card (Hidden during print) */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 rounded-2xl p-5 sm:p-6 text-white border border-emerald-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 print:hidden">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    I'm Attending Social Badge
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white font-display">
                    Announce Your Participation On LinkedIn & WhatsApp!
                  </h3>
                  <p className="text-xs text-slate-300">
                    Generate your personalized executive promotion badge with your name, designation, company & photo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView("promotion")}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shrink-0"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>View & Download My Badge</span>
              </button>
            </div>
          </>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: OFFICIAL CORPORATE INVOICE                                        */}
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
                    alt="ET Media Business Intelligence"
                    className="h-12 w-auto object-contain"
                  />
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                      ET MEDIA BUSINESS INTELLIGENCE
                    </h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      Official Invoice & Event Registration Receipt
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
                </div>
              </div>

              {/* Company Info & Billed To Profile Grid */}
              <div className="grid sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                <div className="space-y-1">
                  <span className="font-black uppercase tracking-wider text-slate-400 block mb-1">
                    ISSUER / SERVICE PROVIDER
                  </span>
                  <p className="font-black text-slate-900 text-sm">
                    ET Media Business Intelligence
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
                    PAN: AAECE1234F
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

              {/* Itemized Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-800 font-black uppercase">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">1</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span>Executive Delegate Pass — {regDetails?.pass_name || "VIP Pass"}</span>
                          {passAmount === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              FREE / COMPLIMENTARY
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                          Full Access Pass: Keynotes, C-Suite Networking Lounge, Panel Discussions,
                          Executive Gourmet Dining & Intelligence Report
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">1</td>
                      <td className="py-3 px-3 text-right font-black text-sm text-slate-900 font-mono">
                        {passAmount === 0 ? (
                          <span className="text-emerald-700 font-black">FREE (₹0.00)</span>
                        ) : (
                          `₹${passAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        )}
                      </td>
                    </tr>

                    {isAwardNominated && (
                      <tr className="border-b border-slate-200 bg-amber-50/40">
                        <td className="py-3 px-3 font-mono font-bold text-amber-700">2</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                            <span>🏆 Individual Award Nomination</span>
                            {awardAmount === 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                FREE / COMPLIMENTARY
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-amber-700 block mt-0.5 leading-snug font-medium">
                            Category: {regDetails?.award_category || "Executive Leadership Award"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-amber-900">1</td>
                        <td className="py-3 px-3 text-right font-black text-sm text-amber-900 font-mono">
                          {awardAmount > 0 ? `₹${awardAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "FREE (₹0.00)"}
                        </td>
                      </tr>
                    )}

                    {isTeamNominated && (
                      <tr className="border-b border-slate-200 bg-blue-50/40">
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">3</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
                            <span>👥 Team & Group Award Nomination</span>
                            {teamAmount === 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                FREE / COMPLIMENTARY
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-blue-700 block mt-0.5 leading-snug font-medium">
                            Category: {regDetails?.team_award_category || regDetails?.award_team_category || "Team Excellence Award"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-blue-900">1</td>
                        <td className="py-3 px-3 text-right font-black text-sm text-blue-900 font-mono">
                          {teamAmount > 0 ? `₹${teamAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "FREE (₹0.00)"}
                        </td>
                      </tr>
                    )}

                    {isOrgNominated && (
                      <tr className="border-b border-slate-200 bg-purple-50/40">
                        <td className="py-3 px-3 font-mono font-bold text-purple-700">4</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-sm text-purple-900 flex items-center gap-1.5">
                            <span>🏢 Organization Award Nomination</span>
                            {orgAmount === 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                FREE / COMPLIMENTARY
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-purple-700 block mt-0.5 leading-snug font-medium">
                            Category: {regDetails?.org_award_category || "Organization Leadership Award"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-purple-900">1</td>
                        <td className="py-3 px-3 text-right font-black text-sm text-purple-900 font-mono">
                          {orgAmount > 0 ? `₹${orgAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "FREE (₹0.00)"}
                        </td>
                      </tr>
                    )}

                    {regDetails?.attending_poster && regDetails.attending_poster.includes("WhatsApp") && (
                      <tr className="border-b border-slate-200 bg-emerald-50/40">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">5</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                            <span>🖼️ “I’m Attending” Custom Poster</span>
                          </span>
                          <span className="text-[11px] text-emerald-700 block mt-0.5 leading-snug font-medium">
                            {regDetails.attending_poster}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-emerald-900">1</td>
                        <td className="py-3 px-3 text-right font-black text-sm text-emerald-700 font-mono">
                          Complimentary
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Calculations & Amount in Words */}
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
                      • This is an electronically generated receipt / invoice. No physical signature is required.
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>Delegate Pass Fee:</span>
                    <span className="font-mono font-semibold">
                      ₹{passAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {isAwardNominated && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-amber-800">
                      <span>Individual Award Fee:</span>
                      <span className="font-mono font-semibold">
                        {awardAmount > 0 ? `₹${awardAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "FREE (₹0.00)"}
                      </span>
                    </div>
                  )}
                  {isTeamNominated && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-blue-800">
                      <span>Team Award Fee:</span>
                      <span className="font-mono font-semibold">
                        {teamAmount > 0 ? `₹${teamAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "FREE (₹0.00)"}
                      </span>
                    </div>
                  )}
                  {isOrgNominated && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-purple-800">
                      <span>Org Award Fee:</span>
                      <span className="font-mono font-semibold">
                        {orgAmount > 0 ? `₹${orgAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "FREE (₹0.00)"}
                      </span>
                    </div>
                  )}
                  {rawDiscount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700 font-bold">
                      <span>Discount:</span>
                      <span className="font-mono">
                        - ₹{rawDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                    <span>Total Amount Paid:</span>
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
                    ET Media Business Intelligence
                  </p>
                  <p>
                    Official Pass Token:{" "}
                    <span className="text-slate-800 font-mono font-bold">
                      {regDetails?.id || regId}
                    </span>
                  </p>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="h-6 w-24 border-b border-dashed border-slate-400 mb-1"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Authorized Signatory
                  </span>
                  <p className="text-[10px] text-slate-400">ET Media Business Intelligence</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: DYNAMIC SOCIAL PROMOTION BADGE / POSTER                           */}
          {/* ========================================================================= */}
          {activeView === "promotion" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-5 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Sparkles className="w-3.5 h-3.5" /> Official Delegate Social Badge
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                    Your Personalized "I'm Attending" Promotion Badge
                  </h2>
                  <p className="text-xs text-slate-600">
                    Share this high-impact badge on LinkedIn, WhatsApp, and social networks to showcase your presence at this premier executive gathering.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView("pass")}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  <Ticket className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Back to Pass</span>
                </button>
              </div>

              {/* Render Badge Card */}
              <PromotionBadgeCard
                template={
                  activePromotionTemplate || {
                    id: "tmpl-hr-recall-2k26",
                    title: "HR Recall 2K26 Summit Executive Badge",
                    theme_style: "hr-recall-emerald",
                    badge_text: "I'M ONE OF THE 2,000+",
                    top_tagline: "2,000+ HR PROFESSIONALS ONE BIG GATHERING",
                    event_heading: "AWARDS & CONNECT HR RECALL 2K26",
                    sub_heading: "Remembering 2026. Calling 2027",
                    highlights: ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"],
                    cta_text: "REGISTER NOW",
                    date_text: effectiveEvent.date || "11th December 2026",
                    venue_text: effectiveEvent.venue || effectiveEvent.city || "Gachibowli, Hyderabad",
                    contact_email: "registration@executivetalksmedia.in",
                    primary_color: "#00A86B",
                    secondary_color: "#0F172A",
                    accent_color: "#EF4444",
                    footer_bg: "#064E3B",
                  }
                }
                attendee={{
                  id: regDetails?.id || regId,
                  name:
                    regDetails?.name ||
                    (regDetails?.first_name ? `${regDetails.first_name} ${regDetails.last_name || ""}`.trim() : "") ||
                    "VICTOR KOMAVARAPU",
                  designation: regDetails?.designation || "Executive Delegate",
                  organization: regDetails?.organization || regDetails?.company_name || "CARE HOSPITALS",
                  photo_url: attendeePhoto || regDetails?.photo_url || "",
                  event_title: regDetails?.event_title || effectiveEvent.title,
                  event_slug: regDetails?.event_slug || effectiveEvent.slug || slug || "hr-recall-2k26",
                  date: effectiveEvent.date || "11th December 2026",
                  venue: effectiveEvent.venue || effectiveEvent.city || "Gachibowli, Hyderabad",
                  regId: regDetails?.id || regId,
                }}
                onPhotoChange={handleSaveAttendeePhoto}
                allowPhotoUpload={true}
              />
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

              {canShowInvoice && (
                <button
                  type="button"
                  onClick={() => handlePrintOrDownload("invoice")}
                  className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
                >
                  <FileText className="w-4 h-4 text-purple-200" />
                  <span>Print / Save Invoice</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
