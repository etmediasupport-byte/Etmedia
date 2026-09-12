import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, MapPin, Sparkles, ArrowRight, Building2, Users } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { SectionHeading, Reveal } from "@/components/site/primitives";

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
};

const hubs: Hub[] = [
  // INDIA HUBS
  {
    id: "hyderabad",
    name: "Hyderabad",
    region: "india",
    x: 50,
    y: 54,
    isHq: true,
    eventsCount: "6 Conclaves / Year",
    delegates: "15,000+ Leaders",
    focus: "HQ, HR Leadership & Tech Summits",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    region: "india",
    x: 47,
    y: 65,
    eventsCount: "4 Summits / Year",
    delegates: "12,000+ Leaders",
    focus: "CFO Summit & AI Enterprise Tech",
  },
  {
    id: "pune",
    name: "Pune",
    region: "india",
    x: 42,
    y: 53,
    eventsCount: "2 Forums / Year",
    delegates: "6,000+ Leaders",
    focus: "Manufacturing & Smart Industry 4.0",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "india",
    x: 40,
    y: 49,
    eventsCount: "4 Summits / Year",
    delegates: "10,000+ Leaders",
    focus: "Finance, Capital Markets & GCC",
  },
  {
    id: "chennai",
    name: "Chennai",
    region: "india",
    x: 53,
    y: 68,
    eventsCount: "3 Conclaves / Year",
    delegates: "8,000+ Leaders",
    focus: "Procurement, Supply Chain & Logistics",
  },
  {
    id: "delhi",
    name: "Delhi NCR",
    region: "india",
    x: 47,
    y: 31,
    eventsCount: "3 Conclaves / Year",
    delegates: "9,000+ Leaders",
    focus: "National Leadership & Business Excellence",
  },
  {
    id: "visakhapatnam",
    name: "Visakhapatnam",
    region: "india",
    x: 56,
    y: 53,
    eventsCount: "2 Conclaves / Year",
    delegates: "4,000+ Leaders",
    focus: "Port Logistics, Pharma & Maritime",
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    region: "india",
    x: 39,
    y: 43,
    eventsCount: "2 Forums / Year",
    delegates: "5,000+ Leaders",
    focus: "Textiles, Chemicals & Enterprise Growth",
  },

  // INTERNATIONAL HUBS
  {
    id: "dubai",
    name: "Dubai",
    region: "international",
    x: 22,
    y: 36,
    eventsCount: "2 Summits / Year",
    delegates: "5,000+ Leaders",
    focus: "Middle East Trade & Global Finance",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    region: "international",
    x: 77,
    y: 58,
    eventsCount: "2 Forums / Year",
    delegates: "4,000+ Leaders",
    focus: "ASEAN Business & Innovation Conclave",
  },
  {
    id: "malaysia",
    name: "Malaysia",
    region: "international",
    x: 81,
    y: 69,
    eventsCount: "1 Forum / Year",
    delegates: "3,500+ Leaders",
    focus: "Global Shared Services & Technology",
  },
  {
    id: "europe",
    name: "Europe (London)",
    region: "international",
    x: 18,
    y: 20,
    eventsCount: "1 Summit / Year",
    delegates: "3,000+ Leaders",
    focus: "Cross-Border M&A & European Markets",
  },
];

