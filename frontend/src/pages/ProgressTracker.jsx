import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
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
  GraduationCap,
  Briefcase,
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
import GpButton from "@/components/gp/GpButton";
import GpBadge from "@/components/gp/GpBadge";
import GpCard from "@/components/gp/GpCard";

const DIMENSIONS = [
  { key: "overallScore", label: "Overall Readiness", color: "#896EE2" },
  { key: "dsaScore", label: "DSA Proficiency", color: "#63A0F8" },
  { key: "projectScore", label: "Projects & GitHub", color: "#96E6C4" },
  { key: "resumeScore", label: "ATS Resume", color: "#FEDF6A" },
  { key: "interviewScore", label: "Mock Interviews", color: "#F85B52" },
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
      if (!loading && containerRef.current) {
        gsap.fromTo(
          containerRef.current.querySelectorAll(".gsap-fade-item"),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.07,
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
  const filteredSnapshots = useMemo(() => {
    if (!snapshots.length) return [];
    if (timeRange === "all") return snapshots;
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const filtered = snapshots.filter((s) => {
      if (!s.date) return false;
      return new Date(s.date) >= cutoffDate;
    });
    return filtered.length > 0 ? filtered : snapshots.slice(-days);
  }, [snapshots, timeRange]);

  const selectedDim = DIMENSIONS.find((d) => d.key === activeDimension) || DIMENSIONS[0];

  const trackerMentor = getProgressTrackerMentorCopy({
    overallScore: progressData?.overallScore,
    velocity: progressData?.weeklyVelocityPct ? `+${progressData.weeklyVelocityPct}%/week` : "+4%/week",
  });

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#FEF9CF] u-background-grid-yellow text-[#0D0431] font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]">
      <div ref={containerRef} className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* ── Editorial Header ── */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-[#0D0431]">
          <div className="space-y-3 max-w-3xl">
            <GpBadge theme="light-purple">
              <Activity className="w-3.5 h-3.5 mr-1" />
              Velocity & Trajectory Analytics
            </GpBadge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-[#0D0431] leading-tight">
              {trackerMentor.heading}
            </h1>
            <p className="text-sm md:text-base text-[#0D0431]/80 max-w-3xl leading-relaxed">
              {trackerMentor.subtitle} {trackerMentor.velocityInsight}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <GpButton
              variant="stacked-yellow"
              size="md"
              icon={false}
              onClick={() => setShowLogModal(true)}
            >
              <span className="flex items-center gap-1.5 font-bold text-[#0D0431]">
                <Plus className="w-4 h-4" /> Log Practice Sprint
              </span>
            </GpButton>
          </div>
        </header>

        {/* ── Sub-nav Quick Links ── */}
        <nav className="gsap-fade-item flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { to: "/app/progress", label: "Progress Velocity", icon: TrendingUp, active: true },
            { to: "/app/milestones", label: "Milestones & Badges", icon: Award, active: false },
            { to: "/app/roadmap", label: "Placement Roadmap", icon: Target, active: false },
            { to: "/app/academics", label: "Academics Transcript", icon: GraduationCap, active: false },
            { to: "/app/can-i-apply", label: "Eligibility Checker", icon: Shield, active: false },
          ].map(({ to, label, icon: Icon, active }) => (
            <Link
              key={to}
              to={to}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold font-sans transition-all flex items-center gap-2 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] ${
                active
                  ? "bg-[#0D0431] text-white"
                  : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] hover:-translate-y-0.5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* ── Gapless Bento Metrics Grid ── */}
        <section className="gsap-fade-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Weekly Velocity Bento Card */}
          <GpCard
            theme="pale-lime"
            shadow="default"
            hoverEffect={true}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0D0431]/80 mb-3">
                <span className="uppercase tracking-wider">Readiness Velocity</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                  7-Day Trajectory
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-heading font-black text-[#0D0431] tracking-tight">
                {progressData?.weeklyVelocityPct !== undefined && progressData?.weeklyVelocityPct !== null
                  ? `+${progressData.weeklyVelocityPct}%`
                  : "0%"}
              </div>
            </div>
            <div className="text-xs text-[#0D0431] mt-4 pt-3 border-t-2 border-[#0D0431]/20 flex items-center gap-1.5 font-bold font-sans">
              <Zap className="w-4 h-4 text-[#0D0431]" />
              <span>
                {progressData?.projectedWeeksToPlacementReady
                  ? `Target reached in ~${progressData.projectedWeeksToPlacementReady} weeks`
                  : "Target projection active"}
              </span>
            </div>
          </GpCard>

          {/* Daily Streak Bento Card */}
          <GpCard
            theme="light-yellow"
            shadow="default"
            hoverEffect={true}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0D0431]/80 mb-3">
                <span className="uppercase tracking-wider">Practice Consistency</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                  Best: {progressData?.longestStreak || 0}d
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-heading font-black text-[#0D0431] tracking-tight flex items-center gap-2">
                <Flame className="w-8 h-8 text-[#F85B52] shrink-0" />
                <span>{progressData?.dailyStreak || 0} Days</span>
              </div>
            </div>
            <div className="text-xs text-[#0D0431] mt-4 pt-3 border-t-2 border-[#0D0431]/20 flex items-center gap-1.5 font-bold font-sans">
              <CheckCircle2 className="w-4 h-4 text-[#0D0431]" />
              <span>Consistency multiplier active</span>
            </div>
          </GpCard>

          {/* Solved Problems Bento Card */}
          <GpCard
            theme="light-purple"
            shadow="default"
            hoverEffect={true}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0D0431]/80 mb-3">
                <span className="uppercase tracking-wider">Solved Problems</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                  LeetCode & Arena
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-heading font-black text-[#0D0431] tracking-tight flex items-center gap-2">
                <Code2 className="w-8 h-8 text-[#0D0431] shrink-0" />
                <span>{progressData?.totalProblemsSolved || 0}</span>
              </div>
            </div>
            <div className="text-xs text-[#0D0431] mt-4 pt-3 border-t-2 border-[#0D0431]/20 flex items-center gap-1.5 font-bold font-sans">
              <Target className="w-4 h-4 text-[#0D0431]" />
              <span>Balanced across Arrays, Trees, DP</span>
            </div>
          </GpCard>

          {/* Dedicated Study Time Bento Card */}
          <GpCard
            theme="light-blue"
            shadow="default"
            hoverEffect={true}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0D0431]/80 mb-3">
                <span className="uppercase tracking-wider">Dedicated Study Time</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                  Sessions & Labs
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-heading font-black text-[#0D0431] tracking-tight flex items-center gap-2">
                <Clock className="w-8 h-8 text-[#0D0431] shrink-0" />
                <span>{progressData?.totalStudyHours || 0}h</span>
              </div>
            </div>
            <div className="text-xs text-[#0D0431] mt-4 pt-3 border-t-2 border-[#0D0431]/20 flex items-center gap-1.5 font-bold font-sans">
              <Award className="w-4 h-4 text-[#0D0431]" />
              <span>{progressData?.totalTasksCompleted || 0} tasks mastered</span>
            </div>
          </GpCard>
        </section>

        {/* ── Historical Multi-Dimensional Trend Graphs ── */}
        <GpCard
          theme="white"
          shadow="default"
          className="gsap-fade-item p-6 md:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0431]">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-heading font-black text-[#0D0431] tracking-tight">
                Readiness Trajectory Timeline
              </h3>
              <p className="text-xs text-[#0D0431]/75 font-sans">
                Progression metrics over time across Algorithmic DSA, Projects, ATS Resume, and Interviews
              </p>
            </div>

            {/* Time Range Tabs */}
            <div className="flex items-center gap-1 bg-[#FEF9CF] p-1.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] self-start sm:self-auto">
              {["7d", "30d", "90d", "all"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg uppercase transition-all cursor-pointer ${
                    timeRange === t
                      ? "bg-[#0D0431] text-white shadow-sm"
                      : "text-[#0D0431] hover:bg-white/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Toggles */}
          <div className="flex flex-wrap gap-2 pt-2">
            {DIMENSIONS.map((dim) => (
              <button
                key={dim.key}
                type="button"
                onClick={() => setActiveDimension(dim.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-[#0D0431] transition-all cursor-pointer shadow-[2px_2px_0_0_#0D0431] ${
                  activeDimension === dim.key
                    ? "bg-[#FEDF6A] text-[#0D0431] scale-[1.02]"
                    : "bg-white text-[#0D0431] hover:bg-[#FEF9CF]"
                }`}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full mr-2 border border-[#0D0431]"
                  style={{
                    backgroundColor: dim.color,
                  }}
                />
                {dim.label}
              </button>
            ))}
          </div>

          {/* Recharts Area Chart */}
          <div className="h-80 w-full pt-4 rounded-2xl bg-[#FEF9CF]/30 border-2 border-[#0D0431] p-4 shadow-[3px_3px_0_0_#0D0431]">
            {filteredSnapshots.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredSnapshots} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActiveDim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedDim.color} stopOpacity={0.65} />
                      <stop offset="95%" stopColor={selectedDim.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0D0431" opacity={0.15} />
                  <XAxis
                    dataKey="date"
                    stroke="#0D0431"
                    fontSize={11}
                    tickLine={false}
                    fontFamily="monospace"
                    fontWeight="bold"
                  />
                  <YAxis
                    stroke="#0D0431"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                    fontFamily="monospace"
                    fontWeight="bold"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#0D0431",
                      borderWidth: "2px",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      color: "#0D0431",
                      fontWeight: "bold",
                      boxShadow: "4px 4px 0 0 #0D0431",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeDimension}
                    stroke="#0D0431"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorActiveDim)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Activity className="w-8 h-8 text-[#0D0431]/40" />
                <p className="text-sm font-heading font-black text-[#0D0431]">
                  No Trajectory Snapshots Recorded Yet
                </p>
                <p className="text-xs text-[#0D0431]/70 max-w-sm">
                  Log your practice sessions or connect your LeetCode and GitHub profiles to generate historical progress velocity curves.
                </p>
              </div>
            )}
          </div>
        </GpCard>

        {/* ── Activity Telemetry Feed ── */}
        <GpCard
          theme="white"
          shadow="default"
          className="gsap-fade-item p-6 md:p-8 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#0D0431]">
            <div>
              <h3 className="text-xl font-heading font-black text-[#0D0431] tracking-tight">
                Practice Session Telemetry
              </h3>
              <p className="text-xs text-[#0D0431]/75 mt-0.5 font-sans">
                Verified training log and XP attribution history
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {(progressData?.activityLog || []).map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:bg-[#FEDF6A] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-heading font-black text-[#0D0431] tracking-tight">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-[#0D0431]/70 font-mono font-bold mt-0.5">
                      {new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-heading font-black text-[#0D0431] bg-[#E4FFDA] px-3.5 py-1.5 rounded-full border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  +{act.xp} XP
                </span>
              </div>
            ))}
          </div>
        </GpCard>

        {/* ── Log Activity Modal ── */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0431]/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0_0_#0D0431] space-y-5 text-[#0D0431]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0D0431]">
                <h3 className="text-lg font-heading font-black text-[#0D0431] tracking-tight">
                  Log Learning Practice Sprint
                </h3>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="p-1.5 rounded-xl border-2 border-[#0D0431] bg-[#FEF9CF] hover:bg-[#FEDF6A] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLogActivitySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-heading font-black uppercase text-[#0D0431] block mb-1.5">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full bg-white text-[#0D0431] font-bold text-xs rounded-xl px-3.5 py-2.5 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  >
                    <option value="dsa_solved">DSA Coding Problem</option>
                    <option value="study_session">Video Lecture / Core CS Review</option>
                    <option value="resume_analyzed">Resume ATS Optimization</option>
                    <option value="interview_sprint">Mock Interview Drill</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-heading font-black uppercase text-[#0D0431] block mb-1.5">
                    Activity Title / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solved Hard: Word Break II on LeetCode"
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    required
                    className="w-full bg-white text-[#0D0431] font-bold text-xs rounded-xl px-3.5 py-2.5 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-heading font-black uppercase text-[#0D0431] block mb-1.5">
                      Minutes Studied
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={activityMinutes}
                      onChange={(e) => setActivityMinutes(e.target.value)}
                      className="w-full bg-white text-[#0D0431] font-mono font-bold text-xs rounded-xl px-3.5 py-2.5 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-heading font-black uppercase text-[#0D0431] block mb-1.5">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={activityXp}
                      onChange={(e) => setActivityXp(e.target.value)}
                      className="w-full bg-white text-[#0D0431] font-mono font-bold text-xs rounded-xl px-3.5 py-2.5 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#0D0431]/20">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[#0D0431] hover:underline"
                  >
                    Cancel
                  </button>
                  <GpButton
                    type="submit"
                    variant="stacked-yellow"
                    size="md"
                    disabled={loggingInProgress}
                    icon={false}
                  >
                    <span className="font-bold text-[#0D0431]">
                      {loggingInProgress ? "Logging..." : "Record Activity"}
                    </span>
                  </GpButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
