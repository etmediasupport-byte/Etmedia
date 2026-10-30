import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  Share2,
  Eye,
  Edit3,
  Save,
  RotateCcw,
  Download,
  Users,
  Calendar,
  MapPin,
  Mail,
  Palette,
  Layers,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Megaphone,
  Layout,
  Crown,
  Zap,
  Filter,
  ArrowRight,
  Globe,
  Tag,
  ListPlus,
} from "lucide-react";
import { toast } from "sonner";
import PromotionBadgeCard, {
  PromotionTemplate,
  AttendeeBadgeData,
} from "@/components/site/PromotionBadgeCard";

interface RegisterPromotionBarStudioProps {
  registrations: any[];
  events: any[];
}

export const TEMPLATE_LAYOUT_PRESETS: {
  style: string;
  name: string;
  description: string;
  tag: string;
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
    footer: string;
  };
}[] = [
  {
    style: "hr-recall-emerald",
    name: "HR Recall Chevron (2nd Image Model)",
    description: "Left brand details & 4 bullet highlights, right bold angular emerald & navy diagonal cut with framed photo & pill badge.",
    tag: "HR Recall 2K26 Layout",
    defaultColors: {
      primary: "#00A86B",
      secondary: "#0F172A",
      accent: "#EF4444",
      footer: "#064E3B",
    },
  },
  {
    style: "spotlight-center",
    name: "Grand Spotlight Center Hero",
    description: "Top corporate header arc, large glowing halo circular portrait in center, centered name, side-by-side highlights & QR boxes.",
    tag: "Center Spotlight",
    defaultColors: {
      primary: "#D4AF37",
      secondary: "#0B0F19",
      accent: "#F59E0B",
      footer: "#111827",
    },
  },
  {
    style: "editorial-split",
    name: "C-Suite Editorial Magazine Split",
    description: "Left full-height vertical bleed portrait with delegate ribbon, right crisp white card with bold editorial typography.",
    tag: "Magazine Split",
    defaultColors: {
      primary: "#0284C7",
      secondary: "#0F172A",
      accent: "#E11D48",
      footer: "#0C4A6E",
    },
  },
  {
    style: "prestige-gold-framed",
    name: "Prestige Double Gold Framed",
    description: "Royal double gold border, luxury dark obsidian base, gold star bullet points, prestigious executive seal.",
    tag: "Prestige Luxury Gold",
    defaultColors: {
      primary: "#D4AF37",
      secondary: "#090D16",
      accent: "#FBBF24",
      footer: "#18181B",
    },
  },
  {
    style: "cyber-tech-conclave",
    name: "Cyber Tech Modern Conclave",
    description: "Electric cyan & sapphire tech mesh, monospace security tags, glowing circular tech avatar ring & cyber badge pill.",
    tag: "Futuristic Cyber Tech",
    defaultColors: {
      primary: "#06B6D4",
      secondary: "#030712",
      accent: "#38BDF8",
      footer: "#082F49",
    },
  },
];

