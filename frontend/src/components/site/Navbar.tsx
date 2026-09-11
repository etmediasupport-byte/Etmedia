import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown, Instagram, Linkedin, Menu, MessageCircle, X, Youtube } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { contact } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const eventLinks = [
  { to: "/events/upcoming", label: "Upcoming Events", desc: "Conferences open for registration" },
  { to: "/events/past", label: "Past Events", desc: "Galleries, recaps and outcomes" },
  { to: "/events/register", label: "Register with ET Media", desc: "Reserve your delegate seat" },
  { to: "/events/partner", label: "Partner & Sponsorship", desc: "Packages and brand visibility" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass =
    "relative py-2 text-sm font-medium text-white/80 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-[image:var(--gradient-brand)] after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-slate-950/85 border-b border-white/10 py-3 backdrop-blur-xl shadow-2xl"
          : "bg-slate-950/40 border-b border-white/5 py-4 backdrop-blur-md",
      )}
    >
      <nav className="container-x flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center rounded-full bg-white px-3.5 py-1.5 shadow-sm transition-transform hover:scale-[1.02]"
          onClick={() => setOpen(false)}
        >
          <img
            src={logo}
            alt="ET Media Business Intelligence"
            className="h-7 w-auto object-contain sm:h-8"
            width={320}
            height={150}
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(linkClass, isActive ? "text-sky-400 font-semibold after:scale-x-100" : "")
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              cn(linkClass, isActive ? "text-sky-400 font-semibold after:scale-x-100" : "")
            }
          >
            About Us
          </NavLink>
          <NavLink
            to="/magazine"
            className={({ isActive }) =>
              cn(linkClass, isActive ? "text-sky-400 font-semibold after:scale-x-100" : "")
            }
          >
            Executive Talks Magazine
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setEventsOpen(true)}
            onMouseLeave={() => setEventsOpen(false)}
          >
            <NavLink
              to="/events"
              className={({ isActive }) =>
                cn(
                  linkClass,
                  "inline-flex items-center gap-1",
                  isActive ? "text-sky-400 font-semibold after:scale-x-100" : "",
                )
              }
            >
              Events
              <ChevronDown className="h-4 w-4" />
            </NavLink>
            <AnimatePresence>
              {eventsOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full left-1/2 w-[26rem] -translate-x-1/2 rounded-3xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl text-white"
                >
                  {eventLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block rounded-2xl px-4 py-3 transition-colors hover:bg-white/10"
                    >
                      <span className="block text-sm font-semibold text-white">{item.label}</span>
                      <span className="block text-xs text-white/70">{item.desc}</span>
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              cn(linkClass, isActive ? "text-sky-400 font-semibold after:scale-x-100" : "")
            }
          >
            Contact Us
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 text-white/70 xl:flex">
            <a
              href={contact.whatsapp}
              aria-label="WhatsApp"
              className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={contact.linkedin}
              aria-label="LinkedIn"
              className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={contact.instagram}
              aria-label="Instagram"
              className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={contact.youtube}
              aria-label="YouTube"
              className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
          <Link
            to="/events/register"
            className="gradient-brand hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-luxe transition-transform hover:scale-[1.04] sm:inline-flex"
          >
            Register
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-white/10 bg-white/10 p-2.5 text-white hover:bg-white/20 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="container-x overflow-hidden lg:hidden"
          >
            <div className="mt-3 space-y-1 rounded-3xl border border-white/10 bg-slate-900/95 p-4 text-white backdrop-blur-xl shadow-2xl">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/magazine", label: "Executive Talks Magazine" },
                { to: "/events", label: "Events" },
                ...eventLinks.map((e) => ({ to: e.to, label: `— ${e.label}` })),
                { to: "/contact", label: "Contact Us" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/events/register"
                onClick={() => setOpen(false)}
                className="gradient-brand mt-2 block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Register Now
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
