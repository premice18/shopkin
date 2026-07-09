"use client";

import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  fallbackName?: string;
  className?: string;
}

// Extrait les initiales à partir d'un nom complet ( "Jean Dupont" → "JD" )
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export default function Avatar({ src, alt, size = 40, fallbackName = "?", className = "" }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(fallbackName);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(size * 0.38, 12) }}
      aria-label={alt}
    >
      {initials}
    </div>
  );
}
