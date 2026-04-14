import React from "react";

export function SoleFinityLogo({ size = "medium", className = "" }: { size?: "small" | "medium" | "large"; className?: string }) {
  const sizes = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-20 h-20",
  };

  return (
    <div className={`${sizes[size]} ${className} flex items-center justify-center relative`}>
      {/* Groomers Cave - Premium Barbershop Icon */}
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="groomerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#aa8c2c" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="url(#groomerGradient)" strokeWidth="1.5" />

        {/* Straight razor shape - symbol of grooming */}
        <path d="M 30 35 L 70 50 L 30 65 Q 25 50 30 35" fill="url(#groomerGradient)" opacity="0.9" />
        <line x1="30" y1="35" x2="30" y2="65" stroke="#d4af37" strokeWidth="2" opacity="0.6" />

        {/* Fine line detail */}
        <path d="M 32 38 Q 50 48 70 50" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.7" />
        <path d="M 32 62 Q 50 52 70 50" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.7" />

        {/* Center accent */}
        <circle cx="50" cy="50" r="2" fill="#d4af37" opacity="0.8" />
      </svg>
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
