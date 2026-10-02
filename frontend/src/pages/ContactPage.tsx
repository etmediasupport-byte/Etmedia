import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHero } from "@/components/site/PageHero";
import { GlowBackdrop, Reveal, SectionHeading } from "@/components/site/primitives";
import { SEOHead } from "@/components/site/SEOHead";
import { contact, images } from "@/lib/site-data";
import { socket } from "@/lib/socket";
import {
  validateEmail,
  validatePhone,
  validateName,
  validateRequiredText,
  sanitizePhoneInput,
} from "@/lib/validation";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Loader2,
  Clock,
  MessageCircle,
  ExternalLink,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  Sparkles,
  Building2,
  Briefcase,
  Award,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Check,
  User,
  Zap,
  Ticket,
  Headphones,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";

interface ContactFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  designation?: string;
  subject?: string;
  message?: string;
}

interface ContactFormTouched {
  name?: boolean;
  email?: boolean;
  phone?: boolean;
  organization?: boolean;
  designation?: boolean;
  subject?: boolean;
  message?: boolean;
}

const ENQUIRY_CATEGORIES = [
  { id: "Event Registration & Delegate Passes", label: "Delegate Passes", icon: Ticket },
  { id: "Corporate Sponsorship & Partnership", label: "Sponsorship & Partners", icon: Award },
  { id: "Speaker & Keynote Nomination", label: "Speaker Nomination", icon: User },
  { id: "Executive Talks Magazine Feature", label: "Magazine Feature", icon: Sparkles },
  { id: "Careers & Talent Opportunities", label: "Careers & Hiring", icon: Briefcase },
  { id: "General Advisory Enquiry", label: "General Advisory", icon: Mail },
];

