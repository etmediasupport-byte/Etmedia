import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles,
  User,
  Briefcase,
  Building2,
  Camera,
  Upload,
  X,
  ArrowLeft,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import PromotionBadgeCard, {
  PromotionTemplate,
  AttendeeBadgeData,
} from "@/components/site/PromotionBadgeCard";

export default function SocialPosterStudioPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();

  // Load initial attendee data from URL query params or localStorage
  const initialStorageData = (() => {
    try {
      const saved = localStorage.getItem("socialPosterData");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read socialPosterData from localStorage", e);
    }
    return {};
  })();

  const [name, setName] = useState<string>(
    searchParams.get("name") ||
      initialStorageData.name ||
      "PRASANNA KUMAR PANDA"
  );
  const [designation, setDesignation] = useState<string>(
    searchParams.get("designation") ||
      initialStorageData.designation ||
      "CEO & Founder"
  );
  const [organization, setOrganization] = useState<string>(
    searchParams.get("organization") ||
      initialStorageData.organization ||
      "ASCEND MEDIA LABS"
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialStorageData.photoUrl || ""
  );

  const regId = searchParams.get("regId") || initialStorageData.regId || "DELEGATE-PASS";
  const targetSlug = slug || searchParams.get("slug") || initialStorageData.slug || "hr-recall-2k26";

  const [eventData, setEventData] = useState<any>(null);
  const [template, setTemplate] = useState<PromotionTemplate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync state changes to localStorage so registration tab can pick it up
  const syncToStorage = (updatedFields: Record<string, any>) => {
    try {
      const existing = (() => {
        try {
          const s = localStorage.getItem("socialPosterData");
          return s ? JSON.parse(s) : {};
        } catch {
          return {};
        }
      })();
      const merged = { ...existing, ...updatedFields };
      localStorage.setItem("socialPosterData", JSON.stringify(merged));
    } catch (err) {
      console.warn("Failed to sync poster data to localStorage:", err);
    }
  };

  // Fetch Event details & active template
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch Event details
        const resEvent = await fetch(`/api/events/${encodeURIComponent(targetSlug)}`);
        if (resEvent.ok) {
          const jsonEvent = await resEvent.json();
          if (jsonEvent && isMounted) {
            setEventData(jsonEvent);
          }
        }

        // 2. Fetch Active Promotion Template (pass slug and eventId)
        let tplUrl = `/api/promotion-templates/active?slug=${encodeURIComponent(targetSlug)}`;
        if (jsonEvent?.id) {
          tplUrl += `&eventId=${encodeURIComponent(jsonEvent.id)}`;
        }
        const resTpl = await fetch(tplUrl);
        if (resTpl.ok) {
          const jsonTpl = await resTpl.json();
          if (jsonTpl?.success && jsonTpl?.template && isMounted) {
            setTemplate(jsonTpl.template);
          }
        }
      } catch (err) {
        console.warn("Failed to load poster studio event data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [targetSlug]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large (max 5MB). Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPhotoUrl(dataUrl);
        syncToStorage({ photoUrl: dataUrl });
        toast.success("Profile photo updated on poster!");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    syncToStorage({ photoUrl: "" });
    toast.info("Photo removed from poster.");
  };

  const fallbackTemplate: PromotionTemplate = {
    id: "default-fallback",
    title: eventData?.title || "HR Recall Purple Orbit Badge",
    theme_style: "hr-recall-purple",
    badge_text: "I'M ATTENDING",
    top_tagline: "ONE BIG GATHERING",
    event_heading: eventData?.title || "AWARDS & CONNECT HR RECALL 2K26",
    sub_heading: eventData?.category || "Remembering 2026. Calling 2027",
    highlights: [
      "2000+ HR Pros",
      "50+ Speakers",
      "Awards",
      "Networking",
    ],
    cta_text: "REGISTER NOW",
    date_text: eventData?.date || "11th December 2026",
    venue_text: eventData?.venue
      ? `${eventData.venue}, ${eventData.city || ""}`
      : eventData?.city || "Gachibowli, Hyderabad",
    contact_email: "registration@executivetalksmedia.in",
    primary_color: "#28107A",
    secondary_color: "#2563EB",
    accent_color: "#EF4444",
    footer_bg: "#28107A",
  };

  const attendeeData: AttendeeBadgeData = {
    id: regId,
    name: name || "DELEGATE NAME",
    designation: designation || "EXECUTIVE DELEGATE",
    organization: organization || "COMPANY / ORGANIZATION",
    photo_url: photoUrl || "",
    event_title: eventData?.title || "HR RECALL 2K26",
    event_slug: targetSlug,
    date: eventData?.date || "11th December 2026",
    venue: eventData?.venue
      ? `${eventData.venue}, ${eventData.city || ""}`
      : eventData?.city || "Gachibowli, Hyderabad",
    regId: regId,
  };

  return (
    <>
      <Helmet>
        <title>
          {eventData?.title ? `${eventData.title} | Official Social Media Poster Studio` : "Official Event Social Media Poster Studio | Executive Talks Media"}
        </title>
        <meta
          name="description"
          content="Personalize, preview, download, and share your official Executive Talks event poster across LinkedIn, WhatsApp, and social media."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
        {/* TOP BAR / NAVIGATION */}
        <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to={`/events/${targetSlug}`}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Event</span>
              </Link>
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                    <span>Social Media Poster Studio</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Live
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden md:inline">
                {eventData?.title || "Executive Talks Summit"}
              </span>
              <a
                href={`/events/${targetSlug}/register`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <span>Return to Registration</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </header>

        {/* NOTICE BANNER */}
        <div className="bg-emerald-950/40 border-b border-emerald-800/40 px-4 py-2.5 text-center text-xs text-emerald-300 font-medium">
          ✨ <strong>Customize your details & photo</strong> on the left, then download your 1080×1080 banner or share directly to WhatsApp & LinkedIn!
        </div>

        {/* MAIN STUDIO CONTAINER */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: CUSTOMIZATION CONTROLS */}
            <div className="lg:col-span-5 space-y-6">
              {/* Event Badge Card Header */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                      Delegate Identity
                    </span>
                    <h2 className="text-lg font-black text-white mt-0.5">
                      Edit Poster Information
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                    Auto-Updates
                  </span>
                </div>

                {/* 1. DELEGATE PROFILE PHOTO UPLOAD (FIRST & PROMINENT) */}
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 p-4 sm:p-5 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Delegate Profile Photo / Headshot</span>
                    </label>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live on Poster
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    {photoUrl ? (
                      <div className="relative group shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg shadow-emerald-500/20">
                        <img
                          src={photoUrl}
                          alt="Delegate Avatar"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow transition-all cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-slate-800/90 border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center text-slate-400 shrink-0 shadow-inner">
                        <Camera className="w-8 h-8 mb-1 text-emerald-500/70" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                          Upload Photo
                        </span>
                      </div>
                    )}

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <p className="text-xs text-slate-300 font-medium">
                        {photoUrl
                          ? "✅ Your photo is active on your official summit poster."
                          : "Upload your professional headshot. It will be framed instantly into your circular poster badge."}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                        <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 cursor-pointer transition-all hover:scale-[1.02]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{photoUrl ? "Change Headshot" : "Upload Headshot (Max 5MB)"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                        {photoUrl && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. INPUT: FULL NAME */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your Full Name / Delegate Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      syncToStorage({ name: e.target.value });
                    }}
                    placeholder="e.g. Victor Komavarapu"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                  />
                </div>

                {/* 3. INPUT: DESIGNATION */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Designation / Professional Title</span>
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => {
                      setDesignation(e.target.value);
                      syncToStorage({ designation: e.target.value });
                    }}
                    placeholder="e.g. Chief Executive Officer / Unit Head - HR"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                  />
                </div>

                {/* 4. INPUT: ORGANIZATION */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Organization / Company Name</span>
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => {
                      setOrganization(e.target.value);
                      syncToStorage({ organization: e.target.value });
                    }}
                    placeholder="e.g. Ascend Media Labs / CARE Hospitals"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Event Quick Info Card */}
              {eventData && (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Summit Highlights
                  </span>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{eventData.date || "Summit Date"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : (eventData.city || "Hyderabad")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: LIVE BADGE PREVIEW & ACTIONS */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-5 sm:p-7 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-400 tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Live 1080×1080 Square Poster Preview</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      Ready for Social Media & Status Updates
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    Format: <span className="font-extrabold text-emerald-400">PNG (High Res)</span>
                  </span>
                </div>

                {/* THE BADGE CARD COMPONENT */}
                <div className="overflow-hidden rounded-2xl bg-slate-950 p-2 sm:p-4 border border-slate-800 flex justify-center">
                  <div className="w-full max-w-[580px]">
                    <PromotionBadgeCard
                      template={template || fallbackTemplate}
                      attendee={attendeeData}
                      onPhotoChange={(newPhoto) => {
                        setPhotoUrl(newPhoto);
                        syncToStorage({ photoUrl: newPhoto });
                      }}
                      allowPhotoUpload={true}
                    />
                  </div>
                </div>

                {/* POST-DOWNLOAD INSTRUCTIONS / REGISTRATION HELPER */}
                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>How to share your poster:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                    <li>Click <strong>Download Official Social Media Poster</strong> to save to your phone or computer.</li>
                    <li>Click <strong>WhatsApp</strong> or <strong>LinkedIn</strong> to post directly with pre-filled event hashtags.</li>
                    <li>You can now return to your registration browser tab to complete your registration passes and payment!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
