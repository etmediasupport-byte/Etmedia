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
  Library,
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
import { Counter, GlowBackdrop, Reveal, SectionHeading } from "@/components/site/primitives";
import { EventCard } from "@/components/site/EventCard";



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

function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = heroSlides[index]!;

  return (
    <section className="relative h-[90vh] min-h-[560px] w-full overflow-hidden lg:h-screen">
      <AnimatePresence mode="sync">
        <motion.img
          key={index}
          src={slide.image}
          alt={slide.kicker}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: "linear" } }}
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(110deg,oklch(0.13_0.02_265/0.92),oklch(0.36_0.198_291.5/0.55))]" />
      <div className="bg-brand-blue/25 float-orb absolute top-1/4 -left-20 h-96 w-96 rounded-full" />
      <div
        className="bg-brand-purple/25 float-orb absolute -right-16 bottom-0 h-96 w-96 rounded-full"
        style={{ animationDelay: "4s" }}
      />

      <div className="container-x relative flex h-full flex-col justify-center pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="glass-dark inline-flex rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.22em] text-white uppercase">
              {slide.kicker}
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {slide.title}
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/80 sm:text-lg">{slide.description}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/events/register"
                className="gradient-brand rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-luxe transition-transform hover:scale-[1.04]"
              >
                Register Now
              </Link>
              <Link
                to="/events"
                className="glass-dark rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Explore Events
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex gap-2">
          {heroSlides.map((s, i) => (
            <button
              key={s.kicker}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "gradient-brand w-12" : "w-6 bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="section relative">
      <GlowBackdrop />
      <div className="container-x relative grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="glass-card gradient-ring lift h-full rounded-3xl p-7 text-center">
              <p className="text-gradient text-4xl font-bold">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-muted-foreground mt-2 text-sm font-medium">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Empowering() {
  return (
    <section className="bg-surface section">
      <div className="container-x">
        <SectionHeading
          kicker="Our Mission"
          title="Empowering Businesses Through Innovation"
          description="ET Media Business Intelligence connects enterprises, leaders and ideas through curated conferences, awards, media promotions and long-term networking ecosystems."
        />
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-4xl">
              <img
                src={images.aboutOffice}
                alt="Executives collaborating in a corporate office"
                loading="lazy"
                width={1400}
                height={1000}
                className="h-full w-full object-cover"
              />
              <div className="gradient-soft absolute inset-0" />
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s, i) => {
              const Icon = iconMap[s.icon];
              return (
                <Reveal key={s.title} delay={i * 0.05}>
                  <div className="glass-card lift h-full rounded-3xl p-5">
                    <span className="gradient-brand inline-flex rounded-2xl p-2.5 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading
          kicker="What We Deliver"
          title="Enterprise-Grade Business Platforms"
          description="Eight service lines built to put your brand in front of the decision makers who matter."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon];
            return (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className="glass-card gradient-ring lift group h-full rounded-3xl p-7">
                  <span className="gradient-soft text-primary inline-flex rounded-2xl p-3 transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturedConferences() {
  const featured = events.filter((e) => e.status === "upcoming");
  return (
    <section className="bg-surface section">
      <div className="container-x">
        <SectionHeading
          align="left"
          kicker="Featured Conferences"
          title="On Stage This Season"
          description="Swipe through the conferences currently open for delegate registration."
        />
        <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6">
          {featured.map((event) => (
            <div key={event.slug} className="w-[85vw] shrink-0 snap-start sm:w-[24rem]">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Upcoming() {
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading
          kicker="Upcoming Events"
          title="Reserve Your Seat In The Room"
          description="Limited delegate seats per conference to keep the quality of conversation high."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events
            .filter((e) => e.status === "upcoming")
            .slice(0, 3)
            .map((event, i) => (
              <Reveal key={event.slug} delay={i * 0.08}>
                <EventCard event={event} />
              </Reveal>
            ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link
            to="/events/upcoming"
            className="hover:bg-accent inline-flex rounded-full border border-border px-7 py-3 text-sm font-semibold transition-colors"
          >
            View all events
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function MagazinePreview() {
  return (
    <section className="gradient-ink section relative overflow-hidden">
      <div className="bg-brand-blue/25 float-orb absolute top-10 -left-24 h-80 w-80 rounded-full" />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <div className="[perspective:1600px]">
            <motion.div
              initial={{ rotateY: -28, rotateX: 6 }}
              whileHover={{ rotateY: -8, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 120, damping: 16 }}
              className="relative mx-auto w-64 sm:w-80 [transform-style:preserve-3d]"
            >
              <div className="absolute inset-y-3 -right-4 rounded-r-2xl bg-white/25 [transform:rotateY(-14deg)_translateZ(-24px)]" />
              <div className="absolute inset-y-1.5 -right-2 rounded-r-2xl bg-white/50 [transform:rotateY(-8deg)_translateZ(-12px)]" />
              <img
                src={images.magazineCover}
                alt="Executive Talks magazine cover"
                loading="lazy"
                width={912}
                height={1200}
                className="relative rounded-2xl shadow-[0_50px_90px_-40px_rgba(0,0,0,0.8)]"
              />
            </motion.div>
          </div>
        </Reveal>
        <div>
          <span className="glass-dark inline-flex rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-white uppercase">
            Executive Talks
          </span>
          <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
            The Magazine For India's Decision Makers
          </h2>
          <p className="mt-4 max-w-xl text-white/75">
            Long-form interviews, sector intelligence and leadership perspectives — published for
            the executives shaping industry.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/magazine"
              className="gradient-brand inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              <BookOpen className="h-4 w-4" /> Read Magazine
            </Link>
            <Link
              to="/magazine"
              className="glass-dark inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" /> Download PDF
            </Link>
            <Link
              to="/magazine"
              className="glass-dark inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              <Library className="h-4 w-4" /> View Archive
            </Link>
          </div>
          <div className="mt-10 flex gap-4 overflow-x-auto pb-4">
            {magazines.slice(0, 4).map((m) => (
              <div key={m.issue} className="w-32 shrink-0">
                <img
                  src={m.cover}
                  alt={`${m.title} cover`}
                  loading="lazy"
                  width={400}
                  height={520}
                  className="h-40 w-full rounded-xl object-cover"
                />
                <p className="mt-2 text-xs text-white/70">{m.issue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading
          kicker="Testimonials"
          title="What Industry Leaders Are Saying About Us"
        />
        <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 md:grid md:grid-cols-3 md:overflow-visible">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="w-[85vw] shrink-0 snap-start md:w-auto">
              <div className="glass-card lift h-full overflow-hidden rounded-3xl">
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${t.videoId}`}
                    title={`${t.name} testimonial`}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <div className="p-6">
                  <Quote className="text-primary h-5 w-5" />
                  <p className="mt-3 text-sm leading-relaxed">{t.quote}</p>
                  <div className="mt-5 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="fill-brand-blue text-brand-blue h-4 w-4" />
                    ))}
                  </div>
                  <p className="mt-4 font-semibold">{t.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="bg-surface py-16">
      <div className="container-x">
        <p className="text-muted-foreground text-center text-xs font-semibold tracking-[0.24em] uppercase">
          Trusted by leading organisations
        </p>
      </div>
      <div className="mt-10 overflow-hidden">
        <div className="marquee-track flex w-max gap-14">
          {[...partners, ...partners].map((p, i) => (
            <span
              key={`${p}-${i}`}
              className="text-muted-foreground/60 hover:text-gradient text-xl font-semibold tracking-[0.2em] whitespace-nowrap grayscale transition-all duration-300 hover:grayscale-0"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal>
          <div className="gradient-brand relative overflow-hidden rounded-4xl px-8 py-16 text-center text-white sm:px-16">
            <div className="float-orb absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-white/25" />
            <h2 className="relative text-3xl font-semibold text-white sm:text-4xl">
              Speak. Sponsor. Participate.
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-white/85">
              Join the ET Media ecosystem as a speaker, a sponsor or a delegate and get in front of
              India's most relevant business audience.
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[color:var(--brand-purple)] transition-transform hover:scale-105"
              >
                Become a Speaker
              </Link>
              <Link
                to="/events/partner"
                className="glass-dark rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Become a Sponsor
              </Link>
              <Link
                to="/events/register"
                className="glass-dark rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                Register for Conference
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Empowering />
      <Services />
      <FeaturedConferences />
      <Upcoming />
      <MagazinePreview />
      <Testimonials />
      <Partners />
      <CallToAction />
    </>
  );
}
