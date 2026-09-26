import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface EarlyBirdCountdownTimerProps {
  targetDate: string; // YYYY-MM-DD or ISO string
  onExpire?: () => void;
  compact?: boolean;
}

export const EarlyBirdCountdownTimer: React.FC<EarlyBirdCountdownTimerProps> = ({
  targetDate,
  onExpire,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      if (!targetDate) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      // Parse target date assuming 23:59:59 on target date if no time specified
      const dateStr = targetDate.includes("T") ? targetDate : `${targetDate}T23:59:59`;
      const targetTime = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return null;
  }

  const formatTwoDigits = (num: number) => String(num).padStart(2, "0");

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-900/90 to-amber-900/90 px-2.5 py-1 text-[11px] font-black text-amber-300 shadow-sm border border-amber-500/30">
        <Clock className="h-3 w-3 animate-pulse text-amber-400" />
        <span>Offer Ends:</span>
        <span className="font-mono text-white font-black">
          {timeLeft.days > 0 ? `${formatTwoDigits(timeLeft.days)}d ` : ""}
          {formatTwoDigits(timeLeft.hours)}h {formatTwoDigits(timeLeft.minutes)}m {formatTwoDigits(timeLeft.seconds)}s
        </span>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 p-3 text-white shadow-md border border-purple-500/30">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-purple-500/20 p-1.5 text-amber-400 border border-purple-400/30">
            <Clock className="h-4 w-4 animate-spin text-amber-400" style={{ animationDuration: "6s" }} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 block">
              EARLY BIRD PROMO OFFER
            </span>
            <span className="text-xs font-black text-amber-300 flex items-center gap-1">
              Offer Ends In:
            </span>
          </div>
        </div>

        {/* TIME DIGITS GRID */}
        <div className="flex items-center gap-1.5 font-mono text-center">
          {timeLeft.days > 0 && (
            <div className="flex flex-col items-center rounded-lg bg-slate-950/80 px-2.5 py-1 border border-purple-500/40 min-w-[42px]">
              <span className="text-sm sm:text-base font-black text-amber-400">{formatTwoDigits(timeLeft.days)}</span>
              <span className="text-[8px] font-bold uppercase text-purple-300">Days</span>
            </div>
          )}
          <div className="flex flex-col items-center rounded-lg bg-slate-950/80 px-2.5 py-1 border border-purple-500/40 min-w-[42px]">
            <span className="text-sm sm:text-base font-black text-white">{formatTwoDigits(timeLeft.hours)}</span>
            <span className="text-[8px] font-bold uppercase text-purple-300">Hours</span>
          </div>
          <span className="text-amber-400 font-bold text-xs">:</span>
          <div className="flex flex-col items-center rounded-lg bg-slate-950/80 px-2.5 py-1 border border-purple-500/40 min-w-[42px]">
            <span className="text-sm sm:text-base font-black text-white">{formatTwoDigits(timeLeft.minutes)}</span>
            <span className="text-[8px] font-bold uppercase text-purple-300">Mins</span>
          </div>
          <span className="text-amber-400 font-bold text-xs">:</span>
          <div className="flex flex-col items-center rounded-lg bg-slate-950/80 px-2.5 py-1 border border-purple-500/40 min-w-[42px]">
            <span className="text-sm sm:text-base font-black text-amber-400 animate-pulse">{formatTwoDigits(timeLeft.seconds)}</span>
            <span className="text-[8px] font-bold uppercase text-purple-300">Secs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
