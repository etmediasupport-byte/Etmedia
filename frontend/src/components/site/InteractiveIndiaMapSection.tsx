import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  Award,
  Compass,
  CheckCircle2,
  Activity,
  Zap,
  Globe2,
  Navigation,
  ShieldCheck,
  CalendarDays,
  PhoneCall,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { SectionHeading, Reveal } from "@/components/site/primitives";

export type BranchHub = {
  id: string;
  stateId: string;
  name: string;
  state: string;
  status: string;
  isHq?: boolean;
  x: number; // SVG coordinate (out of 650)
  y: number; // SVG coordinate (out of 720)
  address: string;
  venue: string;
  eventsCount: string;
  delegates: string;
  frequency: string;
  focus: string;
  tag: string;
  category: "hq" | "tech" | "finance" | "policy" | "industry";
  color: string;
  accentGlow: string;
};

export const branchHubs: BranchHub[] = [
  {
    id: "hyderabad",
    stateId: "telangana",
    name: "Hyderabad",
    state: "Telangana",
    status: "Global Corporate Headquarters",
    isHq: true,
    x: 325,
    y: 470,
    address: "Unit No-1012, 10th Floor, Manjeera Trinity Corporate, JNTU-Hitech Road, KPHB, Hyderabad, Telangana 500072",
    venue: "HICC Novotel & HITEX City Convention Centre",
    eventsCount: "6 Flagship Conclaves / Year",
    delegates: "15,000+ CXO Leaders",
    frequency: "Bi-Monthly Flagship Conclaves",
    focus: "Global Corporate HQ, National HR Leadership Conclave, Enterprise AI Summit & Executive Magazine Bureau",
    tag: "Corporate HQ",
    category: "hq",
    color: "#00f0ff",
    accentGlow: "rgba(0, 240, 255, 0.6)",
  },
  {
    id: "bengaluru",
    stateId: "karnataka",
    name: "Bengaluru",
    state: "Karnataka",
    status: "Technology & GCC Capital Hub",
    x: 300,
    y: 575,
    address: "Executive Talks Southern Bureau, Outer Ring Road Tech Corridor, Bengaluru, Karnataka 560103",
    venue: "The Leela Palace Bengaluru & The Ritz-Carlton",
    eventsCount: "4 Summits / Year",
    delegates: "12,000+ CXO Leaders",
    frequency: "Quarterly Flagship Summits",
    focus: "India CFO Leadership Summit, GCC Alliances, Enterprise Cloud Infrastructure & AI Tech Ventures",
    tag: "Tech & GCC Capital",
    category: "tech",
    color: "#38bdf8",
    accentGlow: "rgba(56, 189, 248, 0.5)",
  },
  {
    id: "mumbai",
    stateId: "maharashtra",
    name: "Mumbai",
    state: "Maharashtra",
    status: "Financial & Capital Markets Capital",
    x: 195,
    y: 450,
    address: "Executive Talks Financial Hub, Bandra-Kurla Complex (BKC), Mumbai, Maharashtra 400051",
    venue: "Jio World Convention Centre & The St. Regis Lower Parel",
    eventsCount: "4 Major Summits / Year",
    delegates: "14,000+ CXO Leaders",
    frequency: "Quarterly Capital Summits",
    focus: "BFSI Innovation, Capital Markets, FinTech Ecosystems, Treasury CXO Forum & Corporate Governance",
    tag: "Financial Capital",
    category: "finance",
    color: "#f59e0b",
    accentGlow: "rgba(245, 158, 11, 0.5)",
  },
  {
    id: "delhi",
    stateId: "delhi",
    name: "Delhi NCR",
    state: "National Capital Region",
    status: "National Policy & Boardroom Governance Hub",
    x: 285,
    y: 220,
    address: "Executive Talks National Bureau, Barakhamba Road, Connaught Place, New Delhi 110001",
    venue: "Taj Palace Diplomatic Enclave & Bharat Mandapam",
    eventsCount: "3 Flagship Conclaves / Year",
    delegates: "10,000+ CXO Leaders",
    frequency: "Tri-Annual National Conclaves",
    focus: "National Economic Policy, ESG Boardroom Governance, Public-Private Partnerships & CXO Conclaves",
    tag: "Policy Capital",
    category: "policy",
    color: "#ec4899",
    accentGlow: "rgba(236, 72, 153, 0.5)",
  },
  {
    id: "chennai",
    stateId: "tamil_nadu",
    name: "Chennai",
    state: "Tamil Nadu",
    status: "Procurement & Industrial Hub",
    x: 365,
    y: 585,
    address: "Executive Talks Industrial Bureau, Guindy Tech Corridor, Chennai, Tamil Nadu 600032",
    venue: "ITC Grand Chola Guindy & Le Royal Méridien",
    eventsCount: "3 Conclaves / Year",
    delegates: "8,500+ CXO Leaders",
    frequency: "Tri-Annual Conclaves",
    focus: "Procurement Leadership Summit, Supply Chain 4.0, Automotive Manufacturing & Electronics Corridors",
    tag: "Industrial Hub",
    category: "industry",
    color: "#a855f7",
    accentGlow: "rgba(168, 85, 247, 0.5)",
  },
  {
    id: "pune",
    stateId: "maharashtra",
    name: "Pune",
    state: "Maharashtra",
    status: "Smart Manufacturing & Innovation Hub",
    x: 225,
    y: 475,
    address: "Executive Talks Western Hub, Senapati Bapat Road, Pune, Maharashtra 411016",
    venue: "JW Marriott Senapati Bapat Road & The Westin Koregaon Park",
    eventsCount: "2 Summits / Year",
    delegates: "6,500+ CXO Leaders",
    frequency: "Semi-Annual Summits",
    focus: "Industry 4.0, Smart Robotics, Automotive R&D Innovation & GCC Software Infrastructure",
    tag: "Smart Manufacturing",
    category: "tech",
    color: "#10b981",
    accentGlow: "rgba(16, 185, 129, 0.5)",
  },
  {
    id: "visakhapatnam",
    stateId: "andhra_pradesh",
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    status: "Maritime & Coastal Infrastructure Hub",
    x: 440,
    y: 465,
    address: "Executive Talks Coastal Bureau, Beach Road, Visakhapatnam, Andhra Pradesh 530002",
    venue: "Radisson Blu Resort & Novotel Varun Beach",
    eventsCount: "2 Conclaves / Year",
    delegates: "5,000+ CXO Leaders",
    frequency: "Semi-Annual Conclaves",
    focus: "Maritime Logistics, Port Infrastructure, Pharma Industrial Corridors & Coastal GCC Centers",
    tag: "Maritime Hub",
    category: "industry",
    color: "#06b6d4",
    accentGlow: "rgba(6, 182, 212, 0.5)",
  },
  {
    id: "kolkata",
    stateId: "west_bengal",
    name: "Kolkata",
    state: "West Bengal",
    status: "Eastern India Trade & FMCG Hub",
    x: 480,
    y: 360,
    address: "Executive Talks Eastern Bureau, Park Street, Kolkata, West Bengal 700016",
    venue: "ITC Royal Bengal & JW Marriott Kolkata",
    eventsCount: "2 Conclaves / Year",
    delegates: "6,000+ CXO Leaders",
    frequency: "Semi-Annual Conclaves",
    focus: "Eastern Region Enterprise Growth, FMCG Logistics, Cross-Border Trade & Mining Infrastructure",
    tag: "Eastern Capital",
    category: "industry",
    color: "#f97316",
    accentGlow: "rgba(249, 115, 22, 0.5)",
  },
  {
    id: "ahmedabad",
    stateId: "gujarat",
    name: "Ahmedabad / GIFT City",
    state: "Gujarat",
    status: "International FinTech & IFSC Gateway",
    x: 175,
    y: 350,
    address: "Executive Talks Western FinTech Bureau, GIFT City, Gandhinagar / Ahmedabad, Gujarat 382355",
    venue: "GIFT City Club & The Grand Bhagwati",
    eventsCount: "2 Summits / Year",
    delegates: "7,000+ CXO Leaders",
    frequency: "Semi-Annual Summits",
    focus: "GIFT City IFSC FinTech, International Capital Markets, Green Hydrogen & Industrial Chemicals",
    tag: "FinTech Gateway",
    category: "finance",
    color: "#14b8a6",
    accentGlow: "rgba(20, 184, 166, 0.5)",
  },
];

