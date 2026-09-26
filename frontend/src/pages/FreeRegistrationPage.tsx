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
import { events as defaultEvents } from "@/lib/site-data";

export default function FreeRegistrationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [eventData, setEventData] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    const fetchEvent = async () => {
      setLoadingEvent(true);
      const targetSlug = slug || searchParams.get("event") || "hr-recall-2k26";

      try {
        const res = await fetch(`/api/events/${targetSlug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.event) {
            setEventData(json.event);
            setLoadingEvent(false);
            return;
          }
        }
      } catch (e) {}

      const found = defaultEvents.find(
        (e) => (e.slug || "").toLowerCase() === targetSlug.toLowerCase() || (e.id || "").toLowerCase() === targetSlug.toLowerCase()
      ) || defaultEvents[0];

      setEventData(found);
      setLoadingEvent(false);
    };

    fetchEvent();
  }, [slug, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter your First Name and Last Name.");
      return;
    }
    if (!formData.workEmail.trim() || !formData.workEmail.includes("@")) {
      toast.error("Please enter a valid Work Email address.");
      return;
    }
    const cleanPhone = formData.contactNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit Mobile / Contact Number.");
      return;
    }
    if (!formData.designation.trim()) {
      toast.error("Please enter your Designation.");
      return;
    }
    if (!formData.companyName.trim()) {
      toast.error("Please enter your Company / Organization Name.");
      return;
    }
    if (!formData.reasonForAttending.trim()) {
      toast.error("Please share a brief motivation for attending as a complimentary delegate.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/registrations/free-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
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

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading Free Registration Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* ================= HERO HEADER BANNER ================= */}
      <div className="relative bg-slate-950 text-white pt-10 pb-16 overflow-hidden border-b border-slate-800">
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
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Free Delegate Application
                </span>
                <span className="text-xs font-bold text-slate-400">Subject to Admin Selection & Approval</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-xs font-extrabold text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all self-start md:self-auto cursor-pointer shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Event Details</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MAIN FORM CONTAINER ================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Rajesh"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sharma"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="workEmail"
                  required
                  value={formData.workEmail}
                  onChange={handleInputChange}
                  placeholder="rajesh@company.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact / Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g. Vice President HR"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g. Enterprise Solutions Ltd"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Hyderabad / Bengaluru"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/profile"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Executive Motivation / Reason for Attending <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="reasonForAttending"
                  required
                  rows={3}
                  value={formData.reasonForAttending}
                  onChange={handleInputChange}
                  placeholder="Share why you would like to attend as a complimentary delegate (e.g., Key networking goals, enterprise initiatives)..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
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
  );
}
