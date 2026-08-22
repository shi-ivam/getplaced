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
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-7 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <History className="w-4 h-4 text-neutral-400" />
              Version History & Score Trajectory
            </h2>
            <p className="text-xs text-neutral-400">
              Review previous versions and track ATS improvements over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {overallImprovement !== 0 && (
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {overallImprovement > 0 ? `+${overallImprovement}` : overallImprovement} pts since first version
                </span>
              </div>
            )}

            {versions.length >= 2 && (
              <button
                onClick={() => handleOpenDiff(versions[1], versions[0])}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black font-semibold rounded-xl text-xs shadow-sm hover:bg-neutral-200 transition"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Compare Latest vs Prior
              </button>
            )}
          </div>
        </div>

        {/* Versions Timeline List */}
        <div className="space-y-3">
          {versions.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              No version history snapshots available yet.
            </div>
          ) : (
            versions.map((ver, idx) => {
              const isLatest = idx === 0;
              return (
                <div
                  key={ver.id || idx}
                  className={`bg-black/30 border p-4 sm:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                    isLatest
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : "border-white/[0.06] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Score Dial Tag */}
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center shrink-0">
                      <span className="text-base font-bold text-white font-mono leading-none">
                        {ver.atsScore}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase mt-0.5">ATS</span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {ver.name}
                        </h4>
                        {isLatest && (
                          <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                            Active Version
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded border ${
                          ver.atsScore >= 80
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-white/[0.04] text-neutral-300 border-white/[0.08]"
                        }`}>
                          {ver.tier || "Evaluated"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
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
                        onClick={() => onSelectVersion(ver.fullEvaluation)}
                        className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-200 rounded-lg text-xs font-medium transition"
                      >
                        Inspect
                      </button>
                    )}

                    {!isLatest && (
                      <>
                        <button
                          onClick={() => handleOpenDiff(ver, versions[0])}
                          className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white rounded-lg text-xs font-medium transition"
                        >
                          Diff vs Current
                        </button>
                        <button
                          onClick={() => onRevertVersion(ver)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Version Diffing Modal */}
      {compareModalOpen && versionA && versionB && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0d14] border border-white/[0.12] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-400" />
                Score Trajectory & Category Diff
              </h3>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Comparison Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Baseline Version</span>
                <h4 className="text-xs font-semibold text-white truncate">{versionA.name}</h4>
                <div className="text-2xl font-bold font-mono text-neutral-300">{versionA.atsScore}</div>
              </div>

              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Comparison Version</span>
                <h4 className="text-xs font-semibold text-white truncate">{versionB.name}</h4>
                <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-2">
                  {versionB.atsScore}
                  <span className={`text-[11px] font-sans px-2 py-0.5 rounded-full ${
                    versionB.atsScore >= versionA.atsScore
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                  }`}>
                    {versionB.atsScore >= versionA.atsScore ? "+" : ""}
                    {versionB.atsScore - versionA.atsScore} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Category Score Diffs */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
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
                      className="flex items-center justify-between text-xs py-2 border-b border-white/[0.04]"
                    >
                      <span className="text-neutral-400">{label}</span>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-neutral-400">
                          {valA}% → <strong className="text-white">{valB}%</strong>
                        </span>
                        <span
                          className={`font-semibold ${
                            diff >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {diff >= 0 ? `+${diff}%` : `${diff}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-white rounded-xl text-xs font-medium transition"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
