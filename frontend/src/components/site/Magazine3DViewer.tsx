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
  Printer,
  Search,
  Sparkles,
  Play,
  Pause,
  Bookmark,
  RotateCcw,
  Check,
  Copy,
  ArrowRight,
  ExternalLink,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { MagazineItem } from "@/lib/site-data";

interface Magazine3DViewerProps {
  magazine: MagazineItem;
  pages: string[];
  onClose: () => void;
}

export function Magazine3DViewer({ magazine, pages, onClose }: Magazine3DViewerProps) {
  // Loader State
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Reader Controls State
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Drawers & Overlays
  const [tocOpen, setTocOpen] = useState(false);
  const [thumbnailSidebarOpen, setThumbnailSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);

  // Page Flip Animation Direction & Physics
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [isHoveringCorner, setIsHoveringCorner] = useState<"left" | "right" | null>(null);

  // Dynamic Mouse Drag Corner Page Flip
  const [isDraggingPage, setIsDraggingPage] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Touch Drag State for Mobile Swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate realistic loading animation sequence
  useEffect(() => {
    setIsLoading(true);
    setLoadProgress(0);

    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [magazine]);

  // Audio Context for realistic paper flip sound effect
  const playPaperSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const bufferSize = ctx.sampleRate * 0.15; // 150ms duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(850, ctx.currentTime);
      filter.Q.setValueAtTime(1.6, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {}
  };

  // Ensure pages array is non-empty
  const activePages = pages.length > 0 ? pages : [magazine.cover, magazine.cover];
  const totalSpreads = Math.max(1, Math.ceil((activePages.length + 1) / 2));
  const totalPages = activePages.length;

  // Get pages for a given spread index (0 = Cover spread)
  const getSpread = (spreadIdx: number) => {
    if (spreadIdx === 0) {
      return {
        left: null,
        right: activePages[0] || magazine.cover,
        leftNum: null,
        rightNum: 1,
      };
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

  const currentSpread = getSpread(currentSpreadIndex);

  // Next / Previous Navigation Handlers
  const goNext = () => {
    if (currentSpreadIndex < totalSpreads - 1) {
      setFlipDirection("next");
      playPaperSound();
      setCurrentSpreadIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const goPrev = () => {
    if (currentSpreadIndex > 0) {
      setFlipDirection("prev");
      playPaperSound();
      setCurrentSpreadIndex((prev) => prev - 1);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = () => {
    if (bookmarkedPages.includes(currentSpreadIndex)) {
      setBookmarkedPages((prev) => prev.filter((p) => p !== currentSpreadIndex));
      toast.info(`Bookmark removed for Spread ${currentSpreadIndex + 1}`);
    } else {
      setBookmarkedPages((prev) => [...prev, currentSpreadIndex]);
      toast.success(`Spread ${currentSpreadIndex + 1} bookmarked!`);
    }
  };

  // Auto-play presentation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isLoading) {
      timer = setInterval(() => {
        if (currentSpreadIndex < totalSpreads - 1) {
          goNext();
        } else {
          setIsPlaying(false);
        }
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentSpreadIndex, totalSpreads, isLoading]);

  // Keyboard navigation & Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (tocOpen) setTocOpen(false);
        else if (thumbnailSidebarOpen) setThumbnailSidebarOpen(false);
        else if (searchOpen) setSearchOpen(false);
        else onClose();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSpreadIndex, totalSpreads, tocOpen, thumbnailSidebarOpen, searchOpen]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Print current spread
  const handlePrint = () => {
    toast.info("Preparing Executive Talks Magazine spread for printing...");
    setTimeout(() => window.print(), 500);
  };

  // Share link handler
  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: magazine.title,
        text: `Read ${magazine.title} on Executive Talks Media Business Intelligence!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success("Magazine link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches[0]) touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches[0]) touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      goNext();
    } else if (diff < -50) {
      goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Table of Contents entries list
  const tocEntries = [
    { title: "Editor's Note & Executive Overview", spread: 0, page: 1 },
    { title: "Publisher's Letter: India's C-Suite Growth Blueprint", spread: 1, page: 2 },
    { title: "Leadership Interviews: Resilient C-Suite Strategy", spread: 2, page: 4 },
    { title: "Executive Insights: CFO Capital & Growth Benchmarks", spread: 3, page: 6 },
    { title: "Industry Reports: HR Intelligence & AI Workforce Scale", spread: 4, page: 8 },
    { title: "Innovation Stories: Tech Pioneers & Enterprise Cloud", spread: 5, page: 10 },
    { title: "Partner Spotlight: Global Tech & GCC Alliances", spread: 6, page: 12 },
    { title: "Events & Flagship Conclaves Retrospective", spread: 7, page: 14 },
    { title: "Back Cover & Executive Talks Media Network Directory", spread: Math.max(0, totalSpreads - 1), page: totalPages },
  ];

  // Calculate current reading percentage
  const readingPercentage = Math.round(((currentSpreadIndex + 1) / totalSpreads) * 100);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#08111F] via-[#7A0019]/25 to-[#050505] text-white overflow-hidden select-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Spotlight Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[700px] bg-[#7A0019]/20 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.96)_100%)] pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. LOADING ANIMATION SCREEN                               */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#08111F] p-6 text-center"
          >
            <div className="relative flex flex-col items-center">
              <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7A0019] via-[#9e0021] to-[#08111F] p-0.5 shadow-[0_0_50px_rgba(122,0,25,0.6)]">
                <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#08111F]">
                  <BookOpen className="h-10 w-10 text-[#D4AF37] animate-pulse" />
                </div>
                <div className="absolute -inset-1 rounded-3xl border border-[#D4AF37]/40 animate-ping opacity-20" />
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-white font-display sm:text-3xl">
                EXECUTIVE TALKS MEDIA <span className="text-[#D4AF37]">BUSINESS INTELLIGENCE</span>
              </h2>
              <p className="mt-1 text-xs font-mono tracking-widest text-slate-400 uppercase">
                {magazine.title} · {magazine.issue}
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center space-y-4 w-64">
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700 p-0.5 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#7A0019] via-[#D4AF37] to-amber-300 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <div className="flex items-center justify-between w-full text-xs font-mono">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D4AF37]" />
                  Loading Executive Talks Magazine...
                </span>
                <span className="font-extrabold text-[#D4AF37]">{loadProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. TOP GLASSMORPER TOOLBAR (Blur 24px, Gold Border)       */}
      {/* ========================================================= */}
      <div className="relative z-30 flex items-center justify-between border-b border-[#D4AF37]/40 bg-[#08111F]/80 px-4 py-3 sm:px-6 shadow-2xl backdrop-blur-[24px] shrink-0">
        {/* ET Media Branding & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#7A0019] to-[#08111F] border border-[#D4AF37]/50 text-[#D4AF37] shrink-0 shadow-md">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-white truncate font-display flex items-center gap-2">
              <span>{magazine.title}</span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono font-extrabold text-[#D4AF37] bg-[#7A0019]/40 border border-[#D4AF37]/40 rounded-full uppercase">
                {magazine.issue}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:flex items-center gap-2">
              <span>{magazine.month || magazine.date}</span>
              <span>·</span>
              <span className="text-[#D4AF37] font-semibold">Premium 3D Flipbook</span>
            </p>
          </div>
        </div>

        {/* Toolbar Buttons Action Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Table of Contents */}
          <button
            type="button"
            onClick={() => {
              setTocOpen((v) => !v);
              setThumbnailSidebarOpen(false);
              setSearchOpen(false);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              tocOpen
                ? "bg-[#7A0019] border-[#D4AF37] text-white shadow-lg shadow-[#7A0019]/40"
                : "border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-[#D4AF37]/40"
            }`}
            title="Table of Contents"
          >
            <List className="h-4 w-4 text-[#D4AF37]" />
            <span className="hidden md:inline font-btn">Contents</span>
          </button>

          {/* Thumbnail Sidebar Toggle */}
          <button
            type="button"
            onClick={() => {
              setThumbnailSidebarOpen((v) => !v);
              setTocOpen(false);
              setSearchOpen(false);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              thumbnailSidebarOpen
                ? "bg-[#7A0019] border-[#D4AF37] text-white shadow-lg shadow-[#7A0019]/40"
                : "border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-[#D4AF37]/40"
            }`}
            title="Thumbnail Grid Sidebar"
          >
            <Grid className="h-4 w-4 text-[#D4AF37]" />
            <span className="hidden md:inline font-btn">Thumbnails</span>
          </button>

          {/* Search Drawer */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => !v);
              setTocOpen(false);
              setThumbnailSidebarOpen(false);
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              searchOpen
                ? "bg-[#7A0019] border-[#D4AF37] text-white"
                : "border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-[#D4AF37]/40"
            }`}
            title="Search Magazine Spreads"
          >
            <Search className="h-4 w-4 text-[#D4AF37]" />
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={toggleBookmark}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              bookmarkedPages.includes(currentSpreadIndex)
                ? "bg-[#D4AF37] border-[#D4AF37] text-slate-950 shadow-md"
                : "border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-[#D4AF37]/40"
            }`}
            title="Bookmark Current Page"
          >
            <Bookmark className="h-4 w-4" />
          </button>

          {/* Audio Flip Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={soundEnabled ? "Mute Flip Sound" : "Enable Flip Sound"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[#D4AF37]" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {/* Zoom Toggle (100% -> 150% -> 200% -> 300%) */}
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => (prev >= 3 ? 1 : prev === 1 ? 1.5 : prev === 1.5 ? 2 : 3))}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Zoom Level (100% / 150% / 200% / 300%)"
          >
            {zoomLevel > 1 ? <ZoomOut className="h-4 w-4 text-[#D4AF37]" /> : <ZoomIn className="h-4 w-4" />}
            <span className="hidden lg:inline font-mono">{Math.round(zoomLevel * 100)}%</span>
          </button>

          {/* Download PDF */}
          {magazine.pdf_url && (
            <a
              href={magazine.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl border border-[#D4AF37]/40 bg-[#7A0019]/40 text-[#D4AF37] hover:bg-[#7A0019] hover:text-white transition-all cursor-pointer hidden sm:flex items-center gap-1 text-xs font-bold font-btn"
              title="Download High-Res PDF"
            >
              <Download className="h-4 w-4" />
              <span className="hidden xl:inline">PDF</span>
            </a>
          )}

          {/* Share Magazine */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Share Magazine"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white transition-all cursor-pointer hidden sm:flex"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-[#D4AF37]" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 transition-all cursor-pointer ml-1"
            title="Close Magazine Viewer (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TABLE OF CONTENTS POPUP DRAWER                         */}
      {/* ========================================================= */}
      <AnimatePresence>
        {tocOpen && (
          <motion.div
            initial={{ opacity: 0, x: -320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -320 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-16 left-0 bottom-16 w-80 sm:w-96 z-40 bg-[#08111F]/98 border-r border-[#D4AF37]/30 p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <List className="h-4 w-4 text-[#D4AF37]" /> Table of Contents
              </h4>
              <button type="button" onClick={() => setTocOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-medium">
              {tocEntries.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setCurrentSpreadIndex(Math.min(item.spread, totalSpreads - 1));
                    setTocOpen(false);
                    playPaperSound();
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    currentSpreadIndex === item.spread
                      ? "bg-[#7A0019]/40 border-[#D4AF37] text-white shadow-md"
                      : "border-slate-800/80 bg-slate-900/70 hover:bg-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="space-y-0.5 pr-2 min-w-0">
                    <p className="font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Spread Edition {item.spread + 1}</p>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-[#D4AF37] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                    P. {item.page}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. SEARCH SPREADS MODAL                                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-xl z-40 bg-[#08111F]/98 border border-[#D4AF37]/30 p-6 shadow-2xl rounded-b-3xl backdrop-blur-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <Search className="h-4 w-4 text-[#D4AF37]" /> Search Magazine Pages
              </h4>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords (e.g. Editor's Note, CEO, CFO, AI, Reports, Conclave)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                autoFocus
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>

            {searchQuery.trim() !== "" && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tocEntries
                  .filter((entry) => entry.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((match, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentSpreadIndex(match.spread);
                        setSearchOpen(false);
                        playPaperSound();
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-[#D4AF37] text-xs font-bold text-white flex items-center justify-between"
                    >
                      <span>{match.title}</span>
                      <span className="text-[10px] font-mono text-[#D4AF37]">Jump to P.{match.page}</span>
                    </button>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 5. RIGHT SLIDE-IN THUMBNAIL SIDEBAR (3 Columns Grid)      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {thumbnailSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 380 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="absolute top-16 right-0 bottom-16 w-80 sm:w-[420px] z-40 bg-[#08111F]/98 border-l border-[#D4AF37]/30 p-6 shadow-2xl backdrop-blur-2xl overflow-y-auto space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-extrabold text-white font-display flex items-center gap-2">
                <Grid className="h-4 w-4 text-[#D4AF37]" /> Thumbnail Grid ({totalSpreads} Spreads)
              </h4>
              <button
                type="button"
                onClick={() => setThumbnailSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 3-Column Miniature Previews */}
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: totalSpreads }).map((_, sIdx) => {
                const sp = getSpread(sIdx);
                const isCurrent = sIdx === currentSpreadIndex;
                return (
                  <div
                    key={sIdx}
                    onClick={() => {
                      setCurrentSpreadIndex(sIdx);
                      setThumbnailSidebarOpen(false);
                      playPaperSound();
                    }}
                    className={`group relative rounded-xl border p-1 bg-slate-950 cursor-pointer transition-all ${
                      isCurrent
                        ? "border-[#7A0019] ring-2 ring-[#7A0019] shadow-[0_0_20px_rgba(122,0,25,0.7)] scale-105"
                        : "border-slate-800 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <div className="flex h-24 gap-0.5 overflow-hidden rounded-lg bg-slate-900 border border-slate-800">
                      {sp.left ? (
                        <img src={sp.left} alt="Left Page" className="h-full w-1/2 object-cover" />
                      ) : (
                        <div className="h-full w-1/2 bg-slate-950 flex items-center justify-center text-[8px] text-slate-600 font-mono">
                          Cover
                        </div>
                      )}
                      {sp.right ? (
                        <img src={sp.right} alt="Right Page" className="h-full w-1/2 object-cover" />
                      ) : (
                        <div className="h-full w-1/2 bg-slate-950 flex items-center justify-center text-[8px] text-slate-600 font-mono">
                          End
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-center text-[9px] font-mono font-bold text-slate-300 truncate">
                      {sIdx === 0 ? "Cover (P.1)" : `P.${sp.leftNum}-${sp.rightNum}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 6. MAIN 3D FLIPBOOK DOUBLE-PAGE SPREAD VIEWER AREA        */}
      {/* ========================================================= */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Left Floating Navigation Arrow */}
        <button
          type="button"
          disabled={currentSpreadIndex === 0}
          onClick={goPrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3.5 sm:p-4 rounded-full bg-[#08111F]/90 border border-slate-700 text-white hover:bg-[#7A0019] hover:border-[#D4AF37] transition-all cursor-pointer shadow-2xl disabled:opacity-20 disabled:pointer-events-none active:scale-95 group"
          title="Previous Page (Flip Left / ArrowLeft)"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* 3D BOOK DOUBLE-PAGE SPREAD PERSPECTIVE CONTAINER (1200px CSS Perspective) */}
        <div className="relative w-full max-w-5xl h-full flex items-center justify-center [perspective:1200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSpreadIndex}
              initial={{
                rotateY: flipDirection === "next" ? -35 : 35,
                opacity: 0.3,
                scale: 0.95,
              }}
              animate={{
                rotateY: 0,
                opacity: 1,
                scale: zoomLevel,
              }}
              exit={{
                rotateY: flipDirection === "next" ? 35 : -35,
                opacity: 0.3,
                scale: 0.95,
              }}
              transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
              className="relative flex items-center justify-center shadow-[0_70px_140px_-30px_rgba(0,0,0,0.95)] rounded-2xl overflow-hidden [transform-style:preserve-3d] border border-slate-800 max-h-[76vh] group cursor-grab active:cursor-grabbing"
            >
              {/* Glossy Cover Reflection Gloss Sweep */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-30" />

              {/* 2-PAGE FACING SPREAD LAYOUT */}
              <div className="flex items-center justify-center max-h-[76vh]">
                {/* LEFT PAGE */}
                {currentSpreadIndex === 0 ? (
                  /* Front Cover Hardcover Left Spine Backing */
                  <div className="hidden md:flex h-[62vh] sm:h-[70vh] w-[40vw] max-w-[430px] bg-gradient-to-r from-[#08111F] via-[#7A0019]/40 to-[#08111F] border-r border-slate-800 items-center justify-center p-8 text-center select-none shadow-[inset_-35px_0_45px_rgba(0,0,0,0.85)]">
                    <div className="space-y-4 opacity-75">
                      <div className="h-16 w-16 mx-auto rounded-2xl bg-[#7A0019]/50 border border-[#D4AF37]/50 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-[#D4AF37]" />
                      </div>
                      <p className="text-sm font-extrabold text-white font-display uppercase tracking-wider">
                        {magazine.title}
                      </p>
                      <p className="text-xs text-[#D4AF37] font-mono font-bold">{magazine.issue}</p>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed font-sans">
                        Official C-Suite Business Publication by Executive Talks Media Business Intelligence.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    onMouseEnter={() => setIsHoveringCorner("left")}
                    onMouseLeave={() => setIsHoveringCorner(null)}
                    className={`relative h-[62vh] sm:h-[70vh] w-[45vw] sm:w-[40vw] max-w-[430px] bg-[#F7F8FA] overflow-hidden border-r border-slate-300 shadow-[inset_-30px_0_40px_rgba(0,0,0,0.6)] transition-all ${
                      isHoveringCorner === "left" ? "rotate-[-1deg]" : ""
                    }`}
                  >
                    {currentSpread.left ? (
                      <img
                        src={currentSpread.left}
                        alt={`Page ${currentSpread.leftNum}`}
                        className="h-full w-full object-contain bg-slate-950"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center text-xs text-slate-500 font-mono p-6 text-center space-y-2">
                        <BookOpen className="h-8 w-8 text-slate-700 mx-auto" />
                        <span>End of Publication Spread</span>
                      </div>
                    )}
                    {/* Inner Paper Spine Shadow Overlay */}
                    <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/80 via-black/30 to-transparent pointer-events-none" />

                    {/* Page Number Badge */}
                    <span className="absolute bottom-3 left-4 bg-black/80 text-[10px] font-mono font-bold text-[#D4AF37] px-2.5 py-1 rounded-lg border border-slate-800 shadow-md">
                      Page {currentSpread.leftNum} / {totalPages}
                    </span>
                  </div>
                )}

                {/* CENTRAL 3D BOOK SPINE ACCENT */}
                <div className="h-[62vh] sm:h-[70vh] w-2.5 bg-gradient-to-r from-[#08111F] via-slate-600 to-[#08111F] z-20 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.9)]" />

                {/* RIGHT PAGE */}
                <div
                  onMouseEnter={() => setIsHoveringCorner("right")}
                  onMouseLeave={() => setIsHoveringCorner(null)}
                  className={`relative h-[62vh] sm:h-[70vh] w-[45vw] sm:w-[40vw] max-w-[430px] bg-[#F7F8FA] overflow-hidden border-l border-slate-300 shadow-[inset_30px_0_40px_rgba(0,0,0,0.6)] transition-all ${
                    isHoveringCorner === "right" ? "rotate-[1deg]" : ""
                  }`}
                >
                  {currentSpread.right ? (
                    <img
                      src={currentSpread.right}
                      alt={`Page ${currentSpreadIndex === 0 ? 1 : currentSpread.rightNum}`}
                      className="h-full w-full object-contain bg-slate-950"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center text-xs text-slate-500 font-mono p-6 text-center space-y-2">
                      <BookOpen className="h-8 w-8 text-slate-700 mx-auto" />
                      <span>End of Publication Spread</span>
                    </div>
                  )}
                  {/* Inner Paper Spine Shadow Overlay */}
                  <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />

                  {/* Page Number Badge */}
                  <span className="absolute bottom-3 right-4 bg-black/80 text-[10px] font-mono font-bold text-[#D4AF37] px-2.5 py-1 rounded-lg border border-slate-800 shadow-md">
                    Page {currentSpreadIndex === 0 ? 1 : currentSpread.rightNum} / {totalPages}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Floating Navigation Arrow */}
        <button
          type="button"
          disabled={currentSpreadIndex >= totalSpreads - 1}
          onClick={goNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3.5 sm:p-4 rounded-full bg-[#08111F]/90 border border-slate-700 text-white hover:bg-[#7A0019] hover:border-[#D4AF37] transition-all cursor-pointer shadow-2xl disabled:opacity-20 disabled:pointer-events-none active:scale-95 group"
          title="Next Page (Flip Right / ArrowRight)"
        >
          <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 7. BOTTOM CONTROL & SCRUBBER TOOLBAR                      */}
      {/* ========================================================= */}
      <div className="border-t border-slate-800/90 bg-[#08111F]/95 px-4 py-3 sm:px-8 z-30 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-2xl">
        {/* Current Spread Badge */}
        <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-300 shrink-0">
          <span className="bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner flex items-center gap-2">
            <span className="text-[#D4AF37] font-extrabold">
              Page {currentSpreadIndex === 0 ? "01" : String(currentSpread.leftNum).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
            </span>
            <span className="text-slate-500 font-normal">({readingPercentage}% read)</span>
          </span>

          {/* Auto-play Presentation Mode Button */}
          <button
            type="button"
            onClick={() => setIsPlaying((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 font-btn ${
              isPlaying
                ? "bg-[#7A0019] border-[#D4AF37] text-white shadow-md shadow-[#7A0019]/40"
                : "border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            }`}
            title={isPlaying ? "Pause Auto Play Mode" : "Start Auto Presentation Mode"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Auto Flip</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Scrub Range Slider Bar */}
        <div className="flex-1 w-full max-w-xl flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">Page 01</span>
          <input
            type="range"
            min={0}
            max={totalSpreads - 1}
            value={currentSpreadIndex}
            onChange={(e) => {
              const newIdx = parseInt(e.target.value, 10);
              if (newIdx !== currentSpreadIndex) {
                setFlipDirection(newIdx > currentSpreadIndex ? "next" : "prev");
                setCurrentSpreadIndex(newIdx);
                playPaperSound();
              }
            }}
            className="w-full accent-[#7A0019] cursor-pointer h-2 rounded-full bg-slate-800"
          />
          <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">Page {totalPages}</span>
        </div>

        {/* Quick Prev / Next Navigation Pill Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={currentSpreadIndex === 0}
            onClick={goPrev}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-[#D4AF37]/50 disabled:opacity-30 cursor-pointer font-btn"
          >
            ◀ Prev
          </button>
          <button
            type="button"
            disabled={currentSpreadIndex >= totalSpreads - 1}
            onClick={goNext}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7A0019] to-[#9e0021] border border-[#D4AF37]/50 text-xs font-extrabold text-white shadow-md hover:shadow-[#7A0019]/40 disabled:opacity-30 cursor-pointer font-btn"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
