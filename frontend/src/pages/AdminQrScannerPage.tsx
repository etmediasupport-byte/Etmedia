import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  SwitchCamera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  UserCheck,
  RotateCcw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Vibrate,
  Sparkles,
  ShieldCheck,
  Calendar,
  Building,
  User,
  Clock,
  Printer,
  X,
  Layers,
  RefreshCw,
  QrCode,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/site/SEOHead";
import logo from "@/assets/UPDATED LOGO.jpeg";

interface Delegate {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  company_name?: string;
  designation?: string;
  event_id?: string;
  event_title?: string;
  pass_name?: string;
  registration_category?: string;
  checkin_status?: string;
  checked_in_at?: string;
  checked_in_by?: string;
  payment_status?: string;
}

interface AttendanceStats {
  total: number;
  checkedIn: number;
  absent: number;
  attendanceRate: number;
  recentCheckins: Delegate[];
}

export default function AdminQrScannerPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("etmedia_admin_token") || "";

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scan result state
  const [scanResult, setScanResult] = useState<{
    status: "success" | "warning" | "error";
    message: string;
    delegate?: Delegate;
    checkedInAt?: string;
    checkedInBy?: string;
    scannedId?: string;
  } | null>(null);

  // Manual search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Delegate[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Stats & events
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [eventsList, setEventsList] = useState<{ id: string; title: string }[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    checkedIn: 0,
    absent: 0,
    attendanceRate: 0,
    recentCheckins: [],
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isCooldownRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize audio feedback via Web Audio API
  const playSound = useCallback((type: "success" | "warning" | "error") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        // High pleasant ding-dong (C6 -> G6)
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, now); // C6
        osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.15); // G6
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "warning") {
        // Two mid alert tones (A4 -> E4)
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // Low buzzer tone
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }, [soundEnabled]);

  // Haptic feedback
  const triggerHaptic = useCallback((pattern: number[]) => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }, []);

  // Fetch Attendance Statistics
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const url = `/api/admin/checkin/stats${selectedEventId !== "all" ? `?eventId=${encodeURIComponent(selectedEventId)}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats({
          total: data.total || 0,
          checkedIn: data.checkedIn || 0,
          absent: data.absent || 0,
          attendanceRate: data.attendanceRate || 0,
          recentCheckins: data.recentCheckins || [],
        });
      }
    } catch (err) {
      console.error("Fetch Stats error:", err);
    }
  }, [token, selectedEventId]);

  // Fetch Events list for filter
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEventsList(
          data.events.map((e: any) => ({
            id: e.slug || e.id,
            title: e.title || e.name || "Executive Summit",
          }))
        );
      }
    } catch (err) {
      console.error("Fetch events error:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchEvents();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchEvents]);

  // Process Scanned ID
  const processCheckin = useCallback(
    async (rawCode: string) => {
      if (!rawCode || isCooldownRef.current) return;
      isCooldownRef.current = true;

      // Extract Pass ID if full URL was scanned
      let cleanId = rawCode.trim();
      const match = cleanId.match(/verify-pass\/([^/?#]+)/i) || cleanId.match(/verify\/([^/?#]+)/i);
      if (match) {
        cleanId = decodeURIComponent(match[1]).trim();
      }
      cleanId = cleanId.replace(/^ETM-GATE[-:]/i, "").replace(/^ETM-PASS[-:#]/i, "").trim();

      toast.info(`Processing Pass: ${cleanId}...`);

      try {
        const res = await fetch("/api/admin/checkin/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            identifier: cleanId,
            eventId: selectedEventId !== "all" ? selectedEventId : undefined,
          }),
        });

        const data = await res.json();

        if (data.success) {
          // New successful check-in
          playSound("success");
          triggerHaptic([120, 50, 120]);
          toast.success(data.message || "✅ Delegate Checked-in Successfully!");
          setScanResult({
            status: "success",
            message: data.message,
            delegate: data.delegate,
            checkedInAt: data.checkedInAt || new Date().toISOString(),
            checkedInBy: data.checkedInBy || "Gate Admin",
            scannedId: cleanId,
          });
          fetchStats();
        } else if (data.alreadyCheckedIn) {
          // Already checked in
          playSound("warning");
          triggerHaptic([200, 100, 200]);
          toast.warning(data.message || "⚠️ Attendee already checked in!");
          setScanResult({
            status: "warning",
            message: data.message,
            delegate: data.delegate,
            checkedInAt: data.checkedInAt,
            checkedInBy: data.checkedInBy,
            scannedId: cleanId,
          });
        } else {
          // Invalid or Not found
          playSound("error");
          triggerHaptic([400]);
          toast.error(data.message || "❌ Invalid Pass ID.");
          setScanResult({
            status: "error",
            message: data.message || "Pass not recognized in system.",
            scannedId: cleanId,
          });
        }
      } catch (err: any) {
        playSound("error");
        toast.error("Network error during check-in verification.");
        setScanResult({
          status: "error",
          message: "Network error connecting to verification server.",
          scannedId: cleanId,
        });
      } finally {
        // Cooldown timer to prevent scanning the same badge repeatedly
        setTimeout(() => {
          isCooldownRef.current = false;
        }, 2200);
      }
    },
    [token, selectedEventId, playSound, triggerHaptic, fetchStats]
  );

  // Initialize and list video cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer environment (back) camera on phones
          const backCam = devices.find(
            (c) =>
              c.label.toLowerCase().includes("back") ||
              c.label.toLowerCase().includes("environment") ||
              c.label.toLowerCase().includes("rear")
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          setCameraPermission("granted");
        } else {
          setCameraPermission("denied");
        }
      })
      .catch((err) => {
        console.warn("Unable to query cameras:", err);
        setCameraPermission("prompt");
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
          });
      }
    };
  }, []);

  // Start Camera Scanning
  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader-qr-viewfinder", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      const cameraIdToUse = selectedCameraId || { facingMode: "environment" };

      await scannerRef.current.start(
        cameraIdToUse,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minDim = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minDim * 0.75),
              height: Math.floor(minDim * 0.75),
            };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          processCheckin(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      setIsScanning(true);
      toast.success("Gate scanner camera active.");
    } catch (err: any) {
      console.error("Camera start error:", err);
      toast.error(err.message || "Failed to start camera. Please allow camera permissions.");
      setIsScanning(false);
    }
  };

  // Stop Camera Scanning
  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
        toast.info("Scanner paused.");
      } catch (err) {
        console.error("Camera stop error:", err);
      }
    }
  };

  // Switch Camera
  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) {
      toast.info("Only one camera detected on this device.");
      return;
    }
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamId = cameras[nextIndex].id;
    setSelectedCameraId(nextCamId);

    if (isScanning && scannerRef.current) {
      await scannerRef.current.stop();
      await scannerRef.current.start(
        nextCamId,
        { fps: 15, qrbox: { width: 250, height: 250 } },
        (decodedText) => processCheckin(decodedText),
        () => {}
      );
      toast.success(`Switched to: ${cameras[nextIndex].label || `Camera ${nextIndex + 1}`}`);
    }
  };

  // Manual Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/checkin/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.delegates || []);
        if (data.delegates?.length === 0) {
          toast.info("No matching attendees found.");
        }
      }
    } catch (err) {
      toast.error("Failed to search attendees.");
    } finally {
      setIsSearching(false);
    }
  };

  // Quick manual check-in from search list
  const handleManualCheckin = async (delegate: Delegate) => {
    await processCheckin(delegate.id);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Undo Check-in
  const handleUndoCheckin = async (regId: string) => {
    if (!window.confirm("Undo check-in for this attendee and mark them as Absent?")) return;
    try {
      const res = await fetch("/api/admin/checkin/undo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ regId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Check-in undone successfully.");
        fetchStats();
        if (scanResult?.delegate?.id === regId) {
          setScanResult(null);
        }
      }
    } catch (err) {
      toast.error("Failed to undo check-in.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/20 pb-20">
      <SEOHead
        title="Admin Gate QR Attendance Scanner | Executive Talks Media"
        description="Official high-speed gate admission and attendance verification scanner for Executive Talks Media B2B leadership summits."
      />

      {/* TOP NAVIGATION & STATUS BAR */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Admin Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="h-5 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <QrCode className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Gate QR Scanner</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Executive Talks Media Summit Check-In & Attendance Desk
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                toast.info(`Audio feedback: ${!soundEnabled ? "Enabled" : "Muted"}`);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
              title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Refresh Stats */}
            <button
              type="button"
              onClick={() => {
                fetchStats();
                toast.success("Attendance stats updated.");
              }}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              title="Refresh stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* EVENT SELECTOR & ATTENDANCE KPI STATS */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <label htmlFor="event-filter" className="text-xs font-black uppercase tracking-wider text-slate-300">
                Filter Event Attendance:
              </label>
            </div>
            <select
              id="event-filter"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-white focus:outline-hidden focus:border-cyan-500"
            >
              <option value="all">All Events & Summits</option>
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Registered */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Total Registered
              </span>
              <div className="text-2xl sm:text-3xl font-black font-display text-white">
                {stats.total.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">Confirmed delegate passes</span>
            </div>

            {/* Checked-In / Present */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block flex items-center justify-between">
                <span>Checked-In (Present)</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </span>
              <div className="text-2xl sm:text-3xl font-black font-display text-emerald-400">
                {stats.checkedIn.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400/70 font-semibold">
                {stats.attendanceRate}% turn-out rate
              </span>
            </div>

            {/* Yet to Arrive / Absent */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block flex items-center justify-between">
                <span>Awaiting Entry</span>
                <Clock className="h-3.5 w-3.5 text-amber-400" />
              </span>
              <div className="text-2xl sm:text-3xl font-black font-display text-amber-400">
                {stats.absent.toLocaleString()}
              </div>
              <span className="text-[11px] text-amber-400/70">Remaining attendees</span>
            </div>

            {/* Live Progress Bar */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-4 space-y-2 flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
                Gate Progress
              </span>
              <div className="space-y-1.5">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, stats.attendanceRate)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>0%</span>
                  <span className="text-cyan-400">{stats.attendanceRate}% Recorded</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SCANNER & MANUAL SEARCH GRID */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* CAMERA VIEWFINDER COLUMN (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Camera className="h-4 w-4 text-cyan-400" />
                  <span>Live Video Viewfinder</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Align delegate's QR code within the scanning frame
                </p>
              </div>

              {cameras.length > 1 && isScanning && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <SwitchCamera className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Switch</span>
                </button>
              )}
            </div>

            {/* SCANNER CONTAINER */}
            <div className="relative aspect-square max-h-[380px] w-full mx-auto rounded-2xl bg-black border-2 border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              <div id="reader-qr-viewfinder" className="w-full h-full object-cover" />

              {!isScanning && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Camera is Paused</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Click below to activate your phone or laptop camera for high-speed gate scanning.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startScanner}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-cyan-500 transition-all cursor-pointer shadow-lg shadow-cyan-600/30"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Start Scanner Camera</span>
                  </button>
                </div>
              )}

              {/* Scanning Crosshair Reticle Animation */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative w-56 h-56 rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden">
                    {/* Animated Laser Scanline */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-bounce" />
                    {/* Corner Reticle Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300" />
                  </div>
                </div>
              )}
            </div>

            {/* SCANNER CONTROLS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isScanning ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                  }`}
                />
                <span>
                  {isScanning
                    ? "Camera Active & Scanning in real-time"
                    : "Camera Idle. Click to start."}
                </span>
              </div>

              {isScanning ? (
                <button
                  type="button"
                  onClick={stopScanner}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                >
                  <CameraOff className="h-3.5 w-3.5" />
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startScanner}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-all cursor-pointer shadow-md"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Start Camera</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SCAN RESULT & MANUAL SEARCH (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. LATEST SCAN RESULT CARD */}
            {scanResult && (
              <div
                className={`rounded-3xl border p-5 sm:p-6 space-y-4 shadow-xl transition-all ${
                  scanResult.status === "success"
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-100"
                    : scanResult.status === "warning"
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-100"
                    : "bg-red-950/30 border-red-500/40 text-red-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {scanResult.status === "success" && (
                      <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    )}
                    {scanResult.status === "warning" && (
                      <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                    )}
                    {scanResult.status === "error" && (
                      <div className="h-10 w-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-sm">
                        <XCircle className="h-6 w-6" />
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                        {scanResult.status === "success"
                          ? "ADMISSION APPROVED"
                          : scanResult.status === "warning"
                          ? "DUPLICATE SCAN NOTICE"
                          : "SCAN ERROR"}
                      </span>
                      <h4 className="text-base font-black text-white">{scanResult.message}</h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setScanResult(null)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Delegate Details If Found */}
                {scanResult.delegate && (
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Delegate Name
                      </span>
                      <strong className="text-sm font-black text-white capitalize block">
                        {scanResult.delegate.name || scanResult.delegate.full_name}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Designation
                        </span>
                        <span className="text-white font-medium block truncate">
                          {scanResult.delegate.designation || "Executive Delegate"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Organization
                        </span>
                        <span className="text-white font-medium block truncate">
                          {scanResult.delegate.organization || scanResult.delegate.company_name || "Enterprise"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Pass Tier
                        </span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                          {scanResult.delegate.pass_name || scanResult.delegate.registration_category || "Delegate"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Pass ID
                        </span>
                        <span className="font-mono text-slate-300 text-[11px] block truncate">
                          {scanResult.delegate.id}
                        </span>
                      </div>
                    </div>

                    {scanResult.checkedInAt && (
                      <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Check-in Time:</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {new Date(scanResult.checkedInAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. MANUAL CHECK-IN & ATTENDEE SEARCH */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Search className="h-4 w-4 text-cyan-400" />
                  <span>Manual Attendee Search</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Search by Name, Mobile, Email, or Pass ID if camera scanning is unavailable.
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter name, phone, or Pass ID..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2 text-xs font-medium text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </form>

              {/* SEARCH RESULTS LIST */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto pt-2 border-t border-slate-800">
                  {searchResults.map((del) => {
                    const isPresent = del.checkin_status?.toLowerCase() === "present";
                    return (
                      <div
                        key={del.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 truncate">
                          <strong className="text-white block font-bold truncate capitalize">
                            {del.name || del.full_name}
                          </strong>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {del.designation} • {del.organization || del.company_name}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 block">
                            {del.id} {del.phone ? `• ${del.phone}` : ""}
                          </span>
                        </div>

                        {isPresent ? (
                          <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Present
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleManualCheckin(del)}
                            className="shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. RECENT GATE CHECK-INS FEED */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <span>Recent Gate Scans</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {stats.recentCheckins.length} recent
                </span>
              </div>

              {stats.recentCheckins.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No attendees checked in yet today. Ready to scan.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {stats.recentCheckins.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-0.5 truncate">
                        <strong className="text-white block font-bold truncate capitalize">
                          {item.name || item.full_name}
                        </strong>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {item.organization || item.company_name || "Corporate Delegate"}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="font-mono text-cyan-400">{item.id}</span>
                          {item.checked_in_at && (
                            <span>
                              •{" "}
                              {new Date(item.checked_in_at).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUndoCheckin(item.id)}
                        className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Undo check-in (revert to Absent)"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
