import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  Award,
  CheckCircle2,
  Calendar,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import statesData from "@/data/india-states.json";

// Target 6 states from the reference design
export interface PresenceState {
  id: string; // SVG ID: INJK, INUP, INMH, INTG, INAP, INTN
  name: string;
  capital: string;
  image: string;
  isHq?: boolean;
  pinX: number; // In 1000x1000 SVG coordinate space
  pinY: number;
  labelX: number;
  labelY: number;
  labelAlign: "left" | "right";
  venues: string;
  annualSummits: string;
  delegates: string;
  focus: string;
  tag: string;
}

export const presenceStates: PresenceState[] = [
  {
    id: "INJK",
    name: "Jammu & Kashmir",
    capital: "Srinagar / Jammu",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=160&auto=format&fit=crop&q=80",
    pinX: 297,
    pinY: 156,
    labelX: 180,
    labelY: 145,
    labelAlign: "right",
    venues: "SKICC Srinagar & Radisson Blu Jammu",
    annualSummits: "2 Annual Conclaves",
    delegates: "3,500+ CXO Leaders",
    focus: "Eco-Tourism Infrastructure, Himalayan Commerce & Clean Energy",
    tag: "Northern Hub",
  },
  {
    id: "INUP",
    name: "Uttar Pradesh",
    capital: "Lucknow / Noida",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=160&auto=format&fit=crop&q=80",
    pinX: 428,
    pinY: 386,
    labelX: 520,
    labelY: 380,
    labelAlign: "left",
    venues: "Taj Mahal Hotel Lucknow & India Expo Centre Noida",
    annualSummits: "3 Flagship Conclaves",
    delegates: "8,000+ CXO Leaders",
    focus: "Industrial Corridors, Defense Manufacturing & Enterprise Tech",
    tag: "Industrial Corridor",
  },
  {
    id: "INMH",
    name: "Maharashtra",
    capital: "Mumbai / Pune",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=160&auto=format&fit=crop&q=80",
    pinX: 324,
    pinY: 600,
    labelX: 170,
    labelY: 610,
    labelAlign: "right",
    venues: "Jio World Convention Centre & St. Regis Lower Parel",
    annualSummits: "5 Major Summits",
    delegates: "14,000+ CXO Leaders",
    focus: "BFSI Innovation, Capital Markets, FinTech & Industry 4.0",
    tag: "Financial Capital",
  },
  {
    id: "INTG",
    name: "Telangana",
    capital: "Hyderabad",
    image: "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?w=160&auto=format&fit=crop&q=80",
    isHq: true,
    pinX: 398,
    pinY: 644,
    labelX: 250,
    labelY: 675,
    labelAlign: "right",
    venues: "HICC Novotel & HITEX City Convention Centre",
    annualSummits: "6 Flagship Summits",
    delegates: "15,000+ CXO Leaders",
    focus: "Corporate HQ, National HR Leadership Conclave & Enterprise AI Summit",
    tag: "Corporate HQ",
  },
  {
    id: "INAP",
    name: "Andhra Pradesh",
    capital: "Visakhapatnam / Amaravati",
    image: "https://images.unsplash.com/photo-1621644820358-132d7211bf5a?w=160&auto=format&fit=crop&q=80",
    pinX: 428,
    pinY: 700,
    labelX: 520,
    labelY: 710,
    labelAlign: "left",
    venues: "Radisson Blu Resort & Novotel Varun Beach",
    annualSummits: "2 Annual Conclaves",
    delegates: "5,000+ CXO Leaders",
    focus: "Maritime Logistics, Port Infrastructure & Pharma Industrial Corridors",
    tag: "Maritime Hub",
  },
  {
    id: "INTN",
    name: "Tamil Nadu",
    capital: "Chennai",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=160&auto=format&fit=crop&q=80",
    pinX: 380,
    pinY: 833,
    labelX: 470,
    labelY: 840,
    labelAlign: "left",
    venues: "ITC Grand Chola Guindy & Le Royal Méridien",
    annualSummits: "3 Conclaves / Year",
    delegates: "8,500+ CXO Leaders",
    focus: "Procurement Leadership, Supply Chain 4.0 & Automotive GCC Centers",
    tag: "Industrial Hub",
  },
];

