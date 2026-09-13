import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Building2,
  Compass,
  Eye,
  HeartHandshake,
  Linkedin,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { images, stats } from "@/lib/site-data";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ImageZoomCard } from "@/components/ui/ImageZoomCard";
import { FloatingShapes } from "@/components/ui/FloatingShapes";
import { Timeline } from "@/components/site/Timeline";

const pillars = [
  {
    icon: Target,
    title: "Mission",
    body: "To build India's most trusted business intelligence platform — where leaders exchange ideas that translate into measurable enterprise growth.",
  },
  {
    icon: Eye,
    title: "Vision",
    body: "A connected corporate ecosystem where every organisation, regardless of size, has access to the right stage, the right room and the right audience.",
  },
  {
    icon: HeartHandshake,
    title: "Core Values",
    body: "Integrity in curation, excellence in execution, respect for our delegates' time, and long-term partnerships over one-off transactions.",
  },
];

const whatWeDo = [
  "Leadership Conferences & Summits",
  "Executive Networking Platforms",
  "Industry Awards & Recognition",
  "Product & Brand Launch Events",
  "Corporate Branding & Media Promotions",
  "Business Workshops & Knowledge Sessions",
  "Startup & Innovation Connect Programs",
  "Strategic Business Networking Platforms",
];

const team = [
  { name: "Srinivas Reddy", role: "Founder & Managing Director", image: images.aboutOffice },
  { name: "Kavya Menon", role: "Director — Conferences", image: images.eventHr },
  { name: "Arjun Nair", role: "Head of Partnerships", image: images.eventCfo },
  { name: "Priya Sharma", role: "Editor, Executive Talks", image: images.magazineCover },
];

const gallery = [
  images.heroLeadership,
  images.heroAwards,
  images.eventHr,
  images.heroNetworking,
  images.eventCfo,
  images.heroSummit,
];

