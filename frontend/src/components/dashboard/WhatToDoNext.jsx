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
  Check,
  Flame,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import CaideBadge from "@/components/caide/CaideBadge";

const CATEGORY_ICONS = {
  dsa: Code2,
  resume: FileText,
  projects: FolderGit2,
  academics: GraduationCap,
  interview: BrainCog,
  study: PlayCircle,
  roadmap: Target,
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
        console.warn("Could not record task completion:", err);
      }
    }
    setCompletedTaskIds(nextSet);
  };

  const tasksToDisplay =
    recommendations.length > 0
      ? recommendations
      : [
          {
            id: "task-1",
            title: "Solve 2 Binary Search / Graph Problems",
            category: "dsa",
            badgeLabel: "High Impact",
            description: "Target Microsoft Tier-1 benchmark (currently 78% of requirement).",
            estimatedTime: "25 mins",
            actionUrl: "/app/coding",
            actionLabel: "Start Solving",
          },
          {
            id: "task-2",
            title: "Optimize 3 Action Bullets on Resume",
            category: "resume",
            badgeLabel: "ATS Boost",
            description: "Apply XYZ formula to boost ATS score to 85+.",
            estimatedTime: "10 mins",
            actionUrl: "/app/resume",
            actionLabel: "Audit Resume",
          },
          {
            id: "task-3",
            title: "Review Super Dream Cutoffs",
            category: "academics",
            badgeLabel: "Academics",
            description: "Verify standing cutoffs for 35+ Tier-1 companies.",
            estimatedTime: "5 mins",
            actionUrl: "/app/academics",
            actionLabel: "Check Cutoffs",
          },
        ];

  return (
    <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DEEC]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#FFD84D]" />
          <h3 className="text-sm font-bold text-[#17103D]">
            Today's High-Yield Next Actions
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6F6A80]">
          <span className="flex items-center gap-1 font-bold text-[#9E6700] bg-[#FEF6D6] px-2.5 py-0.5 rounded-full border border-[#FFE995]">
            <Flame className="w-3.5 h-3.5 text-[#FFD84D] fill-[#FFD84D]" />
            <span>{streakDays || 4} Day Prep Streak</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasksToDisplay.map((task) => {
          const Icon = CATEGORY_ICONS[task.category] || Target;
          const isDone = completedTaskIds.has(task.id);

          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isDone
                  ? "bg-[#F8F8F5]/60 border-[#E2DEEC] opacity-75"
                  : "bg-white border-[#E2DEEC] hover:border-[#C8C3D8] shadow-sm hover:shadow-md"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <CaideBadge theme="light-purple" size="sm">
                    {task.badgeLabel || "Next Step"}
                  </CaideBadge>
                  <span className="text-[11px] text-[#6F6A80] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.estimatedTime || "15 mins"}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="mt-0.5 shrink-0 text-[#6F6A80] hover:text-[#17103D] cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0D7A68] fill-[#D8FAF4]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#E2DEEC] hover:text-[#6E44FF]" />
                    )}
                  </button>
                  <div className="space-y-1 min-w-0">
                    <h4
                      className={`text-xs font-bold ${
                        isDone ? "line-through text-[#6F6A80]" : "text-[#17103D]"
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-[#6F6A80] leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2DEEC] flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6F6A80]">
                  Priority Action
                </span>

                <Link
                  to={task.actionUrl || "/app/coding"}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#6E44FF] hover:underline"
                >
                  <span>{task.actionLabel || "Start"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
