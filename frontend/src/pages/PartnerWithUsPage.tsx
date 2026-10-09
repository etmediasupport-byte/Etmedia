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
  ArrowRight,
  Headphones,
  Radio,
  Tv,
  Presentation,
  CheckCircle,
} from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { GlowBackdrop, Reveal, Counter, SectionHeading } from "@/components/site/primitives";
import { SEOHead } from "@/components/site/SEOHead";
import { socket } from "@/lib/socket";
import { Collaborator, getDefaultCollaborators, images, contact } from "@/lib/site-data";
import { MagneticButton } from "@/components/ui/MagneticButton";

const whyPartnerReasons = [
  {
    title: "Targeted Audience Access",
    desc: "Connect with HR leaders, CFOs, GCC leaders, procurement heads, facility leaders, CXOs and other corporate decision-makers.",
    icon: Users,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Quality Business Leads",
    desc: "Engage with relevant prospects, explore potential customers and identify new business opportunities through targeted networking and event participation.",
    icon: Target,
    color: "from-blue-600 to-indigo-600",
  },
  {
    title: "Better ROI Opportunities",
    desc: "Maximize the value of your partnership investment through strategic brand visibility, audience engagement and business development opportunities.",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Strategic Brand Positioning",
    desc: "Build your brand presence through customized branding opportunities aligned with your brand identity, marketing objectives and target audience.",
    icon: Sparkles,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Thought Leadership",
    desc: "Position your organization as an industry contributor through keynote presentations, panel discussions, leadership talks and expert sessions.",
    icon: Mic,
    color: "from-purple-600 to-indigo-600",
  },
  {
    title: "Product & Service Showcase",
    desc: "Demonstrate your solutions through presentations, exhibition stalls, product displays and dedicated discussion spaces, subject to event availability.",
    icon: Rocket,
    color: "from-pink-600 to-rose-600",
  },
  {
    title: "PR & Media Exposure",
    desc: "Enhance your brand visibility through press releases, PR coverage, digital media platforms and Executive Talks Magazine features.",
    icon: Newspaper,
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Digital Promotions",
    desc: "Promote your brand through LinkedIn campaigns, social media promotions, event announcements and our own digital media platforms.",
    icon: Megaphone,
    color: "from-violet-600 to-purple-600",
  },
  {
    title: "Business Networking",
    desc: "Build meaningful relationships with potential clients, industry leaders, corporate decision-makers and strategic partners.",
    icon: Handshake,
    color: "from-teal-600 to-emerald-600",
  },
  {
    title: "Post-Event Support",
    desc: "Continue the conversation beyond the event through agreed post-event reports, lead follow-up assistance and business engagement support, depending on selected package.",
    icon: ShieldCheck,
    color: "from-cyan-600 to-blue-700",
  },
  {
    title: "Customized Deliverables",
    desc: "Choose partnership benefits that suit your business objectives, marketing priorities, budget and event participation requirements.",
    icon: Layers,
    color: "from-orange-500 to-red-600",
  },
];

const partnershipOpportunities = [
  {
    name: "Title Partner",
    badge: "Top Tier",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    icon: Crown,
    desc: "Premium brand positioning and prominent association with selected events.",
    featured: true,
  },
  {
    name: "Platinum Partner",
    badge: "Premier",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-300",
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    icon: Star,
    desc: "Enhanced brand visibility, leadership engagement and premium promotional opportunities.",
    popular: true,
  },
  {
    name: "Gold Partner",
    badge: "High ROI",
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-300",
    gradient: "from-indigo-500 via-purple-600 to-pink-600",
    icon: Target,
    desc: "Brand promotion, networking access and opportunities to showcase your solutions.",
  },
  {
    name: "Silver Partner",
    badge: "Engagement",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    gradient: "from-slate-500 to-slate-700",
    icon: Award,
    desc: "Brand visibility and engagement opportunities with industry professionals.",
  },
  {
    name: "Bronze Partner",
    badge: "Introduction",
    badgeColor: "bg-amber-50/70 text-amber-900 border-amber-200",
    gradient: "from-amber-600 to-amber-800",
    icon: Handshake,
    desc: "An opportunity to introduce your brand to a targeted corporate audience.",
  },
  {
    name: "Exhibition Partner",
    badge: "Showcase",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
    gradient: "from-emerald-500 to-teal-600",
    icon: Building2,
    desc: "Showcase your products and services through dedicated exhibition or discussion space.",
  },
  {
    name: "Strategic Partnership",
    badge: "Custom Alliance",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-300",
    gradient: "from-purple-600 to-indigo-700",
    icon: Globe,
    desc: "Explore customized collaborations designed around specific business and marketing objectives.",
  },
];

