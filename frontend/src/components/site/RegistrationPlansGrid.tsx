import React from "react";
import { Check, Crown, Gem, Star, ArrowRight } from "lucide-react";
import { getDefaultPricingPlans, type PricingPlanTier } from "@/lib/site-data";

interface RegistrationPlansGridProps {
  plans?: PricingPlanTier[];
  onSelectPlan?: (plan: PricingPlanTier) => void;
  selectedPlanId?: string;
  theme?: "light" | "dark";
}

export const RegistrationPlansGrid: React.FC<RegistrationPlansGridProps> = ({
  plans,
  onSelectPlan,
  selectedPlanId,
  theme = "light",
}) => {
  const activePlans = Array.isArray(plans) && plans.length > 0 ? plans : getDefaultPricingPlans();

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
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-500 via-blue-600 to-purple-600" />
          <h3 className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Registration Plans
          </h3>
        </div>
        <span className="text-xs sm:text-sm font-bold text-cyan-600 flex items-center gap-1 hover:underline cursor-pointer">
          View All Plans <ArrowRight className="h-4 w-4" />
        </span>
      </div>

      {/* CENTERED COMPACT CARDS CONTAINER */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3 items-stretch justify-center">
          {activePlans.map((plan) => {
            const isFeatured = plan.is_featured || plan.badge?.toLowerCase().includes("popular") || plan.name.toLowerCase().includes("gold");

            return (
              <div
                key={plan.id || plan.name}
                className={`relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-300 ${
                  isDark
                    ? isFeatured
                      ? "bg-slate-900 text-white"
                      : "bg-slate-900/60 text-slate-200"
                    : isFeatured
                      ? "bg-gradient-to-b from-blue-50/90 to-purple-50/90 text-slate-900"
                      : "bg-slate-50/80 text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {/* BADGE (e.g. "Most Popular") */}
                {(plan.badge || isFeatured) && (
                  <div className="absolute -top-3 right-4">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      {plan.badge || "Most Popular"}
                    </span>
                  </div>
                )}

                <div>
                  {/* ICON & TITLE HEADER */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`p-2 rounded-xl ${isDark ? "bg-slate-800" : "bg-white"}`}>
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
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${isDark ? "text-cyan-400" : "text-slate-900"}`}>
                        ₹ {Number(plan.price).toLocaleString("en-IN")}
                      </span>
                    </div>
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
                      isFeatured
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

