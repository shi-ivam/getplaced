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
  MessageSquare,
  BrainCog,
  FolderGit2,
  Info,
  X,
  ArrowUpRight,
  ShieldCheck,
  BarChart3,
  Calendar,
  BookOpen,
  CheckSquare,
  Circle,
  Cpu,
  Star,
  GitFork,
  Globe,
  Terminal,
  Mic,
  Activity,
  Zap,
  Swords,
  ChevronRight,
  Database,
  Award,
  Flame,
  Check,
  RefreshCw,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import LevelComparisonTable from "@/components/ui/LevelComparisonTable";
import DsaTopicAnalysis from "@/components/dsa/DsaTopicAnalysis";
import DsaRequirementComparison from "@/components/dsa/DsaRequirementComparison";
import WhatToDoNext from "@/components/dashboard/WhatToDoNext";

const DIMENSION_ICONS = {
  dsa: Code2,
  skills: Layers,
  projects: FolderGit2,
  resume: FileText,
  academics: GraduationCap,
  communication: MessageSquare,
  interview: BrainCog,
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOnboardingAudit = searchParams.get("onboarding") === "complete";

  const [userProfile, setUserProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExplainModal, setShowExplainModal] = useState(false);

  // Onboarding Profile Audit Modal State
  const [showAuditModal, setShowAuditModal] = useState(isOnboardingAudit);
  const [auditStep, setAuditStep] = useState(isOnboardingAudit ? 1 : 5);
  const [auditCompleted, setAuditCompleted] = useState(!isOnboardingAudit);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, readinessRes, gapRes, githubRes] = await Promise.allSettled([
          axios.get(`${NODE_API_URL}/api/users/profile`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/readiness`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/gap-analysis`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/github/profile`, { withCredentials: true }),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value?.data) {
          setUserProfile(profileRes.value.data);
        }

        if (readinessRes.status === "fulfilled" && readinessRes.value?.data) {
          setReadiness(readinessRes.value.data);
        }

        if (gapRes.status === "fulfilled" && gapRes.value?.data) {
          setGapData(gapRes.value.data);
        }

        if (githubRes.status === "fulfilled" && githubRes.value?.data?.connected && githubRes.value.data.profile) {
          setGithubProfile(githubRes.value.data.profile);
        }
      } catch (err) {
        console.error("Could not fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // GSAP animation
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".gsap-reveal"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" }
      );
    }
  }, [loading]);

  // Onboarding Step Animation Handler
  const handleStartAuditModal = () => {
    setShowAuditModal(true);
    setAuditStep(1);
    setAuditCompleted(false);

    const interval = setInterval(() => {
      setAuditStep((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setAuditCompleted(true);
          return 5;
        }
        return prev + 1;
      });
    }, 700);
  };

  const hasTarget = Boolean(userProfile?.targetCompany || userProfile?.targetJobRole);
  const isFullTarget = Boolean(userProfile?.targetCompany && userProfile?.targetJobRole);

  const getStatusBadge = (statusKey) => {
    switch (statusKey) {
      case "highly_ready":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "interview_ready":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "developing":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "needs_major_improvement":
      case "needs_improvement":
      case "not_ready":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-800/80 text-zinc-400 border-zinc-700/60";
    }
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "text-zinc-500";
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-sky-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getProgressBarBg = (score) => {
    if (score === null || score === undefined) return "bg-zinc-800";
    if (score >= 90) return "bg-emerald-400";
    if (score >= 75) return "bg-sky-400";
    if (score >= 60) return "bg-amber-400";
    return "bg-rose-400";
  };

  const dimensionsList = readiness?.dimensions ? Object.values(readiness.dimensions) : [];

  // Pillar 1: Coding Stats
  const codingScore = readiness?.dimensions?.dsa?.score !== null && readiness?.dimensions?.dsa?.score !== undefined
    ? readiness.dimensions.dsa.score
    : 82;
  const codingTarget = readiness?.dimensions?.dsa?.requiredScore || 85;

  // Pillar 2: Development Stats
  const devScore = githubProfile?.projectScore || (readiness?.dimensions?.projects?.score !== null && readiness?.dimensions?.projects?.score !== undefined ? readiness.dimensions.projects.score : 75);
  const devTarget = readiness?.dimensions?.projects?.requiredScore || 80;

  // Pillar 3: Resume Stats
  const resumeScore = readiness?.dimensions?.resume?.score !== null && readiness?.dimensions?.resume?.score !== undefined
    ? readiness.dimensions.resume.score
    : 74;
  const resumeTarget = readiness?.dimensions?.resume?.requiredScore || 85;

  // Pillar 4: Interview Stats
  const interviewScore = readiness?.dimensions?.communication?.score !== null && readiness?.dimensions?.communication?.score !== undefined
    ? readiness.dimensions.communication.score
    : 78;
  const interviewTarget = readiness?.dimensions?.communication?.requiredScore || 80;

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 lg:p-10 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION & CANDIDATE CAREER COMMAND CENTER */}
        {/* ========================================================================= */}
        <header className="gsap-reveal flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
          <div className="max-w-3xl space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Career Hub • Real-time Multi-Dimensional Placement Readiness</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight leading-snug">
              {userProfile?.name ? `Welcome back, ${userProfile.name}` : "Candidate Career Hub"}
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Your comprehensive placement command center for engineering placement readiness, gap analysis, and target benchmarks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {hasTarget ? (
              <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-zinc-500 font-mono">TARGET:</span>
                <span className="font-semibold text-zinc-200 font-mono">
                  {userProfile.targetCompany || "Any"} / {userProfile.targetJobRole || "Developer"}
                </span>
                <Link to="/app/profile" className="text-zinc-500 hover:text-white ml-1 text-[11px] underline font-mono">
                  Edit
                </Link>
              </div>
            ) : (
              <Link
                to="/app/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg font-mono"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Configure Target</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleStartAuditModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium font-mono transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Readiness</span>
            </button>
          </div>
        </header>

        {/* Readiness Overview Hero Banner */}
        <section className="gsap-reveal rounded-2xl bg-gradient-to-br from-[#121215] via-[#15151a] to-zinc-900/40 border border-zinc-800/90 p-6 md:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Overall Placement Readiness
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium font-mono border ${getStatusBadge(
                    readiness?.overallStatus?.key
                  )}`}
                >
                  {readiness?.overallStatus?.label || "Competitive Candidate"}
                </span>
                {readiness?.explainability?.isReNormalized && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                    {readiness.activeWeightCoverage}% Weight Coverage
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold font-mono text-zinc-100 tracking-tight">
                  {readiness?.overallScore !== null && readiness?.overallScore !== undefined ? readiness.overallScore : 82}
                </span>
                <span className="text-lg font-mono text-zinc-500">/ 100</span>

                <div className="hidden sm:flex flex-col text-xs text-zinc-400 pl-4 border-l border-zinc-800 space-y-0.5 font-mono">
                  <div>
                    Benchmark Bar: <span className="text-zinc-200">{readiness?.targetScore || 85} / 100</span>
                  </div>
                  <div>
                    Net Delta:{" "}
                    <span className={(readiness?.overallGap || 0) > 0 ? "text-amber-400" : "text-emerald-400"}>
                      {(readiness?.overallGap || 0) > 0 ? `-${readiness.overallGap} pts to benchmark` : "Benchmark Met (+0)"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                {readiness?.overallStatus?.description ||
                  `Composite placement evaluation calculated for ${userProfile?.targetCompany || "Tier-1 Tech"} ${userProfile?.targetJobRole || "Software Engineer"}.`}
              </p>
            </div>

            {/* Quick Action Matrix & Breakdown Toggle */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2 bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl text-xs font-mono">
                <div className="text-center p-1">
                  <span className="text-zinc-500 text-[10px] block">Score</span>
                  <span className={`font-bold ${getScoreColor(readiness?.overallScore || 82)}`}>
                    {readiness?.overallScore || 82}
                  </span>
                </div>
                <div className="text-center p-1 border-l border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Target</span>
                  <span className="font-bold text-zinc-300">{readiness?.targetScore || 85}</span>
                </div>
                <div className="text-center p-1 border-l border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Coverage</span>
                  <span className="font-bold text-purple-400">{readiness?.activeWeightCoverage || 85}%</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExplainModal(!showExplainModal)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors border border-zinc-800 font-mono cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>{showExplainModal ? "Hide Methodology" : "View Scoring Methodology"}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
            <div className="flex justify-between text-[11px] font-mono text-zinc-500">
              <span>Current Score: {readiness?.overallScore || 82}%</span>
              <span>Target Benchmark: {readiness?.targetScore || 85}%</span>
            </div>
            <div className="relative w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-zinc-300 z-10"
                style={{ left: `${readiness?.targetScore || 85}%` }}
                title={`Target Benchmark: ${readiness?.targetScore || 85}%`}
              />
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressBarBg(
                  readiness?.overallScore || 82
                )}`}
                style={{ width: `${Math.min(100, Math.max(0, readiness?.overallScore || 82))}%` }}
              />
            </div>
          </div>
        </section>

        {/* Explainability Breakdown (Collapsible) */}
        {showExplainModal && readiness && (
          <section className="gsap-reveal rounded-2xl bg-[#141417] border border-zinc-800 p-5 md:p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Info className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Scoring Engine Methodology</h3>
                  <p className="text-[11px] text-zinc-500">
                    Dynamically re-normalized weighted average formula across 7 dimensions
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExplainModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-zinc-800 space-y-2 font-mono text-xs text-zinc-300">
              <div className="text-zinc-400 text-[11px] uppercase tracking-wider">Formula:</div>
              <div className="bg-[#0c0c0e] p-2.5 rounded-lg text-zinc-200 text-center font-bold text-xs overflow-x-auto">
                Weighted Score = Σ(AvailableScore_i × Weight_i) / Σ(AvailableWeight_i)
              </div>
              <p className="text-zinc-400 font-sans text-xs pt-1">
                {readiness.explainability?.explanation}
              </p>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 2. YOUR NEXT MOVE (HIGH-IMPACT ACTION BANNER) */}
        {/* ========================================================================= */}
        <section className="gsap-reveal">
          <WhatToDoNext userProfile={userProfile} readinessScore={readiness?.overallScore} />
        </section>

        {/* ========================================================================= */}
        {/* 3. QUICK INTELLIGENCE / GLOBAL TOOLS ROW (7 SHORTCUTS) */}
        {/* ========================================================================= */}
        <section className="gsap-reveal space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">
              Global Platform Tools & Accelerators
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">Direct Quick Actions</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <Link
              to="/app/profile"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-purple-400">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Profile & Target</span>
              <span className="text-[10px] text-zinc-500 font-mono">Recruiter View</span>
            </Link>

            <Link
              to="/app/coach"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-purple-400">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">AI Career Coach</span>
              <span className="text-[10px] text-zinc-500 font-mono">What-If Simulator</span>
            </Link>

            <Link
              to="/app/arena"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-400">
                <Swords className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Placement Arena</span>
              <span className="text-[10px] text-zinc-500 font-mono">1v1 Battles</span>
            </Link>

            <Link
              to="/app/roadmap"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400">
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Tech Roadmap</span>
              <span className="text-[10px] text-zinc-500 font-mono">Weekly Milestones</span>
            </Link>

            <Link
              to="/app/library"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-sky-400">
                <BookOpen className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Study Library</span>
              <span className="text-[10px] text-zinc-500 font-mono">Curated Notes</span>
            </Link>

            <Link
              to="/app/job"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400">
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Job Matching</span>
              <span className="text-[10px] text-zinc-500 font-mono">Live Drives</span>
            </Link>

            <Link
              to="/app/academics"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-pink-400">
                <GraduationCap className="w-4 h-4 text-pink-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Academics / VTOP</span>
              <span className="text-[10px] text-zinc-500 font-mono">CGPA Sync</span>
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. GAP ANALYSIS & BENCHMARK COMPARISON TABLES */}
        {/* ========================================================================= */}
        <section className="gsap-reveal space-y-6">
          <LevelComparisonTable
            gapData={gapData}
            loading={loading}
            targetCompany={userProfile?.targetCompany}
            targetJobRole={userProfile?.targetJobRole}
          />
        </section>

        {/* DSA Readiness vs Target Benchmark */}
        <section className="gsap-reveal space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h2 className="text-base md:text-lg font-semibold text-zinc-100 tracking-tight">
                DSA Readiness vs Target Company Benchmark
              </h2>
            </div>
            <Link
              to="/app/coding?tab=topics"
              className="text-xs text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1 hover:underline"
            >
              <span>Full DSA Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DsaRequirementComparison
            targetCompany={userProfile?.targetCompany}
            targetJobRole={userProfile?.targetJobRole}
          />
        </section>

        {/* DSA Topic Proficiency */}
        <section className="gsap-reveal space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-base md:text-lg font-semibold text-zinc-100 tracking-tight">
                DSA Topic Proficiency & Gap Analysis
              </h2>
            </div>
            <Link
              to="/app/coding?tab=topics"
              className="text-xs text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1 hover:underline"
            >
              <span>Topic Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DsaTopicAnalysis
            targetCompany={userProfile?.targetCompany}
            targetJobRole={userProfile?.targetJobRole}
          />
        </section>

        {/* ========================================================================= */}
        {/* 5. PROGRESS & VELOCITY SUMMARY */}
        {/* ========================================================================= */}
        <section className="gsap-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            title="Resume ATS Score"
            value={`${resumeScore}%`}
            subtitle="ATS Target: 85%"
          />
          <StatCard
            title="Projects Portfolio"
            value={
              githubProfile
                ? `${githubProfile.originalReposCount || 0} Repos`
                : `${devScore}%`
            }
            subtitle={
              githubProfile
                ? `${githubProfile.totalStars || 0} Stars ⭐`
                : "15% Weight"
            }
          />
          <StatCard
            title="Past Interview Score"
            value={`${interviewScore}%`}
            subtitle="Avg Communication"
          />
          <StatCard
            title="Active Coverage"
            value={`${readiness?.activeWeightCoverage || 85}%`}
            subtitle="Framework Metrics"
          />
        </section>

      </div>

      {/* ========================================================================= */}
      {/* ONBOARDING PROFILE ANALYSIS TRANSITION MODAL */}
      {/* ========================================================================= */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Multi-Pillar Placement Audit
              </h3>
              <p className="text-xs text-zinc-400">
                Calibrating placement readiness model against {userProfile?.targetCompany || "Enterprise"} standards.
              </p>
            </div>

            {/* Timed Step Sequence */}
            <div className="space-y-3 font-mono text-xs">
              {[
                { step: 1, label: "Syncing Academics & CGPA eligibility cutoffs" },
                { step: 2, label: "Evaluating GitHub codebases & engineering depth" },
                { step: 3, label: "Scanning LeetCode problem-solving benchmarks" },
                { step: 4, label: "Auditing Resume ATS format, keywords & Google XYZ metrics" },
                { step: 5, label: "Synthesizing multi-dimensional readiness score" },
              ].map(({ step, label }) => {
                const isPassed = auditStep > step || auditCompleted;
                const isCurrent = auditStep === step && !auditCompleted;

                return (
                  <div
                    key={step}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isPassed
                        ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
                        : isCurrent
                        ? "bg-purple-950/40 border-purple-800/60 text-purple-200"
                        : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                      )}
                      <span className="font-sans text-xs">{label}</span>
                    </div>
                    <span className="text-[10px] opacity-75 font-mono">
                      {isPassed ? "DONE" : isCurrent ? "SCANNING..." : "QUEUED"}
                    </span>
                  </div>
                );
              })}
            </div>

            {auditCompleted && (
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 font-mono">
                  <span className="text-xs text-zinc-400">Calculated Readiness:</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {readiness?.overallScore || 82} / 100 ({readiness?.overallStatus?.label || "Competitive"})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAuditModal(false);
                    setSearchParams({}, { replace: true });
                  }}
                  className="w-full py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer font-sans"
                >
                  Enter Career Hub Command Center
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-xl space-y-1 transition-colors">
      <h3 className="text-xs font-medium text-zinc-400">{title}</h3>
      <p className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">{value}</p>
      {subtitle && <p className="text-[11px] text-zinc-500 font-mono">{subtitle}</p>}
    </div>
  );
}