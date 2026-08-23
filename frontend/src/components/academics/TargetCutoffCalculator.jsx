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
  GraduationCap,
} from "lucide-react";
import GpCard from "@/components/gp/GpCard";
import GpBadge from "@/components/gp/GpBadge";

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
            ? "Target already satisfied based on current transcript."
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
    <GpCard
      theme="white"
      shadow="default"
      className="p-6 md:p-8 space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0431]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-center justify-center text-[#0D0431] shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <GpBadge theme="yellow" size="sm">
                Target CGPA Engine
              </GpBadge>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-[#0D0431] tracking-tight mt-0.5">
              Placement Target CGPA Cutoff Calculator
            </h3>
            <p className="text-xs text-[#0D0431]/75 font-sans mt-0.5">
              Calculate exact SGPA requirements in upcoming semesters to clear tier-1 company cutoffs
            </p>
          </div>
        </div>
      </div>

      {/* ── 3 Input Parameter Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current CGPA */}
        <div className="p-5 rounded-2xl border-2 border-[#0D0431] bg-[#FEF9CF] shadow-[3px_3px_0_0_#0D0431] space-y-2">
          <label className="text-xs text-[#0D0431] font-heading font-black uppercase tracking-wider block">
            Current Cumulative CGPA
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={currCgpa}
            onChange={(e) => setCurrCgpa(parseFloat(e.target.value) || 0)}
            className="w-full bg-white text-[#0D0431] text-3xl font-heading font-black rounded-xl px-4 py-2 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:bg-[#FEDF6A] focus:outline-none transition-all"
          />
          <span className="text-[11px] text-[#0D0431]/70 font-mono font-bold block pt-1">
            Across {completed} completed semesters
          </span>
        </div>

        {/* Semesters Completed */}
        <div className="p-5 rounded-2xl border-2 border-[#0D0431] bg-[#FEF9CF] shadow-[3px_3px_0_0_#0D0431] space-y-2">
          <label className="text-xs text-[#0D0431] font-heading font-black uppercase tracking-wider block">
            Semesters Completed
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max={total - 1}
              value={completed}
              onChange={(e) => setCompleted(parseInt(e.target.value) || 1)}
              className="w-full bg-white text-[#0D0431] text-3xl font-heading font-black rounded-xl px-4 py-2 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:bg-[#FEDF6A] focus:outline-none transition-all"
            />
            <span className="text-[#0D0431] text-xl font-heading font-black">/ {total}</span>
          </div>
          <span className="text-[11px] text-[#0D0431]/70 font-mono font-bold block pt-1">
            {total - completed} semesters remaining
          </span>
        </div>

        {/* Target CGPA */}
        <div className="p-5 rounded-2xl border-2 border-[#0D0431] bg-[#E4CDFB] shadow-[3px_3px_0_0_#0D0431] space-y-2">
          <label className="text-xs text-[#0D0431] font-heading font-black uppercase tracking-wider block">
            Target CGPA Goal
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={target}
            onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
            className="w-full bg-white text-[#0D0431] text-3xl font-heading font-black rounded-xl px-4 py-2 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:bg-[#FEDF6A] focus:outline-none transition-all"
          />
          <span className="text-[11px] text-[#0D0431]/70 font-mono font-bold block pt-1">
            Desired final degree aggregate
          </span>
        </div>
      </div>

      {/* ── Result Bento Card ── */}
      {analysis && (
        <div
          className={`p-6 rounded-2xl border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] transition-all ${
            analysis.achievable
              ? "bg-[#D4FDF7] text-[#0D0431]"
              : "bg-[#FFC5B7] text-[#0D0431]"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center shrink-0 ${
                  analysis.achievable ? "bg-[#9BFFED]" : "bg-[#F85B52] text-white"
                }`}
              >
                {analysis.achievable ? (
                  <CheckCircle2 className="w-6 h-6 text-[#0D0431]" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="text-xs text-[#0D0431] font-heading font-black uppercase tracking-wider">
                  {analysis.achievable
                    ? `Required Average SGPA (Next ${analysis.remainingSemesters} Semesters)`
                    : "Target Attainability Matrix"}
                </div>
                <div className="text-3xl sm:text-4xl font-heading font-black text-[#0D0431] mt-1 flex flex-wrap items-center gap-3">
                  {analysis.achievable ? (
                    <>
                      <span>{analysis.requiredSgpaPerSem} SGPA</span>
                      <GpBadge
                        theme={
                          analysis.difficultyLevel.startsWith("Comfortable")
                            ? "lime"
                            : analysis.difficultyLevel.startsWith("Moderate")
                            ? "yellow"
                            : "coral"
                        }
                      >
                        {analysis.difficultyLevel}
                      </GpBadge>
                    </>
                  ) : (
                    <span className="text-[#0D0431] text-2xl sm:text-3xl">
                      Mathematically Impossible
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-left md:text-right border-t-2 md:border-t-0 pt-3 md:pt-0 border-[#0D0431]/20">
              <div className="text-xs text-[#0D0431]/70 font-mono uppercase font-bold">
                Max Reachable CGPA
              </div>
              <div className="text-3xl font-heading font-black text-[#0D0431] mt-0.5">
                {analysis.maxPossibleCgpa}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#0D0431] font-medium mt-4 border-t-2 border-[#0D0431]/20 pt-3 leading-relaxed font-sans">
            {analysis.statusMessage}
          </p>
        </div>
      )}
    </GpCard>
  );
}
