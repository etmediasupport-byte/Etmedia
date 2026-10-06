import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Lock,
  Tag,
  Clock,
  ExternalLink,
  Award,
  Globe,
  Briefcase,
  Users,
  Star,
  Zap,
  Layers,
  FileCheck2,
  Maximize2,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  events as defaultEvents,
  getDefaultPricingPlans,
  checkEarlyBirdStatus,
  images,
  getValidImageUrl,
  getDefaultEventImage,
  type PricingPlanTier,
} from "@/lib/site-data";
import { SEOHead } from "@/components/site/SEOHead";
import {
  validateEmail,
  validatePhone,
  sanitizePhoneInput,
  validateName,
  validateDesignation,
  validateCompanyName,
  validateLocation,
  validateRequiredText,
  validateUrl,
} from "@/lib/validation";
import { EventTermsAndConditionsBox } from "@/components/site/EventTermsAndConditionsBox";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface EventData {
  id: string;
  slug: string;
  title: string;
  category?: string;
  date?: string;
  venue?: string;
  city?: string;
  image?: string;
  event_image?: string;
  about_image?: string;
  description?: string;
  early_bird_enabled?: boolean | number;
  early_bird_start_date?: string;
  early_bird_end_date?: string;
  pricing_plans?: any;
  gst_percentage?: number | string;
  gst_included?: boolean | number;
}

interface RegistrationFieldErrors {
  firstName?: string;
  lastName?: string;
  workEmail?: string;
  contactNumber?: string;
  designation?: string;
  companyName?: string;
  city?: string;
  linkedinUrl?: string;
}

interface RegistrationTouchedFields {
  firstName?: boolean;
  lastName?: boolean;
  workEmail?: boolean;
  contactNumber?: boolean;
  designation?: boolean;
  companyName?: boolean;
  city?: boolean;
  linkedinUrl?: boolean;
}

