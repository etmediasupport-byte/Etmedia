import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { EventCard } from "@/components/site/EventCard";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { events as defaultEvents, EventItem, images } from "@/lib/site-data";
import { RegisterModal } from "@/components/site/RegisterModal";
import { socket } from "@/lib/socket";
import { Filter, Radio, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function EventsPage() {
  const location = useLocation();
  const initialFilter = location.pathname.includes("past")
    ? "past"
    : location.pathname.includes("upcoming")
      ? "upcoming"
      : "all";

  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "past">(initialFilter as any);
  const [eventList, setEventList] = useState<EventItem[]>(defaultEvents);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [liveRegistrations, setLiveRegistrations] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", organization: "", designation: "" });
  const [submitting, setSubmitting] = useState(false);

  // Helper function to check whether an event is in the past based on its scheduled date
  const isEventPast = (evt: any): boolean => {
    let dateStr = evt.date;
    try {
      let locs = typeof evt.locations === "string" ? JSON.parse(evt.locations) : evt.locations;
      if (Array.isArray(locs) && locs[0]?.date) {
        dateStr = locs[0].date;
      }
    } catch (e) {}

    if (!dateStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate < today;
    }

    const yearMatch = dateStr.match(/\b(20\d\d)\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      const currentYear = new Date().getFullYear();
      if (year < currentYear) return true;
      if (year > currentYear) return false;
    }

    return false;
  };

  useEffect(() => {
    // Fetch live events list from backend if available
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setEventList(data.data);
        }
      })
      .catch((err) => console.log("Using static events data", err));

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

  const liveEventsCount = eventList.filter((e) => e.status === "live" || (e as any).is_live).length;
  const upcomingEventsCount = eventList.filter((e) => !isEventPast(e)).length;
  const pastEventsCount = eventList.filter((e) => isEventPast(e)).length;
  const allEventsCount = eventList.length;

  const filteredEvents = eventList.filter((e) => {
    if (statusFilter === "live") return e.status === "live" || (e as any).is_live;
    if (statusFilter === "upcoming") return !isEventPast(e);
    if (statusFilter === "past") return isEventPast(e);
    return true;
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...regForm,
          eventId: selectedEvent.id || selectedEvent.slug,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Registered for ${selectedEvent.title}!`);
        setSelectedEvent(null);
        setRegForm({ name: "", email: "", phone: "", organization: "", designation: "" });
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not connect to backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background pb-16 pt-20">
      <GlowBackdrop />

      <section className="container-x relative">
        {/* Title Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground font-display">
              Leadership Events & Industry Awards
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1.5 max-w-2xl">
              Connect with CXOs, policymakers, and industry pioneers at India's premier executive platforms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Filter Pill */}
            <button
              type="button"
              onClick={() => setStatusFilter("live")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "live"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/50"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
              }`}
            >
              <Radio className="h-3 w-3 animate-pulse" />
              Live ({activeUsers !== null ? activeUsers : liveEventsCount})
            </button>

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
              All Events ({allEventsCount})
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
              Upcoming Events ({upcomingEventsCount})
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
              Past Events ({pastEventsCount})
            </button>
          </div>
        </div>

        {/* Compact Cards Grid */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Reveal key={event.id || event.slug} className="h-full">
              <EventCard event={event} onRegister={(evt) => setSelectedEvent(evt)} />
            </Reveal>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p>No events found for this filter.</p>
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
