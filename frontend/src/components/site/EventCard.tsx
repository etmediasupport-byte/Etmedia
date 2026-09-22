import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Sparkles, ArrowUpRight } from "lucide-react";
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
    <MouseTiltCard className="group relative overflow-hidden rounded-3xl h-full flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/90 bg-gradient-to-b from-white via-slate-50/90 to-slate-100/70 dark:from-slate-900/95 dark:via-slate-900 dark:to-slate-950/90 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20">
      {/* Top Right Atmospheric Glow */}
      <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/25 transition-all pointer-events-none z-10" />

      <div onClick={handleRegisterClick} className="cursor-pointer flex-1 flex flex-col justify-between">
        {/* Banner Image Container */}
        <div className="relative h-44 sm:h-48 md:h-52 w-full overflow-hidden shrink-0">
          <img
            src={event.image || "/assets/event-cfo-BjslOJNi.jpg"}
            alt={event.title}
            loading="lazy"
            width={800}
            height={450}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

          {/* Category Badge */}
          <span className="absolute top-3 left-3 z-10 rounded-full border border-white/30 bg-slate-950/75 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider shadow-md">
            {event.category || "Leadership Conclave"}
          </span>

          {event.is_featured === 1 && (
            <span className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-[11px] font-extrabold text-white shadow-lg">
              <Sparkles className="h-3 w-3 animate-pulse" /> Featured
            </span>
          )}

          {/* Location & Date Bar Overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs text-slate-200 font-medium bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
            <span className="flex items-center gap-1.5 truncate">
              <CalendarDays className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <strong className="text-white font-semibold">{dateText}</strong>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-semibold truncate ml-2">
              <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              {citiesText || primaryLoc.city || "Mumbai"}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
              {event.title}
            </h3>

            <p className="text-slate-600 dark:text-slate-400 mt-2 text-xs sm:text-sm leading-relaxed font-sans line-clamp-2">
              {event.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{venueText}</span>
            </span>
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
              Free Registration
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 sm:p-5 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
        <MagneticButton strength={10} className="w-full sm:flex-1">
          <button
            type="button"
            onClick={handleRegisterClick}
            className="w-full gradient-brand rounded-2xl py-3 px-4 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Register Your Free Interest</span>
          </button>
        </MagneticButton>
        <Link
          to={`/events/${event.slug || event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center flex items-center justify-center gap-1 shrink-0"
        >
          <span>Details</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </MouseTiltCard>
  );
}
