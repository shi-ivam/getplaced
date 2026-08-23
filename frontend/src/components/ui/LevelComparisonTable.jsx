import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Layers,
  FolderGit2,
  FileText,
  GraduationCap,
  MessageSquare,
  BrainCog,
  Cpu,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  X,
  Info,
  ChevronRight,
  Filter,
  Check,
  Target,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLevelComparison } from "@/utils/dynamicCopy";
import GpButton from "@/components/gp/GpButton";
import GpBadge from "@/components/gp/GpBadge";
import GpCard from "@/components/gp/GpCard";

const CATEGORY_ICONS = {
  dsa: Code2,
  DSA: Code2,
  technologies: Layers,
  Technologies: Layers,
  projects: FolderGit2,
  Projects: FolderGit2,
  resume: FileText,
  Resume: FileText,
  academics: GraduationCap,
  Academics: GraduationCap,
  communication: MessageSquare,
  Communication: MessageSquare,
  "hr-readiness": BrainCog,
  "HR Readiness": BrainCog,
  "technical-interview": Cpu,
  "Technical Interview": Cpu,
  "other-skills": Sparkles,
  "Other Relevant Skills": Sparkles,
  Other: Sparkles,
};

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "DSA", label: "DSA", icon: Code2 },
  { id: "Technologies", label: "Technologies", icon: Layers },
  { id: "Projects", label: "Projects", icon: FolderGit2 },
  { id: "Resume", label: "Resume", icon: FileText },
  { id: "Academics", label: "Academics", icon: GraduationCap },
  { id: "Communication", label: "Communication", icon: MessageSquare },
  { id: "HR Readiness", label: "HR Readiness", icon: BrainCog },
  { id: "Technical Interview", label: "Technical Interview", icon: Cpu },
  { id: "Other Relevant Skills", label: "Other Skills", icon: Sparkles },
];

