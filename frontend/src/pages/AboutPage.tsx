import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Award,
  BookOpen,
  Building2,
  Compass,
  Crown,
  Eye,
  Handshake,
  HeartHandshake,
  Linkedin,
  Megaphone,
  Rocket,
  Sparkles,
  Target,
  Users,
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

const whatWeDoSteps = [
  {
    step: "01",
    title: "Leadership Conferences & Summits",
    desc: "Curated national conclaves bringing together CXO decision-makers, thought leaders, and policymakers.",
    icon: Crown,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    step: "02",
    title: "Executive Networking Platforms",
    desc: "Closed-door networking dinners and peer discussions engineered for senior enterprise leaders.",
    icon: Users,
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    step: "03",
    title: "Industry Awards & Recognition",
    desc: "Benchmarking excellence to honor benchmark corporations, industry pioneers, and leadership teams.",
    icon: Award,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    step: "04",
    title: "Product & Brand Launch Events",
    desc: "High-impact unveilings designed to present enterprise tech solutions directly to decision makers.",
    icon: Rocket,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    step: "05",
    title: "Corporate Branding & Promotions",
    desc: "Multi-channel media amplification across Executive Talks Magazine and premium digital platforms.",
    icon: Megaphone,
    gradient: "from-pink-500 to-purple-600",
  },
  {
    step: "06",
    title: "Workshops & Knowledge Sessions",
    desc: "Interactive masterclasses and strategic roundtables built around researched corporate agendas.",
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    step: "07",
    title: "Startup & Innovation Connect",
    desc: "Bridging high-growth technology startups with corporate enterprise sponsors, GCCs, and investors.",
    icon: Sparkles,
    gradient: "from-cyan-600 to-indigo-600",
  },
  {
    step: "08",
    title: "Strategic Business Networking",
    desc: "Engineered 1-on-1 meeting ecosystems that translate initial introductions into commercial partnerships.",
    icon: Handshake,
    gradient: "from-blue-600 to-purple-600",
  },
];

const team = [
  { name: "Srinivas Reddy", role: "Founder & Managing Director", image: images.aboutOffice },
  { name: "Kavya Menon", role: "Director — Conferences", image: images.eventHr },
  { name: "Arjun Nair", role: "Head of Partnerships", image: images.eventCfo },
  { name: "Priya Sharma", role: "Editor, Executive Talks", image: images.magazineCover },
];

export default function AboutPage() {

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
                    className={`h-52 w-full rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-none rounded-bl-none ${i % 3 === 0 ? "mt-8" : ""}`}
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
                <MouseTiltCard maxTilt={12} className="glass-card gradient-ring h-full rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-none rounded-bl-none p-8 border border-border/80">
                  <div>
                    <div className="w-12 h-12 rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none gradient-brand text-white flex items-center justify-center shadow-md shrink-0">
                      <p.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold font-display">{p.title}</h3>
                    <p className="text-muted-foreground mt-3 text-base leading-relaxed">{p.body}</p>
                  </div>
                </MouseTiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface/50 border-y border-border/80 relative overflow-hidden">
        <div className="container-x relative z-10">
          <SectionHeading
            kicker="What We Do"
            title="Eight Ways We Put Your Brand In The Right Room"
            description="Our proven platform ecosystem engineered to connect decision makers with high-value commercial outcomes."
            align="left"
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDoSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.05}>
                <MouseTiltCard
                  maxTilt={10}
                  className="glass-card gradient-ring group h-full rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-none rounded-bl-none p-6 border border-border/80 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div>
                    {/* Top Row: Step Number Badge + Gradient Icon Box */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-black font-display uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
                        Step {step.step}
                      </span>
                      <div className={`p-3 rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none text-white bg-gradient-to-r shadow-md group-hover:scale-110 transition-transform ${step.gradient}`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold font-display text-foreground leading-snug group-hover:text-cyan-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed font-sans text-justify">
                      {step.desc}
                    </p>
                  </div>
                </MouseTiltCard>
              </Reveal>
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
                <MouseTiltCard maxTilt={10} className="glass-card h-full rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-none rounded-bl-none p-7 text-center border border-border">
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

    </>
  );
}
