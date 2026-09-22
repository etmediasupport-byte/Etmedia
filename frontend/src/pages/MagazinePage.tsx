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
  Sparkles,
  Search,
  Loader2,
  Volume2,
  VolumeX,
  Grid,
  List,
  Share2,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { images, magazineCategories, getDefaultMagazines, MagazineItem } from "@/lib/site-data";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { socket } from "@/lib/socket";
import { extractPdfPagesToDataUrls, parsePagesList } from "@/utils/pdfExtractor";

export default function MagazinePage() {
  const [magazinesList, setMagazinesList] = useState<MagazineItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected magazine for 3D Flipbook Reader
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

    // Expand pages if less than 6 to provide a rich 8-page book spread
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

  // Double page spread calculation:
  // Spread 0: Cover (Right: Page 0, Left: Blank Spine)
  // Spread 1: Left: Page 1, Right: Page 2
  // Spread 2: Left: Page 3, Right: Page 4
  // ...
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

  const currentSpread = getSpreadPages(currentSpreadIndex);

  // Featured Magazine
  const featuredMagazine = magazinesList.find((m) => m.is_featured) || magazinesList[0] || getDefaultMagazines()[0];

  // Filtered Magazines List
  const filteredMagazines = magazinesList.filter((m) => {
    const matchesCategory =
      selectedCategory === "All" || m.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.month && m.month.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
        <section className="py-16 md:py-24 border-b border-zinc-800/80 relative overflow-hidden bg-zinc-950">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="container-x grid items-center gap-12 lg:grid-cols-2 relative z-10">
            <Reveal>
              <div className="[perspective:1600px]">
                <motion.div
                  initial={{ rotateY: -22 }}
                  animate={{ rotateY: [-22, -10, -22] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ rotateY: -4, scale: 1.03 }}
                  onClick={() => openReader(featuredMagazine)}
                  className="relative mx-auto w-72 sm:w-96 cursor-pointer [transform-style:preserve-3d] group"
                >
                  {/* Magazine Spine Depth Layer */}
                  <div className="bg-zinc-800 absolute inset-y-4 -right-5 rounded-r-2xl [transform:rotateY(-16deg)_translateZ(-30px)] border border-zinc-700" />
                  <div className="bg-zinc-700 absolute inset-y-2 -right-2.5 rounded-r-2xl [transform:rotateY(-9deg)_translateZ(-15px)] border border-zinc-600" />

                  <img
                    src={featuredMagazine.cover}
                    alt={`${featuredMagazine.title} Cover`}
                    loading="lazy"
                    className="relative rounded-2xl shadow-[0_50px_90px_-35px_rgba(0,0,0,0.9)] border border-zinc-700 group-hover:border-cyan-500/80 transition-all duration-300"
                  />

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors rounded-2xl flex items-center justify-center">
                    <span className="gradient-brand rounded-full px-6 py-3 text-xs font-extrabold text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-btn">
                      <BookOpen className="h-4 w-4" /> Open 3D Flipbook Reader
                    </span>
                  </div>
                </motion.div>
              </div>
            </Reveal>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/80 px-4 py-1 text-xs font-extrabold text-purple-300">
                <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                <span>Featured Issue · {featuredMagazine.issue}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display leading-tight">
                {featuredMagazine.title}
              </h2>

              <p className="text-cyan-400 font-extrabold text-sm font-sans">
                {featuredMagazine.month || featuredMagazine.date} · {featuredMagazine.category} Edition
              </p>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                {featuredMagazine.description || "Explore how benchmark CEOs, CFOs, and tech leaders are driving enterprise resilience, digital transformation, and executive innovation across India's premier markets."}
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => openReader(featuredMagazine)}
                  className="gradient-brand inline-flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-btn border-none"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Read 3D Magazine Flipbook</span>
                </button>

                {featuredMagazine.pdf_url && (
                  <a
                    href={featuredMagazine.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer font-btn"
                  >
                    <Download className="h-4 w-4 text-cyan-400" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* 2. MAGAZINE CATEGORIES & SEARCH BAR        */}
      {/* ========================================== */}
      <section className="py-10 bg-zinc-950/80 border-b border-zinc-800/80">
        <div className="container-x">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search issue, title or month..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-black pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["All", ...magazineCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer font-btn ${
                    selectedCategory === cat
                      ? "gradient-brand text-white shadow-md shadow-cyan-500/20"
                      : "bg-zinc-900 text-slate-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. MAGAZINE CARDS LISTING GRID             */}
      {/* ========================================== */}
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading
            kicker="Executive Library"
            title="All Magazine Editions"
            description="Browse complete digital editions of Executive Talks Magazine."
          />

          {filteredMagazines.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No magazine issues found matching your filter criteria.
            </div>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMagazines.map((mag, i) => (
                <Reveal key={mag.id || mag.issue} delay={i * 0.05}>
                  <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950/90 p-5 shadow-xl hover:border-cyan-500/50 hover:bg-zinc-900 transition-all duration-300">
                    <div>
                      {/* Cover Image Container */}
                      <div
                        onClick={() => openReader(mag)}
                        className="relative h-72 w-full overflow-hidden rounded-2xl bg-black cursor-pointer border border-zinc-800"
                      >
                        <img
                          src={mag.cover}
                          alt={`${mag.title} cover`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 border border-zinc-800">
                            {mag.category}
                          </span>
                          {mag.is_featured ? (
                            <span className="rounded-full bg-purple-600/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md">
                              Featured
                            </span>
                          ) : null}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="rounded-2xl gradient-brand px-4 py-2 text-xs font-bold text-white shadow-lg flex items-center gap-1.5 font-btn">
                            <BookOpen className="h-4 w-4" /> Open 3D Flipbook
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="mt-5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 font-mono">
                          <span className="text-cyan-400 font-bold">{mag.issue}</span>
                          <span>{mag.month || mag.date}</span>
                        </div>

                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors font-display line-clamp-1">
                          {mag.title}
                        </h3>

                        {mag.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans font-medium">
                            {mag.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center gap-3 pt-4 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => openReader(mag)}
                        className="flex-1 cursor-pointer rounded-2xl gradient-brand py-3 text-xs font-extrabold text-white shadow-md shadow-cyan-500/15 hover:shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-btn border-none"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Read 3D Flipbook</span>
                      </button>

                      {mag.pdf_url ? (
                        <a
                          href={mag.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-slate-300 hover:border-zinc-700 hover:text-white transition-colors"
                          title="Download PDF Edition"
                        >
                          <Download className="h-4 w-4 text-cyan-400" />
                        </a>
                      ) : null}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. REALISTIC 3D FLIPBOOK MAGAZINE READER MODAL (PUBLUU STYLE BOOK SPREAD) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeMagazine && (
          <div
            ref={modalContainerRef}
            className="fixed inset-0 z-50 flex flex-col bg-zinc-950/98 backdrop-blur-2xl text-white animate-in fade-in duration-300 overflow-hidden select-none"
          >
            {/* TOP HEADER TOOLBAR (Publuu Reader Style) */}
            <div className="flex items-center justify-between border-b border-zinc-800/90 bg-black/95 px-4 py-3 sm:px-6 z-30 shrink-0">
              {/* Title & Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-white truncate font-display">
                    {activeMagazine.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {activeMagazine.issue} · {activeMagazine.month || activeMagazine.date}
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

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled((v) => !v)}
                  className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={soundEnabled ? "Mute Page Flip Sound" : "Enable Page Flip Sound"}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
                </button>

                {/* Zoom Control */}
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
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </a>
                )}

                {/* Close Reader Button */}
                <button
                  type="button"
                  onClick={closeReader}
                  className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 transition-all cursor-pointer ml-1"
                  title="Close Reader"
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

            {/* THUMBNAIL GRID MODAL OVERLAY */}
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
                title="Previous Page (Flip Left)"
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
                            {/* Inner Fold Spine Shadow Effect */}
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
                          {/* Inner Fold Spine Shadow Effect */}
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
                title="Next Page (Flip Right)"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>

            {/* BOTTOM FOOTER CONTROL BAR (Publuu Slider & Page Counter) */}
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

