import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Code2,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import TopicSkillCard from "./TopicSkillCard";
import TopicSummaryHeader from "./TopicSummaryHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function DsaTopicAnalysis({ initialData = null, targetCompany = "", targetJobRole = "" }) {
  const [dsaData, setDsaData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filter and View States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'weakest' | 'strongest' | 'needs_improvement' | 'meets_requirement' | 'unassessed'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [expandedRows, setExpandedRows] = useState({});

  const fetchDsaAnalysis = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${NODE_API_URL}/api/dsa/topics`, {
        withCredentials: true,
      });
      if (res.data) {
        setDsaData(res.data);
      }
    } catch (err) {
      console.error("Could not fetch DSA topic analysis:", err);
      setError("Failed to load DSA topic analysis. Please ensure you are logged in.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchDsaAnalysis();
    } else {
      setDsaData(initialData);
    }
  }, [initialData]);

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered Topics Computation
  const filteredTopics = useMemo(() => {
    if (!dsaData?.topics) return [];

    let list = [...dsaData.topics];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const nameMatch = t.name?.toLowerCase().includes(q);
        const catMatch = t.category?.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q);
        const patternMatch = t.recommendedPatterns?.some((p) => p.toLowerCase().includes(q));
        return nameMatch || catMatch || descMatch || patternMatch;
      });
    }

    // 2. Category Filter
    if (selectedCategory !== "all") {
      list = list.filter(
        (t) => t.categoryId === selectedCategory || t.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Status Filter Tab
    if (statusFilter === "weakest") {
      // Prioritize negative gaps or unassessed with high required level
      list = list
        .filter((t) => t.gap !== null || t.requiredLevel !== null)
        .sort((a, b) => {
          if (a.gap !== null && b.gap !== null) return a.gap - b.gap;
          if (a.gap !== null) return -1;
          if (b.gap !== null) return 1;
          return (a.currentLevel || 0) - (b.currentLevel || 0);
        });
    } else if (statusFilter === "strongest") {
      list = list
        .filter((t) => t.currentLevel !== null)
        .sort((a, b) => (b.currentLevel || 0) - (a.currentLevel || 0) || b.problemsSolved.total - a.problemsSolved.total);
    } else if (statusFilter === "needs_improvement") {
      list = list.filter((t) => t.gap !== null && t.gap < 0);
    } else if (statusFilter === "meets_requirement") {
      list = list.filter((t) => t.gap !== null && t.gap >= 0);
    } else if (statusFilter === "unassessed") {
      list = list.filter((t) => t.dataAvailability === "not_available" || t.currentLevel === null);
    }

    return list;
  }, [dsaData, searchQuery, selectedCategory, statusFilter]);

  const categoriesList = dsaData?.categories || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full bg-zinc-900 rounded-xl" />
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-64 bg-zinc-900 rounded-lg" />
          <Skeleton className="h-10 w-48 bg-zinc-900 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full bg-zinc-900/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const effectiveCompany = targetCompany || dsaData?.targetCompany;
  const effectiveRole = targetJobRole || dsaData?.targetJobRole;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDsaAnalysis(true)}
            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded text-rose-200 text-xs font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Header Summary Banner */}
      <TopicSummaryHeader
        dsaData={dsaData}
        targetCompany={effectiveCompany}
        targetJobRole={effectiveRole}
      />

      {/* 2. Category Proficiency Overview Ribbon */}
      {categoriesList.length > 0 && (
        <div className="rounded-xl bg-[#121215] border border-zinc-800/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                Category Breakdown
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              {categoriesList.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer space-y-1.5 flex flex-col justify-between ${
                    isSelected
                      ? "bg-zinc-800 border-zinc-600 text-white"
                      : "bg-[#16161a] border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-semibold truncate">{cat.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {cat.totalProblemsSolved} solved
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-zinc-800/60 font-mono text-[11px]">
                    <span className="text-zinc-500 text-[10px]">Avg:</span>
                    <span
                      className={`font-bold ${
                        cat.averageLevel !== null
                          ? cat.averageLevel >= 8.0
                            ? "text-emerald-400"
                            : cat.averageLevel >= 6.5
                            ? "text-zinc-200"
                            : "text-amber-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {cat.averageLevel !== null ? `${cat.averageLevel}` : "—"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Search and Filtering Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121215] border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. Trie, Dynamic Programming, BFS, Two Pointers)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 font-sans"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
            {[
              { id: "all", label: "All" },
              { id: "weakest", label: "Focus / Gaps" },
              { id: "strongest", label: "Strongest" },
              { id: "needs_improvement", label: "Needs Imp." },
              { id: "meets_requirement", label: "Meets Bar" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] ${
                  statusFilter === tab.id
                    ? "bg-zinc-100 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "table" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => fetchDsaAnalysis(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Refresh analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
        <span>
          Showing <span className="text-zinc-300 font-semibold">{filteredTopics.length}</span> topics
          {selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}
          {statusFilter !== "all" ? ` (${statusFilter.replace("_", " ")})` : ""}
        </span>

        {(searchQuery || selectedCategory !== "all" || statusFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setStatusFilter("all");
            }}
            className="text-purple-400 hover:underline cursor-pointer text-[11px]"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 4. Display Topics: Grid View vs Table View */}
      {filteredTopics.length === 0 ? (
        <div className="rounded-xl bg-[#121215] border border-zinc-800/80 p-8 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-200">No topics match your current filter</h3>
          <p className="text-xs text-zinc-500">
            Try adjusting your search keyword, category selection, or status filter.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => (
            <TopicSkillCard
              key={topic.id}
              topic={topic}
              targetCompany={effectiveCompany}
              targetJobRole={effectiveRole}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl bg-[#121215] border border-zinc-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#16161a] text-zinc-400 font-mono text-[11px]">
                  <th className="py-3 px-4">Topic & Category</th>
                  <th className="py-3 px-3">Your Level</th>
                  <th className="py-3 px-3">Required Bar</th>
                  <th className="py-3 px-3">Status / Gap</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Solved Count</th>
                  <th className="py-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredTopics.map((topic) => {
                  const isExpanded = Boolean(expandedRows[topic.id]);
                  return (
                    <React.Fragment key={topic.id}>
                      <tr className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-200 font-sans">{topic.name}</div>
                          <div className="text-[10px] text-zinc-500">{topic.category}</div>
                        </td>

                        <td className="py-3 px-3 font-semibold">
                          {topic.currentLevel !== null ? (
                            <span
                              className={
                                topic.currentLevel >= 8.0
                                  ? "text-emerald-400"
                                  : topic.currentLevel >= 6.5
                                  ? "text-zinc-200"
                                  : "text-amber-400"
                              }
                            >
                              {topic.currentLevel.toFixed(1)} / 10
                            </span>
                          ) : (
                            <span className="text-zinc-500">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-zinc-300">
                          {topic.requiredLevel !== null ? `${topic.requiredLevel.toFixed(1)} / 10` : "—"}
                        </td>

                        <td className="py-3 px-3">
                          {topic.gap !== null ? (
                            <span
                              className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                topic.gap > 0
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : topic.gap === 0
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : topic.gap > -2.0
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {topic.gap > 0 ? `+${topic.gap.toFixed(1)} Above` : topic.gap === 0 ? "Meets" : `${topic.gap.toFixed(1)} Gap`}
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500">Unassessed</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-zinc-400">
                          {topic.confidence > 0 ? `${topic.confidence}%` : "—"}
                        </td>

                        <td className="py-3 px-3 text-zinc-300">
                          {topic.problemsSolved?.total || 0}
                          {topic.problemsSolved?.total > 0 && (
                            <span className="text-[10px] text-zinc-500 block">
                              {topic.problemsSolved.medium}M · {topic.problemsSolved.hard}H
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => toggleRowExpand(topic.id)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-[#0e0e11] border-b border-zinc-800/80">
                          <td colSpan={7} className="p-4 space-y-3 text-xs font-sans">
                            <p className="text-zinc-400 text-[11px]">{topic.description}</p>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Evidence:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-zinc-300 text-[11px]">
                                {topic.evidence?.map((e, idx) => (
                                  <li key={idx}>{e}</li>
                                ))}
                              </ul>
                            </div>
                            {topic.recommendedPatterns && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[10px]">
                                <span className="text-zinc-500">Patterns:</span>
                                {topic.recommendedPatterns.map((p, idx) => (
                                  <span key={idx} className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