export default function AboutPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <PageHero
        crumb="About Us"
        title="About ET Media Business Intelligence"
        subtitle="A corporate media and conference house building the platforms where Indian business leadership meets."
        image={images.heroLeadership}
      />

      <section className="section relative overflow-hidden">
        <FloatingShapes />
        <div className="container-x relative z-10 grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              {[images.aboutOffice, images.heroNetworking, images.eventHr, images.heroSummit].map(
                (src, i) => (
                  <ImageZoomCard
                    key={i}
                    src={src}
                    alt="ET Media events and workspaces"
                    className={`h-52 w-full rounded-3xl ${i % 3 === 0 ? "mt-8" : ""}`}
                  />
                ),
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="text-brand-blue text-xs font-bold tracking-[0.22em] uppercase font-btn">
              Our Story
            </span>
            <h2 className="mt-4 text-3xl font-bold font-display sm:text-5xl leading-tight">
              Built On Conversations That Change Businesses
            </h2>
            <div className="text-muted-foreground mt-6 space-y-4 leading-relaxed text-base sm:text-lg">
              <p>
                ET Media Business Intelligence was founded on a simple observation: India's most
                valuable business insight rarely leaves the room it is spoken in. We built a company
                to change that — designing{" "}
                <strong className="text-foreground">leadership conferences</strong>,{" "}
                <strong className="text-foreground">industry awards</strong> and{" "}
                <strong className="text-foreground">executive networks</strong> where decision
                makers speak candidly and leave with something they can act on.
              </p>
              <p>
                From Hyderabad, our teams curate national platforms across HR, finance, procurement,
                technology, manufacturing, healthcare and the fast-growing{" "}
                <strong className="text-foreground">GCC ecosystem</strong>. Each conference is built
                around researched agendas, verified delegate profiles and speakers who have actually
                done the work.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface section relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading kicker="What Drives Us" title="Mission, Vision & Values" />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <MouseTiltCard maxTilt={12} className="glass-card gradient-ring h-full rounded-3xl p-8 border border-border/80">
                  <span className="gradient-brand inline-flex rounded-2xl p-3.5 text-white shadow-md">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold font-display">{p.title}</h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed text-sm">{p.body}</p>
                </MouseTiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading
            kicker="What We Do"
            title="Eight Ways We Put Your Brand In The Right Room"
          />
          <div className="mt-14 grid gap-x-12 gap-y-4 md:grid-cols-2">
            {whatWeDo.map((item, i) => (
              <Reveal key={item} delay={i * 0.04}>
                <MouseTiltCard maxTilt={6} className="glass-card flex gap-5 p-6 rounded-2xl border border-border">
                  <span className="gradient-brand relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold font-display">{item}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Curated formats, verified audiences and full media amplification.
                    </p>
                  </div>
                </MouseTiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface section">
        <div className="container-x">
          <SectionHeading kicker="Gallery" title="Moments From Our Platforms" />
          <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {gallery.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(src)}
                className="mb-5 block w-full overflow-hidden rounded-3xl group cursor-pointer"
              >
                <ImageZoomCard
                  src={src}
                  alt="ET Media event"
                  className={`w-full ${i % 3 === 1 ? "h-80" : "h-60"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Growth Section */}
      <section className="section bg-slate-900/5 dark:bg-slate-950/50 border-y border-slate-200 dark:border-slate-800">
        <div className="container-x">
          <SectionHeading
            kicker="Our Journey"
            title="Milestones of Leadership & Impact"
            description="From our first CFO summit to national leadership platforms and cross-border expansion."
          />
          <div className="mt-10">
            <Timeline />
          </div>
        </div>
      </section>


      {lightbox ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute top-6 right-6 rounded-full bg-white/20 p-3 text-white hover:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>
          <img src={lightbox} alt="" className="max-h-[85vh] w-auto rounded-3xl shadow-2xl" />
        </div>
      ) : null}

      <section className="section">
        <div className="container-x">
          <SectionHeading kicker="Why ET Media" title="Why Enterprises Choose Us" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "Business Networking", stat: stats[2]! },
              { icon: Compass, title: "Industry Intelligence", stat: stats[3]! },
              { icon: Sparkles, title: "Media Promotions", stat: stats[4]! },
              { icon: Target, title: "Strategic Growth", stat: stats[0]! },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <MouseTiltCard maxTilt={14} className="glass-card gradient-ring h-full rounded-3xl p-7 border border-border/80 text-center">
                  <span className="gradient-soft text-brand-blue inline-flex rounded-2xl p-3.5 mx-auto">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <p className="text-gradient mt-5 text-3xl font-extrabold font-display">
                    <CountUpNumber value={c.stat.value} suffix={c.stat.suffix} />
                  </p>
                  <h3 className="mt-2 text-base font-bold font-display">{c.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{c.stat.label}</p>
                </MouseTiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface section">
        <div className="container-x">
          <SectionHeading
            kicker="Leadership"
            title="The Team Behind The Platforms"
            description="Founder, leadership team, executive committee and advisors."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <MouseTiltCard maxTilt={10} className="glass-card h-full rounded-3xl p-7 text-center border border-border">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="mx-auto h-28 w-28 rounded-full object-cover shadow-md"
                  />
                  <h3 className="mt-5 text-base font-bold font-display">{m.name}</h3>
                  <p className="text-muted-foreground text-sm">{m.role}</p>
                  <a
                    href="https://www.linkedin.com/"
                    className="text-brand-blue mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  >
                    <Linkedin className="h-4 w-4" /> Connect
                  </a>
                </MouseTiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-4xl shadow-2xl">
              <img
                src={images.heroSummit}
                alt="ET Media corporate introduction"
                loading="lazy"
                width={1920}
                height={1080}
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-purple-950/70" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10">
                <h2 className="max-w-2xl text-3xl font-extrabold font-display text-white sm:text-5xl leading-tight">
                  Connect. Collaborate. Grow.
                </h2>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <MagneticButton strength={15} className="gradient-brand rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-lg">
                    <Link to="/contact">Contact Us</Link>
                  </MagneticButton>
                  <MagneticButton strength={15} className="glass-dark rounded-full px-8 py-3.5 text-sm font-semibold text-white border border-white/20">
                    <Link to="/events/partner">Become a Partner</Link>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
