import React from "react";

/**
 * Pill shaped segmented toggle switch matching GetPlaced
 */
export default function GpToggle({
  options = [],
  value,
  onChange,
  className = "",
}) {
  return (
    <div
      className={`inline-flex items-center p-1.5 bg-white border-2 border-[#0D0431] rounded-full shadow-[3px_3px_0_0_#0D0431] select-none ${className}`}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value || value === opt.id || value === opt;
        const optValue = opt.value ?? opt.id ?? opt;
        const optLabel = opt.label ?? opt.name ?? opt;
        const badge = opt.badge;

        return (
          <button
            key={optValue}
            type="button"
            onClick={() => onChange(optValue)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
              isSelected
                ? "bg-[#0D0431] text-white shadow-sm"
                : "text-[#0D0431]/80 hover:text-[#0D0431] hover:bg-[#FEF9CF]"
            }`}
          >
            <span>{optLabel}</span>
            {badge && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-[#FEDF6A] text-[#0D0431]"
                    : "bg-[#FEDF6A]/60 text-[#0D0431]"
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
