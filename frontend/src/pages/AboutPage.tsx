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
import { Counter, Reveal, SectionHeading } from "@/components/site/primitives";



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

      <section className="section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              {[images.aboutOffice, images.heroNetworking, images.eventHr, images.heroSummit].map(
                (src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="ET Media events and workspaces"
                    loading="lazy"
                    width={1200}
                    height={800}
                    className={`h-48 w-full rounded-3xl object-cover ${i % 3 === 0 ? "mt-8" : ""}`}
                  />
                ),
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              Our Story
            </span>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Built On Conversations That Change Businesses
            </h2>
            <div className="text-muted-foreground mt-6 space-y-4 leading-relaxed">
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
              <p>
                Alongside events, our media arm — <em>Executive Talks Magazine</em> — carries those
                conversations to a digital audience of over five million business professionals,
                giving partner brands sustained visibility well beyond event day.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface section">
        <div className="container-x">
          <SectionHeading kicker="What Drives Us" title="Mission, Vision & Values" />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="glass-card gradient-ring lift h-full rounded-3xl p-8">
                  <span className="gradient-brand inline-flex rounded-2xl p-3 text-white">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">{p.body}</p>
                </div>
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
          <div className="mt-14 grid gap-x-12 gap-y-2 md:grid-cols-2">
            {whatWeDo.map((item, i) => (
              <Reveal key={item} delay={i * 0.04}>
                <div className="relative flex gap-5 py-5 pl-2">
                  <span className="gradient-brand relative mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                    {String(i + 1).padStart(2, "0")}
                    <span className="bg-border absolute top-full left-1/2 h-full w-px -translate-x-1/2" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">{item}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Curated formats, verified audiences and full media amplification.
                    </p>
                  </div>
                </div>
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
                className="mb-5 block w-full overflow-hidden rounded-3xl"
              >
                <img
                  src={src}
                  alt="ET Media event"
                  loading="lazy"
                  width={1200}
                  height={800}
                  className={`w-full object-cover transition-transform duration-700 hover:scale-110 ${
                    i % 3 === 1 ? "h-80" : "h-56"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute top-6 right-6 rounded-full bg-white/15 p-3 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={lightbox} alt="" className="max-h-[85vh] w-auto rounded-3xl" />
        </div>
      ) : null}

      <section className="section">
        <div className="container-x">
          <SectionHeading kicker="Why ET Media" title="Why Enterprises Choose Us" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "Business Networking", stat: stats[2]! },
              { icon: Compass, title: "Industry Intelligence", stat: stats[3]! },
              { icon: Sparkles, title: "Media Promotions", stat: stats[4]! },
              { icon: Target, title: "Strategic Growth", stat: stats[0]! },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="glass-card lift h-full rounded-3xl p-7">
                  <span className="gradient-soft text-primary inline-flex rounded-2xl p-3">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <p className="text-gradient mt-5 text-3xl font-bold">
                    <Counter value={c.stat.value} suffix={c.stat.suffix} />
                  </p>
                  <h3 className="mt-1 text-base font-semibold">{c.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{c.stat.label}</p>
                </div>
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
                <div className="glass-card lift h-full rounded-3xl p-6 text-center">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="mx-auto h-28 w-28 rounded-full object-cover"
                  />
                  <h3 className="mt-5 text-base font-semibold">{m.name}</h3>
                  <p className="text-muted-foreground text-sm">{m.role}</p>
                  <a
                    href="https://www.linkedin.com/"
                    className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    <Linkedin className="h-4 w-4" /> Connect
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-4xl">
              <img
                src={images.heroSummit}
                alt="ET Media corporate introduction"
                loading="lazy"
                width={1920}
                height={1080}
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,oklch(0.13_0.02_265/0.85),oklch(0.36_0.198_291.5/0.5))]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <h2 className="max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
                  Connect. Collaborate. Grow.
                </h2>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/contact"
                    className="gradient-brand rounded-full px-7 py-3.5 text-sm font-semibold text-white"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/events/partner"
                    className="glass-dark rounded-full px-7 py-3.5 text-sm font-semibold text-white"
                  >
                    Become a Partner
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
