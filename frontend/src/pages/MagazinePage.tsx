import { motion } from "framer-motion";
import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { images, magazineCategories, magazines } from "@/lib/site-data";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, SectionHeading } from "@/components/site/primitives";



function Flipbook() {
  const [page, setPage] = useState(0);
  const spreads = magazines.slice(0, 4);
  const current = spreads[page]!;

  return (
    <div className="glass-card rounded-4xl p-6 sm:p-10">
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="[perspective:1800px]">
          <motion.div
            key={page}
            initial={{ rotateY: -85, opacity: 0.2 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md origin-left [transform-style:preserve-3d]"
          >
            <img
              src={current.cover}
              alt={`${current.title} page`}
              loading="lazy"
              width={912}
              height={1200}
              className="w-full rounded-2xl object-cover shadow-[0_50px_90px_-45px_rgba(0,0,0,0.55)]"
            />
            <div className="absolute inset-y-0 left-0 w-8 rounded-l-2xl bg-[linear-gradient(90deg,rgba(0,0,0,0.25),transparent)]" />
          </motion.div>
        </div>
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
            {current.issue} · {current.category}
          </p>
          <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{current.title}</h3>
          <p className="text-muted-foreground mt-3">{current.date}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPage((p) => (p - 1 + spreads.length) % spreads.length)}
              className="hover:bg-accent inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => (p + 1) % spreads.length)}
              className="gradient-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            >
              Next page <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => toast("Fullscreen reader opens on publish")}
              className="hover:bg-accent inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
            >
              <Maximize2 className="h-4 w-4" /> Fullscreen
            </button>
          </div>
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {spreads.map((s, i) => (
              <button
                key={s.issue}
                type="button"
                onClick={() => setPage(i)}
                className={`h-20 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  i === page ? "border-primary" : "border-transparent opacity-60"
                }`}
              >
                <img src={s.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MagazinePage() {
  const featured = magazines[0]!;

  return (
    <>
      <PageHero
        crumb="Executive Talks Magazine"
        title="Executive Talks Magazine"
        subtitle="A premium library of leadership interviews, sector intelligence and boardroom perspectives."
        image={images.magazineCover}
      />

      <section className="section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="[perspective:1600px]">
              <motion.div
                initial={{ rotateY: -30 }}
                animate={{ rotateY: [-30, -14, -30] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ rotateY: -4, scale: 1.04 }}
                className="relative mx-auto w-72 sm:w-96 [transform-style:preserve-3d]"
              >
                <div className="bg-muted absolute inset-y-4 -right-5 rounded-r-2xl [transform:rotateY(-16deg)_translateZ(-30px)]" />
                <div className="bg-secondary absolute inset-y-2 -right-2.5 rounded-r-2xl [transform:rotateY(-9deg)_translateZ(-15px)]" />
                <img
                  src={featured.cover}
                  alt={`${featured.title} cover`}
                  loading="lazy"
                  width={912}
                  height={1200}
                  className="relative rounded-2xl shadow-[0_60px_100px_-45px_rgba(0,0,0,0.6)]"
                />
              </motion.div>
            </div>
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              kicker={`Featured · ${featured.issue}`}
              title={featured.title}
              description="Our latest issue explores how India's leadership teams are balancing growth, governance and technology in a volatile decade."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => toast.success("Opening the online reader")}
                className="gradient-brand inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
              >
                <BookOpen className="h-4 w-4" /> Read Online
              </button>
              <button
                type="button"
                onClick={() => toast("PDF download will be available shortly")}
                className="hover:bg-accent inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface section">
        <div className="container-x">
          <SectionHeading
            kicker="Flipbook Viewer"
            title="Turn The Pages"
            description="Page-turn animation with thumbnail navigation, swipe support and fullscreen reading."
          />
          <Reveal className="mt-12">
            <Flipbook />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading kicker="Categories" title="Read By Sector" />
          <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
            {magazineCategories.map((c) => (
              <span
                key={c}
                className="glass-card hover:text-primary cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                {c}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-surface section">
        <div className="container-x">
          <SectionHeading kicker="Archives" title="Every Issue, One Library" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {magazines.map((m, i) => (
              <Reveal key={m.issue} delay={i * 0.06}>
                <article className="glass-card lift gradient-ring group h-full overflow-hidden rounded-3xl">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={m.cover}
                      alt={`${m.title} cover`}
                      loading="lazy"
                      width={912}
                      height={1200}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                      {m.issue} · {m.date}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{m.title}</h3>
                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => toast.success(`Opening ${m.issue}`)}
                        className="gradient-brand rounded-full px-5 py-2 text-sm font-semibold text-white"
                      >
                        Read Now
                      </button>
                      <button
                        type="button"
                        onClick={() => toast("Download starting soon")}
                        className="hover:bg-accent rounded-full border border-border px-5 py-2 text-sm font-semibold"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal>
            <div className="gradient-brand rounded-4xl px-8 py-14 text-center text-white sm:px-16">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Subscribe to Executive Talks
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/85">
                Every issue delivered to your inbox, free for verified business professionals.
              </p>
              <form
                className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("You're subscribed to Executive Talks");
                  e.currentTarget.reset();
                }}
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Your work email"
                  aria-label="Email address"
                  className="glass-dark min-w-0 flex-1 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[color:var(--brand-purple)]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
