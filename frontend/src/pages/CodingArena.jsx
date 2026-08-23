import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
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
  Trophy,
  BrainCircuit,
  ExternalLink,
  Layers,
  Terminal,
  ArrowRight,
  Activity,
  Play,
  Check,
  RotateCcw,
} from "lucide-react";
import { leetcodeService } from "@/services/leetcodeService";
import LeetCodeSubmissionAnalysis from "@/components/leetcode/LeetCodeSubmissionAnalysis";
import SheetsHub from "@/components/sheets/SheetsHub";

const CURATED_LISTS = [
  { id: "all", label: "All Problems", icon: Layers },
  { id: "blind75", label: "Blind 75", icon: Flame, tag: "Array" },
  { id: "top150", label: "Top Interview 150", icon: Trophy, tag: "Hash Table" },
  { id: "dp", label: "Dynamic Programming", icon: BrainCircuit, tag: "Dynamic Programming" },
  { id: "trees", label: "Trees & Graphs", icon: Zap, tag: "Tree" },
];

export default function CodingArena() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const containerRef = useRef(null);

  // Pillar Workspace Tab: 'overview' | 'practice' | 'topics' | 'submissions' | 'learning'
  const [workspaceTab, setWorkspaceTab] = useState(initialTab);

  // State for Problems Catalog
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [tags, setTags] = useState([]);
  const [solvedMap, setSolvedMap] = useState({});
  const [leetcodeProfile, setLeetcodeProfile] = useState(null);

  // Filters & Pagination for Practice Tab
  const [activeCuratedTrack, setActiveCuratedTrack] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("question_id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Sync tab with URL query parameter
  const handleTabChange = (newTab) => {
    setWorkspaceTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  // Load initial stats, tags, solved cache, and profile
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [statsData, tagsData, profileData] = await Promise.all([
          leetcodeService.getStats().catch(() => ({ total: 0, easy: 0, medium: 0, hard: 0 })),
          leetcodeService.getTags().catch(() => []),
          leetcodeService.getProfile().catch(() => null),
        ]);
        if (statsData) setStats(statsData);
        if (tagsData) setTags(tagsData.slice(0, 25)); // Top 25 tags
        if (profileData?.connected && profileData?.profile) {
          setLeetcodeProfile(profileData.profile);
        }
      } catch (err) {
        console.error("Failed to load leetcode metadata:", err);
      }

      await leetcodeService.fetchWorkspaceState();
      setSolvedMap(leetcodeService.getSolvedProblems());
    }
    loadMetadata();
  }, []);

  // GSAP Tab Reveal
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".gsap-reveal"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }
      );
    }
  }, [workspaceTab]);

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
          tag:
            selectedTag !== "all"
              ? selectedTag
              : activeCuratedTrack !== "all"
              ? CURATED_LISTS.find((c) => c.id === activeCuratedTrack)?.tag
              : "",
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
  }, [page, pageSize, searchQuery, selectedDifficulty, selectedTag, activeCuratedTrack, sortBy, sortOrder]);

  // Solved Stats calculation
  const solvedCount = useMemo(() => Object.keys(solvedMap).length, [solvedMap]);
  const solvedEasy = useMemo(
    () => Object.values(solvedMap).filter((p) => p.difficulty?.toLowerCase() === "easy").length,
    [solvedMap]
  );
  const solvedMed = useMemo(
    () => Object.values(solvedMap).filter((p) => p.difficulty?.toLowerCase() === "medium").length,
    [solvedMap]
  );
  const solvedHard = useMemo(
    () => Object.values(solvedMap).filter((p) => p.difficulty?.toLowerCase() === "hard").length,
    [solvedMap]
  );

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
        return "text-zinc-400 bg-zinc-800 border-zinc-700";
    }
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 lg:p-10 font-sans selection:bg-zinc-800 selection:text-white">
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-8">
        
        {/* Workspace Top Header */}
        <header className="gsap-reveal flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
              Coding Arena
            </h1>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl">
              Solve interview coding challenges with real-time test evaluations, topic gap tracking, and structured study plans.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handlePickRandom}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors cursor-pointer font-mono"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Pick Random</span>
            </button>
            <Link
              to="/app/coding/two-sum"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-colors font-mono"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Problem</span>
            </Link>
          </div>
        </header>

        {/* 4 Workspace Pillar Tabs */}
        <nav className="gsap-reveal flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "sheets", label: "Study Plans", icon: Sparkles },
            { id: "practice", label: "Problem Catalog", icon: Terminal },
            { id: "submissions", label: "Submissions", icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = workspaceTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                    : "bg-[#121215] hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: OVERVIEW */}
        {workspaceTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Hero Banner */}
            <section className="gsap-reveal rounded-2xl bg-[#121215] border border-zinc-800 p-6 md:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      DSA Readiness Score
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono font-medium">
                      25% Weight
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-bold font-mono text-zinc-100 tracking-tight">
                      {leetcodeProfile?.totalSolved
                        ? Math.min(100, Math.round((leetcodeProfile.totalSolved / 150) * 100))
                        : solvedCount > 0
                        ? Math.min(100, Math.round((solvedCount / 150) * 100))
                        : 0}
                    </span>
                    <span className="text-lg font-mono text-zinc-500">/ 100</span>

                    <div className="hidden sm:flex flex-col text-xs text-zinc-400 pl-4 border-l border-zinc-800 space-y-0.5 font-mono">
                      <div>
                        Target Benchmark: <span className="text-zinc-200">85 / 100</span>
                      </div>
                      <div>
                        Status: <span className="text-emerald-400">
                          {((leetcodeProfile?.totalSolved || solvedCount) >= 120) ? "Competitive" : "In Progress"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 max-w-xl leading-relaxed font-sans">
                    Evaluated across Arrays, Trees, Dynamic Programming, and Graph algorithms with automated testcase evaluation.
                  </p>
                </div>

                {/* Score vs Target Box */}
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-1 gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shrink-0 text-xs font-mono">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6">
                    <span className="text-zinc-500 text-[11px]">Total Solved</span>
                    <span className="font-semibold text-purple-400">
                      {leetcodeProfile?.totalSolved || solvedCount} / {stats.total || "2,800+"}
                    </span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6 border-l lg:border-l-0 lg:border-t border-zinc-800 pl-3 lg:pl-0 lg:pt-2">
                    <span className="text-zinc-500 text-[11px]">Target</span>
                    <span className="font-semibold text-zinc-300">150 Problems</span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6 border-l lg:border-l-0 lg:border-t border-zinc-800 pl-3 lg:pl-0 lg:pt-2">
                    <span className="text-zinc-500 text-[11px]">Acceptance</span>
                    <span className="font-semibold text-emerald-400">
                      {leetcodeProfile?.acceptanceRate ? `${leetcodeProfile.acceptanceRate}%` : solvedCount > 0 ? "100%" : "Unassessed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                  <span>Solved: {solvedCount} problems</span>
                  <span>Target Benchmark: 150 problems</span>
                </div>
                <div className="relative w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (solvedCount / 150) * 100))}%` }}
                  />
                </div>
              </div>
            </section>

            {/* 4 Bento Stat Cards */}
            <section className="gsap-reveal grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">Total Solved</div>
                  <div className="text-lg font-bold font-mono text-zinc-100 flex items-baseline gap-1">
                    <span>{solvedCount}</span>
                    <span className="text-xs font-normal text-zinc-500">/ {stats.total}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono text-xs shrink-0">
                  E
                </div>
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">Easy Solved</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 flex items-baseline gap-1">
                    <span>{solvedEasy}</span>
                    <span className="text-xs font-normal text-zinc-500">/ {stats.easy}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold font-mono text-xs shrink-0">
                  M
                </div>
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">Medium Solved</div>
                  <div className="text-lg font-bold font-mono text-amber-400 flex items-baseline gap-1">
                    <span>{solvedMed}</span>
                    <span className="text-xs font-normal text-zinc-500">/ {stats.medium}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold font-mono text-xs shrink-0">
                  H
                </div>
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">Hard Solved</div>
                  <div className="text-lg font-bold font-mono text-rose-400 flex items-baseline gap-1">
                    <span>{solvedHard}</span>
                    <span className="text-xs font-normal text-zinc-500">/ {stats.hard}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Action Matrix Grid */}
            <section className="gsap-reveal grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div
                onClick={() => handleTabChange("practice")}
                className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-2.5 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      Problem Catalog
                    </h4>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Browse catalog with difficulty filters, curated tracks, and interactive editor.
                </p>
              </div>

              <div
                onClick={() => handleTabChange("sheets")}
                className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-2.5 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      Study Plans
                    </h4>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Curated topic study plans with structured milestone tracking.
                </p>
              </div>

              <div
                onClick={() => handleTabChange("submissions")}
                className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-2.5 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      Submission Activity
                    </h4>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Review problem submissions, runtime stats, and execution logs.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: STUDY PLAN & PLACEMENT SHEETS */}
        {workspaceTab === "sheets" && (
          <div className="gsap-reveal space-y-6">
            <SheetsHub />
          </div>
        )}

        {/* TAB 3: PROBLEM CATALOG (PRACTICE) */}
        {workspaceTab === "practice" && (
          <div className="space-y-6">
            {/* Curated Track Tabs */}
            <div className="gsap-reveal flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
              {CURATED_LISTS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeCuratedTrack === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveCuratedTrack(tab.id);
                      setPage(1);
                      if (tab.id !== "all") setSelectedTag("all");
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                        : "bg-[#121215] hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter and Search Bar */}
            <div className="gsap-reveal bg-[#121215] border border-zinc-800 rounded-xl p-4 space-y-3.5">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search problem title, tags, or ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors font-mono"
                  />
                </div>

                {/* Difficulty Buttons */}
                <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                  {["all", "Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDifficulty(d.toLowerCase());
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer font-mono ${
                        selectedDifficulty === d.toLowerCase()
                          ? d === "Easy"
                            ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                            : d === "Medium"
                            ? "bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20"
                            : d === "Hard"
                            ? "bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20"
                            : "bg-zinc-100 text-zinc-950 font-semibold"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {d === "all" ? "All Levels" : d}
                    </button>
                  ))}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-2 font-mono">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sb, so] = e.target.value.split("-");
                      setSortBy(sb);
                      setSortOrder(so);
                    }}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 cursor-pointer"
                  >
                    <option value="question_id-asc">Sort: ID (Ascending)</option>
                    <option value="question_id-desc">Sort: ID (Descending)</option>
                    <option value="difficulty-asc">Sort: Difficulty (Easy → Hard)</option>
                    <option value="difficulty-desc">Sort: Difficulty (Hard → Easy)</option>
                    <option value="title-asc">Sort: Title (A → Z)</option>
                  </select>
                </div>
              </div>

              {/* Topic Tag Chips */}
              {tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-800 font-mono">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1 mr-1">
                    <Filter className="w-3 h-3" /> Topics:
                  </span>
                  <button
                    onClick={() => {
                      setSelectedTag("all");
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                      selectedTag === "all"
                        ? "bg-zinc-100 text-zinc-950 font-semibold"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    All
                  </button>
                  {tags.map(({ tag }) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(selectedTag === tag ? "all" : tag);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                        selectedTag === tag
                          ? "bg-zinc-100 text-zinc-950 font-semibold"
                          : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Problems List Table */}
            <div className="gsap-reveal bg-[#121215] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-mono">
                <div className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                  <span>Problem Catalog</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-[11px] text-zinc-400 border border-zinc-800">
                    Showing {problems.length} of {totalCount}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="text-[11px]">Per page:</span>
                  {[20, 50, 100].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setPageSize(sz);
                        setPage(1);
                      }}
                      className={`px-2 py-1 rounded text-xs cursor-pointer ${
                        pageSize === sz
                          ? "bg-zinc-100 text-zinc-950 font-semibold"
                          : "hover:bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-16 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400 font-mono">Loading problem catalog...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center space-y-3">
                  <p className="text-rose-400 text-xs font-mono">{error}</p>
                  <button
                    onClick={() => setPage(page)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg cursor-pointer font-mono"
                  >
                    Retry
                  </button>
                </div>
              ) : problems.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <Code2 className="w-8 h-8 text-zinc-600 mx-auto" />
                  <h3 className="text-xs font-semibold text-zinc-300">No matching problems found</h3>
                  <p className="text-xs text-zinc-500">Adjust your search query, difficulty, or tag filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-wider bg-zinc-950/40">
                        <th className="py-3 px-4 w-14 text-center">Status</th>
                        <th className="py-3 px-4 w-16">#</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4 w-28">Difficulty</th>
                        <th className="py-3 px-4 hidden md:table-cell">Topics</th>
                        <th className="py-3 px-4 w-24 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-xs">
                      {problems.map((prob) => {
                        const isSolved = !!solvedMap[prob.task_id];
                        return (
                          <tr
                            key={prob.id}
                            className="hover:bg-zinc-900/60 transition-colors group cursor-pointer"
                            onClick={() => navigate(`/app/coding/${prob.task_id}`)}
                          >
                            <td className="py-3.5 px-4 text-center">
                              {isSolved ? (
                                <div className="inline-flex items-center justify-center text-emerald-400" title="Solved">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center text-zinc-600">
                                  <Circle className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                              {prob.question_id}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <Link
                                  to={`/app/coding/${prob.task_id}`}
                                  className="font-medium text-zinc-200 group-hover:text-purple-400 transition-colors flex items-center gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>{prob.title}</span>
                                </Link>
                                {prob.preview && (
                                  <p className="text-[11px] text-zinc-500 line-clamp-1 max-w-xl font-sans">
                                    {prob.preview}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${getDifficultyColor(
                                  prob.difficulty
                                )}`}
                              >
                                {prob.difficulty}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 hidden md:table-cell">
                              <div className="flex flex-wrap gap-1.5 max-w-md">
                                {prob.tags?.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded text-[10px] font-mono border border-zinc-800"
                                  >
                                    {t}
                                  </span>
                                ))}
                                {prob.tags?.length > 3 && (
                                  <span className="px-1.5 py-0.5 text-zinc-500 text-[10px] font-mono">
                                    +{prob.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <Link
                                to={`/app/coding/${prob.task_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium font-mono transition-colors ${
                                  isSolved
                                    ? "bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/20"
                                    : "bg-zinc-100 hover:bg-white text-zinc-950 font-semibold"
                                }`}
                              >
                                <span>{isSolved ? "Review" : "Solve"}</span>
                                <ChevronRight className="w-3 h-3" />
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
              <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
                <div>
                  Page <span className="font-semibold text-zinc-200">{page}</span> of{" "}
                  <span className="font-semibold text-zinc-200">{totalPages}</span> ({totalCount} total problems)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum =
                        page <= 3
                          ? i + 1
                          : page >= totalPages - 2
                          ? totalPages - 4 + i
                          : page - 2 + i;
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-7 h-7 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                            page === pageNum
                              ? "bg-zinc-100 text-zinc-950 font-bold"
                              : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400"
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
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUBMISSIONS ACTIVITY */}
        {workspaceTab === "submissions" && (
          <section className="gsap-reveal space-y-6">
            <LeetCodeSubmissionAnalysis />
          </section>
        )}

      </div>
    </main>
  );
}
