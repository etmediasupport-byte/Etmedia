import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Check,
  Layers,
  TrendingUp,
  Users,
  Target,
  Crown,
  FileText,
  Star,
} from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { GlowBackdrop, Reveal, Counter, SectionHeading } from "@/components/site/primitives";
import { SEOHead } from "@/components/site/SEOHead";
import { socket } from "@/lib/socket";
import { Collaborator, getDefaultCollaborators, images, contact } from "@/lib/site-data";

const partnershipBenefits = [
  {
    id: "branding",
    title: "Stage & Venue Branding",
    icon: Sparkles,
    badge: "High Visibility",
    color: "from-cyan-500 to-blue-600",
    bgGlow: "bg-cyan-50 border-cyan-200 text-cyan-700",
    description:
      "Position your brand at the forefront of national summits with premium venue branding, LED stage backdrops, badge co-branding, and digital press coverage.",
    perks: [
      "Stage & Backdrop Co-Branding",
      "Executive Summit Passes & VIP Lounge Access",
      "Digital Banner & National Press Release Mentions",
    ],
  },
  {
    id: "sponsorship",
    title: "Enterprise Lead Generation",
    icon: Megaphone,
    badge: "B2B Lead Scale",
    color: "from-blue-600 to-indigo-600",
    bgGlow: "bg-blue-50 border-blue-200 text-blue-700",
    description:
      "Engage directly with CXOs, VP decision-makers, and enterprise buyers through dedicated exhibition pavilions, booth spaces, and lead capture points.",
    perks: [
      "Dedicated Exhibition Pavilion Booth Space",
      "Direct Qualified Lead List Access",
      "Exclusive One-on-One CXO Business Meetings",
    ],
  },
  {
    id: "speaking",
    title: "Thought Leadership & Keynotes",
    icon: Mic,
    badge: "Authority",
    color: "from-purple-600 to-indigo-600",
    bgGlow: "bg-purple-50 border-purple-200 text-purple-700",
    description:
      "Gain thought leadership authority by delivering keynote presentations, leading executive panel sessions, and hosting closed-door roundtable discussions.",
    perks: [
      "Keynote & Panel Discussion Slot",
      "Fireside Executive Broadcast Interview",
      "Full Video Recording & Multi-Channel Distribution",
    ],
  },
  {
    id: "product-launch",
    title: "Product Launch & Live Demos",
    icon: Rocket,
    badge: "Spotlight",
    color: "from-pink-600 to-rose-600",
    bgGlow: "bg-pink-50 border-pink-200 text-pink-700",
    description:
      "Unveil new technologies, enterprise software platforms, and innovative solutions directly to live audiences of corporate executives and journalists.",
    perks: [
      "Mainstage Product Unveiling Session",
      "Live Interactive Demo Zone Space",
      "Media Release & Executive Interview Feature",
    ],
  },
  {
    id: "awards",
    title: "Awards Co-Presenting",
    icon: Award,
    badge: "Benchmark Honor",
    color: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-50 border-amber-200 text-amber-700",
    description:
      "Co-present prestigious industry excellence awards, hand over benchmark trophies to top CEOs/CHROs/CFOs, and establish your brand as an industry pillar.",
    perks: [
      "Category Award Presenter Honors",
      "Trophy Handover & Stage Photo Sessions",
      "Exclusive Awards Gala Dinner Table",
    ],
  },
  {
    id: "pr",
    title: "PR & Executive Media Distribution",
    icon: Newspaper,
    badge: "Multi-Channel Reach",
    color: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-50 border-emerald-200 text-emerald-700",
    description:
      "Amplify your brand message across digital press publications, Executive Talks Magazine features, social campaigns, and targeted corporate newsletters.",
    perks: [
      "Executive Feature in Executive Talks Magazine",
      "National Digital PR & Syndication",
      "Targeted CXO Email Blast Spotlight",
    ],
  },
];

