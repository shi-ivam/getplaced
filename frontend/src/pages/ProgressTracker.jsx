import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  Flame,
  Code2,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { NODE_API_URL } from "@/config/api";

export default function ProgressTracker() {
  const [progressData, setProgressData] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeDimension, setActiveDimension] = useState("overallScore");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(`${NODE_API_URL}/api/progress/analytics`, {
          withCredentials: true,
        });
        if (res.data) {
          setProgressData(res.data);
        }
      } catch (err) {
        console.warn("Could not load progress data from backend, using defaults:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const snapshots = progressData?.snapshots || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Progress Tracking & Velocity</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Placement readiness velocity, multi-dimensional skill trend graphs, and habit analytics
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Pace Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 text-xs">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 font-semibold">
            Placement Readiness Velocity: +{progressData?.weeklyVelocityPct || 4.8}% / week
          </span>
        </div>
      </div>

      {/* Velocity & Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Velocity */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Readiness Velocity</span>
            <span className="text-emerald-400 font-semibold">+4.8% 7d</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            +{progressData?.weeklyVelocityPct || 4.8}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Projected ready in ~{progressData?.projectedWeeksToPlacementReady || 3} weeks
          </div>
        </div>

        {/* Practice Streak */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Current Streak</span>
            <span className="text-amber-400 font-semibold">Longest: {progressData?.longestStreak || 12}d</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono flex items-center gap-1">
            <Flame className="w-7 h-7 fill-amber-400/20" />
            {progressData?.dailyStreak || 5} Days
          </div>
          <div className="text-xs text-gray-400 mt-1">Daily consistency multiplier active</div>
        </div>

        {/* Problems Solved */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Problems Solved</span>
            <span className="text-purple-400 font-semibold">DSA Mastery</span>
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono flex items-center gap-1">
            <Code2 className="w-7 h-7" />
            {progressData?.totalProblemsSolved || 98}
          </div>
          <div className="text-xs text-gray-400 mt-1">Synced across LeetCode & Arena</div>
        </div>

        {/* Total Study Hours */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Study Hours Logged</span>
            <span className="text-blue-400 font-semibold">Video & Sprints</span>
          </div>
          <div className="text-3xl font-extrabold text-blue-400 font-mono flex items-center gap-1">
            <Clock className="w-7 h-7" />
            {progressData?.totalStudyHours || 7.5}h
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {progressData?.totalTasksCompleted || 22} roadmap tasks completed
          </div>
        </div>
      </div>

      {/* Historical Trend Graphs */}
      <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Skill Progress & Readiness Timeline</h3>
            <p className="text-xs text-gray-400">
              Track multi-dimensional growth across DSA, Projects, ATS Resume, and Academics over time
            </p>
          </div>

          {/* Time Range Tabs */}
          <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-gray-800">
            {["7d", "30d", "90d", "all"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase transition-all ${
                  timeRange === t
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension Toggles */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "overallScore", label: "Overall Readiness", color: "#a855f7" },
            { key: "dsaScore", label: "DSA Proficiency", color: "#3b82f6" },
            { key: "projectScore", label: "Projects & GitHub", color: "#10b981" },
            { key: "resumeScore", label: "ATS Resume", color: "#f59e0b" },
            { key: "interviewScore", label: "Mock Interviews", color: "#ec4899" },
          ].map((dim) => (
            <button
              key={dim.key}
              type="button"
              onClick={() => setActiveDimension(dim.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeDimension === dim.key
                  ? "bg-purple-500/20 text-white border-purple-500"
                  : "bg-[#121214] text-gray-400 border-gray-800 hover:text-white"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: dim.color }}
              />
              {dim.label}
            </button>
          ))}
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snapshots}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} domain={[30, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#3f3f46",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey={activeDimension}
                stroke="#a855f7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Recent Placement Activities</h3>
        <div className="space-y-3">
          {(progressData?.activityLog || []).map((act, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#121214] border border-gray-800/80 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{act.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(act.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +{act.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
