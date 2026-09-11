import { useEffect, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { GlowBackdrop, Reveal } from "@/components/site/primitives";
import { contact, images } from "@/lib/site-data";
import { socket } from "@/lib/socket";
import { Mail, MapPin, Phone, Send, CheckCircle2, Radio, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: "Event Registration",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  useEffect(() => {
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
      socket.off("live_users_update", onLiveUsers);
      socket.off("new_contact_enquiry", onNewEnquiry);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  return (
    <div className="relative min-h-screen bg-background pb-20">
      <GlowBackdrop />
      <PageHero
        crumb="Contact Us"
        title="Connect With ET Media"
        subtitle="Whether you wish to sponsor, attend, or feature in Executive Talks Magazine, our team is at your service."
        image={images.heroNetworking}
      />

      <section className="container-x relative mt-12 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Send Us a Message</h2>
              {activeUsers !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                  <Radio className="h-3 w-3 animate-pulse" />
                  Live ({activeUsers} active)
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Fill out the form below and our delegate relations team will respond within 24 hours.
            </p>

            {realtimeNotification && (
              <div className="mt-4 rounded-xl bg-primary/10 p-3 text-xs font-medium text-primary">
                {realtimeNotification}
              </div>
            )}

            {submitted ? (
              <div className="mt-8 rounded-2xl bg-primary/10 p-6 text-center text-primary">
                <CheckCircle2 className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-xl font-bold">Thank You!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your enquiry has been received and broadcasted in real-time to our team.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-full border border-primary px-5 py-2 text-xs font-semibold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Enquiry Type
                  </label>
                  <select
                    value={formData.enquiryType}
                    onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  >
                    <option>Event Registration</option>
                    <option>Sponsorship & Partnership</option>
                    <option>Executive Talks Magazine Feature</option>
                    <option>Speaker Nomination</option>
                    <option>General Media Enquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your organization and how we can assist..."
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-brand flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? "Submitting..." : "Submit Enquiry"}
                </button>
              </form>
            )}
          </div>
        </Reveal>

        <Reveal>
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-8">
              <h3 className="flex items-center gap-3 text-lg font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                Headquarters
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {contact.address.join(", ")}
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8">
              <h3 className="flex items-center gap-3 text-lg font-bold">
                <Phone className="h-5 w-5 text-primary" />
                Phone & Direct Support
              </h3>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {contact.phones.map((phone) => (
                  <p key={phone}>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-primary transition-colors">
                      {phone}
                    </a>
                  </p>
                ))}
                <p className="pt-2 text-xs font-medium text-foreground">{contact.hours}</p>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8">
              <h3 className="flex items-center gap-3 text-lg font-bold">
                <Mail className="h-5 w-5 text-primary" />
                Email Correspondence
              </h3>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {contact.emails.map((email) => (
                  <p key={email}>
                    <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                      {email}
                    </a>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
