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
        <Skeleton className="h-48 w-full bg-white/70 border-2 border-[#0D0431] rounded-3xl shadow-[4px_4px_0_0_#0D0431]" />
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-64 bg-white/70 border-2 border-[#0D0431] rounded-xl" />
          <Skeleton className="h-10 w-48 bg-white/70 border-2 border-[#0D0431] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full bg-white/70 border-2 border-[#0D0431] rounded-2xl shadow-[4px_4px_0_0_#0D0431]" />
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
        <div className="rounded-2xl bg-[#FFC5B7] border-2 border-[#0D0431] p-4 text-[#0D0431] text-xs font-bold shadow-[4px_4px_0_0_#0D0431] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#0D0431] shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDsaAnalysis(true)}
            className="px-3 py-1 bg-white hover:bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
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
        <div className="rounded-3xl bg-[#FEF9CF] border-2 border-[#0D0431] p-5 space-y-4 shadow-[4px_4px_0_0_#0D0431]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                <Layers className="w-4 h-4 text-[#0D0431]" />
              </span>
              <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                Category Breakdown
              </h3>
            </div>
            <span className="text-[11px] text-[#0D0431] font-mono font-bold bg-white border-2 border-[#0D0431] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0_0_#0D0431]">
              {categoriesList.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat.id)}
                  className={`p-3 rounded-2xl border-2 border-[#0D0431] text-left transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#0D0431] text-white shadow-[3px_3px_0_0_#896EE2]"
                      : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] shadow-[2px_2px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-heading font-black truncate">{cat.name}</div>
                    <div className={`text-[10px] font-mono font-semibold ${isSelected ? "text-white/80" : "text-[#0D0431]/70"}`}>
                      {cat.totalProblemsSolved} solved
                    </div>
                  </div>

                  <div className={`flex items-baseline justify-between pt-1.5 border-t-2 font-mono text-[11px] ${isSelected ? "border-white/20" : "border-[#0D0431]/15"}`}>
                    <span className={`text-[10px] font-bold ${isSelected ? "text-white/70" : "text-[#0D0431]/60"}`}>Avg:</span>
                    <span
                      className={`font-black px-1.5 py-0.2 rounded border ${
                        isSelected
                          ? "bg-white text-[#0D0431] border-white"
                          : cat.averageLevel !== null
                          ? cat.averageLevel >= 8.0
                            ? "bg-[#D3F8C6] text-[#0D0431] border-[#0D0431]"
                            : cat.averageLevel >= 6.5
                            ? "bg-[#CDE1FF] text-[#0D0431] border-[#0D0431]"
                            : "bg-[#FEDF6A] text-[#0D0431] border-[#0D0431]"
                          : "bg-gray-100 text-[#0D0431]/50 border-gray-300"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border-2 border-[#0D0431] p-4 rounded-3xl shadow-[4px_4px_0_0_#0D0431]">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#0D0431]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. Trie, Dynamic Programming, BFS, Two Pointers)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FEF9CF] border-2 border-[#0D0431] text-xs font-sans font-semibold text-[#0D0431] placeholder:text-[#0D0431]/50 shadow-[2px_2px_0_0_#0D0431] focus:outline-none focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-[#FEF9CF] border-2 border-[#0D0431] p-1 rounded-2xl text-xs font-mono gap-1 shadow-[2px_2px_0_0_#0D0431]">
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
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[11px] font-bold ${
                  statusFilter === tab.id
                    ? "bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]"
                    : "text-[#0D0431]/70 hover:text-[#0D0431] border-2 border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center bg-[#FEF9CF] border-2 border-[#0D0431] p-1 rounded-2xl gap-1 shadow-[2px_2px_0_0_#0D0431]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer border-2 ${
                viewMode === "grid"
                  ? "bg-[#FEDF6A] text-[#0D0431] border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]"
                  : "bg-transparent text-[#0D0431]/60 border-transparent hover:text-[#0D0431]"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer border-2 ${
                viewMode === "table"
                  ? "bg-[#FEDF6A] text-[#0D0431] border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]"
                  : "bg-transparent text-[#0D0431]/60 border-transparent hover:text-[#0D0431]"
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
            className="p-2 rounded-xl bg-white hover:bg-[#FEDF6A] border-2 border-[#0D0431] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Refresh analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#896EE2]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0D0431]/70 px-1">
        <span>
          Showing <span className="text-[#0D0431] font-black">{filteredTopics.length}</span> topics
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
            className="text-[#896EE2] hover:underline cursor-pointer text-[11px] font-bold font-mono"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 4. Display Topics: Grid View vs Table View */}
      {filteredTopics.length === 0 ? (
        <div className="rounded-3xl bg-white border-2 border-[#0D0431] p-10 text-center space-y-3 shadow-[4px_4px_0_0_#0D0431]">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-heading font-black text-[#0D0431]">No topics match your current filter</h3>
          <p className="text-xs text-[#0D0431]/70 font-medium max-w-sm mx-auto">
            Try adjusting your search keyword, category selection, or status filter.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="rounded-3xl bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#0D0431] bg-[#FEF9CF] text-[#0D0431] font-heading font-black text-[11px]">
                  <th className="py-3.5 px-4">Topic & Category</th>
                  <th className="py-3.5 px-3">Your Level</th>
                  <th className="py-3.5 px-3">Required Bar</th>
                  <th className="py-3.5 px-3">Status / Gap</th>
                  <th className="py-3.5 px-3">Confidence</th>
                  <th className="py-3.5 px-3">Solved Count</th>
                  <th className="py-3.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#0D0431]/15 font-mono text-[#0D0431]">
                {filteredTopics.map((topic) => {
                  const isExpanded = Boolean(expandedRows[topic.id]);
                  return (
                    <React.Fragment key={topic.id}>
                      <tr className="hover:bg-[#FEF9CF]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-heading font-black text-xs text-[#0D0431]">{topic.name}</div>
                          <div className="text-[10px] text-[#0D0431]/60 font-semibold">{topic.category}</div>
                        </td>

                        <td className="py-3.5 px-3 font-bold">
                          {typeof topic.currentLevel === "number" && !isNaN(topic.currentLevel) ? (
                            <span
                              className={`px-2 py-0.5 rounded-full border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] ${
                                topic.currentLevel >= 8.0
                                  ? "bg-[#D3F8C6] text-[#0D0431]"
                                  : topic.currentLevel >= 6.5
                                  ? "bg-[#CDE1FF] text-[#0D0431]"
                                  : "bg-[#FEDF6A] text-[#0D0431]"
                              }`}
                            >
                              {topic.currentLevel.toFixed(1)} / 10
                            </span>
                          ) : (
                            <span className="text-[#0D0431]/50">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-[#0D0431] font-bold">
                          {typeof topic.requiredLevel === "number" && !isNaN(topic.requiredLevel) ? `${topic.requiredLevel.toFixed(1)} / 10` : "—"}
                        </td>

                        <td className="py-3.5 px-3">
                          {typeof topic.gap === "number" && !isNaN(topic.gap) ? (
                            <span
                              className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] ${
                                topic.gap > 0
                                  ? "bg-[#D3F8C6] text-[#0D0431]"
                                  : topic.gap === 0
                                  ? "bg-[#D3F8C6] text-[#0D0431]"
                                  : topic.gap > -2.0
                                  ? "bg-[#FEDF6A] text-[#0D0431]"
                                  : "bg-[#FFC5B7] text-[#0D0431]"
                              }`}
                            >
                              {topic.gap > 0 ? `+${topic.gap.toFixed(1)} Above` : topic.gap === 0 ? "Meets" : `${topic.gap.toFixed(1)} Gap`}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#0D0431]/60 border border-gray-300">Unassessed</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-[#0D0431] font-bold">
                          {topic.confidence > 0 ? `${topic.confidence}%` : "—"}
                        </td>

                        <td className="py-3.5 px-3 text-[#0D0431] font-bold">
                          {topic.problemsSolved?.total || 0}
                          {topic.problemsSolved?.total > 0 && (
                            <span className="text-[10px] text-[#0D0431]/60 font-semibold block">
                              {topic.problemsSolved.medium}M · {topic.problemsSolved.hard}H
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => toggleRowExpand(topic.id)}
                            className="p-1.5 rounded-xl border-2 border-[#0D0431] bg-white hover:bg-[#FEDF6A] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-[#FEF9CF]/40 border-b-2 border-[#0D0431]">
                          <td colSpan={7} className="p-5 space-y-3 text-xs font-sans text-[#0D0431]">
                            <p className="text-[#0D0431]/80 text-xs font-medium">{topic.description}</p>
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-[#0D0431] font-bold uppercase tracking-wider">Evidence:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-[#0D0431] text-xs font-medium">
                                {topic.evidence?.map((e, idx) => (
                                  <li key={idx}>{e}</li>
                                ))}
                              </ul>
                            </div>
                            {topic.recommendedPatterns && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[10px]">
                                <span className="text-[#0D0431] font-bold">Patterns:</span>
                                {topic.recommendedPatterns.map((p, idx) => (
                                  <span key={idx} className="bg-white px-2.5 py-0.5 rounded-lg border-2 border-[#0D0431] text-[#0D0431] font-bold shadow-[1px_1px_0_0_#0D0431]">
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
