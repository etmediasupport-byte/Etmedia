import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, ArrowRight, ExternalLink, Sparkles, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { io } from "socket.io-client";

interface PopupSettings {
  id?: number;
  popup_title: string;
  popup_subtitle: string;
  theme_color: string;
  button_color: string;
  background_color: string;
  border_color: string;
  overlay_opacity: number;
  border_radius: number;
  animation_type: string;
  position: string;
  show_on_load: number | boolean;
  show_after_delay: number | boolean;
  delay_seconds: number;
  show_on_scroll: number | boolean;
  scroll_percentage: number;
  once_per_session: number | boolean;
  cookie_duration_days: number;
  status: string;
  popup_logo?: string;
  popup_banner?: string;
  show_close_button: number | boolean;
  enable_maybe_later: number | boolean;
  popup_width?: string;
  blur_background: number | boolean;
  trigger_mode?: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  city?: string;
  venue?: string;
  image?: string;
  category?: string;
  registration_url?: string;
  registration_type?: string;
  registration_fee?: string;
  priority?: number;
}

interface Props {
  previewMode?: boolean;
  onClosePreview?: () => void;
  customSettings?: Partial<PopupSettings>;
  customEvents?: EventItem[];
}

export const EventAdvertisementPopup: React.FC<Props> = ({
  previewMode = false,
  onClosePreview,
  customSettings,
  customEvents,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  // 1. Fetch active settings & events
  useEffect(() => {
    if (previewMode && customSettings) {
      setSettings({
        popup_title: "Nominations are Open",
        popup_subtitle: "Choose the event you'd like to nominate yourself for.",
        theme_color: "#D4AF37",
        button_color: "#D4AF37",
        background_color: "#0B0F19",
        border_color: "rgba(212,175,55,0.3)",
        overlay_opacity: 80,
        border_radius: 28,
        animation_type: "scale_fade",
        position: "center",
        show_on_load: 1,
        show_after_delay: 1,
        delay_seconds: 5,
        show_on_scroll: 1,
        scroll_percentage: 40,
        once_per_session: 1,
        cookie_duration_days: 1,
        status: "active",
        show_close_button: 1,
        enable_maybe_later: 1,
        popup_width: "max-w-2xl",
        blur_background: 1,
        ...customSettings,
      });
      if (customEvents && customEvents.length > 0) {
        setEvents(customEvents);
      }
      setIsOpen(true);
      return;
    }

    const fetchActiveData = async () => {
      try {
        const res = await fetch("/api/popup/active");
        const json = await res.json();
        if (json.success) {
          if (json.settings) {
            setSettings(json.settings);
          }
          if (json.events && json.events.length > 0) {
            setEvents(json.events);
          } else {
            // Fallback default sample events if DB empty
            setEvents([
              {
                id: "EVT-101",
                title: "Heroes of Hyderabad",
                description: "Celebrating the city's everyday changemakers and visionary leaders.",
                date: "October 24, 2026",
                city: "Hyderabad",
                venue: "HICC Novotel, Hitec City",
                category: "Awards & Recognition",
                image: "/assets/event-cfo-BjslOJNi.jpg",
                registration_fee: "Free Registration",
              },
              {
                id: "EVT-102",
                title: "Impact Series Conclave 2026",
                description: "Spotlighting C-Suite leaders creating measurable enterprise impact.",
                date: "November 18, 2026",
                city: "Bengaluru",
                venue: "JW Marriott Hotel",
                category: "Leadership Summit",
                image: "/assets/event-hr-Cswpuq5H.jpg",
                registration_fee: "Delegate Pass Available",
              },
              {
                id: "EVT-103",
                title: "HR Recall 2026 Leadership Conclave",
                description: "India's Premier HR Leadership Conference and Talent Excellence Awards.",
                date: "December 05, 2026",
                city: "Mumbai",
                venue: "The St. Regis",
                category: "Conference",
                image: "/assets/hero-summit-ClCGVqfO.jpg",
                registration_fee: "Early Bird Access",
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load active popup modal data:", err);
      }
    };

    fetchActiveData();

    // Listen for Socket.IO live updates
    const socket = io();
    socket.on("popup_settings_updated", (newSettings) => {
      setSettings(newSettings);
    });
    socket.on("popup_events_updated", (newEvents) => {
      if (newEvents && newEvents.length > 0) {
        setEvents(newEvents);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [previewMode, customSettings, customEvents]);

  // 2. Trigger Logic
  useEffect(() => {
    if (previewMode || !settings || settings.status === "inactive" || hasTriggered) return;

    // Session dismissal check
    if (settings.once_per_session) {
      const dismissedAt = sessionStorage.getItem("et_popup_dismissed_time");
      if (dismissedAt) return;
    }

    const triggerPopup = () => {
      if (!hasTriggered) {
        setHasTriggered(true);
        setIsOpen(true);
        // Track View Analytics
        fetch("/api/popup/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: events.length > 0 ? events[0].id : "ALL",
            session_id: sessionStorage.getItem("et_session_id") || "SESSION_" + Date.now(),
          }),
        }).catch(() => {});
      }
    };

    // Trigger 1: Immediate / Load
    if (settings.show_on_load && (!settings.delay_seconds || settings.delay_seconds === 0)) {
      triggerPopup();
    }

    // Trigger 2: Delay
    let delayTimer: any = null;
    if (settings.show_after_delay && settings.delay_seconds > 0) {
      delayTimer = setTimeout(() => {
        triggerPopup();
      }, settings.delay_seconds * 1000);
    }

    // Trigger 3: Scroll Percentage
    const handleScroll = () => {
      if (settings.show_on_scroll && settings.scroll_percentage) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight > 0) {
          const scrollPct = (scrollTop / scrollHeight) * 100;
          if (scrollPct >= settings.scroll_percentage) {
            triggerPopup();
          }
        }
      }
    };

    if (settings.show_on_scroll) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [settings, hasTriggered, previewMode, events]);

  // Lock Body Scroll when Open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClosePopup();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClosePopup = () => {
    setIsOpen(false);
    if (previewMode && onClosePreview) {
      onClosePreview();
      return;
    }
    // Store dismissal in sessionStorage
    sessionStorage.setItem("et_popup_dismissed_time", Date.now().toString());

    // Track Close Analytics
    fetch("/api/popup/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: events[activeCardIndex]?.id || "ALL",
        session_id: sessionStorage.getItem("et_session_id") || "SESSION_" + Date.now(),
      }),
    }).catch(() => {});
  };

  const handleRegisterClick = (event: EventItem) => {
    // Track Click Analytics
    fetch("/api/popup/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: event.id,
        session_id: sessionStorage.getItem("et_session_id") || "SESSION_" + Date.now(),
      }),
    }).catch(() => {});

    handleClosePopup();

    if (event.registration_url && event.registration_url.startsWith("http")) {
      window.open(event.registration_url, "_blank");
    } else {
      // Open detailed event page in new tab or navigate to event detail
      window.open(`/events/${event.id}`, "_blank");
    }
  };

  if (!isOpen || !settings || events.length === 0) return null;

  const currentEvent = events[activeCardIndex] || events[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Background Overlay with Glassmorphism Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClosePopup}
            className={`fixed inset-0 ${
              settings.blur_background ? "backdrop-blur-md" : ""
            }`}
            style={{
              backgroundColor: `rgba(5, 8, 16, ${(settings.overlay_opacity || 80) / 100})`,
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${
              settings.popup_width || "max-w-2xl"
            } z-10 overflow-hidden shadow-2xl transition-all border`}
            style={{
              borderRadius: `${settings.border_radius || 28}px`,
              backgroundColor: settings.background_color || "#0B0F19",
              borderColor: settings.border_color || "rgba(212, 175, 55, 0.3)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.15)",
            }}
          >
            {/* Top Glowing Ambient Accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* TOP SECTION */}
            <div className="relative p-6 sm:p-8 pb-4 flex items-start justify-between border-b border-amber-500/15">
              <div className="pr-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  {settings.popup_title || "Nominations are Open"}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Triumphs of Talent & Leadership
                </h2>
                <p className="text-sm text-slate-300 mt-1 font-medium leading-relaxed">
                  {settings.popup_subtitle || "Choose the event you'd like to nominate yourself for."}
                </p>
              </div>

              {/* Close Icon Button */}
              {settings.show_close_button !== 0 && (
                <button
                  onClick={handleClosePopup}
                  className="p-2.5 rounded-full bg-slate-800/80 hover:bg-amber-500 text-slate-400 hover:text-slate-950 transition-all duration-300 hover:rotate-90 border border-slate-700 hover:border-amber-400 shrink-0 shadow-lg"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* MIDDLE SECTION - Dynamic Event Cards Carousel / Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Event Card */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 transition-all group shadow-xl">
                {/* Event Banner Image */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={currentEvent.image || "/assets/hero-summit-ClCGVqfO.jpg"}
                    alt={currentEvent.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-slate-950 shadow-md backdrop-blur-md inline-flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      {currentEvent.category || "Active Event"}
                    </span>
                  </div>

                  {/* Price Tag if provided */}
                  {currentEvent.registration_fee && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-lg">
                        {currentEvent.registration_fee}
                      </span>
                    </div>
                  )}

                  {/* Multiple Events Carousel Navigation Controls */}
                  {events.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
                      <button
                        onClick={() => setActiveCardIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1))}
                        className="p-1.5 rounded-full bg-slate-950/80 hover:bg-amber-500 text-slate-200 hover:text-slate-950 transition-all border border-slate-700"
                        title="Previous Event"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-slate-300 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800">
                        {activeCardIndex + 1} / {events.length}
                      </span>
                      <button
                        onClick={() => setActiveCardIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1))}
                        className="p-1.5 rounded-full bg-slate-950/80 hover:bg-amber-500 text-slate-200 hover:text-slate-950 transition-all border border-slate-700"
                        title="Next Event"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Body Info */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {currentEvent.title}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                      {currentEvent.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 pt-2 border-t border-slate-800/80">
                    {currentEvent.date && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span>{currentEvent.date}</span>
                      </div>
                    )}
                    {(currentEvent.city || currentEvent.venue) && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{currentEvent.venue ? `${currentEvent.venue}, ${currentEvent.city || ''}` : currentEvent.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button Section */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleRegisterClick(currentEvent)}
                      className="w-full relative group/btn overflow-hidden rounded-xl font-extrabold text-sm py-3.5 px-6 flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, #F59E0B 0%, #D4AF37 50%, #B45309 100%)",
                        color: "#0B0F19",
                        boxShadow: "0 4px 20px rgba(245, 158, 11, 0.4)",
                      }}
                    >
                      {/* Button Hover Glow Layer */}
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                      <span className="relative z-10 tracking-wide">Register Now</span>
                      <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                      <ExternalLink className="w-3.5 h-3.5 relative z-10 opacity-70" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION */}
            {settings.enable_maybe_later !== 0 && (
              <div className="p-4 sm:p-5 pt-0 flex items-center justify-center border-t border-slate-800/50 bg-slate-950/40">
                <button
                  onClick={handleClosePopup}
                  className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors py-2 px-4 rounded-lg hover:bg-slate-800/50"
                >
                  Maybe Later
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
