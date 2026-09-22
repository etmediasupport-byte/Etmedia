import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Globe,
  MapPin,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  Search,
  Award,
  TrendingUp,
  Compass,
  CheckCircle2,
  Activity,
  Zap,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { SectionHeading, Reveal } from "@/components/site/primitives";
import { CountUpNumber } from "@/components/ui/CountUpNumber";

type Hub = {
  id: string;
  name: string;
  region: "india" | "international";
  x: number; // percentage
  y: number; // percentage
  isHq?: boolean;
  eventsCount: string;
  delegates: string;
  focus: string;
  venue: string;
  color: string;
};

const hubs: Hub[] = [
  // INDIA HUBS
  {
    id: "hyderabad",
    name: "Hyderabad",
    region: "india",
    x: 48,
    y: 53,
    isHq: true,
    eventsCount: "6 Conclaves / Year",
    delegates: "15,000+ Leaders",
    focus: "Global HQ, HR Leadership & AI Tech Conclaves",
    venue: "HICC Novotel & HITEX City",
    color: "#00f0ff",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    region: "india",
    x: 45,
    y: 66,
    eventsCount: "4 Summits / Year",
    delegates: "12,000+ Leaders",
    focus: "CFO Summit & AI Enterprise Tech",
    venue: "The Leela Palace & Ritz-Carlton",
    color: "#3b82f6",
  },
  {
    id: "pune",
    name: "Pune",
    region: "india",
    x: 40,
    y: 52,
    eventsCount: "2 Forums / Year",
    delegates: "6,000+ Leaders",
    focus: "Smart Manufacturing & Industry 4.0",
    venue: "JW Marriott Senapati Bapat Rd",
    color: "#10b981",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "india",
    x: 37,
    y: 48,
    eventsCount: "4 Summits / Year",
    delegates: "10,000+ Leaders",
    focus: "BFSI, Capital Markets & GCC Hubs",
    venue: "St. Regis Lower Parel & Jio World Center",
    color: "#f59e0b",
  },
  {
    id: "chennai",
    name: "Chennai",
    region: "india",
    x: 52,
    y: 69,
    eventsCount: "3 Conclaves / Year",
    delegates: "8,000+ Leaders",
    focus: "Procurement, Supply Chain & Automotive",
    venue: "ITC Grand Chola Guindy",
    color: "#6366f1",
  },
  {
    id: "delhi",
    name: "Delhi NCR",
    region: "india",
    x: 45,
    y: 28,
    eventsCount: "3 Conclaves / Year",
    delegates: "9,000+ Leaders",
    focus: "National Policy, ESG & Leadership Excellence",
    venue: "Taj Palace Diplomatic Enclave",
    color: "#ec4899",
  },
  {
    id: "visakhapatnam",
    name: "Visakhapatnam",
    region: "india",
    x: 55,
    y: 52,
    eventsCount: "2 Conclaves / Year",
    delegates: "4,000+ Leaders",
    focus: "Maritime, Port Logistics & Pharma",
    venue: "Radisson Blu Resort Vizag",
    color: "#06b6d4",
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    region: "india",
    x: 35,
    y: 42,
    eventsCount: "2 Forums / Year",
    delegates: "5,000+ Leaders",
    focus: "Renewable Energy, Chemicals & SME Growth",
    venue: "Courtyard by Marriott Sindhu Bhavan",
    color: "#8b5cf6",
  },

  // INTERNATIONAL HUBS
  {
    id: "dubai",
    name: "Dubai (UAE)",
    region: "international",
    x: 18,
    y: 35,
    eventsCount: "2 Summits / Year",
    delegates: "5,000+ Leaders",
    focus: "Middle East Trade & Global Capital Markets",
    venue: "Museum of the Future & Armani Hotel",
    color: "#d946ef",
  },
  {
    id: "bangkok",
    name: "Bangkok (Thailand)",
    region: "international",
    x: 76,
    y: 57,
    eventsCount: "2 Forums / Year",
    delegates: "4,000+ Leaders",
    focus: "ASEAN Enterprise Tech & Trade Conclave",
    venue: "Centara Grand at CentralWorld",
    color: "#f43f5e",
  },
  {
    id: "malaysia",
    name: "Kuala Lumpur",
    region: "international",
    x: 80,
    y: 68,
    eventsCount: "1 Forum / Year",
    delegates: "3,500+ Leaders",
    focus: "Global Shared Services & FinTech",
    venue: "Mandarin Oriental KLCC",
    color: "#14b8a6",
  },
  {
    id: "europe",
    name: "London (UK)",
    region: "international",
    x: 14,
    y: 18,
    eventsCount: "1 Summit / Year",
    delegates: "3,000+ Leaders",
    focus: "Cross-Border M&A & European Investment",
    venue: "The May Fair Hotel London",
    color: "#a855f7",
  },
];

