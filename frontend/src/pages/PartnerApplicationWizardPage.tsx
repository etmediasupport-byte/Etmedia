import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Globe,
  MapPin,
  User,
  Briefcase,
  Mail,
  Phone,
  Sparkles,
  Crown,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  Check,
  ChevronRight,
  Layers,
  Award,
  Users,
  Target,
  Zap,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/site/SEOHead";
import { contact } from "@/lib/site-data";
import {
  validateName,
  validateEmail,
  validatePhone,
  sanitizePhoneInput,
  validateCompanyName,
  validateLocation,
  validateDesignation,
  validateUrl,
  validateRequiredText,
} from "@/lib/validation";
import { EventTermsAndConditionsBox } from "@/components/site/EventTermsAndConditionsBox";

interface PartnerFormErrors {
  company_name?: string;
  website?: string;
  industry?: string;
  location?: string;
  contact_person?: string;
  designation?: string;
  email?: string;
  phone?: string;
  partnership_type?: string;
  message?: string;
}

interface PartnerFormTouched {
  company_name?: boolean;
  website?: boolean;
  industry?: boolean;
  location?: boolean;
  contact_person?: boolean;
  designation?: boolean;
  email?: boolean;
  phone?: boolean;
  partnership_type?: boolean;
  message?: boolean;
}

const INDUSTRY_OPTIONS = [
  "Finance & Banking (BFSI)",
  "IT & Enterprise Software",
  "Healthcare & Life Sciences",
  "E-Commerce & Retail",
  "Manufacturing & Engineering",
  "Human Resources & Talent Management",
  "Energy & Sustainability",
  "Real Estate & Infrastructure",
  "Media & Telecom",
  "Consulting & Professional Services",
  "Automotive & Mobility",
  "Education & EdTech",
  "Other Industry",
];

const PARTNERSHIP_TIERS = [
  {
    id: "Title / Presenting Partner",
    name: "Title / Presenting Partner",
    badge: "Highest Impact",
    icon: Crown,
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    iconBg: "bg-amber-100 text-amber-700",
    desc: "Sole title branding across all summit stages, nationwide digital media, and 15 VIP CXO passes.",
    perks: ["Mainstage Backdrop Co-Branding", "15 VIP All-Access Passes", "20-Min Dedicated Keynote Slot"],
  },
  {
    id: "Platinum Alliance Partner",
    name: "Platinum Alliance Partner",
    badge: "Most Popular",
    icon: Sparkles,
    badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-300",
    iconBg: "bg-cyan-100 text-cyan-700",
    desc: "Premium stage backdrop presence, executive panel seat, and premium exhibition booth.",
    perks: ["Prominent Stage & Banner Logo", "10 VIP All-Access Passes", "Executive Panel Discussion Seat"],
  },
  {
    id: "Gold Exhibition Partner",
    name: "Gold Exhibition Partner",
    badge: "B2B Lead Scale",
    icon: Layers,
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
    iconBg: "bg-blue-100 text-blue-700",
    desc: "Dedicated exhibition booth pavilion, qualified lead capture list, and 5 executive passes.",
    perks: ["Dedicated Exhibition Pavilion Space", "5 Executive Passes", "Direct Attendee Lead Access"],
  },
  {
    id: "Keynote & Thought Leadership Slot",
    name: "Keynote & Thought Leadership",
    badge: "Authority",
    icon: Award,
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    iconBg: "bg-purple-100 text-purple-700",
    desc: "Position your CXOs on stage with dedicated keynote presentations and fireside video broadcasts.",
    perks: ["Fireside Executive Broadcast", "Video Production & PR Syndication", "4 Executive Passes"],
  },
  {
    id: "Product Launch & Live Demo Stage",
    name: "Product Launch Stage",
    badge: "Spotlight",
    icon: Zap,
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    iconBg: "bg-emerald-100 text-emerald-700",
    desc: "Unveil new enterprise platforms, products, and solutions directly to hundreds of CXO delegates.",
    perks: ["Mainstage Product Unveiling", "Live Interactive Demo Zone", "3 Executive Passes"],
  },
  {
    id: "Custom Ecosystem & Media Partner",
    name: "Custom Strategic Alliance",
    badge: "Tailored",
    icon: Target,
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    iconBg: "bg-slate-100 text-slate-700",
    desc: "Custom package combining awards presenting, PR syndication, and private CXO roundtables.",
    perks: ["Customized Multi-Touchpoint Campaign", "VIP Lounge Access", "Custom Pass Allocation"],
  },
];

