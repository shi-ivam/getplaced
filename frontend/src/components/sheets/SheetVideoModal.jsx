import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Play, ExternalLink } from "lucide-react";

// Helper function to extract and convert timestamps to total seconds
export function parseTimestampToSeconds(timeStr) {
  if (!timeStr) return null;
  const str = String(timeStr).trim();

  // Pure seconds e.g. "120" or "120s"
  if (/^\d+s?$/i.test(str)) {
    const s = parseInt(str.replace(/s$/i, ""), 10);
    return isNaN(s) ? null : s;
  }

  // hh:mm:ss or mm:ss
  if (str.includes(":")) {
    const parts = str.split(":").map((p) => parseInt(p, 10));
    if (parts.some(isNaN)) return null;
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
  }

  // Format like 1h20m30s, 20m, 1h, 1h30s
  const hoursMatch = str.match(/(\d+)\s*h/i);
  const minsMatch = str.match(/(\d+)\s*m/i);
  const secsMatch = str.match(/(\d+)\s*s/i);

  if (hoursMatch || minsMatch || secsMatch) {
    let total = 0;
    if (hoursMatch) total += parseInt(hoursMatch[1], 10) * 3600;
    if (minsMatch) total += parseInt(minsMatch[1], 10) * 60;
    if (secsMatch) total += parseInt(secsMatch[1], 10);
    return total;
  }

  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

// Convert any YouTube URL format to standard embed URL with start timestamp
export function getYouTubeEmbedUrl(videoUrl) {
  if (!videoUrl) return "";
  try {
    const urlObj = new URL(videoUrl.startsWith("http") ? videoUrl : `https://${videoUrl}`);
    let videoId = "";
    let startSeconds = null;

    // Check query params for t or start
    const tParam = urlObj.searchParams.get("t") || urlObj.searchParams.get("start");
    if (tParam) {
      startSeconds = parseTimestampToSeconds(tParam);
    }

    if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.replace(/^\//, "").split("/")[0];
    } else if (urlObj.hostname.includes("youtube.com")) {
      if (urlObj.pathname.startsWith("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1].split("/")[0];
      } else if (urlObj.pathname.startsWith("/v/")) {
        videoId = urlObj.pathname.split("/v/")[1].split("/")[0];
      } else {
        videoId = urlObj.searchParams.get("v") || "";
      }
    }

    if (videoId) {
      videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");
      const startParam =
        startSeconds !== null && !isNaN(startSeconds) && startSeconds > 0
          ? `?start=${startSeconds}`
          : "";
      return `https://www.youtube.com/embed/${videoId}${startParam}`;
    }

    return videoUrl;
  } catch {
    const match = videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    const timeMatch = videoUrl.match(/[?&](?:t|start)=([^&#]+)/);
    if (match && match[1]) {
      const vid = match[1];
      const timeVal = timeMatch ? parseTimestampToSeconds(timeMatch[1]) : null;
      const startParam =
        timeVal !== null && !isNaN(timeVal) && timeVal > 0 ? `?start=${timeVal}` : "";
      return `https://www.youtube.com/embed/${vid}${startParam}`;
    }
    return videoUrl;
  }
}

export default function SheetVideoModal({ videoUrl, title, onClose }) {
  // Close on backdrop click or Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!videoUrl) return null;

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0D0431]/80 backdrop-blur-sm p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-[#0D0431] rounded-3xl shadow-[8px_8px_0_0_#0D0431] max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden p-0 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header (GetPlaced Bento Style with #FEF9CF titlebar) */}
        <div className="px-6 py-4 bg-[#FEF9CF] border-b-2 border-[#0D0431] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-[#0D0431]/70 uppercase tracking-widest font-bold block">
                Video Solution
              </span>
              <h3 className="text-sm sm:text-base font-heading font-black text-[#0D0431] truncate">
                {title || "Video Solution"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-[#0D0431] hover:bg-[#FEDF6A] rounded-full bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all inline-flex items-center gap-1 text-xs font-mono font-bold"
              title="Open on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#0D0431] hover:bg-[#F85B52] hover:text-white rounded-full bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Frame with strict height bounds to avoid window overflow */}
        <div className="p-4 sm:p-6 bg-white overflow-hidden flex-1">
          <div className="relative aspect-video w-full max-h-[65vh] rounded-2xl overflow-hidden bg-[#0D0431] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] shrink-0">
            <iframe
              src={embedUrl}
              title={title || "Video lecture"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
