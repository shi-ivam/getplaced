import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Code2,
  CheckCircle2,
  Circle,
  Shuffle,
  Sparkles,
  Flame,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  BookOpen,
  Trophy,
  BrainCircuit,
  ExternalLink,
  Layers,
  Terminal
} from "lucide-react";
import { leetcodeService } from "@/services/leetcodeService";

const CURATED_LISTS = [
  { id: "all", label: "All Problems", icon: Layers },
  { id: "blind75", label: "Blind 75", icon: Flame, tag: "Array" },
  { id: "top150", label: "Top Interview 150", icon: Trophy, tag: "Hash Table" },
  { id: "dp", label: "Dynamic Programming", icon: BrainCircuit, tag: "Dynamic Programming" },
  { id: "trees", label: "Trees & Graphs", icon: Zap, tag: "Tree" },
];

export default function CodingArena() {
  const navigate = useNavigate();

  // State
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 2869, easy: 686, medium: 1498, hard: 685 });
  const [tags, setTags] = useState([]);
  const [solvedMap, setSolvedMap] = useState({});

  // Filters & Pagination
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("question_id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Load initial stats, tags, and solved cache
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [statsData, tagsData] = await Promise.all([
          leetcodeService.getStats().catch(() => ({ total: 2869, easy: 686, medium: 1498, hard: 685 })),
          leetcodeService.getTags().catch(() => [])
        ]);
        setStats(statsData);
        setTags(tagsData.slice(0, 25)); // Top 25 tags
      } catch (err) {
        console.error("Failed to load leetcode metadata:", err);
      }
      setSolvedMap(leetcodeService.getSolvedProblems());
    }
    loadMetadata();
  }, []);

  // Fetch problems on filter/page change
  useEffect(() => {
    let isCancelled = false;
    async function fetchProblemsList() {
      setLoading(true);
      setError(null);
      try {
        const data = await leetcodeService.getProblems({
          page,
          pageSize,
          search: searchQuery,
          difficulty: selectedDifficulty,
          tag: selectedTag !== "all" ? selectedTag : (activeTab !== "all" ? CURATED_LISTS.find(c => c.id === activeTab)?.tag : ""),
          sortBy,
          sortOrder,
        });

        if (!isCancelled) {
          setProblems(data.problems || []);
          setTotalCount(data.total || 0);
          setTotalPages(data.total_pages || 1);
        }
      } catch (err) {
        if (!isCancelled) {
          setError("Failed to load problems. Please ensure backend services are running.");
          console.error(err);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProblemsList();
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [page, pageSize, searchQuery, selectedDifficulty, selectedTag, activeTab, sortBy, sortOrder]);

  // Solved Stats calculation
  const solvedCount = useMemo(() => Object.keys(solvedMap).length, [solvedMap]);
  const solvedEasy = useMemo(() => Object.values(solvedMap).filter(p => p.difficulty?.toLowerCase() === "easy").length, [solvedMap]);
  const solvedMed = useMemo(() => Object.values(solvedMap).filter(p => p.difficulty?.toLowerCase() === "medium").length, [solvedMap]);
  const solvedHard = useMemo(() => Object.values(solvedMap).filter(p => p.difficulty?.toLowerCase() === "hard").length, [solvedMap]);

  // Handle Pick Random
  const handlePickRandom = async () => {
    try {
      const res = await leetcodeService.getRandomProblem({
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : "",
        tag: selectedTag !== "all" ? selectedTag : "",
      });
      if (res && res.task_id) {
        navigate(`/app/coding/${res.task_id}`);
      }
    } catch (err) {
      console.error("Pick random error:", err);
      // Fallback to two-sum
      navigate("/app/coding/two-sum");
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "hard":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-gray-100 p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-zinc-900 border border-purple-800/30 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide">
              <Terminal className="w-3.5 h-3.5" />
              <span>LeetCode Practice Arena • 2,800+ Official Problems</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Master Data Structures & Algorithms
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Solve real interview coding challenges with live Python execution, sub-millisecond test evaluations, instant Big-O analysis, and Gemini AI interview assistance.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePickRandom}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/20 active:scale-95 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Pick Random Problem</span>
            </button>
            <Link
              to="/app/coding/two-sum"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-gray-200 font-medium text-sm transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Daily Challenge</span>
            </Link>
          </div>
        </div>

        {/* Progress & Stat Cards Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800/80">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Problems Solved</div>
              <div className="text-xl font-bold text-white flex items-baseline gap-1">
                <span>{solvedCount}</span>
                <span className="text-xs font-normal text-gray-500">/ {stats.total}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              E
            </div>
            <div>
              <div className="text-xs text-gray-400">Easy Solved</div>
              <div className="text-xl font-bold text-emerald-400 flex items-baseline gap-1">
                <span>{solvedEasy}</span>
                <span className="text-xs font-normal text-gray-500">/ {stats.easy}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              M
            </div>
            <div>
              <div className="text-xs text-gray-400">Medium Solved</div>
              <div className="text-xl font-bold text-amber-400 flex items-baseline gap-1">
                <span>{solvedMed}</span>
                <span className="text-xs font-normal text-gray-500">/ {stats.medium}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
              H
            </div>
            <div>
              <div className="text-xs text-gray-400">Hard Solved</div>
              <div className="text-xl font-bold text-rose-400 flex items-baseline gap-1">
                <span>{solvedHard}</span>
                <span className="text-xs font-normal text-gray-500">/ {stats.hard}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curated Track Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {CURATED_LISTS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
                if (tab.id !== "all") setSelectedTag("all");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold"
                  : "bg-zinc-900/80 hover:bg-zinc-800 text-gray-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 md:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, keywords, tags, or question number (e.g. 1, Two Sum, DP)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Difficulty Dropdown / Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
            {["all", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDifficulty(d.toLowerCase());
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedDifficulty === d.toLowerCase()
                    ? d === "Easy"
                      ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                      : d === "Medium"
                      ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                      : d === "Hard"
                      ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40"
                      : "bg-purple-600 text-white font-bold"
                    : "text-gray-400 hover:text-gray-200 hover:bg-zinc-800"
                }`}
              >
                {d === "all" ? "All Levels" : d}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="question_id-asc">Sort: # ID Ascending</option>
              <option value="question_id-desc">Sort: # ID Descending</option>
              <option value="difficulty-asc">Sort: Difficulty (Easy → Hard)</option>
              <option value="difficulty-desc">Sort: Difficulty (Hard → Easy)</option>
              <option value="title-asc">Sort: Title (A → Z)</option>
            </select>
          </div>
        </div>

        {/* Topic Tag Chips */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-800/60">
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Topics:
            </span>
            <button
              onClick={() => {
                setSelectedTag("all");
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                selectedTag === "all"
                  ? "bg-purple-600 text-white font-semibold"
                  : "bg-zinc-950 text-gray-400 hover:text-gray-200 border border-zinc-800"
              }`}
            >
              All Topics
            </button>
            {tags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(selectedTag === tag ? "all" : tag);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? "bg-purple-600 text-white font-semibold"
                    : "bg-zinc-950 text-gray-400 hover:text-gray-200 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span>{tag}</span>
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Problems List Table */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <span>Problem Catalog</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-gray-400 font-normal">
              Showing {problems.length} of {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Per page:</span>
            {[20, 50, 100].map((sz) => (
              <button
                key={sz}
                onClick={() => {
                  setPageSize(sz);
                  setPage(1);
                }}
                className={`px-2 py-1 rounded ${
                  pageSize === sz ? "bg-purple-600 text-white font-bold" : "hover:bg-zinc-800 text-gray-400"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400">Fetching LeetCode problems from database...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-rose-400 text-sm">{error}</p>
            <button
              onClick={() => setPage(page)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : problems.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Code2 className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-base font-semibold text-gray-300">No problems found</h3>
            <p className="text-xs text-gray-500">Try adjusting your search query, difficulty, or tag filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-zinc-950/40">
                  <th className="py-3.5 px-4 w-16 text-center">Status</th>
                  <th className="py-3.5 px-4 w-20">#</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4 w-32">Difficulty</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Topics</th>
                  <th className="py-3.5 px-4 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {problems.map((prob) => {
                  const isSolved = !!solvedMap[prob.task_id];
                  return (
                    <tr
                      key={prob.id}
                      className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/app/coding/${prob.task_id}`)}
                    >
                      {/* Solved Status */}
                      <td className="py-4 px-4 text-center">
                        {isSolved ? (
                          <div className="inline-flex items-center justify-center text-emerald-400" title="Solved">
                            <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center text-zinc-600">
                            <Circle className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Problem Number */}
                      <td className="py-4 px-4 font-mono text-xs text-gray-400 font-medium">
                        {prob.question_id}
                      </td>

                      {/* Problem Title */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <Link
                            to={`/app/coding/${prob.task_id}`}
                            className="font-medium text-gray-200 group-hover:text-purple-400 transition-colors flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>{prob.title}</span>
                          </Link>
                          {prob.preview && (
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-xl">
                              {prob.preview}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
                            prob.difficulty
                          )}`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {prob.tags?.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 bg-zinc-800 text-gray-400 rounded text-[11px] border border-zinc-700/50"
                            >
                              {t}
                            </span>
                          ))}
                          {prob.tags?.length > 3 && (
                            <span className="px-1.5 py-0.5 text-gray-500 text-[10px]">
                              +{prob.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/app/coding/${prob.task_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSolved
                              ? "bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/20"
                              : "bg-purple-600/90 hover:bg-purple-600 text-white shadow-sm"
                          }`}
                        >
                          <span>{isSolved ? "Review" : "Solve"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            Showing Page <span className="font-semibold text-gray-200">{page}</span> of{" "}
            <span className="font-semibold text-gray-200">{totalPages}</span> ({totalCount} total problems)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Quick jump page numbers */}
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-medium text-xs transition-colors ${
                      page === pageNum
                        ? "bg-purple-600 text-white font-bold"
                        : "bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
