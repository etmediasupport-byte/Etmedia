import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Award,
  Briefcase,
  Clock,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/site/SEOHead";
import { events as defaultEvents } from "@/lib/site-data";
import {
  validateEmail,
  validatePhone,
  sanitizePhoneInput,
  validateName,
  validateDesignation,
  validateCompanyName,
  validateLocation,
  validateRequiredText,
  validateUrl,
} from "@/lib/validation";
import { EventTermsAndConditionsBox } from "@/components/site/EventTermsAndConditionsBox";

interface RegistrationFieldErrors {
  firstName?: string;
  lastName?: string;
  workEmail?: string;
  contactNumber?: string;
  designation?: string;
  companyName?: string;
  city?: string;
  linkedinUrl?: string;
  reasonForAttending?: string;
}

interface RegistrationTouchedFields {
  firstName?: boolean;
  lastName?: boolean;
  workEmail?: boolean;
  contactNumber?: boolean;
  designation?: boolean;
  companyName?: boolean;
  city?: boolean;
  linkedinUrl?: boolean;
  reasonForAttending?: boolean;
}

export default function FreeRegistrationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetSlug = slug || searchParams.get("event") || "hr-recall-2k26";
  const cleanTargetSlug = targetSlug.replace(/-\d+$/, "").toLowerCase();

  const initialFallback = defaultEvents.find(
    (e) => (e.slug || "").toLowerCase() === cleanTargetSlug ||
           (e.id || "").toLowerCase() === cleanTargetSlug ||
           (e.slug || "").toLowerCase().includes(cleanTargetSlug) ||
           cleanTargetSlug.includes((e.slug || "").toLowerCase())
  ) || defaultEvents[0];

  const [eventData, setEventData] = useState<any>(initialFallback);
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    contactNumber: "",
    designation: "",
    companyName: "",
    city: "",
    country: "India",
    industry: "Technology & IT",
    linkedinUrl: "",
    category: "Complimentary VIP Delegate",
    participationPreference: "In-Person Delegate",
    interestTracks: ["Leadership & Enterprise Strategy", "HR Tech & AI"],
    reasonForAttending: "",
  });

  useEffect(() => {
    let isMounted = true;
    const activeSlug = slug || searchParams.get("event") || "hr-recall-2k26";

    fetch(`/api/events/${activeSlug}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.event) {
          setEventData(json.event);
        }
      })
      .catch((e) => {
        console.warn("[FreeRegistration] Fast mode fallback active:", e);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, searchParams]);

  // Validation errors state
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<RegistrationTouchedFields>({});

  // Helper: validate a single field and return error string
  const getFieldError = (fieldName: string, value: string): string => {
    if (fieldName === "firstName") {
      const v = validateName(value, "First Name");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "lastName") {
      const v = validateName(value, "Last Name");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "workEmail") {
      const v = validateEmail(value, "Work Email");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "contactNumber") {
      const v = validatePhone(value, "Contact / Mobile Number");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "designation") {
      const v = validateDesignation(value, "Designation");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "companyName") {
      const v = validateCompanyName(value, "Company Name");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "city") {
      const v = validateLocation(value, "City");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "reasonForAttending") {
      const v = validateRequiredText(value, "Reason for Attending", 5, 1000);
      return v.isValid ? "" : v.error;
    } else if (fieldName === "linkedinUrl" && value.trim()) {
      const v = validateUrl(value, "LinkedIn Profile");
      return v.isValid ? "" : v.error;
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touchedFields[name as keyof RegistrationTouchedFields]) {
      const err = getFieldError(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizePhoneInput(e.target.value);
    setFormData((prev) => ({ ...prev, contactNumber: clean }));
    if (touchedFields.contactNumber) {
      const v = validatePhone(clean);
      setFieldErrors((prev) => ({ ...prev, contactNumber: v.isValid ? "" : v.error }));
    }
  };

  const handleFieldBlur = (fieldName: keyof RegistrationTouchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    const val = (formData as Record<string, any>)[fieldName] || "";
    const error = getFieldError(fieldName, val);
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const toggleTrack = (trackName: string) => {
    if (formData.interestTracks.includes(trackName)) {
      setFormData({
        ...formData,
        interestTracks: formData.interestTracks.filter((t) => t !== trackName),
      });
    } else {
      setFormData({
        ...formData,
        interestTracks: [...formData.interestTracks, trackName],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: RegistrationFieldErrors = {};

    const fnVal = validateName(formData.firstName, "First Name");
    if (!fnVal.isValid) errors.firstName = fnVal.error;

    const lnVal = validateName(formData.lastName, "Last Name");
    if (!lnVal.isValid) errors.lastName = lnVal.error;

    const emailVal = validateEmail(formData.workEmail, "Work Email");
    if (!emailVal.isValid) errors.workEmail = emailVal.error;

    const phoneVal = validatePhone(formData.contactNumber, "Contact / Mobile Number");
    if (!phoneVal.isValid) errors.contactNumber = phoneVal.error;

    const desigVal = validateDesignation(formData.designation, "Designation");
    if (!desigVal.isValid) errors.designation = desigVal.error;

    const compVal = validateCompanyName(formData.companyName, "Company / Organization Name");
    if (!compVal.isValid) errors.companyName = compVal.error;

    const cityVal = validateLocation(formData.city, "City");
    if (!cityVal.isValid) errors.city = cityVal.error;

    const reasonVal = validateRequiredText(formData.reasonForAttending, "Reason for Attending", 5, 1000);
    if (!reasonVal.isValid) errors.reasonForAttending = reasonVal.error;

    if (formData.linkedinUrl.trim()) {
      const linkVal = validateUrl(formData.linkedinUrl, "LinkedIn Profile");
      if (!linkVal.isValid) errors.linkedinUrl = linkVal.error;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields({
        firstName: true,
        lastName: true,
        workEmail: true,
        contactNumber: true,
        designation: true,
        companyName: true,
        city: true,
        reasonForAttending: true,
        linkedinUrl: true,
      });
      const firstErrMsg = Object.values(errors)[0];
      toast.error(firstErrMsg || "Please correct the highlighted errors before submitting.");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please agree to the Event Registration Terms & Conditions to proceed.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/registrations/free-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contactNumber: phoneVal.cleanDigits || formData.contactNumber,
          eventId: eventData?.id || slug,
          eventSlug: eventData?.slug || slug,
          eventTitle: eventData?.title || "Executive Summit 2026",
        }),
      });

      const data = await res.json();
      if (data.success && data.registrationId) {
        toast.success("Application submitted for Admin Approval!");
        navigate(`/events/${eventData?.slug || slug || "hr-recall-2k26"}/free-registration-pending?regId=${encodeURIComponent(data.registrationId)}`);
      } else {
        toast.error(data.message || "Failed to submit complimentary registration.");
      }
    } catch (err) {
      toast.error("Network error submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  const industryOptions = [
    "Technology & IT",
    "Finance, Banking & Fintech",
    "Healthcare, Pharma & Biotech",
    "Manufacturing & Automotive",
    "Retail & E-Commerce",
    "Logistics & Supply Chain",
    "Energy, Utilities & Infrastructure",
    "Real Estate & Construction",
    "Media, Entertainment & Telecom",
    "Consulting & Professional Services",
    "Education & Research",
    "Government & Public Sector",
    "Other Industry",
  ];

  const categoryOptions = [
    "C-Suite / CXO (CEO, CFO, CHRO, CTO)",
    "Vice President / Executive Director",
    "Director / Department Head",
    "Senior Manager / Lead",
    "Founder / Entrepreneur",
    "Academic / Researcher",
    "Complimentary VIP Delegate",
  ];

  const interestTrackList = [
    "Leadership & Enterprise Strategy",
    "HR Tech & AI Transformation",
    "Talent Acquisition & Talent Management",
    "ESG, Wellbeing & Workplace Culture",
    "Compensation, Benefits & Tax Structuring",
    "Diversity, Equity & Inclusion (DEI)",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <SEOHead
        title={eventData?.title ? `Complimentary Pass Application: ${eventData.title} | Executive Talks Media` : "Complimentary VIP Pass Application | Executive Talks Media"}
        description={eventData?.description || "Apply for complimentary VIP delegate pass to Executive Talks Media Business Intelligence national summits."}
        keywords={`${eventData?.title || "Conferences"}, Complimentary VIP Pass, Free Registration, Executive Talks Media, Executive Talks`}
        url={`https://www.executivetalksmedia.in/events/${slug || "event"}/register-free`}
      />
      {/* ================= HERO HEADER BANNER ================= */}
      <div className="relative bg-slate-950 text-white pt-28 sm:pt-32 pb-10 sm:pb-14 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-slate-950 to-cyan-950/80 z-0" />
        {eventData?.image && (
          <img
            src={eventData.image}
            alt={eventData.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm z-0"
          />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Free Delegate Application
                </span>
                <span className="text-xs font-bold text-slate-400">Subject to Admin Selection & Approval</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
                {eventData?.title || "HR RECALL 2K26 Leadership Conclave"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
                {eventData?.date && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{eventData.date}</span>
                  </div>
                )}
                {(eventData?.venue || eventData?.city) && (
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : eventData.city}</span>
                  </div>
                )}
              </div>
            </div>

            <Link
              to={`/events/${eventData?.slug || slug || ""}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-xs font-extrabold text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all self-start md:self-auto cursor-pointer shadow-lg shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Event Overview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Event Overview & Free Delegate Perks */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
              {eventData?.image && (
                <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-sm">
                  <img src={eventData.image} alt={eventData.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                      Complimentary VIP Pass
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-base sm:text-lg font-black font-display text-slate-900 leading-tight">
                  {eventData?.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{eventData?.description}</p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                {eventData?.date && (
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{eventData.date}</span>
                  </div>
                )}
                {(eventData?.venue || eventData?.city) && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : eventData.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pass Status: Complimentary (Subject to Approval)</span>
                </div>
              </div>

              {/* Inclusions */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Free Delegate Pass Privileges:
                </span>
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Access to Main Conclave Sessions & Panels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Executive Delegate Badge & Conference Kit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Digital Verified Pass sent via Email</span>
                  </li>
                </ul>
              </div>

              {/* Support Contact */}
              <div className="rounded-2xl bg-slate-50 p-3.5 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Support Desk</div>
                <div>Call: <a href="tel:+919100266777" className="text-emerald-700 font-bold hover:underline">+91 91002 66777</a></div>
                <div>Email: <a href="mailto:registration@executivetalksmedia.in" className="text-emerald-700 font-bold hover:underline">registration@executivetalksmedia.in</a></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Free Registration Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8"
            >
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Free Delegate Access • Pending Admin Approval</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                  Apply for Complimentary Delegate Pass
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Submit your executive profile details below. Free delegate passes are subject to selection committee approval by the Admin.
                </p>
              </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>First Name <span className="text-rose-500">*</span></span>
                  {touchedFields.firstName && !fieldErrors.firstName && validateName(formData.firstName).isValid && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                  )}
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("firstName")}
                  placeholder="e.g. Rajesh"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.firstName && fieldErrors.firstName
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.firstName && !fieldErrors.firstName && validateName(formData.firstName).isValid
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.firstName && fieldErrors.firstName && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Last Name <span className="text-rose-500">*</span></span>
                  {touchedFields.lastName && !fieldErrors.lastName && validateName(formData.lastName).isValid && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                  )}
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("lastName")}
                  placeholder="e.g. Sharma"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.lastName && fieldErrors.lastName
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.lastName && !fieldErrors.lastName && validateName(formData.lastName).isValid
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.lastName && fieldErrors.lastName && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Work Email <span className="text-rose-500">*</span></span>
                  {touchedFields.workEmail && !fieldErrors.workEmail && validateEmail(formData.workEmail).isValid && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid email</span>
                  )}
                </label>
                <input
                  type="email"
                  name="workEmail"
                  required
                  value={formData.workEmail}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("workEmail")}
                  placeholder="rajesh@company.com"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.workEmail && fieldErrors.workEmail
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.workEmail && !fieldErrors.workEmail && validateEmail(formData.workEmail).isValid
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.workEmail && fieldErrors.workEmail && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.workEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Contact / Mobile Number <span className="text-rose-500">*</span></span>
                  {touchedFields.contactNumber && !fieldErrors.contactNumber && validatePhone(formData.contactNumber).isValid && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid phone</span>
                  )}
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  required
                  maxLength={15}
                  value={formData.contactNumber}
                  onChange={handlePhoneChange}
                  onBlur={() => handleFieldBlur("contactNumber")}
                  placeholder="e.g. 98765 43210"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.contactNumber && fieldErrors.contactNumber
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.contactNumber && !fieldErrors.contactNumber && validatePhone(formData.contactNumber).isValid
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.contactNumber && fieldErrors.contactNumber && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.contactNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Designation <span className="text-rose-500">*</span></span>
                  {touchedFields.designation && !fieldErrors.designation && validateDesignation(formData.designation).isValid && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                  )}
                </label>
                <input
                  type="text"
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("designation")}
                  placeholder="e.g. Vice President HR"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.designation && fieldErrors.designation
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.designation && !fieldErrors.designation && validateDesignation(formData.designation).isValid
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.designation && fieldErrors.designation && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.designation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Company / Organization Name <span className="text-rose-500">*</span></span>
                  {touchedFields.companyName && !fieldErrors.companyName && validateCompanyName(formData.companyName).isValid && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                  )}
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("companyName")}
                  placeholder="e.g. Enterprise Solutions Ltd"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.companyName && fieldErrors.companyName
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.companyName && !fieldErrors.companyName && validateCompanyName(formData.companyName).isValid
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.companyName && fieldErrors.companyName && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.companyName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>City <span className="text-rose-500">*</span></span>
                  {touchedFields.city && !fieldErrors.city && validateLocation(formData.city).isValid && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                  )}
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("city")}
                  placeholder="e.g. Hyderabad / Bengaluru"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.city && fieldErrors.city
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.city && !fieldErrors.city && validateLocation(formData.city).isValid
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.city && fieldErrors.city && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Country <span className="text-rose-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Other Country">Other Country</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Industry <span className="text-rose-500">*</span>
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                >
                  {industryOptions.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span></span>
                  {touchedFields.linkedinUrl && !fieldErrors.linkedinUrl && formData.linkedinUrl && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid URL</span>
                  )}
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("linkedinUrl")}
                  placeholder="https://linkedin.com/in/profile"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.linkedinUrl && fieldErrors.linkedinUrl
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.linkedinUrl && !fieldErrors.linkedinUrl && formData.linkedinUrl
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.linkedinUrl && fieldErrors.linkedinUrl && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.linkedinUrl}
                  </p>
                )}
              </div>
            </div>

            {/* Participation Preferences */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Category & Participation Preferences</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Select executive level and preferred tracks.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Executive Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Participation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["In-Person Delegate", "Virtual Delegate"].map((mode) => {
                      const isSel = formData.participationPreference === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setFormData({ ...formData, participationPreference: mode })}
                          className={`p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                            isSel
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {mode === "In-Person Delegate" ? "🏢 In-Person" : "💻 Virtual"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Topics of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestTrackList.map((track) => {
                    const isChecked = formData.interestTracks.includes(track);
                    return (
                      <button
                        key={track}
                        type="button"
                        onClick={() => toggleTrack(track)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        <span>{track}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* VIP Motivation / Reason for Attending */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Executive Motivation / Reason for Attending <span className="text-rose-500">*</span></span>
                  {touchedFields.reasonForAttending && !fieldErrors.reasonForAttending && formData.reasonForAttending.trim().length >= 5 && (
                    <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                  )}
                </label>
                <textarea
                  name="reasonForAttending"
                  required
                  rows={3}
                  value={formData.reasonForAttending}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("reasonForAttending")}
                  placeholder="Share why you would like to attend as a complimentary delegate (e.g., Key networking goals, enterprise initiatives)..."
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                    touchedFields.reasonForAttending && fieldErrors.reasonForAttending
                      ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                      : touchedFields.reasonForAttending && !fieldErrors.reasonForAttending && formData.reasonForAttending.trim().length >= 5
                      ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                      : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                  }`}
                />
                {touchedFields.reasonForAttending && fieldErrors.reasonForAttending && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                    ⚠️ {fieldErrors.reasonForAttending}
                  </p>
                )}
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="pt-4">
              <EventTermsAndConditionsBox
                checked={termsAccepted}
                onChange={setTermsAccepted}
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <Link
                to={`/events/${eventData?.slug || slug || ""}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-extrabold text-xs transition-all text-center cursor-pointer"
              >
                Cancel / Back to Event
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{submitting ? "Submitting Application..." : "Submit Application for Admin Approval"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  </div>
</div>
  );
}

