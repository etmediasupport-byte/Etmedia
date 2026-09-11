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
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="relative flex min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-300">
      <GlowBackdrop />

      {/* ========================================== */}
      {/* 1. LEFT SIDEBAR CONTAINER                  */}
      {/* ========================================== */}

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-white/10 bg-slate-900/90 p-5 backdrop-blur-2xl transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white px-3 py-1.5 shadow-md">
                <img src={logo} alt="ET Media" className="h-6 w-auto object-contain" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">ET Media Hub</h2>
                <p className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
                  Admin Control Center
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-px w-full bg-white/10" />

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
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold transition-all ${
                    isActive
                      ? "gradient-brand text-white shadow-lg shadow-cyan-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive ? "bg-white/20 text-white" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
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
        <div className="space-y-3 pt-6 border-t border-white/10">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 font-bold text-cyan-300">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">
                  {adminUser?.name || "Super Admin"}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {adminUser?.email || "etmediaworld@gmail.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
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
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-lg font-bold text-white tracking-tight capitalize">
                {activeTab.replace("-", " ")}
              </h1>
              <p className="text-xs text-slate-400">
                ET Media Business Intelligence Executive Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Socket Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 font-semibold">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>Sockets: {stats.activeLiveUsers} Online</span>
            </div>

            {/* Quick Export Button */}
            {(activeTab === "registrations" || activeTab === "contacts") && (
              <button
                onClick={() => exportToCSV(activeTab as "registrations" | "contacts")}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition-transform hover:scale-105"
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
                <div className="group rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-cyan-500/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Total Delegates
                    </span>
                    <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-white">
                    {stats.totalRegistrations}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Database className="h-3 w-3 text-cyan-400" />
                    Stored in Laragon MySQL
                  </p>
                </div>

                <div className="group rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-purple-500/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Contact Messages
                    </span>
                    <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-white">
                    {stats.totalContacts}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Partner & sponsorship enquiries</p>
                </div>

                <div className="group rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Live Connections
                    </span>
                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-white">
                    {stats.activeLiveUsers}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Real-time WebSocket Sync
                  </p>
                </div>

                <div className="group rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-blue-500/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      MySQL Database
                    </span>
                    <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
                      <Server className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xl font-bold text-white truncate">
                    etmedia_db
                  </div>
                  <p className="mt-1 text-xs text-slate-400">127.0.0.1:3306 (Laragon)</p>
                </div>
              </div>

              {/* Two Column Section */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Registrations Card */}
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-base font-bold text-white">Recent Delegate Registrations</h3>
                      <p className="text-xs text-slate-400">Latest delegates registered on ET Media</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("registrations")}
                      className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      <span>View All</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 divide-y divide-white/5">
                    {registrations.slice(0, 5).map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 font-bold text-cyan-300 text-sm">
                            {reg.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{reg.name}</p>
                            <p className="text-xs text-slate-400">
                              {reg.designation} at <span className="text-slate-300">{reg.organization}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[11px] font-mono text-cyan-300">
                            {reg.event_id}
                          </span>
                          <p className="mt-1 text-[10px] text-slate-500 font-mono">
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
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl">
                  <h3 className="text-base font-bold text-white pb-4 border-b border-white/10">
                    System Architecture
                  </h3>

                  <div className="mt-4 space-y-4 text-xs">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Database className="h-4 w-4 text-cyan-400" />
                        <span>Laragon MySQL Engine</span>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Radio className="h-4 w-4 text-purple-400" />
                        <span>Socket.IO Engine</span>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        Connected
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <span>Server Uptime</span>
                      </div>
                      <span className="font-mono text-slate-200">
                        {Math.floor(stats.serverUptime / 60)}m {stats.serverUptime % 60}s
                      </span>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                      <p className="font-semibold text-cyan-300">MySQL Auto-Sync Active</p>
                      <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
                        All delegate registrations and contact form submissions are persisted directly to Laragon MySQL table <code className="text-white">etmedia_db</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGISTRATIONS TAB */}
          {activeTab === "registrations" && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search delegates by name, email, organization, or event..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Showing <strong className="text-white">{filteredRegistrations.length}</strong> records</span>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Delegate Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Organization</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Event ID</th>
                      <th className="py-3 px-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                              {reg.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{reg.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-slate-200">
                              <Mail className="h-3 w-3 text-cyan-400" /> {reg.email}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                              <Phone className="h-3 w-3 text-slate-500" /> {reg.phone}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-slate-200 border border-white/5">
                            <Building className="h-3 w-3 text-purple-400" />
                            {reg.organization}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <Briefcase className="h-3 w-3 text-slate-400" />
                            {reg.designation}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 font-mono text-[11px] text-cyan-300">
                            {reg.event_id}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(reg.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {filteredRegistrations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-500">
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
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contact enquiries..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Sender</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredContacts.map((con) => (
                      <tr key={con.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs">
                              {con.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{con.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex flex-col">
                            <span className="text-slate-200">{con.email}</span>
                            <span className="text-slate-400 text-[11px]">{con.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-purple-300 font-medium">
                            {con.enquiry_type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-300 max-w-sm">
                          <p className="line-clamp-2 leading-relaxed">{con.message}</p>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(con.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}

                    {filteredContacts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-500">
                          No contact form submissions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {staticEvents.map((evt) => (
                <div
                  key={evt.slug}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl space-y-4"
                >
                  <div className="relative h-44 overflow-hidden rounded-2xl">
                    <img src={evt.image} alt={evt.title} className="h-full w-full object-cover" />
                    <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold text-cyan-300 backdrop-blur-md">
                      {evt.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{evt.title}</h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>📍 {evt.city}</span>
                    <span>📅 {evt.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DATABASE TAB */}
          {activeTab === "database" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                  <div className="rounded-2xl bg-cyan-500/10 p-4 text-cyan-400">
                    <Database className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Laragon MySQL Engine</h2>
                    <p className="text-xs text-slate-400">Local MySQL Server Connection Specifications</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                  <div className="rounded-2xl bg-slate-950/60 p-4 border border-white/5 space-y-1">
                    <span className="text-slate-400">Host Address</span>
                    <p className="text-sm font-mono font-bold text-white">127.0.0.1:3306</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/60 p-4 border border-white/5 space-y-1">
                    <span className="text-slate-400">Database Name</span>
                    <p className="text-sm font-mono font-bold text-white">etmedia_db</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950/60 p-4 border border-white/5 space-y-1">
                    <span className="text-slate-400">Active Tables</span>
                    <p className="text-sm font-mono font-bold text-white">admins, registrations, contacts</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
