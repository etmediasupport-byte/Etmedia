import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export function PageHero({
  title,
  subtitle,
  image,
  crumb,
}: {
  title: string;
  subtitle: string;
  image: string;
  crumb: string;
}) {
  return (
    <section className="relative flex min-h-[42vh] sm:min-h-[46vh] items-end overflow-hidden pt-36 sm:pt-40 md:pt-44 pb-12 sm:pb-16">
      <img
        src={image}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,oklch(0.13_0.02_265/0.92),oklch(0.36_0.198_291.5/0.75))]" />
      <div className="container-x relative z-10">
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-white/80 uppercase mb-3"
        >
          <Link to="/" className="hover:text-cyan-300 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-cyan-300 font-extrabold">{crumb}</span>
        </motion.nav>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-[1.1]"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-3xl text-sm sm:text-base lg:text-lg text-white/90 font-medium leading-relaxed font-sans"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
