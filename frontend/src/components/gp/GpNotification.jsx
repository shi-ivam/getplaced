import React from "react";

/**
 * Multi-layer 3D Floating Notification Card matching GetPlaced Hero & Features
 */
export default function GpNotification({
  tag = "New email",
  time = "Now",
  title = "Re: Acme's LATAM expansion...",
  subtitle = "99+ more notifications",
  iconType = "email", // "email" | "message" | "meeting" | "success" | "code"
  theme = "yellow", // "yellow" | "purple" | "mint"
  className = "",
}) {
  return (
    <div className={`notification_wrap ${className}`}>
      <div className="notification_main">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#0D0431]/70">
          <div className="flex items-center gap-1.5">
            {/* Bell/Signal SVG */}
            <svg
              className="w-4 h-4 text-[#896EE2] shrink-0"
              viewBox="0 0 26 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="9.24" cy="9.33" r="8.45" fill="#896EE2" />
              <path
                d="M9.24 5.95C8.07 5.95 7.13 6.9 7.13 8.06V8.91L6.28 9.75V10.6H12.2V9.75L11.35 8.91V8.06C11.35 6.9 10.41 5.95 9.24 5.95Z"
                fill="#FFFFFF"
              />
              <path
                d="M7.97 11.45C7.97 12.15 8.54 12.71 9.24 12.71C9.94 12.71 10.51 12.15 10.51 11.45H7.97Z"
                fill="#FFFFFF"
              />
              <rect
                x="13.66"
                y="1"
                width="6.33"
                height="6.33"
                rx="3.16"
                fill="#F85B52"
              />
            </svg>
            <span className="uppercase tracking-wider">{tag}</span>
          </div>
          <span>{time}</span>
        </div>
        <div className="font-bold text-xs text-[#0D0431] truncate">{title}</div>
        <div className="text-[10px] text-[#0D0431]/60 font-medium">{subtitle}</div>
      </div>
      <div className="notification_layer is-mid"></div>
      <div className="notification_layer is-bottom"></div>
    </div>
  );
}
