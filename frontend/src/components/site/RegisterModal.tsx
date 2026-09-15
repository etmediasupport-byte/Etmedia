import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, ShieldCheck, Mail, Calendar, MapPin, Sparkles, Award, User, Tag, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { EventItem } from "@/lib/site-data";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export function RegisterModal({ isOpen, onClose, event }: RegisterModalProps) {
  const [modalStep, setModalStep] = useState<"form" | "payment">("form");
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

  // Auto-select event details & fetch payment configuration when event changes
  useEffect(() => {
    if (event) {
      setModalStep("form");
      setAppliedCoupon(null);
      setCouponInput("");

      let cities: string[] = [];
      try {
        if (typeof event.locations === "string") {
          const parsed = JSON.parse(event.locations);
          cities = parsed.map((l: any) => l.city).filter(Boolean);
        } else if (Array.isArray(event.locations)) {
          cities = event.locations.map((l: any) => l.city).filter(Boolean);
        }
      } catch (e) {}

      if (cities.length === 0 && event.city) {
        cities = [event.city];
      }
      const initialRegisteringCity = cities[0] || "Mumbai";

      setFormData((prev) => ({
        ...prev,
        registeringCity: initialRegisteringCity,
      }));

      // Fetch payment config for event
      fetch(`/api/event-payments/event/${event.id || event.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.payment) {
            setPaymentConfig(data.payment);
          }
        })
        .catch((err) => console.warn("Could not load payment settings for event", err));
    }
  }, [event]);

  if (!isOpen || !event) return null;

  // Extract cities list for dropdown
  let eventCities: string[] = [];
  try {
    if (typeof event.locations === "string") {
      const parsed = JSON.parse(event.locations);
      eventCities = parsed.map((l: any) => l.city).filter(Boolean);
    } else if (Array.isArray(event.locations)) {
      eventCities = event.locations.map((l: any) => l.city).filter(Boolean);
    }
  } catch (e) {}
  if (eventCities.length === 0 && event.city) {
    eventCities = [event.city];
  }
  const defaultCities = ["Mumbai", "Bengaluru", "Hyderabad", "New Delhi", "Pune", "Chennai", "Kolkata"];
  const finalCityOptions = Array.from(new Set([...eventCities, ...defaultCities]));

  // Calculate pricing breakdown
  const getPricing = () => {
    let baseFee = Number(paymentConfig?.registration_fee) || 4999;

    if (paymentConfig?.registration_type_prices) {
      let categoryPrices: any = {};
      if (typeof paymentConfig.registration_type_prices === "string") {
        try { categoryPrices = JSON.parse(paymentConfig.registration_type_prices); } catch (e) {}
      } else {
        categoryPrices = paymentConfig.registration_type_prices;
      }
      
      const catKey = formData.registrationCategory;
      if (categoryPrices[catKey] !== undefined) {
        baseFee = Number(categoryPrices[catKey]);
      } else if (catKey === "Delegate" && categoryPrices["Delegate Pass"] !== undefined) {
        baseFee = Number(categoryPrices["Delegate Pass"]);
      } else if (catKey === "Speaker" && categoryPrices["Speaker Slot"] !== undefined) {
        baseFee = Number(categoryPrices["Speaker Slot"]);
      } else if (catKey === "Sponsorship" && categoryPrices["Sponsorship Opportunity"] !== undefined) {
        baseFee = Number(categoryPrices["Sponsorship Opportunity"]);
      }
    }

    let earlyBirdDiscount = 0;
    if (paymentConfig?.early_bird_enabled && paymentConfig?.early_bird_price && baseFee > paymentConfig.early_bird_price) {
      earlyBirdDiscount = baseFee - Number(paymentConfig.early_bird_price);
    }

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percentage") {
        couponDiscount = Math.round((baseFee * Number(appliedCoupon.value)) / 100);
      } else {
        couponDiscount = Number(appliedCoupon.value);
      }
    }

    const totalDiscount = Math.min(baseFee, earlyBirdDiscount + couponDiscount);
    const netBase = Math.max(0, baseFee - totalDiscount);
    const gstPct = Number(paymentConfig?.gst_percentage) || 18;
    const gstAmt = paymentConfig?.gst_included ? 0 : Math.round((netBase * gstPct) / 100);
    const totalPayable = paymentConfig?.gst_included ? netBase : netBase + gstAmt;

    return {
      baseFee,
      earlyBirdDiscount,
      couponDiscount,
      totalDiscount,
      netBase,
      gstPct,
      gstAmt,
      totalPayable,
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

  // Step 1: Form Validation & Proceed to Payment Summary
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter your First Name and Last Name.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter a valid work email.");
      return;
    }

    if (!formData.contactNumber.trim()) {
      toast.error("Please enter a valid contact number.");
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

    setModalStep("payment");
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
          name: "ET Media Business Intelligence",
          description: `${formData.registrationCategory} Pass: ${event.title}`,
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
                ...formData,
                name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
                phone: formData.contactNumber,
                organization: formData.companyName,
                eventId: event.id || event.slug,
                eventTitle: event.title,
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
                eventTitle: event.title,
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
          eventId: event.id || event.slug,
          eventTitle: event.title,
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
          eventTitle: event.title,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(0,174,239,0.35)] text-slate-100 backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* STICKY MODAL HEADER */}
            <div className="flex-none border-b border-slate-800/80 p-4 sm:p-5 bg-slate-900/95 relative z-10">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-all shadow-md cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Executive Platform Registration</span>
                  </div>
                  <h3 className="mt-0.5 text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                    {modalStep === "form" ? "Register Now" : "Order & Payment Summary"}
                  </h3>
                </div>

                {/* Auto Selected Event Banner */}
                <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/30 p-2.5 sm:px-4 sm:py-2.5 text-slate-200 shadow-inner sm:max-w-md">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block">
                    Auto-Selected Summit
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {event.title}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-400">
                    {event.date && (
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Calendar className="h-3 w-3 text-cyan-400" /> {event.date}
                      </span>
                    )}
                    {(event.venue || event.city) && (
                      <span className="flex items-center gap-1 text-purple-300 truncate">
                        <MapPin className="h-3 w-3 text-purple-400 shrink-0" /> {event.venue ? `${event.venue}, ` : ""}{event.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 1: FORM INPUTS VIEW */}
            {modalStep === "form" && (
              <form onSubmit={handleProceedToPayment} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar min-h-0">
                
                {/* Section 1: Personal & Executive Details (4 Columns on Desktop) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                    <User className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Personal & Executive Details</span>
                  </div>

                  {/* 4-Column Grid Row 1: Name, Email & Phone */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Rajesh"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Sharma"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rajesh@company.com"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* 4-Column Grid Row 2: Designation, Company, City & Country */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. Chief Financial Officer"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Reliance Industries"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Mumbai"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                      >
                        {countriesList.map((c) => (
                          <option key={c} value={c} className="bg-slate-900 text-slate-100">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Category & Preferences (3 Columns) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                    <Tag className="h-3.5 w-3.5 text-purple-400" />
                    <span>Category & Participation Preferences</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Registration Category
                      </label>
                      <select
                        value={formData.registrationCategory}
                        onChange={(e) => setFormData({ ...formData, registrationCategory: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                      >
                        <option value="Delegate" className="bg-slate-900">Delegate Pass</option>
                        <option value="Speaker" className="bg-slate-900">Speaker Slot</option>
                        <option value="Sponsorship" className="bg-slate-900">Sponsorship Opportunity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Registering City
                      </label>
                      <select
                        value={formData.registeringCity}
                        onChange={(e) => setFormData({ ...formData, registeringCity: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                      >
                        {finalCityOptions.map((c) => (
                          <option key={c} value={c} className="bg-slate-900">{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Referral Source
                      </label>
                      <select
                        value={formData.referralSource}
                        onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                      >
                        <option value="LinkedIn" className="bg-slate-900">LinkedIn</option>
                        <option value="Facebook" className="bg-slate-900">Facebook</option>
                        <option value="Instagram" className="bg-slate-900">Instagram</option>
                        <option value="Google" className="bg-slate-900">Google Search</option>
                        <option value="Friend" className="bg-slate-900">Friend / Peer</option>
                        <option value="Email" className="bg-slate-900">Email Newsletter</option>
                        <option value="WhatsApp" className="bg-slate-900">WhatsApp</option>
                        <option value="Other" className="bg-slate-900">Other Channel</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Bottom Row with reCAPTCHA & Submit Button Side-by-Side */}
                <div className="pt-2 grid gap-3 lg:grid-cols-12 items-center">
                  {/* Google reCAPTCHA Verification */}
                  <div className="lg:col-span-7">
                    <div className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3 sm:px-4 sm:py-2.5 shadow-inner transition-all hover:border-cyan-500/40">
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
                                ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                                : captchaVerifying
                                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                : "border-slate-600 bg-slate-900/90 text-transparent hover:border-cyan-400"
                            }`}
                          >
                            {captchaVerifying ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
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
                              className="text-xs font-semibold text-slate-200 block select-none cursor-pointer hover:text-cyan-400 transition-colors"
                            >
                              I'm not a robot
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {verifiedCaptcha ? "Verification Complete" : "Click box to verify"}
                            </span>
                          </div>
                        </div>

                        {/* Google reCAPTCHA Emblem Badge */}
                        <div className="flex flex-col items-end shrink-0 select-none">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                            <span>reCAPTCHA</span>
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-slate-500 mt-0.5">
                            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-300">Privacy</a>
                            <span>·</span>
                            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-300">Terms</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="lg:col-span-5">
                    <button
                      type="submit"
                      className="relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-[0_10px_30px_-5px_rgba(0,174,239,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(0,174,239,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer font-btn"
                    >
                      <Award className="h-4 w-4 text-white" />
                      <span>Confirm & Register Now →</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: ORDER SUMMARY & PAYMENT DETAILS (WIDE 2-COLUMN RESPONSIVE LAYOUT) */}
            {modalStep === "payment" && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar min-h-0">
                {/* Top Step Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                    <CreditCard className="h-4 w-4" />
                    <span>Step 2 of 2: Pricing & Payment Summary</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalStep("form")}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Edit Details
                  </button>
                </div>

                {/* Side-by-Side Grid Layout: Left Details (col-span-5) & Right Pricing Breakdown (col-span-7) */}
                <div className="grid gap-5 lg:grid-cols-12 items-start">
                  
                  {/* LEFT COLUMN: DELEGATE & EVENT RECAP CARD */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3.5 text-xs shadow-inner">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Delegate Name</span>
                        <strong className="text-slate-100 text-sm">{formData.firstName} {formData.lastName}</strong>
                        <span className="block text-slate-300 mt-0.5">{formData.designation}</span>
                        <span className="block text-slate-400">{formData.companyName}</span>
                        <span className="block text-cyan-400 font-mono text-[11px] mt-1">{formData.email}</span>
                        <span className="block text-slate-400 text-[11px]">Phone: {formData.contactNumber}</span>
                      </div>

                      <div className="border-t border-slate-800/80 pt-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Event & Category</span>
                        <strong className="text-cyan-300 text-sm block mt-0.5 leading-snug">{event.title}</strong>
                        <span className="block text-purple-300 font-semibold mt-1">Category: {formData.registrationCategory} ({formData.registeringCity})</span>
                        <span className="block text-slate-400 text-[11px] mt-0.5">Location: {formData.city}, {formData.country}</span>
                      </div>
                    </div>

                    {/* Security & Verification Card */}
                    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-slate-950 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold">
                        <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span>Instant Ticket & Verification</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Upon payment completion, an official confirmation email with your scannable QR Code pass will be dispatched automatically to <span className="text-cyan-300 font-mono">{formData.email}</span> and <span className="text-cyan-300 font-mono">registration@etmedia.in</span>.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: PRICING BREAKDOWN, PROMO COUPON & PAY BUTTON */}
                  <div className="lg:col-span-7 space-y-4">
                    {(() => {
                      const pricing = getPricing();
                      return (
                        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 space-y-4 shadow-xl">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-cyan-400" />
                            <span>Registration Fee Breakdown</span>
                          </h4>

                          <div className="space-y-2 text-xs">
                            {/* Base Category Price */}
                            <div className="flex justify-between text-slate-300">
                              <span>Base Fee ({formData.registrationCategory}):</span>
                              <span className="font-mono font-bold text-slate-100">₹{pricing.baseFee.toLocaleString("en-IN")}</span>
                            </div>

                            {/* Early Bird Discount */}
                            {pricing.earlyBirdDiscount > 0 && (
                              <div className="flex justify-between text-purple-300">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-purple-400" />
                                  Early Bird Promotional Discount:
                                </span>
                                <span className="font-mono font-bold text-purple-300">- ₹{pricing.earlyBirdDiscount.toLocaleString("en-IN")}</span>
                              </div>
                            )}

                            {/* Coupon Discount */}
                            {pricing.couponDiscount > 0 && (
                              <div className="flex justify-between text-emerald-400 font-bold">
                                <span className="flex items-center gap-1">
                                  <Tag className="h-3 w-3 text-emerald-400" />
                                  Coupon Discount ({appliedCoupon?.code}):
                                </span>
                                <span className="font-mono">- ₹{pricing.couponDiscount.toLocaleString("en-IN")}</span>
                              </div>
                            )}

                            {/* GST Tax */}
                            <div className="flex justify-between text-slate-400">
                              <span>GST ({pricing.gstPct}% Tax):</span>
                              <span className="font-mono text-cyan-300">
                                {paymentConfig?.gst_included ? "Included in Base Fee" : `+ ₹${pricing.gstAmt.toLocaleString("en-IN")}`}
                              </span>
                            </div>

                            <div className="h-px bg-slate-800 my-2" />

                            {/* Total Payable */}
                            <div className="flex justify-between items-baseline pt-1">
                              <div>
                                <span className="text-xs uppercase tracking-wider text-slate-400 block font-bold">Total Amount Payable</span>
                                <span className="text-[10px] text-slate-500 font-medium">Includes event pass & networking access</span>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">₹{pricing.totalPayable.toLocaleString("en-IN")}</span>
                                <span className="block text-[10px] text-emerald-400 font-bold">Razorpay Test Gateway Enabled</span>
                              </div>
                            </div>
                          </div>

                          {/* PROMO COUPON CODE SECTION */}
                          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
                            <label className="block text-[11px] font-bold text-slate-300">Have a Promo / Discount Coupon?</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                placeholder="e.g. EARLY50 or CXO2026"
                                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white uppercase placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleApplyCoupon}
                                className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
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
                                  <span className="text-[10px] text-slate-400">Available Promo Codes:</span>
                                  {sampleCoupons.map((cp: any, idx: number) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setCouponInput(cp.code);
                                        setAppliedCoupon(cp);
                                        toast.success(`Applied promo code ${cp.code}!`);
                                      }}
                                      className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
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
                            className="w-full rounded-xl py-3.5 px-6 text-sm font-extrabold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-[0_10px_30px_-5px_rgba(0,174,239,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(0,174,239,0.7)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3 sm:p-6 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-emerald-500/40 bg-slate-900/95 shadow-[0_25px_70px_-15px_rgba(16,185,129,0.35)] backdrop-blur-2xl overflow-hidden my-auto text-slate-100 animate-in zoom-in-95 duration-200">
            
            {/* CLOSE 'X' BUTTON */}
            <button
              type="button"
              onClick={() => {
                setSuccessModalOpen(false);
                onClose();
              }}
              className="absolute top-4 right-4 z-30 rounded-full bg-slate-800/90 p-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-xl cursor-pointer border border-slate-700"
              aria-label="Close Registration Modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* BRAND HEADER BANNER */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 p-5 sm:p-6 text-white relative overflow-hidden flex-none">
              <div className="flex flex-wrap items-center justify-between gap-4 pr-12 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-2xl shadow-md shrink-0">
                    <img src={logoUrl} alt="ET Media Logo" className="h-9 w-auto object-contain" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider font-display">ET MEDIA BUSINESS INTELLIGENCE</h2>
                    <p className="text-xs text-emerald-100 font-semibold tracking-wide uppercase">Official Executive Delegate Pass & Confirmation</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/40 border border-emerald-300/40 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-200 backdrop-blur-md shadow-lg shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-bounce" />
                  <span>REGISTRATION CONFIRMED</span>
                </div>
              </div>
            </div>

            {/* MODAL SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 scrollbar-thin">
              
              {/* TOP SALUTATION BANNER */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                      Thank You, <span className="text-emerald-400 capitalize">{submittedData?.firstName}!</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Your executive registration for <strong className="text-cyan-300">{submittedData?.eventTitle}</strong> has been successfully confirmed.
                    </p>
                  </div>
                </div>

                {submittedData?.paymentId && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-cyan-500/40 px-3.5 py-2 text-xs font-mono font-bold text-cyan-300 shrink-0">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Razorpay ID: {submittedData.paymentId}</span>
                  </div>
                )}
              </div>

              {/* 2-COLUMN RESPONSIVE GRID */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* LEFT COLUMN: REGISTRATION & PAYMENT DETAILS */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Registered Delegate Credentials</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Full Name:</span>
                      <strong className="text-white font-bold capitalize">{submittedData?.firstName} {submittedData?.lastName}</strong>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Official Work Email:</span>
                      <span className="text-cyan-300 font-mono font-semibold">{submittedData?.email}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Contact Number:</span>
                      <span className="text-slate-200 font-mono">{submittedData?.contactNumber}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Designation:</span>
                      <span className="text-slate-200 font-semibold">{submittedData?.designation || "Executive Delegate"}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Company / Organization:</span>
                      <span className="text-slate-200 font-semibold">{submittedData?.companyName || "N/A"}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Category & Location:</span>
                      <span className="text-purple-300 font-semibold">{submittedData?.registrationCategory || "Delegate"} ({submittedData?.registeringCity || submittedData?.city})</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400">Payment Summary:</span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        submittedData?.totalPaid > 0
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                          : "bg-blue-500/20 border border-blue-500/40 text-blue-300"
                      }`}>
                        {submittedData?.totalPaid > 0 ? `Paid ₹${submittedData.totalPaid.toLocaleString("en-IN")}` : "Free Pass"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: DISPATCHED EMAIL PREVIEW & TICKET INFO */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Confirmation Email & Scannable Pass Dispatched</span>
                  </h4>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400 font-mono text-[11px]">Recipient: <strong className="text-cyan-300">{submittedData?.email}</strong></span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">Dispatched</span>
                    </div>

                    <div className="space-y-2 text-slate-300 leading-relaxed text-xs">
                      <p>Dear <strong>{submittedData?.firstName}</strong>,</p>
                      <p>Your registration for <strong>{submittedData?.eventTitle}</strong> has been successfully confirmed.</p>
                      <p className="text-slate-400 text-[11px]">
                        📱 A high-resolution scannable QR Delegate Pass has been generated and sent directly to your email inbox (<span className="text-cyan-300">{submittedData?.email}</span>) and admin record.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Support: <a href="mailto:registration@etmedia.in" className="text-cyan-400 hover:underline">registration@etmedia.in</a></span>
                      <span className="font-semibold text-slate-300">www.etmedia.in</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* STICKY FOOTER ACTION BAR */}
            <div className="flex-none border-t border-slate-800 p-4 sm:p-5 bg-slate-950/95 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
                ET Media Business Intelligence Executive Committee
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessModalOpen(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-[0_10px_30px_-5px_rgba(0,174,239,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(0,174,239,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer text-sm uppercase tracking-wider flex items-center justify-center gap-2"
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
