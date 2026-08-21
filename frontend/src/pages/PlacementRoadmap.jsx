import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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

  const handleToggleTask = async (taskId) => {
    try {
      const res = await axios.patch(
        `${NODE_API_URL}/api/roadmap/toggle-task`,
        { taskId },
        { withCredentials: true }
      );
      if (res.data?.task) {
        // Update local state
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Personalized Placement Roadmap
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {roadmap?.timelineWeeks || 8}-Week customized milestone plan tailored for{" "}
                <span className="text-white font-semibold">{roadmap?.targetCompany || "Microsoft"}</span> (
                {roadmap?.targetRole || "SDE-1"})
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181b] hover:bg-[#222] border border-gray-800 text-xs font-semibold text-gray-200 transition-all shadow-sm"
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          Customize Timeline
        </button>
      </div>

      {/* Progress Bar Banner */}
      <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-xs text-gray-400">Roadmap Completion</span>
            <div className="text-xl font-bold text-white mt-0.5">
              {roadmap?.overallProgress || 35}% Completed
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Target Timeline: {roadmap?.timelineWeeks || 8} Weeks</span>
          </div>
        </div>

        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${roadmap?.overallProgress || 35}%` }}
          />
        </div>
      </div>

      {/* Phase Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {phases.map((p, idx) => (
          <button
            key={p.phaseNumber}
            type="button"
            onClick={() => {
              setSelectedPhaseIdx(idx);
              setSelectedWeekIdx(0);
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedPhaseIdx === idx
                ? "bg-purple-950/30 border-purple-500 text-white shadow-lg"
                : "bg-[#18181b] border-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <div className="text-xs font-semibold text-purple-400">
              Phase {p.phaseNumber} ({p.durationWeeks} Weeks)
            </div>
            <div className="text-sm font-bold text-white mt-1 line-clamp-1">
              {p.title}
            </div>
            <div className="text-xs text-gray-400 mt-1 line-clamp-1">
              {p.description}
            </div>
          </button>
        ))}
      </div>

      {/* Current Week Subtabs */}
      {weeks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {weeks.map((w, idx) => (
            <button
              key={w.weekNumber}
              type="button"
              onClick={() => setSelectedWeekIdx(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedWeekIdx === idx
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-[#18181b] text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              Week {w.weekNumber}: {w.title}
            </button>
          ))}
        </div>
      )}

      {/* Tasks & Milestones List for Selected Week */}
      <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            Week {currentWeek?.weekNumber}: {currentWeek?.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{currentWeek?.objective}</p>
        </div>

        <div className="space-y-3 pt-2">
          {tasks.map((task) => {
            const IconComp = TASK_TYPE_ICONS[task.type] || Target;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  task.completed
                    ? "bg-[#121214]/60 border-gray-800/40 opacity-70"
                    : "bg-[#121214] border-gray-800 hover:border-purple-500/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-0.5 text-gray-500 hover:text-purple-400 transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {task.type.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedMinutes} mins</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 ml-auto">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{task.impactScore}% Boost</span>
                      </div>
                    </div>

                    <h4
                      className={`text-sm font-semibold ${
                        task.completed
                          ? "text-gray-400 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </h4>

                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="mt-3">
                      <Link
                        to={task.actionUrl || "/app/coding"}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300"
                      >
                        Start Milestone Action <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customize Timeline Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Customize Placement Roadmap
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Select your target dream company and preferred timeline
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-[#121214] text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#121214] text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">
                  Timeline Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[4, 8, 12].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setTimelineWeeks(w)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        timelineWeeks === w
                          ? "bg-purple-600 text-white border-purple-500"
                          : "bg-[#121214] text-gray-400 border-gray-800 hover:text-white"
                      }`}
                    >
                      {w} Weeks
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateRoadmap}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
              >
                Generate Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
