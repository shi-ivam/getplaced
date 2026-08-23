import React, { useState } from "react";
import {
  History,
  TrendingUp,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Calendar,
  ChevronRight,
  X
} from "lucide-react";
import CaideBadge from "@/components/caide/CaideBadge";
import CaideCard from "@/components/caide/CaideCard";
import CaideButton from "@/components/caide/CaideButton";

export default function ResumeVersionHistory({
  versions = [],
  onSelectVersion,
  onRevertVersion,
  currentEvaluation
}) {
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [versionA, setVersionA] = useState(null);
  const [versionB, setVersionB] = useState(null);

  const handleOpenDiff = (verA, verB) => {
    setVersionA(verA);
    setVersionB(verB);
    setCompareModalOpen(true);
  };

  const baselineVersion = versions.length > 0 ? versions[versions.length - 1] : null;
  const latestVersion = versions.length > 0 ? versions[0] : null;
  const overallImprovement = latestVersion && baselineVersion ? latestVersion.atsScore - baselineVersion.atsScore : 0;

  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <CaideCard theme="white" shadow="lg" rounded="3xl" className="p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0D0431] pb-5">
          <div className="space-y-1">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-[#0D0431] flex items-center gap-2">
              <History className="w-4 h-4 text-[#896EE2]" />
              Version History & Score Trajectory
            </h2>
            <p className="text-xs text-[#0D0431]/70 font-sans font-medium">
              Review previous versions and track ATS improvements over time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {overallImprovement !== 0 && (
              <div className="px-3.5 py-1.5 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-full flex items-center gap-1.5 text-xs text-[#0D0431] font-heading font-bold shadow-[2px_2px_0_0_#0D0431]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {overallImprovement > 0 ? `+${overallImprovement}` : overallImprovement} pts since baseline
                </span>
              </div>
            )}

            {versions.length >= 2 && (
              <CaideButton
                onClick={() => handleOpenDiff(versions[1], versions[0])}
                variant="stacked-yellow"
                size="sm"
              >
                Compare Latest vs Prior
              </CaideButton>
            )}
          </div>
        </div>

        {/* Versions Timeline List */}
        <div className="space-y-3.5">
          {versions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#0D0431]/60 font-medium">
              No version history snapshots available yet.
            </div>
          ) : (
            versions.map((ver, idx) => {
              const isLatest = idx === 0;
              return (
                <div
                  key={ver.id || idx}
                  className={`border-2 border-[#0D0431] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-[3px_3px_0_0_#0D0431] ${
                    isLatest
                      ? "bg-[#D4FDF7]"
                      : "bg-white hover:bg-[#FEF9CF]/40"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Score Dial Tag */}
                    <div className="w-14 h-14 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0_0_#0D0431]">
                      <span className="text-xl font-heading font-black text-[#0D0431] leading-none">
                        {ver.atsScore}
                      </span>
                      <span className="text-[9px] font-heading font-bold text-[#0D0431]/60 uppercase mt-0.5">ATS</span>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-heading font-bold text-[#0D0431] truncate">
                          {ver.name}
                        </h4>
                        {isLatest && (
                          <CaideBadge theme="mint" size="sm">
                            Active Version
                          </CaideBadge>
                        )}
                        <span className={`px-2.5 py-0.5 text-[9px] font-heading font-bold uppercase rounded-full border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] ${
                          ver.atsScore >= 80
                            ? "bg-[#E4CDFB] text-[#0D0431]"
                            : "bg-[#FEDF6A] text-[#0D0431]"
                        }`}>
                          {ver.tier || "Evaluated"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#0D0431]/70 font-mono font-medium">
                        <span>Role: {ver.targetRole}</span>
                        <span>•</span>
                        <span>{new Date(ver.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {ver.fullEvaluation && (
                      <button
                        type="button"
                        onClick={() => onSelectVersion(ver.fullEvaluation)}
                        className="px-3.5 py-1.5 bg-white hover:bg-[#FEF9CF] border-2 border-[#0D0431] text-[#0D0431] rounded-xl text-xs font-heading font-bold transition shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
                      >
                        Inspect
                      </button>
                    )}

                    {!isLatest && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenDiff(ver, versions[0])}
                          className="px-3.5 py-1.5 bg-[#FEDF6A] hover:bg-[#FFE995] border-2 border-[#0D0431] text-[#0D0431] rounded-xl text-xs font-heading font-bold transition shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
                        >
                          Diff vs Current
                        </button>
                        <button
                          type="button"
                          onClick={() => onRevertVersion(ver)}
                          className="flex items-center gap-1 px-3.5 py-1.5 bg-[#FFC5B7] hover:bg-[#F85B52] hover:text-white border-2 border-[#0D0431] text-[#0D0431] rounded-xl text-xs font-heading font-bold transition shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CaideCard>

      {/* Version Diffing Modal */}
      {compareModalOpen && versionA && versionB && (
        <div className="fixed inset-0 bg-[#0D0431]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#0D0431] rounded-3xl max-w-xl w-full shadow-[8px_8px_0_0_#0D0431] overflow-hidden text-[#0D0431] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#FEF9CF] border-b-2 border-[#0D0431] flex items-center justify-between">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#0D0431] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#896EE2]" />
                Score Trajectory & Category Diff
              </h3>
              <button
                type="button"
                onClick={() => setCompareModalOpen(false)}
                className="p-1.5 rounded-full border-2 border-[#0D0431] bg-white hover:bg-[#FFC5B7] text-[#0D0431] transition-all shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Score Comparison Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FEF9CF] p-4 rounded-2xl border-2 border-[#0D0431] space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] font-heading font-bold uppercase text-[#0D0431]/70 block">Baseline Version</span>
                  <h4 className="text-xs font-heading font-bold text-[#0D0431] truncate">{versionA.name}</h4>
                  <div className="text-3xl font-heading font-black text-[#0D0431]">{versionA.atsScore}</div>
                </div>

                <div className="bg-[#D4FDF7] p-4 rounded-2xl border-2 border-[#0D0431] space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] font-heading font-bold uppercase text-[#0D0431]/70 block">Comparison Version</span>
                  <h4 className="text-xs font-heading font-bold text-[#0D0431] truncate">{versionB.name}</h4>
                  <div className="text-3xl font-heading font-black text-[#0D0431] flex items-center gap-2">
                    {versionB.atsScore}
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-[#0D0431] ${
                      versionB.atsScore >= versionA.atsScore
                        ? "bg-[#FEDF6A] text-[#0D0431]"
                        : "bg-[#FFC5B7] text-[#0D0431]"
                    }`}>
                      {versionB.atsScore >= versionA.atsScore ? "+" : ""}
                      {versionB.atsScore - versionA.atsScore} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Score Diffs */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#0D0431]/70 block">
                  Category Score Breakdown Deltas:
                </span>
                {versionB.categoryScores &&
                  Object.keys(versionB.categoryScores).map((key) => {
                    const valA = versionA.categoryScores?.[key] || 0;
                    const valB = versionB.categoryScores?.[key] || 0;
                    const diff = valB - valA;
                    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between text-xs py-2.5 border-b border-[#0D0431]/20 font-sans"
                      >
                        <span className="text-[#0D0431] font-semibold">{label}</span>
                        <div className="flex items-center gap-3 font-mono text-xs font-bold">
                          <span className="text-[#0D0431]/70">
                            {valA}% → <strong className="text-[#0D0431]">{valB}%</strong>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full border border-[#0D0431] ${
                              diff >= 0 ? "bg-[#D4FDF7] text-[#0D0431]" : "bg-[#FFC5B7] text-[#0D0431]"
                            }`}
                          >
                            {diff >= 0 ? `+${diff}%` : `${diff}%`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-3 border-t-2 border-[#0D0431] flex justify-end">
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#FEF9CF] border-2 border-[#0D0431] text-[#0D0431] rounded-xl text-xs font-heading font-bold shadow-[2px_2px_0_0_#0D0431] transition cursor-pointer"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
