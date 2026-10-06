import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, ArrowRight, ExternalLink, Sparkles, ChevronLeft, ChevronRight, Award, Zap, Clock } from "lucide-react";
import { io } from "socket.io-client";
import { images } from "@/lib/site-data";

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
  slug?: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  city?: string;
  venue?: string;
  image?: string;
  event_image?: string;
  category?: string;
  registration_url?: string;
  registration_type?: string;
  registration_fee?: string;
  priority?: number;
}

function getValidImageUrl(url?: string): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return images.heroSummit || images.eventCfo;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  
  // Resolve static/seeded image asset URLs dynamically
  if (trimmed.includes("event-cfo")) return images.eventCfo;
  if (trimmed.includes("event-hr")) return images.eventHr;
  if (trimmed.includes("hero-summit")) return images.heroSummit;
  if (trimmed.includes("hero-leadership")) return images.heroLeadership;
  if (trimmed.includes("hero-awards")) return images.heroAwards;
  if (trimmed.includes("hero-networking")) return images.heroNetworking;
  if (trimmed.includes("about-office")) return images.aboutOffice;
  if (trimmed.includes("magazine-cover")) return images.magazineCover;

  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }
  return trimmed;
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
  const navigate = useNavigate();
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
                image: images.eventCfo,
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
                image: images.eventHr,
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
                image: images.heroSummit,
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

  // 2. Trigger Logic: Open on website load, auto-dismiss in 10s, re-open every 2.5 minutes (150s)
  useEffect(() => {
    if (previewMode) return;

    // Show popup immediately when site is opened
    setIsOpen(true);
    fetch("/api/popup/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: events[0]?.id ?? "ALL",
        session_id: sessionStorage.getItem("et_session_id") || "SESSION_" + Date.now(),
      }),
    }).catch(() => {});

    // Re-open popup every 2.5 minutes (150,000 ms)
    const interval = setInterval(() => {
      setIsOpen(true);
      fetch("/api/popup/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: events[0]?.id ?? "ALL",
          session_id: sessionStorage.getItem("et_session_id") || "SESSION_" + Date.now(),
        }),
      }).catch(() => {});
    }, 150000);

    return () => clearInterval(interval);
  }, [previewMode, events]);

  // 3. Auto-Dismiss Timer (10 Seconds Time Limit)
  useEffect(() => {
    if (!isOpen || previewMode) return;

    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [isOpen, previewMode]);

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

  const handleRegisterClick = (event: EventItem, mode: "paid" | "free" = "paid") => {
    // Track Click Analytics
    fetch("/api/popup/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: event.id,
        mode: mode,
        session_id: sessionStorage.getItem("et_session_id") || "SESSION_" + Date.now(),
      }),
    }).catch(() => {});

    // Close popup and reset body overflow
    setIsOpen(false);
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    if (previewMode && onClosePreview) {
      onClosePreview();
    }

    const targetSlug = event.slug || event.id || "hr-recall-2k26";
    if (mode === "free") {
      navigate(`/events/${encodeURIComponent(targetSlug)}/register-free`);
    } else {
      if (event.registration_url && event.registration_url.startsWith("http")) {
        window.open(event.registration_url, "_blank");
      } else {
        navigate(`/events/${encodeURIComponent(targetSlug)}/register`);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow === "hidden" ? "" : origOverflow;
      document.documentElement.style.overflow = origHtmlOverflow === "hidden" ? "" : origHtmlOverflow;
    };
  }, [isOpen]);

  const firstEvent = events[0];
  if (!isOpen || !settings || !firstEvent) return null;

  const currentEvent = events[activeCardIndex] ?? firstEvent;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden overscroll-none">
          {/* Background Overlay */}
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

          {/* Compact Centered Modal Container */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-sm sm:max-w-[430px] z-10 overflow-hidden shadow-2xl transition-all border`}
            style={{
              borderRadius: `${settings.border_radius || 24}px`,
              backgroundColor: settings.background_color || "#0B0F19",
              borderColor: settings.border_color || "rgba(0, 174, 239, 0.3)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 174, 239, 0.2)",
            }}
          >
            {/* 10-Second Countdown Progress Bar */}
            {!previewMode && (
              <div className="w-full bg-slate-900/90 h-1 overflow-hidden relative z-30">
                <motion.div
                  key={Date.now()}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-sm"
                />
              </div>
            )}

            {/* Top Banner Image with Overlay */}
            <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-950">
              <img
                src={getValidImageUrl(
                  currentEvent.image ||
                  currentEvent.event_image ||
                  (currentEvent as any).photo ||
                  (currentEvent as any).about_image ||
                  (currentEvent as any).banner ||
                  settings.popup_banner
                )}
                alt={currentEvent.title || "Event Advertisement"}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = images.heroSummit || images.eventCfo;
                }}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

              {/* Title Badge / Category */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider gradient-brand text-white shadow-md inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-white animate-pulse" />
                  {settings.popup_title || currentEvent.category || "Nominations Open"}
                </span>
              </div>

              {/* Close Button Floating on Banner */}
              {settings.show_close_button !== 0 && (
                <button
                  onClick={handleClosePopup}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 hover:bg-cyan-500 text-slate-300 hover:text-white transition-all duration-300 border border-slate-700/80 shrink-0 shadow-lg backdrop-blur-md z-20 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Carousel Controls on Banner */}
              {events.length > 1 && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20">
                  <button
                    onClick={() => setActiveCardIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1))}
                    className="p-1 rounded-full bg-slate-950/80 hover:bg-cyan-500 text-slate-200 hover:text-white transition-all border border-slate-700 cursor-pointer"
                    title="Previous Event"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-extrabold text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded-md border border-cyan-500/30">
                    {activeCardIndex + 1} / {events.length}
                  </span>
                  <button
                    onClick={() => setActiveCardIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1))}
                    className="p-1 rounded-full bg-slate-950/80 hover:bg-cyan-500 text-slate-200 hover:text-white transition-all border border-slate-700 cursor-pointer"
                    title="Next Event"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Compact Body Content */}
            <div className="p-5 pt-3 space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
                  {currentEvent.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {currentEvent.description}
                </p>
              </div>

              {/* Event Metadata (Date & Venue) */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3">
                  {currentEvent.date && (
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{currentEvent.date}</span>
                    </div>
                  )}
                  {(currentEvent.city || currentEvent.venue) && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="line-clamp-1">{currentEvent.venue ? `${currentEvent.venue}, ${currentEvent.city || ''}` : currentEvent.city}</span>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                  (currentEvent as any).allow_paid_registration === 0 && (currentEvent as any).allow_free_registration === 0
                    ? "text-amber-400 bg-amber-950/70 border-amber-500/30 flex items-center gap-1"
                    : "text-emerald-400 bg-emerald-950/70 border-emerald-500/30"
                }`}>
                  {(currentEvent as any).allow_paid_registration !== 0 && (currentEvent as any).allow_paid_registration !== false && (currentEvent as any).allow_free_registration !== 0 && (currentEvent as any).allow_free_registration !== false
                    ? "Free & Paid Passes"
                    : (currentEvent as any).allow_paid_registration !== 0 && (currentEvent as any).allow_paid_registration !== false
                    ? "Paid Passes"
                    : (currentEvent as any).allow_free_registration !== 0 && (currentEvent as any).allow_free_registration !== false
                    ? "Free Passes"
                    : (
                      <>
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        <span>Passes Releasing Soon</span>
                      </>
                    )}
                </span>
              </div>

              {/* Call to Action Buttons: Paid & Free */}
              <div className={`grid ${(currentEvent as any).allow_paid_registration !== 0 && (currentEvent as any).allow_paid_registration !== false && (currentEvent as any).allow_free_registration !== 0 && (currentEvent as any).allow_free_registration !== false ? "grid-cols-2" : "grid-cols-1"} gap-2.5 pt-1`}>
                {/* 1. Register Now (Paid Pass) */}
                {(currentEvent as any).allow_paid_registration !== 0 && (currentEvent as any).allow_paid_registration !== false && (
                  <button
                    type="button"
                    onClick={() => handleRegisterClick(currentEvent, "paid")}
                    className="w-full relative group/btn overflow-hidden rounded-xl font-extrabold text-xs py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
                    title="Register for Paid Pass"
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0 text-amber-300 fill-amber-300/30" />
                    <span className="relative z-10 tracking-wide uppercase text-[11px] sm:text-xs truncate">Register Now</span>
                  </button>
                )}

                {/* 2. Register Free */}
                {(currentEvent as any).allow_free_registration !== 0 && (currentEvent as any).allow_free_registration !== false && (
                  <button
                    type="button"
                    onClick={() => handleRegisterClick(currentEvent, "free")}
                    className="w-full relative group/btn overflow-hidden rounded-xl font-extrabold text-xs py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
                    title="Apply for Free Pass"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-white animate-pulse" />
                    <span className="relative z-10 tracking-wide uppercase text-[11px] sm:text-xs truncate">Register Free</span>
                  </button>
                )}

                {/* If both hidden */}
                {((currentEvent as any).allow_paid_registration === 0 || (currentEvent as any).allow_paid_registration === false) &&
                  ((currentEvent as any).allow_free_registration === 0 || (currentEvent as any).allow_free_registration === false) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClosePopup();
                        navigate(`/events/${encodeURIComponent(currentEvent.slug || currentEvent.id)}`);
                      }}
                      className="w-full relative group/btn overflow-hidden rounded-xl font-extrabold text-xs py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-950/40 to-slate-900 hover:bg-slate-800 text-amber-300 transition-all duration-200 cursor-pointer border border-amber-500/30"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Passes Releasing Soon • View Details</span>
                    </button>
                  )}
              </div>

              {/* Maybe Later link */}
              {settings.enable_maybe_later !== 0 && (
                <div className="text-center pt-0.5">
                  <button
                    onClick={handleClosePopup}
                    className="text-[11px] font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    Maybe Later
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
