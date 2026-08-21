import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  PlayCircle,
  Bookmark,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Save,
  X,
  Sparkles,
  Layers,
  Check,
  Video,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

const CATEGORIES = [
  "All",
  "DSA",
  "System Design",
  "Web Development",
  "Core CS",
  "Behavioral",
  "Resume",
];

export default function StudyLibrary() {
  const containerRef = useRef(null);
  const [libraryData, setLibraryData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  const fetchLibrary = async () => {
    try {
      const res = await axios.get(
        `${NODE_API_URL}/api/study-library?category=${activeCategory}&search=${searchQuery}`,
        { withCredentials: true }
      );
      if (res.data) {
        setLibraryData(res.data);
      }
    } catch (err) {
      console.warn("Could not load study library from backend, fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [activeCategory, searchQuery]);

  useGSAP(
    () => {
      if (!loading) {
        gsap.fromTo(
          ".gsap-fade-item",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: containerRef, dependencies: [loading, activeCategory] }
  );

  const handleToggleBookmark = async (e, videoId) => {
    e.stopPropagation();
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/study-library/bookmark/${videoId}`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        setLibraryData((prev) => {
          if (!prev) return prev;
          const updatedVideos = prev.videos.map((v) =>
            v.id === videoId ? { ...v, isBookmarked: res.data.isBookmarked } : v
          );
          return {
            ...prev,
            videos: updatedVideos,
            savedCount: res.data.isBookmarked
              ? (prev.savedCount || 0) + 1
              : Math.max(0, (prev.savedCount || 0) - 1),
          };
        });
      }
    } catch (err) {
      console.error("Could not toggle bookmark:", err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedVideo) return;
    try {
      await axios.post(
        `${NODE_API_URL}/api/study-library/notes/${selectedVideo.id}`,
        { noteText: activeNoteText },
        { withCredentials: true }
      );
      selectedVideo.userNote = activeNoteText;
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2500);
    } catch (err) {
      console.error("Could not save note:", err);
    }
  };

  const handleToggleComplete = async (videoId, currentCompleted) => {
    try {
      const nextCompleted = !currentCompleted;
      await axios.post(
        `${NODE_API_URL}/api/study-library/progress/${videoId}`,
        { watchedSeconds: 1000, completed: nextCompleted },
        { withCredentials: true }
      );
      setLibraryData((prev) => {
        if (!prev) return prev;
        const updated = prev.videos.map((v) =>
          v.id === videoId ? { ...v, isCompleted: nextCompleted } : v
        );
        return { ...prev, videos: updated };
      });
      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo((prev) => ({ ...prev, isCompleted: nextCompleted }));
      }
    } catch (err) {
      console.error("Could not update progress:", err);
    }
  };

  const videos = libraryData?.videos || [];

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-white">
      <div ref={containerRef} className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        {/* Editorial Wide Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono uppercase tracking-widest">
              <Video className="w-3.5 h-3.5" />
              Curated Masterclasses
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Placement Technical Study Library
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Targeted high-yield video lectures, System Design blueprints, and core Computer Science deep dives.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs flex items-center gap-2 shadow-lg">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span className="text-zinc-400 font-mono">Bookmarked:</span>
              <span className="text-white font-bold font-mono text-sm">
                {libraryData?.savedCount || 2} Lessons
              </span>
            </div>
          </div>
        </header>

        {/* Search and Category Filter Bar */}
        <section className="gsap-fade-item flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topic, algorithm or channel (Dynamic Programming, Striver, Redis, Caching)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-white text-zinc-950 font-semibold shadow-md"
                    : "bg-zinc-950/80 text-zinc-400 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Gapless Dense Video Grid */}
        <section className="gsap-fade-item grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-dense gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => {
                setSelectedVideo(vid);
                setActiveNoteText(vid.userNote || "");
              }}
              className="group rounded-3xl bg-zinc-900/70 border border-white/10 hover:border-red-500/50 overflow-hidden shadow-xl cursor-pointer transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                {/* Video Preview Thumbnail */}
                <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-300 bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md font-mono">
                      {vid.channel}
                    </span>

                    <span className="text-[11px] font-mono font-bold text-white bg-black/80 px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-400" />
                      {vid.duration}
                    </span>
                  </div>

                  {/* Bookmark Action */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(e, vid.id)}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
                      vid.isBookmarked
                        ? "bg-purple-600 text-white"
                        : "bg-black/60 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                {/* Video Info Details */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20">
                      {vid.category}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {vid.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug tracking-tight group-hover:text-red-300 transition-colors">
                    {vid.title}
                  </h3>

                  {/* Bullet Takeaways */}
                  <div className="mt-4 space-y-1.5">
                    {(vid.keyTakeaways || []).slice(0, 2).map((takeaway, idx) => (
                      <div key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="text-red-400 font-bold shrink-0">•</span>
                        <span className="line-clamp-1">{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 border-t border-white/5 bg-zinc-950/80 flex items-center justify-between text-xs">
                <span className="text-purple-300 font-medium flex items-center gap-1.5 group-hover:text-purple-200">
                  <PlayCircle className="w-4 h-4 text-purple-400" /> Watch Lesson & Notes
                </span>

                {vid.isCompleted && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Video Player & Note Taking Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {selectedVideo.title}
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono mt-0.5 block">
                    {selectedVideo.channel} · {selectedVideo.duration} · {selectedVideo.category}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Embedded Player */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10">
                <iframe
                  src={`https://www.youtube.com/embed/${
                    selectedVideo.videoUrl.split("v=")[1] || ""
                  }`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>

              {/* Notes Pad & Direct Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-2.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2 font-mono">
                    <Edit3 className="w-4 h-4 text-purple-400" />
                    Lecture Notes & Architectural Takeaways
                  </label>
                  <textarea
                    rows={4}
                    value={activeNoteText}
                    onChange={(e) => setActiveNoteText(e.target.value)}
                    placeholder="Record key formulas, complexity trade-offs, edge cases, or System Design patterns..."
                    className="w-full bg-zinc-950 text-zinc-200 text-xs rounded-2xl p-4 border border-white/10 focus:outline-none focus:border-purple-400 leading-relaxed font-sans"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      className="px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-purple-600" /> Save Notes to Cloud
                    </button>
                    {noteSavedFeedback && (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-3">
                      Lesson Telemetry
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleComplete(selectedVideo.id, selectedVideo.isCompleted)
                      }
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedVideo.isCompleted
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-zinc-900 text-zinc-300 border-white/10 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {selectedVideo.isCompleted ? "Completed Lesson" : "Mark as Completed"}
                    </button>
                  </div>

                  <a
                    href={selectedVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center gap-1.5 hover:bg-zinc-900 transition-colors"
                  >
                    Open on YouTube <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
