import React, { useState } from "react";
import { Building2 } from "lucide-react";
import { getCompanyDetails } from "@/data/curatedCompanies";

const SIZE_MAP = {
  xs: "w-4 h-4 text-[9px]",
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-14 h-14 text-xl",
};

const ICON_SIZE_MAP = {
  xs: "w-2.5 h-2.5",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  xl: "w-7 h-7",
};

export default function CompanyLogo({
  company = "",
  size = "md",
  className = "",
  rounded = "rounded-xl",
  bordered = true,
}) {
  const [imgError, setImgError] = useState(false);
  const details = getCompanyDetails(company);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const iconSizeClass = ICON_SIZE_MAP[size] || ICON_SIZE_MAP.md;

  const initials = details?.name
    ? details.name.slice(0, 2).toUpperCase()
    : "GP";

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden select-none font-mono font-black ${sizeClass} ${rounded} ${
        bordered ? "border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]" : ""
      } ${details.bgTint || "bg-[#FEF9CF]"} ${className}`}
      title={details.fullName || details.name}
    >
      {!imgError && details.logoUrl ? (
        <img
          src={details.logoUrl}
          alt={`${details.name} logo`}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span
          className="font-mono font-black tracking-tight"
          style={{ color: details.brandColor || "#0D0431" }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
