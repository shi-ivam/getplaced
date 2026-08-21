import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import TargetCutoffCalculator from "@/components/academics/TargetCutoffCalculator";
import CompanyEligibilityFilter from "@/components/academics/CompanyEligibilityFilter";

export default function Academics() {
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingSemesters, setIsEditingSemesters] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [tenthPct, setTenthPct] = useState(88.5);
  const [twelfthPct, setTwelfthPct] = useState(86.0);
  const [activeBacklogs, setActiveBacklogs] = useState(0);
  const [branch, setBranch] = useState("Computer Science & Engineering");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${NODE_API_URL}/api/academics/profile`, {
          withCredentials: true,
        });
        if (res.data?.academic) {
          setAcademicData(res.data.academic);
          setSemesters(res.data.academic.semesters || []);
          setTenthPct(res.data.academic.tenthPercentage || 88.5);
          setTwelfthPct(res.data.academic.twelfthPercentage || 86.0);
          setActiveBacklogs(res.data.academic.activeBacklogs || 0);
          setBranch(res.data.academic.branch || "Computer Science & Engineering");
        }
      } catch (err) {
        console.warn("Could not load academic profile from backend:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
      const computedCgpa = completedSems.length > 0 ? Number((totalSgpa / completedSems.length).toFixed(2)) : 8.0;

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
      }
    } catch (err) {
      console.error("Could not save academic updates:", err);
    }
  };

  const currentCgpa = academicData?.currentCgpa || 8.5;
  const targetCgpa = academicData?.targetCgpa || 8.8;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Academics & CGPA Analysis</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Semester GPA tracking, target cutoff calculator, and 35+ company academic eligibility screening
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isEditingSemesters) {
              handleSaveAcademicChanges();
            } else {
              setIsEditingSemesters(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition-all"
        >
          {isEditingSemesters ? (
            <>
              <Save className="w-4 h-4" /> Save Academic Profile
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" /> Edit Semesters & Scores
            </>
          )}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CGPA */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Overall CGPA</span>
            <span className="text-purple-400 font-semibold">Tier 1 Target: 8.0+</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{currentCgpa}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target: {targetCgpa} CGPA</span>
          </div>
        </div>

        {/* 10th & 12th Percentages */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Board Percentages</span>
            <span className="text-gray-500">10th / 12th</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {tenthPct}% / {twelfthPct}%
          </div>
          <div className="text-xs text-emerald-400 mt-1">
            ✓ Clears standard 60% & 75% cutoffs
          </div>
        </div>

        {/* Backlogs */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Active Backlogs</span>
            <span className="text-gray-500">Placement Clearance</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {activeBacklogs}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {activeBacklogs === 0 ? "✓ 100% Eligible for all drives" : "⚠️ Backlog clearance needed"}
          </div>
        </div>

        {/* Degree & Branch */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Branch / Stream</span>
            <span className="text-purple-400">{academicData?.degree || "B.Tech"}</span>
          </div>
          <div className="text-sm font-bold text-white truncate mt-1">
            {branch}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Graduation Year: {academicData?.graduationYear || 2026}
          </div>
        </div>
      </div>

      {/* Semester SGPA Breakdown */}
      <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Semester-by-Semester SGPA History</h3>
            <p className="text-xs text-gray-400">
              Track SGPA trends and credit distribution across all 8 academic semesters
            </p>
          </div>
          <div className="text-xs text-purple-400 font-semibold px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
            Weighted Average CGPA: {currentCgpa}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {semesters.map((sem, idx) => {
            const hasSgpa = sem.sgpa !== null && sem.sgpa !== undefined;
            return (
              <div
                key={sem.semesterNumber}
                className={`p-3 rounded-xl border text-center transition-all ${
                  hasSgpa
                    ? "bg-[#121214] border-gray-800 hover:border-purple-500/40"
                    : "bg-[#141416]/50 border-gray-800/40 opacity-70"
                }`}
              >
                <span className="text-[11px] text-gray-400 block font-medium">
                  Sem {sem.semesterNumber}
                </span>

                {isEditingSemesters ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="SGPA"
                    value={sem.sgpa ?? ""}
                    onChange={(e) => handleSgpaChange(idx, e.target.value)}
                    className="w-full bg-[#1c1c20] text-white text-center text-sm font-bold rounded mt-2 py-1 border border-gray-700 focus:border-purple-500 focus:outline-none"
                  />
                ) : (
                  <div
                    className={`text-lg font-extrabold font-mono mt-1 ${
                      hasSgpa ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {hasSgpa ? sem.sgpa : "—"}
                  </div>
                )}

                <span className="text-[10px] text-gray-500 mt-1 block">
                  {sem.credits} Credits
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Cutoff Calculator */}
      <TargetCutoffCalculator
        currentCgpa={currentCgpa}
        completedSemesters={semesters.filter((s) => s.isCompleted && s.sgpa !== null).length || 5}
        totalSemesters={8}
        targetCgpa={targetCgpa}
      />

      {/* Company Academic Eligibility Screening */}
      <CompanyEligibilityFilter academicData={academicData} />
    </div>
  );
}
