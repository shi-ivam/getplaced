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
  Check,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import CaideBadge from "@/components/caide/CaideBadge";
import CaideButton, { CaideArrow } from "@/components/caide/CaideButton";
import CaideCard from "@/components/caide/CaideCard";

const TASK_TYPE_ICONS = {
  dsa: Code2,
  resume: FileText,
  project: Layers,
  academics: Target,
  interview: BrainCog,
  core_cs: Layers,
};

const PHASE_THEMES = [
  { bg: "bg-[#D4FDF7]", border: "border-[#0D0431]", badge: "mint", name: "Foundation" },
  { bg: "bg-[#FEF9CF]", border: "border-[#0D0431]", badge: "yellow", name: "Acceleration" },
  { bg: "bg-[#E4CDFB]", border: "border-[#0D0431]", badge: "light-purple", name: "Mastery" },
  { bg: "bg-[#CDE1FF]", border: "border-[#0D0431]", badge: "blue", name: "Final Sprint" },
];

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
            duration: 0.5,
            stagger: 0.06,
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
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#FEF9CF] u-background-grid-yellow text-[#0D0431] font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]">
      <div ref={containerRef} className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        
        {/* Editorial Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-[#0D0431]">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <CaideBadge theme="light-purple">
                <Compass className="w-3.5 h-3.5 mr-1" />
                Preparation Trajectory
              </CaideBadge>
              <CaideBadge theme="mint">
                {roadmap?.timelineWeeks || 8} Weeks Plan
              </CaideBadge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-[#0D0431]">
              Placement Roadmap
            </h1>
            
            <p className="text-sm text-[#0D0431]/80 max-w-2xl font-medium leading-relaxed">
              Multi-phase milestone trajectory calibrated for{" "}
              <span className="font-bold text-[#0D0431] underline decoration-[#896EE2] decoration-2">
                {roadmap?.targetCompany || "Target Company"}
              </span>{" "}
              ({roadmap?.targetRole || "Software Development Engineer"}).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <CaideButton
              onClick={() => setShowConfigModal(true)}
              variant="stacked"
              size="md"
            >
              Adjust Timeline
            </CaideButton>
          </div>
        </header>

        {/* Completion Progress Card */}
        <section className="gsap-fade-item rounded-3xl border-2 border-[#0D0431] bg-white p-6 md:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D0431]/70 font-mono block mb-1">
                Roadmap Completion Status
              </span>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#0D0431]">
                {roadmap?.overallProgress !== undefined && roadmap?.overallProgress !== null
                  ? `${roadmap.overallProgress}%`
                  : "0%"}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono text-xs font-bold">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#0D0431] bg-[#D4FDF7] shadow-[2px_2px_0_0_#0D0431]">
                <Calendar className="w-3.5 h-3.5 text-[#0D0431]" />
                <span>Timeline: {roadmap?.timelineWeeks || 8} Weeks</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#0D0431] bg-[#E4CDFB] shadow-[2px_2px_0_0_#0D0431]">
                <Building2 className="w-3.5 h-3.5 text-[#0D0431]" />
                <span>{roadmap?.targetCompany || "Microsoft"}</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#FEF9CF] rounded-full h-3.5 overflow-hidden border-2 border-[#0D0431]">
            <div
              className="bg-[#896EE2] h-full rounded-full transition-all duration-700 ease-out border-r-2 border-[#0D0431]"
              style={{ width: `${Math.min(100, Math.max(0, roadmap?.overallProgress || 0))}%` }}
            />
          </div>
        </section>

        {/* Phase Selector Grid */}
        <section className="gsap-fade-item space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-xl text-[#0D0431]">
              Phase Progression
            </h2>
            <span className="text-xs font-bold font-mono text-[#0D0431]/70 uppercase">
              {phases.length} Major Milestones
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phases.map((p, idx) => {
              const theme = PHASE_THEMES[idx % PHASE_THEMES.length];
              const isSelected = selectedPhaseIdx === idx;

              return (
                <button
                  key={p.phaseNumber}
                  type="button"
                  onClick={() => {
                    setSelectedPhaseIdx(idx);
                    setSelectedWeekIdx(0);
                  }}
                  className={`p-5 rounded-2xl border-2 border-[#0D0431] text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? `${theme.bg} shadow-[6px_6px_0_0_#0D0431] -translate-y-1`
                      : "bg-white hover:bg-[#FEF9CF] shadow-[3px_3px_0_0_#0D0431] hover:shadow-[5px_5px_0_0_#0D0431]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#0D0431] bg-white text-[#0D0431]">
                      Phase 0{p.phaseNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0D0431]/80">
                      {p.durationWeeks} Weeks
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-lg text-[#0D0431] mt-1 line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#0D0431]/80 mt-1.5 line-clamp-2 leading-relaxed font-sans font-medium">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Current Week Subtabs */}
        {weeks.length > 0 && (
          <div className="gsap-fade-item flex items-center gap-2 overflow-x-auto pb-2 font-mono text-xs pt-2">
            {weeks.map((w, idx) => {
              const isSelected = selectedWeekIdx === idx;
              return (
                <button
                  key={w.weekNumber}
                  type="button"
                  onClick={() => setSelectedWeekIdx(idx)}
                  className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap border-2 border-[#0D0431] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FEDF6A] text-[#0D0431] shadow-[3px_3px_0_0_#0D0431] scale-[1.02]"
                      : "bg-white text-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
                  }`}
                >
                  Week {w.weekNumber}: {w.title}
                </button>
              );
            })}
          </div>
        )}

        {/* Tasks & Milestones List */}
        <section className="gsap-fade-item rounded-3xl border-2 border-[#0D0431] bg-white p-6 md:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-6">
          <div className="border-b-2 border-[#0D0431] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#E4CDFB] border border-[#0D0431] text-[#0D0431]">
                  Weekly Sprint
                </span>
                <h3 className="text-xl font-heading font-black text-[#0D0431]">
                  Week {currentWeek?.weekNumber}: {currentWeek?.title}
                </h3>
              </div>
              <p className="text-xs text-[#0D0431]/80 mt-1.5 font-medium">{currentWeek?.objective}</p>
            </div>

            <div className="text-xs font-mono font-bold text-[#0D0431] bg-[#FEF9CF] px-3 py-1.5 rounded-xl border border-[#0D0431] self-start sm:self-auto">
              {tasks.filter((t) => t.completed).length} / {tasks.length} Completed
            </div>
          </div>

          <div className="space-y-3.5">
            {tasks.map((task) => {
              const IconComp = TASK_TYPE_ICONS[task.type] || Target;

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-2xl border-2 border-[#0D0431] transition-all duration-200 ${
                    task.completed
                      ? "bg-[#D4FDF7]/40 shadow-[2px_2px_0_0_#0D0431]"
                      : "bg-[#FEF9CF]/30 hover:bg-[#FEF9CF] shadow-[4px_4px_0_0_#0D0431]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 w-6 h-6 rounded-lg border-2 border-[#0D0431] flex items-center justify-center transition-all bg-white hover:bg-[#FEDF6A] shadow-[2px_2px_0_0_#0D0431] cursor-pointer shrink-0"
                    >
                      {task.completed ? (
                        <Check className="w-4 h-4 text-[#0D0431] stroke-[3]" />
                      ) : null}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-[#0D0431] text-[#0D0431]">
                          {task.type}
                        </span>

                        <div className="flex items-center gap-1 text-xs text-[#0D0431]/80 font-mono font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.estimatedMinutes} mins</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-[#0D0431] font-mono font-bold bg-[#FEDF6A] px-2.5 py-0.5 rounded-full border border-[#0D0431] ml-auto">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{task.impactScore}% Impact</span>
                        </div>
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-bold font-heading ${
                          task.completed ? "text-[#0D0431]/50 line-through" : "text-[#0D0431]"
                        }`}
                      >
                        {task.title}
                      </h4>

                      <p className="text-xs text-[#0D0431]/80 mt-1 leading-relaxed font-sans font-medium">
                        {task.description}
                      </p>

                      <div className="mt-3.5 pt-2 border-t border-[#0D0431]/20 flex items-center justify-between">
                        <Link
                          to={task.actionUrl || "/app/coding"}
                          className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-[#0D0431] hover:underline"
                        >
                          <span>Execute Milestone</span>
                          <CaideArrow className="w-3.5 h-3.5" />
                        </Link>

                        {task.completed && (
                          <span className="text-[11px] font-mono font-bold text-[#0D0431] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Completed
                          </span>
                        )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0431]/80 backdrop-blur-sm p-4">
            <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0_0_#0D0431] space-y-5 relative">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0D0431]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#0D0431]" />
                  <h3 className="text-lg font-heading font-black text-[#0D0431]">
                    Adjust Timeline
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="w-8 h-8 rounded-xl border-2 border-[#0D0431] bg-white hover:bg-[#FEDF6A] flex items-center justify-center text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0D0431] font-mono block mb-1.5">
                    Target Company
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full bg-white text-[#0D0431] text-xs font-mono font-bold rounded-xl px-4 py-3 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0D0431] font-mono block mb-1.5">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-white text-[#0D0431] text-xs font-mono font-bold rounded-xl px-4 py-3 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0D0431] font-mono block mb-1.5">
                    Sprint Timeline Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[4, 8, 12].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setTimelineWeeks(w)}
                        className={`py-2.5 rounded-xl text-xs font-mono font-bold border-2 border-[#0D0431] transition-all cursor-pointer ${
                          timelineWeeks === w
                            ? "bg-[#FEDF6A] text-[#0D0431] shadow-[3px_3px_0_0_#0D0431]"
                            : "bg-white text-[#0D0431] hover:bg-[#D4FDF7] shadow-[2px_2px_0_0_#0D0431]"
                        }`}
                      >
                        {w} Weeks
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#0D0431]">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-bold font-mono text-[#0D0431] hover:underline cursor-pointer"
                >
                  Cancel
                </button>
                <CaideButton
                  onClick={handleRegenerateRoadmap}
                  variant="stacked-yellow"
                  size="md"
                >
                  Recalibrate
                </CaideButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
