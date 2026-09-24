import { useEffect, useState, useMemo } from "react";
import { PageHero } from "@/components/site/PageHero";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { MediaGalleryItem, getDefaultMediaGallery, images, events } from "@/lib/site-data";
import { socket } from "@/lib/socket";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Maximize2,
  Download,
  Share2,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

const categories = ["All", "Keynotes", "Networking", "Awards", "Stage & AV", "Exhibitions"];

export default function GalleryPage() {
  const [items, setItems] = useState<MediaGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEventSlug, setSelectedEventSlug] = useState("all");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "photo" | "video">("all");

  // Pagination / Infinite scroll
  const [displayCount, setDisplayCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchGalleryItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items);
      } else {
        setItems(getDefaultMediaGallery());
      }
    } catch (err) {
      console.warn("Could not fetch gallery items, using defaults", err);
      setItems(getDefaultMediaGallery());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();

    const onGalleryUpdate = () => {
      fetchGalleryItems();
    };

    socket.on("gallery_updated", onGalleryUpdate);
    return () => {
      socket.off("gallery_updated", onGalleryUpdate);
    };
  }, []);

  // Filtered List Computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      // Event filter
      if (selectedEventSlug !== "all" && item.event_slug !== selectedEventSlug) {
        return false;
      }
      // Media type filter
      if (selectedMediaType !== "all" && item.type !== selectedMediaType) {
        return false;
      }
      return true;
    });
  }, [items, selectedCategory, selectedEventSlug, selectedMediaType]);

  // Paginated subset
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  const hasMore = displayCount < filteredItems.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + 8);
      setLoadingMore(false);
    }, 400);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const getDirectMediaUrl = (item: any) => {
    if (item.external_url) return item.external_url;

    const rawUrl = item.video_url || item.url || item.thumbnail_url || "";

    if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
      let videoId = "";
      if (rawUrl.includes("/embed/")) {
        videoId = rawUrl.split("/embed/")[1]?.split("?")[0] || "";
      } else if (rawUrl.includes("v=")) {
        videoId = rawUrl.split("v=")[1]?.split("&")[0] || "";
      } else if (rawUrl.includes("youtu.be/")) {
        videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0] || "";
      }
      if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
      return rawUrl;
    }

    if (rawUrl.includes("instagram.com")) {
      if (rawUrl.includes("/embed")) {
        const cleanPath = rawUrl.replace("/embed", "").split("?")[0];
        return cleanPath.startsWith("http") ? cleanPath : `https://${cleanPath}`;
      }
      return rawUrl;
    }

    return rawUrl;
  };

  const handleMediaClick = (item: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const targetUrl = getDirectMediaUrl(item);
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="relative min-h-screen bg-background pb-24 text-foreground selection:bg-cyan-500/30 font-sans">
      <GlowBackdrop />

      {/* Hero Section */}
      <PageHero
        crumb="Media Gallery"
        title="Summit Media Gallery"
        subtitle="High-definition photography and video coverage capturing CXO keynotes, VIP networking galas, and industry awards across Indian enterprise."
        image={images.heroSummit}
      />

      <div className="container-x relative mt-12 space-y-10">
        
        {/* ==================================================== */}
        {/* FILTER BAR: Categories • Event Dropdown • Type Toggle */}
        {/* ==================================================== */}
        <section className="glass-card rounded-3xl p-6 shadow-xl space-y-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setDisplayCount(8);
                    }}
                    className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "gradient-brand text-white shadow-md shadow-cyan-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Media Type & Event Selector */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Media Type Toggle */}
              <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700">
                <button
                  onClick={() => {
                    setSelectedMediaType("all");
                    setDisplayCount(8);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedMediaType === "all"
                      ? "bg-white dark:bg-slate-900 text-cyan-600 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  All Media
                </button>
                <button
                  onClick={() => {
                    setSelectedMediaType("photo");
                    setDisplayCount(8);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedMediaType === "photo"
                      ? "bg-white dark:bg-slate-900 text-cyan-600 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Photos</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedMediaType("video");
                    setDisplayCount(8);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedMediaType === "video"
                      ? "bg-white dark:bg-slate-900 text-cyan-600 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <VideoIcon className="h-3.5 w-3.5" />
                  <span>Videos</span>
                </button>
              </div>

              {/* Event Filter Selector */}
              <div className="relative">
                <select
                  value={selectedEventSlug}
                  onChange={(e) => {
                    setSelectedEventSlug(e.target.value);
                    setDisplayCount(8);
                  }}
                  className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-background px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Summit Events</option>
                  <option value="cfo-leadership-summit">India CFO Leadership Summit</option>
                  <option value="hr-excellence-awards">HR Excellence & Leadership Conclave</option>
                  <option value="enterprise-tech-conclave">National Enterprise Tech & AI Summit</option>
                  {events.map((evt) => (
                    <option key={evt.slug} value={evt.slug}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800 font-medium">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{visibleItems.length}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white font-bold">{filteredItems.length}</strong> media assets
            </span>
            <span>Click any item for full Lightbox view</span>
          </div>
        </section>

        {/* ==================================================== */}
        {/* MASONRY GRID LAYOUT                                  */}
        {/* ==================================================== */}
        <section>
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Loading summit media gallery...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center space-y-3 border border-slate-200/80 dark:border-slate-800">
              <Filter className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                No Media Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No photos or videos match the selected filters. Try changing your category or event filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedEventSlug("all");
                  setSelectedMediaType("all");
                }}
                className="mt-4 rounded-full gradient-brand px-6 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
              {visibleItems.map((item, index) => (
                <div
                  key={item.id || index}
                  onClick={(e) => handleMediaClick(item, e)}
                  className="group relative break-inside-avoid overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-none rounded-bl-none border border-slate-200/80 dark:border-slate-800 bg-slate-900 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                >
                  {/* Image / Thumbnail */}
                  <img
                    src={item.thumbnail_url || item.url}
                    alt={item.title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Video Play Badge */}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600/90 text-white shadow-xl backdrop-blur-md group-hover:scale-115 transition-transform">
                        <Play className="h-6 w-6 fill-white ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full bg-slate-950/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase text-cyan-300 border border-cyan-500/30">
                      {item.category}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  {/* Bottom Content Caption */}
                  <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1">
                    <p className="text-xs font-extrabold line-clamp-2 leading-snug font-display">
                      {item.title}
                    </p>
                    {item.event_title && (
                      <p className="text-[10px] text-cyan-300/90 font-medium truncate">
                        📍 {item.event_title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==================================================== */}
        {/* INFINITE SCROLL / LOAD MORE BUTTON                   */}
        {/* ==================================================== */}
        {hasMore && (
          <div className="pt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="gradient-brand inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xl shadow-cyan-500/25 hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading Media...</span>
                </>
              ) : (
                <>
                  <Layers className="h-4 w-4" />
                  <span>Load More Media ({filteredItems.length - displayCount} remaining)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* LIGHTBOX MODAL                                       */}
      {/* ==================================================== */}
      <AnimatePresence>
        {currentLightboxItem && lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950/95 backdrop-blur-xl">
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
              title="Close Lightbox (Esc)"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left Prev Arrow Button */}
            <button
              onClick={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
              title="Previous Media (Left Arrow)"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>

            {/* Right Next Arrow Button */}
            <button
              onClick={() => setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0))}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
              title="Next Media (Right Arrow)"
            >
              <ChevronRight className="h-7 w-7" />
            </button>

            {/* Lightbox Content Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col justify-between overflow-hidden rounded-none border border-white/15 bg-slate-900/90 shadow-2xl"
            >
              {/* Media Display Area */}
              <div className="relative flex-1 flex items-center justify-center bg-black min-h-[350px] max-h-[65vh]">
                {currentLightboxItem.type === "video" ? (
                  <iframe
                    src={currentLightboxItem.url}
                    title={currentLightboxItem.title}
                    className="w-full h-full min-h-[400px] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={currentLightboxItem.url}
                    alt={currentLightboxItem.title}
                    className="max-h-[65vh] w-auto max-w-full object-contain"
                  />
                )}
              </div>

              {/* Lightbox Footer Bar */}
              <div className="p-6 bg-slate-900 border-t border-white/10 text-white flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cyan-500/20 px-3 py-0.5 text-[11px] font-black uppercase text-cyan-300 border border-cyan-500/40">
                      {currentLightboxItem.category}
                    </span>
                    {currentLightboxItem.event_title && (
                      <span className="text-xs text-slate-400 font-medium">
                        📍 {currentLightboxItem.event_title}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold font-display truncate">
                    {currentLightboxItem.title}
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={currentLightboxItem.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    <Download className="h-4 w-4 text-cyan-400" />
                    <span>Download Media</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Gallery page link copied to clipboard!");
                    }}
                    className="p-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                    title="Share Gallery"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
