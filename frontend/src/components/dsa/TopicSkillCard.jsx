import React, { useState } from "react";
import {
  Code2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Target,
  ShieldCheck,
  TrendingUp,
  Flame,
  BookOpen,
} from "lucide-react";

export default function TopicSkillCard({ topic, targetCompany = "", targetJobRole = "" }) {
  const [expanded, setExpanded] = useState(false);

  const getLevelColor = (level) => {
    if (level === null || level === undefined) return "text-zinc-500";
    if (level >= 8.5) return "text-emerald-400";
    if (level >= 7.0) return "text-zinc-200";
    if (level >= 5.0) return "text-amber-400";
    return "text-rose-400";
  };

  const getLevelBarBg = (level) => {
    if (level === null || level === undefined) return "bg-zinc-800";
    if (level >= 8.5) return "bg-emerald-400";
    if (level >= 7.0) return "bg-zinc-400";
    if (level >= 5.0) return "bg-amber-400";
    return "bg-rose-400";
  };

  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case "core":
      case "advanced":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "dynamic programming":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "trees":
      case "graphs":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-800";
    }
  };

  const getGapBadge = () => {
    if (topic.currentLevel === null || topic.dataAvailability === "not_available") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
          <HelpCircle className="w-2.5 h-2.5" />
          Unassessed
        </span>
      );
    }

    if (topic.gap === null) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
          Assessed
        </span>
      );
    }

    if (topic.gap > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
          <CheckCircle2 className="w-2.5 h-2.5" />
          +{topic.gap.toFixed(1)} Above Bar
        </span>
      );
    }

    if (topic.gap === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Meets Bar
        </span>
      );
    }

    if (topic.gap > -2.0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-medium">
          <AlertTriangle className="w-2.5 h-2.5" />
          {topic.gap.toFixed(1)} Needs Imp.
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-medium">
        <AlertCircle className="w-2.5 h-2.5" />
        {topic.gap.toFixed(1)} Major Gap
      </span>
    );
  };

  const getConfidenceBadge = () => {
    const conf = topic.confidence || 0;
    if (conf >= 80) {
      return (
        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          {conf}% High
        </span>
      );
    }
    if (conf >= 40) {
      return (
        <span className="text-[10px] text-zinc-300 font-mono flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          {conf}% Mod
        </span>
      );
    }
    if (conf > 0) {
      return (
        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          {conf}% Prelim
        </span>
      );
    }
    return (
      <span className="text-[10px] text-zinc-500 font-mono">0% No Data</span>
    );
  };

  const totalSolved = topic.problemsSolved?.total || 0;
  const easySolved = topic.problemsSolved?.easy || 0;
  const medSolved = topic.problemsSolved?.medium || 0;
  const hardSolved = topic.problemsSolved?.hard || 0;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        expanded
          ? "bg-[#141418] border-zinc-700"
          : "bg-[#111114] border-zinc-800/80 hover:border-zinc-700/80"
      }`}
    >
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Header Row: Topic Name, Category, Gap Badge */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full font-mono border font-medium ${getCategoryBadgeClass(
                  topic.category
                )}`}
              >
                {topic.category}
              </span>

              {topic.importance === "Required" && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                  Required
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">
              {topic.name}
            </h3>
          </div>

          <div className="shrink-0">{getGapBadge()}</div>
        </div>

        {/* Level and Target Comparison Visual */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-baseline justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 text-[11px]">Level:</span>
              <span className={`font-bold ${getLevelColor(topic.currentLevel)}`}>
                {topic.currentLevel !== null ? `${topic.currentLevel.toFixed(1)} / 10` : "—"}
              </span>
            </div>

            {topic.requiredLevel !== null ? (
              <div className="text-zinc-400 text-[11px]">
                Target: <span className="text-zinc-200 font-semibold">{topic.requiredLevel.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-zinc-600 text-[11px]">No target</span>
            )}
          </div>

          {/* Dual bar / Progress indicator */}
          <div className="relative w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
            {topic.requiredLevel !== null && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-zinc-300 z-10"
                style={{ left: `${Math.min(100, topic.requiredLevel * 10)}%` }}
                title={`Target Benchmark: ${topic.requiredLevel}/10`}
              />
            )}
            <div
              className={`h-full rounded-full transition-all duration-500 ${getLevelBarBg(
                topic.currentLevel
              )}`}
              style={{
                width: `${
                  topic.currentLevel !== null
                    ? Math.min(100, Math.max(0, topic.currentLevel * 10))
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Metrics Grid: Solved Counts & Confidence */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-zinc-400 font-medium">
              {totalSolved} solved
            </span>
            {totalSolved > 0 && (
              <span className="text-zinc-500 text-[10px]">
                ({medSolved}M · {hardSolved}H · {easySolved}E)
              </span>
            )}
          </div>

          <div className="shrink-0">{getConfidenceBadge()}</div>
        </div>

        {/* Expand / Collapse Button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full pt-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>{expanded ? "Hide Evidence & Patterns" : "View Evidence & Patterns"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Accordion Panel */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-zinc-800/70 bg-[#0e0e11] rounded-b-xl space-y-3.5 text-xs">
          {/* Description */}
          {topic.description && (
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              {topic.description}
            </p>
          )}

          {/* Explainable Evidence */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Evidence & Activity
            </span>
            <ul className="space-y-1 text-zinc-300 font-sans text-[11px]">
              {topic.evidence && topic.evidence.length > 0 ? (
                topic.evidence.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-mono mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500 italic">No evidence recorded yet.</li>
              )}
            </ul>
          </div>

          {/* Recommended Practice Patterns */}
          {topic.recommendedPatterns && topic.recommendedPatterns.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-400" />
                Key Interview Patterns
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topic.recommendedPatterns.map((pattern, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Link */}
          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2">
            <span className="text-[10px] text-zinc-500 font-mono">
              Target: {targetCompany || "Industry"} {targetJobRole ? `· ${targetJobRole}` : ""}
            </span>

            <a
              href={`https://leetcode.com/problemset/all/?topicSlugs=${encodeURIComponent(
                topic.id
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer"
            >
              <span>Practice on LeetCode</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
