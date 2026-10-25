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
  ShieldCheck,
  Award,
  Briefcase,
  Clock,
  HelpCircle,
  Maximize2,
  Eye,
  X,
  ExternalLink,
  FileCheck2,
  CreditCard,
  IndianRupee,
  AlertCircle,
  Info,
  Lock,
  Crown,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/site/SEOHead";
import { events as defaultEvents, getValidImageUrl, getDefaultEventImage } from "@/lib/site-data";
import { fetchWithCache } from "@/lib/api-cache";
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
import {
  HR_RECALL_DEFAULT_CATEGORIES,
  HR_RECALL_DEFAULT_TEAM_CATEGORIES,
  HR_RECALL_DEFAULT_ORG_CATEGORIES,
} from "./EventRegistrationWizardPage";

interface RegistrationFieldErrors {
  firstName?: string;
  lastName?: string;
  workEmail?: string;
  contactNumber?: string;
  designation?: string;
  companyName?: string;
  city?: string;
  linkedinUrl?: string;
  reasonForAttending?: string;
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
  reasonForAttending?: boolean;
}

export default function FreeRegistrationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetSlug = slug || searchParams.get("event") || "hr-recall-2k26";
  const cleanTargetSlug = targetSlug.replace(/-\d+$/, "").toLowerCase();

  const initialFallback = defaultEvents.find(
    (e) => (e.slug || "").toLowerCase() === cleanTargetSlug ||
           (e.id || "").toLowerCase() === cleanTargetSlug ||
           (e.slug || "").toLowerCase().includes(cleanTargetSlug) ||
           cleanTargetSlug.includes((e.slug || "").toLowerCase())
  ) || defaultEvents[0];

  const [eventData, setEventData] = useState<any>(initialFallback);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Guaranteed valid event image
  const eventImageSrc = getValidImageUrl(
    eventData?.image || eventData?.event_image || eventData?.about_image,
    eventData?.title,
    eventData?.category
  );

  // Scroll to top on step changes
  useEffect(() => {
    const scrollToWizardTop = () => {
      if (typeof window !== "undefined" && (window as any).__lenis) {
        try {
          (window as any).__lenis.scrollTo(0, { immediate: true });
        } catch (_) {}
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToWizardTop();
    const r1 = requestAnimationFrame(scrollToWizardTop);
    const t1 = setTimeout(scrollToWizardTop, 40);
    const t2 = setTimeout(scrollToWizardTop, 120);

    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentStep]);

  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [draftRegId, setDraftRegId] = useState<string>("");

  // --- STEP 4 FORM STATE: Award Nomination & Attending Poster ---
  const [wantsAwardNomination, setWantsAwardNomination] = useState<string>(""); // "" | "No" | "Yes"
  const [selectedAwardCategory, setSelectedAwardCategory] = useState<string>("");
  const [awardCategoriesList, setAwardCategoriesList] = useState<string[]>(HR_RECALL_DEFAULT_CATEGORIES);
  const [awardNominationFee, setAwardNominationFee] = useState<number>(5000);
  const [awardNominationEnabled, setAwardNominationEnabled] = useState<boolean>(true);
  const [awardCategoryError, setAwardCategoryError] = useState<string>("");

  // Team Award Nomination
  const [wantsTeamNomination, setWantsTeamNomination] = useState<string>(""); // "" | "No" | "Yes"
  const [selectedTeamCategory, setSelectedTeamCategory] = useState<string>("");
  const [teamAwardCategoriesList, setTeamAwardCategoriesList] = useState<string[]>(HR_RECALL_DEFAULT_TEAM_CATEGORIES);
  const [teamAwardNominationFee, setTeamAwardNominationFee] = useState<number>(10000);
  const [teamAwardNominationEnabled, setTeamAwardNominationEnabled] = useState<boolean>(true);
  const [teamAwardCategoryError, setTeamAwardCategoryError] = useState<string>("");

  // Organization Award Nomination
  const [wantsOrgNomination, setWantsOrgNomination] = useState<string>(""); // "" | "No" | "Yes"
  const [selectedOrgCategory, setSelectedOrgCategory] = useState<string>("");
  const [orgAwardCategoriesList, setOrgAwardCategoriesList] = useState<string[]>(HR_RECALL_DEFAULT_ORG_CATEGORIES);
  const [orgAwardNominationFee, setOrgAwardNominationFee] = useState<number>(15000);
  const [orgAwardNominationEnabled, setOrgAwardNominationEnabled] = useState<boolean>(true);
  const [orgAwardCategoryError, setOrgAwardCategoryError] = useState<string>("");

  // "I'm Attending" Poster
  const [attendingPosterChoice, setAttendingPosterChoice] = useState<string>("");
  const [attendingPosterEnabled, setAttendingPosterEnabled] = useState<boolean>(true);
  const [attendingPosterWhatsapp, setAttendingPosterWhatsapp] = useState<string>("+91 94930 87788");
  const [posterChoiceError, setPosterChoiceError] = useState<string>("");

  // Payment states for Paid Award Nominations in Free Flow
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>("");
  const [razorpayActiveKey, setRazorpayActiveKey] = useState<string>("");

  // Determine whether Step 4 is active based on Admin settings
  const isAwardStepEnabled = Boolean(
    awardNominationEnabled ||
    teamAwardNominationEnabled ||
    orgAwardNominationEnabled ||
    attendingPosterEnabled
  );

  // Dynamic fee calculations for award nominations
  const individualNominationFee = (awardNominationEnabled && wantsAwardNomination === "Yes") ? (Number(awardNominationFee) || 0) : 0;
  const teamNominationFee = (teamAwardNominationEnabled && wantsTeamNomination === "Yes") ? (Number(teamAwardNominationFee) || 0) : 0;
  const orgNominationFee = (orgAwardNominationEnabled && wantsOrgNomination === "Yes") ? (Number(orgAwardNominationFee) || 0) : 0;
  const totalNominationFee = individualNominationFee + teamNominationFee + orgNominationFee;

  const gstPct = Number(eventData?.gst_percentage) || 18;
  const gstAmount = Math.round((totalNominationFee * gstPct) / 100);
  const totalAmount = totalNominationFee + gstAmount;

  const totalSteps = totalNominationFee > 0 ? 5 : (isAwardStepEnabled ? 4 : 3);

  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: "",
    lastName: "",
    workEmail: "",
    contactNumber: "",
    // Step 2: Organization
    designation: "",
    companyName: "",
    industry: "Technology & IT",
    linkedinUrl: "",
    // Step 3: Location & Statement
    city: "",
    country: "India",
    category: "Complimentary VIP Delegate",
    participationPreference: "In-Person Delegate",
    interestTracks: ["Leadership & Enterprise Strategy", "HR Tech & AI Transformation"],
    reasonForAttending: "",
  });

  useEffect(() => {
    let isMounted = true;
    const activeSlug = slug || searchParams.get("event") || "hr-recall-2k26";
    const cleanActiveSlug = activeSlug.replace(/-\d+$/, "");

    const applyAwardSettings = (data: any) => {
      if (!data) return;

      // 1. Individual Award Nomination (free registration priority)
      if (typeof data.free_award_nomination_enabled !== "undefined") {
        setAwardNominationEnabled(
          data.free_award_nomination_enabled === 1 ||
          data.free_award_nomination_enabled === true ||
          data.free_award_nomination_enabled === "1" ||
          data.free_award_nomination_enabled === "true"
        );
      } else if (typeof data.award_nomination_enabled !== "undefined") {
        setAwardNominationEnabled(
          data.award_nomination_enabled === 1 ||
          data.award_nomination_enabled === true ||
          data.award_nomination_enabled === "1" ||
          data.award_nomination_enabled === "true"
        );
      }

      if (typeof data.free_award_nomination_fee !== "undefined" && data.free_award_nomination_fee !== null) {
        setAwardNominationFee(Number(data.free_award_nomination_fee) || 0);
      } else if (typeof data.award_nomination_fee !== "undefined" && data.award_nomination_fee !== null) {
        setAwardNominationFee(Number(data.award_nomination_fee) || 0);
      }

      if (typeof data.award_categories !== "undefined") {
        let cats: string[] = [];
        if (typeof data.award_categories === "string") {
          try { cats = JSON.parse(data.award_categories); } catch (_) {}
        } else if (Array.isArray(data.award_categories)) {
          cats = data.award_categories;
        }
        setAwardCategoriesList(Array.isArray(cats) && cats.length > 0 ? cats : HR_RECALL_DEFAULT_CATEGORIES);
      }

      // 2. Team Award Nomination (free registration priority)
      if (typeof data.free_team_award_nomination_enabled !== "undefined") {
        setTeamAwardNominationEnabled(
          data.free_team_award_nomination_enabled === 1 ||
          data.free_team_award_nomination_enabled === true ||
          data.free_team_award_nomination_enabled === "1" ||
          data.free_team_award_nomination_enabled === "true"
        );
      } else if (typeof data.team_award_nomination_enabled !== "undefined") {
        setTeamAwardNominationEnabled(
          data.team_award_nomination_enabled === 1 ||
          data.team_award_nomination_enabled === true ||
          data.team_award_nomination_enabled === "1" ||
          data.team_award_nomination_enabled === "true"
        );
      }

      if (typeof data.free_team_award_nomination_fee !== "undefined" && data.free_team_award_nomination_fee !== null) {
        setTeamAwardNominationFee(Number(data.free_team_award_nomination_fee) || 0);
      } else if (typeof data.team_award_nomination_fee !== "undefined" && data.team_award_nomination_fee !== null) {
        setTeamAwardNominationFee(Number(data.team_award_nomination_fee) || 0);
      }

      if (typeof data.team_award_categories !== "undefined" || typeof data.award_team_categories !== "undefined") {
        const rawTeam = data.team_award_categories || data.award_team_categories;
        let teamCats: string[] = [];
        if (typeof rawTeam === "string") {
          try { teamCats = JSON.parse(rawTeam); } catch (_) {}
        } else if (Array.isArray(rawTeam)) {
          teamCats = rawTeam;
        }
        setTeamAwardCategoriesList(Array.isArray(teamCats) && teamCats.length > 0 ? teamCats : HR_RECALL_DEFAULT_TEAM_CATEGORIES);
      }

      // 3. Organization Award Nomination (free registration priority)
      if (typeof data.free_org_award_nomination_enabled !== "undefined") {
        setOrgAwardNominationEnabled(
          data.free_org_award_nomination_enabled === 1 ||
          data.free_org_award_nomination_enabled === true ||
          data.free_org_award_nomination_enabled === "1" ||
          data.free_org_award_nomination_enabled === "true"
        );
      } else if (typeof data.org_award_nomination_enabled !== "undefined") {
        setOrgAwardNominationEnabled(
          data.org_award_nomination_enabled === 1 ||
          data.org_award_nomination_enabled === true ||
          data.org_award_nomination_enabled === "1" ||
          data.org_award_nomination_enabled === "true"
        );
      }

      if (typeof data.free_org_award_nomination_fee !== "undefined" && data.free_org_award_nomination_fee !== null) {
        setOrgAwardNominationFee(Number(data.free_org_award_nomination_fee) || 0);
      } else if (typeof data.org_award_nomination_fee !== "undefined" && data.org_award_nomination_fee !== null) {
        setOrgAwardNominationFee(Number(data.org_award_nomination_fee) || 0);
      }

      if (typeof data.org_award_categories !== "undefined") {
        let orgCats: string[] = [];
        if (typeof data.org_award_categories === "string") {
          try { orgCats = JSON.parse(data.org_award_categories); } catch (_) {}
        } else if (Array.isArray(data.org_award_categories)) {
          orgCats = data.org_award_categories;
        }
        setOrgAwardCategoriesList(Array.isArray(orgCats) && orgCats.length > 0 ? orgCats : HR_RECALL_DEFAULT_ORG_CATEGORIES);
      }
      if (typeof data.attending_poster_enabled !== "undefined") {
        setAttendingPosterEnabled(
          data.attending_poster_enabled === 1 ||
          data.attending_poster_enabled === true ||
          data.attending_poster_enabled === "1" ||
          data.attending_poster_enabled === "true"
        );
      }
      if (typeof data.attending_poster_whatsapp === "string" && data.attending_poster_whatsapp.trim()) {
        setAttendingPosterWhatsapp(data.attending_poster_whatsapp.trim());
      }
    };

    fetch(`/api/events/${activeSlug}?_t=${Date.now()}`, { cache: "no-store" })
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
          setEventData((prev: any) => ({
            ...prev,
            ...ev,
            image: resolvedImg,
          }));
          applyAwardSettings(ev);
        }
      })
      .catch((e) => {
        console.warn("[FreeRegistration] Fast mode fallback active:", e);
      });

    fetch(`/api/event-payments/event/${activeSlug}?_t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.payment) {
          applyAwardSettings(json.payment);
        } else if (cleanActiveSlug !== activeSlug) {
          fetch(`/api/event-payments/event/${cleanActiveSlug}?_t=${Date.now()}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((cleanJson) => {
              if (!isMounted) return;
              if (cleanJson.success && cleanJson.payment) {
                applyAwardSettings(cleanJson.payment);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [slug, searchParams]);

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
      const v = validateCompanyName(value, "Company Name");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "city") {
      const v = validateLocation(value, "City");
      return v.isValid ? "" : v.error;
    } else if (fieldName === "reasonForAttending") {
      const v = validateRequiredText(value, "Reason for Attending", 5, 1000);
      return v.isValid ? "" : v.error;
    } else if (fieldName === "linkedinUrl" && value.trim()) {
      const v = validateUrl(value, "LinkedIn Profile");
      return v.isValid ? "" : v.error;
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touchedFields[name as keyof RegistrationTouchedFields]) {
      const err = getFieldError(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizePhoneInput(e.target.value);
    setFormData((prev) => ({ ...prev, contactNumber: clean }));
    if (touchedFields.contactNumber) {
      const v = validatePhone(clean);
      setFieldErrors((prev) => ({ ...prev, contactNumber: v.isValid ? "" : v.error }));
    }
  };

  const handleFieldBlur = (fieldName: keyof RegistrationTouchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    const val = (formData as Record<string, any>)[fieldName] || "";
    const error = getFieldError(fieldName, val);
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

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

  // Step 1 Validation & Next (Auto-captures Step 1 Lead)
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

    // Auto-save Step 1 draft to database immediately so drop-offs are captured
    try {
      fetch("/api/registrations/free-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: draftRegId || undefined,
          step: 1,
          ...formData,
          contactNumber: phoneVal.cleanDigits || formData.contactNumber,
          eventId: eventData?.id || slug,
          eventSlug: eventData?.slug || slug,
          eventTitle: eventData?.title || "Executive Summit 2026",
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.registrationId) setDraftRegId(d.registrationId);
        })
        .catch(() => {});
    } catch (e) {}

    toast.success("Personal details saved!");
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Validation & Next (Auto-captures Step 2 Lead)
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

    // Auto-save Step 2 draft to database immediately
    try {
      const phoneVal = validatePhone(formData.contactNumber, "Contact / Mobile Number");
      fetch("/api/registrations/free-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: draftRegId || undefined,
          step: 2,
          ...formData,
          contactNumber: phoneVal.cleanDigits || formData.contactNumber,
          eventId: eventData?.id || slug,
          eventSlug: eventData?.slug || slug,
          eventTitle: eventData?.title || "Executive Summit 2026",
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.registrationId) setDraftRegId(d.registrationId);
        })
        .catch(() => {});
    } catch (e) {}

    toast.success("Organization profile saved!");
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 Validation & Next
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: RegistrationFieldErrors = {};

    const cityVal = validateLocation(formData.city, "City");
    if (!cityVal.isValid) errors.city = cityVal.error;

    const reasonVal = validateRequiredText(formData.reasonForAttending, "Reason for Attending", 5, 1000);
    if (!reasonVal.isValid) errors.reasonForAttending = reasonVal.error;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields((prev) => ({
        ...prev,
        city: true,
        reasonForAttending: true,
      }));
      const firstErrMsg = Object.values(errors)[0];
      toast.error(firstErrMsg || "Please fill in all required preference details.");
      return;
    }

    setFieldErrors({});

    // Auto-save Step 3 draft to database immediately
    try {
      const phoneVal = validatePhone(formData.contactNumber, "Contact / Mobile Number");
      fetch("/api/registrations/free-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: draftRegId || undefined,
          step: 3,
          ...formData,
          contactNumber: phoneVal.cleanDigits || formData.contactNumber,
          eventId: eventData?.id || slug,
          eventSlug: eventData?.slug || slug,
          eventTitle: eventData?.title || "Executive Summit 2026",
          awardNomination: wantsAwardNomination || "No",
          awardCategory: wantsAwardNomination === "Yes" ? selectedAwardCategory : "",
          awardNominationFee: wantsAwardNomination === "Yes" ? awardNominationFee : 0,
          teamAwardNomination: wantsTeamNomination || "No",
          teamAwardCategory: wantsTeamNomination === "Yes" ? selectedTeamCategory : "",
          teamAwardFee: wantsTeamNomination === "Yes" ? teamAwardNominationFee : 0,
          orgAwardNomination: wantsOrgNomination || "No",
          orgAwardCategory: wantsOrgNomination === "Yes" ? selectedOrgCategory : "",
          orgAwardFee: wantsOrgNomination === "Yes" ? orgAwardNominationFee : 0,
          attendingPoster: attendingPosterChoice || "",
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.registrationId) setDraftRegId(d.registrationId);
        })
        .catch(() => {});
    } catch (e) {}

    if (isAwardStepEnabled) {
      toast.success("Preferences saved!");
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleFinalSubmit(e);
    }
  };

  // Step 4 Validation & Next / Payment Step Router
  const handleStep4Proceed = async (e: React.FormEvent) => {
    e.preventDefault();

    // If award step is enabled, validate its mandatory fields
    if (isAwardStepEnabled) {
      if (awardNominationEnabled) {
        if (!wantsAwardNomination) {
          setAwardCategoryError("Please choose Yes or No for the Individual Award nomination.");
          toast.error("Please answer the Individual Award nomination question.");
          return;
        }
        if (wantsAwardNomination === "Yes" && !selectedAwardCategory) {
          setAwardCategoryError("Please select an award category for Individual Nomination.");
          toast.error("Please select an Individual Award category.");
          return;
        }
      }

      if (teamAwardNominationEnabled) {
        if (!wantsTeamNomination) {
          setTeamAwardCategoryError("Please choose Yes or No for the Team Award nomination.");
          toast.error("Please answer the Team Award nomination question.");
          return;
        }
        if (wantsTeamNomination === "Yes" && !selectedTeamCategory) {
          setTeamAwardCategoryError("Please select a team award category.");
          toast.error("Please select a Team Award category.");
          return;
        }
      }

      if (orgAwardNominationEnabled) {
        if (!wantsOrgNomination) {
          setOrgAwardCategoryError("Please choose Yes or No for the Organization Award nomination.");
          toast.error("Please answer the Organization Award nomination question.");
          return;
        }
        if (wantsOrgNomination === "Yes" && !selectedOrgCategory) {
          setOrgAwardCategoryError("Please select an organization award category.");
          toast.error("Please select an Organization Award category.");
          return;
        }
      }

      if (attendingPosterEnabled) {
        if (!attendingPosterChoice) {
          setPosterChoiceError("Please select whether you would like an 'I’m Attending' poster.");
          toast.error("Please select an option for the 'I’m Attending' poster.");
          return;
        }
      }
    }

    if (!termsAccepted) {
      toast.error("Please agree to the Event Registration Terms & Conditions to proceed.");
      return;
    }

    // Auto-save Step 4 draft to database immediately
    try {
      const phoneVal = validatePhone(formData.contactNumber, "Contact / Mobile Number");
      const activeRegId = draftRegId || `ETM-REG-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!draftRegId) setDraftRegId(activeRegId);

      await fetch("/api/registrations/free-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: activeRegId,
          step: 4,
          ...formData,
          contactNumber: phoneVal.cleanDigits || formData.contactNumber,
          eventId: eventData?.id || slug,
          eventSlug: eventData?.slug || slug,
          eventTitle: eventData?.title || "Executive Summit 2026",
          awardNomination: wantsAwardNomination || "No",
          awardCategory: wantsAwardNomination === "Yes" ? selectedAwardCategory : "",
          awardNominationFee: wantsAwardNomination === "Yes" ? individualNominationFee : 0,
          teamAwardNomination: wantsTeamNomination || "No",
          teamAwardCategory: wantsTeamNomination === "Yes" ? selectedTeamCategory : "",
          teamAwardFee: wantsTeamNomination === "Yes" ? teamNominationFee : 0,
          orgAwardNomination: wantsOrgNomination || "No",
          orgAwardCategory: wantsOrgNomination === "Yes" ? selectedOrgCategory : "",
          orgAwardFee: wantsOrgNomination === "Yes" ? orgNominationFee : 0,
          attendingPoster: attendingPosterChoice || "",
        }),
      });
    } catch (_) {}

    // If award nomination has a paid fee (> 0), route directly to Step 5 (Award Checkout & Payment)
    if (totalNominationFee > 0) {
      toast.success("Award nominations saved! Review checkout details below.");
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Otherwise, complimentary free application submission
    await handleFinalSubmit(e);
  };

  // Final Submit Application (Called for Zero-Fee Complimentary registrations)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const phoneVal = validatePhone(formData.contactNumber, "Contact / Mobile Number");
      const res = await fetch("/api/registrations/free-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: draftRegId || undefined,
          ...formData,
          contactNumber: phoneVal.cleanDigits || formData.contactNumber,
          eventId: eventData?.id || slug,
          eventSlug: eventData?.slug || slug,
          eventTitle: eventData?.title || "Executive Summit 2026",
          awardNomination: wantsAwardNomination || "No",
          awardCategory: wantsAwardNomination === "Yes" ? selectedAwardCategory : "",
          awardNominationFee: wantsAwardNomination === "Yes" ? individualNominationFee : 0,
          teamAwardNomination: wantsTeamNomination || "No",
          teamAwardCategory: wantsTeamNomination === "Yes" ? selectedTeamCategory : "",
          teamAwardFee: wantsTeamNomination === "Yes" ? teamNominationFee : 0,
          orgAwardNomination: wantsOrgNomination || "No",
          orgAwardCategory: wantsOrgNomination === "Yes" ? selectedOrgCategory : "",
          orgAwardFee: wantsOrgNomination === "Yes" ? orgNominationFee : 0,
          attendingPoster: attendingPosterChoice || "",
        }),
      });

      const data = await res.json();
      if (data.success && data.registrationId) {
        toast.success("Application submitted for Admin Approval!");
        navigate(`/events/${eventData?.slug || slug || "hr-recall-2k26"}/free-registration-pending?regId=${encodeURIComponent(data.registrationId)}`);
      } else {
        toast.error(data.message || "Failed to submit complimentary registration.");
      }
    } catch (err) {
      toast.error("Network error submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Razorpay Payment for Paid Award Nominations in Free flow
  const handleTriggerRazorpayPayment = async () => {
    setIsProcessingPayment(true);
    const activeRegId = draftRegId || `ETM-REG-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!draftRegId) setDraftRegId(activeRegId);

    try {
      // 1. Create Razorpay Order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "INR",
          receipt: `rcpt_${activeRegId}`,
        }),
      });

      const orderData = await res.json();
      const orderId = orderData?.order?.id || `order_demo_${Date.now()}`;
      setRazorpayOrderId(orderId);
      if (orderData?.key) setRazorpayActiveKey(orderData.key);

      const activeKey = (orderData?.key || razorpayActiveKey || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_live_Tll7hRUGZhgorS").trim();

      if (!(window as any).Razorpay) {
        toast.error("Razorpay SDK is loading. Please try again in a few seconds.");
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: activeKey,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Executive Talks Media",
        description: `${eventData?.title || "Executive Summit"} - Award Nomination Fee (Delegate Pass: Free)`,
        image: "https://www.executivetalksmedia.in/assets/executivetalks-logo.jpeg",
        order_id: orderId.startsWith("order_demo_") ? undefined : orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.workEmail,
          contact: formData.contactNumber,
        },
        notes: {
          registration_id: activeRegId,
          event_title: eventData?.title,
          pass_name: "Complimentary VIP Delegate Pass",
          pass_type: "Complimentary Pass (Award Fee Paid)",
          award_nomination: wantsAwardNomination,
          award_category: selectedAwardCategory,
          team_award_nomination: wantsTeamNomination,
          team_award_category: selectedTeamCategory,
          org_award_nomination: wantsOrgNomination,
          org_award_category: selectedOrgCategory,
          attending_poster: attendingPosterChoice,
        },
        theme: {
          color: "#059669",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || "simulated_sig",
                registrationId: activeRegId,
                passName: "Complimentary VIP Delegate Pass",
                passPrice: 0,
                paymentAmount: totalAmount,
                gstAmount: gstAmount,
                awardNomination: wantsAwardNomination || "No",
                awardCategory: wantsAwardNomination === "Yes" ? selectedAwardCategory : "",
                awardNominationFee: wantsAwardNomination === "Yes" ? individualNominationFee : 0,
                teamAwardNomination: wantsTeamNomination || "No",
                teamAwardCategory: wantsTeamNomination === "Yes" ? selectedTeamCategory : "",
                teamAwardFee: wantsTeamNomination === "Yes" ? teamNominationFee : 0,
                orgAwardNomination: wantsOrgNomination || "No",
                orgAwardCategory: wantsOrgNomination === "Yes" ? selectedOrgCategory : "",
                orgAwardFee: wantsOrgNomination === "Yes" ? orgNominationFee : 0,
                attendingPoster: attendingPosterChoice || "",
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success || true) {
              toast.success("🎉 Payment Verified! Your Registration Pass & Tax Invoice have been emailed.");
              navigate(`/events/${eventData?.slug || slug || "hr-recall-2k26"}/registration-success?regId=${encodeURIComponent(activeRegId)}`);
            }
          } catch (err) {
            toast.success("Payment Received & Confirmed!");
            navigate(`/events/${eventData?.slug || slug || "hr-recall-2k26"}/registration-success?regId=${encodeURIComponent(activeRegId)}`);
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

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setIsProcessingPayment(false);
        toast.error(`Payment failed: ${resp.error?.description || "Transaction declined"}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment init error:", err);
      toast.error("Could not initiate payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  const stepsList = [
    { number: 1, title: "Personal Details", subtitle: "Contact Info" },
    { number: 2, title: "Organization", subtitle: "Role & Company" },
    { number: 3, title: "Preferences & Statement", subtitle: "Intent & Summit Tracks" },
    ...(isAwardStepEnabled ? [{ number: 4, title: "Awards & Nomination", subtitle: "Recognition & Poster" }] : []),
    ...(totalNominationFee > 0 ? [{ number: 5, title: "Checkout & Payment", subtitle: "Award Nomination Fee" }] : []),
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
    "Complimentary VIP Delegate",
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
        title={eventData?.title ? `Complimentary Pass Application: ${eventData.title} | Executive Talks Media` : "Complimentary VIP Pass Application | Executive Talks Media"}
        description={eventData?.description || "Apply for complimentary VIP delegate pass to Executive Talks Media Business Intelligence national summits."}
        keywords={`${eventData?.title || "Conferences"}, Complimentary VIP Pass, Free Registration, Executive Talks Media, Executive Talks`}
        url={`https://www.executivetalksmedia.in/events/${slug || "event"}/register-free`}
      />
      {/* ================= HERO HEADER BANNER ================= */}
      <div className="relative bg-slate-950 text-white pt-28 sm:pt-32 pb-10 sm:pb-14 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-slate-950 to-cyan-950/80 z-0" />
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Complimentary VIP Application • Step {currentStep} of {totalSteps}
                </span>
                <span className="text-xs font-bold text-slate-400">Subject to Admin Approval</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
                {eventData?.title || "HR RECALL 2K26 Leadership Conclave"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
                {eventData?.date && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{eventData.date}</span>
                  </div>
                )}
                {(eventData?.venue || eventData?.city) && (
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
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
        
        {/* Step Progress Navigation Bar (3 Steps) - Temporarily hidden as requested */}
        {false && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm mb-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {stepsList.map((step) => {
                const isCompleted = currentStep > step.number;
                const isActive = currentStep === step.number;
                return (
                  <div key={step.number} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                    <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500/30"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                    </div>
                    <div className="hidden sm:block min-w-0">
                      <div className={`text-xs font-black truncate ${isActive ? "text-slate-900" : isCompleted ? "text-emerald-700" : "text-slate-400"}`}>
                        {step.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{step.subtitle}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Event Overview & Free Delegate Perks */}
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
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                      Free Pass Application
                    </span>
                    <span className="text-[9px] font-bold text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{eventData.date}</span>
                  </div>
                )}
                {(eventData?.venue || eventData?.city) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : eventData.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-emerald-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{totalNominationFee > 0 ? "Pass: Free (₹0) • Awards: Paid" : "Free Pass: Admin Approval Required"}</span>
                </div>
              </div>

              {/* Inclusions */}
              <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Delegate Privileges & Inclusions:
                </span>
                <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Complimentary Conclave Access (₹0)</span>
                  </div>
                  {totalNominationFee > 0 && (
                    <div className="flex items-center gap-1.5 font-bold text-amber-700">
                      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Award Nomination (₹{totalNominationFee.toLocaleString("en-IN")})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Executive Delegate Badge & Kit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Digital Verified Pass via Email</span>
                  </div>
                </div>
              </div>

              {/* Compact Support Desk */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1 font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Official Application</span>
                </div>
                <a href="tel:+919100266777" className="font-bold text-emerald-700 hover:underline">
                  Desk: +91 91002 66777
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Step-by-Step Form */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {/* ================= STEP 1: PERSONAL DETAILS ================= */}
              {currentStep === 1 && (
                <motion.div
                  key="free-step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                      <User className="w-4 h-4" />
                      <span>STEP 1 OF {totalSteps}: PERSONAL DETAILS</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Delegate Contact Information
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter your official contact details for delegate credentials verification.
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
                              : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
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
                              : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
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
                              : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
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
                              : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                          }`}
                        />
                        {touchedFields.contactNumber && fieldErrors.contactNumber && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.contactNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                      <Link
                        to={`/events/${eventData?.slug || slug || ""}`}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-extrabold text-xs transition-all text-center cursor-pointer"
                      >
                        Cancel / Back to Event
                      </Link>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Continue to Organization</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= STEP 2: PROFESSIONAL DETAILS ================= */}
              {currentStep === 2 && (
                <motion.div
                  key="free-step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                      <Building2 className="w-4 h-4" />
                      <span>STEP 2 OF {totalSteps}: ORGANIZATION DETAILS</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Organization & Professional Profile
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Provide your role designation, enterprise name, and industry domain.
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
                          placeholder="e.g. Vice President HR"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.designation && fieldErrors.designation
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.designation && !fieldErrors.designation && validateDesignation(formData.designation).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
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
                          placeholder="e.g. Enterprise Solutions Ltd"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.companyName && fieldErrors.companyName
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.companyName && !fieldErrors.companyName && validateCompanyName(formData.companyName).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
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
                          {touchedFields.linkedinUrl && !fieldErrors.linkedinUrl && formData.linkedinUrl && (
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
                              : touchedFields.linkedinUrl && !fieldErrors.linkedinUrl && formData.linkedinUrl
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                          }`}
                        />
                        {touchedFields.linkedinUrl && fieldErrors.linkedinUrl && (
                          <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                            ⚠️ {fieldErrors.linkedinUrl}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Personal</span>
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>Continue to Preferences</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= STEP 3: PREFERENCES & STATEMENT ================= */}
              {currentStep === 3 && (
                <motion.div
                  key="free-step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                      <Briefcase className="w-4 h-4" />
                      <span>STEP 3 OF {totalSteps}: PREFERENCES & STATEMENT</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Preferences & Statement of Intent
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Select your summit tracks, attendance mode, and share your networking goals for Admin approval.
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
                          placeholder="e.g. Hyderabad / Bengaluru"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                            touchedFields.city && fieldErrors.city
                              ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                              : touchedFields.city && !fieldErrors.city && validateLocation(formData.city).isValid
                              ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                              : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
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
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
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
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20"
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

                    {/* Interest Tracks */}
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
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isChecked
                                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
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

                    {/* Reason for Attending */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Executive Motivation / Reason for Attending <span className="text-rose-500">*</span></span>
                        {touchedFields.reasonForAttending && !fieldErrors.reasonForAttending && formData.reasonForAttending.trim().length >= 5 && (
                          <span className="text-[10px] font-extrabold text-emerald-600">✓ Valid</span>
                        )}
                      </label>
                      <textarea
                        name="reasonForAttending"
                        required
                        rows={3}
                        value={formData.reasonForAttending}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur("reasonForAttending")}
                        placeholder="Share why you would like to attend as a complimentary VIP delegate (e.g. strategic networking goals, enterprise leadership initiatives)..."
                        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                          touchedFields.reasonForAttending && fieldErrors.reasonForAttending
                            ? "border-rose-500 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500/10"
                            : touchedFields.reasonForAttending && !fieldErrors.reasonForAttending && formData.reasonForAttending.trim().length >= 5
                            ? "border-emerald-500 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                            : "border-slate-200 bg-slate-50/70 focus:border-emerald-500 focus:ring-emerald-500/10"
                        }`}
                      />
                      {touchedFields.reasonForAttending && fieldErrors.reasonForAttending && (
                        <p className="mt-1 text-[11px] font-bold text-rose-500 animate-in fade-in">
                          ⚠️ {fieldErrors.reasonForAttending}
                        </p>
                      )}
                    </div>

                    {/* Terms & Conditions Section (Only if Step 4 disabled) */}
                    {!isAwardStepEnabled && (
                      <div className="pt-2">
                        <EventTermsAndConditionsBox
                          checked={termsAccepted}
                          onChange={setTermsAccepted}
                          clauses={eventData?.terms_data?.clauses}
                          title={eventData?.terms_data?.title}
                        />
                      </div>
                    )}

                    {/* Step 3 Form Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Organization</span>
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>
                          {isAwardStepEnabled
                            ? "Continue to Awards & Nomination"
                            : submitting
                            ? "Submitting Application..."
                            : "Submit Application for Admin Approval"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= STEP 4: AWARDS & NOMINATION ================= */}
              {currentStep === 4 && isAwardStepEnabled && (
                <motion.div
                  key="free-step4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 font-extrabold text-xs uppercase tracking-wider">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>STEP 4 OF {totalSteps}: AWARDS & NOMINATION</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Awards & Recognition Nomination
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Nominate yourself or your organization for the prestigious {eventData?.title || "Executive Talks"} Leadership Awards.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* SECTION 1: Individual Award Nomination (Tab 4 in Admin) */}
                    {awardNominationEnabled && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="block text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            Would you like to nominate yourself for the {eventData?.title || "HR RECALL 2K26"} Awards?{" "}
                            <span className="text-slate-500 font-normal">
                              {awardNominationFee > 0 ? "(Nomination Fee Applicable)" : "(Complimentary / Free Nomination)"}
                            </span>{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          {awardNominationFee > 0 ? (
                            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                              Fee: ₹{awardNominationFee.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                              ✨ Free / Complimentary
                            </span>
                          )}
                        </div>
                        <select
                          value={wantsAwardNomination}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWantsAwardNomination(val);
                            setAwardCategoryError("");
                            if (val !== "Yes") {
                              setSelectedAwardCategory("");
                            }
                          }}
                          className="w-full sm:w-80 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 shadow-sm cursor-pointer"
                        >
                          <option value="">Choose</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {awardCategoryError && !wantsAwardNomination && (
                          <p className="text-xs font-bold text-rose-500 mt-1">
                            ⚠️ {awardCategoryError}
                          </p>
                        )}

                        {/* If Yes: Individual Category Selection */}
                        {wantsAwardNomination === "Yes" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-slate-200 space-y-3"
                          >
                            <label className="block text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              Which Award Category Would You Like to Nominate Yourself For? <span className="text-slate-500 font-normal">( T&C Apply )</span> <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={selectedAwardCategory}
                              onChange={(e) => {
                                setSelectedAwardCategory(e.target.value);
                                if (e.target.value) setAwardCategoryError("");
                              }}
                              className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-4 shadow-sm cursor-pointer ${
                                awardCategoryError && !selectedAwardCategory
                                  ? "border-rose-500 focus:ring-rose-500/10"
                                  : "border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/10"
                              }`}
                            >
                              <option value="">Choose an award category</option>
                              {awardCategoriesList.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            {awardCategoryError && !selectedAwardCategory && (
                              <p className="text-xs font-bold text-rose-500 mt-1">
                                ⚠️ {awardCategoryError}
                              </p>
                            )}
                            <div className={`rounded-xl p-3 flex items-center justify-between text-xs font-semibold ${
                              awardNominationFee > 0
                                ? "bg-amber-500/10 border border-amber-500/30 text-amber-900"
                                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-900"
                            }`}>
                              <span>Individual Nomination Fee:</span>
                              <span className="font-black">
                                {awardNominationFee > 0 ? `₹${awardNominationFee.toLocaleString("en-IN")}` : "Free / Complimentary (₹0)"}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* SECTION 2: Team Award Nomination (Tab 5 in Admin) */}
                    {teamAwardNominationEnabled && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="block text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            Would you like to nominate your team for the {eventData?.title || "HR RECALL 2K26"} Awards?{" "}
                            <span className="text-slate-500 font-normal">
                              {teamAwardNominationFee > 0 ? "(Nomination Fee Applicable)" : "(Complimentary / Free Nomination)"}
                            </span>{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          {teamAwardNominationFee > 0 ? (
                            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-300 shrink-0">
                              Fee: ₹{teamAwardNominationFee.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                              ✨ Free / Complimentary
                            </span>
                          )}
                        </div>
                        <select
                          value={wantsTeamNomination}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWantsTeamNomination(val);
                            setTeamAwardCategoryError("");
                            if (val !== "Yes") {
                              setSelectedTeamCategory("");
                            }
                          }}
                          className="w-full sm:w-80 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 shadow-sm cursor-pointer"
                        >
                          <option value="">Choose</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {teamAwardCategoryError && !wantsTeamNomination && (
                          <p className="text-xs font-bold text-rose-500 mt-1">
                            ⚠️ {teamAwardCategoryError}
                          </p>
                        )}

                        {/* If Yes: Team Category Selection */}
                        {wantsTeamNomination === "Yes" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-slate-200 space-y-3"
                          >
                            <label className="block text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              Which Award Category Would You Like to Nominate Your Team For? <span className="text-slate-500 font-normal">( T&C Apply )</span> <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={selectedTeamCategory}
                              onChange={(e) => {
                                setSelectedTeamCategory(e.target.value);
                                if (e.target.value) setTeamAwardCategoryError("");
                              }}
                              className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-4 shadow-sm cursor-pointer ${
                                teamAwardCategoryError && !selectedTeamCategory
                                  ? "border-rose-500 focus:ring-rose-500/10"
                                  : "border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/10"
                              }`}
                            >
                              <option value="">Choose a team award category</option>
                              {teamAwardCategoriesList.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            {teamAwardCategoryError && !selectedTeamCategory && (
                              <p className="text-xs font-bold text-rose-500 mt-1">
                                ⚠️ {teamAwardCategoryError}
                              </p>
                            )}
                            <div className={`rounded-xl p-3 flex items-center justify-between text-xs font-semibold ${
                              teamAwardNominationFee > 0
                                ? "bg-blue-500/10 border border-blue-500/30 text-blue-900"
                                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-900"
                            }`}>
                              <span>Team Nomination Fee:</span>
                              <span className="font-black">
                                {teamAwardNominationFee > 0 ? `₹${teamAwardNominationFee.toLocaleString("en-IN")}` : "Free / Complimentary (₹0)"}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* SECTION 3: Organization Award Nomination (Tab 6 in Admin) */}
                    {orgAwardNominationEnabled && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="block text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            Would You Like to Nominate Your Organization?{" "}
                            <span className="text-slate-500 font-normal">
                              {orgAwardNominationFee > 0 ? "(Nomination Fee Applicable)" : "(Complimentary / Free Nomination)"}
                            </span>{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          {orgAwardNominationFee > 0 ? (
                            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-300 shrink-0">
                              Fee: ₹{orgAwardNominationFee.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                              ✨ Free / Complimentary
                            </span>
                          )}
                        </div>
                        <select
                          value={wantsOrgNomination}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWantsOrgNomination(val);
                            setOrgAwardCategoryError("");
                            if (val !== "Yes") {
                              setSelectedOrgCategory("");
                            }
                          }}
                          className="w-full sm:w-80 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 shadow-sm cursor-pointer"
                        >
                          <option value="">Choose</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {orgAwardCategoryError && !wantsOrgNomination && (
                          <p className="text-xs font-bold text-rose-500 mt-1">
                            ⚠️ {orgAwardCategoryError}
                          </p>
                        )}

                        {/* If Yes: Organization Category Selection */}
                        {wantsOrgNomination === "Yes" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-slate-200 space-y-3"
                          >
                            <label className="block text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              Which Award Category Would You Like to Nominate Your Organization For? <span className="text-slate-500 font-normal">( T&C Apply )</span> <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={selectedOrgCategory}
                              onChange={(e) => {
                                setSelectedOrgCategory(e.target.value);
                                if (e.target.value) setOrgAwardCategoryError("");
                              }}
                              className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-4 shadow-sm cursor-pointer ${
                                orgAwardCategoryError && !selectedOrgCategory
                                  ? "border-rose-500 focus:ring-rose-500/10"
                                  : "border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/10"
                              }`}
                            >
                              <option value="">Choose an organization award category</option>
                              {orgAwardCategoriesList.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            {orgAwardCategoryError && !selectedOrgCategory && (
                              <p className="text-xs font-bold text-rose-500 mt-1">
                                ⚠️ {orgAwardCategoryError}
                              </p>
                            )}
                            <div className={`rounded-xl p-3 flex items-center justify-between text-xs font-semibold ${
                              orgAwardNominationFee > 0
                                ? "bg-purple-500/10 border border-purple-500/30 text-purple-900"
                                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-900"
                            }`}>
                              <span>Organization Nomination Fee:</span>
                              <span className="font-black">
                                {orgAwardNominationFee > 0 ? `₹${orgAwardNominationFee.toLocaleString("en-IN")}` : "Free / Complimentary (₹0)"}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* SECTION 4: "I'm Attending" Poster (Tab 7 in Admin) */}
                    {attendingPosterEnabled && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50/70 border border-emerald-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="block text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            Would you like an “I’m Attending {eventData?.title || "HR RECALL 2K26"}” poster featuring your photo and name? <span className="text-rose-500">*</span>
                          </label>
                          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                            Complimentary Feature
                          </span>
                        </div>
                        <select
                          value={attendingPosterChoice}
                          onChange={(e) => {
                            setAttendingPosterChoice(e.target.value);
                            setPosterChoiceError("");
                          }}
                          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-4 shadow-sm cursor-pointer ${
                            posterChoiceError && !attendingPosterChoice
                              ? "border-rose-500 focus:ring-rose-500/10"
                              : "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10"
                          }`}
                        >
                          <option value="">Choose</option>
                          <option value={`If yes, Please send your photo to ${attendingPosterWhatsapp} via WhatsApp.`}>
                            If yes, Please send your photo to {attendingPosterWhatsapp} via WhatsApp.
                          </option>
                          <option value="No, Thank you">No, Thank you</option>
                        </select>
                        {posterChoiceError && !attendingPosterChoice && (
                          <p className="text-xs font-bold text-rose-500 mt-1">
                            ⚠️ {posterChoiceError}
                          </p>
                        )}

                        {attendingPosterChoice.includes("WhatsApp") && (
                          <div className="rounded-xl bg-emerald-100/80 border border-emerald-300 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
                            <div className="space-y-0.5">
                              <span className="font-black block">📱 Send your high-res headshot to Executive Talks:</span>
                              <span className="text-emerald-800">WhatsApp: <strong>{attendingPosterWhatsapp}</strong></span>
                            </div>
                            <a
                              href={`https://wa.me/${attendingPosterWhatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello Executive Talks Team, I am registering for ${eventData?.title || "the summit"}. Here is my photo for the "I'm Attending" poster.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 shrink-0 transition-all"
                            >
                              <span>Open WhatsApp</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Terms & Conditions Section */}
                    <div className="pt-2">
                      <EventTermsAndConditionsBox
                        checked={termsAccepted}
                        onChange={setTermsAccepted}
                        clauses={eventData?.terms_data?.clauses}
                        title={eventData?.terms_data?.title}
                      />
                    </div>

                    {/* Step 4 Form Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(3);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Preferences</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleStep4Proceed}
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>
                          {totalNominationFee > 0
                            ? (submitting ? "Processing..." : `Proceed to Award Checkout (₹${totalAmount.toLocaleString("en-IN")})`)
                            : (submitting ? "Submitting Application..." : "Submit Application for Admin Approval")}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= STEP 5: AWARD NOMINATION CHECKOUT & PAYMENT ================= */}
              {currentStep === 5 && totalNominationFee > 0 && (
                <motion.div
                  key="free-step5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>STEP 5 OF {totalSteps}: AWARD NOMINATION CHECKOUT & PAYMENT</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 mt-1">
                      Review Nomination Details & Secure Checkout
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Confirm your complimentary summit pass and proceed to secure payment for your selected award nomination.
                    </p>
                  </div>

                  {/* PROMINENT NOTE BANNER */}
                  <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/90 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Info className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <h4 className="font-black text-emerald-950 uppercase tracking-wide">
                        Registration Notice: Free Delegate Pass & Paid Award Nomination
                      </h4>
                      <p className="text-emerald-900 leading-relaxed font-semibold">
                        Your <strong>Executive Delegate Pass & Summit Access is 100% Complimentary (FREE)</strong>. The payment below is exclusively for your requested <strong>Award & Recognition Nomination Fee</strong>.
                      </p>
                    </div>
                  </div>

                  {/* DELEGATE PROFILE SUMMARY CARD */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span>Delegate Profile Summary</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block uppercase">Full Name</span>
                        <span className="font-extrabold text-slate-900">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block uppercase">Official Email</span>
                        <span className="font-extrabold text-slate-900 truncate block">{formData.workEmail}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block uppercase">Organization</span>
                        <span className="font-extrabold text-slate-900">{formData.companyName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block uppercase">Designation</span>
                        <span className="font-extrabold text-slate-900">{formData.designation}</span>
                      </div>
                    </div>
                  </div>

                  {/* ITEMIZED FINANCIAL ORDER BREAKDOWN */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4 shadow-sm">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-emerald-600" />
                        <span>Order Summary & Inclusions</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">All prices in INR (₹)</span>
                    </h4>

                    <div className="space-y-3 text-xs">
                      {/* Pass Line */}
                      <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-emerald-600" />
                          <div>
                            <span className="font-black text-slate-900 block">Executive Delegate Pass</span>
                            <span className="text-[11px] text-emerald-700 font-bold">In-Person Conclave Access & Networking Lunch</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          FREE (₹0.00)
                        </span>
                      </div>

                      {/* Individual Award Line */}
                      {wantsAwardNomination === "Yes" && individualNominationFee > 0 && (
                        <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-amber-500" />
                            <div>
                              <span className="font-black text-slate-900 block">Individual Award Nomination</span>
                              <span className="text-[11px] text-amber-800 font-semibold">{selectedAwardCategory}</span>
                            </div>
                          </div>
                          <span className="font-mono font-extrabold text-slate-900">
                            ₹{individualNominationFee.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      {/* Team Award Line */}
                      {wantsTeamNomination === "Yes" && teamNominationFee > 0 && (
                        <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <div>
                              <span className="font-black text-slate-900 block">Team Award Nomination</span>
                              <span className="text-[11px] text-blue-800 font-semibold">{selectedTeamCategory}</span>
                            </div>
                          </div>
                          <span className="font-mono font-extrabold text-slate-900">
                            ₹{teamNominationFee.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      {/* Org Award Line */}
                      {wantsOrgNomination === "Yes" && orgNominationFee > 0 && (
                        <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-purple-600" />
                            <div>
                              <span className="font-black text-slate-900 block">Organization Award Nomination</span>
                              <span className="text-[11px] text-purple-800 font-semibold">{selectedOrgCategory}</span>
                            </div>
                          </div>
                          <span className="font-mono font-extrabold text-slate-900">
                            ₹{orgNominationFee.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      {/* Subtotal */}
                      <div className="flex items-center justify-between pt-2 text-slate-600 font-bold">
                        <span>Nomination Subtotal:</span>
                        <span className="font-mono font-extrabold text-slate-900">₹{totalNominationFee.toLocaleString("en-IN")}</span>
                      </div>

                      {/* GST */}
                      <div className="flex items-center justify-between text-slate-600 font-bold">
                        <span>GST ({gstPct}%):</span>
                        <span className="font-mono font-extrabold text-slate-900">₹{gstAmount.toLocaleString("en-IN")}</span>
                      </div>

                      {/* Final Total */}
                      <div className="flex items-center justify-between pt-3 border-t-2 border-slate-900 text-sm sm:text-base">
                        <span className="font-black text-slate-900 uppercase">Total Payable Amount:</span>
                        <span className="font-black font-mono text-emerald-700 text-lg sm:text-xl">
                          ₹{totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TRUST BADGES */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-semibold flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-semibold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Razorpay Verified</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-semibold flex items-center justify-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Tax Invoice Emailed</span>
                    </div>
                  </div>

                  {/* STEP 5 ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(4);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Awards</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleTriggerRazorpayPayment}
                      disabled={isProcessingPayment}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay ₹{totalAmount.toLocaleString("en-IN")} & Confirm Registration</span>
                        </>
                      )}
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
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Official Conclave Flyer & Speaker Lineup</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                    {eventData?.title} — Full Event Brochure
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Explore key keynote themes, panel discussions, and confirmed industry speakers.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Click to Zoom & View Fullscreen</span>
                  </div>
                </div>
              </div>

              {/* Event Metadata Banner Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex flex-wrap items-center gap-4">
                  {eventData?.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>{eventData.date}</span>
                    </div>
                  )}
                  {(eventData?.venue || eventData?.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>{eventData.venue ? `${eventData.venue}, ${eventData.city || ""}` : eventData.city}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-emerald-700 font-extrabold hover:underline inline-flex items-center gap-1 cursor-pointer text-xs"
                >
                  <span>Ready to Apply? Scroll to Form</span>
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
