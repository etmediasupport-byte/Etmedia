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
} from "lucide-react";
import {
  events,
  heroSlides,
  images,
  magazines,
  partners,
  services,
  stats,
  testimonials,
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

const industries = [
  { icon: TrendingUp, title: "Finance & CFO Ecosystem", desc: "Capital allocation, enterprise risk, compliance & treasury strategy." },
  { icon: Crown, title: "HR & People Leadership", desc: "Talent strategy, AI in workforce, culture & executive retention." },
  { icon: Cpu, title: "Enterprise Tech & AI", desc: "CIO/CTO conclaves, cloud migration, cybersecurity & generative AI." },
  { icon: Factory, title: "Manufacturing & Operations", desc: "Industry 4.0, smart factories, supply chain resilience & logistics." },
  { icon: HeartPulse, title: "Healthcare & Lifesciences", desc: "Pharma innovation, digital health ecosystems & medical technology." },
  { icon: Globe2, title: "GCC & Global Capability Centers", desc: "India site expansion, capability scaling & talent acquisition." },
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
                  <span className="gradient-brand inline-flex rounded-2xl p-3.5 text-white shadow-md">
                    <f.icon className="h-6 w-6" />
                  </span>
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
            <Reveal key={evt.id || evt.slug || i} delay={i * 0.08}>
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
                <span className="gradient-soft text-brand-blue inline-flex rounded-2xl p-3.5 shadow-sm">
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-lg font-bold font-display">{p.title}</h3>
                <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">{p.desc}</p>
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
  return (
    <section className="bg-surface section relative overflow-hidden">
      <FloatingShapes />
      <div className="container-x relative z-10">
        <SectionHeading
          kicker="Sector Focus"
          title="Industries We Serve"
          description="Specialized leadership conclaves tailored for sector-specific enterprise challenges."
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <Reveal key={ind.title} delay={i * 0.06}>
              <MouseTiltCard maxTilt={10} className="glass-card h-full rounded-3xl p-7 border border-border flex items-start gap-4">
                <span className="gradient-brand p-3 rounded-2xl text-white shrink-0 shadow-md">
                  <ind.icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold font-display text-foreground">{ind.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{ind.desc}</p>
                </div>
              </MouseTiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// SECTION 7: EXECUTIVE TALKS MAGAZINE
function MagazineSection() {
  return (
    <section className="bg-slate-50 section relative overflow-hidden text-slate-900 border-y border-slate-200">
      <FloatingShapes />
      <div className="container-x relative z-10 grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="[perspective:1600px]">
            <motion.div
              initial={{ rotateY: -25, rotateX: 5 }}
              whileHover={{ rotateY: -5, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 120, damping: 16 }}
              className="relative mx-auto w-64 sm:w-80 [transform-style:preserve-3d]"
            >
              <div className="absolute inset-y-3 -right-4 rounded-r-2xl bg-slate-200/60 [transform:rotateY(-14deg)_translateZ(-24px)]" />
              <div className="absolute inset-y-1.5 -right-2 rounded-r-2xl bg-slate-300/80 [transform:rotateY(-8deg)_translateZ(-12px)]" />
              <img
                src={images.magazineCover}
                alt="Executive Talks magazine cover"
                loading="lazy"
                width={912}
                height={1200}
                className="relative rounded-2xl shadow-2xl border border-slate-200"
              />
            </motion.div>
          </div>
        </Reveal>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-50 px-4 py-1.5 text-xs font-extrabold tracking-[0.2em] text-cyan-800 uppercase font-btn shadow-sm">
            Executive Talks Magazine
          </span>
          <h2 className="mt-6 text-3xl font-bold font-display text-slate-900 sm:text-5xl leading-tight">
            The Publication For India's Decision Makers
          </h2>
          <p className="mt-5 max-w-xl text-slate-700 text-base leading-relaxed">
            In-depth interviews, sector intelligence reports and C-Suite perspectives — published quarterly for executive leaders across India.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <MagneticButton strength={15} className="gradient-brand rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-md">
              <Link to="/magazine" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Read Online
              </Link>
            </MagneticButton>
            <MagneticButton strength={15} className="bg-white rounded-full px-7 py-3.5 text-sm font-semibold text-slate-800 border border-slate-300 shadow-sm hover:bg-slate-100">
              <Link to="/magazine" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Download PDF Edition
              </Link>
            </MagneticButton>
          </div>
          <div className="mt-12 flex gap-4 overflow-x-auto pb-4">
            {magazines.slice(0, 4).map((m) => (
              <ImageZoomCard key={m.issue} src={m.cover} alt={`${m.title} cover`} className="w-32 h-44 shrink-0 rounded-xl shadow-lg">
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-lg p-1.5 text-center">
                  <p className="text-[10px] text-white/80 font-medium">{m.issue}</p>
                </div>
              </ImageZoomCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// SECTION 8: OUR COLLABORATORS
function CollaboratorsMarquee() {
  return (
    <section className="bg-surface py-16 overflow-hidden border-y border-slate-200/80 dark:border-slate-800">
      <div className="container-x">
        <p className="text-muted-foreground text-center text-xs font-bold tracking-[0.28em] uppercase font-btn">
          Trusted By Industry Leaders & Corporate Sponsors
        </p>
      </div>
      <div className="mt-10 overflow-hidden relative">
        {/* Gradient Fade Masks on sides */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          whileHover={{ animationPlayState: "paused" }}
          className="flex w-max gap-16 items-center"
        >
          {[...partners, ...partners, ...partners, ...partners].map((p, i) => (
            <span
              key={`${p}-${i}`}
              className="text-muted-foreground/60 hover:text-gradient text-2xl font-bold font-display tracking-[0.2em] whitespace-nowrap grayscale transition-all duration-300 hover:grayscale-0 cursor-default hover:scale-105"
            >
              {p}
            </span>
          ))}
        </motion.div>
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

      {/* 7. Executive Talks Magazine */}
      <MagazineSection />

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
