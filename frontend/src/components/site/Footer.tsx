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
  Briefcase,
  BookOpen,
  Calendar,
  Layers,
  Globe,
  Twitter,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";
import logoFinal from "@/assets/logo-final.png";
import { contact } from "@/lib/site-data";
import { socket } from "@/lib/socket";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    toast.success("Thank you for subscribing to Executive Talks Business Intelligence!");
    setEmail("");
  };

  return (
    <footer className="gradient-ink relative mt-16 overflow-hidden text-slate-300 selection:bg-cyan-500/30 selection:text-white">
      {/* Background Glowing Ambient Orbs */}
      <div className="bg-cyan-500/10 float-orb absolute -top-24 left-1/4 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-purple-500/10 float-orb absolute -bottom-24 right-1/4 h-96 w-96 rounded-full blur-3xl" />

      {/* Top Border Glow Line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="container-x relative pt-12 pb-12 space-y-12">
        
        {/* ==================================================== */}
        {/* MAIN COLUMNS GRID (Brand, Quick Links, Events, Mag, Careers, Subscribe) */}
        {/* ==================================================== */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 pt-4">
          
          {/* COLUMN 1: BRAND LOGO & OVERVIEW (4 cols) */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex transition-transform hover:scale-105 bg-transparent">
              <img
                src={logoFinal}
                alt="ET Media Business Intelligence"
                className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto object-contain bg-transparent border-none shadow-none drop-shadow-[0_4px_16px_rgba(0,174,239,0.25)] transition-all duration-300"
                loading="lazy"
              />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-sm">
              ET Media Business Intelligence builds India's most credible C-suite leadership platforms — national conferences, executive summits, corporate awards, and industry intelligence.
            </p>

            {/* Social Icons Bar */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-display">
                Follow Us
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { href: socialLinks.linkedin, Icon: Linkedin, label: "LinkedIn", color: "hover:bg-blue-600" },
                  { href: socialLinks.instagram, Icon: Instagram, label: "Instagram", color: "hover:bg-rose-600" },
                  { href: socialLinks.youtube, Icon: Youtube, label: "YouTube", color: "hover:bg-red-600" },
                  { href: socialLinks.facebook, Icon: Facebook, label: "Facebook", color: "hover:bg-blue-700" },
                  { href: socialLinks.whatsapp, Icon: MessageCircle, label: "WhatsApp", color: "hover:bg-emerald-600" },
                ].map(({ href, Icon, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-display flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/partner", label: "Partner With Us" },
                { to: "/membership", label: "Membership" },
                { to: "/gallery", label: "Media Gallery" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all text-cyan-400" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: EVENTS (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-display flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>Events & Portals</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              {[
                { to: "/events", label: "All Conferences" },
                { to: "/events/cfo-leadership-summit-2026", label: "India CFO Summit" },
                { to: "/events/hr-excellence-awards-2026", label: "HR Excellence" },
                { to: "/magazine", label: "Executive Talks" },
                { to: "/careers", label: "Careers Portal" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all text-cyan-400" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: SUBSCRIBE NEWSLETTER (4 cols) */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-display flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-400" />
              <span>Subscribe to Newsletter</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Subscribe to receive curated C-suite insights, upcoming leadership summit announcements, and Executive Talks Magazine editions directly in your inbox.
            </p>
            {subscribed ? (
              <div className="rounded-xl bg-cyan-500/20 p-3 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                ✨ Subscribed! Thank you for joining Executive Talks.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your corporate work email..."
                  className="w-full min-w-0 rounded-xl border border-white/15 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-colors font-medium"
                />
                <button
                  type="submit"
                  className="gradient-brand shrink-0 rounded-xl px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-cyan-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <span>Subscribe</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* ==================================================== */}
        {/* CONTACT INFO BAR (Address • Phone • Email • Hours)    */}
        {/* ==================================================== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-8 border-t border-white/10 text-xs">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block">Headquarters</span>
              <span className="text-slate-400 leading-snug block mt-0.5">
                {contact.address.slice(1).join(", ")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block">Support Hotline</span>
              <span className="text-slate-400 leading-snug block mt-0.5 font-mono">
                {contact.phones.join(" · ")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block">Official Email</span>
              <span className="text-slate-400 leading-snug block mt-0.5 font-mono">
                {contact.emails.join(" · ")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-bold block">Operational Hours</span>
              <span className="text-slate-400 leading-snug block mt-0.5">
                {contact.hours}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* BOTTOM COPYRIGHT BAR                                 */}
        {/* ==================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} ET Media Business Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-cyan-400 transition-colors">
              Contact Desk
            </Link>
            <span>·</span>
            <Link to="/careers" className="hover:text-cyan-400 transition-colors">
              Careers Portal
            </Link>
            <span>·</span>
            <Link to="/admin/login" className="text-slate-500 hover:text-white transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
