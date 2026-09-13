import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Users, Handshake, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedGlobe } from "@/components/ui/AnimatedGlobe";
import { MagneticButton } from "@/components/ui/MagneticButton";

const statsList = [
  {
    icon: Calendar,
    value: "100+",
    label: "Events Hosted",
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
  },
  {
    icon: Users,
    value: "50,000+",
    label: "Delegates Connected",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    icon: Handshake,
    value: "500+",
    label: "Industry Partners",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    icon: Globe,
    value: "8+",
    label: "Countries",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
];

export function HeroSection() {
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  // Auto-rotate stats highlight indicator every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % statsList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#f4f8fc] via-[#edf4fa] via-60% to-[#e2edf8] pt-20 sm:pt-22 lg:pt-24 pb-3 sm:pb-4 text-slate-900 border-b border-slate-200/80">
      
      {/* Background Radial Atmosphere Glow behind Globe */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,174,239,0.18)_0%,rgba(147,51,234,0.08)_40%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(#00aeef_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07] pointer-events-none" />

      {/* BOTTOM GLOBAL CITY SKYLINE GRAPHIC BACKGROUND (ABSOLUTE DECORATIVE) */}
      <div className="absolute bottom-0 inset-x-0 h-20 sm:h-28 pointer-events-none overflow-hidden opacity-25 select-none z-0">
        <svg className="w-full h-full text-slate-400" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
          {/* Taj Mahal & India Gate Skyline Silhouettes */}
          <path d="M0 120 V100 H15 V120 H30 V90 H45 V120 H60 V80 H75 V120 H90 V105 H105 V120 H120 V70 L135 60 L150 70 V120 H165 V95 H180 V120 H200 V85 H220 V120 H240 V60 H255 V50 H270 V60 H285 V120 H310 V90 H330 V120 H360 V40 L375 20 L390 40 V120 H420 V85 H440 V120 H470 V65 H490 V120 H520 V30 L535 15 L550 30 V120 H580 V75 H600 V120 H630 V50 H645 V35 H660 V50 H675 V120 H700 V85 H720 V120 H750 V20 L765 10 L780 20 V120 H810 V70 H830 V120 H860 V55 H875 V45 H890 V55 H905 V120 H930 V90 H950 V120 H980 V35 L995 20 L1010 35 V120 H1040 V80 H1060 V120 H1090 V60 H1110 V120 H1140 V95 H1160 V120 H1200 V120 Z" />
        </svg>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="container-x relative z-10 flex flex-col justify-between">
        
        {/* TOP ROW: TWO COLUMNS (LEFT CONTENT & RIGHT INTERACTIVE GLOBE) */}
        <div className="grid gap-4 lg:grid-cols-12 items-center">
          
          {/* LEFT COLUMN: BRANDING, HEADLINE, LOCATIONS & CTAS */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            
            {/* Top Subtitle Kicker */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 font-btn"
            >
              <span>E T &nbsp; M E D I A &nbsp; — &nbsp; O U R &nbsp; E V E N T &nbsp; N E T W O R K</span>
            </motion.div>

            {/* Main Headline (Strictly 2 Lines) */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-black tracking-tight text-slate-900 font-display leading-[1.15]"
            >
              <span className="block whitespace-nowrap">
                Connecting{" "}
                <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ideas. People.
                </span>
              </span>
              <span className="block">Opportunities.</span>
            </motion.h1>

            {/* Subtext Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium max-w-xl leading-relaxed"
            >
              A global platform for business intelligence, thought leadership and meaningful collaborations.
            </motion.p>

            {/* ACTION BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2"
            >
              <MagneticButton
                strength={20}
                className="gradient-brand rounded-full px-7 py-3 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_25px_-5px_rgba(0,174,239,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(0,174,239,0.7)] hover:scale-[1.03] transition-all duration-300 cursor-pointer"
              >
                <Link to="/events" className="flex items-center gap-2 font-btn">
                  <span>Explore Events</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </MagneticButton>

              <MagneticButton
                strength={15}
                className="rounded-full border border-slate-300/90 bg-white/90 hover:bg-white px-6 py-3 text-xs sm:text-sm font-extrabold text-slate-800 shadow-sm hover:border-cyan-500 hover:text-cyan-700 transition-all duration-200 cursor-pointer"
              >
                <Link to="/events/partner" className="font-btn">
                  Partner With Us
                </Link>
              </MagneticButton>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: 3D GLOBE WITH ATMOSPHERE, VERTICAL TEXT & CALLIGRAPHY */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* Top Right Vertical Tagline */}
            <div className="hidden xl:flex absolute top-0 right-2 flex-col items-end text-right select-none z-20 pointer-events-none">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 font-mono">IDEAS</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 font-mono">PEOPLE</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 font-mono">IMPACT</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-600 font-mono font-bold">GLOBALLY</span>
              <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-500 to-purple-500 mt-1" />
            </div>

            {/* 3D Animated Interactive Canvas Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[400px]"
            >
              <AnimatedGlobe />
            </motion.div>

            {/* Bottom Right Calligraphic Cursive Accent Text */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute bottom-0 right-2 sm:right-6 select-none pointer-events-none z-20"
            >
              <div className="relative">
                <span
                  style={{ fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', cursive" }}
                  className="text-xl sm:text-2xl font-extrabold text-slate-700/85 tracking-wide transform -rotate-6 block drop-shadow-sm"
                >
                  A More Connected Tomorrow
                </span>
                <svg className="w-40 h-2.5 text-cyan-500/60 ml-auto -mt-0.5" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8C50 2 150 12 198 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>

          </div>

        </div>

        {/* BOTTOM FLOATING STATS CARD BAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-20 mt-3 sm:mt-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-4 shadow-[0_15px_40px_-10px_rgba(0,174,239,0.18)] backdrop-blur-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* 4 COUNTER STATISTICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              {statsList.map((st, idx) => {
                const IconComp = st.icon;
                const isActive = idx === activeStatIndex;
                return (
                  <div
                    key={st.label}
                    onClick={() => setActiveStatIndex(idx)}
                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-cyan-50/80 border-cyan-300 shadow-sm scale-[1.01]"
                        : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border ${st.color}`}>
                      <IconComp className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-black font-display text-slate-900 leading-none">
                        {st.value}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-slate-600 mt-1 whitespace-nowrap">
                        {st.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT TAGLINE & CONTROLS */}
            <div className="hidden xl:flex items-center gap-3 pl-3 border-l border-slate-200 shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">KNOWLEDGE</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">NETWORKS</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-cyan-600 font-bold block">OPPORTUNITIES —</span>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center gap-1">
                {statsList.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveStatIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === activeStatIndex ? "w-5 bg-cyan-500" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveStatIndex((prev) => (prev === 0 ? statsList.length - 1 : prev - 1))}
                  className="rounded-full border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStatIndex((prev) => (prev + 1) % statsList.length)}
                  className="rounded-full border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
