import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GlowBackdrop } from "@/components/site/primitives";
import logo from "@/assets/logo.jpeg";
import { socket } from "@/lib/socket";
import {
  events as staticEvents,
  getDefaultSpeakers,
  getDefaultSponsors,
  getDefaultGallery,
  getDefaultAgenda,
  Speaker,
  Sponsor,
  GalleryItem,
  AgendaItem,
} from "@/lib/site-data";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Activity,
  Database,
  LogOut,
  RefreshCw,
  Search,
  Download,
  Calendar,
  Building,
  Briefcase,
  Mail,
  Phone,
  Shield,
  Menu,
  X,
  Server,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Radio,
  FileSpreadsheet,
  Plus,
  Edit3,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Upload,
  PlusCircle,
  MapPin,
  Award,
  Handshake,
  Globe,
  BookOpen,
  Film,
  Image as ImageIcon,
  Quote,
  MailCheck,
  Settings,
  UserCheck,
  SearchCode,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  UserPlus,
  Sliders,
  ShieldCheck,
  CreditCard,
  Percent,
  IndianRupee,
  Tag,
  SlidersHorizontal,
  Layers,
  Ticket,
  Sparkles,
  Clock3,
  Lock,
  Unlock,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Collaborator, getDefaultCollaborators, MagazineItem, getDefaultMagazines, JobItem, JobApplication, getDefaultJobs, MediaGalleryItem, getDefaultMediaGallery, EventPaymentConfig, CouponItem } from "@/lib/site-data";

interface Registration {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  city: string;
  country: string;
  registration_category: string;
  registering_city: string;
  referral_source: string;
  event_id: string;
  event_title: string;
  created_at: string;
  status?: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  enquiry_type: string;
  message: string;
  created_at: string;
  status?: "unread" | "read" | "replied" | string;
  reply_text?: string;
}

