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
  name: string;
  capital: string;
  image: string;
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
    name: "Jammu & Kashmir",
    capital: "Srinagar / Jammu",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=160&auto=format&fit=crop&q=80",
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
    name: "Uttar Pradesh",
    capital: "Lucknow / Noida",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=160&auto=format&fit=crop&q=80",
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
    name: "Maharashtra",
    capital: "Mumbai / Pune",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=160&auto=format&fit=crop&q=80",
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
    name: "Telangana",
    capital: "Hyderabad",
    image: "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?w=160&auto=format&fit=crop&q=80",
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
    name: "Andhra Pradesh",
    capital: "Visakhapatnam / Amaravati",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=160&auto=format&fit=crop&q=80",
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
    name: "Tamil Nadu",
    capital: "Chennai",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=160&auto=format&fit=crop&q=80",
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

  // Map scale and translation for Desktop Unified Canvas: viewBox="0 0 1440 760"
  const mapScale = 0.72;
  const mapOffsetX = 40;
  const mapOffsetY = 20;

  // Middle cards column position & exact top coordinates
  const cardsStartX = 750;
  const cardHeight = 68;
  const cardTops = [65, 165, 265, 365, 465, 565];

  return (
    <section
      id="service-states"
      className="relative overflow-hidden bg-gradient-to-b from-[#f2f7fd] via-[#f8fbff] to-[#ebf4fe] py-16 sm:py-24 text-slate-900 border-t border-blue-100 select-none"
    >
      {/* Background Soft Ambient Auras */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-200/30 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-200/35 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#0052cc_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="container-x relative z-10 max-w-[1480px]">
        {/* ========================================================= */}
        {/* 1. SECTION HEADER                                         */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-extrabold tracking-[0.25em] text-[#0052cc] uppercase font-mono">
            <span className="w-8 sm:w-12 h-[1.5px] bg-gradient-to-r from-transparent to-[#0052cc]" />
            <span>PAN INDIA PRESENCE</span>
            <span className="w-8 sm:w-12 h-[1.5px] bg-gradient-to-l from-transparent to-[#0052cc]" />
          </div>

          <h2 className="mt-3 text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold font-display text-[#002f6c] tracking-tight leading-tight">
            Our Service States
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Delivering quality services across key states in India, with a commitment to growth and excellence.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 2. DESKTOP UNIFIED 1440x760 SVG CANVAS                    */}
        {/* Connecting lines start LITERALLY at the state pins!       */}
        {/* ========================================================= */}
        <div className="hidden lg:block relative w-full aspect-[1440/760] max-h-[760px] mx-auto filter drop-shadow-[0_15px_35px_rgba(0,51,102,0.08)]">
          <svg viewBox="0 0 1440 760" className="w-full h-full">
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
                <feGaussianBlur stdDeviation="3.5" result="blur" />
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
                      y={st.labelY - 5}
                      textAnchor={st.labelAlign === "right" ? "end" : "start"}
                      fill="#0f172a"
                      fontSize="20"
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
                      <circle r="18" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8">
                        <animate attributeName="r" from="6" to="26" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.9" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      {/* Outer Sonar Ping 2 */}
                      <circle r="12" fill="none" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6">
                        <animate attributeName="r" from="4" to="20" dur="2s" begin="0.7s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.8" to="0" dur="2s" begin="0.7s" repeatCount="indefinite" />
                      </circle>
                      {/* Center Core */}
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
                      strokeWidth={isSelected ? "2.8" : "1.8"}
                      strokeDasharray="6 5"
                      className="state-connector-line transition-all duration-300"
                      filter={isSelected ? "url(#lineGlow)" : undefined}
                      opacity={isSelected ? "1" : "0.75"}
                    />

                    {/* Cyan Waypoint Dot along the path */}
                    <circle
                      cx={midX}
                      cy={midY}
                      r={isSelected ? "4.5" : "3.5"}
                      fill={isSelected ? "#00f0ff" : "#38bdf8"}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 0 4px rgba(0,240,255,0.7))"
                    />

                    {/* Glowing Energy Particle gliding along curve */}
                    <circle r={isSelected ? "4" : "2.5"} fill={isSelected ? "#00f0ff" : "#0052cc"}>
                      <animateMotion path={pathD} dur={`${1.8 + idx * 0.25}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}
            </g>

            {/* C. MIDDLE COLUMN: 6 STATE PILL CARDS (PRECISION ABSOLUTE POSITIONING) */}
            <foreignObject x={cardsStartX} y="0" width="280" height="760">
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
                      className={`absolute left-0 right-0 flex items-center gap-3 p-2.5 rounded-full bg-white transition-all duration-300 cursor-pointer shadow-md ${
                        isSelected
                          ? "ring-2 ring-[#0052cc] shadow-xl shadow-blue-500/20 translate-x-2 bg-gradient-to-r from-blue-50 via-white to-white"
                          : "border border-slate-100 hover:border-blue-300 hover:shadow-lg hover:translate-x-1"
                      }`}
                    >
                      {/* Round Landmark Photo */}
                      <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md bg-blue-100 flex items-center justify-center">
                        <img
                          src={st.image}
                          alt={st.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <span className="text-[11px] font-black text-blue-700 uppercase">
                          {st.id.substring(2)}
                        </span>
                      </div>

                      {/* State Name */}
                      <div className="min-w-0 flex-1 pr-1">
                        <h4
                          className={`text-sm font-extrabold font-display truncate transition-colors ${
                            isSelected ? "text-[#003366]" : "text-slate-800"
                          }`}
                        >
                          {st.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium truncate font-sans">
                          {st.isHq ? "★ Corporate Headquarters" : st.capital}
                        </p>
                      </div>

                      {/* Active Indicator Dot */}
                      {isSelected ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#0052cc] shrink-0 mr-2 animate-pulse shadow-[0_0_8px_#0052cc]" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-200 shrink-0 mr-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </foreignObject>

            {/* D. RIGHT COLUMN: "OUR SERVICE STATES" PREVIEW PANEL */}
            <foreignObject x="1080" y="60" width="340" height="630">
              <div className="h-full rounded-3xl bg-gradient-to-b from-white via-white to-[#f5f9ff] border border-blue-100 p-6 shadow-xl flex flex-col justify-between">
                {/* Header Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-[#0052cc] px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-blue-600/25">
                    <MapPin className="h-4 w-4 text-white" />
                    <span>Our Service States</span>
                  </div>
                  {activeState.isHq && (
                    <span className="text-[10px] font-mono font-bold text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      GLOBAL HQ
                    </span>
                  )}
                </div>

                {/* Mini Preview Map */}
                <div className="relative w-full aspect-[1/1] max-h-[190px] mx-auto flex items-center justify-center my-1">
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
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#002f6c] font-display">
                      {activeState.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{activeState.capital} Hub</p>
                  </div>

                  <div className="bg-[#f2f7fd] rounded-2xl p-3 space-y-1.5 border border-blue-50 text-xs">
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-[#0052cc] shrink-0 mt-0.5" />
                      <span className="text-slate-700 leading-tight">
                        <strong className="text-slate-900 block font-bold">Venue:</strong>
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

                  <Link
                    to="/events"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0052cc] hover:bg-[#0041a8] py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all font-btn cursor-pointer"
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
        <div className="block lg:hidden space-y-8">
          {/* Mobile Map */}
          <div className="relative w-full max-w-[420px] aspect-[1/1] mx-auto">
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
                  <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                    <img src={st.image} alt={st.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">{st.name}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Details Box */}
          <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#002f6c]">{activeState.name}</h3>
              <span className="text-xs font-bold text-[#0052cc] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {activeState.tag}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">📍 {activeState.venues}</p>
            <Link
              to="/events"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0052cc] py-2.5 text-xs font-bold text-white shadow"
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