const industryPlatforms = [
  "Finance & CFO Leadership",
  "Human Resources (HR) Leadership",
  "Global Capability Centres (GCC)",
  "Procurement & Supply Chain",
  "Administration & Corporate Real Estate (CRE)",
  "Facility Management",
  "Medical & Healthcare",
];

const mediaPromotionalPlatforms = [
  {
    title: "PR and Digital Media Coverage",
    desc: "Extensive press releases and coverage across relevant news platforms.",
    icon: Newspaper,
  },
  {
    title: "LinkedIn & Social Media Campaigns",
    desc: "Targeted executive outreach, event announcements, and brand spotlight posts.",
    icon: Megaphone,
  },
  {
    title: "Executive Talks Magazine",
    desc: "Thought leadership articles, cover features, and print/digital distribution.",
    icon: FileText,
  },
  {
    title: "Leadership Interviews & Podcasts",
    desc: "Featured executive conversations, video interviews, and broadcast series.",
    icon: Mic,
  },
  {
    title: "Stage & Backdrop Branding",
    desc: "Event website, mainstage LED backdrop, and venue entrance visibility.",
    icon: Tv,
  },
  {
    title: "Digital Screen & Exhibition Visibility",
    desc: "High-footfall digital displays, discussion booths, and stall spaces.",
    icon: Presentation,
  },
  {
    title: "Email Campaigns & Event Comms",
    desc: "Direct communication with registered delegates and executive mailing lists.",
    icon: Mail,
  },
  {
    title: "Product & Service Presentations",
    desc: "Dedicated time on stage or demo zones to present corporate solutions.",
    icon: Rocket,
  },
];