export function InteractiveMapSection() {
  const [activeRegion, setActiveRegion] = useState<"all" | "india" | "international">("all");
  const [selectedHub, setSelectedHub] = useState<Hub>(hubs[0]!); // Default HQ Hyderabad
  const [hoveredHub, setHoveredHub] = useState<Hub | null>(null);

  const activeHub = hoveredHub || selectedHub;

  const filteredHubs = hubs.filter(
    (h) => activeRegion === "all" || h.region === activeRegion
  );

  const hq = hubs[0]!;

  return (
    <section className="section relative overflow-hidden bg-slate-50 text-slate-900 py-24 border-b border-slate-200">
      {/* Background Ambient Light Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-cyan-200/40 blur-3xl pointer-events-none" />

      <div className="container-x relative z-10">
        <SectionHeading
          kicker="Event Footprint"
          title="Premium Interactive Event Map"
          description="Connecting decision makers across India's premier corporate capitals and key international business hubs."
        />

        {/* Filter Region View Controls */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            { id: "all", label: "ALL HUBS (12)" },
            { id: "india", label: "INDIA (8 HUBS)" },
            { id: "international", label: "INTERNATIONAL (4 HUBS)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRegion(tab.id as any)}
              className={`rounded-full px-6 py-2.5 text-xs font-bold font-btn transition-all duration-300 cursor-pointer ${
                activeRegion === tab.id
                  ? "gradient-brand text-white shadow-md scale-105"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MAP CANVAS CONTAINER */}
        <div className="mt-12 relative rounded-4xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl backdrop-blur-2xl overflow-hidden min-h-[480px] sm:min-h-[560px] flex flex-col justify-between">
          {/* SVG Map Connections & Geography Grid */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none z-0">
            <defs>
              <linearGradient id="lineGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00AEEF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4B1FA7" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Connecting lines radiating from Hyderabad HQ to all other hubs */}
            {filteredHubs
              .filter((h) => !h.isHq)
              .map((hub) => (
                <g key={hub.id}>
                  {/* Arc Curve Path */}
                  <path
                    d={`M ${hq.x}% ${hq.y}% Q ${(hq.x + hub.x) / 2}% ${(hq.y + hub.y) / 2 - 12}% ${hub.x}% ${hub.y}%`}
                    fill="none"
                    stroke="url(#lineGradLight)"
                    strokeWidth={activeHub.id === hub.id ? "2.5" : "1.2"}
                    strokeDasharray="4 4"
                    className="transition-all duration-300"
                  />
                  {/* Moving Animated Beam Node */}
                  <circle r="3.5" fill="#00AEEF">
                    <animateMotion
                      path={`M ${hq.x}% ${hq.y}% Q ${(hq.x + hub.x) / 2}% ${(hq.y + hub.y) / 2 - 12}% ${hub.x}% ${hub.y}%`}
                      dur={`${3 + (hub.x % 3)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ))}
          </svg>

          {/* MAP NODES & PINS */}
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
                  {/* Pin Ripple Radar Ring */}
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        hub.isHq
                          ? "bg-cyan-400"
                          : hub.region === "international"
                          ? "bg-purple-400"
                          : "bg-cyan-500"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-5 w-5 items-center justify-center border-2 border-white shadow-lg transition-transform duration-300 group-hover:scale-125 ${
                        hub.isHq
                          ? "gradient-brand text-white scale-125"
                          : isSelected
                          ? "bg-cyan-600 text-white scale-110"
                          : "bg-slate-800 text-cyan-300"
                      }`}
                    >
                      {hub.isHq ? (
                        <Sparkles className="h-3 w-3 text-white animate-spin" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                    </span>
                  </span>

                  {/* City Label Badge */}
                  <div
                    className={`mt-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold font-btn transition-all duration-300 shadow-md ${
                      isSelected
                        ? "gradient-brand text-white scale-105"
                        : "bg-white text-slate-800 border border-slate-200 hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-700"
                    }`}
                  >
                    {hub.name} {hub.isHq && " (HQ)"}
                  </div>
                </div>
              );
            })}

            {/* ACTIVE HUB FLOATING DETAIL TOOLTIP CARD */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHub.id}
                initial={{ opacity: 0, y: 15, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.94 }}
                transition={{ duration: 0.25 }}
                className="absolute bottom-4 left-4 sm:left-6 max-w-sm rounded-3xl border border-cyan-500/30 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl text-slate-900 z-30 pointer-events-auto"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="gradient-brand p-2 rounded-xl text-white">
                      {activeHub.region === "international" ? <Globe className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    </span>
                    <div>
                      <h4 className="text-base font-bold font-display text-slate-900">
                        {activeHub.name} {activeHub.isHq && <span className="text-cyan-600 text-xs font-normal">(Corporate HQ)</span>}
                      </h4>
                      <span className="text-[11px] uppercase font-bold text-cyan-700 tracking-wider">
                        {activeHub.region === "international" ? "International Destination" : "India Corporate Hub"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-cyan-600" />
                    <span>{activeHub.eventsCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Users className="h-3.5 w-3.5 text-purple-600" />
                    <span>{activeHub.delegates}</span>
                  </div>
                </div>

                <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-cyan-700 block mb-0.5">Primary Focus:</span>
                  {activeHub.focus}
                </div>

                <Link
                  to="/events"
                  className="mt-4 gradient-brand w-full flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition-all font-btn"
                >
                  <span>Explore {activeHub.name} Events</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* MAP BOTTOM INFO LEGEND */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-slate-600 z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full gradient-brand animate-pulse" />
                <span className="font-semibold text-slate-800">Corporate HQ (Hyderabad)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-cyan-600" />
                <span>India Hubs (7)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-600" />
                <span>International Destinations (4)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <span className="font-semibold text-slate-700">Realtime C-Suite Network Coverage</span>
            </div>
          </div>
        </div>

        {/* BOTTOM HUBS GRID CARDS */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredHubs.map((hub, i) => (
            <Reveal key={hub.id} delay={i * 0.04}>
              <MouseTiltCard
                maxTilt={10}
                className={`glass-card p-5 rounded-3xl border transition-all cursor-pointer ${
                  activeHub.id === hub.id
                    ? "border-cyan-500 bg-cyan-50 shadow-md"
                    : "border-slate-200 hover:border-cyan-400 bg-white"
                }`}
              >
                <div onClick={() => setSelectedHub(hub)} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="gradient-brand p-2 rounded-xl text-white">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-base font-bold font-display text-slate-900">{hub.name}</h4>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        {hub.region}
                      </span>
                    </div>
                  </div>
                  {hub.isHq && (
                    <span className="gradient-brand rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                      HQ
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-600 leading-snug line-clamp-2">{hub.focus}</p>
              </MouseTiltCard>
            </Reveal>
          ))}
        </div>

        {/* SECTION FOOTER CTA EXPLORE EVENTS */}
        <div className="mt-16 text-center">
          <MagneticButton
            strength={20}
            className="gradient-brand rounded-full px-9 py-4 text-base font-bold text-white shadow-xl hover:brightness-110"
          >
            <Link to="/events" className="flex items-center gap-2">
              <span>Explore All Regional & International Events</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
