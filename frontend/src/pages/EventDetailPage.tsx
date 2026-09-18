import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Building,
  CheckCircle2,
  Share2,
  ChevronLeft,
  X,
  Loader2,
  Play,
  Maximize2,
  Award,
  ExternalLink,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import {
  events as defaultEvents,
  EventItem,
  Speaker,
  Sponsor,
  GalleryItem,
  AgendaItem,
  getDefaultSpeakers,
  getDefaultSponsors,
  getDefaultGallery,
  getDefaultAgenda,
} from "@/lib/site-data";
import { RegisterModal } from "@/components/site/RegisterModal";
import { socket } from "@/lib/socket";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "agenda" | "speakers" | "sponsors" | "gallery" | "venue">("about");

  // Registration Form State
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", organization: "", designation: "" });
  const [submitting, setSubmitting] = useState(false);

  // Gallery Lightbox State
  const [lightboxMedia, setLightboxMedia] = useState<GalleryItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadEventData = async () => {
      try {
        if (slug) {
          const res = await fetch(`/api/events/${slug}`);
          const data = await res.json();
          if (data.success && data.event && isMounted) {
            setEvent(data.event);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.log("Fetching from API failed, checking local static data:", err);
      }

      // Fallback search in static list
      const matched = defaultEvents.find((e) => e.slug === slug || e.id === slug);
      if (isMounted) {
        setEvent(matched || defaultEvents[0] || null);
        setLoading(false);
      }
    };

    loadEventData();

    // Listen for socket real-time update if event changes
    const onEventUpdate = (updatedEvent: any) => {
      if (updatedEvent && (updatedEvent.slug === slug || updatedEvent.id === slug)) {
        setEvent(updatedEvent);
        toast.info("Event details updated live by event organizers!");
      }
    };

    socket.on("event_updated", onEventUpdate);
    return () => {
      isMounted = false;
      socket.off("event_updated", onEventUpdate);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-2xl font-bold text-foreground">Event Not Found</h2>
        <p className="mt-2 text-muted-foreground">The requested event detail page could not be located.</p>
        <Link to="/events" className="mt-6 gradient-brand px-6 py-2.5 rounded-full text-white font-semibold">
          Back to All Events
        </Link>
      </div>
    );
  }

  // Parse Locations saved by admin in DB
  let parsedLocations: any[] = [];
  try {
    if (typeof event.locations === "string") {
      parsedLocations = JSON.parse(event.locations);
    } else if (Array.isArray(event.locations)) {
      parsedLocations = event.locations;
    }
  } catch (e) {}

  parsedLocations = (parsedLocations || []).filter(
    (loc: any) => loc && (loc.city || loc.venue || loc.date || loc.time)
  );

  if (parsedLocations.length === 0 && (event.city || event.venue || event.date || event.time)) {
    parsedLocations = [
      {
        city: event.city || "",
        venue: event.venue || "",
        date: event.date || "",
        time: event.time || "",
      },
    ];
  }

  const primaryLoc = parsedLocations[0] || {};
  const dateText = primaryLoc.date || event.date || "Date TBA";
  const timeText = primaryLoc.time || event.time || "Schedule TBA";
  const venueText = primaryLoc.venue || event.venue || "Venue TBA";
  const cityText = primaryLoc.city || event.city || "Location TBA";

  // Parse Speakers saved by admin in DB
  let speakersList: Speaker[] = [];
  try {
    if (typeof event.speakers_list === "string") {
      speakersList = JSON.parse(event.speakers_list);
    } else if (Array.isArray(event.speakers_list)) {
      speakersList = event.speakers_list;
    }
  } catch (e) {}

  // Parse Sponsors saved by admin in DB
  let sponsorsList: Sponsor[] = [];
  try {
    if (typeof event.sponsors_list === "string") {
      sponsorsList = JSON.parse(event.sponsors_list);
    } else if (Array.isArray(event.sponsors_list)) {
      sponsorsList = event.sponsors_list;
    }
  } catch (e) {}

  // Parse Gallery saved by admin in DB
  let galleryList: GalleryItem[] = [];
  try {
    if (typeof event.gallery_list === "string") {
      galleryList = JSON.parse(event.gallery_list);
    } else if (Array.isArray(event.gallery_list)) {
      galleryList = event.gallery_list;
    }
  } catch (e) {}

  // Parse Agenda saved by admin in DB
  let agendaList: AgendaItem[] = [];
  try {
    if (typeof event.agenda_list === "string") {
      agendaList = JSON.parse(event.agenda_list);
    } else if (Array.isArray(event.agenda_list)) {
      agendaList = event.agenda_list;
    }
  } catch (e) {}

  // Parse Locations saved by admin in DB
  let locationsList: { city: string; venue: string; date: string; time: string; address?: string; map_url?: string }[] = [];
  try {
    if (typeof event.locations === "string") {
      locationsList = JSON.parse(event.locations);
    } else if (Array.isArray(event.locations)) {
      locationsList = event.locations;
    }
  } catch (e) {}

  if (!locationsList || locationsList.length === 0) {
    locationsList = [
      {
        city: cityText,
        venue: venueText,
        date: dateText,
        time: event.time || "09:00 AM — 06:00 PM",
        address: event.venue_address || `${venueText}, ${cityText}`,
        map_url: event.map_url || `https://maps.google.com/maps?q=${encodeURIComponent(`${venueText}, ${cityText}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`,
      },
    ];
  }

  // Google Maps embed URL
  const mapEmbedUrl =
    event.map_url ||
    `https://maps.google.com/maps?q=${encodeURIComponent(`${venueText}, ${cityText}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...regForm,
          eventId: event.id || event.slug,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Registration Confirmed for ${event.title}!`);
        setRegModalOpen(false);
        setRegForm({ name: "", email: "", phone: "", organization: "", designation: "" });
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error submitting registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  return (
    <div className="relative min-h-screen bg-background pb-32 text-foreground">
      <GlowBackdrop />

      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-slate-950 pt-24 pb-20 text-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={event.image || "/assets/event-cfo-BjslOJNi.jpg"}
            alt={event.title}
            className="h-full w-full object-cover filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        </div>

        <div className="container-x relative z-10">
          {/* Top Breadcrumb Nav */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-6">
            <Link to="/events" className="hover:underline flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> All Events
            </Link>
            <span>/</span>
            <span className="text-white/70 truncate max-w-md">{event.category}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-end">
            <div className="lg:col-span-8">
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3.5 py-1 text-xs font-bold text-cyan-300 uppercase tracking-wider backdrop-blur-md">
                  {event.category}
                </span>
                {(event.is_featured === 1 || event.is_featured === true) && (
                  <span className="inline-flex items-center gap-1 rounded-full gradient-brand px-3.5 py-1 text-xs font-bold text-white shadow-md font-btn">
                    <Sparkles className="h-3.5 w-3.5" /> Featured Leadership Platform
                  </span>
                )}
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {event.status === "past" ? "Past Event Archives" : "Registrations Open"}
                </span>
              </div>

              {/* 2. TITLE */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
                {event.title}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-3xl">
                {event.description}
              </p>

              {/* Quick Info Pills */}
              <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-white/90">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
                  <CalendarDays className="h-4 w-4 text-cyan-400" />
                  <span>{dateText}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span>{timeText}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span>{cityText} • {venueText}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span>{event.speakers || speakersList.length}+ Speakers</span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => setRegModalOpen(true)}
                className="gradient-brand w-full py-4 px-8 rounded-full font-bold text-white text-base shadow-xl hover:scale-105 transition-all text-center flex items-center justify-center gap-2"
              >
                <Award className="h-5 w-5" /> Reserve Delegate Pass
              </button>
              <button
                onClick={shareEvent}
                className="w-full py-3 px-6 rounded-full font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-center flex items-center justify-center gap-2 border border-white/10"
              >
                <Share2 className="h-4 w-4" /> Share Event Page
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CARDS SECTION */}
      <section className="container-x mt-8 grid gap-6 md:grid-cols-2">
        {/* 3. DATE TIME CARD */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white/90 dark:bg-slate-900/90 shadow-lg flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 shrink-0">
            <CalendarDays className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">Date & Schedule</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{dateText}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{timeText}</p>
          </div>
        </div>

        {/* 4. VENUE CARD */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white/90 dark:bg-slate-900/90 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 shrink-0">
              <MapPin className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">Venue & City</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{venueText}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{cityText}, India</p>
            </div>
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${venueText}, ${cityText}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
          >
            Google Maps <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* MULTI-CITY SCHEDULES & LOCATIONS */}
        {parsedLocations.length > 1 && (
          <div className="md:col-span-2 glass-card rounded-3xl p-6 border border-slate-200/80 bg-white/90 dark:bg-slate-900/90 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-600" />
                <span>All Event Schedules & Cities ({parsedLocations.length} Locations)</span>
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {parsedLocations.map((loc: any, idx: number) => (
                <div key={idx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-cyan-800 dark:text-cyan-400 text-xs">Slot #{idx + 1} {idx === 0 ? "(Primary)" : ""}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.city}</span>
                  </div>
                  {loc.venue && <p className="text-sm font-bold text-slate-900 dark:text-white">{loc.venue}</p>}
                  {loc.date && <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1"><CalendarDays className="h-3 w-3 text-cyan-600" /> {loc.date}</p>}
                  {loc.time && <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1"><Clock className="h-3 w-3 text-purple-600" /> {loc.time}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* NAVIGATION TABS FOR SECTIONS */}
      <section className="container-x mt-10">
        <div className="flex flex-wrap items-center justify-between border-b border-border pb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "about", label: "Overview & Details" },
              { id: "agenda", label: `Agenda Timeline (${agendaList.length})` },
              { id: "speakers", label: `Speakers (${speakersList.length})` },
              { id: "sponsors", label: `Sponsors (${sponsorsList.length})` },
              { id: "gallery", label: `Gallery (${galleryList.length})` },
              { id: "venue", label: "Venue & Map" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "gradient-brand text-white shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x mt-8 space-y-16">
        {/* 5. DESCRIPTION & OVERVIEW */}
        {(activeTab === "about" || activeTab as string === "all") && (
          <Reveal>
            <div className="glass-card rounded-3xl p-8 border border-border bg-card shadow-xl">
              <h3 className="text-2xl font-bold font-display text-foreground mb-4">About The Event</h3>
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base space-y-4">
                <p>{event.full_description || event.description}</p>
                <p>
                  This executive conclave convenes top decision-makers, industry authorities, regulators, and digital innovators across India. The platform is designed to provide actionable business intelligence, benchmarking insights, and enterprise strategic roadmaps.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-muted/40 p-5">
                    <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Key Takeaways & Benchmarks
                    </h5>
                    <ul className="mt-2 text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                      <li>Strategic capital allocation frameworks</li>
                      <li>AI deployment & digital infrastructure insights</li>
                      <li>Cross-border regulatory & compliance guidelines</li>
                      <li>Peer-to-peer executive networking</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/40 p-5">
                    <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Target Audience
                    </h5>
                    <ul className="mt-2 text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                      <li>CXOs, MDs, Presidents & Vice Presidents</li>
                      <li>Chief Financial Officers & Finance Heads</li>
                      <li>Chief Technology & Information Officers</li>
                      <li>CHROs, HR Directors & Workplace Leaders</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* 6. AGENDA TIMELINE */}
        {(activeTab === "agenda" || activeTab as string === "all" || activeTab === "about") && (
          <Reveal>
            <div className="glass-card rounded-3xl p-8 border border-border bg-card shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Full-Day Schedule</span>
                  <h3 className="text-2xl font-bold font-display text-foreground">Agenda Timeline</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                  {agendaList.length} Sessions Scheduled
                </span>
              </div>

              <div className="relative border-l-2 border-primary/20 ml-4 pl-6 space-y-8">
                {agendaList.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-colors" />

                    <div className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                          <Clock className="h-3.5 w-3.5" /> {item.time}
                        </span>
                        {item.speaker && (
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                            Speaker: {item.speaker}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-3 text-lg font-bold text-foreground">{item.title}</h4>
                      {item.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* 7. SPEAKERS */}
        {(activeTab === "speakers" || activeTab as string === "all" || activeTab === "about") && (
          <Reveal>
            <div className="glass-card rounded-3xl p-8 border border-border bg-card shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Industry Leaders</span>
                  <h3 className="text-2xl font-bold font-display text-foreground">Featured Speakers</h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-500">
                  {speakersList.length} Keynote & Panel Speakers
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {speakersList.map((speaker, idx) => (
                  <div
                    key={speaker.id || idx}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-background p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden rounded-xl bg-muted mb-4">
                      <img
                        src={speaker.photo || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"}
                        alt={speaker.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{speaker.name}</h4>
                      {(speaker.linkedin_url || speaker.linkedinUrl) && (
                        <a
                          href={speaker.linkedin_url || speaker.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-[#0077b5]/10 border border-[#0077b5]/30 p-1.5 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all shadow-xs shrink-0"
                          title={`${speaker.name}'s LinkedIn Profile`}
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-primary mt-0.5">{speaker.designation}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{speaker.organization}</p>
                    {speaker.topic && (
                      <div className="mt-3 rounded-lg bg-muted/60 p-2 text-[11px] text-muted-foreground font-medium line-clamp-2">
                        {speaker.topic}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* 8. SPONSORS */}
        {(activeTab === "sponsors" || activeTab as string === "all" || activeTab === "about") && (
          <Reveal>
            <div className="glass-card rounded-3xl p-8 border border-border bg-card shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Corporate Partners</span>
                  <h3 className="text-2xl font-bold font-display text-foreground">Sponsors & Brand Partners</h3>
                </div>
                <Link to="/contact" className="text-xs font-bold text-primary hover:underline">
                  Become a Partner →
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                {sponsorsList.map((sponsor, idx) => (
                  <div
                    key={sponsor.id || idx}
                    className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-6 text-center hover:border-primary/50 transition-colors shadow-sm"
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-3">
                      {sponsor.tier}
                    </span>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-lg font-black tracking-tight text-foreground">{sponsor.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* 9. GALLERY */}
        {(activeTab === "gallery" || activeTab as string === "all" || activeTab === "about") && (
          <Reveal>
            <div className="glass-card rounded-3xl p-8 border border-border bg-card shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Event Archives</span>
                  <h3 className="text-2xl font-bold font-display text-foreground">Photos & Highlights</h3>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Click image to enlarge</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {galleryList.map((media, idx) => (
                  <div
                    key={media.id || idx}
                    onClick={() => setLightboxMedia(media)}
                    className="group relative h-48 overflow-hidden rounded-2xl bg-muted cursor-pointer shadow-md"
                  >
                    <img
                      src={media.url}
                      alt={media.caption || `Gallery ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                      <span className="text-xs font-semibold truncate">{media.caption || "Event Highlight"}</span>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-300 font-bold">
                        <Maximize2 className="h-3 w-3" /> View Fullscreen
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* 10. LOCATION MAP (ALL VENUES) */}
        {(activeTab === "venue" || activeTab as string === "all" || activeTab === "about") && (
          <Reveal>
            <div className="glass-card rounded-3xl p-8 border border-border bg-card shadow-xl space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Interactive Venue Maps</span>
                  <h3 className="text-2xl font-bold font-display text-foreground">Locations & Access ({locationsList.length} Cities)</h3>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{venueText}, {cityText}</span>
              </div>

              <div className="space-y-8">
                {locationsList.map((loc, idx) => {
                  const locMapUrl =
                    loc.map_url ||
                    event.map_url ||
                    `https://maps.google.com/maps?q=${encodeURIComponent(`${loc.venue || venueText}, ${loc.city || cityText}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

                  return (
                    <div key={idx} className="rounded-2xl border border-border bg-muted/40 p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-primary block">
                            Slot #{idx + 1} • {loc.city || cityText}
                          </span>
                          <h4 className="text-lg font-bold text-foreground font-display">
                            {loc.venue || venueText}
                          </h4>
                        </div>
                        <div className="text-right text-xs text-muted-foreground font-medium">
                          <p>📅 {loc.date || dateText}</p>
                          <p>⏰ {loc.time || event.time || "09:00 AM — 06:00 PM"}</p>
                        </div>
                      </div>

                      {loc.address && (
                        <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                          📍 <span className="text-foreground">{loc.address}</span>
                        </p>
                      )}

                      <div className="overflow-hidden rounded-xl border border-border h-80 bg-muted relative shadow-inner">
                        <iframe
                          title={`Venue Map - ${loc.city || idx + 1}`}
                          src={locMapUrl}
                          className="w-full h-full border-0"
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* 11. REGISTER NOW (STICKY CTA BAR AT BOTTOM) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border p-4 shadow-2xl">
        <div className="container-x flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-foreground text-sm sm:text-base">{event.title}</h4>
            <p className="text-xs text-muted-foreground font-medium">
              {dateText} • {venueText}, {cityText}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={shareEvent}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button
              onClick={() => setRegModalOpen(true)}
              className="gradient-brand rounded-full px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg hover:scale-105 transition-transform font-btn flex items-center gap-2"
            >
              <Award className="h-4 w-4" /> Register Now
            </button>
          </div>
        </div>
      </div>

      {/* DELEGATE REGISTRATION MODAL */}
      <RegisterModal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        event={event}
      />

      {/* GALLERY LIGHTBOX MODAL */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <button
            onClick={() => setLightboxMedia(null)}
            className="absolute top-6 right-6 rounded-full bg-white/20 p-3 text-white hover:bg-white/40"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center">
            <img
              src={lightboxMedia.url}
              alt={lightboxMedia.caption || "Event photo"}
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            {lightboxMedia.caption && (
              <p className="mt-4 text-center text-sm font-semibold text-white/90">{lightboxMedia.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
