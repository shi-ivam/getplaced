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
import CaideBadge from "@/components/caide/CaideBadge";

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
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-3 border-[#0D0431] border-t-transparent animate-spin" />
        <p className="text-xs font-mono font-bold text-[#0D0431]">Loading curriculum...</p>
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="py-20 text-center space-y-4 bg-white border-2 border-[#0D0431] rounded-3xl p-8 shadow-[6px_6px_0_0_#0D0431]">
        <h3 className="text-lg font-heading font-black text-[#0D0431]">Sheet Not Found</h3>
        <p className="text-xs text-[#0D0431]/75 font-medium">{error || "Could not retrieve curriculum data."}</p>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-[#FEDF6A] text-xs font-mono font-bold text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:bg-[#FFE995] transition-all cursor-pointer"
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
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0D0431] bg-white border-2 border-[#0D0431] px-4 py-2 rounded-xl shadow-[2px_2px_0_0_#0D0431] hover:bg-[#FEDF6A] hover:-translate-x-0.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sheets</span>
        </button>

        {sheet.original_url && (
          <a
            href={sheet.original_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono font-bold text-[#0D0431] hover:text-[#896EE2] transition-colors flex items-center gap-1 bg-[#FEF9CF] border-2 border-[#0D0431] px-3 py-1.5 rounded-xl shadow-[2px_2px_0_0_#0D0431]"
          >
            <span>takeuforward.org</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Main Banner Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border-2 border-[#0D0431] shadow-[6px_6px_0_0_#0D0431] relative overflow-hidden space-y-6">
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-lg bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                  {sheet.category_title || "DSA Sheet"}
                </span>
                <span className="text-[11px] font-mono font-bold text-[#0D0431]/75">
                  {sheet.total_sections} Sections · {sheet.total_problems} Problems & Lessons
                </span>
                {sheet.ide_runnable_count > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-[#0D0431]" /> {sheet.ide_runnable_count} IDE Sandbox
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-[#0D0431] tracking-tight leading-tight">
                {sheet.title}
              </h1>

              {sheet.description && (
                <p className="text-xs sm:text-sm text-[#0D0431]/80 leading-relaxed font-sans font-medium">{sheet.description}</p>
              )}
            </div>

            {/* Overall Completion Gauge Card */}
            <div className="p-5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] shrink-0 min-w-[220px] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0D0431]">
                <span>Completion</span>
                <span className="font-heading font-black text-sm">{solvedPct}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-white border-2 border-[#0D0431] overflow-hidden p-[1px]">
                <div
                  className="h-full bg-[#896EE2] transition-all duration-500 rounded-full"
                  style={{ width: `${solvedPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#0D0431]/70">
                <span>{solvedInSheet} Solved</span>
                <span>{totalInSheet - solvedInSheet} Remaining</span>
              </div>
            </div>
          </div>

          {/* Difficulty Statistics Breakdown */}
          <div className="flex items-center gap-2.5 flex-wrap pt-3 border-t-2 border-[#0D0431]/15 text-xs font-mono">
            <span className="text-[#0D0431]/70 font-bold">Difficulty Breakdown:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431] font-bold shadow-[1px_1px_0_0_#0D0431]">
              Easy: {sheet.difficulty_breakdown?.easy || 0}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] font-bold shadow-[1px_1px_0_0_#0D0431]">
              Medium: {sheet.difficulty_breakdown?.medium || 0}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431] font-bold shadow-[1px_1px_0_0_#0D0431]">
              Hard: {sheet.difficulty_breakdown?.hard || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-3xl border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#0D0431]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems in this sheet (e.g., Two Sum, DP, Subarray, Tree)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FEF9CF] border-2 border-[#0D0431] rounded-xl pl-10 pr-4 py-2 text-xs font-sans font-semibold text-[#0D0431] placeholder-[#0D0431]/50 shadow-[2px_2px_0_0_#0D0431] focus:outline-none focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-white border-2 border-[#0D0431] text-xs font-mono font-bold text-[#0D0431] rounded-xl px-3 py-2 shadow-[2px_2px_0_0_#0D0431] focus:outline-none"
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
            className="bg-white border-2 border-[#0D0431] text-xs font-mono font-bold text-[#0D0431] rounded-xl px-3 py-2 shadow-[2px_2px_0_0_#0D0431] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="solved">Solved Only</option>
            <option value="unsolved">Unsolved Only</option>
          </select>

          {/* Only Runnable toggle */}
          <button
            type="button"
            onClick={() => setOnlyRunnable(!onlyRunnable)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] ${
              onlyRunnable
                ? "bg-[#D3F8C6] text-[#0D0431]"
                : "bg-white text-[#0D0431] hover:bg-[#FEF9CF]"
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
          <div className="p-12 text-center rounded-3xl bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-base font-heading font-black text-[#0D0431]">No Matching Problems</h4>
            <p className="text-xs text-[#0D0431]/70 font-medium">Try clearing filters or search query to view all problems.</p>
          </div>
        ) : (
          filteredSections.map((sec, secIdx) => {
            const secKey = sec.section_id || `sec-${secIdx}`;
            const isExpanded = expandedSections[secKey] !== false;

            return (
              <div
                key={secKey}
                className="rounded-3xl bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] overflow-hidden transition-all"
              >
                {/* Section Header Trigger */}
                <button
                  type="button"
                  onClick={() => toggleSection(secKey)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-[#FEF9CF] hover:bg-[#FEDF6A] transition-colors cursor-pointer border-b-2 border-[#0D0431]"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <span className="w-7 h-7 rounded-lg bg-white border-2 border-[#0D0431] flex items-center justify-center text-xs font-mono font-black text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0">
                      {secIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-heading font-black text-[#0D0431] truncate">{sec.section_name}</h3>
                      <span className="text-[11px] font-mono font-bold text-[#0D0431]/70">
                        {sec.visibleCount} problem{sec.visibleCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-white border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-4 bg-white">
                    {/* Render with subcategories */}
                    {sec.subcategories ? (
                      sec.subcategories.map((subcat, subIdx) => (
                        <div key={subcat.subcategory_id || `sub-${subIdx}`} className="space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0D0431] px-1 pt-1">
                            <span className="w-2 h-2 rounded-full bg-[#896EE2] border border-[#0D0431]" />
                            <span>{subcat.subcategory_name}</span>
                            <span className="text-[10px] text-[#0D0431]/60">({subcat.problems.length})</span>
                          </div>

                          <div className="divide-y-2 divide-[#0D0431]/15 rounded-2xl border-2 border-[#0D0431] overflow-hidden bg-white shadow-[2px_2px_0_0_#0D0431]">
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
                      <div className="divide-y-2 divide-[#0D0431]/15 rounded-2xl border-2 border-[#0D0431] overflow-hidden bg-white shadow-[2px_2px_0_0_#0D0431]">
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
  const diffBadgeStyle =
    diffLower === "easy"
      ? "bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431]"
      : diffLower === "medium"
      ? "bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431]"
      : "bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431]";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[#FEF9CF]/50 transition-colors">
      {/* Left: Checkmark & Title */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <button
          type="button"
          onClick={onToggleSolved}
          className="shrink-0 cursor-pointer p-0.5 rounded-lg border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] transition-transform hover:scale-105 active:scale-95"
          title={isSolved ? "Mark as unsolved" : "Mark as completed"}
        >
          {isSolved ? (
            <div className="w-5 h-5 bg-[#D3F8C6] rounded flex items-center justify-center text-[#0D0431]">
              <CheckCircle2 className="w-4 h-4 fill-current text-[#0D0431]" />
            </div>
          ) : (
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center text-[#0D0431]/40 hover:text-[#0D0431]">
              <Circle className="w-4 h-4" />
            </div>
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs sm:text-sm font-bold tracking-tight ${
                isSolved ? "text-[#0D0431]/50 line-through font-sans" : "text-[#0D0431] font-sans font-bold"
              }`}
            >
              {problem.problem_name}
            </span>

            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-[1px_1px_0_0_#0D0431] ${diffBadgeStyle}`}>
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
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E4CDFB] hover:bg-[#D4B5F9] text-[#0D0431] text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            title="Read complete offline tutorial & code snippets"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0D0431]" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>
        )}

        {/* Video Solution Button */}
        {problem.youtube_url && (
          <button
            type="button"
            onClick={() => onOpenVideo(problem.youtube_url)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFC5B7] hover:bg-[#FFB09F] text-[#0D0431] text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
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
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all hover:scale-105 active:scale-95"
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
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEF9CF] text-[#0D0431] text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all"
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
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEF9CF] text-[#0D0431] text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all"
          >
            <span>Practice</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
