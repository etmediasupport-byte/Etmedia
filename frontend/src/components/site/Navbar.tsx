import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  LayoutGrid,
  Home,
  Building2,
  Briefcase,
  Phone,
} from "lucide-react";
import logoTransparent from "@/assets/logo-transparent.svg";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { events } from "@/lib/site-data";

const waffleMenuItems = [
  { to: "/", label: "Home", icon: Home, color: "from-cyan-500 to-blue-600" },
  { to: "/about", label: "About Us", icon: Building2, color: "from-purple-500 to-indigo-600" },
  { to: "/events", label: "Events", icon: Calendar, color: "from-blue-500 to-cyan-600" },
  { to: "/partner", label: "Partner With Us", icon: Handshake, color: "from-emerald-500 to-teal-600" },
  { to: "/magazine", label: "Executive Talks", icon: BookOpen, color: "from-pink-500 to-purple-600" },
  { to: "/delegate-registration", label: "Delegate Pass", icon: Users, color: "from-amber-500 to-orange-600" },
  { to: "/careers", label: "Careers", icon: Briefcase, color: "from-cyan-600 to-indigo-600" },
  { to: "/contact", label: "Contact Us", icon: Phone, color: "from-blue-600 to-purple-600" },
];

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
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventsMegaOpen, setEventsMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Initial website load animation timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);



  // Global custom event listener for "navbar-loading"
  useEffect(() => {
    const handleNavbarLoading = (e: Event) => {
      const customEv = e as CustomEvent<{ loading?: boolean; duration?: number }>;
      const active = customEv.detail?.loading ?? true;
      setIsLoading(active);
      if (active) {
        const dur = customEv.detail?.duration || 1500;
        setTimeout(() => setIsLoading(false), dur);
      }
    };

    window.addEventListener("navbar-loading", handleNavbarLoading);
    return () => window.removeEventListener("navbar-loading", handleNavbarLoading);
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
    if ((window as any).__lenis) {
      (window as any).__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
    navigate(path);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setEventsMegaOpen(false);
    if ((window as any).__lenis) {
      (window as any).__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
  };

  const navLinkStyle = (isActive: boolean) =>
    cn(
      "relative py-1.5 text-[11px] lg:text-xs xl:text-sm font-semibold font-btn transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 text-slate-200 hover:text-cyan-400",
      "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-cyan-400 after:to-purple-500 after:transition-transform after:duration-300 hover:after:scale-x-100",
      isActive && "text-cyan-400 font-extrabold after:scale-x-100"
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          isLoading
            ? "bg-black border-b border-cyan-500/50 shadow-[0_4px_30px_rgba(0,174,239,0.35)] animate-navbar-loading"
            : "bg-black border-b border-zinc-800",
          scrolled
            ? "py-2.5 shadow-lg shadow-black/80"
            : "py-3 shadow-md shadow-black/40"
        )}
      >
        {/* Animated Scanning Beam on Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 shadow-[0_0_15px_#00AEEF] z-50 origin-left animate-pulse"
            />
          )}
        </AnimatePresence>
        <nav className="container-x flex items-center justify-between gap-2 lg:gap-3 xl:gap-5">
          {/* LEFT: ET Media Logo */}
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center bg-transparent transition-transform hover:scale-[1.03]"
            onClick={handleNavClick}
          >
            <img
              src={logoTransparent}
              alt="ET Media Business Intelligence"
              className="h-9 sm:h-11 lg:h-12 w-auto object-contain bg-transparent border-none shadow-none"
              width={280}
              height={110}
            />
          </Link>

          {/* CENTER: Navigation Links Single Row */}
          <div className="hidden items-center gap-3 xl:gap-5 xl:flex shrink-0">
            <NavLink to="/" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              Home
            </NavLink>

            <NavLink to="/about" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              About Us
            </NavLink>

            {/* MEGA DROPDOWN: Events */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => setEventsMegaOpen(true)}
              onMouseLeave={() => setEventsMegaOpen(false)}
            >
              <NavLink
                to="/events"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(navLinkStyle(isActive), "inline-flex items-center gap-1")
                }
              >
                Events
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    eventsMegaOpen && "rotate-180 text-cyan-400"
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
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[34rem] mt-2 rounded-3xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-2xl text-slate-100 z-50"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 font-display">
                          ET Media Business Intelligence Conferences
                        </span>
                      </div>
                      <Link
                        to="/events"
                        onClick={handleNavClick}
                        className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        All Events <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {megaEventCategories.map((cat) => (
                        <Link
                          key={cat.to}
                          to={cat.to}
                          onClick={handleNavClick}
                          className="group flex flex-col p-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 hover:border-cyan-500/50 transition-all duration-200 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="gradient-brand p-2 rounded-xl text-white group-hover:scale-110 transition-transform shadow-sm">
                              <cat.icon className="h-4 w-4" />
                            </span>
                            <span className="text-sm font-bold font-btn text-slate-100 group-hover:text-cyan-400 transition-colors">
                              {cat.title}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-400 leading-snug">
                            {cat.desc}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/partner" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              Partner With Us
            </NavLink>

            <NavLink to="/magazine" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              Executive Talks Magazine
            </NavLink>

            <NavLink to="/delegate-registration" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              Delegate Registration
            </NavLink>

            <NavLink to="/careers" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              Careers
            </NavLink>

            <NavLink to="/contact" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              Contact Us
            </NavLink>
          </div>

          {/* RIGHT: Glowing Register Button • Waffle Mobile Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Glowing Register CTA Button */}
            <MagneticButton
              strength={18}
              className="relative shrink-0 whitespace-nowrap gradient-brand rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-[0_4px_18px_rgba(0,174,239,0.4)] hover:shadow-[0_6px_25px_rgba(0,174,239,0.7)] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-register-modal"))}
                className="flex items-center gap-1.5 font-btn cursor-pointer bg-transparent border-none text-white text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap">Register Now</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </MagneticButton>

            {/* Mobile/Tablet Waffle Menu Toggle Button */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-zinc-800 bg-zinc-900 text-slate-200 hover:bg-zinc-800 hover:text-white xl:hidden cursor-pointer transition-colors shadow-sm"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-cyan-400" />
              ) : (
                <LayoutGrid className="h-5 w-5 text-cyan-400" />
              )}
              <span className="text-xs font-bold font-btn hidden sm:inline">Menu</span>
            </button>
          </div>
        </nav>

        {/* MOBILE & TABLET WAFFLE GRID MENU DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="container-x overflow-hidden xl:hidden pb-4"
            >
              <div className="mt-2 rounded-3xl border border-zinc-800 bg-zinc-950/98 p-4 text-slate-100 shadow-2xl backdrop-blur-2xl max-h-[80vh] overflow-y-auto space-y-4">
                {/* Waffle Menu Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 font-display">
                      ET Media Navigation
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Select Portal
                  </span>
                </div>

                {/* 2-Column Waffle Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {waffleMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={handleNavClick}
                      className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-zinc-800/90 bg-zinc-900/80 hover:bg-zinc-800 hover:border-cyan-500/50 transition-all duration-200 text-center shadow-xs"
                    >
                      <div className={cn("p-2.5 rounded-xl text-white bg-gradient-to-r shadow-md group-hover:scale-110 transition-transform mb-2", item.color)}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold font-btn text-slate-200 group-hover:text-cyan-400 transition-colors leading-tight">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Register CTA Banner */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("open-register-modal"));
                  }}
                  className="gradient-brand w-full rounded-2xl px-4 py-3 text-center text-sm font-extrabold font-btn text-white shadow-lg cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  <span>Register For Executive Summit</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
