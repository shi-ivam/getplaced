import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Target,
  Building2,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Layers,
  Code2,
  FileText,
  BrainCog,
  RefreshCw,
  Sliders,
  X,
  Compass,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

const TASK_TYPE_ICONS = {
  dsa: Code2,
  resume: FileText,
  project: Layers,
  academics: Target,
  interview: BrainCog,
  core_cs: Layers,
};

export default function PlacementRoadmap() {
  const containerRef = useRef(null);
  const [roadmap, setRoadmap] = useState(null);
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [targetCompany, setTargetCompany] = useState("Microsoft");
  const [targetRole, setTargetRole] = useState("Software Development Engineer");

  const fetchRoadmap = async () => {
    try {
      const res = await axios.get(`${NODE_API_URL}/api/roadmap`, {
        withCredentials: true,
      });
      if (res.data) {
        setRoadmap(res.data);
        setTimelineWeeks(res.data.timelineWeeks || 8);
        setTargetCompany(res.data.targetCompany || "Microsoft");
        setTargetRole(res.data.targetRole || "Software Development Engineer");
      }
    } catch (err) {
      console.warn("Could not load roadmap from backend, fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
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
    { scope: containerRef, dependencies: [loading, selectedPhaseIdx, selectedWeekIdx] }
  );

  const handleToggleTask = async (taskId) => {
    try {
      const res = await axios.patch(
        `${NODE_API_URL}/api/roadmap/toggle-task`,
        { taskId },
        { withCredentials: true }
      );
      if (res.data?.task) {
        setRoadmap((prev) => {
          const updated = JSON.parse(JSON.stringify(prev));
          for (const p of updated.phases) {
            for (const w of p.weeks) {
              for (const t of w.tasks) {
                if (t.id === taskId) {
                  t.completed = res.data.task.completed;
                }
              }
            }
          }
          updated.overallProgress = res.data.overallProgress;
          return updated;
        });
      }
    } catch (err) {
      console.error("Could not toggle roadmap task:", err);
    }
  };

  const handleRegenerateRoadmap = async () => {
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/roadmap/generate`,
        {
          targetCompany,
          targetRole,
          timelineWeeks,
        },
        { withCredentials: true }
      );
      if (res.data) {
        setRoadmap(res.data);
        setShowConfigModal(false);
        setSelectedPhaseIdx(0);
        setSelectedWeekIdx(0);
      }
    } catch (err) {
      console.error("Could not regenerate roadmap:", err);
    }
  };

  const phases = roadmap?.phases || [];
  const currentPhase = phases[selectedPhaseIdx] || phases[0];
  const weeks = currentPhase?.weeks || [];
  const currentWeek = weeks[selectedWeekIdx] || weeks[0];
  const tasks = currentWeek?.tasks || [];

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-white">
      <div ref={containerRef} className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        {/* Editorial Wide Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" />
              Dynamic Preparation Trajectory
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Placement Preparation Roadmap
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
              {roadmap?.timelineWeeks || 8}-Week targeted milestone roadmap calibrated for{" "}
              <span className="text-white font-semibold">{roadmap?.targetCompany || "Microsoft"}</span>{" "}
              ({roadmap?.targetRole || "Software Development Engineer"}).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            Customize Timeline
          </button>
        </header>

        {/* Aggregate Completion Banner */}
        <section className="gsap-fade-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                Milestone Trajectory Completion
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {roadmap?.overallProgress || 35}% Ready
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Horizon: {roadmap?.timelineWeeks || 8} Weeks Total</span>
            </div>
          </div>

          <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${roadmap?.overallProgress || 35}%` }}
            />
          </div>
        </section>

        {/* Phase Selector Grid */}
        <section className="gsap-fade-item grid grid-cols-1 md:grid-cols-3 gap-4">
          {phases.map((p, idx) => (
            <button
              key={p.phaseNumber}
              type="button"
              onClick={() => {
                setSelectedPhaseIdx(idx);
                setSelectedWeekIdx(0);
              }}
              className={`p-6 rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                selectedPhaseIdx === idx
                  ? "bg-zinc-900 border-purple-500/50 shadow-xl ring-1 ring-purple-500/40 scale-[1.01]"
                  : "bg-zinc-950/60 border-white/10 hover:border-white/20 text-zinc-400 hover:text-white"
              }`}
            >
              <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                Phase {p.phaseNumber} ({p.durationWeeks} Weeks)
              </div>
              <div className="text-base font-bold text-white mt-1.5 line-clamp-1 tracking-tight">
                {p.title}
              </div>
              <div className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {p.description}
              </div>
            </button>
          ))}
        </section>

        {/* Current Week Subtabs */}
        {weeks.length > 0 && (
          <div className="gsap-fade-item flex items-center gap-2 overflow-x-auto pb-1">
            {weeks.map((w, idx) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => setSelectedWeekIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedWeekIdx === idx
                    ? "bg-white text-zinc-950 font-semibold shadow-md"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
                }`}
              >
                Week {w.weekNumber}: {w.title}
              </button>
            ))}
          </div>
        )}

        {/* Tasks & Milestones List */}
        <section className="gsap-fade-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Week {currentWeek?.weekNumber}: {currentWeek?.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">{currentWeek?.objective}</p>
          </div>

          <div className="space-y-3 pt-2">
            {tasks.map((task) => {
              const IconComp = TASK_TYPE_ICONS[task.type] || Target;

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 ${
                    task.completed
                      ? "bg-zinc-950/40 border-white/5 opacity-60"
                      : "bg-zinc-950/90 border-white/10 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-zinc-500 hover:text-purple-400 transition-colors shrink-0 cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {task.type.toUpperCase()}
                        </span>

                        <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.estimatedMinutes} mins</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 ml-auto">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{task.impactScore}% Boost</span>
                        </div>
                      </div>

                      <h4
                        className={`text-sm font-bold tracking-tight ${
                          task.completed ? "text-zinc-500 line-through" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h4>

                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="mt-4">
                        <Link
                          to={task.actionUrl || "/app/coding"}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Execute Task <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Modal: Customize Timeline */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Calibrate Preparation Roadmap
                </h3>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                    Target Enterprise
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full bg-zinc-950 text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                    Target Profile / Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-zinc-950 text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                    Preparation Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[4, 8, 12].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setTimelineWeeks(w)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          timelineWeeks === w
                            ? "bg-white text-zinc-950 border-white shadow-md"
                            : "bg-zinc-950 text-zinc-400 border-white/10 hover:text-white"
                        }`}
                      >
                        {w} Weeks
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateRoadmap}
                  className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Generate Roadmap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
