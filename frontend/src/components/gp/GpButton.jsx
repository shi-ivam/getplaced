import React from "react";
import { Link } from "react-router-dom";

export function GpArrow({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 25 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.5 7H13.5V9H15.5V11H3.5V13H15.5V15H13.5V17H12.5V19H15.5V17H17.5V15H19.5V14H20.5V13H21.5V11H20.5V10H19.5V9H17.5V7H15.5V5H12.5V7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Modern Clean Button Component
 */
export default function GpButton({
  children,
  to,
  href,
  onClick,
  type = "button",
  variant = "stacked", // "stacked" | "stacked-yellow" | "stacked-coral" | "secondary" | "secondary-light" | "outline" | "pill"
  size = "md", // "sm" | "md" | "lg"
  icon = true,
  disabled = false,
  className = "",
  fullWidth = false,
}) {
  const sizePadding = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
  }[size] || "px-4 py-2 text-sm rounded-xl";

  let variantStyle = "bg-[#17103D] hover:bg-[#24195A] text-white border border-[#17103D] shadow-[0_1px_3px_rgba(23,16,61,0.12)]";

  if (variant === "stacked-yellow" || variant === "yellow") {
    variantStyle = "bg-[#FFD84D] hover:bg-[#FEDF6A] text-[#17103D] border border-[#FFE995] font-bold shadow-[0_1px_3px_rgba(255,216,77,0.25)]";
  } else if (variant === "stacked-coral" || variant === "coral") {
    variantStyle = "bg-[#C7382B] hover:bg-[#B32F23] text-white border border-[#C7382B] shadow-[0_1px_3px_rgba(199,56,43,0.2)]";
  } else if (variant === "secondary" || variant === "secondary-light") {
    variantStyle = "bg-white hover:bg-[#F2F0FA] text-[#17103D] border border-[#E2DEEC] hover:border-[#C8C3D8] shadow-[0_1px_2px_rgba(23,16,61,0.04)]";
  } else if (variant === "outline") {
    variantStyle = "bg-transparent hover:bg-white text-[#17103D] border border-[#E2DEEC] hover:border-[#C8C3D8]";
  } else if (variant === "pill") {
    variantStyle = "bg-[#FFD84D] hover:bg-[#FEDF6A] text-[#17103D] font-bold rounded-full border border-[#FFE995] shadow-[0_1px_3px_rgba(255,216,77,0.25)]";
  }

  const baseClasses = `inline-flex items-center justify-center gap-2 font-medium font-sans transition-all duration-180 select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
  } ${fullWidth ? "w-full" : ""} ${sizePadding} ${variantStyle} ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        <span>{children}</span>
        {icon && <GpArrow className="w-3.5 h-3.5 shrink-0 opacity-80" />}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        <span>{children}</span>
        {icon && <GpArrow className="w-3.5 h-3.5 shrink-0 opacity-80" />}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      <span>{children}</span>
      {icon && <GpArrow className="w-3.5 h-3.5 shrink-0 opacity-80" />}
    </button>
  );
}
