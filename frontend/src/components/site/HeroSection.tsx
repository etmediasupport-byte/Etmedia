import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Users, Handshake, Globe, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { AnimatedGlobe } from "@/components/ui/AnimatedGlobe";
import { MagneticButton } from "@/components/ui/MagneticButton";

const heroPhrases = [
  {
    prefix: "Connecting",
    gradientText: "Ideas. People.",
    line2: "Opportunities.",
    subtext: "A global platform for business intelligence, thought leadership and meaningful collaborations.",
    kicker: "E T  M E D I A  —  O U R  E V E N T  N E T W O R K",
  },
  {
    prefix: "Empowering",
    gradientText: "CFOs. HR Leaders.",
    line2: "Industry Pioneers.",
    subtext: "Elevating C-suite conversations, executive keynotes, and strategic corporate summits worldwide.",
    kicker: "E L E V A T I N G  C - S U I T E  L E A D E R S H I P",
  },
  {
    prefix: "Accelerating",
    gradientText: "Intelligence. Tech.",
    line2: "Global Growth.",
    subtext: "Unlocking high-impact networking, premier delegate experiences, and transformative partnerships.",
    kicker: "P R E M I E R  B U S I N E S S  I N T E L L I G E N C E",
  },
];

const statsList = [
  {
    icon: Calendar,
    value: "100+",
    label: "Events Hosted",
    color: "text-cyan-400 bg-cyan-950/70 border-cyan-500/40",
  },
  {
    icon: Users,
    value: "50,000+",
    label: "Delegates Connected",
    color: "text-purple-400 bg-purple-950/70 border-purple-500/40",
  },
  {
    icon: Handshake,
    value: "500+",
    label: "Industry Partners",
    color: "text-blue-400 bg-blue-950/70 border-blue-500/40",
  },
  {
    icon: Globe,
    value: "8+",
    label: "Countries",
    color: "text-emerald-400 bg-emerald-950/70 border-emerald-500/40",
  },
];

