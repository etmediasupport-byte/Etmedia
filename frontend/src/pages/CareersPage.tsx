import { useState, useEffect } from "react";
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
import { socket } from "@/lib/socket";
import { JobItem, getDefaultJobs } from "@/lib/site-data";

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

    if (!applicantForm.name.trim() || !applicantForm.email.trim() || !applicantForm.phone.trim() || !applicantForm.experience.trim() || !applicantForm.resume_url.trim()) {
      setFormError("Please complete all required fields and upload your resume PDF.");
      return;
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      <GlowBackdrop />

      {/* ========================================== */}
      {/* 0. HERO BANNER SECTION                     */}
      {/* ========================================== */}
      <section className="relative w-full py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-900 text-white overflow-hidden border-b border-purple-500/20 shadow-2xl">
        <div className="container-x relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-purple-400 font-display mb-3 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>EXECUTIVE CAREERS AT ET MEDIA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-tight">
            Build the Future of <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Business Intelligence Summits
            </span>
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-2xl mx-auto font-sans">
            Join India's premier B2B executive summits platform. Collaborate with industry leaders, scale high-impact leadership forums, and accelerate your career.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 1. OPEN POSITIONS SECTION (WHITE MODE)     */}
      {/* ========================================== */}
      <section id="open-positions" className="relative w-full bg-white text-slate-900 py-16 sm:py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-b border-slate-200">
        <div className="w-full max-w-[1500px] mx-auto">
          
          {/* Header Title Box */}
          <div className="text-left max-w-3xl mb-10 border-b border-slate-200 pb-6">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-700 font-display">
              <Zap className="h-4 w-4 text-purple-600" /> Active Job Openings
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-display tracking-tight mt-2">
              Explore Open Positions
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium leading-relaxed font-sans">
              Select an open vacancy below across conference production, sales alliances, event operations, and media leadership to apply directly.
            </p>
          </div>

          {/* Search Bar & Department Filter Bar */}
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200/90 shadow-sm">
            {/* Search Input Box */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, location or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
              />
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
              {departmentsList.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

          {/* Job Openings Grid (2 Columns Desktop, 1 Column Mobile) */}
          {filteredJobs.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-semibold">
              No open positions currently match your search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {filteredJobs.map((job, idx) => {
                const IconComp = getDepartmentIcon(job.department);
                const isClosed = job.status === "Closed";
                const responsibilities = parseList(job.responsibilities);
                const qualifications = parseList(job.qualifications);
                const topHighlights = [...responsibilities, ...qualifications].slice(0, 3);

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    className="group relative flex flex-col justify-between rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-none rounded-bl-none border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all duration-300"
                  >
                    <div>
                      {/* Top Header: Department Icon, Category Badge & Hiring Badge */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 shadow-xs">
                            <IconComp className="h-5.5 w-5.5" />
                          </div>

                          <span className="text-[11px] font-black uppercase px-3.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 truncate">
                            {job.department}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-extrabold px-3.5 py-1 rounded-full border shrink-0 flex items-center gap-1.5 ${
                            isClosed
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${isClosed ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`} />
                          {isClosed ? "Hiring Closed" : "Actively Hiring"}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors font-display leading-tight tracking-tight">
                        {job.title}
                      </h3>

                      {/* Meta Info Badges: Location, Experience, Work Type */}
                      <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-700">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                          <MapPin className="h-4 w-4 text-purple-600 shrink-0" />
                          <span>{job.location}</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                          <Briefcase className="h-4 w-4 text-cyan-600 shrink-0" />
                          <span>Exp: {job.experience}</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl">
                          <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
                          <span>Full-Time / Executive</span>
                        </div>
                      </div>

                      {/* Description Paragraph */}
                      <p className="mt-4 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-sans font-normal">
                        {job.description}
                      </p>

                      {/* Key Highlights / Requirement Chips (Fills empty space beautifully) */}
                      {topHighlights.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                          {topHighlights.map((highlight, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                              <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                              <span className="truncate max-w-[280px]">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedJobDetail(job)}
                        className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        disabled={isClosed}
                        onClick={() => {
                          setApplyJob(job);
                          setFormError(null);
                        }}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <span>Apply Now</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ========================================== */}
      {/* 2. WHY JOIN ET MEDIA / MAKE AN IMPACT      */}
      {/* ========================================== */}
      <section className="py-16 sm:py-20 relative">
        <div className="container-x">
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#0D0A26] via-[#120D3D] to-[#0A1628] p-8 sm:p-12 overflow-hidden relative shadow-2xl">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              
              {/* Left Column: Heading & CTA */}
              <div className="lg:col-span-5 space-y-4 text-left">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 font-display">
                  WHY JOIN ET MEDIA
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display leading-tight">
                  Make an Impact with Us
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed font-sans">
                  Join ET Media and be part of a team that brings ideas to life, connects C-suite leaders, and shapes corporate summit ecosystems across India.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={scrollToPositions}
                    className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-950/40 hover:bg-purple-900/60 px-6 py-3 text-xs font-extrabold text-white transition-all cursor-pointer hover:border-purple-400"
                  >
                    <span>View All Openings</span>
                    <ArrowRight className="h-4 w-4 text-purple-400" />
                  </button>
                </div>
              </div>

              {/* Right Column: 4 Value Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Value 1 */}
                <div className="flex flex-col items-start p-4 rounded-2xl bg-[#07090E]/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 mb-3">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-extrabold text-white font-display">Exciting Projects</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">Work on high-impact events and initiatives</p>
                </div>

                {/* Value 2 */}
                <div className="flex flex-col items-start p-4 rounded-2xl bg-[#07090E]/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 mb-3">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-extrabold text-white font-display">Learn from Leaders</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">Collaborate with top CXO professionals</p>
                </div>

                {/* Value 3 */}
                <div className="flex flex-col items-start p-4 rounded-2xl bg-[#07090E]/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 mb-3">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-extrabold text-white font-display">Career Growth</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">Continuous learning and rapid career track</p>
                </div>

                {/* Value 4 */}
                <div className="flex flex-col items-start p-4 rounded-2xl bg-[#07090E]/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/30 mb-3">
                    <Heart className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-extrabold text-white font-display">People-First</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">A supportive and high-energy culture</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. GET STARTED / HIRING PROCESS SECTION    */}
      {/* ========================================== */}
      <section className="py-16 sm:py-20 relative border-t border-slate-800/80">
        <div className="container-x">
          {/* Header */}
          <div className="text-left mb-12">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 font-display">
              GET STARTED
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mt-1">
              Our Hiring Process
            </h2>
          </div>

          {/* 4-Step Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col p-6 rounded-3xl border border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-black text-sm shadow-md">
                  1
                </div>
                <h4 className="text-base font-bold text-white font-display">Apply</h4>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
                Submit your application online
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col p-6 rounded-3xl border border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm shadow-md">
                  2
                </div>
                <h4 className="text-base font-bold text-white font-display">Screening</h4>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
                Initial review by our hiring desk
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col p-6 rounded-3xl border border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-black text-sm shadow-md">
                  3
                </div>
                <h4 className="text-base font-bold text-white font-display">Interviews</h4>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
                Meet with our department heads
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col p-6 rounded-3xl border border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white font-black text-sm shadow-md">
                  4
                </div>
                <h4 className="text-base font-bold text-white font-display">Get Hired</h4>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed font-sans">
                Join the ET Media team
              </p>
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
              className="relative w-full max-w-6xl rounded-3xl border border-purple-500/30 bg-[#0D111D]/98 p-6 sm:p-8 md:p-10 shadow-2xl text-white backdrop-blur-2xl z-10 my-auto"
            >
              <button
                type="button"
                onClick={() => setSelectedJobDetail(null)}
                className="absolute top-5 right-5 sm:top-7 sm:right-7 p-3 rounded-full border border-slate-800 bg-[#07090E] text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close detail modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {selectedJobDetail.department}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                    selectedJobDetail.status === "Closed"
                      ? "bg-rose-950/60 text-rose-400 border-rose-500/40"
                      : "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                  }`}
                >
                  {selectedJobDetail.status === "Closed" ? "Hiring Closed" : "Actively Hiring"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display">
                {selectedJobDetail.title}
              </h2>

              <div className="mt-3 flex flex-wrap gap-4 text-xs sm:text-sm font-semibold text-slate-400 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span>{selectedJobDetail.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-cyan-400" />
                  <span>{selectedJobDetail.experience}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-display">
                      Job Description
                    </h4>
                    <p>{selectedJobDetail.description}</p>
                  </div>

                  {parseList(selectedJobDetail.responsibilities).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-display">
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-2">
                        {parseList(selectedJobDetail.responsibilities).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
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
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-display">
                        Qualifications & Skills
                      </h4>
                      <ul className="space-y-2">
                        {parseList(selectedJobDetail.qualifications).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parseList(selectedJobDetail.benefits).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-display">
                        Benefits & Culture Perks
                      </h4>
                      <ul className="space-y-2">
                        {parseList(selectedJobDetail.benefits).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                            <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedJobDetail(null)}
                  className="px-6 py-3 rounded-2xl border border-slate-800 bg-[#07090E] text-slate-300 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm font-bold"
                >
                  Close Window
                </button>

                <button
                  type="button"
                  disabled={selectedJobDetail.status === "Closed"}
                  onClick={() => {
                    setApplyJob(selectedJobDetail);
                    setSelectedJobDetail(null);
                    setFormError(null);
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

      {/* ========================================== */}
      {/* 5. APPLY FORM MODAL                        */}
      {/* ========================================== */}
      <AnimatePresence>
        {applyJob && (
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
                  Apply for {applyJob.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono font-medium">
                  {applyJob.department} · {applyJob.location}
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
                        placeholder="+91 98765 43210"
                        value={applicantForm.phone}
                        onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })}
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
                Thank you for applying to <strong className="text-white">ET Media Business Intelligence</strong>. Our talent team will review your resume and contact you if your profile matches the role requirements.
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
