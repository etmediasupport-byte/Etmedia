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
import { Magazine3DViewer } from "@/components/site/Magazine3DViewer";
import { ThreeDMagazineHero } from "@/components/site/3DMagazineHero";

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
    <div className="relative min-h-screen bg-[#08111F] text-slate-100 selection:bg-[#7A0019]/40 selection:text-[#D4AF37] font-sans">
      {/* ========================================== */}
      {/* 1. 3D HARDCOVER FLOATING HERO EXPERIENCE   */}
      {/* ========================================== */}
      {featuredMagazine && (
        <ThreeDMagazineHero
          magazine={featuredMagazine}
          onOpenReader={openReader}
        />
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
          <Magazine3DViewer
            magazine={activeMagazine}
            pages={activePages}
            onClose={closeReader}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

