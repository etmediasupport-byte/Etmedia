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
    onOpenReader(magazine);
    setTimeout(() => {
      setIsOpening(false);
    }, 400);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-24 sm:pt-28 pb-5 sm:pb-6 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 select-none border-b border-slate-200/80"
    >
      {/* Background Subtle Luxury Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="container-x relative z-10 max-w-7xl mx-auto">
        {/* MAIN HERO GRID: LEFT CONTENT & RIGHT 3D MAGAZINE + SPREAD PREVIEW */}
        <div className="grid items-center gap-6 lg:gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: HERO TYPOGRAPHY & FEATURES */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/90 bg-purple-50 px-3.5 py-1 text-[11px] font-black tracking-wider text-purple-700 uppercase font-display shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>EXECUTIVE TALKS MAGAZINE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-extrabold tracking-tight text-slate-900 font-display leading-[1.12]">
              Ideas that Inspire a{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Bigger Tomorrow
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed font-sans">
              Leadership stories, industry insights and innovations shaping a better future. Explore exclusive CXO interviews, global market reports, and strategic intelligence.
            </p>

            {/* Action CTA Buttons */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={handleMagazineClick}
                className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-7 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-btn overflow-hidden"
              >
                <BookOpen className="h-4 w-4 text-white" />
                <span>Read Latest Edition</span>
                <ChevronRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onScrollToEditions}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer font-btn shadow-2xs"
              >
                <span>Explore All Editions</span>
              </button>
            </div>

            {/* 4 Feature Badges Under CTA */}
            <div className="pt-2 grid grid-cols-2 xs:grid-cols-4 gap-2.5 text-left">
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-200 transition-all">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Crown className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 font-display">Industry Leaders</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-200 transition-all">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 font-display">Expert Insights</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-200 transition-all">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 font-display">Emerging Trends</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-all">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 font-display">Inspiring Journeys</span>
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
                      scale: 1.05,
                      opacity: 1,
                    }
                  : {
                      y: [-6, 6, -6],
                      scale: 1,
                      opacity: 1,
                    }
              }
              transition={
                isOpening
                  ? { duration: 0.35, ease: "easeOut" }
                  : { y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }
              }
              onClick={handleMagazineClick}
              className="group relative flex items-center justify-center gap-3.5 sm:gap-4 cursor-pointer select-none opacity-100"
            >
              {/* Cover Card (3D Floating Perspective) */}
              <div className="relative w-52 sm:w-64 lg:w-72 aspect-[1/1.42] rounded-r-2xl border-2 border-slate-200/90 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] overflow-hidden shrink-0 group-hover:border-purple-500 group-hover:shadow-[0_25px_70px_rgba(75,31,167,0.22)] transition-all duration-500">
                <img
                  src={magazine.cover}
                  alt={magazine.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                
                {/* Overlay Eye Hint */}
                <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center backdrop-blur-xs">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl mb-2">
                    <Eye className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase text-white tracking-wider font-display">
                    Open 3D Flipbook
                  </span>
                </div>
              </div>

              {/* Open Spread Book Preview */}
              <div className="hidden sm:flex flex-col justify-between w-64 lg:w-72 aspect-[1/1.42] bg-white text-slate-900 p-5 rounded-r-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] relative overflow-hidden shrink-0">
                {/* Top Label */}
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mb-1.5 font-display">
                    COVER STORY
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 font-display leading-tight">
                    Shaping a Sustainable Future
                  </h4>
                  <p className="text-[10.5px] text-slate-600 mt-1 line-clamp-2 leading-relaxed font-sans">
                    How visionary leaders are building a more resilient, innovative and inclusive tomorrow.
                  </p>
                </div>

                {/* Quote Box with Portrait */}
                <div className="my-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 relative">
                  <span className="text-2xl font-serif text-purple-600 absolute top-1 left-2">“</span>
                  <p className="text-[10.5px] font-medium text-slate-800 italic pl-3 leading-snug">
                    Innovation happens when people, purpose and possibilities come together.
                  </p>
                </div>

                {/* Editorial Column Preview */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-700 block mb-1 font-display">
                    LEADERSHIP INSIGHTS
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                        alt="Leader"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-[9.5px] text-slate-600 line-clamp-2 leading-snug font-sans font-medium">
                      Exclusive CXO interview on sustainable growth, digital leadership, and workforce agility.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>

        {/* BOTTOM HIGHLIGHTS BAR (CLEAN EXECUTIVE WHITE FLOATING CARD) */}
        <div className="mt-6 sm:mt-7 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 items-center">
            
            {/* Col 1: Current Edition */}
            <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-slate-200/80 pb-3 sm:pb-0 sm:pr-4">
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 shrink-0">
                <Bookmark className="h-4.5 w-4.5" />
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
            <div className="flex items-center gap-3 border-b sm:border-b-0 lg:border-r border-slate-200/80 pb-3 sm:pb-0 sm:pr-4">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
                <FileText className="h-4.5 w-4.5" />
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
            <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-slate-200/80 pb-3 sm:pb-0 sm:pr-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0">
                <Users className="h-4.5 w-4.5" />
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
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                <Download className="h-4.5 w-4.5" />
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
                    className="text-xs sm:text-sm font-extrabold text-purple-700 hover:text-purple-900 hover:underline font-display inline-block mt-0.5"
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
