import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-final.png";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Users,
  Building,
  Calendar,
  BookOpen,
  BarChart3,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleQuickFill = () => {
    setEmail("etmediaworld@gmail.com");
    setPassword("ETMedia@2026");
    toast.info("Admin credentials pre-filled!");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("etmedia_admin_token", data.token);
        localStorage.setItem("etmedia_admin_user", JSON.stringify(data.admin));
        toast.success(`Welcome back, ${data.admin.name}!`);
        navigate("/admin/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans selection:bg-cyan-500/30 selection:text-cyan-900">
      {/* ========================================== */}
      {/* 1. LEFT HERO BRANDING PANEL                */}
      {/* ========================================== */}
      <div className="relative hidden lg:flex w-7/12 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-10 xl:p-14 text-white">
        {/* Ambient Gradient Mesh Background & Dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-600/20 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 h-96 w-96 rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-purple-600/25 blur-[140px] pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-transparent">
              <img src={logo} alt="ET Media Business Intelligence" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <span className="block text-sm font-black tracking-wider text-white font-display">ET Media</span>
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-cyan-400">
                Business Intelligence
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-extrabold text-cyan-300 backdrop-blur-md border border-white/10">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>ENTERPRISE PORTAL</span>
          </div>
        </div>

        {/* Center Main Copy & Features */}
        <div className="relative z-10 my-auto py-10 space-y-8 max-w-2xl">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 block">
              ADMIN PORTAL
            </span>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15] text-white font-display">
              Powering Events. <br />
              Enabling <span className="gradient-brand-text bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Intelligence.</span>
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
              Manage summit delegates, partner enquiries, publications and more — all in one powerful dashboard.
            </p>
          </div>

          {/* 6 Feature Grid Pills */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Users, label: "Delegate Management" },
              { icon: Building, label: "Partner Enquiries" },
              { icon: Calendar, label: "Event Operations" },
              { icon: BookOpen, label: "Content & Publications" },
              { icon: BarChart3, label: "Analytics & Reports" },
              { icon: Shield, label: "Secure Access" },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 leading-snug">{feat.label}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom Stage Banner Graphic */}
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-slate-900/90 to-indigo-950/90 p-5 shadow-2xl backdrop-blur-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block">
                Ideas • People • Opportunities
              </span>
              <h4 className="text-sm font-extrabold text-white">National C-Suite Leadership Summits</h4>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-extrabold text-cyan-200 border border-white/10">
              A Smarter Business Tomorrow
            </div>
          </div>
        </div>

        {/* Bottom Cities Ticker */}
        <div className="relative z-10 pt-4 border-t border-white/10 text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">
          HYDERABAD • BENGALURU • PUNE • MUMBAI • CHENNAI • DELHI • VISAKHAPATNAM • AHMEDABAD • DUBAI • BANGKOK • MALAYSIA • EUROPE
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. RIGHT FORM CONTAINER PANEL              */}
      {/* ========================================== */}
      <div className="relative flex flex-1 flex-col justify-between bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/50 p-6 sm:p-12 lg:p-14 overflow-y-auto">
        {/* Top Right Secure Badge */}
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-md border border-slate-200/80">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Secure Admin Login</span>
          </div>
        </div>

        {/* Center White Form Card */}
        <div className="my-auto mx-auto w-full max-w-md space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-8 sm:p-10 shadow-2xl shadow-slate-900/10 space-y-6">
            {/* Header Logo & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center bg-transparent mb-2">
                <img src={logo} alt="ET Media" className="h-10 w-auto object-contain" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Sign in to manage summit delegates, partner enquiries, and intelligence operations.
              </p>
            </div>

            {/* Default credentials quick-fill trigger */}
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-3.5 text-xs flex items-center justify-between">
              <div>
                <span className="font-extrabold text-cyan-900 block">Default Credentials</span>
                <span className="text-[11px] font-mono text-slate-600">etmediaworld@gmail.com</span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="flex items-center gap-1 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-cyan-700 transition-colors cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Auto-fill</span>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="etmediaworld@gmail.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-11 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="font-extrabold text-cyan-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="gradient-brand mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Secure Footer Subtext */}
            <div className="pt-2 text-center text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Your data is secure and encrypted</span>
            </div>
          </div>
        </div>

        {/* Bottom Quote Note */}
        <div className="text-center text-xs text-slate-500 font-medium">
          "Connecting Ideas. Creating Opportunities." — <strong className="text-slate-800 font-extrabold">ET Media</strong>
        </div>
      </div>
    </div>
  );
}
