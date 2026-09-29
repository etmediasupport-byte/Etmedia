import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { EventCard } from "@/components/site/EventCard";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { events as defaultEvents, EventItem, images, getValidImageUrl } from "@/lib/site-data";
import { RegisterModal } from "@/components/site/RegisterModal";
import { socket } from "@/lib/socket";
import {
  Calendar,
  Filter,
  Radio,
  Sparkles,
  Search,
  MapPin,
  X,
  Layers,
  Award,
  Users,
  Briefcase,
  Cpu,
  Globe2,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// Helper function to extract and parse event date timestamp reliably
function parseEventTimestamp(evt: any): number {
  let dateStr = evt.date || "";
  try {
    let locs = typeof evt.locations === "string" ? JSON.parse(evt.locations) : evt.locations;
    if (Array.isArray(locs) && locs[0]?.date) {
      dateStr = locs[0].date;
    }
  } catch (e) {}

  if (!dateStr || typeof dateStr !== "string") {
    return evt.created_at ? new Date(evt.created_at).getTime() : 0;
  }

  const cleanStr = dateStr.trim();

  // Try standard parse (e.g. "2026-11-18", "November 18, 2026", "24 October 2026")
  const parsed = Date.parse(cleanStr);
  if (!isNaN(parsed)) {
    return parsed;
  }

  // Handle formats like "24 October 2026" or "18 Nov 2026"
  const dmyMatch = cleanStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (dmyMatch) {
    const p = Date.parse(`${dmyMatch[2]} ${dmyMatch[1]}, ${dmyMatch[3]}`);
    if (!isNaN(p)) return p;
  }

  // Handle formats like "October 15 - 16, 2026" or "15 - 16 October 2026"
  const rangeMatch = cleanStr.match(/([A-Za-z]+)\s+(\d{1,2})\s*-\s*(\d{1,2}),?\s+(\d{4})/);
  if (rangeMatch) {
    const p = Date.parse(`${rangeMatch[1]} ${rangeMatch[2]}, ${rangeMatch[4]}`);
    if (!isNaN(p)) return p;
  }

  // Year fallback (e.g. "2026")
  const yearMatch = cleanStr.match(/\b(20\d\d)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return new Date(year, 0, 1).getTime();
  }

  return evt.created_at ? new Date(evt.created_at).getTime() : 0;
}

// Classify event status: "live" | "upcoming" | "past"
function getEventStatus(evt: any): "live" | "upcoming" | "past" {
  if (evt.status === "live" || evt.is_live === 1 || evt.is_live === true) {
    return "live";
  }
  if (evt.status === "past" || evt.status === "completed") {
    return "past";
  }

  const eventTime = parseEventTimestamp(evt);
  if (!eventTime) {
    return "upcoming";
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  if (eventTime >= todayStart && eventTime <= todayEnd) {
    return "live";
  }

  if (eventTime < todayStart) {
    return "past";
  }

  return "upcoming";
}

// Extract all cities associated with an event
function getEventCities(evt: any): string[] {
  const cities: string[] = [];
  if (evt.city && typeof evt.city === "string") {
    evt.city.split(/[,•/]/).forEach((c: string) => {
      const trimmed = c.trim();
      if (trimmed && !cities.includes(trimmed)) cities.push(trimmed);
    });
  }
  try {
    const locs = typeof evt.locations === "string" ? JSON.parse(evt.locations) : evt.locations;
    if (Array.isArray(locs)) {
      locs.forEach((l: any) => {
        if (l?.city && typeof l.city === "string") {
          l.city.split(/[,•/]/).forEach((c: string) => {
            const trimmed = c.trim();
            if (trimmed && !cities.includes(trimmed)) cities.push(trimmed);
          });
        }
      });
    }
  } catch (e) {}
  return cities.length > 0 ? cities : ["Pan-India"];
}

const CATEGORY_TABS = [
  { id: "all", label: "All Domains", icon: Sparkles },
  { id: "hr", label: "HR & Talent", icon: Users },
  { id: "cfo", label: "Finance & CFO", icon: Briefcase },
  { id: "tech", label: "Tech & AI", icon: Cpu },
  { id: "awards", label: "Awards & Honors", icon: Award },
  { id: "global", label: "Global & Leadership", icon: Globe2 },
];

export default function EventsPage() {
  const location = useLocation();
  const initialFilter = location.pathname.includes("past")
    ? "past"
    : location.pathname.includes("upcoming")
      ? "upcoming"
      : location.pathname.includes("live")
        ? "live"
        : "all";

  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "past">(initialFilter as any);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [liveRegistrations, setLiveRegistrations] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Load events from DB and merge with default summits
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const existingSlugs = new Set(data.data.map((d: any) => (d.slug || d.id || "").toLowerCase()));
          const extraDefaults = defaultEvents.filter(
            (def) => !existingSlugs.has((def.slug || def.id || "").toLowerCase())
          );
          setEventList([...data.data, ...extraDefaults]);
        } else {
          setEventList(defaultEvents);
        }
      })
      .catch((err) => {
        console.warn("Using default events data", err);
        setEventList(defaultEvents);
      });

    // Socket.IO real-time listeners
    socket.emit("get_initial_data");

    const onInitialData = (data: { activeUsers: number; totalRegistrations: number }) => {
      setActiveUsers(data.activeUsers);
      setLiveRegistrations(data.totalRegistrations);
    };

    const onLiveUsers = (data: { activeUsers: number }) => {
      setActiveUsers(data.activeUsers);
    };

    const onNewRegistration = (data: { registration: any; totalRegistrations: number; message: string }) => {
      setLiveRegistrations(data.totalRegistrations);
      toast.success(data.message);
    };

    socket.on("initial_data", onInitialData);
    socket.on("live_users_update", onLiveUsers);
    socket.on("new_registration", onNewRegistration);

    return () => {
      socket.off("initial_data", onInitialData);
      socket.off("live_users_update", onLiveUsers);
      socket.off("new_registration", onNewRegistration);
    };
  }, []);

  // Compute unique cities across all events
  const uniqueCities = useMemo(() => {
    const citySet = new Set<string>();
    eventList.forEach((e) => {
      getEventCities(e).forEach((c) => {
        if (c && c !== "Pan-India" && c !== "India" && c.length > 2) {
          citySet.add(c);
        }
      });
    });
    return Array.from(citySet).sort();
  }, [eventList]);

  // Categorize and sort events chronologically
  const { liveEvents, upcomingEvents, pastEvents, allEvents } = useMemo(() => {
    const live: EventItem[] = [];
    const upcoming: EventItem[] = [];
    const past: EventItem[] = [];

    eventList.forEach((e) => {
      const status = getEventStatus(e);
      if (status === "live") {
        live.push(e);
      } else if (status === "past") {
        past.push(e);
      } else {
        upcoming.push(e);
      }
    });

    upcoming.sort((a, b) => parseEventTimestamp(a) - parseEventTimestamp(b));
    past.sort((a, b) => parseEventTimestamp(b) - parseEventTimestamp(a));
    const all = [...live, ...upcoming, ...past];

    return {
      liveEvents: live,
      upcomingEvents: upcoming,
      pastEvents: past,
      allEvents: all,
    };
  }, [eventList]);

  const liveCount = liveEvents.length;
  const upcomingCount = upcomingEvents.length;
  const pastCount = pastEvents.length;
  const allCount = allEvents.length;

  // Filter pipeline based on Status, Search Query, Category, and City
  const filteredEvents = useMemo(() => {
    let list: EventItem[] = [];
    if (statusFilter === "live") list = liveEvents;
    else if (statusFilter === "upcoming") list = upcomingEvents;
    else if (statusFilter === "past") list = pastEvents;
    else list = allEvents;

    return list.filter((event) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (event.title || "").toLowerCase().includes(query);
        const descMatch = (event.description || "").toLowerCase().includes(query);
        const catMatch = (event.category || "").toLowerCase().includes(query);
        const venueMatch = (event.venue || "").toLowerCase().includes(query);
        const cityMatch = getEventCities(event).some((c) => c.toLowerCase().includes(query));

        if (!titleMatch && !descMatch && !catMatch && !venueMatch && !cityMatch) {
          return false;
        }
      }

      // 2. Category filter
      if (categoryFilter !== "all") {
        const catLower = (event.category || "").toLowerCase();
        const titleLower = (event.title || "").toLowerCase();
        const combined = `${catLower} ${titleLower}`;

        if (categoryFilter === "hr" && !combined.includes("hr") && !combined.includes("talent") && !combined.includes("people") && !combined.includes("recall")) {
          return false;
        }
        if (categoryFilter === "cfo" && !combined.includes("cfo") && !combined.includes("finance") && !combined.includes("treasury") && !combined.includes("capital")) {
          return false;
        }
        if (categoryFilter === "tech" && !combined.includes("tech") && !combined.includes("ai") && !combined.includes("enterprise") && !combined.includes("creator")) {
          return false;
        }
        if (categoryFilter === "awards" && !combined.includes("award") && !combined.includes("excellence") && !combined.includes("honor") && !combined.includes("recognition")) {
          return false;
        }
        if (categoryFilter === "global" && !combined.includes("global") && !combined.includes("gcc") && !combined.includes("leadership") && !combined.includes("perth")) {
          return false;
        }
      }

      // 3. City filter
      if (cityFilter !== "all") {
        const eventCities = getEventCities(event).map((c) => c.toLowerCase());
        if (!eventCities.some((c) => c.includes(cityFilter.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [statusFilter, categoryFilter, cityFilter, searchQuery, liveEvents, upcomingEvents, pastEvents, allEvents]);

  const hasActiveFilters = searchQuery.trim() !== "" || categoryFilter !== "all" || cityFilter !== "all" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setCityFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 pb-16 pt-28 sm:pt-32 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <GlowBackdrop />

      <section className="container-x relative z-10 space-y-8">
        {/* ========================================================================= */}
        {/* HERO TITLE & LIVE PULSE INTELLIGENCE STRIP                                */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>National Executive Summits & Awards</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Leadership Events &{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Industry Awards
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Connect with India's top 2,500+ CXOs, CHROs, CFOs, tech pioneers, and policymakers at high-impact conclaves.
            </p>
          </div>

          {/* Real-time stats strip */}
          <div className="flex flex-wrap items-center gap-3">
            {activeUsers !== null && activeUsers > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold backdrop-blur-md shadow-lg shadow-emerald-500/5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>{activeUsers} Live Visitors</span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-bold shadow-md">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>{allCount} Flagship Conclaves</span>
            </div>

            {liveRegistrations > 0 && (
              <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span>{liveRegistrations}+ Verified Registrations</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LUXURY FILTER & DISCOVERY CONTROL PANEL                                   */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl space-y-5">
          {/* Row 1: Status Segmented Tabs Controller */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Filter By Schedule Status
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/90">
              {/* All Events Tab */}
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>All Conclaves</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === "all" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"}`}>
                  {allCount}
                </span>
              </button>

              {/* Upcoming Tab */}
              <button
                type="button"
                onClick={() => setStatusFilter("upcoming")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === "upcoming"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Upcoming</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === "upcoming" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"}`}>
                  {upcomingCount}
                </span>
              </button>

              {/* Live Today Tab */}
              <button
                type="button"
                onClick={() => setStatusFilter("live")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === "live"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400"
                    : liveCount > 0
                    ? "text-emerald-400 hover:bg-emerald-500/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {liveCount > 0 ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                ) : (
                  <Radio className="h-3.5 w-3.5" />
                )}
                <span>Live In Session</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === "live" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"}`}>
                  {liveCount}
                </span>
              </button>

              {/* Past Archives Tab */}
              <button
                type="button"
                onClick={() => setStatusFilter("past")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === "past"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Past Archives</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === "past" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"}`}>
                  {pastCount}
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: Smart Search Input & City Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Box */}
            <div className="md:col-span-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search summits by title, keyword, keynote, venue, or topics..."
                className="w-full h-11 pl-11 pr-10 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* City Selector */}
            <div className="md:col-span-4 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 pointer-events-none" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full h-11 pl-11 pr-8 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-white font-medium focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-hidden transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">📍 All Cities & Locations</option>
                {uniqueCities.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    📍 {c}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs font-bold">
                ▼
              </div>
            </div>
          </div>

          {/* Row 3: Category Chips Carousel */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10"
                      : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Summary Bar */}
          <div className="flex items-center justify-between pt-2 text-xs font-medium text-slate-400 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Showing <strong className="text-white font-bold">{filteredEvents.length}</strong> of{" "}
              <strong className="text-slate-300">{allCount}</strong> Premier Summits
              {statusFilter !== "all" && (
                <span className="capitalize text-cyan-300 ml-1">({statusFilter})</span>
              )}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EVENT CARDS GRID                                                          */}
        {/* ========================================================================= */}
        {filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {filteredEvents.map((event) => (
              <Reveal key={event.id || event.slug} className="h-full">
                <EventCard
                  event={event}
                  onRegister={(evt, mode) => {
                    setSelectedEvent(evt);
                  }}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          /* Empty State Card */
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-10 shadow-2xl space-y-5">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                No Conclaves Matched Your Filters
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We couldn't find any summits matching your current search or category criteria. Try broadening your filters or resetting search keywords.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 hover:brightness-110 cursor-pointer transition-all"
              >
                <span>View All {allCount} Summits</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Real-time Event Registration Modal */}
      <RegisterModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </div>
  );
}
