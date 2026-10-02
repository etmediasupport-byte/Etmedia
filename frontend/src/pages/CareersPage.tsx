import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Upload,
  Send,
  X,
  ChevronRight,
  ShieldCheck,
  Building,
  User,
  Users,
  Mail,
  Phone,
  Globe,
  FileText,
  Zap,
  Trophy,
  UserCheck,
  TrendingUp,
  Heart,
  ArrowRight,
  Award,
  Sliders,
  Check,
} from "lucide-react";
import { GlowBackdrop } from "@/components/site/primitives";
import { PageHero } from "@/components/site/PageHero";
import { SEOHead } from "@/components/site/SEOHead";
import { socket } from "@/lib/socket";
import {
  validateEmail,
  validatePhone,
  sanitizePhoneInput,
  validateName,
  validateRequiredText,
  validateUrl,
} from "@/lib/validation";
import { JobItem, getDefaultJobs, images } from "@/lib/site-data";

const departmentsList = [
  "All",
  "Conference Production",
  "Sales & Sponsorship",
  "Event Operations",
  "Marketing & Digital",
  "Content & Editorial",
];

const getDepartmentIcon = (department: string) => {
  const d = department.toLowerCase();
  if (d.includes("sales") || d.includes("sponsorship")) return Sparkles;
  if (d.includes("conference") || d.includes("production")) return Users;
  if (d.includes("event") || d.includes("operations")) return Sliders;
  if (d.includes("marketing") || d.includes("digital")) return TrendingUp;
  if (d.includes("content") || d.includes("editorial")) return FileText;
  return Briefcase;
};

