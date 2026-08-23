import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  Clock,
  TrendingUp,
  Code2,
  FileText,
  FolderGit2,
  GraduationCap,
  BrainCog,
  PlayCircle,
  Target,
  Zap,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import { getWhatToDoNextCopy } from "@/utils/dynamicCopy";

const CATEGORY_ICONS = {
  dsa: Code2,
  resume: FileText,
  projects: FolderGit2,
  academics: GraduationCap,
  interview: BrainCog,
  study: PlayCircle,
  roadmap: Target,
};

const CATEGORY_COLORS = {
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  blue: "bg-zinc-800 text-zinc-300 border-zinc-700",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  indigo: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  cyan: "bg-zinc-800 text-zinc-300 border-zinc-700",
};

export default function WhatToDoNext({ userProfile, readinessScore }) {
  const [recommendations, setRecommendations] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`${NODE_API_URL}/api/recommendations/next-actions`, {
          withCredentials: true,
        });
        if (res.data) {
          setRecommendations(res.data.recommendations || []);
          setStreakDays(res.data.streakDays || 0);
        }
      } catch (err) {
        console.warn("Could not fetch recommendations:", err.message);
        setRecommendations([]);
        setStreakDays(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userProfile]);

  const handleToggleComplete = async (taskId) => {
    const nextSet = new Set(completedTaskIds);
    if (nextSet.has(taskId)) {
      nextSet.delete(taskId);
    } else {
      nextSet.add(taskId);
      try {
        await axios.post(
          `${NODE_API_URL}/api/recommendations/complete-task`,
          { taskId },
          { withCredentials: true }
        );
      } catch (err) {
        console.warn("Could not log completed task on backend:", err.message);
      }
    }
    setCompletedTaskIds(nextSet);
  };

  const completedCount = completedTaskIds.size;
  const totalCount = recommendations.length || 3;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const dynamicCopy = useMemo(() => {
    return getWhatToDoNextCopy({
      readinessScore,
      streakDays,
      tasksCompleted: completedCount,
      totalTasks: totalCount,
      targetCompany: userProfile?.targetCompany,
    });
  }, [readinessScore, streakDays, completedCount, totalCount, userProfile]);

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {dynamicCopy.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {dynamicCopy.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Streak & Velocity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <span className="text-amber-400 font-semibold">{dynamicCopy.streakNote}</span>
          </div>
          <Link
            to="/app/roadmap"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-mono transition-colors"
          >
            <span>Roadmap</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Daily Progress Tracker */}
      <div className="mb-6 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-zinc-400 font-mono">Daily Progress</div>
          <div className="text-xs font-medium text-zinc-200 mt-0.5">
            {dynamicCopy.progressSummary}
          </div>
        </div>
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="flex-1 bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-mono text-purple-400">{progressPct}%</span>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {recommendations.map((item) => {
          const isDone = completedTaskIds.has(item.id);
          const IconComp = CATEGORY_ICONS[item.category] || Target;
          const colorClass = CATEGORY_COLORS[item.badgeColor] || CATEGORY_COLORS.purple;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isDone
                  ? "bg-zinc-950/40 border-zinc-800/40 opacity-60"
                  : "bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Completion Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(item.id)}
                  className="mt-0.5 text-zinc-500 hover:text-purple-400 transition-colors shrink-0 cursor-pointer"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${colorClass}`}>
                      {item.categoryLabel}
                    </span>

                    {item.priority === "CRITICAL" && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Priority
                      </span>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono ml-auto">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{item.estimatedMinutes} mins</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3" />
                      <span>{item.impactReadinessBoost}</span>
                    </div>
                  </div>

                  <h3
                    className={`text-xs font-semibold transition-colors ${
                      isDone ? "text-zinc-500 line-through" : "text-zinc-100"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      to={item.actionUrl}
                      className="inline-flex items-center gap-1 text-xs font-mono text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                    >
                      <span>{item.actionLabel || "Start Task"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
