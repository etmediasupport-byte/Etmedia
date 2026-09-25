import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, User, MapPin, Building, Mail, Phone, Tag, CreditCard, Printer, AlertTriangle, ArrowLeft, Calendar, Gift } from "lucide-react";
import logo from "@/assets/logo-final.png";

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
  registering_city?: string;
  referral_source?: string;
  event_title?: string;
  payment_status?: string;
  payment_id?: string;
  razorpay_order_id?: string;
  payment_amount?: number;
  coupon_applied?: string;
  created_at?: string;
}

export default function VerifyPassPage() {
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

  const fullName = passData?.name || passData?.full_name || "Delegate";
  const userEmail = passData?.email || passData?.official_email || "N/A";
  const userPhone = passData?.phone || passData?.mobile_number || "N/A";
  const company = passData?.organization || passData?.company_name || "N/A";
  const desig = passData?.designation || "Executive Delegate";
  const userCity = passData?.city || "N/A";
  const userCountry = passData?.country || "India";
  const regCity = passData?.registering_city || userCity;
  const referral = passData?.referral_source || "Direct";
  const eventTitle = passData?.event_title || "Procurement Leadership Summit & Excellence Awards 2026";
  const category = passData?.registration_category || "Delegate Pass";
  const payStatus = passData?.payment_status || "Paid";
  const payId = passData?.payment_id || "N/A";
  const rzpOrder = passData?.razorpay_order_id || "N/A";
  const amountPaid = passData?.payment_amount !== undefined ? passData?.payment_amount : 0;
  const coupon = passData?.coupon_applied || "None";
  const timestamp = passData?.created_at ? new Date(passData.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between no-print">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Return to Home
          </Link>

          {verified && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer shadow-md"
            >
              <Printer className="h-4 w-4 text-cyan-400" /> Print / Save Pass
            </button>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-12 text-center space-y-4 backdrop-blur-2xl">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
            <h2 className="text-xl font-bold font-display text-white">Verifying Registration Pass...</h2>
            <p className="text-xs text-slate-400">Communicating with Executive Talks Media Business Intelligence Verification Database</p>
          </div>
        )}

        {/* ERROR / NOT FOUND STATE */}
        {!loading && !verified && (
          <div className="rounded-3xl border border-red-500/30 bg-slate-900/90 p-8 sm:p-12 text-center space-y-5 backdrop-blur-2xl shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-white">Pass Verification Unsuccessful</h2>
              <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">{errorMsg}</p>
            </div>
            <div className="pt-4 border-t border-slate-800 font-mono text-xs text-slate-500">
              Target Pass ID: <span className="text-red-400 font-bold">{regId}</span>
            </div>
          </div>
        )}

        {/* SUCCESS VERIFIED PASS CARD */}
        {!loading && verified && passData && (
          <div className="rounded-3xl border border-cyan-500/40 bg-slate-900/95 shadow-[0_25px_60px_-15px_rgba(0,174,239,0.3)] backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* BRAND HEADER BANNER */}
            <div className="bg-gradient-to-r from-cyan-600 via-blue-700 to-purple-700 p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-transparent shrink-0">
                    <img src={logo} alt="Executive Talks Media Logo" className="h-10 w-auto object-contain" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider font-display">EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE</h1>
                    <p className="text-xs text-cyan-200 font-semibold tracking-wide uppercase">Official Executive Delegate Pass & Confirmation</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-200 backdrop-blur-md shadow-lg shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  VERIFIED PASS
                </div>
              </div>
            </div>

            {/* MAIN PASS CONTENT */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* SALUTATION & GREETING */}
              <div className="space-y-2 text-slate-200 text-sm border-b border-slate-800 pb-5">
                <p className="text-base sm:text-lg font-bold text-white">
                  Dear <span className="text-cyan-400 capitalize">{fullName}</span>,
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Thank you for registering for <strong className="text-white font-semibold">{eventTitle}</strong>. Your registration details and payment confirmation have been recorded successfully.
                </p>
              </div>

              {/* CONFIRMATION STATUS BADGE */}
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span>Registration Status: <span className="uppercase text-emerald-400 tracking-wide font-black">CONFIRMED & VERIFIED</span></span>
                </div>
                <div className="font-mono text-cyan-300 font-bold">
                  Pass Category: <span className="text-purple-300">{category}</span> | Reg ID: <span className="text-white bg-slate-800 px-2.5 py-1 rounded-md">{passData.id}</span>
                </div>
              </div>

              {/* 2-COLUMN GRID DETAILS */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* DELEGATE & EXECUTIVE DETAILS */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Delegate & Executive Details</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Full Name:</span>
                      <strong className="text-sm text-white font-bold block capitalize">{fullName}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Work Email:</span>
                      <a href={`mailto:${userEmail}`} className="text-cyan-300 font-mono font-semibold hover:underline block">{userEmail}</a>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Contact Phone:</span>
                      <span className="text-slate-200 font-mono font-semibold">{userPhone}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Designation:</span>
                      <span className="text-slate-200 font-semibold">{desig}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Organization / Company:</span>
                      <span className="text-slate-200 font-semibold">{company}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">City & Country:</span>
                      <span className="text-slate-300">{userCity}, {userCountry}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Registering City:</span>
                      <span className="text-cyan-200 font-semibold">{regCity}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Referral Source:</span>
                      <span className="text-slate-300">{referral}</span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT & TRANSACTION SUMMARY */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment & Transaction Summary</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Payment Status:</span>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        payStatus.toLowerCase() === "paid"
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                          : "bg-blue-500/20 border border-blue-500/40 text-blue-300"
                      }`}>
                        {payStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Payment ID:</span>
                      <span className="text-slate-100 font-mono font-bold">{payId}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Razorpay Order ID:</span>
                      <span className="text-slate-300 font-mono">{rzpOrder}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Amount Paid:</span>
                      <span className="text-lg font-black font-mono text-emerald-400">
                        ₹{Number(amountPaid).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Coupon Code:</span>
                      <span className="text-amber-400 font-mono font-bold">{coupon}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Timestamp:</span>
                      <span className="text-slate-400 font-mono">{timestamp}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* FOOTER VERIFICATION NOTICE */}
              <div className="border-t border-slate-800 pt-6 text-center space-y-2 text-xs text-slate-400">
                <p className="font-semibold text-slate-300">Executive Talks Media Business Intelligence Executive Committee</p>
                <p>Support Contact: <a href="mailto:registration@etmedia.in" className="text-cyan-400 hover:underline">registration@etmedia.in</a> | Website: <a href="https://www.etmedia.in" className="text-cyan-400 hover:underline">www.etmedia.in</a></p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

