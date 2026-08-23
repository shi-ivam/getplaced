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
  ShieldCheck,
  Zap,
  Flame,
  RefreshCw,
  Award,
} from "lucide-react";
import { NODE_API_URL, PY_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";
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

  // Multi-Pillar Placement Audit Modal State
  const [showAuditModal, setShowAuditModal] = useState(isOnboardingAudit);
  const [auditStep, setAuditStep] = useState(1);
  const [auditCompleted, setAuditCompleted] = useState(false);
  const [auditResumeUploading, setAuditResumeUploading] = useState(false);
  const [auditResumeError, setAuditResumeError] = useState("");
  const auditIntervalRef = useRef(null);
  const hasAutoStartedRef = useRef(false);

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
      {/* Hero Career Readiness Banner */}
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(23,16,61,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <GpBadge theme="mint" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified Readiness Matrix
            </GpBadge>
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
    </div>
  );
}