export function InteractiveIndiaMapSection() {
  const [activeHubId, setActiveHubId] = useState<string>("hyderabad");
  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "hq" | "tech" | "finance" | "policy">("all");

  const filteredHubs = useMemo(() => {
    if (selectedFilter === "all") return branchHubs;
    if (selectedFilter === "hq") return branchHubs.filter((h) => h.isHq);
    if (selectedFilter === "tech") return branchHubs.filter((h) => h.category === "tech");
    if (selectedFilter === "finance") return branchHubs.filter((h) => h.category === "finance");
    if (selectedFilter === "policy") return branchHubs.filter((h) => h.category === "policy" || h.category === "industry");
    return branchHubs;
  }, [selectedFilter]);

  const activeHub = useMemo(() => {
    const hub = branchHubs.find((h) => h.id === (hoveredHubId || activeHubId));
    return hub || branchHubs[0];
  }, [activeHubId, hoveredHubId]);

  const hq = branchHubs.find((h) => h.isHq) || branchHubs[0];

  return (
    <section
      id="india-network"
      className="relative overflow-hidden bg-gradient-to-b from-[#040813] via-[#060b19] to-[#08111F] py-16 sm:py-24 text-white border-t border-slate-800/80 selection:bg-cyan-500/30"
    >
      {/* Background Decorative Grid and Glow Ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,174,239,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7A0019]/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1528_1px,transparent_1px),linear-gradient(to_bottom,#0b1528_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      <div className="container-x relative z-10">
        {/* SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/60 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-cyan-300 font-mono tracking-wider shadow-lg shadow-cyan-950/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span>PAN-INDIA EXECUTIVE NETWORK</span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="mt-3.5 text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold font-display text-white tracking-tight leading-tight">
                National Leadership Reach:{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-white to-[#D4AF37] bg-clip-text text-transparent">
                  Where India's C-Suite Convenes
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-sans">
                From our corporate headquarters in Hyderabad to premier enterprise capitals across the nation, explore where Executive Talks Media hosts high-impact business conclaves, national awards, and strategic C-suite summits.
              </p>
            </Reveal>
          </div>

          {/* Quick Filter Navigation Buttons */}
          <Reveal delay={0.25}>
            <div className="flex flex-wrap items-center gap-2 bg-[#0a1222]/90 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-xl">
              {[
                { id: "all", label: "All Hubs (9)" },
                { id: "hq", label: "HQ (Hyderabad)" },
                { id: "tech", label: "Tech & Innovation" },
                { id: "finance", label: "Financial Markets" },
                { id: "policy", label: "Policy & Industrial" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedFilter(btn.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-btn ${
                    selectedFilter === btn.id
                      ? "bg-gradient-to-r from-[#7A0019] to-cyan-600 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* 2-COLUMN MAIN WORKBENCH: INDIA MAP (7 COLS) + SPOTLIGHT CARD (5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* ========================================================= */}
          {/* LEFT 7 COLS: INTERACTIVE SVG INDIA VECTOR MAP CANVAS      */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 relative rounded-3xl border border-slate-800/90 bg-[#070e1c]/80 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
            {/* Top Canvas Bar with Live Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-2 z-10 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono font-bold">
                <Navigation className="h-4 w-4 text-cyan-400" />
                <span>INTERACTIVE GEOGRAPHIC RADAR</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>8+ States Operational</span>
              </div>
            </div>

            {/* SVG MAP CONTAINER */}
            <div className="relative w-full h-[480px] sm:h-[580px] flex items-center justify-center">
              <svg
                viewBox="0 0 650 720"
                className="w-full h-full max-h-[580px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] select-none"
              >
                <defs>
                  {/* Laser Beam Gradient from HQ Hyderabad */}
                  <linearGradient id="hqLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.95" />
                  </linearGradient>

                  {/* Soft State Glow Filter */}
                  <filter id="stateGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Laser Line Glow */}
                  <filter id="beamGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. REST OF INDIA BASE BACKGROUND TERRITORIES (Neutral Dark Outline) */}
                <g className="fill-[#0c1628]/80 stroke-slate-800/80 stroke-[1.2]">
                  {/* Northern Himalayan Region (J&K, Ladakh, Himachal, Punjab, Uttarakhand) */}
                  <path d="M 275,100 L 310,40 L 360,60 L 380,110 L 335,160 L 345,190 L 298,205 L 275,205 L 245,170 L 255,125 Z" />
                  {/* Rajasthan */}
                  <path d="M 175,230 L 245,190 L 275,205 L 275,260 L 240,325 L 175,300 L 155,270 Z" />
                  {/* Madhya Pradesh (Central) */}
                  <path d="M 240,325 L 275,260 L 345,265 L 385,310 L 365,365 L 330,375 L 250,390 L 220,380 Z" />
                  {/* Uttar Pradesh & Bihar */}
                  <path d="M 298,205 L 345,190 L 390,210 L 465,245 L 465,305 L 410,300 L 345,265 L 275,260 Z" />
                  {/* Odisha & Chhattisgarh */}
                  <path d="M 365,365 L 410,345 L 455,340 L 465,385 L 430,440 L 365,455 L 345,435 L 330,410 Z" />
                  {/* Kerala & South-Western Strip */}
                  <path d="M 250,560 L 280,610 L 280,630 L 295,680 L 275,685 L 260,630 Z" />
                  {/* North-East Region (Assam, Meghalaya, etc.) */}
                  <path d="M 465,245 L 495,215 L 530,225 L 585,235 L 590,270 L 535,285 L 495,275 Z" />
                </g>

                {/* 2. HIGHLIGHTED EXECUTIVE STATES (Interactive with Luminous Borders) */}
                <g className="transition-all duration-300">
                  {/* TELANGANA (HQ HYDERABAD) */}
                  <path
                    d="M 295,445 L 340,430 L 365,455 L 355,490 L 320,505 L 290,480 Z"
                    className={`cursor-pointer transition-all duration-300 ${
                      activeHub.stateId === "telangana"
                        ? "fill-cyan-500/35 stroke-[#00f0ff] stroke-[2.5]"
                        : "fill-cyan-500/15 stroke-cyan-400/60 stroke-[1.5] hover:fill-cyan-500/25"
                    }`}
                    onClick={() => setActiveHubId("hyderabad")}
                    onMouseEnter={() => setHoveredHubId("hyderabad")}
                    onMouseLeave={() => setHoveredHubId(null)}
                    filter={activeHub.stateId === "telangana" ? "url(#stateGlow)" : undefined}
                  />

                  {/* KARNATAKA (BENGALURU) */}
                  <path
                    d="M 230,480 L 265,475 L 290,510 L 325,510 L 330,560 L 315,615 L 280,610 L 250,560 L 225,510 Z"
                    className={`cursor-pointer transition-all duration-300 ${
                      activeHub.stateId === "karnataka"
                        ? "fill-sky-500/35 stroke-[#38bdf8] stroke-[2.5]"
                        : "fill-sky-500/15 stroke-sky-400/60 stroke-[1.5] hover:fill-sky-500/25"
                    }`}
                    onClick={() => setActiveHubId("bengaluru")}
                    onMouseEnter={() => setHoveredHubId("bengaluru")}
                    onMouseLeave={() => setHoveredHubId(null)}
                    filter={activeHub.stateId === "karnataka" ? "url(#stateGlow)" : undefined}
                  />

                  {/* MAHARASHTRA (MUMBAI & PUNE) */}
                  <path
                    d="M 175,410 L 250,390 L 330,410 L 345,435 L 295,445 L 290,480 L 230,480 L 195,475 L 175,440 Z"
                    className={`cursor-pointer transition-all duration-300 ${
                      activeHub.stateId === "maharashtra"
                        ? "fill-amber-500/35 stroke-[#f59e0b] stroke-[2.5]"
                        : "fill-amber-500/15 stroke-amber-400/60 stroke-[1.5] hover:fill-amber-500/25"
                    }`}
                    onClick={() => setActiveHubId("mumbai")}
                    onMouseEnter={() => setHoveredHubId("mumbai")}
                    onMouseLeave={() => setHoveredHubId(null)}
                    filter={activeHub.stateId === "maharashtra" ? "url(#stateGlow)" : undefined}
                  />

                  {/* DELHI NCR */}
                  <path
                    d="M 275,205 L 298,205 L 305,230 L 280,235 Z"
                    className={`cursor-pointer transition-all duration-300 ${
                      activeHub.stateId === "delhi"
                        ? "fill-pink-500/40 stroke-[#ec4899] stroke-[2.5]"
                        : "fill-pink-500/15 stroke-pink-400/60 stroke-[1.5] hover:fill-pink-500/25"
                    }`}
                    onClick={() => setActiveHubId("delhi")}
                    onMouseEnter={() => setHoveredHubId("delhi")}
                    onMouseLeave={() => setHoveredHubId(null)}
                    filter={activeHub.stateId === "delhi" ? "url(#stateGlow)" : undefined}
                  />

                  {/* TAMIL NADU (CHENNAI) */}
                  <path
                    d="M 315,615 L 340,580 L 375,580 L 380,625 L 350,670 L 310,680 L 295,680 L 280,630 Z"
                    className={`cursor-pointer transition-all duration-300 ${
                      activeHub.stateId === "tamil_nadu"
                        ? "fill-purple-500/35 stroke-[#a855f7] stroke-[2.5]"
                        : "fill-purple-500/15 stroke-purple-400/60 stroke-[1.5] hover:fill-purple-500/25"
                    }`}
                    onClick={() => setActiveHubId("chennai")}
                    onMouseEnter={() => setHoveredHubId("chennai")}
                    onMouseLeave={() => setHoveredHubId(null)}
                    filter={activeHub.stateId === "tamil_nadu" ? "url(#stateGlow)" : undefined}
                  />

                  {/* ANDHRA PRADESH (VISAKHAPATNAM) */}
                  <path
                    d="M 365,455 L 430,440 L 465,460 L 415,530 L 375,580 L 340,580 L 355,490 Z"
                    className={`cursor-pointer transition-all duration-300 ${
                      activeHub.stateId === "andhra_pradesh"
                        ? "fill-cyan-500/35 stroke-[#06b6d4] stroke-[2.5]"
                        : "fill-cyan-500/15 stroke-cyan-400/60 stroke-[1.5] hover:fill-cyan-500/25"
                    }`}
                    onClick={() => setActiveHubId("visakhapatnam")}
                    onMouseEnter={() => setHoveredHubId("visakhapatnam")}
                    onMouseLeave={() => setHoveredHubId(null)}
                    filter={activeHub.stateId === "andhra_pradesh" ? "url(#stateGlow)" : undefined}
                  />

                  {/* GUJARAT (AHMEDABAD / GIFT CITY) */}
                  <path
                    d="M 115,315 L 175,300 L 205,335 L 220,380 L 180,410 L 160,375 L 130,375 L 110,340 Z"
                    className={`cursor-pointer transition-all duration-300 ${
                      activeHub.stateId === "gujarat"
                        ? "fill-teal-500/35 stroke-[#14b8a6] stroke-[2.5]"
                        : "fill-teal-500/15 stroke-teal-400/60 stroke-[1.5] hover:fill-teal-500/25"
                    }`}
                    onClick={() => setActiveHubId("ahmedabad")}
                    onMouseEnter={() => setHoveredHubId("ahmedabad")}
                    onMouseLeave={() => setHoveredHubId(null)}
                    filter={activeHub.stateId === "gujarat" ? "url(#stateGlow)" : undefined}
                  />

                  {/* WEST BENGAL (KOLKATA) */}
                  <path
                    d="M 465,305 L 485,290 L 495,335 L 515,370 L 490,410 L 465,385 L 455,340 Z"
                    className={`cursor-pointer transition-all duration-300 ${
                      activeHub.stateId === "west_bengal"
                        ? "fill-orange-500/35 stroke-[#f97316] stroke-[2.5]"
                        : "fill-orange-500/15 stroke-orange-400/60 stroke-[1.5] hover:fill-orange-500/25"
                    }`}
                    onClick={() => setActiveHubId("kolkata")}
                    onMouseEnter={() => setHoveredHubId("kolkata")}
                    onMouseLeave={() => setHoveredHubId(null)}
                    filter={activeHub.stateId === "west_bengal" ? "url(#stateGlow)" : undefined}
                  />
                </g>

                {/* 3. LASER ENERGY TRANSMISSION ARCS RADIATING FROM HYDERABAD HQ */}
                <g className="pointer-events-none">
                  {filteredHubs
                    .filter((h) => !h.isHq)
                    .map((hub) => {
                      const isActive = activeHub.id === hub.id;
                      // Curved laser control point
                      const midX = (hq.x + hub.x) / 2;
                      const midY = (hq.y + hub.y) / 2 - 25;
                      const pathD = `M ${hq.x} ${hq.y} Q ${midX} ${midY} ${hub.x} ${hub.y}`;

                      return (
                        <g key={`beam-${hub.id}`}>
                          {/* Laser Beam Path */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="url(#hqLaserGrad)"
                            strokeWidth={isActive ? "2.5" : "1.2"}
                            strokeOpacity={isActive ? "0.95" : "0.35"}
                            strokeDasharray={isActive ? "none" : "4 4"}
                            filter={isActive ? "url(#beamGlow)" : undefined}
                            className="transition-all duration-300"
                          />

                          {/* Moving Laser Energy Particle Pulse */}
                          <circle r={isActive ? "4.5" : "2.5"} fill={hub.color} filter="url(#beamGlow)">
                            <animateMotion
                              path={pathD}
                              dur={`${2.2 + (hub.x % 3) * 0.4}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        </g>
                      );
                    })}
                </g>

                {/* 4. BLINKING / PULSING RADAR BEACON PINS */}
                <g className="cursor-pointer">
                  {filteredHubs.map((hub) => {
                    const isSelected = activeHub.id === hub.id;

                    return (
                      <g
                        key={`pin-${hub.id}`}
                        transform={`translate(${hub.x}, ${hub.y})`}
                        onClick={() => setActiveHubId(hub.id)}
                        onMouseEnter={() => setHoveredHubId(hub.id)}
                        onMouseLeave={() => setHoveredHubId(null)}
                        className="group"
                      >
                        {/* OUTER PULSING RADAR RING 1 (Expanding Sonar Wave) */}
                        <circle
                          r={isSelected ? "22" : "16"}
                          fill="none"
                          stroke={hub.color}
                          strokeWidth="1.5"
                          opacity="0.8"
                        >
                          <animate
                            attributeName="r"
                            from={isSelected ? "10" : "8"}
                            to={isSelected ? "28" : "22"}
                            dur={hub.isHq ? "1.8s" : "2.4s"}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.9"
                            to="0"
                            dur={hub.isHq ? "1.8s" : "2.4s"}
                            repeatCount="indefinite"
                          />
                        </circle>

                        {/* OUTER PULSING RADAR RING 2 (Staggered Ping) */}
                        <circle
                          r={isSelected ? "14" : "10"}
                          fill="none"
                          stroke={hub.color}
                          strokeWidth="1"
                          opacity="0.5"
                        >
                          <animate
                            attributeName="r"
                            from="6"
                            to={isSelected ? "22" : "16"}
                            dur={hub.isHq ? "1.8s" : "2.4s"}
                            begin="0.7s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.7"
                            to="0"
                            dur={hub.isHq ? "1.8s" : "2.4s"}
                            begin="0.7s"
                            repeatCount="indefinite"
                          />
                        </circle>

                        {/* SOLID BLINKING CENTER CORE */}
                        <circle
                          r={hub.isHq ? (isSelected ? "8" : "7") : isSelected ? "7" : "5.5"}
                          fill={hub.isHq ? "#D4AF37" : hub.color}
                          stroke="#040813"
                          strokeWidth="2"
                          className="transition-transform duration-300 drop-shadow-[0_0_10px_currentColor]"
                        >
                          {/* Continuous Blinking Intensity Animation */}
                          <animate
                            attributeName="fill-opacity"
                            values="1;0.4;1"
                            dur={hub.isHq ? "1.2s" : "1.8s"}
                            repeatCount="indefinite"
                          />
                        </circle>

                        {/* HEADQUARTERS SPECIAL INNER GOLD STAR PIN */}
                        {hub.isHq && (
                          <circle
                            r="3"
                            fill="#ffffff"
                            className="animate-pulse"
                          />
                        )}

                        {/* SVG CITY LABEL BADGE */}
                        <g
                          transform={`translate(0, ${hub.y > 600 ? -18 : 18})`}
                          className="pointer-events-none"
                        >
                          {/* Label Background Pill */}
                          <rect
                            x={-((hub.name.length * 4.2) + (hub.isHq ? 20 : 10))}
                            y="-11"
                            width={((hub.name.length * 8.4) + (hub.isHq ? 40 : 20))}
                            height="22"
                            rx="11"
                            fill={isSelected ? "#00f0ff" : "#070e1c"}
                            stroke={isSelected ? "#ffffff" : hub.color}
                            strokeWidth={isSelected ? "1.5" : "1"}
                            strokeOpacity={isSelected ? "1" : "0.7"}
                            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.8))"
                          />

                          {/* Text Label */}
                          <text
                            textAnchor="middle"
                            y="3.5"
                            fill={isSelected ? "#040813" : "#ffffff"}
                            fontSize="9.5"
                            fontWeight="800"
                            fontFamily="system-ui, sans-serif"
                            letterSpacing="0.02em"
                          >
                            {hub.name} {hub.isHq ? "★ HQ" : ""}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* CANVAS FOOTER LEGEND */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs text-slate-400 z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]" />
                  </span>
                  <span className="font-bold text-white">Global HQ (Hyderabad)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>Regional Hubs (8)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-gradient-to-r from-cyan-400 to-[#D4AF37]" />
                  <span>Laser Conclave Links</span>
                </div>
              </div>

              <span className="text-[11px] text-cyan-400 font-mono">
                Click any state or pin to inspect details
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT 5 COLS: ACTIVE HUB SPOTLIGHT EXECUTIVE CARD          */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHub.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-[#081226]/95 via-[#060d1d]/95 to-[#040813]/98 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl flex-1 flex flex-col justify-between"
              >
                {/* Radial Glow Highlight matching Hub Color */}
                <div
                  className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-25 blur-3xl pointer-events-none"
                  style={{ backgroundColor: activeHub.color }}
                />

                <div className="space-y-6">
                  {/* Top Badge & HQ Label */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/80 px-3 py-1 text-[11px] font-bold font-mono text-cyan-300 border border-cyan-700/50">
                      <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{activeHub.state} Operations</span>
                    </span>

                    {activeHub.isHq ? (
                      <span className="bg-gradient-to-r from-[#7A0019] via-[#9e0021] to-[#D4AF37] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider shadow-md shadow-[#7A0019]/40 border border-[#D4AF37]/50 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                        <span>GLOBAL HEADQUARTERS</span>
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border border-slate-700">
                        {activeHub.tag}
                      </span>
                    )}
                  </div>

                  {/* City Name & Status */}
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
                      <span>{activeHub.name}</span>
                      <span
                        className="h-3 w-3 rounded-full inline-block animate-pulse shadow-md"
                        style={{ backgroundColor: activeHub.color }}
                      />
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-[#D4AF37] font-mono">
                      {activeHub.status}
                    </p>
                  </div>

                  {/* Physical Venue & Official Address */}
                  <div className="space-y-2 rounded-2xl border border-slate-800 bg-[#060c18]/80 p-4">
                    <div className="flex items-start gap-2.5 text-xs text-slate-300">
                      <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Official Conclave Venue:</span>
                        <span className="text-slate-300">{activeHub.venue}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-800/80 pt-2 flex items-start gap-2.5 text-[11px] text-slate-400 font-sans">
                      <Navigation className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{activeHub.address}</span>
                    </div>
                  </div>

                  {/* 2-Column Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-[#060c18]/90 p-3.5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Annual Summits
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-cyan-300 font-display mt-0.5 block">
                        {activeHub.eventsCount}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-[#060c18]/90 p-3.5 text-center">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        C-Suite Network
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-[#D4AF37] font-display mt-0.5 block">
                        {activeHub.delegates}
                      </span>
                    </div>
                  </div>

                  {/* Primary Focus Area */}
                  <div className="rounded-2xl border border-slate-800 bg-[#060c18]/70 p-4">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      Key Sector Focus & Conclaves:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {activeHub.focus}
                    </p>
                  </div>

                  {/* Quality Checklist */}
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Curated C-Suite Delegate Lists & Closed-Door Panels</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>5-Star Luxury Conference & Conclave Partner Venues</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>National Executive Talks Media Magazine Bureau Coverage</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA Buttons */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
                  <MagneticButton strength={15} className="flex-1">
                    <Link
                      to="/events"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7A0019] via-[#9e0021] to-cyan-700 py-3.5 text-xs font-bold text-white shadow-xl hover:brightness-110 transition-all font-btn"
                    >
                      <span>Explore {activeHub.name} Conclaves</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </MagneticButton>

                  <MagneticButton strength={15}>
                    <Link
                      to="/contact"
                      className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3.5 text-xs font-bold text-slate-200 hover:text-white hover:border-[#D4AF37]/60 transition-all font-btn"
                    >
                      <PhoneCall className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>Inquire Branch</span>
                    </Link>
                  </MagneticButton>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM QUICK HUB BADGES SELECTOR BAR */}
        <div className="mt-12 pt-8 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>Select Any City Branch to Explore on Map</span>
            </span>
            <span className="text-xs font-mono text-cyan-400">
              Showing {branchHubs.length} Strategic Hubs
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
            {branchHubs.map((hub) => {
              const isSelected = activeHub.id === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => setActiveHubId(hub.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-500/20 scale-105"
                      : "border-slate-800 bg-[#070e1c] hover:border-slate-700 hover:bg-[#0c1628]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: hub.color }}
                    />
                    <span className="text-xs font-extrabold text-white truncate font-display">
                      {hub.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate mt-1 font-mono">
                    {hub.isHq ? "Global HQ" : hub.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
