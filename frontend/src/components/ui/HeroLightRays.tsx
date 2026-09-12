import { motion } from "framer-motion";

export function HeroLightRays() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Volumetric Moving Light Rays */}
      <motion.div
        animate={{
          x: ["-20%", "20%", "-20%"],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-1/2 -left-1/4 h-[200%] w-[150%] origin-top-left rotate-12 bg-gradient-to-b from-cyan-400/20 via-purple-600/15 to-transparent blur-3xl"
      />

      <motion.div
        animate={{
          x: ["20%", "-20%", "20%"],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -top-1/2 -right-1/4 h-[200%] w-[150%] origin-top-right -rotate-12 bg-gradient-to-b from-purple-500/20 via-cyan-400/15 to-transparent blur-3xl"
      />

      {/* Floating Ambient Particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${(i * 7) % 100}%`,
            y: "110%",
            opacity: 0.2 + (i % 5) * 0.15,
            scale: 0.6 + (i % 3) * 0.4,
          }}
          animate={{
            y: ["110%", "-10%"],
            x: [`${(i * 7) % 100}%`, `${((i * 7) + 8) % 100}%`],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 8 + (i % 6) * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.6,
          }}
          className="absolute h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,174,239,0.8)]"
        />
      ))}
    </div>
  );
}
