import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Users, Handshake, Globe, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { AnimatedGlobe } from "@/components/ui/AnimatedGlobe";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { socket } from "@/lib/socket";

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

function CounterUp({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const match = value.match(/[\d,]+/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const rawNumStr = match[0].replace(/,/g, "");
    const target = parseInt(rawNumStr, 10);
    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }

    const parts = value.split(match[0]);
    const prefix = parts[0] || "";
    const suffix = parts[1] || "";

    const duration = 1800; // 1.8 seconds counting duration
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = Math.floor(easeProgress * target);

      setDisplayValue(`${prefix}${currentNum.toLocaleString()}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}</span>;
}

export function HeroSection() {
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Dynamic hero stats loaded from database settings
  const [heroStats, setHeroStats] = useState({
    hero_stat_1_value: "101+",
    hero_stat_1_label: "Events Hosted",
    hero_stat_2_value: "50,000+",
    hero_stat_2_label: "Delegates Connected",
    hero_stat_3_value: "500+",
    hero_stat_3_label: "Industry Partners",
    hero_stat_4_value: "8+",
    hero_stat_4_label: "Countries",
  });

  // Fetch live settings & subscribe to Socket.IO updates
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setHeroStats((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch((err) => console.warn("Using default hero stats:", err));

    const handleSettingsUpdate = (updated: any) => {
      setHeroStats((prev) => ({ ...prev, ...updated }));
    };

    socket.on("settings_updated", handleSettingsUpdate);
    return () => {
      socket.off("settings_updated", handleSettingsUpdate);
    };
  }, []);

  const statsList = [
    {
      id: "stat_1",
      icon: Calendar,
      value: heroStats.hero_stat_1_value || "101+",
      label: heroStats.hero_stat_1_label || "Events Hosted",
      color: "text-cyan-400 bg-cyan-950/70 border-cyan-500/40",
      activeBorder: "border-cyan-400/90 bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-cyan-950/50 shadow-[0_0_30px_rgba(0,174,239,0.4)]",
      pulseGlow: "bg-cyan-500/20",
    },
    {
      id: "stat_2",
      icon: Users,
      value: heroStats.hero_stat_2_value || "50,000+",
      label: heroStats.hero_stat_2_label || "Delegates Connected",
      color: "text-purple-400 bg-purple-950/70 border-purple-500/40",
      activeBorder: "border-purple-400/90 bg-gradient-to-r from-purple-950/80 via-zinc-900 to-purple-950/50 shadow-[0_0_30px_rgba(168,85,247,0.4)]",
      pulseGlow: "bg-purple-500/20",
    },
    {
      id: "stat_3",
      icon: Handshake,
      value: heroStats.hero_stat_3_value || "500+",
      label: heroStats.hero_stat_3_label || "Industry Partners",
      color: "text-blue-400 bg-blue-950/70 border-blue-500/40",
      activeBorder: "border-blue-400/90 bg-gradient-to-r from-blue-950/80 via-zinc-900 to-blue-950/50 shadow-[0_0_30px_rgba(59,130,246,0.4)]",
      pulseGlow: "bg-blue-500/20",
    },
    {
      id: "stat_4",
      icon: Globe,
      value: heroStats.hero_stat_4_value || "8+",
      label: heroStats.hero_stat_4_label || "Countries",
      color: "text-emerald-400 bg-emerald-950/70 border-emerald-500/40",
      activeBorder: "border-emerald-400/90 bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-emerald-950/50 shadow-[0_0_30px_rgba(16,185,129,0.4)]",
      pulseGlow: "bg-emerald-500/20",
    },
  ];

  // Auto-rotate stats highlight indicator every 3.5s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % statsList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, statsList.length]);

  // Auto-rotate text transition phrases every 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentPhrase = heroPhrases[phraseIndex] ?? heroPhrases[0]!;

  return (
    <section className="relative w-full overflow-hidden bg-black text-slate-100 border-b border-zinc-800/90 pt-16 sm:pt-16 lg:pt-18 pb-3 sm:pb-4">
      
      {/* Background Radial Atmosphere Glow behind Globe & Content */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,174,239,0.25)_0%,rgba(75,31,167,0.18)_45%,transparent_75%)] pointer-events-none blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(20,198,248,0.12)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* BOTTOM GLOBAL CITY SKYLINE GRAPHIC BACKGROUND */}
      <div className="absolute bottom-0 inset-x-0 h-20 sm:h-28 pointer-events-none overflow-hidden opacity-30 select-none z-0">
        <svg className="w-full h-full text-zinc-800" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
          <path d="M0 120 V100 H15 V120 H30 V90 H45 V120 H60 V80 H75 V120 H90 V105 H105 V120 H120 V70 L135 60 L150 70 V120 H165 V95 H180 V120 H200 V85 H220 V120 H240 V60 H255 V50 H270 V60 H285 V120 H310 V90 H330 V120 H360 V40 L375 20 L390 40 V120 H420 V85 H440 V120 H470 V65 H490 V120 H520 V30 L535 15 L550 30 V120 H580 V75 H600 V120 H630 V50 H645 V35 H660 V50 H675 V120 H700 V85 H720 V120 H750 V20 L765 10 L780 20 V120 H810 V70 H830 V120 H860 V55 H875 V45 H890 V55 H905 V120 H930 V90 H950 V120 H980 V35 L995 20 L1010 35 V120 H1040 V80 H1060 V120 H1090 V60 H1110 V120 H1140 V95 H1160 V120 H1200 V120 Z" />
        </svg>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="container-x relative z-10 flex flex-col justify-between pt-0">
        
        {/* TOP ROW: TWO COLUMNS (LEFT CONTENT & RIGHT INTERACTIVE GLOBE) */}
        <div className="grid gap-3 lg:grid-cols-12 items-center">
          
          {/* LEFT COLUMN: BRANDING, HEADLINE, LOCATIONS & CTAS */}
          <div className="lg:col-span-6 space-y-2.5 sm:space-y-3">
            
            {/* Dynamic Animated Text Section */}
            <div className="min-h-[140px] sm:min-h-[155px] lg:min-h-[170px] flex flex-col justify-start pt-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-2 sm:space-y-2.5"
                >
                  <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-cyan-400 font-btn">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    <span>{currentPhrase.kicker}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-black tracking-tight text-white font-display leading-[1.15]">
                    <span className="block sm:whitespace-nowrap">
                      {currentPhrase.prefix}{" "}
                      <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,174,239,0.35)]">
                        {currentPhrase.gradientText}
                      </span>
                    </span>
                    <span className="block">{currentPhrase.line2}</span>
                  </h1>

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

          {/* RIGHT COLUMN: 3D GLOBE */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            <div className="hidden xl:flex absolute top-0 right-2 flex-col items-end text-right select-none z-20 pointer-events-none">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 font-mono">IDEAS</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 font-mono">PEOPLE</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 font-mono">IMPACT</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 font-mono font-bold">GLOBALLY</span>
              <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-400 to-purple-500 mt-1" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[380px] lg:max-w-[400px]"
            >
              <AnimatedGlobe />
            </motion.div>

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

        {/* BOTTOM FLOATING AUTO-SCROLLING STATS CARD BAR */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative z-20 mt-2.5 sm:mt-4 rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-950/90 p-2.5 sm:p-4 shadow-[0_25px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden group/stats"
        >
          {/* Ambient Inner Glow Beam */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 blur-xl opacity-50 group-hover/stats:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-3 overflow-hidden">
            
            {/* CAROUSEL COUNTER STATISTICS GRID CONTAINER */}
            <div
              ref={scrollContainerRef}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 flex-1 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden overflow-hidden py-1 px-0.5"
            >
              {statsList.map((st, idx) => {
                const IconComp = st.icon;
                const isActive = idx === activeStatIndex;
                return (
                  <motion.div
                    key={st.id}
                    ref={(el) => { cardRefs.current[idx] = el; }}
                    onClick={() => setActiveStatIndex(idx)}
                    whileHover={{ scale: 1.035, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`relative w-full flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-500 cursor-pointer select-none overflow-hidden ${
                      isActive
                        ? `${st.activeBorder} scale-[1.02] z-10 shadow-lg`
                        : "bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700 opacity-85 hover:opacity-100"
                    }`}
                  >
                    {/* Active Pulsing Backdrop Aura */}
                    {isActive && (
                      <motion.div
                        layoutId="activeHeroStatGlow"
                        className={`absolute inset-0 ${st.pulseGlow} pointer-events-none blur-md`}
                        transition={{ duration: 0.4 }}
                      />
                    )}

                    <div className={`relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border ${st.color} transition-transform duration-300 ${isActive ? "scale-110 shadow-md" : ""}`}>
                      <IconComp className={`h-5 w-5 sm:h-5.5 sm:w-5.5 ${isActive ? "animate-pulse" : ""}`} />
                    </div>
                    
                    <div className="relative min-w-0 flex-1">
                      <div className="text-xl sm:text-2xl xl:text-3xl font-black font-display text-white leading-none tracking-tight flex items-center gap-0.5">
                        <CounterUp value={st.value} />
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-300 mt-1 truncate uppercase tracking-wider">
                        {st.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* RIGHT TAGLINE & CONTROLS */}
            <div className="flex items-center justify-between xl:justify-end gap-3 pl-1 xl:pl-3 xl:border-l border-zinc-800/80 shrink-0 pt-1 xl:pt-0">
              <div className="text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">KNOWLEDGE</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">NETWORKS</span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold block">OPPORTUNITIES —</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Slider Dots */}
                <div className="flex items-center gap-1.5">
                  {statsList.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to stat ${i + 1}`}
                      onClick={() => setActiveStatIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === activeStatIndex
                          ? "w-6 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_#00AEEF]"
                          : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                      }`}
                    />
                  ))}
                </div>

                {/* Prev / Next Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous stat"
                    onClick={() => setActiveStatIndex((prev) => (prev === 0 ? statsList.length - 1 : prev - 1))}
                    className="rounded-full border border-zinc-800 bg-zinc-900/90 p-1.5 text-slate-300 hover:border-cyan-500/50 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next stat"
                    onClick={() => setActiveStatIndex((prev) => (prev + 1) % statsList.length)}
                    className="rounded-full border border-zinc-800 bg-zinc-900/90 p-1.5 text-slate-300 hover:border-cyan-500/50 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

