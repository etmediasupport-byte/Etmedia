import { motion } from "framer-motion";
import { Building2, Calendar, Crown, Globe2, Mic } from "lucide-react";
import { stats } from "@/lib/site-data";
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { FloatingShapes } from "@/components/ui/FloatingShapes";

const statIcons = [
  Calendar,    // Conferences (10+)
  Mic,         // Industry Speakers (100+)
  Crown,       // Business Leaders (1500+)
  Building2,   // Partner Brands (200+)
  Globe2,      // Countries (5+)
];

export function StatisticsSection() {
  return (
    <section className="section relative overflow-hidden bg-slate-50 border-y border-slate-200">
      {/* Background Motion Animation Elements */}
      <FloatingShapes />

      {/* Animated Glowing Light Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none float-orb" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none float-orb" style={{ animationDelay: "2s" }} />

      <div className="container-x relative z-10">
        <SectionHeading
          kicker="Impact & Reach"
          title="Executive Talks Media By The Numbers"
          description="Quantifying our executive network, conference reach, and corporate partnerships across India and global hubs."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s, i) => {
            const Icon = statIcons[i] || Calendar;
            return (
              <Reveal key={s.label} delay={i * 0.08}>
                <MouseTiltCard
                  maxTilt={14}
                  className="group relative overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-none rounded-bl-none border border-slate-200/90 bg-white/90 p-7 text-center shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-500/15"
                >
                  {/* Subtle Top Accent Glow Bar */}
                  <div className="absolute inset-x-0 top-0 h-1 gradient-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon Badge */}
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Animated Counter Number */}
                  <div className="mt-6 font-extrabold text-3xl xl:text-4xl font-display text-slate-900 tracking-tight">
                    <CountUpNumber
                      value={s.value}
                      suffix={s.suffix}
                      duration={2.5}
                      className="text-gradient"
                    />
                  </div>

                  {/* Stat Title */}
                  <h3 className="mt-2 text-base font-bold font-display text-slate-900">
                    {s.label}
                  </h3>

                  {/* Subtitle Description */}
                  {s.desc && (
                    <p className="mt-1.5 text-xs text-slate-500 font-sans font-medium leading-relaxed">
                      {s.desc}
                    </p>
                  )}
                </MouseTiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
