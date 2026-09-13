import React, { useEffect, useRef, useCallback, useState } from "react";
import createGlobe from "cobe";

export interface InteractiveMarker {
  id: string;
  location: [number, number];
  name: string;
  users: number;
}

interface GlobeInteractiveProps {
  markers?: InteractiveMarker[];
  className?: string;
  speed?: number;
  isDark?: boolean;
}

export const defaultEtMediaMarkers: InteractiveMarker[] = [
  { id: "hyderabad", location: [17.385, 78.486], name: "HYDERABAD (HQ)", users: 15000 },
  { id: "bengaluru", location: [12.971, 77.594], name: "BENGALURU", users: 12000 },
  { id: "mumbai", location: [19.076, 72.877], name: "MUMBAI", users: 10000 },
  { id: "delhi", location: [28.613, 77.209], name: "DELHI NCR", users: 9000 },
  { id: "chennai", location: [13.082, 80.270], name: "CHENNAI", users: 8000 },
  { id: "pune", location: [18.520, 73.856], name: "PUNE", users: 6000 },
  { id: "ahmedabad", location: [23.022, 72.571], name: "AHMEDABAD", users: 5000 },
  { id: "vizag", location: [17.686, 83.218], name: "VIZAG", users: 4000 },
  { id: "dubai", location: [25.204, 55.270], name: "DUBAI", users: 5000 },
  { id: "bangkok", location: [13.756, 100.501], name: "BANGKOK", users: 4000 },
  { id: "malaysia", location: [3.139, 101.686], name: "MALAYSIA", users: 3500 },
  { id: "europe", location: [51.507, -0.127], name: "EUROPE", users: 3000 },
];

export function GlobeInteractive({
  markers = defaultEtMediaMarkers,
  className = "",
  speed = 0.003,
  isDark = false,
}: GlobeInteractiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);
  const [selectedMarker, setSelectedMarker] = useState<InteractiveMarker | null>(defaultEtMediaMarkers[0] || null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0) return;
      if (globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: isDark ? 1 : 0,
        diffuse: isDark ? 1.2 : 1.6,
        mapSamples: 20000,
        mapBrightness: isDark ? 6 : 10,
        baseColor: isDark ? [0.06, 0.12, 0.22] : [1, 1, 1],
        markerColor: [0.0, 0.68, 0.93], // Cyan #00AEEF
        glowColor: isDark ? [0.0, 0.68, 0.93] : [0.9, 0.94, 0.98],
        markerElevation: 0.04,
        markers: markers.map((m) => ({
          location: m.location,
          size: m.id === "hyderabad" ? 0.06 : 0.045,
        })),
        arcs: [
          { from: [17.385, 78.486], to: [25.204, 55.270] },
          { from: [17.385, 78.486], to: [13.756, 100.501] },
          { from: [17.385, 78.486], to: [51.507, -0.127] },
          { from: [17.385, 78.486], to: [12.971, 77.594] },
          { from: [17.385, 78.486], to: [19.076, 72.877] },
        ],
        arcColor: [0.0, 0.68, 0.93],
        arcWidth: 0.7,
        arcHeight: 0.35,
        opacity: 0.95,
      });

      function animate() {
        if (!isPausedRef.current) phi += speed;
        const currentPhi = phi + phiOffsetRef.current + dragOffset.current.phi;
        const currentTheta = 0.2 + thetaOffsetRef.current + dragOffset.current.theta;

        globe!.update({
          phi: currentPhi,
          theta: currentTheta,
        });

        // Calculate 3D to 2D projection for markers so labels float accurately on canvas
        markers.forEach((m) => {
          const el = labelRefs.current[m.id];
          if (!el) return;

          const radLat = (m.location[0] * Math.PI) / 180;
          const radLng = (m.location[1] * Math.PI) / 180;

          const x0 = Math.cos(radLat) * Math.sin(radLng + currentPhi);
          const y0 = Math.sin(radLat);
          const z0 = Math.cos(radLat) * Math.cos(radLng + currentPhi);

          const y1 = y0 * Math.cos(currentTheta) - z0 * Math.sin(currentTheta);
          const z1 = y0 * Math.sin(currentTheta) + z0 * Math.cos(currentTheta);

          if (z1 > 0.15) {
            const left = 50 + x0 * 40;
            const top = 50 - y1 * 40;
            const opacity = Math.min(1, (z1 - 0.15) * 3);
            el.style.left = `${left}%`;
            el.style.top = `${top}%`;
            el.style.opacity = `${opacity}`;
            el.style.transform = `translate(-50%, -100%) scale(${0.8 + z1 * 0.25})`;
            el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
          } else {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
          }
        });

        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => canvas && (canvas.style.opacity = "1"), 200);
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if ((entries[0]?.contentRect.width ?? 0) > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed, isDark]);

  return (
    <div className={`relative aspect-square select-none w-full max-w-[440px] mx-auto ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />

      {/* Floating 3D City Labels for Primary Key Hubs */}
      {markers
        .filter((m) => ["hyderabad", "europe", "dubai", "delhi"].includes(m.id) || selectedMarker?.id === m.id)
        .map((m) => (
          <div
            key={m.id}
            ref={(el) => {
              labelRefs.current[m.id] = el;
            }}
            onClick={() => setSelectedMarker(m)}
            className="absolute z-20 flex flex-col items-center pointer-events-auto cursor-pointer transition-shadow duration-200"
            style={{
              opacity: 0,
              transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
            }}
          >
            <div
              className={
                isDark
                  ? "flex items-center gap-1.5 rounded-full border border-cyan-400/50 bg-[#041a33]/90 px-2.5 py-1 text-[11px] font-extrabold text-cyan-300 shadow-[0_4px_15px_rgba(0,174,239,0.3)] backdrop-blur-md hover:bg-cyan-500/20 hover:border-cyan-400"
                  : "flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-slate-900 shadow-md backdrop-blur-md hover:bg-cyan-50 hover:border-cyan-500"
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-btn tracking-wide uppercase">{m.name}</span>
            </div>
          </div>
        ))}

      {/* Selected Location Card Below Canvas */}
      {selectedMarker && (
        <div className={
          isDark
            ? "absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-cyan-500/40 bg-[#041930]/95 px-4 py-2 shadow-2xl backdrop-blur-md text-white"
            : "absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md"
        }>
          <div className="gradient-brand p-2 rounded-xl text-white">
            <span className="text-xs font-bold font-btn">HQ</span>
          </div>
          <div>
            <h4 className={isDark ? "text-xs font-extrabold text-white font-display uppercase tracking-wider" : "text-xs font-extrabold text-slate-900 font-display uppercase tracking-wider"}>
              {selectedMarker.name}
            </h4>
            <p className="text-[11px] font-semibold text-cyan-400 font-sans">
              {selectedMarker.users.toLocaleString()}+ C-Suite Delegates Reached
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
