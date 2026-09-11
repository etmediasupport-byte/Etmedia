import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageHero } from "@/components/site/PageHero";
import { EventCard } from "@/components/site/EventCard";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { events as defaultEvents, EventItem, images } from "@/lib/site-data";
import { socket } from "@/lib/socket";
import { Filter, Radio, Sparkles, UserCheck, X, Loader2 } from "lucide-react";
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

      <section className="container-x relative mt-12">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                <span>Filter Events</span>
              </div>

              {activeUsers !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                  <Radio className="h-3 w-3 animate-pulse" />
                  Live ({activeUsers} active)
                </span>
              )}

              {liveRegistrations > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <UserCheck className="h-3 w-3" />
                  {liveRegistrations} Delegates Registered
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "upcoming", "past"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all ${
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
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-card relative w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 rounded-full bg-muted/60 p-2 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-xl font-bold">Delegate Registration</h3>
            <p className="mt-1 text-sm text-muted-foreground">{selectedEvent.title}</p>

            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase">Work Email</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="john@company.com"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase">Organization</label>
                  <input
                    type="text"
                    required
                    value={regForm.organization}
                    onChange={(e) => setRegForm({ ...regForm, organization: e.target.value })}
                    placeholder="Acme Corp"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase">Designation</label>
                  <input
                    type="text"
                    required
                    value={regForm.designation}
                    onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                    placeholder="VP / Director"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="gradient-brand mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Real-time Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
