import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Building2,
  Compass,
  Crown,
  Eye,
  Handshake,
  HeartHandshake,
  Linkedin,
  Megaphone,
  Rocket,
  Sparkles,
  Target,
  Users,
  Globe,
  TrendingUp,
  ShieldCheck,
  Check,
  ArrowRight,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { images, stats } from "@/lib/site-data";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading, GlowBackdrop } from "@/components/site/primitives";
import { SEOHead } from "@/components/site/SEOHead";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ImageZoomCard } from "@/components/ui/ImageZoomCard";
import { FloatingShapes } from "@/components/ui/FloatingShapes";
import { Timeline } from "@/components/site/Timeline";

const pillars = [
  {
    icon: Target,
    kicker: "Purpose",
    title: "Our Mission",
    body: "To engineer India's most credible and commercially transformative business intelligence platforms — where C-Suite leaders engage in decisive dialogue that directly drives enterprise scale.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Eye,
    kicker: "Future",
    title: "Our Vision",
    body: "A connected, benchmark corporate ecosystem where every forward-thinking enterprise has direct access to the right decision-makers, curated rooms, and national media amplification.",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: HeartHandshake,
    kicker: "Foundation",
    title: "Core Values",
    body: "Uncompromising integrity in delegate curation, benchmark operational execution, profound respect for executive time, and lasting corporate alliances over transactional relationships.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const whatWeDoSteps = [
  {
    step: "01",
    title: "C-Suite Summits & Conclaves",
    desc: "Flagship national leadership summits uniting CXOs, board directors, and policymakers for strategic industry intelligence.",
    icon: Crown,
    gradient: "from-cyan-500 to-blue-600",
    tag: "Flagship Format",
  },
  {
    step: "02",
    title: "Executive Networking Platforms",
    desc: "Exclusive, closed-door boardroom roundtables and private dinners curated for senior enterprise leaders to build long-term ties.",
    icon: Users,
    gradient: "from-purple-500 to-indigo-600",
    tag: "By Invitation Only",
  },
  {
    step: "03",
    title: "National Industry Awards",
    desc: "Rigorous, benchmark recognition programs honoring visionary enterprises, transformative CFOs, HR pioneers, and tech innovators.",
    icon: Award,
    gradient: "from-blue-500 to-cyan-600",
    tag: "Benchmarking",
  },
  {
    step: "04",
    title: "Product & Solution Launches",
    desc: "High-impact enterprise unveiling platforms designed to present breakthrough technology directly to qualified buyers.",
    icon: Rocket,
    gradient: "from-emerald-500 to-teal-600",
    tag: "Commercial Reach",
  },
  {
    step: "05",
    title: "Executive Talks Magazine",
    desc: "Year-round thought leadership, leader profile covers, and specialized industry intelligence reports across print and digital media.",
    icon: Megaphone,
    gradient: "from-pink-500 to-purple-600",
    tag: "Media Intelligence",
  },
  {
    step: "06",
    title: "Masterclasses & Roundtables",
    desc: "Deep-dive workshops and practical governance masterclasses led by industry practitioners and global domain consultants.",
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-600",
    tag: "Knowledge Transfer",
  },
  {
    step: "07",
    title: "GCC & Innovation Alliances",
    desc: "Dedicated initiatives bridging India's Global Capability Centers, Fortune 500 enterprises, and high-growth technology pioneers.",
    icon: Sparkles,
    gradient: "from-cyan-600 to-indigo-600",
    tag: "Tech Ecosystem",
  },
  {
    step: "08",
    title: "B2B Enterprise Matchmaking",
    desc: "Pre-scheduled 1-on-1 commercial introductions engineered to convert initial introductions into multi-crore enterprise contracts.",
    icon: Handshake,
    gradient: "from-blue-600 to-purple-600",
    tag: "ROI Driven",
  },
];

const industrySectors = [
  { name: "Manufacturing & Industry 4.0", count: "12+ Summits" },
  { name: "BFSI, FinTech & CFO Leadership", count: "18+ Summits" },
  { name: "Healthcare & Life Sciences", count: "8+ Summits" },
  { name: "GCCs & Global Tech Capability", count: "14+ Summits" },
  { name: "Supply Chain & Logistics", count: "10+ Summits" },
  { name: "HR, Talent & Work Tech", count: "16+ Summits" },
  { name: "Enterprise AI & Cloud Security", count: "15+ Summits" },
  { name: "Energy & Sustainable Infrastructure", count: "6+ Summits" },
];

const team = [
  {
    name: "Srinivas Reddy",
    role: "Founder & Managing Director",
    bio: "Over 15 years driving high-impact corporate summits, executive networking conclaves, and strategic business intelligence platforms across India.",
    image: images.aboutOffice,
  },
  {
    name: "Kavya Menon",
    role: "Director — Conferences & Operations",
    bio: "Specializing in large-scale event governance, national venue partnerships, and seamless delegate experience architecture.",
    image: images.eventHr,
  },
  {
    name: "Arjun Nair",
    role: "Head of Corporate Alliances",
    bio: "Structuring bespoke commercial sponsorships, enterprise exhibition rights, and multi-channel brand positioning for Fortune 500 partners.",
    image: images.eventCfo,
  },
  {
    name: "Priya Sharma",
    role: "Editor-in-Chief, Executive Talks",
    bio: "Curating C-Suite interviews, investigative corporate research reports, and benchmark coverage in Executive Talks Magazine.",
    image: images.magazineCover,
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-cyan-500 selection:text-white font-sans">
      <SEOHead
        pageKey="about"
        title="About Us | Executive Talks Media Business Intelligence"
        description="Discover how Executive Talks Media Business Intelligence curates premier C-Suite leadership summits, national awards, and executive intelligence platforms connecting 50,000+ corporate leaders."
        keywords="About Executive Talks Media, Executive Talks Media B2B Summits, CXO Conferences India, Business Intelligence Platforms, Executive Talks Magazine, Hyderabad Corporate Headquarters"
        url="https://www.executivetalksmedia.in/about"
      />
      <GlowBackdrop />

      {/* Hero Section */}
      <PageHero
        crumb="About Us"
        title="Building the Platforms Where Indian Business Leadership Meets"
        subtitle="Executive Talks Media Business Intelligence is a corporate media and conference enterprise curating national leadership summits, executive recognition conclaves, and actionable business intelligence."
        image={images.heroLeadership}
      />

      {/* ========================================================= */}
      {/* 1. KEY IMPACT METRICS STRIP                               */}
      {/* ========================================================= */}
      <section className="border-y border-slate-200/90 bg-white py-6 shadow-2xs relative z-20">
        <div className="container-x">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80">
            <div className="flex items-center gap-4 px-3 py-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 shadow-2xs">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                  <CountUpNumber value={50000} suffix="+" />
                </div>
                <div className="text-xs font-bold text-slate-600 font-sans mt-0.5">
                  Executive Delegates Connected
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-3 py-1 pt-4 lg:pt-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 shadow-2xs">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                  <CountUpNumber value={100} suffix="+" />
                </div>
                <div className="text-xs font-bold text-slate-600 font-sans mt-0.5">
                  Conferences & Summits Hosted
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-3 py-1 pt-4 lg:pt-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                  <CountUpNumber value={500} suffix="+" />
                </div>
                <div className="text-xs font-bold text-slate-600 font-sans mt-0.5">
                  Enterprise Brand Partners & GCCs
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-3 py-1 pt-4 lg:pt-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                  <CountUpNumber value={8} suffix="+" />
                </div>
                <div className="text-xs font-bold text-slate-600 font-sans mt-0.5">
                  Pan-India Conference Hubs
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. OUR STORY & FOUNDATION SECTION                         */}
      {/* ========================================================= */}
      <section className="py-10 sm:py-14 relative overflow-hidden bg-slate-50/50">
        <FloatingShapes />
        <div className="container-x relative z-10 grid items-center gap-10 lg:grid-cols-12">
          
          {/* Left Gallery (5 cols) */}
          <div className="lg:col-span-5">
            <Reveal>
              <div className="relative">
                <div className="grid grid-cols-2 gap-3.5">
                  {[images.aboutOffice, images.heroNetworking, images.eventHr, images.heroSummit].map(
                    (src, i) => (
                      <ImageZoomCard
                        key={i}
                        src={src}
                        alt="Executive Talks Media conferences and summits"
                        className={`h-44 sm:h-52 w-full rounded-2xl shadow-md border border-slate-200/80 ${
                          i % 2 === 1 ? "mt-4" : ""
                        }`}
                      />
                    )
                  )}
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-2 sm:bottom-4 sm:right-4 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 border border-slate-200 shadow-xl max-w-[200px] z-20">
                  <div className="flex items-center gap-2 text-cyan-700 font-extrabold text-[11px] uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Premier Media House</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    Connecting Indian Business Leadership
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Reveal delay={0.08}>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-3 py-0.5 text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn shadow-2xs">
                <Sparkles className="h-3 w-3 text-cyan-600 animate-pulse" />
                <span>Our Heritage & Purpose</span>
              </div>
              
              <h2 className="mt-1.5 text-2xl sm:text-3xl lg:text-[2.2rem] font-extrabold font-display text-slate-900 tracking-tight leading-snug text-left">
                Built On Conversations That Transform Enterprise Strategy
              </h2>

              <div className="text-slate-600 space-y-3 leading-relaxed text-xs sm:text-sm font-sans font-medium text-justify">
                <p>
                  Executive Talks Media Business Intelligence was established on a singular premise: India's most critical business intelligence and leadership insights should not remain siloed behind closed doors. We engineer platforms where decision-makers engage in open, transparent dialogue that translates directly into measurable corporate growth.
                </p>
                <p>
                  Headquartered in Hyderabad with a pan-India footprint, our teams curate flagship summits across <strong className="text-slate-900">Finance & CFO Leadership, Human Resources, Supply Chain, Manufacturing 4.0, Information Security</strong>, and the rapidly growing <strong className="text-slate-900">Global Capability Center (GCC) ecosystem</strong>.
                </p>
                <p>
                  Every conference is meticulously architected around researched market agendas, verified C-Suite delegate profiles, and practitioner speakers who have built and scaled world-class enterprises.
                </p>
              </div>

              {/* Core Strengths Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>100% Curated & Verified C-Suite Attendees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>Researched Content & Practitioner Keynotes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>High-ROI 1-on-1 Commercial Introductions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>360° Media Amplification via Executive Magazine</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-3">
                <MagneticButton strength={15}>
                  <Link
                    to="/events"
                    className="gradient-brand inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:scale-105 transition-transform cursor-pointer"
                  >
                    <span>Explore Upcoming Summits</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </MagneticButton>

                <MagneticButton strength={15}>
                  <Link
                    to="/partner"
                    className="hover:bg-slate-100 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-extrabold text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>Partner With Us</span>
                  </Link>
                </MagneticButton>
              </div>
            </Reveal>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. MISSION, VISION & CORE VALUES PILLARS                  */}
      {/* ========================================================= */}
      <section className="py-10 sm:py-14 bg-white border-y border-slate-200/90 relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading
            kicker="Guiding Principles"
            title="Mission, Vision & Core Values"
            description="The foundational pillars that guide our curation, execution, and long-term corporate partnerships."
            align="left"
          />

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => {
              const IconComp = p.icon;
              return (
                <Reveal key={p.title} delay={i * 0.08}>
                  <MouseTiltCard
                    maxTilt={10}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-sm hover:shadow-xl hover:border-cyan-400 transition-all duration-300 h-full overflow-hidden"
                  >
                    {/* Corner Accent Glow */}
                    <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-colors pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${p.gradient} text-white shadow-md group-hover:scale-105 transition-transform`}>
                          <IconComp className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10.5px] font-extrabold tracking-wider text-slate-700 uppercase border border-slate-200">
                          {p.kicker}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold font-display text-slate-900 group-hover:text-cyan-600 transition-colors">
                        {p.title}
                      </h3>

                      <p className="mt-3 text-slate-600 text-xs sm:text-sm leading-relaxed font-sans font-medium text-justify">
                        {p.body}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-cyan-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                      <span>Executive Commitment</span>
                    </div>
                  </MouseTiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. WHAT WE DO: 8 PLATFORM FORMATS                         */}
      {/* ========================================================= */}
      <section className="py-10 sm:py-14 bg-slate-50/70 border-b border-slate-200/90 relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading
            kicker="Our Ecosystem"
            title="Eight Ways We Put Your Brand In The Right Room"
            description="Our proven conference and media ecosystem engineered to connect decision makers with high-value commercial outcomes."
            align="left"
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDoSteps.map((step, i) => {
              const IconComp = step.icon;
              return (
                <Reveal key={step.title} delay={i * 0.04}>
                  <MouseTiltCard
                    maxTilt={8}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-cyan-400 transition-all duration-300 h-full"
                  >
                    <div>
                      {/* Top Row */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-black font-display tracking-widest text-cyan-700 bg-cyan-50 border border-cyan-200/70 rounded-full px-2.5 py-0.5">
                          STEP {step.step}
                        </span>
                        <div className={`p-2.5 rounded-2xl text-white bg-gradient-to-r shadow-xs group-hover:scale-110 transition-transform ${step.gradient}`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">
                        {step.tag}
                      </div>

                      <h3 className="mt-1 text-base font-bold font-display text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-slate-600 text-xs leading-relaxed font-sans font-medium text-justify">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-cyan-600 transition-colors">
                      <span>Explore Capability</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </MouseTiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. INDUSTRIES WE EMPOWER                                  */}
      {/* ========================================================= */}
      <section className="py-10 sm:py-14 bg-white border-b border-slate-200/90 relative overflow-hidden">
        <div className="container-x relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-3 py-0.5 text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn shadow-2xs">
                <Layers className="h-3 w-3 text-cyan-600" />
                <span>Sector Specialization</span>
              </div>
              <h2 className="mt-1.5 text-xl sm:text-2xl lg:text-[1.85rem] font-extrabold font-display text-slate-900 tracking-tight leading-snug text-left">
                Industry Sectors We Empower
              </h2>
              <p className="mt-1 text-slate-600 text-xs sm:text-sm font-sans font-medium text-left">
                Specialized leadership conclaves tailored for high-growth economic and technological sectors.
              </p>
            </div>

            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors shrink-0"
            >
              <span>View All Sector Summits</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {industrySectors.map((sector, idx) => (
              <div
                key={idx}
                className="group flex flex-col justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-cyan-50/40 hover:border-cyan-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-extrabold text-cyan-800 uppercase font-display bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                    {sector.count}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                  {sector.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. TIMELINE: MILESTONES OF GROWTH                         */}
      {/* ========================================================= */}
      <section className="py-10 sm:py-14 bg-slate-50/60 border-b border-slate-200/90 relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading
            kicker="Our Journey"
            title="Milestones of Leadership & Impact"
            description="From our first CFO summit to national leadership platforms and cross-border enterprise conclaves."
            align="left"
          />
          <div className="mt-8">
            <Timeline />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. EXECUTIVE LEADERSHIP & ADVISORY COMMITTEE              */}
      {/* ========================================================= */}
      <section className="py-10 sm:py-14 bg-white relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading
            kicker="Leadership"
            title="The Team Behind The Platforms"
            description="Our founder, leadership team, conference directors, and editorial advisory committee."
            align="left"
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <MouseTiltCard
                  maxTilt={8}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-sm hover:shadow-xl hover:border-cyan-400 transition-all duration-300 h-full"
                >
                  <div>
                    <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl border-2 border-slate-100 shadow-md group-hover:border-cyan-400 transition-colors">
                      <img
                        src={m.image}
                        alt={m.name}
                        loading="lazy"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="mt-4 text-base font-bold font-display text-slate-900 group-hover:text-cyan-600 transition-colors">
                      {m.name}
                    </h3>
                    <p className="text-cyan-700 text-xs font-bold font-sans mt-0.5">
                      {m.role}
                    </p>

                    <p className="mt-2 text-slate-600 text-[11.5px] leading-relaxed font-sans font-medium text-justify">
                      {m.bio}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100">
                    <a
                      href="https://www.linkedin.com/company/executivetalksmedia"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#0A66C2] hover:underline"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      <span>Verified Profile</span>
                    </a>
                  </div>
                </MouseTiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CLOSING EXECUTIVE CALL-TO-ACTION BANNER                */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="container-x relative z-10 max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 p-8 sm:p-12 md:p-14 text-center shadow-2xl">
            {/* Glowing Accent Orbs inside card */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-4 py-1 text-xs font-bold tracking-widest text-cyan-300 uppercase font-btn">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
                <span>Scale With Executive Talks Media</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-display !text-white tracking-tight leading-tight">
                Ready to Position Your Brand In Front of 50,000+ C-Suite Decision Makers?
              </h2>

              <p className="!text-slate-200 text-xs sm:text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
                Partner with India's premier business intelligence media house. Explore bespoke sponsorship packages, keynote slots, and closed-door leadership conclaves.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <MagneticButton strength={15}>
                  <Link
                    to="/events"
                    className="gradient-brand inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs sm:text-sm font-extrabold !text-white shadow-lg hover:scale-105 transition-transform"
                  >
                    <span>View 2026 Summits Calendar</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </MagneticButton>

                <MagneticButton strength={15}>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 px-8 py-3.5 text-xs sm:text-sm font-extrabold !text-white transition-colors backdrop-blur-sm"
                  >
                    <span>Connect With Alliances Team</span>
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
