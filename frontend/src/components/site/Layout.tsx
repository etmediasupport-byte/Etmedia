import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { RegisterModal } from "@/components/site/RegisterModal";
import { events as defaultEvents, EventItem } from "@/lib/site-data";
import { Toaster } from "@/components/ui/sonner";
import { ScrollProgressBar } from "@/components/site/ScrollProgressBar";

export function Layout() {
  const location = useLocation();
  const [modalState, setModalState] = useState<{ isOpen: boolean; event: EventItem | null }>({
    isOpen: false,
    event: null,
  });

  // Global event listener to open RegisterModal from any card, button, or link
  useEffect(() => {
    const handleOpenRegisterModal = (e: any) => {
      const selectedEvent = e.detail || defaultEvents[0];
      setModalState({ isOpen: true, event: selectedEvent });
    };

    window.addEventListener("open-register-modal", handleOpenRegisterModal as EventListener);
    return () => {
      window.removeEventListener("open-register-modal", handleOpenRegisterModal as EventListener);
    };
  }, []);

  // Lenis Smooth Scrolling Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-brand-blue/30 selection:text-brand-blue">
      <ScrollProgressBar />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <FloatingActions />
      <Toaster position="top-center" richColors />

      {/* Global Instant Register Now Modal */}
      <RegisterModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, event: null })}
        event={modalState.event || (defaultEvents[0] as EventItem) || null}
      />
    </div>
  );
}
