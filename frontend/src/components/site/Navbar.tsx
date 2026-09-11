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
    "relative py-2 text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-[image:var(--gradient-brand)] after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass-card border-x-0 border-t-0 py-2 shadow-none" : "py-4",
      )}
    >
      <nav className="container-x flex items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 shrink-0 items-center" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="ET Media Business Intelligence"
            className="h-9 w-auto rounded-lg sm:h-11"
            width={320}
            height={150}
          />
        </Link>

        <div
          className={cn(
            "hidden items-center gap-8 lg:flex",
            scrolled ? "text-foreground" : "text-foreground",
          )}
        >
          <NavLink to="/" className={({ isActive }) => cn(linkClass, isActive && "text-primary")}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => cn(linkClass, isActive && "text-primary")}>
            About Us
          </NavLink>
          <NavLink to="/magazine" className={({ isActive }) => cn(linkClass, isActive && "text-primary")}>
            Executive Talks Magazine
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setEventsOpen(true)}
            onMouseLeave={() => setEventsOpen(false)}
          >
            <NavLink to="/events" className={({ isActive }) => cn(linkClass, "inline-flex items-center gap-1", isActive && "text-primary")}>
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
                  className="glass-card absolute top-full left-1/2 w-[26rem] -translate-x-1/2 rounded-3xl p-3"
                >
                  {eventLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="hover:bg-accent/70 block rounded-2xl px-4 py-3 transition-colors"
                    >
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="text-muted-foreground block text-xs">{item.desc}</span>
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <NavLink to="/contact" className={({ isActive }) => cn(linkClass, isActive && "text-primary")}>
            Contact Us
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-muted-foreground hidden items-center gap-1 xl:flex">
            <a
              href={contact.whatsapp}
              aria-label="WhatsApp"
              className="hover:text-primary rounded-full p-2 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={contact.linkedin}
              aria-label="LinkedIn"
              className="hover:text-primary rounded-full p-2 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={contact.instagram}
              aria-label="Instagram"
              className="hover:text-primary rounded-full p-2 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={contact.youtube}
              aria-label="YouTube"
              className="hover:text-primary rounded-full p-2 transition-colors"
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
            className="glass-card rounded-full p-2.5 lg:hidden"
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
            <div className="glass-card mt-3 space-y-1 rounded-3xl p-4">
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
                  className="hover:bg-accent/70 block rounded-2xl px-4 py-2.5 text-sm font-medium"
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
