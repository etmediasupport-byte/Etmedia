import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { images } from "@/lib/site-data";
import {
  User,
  Building2,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Briefcase,
  UserCheck,
  Building,
  FileText,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function DelegateRegistrationPage() {
  const [formData, setFormData] = useState({
    // 1. Delegate Details
    fullName: "",
    designation: "",
    organization: "",
    officialEmail: "",
    mobileNumber: "",
    city: "",

    // 2. Awards Nomination
    awardsNomination: "No" as "Yes" | "No",

    // 3. Organisation Details
    companyName: "",
    website: "",
    industry: "Technology & IT",
    location: "",
    gstNumber: "",

    // 4. Contact Person Details
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);
  const [mobileError, setMobileError] = useState("");

  const validateMobile = (phone: string) => {
    const cleaned = phone.trim();
    const digits = cleaned.replace(/\D/g, "");
    if (!cleaned) return "Mobile number is required.";
    if (digits.length < 10) return "Please enter a valid 10-digit mobile number (e.g. +91 98765 43210).";
    if (digits.length > 15) return "Mobile number cannot exceed 15 digits.";
    return "";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required fields verification
    if (!formData.fullName.trim()) {
      toast.error("Please enter Delegate Full Name.");
      return;
    }
    if (!formData.designation.trim()) {
      toast.error("Please enter Delegate Designation.");
      return;
    }
    if (!formData.organization.trim()) {
      toast.error("Please enter Organisation / Company.");
      return;
    }
    if (!formData.officialEmail.trim()) {
      toast.error("Please enter Official Work Email.");
      return;
    }
    const mErr = validateMobile(formData.mobileNumber);
    if (mErr) {
      setMobileTouched(true);
      setMobileError(mErr);
      toast.error(mErr);
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter Delegate City.");
      return;
    }
    if (!formData.companyName.trim()) {
      toast.error("Please enter Organisation Company Name.");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Please enter Organisation Location.");
      return;
    }
    if (!formData.contactPersonName.trim() || !formData.contactPersonEmail.trim()) {
      toast.error("Please enter Contact Person Name and Email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/delegate-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedData(formData);
        setSuccessModalOpen(true);
        toast.success("Delegate Registration Submitted Successfully!");
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Delegate Registration Error:", err);
      toast.error("Could not connect to backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 pb-24 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      <GlowBackdrop />

      <PageHero
        crumb="Executive Registration"
        title="Delegate Registration"
        subtitle="Reserve your seat at India's premier CXO leadership platform, executive conclaves & corporate awards."
        image={images.heroLeadership}
      />

      <section className="container-x relative mt-10 sm:mt-14 max-w-4xl">
        <Reveal>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-2xl text-slate-900">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-cyan-700">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-600" />
                  Corporate Executive Pass
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2 tracking-tight">
                  Delegate Registration Form
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Complete your corporate details below. All entries are CMS managed and verified by our executive committee.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end shrink-0">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <ShieldCheck className="h-5 w-5 text-cyan-600" />
                  ET Media Verified
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">CMS Synchronized</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECTION 1: DELEGATE DETAILS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                  <User className="h-4 w-4 text-cyan-600" />
                  <span>1. Delegate Details</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rajesh Kumar Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Chief Information Security Officer / VP"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Organisation / Company */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Organisation / Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Vantage Enterprise Solutions"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Official Email */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.officialEmail}
                      onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                      placeholder="rajesh@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Mobile Number *</span>
                      {mobileTouched && !mobileError && formData.mobileNumber && (
                        <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                          ✓ Valid mobile number
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.mobileNumber}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/[^\d\+\-\s\(\)]/g, "");
                        setFormData({ ...formData, mobileNumber: cleanVal });
                        if (mobileTouched) setMobileError(validateMobile(cleanVal));
                      }}
                      onBlur={() => {
                        setMobileTouched(true);
                        setMobileError(validateMobile(formData.mobileNumber));
                      }}
                      placeholder="+91 98765 43210"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-medium ${
                        mobileTouched && mobileError
                          ? "border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                          : mobileTouched && !mobileError && formData.mobileNumber
                          ? "border-emerald-500 bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          : "border-slate-200 bg-slate-50 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                      }`}
                    />
                    {mobileTouched && mobileError && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in">
                        <span>⚠️</span> {mobileError}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: AWARDS NOMINATION */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span>2. Awards Nomination</span>
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Are you interested in nominating your organisation or executive leader for Excellence Awards? *
                  </label>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="awardsNomination"
                        value="Yes"
                        checked={formData.awardsNomination === "Yes"}
                        onChange={() => setFormData({ ...formData, awardsNomination: "Yes" })}
                        className="h-4 w-4 text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-slate-900">Yes</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="awardsNomination"
                        value="No"
                        checked={formData.awardsNomination === "No"}
                        onChange={() => setFormData({ ...formData, awardsNomination: "No" })}
                        className="h-4 w-4 text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-slate-900">No</span>
                    </label>
                  </div>

                  {/* DYNAMIC DISPLAY IF YES IS SELECTED */}
                  {formData.awardsNomination === "Yes" && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-100 p-4 text-purple-900 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Info className="h-5 w-5 text-purple-700 shrink-0" />
                      <p className="text-xs font-bold leading-relaxed">
                        Our team will contact you shortly to explain the nomination process.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: ORGANISATION DETAILS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                  <Building2 className="h-4 w-4 text-cyan-600" />
                  <span>3. Organisation Details</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Company Name */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Vantage Enterprise Corp"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.company.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Industry *
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium cursor-pointer"
                    >
                      {industryOptions.map((ind) => (
                        <option key={ind} value={ind} className="bg-white text-slate-900">{ind}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Lower Parel, Mumbai"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* GST Number (Optional) */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      GST Number <span className="text-slate-500 font-normal">(Optional for GST Invoice)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      placeholder="e.g. 27AAACV1234F1Z5"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: CONTACT PERSON */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>4. Contact Person</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPersonName}
                      onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPersonDesignation}
                      onChange={(e) => setFormData({ ...formData, contactPersonDesignation: e.target.value })}
                      placeholder="e.g. Executive Assistant / HR Lead"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contactPersonEmail}
                      onChange={(e) => setFormData({ ...formData, contactPersonEmail: e.target.value })}
                      placeholder="priya@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contactPersonPhone}
                      onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl py-4 px-6 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-300 cursor-pointer font-btn"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                      <span>Submitting Delegate Registration...</span>
                    </>
                  ) : (
                    <>
                      <Award className="h-5 w-5 text-white" />
                      <span>Submit Delegate Registration</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </Reveal>
      </section>

      {/* SUCCESS CONFIRMATION MODAL */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(34,197,94,0.3)] bg-slate-900 border border-slate-800 text-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4 shadow-inner border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 animate-bounce text-emerald-400" />
            </div>

            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Delegate Entry Received
            </span>

            <h3 className="mt-2 text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Thank You, {submittedData?.fullName}!
            </h3>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Your delegate registration for <strong>{submittedData?.organization}</strong> has been successfully received by our admin team.
            </p>

            {submittedData?.awardsNomination === "Yes" && (
              <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-950/40 p-3.5 text-xs text-purple-200 text-left font-medium">
                <span className="font-bold text-purple-300 block mb-0.5">🏆 Awards Nomination Noted</span>
                Our team will contact you shortly to explain the nomination process.
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSuccessModalOpen(false);
                setFormData({
                  fullName: "",
                  designation: "",
                  organization: "",
                  officialEmail: "",
                  mobileNumber: "",
                  city: "",
                  awardsNomination: "No",
                  companyName: "",
                  website: "",
                  industry: "Technology & IT",
                  location: "",
                  gstNumber: "",
                  contactPersonName: "",
                  contactPersonDesignation: "",
                  contactPersonEmail: "",
                  contactPersonPhone: "",
                });
              }}
              className="mt-6 w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Done & Submit Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
