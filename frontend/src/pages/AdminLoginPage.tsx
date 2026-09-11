import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlowBackdrop } from "@/components/site/primitives";
import logo from "@/assets/logo.jpeg";
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-300">
      <GlowBackdrop />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Banner */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 shadow-lg">
            <img src={logo} alt="ET Media" className="h-8 w-auto object-contain" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Executive Admin Portal
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage delegates, events and intelligence reports.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Quick-fill credential banner */}
          <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Default Admin Credentials</span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="flex items-center gap-1.5 rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950 transition-transform hover:scale-105"
              >
                <KeyRound className="h-3 w-3" />
                Auto-fill
              </button>
            </div>
            <div className="mt-2 space-y-1 font-mono text-slate-300">
              <p>Email: <span className="text-white font-semibold">etmediaworld@gmail.com</span></p>
              <p>Password: <span className="text-white font-semibold">ETMedia@2026</span></p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="etmediaworld@gmail.com"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gradient-brand mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          ET Media Business Intelligence Database Connected via Laragon MySQL
        </div>
      </div>
    </div>
  );
}
