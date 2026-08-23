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
  Upload,
} from "lucide-react";
import { NODE_API_URL, PY_API_URL } from "@/config/api";
import LevelComparisonTable from "@/components/ui/LevelComparisonTable";
import DsaTopicAnalysis from "@/components/dsa/DsaTopicAnalysis";
import DsaRequirementComparison from "@/components/dsa/DsaRequirementComparison";
import WhatToDoNext from "@/components/dashboard/WhatToDoNext";
import {
  getHeroHeadline,
  getReadinessTier,
  getReadinessCTA,
  formatLevelComparison,
  getGapStatusInfo,
} from "@/utils/dynamicCopy";

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

  // Multi-Pillar Placement Audit Modal State
  const [showAuditModal, setShowAuditModal] = useState(isOnboardingAudit);
  const [auditStep, setAuditStep] = useState(1);
  const [auditCompleted, setAuditCompleted] = useState(false);
  const [auditResumeUploading, setAuditResumeUploading] = useState(false);
  const [auditResumeError, setAuditResumeError] = useState("");
  const auditIntervalRef = useRef(null);
  const hasAutoStartedRef = useRef(false);

  const containerRef = useRef(null);

  const handleAuditResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuditResumeUploading(true);
    setAuditResumeError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_description", userProfile?.targetJobRole || "");

      const pyRes = await axios.post(`${PY_API_URL}/api/resume/analyze-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const analysisResult = pyRes.data?.evaluation || pyRes.data?.data || pyRes.data;
      const extractedText = pyRes.data?.extracted_text || analysisResult?.extracted_text || "";

      await axios.post(
        `${NODE_API_URL}/api/coach/save-resume-analysis`,
        {
          resumeScore: analysisResult.ats_score,
          resumeText: extractedText,
          resumeAnalysis: analysisResult,
          filename: file.name,
        },
        { withCredentials: true }
      );

      fetchData(true);
    } catch (err) {
      console.error("Failed to upload/analyze resume during audit:", err);
      setAuditResumeError(err.response?.data?.detail || "Failed to analyze resume with Google GENAI");
    } finally {
      setAuditResumeUploading(false);
    }
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
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

  const clearAuditInterval = () => {
    if (auditIntervalRef.current) {
      clearInterval(auditIntervalRef.current);
      auditIntervalRef.current = null;
    }
  };

  // Run the 5-step Multi-Pillar Placement Audit sequence
  const handleStartAuditModal = () => {
    clearAuditInterval();
    setShowAuditModal(true);
    setAuditStep(1);
    setAuditCompleted(false);

    // Refresh data in background while audit is running
    fetchData(true);

    auditIntervalRef.current = setInterval(() => {
      setAuditStep((prev) => {
        if (prev >= 5) {
          clearAuditInterval();
          setAuditCompleted(true);
          return 5;
        }
        return prev + 1;
      });
    }, 700);
  };

  // Fast-forward / Skip audit animation
  const handleSkipAudit = () => {
    clearAuditInterval();
    setAuditStep(5);
    setAuditCompleted(true);
  };

  // Close audit modal and clean up search params
  const handleCloseAuditModal = () => {
    clearAuditInterval();
    setShowAuditModal(false);
    if (searchParams.get("onboarding") || searchParams.get("audit")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("onboarding");
      newParams.delete("audit");
      setSearchParams(newParams, { replace: true });
    }
  };

  // Auto-start audit when landing with onboarding=complete or audit=start
  useEffect(() => {
    if (isOnboardingAudit && !auditCompleted && !auditIntervalRef.current) {
      hasAutoStartedRef.current = true;
      handleStartAuditModal();
    }
  }, [isOnboardingAudit, auditCompleted]);

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      clearAuditInterval();
    };
  }, []);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showAuditModal) {
        handleCloseAuditModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAuditModal]);

  const hasTarget = Boolean(userProfile?.targetCompany || userProfile?.targetJobRole);
  const isFullTarget = Boolean(userProfile?.targetCompany && userProfile?.targetJobRole);

  const getStatusBadge = (statusKey) => {
    switch (statusKey) {
      case "highly_ready":
      case "interview_ready":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "developing":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "needs_major_improvement":
      case "needs_improvement":
      case "not_ready":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "text-zinc-500";
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getProgressBarBg = (score) => {
    if (score === null || score === undefined) return "bg-zinc-800";
    if (score >= 80) return "bg-emerald-400";
    if (score >= 60) return "bg-amber-400";
    return "bg-rose-400";
  };

  const dimensionsList = readiness?.dimensions ? Object.values(readiness.dimensions) : [];

  // Pillar 1: Coding Stats
  const codingScore = readiness?.dimensions?.dsa?.score !== null && readiness?.dimensions?.dsa?.score !== undefined
    ? readiness.dimensions.dsa.score
    : null;
  const codingTarget = readiness?.dimensions?.dsa?.requiredScore ?? null;

  // Pillar 2: Development Stats
  const devScore = githubProfile?.projectScore ?? (readiness?.dimensions?.projects?.score !== null && readiness?.dimensions?.projects?.score !== undefined ? readiness.dimensions.projects.score : null);
  const devTarget = readiness?.dimensions?.projects?.requiredScore ?? null;

  // Pillar 3: Resume Stats
  const resumeScore = userProfile?.resumeScore ?? (readiness?.dimensions?.resume?.score !== null && readiness?.dimensions?.resume?.score !== undefined ? readiness.dimensions.resume.score : null);
  const resumeTarget = readiness?.dimensions?.resume?.requiredScore ?? null;

  // Pillar 4: Interview Stats
  const interviewScore = readiness?.dimensions?.communication?.score !== null && readiness?.dimensions?.communication?.score !== undefined
    ? readiness.dimensions.communication.score
    : null;
  const interviewTarget = readiness?.dimensions?.communication?.requiredScore ?? null;

  // Level-aware Dynamic Copy Generation
  const heroData = useMemo(() => {
    return getHeroHeadline({
      readinessScore: readiness?.overallScore,
      targetCompany: userProfile?.targetCompany,
      targetRole: userProfile?.targetJobRole,
      biggestGap: readiness?.biggestGap || gapData?.summary?.topGapName,
      strongestSkill: readiness?.strongestSkill || userProfile?.topSkills?.[0],
      recentProgress: readiness?.recentProgress,
      userName: userProfile?.name,
    });
  }, [readiness, userProfile, gapData]);

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 lg:p-10 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION & CANDIDATE CAREER COMMAND CENTER */}
        {/* ========================================================================= */}
        <header className="gsap-reveal flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-300 font-medium">
                {userProfile?.targetCompany
                  ? `${userProfile.targetCompany} · ${userProfile?.targetJobRole || "Software Engineer"}`
                  : userProfile?.targetJobRole
                  ? `${userProfile.targetJobRole} Track`
                  : "Benchmark Track"}
              </span>
              <span className="text-zinc-700">|</span>
              <span className="text-zinc-500 font-normal">Active Calibration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight leading-snug">
              {heroData.title}
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {heroData.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            {/* Target Role Selector Pill */}
            <Link
              to="/app/profile"
              className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-mono transition-all duration-200 shadow-sm h-[40px]"
              title="Configure your target role and company benchmarks"
            >
              <div className="w-5 h-5 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-purple-400 transition-colors">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 leading-none">Target Goal</span>
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white leading-tight truncate max-w-[140px] sm:max-w-[180px]">
                  {userProfile?.targetCompany
                    ? `${userProfile.targetCompany} / ${userProfile?.targetJobRole || "Developer"}`
                    : userProfile?.targetJobRole || "Set Target"}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all ml-0.5" />
            </Link>

            {/* Role Fit Action */}
            <Link
              to="/app/role-fit"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-medium transition-all duration-200 shadow-sm h-[40px]"
            >
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span>Role Fit</span>
            </Link>

            {/* Audit Readiness Primary CTA */}
            <button
              type="button"
              onClick={handleStartAuditModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-[0.98] h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-950" />
              <span>Audit Readiness</span>
            </button>
          </div>
        </header>

        {/* Readiness Overview Hero Banner */}
        <section className="gsap-reveal rounded-2xl bg-[#121215] border border-zinc-800 p-6 md:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Placement Readiness
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium font-mono border ${heroData.badgeClass}`}
                >
                  {heroData.tierLabel}
                </span>
                {readiness?.explainability?.isReNormalized && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                    {readiness.activeWeightCoverage}% Weight Coverage
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className={`text-4xl md:text-5xl font-bold font-mono tracking-tight ${heroData.scoreColor}`}>
                  {readiness?.overallScore !== null && readiness?.overallScore !== undefined ? readiness.overallScore : "Unassessed"}
                </span>
                {readiness?.overallScore !== null && readiness?.overallScore !== undefined && (
                  <span className="text-lg font-mono text-zinc-500">/ 100</span>
                )}

                <div className="hidden sm:flex flex-col text-xs text-zinc-400 pl-4 border-l border-zinc-800 space-y-0.5 font-mono">
                  <div>
                    Target Benchmark: <span className="text-zinc-200">{readiness?.targetScore !== null && readiness?.targetScore !== undefined ? `${readiness.targetScore} / 100` : "Unassessed"}</span>
                  </div>
                  <div>
                    Delta:{" "}
                    <span className={readiness?.overallGap !== null && readiness?.overallGap !== undefined && readiness.overallGap > 0 ? "text-amber-400" : "text-emerald-400"}>
                      {readiness?.overallGap !== null && readiness?.overallGap !== undefined
                        ? readiness.overallGap > 0
                          ? `-${readiness.overallGap} pts to benchmark`
                          : "Benchmark Met (+0)"
                        : "Unassessed"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 max-w-xl text-xs text-zinc-300">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans">{heroData.mentorNote}</p>
              </div>
            </div>

            {/* Quick Action Matrix & Level-Based Primary CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs font-mono">
                <div className="text-center p-1">
                  <span className="text-zinc-500 text-[10px] block">Score</span>
                  <span className={`font-bold ${heroData.scoreColor}`}>
                    {readiness?.overallScore !== null && readiness?.overallScore !== undefined ? readiness.overallScore : "Unassessed"}
                  </span>
                </div>
                <div className="text-center p-1 border-l border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Target</span>
                  <span className="font-bold text-zinc-300">
                    {readiness?.targetScore !== null && readiness?.targetScore !== undefined ? readiness.targetScore : "N/A"}
                  </span>
                </div>
                <div className="text-center p-1 border-l border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Coverage</span>
                  <span className="font-bold text-purple-400">
                    {readiness?.activeWeightCoverage !== null && readiness?.activeWeightCoverage !== undefined ? `${readiness.activeWeightCoverage}%` : "Unassessed"}
                  </span>
                </div>
              </div>

              <Link
                to={heroData.ctaLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors font-mono"
              >
                <span>{heroData.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setShowExplainModal(!showExplainModal)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors border border-zinc-800 font-mono cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>{showExplainModal ? "Hide Methodology" : "Methodology"}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
            <div className="flex justify-between text-[11px] font-mono text-zinc-500">
              <span>Current Score: {readiness?.overallScore !== null && readiness?.overallScore !== undefined ? `${readiness.overallScore}%` : "Unassessed"}</span>
              <span>Target Benchmark: {readiness?.targetScore !== null && readiness?.targetScore !== undefined ? `${readiness.targetScore}%` : "N/A"}</span>
            </div>
            <div className="relative w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
              {readiness?.targetScore !== null && readiness?.targetScore !== undefined && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-zinc-300 z-10"
                  style={{ left: `${readiness.targetScore}%` }}
                  title={`Target Benchmark: ${readiness.targetScore}%`}
                />
              )}
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressBarBg(
                  readiness?.overallScore
                )}`}
                style={{ width: `${Math.min(100, Math.max(0, readiness?.overallScore || 0))}%` }}
              />
            </div>
          </div>
        </section>

        {/* Explainability Breakdown (Collapsible) */}
        {showExplainModal && readiness && (
          <section className="gsap-reveal rounded-2xl bg-[#121215] border border-zinc-800 p-5 md:p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Info className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Scoring Methodology</h3>
                  <p className="text-[11px] text-zinc-500">
                    Weighted average across assessed readiness dimensions
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

            <div className="bg-zinc-900 rounded-xl p-3.5 border border-zinc-800 space-y-2 font-mono text-xs text-zinc-300">
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
        {/* 2. TOP 3 CRITICAL GAPS & FAST-CLOSURE MATRIX */}
        {/* ========================================================================= */}
        {readiness?.topGaps && readiness.topGaps.length > 0 && (
          <section className="gsap-reveal space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest font-mono">
                  Priority Gaps
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Highest impact on benchmark score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {readiness.topGaps.slice(0, 3).map((gapItem, gIdx) => {
                const IconComp = DIMENSION_ICONS[gapItem.id] || Zap;
                const isUnassessed = gapItem.score === null || gapItem.score === undefined;
                const currentScore = isUnassessed ? 0 : gapItem.score;
                const requiredScore = gapItem.requiredScore || 75;
                const gapPoints = Math.max(0, requiredScore - currentScore);

                return (
                  <div
                    key={gapItem.id || gIdx}
                    className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 group-hover:text-purple-300">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span>{gapItem.fullName || gapItem.name}</span>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            gapPoints > 15
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold"
                              : gapPoints > 0
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {isUnassessed ? "Unstarted" : `-${gapPoints} pts`}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 font-mono">
                        <span className="text-2xl font-bold text-zinc-100">
                          {isUnassessed ? "—" : `${currentScore}%`}
                        </span>
                        <span className="text-xs text-zinc-500">/ Target {requiredScore}%</span>
                      </div>

                      {/* Compact Progress Bar */}
                      <div className="relative w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(5, (currentScore / requiredScore) * 100))}%`,
                          }}
                        />
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-1 leading-normal font-sans">
                        {gapItem.recommendation || `Close ${gapPoints} pt gap to meet benchmark.`}
                      </p>
                    </div>

                    <Link
                      to={gapItem.actionLink || "/app/roadmap"}
                      className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 hover:text-white font-mono transition-colors"
                    >
                      <span>{gapItem.actionLabel || "Close Gap"}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. YOUR NEXT MOVE (HIGH-IMPACT ACTION BANNER) */}
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
              Platform Navigation
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">Direct shortcuts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <Link
              to="/app/role-fit"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-purple-400 transition-colors">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Role Fit</span>
              <span className="text-[10px] text-zinc-500 font-mono">Assessment</span>
            </Link>

            <Link
              to="/app/profile"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Profile</span>
              <span className="text-[10px] text-zinc-500 font-mono">Target Settings</span>
            </Link>

            <Link
              to="/app/coach"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-purple-400 transition-colors">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Career Coach</span>
              <span className="text-[10px] text-zinc-500 font-mono">Advisory</span>
            </Link>

            <Link
              to="/app/arena"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-colors">
                <Swords className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Coding Arena</span>
              <span className="text-[10px] text-zinc-500 font-mono">Practice</span>
            </Link>

            <Link
              to="/app/roadmap"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Roadmap</span>
              <span className="text-[10px] text-zinc-500 font-mono">Milestones</span>
            </Link>

            <Link
              to="/app/job"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                <Briefcase className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Job Matching</span>
              <span className="text-[10px] text-zinc-500 font-mono">Openings</span>
            </Link>

            <Link
              to="/app/can-i-apply"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Eligibility</span>
              <span className="text-[10px] text-zinc-500 font-mono">Criteria Check</span>
            </Link>

            <Link
              to="/app/academics"
              className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                <GraduationCap className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Academics</span>
              <span className="text-[10px] text-zinc-500 font-mono">VTOP Sync</span>
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
              to="/app/coding"
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
            value={resumeScore !== null && resumeScore !== undefined ? `${resumeScore}%` : "Unassessed"}
            subtitle={resumeTarget !== null ? `ATS Target: ${resumeTarget}%` : "Upload Resume PDF"}
          />
          <StatCard
            title="Projects Portfolio"
            value={
              githubProfile
                ? `${githubProfile.originalReposCount || 0} Repos`
                : (devScore !== null ? `${devScore}%` : "Unassessed")
            }
            subtitle={
              githubProfile
                ? `${githubProfile.totalStars || 0} Stars`
                : "Connect GitHub"
            }
          />
          <StatCard
            title="Past Interview Score"
            value={interviewScore !== null ? `${interviewScore}%` : "Unassessed"}
            subtitle="Avg Communication"
          />
          <StatCard
            title="Active Coverage"
            value={readiness?.activeWeightCoverage !== null && readiness?.activeWeightCoverage !== undefined ? `${readiness.activeWeightCoverage}%` : "Unassessed"}
            subtitle="Framework Metrics"
          />
        </section>

      </div>

      {/* ========================================================================= */}
      {/* ONBOARDING / MULTI-PILLAR PLACEMENT AUDIT TRANSITION MODAL */}
      {/* ========================================================================= */}
      {showAuditModal && (
        <div
          onClick={handleCloseAuditModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between relative">
              <div className="space-y-1 pr-6">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Multi-Pillar Placement Audit
                </h3>
                <p className="text-xs text-zinc-400">
                  Calibrating readiness against{" "}
                  <span className="text-zinc-200 font-medium">
                    {userProfile?.targetCompany || "Benchmark"}
                    {userProfile?.targetJobRole ? ` (${userProfile.targetJobRole})` : ""}
                  </span>{" "}
                  standards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseAuditModal}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close modal (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>
                  {auditCompleted
                    ? "Audit Complete (100%)"
                    : `Pillar ${auditStep} of 5 (${Math.round((auditStep / 5) * 100)}%)`}
                </span>
                <span className={auditCompleted ? "text-emerald-400" : "text-purple-400"}>
                  {auditCompleted ? "100%" : `${Math.round((auditStep / 5) * 100)}%`}
                </span>
              </div>
              <div className="relative w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    auditCompleted ? "bg-emerald-400" : "bg-purple-500"
                  }`}
                  style={{ width: `${auditCompleted ? 100 : (auditStep / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Timed Step Sequence (5 Core Pillars) */}
            <div className="space-y-2 font-mono text-xs">
              {[
                {
                  step: 1,
                  title: "Academics & CGPA",
                  label: "Academics and grade eligibility cutoffs",
                  icon: GraduationCap,
                  detail: userProfile?.cgpa
                    ? `CGPA: ${userProfile.cgpa} · Verified`
                    : "Evaluating academic grade benchmarks",
                },
                {
                  step: 2,
                  title: "GitHub & Code Quality",
                  label: "GitHub repository and code analysis",
                  icon: FolderGit2,
                  detail: githubProfile
                    ? `${githubProfile.originalReposCount || 0} Repos · ${githubProfile.totalStars || 0} Stars`
                    : "Analyzing commit frequency & architecture",
                },
                {
                  step: 3,
                  title: "DSA Benchmarks",
                  label: "DSA and problem-solving benchmarks",
                  icon: Code2,
                  detail: "DSA patterns, algorithms & topic readiness",
                },
                {
                  step: 4,
                  title: "Resume ATS",
                  label: "Resume ATS and keyword analysis",
                  icon: FileText,
                  detail: userProfile?.resumeScore !== null && userProfile?.resumeScore !== undefined
                    ? `ATS Score: ${userProfile.resumeScore}/100 · ${userProfile?.resumeAnalysis?.bullet_improvements?.length || 0} bullets quantified`
                    : "Upload PDF to evaluate ATS score and keywords",
                },
                {
                  step: 5,
                  title: "Composite Synthesis",
                  label: `Synthesizing ${userProfile?.targetCompany || "target"} readiness score`,
                  icon: BrainCog,
                  detail: "Weighted multi-dimension evaluation model",
                },
              ].map(({ step, label, detail }) => {
                const isPassed = auditStep > step || auditCompleted;
                const isCurrent = auditStep === step && !auditCompleted;

                return (
                  <div key={step} className="space-y-1.5">
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                        isPassed
                          ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                          : isCurrent
                          ? "bg-zinc-900 border-purple-500/50 text-zinc-200"
                          : "bg-zinc-950/60 border-zinc-900 text-zinc-500"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-700 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-sans text-xs font-medium truncate">{label}</div>
                          <div className="text-[10px] text-zinc-500 font-mono truncate">{detail}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                          isPassed
                            ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
                            : isCurrent
                            ? "bg-purple-950 text-purple-300 border border-purple-800/40"
                            : "bg-zinc-900 text-zinc-600 border border-zinc-800/40"
                        }`}
                      >
                        {isPassed ? "DONE" : isCurrent ? "SCANNING" : "QUEUED"}
                      </span>
                    </div>

                    {step === 4 && (isCurrent || isPassed) && (
                      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            Resume ATS Audit
                          </span>
                          {userProfile?.resumeScore !== null && userProfile?.resumeScore !== undefined ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-emerald-400 text-[10px] font-bold">
                              ATS: {userProfile.resumeScore}/100
                            </span>
                          ) : (
                            <label className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-[10px] font-semibold cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                              <Upload className="w-3 h-3" />
                              <span>{auditResumeUploading ? "Analyzing..." : "Upload Resume"}</span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleAuditResumeUpload}
                                disabled={auditResumeUploading}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {userProfile?.resumeAnalysis && (
                          <div className="space-y-1 text-[11px] text-zinc-300">
                            {userProfile.resumeAnalysis.matched_keywords?.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-zinc-500">Keywords:</span>
                                {userProfile.resumeAnalysis.matched_keywords.slice(0, 5).map((k, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300">
                                    {typeof k === "string" ? k : k.keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                            {userProfile.resumeAnalysis.bullet_improvements?.length > 0 && (
                              <p className="text-[10px] text-zinc-400">
                                Quantified Bullets: {userProfile.resumeAnalysis.bullet_improvements.length} points verified
                              </p>
                            )}
                          </div>
                        )}
                        {auditResumeError && <p className="text-[10px] text-rose-400">{auditResumeError}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Skip option during active scan */}
            {!auditCompleted && (
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                <span className="text-[11px] text-zinc-500 font-mono">
                  Synthesizing audit...
                </span>
                <button
                  type="button"
                  onClick={handleSkipAudit}
                  className="text-xs text-zinc-400 hover:text-zinc-200 font-mono underline transition-colors cursor-pointer"
                >
                  Skip to Results
                </button>
              </div>
            )}

            {/* Completed Results Summary Card */}
            {auditCompleted && (
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                        Composite Readiness
                      </span>
                      <span className="text-xl font-bold text-zinc-100">
                        {readiness?.overallScore !== null && readiness?.overallScore !== undefined
                          ? readiness.overallScore
                          : "Pending"}{" "}
                        {readiness?.overallScore !== null && readiness?.overallScore !== undefined && (
                          <span className="text-xs text-zinc-500 font-normal">/ 100</span>
                        )}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-medium border ${getStatusBadge(
                        readiness?.overallStatus?.key
                      )}`}
                    >
                      {readiness?.overallStatus?.label || "Evaluated"}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800 text-[10px] text-center">
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 block">DSA</span>
                      <span className="font-bold text-zinc-200">{codingScore !== null ? `${codingScore}%` : "—"}</span>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 block">Projects</span>
                      <span className="font-bold text-zinc-200">{devScore !== null ? `${devScore}%` : "—"}</span>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 block">Resume</span>
                      <span className="font-bold text-zinc-200">{resumeScore !== null ? `${resumeScore}%` : "—"}</span>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="text-zinc-500 block">Target Bar</span>
                      <span className="font-bold text-zinc-200">
                        {readiness?.targetScore ? `${readiness.targetScore}%` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseAuditModal}
                    className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer font-sans"
                  >
                    Enter Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={handleStartAuditModal}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title="Re-run Audit"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
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
    <div className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 p-4 rounded-xl space-y-1 transition-colors">
      <h3 className="text-xs font-medium text-zinc-400">{title}</h3>
      <p className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">{value}</p>
      {subtitle && <p className="text-[11px] text-zinc-500 font-mono">{subtitle}</p>}
    </div>
  );
}