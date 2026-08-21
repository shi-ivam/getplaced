import React, { useState, useEffect } from "react";
import {
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function TargetCutoffCalculator({
  currentCgpa = 8.0,
  completedSemesters = 5,
  totalSemesters = 8,
  targetCgpa = 8.5,
  onTargetChange,
}) {
  const [currCgpa, setCurrCgpa] = useState(currentCgpa);
  const [completed, setCompleted] = useState(completedSemesters);
  const [total, setTotal] = useState(totalSemesters);
  const [target, setTarget] = useState(targetCgpa);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    setCurrCgpa(currentCgpa);
    setCompleted(completedSemesters);
    setTotal(totalSemesters);
    setTarget(targetCgpa);
  }, [currentCgpa, completedSemesters, totalSemesters, targetCgpa]);

  useEffect(() => {
    const remaining = total - completed;
    if (remaining <= 0) {
      setAnalysis({
        achievable: currCgpa >= target,
        requiredSgpaPerSem: 0,
        remainingSemesters: 0,
        maxPossibleCgpa: currCgpa,
        difficultyLevel: currCgpa >= target ? "Already Achieved" : "No Semesters Remaining",
        statusMessage:
          currCgpa >= target
            ? "Target already satisfied based on current record."
            : "No remaining semesters to adjust cumulative CGPA.",
      });
      return;
    }

    const required = Number(((target * total - currCgpa * completed) / remaining).toFixed(2));
    const maxPossible = Number(((currCgpa * completed + 10.0 * remaining) / total).toFixed(2));
    const isAchievable = required <= 10.0;

    let difficulty = "Moderate";
    let message = "Maintain consistent grades across remaining semesters.";

    if (!isAchievable) {
      difficulty = "Impossible";
      message = `Target ${target} is mathematically impossible. Maximum reachable CGPA with straight 10.0s is ${maxPossible}.`;
    } else if (required > 9.2) {
      difficulty = "Extreme (9.2+ SGPA Needed)";
      message = `Requires near-perfect academic performance (average ${required} SGPA) across all ${remaining} remaining semesters.`;
    } else if (required > 8.5) {
      difficulty = "Challenging (8.5 - 9.2 SGPA)";
      message = `Target is attainable with dedicated semester effort (average ${required} SGPA).`;
    } else if (required > 7.5) {
      difficulty = "Moderate (7.5 - 8.5 SGPA)";
      message = `Comfortably within reach: maintain average ${required} SGPA.`;
    } else {
      difficulty = "Comfortable (<7.5 SGPA)";
      message = `Easily attainable: maintain ${required} SGPA across remaining semesters.`;
    }

    setAnalysis({
      achievable: isAchievable,
      requiredSgpaPerSem: isAchievable ? Math.max(0, required) : null,
      remainingSemesters: remaining,
      maxPossibleCgpa: maxPossible,
      difficultyLevel: difficulty,
      statusMessage: message,
    });

    if (onTargetChange) {
      onTargetChange(target);
    }
  }, [currCgpa, completed, total, target]);

  return (
    <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Target CGPA Cutoff Calculator
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Calculate exact SGPA requirements in upcoming semesters to clear tier-1 company cutoffs
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current CGPA */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-colors">
          <label className="text-xs text-zinc-400 font-mono font-medium block mb-2">
            Current CGPA
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={currCgpa}
            onChange={(e) => setCurrCgpa(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-900 text-white text-2xl font-mono font-bold rounded-xl px-4 py-2 border border-white/10 focus:border-amber-400 focus:outline-none transition-colors"
          />
          <span className="text-[11px] text-zinc-500 font-mono mt-2 block">
            Across {completed} completed semesters
          </span>
        </div>

        {/* Semesters Completed */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-colors">
          <label className="text-xs text-zinc-400 font-mono font-medium block mb-2">
            Semesters Completed
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max={total - 1}
              value={completed}
              onChange={(e) => setCompleted(parseInt(e.target.value) || 1)}
              className="w-full bg-zinc-900 text-white text-2xl font-mono font-bold rounded-xl px-4 py-2 border border-white/10 focus:border-amber-400 focus:outline-none transition-colors"
            />
            <span className="text-zinc-400 text-base font-mono font-semibold">/ {total}</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono mt-2 block">
            {total - completed} semesters remaining
          </span>
        </div>

        {/* Target CGPA */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-amber-500/40 transition-colors">
          <label className="text-xs text-amber-400 font-mono font-medium block mb-2">
            Target CGPA Goal
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={target}
            onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-900 text-amber-400 text-2xl font-mono font-bold rounded-xl px-4 py-2 border border-amber-500/30 focus:border-amber-400 focus:outline-none transition-colors"
          />
          <span className="text-[11px] text-zinc-500 font-mono mt-2 block">
            Desired final degree aggregate
          </span>
        </div>
      </div>

      {/* Result Card */}
      {analysis && (
        <div
          className={`p-6 rounded-2xl border transition-all duration-300 ${
            analysis.achievable
              ? "bg-gradient-to-r from-emerald-950/40 via-zinc-900/90 to-zinc-950/90 border-emerald-500/30"
              : "bg-gradient-to-r from-rose-950/40 via-zinc-900/90 to-zinc-950/90 border-rose-500/30"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {analysis.achievable ? (
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
              )}

              <div>
                <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                  {analysis.achievable
                    ? `Required Average SGPA (Next ${analysis.remainingSemesters} Semesters)`
                    : "Target Attainability Matrix"}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex flex-wrap items-center gap-3 font-mono">
                  {analysis.achievable ? (
                    <>
                      <span className="text-emerald-400">
                        {analysis.requiredSgpaPerSem} SGPA
                      </span>
                      <span className="text-xs font-sans font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {analysis.difficultyLevel}
                      </span>
                    </>
                  ) : (
                    <span className="text-rose-400 text-xl sm:text-2xl">
                      Mathematically Impossible
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
              <div className="text-xs text-zinc-400 font-mono">Max Reachable CGPA</div>
              <div className="text-2xl font-mono font-bold text-zinc-200 mt-0.5">
                {analysis.maxPossibleCgpa}
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-300 mt-4 border-t border-white/10 pt-4 leading-relaxed">
            {analysis.statusMessage}
          </p>
        </div>
      )}
    </div>
  );
}

