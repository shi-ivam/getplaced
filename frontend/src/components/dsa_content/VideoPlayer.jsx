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
        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all duration-200"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-zinc-200 transition-colors truncate">
                {lecture.title}
              </h3>
              {lecture.completed && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                {formatDuration(lecture.duration)}
              </span>
              <span>·</span>
              <span className="text-zinc-400">Video Lecture</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Watch Video</span>
          </button>
        </div>
      </div>

      {/* Video Player Popup Modal */}
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
            className="bg-[#0c0c0e] border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[88vh] flex flex-col justify-between overflow-hidden p-4 sm:p-6 space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                    Video Lecture
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
                    className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 transition-colors inline-flex items-center gap-1 text-xs"
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
                  className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player Frame with strict height bounds */}
            <div className="relative aspect-video w-full max-h-[60vh] rounded-xl overflow-hidden bg-black border border-zinc-800 shrink-0">
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
                  className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 transition-colors cursor-pointer shrink-0"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-zinc-200 h-full rounded-full transition-all duration-200"
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
