import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import {
  Target,
  Building2,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Compass,
  Layers,
  HelpCircle,
  TrendingUp,
  Code2,
  FileText,
  GraduationCap,
  BrainCog,
  FolderGit2,
  Info,
  X,
  Zap,
  Flame,
  RefreshCw,
  Award,
} from "lucide-react";
import { NODE_API_URL, PY_API_URL } from "@/config/api";
import confetti from "canvas-confetti";
import GpBadge from "@/components/gp/GpBadge";
import GpButton, { GpArrow } from "@/components/gp/GpButton";
import LevelComparisonTable from "@/components/ui/LevelComparisonTable";
import DsaTopicAnalysis from "@/components/dsa/DsaTopicAnalysis";
import WhatToDoNext from "@/components/dashboard/WhatToDoNext";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOnboardingAudit = searchParams.get("onboarding") === "complete";

  const [userProfile, setUserProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExplainModal, setShowExplainModal] = useState(false);

  // Multi-Pillar Placement Audit / Celebration Modal State
  const [showAuditModal, setShowAuditModal] = useState(isOnboardingAudit);

  // Trigger celebration confetti on arrival with ?onboarding=complete
  useEffect(() => {
    if (isOnboardingAudit) {
      setShowAuditModal(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#896EE2", "#FEDF6A", "#D4FDF7", "#F85B52", "#17103D"],
        });
      } catch (e) {}
    }
  }, [isOnboardingAudit]);

  const handleDismissAuditModal = () => {
    setShowAuditModal(false);
    if (searchParams.has("onboarding")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("onboarding");
      setSearchParams(nextParams, { replace: true });
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showAuditModal) {
        handleDismissAuditModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAuditModal]);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, readinessRes, gapRes, ghRes] = await Promise.allSettled([
          axios.get(`${NODE_API_URL}/api/users/profile`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/readiness`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/gap-analysis`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/github/profile`, { withCredentials: true }),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value?.data) {
          setUserProfile(profileRes.value.data);
        }
        if (readinessRes.status === "fulfilled" && readinessRes.value?.data?.readiness) {
          setReadiness(readinessRes.value.data.readiness);
        }
        if (gapRes.status === "fulfilled" && gapRes.value?.data?.gapAnalysis) {
          setGapData(gapRes.value.data.gapAnalysis);
        }
        if (ghRes.status === "fulfilled" && ghRes.value?.data?.profile) {
          setGithubProfile(ghRes.value.data.profile);
        }
      } catch (err) {
        console.warn("Could not fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const overallScore = readiness?.overallScore ?? 84;
  const targetCompany = userProfile?.targetCompany || "Microsoft";
  const targetRole = userProfile?.targetJobRole || "Software Development Engineer";

  // 4 Core Pillar Metrics
  const codingScore = readiness?.dimensions?.dsa?.score ?? 84;
  const codingTarget = readiness?.dimensions?.dsa?.requiredScore ?? 80;

  const devScore = githubProfile?.projectScore ?? (readiness?.dimensions?.projects?.score ?? 82);
  const devTarget = readiness?.dimensions?.projects?.requiredScore ?? 75;

  const resumeScore = userProfile?.resumeScore ?? (readiness?.dimensions?.resume?.score ?? 78);
  const resumeTarget = readiness?.dimensions?.resume?.requiredScore ?? 85;

  const academicScore = userProfile?.cgpa ? Number((userProfile.cgpa * 10).toFixed(0)) : 88;
  const academicTarget = 80;

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Prominent AI Onboarding Calibration Banner for new / uncalibrated candidates */}
      {userProfile && userProfile.onboardingCompleted === false && (
        <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-3xl p-6 sm:p-7 shadow-[6px_6px_0_0_#0D0431] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E4CDFB] text-[#0D0431] border border-[#0D0431] flex items-center gap-1.5 shadow-[2px_2px_0_0_#0D0431]">
                <span className="w-2 h-2 rounded-full bg-[#896EE2] animate-pulse" />
                <span>AI Calibration Pending</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#0D0431]/70">
                Step 1/6 Calibration
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-[#0D0431] tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#896EE2] shrink-0" />
                <span>Complete Your AI Placement Calibration</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#0D0431]/80 mt-1 leading-relaxed font-sans font-medium">
                Connect your target ambition, GitHub proof, LeetCode DSA, and academic baselines with your personal AI Career Coach to generate your personalized placement roadmap.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <GpButton
              to="/app/coach?onboarding=true"
              variant="stacked"
              size="md"
            >
              Launch AI Placement Coach
            </GpButton>
          </div>
        </div>
      )}

      {/* Hero Career Readiness Banner */}
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(23,16,61,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <GpBadge theme="yellow" size="sm">
              {targetCompany} Candidate
            </GpBadge>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight">
              {overallScore >= 80 ? "Interview Ready" : "Target Calibrating"} for {targetCompany}
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A80] mt-1 leading-relaxed">
              Target role: <span className="font-semibold text-[#17103D]">{targetRole}</span> • Benchmark analysis calibrated across DSA, Projects, Resume ATS, and Academic Cutoffs.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <Link
              to="/app/roadmap"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>View Milestone Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/app/coach"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2DEEC] bg-[#F8F8F5] hover:bg-[#F2F0FA] text-xs font-semibold text-[#17103D] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6E44FF]" />
              <span>Consult AI Coach</span>
            </Link>
          </div>
        </div>

        {/* Big Radial Score Gauge */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#F8F8F5] border border-[#E2DEEC] min-w-[180px] shrink-0 text-center space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Overall Readiness
          </span>
          <div className="text-4xl sm:text-5xl font-black text-[#17103D]">
            {overallScore}%
          </div>
          <span className="text-xs font-bold text-[#0D7A68]">
            {overallScore >= 80 ? "High Offer Probability" : "Competitive Standing"}
          </span>
        </div>
      </div>

      {/* Today's High-Yield Next Actions */}
      <WhatToDoNext userProfile={userProfile} readinessScore={overallScore} />

      {/* 4 Core Pillars Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Coding & DSA */}
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17103D]">Coding & DSA</span>
            </div>
            <GpBadge theme={codingScore >= codingTarget ? "mint" : "yellow"} size="sm">
              {codingScore >= codingTarget ? "Ready" : "Gap"}
            </GpBadge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#17103D]">{codingScore}%</span>
              <span className="text-[#6F6A80]">Target: {codingTarget}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F2F0FA] overflow-hidden">
              <div
                className="h-full bg-[#6E44FF] rounded-full"
                style={{ width: `${Math.min(100, codingScore)}%` }}
              />
            </div>
          </div>

          <Link
            to="/app/coding"
            className="text-[11px] font-semibold text-[#6E44FF] hover:underline flex items-center gap-1 pt-1 border-t border-[#E2DEEC]"
          >
            <span>Practice Problems</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pillar 2: Dev & Projects */}
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E3EEFF] text-[#1D58B5] flex items-center justify-center">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17103D]">Projects & GitHub</span>
            </div>
            <GpBadge theme={devScore >= devTarget ? "mint" : "yellow"} size="sm">
              {devScore >= devTarget ? "Ready" : "Gap"}
            </GpBadge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#17103D]">{devScore}%</span>
              <span className="text-[#6F6A80]">Target: {devTarget}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F2F0FA] overflow-hidden">
              <div
                className="h-full bg-[#1D58B5] rounded-full"
                style={{ width: `${Math.min(100, devScore)}%` }}
              />
            </div>
          </div>

          <Link
            to="/app/development"
            className="text-[11px] font-semibold text-[#1D58B5] hover:underline flex items-center gap-1 pt-1 border-t border-[#E2DEEC]"
          >
            <span>Inspect Projects</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pillar 3: Resume ATS */}
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FEF6D6] text-[#9E6700] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17103D]">Resume ATS</span>
            </div>
            <GpBadge theme={resumeScore >= resumeTarget ? "mint" : "yellow"} size="sm">
              {resumeScore >= resumeTarget ? "Ready" : "Gap"}
            </GpBadge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#17103D]">{resumeScore}%</span>
              <span className="text-[#6F6A80]">Target: {resumeTarget}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F2F0FA] overflow-hidden">
              <div
                className="h-full bg-[#9E6700] rounded-full"
                style={{ width: `${Math.min(100, resumeScore)}%` }}
              />
            </div>
          </div>

          <Link
            to="/app/resume"
            className="text-[11px] font-semibold text-[#9E6700] hover:underline flex items-center gap-1 pt-1 border-t border-[#E2DEEC]"
          >
            <span>Optimize Bullets</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pillar 4: Academics & CGPA */}
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D8FAF4] text-[#0D7A68] flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17103D]">Academics</span>
            </div>
            <GpBadge theme="mint" size="sm">
              Cutoff Clear
            </GpBadge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#17103D]">{userProfile?.cgpa || "8.80"} CGPA</span>
              <span className="text-[#6F6A80]">Cutoff: 8.00</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F2F0FA] overflow-hidden">
              <div
                className="h-full bg-[#0D7A68] rounded-full"
                style={{ width: `${Math.min(100, academicScore)}%` }}
              />
            </div>
          </div>

          <Link
            to="/app/academics"
            className="text-[11px] font-semibold text-[#0D7A68] hover:underline flex items-center gap-1 pt-1 border-t border-[#E2DEEC]"
          >
            <span>Check Eligibility</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Level Gap Analysis & Comparison Table */}
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DEEC]">
          <div>
            <h3 className="text-sm font-bold text-[#17103D] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6E44FF]" />
              <span>Placement Dimension Benchmarks</span>
            </h3>
            <p className="text-xs text-[#6F6A80] mt-0.5">
              Comparison between your verified credentials and {targetCompany}&apos;s recruitment cutoff.
            </p>
          </div>

          <Link
            to="/app/profile"
            className="text-xs font-semibold text-[#6E44FF] hover:underline"
          >
            Edit Ambition
          </Link>
        </div>

        <LevelComparisonTable
          levelComparison={gapData?.levelComparison}
          overallGapScore={gapData?.overallGapScore}
          companyTier={gapData?.companyTier}
          targetCompany={targetCompany}
          targetJobRole={targetRole}
        />
      </div>

      {/* DSA Topic Mastery Breakdown */}
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 shadow-sm">
        <DsaTopicAnalysis />
      </div>

      {/* Onboarding Completion Celebration / Audit Modal */}
      {showAuditModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismissAuditModal();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0431]/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xl bg-[#FEF9CF] border-2 border-[#0D0431] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[8px_8px_0_0_#0D0431] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-[#0D0431] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#D4FDF7] text-[#0D0431] border border-[#0D0431]">
                    Calibration Complete 🎉
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431] tracking-tight">
                  Placement Profile Active!
                </h2>
                <p className="text-xs text-[#0D0431]/80 font-medium">
                  Your AI Career Coach has synthesized your target benchmark and readiness baseline.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDismissAuditModal}
                className="w-8 h-8 rounded-xl border-2 border-[#0D0431] bg-white hover:bg-[#FFC5B7] flex items-center justify-center text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Target & Readiness Summary */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#0D0431]/60 tracking-wider">
                    Target Role & Ambition
                  </span>
                  <div className="font-heading font-black text-base text-[#0D0431]">
                    {targetCompany} · {targetRole}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#FEF9CF] px-3.5 py-2 rounded-xl border-2 border-[#0D0431] shrink-0">
                  <Award className="w-5 h-5 text-[#896EE2]" />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#0D0431]/70 block">Readiness</span>
                    <span className="font-heading font-black text-lg text-[#0D0431]">{overallScore}%</span>
                  </div>
                </div>
              </div>

              {/* 4 Pillars Calibrated */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] text-[#0D0431]/70 block">DSA Benchmark</span>
                  <span className="font-bold text-[#0D0431]">{codingScore}% score</span>
                </div>
                <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] text-[#0D0431]/70 block">Project Evidence</span>
                  <span className="font-bold text-[#0D0431]">{devScore}% score</span>
                </div>
                <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] text-[#0D0431]/70 block">Resume ATS</span>
                  <span className="font-bold text-[#0D0431]">{resumeScore}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] text-[#0D0431]/70 block">Academics</span>
                  <span className="font-bold text-[#0D0431]">{userProfile?.cgpa || "8.80"} CGPA</span>
                </div>
              </div>

              {/* Encouraging Note */}
              <div className="p-3.5 rounded-2xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs text-[#0D0431] font-medium flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#0D0431] shrink-0" />
                <span>Your personalized milestone roadmap and daily practice questions are ready!</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <GpButton
                onClick={handleDismissAuditModal}
                variant="stacked"
                size="md"
                className="w-full sm:flex-1"
              >
                Explore Career Dashboard
              </GpButton>

              <GpButton
                to="/app/roadmap"
                onClick={handleDismissAuditModal}
                variant="secondary"
                size="md"
                className="w-full sm:flex-1"
              >
                View Milestone Roadmap
              </GpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
