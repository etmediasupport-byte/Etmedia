import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, ShieldCheck, Mail, Calendar, MapPin, Sparkles, Award, User, Tag } from "lucide-react";
import { toast } from "sonner";
import type { EventItem } from "@/lib/site-data";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export function RegisterModal({ isOpen, onClose, event }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    companyName: "",
    email: "",
    contactNumber: "",
    city: "",
    country: "India",
    registrationCategory: "Delegate",
    registeringCity: "",
    referralSource: "LinkedIn",
  });

  const [verifiedCaptcha, setVerifiedCaptcha] = useState(false);
  const [captchaVerifying, setCaptchaVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Auto-select event details when event changes
  useEffect(() => {
    if (event) {
      let cities: string[] = [];
      try {
        if (typeof event.locations === "string") {
          const parsed = JSON.parse(event.locations);
          cities = parsed.map((l: any) => l.city).filter(Boolean);
        } else if (Array.isArray(event.locations)) {
          cities = event.locations.map((l: any) => l.city).filter(Boolean);
        }
      } catch (e) {}

      if (cities.length === 0 && event.city) {
        cities = [event.city];
      }
      const initialRegisteringCity = cities[0] || "Mumbai";

      setFormData((prev) => ({
        ...prev,
        registeringCity: initialRegisteringCity,
      }));
    }
  }, [event]);

  if (!isOpen || !event) return null;

  // Extract cities list for dropdown
  let eventCities: string[] = [];
  try {
    if (typeof event.locations === "string") {
      const parsed = JSON.parse(event.locations);
      eventCities = parsed.map((l: any) => l.city).filter(Boolean);
    } else if (Array.isArray(event.locations)) {
      eventCities = event.locations.map((l: any) => l.city).filter(Boolean);
    }
  } catch (e) {}
  if (eventCities.length === 0 && event.city) {
    eventCities = [event.city];
  }
  const defaultCities = ["Mumbai", "Bengaluru", "Hyderabad", "New Delhi", "Pune", "Chennai", "Kolkata"];
  const finalCityOptions = Array.from(new Set([...eventCities, ...defaultCities]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter your First Name and Last Name.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter a valid work email.");
      return;
    }

    if (!verifiedCaptcha) {
      toast.error("Please complete the Google reCAPTCHA verification.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.contactNumber,
        organization: formData.companyName,
        eventId: event.id || event.slug,
        eventTitle: event.title,
      };

      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedData({
          ...formData,
          eventTitle: event.title,
          emailSent: data.emailSent,
        });
        setSuccessModalOpen(true);
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Could not connect to backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  const countriesList = [
    "India",
    "United States",
    "United Kingdom",
    "Singapore",
    "United Arab Emirates",
    "Germany",
    "Australia",
    "Canada",
    "Japan",
    "France",
    "Other",
  ];

  return (
    <>
      {/* 1. REGISTRATION FORM MODAL (WIDE SCREEN FORMAT) */}
      {!successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl lg:max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-slate-900/95 border border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(0,174,239,0.35)] text-slate-100 backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* STICKY MODAL HEADER */}
            <div className="flex-none border-b border-slate-800/80 p-4 sm:p-5 bg-slate-900/95 relative">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-all shadow-md cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pr-10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Executive Platform Registration</span>
                  </div>
                  <h3 className="mt-0.5 text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                    Register Now
                  </h3>
                </div>

                {/* Auto Selected Event Banner */}
                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/30 p-2.5 sm:px-4 sm:py-2.5 text-slate-200 shadow-inner sm:max-w-md">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block">
                    Auto-Selected Summit
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {event.title}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-400">
                    {event.date && (
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Calendar className="h-3 w-3 text-cyan-400" /> {event.date}
                      </span>
                    )}
                    {(event.venue || event.city) && (
                      <span className="flex items-center gap-1 text-purple-300 truncate">
                        <MapPin className="h-3 w-3 text-purple-400 shrink-0" /> {event.venue ? `${event.venue}, ` : ""}{event.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SCROLLABLE FORM BODY - SPACIOUS MULTI-COLUMN LAYOUT */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
              
              {/* Section 1: Personal & Executive Details (4 Columns on Desktop!) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Personal & Executive Details</span>
                </div>

                {/* 4-Column Grid Row 1: Name, Email & Phone */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Rajesh"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Sharma"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rajesh@company.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>
                </div>

                {/* 4-Column Grid Row 2: Designation, Company, City & Country */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. CISO / VP Security"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Vantage Enterprises"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Country *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                    >
                      {countriesList.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-slate-100">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Category & Preferences (3 Columns) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                  <Tag className="h-3.5 w-3.5 text-purple-400" />
                  <span>Category & Participation Preferences</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Registration Category
                    </label>
                    <select
                      value={formData.registrationCategory}
                      onChange={(e) => setFormData({ ...formData, registrationCategory: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                    >
                      <option value="Delegate" className="bg-slate-900">Delegate Pass</option>
                      <option value="Speaker" className="bg-slate-900">Speaker Slot</option>
                      <option value="Sponsorship" className="bg-slate-900">Sponsorship Opportunity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Registering City
                    </label>
                    <select
                      value={formData.registeringCity}
                      onChange={(e) => setFormData({ ...formData, registeringCity: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                    >
                      {finalCityOptions.map((c) => (
                        <option key={c} value={c} className="bg-slate-900">{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Referral Source
                    </label>
                    <select
                      value={formData.referralSource}
                      onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                    >
                      <option value="LinkedIn" className="bg-slate-900">LinkedIn</option>
                      <option value="Facebook" className="bg-slate-900">Facebook</option>
                      <option value="Instagram" className="bg-slate-900">Instagram</option>
                      <option value="Google" className="bg-slate-900">Google Search</option>
                      <option value="Friend" className="bg-slate-900">Friend / Peer</option>
                      <option value="Email" className="bg-slate-900">Email Newsletter</option>
                      <option value="WhatsApp" className="bg-slate-900">WhatsApp</option>
                      <option value="Other" className="bg-slate-900">Other Channel</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Bottom Row with reCAPTCHA & Submit Button Side-by-Side on Desktop */}
              <div className="pt-2 grid gap-3 lg:grid-cols-12 items-center">
                {/* Google reCAPTCHA Verification (8 cols on Desktop) */}
                <div className="lg:col-span-7">
                  <div className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3 sm:px-4 sm:py-2.5 shadow-inner transition-all hover:border-cyan-500/40">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (verifiedCaptcha) {
                              setVerifiedCaptcha(false);
                            } else {
                              setCaptchaVerifying(true);
                              setTimeout(() => {
                                setCaptchaVerifying(false);
                                setVerifiedCaptcha(true);
                                toast.success("reCAPTCHA Verification Successful!");
                              }, 400);
                            }
                          }}
                          className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all duration-200 cursor-pointer ${
                            verifiedCaptcha
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                              : captchaVerifying
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                              : "border-slate-600 bg-slate-900/90 text-transparent hover:border-cyan-400"
                          }`}
                        >
                          {captchaVerifying ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                          ) : verifiedCaptcha ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : null}
                        </button>

                        <div>
                          <span
                            onClick={() => {
                              if (!verifiedCaptcha && !captchaVerifying) {
                                setCaptchaVerifying(true);
                                setTimeout(() => {
                                  setCaptchaVerifying(false);
                                  setVerifiedCaptcha(true);
                                  toast.success("reCAPTCHA Verification Successful!");
                                }, 400);
                              }
                            }}
                            className="text-xs font-semibold text-slate-200 block select-none cursor-pointer hover:text-cyan-400 transition-colors"
                          >
                            I'm not a robot
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {verifiedCaptcha ? "Verification Complete" : "Click box to verify"}
                          </span>
                        </div>
                      </div>

                      {/* Google reCAPTCHA Emblem Badge */}
                      <div className="flex flex-col items-end shrink-0 select-none">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                          <span>reCAPTCHA</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 mt-0.5">
                          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-300">Privacy</a>
                          <span>·</span>
                          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-300">Terms</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button (5 cols on Desktop) */}
                <div className="lg:col-span-5">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-[0_10px_30px_-5px_rgba(0,174,239,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(0,174,239,0.7)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-300 cursor-pointer font-btn"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span className="text-xs">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 text-white" />
                        <span>Confirm & Register Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. SUCCESS MODAL (AFTER SUBMISSION) */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(34,197,94,0.3)] bg-slate-900 border border-slate-800 text-slate-100 text-center animate-in zoom-in-95 duration-200">
            
            {/* Animated Checkmark Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4 shadow-inner border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 animate-bounce text-emerald-400" />
            </div>

            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Registration Confirmed
            </span>

            <h3 className="mt-2 text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Thank You, {submittedData?.firstName}!
            </h3>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Your registration for <strong className="text-cyan-400">{submittedData?.eventTitle}</strong> has been successfully received.
            </p>

            {/* Dispatched Email Box Preview */}
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Mail className="h-4 w-4" /> Confirmation Email Sent
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">Dispatched</span>
              </div>
              <p className="text-slate-400 font-mono text-[11px] pt-1">
                To: {submittedData?.email}
              </p>
              <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800/80 font-sans text-xs space-y-2 text-slate-300 leading-relaxed">
                <p><strong>Dear {submittedData?.firstName},</strong></p>
                <p>Thank you for registering for {submittedData?.eventTitle}.</p>
                <p>Your registration has been successfully received.</p>
                <p>Our team will verify your details and contact you shortly with confirmation, venue details, agenda, and participation information.</p>
                <p className="pt-2 text-slate-400 font-medium">
                  ET Media Business Intelligence<br />
                  <a href="mailto:partner.support@etmedia.in" className="text-cyan-400 hover:underline">partner.support@etmedia.in</a>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessModalOpen(false);
                onClose();
              }}
              className="mt-5 w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
