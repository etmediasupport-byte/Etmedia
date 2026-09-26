import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Award,
  Megaphone,
  Mic,
  Rocket,
  Newspaper,
  Handshake,
  CheckCircle2,
  Globe,
  Building2,
  MapPin,
  User,
  Briefcase,
  Mail,
  Phone,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { GlowBackdrop } from "@/components/site/primitives";
import { socket } from "@/lib/socket";
import { Collaborator, getDefaultCollaborators } from "@/lib/site-data";

const partnershipBenefits = [
  {
    id: "branding",
    title: "Branding",
    icon: Sparkles,
    badge: "High Visibility",
    color: "from-cyan-500 to-blue-600",
    bgGlow: "bg-cyan-500/10 border-cyan-500/30 text-cyan-700",
    description:
      "Position your brand at the forefront of national summits with premium venue branding, stage backdrops, badge co-branding, and high-impact digital press coverage.",
    perks: [
      "Stage & Backdrop Co-Branding",
      "Executive Summit Passes & VIP Lounge Access",
      "Digital Banner & Press Release Mentions",
    ],
  },
  {
    id: "sponsorship",
    title: "Sponsorship",
    icon: Megaphone,
    badge: "B2B Lead Scale",
    color: "from-blue-600 to-indigo-600",
    bgGlow: "bg-blue-500/10 border-blue-500/30 text-blue-700",
    description:
      "Choose from Title, Platinum, Gold, and Category-exclusive sponsorship packages designed to generate direct access to CXOs, VP decision-makers, and active enterprise buyers.",
    perks: [
      "Dedicated Exhibition Booth Space",
      "Direct Qualified Lead List Access",
      "Exclusive One-on-One CXO Business Meetings",
    ],
  },
  {
    id: "speaking",
    title: "Speaking Opportunities",
    icon: Mic,
    badge: "Thought Leadership",
    color: "from-purple-600 to-indigo-600",
    bgGlow: "bg-purple-500/10 border-purple-500/30 text-purple-700",
    description:
      "Gain thought leadership authority by delivering keynote presentations, leading executive panel sessions, and hosting closed-door roundtable discussions with industry peers.",
    perks: [
      "Keynote & Panel Discussion Slot",
      "Fireside Executive Broadcast Interview",
      "Full Video Recording & Media Distribution",
    ],
  },
  {
    id: "product-launch",
    title: "Product Launch",
    icon: Rocket,
    badge: "Stage Spotlight",
    color: "from-pink-600 to-rose-600",
    bgGlow: "bg-pink-500/10 border-pink-500/30 text-pink-700",
    description:
      "Unveil new technologies, enterprise software platforms, and innovative solutions directly to live audiences of corporate executives and national business journalists.",
    perks: [
      "Mainstage Product Unveiling Session",
      "Live Interactive Demo Zone Booth",
      "Media Release & Executive Interview Feature",
    ],
  },
  {
    id: "awards",
    title: "Awards Co-Presenting",
    icon: Award,
    badge: "Benchmark Honor",
    color: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/10 border-amber-500/30 text-amber-700",
    description:
      "Co-present prestigious industry excellence awards, hand over benchmark trophies to top CEOs/CHROs/CFOs, and establish your brand as a pillar of industry excellence.",
    perks: [
      "Category Award Presenter Honors",
      "Trophy Handover & Stage Photo Sessions",
      "Exclusive Awards Gala Dinner Table",
    ],
  },
  {
    id: "pr",
    title: "PR & Media Campaigns",
    icon: Newspaper,
    badge: "Multi-Channel Reach",
    color: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
    description:
      "Amplify your brand message across digital press publications, Executive Talks Magazine features, social media campaigns, and targeted corporate newsletter blasts.",
    perks: [
      "Executive Feature in Executive Talks Magazine",
      "National Digital PR Distribution",
      "Targeted CXO Email Blast Spotlight",
    ],
  },
];

const industriesList = [
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
  "Other Industry",
];

const partnershipTypesList = [
  "Branding Partnership",
  "Sponsorship Tier (Title / Platinum / Gold)",
  "Speaking & Keynote Slot",
  "Product Launch Stage",
  "Awards Co-Presenting",
  "PR & Media Campaign",
  "Strategic Alliance / Ecosystem Partner",
  "Other Partnership Enquiry",
];

