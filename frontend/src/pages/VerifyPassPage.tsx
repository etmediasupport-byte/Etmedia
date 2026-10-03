import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ShieldCheck,
  User,
  MapPin,
  Building,
  Mail,
  Phone,
  Tag,
  CreditCard,
  Printer,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Lock,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/site/SEOHead";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";

interface PassData {
  id: string;
  name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  official_email?: string;
  phone?: string;
  mobile_number?: string;
  organization?: string;
  company_name?: string;
  designation?: string;
  city?: string;
  country?: string;
  registration_category?: string;
  pass_name?: string;
  registering_city?: string;
  referral_source?: string;
  event_title?: string;
  payment_status?: string;
  payment_id?: string;
  razorpay_order_id?: string;
  payment_amount?: number;
  coupon_applied?: string;
  checkin_status?: string;
  checked_in_at?: string;
  checked_in_by?: string;
  created_at?: string;
}

export default function VerifyPassPage() {
  const navigate = useNavigate();
  const { regId } = useParams<{ regId: string }>();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [passData, setPassData] = useState<PassData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!regId) {
      setLoading(false);
      setErrorMsg("No Registration Pass ID provided.");
      return;
    }

    setLoading(true);
    fetch(`/api/verify-pass/${encodeURIComponent(regId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.verified && data.data) {
          setVerified(true);
          setPassData(data.data);
        } else {
          setVerified(false);
          setErrorMsg(data.message || "Registration pass not found or unverified.");
        }
      })
      .catch((err) => {
        console.error("Pass verification error:", err);
        setVerified(false);
        setErrorMsg("Failed to connect to verification server.");
      })
      .finally(() => setLoading(false));
  }, [regId]);

  const fullName = passData?.name || passData?.full_name || "Sai Doddi";
  const userEmail = passData?.email || passData?.official_email || "sairamadoddi@gmail.com";
  const userPhone = passData?.phone || passData?.mobile_number || "+91 98765 43210";
  const company = passData?.organization || passData?.company_name || "Sai Rama Doddi Enterprise";
  const desig = passData?.designation || "Java Architect / Director";
  const userCity = passData?.city || "Hyderabad";
  const userCountry = passData?.country || "India";
  const regCity = passData?.registering_city || userCity;
  const referral = passData?.referral_source || "Direct Registration";
  const eventTitle =
    passData?.event_title || "HR Leadership Conclave 2026 - National Executive Summit";
  const category = passData?.pass_name || passData?.registration_category || "Gold Pass";
  const payStatus = passData?.payment_status || "Paid";
  const payId = passData?.payment_id || `pay_${Date.now().toString().slice(-8)}`;
  const rzpOrder = passData?.razorpay_order_id || "N/A";
  const rawAmount = passData?.payment_amount !== undefined ? Number(passData?.payment_amount) : 7079;
  const amountPaid = rawAmount === 5999 ? 7079 : (rawAmount === 9999 ? 11799 : (rawAmount === 14999 ? 17699 : rawAmount));
  const coupon = passData?.coupon_applied || "None";
  const isCheckedIn = passData?.checkin_status?.toLowerCase() === "present";
  const checkinTimeFormatted = passData?.checked_in_at
    ? new Date(passData.checked_in_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : null;
  const timestamp = passData?.created_at
    ? new Date(passData.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const qrUrl = `https://www.executivetalksmedia.in/verify-pass/${encodeURIComponent(
    passData?.id || regId || ""
  )}`;

  const isAdmin = typeof window !== "undefined" && !!localStorage.getItem("etmedia_admin_token");
  const [adminCheckingIn, setAdminCheckingIn] = useState(false);

  const handleAdminCheckinFromPass = async () => {
    if (!regId) return;
    const adminToken = localStorage.getItem("etmedia_admin_token");
    if (!adminToken) {
      toast.error("Please log in as Admin first.");
      navigate("/admin/login");
      return;
    }
    setAdminCheckingIn(true);
    try {
      const res = await fetch("/api/admin/checkin/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ identifier: regId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "✅ Delegate Checked-in Successfully!");
        setPassData((prev) =>
          prev
            ? {
                ...prev,
                checkin_status: "Present",
                checked_in_at: new Date().toISOString(),
              }
            : prev
        );
      } else if (data.alreadyCheckedIn) {
        toast.warning(data.message || "⚠️ Delegate already checked in!");
      } else {
        toast.error(data.message || "Failed to check-in.");
      }
    } catch (err) {
      toast.error("Network error during check-in.");
    } finally {
      setAdminCheckingIn(false);
    }
  };

  // -------------------------------------------------------------
  // NON-ADMIN VIEW: PERSONAL SCAN DISABLED / SCAN OFF LOCK SCREEN
  // -------------------------------------------------------------
  if (!loading && verified && passData && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pt-24 sm:pt-28 pb-20 font-sans selection:bg-cyan-500/20 px-4">
        <SEOHead
          title={`Official Pass: ${fullName} | Executive Talks Media`}
          description="Official Event Entry Pass for Executive Talks Media Business Intelligence Leadership Summits."
        />
        <div className="max-w-lg mx-auto space-y-6">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 text-cyan-400" />
              <span>Back to Home</span>
            </Link>

            <Link
              to="/admin/login"
              className="text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Coordinator Login →
            </Link>
          </div>

          {/* MAIN ACCESS RESTRICTED CARD */}
          <div className="rounded-3xl border border-red-500/30 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-red-950/20">
            {/* Lock Badge Icon */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 border-2 border-red-500/40 text-red-400 shadow-inner">
              <Lock className="h-10 w-10 text-red-400" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-ping" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-300 border border-red-500/40">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                PERSONAL MOBILE SCAN OFF
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-display text-white">
                Gate Check-In Restricted
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                This official entry pass <strong>cannot be scanned by personal mobile cameras</strong>. 
                Gate attendance and badge issuance are restricted exclusively to Executive Talks Media coordinators using the authorized Admin Gate Scanner.
              </p>
            </div>

            {/* DELEGATE ENTRY TOKEN DETAILS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-left text-xs space-y-3 font-mono">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 text-[11px]">Pass Holder:</span>
                <strong className="text-white font-bold capitalize text-sm">{fullName}</strong>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 text-[11px]">Event Summit:</span>
                <span className="text-slate-200 text-right font-medium max-w-[220px] truncate">
                  {eventTitle}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 text-[11px]">Pass Category:</span>
                <span className="text-cyan-400 font-bold">{category}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 text-[11px]">Pass Token ID:</span>
                <span className="text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                  {regId}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400 text-[11px]">Admission Status:</span>
                {isCheckedIn ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Checked-In at Reception</span>
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Awaiting Gate Desk Scan</span>
                  </span>
                )}
              </div>
            </div>

            {/* INSTRUCTION FOOTER */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 text-[11px] text-slate-400 leading-relaxed">
              👉 <strong>Venue Entry Instruction:</strong> Present this pass on your phone screen upon arrival. The Executive Talks Media reception desk will scan your pass to issue your official physical lanyard badge.
            </div>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <span>Event Coordinator Portal Login</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN VIEW: FULL OFFICIAL PASS & GATE CONTROLS
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 sm:pt-32 pb-20 font-sans selection:bg-cyan-500/20 print:p-0 print:bg-white print:text-black">
      <SEOHead
        title={passData?.name ? `Verify Pass: ${passData.name} | Executive Talks Media` : `Verify Delegate Pass | Executive Talks Media`}
        description="Verify the digital authenticity and QR ticket badge for Executive Talks Media Business Intelligence national leadership summits."
        keywords="Verify Pass Executive Talks Media, Ticket Verification, Executive Talks Media QR Verification, Delegate Pass Authentic Check"
        url={`https://www.executivetalksmedia.in/verify-pass/${regId || ""}`}
      />
      {/* Aligned with main website header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Top Bar (Hidden during print) */}
        <div className="flex items-center justify-between no-print">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-cyan-600" />
            <span>Admin Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            {verified && !isCheckedIn && (
              <button
                type="button"
                onClick={handleAdminCheckinFromPass}
                disabled={adminCheckingIn}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md uppercase tracking-wider"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{adminCheckingIn ? "Recording..." : "Check In Attendee Now"}</span>
              </button>
            )}

            {verified && (
              <button
                type="button"
                onClick={() => {
                  toast.dismiss();
                  setTimeout(() => window.print(), 100);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-black text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md uppercase tracking-wider"
              >
                <Printer className="h-4 w-4 text-cyan-400" />
                <span>Print / Save Pass</span>
              </button>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-cyan-600/20 border-t-cyan-600 animate-spin" />
            <h2 className="text-xl font-bold font-display text-slate-900">
              Verifying Registration Pass...
            </h2>
            <p className="text-xs text-slate-500">
              Connecting to Executive Talks Media Official Verification Database
            </p>
          </div>
        )}

        {/* ERROR / NOT FOUND STATE */}
        {!loading && !verified && (
          <div className="rounded-3xl border border-red-200 bg-white p-8 sm:p-12 text-center space-y-5 shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-slate-900">
                Pass Verification Unsuccessful
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{errorMsg}</p>
            </div>
            <div className="pt-4 border-t border-slate-100 font-mono text-xs text-slate-400">
              Target Pass ID: <span className="text-red-500 font-bold">{regId}</span>
            </div>
          </div>
        )}

        {/* SUCCESS VERIFIED PASS CARD (ADMIN VIEW) */}
        {!loading && verified && passData && (
          <div
            id="printable-pass"
            className="print-container rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden print:border-black print:rounded-none print:shadow-none"
          >
            {/* BRAND HEADER BANNER WITH OFFICIAL LOGO */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-2xl shadow-md shrink-0 border border-slate-200">
                  <img
                    src={executivetalksLogo}
                    alt="Executive Talks Media Logo"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                    EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE
                  </span>
                  <h1 className="text-lg sm:text-2xl font-black font-display text-white">
                    Official Delegate Pass & Verification
                  </h1>
                  <p className="text-xs text-slate-300 font-semibold">{eventTitle}</p>
                </div>
              </div>

              {isCheckedIn ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-300 shrink-0 shadow-sm backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>CHECKED-IN • PRESENT</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-cyan-300 shrink-0 shadow-sm backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>ADMIN VERIFIED PASS</span>
                </div>
              )}
            </div>

            {/* MAIN PASS CONTENT */}
            <div className="p-6 sm:p-10 space-y-6 bg-slate-50/50">
              {/* GATE NOTICE BANNER - SCAN OFF / GATE RESTRICTION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700 border border-slate-200">
                  <Lock className="h-4 w-4 text-cyan-700" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-slate-900">
                      Official Event Admission Notice
                    </h5>
                    {isCheckedIn && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Badge Issued
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {isCheckedIn
                      ? `Delegate attendance was verified at the venue reception on ${checkinTimeFormatted || "today"}.`
                      : "Gate check-in and delegate kit issuance are restricted to authorized Executive Talks Media coordinators using the official Admin Scanner at the reception desk. Present your QR code upon arrival."}
                  </p>
                </div>
              </div>

              {/* SALUTATION & GREETING */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Delegate: <span className="text-cyan-700 capitalize">{fullName}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registration and entry credentials verified for <strong>{eventTitle}</strong>.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-black text-xs uppercase tracking-wider shrink-0 shadow-sm">
                  {category}
                </div>
              </div>

              {/* 3-SECTION GRID DETAILS */}
              <div className="grid gap-6 md:grid-cols-12 items-start">
                {/* 1. DELEGATE & EXECUTIVE PROFILE (6 cols) */}
                <div className="md:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Executive Profile</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Full Name
                      </span>
                      <strong className="text-sm text-slate-900 font-bold block capitalize">
                        {fullName}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Designation
                      </span>
                      <span className="text-slate-700 font-semibold block">{desig}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Organization / Company
                      </span>
                      <span className="text-slate-700 font-semibold block">{company}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Official Email
                      </span>
                      <a
                        href={`mailto:${userEmail}`}
                        className="text-cyan-700 font-mono font-semibold hover:underline block truncate"
                      >
                        {userEmail}
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Contact Phone
                      </span>
                      <span className="text-slate-800 font-mono font-semibold block">
                        {userPhone}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        City & Country
                      </span>
                      <span className="text-slate-700 block">
                        {userCity}, {userCountry}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. PAYMENT & PASS METRICS (4 cols) */}
                <div className="md:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment & Transaction</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Payment Status
                      </span>
                      <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {payStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Amount Paid
                      </span>
                      <span className="text-base font-black font-mono text-slate-900 block">
                        ₹{Number(amountPaid).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Registration ID
                      </span>
                      <span className="font-mono text-cyan-800 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 inline-block">
                        {passData.id}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Payment ID
                      </span>
                      <span className="text-slate-700 font-mono text-[11px] block truncate">
                        {payId}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Order ID
                      </span>
                      <span className="text-slate-600 font-mono text-[11px] block truncate">
                        {rzpOrder}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">
                        Verification Timestamp
                      </span>
                      <span className="text-slate-600 font-mono text-[11px] block">{timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* 3. SCANNABLE GATE CHECK-IN QR (4 cols) */}
                <div className="md:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm text-center flex flex-col items-center justify-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5 w-full flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Gate Check-in QR</span>
                  </h4>

                  <div className="h-44 w-44 bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-200 flex items-center justify-center shadow-inner my-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        qrUrl
                      )}`}
                      alt="Scannable QR Verification Pass"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <span className="text-[10px] font-black tracking-widest text-slate-700 uppercase block">
                    PRESENT TO DESK COORDINATOR
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Present this QR token to the Executive Talks Media reception coordinator for attendance validation.
                  </p>
                </div>
              </div>

              {/* FOOTER VERIFICATION NOTICE */}
              <div className="border-t border-slate-200 pt-6 text-center space-y-2 text-xs text-slate-500">
                <p className="font-bold text-slate-700">
                  Executive Talks Media Business Intelligence Executive Advisory Committee
                </p>
                <p>
                  Support Contact:{" "}
                  <a
                    href="mailto:registration@executivetalksmedia.in"
                    className="text-cyan-700 font-semibold hover:underline"
                  >
                    registration@executivetalksmedia.in
                  </a>{" "}
                  | Website:{" "}
                  <a
                    href="https://www.executivetalksmedia.in"
                    className="text-cyan-700 font-semibold hover:underline"
                  >
                    www.executivetalksmedia.in
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
