import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  GraduationCap,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  Plus,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Award,
  BookOpen,
  Layers,
  Sparkles,
  Database,
  ExternalLink,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import TargetCutoffCalculator from "@/components/academics/TargetCutoffCalculator";
import CompanyEligibilityFilter from "@/components/academics/CompanyEligibilityFilter";

export default function Academics() {
  const containerRef = useRef(null);
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [tenthPct, setTenthPct] = useState(null);
  const [twelfthPct, setTwelfthPct] = useState(null);
  const [activeBacklogs, setActiveBacklogs] = useState(0);
  const [branch, setBranch] = useState("");
  const [isEditingSemesters, setIsEditingSemesters] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${NODE_API_URL}/api/academics/profile`, {
          withCredentials: true,
        });
        if (res.data?.academic) {
          setAcademicData(res.data.academic);
          setSemesters(res.data.academic.semesters || []);
          setTenthPct(res.data.academic.tenthPercentage ?? null);
          setTwelfthPct(res.data.academic.twelfthPercentage ?? null);
          setActiveBacklogs(res.data.academic.activeBacklogs || 0);
          setBranch(res.data.academic.branch || "");
        }
      } catch (err) {
        console.warn("Could not load academic profile from backend:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  const handleSgpaChange = (idx, value) => {
    const next = [...semesters];
    next[idx].sgpa = value === "" ? null : parseFloat(value);
    next[idx].isCompleted = next[idx].sgpa !== null;
    setSemesters(next);
  };

  const handleSaveAcademicChanges = async () => {
    try {
      const completedSems = semesters.filter((s) => s.isCompleted && s.sgpa !== null);
      const totalSgpa = completedSems.reduce((acc, s) => acc + s.sgpa, 0);
      const computedCgpa =
        completedSems.length > 0 ? Number((totalSgpa / completedSems.length).toFixed(2)) : null;

      const res = await axios.put(
        `${NODE_API_URL}/api/academics/profile`,
        {
          semesters,
          currentCgpa: computedCgpa,
          tenthPercentage: tenthPct,
          twelfthPercentage: twelfthPct,
          activeBacklogs,
          branch,
        },
        { withCredentials: true }
      );

      if (res.data?.academic) {
        setAcademicData(res.data.academic);
        setIsEditingSemesters(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Could not save academic updates:", err);
    }
  };

  const currentCgpa = academicData?.currentCgpa ?? null;
  const targetCgpa = academicData?.targetCgpa ?? null;

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-white">
      <div ref={containerRef} className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        {/* Editorial Wide Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Academic Transcript & Placement Cutoffs
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
              CGPA tracking, semester SGPA history, target score calculations, and eligibility screening across 35+ top recruiters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> Changes Saved
              </span>
            )}

            <Link
              to="/app/vtop"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold transition-all duration-200"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>VTOP Live Sync</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>

            <button
              type="button"
              onClick={() => {
                if (isEditingSemesters) {
                  handleSaveAcademicChanges();
                } else {
                  setIsEditingSemesters(true);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 shadow-lg hover:shadow-purple-500/10 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              {isEditingSemesters ? (
                <>
                  <Save className="w-4 h-4 text-purple-600" /> Save Profile Changes
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-zinc-800" /> Edit Semesters & Scores
                </>
              )}
            </button>
          </div>
        </header>

        {/* Gapless Bento Metrics Grid */}
        <section className="gsap-fade-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-flow-dense gap-4">
          {/* CGPA Bento Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-purple-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Cumulative CGPA</span>
              <span className="text-purple-400 font-mono">Tier-1 Target: 8.00+</span>
            </div>
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left">
              {currentCgpa !== null ? currentCgpa : "Unassessed"}
            </div>
            <div className="text-xs text-emerald-400 mt-3 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target Goal: {targetCgpa !== null ? `${targetCgpa} CGPA` : "Unset"}</span>
            </div>
          </div>

          {/* Board Percentages Bento Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-purple-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Standardized Marks</span>
              <span className="text-zinc-500 font-mono">10th / 12th</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left">
              {tenthPct !== null ? `${tenthPct}%` : "N/A"} / {twelfthPct !== null ? `${twelfthPct}%` : "N/A"}
            </div>
            <div className="text-xs text-emerald-400 mt-3 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tenthPct && twelfthPct ? "Clears 60% & 75% benchmarks" : "Enter Board Scores"}</span>
            </div>
          </div>

          {/* Active Backlogs Bento Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-purple-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Standing Backlogs</span>
              <span className="text-zinc-500 font-mono">Drive Status</span>
            </div>
            <div
              className={`text-4xl font-extrabold font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left ${
                activeBacklogs === 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {activeBacklogs}
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              {activeBacklogs === 0 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">100% Eligible for all drives</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Backlog clearance required</span>
                </>
              )}
            </div>
          </div>

          {/* Stream & Degree Bento Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-purple-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Academic Program</span>
              <span className="text-purple-400 font-mono">{academicData?.degree || "B.Tech"}</span>
            </div>
            <div className="text-base font-bold text-white truncate tracking-tight group-hover:scale-[1.01] transition-transform duration-500 origin-left">
              {branch || "Unspecified Branch"}
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-zinc-500" />
              <span>Graduation Class of {academicData?.graduationYear || 2026}</span>
            </div>
          </div>
        </section>

        {/* Semester-by-Semester SGPA Breakdown */}
        <section className="gsap-fade-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Semester SGPA Distribution
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Progression metrics and credit allocations computed via <strong>StudentCC</strong> formula across all semesters
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/app/vtop"
                className="text-xs font-mono text-purple-300 hover:text-white flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 transition-colors"
              >
                <span>Inspect Subject Grades</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="text-xs font-mono font-semibold px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 self-start sm:self-auto">
                Cumulative CGPA: {currentCgpa}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {semesters.map((sem, idx) => {
              const hasSgpa = sem.sgpa !== null && sem.sgpa !== undefined;
              return (
                <div
                  key={sem.semesterNumber}
                  className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col justify-between ${
                    hasSgpa
                      ? "bg-zinc-950/80 border-white/10 hover:border-purple-500/50 hover:bg-zinc-900/90"
                      : "bg-zinc-950/40 border-white/5 opacity-60"
                  }`}
                >
                  <span className="text-xs text-zinc-400 font-mono font-medium block">
                    Sem {sem.semesterNumber}
                  </span>

                  <div className="my-3">
                    {isEditingSemesters ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        placeholder="SGPA"
                        value={sem.sgpa ?? ""}
                        onChange={(e) => handleSgpaChange(idx, e.target.value)}
                        className="w-full bg-zinc-900 text-white text-center text-sm font-mono font-bold rounded-lg py-1.5 border border-purple-500/40 focus:border-purple-400 focus:outline-none"
                      />
                    ) : (
                      <div
                        className={`text-xl font-extrabold font-mono tracking-tight ${
                          hasSgpa ? "text-white" : "text-zinc-600"
                        }`}
                      >
                        {hasSgpa ? Number(sem.sgpa).toFixed(2) : "—"}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-zinc-500 font-mono block">
                    {sem.credits} Credits
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Target Cutoff Calculator Component */}
        <div className="gsap-fade-item">
          <TargetCutoffCalculator
            currentCgpa={currentCgpa}
            completedSemesters={
              semesters.filter((s) => s.isCompleted && s.sgpa !== null).length || 5
            }
            totalSemesters={8}
            targetCgpa={targetCgpa}
          />
        </div>

        {/* Company Academic Eligibility Screening Component */}
        <div className="gsap-fade-item">
          <CompanyEligibilityFilter academicData={academicData} />
        </div>
      </div>
    </main>
  );
}
