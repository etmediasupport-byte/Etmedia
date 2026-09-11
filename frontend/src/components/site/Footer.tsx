import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import { contact } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="gradient-ink relative mt-8 overflow-hidden text-white/75">
      <div className="bg-brand-purple/30 float-orb absolute -top-24 left-1/3 h-72 w-72 rounded-full" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-flex rounded-2xl bg-white p-2">
            <img
              src={logo}
              alt="ET Media Business Intelligence"
              className="h-10 w-auto rounded-lg"
              loading="lazy"
              width={320}
              height={150}
            />
          </div>
          <p className="mt-5 text-sm leading-relaxed">
            ET Media Business Intelligence builds India's most credible leadership platforms —
            conferences, awards, media and networking for enterprise decision makers.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { href: contact.linkedin, Icon: Linkedin, label: "LinkedIn" },
              { href: contact.instagram, Icon: Instagram, label: "Instagram" },
              { href: contact.youtube, Icon: Youtube, label: "YouTube" },
              { href: contact.whatsapp, Icon: MessageCircle, label: "WhatsApp" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="glass-dark rounded-xl p-2.5 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
            Quick Links
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/magazine", label: "Executive Talks Magazine" },
              { to: "/events", label: "Events" },
              { to: "/contact", label: "Contact Us" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-[0.18em] text-white uppercase">Events</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { to: "/events/upcoming", label: "Upcoming Events" },
              { to: "/events/past", label: "Past Events" },
              { to: "/events/register", label: "Register with ET Media" },
              { to: "/events/partner", label: "Partner & Sponsorship" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-[0.18em] text-white uppercase">Contact</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{contact.phones.join(" · ")}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{contact.emails.join(" · ")}</span>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{contact.address.slice(1).join(", ")}</span>
            </li>
          </ul>

          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
              if (!input.value) return;
              toast.success("Subscribed to Executive Talks");
              e.currentTarget.reset();
            }}
          >
            <label htmlFor="footer-newsletter" className="text-xs tracking-wide uppercase">
              Newsletter
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="footer-newsletter"
                name="email"
                type="email"
                required
                placeholder="Work email"
                className="glass-dark min-w-0 flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none"
              />
              <button
                type="submit"
                className="gradient-brand shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container-x flex flex-col gap-2 border-t border-white/10 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ET Media Business Intelligence. All rights reserved.</p>
        <p>{contact.hours}</p>
      </div>
    </footer>
  );
}
