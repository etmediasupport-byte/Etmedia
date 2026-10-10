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
  Youtube,
  Instagram,
  Twitter,
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
  Mic,
  Star,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { SEOHead } from "@/components/site/SEOHead";
import {
  events as defaultEvents,
  EventItem,
  Speaker,
  Sponsor,
  GalleryItem,
  AgendaItem,
  images,
  getValidImageUrl,
} from "@/lib/site-data";
import { RegistrationPlansGrid } from "@/components/site/RegistrationPlansGrid";
import { RegisterModal } from "@/components/site/RegisterModal";
import { EventStatus, parseEventDateTime } from "@/components/site/EventCountdownTimer";
import { socket } from "@/lib/socket";
import { fetchWithCache, invalidateClientCache } from "@/lib/api-cache";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const targetSlug = (slug || "hr-recall-2k26").replace(/-\d+$/, "").toLowerCase();
  const initialMatched = defaultEvents.find(
    (e) => (e.slug || "").toLowerCase() === targetSlug ||
           (e.id || "").toLowerCase() === targetSlug ||
           (e.slug || "").toLowerCase().includes(targetSlug) ||
           targetSlug.includes((e.slug || "").toLowerCase())
  ) || defaultEvents[0]!;

  const [event, setEvent] = useState<EventItem | null>(initialMatched);
  const [loading, setLoading] = useState(false);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regMode, setRegMode] = useState<"paid" | "free">("paid");
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [eventPaymentConfig, setEventPaymentConfig] = useState<any>(null);
  const [isPricingAvailable, setIsPricingAvailable] = useState<boolean>(false);
  const [liveEventStatus, setLiveEventStatus] = useState<EventStatus>("upcoming");
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 14,
    minutes: 48,
    seconds: 32,
  });

  // Video / Highlight Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Hook 1: Fetch fresh event data in background
  useEffect(() => {
    let isMounted = true;

    const loadEventData = async () => {
      try {
        if (slug) {
          const data = await fetchWithCache(`/api/events/${slug}`);
          if (data && data.success && data.event && isMounted) {
            if (data.event.status === "draft" || data.event.status === "archived") {
              setEvent(null);
              return;
            }
            setEvent(data.event);
            return;
          } else if (data && !data.success && isMounted) {
            setEvent(null);
            return;
          }
        }
      } catch (err) {
        console.log("Using static event data cache:", err);
      }
    };

    loadEventData();

    // Listen for socket real-time update if event changes
    const onEventUpdate = (updatedEvent: any) => {
      if (updatedEvent && (updatedEvent.slug === slug || updatedEvent.id === slug || updatedEvent.id === event?.id)) {
        invalidateClientCache(`/api/events/${slug}`);
        setEvent(updatedEvent);
        toast.info("Event details updated live by event organizers!");
      }
    };

    const onVisibilityUpdate = (data: any) => {
      if (data && (data.id === slug || data.id === event?.id)) {
        invalidateClientCache(`/api/events/${slug}`);
        setEvent((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            allow_paid_registration: data.allow_paid_registration !== undefined ? data.allow_paid_registration : prev.allow_paid_registration,
            allow_free_registration: data.allow_free_registration !== undefined ? data.allow_free_registration : prev.allow_free_registration,
            show_pricing: data.show_pricing !== undefined ? data.show_pricing : prev.show_pricing,
          };
        });
      }
    };

    socket.on("event_updated", onEventUpdate);
    socket.on("event_registration_visibility_changed", onVisibilityUpdate);
    return () => {
      isMounted = false;
      socket.off("event_updated", onEventUpdate);
      socket.off("event_registration_visibility_changed", onVisibilityUpdate);
    };
  }, [slug]);

  // Hook 2: Fetch payment config for pricing tiers with cache
  useEffect(() => {
    if (event?.id || event?.slug) {
      fetchWithCache(`/api/event-payments/event/${event.id || event.slug}`)
        .then((data) => {
          if (data && data.success && data.pricingAvailable && data.payment) {
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

  // Hook 3: Live Countdown Calculation (Must be at top before any early returns!)
  useEffect(() => {
    let parsedLocs: any[] = [];
    try {
      if (typeof event?.locations === "string") {
        parsedLocs = JSON.parse(event.locations);
      } else if (Array.isArray(event?.locations)) {
        parsedLocs = event.locations;
      }
    } catch (e) {}

    const primaryL = (parsedLocs || [])[0] || {};
    const dText = primaryL.date || event?.date || "14 October 2026";
    const tText = primaryL.time || event?.time || "10:00 AM – 4:00 PM";

    const calculateTimeLeft = () => {
      const now = new Date();
      const { startDate, endDate } = parseEventDateTime(dText, tText);

      let currentStatus: EventStatus = "upcoming";

      if (now > endDate) {
        currentStatus = "ended";
      } else if (now >= startDate && now <= endDate) {
        currentStatus = "live";
      } else {
        const sameDay =
          now.getFullYear() === startDate.getFullYear() &&
          now.getMonth() === startDate.getMonth() &&
          now.getDate() === startDate.getDate();

        currentStatus = sameDay ? "starts_today" : "upcoming";
      }

      setLiveEventStatus(currentStatus);

      if (currentStatus === "upcoming" || currentStatus === "starts_today") {
        const diffMs = Math.max(0, startDate.getTime() - now.getTime());
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [event?.date, event?.time, event?.locations]);

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

  const splitEventTitle = (fullTitle: string) => {
    if (!fullTitle) return { whitePart: "Executive Summit", goldPart: "2026" };

    if (fullTitle.includes("&")) {
      const idx = fullTitle.indexOf("&");
      return {
        whitePart: fullTitle.slice(0, idx + 1).trim(),
        goldPart: fullTitle.slice(idx + 1).trim(),
      };
    }

    const words = fullTitle.split(" ");
    if (words.length > 3) {
      const splitPoint = Math.ceil(words.length / 2);
      return {
        whitePart: words.slice(0, splitPoint).join(" "),
        goldPart: words.slice(splitPoint).join(" "),
      };
    }

    return {
      whitePart: fullTitle,
      goldPart: "",
    };
  };

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

  const titleParts = splitEventTitle(event.title);

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
  const dateText = primaryLoc.date || event.date || "14 October 2026";
  const timeText = primaryLoc.time || event.time || "10:00 AM – 4:00 PM";
  const venueText = primaryLoc.venue || event.venue || "The Procurement Leadership";
  const cityText = primaryLoc.city || event.city || "Dubai";

  // Parse Speakers (ONLY admin provided speakers; empty if not provided)
  let speakersList: any[] = [];
  try {
    if (typeof event.speakers_list === "string") {
      speakersList = JSON.parse(event.speakers_list);
    } else if (Array.isArray(event.speakers_list)) {
      speakersList = event.speakers_list;
    }
  } catch (e) {}

  if (!Array.isArray(speakersList)) {
    speakersList = [];
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

  const heroImageSrc = getValidImageUrl(event?.image || event?.about_image, event?.title, event?.category);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 pb-6 sm:pb-8 font-sans pt-24 sm:pt-28 lg:pt-32">
      <SEOHead
        title={`${event.title} | Executive Talks Media`}
        description={event.description || `Register for ${event.title} curated by Executive Talks Media Business Intelligence. Join industry CXOs, keynote speakers, and thought leaders.`}
        keywords={`${event.title}, ${cityText}, Executive Talks Media, Executive Talks, ${event.category || "Leadership Summit"}, CXO Conference India, Delegate Passes`}
        image={heroImageSrc}
        url={`https://www.executivetalksmedia.in/events/${event.slug || slug}`}
        type="event"
        eventData={{
          name: event.title,
          description: event.description,
          startDate: dateText,
          locationName: venueText,
          city: cityText,
          image: heroImageSrc,
          price: eventPaymentConfig?.registration_fee || 4999,
          currency: eventPaymentConfig?.currency || "INR",
          isFree: eventPaymentConfig?.free_registration_allowed === 1,
          url: `https://www.executivetalksmedia.in/events/${event.slug || slug}`,
        }}
      />
      {/* ========================================================= */}
      {/* BREADCRUMBS & NAVIGATION                                  */}
      {/* ========================================================= */}
      <div className="bg-slate-50 border-b border-slate-200 py-2.5">
        <div className="container-x flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/events" className="hover:text-cyan-600 transition-colors">Events</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 font-extrabold truncate max-w-md">{event.title}</span>
        </div>
      </div>

      <div className="container-x py-4 sm:py-5 space-y-8">
        {/* ========================================================= */}
        {/* HERO SECTION: EXACT TWO-COLUMN EXECUTIVE HERO DESIGN     */}
        {/* ========================================================= */}
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-12 items-stretch">
          {/* LEFT COLUMN: LARGE BANNER WITH HERO KEYNOTE IMAGE & EMBEDDED COUNTDOWN */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-[#060b18] text-white shadow-xl border border-white/10 flex flex-col justify-between p-4 sm:p-6 lg:p-7 min-h-[380px] sm:min-h-[420px] lg:min-h-[440px] group">
            {/* Keynote Auditorium Image on Right Side */}
            <div className="absolute inset-0 z-0">
              <img
                src={heroImageSrc || images.heroSummit}
                alt={event.title}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = images.heroSummit;
                }}
                className="h-full w-full object-cover object-right opacity-70 group-hover:scale-105 transition-transform duration-700"
              />
              {/* Dark Vignette / Gradient Fading from Solid Dark Navy on Left to Transparent on Right */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#060b18] via-[#060b18]/90 via-50% to-[#060b18]/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060b18] via-transparent to-[#060b18]/40" />
            </div>

            {/* Golden Wave decorative accents */}
            <svg className="absolute top-0 left-0 h-full w-44 text-amber-400/20 pointer-events-none z-10" viewBox="0 0 200 600" fill="none">
              <path d="M-50 0 C 100 150, 150 450, -50 600" stroke="url(#goldGrad)" strokeWidth="1.5" />
              <path d="M-30 0 C 130 180, 170 420, -30 600" stroke="url(#goldGrad)" strokeWidth="1.5" />
              <path d="M-10 0 C 160 210, 190 390, -10 600" stroke="url(#goldGrad)" strokeWidth="1.5" />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f3cc83" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#d4af37" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f3cc83" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Top Category Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a122c]/85 border border-blue-500/40 px-3 py-1 text-[10px] sm:text-xs font-black text-cyan-300 uppercase tracking-wider backdrop-blur-md shadow-inner">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>{event.category || "TECH CONCLAVE"}</span>
              </span>
            </div>

            {/* Middle Title & Tagline & Description */}
            <div className="relative z-10 space-y-2 sm:space-y-2.5 my-auto pt-4 pb-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black font-serif tracking-tight text-white leading-tight">
                <span>{titleParts.whitePart} </span>
                {titleParts.goldPart && (
                  <span className="text-[#f3cc83] block sm:inline">{titleParts.goldPart}</span>
                )}
              </h1>

              <div className="flex items-center gap-2.5 text-[#e7c787] text-[10px] sm:text-xs font-serif tracking-widest uppercase py-0.5">
                <span className="h-[1px] w-5 bg-[#e7c787]/50" />
                <span>People &nbsp;|&nbsp; Purpose &nbsp;|&nbsp; Performance</span>
                <span className="h-[1px] w-5 bg-[#e7c787]/50" />
              </div>

              <p className="text-xs text-slate-200/90 font-normal leading-relaxed max-w-xl line-clamp-2">
                {event.description ||
                  "A premier multi-city flagship event series by Executive Talks Media Business Intelligence, bringing together Chief Procurement Officers (CPOs), supply chain heads, and industry leaders to discuss digital transformation, strategic sourcing, sustainability, and the future of procurement."}
              </p>
            </div>

            {/* Bottom Overlay Info Strip: Countdown Pill + Explore Event */}
            <div className="relative z-10 pt-2 flex flex-wrap items-center justify-between gap-3">
              {/* Frosted Countdown Pill */}
              <div className="rounded-xl bg-black/50 backdrop-blur-md border border-white/15 py-2 px-3.5 sm:px-4 shadow-xl flex items-center gap-3 sm:gap-4">
                <div className="text-center min-w-[32px]">
                  <div className="text-xl sm:text-2xl font-bold font-serif text-[#f3cc83] leading-none">
                    {timeLeft.days}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-slate-300 mt-0.5">
                    Days
                  </div>
                </div>

                <div className="h-5 w-[1px] bg-white/20" />

                <div className="text-center min-w-[32px]">
                  <div className="text-xl sm:text-2xl font-bold font-serif text-[#f3cc83] leading-none">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-slate-300 mt-0.5">
                    Hours
                  </div>
                </div>

                <div className="h-5 w-[1px] bg-white/20" />

                <div className="text-center min-w-[32px]">
                  <div className="text-xl sm:text-2xl font-bold font-serif text-[#f3cc83] leading-none">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-slate-300 mt-0.5">
                    Mins
                  </div>
                </div>

                <div className="h-5 w-[1px] bg-white/20" />

                <div className="text-center min-w-[32px]">
                  <div className="text-xl sm:text-2xl font-bold font-serif text-[#f3cc83] leading-none">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-slate-300 mt-0.5">
                    Secs
                  </div>
                </div>
              </div>

              {/* Explore Event Downward Circle */}
              <button
                type="button"
                onClick={() => scrollToSection("about")}
                className="flex flex-col items-center gap-0.5 text-[#f3cc83] hover:text-amber-200 transition-colors group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full border border-amber-300/40 bg-black/30 group-hover:bg-black/50 group-hover:scale-105 transition-all flex items-center justify-center">
                  <ArrowDown className="h-3.5 w-3.5 text-[#f3cc83] group-hover:translate-y-0.5 transition-transform" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium tracking-wide">Explore Event</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: FLOATING WHITE EXECUTIVE QUICK ACTION CARD */}
          <div className="lg:col-span-4 rounded-3xl bg-white p-4 sm:p-5 shadow-xl border border-slate-100 flex flex-col justify-between space-y-3 sm:space-y-3.5 text-slate-900">
            {/* Top Header: Badge & Share */}
            <div className="flex items-center justify-between">
              {liveEventStatus === "ended" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                  <CheckCircle2 className="h-3 w-3 text-slate-500" /> Event Concluded
                </span>
              ) : liveEventStatus === "live" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" /> Live in Session
                </span>
              ) : liveEventStatus === "starts_today" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                  <Flame className="h-3 w-3 text-amber-600 animate-bounce" /> Event Starts Today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Registrations Open
                </span>
              )}

              <button
                type="button"
                onClick={shareEvent}
                className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Share Event"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-display leading-snug line-clamp-2">
              {event.title}
            </h3>

            {/* Date & Location Rows with Purple/Indigo Icons */}
            <div className="space-y-2 py-0.5">
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#f5edff] flex items-center justify-center text-[#7c3aed] shrink-0">
                  <CalendarDays className="h-4 w-4 text-[#7c3aed]" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">{dateText}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{timeText}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#f5edff] flex items-center justify-center text-[#7c3aed] shrink-0">
                  <MapPin className="h-4 w-4 text-[#7c3aed]" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[200px]">{venueText || event.title}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{cityText}</div>
                </div>
              </div>
            </div>

            {/* 3 Stat Badges: Delegates, Speakers, Sponsors */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {/* Delegates */}
              <div className="rounded-xl bg-[#eff6ff] p-2 text-center border border-blue-100/60">
                <Users className="h-3.5 w-3.5 text-blue-600 mx-auto mb-0.5" />
                <div className="text-sm font-black text-slate-900">{event.delegates_count || "500+"}</div>
                <div className="text-[9px] font-bold text-slate-500">Delegates</div>
              </div>

              {/* Speakers */}
              <div className="rounded-xl bg-[#faf5ff] p-2 text-center border border-purple-100/60">
                <Mic className="h-3.5 w-3.5 text-purple-600 mx-auto mb-0.5" />
                <div className="text-sm font-black text-purple-700">{event.speakers_count || `${event.speakers || 30}+`}</div>
                <div className="text-[9px] font-bold text-purple-600">Speakers</div>
              </div>

              {/* Sponsors */}
              <div className="rounded-xl bg-[#fffbeb] p-2 text-center border border-amber-100/60">
                <Star className="h-3.5 w-3.5 text-amber-500 mx-auto mb-0.5 fill-amber-500" />
                <div className="text-sm font-black text-amber-900">{event.sponsors_count || "25+"}</div>
                <div className="text-[9px] font-bold text-slate-500">Sponsors</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-1">
              {liveEventStatus === "ended" ? (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-200 py-2.5 px-4 text-xs font-black text-slate-500 cursor-not-allowed border border-slate-300"
                >
                  <span>Registrations Concluded</span>
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ) : (event as any)?.allow_paid_registration === 0 && (event as any)?.allow_free_registration === 0 ? (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-50/90 py-2.5 px-4 text-xs font-black text-amber-800 cursor-not-allowed border border-amber-200 shadow-2xs"
                >
                  <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>Passes Releasing Soon</span>
                </button>
              ) : liveEventStatus === "live" ? (
                <div className={`grid ${(event as any)?.allow_paid_registration !== 0 && (event as any)?.allow_paid_registration !== false && (event as any)?.allow_free_registration !== 0 && (event as any)?.allow_free_registration !== false ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                  {(event as any)?.allow_paid_registration !== 0 && (event as any)?.allow_paid_registration !== false && (
                    <button
                      type="button"
                      onClick={() => handleOpenRegister("paid")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-2.5 px-2.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all cursor-pointer truncate"
                    >
                      <Radio className="h-3.5 w-3.5 animate-pulse text-white shrink-0" />
                      <span className="truncate">Join Live</span>
                    </button>
                  )}
                  {(event as any)?.allow_free_registration !== 0 && (event as any)?.allow_free_registration !== false && (
                    <button
                      type="button"
                      onClick={() => handleOpenRegister("free")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 py-2.5 px-2.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-emerald-500/25 transition-all cursor-pointer truncate"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-white shrink-0" />
                      <span className="truncate">Register Free</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className={`grid ${(event as any)?.allow_paid_registration !== 0 && (event as any)?.allow_paid_registration !== false && (event as any)?.allow_free_registration !== 0 && (event as any)?.allow_free_registration !== false ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                  {/* Button 1: Paid Registration (Register Now) */}
                  {(event as any)?.allow_paid_registration !== 0 && (event as any)?.allow_paid_registration !== false && (
                    <button
                      type="button"
                      onClick={() => handleOpenRegister("paid")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-2.5 px-2.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-purple-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer group truncate"
                    >
                      <Zap className="h-3.5 w-3.5 text-white shrink-0" />
                      <span className="truncate">Register Now</span>
                    </button>
                  )}

                  {/* Button 2: Free Pass Application (Register Free) */}
                  {(event as any)?.allow_free_registration !== 0 && (event as any)?.allow_free_registration !== false && (
                    <button
                      type="button"
                      onClick={() => handleOpenRegister("free")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 py-2.5 px-2.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-cyan-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer group truncate"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-white shrink-0" />
                      <span className="truncate">Register Free</span>
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  toast.success("Downloading Event Executive Brochure...");
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200/90 py-2 px-4 text-[11px] font-extrabold text-slate-800 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#7c3aed]" />
                <span>Download Brochure</span>
              </button>
            </div>
          </div>
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
                  src={getValidImageUrl(event.about_image || event.image, event.title, event.category)}
                  alt={event.title || "Event Highlight"}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = getValidImageUrl("", event.title, event.category);
                  }}
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
        {speakersList.length > 0 && (
          <section id="speakers" className="scroll-mt-36 space-y-6">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 to-purple-600" />
                <h3 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                  Featured Speakers
                </h3>
              </div>
              <button
                onClick={() => toast.info(`Displaying ${speakersList.length} executive speaker${speakersList.length > 1 ? "s" : ""}`)}
                className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All Speakers <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {speakersList.map((spk: any, idx: number) => {
                const websiteLink = spk.website_url || spk.websiteUrl || spk.website || spk.url || "";
                const linkedinLink = spk.linkedin_url || spk.linkedinUrl || "";
                const youtubeLink = spk.youtube_url || spk.youtubeUrl || "";
                const instagramLink = spk.instagram_url || spk.instagramUrl || "";
                const twitterLink = spk.twitter_url || spk.twitterUrl || spk.x_url || spk.xUrl || "";

                const socialLinks: { type: string; url: string; label: string; icon: any; colorClass: string }[] = [];
                if (websiteLink) socialLinks.push({ type: "website", url: websiteLink, label: "Website", icon: Globe, colorClass: "hover:text-cyan-300" });
                if (linkedinLink) socialLinks.push({ type: "linkedin", url: linkedinLink, label: "LinkedIn", icon: Linkedin, colorClass: "hover:text-sky-300" });
                if (youtubeLink) socialLinks.push({ type: "youtube", url: youtubeLink, label: "YouTube", icon: Youtube, colorClass: "hover:text-red-400" });
                if (instagramLink) socialLinks.push({ type: "instagram", url: instagramLink, label: "Instagram", icon: Instagram, colorClass: "hover:text-pink-400" });
                if (twitterLink) socialLinks.push({ type: "twitter", url: twitterLink, label: "Twitter / X", icon: Twitter, colorClass: "hover:text-sky-400" });

                const primaryLink = socialLinks.length > 0 ? socialLinks[0].url : "";

                return (
                  <div
                    key={spk.id || idx}
                    className="rounded-[28px] bg-slate-50/70 p-5 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center relative group overflow-hidden"
                  >
                    {/* Top Right Linked Page Badge (ONLY if a link exists) */}
                    {primaryLink && (
                      <a
                        href={primaryLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`View ${spk.name}'s Profile`}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-purple-100/70 text-purple-700 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer z-10"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}

                    {/* Circular Avatar Container with Hover Social Bar Overlay */}
                    <div className="relative mb-3 pt-1">
                      <div className="p-1 rounded-full bg-purple-100/60 group-hover:bg-purple-200/80 transition-colors duration-300">
                        <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full overflow-hidden relative bg-slate-100 flex items-center justify-center">
                          {spk.photo ? (
                            <img
                              src={spk.photo}
                              alt={spk.name}
                              className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 font-extrabold text-3xl">
                              {spk.name ? spk.name.charAt(0).toUpperCase() : "S"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Floating Social Pill Badge on Hover (ONLY if URLs were provided by Admin) */}
                      {socialLinks.length > 0 && (
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md">
                            {socialLinks.map((sl) => {
                              const IconComponent = sl.icon;
                              return (
                                <a
                                  key={sl.type}
                                  href={sl.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className={`hover:scale-125 transition-transform text-white p-0.5 ${sl.colorClass}`}
                                  title={`${sl.label} Link`}
                                >
                                  <IconComponent className="h-3.5 w-3.5" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Speaker Details */}
                    <div className="space-y-1 mt-2 w-full">
                      <h4 className="font-extrabold text-slate-900 text-base sm:text-lg font-display line-clamp-1 group-hover:text-purple-700 transition-colors">
                        {primaryLink ? (
                          <a
                            href={primaryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {spk.name}
                          </a>
                        ) : (
                          <span>{spk.name}</span>
                        )}
                      </h4>

                      <p className="text-xs font-bold text-violet-600 line-clamp-1">
                        {spk.designation || "Executive Speaker"}
                      </p>

                      <div className="w-6 h-0.5 bg-slate-200/80 mx-auto my-2 rounded-full group-hover:w-10 group-hover:bg-purple-300 transition-all duration-300" />

                      {(spk.company || spk.organization) && (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 line-clamp-1">
                          <Building className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                          <span>{spk.company || spk.organization}</span>
                        </div>
                      )}

                      {(spk.location || spk.country || spk.city) && (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 line-clamp-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                          <span>{spk.location || spk.country || spk.city}</span>
                        </div>
                      )}

                      {spk.topic && (
                        <p className="text-[11px] text-slate-500 italic pt-1 line-clamp-2">
                          "{spk.topic}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: REGISTRATION PLANS & OUR SPONSORS              */}
        {/* ========================================================= */}
        <section id="pricing" className="scroll-mt-36 space-y-10">
          {/* REGISTRATION PLANS TIER CARDS GRID (Visible only when Paid Registration is enabled AND Show Pricing is enabled) */}
          {(event as any)?.allow_paid_registration !== 0 &&
            (event as any)?.allow_paid_registration !== false &&
            (event as any)?.show_pricing !== 0 &&
            (event as any)?.show_pricing !== false && (
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
          )}

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
