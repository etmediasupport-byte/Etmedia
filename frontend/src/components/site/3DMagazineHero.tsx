import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Download,
  Share2,
  ChevronRight,
  Eye,
  Crown,
  TrendingUp,
  Users,
  FileText,
  Bookmark,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { MagazineItem } from "@/lib/site-data";

interface MagazineHeroProps {
  magazine: MagazineItem;
  onOpenReader: (mag: MagazineItem) => void;
  onScrollToEditions?: () => void;
}

export function ThreeDMagazineHero({ magazine, onOpenReader, onScrollToEditions }: MagazineHeroProps) {
  const [isOpening, setIsOpening] = useState(false);

  // Parallax Mouse Tilt values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-400, 400], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleMagazineClick = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpenReader(magazine);
      setIsOpening(false);
    }, 900);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-28 sm:pt-36 pb-16 overflow-hidden bg-slate-900 text-white select-none border-b border-slate-200"
    >
      {/* Background Lighting Glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-purple-600/15 blur-[170px] pointer-events-none rounded-full" />

      <div className="container-x relative z-10 max-w-7xl mx-auto">
        {/* MAIN HERO GRID: LEFT CONTENT & RIGHT 3D MAGAZINE + SPREAD PREVIEW */}
        <div className="grid items-center gap-10 lg:gap-12 lg:grid-cols-12">
          
          {/* LEFT COLUMN: HERO TYPOGRAPHY & FEATURES */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-cyan-300 uppercase font-mono shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>EXECUTIVE TALKS MAGAZINE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display leading-[1.08]">
              Ideas that Inspire a <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                Bigger Tomorrow
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed font-sans">
              Leadership stories, industry insights and innovations shaping a better future. Explore exclusive CXO interviews and strategic intelligence.
            </p>

            {/* Action CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                type="button"
                onClick={handleMagazineClick}
                className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-4 text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-purple-600/30 hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer font-btn overflow-hidden"
              >
                <BookOpen className="h-4 w-4 text-cyan-200" />
                <span>Read Latest Edition</span>
                <ChevronRight className="h-4 w-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onScrollToEditions}
                className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-700 bg-slate-800/90 px-7 py-4 text-xs sm:text-sm font-bold text-white hover:bg-slate-700 hover:border-cyan-400 transition-all cursor-pointer font-btn shadow-md"
              >
                <span>Explore All Editions</span>
              </button>
            </div>

            {/* 4 Feature Badges Under CTA */}
            <div className="pt-4 grid grid-cols-2 xs:grid-cols-4 gap-3 text-left">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-200 font-display">Industry Leaders</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-200 font-display">Expert Insights</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <TrendingUp className="h-4 w-4 text-purple-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-200 font-display">Emerging Trends</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <Award className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-200 font-display">Inspiring Journeys</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D FLOATING HARDCOVER COVER + OPEN SPREAD PREVIEW */}
          <div className="lg:col-span-6 flex items-center justify-center [perspective:2000px]">
            <motion.div
              style={{ rotateX, rotateY }}
              animate={
                isOpening
                  ? {
                      scale: [1, 1.1, 1.2],
                      opacity: [1, 1, 0],
                    }
                  : {
                      y: [-8, 8, -8],
                    }
              }
              transition={
                isOpening
                  ? { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 7, repeat: Infinity, ease: "easeInOut" }
              }
              onClick={handleMagazineClick}
              className="group relative flex items-center justify-center gap-4 cursor-pointer select-none"
            >
              {/* Cover Card (3D Floating Perspective) */}
              <div className="relative w-56 sm:w-64 lg:w-72 aspect-[1/1.42] rounded-r-2xl border-2 border-cyan-500/40 bg-slate-900 shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden shrink-0 group-hover:border-cyan-400 transition-all duration-500">
                <img
                  src={magazine.cover}
                  alt={magazine.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                
                {/* Overlay Eye Hint */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-xl mb-2">
                    <Eye className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    Open 3D Flipbook
                  </span>
                </div>
              </div>

              {/* Open Spread Book Preview (Matching Reference Design!) */}
              <div className="hidden sm:flex flex-col justify-between w-64 lg:w-72 aspect-[1/1.42] bg-white text-slate-900 p-5 rounded-r-2xl border border-slate-300 shadow-2xl relative overflow-hidden shrink-0">
                {/* Top Label */}
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    COVER STORY
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 font-display leading-tight">
                    Shaping a Sustainable Future
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">
                    How visionary leaders are building a more resilient, innovative and inclusive tomorrow.
                  </p>
                </div>

                {/* Quote Box with Portrait */}
                <div className="my-2 p-3 rounded-xl bg-slate-100 border border-slate-200 relative">
                  <span className="text-2xl font-serif text-cyan-600 absolute top-1 left-2">“</span>
                  <p className="text-[10px] font-medium text-slate-800 italic pl-3 leading-snug">
                    Innovation happens when people, purpose and possibilities come together.
                  </p>
                </div>

                {/* Editorial Column Preview */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-700 block mb-1">
                    LEADERSHIP INSIGHTS
                  </span>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                        alt="Leader"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-[9px] text-slate-600 line-clamp-3 leading-tight font-sans">
                      Exclusive CXO interview on sustainable growth, digital leadership, and workforce agility.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>

        {/* BOTTOM HIGHLIGHTS BAR (WHITE MODE FLOATING CARD MATCHING REFERENCE IMAGE) */}
        <div className="mt-14 p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            
            {/* Col 1: Current Edition */}
            <div className="flex items-center gap-3.5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-4 sm:pb-0 sm:pr-4">
              <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 shrink-0">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Current Edition
                </span>
                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 font-display mt-0.5">
                  {magazine.issue || "Volume 12 | August 2026"}
                </h5>
              </div>
            </div>

            {/* Col 2: Featured Theme */}
            <div className="flex items-center gap-3.5 border-b sm:border-b-0 lg:border-r border-slate-200 pb-4 sm:pb-0 sm:pr-4">
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Featured Theme
                </span>
                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 font-display mt-0.5 truncate max-w-[200px]">
                  {magazine.title || "Leadership Beyond Boundaries"}
                </h5>
              </div>
            </div>

            {/* Col 3: Cover Story */}
            <div className="flex items-center gap-3.5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-4 sm:pb-0 sm:pr-4">
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Cover Story
                </span>
                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 font-display mt-0.5 truncate max-w-[200px]">
                  In conversation with industry leaders
                </h5>
              </div>
            </div>

            {/* Col 4: Download PDF */}
            <div className="flex items-center justify-between sm:justify-start gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Download PDF
                </span>
                {magazine.pdf_url ? (
                  <a
                    href={magazine.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-sm font-extrabold text-cyan-600 hover:underline font-display inline-block mt-0.5"
                  >
                    Full Magazine (PDF) →
                  </a>
                ) : (
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-display mt-0.5 block">
                    Full Magazine (PDF)
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
