import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Sparkles, Users } from "lucide-react";
import type { EventItem } from "@/lib/site-data";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function EventCard({ event }: { event: any }) {
  let parsedLocations: any[] = [];
  try {
    if (typeof event.locations === "string") {
      parsedLocations = JSON.parse(event.locations);
    } else if (Array.isArray(event.locations)) {
      parsedLocations = event.locations;
    }
  } catch (e) {}

  if (!parsedLocations || parsedLocations.length === 0) {
    parsedLocations = [{ city: event.city, venue: event.venue, date: event.date, time: event.time }];
  }

  const primaryLoc = parsedLocations[0] || {};
  const dateText = primaryLoc.date || event.date;
  const venueText = primaryLoc.venue || event.venue || `${event.city || "Mumbai"} Main Convention Center`;
  const timeText = primaryLoc.time || event.time || "09:00 AM — 06:00 PM";
  const speakersCount = event.speakers || 20;
  const citiesText = parsedLocations.map((l: any) => l.city).filter(Boolean).join(" • ");

  return (
    <MouseTiltCard className="glass-card group relative overflow-hidden rounded-3xl h-full flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/15">
      {/* Shine Effect Overlay on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-20" />

      <div>
        {/* Banner Image Container with Zoom Animation */}
        <div className="relative h-52 overflow-hidden bg-slate-100">
          <img
            src={event.image || "/assets/event-cfo-BjslOJNi.jpg"}
            alt={event.title}
            loading="lazy"
            width={1200}
            height={800}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {/* Category Badge */}
          <span className="absolute top-4 left-4 z-10 rounded-full border border-cyan-500/30 bg-white/95 backdrop-blur-md px-3.5 py-1 text-[11px] font-extrabold text-cyan-800 tracking-wide uppercase shadow-sm max-w-[60%] truncate whitespace-nowrap">
            {event.category}
          </span>
          {event.is_featured === 1 && (
            <span className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full gradient-brand px-3 py-1 text-[11px] font-extrabold text-white shadow-md font-btn">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          <h3 className="text-xl font-bold font-display text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors">
            {event.title}
          </h3>

          <p className="text-slate-600 mt-2.5 text-sm leading-relaxed font-sans line-clamp-2">
            {event.description}
          </p>

          {/* Event Metadata Grid */}
          <dl className="text-slate-600 mt-5 space-y-2 text-xs font-medium border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-cyan-600 h-4 w-4 shrink-0" />
              <span className="truncate font-semibold text-slate-800">{dateText}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-purple-600 h-4 w-4 shrink-0" />
              <span className="truncate">{timeText}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-cyan-600 h-4 w-4 shrink-0" />
              <span className="truncate font-medium text-slate-700">{venueText}</span>
            </div>
            {parsedLocations.length > 1 && (
              <div className="flex items-center gap-2 text-cyan-700 font-bold text-[11px] pt-1">
                <MapPin className="text-cyan-600 h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Rotating Cities: {citiesText}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Users className="text-slate-500 h-4 w-4 shrink-0" />
              <span>{speakersCount}+ Executive Speakers</span>
            </div>
          </dl>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-6 pt-0 flex items-center gap-3">
        <MagneticButton strength={15} className="gradient-brand rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 flex-1 text-center">
          <Link to={`/events/register?eventId=${event.slug}`} className="w-full h-full block">
            Register
          </Link>
        </MagneticButton>
        <Link
          to={`/events/${event.slug}`}
          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors font-btn text-center"
        >
          Learn More
        </Link>
      </div>
    </MouseTiltCard>
  );
}
