import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";

/**
 * Caide Retro Bento Modal with 6px drop shadow & crisp borders
 */
export default function CaideModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
  theme = "white",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0431]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full ${maxWidth} bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-3xl shadow-[8px_8px_0_0_#0D0431] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FEF9CF] border-b-2 border-[#0D0431] flex items-center justify-between shrink-0">
          <div>
            {title && (
              <h3 className="font-heading font-bold text-lg text-[#0D0431]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#0D0431]/70 font-medium">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full border-2 border-[#0D0431] bg-white hover:bg-[#F85B52] hover:text-white transition-all shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
