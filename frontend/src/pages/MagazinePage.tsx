import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  X,
  Loader2,
  Volume2,
  VolumeX,
  Grid,
  List,
  Share2,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { images, getDefaultMagazines, MagazineItem } from "@/lib/site-data";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { FloatingShapes } from "@/components/ui/FloatingShapes";
import { socket } from "@/lib/socket";
import { extractPdfPagesToDataUrls, parsePagesList } from "@/utils/pdfExtractor";

export default function MagazinePage() {
  const [magazinesList, setMagazinesList] = useState<MagazineItem[]>([]);

  // Selected magazine for 3D Flipbook Reader Modal
  const [activeMagazine, setActiveMagazine] = useState<MagazineItem | null>(null);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, 1.4 = 140%, 1.8 = 180%
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [thumbnailGridOpen, setThumbnailGridOpen] = useState(false);
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");

  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMagazines();

    const handleMagUpdate = () => {
      fetchMagazines();
    };

    socket.on("magazine_updated", handleMagUpdate);
    return () => {
      socket.off("magazine_updated", handleMagUpdate);
    };
  }, []);

  const fetchMagazines = async () => {
    try {
      const res = await fetch("/api/magazines");
      if (res.ok) {
        const data = await res.json();
        if (data.magazines && data.magazines.length > 0) {
          setMagazinesList(data.magazines);
          return;
        }
      }
    } catch (e) {
      console.warn("Using default static magazines fallback:", e);
    }
    setMagazinesList(getDefaultMagazines());
  };

  // Synthesize realistic paper flip sound effect using Web Audio API
  const playPageFlipSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch (e) {}
  };

  // Helper to parse pages array from magazine
  const getPagesArray = (mag: MagazineItem): string[] => {
    const parsed = parsePagesList(mag.pages_list);
    let list = parsed.length > 0 ? parsed : [mag.cover, mag.cover];

    if (list.length < 6) {
      const fallbackList = [
        mag.cover,
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1542744801-30d061937985?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
        mag.cover,
      ];
      list = Array.from(new Set([...list, ...fallbackList]));
    }
    return list;
  };

  const [pdfExtractedPages, setPdfExtractedPages] = useState<string[]>([]);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const openReader = async (mag: MagazineItem) => {
    setActiveMagazine(mag);
    setCurrentSpreadIndex(0);
    setZoomLevel(1);
    setPdfExtractedPages([]);
    setThumbnailGridOpen(false);
    setTocDrawerOpen(false);

    const staticPages = getPagesArray(mag);
    if (mag.pdf_url && staticPages.length <= 2) {
      try {
        setIsExtractingPdf(true);
        const pages = await extractPdfPagesToDataUrls(mag.pdf_url);
        if (pages.length > 0) {
          setPdfExtractedPages(pages);
        }
      } catch (err) {
        console.warn("Could not dynamically extract PDF pages:", err);
      } finally {
        setIsExtractingPdf(false);
      }
    }
  };

  const closeReader = () => {
    setActiveMagazine(null);
    setZoomLevel(1);
    setPdfExtractedPages([]);
    setIsExtractingPdf(false);
    setThumbnailGridOpen(false);
    setTocDrawerOpen(false);
    if (isFullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleZoom = () => {
    setZoomLevel((prev) => (prev >= 1.8 ? 1 : prev === 1 ? 1.4 : 1.8));
  };

  const activePages = activeMagazine
    ? pdfExtractedPages.length > 0
      ? pdfExtractedPages
      : getPagesArray(activeMagazine)
    : [];

  const totalSpreads = Math.ceil((activePages.length + 1) / 2);

  const getSpreadPages = (spreadIdx: number) => {
    if (spreadIdx === 0) {
      return { left: null, right: activePages[0] || null };
    }
    const leftIdx = spreadIdx * 2 - 1;
    const rightIdx = spreadIdx * 2;
    return {
      left: activePages[leftIdx] || null,
      right: activePages[rightIdx] || null,
      leftNum: leftIdx + 1,
      rightNum: rightIdx + 1,
    };
  };

  const handleNextSpread = () => {
    if (currentSpreadIndex < totalSpreads - 1) {
      setFlipDirection("next");
      playPageFlipSound();
      setCurrentSpreadIndex((prev) => prev + 1);
    }
  };

  const handlePrevSpread = () => {
    if (currentSpreadIndex > 0) {
      setFlipDirection("prev");
      playPageFlipSound();
      setCurrentSpreadIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation shortcuts when reader modal is active
  useEffect(() => {
    if (!activeMagazine) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNextSpread();
      } else if (e.key === "ArrowLeft") {
        handlePrevSpread();
      } else if (e.key === "Escape") {
        closeReader();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMagazine, currentSpreadIndex, totalSpreads]);

  const currentSpread = getSpreadPages(currentSpreadIndex);

  // Featured Magazine & Display Fallback
  const displayMagazines = magazinesList.length > 0 ? magazinesList : getDefaultMagazines();
  const featuredMagazine = displayMagazines.find((m) => m.is_featured) || displayMagazines[0];

  const handleShare = (mag: MagazineItem) => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success(`Link for "${mag.title}" copied to clipboard!`);
    } else {
      toast.info(`Sharing "${mag.title}"`);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      <PageHero
        crumb="Executive Talks Magazine"
        title="Executive Talks Magazine"
        subtitle="A premium digital library of C-suite leadership interviews, sector intelligence, and enterprise perspectives."
        image={images.magazineCover}
      />

      {/* ========================================== */}
      {/* 1. FEATURED MAGAZINE COVER SHOWCASE        */}
      {/* ========================================== */}
      {featuredMagazine && (
        <section className="py-16 md:py-20 border-b border-zinc-800/80 relative overflow-hidden bg-zinc-950">
          <FloatingShapes />
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="container-x grid items-center gap-10 lg:grid-cols-12 relative z-10">
            {/* Left Column: 3D Animated Magazine Cover (No Border Radius) */}
            <div className="lg:col-span-5 [perspective:1600px]">
              <Reveal>
                <motion.div
                  initial={{ rotateY: -18 }}
                  animate={{ rotateY: [-18, -8, -18] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ rotateY: -2, scale: 1.02 }}
                  onClick={() => openReader(featuredMagazine)}
                  className="relative mx-auto w-64 sm:w-80 cursor-pointer [transform-style:preserve-3d] group"
                >
                  {/* Magazine 3D Spine Depth Layer */}
                  <div className="bg-zinc-800 absolute inset-y-3 -right-4 [transform:rotateY(-16deg)_translateZ(-25px)] border border-zinc-700 shadow-2xl rounded-none" />
                  <div className="bg-zinc-700 absolute inset-y-1.5 -right-2 [transform:rotateY(-9deg)_translateZ(-12px)] border border-zinc-600 shadow-xl rounded-none" />

                  {/* Main Front Cover Image */}
                  <div className="relative aspect-[1/1.5] w-full overflow-hidden bg-black border border-zinc-700 group-hover:border-cyan-500/80 transition-all duration-300 shadow-[0_40px_80px_-25px_rgba(0,0,0,0.95)] rounded-none">
                    <img
                      src={featuredMagazine.cover}
                      alt={`${featuredMagazine.title} Cover`}
                      loading="lazy"
                      className="h-full w-full object-cover rounded-none"
                    />

                    {/* Glossy Sheen Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-none opacity-60 group-hover:opacity-100 transition-opacity" />

                    {/* Hover Read Badge */}
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors rounded-none flex items-center justify-center p-4">
                      <span className="gradient-brand rounded-none px-6 py-3 text-xs font-extrabold text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-105 flex items-center gap-2 font-btn">
                        <BookOpen className="h-4 w-4" /> Open Fullscreen 3D Reader
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            </div>

            {/* Right Column: Featured Details & CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-none border border-purple-500/40 bg-purple-950/80 px-3.5 py-1 text-xs font-extrabold text-purple-300">
                  <Flame className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                  <span>Featured Edition · {featuredMagazine.issue}</span>
                </div>
                <span className="rounded-none bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-extrabold text-cyan-300 font-mono">
                  {featuredMagazine.month || featuredMagazine.date}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display leading-tight">
                {featuredMagazine.title}
              </h2>

              <p className="text-slate-300 text-base leading-relaxed font-medium">
                {featuredMagazine.description || "Explore how benchmark CEOs, CFOs, and tech leaders are driving enterprise resilience, digital transformation, and executive innovation across India's premier markets."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => openReader(featuredMagazine)}
                  className="gradient-brand inline-flex items-center gap-3 rounded-none px-8 py-3.5 text-sm font-extrabold text-white shadow-2xl shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-btn border-none"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Open Fullscreen 3D Flipbook</span>
                </button>

                {featuredMagazine.pdf_url && (
                  <a
                    href={featuredMagazine.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-none border border-zinc-800 bg-zinc-900/90 px-7 py-3.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer font-btn shadow-md"
                  >
                    <Download className="h-4 w-4 text-cyan-400" />
                    <span>Download PDF</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleShare(featuredMagazine)}
                  className="p-3.5 rounded-none border border-zinc-800 bg-zinc-900/90 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer"
                  title="Share Magazine"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 2. ALL MAGAZINES CARDS GRID (NO BORDER RADIUS, HEIGHT TWICE WIDTH) */}
      {/* ========================================== */}
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading
            kicker="Executive Library"
            title="All Magazine Editions"
            description="Select any magazine card to open in full-screen 3D flipbook animation reader."
            titleClassName="text-white font-black font-display tracking-tight text-3xl sm:text-4xl lg:text-5xl"
            descriptionClassName="text-slate-300 text-base sm:text-lg mt-2.5 max-w-2xl"
            kickerClassName="text-cyan-300 bg-cyan-950/80 border-cyan-500/40 font-bold rounded-none px-3.5 py-1 text-xs uppercase font-mono tracking-widest"
          />

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
            {displayMagazines.map((mag, i) => (
              <Reveal key={mag.id || mag.issue || i} delay={i * 0.04}>
                <div
                  onClick={() => openReader(mag)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-zinc-800 bg-zinc-950 p-3.5 shadow-2xl hover:border-cyan-500/80 hover:bg-zinc-900 transition-all duration-300 h-full cursor-pointer"
                >
                  <div>
                    {/* Tall Magazine Cover (Width is ~50% of Height, Aspect 1:1.6, Zero Border-Radius) */}
                    <div className="relative aspect-[1/1.6] w-full overflow-hidden bg-black border border-zinc-800/80 rounded-none [perspective:1000px]">
                      {/* Spine Layer Accent */}
                      <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-zinc-950 via-zinc-800 to-transparent z-20 pointer-events-none" />

                      <img
                        src={mag.cover}
                        alt={`${mag.title} cover`}
                        loading="lazy"
                        className="h-full w-full object-cover rounded-none transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Glossy Sheen Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-none opacity-40 group-hover:opacity-100 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                        <span className="rounded-none bg-black/85 backdrop-blur-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cyan-300 border border-zinc-800">
                          {mag.issue || "Issue"}
                        </span>
                        {mag.is_featured ? (
                          <span className="rounded-none bg-purple-600/90 px-2 py-0.5 text-[9px] font-extrabold text-white shadow-md">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      {/* Hover Fullscreen Reader Hint */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center z-20 rounded-none">
                        <div className="gradient-brand rounded-none p-2.5 text-white shadow-xl mb-2">
                          <Maximize2 className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-extrabold text-white font-btn tracking-wide">
                          Click for Fullscreen
                        </span>
                        <span className="text-[9px] text-cyan-300 font-mono mt-1">
                          3D Flipbook Reader
                        </span>
                      </div>
                    </div>

                    {/* Card Title & Info */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono">
                        <span className="text-cyan-400 truncate">{mag.category || "Leadership"}</span>
                        <span className="shrink-0">{mag.month || mag.date}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-display line-clamp-2 leading-snug">
                        {mag.title}
                      </h3>
                    </div>
                  </div>

                  {/* Read Button */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openReader(mag);
                      }}
                      className="w-full cursor-pointer rounded-none gradient-brand py-2 text-[11px] font-extrabold text-white shadow-sm hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-1.5 font-btn border-none"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Read 3D Reader</span>
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FULLSCREEN 3D FLIPBOOK MAGAZINE READER OVERLAY MODAL ON SELECT          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeMagazine && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            ref={modalContainerRef}
            className="fixed inset-0 z-50 flex flex-col bg-zinc-950/98 backdrop-blur-2xl text-white overflow-hidden select-none"
          >
            {/* TOP TOOLBAR */}
            <div className="flex items-center justify-between border-b border-zinc-800/90 bg-black/95 px-4 py-3 sm:px-6 z-30 shrink-0 shadow-lg">
              {/* Title & Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-white truncate font-display">
                    {activeMagazine.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">{activeMagazine.issue}</span>
                    <span>·</span>
                    <span>{activeMagazine.month || activeMagazine.date}</span>
                  </p>
                </div>
              </div>

              {/* Control Toolbar Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Table of Contents Button */}
                <button
                  type="button"
                  onClick={() => setTocDrawerOpen((v) => !v)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    tocDrawerOpen
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                      : "border-zinc-800 bg-zinc-900 text-slate-300 hover:text-white"
                  }`}
                  title="Table of Contents"
                >
                  <List className="h-4 w-4 text-cyan-400" />
                  <span className="hidden md:inline font-btn">Contents</span>
                </button>

                {/* Thumbnail Grid Toggle */}
                <button
                  type="button"
                  onClick={() => setThumbnailGridOpen((v) => !v)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    thumbnailGridOpen
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                      : "border-zinc-800 bg-zinc-900 text-slate-300 hover:text-white"
                  }`}
                  title="Thumbnail View Grid"
                >
                  <Grid className="h-4 w-4 text-cyan-400" />
                  <span className="hidden md:inline font-btn">Thumbnails</span>
                </button>

                {/* Sound FX Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled((v) => !v)}
                  className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={soundEnabled ? "Mute Page Flip Sound" : "Enable Page Flip Sound"}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
                </button>

                {/* Multi-level Zoom Control */}
                <button
                  type="button"
                  onClick={handleZoom}
                  className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Toggle Zoom (100% / 140% / 180%)"
                >
                  {zoomLevel > 1 ? <ZoomOut className="h-4 w-4 text-cyan-400" /> : <ZoomIn className="h-4 w-4" />}
                  <span className="hidden lg:inline font-mono">{Math.round(zoomLevel * 100)}%</span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Toggle Fullscreen Mode"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4 text-cyan-400" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                {/* Download PDF */}
                {activeMagazine.pdf_url && (
                  <a
                    href={activeMagazine.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-bold font-btn"
                    title="Download PDF Edition"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </a>
                )}

                {/* Close Reader Button */}
                <button
                  type="button"
                  onClick={closeReader}
                  className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 transition-all cursor-pointer ml-1"
                  title="Close Reader (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* TABLE OF CONTENTS DRAWER OVERLAY */}
            <AnimatePresence>
              {tocDrawerOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  className="absolute top-16 left-0 bottom-16 w-80 z-40 bg-zinc-950/95 border-r border-zinc-800 p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-display flex items-center gap-2">
                      <List className="h-4 w-4 text-cyan-400" /> Table of Contents
                    </h4>
                    <button type="button" onClick={() => setTocDrawerOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs font-medium">
                    {[
                      { title: "Front Cover & Executive Overview", spread: 0 },
                      { title: "Publisher's Note & Editor's Desk", spread: 1 },
                      { title: "Keynote Interview: C-Suite Transformations", spread: 2 },
                      { title: "CFO Benchmark Capital Allocation Report", spread: 3 },
                      { title: "HR Leadership & AI Workforce Intelligence", spread: 4 },
                      { title: "Tech Conclave Special Feature Spread", spread: 5 },
                    ].map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCurrentSpreadIndex(Math.min(item.spread, totalSpreads - 1));
                          setTocDrawerOpen(false);
                          playPageFlipSound();
                        }}
                        className="w-full text-left p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800 hover:border-cyan-500/50 text-slate-200 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{item.title}</span>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">P.{item.spread * 2 || 1}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* THUMBNAIL GRID OVERLAY MODAL */}
            <AnimatePresence>
              {thumbnailGridOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-x-0 top-16 bottom-16 z-40 bg-black/95 p-6 overflow-y-auto backdrop-blur-2xl"
                >
                  <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <h4 className="text-base font-extrabold text-white font-display flex items-center gap-2">
                        <Grid className="h-5 w-5 text-cyan-400" /> Magazine Spreads Grid ({totalSpreads} Spreads)
                      </h4>
                      <button type="button" onClick={() => setThumbnailGridOpen(false)} className="p-2 rounded-xl bg-zinc-900 text-slate-300 hover:text-white">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {Array.from({ length: totalSpreads }).map((_, sIdx) => {
                        const sp = getSpreadPages(sIdx);
                        const isCurrent = sIdx === currentSpreadIndex;
                        return (
                          <div
                            key={sIdx}
                            onClick={() => {
                              setCurrentSpreadIndex(sIdx);
                              setThumbnailGridOpen(false);
                              playPageFlipSound();
                            }}
                            className={`group relative rounded-2xl border-2 p-2 bg-zinc-900 cursor-pointer transition-all ${
                              isCurrent ? "border-cyan-400 shadow-[0_0_25px_rgba(0,174,239,0.5)] scale-105" : "border-zinc-800 hover:border-cyan-500/50"
                            }`}
                          >
                            <div className="flex h-36 gap-1 overflow-hidden rounded-xl bg-black">
                              {sp.left ? (
                                <img src={sp.left} alt="Left Page" className="h-full w-1/2 object-cover" />
                              ) : (
                                <div className="h-full w-1/2 bg-zinc-950 flex items-center justify-center text-[10px] text-zinc-600 font-mono">Spine</div>
                              )}
                              {sp.right ? (
                                <img src={sp.right} alt="Right Page" className="h-full w-1/2 object-cover" />
                              ) : (
                                <div className="h-full w-1/2 bg-zinc-950 flex items-center justify-center text-[10px] text-zinc-600 font-mono">Spine</div>
                              )}
                            </div>
                            <div className="mt-2 text-center text-[11px] font-mono font-bold text-slate-300">
                              {sIdx === 0 ? "Cover (P.1)" : `Spread P.${sp.leftNum}-${sp.rightNum}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN 3D DOUBLE-PAGE SPREAD FLIPBOOK VIEWER AREA */}
            <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.6)_0%,rgba(0,0,0,0.95)_100%)]">
              {/* Left Floating Flip Arrow Button */}
              <button
                type="button"
                disabled={currentSpreadIndex === 0}
                onClick={handlePrevSpread}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-zinc-900/90 border border-zinc-700 text-white hover:bg-cyan-600 hover:border-cyan-400 transition-all cursor-pointer shadow-2xl disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                title="Previous Page (Flip Left / ArrowLeft)"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>

              {isExtractingPdf ? (
                <div className="flex flex-col items-center justify-center py-24 text-cyan-400 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
                  <p className="text-sm font-extrabold text-white font-mono tracking-wide">
                    Rendering High-Resolution PDF Spreads for Flipbook...
                  </p>
                </div>
              ) : (
                /* 3D BOOK DOUBLE-PAGE SPREAD CONTAINER */
                <div className="relative w-full max-w-5xl h-full flex items-center justify-center [perspective:2200px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSpreadIndex}
                      initial={{
                        rotateY: flipDirection === "next" ? -25 : 25,
                        opacity: 0.4,
                      }}
                      animate={{
                        rotateY: 0,
                        opacity: 1,
                        scale: zoomLevel,
                      }}
                      exit={{
                        rotateY: flipDirection === "next" ? 25 : -25,
                        opacity: 0.4,
                      }}
                      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                      className="relative flex items-center justify-center shadow-[0_60px_120px_-30px_rgba(0,0,0,0.95)] rounded-2xl overflow-hidden [transform-style:preserve-3d] border border-zinc-800 max-h-[75vh]"
                    >
                      {/* 2-PAGE SPREAD CONTAINER */}
                      <div className="flex items-center justify-center max-h-[75vh]">
                        {/* LEFT PAGE */}
                        {currentSpreadIndex === 0 ? (
                          /* Front Cover Left Spine Area */
                          <div className="hidden md:flex h-[60vh] sm:h-[68vh] w-[40vw] max-w-[420px] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-r border-zinc-800 items-center justify-center p-6 text-center select-none shadow-[inset_-30px_0_40px_rgba(0,0,0,0.8)]">
                            <div className="space-y-3 opacity-60">
                              <BookOpen className="h-10 w-10 mx-auto text-cyan-400" />
                              <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                                {activeMagazine.title}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">{activeMagazine.issue}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative h-[60vh] sm:h-[68vh] w-[45vw] sm:w-[40vw] max-w-[420px] bg-zinc-900 overflow-hidden border-r border-zinc-800 shadow-[inset_-25px_0_35px_rgba(0,0,0,0.5)]">
                            {currentSpread.left ? (
                              <img
                                src={currentSpread.left}
                                alt={`Page ${currentSpread.leftNum}`}
                                className="h-full w-full object-contain bg-zinc-950"
                              />
                            ) : (
                              <div className="h-full w-full bg-zinc-950 flex items-center justify-center text-xs text-zinc-600 font-mono">End of Issue</div>
                            )}
                            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/80 via-black/30 to-transparent pointer-events-none" />
                            <span className="absolute bottom-2 left-3 bg-black/80 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full border border-zinc-800">
                              P. {currentSpread.leftNum}
                            </span>
                          </div>
                        )}

                        {/* CENTRAL BOOK SPINE ACCENT */}
                        <div className="h-[60vh] sm:h-[68vh] w-2 bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-950 z-20 shrink-0 shadow-2xl" />

                        {/* RIGHT PAGE */}
                        <div className="relative h-[60vh] sm:h-[68vh] w-[45vw] sm:w-[40vw] max-w-[420px] bg-zinc-900 overflow-hidden border-l border-zinc-800 shadow-[inset_25px_0_35px_rgba(0,0,0,0.5)]">
                          {currentSpread.right ? (
                            <img
                              src={currentSpread.right}
                              alt={`Page ${currentSpreadIndex === 0 ? 1 : currentSpread.rightNum}`}
                              className="h-full w-full object-contain bg-zinc-950"
                            />
                          ) : (
                            <div className="h-full w-full bg-zinc-950 flex items-center justify-center text-xs text-zinc-600 font-mono">End of Issue</div>
                          )}
                          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
                          <span className="absolute bottom-2 right-3 bg-black/80 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full border border-zinc-800">
                            P. {currentSpreadIndex === 0 ? 1 : currentSpread.rightNum}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* Right Floating Flip Arrow Button */}
              <button
                type="button"
                disabled={currentSpreadIndex >= totalSpreads - 1}
                onClick={handleNextSpread}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-zinc-900/90 border border-zinc-700 text-white hover:bg-cyan-600 hover:border-cyan-400 transition-all cursor-pointer shadow-2xl disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                title="Next Page (Flip Right / ArrowRight)"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>

            {/* BOTTOM FOOTER CONTROL BAR */}
            <div className="border-t border-zinc-800/90 bg-black/95 px-4 py-3 sm:px-8 z-30 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Page Counter Badge */}
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 shrink-0">
                <span className="bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 shadow-inner">
                  {currentSpreadIndex === 0 ? "Cover (Page 1)" : `Pages ${currentSpread.leftNum}-${currentSpread.rightNum}`}
                  <span className="text-slate-500 font-normal ml-1">of {activePages.length}</span>
                </span>
              </div>

              {/* Interactive Page Range Slider Scrub Bar */}
              <div className="flex-1 w-full max-w-xl flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">P.1</span>
                <input
                  type="range"
                  min={0}
                  max={totalSpreads - 1}
                  value={currentSpreadIndex}
                  onChange={(e) => {
                    const newIdx = parseInt(e.target.value, 10);
                    if (newIdx !== currentSpreadIndex) {
                      setCurrentSpreadIndex(newIdx);
                      playPageFlipSound();
                    }
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-full bg-zinc-800"
                />
                <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">P.{activePages.length}</span>
              </div>

              {/* Quick Navigation Prev/Next Pills */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={currentSpreadIndex === 0}
                  onClick={handlePrevSpread}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-slate-300 hover:text-white hover:border-cyan-500/50 disabled:opacity-30 cursor-pointer font-btn"
                >
                  ◀ Prev
                </button>
                <button
                  type="button"
                  disabled={currentSpreadIndex >= totalSpreads - 1}
                  onClick={handleNextSpread}
                  className="px-3.5 py-1.5 rounded-xl gradient-brand text-xs font-extrabold text-white shadow-md disabled:opacity-30 cursor-pointer font-btn border-none"
                >
                  Next ▶
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

