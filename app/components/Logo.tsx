import React from "react";

export function SoleFinityLogo({ size = "medium", className = "" }: { size?: "small" | "medium" | "large"; className?: string }) {
  const sizes = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-20 h-20",
  };

  return (
    <div className={`${sizes[size]} ${className} flex items-center justify-center relative`}>
      {/* Outer circle with gradient border */}
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="logoGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Shoe silhouette (minimalist) */}
        <ellipse cx="50" cy="35" rx="18" ry="16" fill="url(#logoGradient1)" opacity="0.9" />
        <path d="M 32 40 Q 30 50 40 60 L 60 60 Q 70 50 68 40" fill="url(#logoGradient2)" opacity="0.9" />

        {/* Sole with shine effect */}
        <line x1="35" y1="60" x2="65" y2="60" stroke="url(#logoGradient1)" strokeWidth="3" opacity="0.7" strokeLinecap="round" />

        {/* Infinity symbol overlay (subtle) */}
        <path
          d="M 25 50 Q 30 45 35 50 Q 40 55 50 50 Q 60 45 65 50 Q 70 55 75 50"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Center dot for balance */}
        <circle cx="50" cy="50" r="3" fill="white" opacity="0.8" />
      </svg>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg" />
    </div>
  );
}

export function SoleFinityText({ size = "medium", showTagline = false }: { size?: "small" | "medium" | "large"; showTagline?: boolean }) {
  const textSizes = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${textSizes[size]} font-black tracking-tight`}>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          SOLE
        </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 ml-1">
          FINITY
        </span>
      </div>
      {showTagline && <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Premium Streetwear</p>}
    </div>
  );
}

export function SoleFinityFullLogo({ horizontal = false, size = "medium" }: { horizontal?: boolean; size?: "small" | "medium" | "large" }) {
  return (
    <div className={`flex ${horizontal ? "flex-row items-center gap-3" : "flex-col items-center gap-2"} group`}>
      <SoleFinityLogo size={size} className="group-hover:scale-110 transition-transform duration-300" />
      <SoleFinityText size={size} showTagline={size === "large"} />
    </div>
  );
}
