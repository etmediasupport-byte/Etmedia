import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Menu,
  X,
  Calendar,
  Award,
  Users,
  Handshake,
  BookOpen,
  ArrowRight,
  Sparkles,
  Home,
  Building2,
  Briefcase,
  Phone,
  Crown,
} from "lucide-react";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";
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
    isRegister: true,
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

  // Ultra-clean, premium active link styling
  const navLinkStyle = (isActive: boolean) =>
    cn(
      "relative px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold font-btn transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
      isActive
        ? "text-cyan-700 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border border-cyan-500/30 shadow-[0_2px_10px_rgba(6,182,212,0.15)] font-extrabold"
        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 border border-transparent"
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
          isLoading && "border-b-cyan-500 shadow-[0_4px_25px_rgba(0,174,239,0.25)] animate-navbar-loading",
          scrolled ? "py-2 sm:py-2.5 shadow-md shadow-slate-200/50 bg-white/98" : "py-2.5 sm:py-3.5"
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

        <nav className="container-x flex items-center justify-between gap-2 lg:gap-3 xl:gap-4">
          {/* LEFT: Executive Talks Media Logo */}
          <Link
            to="/"
            className="flex min-w-0 shrink-0 items-center transition-transform hover:scale-[1.02]"
            onClick={handleNavClick}
          >
            <img
              src={executivetalksLogo}
              alt="Executive Talks Media"
              className="h-9 sm:h-10 md:h-11 lg:h-11.5 xl:h-12 w-auto object-contain border-none shadow-none transition-all duration-300"
            />
          </Link>

          {/* CENTER: Navigation Links Single Row (Desktop & Laptop) */}
          <div className="hidden items-center gap-1.5 lg:gap-2 xl:gap-3 lg:flex shrink-0">
            <NavLink to="/" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Home</span>
                </>
              )}
            </NavLink>

            <NavLink to="/about" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>About</span>
                </>
              )}
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
                  cn(navLinkStyle(isActive || location.pathname.startsWith("/events")), "inline-flex items-center gap-1.5")
                }
              >
                {location.pathname.startsWith("/events") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                )}
                <span>Events</span>
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
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[32rem] mt-2 rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-2xl p-4 shadow-2xl text-slate-900 z-50"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-600" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-700 font-display">
                          Executive Talks Business Summits
                        </span>
                      </div>
                      <Link
                        to="/events"
                        onClick={handleNavClick}
                        className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1"
                      >
                        All Events <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {megaEventCategories.map((cat) => (
                        cat.isRegister ? (
                          <button
                            key={cat.title}
                            type="button"
                            onClick={() => {
                              setEventsMegaOpen(false);
                              handleNavClick();
                              window.dispatchEvent(new CustomEvent("open-select-event-modal"));
                            }}
                            className="group flex flex-col p-2.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-cyan-500/40 transition-all duration-200 shadow-2xs text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="gradient-brand p-1.5 rounded-xl text-white group-hover:scale-105 transition-transform shadow-xs">
                                <cat.icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="text-xs font-bold font-btn text-slate-900 group-hover:text-cyan-600 transition-colors">
                                {cat.title}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-500 leading-snug">
                              {cat.desc}
                            </p>
                          </button>
                        ) : (
                          <Link
                            key={cat.to || cat.title}
                            to={cat.to!}
                            onClick={handleNavClick}
                            className="group flex flex-col p-2.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-cyan-500/40 transition-all duration-200 shadow-2xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="gradient-brand p-1.5 rounded-xl text-white group-hover:scale-105 transition-transform shadow-xs">
                                <cat.icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="text-xs font-bold font-btn text-slate-900 group-hover:text-cyan-600 transition-colors">
                                {cat.title}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-500 leading-snug">
                              {cat.desc}
                            </p>
                          </Link>
                        )
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/partner" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Partners</span>
                </>
              )}
            </NavLink>

            <NavLink to="/magazine" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Magazines</span>
                </>
              )}
            </NavLink>

            {/* VIP Membership Link */}
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                window.dispatchEvent(new CustomEvent("open-membership-modal"));
              }}
              className={cn(
                "relative px-3.5 py-1.5 rounded-full text-xs xl:text-[13px] font-bold font-btn transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 border",
                location.pathname === "/membership"
                  ? "text-amber-800 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 shadow-[0_2px_10px_rgba(245,158,11,0.2)] font-extrabold"
                  : "text-amber-600 hover:text-amber-700 bg-amber-500/8 hover:bg-amber-500/15 border-amber-500/25 shadow-xs"
              )}
            >
              <Crown className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>Membership</span>
            </button>

            <NavLink to="/careers" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Careers</span>
                </>
              )}
            </NavLink>

            <NavLink to="/contact" onClick={handleNavClick} className={({ isActive }) => navLinkStyle(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] shrink-0 animate-pulse" />
                  )}
                  <span>Contact</span>
                </>
              )}
            </NavLink>
          </div>

          {/* RIGHT: Glowing Register Button • Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Glowing Register CTA Button */}
            <MagneticButton
              strength={14}
              className="relative shrink-0 whitespace-nowrap gradient-brand rounded-full px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-xs sm:text-[13px] font-extrabold text-white shadow-[0_3px_14px_rgba(0,174,239,0.35)] hover:shadow-[0_5px_22px_rgba(0,174,239,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-register-modal"))}
                className="flex items-center gap-1.5 font-btn cursor-pointer bg-transparent border-none text-white text-xs sm:text-[13px] font-extrabold whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap">Register Now</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </MagneticButton>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={cn(
                "p-2 rounded-full border transition-all lg:hidden cursor-pointer",
                mobileMenuOpen
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "border-slate-200/90 bg-slate-100/90 text-slate-800 hover:bg-slate-200"
              )}
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </nav>

        {/* MOBILE & TABLET DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="container-x overflow-hidden lg:hidden pt-1.5 pb-3"
            >
              <div className="space-y-2.5 rounded-3xl border border-slate-200/90 bg-white/98 backdrop-blur-2xl p-4 sm:p-5 text-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] max-h-[80vh] overflow-y-auto">
                {/* Drawer Top Header Badge */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-display">
                      Executive Navigation
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full border border-cyan-200/60">
                    C-Suite Portal
                  </span>
                </div>

                {/* Nav Items List */}
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { to: "/", label: "Home", icon: Home },
                    { to: "/about", label: "About Us", icon: Building2 },
                    { to: "/events", label: "Summits & Events", icon: Calendar },
                    { to: "/partner", label: "Partners & Sponsors", icon: Handshake },
                    { to: "/magazine", label: "Executive Magazines", icon: BookOpen },
                    { to: "/careers", label: "Careers & Openings", icon: Briefcase },
                    { to: "/contact", label: "Contact & Enquiry", icon: Phone },
                  ].map((item) => {
                    const isItemActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold font-btn transition-all duration-200",
                          isItemActive
                            ? "bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 text-cyan-700 border border-cyan-500/30 shadow-xs"
                            : "text-slate-700 hover:text-cyan-600 hover:bg-slate-100/80"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "p-1.5 rounded-xl transition-colors",
                              isItemActive
                                ? "bg-cyan-500 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {isItemActive && (
                          <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* VIP Membership Card */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("open-membership-modal"));
                  }}
                  className="w-full text-left rounded-2xl p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-orange-500/10 border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer flex items-center justify-between shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Crown className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold font-btn text-amber-950 group-hover:text-amber-800">
                        Executive Membership
                      </p>
                      <p className="text-xs text-amber-700/80">
                        Exclusive C-Suite Access & Privileges
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-xs">
                    Apply
                  </span>
                </button>

                {/* Quick Actions at Bottom */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent("open-register-modal"));
                    }}
                    className="gradient-brand w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 px-4 text-center text-sm font-extrabold font-btn text-white shadow-[0_4px_18px_rgba(0,174,239,0.35)] active:scale-[0.98] transition-all cursor-pointer border-none"
                  >
                    <span>Register for Summit Pass</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
