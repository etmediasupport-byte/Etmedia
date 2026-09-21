import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Sparkles, Users } from "lucide-react";
import type { EventItem } from "@/lib/site-data";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function EventCard({ event, onRegister }: { event: any; onRegister?: (event: any) => void }) {
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

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onRegister) {
      onRegister(event);
    } else {
      window.dispatchEvent(new CustomEvent("open-register-modal", { detail: event }));
    }
  };

  return (
    <MouseTiltCard className="glass-card group relative overflow-hidden rounded-t-none rounded-b-3xl h-full flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/15">
      {/* Shine Effect Overlay on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-20" />

      <div onClick={handleRegisterClick} className="cursor-pointer flex-1 flex flex-col justify-between">
        {/* Banner Image Container with Reduced Height & Zoom Animation */}
        <div className="relative h-28 sm:h-32 md:h-36 w-full overflow-hidden bg-slate-100 shrink-0">
          <img
            src={event.image || "/assets/event-cfo-BjslOJNi.jpg"}
            alt={event.title}
            loading="lazy"
            width={800}
            height={450}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Category Badge */}
          <span className="absolute top-2.5 left-2.5 z-10 rounded-full border border-cyan-500/30 bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-800 tracking-wide uppercase shadow-xs max-w-[60%] truncate whitespace-nowrap">
            {event.category}
          </span>
          {event.is_featured === 1 && (
            <span className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full gradient-brand px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs font-btn">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors line-clamp-2">
              {event.title}
            </h3>

            <p className="text-slate-600 mt-1 text-xs leading-relaxed font-sans line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Compact Event Metadata Grid */}
          <div className="text-slate-600 mt-2.5 space-y-1 text-xs font-medium border-t border-slate-100 pt-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-cyan-600 h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-semibold text-slate-800">{dateText}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-cyan-600 h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-medium text-slate-700">{venueText}</span>
            </div>
            {parsedLocations.length > 1 && (
              <div className="flex items-center gap-1.5 text-cyan-700 font-bold text-[10px]">
                <span className="truncate">Cities: {citiesText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-3.5 sm:p-4 pt-0 flex items-center gap-2 shrink-0">
        <MagneticButton strength={12} className="gradient-brand rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:brightness-110 flex-1 text-center cursor-pointer">
          <button
            type="button"
            onClick={handleRegisterClick}
            className="w-full h-full block font-btn cursor-pointer bg-transparent border-none text-white text-xs font-bold"
          >
            Register Now
          </button>
        </MagneticButton>
        <Link
          to={`/events/${event.slug || event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors font-btn text-center whitespace-nowrap"
        >
          Learn More ↗
        </Link>
      </div>
    </MouseTiltCard>
  );
}
