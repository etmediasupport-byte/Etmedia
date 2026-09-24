import { useState, useEffect, useRef } from "react";
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
import { Reveal, SectionHeading } from "@/components/site/primitives";
import { socket } from "@/lib/socket";
import { extractPdfPagesToDataUrls, parsePagesList } from "@/utils/pdfExtractor";
import { Magazine3DViewer } from "@/components/site/Magazine3DViewer";
import { ThreeDMagazineHero } from "@/components/site/3DMagazineHero";

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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!newsletterAgree) {
      toast.error("Please accept the terms to subscribe.");
      return;
    }
    setSubscribing(true);
    setTimeout(() => {
      toast.success("Thank you for subscribing to Executive Talks Magazine!");
      setNewsletterEmail("");
      setSubscribing(false);
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
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
      {/* 2. EXPLORE OUR EDITIONS (ALL MAGAZINES)    */}
      {/* ========================================== */}
      <section id="all-magazines" className="py-16 sm:py-24 relative border-b border-slate-800/80">
        <div className="container-x">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 font-display">
              EXPLORE OUR EDITIONS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display mt-2">
              All Magazines
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed font-sans font-medium">
              A collection of inspiring conversations, expert perspectives and industry stories from leaders across the globe.
            </p>
          </div>

          {/* Search Bar & Category Filter Pills */}
          <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-xl">
            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search editions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/25 border-none"
                      : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Magazines Grid (4 Columns Desktop, 2 Columns Tablet, 1 Column Mobile) */}
          {filteredMagazines.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-slate-800 bg-slate-900/40 text-slate-400 text-sm font-medium">
              No magazine editions found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {filteredMagazines.map((mag, i) => (
                <Reveal key={mag.id || mag.issue || i} delay={i * 0.05}>
                  <div
                    onClick={() => openReader(mag)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-xl hover:border-cyan-500/60 hover:bg-slate-900 transition-all duration-300 h-full cursor-pointer"
                  >
                    <div>
                      {/* Cover Image Frame */}
                      <div className="relative aspect-[1/1.42] w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/80 shadow-md">
                        {/* Spine Accent */}
                        <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black via-slate-900 to-transparent z-20 pointer-events-none" />

                        <img
                          src={mag.cover}
                          alt={`${mag.title} cover`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Glossy Sheen */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />

                        {/* Issue Badge Top Left */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="rounded-full bg-slate-950/85 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 border border-slate-800 shadow-md">
                            {mag.issue || "Issue"}
                          </span>
                        </div>

                        {/* Hover Overlay Hint */}
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center z-20">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl mb-2">
                            <Maximize2 className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-extrabold text-white font-btn tracking-wide">
                            Launch 3D Reader
                          </span>
                        </div>
                      </div>

                      {/* Card Title & Info Below Cover */}
                      <div className="mt-4 space-y-1">
                        <div className="text-[11px] font-extrabold uppercase text-cyan-400 font-mono">
                          {mag.month || mag.date || "2026 Edition"}
                        </div>

                        <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors font-display line-clamp-1 leading-snug">
                          {mag.title}
                        </h3>

                        {mag.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans font-medium">
                            {mag.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {mag.category || "Executive Talks"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openReader(mag);
                        }}
                        className="cursor-pointer text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
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
      <section className="py-16 sm:py-20 relative">
        <div className="container-x">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-[#0B0F19] via-[#111827] to-[#0D111D] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Column: Heading & Subtitle */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      Stay Updated with Executive Talks Magazine
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed font-sans">
                  Get notified about the latest editions, exclusive CXO interviews and upcoming summit features.
                </p>
              </div>

              {/* Right Column: Input Box & Subscribe Button */}
              <div className="lg:col-span-6">
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full">
                      <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={subscribing}
                      className="w-full sm:w-auto shrink-0 cursor-pointer rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-7 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-600/25 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>Subscribe</span>
                      <ChevronRight className="h-4 w-4 text-cyan-200" />
                    </button>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="newsletterAgree"
                      checked={newsletterAgree}
                      onChange={(e) => setNewsletterAgree(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <label htmlFor="newsletterAgree" className="text-[11px] text-slate-400 cursor-pointer font-medium">
                      I agree to receive publication updates from ET Media
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
