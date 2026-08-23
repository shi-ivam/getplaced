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
      <div ref={containerRef} className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Editorial Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Placement Roadmap
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {roadmap?.timelineWeeks || 8}-Week milestone roadmap calibrated for{" "}
              <span className="text-zinc-200 font-medium">{roadmap?.targetCompany || "Target Company"}</span>{" "}
              ({roadmap?.targetRole || "Software Development Engineer"}).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-semibold font-mono transition-colors active:scale-95 cursor-pointer shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-700" />
            <span>Adjust Timeline</span>
          </button>
        </header>

        {/* Completion Progress Card */}
        <section className="gsap-fade-item rounded-2xl bg-[#121215] border border-zinc-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-zinc-500 block mb-1">
                Roadmap Completion
              </span>
              <div className="text-2xl font-bold text-white font-mono">
                {roadmap?.overallProgress !== undefined && roadmap?.overallProgress !== null
                  ? `${roadmap.overallProgress}%`
                  : "Unassessed"}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Timeline: {roadmap?.timelineWeeks || 8} Weeks</span>
            </div>
          </div>

          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${roadmap?.overallProgress || 0}%` }}
            />
          </div>
        </section>

        {/* Phase Selector Grid */}
        <section className="gsap-fade-item grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {phases.map((p, idx) => (
            <button
              key={p.phaseNumber}
              type="button"
              onClick={() => {
                setSelectedPhaseIdx(idx);
                setSelectedWeekIdx(0);
              }}
              className={`p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                selectedPhaseIdx === idx
                  ? "bg-zinc-900 border-purple-500/60"
                  : "bg-[#121215] border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              <div className="text-[10px] font-mono font-semibold text-purple-400 uppercase tracking-wider">
                Phase {p.phaseNumber} ({p.durationWeeks} Weeks)
              </div>
              <div className="text-sm font-bold text-white mt-1 line-clamp-1 tracking-tight">
                {p.title}
              </div>
              <div className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                {p.description}
              </div>
            </button>
          ))}
        </section>

        {/* Current Week Subtabs */}
        {weeks.length > 0 && (
          <div className="gsap-fade-item flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
            {weeks.map((w, idx) => (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => setSelectedWeekIdx(idx)}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedWeekIdx === idx
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                    : "bg-[#121215] text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                Week {w.weekNumber}: {w.title}
              </button>
            ))}
          </div>
        )}

        {/* Tasks & Milestones List */}
        <section className="gsap-fade-item rounded-2xl bg-[#121215] border border-zinc-800 p-6 md:p-7 space-y-5">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              Week {currentWeek?.weekNumber}: {currentWeek?.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">{currentWeek?.objective}</p>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => {
              const IconComp = TASK_TYPE_ICONS[task.type] || Target;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    task.completed
                      ? "bg-zinc-950/40 border-zinc-800/40 opacity-60"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-zinc-500 hover:text-purple-400 transition-colors shrink-0 cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {task.type}
                        </span>

                        <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedMinutes} mins</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 ml-auto">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{task.impactScore}%</span>
                        </div>
                      </div>

                      <h4
                        className={`text-xs font-semibold tracking-tight ${
                          task.completed ? "text-zinc-500 line-through" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h4>

                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans">
                        {task.description}
                      </p>

                      <div className="mt-3">
                        <Link
                          to={task.actionUrl || "/app/coding"}
                          className="inline-flex items-center gap-1 text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <span>Start Task</span>
                          <ArrowRight className="w-3 h-3" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Adjust Roadmap Timeline
                </h3>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">
                    Target Company
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full bg-zinc-900 text-white text-xs rounded-xl px-3 py-2 border border-zinc-800 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-zinc-900 text-white text-xs rounded-xl px-3 py-2 border border-zinc-800 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">
                    Timeline
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[4, 8, 12].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setTimelineWeeks(w)}
                        className={`py-2 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                          timelineWeeks === w
                            ? "bg-zinc-100 text-zinc-950 border-zinc-100"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                        }`}
                      >
                        {w} Weeks
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3.5 py-2 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateRoadmap}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-semibold font-mono transition-colors cursor-pointer"
                >
                  Update Roadmap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
