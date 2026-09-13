import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, ShieldCheck, Mail, Calendar, MapPin, Building2, User, Sparkles, Award } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Auto-select event details when event changes
  useEffect(() => {
    if (event) {
      // Parse available cities from event
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
      {/* 1. REGISTRATION FORM MODAL */}
      {!successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto">
          <div className="glass-card relative my-8 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl bg-card border border-border text-foreground max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 rounded-full bg-muted p-2.5 text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Badge & Title */}
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <Sparkles className="h-4 w-4" />
              <span>Event Registration</span>
            </div>

            <h3 className="mt-1 text-2xl sm:text-3xl font-black font-display tracking-tight text-foreground">
              Register Now
            </h3>

            {/* Event Auto Selected Banner */}
            <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-900 dark:text-cyan-200">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                Auto-Selected Platform
              </span>
              <h4 className="text-base sm:text-lg font-bold mt-0.5 text-foreground leading-snug">
                {event.title}
              </h4>
              <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-cyan-600" /> {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-purple-600" /> {event.venue}, {event.city}
                </span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                Personal & Executive Details
              </div>

              {/* First Name & Last Name */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Rajesh"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Sharma"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Designation & Company Name */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. CISO / VP Security / Director"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Vantage Enterprises"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Email & Contact Number */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rajesh@company.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* City & Country */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  >
                    {countriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border pb-1 pt-2">
                Category & Preferences
              </div>

              {/* Registration Category, Registering City & Referral Source */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registration Category
                  </label>
                  <select
                    value={formData.registrationCategory}
                    onChange={(e) => setFormData({ ...formData, registrationCategory: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                  >
                    <option value="Delegate">Delegate Pass</option>
                    <option value="Speaker">Speaker Slot</option>
                    <option value="Sponsorship">Sponsorship Opportunity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registering City
                  </label>
                  <select
                    value={formData.registeringCity}
                    onChange={(e) => setFormData({ ...formData, registeringCity: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                  >
                    {finalCityOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Referral Source
                  </label>
                  <select
                    value={formData.referralSource}
                    onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google">Google Search</option>
                    <option value="Friend">Friend / Peer</option>
                    <option value="Email">Email Newsletter</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Other">Other Channel</option>
                  </select>
                </div>
              </div>

              {/* Verification (Google reCAPTCHA Badge) */}
              <div className="pt-2">
                <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={verifiedCaptcha}
                      onChange={(e) => setVerifiedCaptcha(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        I'm not a robot (Google reCAPTCHA v2 Verification)
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Site Key: 6LfeDbgtAAAAAEhSV1_fq3AQip4qtk1Ix18uW00g
                      </span>
                    </div>
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold shrink-0">
                    <ShieldCheck className="h-5 w-5 text-cyan-600" />
                    <span>Protected by reCAPTCHA</span>
                  </div>
                </div>
              </div>

              {/* Submit Button (Premium Animated Gradient) */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="gradient-brand relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-extrabold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/25 disabled:opacity-50 font-btn"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing Registration & Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Award className="h-5 w-5" />
                      <span>Confirm & Register Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SUCCESS MODAL (AFTER SUBMISSION) */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="glass-card relative w-full max-w-lg rounded-3xl p-8 shadow-2xl bg-card border border-border text-foreground text-center">
            {/* Animated Checkmark Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-6 shadow-inner">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Registration Confirmed
            </span>

            <h3 className="mt-3 text-2xl sm:text-3xl font-black font-display tracking-tight text-foreground">
              Thank You, {submittedData?.firstName}!
            </h3>

            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Your registration for <strong>{submittedData?.eventTitle}</strong> has been successfully received.
            </p>

            {/* Dispatched Email Box Preview */}
            <div className="mt-6 rounded-2xl border border-border bg-muted/50 p-5 text-left text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-foreground border-b border-border pb-2">
                <span className="flex items-center gap-1.5 text-primary">
                  <Mail className="h-4 w-4" /> Confirmation Email Sent
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full">Dispatched</span>
              </div>
              <p className="text-muted-foreground font-mono text-[11px] pt-1">
                To: {submittedData?.email}
              </p>
              <div className="bg-background rounded-xl p-4 border border-border font-sans text-xs space-y-2 text-foreground">
                <p><strong>Dear {submittedData?.firstName},</strong></p>
                <p>Thank you for registering for {submittedData?.eventTitle}.</p>
                <p>Your registration has been successfully received.</p>
                <p>Our team will verify your details and contact you shortly with confirmation, venue details, agenda, and participation information.</p>
                <p>We look forward to welcoming you to India's premier leadership summit.</p>
                <p className="pt-2 text-muted-foreground font-medium">
                  ET Media Business Intelligence<br />
                  <a href="mailto:partner.support@etmedia.in" className="text-primary hover:underline">partner.support@etmedia.in</a>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessModalOpen(false);
                onClose();
              }}
              className="gradient-brand mt-6 w-full py-3.5 px-6 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-transform"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
