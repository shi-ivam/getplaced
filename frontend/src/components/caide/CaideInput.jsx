import React from "react";

/**
 * Modern Clean Form Input Component
 */
export default function CaideInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  error,
  disabled = false,
  className = "",
  inputClassName = "",
  rows,
  as = "input",
  icon: Icon,
}) {
  const Component = as === "textarea" ? "textarea" : "input";

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F6A80]">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6A80] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <Component
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={rows || 3}
          className={`w-full bg-white text-[#17103D] placeholder-[#6F6A80]/50 border border-[#E2DEEC] rounded-xl px-3.5 py-2.5 text-sm font-sans font-medium shadow-[0_1px_2px_rgba(23,16,61,0.02)] focus:outline-none focus:border-[#6E44FF] focus:ring-2 focus:ring-[#6E44FF]/10 transition-all disabled:opacity-50 ${
            Icon ? "pl-10" : ""
          } ${inputClassName}`}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-[#C7382B] tracking-wide mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