export function InteractiveIndiaMapSection() {
  const [selectedStateId, setSelectedStateId] = useState<string>("INTG");
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  const activeStateId = hoveredStateId || selectedStateId;
  const activeState = useMemo(() => {
    return presenceStates.find((s) => s.id === activeStateId) || presenceStates[3]; // Default to Telangana
  }, [activeStateId]);

  // Map state paths dictionary from parsed data
  const statePathsMap = useMemo(() => {
    const map = new Map<string, string>();
    statesData.forEach((st: any) => {
      map.set(st.id, st.d);
    });
    return map;
  }, []);

  return (
    <section
      id="service-states"
      className="relative overflow-hidden bg-gradient-to-b from-[#f2f7fd] via-[#f8fbff] to-[#ebf4fe] py-16 sm:py-24 text-slate-900 border-t border-blue-100 select-none"
    >
      {/* Background Soft Blue Radial Auras */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-200/30 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-200/35 blur-[150px] pointer-events-none rounded-full" />

      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#0052cc_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="container-x relative z-10 max-w-7xl">
        {/* ========================================================= */}
        {/* 1. SECTION HEADER (Exact reference styling)               */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Top Eyebrow with Accents: —— PAN INDIA PRESENCE —— */}
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-extrabold tracking-[0.25em] text-[#0052cc] uppercase font-mono">
            <span className="w-8 sm:w-12 h-[1.5px] bg-gradient-to-r from-transparent to-[#0052cc]" />
            <span>PAN INDIA PRESENCE</span>
            <span className="w-8 sm:w-12 h-[1.5px] bg-gradient-to-l from-transparent to-[#0052cc]" />
          </div>

          {/* Main Title: Our Service States */}
          <h2 className="mt-3 text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold font-display text-[#002f6c] tracking-tight leading-tight">
            Our Service States
          </h2>

          {/* Subtitle */}
          <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Delivering quality services across key states in India, with a commitment to growth and excellence.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 2. THREE-PANEL INTERACTIVE WORKBENCH                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* ------------------------------------------------------- */}
          {/* PANEL 1 (5 COLS): AUTHENTIC VECTOR INDIA MAP            */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Backing Glow Ring */}
            <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-3xl pointer-events-none scale-90" />

            <div className="relative w-full max-w-[480px] aspect-[1/1.08] flex items-center justify-center">
              <svg
                viewBox="0 0 1000 1000"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,51,102,0.12)]"
              >
                <defs>
                  {/* Rich Royal Blue Linear Gradient for Highlighted States */}
                  <linearGradient id="stateBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0047b3" />
                    <stop offset="50%" stopColor="#0066e6" />
                    <stop offset="100%" stopColor="#003d99" />
                  </linearGradient>

                  {/* Active Highlight State Gradient */}
                  <linearGradient id="activeStateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#003399" />
                    <stop offset="50%" stopColor="#0055ff" />
                    <stop offset="100%" stopColor="#002b80" />
                  </linearGradient>

                  {/* State Drop Shadow */}
                  <filter id="stateGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0052cc" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* A. Non-Target Background Indian States (Clean Soft Blue Silhouettes) */}
                <g className="fill-[#eef5fd] stroke-[#d3e5f8] stroke-[0.8] transition-colors">
                  {statesData
                    .filter((st: any) => !presenceStates.some((ps) => ps.id === st.id))
                    .map((st: any) => (
                      <path
                        key={st.id}
                        d={st.d}
                        className="hover:fill-[#e2effc] transition-colors duration-200"
                      />
                    ))}
                </g>

                {/* B. Highlighted 6 Operational States (Royal Blue) */}
                <g>
                  {presenceStates.map((st) => {
                    const d = statePathsMap.get(st.id);
                    if (!d) return null;
                    const isSelected = activeState.id === st.id;

                    return (
                      <path
                        key={`state-${st.id}`}
                        d={d}
                        onClick={() => setSelectedStateId(st.id)}
                        onMouseEnter={() => setHoveredStateId(st.id)}
                        onMouseLeave={() => setHoveredStateId(null)}
                        fill={isSelected ? "url(#activeStateGrad)" : "url(#stateBlueGrad)"}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? "2" : "1.2"}
                        filter={isSelected ? "url(#stateGlow)" : undefined}
                        className="cursor-pointer transition-all duration-300 hover:brightness-110"
                      />
                    );
                  })}
                </g>

                {/* C. Leader Lines and Text Labels for Highlighted States on Map */}
                <g className="pointer-events-none">
                  {presenceStates.map((st) => {
                    const isSelected = activeState.id === st.id;

                    return (
                      <g key={`label-${st.id}`}>
                        {/* Leader Line from Label to Pin */}
                        <line
                          x1={st.labelX}
                          y1={st.labelY - 5}
                          x2={st.pinX}
                          y2={st.pinY}
                          stroke="#0066e6"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          opacity={isSelected ? "0.9" : "0.5"}
                        />

                        {/* State Name Text Label */}
                        <text
                          x={st.labelX}
                          y={st.labelY - 5}
                          textAnchor={st.labelAlign === "right" ? "end" : "start"}
                          fill="#0f172a"
                          fontSize="24"
                          fontWeight="800"
                          fontFamily="system-ui, sans-serif"
                          className="drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
                        >
                          {st.name}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* D. Blinking Glowing Radar Beacons on Each State */}
                <g className="cursor-pointer">
                  {presenceStates.map((st) => {
                    const isSelected = activeState.id === st.id;

                    return (
                      <g
                        key={`pin-${st.id}`}
                        transform={`translate(${st.pinX}, ${st.pinY})`}
                        onClick={() => setSelectedStateId(st.id)}
                        onMouseEnter={() => setHoveredStateId(st.id)}
                        onMouseLeave={() => setHoveredStateId(null)}
                      >
                        {/* Outer Sonar Ping Wave 1 */}
                        <circle r="18" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8">
                          <animate
                            attributeName="r"
                            from="6"
                            to="26"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.9"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>

                        {/* Outer Sonar Ping Wave 2 */}
                        <circle r="12" fill="none" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6">
                          <animate
                            attributeName="r"
                            from="4"
                            to="20"
                            dur="2s"
                            begin="0.7s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.8"
                            to="0"
                            dur="2s"
                            begin="0.7s"
                            repeatCount="indefinite"
                          />
                        </circle>

                        {/* Solid White / Cyan Center Beacon Core */}
                        <circle
                          r={isSelected ? "7" : "5.5"}
                          fill="#ffffff"
                          stroke="#0052cc"
                          strokeWidth="2.5"
                          filter="drop-shadow(0 0 6px #00f0ff)"
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* PANEL 2 (3.5 COLS): 6 STATE CARDS WITH FLOWING LINES     */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-3.5 relative flex flex-col justify-center space-y-3.5 sm:space-y-4">
            {/* SVG Connecting Flow Lines (Desktop Animated Dash Streams) */}
            <svg
              className="hidden lg:block absolute -left-20 top-0 bottom-0 w-24 h-full pointer-events-none z-20 overflow-visible"
              viewBox="0 0 100 480"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0052cc" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0070f3" stopOpacity="0.9" />
                </linearGradient>

                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {presenceStates.map((st, idx) => {
                const isSelected = activeState.id === st.id;
                // Calculate y positions corresponding to the cards (480 / 6 ≈ 80px per card)
                const targetY = 35 + idx * 78;
                // Source Y mapped from pin position (156 to 833 -> 20 to 460)
                const sourceY = 20 + ((st.pinY - 150) / 700) * 440;
                const pathD = `M -30 ${sourceY} C 20 ${sourceY}, 40 ${targetY}, 95 ${targetY}`;

                return (
                  <g key={`conn-${st.id}`}>
                    {/* Animated Flowing Dashed Curved Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isSelected ? "#0052cc" : "#60a5fa"}
                      strokeWidth={isSelected ? "2.5" : "1.6"}
                      strokeDasharray="6 4"
                      className="animated-dash-line transition-all duration-300"
                      filter={isSelected ? "url(#lineGlow)" : undefined}
                    />

                    {/* Animated Moving Particle Gliding along line */}
                    <circle r={isSelected ? "4" : "2.5"} fill="#0052cc" filter="url(#lineGlow)">
                      <animateMotion
                        path={pathD}
                        dur={`${1.8 + idx * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {/* List of 6 State Cards */}
            {presenceStates.map((st) => {
              const isSelected = activeState.id === st.id;

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStateId(st.id)}
                  onMouseEnter={() => setHoveredStateId(st.id)}
                  onMouseLeave={() => setHoveredStateId(null)}
                  className={`relative flex items-center gap-3.5 p-2.5 sm:p-3 rounded-full bg-white transition-all duration-300 cursor-pointer shadow-md ${
                    isSelected
                      ? "ring-2 ring-[#0052cc] shadow-xl shadow-blue-500/15 translate-x-2 bg-gradient-to-r from-blue-50/80 to-white"
                      : "border border-slate-100 hover:border-blue-300 hover:shadow-lg hover:translate-x-1"
                  }`}
                >
                  {/* Round Landmark Photo Thumbnail with Border */}
                  <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md bg-slate-100">
                    <img
                      src={st.image}
                      alt={st.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* State Name & Subtitle */}
                  <div className="min-w-0 flex-1 pr-2">
                    <h4
                      className={`text-sm sm:text-base font-extrabold font-display truncate transition-colors ${
                        isSelected ? "text-[#003366]" : "text-slate-800"
                      }`}
                    >
                      {st.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate font-sans">
                      {st.isHq ? "★ Corporate Headquarters" : st.capital}
                    </p>
                  </div>

                  {/* Right Active Indicator Pill */}
                  {isSelected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0052cc] shrink-0 mr-2 shadow-sm animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* ------------------------------------------------------- */}
          {/* PANEL 3 (3.5 COLS): FRAMED "OUR SERVICE STATES" PREVIEW  */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-3.5 relative flex flex-col">
            <div className="relative rounded-3xl bg-gradient-to-b from-white via-white to-[#f5f9ff] border border-blue-100/90 p-6 sm:p-7 shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col justify-between">
              {/* Top Royal Blue Header Pill: [MapPin] Our Service States */}
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-[#0052cc] px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-600/25">
                  <MapPin className="h-4 w-4 text-white" />
                  <span>Our Service States</span>
                </div>

                {activeState.isHq && (
                  <span className="text-[10px] font-mono font-bold text-[#0052cc] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    GLOBAL HQ
                  </span>
                )}
              </div>

              {/* Miniature India Preview Map with Active State Pins */}
              <div className="relative w-full aspect-[1/1] max-h-[220px] mx-auto flex items-center justify-center my-2">
                <svg
                  viewBox="0 0 1000 1000"
                  className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,51,102,0.08)]"
                >
                  {/* Subtle Background Indian Silhouette */}
                  <g className="fill-[#eef5fd] stroke-[#d8e8f8] stroke-[1]">
                    {statesData.map((st: any) => (
                      <path key={`mini-${st.id}`} d={st.d} />
                    ))}
                  </g>

                  {/* Highlighted 6 Operational States in Mini Map */}
                  <g>
                    {presenceStates.map((st) => {
                      const d = statePathsMap.get(st.id);
                      if (!d) return null;
                      const isSelected = activeState.id === st.id;

                      return (
                        <path
                          key={`mini-state-${st.id}`}
                          d={d}
                          fill={isSelected ? "#003399" : "#0052cc"}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </g>

                  {/* Map Pin on the Active Selected State */}
                  <g transform={`translate(${activeState.pinX}, ${activeState.pinY - 24})`}>
                    <g className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-bounce">
                      <path
                        d="M 0 0 C -10 -10, -10 -24, 0 -34 C 10 -24, 10 -10, 0 0 Z"
                        fill="#0052cc"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle cx="0" cy="-20" r="5" fill="#ffffff" />
                    </g>
                  </g>
                </svg>
              </div>

              {/* Dynamic State Information Details Box */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeState.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 pt-4 border-t border-slate-100"
                >
                  {/* Title & Tag */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-[#002f6c] font-display">
                        {activeState.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                        {activeState.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {activeState.capital} Regional Operations
                    </p>
                  </div>

                  {/* Official Venue & Frequency Info */}
                  <div className="bg-[#f2f7fd] rounded-2xl p-3.5 space-y-2 border border-blue-50 text-xs">
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-[#0052cc] shrink-0 mt-0.5" />
                      <span className="text-slate-700 leading-tight">
                        <strong className="text-slate-900 block font-bold">Official Venue:</strong>
                        {activeState.venues}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-blue-100/60 text-[11px] text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-[#0052cc] shrink-0" />
                      <span>{activeState.annualSummits}</span>
                      <span className="text-slate-300">•</span>
                      <Users className="h-3.5 w-3.5 text-[#0052cc] shrink-0" />
                      <span>{activeState.delegates}</span>
                    </div>
                  </div>

                  {/* Explore Events CTA Button */}
                  <Link
                    to="/events"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0052cc] hover:bg-[#0041a8] py-3 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all font-btn cursor-pointer"
                  >
                    <span>Explore {activeState.name} Summits</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS for Continuous Line Motion Animation */}
      <style>{`
        @keyframes dashMove {
          from {
            stroke-dashoffset: 40;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animated-dash-line {
          animation: dashMove 1.4s linear infinite;
        }
      `}</style>
    </section>
  );
}
