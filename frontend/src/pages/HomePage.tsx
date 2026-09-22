import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Award,
  Crown,
  Gem,
  Globe2,
  Megaphone,
  Presentation,
  Quote,
  Rocket,
  Star,
  TrendingUp,
  Download,
  BookOpen,
  ArrowRight,
  Sparkles,
  Building2,
  Compass,
  Target,
  X,
  Mail,
  CheckCircle2,
  Cpu,
  HeartPulse,
  Factory,
  Layers,
  Zap,
  Shield,
  Briefcase,
  ArrowUpRight,
} from "lucide-react";
import { socket } from "@/lib/socket";
import {
  events,
  heroSlides,
  images,
  magazines,
  partners,
  services,
  stats,
  testimonials,
  Collaborator,
  getDefaultCollaborators,
} from "@/lib/site-data";
import { GlowBackdrop, Reveal, SectionHeading } from "@/components/site/primitives";
import { EventCard } from "@/components/site/EventCard";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { FloatingShapes } from "@/components/ui/FloatingShapes";
import { ImageZoomCard } from "@/components/ui/ImageZoomCard";
import { HeroSection } from "@/components/site/HeroSection";
import { InteractiveMapSection } from "@/components/site/InteractiveMapSection";
import { StatisticsSection } from "@/components/site/StatisticsSection";
import { SEOHead } from "@/components/site/SEOHead";
import { toast } from "sonner";

const iconMap = {
  Crown,
  Award,
  Rocket,
  Megaphone,
  Gem,
  Presentation,
  TrendingUp,
  Globe2,
};

const sectorIconsMap: Record<string, any> = {
  TrendingUp,
  Crown,
  Cpu,
  Factory,
  HeartPulse,
  Globe2,
  Building2,
  Sparkles,
  Award,
  Zap,
  Shield,
  Briefcase,
};

const defaultSectors = [
  { id: 1, title: "Finance & CFO Ecosystem", description: "Capital allocation, enterprise risk, compliance & treasury strategy.", icon: "TrendingUp", tag: "Finance & Risk" },
  { id: 2, title: "HR & People Leadership", description: "Talent strategy, AI in workforce, culture & executive retention.", icon: "Crown", tag: "Talent & Culture" },
  { id: 3, title: "Enterprise Tech & AI", description: "CIO/CTO conclaves, cloud migration, cybersecurity & generative AI.", icon: "Cpu", tag: "Tech & Innovation" },
  { id: 4, title: "Manufacturing & Operations", description: "Industry 4.0, smart factories, supply chain resilience & logistics.", icon: "Factory", tag: "Industry 4.0" },
  { id: 5, title: "Healthcare & Lifesciences", description: "Pharma innovation, digital health ecosystems & medical technology.", icon: "HeartPulse", tag: "HealthTech" },
  { id: 6, title: "GCC & Global Capability Centers", description: "India site expansion, capability scaling & talent acquisition.", icon: "Globe2", tag: "Global Hubs" },
];

const galleryPreviewPhotos = [
  images.heroLeadership,
  images.heroAwards,
  images.eventHr,
  images.heroNetworking,
  images.eventCfo,
  images.heroSummit,
];

