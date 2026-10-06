import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Building2,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import statesData from "@/data/india-states.json";

export interface PresenceState {
  id: string; // SVG ID
  code: string; // Short code e.g. JK, UP, MH, TG, AP, TN
  name: string;
  capital: string;
  isHq?: boolean;
  rawPinX: number; // In 1000x1000 SVG coordinate space
  rawPinY: number;
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
    code: "JK",
    name: "Jammu & Kashmir",
    capital: "Srinagar / Jammu",
    rawPinX: 297,
    rawPinY: 156,
    labelX: 160,
    labelY: 155,
    labelAlign: "right",
    venues: "SKICC Srinagar & Radisson Blu Jammu",
    annualSummits: "2 Annual Conclaves",
    delegates: "3,500+ CXO Leaders",
    focus: "Himalayan Commerce, Infrastructure & Clean Energy",
    tag: "Northern Hub",
  },
  {
    id: "INUP",
    code: "UP",
    name: "Uttar Pradesh",
    capital: "Lucknow / Noida",
    rawPinX: 430,
    rawPinY: 380,
    labelX: 525,
    labelY: 345,
    labelAlign: "left",
    venues: "Taj Mahal Hotel Lucknow & India Expo Centre",
    annualSummits: "3 Flagship Conclaves",
    delegates: "8,000+ CXO Leaders",
    focus: "Industrial Corridors, Defense Tech & Governance",
    tag: "Industrial Corridor",
  },
  {
    id: "INMH",
    code: "MH",
    name: "Maharashtra",
    capital: "Mumbai / Pune",
    rawPinX: 275,
    rawPinY: 575,
    labelX: 150,
    labelY: 575,
    labelAlign: "right",
    venues: "Jio World Convention Centre & St. Regis Mumbai",
    annualSummits: "5 Major Summits",
    delegates: "14,000+ CXO Leaders",
    focus: "BFSI Innovation, Capital Markets & Industry 4.0",
    tag: "Financial Capital",
  },
  {
    id: "INTG",
    code: "TG",
    name: "Telangana",
    capital: "Hyderabad",
    isHq: true,
    rawPinX: 400,
    rawPinY: 645,
    labelX: 165,
    labelY: 645,
    labelAlign: "right",
    venues: "HICC Novotel & HITEX City Convention Centre",
    annualSummits: "6 Flagship Summits",
    delegates: "15,000+ CXO Leaders",
    focus: "Global Corporate HQ, HR Conclave & Enterprise AI",
    tag: "Corporate HQ",
  },
  {
    id: "INAP",
    code: "AP",
    name: "Andhra Pradesh",
    capital: "Visakhapatnam / Amaravati",
    rawPinX: 440,
    rawPinY: 715,
    labelX: 525,
    labelY: 715,
    labelAlign: "left",
    venues: "Radisson Blu Resort & Novotel Varun Beach",
    annualSummits: "2 Annual Conclaves",
    delegates: "5,000+ CXO Leaders",
    focus: "Maritime Logistics, Port Corridors & Pharma Tech",
    tag: "Maritime Hub",
  },
  {
    id: "INTN",
    code: "TN",
    name: "Tamil Nadu",
    capital: "Chennai",
    rawPinX: 380,
    rawPinY: 833,
    labelX: 475,
    labelY: 833,
    labelAlign: "left",
    venues: "ITC Grand Chola Guindy & Le Royal Méridien",
    annualSummits: "3 Conclaves / Year",
    delegates: "8,500+ CXO Leaders",
    focus: "Procurement Leadership, SCM 4.0 & Automotive GCCs",
    tag: "Industrial Hub",
  },
];

