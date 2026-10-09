import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  Menu,
  X,
  Calendar,
  Award,
  Users,
  Handshake,
  BookOpen,
  ArrowRight,
  Sparkles,
  Home,
  Building2,
  Briefcase,
  Phone,
  Crown,
  Newspaper,
  MapPin,
  ArrowUpRight,
  Radio,
} from "lucide-react";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/MagneticButton";
import {
  events as defaultEvents,
  EventItem,
  getEventStatus,
  sortEventsChronologically,
  getValidImageUrl,
} from "@/lib/site-data";
import { fetchWithCache, invalidateClientCache } from "@/lib/api-cache";
import { socket } from "@/lib/socket";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventsMegaOpen, setEventsMegaOpen] = useState(false);
  const [eventsMegaTab, setEventsMegaTab] = useState<"upcoming" | "past" | "register" | "partner">("upcoming");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbEvents, setDbEvents] = useState<EventItem[]>(() =>
    sortEventsChronologically(defaultEvents.filter((e) => (e.status as any) !== "archived" && (e.status as any) !== "draft"))
  );
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Initial website load animation timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch real database events with caching and real-time socket reload
  useEffect(() => {
    fetchWithCache("/api/events")
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          const active = data.data.filter((e: any) => e.status !== "archived" && e.status !== "draft");
          setDbEvents(sortEventsChronologically(active));
        }
      })
      .catch((err) => {
        console.warn("Could not fetch navbar events:", err);
      });

    const reload = () => {
      invalidateClientCache("/api/events");
      fetchWithCache("/api/events")
        .then((data) => {
          if (data && data.success && Array.isArray(data.data)) {
            const active = data.data.filter((e: any) => e.status !== "archived" && e.status !== "draft");
            setDbEvents(sortEventsChronologically(active));
          }
        })
        .catch(() => {});
    };

    socket.on("event_created", reload);
    socket.on("event_updated", reload);
    socket.on("event_deleted", reload);
    socket.on("event_status_changed", reload);
    socket.on("event_featured_changed", reload);

    return () => {
      socket.off("event_created", reload);
      socket.off("event_updated", reload);
      socket.off("event_deleted", reload);
      socket.off("event_status_changed", reload);
      socket.off("event_featured_changed", reload);
    };
  }, []);

  // Filter events into upcoming and past
  const upcomingEvents = useMemo(() => {
    return dbEvents.filter((e) => {
      const st = getEventStatus(e);
      return st === "upcoming" || st === "live";
    });
  }, [dbEvents]);

  const pastEvents = useMemo(() => {
    return dbEvents.filter((e) => getEventStatus(e) === "past");
  }, [dbEvents]);

  // Global custom event listener for "navbar-loading"
  useEffect(() => {
    const handleNavbarLoading = (e: Event) => {
      const customEv = e as CustomEvent<{ loading?: boolean; duration?: number }>;
      const active = customEv.detail?.loading ?? true;
      setIsLoading(active);
      if (active) {
        const dur = customEv.detail?.duration || 1500;
        setTimeout(() => setIsLoading(false), dur);
      }
    };

    window.addEventListener("navbar-loading", handleNavbarLoading);
    return () => window.removeEventListener("navbar-loading", handleNavbarLoading);
  }, []);

  // Keyboard shortcut listener for Esc key to close search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter search results dynamically
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return dbEvents.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.city && e.city.toLowerCase().includes(q))
    );
  }, [dbEvents, searchQuery]);

  const handleSearchResultClick = (path: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    if ((window as any).__lenis) {
      (window as any).__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
    navigate(path);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setEventsMegaOpen(false);
    if ((window as any).__lenis) {
      (window as any).__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
  };

  // Ultra-clean, premium active link styling
  const navLinkStyle = (isActive: boolean) =>
    cn(
      "relative px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold font-btn transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
      isActive
        ? "text-cyan-700 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border border-cyan-500/30 shadow-[0_2px_10px_rgba(6,182,212,0.15)] font-extrabold"
        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 border border-transparent"
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
          isLoading && "border-b-cyan-500 shadow-[0_4px_25px_rgba(0,174,239,0.25)] animate-navbar-loading",
          scrolled ? "py-2 sm:py-2.5 shadow-md shadow-slate-200/50 bg-white/98" : "py-2.5 sm:py-3.5"
        )}
      >
        {/* Animated Scanning Beam on Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 shadow-[0_0_15px_#00AEEF] z-50 origin-left animate-pulse"
            />
          )}
        </AnimatePresence>

        <nav className="container-x flex items-center justify-between gap-2 lg:gap-3 xl:gap-4">
          {/* LEFT: Executive Talks Media Logo */}
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center transition-transform hover:scale-[1.02]"
            onClick={handleNavClick}
          >
            <img
              src={executivetalksLogo}
              alt="Executive Talks Media"
              className="h-9 sm:h-10 md:h-11 lg:h-11.5 xl:h-12 w-auto object-contain border-none shadow-none transition-all duration-300"
            />
          </Link>

          {/* CENTER: Navigation Links Single Row (Desktop & Laptop) */}
          <div className="hidden items-center gap-1.5 lg:gap-2 xl:gap-3 lg:flex shrink-0">
            <NavLink to="/" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Home</span>
                </>
              )}
            </NavLink>

            <NavLink to="/about" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>About</span>
                </>
              )}
            </NavLink>

            {/* MEGA DROPDOWN: Events */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => setEventsMegaOpen(true)}
              onMouseLeave={() => setEventsMegaOpen(false)}
            >
              <NavLink
                to="/events"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(navLinkStyle(isActive || location.pathname.startsWith("/events")), "inline-flex items-center gap-1.5")
                }
              >
                {location.pathname.startsWith("/events") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                )}
                <span>Events</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    eventsMegaOpen && "rotate-180 text-cyan-600"
                  )}
                />
              </NavLink>

              <AnimatePresence>
                {eventsMegaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[44rem] max-w-[95vw] mt-2 rounded-3xl border border-slate-200/90 bg-white/98 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] text-slate-900 z-50"
                  >
                    {/* Top Mega Menu Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-600">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-900 font-display">
                          Executive Talks Business Summits
                        </span>
                      </div>
                      <Link
                        to="/events"
                        onClick={handleNavClick}
                        className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-1"
                      >
                        <span>All Summits ({dbEvents.length})</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* 2-Column Split: Navigation Categories (Left) & Real Database Events List (Right) */}
                    <div className="grid grid-cols-12 gap-3.5 items-start">
                      {/* Left: Interactive Categories */}
                      <div className="col-span-5 space-y-2">
                        {/* 1. Upcoming Conferences */}
                        <Link
                          to="/events/upcoming"
                          onMouseEnter={() => setEventsMegaTab("upcoming")}
                          onClick={handleNavClick}
                          className={cn(
                            "group flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer",
                            eventsMegaTab === "upcoming"
                              ? "bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border-cyan-400/50 shadow-xs"
                              : "border-slate-100 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-200"
                          )}
                        >
                          <span className={cn(
                            "p-2 rounded-xl text-white shrink-0 transition-transform group-hover:scale-105 shadow-xs",
                            eventsMegaTab === "upcoming" ? "gradient-brand" : "bg-slate-700"
                          )}>
                            <Calendar className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-btn text-slate-900 group-hover:text-cyan-600 transition-colors">
                                Upcoming Conferences
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-100 text-cyan-800">
                                {upcomingEvents.length}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10.5px] text-slate-500 leading-snug line-clamp-1">
                              Flagship summits & conclaves
                            </p>
                          </div>
                        </Link>

                        {/* 2. Past Events & Recaps */}
                        <Link
                          to="/events/past"
                          onMouseEnter={() => setEventsMegaTab("past")}
                          onClick={handleNavClick}
                          className={cn(
                            "group flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer",
                            eventsMegaTab === "past"
                              ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/50 shadow-xs"
                              : "border-slate-100 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-200"
                          )}
                        >
                          <span className={cn(
                            "p-2 rounded-xl text-white shrink-0 transition-transform group-hover:scale-105 shadow-xs",
                            eventsMegaTab === "past" ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-slate-700"
                          )}>
                            <Award className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-btn text-slate-900 group-hover:text-amber-600 transition-colors">
                                Past Events & Recaps
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                                {pastEvents.length}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10.5px] text-slate-500 leading-snug line-clamp-1">
                              Galleries, keynotes & highlights
                            </p>
                          </div>
                        </Link>

                        {/* 3. Delegate Registration */}
                        <button
                          type="button"
                          onMouseEnter={() => setEventsMegaTab("register")}
                          onClick={() => {
                            setEventsMegaOpen(false);
                            handleNavClick();
                            window.dispatchEvent(new CustomEvent("open-select-event-modal"));
                          }}
                          className={cn(
                            "w-full group flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer",
                            eventsMegaTab === "register"
                              ? "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-400/50 shadow-xs"
                              : "border-slate-100 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-200"
                          )}
                        >
                          <span className={cn(
                            "p-2 rounded-xl text-white shrink-0 transition-transform group-hover:scale-105 shadow-xs",
                            eventsMegaTab === "register" ? "bg-gradient-to-br from-purple-600 to-indigo-700" : "bg-slate-700"
                          )}>
                            <Users className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-btn text-slate-900 group-hover:text-purple-600 transition-colors">
                                Delegate Registration
                              </span>
                              <span className="text-[10px] font-bold text-purple-700 uppercase">Passes</span>
                            </div>
                            <p className="mt-0.5 text-[10.5px] text-slate-500 leading-snug line-clamp-1">
                              Reserve executive passes & QR codes
                            </p>
                          </div>
                        </button>

                        {/* 4. Partner & Sponsorship */}
                        <Link
                          to="/partner"
                          onMouseEnter={() => setEventsMegaTab("partner")}
                          onClick={handleNavClick}
                          className={cn(
                            "group flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer",
                            eventsMegaTab === "partner"
                              ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-400/50 shadow-xs"
                              : "border-slate-100 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-200"
                          )}
                        >
                          <span className={cn(
                            "p-2 rounded-xl text-white shrink-0 transition-transform group-hover:scale-105 shadow-xs",
                            eventsMegaTab === "partner" ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-slate-700"
                          )}>
                            <Handshake className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-btn text-slate-900 group-hover:text-emerald-600 transition-colors">
                                Partner & Alliances
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">B2B</span>
                            </div>
                            <p className="mt-0.5 text-[10.5px] text-slate-500 leading-snug line-clamp-1">
                              Sponsorships & exhibition booths
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Right: Real Dynamic Database Events Panel */}
                      <div className="col-span-7 bg-slate-50/80 rounded-2xl p-3 border border-slate-100 min-h-[220px]">
                        {eventsMegaTab === "upcoming" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1 mb-1.5">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                                Featured Upcoming Summits
                              </span>
                              <Link
                                to="/events/upcoming"
                                onClick={handleNavClick}
                                className="text-[11px] font-bold text-cyan-600 hover:underline flex items-center gap-0.5"
                              >
                                <span>View All ({upcomingEvents.length})</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>

                            {upcomingEvents.length > 0 ? (
                              <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                                {upcomingEvents.slice(0, 4).map((evt) => (
                                  <Link
                                    key={evt.id || evt.slug}
                                    to={`/events/${evt.slug || evt.id}`}
                                    onClick={handleNavClick}
                                    className="group flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 hover:border-cyan-400 hover:shadow-sm transition-all text-left"
                                  >
                                    <img
                                      src={getValidImageUrl(evt.image)}
                                      alt={evt.title}
                                      className="h-10 w-12 rounded-lg object-cover bg-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 truncate transition-colors">
                                        {evt.title}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-slate-500 font-medium truncate">
                                        <span className="text-purple-700 font-semibold truncate">📅 {evt.date}</span>
                                        <span>•</span>
                                        <span className="truncate">📍 {evt.city}</span>
                                      </div>
                                    </div>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-600 shrink-0 transition-colors" />
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                                No upcoming summits scheduled at this moment.
                              </div>
                            )}
                          </div>
                        )}

                        {eventsMegaTab === "past" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1 mb-1.5">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                                Past Summits & Archives
                              </span>
                              <Link
                                to="/events/past"
                                onClick={handleNavClick}
                                className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-0.5"
                              >
                                <span>View Recaps ({pastEvents.length})</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>

                            {pastEvents.length > 0 ? (
                              <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                                {pastEvents.slice(0, 4).map((evt) => (
                                  <Link
                                    key={evt.id || evt.slug}
                                    to={`/events/${evt.slug || evt.id}`}
                                    onClick={handleNavClick}
                                    className="group flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-sm transition-all text-left"
                                  >
                                    <img
                                      src={getValidImageUrl(evt.image)}
                                      alt={evt.title}
                                      className="h-10 w-12 rounded-lg object-cover bg-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 truncate transition-colors">
                                        {evt.title}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-slate-500 font-medium truncate">
                                        <span className="truncate">📅 {evt.date}</span>
                                        <span>•</span>
                                        <span className="truncate">📍 {evt.city}</span>
                                      </div>
                                    </div>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 shrink-0 transition-colors" />
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                                No past summits listed.
                              </div>
                            )}
                          </div>
                        )}

                        {eventsMegaTab === "register" && (
                          <div className="p-3 bg-white rounded-xl border border-purple-100 flex flex-col justify-between h-full space-y-3">
                            <div>
                              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-purple-700">
                                <Users className="h-3.5 w-3.5" />
                                <span>Official Delegate Desk</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 mt-1">
                                Reserve VIP Passes & Conference Seats
                              </h4>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                Access C-Suite keynotes, interactive panel discussions, and high-impact enterprise networking sessions.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEventsMegaOpen(false);
                                  handleNavClick();
                                  window.dispatchEvent(new CustomEvent("open-select-event-modal"));
                                }}
                                className="gradient-brand flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white text-center shadow-xs hover:scale-102 transition-transform cursor-pointer border-none"
                              >
                                Select Summit to Register
                              </button>
                            </div>
                          </div>
                        )}

                        {eventsMegaTab === "partner" && (
                          <div className="p-3 bg-white rounded-xl border border-emerald-100 flex flex-col justify-between h-full space-y-3">
                            <div>
                              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-700">
                                <Handshake className="h-3.5 w-3.5" />
                                <span>Enterprise Alliances</span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 mt-1">
                                Partner with National Leadership Summits
                              </h4>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                Title sponsorships, exhibition booths, thought leadership keynote slots, and verified B2B lead generation.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <Link
                                to="/partner"
                                onClick={handleNavClick}
                                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white text-center bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:scale-102 transition-transform cursor-pointer"
                              >
                                Explore Partnership Opportunities →
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/partner" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Partners</span>
                </>
              )}
            </NavLink>

            <NavLink to="/magazine" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Magazines</span>
                </>
              )}
            </NavLink>

            <NavLink to="/news" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>News</span>
                </>
              )}
            </NavLink>

            {/* VIP Membership Link */}
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                window.dispatchEvent(new CustomEvent("open-membership-modal"));
              }}
              className={cn(
                "relative px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold font-btn transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 border",
                location.pathname === "/membership"
                  ? "text-amber-800 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 shadow-[0_2px_10px_rgba(245,158,11,0.2)] font-extrabold"
                  : "text-amber-600 hover:text-amber-700 bg-amber-500/8 hover:bg-amber-500/15 border-amber-500/25 shadow-xs"
              )}
            >
              <Crown className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>Membership</span>
            </button>

            <NavLink to="/careers" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Careers</span>
                </>
              )}
            </NavLink>

            <NavLink to="/contact" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Contact</span>
                </>
              )}
            </NavLink>
          </div>

          {/* RIGHT: Glowing Register Button • Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Glowing Register CTA Button */}
            <MagneticButton
              strength={14}
              className="relative shrink-0 whitespace-nowrap gradient-brand rounded-full px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-xs sm:text-[13px] font-extrabold text-white shadow-[0_3px_14px_rgba(0,174,239,0.35)] hover:shadow-[0_5px_22px_rgba(0,174,239,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-register-modal"))}
                className="flex items-center gap-1.5 font-btn cursor-pointer bg-transparent border-none text-white text-xs sm:text-[13px] font-extrabold whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap">Register Now</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </MagneticButton>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={cn(
                "p-2 rounded-full border transition-all lg:hidden cursor-pointer",
                mobileMenuOpen
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "border-slate-200/90 bg-slate-100/90 text-slate-800 hover:bg-slate-200"
              )}
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </nav>

        {/* MOBILE & TABLET DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="container-x overflow-hidden lg:hidden pt-1.5 pb-3"
            >
              <div className="space-y-2.5 rounded-3xl border border-slate-200/90 bg-white/98 backdrop-blur-2xl p-4 sm:p-5 text-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] max-h-[80vh] overflow-y-auto">
                {/* Drawer Top Header Badge */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-display">
                      Executive Navigation
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full border border-cyan-200/60">
                    C-Suite Portal
                  </span>
                </div>

                {/* Nav Items List */}
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { to: "/", label: "Home", icon: Home },
                    { to: "/about", label: "About Us", icon: Building2 },
                    { to: "/events", label: "Summits & Events", icon: Calendar },
                    { to: "/partner", label: "Partners & Sponsors", icon: Handshake },
                    { to: "/magazine", label: "Executive Magazines", icon: BookOpen },
                    { to: "/news", label: "News & Media Coverage", icon: Newspaper },
                    { to: "/careers", label: "Careers & Openings", icon: Briefcase },
                    { to: "/contact", label: "Contact & Enquiry", icon: Phone },
                  ].map((item) => {
                    const isItemActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold font-btn transition-all duration-200",
                          isItemActive
                            ? "bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 text-cyan-700 border border-cyan-500/30 shadow-xs"
                            : "text-slate-700 hover:text-cyan-600 hover:bg-slate-100/80"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "p-1.5 rounded-xl transition-colors",
                              isItemActive
                                ? "bg-cyan-500 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {isItemActive && (
                          <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* VIP Membership Card */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("open-membership-modal"));
                  }}
                  className="w-full text-left rounded-2xl p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-orange-500/10 border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer flex items-center justify-between shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Crown className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold font-btn text-amber-950 group-hover:text-amber-800">
                        Executive Membership
                      </p>
                      <p className="text-xs text-amber-700/80">
                        Exclusive C-Suite Access & Privileges
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-xs">
                    Apply
                  </span>
                </button>

                {/* Quick Actions at Bottom */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent("open-register-modal"));
                    }}
                    className="gradient-brand w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 px-4 text-center text-sm font-extrabold font-btn text-white shadow-[0_4px_18px_rgba(0,174,239,0.35)] active:scale-[0.98] transition-all cursor-pointer border-none"
                  >
                    <span>Register for Summit Pass</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
