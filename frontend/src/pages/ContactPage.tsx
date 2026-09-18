import { useEffect, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { contact, images } from "@/lib/site-data";
import { socket } from "@/lib/socket";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Radio,
  Loader2,
  Clock,
  MessageCircle,
  ExternalLink,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Event Registration & Delegate Passes",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (p: string) => {
    const cleaned = p.trim();
    const digits = cleaned.replace(/\D/g, "");
    if (!cleaned) return "Phone number is required.";
    if (digits.length < 10) return "Please enter a valid 10-digit phone number (e.g. +91 98765 43210).";
    if (digits.length > 15) return "Phone number cannot exceed 15 digits.";
    return "";
  };
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: contact.linkedin,
    instagram: contact.instagram,
    youtube: contact.youtube,
    whatsapp: contact.whatsapp,
    twitter: "https://x.com/etmedia",
    facebook: "https://facebook.com/etmedia",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setSocialLinks((prev) => ({
            ...prev,
            linkedin: data.settings.linkedin_url || prev.linkedin,
            instagram: data.settings.instagram_url || prev.instagram,
            youtube: data.settings.youtube_url || prev.youtube,
            twitter: data.settings.twitter_url || prev.twitter,
            facebook: data.settings.facebook_url || prev.facebook,
            whatsapp: data.settings.whatsapp_number ? `https://wa.me/${data.settings.whatsapp_number.replace(/\D/g, "")}` : prev.whatsapp,
          }));
        }
      } catch (e) {
        console.warn("Contact settings fetch error:", e);
      }
    };
    fetchSettings();

    const onSettingsUpdate = (updated: Record<string, string>) => {
      setSocialLinks((prev) => ({
        ...prev,
        linkedin: updated["linkedin_url"] || prev.linkedin,
        instagram: updated["instagram_url"] || prev.instagram,
        youtube: updated["youtube_url"] || prev.youtube,
        twitter: updated["twitter_url"] || prev.twitter,
        facebook: updated["facebook_url"] || prev.facebook,
        whatsapp: updated["whatsapp_number"] ? `https://wa.me/${updated["whatsapp_number"].replace(/\D/g, "")}` : prev.whatsapp,
      }));
    };

    socket.on("settings_updated", onSettingsUpdate);

    // Listen for real-time socket events from backend
    const onLiveUsers = (data: { activeUsers: number }) => {
      setActiveUsers(data.activeUsers);
    };

    const onNewEnquiry = (data: { notification: string }) => {
      setRealtimeNotification(data.notification);
      toast.info(data.notification);
    };

    socket.on("live_users_update", onLiveUsers);
    socket.on("new_contact_enquiry", onNewEnquiry);

    return () => {
      socket.off("settings_updated", onSettingsUpdate);
      socket.off("live_users_update", onLiveUsers);
      socket.off("new_contact_enquiry", onNewEnquiry);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pErr = validatePhone(formData.phone);
    if (pErr) {
      setPhoneTouched(true);
      setPhoneError(pErr);
      toast.error(pErr);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          enquiryType: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        toast.success("Enquiry submitted successfully!");
      } else {
        toast.error(data.message || "Failed to submit enquiry.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const googleMapsDirectionsUrl =
    "https://www.google.com/maps/search/?api=1&query=Manjeera+Trinity+Corporate+JNTU+Hitech+Road+KPHB+Hyderabad";

  return (
    <div className="relative min-h-screen bg-background pb-24 text-foreground selection:bg-cyan-500/30">
      <GlowBackdrop />

      {/* Hero Section */}
      <PageHero
        crumb="Contact Us"
        title="Connect With ET Media"
        subtitle="Whether you wish to sponsor, attend, or feature in Executive Talks Magazine, our executive relations team is at your service."
        image={images.heroNetworking}
      />

      {/* Main Container */}
      <div className="container-x relative mt-12 space-y-16">
        
        {/* ==================================================== */}
        {/* 1. CONTACT CARDS GRID (5 Dedicated Cards)             */}
        {/* ==================================================== */}
        <section>
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-600 font-display flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Get In Touch</span>
              </span>
              <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                Contact & Support Channels
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Reach out directly via phone, email, WhatsApp, or visit our corporate office.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* CARD 1: Office Address */}
            <Reveal>
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full hover:border-cyan-500/50 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 group-hover:scale-110 transition-transform">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-cyan-100 dark:bg-cyan-950 px-2.5 py-0.5 text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                      Corporate HQ
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                      Corporate Address
                    </h3>
                    <div className="mt-2 space-y-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {contact.address.map((line, idx) => (
                        <p key={idx} className={idx === 0 ? "font-bold text-slate-800 dark:text-slate-200" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <a
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 hover:underline"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* CARD 2: Direct Phone Support */}
            <Reveal>
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full hover:border-cyan-500/50 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
                      <Phone className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 dark:text-purple-300">
                      Hotline
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                      Phone & Direct Support
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Connect directly with our delegate and sponsorship coordinators:
                    </p>

                    <div className="mt-3 space-y-2 text-sm font-semibold">
                      {contact.phones.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone.replace(/\s+/g, "")}`}
                          className="flex items-center gap-2 text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-purple-600" />
                          <span>{phone}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500">
                  <span>Fast resolution during operational business hours.</span>
                </div>
              </div>
            </Reveal>

            {/* CARD 3: WhatsApp Support */}
            <Reveal>
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full hover:border-emerald-500/50 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      Instant Chat
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                      WhatsApp Support
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Instant message our concierge team for seat availability, summit brochures, and VIP passes.
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat on WhatsApp (+91 91002 66777)</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* CARD 4: Email Support */}
            <Reveal>
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full hover:border-cyan-500/50 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 group-hover:scale-110 transition-transform">
                      <Mail className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-cyan-100 dark:bg-cyan-950 px-2.5 py-0.5 text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
                      Email Us
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                      Email Correspondence
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      For official proposals, media coverage & summit inquiries:
                    </p>

                    <div className="mt-3 space-y-2 text-xs font-semibold">
                      {contact.emails.map((email) => (
                        <a
                          key={email}
                          href={`mailto:${email}`}
                          className="flex items-center gap-2 text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5 text-cyan-600" />
                          <span>{email}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500">
                  <span>Guaranteed response within 24 business hours.</span>
                </div>
              </div>
            </Reveal>

            {/* CARD 5: Office Hours */}
            <Reveal>
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full hover:border-amber-500/50 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                      <Clock className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      7 Days Open
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                      Office Hours
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Our executive support desk is operational throughout the week:
                    </p>

                    <div className="mt-3 rounded-2xl bg-amber-500/10 p-3 text-xs font-extrabold text-amber-800 dark:text-amber-300 border border-amber-500/20">
                      {contact.hours}
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500">
                  <span>Available on all working days and conference weekends.</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 2. CONTACT FORM SECTION                               */}
        {/* ==================================================== */}
        <section className="grid gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="glass-card rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                      Send Us a Message
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Fill out the form below and our relations team will respond promptly.
                    </p>
                  </div>

                  {activeUsers !== null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Radio className="h-3 w-3 animate-pulse" />
                      Live ({activeUsers} Online)
                    </span>
                  )}
                </div>

                {realtimeNotification && (
                  <div className="mt-4 rounded-2xl bg-cyan-500/10 p-3.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                    {realtimeNotification}
                  </div>
                )}

                {submitted ? (
                  <div className="mt-8 rounded-3xl bg-cyan-500/10 p-8 text-center text-cyan-900 dark:text-cyan-200 border border-cyan-500/20">
                    <CheckCircle2 className="mx-auto h-14 w-14 text-cyan-600" />
                    <h3 className="mt-4 text-2xl font-extrabold font-display">Message Sent!</h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you for contacting ET Media Business Intelligence. Your enquiry has been dispatched directly to our executive team.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 rounded-full gradient-brand px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-background px-4 py-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="rajesh@company.com"
                          className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-background px-4 py-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Phone Number *</span>
                          {phoneTouched && !phoneError && formData.phone && (
                            <span className="text-[10px] font-extrabold text-emerald-500 flex items-center gap-1">
                              ✓ Valid phone number
                            </span>
                          )}
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/[^\d\+\-\s\(\)]/g, "");
                            setFormData({ ...formData, phone: cleanVal });
                            if (phoneTouched) setPhoneError(validatePhone(cleanVal));
                          }}
                          onBlur={() => {
                            setPhoneTouched(true);
                            setPhoneError(validatePhone(formData.phone));
                          }}
                          placeholder="+91 98765 43210"
                          className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors ${
                            phoneTouched && phoneError
                              ? "border-rose-500 focus:border-rose-500"
                              : phoneTouched && !phoneError && formData.phone
                              ? "border-emerald-500 focus:border-emerald-500"
                              : "border-slate-300 dark:border-slate-700 focus:border-cyan-500"
                          }`}
                        />
                        {phoneTouched && phoneError && (
                          <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in">
                            <span>⚠️</span> {phoneError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subject / Enquiry Type */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Subject / Category *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-background px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      >
                        <option value="Event Registration & Delegate Passes">Event Registration & Delegate Passes</option>
                        <option value="Corporate Sponsorship & Partnership">Corporate Sponsorship & Partnership</option>
                        <option value="Executive Talks Magazine Feature">Executive Talks Magazine Feature</option>
                        <option value="Speaker & Keynote Nomination">Speaker & Keynote Nomination</option>
                        <option value="General Media & Press Enquiry">General Media & Press Enquiry</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your requirements, company, and how we can assist..."
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-background px-4 py-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="gradient-brand flex w-full items-center justify-center gap-2 rounded-full py-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25 transition-transform hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {loading ? "Submitting..." : "Submit Message"}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* Sidebar Info & Social Media Connections */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <div className="glass-card rounded-3xl p-8 space-y-4 border border-slate-200/80 dark:border-slate-800">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-cyan-600" />
                  <span>Connect Across Platforms</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Follow ET Media Business Intelligence for live summit announcements, C-suite interviews, and industry intelligence reports.
                </p>

                {/* SOCIAL ICONS GRID */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:border-cyan-400 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 group"
                  >
                    <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-110 transition-transform">
                      <Linkedin className="h-4 w-4" />
                    </span>
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-400 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 group"
                  >
                    <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs group-hover:scale-110 transition-transform">
                      <Instagram className="h-4 w-4" />
                    </span>
                    <span>Instagram</span>
                  </a>

                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-400 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 group"
                  >
                    <span className="p-2 rounded-xl bg-red-600 text-white shadow-xs group-hover:scale-110 transition-transform">
                      <Youtube className="h-4 w-4" />
                    </span>
                    <span>YouTube</span>
                  </a>

                  <a
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 group"
                  >
                    <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 3. GOOGLE MAPS EMBED SECTION                         */}
        {/* ==================================================== */}
        <section className="space-y-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-600 font-display">
                  Corporate Location
                </span>
                <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                  Visit ET Media Headquarters
                </h2>
              </div>
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-all"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>

          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-900">
              <iframe
                title="ET Media Business Intelligence Headquarters Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.281144085444!2d78.38685717596001!3d17.493976399710305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91f42d2077e5%3A0xbceb03b22b64d1f2!2sManjeera%20Trinity%20Corporate!5e0!3m2!1sen!2sin!4v1710300000000!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full grayscale focus:grayscale-0 hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </Reveal>
        </section>

      </div>
    </div>
  );
}
