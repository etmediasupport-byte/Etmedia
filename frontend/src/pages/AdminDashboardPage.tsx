import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlowBackdrop } from "@/components/site/primitives";
import logo from "@/assets/logo.jpeg";
import { socket } from "@/lib/socket";
import { events as staticEvents } from "@/lib/site-data";
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
} from "lucide-react";
import { toast } from "sonner";

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  event_id: string;
  created_at: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  enquiry_type: string;
  message: string;
  created_at: string;
}

type TabType = "overview" | "registrations" | "contacts" | "events" | "database";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalContacts: 0,
    activeLiveUsers: 0,
    serverUptime: 0,
    databaseStatus: "Laragon MySQL Connected",
  });

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [cmsEvents, setCmsEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [eventForm, setEventForm] = useState<{
    title: string;
    category: string;
    description: string;
    image: string;
    speakers: number;
    status: string;
    is_featured: boolean;
    locations: { city: string; venue: string; date: string; time: string }[];
  }>({
    title: "",
    category: "Conference & Leadership",
    description: "",
    image: "/assets/event-cfo-BjslOJNi.jpg",
    speakers: 20,
    status: "published",
    is_featured: false,
    locations: [
      {
        city: "Mumbai",
        venue: "The St. Regis Mumbai",
        date: new Date().toISOString().split("T")[0],
        time: "09:00 AM — 06:00 PM",
      },
    ],
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

    socket.on("live_users_update", onLiveUsers);
    socket.on("new_registration", onNewRegistration);
    socket.on("new_contact_enquiry", onNewEnquiry);

    return () => {
      socket.off("live_users_update", onLiveUsers);
      socket.off("new_registration", onNewRegistration);
      socket.off("new_contact_enquiry", onNewEnquiry);
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("etmedia_admin_token");
    localStorage.removeItem("etmedia_admin_user");
    toast.success("Logged out successfully.");
    navigate("/admin/login");
  };

  // CSV Export Handler
  const exportToCSV = (type: "registrations" | "contacts") => {
    if (type === "registrations") {
      if (registrations.length === 0) {
        toast.error("No registrations to export.");
        return;
      }
      const headers = ["ID", "Name", "Email", "Phone", "Organization", "Designation", "Event ID", "Date"];
      const rows = registrations.map((r) => [
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
      link.setAttribute("download", `et_media_delegates_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exported delegate registrations to CSV!");
    } else {
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

  // --- MULTI-LOCATION SLOT HANDLERS ---
  const handleAddLocationSlot = () => {
    setEventForm((prev) => ({
      ...prev,
      locations: [
        ...prev.locations,
        { city: "", venue: "", date: new Date().toISOString().split("T")[0], time: "09:00 AM — 06:00 PM" },
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
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, locations: updated };
    });
  };

  // --- EVENT CMS CRUD HANDLERS ---
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: "",
      category: "Conference & Leadership",
      description: "",
      image: "/assets/event-cfo-BjslOJNi.jpg",
      speakers: 20,
      status: "published",
      is_featured: false,
      locations: [
        {
          city: "Mumbai",
          venue: "The St. Regis Mumbai",
          date: new Date().toISOString().split("T")[0],
          time: "09:00 AM — 06:00 PM",
        },
      ],
    });
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: any) => {
    setEditingEvent(evt);
    let parsedLocations: any[] = [];
    try {
      if (typeof evt.locations === "string") {
        parsedLocations = JSON.parse(evt.locations);
      } else if (Array.isArray(evt.locations)) {
        parsedLocations = evt.locations;
      }
    } catch (e) {
      parsedLocations = [];
    }

    if (!parsedLocations || parsedLocations.length === 0) {
      parsedLocations = [
        {
          city: evt.city || "Mumbai",
          venue: evt.venue || "",
          date: evt.date || new Date().toISOString().split("T")[0],
          time: evt.time || "09:00 AM — 06:00 PM",
        },
      ];
    }

    setEventForm({
      title: evt.title,
      category: evt.category,
      description: evt.description,
      image: evt.image || "/assets/event-cfo-BjslOJNi.jpg",
      speakers: evt.speakers || 20,
      status: evt.status || "published",
      is_featured: evt.is_featured === 1 || evt.is_featured === true,
      locations: parsedLocations,
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

    const primaryLoc = eventForm.locations[0] || { city: "Mumbai", venue: "The St. Regis Mumbai", date: new Date().toISOString().split("T")[0], time: "09:00 AM — 06:00 PM" };
    
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
      image: eventForm.image.trim() || "/assets/event-cfo-BjslOJNi.jpg",
      city: primaryLoc.city.trim(),
      venue: primaryLoc.venue.trim() || `${primaryLoc.city} Main Convention Center`,
      date: primaryLoc.date,
      time: primaryLoc.time || "09:00 AM — 06:00 PM",
      locations: JSON.stringify(eventForm.locations),
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

  const filteredRegistrations = registrations.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.event_id.toLowerCase().includes(searchQuery.toLowerCase())
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
    { id: "overview", label: "Overview & Analytics", icon: LayoutDashboard },
    { id: "registrations", label: "Delegate Registrations", icon: Users, count: registrations.length },
    { id: "contacts", label: "Contact Messages", icon: MessageSquare, count: contacts.length },
    { id: "events", label: "Events Directory", icon: Calendar },
    { id: "database", label: "Laragon MySQL Engine", icon: Database },
  ];

  return (
    <div className="relative flex min-h-screen bg-slate-100 text-slate-800 selection:bg-cyan-500/30 selection:text-cyan-900 font-sans">
      <GlowBackdrop />

      {/* ========================================== */}
      {/* 1. LEFT SIDEBAR CONTAINER                  */}
      {/* ========================================== */}

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200 bg-white p-5 shadow-sm transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-slate-50 p-1.5 border border-slate-200 shadow-sm">
                <img src={logo} alt="ET Media" className="h-6 w-auto object-contain" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-wide">ET Media Hub</h2>
                <p className="text-[11px] text-cyan-700 font-extrabold uppercase tracking-wider">
                  Admin Control Center
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-px w-full bg-slate-200" />

          {/* Navigation Links */}
          <nav className="space-y-1.5">
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
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                    isActive
                      ? "gradient-brand text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
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
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 font-bold text-cyan-800">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">
                  {adminUser?.name || "Super Admin"}
                </p>
                <p className="truncate text-[11px] text-slate-500 font-medium">
                  {adminUser?.email || "etmediaworld@gmail.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-600" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight capitalize">
                {activeTab.replace("-", " ")}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                ET Media Business Intelligence Executive Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Socket Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 font-bold">
              <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>Sockets: {stats.activeLiveUsers} Online</span>
            </div>

            {/* Quick Export Button */}
            {(activeTab === "registrations" || activeTab === "contacts") && (
              <button
                onClick={() => exportToCSV(activeTab as "registrations" | "contacts")}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-xs font-bold text-cyan-800 transition-transform hover:scale-105"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-cyan-400 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total Delegates
                    </span>
                    <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-slate-900">
                    {stats.totalRegistrations}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Database className="h-3 w-3 text-cyan-600" />
                    Stored in Laragon MySQL
                  </p>
                </div>

                <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-purple-400 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Contact Messages
                    </span>
                    <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-slate-900">
                    {stats.totalContacts}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Partner & sponsorship enquiries</p>
                </div>

                <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-400 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Live Connections
                    </span>
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-slate-900">
                    {stats.activeLiveUsers}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Real-time WebSocket Sync
                  </p>
                </div>

                <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      MySQL Database
                    </span>
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                      <Server className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xl font-bold text-slate-900 truncate">
                    etmedia_db
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium">127.0.0.1:3306 (Laragon)</p>
                </div>
              </div>

              {/* Two Column Section */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Registrations Card */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Recent Delegate Registrations</h3>
                      <p className="text-xs text-slate-500">Latest delegates registered on ET Media</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("registrations")}
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

                {/* System Status Panel */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-200">
                    System Architecture
                  </h3>

                  <div className="mt-4 space-y-4 text-xs">
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
                        All delegate registrations and contact form submissions are persisted directly to Laragon MySQL table <code className="text-slate-900 font-bold">etmedia_db</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGISTRATIONS TAB */}
          {activeTab === "registrations" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search delegates by name, email, organization, or event..."
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Showing <strong className="text-slate-900">{filteredRegistrations.length}</strong> records</span>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Delegate Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Organization</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Event ID</th>
                      <th className="py-3 px-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800 font-bold text-xs">
                              {reg.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{reg.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-700">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-slate-900 font-medium">
                              <Mail className="h-3 w-3 text-cyan-600" /> {reg.email}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                              <Phone className="h-3 w-3 text-slate-400" /> {reg.phone}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-800 border border-slate-200 font-medium">
                            <Building className="h-3 w-3 text-purple-600" />
                            {reg.organization}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                            <Briefcase className="h-3 w-3 text-slate-400" />
                            {reg.designation}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-1 font-mono text-[11px] text-cyan-800 font-bold">
                            {reg.event_id}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(reg.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {filteredRegistrations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-400">
                          No registrations found for "{searchQuery}".
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
                    placeholder="Search contact enquiries..."
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Sender</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContacts.map((con) => (
                      <tr key={con.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-800 font-bold text-xs">
                              {con.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{con.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-700">
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-medium">{con.email}</span>
                            <span className="text-slate-500 text-[11px]">{con.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-purple-800 font-bold">
                            {con.enquiry_type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-700 max-w-sm">
                          <p className="line-clamp-2 leading-relaxed">{con.message}</p>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(con.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {filteredContacts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-400">
                          No contact form submissions found.
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Events Management CMS</span>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs text-cyan-800 font-bold border border-cyan-200">
                      {cmsEvents.length} Total
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Control public upcoming event listings, publish/draft statuses, featured cards, and multi-city schedules.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddEvent}
                  className="flex items-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Add New Event</span>
                </button>
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

          {/* DATABASE TAB */}
          {activeTab === "database" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                  <div className="rounded-2xl bg-cyan-50 p-4 text-cyan-600">
                    <Database className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Laragon MySQL Engine</h2>
                    <p className="text-xs text-slate-500 font-medium">Local MySQL Server Connection Specifications</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-1">
                    <span className="text-slate-500">Host Address</span>
                    <p className="text-sm font-mono font-bold text-slate-900">127.0.0.1:3306</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-1">
                    <span className="text-slate-500">Database Name</span>
                    <p className="text-sm font-mono font-bold text-slate-900">etmedia_db</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-1">
                    <span className="text-slate-500">Active Tables</span>
                    <p className="text-sm font-mono font-bold text-slate-900">admins, registrations, contacts, events</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================== */}
      {/* RIGHT SIDE CONTAINER DRAWER (CREATE / EDIT)*/}
      {/* ========================================== */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setEventModalOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
          />

          {/* Right-Side Container Panel */}
          <aside className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white border-l border-slate-200 shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800 shadow-xs">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display">
                    {editingEvent ? "Edit Event Record" : "Add New Dynamic Event"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Right-Side Executive CMS Panel • Publishes dynamically to MySQL
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

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEvent} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Basic Details */}
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
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
                  >
                    <option value="published">Published (Visible on Homepage)</option>
                    <option value="draft">Draft (Admin Only)</option>
                  </select>
                </div>

                {/* Banner Image & Live Preview Box */}
                <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-slate-700 font-bold">
                    Banner Image (Upload File or Enter Image URL) *
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2 items-start">
                    {/* Upload button & URL input */}
                    <div className="space-y-3">
                      <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-dashed border-cyan-400 bg-cyan-50/80 px-4 py-3 text-cyan-800 font-bold hover:bg-cyan-100 transition-all shadow-xs">
                        <Upload className="h-4 w-4" />
                        <span>{uploadingImage ? "Uploading Image..." : "Upload Image Banner File"}</span>
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
                        placeholder="Or paste image URL e.g. /assets/event-cfo-BjslOJNi.jpg"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none font-mono text-[11px]"
                      />
                    </div>

                    {/* Live Image Preview Container */}
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

              {/* Multiple Locations & Event Dates Section */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-cyan-600" />
                      <span>Event Schedules & Locations (Multiple Locations Supported)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Add multiple city locations, dates (with date picker), venues, and timings for rotating summits.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddLocationSlot}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-all shadow-xs"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>+ Add Location Slot</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {eventForm.locations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-bold text-cyan-800 text-xs flex items-center gap-1.5">
                          <span>Location Slot #{idx + 1}</span>
                          {idx === 0 && (
                            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] text-cyan-800 font-bold border border-cyan-200">
                              Primary Location
                            </span>
                          )}
                        </span>

                        {eventForm.locations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLocationSlot(idx)}
                            className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            City / Location *
                          </label>
                          <input
                            type="text"
                            required
                            value={loc.city}
                            onChange={(e) => handleUpdateLocationSlot(idx, "city", e.target.value)}
                            placeholder="e.g. Mumbai"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Event Date (Date Picker) *
                          </label>
                          <input
                            type="date"
                            required
                            value={loc.date}
                            onChange={(e) => handleUpdateLocationSlot(idx, "date", e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Timing *
                          </label>
                          <input
                            type="text"
                            required
                            value={loc.time}
                            onChange={(e) => handleUpdateLocationSlot(idx, "time", e.target.value)}
                            placeholder="e.g. 09:00 AM — 06:00 PM"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-slate-700 font-bold mb-1">
                            Venue Address / Hotel *
                          </label>
                          <input
                            type="text"
                            required
                            value={loc.venue}
                            onChange={(e) => handleUpdateLocationSlot(idx, "venue", e.target.value)}
                            placeholder="e.g. The St. Regis Mumbai, Lower Parel"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Short Description *</label>
                <textarea
                  required
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Brief summary of event agendas, themes, and executive speakers..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Featured Checkbox & Sticky Footer Submit */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 sticky bottom-0 bg-white py-3">
                <label className="relative flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={eventForm.is_featured}
                    onChange={(e) => setEventForm({ ...eventForm, is_featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="font-bold text-slate-900">Mark as Featured Event Card</span>
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
    </div>
  );
}

