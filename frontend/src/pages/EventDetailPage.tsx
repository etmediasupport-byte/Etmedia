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
  Maximize2,
  Award,
  ExternalLink,
  Linkedin,
  ArrowRight,
  Zap,
  Target,
  FileText,
  Globe,
  Layers,
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
} from "@/lib/site-data";
import { RegisterModal } from "@/components/site/RegisterModal";
import { socket } from "@/lib/socket";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regMode, setRegMode] = useState<"paid" | "free">("paid");
  const [activeSection, setActiveSection] = useState<string>("overview");

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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenRegister = (mode: "paid" | "free") => {
    setRegMode(mode);
    setRegModalOpen(true);
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || "ET Media Event",
        text: event?.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold tracking-wider uppercase text-cyan-400 font-display">
            Loading Event Experience...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 text-center text-white">
        <h2 className="text-3xl font-extrabold font-display">Event Not Found</h2>
        <p className="mt-2 text-slate-400 max-w-md">The requested executive event detail page could not be located.</p>
        <Link to="/events" className="mt-6 gradient-brand px-7 py-3 rounded-full text-white font-bold shadow-lg">
          Back to All Events
        </Link>
      </div>
    );
  }

  // Parse Locations
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
  const timeText = primaryLoc.time || event.time || "09:00 AM — 06:00 PM IST";
  const venueText = primaryLoc.venue || event.venue || "Convention Center";
  const cityText = primaryLoc.city || event.city || "Mumbai";

  // Parse Speakers
  let speakersList: Speaker[] = [];
  try {
    if (typeof event.speakers_list === "string") {
      speakersList = JSON.parse(event.speakers_list);
    } else if (Array.isArray(event.speakers_list)) {
      speakersList = event.speakers_list;
    }
  } catch (e) {}

  // Parse Sponsors
  let sponsorsList: Sponsor[] = [];
  try {
    if (typeof event.sponsors_list === "string") {
      sponsorsList = JSON.parse(event.sponsors_list);
    } else if (Array.isArray(event.sponsors_list)) {
      sponsorsList = event.sponsors_list;
    }
  } catch (e) {}

  // Parse Gallery
  let galleryList: GalleryItem[] = [];
  try {
    if (typeof event.gallery_list === "string") {
      galleryList = JSON.parse(event.gallery_list);
    } else if (Array.isArray(event.gallery_list)) {
      galleryList = event.gallery_list;
    }
  } catch (e) {}

  // Parse Agenda
  let agendaList: AgendaItem[] = [];
  try {
    if (typeof event.agenda_list === "string") {
      agendaList = JSON.parse(event.agenda_list);
    } else if (Array.isArray(event.agenda_list)) {
      agendaList = event.agenda_list;
    }
  } catch (e) {}

  // Parse Multi-Locations
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
        time: timeText,
        address: event.venue_address || `${venueText}, ${cityText}`,
        map_url: event.map_url || `https://maps.google.com/maps?q=${encodeURIComponent(`${venueText}, ${cityText}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`,
      },
    ];
  }

  return (
    <div className="relative min-h-screen bg-black text-slate-100 pb-36 font-sans selection:bg-cyan-500/30 selection:text-white">
      <GlowBackdrop />

      {/* ========================================================= */}
      {/* 1. HERO BANNER WITH LUXE HUD AND BACKGROUND ATMOSPHERE    */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-zinc-950 border-b border-zinc-800/80 pt-20 sm:pt-24 pb-14 sm:pb-20 text-white">
        {/* Background Atmosphere Image & Ambient Glows */}
        <div className="absolute inset-0 z-0 opacity-30 select-none pointer-events-none">
          <img
            src={event.image || "/assets/event-cfo-BjslOJNi.jpg"}
            alt={event.title}
            className="h-full w-full object-cover filter blur-md scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/85 to-black/60" />
        </div>
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="container-x relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400 font-btn">
            <Link to="/events" className="hover:text-cyan-300 transition-colors flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> All Conferences
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-slate-300 truncate max-w-xs sm:max-w-md">{event.category || "Executive Summit"}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-end">
            <div className="lg:col-span-8 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan-950/80 border border-cyan-500/40 px-3.5 py-1 text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider shadow-md backdrop-blur-md">
                  {event.category || "Conclave"}
                </span>
                {(event.is_featured === 1 || event.is_featured === true) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 px-3.5 py-1 text-[11px] font-extrabold text-white shadow-lg font-btn">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Flagship Summit
                  </span>
                )}
                <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1 text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider backdrop-blur-md">
                  {event.status === "past" ? "Archives" : "Registrations Open"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black font-display tracking-tight text-white leading-[1.12]">
                {event.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-medium max-w-3xl">
                {event.description}
              </p>

              {/* Quick Info Badges Grid */}
              <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-3 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 backdrop-blur-xl shadow-sm">
                  <CalendarDays className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>{dateText}</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 backdrop-blur-xl shadow-sm">
                  <Clock className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>{timeText}</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 backdrop-blur-xl shadow-sm">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{cityText} • {venueText}</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 backdrop-blur-xl shadow-sm">
                  <Users className="h-4 w-4 text-cyan-300 shrink-0" />
                  <span>{event.speakers || speakersList.length || 15}+ Speakers</span>
                </div>
              </div>
            </div>

            {/* Quick Dual Action Box */}
            <div className="lg:col-span-4 flex flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenRegister("paid")}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 px-6 rounded-2xl font-extrabold text-white text-sm shadow-[0_10px_30px_rgba(75,31,167,0.5)] hover:shadow-[0_15px_40px_rgba(75,31,167,0.7)] hover:scale-[1.02] transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-btn border-none"
              >
                <Zap className="h-4 w-4" /> Register Now (Paid Pass)
              </button>

              <button
                type="button"
                onClick={() => handleOpenRegister("free")}
                className="w-full bg-gradient-to-r from-cyan-500 via-teal-600 to-emerald-600 py-3.5 px-6 rounded-2xl font-extrabold text-white text-sm shadow-[0_10px_30px_rgba(0,174,239,0.5)] hover:shadow-[0_15px_40px_rgba(0,174,239,0.7)] hover:scale-[1.02] transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-btn border-none"
              >
                <Sparkles className="h-4 w-4" /> Register Free Interest
              </button>

              <button
                type="button"
                onClick={shareEvent}
                className="w-full py-2.5 px-5 rounded-2xl font-bold text-xs text-slate-300 bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md transition-all text-center flex items-center justify-center gap-2 border border-zinc-800 cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" /> Share Event Link
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. STICKY QUICK SECTION NAVIGATION PILL BAR               */}
      {/* ========================================================= */}
      <nav className="sticky top-16 z-30 bg-black/90 border-b border-zinc-800/90 backdrop-blur-xl py-3 shadow-xl">
        <div className="container-x flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "takeaways", label: "Takeaways & Audience", icon: Target },
            { id: "speakers", label: `Speakers (${speakersList.length})`, icon: Users },
            { id: "agenda", label: `Agenda (${agendaList.length})`, icon: Clock },
            { id: "sponsors", label: `Sponsors (${sponsorsList.length})`, icon: Award },
            { id: "gallery", label: `Media (${galleryList.length})`, icon: Layers },
            { id: "venue", label: `Locations (${locationsList.length})`, icon: MapPin },
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold font-btn transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "gradient-brand text-white shadow-[0_0_15px_rgba(0,174,239,0.5)]"
                    : "bg-zinc-900 border border-zinc-800 text-slate-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================= */}
      {/* MAIN SEQUENTIAL SECTION FLOW DOWN THE PAGE               */}
      {/* ========================================================= */}
      <div className="container-x mt-10 space-y-14 sm:space-y-20">

        {/* SECTION 1: OVERVIEW & FULL DESCRIPTION */}
        <section id="overview" className="scroll-mt-32">
          <Reveal>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-4">
                <span className="gradient-brand p-2.5 rounded-2xl text-white shadow-md">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-display block">
                    Strategic Intelligence Platform
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-white">About The Summit</h2>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-12 items-start">
                <div className={`space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base font-medium ${event.about_image ? "lg:col-span-7" : "lg:col-span-12"}`}>
                  <p className="whitespace-pre-line">{event.about_content || event.full_description || event.description}</p>
                  <p>
                    ET Media Business Intelligence brings together India’s top C-suite executives, policy leaders, digital architects, and enterprise pioneers under one roof. Designed as a high-octane thought leadership summit, this conclave focuses on strategic roadmaps, disruptive market shifts, cross-industry benchmarks, and meaningful executive networking.
                  </p>
                </div>

                {event.about_image && (
                  <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-cyan-500/30 bg-zinc-900 shadow-xl">
                    <img
                      src={event.about_image}
                      alt={`${event.title} About`}
                      className="h-64 sm:h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 font-display block">
                        Featured Event Highlight
                      </span>
                      <p className="text-xs text-white font-bold truncate">{event.title}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-zinc-800/80">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Format</span>
                  <span className="text-sm font-extrabold text-cyan-400 font-display block">Keynotes & Panels</span>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Access Level</span>
                  <span className="text-sm font-extrabold text-purple-400 font-display block">C-Suite & Senior VPs</span>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Certificate / Pass</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-display block">Verified Delegate Pass</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* SECTION 2: KEY TAKEAWAYS & TARGET AUDIENCE */}
        <section id="takeaways" className="scroll-mt-32">
          <Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Takeaways Box */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-3">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold font-display text-white">Key Takeaways & Benchmarks</h3>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 font-medium">
                  {[
                    "Actionable executive insights on enterprise growth & risk mitigation.",
                    "AI deployment models, automation benchmarks & digital roadmaps.",
                    "Strategic capital allocation, tax governance & regulatory updates.",
                    "High-impact peer networking with India's top 500 decision-makers.",
                    "Exclusive access to post-event summit research papers & recaps.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Audience Box */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-zinc-800/80 pb-3">
                  <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Users className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold font-display text-white">Target Executive Audience</h3>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 font-medium">
                  {[
                    "Chief Executive Officers, Managing Directors & Board Members.",
                    "Chief Financial Officers & Directors of Corporate Finance.",
                    "Chief Human Resources Officers (CHROs) & Talent Heads.",
                    "Chief Information & Technology Officers (CIOs / CTOs).",
                    "Senior Vice Presidents, Presidents & Industry Transformation Leaders.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Target className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        {/* SECTION 3: KEYNOTE & PANEL SPEAKERS */}
        <section id="speakers" className="scroll-mt-32">
          <Reveal>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="gradient-brand p-2.5 rounded-2xl text-white shadow-md">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-display block">
                      Thought Leaders
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Featured Speakers</h2>
                  </div>
                </div>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-400">
                  {speakersList.length} Keynotes & Panelists
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {speakersList.map((speaker, idx) => (
                  <div
                    key={speaker.id || idx}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-5 shadow-lg hover:border-cyan-500/50 hover:bg-zinc-800/90 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-52 sm:h-56 w-full overflow-hidden rounded-xl bg-zinc-950 mb-4 border border-zinc-800">
                        <img
                          src={speaker.photo || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"}
                          alt={speaker.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-bold font-display text-white group-hover:text-cyan-400 transition-colors">
                          {speaker.name}
                        </h4>
                        {(speaker.linkedin_url || speaker.linkedinUrl) && (
                          <a
                            href={speaker.linkedin_url || speaker.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-[#0077b5]/20 border border-[#0077b5]/40 p-1.5 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all shadow-xs shrink-0"
                            title={`${speaker.name}'s LinkedIn`}
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      <p className="text-xs font-bold text-cyan-400 mt-1">{speaker.designation}</p>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">{speaker.organization}</p>
                    </div>

                    {speaker.topic && (
                      <div className="mt-4 rounded-xl bg-zinc-950/80 border border-zinc-800 p-2.5 text-[11px] text-slate-400 font-medium line-clamp-2">
                        💡 {speaker.topic}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* SECTION 4: FULL AGENDA TIMELINE */}
        <section id="agenda" className="scroll-mt-32">
          <Reveal>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="gradient-brand p-2.5 rounded-2xl text-white shadow-md">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-display block">
                      Full-Day Schedule
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Agenda Timeline</h2>
                  </div>
                </div>
                <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-4 py-1.5 text-xs font-bold text-purple-400">
                  {agendaList.length} Sessions Scheduled
                </span>
              </div>

              <div className="relative border-l-2 border-cyan-500/30 ml-3 sm:ml-6 pl-5 sm:pl-8 space-y-6">
                {agendaList.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    <div className="absolute -left-[29px] sm:-left-[41px] top-2 h-4 w-4 rounded-full border-2 border-cyan-400 bg-black group-hover:bg-cyan-400 transition-colors shadow-[0_0_10px_#00AEEF]" />

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg hover:border-cyan-500/40 transition-all space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950 border border-cyan-500/40 px-3 py-1 text-xs font-extrabold text-cyan-300">
                          <Clock className="h-3.5 w-3.5 text-cyan-400" /> {item.time}
                        </span>
                        {item.speaker && (
                          <span className="text-xs font-bold text-purple-300 bg-purple-950/80 border border-purple-500/30 px-3 py-1 rounded-full">
                            Speaker: {item.speaker}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold font-display text-white">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* SECTION 5: CORPORATE SPONSORS & BRAND PARTNERS */}
        <section id="sponsors" className="scroll-mt-32">
          <Reveal>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="gradient-brand p-2.5 rounded-2xl text-white shadow-md">
                    <Award className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-display block">
                      Industry Supporters
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Corporate Sponsors</h2>
                  </div>
                </div>
                <Link to="/partner" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                  Partner With Us <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                {sponsorsList.map((sponsor, idx) => {
                  const targetUrl = (sponsor as any).websiteUrl || (sponsor as any).website;
                  const CardContent = (
                    <div className="h-full flex flex-col items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center hover:border-cyan-500/50 hover:bg-zinc-800/90 transition-all duration-300 shadow-md group cursor-pointer">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/80 border border-purple-500/30 px-2.5 py-0.5 rounded-full mb-3">
                        {sponsor.tier}
                      </span>
                      <div className="h-16 flex items-center justify-center my-2">
                        {sponsor.logo ? (
                          <img src={sponsor.logo} alt={sponsor.name} className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
                        ) : (
                          <span className="text-lg font-black tracking-tight text-white font-display">{sponsor.name}</span>
                        )}
                      </div>
                      {targetUrl && (
                        <span className="mt-3 text-[11px] font-bold text-cyan-400 group-hover:underline flex items-center gap-1">
                          Visit Website ↗
                        </span>
                      )}
                    </div>
                  );

                  return targetUrl ? (
                    <a key={sponsor.id || idx} href={targetUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                      {CardContent}
                    </a>
                  ) : (
                    <div key={sponsor.id || idx} className="h-full">
                      {CardContent}
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </section>

        {/* SECTION 6: MEDIA ARCHIVES & HIGHLIGHTS */}
        <section id="gallery" className="scroll-mt-32">
          <Reveal>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="gradient-brand p-2.5 rounded-2xl text-white shadow-md">
                    <Layers className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-display block">
                      Visual Memories
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Photos & Archives</h2>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">Click image to enlarge</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {galleryList.map((media, idx) => (
                  <div
                    key={media.id || idx}
                    onClick={() => setLightboxMedia(media)}
                    className="group relative h-48 overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 cursor-pointer shadow-md"
                  >
                    <img
                      src={media.url}
                      alt={media.caption || `Gallery ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                      <span className="text-xs font-bold truncate">{media.caption || "Summit Highlight"}</span>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-300 font-extrabold">
                        <Maximize2 className="h-3 w-3" /> View Fullscreen
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* SECTION 7: INTERACTIVE MAPS & VENUE LOCATIONS */}
        <section id="venue" className="scroll-mt-32">
          <Reveal>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="gradient-brand p-2.5 rounded-2xl text-white shadow-md">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-display block">
                      Venue Access
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                      Locations & Directions ({locationsList.length} Cities)
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-300">{venueText}, {cityText}</span>
              </div>

              <div className="space-y-8">
                {locationsList.map((loc, idx) => {
                  const locMapUrl =
                    loc.map_url ||
                    event.map_url ||
                    `https://maps.google.com/maps?q=${encodeURIComponent(`${loc.venue || venueText}, ${loc.city || cityText}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

                  return (
                    <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                        <div>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 block font-display">
                            City Slot #{idx + 1} • {loc.city || cityText}
                          </span>
                          <h4 className="text-lg font-bold font-display text-white">
                            {loc.venue || venueText}
                          </h4>
                        </div>
                        <div className="text-right text-xs text-slate-300 font-medium">
                          <p>📅 {loc.date || dateText}</p>
                          <p>⏰ {loc.time || timeText}</p>
                        </div>
                      </div>

                      {loc.address && (
                        <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                          📍 <span className="text-white">{loc.address}</span>
                        </p>
                      )}

                      <div className="overflow-hidden rounded-2xl border border-zinc-800 h-80 bg-zinc-950 relative shadow-inner">
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
        </section>

      </div>

      {/* ========================================================= */}
      {/* STICKY BOTTOM FLOATING BAR WITH DUAL REGISTRATION CTAS     */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/90 p-3 sm:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.9)]">
        <div className="container-x flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-white text-xs sm:text-base truncate font-display">{event.title}</h4>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
              📅 {dateText} • 📍 {venueText}, {cityText}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenRegister("paid")}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:scale-105 transition-all font-btn flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Zap className="h-4 w-4" />
              <span>Register Now</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenRegister("free")}
              className="bg-gradient-to-r from-cyan-500 via-teal-600 to-emerald-600 rounded-full px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:scale-105 transition-all font-btn flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Sparkles className="h-4 w-4" />
              <span>Register Free</span>
            </button>
          </div>
        </div>
      </div>

      {/* DELEGATE REGISTRATION MODAL WITH PAID/FREE SUPPORT */}
      <RegisterModal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        event={event}
        mode={regMode}
      />

      {/* GALLERY LIGHTBOX MODAL */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLightboxMedia(null)}
            className="absolute top-6 right-6 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center">
            <img
              src={lightboxMedia.url}
              alt={lightboxMedia.caption || "Event photo"}
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl border border-zinc-800"
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

