import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageZoomCardProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
}

export function ImageZoomCard({
  src,
  alt,
  className,
  imgClassName,
  children,
}: ImageZoomCardProps) {
  return (
    <div className={cn("image-zoom-container group relative overflow-hidden rounded-none", className)}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110", imgClassName)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
      {children && <div className="absolute inset-0 z-10">{children}</div>}
    </div>
  );
}
