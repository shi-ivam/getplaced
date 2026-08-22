import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Circle,
  BookOpen,
  Play,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  Sparkles,
  Layers,
  Zap,
  Target,
  Trophy,
  BarChart3,
  Bookmark,
  Share2,
  Code2
} from "lucide-react";
import { sheetsService } from "@/services/sheetsService";
import SheetArticleModal from "./SheetArticleModal";
import SheetVideoModal from "./SheetVideoModal";

export default function SheetViewer({ sheetId, onBack }) {
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyRunnable, setOnlyRunnable] = useState(false);

  // Section accordions
  const [expandedSections, setExpandedSections] = useState({});

  // Modals
  const [activeArticleSlug, setActiveArticleSlug] = useState(null);
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: "", title: "" });

  // Solved state tracking
  const [solvedMap, setSolvedMap] = useState(() => sheetsService.getSolvedMap());

  // Listen for progress updates
  useEffect(() => {
    const handleProgressUpdate = (e) => {
      setSolvedMap(e.detail || sheetsService.getSolvedMap());
    };
    window.addEventListener("getplaced_sheet_progress_updated", handleProgressUpdate);
    return () => window.removeEventListener("getplaced_sheet_progress_updated", handleProgressUpdate);
  }, []);

  // Fetch sheet details
  useEffect(() => {
    if (!sheetId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    sheetsService
      .getSheetDetails(sheetId)
      .then((data) => {
        if (isMounted) {
          setSheet(data);
          // Expand all sections by default
          const exp = {};
          data.sections?.forEach((sec, idx) => {
            exp[sec.section_id || `sec-${idx}`] = true;
          });
          setExpandedSections(exp);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.detail || "Failed to load sheet details.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sheetId]);

  const toggleSection = (secId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const handleToggleSolved = (problem) => {
    const key = problem.problem_name || problem.problem_id;
    sheetsService.toggleProblemSolved(key, {
      ...problem,
      sheet_id: sheetId,
    });
    setSolvedMap(sheetsService.getSolvedMap());
  };

  // Calculate solved counts for this sheet
  const { totalInSheet, solvedInSheet, solvedPct } = useMemo(() => {
    if (!sheet || !sheet.sections) return { totalInSheet: 0, solvedInSheet: 0, solvedPct: 0 };

    let total = 0;
    let solved = 0;

    sheet.sections.forEach((sec) => {
      const probs = [];
      if (sec.subcategories) {
        sec.subcategories.forEach((sub) => probs.push(...(sub.problems || [])));
      } else if (sec.problems) {
        probs.push(...sec.problems);
      }

      probs.forEach((p) => {
        total++;
        const key = p.problem_name || p.problem_id;
        if (solvedMap[key]) solved++;
      });
    });

    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { totalInSheet: total, solvedInSheet: solved, solvedPct: pct };
  }, [sheet, solvedMap]);

  // Filter sections & problems
  const filteredSections = useMemo(() => {
    if (!sheet || !sheet.sections) return [];

    const q = searchQuery.toLowerCase().trim();

    return sheet.sections
      .map((sec) => {
        if (sec.subcategories) {
          const filteredSubcats = sec.subcategories
            .map((sub) => {
              const matchedProbs = (sub.problems || []).filter((p) => {
                const key = p.problem_name || p.problem_id;
                const isSolved = !!solvedMap[key];

                if (q && !p.problem_name.toLowerCase().includes(q)) return false;
                if (difficultyFilter !== "all" && p.difficulty?.toLowerCase() !== difficultyFilter.toLowerCase())
                  return false;
                if (statusFilter === "solved" && !isSolved) return false;
                if (statusFilter === "unsolved" && isSolved) return false;
                if (onlyRunnable && !p.is_ide_runnable) return false;

                return true;
              });

              return {
                ...sub,
                problems: matchedProbs,
              };
            })
            .filter((sub) => sub.problems.length > 0);

          return {
            ...sec,
            subcategories: filteredSubcats,
            visibleCount: filteredSubcats.reduce((sum, s) => sum + s.problems.length, 0),
          };
        } else if (sec.problems) {
          const matchedProbs = (sec.problems || []).filter((p) => {
            const key = p.problem_name || p.problem_id;
            const isSolved = !!solvedMap[key];

            if (q && !p.problem_name.toLowerCase().includes(q)) return false;
            if (difficultyFilter !== "all" && p.difficulty?.toLowerCase() !== difficultyFilter.toLowerCase())
              return false;
            if (statusFilter === "solved" && !isSolved) return false;
            if (statusFilter === "unsolved" && isSolved) return false;
            if (onlyRunnable && !p.is_ide_runnable) return false;

            return true;
          });

          return {
            ...sec,
            problems: matchedProbs,
            visibleCount: matchedProbs.length,
          };
        }
        return sec;
      })
      .filter((sec) => sec.visibleCount > 0);
  }, [sheet, searchQuery, difficultyFilter, statusFilter, onlyRunnable, solvedMap]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-6 h-6 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-zinc-400">Loading curriculum...</p>
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="text-base font-bold text-white">Sheet Not Found</h3>
        <p className="text-xs text-zinc-400">{error || "Could not retrieve curriculum data."}</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
        >
          Return to Curricula Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Navigation & Meta */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sheets</span>
        </button>

        {sheet.original_url && (
          <a
            href={sheet.original_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <span>takeuforward.org</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Main Banner Card */}
      <div className="p-5 md:p-6 rounded-xl bg-[#121215] border border-zinc-800/90 relative overflow-hidden space-y-6">
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {sheet.category_title || "DSA Sheet"}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {sheet.total_sections} Sections · {sheet.total_problems} Problems & Lessons
                </span>
                {sheet.ide_runnable_count > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Terminal className="w-3 h-3" /> {sheet.ide_runnable_count} IDE Sandbox
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {sheet.title}
              </h1>

              {sheet.description && (
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">{sheet.description}</p>
              )}
            </div>

            {/* Overall Completion Gauge Card */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 shrink-0 min-w-[200px] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Completion</span>
                <span className="text-white font-bold">{solvedPct}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-zinc-200 transition-all duration-500 rounded-full"
                  style={{ width: `${solvedPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>{solvedInSheet} Solved</span>
                <span>{totalInSheet - solvedInSheet} Remaining</span>
              </div>
            </div>
          </div>

          {/* Difficulty Statistics Breakdown */}
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-zinc-800/60 text-xs font-mono">
            <span className="text-zinc-500">Difficulty Distribution:</span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Easy: {sheet.difficulty_breakdown?.easy || 0}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              Medium: {sheet.difficulty_breakdown?.medium || 0}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
              Hard: {sheet.difficulty_breakdown?.hard || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems in this sheet (e.g., Two Sum, DP, Subarray, Tree)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-mono"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy Only</option>
            <option value="medium">Medium Only</option>
            <option value="hard">Hard Only</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-mono"
          >
            <option value="all">All Status</option>
            <option value="solved">Solved Only</option>
            <option value="unsolved">Unsolved Only</option>
          </select>

          {/* Only Runnable toggle */}
          <button
            type="button"
            onClick={() => setOnlyRunnable(!onlyRunnable)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              onlyRunnable
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>IDE Sandbox</span>
          </button>
        </div>
      </div>

      {/* Hierarchical Sections Accordions */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800/60 space-y-2">
            <Filter className="w-8 h-8 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Matching Problems</h4>
            <p className="text-xs text-zinc-400">Try clearing filters or search query to view all problems.</p>
          </div>
        ) : (
          filteredSections.map((sec, secIdx) => {
            const secKey = sec.section_id || `sec-${secIdx}`;
            const isExpanded = expandedSections[secKey] !== false;

            return (
              <div
                key={secKey}
                className="rounded-2xl bg-[#0e0e11] border border-zinc-800/80 overflow-hidden shadow-lg transition-all"
              >
                {/* Section Header Trigger */}
                <button
                  type="button"
                  onClick={() => toggleSection(secKey)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-zinc-900/40 transition-colors cursor-pointer border-b border-zinc-800/40"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-purple-400 shrink-0">
                      {secIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{sec.section_name}</h3>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {sec.visibleCount} problem{sec.visibleCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-white" : "rotate-0"
                      }`}
                    />
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-3 sm:p-5 space-y-4 bg-zinc-950/40">
                    {/* Render with subcategories */}
                    {sec.subcategories ? (
                      sec.subcategories.map((subcat, subIdx) => (
                        <div key={subcat.subcategory_id || `sub-${subIdx}`} className="space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-400 px-1 pt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>{subcat.subcategory_name}</span>
                            <span className="text-[10px] text-zinc-600">({subcat.problems.length})</span>
                          </div>

                          <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800/70 overflow-hidden bg-[#111114]">
                            {subcat.problems.map((prob) => (
                              <ProblemRowItem
                                key={prob.problem_id || prob.problem_name}
                                problem={prob}
                                isSolved={!!solvedMap[prob.problem_name || prob.problem_id]}
                                onToggleSolved={() => handleToggleSolved(prob)}
                                onOpenArticle={() => setActiveArticleSlug(prob.article_slug || prob.problem_name)}
                                onOpenVideo={(url) =>
                                  setVideoModal({ isOpen: true, url, title: prob.problem_name })
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Direct problems without subcategories */
                      <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800/70 overflow-hidden bg-[#111114]">
                        {sec.problems.map((prob) => (
                          <ProblemRowItem
                            key={prob.problem_id || prob.problem_name}
                            problem={prob}
                            isSolved={!!solvedMap[prob.problem_name || prob.problem_id]}
                            onToggleSolved={() => handleToggleSolved(prob)}
                            onOpenArticle={() => setActiveArticleSlug(prob.article_slug || prob.problem_name)}
                            onOpenVideo={(url) =>
                              setVideoModal({ isOpen: true, url, title: prob.problem_name })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Article Tutorial Modal */}
      {activeArticleSlug && (
        <SheetArticleModal
          slugOrId={activeArticleSlug}
          onClose={() => setActiveArticleSlug(null)}
          onOpenVideo={(url, title) => {
            setActiveArticleSlug(null);
            setVideoModal({ isOpen: true, url, title });
          }}
        />
      )}

      {/* Video Solution Modal */}
      {videoModal.isOpen && (
        <SheetVideoModal
          videoUrl={videoModal.url}
          title={videoModal.title}
          onClose={() => setVideoModal({ isOpen: false, url: "", title: "" })}
        />
      )}
    </div>
  );
}

// Single Problem Row Component
function ProblemRowItem({ problem, isSolved, onToggleSolved, onOpenArticle, onOpenVideo }) {
  const diffLower = (problem.difficulty || "").toLowerCase();
  const diffBadgeColor =
    diffLower === "easy"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : diffLower === "medium"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : "bg-rose-500/10 text-rose-400 border-rose-500/20";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-zinc-800/40 transition-colors">
      {/* Left: Checkmark & Title */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <button
          type="button"
          onClick={onToggleSolved}
          className="text-zinc-600 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
          title={isSolved ? "Mark as unsolved" : "Mark as completed"}
        >
          {isSolved ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs sm:text-sm font-semibold tracking-tight ${
                isSolved ? "text-zinc-400 line-through" : "text-white"
              }`}
            >
              {problem.problem_name}
            </span>

            <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded border ${diffBadgeColor}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
        {/* Article Tutorial Reader Button */}
        {problem.has_article && (
          <button
            type="button"
            onClick={onOpenArticle}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-purple-300 text-xs font-medium border border-zinc-700/50 transition-colors cursor-pointer"
            title="Read complete offline tutorial & code snippets"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>
        )}

        {/* Video Solution Button */}
        {problem.youtube_url && (
          <button
            type="button"
            onClick={() => onOpenVideo(problem.youtube_url)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium border border-red-500/20 transition-colors cursor-pointer"
            title="Watch video lecture"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Video</span>
          </button>
        )}

        {/* Solve in Live IDE Button */}
        {problem.is_ide_runnable && problem.leetcode_slug ? (
          <Link
            to={`/app/coding/${problem.leetcode_slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
            title="Open in getPlaced live Monaco IDE & sandbox runner"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Solve</span>
          </Link>
        ) : problem.leetcode_url ? (
          <a
            href={problem.leetcode_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            title="Open problem on LeetCode"
          >
            <span>LeetCode</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : problem.practice_url ? (
          <a
            href={problem.practice_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            <span>Practice</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
