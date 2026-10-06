import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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

import { EventAdvertisementPopup } from "@/components/site/EventAdvertisementPopup";

import { EventSelectionModal } from "@/components/site/EventSelectionModal";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const lenisRef = useRef<Lenis | null>(null);
  const [modalState, setModalState] = useState<{ isOpen: boolean; event: EventItem | null; mode?: "paid" | "free" }>({
    isOpen: false,
    event: null,
    mode: "paid",
  });
  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [eventSelectionModalOpen, setEventSelectionModalOpen] = useState(false);

  // Global event listener to navigate to full-page register route or open event selector modal
  useEffect(() => {
    const handleOpenRegisterModal = (e: any) => {
      const detail = e.detail || {};
      let eventSlug = "";

      if (detail.event?.slug) {
        eventSlug = detail.event.slug;
      } else if (detail.event?.id) {
        eventSlug = detail.event.id;
      } else if (detail.slug) {
        eventSlug = detail.slug;
      } else if (detail.id) {
        eventSlug = detail.id;
      }

      if (eventSlug) {
        if (detail.mode === "free") {
          navigate(`/events/${eventSlug}/register-free`);
        } else {
          navigate(`/events/${eventSlug}/register`);
        }
      } else {
        // If no specific event is selected, open the executive Event Selection Modal
        setEventSelectionModalOpen(true);
      }
    };

    const handleOpenEventSelectionModal = () => {
      setEventSelectionModalOpen(true);
    };

    const handleOpenMembershipModal = () => {
      setMembershipModalOpen(true);
    };

    window.addEventListener("open-register-modal", handleOpenRegisterModal as EventListener);
    window.addEventListener("open-select-event-modal", handleOpenEventSelectionModal as EventListener);
    window.addEventListener("open-membership-modal", handleOpenMembershipModal as EventListener);

    return () => {
      window.removeEventListener("open-register-modal", handleOpenRegisterModal as EventListener);
      window.removeEventListener("open-select-event-modal", handleOpenEventSelectionModal as EventListener);
      window.removeEventListener("open-membership-modal", handleOpenMembershipModal as EventListener);
    };
  }, [navigate]);

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

  // Scroll to top on route change (immediate + post-animation frames)
  useEffect(() => {
    const scrollLayoutTop = () => {
      if (lenisRef.current) {
        try {
          lenisRef.current.scrollTo(0, { immediate: true });
        } catch (_) {}
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollLayoutTop();
    const r1 = requestAnimationFrame(scrollLayoutTop);
    const t1 = setTimeout(scrollLayoutTop, 60);
    const t2 = setTimeout(scrollLayoutTop, 180);

    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-brand-blue/30 selection:text-brand-blue print:bg-white print:text-black">
      <div className="print:hidden">
        <Preloader />
        <ScrollProgressBar />
        <Navbar />
      </div>
      <main className="flex-1 print:p-0 print:m-0">
        <Outlet />
      </main>
      <div className="print:hidden">
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

        {/* Global Dynamic Premium Advertisement Popup Modal */}
        <EventAdvertisementPopup />

        {/* Global Executive Event Selection Popup Modal */}
        <EventSelectionModal
          isOpen={eventSelectionModalOpen}
          onClose={() => setEventSelectionModalOpen(false)}
        />
      </div>
    </div>
  );
}