export default function LevelComparisonTable({
  gapData,
  loading = false,
  targetCompany = "",
  targetJobRole = "",
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const allItems = useMemo(() => {
    return gapData?.allItems || [];
  }, [gapData]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "Other Relevant Skills") {
          if (item.category !== "Other Relevant Skills" && item.category !== "Other") {
            return false;
          }
        } else if (item.category !== selectedCategory && item.categoryId !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "needs_improvement") {
        if (item.statusKey !== "needs_improvement") return false;
      } else if (statusFilter === "meets_or_above") {
        if (item.statusKey !== "meets" && item.statusKey !== "above") return false;
      } else if (statusFilter === "not_analyzed") {
        if (item.statusKey !== "not_analyzed") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesEvidence = (item.evidence || []).some((e) =>
          e.toLowerCase().includes(query)
        );
        const matchesSteps = (item.improvementSteps || []).some((s) =>
          s.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesCategory && !matchesEvidence && !matchesSteps) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, selectedCategory, statusFilter, searchQuery]);

  const summary = gapData?.summary || {
    totalItems: 0,
    analyzedItems: 0,
    meetsOrAboveCount: 0,
    needsImprovementCount: 0,
    notAnalyzedCount: 0,
    averageCurrentLevel: null,
    averageRequiredLevel: null,
    averageGap: null,
  };

  const getStatusBadgeTheme = (statusKey) => {
    switch (statusKey) {
      case "above":
      case "meets":
        return "lime";
      case "needs_improvement":
        return "coral";
      case "not_analyzed":
      default:
        return "yellow";
    }
  };

  if (loading) {
    return (
      <GpCard theme="white" shadow="default" className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-[#FEF9CF] border-2 border-[#0D0431] animate-pulse rounded-xl" />
            <div className="h-4 w-72 bg-[#FEF9CF]/60 border-2 border-[#0D0431] animate-pulse rounded-xl" />
          </div>
          <div className="h-9 w-40 bg-[#FEF9CF] border-2 border-[#0D0431] animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-xl p-3 space-y-2 shadow-[2px_2px_0_0_#0D0431]">
              <div className="h-3 w-16 bg-white rounded" />
              <div className="h-6 w-12 bg-white rounded" />
            </div>
          ))}
        </div>
      </GpCard>
    );
  }

  return (
    <section className="space-y-6 text-[#0D0431] font-sans">
      {/* ── Top Header & Context Card ── */}
      <GpCard
        theme="white"
        shadow="default"
        className="p-5 md:p-6 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <GpBadge theme="light-purple" size="sm">
                <Target className="w-3.5 h-3.5 mr-1" />
                Gap Analysis Engine • 0–10 Scale
              </GpBadge>
            </div>
            <h2 className="text-xl md:text-2xl font-heading font-black text-[#0D0431] tracking-tight">
              Current Level vs Required Target Level
            </h2>
            <p className="text-xs text-[#0D0431]/80 max-w-2xl leading-relaxed">
              Granular benchmark comparison across 9 placement dimensions calibrated for{" "}
              <span className="font-heading font-black text-[#0D0431]">
                {gapData?.targetCompany || targetCompany || "Target Company"}
              </span>{" "}
              (
              <span className="font-mono font-bold text-[#0D0431]">
                {gapData?.targetJobRole || targetJobRole || "Target Role"}
              </span>
              ).
            </p>
          </div>

          {/* Quick Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 font-mono text-xs">
            <div className="bg-[#FEF9CF] border-2 border-[#0D0431] p-3 rounded-2xl shadow-[2px_2px_0_0_#0D0431] flex flex-col justify-between">
              <span className="text-[10px] text-[#0D0431]/70 uppercase font-sans font-bold">Analyzed</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-heading font-black text-[#0D0431]">{summary.analyzedItems}</span>
                <span className="text-[10px] text-[#0D0431]/60 font-bold">/ {summary.totalItems}</span>
              </div>
            </div>

            <div className="bg-[#E4FFDA] border-2 border-[#0D0431] p-3 rounded-2xl shadow-[2px_2px_0_0_#0D0431] flex flex-col justify-between">
              <span className="text-[10px] text-[#0D0431]/70 uppercase font-sans font-bold">Meets / Exceeds</span>
              <div className="text-2xl font-heading font-black text-[#0D0431] mt-1">
                {summary.meetsOrAboveCount}
              </div>
            </div>

            <div className="bg-[#FFC5B7] border-2 border-[#0D0431] p-3 rounded-2xl shadow-[2px_2px_0_0_#0D0431] flex flex-col justify-between">
              <span className="text-[10px] text-[#0D0431]/70 uppercase font-sans font-bold">Needs Work</span>
              <div className="text-2xl font-heading font-black text-[#0D0431] mt-1">
                {summary.needsImprovementCount}
              </div>
            </div>

            <div className="bg-[#CDE1FF] border-2 border-[#0D0431] p-3 rounded-2xl shadow-[2px_2px_0_0_#0D0431] flex flex-col justify-between">
              <span className="text-[10px] text-[#0D0431]/70 uppercase font-sans font-bold">Pending</span>
              <div className="text-2xl font-heading font-black text-[#0D0431] mt-1">
                {summary.notAnalyzedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t-2 border-[#0D0431]/15">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#0D0431]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill, DSA topic, or framework..."
              className="w-full bg-white border-2 border-[#0D0431] rounded-xl pl-10 pr-8 py-2 text-xs font-bold text-[#0D0431] placeholder-[#0D0431]/40 shadow-[3px_3px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0D0431]/60 hover:text-[#0D0431] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#FEF9CF] p-1 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-[#0D0431] text-white shadow-sm"
                  : "text-[#0D0431] hover:bg-white/60"
              }`}
            >
              All ({allItems.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("needs_improvement")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "needs_improvement"
                  ? "bg-[#F85B52] text-white shadow-sm"
                  : "text-[#0D0431] hover:bg-white/60"
              }`}
            >
              Needs Work ({summary.needsImprovementCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("meets_or_above")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "meets_or_above"
                  ? "bg-[#0D0431] text-white shadow-sm"
                  : "text-[#0D0431] hover:bg-white/60"
              }`}
            >
              Meets / Above ({summary.meetsOrAboveCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("not_analyzed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "not_analyzed"
                  ? "bg-[#FEDF6A] text-[#0D0431] shadow-sm font-black"
                  : "text-[#0D0431] hover:bg-white/60"
              }`}
            >
              Pending ({summary.notAnalyzedCount})
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon || Code2;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] ${
                  isSelected
                    ? "bg-[#0D0431] text-white scale-[1.02]"
                    : "bg-white text-[#0D0431] hover:bg-[#FEDF6A]"
                }`}
              >
                {cat.id !== "all" && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </GpCard>

      {/* ── Main Table & List Section ── */}
      <div className="rounded-2xl border-2 border-[#0D0431] bg-white shadow-[4px_4px_0_0_#0D0431] overflow-hidden">
        
        {/* Desktop Tabular View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#0D0431] bg-[#FEDF6A] text-[#0D0431] font-heading font-black text-[11px]">
                <th className="py-3 px-4">Skill / Topic Area</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4 min-w-[220px]">
                  YOU vs TARGET (0–10 Scale)
                </th>
                <th className="py-3 px-3 text-center">To Close</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 border-[#0D0431]/15">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#0D0431]/70">
                    <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                      <Search className="w-8 h-8 text-[#0D0431]/50" />
                      <p className="text-sm font-heading font-black text-[#0D0431]">No matching skills found</p>
                      <p className="text-xs text-[#0D0431]/70">
                        Try adjusting your search keywords or resetting status & category filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("all");
                          setStatusFilter("all");
                          setSearchQuery("");
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] text-[#0D0431] text-xs font-bold shadow-[2px_2px_0_0_#0D0431] hover:bg-[#FFE995] transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const Icon = CATEGORY_ICONS[item.category] || Layers;
                  const comparison = formatLevelComparison(item.currentLevel, item.requiredLevel, item.gap);
                  const badgeTheme = getStatusBadgeTheme(item.statusKey);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-[#FEF9CF] transition-colors cursor-pointer group font-sans"
                    >
                      {/* Name & Importance */}
                      <td className="py-3.5 px-4 font-bold text-[#0D0431]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431] group-hover:bg-[#FEDF6A] transition-colors shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-heading font-black text-[#0D0431] group-hover:text-[#896EE2] transition-colors">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#0D0431]/70 font-mono font-bold">
                                {item.importance}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-lg bg-[#FEF9CF] text-[#0D0431] border border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
                          {item.category}
                        </span>
                      </td>

                      {/* Dual Progress Bar (0-10 Scale) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline text-[11px] font-mono font-bold">
                            <span className="text-[#0D0431]">
                              {comparison.youText}
                            </span>
                            <span className="text-[#0D0431]/75">
                              {comparison.targetText}
                            </span>
                          </div>

                          {/* Visual Dual Scale */}
                          <div className="relative w-full bg-[#FEF9CF] rounded-full h-3 overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                            {/* Required Target Tick Line */}
                            <div
                              className="absolute top-0 bottom-0 w-1 bg-[#0D0431] z-10"
                              style={{ left: `${item.requiredLevel * 10}%` }}
                              title={`Target: ${item.requiredLevel}/10`}
                            />

                            {/* Current Level Fill Bar */}
                            {item.currentLevel !== null ? (
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  comparison.isMet
                                    ? "bg-[#96E6C4]"
                                    : comparison.gapNumeric >= -2.0
                                    ? "bg-[#FEDF6A]"
                                    : "bg-[#F85B52]"
                                )}
                                style={{
                                  width: `${Math.min(100, Math.max(0, item.currentLevel * 10))}%`,
                                }}
                              />
                            ) : (
                              <div className="h-full bg-white w-0" />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Net Gap (TO CLOSE) */}
                      <td className="py-3.5 px-3 text-center font-mono font-black">
                        <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-lg border-2 border-[#0D0431] bg-white shadow-[1px_1px_0_0_#0D0431] text-[#0D0431]">
                          {comparison.toCloseText}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <GpBadge theme={badgeTheme} size="sm">
                          {comparison.humanPhrase}
                        </GpBadge>
                      </td>

                      {/* Action Drill Down Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-heading font-black text-[#0D0431] hover:underline group-hover:text-[#896EE2] transition-colors p-1"
                        >
                          <span>Drill Down</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="md:hidden divide-y-2 border-[#0D0431]/20">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-[#0D0431]/70 space-y-2">
              <Search className="w-6 h-6 text-[#0D0431]/50 mx-auto" />
              <p className="text-sm font-heading font-black text-[#0D0431]">No matching skills found</p>
              <p className="text-xs text-[#0D0431]/70">Reset your filters to see full curriculum.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = CATEGORY_ICONS[item.category] || Layers;
              const comparison = formatLevelComparison(item.currentLevel, item.requiredLevel, item.gap);
              const badgeTheme = getStatusBadgeTheme(item.statusKey);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="p-4 space-y-3 bg-white hover:bg-[#FEF9CF] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FEF9CF] border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] shrink-0 shadow-[1px_1px_0_0_#0D0431]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-heading font-black text-[#0D0431]">{item.name}</h4>
                        <span className="text-[10px] text-[#0D0431]/70 font-mono font-bold">
                          {item.category} · {item.importance}
                        </span>
                      </div>
                    </div>

                    <GpBadge theme={badgeTheme} size="sm">
                      {comparison.humanPhrase}
                    </GpBadge>
                  </div>

                  {/* Level Numbers & Progress Bar */}
                  <div className="space-y-1.5 bg-[#FEF9CF] p-3 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-[#0D0431]">
                        {comparison.youText}
                        <span className="text-[#0D0431]/60 font-normal"> / {comparison.targetText}</span>
                      </span>

                      <span className="text-xs font-heading font-black text-[#0D0431]">
                        {comparison.toCloseText}
                      </span>
                    </div>

                    <div className="relative w-full bg-white rounded-full h-2.5 overflow-hidden border border-[#0D0431]">
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-[#0D0431] z-10"
                        style={{ left: `${item.requiredLevel * 10}%` }}
                      />
                      {item.currentLevel !== null && (
                        <div
                          className={cn(
                            "h-full rounded-full",
                            comparison.isMet
                              ? "bg-[#96E6C4]"
                              : comparison.gapNumeric >= -2.0
                              ? "bg-[#FEDF6A]"
                              : "bg-[#F85B52]"
                          )}
                          style={{
                            width: `${Math.min(100, Math.max(0, item.currentLevel * 10))}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#0D0431] pt-0.5 font-mono font-bold">
                    <span className="text-[#0D0431]/70">Tap for recommendations</span>
                    <span className="inline-flex items-center gap-0.5 font-heading font-black">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Interactive Drill-Down Modal ── */}
      {selectedItem && (() => {
        const modalComparison = formatLevelComparison(
          selectedItem.currentLevel,
          selectedItem.requiredLevel,
          selectedItem.gap
        );
        const modalBadgeTheme = getStatusBadgeTheme(selectedItem.statusKey);

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0431]/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="bg-white border-2 border-[#0D0431] w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-5 shadow-[8px_8px_0_0_#0D0431] overflow-y-auto max-h-[90vh] text-[#0D0431]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b-2 border-[#0D0431] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431] shrink-0">
                    {React.createElement(CATEGORY_ICONS[selectedItem.category] || Layers, {
                      className: "w-6 h-6",
                    })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <GpBadge theme="light-purple" size="sm">
                        {selectedItem.category}
                      </GpBadge>
                      <span className="text-[11px] text-[#0D0431]/70 font-mono font-bold">
                        {selectedItem.importance}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-heading font-black text-[#0D0431] mt-0.5">
                      {selectedItem.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-xl border-2 border-[#0D0431] bg-[#FEF9CF] hover:bg-[#FEDF6A] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Level Comparison Highlight Box */}
              <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl p-4 sm:p-5 space-y-4 font-mono shadow-[3px_3px_0_0_#0D0431]">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <span className="text-[10px] text-[#0D0431]/70 block uppercase font-sans font-bold">You</span>
                    <span className="text-2xl font-heading font-black text-[#0D0431] mt-0.5 block">
                      {selectedItem.currentLevel !== null ? selectedItem.currentLevel.toFixed(1) : "—"}
                    </span>
                    <span className="text-[10px] text-[#0D0431]/60 block font-bold">/ 10</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <span className="text-[10px] text-[#0D0431]/70 block uppercase font-sans font-bold">Target</span>
                    <span className="text-2xl font-heading font-black text-[#0D0431] mt-0.5 block">
                      {selectedItem.requiredLevel.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-[#0D0431]/60 block font-bold">/ 10</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <span className="text-[10px] text-[#0D0431]/70 block uppercase font-sans font-bold">To Close</span>
                    <span className="text-lg font-heading font-black text-[#0D0431] mt-1 block">
                      {modalComparison.toCloseText}
                    </span>
                  </div>
                </div>

                {/* Progress Bar with Scale Marks */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative w-full bg-white rounded-full h-3.5 overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-[#0D0431] z-10"
                      style={{ left: `${selectedItem.requiredLevel * 10}%` }}
                      title={`Target: ${selectedItem.requiredLevel}/10`}
                    />
                    {selectedItem.currentLevel !== null && (
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          modalComparison.isMet
                            ? "bg-[#96E6C4]"
                            : modalComparison.gapNumeric >= -2.0
                            ? "bg-[#FEDF6A]"
                            : "bg-[#F85B52]"
                        )}
                        style={{
                          width: `${Math.min(100, Math.max(0, selectedItem.currentLevel * 10))}%`,
                        }}
                      />
                    )}
                  </div>

                  <div className="flex justify-between text-[10px] text-[#0D0431]/70 font-mono font-bold px-0.5">
                    <span>0.0</span>
                    <span>2.5</span>
                    <span>5.0</span>
                    <span>7.5</span>
                    <span>10.0</span>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <GpBadge theme={modalBadgeTheme}>
                    {modalComparison.statusLabel} — {modalComparison.humanPhrase}
                  </GpBadge>
                </div>
              </div>

              {/* Evidence Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#0D0431]" />
                  <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                    Why your score is {selectedItem.currentLevel !== null ? `${selectedItem.currentLevel}/10` : "Unassessed"}
                  </h4>
                </div>
                <ul className="space-y-1.5 bg-[#FEF9CF] p-4 rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  {selectedItem.evidence && selectedItem.evidence.length > 0 ? (
                    selectedItem.evidence.map((ev, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#0D0431] leading-relaxed font-sans font-medium">
                        <span className="font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-[#0D0431]/70 italic">No specific evidence records available.</li>
                  )}
                </ul>
              </div>

              {/* Actionable Steps */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#0D0431]" />
                  <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                    What you need to reach target bar
                  </h4>
                </div>
                <ul className="space-y-2 bg-[#FEF9CF] p-4 rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  {selectedItem.improvementSteps && selectedItem.improvementSteps.length > 0 ? (
                    selectedItem.improvementSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#0D0431] leading-relaxed font-sans font-medium">
                        <div className="w-5 h-5 rounded-lg bg-white border-2 border-[#0D0431] flex items-center justify-center text-[10px] font-heading font-black text-[#0D0431] shrink-0 mt-0.5 shadow-[1px_1px_0_0_#0D0431]">
                          {idx + 1}
                        </div>
                        <span>{step}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-[#0D0431]/70 italic">Continue practicing and building project depth.</li>
                  )}
                </ul>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#0D0431]/15">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0D0431] hover:underline"
                >
                  Close
                </button>

                <GpButton
                  variant="stacked-yellow"
                  size="sm"
                  to={selectedItem.actionLink || "/app/profile"}
                  onClick={() => setSelectedItem(null)}
                >
                  <span className="font-bold text-[#0D0431]">
                    {selectedItem.actionLabel || "Take Action"}
                  </span>
                </GpButton>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
