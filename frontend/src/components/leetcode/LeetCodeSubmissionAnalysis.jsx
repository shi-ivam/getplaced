import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Calendar,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Code2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BarChart3,
  Check,
  Crown,
  Star,
  Target,
  Trophy,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NODE_API_URL } from "@/config/api";

export default function LeetCodeSubmissionAnalysis({
  initialData = null,
  onRefresh = null,
  showHeader = true,
  className = "",
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'accepted' | 'failed'
  const [showAllRecent, setShowAllRecent] = useState(false);

  const fetchAnalysis = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${NODE_API_URL}/api/leetcode/submissions-analysis`, {
        withCredentials: true,
      });

      if (response.data) {
        setData(response.data);
        if (onRefresh && response.data.analysis) {
          onRefresh(response.data);
        }
      }
    } catch (err) {
      console.error("Error fetching submission analysis:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load submission analysis. Please check your connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!initialData) {
      fetchAnalysis();
    } else {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData, fetchAnalysis]);

  const handleSyncLatest = async () => {
    setRefreshing(true);
    setError("");
    try {
      // First trigger sync to pull newest data from LeetCode
      await axios.post(`${NODE_API_URL}/api/leetcode/sync`, {}, { withCredentials: true });
      // Then re-fetch analysis
      await fetchAnalysis(true);
    } catch (err) {
      console.error("Error syncing LeetCode data:", err);
      setError(err.response?.data?.message || "Failed to sync latest stats from LeetCode.");
      setRefreshing(false);
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      let date;
      const num = Number(timestamp);
      if (!isNaN(num) && num > 0) {
        // LeetCode timestamps are unix seconds
        date = new Date(num * 1000);
      } else {
        date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) return "";

      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffSecs < 45) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "yesterday";
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "";
    }
  };

  // Calendar 30-day activity heatmap data generator
  const recentDaysHeatmap = useMemo(() => {
    const calendarMap = data?.analysis?.consistency?.calendarMap || {};
    const days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dayStartSec = Math.floor(d.getTime() / 1000);
      const dayEndSec = dayStartSec + 86400;

      // Find any submission count on this day
      let count = 0;
      for (const [tsStr, c] of Object.entries(calendarMap)) {
        const ts = Number(tsStr);
        if (ts >= dayStartSec && ts < dayEndSec) {
          count += Number(c) || 0;
        }
      }

      days.push({
        date: d,
        formatted: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
        active: count > 0,
      });
    }

    return days;
  }, [data?.analysis?.consistency?.calendarMap]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-64 bg-zinc-800" />
          <Skeleton className="h-8 w-28 bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 bg-zinc-900 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 bg-zinc-900 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 bg-zinc-900 rounded-xl" />
          <Skeleton className="h-64 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  const isConnected = data?.connected && data?.analysis;
  const analysis = data?.analysis;

  if (!isConnected || !analysis) {
    return (
      <Card className="bg-[#141417] border-zinc-800/80 shadow-md">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Code2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Connected LeetCode Profile</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Connect your LeetCode account in your Profile to unlock submission activity analytics,
              difficulty accuracy rates, consistency tracking, and pass/fail diagnostics.
            </p>
          </div>
          {error && (
            <div className="text-xs text-rose-400 font-mono bg-rose-950/40 border border-rose-900/60 p-2 rounded max-w-md mx-auto">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const {
    profile,
    overview,
    difficultyBreakdown,
    consistency,
    recentSubmissionsAnalysis,
    languageDistribution,
    insights,
  } = analysis;

  // Archetype Badge Color Mapping
  const archetypeColorMap = {
    emerald: "bg-emerald-950/70 text-emerald-300 border-emerald-700/60",
    sky: "bg-sky-950/70 text-sky-300 border-sky-700/60",
    amber: "bg-amber-950/70 text-amber-300 border-amber-700/60",
    orange: "bg-orange-950/70 text-orange-300 border-orange-700/60",
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
  };
  const archetypeBadgeStyle =
    archetypeColorMap[consistency?.archetypeColor] || archetypeColorMap.sky;

  // Filtered recent submissions
  const filteredRecentList = (recentSubmissionsAnalysis?.recentList || []).filter((sub) => {
    if (statusFilter === "accepted") return sub.isAccepted;
    if (statusFilter === "failed") return !sub.isAccepted;
    return true;
  });

  const displayedRecentList = showAllRecent
    ? filteredRecentList
    : filteredRecentList.slice(0, 8);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#17171c] via-[#121215] to-[#17171c] border border-zinc-800 p-4 md:p-5 rounded-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-lg shrink-0 shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-white text-base md:text-lg">
                  LeetCode Submission & Consistency Analysis
                </h3>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${archetypeBadgeStyle}`}
                >
                  <Sparkles className="w-3 h-3" />
                  {consistency?.archetype || "Active Coder"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                <a
                  href={profile?.profileUrl || `https://leetcode.com/u/${profile?.username}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>@{profile?.username}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {profile?.ranking && (
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    Rank #{profile.ranking.toLocaleString()}
                  </span>
                )}
                {consistency?.streak > 0 && (
                  <span className="text-orange-400 flex items-center gap-1 font-semibold">
                    <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500" />
                    {consistency.streak}-Day Streak
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSyncLatest}
              disabled={refreshing}
              className="bg-[#1c1c22] hover:bg-zinc-800 text-zinc-200 border-zinc-700 text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Refresh submission statistics from LeetCode"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-950/70 border border-rose-600/60 text-rose-200 px-3.5 py-2.5 rounded-xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. KPI OVERVIEW: Accuracy, Volume & Efficiency */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Submissions Card */}
        <div className="bg-[#141418] border border-zinc-800/80 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Total Submissions
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview?.totalSubmissions?.toLocaleString() || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {overview?.acceptedSubmissions?.toLocaleString() || 0} Accepted
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {overview?.rejectedSubmissions?.toLocaleString() || 0} Rejected
            </span>
          </div>
        </div>

        {/* Overall Acceptance Rate Card */}
        <div className="bg-[#141418] border border-zinc-800/80 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Overall Acceptance Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {overview?.overallAcceptanceRate ?? 0}%
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">accuracy</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, overview?.overallAcceptanceRate || 0))}%`,
              }}
            />
          </div>
        </div>

        {/* Efficiency Ratio Card */}
        <div className="bg-[#141418] border border-zinc-800/80 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Submission Efficiency
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {overview?.efficiencyRatio !== null ? `${overview.efficiencyRatio}x` : "N/A"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-purple-950/70 text-purple-300 border border-purple-800/60 truncate">
              {overview?.efficiencyLabel || "Standard"}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono truncate" title={overview?.efficiencyDescription}>
            {overview?.efficiencyRatio !== null
              ? `Avg ${overview.efficiencyRatio} submissions / solved problem`
              : "No solved problems recorded"}
          </p>
        </div>

        {/* Practice Momentum & Consistency Card */}
        <div className="bg-[#141418] border border-zinc-800/80 rounded-xl p-4 space-y-2 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Practice Consistency
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-orange-400">
              {consistency?.activeDays || 0}
            </span>
            <span className="text-xs text-zinc-400 font-mono">active days</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-orange-300 flex items-center gap-1 font-semibold">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
              {consistency?.streak || 0}-day streak
            </span>
            <span className="text-zinc-500">{consistency?.archetypeBadge}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PER-DIFFICULTY ACCURACY CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Per-Difficulty Submission Accuracy
            </h4>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Individual Acceptance Rates & Iteration Ratios
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Easy Card */}
          <div className="bg-[#141418] border border-emerald-900/30 rounded-xl p-4.5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Easy Problems
              </span>
              <span className="text-xs font-bold font-mono text-white">
                {difficultyBreakdown?.easy?.solved || 0} Solved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg text-xs font-mono">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Submissions</div>
                <div className="text-zinc-200 font-semibold mt-0.5">
                  {difficultyBreakdown?.easy?.acceptedSubmissions || 0} /{" "}
                  {difficultyBreakdown?.easy?.totalSubmissions || 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Accuracy (AR)</div>
                <div className="text-emerald-400 font-bold mt-0.5">
                  {difficultyBreakdown?.easy?.acceptanceRate !== null
                    ? `${difficultyBreakdown.easy.acceptanceRate}%`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Acceptance Rate</span>
                <span className="text-emerald-400 font-semibold">
                  {difficultyBreakdown?.easy?.acceptanceRate || 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, difficultyBreakdown?.easy?.acceptanceRate || 0)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-0.5">
              <span>Efficiency Ratio</span>
              <span className="text-zinc-200 font-semibold">
                {difficultyBreakdown?.easy?.efficiencyRatio
                  ? `${difficultyBreakdown.easy.efficiencyRatio} sub/problem`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Medium Card */}
          <div className="bg-[#141418] border border-amber-900/30 rounded-xl p-4.5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Medium Problems
              </span>
              <span className="text-xs font-bold font-mono text-white">
                {difficultyBreakdown?.medium?.solved || 0} Solved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg text-xs font-mono">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Submissions</div>
                <div className="text-zinc-200 font-semibold mt-0.5">
                  {difficultyBreakdown?.medium?.acceptedSubmissions || 0} /{" "}
                  {difficultyBreakdown?.medium?.totalSubmissions || 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Accuracy (AR)</div>
                <div className="text-amber-400 font-bold mt-0.5">
                  {difficultyBreakdown?.medium?.acceptanceRate !== null
                    ? `${difficultyBreakdown.medium.acceptanceRate}%`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Acceptance Rate</span>
                <span className="text-amber-400 font-semibold">
                  {difficultyBreakdown?.medium?.acceptanceRate || 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, difficultyBreakdown?.medium?.acceptanceRate || 0)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-0.5">
              <span>Efficiency Ratio</span>
              <span className="text-zinc-200 font-semibold">
                {difficultyBreakdown?.medium?.efficiencyRatio
                  ? `${difficultyBreakdown.medium.efficiencyRatio} sub/problem`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Hard Card */}
          <div className="bg-[#141418] border border-rose-900/30 rounded-xl p-4.5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                Hard Problems
              </span>
              <span className="text-xs font-bold font-mono text-white">
                {difficultyBreakdown?.hard?.solved || 0} Solved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg text-xs font-mono">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Submissions</div>
                <div className="text-zinc-200 font-semibold mt-0.5">
                  {difficultyBreakdown?.hard?.acceptedSubmissions || 0} /{" "}
                  {difficultyBreakdown?.hard?.totalSubmissions || 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Accuracy (AR)</div>
                <div className="text-rose-400 font-bold mt-0.5">
                  {difficultyBreakdown?.hard?.acceptanceRate !== null
                    ? `${difficultyBreakdown.hard.acceptanceRate}%`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Acceptance Rate</span>
                <span className="text-rose-400 font-semibold">
                  {difficultyBreakdown?.hard?.acceptanceRate || 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, difficultyBreakdown?.hard?.acceptanceRate || 0)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-0.5">
              <span>Efficiency Ratio</span>
              <span className="text-zinc-200 font-semibold">
                {difficultyBreakdown?.hard?.efficiencyRatio
                  ? `${difficultyBreakdown.hard.efficiencyRatio} sub/problem`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CONSISTENCY, STREAKS & ACTIVITY TIMELINE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#141418] border border-zinc-800/80 rounded-xl p-4 md:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Practice Consistency & Habit Tracking
            </h4>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400">Consistency Archetype:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${archetypeBadgeStyle}`}>
              {consistency?.archetype}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Archetype Description & Signals */}
          <div className="space-y-3 bg-zinc-900/60 border border-zinc-800/70 p-4 rounded-xl">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{consistency?.archetypeBadge || "Coding Persona"}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {consistency?.archetypeDescription}
            </p>
            <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Active Coding Days:</span>
                <span className="text-white font-bold">{consistency?.activeDays || 0} days</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Current Streak:</span>
                <span className="text-orange-400 font-bold">{consistency?.streak || 0} days</span>
              </div>
              {consistency?.activitySummary?.lastActiveDate && (
                <div className="flex justify-between text-zinc-400">
                  <span>Last Active:</span>
                  <span className="text-zinc-300">
                    {formatRelativeTime(consistency.activitySummary.lastActiveDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 30-Day Activity Heatmap */}
          <div className="lg:col-span-2 space-y-3 bg-zinc-900/60 border border-zinc-800/70 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Last 30 Days Activity Log</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {consistency?.activitySummary?.recent30DaysActiveDays || 0} active days in last 30d
              </span>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5 pt-1">
              {recentDaysHeatmap.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.formatted}: ${day.count} submission${day.count === 1 ? "" : "s"}`}
                  className={`h-7 rounded transition-all duration-200 flex items-center justify-center text-[9px] font-mono cursor-pointer ${
                    day.count >= 5
                      ? "bg-emerald-500 text-black font-bold shadow-sm"
                      : day.count >= 2
                      ? "bg-emerald-600/80 text-white"
                      : day.count === 1
                      ? "bg-emerald-800/80 text-emerald-100"
                      : "bg-zinc-800/60 hover:bg-zinc-700 text-zinc-600"
                  }`}
                >
                  {day.count > 0 ? day.count : ""}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
              <span>30 days ago</span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">Less</span>
                <span className="w-2.5 h-2.5 rounded bg-zinc-800" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-800" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                <span className="text-zinc-400">More</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. RECENT SUBMISSIONS QUALITY & VERDICT BREAKDOWN */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#141418] border border-zinc-800/80 rounded-xl p-4 md:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Recent Submissions Quality Breakdown
            </h4>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400">Pass Rate:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                recentSubmissionsAnalysis?.passRate >= 70
                  ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800"
                  : recentSubmissionsAnalysis?.passRate >= 45
                  ? "bg-amber-950/70 text-amber-300 border border-amber-800"
                  : "bg-rose-950/70 text-rose-300 border border-rose-800"
              }`}
            >
              {recentSubmissionsAnalysis?.acceptedCount || 0} /{" "}
              {recentSubmissionsAnalysis?.totalRecent || 0} (
              {recentSubmissionsAnalysis?.passRate || 0}%)
            </span>
          </div>
        </div>

        {/* Verdict Distribution Pills */}
        <div className="flex flex-wrap gap-2">
          {recentSubmissionsAnalysis?.verdictDistribution && (
            <>
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-md text-xs font-mono text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accepted:</span>
                <strong>{recentSubmissionsAnalysis.verdictDistribution.accepted}</strong>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/50 px-2.5 py-1 rounded-md text-xs font-mono text-rose-300">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Wrong Answer:</span>
                <strong>{recentSubmissionsAnalysis.verdictDistribution.wrongAnswer}</strong>
              </div>

              {recentSubmissionsAnalysis.verdictDistribution.timeLimitExceeded > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1 rounded-md text-xs font-mono text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Time Limit:</span>
                  <strong>{recentSubmissionsAnalysis.verdictDistribution.timeLimitExceeded}</strong>
                </div>
              )}

              {recentSubmissionsAnalysis.verdictDistribution.runtimeError > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-orange-950/40 border border-orange-800/50 px-2.5 py-1 rounded-md text-xs font-mono text-orange-300">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>Runtime Error:</span>
                  <strong>{recentSubmissionsAnalysis.verdictDistribution.runtimeError}</strong>
                </div>
              )}

              {recentSubmissionsAnalysis.verdictDistribution.compileError > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md text-xs font-mono text-zinc-300">
                  <span>Compile Error:</span>
                  <strong>{recentSubmissionsAnalysis.verdictDistribution.compileError}</strong>
                </div>
              )}
            </>
          )}
        </div>

        {/* Filter Tabs for Recent Submissions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === "all" ? "bg-zinc-700 text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({recentSubmissionsAnalysis?.recentList?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("accepted")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === "accepted" ? "bg-emerald-800 text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Accepted ({recentSubmissionsAnalysis?.acceptedCount || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("failed")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === "failed" ? "bg-rose-800 text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Failed ({recentSubmissionsAnalysis?.rejectedCount || 0})
            </button>
          </div>

          <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
            Showing {displayedRecentList.length} of {filteredRecentList.length}
          </span>
        </div>

        {/* Recent Submissions List */}
        {displayedRecentList.length > 0 ? (
          <div className="space-y-2">
            {displayedRecentList.map((sub, idx) => {
              const isAccepted = sub.isAccepted;
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2.5 px-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700 transition-colors gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isAccepted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}

                    <div className="min-w-0">
                      {sub.titleSlug ? (
                        <a
                          href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-200 hover:text-amber-400 font-medium truncate inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{sub.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-zinc-200 font-medium truncate">{sub.title}</span>
                      )}

                      <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                        {sub.lang && (
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                            {sub.lang}
                          </span>
                        )}
                        {sub.timestamp && <span>· {formatRelativeTime(sub.timestamp)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-auto shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                        isAccepted
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : sub.statusDisplay?.includes("Wrong Answer")
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : sub.statusDisplay?.includes("Time Limit")
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {sub.statusDisplay}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredRecentList.length > 8 && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllRecent((prev) => !prev)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showAllRecent ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Show Less Submissions</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Show All {filteredRecentList.length} Submissions</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-zinc-500 font-mono py-6 text-center bg-zinc-900/40 rounded-lg">
            No submissions matching filter criteria.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. LANGUAGE VERSATILITY & DISTRIBUTION */}
      {/* ------------------------------------------------------------- */}
      {languageDistribution && languageDistribution.length > 0 && (
        <div className="bg-[#141418] border border-zinc-800/80 rounded-xl p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
                Language Versatility & Distribution
              </h4>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              {languageDistribution.length} implementation language
              {languageDistribution.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {languageDistribution.map((lang, idx) => (
              <div
                key={lang.languageName || idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  lang.isPrimary
                    ? "bg-amber-950/20 border-amber-600/50 shadow-sm"
                    : "bg-zinc-900/60 border-zinc-800/70"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    {lang.isPrimary && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    {lang.languageName}
                  </span>
                  <span className="font-mono text-zinc-400">
                    {lang.problemsSolved} solved
                  </span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      lang.isPrimary ? "bg-amber-400" : "bg-zinc-600"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(8, lang.percentage))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1.5">
                  <span>{lang.isPrimary ? "Primary Language" : "Secondary"}</span>
                  <span className="font-semibold text-zinc-400">{lang.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. ACTIONABLE PLACEMENT INSIGHTS */}
      {/* ------------------------------------------------------------- */}
      {insights && insights.length > 0 && (
        <div className="bg-[#141418] border border-purple-900/30 rounded-xl p-4 md:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 font-mono">
              Submission Insights & Tactical Recommendations
            </h4>
          </div>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-zinc-300 font-mono bg-purple-950/20 border border-purple-900/30 p-2.5 rounded-lg"
              >
                <span className="text-purple-400 shrink-0 mt-0.5">✦</span>
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
