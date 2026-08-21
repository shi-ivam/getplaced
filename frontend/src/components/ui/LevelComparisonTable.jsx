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
    averageRequiredLevel: 8.0,
    averageGap: null,
  };

  const getStatusBadge = (statusKey, gap) => {
    switch (statusKey) {
      case "above":
        return {
          label: "Above Requirement",
          badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          dotClass: "bg-emerald-400",
          icon: CheckCircle2,
        };
      case "meets":
        return {
          label: "Meets Requirement",
          badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          dotClass: "bg-emerald-400",
          icon: Check,
        };
      case "needs_improvement": {
        const isMajor = gap !== null && gap <= -2.5;
        return {
          label: "Needs Improvement",
          badgeClass: isMajor
            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20",
          dotClass: isMajor ? "bg-rose-400" : "bg-amber-400",
          icon: AlertCircle,
        };
      }
      case "not_analyzed":
      default:
        return {
          label: "Not Analyzed",
          badgeClass: "bg-zinc-800/90 text-zinc-400 border-zinc-700/80",
          dotClass: "bg-zinc-500",
          icon: Clock,
        };
    }
  };

  const getLevelColor = (level) => {
    if (level === null || level === undefined) return "text-zinc-500";
    if (level >= 8.5) return "text-emerald-400";
    if (level >= 7.0) return "text-sky-400";
    if (level >= 5.5) return "text-amber-400";
    return "text-rose-400";
  };

  const getGapColor = (gap) => {
    if (gap === null || gap === undefined) return "text-zinc-500";
    if (gap > 0) return "text-emerald-400";
    if (gap === 0) return "text-emerald-400";
    if (gap >= -1.5) return "text-amber-400";
    return "text-rose-400";
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-[#121215] border border-zinc-800/90 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-72 bg-zinc-800/60 animate-pulse rounded" />
          </div>
          <div className="h-9 w-40 bg-zinc-800 animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-zinc-900/80 border border-zinc-800/60 rounded-lg p-3 space-y-2">
              <div className="h-3 w-16 bg-zinc-800 rounded" />
              <div className="h-6 w-12 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-zinc-900/50 border border-zinc-800/40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Top Header & Context */}
      <div className="rounded-xl bg-[#121215] border border-zinc-800/90 p-5 md:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-zinc-400" />
                Gap Analysis Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono">
                0–10 Level Scale
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-zinc-100 tracking-tight">
              Current Level vs Required Level
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Granular benchmark comparison across 9 placement dimensions calibrated for{" "}
              <span className="text-zinc-200 font-medium font-mono">
                {gapData?.targetCompany || targetCompany || "Target Company"}
              </span>{" "}
              (
              <span className="text-zinc-300 font-mono">
                {gapData?.targetJobRole || targetJobRole || "Target Role"}
              </span>
              ).
            </p>
          </div>

          {/* Quick Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 font-mono text-xs">
            <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Analyzed</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold text-zinc-100">{summary.analyzedItems}</span>
                <span className="text-[10px] text-zinc-500">/ {summary.totalItems}</span>
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-emerald-400/90 uppercase tracking-wider">Meets / Exceeds</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {summary.meetsOrAboveCount}
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-amber-400/90 uppercase tracking-wider">Needs Work</span>
              <div className="text-lg font-bold text-amber-400 mt-1">
                {summary.needsImprovementCount}
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Pending</span>
              <div className="text-lg font-bold text-zinc-400 mt-1">
                {summary.notAnalyzedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill, DSA topic, or framework..."
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-zinc-700 text-xs text-zinc-200 pl-9 pr-8 py-2 rounded-lg outline-none transition-colors placeholder:text-zinc-500 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                statusFilter === "all"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              All ({allItems.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("needs_improvement")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                statusFilter === "needs_improvement"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Needs Work ({summary.needsImprovementCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("meets_or_above")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                statusFilter === "meets_or_above"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Meets / Above ({summary.meetsOrAboveCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("not_analyzed")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                statusFilter === "not_analyzed"
                  ? "bg-zinc-800 text-zinc-300"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Pending ({summary.notAnalyzedCount})
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon || Code2;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border",
                  isSelected
                    ? "bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold shadow"
                    : "bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border-zinc-800/80"
                )}
              >
                {cat.id !== "all" && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table & List Section */}
      <div className="rounded-xl bg-[#121215] border border-zinc-800/90 overflow-hidden">
        {/* Desktop Tabular View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-medium">Skill / Topic Area</th>
                <th className="py-3 px-3 font-medium">Category</th>
                <th className="py-3 px-4 font-medium min-w-[220px]">
                  Your Level vs Required (0–10)
                </th>
                <th className="py-3 px-3 font-medium text-center">Net Gap</th>
                <th className="py-3 px-3 font-medium text-center">Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                      <Search className="w-6 h-6 text-zinc-600" />
                      <p className="text-sm font-medium text-zinc-300">No matching skills found</p>
                      <p className="text-xs text-zinc-500">
                        Try adjusting your search keywords or resetting status & category filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("all");
                          setStatusFilter("all");
                          setSearchQuery("");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const Icon = CATEGORY_ICONS[item.category] || Layers;
                  const statusInfo = getStatusBadge(item.statusKey, item.gap);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                    >
                      {/* Name & Importance */}
                      <td className="py-3.5 px-4 font-medium text-zinc-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700 transition-colors shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {item.importance}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                          {item.category}
                        </span>
                      </td>

                      {/* Dual Progress Bar (0-10 Scale) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline text-[11px] font-mono">
                            <span className="text-zinc-300">
                              You:{" "}
                              <strong className={getLevelColor(item.currentLevel)}>
                                {item.currentLevel !== null ? item.currentLevel.toFixed(1) : "—"}
                              </strong>
                              <span className="text-zinc-500"> / 10</span>
                            </span>
                            <span className="text-zinc-400">
                              Req:{" "}
                              <strong className="text-zinc-200">
                                {item.requiredLevel.toFixed(1)}
                              </strong>
                              <span className="text-zinc-500"> / 10</span>
                            </span>
                          </div>

                          {/* Visual Dual Scale */}
                          <div className="relative w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800/80">
                            {/* Required Target Tick Line */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-zinc-300 z-10"
                              style={{ left: `${item.requiredLevel * 10}%` }}
                              title={`Required Level: ${item.requiredLevel}/10`}
                            />

                            {/* Current Level Fill Bar */}
                            {item.currentLevel !== null ? (
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  item.gap >= 0
                                    ? "bg-emerald-400"
                                    : item.gap >= -2.0
                                    ? "bg-amber-400"
                                    : "bg-rose-400"
                                )}
                                style={{
                                  width: `${Math.min(100, Math.max(0, item.currentLevel * 10))}%`,
                                }}
                              />
                            ) : (
                              <div className="h-full bg-zinc-800/60 w-0" />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Net Gap */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        {item.gap !== null ? (
                          <span
                            className={cn(
                              "inline-block text-xs font-semibold px-2 py-0.5 rounded-md",
                              item.gap > 0
                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                : item.gap === 0
                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            )}
                          >
                            {item.gap > 0 ? `+${item.gap.toFixed(1)}` : item.gap.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-xs">—</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-medium border font-mono whitespace-nowrap",
                            statusInfo.badgeClass
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dotClass)} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Action Drill Down Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-100 group-hover:text-zinc-200 transition-colors p-1"
                        >
                          <span>Drill Down</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
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
        <div className="md:hidden divide-y divide-zinc-800/80">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 space-y-2">
              <Search className="w-6 h-6 text-zinc-600 mx-auto" />
              <p className="text-sm font-medium text-zinc-300">No matching skills found</p>
              <p className="text-xs text-zinc-500">Reset your filters to see full curriculum.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = CATEGORY_ICONS[item.category] || Layers;
              const statusInfo = getStatusBadge(item.statusKey, item.gap);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="p-4 space-y-3 hover:bg-zinc-900/40 active:bg-zinc-900/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-200">{item.name}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {item.category} · {item.importance}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border font-mono shrink-0",
                        statusInfo.badgeClass
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dotClass)} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Level Numbers & Progress Bar */}
                  <div className="space-y-1.5 bg-zinc-900/70 p-2.5 rounded-lg border border-zinc-800/70">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-zinc-300">
                        Level:{" "}
                        <strong className={getLevelColor(item.currentLevel)}>
                          {item.currentLevel !== null ? item.currentLevel.toFixed(1) : "—"}
                        </strong>
                        <span className="text-zinc-500"> / {item.requiredLevel.toFixed(1)} req</span>
                      </span>

                      {item.gap !== null ? (
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            item.gap >= 0 ? "text-emerald-400" : "text-amber-400"
                          )}
                        >
                          Gap: {item.gap > 0 ? `+${item.gap.toFixed(1)}` : item.gap.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs">Gap: —</span>
                      )}
                    </div>

                    <div className="relative w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-zinc-300 z-10"
                        style={{ left: `${item.requiredLevel * 10}%` }}
                      />
                      {item.currentLevel !== null && (
                        <div
                          className={cn(
                            "h-full rounded-full",
                            item.gap >= 0
                              ? "bg-emerald-400"
                              : item.gap >= -2.0
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          )}
                          style={{
                            width: `${Math.min(100, Math.max(0, item.currentLevel * 10))}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5 font-mono">
                    <span className="text-zinc-500">Tap for evidence & recommendations</span>
                    <span className="text-zinc-300 inline-flex items-center gap-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Interactive Drill-Down Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#141417] border border-zinc-800 w-full max-w-xl rounded-xl p-5 md:p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                  {React.createElement(CATEGORY_ICONS[selectedItem.category] || Layers, {
                    className: "w-5 h-5",
                  })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.2 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono uppercase">
                      {selectedItem.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {selectedItem.importance}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-zinc-100 mt-0.5">
                    {selectedItem.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Level Comparison Highlight Box */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 space-y-3 font-mono">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-[#0c0c0e] border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Your Level</span>
                  <span className={cn("text-xl font-bold mt-0.5", getLevelColor(selectedItem.currentLevel))}>
                    {selectedItem.currentLevel !== null ? selectedItem.currentLevel.toFixed(1) : "—"}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">/ 10</span>
                </div>

                <div className="p-2 rounded bg-[#0c0c0e] border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Required Bar</span>
                  <span className="text-xl font-bold text-zinc-200 mt-0.5">
                    {selectedItem.requiredLevel.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">/ 10</span>
                </div>

                <div className="p-2 rounded bg-[#0c0c0e] border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase">Net Gap</span>
                  <span className={cn("text-xl font-bold mt-0.5", getGapColor(selectedItem.gap))}>
                    {selectedItem.gap !== null
                      ? selectedItem.gap > 0
                        ? `+${selectedItem.gap.toFixed(1)}`
                        : selectedItem.gap.toFixed(1)
                      : "—"}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">levels</span>
                </div>
              </div>

              {/* Progress Bar with Scale Marks */}
              <div className="space-y-1 pt-1">
                <div className="relative w-full bg-[#0c0c0e] rounded-full h-2.5 overflow-hidden border border-zinc-800">
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-zinc-300 z-10"
                    style={{ left: `${selectedItem.requiredLevel * 10}%` }}
                    title={`Required: ${selectedItem.requiredLevel}/10`}
                  />
                  {selectedItem.currentLevel !== null && (
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        selectedItem.gap >= 0
                          ? "bg-emerald-400"
                          : selectedItem.gap >= -2.0
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      )}
                      style={{
                        width: `${Math.min(100, Math.max(0, selectedItem.currentLevel * 10))}%`,
                      }}
                    />
                  )}
                </div>

                <div className="flex justify-between text-[9px] text-zinc-500 font-mono px-0.5">
                  <span>0.0</span>
                  <span>2.5</span>
                  <span>5.0</span>
                  <span>7.5</span>
                  <span>10.0</span>
                </div>
              </div>

              <div className="text-center pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium border font-mono",
                    getStatusBadge(selectedItem.statusKey, selectedItem.gap).badgeClass
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      getStatusBadge(selectedItem.statusKey, selectedItem.gap).dotClass
                    )}
                  />
                  {selectedItem.status} — {selectedItem.statusDescription}
                </span>
              </div>
            </div>

            {/* Evidence Breakdown: Why your level is X */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                  Why your level is {selectedItem.currentLevel !== null ? `${selectedItem.currentLevel}/10` : "Unassessed"}
                </h4>
              </div>
              <ul className="space-y-1.5 bg-zinc-900/50 p-3.5 rounded-lg border border-zinc-800/80">
                {selectedItem.evidence && selectedItem.evidence.length > 0 ? (
                  selectedItem.evidence.map((ev, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                      <span className="text-zinc-500 font-mono mt-0.5">•</span>
                      <span>{ev}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-zinc-500 italic">No specific evidence records available.</li>
                )}
              </ul>
            </div>

            {/* Actionable Steps: What you need to reach target */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-zinc-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                  What you need to reach target bar
                </h4>
              </div>
              <ul className="space-y-2 bg-zinc-900/50 p-3.5 rounded-lg border border-zinc-800/80">
                {selectedItem.improvementSteps && selectedItem.improvementSteps.length > 0 ? (
                  selectedItem.improvementSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                      <div className="w-4 h-4 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-zinc-300 shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span>{step}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-zinc-500 italic">Continue practicing and building project depth.</li>
                )}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-3.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer font-sans"
              >
                Close
              </button>

              <Link
                to={selectedItem.actionLink || "/app/profile"}
                onClick={() => setSelectedItem(null)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors cursor-pointer font-sans"
              >
                <span>{selectedItem.actionLabel || "Take Action"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
