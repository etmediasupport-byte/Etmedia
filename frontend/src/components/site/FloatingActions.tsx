import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { contact } from "@/lib/site-data";

export function FloatingActions() {
  const [show, setShow] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="fixed right-4 bottom-5 z-50 flex flex-col items-end gap-3">
      <button
        type="button"
        aria-label="Toggle dark mode"
        onClick={() => setDark((v) => !v)}
        className="glass-card rounded-full p-3 transition-transform hover:scale-105"
      >
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <a
        href={contact.whatsapp}
        aria-label="Chat on WhatsApp"
        className="gradient-brand rounded-full p-3.5 text-white shadow-luxe transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <AnimatePresence>
        {show ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="glass-card rounded-full p-3 transition-transform hover:scale-105"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
