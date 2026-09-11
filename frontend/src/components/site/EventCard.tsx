import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { EventItem } from "@/lib/site-data";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="glass-card lift gradient-ring group overflow-hidden rounded-3xl">
      <div className="relative h-52 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          width={1200}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <span className="glass-dark absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold text-white">
          {event.category}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{event.description}</p>
        <dl className="text-muted-foreground mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-primary h-4 w-4 shrink-0" />
            <span className="truncate">{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="text-primary h-4 w-4 shrink-0" />
            <span className="truncate">{event.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-primary h-4 w-4 shrink-0" />
            <span className="truncate">{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="text-primary h-4 w-4 shrink-0" />
            <span className="truncate">{event.speakers} speakers</span>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/events/register"
            className="gradient-brand rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.04]"
          >
            Register Now
          </Link>
          <Link
            to={`/events/${event.slug}`}
            className="hover:bg-accent rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </article>
  );
}
