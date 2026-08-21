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
        statusMessage: currCgpa >= target ? "Target already satisfied!" : "No remaining semesters to change CGPA.",
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
      message = `Target ${target} is mathematically impossible. Maximum reachable CGPA is ${maxPossible}.`;
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
    <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Target CGPA Cutoff Calculator</h3>
          <p className="text-xs text-gray-400">
            Calculate the exact SGPA required in upcoming semesters to hit company cutoffs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current CGPA */}
        <div className="p-4 rounded-xl bg-[#121214] border border-gray-800">
          <label className="text-xs text-gray-400 font-medium block mb-1">
            Current CGPA
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={currCgpa}
            onChange={(e) => setCurrCgpa(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#1c1c20] text-white text-xl font-bold rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            Across completed semesters
          </span>
        </div>

        {/* Semesters Completed */}
        <div className="p-4 rounded-xl bg-[#121214] border border-gray-800">
          <label className="text-xs text-gray-400 font-medium block mb-1">
            Semesters Completed
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={total - 1}
              value={completed}
              onChange={(e) => setCompleted(parseInt(e.target.value) || 1)}
              className="w-full bg-[#1c1c20] text-white text-xl font-bold rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <span className="text-gray-400 text-sm font-semibold">/ {total}</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {total - completed} remaining semesters
          </span>
        </div>

        {/* Target CGPA */}
        <div className="p-4 rounded-xl bg-[#121214] border border-gray-800">
          <label className="text-xs text-gray-400 font-medium block mb-1">
            Target CGPA Goal
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={target}
            onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#1c1c20] text-amber-400 text-xl font-bold rounded-lg px-3 py-2 border border-amber-500/40 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            Desired final degree cutoff
          </span>
        </div>
      </div>

      {/* Result Card */}
      {analysis && (
        <div
          className={`p-5 rounded-xl border transition-all ${
            analysis.achievable
              ? "bg-gradient-to-r from-emerald-950/30 to-[#18181b] border-emerald-500/30"
              : "bg-gradient-to-r from-rose-950/30 to-[#18181b] border-rose-500/30"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {analysis.achievable ? (
                <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="text-xs text-gray-400 font-medium">
                  {analysis.achievable
                    ? `Required Average SGPA (Next ${analysis.remainingSemesters} Semesters)`
                    : "Target Attainability Status"}
                </div>
                <div className="text-2xl font-extrabold text-white mt-0.5 flex items-center gap-3">
                  {analysis.achievable ? (
                    <>
                      <span className="text-emerald-400 font-mono">
                        {analysis.requiredSgpaPerSem} SGPA
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {analysis.difficultyLevel}
                      </span>
                    </>
                  ) : (
                    <span className="text-rose-400 font-semibold text-lg">
                      Mathematically Impossible
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400">Max Reachable CGPA</div>
              <div className="text-lg font-mono font-bold text-gray-200">
                {analysis.maxPossibleCgpa}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-300 mt-3 border-t border-gray-800/80 pt-3 leading-relaxed">
            {analysis.statusMessage}
          </p>
        </div>
      )}
    </div>
  );
}
