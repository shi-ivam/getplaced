import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  Award,
  BookOpen,
  Layers,
  Sparkles,
  Database,
  ExternalLink,
  Target,
  FileSpreadsheet,
  Flame,
  Check,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";
import TargetCutoffCalculator from "@/components/academics/TargetCutoffCalculator";
import CompanyEligibilityFilter from "@/components/academics/CompanyEligibilityFilter";

const DEFAULT_SEMESTERS = [
  { semesterNumber: 1, sgpa: null, credits: 20, isCompleted: false },
  { semesterNumber: 2, sgpa: null, credits: 20, isCompleted: false },
  { semesterNumber: 3, sgpa: null, credits: 20, isCompleted: false },
  { semesterNumber: 4, sgpa: null, credits: 20, isCompleted: false },
  { semesterNumber: 5, sgpa: null, credits: 20, isCompleted: false },
  { semesterNumber: 6, sgpa: null, credits: 20, isCompleted: false },
  { semesterNumber: 7, sgpa: null, credits: 20, isCompleted: false },
  { semesterNumber: 8, sgpa: null, credits: 20, isCompleted: false },
];

export default function Academics() {
  const containerRef = useRef(null);
  const [academicData, setAcademicData] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
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
          const sems =
            res.data.academic.semesters && res.data.academic.semesters.length > 0
              ? res.data.academic.semesters
              : DEFAULT_SEMESTERS;
          setSemesters(sems);
          setTenthPct(res.data.academic.tenthPercentage ?? null);
          setTwelfthPct(res.data.academic.twelfthPercentage ?? null);
          setActiveBacklogs(res.data.academic.activeBacklogs || 0);
          setBranch(res.data.academic.branch || "");
        } else {
          setSemesters(DEFAULT_SEMESTERS);
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
    const baseList = semesters.length > 0 ? semesters : DEFAULT_SEMESTERS;
    const next = baseList.map((s, i) => {
      if (i === idx) {
        const parsed = value === "" ? null : parseFloat(value);
        return {
          ...s,
          semesterNumber: s.semesterNumber || i + 1,
          sgpa: parsed !== null && !isNaN(parsed) ? parsed : null,
          credits: Number(s.credits) || 20,
          isCompleted: parsed !== null && !isNaN(parsed),
        };
      }
      return { ...s, semesterNumber: s.semesterNumber || i + 1, credits: Number(s.credits) || 20 };
    });
    setSemesters(next);
  };

  const handleSaveAcademicChanges = async () => {
    try {
      const currentList = semesters.length > 0 ? semesters : DEFAULT_SEMESTERS;
      const completedSems = currentList.filter(
        (s) => s.isCompleted && s.sgpa !== null && !isNaN(s.sgpa)
      );

      let computedCgpa = null;
      if (completedSems.length > 0) {
        const totalGradedCredits = completedSems.reduce(
          (acc, s) => acc + (Number(s.credits) || 20),
          0
        );
        const totalWeightedPoints = completedSems.reduce(
          (acc, s) => acc + Number(s.sgpa) * (Number(s.credits) || 20),
          0
        );
        computedCgpa =
          totalGradedCredits > 0
            ? Number((totalWeightedPoints / totalGradedCredits).toFixed(2))
            : null;
      }

      const res = await axios.put(
        `${NODE_API_URL}/api/academics/profile`,
        {
          semesters: currentList,
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
        setSemesters(
          res.data.academic.semesters && res.data.academic.semesters.length > 0
            ? res.data.academic.semesters
            : currentList
        );
        setIsEditingSemesters(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error("Could not save academic updates:", err);
    }
  };

  const currentCgpa = academicData?.currentCgpa ?? (semesters.some((s) => s.sgpa !== null) ? null : 8.84);
  const targetCgpa = academicData?.targetCgpa ?? 9.0;
  const completedCount = semesters.filter((s) => s.isCompleted && s.sgpa !== null && !isNaN(s.sgpa)).length;

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DEEC]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-[#6E44FF]" />
            <span>Academic Performance & Cutoffs</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6A80] mt-1">
            Long-term CGPA tracking, semester SGPA progression, target calculator, and company eligibility cutoffs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            to="/app/vtop"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2DEEC] bg-white hover:bg-[#F2F0FA] text-xs font-semibold text-[#17103D] transition-colors shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-[#6E44FF]" />
            <span>VTOP Live Sync</span>
          </Link>

          <button
            onClick={() => {
              if (isEditingSemesters) {
                handleSaveAcademicChanges();
              } else {
                setIsEditingSemesters(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            {isEditingSemesters ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditingSemesters ? "Save Transcript" : "Edit Semesters"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-[#D8FAF4] border border-[#B7F4E8] text-[#0D7A68] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Academic transcript successfully saved and synced!</span>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Current CGPA
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#17103D]">
            {Number(currentCgpa).toFixed(2)}
          </div>
          <p className="text-[11px] text-[#0D7A68] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Top Tier-1 Eligible</span>
          </p>
        </div>

        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Target CGPA
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#6E44FF]">
            {Number(targetCgpa).toFixed(2)}
          </div>
          <p className="text-[11px] text-[#6F6A80]">
            Delta: +{Math.max(0, targetCgpa - currentCgpa).toFixed(2)} needed
          </p>
        </div>

        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Completed Semesters
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#17103D]">
            {completedCount} / 8
          </div>
          <p className="text-[11px] text-[#6F6A80]">
            {8 - completedCount} semesters remaining
          </p>
        </div>

        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Active Backlogs
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#17103D]">
            {activeBacklogs}
          </div>
          <p className="text-[11px] text-[#0D7A68] font-semibold">
            {activeBacklogs === 0 ? "Zero Standing Arrears" : "Review Backlogs"}
          </p>
        </div>
      </div>

      {/* Visual Semester SGPA Progression Chart / Bars */}
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2DEEC]">
          <div>
            <h3 className="text-sm font-bold text-[#17103D] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6E44FF]" />
              <span>Semester SGPA Progression</span>
            </h3>
            <p className="text-xs text-[#6F6A80] mt-0.5">
              Visual breakdown of academic grades across all 8 semesters.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-[#6E44FF]">
            Avg: {currentCgpa}
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {(semesters.length > 0 ? semesters : DEFAULT_SEMESTERS).map((sem, idx) => {
            const val = sem.sgpa;
            const pct = val ? (val / 10) * 100 : 0;
            const isDone = sem.isCompleted && val !== null;

            return (
              <div
                key={sem.semesterNumber || idx + 1}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${
                  isDone
                    ? "bg-[#F8F8F5] border-[#E2DEEC]"
                    : "bg-[#F8F8F5]/40 border-dashed border-[#E2DEEC]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#6F6A80]">Sem {sem.semesterNumber || idx + 1}</span>
                  {isDone && <Check className="w-3 h-3 text-[#0D7A68]" />}
                </div>

                {isEditingSemesters ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={sem.sgpa ?? ""}
                    onChange={(e) => handleSgpaChange(idx, e.target.value)}
                    placeholder="SGPA"
                    className="w-full bg-white border border-[#E2DEEC] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                  />
                ) : (
                  <div className="text-base font-black text-[#17103D] font-mono">
                    {val ? Number(val).toFixed(2) : "—"}
                  </div>
                )}

                {/* Vertical Bar representation */}
                <div className="w-full h-1.5 rounded-full bg-[#E2DEEC] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      val >= 9.0
                        ? "bg-[#6E44FF]"
                        : val >= 8.0
                        ? "bg-[#0D7A68]"
                        : "bg-[#FFD84D]"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Cutoff Calculator */}
      <TargetCutoffCalculator
        currentCgpa={currentCgpa}
        completedSemesters={completedCount}
        totalSemesters={8}
        targetCgpa={targetCgpa}
      />

      {/* 35+ Company Eligibility Matrix */}
      <CompanyEligibilityFilter
        academicData={academicData}
        currentCgpa={currentCgpa}
        tenthPercentage={tenthPct}
        twelfthPercentage={twelfthPct}
        activeBacklogs={activeBacklogs}
      />
    </div>
  );
}
