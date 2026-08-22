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

  const getCategoryBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case "core":
        return "bg-[#E4CDFB] text-[#0D0431] border-2 border-[#0D0431]";
      case "searching":
        return "bg-[#D4FDF7] text-[#0D0431] border-2 border-[#0D0431]";
      case "linked structures":
        return "bg-[#CDE1FF] text-[#0D0431] border-2 border-[#0D0431]";
      case "trees":
        return "bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431]";
      case "graphs":
        return "bg-[#E4CDFB] text-[#0D0431] border-2 border-[#0D0431]";
      case "algorithms":
        return "bg-[#D4FDF7] text-[#0D0431] border-2 border-[#0D0431]";
      case "dynamic programming":
        return "bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431]";
      case "advanced":
        return "bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431]";
      default:
        return "bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431]";
    }
  };

  const getGapBadge = () => {
    if (topic.currentLevel === null || topic.dataAvailability === "not_available") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
          <HelpCircle className="w-3 h-3 text-[#0D0431]" />
          Unassessed
        </span>
      );
    }

    if (topic.gap === null) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#CDE1FF] text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
          Assessed
        </span>
      );
    }

    if (topic.gap > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
          <CheckCircle2 className="w-3 h-3 text-[#0D0431]" />
          +{topic.gap.toFixed(1)} Above Bar
        </span>
      );
    }

    if (topic.gap === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
          <CheckCircle2 className="w-3 h-3 text-[#0D0431]" />
          Meets Bar
        </span>
      );
    }

    if (topic.gap > -2.0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
          <AlertTriangle className="w-3 h-3 text-[#0D0431]" />
          {topic.gap.toFixed(1)} Needs Imp.
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
        <AlertCircle className="w-3 h-3 text-[#0D0431]" />
        {topic.gap.toFixed(1)} Major Gap
      </span>
    );
  };

  const getConfidenceBadge = () => {
    const conf = topic.confidence || 0;
    if (conf >= 80) {
      return (
        <span className="text-[10px] text-[#0D0431] font-mono font-bold flex items-center gap-1 bg-[#D3F8C6] border border-[#0D0431] px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          {conf}% High
        </span>
      );
    }
    if (conf >= 40) {
      return (
        <span className="text-[10px] text-[#0D0431] font-mono font-bold flex items-center gap-1 bg-[#CDE1FF] border border-[#0D0431] px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          {conf}% Mod
        </span>
      );
    }
    if (conf > 0) {
      return (
        <span className="text-[10px] text-[#0D0431] font-mono font-bold flex items-center gap-1 bg-[#FEDF6A] border border-[#0D0431] px-2 py-0.5 rounded-full">
          <HelpCircle className="w-3 h-3" />
          {conf}% Prelim
        </span>
      );
    }
    return (
      <span className="text-[10px] text-[#0D0431]/60 font-mono font-semibold">0% No Data</span>
    );
  };

  const totalSolved = topic.problemsSolved?.total || 0;
  const easySolved = topic.problemsSolved?.easy || 0;
  const medSolved = topic.problemsSolved?.medium || 0;
  const hardSolved = topic.problemsSolved?.hard || 0;

  return (
    <div
      className={`rounded-2xl border-2 border-[#0D0431] transition-all duration-200 bg-white ${
        expanded
          ? "shadow-[6px_6px_0_0_#0D0431]"
          : "shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5"
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Header Row: Topic Name, Category, Gap Badge */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shadow-[1px_1px_0_0_#0D0431] ${getCategoryBadgeClass(
                  topic.category
                )}`}
              >
                {topic.category}
              </span>

              {topic.importance === "Required" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
                  Required
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-heading font-black text-[#0D0431] tracking-tight">
              {topic.name}
            </h3>
          </div>

          <div className="shrink-0">{getGapBadge()}</div>
        </div>

        {/* Level and Target Comparison Visual */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-baseline justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-[#0D0431]/70 font-bold text-[11px]">Level:</span>
              <span className="font-black text-[#0D0431]">
                {topic.currentLevel !== null ? `${topic.currentLevel.toFixed(1)} / 10` : "—"}
              </span>
            </div>

            {topic.requiredLevel !== null ? (
              <div className="text-[#0D0431]/70 text-[11px] font-bold">
                Target: <span className="text-[#0D0431] font-black">{topic.requiredLevel.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[#0D0431]/50 text-[11px] font-semibold">No target</span>
            )}
          </div>

          {/* Dual bar / Progress indicator */}
          <div className="relative w-full bg-[#0D0431]/10 border-2 border-[#0D0431] rounded-full h-3 overflow-hidden p-[1px]">
            {topic.requiredLevel !== null && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#0D0431] z-10"
                style={{ left: `${Math.min(100, topic.requiredLevel * 10)}%` }}
                title={`Target Benchmark: ${topic.requiredLevel}/10`}
              />
            )}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                topic.currentLevel !== null && topic.requiredLevel !== null && topic.currentLevel >= topic.requiredLevel
                  ? "bg-[#D3F8C6]"
                  : "bg-[#896EE2]"
              }`}
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
        <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-[#0D0431]/15 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-[#0D0431] font-bold">
              {totalSolved} solved
            </span>
            {totalSolved > 0 && (
              <span className="text-[#0D0431]/60 text-[10px] font-semibold">
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
          className="w-full pt-2 text-[11px] font-mono font-bold text-[#0D0431] hover:text-[#896EE2] flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>{expanded ? "Hide Evidence & Patterns" : "View Evidence & Patterns"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Accordion Panel */}
      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t-2 border-[#0D0431] bg-[#FEF9CF]/40 rounded-b-2xl space-y-4 text-xs text-[#0D0431]">
          {/* Description */}
          {topic.description && (
            <p className="text-[#0D0431]/80 text-xs font-medium leading-relaxed font-sans">
              {topic.description}
            </p>
          )}

          {/* Explainable Evidence */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0D0431] flex items-center gap-1 font-black">
              <Sparkles className="w-3 h-3 text-[#896EE2]" />
              Evidence & Activity
            </span>
            <ul className="space-y-1 text-[#0D0431] font-sans text-xs font-medium">
              {topic.evidence && topic.evidence.length > 0 ? (
                topic.evidence.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#896EE2] font-mono font-bold mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))
              ) : (
                <li className="text-[#0D0431]/60 italic font-medium">No evidence recorded yet.</li>
              )}
            </ul>
          </div>

          {/* Recommended Practice Patterns */}
          {topic.recommendedPatterns && topic.recommendedPatterns.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0D0431] flex items-center gap-1 font-black">
                <BookOpen className="w-3 h-3 text-[#0D0431]" />
                Key Interview Patterns
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topic.recommendedPatterns.map((pattern, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2.5 py-0.5 rounded-lg bg-white text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[1px_1px_0_0_#0D0431]"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Link */}
          <div className="pt-3 border-t-2 border-[#0D0431]/15 flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#0D0431]/70 font-mono font-semibold">
              Target: {targetCompany || "Industry"} {targetJobRole ? `· ${targetJobRole}` : ""}
            </span>

            <a
              href={`https://leetcode.com/problemset/all/?topicSlugs=${encodeURIComponent(
                topic.id
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#0D0431] hover:text-[#896EE2] underline underline-offset-2 transition-colors cursor-pointer"
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
