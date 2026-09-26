import React from "react";
import { Check, Crown, Gem, Star, ArrowRight, Sparkles } from "lucide-react";
import { getDefaultPricingPlans, checkEarlyBirdStatus, type PricingPlanTier } from "@/lib/site-data";
import { EarlyBirdCountdownTimer } from "@/components/site/EarlyBirdCountdownTimer";

interface RegistrationPlansGridProps {
  plans?: PricingPlanTier[];
  onSelectPlan?: (plan: PricingPlanTier) => void;
  selectedPlanId?: string;
  theme?: "light" | "dark";
  earlyBirdEnabled?: boolean | number;
  earlyBirdStartDate?: string;
  earlyBirdEndDate?: string;
}

export const RegistrationPlansGrid: React.FC<RegistrationPlansGridProps> = ({
  plans,
  onSelectPlan,
  selectedPlanId,
  theme = "light",
  earlyBirdEnabled,
  earlyBirdStartDate,
  earlyBirdEndDate,
}) => {
  const activePlans = Array.isArray(plans) && plans.length > 0 ? plans : getDefaultPricingPlans();

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

  const isDark = theme === "dark";

  return (
    <div className="w-full space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 via-blue-600 to-purple-600" />
          <div>
            <h3 className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Registration Plans
            </h3>
            <p className="text-xs text-slate-500 font-medium">Select your executive pass tier below</p>
          </div>
        </div>

        {earlyBirdInfo.isActive && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 px-3.5 py-1 text-xs font-black text-white shadow-md animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              EARLY BIRD OFFER ACTIVE
            </span>
          </div>
        )}
      </div>

      {/* LIVE COUNTDOWN TIMER BANNER IF EARLY BIRD IS ACTIVE */}
      {earlyBirdInfo.isActive && earlyBirdEndDate && (
        <div className="max-w-4xl mx-auto">
          <EarlyBirdCountdownTimer targetDate={earlyBirdEndDate} />
        </div>
      )}

      {/* CENTERED COMPACT CARDS CONTAINER */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3 items-stretch justify-center">
          {activePlans.map((plan) => {
            const isFeatured = plan.is_featured || plan.badge?.toLowerCase().includes("popular") || plan.name.toLowerCase().includes("gold");

            // Dynamic Price logic: if Early Bird active and early_bird_price exists
            const hasEarlyBird = earlyBirdInfo.isActive && plan.early_bird_price && plan.early_bird_price < plan.price;
            const displayPrice = hasEarlyBird ? plan.early_bird_price! : plan.price;
            const savings = hasEarlyBird ? plan.price - plan.early_bird_price! : 0;

            return (
              <div
                key={plan.id || plan.name}
                className={`relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-300 ${
                  isDark
                    ? isFeatured
                      ? "bg-slate-900 text-white ring-2 ring-purple-500/40"
                      : "bg-slate-900/60 text-slate-200"
                    : isFeatured
                      ? "bg-gradient-to-b from-blue-50/90 to-purple-50/90 text-slate-900 ring-2 ring-purple-400/50 shadow-lg"
                      : "bg-slate-50/80 text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {/* BADGE (e.g. "Most Popular" or "EARLY BIRD OFFER") */}
                <div className="absolute -top-3 right-4 flex items-center gap-1.5">
                  {hasEarlyBird && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 px-2.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-sm">
                      <Sparkles className="h-2.5 w-2.5" /> Early Bird
                    </span>
                  )}
                  {(plan.badge || isFeatured) && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      {plan.badge || "Most Popular"}
                    </span>
                  )}
                </div>

                <div>
                  {/* ICON & TITLE HEADER */}
                  <div className="flex items-center gap-2.5 mb-3 mt-1">
                    <div className={`p-2 rounded-xl ${isDark ? "bg-slate-800" : "bg-white shadow-sm"}`}>
                      {getPlanIcon(plan.name, isFeatured)}
                    </div>
                    <div>
                      <h4 className={`text-base font-black font-display ${isDark ? "text-white" : "text-slate-900"}`}>
                        {plan.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Executive Tier</span>
                    </div>
                  </div>

                  {/* PRICE SECTION */}
                  <div className="my-3 py-2 border-y border-slate-200/50">
                    {hasEarlyBird ? (
                      <div>
                        {/* Strikethrough Original Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-400 line-through">
                            ₹ {Number(plan.price).toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                            Save ₹ {savings.toLocaleString("en-IN")}
                          </span>
                        </div>
                        {/* Discounted Early Bird Price */}
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className={`text-2xl sm:text-3xl font-black font-display tracking-tight text-purple-600 dark:text-purple-400`}>
                            ₹ {Number(displayPrice).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${isDark ? "text-cyan-400" : "text-slate-900"}`}>
                          ₹ {Number(displayPrice).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <span className="text-[11px] font-medium text-slate-500">per person (Excl. 18% GST)</span>
                  </div>

                  {/* FEATURES BULLET LIST */}
                  <ul className="space-y-2 my-4">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-medium">
                          <div
                            className={`mt-0.5 shrink-0 rounded-full p-0.5 ${
                              isFeatured ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                            }`}
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span className={isDark ? "text-slate-300" : "text-slate-700"}>{feat}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* ACTION BUTTON */}
                <div className="mt-3 pt-3 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => onSelectPlan && onSelectPlan(plan)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-4 text-xs font-black transition-all cursor-pointer ${
                      hasEarlyBird
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white hover:opacity-95 shadow-md"
                        : isFeatured
                          ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:opacity-95"
                          : isDark
                            ? "bg-blue-600 text-white hover:bg-blue-500"
                            : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
                    }`}
                  >
                    <span>{plan.button_text || "Register Now"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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


