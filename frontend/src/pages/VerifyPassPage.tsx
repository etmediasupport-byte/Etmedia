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
  ShieldAlert,
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
  const [adminCheckingIn, setAdminCheckingIn] = useState(false);

  // Check admin authorization token
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("etmedia_admin_token") : null;
  const isAdmin = !!adminToken;

  // Always open at top of page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    // If not admin, do not fetch any details; protect data privacy completely
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    if (!regId) {
      setLoading(false);
      setErrorMsg("No Registration Pass ID provided.");
      return;
    }

    setLoading(true);
    fetch(`/api/verify-pass/${encodeURIComponent(regId)}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
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
  }, [regId, isAdmin, adminToken]);

  // -------------------------------------------------------------------------
  // 1. STRICT RESTRICTED VIEW FOR ALL NON-ADMIN USERS (PHONE, LAPTOP, PUBLIC)
  // ZERO ATTENDEE OR EVENT DETAILS SHOWN
  // -------------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans selection:bg-red-500/20">
        <SEOHead
          title="Access Restricted | Executive Talks Media"
          description="Gate verification and pass scanning are restricted to authorized event staff."
        />
        <div className="max-w-md w-full rounded-3xl border border-red-500/30 bg-slate-900/95 backdrop-blur-xl p-8 sm:p-10 text-center space-y-6 shadow-2xl shadow-red-950/40">
          {/* Lock Icon */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 border-2 border-red-500/40 text-red-400 shadow-inner">
            <Lock className="h-10 w-10 text-red-500" />
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 animate-ping" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-300 border border-red-500/40">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              ACCESS RESTRICTED
            </span>
            <h1 className="text-2xl font-black font-display text-white">
              Gate Verification Restricted
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unauthorized access. This gate verification link is strictly restricted to authorized Executive Talks Media event coordinators. Personal mobile scanning, public viewing, and direct URL access are disabled for event security.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Please present your official QR code ticket upon arrival at the venue reception desk. Event coordinators will scan your ticket to issue your admission badge.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-cyan-400" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. AUTHORIZED ADMIN DESK VIEW (ONLY FOR LOGGED-IN ADMINS)
  // -------------------------------------------------------------------------
  const fullName = passData?.name || passData?.full_name || "Delegate";
  const userEmail = passData?.email || passData?.official_email || "N/A";
  const userPhone = passData?.phone || passData?.mobile_number || "N/A";
  const company = passData?.organization || passData?.company_name || "Enterprise";
  const desig = passData?.designation || "Executive Delegate";
  const userCity = passData?.city || "Hyderabad";
  const userCountry = passData?.country || "India";
  const eventTitle =
    passData?.event_title || "Executive Leadership Conclave 2026";
  const category = passData?.pass_name || passData?.registration_category || "Delegate Pass";
  const payStatus = passData?.payment_status || "Paid";
  const payId = passData?.payment_id || `pay_${Date.now().toString().slice(-8)}`;
  const rzpOrder = passData?.razorpay_order_id || "N/A";
  const rawAmount = passData?.payment_amount !== undefined ? Number(passData?.payment_amount) : 0;
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

  const handleAdminCheckinFromPass = async () => {
    if (!regId || !adminToken) return;
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 sm:pt-32 pb-20 font-sans selection:bg-cyan-500/20 print:p-0 print:bg-white print:text-black">
      <SEOHead
        title={passData?.name ? `Admin Pass: ${passData.name} | Executive Talks Media` : `Admin Delegate Pass | Executive Talks Media`}
        description="Admin pass verification for Executive Talks Media Business Intelligence national leadership summits."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Top Bar */}
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

        {/* SUCCESS VERIFIED PASS CARD (ADMIN VIEW ONLY) */}
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
              {/* SALUTATION & GREETING */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Delegate: <span className="text-cyan-700 capitalize">{fullName}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registration verified for <strong>{eventTitle}</strong>.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-black text-xs uppercase tracking-wider shrink-0 shadow-sm">
                  {category}
                </div>
              </div>

              {/* 3-SECTION GRID DETAILS */}
              <div className="grid gap-6 md:grid-cols-12 items-start">
                {/* 1. DELEGATE PROFILE */}
                <div className="md:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Executive Profile</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Full Name</span>
                      <strong className="text-sm text-slate-900 font-bold block capitalize">{fullName}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Designation</span>
                      <span className="text-slate-700 font-semibold block">{desig}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Organization</span>
                      <span className="text-slate-700 font-semibold block">{company}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Official Email</span>
                      <span className="text-cyan-700 font-mono font-semibold block truncate">{userEmail}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Contact Phone</span>
                      <span className="text-slate-800 font-mono font-semibold block">{userPhone}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">City & Country</span>
                      <span className="text-slate-700 block">{userCity}, {userCountry}</span>
                    </div>
                  </div>
                </div>

                {/* 2. PAYMENT METRICS */}
                <div className="md:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment & Transaction</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Payment Status</span>
                      <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {payStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Amount</span>
                      <span className="text-base font-black font-mono text-slate-900 block">
                        ₹{Number(rawAmount).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Pass ID</span>
                      <span className="font-mono text-cyan-800 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 inline-block">
                        {passData.id}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-black uppercase block">Gate Admission</span>
                      {isCheckedIn ? (
                        <span className="text-emerald-700 font-bold block mt-1">
                          Checked-In ({checkinTimeFormatted})
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold block mt-1">Awaiting Gate Desk Scan</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. SCANNABLE GATE QR (ADMIN) */}
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
                    ADMIN GATE TOKEN
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
