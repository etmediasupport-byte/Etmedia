import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Download,
  Search,
  Mail,
  Send,
  Check,
  Maximize2,
  Sparkles,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { images, getDefaultMagazines, MagazineItem } from "@/lib/site-data";
import { Reveal } from "@/components/site/primitives";
import { SEOHead } from "@/components/site/SEOHead";
import { socket } from "@/lib/socket";
import { extractPdfPagesToDataUrls, parsePagesList } from "@/utils/pdfExtractor";
import { Magazine3DViewer } from "@/components/site/Magazine3DViewer";
import { ThreeDMagazineHero } from "@/components/site/3DMagazineHero";

import { validateEmail } from "@/lib/validation";

const filterCategories = [
  "All Editions",
  "2026",
  "2025",
  "2024",
  "Leadership",
  "Innovation",
  "Technology",
  "Sustainability",
  "Healthcare",
];

export default function MagazinePage() {
  const [magazinesList, setMagazinesList] = useState<MagazineItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Editions");
  const [searchQuery, setSearchQuery] = useState("");

  // Newsletter Subscription Form State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterAgree, setNewsletterAgree] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  // Selected magazine for 3D Flipbook Reader Modal
  const [activeMagazine, setActiveMagazine] = useState<MagazineItem | null>(null);

  useEffect(() => {
    fetchMagazines();

    const handleMagUpdate = () => {
      fetchMagazines();
    };

    socket.on("magazine_updated", handleMagUpdate);
    return () => {
      socket.off("magazine_updated", handleMagUpdate);
    };
  }, []);

  const fetchMagazines = async () => {
    try {
      const res = await fetch("/api/magazines");
      if (res.ok) {
        const data = await res.json();
        if (data.magazines && data.magazines.length > 0) {
          setMagazinesList(data.magazines);
          return;
        }
      }
    } catch (e) {
      console.warn("Using default static magazines fallback:", e);
    }
    setMagazinesList(getDefaultMagazines());
  };

  const parsePages = (mag: MagazineItem): string[] => {
    const parsed = parsePagesList(mag.pages_list);
    let list = parsed.length > 0 ? parsed : [mag.cover, mag.cover];

    if (list.length < 6) {
      const fallbackList = [
        mag.cover,
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1542744801-30d061937985?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
        mag.cover,
      ];
      list = Array.from(new Set([...list, ...fallbackList]));
    }
    return list;
  };

  const [pdfExtractedPages, setPdfExtractedPages] = useState<string[]>([]);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const openReader = async (mag: MagazineItem) => {
    setActiveMagazine(mag);
    setPdfExtractedPages([]);

    const staticPages = parsePages(mag);
    if (mag.pdf_url && staticPages.length <= 2) {
      try {
        setIsExtractingPdf(true);
        const pages = await extractPdfPagesToDataUrls(mag.pdf_url);
        if (pages.length > 0) {
          setPdfExtractedPages(pages);
        }
      } catch (err) {
        console.warn("Could not dynamically extract PDF pages:", err);
      } finally {
        setIsExtractingPdf(false);
      }
    }
  };

  const closeReader = () => {
    setActiveMagazine(null);
    setPdfExtractedPages([]);
    setIsExtractingPdf(false);
  };

  const activePages = activeMagazine
    ? pdfExtractedPages.length > 0
      ? pdfExtractedPages
      : parsePages(activeMagazine)
    : [];

  const displayMagazines = magazinesList.length > 0 ? magazinesList : getDefaultMagazines();
  const featuredMagazine = displayMagazines.find((m) => m.is_featured) || displayMagazines[0];

  const filteredMagazines = displayMagazines.filter((mag) => {
    const matchesSearch =
      mag.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mag.description && mag.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mag.issue && mag.issue.toLowerCase().includes(searchQuery.toLowerCase()));

    const cat = selectedCategory.toLowerCase();
    const matchesCat =
      selectedCategory === "All Editions" ||
      (mag.category && mag.category.toLowerCase().includes(cat)) ||
      (mag.month && mag.month.toLowerCase().includes(cat)) ||
      (mag.date && mag.date.toLowerCase().includes(cat)) ||
      (mag.issue && mag.issue.toLowerCase().includes(cat));

    return matchesSearch && matchesCat;
  });

  const scrollToEditions = () => {
    const el = document.getElementById("all-magazines");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = validateEmail(newsletterEmail, "Newsletter Email");
    if (!val.isValid) {
      toast.error(val.error);
      return;
    }
    if (!newsletterAgree) {
      toast.error("Please accept the terms to subscribe.");
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim(), source: "Executive Magazine Page" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Thank you for subscribing to Executive Talks Magazine!");
        setNewsletterEmail("");
      } else {
        toast.error(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      console.error("Magazine newsletter subscription error:", err);
      toast.error("Network error. Please try again later.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-cyan-500/30 selection:text-cyan-900 font-sans">
      <SEOHead
        pageKey="magazine"
        title="Executive Talks Magazine | Executive Talks Media"
        description="Read Executive Talks Magazine featuring exclusive C-suite leadership interviews, CXO insights, market reports, and interactive 3D digital flipbooks."
        keywords="Executive Talks Magazine, Executive Talks, ET Media, CXO Interviews, B2B Magazine India, Leadership Intelligence, Digital Flipbook, Business Articles"
        url="https://www.executivetalksmedia.in/magazine"
      />
      {/* ========================================== */}
      {/* 1. HERO SECTION WITH 3D FLOATING COVER     */}
      {/* ========================================== */}
      {featuredMagazine && (
        <ThreeDMagazineHero
          magazine={featuredMagazine}
          onOpenReader={openReader}
          onScrollToEditions={scrollToEditions}
        />
      )}

      {/* ========================================== */}
      {/* 2. EXPLORE OUR EDITIONS (WHITE MODE GRID)  */}
      {/* ========================================== */}
      <section id="all-magazines" className="py-10 sm:py-14 relative bg-slate-50/70 border-b border-slate-200/80">
        <div className="container-x">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[10.5px] font-black uppercase tracking-wider text-purple-700 font-display">
              <Sparkles className="h-3 w-3 text-purple-600" />
              EXPLORE OUR EDITIONS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display mt-2 tracking-tight">
              All Magazine Editions
            </h2>
            <p className="mt-2 text-slate-600 text-xs sm:text-sm leading-relaxed font-sans font-medium">
              A curated collection of leadership dialogues, strategic intelligence, and industry trends from visionary executives worldwide.
            </p>
          </div>

          {/* Search Bar & Category Filter Pills */}
          <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-3 p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search editions, topics, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/10 transition-all font-medium"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xs font-extrabold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Magazines Grid (4 Columns Desktop, 2 Columns Tablet, 1 Column Mobile) */}
          {filteredMagazines.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-slate-200 bg-white text-slate-500 text-xs sm:text-sm font-semibold">
              No magazine editions found matching your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredMagazines.map((mag, i) => (
                <Reveal key={mag.id || mag.issue || i} delay={i * 0.05}>
                  <div
                    onClick={() => openReader(mag)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs hover:shadow-xl hover:border-purple-400/60 hover:-translate-y-1 transition-all duration-300 h-full cursor-pointer"
                  >
                    <div>
                      {/* Cover Image Frame */}
                      <div className="relative aspect-[1/1.42] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
                        {/* Spine Accent */}
                        <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-slate-400/40 via-slate-300/20 to-transparent z-20 pointer-events-none" />

                        <img
                          src={mag.cover}
                          alt={`${mag.title} cover`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Glossy Sheen */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />

                        {/* Issue Badge Top Left */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="rounded-full bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-purple-200 border border-slate-700 shadow-sm">
                            {mag.issue || "Edition"}
                          </span>
                        </div>

                        {/* Hover Overlay Hint */}
                        <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center z-20 backdrop-blur-xs">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl mb-1.5">
                            <Maximize2 className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-xs font-black uppercase text-white font-display tracking-wider">
                            Launch 3D Reader
                          </span>
                        </div>
                      </div>

                      {/* Card Title & Info Below Cover */}
                      <div className="mt-3 space-y-1">
                        <div className="text-[10.5px] font-extrabold uppercase text-purple-700 font-mono">
                          {mag.month || mag.date || "2026 Edition"}
                        </div>

                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors font-display line-clamp-1 leading-snug">
                          {mag.title}
                        </h3>

                        {mag.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans font-medium">
                            {mag.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold text-slate-500 truncate">
                        {mag.category || "Executive Talks"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openReader(mag);
                        }}
                        className="cursor-pointer text-xs font-extrabold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors shrink-0"
                      >
                        <span>Read Edition</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ========================================== */}
      {/* 3. STAY UPDATED NEWSLETTER BANNER AT BOTTOM */}
      {/* ========================================== */}
      <section className="py-8 sm:py-10 relative bg-white">
        <div className="container-x">
          <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-r from-slate-950 via-[#121829] to-slate-950 text-white p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              
              {/* Left Column: Heading & Subtitle */}
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-display">
                      Stay Updated with Executive Talks
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed font-sans">
                  Get notified about new magazine editions, exclusive C-Suite interviews, and upcoming global summit reports.
                </p>
              </div>

              {/* Right Column: Input Box & Subscribe Button */}
              <div className="lg:col-span-6">
                <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <div className="relative w-full">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your official work email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={subscribing}
                      className="w-full sm:w-auto shrink-0 cursor-pointer rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-purple-600/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>Subscribe</span>
                      <ChevronRight className="h-4 w-4 text-white/80" />
                    </button>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="newsletterAgree"
                      checked={newsletterAgree}
                      onChange={(e) => setNewsletterAgree(e.target.checked)}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <label htmlFor="newsletterAgree" className="text-[11px] text-slate-400 cursor-pointer font-medium">
                      I agree to receive publication updates from Executive Talks Media
                    </label>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. FULLSCREEN 3D FLIPBOOK MAGAZINE READER  */}
      {/* ========================================== */}
      <AnimatePresence>
        {activeMagazine && (
          <Magazine3DViewer
            magazine={activeMagazine}
            pages={activePages}
            onClose={closeReader}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
