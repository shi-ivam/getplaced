import React from "react";

/**
 * Modern Clean Card Component
 * Uses soft ambient shadows, subtle 1px border (#E2DEEC), and clean white/soft-neutral surfaces.
 */
export default function GpCard({
  children,
  className = "",
  theme = "white", // "white" | "light-yellow" | "light-purple" | "light-green" | "light-blue" | "pale-lime" | "dark"
  grid = false, // boolean or string for subtle grid texture
  shadow = "default", // "none" | "sm" | "default" | "lg" | "xl"
  rounded = "2xl", // "xl" | "2xl" | "3xl" | "none"
  hoverEffect = false,
  onClick,
}) {
  const themeBgMap = {
    white: "bg-white text-[#17103D] border-[#E2DEEC]",
    "light-yellow": "bg-[#FEF9CF]/60 text-[#17103D] border-[#FFE995]",
    "light-purple": "bg-[#F2F0FA] text-[#17103D] border-[#E2DEEC]",
    "light-green": "bg-[#D8FAF4]/50 text-[#17103D] border-[#B7F4E8]",
    "light-blue": "bg-[#E3EEFF]/60 text-[#17103D] border-[#CDE1FF]",
    "pale-lime": "bg-[#EEFAEA]/70 text-[#17103D] border-[#DDF7D0]",
    dark: "bg-[#17103D] text-white border-[#24195A]",
    "dark-indigo": "bg-[#140742] text-white border-[#24195A]",
  };

  const shadowMap = {
    none: "",
    sm: "shadow-[0_1px_3px_rgba(23,16,61,0.04)]",
    default: "shadow-[0_2px_8px_rgba(23,16,61,0.04),0_1px_2px_rgba(23,16,61,0.02)]",
    lg: "shadow-[0_6px_18px_rgba(23,16,61,0.06),0_2px_6px_rgba(23,16,61,0.03)]",
    xl: "shadow-[0_12px_32px_rgba(23,16,61,0.08),0_4px_12px_rgba(23,16,61,0.04)]",
    white: "shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
  };

  const roundedMap = {
    none: "rounded-none",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  };

  const roundedClass = roundedMap[rounded] || "rounded-2xl";
  const shadowClass = shadowMap[shadow] || shadowMap.default;
  const bgClass = themeBgMap[theme] || themeBgMap.white;
  const gridClass = grid ? "u-background-grid-dark-2" : "";

  return (
    <div
      onClick={onClick}
      className={`relative border ${bgClass} ${gridClass} ${shadowClass} ${roundedClass} ${
        hoverEffect
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(23,16,61,0.08)] hover:border-[#C8C3D8]"
          : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
