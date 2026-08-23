import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import {
  Layers,
  Search,
  BookOpen,
  Sparkles,
  Flame,
  Trophy,
  Terminal,
  Play,
  CheckCircle2,
  Filter,
  ArrowRight,
  Code2,
  Database,
  Cpu,
  Network,
  Server,
  Zap,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Target
} from "lucide-react";
import { sheetsService } from "@/services/sheetsService";
import SheetViewer from "./SheetViewer";
import SheetArticleModal from "./SheetArticleModal";
import SheetVideoModal from "./SheetVideoModal";

const CATEGORY_TABS = [
  { id: "all", label: "All Curricula", icon: Layers },
  { id: "dsa_sheets", label: "DSA Sheets", icon: Flame },
  { id: "dsa_playlists", label: "DSA Playlists", icon: Code2 },
  { id: "tuf_plus_courses", label: "TUF+ Courses", icon: GraduationCap },
  { id: "core_cs_subjects", label: "Core CS", icon: Cpu },
  { id: "system_design", label: "System Design", icon: Server },
  { id: "competitive_programming", label: "CP Sheet", icon: Trophy },
];

export default function SheetsHub({ initialSheetId = null, onSelectSheet = null, initialSearch = "" }) {
  const [selectedSheetId, setSelectedSheetId] = useState(initialSheetId);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Modals for search results
  const [activeArticleSlug, setActiveArticleSlug] = useState(null);
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: "", title: "" });

  const containerRef = useRef(null);

  // Load sheets overview
  useEffect(() => {
    let isMounted = true;
    sheetsService
      .getSheetsOverview()
      .then((data) => {
        if (isMounted) {
          setOverviewData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("Failed to load curricula sheets.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const handler = setTimeout(() => {
      sheetsService
        .searchProblems({ query: searchQuery, page: 1, pageSize: 30 })
        .then((res) => {
          setSearchResults(res);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // GSAP animation
  useEffect(() => {
    if (containerRef.current && !loading && !selectedSheetId) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".gsap-reveal"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading, activeCategoryTab, selectedSheetId, searchResults]);

  // If a sheet is currently selected, render the full interactive SheetViewer
  if (selectedSheetId) {
    return (
      <SheetViewer
        sheetId={selectedSheetId}
        onBack={() => {
          setSelectedSheetId(null);
          if (onSelectSheet) onSelectSheet(null);
        }}
      />
    );
  }

  // Filter sheets by category tab
  const allCategories = overviewData?.categories || [];
  const displayedCategories =
    activeCategoryTab === "all"
      ? allCategories
      : allCategories.filter((c) => c.id === activeCategoryTab);

  const solvedMap = sheetsService.getSolvedMap();

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Top Banner Header */}
      <div className="gsap-reveal flex flex-col gap-6 pb-6 border-b border-zinc-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              DSA Sheets & Curriculum Tracks
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
              28 structured interview sheets and playlists featuring 3,150 problems, 2,088 offline tutorials, and integrated sandbox execution.
            </p>
          </div>

        </div>

        {/* Category Pill Tabs Below Title */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono pt-1">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategoryTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-zinc-100 text-zinc-950 font-bold"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800/80"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Spotlight High-Yield Sheets */}
      {!searchQuery && (
        <div className="gsap-reveal space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-zinc-400" />
              Core Study Tracks
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">High-yield interview sets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SpotlightCard
              title="Striver's A2Z DSA Sheet"
              subtitle="474 Problems · 18 Sections"
              description="Comprehensive path from fundamental patterns to advanced interview topics."
              badge="Complete Path"
              badgeColor="bg-zinc-800 text-zinc-200 border-zinc-700"
              onClick={() => setSelectedSheetId("strivers-a2z-dsa-sheet")}
            />
            <SpotlightCard
              title="Striver's SDE Sheet"
              subtitle="191 Problems · 27 Sections"
              description="Core problem set frequently tested in tier-1 technical interviews."
              badge="High Yield"
              badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
              onClick={() => setSelectedSheetId("strivers-sde-sheet")}
            />
            <SpotlightCard
              title="Blind 75 LeetCode Sheet"
              subtitle="75 Problems · 10 Sections"
              description="Essential pattern-covering problem set for technical assessments."
              badge="Core 75"
              badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              onClick={() => setSelectedSheetId("blind-75-sheet")}
            />
            <SpotlightCard
              title="Striver 79 Last Moment Sheet"
              subtitle="79 Problems · 11 Sections"
              description="Focused high-yield review for upcoming technical interview rounds."
              badge="Speed Prep"
              badgeColor="bg-rose-500/10 text-rose-400 border-rose-500/20"
              onClick={() => setSelectedSheetId("strivers-79-sheet")}
            />
          </div>
        </div>
      )}

      {/* Universal Problem Search */}
      <div className="gsap-reveal space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 3,150 problems (e.g. Two Sum, LRU Cache, BFS, Dynamic Programming)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            {searching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Search Results Display (if searching) */}
      {searchQuery && searchResults && (
        <div className="gsap-reveal space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Search Results ({searchResults.total} problem{searchResults.total !== 1 ? "s" : ""} found)
            </h3>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-mono text-purple-400 hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {searchResults.problems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-950/40 border border-zinc-800 text-zinc-400 text-xs">
              No problems found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800 bg-[#0e0e11] overflow-hidden">
              {searchResults.problems.map((prob) => {
                const diffLower = (prob.difficulty || "").toLowerCase();
                const diffBadgeColor =
                  diffLower === "easy"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : diffLower === "medium"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20";

                return (
                  <div
                    key={prob.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-semibold text-white truncate">
                           {prob.problem_name}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded border ${diffBadgeColor}`}>
                          {prob.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                        <span className="text-zinc-300">{prob.sheet_title}</span>
                        <span>·</span>
                        <span>{prob.section_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                      {prob.has_article && (
                        <button
                          type="button"
                          onClick={() => setActiveArticleSlug(prob.article_slug)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Tutorial</span>
                        </button>
                      )}

                      {prob.youtube_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setVideoModal({ isOpen: true, url: prob.youtube_url, title: prob.problem_name })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Video</span>
                        </button>
                      )}

                      {prob.is_ide_runnable && prob.leetcode_slug ? (
                        <Link
                          to={`/app/coding/${prob.leetcode_slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-all"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Solve</span>
                        </Link>
                      ) : prob.leetcode_url ? (
                        <a
                          href={prob.leetcode_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
                        >
                          <span>LeetCode</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Categorized Sheets Grid (when not searching) */}
      {!searchQuery && (
        <div className="space-y-10">
          {displayedCategories.map((category) => (
            <div key={category.id} className="gsap-reveal space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">{category.title}</h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {category.sheets_count} Lists
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {category.sheets.map((sheetItem) => (
                  <SheetCard
                    key={sheetItem.id}
                    sheet={sheetItem}
                    onClick={() => {
                      setSelectedSheetId(sheetItem.id);
                      if (onSelectSheet) onSelectSheet(sheetItem.id);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

// Spotlight Card Component
function SpotlightCard({ title, subtitle, description, badge, badgeColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group p-5 rounded-xl bg-[#121215] border border-zinc-800/90 hover:border-zinc-700 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4"
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
            {badge}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
        </div>

        <h3 className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">{description}</p>
      </div>

      <div className="pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500">
        {subtitle}
      </div>
    </div>
  );
}

// Individual Sheet Card Component
function SheetCard({ sheet, onClick }) {
  const diff = sheet.difficulty_breakdown || {};

  return (
    <div
      onClick={onClick}
      className="group p-5 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
            {sheet.type?.replace("_", " ")}
          </span>

          {sheet.ide_runnable_count > 0 && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
              <Terminal className="w-3 h-3" /> {sheet.ide_runnable_count} IDE
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors tracking-tight leading-snug line-clamp-2">
            {sheet.title}
          </h3>
          {sheet.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed font-sans">{sheet.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-800/60">
        {/* Difficulties summary */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>{sheet.total_sections} Sections</span>
          <span>{sheet.total_items} Problems</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          {diff.easy > 0 && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {diff.easy} Easy
            </span>
          )}
          {diff.medium > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {diff.medium} Med
            </span>
          )}
          {diff.hard > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {diff.hard} Hard
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 text-xs font-semibold text-zinc-300 group-hover:text-white">
          <span>Open Sheet</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-zinc-400" />
        </div>
      </div>
    </div>
  );
}