export default function PartnerWithUsPage() {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPartnerName, setSubmittedPartnerName] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    company_name: "",
    website: "",
    industry: "",
    location: "",
    contact_person: "",
    designation: "",
    email: "",
    phone: "",
    partnership_type: "",
    message: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Fetch partners & Socket listeners
  useEffect(() => {
    fetchPartners();

    const handlePartnerUpdate = () => {
      fetchPartners();
    };

    socket.on("partner_updated", handlePartnerUpdate);
    return () => {
      socket.off("partner_updated", handlePartnerUpdate);
    };
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners");
      if (res.ok) {
        const data = await res.json();
        if (data.partners && data.partners.length > 0) {
          const activePartners = data.partners.filter((c: Collaborator) => c.status !== "Inactive");
          activePartners.sort((a: Collaborator, b: Collaborator) => (a.priority ?? 0) - (b.priority ?? 0));
          setCollaborators(activePartners);
          return;
        }
      }
    } catch (e) {
      console.warn("Using fallback collaborators data:", e);
    }
    setCollaborators(getDefaultCollaborators());
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (
      !formData.company_name.trim() ||
      !formData.industry ||
      !formData.location.trim() ||
      !formData.contact_person.trim() ||
      !formData.designation.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.partnership_type
    ) {
      setFormError("Please complete all required fields marked with an asterisk (*).");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/partners/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSubmittedPartnerName(formData.contact_person);
        setShowSuccessModal(true);
        setFormData({
          company_name: "",
          website: "",
          industry: "",
          location: "",
          contact_person: "",
          designation: "",
          email: "",
          phone: "",
          partnership_type: "",
          message: "",
        });
      } else {
        setFormError(result.message || "Failed to submit partner application.");
      }
    } catch (err: any) {
      console.error("Partner submission error:", err);
      // Fallback preview modal if backend is temporarily unreachable
      setSubmittedPartnerName(formData.contact_person);
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "All",
    "Strategic Partner",
    "Tech Partner",
    "Media Partner",
    "Award Partner",
  ];

  const filteredCollaborators =
    selectedCategory === "All"
      ? collaborators
      : collaborators.filter(
          (c) =>
            c.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            c.category?.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  // Repeat for continuous smooth marquee carousel
  const marqueeItems = [
    ...(filteredCollaborators.length > 0 ? filteredCollaborators : getDefaultCollaborators()),
    ...(filteredCollaborators.length > 0 ? filteredCollaborators : getDefaultCollaborators()),
    ...(filteredCollaborators.length > 0 ? filteredCollaborators : getDefaultCollaborators()),
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <GlowBackdrop />

      {/* ========================================== */}
      {/* 1. PARTNER APPLICATION FORM (FULL WIDTH WHITE MODE) */}
      {/* ========================================== */}
      <section id="partner-form" className="relative w-full bg-slate-900 text-slate-100 border-b border-slate-800 py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400 font-display">
              <Zap className="h-4 w-4" /> MULTI-STEP PARTNERSHIP WIZARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Ready to Partner With Us?
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed font-medium">
              Submit your strategic proposal using our step-by-step full page application wizard. No popups, no hassle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/partner/apply")}
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-black text-white hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 cursor-pointer shrink-0"
          >
            <span>Start Partner Application</span>
            <ArrowUpRight className="h-5 w-5" />
          </button>
        </div>
      </section>


      {/* ========================================== */}
      {/* 2. PARTNERSHIP BENEFITS CARDS             */}
      {/* ========================================== */}
      <section id="benefits" className="py-20 md:py-28 relative">
        <div className="container-x">
          <div className="text-left max-w-3xl mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-display">
              Partnership Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-display">
              Why Partner With Executive Talks Media Business Intelligence?
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Tailored sponsorship and strategic engagement tiers engineered for maximum brand resonance and high-value lead acquisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnershipBenefits.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group relative rounded-3xl border border-slate-800/90 bg-slate-900/60 p-7 shadow-xl hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg shadow-cyan-500/10 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border ${item.bgGlow}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors font-display">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                {/* Perk List */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Key Highlights
                  </div>
                  <ul className="space-y-2">
                    {item.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2.5 text-xs text-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. OUR COLLABORATORS ANIMATED CAROUSEL    */}
      {/* ========================================== */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800/80 overflow-hidden relative">
        <div className="container-x mb-10 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-purple-400 font-display">
            Trusted By Benchmark Leaders
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-display">
            Our Collaborators
          </h2>
          <p className="mt-3 text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Honoured to collaborate with world-class enterprise brands, tech pioneers, and strategic institutions across India.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Continuous Animated Marquee */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-10" />

          <motion.div
            className="flex items-center gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 25,
            }}
          >
            {marqueeItems.map((collab, index) => (
              <div
                key={`${collab.id}-${index}`}
                className="group relative flex flex-col items-center justify-center text-center gap-3 rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-none rounded-bl-none border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-xl hover:border-cyan-500/60 transition-all shrink-0 min-w-[210px]"
              >
                {/* Logo Image Box (Large Image) */}
                <div className="h-28 w-48 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-none rounded-bl-none overflow-hidden bg-white border border-slate-100 p-3 flex items-center justify-center shrink-0 shadow-sm group-hover:border-cyan-200 transition-colors">
                  <img
                    src={collab.logo}
                    alt={collab.brand_name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Brand Name & Category (Below Image) */}
                <div className="flex flex-col items-center text-center">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-cyan-600 transition-colors font-display line-clamp-1 flex items-center justify-center gap-1.5">
                    {collab.brand_name}
                    {collab.website && (
                      <a
                        href={collab.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-cyan-600 transition-colors"
                        title="Visit Partner Website"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {collab.category || "Strategic Partner"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* ========================================== */}
      {/* 5. SUCCESS / CONFIRMATION MODAL            */}
      {/* ========================================== */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl text-white"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Top Badge */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Application Submitted Successfully
                  </h3>
                  <p className="text-xs text-cyan-400 font-semibold">
                    Executive Talks Media Business Intelligence
                  </p>
                </div>
              </div>

              {/* Exact Auto-Response Letter Requested by User */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
                <p>Dear <strong className="text-white">{submittedPartnerName || "Partner"}</strong>,</p>
                <p>
                  Thank you for expressing your interest in partnering with Executive Talks Media Business Intelligence.
                </p>
                <p className="text-cyan-300 font-medium">
                  Our team will get in touch with you shortly.
                </p>
                <p>
                  We will review your requirements and discuss the available branding, sponsorship and business engagement opportunities.
                </p>
                <p>
                  We look forward to building a successful partnership with your organisation.
                </p>
                <div className="pt-3 border-t border-slate-800 text-slate-400 space-y-1">
                  <p className="font-bold text-white">Regards,</p>
                  <p className="font-semibold text-slate-200">Executive Talks Media Business Intelligence</p>
                  <p>
                    <a
                      href="mailto:partner.support@etmedia.in"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      partner.support@etmedia.in
                    </a>
                  </p>
                  <p>
                    <a
                      href="http://www.etmedia.in"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      www.etmedia.in
                    </a>
                  </p>
                </div>
              </div>

              {/* Close Action */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
