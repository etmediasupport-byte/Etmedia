import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
  Send,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
  Facebook,
  Twitter,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import executivetalksLogo from "@/assets/executivetalks-logo.jpeg";
import { contact } from "@/lib/site-data";
import { socket } from "@/lib/socket";
import { validateEmail } from "@/lib/validation";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: contact.linkedin,
    instagram: contact.instagram,
    youtube: contact.youtube,
    whatsapp: contact.whatsapp,
    twitter: "https://x.com/executivetalksmedia",
    facebook: "https://facebook.com/executivetalksmedia",
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
        console.warn("Footer settings fetch error:", e);
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
    return () => {
      socket.off("settings_updated", onSettingsUpdate);
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailVal = validateEmail(email, "Newsletter Email");
    if (!emailVal.isValid) {
      toast.error(emailVal.error);
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "Website Footer" }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        toast.success(data.message || "Thank you for subscribing to Executive Talks Business Intelligence!");
        setEmail("");
      } else {
        toast.error(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      toast.error("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-slate-950 text-slate-300 selection:bg-cyan-500/30 selection:text-white border-t border-slate-800/80 overflow-hidden font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="bg-cyan-500/5 float-orb absolute -top-24 left-1/4 h-80 w-80 rounded-full blur-3xl pointer-events-none" />
      <div className="bg-indigo-500/5 float-orb absolute -bottom-24 right-1/4 h-80 w-80 rounded-full blur-3xl pointer-events-none" />

      {/* Top Accent Gradient Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="container-x relative pt-8 sm:pt-10 pb-6 sm:pb-8 space-y-8">
        
        {/* ==================================================== */}
        {/* 1. TOP MAIN FOUR-COLUMN GRID                         */}
        {/* ==================================================== */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12">
          
          {/* COLUMN 1: BRAND IDENTITY & OVERVIEW (4 cols) */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-3.5">
            <Link to="/" className="inline-flex transition-transform hover:scale-[1.02] bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
              <img
                src={executivetalksLogo}
                alt="Executive Talks Media Business Intelligence"
                className="h-10 sm:h-11 w-auto object-contain bg-white"
                loading="lazy"
              />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-sm">
              Executive Talks Media Business Intelligence curates India's premier C-suite leadership platforms — national conferences, executive summits, corporate awards, and industry intelligence.
            </p>

            {/* Social Channels with Sleek Glass Badges */}
            <div className="pt-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-2 font-display">
                Connect With Us
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    href: socialLinks.linkedin,
                    Icon: Linkedin,
                    label: "LinkedIn",
                    hoverColor: "hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10",
                  },
                  {
                    href: socialLinks.instagram,
                    Icon: Instagram,
                    label: "Instagram",
                    hoverColor: "hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/10",
                  },
                  {
                    href: socialLinks.youtube,
                    Icon: Youtube,
                    label: "YouTube",
                    hoverColor: "hover:text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/10",
                  },
                  {
                    href: socialLinks.facebook,
                    Icon: Facebook,
                    label: "Facebook",
                    hoverColor: "hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10",
                  },
                  {
                    href: socialLinks.whatsapp,
                    Icon: MessageCircle,
                    label: "WhatsApp",
                    hoverColor: "hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/10",
                  },
                  {
                    href: socialLinks.twitter,
                    Icon: Twitter,
                    label: "X (Twitter)",
                    hoverColor: "hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10",
                  },
                ].map(({ href, Icon, label, hoverColor }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-400 transition-all duration-200 hover:scale-105 shadow-2xs ${hoverColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: QUICK NAVIGATION (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/partner", label: "Partners & Sponsors" },
                { to: "/magazine", label: "Executive Magazines" },
                { to: "/gallery", label: "Media Gallery" },
                { to: "/contact", label: "Contact Committee" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-3.5 group-hover:ml-0 transition-all text-cyan-400" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: SUMMITS & PORTALS (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>Summits & Portals</span>
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              {[
                { to: "/events", label: "All Conferences" },
                { to: "/events/cfo-leadership-summit-2026", label: "India CFO Summit" },
                { to: "/events/hr-excellence-awards-2026", label: "HR Excellence Awards" },
                { to: "/events/ai-tech-conclave-2026", label: "Enterprise AI Conclave" },
                { to: "/careers", label: "Careers Portal" },
                { to: "/verify-pass", label: "Verify Delegate Pass" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-3.5 group-hover:ml-0 transition-all text-cyan-400" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER SUBSCRIBE (4 cols) */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-400" />
              <span>Executive Intelligence</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Subscribe to receive curated C-suite insights, upcoming leadership summit announcements, and Executive Talks Magazine editions.
            </p>
            {subscribed ? (
              <div className="rounded-xl bg-cyan-500/10 p-3 text-xs font-bold text-cyan-300 border border-cyan-500/30 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Thank you for subscribing to Executive Talks.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter official work email..."
                    className="w-full min-w-0 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="gradient-brand shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:scale-102 transition-transform flex items-center justify-center gap-1.5 cursor-pointer border-none"
                  >
                    <span>{submitting ? "..." : "Subscribe"}</span>
                    <Send className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  🔒 Zero spam. Strictly verified corporate leadership insights.
                </p>
              </form>
            )}
          </div>

        </div>

        {/* ==================================================== */}
        {/* 2. CONTACT INFO CARDS (Address • Phone • Email • Hours) */}
        {/* ==================================================== */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-800/70 bg-slate-900/40 p-3">
            <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-white text-xs font-bold block">Headquarters</span>
              <span className="text-slate-400 text-xs leading-snug block mt-0.5">
                {contact.address.slice(1).join(", ")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-slate-800/70 bg-slate-900/40 p-3">
            <Phone className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-white text-xs font-bold block">Support Hotline</span>
              <div className="text-slate-400 text-xs leading-snug mt-0.5 space-y-0.5">
                {contact.phones.map((p) => (
                  <a key={p} href={`tel:${p.replace(/\D/g, "")}`} className="block hover:text-cyan-400 transition-colors">
                    {p}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-slate-800/70 bg-slate-900/40 p-3">
            <Mail className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-white text-xs font-bold block">Official Inquiries</span>
              <div className="text-slate-400 text-xs leading-snug mt-0.5 space-y-0.5">
                {contact.emails.slice(0, 3).map((em) => (
                  <a
                    key={em}
                    href={`mailto:${em}`}
                    className="block hover:text-cyan-400 transition-colors truncate"
                  >
                    {em}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-slate-800/70 bg-slate-900/40 p-3">
            <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-white text-xs font-bold block">Operational Hours</span>
              <span className="text-slate-400 text-xs leading-snug block mt-0.5">
                {contact.hours}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. BOTTOM COPYRIGHT & LEGAL BAR                      */}
        {/* ==================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 font-normal">
          <p>© {new Date().getFullYear()} Executive Talks Media Business Intelligence. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400">
            <Link to="/contact" className="hover:text-cyan-400 transition-colors">
              Contact Desk
            </Link>
            <span>·</span>
            <Link to="/careers" className="hover:text-cyan-400 transition-colors">
              Careers Portal
            </Link>
            <span>·</span>
            <Link to="/verify-pass" className="hover:text-cyan-400 transition-colors">
              Pass Verification
            </Link>
            <span>·</span>
            <Link to="/admin/login" className="text-slate-500 hover:text-cyan-400 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
