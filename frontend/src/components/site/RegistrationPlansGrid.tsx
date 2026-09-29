import React from "react";
import { Check, Crown, Gem, Star, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { checkEarlyBirdStatus, getDefaultPricingPlans, type PricingPlanTier } from "@/lib/site-data";
import { EarlyBirdCountdownTimer } from "@/components/site/EarlyBirdCountdownTimer";

interface RegistrationPlansGridProps {
  plans?: PricingPlanTier[];
  onSelectPlan?: (plan: PricingPlanTier) => void;
  selectedPlanId?: string;
  theme?: "light" | "dark";
  earlyBirdEnabled?: boolean | number;
  earlyBirdStartDate?: string;
  earlyBirdEndDate?: string;
  pricingAvailable?: boolean;
}

export const RegistrationPlansGrid: React.FC<RegistrationPlansGridProps> = ({
  plans,
  onSelectPlan,
  selectedPlanId,
  theme = "light",
  earlyBirdEnabled,
  earlyBirdStartDate,
  earlyBirdEndDate,
  pricingAvailable = true,
}) => {
  const isDark = theme === "dark";
  const activePlans = (Array.isArray(plans) && plans.length > 0) ? plans : getDefaultPricingPlans();

  // Check early bird status automatically based on system date
  const earlyBirdInfo = checkEarlyBirdStatus(
    earlyBirdEnabled ?? true,
    earlyBirdStartDate || "2026-01-01",
    earlyBirdEndDate || "2026-12-31"
  );

  const getPlanIcon = (name: string, isFeatured?: boolean) => {
    const lower = name.toLowerCase();
    if (lower.includes("gold") || lower.includes("popular") || isFeatured) {
      return <Crown className="h-5 w-5 text-amber-500" />;
    }
    if (lower.includes("premium") || lower.includes("vip") || lower.includes("diamond")) {
      return <Gem className="h-5 w-5 text-blue-600" />;
    }
    return <Star className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 via-blue-600 to-purple-600" />
          <div>
            <h3 className={`text-lg sm:text-xl font-black font-display tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Select Registration Pass Tier
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Choose your delegate pass tier to proceed with registration</p>
          </div>
        </div>

        {earlyBirdInfo.isActive && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 px-3 py-0.5 text-[11px] font-black text-white shadow-md animate-pulse">
              <Sparkles className="h-3 w-3" />
              EARLY BIRD OFFER ACTIVE
            </span>
          </div>
        )}
      </div>

      {/* LIVE COUNTDOWN TIMER BANNER IF EARLY BIRD IS ACTIVE */}
      {earlyBirdInfo.isActive && earlyBirdEndDate && (
        <div className="w-full">
          <EarlyBirdCountdownTimer targetDate={earlyBirdEndDate} />
        </div>
      )}

      {/* COMPACT RESPONSIVE CARDS GRID */}
      <div className="w-full">
        <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch justify-center">
          {activePlans.map((plan) => {
            const isFeatured = plan.is_featured || plan.badge?.toLowerCase().includes("popular") || plan.name.toLowerCase().includes("gold");

            // Dynamic Price logic: if Early Bird active and early_bird_price exists
            const hasEarlyBird = earlyBirdInfo.isActive && plan.early_bird_price && plan.early_bird_price < plan.price;
            const displayPrice = hasEarlyBird ? plan.early_bird_price! : plan.price;
            const savings = hasEarlyBird ? plan.price - plan.early_bird_price! : 0;

            const isSelected = Boolean(
              selectedPlanId &&
              (plan.name.toLowerCase() === selectedPlanId.toLowerCase() ||
               plan.id === selectedPlanId ||
               (!selectedPlanId && isFeatured))
            );

            return (
              <div
                key={plan.id || plan.name}
                onClick={() => onSelectPlan && onSelectPlan(plan)}
                className={`group relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? "border-cyan-600 ring-2 ring-cyan-500/30 bg-gradient-to-b from-cyan-50/80 to-blue-50/40 shadow-lg"
                    : isDark
                    ? isFeatured
                      ? "bg-slate-900 text-white border-purple-500/40 hover:border-purple-400"
                      : "bg-slate-900/60 text-slate-200 border-slate-800 hover:border-slate-700"
                    : isFeatured
                      ? "bg-gradient-to-b from-blue-50/70 to-purple-50/70 text-slate-900 border-purple-300 hover:border-purple-400 shadow-sm"
                      : "bg-slate-50/90 text-slate-900 border-slate-200 hover:border-cyan-400 hover:bg-white"
                }`}
              >
                {/* TOP BADGES */}
                <div className="absolute -top-2.5 right-3 flex items-center gap-1.5 z-10">
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-sm animate-in zoom-in-90">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Selected
                    </span>
                  )}
                  {hasEarlyBird && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-sm">
                      <Sparkles className="h-2.5 w-2.5" /> Early Bird
                    </span>
                  )}
                  {(plan.badge || isFeatured) && !isSelected && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-2.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
                      {plan.badge || "Most Popular"}
                    </span>
                  )}
                </div>

                <div>
                  {/* ICON & TITLE HEADER */}
                  <div className="flex items-center gap-2.5 mb-2 mt-0.5">
                    <div className={`p-2 rounded-xl shrink-0 ${isDark ? "bg-slate-800" : isSelected ? "bg-cyan-600 text-white shadow-xs" : "bg-white shadow-xs border border-slate-200/80"}`}>
                      {isSelected ? <CheckCircle2 className="h-4 w-4 text-white" /> : getPlanIcon(plan.name, isFeatured)}
                    </div>
                    <div>
                      <h4 className={`text-sm sm:text-base font-black font-display leading-tight ${isSelected ? "text-cyan-900" : isDark ? "text-white" : "text-slate-900"}`}>
                        {plan.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Executive Tier</span>
                    </div>
                  </div>

                  {/* PRICE SECTION */}
                  <div className="my-2.5 py-2 border-y border-slate-200/60">
                    {hasEarlyBird ? (
                      <div>
                        {/* Strikethrough Original Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 line-through">
                            ₹{Number(plan.price).toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-800">
                            Save ₹{savings.toLocaleString("en-IN")}
                          </span>
                        </div>
                        {/* Discounted Early Bird Price */}
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-purple-700">
                            ₹{Number(displayPrice).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className={`text-xl sm:text-2xl font-black font-display tracking-tight ${isSelected ? "text-cyan-700" : isDark ? "text-cyan-400" : "text-slate-900"}`}>
                          ₹{Number(displayPrice).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-slate-500">per delegate (Excl. 18% GST)</span>
                  </div>

                  {/* FEATURES BULLET LIST */}
                  <ul className="space-y-1.5 my-3">
                    {Array.isArray(plan.features) &&
                      plan.features.slice(0, 5).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] font-medium leading-snug">
                          <div
                            className={`mt-0.5 shrink-0 rounded-full p-0.5 ${
                              isSelected ? "bg-emerald-600 text-white" : isFeatured ? "bg-amber-500 text-white" : "bg-cyan-600 text-white"
                            }`}
                          >
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                          <span className={isSelected ? "text-slate-800 font-semibold" : isDark ? "text-slate-300" : "text-slate-600"}>{feat}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* ACTION BUTTON */}
                <div className="mt-2 pt-2.5 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan && onSelectPlan(plan);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 font-extrabold"
                        : hasEarlyBird
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white hover:opacity-95 shadow-xs"
                        : isFeatured
                        ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white hover:opacity-95 shadow-xs"
                        : "bg-slate-200 text-slate-800 hover:bg-cyan-600 hover:text-white"
                    }`}
                  >
                    <span>{isSelected ? "✓ Pass Selected" : `Select ${plan.name}`}</span>
                    {!isSelected && <ArrowRight className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


