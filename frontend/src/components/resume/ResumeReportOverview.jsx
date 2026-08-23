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
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import jsPDF from "jspdf";
import GpBadge from "@/components/gp/GpBadge";

export default function ResumeReportOverview({
  evaluation,
  targetRole = "Software Engineer",
  jobDescription = "",
  onNavigateToActionCenter,
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [keywordFilter, setKeywordFilter] = useState("all");

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
    doc.setFontSize(18);
    doc.setTextColor(23, 16, 61);
    doc.text("GetPlaced ATS Placement Report", marginLeft, yPos);
    yPos += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(111, 106, 128);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | Target: ${targetRole || "Software Engineer"}`,
      marginLeft,
      yPos
    );
    yPos += 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(23, 16, 61);
    const scoreVal = evaluation.ats_score ?? evaluation.atsScore ?? 0;
    doc.text(
      `ATS Score: ${scoreVal}/100 (${evaluation.score_tier || evaluation.scoreTier || "Competitive"})`,
      marginLeft,
      yPos
    );
    yPos += 30;

    doc.save(`GetPlaced-ATS-Report-${targetRole.replace(/\s+/g, "_")}.pdf`);
  };

  const score = typeof evaluation.ats_score === "number"
    ? evaluation.ats_score
    : typeof evaluation.atsScore === "number"
    ? evaluation.atsScore
    : Number(evaluation.ats_score ?? evaluation.atsScore) || 0;
  const matchedKeywords = Array.isArray(evaluation.matched_keywords) ? evaluation.matched_keywords : [];
  const missingKeywords = Array.isArray(evaluation.missing_keywords) ? evaluation.missing_keywords : [];

  const getKeywordLabel = (kw) => {
    return typeof kw === "string" ? kw : kw?.keyword || "";
  };

  const getKeywordMeta = (kw) => {
    if (kw && typeof kw === "object") {
      return kw.category || kw.importance || null;
    }
    return null;
  };

  const getKeywordReason = (kw) => {
    if (kw && typeof kw === "object") {
      return kw.reason || null;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top ATS Score Summary Banner */}
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 shadow-[0_2px_8px_rgba(23,16,61,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Radial Score Gauge */}
          <div className="relative w-20 h-20 rounded-2xl bg-[#17103D] text-[#FFD84D] flex flex-col items-center justify-center font-black shadow-sm shrink-0">
            <span className="text-2xl leading-none">{score}</span>
            <span className="text-[10px] text-white/70 font-normal">/ 100</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-[#17103D]">
                ATS Score: {score >= 80 ? "Strong Placement Ready" : score >= 60 ? "Competitive" : "Needs Optimization"}
              </h3>
              <GpBadge theme={score >= 80 ? "mint" : score >= 60 ? "yellow" : "coral"} size="sm">
                {evaluation.score_tier || "Scored"}
              </GpBadge>
            </div>
            <p className="text-xs text-[#6F6A80] max-w-xl leading-relaxed">
              {typeof evaluation.summary_critique === "string"
                ? evaluation.summary_critique
                : typeof evaluation.summary === "string"
                ? evaluation.summary
                : "Your resume has been audited against top company applicant tracking systems."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2DEEC] bg-white hover:bg-[#F2F0FA] text-xs font-semibold text-[#17103D] transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6F6A80]" />
            <span>Download Report</span>
          </button>

          {onNavigateToActionCenter && (
            <button
              onClick={onNavigateToActionCenter}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#FFD84D]" />
              <span>Apply Fixes</span>
            </button>
          )}
        </div>
      </div>

      {/* 4/5 Category Pillar Scores */}
      {evaluation.category_scores && typeof evaluation.category_scores === "object" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(evaluation.category_scores).map(([catKey, catVal]) => {
            const label = catKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            const numVal = typeof catVal === "object" && catVal !== null
              ? Number(catVal.score || catVal.value || 0)
              : Number(catVal) || 0;

            return (
              <div
                key={catKey}
                className="bg-white border border-[#E2DEEC] rounded-2xl p-4 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#6F6A80] truncate">{label}</span>
                  <span className="font-mono font-bold text-[#17103D]">{numVal}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#F2F0FA] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      numVal >= 80 ? "bg-[#0D7A68]" : numVal >= 60 ? "bg-[#FFD84D]" : "bg-[#C7382B]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, numVal))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Keywords Match & Missing Chips */}
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2DEEC]">
          <div>
            <h4 className="text-sm font-bold text-[#17103D]">
              Keyword & Skill Alignment ({targetRole})
            </h4>
            <p className="text-xs text-[#6F6A80]">
              Identified from industry benchmarks and applicant screening algorithms{jobDescription ? " based on provided JD" : ""}.
            </p>
          </div>

          <div className="inline-flex items-center p-0.5 bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl text-[11px] font-semibold">
            <button
              onClick={() => setKeywordFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                keywordFilter === "all" ? "bg-white text-[#17103D] shadow-sm font-bold" : "text-[#6F6A80]"
              }`}
            >
              All ({matchedKeywords.length + missingKeywords.length})
            </button>
            <button
              onClick={() => setKeywordFilter("matched")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                keywordFilter === "matched" ? "bg-white text-[#0D7A68] shadow-sm font-bold" : "text-[#6F6A80]"
              }`}
            >
              Matched ({matchedKeywords.length})
            </button>
            <button
              onClick={() => setKeywordFilter("missing")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                keywordFilter === "missing" ? "bg-white text-[#C7382B] shadow-sm font-bold" : "text-[#6F6A80]"
              }`}
            >
              Missing ({missingKeywords.length})
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(keywordFilter === "all" || keywordFilter === "matched") &&
            matchedKeywords.map((kw, i) => {
              const label = getKeywordLabel(kw);
              const meta = getKeywordMeta(kw);
              if (!label) return null;
              return (
                <span
                  key={`matched-${i}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#D8FAF4] border border-[#B7F4E8] text-xs font-semibold text-[#0D7A68]"
                >
                  <Check className="w-3 h-3 shrink-0" />
                  <span>{label}</span>
                  {meta && <span className="text-[10px] text-[#0D7A68]/70 font-medium ml-0.5">({meta})</span>}
                </span>
              );
            })}

          {(keywordFilter === "all" || keywordFilter === "missing") &&
            missingKeywords.map((kw, i) => {
              const label = getKeywordLabel(kw);
              const meta = getKeywordMeta(kw);
              const reason = getKeywordReason(kw);
              if (!label) return null;
              return (
                <span
                  key={`missing-${i}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFE8E5] border border-[#FFC5B7] text-xs font-semibold text-[#C7382B]"
                  title={reason || undefined}
                >
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{label}</span>
                  {meta && <span className="text-[10px] text-[#C7382B]/75 font-medium ml-0.5">({meta})</span>}
                </span>
              );
            })}
        </div>
      </div>

      {/* Suggested Bullet Point Improvements */}
      {Array.isArray(evaluation.bullet_improvements) && evaluation.bullet_improvements.length > 0 && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2DEEC]">
            <Sparkles className="w-4 h-4 text-[#6E44FF]" />
            <h4 className="text-sm font-bold text-[#17103D]">
              High-Impact Bullet Point Rewrites
            </h4>
          </div>

          <div className="space-y-3">
            {evaluation.bullet_improvements.map((item, idx) => {
              const original = typeof item === "object" && item !== null ? item.original : "";
              const improved =
                typeof item === "object" && item !== null
                  ? item.improved_xyz || item.improved || ""
                  : String(item || "");
              const reason =
                typeof item === "object" && item !== null
                  ? item.explanation || item.reason || ""
                  : "";
              const metricAdded = typeof item === "object" && item !== null ? item.metric_added : null;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-2.5"
                >
                  {original && (
                    <div className="text-xs text-[#6F6A80] line-through">
                      {original}
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs font-semibold text-[#17103D] leading-relaxed">
                      {improved || original}
                    </div>
                    {improved && (
                      <button
                        onClick={() => handleCopyBullet(improved, idx)}
                        className="p-1.5 rounded-lg border border-[#E2DEEC] bg-white hover:bg-[#F2F0FA] text-[#17103D] text-xs font-medium flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                        title="Copy optimized bullet"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-[#0D7A68]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>

                  {(reason || metricAdded) && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      {reason && (
                        <div className="text-[#0D7A68] font-medium flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      )}
                      {metricAdded && (
                        <span className="px-2 py-0.5 rounded-md bg-[#D8FAF4] text-[#0D7A68] font-semibold text-[10px]">
                          Metric: {metricAdded}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Strengths & Areas for Improvement */}
      {((Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0) ||
        (Array.isArray(evaluation.weaknesses) && evaluation.weaknesses.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(evaluation.strengths) && evaluation.strengths.length > 0 && (
            <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E2DEEC]">
                <CheckCircle2 className="w-4 h-4 text-[#0D7A68]" />
                <h4 className="text-sm font-bold text-[#17103D]">Key Strengths</h4>
              </div>
              <ul className="space-y-2">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-[#17103D] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A68] mt-1.5 shrink-0" />
                    <span>{typeof str === "string" ? str : str?.text || JSON.stringify(str)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(evaluation.weaknesses) && evaluation.weaknesses.length > 0 && (
            <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E2DEEC]">
                <AlertTriangle className="w-4 h-4 text-[#C7382B]" />
                <h4 className="text-sm font-bold text-[#17103D]">Areas for Improvement</h4>
              </div>
              <ul className="space-y-2">
                {evaluation.weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-xs text-[#6F6A80] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C7382B] mt-1.5 shrink-0" />
                    <span>{typeof weak === "string" ? weak : weak?.text || JSON.stringify(weak)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Formatting & Parsing Audit */}
      {Array.isArray(evaluation.formatting_flags) && evaluation.formatting_flags.length > 0 && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2DEEC]">
            <ShieldCheck className="w-4 h-4 text-[#6E44FF]" />
            <h4 className="text-sm font-bold text-[#17103D]">ATS Formatting & Parsing Audit</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evaluation.formatting_flags.map((flag, idx) => {
              const issue = typeof flag === "object" && flag !== null ? flag.issue : String(flag);
              const fix = typeof flag === "object" && flag !== null ? flag.fix : null;
              const severity = typeof flag === "object" && flag !== null ? flag.severity : "Notice";
              return (
                <div key={idx} className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#17103D]">{issue}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF9CF] text-[#17103D] border border-[#E2DEEC]">
                      {severity}
                    </span>
                  </div>
                  {fix && <p className="text-[11px] text-[#6F6A80]">{fix}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