export function InteractiveMapSection() {
  const [activeRegion, setActiveRegion] = useState<"all" | "india" | "international">("all");
  const [selectedHub, setSelectedHub] = useState<Hub>(hubs[0]!);
  const [hoveredHub, setHoveredHub] = useState<Hub | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeHub = hoveredHub || selectedHub;

  const filteredHubs = useMemo(() => {
    return hubs.filter((h) => {
      const matchRegion = activeRegion === "all" || h.region === activeRegion;
      const matchSearch =
        !searchQuery ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.venue.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [activeRegion, searchQuery]);

  const hq = hubs[0]!;

  return (
    <section className="relative overflow-hidden bg-[#070a11] text-slate-100 py-24 sm:py-32 border-b border-zinc-800/80">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-cyan-600/15 blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />

      {/* Cyber Grid Vector Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00AEEF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="container-x relative z-10">
        <SectionHeading
          kicker="Event Footprint"
          title="Pan-India & International C-Suite Footprint"
          description="A high-density network connecting senior executives, GCC hubs, and industry titans across 12 major economic capitals."
        />

        {/* TOP STATS METRIC BANNER */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Economic Hubs", val: 12, suffix: "+", sub: "India & Overseas Capitals", icon: MapPin, color: "from-cyan-500 to-blue-600" },
            { label: "Annual Delegates", val: 85, suffix: "K+", sub: "Senior Executives & Leaders", icon: Users, color: "from-purple-500 to-indigo-600" },
            { label: "Leadership Summits", val: 35, suffix: "+", sub: "Annual Flagship Gatherings", icon: Award, color: "from-emerald-500 to-teal-600" },
            { label: "Enterprise Reach", val: 100, suffix: "%", sub: "Top Fortune 500 Networks", icon: TrendingUp, color: "from-pink-500 to-rose-600" },
          ].map((st, i) => (
            <Reveal key={st.label} delay={i * 0.08}>
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-2xl group hover:border-cyan-500/50 transition-all duration-300">
                <div className={`absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${st.color} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity`} />
                <div className="flex items-center justify-between">
                  <span className={`p-2.5 rounded-2xl bg-gradient-to-br ${st.color} text-white shadow-lg`}>
                    <st.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40">
                    Live Impact
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold font-display text-white tracking-tight flex items-baseline gap-0.5">
                    <CountUpNumber value={st.val} />
                    <span className="text-cyan-400">{st.suffix}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300 mt-0.5">{st.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{st.sub}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CONTROLS BAR: SEARCH & REGION TABS */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-3 backdrop-blur-2xl shadow-xl">
          {/* Filter Region View Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: "all", label: "All Hubs (12)" },
              { id: "india", label: "India Capitals (8)" },
              { id: "international", label: "International (4)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRegion(tab.id as any)}
                className={`flex-1 md:flex-initial rounded-2xl px-5 py-2.5 text-xs font-bold font-btn transition-all duration-300 cursor-pointer ${
                  activeRegion === tab.id
                    ? "gradient-brand text-white shadow-lg shadow-cyan-500/20 scale-105"
                    : "bg-zinc-800/70 text-slate-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Realtime Hub Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search city, sector or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-zinc-950/90 border border-zinc-800 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* MAIN STAGE GRID: INTERACTIVE MAP + LIVE SPOTLIGHT CARD */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12 items-stretch">
          
          {/* MAP CANVAS CONTAINER (8 COLS) */}
          <div className="lg:col-span-8 relative rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden min-h-[440px] sm:min-h-[520px] flex flex-col justify-between">
            
            {/* World Map Stylized Grid Background Graphics */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#00AEEF_0.8px,transparent_0.8px)] [background-size:18px_18px] pointer-events-none" />

            {/* SVG Interactive Connection Beams */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
              <defs>
                <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00AEEF" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Arc Lines Radiating from HQ Hyderabad */}
              {filteredHubs
                .filter((h) => !h.isHq)
                .map((hub) => {
                  const isActive = activeHub.id === hub.id;
                  return (
                    <g key={hub.id}>
                      {/* Animated Laser Bezier Path */}
                      <path
                        d={`M ${hq.x}% ${hq.y}% Q ${(hq.x + hub.x) / 2}% ${(hq.y + hub.y) / 2 - 14}% ${hub.x}% ${hub.y}%`}
                        fill="none"
                        stroke="url(#laserGrad)"
                        strokeWidth={isActive ? "3" : "1.5"}
                        strokeOpacity={isActive ? "1" : "0.4"}
                        strokeDasharray={isActive ? "none" : "5 5"}
                        filter={isActive ? "url(#glow)" : undefined}
                        className="transition-all duration-300"
                      />
                      {/* Moving Energy Node Particle */}
                      <circle r={isActive ? "5" : "3"} fill={hub.color} filter="url(#glow)">
                        <animateMotion
                          path={`M ${hq.x}% ${hq.y}% Q ${(hq.x + hub.x) / 2}% ${(hq.y + hub.y) / 2 - 14}% ${hub.x}% ${hub.y}%`}
                          dur={`${2.5 + (hub.x % 3)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
            </svg>

            {/* MAP HUB BEACON PINS */}
            <div className="relative h-[340px] sm:h-[420px] w-full z-10">
              {filteredHubs.map((hub) => {
                const isSelected = activeHub.id === hub.id;
                return (
                  <div
                    key={hub.id}
                    style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                    onMouseEnter={() => setHoveredHub(hub)}
                    onMouseLeave={() => setHoveredHub(null)}
                    onClick={() => setSelectedHub(hub)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    {/* Pulsing Radar Ring */}
                    <span className="relative flex h-9 w-9 items-center justify-center">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 pointer-events-none"
                        style={{ backgroundColor: hub.color }}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center border-2 border-zinc-900 shadow-xl transition-all duration-300 group-hover:scale-130 ${
                          isSelected
                            ? "scale-125 ring-4 ring-cyan-500/40"
                            : "scale-100 group-hover:ring-2 group-hover:ring-white/40"
                        }`}
                        style={{ backgroundColor: hub.color }}
                      >
                        {hub.isHq ? (
                          <Sparkles className="h-3.5 w-3.5 text-black font-extrabold animate-spin" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 text-black font-bold" />
                        )}
                      </span>
                    </span>

                    {/* City Label Badge */}
                    <div
                      className={`mt-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold font-btn transition-all duration-300 shadow-xl border ${
                        isSelected
                          ? "bg-white text-zinc-950 border-white scale-110 shadow-cyan-500/30"
                          : "bg-zinc-900/90 text-slate-300 border-zinc-700/80 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      {hub.name} {hub.isHq && <span className="text-cyan-400 font-mono">(HQ)</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MAP CANVAS FOOTER LEGEND */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4 text-xs text-slate-400 z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#00f0ff] animate-ping" />
                  <span className="font-bold text-white">Global HQ (Hyderabad)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  <span>India Hubs (7)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                  <span>International (4)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono">
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                <span>Hover or click pins to inspect hub details</span>
              </div>
            </div>
          </div>

          {/* ACTIVE HUB SPOTLIGHT DETAIL CARD (4 COLS) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHub.id}
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-white flex-1 flex flex-col justify-between"
              >
                {/* Background Ambient Glow */}
                <div
                  className="absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full opacity-20 blur-3xl pointer-events-none"
                  style={{ backgroundColor: activeHub.color }}
                />

                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/80 px-3 py-1 text-[11px] font-bold font-mono text-cyan-300 border border-cyan-700/50">
                      {activeHub.region === "international" ? <Globe className="h-3.5 w-3.5 text-purple-400" /> : <Building2 className="h-3.5 w-3.5 text-cyan-400" />}
                      <span>{activeHub.region === "international" ? "International Capital" : "India Economic Hub"}</span>
                    </span>
                    {activeHub.isHq && (
                      <span className="gradient-brand rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                        CORPORATE HQ
                      </span>
                    )}
                  </div>

                  {/* Hub Name Title */}
                  <h3 className="mt-4 text-2xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
                    <span>{activeHub.name}</span>
                    <span
                      className="h-3 w-3 rounded-full inline-block"
                      style={{ backgroundColor: activeHub.color }}
                    />
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Venue: {activeHub.venue}</span>
                  </p>

                  {/* Key Stats Bar */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3.5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Frequency</span>
                      <span className="text-sm font-extrabold text-cyan-300 font-display mt-0.5 block">{activeHub.eventsCount}</span>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3.5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Delegates</span>
                      <span className="text-sm font-extrabold text-purple-300 font-display mt-0.5 block">{activeHub.delegates}</span>
                    </div>
                  </div>

                  {/* Primary Industry Focus */}
                  <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      Core Industry Focus:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{activeHub.focus}</p>
                  </div>

                  {/* Sector Leadership Checklist */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Curated C-Suite Delegate Lists</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>5-Star Luxury Conference Partners</span>
                    </div>
                  </div>
                </div>

                {/* Explore Hub Button */}
                <div className="mt-8">
                  <MagneticButton strength={15} className="w-full">
                    <Link
                      to="/events"
                      className="gradient-brand w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-white shadow-xl hover:brightness-110 transition-all font-btn"
                    >
                      <span>Explore {activeHub.name} Events</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </MagneticButton>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM HUBS GRID CARDS */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-cyan-400" />
              <span>All 12 Event Capitals Grid</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">Showing {filteredHubs.length} hubs</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredHubs.map((hub, i) => {
              const isSelected = activeHub.id === hub.id;
              return (
                <Reveal key={hub.id} delay={i * 0.03}>
                  <MouseTiltCard
                    maxTilt={8}
                    className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/40 shadow-xl shadow-cyan-500/10 scale-[1.02]"
                        : "border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/60"
                    }`}
                  >
                    <div onClick={() => setSelectedHub(hub)} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="p-2 rounded-xl text-black font-bold"
                          style={{ backgroundColor: hub.color }}
                        >
                          <MapPin className="h-4 w-4" />
                        </span>
                        <div>
                          <h5 className="text-sm font-bold font-display text-white">{hub.name}</h5>
                          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                            {hub.eventsCount}
                          </span>
                        </div>
                      </div>
                      {hub.isHq && (
                        <span className="gradient-brand rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white">
                          HQ
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400 leading-snug line-clamp-2">{hub.focus}</p>
                  </MouseTiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* SECTION FOOTER CTA EXPLORE EVENTS */}
        <div className="mt-16 text-center">
          <MagneticButton
            strength={20}
            className="gradient-brand rounded-full px-9 py-4 text-base font-bold text-white shadow-xl hover:brightness-110"
          >
            <Link to="/events" className="flex items-center gap-2">
              <span>Explore All Regional & International Events</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
