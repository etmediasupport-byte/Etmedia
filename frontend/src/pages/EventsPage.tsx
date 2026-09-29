import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { EventCard } from "@/components/site/EventCard";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { events as defaultEvents, EventItem, images } from "@/lib/site-data";
import { RegisterModal } from "@/components/site/RegisterModal";
import { socket } from "@/lib/socket";
import { Calendar, Filter, Radio, Sparkles, UserCheck, ArrowRight } from "lucide-react";
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
  // Explicit CMS status flags
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

  // If event is occurring today
  if (eventTime >= todayStart && eventTime <= todayEnd) {
    return "live";
  }

  // If event date is before today
  if (eventTime < todayStart) {
    return "past";
  }

  // Otherwise, it is an upcoming future event
  return "upcoming";
}

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
  const [eventList, setEventList] = useState<EventItem[]>(defaultEvents);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [liveRegistrations, setLiveRegistrations] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    // Fetch live events list from backend if available
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setEventList(data.data);
        }
      })
      .catch((err) => console.log("Using default events data", err));

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

    // Upcoming events sorted chronologically by nearest date first
    upcoming.sort((a, b) => parseEventTimestamp(a) - parseEventTimestamp(b));

    // Past events sorted with most recently completed on top
    past.sort((a, b) => parseEventTimestamp(b) - parseEventTimestamp(a));

    // All events sorted: Live first, then Upcoming in date order, then Past
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

  const currentDisplayedEvents = useMemo(() => {
    if (statusFilter === "live") return liveEvents;
    if (statusFilter === "upcoming") return upcomingEvents;
    if (statusFilter === "past") return pastEvents;
    return allEvents;
  }, [statusFilter, liveEvents, upcomingEvents, pastEvents, allEvents]);

  return (
    <div className="relative min-h-screen bg-background pb-6 sm:pb-8 pt-28 sm:pt-32">
      <GlowBackdrop />

      <section className="container-x relative">
        {/* Title Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="text-left">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground font-display">
                Leadership Events & Industry Awards
              </h1>
              {activeUsers !== null && activeUsers > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>{activeUsers} Live Visitors</span>
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-2xl">
              Connect with CXOs, policymakers, and industry pioneers at India's premier executive platforms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All Events Pill */}
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "gradient-brand text-white shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
              }`}
            >
              All Events ({allCount})
            </button>

            {/* Upcoming Events Pill */}
            <button
              type="button"
              onClick={() => setStatusFilter("upcoming")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "upcoming"
                  ? "gradient-brand text-white shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
              }`}
            >
              Upcoming Events ({upcomingCount})
            </button>

            {/* Live Filter Pill */}
            <button
              type="button"
              onClick={() => setStatusFilter("live")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "live"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/50"
                  : liveCount > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
              }`}
            >
              {liveCount > 0 && <Radio className="h-3 w-3 animate-pulse" />}
              Live ({liveCount})
            </button>

            {/* Past Events Pill */}
            <button
              type="button"
              onClick={() => setStatusFilter("past")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "past"
                  ? "gradient-brand text-white shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
              }`}
            >
              Past Events ({pastCount})
            </button>
          </div>
        </div>

        {/* Compact Cards Grid */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {currentDisplayedEvents.map((event) => (
            <Reveal key={event.id || event.slug} className="h-full">
              <EventCard event={event} onRegister={(evt) => setSelectedEvent(evt)} />
            </Reveal>
          ))}
        </div>

        {/* Empty State Card */}
        {currentDisplayedEvents.length === 0 && (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto rounded-3xl border border-border/80 bg-surface/50 p-8 shadow-sm space-y-4">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground font-display">
                {statusFilter === "live"
                  ? "No Live Events In Session Today"
                  : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Events Found`}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {statusFilter === "live"
                  ? "There are no conferences happening right this moment. Explore our scheduled upcoming summits below!"
                  : "We regularly schedule new national CXO conferences and industry awards. Please check back shortly."}
              </p>
              {statusFilter !== "upcoming" && (
                <button
                  type="button"
                  onClick={() => setStatusFilter("upcoming")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:brightness-110 cursor-pointer transition-all"
                >
                  <span>Explore Upcoming Events ({upcomingCount})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
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
