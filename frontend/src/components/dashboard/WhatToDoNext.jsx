import React, { useState, useEffect } from "react";
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
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function WhatToDoNext({ userProfile, readinessScore }) {
  const [recommendations, setRecommendations] = useState([]);
  const [streakDays, setStreakDays] = useState(5);
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
          setStreakDays(res.data.streakDays || 5);
        }
      } catch (err) {
        console.warn("Could not fetch recommendations, fallback to defaults:", err.message);
        // Fallback default recommendations
        setRecommendations([
          {
            id: "rec-dsa-dp",
            category: "dsa",
            categoryLabel: "DSA & Problem Solving",
            priority: "CRITICAL",
            title: "Solve 2 Medium Dynamic Programming Problems",
            description: "Close your largest readiness gap by mastering 0/1 Knapsack & LCS patterns.",
            estimatedMinutes: 45,
            impactReadinessBoost: "+3.5%",
            actionUrl: "/app/coding",
            actionLabel: "Launch Coding Arena",
            badgeColor: "purple",
            dueToday: true,
          },
          {
            id: "rec-resume-ats",
            category: "resume",
            categoryLabel: "Resume & ATS",
            priority: "HIGH",
            title: "Optimize Resume Keywords for " + (userProfile?.targetJobRole || "SDE-1"),
            description: "Add quantifiable impact metrics to exceed 85% ATS score threshold.",
            estimatedMinutes: 20,
            impactReadinessBoost: "+4.0%",
            actionUrl: "/app/resume",
            actionLabel: "Analyze Resume",
            badgeColor: "blue",
            dueToday: false,
          },
          {
            id: "rec-academics-cutoff",
            category: "academics",
            categoryLabel: "Academic Cutoff",
            priority: "MEDIUM",
            title: "Check " + (userProfile?.targetCompany || "Target") + " Academic Eligibility Cutoff",
            description: "Calculate required SGPA in remaining semesters to stay 100% eligible.",
            estimatedMinutes: 15,
            impactReadinessBoost: "+2.0%",
            actionUrl: "/app/academics",
            actionLabel: "Open Calculator",
            badgeColor: "amber",
            dueToday: false,
          },
        ]);
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

  return (
    <div className="bg-[#18181b] border border-gray-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                What Should I Do Next?
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-normal border border-purple-500/30">
                  AI Prioritized
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                High-impact daily actions tuned to your target company gaps
              </p>
            </div>
          </div>
        </div>

        {/* Daily Streak & Velocity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#222] border border-gray-800 text-xs text-gray-300">
            <span className="text-amber-400 font-bold font-mono">{streakDays} Day Streak</span>
          </div>
          <Link
            to="/app/roadmap"
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Full Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Daily Progress Tracker */}
      <div className="mb-6 p-4 rounded-xl bg-[#121214] border border-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs text-gray-400 font-medium">Daily Goal Progress</div>
          <div className="text-sm font-semibold text-white mt-0.5">
            {completedCount} of {totalCount} tasks completed today
          </div>
        </div>
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-purple-400">{progressPct}%</span>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3 relative z-10">
        {recommendations.map((item) => {
          const isDone = completedTaskIds.has(item.id);
          const IconComp = CATEGORY_ICONS[item.category] || Target;
          const colorClass = CATEGORY_COLORS[item.badgeColor] || CATEGORY_COLORS.purple;

          return (
            <div
              key={item.id}
              className={`group p-4 rounded-xl border transition-all duration-200 ${
                isDone
                  ? "bg-[#141416]/50 border-gray-800/40 opacity-60"
                  : "bg-[#1e1e24]/70 hover:bg-[#23232b] border-gray-800/80 hover:border-purple-500/40"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Completion Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(item.id)}
                  className="mt-0.5 text-gray-500 hover:text-purple-400 transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${colorClass}`}>
                      {item.categoryLabel}
                    </span>

                    {item.priority === "CRITICAL" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        HIGH PRIORITY
                      </span>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{item.estimatedMinutes} mins</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3" />
                      <span>{item.impactReadinessBoost}</span>
                    </div>
                  </div>

                  <h3
                    className={`text-sm font-semibold transition-colors ${
                      isDone ? "text-gray-400 line-through" : "text-white group-hover:text-purple-300"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      to={item.actionUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                    >
                      {item.actionLabel || "Start Task"}
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
