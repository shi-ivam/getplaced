import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Play, ExternalLink } from "lucide-react";

export default function SheetVideoModal({ videoUrl, title, onClose }) {
  if (!videoUrl) return null;

  // Extract YouTube ID or timestamp if available
  let embedUrl = "";
  try {
    if (videoUrl.includes("youtu.be/")) {
      const parts = videoUrl.split("youtu.be/")[1].split("?");
      const vidId = parts[0];
      const params = parts[1] ? `?${parts[1]}` : "";
      embedUrl = `https://www.youtube.com/embed/${vidId}${params}`;
    } else if (videoUrl.includes("watch?v=")) {
      const parts = videoUrl.split("watch?v=")[1].split("&");
      const vidId = parts[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}`;
    } else {
      embedUrl = videoUrl;
    }
  } catch {
    embedUrl = videoUrl;
  }

  // Close on backdrop click or Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0c0c0e] border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden p-4 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Video Solution</span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate">{title || "Video Solution"}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 transition-colors inline-flex items-center gap-1 text-xs"
              title="Open on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Frame with strict height bounds to avoid window overflow */}
        <div className="relative aspect-video w-full max-h-[65vh] rounded-xl overflow-hidden bg-black border border-zinc-800 shrink-0">
          <iframe
            src={embedUrl}
            title={title || "Video lecture"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
