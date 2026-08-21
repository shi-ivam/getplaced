import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

export default function StudyLibrary() {
  const [libraryData, setLibraryData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [loading, setLoading] = useState(true);

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
      alert("Note saved successfully!");
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <PlayCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">YouTube Study Library</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Curated high-yield video lectures, System Design walkthroughs, and CS core subject masterclasses
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#18181b] border border-gray-800 text-xs flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">Saved:</span>
            <span className="text-white font-bold">{libraryData?.savedCount || 2} Videos</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic, algorithm or channel (e.g. Dynamic Programming, Striver, Redis)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["All", "DSA", "System Design", "Web Development", "Core CS", "Behavioral", "Resume"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-[#18181b] text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid) => (
          <div
            key={vid.id}
            onClick={() => {
              setSelectedVideo(vid);
              setActiveNoteText(vid.userNote || "");
            }}
            className="bg-[#18181b] border border-gray-800 hover:border-red-500/50 rounded-2xl overflow-hidden shadow-lg group cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail with overlay */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    {vid.channel}
                  </span>

                  <span className="text-[11px] font-mono font-bold text-white bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-400" />
                    {vid.duration}
                  </span>
                </div>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleBookmark(e, vid.id)}
                  className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all ${
                    vid.isBookmarked
                      ? "bg-purple-600 text-white"
                      : "bg-black/50 text-gray-300 hover:text-white"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Card Details */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {vid.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {vid.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                  {vid.title}
                </h3>

                {/* Key Takeaways */}
                <div className="mt-3 space-y-1">
                  {(vid.keyTakeaways || []).slice(0, 2).map((takeaway, idx) => (
                    <div key={idx} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                      <span className="text-red-400 font-bold">•</span>
                      <span className="line-clamp-1">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 border-t border-gray-800/60 bg-[#141416] flex items-center justify-between text-xs">
              <span className="text-purple-400 font-medium flex items-center gap-1">
                <PlayCircle className="w-4 h-4" /> Open Player & Notes
              </span>

              {vid.isCompleted && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Watched
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Video Player & Notes Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#18181b] border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedVideo.title}</h3>
                <span className="text-xs text-gray-400">
                  {selectedVideo.channel} · {selectedVideo.duration} · {selectedVideo.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg bg-[#222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Player */}
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mb-6">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoUrl.split("v=")[1] || ""}`}
                title={selectedVideo.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>

            {/* Notes Notepad & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-purple-400" />
                  Your Study Notes & Key Takeaways
                </label>
                <textarea
                  rows={4}
                  value={activeNoteText}
                  onChange={(e) => setActiveNoteText(e.target.value)}
                  placeholder="Record crucial formula, complexity notes, edge cases, or architecture patterns..."
                  className="w-full bg-[#121214] text-gray-200 text-xs rounded-xl p-3 border border-gray-800 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Note to Cloud
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#121214] border border-gray-800 space-y-3">
                <div className="text-xs font-semibold text-white">Lesson Actions</div>
                <button
                  type="button"
                  onClick={() => handleToggleComplete(selectedVideo.id, selectedVideo.isCompleted)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    selectedVideo.isCompleted
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-[#1c1c20] text-gray-300 border-gray-700 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedVideo.isCompleted ? "Marked as Completed" : "Mark as Completed"}
                </button>

                <a
                  href={selectedVideo.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-gray-400 hover:text-white border border-gray-800 flex items-center justify-center gap-1.5"
                >
                  Open on YouTube <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
