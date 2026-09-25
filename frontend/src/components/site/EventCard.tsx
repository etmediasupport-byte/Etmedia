import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Sparkles, ArrowUpRight, Zap } from "lucide-react";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function EventCard({ event, onRegister }: { event: any; onRegister?: (event: any, mode?: "paid" | "free") => void }) {
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

  const handleRegisterClick = (e: React.MouseEvent, mode: "paid" | "free") => {
    e.stopPropagation();
    e.preventDefault();
    if (onRegister) {
      onRegister(event, mode);
    } else {
      window.dispatchEvent(new CustomEvent("open-register-modal", { detail: { event, mode } }));
    }
  };

  return (
    <MouseTiltCard className="group relative overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-none rounded-bl-none h-full flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/90 bg-gradient-to-b from-white via-slate-50/90 to-slate-100/70 dark:from-slate-900/95 dark:via-slate-900 dark:to-slate-950/90 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20">
      {/* Top Right Atmospheric Glow */}
      <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/25 transition-all pointer-events-none z-10" />

      <div onClick={(e) => handleRegisterClick(e, "free")} className="cursor-pointer flex-1 flex flex-col justify-between">
        {/* Banner Image Container */}
        <div className="relative h-44 sm:h-48 md:h-52 w-full overflow-hidden shrink-0">
          <img
            src={event.image || "/assets/event-cfo-BjslOJNi.jpg"}
            alt={event.title}
            loading="lazy"
            width={800}
            height={450}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

          {/* Category Badge */}
          <span className="absolute top-3 left-3 z-10 rounded-full border border-white/30 bg-slate-950/75 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider shadow-md">
            {event.category || "Leadership Conclave"}
          </span>

          {event.is_featured === 1 && (
            <span className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 px-3 py-1 text-[11px] font-extrabold text-white shadow-lg">
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
          <div className="flex-1 flex flex-col justify-start">
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[2.75rem] sm:min-h-[3.25rem] flex items-center">
              {event.title}
            </h3>

            <p className="text-slate-600 dark:text-slate-400 mt-2 text-xs sm:text-sm leading-relaxed font-sans line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem]">
              {event.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0 mt-auto">
            <span className="flex items-center gap-1.5 font-medium truncate min-w-0 flex-1 pr-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{venueText}</span>
            </span>
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
              Free & Paid Passes
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer: BOTH Register Now (Paid) and Register Free Interest Buttons */}
      <div className="p-4 sm:p-5 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
        {/* Button 1: Register Now (Paid Pass) */}
        <MagneticButton strength={8} className="sm:flex-1">
          <button
            type="button"
            onClick={(e) => handleRegisterClick(e, "paid")}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-white" />
            <span>Register Now</span>
          </button>
        </MagneticButton>

        {/* Button 2: Register Free Interest */}
        <MagneticButton strength={8} className="sm:flex-1">
          <button
            type="button"
            onClick={(e) => handleRegisterClick(e, "free")}
            className="w-full bg-gradient-to-r from-cyan-500 via-teal-600 to-emerald-600 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Register Free</span>
          </button>
        </MagneticButton>

        {/* Button 3: Details */}
        <Link
          to={`/events/${event.slug || event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center flex items-center justify-center gap-1 shrink-0"
          aria-label="View event details"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </MouseTiltCard>
  );
}