// SECTION 1: HERO CAROUSEL
function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(id);
  }, []);

  const slide = heroSlides[index]!;

  return (
    <section className="relative h-[92vh] min-h-[620px] w-full overflow-hidden lg:h-screen">
      {/* Background Image with Smooth Cross-Fade & Slow Zoom */}
      <AnimatePresence mode="sync">
        <motion.img
          key={index}
          src={slide.image}
          alt={slide.kicker}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.4 }, scale: { duration: 7, ease: "linear" } }}
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
      </AnimatePresence>

      {/* Dark Mesh Overlay & Background Floating Shapes */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-900/75 to-indigo-950/65" />
      <FloatingShapes />

      <div className="container-x relative flex h-full flex-col justify-center pt-24 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(6px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold tracking-[0.2em] text-cyan-300 uppercase">
                {slide.kicker}
              </span>
            </div>

            <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold text-white sm:text-6xl lg:text-7xl font-display tracking-tight">
              {slide.title}
            </h1>

            <p className="mt-6 max-w-xl text-base text-slate-200 sm:text-lg leading-relaxed">
              {slide.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <MagneticButton strength={20} className="gradient-brand rounded-full px-8 py-4 text-base font-semibold text-white shadow-luxe hover:brightness-110">
                <Link to="/events/register" className="flex items-center gap-2">
                  Register Now <ArrowRight className="h-4 w-4" />
                </Link>
              </MagneticButton>

              <MagneticButton strength={15} className="glass-dark rounded-full px-8 py-4 text-base font-semibold text-white border border-white/20 hover:bg-white/20">
                <Link to="/events">Explore Events</Link>
              </MagneticButton>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Slide Progress Bar */}
        <div className="mt-16 flex items-center gap-3 z-20">
          {heroSlides.map((s, i) => (
            <button
              key={s.kicker}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="relative h-2 rounded-full overflow-hidden transition-all duration-500 cursor-pointer"
              style={{ width: i === index ? "4rem" : "1.5rem", backgroundColor: "rgba(255, 255, 255, 0.25)" }}
            >
              {i === index && (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="h-full gradient-brand rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// SECTION 2: ET MEDIA EVENT NETWORK
function EventNetwork() {
  const formats = [
    { icon: Crown, title: "Leadership Summits", desc: "Flagship national conclaves bringing together C-Suite leaders for strategic dialogue.", count: "12+ Summits / Year" },
    { icon: Award, title: "Industry Awards", desc: "Prestigious recognition programs honoring benchmark organizations & benchmark executives.", count: "40+ Awardees / Event" },
    { icon: Rocket, title: "Brand & Launch Conclaves", desc: "Curated launch platforms designed for enterprise product unveilings to decision makers.", count: "National Media Reach" },
    { icon: Gem, title: "Executive Networking Dinners", desc: "Exclusive, closed-door dinners for senior leaders to foster long-term commercial ties.", count: "Strictly By Invitation" },
  ];

  return (
    <section className="bg-surface section relative overflow-hidden">
      <div className="container-x relative z-10">
        <SectionHeading
          kicker="Platform Formats"
          title="ET Media Event Network"
          description="Four signature conference and event formats engineered to connect decision makers with high-value commercial outcomes."
          align="left"
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {formats.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <MouseTiltCard maxTilt={12} className="glass-card gradient-ring h-full rounded-3xl p-7 border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl gradient-brand text-white flex items-center justify-center shadow-md shrink-0">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold font-display text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">{f.count}</span>
                </div>
              </MouseTiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// SECTION 3: ABOUT ET MEDIA SNAPSHOT
function AboutSnapshot() {
  return (
    <section className="section relative overflow-hidden bg-background">
      <FloatingShapes />
      <div className="container-x relative z-10 grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <ImageZoomCard src={images.aboutOffice} alt="ET Media Executive Office" className="aspect-[4/3] rounded-4xl shadow-2xl">
            <div className="gradient-soft absolute inset-0 pointer-events-none" />
          </ImageZoomCard>
        </Reveal>
        <Reveal delay={0.1}>
          <span className="text-brand-blue text-xs font-bold tracking-[0.24em] uppercase font-btn">
            About ET Media
          </span>
          <h2 className="mt-4 text-3xl font-bold font-display sm:text-5xl leading-tight">
            Building India's Premier Corporate Platforms
          </h2>
          <div className="text-muted-foreground mt-6 space-y-4 leading-relaxed text-base sm:text-lg">
            <p>
              ET Media Business Intelligence is a corporate media and conference enterprise headquartered in Hyderabad. We curate high-trust platforms where India's foremost C-Suite executives exchange actionable business intelligence.
            </p>
            <p>
              From CFO leadership summits to national HR excellence awards and GCC expansion conclaves, our events connect more than 50,000 corporate delegates each year.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <MagneticButton strength={15} className="gradient-brand rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-md">
              <Link to="/about">Learn Our Story</Link>
            </MagneticButton>
            <MagneticButton strength={15} className="hover:bg-accent rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-colors">
              <Link to="/events/partner">Partner With Us</Link>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// SECTION 4: UPCOMING EVENTS (Dynamic API CMS)
function UpcomingEvents() {
  const [eventList, setEventList] = useState<any[]>(events);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setEventList(data.data);
        }
      })
      .catch((err) => console.warn("Using static events fallback:", err));
  }, []);

  return (
    <section className="bg-surface section relative overflow-hidden">
      <div className="container-x relative z-10">
        <SectionHeading
          kicker="Upcoming Events"
          title="Reserve Your Delegate Seat"
          description="Conferences currently open for senior executive registration across India's top business hubs."
        />
        <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {eventList.slice(0, 3).map((evt, i) => (
            <Reveal key={evt.id || evt.slug || i} delay={i * 0.08} className="h-full">
              <EventCard event={evt} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <MagneticButton strength={18} className="hover:bg-accent rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors">
            <Link to="/events">View All Upcoming Events</Link>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

// SECTION 5: WHY ET MEDIA
function WhyEtMedia() {
  const pillars = [
    { icon: Building2, title: "Curated Leadership Audiences", desc: "Every delegate is verified. We ensure rooms are populated strictly by decision-making executives." },
    { icon: Compass, title: "Verified C-Suite Speakers", desc: "Hear directly from practitioners, founders, and industry veterans who have built at scale." },
    { icon: Sparkles, title: "5M+ Executive Media Reach", desc: "Amplified across digital channels and our Executive Talks Magazine for year-round visibility." },
    { icon: Target, title: "Measurable Commercial Growth", desc: "Structured networking ecosystems engineered to convert initial introductions into commercial deals." },
  ];

  return (
    <section className="section relative bg-background">
      <div className="container-x relative z-10">
        <SectionHeading
          kicker="Why Choose Us"
          title={<span className="sm:whitespace-nowrap">Why Enterprises Partner With ET Media</span>}
          description="Four core pillars that set ET Media Business Intelligence apart in corporate event curation."
          className="max-w-full"
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <MouseTiltCard maxTilt={14} className="glass-card gradient-ring h-full rounded-3xl p-7 border border-border/80">
                <div>
                  <div className="w-12 h-12 rounded-2xl gradient-soft text-brand-blue flex items-center justify-center shadow-sm shrink-0">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold font-display">{p.title}</h3>
                  <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </MouseTiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// SECTION 6: INDUSTRIES WE SERVE
function IndustriesWeServe() {
  const [sectors, setSectors] = useState<any[]>(defaultSectors);

  const fetchSectors = async () => {
    try {
      const res = await fetch("/api/sectors");
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setSectors(data.data);
      }
    } catch (err) {
      console.warn("Using default sectors fallback:", err);
    }
  };

  useEffect(() => {
    fetchSectors();

    const handleUpdate = () => {
      fetchSectors();
    };

    socket.on("sector_updated", handleUpdate);
    return () => {
      socket.off("sector_updated", handleUpdate);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#060813] py-24 text-white border-y border-zinc-800/80">
      {/* Background Radial Atmosphere Glows */}
      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#060813]/90 to-[#060813] pointer-events-none" />

      <FloatingShapes />

      <div className="container-x relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-extrabold tracking-[0.2em] text-cyan-400 uppercase font-btn backdrop-blur-md shadow-[0_0_15px_rgba(0,174,239,0.15)]">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>Sector Focus</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold font-display sm:text-5xl text-white tracking-tight leading-tight">
              Industries We Serve
            </h2>
            <p className="mt-3 max-w-2xl text-slate-400 text-base sm:text-lg font-sans">
              Specialized leadership conclaves and executive summits tailored for sector-specific enterprise challenges.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Curated Verticals</span>
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sec, i) => {
            const IconComponent = sectorIconsMap[sec.icon] || Building2;

            return (
              <Reveal key={sec.id || sec.title || i} delay={i * 0.05}>
                <MouseTiltCard
                  maxTilt={8}
                  className="group relative h-full rounded-3xl border border-zinc-800/90 bg-zinc-900/60 p-7 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/50 hover:bg-zinc-900/90 hover:shadow-[0_12px_40px_rgba(0,174,239,0.18)] flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle Card Ambient Highlight */}
                  <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/25 transition-all duration-500 pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 text-white shadow-lg shadow-cyan-500/25 group-hover:scale-110 group-hover:shadow-cyan-500/40 transition-all duration-300">
                        <IconComponent className="h-6 w-6" />
                      </div>

                      {sec.tag && (
                        <span className="rounded-full border border-slate-700/80 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-300 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-colors">
                          {sec.tag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold font-display text-white group-hover:text-cyan-400 transition-colors">
                      {sec.title}
                    </h3>
                    <p className="mt-3 text-slate-400 text-sm leading-relaxed font-sans font-normal">
                      {sec.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      Executive Platform
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/80 group-hover:border-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </MouseTiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// SECTION 8: OUR COLLABORATORS
function CollaboratorsMarquee() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    fetchPartners();

    const handlePartnerUpdate = () => {
      fetchPartners();
    };

    socket.on("partner_updated", handlePartnerUpdate);
    return () => {
      socket.off("partner_updated", handlePartnerUpdate);
    };
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners");
      if (res.ok) {
        const data = await res.json();
        if (data.partners && data.partners.length > 0) {
          const activePartners = data.partners.filter((c: Collaborator) => c.status !== "Inactive");
          activePartners.sort((a: Collaborator, b: Collaborator) => (a.priority ?? 0) - (b.priority ?? 0));
          setCollaborators(activePartners);
          return;
        }
      }
    } catch (e) {
      console.warn("Using fallback collaborators data:", e);
    }
    setCollaborators(getDefaultCollaborators());
  };

  const partnerList = collaborators.length > 0 ? collaborators : getDefaultCollaborators();
  // Multiply items for smooth infinite horizontal loop marquee animation
  const marqueeItems = [...partnerList, ...partnerList, ...partnerList, ...partnerList];

  return (
    <section className="bg-[#0b0f19] py-20 overflow-hidden border-y border-zinc-800/80 relative">
      {/* Background glow aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-[800px] bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="container-x relative z-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-cyan-300 uppercase font-btn shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Corporate Sponsors & Strategic Partners</span>
        </div>
        <h3 className="mt-3 text-2xl font-extrabold font-display text-white tracking-tight sm:text-3xl">
          Trusted By Industry Leaders & Corporate Sponsors
        </h3>
        <p className="mt-2 text-xs text-slate-400 max-w-xl mx-auto font-medium">
          Collaborating with Fortune 500 enterprises, GCCs, and high-growth technology pioneers. Click any brand logo to visit their website.
        </p>
      </div>

      {/* INFINITE MARQUEE SCROLLER */}
      <div className="mt-12 overflow-hidden relative z-10">
        {/* Gradient Side Fade Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-28 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-28 bg-gradient-to-l from-[#0b0f19] via-[#0b0f19]/80 to-transparent z-20 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, ease: "linear", repeat: Infinity }}
          whileHover={{ animationPlayState: "paused" }}
          className="flex w-max gap-6 items-center py-4"
        >
          {marqueeItems.map((item, idx) => {
            const targetUrl = item.website && item.website.trim() !== "" ? item.website : undefined;
            
            return (
              <a
                key={`${item.id}-${idx}`}
                href={targetUrl || "#"}
                target={targetUrl ? "_blank" : "_self"}
                rel={targetUrl ? "noopener noreferrer" : undefined}
                title={targetUrl ? `Visit ${item.brand_name} website (${item.website})` : item.brand_name}
                className="group relative flex items-center gap-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-500/60 hover:bg-zinc-800/90 hover:shadow-cyan-500/20 shrink-0 cursor-pointer"
              >
                {/* Brand Logo Container */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 p-1.5 border border-zinc-800 shadow-inner group-hover:border-cyan-400/50 transition-colors">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={item.brand_name}
                      className="max-h-full max-w-full object-contain filter group-hover:brightness-110 transition-all"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-cyan-400" />
                  )}
                </div>

                {/* Brand Name & Category */}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold font-display text-slate-100 group-hover:text-cyan-300 transition-colors whitespace-nowrap flex items-center gap-1.5">
                    {item.brand_name}
                    {targetUrl && (
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </span>
                  {item.category && (
                    <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase font-semibold">
                      {item.category}
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </motion.div>
      </div>

      {/* FOOTER CTA TO PARTNERS PAGE */}
      <div className="mt-8 text-center relative z-10">
        <Link
          to="/partner"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
        >
          <span>Become an Official ET Media Sponsor & Strategic Partner</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

// SECTION 10: TESTIMONIALS
function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  const nextSlide = () => setActiveIdx((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setActiveIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

  return (
    <section className="section bg-surface overflow-hidden">
      <div className="container-x">
        <SectionHeading
          kicker="Testimonials"
          title="What Industry Leaders Say"
          description="Hear from C-Suite executives who participate in ET Media platforms."
        />

        <div className="mt-16 relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 50, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {(() => {
                const t = testimonials[activeIdx]!;
                return (
                  <MouseTiltCard maxTilt={8} className="glass-card overflow-hidden rounded-3xl border border-border/80 shadow-2xl p-8 sm:p-12">
                    <div className="grid gap-8 lg:grid-cols-12 items-center">
                      <div className="lg:col-span-6 relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-border">
                        <iframe
                          src={`https://www.youtube.com/embed/${t.videoId}`}
                          title={`${t.name} testimonial`}
                          loading="lazy"
                          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full"
                        />
                      </div>

                      <div className="lg:col-span-6 space-y-4">
                        <Quote className="text-cyan-500 h-8 w-8 opacity-80" />
                        <p className="text-base sm:text-lg leading-relaxed text-foreground font-sans font-medium italic">
                          "{t.quote}"
                        </p>
                        <div className="flex items-center gap-1 pt-2">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className="fill-cyan-400 text-cyan-400 h-4 w-4" />
                          ))}
                        </div>
                        <div className="pt-2 border-t border-border/60">
                          <p className="font-bold text-lg font-display text-foreground">{t.name}</p>
                          <p className="text-muted-foreground text-sm font-btn">
                            {t.role}, <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{t.company}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </MouseTiltCard>
                );
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Carousel Navigation Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setActiveIdx(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeIdx ? "w-8 gradient-brand" : "w-2.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevSlide}
                className="p-3 rounded-full border border-border bg-background text-foreground hover:border-cyan-500 hover:text-cyan-500 transition-all cursor-pointer shadow-md"
                aria-label="Previous Testimonial"
              >
                ←
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="p-3 rounded-full border border-border bg-background text-foreground hover:border-cyan-500 hover:text-cyan-500 transition-all cursor-pointer shadow-md"
                aria-label="Next Testimonial"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// SECTION 11: GALLERY PREVIEW
function GalleryPreview() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section className="section bg-background">
      <div className="container-x">
        <SectionHeading kicker="Gallery Preview" title="Moments From Flagship Summits" />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryPreviewPhotos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(src)}
              className="overflow-hidden rounded-none cursor-pointer group"
            >
              <ImageZoomCard src={src} alt="ET Media event highlight" className="h-64 w-full rounded-none" />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute top-6 right-6 rounded-full bg-white/20 p-3 text-white hover:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>
          <img src={lightbox} alt="Enlarged gallery view" className="max-h-[85vh] w-auto rounded-none shadow-2xl" />
        </div>
      )}
    </section>
  );
}

// MAIN HOME PAGE COMPONENT
export default function HomePage() {
  return (
    <>
      <SEOHead
        title="ET Media Business Intelligence | India's Premier CXO Leadership Summit Platform"
        description="ET Media Business Intelligence bridges C-Suite leaders, Global Capability Centers, and enterprise growth opportunities across India."
        keywords="CFO Summit, HR Excellence Awards, Enterprise AI Conclave, CXO Conferences, Business Intelligence India"
      />
      {/* 1. Hero Carousel */}
      <HeroSection />

      {/* 2. ET Media Event Network */}
      <EventNetwork />

      {/* 3. About ET Media Snapshot */}
      <AboutSnapshot />

      {/* 4. Upcoming Events */}
      <UpcomingEvents />

      {/* 5. Why ET Media */}
      <WhyEtMedia />

      {/* 6. Industries We Serve */}
      <IndustriesWeServe />

      {/* Interactive Regional & International Event Map */}
      <InteractiveMapSection />

      {/* 8. Our Collaborators */}
      <CollaboratorsMarquee />

      {/* 10. Testimonials */}
      <TestimonialsSection />

      {/* 11. Gallery Preview */}
      <GalleryPreview />

      {/* Footer is rendered automatically by Layout */}
    </>
  );
}