export default function PartnerApplicationWizardPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    company_name: "",
    website: "",
    industry: "IT & Enterprise Software",
    location: "",
    contact_person: "",
    designation: "",
    email: "",
    phone: "",
    partnership_type: "Platinum Alliance Partner",
    message: "",
  });

  const [touchedFields, setTouchedFields] = useState<PartnerFormTouched>({});
  const [fieldErrors, setFieldErrors] = useState<PartnerFormErrors>({});

  // Real-time Field Validation Handler
  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "company_name": {
        const val = validateCompanyName(value, "Company / Organization Name");
        if (!val.isValid) error = val.error;
        break;
      }
      case "website": {
        if (value.trim()) {
          const val = validateUrl(value, "Company Website URL");
          if (!val.isValid) error = val.error;
        }
        break;
      }
      case "location": {
        const val = validateLocation(value, "Headquarters / Location");
        if (!val.isValid) error = val.error;
        break;
      }
      case "contact_person": {
        const val = validateName(value, "Contact Representative Name");
        if (!val.isValid) error = val.error;
        break;
      }
      case "designation": {
        const val = validateDesignation(value, "Official Designation");
        if (!val.isValid) error = val.error;
        break;
      }
      case "email": {
        const val = validateEmail(value, "Work Email Address");
        if (!val.isValid) error = val.error;
        break;
      }
      case "phone": {
        const val = validatePhone(value, "Phone / Mobile Number");
        if (!val.isValid) error = val.error;
        break;
      }
      default:
        break;
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[name as keyof PartnerFormErrors] = error;
      } else {
        delete next[name as keyof PartnerFormErrors];
      }
      return next;
    });

    return !error;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touchedFields[name as keyof PartnerFormTouched]) {
      validateField(name, value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhoneInput(e.target.value);
    setFormData((prev) => ({ ...prev, phone: sanitized }));
    if (touchedFields.phone) {
      validateField("phone", sanitized);
    }
  };

  const handleFieldBlur = (name: keyof PartnerFormTouched) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    validateField(name, (formData as any)[name] || "");
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errors: PartnerFormErrors = {};

    const compVal = validateCompanyName(formData.company_name, "Company Name");
    if (!compVal.isValid) errors.company_name = compVal.error;

    if (formData.website.trim()) {
      const webVal = validateUrl(formData.website, "Website URL");
      if (!webVal.isValid) errors.website = webVal.error;
    }

    const locVal = validateLocation(formData.location, "Headquarters Location");
    if (!locVal.isValid) errors.location = locVal.error;

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    setTouchedFields((prev) => ({
      ...prev,
      company_name: true,
      website: true,
      industry: true,
      location: true,
    }));

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0] || "Please fill in all organization details correctly.");
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errors: PartnerFormErrors = {};

    const nameVal = validateName(formData.contact_person, "Primary Contact Name");
    if (!nameVal.isValid) errors.contact_person = nameVal.error;

    const desigVal = validateDesignation(formData.designation, "Official Designation");
    if (!desigVal.isValid) errors.designation = desigVal.error;

    const emailVal = validateEmail(formData.email, "Official Work Email");
    if (!emailVal.isValid) errors.email = emailVal.error;

    const phoneVal = validatePhone(formData.phone, "Phone / Mobile Number");
    if (!phoneVal.isValid) errors.phone = phoneVal.error;

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    setTouchedFields((prev) => ({
      ...prev,
      contact_person: true,
      designation: true,
      email: true,
      phone: true,
    }));

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0] || "Please enter valid contact details.");
      return false;
    }
    return true;
  };

  // Step Navigation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo({ top: 100, behavior: "smooth" });
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        window.scrollTo({ top: 100, behavior: "smooth" });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 100, behavior: "smooth" });
    }
  };

  // Final Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2()) {
      return;
    }

    if (!termsAccepted) {
      toast.error("Please review and agree to the Event Registration Terms & Conditions.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/partners/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: formData.company_name.trim(),
          website: formData.website.trim(),
          industry: formData.industry,
          location: formData.location.trim(),
          contact_person: formData.contact_person.trim(),
          designation: formData.designation.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          partnership_type: formData.partnership_type,
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedData({
          ...formData,
          id: data.id || `PRT-SUB-${Date.now().toString().slice(-6)}`,
        });
        toast.success("Partnership proposal submitted successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(data.message || "Failed to submit partnership application. Please try again.");
      }
    } catch (err) {
      console.error("Partner submission error:", err);
      toast.error("Network error while submitting proposal. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW (Light Theme)
  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-cyan-200 selection:text-cyan-900">
        <SEOHead
          title="Partnership Proposal Submitted | Executive Talks Media"
          description="Your enterprise partnership application has been submitted to Executive Talks Media alliances team."
          url="https://www.executivetalksmedia.in/partner/apply"
        />

        {/* Ambient background decoration */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-100/60 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 sm:p-10 text-center space-y-8"
          >
            {/* Success Icon Badge */}
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-pulse" />
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black uppercase tracking-wider font-display">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                Partnership Application Registered
              </span>
              <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-slate-900">
                Partnership Proposal Received!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{submittedData.contact_person}</strong>. Your enterprise alliance proposal for{" "}
                <strong className="text-cyan-700">{submittedData.company_name}</strong> has been routed to our Executive Alliances Directorate.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 text-left space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 text-xs font-mono text-slate-600">
                <span>Application Ref ID: <strong className="text-cyan-700 font-bold text-sm">{submittedData.id}</strong></span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold text-[11px] border border-emerald-200">
                  Status: Under Strategic Review
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Company</span>
                  <span className="text-slate-900 font-bold">{submittedData.company_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Selected Tier</span>
                  <span className="text-cyan-700 font-bold">{submittedData.partnership_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Primary Contact</span>
                  <span className="text-slate-800 font-semibold">{submittedData.contact_person} ({submittedData.designation})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] uppercase font-bold tracking-wider">Contact Email & Phone</span>
                  <span className="text-slate-700">{submittedData.email} • {submittedData.phone}</span>
                </div>
              </div>
            </div>

            {/* Next Steps Timeline */}
            <div className="rounded-2xl bg-cyan-50/70 border border-cyan-200/80 p-5 text-left space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-900 flex items-center gap-2 font-display">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                What Happens Next?
              </h4>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span><strong>24-48 Hours Review:</strong> Our alliances director will evaluate event slot availability and tier branding rights.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span><strong>Alliance Briefing:</strong> You will receive a direct phone call and custom sponsorship deck with exact stage deliverables.</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/partner")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-cyan-600/25 cursor-pointer"
              >
                Back to Partnerships Overview
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm transition-all text-center"
              >
                Return to Homepage
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-200 selection:text-cyan-900 relative overflow-hidden font-sans">
      <SEOHead
        title="Partnership Application Wizard | Executive Talks Media"
        description="Submit your enterprise brand partnership or summit sponsorship proposal to Executive Talks Media Business Intelligence."
        keywords="Partner Application, Sponsorship Proposal, Executive Talks Media, ET Media, CXO Sponsorship"
        url="https://www.executivetalksmedia.in/partner/apply"
      />

      {/* HEADER HERO SECTION (Fixed navbar clearance with pt-28 sm:pt-32 lg:pt-36) */}
      <div className="border-b border-slate-200/90 bg-white shadow-xs relative z-10 pt-28 sm:pt-32 lg:pt-36 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4 flex-wrap">
            <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/partner" className="hover:text-cyan-600 transition-colors">Partnerships</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-cyan-700 font-bold">Apply for Partnership</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-black uppercase tracking-wider font-display">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Executive Media Alliances</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-slate-900 leading-tight">
                Partner With Executive Talks Media
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Position your enterprise brand directly before India's premier CXOs, VP decision makers, and industry pioneers through exclusive summit sponsorships and broadcast features.
              </p>
            </div>

            {/* Top Quick Badges */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs">
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>5,000+ CXO Network</span>
              </div>
            </div>
          </div>

          {/* STEPPER PROGRESS BAR */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              
              {/* Step 1 Pill */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`text-left p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  currentStep === 1
                    ? "border-cyan-500 bg-cyan-50/90 shadow-md shadow-cyan-500/10 ring-2 ring-cyan-500/20"
                    : currentStep > 1
                    ? "border-emerald-300 bg-emerald-50/70 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === 1
                      ? "bg-cyan-600 text-white"
                      : currentStep > 1
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {currentStep > 1 ? "✓" : "1"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Step 1</span>
                </div>
                <div className={`text-xs sm:text-sm font-bold font-display truncate ${
                  currentStep === 1 ? "text-cyan-950" : currentStep > 1 ? "text-emerald-900" : "text-slate-600"
                }`}>
                  Organization Profile
                </div>
              </button>

              {/* Step 2 Pill */}
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className={`text-left p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  currentStep === 2
                    ? "border-cyan-500 bg-cyan-50/90 shadow-md shadow-cyan-500/10 ring-2 ring-cyan-500/20"
                    : currentStep > 2
                    ? "border-emerald-300 bg-emerald-50/70 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === 2
                      ? "bg-cyan-600 text-white"
                      : currentStep > 2
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {currentStep > 2 ? "✓" : "2"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Step 2</span>
                </div>
                <div className={`text-xs sm:text-sm font-bold font-display truncate ${
                  currentStep === 2 ? "text-cyan-950" : currentStep > 2 ? "text-emerald-900" : "text-slate-600"
                }`}>
                  Executive Contact
                </div>
              </button>

              {/* Step 3 Pill */}
              <button
                type="button"
                onClick={() => {
                  if (validateStep1() && validateStep2()) setCurrentStep(3);
                }}
                className={`text-left p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  currentStep === 3
                    ? "border-cyan-500 bg-cyan-50/90 shadow-md shadow-cyan-500/10 ring-2 ring-cyan-500/20"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === 3 ? "bg-cyan-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    3
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Step 3</span>
                </div>
                <div className={`text-xs sm:text-sm font-bold font-display truncate ${
                  currentStep === 3 ? "text-cyan-950" : "text-slate-600"
                }`}>
                  Alliance Scope
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT WORKSPACE (Split Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLS: INTERACTIVE STEP WIZARD FORM */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 p-6 sm:p-8">
              
              <form onSubmit={handleSubmit} noValidate>
                <AnimatePresence mode="wait">
                  
                  {/* ==================================================== */}
                  {/* STEP 1: ORGANIZATION DETAILS                         */}
                  {/* ==================================================== */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5 text-cyan-700 text-xs font-bold uppercase tracking-widest font-display">
                          <Building2 className="w-4 h-4 text-cyan-600" />
                          <span>Step 1 of 3: Organization Profile</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
                          Tell Us About Your Organization
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Enter your company profile and industry domain to customize alliance deliverables.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Company Name */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Company / Organization Name <span className="text-rose-500">*</span></span>
                            {touchedFields.company_name && !fieldErrors.company_name && formData.company_name.trim().length >= 2 && (
                              <span className="text-[11px] font-extrabold text-emerald-600">✓ Valid</span>
                            )}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="company_name"
                              required
                              value={formData.company_name}
                              onChange={handleInputChange}
                              onBlur={() => handleFieldBlur("company_name")}
                              placeholder="e.g. Acme Enterprise Solutions Pvt Ltd"
                              className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                                touchedFields.company_name && fieldErrors.company_name
                                  ? "border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10"
                                  : touchedFields.company_name && !fieldErrors.company_name && formData.company_name.trim().length >= 2
                                  ? "border-emerald-400 bg-emerald-50/20 focus:ring-4 focus:ring-emerald-500/10"
                                  : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10"
                              }`}
                            />
                          </div>
                          {touchedFields.company_name && fieldErrors.company_name && (
                            <p className="mt-1.5 text-xs font-bold text-rose-600 animate-in fade-in flex items-center gap-1">
                              <span>⚠️</span> {fieldErrors.company_name}
                            </p>
                          )}
                        </div>

                        {/* Company Website URL */}
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Website URL <span className="text-slate-400 font-normal">(Optional)</span></span>
                            {touchedFields.website && !fieldErrors.website && formData.website.trim() && (
                              <span className="text-[11px] font-extrabold text-emerald-600">✓ Valid URL</span>
                            )}
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              onBlur={() => handleFieldBlur("website")}
                              placeholder="https://acme.com"
                              className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                                touchedFields.website && fieldErrors.website
                                  ? "border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10"
                                  : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10"
                              }`}
                            />
                          </div>
                          {touchedFields.website && fieldErrors.website && (
                            <p className="mt-1.5 text-xs font-bold text-rose-600 animate-in fade-in flex items-center gap-1">
                              <span>⚠️</span> {fieldErrors.website}
                            </p>
                          )}
                        </div>

                        {/* Industry Sector */}
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Industry Sector <span className="text-rose-500">*</span>
                          </label>
                          <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleInputChange}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 focus:outline-none transition-all cursor-pointer"
                          >
                            {INDUSTRY_OPTIONS.map((ind) => (
                              <option key={ind} value={ind} className="bg-white text-slate-900">
                                {ind}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Headquarters / City Location */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Headquarters / Location <span className="text-rose-500">*</span></span>
                            {touchedFields.location && !fieldErrors.location && validateLocation(formData.location).isValid && (
                              <span className="text-[11px] font-extrabold text-emerald-600">✓ Valid Location</span>
                            )}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="location"
                              required
                              value={formData.location}
                              onChange={handleInputChange}
                              onBlur={() => handleFieldBlur("location")}
                              placeholder="e.g. Hyderabad / Bengaluru / Mumbai"
                              className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                                touchedFields.location && fieldErrors.location
                                  ? "border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10"
                                  : touchedFields.location && !fieldErrors.location && validateLocation(formData.location).isValid
                                  ? "border-emerald-400 bg-emerald-50/20 focus:ring-4 focus:ring-emerald-500/10"
                                  : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10"
                              }`}
                            />
                          </div>
                          {touchedFields.location && fieldErrors.location && (
                            <p className="mt-1.5 text-xs font-bold text-rose-600 animate-in fade-in flex items-center gap-1">
                              <span>⚠️</span> {fieldErrors.location}
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Step 1 Actions */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <Link
                          to="/partner"
                          className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          Cancel / Back
                        </Link>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-black text-white hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-cyan-600/25 cursor-pointer"
                        >
                          <span>Continue to Step 2: Contact Info</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ==================================================== */}
                  {/* STEP 2: EXECUTIVE CONTACT DETAILS                    */}
                  {/* ==================================================== */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5 text-cyan-700 text-xs font-bold uppercase tracking-widest font-display">
                          <User className="w-4 h-4 text-cyan-600" />
                          <span>Step 2 of 3: Primary Executive Contact</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
                          Primary Contact Representative
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Provide the official details of the alliance lead or corporate communication director.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Contact Person Name */}
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Full Name <span className="text-rose-500">*</span></span>
                            {touchedFields.contact_person && !fieldErrors.contact_person && validateName(formData.contact_person).isValid && (
                              <span className="text-[11px] font-extrabold text-emerald-600">✓ Valid</span>
                            )}
                          </label>
                          <input
                            type="text"
                            name="contact_person"
                            required
                            value={formData.contact_person}
                            onChange={handleInputChange}
                            onBlur={() => handleFieldBlur("contact_person")}
                            placeholder="e.g. Rajesh Sharma"
                            className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                              touchedFields.contact_person && fieldErrors.contact_person
                                ? "border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10"
                                : touchedFields.contact_person && !fieldErrors.contact_person && validateName(formData.contact_person).isValid
                                ? "border-emerald-400 bg-emerald-50/20 focus:ring-4 focus:ring-emerald-500/10"
                                : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10"
                            }`}
                          />
                          {touchedFields.contact_person && fieldErrors.contact_person && (
                            <p className="mt-1.5 text-xs font-bold text-rose-600 animate-in fade-in flex items-center gap-1">
                              <span>⚠️</span> {fieldErrors.contact_person}
                            </p>
                          )}
                        </div>

                        {/* Official Designation */}
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Official Designation <span className="text-rose-500">*</span></span>
                            {touchedFields.designation && !fieldErrors.designation && validateDesignation(formData.designation).isValid && (
                              <span className="text-[11px] font-extrabold text-emerald-600">✓ Valid</span>
                            )}
                          </label>
                          <input
                            type="text"
                            name="designation"
                            required
                            value={formData.designation}
                            onChange={handleInputChange}
                            onBlur={() => handleFieldBlur("designation")}
                            placeholder="e.g. Vice President - Marketing"
                            className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                              touchedFields.designation && fieldErrors.designation
                                ? "border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10"
                                : touchedFields.designation && !fieldErrors.designation && validateDesignation(formData.designation).isValid
                                ? "border-emerald-400 bg-emerald-50/20 focus:ring-4 focus:ring-emerald-500/10"
                                : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10"
                            }`}
                          />
                          {touchedFields.designation && fieldErrors.designation && (
                            <p className="mt-1.5 text-xs font-bold text-rose-600 animate-in fade-in flex items-center gap-1">
                              <span>⚠️</span> {fieldErrors.designation}
                            </p>
                          )}
                        </div>

                        {/* Work Email */}
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Official Work Email <span className="text-rose-500">*</span></span>
                            {touchedFields.email && !fieldErrors.email && validateEmail(formData.email).isValid && (
                              <span className="text-[11px] font-extrabold text-emerald-600">✓ Valid Email</span>
                            )}
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={() => handleFieldBlur("email")}
                            placeholder="rajesh@company.com"
                            className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                              touchedFields.email && fieldErrors.email
                                ? "border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10"
                                : touchedFields.email && !fieldErrors.email && validateEmail(formData.email).isValid
                                ? "border-emerald-400 bg-emerald-50/20 focus:ring-4 focus:ring-emerald-500/10"
                                : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10"
                            }`}
                          />
                          {touchedFields.email && fieldErrors.email && (
                            <p className="mt-1.5 text-xs font-bold text-rose-600 animate-in fade-in flex items-center gap-1">
                              <span>⚠️</span> {fieldErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Phone / Mobile Number */}
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Direct Mobile Number <span className="text-rose-500">*</span></span>
                            {touchedFields.phone && !fieldErrors.phone && validatePhone(formData.phone).isValid && (
                              <span className="text-[11px] font-extrabold text-emerald-600">✓ Valid Phone</span>
                            )}
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            maxLength={15}
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            onBlur={() => handleFieldBlur("phone")}
                            placeholder="e.g. 98765 43210"
                            className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                              touchedFields.phone && fieldErrors.phone
                                ? "border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10"
                                : touchedFields.phone && !fieldErrors.phone && validatePhone(formData.phone).isValid
                                ? "border-emerald-400 bg-emerald-50/20 focus:ring-4 focus:ring-emerald-500/10"
                                : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10"
                            }`}
                          />
                          {touchedFields.phone && fieldErrors.phone && (
                            <p className="mt-1.5 text-xs font-bold text-rose-600 animate-in fade-in flex items-center gap-1">
                              <span>⚠️</span> {fieldErrors.phone}
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Step 2 Actions */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Previous Step</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-black text-white hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-cyan-600/25 cursor-pointer"
                        >
                          <span>Continue to Step 3: Alliance Scope</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ==================================================== */}
                  {/* STEP 3: PARTNERSHIP SCOPE & PROPOSAL                 */}
                  {/* ==================================================== */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5 text-cyan-700 text-xs font-bold uppercase tracking-widest font-display">
                          <Crown className="w-4 h-4 text-cyan-600" />
                          <span>Step 3 of 3: Alliance Scope & Proposal</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
                          Select Preferred Partnership Category
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Choose an engagement tier and outline any specific keynote, booth, or media syndication requirements.
                        </p>
                      </div>

                      {/* Tier Selection Interactive Cards */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Partnership Tier / Model <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {PARTNERSHIP_TIERS.map((tier) => {
                            const isSelected = formData.partnership_type === tier.id;
                            const TierIcon = tier.icon;
                            return (
                              <div
                                key={tier.id}
                                onClick={() => setFormData((prev) => ({ ...prev, partnership_type: tier.id }))}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between text-left ${
                                  isSelected
                                    ? "border-cyan-600 bg-cyan-50/60 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/30"
                                    : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-2 rounded-xl ${isSelected ? "bg-cyan-600 text-white" : tier.iconBg}`}>
                                        <TierIcon className="w-4 h-4" />
                                      </div>
                                      <span className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                                        {tier.name}
                                      </span>
                                    </div>
                                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                                      {tier.badge}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                    {tier.desc}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                                  {tier.perks.map((p, idx) => (
                                    <div key={idx} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                                      <Check className="w-3 h-3 text-cyan-600 shrink-0" />
                                      <span className="truncate">{p}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Proposal Note / Strategic Objectives */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Proposal Brief & Specific Requirements <span className="text-slate-400 font-normal">(Optional)</span></span>
                          {formData.message.trim().length >= 10 && (
                            <span className="text-[11px] font-extrabold text-emerald-600">✓ Notes Added</span>
                          )}
                        </label>
                        <textarea
                          name="message"
                          rows={3}
                          value={formData.message}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur("message")}
                          placeholder="Briefly describe your marketing vision, target audience segment, or preferred summit city..."
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        />
                      </div>

                      {/* TERMS & CONDITIONS ACCORDION */}
                      <div className="pt-2">
                        <EventTermsAndConditionsBox
                          checked={termsAccepted}
                          onChange={setTermsAccepted}
                        />
                      </div>

                      {/* Step 3 Submit Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Previous Step</span>
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-8 py-4 text-sm font-black text-white hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-cyan-600/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Submitting Strategic Proposal...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Partnership Proposal</span>
                              <Send className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </form>

            </div>
          </div>

          {/* RIGHT 4 COLS: STICKY ALLIANCE EXECUTIVE SUMMARY & BENEFITS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Application Overview Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/50 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-display">
                    Alliance Briefing
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Step {currentStep} of 3
                </span>
              </div>

              {/* Dynamic summary preview */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Organization:</span>
                  <span className="text-slate-900 font-bold truncate max-w-[170px] text-right">
                    {formData.company_name || <em className="text-slate-400 font-normal">Pending</em>}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Sector:</span>
                  <span className="text-cyan-700 font-bold truncate max-w-[170px] text-right">
                    {formData.industry}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Headquarters:</span>
                  <span className="text-slate-800 font-semibold truncate max-w-[170px] text-right">
                    {formData.location || <em className="text-slate-400 font-normal">Pending</em>}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500 font-medium">Selected Tier:</span>
                  <span className="text-cyan-700 font-bold truncate max-w-[170px] text-right">
                    {formData.partnership_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Why Partner Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-md shadow-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
                <Award className="w-4 h-4 text-cyan-600" />
                <span>Strategic Partner Deliverables</span>
              </h3>
              
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                    ✓
                  </div>
                  <span><strong>5,000+ CXO & VP Network:</strong> Reach Verified Decision Makers from Fortune 500, Enterprise, and Growth Unicorns.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                    ✓
                  </div>
                  <span><strong>Multi-Channel Broadcast:</strong> Stage video production, social media campaigns, and magazine executive features.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                    ✓
                  </div>
                  <span><strong>1-on-1 B2B Networking:</strong> Closed-door executive roundtable spaces and VIP delegate access passes.</span>
                </li>
              </ul>
            </div>

            {/* Direct Alliance Support Hotline */}
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 space-y-4 text-left shadow-lg text-white">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800/40">
                <Phone className="w-3 h-3" />
                Direct Alliances Desk
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Need immediate summit sponsorship assistance or a custom proposal? Reach our alliance team:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <a
                  href={`tel:${(contact.phones[0] ?? "+91 90000 00000").replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-white font-bold hover:text-cyan-400 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{contact.phones[0] ?? "+91 90000 00000"}</span>
                </a>
                <a
                  href={`mailto:${contact.emails[2] ?? contact.emails[0] ?? "partnerships@executivetalks.in"}`}
                  className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{contact.emails[2] ?? contact.emails[0] ?? "partnerships@executivetalks.in"}</span>
                </a>
              </div>
            </div>

            {/* Privacy & Trust Badge */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <p className="text-[11px] text-slate-600 flex items-center justify-center gap-2 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted & Corporate Data Protected</span>
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
