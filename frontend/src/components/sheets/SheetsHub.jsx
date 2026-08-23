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
  Target,
} from "lucide-react";
import { sheetsService } from "@/services/sheetsService";
import SheetViewer from "./SheetViewer";
import SheetArticleModal from "./SheetArticleModal";
import SheetVideoModal from "./SheetVideoModal";
import CaideBadge from "@/components/caide/CaideBadge";

const CATEGORY_TABS = [
  { id: "all", label: "All Curricula (28)", icon: Layers },
  { id: "dsa_sheets", label: "DSA Sheets (4)", icon: Flame },
  { id: "dsa_playlists", label: "DSA Playlists (9)", icon: Code2 },
  { id: "tuf_plus_courses", label: "TUF+ Courses (10)", icon: GraduationCap },
  { id: "core_cs_subjects", label: "Core CS (3)", icon: Cpu },
  { id: "system_design", label: "System Design (1)", icon: Server },
  { id: "competitive_programming", label: "CP Sheet (1)", icon: Trophy },
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

  const allCategories = overviewData?.categories || [];
  const displayedCategories =
    activeCategoryTab === "all"
      ? allCategories
      : allCategories.filter((c) => c.id === activeCategoryTab);

  const solvedMap = sheetsService.getSolvedMap();

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 pb-4 border-b border-[#E2DEEC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-[#17103D] tracking-tight">
              Curriculum Sheets & DSA Playlists
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6A80] mt-0.5">
              28 structured interview sheets, 3,150 problems, and video tutorials.
            </p>
          </div>

          {/* Universal Problem Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#6F6A80] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 3,150 problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2DEEC] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#17103D] placeholder-[#6F6A80]/60 focus:outline-none focus:border-[#6E44FF] shadow-sm"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#6E44FF] border-t-transparent animate-spin" />
            )}
          </div>
        </div>

        {/* Category Pill Tabs */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategoryTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
                    isActive
                      ? "bg-[#17103D] text-white font-semibold shadow-sm"
                      : "bg-white text-[#6F6A80] hover:text-[#17103D] hover:bg-[#F2F0FA] border border-[#E2DEEC]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FFD84D]" : "text-[#6F6A80]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Core Spotlight High-Yield Tracks */}
      {!searchQuery && activeCategoryTab === "all" && (
        <div className="space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Core High-Yield Tracks
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SpotlightCard
              title="Striver's A2Z DSA"
              subtitle="474 Problems • 18 Sections"
              badge="Complete Path"
              theme="purple"
              onClick={() => setSelectedSheetId("strivers-a2z-dsa-sheet")}
            />
            <SpotlightCard
              title="Striver's SDE Sheet"
              subtitle="191 Problems • 27 Sections"
              badge="Top Interviews"
              theme="yellow"
              onClick={() => setSelectedSheetId("strivers-sde-sheet")}
            />
            <SpotlightCard
              title="Blind 75 LeetCode"
              subtitle="75 Problems • 10 Sections"
              badge="Essential 75"
              theme="mint"
              onClick={() => setSelectedSheetId("blind-75-sheet")}
            />
            <SpotlightCard
              title="Striver 79 Speed Prep"
              subtitle="79 Problems • 11 Sections"
              badge="Last Minute"
              theme="coral"
              onClick={() => setSelectedSheetId("strivers-79-sheet")}
            />
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {searchQuery && searchResults && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#17103D]">
              Search Results ({searchResults.total} problem{searchResults.total !== 1 ? "s" : ""} found)
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[#6E44FF] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {searchResults.problems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-[#E2DEEC] text-[#6F6A80] text-xs">
              No problems found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="bg-white border border-[#E2DEEC] rounded-2xl divide-y divide-[#E2DEEC] overflow-hidden shadow-sm">
              {searchResults.problems.map((prob) => {
                const diffLower = (prob.difficulty || "").toLowerCase();
                const diffBadge =
                  diffLower === "easy"
                    ? "bg-[#D8FAF4] text-[#0D7A68]"
                    : diffLower === "medium"
                    ? "bg-[#FEF6D6] text-[#9E6700]"
                    : "bg-[#FFE8E5] text-[#C7382B]";

                return (
                  <div
                    key={prob.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[#F8F8F5] transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-[#17103D] truncate">
                          {prob.problem_name}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffBadge}`}>
                          {prob.difficulty}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6F6A80]">
                        Sheet: <span className="font-medium text-[#17103D]">{prob.sheet_name}</span>
                        {prob.category && ` • ${prob.category}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {prob.problem_url && (
                        <a
                          href={prob.problem_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs rounded-lg border border-[#E2DEEC] bg-white hover:bg-[#F2F0FA] text-[#17103D] flex items-center gap-1"
                        >
                          <span>Solve</span>
                          <ExternalLink className="w-3 h-3 text-[#6F6A80]" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedSheetId(prob.sheet_id)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-[#17103D] text-white hover:bg-[#24195A] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Sheet</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Categorized Sheet Lists Grid */}
      {!searchQuery && (
        <div className="space-y-8">
          {displayedCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#17103D] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#6E44FF]" />
                  <span>{category.name}</span>
                  <span className="text-xs text-[#6F6A80] font-normal">
                    ({category.sheets.length} sheets)
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.sheets.map((sheet) => {
                  const solvedCount = sheet.stats?.total_problems
                    ? Object.keys(solvedMap).filter((k) => k.startsWith(`${sheet.id}::`)).length
                    : 0;
                  const total = sheet.stats?.total_problems || 0;
                  const pct = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

                  return (
                    <div
                      key={sheet.id}
                      onClick={() => setSelectedSheetId(sheet.id)}
                      className="bg-white border border-[#E2DEEC] hover:border-[#C8C3D8] rounded-2xl p-4 shadow-[0_2px_6px_rgba(23,16,61,0.02)] hover:shadow-[0_6px_16px_rgba(23,16,61,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F2F0FA] text-[#6E44FF]">
                            {sheet.stats?.total_subsections || 0} Topics
                          </span>
                          <span className="text-[11px] text-[#6F6A80] font-mono">
                            {solvedCount}/{total} Solved
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#17103D] group-hover:text-[#6E44FF] transition-colors line-clamp-1">
                          {sheet.name}
                        </h4>
                        <p className="text-xs text-[#6F6A80] line-clamp-2 leading-relaxed">
                          {sheet.description || "Structured problem track with video tutorials and practice sandboxes."}
                        </p>
                      </div>

                      {/* Progress Bar & CTA */}
                      <div className="space-y-2 pt-2 border-t border-[#E2DEEC]">
                        <div className="w-full h-1.5 rounded-full bg-[#F2F0FA] overflow-hidden">
                          <div
                            className="h-full bg-[#6E44FF] rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(pct, solvedCount > 0 ? 5 : 0)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-[#17103D]">
                            {pct}% Completed
                          </span>
                          <span className="text-[#6E44FF] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Open Sheet</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {activeArticleSlug && (
        <SheetArticleModal
          articleSlug={activeArticleSlug}
          onClose={() => setActiveArticleSlug(null)}
        />
      )}
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

function SpotlightCard({ title, subtitle, badge, theme = "purple", onClick }) {
  const badgeStyle = {
    purple: "bg-[#EFEAFF] text-[#6E44FF]",
    yellow: "bg-[#FEF6D6] text-[#9E6700]",
    mint: "bg-[#D8FAF4] text-[#0D7A68]",
    coral: "bg-[#FFE8E5] text-[#C7382B]",
  }[theme] || "bg-[#EFEAFF] text-[#6E44FF]";

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E2DEEC] hover:border-[#6E44FF] rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
    >
      <div className="space-y-1.5">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}`}>
          {badge}
        </span>
        <h4 className="text-sm font-bold text-[#17103D] group-hover:text-[#6E44FF] transition-colors truncate">
          {title}
        </h4>
        <p className="text-xs text-[#6F6A80]">{subtitle}</p>
      </div>

      <div className="pt-2 border-t border-[#E2DEEC] flex items-center justify-between text-xs font-semibold text-[#6E44FF]">
        <span>Start Practice</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
