import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Counter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, mv, value]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  className,
  titleClassName,
  descriptionClassName,
  kickerClassName,
}: {
  kicker?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  kickerClassName?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {kicker ? (
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-border bg-accent/60 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-accent-foreground uppercase",
            kickerClassName,
          )}
        >
          {kicker}
        </span>
      ) : null}
      <h2
        className={cn(
          "mt-2.5 text-3xl leading-tight font-semibold sm:text-4xl lg:text-[2.75rem]",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-muted-foreground mt-2.5 text-base leading-relaxed sm:text-lg",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

export function GlowBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="bg-brand-blue/25 float-orb absolute -top-24 -left-24 h-72 w-72 rounded-full" />
      <div
        className="bg-brand-purple/20 float-orb absolute -right-16 bottom-0 h-80 w-80 rounded-full"
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}
