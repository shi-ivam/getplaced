import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
  const [userProfile, setUserProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExplainModal, setShowExplainModal] = useState(false);

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
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
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
    if (score >= 40) return "text-rose-400";
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

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-200 p-4 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight">
            {userProfile?.name ? userProfile.name : "Candidate Overview"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Placement milestones, active target alignment, and readiness evaluation.
          </p>
        </div>

        {hasTarget && (
          <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-md text-xs">
            <Target className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500 font-mono">TARGET:</span>
            <span className="font-medium text-zinc-200 font-mono">
              {userProfile.targetCompany || "Any"} · {userProfile.targetJobRole || "Developer"}
            </span>
          </div>
        )}
      </header>

      {hasTarget ? (
        <section className="rounded-xl bg-[#121215] border border-zinc-800/90 p-5 md:p-6 transition-colors hover:border-zinc-700/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Active Career Target
                  </span>
                  {isFullTarget ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium font-mono">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium font-mono">
                      Partial
                    </span>
                  )}
                </div>

                <div className="text-base md:text-lg font-semibold text-zinc-100 flex flex-wrap items-center gap-2">
                  {userProfile.targetCompany ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-zinc-400" />
                      {userProfile.targetCompany}
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-xs italic">No company selected</span>
                  )}

                  <span className="text-zinc-600">/</span>

                  {userProfile.targetJobRole ? (
                    <span className="inline-flex items-center gap-1.5 text-zinc-300">
                      <Briefcase className="w-4 h-4 text-zinc-400" />
                      {userProfile.targetJobRole}
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-xs italic">No role selected</span>
                  )}
                </div>

                {userProfile.targetCompanyNormalized && userProfile.targetRoleNormalized && (
                  <p className="text-[11px] text-zinc-500 font-mono">
                    ID: {userProfile.targetCompanyNormalized} / {userProfile.targetRoleNormalized}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <Link
                to="/app/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-zinc-100 hover:bg-white text-zinc-950 transition-colors"
              >
                <span>Edit Target</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-xl bg-[#121215] border border-dashed border-zinc-800 p-5 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-zinc-200 text-sm">No Target Configured</h3>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                    Unset
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select target company and role in profile to enable tailored readiness evaluation.
                </p>
              </div>
            </div>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shrink-0"
            >
              <span>Set Target</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Group C High-Impact Recommendation Engine: What Should I Do Next? */}
      <WhatToDoNext userProfile={userProfile} readinessScore={readiness?.overallScore} />

      {!readiness || !readiness.hasSufficientData ? (
        <section className="rounded-xl bg-[#121215] border border-zinc-800/90 p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    Readiness Evaluation
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                    Incomplete Data
                  </span>
                </div>
                <h2 className="text-base md:text-lg font-semibold text-zinc-100">
                  Insufficient data for composite readiness calculation
                </h2>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Academic record (CGPA) and target role parameters are required to compute the 7-dimension placement model.
                </p>
              </div>
            </div>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shrink-0"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="rounded-xl bg-[#121215] border border-zinc-800/90 p-6 md:p-8 space-y-6 transition-colors hover:border-zinc-700/80">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-zinc-400" />
                    Readiness Score
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium font-mono border ${getStatusBadge(
                      readiness.overallStatus?.key
                    )}`}
                  >
                    {readiness.overallStatus?.label || "Developing"}
                  </span>
                  {readiness.explainability?.isReNormalized && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                      {readiness.activeWeightCoverage}% Coverage
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold font-mono text-zinc-100 tracking-tight">
                    {readiness.overallScore !== null ? readiness.overallScore : "—"}
                  </span>
                  <span className="text-lg font-mono text-zinc-500">/ 100</span>

                  <div className="hidden sm:flex flex-col text-xs text-zinc-400 pl-4 border-l border-zinc-800 space-y-0.5 font-mono">
                    <div>
                      Target: <span className="text-zinc-200">{readiness.targetScore}</span>
                    </div>
                    <div>
                      Gap:{" "}
                      <span className={readiness.overallGap > 0 ? "text-amber-400" : "text-emerald-400"}>
                        {readiness.overallGap > 0 ? `-${readiness.overallGap} pts` : "0 pts (Met)"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 max-w-xl">
                  {readiness.overallStatus?.description ||
                    `Calculated for ${readiness.targetCompany} · ${readiness.targetJobRole}.`}
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-4 bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-lg shrink-0 text-xs font-mono">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6">
                  <span className="text-zinc-500 text-[11px]">Score</span>
                  <span className={`font-semibold ${getScoreColor(readiness.overallScore)}`}>
                    {readiness.overallScore}
                  </span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6 border-l lg:border-l-0 lg:border-t border-zinc-800 pl-2 lg:pl-0 lg:pt-1.5">
                  <span className="text-zinc-500 text-[11px]">Benchmark</span>
                  <span className="font-semibold text-zinc-300">{readiness.targetScore}</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6 border-l lg:border-l-0 lg:border-t border-zinc-800 pl-2 lg:pl-0 lg:pt-1.5">
                  <span className="text-zinc-500 text-[11px]">Net Gap</span>
                  <span
                    className={`font-semibold ${
                      readiness.overallGap > 0 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {readiness.overallGap > 0 ? `-${readiness.overallGap}` : "0"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>Current: {readiness.overallScore}%</span>
                <span>Target: {readiness.targetScore}%</span>
              </div>
              <div className="relative w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-zinc-300 z-10"
                  style={{ left: `${readiness.targetScore}%` }}
                  title={`Target: ${readiness.targetScore}%`}
                />
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarBg(
                    readiness.overallScore
                  )}`}
                  style={{ width: `${Math.min(100, Math.max(0, readiness.overallScore || 0))}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Calculated across active categories.</span>
              </div>

              <button
                type="button"
                onClick={() => setShowExplainModal(!showExplainModal)}
                className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white font-medium text-xs cursor-pointer underline underline-offset-4 self-start sm:self-auto transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Calculation breakdown</span>
              </button>
            </div>
          </div>

          {showExplainModal && (
            <div className="rounded-xl bg-[#141417] border border-zinc-800 p-5 md:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Scoring Methodology</h3>
                    <p className="text-[11px] text-zinc-500">
                      Dynamically re-normalized weighted average formula
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExplainModal(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-zinc-900/90 rounded-lg p-3.5 border border-zinc-800 space-y-2 font-mono text-xs text-zinc-300">
                <div className="text-zinc-400 text-[11px] uppercase tracking-wider">Formula:</div>
                <div className="bg-[#0c0c0e] p-2 rounded text-zinc-200 text-center font-bold text-xs overflow-x-auto">
                  Weighted Score = Σ(AvailableScore_i × Weight_i) / Σ(AvailableWeight_i)
                </div>
                <p className="text-zinc-400 font-sans text-xs pt-1">
                  {readiness.explainability?.explanation}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                      <th className="py-2 px-3">Dimension</th>
                      <th className="py-2 px-3">Canonical Weight</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Raw Score</th>
                      <th className="py-2 px-3">Effective Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {dimensionsList.map((dim) => {
                      const Icon = DIMENSION_ICONS[dim.id] || Layers;
                      const isAvailable = dim.dataAvailability === "available";
                      return (
                        <tr key={dim.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-2 px-3 font-medium text-zinc-200 flex items-center gap-2 font-sans">
                            <Icon className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{dim.fullName}</span>
                          </td>
                          <td className="py-2 px-3 text-zinc-400">
                            {dim.canonicalWeightPercent}%
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-block text-[10px] px-2 py-0.2 rounded-full font-medium ${
                                isAvailable
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              }`}
                            >
                              {isAvailable ? "Available" : "Pending"}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold">
                            {dim.score !== null ? (
                              <span className={getScoreColor(dim.score)}>{dim.score} / 100</span>
                            ) : (
                              <span className="text-zinc-500">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-zinc-300">
                            {dim.effectiveWeightPercent > 0
                              ? `${dim.effectiveWeightPercent}%`
                              : "Excluded"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {readiness.topGaps && readiness.topGaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                    Priority Focus Areas
                  </h2>
                </div>
                <span className="text-xs text-zinc-500 font-mono">Top {readiness.topGaps.length} Targets</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {readiness.topGaps.map((gapItem, idx) => {
                  const Icon = DIMENSION_ICONS[gapItem.id] || Target;
                  return (
                    <div
                      key={gapItem.id || idx}
                      className="bg-[#121215] border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Icon className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-xs font-semibold">
                              {gapItem.name}
                            </span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                            {gapItem.weightPercent}% Wt
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {gapItem.recommendation}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-zinc-800/60 font-mono">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 text-[11px]">Benchmark:</span>
                          <span className="text-zinc-200 font-semibold">{gapItem.requiredScore} / 100</span>
                        </div>

                        <Link
                          to={gapItem.actionLink || "/app/profile"}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer font-sans"
                        >
                          <span>{gapItem.actionLabel || "Take Action"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                  Dimension Breakdown
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-mono">7 Framework Dimensions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {dimensionsList.map((dim) => {
                const Icon = DIMENSION_ICONS[dim.id] || Layers;
                const isAvailable = dim.dataAvailability === "available";

                return (
                  <div
                    key={dim.id}
                    className="bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-zinc-200 text-xs">{dim.name}</h3>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {dim.canonicalWeightPercent}% weight
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                            isAvailable
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {isAvailable ? "Active" : "Pending"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between font-mono">
                          <span className="text-[11px] text-zinc-500">Score</span>
                          <span className="text-sm font-semibold">
                            {dim.score !== null ? (
                              <span className={getScoreColor(dim.score)}>{dim.score} / 100</span>
                            ) : (
                              <span className="text-zinc-500 text-xs">Pending</span>
                            )}
                          </span>
                        </div>

                        <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAvailable ? getProgressBarBg(dim.score) : "bg-zinc-800"
                            }`}
                            style={{ width: `${dim.score || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-0.5">
                        <span>Target: {dim.requiredScore}</span>
                        {dim.gap !== null ? (
                          <span className={dim.gap > 0 ? "text-amber-400" : "text-emerald-400"}>
                            Gap: {dim.gap > 0 ? `-${dim.gap}` : "0"}
                          </span>
                        ) : (
                          <span>Gap: —</span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                        {dim.notes || dim.description}
                      </p>
                    </div>

                    <Link
                      to={dim.actionLink || "/app/profile"}
                      className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-md bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
                    >
                      <span>{dim.actionLabel}</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Current Level vs Required Level Gap Analysis Table */}
      <LevelComparisonTable
        gapData={gapData}
        loading={loading}
        targetCompany={userProfile?.targetCompany}
        targetJobRole={userProfile?.targetJobRole}
      />

      {/* DSA Readiness vs Target Company Benchmark */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="text-base md:text-lg font-semibold text-zinc-100 tracking-tight">
              DSA Readiness vs Target Company Benchmark
            </h2>
          </div>
          <Link
            to="/app/dsa"
            className="text-xs text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1 hover:underline"
          >
            <span>Open DSA Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DsaRequirementComparison
          targetCompany={userProfile?.targetCompany}
          targetJobRole={userProfile?.targetJobRole}
        />
      </section>

      {/* DSA Topic-Level Proficiency Analysis Engine */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-base md:text-lg font-semibold text-zinc-100 tracking-tight">
              DSA Topic Proficiency & Gap Analysis
            </h2>
          </div>
          <Link
            to="/app/dsa"
            className="text-xs text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1 hover:underline"
          >
            <span>Full Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DsaTopicAnalysis
          targetCompany={userProfile?.targetCompany}
          targetJobRole={userProfile?.targetJobRole}
        />
      </section>

      {/* GitHub Projects & Portfolio Analysis Engine */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-base md:text-lg font-semibold text-zinc-100 tracking-tight">
              GitHub Projects & Engineering Portfolio
            </h2>
          </div>
          <Link
            to="/app/profile"
            className="text-xs text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1 hover:underline"
          >
            <span>{githubProfile ? "Manage GitHub" : "Connect GitHub"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {githubProfile ? (
          <div className="bg-[#121215] border border-zinc-800/90 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                {githubProfile.avatarUrl ? (
                  <img
                    src={githubProfile.avatarUrl}
                    alt={githubProfile.username}
                    className="w-10 h-10 rounded-lg border border-purple-500/30 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-mono">
                    {githubProfile.username?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {githubProfile.name || githubProfile.username}
                    </span>
                    <a
                      href={githubProfile.profileUrl || `https://github.com/${githubProfile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:underline font-mono"
                    >
                      @{githubProfile.username}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mt-0.5">
                    <span>{githubProfile.originalReposCount || 0} Original Projects</span>
                    <span>·</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400/30" />
                      {githubProfile.totalStars || 0} Stars
                    </span>
                    <span>·</span>
                    <span className="text-sky-400 flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {githubProfile.totalForks || 0} Forks
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">Projects Dimension:</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
                  {githubProfile.projectScore || readiness?.dimensions?.projects?.score || 0} / 100 ({githubProfile.scoreTier || "Active"})
                </span>
              </div>
            </div>

            {/* Top 3 Featured Projects */}
            {githubProfile.topRepositories && githubProfile.topRepositories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {githubProfile.topRepositories.slice(0, 3).map((repo, idx) => (
                  <div
                    key={repo.githubId || idx}
                    className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-3 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-xs text-zinc-200 hover:text-purple-300 truncate font-mono"
                        >
                          {repo.name}
                        </a>
                        <span className="text-amber-400 font-mono text-[11px] flex items-center gap-0.5 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400/20" />
                          {repo.stars || 0}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {repo.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-zinc-500 border-t border-zinc-800/60">
                      <span>{repo.language || "Project"}</span>
                      {repo.hasLiveDemo && repo.liveDemoUrl ? (
                        <a
                          href={repo.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span>Demo</span>
                        </a>
                      ) : (
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:underline"
                        >
                          Code ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#121215] border border-dashed border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 font-mono">
                  Projects Dimension (15% Weight)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                  Pending Connection
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Connect your GitHub profile to showcase real-world repositories, star recognition, and boost your Projects readiness score.
              </p>
            </div>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors shrink-0"
            >
              <span>Connect GitHub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Resume ATS Score"
          value={
            readiness?.dimensions?.resume?.score !== null &&
            readiness?.dimensions?.resume?.score !== undefined
              ? `${readiness.dimensions.resume.score}%`
              : "82%"
          }
          subtitle="ATS Benchmark"
        />
        <StatCard
          title="Projects Portfolio"
          value={
            githubProfile
              ? `${githubProfile.originalReposCount || 0} Repos`
              : readiness?.dimensions?.projects?.score !== null && readiness?.dimensions?.projects?.score !== undefined
              ? `${readiness.dimensions.projects.score}%`
              : "Pending"
          }
          subtitle={
            githubProfile
              ? `${githubProfile.totalStars || 0} Stars ⭐`
              : "15% Dimension Wt"
          }
        />
        <StatCard
          title="Past Interview Score"
          value={
            readiness?.dimensions?.communication?.score !== null &&
            readiness?.dimensions?.communication?.score !== undefined
              ? `${readiness.dimensions.communication.score}%`
              : "74%"
          }
          subtitle="Avg Communication"
        />
        <StatCard
          title="Active Coverage"
          value={`${readiness?.activeWeightCoverage || 30}%`}
          subtitle="Framework Metrics"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121215] border border-zinc-800/90 p-5 rounded-xl col-span-1 md:col-span-2 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-200">
                  AI Mock Interview
                </h2>
              </div>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                Target Aligned
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Interactive technical and behavioral interview sessions configured for {userProfile?.targetCompany || "company"} and {userProfile?.targetJobRole || "role"} criteria.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/app/interview"
              className="bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              <span>Start Mock Interview</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-xs text-zinc-500 font-mono">
              Last score: <span className="text-zinc-300 font-semibold">74%</span>
            </span>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800/90 p-5 rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-200">
                Assessment Schedule
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Tracking upcoming campus drives, assessment rounds, and interview deadlines.
            </p>
          </div>
          <div className="p-3 bg-zinc-900/90 rounded-md border border-zinc-800 text-xs text-zinc-500 font-mono">
            No deadlines scheduled this week.
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121215] border border-zinc-800/90 p-5 rounded-xl col-span-1 md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-200">
              Recommended Preparation Modules
            </h2>
          </div>
          <ul className="space-y-2">
            {[
              { title: "DSA Mastery (Dynamic Programming & Trees)", tag: "High Priority (25%)" },
              { title: "System Design & Scalable Architectures", tag: "Core Skills (20%)" },
              { title: "Company Technical Assessment Prep", tag: "Target Aligned" },
              { title: "Behavioral & HR Mock Interview Bootcamp", tag: "Communication" },
            ].map((course, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-medium text-zinc-300 truncate">{course.title}</span>
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono shrink-0">
                    {course.tag}
                  </span>
                </div>
                <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 font-medium">
                  Enroll
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#121215] border border-zinc-800/90 p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-200">
              Preparation Checklist
            </h2>
          </div>
          <ul className="space-y-2 text-xs text-zinc-300 font-sans">
            <li className="flex items-center gap-2.5 p-2 rounded-md bg-zinc-900/60 border border-zinc-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Candidate Profile & Target</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded-md bg-zinc-900/60 border border-zinc-800/80">
              <Circle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Upload Resume for AI ATS Scoring</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded-md bg-zinc-900/60 border border-zinc-800/80">
              <Circle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Practice 2 Medium LeetCode Problems</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded-md bg-zinc-900/60 border border-zinc-800/80">
              <Circle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Complete 1 Mock AI Interview</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
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