const FAQS = [
  {
    q: "How soon do I receive my official delegate confirmation pass?",
    a: "Once registered, passes are instantly processed. VIP and standard confirmation passes with scannable QR credentials and tax invoices are dispatched to your registered email address immediately upon verification.",
  },
  {
    q: "Can our organization customize a bespoke corporate sponsorship package?",
    a: "Yes. We offer tailored multi-city branding packages, dedicated keynote presentations, VIP networking lounges, and co-branded executive reports tailored to your commercial business intelligence goals.",
  },
  {
    q: "How can C-Suite leaders be nominated for conference speaking sessions?",
    a: "Senior leaders (CXOs, VPs, Directors) may submit speaker nominations directly through this portal. Our editorial advisory board evaluates nominations based on domain expertise and session relevance.",
  },
  {
    q: "Are corporate registrations eligible for GST input tax credit?",
    a: "Yes, 100%. All paid delegate passes and corporate sponsorship packages come with official GST-compliant tax invoices including your registered company GSTIN.",
  },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    designation: "",
    subject: "Event Registration & Delegate Passes",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<ContactFormTouched>({});
  const [fieldErrors, setFieldErrors] = useState<ContactFormErrors>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);
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
            whatsapp: data.settings.whatsapp_number
              ? `https://wa.me/${data.settings.whatsapp_number.replace(/\D/g, "")}`
              : prev.whatsapp,
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
        whatsapp: updated["whatsapp_number"]
          ? `https://wa.me/${updated["whatsapp_number"].replace(/\D/g, "")}`
          : prev.whatsapp,
      }));
    };

    const onNewEnquiry = (data: { notification: string }) => {
      setRealtimeNotification(data.notification);
    };

    socket.on("settings_updated", onSettingsUpdate);
    socket.on("new_contact_enquiry", onNewEnquiry);

    return () => {
      socket.off("settings_updated", onSettingsUpdate);
      socket.off("new_contact_enquiry", onNewEnquiry);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: ContactFormErrors = {};
    const nameVal = validateName(formData.name, "Full Name");
    if (!nameVal.isValid) errors.name = nameVal.error;

    const emailVal = validateEmail(formData.email, "Work Email Address");
    if (!emailVal.isValid) errors.email = emailVal.error;

    const phoneVal = validatePhone(formData.phone, "Phone Number");
    if (!phoneVal.isValid) errors.phone = phoneVal.error;

    const msgVal = validateRequiredText(formData.message, "Message", 8, 2500);
    if (!msgVal.isValid) errors.message = msgVal.error;

    setFieldErrors(errors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      organization: true,
      designation: true,
      subject: true,
      message: true,
    });

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          organization: formData.organization.trim(),
          designation: formData.designation.trim(),
          enquiryType: formData.subject,
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        toast.success("Executive enquiry submitted successfully! Our team will respond shortly.");
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

  const googleMapsEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d605.0938257152234!2d78.39276727347149!3d17.489720020286015!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb918dab342375%3A0x180a04af0c47f594!2sManjeera%20Trinity%20Corporate!5e0!3m2!1sen!2sus!4v1790947851856!5m2!1sen!2sus";

  const googleMapsDirectionsUrl =
    "https://www.google.com/maps/search/?api=1&query=Manjeera+Trinity+Corporate+JNTU+Hitech+Road+KPHB+Hyderabad";

  return (
    <div className="relative min-h-screen bg-slate-900/5 text-foreground selection:bg-cyan-500/30">
      <SEOHead
        pageKey="contact"
        title="Contact Us | Executive Talks Media Business Intelligence"
        description="Connect with Executive Talks Media Business Intelligence for B2B summit sponsorships, delegate passes, magazine features, speaker nominations, and executive partnerships."
        keywords="Contact Executive Talks Media, Executive Talks Hyderabad Headquarters, ET Media B2B Summits, CXO Conferences India, Corporate Sponsorships"
        url="https://www.executivetalksmedia.in/contact"
      />
      <GlowBackdrop />

      {/* Hero Section */}
      <PageHero
        crumb="Contact Concierge"
        title="Connect With Executive Talks Media"
        subtitle="Whether you are registering for a national C-Suite summit, exploring enterprise sponsorships, or featuring in Executive Talks Magazine, our executive relations team is at your service."
        image={images.heroNetworking}
      />

      {/* ========================================================= */}
      {/* 1. EXECUTIVE CONCIERGE TRUST BAR                          */}
      {/* ========================================================= */}
      <section className="border-y border-slate-200/90 bg-white py-4 shadow-2xs">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-display">Rapid Response</div>
                <div className="text-xs font-bold text-slate-900">&lt; 2 Hours Guaranteed</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 py-1 pt-3 md:pt-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-display">Executive Reach</div>
                <div className="text-xs font-bold text-slate-900">50,000+ C-Suite Leaders</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 py-1 pt-3 md:pt-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-display">Data Privacy</div>
                <div className="text-xs font-bold text-slate-900">100% Verified & Secure</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 py-1 pt-3 md:pt-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-display">Global Corporate HQ</div>
                <div className="text-xs font-bold text-slate-900">Hyderabad, India</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container-x relative pt-8 sm:pt-10 pb-12 space-y-12">
        
        {/* ========================================================= */}
        {/* 2. DEDICATED EXECUTIVE CHANNELS (4 PREMIUM CARDS)        */}
        {/* ========================================================= */}
        <section>
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-3 py-0.5 text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn shadow-2xs">
                  <Sparkles className="h-3 w-3 text-cyan-600 animate-pulse" />
                  <span>Direct Advisory Channels</span>
                </div>
                <h2 className="mt-1.5 text-xl sm:text-2xl lg:text-[1.85rem] font-extrabold font-display text-slate-900 tracking-tight leading-snug text-left">
                  Executive Concierge & Support Desks
                </h2>
                <p className="mt-1 text-slate-600 text-xs sm:text-sm font-sans font-medium text-left">
                  Connect directly with dedicated conference managers, sponsorship consultants, and editorial heads.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11.5px] font-bold text-slate-700 uppercase tracking-wider">Desk Online · 9 AM - 7 PM</span>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* CARD 1: Corporate HQ */}
            <Reveal delay={0.04}>
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-cyan-400 transition-all duration-300 h-full">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 group-hover:scale-105 transition-transform">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider text-cyan-700 uppercase border border-cyan-200/60">
                      Corporate HQ
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-cyan-600 transition-colors">
                      Corporate Headquarters
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium">
                      Unit No-1012, 10th Floor, Manjeera Trinity Corporate, JNTU-Hitech Road, KPHB, Hyderabad 500072.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <a
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors group-hover:translate-x-0.5"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* CARD 2: Delegate Passes & Registration */}
            <Reveal delay={0.08}>
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all duration-300 h-full">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-105 transition-transform">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider text-purple-700 uppercase border border-purple-200/60">
                      Delegates & Passes
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-purple-600 transition-colors">
                      Delegate Registration Desk
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium">
                      Inquiries on delegate passes, group bookings, VIP passes, and registration status.
                    </p>
                    <div className="mt-2 text-xs font-bold text-slate-800 space-y-1">
                      <div>📞 +91 91002 66777</div>
                      <div className="text-purple-700 truncate">✉️ registration@executivetalksmedia.in</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <a
                    href="tel:+919100266777"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <span>Call Pass Coordinator</span>
                    <Phone className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* CARD 3: Sponsorship & Partnerships */}
            <Reveal delay={0.12}>
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 h-full">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
                      <Award className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider text-emerald-700 uppercase border border-emerald-200/60">
                      Sponsorships
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Corporate Alliances Desk
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium">
                      Summit sponsorships, exhibition booths, keynote speaking, and bespoke enterprise alliances.
                    </p>
                    <div className="mt-2 text-xs font-bold text-slate-800 space-y-1">
                      <div>💬 WhatsApp: +91 91002 66777</div>
                      <div className="text-emerald-700 truncate">✉️ partner.support@executivetalksmedia.in</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <span>Instant WhatsApp Chat</span>
                    <MessageCircle className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* CARD 4: Media & Magazine Desk */}
            <Reveal delay={0.16}>
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 h-full">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 group-hover:scale-105 transition-transform">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider text-amber-700 uppercase border border-amber-200/60">
                      Editorial Desk
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-slate-900 group-hover:text-amber-600 transition-colors">
                      Executive Talks Magazine
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium">
                      Leader interviews, cover story features, media accreditations, and editorial inquiries.
                    </p>
                    <div className="mt-2 text-xs font-bold text-slate-800 space-y-1">
                      <div>🕒 Mon – Sat: 9:00 AM – 7:00 PM</div>
                      <div className="text-amber-700 truncate">✉️ contact@executivetalksmedia.in</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <a
                    href="mailto:contact@executivetalksmedia.in"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <span>Email Editorial Team</span>
                    <Mail className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. MAIN INTERACTIVE EXECUTIVE ENQUIRY SECTION            */}
        {/* ========================================================= */}
        <section className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT: THE LUXURY ENQUIRY FORM (7 COLS) */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl text-slate-900">
                {/* Top Subtle Ambient Glow */}
                <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-cyan-600 font-display">
                      <Zap className="h-3.5 w-3.5 text-cyan-600 animate-pulse" />
                      <span>Executive Enquiry Desk</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 tracking-tight mt-0.5">
                      Send Direct Message
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Complete the form below to connect directly with the conference advisory desk.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/contact/form")}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-all cursor-pointer shadow-2xs shrink-0"
                  >
                    <span>Multi-Step Wizard</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {realtimeNotification && (
                  <div className="mb-5 rounded-2xl bg-cyan-50/80 p-3 text-xs font-bold text-cyan-800 border border-cyan-200/80 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping shrink-0" />
                    <span>{realtimeNotification}</span>
                  </div>
                )}

                {submitted ? (
                  <div className="rounded-3xl bg-gradient-to-b from-cyan-50/60 to-white p-8 text-center border border-cyan-200/80 my-4 shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 mb-4">
                      <Check className="h-8 w-8 stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl font-black font-display text-slate-900">Enquiry Received!</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                      Thank you for contacting Executive Talks Media Business Intelligence. Your reference inquiry has been logged in our executive database and assigned to a coordinator.
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setFormData({
                            name: "",
                            email: "",
                            phone: "",
                            organization: "",
                            designation: "",
                            subject: "Event Registration & Delegate Passes",
                            message: "",
                          });
                        }}
                        className="rounded-full gradient-brand px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform cursor-pointer border-none"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    
                    {/* Category Selection Chips */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                        Select Inquiry Category *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ENQUIRY_CATEGORIES.map((cat) => {
                          const isSelected = formData.subject === cat.id;
                          const IconComp = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, subject: cat.id })}
                              className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                                isSelected
                                  ? "border-cyan-500 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-500/20 shadow-xs"
                                  : "border-slate-200/90 bg-slate-50/70 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300"
                              }`}
                            >
                              <IconComp className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-cyan-600" : "text-slate-400"}`} />
                              <span className="truncate">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, name: val });
                            if (touched.name) {
                              const res = validateName(val, "Full Name");
                              setFieldErrors((prev) => ({ ...prev, name: res.isValid ? "" : res.error }));
                            }
                          }}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, name: true }));
                            const res = validateName(formData.name, "Full Name");
                            setFieldErrors((prev) => ({ ...prev, name: res.isValid ? "" : res.error }));
                          }}
                          placeholder="e.g. Rajesh Sharma"
                          className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                            touched.name && fieldErrors.name
                              ? "border-rose-500 bg-rose-50/40 focus:ring-2 focus:ring-rose-500/20"
                              : "border-slate-200 bg-slate-50/70 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                          }`}
                        />
                      </div>
                      {touched.name && fieldErrors.name && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Work Email & Phone Grid */}
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                          Work Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, email: val });
                            if (touched.email) {
                              const res = validateEmail(val, "Work Email");
                              setFieldErrors((prev) => ({ ...prev, email: res.isValid ? "" : res.error }));
                            }
                          }}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, email: true }));
                            const res = validateEmail(formData.email, "Work Email");
                            setFieldErrors((prev) => ({ ...prev, email: res.isValid ? "" : res.error }));
                          }}
                          placeholder="rajesh@company.com"
                          className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                            touched.email && fieldErrors.email
                              ? "border-rose-500 bg-rose-50/40 focus:ring-2 focus:ring-rose-500/20"
                              : "border-slate-200 bg-slate-50/70 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                          }`}
                        />
                        {touched.email && fieldErrors.email && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                            <span>⚠️</span> {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                          Contact Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={15}
                          value={formData.phone}
                          onChange={(e) => {
                            const cleanVal = sanitizePhoneInput(e.target.value);
                            setFormData({ ...formData, phone: cleanVal });
                            if (touched.phone) {
                              const res = validatePhone(cleanVal, "Phone Number");
                              setFieldErrors((prev) => ({ ...prev, phone: res.isValid ? "" : res.error }));
                            }
                          }}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, phone: true }));
                            const res = validatePhone(formData.phone, "Phone Number");
                            setFieldErrors((prev) => ({ ...prev, phone: res.isValid ? "" : res.error }));
                          }}
                          placeholder="+91 98765 43210"
                          className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                            touched.phone && fieldErrors.phone
                              ? "border-rose-500 bg-rose-50/40 focus:ring-2 focus:ring-rose-500/20"
                              : "border-slate-200 bg-slate-50/70 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                          }`}
                        />
                        {touched.phone && fieldErrors.phone && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                            <span>⚠️</span> {fieldErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Organization & Designation (Recommended) */}
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                          Company / Organization <span className="text-slate-400 lowercase font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="e.g. Acme Enterprise Ltd"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                          Designation / Role <span className="text-slate-400 lowercase font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          placeholder="e.g. Chief Marketing Officer"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Detailed Message */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                        Detailed Message / Requirements *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.message}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, message: val });
                          if (touched.message) {
                            const res = validateRequiredText(val, "Message", 8, 2500);
                            setFieldErrors((prev) => ({ ...prev, message: res.isValid ? "" : res.error }));
                          }
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, message: true }));
                          const res = validateRequiredText(formData.message, "Message", 8, 2500);
                          setFieldErrors((prev) => ({ ...prev, message: res.isValid ? "" : res.error }));
                        }}
                        placeholder="Tell us about your requirements, delegate count, sponsorship interests, or summit queries..."
                        className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                          touched.message && fieldErrors.message
                            ? "border-rose-500 bg-rose-50/40 focus:ring-2 focus:ring-rose-500/20"
                            : "border-slate-200 bg-slate-50/70 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                        }`}
                      />
                      {touched.message && fieldErrors.message && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                          <span>⚠️</span> {fieldErrors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="gradient-brand w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-xs sm:text-sm font-extrabold tracking-wide text-white shadow-[0_4px_20px_rgba(0,174,239,0.35)] hover:shadow-[0_6px_28px_rgba(0,174,239,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 cursor-pointer border-none"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing Transmission...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Executive Enquiry</span>
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-center text-[10.5px] text-slate-500 font-medium">
                      🔒 Your submission is encrypted and reviewed under standard enterprise confidentiality protocols.
                    </p>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* RIGHT COLUMN: EXECUTIVE ADVISORY SIDEBAR (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* CARD 1: OFFICIAL SOCIAL MEDIA HUB */}
            <Reveal delay={0.06}>
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-md">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Globe className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-extrabold font-display text-slate-900">
                    Official Media & Social Hub
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                  Follow Executive Talks Media across verified official channels for live C-Suite dialogue, speaker updates, and summit broadcasts.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* LinkedIn */}
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/40 transition-all text-xs font-bold text-slate-800 group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0A66C2] text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Linkedin className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display">LinkedIn</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate">@executivetalks</div>
                    </div>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 transition-all text-xs font-bold text-slate-800 group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white shadow-xs group-hover:scale-105 transition-transform">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display">WhatsApp</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate">+91 91002 66777</div>
                    </div>
                  </a>

                  {/* YouTube */}
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-[#FF0000]/10 hover:border-[#FF0000]/40 transition-all text-xs font-bold text-slate-800 group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF0000] text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Youtube className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display">YouTube</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate">Executive Talks TV</div>
                    </div>
                  </a>

                  {/* Instagram */}
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-rose-500/10 hover:border-rose-400 transition-all text-xs font-bold text-slate-800 group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Instagram className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display">Instagram</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate">@executivetalks</div>
                    </div>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* CARD 2: VIP CONCIERGE ASSURANCES */}
            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-7 text-white shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-widest text-cyan-400 font-btn">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>VIP Concierge Protocol</span>
                  </div>
                  <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                    B2B Enterprise Standard
                  </span>
                </div>

                <h3 className="text-lg font-bold font-display text-white">
                  Why Global Leaders Partner With Executive Talks Media
                </h3>

                <ul className="mt-4 space-y-2.5 text-xs text-slate-300 font-medium">
                  <li className="flex items-start gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span><strong>Strictly Curated Attendance:</strong> Over 90% decision-making C-Suite & VP delegations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span><strong>Commercial Outcomes:</strong> Curated 1-on-1 enterprise match-making & brand impact.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span><strong>Pan-India Intelligence:</strong> Flagship summits hosted across Hyderabad, Mumbai, Bengaluru & Delhi.</span>
                  </li>
                </ul>

                <div className="mt-5 pt-4 border-t border-slate-700/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Need instant phone assistance?
                  </div>
                  <a
                    href="tel:+919100266777"
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>+91 91002 66777</span>
                    <Phone className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Reveal>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. DELEGATE & SPONSOR FAQS SECTION                        */}
        {/* ========================================================= */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-sm">
          <div className="max-w-2xl mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-3 py-0.5 text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn shadow-2xs">
              <Headphones className="h-3 w-3 text-cyan-600" />
              <span>Quick Assistance & Guidance</span>
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold font-display text-slate-900 tracking-tight text-left">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-slate-600 text-xs sm:text-sm font-sans font-medium text-left">
              Key information regarding delegate registration, passes, tax invoices, and partnership deliverables.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? "border-cyan-400 bg-cyan-50/30 shadow-xs" : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 cursor-pointer gap-3"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-cyan-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed font-medium border-t border-cyan-100/60 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. GOOGLE MAPS EMBED & HEADQUARTERS NAVIGATION SECTION    */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-50 px-3 py-0.5 text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.15em] text-cyan-800 uppercase font-btn shadow-2xs">
                  <Navigation className="h-3 w-3 text-cyan-600" />
                  <span>Corporate Location & Navigation</span>
                </div>
                <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold font-display text-slate-900 tracking-tight text-left">
                  Visit Executive Talks Media Corporate Headquarters
                </h2>
                <p className="mt-1 text-slate-600 text-xs sm:text-sm font-sans font-medium text-left">
                  Situated in the heart of Hyderabad's premier corporate and technological hub at Manjeera Trinity Corporate.
                </p>
              </div>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform shrink-0"
              >
                <span>Get Turn-by-Turn Directions</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>

          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-2xl bg-white">
              
              {/* Responsive Iframe Container */}
              <iframe
                title="Executive Talks Media Business Intelligence Headquarters Map - Manjeera Trinity Corporate"
                src={googleMapsEmbedUrl}
                width="100%"
                height="460"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full transition-all duration-500"
              />

              {/* Floating Location Information Badge Card */}
              <div className="hidden sm:block absolute bottom-5 left-5 max-w-sm rounded-2xl bg-white/95 backdrop-blur-md p-4 border border-slate-200/90 shadow-xl text-slate-900 z-10">
                <div className="flex items-center gap-2 text-cyan-700 font-extrabold text-[11px] uppercase tracking-wider mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Executive Talks Media HQ</span>
                </div>
                <div className="font-bold text-xs text-slate-900">
                  Unit No-1012, 10th Floor, Manjeera Trinity Corporate
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  JNTU - HITEC City Road, KPHB Phase 3, Hyderabad, Telangana 500072
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-emerald-600">● 5 Min from JNTU Metro</span>
                  <a
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-cyan-600 hover:underline flex items-center gap-1"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>

            </div>
          </Reveal>
        </section>

      </div>
    </div>
  );
}
