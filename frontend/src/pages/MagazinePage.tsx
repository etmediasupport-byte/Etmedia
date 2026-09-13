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
  Filter,
  CheckCircle2,
  Shield,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { images, magazineCategories, getDefaultMagazines, MagazineItem } from "@/lib/site-data";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { socket } from "@/lib/socket";

export default function MagazinePage() {
  const [magazinesList, setMagazinesList] = useState<MagazineItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected magazine for Flipbook Modal Reader
  const [activeMagazine, setActiveMagazine] = useState<MagazineItem | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, 1.5 = 150%, 2 = 200%
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Helper to parse pages array from magazine
  const getPagesArray = (mag: MagazineItem): string[] => {
    if (Array.isArray(mag.pages_list)) return mag.pages_list;
    if (typeof mag.pages_list === "string") {
      try {
        const parsed = JSON.parse(mag.pages_list);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [mag.cover, mag.cover];
  };

  const openReader = (mag: MagazineItem) => {
    setActiveMagazine(mag);
    setCurrentPageIndex(0);
    setZoomLevel(1);
  };

  const closeReader = () => {
    setActiveMagazine(null);
    setZoomLevel(1);
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
    setZoomLevel((prev) => (prev >= 2 ? 1 : prev === 1 ? 1.5 : 2));
  };

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

  const activePages = activeMagazine ? getPagesArray(activeMagazine) : [];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
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
        <section className="py-16 md:py-24 border-b border-slate-800/80 relative">
          <div className="container-x grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="[perspective:1600px]">
                <motion.div
                  initial={{ rotateY: -25 }}
                  animate={{ rotateY: [-25, -12, -25] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ rotateY: -4, scale: 1.03 }}
                  onClick={() => openReader(featuredMagazine)}
                  className="relative mx-auto w-72 sm:w-96 cursor-pointer [transform-style:preserve-3d] group"
                >
                  {/* Magazine Spine Depth Layer */}
                  <div className="bg-slate-800 absolute inset-y-4 -right-5 rounded-r-2xl [transform:rotateY(-16deg)_translateZ(-30px)] border border-slate-700" />
                  <div className="bg-slate-700 absolute inset-y-2 -right-2.5 rounded-r-2xl [transform:rotateY(-9deg)_translateZ(-15px)] border border-slate-600" />
                  
                  <img
                    src={featuredMagazine.cover}
                    alt={`${featuredMagazine.title} Cover`}
                    loading="lazy"
                    className="relative rounded-2xl shadow-[0_50px_90px_-35px_rgba(0,0,0,0.8)] border border-slate-700/80 group-hover:border-cyan-500/60 transition-all duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors rounded-2xl flex items-center justify-center">
                    <span className="gradient-brand rounded-full px-5 py-2.5 text-xs font-extrabold text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Click to Open Flipbook
                    </span>
                  </div>
                </motion.div>
              </div>
            </Reveal>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-300 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Featured Issue · {featuredMagazine.issue}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
                {featuredMagazine.title}
              </h2>

              <p className="mt-2 text-cyan-400 font-semibold text-sm font-sans">
                {featuredMagazine.month || featuredMagazine.date} · {featuredMagazine.category} Edition
              </p>

              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Explore how benchmark CEOs, CFOs, and tech leaders are driving enterprise resilience, digital transformation, and executive innovation across India's premier markets.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => openReader(featuredMagazine)}
                  className="gradient-brand inline-flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Read Issue Now</span>
                </button>

                {featuredMagazine.pdf_url && (
                  <a
                    href={featuredMagazine.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
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
      <section className="py-12 bg-slate-900/40 border-b border-slate-800/80">
        <div className="container-x">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search issue, title or month..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["All", ...magazineCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                      : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
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
      <section className="py-20">
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
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMagazines.map((mag, i) => (
                <Reveal key={mag.id || mag.issue} delay={i * 0.05}>
                  <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-300">
                    <div>
                      {/* Cover Image Container */}
                      <div
                        onClick={() => openReader(mag)}
                        className="relative h-72 w-full overflow-hidden rounded-2xl bg-slate-950 cursor-pointer"
                      >
                        <img
                          src={mag.cover}
                          alt={`${mag.title} cover`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 border border-slate-800">
                            {mag.category}
                          </span>
                          {mag.is_featured ? (
                            <span className="rounded-full bg-purple-500/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md">
                              Featured
                            </span>
                          ) : null}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="rounded-2xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" /> Open Flipbook
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
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => openReader(mag)}
                        className="flex-1 cursor-pointer rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-extrabold text-white shadow-md shadow-cyan-500/15 hover:shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Read Now</span>
                      </button>

                      {mag.pdf_url ? (
                        <a
                          href={mag.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-950 p-3 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
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

      {/* ========================================== */}
      {/* 4. PREMIUM FLIPBOOK DETAIL POPUP MODAL     */}
      {/* ========================================== */}
      <AnimatePresence>
        {activeMagazine && (
          <div
            ref={modalContainerRef}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-2xl text-white animate-in fade-in duration-300 overflow-hidden"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 sm:px-6 z-20">
              {/* Title & Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shrink-0">
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

              {/* Controls Toolbar */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Page Indicator */}
                <div className="hidden sm:flex items-center gap-1 text-xs font-mono font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-cyan-300">
                  <span>Page {currentPageIndex + 1}</span>
                  <span className="text-slate-600">/</span>
                  <span>{activePages.length}</span>
                </div>

                {/* Zoom Control */}
                <button
                  type="button"
                  onClick={handleZoom}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Toggle Zoom (1x / 1.5x / 2x)"
                >
                  {zoomLevel > 1 ? <ZoomOut className="h-4 w-4 text-cyan-400" /> : <ZoomIn className="h-4 w-4" />}
                  <span className="hidden md:inline font-mono">{zoomLevel * 100}%</span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all cursor-pointer"
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
                    className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-bold"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </a>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeReader}
                  className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 transition-all cursor-pointer ml-1"
                  title="Close Flipbook Reader"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Flipbook Spread Area */}
            <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto">
              {/* Left Arrow Button */}
              <button
                type="button"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-cyan-600 hover:border-cyan-500 transition-all cursor-pointer shadow-2xl disabled:opacity-30 disabled:pointer-events-none"
                title="Previous Page"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Flipbook Page Viewer Display */}
              <div className="relative w-full max-w-4xl max-h-[75vh] flex items-center justify-center [perspective:2000px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPageIndex}
                    initial={{ rotateY: -90, opacity: 0.2 }}
                    animate={{ rotateY: 0, opacity: 1, scale: zoomLevel }}
                    exit={{ rotateY: 90, opacity: 0.2 }}
                    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                    className="relative origin-left shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden border border-slate-800 max-h-[70vh]"
                  >
                    <img
                      src={activePages[currentPageIndex] || activeMagazine.cover}
                      alt={`Page ${currentPageIndex + 1}`}
                      className="h-full max-h-[70vh] w-auto object-contain bg-slate-950"
                      onError={(e) => {
                        // Fallback to cover if page image link fails
                        (e.target as HTMLImageElement).src = activeMagazine.cover;
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-950/60 to-transparent pointer-events-none" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Arrow Button */}
              <button
                type="button"
                disabled={currentPageIndex >= activePages.length - 1}
                onClick={() => setCurrentPageIndex((p) => Math.min(activePages.length - 1, p + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-cyan-600 hover:border-cyan-500 transition-all cursor-pointer shadow-2xl disabled:opacity-30 disabled:pointer-events-none"
                title="Next Page"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Bottom Interactive Thumbnail Strip */}
            <div className="border-t border-slate-800 bg-slate-900/90 p-3 z-20">
              <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 overflow-x-auto py-1">
                {activePages.map((pgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPageIndex(idx)}
                    className={`relative h-16 w-12 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === currentPageIndex
                        ? "border-cyan-400 scale-105 shadow-lg shadow-cyan-500/30"
                        : "border-slate-800 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={pgUrl} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-mono font-bold text-center text-white">
                      P.{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
