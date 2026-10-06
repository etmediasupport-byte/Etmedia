import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Calendar,
  ExternalLink,
  Play,
  Search,
  Sparkles,
  Clock,
  TrendingUp,
  Share2,
  Filter,
  Eye,
  ArrowRight,
  Globe,
  Radio,
  X,
  PlayCircle,
  Video as VideoIcon,
  FileText,
  CheckCircle2,
  Maximize2,
} from "lucide-react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

export interface NewsItem {
  id: number | string;
  title: string;
  type: "article" | "video" | "link";
  url: string;
  source_name: string;
  summary?: string;
  content?: string;
  thumbnail_url?: string;
  video_url?: string;
  published_date: string;
  category: string;
  status: "published" | "draft";
  is_featured: number | boolean;
  views_count?: number;
  created_at?: string;
}

const CATEGORIES = [
  "All",
  "Finance & Economy",
  "Leadership",
  "Technology & AI",
  "Startups & Tech",
  "HR & Work",
  "Business",
];

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "article" | "video" | "link">("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeVideoModal, setActiveVideoModal] = useState<NewsItem | null>(null);

  // Fetch News from Backend
  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success && Array.isArray(data.news)) {
        setNewsList(data.news);
      }
    } catch (err) {
      console.error("Error loading news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Listen for Realtime News updates via Socket.IO
    const onNewsUpdated = (payload: any) => {
      fetchNews();
      if (payload?.type === "add" && payload?.news?.title) {
        toast.info(`📰 Breaking News: "${payload.news.title.slice(0, 40)}..."`, {
          duration: 4000,
        });
      }
    };

    socket.on("news_updated", onNewsUpdated);
    return () => {
      socket.off("news_updated", onNewsUpdated);
    };
  }, []);

  // Filtered News Items
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      if (item.status && item.status !== "published") return false;

      // Type Filter
      if (selectedType !== "all" && item.type !== selectedType) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const summaryMatch = item.summary?.toLowerCase().includes(q);
        const sourceMatch = item.source_name?.toLowerCase().includes(q);
        const catMatch = item.category?.toLowerCase().includes(q);
        return titleMatch || summaryMatch || sourceMatch || catMatch;
      }

      return true;
    });
  }, [newsList, selectedType, selectedCategory, searchQuery]);

  // Featured Item (Hero Highlight)
  const featuredNews = useMemo(() => {
    return filteredNews.find((n) => n.is_featured == 1 || n.is_featured === true) || filteredNews[0];
  }, [filteredNews]);

  // Remaining Grid Items
  const gridNews = useMemo(() => {
    if (!featuredNews) return filteredNews;
    return filteredNews.filter((n) => n.id !== featuredNews.id);
  }, [filteredNews, featuredNews]);

  // Format Date cleanly
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Recent";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Extract YouTube Embed URL
  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    return url;
  };

  return (
    <>
      <Helmet>
        <title>News & Media Coverage | Executive Talks Media</title>
        <meta
          name="description"
          content="Latest executive business news, leadership articles, and video coverage from India's premier C-suite summits and conferences."
        />
      </Helmet>

      {/* Main Page: Clean White Background */}
      <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-cyan-500/20 selection:text-cyan-950 relative overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white -z-10 pointer-events-none" />
        <div className="absolute top-10 -left-20 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-24 right-0 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="container-x relative max-w-7xl mx-auto space-y-9">
          {/* Header Banner - LEFT ALIGNED AS REQUESTED */}
          <div className="text-left max-w-4xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-extrabold uppercase tracking-widest shadow-2xs">
              <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse shrink-0" />
              <span>Real-Time Business News & Media</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-slate-950 leading-[1.15]">
              Executive Talks <span className="gradient-text font-black">Media Hub</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              Curated press coverage, executive leadership interviews, corporate announcements, and high-impact keynote videos.
            </p>
          </div>

          {/* Search & Filter Bar - Clean Light Styling */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, publications, or videos..."
                  className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/10 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs shrink-0">
                {[
                  { id: "all", label: "All Formats", icon: Globe },
                  { id: "article", label: "Articles", icon: FileText },
                  { id: "video", label: "Videos", icon: VideoIcon },
                  { id: "link", label: "Press Links", icon: ExternalLink },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedType(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedType === tab.id
                        ? "gradient-brand text-white shadow-md shadow-cyan-500/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" /> Topic:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-cyan-600 text-white border-cyan-600 shadow-xs font-bold"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-2xs"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 animate-pulse">
                  <div className="h-44 bg-slate-200 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-6 bg-slate-200 rounded" />
                  <div className="h-12 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            /* Clean Empty State - Awaiting Admin Publications */
            <div className="text-center py-20 bg-slate-50/80 border border-slate-200/90 rounded-3xl p-8 max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center shadow-2xs">
                <Newspaper className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No News Published Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                {searchQuery
                  ? `No news matching "${searchQuery}". Try a different keyword or reset filters.`
                  : "Live media coverage, executive articles, and keynote videos added by the admin will appear here."}
              </p>
              {(searchQuery || selectedType !== "all" || selectedCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedCategory("All");
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-xs font-bold text-cyan-700 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* 1. TOP FEATURED / BREAKING NEWS SPOTLIGHT */}
              {featuredNews && (
                <div className="group relative bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:border-cyan-400/80 transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
                    {/* Media Thumbnail */}
                    <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                      <img
                        src={featuredNews.thumbnail_url || "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80"}
                        alt={featuredNews.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e: any) => {
                          e.target.src = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Video Play Trigger if Video */}
                      {featuredNews.type === "video" && (
                        <button
                          type="button"
                          onClick={() => setActiveVideoModal(featuredNews)}
                          className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded-full gradient-brand text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 group-hover/play:scale-110 transition-transform">
                            <Play className="w-7 h-7 fill-white ml-1" />
                          </div>
                        </button>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          FEATURED
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200 backdrop-blur-sm">
                          {featuredNews.category}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="text-cyan-700 font-extrabold flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-cyan-600" />
                          {featuredNews.source_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(featuredNews.published_date)}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors">
                        {featuredNews.title}
                      </h2>

                      {featuredNews.summary && (
                        <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                          {featuredNews.summary}
                        </p>
                      )}

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        {featuredNews.type === "video" ? (
                          <button
                            type="button"
                            onClick={() => setActiveVideoModal(featuredNews)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 hover:scale-[1.02] cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Watch Keynote Video</span>
                          </button>
                        ) : (
                          <a
                            href={featuredNews.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 hover:scale-[1.02]"
                          >
                            <span>Read Full Article</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <span className="text-[11px] font-semibold text-slate-400">
                          Official Media Release
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MAIN NEWS GRID */}
              {gridNews.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-cyan-600" />
                      <span>Latest Releases & Coverage</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      Showing {gridNews.length} stor{gridNews.length !== 1 ? "ies" : "y"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gridNews.map((item) => (
                      <article
                        key={item.id}
                        className="group bg-white hover:bg-white border border-slate-200/90 hover:border-cyan-400 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1"
                      >
                        <div>
                          {/* Image Thumbnail */}
                          <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            <img
                              src={item.thumbnail_url || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80"}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e: any) => {
                                e.target.src = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                            {/* Format Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs flex items-center gap-1 ${
                                item.type === "video"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : item.type === "article"
                                  ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}>
                                {item.type === "video" ? (
                                  <>
                                    <VideoIcon className="w-2.5 h-2.5 text-rose-600" /> VIDEO
                                  </>
                                ) : item.type === "article" ? (
                                  <>
                                    <FileText className="w-2.5 h-2.5 text-cyan-600" /> ARTICLE
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="w-2.5 h-2.5 text-blue-600" /> PRESS
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Category Badge */}
                            <div className="absolute top-3 right-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-700 border border-slate-200 shadow-2xs backdrop-blur-xs">
                                {item.category}
                              </span>
                            </div>

                            {/* Video Play Overlay */}
                            {item.type === "video" && (
                              <button
                                type="button"
                                onClick={() => setActiveVideoModal(item)}
                                className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
                              >
                                <div className="w-12 h-12 rounded-full gradient-brand text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover/play:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-white ml-0.5" />
                                </div>
                              </button>
                            )}
                          </div>

                          {/* Card Body */}
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="text-cyan-700 font-bold truncate max-w-[140px]">
                                {item.source_name}
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formatDate(item.published_date)}
                              </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug line-clamp-2 group-hover:text-cyan-700 transition-colors">
                              {item.title}
                            </h4>

                            {item.summary && (
                              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                {item.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="p-5 pt-0">
                          {item.type === "video" ? (
                            <button
                              type="button"
                              onClick={() => setActiveVideoModal(item)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-cyan-50 text-cyan-700 hover:text-cyan-800 font-bold text-xs transition-colors cursor-pointer border border-slate-200 hover:border-cyan-300 shadow-2xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-cyan-700" />
                              <span>Watch Video</span>
                            </button>
                          ) : (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-cyan-700 font-bold text-xs transition-colors border border-slate-200 hover:border-cyan-300 shadow-2xs"
                            >
                              <span>Read on {item.source_name}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                      Video Stream
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeVideoModal.source_name}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                    {activeVideoModal.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Embed Frame */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-inner">
                {activeVideoModal.url.includes("youtube.com") || activeVideoModal.url.includes("youtu.be") ? (
                  <iframe
                    src={getEmbedVideoUrl(activeVideoModal.video_url || activeVideoModal.url)}
                    title={activeVideoModal.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={activeVideoModal.video_url || activeVideoModal.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Published: {formatDate(activeVideoModal.published_date)}
                </span>

                <a
                  href={activeVideoModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:underline"
                >
                  <span>Open Video in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
