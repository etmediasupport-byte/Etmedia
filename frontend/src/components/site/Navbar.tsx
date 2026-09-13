import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Menu,
  Search,
  X,
  Calendar,
  Award,
  Users,
  Handshake,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { events } from "@/lib/site-data";

const megaEventCategories = [
  {
    icon: Calendar,
    title: "Upcoming Conferences",
    desc: "India CFO Summit, HR Excellence & AI Tech Conclave",
    to: "/events/upcoming",
  },
  {
    icon: Award,
    title: "Past Events & Recaps",
    desc: "Galleries, keynotes, recaps and delegate outcomes",
    to: "/events/past",
  },
  {
    icon: Users,
    title: "Delegate Registration",
    desc: "Reserve seats for senior executives and leaders",
    to: "/events/register",
  },
  {
    icon: Handshake,
    title: "Partner & Sponsorship",
    desc: "Sponsorship tiers, exhibition booths and media visibility",
    to: "/events/partner",
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventsMegaOpen, setEventsMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard shortcut listener for Esc key to close search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter search results dynamically
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchResultClick = (path: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(path);
  };

  const navLinkStyle = (isActive: boolean) =>
    cn(
      "relative py-1.5 text-xs xl:text-sm font-semibold font-btn transition-colors duration-200 cursor-pointer whitespace-nowrap text-slate-800 hover:text-cyan-600",
      "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-cyan-500 after:to-purple-500 after:transition-transform after:duration-300 hover:after:scale-x-100",
      isActive && "text-cyan-600 font-extrabold after:scale-x-100"
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-2xl border-b border-slate-200 py-2.5 shadow-md shadow-slate-200/50"
            : "bg-white/80 backdrop-blur-xl border-b border-slate-200/80 py-3.5 shadow-sm"
        )}
      >
        <nav className="container-x flex items-center justify-between gap-2 lg:gap-4">
          {/* LEFT: ET Media Logo */}
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center transition-transform hover:scale-[1.03]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src={logo}
              alt="ET Media Business Intelligence"
              className="h-10 sm:h-12 w-auto object-contain rounded-lg shadow-sm"
              width={260}
              height={100}
            />
          </Link>

          {/* CENTER: Navigation Links Single Row */}
          <div className="hidden items-center gap-3 lg:gap-4 xl:gap-6 lg:flex">
            <NavLink to="/" className={({ isActive }) => navLinkStyle(isActive)}>
              Home
            </NavLink>

            <NavLink to="/about" className={({ isActive }) => navLinkStyle(isActive)}>
              About Us
            </NavLink>

            {/* MEGA DROPDOWN: Events */}
            <div
              className="relative"
              onMouseEnter={() => setEventsMegaOpen(true)}
              onMouseLeave={() => setEventsMegaOpen(false)}
            >
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  cn(navLinkStyle(isActive), "inline-flex items-center gap-1")
                }
              >
                Events
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    eventsMegaOpen && "rotate-180 text-cyan-600"
                  )}
                />
              </NavLink>

              <AnimatePresence>
                {eventsMegaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[34rem] mt-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl backdrop-blur-2xl text-slate-900 z-50"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-600" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-800 font-display">
                          ET Media Business Intelligence Conferences
                        </span>
                      </div>
                      <Link
                        to="/events"
                        className="text-xs font-bold text-cyan-700 hover:underline flex items-center gap-1"
                      >
                        All Events <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {megaEventCategories.map((cat) => (
                        <Link
                          key={cat.to}
                          to={cat.to}
                          onClick={() => setEventsMegaOpen(false)}
                          className="group flex flex-col p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-cyan-50/80 hover:border-cyan-300 transition-all duration-200 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="gradient-brand p-2 rounded-xl text-white group-hover:scale-110 transition-transform shadow-sm">
                              <cat.icon className="h-4 w-4" />
                            </span>
                            <span className="text-sm font-bold font-btn text-slate-900 group-hover:text-cyan-700 transition-colors">
                              {cat.title}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-600 leading-snug">
                            {cat.desc}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/events/partner" className={({ isActive }) => navLinkStyle(isActive)}>
              Partner With Us
            </NavLink>

            <NavLink to="/magazine" className={({ isActive }) => navLinkStyle(isActive)}>
              Executive Talks Magazine
            </NavLink>

            <NavLink to="/delegate-registration" className={({ isActive }) => navLinkStyle(isActive)}>
              Delegate Registration
            </NavLink>

            <NavLink to="/contact" className={({ isActive }) => navLinkStyle(isActive)}>
              Careers
            </NavLink>

            <NavLink to="/contact" className={({ isActive }) => navLinkStyle(isActive)}>
              Contact Us
            </NavLink>
          </div>

          {/* RIGHT: Search Icon • Glowing Register Button • Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Search Icon Button */}
            <button
              type="button"
              aria-label="Search site"
              onClick={() => setSearchOpen(true)}
              className={cn(
                "p-2.5 rounded-full border transition-all duration-200 cursor-pointer shadow-sm",
                scrolled
                  ? "border-slate-200 bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-300"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-cyan-300"
              )}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Glowing Register CTA Button */}
            <MagneticButton
              strength={18}
              className="relative gradient-brand rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_0_22px_rgba(0,174,239,0.55)] hover:shadow-[0_0_30px_rgba(20,198,248,0.8)] transition-all duration-300"
            >
              <Link to="/events/register" className="flex items-center gap-1.5">
                <span>Register</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </MagneticButton>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={cn(
                "p-2.5 rounded-full border lg:hidden cursor-pointer",
                scrolled
                  ? "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* MOBILE NAV DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="container-x overflow-hidden lg:hidden"
            >
              <div className="mt-3 space-y-2 rounded-3xl border border-slate-200 bg-white/98 p-5 text-slate-900 shadow-2xl backdrop-blur-2xl">
                {[
                  { to: "/", label: "Home" },
                  { to: "/about", label: "About Us" },
                  { to: "/events", label: "Events" },
                  { to: "/events/partner", label: "Partner With Us" },
                  { to: "/magazine", label: "Executive Talks Magazine" },
                  { to: "/events/register", label: "Delegate Registration" },
                  { to: "/contact", label: "Careers" },
                  { to: "/contact", label: "Contact Us" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-2xl px-4 py-2.5 text-sm font-semibold font-btn text-slate-800 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/events/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gradient-brand mt-4 block rounded-2xl px-4 py-3 text-center text-sm font-bold font-btn text-white shadow-lg"
                >
                  Register Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SEARCH POPUP MODAL */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-md"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl z-10"
            >
              {/* Search Bar Input Header */}
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <Search className="h-6 w-6 text-cyan-600 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search conferences, magazines, speakers, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-lg font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Results Container */}
              <div className="mt-5 max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                {searchQuery.trim() === "" ? (
                  <div className="py-6 text-center text-slate-500">
                    <p className="text-xs uppercase tracking-wider text-cyan-700 font-bold mb-3">Popular Searches</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["CFO Leadership Summit", "HR Excellence Awards", "Enterprise Tech Conclave", "Executive Talks Magazine", "Delegate Registration"].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setSearchQuery(term)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-cyan-700 font-bold mb-3">Matching Events</p>
                    <div className="grid gap-3">
                      {filteredEvents.map((evt) => (
                        <div
                          key={evt.slug}
                          onClick={() => handleSearchResultClick(`/events/${evt.slug}`)}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-cyan-50/70 hover:border-cyan-300 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="gradient-brand p-2.5 rounded-xl text-white shadow-sm">
                              <Calendar className="h-4 w-4" />
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 font-display">
                                {evt.title}
                              </h4>
                              <p className="text-xs text-slate-500">
                                {evt.date} • {evt.city}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    <p className="text-sm">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching for CFO, HR, Tech, or Magazine</p>
                  </div>
                )}

                {/* Quick Link Pages */}
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <p className="text-xs uppercase tracking-wider text-cyan-700 font-bold mb-3 font-display">Quick Pages</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "About ET Media", path: "/about", icon: Sparkles },
                      { label: "Executive Talks Magazine", path: "/magazine", icon: BookOpen },
                      { label: "Delegate Registration", path: "/events/register", icon: Users },
                      { label: "Partner & Sponsorship", path: "/events/partner", icon: Handshake },
                    ].map((pg) => (
                      <div
                        key={pg.path}
                        onClick={() => handleSearchResultClick(pg.path)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-cyan-700 transition-colors cursor-pointer"
                      >
                        <pg.icon className="h-3.5 w-3.5 text-cyan-600" />
                        <span>{pg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
