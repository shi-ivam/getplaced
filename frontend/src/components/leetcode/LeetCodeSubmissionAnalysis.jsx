import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { leetcodeService } from "@/services/leetcodeService";
import GpBadge from "@/components/gp/GpBadge";
import GpButton, { GpArrow } from "@/components/gp/GpButton";
import GpCard from "@/components/gp/GpCard";

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
      const resData = await leetcodeService.getSubmissionAnalysis();

      if (resData) {
        setData(resData);
        if (onRefresh && resData.analysis) {
          onRefresh(resData);
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
      await leetcodeService.syncProfile();
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
    let calendarMap = data?.analysis?.consistency?.calendarMap;
    if (!calendarMap || typeof calendarMap !== "object" || Array.isArray(calendarMap)) {
      calendarMap = {};
    }
    const days = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dayStartSec = Math.floor(d.getTime() / 1000);
      const dayEndSec = dayStartSec + 86400;

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
        <div className="h-8 w-64 bg-[#FEF9CF] rounded-xl animate-pulse border-2 border-[#0D0431]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#FAF7EE] rounded-2xl animate-pulse border-2 border-[#0D0431]" />
          ))}
        </div>
      </div>
    );
  }

  const isConnected = data?.connected && data?.analysis;
  const analysis = data?.analysis;

  if (!isConnected || !analysis) {
    return (
      <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-3xl p-8 text-center space-y-4 shadow-[6px_6px_0_0_#0D0431]">
        <div className="w-14 h-14 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-[#0D0431] mx-auto flex items-center justify-center">
          <Code2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-heading font-black text-[#0D0431]">No Connected LeetCode Profile</h3>
          <p className="text-xs text-[#0D0431]/80 max-w-md mx-auto leading-relaxed font-medium">
            Connect your LeetCode account in your Profile to unlock submission activity analytics,
            difficulty accuracy rates, consistency tracking, and pass/fail diagnostics.
          </p>
        </div>
        {error && (
          <div className="text-xs text-[#0D0431] font-mono font-bold bg-[#FFC5B7] border-2 border-[#0D0431] p-3 rounded-xl max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>
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
    <div className={`space-y-6 text-[#0D0431] ${className}`}>
      {/* Header Banner */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FEF9CF] border-2 border-[#0D0431] p-5 sm:p-6 rounded-3xl shadow-[6px_6px_0_0_#0D0431]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431] shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-heading font-black text-lg sm:text-xl text-[#0D0431]">
                  LeetCode Submission & Consistency Analysis
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#0D0431]/80 mt-1 font-mono font-bold">
                <a
                  href={profile?.profileUrl || `https://leetcode.com/u/${profile?.username}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0D0431] hover:underline inline-flex items-center gap-1"
                >
                  <span>@{profile?.username}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {profile?.ranking && profile.ranking < 5000000 ? (
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-[#0D0431]" />
                    Rank #{profile.ranking.toLocaleString()}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 opacity-60">
                    <Trophy className="w-3.5 h-3.5" />
                    Unranked
                  </span>
                )}
                {consistency?.streak > 0 && (
                  <span className="flex items-center gap-1 bg-[#FEDF6A] px-2 py-0.5 rounded-md border border-[#0D0431]">
                    <Flame className="w-3.5 h-3.5 text-[#0D0431]" />
                    {consistency.streak}-Day Streak
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSyncLatest}
              disabled={refreshing}
              className="btn_secondary_wrap px-4 py-2 text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
              title="Refresh submission statistics from LeetCode"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FFC5B7] border-2 border-[#0D0431] text-[#0D0431] px-4 py-3 rounded-2xl text-xs font-bold font-mono shadow-[3px_3px_0_0_#0D0431]">
          <AlertCircle className="w-4 h-4 text-[#0D0431] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. KPI OVERVIEW: Accuracy, Volume & Efficiency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions Card */}
        <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-5 space-y-2.5 shadow-[4px_4px_0_0_#0D0431]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431]/70">
              Total Submissions
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E4CDFB] border border-[#0D0431] flex items-center justify-center text-[#0D0431]">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-[#0D0431]">
            {overview?.totalSubmissions?.toLocaleString() || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {overview?.acceptedSubmissions?.toLocaleString() || 0} Accepted
            </span>
            <span className="text-[#F85B52] flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {overview?.rejectedSubmissions?.toLocaleString() || 0} Rejected
            </span>
          </div>
        </div>

        {/* Overall Acceptance Rate Card */}
        <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-5 space-y-2.5 shadow-[4px_4px_0_0_#0D0431]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431]/70">
              Acceptance Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#D4FDF7] border border-[#0D0431] flex items-center justify-center text-[#0D0431]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-[#0D0431]">
              {overview?.overallAcceptanceRate ?? 0}%
            </span>
            <span className="text-xs font-mono font-bold text-[#0D0431]/70">accuracy</span>
          </div>
          <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#0D0431]">
            <div
              className="bg-[#896EE2] h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, overview?.overallAcceptanceRate || 0))}%`,
              }}
            />
          </div>
        </div>

        {/* Efficiency Ratio Card */}
        <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-5 space-y-2.5 shadow-[4px_4px_0_0_#0D0431]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431]/70">
              Efficiency
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FEDF6A] border border-[#0D0431] flex items-center justify-center text-[#0D0431]">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-[#0D0431]">
              {overview?.efficiencyRatio !== null ? `${overview.efficiencyRatio}x` : "N/A"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#FEF9CF] border border-[#0D0431]">
              {overview?.efficiencyLabel || "Standard"}
            </span>
          </div>
          <p className="text-[10px] text-[#0D0431]/70 font-mono font-bold truncate">
            {overview?.efficiencyRatio !== null
              ? `Avg ${overview.efficiencyRatio} subs / problem`
              : "No solved problems recorded"}
          </p>
        </div>

        {/* Practice Momentum & Consistency Card */}
        <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-5 space-y-2.5 shadow-[4px_4px_0_0_#0D0431]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431]/70">
              Active Practice
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FFC5B7] border border-[#0D0431] flex items-center justify-center text-[#0D0431]">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-[#0D0431]">
              {consistency?.activeDays || 0}
            </span>
            <span className="text-xs font-mono font-bold text-[#0D0431]/70">active days</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
            <span className="text-[#0D0431] flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#0D0431]" />
              {consistency?.streak || 0}-day streak
            </span>
            <span className="text-[10px] text-[#0D0431]/70 uppercase">
              Current Streak
            </span>
          </div>
        </div>
      </div>

      {/* 2. PER-DIFFICULTY ACCURACY CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0D0431]" />
            <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
              Per-Difficulty Submission Accuracy
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Easy Card */}
          <div className="bg-[#D4FDF7] border-2 border-[#0D0431] rounded-2xl p-5 space-y-3 shadow-[4px_4px_0_0_#0D0431]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-[#0D0431]" />
                Easy Problems
              </span>
              <span className="text-xs font-mono font-black text-[#0D0431]">
                {difficultyBreakdown?.easy?.solved || 0} Solved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-white border-2 border-[#0D0431] p-2.5 rounded-xl text-xs font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
              <div>
                <div className="text-[10px] text-[#0D0431]/70 uppercase">Submissions</div>
                <div className="text-[#0D0431] mt-0.5">
                  {difficultyBreakdown?.easy?.acceptedSubmissions || 0} /{" "}
                  {difficultyBreakdown?.easy?.totalSubmissions || 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#0D0431]/70 uppercase">Accuracy</div>
                <div className="text-emerald-700 font-black mt-0.5">
                  {difficultyBreakdown?.easy?.acceptanceRate !== null
                    ? `${difficultyBreakdown.easy.acceptanceRate}%`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#0D0431]">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, difficultyBreakdown?.easy?.acceptanceRate || 0)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Medium Card */}
          <div className="bg-[#FEDF6A] border-2 border-[#0D0431] rounded-2xl p-5 space-y-3 shadow-[4px_4px_0_0_#0D0431]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 border border-[#0D0431]" />
                Medium Problems
              </span>
              <span className="text-xs font-mono font-black text-[#0D0431]">
                {difficultyBreakdown?.medium?.solved || 0} Solved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-white border-2 border-[#0D0431] p-2.5 rounded-xl text-xs font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
              <div>
                <div className="text-[10px] text-[#0D0431]/70 uppercase">Submissions</div>
                <div className="text-[#0D0431] mt-0.5">
                  {difficultyBreakdown?.medium?.acceptedSubmissions || 0} /{" "}
                  {difficultyBreakdown?.medium?.totalSubmissions || 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#0D0431]/70 uppercase">Accuracy</div>
                <div className="text-amber-800 font-black mt-0.5">
                  {difficultyBreakdown?.medium?.acceptanceRate !== null
                    ? `${difficultyBreakdown.medium.acceptanceRate}%`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#0D0431]">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, difficultyBreakdown?.medium?.acceptanceRate || 0)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hard Card */}
          <div className="bg-[#FFC5B7] border-2 border-[#0D0431] rounded-2xl p-5 space-y-3 shadow-[4px_4px_0_0_#0D0431]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-[#0D0431]" />
                Hard Problems
              </span>
              <span className="text-xs font-mono font-black text-[#0D0431]">
                {difficultyBreakdown?.hard?.solved || 0} Solved
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-white border-2 border-[#0D0431] p-2.5 rounded-xl text-xs font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
              <div>
                <div className="text-[10px] text-[#0D0431]/70 uppercase">Submissions</div>
                <div className="text-[#0D0431] mt-0.5">
                  {difficultyBreakdown?.hard?.acceptedSubmissions || 0} /{" "}
                  {difficultyBreakdown?.hard?.totalSubmissions || 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#0D0431]/70 uppercase">Accuracy</div>
                <div className="text-[#F85B52] font-black mt-0.5">
                  {difficultyBreakdown?.hard?.acceptanceRate !== null
                    ? `${difficultyBreakdown.hard.acceptanceRate}%`
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#0D0431]">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, difficultyBreakdown?.hard?.acceptanceRate || 0)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONSISTENCY, STREAKS & ACTIVITY TIMELINE */}
      <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 sm:p-8 space-y-5 shadow-[6px_6px_0_0_#0D0431]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0D0431] pb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#0D0431]" />
            <h4 className="text-sm font-heading font-black uppercase tracking-wider text-[#0D0431]">
              Practice Consistency & Habit Tracking
            </h4>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#0D0431]/80">
            <Calendar className="w-3.5 h-3.5 text-[#0D0431]" />
            <span>30-Day Activity Window</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Practice Cadence & Habit Metrics */}
          <div className="space-y-3 bg-[#FEF9CF] border-2 border-[#0D0431] p-5 rounded-2xl shadow-[3px_3px_0_0_#0D0431] flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#0D0431]" />
                <span>Habit Metrics</span>
              </div>
              <p className="text-[11px] text-[#0D0431]/80 font-sans font-medium">
                Tracking daily practice continuity and problem-solving rhythm.
              </p>
            </div>

            <div className="pt-2 border-t-2 border-[#0D0431]/20 space-y-2 text-xs font-mono font-bold">
              <div className="flex justify-between text-[#0D0431]">
                <span>Active Coding Days:</span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                  {consistency?.activeDays || 0} days
                </span>
              </div>
              <div className="flex justify-between text-[#0D0431]">
                <span>Current Streak:</span>
                <span className="bg-[#FEDF6A] px-2 py-0.5 rounded-md border border-[#0D0431]">
                  {consistency?.streak || 0} days
                </span>
              </div>
              <div className="flex justify-between text-[#0D0431]">
                <span>Problems Solved:</span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                  {overview?.totalSolved || 0}
                </span>
              </div>
              <div className="flex justify-between text-[#0D0431]">
                <span>Overall Accuracy:</span>
                <span className="bg-[#D4FDF7] px-2 py-0.5 rounded-md border border-[#0D0431]">
                  {overview?.overallAcceptanceRate || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 30-Day Activity Heatmap */}
          <div className="lg:col-span-2 space-y-3 bg-[#FAF7EE] border-2 border-[#0D0431] p-5 rounded-2xl shadow-[3px_3px_0_0_#0D0431]">
            <div className="flex items-center justify-between">
              <div className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#0D0431]" />
                <span>Last 30 Days Activity Log</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5 pt-2">
              {recentDaysHeatmap.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.formatted}: ${day.count} submission${day.count === 1 ? "" : "s"}`}
                  className={`h-7 rounded-lg border border-[#0D0431] transition-all flex items-center justify-center text-[10px] font-mono font-bold cursor-pointer ${
                    day.count >= 5
                      ? "bg-[#896EE2] text-white shadow-[1px_1px_0_0_#0D0431]"
                      : day.count >= 2
                      ? "bg-[#FEDF6A] text-[#0D0431]"
                      : day.count === 1
                      ? "bg-[#D4FDF7] text-[#0D0431]"
                      : "bg-white text-[#0D0431]/30 hover:bg-[#FEF9CF]"
                  }`}
                >
                  {day.count > 0 ? day.count : ""}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#0D0431]/70 font-mono font-bold pt-2">
              <span>30 days ago</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="w-3 h-3 rounded bg-white border border-[#0D0431]" />
                <span className="w-3 h-3 rounded bg-[#D4FDF7] border border-[#0D0431]" />
                <span className="w-3 h-3 rounded bg-[#FEDF6A] border border-[#0D0431]" />
                <span className="w-3 h-3 rounded bg-[#896EE2] border border-[#0D0431]" />
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT SUBMISSIONS */}
      <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 sm:p-8 space-y-4 shadow-[6px_6px_0_0_#0D0431]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0D0431] pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0D0431]" />
            <h4 className="text-sm font-heading font-black uppercase tracking-wider text-[#0D0431]">
              Recent Submissions Quality
            </h4>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <span className="text-[#0D0431]/70">Pass Rate:</span>
            <span className="px-3 py-0.5 rounded-full bg-[#D4FDF7] border border-[#0D0431] text-[#0D0431]">
              {recentSubmissionsAnalysis?.acceptedCount || 0} /{" "}
              {recentSubmissionsAnalysis?.totalRecent || 0} (
              {recentSubmissionsAnalysis?.passRate || 0}%)
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="inline-flex items-center bg-[#FEF9CF] border-2 border-[#0D0431] p-1 rounded-2xl text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431]">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === "all" ? "bg-white text-[#0D0431] shadow-[1px_1px_0_0_#0D0431]" : "text-[#0D0431]/70"
              }`}
            >
              All ({recentSubmissionsAnalysis?.recentList?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("accepted")}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === "accepted" ? "bg-white text-[#0D0431] shadow-[1px_1px_0_0_#0D0431]" : "text-[#0D0431]/70"
              }`}
            >
              Accepted ({recentSubmissionsAnalysis?.acceptedCount || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("failed")}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === "failed" ? "bg-white text-[#0D0431] shadow-[1px_1px_0_0_#0D0431]" : "text-[#0D0431]/70"
              }`}
            >
              Failed ({recentSubmissionsAnalysis?.rejectedCount || 0})
            </button>
          </div>

          <span className="text-[11px] text-[#0D0431]/70 font-mono font-bold hidden sm:inline">
            Showing {displayedRecentList.length} of {filteredRecentList.length}
          </span>
        </div>

        {/* Recent Submissions List */}
        {displayedRecentList.length > 0 ? (
          <div className="space-y-2.5">
            {displayedRecentList.map((sub, idx) => {
              const isAccepted = sub.isAccepted;
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-3 px-4 rounded-2xl bg-[#FAF7EE] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isAccepted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#F85B52] shrink-0" />
                    )}

                    <div className="min-w-0">
                      {sub.titleSlug ? (
                        <a
                          href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0D0431] font-heading font-bold truncate inline-flex items-center gap-1 hover:underline"
                        >
                          <span>{sub.title}</span>
                          <ExternalLink className="w-3 h-3 text-[#0D0431]/60" />
                        </a>
                      ) : (
                        <span className="text-[#0D0431] font-heading font-bold truncate">{sub.title}</span>
                      )}

                      <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold flex items-center gap-2 mt-0.5">
                        {sub.lang && (
                          <span className="px-1.5 py-0.2 rounded bg-white border border-[#0D0431]">
                            {sub.lang}
                          </span>
                        )}
                        {sub.timestamp && <span>· {formatRelativeTime(sub.timestamp)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-auto shrink-0">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-black border ${
                        isAccepted
                          ? "bg-[#D4FDF7] text-[#0D0431] border-[#0D0431]"
                          : "bg-[#FFC5B7] text-[#0D0431] border-[#0D0431]"
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
                  className="text-xs text-[#0D0431] font-mono font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  {showAllRecent ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Show All {filteredRecentList.length}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-[#0D0431]/70 font-mono py-6 text-center bg-[#FAF7EE] rounded-2xl border border-[#0D0431]">
            No submissions matching filter criteria.
          </div>
        )}
      </div>

      {/* 5. ACTIONABLE PLACEMENT INSIGHTS */}
      {insights && insights.length > 0 && (
        <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-3xl p-6 sm:p-8 space-y-4 shadow-[6px_6px_0_0_#0D0431]">
          <div className="flex items-center gap-2 border-b-2 border-[#0D0431] pb-3">
            <Sparkles className="w-4 h-4 text-[#896EE2]" />
            <h4 className="text-sm font-heading font-black uppercase tracking-wider text-[#0D0431]">
              Submission Insights & Tactical Recommendations
            </h4>
          </div>
          <div className="space-y-2.5">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-xs text-[#0D0431] font-mono font-bold bg-white border-2 border-[#0D0431] p-3.5 rounded-2xl shadow-[2px_2px_0_0_#0D0431]"
              >
                <span className="text-[#896EE2] font-black shrink-0 text-sm">✦</span>
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
