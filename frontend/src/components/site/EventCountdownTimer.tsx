import React, { useState, useEffect } from "react";
import { Clock, Sparkles, Flame, Radio, CheckCircle } from "lucide-react";

export type EventStatus = "upcoming" | "starts_today" | "live" | "ended";

interface EventCountdownTimerProps {
  dateStr?: string;
  timeStr?: string;
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
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch && isoMatch[1] && isoMatch[2] && isoMatch[3]) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10) - 1;
      day = parseInt(isoMatch[3], 10);
    } else {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        year = parsed.getFullYear();
        month = parsed.getMonth();
        day = parsed.getDate();
      } else {
        const yMatch = trimmed.match(/\b(20\d\d)\b/);
        if (yMatch && yMatch[1]) year = parseInt(yMatch[1], 10);
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
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [dateStr, timeStr]);

  const pad = (num: number) => String(num).padStart(2, "0");

  if (status === "ended") {
    return (
      <div className={`rounded-3xl border border-slate-200 bg-slate-100/90 p-5 text-center shadow-xs ${className}`}>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-1 text-xs font-bold text-slate-700">
          <CheckCircle className="h-4 w-4 text-slate-500" />
          <span>This Event Has Ended</span>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">
          Registrations & live proceedings for this event have concluded.
        </p>
      </div>
    );
  }

  if (status === "live") {
    return (
      <div className={`rounded-3xl border border-rose-300 bg-gradient-to-r from-rose-500 via-red-600 to-pink-600 p-5 text-white shadow-xl shadow-rose-500/20 text-center animate-in fade-in duration-300 ${className}`}>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white border border-white/30">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <Radio className="h-4 w-4 animate-pulse" />
          <span>Event is Live Now</span>
        </div>
        <p className="mt-3 text-xs sm:text-sm font-bold opacity-95">
          🔴 The conference is currently in session! Click Join Event to participate live.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border border-cyan-200/80 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 p-5 sm:p-6 text-white shadow-xl shadow-cyan-950/20 relative overflow-hidden ${className}`}
    >
      {/* Decorative Glow elements */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          {status === "starts_today" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3.5 py-1 text-xs font-black text-amber-300 uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
              <span>Event Starts Today</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3.5 py-1 text-xs font-black text-cyan-300 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Upcoming Executive Event</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-bold tracking-wider uppercase">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span>EVENT STARTS IN</span>
        </div>
      </div>

      {/* 4 TIMER BOXES */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 mt-5 text-center">
        {/* DAYS */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2.5 sm:p-3 shadow-inner hover:border-cyan-400/40 transition-colors">
          <div className="text-xl sm:text-3xl font-black font-mono text-cyan-300 tracking-tight">
            {pad(timeLeft.days)}
          </div>
          <div className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
            DAYS
          </div>
        </div>

        {/* HOURS */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2.5 sm:p-3 shadow-inner hover:border-cyan-400/40 transition-colors">
          <div className="text-xl sm:text-3xl font-black font-mono text-white tracking-tight">
            {pad(timeLeft.hours)}
          </div>
          <div className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
            HOURS
          </div>
        </div>

        {/* MINUTES */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2.5 sm:p-3 shadow-inner hover:border-purple-400/40 transition-colors">
          <div className="text-xl sm:text-3xl font-black font-mono text-purple-300 tracking-tight">
            {pad(timeLeft.minutes)}
          </div>
          <div className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
            MINS
          </div>
        </div>

        {/* SECONDS */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2.5 sm:p-3 shadow-inner hover:border-emerald-400/40 transition-colors">
          <div className="text-xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight animate-pulse">
            {pad(timeLeft.seconds)}
          </div>
          <div className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
            SECS
          </div>
        </div>
      </div>
    </div>
  );
}
