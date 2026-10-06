import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Sparkles, ArrowUpRight, Zap, Clock } from "lucide-react";
import { MouseTiltCard } from "@/components/ui/MouseTiltCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { images, getValidImageUrl } from "@/lib/site-data";

export function EventCard({ event, onRegister }: { event: any; onRegister?: (event: any, mode?: "paid" | "free") => void }) {
  const navigate = useNavigate();
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
      const targetSlug = event.slug || event.id || "hr-recall-2k26";
      if (mode === "free") {
        navigate(`/events/${targetSlug}/register-free`);
      } else {
        navigate(`/events/${targetSlug}/register`);
      }
    }
  };

  const imageSrc = getValidImageUrl(event.image || event.event_image || event.about_image || event.photo, event.title, event.category);

  return (
    <MouseTiltCard className="group relative overflow-hidden rounded-2xl sm:rounded-3xl h-full flex flex-col justify-between border border-slate-200/90 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-cyan-400 w-full max-w-full">
      {/* Top Right Atmospheric Glow */}
      <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/15 transition-all pointer-events-none z-10" />

      <Link to={`/events/${event.slug || event.id}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col justify-between group/card w-full">
        {/* Banner Image Container */}
        <div className="relative h-44 sm:h-48 md:h-52 w-full overflow-hidden shrink-0 bg-slate-100">
          <img
            src={imageSrc}
            alt={event.title}
            loading="lazy"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = getValidImageUrl("", event.title, event.category);
            }}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

          {/* Category Badge */}
          <span className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 rounded-full border border-white/20 bg-slate-950/80 backdrop-blur-md px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider shadow-md max-w-[65%] truncate">
            {event.category || "Leadership Conclave"}
          </span>

          {event.is_featured === 1 && (
            <span className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-extrabold text-white shadow-lg shrink-0">
              <Sparkles className="h-3 w-3 animate-pulse" /> Featured
            </span>
          )}

          {/* Location & Date Bar Overlay */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-10 flex items-center justify-between text-[10px] sm:text-xs text-slate-200 font-medium bg-slate-950/85 backdrop-blur-md px-2 sm:px-3 py-1.5 rounded-xl border border-white/10 gap-1 overflow-hidden">
            <span className="flex items-center gap-1 truncate min-w-0 flex-1">
              <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-400 shrink-0" />
              <strong className="text-white font-semibold truncate text-[10px] sm:text-xs">{dateText}</strong>
            </span>
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-cyan-300 font-semibold truncate shrink-0 ml-1">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-[130px]">{citiesText || primaryLoc.city || "Mumbai"}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
          <div className="flex-1 flex flex-col justify-start">
            <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] flex items-center text-left">
              {event.title}
            </h3>

            <p className="text-slate-600 mt-1 text-xs leading-relaxed font-sans line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] text-left">
              {event.description}
            </p>
          </div>

          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0 mt-auto gap-1.5 overflow-hidden">
            <span className="flex items-center gap-1 font-medium truncate min-w-0 flex-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">{venueText}</span>
            </span>
            <span className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${
              (event as any).allow_paid_registration === 0 && (event as any).allow_free_registration === 0
                ? "text-amber-800 bg-amber-50 border-amber-200"
                : "text-emerald-700 bg-emerald-50 border-emerald-200"
            }`}>
              {(event as any).allow_paid_registration !== 0 && (event as any).allow_paid_registration !== false && (event as any).allow_free_registration !== 0 && (event as any).allow_free_registration !== false
                ? "Free & Paid Passes"
                : (event as any).allow_paid_registration !== 0 && (event as any).allow_paid_registration !== false
                ? "Paid Passes"
                : (event as any).allow_free_registration !== 0 && (event as any).allow_free_registration !== false
                ? "Free Passes"
                : "Passes Releasing Soon"}
            </span>
          </div>
        </div>
      </Link>

      {/* Card Action Footer: Responsive Buttons Stack on Mobile */}
      <div className="p-3 sm:p-4 pt-0 flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full">
        {/* Button 1: Register Now (Paid Pass) */}
        {(event as any).allow_paid_registration !== 0 && (event as any).allow_paid_registration !== false && (
          <button
            type="button"
            onClick={(e) => handleRegisterClick(e, "paid")}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="truncate">Register Now</span>
          </button>
        )}

        {/* Button 2: Register Free Interest */}
        {(event as any).allow_free_registration !== 0 && (event as any).allow_free_registration !== false && (
          <button
            type="button"
            onClick={(e) => handleRegisterClick(e, "free")}
            className="w-full bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="truncate">Register Free</span>
          </button>
        )}

        {/* If both are hidden */}
        {((event as any).allow_paid_registration === 0 || (event as any).allow_paid_registration === false) &&
          ((event as any).allow_free_registration === 0 || (event as any).allow_free_registration === false) && (
            <Link
              to={`/events/${event.slug || event.id}`}
              className="w-full bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 border border-amber-200/80 rounded-xl py-2.5 px-3 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Passes Releasing Soon • View Details</span>
            </Link>
          )}
      </div>
    </MouseTiltCard>
  );
}
