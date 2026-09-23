import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logoFinal from "@/assets/logo-final.png";
import { Sparkles } from "lucide-react";

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment progress counter for visual effect
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 120);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="website-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white overflow-hidden select-none pointer-events-auto"
        >
          {/* Ambient Glowing Background Orbs */}
          <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-600/25 blur-[120px] animate-pulse" />

          {/* Centered Logo Box with Orbital Rotating Glow */}
          <div className="relative flex flex-col items-center justify-center px-4">
            {/* Rotating Outer Glow Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute -inset-6 rounded-full border border-dashed border-cyan-400/40 shadow-[0_0_40px_rgba(0,174,239,0.3)]"
            />

            {/* Inner Pulsing Pulse Ring */}
            <motion.div
              animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-r from-cyan-500/30 to-purple-600/30 blur-xl"
            />

            {/* Centered Container for Transparent Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex items-center justify-center p-3 bg-transparent"
            >
              <img
                src={logoFinal}
                alt="ET Media"
                className="h-16 sm:h-20 lg:h-24 w-auto object-contain drop-shadow-[0_0_25px_rgba(0,174,239,0.5)]"
              />
            </motion.div>
          </div>

          {/* Text and Loading Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-8 flex flex-col items-center text-center px-4 max-w-sm sm:max-w-md"
          >
            {/* Brand Title */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-cyan-400 font-display">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
              <span>ET Media</span>
            </div>

            {/* Subtitle */}
            <p className="mt-2 text-xs sm:text-sm font-medium text-slate-300 tracking-wide font-sans">
              Connecting <span className="text-cyan-400 font-bold">Ideas</span>.{" "}
              <span className="text-purple-400 font-bold">People</span>.{" "}
              <span className="text-cyan-300 font-bold">Opportunities</span>.
            </p>

            {/* Progress Bar Container */}
            <div className="mt-6 w-56 sm:w-72 h-1.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_15px_#00AEEF]"
              />
            </div>

            {/* Percentage Indicator */}
            <div className="mt-2.5 text-[11px] font-mono font-semibold tracking-wider text-slate-400">
              Loading Website... {Math.min(progress, 100)}%
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