export default function CareersPage() {
  const navigate = useNavigate();
  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected Job for Detail Modal
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobItem | null>(null);
  
  // Apply Form Modal State
  const [applyJob, setApplyJob] = useState<JobItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [applicantForm, setApplicantForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    resume_url: "",
    portfolio_url: "",
  });

  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchJobs();

    const handleJobUpdate = () => {
      fetchJobs();
    };

    socket.on("job_updated", handleJobUpdate);
    return () => {
      socket.off("job_updated", handleJobUpdate);
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobsList(data.jobs);
          return;
        }
      }
    } catch (e) {
      console.warn("Using default jobs fallback data:", e);
    }
    setJobsList(getDefaultJobs());
  };

  const parseList = (input?: string | string[]): string[] => {
    if (Array.isArray(input)) return input;
    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return input.split("\n").filter((s) => s.trim().length > 0);
      }
    }
    return [];
  };

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setFormError("Please upload a valid PDF document for your resume.");
      return;
    }

    setUploadingResume(true);
    setFormError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result;
        const res = await fetch("/api/upload-resume", {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: arrayBuffer,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setApplicantForm((prev) => ({ ...prev, resume_url: data.url }));
        } else {
          setFormError(data.message || "Failed to upload resume PDF.");
        }
        setUploadingResume(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setFormError("Network error uploading resume.");
      setUploadingResume(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fnVal = validateName(applicantForm.name, "Full Name");
    if (!fnVal.isValid) {
      setFormError(fnVal.error);
      return;
    }

    const emailVal = validateEmail(applicantForm.email, "Email Address");
    if (!emailVal.isValid) {
      setFormError(emailVal.error);
      return;
    }

    const phoneVal = validatePhone(applicantForm.phone, "Phone Number");
    if (!phoneVal.isValid) {
      setFormError(phoneVal.error);
      return;
    }

    const expVal = validateRequiredText(applicantForm.experience, "Years of Experience", 1);
    if (!expVal.isValid) {
      setFormError(expVal.error);
      return;
    }

    if (!applicantForm.resume_url.trim()) {
      setFormError("Please upload your resume PDF document before submitting.");
      return;
    }

    if (applicantForm.portfolio_url && applicantForm.portfolio_url.trim()) {
      const urlVal = validateUrl(applicantForm.portfolio_url, "Portfolio URL");
      if (!urlVal.isValid) {
        setFormError(urlVal.error);
        return;
      }
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: applyJob?.id || "GENERAL",
          job_title: applyJob?.title || "General Application",
          ...applicantForm,
          phone: phoneVal.cleanDigits || applicantForm.phone,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowSuccessModal(true);
        setApplicantForm({
          name: "",
          email: "",
          phone: "",
          experience: "",
          resume_url: "",
          portfolio_url: "",
        });
      } else {
        setFormError(result.message || "Failed to submit application.");
      }
    } catch (err) {
      setFormError("Network error submitting application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobsList.filter((job) => {
    const matchesDept =
      selectedDepartment === "All" ||
      job.department.toLowerCase().includes(selectedDepartment.toLowerCase());
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const scrollToPositions = () => {
    const el = document.getElementById("open-positions");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-purple-500/20 selection:text-purple-900 font-sans overflow-x-hidden">
      <SEOHead
        pageKey="careers"
        title="Careers & Job Openings | Executive Talks Media"
        description="Explore exciting career opportunities at Executive Talks Media Business Intelligence in conference production, sponsorship sales, digital marketing, and event operations."
        keywords="Executive Talks Media Careers, Event Management Jobs Hyderabad, Conference Production Hiring, Sponsorship Sales Jobs, Executive Talks, ET Media, Media Jobs India"
        url="https://www.executivetalksmedia.in/careers"
      />
      <GlowBackdrop />

      {/* ========================================== */}
      {/* 0. HERO BANNER WITH BACKGROUND IMAGE       */}
      {/* ========================================== */}
      <PageHero
        title="Build Your Executive Career"
        subtitle="Join India's premier B2B business intelligence summits platform. Explore active career opportunities across conference production, sales alliances, operations, and editorial leadership."
        image={images.aboutOffice}
        crumb="Careers"
      />

      {/* ========================================== */}
      {/* 1. OPEN POSITIONS SECTION (WHITE MODE)     */}
      {/* ========================================== */}
      <section id="open-positions" className="relative w-full bg-white text-slate-900 py-6 sm:py-8 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-b border-slate-200">
        <div className="w-full max-w-[1400px] mx-auto">
          
          {/* Header Title Box */}
          <div className="text-left max-w-3xl mb-5 border-b border-slate-200 pb-3.5">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-700 font-display">
              <Zap className="h-4 w-4 text-purple-600" /> Active Vacancies
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display tracking-tight mt-1.5">
              Open Positions
            </h2>
            <p className="mt-2 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed font-sans text-justify">
              Browse current career opportunities across our summit departments. Click any position to view details or apply.
            </p>
          </div>

          {/* Search Bar & Department Filter Bar */}
          <div className="mb-5 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Search Input Box */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, location or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
              />
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
              {departmentsList.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedDepartment === dept
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-purple-600/25 border-none"
                      : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Job Openings Responsive 2-Column Grid Layout */}
          {filteredJobs.length === 0 ? (
            <div className="py-14 text-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-semibold">
              No open positions currently match your search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4.5">
              {filteredJobs.map((job, idx) => {
                const IconComp = getDepartmentIcon(job.department);
                const isClosed = job.status === "Closed";

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    className="group relative rounded-3xl border border-slate-200/90 bg-white p-4.5 sm:p-5 shadow-2xs hover:shadow-xl hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
                  >
                    <div>
                      {/* Top Header Row: Icon + Department Badge & Status Badge */}
                      <div className="flex items-center justify-between gap-2.5 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 shadow-xs">
                            <IconComp className="h-4.5 w-4.5" />
                          </div>

                          <span className="text-[10.5px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 truncate">
                            {job.department}
                          </span>
                        </div>

                        <span
                          className={`text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center gap-1.5 ${
                            isClosed
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${isClosed ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`} />
                          {isClosed ? "Closed" : "Actively Hiring"}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors font-display tracking-tight leading-snug mt-3 line-clamp-2">
                        {job.title}
                      </h3>

                      {/* Meta Info Row: Location, Experience, Work Type */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 mt-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-xl">
                          <MapPin className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          <span>{job.location}</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-xl">
                          <Briefcase className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                          <span>Exp: {job.experience}</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-purple-50/70 border border-purple-200 text-purple-800 px-2.5 py-0.5 rounded-xl">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          <span>Full-Time</span>
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium line-clamp-3 text-justify mt-2 mb-3.5">
                        {job.description}
                      </p>
                    </div>

                    {/* Footer Action Buttons Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5 mt-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedJobDetail(job)}
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs text-center"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        disabled={isClosed}
                        onClick={() => {
                          navigate(`/careers/apply?jobId=${job.id}&title=${encodeURIComponent(job.title)}`);
                        }}
                        className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <span>Apply Now</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ================================================== */}
      {/* 2. WHY JOIN EXECUTIVE TALKS MEDIA / MAKE AN IMPACT */}
      {/* ================================================== */}
      <section className="relative w-full bg-white text-slate-900 py-6 sm:py-8 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-b border-slate-200">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Header Title Box */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 border-b border-slate-200 pb-3.5">
            <div className="text-left max-w-3xl">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-700 font-display">
                <Sparkles className="h-4 w-4 text-purple-600" /> Life At Executive Talks
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display tracking-tight mt-1.5">
                Make an Impact with Us
              </h2>
              <p className="mt-2 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed font-sans text-justify">
                Join Executive Talks Media and be part of a dynamic team that brings ideas to life, connects C-suite leaders, and shapes corporate summit ecosystems across India.
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToPositions}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-purple-700 px-5 py-2.5 text-xs font-extrabold text-white transition-all cursor-pointer shadow-sm shrink-0"
            >
              <span>View Open Positions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 4 Value Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Value 1 */}
            <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 hover:bg-white p-4.5 sm:p-5 shadow-2xs hover:shadow-xl hover:border-purple-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 shadow-xs mb-3 group-hover:scale-105 transition-transform">
                  <Trophy className="h-5 w-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  High-Impact Summits
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium text-justify">
                  Directly curate and deliver India's most prestigious B2B leadership conferences, CXO forums, and award galas.
                </p>
              </div>
            </div>

            {/* Value 2 */}
            <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 hover:bg-white p-4.5 sm:p-5 shadow-2xs hover:shadow-xl hover:border-cyan-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs mb-3 group-hover:scale-105 transition-transform">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  Learn from Leaders
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium text-justify">
                  Collaborate directly with top CXOs, Fortune 500 enterprise heads, and pioneering industry specialists.
                </p>
              </div>
            </div>

            {/* Value 3 */}
            <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 hover:bg-white p-4.5 sm:p-5 shadow-2xs hover:shadow-xl hover:border-indigo-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs mb-3 group-hover:scale-105 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  Accelerated Growth
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium text-justify">
                  Fast-track career advancement with transparent meritocracy, leadership mentorship, and continuous learning.
                </p>
              </div>
            </div>

            {/* Value 4 */}
            <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 hover:bg-white p-4.5 sm:p-5 shadow-2xs hover:shadow-xl hover:border-rose-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 shadow-xs mb-3 group-hover:scale-105 transition-transform">
                  <Heart className="h-5 w-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  People-First Culture
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium text-justify">
                  A high-energy, supportive, and inclusive work environment where every individual contribution is celebrated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. GET STARTED / HIRING PROCESS SECTION    */}
      {/* ========================================== */}
      <section className="relative w-full bg-slate-50/80 text-slate-900 py-6 sm:py-8 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-b border-slate-200">
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-left max-w-3xl mb-5 border-b border-slate-200/80 pb-3.5">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-700 font-display">
              <CheckCircle2 className="h-4 w-4 text-purple-600" /> Step-by-Step Guide
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display tracking-tight mt-1.5">
              Our Hiring Process
            </h2>
            <p className="mt-2 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed font-sans text-justify">
              Our streamlined 4-step recruitment journey is designed to connect exceptional talent with dynamic summit leadership roles.
            </p>
          </div>

          {/* 4-Step Flow Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="group relative flex flex-col p-4.5 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xl hover:border-blue-400/50 hover:-translate-y-1 transition-all duration-300 justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs shadow-xs">
                    01
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Step 1
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  Apply Online
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium text-justify">
                  Browse open positions above, review requirements, and submit your resume and profile in under 2 minutes.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative flex flex-col p-4.5 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xl hover:border-purple-400/50 hover:-translate-y-1 transition-all duration-300 justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs shadow-xs">
                    02
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    Step 2
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  Profile Screening
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium text-justify">
                  Our talent acquisition team carefully reviews your qualifications, skills, and background for role alignment.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative flex flex-col p-4.5 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xl hover:border-cyan-400/50 hover:-translate-y-1 transition-all duration-300 justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white font-black text-xs shadow-xs">
                    03
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    Step 3
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  Interview Round
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium text-justify">
                  Meet with our department heads and summit producers to discuss your aspirations, experience, and domain strengths.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="group relative flex flex-col p-4.5 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xl hover:border-emerald-400/50 hover:-translate-y-1 transition-all duration-300 justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white font-black text-xs shadow-xs">
                    04
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Step 4
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  Offer & Welcome
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans font-medium text-justify">
                  Receive your formal offer letter, complete orientation, and embark on your leadership journey at ET Media!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. CAREER DETAIL MODAL                     */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedJobDetail && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJobDetail(null)}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-2xl text-slate-900 z-10 my-auto"
            >
              <button
                type="button"
                onClick={() => setSelectedJobDetail(null)}
                className="absolute top-5 right-5 sm:top-7 sm:right-7 p-3 rounded-full border border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Close detail modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-extrabold uppercase px-3.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                  {selectedJobDetail.department}
                </span>
                <span
                  className={`text-xs font-bold px-3.5 py-1 rounded-full border ${
                    selectedJobDetail.status === "Closed"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {selectedJobDetail.status === "Closed" ? "Hiring Closed" : "Actively Hiring"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display">
                {selectedJobDetail.title}
              </h2>

              <div className="mt-3 flex flex-wrap gap-4 text-xs sm:text-sm font-semibold text-slate-600 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span>{selectedJobDetail.location}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                  <Briefcase className="h-4 w-4 text-cyan-600" />
                  <span>{selectedJobDetail.experience}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 font-display">
                      Job Description
                    </h4>
                    <p className="text-slate-600">{selectedJobDetail.description}</p>
                  </div>

                  {parseList(selectedJobDetail.responsibilities).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 font-display">
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-2">
                        {parseList(selectedJobDetail.responsibilities).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {parseList(selectedJobDetail.qualifications).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 font-display">
                        Qualifications & Skills
                      </h4>
                      <ul className="space-y-2">
                        {parseList(selectedJobDetail.qualifications).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parseList(selectedJobDetail.benefits).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 font-display">
                        Benefits & Culture Perks
                      </h4>
                      <ul className="space-y-2">
                        {parseList(selectedJobDetail.benefits).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                            <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedJobDetail(null)}
                  className="px-6 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-xs sm:text-sm font-bold"
                >
                  Close Window
                </button>

                <button
                  type="button"
                  disabled={selectedJobDetail.status === "Closed"}
                  onClick={() => {
                    const job = selectedJobDetail;
                    setSelectedJobDetail(null);
                    navigate(`/careers/apply?jobId=${job.id}&title=${encodeURIComponent(job.title)}`);
                  }}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer text-xs sm:text-sm font-extrabold flex items-center gap-2 disabled:opacity-40"
                >
                  <span>Apply For This Position</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {false && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setApplyJob(null)}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-2xl text-slate-900 backdrop-blur-2xl z-10 my-auto"
            >
              <button
                type="button"
                onClick={() => setApplyJob(null)}
                className="absolute top-5 right-5 sm:top-7 sm:right-7 p-3 rounded-full border border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Close apply modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 border-b border-slate-200 pb-4">
                <span className="text-xs font-extrabold uppercase text-purple-700 font-display">
                  Job Application
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-display">
                  Apply for {applyJob?.title || "Position"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono font-medium">
                  {applyJob?.department || ""} · {applyJob?.location || ""}
                </p>
              </div>

              {formError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3 font-semibold">
                  <X className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="space-y-6">
                {/* 3 Columns Row 1: Full Name, Email, Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={applicantForm.name}
                        onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="your.email@example.com"
                        value={applicantForm.email}
                        onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        maxLength={15}
                        placeholder="e.g. 98765 43210"
                        value={applicantForm.phone}
                        onChange={(e) => setApplicantForm({ ...applicantForm, phone: sanitizePhoneInput(e.target.value) })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* 3 Columns Row 2: Experience, Resume, Portfolio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Years of Experience *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 3 Years 6 Months"
                        value={applicantForm.experience}
                        onChange={(e) => setApplicantForm({ ...applicantForm, experience: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Upload Resume (PDF File) *
                    </label>
                    <div className="relative">
                      <label className="cursor-pointer flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-purple-700 hover:bg-slate-100 transition-colors h-[46px]">
                        <Upload className="h-4 w-4 text-purple-600 shrink-0" />
                        <span className="truncate">{uploadingResume ? "Uploading PDF..." : "Choose PDF Resume File"}</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {applicantForm.resume_url && (
                      <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
                        <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="font-mono truncate">Resume PDF Uploaded!</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Portfolio / LinkedIn Profile URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={applicantForm.portfolio_url}
                        onChange={(e) => setApplicantForm({ ...applicantForm, portfolio_url: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingResume}
                    className="w-full sm:w-auto cursor-pointer rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Job Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* 6. SUCCESS CONFIRMATION MODAL             */}
      {/* ========================================== */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-[#0D111D] p-6 sm:p-8 shadow-2xl text-white text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-bold text-white font-display">
                Application Received!
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Thank you for applying to <strong className="text-white">Executive Talks Media Business Intelligence</strong>. Our talent team will review your resume and contact you if your profile matches the role requirements.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setApplyJob(null);
                }}
                className="mt-6 w-full cursor-pointer rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                Done & Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
