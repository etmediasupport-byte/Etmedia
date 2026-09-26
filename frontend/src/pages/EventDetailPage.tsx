import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Play,
  Download,
  HelpCircle,
  ChevronRight,
  Lightbulb,
  GraduationCap,
  Trophy,
  Radio,
  AlertCircle,
  Flame,
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
import { RegistrationPlansGrid } from "@/components/site/RegistrationPlansGrid";
import { RegisterModal } from "@/components/site/RegisterModal";
import { EventCountdownTimer, EventStatus } from "@/components/site/EventCountdownTimer";
import { socket } from "@/lib/socket";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regMode, setRegMode] = useState<"paid" | "free">("paid");
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [eventPaymentConfig, setEventPaymentConfig] = useState<any>(null);
  const [isPricingAvailable, setIsPricingAvailable] = useState<boolean>(false);
  const [liveEventStatus, setLiveEventStatus] = useState<EventStatus>("upcoming");

  // Video / Highlight Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);

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

  // Fetch payment config for pricing tiers
  useEffect(() => {
    if (event?.id || event?.slug) {
      fetch(`/api/event-payments/event/${event.id || event.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.pricingAvailable && data.payment) {
            setEventPaymentConfig(data.payment);
            setIsPricingAvailable(true);
          } else {
            setEventPaymentConfig(null);
            setIsPricingAvailable(false);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch event payment config for page", err);
          setEventPaymentConfig(null);
          setIsPricingAvailable(false);
        });
    } else {
      setEventPaymentConfig(null);
      setIsPricingAvailable(false);
    }
  }, [event?.id, event?.slug]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenRegister = (mode: "paid" | "free", passName?: string) => {
    const targetSlug = slug || "hr-recall-2k26";
    if (mode === "free") {
      navigate(`/events/${targetSlug}/register-free`);
    } else {
      const passParam = passName ? `?pass=${encodeURIComponent(passName)}` : "";
      navigate(`/events/${targetSlug}/register${passParam}`);
    }
  };

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || "Executive Talks Media Event",
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-3 border-cyan-600 border-t-transparent animate-spin" />
          <p className="text-xs font-bold tracking-wider uppercase text-cyan-700 font-display">
            Loading Event Details...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-900">
        <h2 className="text-3xl font-extrabold font-display">Event Not Found</h2>
        <p className="mt-2 text-slate-500 max-w-md">The requested executive event detail page could not be located.</p>
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
  const dateText = primaryLoc.date || event.date || "15 October 2026";
  const timeText = primaryLoc.time || event.time || "9:00 AM – 6:00 PM (IST)";
  const venueText = primaryLoc.venue || event.venue || "HICC - Hyderabad International Convention Centre";
  const cityText = primaryLoc.city || event.city || "Hyderabad, Telangana";

  // Parse Speakers or Fallback to Curated Featured Speakers
  let speakersList: any[] = [];
  try {
    if (typeof event.speakers_list === "string") {
      speakersList = JSON.parse(event.speakers_list);
    } else if (Array.isArray(event.speakers_list)) {
      speakersList = event.speakers_list;
    }
  } catch (e) {}

  if (!speakersList || speakersList.length === 0) {
    speakersList = [
      {
        id: "spk-1",
        name: "Nazime Tuncay",
        designation: "Individual Researcher",
        company: "Educator",
        location: "Cyprus",
        linkedin_url: "https://linkedin.com",
        companyLogo: "https://logo.clearbit.com/tcs.com",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "spk-2",
        name: "Egor Kraev",
        designation: "Co-Founder and CTO",
        company: "Motley",
        location: "Switzerland",
        linkedin_url: "https://linkedin.com",
        companyLogo: "https://logo.clearbit.com/microsoft.com",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "spk-3",
        name: "Armand",
        designation: "VP",
        company: "DFCG",
        location: "France",
        linkedin_url: "https://linkedin.com",
        companyLogo: "https://logo.clearbit.com/google.com",
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "spk-4",
        name: "Priya Sharma",
        designation: "VP – People & Culture",
        company: "Microsoft",
        location: "India",
        linkedin_url: "https://linkedin.com",
        companyLogo: "https://logo.clearbit.com/amazon.com",
        photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "spk-5",
        name: "Arjun Mehta",
        designation: "Head of HR",
        company: "Google",
        location: "United States",
        linkedin_url: "https://linkedin.com",
        companyLogo: "https://logo.clearbit.com/infosys.com",
        photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "spk-6",
        name: "Sneha Reddy",
        designation: "Director – Talent",
        company: "Amazon",
        location: "United Kingdom",
        linkedin_url: "https://linkedin.com",
        companyLogo: "https://logo.clearbit.com/deloitte.com",
        photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "spk-7",
        name: "Vikram Sinha",
        designation: "CHRO",
        company: "Infosys",
        location: "India",
        linkedin_url: "https://linkedin.com",
        companyLogo: "https://logo.clearbit.com/infosys.com",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "spk-8",
        name: "Ananya Rao",
        designation: "People Partner",
        company: "Deloitte",
        location: "France",
        linkedin_url: "https://linkedin.com",
        companyLogo: "https://logo.clearbit.com/deloitte.com",
        photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400",
      },
    ];
  }

  // Parse Agenda or Fallback to Curated Agenda
  let agendaList: any[] = [];
  try {
    if (typeof event.agenda_list === "string") {
      agendaList = JSON.parse(event.agenda_list);
    } else if (Array.isArray(event.agenda_list)) {
      agendaList = event.agenda_list;
    }
  } catch (e) {}

  if (!agendaList || agendaList.length === 0) {
    agendaList = [
      { time: "09:00 AM", title: "Registration & Networking Tea", description: "Welcome kit distribution & morning networking" },
      { time: "10:00 AM", title: "Inauguration & Welcome Address", description: "Opening remarks by Executive Talks Media & keynote address" },
      { time: "11:00 AM", title: "Keynote Session: The Future of Work", description: "Exploring AI, automation & human-centric strategy" },
      { time: "12:30 PM", title: "Panel Discussion: Talent in the AI Era", description: "CXO insights on upskilling & retention" },
      { time: "02:00 PM", title: "Networking Lunch", description: "Curated 5-star networking executive lunch" },
      { time: "03:00 PM", title: "Industry Case Studies", description: "Real-world transformation enterprise presentations" },
      { time: "04:30 PM", title: "Awards Ceremony: Excellence Awards", description: "Honouring top industry leaders & innovators" },
      { time: "06:00 PM", title: "Closing Remarks & High Tea", description: "Closing synthesis & informal networking" },
    ];
  }

  // Curated Sponsors & Media Partners array with logos, badges, and site links
  let sponsorsList: any[] = [];
  try {
    if (typeof event.sponsors_list === "string") {
      sponsorsList = JSON.parse(event.sponsors_list);
    } else if (Array.isArray(event.sponsors_list)) {
      sponsorsList = event.sponsors_list;
    }
  } catch (e) {}

  if (!sponsorsList || sponsorsList.length === 0) {
    sponsorsList = [
      {
        name: "Times Of AI",
        badge: "Media Partner",
        logo: "https://logo.clearbit.com/nytimes.com",
        url: "https://timesofai.com",
      },
      {
        name: "AI Staffing Ninja",
        badge: "Media Partner",
        logo: "https://logo.clearbit.com/openai.com",
        url: "https://staffingninja.com",
      },
      {
        name: "CapitalBay News",
        badge: "Media Partner",
        logo: "https://logo.clearbit.com/bloomberg.com",
        url: "https://capitalbay.news",
      },
      {
        name: "Microsoft",
        badge: "Title Partner",
        logo: "https://logo.clearbit.com/microsoft.com",
        url: "https://microsoft.com",
      },
      {
        name: "Crypto ML Insights",
        badge: "Media Partner",
        logo: "https://logo.clearbit.com/coinbase.com",
        url: "https://crypto.com",
      },
      {
        name: "Google Cloud",
        badge: "Platinum Partner",
        logo: "https://logo.clearbit.com/google.com",
        url: "https://cloud.google.com",
      },
      {
        name: "Amazon AWS",
        badge: "Platinum Partner",
        logo: "https://logo.clearbit.com/aws.amazon.com",
        url: "https://aws.amazon.com",
      },
      {
        name: "Deloitte",
        badge: "Gold Partner",
        logo: "https://logo.clearbit.com/deloitte.com",
        url: "https://deloitte.com",
      },
      {
        name: "Infosys",
        badge: "Executive Partner",
        logo: "https://logo.clearbit.com/infosys.com",
        url: "https://infosys.com",
      },
      {
        name: "Wipro Technologies",
        badge: "Silver Partner",
        logo: "https://logo.clearbit.com/wipro.com",
        url: "https://wipro.com",
      },
    ];
  }

function getValidImageUrl(url?: string): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return "/assets/event-cfo-BjslOJNi.jpg";
  }
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }
  return trimmed;
}

  const heroImageSrc = getValidImageUrl(event?.image || event?.about_image);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 pb-32 font-sans pt-20 sm:pt-24">
      {/* ========================================================= */}
      {/* BREADCRUMBS & NAVIGATION                                  */}
      {/* ========================================================= */}
      <div className="bg-slate-50 border-b border-slate-200 py-3.5">
        <div className="container-x flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link to="/events" className="hover:text-cyan-600 transition-colors">Events</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-extrabold truncate max-w-md">{event.title}</span>
        </div>
      </div>

      <div className="container-x py-8 space-y-10">
        {/* ========================================================= */}
        {/* HERO SECTION: LEFT EVENT CARD BANNER + RIGHT QUICK CARD  */}
        {/* ========================================================= */}
        <section className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* LEFT COLUMN: LARGE BANNER WITH EVENT CARD IMAGE */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] flex flex-col justify-between p-5 sm:p-8 lg:p-10 group">
            {/* Background Event Card Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={heroImageSrc}
                alt={event.title}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/event-cfo-BjslOJNi.jpg";
                }}
                className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20" />
            </div>

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-4 py-1.5 text-xs font-black text-white uppercase tracking-wider shadow-md">
                {event.category || "FLAGSHIP EVENT"}
              </span>
            </div>

            {/* Middle Title & Description */}
            <div className="relative z-10 space-y-3 my-auto pt-8 sm:pt-12 pb-6">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
                {event.title}
              </h1>
              <p className="text-cyan-300 font-bold text-sm sm:text-base lg:text-lg">
                People. Purpose. Performance.
              </p>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed max-w-2xl font-medium">
                {event.description}
              </p>
            </div>

            {/* Bottom Overlay Info Strip */}
            <div className="relative z-10 border-t border-white/20 pt-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{dateText} • Thu, 9:00 AM – 6:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400 shrink-0" />
                <span>{cityText}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{event.delegates_count || "500+"} Delegates</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{event.speakers_count || `${event.speakers || 30}+`} Speakers</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: QUICK REGISTRATION CARD */}
          <div className="lg:col-span-4 rounded-3xl bg-slate-50/70 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {liveEventStatus === "ended" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> Event Concluded
                  </span>
                ) : liveEventStatus === "live" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800 border border-rose-200">
                    <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" /> Event is Live Now
                  </span>
                ) : liveEventStatus === "starts_today" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 border border-amber-200">
                    <Flame className="h-3.5 w-3.5 text-amber-600 animate-bounce" /> Event Starts Today
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-extrabold text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Registrations Open
                  </span>
                )}
                <button
                  type="button"
                  onClick={shareEvent}
                  className="rounded-full bg-white/80 p-2 text-slate-600 hover:bg-white transition-colors cursor-pointer"
                  title="Share Event"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-xl font-black text-slate-900 font-display leading-snug">
                {event.title}
              </h3>

              <div className="space-y-3 border-y border-slate-200/50 py-4 text-xs font-medium text-slate-700">
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900">{dateText}</span>
                    <span className="text-slate-500">{timeText}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900">{venueText}</span>
                    <span className="text-slate-500">{cityText}</span>
                  </div>
                </div>
              </div>

              {/* 3 STAT BADGES */}
              <div className="grid grid-cols-3 gap-2 text-center py-1">
                <div className="rounded-2xl bg-cyan-100/60 p-2.5">
                  <div className="text-base font-black text-cyan-900">{event.delegates_count || "500+"}</div>
                  <div className="text-[10px] font-bold text-cyan-700">Delegates</div>
                </div>
                <div className="rounded-2xl bg-purple-100/60 p-2.5">
                  <div className="text-base font-black text-purple-900">{event.speakers_count || `${event.speakers || 30}+`}</div>
                  <div className="text-[10px] font-bold text-purple-700">Speakers</div>
                </div>
                <div className="rounded-2xl bg-amber-100/60 p-2.5">
                  <div className="text-base font-black text-amber-900">{event.sponsors_count || "25+"}</div>
                  <div className="text-[10px] font-bold text-amber-700">Sponsors</div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {liveEventStatus === "ended" ? (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-200 py-3.5 px-6 text-sm font-black text-slate-500 cursor-not-allowed border border-slate-300"
                >
                  <span>Registrations Closed</span>
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                </button>
              ) : liveEventStatus === "live" ? (
                <button
                  type="button"
                  onClick={() => handleOpenRegister("paid")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-red-600 to-pink-600 py-3.5 px-6 text-sm font-black text-white hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  <Radio className="h-4 w-4 animate-pulse text-white" />
                  <span>Join Event Live</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenRegister("paid")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3.5 px-6 text-sm font-black text-white hover:opacity-95 transition-all cursor-pointer"
                >
                  <span>Register Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  toast.success("Downloading Event Executive Brochure...");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white py-3 px-6 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 text-cyan-600" />
                <span>Download Brochure</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* DYNAMIC LIVE COUNTDOWN TIMER SECTION                       */}
        {/* ========================================================= */}
        <section className="my-8">
          <EventCountdownTimer
            dateStr={dateText}
            timeStr={timeText}
            onStatusChange={setLiveEventStatus}
          />
        </section>



        {/* ========================================================= */}
        {/* SECTION 1: ABOUT THE EVENT                                */}
        {/* ========================================================= */}
        <section id="about" className="scroll-mt-36">
          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            {/* Left Description Box */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-50/60 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 to-purple-600" />
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                    About the Event
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {event.about_content ||
                    `The ${event.title} is a flagship summit organized by Executive Talks Media that brings together HR leaders, industry experts, and thought influencers to explore the future of work, people strategies, and organizational transformation.`}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Through keynote sessions, panel discussions, awards, and high-level networking opportunities, this summit aims to inspire, educate, and empower leaders to build more resilient, innovative, and people-centric organizations.
                </p>
              </div>

              {/* 4 HIGHLIGHT PILLS */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/50">
                <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3">
                  <Lightbulb className="h-5 w-5 text-cyan-600 shrink-0" />
                  <span className="text-xs font-extrabold text-cyan-950">Thought Leadership Sessions</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3">
                  <Users className="h-5 w-5 text-purple-600 shrink-0" />
                  <span className="text-xs font-extrabold text-purple-950">Industry Networking</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3">
                  <Trophy className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-xs font-extrabold text-amber-950">Excellence Awards</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3">
                  <GraduationCap className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-extrabold text-emerald-950">Interactive Discussions</span>
                </div>
              </div>
            </div>

            {/* Right Media Box & Event Highlights */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-50/60 p-6 space-y-6 flex flex-col justify-between">
              {/* Featured Event Image Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-100 h-56 sm:h-64 group">
                <img
                  src={event.about_image || event.image || "/assets/event-cfo-BjslOJNi.jpg"}
                  alt={event.title || "Event Highlight"}
                  className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider">
                    Event Overview Media
                  </span>
                </div>
              </div>

              {/* Event Highlights List */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 font-display flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  <span>Key Event Highlights</span>
                </h4>

                <ul className="space-y-2.5 text-xs font-medium text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Cutting-edge insights from industry leaders and CXOs</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Real-world case studies & transformation benchmarks</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>High-trust networking with executive decision-makers</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Recognition of organizational & leadership excellence</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Exhibition and corporate partner showcase</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: EVENT AGENDA                                   */}
        {/* ========================================================= */}
        <section id="agenda" className="scroll-mt-36 space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 to-purple-600" />
              <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                Event Agenda
              </h3>
            </div>
            <button
              onClick={() => toast.info("Showing complete conference timeline")}
              className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Agenda <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-stretch">
            {agendaList.map((item: any, idx: number) => (
              <div key={idx} className="rounded-2xl bg-slate-50/80 p-5 space-y-3 flex flex-col justify-between hover:bg-slate-100/80 transition-colors">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 rounded-full bg-blue-100/70 px-3 py-1 text-xs font-black text-blue-800">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{item.time}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-display leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: FEATURED SPEAKERS                              */}
        {/* ========================================================= */}
        <section id="speakers" className="scroll-mt-36 space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 to-purple-600" />
              <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                Featured Speakers
              </h3>
            </div>
            <button
              onClick={() => toast.info("Displaying all executive speakers")}
              className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Speakers <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {speakersList.map((spk: any, idx: number) => {
              const profileLink = spk.linkedin_url || spk.linkedinUrl || spk.url || spk.link || "https://linkedin.com";
              return (
                <div
                  key={idx}
                  className="rounded-[28px] bg-slate-50/70 p-5 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center relative group overflow-hidden"
                >
                  {/* Top Right Linked Page Badge */}
                  <a
                    href={profileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`View ${spk.name}'s Profile`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-4 right-4 h-8 w-8 rounded-full bg-purple-100/70 text-purple-700 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer z-10"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {/* Circular Avatar Container with Hover Social Bar Overlay */}
                  <div className="relative mb-3 pt-1">
                    <div className="p-1 rounded-full bg-purple-100/60 group-hover:bg-purple-200/80 transition-colors duration-300">
                      <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full overflow-hidden relative bg-slate-100">
                        <img
                          src={
                            spk.photo ||
                            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
                          }
                          alt={spk.name}
                          className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    {/* Floating Social Pill Badge on Hover */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2.5 backdrop-blur-md">
                        <a
                          href={profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:scale-125 transition-transform text-white p-0.5"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="h-3.5 w-3.5 fill-current" />
                        </a>
                        <a
                          href={spk.url || spk.website || profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:scale-125 transition-transform text-white p-0.5"
                          title="Official Link"
                        >
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:scale-125 transition-transform text-white p-0.5"
                          title="Linked Page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Speaker Details */}
                  <div className="space-y-1 mt-2 w-full">
                    <h4 className="font-extrabold text-slate-900 text-base sm:text-lg font-display line-clamp-1 group-hover:text-purple-700 transition-colors">
                      <a
                        href={profileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {spk.name}
                      </a>
                    </h4>

                    <p className="text-xs font-bold text-violet-600 line-clamp-1">
                      {spk.designation || "Executive Speaker"}
                    </p>

                    <div className="w-6 h-0.5 bg-slate-200/80 mx-auto my-2 rounded-full group-hover:w-10 group-hover:bg-purple-300 transition-all duration-300" />

                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 line-clamp-1">
                      <Building className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <span>{spk.company || spk.organization || "Executive Talks Media"}</span>
                    </div>

                    {(spk.location || spk.country || spk.city) && (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 line-clamp-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                        <span>{spk.location || spk.country || spk.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: REGISTRATION PLANS & OUR SPONSORS              */}
        {/* ========================================================= */}
        <section id="pricing" className="scroll-mt-36 space-y-10">
          {/* REGISTRATION PLANS TIER CARDS GRID */}
          <RegistrationPlansGrid
            pricingAvailable={isPricingAvailable}
            plans={
              typeof eventPaymentConfig?.pricing_plans === "string"
                ? JSON.parse(eventPaymentConfig.pricing_plans || "[]")
                : eventPaymentConfig?.pricing_plans || []
            }
            earlyBirdEnabled={eventPaymentConfig?.early_bird_enabled}
            earlyBirdStartDate={eventPaymentConfig?.early_bird_start_date}
            earlyBirdEndDate={eventPaymentConfig?.early_bird_end_date}
            theme="light"
            onSelectPlan={(selectedPlan) =>
              handleOpenRegister(isPricingAvailable ? "paid" : "free", selectedPlan?.name)
            }
          />

          {/* OUR SPONSORS & PARTNERS AUTO-SCROLLING ROW */}
          <div id="sponsors" className="scroll-mt-36 rounded-3xl bg-slate-50/60 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 to-purple-600" />
                <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                  Our Sponsors & Partners
                </h3>
              </div>
              <span className="text-xs font-bold text-cyan-600 hover:underline cursor-pointer">
                View All Sponsors →
              </span>
            </div>

            {/* AUTOMATIC CONTINUOUS HORIZONTAL MARQUEE ROW */}
            <div className="relative w-full overflow-hidden py-2">
              {/* Left & Right gradient masks for smooth edge fade */}
              <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

              <div className="flex gap-5 animate-marquee w-max">
                {[...sponsorsList, ...sponsorsList].map((sp: any, idx: number) => {
                  const websiteUrl = sp.url || sp.website || sp.link || "https://google.com";
                  return (
                    <div
                      key={idx}
                      className="relative group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-lg hover:border-purple-300 transition-all duration-300 flex flex-col justify-between items-center w-[230px] sm:w-[260px] h-[160px] shrink-0 overflow-hidden"
                    >
                      {/* Top Right Partner Badge */}
                      <span className="absolute top-3 right-3 bg-purple-100/80 text-purple-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-2xs">
                        {sp.badge || sp.tier || "Media Partner"}
                      </span>

                      {/* Center Logo Image / Title */}
                      <div className="h-16 w-full flex items-center justify-center p-1 my-auto">
                        {sp.logo || sp.image ? (
                          <img
                            src={sp.logo || sp.image}
                            alt={sp.name}
                            className="max-h-12 max-w-[170px] object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e: any) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "block";
                              }
                            }}
                          />
                        ) : null}
                        <span
                          style={{ display: sp.logo || sp.image ? "none" : "block" }}
                          className="text-base font-black text-slate-900 font-display line-clamp-1"
                        >
                          {sp.name}
                        </span>
                      </div>

                      {/* Bottom Visit Website Link */}
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-purple-600 group-hover:text-purple-700 flex items-center gap-1.5 hover:underline cursor-pointer transition-colors mt-auto"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: VENUE & FAQ                                     */}
        {/* ========================================================= */}
        <section id="venue" className="scroll-mt-36">
          <div className="grid gap-8 lg:grid-cols-12 items-stretch">
            {/* Left Venue Box */}
            <div id="venue-box" className="lg:col-span-8 rounded-3xl bg-slate-50/60 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 to-purple-600" />
                  <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                    Venue Details & Map
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">{cityText}</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 items-center">
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-slate-900 font-display">{venueText}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Novotel & HICC Complex, HITEC City, Hyderabad, Telangana 500081, India
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${venueText}, ${cityText}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-5 py-2.5 text-xs font-extrabold text-white hover:opacity-95 transition-all"
                  >
                    <span>Get Directions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Map iframe */}
                <div className="overflow-hidden rounded-2xl h-48 bg-slate-100 relative">
                  <iframe
                    title="Venue Google Map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${venueText}, ${cityText}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Right "Have Questions?" FAQ Box */}
            <div id="faq" className="scroll-mt-36 lg:col-span-4 rounded-3xl bg-blue-50/60 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900 font-display">Have Questions?</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Our team is here to help you with delegate registrations, sponsorship opportunities, or event schedule details.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-blue-200/50">
                <Link
                  to="/contact"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3 px-5 text-xs font-black text-white hover:opacity-95 transition-all"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => toast.info("FAQs section coming soon. Please contact us for support!")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white py-3 px-5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>FAQs</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>



      {/* VIDEO HIGHLIGHT MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-black border border-slate-800 p-6 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold font-display mb-4">{event.title} — Executive Highlights</h3>

            <div className="aspect-video w-full rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
              <iframe
                title="Event Video Highlight"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                className="w-full h-full rounded-2xl"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* DELEGATE REGISTRATION MODAL */}
      <RegisterModal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        event={event}
        mode={regMode}
      />
    </div>
  );
}
