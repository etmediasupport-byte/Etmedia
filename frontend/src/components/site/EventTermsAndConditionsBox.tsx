import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
  X,
} from "lucide-react";

export const EVENT_TERMS_AND_CONDITIONS = [
  {
    num: "1",
    title: "Accurate Information",
    content: "I confirm that all information and details provided by me in the registration form are true, accurate, and complete.",
  },
  {
    num: "2",
    title: "Communication Consent",
    content: "I provide my consent to receive calls, WhatsApp messages, SMS, and emails from the Event Organiser regarding the event, registration, updates, offers, and related activities.",
  },
  {
    num: "3",
    title: "Partner Communication",
    content: "I agree that my contact details may be shared with event partners, sponsors, exhibitors, and associated organisations for event-related communication, business networking, and relevant promotional communication.",
  },
  {
    num: "4",
    title: "Digital & Promotional Usage",
    content: "I provide my consent to the organiser to use my name, photograph, designation, company name, videos, and other event-related content for event promotions, social media, websites, digital campaigns, marketing materials, event reports, and other promotional activities.",
  },
  {
    num: "5",
    title: "Photography & Video Consent",
    content: "I understand that photographs and videos may be captured during the event and may be used by the organiser and its authorised partners for event coverage and promotional purposes.",
  },
  {
    num: "6",
    title: "Data Usage",
    content: "I authorise the organiser to collect, store, process, and use the information provided by me for event management, communication, networking, business opportunities, and promotional activities, subject to applicable laws.",
  },
  {
    num: "7",
    title: "Third-Party Communication",
    content: "I understand that event partners or sponsors may contact me regarding their products, services, business solutions, or networking opportunities based on the consent provided through this registration.",
  },
  {
    num: "8",
    title: "Event Updates",
    content: "I understand that event schedules, speakers, sessions, venue details, and other programme information may be subject to change.",
  },
  {
    num: "9",
    title: "Personal Safety & Belongings",
    content: "Participant safety and personal belongings are the sole responsibility of the participant. The Event Organiser, its partners, sponsors, venue, and associated personnel shall not be held responsible or liable for any loss, theft, damage, or misplacement of personal belongings, including mobile phones, laptops, bags, documents, valuables, or other personal items during the event. Participants are advised to take appropriate care of their personal belongings and valuables at all times.",
    isWarning: true,
  },
  {
    num: "10",
    title: "Consent & Acceptance",
    content: "By clicking “I Agree / Submit Registration,” I confirm that I have read and understood these Terms & Conditions and voluntarily provide my consent to the above terms.",
  },
];

export interface EventClauseItem {
  num: string | number;
  title: string;
  content: string;
  isWarning?: boolean;
}

interface EventTermsAndConditionsBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | null;
  className?: string;
  theme?: "light" | "dark";
  clauses?: EventClauseItem[];
  title?: string;
}

export function EventTermsAndConditionsBox({
  checked,
  onChange,
  error,
  className = "",
  theme = "light",
  clauses,
  title,
}: EventTermsAndConditionsBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isDark = theme === "dark";
  const activeClauses = (clauses && clauses.length > 0) ? clauses : EVENT_TERMS_AND_CONDITIONS;
  const activeTitle = title || "EVENT REGISTRATION – TERMS & CONDITIONS";
  const clauseCount = activeClauses.length;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Outer Card Container */}
      <div
        className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
          error
            ? "border-rose-500/80 bg-rose-50/40 ring-2 ring-rose-500/20"
            : checked
            ? isDark
              ? "border-cyan-500/50 bg-cyan-950/20 shadow-xs"
              : "border-cyan-600/40 bg-cyan-50/30 shadow-xs"
            : isDark
            ? "border-slate-800 bg-slate-900/60"
            : "border-slate-200 bg-slate-50/60"
        }`}
      >
        {/* Top Header Row with Checkbox & Expand Button */}
        <div className="flex items-start gap-3.5">
          <div className="pt-0.5 shrink-0">
            <input
              type="checkbox"
              id="event-terms-agreement"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-md border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer transition-all"
            />
          </div>

          <div className="flex-1 space-y-1.5">
            <label
              htmlFor="event-terms-agreement"
              className={`block text-xs sm:text-sm font-semibold leading-relaxed cursor-pointer select-none ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              I agree to Executive Talks Media{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="font-extrabold text-cyan-600 dark:text-cyan-400 underline hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Terms & Conditions</span>
              </button>
              , <span className="font-bold underline">Privacy Policy</span>, and Delegate Registration Guidelines.
            </label>

            {/* Quick summary chips & Accordion Toggle */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
                  isExpanded
                    ? "bg-cyan-600 text-white shadow-xs"
                    : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>{isExpanded ? `Hide ${clauseCount} Clauses` : `View ${clauseCount} Terms Clauses`}</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-[11px] font-bold text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Full Page View</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Inline Terms Viewer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden pt-4 mt-4 border-t border-slate-200 dark:border-slate-800"
            >
              <div
                className={`max-h-72 overflow-y-auto pr-2 space-y-3.5 text-xs rounded-xl p-3 sm:p-4 border ${
                  isDark
                    ? "bg-slate-950/80 border-slate-800/80 text-slate-300"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{activeTitle}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{clauseCount} Key Clauses</span>
                </div>

                {activeClauses.map((clause) => (
                  <div
                    key={String(clause.num)}
                    className={`space-y-1 p-2.5 rounded-xl border ${
                      clause.isWarning
                        ? isDark
                          ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                          : "bg-amber-50/70 border-amber-200 text-amber-900"
                        : isDark
                        ? "bg-slate-900/40 border-slate-800"
                        : "bg-slate-50/70 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-600/10 text-cyan-700 dark:text-cyan-300 text-[10px] font-black">
                        {clause.num}
                      </span>
                      <span className={clause.isWarning ? "text-amber-800 dark:text-amber-300 font-extrabold" : "text-slate-900 dark:text-white"}>
                        {clause.title}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-sans pl-7">
                      {clause.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 animate-in fade-in">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Full Modal Viewer */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-slate-900 font-sans"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 font-display">
                    EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                    {activeTitle}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                <p className="font-semibold text-slate-900">
                  By submitting the event registration form, you confirm and agree to the following {clauseCount} terms:
                </p>

                {activeClauses.map((clause) => (
                  <div
                    key={String(clause.num)}
                    className={`p-3.5 rounded-2xl border ${
                      clause.isWarning
                        ? "bg-amber-50 border-amber-200 text-amber-950"
                        : "bg-slate-50/80 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white text-[10px] font-black">
                        {clause.num}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">
                        {clause.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed pl-7">
                      {clause.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span>I agree to these {clauseCount} Terms & Conditions</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    onChange(true);
                    setShowModal(false);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-extrabold text-xs shadow-md shadow-cyan-600/20 hover:scale-105 transition-all cursor-pointer"
                >
                  Accept & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
