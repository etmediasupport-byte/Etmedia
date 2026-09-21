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
  Mail,
  Phone,
  Globe,
  FileText,
  Zap,
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

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <GlowBackdrop />



      {/* ========================================== */}
      {/* 2. OPEN POSITIONS SECTION & FILTER         */}
      {/* ========================================== */}
      <section id="open-positions" className="py-20 md:py-28 relative">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-purple-400 font-display">
              Career Opportunities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-display">
              Open Positions
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Explore available roles across conference production, sales alliances, event operations, and media leadership.
            </p>
          </div>

          {/* Search Bar & Department Filter */}
          <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search job title, location or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {departmentsList.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedDepartment === dept
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                      : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Job Openings Grid */}
          {filteredJobs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No open position currently matches your search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-xl hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-300"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {job.department}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          job.status === "Closed"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {job.status === "Closed" ? "Hiring Closed" : "Actively Hiring"}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors font-display line-clamp-2">
                      {job.title}
                    </h3>

                    {/* Location & Experience Badges */}
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>{job.experience}</span>
                      </div>
                    </div>

                    {/* Description Snippet */}
                    <p className="mt-4 text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed font-sans">
                      {job.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedJobDetail(job)}
                      className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      disabled={job.status === "Closed"}
                      onClick={() => {
                        setApplyJob(job);
                        setFormError(null);
                      }}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <span>Apply Now</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. CAREER DETAIL MODAL                     */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedJobDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-3xl border border-purple-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl text-white max-h-[85vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedJobDetail(null)}
                className="absolute top-5 right-5 p-2 rounded-full border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Top Header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {selectedJobDetail.department}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                    selectedJobDetail.status === "Closed"
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {selectedJobDetail.status === "Closed" ? "Hiring Closed" : "Actively Hiring"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {selectedJobDetail.title}
              </h2>

              <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-400 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span>{selectedJobDetail.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span>{selectedJobDetail.experience}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="mt-6 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-display">
                    Job Description
                  </h4>
                  <p>{selectedJobDetail.description}</p>
                </div>

                {/* Responsibilities */}
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

                {/* Qualifications */}
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

                {/* Benefits */}
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

              {/* Modal Actions */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedJobDetail(null)}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={selectedJobDetail.status === "Closed"}
                  onClick={() => {
                    setApplyJob(selectedJobDetail);
                    setSelectedJobDetail(null);
                    setFormError(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors cursor-pointer text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-40"
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
      {/* 4. APPLY FORM MODAL                        */}
      {/* ========================================== */}
      <AnimatePresence>
        {applyJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl border border-purple-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setApplyJob(null)}
                className="absolute top-5 right-5 p-2 rounded-full border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Form Title */}
              <div className="mb-6">
                <span className="text-xs font-extrabold uppercase text-purple-400 font-display">
                  Job Application
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">
                  Apply for {applyJob.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {applyJob.department} · {applyJob.location}
                </p>
              </div>

              {formError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <X className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={applicantForm.name}
                      onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="your.email@example.com"
                        value={applicantForm.email}
                        onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={applicantForm.phone}
                        onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Experience */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Years of Experience *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 3 Years 6 Months"
                      value={applicantForm.experience}
                      onChange={(e) => setApplicantForm({ ...applicantForm, experience: e.target.value })}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* PDF Resume Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Upload Resume (PDF File) *
                  </label>
                  
                  <div className="relative">
                    <label className="cursor-pointer flex items-center justify-center gap-2.5 rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-xs font-bold text-purple-300 hover:bg-slate-800 transition-colors">
                      <Upload className="h-4 w-4 text-purple-400" />
                      <span>{uploadingResume ? "Uploading PDF..." : "Choose PDF Resume File"}</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {applicantForm.resume_url && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="font-mono truncate">Resume PDF Uploaded Successfully!</span>
                    </div>
                  )}
                </div>

                {/* Portfolio / LinkedIn Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Portfolio / LinkedIn Profile URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={applicantForm.portfolio_url}
                      onChange={(e) => setApplicantForm({ ...applicantForm, portfolio_url: e.target.value })}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Application Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingResume}
                  className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* 5. SUCCESS CONFIRMATION MODAL             */}
      {/* ========================================== */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl text-white text-center"
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
