import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  Crown,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Clock,
  Layers,
  Flame,
} from "lucide-react";
import {
  type EventItem,
  events as defaultEvents,
  getValidImageUrl,
  getDefaultEventImage,
} from "@/lib/site-data";
import { socket } from "@/lib/socket";

interface EventSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function EventSelectionModal({
  isOpen,
  onClose,
  title = "Select an Event to Register",
  subtitle = "Choose from our executive conclaves, summits & conferences to book your verified delegate pass.",
}: EventSelectionModalProps) {
  const navigate = useNavigate();
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Fetch live events from Database API and merge with default summits
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const dbEvents = json.data.filter(
            (ev: any) => ev.status !== "draft" && ev.status !== "archived"
          );

          // Deduplicate and combine DB events with default site-data events
          const seenKeys = new Set<string>();
          const combined: EventItem[] = [];

          // 1. Add DB events first (admin added events)
          dbEvents.forEach((ev: any) => {
            const key = (ev.slug || ev.id || ev.title || "").toLowerCase().trim();
            if (key && !seenKeys.has(key)) {
              seenKeys.add(key);
              combined.push(ev);
            }
          });

          // 2. Add default conclaves/summits
          (defaultEvents as EventItem[]).forEach((ev: EventItem) => {
            const key = (ev.slug || ev.id || ev.title || "").toLowerCase().trim();
            if (key && !seenKeys.has(key)) {
              seenKeys.add(key);
              combined.push(ev);
            }
          });

          setEventsList(combined.length > 0 ? combined : (defaultEvents as EventItem[]));
        } else {
          setEventsList(defaultEvents as EventItem[]);
        }
      } else {
        setEventsList(defaultEvents as EventItem[]);
      }
    } catch (err) {
      console.warn("Failed to fetch live events from database, fallback to defaults:", err);
      setEventsList(defaultEvents as EventItem[]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when opened or mounted
  useEffect(() => {
    if (isOpen) {
      fetchEvents();
      setSearchQuery("");
      setSelectedFilter("all");
    }
  }, [isOpen]);

  // Real-time socket listeners for live updates from admin
  useEffect(() => {
    const handleEventUpdate = () => {
      fetchEvents();
    };

    socket.on("event_created", handleEventUpdate);
    socket.on("event_updated", handleEventUpdate);
    socket.on("event_deleted", handleEventUpdate);
    socket.on("event_status_changed", handleEventUpdate);
    socket.on("event_featured_changed", handleEventUpdate);

    return () => {
      socket.off("event_created", handleEventUpdate);
      socket.off("event_updated", handleEventUpdate);
      socket.off("event_deleted", handleEventUpdate);
      socket.off("event_status_changed", handleEventUpdate);
      socket.off("event_featured_changed", handleEventUpdate);
    };
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const origOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = origOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Extract unique categories for quick filter chips
  const categories = useMemo(() => {
    const set = new Set<string>();
    eventsList.forEach((e) => {
      if (e.category) {
        set.add(e.category.trim());
      }
    });
    return Array.from(set);
  }, [eventsList]);

  // Filtered list based on search and category
  const filteredEvents = useMemo(() => {
    return eventsList.filter((event) => {
      // Category filter
      if (selectedFilter !== "all") {
        if (selectedFilter === "featured") {
          if (!event.is_featured) return false;
        } else if (selectedFilter === "upcoming") {
          if (event.status === "past") return false;
        } else {
          if ((event.category || "").toLowerCase() !== selectedFilter.toLowerCase()) {
            return false;
          }
        }
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = (event.title || "").toLowerCase().includes(query);
      const catMatch = (event.category || "").toLowerCase().includes(query);
      const cityMatch = (event.city || "").toLowerCase().includes(query);
      const venueMatch = (event.venue || "").toLowerCase().includes(query);
      const descMatch = (event.description || "").toLowerCase().includes(query);

      return titleMatch || catMatch || cityMatch || venueMatch || descMatch;
    });
  }, [eventsList, searchQuery, selectedFilter]);

  // Navigate to Registration
  const handleSelectRegister = (event: EventItem) => {
    const slug = event.slug || event.id || "hr-recall-2k26";
    onClose();
    navigate(`/events/${slug}/register`);
  };

  // Navigate to Event Detail
  const handleViewDetail = (event: EventItem) => {
    const slug = event.slug || event.id || "hr-recall-2k26";
    onClose();
    navigate(`/events/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal Window (Executive White Theme) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200/90 shadow-[0_25px_70px_rgba(15,23,42,0.22)] z-10 overflow-hidden text-slate-900"
        >
          {/* Top Brand Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shrink-0" />

          {/* Modal Header */}
          <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                  <span>Executive Summits & Conclaves</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-medium">
                  {subtitle}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 sm:p-2.5 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by summit name, category, or city..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-sm transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Quick Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedFilter === "all"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  All ({eventsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("upcoming")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedFilter === "upcoming"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Upcoming
                </button>
                {categories.slice(0, 3).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedFilter.toLowerCase() === cat.toLowerCase()
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Body: Scrollable Events Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar max-h-[58vh] bg-slate-50/40">
            {loading ? (
              <div className="py-14 flex flex-col items-center justify-center space-y-3">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <p className="text-xs font-medium text-slate-500">Loading active summits & conferences...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Events Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any events matching "{searchQuery}". Try searching with a different keyword or view all upcoming events.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredEvents.map((event, idx) => {
                  const eventImg = getValidImageUrl(event.image, event.title, event.category);
                  const fallbackImg = getDefaultEventImage(event.title, event.category);
                  const isPast = event.status === "past";

                  return (
                    <motion.div
                      key={event.id || event.slug || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="group relative rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all duration-300 p-3.5 sm:p-4.5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-xs"
                    >
                      {/* Left: Thumbnail & Badges */}
                      <div className="flex items-center gap-3.5 shrink-0">
                        <div className="relative w-24 sm:w-28 h-20 sm:h-22 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-sm">
                          <img
                            src={eventImg || fallbackImg}
                            alt={event.title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = fallbackImg;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] font-black uppercase tracking-wider text-cyan-300 truncate px-1 text-center bg-slate-950/80 rounded">
                            {event.category || "EXECUTIVE"}
                          </span>
                        </div>

                        {/* Mobile Title View */}
                        <div className="sm:hidden flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Registrations Open
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                              <Calendar className="h-3 w-3" />
                              {event.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 text-rose-500" />
                              {event.city || "Hyderabad"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Center: Title, Meta Info & Description */}
                      <div className="hidden sm:flex flex-1 min-w-0 flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-md">
                            {event.category || "Leadership Conclave"}
                          </span>
                          {!isPast && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Registrations Open
                            </span>
                          )}
                          {Boolean(event.is_featured) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                              <Crown className="h-2.5 w-2.5 text-amber-600" />
                              Featured
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {event.title}
                        </h4>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-700 font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <span>{event.date}</span>
                          </span>

                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[200px]">{event.venue || event.city || "Hyderabad"}</span>
                          </span>

                          {event.time && (
                            <span className="hidden md:flex items-center gap-1 text-slate-500">
                              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              <span>{event.time}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Actions: Register Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                        {/* Secondary: Details */}
                        <button
                          type="button"
                          onClick={() => handleViewDetail(event)}
                          className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                        >
                          <span>Details</span>
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </button>

                        {/* Primary: Register Now */}
                        <button
                          type="button"
                          onClick={() => handleSelectRegister(event)}
                          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <span>Register</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 sm:px-7 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Showing <strong className="text-slate-900 font-bold">{filteredEvents.length}</strong> available summit{filteredEvents.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/919100266777"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors font-semibold"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp Support</span>
              </a>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/events");
                }}
                className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold cursor-pointer"
              >
                View Full Calendar →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
