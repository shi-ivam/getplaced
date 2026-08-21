import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Target,
  Building2,
  Briefcase,
  Code2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Layers,
  ShieldCheck,
  Flame,
  Compass,
  ChevronRight,
  HelpCircle,
  BookOpen,
  Trophy,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function DsaRequirementComparison({
  initialData = null,
  targetCompany = "",
  targetJobRole = "",
  className = "",
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchComparison = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${NODE_API_URL}/api/dsa/readiness-comparison`, {
        withCredentials: true,
      });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Could not fetch DSA readiness comparison:", err);
      setError("Failed to load DSA readiness comparison. Please ensure you are logged in.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchComparison();
    } else {
      setData(initialData);
    }
  }, [initialData]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-48 w-full bg-zinc-900 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-36 bg-zinc-900/80 rounded-xl" />
          <Skeleton className="h-36 bg-zinc-900/80 rounded-xl" />
          <Skeleton className="h-36 bg-zinc-900/80 rounded-xl" />
        </div>
        <Skeleton className="h-56 w-full bg-zinc-900 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl bg-[#121215] border border-rose-500/20 p-6 space-y-3 ${className}`}>
        <div className="flex items-center gap-2.5 text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Failed to Load DSA Comparison</h3>
        </div>
        <p className="text-xs text-zinc-400">{error}</p>
        <button
          type="button"
          onClick={() => fetchComparison(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 cursor-pointer font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  const effectiveCompany = targetCompany || data.targetCompany;
  const effectiveRole = targetJobRole || data.targetJobRole;
  const isConnected = data.isConnected;
  const hasTarget = data.hasTarget;
  const overall = data.overallReadiness || {};
  const difficulties = data.difficulties || [];
  const totalComp = data.totalComparison || {};
  const roadmap = data.roadmap || {};

  const getDifficultyBadge = (status) => {
    if (status === "meets_requirement") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium font-mono">
          <CheckCircle2 className="w-3 h-3" />
          Meets Benchmark
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium font-mono">
        <AlertTriangle className="w-3 h-3" />
        Needs Improvement
      </span>
    );
  };

  const getGapColor = (gap) => {
    if (gap > 0) return "text-emerald-400";
    if (gap === 0) return "text-emerald-400";
    return "text-amber-400";
  };

  const getDiffProgressBarBg = (diffKey, percentage) => {
    if (percentage >= 100) return "bg-emerald-400";
    if (percentage >= 70) return "bg-amber-400";
    return "bg-rose-400";
  };

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* 1. Header Target Alignment Banner */}
      <div className="rounded-xl bg-[#121215] border border-zinc-800/90 p-5 md:p-6 transition-colors hover:border-zinc-700/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                Target Company Benchmark
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium font-mono">
                {data.tierLabel || "Standard Benchmark"}
              </span>
              {isConnected ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  LeetCode: @{data.leetcodeUser?.username}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                  LeetCode Disconnected
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-lg md:text-xl font-bold text-zinc-100">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-5 h-5 text-purple-400" />
                {effectiveCompany && effectiveCompany !== "Not Selected" ? effectiveCompany : "General Industry Target"}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="inline-flex items-center gap-1.5 text-zinc-300 font-medium text-base md:text-lg">
                <Briefcase className="w-4 h-4 text-zinc-400" />
                {effectiveRole && effectiveRole !== "Not Selected" ? effectiveRole : "Software Engineer"}
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Comparison between your verified LeetCode problem difficulty mix and {effectiveCompany || "target company"}'s expected interview hiring bar.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => fetchComparison(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-purple-400" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Refresh"}</span>
            </button>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm shadow-purple-900/40 cursor-pointer"
            >
              <span>{hasTarget ? "Change Target" : "Set Target"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Unset / Disconnected Callouts */}
      {!hasTarget && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Compass className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
                No Target Company Configured
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Using default tech benchmarks. Set your dream company in Profile to unlock company-tailored difficulty requirements.
              </p>
            </div>
          </div>
          <Link
            to="/app/profile"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors shrink-0 font-mono"
          >
            <span>Configure Target</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {!isConnected && (
        <div className="rounded-xl bg-purple-500/5 border border-purple-500/20 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Code2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider font-mono">
                LeetCode Profile Not Connected
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Connect your LeetCode username in Profile settings to automatically sync your solved Easy, Medium, and Hard counts and verify your score.
              </p>
            </div>
          </div>
          <Link
            to="/app/profile"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shrink-0 shadow-sm shadow-purple-900/30"
          >
            <span>Connect LeetCode</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Overall DSA Readiness Comparison Card */}
      <div className="rounded-xl bg-[#121215] border border-zinc-800/90 p-5 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Overall DSA Readiness vs Company Bar
              </h3>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl md:text-4xl font-bold font-mono text-zinc-100 tracking-tight">
                {overall.currentReadiness ?? 0}%
              </span>
              <span className="text-sm font-mono text-zinc-500">
                / Required {overall.requiredReadiness ?? 75}%
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium border ${
                  overall.status === "above_requirement" || overall.status === "meets_requirement"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {overall.netGapFormatted || "0%"} Gap
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 rounded-lg text-xs font-mono shrink-0">
            <div>
              <span className="text-zinc-500 block text-[10px]">Your Score</span>
              <span className="text-zinc-100 font-bold text-sm">{overall.currentReadiness ?? 0}%</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-zinc-500 block text-[10px]">Target Bar</span>
              <span className="text-zinc-300 font-bold text-sm">{overall.requiredReadiness ?? 75}%</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-zinc-500 block text-[10px]">Total Solved</span>
              <span className="text-purple-400 font-bold text-sm">
                {totalComp.userTotal ?? 0} / {totalComp.requiredTotal ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar with Target Indicator */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>Current: {overall.currentReadiness ?? 0}%</span>
            <span className="text-purple-300">
              Benchmark Target: {overall.requiredReadiness ?? 75}%
            </span>
          </div>
          <div className="relative w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-800">
            {/* Target marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-purple-400 z-10 shadow-sm"
              style={{ left: `${Math.min(100, Math.max(0, overall.requiredReadiness || 75))}%` }}
              title={`Target: ${overall.requiredReadiness}%`}
            />
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                (overall.currentReadiness || 0) >= (overall.requiredReadiness || 75)
                  ? "bg-emerald-400"
                  : "bg-purple-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, overall.currentReadiness || 0))}%` }}
            />
          </div>
        </div>

        {/* Dynamic Status Improvement Message Banner */}
        <div
          className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs leading-relaxed ${
            overall.status === "above_requirement" || overall.status === "meets_requirement"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-300"
          }`}
        >
          {overall.status === "above_requirement" || overall.status === "meets_requirement" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-semibold block font-mono text-[11px] uppercase tracking-wider">
              {overall.statusLabel || "DSA Readiness Assessment"}
            </span>
            <p className="text-zinc-300 font-sans">
              {overall.dynamicMessage ||
                `Assess your algorithmic problem-solving readiness against ${effectiveCompany || "target company"} standards.`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Primary Difficulty Benchmark Comparison Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
              Problem Difficulty Benchmarks (Easy / Medium / Hard)
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {totalComp.userTotal ?? 0} of {totalComp.requiredTotal ?? 0} Total Target Solved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficulties.map((item) => {
            const gap = item.gap ?? 0;

            return (
              <div
                key={item.key}
                className="bg-[#121215] border border-zinc-800/90 hover:border-zinc-700/80 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.key === "easy"
                            ? "bg-emerald-400"
                            : item.key === "medium"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <h4 className="text-sm font-bold text-zinc-100 font-mono">
                        {item.difficulty}
                      </h4>
                    </div>
                    {getDifficultyBadge(item.status)}
                  </div>

                  <div className="flex items-baseline justify-between font-mono">
                    <div className="space-y-0.5">
                      <span className="text-2xl font-bold text-zinc-100">
                        {item.userValue}
                      </span>
                      <span className="text-xs text-zinc-500"> / {item.requiredValue} benchmark</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-bold font-mono ${getGapColor(gap)}`}>
                        {item.gapFormatted}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">Gap</span>
                    </div>
                  </div>

                  {/* Difficulty Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getDiffProgressBarBg(
                          item.key,
                          item.percentage
                        )}`}
                        style={{ width: `${Math.min(100, Math.max(0, item.percentage || 0))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                      <span>{item.percentage}% of target</span>
                      <span>
                        {gap < 0 ? `Needs ${Math.abs(gap)} more` : "Target satisfied"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {item.key === "medium"
                      ? "High Priority (Core)"
                      : item.key === "hard"
                      ? "Advanced Round"
                      : "Foundational"}
                  </span>
                  <Link
                    to="/app/interview"
                    className="text-xs text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Actionable Roadmap & Milestone Targets */}
      <div className="rounded-xl bg-[#121215] border border-zinc-800/90 p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
              Actionable Improvement Roadmap for {effectiveCompany || "Target Role"}
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {roadmap.milestones?.length || 0} Milestones
          </span>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmap.milestones?.map((milestone) => (
            <div
              key={milestone.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                      milestone.badgeColor === "amber"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : milestone.badgeColor === "rose"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : milestone.badgeColor === "sky"
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {milestone.priority} Priority
                  </span>
                  <span className="text-xs font-mono text-zinc-400 font-bold">
                    {milestone.difficulty}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-zinc-200">{milestone.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {milestone.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {milestone.targetCount > 0 ? `Deficit: ${milestone.targetCount} problems` : "Mastery Met"}
                </span>
                <Link
                  to="/app/interview"
                  className="text-xs text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1 hover:underline"
                >
                  <span>Start Solving</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Priority Focus Topics */}
        {roadmap.priorityTopics && roadmap.priorityTopics.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Priority Topic Gaps
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Target Bar Deficits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {roadmap.priorityTopics.slice(0, 3).map((topic) => (
                <div
                  key={topic.id}
                  className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <span className="font-medium text-zinc-200 truncate block">
                      {topic.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate block">
                      {topic.category}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-semibold text-xs ${
                        topic.gap !== null && topic.gap < 0 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {topic.gap !== null ? (topic.gap > 0 ? `+${topic.gap}` : topic.gap) : "—"}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">Gap</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items Checklist */}
        {roadmap.actionItems && roadmap.actionItems.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3.5 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
              Recommended Next Steps
            </span>
            <ul className="space-y-1.5">
              {roadmap.actionItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
