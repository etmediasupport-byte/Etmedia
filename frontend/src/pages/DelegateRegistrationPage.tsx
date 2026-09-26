import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 shadow-2xl text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-cyan-400">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                EXECUTIVE MEMBERSHIP & DELEGATE PASS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                Apply for Executive Delegate Membership
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
                Experience our step-by-step full page registration wizard for executive membership council accreditation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/membership/apply")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-cyan-500 px-8 py-4 text-xs font-black text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 shrink-0"
            >
              <span>Start Application Wizard</span>
              <UserCheck className="h-4 w-4" />
            </button>
          </div>
        </Reveal>
      </section>

      {/* Replaced with multi-step wizard /membership/apply */}




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