const sponsorshipTiers = [
  {
    id: "title",
    name: "Title Partner",
    badge: "Exclusive Flagship",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    icon: Crown,
    description: "Top-of-bill naming rights with keynote authority, VIP lounge hosting, and primary brand prominence across all event assets.",
    deliverables: [
      "Exclusive Summit Naming Rights ('ET Summit Powered By [Brand]')",
      "20-Minute Opening Keynote Address + Panel Moderation",
      "10 VIP All-Access Executive Delegate Passes",
      "Premium 6x3m Exhibition Pavilion Booth Space",
      "Complete Opt-In Attendee & Decision-Maker Database",
      "Exclusive 2-Page Feature in Executive Talks Magazine",
    ],
    popular: false,
    featured: true,
  },
  {
    id: "platinum",
    name: "Platinum Partner",
    badge: "Most Popular",
    badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    icon: Star,
    description: "High-impact stage co-hosting with strategic speaking slots, extensive exhibition presence, and national media coverage.",
    deliverables: [
      "Prominent Mainstage Backdrop & Badge Co-Branding",
      "1 Panel Discussion Speaker Slot + 1 CXO Fireside Chat",
      "6 VIP All-Access Executive Delegate Passes",
      "Prime 3x3m Exhibition & Product Showcase Booth",
      "National Digital PR Distribution & Social Syndication",
      "Post-Event Attendee Connection & Matchmaking List",
    ],
    popular: true,
    featured: false,
  },
  {
    id: "gold",
    name: "Gold Partner",
    badge: "High Lead ROI",
    badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
    gradient: "from-indigo-500 via-purple-600 to-pink-600",
    icon: Target,
    description: "Targeted brand positioning designed for B2B pipeline development, active CXO networking, and enterprise solution showcasing.",
    deliverables: [
      "Stage Backdrop, Event Signage & Digital Portal Branding",
      "1 Executive Speaker / Panelist Seat on Key Topic",
      "4 VIP All-Access Executive Delegate Passes",
      "Dedicated Exhibition Display Table & Networking Space",
      "Inclusion in National Post-Summit Press Release",
      "Curated Introductions to Registered CXO Delegates",
    ],
    popular: false,
    featured: false,
  },
  {
    id: "ecosystem",
    name: "Ecosystem & Media",
    badge: "Strategic Reach",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    icon: Globe,
    description: "Ideal for technology alliances, institutional partners, and industry associations looking for national co-marketing reach.",
    deliverables: [
      "Official Ecosystem Partner Logo on All Summit Badges",
      "Joint Social Media Promotion & Press Announcements",
      "2 VIP All-Access Executive Delegate Passes",
      "Digital Editorial Mention in Executive Talks Magazine",
      "Stage Recognition During Summit Inaugural Ceremony",
      "Access to Summit Networking & Coffee Lounges",
    ],
    popular: false,
    featured: false,
  },
];

const roadmapSteps = [
  {
    step: "01",
    title: "Submit Proposal",
    desc: "Fill our rapid 2-minute online wizard detailing your industry, target audience, and preferred summit engagement tier.",
    icon: FileText,
    color: "from-cyan-500 to-blue-600",
  },
  {
    step: "02",
    title: "Strategic Discovery",
    desc: "A 15-minute consultation with our Summit Director to align on speaking sessions, booth footprint, and bespoke deliverables.",
    icon: Target,
    color: "from-blue-600 to-indigo-600",
  },
  {
    step: "03",
    title: "Pre-Summit Activation",
    desc: "We initiate national digital PR, stage branding assets, invite matching, and announce your brand across industry channels.",
    icon: Megaphone,
    color: "from-indigo-600 to-purple-600",
  },
  {
    step: "04",
    title: "Summit Day & Lead ROI",
    desc: "Take the mainstage, host closed-door meetings in the VIP lounge, and receive qualified opt-in enterprise lead lists.",
    icon: Rocket,
    color: "from-purple-600 to-pink-600",
  },
];

const faqs = [
  {
    q: "How early should an organisation confirm summit sponsorship?",
    a: "We recommend locking in your partnership package at least 4 to 8 weeks prior to the summit date. This ensures maximum pre-event promotional reach, inclusion in printed brochures, stage backdrops, and priority speaking slot placement.",
  },
  {
    q: "Can deliverables be customized to fit our specific enterprise KPIs?",
    a: "Absolutely. While we offer standardized Title, Platinum, and Gold tiers, our summit directors actively tailor packages to include private CXO roundtables, custom demo pavilions, live podcast interviews, or tailored award co-presenting honors.",
  },
  {
    q: "How are delegate attendees qualified and verified?",
    a: "Every delegate at Executive Talks Media summits undergoes a strict professional verification process. Attendees represent C-suite executives (CEOs, CFOs, CHROs, CIOs, CTOs, CMOs) and Senior VPs with active enterprise purchasing budgets.",
  },
  {
    q: "Is speaking on stage guaranteed with our partnership package?",
    a: "Yes. Title, Platinum, and Gold packages include confirmed speaking deliverables (Keynote address, Panel discussion seat, or Fireside chat) vetted with our summit editorial board to ensure high audience engagement.",
  },
  {
    q: "How soon do we receive the post-summit lead intelligence?",
    a: "Opt-in delegate attendee lists, contact information, session attendance metrics, and high-resolution event media assets are securely delivered to your team within 48 to 72 hours post-conclave.",
  },
];

