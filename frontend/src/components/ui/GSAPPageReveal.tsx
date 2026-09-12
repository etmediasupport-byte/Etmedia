import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface GSAPPageRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function GSAPPageReveal({ children, className, delay = 0 }: GSAPPageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          y: 40,
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        },
        {
          opacity: 1,
          y: 0,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.1,
          delay,
          ease: "power4.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

export function GSAPStaggerText({ text, className }: { text: string; className?: string }) {
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const words = textRef.current.querySelectorAll(".gsap-word");
    gsap.fromTo(
      words,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.8,
        ease: "back.out(1.7)",
      }
    );
  }, [text]);

  const words = text.split(" ");

  return (
    <h1 ref={textRef} className={className}>
      {words.map((word, i) => (
        <span key={i} className="gsap-word inline-block mr-[0.25em]">
          {word}
        </span>
      ))}
    </h1>
  );
}
