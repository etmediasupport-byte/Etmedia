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
      return <Crown className="h-7 w-7 text-amber-500" />;
    }
    if (lower.includes("premium") || lower.includes("vip") || lower.includes("diamond")) {
      return <Gem className="h-7 w-7 text-blue-600" />;
    }
    return <Star className="h-7 w-7 text-blue-500" />;
  };

  const isDark = theme === "dark";

  return (
    <div className="w-full space-y-6">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
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

      {/* 3-COLUMN CARDS GRID */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 items-stretch">
        {activePlans.map((plan) => {
          const isFeatured = plan.is_featured || plan.badge?.toLowerCase().includes("popular") || plan.name.toLowerCase().includes("gold");
          const isSelected = selectedPlanId === plan.id;

          return (
            <div
              key={plan.id || plan.name}
              className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 ${
                isDark
                  ? isFeatured
                    ? "bg-slate-900/90 border-2 border-cyan-400 shadow-xl shadow-cyan-500/10 scale-[1.02]"
                    : "bg-slate-900/50 border border-slate-800 hover:border-slate-700"
                  : isFeatured
                    ? "bg-white border-2 border-blue-500 shadow-2xl scale-[1.02] ring-4 ring-blue-500/10"
                    : "bg-white border border-slate-200 shadow-md hover:shadow-xl hover:border-slate-300"
              }`}
            >
              {/* BADGE (e.g. "Most Popular") */}
              {(plan.badge || isFeatured) && (
                <div className="absolute -top-3.5 right-6">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-4 py-1 text-xs font-black text-white shadow-md uppercase tracking-wider">
                    {plan.badge || "Most Popular"}
                  </span>
                </div>
              )}

              <div>
                {/* ICON & TITLE HEADER */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-2xl ${isDark ? "bg-slate-800" : "bg-blue-50/80 border border-blue-100"}`}>
                    {getPlanIcon(plan.name, isFeatured)}
                  </div>
                  <div>
                    <h4 className={`text-xl font-black font-display ${isDark ? "text-white" : "text-slate-900"}`}>
                      {plan.name}
                    </h4>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Executive Tier</span>
                  </div>
                </div>

                {/* PRICE SECTION */}
                <div className="my-5 border-y border-slate-100 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl sm:text-4xl font-black font-display tracking-tight ${isDark ? "text-cyan-400" : "text-slate-900"}`}>
                      ₹ {Number(plan.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">per person (Excl. 18% GST)</span>
                </div>

                {/* FEATURES BULLET LIST */}
                <ul className="space-y-3 my-6">
                  {Array.isArray(plan.features) &&
                    plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-medium">
                        <div
                          className={`mt-0.5 shrink-0 rounded-full p-0.5 ${
                            isFeatured ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                        <span className={isDark ? "text-slate-300" : "text-slate-700"}>{feat}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSelectPlan && onSelectPlan(plan)}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-5 text-sm font-black transition-all cursor-pointer shadow-md ${
                    isFeatured
                      ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:opacity-95 hover:scale-[1.02] shadow-cyan-500/25"
                      : isDark
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 hover:scale-[1.01]"
                  }`}
                >
                  <span>{plan.button_text || "Register Now"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
