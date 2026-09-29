import React, { useState, useEffect } from "react";
import { Clock, Sparkles, Flame, Radio, CheckCircle, MapPin, CalendarDays } from "lucide-react";

export type EventStatus = "upcoming" | "starts_today" | "live" | "ended";

interface EventCountdownTimerProps {
  dateStr?: string;
  timeStr?: string;
  locationStr?: string;
  dateDisplayStr?: string;
  onStatusChange?: (status: EventStatus) => void;
  className?: string;
  compact?: boolean;
}

export function parseEventDateTime(dateStr?: string, timeStr?: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  if (dateStr && dateStr.trim()) {
    const trimmed = dateStr.trim();

    // 1. ISO format: YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    // 2. DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);

    if (isoMatch && isoMatch[1] && isoMatch[2] && isoMatch[3]) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10) - 1;
      day = parseInt(isoMatch[3], 10);
    } else if (dmyMatch && dmyMatch[1] && dmyMatch[2] && dmyMatch[3]) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10) - 1;
      year = parseInt(dmyMatch[3], 10);
    } else {
      // 3. String like "April 19-20, 2027" or "19-20 April 2027" or "14th October 2026"
      let cleaned = trimmed.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
      cleaned = cleaned.replace(/(\d{1,2})\s*[-–—to]+\s*\d{1,2}/i, "$1");

      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) {
        year = parsed.getFullYear();
        month = parsed.getMonth();
        day = parsed.getDate();
      } else {
        const directParsed = new Date(trimmed);
        if (!isNaN(directParsed.getTime())) {
          year = directParsed.getFullYear();
          month = directParsed.getMonth();
          day = directParsed.getDate();
        } else {
          const yMatch = trimmed.match(/\b(20\d\d)\b/);
          if (yMatch && yMatch[1]) year = parseInt(yMatch[1], 10);
        }
      }
    }
  }

  let startHour = 9;
  let startMin = 0;
  let endHour = 18;
  let endMin = 0;

  if (timeStr && timeStr.trim()) {
    const times = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi);
    if (times && times.length > 0) {
      const parseSingleTime = (str: string) => {
        const m = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!m || !m[1] || !m[2]) return { h: 9, m: 0 };
        let h = parseInt(m[1], 10);
        const min = parseInt(m[2], 10);
        const ampm = m[3] ? m[3].toUpperCase() : null;
        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return { h, m: min };
      };

      const firstTime = times[0];
      if (firstTime) {
        const start = parseSingleTime(firstTime);
        startHour = start.h;
        startMin = start.m;
      }

      if (times.length > 1 && times[1]) {
        const end = parseSingleTime(times[1]);
        endHour = end.h;
        endMin = end.m;
      } else {
        endHour = Math.min(23, startHour + 9);
      }
    }
  }

  const startDate = new Date(year, month, day, startHour, startMin, 0);
  const endDate = new Date(year, month, day, endHour, endMin, 0);

  return { startDate, endDate };
}

export function EventCountdownTimer({
  dateStr,
  timeStr,
  locationStr,
  dateDisplayStr,
  onStatusChange,
  className = "",
}: EventCountdownTimerProps) {
  const [status, setStatus] = useState<EventStatus>("upcoming");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const { startDate, endDate } = parseEventDateTime(dateStr, timeStr);

      let currentStatus: EventStatus = "upcoming";

      if (now > endDate) {
        currentStatus = "ended";
      } else if (now >= startDate && now <= endDate) {
        currentStatus = "live";
      } else {
        const sameDay =
          now.getFullYear() === startDate.getFullYear() &&
          now.getMonth() === startDate.getMonth() &&
          now.getDate() === startDate.getDate();

        currentStatus = sameDay ? "starts_today" : "upcoming";
      }

      setStatus(currentStatus);
      if (onStatusChange) {
        onStatusChange(currentStatus);
      }

      if (currentStatus === "upcoming" || currentStatus === "starts_today") {
        const diffMs = Math.max(0, startDate.getTime() - now.getTime());
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [dateStr, timeStr]);

  const displayLocation = locationStr?.trim() || "Location TBA";
  const displayDate = dateDisplayStr?.trim() || dateStr?.trim() || "Date TBA";

  return (
    <div className={`w-full ${className}`}>
      {/* Live / Starts Today status banner if active */}
      {status === "live" && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-rose-600 animate-pulse">
          <Radio className="h-4 w-4" />
          <span>Conference is Live Now</span>
        </div>
      )}

      {status === "starts_today" && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-700">
          <Flame className="h-4 w-4 text-amber-500 animate-bounce" />
          <span>Event Starts Today</span>
        </div>
      )}

      {status === "ended" && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-600">
          <CheckCircle className="h-4 w-4 text-slate-500" />
          <span>Event Concluded</span>
        </div>
      )}

      {/* 6 Clean Cards Layout Matching Exact Screenshot Design */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 items-stretch">
        {/* DAYS CARD */}
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xs border border-purple-100/90 hover:border-purple-300 hover:shadow-md transition-all flex flex-col items-center justify-center text-center min-h-[100px] sm:min-h-[110px]">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight leading-none">
            {timeLeft.days}
          </span>
          <span className="text-[10px] sm:text-xs font-extrabold uppercase text-[#7c3aed] tracking-wider mt-2">
            DAYS
          </span>
        </div>

        {/* HOURS CARD */}
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xs border border-purple-100/90 hover:border-purple-300 hover:shadow-md transition-all flex flex-col items-center justify-center text-center min-h-[100px] sm:min-h-[110px]">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight leading-none">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs font-extrabold uppercase text-[#7c3aed] tracking-wider mt-2">
            HOURS
          </span>
        </div>

        {/* MINS CARD */}
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xs border border-purple-100/90 hover:border-purple-300 hover:shadow-md transition-all flex flex-col items-center justify-center text-center min-h-[100px] sm:min-h-[110px]">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight leading-none">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs font-extrabold uppercase text-[#7c3aed] tracking-wider mt-2">
            MINS
          </span>
        </div>

        {/* SECS CARD */}
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xs border border-purple-100/90 hover:border-purple-300 hover:shadow-md transition-all flex flex-col items-center justify-center text-center min-h-[100px] sm:min-h-[110px]">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight leading-none">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs font-extrabold uppercase text-[#7c3aed] tracking-wider mt-2">
            SECS
          </span>
        </div>

        {/* EVENT LOCATION CARD */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 shadow-xs border border-purple-100/90 hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-3.5 min-h-[100px] sm:min-h-[110px]">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#f3e8ff] flex items-center justify-center text-[#7c3aed] shrink-0">
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-[#7c3aed]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-bold text-[#7c3aed]">
              Event Location
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 font-display truncate mt-0.5" title={displayLocation}>
              {displayLocation}
            </div>
          </div>
        </div>

        {/* EVENT DATE CARD */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 shadow-xs border border-purple-100/90 hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-3.5 min-h-[100px] sm:min-h-[110px]">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#f3e8ff] flex items-center justify-center text-[#7c3aed] shrink-0">
            <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-[#7c3aed]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs font-bold text-[#7c3aed]">
              Event Date
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 font-display truncate mt-0.5" title={displayDate}>
              {displayDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