export function HeroSection() {
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const currentPhrase = heroPhrases[phraseIndex] ?? heroPhrases[0]!;

  // Auto-rotate stats highlight indicator every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % statsList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate text transition phrases every 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black text-slate-100 border-b border-zinc-800/90 pt-[60px] sm:pt-[64px] lg:pt-[68px] pb-3 sm:pb-4">
      
      {/* Background Radial Atmosphere Glow behind Globe & Content */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,174,239,0.25)_0%,rgba(75,31,167,0.18)_45%,transparent_75%)] pointer-events-none blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(20,198,248,0.12)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* BOTTOM GLOBAL CITY SKYLINE GRAPHIC BACKGROUND (ABSOLUTE DECORATIVE) */}
      <div className="absolute bottom-0 inset-x-0 h-20 sm:h-28 pointer-events-none overflow-hidden opacity-30 select-none z-0">
        <svg className="w-full h-full text-zinc-800" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
          {/* Taj Mahal & India Gate Skyline Silhouettes */}
          <path d="M0 120 V100 H15 V120 H30 V90 H45 V120 H60 V80 H75 V120 H90 V105 H105 V120 H120 V70 L135 60 L150 70 V120 H165 V95 H180 V120 H200 V85 H220 V120 H240 V60 H255 V50 H270 V60 H285 V120 H310 V90 H330 V120 H360 V40 L375 20 L390 40 V120 H420 V85 H440 V120 H470 V65 H490 V120 H520 V30 L535 15 L550 30 V120 H580 V75 H600 V120 H630 V50 H645 V35 H660 V50 H675 V120 H700 V85 H720 V120 H750 V20 L765 10 L780 20 V120 H810 V70 H830 V120 H860 V55 H875 V45 H890 V55 H905 V120 H930 V90 H950 V120 H980 V35 L995 20 L1010 35 V120 H1040 V80 H1060 V120 H1090 V60 H1110 V120 H1140 V95 H1160 V120 H1200 V120 Z" />
        </svg>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="container-x relative z-10 flex flex-col justify-between pt-1 sm:pt-2">
        
        {/* TOP ROW: TWO COLUMNS (LEFT CONTENT & RIGHT INTERACTIVE GLOBE) */}
        <div className="grid gap-3 lg:grid-cols-12 items-center">
          
          {/* LEFT COLUMN: BRANDING, HEADLINE, LOCATIONS & CTAS */}
          <div className="lg:col-span-6 space-y-2.5 sm:space-y-3">
            
            {/* Dynamic Animated Text Section with Motion & Blur Transitions */}
            <div className="min-h-[160px] sm:min-h-[175px] lg:min-h-[190px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2 sm:space-y-2.5"
                >
                  {/* Top Subtitle Kicker */}
                  <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-cyan-400 font-btn">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    <span>{currentPhrase.kicker}</span>
                  </div>

                  {/* Main Dynamic Headline */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-black tracking-tight text-white font-display leading-[1.15]">
                    <span className="block sm:whitespace-nowrap">
                      {currentPhrase.prefix}{" "}
                      <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,174,239,0.35)]">
                        {currentPhrase.gradientText}
                      </span>
                    </span>
                    <span className="block">{currentPhrase.line2}</span>
                  </h1>

                  {/* Subtext Paragraph */}
                  <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium max-w-xl leading-relaxed">
                    {currentPhrase.subtext}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Phrase Selector Dots */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {heroPhrases.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Phrase ${i + 1}`}
                  onClick={() => setPhraseIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === phraseIndex
                      ? "w-6 bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_10px_#00AEEF]"
                      : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2"
            >
              <MagneticButton
                strength={20}
                className="gradient-brand rounded-full px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(0,174,239,0.5)] hover:shadow-[0_15px_38px_rgba(0,174,239,0.7)] hover:scale-[1.03] transition-all duration-300 cursor-pointer"
              >
                <Link to="/events" className="flex items-center gap-2 font-btn">
                  <span>Explore Events</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </MagneticButton>

              <MagneticButton
                strength={15}
                className="rounded-full border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-slate-200 shadow-sm hover:border-cyan-500/60 hover:text-cyan-300 transition-all duration-200 cursor-pointer"
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
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 font-mono font-bold">GLOBALLY</span>
              <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-400 to-purple-500 mt-1" />
            </div>

            {/* 3D Animated Interactive Canvas Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[380px] lg:max-w-[400px]"
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
                  className="text-lg sm:text-2xl font-extrabold text-slate-200 tracking-wide transform -rotate-6 block drop-shadow-[0_2px_10px_rgba(0,174,239,0.3)]"
                >
                  A More Connected Tomorrow
                </span>
                <svg className="w-32 sm:w-40 h-2 sm:h-2.5 text-cyan-400/80 ml-auto -mt-0.5" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          className="relative z-20 mt-2.5 sm:mt-4 rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-950/85 p-2.5 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
            
            {/* 4 COUNTER STATISTICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 flex-1">
              {statsList.map((st, idx) => {
                const IconComp = st.icon;
                const isActive = idx === activeStatIndex;
                return (
                  <div
                    key={st.label}
                    onClick={() => setActiveStatIndex(idx)}
                    className={`flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-cyan-950/60 border-cyan-500/60 shadow-[0_0_20px_rgba(0,174,239,0.25)] scale-[1.01]"
                        : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/70"
                    }`}
                  >
                    <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border ${st.color}`}>
                      <IconComp className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-2xl font-black font-display text-white leading-none">
                        {st.value}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5 sm:mt-1 truncate">
                        {st.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT TAGLINE & CONTROLS */}
            <div className="hidden xl:flex items-center gap-3 pl-3 border-l border-zinc-800 shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">KNOWLEDGE</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">NETWORKS</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 font-bold block">OPPORTUNITIES —</span>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center gap-1">
                {statsList.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveStatIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === activeStatIndex ? "w-5 bg-cyan-400 shadow-[0_0_10px_#00AEEF]" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveStatIndex((prev) => (prev === 0 ? statsList.length - 1 : prev - 1))}
                  className="rounded-full border border-zinc-800 bg-zinc-900 p-1 text-slate-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStatIndex((prev) => (prev + 1) % statsList.length)}
                  className="rounded-full border border-zinc-800 bg-zinc-900 p-1 text-slate-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
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
