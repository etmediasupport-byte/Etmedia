import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Award, Calendar, Flag, Rocket, Sparkles, Trophy } from "lucide-react";

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const milestones: Milestone[] = [
  {
    year: "2021",
    title: "Foundation of ET Media Hub",
    description: "Launched in Hyderabad to bring C-suite leaders and enterprise decision-makers onto a single strategic platform.",
    icon: Rocket,
    tag: "Inception",
  },
  {
    year: "2022",
    title: "Inaugural CFO & Leadership Summit",
    description: "Hosted 250+ Chief Financial Officers and finance heads in Mumbai & Bengaluru to shape post-pandemic capital strategies.",
    icon: Calendar,
    tag: "Milestone Event",
  },
  {
    year: "2023",
    title: "Executive Talks Magazine Launch",
    description: "Published Issue 01 of Executive Talks Magazine, delivering deep C-suite interviews and sector intelligence nationwide.",
    icon: Sparkles,
    tag: "Media Launch",
  },
  {
    year: "2024",
    title: "National HR Excellence & AI Conclave",
    description: "Expanded across 6 major metropolitan hubs (Hyderabad, Bengaluru, Delhi NCR, Pune, Chennai, Mumbai).",
    icon: Trophy,
    tag: "Expansion",
  },
  {
    year: "2025",
    title: "Global Capability Center Expansion",
    description: "Crossed 1,500+ CXO delegates and 200+ partner enterprise brands, establishing cross-border platforms in Dubai & Southeast Asia.",
    icon: Award,
    tag: "Global Footprint",
  },
  {
    year: "2026+",
    title: "Next-Gen AI Business Intelligence Platform",
    description: "Integrating real-time digital networking, live hybrid summits, and automated executive matchmaking.",
    icon: Flag,
    tag: "Future Vision",
  },
];

export const Timeline: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto py-12 px-4 sm:px-6">
      {/* Central Connector Line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 rounded-full overflow-hidden">
        <motion.div
          style={{ scaleY }}
          className="w-full h-full bg-gradient-to-b from-cyan-500 via-purple-600 to-pink-500 origin-top shadow-[0_0_12px_rgba(0,174,239,0.8)]"
        />
      </div>

      {/* Timeline Items */}
      <div className="space-y-12">
        {milestones.map((item, index) => {
          const isEven = index % 2 === 0;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col md:flex-row items-start md:items-center ${
                isEven ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Content Card */}
              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:px-8">
                <div className="group relative overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-none rounded-bl-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 md:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-cyan-500/50 hover:-translate-y-1">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-sm font-extrabold font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-3 py-1 rounded-full">
                      {item.year}
                    </span>
                    <span className="text-xs font-bold font-btn uppercase tracking-wider text-slate-400">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Node Icon Circle */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-white shadow-lg shadow-cyan-500/30 border-4 border-white dark:border-slate-950 z-10">
                <Icon className="h-5 w-5" />
              </div>

              {/* Empty space for symmetric grid alignment */}
              <div className="hidden md:block w-1/2" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
