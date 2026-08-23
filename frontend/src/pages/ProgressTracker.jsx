import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
  Plus,
  Activity,
  Award,
  Target,
  X,
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
import { getProgressTrackerMentorCopy } from "@/utils/dynamicCopy";

const DIMENSIONS = [
  { key: "overallScore", label: "Overall Readiness", color: "#a855f7" },
  { key: "dsaScore", label: "DSA Proficiency", color: "#e4e4e7" },
  { key: "projectScore", label: "Projects & GitHub", color: "#10b981" },
  { key: "resumeScore", label: "ATS Resume", color: "#f59e0b" },
  { key: "interviewScore", label: "Mock Interviews", color: "#c084fc" },
];

export default function ProgressTracker() {
  const containerRef = useRef(null);
  const [progressData, setProgressData] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeDimension, setActiveDimension] = useState("overallScore");
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityType, setActivityType] = useState("dsa_solved");
  const [activityMinutes, setActivityMinutes] = useState(45);
  const [activityXp, setActivityXp] = useState(25);
  const [loggingInProgress, setLoggingInProgress] = useState(false);

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

  useEffect(() => {
    fetchProgress();
  }, []);

  useGSAP(
    () => {
      if (!loading) {
        gsap.fromTo(
          ".gsap-fade-item",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: containerRef, dependencies: [loading] }
  );

  const handleLogActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    setLoggingInProgress(true);
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/progress/log-activity`,
        {
          type: activityType,
          title: activityTitle,
          xp: Number(activityXp) || 20,
          studyMinutes: Number(activityMinutes) || 30,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setShowLogModal(false);
        setActivityTitle("");
        fetchProgress();
      }
    } catch (err) {
      console.error("Could not log activity:", err);
    } finally {
      setLoggingInProgress(false);
    }
  };

  const snapshots = progressData?.snapshots || [];
  const selectedDim = DIMENSIONS.find((d) => d.key === activeDimension) || DIMENSIONS[0];

  const trackerMentor = getProgressTrackerMentorCopy({
    overallScore: progressData?.overallScore,
    velocity: progressData?.weeklyVelocityPct ? `+${progressData.weeklyVelocityPct}%/week` : "+4%/week",
  });

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-white">
      <div ref={containerRef} className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        {/* Editorial Wide Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {trackerMentor.heading}
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
              {trackerMentor.subtitle} {trackerMentor.velocityInsight}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 shadow-lg hover:shadow-purple-500/10 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-zinc-900" /> Log Practice Sprint
            </button>
          </div>
        </header>

        {/* Gapless Bento Metrics Grid */}
        <section className="gsap-fade-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-flow-dense gap-4">
          {/* Weekly Velocity Bento Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Readiness Velocity</span>
              <span className="text-emerald-400 font-mono">7-Day Trajectory</span>
            </div>
            <div className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left">
              {progressData?.weeklyVelocityPct !== undefined && progressData?.weeklyVelocityPct !== null
                ? `+${progressData.weeklyVelocityPct}%`
                : "0%"}
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {progressData?.projectedWeeksToPlacementReady
                  ? `Target reached in ~${progressData.projectedWeeksToPlacementReady} weeks`
                  : "Target projection pending"}
              </span>
            </div>
          </div>

          {/* Daily Streak Bento Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-amber-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Practice Consistency</span>
              <span className="text-amber-400 font-mono">
                Best: {progressData?.longestStreak || 0}d
              </span>
            </div>
            <div className="text-4xl font-extrabold text-amber-400 font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left flex items-center gap-2">
              <Flame className="w-7 h-7 text-amber-400 shrink-0" />
              <span>{progressData?.dailyStreak || 0} Days</span>
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consistency multiplier active</span>
            </div>
          </div>

          {/* Solved Problems Bento Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-purple-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Solved Problem Volume</span>
              <span className="text-purple-400 font-mono">LeetCode & Arena</span>
            </div>
            <div className="text-4xl font-extrabold text-purple-300 font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left flex items-center gap-2">
              <Code2 className="w-7 h-7 text-purple-400 shrink-0" />
              <span>{progressData?.totalProblemsSolved || 0}</span>
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>Balanced across Arrays, Trees, DP</span>
            </div>
          </div>

          {/* Study Hours Bento Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-zinc-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Dedicated Study Time</span>
              <span className="text-zinc-300 font-mono">Sessions & Labs</span>
            </div>
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left flex items-center gap-2">
              <Clock className="w-7 h-7 text-zinc-400 shrink-0" />
              <span>{progressData?.totalStudyHours || 0}h</span>
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-zinc-400" />
              <span>{progressData?.totalTasksCompleted || 0} tasks mastered</span>
            </div>
          </div>
        </section>

        {/* Historical Multi-Dimensional Trend Graphs */}
        <section className="gsap-fade-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Readiness Trajectory Timeline
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Progression metrics over time across Algorithmic DSA, Projects, ATS Resume, and Interviews
              </p>
            </div>

            {/* Time Range Tabs */}
            <div className="flex items-center gap-1 bg-zinc-950/80 p-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
              {["7d", "30d", "90d", "all"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg uppercase transition-all duration-200 cursor-pointer ${
                    timeRange === t
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Toggles */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {DIMENSIONS.map((dim) => (
              <button
                key={dim.key}
                type="button"
                onClick={() => setActiveDimension(dim.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                  activeDimension === dim.key
                    ? "bg-white text-zinc-950 font-semibold border-white shadow-md"
                    : "bg-zinc-950/80 text-zinc-400 border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor: activeDimension === dim.key ? "#09090b" : dim.color,
                  }}
                />
                {dim.label}
              </button>
            ))}
          </div>

          {/* Recharts Area Chart */}
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshots} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActiveDim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedDim.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={selectedDim.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  domain={[30, 100]}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121215",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "1rem",
                    fontSize: "12px",
                    color: "#fff",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeDimension}
                  stroke={selectedDim.color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorActiveDim)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Activity Telemetry Feed */}
        <section className="gsap-fade-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Practice Session Telemetry
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Verified training log and XP attribution history
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {(progressData?.activityLog || []).map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/80 border border-white/5 hover:border-white/15 transition-all duration-200"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white tracking-tight">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  +{act.xp} XP
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Log Activity Modal */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Log Learning Practice Sprint
                </h3>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLogActivitySubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full bg-zinc-950 text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400"
                  >
                    <option value="dsa_solved">DSA Coding Problem</option>
                    <option value="study_session">Video Lecture / Core CS Review</option>
                    <option value="resume_analyzed">Resume ATS Optimization</option>
                    <option value="interview_sprint">Mock Interview Drill</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                    Activity Title / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solved Hard: Word Break II on LeetCode"
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    required
                    className="w-full bg-zinc-950 text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                      Minutes Studied
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={activityMinutes}
                      onChange={(e) => setActivityMinutes(e.target.value)}
                      className="w-full bg-zinc-950 text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={activityXp}
                      onChange={(e) => setActivityXp(e.target.value)}
                      className="w-full bg-zinc-950 text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loggingInProgress}
                    className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    {loggingInProgress ? "Logging..." : "Record Activity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
