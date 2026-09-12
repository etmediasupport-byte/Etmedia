import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Globe, MapPin, Sparkles } from "lucide-react";
import { images } from "@/lib/site-data";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnimatedGlobe } from "@/components/ui/AnimatedGlobe";
import { HeroLightRays } from "@/components/ui/HeroLightRays";

const heroBanners = [
  {
    id: 1,
    image: images.heroLeadership,
    kicker: "ENTER THE NEW ERA OF BUSINESS INTELLIGENCE",
    title: "Connecting Leaders • Creating Opportunities",
    description: "India's premier corporate platform bridging C-Suite executives, global capability centers, and commercial growth opportunities.",
    primaryCta: { label: "Explore Events", to: "/events" },
    secondaryCta: { label: "Partner With Us", to: "/events/partner" },
  },
  {
    id: 2,
    image: images.heroSummit,
    kicker: "NATIONAL CONCLAVES & SUMMITS",
    title: "India's Leading Leadership & Business Summit Platform",
    subtitle: "Bringing together corporate hubs and C-Suite leaders.",
    cities: ["Mumbai", "Bengaluru", "Hyderabad", "Delhi NCR", "Chennai", "Pune"],
    primaryCta: { label: "View Conclaves", to: "/events/upcoming" },
    secondaryCta: { label: "Register Delegate", to: "/events/register" },
  },
  {
    id: 3,
    image: images.heroAwards,
    kicker: "GLOBAL EXPANSION & NETWORK",
    title: "From India to Global Markets",
    destinations: ["India", "Dubai", "Bangkok", "Malaysia", "Europe"],
    description: "Extending corporate intelligence, executive networking, and strategic cross-border partnerships across Asia and Europe.",
    primaryCta: { label: "Global Platforms", to: "/events" },
    secondaryCta: { label: "Contact Us", to: "/contact" },
  },
];

export function HeroSection() {
  const [index, setIndex] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const banner = heroBanners[index]!;

  return (
    <section className="relative h-[95vh] min-h-[660px] w-full overflow-hidden lg:h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 border-b border-slate-200">
      {/* Full Vivid Light Mode Carousel Background Image Slide */}
      <AnimatePresence mode="sync">
        <motion.img
          key={index}
          src={banner.image}
          alt={banner.title}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.35, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1 }, scale: { duration: 6, ease: "linear" } }}
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-25"
          width={1920}
          height={1080}
        />
      </AnimatePresence>

      {/* Light Gradient Overlay for Content Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 via-60% to-slate-50/40 z-0" />

      {/* Ambient Light Beams */}
      <HeroLightRays />

      {/* Main Hero Container */}
      <div className="container-x relative flex h-full flex-col justify-center pt-24 z-10">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          {/* Text Content Column */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -25, filter: "blur(4px)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-3xl"
              >
                {/* Glowing Kicker Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-600 animate-pulse" />
                  <span className="text-xs font-extrabold tracking-[0.22em] text-cyan-800 uppercase font-btn">
                    {banner.kicker}
                  </span>
                </div>

                {/* Main Light Heading */}
                <h1 className="mt-5 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-[1.15] font-extrabold text-slate-900 font-display tracking-tight drop-shadow-sm">
                  {banner.title}
                </h1>

                {/* Subtitle / Destinations / Cities Rotator */}
                {banner.cities ? (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-cyan-700 flex items-center gap-1.5 font-btn">
                      <MapPin className="h-4 w-4 text-cyan-600" /> Rotating Hubs:
                    </span>
                    {banner.cities.map((city) => (
                      <span
                        key={city}
                        className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm hover:border-cyan-400 transition-colors"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                ) : banner.destinations ? (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-cyan-700 flex items-center gap-1.5 font-btn">
                      <Globe className="h-4 w-4 text-cyan-600" /> Global Footprint:
                    </span>
                    {banner.destinations.map((dest) => (
                      <span
                        key={dest}
                        className="rounded-full gradient-brand px-3.5 py-1 text-xs font-bold text-white shadow-sm"
                      >
                        {dest}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Description */}
                {banner.description && (
                  <p className="mt-6 max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed font-sans font-medium">
                    {banner.description}
                  </p>
                )}

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-wrap gap-4 items-center">
                  <MagneticButton
                    strength={20}
                    className="gradient-brand rounded-full px-8 py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
                  >
                    <Link to={banner.primaryCta.to} className="flex items-center gap-2">
                      <span>{banner.primaryCta.label}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </MagneticButton>

                  <MagneticButton
                    strength={15}
                    className="bg-white hover:bg-slate-50 rounded-full px-8 py-4 text-sm sm:text-base font-bold text-slate-800 border border-slate-300 shadow-sm transition-all duration-200"
                  >
                    <Link to={banner.secondaryCta.to}>
                      {banner.secondaryCta.label}
                    </Link>
                  </MagneticButton>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: COBE LIGHT MODE INTERACTIVE GLOBE */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <AnimatedGlobe />
          </div>
        </div>

        {/* 5-Second Timer Progress Indicators */}
        <div className="mt-14 flex items-center justify-between z-20 border-t border-slate-200/80 pt-4">
          <div className="flex items-center gap-3">
            {heroBanners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="relative h-2.5 rounded-full overflow-hidden transition-all duration-500 cursor-pointer"
                style={{ width: i === index ? "4.5rem" : "1.75rem", backgroundColor: "rgba(0, 0, 0, 0.12)" }}
              >
                {i === index && (
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full gradient-brand rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-slate-500 tracking-wider font-btn uppercase hidden sm:block">
            0{index + 1} / 0{heroBanners.length} Banners
          </span>
        </div>
      </div>

      {/* Animated Scroll Down Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-400 font-btn">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-5 rounded-full border-2 border-slate-500/60 p-1 flex justify-center backdrop-blur-sm"
        >
          <div className="h-2 w-1 rounded-full bg-cyan-400 animate-pulse" />
        </motion.div>
      </div>
    </section>
  );
}
