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
    "relative py-2 text-sm font-semibold text-slate-800 transition-colors hover:text-cyan-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-[image:var(--gradient-brand)] after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200/80 transition-all duration-300 shadow-sm",
        scrolled ? "py-2.5 shadow-md" : "py-3.5",
      )}
    >
      <nav className="container-x flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center transition-transform hover:scale-[1.02]"
          onClick={() => setOpen(false)}
        >
          <img
            src={logo}
            alt="ET Media Business Intelligence"
            className="h-10 w-auto object-contain sm:h-12 md:h-13"
            width={320}
            height={150}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(linkClass, isActive ? "text-cyan-600 font-bold after:scale-x-100" : "")
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              cn(linkClass, isActive ? "text-cyan-600 font-bold after:scale-x-100" : "")
            }
          >
            About Us
          </NavLink>
          <NavLink
            to="/magazine"
            className={({ isActive }) =>
              cn(linkClass, isActive ? "text-cyan-600 font-bold after:scale-x-100" : "")
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
                  isActive ? "text-cyan-600 font-bold after:scale-x-100" : "",
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
                  className="absolute top-full left-1/2 w-[26rem] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl backdrop-blur-xl text-slate-900"
                >
                  {eventLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block rounded-2xl px-4 py-3 transition-colors hover:bg-slate-100"
                    >
                      <span className="block text-sm font-bold text-slate-900">{item.label}</span>
                      <span className="block text-xs text-slate-500">{item.desc}</span>
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              cn(linkClass, isActive ? "text-cyan-600 font-bold after:scale-x-100" : "")
            }
          >
            Contact Us
          </NavLink>
        </div>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 text-slate-600 xl:flex">
            <a
              href={contact.whatsapp}
              aria-label="WhatsApp"
              className="rounded-full p-2 transition-colors hover:bg-slate-100 hover:text-cyan-600"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={contact.linkedin}
              aria-label="LinkedIn"
              className="rounded-full p-2 transition-colors hover:bg-slate-100 hover:text-cyan-600"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={contact.instagram}
              aria-label="Instagram"
              className="rounded-full p-2 transition-colors hover:bg-slate-100 hover:text-cyan-600"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={contact.youtube}
              aria-label="YouTube"
              className="rounded-full p-2 transition-colors hover:bg-slate-100 hover:text-cyan-600"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>

          <Link
            to="/events/register"
            className="gradient-brand hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.04] sm:inline-flex"
          >
            Register
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-slate-200 bg-slate-100 p-2.5 text-slate-800 transition-colors hover:bg-slate-200 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="container-x overflow-hidden lg:hidden"
          >
            <div className="mt-3 space-y-1 rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl backdrop-blur-xl">
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
                  className="block rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 hover:text-cyan-600"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/events/register"
                onClick={() => setOpen(false)}
                className="gradient-brand mt-3 block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-md"
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
