import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlowBackdrop } from "@/components/site/primitives";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";
import logo from "@/assets/UPDATED LOGO.jpeg";

export interface WizardField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea" | "url" | "number" | "file";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  colSpan?: 1 | 2;
  helpText?: string;
  validationRule?: (value: string) => string | null;
}

export interface WizardStepConfig {
  fields: WizardField[];
}

interface MultiStepFormWizardProps {
  storageKey: string;
  badgeText: string;
  title: string;
  subtitle: string;
  steps: WizardStepConfig[];
  initialValues?: Record<string, string>;
  onComplete: (data: Record<string, string>) => Promise<{ success: boolean; message?: string }>;
  successTitle?: string;
  successSubtitle?: string;
  cancelPath?: string;
  customFileUploadHandler?: (
    field: WizardField,
    file: File
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
}

export function MultiStepFormWizard({
  storageKey,
  badgeText,
  title,
  subtitle,
  steps,
  initialValues = {},
  onComplete,
  successTitle = "Application Submitted Successfully!",
  successSubtitle = "Thank you for reaching out. Our team will review your application and contact you shortly.",
  cancelPath = "/",
  customFileUploadHandler,
}: MultiStepFormWizardProps) {
  const navigate = useNavigate();
  const totalSteps = steps.length;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    // Attempt restore from localStorage
    try {
      const saved = localStorage.getItem(`etmedia_form_draft_${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialValues, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to restore form draft", e);
    }
    return { ...initialValues };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Auto-save form data on change
  useEffect(() => {
    try {
      localStorage.setItem(`etmedia_form_draft_${storageKey}`, JSON.stringify(formData));
    } catch (e) {
      console.warn("Failed to persist draft data", e);
    }
  }, [formData, storageKey]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = async (field: WizardField, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (customFileUploadHandler) {
      setUploadingField(field.name);
      try {
        const res = await customFileUploadHandler(field, file);
        if (res.success && res.url) {
          handleInputChange(field.name, res.url);
        } else {
          setErrors((prev) => ({ ...prev, [field.name]: res.error || "File upload failed" }));
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, [field.name]: "Network error uploading file" }));
      } finally {
        setUploadingField(null);
      }
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const stepConfig = steps[stepNumber - 1];
    if (!stepConfig) return true;

    const newErrors: Record<string, string> = {};

    stepConfig.fields.forEach((field) => {
      const val = (formData[field.name] || "").trim();

      if (field.required && !val) {
        newErrors[field.name] = `${field.label} is required.`;
        return;
      }

      if (val && field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          newErrors[field.name] = "Please enter a valid official email address.";
        }
      }

      if (val && field.type === "tel") {
        const digits = val.replace(/\D/g, "");
        if (digits.length < 10) {
          newErrors[field.name] = "Please enter a valid 10-digit mobile number.";
        }
      }

      if (val && field.validationRule) {
        const customErr = field.validationRule(val);
        if (customErr) {
          newErrors[field.name] = customErr;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      const res = await onComplete(formData);
      if (res.success) {
        // Clear saved draft on successful submit
        localStorage.removeItem(`etmedia_form_draft_${storageKey}`);
        setIsSuccess(true);
        if (res.message) setSuccessMessage(res.message);
      } else {
        setErrors((prev) => ({
          ...prev,
          _submit: res.message || "Submission failed. Please try again.",
        }));
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        _submit: err.message || "An unexpected error occurred. Please check network connection.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const currentStepFields = steps[currentStep - 1]?.fields || [];
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  if (isSuccess) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30">
        <GlowBackdrop />
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Executive Talks Media" className="h-9 w-auto rounded-lg shadow-sm" />
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase hidden sm:inline-block">
                EXECUTIVE TALKS MEDIA
              </span>
            </div>
            <button
              onClick={() => navigate(cancelPath)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>
        </header>

        {/* Success Card Container */}
        <main className="mx-auto flex flex-1 w-full max-w-2xl items-center justify-center p-4 sm:p-6">
          <div className="w-full rounded-3xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl shadow-cyan-950/40 text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400 ring-8 ring-cyan-500/5">
              <CheckCircle2 className="h-10 w-10 text-cyan-400" />
            </div>
            <div className="space-y-2">
              <span className="inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-extrabold text-cyan-300 tracking-wider uppercase">
                {badgeText}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{successTitle}</h1>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                {successMessage || successSubtitle}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate(cancelPath)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-8 py-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Executive Talks Media. All Rights Reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30">
      <GlowBackdrop />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Executive Talks Media" className="h-9 w-auto rounded-lg shadow-sm" />
            <span className="text-xs font-black tracking-widest text-cyan-400 uppercase hidden sm:inline-block">
              {badgeText}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(cancelPath)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </header>

      {/* Main Wizard Form Body */}
      <main className="mx-auto flex-1 w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Header Title Section */}
          <div className="space-y-2 border-b border-slate-800/80 pb-6">
            <div className="flex items-center justify-between">
              <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 tracking-wider uppercase">
                {badgeText}
              </span>

              {/* Progress Step Counter (NO STEP NAMES/TITLES DISPLAYED) */}
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Step {currentStep} of {totalSteps}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>

            {/* Sleek Progress Bar */}
            <div className="pt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form Submit Error Banner */}
          {errors["_submit"] && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
              ⚠️ {errors["_submit"]}
            </div>
          )}

          {/* Dynamic Fields Grid */}
          <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {currentStepFields.map((field) => {
                const isFullWidth = field.colSpan === 2 || field.type === "textarea";
                const fieldValue = formData[field.name] || "";
                const fieldError = errors[field.name];

                return (
                  <div key={field.name} className={isFullWidth ? "sm:col-span-2" : "sm:col-span-1"}>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5 tracking-wide">
                      {field.label} {field.required && <span className="text-cyan-400">*</span>}
                    </label>

                    {field.type === "select" ? (
                      <select
                        value={fieldValue}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-xs sm:text-sm font-medium text-white transition-all outline-none focus:ring-2 ${
                          fieldError
                            ? "border-rose-500 focus:ring-rose-500/30"
                            : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                        }`}
                      >
                        <option value="">-- Select {field.label} --</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        rows={4}
                        placeholder={field.placeholder}
                        value={fieldValue}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-xs sm:text-sm font-medium text-white transition-all outline-none focus:ring-2 ${
                          fieldError
                            ? "border-rose-500 focus:ring-rose-500/30"
                            : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                        }`}
                      />
                    ) : field.type === "file" ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(field, e)}
                          className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
                        />
                        {uploadingField === field.name && (
                          <div className="flex items-center gap-2 text-xs text-cyan-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Uploading document...</span>
                          </div>
                        )}
                        {fieldValue && (
                          <p className="text-xs text-emerald-400 font-mono break-all">
                            ✓ Document Attached: {fieldValue}
                          </p>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={fieldValue}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-xs sm:text-sm font-medium text-white transition-all outline-none focus:ring-2 ${
                          fieldError
                            ? "border-rose-500 focus:ring-rose-500/30"
                            : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                        }`}
                      />
                    )}

                    {field.helpText && <p className="mt-1 text-[11px] text-slate-500">{field.helpText}</p>}
                    {fieldError && <p className="mt-1 text-[11px] font-semibold text-rose-400">{fieldError}</p>}
                  </div>
                );
              })}
            </div>

            {/* Wizard Navigation Controls */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-800/80 pt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-8 py-3 text-xs font-black text-slate-950 hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Application</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Executive Talks Media. All Rights Reserved.
      </footer>
    </div>
  );
}
