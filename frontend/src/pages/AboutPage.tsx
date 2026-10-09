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
  Radio,
  Mic,
  Newspaper,
  CheckCircle2,
  MapPin,
  FileSpreadsheet,
} from "lucide-react";
import { images } from "@/lib/site-data";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading, GlowBackdrop } from "@/components/site/primitives";
import { SEOHead } from "@/components/site/SEOHead";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ImageZoomCard } from "@/components/ui/ImageZoomCard";
import { FloatingShapes } from "@/components/ui/FloatingShapes";

const industryConferences = [
  {
    title: "Finance & CFO Leadership",
    desc: "Strategic capital allocation, fiscal governance, risk frameworks, and macroeconomic insights for chief financial officers.",
    icon: TrendingUp,
    color: "from-blue-600 to-cyan-600",
    bgLight: "bg-blue-50/60 border-blue-200/80 text-blue-900",
  },
  {
    title: "Human Resources (HR) Leadership",
    desc: "Future of work architectures, executive talent retention, AI in HR, culture evolution, and organizational resilience.",
    icon: Users,
    color: "from-purple-600 to-indigo-600",
    bgLight: "bg-purple-50/60 border-purple-200/80 text-purple-900",
  },
  {
    title: "Global Capability Centres (GCC)",
    desc: "Deep-tech innovation hubs, multi-functional transformation, enterprise capability scale, and cross-border leadership.",
    icon: Globe,
    color: "from-cyan-600 to-teal-600",
    bgLight: "bg-cyan-50/60 border-cyan-200/80 text-cyan-900",
  },
  {
    title: "Procurement & Supply Chain",
    desc: "Supply chain agility, sustainable sourcing, predictive vendor networks, digital logistics, and operational continuity.",
    icon: Layers,
    color: "from-amber-600 to-orange-600",
    bgLight: "bg-amber-50/60 border-amber-200/80 text-amber-900",
  },
  {
    title: "Administration & Corporate Real Estate (CRE)",
    desc: "Modern workspace infrastructure, sustainability benchmarks, hybrid office strategies, and enterprise asset governance.",
    icon: Building2,
    color: "from-emerald-600 to-teal-600",
    bgLight: "bg-emerald-50/60 border-emerald-200/80 text-emerald-900",
  },
  {
    title: "Facility Management",
    desc: "Smart building automation, operational excellence, energy efficiency, campus health and enterprise safety compliance.",
    icon: ShieldCheck,
    color: "from-indigo-600 to-blue-600",
    bgLight: "bg-indigo-50/60 border-indigo-200/80 text-indigo-900",
  },
  {
    title: "Medical & Healthcare",
    desc: "Healthcare delivery transformation, health-tech breakthroughs, clinical leadership, and institutional patient-care ecosystems.",
    icon: HeartHandshake,
    color: "from-rose-600 to-pink-600",
    bgLight: "bg-rose-50/60 border-rose-200/80 text-rose-900",
  },
];

const mediaPlatforms = [
  {
    title: "Corporate Networking Conferences",
    desc: "Bringing industry leaders and corporate decision-makers together for high-impact knowledge exchange.",
    icon: Users,
    tag: "Networking",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    title: "Panel Discussions & Speaker Sessions",
    desc: "Encouraging meaningful conversations, visionary perspectives, and actionable knowledge sharing.",
    icon: Mic,
    tag: "Thought Leadership",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    title: "Podcasts & Leadership Interviews",
    desc: "Featuring the authentic experiences, pivotal strategies, and career insights of foremost business leaders.",
    icon: Radio,
    tag: "Media Series",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    title: "Executive Talks Magazine",
    desc: "Showcasing leadership journeys, corporate milestones, breakthrough achievements, and industry developments.",
    icon: Newspaper,
    tag: "Editorial Intelligence",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Corporate Awards & Recognition",
    desc: "Celebrating excellence, transformative innovation, industry pioneers, and outstanding business contributions.",
    icon: Award,
    tag: "National Benchmarks",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "PR & Digital Media Promotions",
    desc: "Strengthening enterprise brand visibility across authoritative national press, digital publications, and news wires.",
    icon: Megaphone,
    tag: "Multi-Channel PR",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    title: "Corporate Partnerships & Sponsorships",
    desc: "Creating strategic platforms for brands to connect seamlessly with highly relevant enterprise business audiences.",
    icon: Handshake,
    tag: "Commercial Alliances",
    gradient: "from-indigo-600 to-purple-600",
  },
];

const valueCreated = [
  {
    title: "Leadership Engagement",
    desc: "Connecting senior executives, C-suite leaders, and industry professionals in high-trust peer environments.",
    icon: Crown,
  },
  {
    title: "Industry Insights",
    desc: "Bringing emerging market trends, technological disruption, and strategic business challenges into sharp focus.",
    icon: Target,
  },
  {
    title: "Brand Visibility",
    desc: "Providing prominent, dignified opportunities to showcase premium enterprise brands, products, and services.",
    icon: Sparkles,
  },
  {
    title: "Business Networking",
    desc: "Facilitating high-value commercial connections between organizations, decision-makers, and prospective partners.",
    icon: Handshake,
  },
  {
    title: "Media Exposure",
    desc: "Extending multi-platform visibility through targeted digital campaigns, press syndication, and magazine features.",
    icon: Newspaper,
  },
];

