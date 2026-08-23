import React from "react";

/**
 * Modern Clean Status Badge Component
 */
export default function GpBadge({
  children,
  className = "",
  theme = "light-purple", // "light-purple" | "yellow" | "mint" | "lime" | "blue" | "coral" | "dark"
  size = "md", // "sm" | "md" | "lg"
  dot = false,
  shadow = false,
}) {
  const themeStyles = {
    "light-purple": "bg-[#EFEAFF] text-[#6E44FF] border-[#E2DEEC]",
    yellow: "bg-[#FEF6D6] text-[#9E6700] border-[#FFE995]",
    "light-yellow": "bg-[#FEF9CF] text-[#9E6700] border-[#FFE995]",
    mint: "bg-[#D8FAF4] text-[#0D7A68] border-[#B7F4E8]",
    lime: "bg-[#EEFAEA] text-[#0D7A68] border-[#DDF7D0]",
    blue: "bg-[#E3EEFF] text-[#1D58B5] border-[#CDE1FF]",
    coral: "bg-[#FFE8E5] text-[#C7382B] border-[#FFC5B7]",
    dark: "bg-[#17103D] text-white border-[#24195A]",
  }[theme] || "bg-[#EFEAFF] text-[#6E44FF] border-[#E2DEEC]";

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  }[size] || "px-3 py-1 text-xs";

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-sans font-semibold tracking-wide rounded-full border ${themeStyles} ${sizeStyles} ${
        shadow ? "shadow-sm" : ""
      } ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse" />
      )}
      <span>{children}</span>
    </div>
  );
}
