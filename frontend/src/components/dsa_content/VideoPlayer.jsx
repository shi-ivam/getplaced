import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Play, Pause, Check, X, Clock, ExternalLink, PlayCircle, CheckCircle2 } from "lucide-react";

export const VideoPlayer = ({ lecture, onComplete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

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
    setProgress(state.played * 100);
  };

  const handleEnded = () => {
    setProgress(100);
    setIsPlaying(false);
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
        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0e0e11] border border-zinc-800/80 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/5 cursor-pointer transition-all duration-300"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200 shadow-sm">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                {lecture.title}
              </h3>
              {lecture.completed && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-600" />
                {formatDuration(lecture.duration)}
              </span>
              <span>·</span>
              <span className="text-purple-400/80">Interactive Video Lecture</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all group-hover:scale-105"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Watch Video</span>
          </button>
        </div>
      </div>

      {/* Video Player Popup Modal (Zero Vertical Overflow) */}
      {isModalOpen && (
        <div
          onClick={() => {
            setIsModalOpen(false);
            setIsPlaying(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0c0c0e] border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col justify-between overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                    Curriculum Masterclass
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
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
                    className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 transition-colors inline-flex items-center gap-1 text-xs"
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
                  className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player Frame with strict height bounds */}
            <div className="relative aspect-video w-full max-h-[60vh] rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-inner shrink-0">
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
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className="text-zinc-400 font-semibold shrink-0">
                  {Math.round(progress)}%
                </span>
              </div>

              {progress >= 100 && (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
