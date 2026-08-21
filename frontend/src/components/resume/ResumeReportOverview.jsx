import React, { useState } from "react";
import {
  Award,
  Check,
  Copy,
  Download,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import jsPDF from "jspdf";

export default function ResumeReportOverview({
  evaluation,
  targetRole = "Software Engineer",
  jobDescription = "",
  onNavigateToActionCenter
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [keywordFilter, setKeywordFilter] = useState("all"); // 'all' | 'matched' | 'missing'

  if (!evaluation) return null;

  const handleCopyBullet = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const marginLeft = 45;
    let yPos = 55;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(17, 24, 39);
    doc.text("GetPlaced ATS Placement Report", marginLeft, yPos);
    yPos += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | Target: ${targetRole || "Software Engineer"}`,
      marginLeft,
      yPos
    );
    yPos += 30;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginLeft, yPos, 505, 55, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `ATS Score: ${evaluation.ats_score}/100 (${evaluation.score_tier || "Competitive"})`,
      marginLeft + 16,
      yPos + 22
    );

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(evaluation.summary_critique || "", 475);
    doc.text(summaryLines, marginLeft + 16, yPos + 40);
    yPos += 75;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Category Metrics Breakdown", marginLeft, yPos);
    yPos += 18;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    const cats = evaluation.category_scores || {};
    Object.entries(cats).forEach(([key, val]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      doc.text(`${label}: ${val}%`, marginLeft + 8, yPos);
      yPos += 14;
    });
    yPos += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Keywords & Skill Alignment", marginLeft, yPos);
    yPos += 18;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    const matchedStr = (evaluation.matched_keywords || []).map((k) => k.keyword).join(", ");
    const missingStr = (evaluation.missing_keywords || []).map((k) => k.keyword).join(", ");

    doc.text(
      `Matched (${evaluation.matched_keywords?.length || 0}): ${matchedStr || "None"}`,
      marginLeft + 8,
      yPos,
      { maxWidth: 490 }
    );
    yPos += 26;
    doc.text(
      `Missing (${evaluation.missing_keywords?.length || 0}): ${missingStr || "None"}`,
      marginLeft + 8,
      yPos,
      { maxWidth: 490 }
    );
    yPos += 30;

    if (evaluation.bullet_improvements?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Google XYZ Bullet Optimizations", marginLeft, yPos);
      yPos += 18;

      evaluation.bullet_improvements.slice(0, 3).forEach((b) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(156, 163, 175);
        doc.text(`Original: ${b.original}`, marginLeft + 8, yPos, { maxWidth: 490 });
        yPos += 18;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text(`Optimized: ${b.improved_xyz}`, marginLeft + 8, yPos, { maxWidth: 490 });
        yPos += 26;
      });
    }

    doc.save(`GetPlaced_ATS_Report_${(targetRole || "Candidate").replace(/\s+/g, "_")}.pdf`);
  };

  const matchedKeywords = evaluation.matched_keywords || [];
  const missingKeywords = evaluation.missing_keywords || [];
  const totalKeywords = matchedKeywords.length + missingKeywords.length;

  return (
    <div className="space-y-6">
      
      {/* 1. Score Overview & ATS Placement Index Card */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            {/* Radial ATS Gauge Meter */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/[0.06]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    evaluation.ats_score >= 80
                      ? "text-emerald-400"
                      : evaluation.ats_score >= 65
                      ? "text-violet-400"
                      : "text-amber-400"
                  }
                  strokeDasharray={`${evaluation.ats_score}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono leading-none">
                  {evaluation.ats_score}
                </span>
                <span className="text-[9px] font-mono text-neutral-400 mt-0.5">/ 100</span>
              </div>
            </div>

            {/* Score Meta Details */}
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                  ATS Placement Index
                </h3>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md border ${
                    evaluation.ats_score >= 80
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : evaluation.ats_score >= 65
                      ? "bg-violet-500/10 text-violet-300 border-violet-500/30"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {evaluation.score_tier || "Competitive"}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-white/[0.04] text-neutral-400 border border-white/[0.08] rounded-md">
                  Target: {targetRole || "Software Engineer"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed break-words">
                {evaluation.summary_critique}
              </p>
            </div>
          </div>

          {/* Export & Action Center Link */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-xs font-medium text-neutral-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </button>
            {onNavigateToActionCenter && (
              <button
                onClick={onNavigateToActionCenter}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-xl text-xs shadow-md hover:bg-neutral-200 active:scale-[0.99] transition"
              >
                <Zap className="w-3.5 h-3.5" />
                Open Action Center
              </button>
            )}
          </div>
        </div>

        {/* 2. Category Metrics Breakdown (Fixed Non-overlapping Rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-6 border-t border-white/[0.06]">
          {evaluation.category_scores &&
            Object.entries(evaluation.category_scores).map(([catKey, score]) => {
              const label = catKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <div key={catKey} className="bg-black/30 p-3.5 rounded-xl border border-white/[0.05] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 truncate font-medium">{label}</span>
                    <span className="font-mono text-white font-semibold">{score}%</span>
                  </div>
                  {/* Clean Separate Progress Bar Row */}
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80 ? "bg-emerald-400" : score >= 65 ? "bg-violet-400" : "bg-amber-400"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                    <span>Target: 85%</span>
                    <span className={score >= 85 ? "text-emerald-400" : "text-neutral-400"}>
                      {score >= 85 ? "Optimal" : `Gap: ${85 - score}%`}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. Keyword Alignment Matrix (Matched vs Missing) */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-neutral-400" />
              Keyword Alignment Matrix
            </h3>
            <p className="text-xs text-neutral-400">
              Deterministic skill and competency matching against industry placement benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06] self-start sm:self-auto">
            <button
              onClick={() => setKeywordFilter("all")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                keywordFilter === "all"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              All ({totalKeywords})
            </button>
            <button
              onClick={() => setKeywordFilter("matched")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                keywordFilter === "matched"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Matched ({matchedKeywords.length})
            </button>
            <button
              onClick={() => setKeywordFilter("missing")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                keywordFilter === "missing"
                  ? "bg-amber-500/20 text-amber-300 font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Missing ({missingKeywords.length})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Verified / Matched Keywords */}
          {(keywordFilter === "all" || keywordFilter === "matched") && matchedKeywords.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                Verified Technical Keywords & Competencies ({matchedKeywords.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {matchedKeywords.map((k, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="break-words">{k.keyword}</span>
                    {k.category && (
                      <span className="text-[10px] text-emerald-400/60 font-mono">({k.category})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords & Skill Gaps */}
          {(keywordFilter === "all" || keywordFilter === "missing") && missingKeywords.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                Target Skill Gaps & Recommended Keywords ({missingKeywords.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {missingKeywords.map((k, i) => (
                  <div
                    key={i}
                    className="p-3 bg-black/40 border border-amber-500/20 rounded-xl space-y-1.5 h-auto min-h-[70px] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-amber-200 truncate">{k.keyword}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-300 rounded border border-amber-500/20 shrink-0">
                        {k.importance || "Required"}
                      </span>
                    </div>
                    {k.reason && (
                      <p className="text-[11px] text-neutral-400 leading-normal break-words">
                        {k.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Google XYZ Bullet Point Optimizations */}
      {evaluation.bullet_improvements?.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-4 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Google XYZ Bullet Optimizations
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Formula: Accomplished [X], as measured by [Y], by doing [Z]
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {evaluation.bullet_improvements.map((item, i) => (
              <div
                key={i}
                className="bg-black/40 border border-white/[0.07] rounded-xl p-4 sm:p-5 space-y-3.5 min-h-[120px] h-auto"
              >
                {/* Original */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block">
                    Current Formulation (Before)
                  </span>
                  <p className="text-xs text-neutral-400 italic pl-3 border-l-2 border-rose-500/40 break-words leading-relaxed">
                    "{item.original}"
                  </p>
                </div>

                {/* Optimized */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block">
                      Optimized Google XYZ (After)
                    </span>
                    <button
                      onClick={() => handleCopyBullet(item.improved_xyz, i)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1 rounded-lg transition font-mono shrink-0"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-white font-medium pl-3 border-l-2 border-emerald-400 bg-emerald-500/[0.04] p-2.5 rounded-r-lg break-words leading-relaxed">
                    {item.improved_xyz}
                  </p>
                </div>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {item.metric_added && (
                    <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                      Metric: {item.metric_added}
                    </span>
                  )}
                  {item.action_verb_used && (
                    <span className="text-[10px] font-mono bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded">
                      Verb: {item.action_verb_used}
                    </span>
                  )}
                  {item.explanation && (
                    <span className="text-[11px] text-neutral-400 break-words">
                      {item.explanation}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Formatting Flags & Structural Health Checks */}
      {evaluation.formatting_flags?.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-4 backdrop-blur-xl">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Formatting & OCR Verification Flags
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evaluation.formatting_flags.map((flag, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-black/40 border border-white/[0.06] rounded-xl space-y-1.5 h-auto"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white break-words">{flag.issue}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono uppercase rounded border shrink-0 ${
                    flag.severity === "Critical"
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      : "bg-white/[0.05] text-neutral-300 border-white/[0.08]"
                  }`}>
                    {flag.severity || "Recommendation"}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 break-words leading-relaxed">
                  {flag.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