export function InteractiveIndiaMapSection() {
  const [selectedStateId, setSelectedStateId] = useState<string>("INTG");
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  const activeStateId = hoveredStateId || selectedStateId;
  const activeState = useMemo(() => {
    return presenceStates.find((s) => s.id === activeStateId) || presenceStates[3];
  }, [activeStateId]);

  // Fast mapping of state IDs to SVG paths
  const statePathsMap = useMemo(() => {
    const map = new Map<string, string>();
    statesData.forEach((st: any) => {
      map.set(st.id, st.d);
    });
    return map;
  }, []);

  // Compact Map scale and translation: fits standard viewport in 1440x550 canvas
  const mapScale = 0.56;
  const mapOffsetX = 50;
  const mapOffsetY = 15;

  // Middle cards column position & exact compact top coordinates
  const cardsStartX = 740;
  const cardHeight = 52;
  const cardTops = [30, 118, 206, 294, 382, 470];

  return (
    <section
      id="service-states"
      className="relative overflow-hidden bg-gradient-to-b from-[#f2f7fd] via-[#f8fbff] to-[#ebf4fe] py-8 sm:py-10 text-slate-900 border-t border-blue-100 select-none"
    >
      {/* Background Soft Ambient Auras */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-200/25 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-200/30 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#0052cc_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="container-x relative z-10 max-w-[1480px]">
        {/* ========================================================= */}
        {/* 1. COMPACT SECTION HEADER                                 */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs font-extrabold tracking-[0.25em] text-[#0052cc] uppercase font-mono">
            <span className="w-6 sm:w-10 h-[1.5px] bg-gradient-to-r from-transparent to-[#0052cc]" />
            <span>PAN INDIA PRESENCE</span>
            <span className="w-6 sm:w-10 h-[1.5px] bg-gradient-to-l from-transparent to-[#0052cc]" />
          </div>

          <h2 className="mt-1.5 text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold font-display text-[#002f6c] tracking-tight leading-tight">
            Our Service States
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Delivering quality services across key states in India, with a commitment to growth and excellence.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 2. DESKTOP VIEWPORT-OPTIMIZED 1440x550 SVG CANVAS         */}
        {/* Fits completely inside normal screen height!              */}
        {/* ========================================================= */}
        <div className="hidden lg:block relative w-full aspect-[1440/550] max-h-[550px] mx-auto filter drop-shadow-[0_12px_28px_rgba(0,51,102,0.07)]">
          <svg viewBox="0 0 1440 550" className="w-full h-full">
            <defs>
              {/* Highlighted State Blue Gradient */}
              <linearGradient id="stateBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0047b3" />
                <stop offset="50%" stopColor="#0066e6" />
                <stop offset="100%" stopColor="#003d99" />
              </linearGradient>

              {/* Active State Deep Blue Gradient */}
              <linearGradient id="activeStateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#002b80" />
                <stop offset="50%" stopColor="#0055ff" />
                <stop offset="100%" stopColor="#001f66" />
              </linearGradient>

              {/* Glowing Line Laser Filter */}
              <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* A. INDIA MAP GROUP (Left side of canvas) */}
            <g transform={`translate(${mapOffsetX}, ${mapOffsetY}) scale(${mapScale})`}>
              {/* Layer 1: Entire India Perimeter Outer Silhouette Outline */}
              <g
                stroke="#4b8de8"
                strokeWidth="3.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              >
                {statesData.map((st: any) => (
                  <path key={`outline-${st.id}`} d={st.d} />
                ))}
              </g>

              {/* Layer 2: All Non-operational Background States with Visible Clear Borders */}
              <g>
                {statesData
                  .filter((st: any) => !presenceStates.some((ps) => ps.id === st.id))
                  .map((st: any) => (
                    <path
                      key={`bg-st-${st.id}`}
                      d={st.d}
                      fill="#ffffff"
                      stroke="#9ec2eb"
                      strokeWidth="1.25"
                      strokeLinejoin="round"
                      className="hover:fill-[#e4effc] transition-colors duration-200"
                    />
                  ))}
              </g>

              {/* Layer 3: Highlighted Operational States with Bold Outlines and Gradient Fill */}
              <g>
                {presenceStates.map((st) => {
                  const d = statePathsMap.get(st.id);
                  if (!d) return null;
                  const isSelected = activeState.id === st.id;

                  return (
                    <path
                      key={`canvas-st-${st.id}`}
                      d={d}
                      onClick={() => setSelectedStateId(st.id)}
                      onMouseEnter={() => setHoveredStateId(st.id)}
                      onMouseLeave={() => setHoveredStateId(null)}
                      fill={isSelected ? "url(#activeStateGrad)" : "url(#stateBlueGrad)"}
                      stroke="#002b66"
                      strokeWidth={isSelected ? "2.6" : "1.8"}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-all duration-300 hover:brightness-110 filter drop-shadow-[0_4px_12px_rgba(0,51,153,0.35)]"
                    />
                  );
                })}
              </g>

              {/* Layer 4: Thin Leader Lines & Labels for Operational States */}
              <g className="pointer-events-none">
                {presenceStates.map((st) => (
                  <g key={`lbl-${st.id}`}>
                    <line
                      x1={st.labelX}
                      y1={st.labelY}
                      x2={st.rawPinX}
                      y2={st.rawPinY}
                      stroke="#0052cc"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.65"
                    />
                    <text
                      x={st.labelX}
                      y={st.labelY - 4}
                      textAnchor={st.labelAlign === "right" ? "end" : "start"}
                      fill="#0f172a"
                      fontSize="18"
                      fontWeight="800"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {st.name}
                    </text>
                  </g>
                ))}
              </g>

              {/* Layer 5: Blinking Radar Beacons on Operational States */}
              <g className="cursor-pointer">
                {presenceStates.map((st) => {
                  const isSelected = activeState.id === st.id;

                  return (
                    <g
                      key={`pin-${st.id}`}
                      transform={`translate(${st.rawPinX}, ${st.rawPinY})`}
                      onClick={() => setSelectedStateId(st.id)}
                      onMouseEnter={() => setHoveredStateId(st.id)}
                      onMouseLeave={() => setHoveredStateId(null)}
                    >
                      {/* Outer Sonar Ping 1 */}
                      <circle r="16" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8">
                        <animate attributeName="r" from="5" to="22" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.9" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      {/* Outer Sonar Ping 2 */}
                      <circle r="11" fill="none" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6">
                        <animate attributeName="r" from="4" to="17" dur="2s" begin="0.7s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.8" to="0" dur="2s" begin="0.7s" repeatCount="indefinite" />
                      </circle>
                      {/* Center Core */}
                      <circle
                        r={isSelected ? "6" : "4.8"}
                        fill="#ffffff"
                        stroke="#0052cc"
                        strokeWidth="2.2"
                        filter="drop-shadow(0 0 6px #00f0ff)"
                      />
                    </g>
                  );
                })}
              </g>
            </g>

            {/* B. CONNECTING BEZIER LINES (ACCURATELY BRIDGING STATE BEACON TO CARD) */}
            <g className="pointer-events-none">
              {presenceStates.map((st, idx) => {
                const isSelected = activeState.id === st.id;

                // Exact coordinate where beacon sits on canvas
                const startX = mapOffsetX + st.rawPinX * mapScale;
                const startY = mapOffsetY + st.rawPinY * mapScale;

                // Exact center-left coordinate of the card pill
                const targetX = cardsStartX;
                const targetY = cardTops[idx] + cardHeight / 2;

                const dx = targetX - startX;
                const dy = targetY - startY;

                // Smooth organic Bezier curve
                const cp1x = startX + dx * 0.42;
                const cp1y = startY + dy * 0.12;
                const cp2x = startX + dx * 0.82;
                const cp2y = targetY;

                const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;

                // Midpoint waypoint calculation (at t = 0.52)
                const t = 0.52;
                const mt = 1 - t;
                const midX = mt * mt * mt * startX + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * targetX;
                const midY = mt * mt * mt * startY + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * targetY;

                return (
                  <g key={`beam-${st.id}`}>
                    {/* Animated Flowing Dashed Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isSelected ? "#0052cc" : "#38bdf8"}
                      strokeWidth={isSelected ? "2.6" : "1.6"}
                      strokeDasharray="6 5"
                      className="state-connector-line transition-all duration-300"
                      filter={isSelected ? "url(#lineGlow)" : undefined}
                      opacity={isSelected ? "1" : "0.75"}
                    />

                    {/* Cyan Waypoint Dot along the path */}
                    <circle
                      cx={midX}
                      cy={midY}
                      r={isSelected ? "4" : "3"}
                      fill={isSelected ? "#00f0ff" : "#38bdf8"}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      filter="drop-shadow(0 0 4px rgba(0,240,255,0.7))"
                    />

                    {/* Glowing Energy Particle gliding along curve */}
                    <circle r={isSelected ? "3.5" : "2.2"} fill={isSelected ? "#00f0ff" : "#0052cc"}>
                      <animateMotion path={pathD} dur={`${1.8 + idx * 0.25}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}
            </g>

            {/* C. MIDDLE COLUMN: 6 STATE PILL CARDS (COMPACT HEIGHT 52px) */}
            <foreignObject x={cardsStartX} y="0" width="280" height="550">
              <div className="relative w-full h-full select-none">
                {presenceStates.map((st, idx) => {
                  const isSelected = activeState.id === st.id;
                  const top = cardTops[idx];

                  return (
                    <div
                      key={`card-${st.id}`}
                      onClick={() => setSelectedStateId(st.id)}
                      onMouseEnter={() => setHoveredStateId(st.id)}
                      onMouseLeave={() => setHoveredStateId(null)}
                      style={{ top: `${top}px`, height: `${cardHeight}px` }}
                      className={`absolute left-0 right-0 flex items-center gap-2.5 px-3 rounded-full bg-white transition-all duration-300 cursor-pointer shadow-sm ${
                        isSelected
                          ? "ring-2 ring-[#0052cc] shadow-md shadow-blue-500/20 translate-x-1.5 bg-gradient-to-r from-blue-50 via-white to-white"
                          : "border border-slate-100 hover:border-blue-300 hover:shadow hover:translate-x-1"
                      }`}
                    >
                      {/* State Code Badge (e.g. TG, MH, UP, AP, TN, JK) */}
                      <div
                        className={`relative h-9 w-9 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-xs tracking-wider transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-br from-[#0052cc] to-[#002f80] text-white shadow-sm ring-1 ring-white/80"
                            : "bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] text-[#0052cc] border border-blue-200/80"
                        }`}
                      >
                        <span>{st.code}</span>
                      </div>

                      {/* State Name */}
                      <div className="min-w-0 flex-1 pr-1">
                        <h4
                          className={`text-[13px] font-extrabold font-display truncate transition-colors leading-tight ${
                            isSelected ? "text-[#003366]" : "text-slate-800"
                          }`}
                        >
                          {st.name}
                        </h4>
                        <p className="text-[9.5px] text-slate-500 font-medium truncate font-sans leading-tight mt-0.5">
                          {st.isHq ? "★ Corporate HQ" : st.capital}
                        </p>
                      </div>

                      {/* Active Indicator Dot */}
                      {isSelected ? (
                        <span className="h-2 w-2 rounded-full bg-[#0052cc] shrink-0 mr-1 animate-pulse shadow-[0_0_6px_#0052cc]" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200 shrink-0 mr-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </foreignObject>

            {/* D. RIGHT COLUMN: "OUR SERVICE STATES" PREVIEW PANEL (COMPACT HEIGHT) */}
            <foreignObject x="1060" y="25" width="350" height="505">
              <div className="h-full rounded-2xl bg-gradient-to-b from-white via-white to-[#f5f9ff] border border-blue-100 p-4 sm:p-5 shadow-lg flex flex-col justify-between">
                {/* Header Pill */}
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#0052cc] px-3 py-1.5 text-[11px] font-extrabold text-white shadow-sm">
                    <MapPin className="h-3.5 w-3.5 text-white" />
                    <span>Our Service States</span>
                  </div>
                  {activeState.isHq && (
                    <span className="text-[9px] font-mono font-bold text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      GLOBAL HQ
                    </span>
                  )}
                </div>

                {/* Mini Preview Map */}
                <div className="relative w-full aspect-[1/1] max-h-[145px] mx-auto flex items-center justify-center my-0.5">
                  <svg viewBox="0 0 1000 1000" className="w-full h-full object-contain">
                    {/* Entire Outer Outline */}
                    <g stroke="#60a5fa" strokeWidth="2.5" strokeLinejoin="round" fill="none">
                      {statesData.map((st: any) => (
                        <path key={`mini-out-${st.id}`} d={st.d} />
                      ))}
                    </g>
                    {/* All background states */}
                    <g fill="#ffffff" stroke="#9ec2eb" strokeWidth="1.2">
                      {statesData.map((st: any) => (
                        <path key={`mini-${st.id}`} d={st.d} />
                      ))}
                    </g>
                    {/* Highlighted states */}
                    <g>
                      {presenceStates.map((st) => {
                        const d = statePathsMap.get(st.id);
                        if (!d) return null;
                        const isSelected = activeState.id === st.id;
                        return (
                          <path
                            key={`m-st-${st.id}`}
                            d={d}
                            fill={isSelected ? "#003399" : "#0052cc"}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                    </g>
                    {/* Active State Pin */}
                    <g transform={`translate(${activeState.rawPinX}, ${activeState.rawPinY - 20})`}>
                      <g className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] animate-bounce">
                        <path
                          d="M 0 0 C -8 -8, -8 -20, 0 -28 C 8 -20, 8 -8, 0 0 Z"
                          fill="#0052cc"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <circle cx="0" cy="-16" r="4" fill="#ffffff" />
                      </g>
                    </g>
                  </svg>
                </div>

                {/* State Details */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#002f6c] font-display leading-tight">
                      {activeState.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{activeState.capital} Hub</p>
                  </div>

                  <div className="bg-[#f2f7fd] rounded-xl p-2.5 space-y-1 border border-blue-50 text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#0052cc] shrink-0 mt-0.5" />
                      <span className="text-slate-700 leading-tight">
                        <strong className="text-slate-900 block font-bold">Venue:</strong>
                        {activeState.venues}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-blue-100/60 text-[10px] text-slate-600">
                      <Calendar className="h-3 w-3 text-[#0052cc] shrink-0" />
                      <span>{activeState.annualSummits}</span>
                      <span className="text-slate-300">•</span>
                      <Users className="h-3 w-3 text-[#0052cc] shrink-0" />
                      <span>{activeState.delegates}</span>
                    </div>
                  </div>

                  <Link
                    to="/events"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] py-2 text-xs font-bold text-white shadow-sm transition-all font-btn cursor-pointer"
                  >
                    <span>Explore {activeState.name} Summits</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* ========================================================= */}
        {/* 3. MOBILE & TABLET RESPONSIVE VIEW (< 1024px)             */}
        {/* ========================================================= */}
        <div className="block lg:hidden space-y-6">
          {/* Mobile Map */}
          <div className="relative w-full max-w-[380px] aspect-[1/1] mx-auto">
            <svg viewBox="0 0 1000 1000" className="w-full h-full object-contain filter drop-shadow-md">
              {/* Outer boundary stroke */}
              <g stroke="#4b8de8" strokeWidth="3" strokeLinejoin="round" fill="none">
                {statesData.map((st: any) => (
                  <path key={`mob-out-${st.id}`} d={st.d} />
                ))}
              </g>
              {/* Background states with clear borders */}
              <g fill="#ffffff" stroke="#9ec2eb" strokeWidth="1.2">
                {statesData
                  .filter((st: any) => !presenceStates.some((ps) => ps.id === st.id))
                  .map((st: any) => (
                    <path key={`mob-${st.id}`} d={st.d} />
                  ))}
              </g>
              {/* Highlighted states */}
              <g>
                {presenceStates.map((st) => {
                  const d = statePathsMap.get(st.id);
                  if (!d) return null;
                  const isSelected = activeState.id === st.id;
                  return (
                    <path
                      key={`mob-st-${st.id}`}
                      d={d}
                      onClick={() => setSelectedStateId(st.id)}
                      fill={isSelected ? "#003399" : "#0052cc"}
                      stroke="#002b66"
                      strokeWidth="1.8"
                    />
                  );
                })}
              </g>
              {/* Pins on Mobile */}
              {presenceStates.map((st) => (
                <circle
                  key={`mob-pin-${st.id}`}
                  cx={st.rawPinX}
                  cy={st.rawPinY}
                  r={activeState.id === st.id ? "10" : "7"}
                  fill="#ffffff"
                  stroke="#0052cc"
                  strokeWidth="3"
                  onClick={() => setSelectedStateId(st.id)}
                />
              ))}
            </svg>
          </div>

          {/* Mobile State Pills Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {presenceStates.map((st) => {
              const isSelected = activeState.id === st.id;
              return (
                <button
                  key={`mob-pill-${st.id}`}
                  onClick={() => setSelectedStateId(st.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl border text-left transition-all ${
                    isSelected ? "bg-blue-50 border-[#0052cc] shadow-md" : "bg-white border-slate-100"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-xs tracking-wider transition-all ${
                      isSelected
                        ? "bg-gradient-to-br from-[#0052cc] to-[#002f80] text-white shadow-sm"
                        : "bg-blue-100 text-[#0052cc]"
                    }`}
                  >
                    <span>{st.code}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">{st.name}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Details Box */}
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#002f6c]">{activeState.name}</h3>
              <span className="text-xs font-bold text-[#0052cc] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {activeState.tag}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">📍 {activeState.venues}</p>
            <Link
              to="/events"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0052cc] py-2 text-xs font-bold text-white shadow"
            >
              <span>Explore Summits</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Embedded Dash Flow Animation */}
      <style>{`
        @keyframes lineMotionFlow {
          from {
            stroke-dashoffset: 40;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .state-connector-line {
          animation: lineMotionFlow 1.2s linear infinite;
        }
      `}</style>
    </section>
  );
}
