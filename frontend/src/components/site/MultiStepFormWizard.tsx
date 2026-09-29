import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlowBackdrop } from "@/components/site/primitives";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";
import {
  validateEmail,
  validatePhone,
  sanitizePhoneInput,
  sanitizeNumericInput,
  validateName,
  validateRequiredText,
  validateUrl,
} from "@/lib/validation";
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

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

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

  const handleFieldBlur = (field: WizardField) => {
    setTouchedFields((prev) => ({ ...prev, [field.name]: true }));
    const val = (formData[field.name] || "").trim();
    let err = "";

    if (field.required && !val) {
      err = `${field.label} is required.`;
    } else if (val) {
      if (field.type === "email") {
        const v = validateEmail(val, field.label);
        if (!v.isValid) err = v.error;
      } else if (field.type === "tel") {
        const v = validatePhone(val, field.label);
        if (!v.isValid) err = v.error;
      } else if (field.type === "url") {
        const v = validateUrl(val, field.label, field.required);
        if (!v.isValid) err = v.error;
      } else if (field.name.toLowerCase().includes("name") && field.type === "text") {
        const v = validateName(val, field.label);
        if (!v.isValid) err = v.error;
      } else if (field.validationRule) {
        const custom = field.validationRule(val);
        if (custom) err = custom;
      }
    }

    setErrors((prev) => ({ ...prev, [field.name]: err }));
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

      if (val) {
        if (field.type === "email") {
          const v = validateEmail(val, field.label);
          if (!v.isValid) newErrors[field.name] = v.error;
        } else if (field.type === "tel") {
          const v = validatePhone(val, field.label);
          if (!v.isValid) newErrors[field.name] = v.error;
        } else if (field.type === "url") {
          const v = validateUrl(val, field.label, field.required);
          if (!v.isValid) newErrors[field.name] = v.error;
        } else if (field.name.toLowerCase().includes("name") && field.type === "text") {
          const v = validateName(val, field.label);
          if (!v.isValid) newErrors[field.name] = v.error;
        }

        if (field.validationRule) {
          const customErr = field.validationRule(val);
          if (customErr) {
            newErrors[field.name] = customErr;
          }
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
      <div className="min-h-screen bg-slate-100/70 pt-28 pb-16">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center p-4 sm:p-6">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xl text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <span className="inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-black text-cyan-700 tracking-wider uppercase">
                {badgeText}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900">{successTitle}</h1>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
                {successMessage || successSubtitle}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(cancelPath)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-cyan-500 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pt-28 pb-16">
      {/* Main Wizard Form Body */}
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
          {/* Header Title Section */}
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between">
              <span className="inline-block rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-black text-cyan-700 tracking-wider uppercase">
                {badgeText}
              </span>

              {/* Progress Step Counter */}
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Step {currentStep} of {totalSteps}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>

            {/* Sleek Progress Bar */}
            <div className="pt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form Submit Error Banner */}
          {errors["_submit"] && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-50 p-4 text-xs font-bold text-rose-700">
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

                const isTouched = touchedFields[field.name];
                const isValid = isTouched && !fieldError && fieldValue.trim().length > 0;

                return (
                  <div key={field.name} className={isFullWidth ? "sm:col-span-2" : "sm:col-span-1"}>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide flex items-center justify-between">
                      <span>
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </span>
                      {isValid && (
                        <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                      )}
                    </label>

                    {field.type === "select" ? (
                      <select
                        value={fieldValue}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        onBlur={() => handleFieldBlur(field)}
                        className={`w-full rounded-2xl border bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                          fieldError
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : isValid
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/10"
                        }`}
                      >
                        <option value="">-- Select {field.label} --</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-white text-slate-900">
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
                        onBlur={() => handleFieldBlur(field)}
                        className={`w-full rounded-2xl border bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                          fieldError
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : isValid
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/10"
                        }`}
                      />
                    ) : field.type === "file" ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange(field, e)}
                          className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-700 hover:file:bg-cyan-500/20 cursor-pointer"
                        />
                        {uploadingField === field.name && (
                          <div className="flex items-center gap-2 text-xs text-cyan-600 font-bold">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Uploading document...</span>
                          </div>
                        )}
                        {fieldValue && (
                          <p className="text-xs text-emerald-600 font-bold break-all">
                            ✓ Document Attached: {fieldValue}
                          </p>
                        )}
                      </div>
                    ) : field.type === "tel" ? (
                      <input
                        type="tel"
                        maxLength={15}
                        placeholder={field.placeholder || "e.g. 98765 43210"}
                        value={fieldValue}
                        onChange={(e) => handleInputChange(field.name, sanitizePhoneInput(e.target.value))}
                        onBlur={() => handleFieldBlur(field)}
                        className={`w-full rounded-2xl border bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                          fieldError
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : isValid
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/10"
                        }`}
                      />
                    ) : field.type === "number" ? (
                      <input
                        type="number"
                        placeholder={field.placeholder}
                        value={fieldValue}
                        onChange={(e) => handleInputChange(field.name, sanitizeNumericInput(e.target.value))}
                        onBlur={() => handleFieldBlur(field)}
                        className={`w-full rounded-2xl border bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                          fieldError
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : isValid
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/10"
                        }`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={fieldValue}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        onBlur={() => handleFieldBlur(field)}
                        className={`w-full rounded-2xl border bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 transition-all outline-none focus:bg-white focus:ring-4 ${
                          fieldError
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : isValid
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/10"
                        }`}
                      />
                    )}

                    {field.helpText && <p className="mt-1 text-[11px] text-slate-500">{field.helpText}</p>}
                    {fieldError && <p className="mt-1 text-[11px] font-bold text-rose-500">⚠️ {fieldError}</p>}
                  </div>
                );
              })}
            </div>

            {/* Wizard Navigation Controls */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-3.5 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Step {currentStep - 1}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(cancelPath)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-3.5 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <span>Cancel</span>
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-cyan-500 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <span>Continue to Step {currentStep + 1}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Application...</span>
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
    </div>
  );
}
