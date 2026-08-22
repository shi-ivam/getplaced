import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Play, Pause, Check, X, Clock, ExternalLink, PlayCircle, CheckCircle2 } from "lucide-react";

export const VideoPlayer = ({ lecture, initialProgress = 0, onProgressRatio, onComplete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(initialProgress ? initialProgress * 100 : 0);
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  useEffect(() => {
    if (initialProgress > 0 && progress === 0) {
      setProgress(initialProgress * 100);
    }
  }, [initialProgress]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      onComplete();
    }
  }, [progress, onComplete]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsPlaying(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (state) => {
    const currentPct = state.played * 100;
    setProgress(currentPct);
    if (onProgressRatio) {
      onProgressRatio(state.played);
    }
  };

  const handleEnded = () => {
    setProgress(100);
    setIsPlaying(false);
    if (onProgressRatio) onProgressRatio(1.0);
    if (onComplete) onComplete();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "30 mins";
    const mins = Math.floor(seconds / 60);
    return `${mins} mins`;
  };

  return (
    <>
      {/* Sleek Lecture Card in List */}
      <div
        onClick={() => {
          setIsModalOpen(true);
          setIsPlaying(true);
        }}
        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          <div className="w-10 h-10 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-heading font-black text-[#0D0431] group-hover:text-[#896EE2] transition-colors truncate">
                {lecture.title}
              </h3>
              {lecture.completed && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#0D0431]" /> Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-[#0D0431]/70">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#0D0431]" />
                {formatDuration(lecture.duration)}
              </span>
              <span>·</span>
              <span className="text-[#0D0431]">Video Lecture</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Watch Video</span>
          </button>
        </div>
      </div>

      {/* Video Player Popup Bento Modal */}
      {isModalOpen && (
        <div
          onClick={() => {
            setIsModalOpen(false);
            setIsPlaying(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0431]/75 backdrop-blur-sm p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#0D0431] rounded-3xl shadow-[8px_8px_0_0_#0D0431] max-w-3xl w-full max-h-[88vh] flex flex-col justify-between overflow-hidden p-0 animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FEF9CF] border-b-2 border-[#0D0431] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="p-2 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#0D0431]/70 font-bold uppercase tracking-widest block">
                    Video Lecture
                  </span>
                  <h3 className="text-sm sm:text-base font-heading font-black text-[#0D0431] truncate">
                    {lecture.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {lecture.videoUrl && (
                  <a
                    href={lecture.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-[#0D0431] hover:bg-[#FEDF6A] rounded-full bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all inline-flex items-center gap-1 text-xs font-mono font-bold"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsPlaying(false);
                  }}
                  className="p-1.5 rounded-full border-2 border-[#0D0431] bg-white hover:bg-[#F85B52] hover:text-white transition-all shadow-[2px_2px_0_0_#0D0431] cursor-pointer text-[#0D0431]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player Frame with strict height bounds */}
            <div className="p-4 sm:p-6 space-y-4 bg-white flex-1 overflow-y-auto">
              <div className="relative aspect-video w-full max-h-[60vh] rounded-2xl overflow-hidden bg-[#0D0431] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] shrink-0">
                {hasWindow && (
                  <ReactPlayer
                    url={lecture.videoUrl}
                    playing={isPlaying}
                    onProgress={handleProgress}
                    onEnded={handleEnded}
                    width="100%"
                    height="100%"
                    controls={true}
                    config={{
                      youtube: {
                        playerVars: {
                          modestbranding: 1,
                          rel: 0,
                          iv_load_policy: 3,
                        },
                      },
                    }}
                  />
                )}
              </div>

              {/* Custom Control Bar & Progress */}
              <div className="flex items-center justify-between gap-4 pt-1 text-xs font-mono shrink-0">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer shrink-0 font-bold"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  <div className="flex-1 bg-[#0D0431]/10 border-2 border-[#0D0431] rounded-full h-3 overflow-hidden p-[1px]">
                    <div
                      className="bg-[#896EE2] h-full rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <span className="text-[#0D0431] font-mono font-bold shrink-0">
                    {Math.round(progress)}%
                  </span>
                </div>

                {progress >= 100 && (
                  <span className="px-2.5 py-1 rounded-full bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] font-mono font-bold text-xs flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
