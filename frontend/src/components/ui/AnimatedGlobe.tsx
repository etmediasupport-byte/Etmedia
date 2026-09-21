import { GlobeInteractive, defaultEtMediaMarkers } from "./cobe-globe-interactive";

export function AnimatedGlobe() {
  return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full">
      {/* COBE 3D WebGL Globe with Executive Dark Mode Glow */}
      <GlobeInteractive isDark={true} markers={defaultEtMediaMarkers} className="w-full max-w-[420px]" />
    </div>
  );
}