export default function PartnerWithUsPage() {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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

  const partnerList = filteredCollaborators.length > 0 ? filteredCollaborators : getDefaultCollaborators();
  const marqueeItems = [...partnerList, ...partnerList, ...partnerList, ...partnerList];

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-cyan-500 selection:text-white font-sans overflow-x-hidden">
      <SEOHead
        pageKey="partner"
        title="Partner With Us | Executive Talks Media Business Intelligence"
        description="Build Connections. Amplify Your Brand. Create Business Opportunities with Executive Talks Media Business Intelligence."
        keywords="Partner Executive Talks Media, Sponsorship Opportunities, B2B Event Partner India, CXO Summit Sponsors, Executive Talks Magazine, Srikanth Adusumalli"
        url="https://www.executivetalksmedia.in/partner"
      />
      <GlowBackdrop />

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <PageHero
        crumb="Partner With Us"
        title="Build Connections. Amplify Your Brand. Create Business Opportunities."
        subtitle="At Executive Talks Media Business Intelligence, we connect industry leaders, C-suite executives, corporate decision-makers and influential professionals through industry-focused conferences, leadership summits, corporate awards and media platforms."
        image={images.heroNetworking}
      />

      {/* ========================================== */}
      {/* 2. STATS BAR                               */}
      {/* ========================================== */}
      <section className="relative z-20 -mt-5 sm:-mt-6 mb-3">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 sm:p-4.5 rounded-3xl bg-white border border-slate-200/90 shadow-md">
            <div className="flex items-center gap-3 px-2 border-r border-slate-100 last:border-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-display leading-none">
                  <Counter value={50000} suffix="+" />
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  C-Suite Decision Makers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 border-r border-slate-100 last:border-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600 font-display leading-none">
                  <Counter value={100} suffix="+" />
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  National Summits Hosted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 border-r border-slate-100 last:border-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 font-display leading-none">
                  <Counter value={98} suffix="%" />
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Partner Renewal & ROI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-600 font-display leading-none">
                  <Counter value={500} suffix="+" />
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Brand Sponsors & Partners
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. PARTNERSHIP OVERVIEW NARRATIVE          */}
      {/* ========================================== */}
      <section className="py-8 sm:py-10 bg-slate-50/60 border-b border-slate-200/90">
        <div className="container-x max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-extrabold uppercase tracking-widest font-btn">
            <Zap className="h-3 w-3 text-cyan-600" />
            <span>Executive Talks Media Alliances</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight leading-snug">
            Partner With Purpose. Expand With Authority.
          </h2>
          <div className="text-slate-600 space-y-3 leading-relaxed text-xs sm:text-sm font-sans font-medium text-justify">
            <p>
              Our partnership programs are designed to help organizations strengthen brand visibility, showcase products and services, generate quality business leads, establish thought leadership and build valuable corporate relationships.
            </p>
            <p>
              Whether your objective is brand promotion, market expansion, lead generation or strategic networking, we work with you to develop partnership opportunities aligned with your business goals.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/partner/apply")}
              className="gradient-brand inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:scale-105 transition-all cursor-pointer border-none"
            >
              <span>Apply for Partnership</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <a
              href="mailto:srikanth@executivetalksmedia.in"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-slate-800 transition-all shadow-2xs"
            >
              <Mail className="h-3.5 w-3.5 text-cyan-600" />
              <span>Contact Alliances Desk</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. WHY PARTNER WITH EXECUTIVE TALKS MEDIA? */}
      {/* ========================================== */}
      <section id="why-partner" className="py-12 sm:py-16 bg-white border-b border-slate-200/90">
        <div className="container-x">
          <SectionHeading
            kicker="Value Proposition"
            title="Why Partner With Executive Talks Media?"
            description="Proven enterprise partnership benefits engineered to position your solutions directly before active C-Suite decision makers."
            align="left"
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {whyPartnerReasons.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  className="group relative rounded-3xl border border-slate-200/90 bg-slate-50/50 p-5 shadow-2xs hover:shadow-xl hover:border-cyan-400 hover:bg-white transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-xs w-fit mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComp className="h-4.5 w-4.5" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-600 transition-colors font-display leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans font-medium text-justify">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-bold text-cyan-700">
                    <CheckCircle className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Key Deliverable</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. OUR PARTNERSHIP OPPORTUNITIES (TIERS)   */}
      {/* ========================================== */}
      <section id="opportunities" className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-200/90">
        <div className="container-x">
          <SectionHeading
            kicker="Packages & Categories"
            title="Our Partnership Opportunities"
            description="We offer flexible partnership categories to accommodate different business objectives, branding requirements and investment levels."
            align="left"
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {partnershipOpportunities.map((tier, idx) => {
              const IconComp = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`rounded-3xl bg-white p-5 shadow-xs transition-all duration-300 flex flex-col justify-between border ${
                    tier.featured
                      ? "border-amber-400 shadow-md shadow-amber-500/10 ring-2 ring-amber-400/20"
                      : tier.popular
                      ? "border-cyan-500 shadow-md shadow-cyan-500/10 ring-2 ring-cyan-500/20"
                      : "border-slate-200/90 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                        {tier.badge}
                      </span>
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${tier.gradient} text-white shadow-xs`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display">
                      {tier.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium text-justify">
                      {tier.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => navigate("/partner/apply")}
                      className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-extrabold transition-all cursor-pointer ${
                        tier.featured
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:scale-[1.02]"
                          : tier.popular
                          ? "gradient-brand text-white shadow-md hover:scale-[1.02]"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      <span>Apply for {tier.name}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 italic">
            * Partnership benefits, speaking opportunities, branding placements and investment levels vary by event and category.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. OUR INDUSTRY PLATFORMS                  */}
      {/* ========================================== */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200/90">
        <div className="container-x">
          <SectionHeading
            kicker="Sectors Covered"
            title="Our Industry Platforms"
            description="Partner with us across high-level conferences and leadership summits covering key corporate disciplines:"
            align="left"
          />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {industryPlatforms.map((platform, idx) => (
              <div
                key={platform}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-cyan-50/40 hover:border-cyan-300 transition-all shadow-2xs"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                  {platform}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 7. OUR MEDIA & PROMOTIONAL PLATFORMS       */}
      {/* ========================================== */}
      <section className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-200/90">
        <div className="container-x">
          <SectionHeading
            kicker="Amplification Channels"
            title="Our Media & Promotional Platforms"
            description="We extend brand visibility beyond the event through a comprehensive range of promotional opportunities:"
            align="left"
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mediaPromotionalPlatforms.map((promo, idx) => {
              const IconComp = promo.icon;
              return (
                <div
                  key={promo.title}
                  className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-cyan-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 mb-3">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      {promo.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium text-justify">
                      {promo.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 8. FROM BRAND VISIBILITY TO OPPORTUNITIES  */}
      {/* ========================================== */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200/90">
        <div className="container-x max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-extrabold uppercase tracking-widest font-btn">
            <Handshake className="h-3 w-3 text-purple-600" />
            <span>Strategic Impact</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-slate-900 tracking-tight">
            From Brand Visibility to Business Opportunities
          </h2>

          <div className="text-slate-600 space-y-3.5 leading-relaxed text-xs sm:text-sm font-sans font-medium text-justify max-w-3xl mx-auto">
            <p>
              Our objective is to create meaningful connections between partner organizations and relevant business audiences.
            </p>
            <p>
              Through focused events, leadership engagement, networking opportunities and promotional support, we help partners build awareness, initiate commercial conversations and explore potential business relationships.
            </p>
            <p>
              We understand that every organization has different goals. Our team works with partners to identify suitable deliverables and develop a customized approach based on business priorities and event availability.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 9. COLLABORATORS & BRAND PARTNERS MARQUEE  */}
      {/* ========================================== */}
      <section className="py-8 sm:py-10 bg-slate-50/70 border-b border-slate-200/90 overflow-hidden relative">
        <div className="container-x mb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-3 py-0.5 text-[11px] font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn shadow-2xs">
                <Sparkles className="h-3 w-3 text-cyan-600 animate-pulse" />
                <span>Trusted Ecosystem</span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl lg:text-[1.85rem] font-extrabold font-display text-slate-900 tracking-tight leading-snug text-left">
                Our Collaborators & Brand Partners
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "gradient-brand text-white shadow-xs border-transparent"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-hidden py-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10" />

          <motion.div
            className="flex items-center gap-3.5 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 32,
            }}
          >
            {marqueeItems.map((collab, index) => (
              <div
                key={`${collab.id}-${index}`}
                className="group relative flex flex-col items-center justify-center text-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs hover:shadow-lg hover:border-cyan-400 transition-all shrink-0 min-w-[180px]"
              >
                <div className="h-16 w-36 rounded-xl overflow-hidden bg-white border border-slate-100 p-2 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-cyan-200 transition-colors">
                  <img
                    src={collab.logo}
                    alt={collab.brand_name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                <div className="flex flex-col items-center text-center">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-cyan-600 transition-colors font-display line-clamp-1 flex items-center justify-center gap-1">
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
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
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
      {/* 10. LET'S BUILD A SUCCESSFUL PARTNERSHIP   */}
      {/* ========================================== */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200/90 relative overflow-hidden">
        <div className="container-x max-w-5xl mx-auto">
          <div className="rounded-3xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50/40 via-white to-blue-50/40 p-8 sm:p-10 shadow-lg relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-bold uppercase tracking-widest">
                  <Handshake className="h-3.5 w-3.5" />
                  <span>Executive Alliances</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight leading-snug">
                  Let's Build a Successful Partnership
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans font-medium text-justify">
                  Are you looking to strengthen your brand, connect with corporate decision-makers, showcase your solutions or explore new business opportunities?
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Partner with Executive Talks Media Business Intelligence and take your brand closer to the people who matter to your business. Contact us to discuss available partnership packages, investment options and customized deliverables.
                </p>
                <p className="text-xs sm:text-sm font-bold text-cyan-700 italic pt-1">
                  Connect with Leaders. Amplify Your Brand. Grow Your Business.
                </p>
              </div>

              {/* Direct Leadership Contact Card */}
              <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-md text-left space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="text-lg font-extrabold text-slate-900 font-display">
                    Srikanth Adusumalli
                  </div>
                  <div className="text-xs font-bold text-cyan-600 font-sans">
                    Vice President – Group
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    Executive Talks Media Business Intelligence
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <a
                    href="tel:+919100266777"
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 text-slate-800 font-semibold transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-white">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Direct Phone</div>
                      <div className="text-xs font-bold text-slate-900">+91 91002 66777</div>
                    </div>
                  </a>

                  <a
                    href="mailto:srikanth@executivetalksmedia.in"
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 text-slate-800 font-semibold transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-white">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Official Email</div>
                      <div className="text-xs font-bold text-slate-900">srikanth@executivetalksmedia.in</div>
                    </div>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/partner/apply")}
                    className="w-full gradient-brand inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-extrabold text-white shadow-md hover:scale-[1.02] transition-transform cursor-pointer border-none"
                  >
                    <span>Apply for Summit Partnership</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
