import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageHero } from "@/components/site/PageHero";
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

  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past">(initialFilter);
  const [eventList, setEventList] = useState<EventItem[]>(defaultEvents);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [liveRegistrations, setLiveRegistrations] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", organization: "", designation: "" });
  const [submitting, setSubmitting] = useState(false);

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

  const filteredEvents = eventList.filter((e) => {
    if (statusFilter === "all") return true;
    return e.status === statusFilter;
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
    <div className="relative min-h-screen bg-background pb-20">
      <GlowBackdrop />
      <PageHero
        crumb="Events"
        title="Leadership Events & Industry Awards"
        subtitle="Connect with CXOs, policymakers, and industry pioneers at India's premier executive platforms."
        image={images.heroSummit}
      />

      <section className="container-x relative mt-6 sm:mt-12">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-border bg-card/60 p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                <span>Filter Events</span>
              </div>

              {activeUsers !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-emerald-500">
                  <Radio className="h-3 w-3 animate-pulse" />
                  Live ({activeUsers})
                </span>
              )}

              {liveRegistrations > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-primary">
                  <UserCheck className="h-3 w-3" />
                  {liveRegistrations} Registered
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
              {(["all", "upcoming", "past"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`flex-1 sm:flex-none rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === filter
                      ? "gradient-brand text-white shadow-md"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {filter === "all" ? "All Events" : `${filter} Events`}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Reveal key={event.id || event.slug}>
              <div onClick={() => setSelectedEvent(event)}>
                <EventCard event={event} />
              </div>
            </Reveal>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p>No events found for this filter.</p>
          </div>
        )}

        <Reveal className="mt-20">
          <div className="gradient-ink relative overflow-hidden rounded-3xl p-10 text-white">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-cyan backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Partner With Us
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Host or Sponsor an Executive Platform</h2>
              <p className="mt-3 leading-relaxed text-white/80">
                Position your brand in front of senior decision-makers across Finance, Technology, HR, and Enterprise operations.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="gradient-brand rounded-full px-6 py-3 font-semibold text-white transition-transform hover:scale-105"
                >
                  Sponsorship Opportunities
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
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
