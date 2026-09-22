import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { RegisterModal } from "@/components/site/RegisterModal";
import { MembershipModal } from "@/components/site/MembershipModal";
import { Preloader } from "@/components/site/Preloader";
import { events as defaultEvents, EventItem } from "@/lib/site-data";
import { Toaster } from "@/components/ui/sonner";
import { ScrollProgressBar } from "@/components/site/ScrollProgressBar";

export function Layout() {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);
  const [modalState, setModalState] = useState<{ isOpen: boolean; event: EventItem | null; mode?: "paid" | "free" }>({
    isOpen: false,
    event: null,
    mode: "paid",
  });
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);

  // Global event listener to open RegisterModal from any card, button, or link
  useEffect(() => {
    const handleOpenRegisterModal = (e: any) => {
      const detail = e.detail || {};
      let selectedEvent: EventItem | null = defaultEvents[0] ?? null;
      let regMode: "paid" | "free" = "paid";

      if (detail.event) {
        selectedEvent = detail.event;
        regMode = detail.mode || "paid";
      } else if (detail.title || detail.id) {
        selectedEvent = detail;
        regMode = detail.registrationMode || "paid";
      }

      setModalState({ isOpen: true, event: selectedEvent, mode: regMode });
    };

    const handleOpenMembershipModal = () => {
      setMembershipModalOpen(true);
    };

    window.addEventListener("open-register-modal", handleOpenRegisterModal as EventListener);
    window.addEventListener("open-membership-modal", handleOpenMembershipModal as EventListener);

    return () => {
      window.removeEventListener("open-register-modal", handleOpenRegisterModal as EventListener);
      window.removeEventListener("open-membership-modal", handleOpenMembershipModal as EventListener);
    };
  }, []);

  // Lenis Smooth Scrolling Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      delete (window as any).__lenis;
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-brand-blue/30 selection:text-brand-blue">
      <Preloader />
      <ScrollProgressBar />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
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
        onClose={() => setModalState({ isOpen: false, event: null, mode: "paid" })}
        event={modalState.event || (defaultEvents[0] as EventItem) || null}
        mode={modalState.mode || "paid"}
      />

      {/* Global Step-wise Membership Application Modal */}
      <MembershipModal
        isOpen={membershipModalOpen}
        onClose={() => setMembershipModalOpen(false)}
      />
    </div>
  );
}