export default function PartnerWithUsPage() {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  const marqueeItems = [
    ...(filteredCollaborators.length > 0 ? filteredCollaborators : getDefaultCollaborators()),
    ...(filteredCollaborators.length > 0 ? filteredCollaborators : getDefaultCollaborators()),
    ...(filteredCollaborators.length > 0 ? filteredCollaborators : getDefaultCollaborators()),
  ];

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-cyan-500 selection:text-white font-sans overflow-x-hidden">
      <SEOHead
        pageKey="partner"
        title="Partner & Sponsor National Summits | Executive Talks Media"
        description="Explore Title, Platinum, Gold, and Technology partner opportunities with Executive Talks Media Business Intelligence to connect with 2500+ Indian enterprise CXOs."
        keywords="Partner Executive Talks Media, Summit Sponsorship, B2B Event Partner India, CXO Summit Sponsors, Executive Talks, ET Media, Event Collaboration"
        url="https://www.executivetalksmedia.in/partner"
      />
      <GlowBackdrop />

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <PageHero
        crumb="Partners"
        title="Strategic Brand & Sponsorship Alliances"
        subtitle="Position your brand in front of 2,500+ Indian CXOs, Founders, and C-Suite Decision Makers at high-impact national summits, conclaves, and industry awards."
        image={images.heroNetworking}
      />

      {/* ========================================== */}
      {/* 2. STATS BAR                               */}
      {/* ========================================== */}
      <section className="relative z-20 -mt-8 sm:-mt-10 mb-12">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl">
            <div className="p-3 sm:p-4 text-center border-r border-slate-100 last:border-none">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display">
                <Counter value={2500} suffix="+" />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                C-Suite Decision Makers
              </p>
            </div>
            <div className="p-3 sm:p-4 text-center border-r border-slate-100 last:border-none">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-cyan-600 font-display">
                <Counter value={15} suffix="+" />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                Annual Flagship Summits
              </p>
            </div>
            <div className="p-3 sm:p-4 text-center border-r border-slate-100 last:border-none">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-600 font-display">
                <Counter value={98} suffix="%" />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                Partner Renewal & ROI Rate
              </p>
            </div>
            <div className="p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 font-display">
                <Counter value={50} suffix="+" />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                Enterprise & Tech Sponsors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. FAST-TRACK WIZARD CALLOUT BANNER        */}
      {/* ========================================== */}
      <section className="py-4 sm:py-6 relative">
        <div className="container-x">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-[#0a1224] to-slate-900 p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden text-white">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-widest font-display">
                  <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                  <span>Multi-Step Partnership Wizard</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display tracking-tight leading-tight">
                  Ready to Position Your Brand in Front of India's CXOs?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
                  Submit your strategic proposal using our step-by-step full-page application wizard. Select your preferred engagement tier, custom keynote slots, or exhibition space in minutes.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/partner/apply")}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-6 py-4 text-sm font-black text-white hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl shadow-cyan-600/25 cursor-pointer"
                >
                  <span>Start Partner Application</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <a
                  href={`tel:${(contact.phones[0] ?? "+91 90000 00000").replace(/\s+/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-center"
                >
                  <Phone className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Call Alliances: {contact.phones[0] ?? "+91 90000 00000"}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. PARTNERSHIP BENEFITS GRID               */}
      {/* ========================================== */}
      <section id="benefits" className="py-12 sm:py-16 relative bg-white">
        <div className="container-x">
          <SectionHeading
            kicker="Partnership Benefits"
            title={
              <>
                Why Partner With{" "}
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Executive Talks Media?
                </span>
              </>
            }
            description="Tailored sponsorship and strategic engagement tiers engineered for maximum brand resonance, thought leadership authority, and high-value lead acquisition."
            className="mb-10 sm:mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {partnershipBenefits.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07, duration: 0.4 }}
                className="group relative rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 shadow-xs hover:shadow-xl hover:border-cyan-500/50 hover:bg-white transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md shadow-cyan-500/10 group-hover:scale-110 transition-transform`}
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
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-700 transition-colors font-display">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans font-medium">
                    {item.description}
                  </p>
                </div>

                {/* Perk List */}
                <div className="mt-6 pt-5 border-t border-slate-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Key Highlights
                  </div>
                  <ul className="space-y-2.5">
                    {item.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
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
      {/* 5. SPONSORSHIP TIERS MATRIX                */}
      {/* ========================================== */}
      <section id="tiers" className="py-12 sm:py-16 relative bg-slate-50/80 border-y border-slate-200">
        <div className="container-x">
          <SectionHeading
            kicker="Sponsorship Packages"
            title={
              <>
                Tailored{" "}
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Engagement Tiers
                </span>
              </>
            }
            description="Choose the tier that aligns with your brand's quarterly growth objectives, or consult our summit directors for bespoke custom activations."
            className="mb-10 sm:mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipTiers.map((tier, idx) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className={`relative rounded-3xl bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 flex flex-col justify-between border ${
                  tier.featured
                    ? "border-amber-400/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20"
                    : tier.popular
                    ? "border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/20"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Popular / Featured Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${tier.gradient} text-white shadow-xs`}>
                    <tier.icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-display">
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                    {tier.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Package Inclusions
                    </div>
                    <ul className="space-y-2.5">
                      {tier.deliverables.map((deliv, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                          <Check className="h-3.5 w-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/partner/apply")}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition-all cursor-pointer ${
                      tier.featured
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20 hover:scale-[1.02]"
                        : tier.popular
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20 hover:scale-[1.02]"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    <span>Apply for {tier.name}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. 4-STEP PARTNERSHIP ROADMAP              */}
      {/* ========================================== */}
      <section className="py-12 sm:py-16 relative bg-white">
        <div className="container-x">
          <SectionHeading
            kicker="Partnership Roadmap"
            title={
              <>
                How Collaboration{" "}
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Works
                </span>
              </>
            }
            description="A structured, frictionless onboarding experience from initial discovery to live summit execution and verified lead delivery."
            className="mb-10 sm:mb-12"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="relative rounded-3xl border border-slate-200 bg-slate-50/50 p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-cyan-500/40 hover:bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-300 font-display">
                      {step.step}
                    </span>
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-xs`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-cyan-700">
                  <span>Step {step.step} Deliverable</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 7. OUR COLLABORATORS ANIMATED MARQUEE      */}
      {/* ========================================== */}
      <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-200 overflow-hidden relative">
        <div className="container-x mb-8 text-center">
          <SectionHeading
            kicker="Trusted Ecosystem"
            title={
              <>
                Our Collaborators &{" "}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Brand Partners
                </span>
              </>
            }
            description="Honoured to collaborate with world-class enterprise brands, tech pioneers, and strategic institutions across India."
            align="center"
            className="mb-8"
          />

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20 border-transparent"
                    : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Continuous Animated Marquee */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-36 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-36 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10" />

          <motion.div
            className="flex items-center gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 28,
            }}
          >
            {marqueeItems.map((collab, index) => (
              <div
                key={`${collab.id}-${index}`}
                className="group relative flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-cyan-500/60 transition-all shrink-0 min-w-[220px]"
              >
                {/* Logo Image Box */}
                <div className="h-24 w-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-3 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-cyan-200 transition-colors">
                  <img
                    src={collab.logo}
                    alt={collab.brand_name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Brand Name & Category */}
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
      {/* 8. FREQUENTLY ASKED QUESTIONS (ACCORDION)  */}
      {/* ========================================== */}
      <section className="py-12 sm:py-16 relative bg-white">
        <div className="container-x max-w-4xl">
          <SectionHeading
            kicker="Got Questions?"
            title={
              <>
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </>
            }
            description="Find clear answers regarding summit sponsorships, custom packages, and lead handovers."
            align="center"
            className="mb-10 text-center"
          />

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-cyan-600 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans font-medium border-t border-slate-200/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 9. BOTTOM HIGH-CONVERSION CTA BANNER       */}
      {/* ========================================== */}
      <section className="py-12 sm:py-16 relative">
        <div className="container-x">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-[#0B1528] to-slate-950 p-8 sm:p-14 overflow-hidden relative shadow-2xl text-center text-white">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-widest font-display">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Executive Talks Media Alliances</span>
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight tracking-tight">
                Scale Your Enterprise Authority Across India's C-Suite
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
                Join India's most respected enterprise leaders, tech innovators, and industry pioneers. Reserve your summit partnership package or request a custom proposal today.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/partner/apply")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-8 py-4 text-sm font-black text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-600/30 cursor-pointer"
                >
                  <span>Start Partner Application</span>
                  <ArrowUpRight className="h-5 w-5" />
                </button>

                <a
                  href={`mailto:${contact.emails[2] ?? contact.emails[0] ?? "partnerships@executivetalks.in"}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-8 py-4 text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all text-center"
                >
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span>Email: {contact.emails[2] ?? contact.emails[0] ?? "partnerships@executivetalks.in"}</span>
                </a>
              </div>

              <div className="pt-4 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-4">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  Verified CXO Audience
                </span>
                <span>•</span>
                <span>Exclusive Category Sponsorships</span>
                <span>•</span>
                <span>Full PR Syndication</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
