import React from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Flame,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Briefcase,
} from "lucide-react";

export default function TopicSummaryHeader({ dsaData, targetCompany = "", targetJobRole = "" }) {
  const summary = dsaData?.summary || {};
  const leetcodeUser = dsaData?.leetcodeUser;
  const isConnected = dsaData?.isConnected;

  const overallLevel = summary.overallDsaLevel;
  const overallScore = summary.overallDsaScore;
  const coveragePercent = summary.coveragePercent || 0;
  const analyzedCount = summary.topicsAnalyzedCount || 0;
  const totalCount = summary.totalTopicsCount || 35;

  const strongest = summary.strongestTopics?.[0];
  const weakest = summary.largestGapTopic || summary.weakestTopics?.[0];

  const getLevelColor = (level) => {
    if (level === null || level === undefined) return "text-zinc-500";
    if (level >= 8.5) return "text-emerald-400";
    if (level >= 7.0) return "text-sky-400";
    if (level >= 5.0) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="rounded-xl bg-[#121215] border border-zinc-800/90 p-5 md:p-6 space-y-6 shadow-sm">
      {/* Top Banner Row: Overall Level & LeetCode Sync */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5 font-bold">
              <Code2 className="w-3.5 h-3.5" />
              DSA Proficiency Engine
            </span>

            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                <CheckCircle2 className="w-2.5 h-2.5" />
                LeetCode Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                Standalone Mode
              </span>
            )}

            {(targetCompany || targetJobRole) && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono flex items-center gap-1">
                <Target className="w-2.5 h-2.5 text-zinc-400" />
                Target: {targetCompany || "Any"}{targetJobRole ? ` · ${targetJobRole}` : ""}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-4xl md:text-5xl font-bold font-mono tracking-tight ${getLevelColor(overallLevel)}`}>
                {overallLevel !== null ? overallLevel.toFixed(1) : "—"}
              </span>
              <span className="text-sm md:text-base font-mono text-zinc-500">/ 10.0</span>
            </div>

            <div className="hidden sm:flex flex-col text-xs text-zinc-400 pl-4 border-l border-zinc-800 space-y-0.5 font-mono">
              <div className="text-zinc-200 font-semibold">
                {overallScore !== null ? `${overallScore}/100 Placement Score` : "Uncalculated"}
              </div>
              <div className="text-[11px] text-zinc-500">
                {analyzedCount} of {totalCount} topics evaluated ({coveragePercent}%)
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            {isConnected
              ? `Multi-topic proficiency derived from ${leetcodeUser?.totalSolved || 0} solved problems on LeetCode (@${leetcodeUser?.username}), weighted across difficulty tiers and algorithmic breadth.`
              : "Connect your public LeetCode handle in Profile to calculate dynamic topic proficiency and pinpoint company-specific skill gaps."}
          </p>
        </div>

        {/* LeetCode Sync / Connect Status Widget */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl shrink-0 flex flex-col justify-between space-y-3 self-start lg:self-auto min-w-[240px]">
          {isConnected && leetcodeUser ? (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-500 text-[11px]">LeetCode</span>
                <a
                  href={leetcodeUser.profileUrl || `https://leetcode.com/u/${leetcodeUser.username}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
                >
                  <span>@{leetcodeUser.username}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="flex items-center justify-between text-zinc-300 text-[11px]">
                <span className="text-zinc-500">Solved:</span>
                <span>
                  {leetcodeUser.totalSolved} ({leetcodeUser.mediumSolved}M · {leetcodeUser.hardSolved}H)
                </span>
              </div>

              {leetcodeUser.ranking && (
                <div className="flex items-center justify-between text-zinc-300 text-[11px]">
                  <span className="text-zinc-500">Global Rank:</span>
                  <span className="text-amber-300">#{leetcodeUser.ranking.toLocaleString()}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>Connect LeetCode</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Import your verified problem-solving stats for automated gap detection.
              </p>
              <Link
                to="/app/profile"
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
              >
                <span>Connect Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Highlights Grid: Strongest, Weakest / Largest Gap, Coverage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-zinc-800/80">
        {/* Strongest Topic Card */}
        <div className="bg-[#16161a] border border-emerald-900/30 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1 font-semibold">
              <Trophy className="w-3 h-3" />
              Strongest Topic
            </span>
            {strongest && (
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {strongest.currentLevel !== null ? `${strongest.currentLevel.toFixed(1)}/10` : ""}
              </span>
            )}
          </div>

          {strongest ? (
            <div>
              <div className="text-sm font-semibold text-zinc-100">{strongest.name}</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                {strongest.problemsSolved} solved · {strongest.category}
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 italic">No topic data available yet</div>
          )}
        </div>

        {/* Weakest / Largest Gap Card */}
        <div className="bg-[#16161a] border border-amber-900/30 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3 h-3" />
              Priority Focus Area
            </span>
            {weakest?.gap !== null && weakest?.gap !== undefined && (
              <span className={`text-[10px] font-mono font-bold ${weakest.gap < 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {weakest.gap < 0 ? `${weakest.gap.toFixed(1)} Gap` : "Target Met"}
              </span>
            )}
          </div>

          {weakest ? (
            <div>
              <div className="text-sm font-semibold text-zinc-100">{weakest.name}</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Level: {weakest.currentLevel !== null ? weakest.currentLevel.toFixed(1) : "—"} · Req:{" "}
                {weakest.requiredLevel !== null ? weakest.requiredLevel.toFixed(1) : "—"}
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 italic">No target benchmark configured</div>
          )}
        </div>

        {/* Taxonomy Breadth Coverage Card */}
        <div className="bg-[#16161a] border border-zinc-800 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3 text-sky-400" />
              Taxonomy Breadth
            </span>
            <span className="text-[10px] font-mono text-zinc-300 font-bold">{coveragePercent}%</span>
          </div>

          <div>
            <div className="text-sm font-semibold text-zinc-100">
              {analyzedCount} of {totalCount} Topics
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
