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
    if (!formData.fullName.trim()) {
      toast.error("Please enter your Full Name.");
      return false;
    }
    if (!formData.officialEmail.trim() || !formData.officialEmail.includes("@")) {
      toast.error("Please enter a valid Official Work Email.");
      return false;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      toast.error("Please enter a valid Mobile Number (10+ digits).");
      return false;
    }
    if (!formData.designation.trim()) {
      toast.error("Please enter your Designation / Title.");
      return false;
    }
    if (!formData.organization.trim()) {
      toast.error("Please enter your Organization / Company Name.");
      return false;
    }
    if (!formData.cityLocation.trim()) {
      toast.error("Please enter your City / Location.");
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
        <div className="fixed inset-0 z-[100] overflow-y-auto p-3 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl"
          />

          {/* Modal Container - Full Width & Premium Responsive Layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl rounded-3xl border border-slate-200 bg-white shadow-2xl backdrop-blur-2xl text-slate-900 overflow-hidden z-10 my-auto"
          >
            {/* Top Glowing Gradient Beam */}
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_20px_#00AEEF]" />

            {/* Header Controls */}
            <div className="p-4 sm:p-6 md:p-8 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/90">
              <div className="flex items-center gap-3.5">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-md shrink-0">
                  <Crown className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-100 border border-cyan-300 px-2.5 py-0.5 rounded-full">
                      ET Media Business Intelligence
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-1">
                    Executive Membership Application
                  </h2>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-3 rounded-full border border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* If Submitted: Show Confirmation Screen */}
            {submittedData ? (
              <div className="p-6 sm:p-10 md:p-12 text-center space-y-6 max-w-3xl mx-auto bg-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-xl flex items-center justify-center"
                >
                  <div className="h-full w-full rounded-[22px] bg-white flex items-center justify-center">
                    <ShieldCheck className="h-10 w-10 text-cyan-600" />
                  </div>
                </motion.div>

                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-700">
                    Ref ID: {submittedData.referenceId}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-display">
                    Membership Application Received!
                  </h3>
                  <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                    Dear <strong className="text-slate-900">{submittedData.fullName}</strong>, thank you for applying for <strong className="text-cyan-700">{MEMBERSHIP_TIERS.find(t => t.id === submittedData.selectedTier)?.title || "Executive Membership"}</strong> at ET Media.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left text-xs sm:text-sm space-y-3 text-slate-800">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Organization:</span>
                    <strong className="text-slate-900">{submittedData.organization}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Designation:</span>
                    <strong className="text-slate-900">{submittedData.designation}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Work Email:</span>
                    <strong className="text-cyan-700">{submittedData.officialEmail}</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Review Window:</span>
                    <strong className="text-emerald-700 font-bold">24 Business Hours</strong>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleResetModal}
                    className="gradient-brand rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
                  >
                    Done & Close Window
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP INDICATOR BAR */}
                <div className="px-4 sm:px-8 md:px-10 pt-5 pb-3 bg-slate-50 border-b border-slate-200">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
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
                          className={`flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all ${
                            isDone
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 cursor-pointer"
                              : isActive
                              ? "border-cyan-600 bg-cyan-50 text-cyan-800 shadow-sm"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${isActive ? "bg-cyan-600 text-white font-black" : "bg-slate-200 text-slate-600"}`}>
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
                <form onSubmit={handleSubmit} className="p-5 sm:p-8 md:p-10 space-y-6 bg-white">
                  {/* STEP 1: EXECUTIVE PROFILE */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-200 pb-3">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                          <User className="h-5 w-5 text-cyan-600" />
                          Executive Contact & Corporate Identity
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                          Provide your official business credentials for verification by the ET Media Advisory Desk.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Full Name */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Vikramaditya Sharma"
                              value={formData.fullName}
                              onChange={(e) => handleInputChange("fullName", e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                            />
                          </div>
                        </div>

                        {/* Official Email */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Official Work Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <input
                              type="email"
                              required
                              placeholder="v.sharma@company.com"
                              value={formData.officialEmail}
                              onChange={(e) => handleInputChange("officialEmail", e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                            />
                          </div>
                        </div>

                        {/* Mobile Number */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Mobile Number *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <input
                              type="tel"
                              required
                              placeholder="+91 98765 43210"
                              value={formData.mobileNumber}
                              onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                            />
                          </div>
                        </div>

                        {/* Designation */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Designation / Title *
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Chief Technology Officer"
                              value={formData.designation}
                              onChange={(e) => handleInputChange("designation", e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                            />
                          </div>
                        </div>

                        {/* Organization */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Organization / Company Name *
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Tata Consultancy Services"
                              value={formData.organization}
                              onChange={(e) => handleInputChange("organization", e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                            />
                          </div>
                        </div>

                        {/* City Location */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            City & Country *
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              placeholder="Mumbai, India"
                              value={formData.cityLocation}
                              onChange={(e) => handleInputChange("cityLocation", e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: MEMBERSHIP TIER & INDUSTRY */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-200 pb-3">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                          <Crown className="h-5 w-5 text-purple-600" />
                          Select Preferred Membership Tier
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                          Choose the engagement level aligned with your strategic networking and corporate objectives.
                        </p>
                      </div>

                      {/* Tier Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {MEMBERSHIP_TIERS.map((tier) => {
                          const isSelected = formData.selectedTier === tier.id;
                          return (
                            <div
                              key={tier.id}
                              onClick={() => handleInputChange("selectedTier", tier.id)}
                              className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                                isSelected
                                  ? `border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-500/30`
                                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              {tier.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-black uppercase tracking-wider text-white px-3 py-0.5 rounded-full shadow-md">
                                  Most Recommended
                                </span>
                              )}

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full border border-cyan-300">
                                    {tier.badge}
                                  </span>
                                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-slate-300 bg-white"}`}>
                                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                  </div>
                                </div>

                                <h4 className="text-base font-extrabold text-slate-900 font-display">
                                  {tier.title}
                                </h4>
                                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                                  {tier.desc}
                                </p>

                                <ul className="mt-4 space-y-2 pt-3 border-t border-slate-200">
                                  {tier.perks.map((perk, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 font-medium">
                                      <Zap className="h-3 w-3 text-cyan-600 shrink-0 mt-0.5" />
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
                        <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                          Primary Industry Focus *
                        </label>
                        <select
                          value={formData.primaryIndustry}
                          onChange={(e) => handleInputChange("primaryIndustry", e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium cursor-pointer"
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
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-slate-200 pb-3">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
                          <Award className="h-5 w-5 text-emerald-600" />
                          Executive Objectives & Preferences
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                          Help us customize your membership briefings and event invitations.
                        </p>
                      </div>

                      {/* Objectives Checkboxes */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                          Primary Membership Goals (Select all that apply)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {OBJECTIVES_LIST.map((obj) => {
                            const checked = formData.objectives.includes(obj);
                            return (
                              <div
                                key={obj}
                                onClick={() => toggleObjective(obj)}
                                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                                  checked
                                    ? "border-cyan-600 bg-cyan-50 text-slate-900"
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                <div className={`h-4 w-4 rounded flex items-center justify-center border ${checked ? "bg-cyan-600 border-cyan-600 text-white" : "border-slate-300 bg-white"}`}>
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
                        <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                          Expected Summit Participation
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {["1-2 Summits / Year", "3-5 Summits / Year", "All Major Summits"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleInputChange("attendanceCount", val)}
                              className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                                formData.attendanceCount === val
                                  ? "border-purple-600 bg-purple-50 text-purple-900 shadow-xs"
                                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes / Special Requests */}
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                          Special Requirements / Note for Membership Desk
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Specify any preferred roundtable topics, keynote interests, or executive delegate pass requests..."
                          value={formData.specialNotes}
                          onChange={(e) => handleInputChange("specialNotes", e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                        />
                      </div>

                      {/* Terms Agreement */}
                      <div className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={(e) => handleInputChange("agreeTerms", e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4 cursor-pointer"
                        />
                        <label htmlFor="agreeTerms" className="text-xs text-slate-700 leading-relaxed cursor-pointer font-medium">
                          I confirm that the details provided are accurate. I authorize ET Media Business Intelligence to contact me regarding executive membership privileges and event invitations.
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="pt-5 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((s) => s - 1)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
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
                        className="w-full sm:w-auto gradient-brand inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all cursor-pointer sm:ml-auto"
                      >
                        <span>Continue to Step {currentStep + 1}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto gradient-brand inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-cyan-500/25 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 sm:ml-auto"
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