const panIndiaCities = [
  "Hyderabad",
  "Bengaluru",
  "Mumbai",
  "Pune",
  "Visakhapatnam",
  "Vijayawada",
  "Chennai",
  "New Delhi",
  "Ahmedabad",
  "Jaipur",
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-cyan-500 selection:text-white font-sans">
      <SEOHead
        pageKey="about"
        title="About Us | Executive Talks Media Business Intelligence"
        description="Executive Talks Media Business Intelligence is a corporate events, media and business intelligence organization connecting industry leaders, C-suite executives and decision-makers."
        keywords="About Executive Talks Media, Executive Talks Media Business Intelligence, C-Suite Conferences India, CXO Summits Hyderabad, Executive Talks Magazine, Pan India Business Summits"
        url="https://www.executivetalksmedia.in/about"
      />
      <GlowBackdrop />

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <PageHero
        crumb="About Us"
        title="Executive Talks Media Business Intelligence"
        subtitle="Built on Conversations That Transform Enterprise Strategy — Connecting Leaders. Inspiring Excellence. Creating Business Opportunities."
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
                  Executive Leaders Connected
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
                  Conferences & Summits Curated
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
                  Corporate & Brand Alliances
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-3 py-1 pt-4 lg:pt-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                  <CountUpNumber value={10} suffix="+" />
                </div>
                <div className="text-xs font-bold text-slate-600 font-sans mt-0.5">
                  Pan-India Summit Destinations
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. OUR STORY & FOUNDATION SECTION                         */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 relative overflow-hidden bg-slate-50/50">
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
                <div className="absolute -bottom-4 -right-2 sm:bottom-4 sm:right-4 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 border border-slate-200 shadow-xl max-w-[220px] z-20">
                  <div className="flex items-center gap-2 text-cyan-700 font-extrabold text-[11px] uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Business Intelligence</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    Connecting Leaders. Inspiring Excellence.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Reveal delay={0.08}>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-3.5 py-0.5 text-[11px] font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn shadow-2xs">
                <Sparkles className="h-3 w-3 text-cyan-600 animate-pulse" />
                <span>Executive Talks Media Business Intelligence</span>
              </div>
              
              <h2 className="mt-2 text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold font-display text-slate-900 tracking-tight leading-snug text-left">
                Built on Conversations That Transform Enterprise Strategy
              </h2>

              <p className="text-cyan-700 font-bold text-sm sm:text-base font-sans">
                Connecting Leaders. Inspiring Excellence. Creating Business Opportunities.
              </p>

              <div className="text-slate-600 space-y-3.5 leading-relaxed text-xs sm:text-sm font-sans font-medium text-justify">
                <p>
                  <strong>Executive Talks Media Business Intelligence</strong> is a corporate events, media and business intelligence organization dedicated to connecting industry leaders, C-suite executives and business decision-makers through impactful conferences, leadership summits, corporate awards and networking platforms.
                </p>
                <p>
                  Headquartered in Hyderabad, with a growing pan-India presence, we create industry-focused platforms where business leaders exchange knowledge, explore emerging trends, discuss strategic challenges and build meaningful partnerships that drive business growth.
                </p>
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
      {/* 3. OUR INDUSTRY CONFERENCES                               */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200/90 relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading
            kicker="Domain Focus"
            title="Our Industry Conferences"
            description="We curate specialized conferences and leadership forums across key business sectors. Each conference is designed around relevant industry themes, leadership perspectives, expert discussions and practical business insights."
            align="left"
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industryConferences.map((conf, idx) => {
              const IconComp = conf.icon;
              return (
                <Reveal key={conf.title} delay={idx * 0.05}>
                  <MouseTiltCard
                    maxTilt={8}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-cyan-400 transition-all duration-300 h-full"
                  >
                    <div>
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${conf.color} text-white shadow-xs w-fit mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComp className="h-5 w-5" />
                      </div>

                      <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-cyan-600 transition-colors leading-snug">
                        {conf.title}
                      </h3>

                      <p className="mt-2 text-slate-600 text-xs leading-relaxed font-sans font-medium text-justify">
                        {conf.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-cyan-600 transition-colors">
                      <span>Explore Sector</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </MouseTiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. BEYOND CONFERENCES: MEDIA & BUSINESS PLATFORMS         */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200/90 relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading
            kicker="Our Ecosystem"
            title="Beyond Conferences: Our Media & Business Platforms"
            description="We extend leadership engagement beyond the conference stage through a range of corporate media and networking initiatives."
            align="left"
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mediaPlatforms.map((platform, idx) => {
              const IconComp = platform.icon;
              return (
                <Reveal key={platform.title} delay={idx * 0.05}>
                  <MouseTiltCard
                    maxTilt={8}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-cyan-400 transition-all duration-300 h-full"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-2xl bg-gradient-to-r ${platform.gradient} text-white shadow-xs group-hover:scale-105 transition-transform`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          {platform.tag}
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-cyan-600 transition-colors leading-snug">
                        {platform.title}
                      </h3>

                      <p className="mt-2 text-slate-600 text-xs leading-relaxed font-sans font-medium text-justify">
                        {platform.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-cyan-600 transition-colors">
                      <span>Platform Details</span>
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
      {/* 5. OUR APPROACH & THE VALUE WE CREATE                     */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200/90 relative overflow-hidden">
        <div className="container-x relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Our Approach */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-3 py-0.5 text-[11px] font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn">
                <Compass className="h-3 w-3 text-cyan-600" />
                <span>Our Philosophy</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight leading-snug">
                Our Approach
              </h2>
              <div className="text-slate-600 space-y-3 leading-relaxed text-xs sm:text-sm font-sans font-medium text-justify">
                <p>
                  We believe meaningful business conversations can lead to better decisions, stronger relationships and new opportunities. Our events and media platforms are developed with a focus on relevant industry content, expert participation, professional networking and business engagement.
                </p>
                <p>
                  Our objective is to connect organizations with the right audiences, facilitate valuable interactions and create platforms where ideas translate into opportunities.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200/70 text-xs font-semibold text-cyan-950">
                💡 Where strategic boardroom insights converge with tangible enterprise outcomes.
              </div>
            </div>

            {/* Right: The Value We Create */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-50 px-3 py-0.5 text-[11px] font-extrabold tracking-[0.15em] text-purple-800 uppercase font-btn mb-2">
                <Award className="h-3 w-3 text-purple-600" />
                <span>Tangible Impact</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight leading-snug mb-4">
                The Value We Create
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {valueCreated.map((val, i) => {
                  const IconComp = val.icon;
                  return (
                    <div
                      key={val.title}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-cyan-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500 text-white">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                          {val.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium text-justify">
                        {val.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PAN-INDIA PRESENCE                                     */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 bg-slate-50/80 border-b border-slate-200/90 relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading
            kicker="National Footprint"
            title="Our Pan-India Presence"
            description="We organize and plan events across major business destinations, bringing leaders together nationwide."
            align="left"
          />

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {panIndiaCities.map((city, idx) => (
              <div
                key={city}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-cyan-400 hover:shadow-md transition-all"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 font-display">
                    {city}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">
                    Summit Hub
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. OUR MISSION & VISION PILLARS                           */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 bg-white relative overflow-hidden border-b border-slate-200/90">
        <div className="container-x relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-4 py-1 text-xs font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn shadow-2xs">
            <Target className="h-3.5 w-3.5 text-cyan-600" />
            <span>Core Foundation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-slate-900 tracking-tight">
            Our Mission
          </h2>

          <div className="p-8 sm:p-10 rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/50 shadow-sm relative">
            <p className="text-base sm:text-lg md:text-xl text-slate-800 font-medium leading-relaxed font-sans max-w-2xl mx-auto">
              "To build influential platforms that connect leaders, encourage innovation, celebrate excellence and enable meaningful business growth through conferences, media and strategic networking."
            </p>
            <div className="mt-6 pt-4 border-t border-cyan-100 flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="font-bold text-cyan-900 text-sm font-display">Executive Talks Media Business Intelligence</span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="text-cyan-700 italic text-xs sm:text-sm">Where Leaders Connect, Ideas Evolve and Opportunities Begin.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CLOSING EXECUTIVE CALL-TO-ACTION                       */}
      {/* ========================================================= */}
      <section className="py-12 sm:py-16 bg-white relative overflow-hidden">
        <div className="container-x relative z-10 max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 p-8 sm:p-12 md:p-14 text-center shadow-2xl">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-4 py-1 text-xs font-bold tracking-widest text-cyan-300 uppercase font-btn">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
                <span>Collaborate With Us</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display !text-white tracking-tight leading-tight">
                Where Leaders Connect, Ideas Evolve and Opportunities Begin.
              </h2>

              <p className="!text-slate-200 text-xs sm:text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
                Connect with our conference advisory desk to explore upcoming summit schedules, speaker nominations, delegate registrations, and bespoke corporate partnerships.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <MagneticButton strength={15}>
                  <Link
                    to="/events"
                    className="gradient-brand inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs sm:text-sm font-extrabold !text-white shadow-lg hover:scale-105 transition-transform"
                  >
                    <span>View Upcoming Summits</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </MagneticButton>

                <MagneticButton strength={15}>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 px-8 py-3.5 text-xs sm:text-sm font-extrabold !text-white transition-colors backdrop-blur-sm"
                  >
                    <span>Connect With Advisory Desk</span>
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
