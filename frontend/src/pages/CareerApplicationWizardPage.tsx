import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  UploadCloud,
  Loader2,
  ShieldCheck,
  Building,
  Globe,
  Star,
  Check,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/site/SEOHead";
import {
  validateEmail,
  validatePhone,
  sanitizePhoneInput,
  validateName,
  validateRequiredText,
  validateUrl,
} from "@/lib/validation";

export default function CareerApplicationWizardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const jobId = searchParams.get("jobId") || "JOB-101";
  const rawTitle = searchParams.get("title") || "Senior Event Operations Lead";
  const jobTitle = decodeURIComponent(rawTitle);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    experience: "3-5 Years",
    designation: "",
    company: "",
    portfolio_url: "",
    coverNote: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [uploadingResume, setUploadingResume] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Phone input handler with 10-digit sanitizer
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizePhoneInput(e.target.value);
    setFormData((prev) => ({ ...prev, phone: clean }));
    if (touchedFields["phone"]) {
      const v = validatePhone(clean, "Mobile Number");
      setFieldErrors((prev) => ({ ...prev, phone: v.isValid ? "" : v.error }));
    }
  };

  // Blur handler for real-time validation
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    let error = "";

    if (fieldName === "name") {
      const v = validateName(formData.name, "Full Name");
      if (!v.isValid) error = v.error;
    } else if (fieldName === "email") {
      const v = validateEmail(formData.email, "Email Address");
      if (!v.isValid) error = v.error;
    } else if (fieldName === "phone") {
      const v = validatePhone(formData.phone, "Mobile Number");
      if (!v.isValid) error = v.error;
    } else if (fieldName === "city") {
      const v = validateRequiredText(formData.city, "Current City");
      if (!v.isValid) error = v.error;
    } else if (fieldName === "portfolio_url" && formData.portfolio_url.trim()) {
      const v = validateUrl(formData.portfolio_url, "Portfolio / LinkedIn URL");
      if (!v.isValid) error = v.error;
    }

    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // Resume Upload Handler
  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF document (.pdf).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume file size must not exceed 10 MB.");
      return;
    }

    setResumeFile(file);
    setUploadingResume(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: arrayBuffer,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setResumeUrl(data.url);
        toast.success("Resume PDF attached successfully!");
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next["resume"];
          return next;
        });
      } else {
        toast.error(data.message || "Failed to process resume file.");
        setFieldErrors((prev) => ({ ...prev, resume: "Failed to upload resume file." }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Network error uploading resume file.");
      setFieldErrors((prev) => ({ ...prev, resume: "Network error uploading file." }));
    } finally {
      setUploadingResume(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    const nameVal = validateName(formData.name, "Full Name");
    if (!nameVal.isValid) errors.name = nameVal.error;

    const emailVal = validateEmail(formData.email, "Email Address");
    if (!emailVal.isValid) errors.email = emailVal.error;

    const phoneVal = validatePhone(formData.phone, "Mobile Number");
    if (!phoneVal.isValid) errors.phone = phoneVal.error;

    const cityVal = validateRequiredText(formData.city, "Current City");
    if (!cityVal.isValid) errors.city = cityVal.error;

    if (formData.portfolio_url.trim()) {
      const portVal = validateUrl(formData.portfolio_url, "Portfolio / LinkedIn URL");
      if (!portVal.isValid) errors.portfolio_url = portVal.error;
    }

    if (!resumeUrl && !resumeFile) {
      errors.resume = "Please attach your Resume PDF document.";
    }

    setFieldErrors(errors);
    setTouchedFields({
      name: true,
      email: true,
      phone: true,
      city: true,
      portfolio_url: true,
      resume: true,
    });

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          job_title: jobTitle,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          experience: formData.experience,
          designation: formData.designation.trim() || undefined,
          company: formData.company.trim() || undefined,
          portfolio_url: formData.portfolio_url.trim() || undefined,
          resume_url: resumeUrl || `data:application/pdf;name=${encodeURIComponent(resumeFile?.name || "resume.pdf")}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        setSuccessMessage(data.message || `Your application for "${jobTitle}" has been received by Executive Talks Media HR.`);
        toast.success("Job Application Submitted Successfully!");
      } else {
        toast.error(data.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Application Submit Error:", err);
      toast.error("Network error. Could not connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-100/70 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xl text-center space-y-6"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-700 tracking-wider uppercase">
                Application Received
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                Application Submitted Successfully!
              </h1>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                {successMessage}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 max-w-md mx-auto text-left text-xs space-y-1.5 font-semibold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Position Applied:</span>
                <span className="text-slate-900 font-bold">{jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate Name:</span>
                <span className="text-slate-900 font-bold">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Email:</span>
                <span className="text-slate-900 font-bold">{formData.email}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/careers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-3.5 text-xs font-extrabold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Explore Other Openings</span>
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-8 py-3.5 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <span>Return to Homepage</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      <SEOHead
        title={`Apply for ${jobTitle} | Executive Talks Media Careers`}
        description={`Submit your resume for the ${jobTitle} position at Executive Talks Media Business Intelligence.`}
        keywords={`${jobTitle}, Executive Talks Media Careers, Job Application, Hyderabad Jobs`}
        url="https://www.executivetalksmedia.in/careers/apply"
      />
      {/* ================= HERO BANNER ================= */}
      <div className="relative bg-slate-950 text-white pt-28 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-slate-950/80 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  Careers & Talent Acquisition
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">Job ID: {jobId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
                Apply for {jobTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Hyderabad, India (Hybrid / Onsite)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Full-Time Role</span>
                </div>
              </div>
            </div>

            <Link
              to="/careers"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-xs font-extrabold text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all self-start md:self-auto cursor-pointer shadow-lg shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Open Positions</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Role Overview & Company Perks */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block">
                  POSITION DETAILS
                </span>
                <h3 className="text-base sm:text-lg font-black font-display text-slate-900 leading-tight mt-1">
                  {jobTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Join Executive Talks Media to drive national leadership summits, C-suite conclaves & executive intelligence.
                </p>
              </div>

              {/* Role Meta List */}
              <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Department: Events & Business Media</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Location: Manjeera Trinity, Hyderabad</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Platform: Executive Talks Media</span>
                </div>
              </div>

              {/* Why Join Us */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Why Build Your Career With Us:
                </span>
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Direct Access to India's Top CXO Leadership</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>High Growth Trajectory & Performance Bonuses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Dynamic, Collaborative & High-Energy Workplace</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Comprehensive Health Insurance & Perks</span>
                  </li>
                </ul>
              </div>

              {/* Security Badge */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>256-Bit SSL Encrypted & Confidential Portal</span>
              </div>

              {/* Support Contact */}
              <div className="rounded-2xl bg-slate-50 p-3.5 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Recruitment Desk</div>
                <div>Call: <a href="tel:+919100266777" className="text-purple-700 font-bold hover:underline">+91 91002 66777</a></div>
                <div>Email: <a href="mailto:careers@executivetalksmedia.in" className="text-purple-700 font-bold hover:underline">careers@executivetalksmedia.in</a></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Comprehensive Application Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8"
            >
              <div>
                <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  <span>Candidate Application Profile</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                  Submit Your Application
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please provide your contact information, experience details, and attach your resume PDF below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. PERSONAL INFORMATION */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span>Personal Details</span>
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Full Name <span className="text-rose-500">*</span></span>
                        {touchedFields.name && !fieldErrors.name && formData.name.trim().length >= 2 && (
                          <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur("name")}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                          touchedFields.name && fieldErrors.name
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : touchedFields.name && !fieldErrors.name && formData.name.trim().length >= 2
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 bg-slate-50/70 focus:border-purple-500 focus:ring-purple-500/10"
                        }`}
                      />
                      {touchedFields.name && fieldErrors.name && (
                        <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                          ⚠️ {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Email Address <span className="text-rose-500">*</span></span>
                        {touchedFields.email && !fieldErrors.email && formData.email && (
                          <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid email</span>
                        )}
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur("email")}
                        placeholder="rahul.sharma@example.com"
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                          touchedFields.email && fieldErrors.email
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : touchedFields.email && !fieldErrors.email && formData.email
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 bg-slate-50/70 focus:border-purple-500 focus:ring-purple-500/10"
                        }`}
                      />
                      {touchedFields.email && fieldErrors.email && (
                        <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                          ⚠️ {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Contact / Mobile Number <span className="text-rose-500">*</span></span>
                        {touchedFields.phone && !fieldErrors.phone && formData.phone && (
                          <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid phone</span>
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
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                          touchedFields.phone && fieldErrors.phone
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : touchedFields.phone && !fieldErrors.phone && formData.phone
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 bg-slate-50/70 focus:border-purple-500 focus:ring-purple-500/10"
                        }`}
                      />
                      {touchedFields.phone && fieldErrors.phone && (
                        <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                          ⚠️ {fieldErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Current City <span className="text-rose-500">*</span></span>
                        {touchedFields.city && !fieldErrors.city && formData.city.trim().length >= 2 && (
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
                        placeholder="e.g. Hyderabad / Bangalore"
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                          touchedFields.city && fieldErrors.city
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : touchedFields.city && !fieldErrors.city && formData.city.trim().length >= 2
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 bg-slate-50/70 focus:border-purple-500 focus:ring-purple-500/10"
                        }`}
                      />
                      {touchedFields.city && fieldErrors.city && (
                        <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                          ⚠️ {fieldErrors.city}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. PROFESSIONAL EXPERIENCE */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <span>Professional Background</span>
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Total Experience <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all"
                      >
                        <option value="0-1 Year (Fresh Graduate / Junior)">0-1 Year (Fresh Graduate / Junior)</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-8 Years (Senior)">5-8 Years (Senior)</option>
                        <option value="8+ Years (Lead / Executive)">8+ Years (Lead / Executive)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Portfolio / LinkedIn URL <span className="text-slate-400 font-normal">(Optional)</span></span>
                        {touchedFields.portfolio_url && !fieldErrors.portfolio_url && formData.portfolio_url && (
                          <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid URL</span>
                        )}
                      </label>
                      <input
                        type="url"
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur("portfolio_url")}
                        placeholder="https://linkedin.com/in/profile"
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                          touchedFields.portfolio_url && fieldErrors.portfolio_url
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : touchedFields.portfolio_url && !fieldErrors.portfolio_url && formData.portfolio_url
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 bg-slate-50/70 focus:border-purple-500 focus:ring-purple-500/10"
                        }`}
                      />
                      {touchedFields.portfolio_url && fieldErrors.portfolio_url && (
                        <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                          ⚠️ {fieldErrors.portfolio_url}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. RESUME UPLOAD */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Resume / CV Attachment <span className="text-rose-500">*</span></span>
                  </h3>

                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-purple-500 transition-all bg-slate-50/50 text-center">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          {uploadingResume ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <UploadCloud className="w-6 h-6" />
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          {resumeFile ? (
                            <span className="text-purple-700 font-black">Selected: {resumeFile.name}</span>
                          ) : (
                            <span>Click or drag and drop to upload your Resume (PDF format, max 10MB)</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">Supported format: PDF only</p>
                      </div>
                    </div>

                    {resumeUrl && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Resume attached and ready for HR review.</span>
                      </div>
                    )}

                    {fieldErrors.resume && (
                      <p className="text-[11px] font-bold text-rose-500 animate-in fade-in">
                        ⚠️ {fieldErrors.resume}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Application Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                  <Link
                    to="/careers"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-extrabold text-xs transition-all text-center cursor-pointer"
                  >
                    Cancel / View All Roles
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || uploadingResume}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Job Application</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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
