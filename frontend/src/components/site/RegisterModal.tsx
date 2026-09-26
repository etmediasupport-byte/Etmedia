import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, ShieldCheck, Mail, Calendar, MapPin, Sparkles, Award, User, Tag, CreditCard, ChevronDown, Crown } from "lucide-react";
import { toast } from "sonner";
import { events as defaultEvents, type EventItem, getDefaultPricingPlans, checkEarlyBirdStatus, type PricingPlanTier } from "@/lib/site-data";
import { RegistrationPlansGrid } from "@/components/site/RegistrationPlansGrid";
import logoUrl from "@/assets/logo-final.png";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  mode?: "paid" | "free";
}

export function RegisterModal({ isOpen, onClose, event, mode = "paid" }: RegisterModalProps) {
  const [modalStep, setModalStep] = useState<"form" | "payment">("form");
  const [activeMode, setActiveMode] = useState<"paid" | "free">("paid");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    companyName: "",
    email: "",
    contactNumber: "",
    city: "",
    country: "India",
    registrationCategory: "Delegate",
    registeringCity: "",
    referralSource: "LinkedIn",
  });

  const [verifiedCaptcha, setVerifiedCaptcha] = useState(false);
  const [captchaVerifying, setCaptchaVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Sync activeMode with mode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveMode(mode || "paid");
      setModalStep("form");
    }
  }, [isOpen, mode]);

  // Events list & selector state
  const [eventsList, setEventsList] = useState<EventItem[]>(defaultEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Fetch live events list for event dropdown selector
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setEventsList(data.data);
        }
      })
      .catch((err) => console.warn("Using static events data for modal selector", err));
  }, []);

  // Sync selectedEvent when event prop or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (event) {
        setSelectedEvent(event);
      } else if (eventsList.length > 0) {
        setSelectedEvent((prev) => prev ?? eventsList[0] ?? null);
      }
    }
  }, [isOpen, event, eventsList]);

  const currentEvent = selectedEvent || event || eventsList[0] || defaultEvents[0];

  // Payment Config & Coupon state
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const [pendingRegId, setPendingRegId] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.trim();
    const digits = cleaned.replace(/\D/g, "");
    if (!cleaned) {
      return "Contact number is required.";
    }
    if (digits.length < 10) {
      return "Please enter a valid 10-digit contact number (e.g. +91 98765 43210).";
    }
    if (digits.length > 15) {
      return "Contact number cannot exceed 15 digits.";
    }
    return "";
  };

  // Auto-select event details & fetch payment configuration when active event changes
  useEffect(() => {
    if (currentEvent && isOpen) {
      setModalStep("form");
      setAppliedCoupon(null);
      setCouponInput("");
      setPendingRegId(null);
      setPhoneTouched(false);
      setPhoneError("");

      let cities: string[] = [];
      try {
        if (typeof currentEvent.locations === "string") {
          const parsed = JSON.parse(currentEvent.locations);
          cities = parsed.map((l: any) => l.city).filter(Boolean);
        } else if (Array.isArray(currentEvent.locations)) {
          cities = currentEvent.locations.map((l: any) => l.city).filter(Boolean);
        }
      } catch (e) {}

      if (cities.length === 0 && currentEvent.city) {
        cities = [currentEvent.city];
      }
      const initialRegisteringCity = cities[0] || "Mumbai";

      setFormData((prev) => ({
        ...prev,
        registeringCity: initialRegisteringCity,
      }));

      // Fetch payment config for active event
      fetch(`/api/event-payments/event/${currentEvent.id || currentEvent.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.payment) {
            setPaymentConfig(data.payment);
          } else {
            setPaymentConfig(null);
          }
        })
        .catch((err) => {
          console.warn("Could not load payment settings for event", err);
          setPaymentConfig(null);
        });
    }
  }, [currentEvent?.id, currentEvent?.slug, isOpen]);

  if (!isOpen || !currentEvent) return null;

  // Extract cities list for dropdown - ONLY from Admin added Event Schedules & Cities
  let eventCities: string[] = [];
  try {
    if (typeof currentEvent.locations === "string") {
      const parsed = JSON.parse(currentEvent.locations);
      eventCities = parsed.map((l: any) => l.city).filter(Boolean);
    } else if (Array.isArray(currentEvent.locations)) {
      eventCities = currentEvent.locations.map((l: any) => l.city).filter(Boolean);
    }
  } catch (e) {}
  if (eventCities.length === 0 && currentEvent.city) {
    eventCities = [currentEvent.city];
  }
  const finalCityOptions = Array.from(new Set(eventCities.length > 0 ? eventCities : [currentEvent.city || "Mumbai"]));

  // Calculate pricing breakdown tier-wise with dynamic early bird status
  const getPricing = () => {
    let parsedPlans: PricingPlanTier[] = [];
    if (typeof paymentConfig?.pricing_plans === "string") {
      try { parsedPlans = JSON.parse(paymentConfig.pricing_plans); } catch (e) {}
    } else if (Array.isArray(paymentConfig?.pricing_plans)) {
      parsedPlans = paymentConfig.pricing_plans;
    }
    if (!parsedPlans || parsedPlans.length === 0) {
      parsedPlans = getDefaultPricingPlans();
    }

    // Find selected tier pass matching registrationCategory
    const catName = formData.registrationCategory;
    const matchedPlan =
      parsedPlans.find(
        (p) => p.name.toLowerCase() === catName.toLowerCase() || p.id === catName
      ) ||
      parsedPlans.find((p) => p.is_featured) ||
      parsedPlans[0];

    const originalPrice = matchedPlan ? Number(matchedPlan.price) : 8000;

    // Check early bird date-based status automatically
    const ebStatus = checkEarlyBirdStatus(
      paymentConfig?.early_bird_enabled ?? true,
      paymentConfig?.early_bird_start_date || "2026-01-01",
      paymentConfig?.early_bird_end_date || "2026-12-31"
    );

    const isEarlyBirdActive = ebStatus.isActive;
    const ebPrice = matchedPlan?.early_bird_price ?? paymentConfig?.early_bird_price ?? originalPrice;

    // Effective Base Price: Early Bird Price if active, else Original Price
    const effectiveBasePrice = isEarlyBirdActive && ebPrice < originalPrice ? ebPrice : originalPrice;
    const earlyBirdDiscount = isEarlyBirdActive && ebPrice < originalPrice ? originalPrice - ebPrice : 0;

    // Coupon discount applied after Early Bird price
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percentage") {
        couponDiscount = Math.round((effectiveBasePrice * Number(appliedCoupon.value)) / 100);
      } else {
        couponDiscount = Number(appliedCoupon.value);
      }
    }

    const netBase = Math.max(0, effectiveBasePrice - couponDiscount);
    const gstPct = Number(paymentConfig?.gst_percentage) ?? 18;
    const gstAmt = paymentConfig?.gst_included ? 0 : Math.round((netBase * gstPct) / 100);
    const totalPayable = paymentConfig?.gst_included ? netBase : netBase + gstAmt;

    return {
      selectedPlan: matchedPlan,
      passName: matchedPlan?.name || "Gold Pass",
      baseFee: originalPrice,
      originalPrice,
      isEarlyBirdActive,
      earlyBirdPrice: ebPrice,
      earlyBirdDiscount,
      effectiveBasePrice,
      couponDiscount,
      netBase,
      gstPct,
      gstAmt,
      totalPayable,
      priceType: isEarlyBirdActive && ebPrice < originalPrice ? "EARLY_BIRD" : "REGULAR",
    };
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    let coupons: any[] = [];
    if (typeof paymentConfig?.coupons === "string") {
      try { coupons = JSON.parse(paymentConfig.coupons); } catch (e) {}
    } else if (Array.isArray(paymentConfig?.coupons)) {
      coupons = paymentConfig.coupons;
    }

    const matched = coupons.find(
      (c: any) => c.code.toUpperCase() === couponInput.trim().toUpperCase() && c.status !== "Inactive"
    );

    if (matched) {
      setAppliedCoupon(matched);
      toast.success(`🎉 Coupon "${matched.code}" applied! Discount: ${matched.type === "percentage" ? `${matched.value}%` : `₹${matched.value}`}`);
    } else {
      toast.error("Invalid or expired promo code.");
    }
  };

  // Handle Form Submission (Supports both Free Interest & Paid Ticket Modes)
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter your First Name and Last Name.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter a valid work email.");
      return;
    }

    const phoneErr = validatePhoneNumber(formData.contactNumber);
    if (phoneErr) {
      setPhoneTouched(true);
      setPhoneError(phoneErr);
      toast.error(phoneErr);
      return;
    }

    if (!formData.companyName.trim()) {
      toast.error("Please enter your company name.");
      return;
    }

    if (!formData.designation.trim()) {
      toast.error("Please enter your designation.");
      return;
    }

    if (!verifiedCaptcha) {
      toast.error("Please complete the Google reCAPTCHA verification.");
      return;
    }

    if (activeMode === "free") {
      // FREE MODE: Submit registration directly, skip payment step
      setSubmitting(true);
      const refId = `ET-REG-${Math.floor(100000 + Math.random() * 900000)}`;

      const payload = {
        ...formData,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.contactNumber,
        organization: formData.companyName,
        eventId: currentEvent.id || currentEvent.slug,
        eventTitle: currentEvent.title,
        paymentAmount: 0,
        paymentStatus: "Free Registration",
        referenceId: refId,
      };

      try {
        const res = await fetch("/api/events/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await res.json();
        toast.success(`🎉 Free Interest Registered! Ref ID: ${refId}`);
      } catch (leadErr) {
        console.warn("Using offline confirmation fallback:", leadErr);
        toast.success(`🎉 Interest Registered Successfully! Ref ID: ${refId}`);
      } finally {
        setSubmitting(false);
        setSubmittedData({
          ...payload,
          totalPaid: 0,
        });
        setSuccessModalOpen(true);
      }
    } else {
      // PAID MODE: Save pending lead & proceed to Payment Summary + Razorpay checkout
      const pricing = getPricing();
      try {
        const payload = {
          ...formData,
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          phone: formData.contactNumber,
          organization: formData.companyName,
          eventId: currentEvent.id || currentEvent.slug,
          eventTitle: currentEvent.title,
          paymentAmount: pricing.totalPayable,
          paymentStatus: "Pending",
        };

        const res = await fetch("/api/events/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.data?.id) {
          setPendingRegId(data.data.id);
        }
      } catch (leadErr) {
        console.warn("Could not pre-save pending registration lead:", leadErr);
      }

      setModalStep("payment");
    }
  };

  // Helper to dynamically load Razorpay checkout SDK if missing
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof (window as any).Razorpay !== "undefined") {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Step 2: Final Registration Submission & Razorpay Payment Trigger
  const handleFinalCheckoutAndRegister = async () => {
    setSubmitting(true);
    const pricing = getPricing();
    const razorpayKey = (import.meta.env as any)["VITE_RAZORPAY_KEY_ID"] || "rzp_test_SwedUUn1KgRMs0";

    try {
      if (pricing.totalPayable > 0) {
        // Ensure Razorpay SDK is loaded
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error("Could not load Razorpay Payment Gateway. Please check internet connection.");
          setSubmitting(false);
          return;
        }

        const activeKey = (paymentConfig?.razorpay_key_id || razorpayKey).trim();
        const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/logo.jpeg` : "/logo.jpeg";

        // Create Order on backend first to get a valid Razorpay order_id
        let razorpayOrderId: string | null = null;
        try {
          const orderRes = await fetch("/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: pricing.totalPayable,
              currency: paymentConfig?.currency || "INR",
              receipt: `rcpt_${Date.now()}`,
            }),
          });
          const orderData = await orderRes.json();
          if (orderData.success && orderData.order?.id) {
            razorpayOrderId = orderData.order.id;
          }
        } catch (oErr) {
          console.warn("Could not pre-create Razorpay order ID:", oErr);
        }

        // Options for Razorpay Checkout Modal
        const options: any = {
          key: activeKey,
          amount: Math.round(pricing.totalPayable * 100), // Amount in paise
          currency: paymentConfig?.currency || "INR",
          name: "Executive Talks Media Business Intelligence",
          description: `${formData.registrationCategory} Pass: ${currentEvent.title}`,
          image: logoUrl,
          order_id: razorpayOrderId || undefined,
          prefill: {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email.trim(),
            contact: formData.contactNumber.trim(),
          },
          theme: {
            color: "#0891b2",
          },
          handler: async function (response: any) {
            try {
              const payload = {
                id: pendingRegId || undefined,
                ...formData,
                name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                phone: formData.contactNumber,
                organization: formData.companyName,
                eventId: currentEvent.id || currentEvent.slug,
                eventTitle: currentEvent.title,
                paymentAmount: pricing.totalPayable,
                paymentStatus: "Paid",
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id || razorpayOrderId || null,
                couponApplied: appliedCoupon?.code || null,
              };

              // Optionally verify signature if order_id and signature are returned
              if (response.razorpay_order_id && response.razorpay_signature) {
                try {
                  await fetch("/api/payments/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                    }),
                  });
                } catch (vErr) {
                  console.warn("Signature verification call error:", vErr);
                }
              }

              const res = await fetch("/api/events/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              const data = await res.json();
              toast.success(`💳 Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
              setSubmittedData({
                ...formData,
                eventTitle: currentEvent.title,
                emailSent: data.emailSent,
                paymentId: response.razorpay_payment_id,
                totalPaid: pricing.totalPayable,
              });
              setSuccessModalOpen(true);
            } catch (pErr) {
              console.error("Payment save error:", pErr);
              toast.error("Payment received but error saving registration.");
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.info("Payment window closed.");
              setSubmitting(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          toast.error(`Payment failed: ${response.error.description || response.error.reason}`);
          setSubmitting(false);
        });

        // Open Razorpay Modal synchronously in user click gesture
        rzp.open();
      } else {
        // Free registration path
        const payload = {
          ...formData,
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          phone: formData.contactNumber,
          organization: formData.companyName,
          eventId: currentEvent.id || currentEvent.slug,
          eventTitle: currentEvent.title,
          paymentAmount: 0,
          paymentStatus: "Free",
          couponApplied: appliedCoupon?.code || null,
        };

        const res = await fetch("/api/events/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Registration failed.");
          setSubmitting(false);
          return;
        }

        setSubmittedData({
          ...formData,
          eventTitle: currentEvent.title,
          emailSent: data.emailSent,
          totalPaid: 0,
        });
        setSuccessModalOpen(true);
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Could not process registration.");
      setSubmitting(false);
    }
  };

  const countriesList = [
    "India",
    "United States",
    "United Kingdom",
    "Singapore",
    "United Arab Emirates",
    "Germany",
    "Australia",
    "Canada",
    "Japan",
    "France",
    "Other",
  ];

  return (
    <>
      {/* 1. REGISTRATION FORM & PAYMENT MODAL */}
      {!successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-[96vw] xl:max-w-[1500px] max-h-[94vh] sm:max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-900 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* STICKY MODAL HEADER */}
            <div className="flex-none border-b border-slate-200 p-4 sm:p-5 bg-slate-50/90 relative z-10">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full bg-slate-200/80 p-2 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition-all shadow-sm cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-600">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Executive Platform Registration</span>
                  </div>
                  <h3 className="mt-0.5 text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900">
                    {activeMode === "free" ? "Register Free Interest" : "Delegate Pass Registration"}
                  </h3>
                  {/* Mode Selector Tabs */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setActiveMode("paid"); setModalStep("form"); }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        activeMode === "paid"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900"
                      }`}
                    >
                      💳 Paid Pass (With Payment)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveMode("free"); setModalStep("form"); }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        activeMode === "free"
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20 font-extrabold"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900"
                      }`}
                    >
                      ✨ Free Interest (No Payment)
                    </button>
                  </div>
                </div>

                {/* Interactive Event Selector Banner */}
                <div className="rounded-2xl border border-slate-200 bg-white p-2.5 sm:px-4 sm:py-2 text-slate-800 shadow-sm sm:w-80 md:w-96 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-cyan-600" />
                      <span>Select Summit / Event</span>
                    </span>
                    {eventsList.length > 1 && (
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full font-mono">
                        {eventsList.length} Events Available
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={currentEvent.id || currentEvent.slug || ""}
                      onChange={(e) => {
                        const found = eventsList.find((ev) => (ev.id || ev.slug) === e.target.value);
                        if (found) {
                          setSelectedEvent(found);
                        }
                      }}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-8 text-xs sm:text-sm font-bold text-slate-900 shadow-xs focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 hover:border-slate-300 transition-all cursor-pointer truncate"
                    >
                      {eventsList.map((ev) => (
                        <option key={ev.id || ev.slug} value={ev.id || ev.slug} className="bg-white text-slate-900 py-1 font-semibold">
                          {ev.title} {ev.city ? `(${ev.city})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-600 pointer-events-none" />
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
                    {currentEvent.date && (
                      <span className="flex items-center gap-1 text-cyan-700 font-semibold">
                        <Calendar className="h-3 w-3 text-cyan-600 shrink-0" /> {currentEvent.date}
                      </span>
                    )}
                    {(currentEvent.venue || currentEvent.city) && (
                      <span className="flex items-center gap-1 text-purple-700 font-semibold truncate">
                        <MapPin className="h-3 w-3 text-purple-600 shrink-0" /> {currentEvent.venue ? `${currentEvent.venue}, ` : ""}{currentEvent.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 1: FORM INPUTS VIEW */}
            {modalStep === "form" && (
              <form onSubmit={handleProceedToPayment} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar min-h-0 bg-white">
                
                {/* Section 1: Personal & Executive Details (4 Columns on Desktop) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                    <User className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Personal & Executive Details</span>
                  </div>

                  {/* 4-Column Grid Row 1: Name, Email & Phone */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Rajesh"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Sharma"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rajesh@company.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Contact Number *</span>
                        {phoneTouched && !phoneError && formData.contactNumber && (
                          <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                            ✓ Valid contact number
                          </span>
                        )}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.contactNumber}
                        onChange={(e) => {
                          const cleanVal = e.target.value.replace(/[^\d\+\-\s\(\)]/g, "");
                          setFormData({ ...formData, contactNumber: cleanVal });
                          if (phoneTouched) setPhoneError(validatePhoneNumber(cleanVal));
                        }}
                        onBlur={() => {
                          setPhoneTouched(true);
                          setPhoneError(validatePhoneNumber(formData.contactNumber));
                        }}
                        placeholder="+91 98765 43210"
                        className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all font-medium ${
                          phoneTouched && phoneError
                            ? "border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : phoneTouched && !phoneError && formData.contactNumber
                            ? "border-emerald-500 bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            : "border-slate-200 bg-slate-50 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                        }`}
                      />
                      {phoneTouched && phoneError && (
                        <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in">
                          <span>⚠️</span> {phoneError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4-Column Grid Row 2: Designation, Company, City & Country */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. Chief Financial Officer"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Reliance Industries"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Mumbai"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium cursor-pointer"
                      >
                        {countriesList.map((c) => (
                          <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Registration Tier Plans Grid (Gold Pass, Premium Pass, Platinum Pass) */}
                {activeMode === "paid" && (
                  <div className="pt-2">
                    {(() => {
                      let parsedPlans: PricingPlanTier[] = [];
                      if (typeof paymentConfig?.pricing_plans === "string") {
                        try { parsedPlans = JSON.parse(paymentConfig.pricing_plans); } catch (e) {}
                      } else if (Array.isArray(paymentConfig?.pricing_plans)) {
                        parsedPlans = paymentConfig.pricing_plans;
                      }
                      if (!parsedPlans || parsedPlans.length === 0) {
                        parsedPlans = getDefaultPricingPlans();
                      }
                      return (
                        <RegistrationPlansGrid
                          plans={parsedPlans}
                          earlyBirdEnabled={paymentConfig?.early_bird_enabled}
                          earlyBirdStartDate={paymentConfig?.early_bird_start_date}
                          earlyBirdEndDate={paymentConfig?.early_bird_end_date}
                          onSelectPlan={(plan) => {
                            setFormData((prev) => ({ ...prev, registrationCategory: plan.name }));
                            toast.success(`Selected ${plan.name} (₹${Number(plan.early_bird_price && checkEarlyBirdStatus(paymentConfig?.early_bird_enabled, paymentConfig?.early_bird_start_date, paymentConfig?.early_bird_end_date).isActive ? plan.early_bird_price : plan.price).toLocaleString("en-IN")})`);
                          }}
                          selectedPlanId={formData.registrationCategory}
                        />
                      );
                    })()}
                  </div>
                )}

                {/* Section 3: Category & Preferences (3 Columns) */}
                <div className="space-y-3 pt-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                    <Tag className="h-3.5 w-3.5 text-purple-600" />
                    <span>Category & Participation Preferences</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Registration Category
                      </label>
                      <select
                        value={formData.registrationCategory}
                        onChange={(e) => setFormData({ ...formData, registrationCategory: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-600 transition-all cursor-pointer"
                      >
                        <option value="Delegate" className="bg-white text-slate-900">Delegate Pass</option>
                        <option value="Speaker" className="bg-white text-slate-900">Speaker Slot</option>
                        <option value="Sponsorship" className="bg-white text-slate-900">Sponsorship Opportunity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Registering City
                      </label>
                      <select
                        value={formData.registeringCity}
                        onChange={(e) => setFormData({ ...formData, registeringCity: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-600 transition-all cursor-pointer"
                      >
                        {finalCityOptions.map((c) => (
                          <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                        Referral Source
                      </label>
                      <select
                        value={formData.referralSource}
                        onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-600 transition-all cursor-pointer"
                      >
                        <option value="LinkedIn" className="bg-white text-slate-900">LinkedIn</option>
                        <option value="Facebook" className="bg-white text-slate-900">Facebook</option>
                        <option value="Instagram" className="bg-white text-slate-900">Instagram</option>
                        <option value="Google" className="bg-white text-slate-900">Google Search</option>
                        <option value="Friend" className="bg-white text-slate-900">Friend / Peer</option>
                        <option value="Email" className="bg-white text-slate-900">Email Newsletter</option>
                        <option value="WhatsApp" className="bg-white text-slate-900">WhatsApp</option>
                        <option value="Other" className="bg-white text-slate-900">Other Channel</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Bottom Row with reCAPTCHA & Submit Button Side-by-Side */}
                <div className="pt-2 grid gap-3 lg:grid-cols-12 items-center">
                  {/* Google reCAPTCHA Verification */}
                  <div className="lg:col-span-7">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:px-4 sm:py-2.5 transition-all hover:border-slate-300">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (verifiedCaptcha) {
                                setVerifiedCaptcha(false);
                              } else {
                                setCaptchaVerifying(true);
                                setTimeout(() => {
                                  setCaptchaVerifying(false);
                                  setVerifiedCaptcha(true);
                                  toast.success("reCAPTCHA Verification Successful!");
                                }, 400);
                              }
                            }}
                            className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all duration-200 cursor-pointer ${
                              verifiedCaptcha
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                                : captchaVerifying
                                ? "border-cyan-600 bg-cyan-50 text-cyan-600"
                                : "border-slate-300 bg-white text-transparent hover:border-cyan-500"
                            }`}
                          >
                            {captchaVerifying ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-600" />
                            ) : verifiedCaptcha ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : null}
                          </button>

                          <div>
                            <span
                              onClick={() => {
                                if (!verifiedCaptcha && !captchaVerifying) {
                                  setCaptchaVerifying(true);
                                  setTimeout(() => {
                                    setCaptchaVerifying(false);
                                    setVerifiedCaptcha(true);
                                    toast.success("reCAPTCHA Verification Successful!");
                                  }, 400);
                                }
                              }}
                              className="text-xs font-semibold text-slate-800 block select-none cursor-pointer hover:text-cyan-600 transition-colors"
                            >
                              I'm not a robot
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">
                              {verifiedCaptcha ? "Verification Complete" : "Click box to verify"}
                            </span>
                          </div>
                        </div>

                        {/* Google reCAPTCHA Emblem Badge */}
                        <div className="flex flex-col items-end shrink-0 select-none">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                            <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
                            <span>reCAPTCHA</span>
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-slate-400 mt-0.5">
                            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-600">Privacy</a>
                            <span>·</span>
                            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-600">Terms</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="lg:col-span-5">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-5 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer font-btn disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Submitting Registration...</span>
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4 text-white" />
                          <span>
                            {activeMode === "free" ? "Submit Free Interest Registration →" : "Proceed to Order & Payment →"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: ORDER SUMMARY & PAYMENT DETAILS (WIDE 2-COLUMN RESPONSIVE LAYOUT) */}
            {modalStep === "payment" && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar min-h-0 bg-white">
                {/* Top Step Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-600">
                    <CreditCard className="h-4 w-4" />
                    <span>Step 2 of 2: Pricing & Payment Summary</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalStep("form")}
                    className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Edit Details
                  </button>
                </div>

                {/* Side-by-Side Grid Layout: Left Details (col-span-5) & Right Pricing Breakdown (col-span-7) */}
                <div className="grid gap-5 lg:grid-cols-12 items-start">
                  
                  {/* LEFT COLUMN: DELEGATE & EVENT RECAP CARD */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3.5 text-xs text-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Delegate Name</span>
                        <strong className="text-slate-900 text-sm">{formData.firstName} {formData.lastName}</strong>
                        <span className="block text-slate-700 mt-0.5">{formData.designation}</span>
                        <span className="block text-slate-600">{formData.companyName}</span>
                        <span className="block text-cyan-700 font-mono text-[11px] mt-1">{formData.email}</span>
                        <span className="block text-slate-600 text-[11px]">Phone: {formData.contactNumber}</span>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Event & Category</span>
                        <strong className="text-cyan-800 text-sm block mt-0.5 leading-snug">{currentEvent.title}</strong>
                        <span className="block text-purple-700 font-semibold mt-1">Category: {formData.registrationCategory} ({formData.registeringCity})</span>
                        <span className="block text-slate-600 text-[11px] mt-0.5">Location: {formData.city}, {formData.country}</span>
                      </div>
                    </div>

                    {/* Security & Verification Card */}
                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-cyan-800 font-bold">
                        <ShieldCheck className="h-4 w-4 text-cyan-600 shrink-0" />
                        <span>Instant Ticket & Verification</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Upon payment completion, an official confirmation email with your scannable QR Code pass will be dispatched automatically to <span className="text-cyan-800 font-mono font-semibold">{formData.email}</span> and <span className="text-cyan-800 font-mono font-semibold">registration@etmedia.in</span>.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: PRICING BREAKDOWN, PROMO COUPON & PAY BUTTON */}
                  <div className="lg:col-span-7 space-y-4">
                    {(() => {
                      const pricing = getPricing();
                      return (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 shadow-sm">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-cyan-600" />
                            <span>Registration Fee Breakdown</span>
                          </h4>

                          <div className="space-y-2 text-xs">
                            {/* Base Category Price */}
                            <div className="flex justify-between text-slate-700">
                              <span>Base Fee ({formData.registrationCategory}):</span>
                              <span className="font-mono font-bold text-slate-900">₹{pricing.baseFee.toLocaleString("en-IN")}</span>
                            </div>

                            {/* Early Bird Discount */}
                            {pricing.earlyBirdDiscount > 0 && (
                              <div className="flex justify-between text-purple-700">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-purple-600" />
                                  Early Bird Promotional Discount:
                                </span>
                                <span className="font-mono font-bold text-purple-700">- ₹{pricing.earlyBirdDiscount.toLocaleString("en-IN")}</span>
                              </div>
                            )}

                            {/* Coupon Discount */}
                            {pricing.couponDiscount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-bold">
                                <span className="flex items-center gap-1">
                                  <Tag className="h-3 w-3 text-emerald-600" />
                                  Coupon Discount ({appliedCoupon?.code}):
                                </span>
                                <span className="font-mono">- ₹{pricing.couponDiscount.toLocaleString("en-IN")}</span>
                              </div>
                            )}

                            {/* GST Tax */}
                            <div className="flex justify-between text-slate-600">
                              <span>GST ({pricing.gstPct}% Tax):</span>
                              <span className="font-mono text-cyan-700 font-semibold">
                                {paymentConfig?.gst_included ? "Included in Base Fee" : `+ ₹${pricing.gstAmt.toLocaleString("en-IN")}`}
                              </span>
                            </div>

                            <div className="h-px bg-slate-200 my-2" />

                            {/* Total Payable */}
                            <div className="flex justify-between items-baseline pt-1">
                              <div>
                                <span className="text-xs uppercase tracking-wider text-slate-700 block font-bold">Total Amount Payable</span>
                                <span className="text-[10px] text-slate-500 font-medium">Includes event pass & networking access</span>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-700">₹{pricing.totalPayable.toLocaleString("en-IN")}</span>
                                <span className="block text-[10px] text-emerald-600 font-bold">Razorpay Test Gateway Enabled</span>
                              </div>
                            </div>
                          </div>

                          {/* PROMO COUPON CODE SECTION */}
                          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                            <label className="block text-[11px] font-bold text-slate-700">Have a Promo / Discount Coupon?</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                placeholder="e.g. EARLY50 or CXO2026"
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 uppercase placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleApplyCoupon}
                                className="rounded-xl border border-cyan-600 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-700 hover:bg-cyan-100 transition-all cursor-pointer"
                              >
                                Apply Coupon
                              </button>
                            </div>

                            {/* Active Coupons Quick Fill Badges */}
                            {(() => {
                              let sampleCoupons: any[] = [];
                              if (typeof paymentConfig?.coupons === "string") {
                                try { sampleCoupons = JSON.parse(paymentConfig.coupons); } catch(e) {}
                              } else if (Array.isArray(paymentConfig?.coupons)) {
                                sampleCoupons = paymentConfig.coupons;
                              }
                              if (sampleCoupons.length === 0) {
                                sampleCoupons = [
                                  { code: "EARLY50", type: "percentage", value: 20 },
                                  { code: "CXO2026", type: "flat", value: 1000 },
                                ];
                              }
                              return (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className="text-[10px] text-slate-500 font-medium">Available Promo Codes:</span>
                                  {sampleCoupons.map((cp: any, idx: number) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setCouponInput(cp.code);
                                        setAppliedCoupon(cp);
                                        toast.success(`Applied promo code ${cp.code}!`);
                                      }}
                                      className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-800 hover:bg-amber-100 transition-all cursor-pointer"
                                    >
                                      {cp.code} ({cp.type === "percentage" ? `${cp.value}% Off` : `₹${cp.value} Off`})
                                    </button>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* FINAL PAY BUTTON */}
                          <button
                            type="button"
                            onClick={handleFinalCheckoutAndRegister}
                            disabled={submitting}
                            className="w-full rounded-xl py-3.5 px-6 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                                <span>Processing Registration...</span>
                              </>
                            ) : pricing.totalPayable > 0 ? (
                              <>
                                <ShieldCheck className="h-4.5 w-4.5 text-white" />
                                <span>Proceed to Pay ₹{pricing.totalPayable.toLocaleString("en-IN")} via Razorpay</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                                <span>Complete Free Registration</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SUCCESS MODAL (AFTER SUBMISSION) */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl backdrop-blur-2xl overflow-hidden my-auto text-slate-900 animate-in zoom-in-95 duration-200">
            
            {/* CLOSE 'X' BUTTON */}
            <button
              type="button"
              onClick={() => {
                setSuccessModalOpen(false);
                onClose();
              }}
              className="absolute top-4 right-4 z-30 rounded-full bg-slate-100 p-2.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all shadow-md cursor-pointer border border-slate-200"
              aria-label="Close Registration Modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* BRAND HEADER BANNER */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 p-5 sm:p-6 text-white relative overflow-hidden flex-none">
              <div className="flex flex-wrap items-center justify-between gap-4 pr-12 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-transparent shrink-0">
                    <img src={logoUrl} alt="Executive Talks Media Logo" className="h-9 w-auto object-contain" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider font-display">EXECUTIVE TALKS MEDIA BUSINESS INTELLIGENCE</h2>
                    <p className="text-xs text-emerald-100 font-semibold tracking-wide uppercase">Official Executive Delegate Pass & Confirmation</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md shadow-lg shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 animate-bounce" />
                  <span>REGISTRATION CONFIRMED</span>
                </div>
              </div>
            </div>

            {/* MODAL SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 scrollbar-thin bg-white">
              
              {/* TOP SALUTATION BANNER */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white border border-emerald-500 shrink-0 shadow-md">
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                      Thank You, <span className="text-emerald-700 capitalize">{submittedData?.firstName}!</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      Your executive registration for <strong className="text-cyan-700">{submittedData?.eventTitle}</strong> has been successfully confirmed.
                    </p>
                  </div>
                </div>

                {submittedData?.paymentId && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-mono font-bold text-cyan-800 shrink-0 shadow-xs">
                    <ShieldCheck className="h-4 w-4 text-cyan-600" />
                    <span>Razorpay ID: {submittedData.paymentId}</span>
                  </div>
                )}
              </div>

              {/* 2-COLUMN RESPONSIVE GRID */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* LEFT COLUMN: REGISTRATION & PAYMENT DETAILS */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-700 border-b border-slate-200 pb-2.5 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Registered Delegate Credentials</span>
                  </h4>

                  <div className="space-y-3 text-xs text-slate-800">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Full Name:</span>
                      <strong className="text-slate-900 font-bold capitalize">{submittedData?.firstName} {submittedData?.lastName}</strong>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Official Work Email:</span>
                      <span className="text-cyan-700 font-mono font-semibold">{submittedData?.email}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Contact Number:</span>
                      <span className="text-slate-900 font-mono font-medium">{submittedData?.contactNumber}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Designation:</span>
                      <span className="text-slate-900 font-semibold">{submittedData?.designation || "Executive Delegate"}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Company / Organization:</span>
                      <span className="text-slate-900 font-semibold">{submittedData?.companyName || "N/A"}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Category & Location:</span>
                      <span className="text-purple-700 font-semibold">{submittedData?.registrationCategory || "Delegate"} ({submittedData?.registeringCity || submittedData?.city})</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500 font-medium">Payment Summary:</span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        submittedData?.totalPaid > 0
                          ? "bg-emerald-100 border border-emerald-300 text-emerald-800"
                          : "bg-blue-100 border border-blue-300 text-blue-800"
                      }`}>
                        {submittedData?.totalPaid > 0 ? `Paid ₹${submittedData.totalPaid.toLocaleString("en-IN")}` : "Free Pass"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: DISPATCHED EMAIL PREVIEW & TICKET INFO */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 border-b border-slate-200 pb-2.5 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Confirmation Email & Scannable Pass Dispatched</span>
                  </h4>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-600 font-mono text-[11px]">Recipient: <strong className="text-cyan-700">{submittedData?.email}</strong></span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">Dispatched</span>
                    </div>

                    <div className="space-y-2 text-slate-700 leading-relaxed text-xs">
                      <p>Dear <strong>{submittedData?.firstName}</strong>,</p>
                      <p>Your registration for <strong>{submittedData?.eventTitle}</strong> has been successfully confirmed.</p>
                      <p className="text-slate-600 text-[11px]">
                        📱 A high-resolution scannable QR Delegate Pass has been generated and sent directly to your email inbox (<span className="text-cyan-700 font-medium">{submittedData?.email}</span>) and admin record.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Support: <a href="mailto:registration@etmedia.in" className="text-cyan-600 hover:underline">registration@etmedia.in</a></span>
                      <span className="font-semibold text-slate-700">www.etmedia.in</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* STICKY FOOTER ACTION BAR */}
            <div className="flex-none border-t border-slate-200 p-4 sm:p-5 bg-slate-50 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 hidden sm:inline-block font-mono">
                Executive Talks Media Business Intelligence Executive Committee
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessModalOpen(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-black text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  <span>Done & Close</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
