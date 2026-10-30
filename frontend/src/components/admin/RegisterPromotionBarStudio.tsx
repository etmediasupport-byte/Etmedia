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

export default function RegisterPromotionBarStudio({
  registrations = [],
  events = [],
}: RegisterPromotionBarStudioProps) {
  const [templates, setTemplates] = useState<PromotionTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tmpl-hr-recall-2k26");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activating, setActivating] = useState<boolean>(false);

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
          // Find currently active or first
          const active = json.templates.find((t: any) => t.is_active);
          const initial = active || json.templates[0];
          if (initial) {
            setSelectedTemplateId(initial.id);
            setEditorForm(initial);
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

  // When selectedTemplateId changes, update editor form
  const activeSelectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || editorForm;
  }, [templates, selectedTemplateId, editorForm]);

  const handleSelectTemplate = (t: PromotionTemplate) => {
    setSelectedTemplateId(t.id);
    setEditorForm({
      ...t,
      highlights: Array.isArray(t.highlights) ? t.highlights : ["2000+ HR Pros", "50+ Speakers", "Awards", "Networking"],
    });
  };

  // One-click Activate Template
  const handleActivateTemplate = async (templateId: string) => {
    try {
      setActivating(true);
      const res = await fetch(`/api/promotion-templates/${encodeURIComponent(templateId)}/activate`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("Template is now ACTIVE for all attendee passes & portals!");
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

  // Save Editor Form Changes
  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/promotion-templates/${encodeURIComponent(editorForm.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editorForm),
      });
      if (res.ok) {
        toast.success("Promotion template saved to database!");
        setTemplates((prev) =>
          prev.map((t) => (t.id === editorForm.id ? { ...editorForm } : t))
        );
      } else {
        toast.error("Failed to save template changes");
      }
    } catch (err: any) {
      toast.error(err.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  // Handle Registered Attendee Selection
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
        event_title: found.event_title || "HR RECALL 2K26",
        date: found.event_date || "11th December 2026",
        venue: found.city || "Hyderabad",
      };
    }
    return customAttendee;
  }, [selectedAttendeeMode, registrations, customAttendee]);

  const activeTemplate = templates.find((t) => t.is_active);

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & METRIC CARDS                                   */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-emerald-500/20">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Attendee Social Badges & Promotion
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
            Register Promotion Bar Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Manage dynamic "I'm Attending" social media badges & promotional posters. Choose which template design is active globally for registered attendees to download & share on LinkedIn and WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchTemplates}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/10 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Database</span>
          </button>

          {activeTemplate && (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Active: {activeTemplate.title.split(" ")[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Globally Active Template
          </span>
          <span className="text-base font-black text-emerald-600 block mt-1 truncate">
            {activeTemplate?.title || "HR Recall 2K26 Badge"}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Shown to all delegates upon registering
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Available Designs
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">
            {templates.length || 5} Themes
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            1:1 Square high-res social posters
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Registered Attendees
          </span>
          <span className="text-xl font-black text-cyan-600 block mt-1">
            {registrations.length} Delegates
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Auto-populated from registration database
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Social Export Resolution
          </span>
          <span className="text-xl font-black text-purple-600 block mt-1">
            1200 x 1200 px
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Optimized for LinkedIn & WhatsApp status
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TEMPLATE SELECTION GALLERY                                  */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-display">
              Template Gallery & Active Switcher
            </h2>
            <p className="text-xs text-slate-500">
              Click any template to customize or activate it globally. Whichever is marked <strong className="text-emerald-600 font-bold">ACTIVE</strong> is generated for all registered attendees.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {templates.map((t) => {
            const isSelected = t.id === selectedTemplateId;
            const isActive = Boolean(t.is_active);

            return (
              <div
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`relative rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 border-cyan-500 shadow-lg ring-2 ring-cyan-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Active Glowing Pill */}
                {isActive && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
                    <Check className="w-3 h-3" /> ACTIVE
                  </div>
                )}

                <div className="space-y-3">
                  {/* Visual Color Preview Swatch */}
                  <div
                    className="w-full h-24 rounded-xl overflow-hidden relative shadow-inner flex items-center justify-center p-2"
                    style={{
                      background: `linear-gradient(135deg, ${t.primary_color || "#00A86B"} 0%, ${t.secondary_color || "#0F172A"} 100%)`,
                    }}
                  >
                    <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[9px] font-black text-slate-900 uppercase shadow-sm">
                      {t.badge_text?.slice(0, 15) || "I'M ATTENDING"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {t.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {t.top_tagline || t.event_heading}
                    </p>
                  </div>
                </div>

                {/* Bottom Action: Set Active */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  {isActive ? (
                    <div className="w-full py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] text-center flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> Live on Portal
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateTemplate(t.id);
                      }}
                      disabled={activating}
                      className="w-full py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Set Active
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. LIVE BADGE PREVIEW & CUSTOMIZER STUDIO                      */}
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
                  Badge Preview
                </h3>
              </div>

              {/* Attendee Selector Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedAttendeeMode}
                  onChange={(e) => setSelectedAttendeeMode(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="sample">Sample Demo: Victor Komavarapu</option>
                  <optgroup label="Real Registered Delegates">
                    {registrations.slice(0, 30).map((r) => (
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

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[11px] text-slate-500">
                💡 Attendees will see this badge on their registration success page with their individual photo, name, and designation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Template Customizer & Content Editor (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 block">
                Customizer Controls
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Customize Template Content & Styling
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={saving}
                className="py-2.5 px-5 rounded-xl bg-slate-900 dark:bg-cyan-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Save className="w-4 h-4 text-cyan-400" />
                )}
                <span>Save to Database</span>
              </button>

              <button
                type="button"
                onClick={() => handleActivateTemplate(editorForm.id)}
                disabled={activating || editorForm.is_active}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{editorForm.is_active ? "Currently Active" : "Activate"}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5 text-xs">
            {/* Template Title */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={editorForm.title}
                onChange={(e) => setEditorForm({ ...editorForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Top Tagline & Badge Pill */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Top Headline Tagline
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
                  Badge Pill Text (Over Photo)
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

            {/* Event Heading & Subheading */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Event Heading
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

            {/* CTA Button Text & QR Destination */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={editorForm.cta_text || "REGISTER NOW"}
                  onChange={(e) => setEditorForm({ ...editorForm, cta_text: e.target.value })}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium font-mono"
                />
              </div>
            </div>

            {/* Date, Venue & Queries Email */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Date Text
                </label>
                <input
                  type="text"
                  value={editorForm.date_text || "11th December 2026"}
                  onChange={(e) => setEditorForm({ ...editorForm, date_text: e.target.value })}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Queries Email
                </label>
                <input
                  type="email"
                  value={editorForm.contact_email || "registration@executivetalksmedia.in"}
                  onChange={(e) => setEditorForm({ ...editorForm, contact_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Colors Swatch Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Accent Color
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
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
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
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
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
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
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
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">
                Changes saved to the database are reflected instantaneously across all attendee portals.
              </span>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={saving}
                className="py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-cyan-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-md disabled:opacity-50"
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
    </div>
  );
}
