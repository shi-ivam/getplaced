import React from "react";

export default function CaideMarquee({
  items = [
    "DSA & System Design Tracks",
    "AI Placement Roadmap",
    "ATS Resume Optimizer",
    "Mock Interview Simulator",
    "Behavioral STAR Framework",
    "Company Recruiting Intelligence",
    "VTOP Academic Synchronization",
  ],
  className = "",
}) {
  const repeated = [...items, ...items];

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#FFD84D] text-[#17103D] py-3.5 border-y border-[#FFE995] select-none group shadow-sm ${className}`}
    >
      <div className="flex w-max animate-caide-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none items-center gap-8 font-heading text-xs sm:text-sm font-bold tracking-wider uppercase">
        {repeated.map((text, idx) => (
          <div key={idx} className="flex items-center gap-8 shrink-0">
            <span>{text}</span>
            <svg
              className="w-3.5 h-3.5 text-[#17103D] opacity-70"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
