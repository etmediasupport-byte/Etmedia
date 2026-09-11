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
    <section className="relative flex min-h-[60vh] items-end overflow-hidden pt-28 pb-16">
      <img
        src={image}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,oklch(0.13_0.02_265/0.9),oklch(0.36_0.198_291.5/0.7))]" />
      <div className="container-x relative">
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs tracking-[0.16em] text-white/70 uppercase"
        >
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">{crumb}</span>
        </motion.nav>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-4xl text-4xl leading-[1.05] font-semibold text-white sm:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
