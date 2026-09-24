import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Flame, Download, Share2, Maximize2, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import { MagazineItem } from "@/lib/site-data";

interface MagazineHeroProps {
  magazine: MagazineItem;
  onOpenReader: (mag: MagazineItem) => void;
}

export function ThreeDMagazineHero({ magazine, onOpenReader }: MagazineHeroProps) {
  const [isOpening, setIsOpening] = useState(false);

  // Parallax Mouse Tilt values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [12, -12]);
  const rotateY = useTransform(mouseX, [-400, 400], [-16, 16]);

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
    }, 1100);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success(`Share link for "${magazine.title}" copied!`);
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[90vh] py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-[#08111F] via-[#730018]/30 to-[#050505] text-white flex items-center justify-center select-none"
    >
      {/* Background Spotlight Glows & Parallax Dust */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[650px] bg-gradient-to-tr from-[#730018]/40 via-[#08111F]/60 to-cyan-500/20 blur-[170px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.95)_100%)] pointer-events-none" />

      {/* Floating Dust Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#D4AF37]/30 blur-[1px]"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: Math.random() * 6 + 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-12 max-w-7xl mx-auto">
        {/* LEFT COLUMN: HERO TYPOGRAPHY & DETAILS */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D4AF37]/40 bg-[#7A0019]/40 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase font-mono shadow-lg backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-[#D4AF37] animate-pulse" />
            <span>Interactive 3D Hardcover Publication</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-display leading-[1.08]">
            EXECUTIVE <span className="bg-gradient-to-r from-[#D4AF37] via-amber-200 to-amber-400 bg-clip-text text-transparent">TALKS</span> MAGAZINE
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
            {magazine.description ||
              "An ultra-premium digital publication featuring benchmark C-suite interviews, CFO intelligence, HR leadership, and enterprise technology transformations across India."}
          </p>

          {/* Quick Magazine Details Chips */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2 shadow-inner">
              <span className="text-[#D4AF37] font-bold">EDITION:</span>
              <span>{magazine.issue || "Volume 2026"}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2 shadow-inner">
              <span className="text-[#D4AF37] font-bold">RELEASE:</span>
              <span>{magazine.month || magazine.date || "2026 Special Issue"}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2 shadow-inner">
              <span className="text-[#D4AF37] font-bold">PAGES:</span>
              <span>64 Full HD Editorial Spreads</span>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              type="button"
              onClick={handleMagazineClick}
              className="group relative inline-flex items-center gap-3.5 rounded-2xl bg-gradient-to-r from-[#7A0019] via-[#9e0021] to-[#7A0019] border border-[#D4AF37]/60 px-8 py-4 text-sm font-extrabold text-white shadow-[0_0_35px_rgba(122,0,25,0.6)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-btn overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <BookOpen className="h-5 w-5 text-[#D4AF37]" />
              <span>Launch 3D Magazine Experience</span>
              <ChevronRight className="h-4 w-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </button>

            {magazine.pdf_url && (
              <a
                href={magazine.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-4 text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-[#D4AF37]/40 transition-all cursor-pointer font-btn shadow-lg backdrop-blur-md"
              >
                <Download className="h-4 w-4 text-[#D4AF37]" />
                <span>Download PDF Edition</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-[#D4AF37]/40 transition-all cursor-pointer shadow-lg backdrop-blur-md"
              title="Share Publication"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D FLOATING HARDCOVER MAGAZINE DISPLAY */}
        <div className="lg:col-span-5 flex items-center justify-center [perspective:2200px]">
          <motion.div
            style={{ rotateX, rotateY }}
            animate={
              isOpening
                ? {
                    scale: [1, 1.15, 1.25],
                    rotateY: [0, -90, -180],
                    translateY: [0, -30, -50],
                    opacity: [1, 1, 0],
                  }
                : {
                    y: [-10, 10, -10],
                  }
            }
            transition={
              isOpening
                ? { duration: 1.1, ease: [0.16, 1, 0.3, 1] }
                : { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }
            onClick={handleMagazineClick}
            className="group relative w-72 sm:w-80 lg:w-88 aspect-[1/1.45] cursor-pointer [transform-style:preserve-3d]"
          >
            {/* Ambient Hardcover Drop Shadow */}
            <div className="absolute -bottom-10 inset-x-4 h-12 bg-black/80 blur-2xl rounded-full scale-95 group-hover:scale-105 transition-transform duration-500" />

            {/* 3D Page Thickness Edge Stack Layer (Right Edge 18-25 pages) */}
            <div className="absolute top-2 bottom-2 right-[-14px] w-[14px] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 border-y border-r border-slate-400 shadow-2xl [transform:rotateY(90deg)_translateZ(7px)] rounded-r-sm overflow-hidden flex flex-col justify-between py-1">
              {Array.from({ length: 22 }).map((_, pIdx) => (
                <div key={pIdx} className="w-full h-[1px] bg-slate-400/40" />
              ))}
            </div>

            {/* 3D Rounded Hardcover Left Spine */}
            <div className="absolute top-0 bottom-0 left-[-16px] w-[16px] bg-gradient-to-r from-[#500010] via-[#7A0019] to-[#3a000c] border-y border-l border-[#D4AF37]/50 shadow-2xl [transform:rotateY(-90deg)_translateZ(8px)] flex items-center justify-center">
              <span className="[writing-mode:vertical-rl] text-[9px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase opacity-80">
                ET MEDIA EXECUTIVE TALKS · 2026
              </span>
            </div>

            {/* Main Front Hardcover Surface */}
            <div className="relative h-full w-full overflow-hidden rounded-r-xl border-2 border-[#D4AF37]/60 bg-[#0F172A] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.95)] transition-all duration-500 group-hover:border-[#D4AF37] group-hover:shadow-[0_0_60px_rgba(122,0,25,0.7)]">
              {/* Cover Image */}
              <img
                src={magazine.cover}
                alt={`${magazine.title} Cover`}
                className="h-full w-full object-cover filter group-hover:brightness-105 transition-all duration-500"
              />

              {/* Gold Foil Header Overlay Badge */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
                <span className="bg-[#7A0019]/90 border border-[#D4AF37]/60 text-[#D4AF37] px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest shadow-lg backdrop-blur-md">
                  Executive Talks
                </span>
                <span className="bg-black/80 text-white px-2.5 py-1 rounded-full text-[9px] font-mono font-bold border border-slate-800">
                  Vol 2026
                </span>
              </div>

              {/* Glossy Diagonal Reflection Sweep */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none z-10 group-hover:opacity-100 transition-opacity" />

              {/* Interactive Open Hint Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-6 text-center z-20">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#7A0019] to-[#9e0021] border border-[#D4AF37] flex items-center justify-center text-white shadow-2xl mb-3 transform group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <h4 className="text-sm font-extrabold text-white font-display uppercase tracking-wider">
                  Open 3D Flipbook
                </h4>
                <p className="text-[10px] font-mono text-[#D4AF37] mt-1">
                  Click to experience realistic paper physics
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