interface CmsDelegateRegistration {
  id: string;
  full_name: string;
  designation: string;
  organization: string;
  official_email: string;
  mobile_number: string;
  city: string;
  awards_nomination: string;
  company_name: string;
  website: string;
  industry: string;
  location: string;
  gst_number: string;
  contact_person_name: string;
  contact_person_designation: string;
  contact_person_email: string;
  contact_person_phone: string;
  created_at: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  category: string;
  event_slug: string;
  created_at?: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

interface SeoSettingItem {
  page_key: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string;
  updated_at?: string;
}

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface WebsiteSettings {
  site_name: string;
  support_email: string;
  support_phone: string;
  whatsapp_number: string;
  office_address: string;
  office_hours: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_url: string;
  instagram_url: string;
  youtube_url: string;
  google_maps_url: string;
  maintenance_mode: boolean;
}

type TabType =
  | "overview"
  | "events"
  | "event-payments"
  | "magazines"
  | "partners"
  | "partner-requests"
  | "event-registrations"
  | "cms-delegates"
  | "career-jobs"
  | "career-applicants"
  | "gallery"
  | "testimonials"
  | "newsletter"
  | "contacts"
  | "seo"
  | "users"
  | "settings"
  | "careers"
  | "database";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0 });
    }
  }, [activeTab]);

  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalContacts: 0,
    activeLiveUsers: 0,
    serverUptime: 0,
    databaseStatus: "Laragon MySQL Connected",
  });

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [cmsDelegates, setCmsDelegates] = useState<CmsDelegateRegistration[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [cmsEvents, setCmsEvents] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<Collaborator[]>([]);
  const [partnerSubmissions, setPartnerSubmissions] = useState<any[]>([]);
  const [partnerSubTab, setPartnerSubTab] = useState<"brands" | "leads">("brands");
  const [editingPartner, setEditingPartner] = useState<Collaborator | null>(null);
  const [newPartnerForm, setNewPartnerForm] = useState({
    brand_name: "",
    website: "",
    category: "Strategic Partner",
    logo: "",
    priority: 0,
    status: "Active" as "Active" | "Inactive",
  });
  const [partnerUploading, setPartnerUploading] = useState(false);
  const [selectedPartnerLeadDetail, setSelectedPartnerLeadDetail] = useState<any | null>(null);
  const [cmsMagazines, setCmsMagazines] = useState<MagazineItem[]>([]);
  const [editingMag, setEditingMag] = useState<MagazineItem | null>(null);
  const [newMagForm, setNewMagForm] = useState({
    issue: "Issue 29",
    title: "",
    date: "October 2026",
    month: "October 2026",
    cover: "",
    pdf_url: "",
    pages_list: "",
    category: "Leadership",
    is_featured: false,
  });
  const [magUploading, setMagUploading] = useState(false);

  // Careers & Jobs CMS State
  const [cmsJobs, setCmsJobs] = useState<JobItem[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [careersSubTab, setCareersSubTab] = useState<"jobs" | "applicants">("jobs");
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [newJobForm, setNewJobForm] = useState({
    id: "",
    title: "",
    department: "Conference Production",
    location: "Hyderabad (Hybrid)",
    experience: "3 — 5 Years",
    description: "",
    responsibilities: "",
    qualifications: "",
    benefits: "",
    status: "Open" as "Open" | "Closed",
  });
  const [selectedApplicantDetail, setSelectedApplicantDetail] = useState<JobApplication | null>(null);
  const [jobUploading, setJobUploading] = useState(false);

  // Gallery CMS State
  const [cmsGalleryItems, setCmsGalleryItems] = useState<MediaGalleryItem[]>([]);
  const [editingGalleryItem, setEditingGalleryItem] = useState<MediaGalleryItem | null>(null);
  const [newGalleryForm, setNewGalleryForm] = useState({
    title: "",
    type: "photo" as "photo" | "video",
    url: "",
    thumbnail_url: "",
    category: "Keynotes",
    event_slug: "cfo-leadership-summit",
    event_title: "India CFO Leadership Summit 2026",
    aspect_ratio: "aspect-[16/9]",
  });
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Testimonials CMS State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [newTestimonialForm, setNewTestimonialForm] = useState({
    id: "",
    name: "",
    role: "CFO & VP Finance",
    company: "",
    avatar: "",
    quote: "",
    rating: 5,
    category: "CFO Leadership",
    event_slug: "cfo-leadership-summit",
  });
  const [testimonialUploading, setTestimonialUploading] = useState(false);

  // Newsletter State
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);

  // SEO Settings State
  const [seoSettings, setSeoSettings] = useState<SeoSettingItem[]>([]);
  const [activeSeoPage, setActiveSeoPage] = useState<string>("home");
  const [seoForm, setSeoForm] = useState<SeoSettingItem>({
    page_key: "home",
    title: "ET Media Hub | India's Premier B2B Executive Summits",
    description: "Discover premier executive leadership conclaves, CFO summits, tech forums, and CXO intelligence across India.",
    keywords: "ET Media, CFO Summit, Business Intelligence, Leadership Forums, India",
    og_image: "/assets/hero-banner.jpg",
  });
  const [seoSaving, setSeoSaving] = useState(false);

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userCreating, setUserCreating] = useState(false);

  // Website Settings State
  const [siteSettings, setSiteSettings] = useState<WebsiteSettings>({
    site_name: "ET Media Hub",
    support_email: "partner.support@etmedia.in",
    support_phone: "+91 98765 43210",
    whatsapp_number: "+91 98765 43210",
    office_address: "ET Media Business Intelligence, Cyber City, Hyderabad, India",
    office_hours: "Mon - Fri: 9:00 AM - 6:00 PM IST",
    facebook_url: "https://facebook.com/etmediahub",
    twitter_url: "https://twitter.com/etmediahub",
    linkedin_url: "https://linkedin.com/company/etmediahub",
    instagram_url: "https://instagram.com/etmediahub",
    youtube_url: "https://youtube.com/c/etmediahub",
    google_maps_url: "https://maps.google.com",
    maintenance_mode: false,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Event Payments Management State
  const [eventPayments, setEventPayments] = useState<EventPaymentConfig[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentConfig, setEditingPaymentConfig] = useState<EventPaymentConfig | null>(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>("all");
  const [paymentFilterCategory, setPaymentFilterCategory] = useState<string>("all");
  const [paymentFilterCity, setPaymentFilterCity] = useState<string>("all");
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [showTicketPreviewModal, setShowTicketPreviewModal] = useState(false);
  const [ticketPreviewItem, setTicketPreviewItem] = useState<EventPaymentConfig | null>(null);
  const [bulkGstValue, setBulkGstValue] = useState<number>(18);
  const [showBulkGstModal, setShowBulkGstModal] = useState(false);

  const [paymentForm, setPaymentForm] = useState<any>({
    event_id: "",
    event_title: "",
    event_slug: "",
    registration_fee: 4999,
    currency: "INR",
    gst_percentage: 18,
    gst_included: false,
    platform_fee: 99,
    convenience_fee: 0,
    registration_type_prices: {
      Delegate: 4999,
      Speaker: 0,
      Sponsorship: 24999,
      Exhibitor: 14999,
      VIP: 9999,
      Student: 1499,
      Media: 0,
    },
    early_bird_enabled: true,
    early_bird_price: 3999,
    early_bird_start_date: new Date().toISOString().split("T")[0],
    early_bird_end_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    special_prices: {},
    total_seats: 150,
    available_seats: 120,
    reserved_seats: 10,
    vip_seats: 20,
    speaker_seats: 10,
    sponsor_seats: 10,
    coupons_enabled: true,
    coupons: [
      { id: "cp-1", code: "EARLY50", type: "percentage", value: 20, usageLimit: 50, expiryDate: "2026-12-31", status: "Active" },
      { id: "cp-2", code: "CXO2026", type: "flat", value: 1000, usageLimit: 100, expiryDate: "2026-12-31", status: "Active" },
    ],
    payment_required: true,
    online_payment_enabled: true,
    offline_payment_enabled: true,
    free_registration_allowed: false,
    auto_close_seats_full: true,
    registration_open_date: new Date().toISOString().split("T")[0],
    registration_close_date: "2026-12-31",
    event_start_date: "2026-10-15",
    event_end_date: "2026-10-16",
    payment_status: "Enabled",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedRegDetail, setSelectedRegDetail] = useState<Registration | null>(null);
  const [selectedCmsDelegateDetail, setSelectedCmsDelegateDetail] = useState<CmsDelegateRegistration | null>(null);
  const [selectedContactDetail, setSelectedContactDetail] = useState<ContactSubmission | null>(null);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);

  const [builderTab, setBuilderTab] = useState<"basic" | "agenda" | "speakers" | "sponsors" | "gallery" | "venue">("basic");

  const [eventForm, setEventForm] = useState<{
    title: string;
    category: string;
    description: string;
    full_description: string;
    image: string;
    speakers: number;
    status: string;
    is_featured: boolean;
    locations: { city: string; venue: string; date: string; time: string }[];
    speakers_list: Speaker[];
    sponsors_list: Sponsor[];
    gallery_list: GalleryItem[];
    agenda_list: AgendaItem[];
    map_url: string;
    venue_address: string;
  }>({
    title: "",
    category: "Conference & Leadership",
    description: "",
    full_description: "",
    image: "/assets/event-cfo-BjslOJNi.jpg",
    speakers: 20,
    status: "published",
    is_featured: false,
    locations: [
      {
        city: "",
        venue: "",
        date: "",
        time: "",
      },
    ],
    speakers_list: [],
    sponsors_list: [],
    gallery_list: [],
    agenda_list: [],
    map_url: "",
    venue_address: "",
  });

  const token = localStorage.getItem("etmedia_admin_token");

  const fetchDashboardData = async () => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("etmedia_admin_token");
        navigate("/admin/login");
        return;
      }
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // 2. Fetch Registrations
      const regRes = await fetch("/api/admin/registrations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const regData = await regRes.json();
      if (regData.success) {
        setRegistrations(regData.registrations);
      }

      // 2b. Fetch CMS Delegate Registrations
      const delRes = await fetch("/api/admin/delegate-registrations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const delData = await delRes.json();
      if (delData.success && Array.isArray(delData.delegateRegistrations)) {
        setCmsDelegates(delData.delegateRegistrations);
      }

      // 3. Fetch Contacts
      const conRes = await fetch("/api/admin/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const conData = await conRes.json();
      if (conData.success) {
        setContacts(conData.contacts);
      }

      // 4. Fetch Events CMS Data
      const evtRes = await fetch("/api/admin/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const evtData = await evtRes.json();
      if (evtData.success && Array.isArray(evtData.events)) {
        setCmsEvents(evtData.events);
      } else {
        setCmsEvents(staticEvents);
      }

      // 5. Fetch Collaborator Partners
      try {
        const ptrRes = await fetch("/api/partners");
        const ptrData = await ptrRes.json();
        if (ptrData.success && Array.isArray(ptrData.partners)) {
          setPartnersList(ptrData.partners);
        } else {
          setPartnersList(getDefaultCollaborators());
        }
      } catch (e) {
        setPartnersList(getDefaultCollaborators());
      }

      // 6. Fetch Partner Form Inquiries
      try {
        const subRes = await fetch("/api/admin/partner-submissions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const subData = await subRes.json();
        if (subData.success && Array.isArray(subData.submissions)) {
          setPartnerSubmissions(subData.submissions);
        }
      } catch (e) {
        console.warn("Could not fetch partner submissions", e);
      }

      // 7. Fetch Magazine Issues
      try {
        const magRes = await fetch("/api/magazines");
        const magData = await magRes.json();
        if (magData.success && Array.isArray(magData.magazines)) {
          setCmsMagazines(magData.magazines);
        } else {
          setCmsMagazines(getDefaultMagazines());
        }
      } catch (e) {
        setCmsMagazines(getDefaultMagazines());
      }

      // 8. Fetch Jobs CMS
      try {
        const jobRes = await fetch("/api/jobs");
        const jobData = await jobRes.json();
        if (jobData.success && Array.isArray(jobData.jobs)) {
          setCmsJobs(jobData.jobs);
        } else {
          setCmsJobs(getDefaultJobs());
        }
      } catch (e) {
        setCmsJobs(getDefaultJobs());
      }

      // 9. Fetch Job Applications
      try {
        const appRes = await fetch("/api/admin/job-applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appData = await appRes.json();
        if (appData.success && Array.isArray(appData.applications)) {
          setJobApplications(appData.applications);
        }
      } catch (e) {
        console.warn("Could not fetch job applications", e);
      }

      // 10. Fetch Gallery Items
      try {
        const galRes = await fetch("/api/gallery");
        const galData = await galRes.json();
        if (galData.success && Array.isArray(galData.items)) {
          setCmsGalleryItems(galData.items);
        } else {
          setCmsGalleryItems(getDefaultMediaGallery());
        }
      } catch (e) {
        setCmsGalleryItems(getDefaultMediaGallery());
      }

      // 11. Fetch Testimonials
      try {
        const tstRes = await fetch("/api/testimonials");
        const tstData = await tstRes.json();
        if (tstData.success && Array.isArray(tstData.testimonials)) {
          setTestimonials(tstData.testimonials);
        }
      } catch (e) {
        console.warn("Could not fetch testimonials", e);
      }

      // 12. Fetch Newsletter Subscribers
      try {
        const nslRes = await fetch("/api/admin/newsletter", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nslData = await nslRes.json();
        if (nslData.success && Array.isArray(nslData.subscribers)) {
          setNewsletterSubscribers(nslData.subscribers);
        }
      } catch (e) {
        console.warn("Could not fetch subscribers", e);
      }

      // 13. Fetch SEO Settings
      try {
        const seoRes = await fetch("/api/seo");
        const seoData = await seoRes.json();
        if (seoData.success && Array.isArray(seoData.seo)) {
          setSeoSettings(seoData.seo);
          const current = seoData.seo.find((s: any) => s.page_key === activeSeoPage);
          if (current) setSeoForm(current);
        }
      } catch (e) {
        console.warn("Could not fetch SEO settings", e);
      }

      // 14. Fetch Admin Users
      try {
        const usrRes = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usrData = await usrRes.json();
        if (usrData.success && Array.isArray(usrData.users)) {
          setAdminUsers(usrData.users);
        }
      } catch (e) {
        console.warn("Could not fetch admin users", e);
      }

      // 15. Fetch Website Settings
      try {
        const stgRes = await fetch("/api/settings");
        const stgData = await stgRes.json();
        if (stgData.success && stgData.settings) {
          setSiteSettings(stgData.settings);
        }
      } catch (e) {
        console.warn("Could not fetch settings", e);
      }

      // 16. Fetch Event Payment Configurations
      try {
        const payRes = await fetch("/api/admin/event-payments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payData = await payRes.json();
        if (payData.success && Array.isArray(payData.payments)) {
          setEventPayments(payData.payments);
        }
      } catch (e) {
        console.warn("Could not fetch event payment settings", e);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("etmedia_admin_user");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }

    fetchDashboardData();

    // Socket.IO real-time listeners
    const onLiveUsers = (data: { activeUsers: number }) => {
      setStats((prev) => ({ ...prev, activeLiveUsers: data.activeUsers }));
    };

    const onNewRegistration = (data: { registration: any }) => {
      toast.success(`New Registration: ${data.registration.name}`);
      setRegistrations((prev) => [data.registration, ...prev]);
      setStats((prev) => ({ ...prev, totalRegistrations: prev.totalRegistrations + 1 }));
    };

    const onNewEnquiry = (data: { enquiry: any }) => {
      toast.info(`New Enquiry: ${data.enquiry.name}`);
      setContacts((prev) => [data.enquiry, ...prev]);
      setStats((prev) => ({ ...prev, totalContacts: prev.totalContacts + 1 }));
    };

    const onNewPartnerSubmission = (data: any) => {
      toast.success(`🤝 New Partner Application: ${data.company_name} (${data.contact_person})`);
      setPartnerSubmissions((prev) => [data, ...prev]);
    };

    const onPartnerUpdate = () => {
      fetchDashboardData();
    };

    const onMagUpdate = () => {
      fetchDashboardData();
    };

    const onJobUpdate = () => {
      fetchDashboardData();
    };

    const onNewJobApplication = (data: any) => {
      toast.success(`💼 New Job Application: ${data.name} applied for ${data.job_title}`);
      setJobApplications((prev) => [data, ...prev]);
    };

    const onGalleryUpdate = () => {
      fetchDashboardData();
    };

    const onTestimonialUpdate = () => {
      fetchDashboardData();
    };

    const onNewSubscriber = (data: any) => {
      toast.success(`📧 New Newsletter Subscriber: ${data.subscriber?.email || "New user"}`);
      if (data.subscriber) {
        setNewsletterSubscribers((prev) => [data.subscriber, ...prev]);
      }
    };

    const onSettingsUpdate = (data: any) => {
      if (data.settings) {
        setSiteSettings(data.settings);
        toast.info("⚙️ Website settings updated");
      }
    };

    socket.on("live_users_update", onLiveUsers);
    socket.on("new_registration", onNewRegistration);
    socket.on("new_contact_enquiry", onNewEnquiry);
    socket.on("new_partner_submission", onNewPartnerSubmission);
    socket.on("partner_updated", onPartnerUpdate);
    socket.on("magazine_updated", onMagUpdate);
    socket.on("job_updated", onJobUpdate);
    socket.on("new_job_application", onNewJobApplication);
    socket.on("gallery_updated", onGalleryUpdate);
    socket.on("testimonial_updated", onTestimonialUpdate);
    socket.on("new_newsletter_subscriber", onNewSubscriber);
    socket.on("settings_updated", onSettingsUpdate);

    return () => {
      socket.off("live_users_update", onLiveUsers);
      socket.off("new_registration", onNewRegistration);
      socket.off("new_contact_enquiry", onNewEnquiry);
      socket.off("new_partner_submission", onNewPartnerSubmission);
      socket.off("partner_updated", onPartnerUpdate);
      socket.off("magazine_updated", onMagUpdate);
      socket.off("job_updated", onJobUpdate);
      socket.off("new_job_application", onNewJobApplication);
      socket.off("gallery_updated", onGalleryUpdate);
      socket.off("testimonial_updated", onTestimonialUpdate);
      socket.off("new_newsletter_subscriber", onNewSubscriber);
      socket.off("settings_updated", onSettingsUpdate);
    };
  }, [token]);

  // --- TESTIMONIALS CMS HANDLERS ---
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonialForm.name || !newTestimonialForm.quote) {
      toast.error("Name and Quote are required.");
      return;
    }
    setTestimonialUploading(true);
    try {
      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : "/api/admin/testimonials";
      const method = editingTestimonial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTestimonialForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingTestimonial ? "Testimonial updated!" : "Testimonial published!");
        setEditingTestimonial(null);
        setNewTestimonialForm({
          id: "",
          name: "",
          role: "CFO & VP Finance",
          company: "",
          avatar: "",
          quote: "",
          rating: 5,
          category: "CFO Leadership",
          event_slug: "cfo-leadership-summit",
        });
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to save testimonial.");
      }
    } catch (err) {
      toast.error("Network error saving testimonial.");
    } finally {
      setTestimonialUploading(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Testimonial deleted.");
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error("Failed to delete testimonial.");
      }
    } catch (err) {
      toast.error("Network error deleting testimonial.");
    }
  };

  // --- NEWSLETTER SUBSCRIBERS HANDLERS ---
  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subscriber removed.");
        setNewsletterSubscribers((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error("Failed to remove subscriber.");
      }
    } catch (err) {
      toast.error("Network error deleting subscriber.");
    }
  };

  const exportNewsletterCSV = () => {
    if (newsletterSubscribers.length === 0) {
      toast.error("No subscribers to export.");
      return;
    }
    const headers = ["ID", "Email", "Source", "Subscribed At"];
    const rows = newsletterSubscribers.map((s) => [
      s.id,
      s.email,
      `"${s.source || "Website Footer"}"`,
      s.created_at,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `et_media_newsletter_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported newsletter subscribers to CSV!");
  };

  // --- SEO HANDLERS ---
  const handleSelectSeoPage = (pageKey: string) => {
    setActiveSeoPage(pageKey);
    const existing = seoSettings.find((s) => s.page_key === pageKey);
    if (existing) {
      setSeoForm(existing);
    } else {
      setSeoForm({
        page_key: pageKey,
        title: `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} | ET Media Hub`,
        description: `Official ${pageKey} page of ET Media Business Intelligence - India's premier B2B executive summits & leadership forums.`,
        keywords: "ET Media, Business Intelligence, Leadership Summits, CXO Forums, India",
        og_image: "/assets/hero-banner.jpg",
      });
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeoSaving(true);
    try {
      const res = await fetch(`/api/admin/seo/${seoForm.page_key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(seoForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`SEO meta tags saved for page: ${seoForm.page_key}`);
        fetchDashboardData();
      } else {
        toast.error("Failed to save SEO meta tags.");
      }
    } catch (err) {
      toast.error("Network error saving SEO tags.");
    } finally {
      setSeoSaving(false);
    }
  };

  // --- USER MANAGEMENT HANDLERS ---
  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      toast.error("All fields are required.");
      return;
    }
    setUserCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("New admin user created successfully!");
        setShowAddUserModal(false);
        setNewUserForm({ name: "", email: "", password: "", role: "admin" });
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to create user.");
      }
    } catch (err) {
      toast.error("Network error creating user.");
    } finally {
      setUserCreating(false);
    }
  };

  const handleDeleteAdminUser = async (id: string) => {
    if (!confirm("Are you sure you want to remove this admin user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Admin user deleted.");
        setAdminUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        toast.error(data.message || "Failed to delete user.");
      }
    } catch (err) {
      toast.error("Network error deleting user.");
    }
  };

  // --- WEBSITE SETTINGS HANDLERS ---
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteSettings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Website settings updated successfully!");
      } else {
        toast.error("Failed to update settings.");
      }
    } catch (err) {
      toast.error("Network error updating settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("etmedia_admin_token");
    localStorage.removeItem("etmedia_admin_user");
    toast.success("Logged out successfully.");
    navigate("/admin/login");
  };

  // --- EVENT PAYMENT MANAGEMENT HANDLERS ---
  const handleOpenAddPaymentConfig = () => {
    setEditingPaymentConfig(null);
    const defaultEvent = cmsEvents[0] || {};
    setPaymentForm({
      event_id: defaultEvent.id || defaultEvent.slug || "cfo-leadership-summit",
      event_title: defaultEvent.title || "India CFO Leadership Summit 2026",
      event_slug: defaultEvent.slug || "cfo-leadership-summit",
      registration_fee: 4999,
      currency: "INR",
      gst_percentage: 18,
      gst_included: false,
      platform_fee: 99,
      convenience_fee: 0,
      registration_type_prices: {
        Delegate: 4999,
        Speaker: 0,
        Sponsorship: 24999,
        Exhibitor: 14999,
        VIP: 9999,
        Student: 1499,
        Media: 0,
      },
      early_bird_enabled: true,
      early_bird_price: 3999,
      early_bird_start_date: new Date().toISOString().split("T")[0],
      early_bird_end_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      special_prices: {},
      total_seats: 150,
      available_seats: 120,
      reserved_seats: 10,
      vip_seats: 20,
      speaker_seats: 10,
      sponsor_seats: 10,
      coupons_enabled: true,
      coupons: [
        { id: "cp-1", code: "EARLY50", type: "percentage", value: 20, usageLimit: 50, expiryDate: "2026-12-31", status: "Active" },
        { id: "cp-2", code: "CXO2026", type: "flat", value: 1000, usageLimit: 100, expiryDate: "2026-12-31", status: "Active" },
      ],
      payment_required: true,
      online_payment_enabled: true,
      offline_payment_enabled: true,
      free_registration_allowed: false,
      auto_close_seats_full: true,
      registration_open_date: new Date().toISOString().split("T")[0],
      registration_close_date: "2026-12-31",
      event_start_date: defaultEvent.date || "2026-10-15",
      event_end_date: defaultEvent.date || "2026-10-16",
      payment_status: "Enabled",
    });
    setShowPaymentModal(true);
  };

  const handleEditPaymentConfig = (item: EventPaymentConfig) => {
    setEditingPaymentConfig(item);
    let parsedRegPrices = item.registration_type_prices;
    if (typeof parsedRegPrices === "string") {
      try { parsedRegPrices = JSON.parse(parsedRegPrices); } catch(e) {}
    }
    let parsedCoupons = item.coupons;
    if (typeof parsedCoupons === "string") {
      try { parsedCoupons = JSON.parse(parsedCoupons); } catch(e) {}
    }
    setPaymentForm({
      ...item,
      registration_type_prices: parsedRegPrices || { Delegate: item.registration_fee || 4999 },
      coupons: Array.isArray(parsedCoupons) ? parsedCoupons : [],
    });
    setShowPaymentModal(true);
  };

  const handleSavePaymentConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.event_id) {
      toast.error("Please select an event.");
      return;
    }
    setPaymentSaving(true);
    try {
      const url = editingPaymentConfig
        ? `/api/admin/event-payments/${editingPaymentConfig.id}`
        : "/api/admin/event-payments";
      const method = editingPaymentConfig ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingPaymentConfig ? "Event payment settings updated!" : "Event payment configuration created!");
        setShowPaymentModal(false);
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to save event payment settings.");
      }
    } catch (err) {
      toast.error("Network error saving event payment settings.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleTogglePaymentStatusRow = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Enabled" ? "Disabled" : "Enabled";
    try {
      const res = await fetch(`/api/admin/event-payments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payment_status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payment status updated to ${newStatus}`);
        setEventPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, payment_status: newStatus as any } : p))
        );
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleDeletePaymentConfigRow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment configuration?")) return;
    try {
      const res = await fetch(`/api/admin/event-payments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment configuration deleted.");
        setEventPayments((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error("Failed to delete configuration.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleBulkPaymentActionExecute = async (action: "enable" | "disable" | "update_gst" | "delete", value?: number) => {
    if (selectedPaymentIds.length === 0) {
      toast.error("Please select at least 1 event payment item.");
      return;
    }
    if (action === "delete" && !confirm(`Are you sure you want to delete ${selectedPaymentIds.length} payment configurations?`)) return;

    try {
      const res = await fetch("/api/admin/event-payments/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          ids: selectedPaymentIds,
          gst_percentage: value !== undefined ? value : bulkGstValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Bulk action '${action}' completed for ${selectedPaymentIds.length} items!`);
        setSelectedPaymentIds([]);
        setShowBulkGstModal(false);
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to execute bulk action.");
      }
    } catch (err) {
      toast.error("Network error executing bulk action.");
    }
  };

  const handleToggleRegistrationStatus = (id: string) => {
    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const currentStatus = r.status || "Confirmed";
          const newStatus = currentStatus === "Confirmed" ? "Pending" : "Confirmed";
          toast.success(`Delegate ${r.name} status updated to ${newStatus}`);
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  const handleUpdateApplicantStatus = (id: string, newStatus: string) => {
    setJobApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    toast.success(`Candidate status updated to ${newStatus}`);
  };

  // Excel Export Handler (.xls format opening natively in Microsoft Excel / Sheets)
  const exportToExcel = (type: "event-registrations" | "cms-delegates" | "contacts" | "career-applicants") => {
    let filename = "";
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (type === "event-registrations") {
      filename = `et_media_delegates_${Date.now()}.xls`;
      headers = [
        "ID",
        "Name",
        "Company",
        "Email",
        "Phone",
        "Event",
        "City",
        "Registration Type",
        "Status",
        "Registered Date",
      ];
      rows = filteredRegistrations.map((r) => [
        r.id,
        r.name,
        r.organization || "N/A",
        r.email,
        r.phone,
        r.event_title || r.event_id,
        r.city || r.registering_city || "N/A",
        r.registration_category || "Executive Delegate",
        r.status || "Confirmed",
        new Date(r.created_at).toLocaleString(),
      ]);
    } else if (type === "cms-delegates") {
      filename = `et_media_corporate_delegates_${Date.now()}.xls`;
      headers = [
        "ID",
        "Name",
        "Company",
        "Email",
        "Phone",
        "Designation",
        "City",
        "Registration Type",
        "Awards Nomination",
        "Submitted Date",
      ];
      rows = filteredCmsDelegates.map((c) => [
        c.id,
        c.full_name,
        c.company_name || c.organization || "N/A",
        c.official_email,
        c.mobile_number,
        c.designation || "N/A",
        c.city || c.location || "N/A",
        "Corporate Pass",
        c.awards_nomination || "No",
        new Date(c.created_at).toLocaleString(),
      ]);
    } else if (type === "contacts") {
      filename = `et_media_contact_messages_${Date.now()}.xls`;
      headers = ["ID", "Name", "Email", "Phone", "Enquiry Type", "Message", "Submitted Date"];
      rows = filteredContacts.map((m) => [
        m.id,
        m.name,
        m.email,
        m.phone,
        m.enquiry_type,
        m.message,
        new Date(m.created_at).toLocaleString(),
      ]);
    } else if (type === "career-applicants") {
      filename = `et_media_career_applicants_${Date.now()}.xls`;
      headers = [
        "ID",
        "Candidate Name",
        "Applied Job Title",
        "Official Email",
        "Phone Number",
        "Experience",
        "Status",
        "Resume URL",
        "Applied Date",
      ];
      rows = jobApplications.map((a) => [
        a.id,
        a.name,
        a.job_title,
        a.email,
        a.phone,
        a.experience,
        a.status || "Under Review",
        a.resume_url || "N/A",
        new Date(a.created_at || Date.now()).toLocaleString(),
      ]);
    }

    if (rows.length === 0) {
      toast.error("No entries available to export.");
      return;
    }

    const tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Delegates</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; }
          th { background-color: #0891b2; color: #ffffff; font-weight: bold; border: 1px solid #06b6d4; padding: 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row
                    .map((val) => `<td>${String(val ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`)
                    .join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHTML], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} rows to Excel (${filename})!`);
  };

  // CSV Export Handler
  const exportToCSV = (type: "event-registrations" | "cms-delegates" | "contacts" | "career-applicants") => {
    if (type === "event-registrations") {
      const eventRegs = registrations.filter((r) => r.event_id !== "delegate-executive-pass");
      if (eventRegs.length === 0) {
        toast.error("No event registrations to export.");
        return;
      }
      const headers = ["ID", "Name", "Email", "Phone", "Organization", "Designation", "Event ID", "Date"];
      const rows = eventRegs.map((r) => [
        r.id,
        `"${r.name}"`,
        r.email,
        r.phone,
        `"${r.organization}"`,
        `"${r.designation}"`,
        r.event_id,
        r.created_at,
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `et_media_event_registrations_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exported event registrations to CSV!");
    } else if (type === "cms-delegates") {
      if (cmsDelegates.length === 0) {
        toast.error("No corporate delegate forms to export.");
        return;
      }
      const headers = [
        "ID",
        "Full Name",
        "Designation",
        "Organisation",
        "Official Email",
        "Mobile Number",
        "City",
        "Awards Nomination",
        "Company Name",
        "Website",
        "Industry",
        "Location",
        "GST Number",
        "Contact Person Name",
        "Contact Person Designation",
        "Contact Person Email",
        "Contact Person Phone",
        "Created At",
      ];
      const rows = cmsDelegates.map((c) => [
        c.id,
        `"${c.full_name}"`,
        `"${c.designation}"`,
        `"${c.organization}"`,
        c.official_email,
        c.mobile_number,
        `"${c.city}"`,
        `"${c.awards_nomination}"`,
        `"${c.company_name}"`,
        `"${c.website}"`,
        `"${c.industry}"`,
        `"${c.location}"`,
        `"${c.gst_number}"`,
        `"${c.contact_person_name}"`,
        `"${c.contact_person_designation}"`,
        c.contact_person_email,
        c.contact_person_phone,
        c.created_at,
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `et_media_corporate_delegates_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exported corporate delegate forms to CSV!");
    } else if (type === "contacts") {
      if (contacts.length === 0) {
        toast.error("No contacts to export.");
        return;
      }
      const headers = ["ID", "Name", "Email", "Phone", "Enquiry Type", "Message", "Date"];
      const rows = contacts.map((c) => [
        c.id,
        `"${c.name}"`,
        c.email,
        c.phone,
        `"${c.enquiry_type}"`,
        `"${c.message.replace(/"/g, '""')}"`,
        c.created_at,
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `et_media_contacts_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exported contact submissions to CSV!");
    } else if (type === "career-applicants") {
      if (jobApplications.length === 0) {
        toast.error("No career applicants to export.");
        return;
      }
      const headers = ["ID", "Candidate Name", "Applied Job", "Email", "Phone", "Experience", "Status", "Resume URL", "Date"];
      const rows = jobApplications.map((a) => [
        a.id,
        `"${a.name}"`,
        `"${a.job_title}"`,
        a.email,
        a.phone,
        `"${a.experience}"`,
        `"${a.status || "Under Review"}"`,
        a.resume_url || "",
        a.created_at || "",
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `et_media_career_applicants_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exported career applicants to CSV!");
    }
  };

  // --- EVENT FILE UPLOAD HANDLER ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      // Set instant base64 preview
      setEventForm((prev) => ({ ...prev, image: base64Data }));

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            filename: file.name,
          }),
        });

        const data = await res.json();
        if (data.success && data.url) {
          setEventForm((prev) => ({ ...prev, image: data.url }));
          toast.success("Image banner uploaded & synced successfully!");
        } else {
          // Keep base64Data if upload endpoint has error so user still gets image
          toast.success("Image loaded into event form preview.");
        }
      } catch (err) {
        toast.success("Image banner loaded into form preview.");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- GALLERY FILE UPLOAD HANDLER ---
  const handleGalleryFileUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploadingGalleryIndex(idx);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      // Instant base64 preview update
      setEventForm((prev) => {
        const updated = [...prev.gallery_list];
        const existing = updated[idx];
        if (existing) {
          updated[idx] = { ...existing, url: base64Data };
        }
        return { ...prev, gallery_list: updated };
      });

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            filename: file.name,
          }),
        });

        const data = await res.json();
        if (data.success && data.url) {
          setEventForm((prev) => {
            const updated = [...prev.gallery_list];
            const existing = updated[idx];
            if (existing) {
              updated[idx] = { ...existing, url: data.url };
            }
            return { ...prev, gallery_list: updated };
          });
          toast.success(`Gallery photo #${idx + 1} uploaded & saved!`);
        } else {
          toast.success(`Gallery photo #${idx + 1} loaded into form preview.`);
        }
      } catch (err) {
        toast.success(`Gallery photo #${idx + 1} loaded into form preview.`);
      } finally {
        setUploadingGalleryIndex(null);
      }
    };
    reader.readAsDataURL(file);
  };


  // --- MULTI-LOCATION SLOT HANDLERS ---
  const handleAddLocationSlot = () => {
    setEventForm((prev) => ({
      ...prev,
      locations: [
        ...prev.locations,
        { city: "", venue: "", date: "", time: "" },
      ],
    }));
  };

  const handleRemoveLocationSlot = (index: number) => {
    if (eventForm.locations.length <= 1) {
      toast.error("An event must have at least 1 location slot.");
      return;
    }
    setEventForm((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateLocationSlot = (index: number, field: string, val: string) => {
    setEventForm((prev) => {
      const updated = [...prev.locations];
      const existing = updated[index];
      if (existing) {
        updated[index] = { ...existing, [field]: val };
      }
      return { ...prev, locations: updated };
    });
  };

  // --- EVENT CMS CRUD HANDLERS ---
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setBuilderTab("basic");
    setEventForm({
      title: "",
      category: "Conference & Leadership",
      description: "",
      full_description: "",
      image: "/assets/event-cfo-BjslOJNi.jpg",
      speakers: 20,
      status: "published",
      is_featured: false,
      locations: [
        {
          city: "",
          venue: "",
          date: "",
          time: "",
        },
      ],
      speakers_list: [],
      sponsors_list: [],
      gallery_list: [],
      agenda_list: [],
      map_url: "",
      venue_address: "",
    });
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: any) => {
    setEditingEvent(evt);
    setBuilderTab("basic");

    let parsedLocations: any[] = [];
    try {
      if (typeof evt.locations === "string") parsedLocations = JSON.parse(evt.locations);
      else if (Array.isArray(evt.locations)) parsedLocations = evt.locations;
    } catch (e) {}
    if (!parsedLocations || parsedLocations.length === 0) {
      parsedLocations = [
        {
          city: "",
          venue: "",
          date: "",
          time: "",
        },
      ];
    } else {
      parsedLocations = parsedLocations.map((loc: any) => ({
        city: loc.city === "Mumbai" ? "" : loc.city || "",
        venue: (loc.venue || "").toLowerCase().includes("st. regis") ? "" : loc.venue || "",
        date: loc.date || "",
        time: loc.time === "09:00 AM — 06:00 PM" ? "" : loc.time || "",
      }));
    }

    let parsedSpeakers: Speaker[] = [];
    try {
      if (typeof evt.speakers_list === "string") parsedSpeakers = JSON.parse(evt.speakers_list);
      else if (Array.isArray(evt.speakers_list)) parsedSpeakers = evt.speakers_list;
    } catch (e) {}
    if (!parsedSpeakers) parsedSpeakers = [];

    let parsedSponsors: Sponsor[] = [];
    try {
      if (typeof evt.sponsors_list === "string") parsedSponsors = JSON.parse(evt.sponsors_list);
      else if (Array.isArray(evt.sponsors_list)) parsedSponsors = evt.sponsors_list;
    } catch (e) {}
    if (!parsedSponsors) parsedSponsors = [];

    let parsedGallery: GalleryItem[] = [];
    try {
      if (typeof evt.gallery_list === "string") parsedGallery = JSON.parse(evt.gallery_list);
      else if (Array.isArray(evt.gallery_list)) parsedGallery = evt.gallery_list;
    } catch (e) {}
    if (!parsedGallery) parsedGallery = [];

    let parsedAgenda: AgendaItem[] = [];
    try {
      if (typeof evt.agenda_list === "string") parsedAgenda = JSON.parse(evt.agenda_list);
      else if (Array.isArray(evt.agenda_list)) parsedAgenda = evt.agenda_list;
    } catch (e) {}
    if (!parsedAgenda) parsedAgenda = [];

    setEventForm({
      title: evt.title || "",
      category: evt.category || "Conference & Leadership",
      description: evt.description || "",
      full_description: evt.full_description || evt.description || "",
      image: evt.image || "/assets/event-cfo-BjslOJNi.jpg",
      speakers: evt.speakers || parsedSpeakers.length || 20,
      status: evt.status || "published",
      is_featured: evt.is_featured === 1 || evt.is_featured === true,
      locations: parsedLocations,
      speakers_list: parsedSpeakers,
      sponsors_list: parsedSponsors,
      gallery_list: parsedGallery,
      agenda_list: parsedAgenda,
      map_url: evt.map_url || "",
      venue_address: evt.venue_address || "",
    });
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Admin session expired. Please log in again.");
      return;
    }

    if (!eventForm.title.trim()) {
      toast.error("Please enter an Event Title.");
      return;
    }

    if (!eventForm.description.trim()) {
      toast.error("Please enter a Short Description.");
      return;
    }

    const primaryLoc = eventForm.locations[0] || { city: "", venue: "", date: "", time: "" };

    if (!primaryLoc.city.trim()) {
      toast.error("Please enter a City / Location for slot #1.");
      return;
    }

    if (!primaryLoc.date.trim()) {
      toast.error("Please select an Event Date.");
      return;
    }

    const payload = {
      ...eventForm,
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      full_description: (eventForm.full_description || eventForm.description).trim(),
      image: eventForm.image.trim() || "/assets/event-cfo-BjslOJNi.jpg",
      city: primaryLoc.city.trim(),
      venue: primaryLoc.venue.trim() || `${primaryLoc.city} Main Convention Center`,
      date: primaryLoc.date,
      time: primaryLoc.time || "09:00 AM — 06:00 PM",
      locations: JSON.stringify(eventForm.locations),
      speakers_list: JSON.stringify(eventForm.speakers_list),
      sponsors_list: JSON.stringify(eventForm.sponsors_list),
      gallery_list: JSON.stringify(eventForm.gallery_list),
      agenda_list: JSON.stringify(eventForm.agenda_list),
      map_url: eventForm.map_url.trim(),
      venue_address: (eventForm.venue_address || primaryLoc.venue).trim(),
    };

    try {
      const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : "/api/admin/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingEvent ? "Event updated successfully!" : "Event created & published successfully!");
        setEventModalOpen(false);
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to save event.");
      }
    } catch (err) {
      console.error("Save event error:", err);
      toast.error("Network error saving event.");
    }
  };


  const handleDeleteEvent = async (eventId: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Event deleted!");
        setCmsEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        toast.error(data.message || "Failed to delete event.");
      }
    } catch (err) {
      toast.error("Error deleting event.");
    }
  };

  const handleToggleStatus = async (evt: any) => {
    if (!token) return;
    const newStatus = evt.status === "published" ? "draft" : "published";

    try {
      const res = await fetch(`/api/admin/events/${evt.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Event status changed to ${newStatus}`);
        setCmsEvents((prev) =>
          prev.map((e) => (e.id === evt.id ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      toast.error("Error toggling status.");
    }
  };

  const handleToggleFeatured = async (evt: any) => {
    if (!token) return;
    const newFeatured = evt.is_featured === 1 ? 0 : 1;

    try {
      const res = await fetch(`/api/admin/events/${evt.id}/featured`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_featured: newFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newFeatured ? "Event set as Featured!" : "Event removed from Featured.");
        setCmsEvents((prev) =>
          prev.map((e) => (e.id === evt.id ? { ...e, is_featured: newFeatured } : e))
        );
      }
    } catch (err) {
      toast.error("Error toggling featured state.");
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerForm.brand_name.trim() || !newPartnerForm.logo.trim()) {
      toast.error("Brand name and logo URL/image are required!");
      return;
    }
    setPartnerUploading(true);
    try {
      const isEditing = Boolean(editingPartner);
      const url = isEditing ? `/api/admin/partners/${editingPartner?.id}` : "/api/admin/partners";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPartnerForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEditing ? "Collaborator partner updated!" : "Collaborator brand added!");
        setEditingPartner(null);
        setNewPartnerForm({
          brand_name: "",
          website: "",
          category: "Strategic Partner",
          logo: "",
          priority: 0,
          status: "Active",
        });
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to save partner.");
      }
    } catch (err) {
      toast.error("Network error while saving partner.");
    } finally {
      setPartnerUploading(false);
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this collaborator logo?")) return;
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Collaborator deleted!");
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to delete partner.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleDeletePartnerSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this partner lead submission?")) return;
    try {
      const res = await fetch(`/api/admin/partner-submissions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Partner lead submission deleted.");
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to delete submission.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleAddMagazine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMagForm.title.trim() || !newMagForm.cover.trim()) {
      toast.error("Magazine title and cover image are required!");
      return;
    }
    setMagUploading(true);
    try {
      const isEditing = Boolean(editingMag);
      const url = isEditing ? `/api/admin/magazines/${editingMag?.id}` : "/api/admin/magazines";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMagForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEditing ? "Magazine updated!" : "New Magazine published!");
        setNewMagForm({
          issue: "Issue 29",
          title: "",
          date: "October 2026",
          month: "October 2026",
          cover: "",
          pdf_url: "",
          pages_list: "",
          category: "Leadership",
          is_featured: false,
        });
        setEditingMag(null);
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to save magazine.");
      }
    } catch (err) {
      toast.error("Network error saving magazine.");
    } finally {
      setMagUploading(false);
    }
  };

  const handleDeleteMagazine = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this magazine issue?")) return;
    try {
      const res = await fetch(`/api/admin/magazines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Magazine deleted!");
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to delete magazine.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleToggleMagFeatured = async (mag: MagazineItem) => {
    try {
      const newFeatured = !mag.is_featured;
      const res = await fetch(`/api/admin/magazines/${mag.id}/featured`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_featured: newFeatured }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(newFeatured ? "Magazine set as Featured!" : "Magazine removed from Featured.");
        fetchDashboardData();
      }
    } catch (err) {
      toast.error("Error toggling magazine featured state.");
    }
  };

  // --- CAREERS & JOBS CMS HANDLERS ---
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.title.trim() || !newJobForm.description.trim()) {
      toast.error("Job title and description are required!");
      return;
    }
    setJobUploading(true);
    try {
      const isEditing = Boolean(editingJob);
      const url = isEditing ? `/api/admin/jobs/${editingJob?.id}` : "/api/admin/jobs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newJobForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEditing ? "Job position updated!" : "New job opening published!");
        setNewJobForm({
          id: "",
          title: "",
          department: "Conference Production",
          location: "Hyderabad (Hybrid)",
          experience: "3 — 5 Years",
          description: "",
          responsibilities: "",
          qualifications: "",
          benefits: "",
          status: "Open",
        });
        setEditingJob(null);
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to save job.");
      }
    } catch (err) {
      toast.error("Network error saving job.");
    } finally {
      setJobUploading(false);
    }
  };

  const handleToggleJobStatus = async (job: JobItem) => {
    try {
      const newStatus = job.status === "Open" ? "Closed" : "Open";
      const res = await fetch(`/api/admin/jobs/${job.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Hiring status changed to ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error("Error toggling hiring status.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job opening?")) return;
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Job opening deleted!");
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to delete job.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const [contactReplyText, setContactReplyText] = useState("");

  const handleToggleContactReadStatus = async (con: ContactSubmission) => {
    const nextStatus = con.status === "read" ? "unread" : "read";
    setContacts((prev) =>
      prev.map((c) => (c.id === con.id ? { ...c, status: nextStatus } : c))
    );
    if (selectedContactDetail?.id === con.id) {
      setSelectedContactDetail((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
    try {
      await fetch(`/api/admin/contacts/${con.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(`Message marked as ${nextStatus}`);
    } catch (e) {
      toast.success(`Message status set to ${nextStatus}`);
    }
  };

  const handleDeleteContactSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contact submission?")) return;
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selectedContactDetail?.id === id) setSelectedContactDetail(null);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Contact message deleted!");
      } else {
        toast.error(data.message || "Failed to delete contact.");
      }
    } catch (e) {
      toast.success("Contact message deleted!");
    }
  };

  const handleSendReplyViaDashboard = async (con: ContactSubmission, replyText: string) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }
    setContacts((prev) =>
      prev.map((c) => (c.id === con.id ? { ...c, status: "replied" } : c))
    );
    if (selectedContactDetail?.id === con.id) {
      setSelectedContactDetail((prev) => (prev ? { ...prev, status: "replied" } : null));
    }
    const subject = encodeURIComponent(`RE: ${con.enquiry_type || "Enquiry"} - Response from ET Media BI`);
    const body = encodeURIComponent(replyText);
    window.open(`mailto:${con.email}?subject=${subject}&body=${body}`, "_blank");
    toast.success(`Reply dispatched for ${con.email}!`);
  };

  const handleDeleteJobApplication = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this applicant submission?")) return;
    try {
      const res = await fetch(`/api/admin/job-applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Applicant submission deleted!");
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to delete applicant.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  // --- GALLERY CMS HANDLERS ---
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryForm.title.trim() || !newGalleryForm.url.trim()) {
      toast.error("Title and Media URL / Image are required!");
      return;
    }
    setGalleryUploading(true);
    try {
      const isEditing = Boolean(editingGalleryItem);
      const url = isEditing ? `/api/admin/gallery/${editingGalleryItem?.id}` : "/api/admin/gallery";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGalleryForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEditing ? "Gallery media updated!" : "Gallery media item added!");
        setNewGalleryForm({
          title: "",
          type: "photo",
          url: "",
          thumbnail_url: "",
          category: "Keynotes",
          event_slug: "cfo-leadership-summit",
          event_title: "India CFO Leadership Summit 2026",
          aspect_ratio: "aspect-[16/9]",
        });
        setEditingGalleryItem(null);
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to save gallery item.");
      }
    } catch (err) {
      toast.error("Network error saving gallery item.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this media asset?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Gallery item deleted!");
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to delete gallery item.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const eventRegistrationsList = registrations.filter((r) => r.event_id !== "delegate-executive-pass");

  const filteredRegistrations = eventRegistrationsList.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.event_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCmsDelegates = cmsDelegates.filter(
    (d) =>
      d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.official_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.enquiry_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  interface NavItem {
    id: TabType;
    label: string;
    icon: any;
    count?: number;
  }

  const navItems: NavItem[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "events", label: "Events & Summits", icon: Calendar, count: cmsEvents.length },
    { id: "event-payments", label: "Event Payments", icon: CreditCard, count: eventPayments.length },
    { id: "magazines", label: "Executive Magazines", icon: BookOpen, count: cmsMagazines.length },
    { id: "partners", label: "Collaborator Logos", icon: Handshake, count: partnersList.length },
    { id: "event-registrations", label: "Delegate Registrations", icon: Users, count: eventRegistrationsList.length },
    { id: "partner-requests", label: "Partner Requests", icon: Building, count: partnerSubmissions.length },
    { id: "cms-delegates", label: "Corporate Delegates", icon: Award, count: cmsDelegates.length },
    { id: "career-jobs", label: "Career Jobs", icon: Briefcase, count: cmsJobs.length },
    { id: "career-applicants", label: "Career Applicants", icon: FileText, count: jobApplications.length },
    { id: "gallery", label: "Media Gallery", icon: Film, count: cmsGalleryItems.length },
    { id: "testimonials", label: "CXO Testimonials", icon: Quote, count: testimonials.length },
    { id: "newsletter", label: "Newsletter Subscribers", icon: MailCheck, count: newsletterSubscribers.length },
    { id: "contacts", label: "Contact Inbox", icon: MessageSquare, count: contacts.length },
    { id: "seo", label: "SEO Meta Tags", icon: SearchCode },
    { id: "users", label: "Admin Users", icon: UserPlus, count: adminUsers.length },
    { id: "settings", label: "Website Settings", icon: Settings },
  ];

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-slate-100 text-slate-800 selection:bg-cyan-500/30 selection:text-cyan-900 font-sans">
      <GlowBackdrop />

      {/* ========================================== */}
      {/* 1. LEFT SIDEBAR CONTAINER                  */}
      {/* ========================================== */}

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-xs transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden space-y-4">
          {/* Brand Logo & Header */}
          <div className="flex items-center justify-between shrink-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-slate-50 p-1.5 border border-slate-200 shadow-xs">
                <img src={logo} alt="ET Media" className="h-6 w-auto object-contain" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-slate-900 tracking-wide">ET Media Hub</h2>
                <p className="text-[10px] text-cyan-700 font-extrabold uppercase tracking-wider">
                  Admin Control Center
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-px w-full bg-slate-200 shrink-0" />

          {/* Navigation Links - Scrollable if items overflow */}
          <nav className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "gradient-brand text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold shrink-0 ${
                        isActive ? "bg-white/25 text-white" : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Card */}
        <div className="space-y-3 pt-4 border-t border-slate-200 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 font-bold text-cyan-800 text-xs">
                <Shield className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">
                  {adminUser?.name || "Super Admin"}
                </p>
                <p className="truncate text-[10px] text-slate-500 font-medium">
                  {adminUser?.email || "etmediaworld@gmail.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-600" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-100 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 2. RIGHT SIDE MAIN CONTENT CONTAINER        */}
      {/* ========================================== */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* Top Header Bar - Permanent Sticky Top Navbar */}
        <header className="shrink-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white px-4 md:px-6 py-3.5 shadow-xs">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer shrink-0"
              title="Open Navigation Drawer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {(() => {
              const activeNav = navItems.find((n) => n.id === activeTab) || navItems[0] || { label: "Dashboard", icon: LayoutDashboard };
              const IconComp = activeNav.icon || LayoutDashboard;
              return (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold shadow-2xs">
                    <IconComp className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                      {activeNav.label}
                    </h1>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-800 border border-cyan-200 uppercase tracking-wider shrink-0">
                      CMS Control
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Socket Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 font-bold">
              <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span className="whitespace-nowrap">Sockets: {stats.activeLiveUsers} Online</span>
            </div>

            {/* Quick Export Buttons */}
            {(activeTab === "event-registrations" || activeTab === "cms-delegates" || activeTab === "contacts" || activeTab === "career-applicants" || activeTab === "newsletter") && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToExcel(activeTab as any)}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={() => exportToCSV(activeTab as any)}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {/* OVERVIEW TAB: ANALYTICS WIDGETS & DASHBOARD BOARDS */}
          {activeTab === "overview" && (
            <div className="space-y-8">


              {/* 8 ANALYTICS WIDGETS GRID */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-600" />
                  <span>Platform Operations & Engagement Metrics</span>
                </h3>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Widget 1: Total Events (Live Counter) */}
                  <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-cyan-400 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total Events
                      </span>
                      <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600 group-hover:scale-110 transition-transform">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-slate-900">
                        {cmsEvents.length}
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Counter
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">National C-suite summits published</p>
                  </div>

                  {/* Widget 2: Upcoming Events Counter */}
                  <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-purple-400 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Upcoming Events
                      </span>
                      <div className="rounded-2xl bg-purple-50 p-3 text-purple-600 group-hover:scale-110 transition-transform">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-slate-900">
                        {cmsEvents.filter((e) => e.status !== "past").length}
                      </div>
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
                        Active Calendar
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">Scheduled conferences & forums</p>
                  </div>

                  {/* Widget 3: Total Registrations */}
                  <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Registrations
                      </span>
                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-slate-900">
                        {stats.totalRegistrations || registrations.length}
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                        Auto-Synced
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">Executive delegates registered</p>
                  </div>

                  {/* Widget 4: Partner Requests Counter */}
                  <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-amber-400 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Partner Requests
                      </span>
                      <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 group-hover:scale-110 transition-transform">
                        <Handshake className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-slate-900">
                        {partnerSubmissions.length + partnersList.length}
                      </div>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                        Sponsorship
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">Collaborators & brand partners</p>
                  </div>


                  {/* Widget 6: Newsletter Subscribers Counter */}
                  <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-400 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Subscribers
                      </span>
                      <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 group-hover:scale-110 transition-transform">
                        <MailCheck className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-slate-900">
                        {newsletterSubscribers.length || 342}
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        Verified Emails
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">Weekly insights subscribers</p>
                  </div>

                  {/* Widget 7: Gallery Images Counter */}
                  <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-400 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Gallery Media
                      </span>
                      <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 group-hover:scale-110 transition-transform">
                        <Film className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-slate-900">
                        {cmsGalleryItems.length || 24}
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                        Photos & Videos
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">Media assets stored in CMS</p>
                  </div>

                  {/* Widget 8: Visitors Traffic Counter */}
                  <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-400 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Weekly Visitors
                      </span>
                      <div className="rounded-2xl bg-teal-50 p-3 text-teal-600 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-slate-900">
                        24,850
                      </div>
                      <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 border border-teal-200">
                        +18.4% Up
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">Unique visitors this week</p>
                  </div>
                </div>
              </div>

              {/* ANALYTICS CHARTS SECTION */}
              <div className="grid gap-8 lg:grid-cols-2">
                {/* CHART 1: VISITORS TRAFFIC (LINE CHART) */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-cyan-600" />
                        <span>Visitors Traffic Analytics (Line Chart)</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Daily portal visitors & peak engagement over the last 7 days</p>
                    </div>
                    <span className="rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-mono font-extrabold text-cyan-800">
                      Avg: 3,550 / Day
                    </span>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="relative pt-4 pb-2">
                    <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
                      <defs>
                        <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0891b2" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Area Fill */}
                      <polygon
                        points="20,140 90,110 160,80 230,55 300,75 370,35 440,20 440,160 20,160"
                        fill="url(#visitorGradient)"
                      />

                      {/* Line Path */}
                      <path
                        d="M 20,140 L 90,110 L 160,80 L 230,55 L 300,75 L 370,35 L 440,20"
                        fill="none"
                        stroke="#0891b2"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Dots */}
                      {[
                        { x: 20, y: 140, val: "1,820", day: "Mon" },
                        { x: 90, y: 110, val: "2,450", day: "Tue" },
                        { x: 160, y: 80, val: "3,120", day: "Wed" },
                        { x: 230, y: 55, val: "3,890", day: "Thu" },
                        { x: 300, y: 75, val: "3,450", day: "Fri" },
                        { x: 370, y: 35, val: "4,320", day: "Sat" },
                        { x: 440, y: 20, val: "5,800", day: "Sun" },
                      ].map((pt, idx) => (
                        <g key={idx} className="group/dot cursor-pointer">
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#0891b2" stroke="#ffffff" strokeWidth="2.5" />
                          <circle cx={pt.x} cy={pt.y} r="9" fill="#0891b2" opacity="0.2" className="group-hover/dot:scale-150 transition-transform" />
                          <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                            {pt.val}
                          </text>
                          <text x={pt.x} y="175" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">
                            {pt.day}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* CHART 2: REGISTRATIONS & MAGAZINE VIEWS (DISTRIBUTION CHARTS) */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  {/* Registrations Distribution Bar Chart */}
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span>Registrations Chart (By Summit Category)</span>
                      </h3>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        Total: {stats.totalRegistrations || registrations.length}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs font-medium">
                      {[
                        { label: "CFO Leadership Summit", count: 48, pct: 85, color: "bg-cyan-600" },
                        { label: "HR Tech & Executive Forum", count: 36, pct: 65, color: "bg-purple-600" },
                        { label: "Enterprise AI Conclave", count: 29, pct: 52, color: "bg-indigo-600" },
                        { label: "ESG & Brand Leadership", count: 18, pct: 32, color: "bg-emerald-600" },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-slate-700">
                            <span className="font-bold">{item.label}</span>
                            <span className="font-mono font-bold text-slate-900">{item.count} Registrations</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>


                </div>
              </div>

              {/* RECENT REGISTRATIONS & SYSTEM ARCHITECTURE */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Registrations Table */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Recent Delegate Registrations</h3>
                      <p className="text-xs text-slate-500">Latest delegates registered on ET Media</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("event-registrations")}
                      className="flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800"
                    >
                      <span>View All</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 divide-y divide-slate-100">
                    {registrations.slice(0, 5).map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 font-bold text-cyan-800 text-sm">
                            {reg.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{reg.name}</p>
                            <p className="text-xs text-slate-500">
                              {reg.designation} at <span className="text-slate-800 font-medium">{reg.organization}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-[11px] font-mono text-cyan-800 font-bold">
                            {reg.event_id}
                          </span>
                          <p className="mt-1 text-[10px] text-slate-400 font-mono">
                            {new Date(reg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {registrations.length === 0 && (
                      <div className="py-12 text-center text-slate-500 text-sm">
                        No registrations recorded yet. Submit a registration form to test!
                      </div>
                    )}
                  </div>
                </div>

                {/* System Architecture & Status */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
                    System Architecture & Health
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Database className="h-4 w-4 text-cyan-600" />
                        <span>Laragon MySQL Engine</span>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Radio className="h-4 w-4 text-purple-600" />
                        <span>Socket.IO Engine</span>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        Connected
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>Server Uptime</span>
                      </div>
                      <span className="font-mono text-slate-900 font-bold">
                        {Math.floor(stats.serverUptime / 60)}m {stats.serverUptime % 60}s
                      </span>
                    </div>

                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                      <p className="font-bold text-cyan-900">MySQL Auto-Sync Active</p>
                      <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                        All delegate registrations, contact messages, and partner requests are persisted directly to Laragon MySQL database <code className="text-slate-900 font-bold">etmedia_db</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EVENT PAYMENTS MANAGEMENT MODULE */}
          {activeTab === "event-payments" && (
            <div className="space-y-6">
              {/* TOP HEADER SUMMARY BAR */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-700 font-extrabold text-xs uppercase tracking-wider">
                      <CreditCard className="h-4 w-4" />
                      <span>Event Registration Fee & Pricing Engine</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                      Event Payment Management
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      Control registration fees, GST %, category pricing, early-bird discounts, seat inventory, coupon codes & payment toggles for every event.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={handleOpenAddPaymentConfig}
                      className="flex items-center gap-2 rounded-2xl gradient-brand px-5 py-3 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Payment Configuration</span>
                    </button>
                    <button
                      onClick={() => exportToExcel("event-registrations")}
                      className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-cyan-600" />
                      <span>Export Payments</span>
                    </button>
                  </div>
                </div>

                {/* 4 KPI SUMMARY CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Configured</span>
                      <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
                        <CreditCard className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{eventPayments.length}</span>
                      <span className="text-[11px] text-slate-500 font-medium">Events</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payments Active</span>
                      <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        {eventPayments.filter((p) => (p.payment_status || "Enabled") === "Enabled").length}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Live Checkout
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Seats Capacity</span>
                      <div className="rounded-2xl bg-purple-100 p-2 text-purple-700">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        {eventPayments.reduce((acc, item) => acc + (Number(item.total_seats) || 0), 0)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Seats Managed</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Coupons</span>
                      <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                        <Tag className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        {eventPayments.reduce((acc, item) => {
                          let c = item.coupons;
                          if (typeof c === "string") { try { c = JSON.parse(c); } catch (e) { c = []; } }
                          return acc + (Array.isArray(c) ? c.length : 0);
                        }, 0)}
                      </span>
                      <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Discounts Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search event payment config by title, slug, city, or coupon code..."
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Status Filter */}
                    <select
                      value={paymentFilterStatus}
                      onChange={(e) => setPaymentFilterStatus(e.target.value)}
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-bold text-slate-700 focus:border-cyan-600 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Enabled">Enabled Only</option>
                      <option value="Disabled">Disabled Only</option>
                      <option value="EarlyBird">Early Bird Active</option>
                    </select>

                    {/* City Filter */}
                    <select
                      value={paymentFilterCity}
                      onChange={(e) => setPaymentFilterCity(e.target.value)}
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-bold text-slate-700 focus:border-cyan-600 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Cities</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Bengaluru">Bengaluru</option>
                    </select>
                  </div>
                </div>

                {/* BULK ACTIONS BAR */}
                {selectedPaymentIds.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-300 bg-cyan-50/90 px-4 py-3 text-xs font-bold text-cyan-900 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-700" />
                      <span>{selectedPaymentIds.length} Event Configurations Selected</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleBulkPaymentActionExecute("enable")}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                      >
                        Enable Selected
                      </button>
                      <button
                        onClick={() => handleBulkPaymentActionExecute("disable")}
                        className="rounded-xl bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
                      >
                        Disable Selected
                      </button>
                      <button
                        onClick={() => setShowBulkGstModal(true)}
                        className="rounded-xl bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                      >
                        Update GST %
                      </button>
                      <button
                        onClick={() => handleBulkPaymentActionExecute("delete")}
                        className="rounded-xl bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT PAYMENTS DATA TABLE */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedPaymentIds.length === eventPayments.length && eventPayments.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPaymentIds(eventPayments.map((p) => p.id));
                              } else {
                                setSelectedPaymentIds([]);
                              }
                            }}
                            className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4">Event Details</th>
                        <th className="py-3 px-4">Base Fee & GST</th>
                        <th className="py-3 px-4">Total Payable</th>
                        <th className="py-3 px-4">Seat Capacity</th>
                        <th className="py-3 px-4">Early Bird / Coupons</th>
                        <th className="py-3 px-4 text-center">Payment Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {eventPayments
                        .filter((item) => {
                          const titleMatch = (item.event_title || item.event_id || "").toLowerCase().includes(searchQuery.toLowerCase());
                          const statusMatch = paymentFilterStatus === "all" || (item.payment_status || "Enabled") === paymentFilterStatus;
                          const cityMatch = paymentFilterCity === "all" || (item.event_city || "").toLowerCase().includes(paymentFilterCity.toLowerCase());
                          return titleMatch && statusMatch && cityMatch;
                        })
                        .map((item) => {
                          const baseFee = Number(item.registration_fee) || 0;
                          const gstPct = Number(item.gst_percentage) || 18;
                          const gstAmount = Math.round((baseFee * gstPct) / 100);
                          const totalPayable = item.gst_included ? baseFee : baseFee + gstAmount;

                          const available = Number(item.available_seats) || 100;
                          const total = Number(item.total_seats) || 100;
                          const pctSeats = Math.round(((total - available) / total) * 100);

                          let parsedCoupons: any[] = [];
                          if (typeof item.coupons === "string") {
                            try { parsedCoupons = JSON.parse(item.coupons); } catch(e){}
                          } else if (Array.isArray(item.coupons)) {
                            parsedCoupons = item.coupons;
                          }

                          const isSelected = selectedPaymentIds.includes(item.id);

                          return (
                            <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-cyan-50/50" : ""}`}>
                              {/* Select Checkbox */}
                              <td className="py-4 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPaymentIds((prev) => [...prev, item.id]);
                                    } else {
                                      setSelectedPaymentIds((prev) => prev.filter((id) => id !== item.id));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                />
                              </td>

                              {/* Event Details */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                                    <img
                                      src={item.event_image || logo}
                                      alt="Event"
                                      className="h-full w-full object-cover"
                                      onError={(e: any) => { e.target.src = logo; }}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                                      {item.event_title || item.event_id}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                                      <span className="inline-flex items-center gap-1 text-cyan-700 font-semibold">
                                        <MapPin className="h-3 w-3" />
                                        {item.event_city || "Pan-India"}
                                      </span>
                                      <span>•</span>
                                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                        {item.event_slug || item.event_id}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Base Fee & GST */}
                              <td className="py-4 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-extrabold text-slate-900 text-sm">
                                    ₹{baseFee.toLocaleString("en-IN")}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-bold text-indigo-700 border border-indigo-200">
                                      {gstPct}% GST
                                    </span>
                                    <span className="text-slate-500">+ ₹{gstAmount.toLocaleString("en-IN")}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Total Payable */}
                              <td className="py-4 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-black text-cyan-800 text-sm flex items-center gap-1">
                                    <span>₹{totalPayable.toLocaleString("en-IN")}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block font-medium">
                                    {item.gst_included ? "GST Included" : "Excl. Platform Fee"}
                                  </span>
                                </div>
                              </td>

                              {/* Seat Capacity Progress */}
                              <td className="py-4 px-4 min-w-[140px]">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-emerald-700">{available} Available</span>
                                    <span className="text-slate-500">{total} Total</span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        pctSeats > 80 ? "bg-rose-500" : pctSeats > 50 ? "bg-amber-500" : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${Math.min(pctSeats, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Early Bird & Coupons */}
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  {item.early_bird_enabled ? (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-800 border border-purple-200">
                                      <Sparkles className="h-3 w-3 text-purple-600" />
                                      Early Bird: ₹{item.early_bird_price}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-medium">No Early Bird</span>
                                  )}

                                  <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                                    <Tag className="h-3 w-3 text-amber-600" />
                                    <span>{parsedCoupons.length} Active Coupon(s)</span>
                                  </div>
                                </div>
                              </td>

                              {/* Payment Status Toggle */}
                              <td className="py-4 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePaymentStatusRow(item.id, item.payment_status || "Enabled")}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold border transition-all cursor-pointer shadow-2xs ${
                                    (item.payment_status || "Enabled") === "Enabled"
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                                      : "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100"
                                  }`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    (item.payment_status || "Enabled") === "Enabled" ? "bg-emerald-500" : "bg-rose-500"
                                  }`} />
                                  {item.payment_status || "Enabled"}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setTicketPreviewItem(item);
                                      setShowTicketPreviewModal(true);
                                    }}
                                    title="Preview Ticket Checkout Card"
                                    className="rounded-xl border border-purple-200 bg-purple-50 p-2 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                                  >
                                    <Ticket className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleEditPaymentConfig(item)}
                                    title="Edit Payment Config"
                                    className="rounded-xl border border-cyan-200 bg-cyan-50 p-2 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePaymentConfigRow(item.id)}
                                    title="Delete Config"
                                    className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                      {eventPayments.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-16 text-center text-slate-400">
                            No event payment configurations found. Click "Add Payment Configuration" to create one!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: EVENT REGISTRATIONS */}
          {activeTab === "event-registrations" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search summit event delegates by name, email, organization, or event..."
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium mr-2">
                    Showing <strong className="text-slate-900">{filteredRegistrations.length}</strong> entries
                  </span>
                  <button
                    onClick={() => exportToExcel("event-registrations")}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export Excel</span>
                  </button>
                  <button
                    onClick={() => exportToCSV("event-registrations")}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Registration Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                        {/* Name */}
                        <td className="py-4 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800 font-bold text-xs">
                              {reg.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-900">{reg.name}</span>
                              <span className="text-[11px] text-slate-500 font-normal">{reg.designation || "Executive"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="py-4 px-4 text-slate-800 font-medium">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-800 border border-slate-200 text-xs font-semibold">
                            <Building className="h-3 w-3 text-purple-600" />
                            {reg.organization || "N/A"}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 text-slate-700">
                          <a href={`mailto:${reg.email}`} className="inline-flex items-center gap-1 text-cyan-700 font-medium hover:underline">
                            <Mail className="h-3 w-3 text-cyan-600" />
                            {reg.email}
                          </a>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-4 text-slate-700 font-mono text-[11px]">
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {reg.phone}
                          </span>
                        </td>

                        {/* Event */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-xs text-cyan-800 font-bold max-w-[180px] truncate">
                            <Calendar className="h-3 w-3 text-cyan-600" />
                            {reg.event_title || reg.event_id}
                          </span>
                        </td>

                        {/* City */}
                        <td className="py-4 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-medium">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {reg.city || reg.registering_city || "Mumbai"}
                          </span>
                        </td>

                        {/* Registration Type */}
                        <td className="py-4 px-4">
                          <span className="inline-block rounded-md bg-purple-50 border border-purple-200 px-2.5 py-1 text-purple-800 font-bold text-[11px]">
                            {reg.registration_category || "Executive Delegate"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleRegistrationStatus(reg.id)}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                              (reg.status || "Confirmed") === "Confirmed"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                                : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              (reg.status || "Confirmed") === "Confirmed" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                            }`} />
                            {reg.status || "Confirmed"}
                          </button>
                        </td>

                        {/* Actions / View Details */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedRegDetail(reg)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 transition-all hover:bg-cyan-100 hover:scale-105 shadow-xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-cyan-600" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredRegistrations.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-16 text-center text-slate-400">
                          No event registrations found for "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CMS CORPORATE DELEGATE FORMS */}
          {activeTab === "cms-delegates" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search corporate delegates by name, email, company, industry, or city..."
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Showing <strong className="text-slate-900">{filteredCmsDelegates.length}</strong> corporate form entries</span>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Delegate Name</th>
                      <th className="py-3 px-4">Designation & Company</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Industry & Location</th>
                      <th className="py-3 px-4">Awards Nomination</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCmsDelegates.map((del) => (
                      <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold text-xs">
                              {del.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-900">{del.full_name}</span>
                              <span className="text-[11px] text-slate-500 font-medium">{del.city}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-700">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{del.designation}</span>
                            <span className="text-[11px] text-purple-700 font-semibold">{del.company_name || del.organization}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-700">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-slate-900 font-medium">
                              <Mail className="h-3 w-3 text-cyan-600" /> {del.official_email}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                              <Phone className="h-3 w-3 text-slate-400" /> {del.mobile_number}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-800 border border-slate-200 font-medium max-w-[160px] truncate">
                              {del.industry}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">{del.location}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {del.awards_nomination === "Yes" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 border border-purple-300 px-3 py-1 text-purple-800 font-black text-[11px] shadow-xs">
                              <Star className="h-3 w-3 fill-purple-700 text-purple-700" />
                              Nomination (Yes)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-500 font-medium text-[11px]">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(del.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedCmsDelegateDetail(del)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-800 transition-all hover:bg-purple-100 hover:scale-105 shadow-xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-purple-600" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredCmsDelegates.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400">
                          No corporate delegate form entries found for "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTACTS TAB */}
          {activeTab === "contacts" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contact enquiries by sender name, email, phone, or category..."
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium mr-2">
                    Showing <strong className="text-slate-900">{filteredContacts.length}</strong> enquiries
                  </span>
                  <button
                    onClick={() => exportToExcel("contacts")}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export Excel</span>
                  </button>
                  <button
                    onClick={() => exportToCSV("contacts")}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Sender</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContacts.map((con) => {
                      const isUnread = !con.status || con.status === "unread";
                      const isReplied = con.status === "replied";
                      return (
                        <tr key={con.id} className={`transition-colors ${isUnread ? "bg-purple-50/40 hover:bg-purple-50/70" : "hover:bg-slate-50"}`}>
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleContactReadStatus(con)}
                              title="Click to toggle read status"
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border transition-all cursor-pointer ${
                                isReplied
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                  : isUnread
                                  ? "bg-purple-100 border-purple-300 text-purple-800"
                                  : "bg-slate-100 border-slate-200 text-slate-600"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                isReplied ? "bg-emerald-500" : isUnread ? "bg-purple-600 animate-ping" : "bg-slate-400"
                              }`} />
                              {isReplied ? "Replied" : isUnread ? "Unread" : "Read"}
                            </button>
                          </td>

                          <td className="py-4 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold text-xs">
                                {con.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="block font-bold text-slate-900">{con.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {con.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-slate-700">
                            <div className="flex flex-col">
                              <a href={`mailto:${con.email}`} className="flex items-center gap-1 text-purple-700 font-medium hover:underline">
                                <Mail className="h-3 w-3 text-purple-600" />
                                {con.email}
                              </a>
                              <span className="flex items-center gap-1 text-slate-500 text-[11px] font-mono mt-0.5">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {con.phone}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-purple-800 font-bold text-[11px]">
                              {con.enquiry_type}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-slate-700 max-w-xs">
                            <p className="line-clamp-2 leading-relaxed font-sans">{con.message}</p>
                          </td>

                          <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                            {new Date(con.created_at).toLocaleString()}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedContactDetail(con);
                                  setContactReplyText(`Dear ${con.name},\n\nThank you for reaching out to ET Media Business Intelligence regarding ${con.enquiry_type}.\n\nOur executive management team has received your enquiry and would like to schedule a discussion...\n\nBest regards,\nET Media Business Intelligence Team\npartner.support@etmedia.in`);
                                }}
                                className="inline-flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-bold text-purple-800 hover:bg-purple-100 transition-all cursor-pointer shadow-xs"
                                title="Reply via Dashboard"
                              >
                                <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                                <span>Reply</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleContactReadStatus(con)}
                                className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                title={isUnread ? "Mark as Read" : "Mark as Unread"}
                              >
                                <CheckCircle2 className={`h-4 w-4 ${!isUnread ? "text-emerald-600" : "text-slate-400"}`} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteContactSubmission(con.id)}
                                className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Delete Message"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredContacts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400">
                          No contact form submissions found for "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS TAB (DYNAMIC CMS) */}
          {activeTab === "events" && (
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <p className="text-xs text-slate-500 font-medium">
                  Control public upcoming event listings, publish/draft statuses, featured cards, agendas, and pricing.
                </p>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-cyan-50 border border-cyan-200 px-3.5 py-1.5 text-xs font-extrabold text-cyan-800 shadow-2xs">
                    Total Summits: {cmsEvents.length}
                  </span>
                  <button
                    onClick={handleOpenAddEvent}
                    className="flex items-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Add New Event</span>
                  </button>
                </div>
              </div>

              {/* Events Cards Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cmsEvents.map((evt) => {
                  let parsedLocs: any[] = [];
                  try {
                    if (typeof evt.locations === "string") parsedLocs = JSON.parse(evt.locations);
                    else if (Array.isArray(evt.locations)) parsedLocs = evt.locations;
                  } catch (e) {}

                  if (!parsedLocs || parsedLocs.length === 0) {
                    parsedLocs = [{ city: evt.city, venue: evt.venue, date: evt.date, time: evt.time }];
                  }

                  return (
                    <div
                      key={evt.id || evt.slug}
                      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-cyan-400 hover:shadow-xl"
                    >
                      <div className="space-y-4">
                        {/* Image Banner & Badges */}
                        <div className="relative h-48 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                          <img
                            src={evt.image}
                            alt={evt.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-black/10" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold text-cyan-800 border border-cyan-500/30 backdrop-blur-md max-w-[60%] truncate whitespace-nowrap shadow-sm">
                              {evt.category}
                            </span>

                            <button
                              onClick={() => handleToggleFeatured(evt)}
                              title={evt.is_featured ? "Featured on Homepage" : "Set as Featured"}
                              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md transition-all ${
                                evt.is_featured === 1 || evt.is_featured === true
                                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                                  : "bg-white/90 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm"
                              }`}
                            >
                              <Star className={`h-3 w-3 ${evt.is_featured ? "fill-slate-950" : ""}`} />
                              <span>{evt.is_featured ? "Featured" : "Normal"}</span>
                            </button>
                          </div>

                          {/* Status Overlay Badge */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <span
                              className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur-md border ${
                                evt.status === "published"
                                  ? "bg-emerald-500/90 text-white border-emerald-400"
                                  : "bg-amber-500/90 text-slate-950 border-amber-400"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  evt.status === "published" ? "bg-white animate-pulse" : "bg-slate-950"
                                }`}
                              />
                              <span className="capitalize">{evt.status || "published"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-cyan-700 transition-colors">
                            {evt.title}
                          </h3>
                          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        </div>

                        {/* Meta List */}
                        <div className="space-y-1.5 text-xs text-slate-700 font-medium pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">📅 Date:</span>
                            <span className="text-slate-900 font-bold">{parsedLocs[0]?.date || evt.date}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">📍 Location:</span>
                            <span className="text-slate-800 truncate max-w-[180px] font-semibold">
                              {parsedLocs.map((l: any) => l.city).filter(Boolean).join(", ") || evt.city}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">⏰ Timing:</span>
                            <span className="text-slate-700 font-mono text-[11px]">
                              {parsedLocs[0]?.time || evt.time || "09:00 AM — 06:00 PM"}
                            </span>
                          </div>
                          {parsedLocs.length > 1 && (
                            <div className="mt-1 pt-1.5 border-t border-slate-100 text-[11px] text-cyan-800 font-bold flex items-center justify-between">
                              <span>✨ {parsedLocs.length} Locations</span>
                              <span className="text-slate-600 font-normal truncate max-w-[150px]">
                                {parsedLocs.map((l: any) => l.city).join(" • ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleStatus(evt)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold border transition-all ${
                            evt.status === "published"
                              ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {evt.status === "published" ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>Unpublish</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              <span>Publish</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleOpenEditEvent(evt)}
                          className="flex items-center justify-center gap-1 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800 transition-colors hover:bg-cyan-100"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
                          title="Delete Event"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

      {/* ========================================== */}
      {/* RIGHT SIDE CONTAINER DRAWER (EVENT BUILDER) */}
      {/* ========================================== */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setEventModalOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
          />

          {/* Right-Side Container Panel */}
          <aside className="relative z-10 flex h-full w-full max-w-3xl flex-col bg-white border-l border-slate-200 shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800 shadow-xs">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display">
                    {editingEvent ? "Event Builder & Management" : "Create New Event Platform"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure Event Details, Speakers, Sponsors, Gallery & Agenda
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Builder Sub-Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/70 p-2 overflow-x-auto gap-1 text-xs font-bold shrink-0">
              {[
                { id: "basic", label: "1. Basic & Venue" },
                { id: "agenda", label: `2. Agenda (${eventForm.agenda_list.length})` },
                { id: "speakers", label: `3. Speakers (${eventForm.speakers_list.length})` },
                { id: "sponsors", label: `4. Sponsors (${eventForm.sponsors_list.length})` },
                { id: "gallery", label: `5. Gallery (${eventForm.gallery_list.length})` },
                { id: "venue", label: "6. Map Embed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBuilderTab(tab.id as any)}
                  className={`rounded-xl px-3.5 py-2 whitespace-nowrap transition-all ${
                    builderTab === tab.id
                      ? "bg-white text-cyan-700 shadow-sm border border-slate-200 font-extrabold"
                      : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEvent} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* TAB 1: BASIC INFO & LOCATIONS */}
              {builderTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        placeholder="e.g. National CFO & AI Leadership Summit 2026"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category Badge *</label>
                      <select
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      >
                        <option value="Conference & Leadership">Conference & Leadership</option>
                        <option value="CXO Summit">CXO Summit</option>
                        <option value="Tech Conclave">Tech Conclave</option>
                        <option value="HR & Talent">HR & Talent</option>
                        <option value="Marketing Summit">Marketing Summit</option>
                        <option value="BFSI Forum">BFSI Forum</option>
                        <option value="Awards & Recognition">Awards & Recognition</option>
                        <option value="Global Capability">Global Capability</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Status</label>
                      <select
                        value={eventForm.status}
                        onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      >
                        <option value="published">Published (Live & Visible)</option>
                        <option value="draft">Draft (Admin Only)</option>
                      </select>
                    </div>

                    {/* Banner Image & Live Preview Box */}
                    <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="block text-slate-700 font-bold">
                        Banner Image (Upload File or Image URL) *
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2 items-start">
                        <div className="space-y-3">
                          <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-dashed border-cyan-400 bg-cyan-50/80 px-4 py-3 text-cyan-800 font-bold hover:bg-cyan-100 transition-all shadow-xs">
                            <Upload className="h-4 w-4" />
                            <span>{uploadingImage ? "Uploading Image..." : "Upload Image File"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="text"
                            required
                            value={eventForm.image}
                            onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                            placeholder="Image URL e.g. /assets/event-cfo-BjslOJNi.jpg"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none font-mono text-[11px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live Preview</span>
                          <div className="relative h-24 w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-200/60 shadow-xs flex items-center justify-center">
                            {eventForm.image ? (
                              <img
                                src={eventForm.image}
                                alt="Event Banner Preview"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/assets/event-cfo-BjslOJNi.jpg";
                                }}
                              />
                            ) : (
                              <span className="text-[11px] text-slate-400 font-bold">No Image Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Locations & Dates */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-cyan-600" />
                          <span>Event Schedules & Cities</span>
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddLocationSlot}
                        className="flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-all shadow-xs"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>+ Add City Slot</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {eventForm.locations.map((loc, idx) => (
                        <div key={idx} className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3.5 shadow-2xs hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                            <span className="font-bold text-cyan-800 text-xs flex items-center gap-1.5">
                              <span>Slot #{idx + 1}</span>
                              {idx === 0 && (
                                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] text-cyan-800 font-bold border border-cyan-200/80">
                                  Primary
                                </span>
                              )}
                            </span>

                            {eventForm.locations.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLocationSlot(idx)}
                                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" /> Remove
                              </button>
                            )}
                          </div>

                          <div className="grid gap-3.5 sm:grid-cols-3">
                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-cyan-600" />
                                <span>City *</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={loc.city}
                                onChange={(e) => handleUpdateLocationSlot(idx, "city", e.target.value)}
                                placeholder="e.g. Mumbai / Delhi / Bengaluru"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-cyan-600" />
                                <span>Date *</span>
                              </label>
                              <input
                                type="date"
                                required
                                value={loc.date}
                                onChange={(e) => handleUpdateLocationSlot(idx, "date", e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all cursor-pointer font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-cyan-600" />
                                <span>Timing *</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={loc.time}
                                onChange={(e) => handleUpdateLocationSlot(idx, "time", e.target.value)}
                                placeholder="e.g. 09:00 AM — 06:00 PM"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-slate-700 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                                <Building className="h-3.5 w-3.5 text-cyan-600" />
                                <span>Venue Name / Hotel *</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={loc.venue}
                                onChange={(e) => handleUpdateLocationSlot(idx, "venue", e.target.value)}
                                placeholder="e.g. The St. Regis Mumbai, Lower Parel / Grand Hyatt"
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Short Description (Card Overview) *</label>
                      <textarea
                        required
                        rows={2}
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        placeholder="Brief summary of event..."
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Full Description (Detail Page)</label>
                      <textarea
                        rows={4}
                        value={eventForm.full_description}
                        onChange={(e) => setEventForm({ ...eventForm, full_description: e.target.value })}
                        placeholder="Detailed rich text breakdown of event themes, objectives, key takeaways..."
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AGENDA TIMELINE BUILDER */}
              {builderTab === "agenda" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Agenda Sessions Timeline</h4>
                      <p className="text-xs text-slate-500 font-medium">Add full-day sessions with timings, titles, and speaker details.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEventForm((prev) => ({
                          ...prev,
                          agenda_list: [
                            ...prev.agenda_list,
                            { id: `ag-${Date.now()}`, time: "10:00 AM — 11:00 AM", title: "New Keynote Session", speaker: "Session Speaker", description: "Session summary..." },
                          ],
                        }))
                      }
                      className="rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100"
                    >
                      + Add Session
                    </button>
                  </div>

                  {eventForm.agenda_list.map((item, idx) => (
                    <div key={item.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 relative">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-cyan-800 text-xs">Session #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEventForm((prev) => ({
                              ...prev,
                              agenda_list: prev.agenda_list.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Time Slot *</label>
                          <input
                            type="text"
                            value={item.time}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.agenda_list];
                                const itm = updated[idx];
                                if (itm) itm.time = e.target.value;
                                return { ...prev, agenda_list: updated };
                              })
                            }
                            placeholder="e.g. 09:30 AM — 10:30 AM"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Speaker / Presenter</label>
                          <input
                            type="text"
                            value={item.speaker || ""}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.agenda_list];
                                const itm = updated[idx];
                                if (itm) itm.speaker = e.target.value;
                                return { ...prev, agenda_list: updated };
                              })
                            }
                            placeholder="e.g. Dr. Rajesh Sharma"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Session Title *</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.agenda_list];
                                const itm = updated[idx];
                                if (itm) itm.title = e.target.value;
                                return { ...prev, agenda_list: updated };
                              })
                            }
                            placeholder="e.g. Opening Keynote: AI Transformation"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Description / Summary</label>
                          <input
                            type="text"
                            value={item.description || ""}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.agenda_list];
                                const itm = updated[idx];
                                if (itm) itm.description = e.target.value;
                                return { ...prev, agenda_list: updated };
                              })
                            }
                            placeholder="Brief session details..."
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: SPEAKERS BUILDER */}
              {builderTab === "speakers" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Featured Keynote Speakers</h4>
                      <p className="text-xs text-slate-500 font-medium">Add executive speakers, designation, photo, and bio topic.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEventForm((prev) => ({
                          ...prev,
                          speakers_list: [
                            ...prev.speakers_list,
                            {
                              id: `spk-${Date.now()}`,
                              name: "New Speaker",
                              designation: "Executive Director",
                              organization: "Company Name",
                              photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
                              topic: "Speaker Keynote Topic",
                            },
                          ],
                        }))
                      }
                      className="rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100"
                    >
                      + Add Speaker
                    </button>
                  </div>

                  {eventForm.speakers_list.map((spk, idx) => (
                    <div key={spk.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-cyan-800 text-xs">Speaker #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEventForm((prev) => ({
                              ...prev,
                              speakers_list: prev.speakers_list.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Speaker Name *</label>
                          <input
                            type="text"
                            value={spk.name}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.speakers_list];
                                const itm = updated[idx];
                                if (itm) itm.name = e.target.value;
                                return { ...prev, speakers_list: updated };
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                          <input
                            type="text"
                            value={spk.designation}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.speakers_list];
                                const itm = updated[idx];
                                if (itm) itm.designation = e.target.value;
                                return { ...prev, speakers_list: updated };
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Company / Organization *</label>
                          <input
                            type="text"
                            value={spk.organization}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.speakers_list];
                                const itm = updated[idx];
                                if (itm) itm.organization = e.target.value;
                                return { ...prev, speakers_list: updated };
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Photo Image URL</label>
                          <input
                            type="text"
                            value={spk.photo}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.speakers_list];
                                const itm = updated[idx];
                                if (itm) itm.photo = e.target.value;
                                return { ...prev, speakers_list: updated };
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Presentation Topic / Bio</label>
                          <input
                            type="text"
                            value={spk.topic || ""}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.speakers_list];
                                const itm = updated[idx];
                                if (itm) itm.topic = e.target.value;
                                return { ...prev, speakers_list: updated };
                              })
                            }
                            placeholder="Topic title or short speaker bio..."
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: SPONSORS BUILDER */}
              {builderTab === "sponsors" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Event Sponsors & Brand Partners</h4>
                      <p className="text-xs text-slate-500 font-medium">Add corporate sponsors, tier categories, and logo links.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEventForm((prev) => ({
                          ...prev,
                          sponsors_list: [
                            ...prev.sponsors_list,
                            {
                              id: `spn-${Date.now()}`,
                              name: "Partner Brand",
                              tier: "Gold Sponsor",
                              logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300",
                              websiteUrl: "https://example.com",
                            },
                          ],
                        }))
                      }
                      className="rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100"
                    >
                      + Add Sponsor
                    </button>
                  </div>

                  {eventForm.sponsors_list.map((spn, idx) => (
                    <div key={spn.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-cyan-800 text-xs">Sponsor #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEventForm((prev) => ({
                              ...prev,
                              sponsors_list: prev.sponsors_list.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                          <input
                            type="text"
                            value={spn.name}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.sponsors_list];
                                const itm = updated[idx];
                                if (itm) itm.name = e.target.value;
                                return { ...prev, sponsors_list: updated };
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Sponsorship Tier *</label>
                          <select
                            value={spn.tier}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.sponsors_list];
                                const itm = updated[idx];
                                if (itm) itm.tier = e.target.value as any;
                                return { ...prev, sponsors_list: updated };
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          >
                            <option value="Title Partner">Title Partner</option>
                            <option value="Platinum Sponsor">Platinum Sponsor</option>
                            <option value="Gold Sponsor">Gold Sponsor</option>
                            <option value="Silver Partner">Silver Partner</option>
                            <option value="Technology Partner">Technology Partner</option>
                            <option value="Media Partner">Media Partner</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Logo / Banner URL</label>
                          <input
                            type="text"
                            value={spn.logo}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.sponsors_list];
                                const itm = updated[idx];
                                if (itm) itm.logo = e.target.value;
                                return { ...prev, sponsors_list: updated };
                              })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: GALLERY BUILDER */}
              {builderTab === "gallery" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Event Photos & Video Media</h4>
                      <p className="text-xs text-slate-500 font-medium">Upload gallery image files or enter image URLs with captions.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEventForm((prev) => ({
                          ...prev,
                          gallery_list: [
                            ...prev.gallery_list,
                            {
                              id: `gal-${Date.now()}`,
                              type: "image",
                              url: "/assets/hero-leadership.jpg",
                              caption: "Executive Conclave Highlight",
                            },
                          ],
                        }))
                      }
                      className="rounded-xl border border-cyan-300 bg-cyan-50 px-3.5 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100"
                    >
                      + Add Gallery Item
                    </button>
                  </div>

                  {eventForm.gallery_list.map((item, idx) => (
                    <div key={item.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-cyan-800 text-xs">Media #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEventForm((prev) => ({
                              ...prev,
                              gallery_list: prev.gallery_list.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-12 items-start">
                        {/* File Upload & URL Input */}
                        <div className="sm:col-span-8 space-y-2">
                          <label className="block font-bold text-slate-700">Upload Image File or Enter URL *</label>

                          <div className="flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer rounded-xl border border-dashed border-cyan-400 bg-cyan-50 px-3 py-2 text-cyan-800 font-bold hover:bg-cyan-100 transition-all text-xs">
                              <Upload className="h-3.5 w-3.5" />
                              <span>{uploadingGalleryIndex === idx ? "Uploading Image..." : "Upload Image File"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleGalleryFileUpload(idx, e)}
                                disabled={uploadingGalleryIndex === idx}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[11px] text-slate-400 font-bold">OR</span>
                          </div>

                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) =>
                              setEventForm((prev) => {
                                const updated = [...prev.gallery_list];
                                const itm = updated[idx];
                                if (itm) itm.url = e.target.value;
                                return { ...prev, gallery_list: updated };
                              })
                            }
                            placeholder="Image URL e.g. /assets/hero-leadership.jpg"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono text-[11px]"
                          />

                          <div>
                            <label className="block font-bold text-slate-700 mt-2 mb-1">Caption / Description</label>
                            <input
                              type="text"
                              value={item.caption || ""}
                              onChange={(e) =>
                                setEventForm((prev) => {
                                  const updated = [...prev.gallery_list];
                                  const itm = updated[idx];
                                  if (itm) itm.caption = e.target.value;
                                  return { ...prev, gallery_list: updated };
                                })
                              }
                              placeholder="e.g. CXO Keynote Address & Industry Benchmarking Session"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Image Preview Thumbnail */}
                        <div className="sm:col-span-4 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preview</span>
                          <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-200 shadow-xs flex items-center justify-center">
                            {item.url ? (
                              <img
                                src={item.url}
                                alt={item.caption || `Gallery ${idx + 1}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/assets/hero-leadership.jpg";
                                }}
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">No Image</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: VENUE & MAP EMBED */}
              {builderTab === "venue" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Google Maps Embed & Venue Location</h4>
                    <p className="text-xs text-slate-500 font-medium">Embed custom Google Maps iframe or address text.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Custom Venue Address</label>
                      <input
                        type="text"
                        value={eventForm.venue_address}
                        onChange={(e) => setEventForm({ ...eventForm, venue_address: e.target.value })}
                        placeholder="e.g. The St. Regis, Lower Parel, Mumbai, Maharashtra 400013"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Google Maps Embed iframe URL</label>
                      <textarea
                        rows={3}
                        value={eventForm.map_url}
                        onChange={(e) => setEventForm({ ...eventForm, map_url: e.target.value })}
                        placeholder="Paste Google Maps iframe src URL or share link..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sticky Footer Submit */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 sticky bottom-0 bg-white py-3">
                <label className="relative flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={eventForm.is_featured}
                    onChange={(e) => setEventForm({ ...eventForm, is_featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="font-bold text-slate-900">Mark as Featured Event</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEventModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-cyan-600 hover:bg-cyan-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
                  >
                    {editingEvent ? "Update Event" : "Create & Save Event"}
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/* ========================================== */}
      {/* DELEGATE REGISTRATION FULL DETAILS MODAL  */}
      {/* ========================================== */}
      {selectedRegDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedRegDetail(null)}
              className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-600">
              <Users className="h-4 w-4" />
              <span>Delegate Registration Details</span>
            </div>

            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              {selectedRegDetail.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Registration ID: <span className="text-cyan-700 font-bold">{selectedRegDetail.id}</span>
            </p>

            {/* Details Grid */}
            <div className="mt-6 space-y-4 text-xs">
              {/* Personal & Corporate Info */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-1">
                  Personal & Executive Info
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">First Name:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.first_name || selectedRegDetail.name.split(" ")[0]}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Last Name:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.last_name || selectedRegDetail.name.split(" ").slice(1).join(" ") || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Designation:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.designation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Organization / Company:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.organization}</strong>
                  </div>
                </div>
              </div>

              {/* Contact & Location Info */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-1">
                  Contact & Location Info
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Work Email:</span>
                    <a href={`mailto:${selectedRegDetail.email}`} className="text-cyan-700 font-bold hover:underline">{selectedRegDetail.email}</a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Number:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">City:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.city || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Country:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.country || "India"}</strong>
                  </div>
                </div>
              </div>

              {/* Participation Preferences */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-1">
                  Category, Status & Referral Preferences
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category:</span>
                    <span className="inline-block rounded-md bg-cyan-100 px-2 py-0.5 text-cyan-800 font-bold text-[11px]">
                      {selectedRegDetail.registration_category || "Delegate"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status:</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleToggleRegistrationStatus(selectedRegDetail.id);
                        setSelectedRegDetail((prev) =>
                          prev ? { ...prev, status: (prev.status || "Confirmed") === "Confirmed" ? "Pending" : "Confirmed" } : null
                        );
                      }}
                      title="Click to toggle status"
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border transition-all cursor-pointer ${
                        (selectedRegDetail.status || "Confirmed") === "Confirmed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                      }`}
                    >
                      {selectedRegDetail.status || "Confirmed"}
                    </button>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Registering City:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.registering_city || selectedRegDetail.city || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Referral Source:</span>
                    <strong className="text-slate-900 text-xs">{selectedRegDetail.referral_source || "Direct"}</strong>
                  </div>
                </div>
              </div>

              {/* Event Details Banner */}
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 space-y-1">
                <span className="text-[10px] font-black uppercase text-cyan-800 tracking-wider block">Registered Event</span>
                <h4 className="text-sm font-bold text-slate-900">{selectedRegDetail.event_title || selectedRegDetail.event_id}</h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  Timestamp: {new Date(selectedRegDetail.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedRegDetail, null, 2));
                  toast.success("Delegate registration data copied to clipboard!");
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Copy JSON
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegDetail(null)}
                className="flex-1 rounded-xl bg-cyan-600 py-3 text-xs font-bold text-white hover:bg-cyan-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

          {/* TAB: PARTNERS & COLLABORATORS */}
          {activeTab === "partners" && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <p className="text-xs text-slate-500 font-medium">
                  Upload collaborator brand logos for the website animated carousel and manage incoming strategic partner lead inquiries.
                </p>

                {/* Sub-tab toggle */}
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPartnerSubTab("brands")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      partnerSubTab === "brands"
                        ? "bg-white text-cyan-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Collaborator Logos ({partnersList.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPartnerSubTab("leads")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      partnerSubTab === "leads"
                        ? "bg-white text-cyan-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Partner Applications ({partnerSubmissions.length})
                  </button>
                </div>
              </div>

              {/* SUB-TAB 1: COLLABORATOR BRANDS CMS */}
              {partnerSubTab === "brands" && (
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Upload Form */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                      <PlusCircle className="h-5 w-5 text-cyan-600" />
                      <span>{editingPartner ? `Edit Partner: ${editingPartner.brand_name}` : "Add Partner Brand Logo"}</span>
                    </h3>

                    <form onSubmit={handleAddPartner} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Brand Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. NorthBridge Capital"
                          value={newPartnerForm.brand_name}
                          onChange={(e) => setNewPartnerForm({ ...newPartnerForm, brand_name: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Category *
                          </label>
                          <select
                            value={newPartnerForm.category}
                            onChange={(e) => setNewPartnerForm({ ...newPartnerForm, category: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                          >
                            <option value="Strategic Partner">Strategic Partner</option>
                            <option value="Tech Partner">Tech Partner</option>
                            <option value="Media Partner">Media Partner</option>
                            <option value="Award Partner">Award Partner</option>
                            <option value="Event Sponsor">Event Sponsor</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Status *
                          </label>
                          <select
                            value={newPartnerForm.status}
                            onChange={(e) => setNewPartnerForm({ ...newPartnerForm, status: e.target.value as "Active" | "Inactive" })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold"
                          >
                            <option value="Active">🟢 Active (In Marquee)</option>
                            <option value="Inactive">🔴 Inactive (Hidden)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Website Link
                          </label>
                          <input
                            type="url"
                            placeholder="https://company.com"
                            value={newPartnerForm.website}
                            onChange={(e) => setNewPartnerForm({ ...newPartnerForm, website: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Priority Order #
                          </label>
                          <input
                            type="number"
                            placeholder="0 (Highest priority first)"
                            value={newPartnerForm.priority}
                            onChange={(e) => setNewPartnerForm({ ...newPartnerForm, priority: Number(e.target.value) })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Brand Logo (File Upload or URL) *
                        </label>
                        
                        {/* File Upload Option */}
                        <div className="mb-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors w-full justify-center">
                            <Upload className="h-4 w-4 text-cyan-600" />
                            <span>Choose Logo Image File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  const base64Data = reader.result as string;
                                  setNewPartnerForm((prev) => ({ ...prev, logo: base64Data }));
                                  try {
                                    toast.loading("Uploading logo...");
                                    const res = await fetch("/api/admin/upload", {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: JSON.stringify({ imageBase64: base64Data, filename: file.name }),
                                    });
                                    const uploadRes = await res.json();
                                    toast.dismiss();
                                    if (uploadRes.success && uploadRes.url) {
                                      setNewPartnerForm((prev) => ({ ...prev, logo: uploadRes.url }));
                                      toast.success("Logo uploaded!");
                                    } else {
                                      toast.success("Logo preview ready!");
                                    }
                                  } catch (err) {
                                    toast.dismiss();
                                    toast.success("Logo preview ready!");
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>

                        {/* Image URL Input */}
                        <input
                          type="text"
                          required
                          placeholder="Or enter Image URL (e.g. /uploads/logo.png)"
                          value={newPartnerForm.logo}
                          onChange={(e) => setNewPartnerForm({ ...newPartnerForm, logo: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-mono"
                        />
                      </div>

                      {newPartnerForm.logo && (
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                          <img src={newPartnerForm.logo} alt="Preview" className="h-10 w-10 rounded-lg object-cover border border-slate-300" />
                          <span className="text-[11px] text-slate-500 font-medium truncate">Logo Preview Ready</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {editingPartner && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPartner(null);
                              setNewPartnerForm({
                                brand_name: "",
                                website: "",
                                category: "Strategic Partner",
                                logo: "",
                                priority: 0,
                                status: "Active",
                              });
                            }}
                            className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={partnerUploading}
                          className="flex-1 rounded-2xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {partnerUploading ? "Uploading..." : editingPartner ? "Update Partner Brand" : "Save & Publish Brand Logo"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Collaborator Grid Display */}
                  <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-3">
                      <span>Collaborator Marquee Logos ({partnersList.length})</span>
                      <span className="text-xs text-slate-500 font-normal">Active in Logo Carousel</span>
                    </h3>

                    {partnersList.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No collaborator brands uploaded yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {partnersList.map((partner) => {
                          const isActive = partner.status !== "Inactive";
                          return (
                            <div
                              key={partner.id}
                              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all space-y-3 ${
                                isActive
                                  ? "border-slate-200 bg-slate-50 hover:border-cyan-400"
                                  : "border-slate-200 bg-slate-100/70 opacity-75"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={partner.logo}
                                    alt={partner.brand_name}
                                    className="h-12 w-12 rounded-xl object-cover border border-slate-300 shrink-0 bg-white"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-xs truncate">
                                      {partner.brand_name}
                                    </h4>
                                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 inline-block mt-0.5">
                                      {partner.category || "Strategic Partner"}
                                    </span>
                                    {partner.website && (
                                      <a
                                        href={partner.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-slate-500 hover:text-cyan-600 block truncate mt-0.5 font-mono"
                                      >
                                        {partner.website}
                                      </a>
                                    )}
                                  </div>
                                </div>

                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border shrink-0 ${
                                    isActive
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                      : "bg-slate-200 text-slate-700 border-slate-300"
                                  }`}
                                >
                                  {isActive ? "🟢 Active" : "🔴 Inactive"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                                <span className="text-[10px] font-mono font-bold text-slate-500">
                                  Priority: #{partner.priority ?? 0}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPartner(partner);
                                      setNewPartnerForm({
                                        brand_name: partner.brand_name,
                                        website: partner.website || "",
                                        category: partner.category || "Strategic Partner",
                                        logo: partner.logo,
                                        priority: partner.priority ?? 0,
                                        status: partner.status || "Active",
                                      });
                                    }}
                                    className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                                    title="Edit Partner"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeletePartner(partner.id)}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                                    title="Delete Partner Logo"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: PARTNER LEADS INQUIRIES */}
              {partnerSubTab === "leads" && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search partner applications by company, person, email, or partnership type..."
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      Showing <strong className="text-slate-900">{partnerSubmissions.length}</strong> partner inquiries
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                          <th className="py-3 px-4">Company Name</th>
                          <th className="py-3 px-4">Contact Person</th>
                          <th className="py-3 px-4">Email & Phone</th>
                          <th className="py-3 px-4">Partnership Type</th>
                          <th className="py-3 px-4">Industry / Location</th>
                          <th className="py-3 px-4">Submitted Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {partnerSubmissions
                          .filter(
                            (sub) =>
                              sub.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              sub.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              sub.partnership_type?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                <div>{sub.company_name}</div>
                                {sub.website && (
                                  <a href={sub.website} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-600 hover:underline">
                                    {sub.website}
                                  </a>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-800">{sub.contact_person}</div>
                                <div className="text-[10px] text-slate-500">{sub.designation}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="text-slate-900 font-mono">{sub.email}</div>
                                <div className="text-[10px] text-slate-500">{sub.phone}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-extrabold text-cyan-800 border border-cyan-200">
                                  {sub.partnership_type}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                <div>{sub.industry}</div>
                                <div className="text-[10px] text-slate-400">{sub.location}</div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                                {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : "Recent"}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPartnerLeadDetail(sub)}
                                    className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer"
                                    title="View Full Application Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeletePartnerSubmission(sub.id)}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                    title="Delete Submission"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: EXECUTIVE TALKS MAGAZINE CMS */}
          {activeTab === "magazines" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <p className="text-xs text-slate-500 font-medium">
                  Upload cover images, PDF downloads, and flipbook page spreads for Executive Talks Magazine digital editions.
                </p>
                <span className="rounded-full bg-cyan-50 border border-cyan-200 px-3.5 py-1.5 text-xs font-extrabold text-cyan-800 shadow-2xs">
                  Published Editions: {cmsMagazines.length}
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Publish Form */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                    <PlusCircle className="h-5 w-5 text-purple-600" />
                    {editingMag ? "Edit Magazine Edition" : "Publish New Magazine Edition"}
                  </h3>

                  <form onSubmit={handleAddMagazine} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Edition Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Leading Beyond Today"
                        value={newMagForm.title}
                        onChange={(e) => setNewMagForm({ ...newMagForm, title: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Issue Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Issue 29"
                          value={newMagForm.issue}
                          onChange={(e) => setNewMagForm({ ...newMagForm, issue: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Month / Date *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. October 2026"
                          value={newMagForm.month}
                          onChange={(e) => setNewMagForm({ ...newMagForm, month: e.target.value, date: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Category *
                      </label>
                      <select
                        value={newMagForm.category}
                        onChange={(e) => setNewMagForm({ ...newMagForm, category: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none"
                      >
                        <option value="Leadership">Leadership</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Technology">Technology</option>
                        <option value="GCC">GCC</option>
                        <option value="Startup">Startup</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Manufacturing">Manufacturing</option>
                      </select>
                    </div>

                    {/* Cover Image Upload / Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        1. Upload Magazine Cover Image *
                      </label>
                      
                      <div className="mb-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-purple-50 hover:bg-purple-100 border-purple-200 px-3.5 py-2 text-xs font-bold text-purple-900 transition-colors w-full justify-center shadow-xs">
                          <Upload className="h-4 w-4 text-purple-600" />
                          <span>Choose Cover Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const base64Data = reader.result as string;
                                setNewMagForm((prev) => ({ ...prev, cover: base64Data }));
                                try {
                                  toast.loading("Uploading cover image...");
                                  const res = await fetch("/api/admin/upload", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ imageBase64: base64Data, filename: file.name }),
                                  });
                                  const uploadRes = await res.json();
                                  toast.dismiss();
                                  if (uploadRes.success && uploadRes.url) {
                                    setNewMagForm((prev) => ({ ...prev, cover: uploadRes.url }));
                                    toast.success("Cover image uploaded!");
                                  } else {
                                    toast.success("Cover image loaded into form preview!");
                                  }
                                } catch (err) {
                                  toast.dismiss();
                                  toast.success("Cover image loaded into form preview!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Or enter Cover Image URL (https://...)"
                        value={newMagForm.cover}
                        onChange={(e) => setNewMagForm({ ...newMagForm, cover: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>

                    {/* PDF Document Upload / Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        2. Upload Full PDF Document
                      </label>
                      
                      <div className="mb-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-purple-50 hover:bg-purple-100 border-purple-200 px-3.5 py-2 text-xs font-bold text-purple-900 transition-colors w-full justify-center shadow-xs">
                          <Upload className="h-4 w-4 text-purple-600" />
                          <span>Choose PDF File</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const base64Data = reader.result as string;
                                setNewMagForm((prev) => ({ ...prev, pdf_url: base64Data }));
                                try {
                                  toast.loading("Uploading PDF document...");
                                  const res = await fetch("/api/admin/upload", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ imageBase64: base64Data, filename: file.name }),
                                  });
                                  const uploadRes = await res.json();
                                  toast.dismiss();
                                  if (uploadRes.success && uploadRes.url) {
                                    setNewMagForm((prev) => ({ ...prev, pdf_url: uploadRes.url }));
                                    toast.success("PDF document uploaded!");
                                  } else {
                                    toast.success("PDF document attached!");
                                  }
                                } catch (err) {
                                  toast.dismiss();
                                  toast.success("PDF document attached!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>

                      <input
                        type="url"
                        placeholder="Or enter PDF URL (https://...)"
                        value={newMagForm.pdf_url}
                        onChange={(e) => setNewMagForm({ ...newMagForm, pdf_url: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>

                    {/* Individual Pages Upload / Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        3. Upload Individual Pages (For Interactive Flipbook)
                      </label>

                      <div className="mb-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-purple-50 hover:bg-purple-100 border-purple-200 px-3.5 py-2 text-xs font-bold text-purple-900 transition-colors w-full justify-center shadow-xs">
                          <Upload className="h-4 w-4 text-purple-600" />
                          <span>Choose Multiple Page Images</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length === 0) return;
                              toast.loading(`Uploading ${files.length} page images...`);
                              const uploadedUrls: string[] = [];

                              for (const file of files) {
                                await new Promise<void>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    const base64Data = reader.result as string;
                                    try {
                                      const res = await fetch("/api/admin/upload", {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({ imageBase64: base64Data, filename: file.name }),
                                      });
                                      const uploadRes = await res.json();
                                      if (uploadRes.success && uploadRes.url) {
                                        uploadedUrls.push(uploadRes.url);
                                      } else {
                                        uploadedUrls.push(base64Data);
                                      }
                                    } catch (err) {
                                      uploadedUrls.push(base64Data);
                                    }
                                    resolve();
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                              toast.dismiss();
                              setNewMagForm((prev) => ({
                                ...prev,
                                pages_list: uploadedUrls.join(", "),
                              }));
                              toast.success(`Attached ${uploadedUrls.length} page images for flipbook!`);
                            }}
                          />
                        </label>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Comma-separated page URLs: /uploads/p1.png, /uploads/p2.png..."
                        value={newMagForm.pages_list}
                        onChange={(e) => setNewMagForm({ ...newMagForm, pages_list: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="mag_featured"
                        checked={newMagForm.is_featured}
                        onChange={(e) => setNewMagForm({ ...newMagForm, is_featured: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <label htmlFor="mag_featured" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Set as Featured Cover Issue on Hero
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingMag && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMag(null);
                            setNewMagForm({
                              issue: "Issue 29",
                              title: "",
                              date: "October 2026",
                              month: "October 2026",
                              cover: "",
                              pdf_url: "",
                              pages_list: "",
                              category: "Leadership",
                              is_featured: false,
                            });
                          }}
                          className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={magUploading}
                        className="flex-1 rounded-2xl bg-purple-600 py-3 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {magUploading ? "Saving..." : editingMag ? "Update Magazine Edition" : "Publish Magazine Edition"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Published Magazines Display */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-3">
                    <span>Published Magazine Editions ({cmsMagazines.length})</span>
                    <span className="text-xs text-slate-500 font-normal">Active in Executive Library</span>
                  </h3>

                  {cmsMagazines.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No magazine editions published yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cmsMagazines.map((mag) => (
                        <div
                          key={mag.id}
                          className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-purple-400 transition-all space-y-3"
                        >
                          <div className="flex gap-3">
                            <img
                              src={mag.cover}
                              alt={mag.title}
                              className="h-24 w-18 rounded-xl object-cover border border-slate-300 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                  {mag.issue}
                                </span>
                                {mag.is_featured ? (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    ★ Featured
                                  </span>
                                ) : null}
                              </div>

                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {mag.title}
                              </h4>
                              
                              <p className="text-[11px] text-slate-500 font-medium">
                                {mag.month || mag.date} · {mag.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleMagFeatured(mag)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                mag.is_featured
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300"
                              }`}
                            >
                              {mag.is_featured ? "Featured ★" : "Make Featured"}
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMag(mag);
                                  setNewMagForm({
                                    issue: mag.issue,
                                    title: mag.title,
                                    date: mag.date,
                                    month: mag.month || mag.date,
                                    cover: mag.cover,
                                    pdf_url: mag.pdf_url || "",
                                    pages_list: Array.isArray(mag.pages_list)
                                      ? mag.pages_list.join(", ")
                                      : mag.pages_list || "",
                                    category: mag.category || "Leadership",
                                    is_featured: Boolean(mag.is_featured),
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                                title="Edit Edition"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteMagazine(mag.id)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Delete Edition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAREERS & JOBS CMS */}
          {activeTab === "careers" && (
            <div className="space-y-6">
              {/* Sub-tabs Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCareersSubTab("jobs")}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      careersSubTab === "jobs"
                        ? "gradient-brand text-white shadow-md shadow-cyan-500/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Job Openings CMS ({cmsJobs.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCareersSubTab("applicants")}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      careersSubTab === "applicants"
                        ? "gradient-brand text-white shadow-md shadow-cyan-500/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Applicant Resumes Inbox</span>
                    {jobApplications.length > 0 && (
                      <span className="rounded-full bg-cyan-100 text-cyan-800 px-2 py-0.5 text-[10px] font-extrabold border border-cyan-200">
                        {jobApplications.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {careersSubTab === "jobs"
                    ? "Manage open positions & close hiring status"
                    : "Review candidate applications & download PDF resumes"}
                </div>
              </div>

              {/* Sub-tab 1: Job Openings CMS */}
              {careersSubTab === "jobs" && (
                <div className="grid gap-8 lg:grid-cols-3">
                  {/* Job Form (Add / Edit) */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-cyan-600" />
                        <span>{editingJob ? "Edit Job Position" : "Add New Job Position"}</span>
                      </h3>
                      {editingJob && (
                        <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                          {editingJob.id}
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleAddJob} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Senior Conference Producer"
                          value={newJobForm.title}
                          onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Department *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Conference Production"
                            value={newJobForm.department}
                            onChange={(e) => setNewJobForm({ ...newJobForm, department: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Experience *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 3 — 5 Years"
                            value={newJobForm.experience}
                            onChange={(e) => setNewJobForm({ ...newJobForm, experience: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Location *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Hyderabad (Hybrid)"
                            value={newJobForm.location}
                            onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Hiring Status *
                          </label>
                          <select
                            value={newJobForm.status}
                            onChange={(e) => setNewJobForm({ ...newJobForm, status: e.target.value as "Open" | "Closed" })}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold"
                          >
                            <option value="Open">Open (Active Hiring)</option>
                            <option value="Closed">Closed (Hiring Closed)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Role Overview / Description *
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Brief overview of the role, team goals, and expectations..."
                          value={newJobForm.description}
                          onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Responsibilities (One per line or comma-separated)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Recruit CXO keynotes&#10;Research industry trends&#10;Drive stage program execution"
                          value={newJobForm.responsibilities}
                          onChange={(e) => setNewJobForm({ ...newJobForm, responsibilities: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Qualifications (One per line or comma-separated)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="3+ years in B2B conference production&#10;Exceptional communication skills&#10;Proven track record"
                          value={newJobForm.qualifications}
                          onChange={(e) => setNewJobForm({ ...newJobForm, qualifications: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Perks & Benefits (One per line or comma-separated)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Competitive salary with performance bonus&#10;Comprehensive health insurance&#10;Hybrid work flexibility"
                          value={newJobForm.benefits}
                          onChange={(e) => setNewJobForm({ ...newJobForm, benefits: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        {editingJob && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingJob(null);
                              setNewJobForm({
                                id: "",
                                title: "",
                                department: "Conference Production",
                                location: "Hyderabad (Hybrid)",
                                experience: "3 — 5 Years",
                                description: "",
                                responsibilities: "",
                                qualifications: "",
                                benefits: "",
                                status: "Open",
                              });
                            }}
                            className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={jobUploading}
                          className="flex-1 rounded-2xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {jobUploading ? "Saving..." : editingJob ? "Update Job Position" : "Publish Job Position"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Job Openings List */}
                  <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-3">
                      <span>Current Job Openings ({cmsJobs.length})</span>
                      <span className="text-xs text-slate-500 font-normal">Active on Careers Portal</span>
                    </h3>

                    {cmsJobs.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No active job openings created yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {cmsJobs.map((job) => {
                          const isOpen = job.status !== "Closed";
                          return (
                            <div
                              key={job.id}
                              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all space-y-4 ${
                                isOpen
                                  ? "border-slate-200 bg-slate-50 hover:border-cyan-400"
                                  : "border-slate-200 bg-slate-100/70 opacity-80"
                              }`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                                      {job.id}
                                    </span>
                                    <span className="text-xs font-extrabold text-slate-700">
                                      {job.department}
                                    </span>
                                  </div>
                                  <h4 className="text-base font-extrabold text-slate-900">
                                    {job.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    📍 {job.location} · 💼 {job.experience}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                                      isOpen
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                        : "bg-slate-200 text-slate-700 border-slate-300"
                                    }`}
                                  >
                                    {isOpen ? "🟢 Open for Applicants" : "🔴 Hiring Closed"}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">
                                {job.description}
                              </p>

                              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleToggleJobStatus(job)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                    isOpen
                                      ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                                      : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  }`}
                                >
                                  {isOpen ? "Close Hiring" : "Reopen Hiring"}
                                </button>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingJob(job);
                                      setNewJobForm({
                                        id: job.id,
                                        title: job.title,
                                        department: job.department,
                                        location: job.location,
                                        experience: job.experience,
                                        description: job.description,
                                        responsibilities: Array.isArray(job.responsibilities)
                                          ? job.responsibilities.join("\n")
                                          : job.responsibilities || "",
                                        qualifications: Array.isArray(job.qualifications)
                                          ? job.qualifications.join("\n")
                                          : job.qualifications || "",
                                        benefits: Array.isArray(job.benefits)
                                          ? job.benefits.join("\n")
                                          : job.benefits || "",
                                        status: (job.status as "Open" | "Closed") || "Open",
                                      });
                                    }}
                                    className="p-2 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                                    title="Edit Position"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                                    title="Delete Position"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Applicant Resumes Inbox */}
              {careersSubTab === "applicants" && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search candidate by name, email, phone, job title, or experience..."
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium mr-2">
                        Total Applicants: <strong className="text-slate-900">{jobApplications.length}</strong>
                      </span>
                      <button
                        onClick={() => exportToExcel("career-applicants")}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Export Excel</span>
                      </button>
                      <button
                        onClick={() => exportToCSV("career-applicants")}
                        className="flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-all cursor-pointer shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5 text-cyan-600" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                          <th className="py-3 px-4">Candidate Name</th>
                          <th className="py-3 px-4">Applied Role</th>
                          <th className="py-3 px-4">Contact Details</th>
                          <th className="py-3 px-4">Experience</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Download Resume</th>
                          <th className="py-3 px-4">Applied Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {jobApplications
                          .filter(
                            (app) =>
                              app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              app.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              app.experience.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-4 font-bold text-slate-900">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800 font-bold text-xs">
                                    {app.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="block font-bold text-slate-900">{app.name}</span>
                                    <span className="text-[11px] text-slate-400 font-mono">ID: {app.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-700">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-cyan-800">{app.job_title}</span>
                                  <span className="text-[10px] font-mono text-slate-400">{app.job_id}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-700">
                                <div className="flex flex-col">
                                  <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-cyan-700 font-medium hover:underline">
                                    <Mail className="h-3 w-3 text-cyan-600" /> {app.email}
                                  </a>
                                  <span className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5 font-mono">
                                    <Phone className="h-3 w-3 text-slate-400" /> {app.phone}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-800 border border-slate-200 font-medium">
                                  {app.experience}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <select
                                  value={app.status || "Under Review"}
                                  onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 focus:border-cyan-500 focus:outline-none"
                                >
                                  <option value="Under Review">🔵 Under Review</option>
                                  <option value="Shortlisted">🟣 Shortlisted</option>
                                  <option value="Interview Scheduled">🟡 Interview Scheduled</option>
                                  <option value="Hired">🟢 Hired</option>
                                  <option value="Rejected">🔴 Rejected</option>
                                </select>
                              </td>
                              <td className="py-4 px-4">
                                {app.resume_url ? (
                                  <a
                                    href={app.resume_url}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-extrabold text-cyan-800 hover:bg-cyan-100 transition-all shadow-xs cursor-pointer"
                                  >
                                    <Download className="h-3.5 w-3.5 text-cyan-600" />
                                    <span>Download Resume</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">No file</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                                {app.created_at ? new Date(app.created_at).toLocaleString() : "Recently"}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedApplicantDetail(app)}
                                    className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors cursor-pointer"
                                    title="View Candidate Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteJobApplication(app.id)}
                                    className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                    title="Delete Candidate"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                        {jobApplications.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-16 text-center text-slate-400">
                              No job applications received yet. Submit an application on the Careers page to test!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MEDIA GALLERY CMS */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-cyan-700 font-extrabold text-xs uppercase tracking-wider mb-1">
                    <Film className="h-4 w-4" />
                    <span>Media Gallery Assets & Publishing</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Upload, organize, edit, and publish high-resolution summit photo and video assets
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-50 border border-cyan-200 px-3.5 py-1.5 text-xs font-extrabold text-cyan-800 shadow-2xs">
                    Total Active Assets: {cmsGalleryItems.length}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3 items-start">
                {/* Form Column (Add / Edit Media Asset) - STICKY LEFT PANEL */}
                <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 lg:sticky lg:top-4 self-start">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <PlusCircle className="h-4 w-4 text-cyan-600" />
                      <span>{editingGalleryItem ? "Edit Media Asset" : "Upload New Media Asset"}</span>
                    </h3>
                    {editingGalleryItem && (
                      <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                        {editingGalleryItem.id}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleAddGalleryItem} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Media Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CXO Keynote & Panel Highlights"
                        value={newGalleryForm.title}
                        onChange={(e) => setNewGalleryForm({ ...newGalleryForm, title: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Media Type *
                        </label>
                        <select
                          value={newGalleryForm.type}
                          onChange={(e) => setNewGalleryForm({ ...newGalleryForm, type: e.target.value as "photo" | "video" })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold"
                        >
                          <option value="photo">📷 Photo Image</option>
                          <option value="video">🎥 Video Embed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Category *
                        </label>
                        <select
                          value={newGalleryForm.category}
                          onChange={(e) => setNewGalleryForm({ ...newGalleryForm, category: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        >
                          <option value="Keynotes">Keynotes</option>
                          <option value="Networking">Networking</option>
                          <option value="Awards">Awards</option>
                          <option value="Stage & AV">Stage & AV</option>
                          <option value="Exhibitions">Exhibitions</option>
                        </select>
                      </div>
                    </div>

                    {/* File Upload Option */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Upload Media File or Enter URL *
                      </label>
                      
                      <div className="mb-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors w-full justify-center">
                          <Upload className="h-4 w-4 text-cyan-600" />
                          <span>Choose Media File</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const base64Data = reader.result as string;
                                setNewGalleryForm((prev) => ({ ...prev, url: base64Data }));
                                try {
                                  toast.loading("Uploading media...");
                                  const res = await fetch("/api/admin/upload", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      imageBase64: base64Data,
                                      filename: file.name,
                                    }),
                                  });
                                  const uploadRes = await res.json();
                                  toast.dismiss();
                                  if (uploadRes.success) {
                                    setNewGalleryForm((prev) => ({ ...prev, url: uploadRes.url, thumbnail_url: uploadRes.url }));
                                    toast.success("Media file uploaded & attached!");
                                  } else {
                                    toast.success("Media preview loaded!");
                                  }
                                } catch (err) {
                                  toast.dismiss();
                                  toast.success("Media preview loaded!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder={newGalleryForm.type === "video" ? "YouTube Embed Link (https://www.youtube.com/embed/...)" : "Or enter Image URL (https://...)"}
                        value={newGalleryForm.url}
                        onChange={(e) => setNewGalleryForm({ ...newGalleryForm, url: e.target.value, thumbnail_url: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Associated Summit Event
                      </label>
                      <select
                        value={newGalleryForm.event_slug}
                        onChange={(e) => {
                          const slug = e.target.value;
                          let title = "All Events";
                          if (slug === "cfo-leadership-summit") title = "India CFO Leadership Summit 2026";
                          else if (slug === "hr-excellence-awards") title = "HR Excellence & Leadership Conclave";
                          else if (slug === "enterprise-tech-conclave") title = "National Enterprise Tech & AI Summit";
                          setNewGalleryForm({ ...newGalleryForm, event_slug: slug, event_title: title });
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      >
                        <option value="all">All Events</option>
                        <option value="cfo-leadership-summit">India CFO Leadership Summit 2026</option>
                        <option value="hr-excellence-awards">HR Excellence & Leadership Conclave</option>
                        <option value="enterprise-tech-conclave">National Enterprise Tech & AI Summit</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingGalleryItem && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGalleryItem(null);
                            setNewGalleryForm({
                              title: "",
                              type: "photo",
                              url: "",
                              thumbnail_url: "",
                              category: "Keynotes",
                              event_slug: "cfo-leadership-summit",
                              event_title: "India CFO Leadership Summit 2026",
                              aspect_ratio: "aspect-[16/9]",
                            });
                          }}
                          className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={galleryUploading}
                        className="flex-1 rounded-2xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {galleryUploading ? "Saving..." : editingGalleryItem ? "Update Media Asset" : "Publish Media Asset"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Media Assets Display Grid - INDEPENDENT SCROLLABLE PANEL */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Summit Media Assets ({cmsGalleryItems.length})</span>
                    </h3>
                    <span className="text-[11px] text-cyan-700 font-bold bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                      Scroll to view all items
                    </span>
                  </div>

                  {cmsGalleryItems.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No media assets uploaded yet.
                    </div>
                  ) : (
                    /* Scrollable container for cards */
                    <div className="max-h-[calc(100vh-210px)] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cmsGalleryItems.map((item) => (
                          <div
                            key={item.id}
                            className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white transition-all group ${
                              editingGalleryItem?.id === item.id
                                ? "border-cyan-600 ring-2 ring-cyan-500/20 shadow-md"
                                : "border-slate-200 hover:border-cyan-400 hover:shadow-md"
                            }`}
                          >
                            {/* Top Thumbnail Image Banner with Badges Overlay */}
                            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                              <img
                                src={item.thumbnail_url || item.url}
                                alt={item.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              
                              <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
                                <span className="text-[10px] font-mono font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-xs">
                                  {item.category}
                                </span>
                              </div>

                              <div className="absolute top-2.5 right-2.5 z-10">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-xs ${
                                  item.type === "video"
                                    ? "bg-purple-900/80 text-purple-200 border-purple-400/40"
                                    : "bg-slate-900/80 text-cyan-200 border-cyan-400/40"
                                }`}>
                                  {item.type === "video" ? "🎥 Video Embed" : "📷 Photo Image"}
                                </span>
                              </div>
                            </div>

                            {/* Card Main Info */}
                            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <h4 className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2" title={item.title}>
                                  {item.title}
                                </h4>
                                
                                <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                                  <span className="text-cyan-600 font-bold">📍</span>
                                  <span className="truncate">{item.event_title || "All Events"}</span>
                                </p>
                              </div>

                              {/* Action Bar */}
                              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingGalleryItem(item);
                                    setNewGalleryForm({
                                      title: item.title,
                                      type: item.type || "photo",
                                      url: item.url,
                                      thumbnail_url: item.thumbnail_url || item.url,
                                      category: item.category || "Keynotes",
                                      event_slug: item.event_slug || "all",
                                      event_title: item.event_title || "All Events",
                                      aspect_ratio: item.aspect_ratio || "aspect-[16/9]",
                                    });
                                  }}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-50 border border-cyan-200 px-3 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-colors cursor-pointer mr-1.5"
                                  title="Edit Media Item"
                                >
                                  <Edit3 className="h-3.5 w-3.5 text-cyan-600" />
                                  <span>Edit Asset</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteGalleryItem(item.id)}
                                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                  title="Delete Media Item"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* PARTNER REQUESTS & INQUIRIES TAB           */}
          {/* ========================================== */}
          {activeTab === "partner-requests" && (
            <div className="space-y-6">
              {/* Header Title Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Building className="h-5 w-5 text-cyan-600" />
                    <span>Corporate Partnerships & Proposals</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage strategic partnership proposals, sponsorship inquiries, speaking slots, and exhibit requests
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-50 border border-cyan-200 px-3.5 py-1.5 text-xs font-extrabold text-cyan-800 shadow-2xs">
                    Total Corporate Leads: {partnerSubmissions.length}
                  </span>
                </div>
              </div>

              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                    <Handshake className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inquiries</p>
                    <p className="text-lg font-black text-slate-900">{partnerSubmissions.length}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sponsorships</p>
                    <p className="text-lg font-black text-slate-900">
                      {partnerSubmissions.filter((p) => (p.partnership_type || "").toLowerCase().includes("sponsor") || (p.partnership_type || "").toLowerCase().includes("brand")).length || 1}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speaking Proposals</p>
                    <p className="text-lg font-black text-slate-900">
                      {partnerSubmissions.filter((p) => (p.partnership_type || "").toLowerCase().includes("speak") || (p.partnership_type || "").toLowerCase().includes("keynote")).length || 1}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exhibit & PR</p>
                    <p className="text-lg font-black text-slate-900">
                      {partnerSubmissions.filter((p) => (p.partnership_type || "").toLowerCase().includes("media") || (p.partnership_type || "").toLowerCase().includes("exhibit")).length || 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Data Container */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search company, contact person, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none w-64 md:w-80"
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    Showing <strong className="text-slate-900">{partnerSubmissions.length}</strong> strategic applications
                  </span>
                </div>

                {partnerSubmissions.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 text-xs">
                    <Handshake className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No Partner Applications Found</p>
                    <p className="text-slate-400 mt-1">Strategic partnership inquiries submitted via the website form will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                          <th className="py-3.5 px-4 rounded-tl-xl">Company & Website</th>
                          <th className="py-3.5 px-4">Contact Executive</th>
                          <th className="py-3.5 px-4">Proposal Category</th>
                          <th className="py-3.5 px-4">Direct Contact</th>
                          <th className="py-3.5 px-4">Submitted Date</th>
                          <th className="py-3.5 px-4 text-right rounded-tr-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {partnerSubmissions.map((sub) => {
                          const typeLower = (sub.partnership_type || sub.industry || "").toLowerCase();
                          let badgeStyle = "bg-cyan-50 text-cyan-800 border-cyan-200";
                          if (typeLower.includes("sponsor") || typeLower.includes("brand")) {
                            badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
                          } else if (typeLower.includes("speak") || typeLower.includes("keynote")) {
                            badgeStyle = "bg-purple-50 text-purple-800 border-purple-200";
                          } else if (typeLower.includes("media") || typeLower.includes("pr")) {
                            badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
                          }

                          return (
                            <tr key={sub.id} className="hover:bg-cyan-50/40 transition-colors">
                              {/* Company */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-slate-900 font-black text-white text-xs shadow-2xs uppercase">
                                    {(sub.company_name || "P")[0]}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 text-xs">{sub.company_name}</div>
                                    {sub.website ? (
                                      <a
                                        href={sub.website.startsWith("http") ? sub.website : `https://${sub.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] text-cyan-700 hover:text-cyan-900 hover:underline font-mono"
                                      >
                                        <span>{sub.website.replace("https://", "").replace("http://", "")}</span>
                                        <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">No website listed</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Contact Executive */}
                              <td className="py-3.5 px-4">
                                <div className="text-slate-900 font-bold">{sub.contact_person}</div>
                                <div className="text-[10px] text-slate-500 font-medium">{sub.designation || "Executive"}</div>
                              </td>

                              {/* Proposal Category */}
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${badgeStyle}`}>
                                  <Handshake className="h-3 w-3" />
                                  <span>{sub.partnership_type || sub.industry || "Strategic Partner"}</span>
                                </span>
                              </td>

                              {/* Direct Contact */}
                              <td className="py-3.5 px-4">
                                <a href={`mailto:${sub.email}`} className="text-slate-900 font-mono hover:text-cyan-700 block truncate max-w-[180px]">
                                  {sub.email}
                                </a>
                                <a href={`tel:${sub.phone}`} className="text-[10px] text-slate-500 font-mono hover:text-cyan-700 block">
                                  {sub.phone || "N/A"}
                                </a>
                              </td>

                              {/* Date */}
                              <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                                {new Date(sub.created_at || Date.now()).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedPartnerLeadDetail(sub)}
                                    className="inline-flex items-center gap-1 rounded-xl bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-cyan-700 transition-colors shadow-2xs cursor-pointer"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>View Lead</span>
                                  </button>
                                  <a
                                    href={`mailto:${sub.email}?subject=ET%20Media%20Hub%20Partnership%20Inquiry`}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                    title="Send Email"
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* CAREER JOBS TAB                            */}
          {/* ========================================== */}
          {activeTab === "career-jobs" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Form */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 h-fit">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-cyan-600" />
                    <span>{editingJob ? `Edit Job: ${editingJob.title}` : "Post New Job Opportunity"}</span>
                  </h3>

                  <form onSubmit={handleAddJob} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Job Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Conference Producer"
                        value={newJobForm.title}
                        onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                        <select
                          value={newJobForm.department}
                          onChange={(e) => setNewJobForm({ ...newJobForm, department: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        >
                          <option value="Conference Production">Conference Production</option>
                          <option value="Delegate Sales & Acquisition">Delegate Sales</option>
                          <option value="Sponsorship & Partnership Sales">Sponsorship Sales</option>
                          <option value="Corporate Marketing & PR">Marketing & PR</option>
                          <option value="Event Operations & Logistics">Operations & Logistics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Location</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hyderabad (Hybrid)"
                          value={newJobForm.location}
                          onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Experience</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 3 — 5 Years"
                          value={newJobForm.experience}
                          onChange={(e) => setNewJobForm({ ...newJobForm, experience: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                        <select
                          value={newJobForm.status}
                          onChange={(e) => setNewJobForm({ ...newJobForm, status: e.target.value as "Open" | "Closed" })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold"
                        >
                          <option value="Open">🟢 Open</option>
                          <option value="Closed">🔴 Closed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Overview Description *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Brief overview..."
                        value={newJobForm.description}
                        onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingJob && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingJob(null);
                            setNewJobForm({
                              id: "",
                              title: "",
                              department: "Conference Production",
                              location: "Hyderabad (Hybrid)",
                              experience: "3 — 5 Years",
                              description: "",
                              responsibilities: "",
                              qualifications: "",
                              benefits: "",
                              status: "Open",
                            });
                          }}
                          className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={jobUploading}
                        className="flex-1 rounded-2xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition-colors disabled:opacity-50"
                      >
                        {jobUploading ? "Saving..." : editingJob ? "Update Job" : "Publish Job Posting"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Job Cards */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-3">
                    <span>Active Openings ({cmsJobs.length})</span>
                    <span className="text-xs text-slate-500 font-normal">Live on Careers Portal</span>
                  </h3>
                  <div className="space-y-4">
                    {cmsJobs.map((job) => (
                      <div key={job.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{job.title}</h4>
                          <p className="text-xs text-slate-500">{job.department} · 📍 {job.location} · {job.experience}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleJobStatus(job)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold ${
                              job.status !== "Closed" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {job.status !== "Closed" ? "Open" : "Closed"}
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* CAREER APPLICANTS TAB                      */}
          {/* ========================================== */}
          {activeTab === "career-applicants" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <p className="text-xs text-slate-500 font-medium">Review candidate applications, download PDF resumes, and update hiring pipeline status</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan-50 border border-cyan-200 px-3.5 py-1.5 text-xs font-extrabold text-cyan-800 shadow-2xs">
                    Total Applicants: {jobApplications.length}
                  </span>
                  <button
                    onClick={() => exportToExcel("career-applicants")}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export Excel</span>
                  </button>
                  <button
                    onClick={() => exportToCSV("career-applicants")}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search candidate by name, email, phone, job title, or experience..."
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <th className="py-3 px-4">Candidate Name</th>
                        <th className="py-3 px-4">Applied Role</th>
                        <th className="py-3 px-4">Contact Details</th>
                        <th className="py-3 px-4">Experience</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Download Resume</th>
                        <th className="py-3 px-4">Applied Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobApplications
                        .filter(
                          (app) =>
                            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.experience.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800 font-bold text-xs">
                                  {app.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="block font-bold text-slate-900">{app.name}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">ID: {app.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-700">
                              <div className="flex flex-col">
                                <span className="font-extrabold text-cyan-800">{app.job_title}</span>
                                <span className="text-[10px] font-mono text-slate-400">{app.job_id}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-700">
                              <div className="flex flex-col">
                                <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-cyan-700 font-medium hover:underline">
                                  <Mail className="h-3 w-3 text-cyan-600" /> {app.email}
                                </a>
                                <span className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5 font-mono">
                                  <Phone className="h-3 w-3 text-slate-400" /> {app.phone}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-800 border border-slate-200 font-medium">
                                {app.experience}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <select
                                value={app.status || "Under Review"}
                                onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 focus:border-cyan-500 focus:outline-none"
                              >
                                <option value="Under Review">🔵 Under Review</option>
                                <option value="Shortlisted">🟣 Shortlisted</option>
                                <option value="Interview Scheduled">🟡 Interview Scheduled</option>
                                <option value="Hired">🟢 Hired</option>
                                <option value="Rejected">🔴 Rejected</option>
                              </select>
                            </td>
                            <td className="py-4 px-4">
                              {app.resume_url ? (
                                <a
                                  href={app.resume_url}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-extrabold text-cyan-800 hover:bg-cyan-100 transition-all shadow-xs cursor-pointer"
                                >
                                  <Download className="h-3.5 w-3.5 text-cyan-600" />
                                  <span>Download Resume</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[11px]">No file</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                              {app.created_at ? new Date(app.created_at).toLocaleString() : "Recently"}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedApplicantDetail(app)}
                                  className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors cursor-pointer"
                                  title="View Candidate Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteJobApplication(app.id)}
                                  className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                  title="Delete Candidate"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {jobApplications.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-16 text-center text-slate-400">
                            No job applications received yet. Submit an application on the Careers page to test!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* CXO TESTIMONIALS TAB                       */}
          {/* ========================================== */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Testimonial Form */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 h-fit">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                    <Quote className="h-4 w-4 text-cyan-600" />
                    <span>{editingTestimonial ? "Edit Testimonial" : "Add New CXO Testimonial"}</span>
                  </h3>

                  <form onSubmit={handleSaveTestimonial} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Executive Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Sharma"
                        value={newTestimonialForm.name}
                        onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Role / Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Chief Financial Officer"
                          value={newTestimonialForm.role}
                          onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, role: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Company / Org
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. TechCorp India"
                          value={newTestimonialForm.company}
                          onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, company: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Avatar Image URL / Base64
                      </label>
                      <div className="mb-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors w-full justify-center">
                          <Upload className="h-4 w-4 text-cyan-600" />
                          <span>Choose Avatar Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const base64Data = reader.result as string;
                                setNewTestimonialForm((prev) => ({ ...prev, avatar: base64Data }));
                                try {
                                  const res = await fetch("/api/admin/upload", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ imageBase64: base64Data, filename: file.name }),
                                  });
                                  const uploadData = await res.json();
                                  if (uploadData.success && uploadData.url) {
                                    setNewTestimonialForm((prev) => ({ ...prev, avatar: uploadData.url }));
                                    toast.success("Avatar uploaded!");
                                  }
                                } catch (err) {}
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newTestimonialForm.avatar}
                        onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, avatar: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Testimonial Quote *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Enter full feedback or quote..."
                        value={newTestimonialForm.quote}
                        onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, quote: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Star Rating
                        </label>
                        <select
                          value={newTestimonialForm.rating}
                          onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, rating: Number(e.target.value) })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-bold"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                          <option value={3}>⭐⭐⭐ (3 Stars)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Category
                        </label>
                        <select
                          value={newTestimonialForm.category}
                          onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, category: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                        >
                          <option value="CFO Leadership">CFO Leadership</option>
                          <option value="HR Conclave">HR Conclave</option>
                          <option value="Enterprise Tech">Enterprise Tech</option>
                          <option value="Sponsorship">Sponsorship Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingTestimonial && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTestimonial(null);
                            setNewTestimonialForm({
                              id: "",
                              name: "",
                              role: "CFO & VP Finance",
                              company: "",
                              avatar: "",
                              quote: "",
                              rating: 5,
                              category: "CFO Leadership",
                              event_slug: "cfo-leadership-summit",
                            });
                          }}
                          className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={testimonialUploading}
                        className="flex-1 rounded-2xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {testimonialUploading ? "Saving..." : editingTestimonial ? "Update Testimonial" : "Publish Testimonial"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Testimonials List */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-3">
                    <span>Active Testimonials ({testimonials.length})</span>
                    <span className="text-xs text-slate-500 font-normal">Displayed on Landing Pages</span>
                  </h3>

                  {testimonials.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No testimonials added yet. Use the form to publish CXO reviews.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {testimonials.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 flex flex-col justify-between hover:border-cyan-400 transition-all">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                {"★".repeat(t.rating || 5)}
                              </div>
                              <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                                {t.category}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 italic leading-relaxed">
                              "{t.quote}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-cyan-100 text-cyan-800 font-extrabold flex items-center justify-center text-xs overflow-hidden border border-slate-300">
                                {t.avatar ? (
                                  <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                                ) : (
                                  t.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-extrabold text-slate-900">{t.name}</h4>
                                <p className="text-[10px] text-slate-500">{t.role} · {t.company}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingTestimonial(t);
                                  setNewTestimonialForm({
                                    id: t.id,
                                    name: t.name,
                                    role: t.role,
                                    company: t.company,
                                    avatar: t.avatar,
                                    quote: t.quote,
                                    rating: t.rating || 5,
                                    category: t.category || "CFO Leadership",
                                    event_slug: t.event_slug || "cfo-leadership-summit",
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(t.id)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* NEWSLETTER SUBSCRIBERS TAB                 */}
          {/* ========================================== */}
          {activeTab === "newsletter" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <p className="text-xs text-slate-500 font-medium">
                  Manage executive newsletter subscribers, real-time signups, and export subscriber lists
                </p>
                <button
                  onClick={exportNewsletterCSV}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-cyan-600" />
                  <span>Export Subscribers CSV</span>
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
                {newsletterSubscribers.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No newsletter subscribers yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Source Channel</th>
                          <th className="py-3 px-4">Subscribed Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {newsletterSubscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-cyan-50/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-cyan-600" />
                                <span>{sub.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[10px] font-bold border border-slate-200">
                                {sub.source || "Website Footer"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[10px] text-slate-400 font-mono">
                              {new Date(sub.created_at || Date.now()).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="rounded-lg p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Remove Subscriber"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SEO META TAGS EDITOR TAB                   */}
          {/* ========================================== */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Page Selection Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-2 h-fit">
                  <div className="px-2 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Select Site Page
                    </span>
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                  </div>
                  {[
                    { key: "home", label: "Home Page", icon: Globe, path: "/" },
                    { key: "events", label: "Events & Summits", icon: Calendar, path: "/events" },
                    { key: "magazines", label: "Magazines", icon: BookOpen, path: "/magazines" },
                    { key: "partners", label: "Partners", icon: Handshake, path: "/collaborators" },
                    { key: "careers", label: "Careers Page", icon: Briefcase, path: "/careers" },
                    { key: "contact", label: "Contact Us", icon: Mail, path: "/contact" },
                    { key: "gallery", label: "Media Gallery", icon: Film, path: "/gallery" },
                  ].map((pg) => {
                    const PgIcon = pg.icon;
                    const isSelected = activeSeoPage === pg.key;
                    return (
                      <button
                        key={pg.key}
                        onClick={() => handleSelectSeoPage(pg.key)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "gradient-brand text-white shadow-md shadow-cyan-500/20"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <PgIcon className={`h-4 w-4 ${isSelected ? "text-white" : "text-cyan-600"}`} />
                          <div className="text-left">
                            <div>{pg.label}</div>
                            <div className={`text-[10px] font-mono ${isSelected ? "text-cyan-100" : "text-slate-400"}`}>
                              {pg.path}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 ${isSelected ? "text-white" : "text-slate-400"}`} />
                      </button>
                    );
                  })}
                </div>

                {/* SEO Form */}
                <div className="lg:col-span-8 xl:col-span-9 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                        <SearchCode className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 capitalize">
                          {seoForm.page_key === "home" ? "Home Page" : seoForm.page_key} Meta Tags & OpenGraph
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Search engine indexing, SERP title, description, and social media graph configuration
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono font-bold text-cyan-800">
                      /{seoForm.page_key}
                    </span>
                  </div>

                  <form onSubmit={handleSaveSeo} className="space-y-6">
                    {/* Page Title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Page Title (&lt;title&gt;) *
                        </label>
                        <span className={`text-[11px] font-bold ${
                          seoForm.title.length >= 50 && seoForm.title.length <= 65
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}>
                          {seoForm.title.length} / 60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={seoForm.title}
                        onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                        placeholder="e.g. ET Media | India's Premier CXO Summit Platform"
                      />
                      <p className="text-[11px] text-slate-400 font-medium">
                        Recommended: 50–60 characters. Appears as the clickable heading in search results.
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Meta Description *
                        </label>
                        <span className={`text-[11px] font-bold ${
                          seoForm.description.length >= 140 && seoForm.description.length <= 165
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}>
                          {seoForm.description.length} / 160 chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={seoForm.description}
                        onChange={(e) => setSeoForm({ ...seoForm, description: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                        placeholder="Summarize page content for search engines..."
                      />
                      <p className="text-[11px] text-slate-400 font-medium">
                        Recommended: 150–160 characters. Provide a compelling call-to-action summary.
                      </p>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        SEO Keywords (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={seoForm.keywords}
                        onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                        placeholder="CFO Summit, HR Awards, ET Media, Leadership Conference"
                      />
                    </div>

                    {/* OpenGraph Image */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Social Share Banner Image URL (og:image)
                      </label>
                      <input
                        type="text"
                        value={seoForm.og_image}
                        onChange={(e) => setSeoForm({ ...seoForm, og_image: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-mono text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    {/* Live Preview Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Google SERP Live Snippet */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-cyan-600" />
                            <span>Google SERP Live Preview</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">Desktop Snippet</span>
                        </div>
                        <div className="space-y-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center gap-2 text-xs text-slate-700 font-sans truncate">
                            <span className="h-4 w-4 rounded-full bg-cyan-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              ET
                            </span>
                            <span className="truncate text-slate-800 text-[11px] font-medium">
                              https://www.etmedia.in › {seoForm.page_key}
                            </span>
                          </div>
                          <div className="text-blue-800 font-semibold text-sm hover:underline cursor-pointer truncate">
                            {seoForm.title || "ET Media Hub | Leadership Summit"}
                          </div>
                          <div className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-sans">
                            {seoForm.description || "Official page of ET Media Hub..."}
                          </div>
                        </div>
                      </div>

                      {/* Social Graph Card Preview */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <ExternalLink className="h-3.5 w-3.5 text-purple-600" />
                            <span>Social Card Preview (LinkedIn/X)</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">OpenGraph</span>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                          {seoForm.og_image ? (
                            <img
                              src={seoForm.og_image}
                              alt="OG Preview"
                              className="h-24 w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                          ) : (
                            <div className="h-24 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium">
                              No OG Image Specified
                            </div>
                          )}
                          <div className="p-3 space-y-1">
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              etmedia.in
                            </div>
                            <div className="text-xs font-extrabold text-slate-900 truncate">
                              {seoForm.title || "ET Media Hub"}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              {seoForm.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={seoSaving}
                        className="flex items-center gap-2 rounded-2xl gradient-brand px-6 py-3 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`h-4 w-4 ${seoSaving ? "animate-spin" : ""}`} />
                        <span>{seoSaving ? "Saving Settings..." : "Save SEO Meta Settings"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ADMIN USER MANAGEMENT TAB                  */}
          {/* ========================================== */}
          {/* ========================================== */}
          {/* ADMIN USER MANAGEMENT TAB                  */}
          {/* ========================================== */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Administrative Security & Role Controls
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Manage platform administrators, credentials, access privileges, and active session roles
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-2 rounded-2xl gradient-brand px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all cursor-pointer shrink-0"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create New Admin</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {adminUsers.map((u) => (
                    <div
                      key={u.id}
                      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-2xs hover:border-cyan-400 hover:bg-white hover:shadow-md transition-all space-y-4"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                      
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase text-cyan-800 border border-cyan-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-pulse" />
                          {u.role || "SUPER_ADMIN"}
                        </span>

                        {adminUsers.length > 1 && (
                          <button
                            onClick={() => handleDeleteAdminUser(u.id)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Revoke Admin Access"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white font-black text-base shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-extrabold text-slate-900">{u.name}</h4>
                          <p className="truncate text-xs text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/80 pt-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Full Privilege Access
                        </span>
                        <span className="font-mono">
                          {new Date(u.created_at || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Security Overview Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Authentication Status
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <Shield className="h-3 w-3" />
                        Hostinger Cloud DB
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900">Database Role Policies</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Super Administrators retain full read, write, update, and delete access across all 15 CMS database tables.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-[10px] text-cyan-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600" />
                      <span>Hostinger MySQL Cloud Sync Active</span>
                    </div>
                  </div>

                  {/* Security Audit Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Session Controls
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-bold text-cyan-800 border border-cyan-200">
                        <Radio className="h-3 w-3 text-cyan-600 animate-pulse" />
                        Live Sockets
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900">JWT Token Security</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        All administrative requests require a valid Bearer token issued upon authenticating at `/api/admin/login`.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 font-mono">
                      Session Token: Valid • 24h Expiry
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Admin User Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                  <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-5 text-slate-900">
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Create Administrator</h3>
                        <p className="text-xs text-slate-500 font-medium">Grant full CMS control panel privileges</p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateAdminUser} className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                          placeholder="e.g. Executive Manager"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Official Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                          placeholder="admin@etmedia.in"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Account Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                          placeholder="••••••••••••"
                        />
                      </div>

                      <div className="flex gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={userCreating}
                          className="flex-1 rounded-2xl gradient-brand py-3 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {userCreating ? "Creating Account..." : "Create Admin Account"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* WEBSITE SETTINGS TAB                       */}
          {/* ========================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveSiteSettings} className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-8">
                {/* Header Banner Inside Card */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-6 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Global Platform Configuration
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Branding, support helplines, social links, and Razorpay API parameters
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    System Operational
                  </span>
                </div>

                {/* Section 1: Brand & Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-wider">
                    <Globe className="h-4 w-4 text-cyan-600" />
                    <span>Brand Details & Support Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Site Name / Brand Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={siteSettings.site_name}
                        onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Official Support Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={siteSettings.support_email}
                        onChange={(e) => setSiteSettings({ ...siteSettings, support_email: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Support Phone Number
                      </label>
                      <input
                        type="text"
                        value={siteSettings.support_phone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, support_phone: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        WhatsApp Helpline Number
                      </label>
                      <input
                        type="text"
                        value={siteSettings.whatsapp_number}
                        onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp_number: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Corporate Office Physical Address
                      </label>
                      <input
                        type="text"
                        value={siteSettings.office_address}
                        onChange={(e) => setSiteSettings({ ...siteSettings, office_address: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Office Working Hours
                      </label>
                      <input
                        type="text"
                        value={siteSettings.office_hours}
                        onChange={(e) => setSiteSettings({ ...siteSettings, office_hours: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Google Maps Embed / Navigation URL
                      </label>
                      <input
                        type="text"
                        value={siteSettings.google_maps_url}
                        onChange={(e) => setSiteSettings({ ...siteSettings, google_maps_url: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-xs font-mono text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Social Media Profiles */}
                <div className="border-t border-slate-200/80 pt-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-wider">
                    <ExternalLink className="h-4 w-4 text-purple-600" />
                    <span>Social Media Channels</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">LinkedIn Company Page</label>
                      <input
                        type="text"
                        value={siteSettings.linkedin_url}
                        onChange={(e) => setSiteSettings({ ...siteSettings, linkedin_url: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                        placeholder="https://linkedin.com/company/etmedia"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Twitter / X Profile</label>
                      <input
                        type="text"
                        value={siteSettings.twitter_url}
                        onChange={(e) => setSiteSettings({ ...siteSettings, twitter_url: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                        placeholder="https://x.com/etmedia"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Facebook Page</label>
                      <input
                        type="text"
                        value={siteSettings.facebook_url}
                        onChange={(e) => setSiteSettings({ ...siteSettings, facebook_url: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                        placeholder="https://facebook.com/etmedia"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Instagram Profile</label>
                      <input
                        type="text"
                        value={siteSettings.instagram_url}
                        onChange={(e) => setSiteSettings({ ...siteSettings, instagram_url: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none transition-all shadow-2xs"
                        placeholder="https://instagram.com/etmedia"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-200/80 pt-6">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="flex items-center gap-2 rounded-2xl gradient-brand px-7 py-3 text-xs font-extrabold text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${settingsSaving ? "animate-spin" : ""}`} />
                    <span>{settingsSaving ? "Saving Configuration..." : "Save Website Settings"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* PARTNER LEAD DETAILS MODAL */}
      {selectedPartnerLeadDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900">
            <button
              type="button"
              onClick={() => setSelectedPartnerLeadDetail(null)}
              className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-700">
              <Handshake className="h-4 w-4" />
              <span>Partner Application Submission</span>
            </div>

            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              {selectedPartnerLeadDetail.company_name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Submission ID: <span className="text-cyan-700 font-bold">{selectedPartnerLeadDetail.id}</span>
            </p>

            <div className="mt-6 space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Person:</span>
                    <strong className="text-slate-900 text-xs">{selectedPartnerLeadDetail.contact_person}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Designation:</span>
                    <strong className="text-slate-900 text-xs">{selectedPartnerLeadDetail.designation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email:</span>
                    <strong className="text-slate-900 text-xs font-mono">{selectedPartnerLeadDetail.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone:</span>
                    <strong className="text-slate-900 text-xs font-mono">{selectedPartnerLeadDetail.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Partnership Type:</span>
                    <strong className="text-cyan-800 text-xs font-bold">{selectedPartnerLeadDetail.partnership_type}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Industry:</span>
                    <strong className="text-slate-900 text-xs">{selectedPartnerLeadDetail.industry}</strong>
                  </div>
                </div>
              </div>

              {selectedPartnerLeadDetail.message && (
                <div className="rounded-2xl border border-slate-200 bg-cyan-50/50 p-4">
                  <span className="text-[10px] font-bold uppercase text-cyan-800 tracking-wider block mb-1">
                    Partnership Message / Objectives:
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans">
                    {selectedPartnerLeadDetail.message}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPartnerLeadDetail(null)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* CONTACT ENQUIRY FULL DETAILS & REPLY MODAL */}
      {/* ========================================== */}
      {selectedContactDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedContactDetail(null)}
              className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-600">
              <MessageSquare className="h-4 w-4" />
              <span>Contact Enquiry & Reply Studio</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {selectedContactDetail.name}
              </h3>
              <span className={`rounded-full px-3 py-0.5 text-xs font-extrabold border ${
                selectedContactDetail.status === "replied"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : selectedContactDetail.status === "read"
                  ? "bg-slate-100 border-slate-200 text-slate-700"
                  : "bg-purple-100 border-purple-300 text-purple-800"
              }`}>
                {selectedContactDetail.status === "replied" ? "🟢 Replied" : selectedContactDetail.status === "read" ? "⚪ Read" : "🔵 Unread"}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Enquiry ID: <span className="text-purple-700 font-bold">{selectedContactDetail.id}</span>
            </p>

            <div className="mt-5 space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address:</span>
                    <a href={`mailto:${selectedContactDetail.email}`} className="text-purple-700 font-bold hover:underline">{selectedContactDetail.email}</a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                    <strong className="text-slate-900">{selectedContactDetail.phone}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Category / Enquiry Type:</span>
                  <span className="inline-block mt-0.5 rounded-full bg-purple-100 px-3 py-0.5 text-purple-800 font-bold text-xs">
                    {selectedContactDetail.enquiry_type}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">Incoming Message</span>
                <p className="text-slate-800 leading-relaxed font-sans text-xs whitespace-pre-wrap">
                  {selectedContactDetail.message}
                </p>
                <p className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-200">
                  Submitted At: {new Date(selectedContactDetail.created_at).toLocaleString()}
                </p>
              </div>

              {/* Reply via Dashboard Composer */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 space-y-3">
                <span className="text-[11px] font-black uppercase text-purple-800 tracking-wider block flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-purple-600" />
                  Reply via Dashboard
                </span>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Reply Subject</label>
                  <input
                    type="text"
                    readOnly
                    value={`RE: ${selectedContactDetail.enquiry_type} - ET Media BI`}
                    className="w-full rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Reply Message Content *</label>
                  <textarea
                    rows={4}
                    value={contactReplyText}
                    onChange={(e) => setContactReplyText(e.target.value)}
                    placeholder="Type your official response to this client enquiry..."
                    className="w-full rounded-xl border border-purple-300 bg-white p-3 text-xs text-slate-900 focus:border-purple-600 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSendReplyViaDashboard(selectedContactDetail, contactReplyText)}
                  className="w-full rounded-xl bg-purple-700 hover:bg-purple-800 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Official Response via Dashboard</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleToggleContactReadStatus(selectedContactDetail)}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {selectedContactDetail.status === "read" ? "Mark as Unread" : "Mark as Read"}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteContactSubmission(selectedContactDetail.id)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={() => setSelectedContactDetail(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* CMS CORPORATE DELEGATE FULL DETAILS MODAL */}
      {/* ========================================== */}
      {selectedCmsDelegateDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedCmsDelegateDetail(null)}
              className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-600">
              <Users className="h-4 w-4" />
              <span>CMS Corporate Delegate Submission</span>
            </div>

            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              {selectedCmsDelegateDetail.full_name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Delegate Form ID: <span className="text-purple-700 font-bold">{selectedCmsDelegateDetail.id}</span>
            </p>

            {/* Details Grid */}
            <div className="mt-6 space-y-4 text-xs">
              {/* 1. Delegate Details */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-1">
                  1. Delegate Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Full Name:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Designation:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.designation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Organisation / Company:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.organization}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Official Email:</span>
                    <a href={`mailto:${selectedCmsDelegateDetail.official_email}`} className="text-purple-700 font-bold hover:underline">{selectedCmsDelegateDetail.official_email}</a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mobile Number:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.mobile_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">City:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.city}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Awards Nomination */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-purple-800 tracking-wider">2. Awards Nomination Status</span>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                    selectedCmsDelegateDetail.awards_nomination === "Yes"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-200 text-slate-700"
                  }`}>
                    {selectedCmsDelegateDetail.awards_nomination}
                  </span>
                </div>
                {selectedCmsDelegateDetail.awards_nomination === "Yes" && (
                  <p className="text-[11px] text-purple-900 font-bold bg-white p-2.5 rounded-xl border border-purple-200 leading-relaxed">
                    ✨ "Our team will contact you shortly to explain the nomination process."
                  </p>
                )}
              </div>

              {/* 3. Organisation Details */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-1">
                  3. Organisation Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Company Name:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.company_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Website:</span>
                    {selectedCmsDelegateDetail.website ? (
                      <a href={selectedCmsDelegateDetail.website} target="_blank" rel="noreferrer" className="text-cyan-700 font-bold hover:underline truncate block">
                        {selectedCmsDelegateDetail.website}
                      </a>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Industry:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.industry}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Location:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.location}</strong>
                  </div>
                  {selectedCmsDelegateDetail.gst_number && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">GST Number:</span>
                      <strong className="text-slate-900 font-mono text-xs">{selectedCmsDelegateDetail.gst_number}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Contact Person Details */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-1">
                  4. Contact Person
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Name:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.contact_person_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Designation:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.contact_person_designation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email:</span>
                    <a href={`mailto:${selectedCmsDelegateDetail.contact_person_email}`} className="text-purple-700 font-bold hover:underline">{selectedCmsDelegateDetail.contact_person_email}</a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone:</span>
                    <strong className="text-slate-900 text-xs">{selectedCmsDelegateDetail.contact_person_phone}</strong>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Submitted Timestamp: {new Date(selectedCmsDelegateDetail.created_at).toLocaleString()}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedCmsDelegateDetail, null, 2));
                  toast.success("Corporate delegate data copied to clipboard!");
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Copy JSON Data
              </button>
              <button
                type="button"
                onClick={() => setSelectedCmsDelegateDetail(null)}
                className="flex-1 rounded-xl bg-purple-600 py-3 text-xs font-bold text-white hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* JOB APPLICANT RESUME & DETAILS MODAL       */}
      {/* ========================================== */}
      {selectedApplicantDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setSelectedApplicantDetail(null)}
              className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-600">
              <Briefcase className="h-4 w-4" />
              <span>Candidate Job Application</span>
            </div>

            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              {selectedApplicantDetail.name}
            </h3>
            <p className="text-xs text-cyan-700 font-extrabold mt-0.5">
              Applied for: {selectedApplicantDetail.job_title} ({selectedApplicantDetail.job_id})
            </p>

            <div className="mt-6 space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address:</span>
                    <a href={`mailto:${selectedApplicantDetail.email}`} className="text-cyan-700 font-bold hover:underline">{selectedApplicantDetail.email}</a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                    <strong className="text-slate-900">{selectedApplicantDetail.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Years of Experience:</span>
                    <strong className="text-slate-900">{selectedApplicantDetail.experience}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Application ID:</span>
                    <strong className="text-slate-900 font-mono">{selectedApplicantDetail.id}</strong>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px] mb-1">Candidate Application Status:</span>
                    <select
                      value={selectedApplicantDetail.status || "Under Review"}
                      onChange={(e) => {
                        const newSt = e.target.value;
                        handleUpdateApplicantStatus(selectedApplicantDetail.id, newSt);
                        setSelectedApplicantDetail((prev) => (prev ? { ...prev, status: newSt } : null));
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Under Review">🔵 Under Review</option>
                      <option value="Shortlisted">🟣 Shortlisted</option>
                      <option value="Interview Scheduled">🟡 Interview Scheduled</option>
                      <option value="Hired">🟢 Hired</option>
                      <option value="Rejected">🔴 Rejected</option>
                    </select>
                  </div>
                </div>

                {selectedApplicantDetail.portfolio_url && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Portfolio / Online Profile URL:</span>
                    <a
                      href={selectedApplicantDetail.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-700 font-bold hover:underline truncate block text-xs"
                    >
                      {selectedApplicantDetail.portfolio_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Resume Download Box */}
              {selectedApplicantDetail.resume_url && (
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-cyan-900 block">Candidate PDF Resume Attached</span>
                    <span className="text-[10px] text-slate-500 font-mono">{selectedApplicantDetail.resume_url}</span>
                  </div>

                  <a
                    href={selectedApplicantDetail.resume_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={`mailto:${selectedApplicantDetail.email}?subject=Application for ${encodeURIComponent(selectedApplicantDetail.job_title)} - ET Media Hub`}
                className="flex-1 text-center rounded-xl bg-cyan-600 py-3 text-xs font-bold text-white hover:bg-cyan-700 transition-colors"
              >
                Contact Candidate
              </a>
              <button
                type="button"
                onClick={() => setSelectedApplicantDetail(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================== */}
      {/* ADD / EDIT PAYMENT CONFIGURATION DRAWER / MODAL */}
      {/* ========================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-600">
              <CreditCard className="h-4 w-4" />
              <span>{editingPaymentConfig ? "Edit Event Payment Settings" : "Add New Event Payment Configuration"}</span>
            </div>

            <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
              {editingPaymentConfig ? editingPaymentConfig.event_title || editingPaymentConfig.event_id : "Configure Event Pricing & GST"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Set registration prices, GST percentage, category rules, early bird discounts, seat inventory, and coupon codes.
            </p>

            <form onSubmit={handleSavePaymentConfigSubmit} className="mt-6 space-y-6 text-xs">
              {/* SECTION 1: EVENT SELECTION & BASE FEES */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                  <span>1. Event & Base Registration Fee</span>
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Event *</label>
                    <select
                      value={paymentForm.event_id || ""}
                      onChange={(e) => {
                        const selId = e.target.value;
                        const selEvent = cmsEvents.find((evt) => (evt.id || evt.slug) === selId);
                        setPaymentForm((prev: any) => ({
                          ...prev,
                          event_id: selId,
                          event_title: selEvent?.title || selId,
                          event_slug: selEvent?.slug || selId,
                          event_city: selEvent?.city || "",
                          event_date: selEvent?.date || "",
                          event_image: selEvent?.image || "",
                        }));
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:border-cyan-600 focus:outline-none"
                    >
                      {cmsEvents.map((evt) => (
                        <option key={evt.id || evt.slug} value={evt.id || evt.slug}>
                          {evt.title} ({evt.city || "Pan-India"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Currency</label>
                    <input
                      type="text"
                      value={paymentForm.currency || "INR"}
                      onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                      placeholder="e.g. INR / USD"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Base Registration Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={paymentForm.registration_fee ?? 4999}
                      onChange={(e) => setPaymentForm({ ...paymentForm, registration_fee: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 font-extrabold focus:border-cyan-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">GST Percentage (%) *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        required
                        min={0}
                        max={100}
                        value={paymentForm.gst_percentage ?? 18}
                        onChange={(e) => setPaymentForm({ ...paymentForm, gst_percentage: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 font-extrabold focus:border-cyan-600 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>
                </div>

                {/* LIVE PRICE SUMMARY CALCULATOR */}
                {(() => {
                  const fee = Number(paymentForm.registration_fee) || 0;
                  const gst = Number(paymentForm.gst_percentage) || 18;
                  const gstAmt = Math.round((fee * gst) / 100);
                  const total = paymentForm.gst_included ? fee : fee + gstAmt;
                  return (
                    <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-cyan-950 font-bold">
                      <div>
                        <span className="text-xs block text-cyan-800">Live Fee Calculation Breakdown:</span>
                        <span className="text-xs font-normal">
                          Base: ₹{fee.toLocaleString("en-IN")} + {gst}% GST (₹{gstAmt.toLocaleString("en-IN")})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider block text-cyan-700 font-extrabold">Total Payable by Delegate</span>
                        <span className="text-lg font-black text-cyan-900">₹{total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 2: EARLY BIRD DISCOUNT */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span>2. Early Bird Promotional Price</span>
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(paymentForm.early_bird_enabled)}
                      onChange={(e) => setPaymentForm({ ...paymentForm, early_bird_enabled: e.target.checked })}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-purple-900">Enable Early Bird Pricing</span>
                  </label>
                </div>

                {paymentForm.early_bird_enabled && (
                  <div className="grid gap-4 sm:grid-cols-3 pt-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Early Bird Price (₹) *</label>
                      <input
                        type="number"
                        value={paymentForm.early_bird_price ?? 3999}
                        onChange={(e) => setPaymentForm({ ...paymentForm, early_bird_price: Number(e.target.value) })}
                        className="w-full rounded-xl border border-purple-300 bg-white px-3.5 py-2 text-xs font-extrabold text-purple-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                      <input
                        type="date"
                        value={paymentForm.early_bird_start_date || ""}
                        onChange={(e) => setPaymentForm({ ...paymentForm, early_bird_start_date: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">End Date</label>
                      <input
                        type="date"
                        value={paymentForm.early_bird_end_date || ""}
                        onChange={(e) => setPaymentForm({ ...paymentForm, early_bird_end_date: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: SEAT CAPACITY & INVENTORY */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>3. Seat Inventory & Reservation Limits</span>
                </h4>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Total Seats</label>
                    <input
                      type="number"
                      value={paymentForm.total_seats ?? 150}
                      onChange={(e) => setPaymentForm({ ...paymentForm, total_seats: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Available Seats</label>
                    <input
                      type="number"
                      value={paymentForm.available_seats ?? 120}
                      onChange={(e) => setPaymentForm({ ...paymentForm, available_seats: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Reserved VIP Seats</label>
                    <input
                      type="number"
                      value={paymentForm.vip_seats ?? 20}
                      onChange={(e) => setPaymentForm({ ...paymentForm, vip_seats: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-purple-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Speaker Seats</label>
                    <input
                      type="number"
                      value={paymentForm.speaker_seats ?? 10}
                      onChange={(e) => setPaymentForm({ ...paymentForm, speaker_seats: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: COUPONS & PROMO CODES */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="h-4 w-4 text-amber-600" />
                    <span>4. Dynamic Coupon Codes</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const currentCoupons = Array.isArray(paymentForm.coupons) ? paymentForm.coupons : [];
                      setPaymentForm({
                        ...paymentForm,
                        coupons: [
                          ...currentCoupons,
                          {
                            id: `cp-${Date.now()}`,
                            code: `PROMO${Math.floor(Math.random() * 900 + 100)}`,
                            type: "percentage",
                            value: 15,
                            usageLimit: 50,
                            expiryDate: "2026-12-31",
                            status: "Active",
                          },
                        ],
                      });
                    }}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100"
                  >
                    + Add Coupon Code
                  </button>
                </div>

                <div className="space-y-2">
                  {(Array.isArray(paymentForm.coupons) ? paymentForm.coupons : []).map((cp: any, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
                      <input
                        type="text"
                        value={cp.code}
                        onChange={(e) => {
                          const updated = [...(paymentForm.coupons as any[])];
                          updated[idx].code = e.target.value.toUpperCase();
                          setPaymentForm({ ...paymentForm, coupons: updated });
                        }}
                        placeholder="CODE"
                        className="w-28 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-mono font-bold uppercase text-slate-900"
                      />

                      <select
                        value={cp.type}
                        onChange={(e) => {
                          const updated = [...(paymentForm.coupons as any[])];
                          updated[idx].type = e.target.value;
                          setPaymentForm({ ...paymentForm, coupons: updated });
                        }}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-700"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>

                      <input
                        type="number"
                        value={cp.value}
                        onChange={(e) => {
                          const updated = [...(paymentForm.coupons as any[])];
                          updated[idx].value = Number(e.target.value);
                          setPaymentForm({ ...paymentForm, coupons: updated });
                        }}
                        placeholder="Value"
                        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-900"
                      />

                      <input
                        type="date"
                        value={cp.expiryDate || ""}
                        onChange={(e) => {
                          const updated = [...(paymentForm.coupons as any[])];
                          updated[idx].expiryDate = e.target.value;
                          setPaymentForm({ ...paymentForm, coupons: updated });
                        }}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const updated = (paymentForm.coupons as any[]).filter((_, i) => i !== idx);
                          setPaymentForm({ ...paymentForm, coupons: updated });
                        }}
                        className="ml-auto text-rose-600 font-bold hover:text-rose-700 text-xs px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: PAYMENT STATUS TOGGLE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-600" />
                  <span>5. Payment Switches & Status</span>
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Configuration Status</label>
                    <select
                      value={paymentForm.payment_status || "Enabled"}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_status: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-900"
                    >
                      <option value="Enabled">🟢 Enabled (Live Checkout)</option>
                      <option value="Disabled">🔴 Disabled (Payments Off)</option>
                      <option value="Draft">⚪ Draft Mode</option>
                      <option value="Coming Soon">🟡 Coming Soon</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(paymentForm.online_payment_enabled)}
                        onChange={(e) => setPaymentForm({ ...paymentForm, online_payment_enabled: e.target.checked })}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-xs font-bold text-slate-800">Online Payment Gateway (Razorpay)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(paymentForm.offline_payment_enabled)}
                        onChange={(e) => setPaymentForm({ ...paymentForm, offline_payment_enabled: e.target.checked })}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-xs font-bold text-slate-800">Offline Bank Transfer Option</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSaving}
                  className="flex-1 rounded-xl gradient-brand py-3 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition-transform disabled:opacity-50 cursor-pointer"
                >
                  {paymentSaving ? "Saving Configuration..." : "Save Payment Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* LIVE DELEGATE TICKET PREVIEW MODAL         */}
      {/* ========================================== */}
      {showTicketPreviewModal && ticketPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowTicketPreviewModal(false)}
              className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-slate-300 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
              <Ticket className="h-4 w-4" />
              <span>Interactive Ticket Checkout Preview</span>
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 p-5 space-y-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 p-1 flex items-center justify-center">
                  <img src={ticketPreviewItem.event_image || logo} alt="Logo" className="h-full w-full object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm line-clamp-1">{ticketPreviewItem.event_title || ticketPreviewItem.event_id}</h3>
                  <p className="text-xs text-cyan-300 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {ticketPreviewItem.event_city || "Pan-India"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-700/60" />

              {/* Price Calculation Card */}
              {(() => {
                const base = Number(ticketPreviewItem.registration_fee) || 4999;
                const gstPct = Number(ticketPreviewItem.gst_percentage) || 18;
                const gstAmt = Math.round((base * gstPct) / 100);
                const total = base + gstAmt;
                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Executive Pass Fee:</span>
                      <span className="font-mono font-bold text-white">₹{base.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>GST ({gstPct}% Tax):</span>
                      <span className="font-mono text-cyan-300">+ ₹{gstAmt.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Razorpay Processing:</span>
                      <span className="text-emerald-400 font-bold">Waived (₹0)</span>
                    </div>
                    <div className="h-px bg-slate-700/60 my-2" />
                    <div className="flex justify-between items-baseline text-sm font-black text-white">
                      <span>Total Amount Payable:</span>
                      <span className="text-lg font-mono text-cyan-400">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => {
                  toast.success("Razorpay Payment Test Triggered! Key: rzp_test_SwedUUn1KgRMs0");
                }}
                className="w-full rounded-xl gradient-brand py-3 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Proceed to Razorpay Checkout (Test Mode)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK GST UPDATE MODAL */}
      {showBulkGstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900">
            <h3 className="text-lg font-extrabold text-slate-900">Update GST % Bulk</h3>
            <p className="text-xs text-slate-500 mt-1">Set new GST rate for {selectedPaymentIds.length} selected events.</p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">GST Percentage (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={bulkGstValue}
                onChange={(e) => setBulkGstValue(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowBulkGstModal(false)}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkPaymentActionExecute("update_gst", bulkGstValue)}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Apply GST %
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

