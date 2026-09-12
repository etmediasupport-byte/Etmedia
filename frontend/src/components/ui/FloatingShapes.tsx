import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingShapesProps {
  className?: string;
}

export function FloatingShapes({ className }: FloatingShapesProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden z-0", className)}>
      {/* Orb 1 */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#00AEEF]/20 to-[#4B1FA7]/30 blur-3xl"
      />

      {/* Orb 2 */}
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-gradient-to-tr from-[#14C6F8]/25 to-[#4B1FA7]/35 blur-3xl"
      />

      {/* Floating 3D Glass Ring / Cube */}
      <motion.div
        animate={{
          rotate: [0, 180, 360],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear",
        }}
        className="glass-dark absolute top-1/4 right-1/4 h-24 w-24 rounded-3xl border border-white/20 backdrop-blur-md opacity-40 shadow-2xl"
      />

      <motion.div
        animate={{
          rotate: [360, 180, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="glass-dark absolute bottom-1/4 left-12 h-32 w-32 rounded-full border border-cyan-400/20 backdrop-blur-md opacity-30 shadow-2xl"
      />
    </div>
  );
}
