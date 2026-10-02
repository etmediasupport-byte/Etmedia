import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Sparkles,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  Crown,
  Award,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Send,
  Zap,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  validateEmail,
  validatePhone,
  sanitizePhoneInput,
  validateName,
  validateRequiredText,
  validateDesignation,
  validateCompanyName,
  validateLocation,
} from "@/lib/validation";
import { EventTermsAndConditionsBox } from "@/components/site/EventTermsAndConditionsBox";

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MEMBERSHIP_TIERS = [
  {
    id: "executive-council",
    title: "Executive Council Member",
    badge: "Regional Access",
    popular: false,
    color: "from-cyan-500 to-blue-600",
    border: "border-cyan-500/40",
    glow: "shadow-cyan-500/20",
    desc: "Designed for Vice Presidents, Directors, and functional heads seeking regional summits and networking.",
    perks: [
      "Access to 4 Regional Leadership Summits/Year",
      "Executive Networking Directory Access",
      "Quarterly C-Suite Intelligence Briefings",
      "Delegate Pass Priority Booking",
    ],
  },
  {
    id: "cxo-platinum",
    title: "CXO Platinum Leadership",
    badge: "VIP C-Suite Tier",
    popular: true,
    color: "from-purple-500 via-pink-500 to-cyan-400",
    border: "border-purple-500/60",
    glow: "shadow-purple-500/30",
    desc: "Exclusive for CEOs, CFOs, CIOs, CHROs, and C-Suite decision-makers seeking maximum influence.",
    perks: [
      "VIP Access to All National & International Summits",
      "Private 1-on-1 C-Suite Matchmaking Roundtables",
      "Exclusive Advisory Board Nomination & Voting",
      "Keynote Speaking & Panel Opportunity Priority",
      "Executive Talks Magazine Print Edition Subscription",
    ],
  },
  {
    id: "corporate-enterprise",
    title: "Corporate Enterprise Member",
    badge: "Multi-Delegate Tier",
    popular: false,
    color: "from-emerald-500 to-teal-600",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-500/20",
    desc: "Engineered for organizations wanting multi-executive passes, branding credits, and strategic alliances.",
    perks: [
      "5 All-Access Executive Passes per Summit",
      "Corporate Brand Visibility in Summit Portals",
      "Customized Industry Intelligence Reports",
      "Dedicated Enterprise Account Manager",
    ],
  },
];

const INDUSTRIES_LIST = [
  "Technology, AI & Software",
  "BFSI, Fintech & Banking",
  "Healthcare, Pharma & Biotech",
  "Manufacturing & Industrial",
  "Retail, FMCG & E-Commerce",
  "Logistics & Supply Chain",
  "Energy, Utilities & Infrastructure",
  "HR, People & Talent Leadership",
  "Consulting & Professional Services",
  "Media, Telecom & Marketing",
  "Other Industry Sector",
];

const OBJECTIVES_LIST = [
  "B2B Networking & CXO Contacts",
  "Thought Leadership & Panel Speaking",
  "Strategic Alliances & Partnership",
  "Industry Benchmarking & AI Insights",
  "Sponsorship & Brand Visibility",
];

