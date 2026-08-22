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
import CaideBadge from "@/components/caide/CaideBadge";

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
        <Skeleton className="h-48 w-full bg-white/70 border-2 border-[#0D0431] rounded-3xl shadow-[4px_4px_0_0_#0D0431]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-36 bg-white/70 border-2 border-[#0D0431] rounded-2xl shadow-[4px_4px_0_0_#0D0431]" />
          <Skeleton className="h-36 bg-white/70 border-2 border-[#0D0431] rounded-2xl shadow-[4px_4px_0_0_#0D0431]" />
          <Skeleton className="h-36 bg-white/70 border-2 border-[#0D0431] rounded-2xl shadow-[4px_4px_0_0_#0D0431]" />
        </div>
        <Skeleton className="h-56 w-full bg-white/70 border-2 border-[#0D0431] rounded-3xl shadow-[4px_4px_0_0_#0D0431]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-3xl bg-[#FFC5B7] border-2 border-[#0D0431] p-6 space-y-3 shadow-[4px_4px_0_0_#0D0431] ${className}`}>
        <div className="flex items-center gap-2.5 text-[#0D0431]">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-heading font-black text-sm">Failed to Load DSA Comparison</h3>
        </div>
        <p className="text-xs text-[#0D0431]/80 font-medium">{error}</p>
        <button
          type="button"
          onClick={() => fetchComparison(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FEDF6A] text-xs font-mono font-bold text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] cursor-pointer transition-all"
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
        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431] font-bold font-mono shadow-[1px_1px_0_0_#0D0431]">
          <CheckCircle2 className="w-3 h-3 text-[#0D0431]" />
          Meets Benchmark
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] font-bold font-mono shadow-[1px_1px_0_0_#0D0431]">
        <AlertTriangle className="w-3 h-3 text-[#0D0431]" />
        Needs Improvement
      </span>
    );
  };

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* 1. Header Target Alignment Banner */}
      <div className="rounded-3xl bg-white border-2 border-[#0D0431] p-6 md:p-8 space-y-4 shadow-[6px_6px_0_0_#0D0431]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0D0431] flex items-center gap-1.5 font-bold bg-[#E4CDFB] px-3 py-1 rounded-full border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                <Target className="w-3.5 h-3.5 text-[#0D0431]" />
                Target Company Benchmark
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] font-bold font-mono shadow-[2px_2px_0_0_#0D0431]">
                {data.tierLabel || "Standard Benchmark"}
              </span>
              {isConnected ? (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431] font-bold font-mono shadow-[2px_2px_0_0_#0D0431]">
                  LeetCode: @{data.leetcodeUser?.username}
                </span>
              ) : (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] font-bold font-mono shadow-[2px_2px_0_0_#0D0431]">
                  LeetCode Disconnected
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xl md:text-2xl font-heading font-black text-[#0D0431]">
              <span className="inline-flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#0D0431]" />
                {effectiveCompany && effectiveCompany !== "Not Selected" ? effectiveCompany : "General Industry Target"}
              </span>
              <span className="text-[#0D0431]/40">/</span>
              <span className="inline-flex items-center gap-2 text-[#0D0431]/80 font-bold text-lg md:text-xl">
                <Briefcase className="w-5 h-5 text-[#0D0431]" />
                {effectiveRole && effectiveRole !== "Not Selected" ? effectiveRole : "Software Engineer"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#0D0431]/75 max-w-2xl leading-relaxed font-sans font-medium">
              Comparison between your verified LeetCode problem difficulty mix and {effectiveCompany || "target company"}'s expected interview hiring bar.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => fetchComparison(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FEF9CF] hover:bg-[#FEDF6A] border-2 border-[#0D0431] text-xs font-mono font-bold text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#0D0431]" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Refresh"}</span>
            </button>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>{hasTarget ? "Change Target" : "Set Target"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Unset / Disconnected Callouts */}
      {!hasTarget && (
        <div className="rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] p-5 shadow-[4px_4px_0_0_#0D0431] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#0D0431]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0 mt-0.5">
              <Compass className="w-5 h-5 text-[#0D0431]" />
            </div>
            <div>
              <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                No Target Company Configured
              </h4>
              <p className="text-xs text-[#0D0431]/80 mt-0.5 font-sans font-medium">
                Using default tech benchmarks. Set your target company in Profile to unlock company-tailored difficulty requirements.
              </p>
            </div>
          </div>
          <Link
            to="/app/profile"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431] hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <span>Configure Target</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {!isConnected && (
        <div className="rounded-2xl bg-[#E4CDFB] border-2 border-[#0D0431] p-5 shadow-[4px_4px_0_0_#0D0431] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#0D0431]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0 mt-0.5">
              <Code2 className="w-5 h-5 text-[#0D0431]" />
            </div>
            <div>
              <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                LeetCode Profile Not Connected
              </h4>
              <p className="text-xs text-[#0D0431]/80 mt-0.5 font-sans font-medium">
                Connect your LeetCode username in Profile settings to sync your solved Easy, Medium, and Hard counts and verify your score.
              </p>
            </div>
          </div>
          <Link
            to="/app/profile"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431] hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <span>Connect LeetCode</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Overall DSA Readiness Comparison Card */}
      <div className="rounded-3xl bg-white border-2 border-[#0D0431] p-6 md:p-8 space-y-6 shadow-[6px_6px_0_0_#0D0431]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#896EE2]" />
              <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                Overall DSA Readiness vs Company Bar
              </h3>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-heading font-black text-[#0D0431] tracking-tight">
                {overall.currentReadiness ?? 0}%
              </span>
              <span className="text-sm font-mono font-bold text-[#0D0431]/60">
                / Required {overall.requiredReadiness ?? 75}%
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] ${
                  overall.status === "above_requirement" || overall.status === "meets_requirement"
                    ? "bg-[#D3F8C6] text-[#0D0431]"
                    : "bg-[#FEDF6A] text-[#0D0431]"
                }`}
              >
                {overall.netGapFormatted || "0%"} Gap
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#FEF9CF] border-2 border-[#0D0431] px-5 py-3 rounded-2xl text-xs font-mono shadow-[3px_3px_0_0_#0D0431] shrink-0">
            <div>
              <span className="text-[#0D0431]/70 block text-[10px] font-bold uppercase">Your Score</span>
              <span className="text-[#0D0431] font-heading font-black text-base">{overall.currentReadiness ?? 0}%</span>
            </div>
            <div className="h-7 w-0.5 bg-[#0D0431]/20" />
            <div>
              <span className="text-[#0D0431]/70 block text-[10px] font-bold uppercase">Target Bar</span>
              <span className="text-[#0D0431] font-heading font-black text-base">{overall.requiredReadiness ?? 75}%</span>
            </div>
            <div className="h-7 w-0.5 bg-[#0D0431]/20" />
            <div>
              <span className="text-[#0D0431]/70 block text-[10px] font-bold uppercase">Total Solved</span>
              <span className="text-[#896EE2] font-heading font-black text-base">
                {totalComp.userTotal ?? 0} / {totalComp.requiredTotal ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar with Target Indicator */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono font-bold text-[#0D0431]">
            <span>Current: {overall.currentReadiness ?? 0}%</span>
            <span className="text-[#896EE2]">
              Benchmark Target: {overall.requiredReadiness ?? 75}%
            </span>
          </div>
          <div className="relative w-full bg-[#0D0431]/10 rounded-full h-4 overflow-hidden border-2 border-[#0D0431] p-[1px]">
            {/* Target marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#0D0431] z-10"
              style={{ left: `${Math.min(100, Math.max(0, overall.requiredReadiness || 75))}%` }}
              title={`Target: ${overall.requiredReadiness}%`}
            />
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                (overall.currentReadiness || 0) >= (overall.requiredReadiness || 75)
                  ? "bg-[#D3F8C6]"
                  : "bg-[#896EE2]"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, overall.currentReadiness || 0))}%` }}
            />
          </div>
        </div>

        {/* Dynamic Status Improvement Message Banner */}
        <div
          className={`p-4 rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-start gap-3 text-xs leading-relaxed ${
            overall.status === "above_requirement" || overall.status === "meets_requirement"
              ? "bg-[#D4FDF7] text-[#0D0431]"
              : "bg-[#FEF9CF] text-[#0D0431]"
          }`}
        >
          <div className="p-1 rounded-lg bg-white border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] shrink-0 mt-0.5">
            {overall.status === "above_requirement" || overall.status === "meets_requirement" ? (
              <CheckCircle2 className="w-4 h-4 text-[#0D0431]" />
            ) : (
              <TrendingUp className="w-4 h-4 text-[#0D0431]" />
            )}
          </div>
          <div className="space-y-0.5">
            <span className="font-heading font-black block text-xs uppercase tracking-wider text-[#0D0431]">
              {overall.statusLabel || "DSA Readiness Assessment"}
            </span>
            <p className="text-[#0D0431]/80 font-sans font-medium text-xs">
              {overall.dynamicMessage ||
                `Assess your algorithmic problem-solving readiness against ${effectiveCompany || "target company"} standards.`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Primary Difficulty Benchmark Comparison Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
              <Layers className="w-4 h-4 text-[#0D0431]" />
            </span>
            <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
              Problem Difficulty Benchmarks (Easy / Medium / Hard)
            </h3>
          </div>
          <span className="text-xs text-[#0D0431] font-mono font-bold bg-[#FEF9CF] border-2 border-[#0D0431] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0_0_#0D0431]">
            {totalComp.userTotal ?? 0} / {totalComp.requiredTotal ?? 0} Solved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {difficulties.map((item) => {
            const gap = item.gap ?? 0;
            const cardBg =
              item.key === "easy"
                ? "bg-[#D3F8C6]"
                : item.key === "medium"
                ? "bg-[#FEDF6A]"
                : "bg-[#FFC5B7]";

            return (
              <div
                key={item.key}
                className={`border-2 border-[#0D0431] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${cardBg}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-heading font-black text-[#0D0431]">
                        {item.difficulty}
                      </h4>
                    </div>
                    {getDifficultyBadge(item.status)}
                  </div>

                  <div className="flex items-baseline justify-between font-mono bg-white p-3 rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <div className="space-y-0.5">
                      <span className="text-3xl font-heading font-black text-[#0D0431]">
                        {item.userValue}
                      </span>
                      <span className="text-xs text-[#0D0431]/70 font-bold block"> / {item.requiredValue} benchmark</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-mono font-black text-[#0D0431]">
                        {item.gapFormatted}
                      </span>
                      <span className="text-[10px] text-[#0D0431]/70 font-bold block uppercase">Gap</span>
                    </div>
                  </div>

                  {/* Difficulty Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-white rounded-full h-3 overflow-hidden border-2 border-[#0D0431] p-[1px]">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[#896EE2]"
                        style={{ width: `${Math.min(100, Math.max(0, item.percentage || 0))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono font-bold text-[#0D0431]">
                      <span>{item.percentage}% of target</span>
                      <span>
                        {gap < 0 ? `Needs ${Math.abs(gap)} more` : "Target satisfied"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-[#0D0431]/20 flex items-center justify-between">
                  <span className="text-[11px] text-[#0D0431] font-mono font-bold">
                    {item.key === "medium"
                      ? "High Priority (Core)"
                      : item.key === "hard"
                      ? "Advanced Round"
                      : "Foundational"}
                  </span>
                  <Link
                    to="/app/dsa"
                    className="text-xs text-[#0D0431] font-mono font-black inline-flex items-center gap-1 hover:text-[#896EE2] transition-colors underline underline-offset-2"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Actionable Roadmap & Milestone Targets */}
      <div className="rounded-3xl bg-[#FEF9CF] border-2 border-[#0D0431] p-6 md:p-8 space-y-6 shadow-[6px_6px_0_0_#0D0431]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
              <Trophy className="w-4 h-4 text-[#0D0431]" />
            </span>
            <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
              Actionable Improvement Roadmap for {effectiveCompany || "Target Role"}
            </h3>
          </div>
          <span className="text-xs text-[#0D0431] font-mono font-bold bg-white border-2 border-[#0D0431] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0_0_#0D0431]">
            {roadmap.milestones?.length || 0} Milestones
          </span>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmap.milestones?.map((milestone) => (
            <div
              key={milestone.id}
              className="bg-white border-2 border-[#0D0431] rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-[3px_3px_0_0_#0D0431]"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] ${
                      milestone.badgeColor === "amber"
                        ? "bg-[#FEDF6A] text-[#0D0431]"
                        : milestone.badgeColor === "rose"
                        ? "bg-[#FFC5B7] text-[#0D0431]"
                        : milestone.badgeColor === "sky"
                        ? "bg-[#CDE1FF] text-[#0D0431]"
                        : "bg-[#D3F8C6] text-[#0D0431]"
                    }`}
                  >
                    {milestone.priority} Priority
                  </span>
                  <span className="text-xs font-mono text-[#0D0431] font-black">
                    {milestone.difficulty}
                  </span>
                </div>

                <h4 className="text-sm font-heading font-black text-[#0D0431]">{milestone.title}</h4>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                  {milestone.description}
                </p>
              </div>

              <div className="pt-2 border-t-2 border-[#0D0431]/15 flex items-center justify-between">
                <span className="text-[10px] text-[#0D0431]/70 font-mono font-bold">
                  {milestone.targetCount > 0 ? `Deficit: ${milestone.targetCount} problems` : "Mastery Met"}
                </span>
                <Link
                  to="/app/dsa"
                  className="text-xs text-[#0D0431] hover:text-[#896EE2] font-mono font-black inline-flex items-center gap-1 underline underline-offset-2"
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
          <div className="space-y-3 pt-3 border-t-2 border-[#0D0431]/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider">
                Priority Topic Gaps
              </span>
              <span className="text-[10px] text-[#0D0431]/70 font-mono font-bold">Target Bar Deficits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roadmap.priorityTopics.slice(0, 3).map((topic) => (
                <div
                  key={topic.id}
                  className="p-3 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <span className="font-heading font-black text-xs text-[#0D0431] truncate block">
                      {topic.name}
                    </span>
                    <span className="text-[10px] text-[#0D0431]/60 font-semibold truncate block">
                      {topic.category}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-full border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] ${
                        topic.gap !== null && topic.gap < 0 ? "bg-[#FEDF6A] text-[#0D0431]" : "bg-[#D3F8C6] text-[#0D0431]"
                      }`}
                    >
                      {topic.gap !== null ? (topic.gap > 0 ? `+${topic.gap}` : topic.gap) : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items Checklist */}
        {roadmap.actionItems && roadmap.actionItems.length > 0 && (
          <div className="bg-white border-2 border-[#0D0431] rounded-2xl p-4 space-y-2.5 shadow-[3px_3px_0_0_#0D0431]">
            <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431] block">
              Recommended Next Steps
            </span>
            <ul className="space-y-2">
              {roadmap.actionItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-[#0D0431] font-medium font-sans">
                  <div className="w-2 h-2 rounded-full bg-[#896EE2] border border-[#0D0431] shrink-0" />
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