export default function RegisterPromotionBarStudio({
  registrations = [],
  events = [],
}: RegisterPromotionBarStudioProps) {
  const [templates, setTemplates] = useState<PromotionTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tmpl-hr-recall-2k26");
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activating, setActivating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Selected Attendee for Live Test Preview
  const [selectedAttendeeMode, setSelectedAttendeeMode] = useState<string>("sample");
  const [customAttendee, setCustomAttendee] = useState<AttendeeBadgeData>({
    name: "VICTOR KOMAVARAPU",
    designation: "Unit Head – HR(Manager)",
    organization: "CARE HOSPITALS",
    photo_url: "",
    event_title: "HR RECALL 2K26",
    date: "11th December 2026",
    venue: "Gachibowli, Hyderabad",
  });

  // Editor Form State
  const [editorForm, setEditorForm] = useState<PromotionTemplate>({
    id: "tmpl-hr-recall-2k26",
    event_id: "all",
    event_slug: "all",
    title: "HR Recall 2K26 Summit Executive Badge",
    theme_style: "hr-recall-emerald",
    badge_text: "I'M ONE OF THE 2,000+",
    top_tagline: "2,000+ HR PROFESSIONALS ONE BIG GATHERING",
    event_heading: "AWARDS & CONNECT HR RECALL 2K26",
    sub_heading: "Remembering 2026. Calling 2027",
    highlights: ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"],
    cta_text: "REGISTER NOW",
    date_text: "11th December 2026",
    venue_text: "Gachibowli, Hyderabad",
    contact_email: "registration@executivetalksmedia.in",
    primary_color: "#00A86B",
    secondary_color: "#0F172A",
    accent_color: "#EF4444",
    footer_bg: "#064E3B",
    qr_destination_url: "/events/hr-recall-2k26",
    custom_logo_url: "",
    is_active: true,
  });

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/promotion-templates");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.templates)) {
          setTemplates(json.templates);
          const active = json.templates.find((t: any) => t.is_active);
          const initial = active || json.templates[0];
          if (initial) {
            setSelectedTemplateId(initial.id);
            setEditorForm({
              ...initial,
              highlights: Array.isArray(initial.highlights)
                ? initial.highlights
                : typeof initial.highlights === "string"
                ? initial.highlights.split(",").map((s: string) => s.trim())
                : ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"],
            });
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch promotion templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filtered Templates based on Event Filter
  const filteredTemplates = useMemo(() => {
    if (selectedEventFilter === "all") {
      return templates;
    }
    return templates.filter(
      (t) =>
        t.event_id === selectedEventFilter ||
        t.event_slug === selectedEventFilter ||
        t.event_id === "all" ||
        !t.event_id
    );
  }, [templates, selectedEventFilter]);

  // Attendee list filtered for preview
  const filteredRegistrations = useMemo(() => {
    if (selectedEventFilter === "all") {
      return registrations;
    }
    const matchedEv = events.find((e) => e.id === selectedEventFilter || e.slug === selectedEventFilter);
    return registrations.filter(
      (r) =>
        r.event_id === selectedEventFilter ||
        (matchedEv && r.event_title?.toLowerCase().includes(matchedEv.title.toLowerCase()))
    );
  }, [registrations, events, selectedEventFilter]);

  const handleSelectTemplate = (t: PromotionTemplate) => {
    setSelectedTemplateId(t.id);
    setEditorForm({
      ...t,
      highlights: Array.isArray(t.highlights)
        ? t.highlights
        : typeof t.highlights === "string"
        ? (t.highlights as string).split(",").map((s) => s.trim())
        : ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"],
    });
  };

  // Switch Layout Structure directly from presets
  const handleApplyLayoutPreset = (preset: typeof TEMPLATE_LAYOUT_PRESETS[0]) => {
    setEditorForm((prev) => ({
      ...prev,
      theme_style: preset.style,
      primary_color: preset.defaultColors.primary,
      secondary_color: preset.defaultColors.secondary,
      accent_color: preset.defaultColors.accent,
      footer_bg: preset.defaultColors.footer,
    }));
    toast.success(`Switched layout structure to "${preset.name}"!`);
  };

  // Auto-Fill Form from a selected Event
  const handleAutoFillFromEvent = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId || e.slug === eventId);
    if (!ev) {
      toast.error("Please select a specific conference event to auto-populate.");
      return;
    }

    const titleUpper = (ev.title || "ANNUAL EXECUTIVE CONCLAVE").toUpperCase();
    const city = ev.city || "Hyderabad";
    const venue = ev.venue ? `${ev.venue}, ${city}` : city;
    const dateStr = ev.date || "11th December 2026";
    const slugStr = ev.slug || ev.id;

    // Smart generation of taglines based on event title/category
    let generatedTagline = "2,000+ INDUSTRY PROFESSIONALS ONE BIG GATHERING";
    let generatedBadgePill = "I'M ONE OF THE 2,000+";
    let defaultHighlights = ["2000+ Attendees", "50+ Speakers", "Industry Awards", "VIP Networking"];

    if (titleUpper.includes("HR")) {
      generatedTagline = "2,000+ HR PROFESSIONALS ONE BIG GATHERING";
      generatedBadgePill = "I'M ONE OF THE 2,000+";
      defaultHighlights = ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"];
    } else if (titleUpper.includes("CFO") || titleUpper.includes("FINANCE")) {
      generatedTagline = "500+ CFOs & FINANCE LEADERS CONVERGING";
      generatedBadgePill = "HONOURED DELEGATE";
      defaultHighlights = ["500+ CFO Leaders", "Financial Keynotes", "Finance Awards", "VIP Roundtable"];
    } else if (titleUpper.includes("AI") || titleUpper.includes("TECH")) {
      generatedTagline = "ENTERPRISE AI & DIGITAL LEADERSHIP CONCLAVE";
      generatedBadgePill = "ATTENDING TECH SUMMIT";
      defaultHighlights = ["1000+ Tech Leaders", "40+ CIO Panels", "AI Expo", "Tech Awards"];
    } else if (titleUpper.includes("PROCUREMENT") || titleUpper.includes("SUPPLY")) {
      generatedTagline = "STRATEGIC SOURCING & PROCUREMENT LEADERSHIP 2026";
      generatedBadgePill = "OFFICIAL DELEGATE";
      defaultHighlights = ["Global CPOs", "B2B Matchmaking", "Procurement Awards", "Industry Whitepapers"];
    }

    setEditorForm((prev) => ({
      ...prev,
      event_id: ev.id,
      event_slug: slugStr,
      title: `${ev.title} Official Badge`,
      event_heading: `AWARDS & CONNECT ${titleUpper}`,
      sub_heading: ev.description ? ev.description.slice(0, 50) : "Remembering 2026. Calling 2027",
      top_tagline: generatedTagline,
      badge_text: generatedBadgePill,
      date_text: `Date: ${dateStr}`,
      venue_text: venue,
      qr_destination_url: `/events/${slugStr}`,
      contact_email: "registration@executivetalksmedia.in",
      highlights: defaultHighlights,
    }));

    toast.success(`Form auto-populated with details from "${ev.title}"!`);
  };

  // Create a brand new template for a specific event
  const handleCreateNewTemplateForEvent = (targetEventId?: string) => {
    const eventId = targetEventId || selectedEventFilter !== "all" ? selectedEventFilter : (events[0]?.id || "all");
    const ev = events.find((e) => e.id === eventId || e.slug === eventId);
    const newId = `tmpl-${Date.now().toString().slice(-6)}`;

    const newTemplate: PromotionTemplate = {
      id: newId,
      event_id: ev ? ev.id : "all",
      event_slug: ev ? (ev.slug || ev.id) : "all",
      title: ev ? `${ev.title} Badge` : "New Executive Promotion Badge",
      theme_style: "hr-recall-emerald",
      badge_text: "I'M ATTENDING",
      top_tagline: ev ? `${ev.title.toUpperCase()} BIG GATHERING` : "2,000+ EXECUTIVES ONE BIG GATHERING",
      event_heading: ev ? `AWARDS & CONNECT ${ev.title.toUpperCase()}` : "EXECUTIVE TALKS MEDIA SUMMIT 2026",
      sub_heading: "Inspiring Leadership. Transforming Tomorrow",
      highlights: ["2000+ Delegates", "50+ Speakers", "Awards & Honours", "Executive Networking"],
      cta_text: "REGISTER NOW",
      date_text: ev?.date ? `Date: ${ev.date}` : "Date: 11th December 2026",
      venue_text: ev?.venue ? `${ev.venue}, ${ev.city || "Hyderabad"}` : (ev?.city || "Hyderabad"),
      contact_email: "registration@executivetalksmedia.in",
      primary_color: "#00A86B",
      secondary_color: "#0F172A",
      accent_color: "#EF4444",
      footer_bg: "#064E3B",
      qr_destination_url: ev?.slug ? `/events/${ev.slug}` : "/events",
      custom_logo_url: "",
      is_active: false,
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setSelectedTemplateId(newId);
    setEditorForm(newTemplate);
    toast.success("New event promotion template initialized. Customize & click Save!");
  };

  // One-click Activate Template for Event
  const handleActivateTemplate = async (templateId: string) => {
    try {
      setActivating(true);
      const res = await fetch(`/api/promotion-templates/${encodeURIComponent(templateId)}/activate`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("This design is now ACTIVE globally & for this event's attendees!");
        setTemplates((prev) =>
          prev.map((t) => ({
            ...t,
            is_active: t.id === templateId,
          }))
        );
        if (editorForm.id === templateId) {
          setEditorForm((prev) => ({ ...prev, is_active: true }));
        }
      } else {
        toast.error("Failed to activate template");
      }
    } catch (err: any) {
      toast.error(err.message || "Activation error");
    } finally {
      setActivating(false);
    }
  };

  // Save Editor Form Changes (Create or Update in MySQL)
  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      // Ensure highlights is an array of strings
      const payload = {
        ...editorForm,
        highlights: Array.isArray(editorForm.highlights)
          ? editorForm.highlights
          : typeof editorForm.highlights === "string"
          ? (editorForm.highlights as string).split(",").map((s) => s.trim())
          : ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"],
      };

      const res = await fetch(`/api/promotion-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Template "${editorForm.title}" saved to database successfully!`);
        setTemplates((prev) => {
          const exists = prev.some((t) => t.id === editorForm.id);
          if (exists) {
            return prev.map((t) => (t.id === editorForm.id ? { ...payload } : t));
          }
          return [payload, ...prev];
        });
      } else {
        toast.error("Failed to save template changes");
      }
    } catch (err: any) {
      toast.error(err.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm("Are you sure you want to delete this promotion template?")) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/promotion-templates/${encodeURIComponent(templateId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Template deleted.");
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        if (selectedTemplateId === templateId && templates.length > 1) {
          const fallback = templates.find((t) => t.id !== templateId);
          if (fallback) {
            setSelectedTemplateId(fallback.id);
            setEditorForm(fallback);
          }
        }
      } else {
        toast.error("Failed to delete template");
      }
    } catch (err: any) {
      toast.error(err.message || "Delete error");
    } finally {
      setDeleting(false);
    }
  };

  // Handle Registered Attendee Selection for Live Preview
  const effectiveAttendee: AttendeeBadgeData = useMemo(() => {
    if (selectedAttendeeMode === "sample") {
      return customAttendee;
    }
    const found = registrations.find((r) => r.id === selectedAttendeeMode);
    if (found) {
      return {
        id: found.id,
        name: found.name || (found.first_name ? `${found.first_name} ${found.last_name || ""}`.trim() : "Executive Delegate"),
        designation: found.designation || "Executive Delegate",
        organization: found.organization || found.company_name || "Enterprise Leader",
        photo_url: found.photo_url || "",
        event_title: found.event_title || editorForm.event_heading || "HR RECALL 2K26",
        date: found.event_date || editorForm.date_text || "11th December 2026",
        venue: found.city || editorForm.venue_text || "Hyderabad",
      };
    }
    return customAttendee;
  }, [selectedAttendeeMode, registrations, customAttendee, editorForm]);

  const activeTemplate = templates.find((t) => t.is_active);

  // Helper to update individual highlight bullet point
  const handleUpdateHighlight = (index: number, val: string) => {
    const current = Array.isArray(editorForm.highlights)
      ? [...editorForm.highlights]
      : ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"];
    current[index] = val;
    setEditorForm({ ...editorForm, highlights: current });
  };

  const selectedEventObj = events.find((e) => e.id === selectedEventFilter || e.slug === selectedEventFilter);

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & FILTER BAR (EXACT DESIGN FROM 2ND IMAGE)       */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-emerald-500/20">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Attendee Social Badges & Promotion
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-3">
            <span>Register Promotion Bar Studio</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
              Live CMS
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Manage dynamic "I'm Attending" social media badges & promotional posters. Choose which template design is <strong>ACTIVE</strong> for registered attendees to download & share on LinkedIn and WhatsApp.
          </p>
        </div>

        {/* Top Control Bar: Event Filter & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* EVENT FILTER DROPDOWN (Matches 2nd Image: "All Events (8)") */}
          <div className="relative">
            <select
              value={selectedEventFilter}
              onChange={(e) => {
                const newFilter = e.target.value;
                setSelectedEventFilter(newFilter);
                if (newFilter !== "all") {
                  handleAutoFillFromEvent(newFilter);
                }
              }}
              className="py-2.5 pl-9 pr-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black border border-emerald-500/40 focus:border-emerald-400 focus:outline-none transition-all cursor-pointer shadow-md appearance-none"
            >
              <option value="all">🎪 All Events ({events.length})</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  📅 {ev.title} ({ev.city || "Hyderabad"})
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => handleCreateNewTemplateForEvent(selectedEventFilter !== "all" ? selectedEventFilter : undefined)}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Badge for Event</span>
          </button>

          <button
            type="button"
            onClick={fetchTemplates}
            className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Database</span>
          </button>

          {activeTemplate && (
            <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ACTIVE: {activeTemplate.title.slice(0, 16)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. STATS OVERVIEW CARDS (EXACT METRICS AS IN 2ND IMAGE)       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Globally Active Template */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            GLOBALLY ACTIVE TEMPLATE
          </span>
          <p className="text-base font-black text-slate-900 dark:text-white truncate">
            {activeTemplate ? activeTemplate.title : "HR Recall 2K26 Summit..."}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Shown to all delegates upon registering
          </p>
        </div>

        {/* Metric 2: Available Layout Designs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            AVAILABLE DESIGNS
          </span>
          <p className="text-base font-black text-slate-900 dark:text-white">
            5 Distinct Themes
          </p>
          <p className="text-[11px] text-slate-500">
            1:1 Square high-res social posters
          </p>
        </div>

        {/* Metric 3: Total Registered Attendees */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            {selectedEventFilter !== "all" ? "EVENT ATTENDEES" : "TOTAL REGISTERED ATTENDEES"}
          </span>
          <p className="text-base font-black text-cyan-600 dark:text-cyan-400">
            {filteredRegistrations.length} Delegates
          </p>
          <p className="text-[11px] text-slate-500">
            Auto-populated from registration database
          </p>
        </div>

        {/* Metric 4: Social Export Resolution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            SOCIAL EXPORT RESOLUTION
          </span>
          <p className="text-base font-black text-slate-900 dark:text-white">
            1200 × 1200 px
          </p>
          <p className="text-[11px] text-slate-500">
            Optimized for LinkedIn & WhatsApp status
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. THE 5 DISTINCT LAYOUT STRUCTURE PRESETS                     */}
      {/* ============================================================== */}
      <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
              LAYOUT DESIGN ENGINE
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
              5 Distinct Layout Design Structures
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Click any layout structure below to immediately change the badge architecture:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {TEMPLATE_LAYOUT_PRESETS.map((preset, idx) => {
            const isCurrentLayout = (editorForm.theme_style || "hr-recall-emerald") === preset.style;

            return (
              <button
                key={preset.style}
                type="button"
                onClick={() => handleApplyLayoutPreset(preset)}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                  isCurrentLayout
                    ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white">
                      Design {idx + 1}
                    </span>
                    {isCurrentLayout && (
                      <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>

                  {/* Visual mini-wireframe preview */}
                  <div
                    className="w-full h-16 rounded-xl relative overflow-hidden flex items-center justify-center p-2 shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${preset.defaultColors.primary} 0%, ${preset.defaultColors.secondary} 100%)`,
                    }}
                  >
                    <span className="text-[8px] font-black uppercase text-white bg-black/40 px-2 py-1 rounded backdrop-blur-xs text-center line-clamp-1">
                      {preset.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                      {preset.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {preset.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/50" style={{ backgroundColor: preset.defaultColors.primary }} />
                  <div className="w-3.5 h-3.5 rounded-full border border-white/50" style={{ backgroundColor: preset.defaultColors.secondary }} />
                  <div className="w-3.5 h-3.5 rounded-full border border-white/50" style={{ backgroundColor: preset.defaultColors.accent }} />
                  <span className="text-[9px] font-mono text-slate-400 ml-auto">Preset</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. LIVE BADGE PREVIEW & CUSTOMIZER STUDIO                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Interactive Preview (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 block">
                  Live Interactive Output
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Badge Live Preview
                </h3>
              </div>

              {/* Attendee Selector Dropdown for live testing */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedAttendeeMode}
                  onChange={(e) => setSelectedAttendeeMode(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer max-w-[200px] truncate"
                >
                  <option value="sample">Demo: Victor Komavarapu</option>
                  <optgroup label="Real Registered Attendees">
                    {filteredRegistrations.slice(0, 30).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || r.full_name || "Delegate"} ({r.organization || r.company_name || "Org"})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* The Badge Card Component */}
            <PromotionBadgeCard
              template={editorForm}
              attendee={effectiveAttendee}
              onPhotoChange={(newPhoto) => {
                setCustomAttendee((prev) => ({ ...prev, photo_url: newPhoto }));
              }}
              allowPhotoUpload={true}
              hideActionButtons={false}
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Current Layout: <strong className="text-slate-900 dark:text-white uppercase">{editorForm.theme_style || "hr-recall-emerald"}</strong>
              </p>
              <p className="text-[10px] text-slate-400">
                Linked Event: <strong className="text-emerald-600 font-bold">{editorForm.event_id === "all" ? "All Events (Global)" : (events.find(e => e.id === editorForm.event_id)?.title || editorForm.event_id)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Template Customizer & Content Editor (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 block">
                Form Fields & Event Configurator
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Customize Template for Event
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={saving}
                className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-cyan-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Save className="w-4 h-4 text-cyan-400" />
                )}
                <span>Save Template</span>
              </button>

              <button
                type="button"
                onClick={() => handleActivateTemplate(editorForm.id)}
                disabled={activating || editorForm.is_active === true}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{editorForm.is_active ? "Currently Active" : "Set Active"}</span>
              </button>

              {templates.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(editorForm.id)}
                  disabled={deleting}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Form Fields With Clear Names & Guidance */}
          <div className="space-y-5 text-xs">
            {/* Field 1: Target Event & Auto-Fill Button */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Target Event (Conference Assignment)
                </label>
                <span className="text-[10px] text-emerald-700 font-bold">Step 1: Choose Event</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={editorForm.event_id || "all"}
                  onChange={(e) => {
                    const evtId = e.target.value;
                    const ev = events.find((item) => item.id === evtId || item.slug === evtId);
                    setEditorForm((prev) => ({
                      ...prev,
                      event_id: evtId,
                      event_slug: ev?.slug || evtId,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  <option value="all">🎪 Global (Applies to All Events)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      📅 {ev.title} ({ev.city || "Hyderabad"})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleAutoFillFromEvent(editorForm.event_id || "all")}
                  disabled={!editorForm.event_id || editorForm.event_id === "all"}
                  className="w-full sm:w-auto shrink-0 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="Automatically populate headings, dates, venue, and QR links from the selected event details"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Auto-Fill from Event</span>
                </button>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                Linking this template to an event makes it automatically appear on the registration confirmation page for delegates who register for that event.
              </p>
            </div>

            {/* Field 2: Template Name */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Template Name (Admin Reference)
              </label>
              <input
                type="text"
                value={editorForm.title}
                onChange={(e) => setEditorForm({ ...editorForm, title: e.target.value })}
                placeholder="e.g. HR Recall 2K26 Summit Executive Badge"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Field 3: Visual Layout Structure */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Visual Layout Architecture (Choose Structure)
              </label>
              <select
                value={editorForm.theme_style || "hr-recall-emerald"}
                onChange={(e) => {
                  const styleVal = e.target.value;
                  const matchedPreset = TEMPLATE_LAYOUT_PRESETS.find((p) => p.style === styleVal);
                  if (matchedPreset) {
                    handleApplyLayoutPreset(matchedPreset);
                  } else {
                    setEditorForm({ ...editorForm, theme_style: styleVal });
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="hr-recall-emerald">Layout 1: HR Recall Chevron (Exact 2nd Image Layout)</option>
                <option value="spotlight-center">Layout 2: Grand Spotlight Center Hero (Centered VIP Halo)</option>
                <option value="editorial-split">Layout 3: C-Suite Editorial Magazine Split (Forbes Column)</option>
                <option value="prestige-gold-framed">Layout 4: Prestige Double Gold Framed (Luxury Obsidian)</option>
                <option value="cyber-tech-conclave">Layout 5: Cyber Tech Conclave (Electric Cyan Modern)</option>
              </select>
            </div>

            {/* Field 4 & 5: Top Tagline & Badge Ribbon Pill */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Top Headline Tagline (Poster Header)
                </label>
                <input
                  type="text"
                  value={editorForm.top_tagline || ""}
                  onChange={(e) => setEditorForm({ ...editorForm, top_tagline: e.target.value })}
                  placeholder="2,000+ HR PROFESSIONALS ONE BIG GATHERING"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Badge Ribbon Text (Pill Over Photo)
                </label>
                <input
                  type="text"
                  value={editorForm.badge_text || ""}
                  onChange={(e) => setEditorForm({ ...editorForm, badge_text: e.target.value })}
                  placeholder="I'M ONE OF THE 2,000+"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Field 6 & 7: Event Heading & Subheading */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Main Event Heading
                </label>
                <input
                  type="text"
                  value={editorForm.event_heading || ""}
                  onChange={(e) => setEditorForm({ ...editorForm, event_heading: e.target.value })}
                  placeholder="AWARDS & CONNECT HR RECALL 2K26"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Sub-heading / Theme Tagline
                </label>
                <input
                  type="text"
                  value={editorForm.sub_heading || ""}
                  onChange={(e) => setEditorForm({ ...editorForm, sub_heading: e.target.value })}
                  placeholder="Remembering 2026. Calling 2027"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Field 8: 4 Highlights / Bullet Points */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ListPlus className="w-3.5 h-3.5 text-cyan-600" />
                  4 Event Highlights / Bullet Points
                </label>
                <span className="text-[10px] text-slate-400">Displayed next to QR code</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((idx) => {
                  const val = Array.isArray(editorForm.highlights)
                    ? (editorForm.highlights[idx] || "")
                    : ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"][idx] || "";
                  return (
                    <div key={idx}>
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">
                        Bullet {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                        placeholder={`Highlight ${idx + 1}`}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field 9 & 10: CTA Button Text & QR Destination */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={editorForm.cta_text || "REGISTER NOW"}
                  onChange={(e) => setEditorForm({ ...editorForm, cta_text: e.target.value })}
                  placeholder="REGISTER NOW"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  QR Destination URL / Route
                </label>
                <input
                  type="text"
                  value={editorForm.qr_destination_url || "/events/hr-recall-2k26"}
                  onChange={(e) => setEditorForm({ ...editorForm, qr_destination_url: e.target.value })}
                  placeholder="/events/hr-recall-2k26"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium font-mono"
                />
              </div>
            </div>

            {/* Field 11, 12 & 13: Date, Venue & Queries Email */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Date Text
                </label>
                <input
                  type="text"
                  value={editorForm.date_text || "11th December 2026"}
                  onChange={(e) => setEditorForm({ ...editorForm, date_text: e.target.value })}
                  placeholder="11th December 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Venue Text
                </label>
                <input
                  type="text"
                  value={editorForm.venue_text || "Gachibowli, Hyderabad"}
                  onChange={(e) => setEditorForm({ ...editorForm, venue_text: e.target.value })}
                  placeholder="Gachibowli, Hyderabad"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Queries & Registration Email
                </label>
                <input
                  type="email"
                  value={editorForm.contact_email || "registration@executivetalksmedia.in"}
                  onChange={(e) => setEditorForm({ ...editorForm, contact_email: e.target.value })}
                  placeholder="registration@executivetalksmedia.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Field 14: Full Color Customization */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                Color Customization (Applies to Selected Layout)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editorForm.primary_color || "#00A86B"}
                      onChange={(e) => setEditorForm({ ...editorForm, primary_color: e.target.value })}
                      className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={editorForm.primary_color || "#00A86B"}
                      onChange={(e) => setEditorForm({ ...editorForm, primary_color: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Dark Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editorForm.secondary_color || "#0F172A"}
                      onChange={(e) => setEditorForm({ ...editorForm, secondary_color: e.target.value })}
                      className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={editorForm.secondary_color || "#0F172A"}
                      onChange={(e) => setEditorForm({ ...editorForm, secondary_color: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Designation Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editorForm.accent_color || "#EF4444"}
                      onChange={(e) => setEditorForm({ ...editorForm, accent_color: e.target.value })}
                      className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={editorForm.accent_color || "#EF4444"}
                      onChange={(e) => setEditorForm({ ...editorForm, accent_color: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Footer Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editorForm.footer_bg || "#064E3B"}
                      onChange={(e) => setEditorForm({ ...editorForm, footer_bg: e.target.value })}
                      className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={editorForm.footer_bg || "#064E3B"}
                      onChange={(e) => setEditorForm({ ...editorForm, footer_bg: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">
                Templates saved to MySQL database are instantly retrieved on attendee pass pages.
              </span>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={saving}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-cyan-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Save className="w-4 h-4 text-cyan-400" />
                )}
                <span>Save Template Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. TEMPLATE GALLERY & ACTIVE SWITCHER (EXACT 2ND SCREENSHOT)   */}
      {/* ============================================================== */}
      <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-display">
              Template Gallery & Active Switcher
            </h2>
            <p className="text-xs text-slate-500">
              Click any template to customize or activate it globally. Whichever is marked <strong className="text-emerald-600">ACTIVE</strong> is generated for all registered attendees.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">
              Showing {filteredTemplates.length} templates
            </span>
          </div>
        </div>

        {/* Gallery Cards Grid (Matches 2nd image layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredTemplates.map((t) => {
            const isSelected = selectedTemplateId === t.id;
            const isActive = t.is_active === true || t.is_active === 1;
            const primaryColor = t.primary_color || "#00A86B";
            const secondaryColor = t.secondary_color || "#0F172A";

            return (
              <div
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-slate-50 dark:bg-slate-800/80 border-cyan-500 ring-2 ring-cyan-500/20 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top Visual Miniature Header Banner */}
                  <div
                    className="w-full h-24 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-3 text-center shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
                    }}
                  >
                    <span className="text-[8px] font-black uppercase text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs tracking-wider">
                      {t.badge_text || "I'M ATTENDING"}
                    </span>
                    <span className="text-[9px] font-black text-white/90 line-clamp-1 mt-1">
                      {t.event_heading || t.title}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                        {t.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {t.top_tagline || t.sub_heading || "Official Attendee Badge"}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t.event_id === "all" ? "🎪 Global" : (events.find(e => e.id === t.event_id)?.title?.slice(0, 14) || "Event")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {isActive ? (
                    <div className="w-full py-1.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Live on Portal</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateTemplate(t.id);
                      }}
                      disabled={activating}
                      className="w-full py-1.5 px-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>SET ACTIVE</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