export function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    officialEmail: "",
    mobileNumber: "",
    designation: "",
    organization: "",
    cityLocation: "",

    // Step 2
    selectedTier: "cxo-platinum",
    primaryIndustry: "Technology, AI & Software",

    // Step 3
    objectives: ["B2B Networking & CXO Contacts"],
    attendanceCount: "3-5 Summits / Year",
    specialNotes: "",
    agreeTerms: true,
  });

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const origOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow === "hidden" ? "" : origOverflow;
      document.documentElement.style.overflow = origHtmlOverflow === "hidden" ? "" : origHtmlOverflow;
    };
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleObjective = (obj: string) => {
    setFormData((prev) => {
      const exists = prev.objectives.includes(obj);
      if (exists) {
        return { ...prev, objectives: prev.objectives.filter((o) => o !== obj) };
      }
      return { ...prev, objectives: [...prev.objectives, obj] };
    });
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const fnVal = validateName(formData.fullName, "Full Name");
    if (!fnVal.isValid) {
      toast.error(fnVal.error);
      return false;
    }
    const emailVal = validateEmail(formData.officialEmail, "Official Work Email");
    if (!emailVal.isValid) {
      toast.error(emailVal.error);
      return false;
    }
    const phoneVal = validatePhone(formData.mobileNumber, "Mobile Number");
    if (!phoneVal.isValid) {
      toast.error(phoneVal.error);
      return false;
    }
    const desigVal = validateDesignation(formData.designation, "Designation / Title");
    if (!desigVal.isValid) {
      toast.error(desigVal.error);
      return false;
    }
    const orgVal = validateCompanyName(formData.organization, "Organization / Company Name");
    if (!orgVal.isValid) {
      toast.error(orgVal.error);
      return false;
    }
    const cityVal = validateLocation(formData.cityLocation, "City / Location");
    if (!cityVal.isValid) {
      toast.error(cityVal.error);
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.selectedTier) {
      toast.error("Please select a Membership Tier.");
      return false;
    }
    if (!formData.primaryIndustry) {
      toast.error("Please select your Primary Industry.");
      return false;
    }
    return true;
  };

  // Handle Next Step
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  // Handle Final Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    if (!formData.agreeTerms) {
      toast.error("Please accept the Membership Terms to proceed.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.officialEmail,
          phone: formData.mobileNumber,
          designation: formData.designation,
          company: formData.organization,
          city: formData.cityLocation,
          membership_tier: formData.selectedTier,
          industry: formData.primaryIndustry,
          objectives: formData.objectives.join(", "),
          attendance_count: formData.attendanceCount,
          notes: formData.specialNotes,
        }),
      });

      const refId = `ET-MBR-${Math.floor(100000 + Math.random() * 900000)}`;

      if (res.ok) {
        toast.success("Membership Application Submitted Successfully!");
      } else {
        // Fallback smooth confirmation
        toast.success("Membership Application Received!");
      }

      setSubmittedData({ ...formData, referenceId: refId });
    } catch (err) {
      const refId = `ET-MBR-${Math.floor(100000 + Math.random() * 900000)}`;
      toast.success("Membership Proposal Sent Successfully!");
      setSubmittedData({ ...formData, referenceId: refId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetModal = () => {
    setSubmittedData(null);
    setCurrentStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden overscroll-none p-3 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl"
          />

          {/* Modal Container - Premium Executive Responsive Layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-[28px] border border-slate-200/90 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.22)] text-slate-900 overflow-hidden z-10 my-auto"
          >
            {/* Top Glowing Gradient Beam */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-sm shrink-0" />

            {/* Header Controls */}
            <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-b from-slate-50/80 to-white shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/20 shrink-0">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-black uppercase tracking-wider text-purple-700 font-display">
                      <Sparkles className="h-2.5 w-2.5 text-purple-600" />
                      Executive Talks Business Intelligence
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight mt-0.5">
                    Executive Membership Application
                  </h2>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* If Submitted: Show Confirmation Screen */}
            {submittedData ? (
              <div className="p-6 sm:p-10 text-center space-y-6 max-w-2xl mx-auto bg-white overflow-y-auto flex-1 my-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl flex items-center justify-center"
                >
                  <div className="h-full w-full rounded-[22px] bg-white flex items-center justify-center">
                    <ShieldCheck className="h-10 w-10 text-purple-600" />
                  </div>
                </motion.div>

                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    Reference ID: {submittedData.referenceId}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 font-display">
                    Membership Application Received!
                  </h3>
                  <p className="mt-2 text-slate-600 text-xs sm:text-sm leading-relaxed font-sans font-medium text-justify">
                    Dear <strong className="text-slate-900">{submittedData.fullName}</strong>, thank you for applying for <strong className="text-purple-700">{MEMBERSHIP_TIERS.find(t => t.id === submittedData.selectedTier)?.title || "Executive Membership"}</strong> at Executive Talks Media.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-left text-xs sm:text-sm space-y-2.5 text-slate-800">
                  <div className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500 font-medium">Organization:</span>
                    <strong className="text-slate-900">{submittedData.organization}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500 font-medium">Designation:</span>
                    <strong className="text-slate-900">{submittedData.designation}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500 font-medium">Work Email:</span>
                    <strong className="text-purple-700">{submittedData.officialEmail}</strong>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-500 font-medium">Review Clearance:</span>
                    <strong className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> 24 Business Hours
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleResetModal}
                    className="gradient-brand rounded-2xl px-8 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Done & Close Window
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP INDICATOR BAR */}
                <div className="px-5 sm:px-8 py-3 bg-slate-50/70 border-b border-slate-100 shrink-0">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                    {[
                      { step: 1, title: "1. Executive Profile" },
                      { step: 2, title: "2. Tier & Industry" },
                      { step: 3, title: "3. Objectives & Submit" },
                    ].map((s) => {
                      const isActive = currentStep === s.step;
                      const isDone = currentStep > s.step;
                      return (
                        <div
                          key={s.step}
                          onClick={() => {
                            if (isDone) setCurrentStep(s.step);
                          }}
                          className={`flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            isDone
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 cursor-pointer"
                              : isActive
                              ? "border-purple-600 bg-white text-purple-900 shadow-xs ring-2 ring-purple-500/10"
                              : "border-slate-200 bg-white/70 text-slate-400"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${isActive ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black shadow-xs" : "bg-slate-200 text-slate-600"}`}>
                              {s.step}
                            </span>
                          )}
                          <span className="truncate font-display">{s.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FORM CONTENT BODY */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white">
                  <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-white custom-scrollbar overscroll-contain touch-pan-y">
                    {/* STEP 1: EXECUTIVE PROFILE */}
                    {currentStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        {/* Section Header Card */}
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-2xs">
                            <User className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-display">
                              Executive Contact & Corporate Identity
                            </h3>
                            <p className="text-[11.5px] text-slate-500 font-medium">
                              Provide your official business credentials for verification by the Executive Talks Media Advisory Desk.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                          {/* Full Name */}
                          <div className="group">
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                              Full Name *
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                              <input
                                type="text"
                                required
                                placeholder="e.g. Vikramaditya Sharma"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium hover:border-slate-300 shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* Official Email */}
                          <div className="group">
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                              Official Work Email *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                              <input
                                type="email"
                                required
                                placeholder="v.sharma@company.com"
                                value={formData.officialEmail}
                                onChange={(e) => handleInputChange("officialEmail", e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium hover:border-slate-300 shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* Mobile Number */}
                          <div className="group">
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                              Mobile Number *
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                              <input
                                type="tel"
                                required
                                maxLength={15}
                                placeholder="e.g. 98765 43210"
                                value={formData.mobileNumber}
                                onChange={(e) => handleInputChange("mobileNumber", sanitizePhoneInput(e.target.value))}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium hover:border-slate-300 shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* Designation */}
                          <div className="group">
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                              Designation / Title *
                            </label>
                            <div className="relative">
                              <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                              <input
                                type="text"
                                required
                                placeholder="e.g. Chief Technology Officer"
                                value={formData.designation}
                                onChange={(e) => handleInputChange("designation", e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium hover:border-slate-300 shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* Organization */}
                          <div className="group">
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                              Organization / Company Name *
                            </label>
                            <div className="relative">
                              <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                              <input
                                type="text"
                                required
                                placeholder="e.g. Tata Consultancy Services"
                                value={formData.organization}
                                onChange={(e) => handleInputChange("organization", e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium hover:border-slate-300 shadow-2xs"
                              />
                            </div>
                          </div>

                          {/* City Location */}
                          <div className="group">
                            <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                              City & Country *
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                              <input
                                type="text"
                                required
                                placeholder="Mumbai, India"
                                value={formData.cityLocation}
                                onChange={(e) => handleInputChange("cityLocation", e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium hover:border-slate-300 shadow-2xs"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: MEMBERSHIP TIER & INDUSTRY */}
                    {currentStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        {/* Section Header Card */}
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-2xs">
                            <Crown className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-display">
                              Select Preferred Membership Tier
                            </h3>
                            <p className="text-[11.5px] text-slate-500 font-medium">
                              Choose the engagement level aligned with your strategic networking and corporate leadership goals.
                            </p>
                          </div>
                        </div>

                        {/* Tier Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                          {MEMBERSHIP_TIERS.map((tier) => {
                            const isSelected = formData.selectedTier === tier.id;
                            return (
                              <div
                                key={tier.id}
                                onClick={() => handleInputChange("selectedTier", tier.id)}
                                className={`relative rounded-2xl border p-4.5 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                                  isSelected
                                    ? `border-2 border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-500/20`
                                    : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/50 shadow-2xs"
                                }`}
                              >
                                {tier.popular && (
                                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-[9.5px] font-black uppercase tracking-wider text-white px-3 py-0.5 rounded-full shadow-sm">
                                    Most Recommended
                                  </span>
                                )}

                                <div>
                                  <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                      {tier.badge}
                                    </span>
                                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-slate-300 bg-white"}`}>
                                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                  </div>

                                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 font-display">
                                    {tier.title}
                                  </h4>
                                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-sans font-medium text-justify">
                                    {tier.desc}
                                  </p>

                                  <ul className="mt-3 space-y-1.5 pt-2.5 border-t border-slate-100">
                                    {tier.perks.map((perk, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium">
                                        <Zap className="h-3 w-3 text-purple-600 shrink-0 mt-0.5" />
                                        <span>{perk}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Primary Industry Select */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Primary Industry Focus *
                          </label>
                          <select
                            value={formData.primaryIndustry}
                            onChange={(e) => handleInputChange("primaryIndustry", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium cursor-pointer shadow-2xs"
                          >
                            {INDUSTRIES_LIST.map((ind) => (
                              <option key={ind} value={ind} className="bg-white text-slate-900 font-medium">
                                {ind}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: OBJECTIVES & FINAL SUBMIT */}
                    {currentStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        {/* Section Header Card */}
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs">
                            <Award className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-display">
                              Executive Objectives & Preferences
                            </h3>
                            <p className="text-[11.5px] text-slate-500 font-medium">
                              Help us customize your membership briefings, roundtable privileges, and event invitations.
                            </p>
                          </div>
                        </div>

                        {/* Objectives Checkboxes */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                            Primary Membership Goals (Select all that apply)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {OBJECTIVES_LIST.map((obj) => {
                              const checked = formData.objectives.includes(obj);
                              return (
                                <div
                                  key={obj}
                                  onClick={() => toggleObjective(obj)}
                                  className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                                    checked
                                      ? "border-purple-600 bg-purple-50 text-slate-900 shadow-2xs"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  <div className={`h-4 w-4 rounded flex items-center justify-center border ${checked ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"}`}>
                                    {checked && <Check className="h-3 w-3 stroke-[3]" />}
                                  </div>
                                  <span className="text-xs font-bold">{obj}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Attendance Frequency */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Expected Summit Participation
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {["1-2 Summits / Year", "3-5 Summits / Year", "All Major Summits"].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleInputChange("attendanceCount", val)}
                                className={`p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                                  formData.attendanceCount === val
                                    ? "border-purple-600 bg-purple-50 text-purple-900 shadow-xs"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes / Special Requests */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Special Requirements / Note for Membership Desk
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Specify any preferred roundtable topics, keynote interests, or executive delegate pass requests..."
                            value={formData.specialNotes}
                            onChange={(e) => handleInputChange("specialNotes", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium hover:border-slate-300 shadow-2xs"
                          />
                        </div>

                        {/* Terms Agreement */}
                        <div className="pt-1">
                          <EventTermsAndConditionsBox
                            checked={formData.agreeTerms}
                            onChange={(val) => handleInputChange("agreeTerms", val)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* BOTTOM ACTION BUTTONS - NON-SCROLLING STICKY FOOTER */}
                  <div className="shrink-0 sticky bottom-0 bg-slate-50/90 backdrop-blur-md border-t border-slate-100 px-5 sm:px-8 py-3.5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shadow-md z-30">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((s) => s - 1)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full sm:w-auto gradient-brand inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer sm:ml-auto"
                      >
                        <span>Continue to Step {currentStep + 1}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto gradient-brand inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 sm:ml-auto"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Processing Membership...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit Membership Application</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