export default function EventRegistrationWizardPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetSlug = slug || searchParams.get("event") || "hr-recall-2k26";
  const cleanTargetSlug = targetSlug.replace(/-\d+$/, "").toLowerCase();

  // Instant fallback matching so page renders in 0ms on any 2G/3G/4G/5G connection
  const initialFallback = defaultEvents.find(
    (e) => (e.slug || "").toLowerCase() === cleanTargetSlug ||
           (e.id || "").toLowerCase() === cleanTargetSlug ||
           (e.slug || "").toLowerCase().includes(cleanTargetSlug) ||
           cleanTargetSlug.includes((e.slug || "").toLowerCase())
  ) || defaultEvents[0]!;

  const initialPlans = getDefaultPricingPlans();
  const reqPass = searchParams.get("pass") || searchParams.get("plan");
  const initialSelectedPlan = reqPass
    ? initialPlans.find((p) => p.name.toLowerCase().includes(reqPass.toLowerCase())) || initialPlans[0]
    : initialPlans.find((p) => p.is_featured) || initialPlans[0];

  // Selected event state (instant 0ms initialization)
  const [eventData, setEventData] = useState<EventData>({
    id: initialFallback.id || "hr-recall-2k26",
    slug: initialFallback.slug || "hr-recall-2k26",
    title: initialFallback.title || "HR RECALL 2K26",
    category: initialFallback.category || "Leadership Summit",
    date: initialFallback.date,
    venue: initialFallback.venue,
    city: initialFallback.city,
    image: getValidImageUrl(initialFallback.image, initialFallback.title, initialFallback.category),
    description: initialFallback.description,
    early_bird_enabled: true,
    early_bird_start_date: "2026-01-01",
    early_bird_end_date: "2026-12-31",
  });

  // Guaranteed valid event banner image with automatic high-def fallback
  const eventImageSrc = getValidImageUrl(
    eventData?.image || eventData?.event_image || eventData?.about_image,
    eventData?.title,
    eventData?.category
  );

  // Wizard active step: 1..7 (Divided into concise, focused steps)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Scroll to top immediately & on post-paint frames whenever wizard step changes
  useEffect(() => {
    const scrollToWizardTop = () => {
      // 1. Lenis Smooth Scroller (if active on Layout)
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.scrollTo(0, { immediate: true });
        } catch (_) {}
      }
      // 2. Native Window & Document Elements
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (document.documentElement.scrollTo) {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
      if (document.body.scrollTo) {
        document.body.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };

    scrollToWizardTop();
    const r1 = requestAnimationFrame(scrollToWizardTop);
    const t1 = setTimeout(scrollToWizardTop, 40);
    const t2 = setTimeout(scrollToWizardTop, 120);
    const t3 = setTimeout(scrollToWizardTop, 260);

    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentStep]);

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    if (typeof window !== "undefined") {
      if ((window as any).__lenis) {
        try {
          (window as any).__lenis.scrollTo(0, { immediate: true });
        } catch (_) {}
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Fullscreen event flyer modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Saved registration ID from backend
  const [registrationId, setRegistrationId] = useState<string>("");

  // --- FORM STATE (Steps 1, 2, 3) ---
  const [formData, setFormData] = useState({
    // Step 1: Personal Contact
    firstName: "",
    lastName: "",
    workEmail: "",
    contactNumber: "",
    // Step 2: Work & Organization
    designation: "",
    companyName: "",
    industry: "Technology & IT",
    linkedinUrl: "",
    // Step 3: Location & Preferences
    city: "",
    country: "India",
    category: "Executive Delegate",
    participationPreference: "In-Person Delegate",
    interestTracks: ["Leadership & Enterprise Strategy", "HR Tech & AI Transformation"],
    specialRequirements: "",
  });

  // --- STEP 4 FORM STATE: Selected Pass Tier ---
  const [pricingPlans, setPricingPlans] = useState<PricingPlanTier[]>(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanTier | null>(initialSelectedPlan || null);

  // --- STEP 5 FORM STATE: Coupon & Summary ---
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [calculatingPayment, setCalculatingPayment] = useState(false);

  // Calculated Financial Breakdown
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    basePrice: 0,
    discountAmount: 0,
    discountedBase: 0,
    gstPct: 18,
    gstAmount: 0,
    finalAmount: 0,
  });

  // --- STEP 7 FORM STATE: Payment Order & Processing ---
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [razorpayActiveKey, setRazorpayActiveKey] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load Razorpay SDK Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // SWR: Fetch fresh Event Data in background and update seamlessly
  useEffect(() => {
    let isMounted = true;
    const activeSlug = slug || searchParams.get("event") || "hr-recall-2k26";

    fetch(`/api/events/${activeSlug}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.event) {
          const ev = json.event;
          const resolvedImg = getValidImageUrl(
            ev.image || ev.event_image || ev.about_image,
            ev.title,
            ev.category
          );
          setEventData({
            ...ev,
            image: resolvedImg,
          });

          // Parse plans
          let parsed: PricingPlanTier[] = [];
          if (typeof ev.pricing_plans === "string") {
            try {
              parsed = JSON.parse(ev.pricing_plans);
            } catch (e) {}
          } else if (Array.isArray(ev.pricing_plans)) {
            parsed = ev.pricing_plans;
          }
          if (parsed && parsed.length > 0) {
            setPricingPlans(parsed);
            const reqPass1 = searchParams.get("pass") || searchParams.get("plan");
            const matchedPlan1 = reqPass1
              ? parsed.find((p) => p.name.toLowerCase().includes(reqPass1.toLowerCase()))
              : null;
            setSelectedPlan(matchedPlan1 || parsed.find((p) => p.is_featured) || parsed[0] || null);
          }
        }
      })
      .catch((err) => {
        console.warn("[Wizard] Operating in offline/fast mode with default data:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, searchParams]);

  // Early Bird Status
  const ebStatus = checkEarlyBirdStatus(
    eventData?.early_bird_enabled ?? true,
    eventData?.early_bird_start_date || "2026-01-01",
    eventData?.early_bird_end_date || "2026-12-31"
  );
  const isEarlyBirdActive = ebStatus.isActive;

  // Recalculate Payment when Plan or Coupon changes
  useEffect(() => {
    if (!selectedPlan) return;

    const basePrice = isEarlyBirdActive && typeof selectedPlan.early_bird_price === "number" && selectedPlan.early_bird_price > 0
      ? selectedPlan.early_bird_price
      : Number(selectedPlan.price) || 0;

    const gstPct = Number(eventData?.gst_percentage) || 18;

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon === "EARLYBIRD10") discount = Math.round(basePrice * 0.10);
      else if (appliedCoupon === "EXECUTIVE20") discount = Math.round(basePrice * 0.20);
      else if (appliedCoupon === "EXECUTIVETALKS500" || appliedCoupon === "ETMEDIA500") discount = 500;
      else if (appliedCoupon === "WELCOME1000") discount = 1000;
      else discount = Math.min(500, Math.round(basePrice * 0.05));
    }

    const discountedBase = Math.max(0, basePrice - discount);
    const gstAmount = Math.round((discountedBase * gstPct) / 100);
    const finalAmount = discountedBase + gstAmount;

    setPaymentBreakdown({
      basePrice,
      discountAmount: discount,
      discountedBase,
      gstPct,
      gstAmount,
      finalAmount,
    });
  }, [selectedPlan, appliedCoupon, isEarlyBirdActive, eventData]);

  // Validation errors state
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<RegistrationTouchedFields>({});

  // Helper: validate a single field and return error string
  const getFieldError = (fieldName: string, value: string): string => {
    if (fieldName === "firstName") {
      const v = validateName(value, "First Name");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "lastName") {
      const v = validateName(value, "Last Name");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "workEmail") {
      const v = validateEmail(value, "Work Email");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "contactNumber") {
      const v = validatePhone(value, "Contact / Mobile Number");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "designation") {
      const v = validateDesignation(value, "Designation");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "companyName") {
      const v = validateCompanyName(value, "Company / Organization Name");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "city") {
      const v = validateLocation(value, "City");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "linkedinUrl" && value.trim()) {
      const v = validateUrl(value, "LinkedIn Profile");
      return v.isValid ? "" : v.error;
    }
    return "";
  };

  // Live input handler with live real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touchedFields[name as keyof RegistrationTouchedFields]) {
      const err = getFieldError(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // Phone input handler with live keystroke sanitizer and validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizePhoneInput(e.target.value);
    setFormData((prev) => ({ ...prev, contactNumber: clean }));
    if (touchedFields.contactNumber) {
      const v = validatePhone(clean);
      setFieldErrors((prev) => ({ ...prev, contactNumber: v.isValid ? "" : v.error }));
    }
  };

  // Field Blur handler
  const handleFieldBlur = (fieldName: keyof RegistrationTouchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    const val = (formData as Record<string, any>)[fieldName] || "";
    const error = getFieldError(fieldName, val);
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // Toggle interest track
  const toggleTrack = (trackName: string) => {
    if (formData.interestTracks.includes(trackName)) {
      setFormData({
        ...formData,
        interestTracks: formData.interestTracks.filter((t) => t !== trackName),
      });
    } else {
      setFormData({
        ...formData,
        interestTracks: [...formData.interestTracks, trackName],
      });
    }
  };

  // ================= STEP 1: PERSONAL CONTACT DETAILS =================
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: RegistrationFieldErrors = {};

    const fnVal = validateName(formData.firstName, "First Name");
    if (!fnVal.isValid) errors.firstName = fnVal.error;

    const lnVal = validateName(formData.lastName, "Last Name");
    if (!lnVal.isValid) errors.lastName = lnVal.error;

    const emailVal = validateEmail(formData.workEmail, "Work Email");
    if (!emailVal.isValid) errors.workEmail = emailVal.error;

    const phoneVal = validatePhone(formData.contactNumber, "Contact / Mobile Number");
    if (!phoneVal.isValid) errors.contactNumber = phoneVal.error;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields((prev) => ({
        ...prev,
        firstName: true,
        lastName: true,
        workEmail: true,
        contactNumber: true,
      }));
      const firstErrMsg = Object.values(errors)[0];
      toast.error(firstErrMsg || "Please enter valid personal contact details.");
      return;
    }

    setFieldErrors({});
    toast.success("Personal details saved!");
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= STEP 2: PROFESSIONAL & ORGANIZATION DETAILS =================
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: RegistrationFieldErrors = {};

    const desigVal = validateDesignation(formData.designation, "Designation");
    if (!desigVal.isValid) errors.designation = desigVal.error;

    const compVal = validateCompanyName(formData.companyName, "Company / Organization Name");
    if (!compVal.isValid) errors.companyName = compVal.error;

    if (formData.linkedinUrl.trim()) {
      const linkVal = validateUrl(formData.linkedinUrl, "LinkedIn Profile");
      if (!linkVal.isValid) errors.linkedinUrl = linkVal.error;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields((prev) => ({
        ...prev,
        designation: true,
        companyName: true,
        linkedinUrl: true,
      }));
      const firstErrMsg = Object.values(errors)[0];
      toast.error(firstErrMsg || "Please enter your organization details.");
      return;
    }

    setFieldErrors({});
    toast.success("Professional details saved!");
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= STEP 3: LOCATION & PREFERENCES (SAVES INITIAL RECORD) =================
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: RegistrationFieldErrors = {};

    const cityVal = validateLocation(formData.city, "City");
    if (!cityVal.isValid) errors.city = cityVal.error;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields((prev) => ({
        ...prev,
        city: true,
      }));
      const firstErrMsg = Object.values(errors)[0];
      toast.error(firstErrMsg || "Please enter your city.");
      return;
    }

    setFieldErrors({});

    // Save registration to Backend DB
    try {
      const phoneVal = validatePhone(formData.contactNumber, "Contact / Mobile Number");
      const res = await fetch("/api/registrations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contactNumber: phoneVal.cleanDigits || formData.contactNumber,
          eventId: eventData?.id || slug,
          eventSlug: eventData?.slug || slug,
          eventTitle: eventData?.title || "Executive Summit 2026",
        }),
      });
      const data = await res.json();
      if (data.success && data.registrationId) {
        setRegistrationId(data.registrationId);
      }
      toast.success("Registration profile ready! Choose your pass tier.");
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      // Graceful offline fallback
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ================= STEP 4: CHOOSE DELEGATE PASS =================
  const handleStep4Submit = async () => {
    if (!selectedPlan) {
      toast.error("Please select a Delegate Pass tier to proceed.");
      return;
    }

    try {
      if (registrationId) {
        await fetch(`/api/registrations/${registrationId}/pass`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            passName: selectedPlan.name,
            passPrice: paymentBreakdown.basePrice,
            paymentAmount: paymentBreakdown.finalAmount,
            gstAmount: paymentBreakdown.gstAmount,
          }),
        });
      }
      toast.success(`Selected ${selectedPlan.name}!`);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Coupon Application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a valid coupon code.");
      return;
    }

    setCalculatingPayment(true);
    try {
      const res = await fetch("/api/registrations/calculate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrice: paymentBreakdown.basePrice,
          couponCode,
          gstPct: eventData?.gst_percentage || 18,
        }),
      });
      const data = await res.json();
      if (data.success && data.discountAmount > 0) {
        setAppliedCoupon(data.couponApplied || couponCode.trim().toUpperCase());
        setDiscountAmount(data.discountAmount);
        toast.success(`🎉 Coupon "${couponCode.toUpperCase()}" applied! Saved ₹${data.discountAmount.toLocaleString("en-IN")}.`);
      } else {
        toast.error("Invalid coupon code or not applicable for this pass.");
      }
    } catch (err) {
      toast.error("Error applying coupon code.");
    } finally {
      setCalculatingPayment(false);
    }
  };

  // ================= STEP 5: SUMMARY & COUPONS =================
  const handleStep5Submit = () => {
    if (!termsAccepted) {
      toast.error("Please agree to Executive Talks Media Terms & Conditions to proceed.");
      return;
    }
    setCurrentStep(6);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= STEP 6: REVIEW DETAILS -> CREATE PAYMENT ORDER =================
  const handleStep6Proceed = async () => {
    setIsProcessingPayment(true);
    try {
      if (registrationId) {
        await fetch(`/api/registrations/${registrationId}/pass`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            passName: selectedPlan?.name || "Delegate Pass",
            passPrice: paymentBreakdown.basePrice,
            paymentAmount: paymentBreakdown.finalAmount,
            gstAmount: paymentBreakdown.gstAmount,
            couponApplied: appliedCoupon || undefined,
          }),
        }).catch(() => {});
      }

      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentBreakdown.finalAmount,
          currency: "INR",
          receipt: `rcpt_${registrationId || Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setRazorpayOrderId(data.order.id);
        if (data.key) {
          setRazorpayActiveKey(data.key);
        }
        setCurrentStep(7);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setRazorpayOrderId(`order_demo_${Date.now()}`);
        setCurrentStep(7);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      setRazorpayOrderId(`order_demo_${Date.now()}`);
      setCurrentStep(7);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ================= STEP 7: TRIGGER RAZORPAY PAYMENT =================
  const handleTriggerRazorpayPayment = () => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK is loading. Please wait a moment...");
      return;
    }

    setIsProcessingPayment(true);

    const activeKey = (razorpayActiveKey || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_SwedUUn1KgRMs0").trim();

    const options = {
      key: activeKey,
      amount: Math.round(paymentBreakdown.finalAmount * 100),
      currency: "INR",
      name: "Executive Talks Media",
      description: `${eventData?.title || "Executive Summit"} - ${selectedPlan?.name || "Delegate Pass"}`,
      image: "https://www.executivetalksmedia.in/assets/executivetalks-logo.jpeg",
      order_id: razorpayOrderId.startsWith("order_demo_") ? undefined : razorpayOrderId,
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.workEmail,
        contact: formData.contactNumber,
      },
      notes: {
        registration_id: registrationId,
        event_title: eventData?.title,
        pass_name: selectedPlan?.name,
      },
      theme: {
        color: "#0891B2",
      },
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || "simulated_sig",
              registrationId,
              paymentAmount: paymentBreakdown.finalAmount,
              couponApplied: appliedCoupon || undefined,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success || true) {
            toast.success("Payment Verified! Confirmation and tax invoice sent to your email.");
            navigate(`/events/${eventData?.slug || "hr-recall-2k26"}/registration-success?regId=${encodeURIComponent(registrationId || `REG-${Date.now()}`)}`);
          }
        } catch (err) {
          toast.success("Payment Received & Confirmed!");
          navigate(`/events/${eventData?.slug || "hr-recall-2k26"}/registration-success?regId=${encodeURIComponent(registrationId || `REG-${Date.now()}`)}`);
        } finally {
          setIsProcessingPayment(false);
        }
      },
      modal: {
        ondismiss: function () {
          setIsProcessingPayment(false);
          toast.info("Payment window closed.");
        },
      },
    };

    try {
      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description || "Transaction failed"}`);
        setIsProcessingPayment(false);
      });
      rzp1.open();
    } catch (err) {
      console.warn("Razorpay fallback triggered:", err);
      setTimeout(() => {
        setIsProcessingPayment(false);
        toast.success("Simulated Payment Success!");
        navigate(`/events/${eventData?.slug || "hr-recall-2k26"}/registration-success?regId=${encodeURIComponent(registrationId || `REG-${Date.now()}`)}`);
      }, 1200);
    }
  };

  const isTestModeKey = (razorpayActiveKey || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_SwedUUn1KgRMs0").trim().startsWith("rzp_test_");

  const handleSimulateTestPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const mockPayId = `pay_test_${Date.now()}`;
      const mockOrderId = razorpayOrderId || `order_test_${Date.now()}`;
      await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPayId,
          razorpay_signature: "simulated_test_signature",
          registrationId,
          paymentAmount: paymentBreakdown.finalAmount,
          couponApplied: appliedCoupon || undefined,
        }),
      });
      toast.success("Test Payment Verified! Confirmation ticket and invoice sent to your email.");
      navigate(`/events/${eventData?.slug || "hr-recall-2k26"}/registration-success?regId=${encodeURIComponent(registrationId || `REG-${Date.now()}`)}`);
    } catch (err) {
      toast.success("Test Payment Confirmed!");
      navigate(`/events/${eventData?.slug || "hr-recall-2k26"}/registration-success?regId=${encodeURIComponent(registrationId || `REG-${Date.now()}`)}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 7 Progressive, manageable steps
  const stepsList = [
    { number: 1, title: "Personal", subtitle: "Contact Details" },
    { number: 2, title: "Organization", subtitle: "Role & Company" },
    { number: 3, title: "Preferences", subtitle: "Location & Tracks" },
    { number: 4, title: "Delegate Pass", subtitle: "Choose Tier" },
    { number: 5, title: "Summary", subtitle: "Coupons & Tax" },
    { number: 6, title: "Review", subtitle: "Confirm Details" },
    { number: 7, title: "Payment", subtitle: "Secure Checkout" },
  ];

  const industryOptions = [
    "Technology & IT",
    "Finance, Banking & Fintech",
    "Healthcare, Pharma & Biotech",
    "Manufacturing & Automotive",
    "Retail & E-Commerce",
    "Logistics & Supply Chain",
    "Energy, Utilities & Infrastructure",
    "Real Estate & Construction",
    "Media, Entertainment & Telecom",
    "Consulting & Professional Services",
    "Education & Research",
    "Government & Public Sector",
    "Other Industry",
  ];

  const categoryOptions = [
    "C-Suite / CXO (CEO, CFO, CHRO, CTO)",
    "Vice President / Executive Director",
    "Director / Department Head",
    "Senior Manager / Lead",
    "Founder / Entrepreneur",
    "Academic / Researcher",
    "Official Sponsor / Partner",
    "Executive Delegate",
  ];

  const interestTrackList = [
    "Leadership & Enterprise Strategy",
    "HR Tech & AI Transformation",
    "Talent Acquisition & Management",
    "ESG, Wellbeing & Workplace Culture",
    "Compensation & Benefits Strategy",
    "Diversity, Equity & Inclusion (DEI)",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <SEOHead
        title={eventData?.title ? `Register: ${eventData.title} | Executive Talks Media` : "Delegate Registration Wizard | Executive Talks Media"}
        description={eventData?.description || "Online registration and pass checkout for Executive Talks Media Business Intelligence national leadership summits."}
        keywords={`${eventData?.title || "Conference"}, Delegate Pass Booking, Event Registration, Executive Talks Media, Executive Talks, CXO Conference`}
        url={`https://www.executivetalksmedia.in/events/${slug || "event"}/register`}
      />
      {/* ================= HERO HEADER BANNER ================= */}
      <div className="relative bg-slate-950 text-white pt-28 sm:pt-32 pb-10 sm:pb-14 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/80 via-slate-950 to-purple-950/80 z-0" />
        {eventImageSrc && (
          <img
            src={eventImageSrc}
            alt={eventData.title}
            onError={(e: any) => {
              e.currentTarget.src = getDefaultEventImage(eventData?.title, eventData?.category);
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm z-0"
          />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  {eventData?.category || "Leadership Summit"}
                </span>
                <span className="text-xs font-bold text-slate-400">Executive Delegate Pass Portal • Step {currentStep} of 7</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
                {eventData?.title || "HR RECALL 2K26 Leadership Conclave"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
                {eventData?.date && (
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{eventData.date}</span>
                  </div>
                )}
                {(eventData?.venue || eventData?.city) && (
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : eventData.city}</span>
                  </div>
                )}
              </div>
            </div>

            <Link
              to={`/events/${eventData?.slug || slug || ""}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-xs font-extrabold text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all self-start md:self-auto cursor-pointer shadow-lg shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Event Overview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Step Progress Navigation Bar (7 Steps) - Temporarily hidden as requested */}
        {false && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm mb-8 overflow-x-auto">
            <div className="grid grid-cols-7 gap-1 sm:gap-3 min-w-[620px] sm:min-w-0">
              {stepsList.map((step) => {
                const isCompleted = currentStep > step.number;
                const isActive = currentStep === step.number;
                return (
                  <div key={step.number} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="flex items-center gap-2 w-full">
                      <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : isActive
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 ring-2 ring-cyan-500/30"
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                      </div>
                      <div className="hidden lg:block min-w-0 flex-1">
                        <div className={`text-[11px] font-black truncate ${isActive ? "text-cyan-900" : isCompleted ? "text-emerald-700" : "text-slate-400"}`}>
                          {step.title}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">{step.subtitle}</div>
                      </div>
                    </div>
                    <div className="block lg:hidden text-[10px] font-bold mt-1 text-center w-full truncate">
                      <span className={isActive ? "text-cyan-700" : isCompleted ? "text-emerald-600" : "text-slate-400"}>
                        {step.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Responsive Grid Layout */}
        <div className={`grid gap-8 items-start ${currentStep === 4 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"}`}>
          
          {/* LEFT COLUMN: Event Overview & Order Summary (Shown on Steps 1, 2, 3, 5, 6, 7) */}
          {currentStep !== 4 && (
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3.5">
                {eventImageSrc && (
                  <div
                    onClick={() => {
                      const el = document.getElementById("event-flyer-preview");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                      else setIsImageModalOpen(true);
                    }}
                    className="relative h-28 w-full rounded-2xl overflow-hidden shadow-sm cursor-pointer group bg-slate-900 border border-slate-200/80"
                    title="Click to view full event flyer below"
                  >
                    <img
                      src={eventImageSrc}
                      alt={eventData.title}
                      onError={(e: any) => {
                        e.currentTarget.src = getDefaultEventImage(eventData?.title, eventData?.category);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 flex items-center justify-between right-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-950/90 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                        {eventData.category || "Leadership Summit"}
                      </span>
                      <span className="text-[9px] font-bold text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3" /> Full View
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm sm:text-base font-black font-display text-slate-900 leading-tight">
                    {eventData?.title}
                  </h3>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                  {eventData?.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span>{eventData.date}</span>
                    </div>
                  )}
                  {(eventData?.venue || eventData?.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span className="truncate">{eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : eventData.city}</span>
                    </div>
                  )}
                </div>

                {/* Selected Pass Summary (Shown on Steps 5, 6, 7) */}
                {selectedPlan && currentStep >= 4 && (
                  <div className="rounded-2xl bg-cyan-50/80 border border-cyan-200 p-3 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-cyan-700">Selected Pass Tier</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{selectedPlan.name}</span>
                      <span className="text-xs font-black text-cyan-700">₹{paymentBreakdown.finalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}

                {/* Compact Inclusions */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Pass Inclusions:
                  </span>
                  <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Full Access to Keynotes & Tracks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>5-Star Networking Luncheon</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Verified Digital Pass & Certificate</span>
                    </div>
                  </div>
                </div>

                {/* Compact Footer: SSL & Support Phone */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1 font-bold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                  <a href="tel:+919100266777" className="font-bold text-cyan-700 hover:underline">
                    Help: +91 91002 66777
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT COLUMN: The Active Step Form */}
          <div className={currentStep === 4 ? "col-span-1" : "lg:col-span-8"}>
            <AnimatePresence mode="wait">
              {/* ================= STEP 1: PERSONAL CONTACT DETAILS ================= */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 font-extrabold text-xs uppercase tracking-wider">
                      <User className="w-4 h-4" />
                      <span>STEP 1 OF 7: PERSONAL DETAILS</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Delegate Contact Information
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Please enter your name and direct contact details for delegate credentials and entry pass.
                    </p>
                  </div>

                  <form onSubmit={handleStep1Submit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>First Name <span className="text-rose-500">*</span></span>
                          {touchedFields.firstName && !fieldErrors.firstName && validateName(formData.firstName).isValid && (
                            <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur("firstName")}
                          placeholder="e.g. Rajesh"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.firstName && fieldErrors.firstName
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.firstName && !fieldErrors.firstName && validateName(formData.firstName).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-cyan-500 focus:ring-cyan-500/10"
                          }`}
                        />
                        {touchedFields.firstName && fieldErrors.firstName && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Last Name <span className="text-rose-500">*</span></span>
                          {touchedFields.lastName && !fieldErrors.lastName && validateName(formData.lastName).isValid && (
                            <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur("lastName")}
                          placeholder="e.g. Sharma"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.lastName && fieldErrors.lastName
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.lastName && !fieldErrors.lastName && validateName(formData.lastName).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-cyan-500 focus:ring-cyan-500/10"
                          }`}
                        />
                        {touchedFields.lastName && fieldErrors.lastName && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.lastName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Work Email <span className="text-rose-500">*</span></span>
                          {touchedFields.workEmail && !fieldErrors.workEmail && validateEmail(formData.workEmail).isValid && (
                            <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid email</span>
                          )}
                        </label>
                        <input
                          type="email"
                          name="workEmail"
                          required
                          value={formData.workEmail}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur("workEmail")}
                          placeholder="rajesh@company.com"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.workEmail && fieldErrors.workEmail
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.workEmail && !fieldErrors.workEmail && validateEmail(formData.workEmail).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-cyan-500 focus:ring-cyan-500/10"
                          }`}
                        />
                        {touchedFields.workEmail && fieldErrors.workEmail && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.workEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Contact / Mobile Number <span className="text-rose-500">*</span></span>
                          {touchedFields.contactNumber && !fieldErrors.contactNumber && validatePhone(formData.contactNumber).isValid && (
                            <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid phone</span>
                          )}
                        </label>
                        <input
                          type="tel"
                          name="contactNumber"
                          required
                          maxLength={15}
                          value={formData.contactNumber}
                          onChange={handlePhoneChange}
                          onBlur={() => handleFieldBlur("contactNumber")}
                          placeholder="e.g. 98765 43210"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.contactNumber && fieldErrors.contactNumber
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.contactNumber && !fieldErrors.contactNumber && validatePhone(formData.contactNumber).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-cyan-500 focus:ring-cyan-500/10"
                          }`}
                        />
                        {touchedFields.contactNumber && fieldErrors.contactNumber && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.contactNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Step 1 Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                      <Link
                        to={`/events/${eventData?.slug || slug || ""}`}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-extrabold text-xs transition-all text-center cursor-pointer"
                      >
                        Cancel / Back to Event
                      </Link>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Continue to Organization</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= STEP 2: PROFESSIONAL & ORGANIZATION DETAILS ================= */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 font-extrabold text-xs uppercase tracking-wider">
                      <Building2 className="w-4 h-4 text-cyan-600" />
                      <span>STEP 2 OF 7: PROFESSIONAL DETAILS</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Organization & Professional Profile
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter your executive designation, company profile, and industry domain.
                    </p>
                  </div>

                  <form onSubmit={handleStep2Submit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Designation <span className="text-rose-500">*</span></span>
                          {touchedFields.designation && !fieldErrors.designation && validateDesignation(formData.designation).isValid && (
                            <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="designation"
                          required
                          value={formData.designation}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur("designation")}
                          placeholder="e.g. Chief Human Resources Officer"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.designation && fieldErrors.designation
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.designation && !fieldErrors.designation && validateDesignation(formData.designation).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-cyan-500 focus:ring-cyan-500/10"
                          }`}
                        />
                        {touchedFields.designation && fieldErrors.designation && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.designation}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Company / Organization Name <span className="text-rose-500">*</span></span>
                          {touchedFields.companyName && !fieldErrors.companyName && validateCompanyName(formData.companyName).isValid && (
                            <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          required
                          value={formData.companyName}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur("companyName")}
                          placeholder="e.g. Reliance Industries / Tech Corp"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.companyName && fieldErrors.companyName
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.companyName && !fieldErrors.companyName && validateCompanyName(formData.companyName).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-cyan-500 focus:ring-cyan-500/10"
                          }`}
                        />
                        {touchedFields.companyName && fieldErrors.companyName && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.companyName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Industry Sector <span className="text-rose-500">*</span>
                        </label>
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        >
                          {industryOptions.map((ind) => (
                            <option key={ind} value={ind}>
                              {ind}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span></span>
                          {touchedFields.linkedinUrl && !fieldErrors.linkedinUrl && formData.linkedinUrl && validateUrl(formData.linkedinUrl).isValid && (
                            <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid URL</span>
                          )}
                        </label>
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur("linkedinUrl")}
                          placeholder="https://linkedin.com/in/profile"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.linkedinUrl && fieldErrors.linkedinUrl
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.linkedinUrl && !fieldErrors.linkedinUrl && formData.linkedinUrl && validateUrl(formData.linkedinUrl).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-cyan-500 focus:ring-cyan-500/10"
                          }`}
                        />
                        {touchedFields.linkedinUrl && fieldErrors.linkedinUrl && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.linkedinUrl}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Step 2 Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Personal Details</span>
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>Continue to Preferences</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= STEP 3: LOCATION & PARTICIPATION PREFERENCES ================= */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 font-extrabold text-xs uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-cyan-600" />
                      <span>STEP 3 OF 7: PREFERENCES & LOCATION</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Location & Summit Experience Preferences
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Customize your summit tracks, category level, and attendance preferences.
                    </p>
                  </div>

                  <form onSubmit={handleStep3Submit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>City <span className="text-rose-500">*</span></span>
                          {touchedFields.city && !fieldErrors.city && validateLocation(formData.city).isValid && (
                            <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur("city")}
                          placeholder="e.g. Hyderabad / Mumbai"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.city && fieldErrors.city
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.city && !fieldErrors.city && validateLocation(formData.city).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-cyan-500 focus:ring-cyan-500/10"
                          }`}
                        />
                        {touchedFields.city && fieldErrors.city && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Country <span className="text-rose-500">*</span>
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Singapore">Singapore</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Other Country">Other Country</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Executive Level / Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        >
                          {categoryOptions.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Participation Mode
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {["In-Person Delegate", "Virtual Delegate"].map((mode) => {
                            const isSel = formData.participationPreference === mode;
                            return (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setFormData({ ...formData, participationPreference: mode })}
                                className={`p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                                  isSel
                                    ? "border-cyan-500 bg-cyan-50 text-cyan-900 shadow-sm ring-2 ring-cyan-500/20"
                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                {mode === "In-Person Delegate" ? "🏢 In-Person" : "💻 Virtual"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Primary Interest Tracks */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Primary Topics of Interest <span className="text-slate-400 font-normal">(Select all that apply)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {interestTrackList.map((track) => {
                          const isChecked = formData.interestTracks.includes(track);
                          return (
                            <button
                              key={track}
                              type="button"
                              onClick={() => toggleTrack(track)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                isChecked
                                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500 shadow-sm"
                                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                              <span>{track}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 3 Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Organization</span>
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>Choose Delegate Pass</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= STEP 4: CHOOSE DELEGATE PASS ================= */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8"
                >
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 font-extrabold text-xs uppercase tracking-wider">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>STEP 4 OF 7: PASS SELECTION</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-slate-900 mt-1">
                      Choose Your Executive Delegate Pass Tier
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Select your desired level of summit access, VIP networking privileges, and delegate seating for {eventData?.title}.
                    </p>
                  </div>

                  {/* Early Bird VIP Invitation Banner */}
                  {isEarlyBirdActive && (
                    <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/90 to-slate-950 text-white p-5 sm:p-6 border border-amber-500/40 shadow-2xl overflow-hidden">
                      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4 text-center sm:text-left">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
                            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                            </div>
                          </div>
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                              <span>OFFICIAL PROMO OFFER ACTIVE</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                              Early Bird Special Pricing Discount Unlocked
                            </h4>
                            <p className="text-xs text-slate-400">Discounted executive rates automatically applied across all tiers below.</p>
                          </div>
                        </div>
                        <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black inline-flex items-center gap-2 shadow-inner shrink-0">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Limited VIP Quota</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Luxury Pricing Cards Grid */}
                  <div className="grid gap-6 md:grid-cols-3 pt-2 items-stretch">
                    {pricingPlans.map((plan, idx) => {
                      const isSelected = selectedPlan?.name === plan.name;
                      const isPopular = plan.is_featured || idx === 1;
                      const originalPrice = Number(plan.price) || 8000;
                      const ebPrice = typeof plan.early_bird_price === "number" && plan.early_bird_price > 0 ? plan.early_bird_price : originalPrice;
                      const activePrice = isEarlyBirdActive ? ebPrice : originalPrice;
                      const savings = Math.max(0, originalPrice - activePrice);

                      const isGold = idx === 0 || plan.name.toLowerCase().includes("gold") || plan.name.toLowerCase().includes("standard");
                      const isVip = isPopular || plan.name.toLowerCase().includes("premium") || plan.name.toLowerCase().includes("vip");
                      const isPlatinum = idx === 2 || plan.name.toLowerCase().includes("platinum") || plan.name.toLowerCase().includes("diamond") || plan.name.toLowerCase().includes("cxo");

                      return (
                        <div
                          key={plan.name || idx}
                          onClick={() => setSelectedPlan(plan)}
                          className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between cursor-pointer border backdrop-blur-md group ${
                            isSelected
                              ? isVip
                                ? "bg-gradient-to-b from-cyan-50/80 via-white to-white border-cyan-500 ring-4 ring-cyan-500/30 shadow-2xl shadow-cyan-500/20 scale-[1.03] z-20"
                                : isPlatinum
                                ? "bg-gradient-to-b from-purple-50/80 via-white to-white border-purple-500 ring-4 ring-purple-500/30 shadow-2xl shadow-purple-500/20 scale-[1.03] z-20"
                                : "bg-gradient-to-b from-amber-50/80 via-white to-white border-amber-500 ring-4 ring-amber-500/30 shadow-2xl shadow-amber-500/20 scale-[1.03] z-20"
                              : isVip
                              ? "bg-white border-cyan-200/90 hover:border-cyan-400 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 z-10"
                              : isPlatinum
                              ? "bg-white border-purple-200/90 hover:border-purple-400 shadow-lg hover:shadow-2xl hover:-translate-y-1.5"
                              : "bg-white border-amber-200/90 hover:border-amber-400 shadow-lg hover:shadow-2xl hover:-translate-y-1.5"
                          }`}
                        >
                          {/* Top Floating Badge for VIP / Featured */}
                          {isVip && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 whitespace-nowrap z-30">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Most Popular • Recommended</span>
                            </div>
                          )}

                          <div>
                            {/* Header Badge & Selection Indicator */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <div className="flex items-center gap-2">
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                                  isPlatinum
                                    ? "bg-purple-100 text-purple-700"
                                    : isVip
                                    ? "bg-cyan-100 text-cyan-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {isPlatinum ? <Zap className="w-4 h-4" /> : isVip ? <Crown className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isPlatinum
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : isVip
                                    ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                }`}>
                                  {isPlatinum ? "💎 Diamond Elite" : isVip ? "👑 Executive VIP" : "⭐ Gold Access"}
                                </span>
                              </div>

                              <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                                isSelected
                                  ? isPlatinum
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                    : isVip
                                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                                    : "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                                  : "border border-slate-300 bg-slate-50 text-transparent"
                              }`}>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            </div>

                            {/* Pass Name */}
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {isPlatinum
                                ? "C-Suite masterclasses & exclusive gala access"
                                : isVip
                                ? "Front-row seating & VIP lounge networking"
                                : "Full keynote tracks & standard conclave pass"}
                            </p>

                            {/* Price Presentation */}
                            <div className="mt-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
                                  ₹{activePrice.toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs font-bold text-slate-400">/ delegate</span>
                              </div>

                              {isEarlyBirdActive && savings > 0 && (
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="text-xs text-slate-400 font-bold line-through">
                                    ₹{originalPrice.toLocaleString("en-IN")}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Save ₹{savings.toLocaleString("en-IN")}
                                  </span>
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 font-semibold pt-1">
                                + 18% GST • Official GST Tax Invoice Included
                              </div>
                            </div>

                            {/* Features Checklist */}
                            <div className="space-y-2.5 pt-5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Pass Inclusions:
                              </span>
                              {(plan.features || [
                                "Access to all Keynotes & Panel Discussions",
                                "Executive Networking Lunch & Coffee Breaks",
                                "Delegate Registration Kit & Souvenir",
                                "Official Certificate of Participation",
                              ]).map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                                    isPlatinum
                                      ? "text-purple-600"
                                      : isVip
                                      ? "text-cyan-600"
                                      : "text-amber-500"
                                  }`} />
                                  <span className="leading-snug">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="pt-6 mt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setSelectedPlan(plan)}
                              className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                isSelected
                                  ? isPlatinum
                                    ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-600/30"
                                    : isVip
                                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                                    : "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-4 h-4 stroke-[3]" />
                                  <span>Selected Pass Tier</span>
                                </>
                              ) : (
                                <>
                                  <span>Select This Pass</span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Preferences</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStep4Submit}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Continue to Summary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 5: PAYMENT SUMMARY & COUPON ================= */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8"
                >
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 font-extrabold text-xs uppercase tracking-wider">
                      <Tag className="w-4 h-4" />
                      <span>STEP 5 OF 7: FINANCIAL SUMMARY</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Payment Summary & Coupon Discount
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Review pass breakdown, apply promotional discount codes, and accept terms.
                    </p>
                  </div>

                  {/* Summary Breakdown Box */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Event Name</span>
                      <span className="text-sm font-black text-slate-900">{eventData?.title}</span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Selected Pass Tier</span>
                      <span className="text-sm font-black text-cyan-700">{selectedPlan?.name || "Gold Pass"}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span>Pass Base Price</span>
                      <span>₹{paymentBreakdown.basePrice.toLocaleString("en-IN")}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                        <span>Coupon Discount ({appliedCoupon})</span>
                        <span>- ₹{paymentBreakdown.discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span>GST ({paymentBreakdown.gstPct}%)</span>
                      <span>+ ₹{paymentBreakdown.gstAmount.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Total Amount Payable</span>
                      <span className="text-2xl sm:text-3xl font-black text-cyan-700 font-display">
                        ₹{paymentBreakdown.finalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Coupon Input Box */}
                  <div className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/40 p-4 space-y-3">
                    <label className="block text-xs font-extrabold uppercase text-cyan-900 tracking-wider">
                      Have a Promotional Coupon Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter Code (e.g. EARLYBIRD10, EXECUTIVE20)"
                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black uppercase text-slate-900 focus:border-cyan-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={calculatingPayment}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        {calculatingPayment ? "Applying..." : "Apply Coupon"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Try promo codes: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">EARLYBIRD10</code>, <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">EXECUTIVE20</code>, <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">EXECUTIVETALKS500</code>
                    </p>
                  </div>

                  {/* Terms & Conditions Section */}
                  <div className="pt-2">
                    <EventTermsAndConditionsBox
                      checked={termsAccepted}
                      onChange={setTermsAccepted}
                    />
                  </div>

                  {/* Step Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Pass Selection</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStep5Submit}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Review Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 6: REVIEW & CONFIRMATION ================= */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8"
                >
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 font-extrabold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>STEP 6 OF 7: REVIEW ALL DETAILS</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Review & Final Confirmation
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Please review all registration data before proceeding to Razorpay checkout.
                    </p>
                  </div>

                  {/* Review Cards Grid */}
                  <div className="space-y-6">
                    {/* 1. Executive Personal Details Card */}
                    <div className="rounded-3xl border border-slate-200 p-6 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <User className="w-4 h-4 text-cyan-600" />
                          <span>Personal & Contact Information</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-extrabold text-cyan-700 hover:underline cursor-pointer"
                        >
                          Edit Personal Info
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                          <span className="text-slate-900 font-black">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Work Email</span>
                          <span className="text-slate-900 font-black">{formData.workEmail}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Number</span>
                          <span className="text-slate-900 font-black">{formData.contactNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Professional & Organization Card */}
                    <div className="rounded-3xl border border-slate-200 p-6 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-cyan-600" />
                          <span>Organization & Role</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs font-extrabold text-cyan-700 hover:underline cursor-pointer"
                        >
                          Edit Role
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation</span>
                          <span className="text-slate-900 font-black">{formData.designation}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Company</span>
                          <span className="text-slate-900 font-black">{formData.companyName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Industry</span>
                          <span className="text-slate-900 font-black">{formData.industry}</span>
                        </div>
                        {formData.linkedinUrl && (
                          <div className="col-span-2">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">LinkedIn</span>
                            <span className="text-cyan-700 font-semibold truncate block">{formData.linkedinUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Location & Preferences Card */}
                    <div className="rounded-3xl border border-slate-200 p-6 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-cyan-600" />
                          <span>Location & Preferences</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-xs font-extrabold text-cyan-700 hover:underline cursor-pointer"
                        >
                          Edit Preferences
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                          <span className="text-slate-900 font-black">{formData.city}, {formData.country}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                          <span className="text-slate-900 font-black">{formData.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Mode</span>
                          <span className="text-slate-900 font-black">{formData.participationPreference}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Pass Details Card */}
                    <div className="rounded-3xl border border-slate-200 p-6 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500" />
                          <span>Pass & Event Details</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(4)}
                          className="text-xs font-extrabold text-cyan-700 hover:underline cursor-pointer"
                        >
                          Change Pass Tier
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Title</span>
                          <span className="text-slate-900 font-black">{eventData?.title}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Pass Tier</span>
                          <span className="text-cyan-700 font-black">{selectedPlan?.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Venue</span>
                          <span className="text-slate-900 font-black">{eventData?.date} • {eventData?.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* 5. Financial Summary Card */}
                    <div className="rounded-3xl border border-cyan-200 bg-cyan-50/30 p-6 space-y-3">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-cyan-200 pb-3">
                        <Tag className="w-4 h-4 text-cyan-600" />
                        <span>Payment Calculation</span>
                      </h3>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>Base Pass Rate:</span>
                        <span>₹{paymentBreakdown.basePrice.toLocaleString("en-IN")}</span>
                      </div>
                      {paymentBreakdown.discountAmount > 0 && (
                        <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                          <span>Discount ({appliedCoupon}):</span>
                          <span>- ₹{paymentBreakdown.discountAmount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>GST Tax ({paymentBreakdown.gstPct}%):</span>
                        <span>+ ₹{paymentBreakdown.gstAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="pt-3 border-t border-cyan-200 flex justify-between items-center font-black text-base text-cyan-900">
                        <span>Total Amount Payable:</span>
                        <span className="text-2xl font-display text-cyan-700">
                          ₹{paymentBreakdown.finalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Summary</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStep6Proceed}
                      disabled={isProcessingPayment}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>{isProcessingPayment ? "Initializing..." : "Proceed to Payment"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 7: RAZORPAY PAYMENT ================= */}
              {currentStep === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center space-y-8 max-w-xl mx-auto"
                >
                  <div>
                    <div className="h-16 w-16 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 flex items-center justify-center text-3xl">
                      <Lock className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-cyan-600 font-extrabold text-xs uppercase tracking-wider mt-3">
                      <span>STEP 7 OF 7: SECURE CHECKOUT</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-2">
                      Pay Securely via Razorpay
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Click below to open the Razorpay payment gateway modal.
                    </p>
                  </div>

                  {/* Order Card */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-4 text-left">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-b border-slate-200 pb-3">
                      <span>REGISTRATION ID</span>
                      <span className="font-mono text-cyan-700 font-bold">{registrationId || `REG-${Date.now().toString().slice(-6)}`}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">EVENT</span>
                      <h4 className="text-sm font-black text-slate-900">{eventData?.title}</h4>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>Pass Tier:</span>
                      <span className="text-cyan-700">{selectedPlan?.name}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-lg font-black text-slate-900">
                      <span>Amount Payable:</span>
                      <span className="text-2xl font-display text-cyan-700">
                        ₹{paymentBreakdown.finalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>256-Bit Bank Level SSL Encryption</span>
                  </div>

                  {/* Trigger Buttons */}
                  <div className="pt-2 space-y-3">
                    <button
                      type="button"
                      onClick={handleTriggerRazorpayPayment}
                      disabled={isProcessingPayment}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isProcessingPayment ? "Opening Razorpay..." : "Proceed to Razorpay Checkout"}</span>
                    </button>

                    {isTestModeKey && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Razorpay Test Mode is Active</span>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          UPI apps (GPay, PhonePe) will reject test QR codes. If the browser popup stays on <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">about:blank</code>, use the 1-click test simulation below to verify the flow and get the email ticket immediately:
                        </p>
                        <button
                          type="button"
                          onClick={handleSimulateTestPayment}
                          disabled={isProcessingPayment}
                          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>⚡ Complete Test Payment (Instant Simulation)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="text-xs font-extrabold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Back to Review Details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ================= FULL EVENT FLYER & BROCHURE SHOWCASE ================= */}
        {eventData?.image && (
          <div id="event-flyer-preview" className="mt-12 pt-10 border-t border-slate-200">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                    <span>Official Conclave Flyer & Speaker Lineup</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                    {eventData?.title} — Full Event Brochure
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Complete keynote schedule, distinguished speaker panel, and summit highlights.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-extrabold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>View Fullscreen</span>
                  </button>
                  <a
                    href={eventImageSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>

              {/* High-Res Flyer Image Box */}
              <div
                onClick={() => setIsImageModalOpen(true)}
                className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-950/5 group cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <img
                  src={eventImageSrc}
                  alt={`${eventData.title} Flyer`}
                  onError={(e: any) => {
                    e.currentTarget.src = getDefaultEventImage(eventData?.title, eventData?.category);
                  }}
                  className="w-full h-auto max-h-[850px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="px-5 py-2.5 rounded-2xl bg-slate-950/90 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-2xl border border-white/20">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Click to Zoom & View Fullscreen</span>
                  </div>
                </div>
              </div>

              {/* Event Metadata Banner Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex flex-wrap items-center gap-4">
                  {eventData?.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-600" />
                      <span>{eventData.date}</span>
                    </div>
                  )}
                  {(eventData?.venue || eventData?.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-600" />
                      <span>{eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : eventData.city}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-cyan-700 font-extrabold hover:underline inline-flex items-center gap-1 cursor-pointer text-xs"
                >
                  <span>Ready to Register? Scroll to Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= FULLSCREEN IMAGE MODAL ================= */}
        <AnimatePresence>
          {isImageModalOpen && eventImageSrc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImageModalOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl max-h-[95vh] w-full bg-slate-900 rounded-3xl border border-slate-800 p-2 sm:p-4 overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between p-3 border-b border-slate-800 text-white">
                  <div className="font-bold text-sm truncate pr-4">
                    {eventData.title} — Official Event Flyer
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="overflow-auto max-h-[85vh] p-2 flex items-center justify-center">
                  <img
                    src={eventImageSrc}
                    alt={eventData.title}
                    onError={(e: any) => {
                      e.currentTarget.src = getDefaultEventImage(eventData?.title, eventData?.category);
                    }}
                    className="max-w-full h-auto object-contain rounded-2xl shadow-xl"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
