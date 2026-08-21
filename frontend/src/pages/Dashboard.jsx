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
  AlertCircle,
  TrendingUp,
  Award,
  Code2,
  FileText,
  GraduationCap,
  MessageSquare,
  BrainCog,
  FolderGit2,
  Info,
  ChevronRight,
  X,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BarChart3,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

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
  const [loading, setLoading] = useState(true);
  const [showExplainModal, setShowExplainModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user profile and placement readiness concurrently
        const [profileRes, readinessRes] = await Promise.allSettled([
          axios.get(`${NODE_API_URL}/api/users/profile`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/readiness`, { withCredentials: true }),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value?.data) {
          setUserProfile(profileRes.value.data);
        }

        if (readinessRes.status === "fulfilled" && readinessRes.value?.data) {
          setReadiness(readinessRes.value.data);
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

  const getStatusBadge = (statusKey, label) => {
    switch (statusKey) {
      case "highly_ready":
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
      case "interview_ready":
        return "bg-blue-950 text-blue-300 border-blue-800";
      case "developing":
        return "bg-amber-950 text-amber-300 border-amber-800";
      case "needs_major_improvement":
      case "needs_improvement":
        return "bg-orange-950 text-orange-300 border-orange-800";
      case "not_ready":
        return "bg-rose-950 text-rose-300 border-rose-800";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "text-gray-500";
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-blue-400";
    if (score >= 60) return "text-amber-400";
    if (score >= 40) return "text-orange-400";
    return "text-rose-400";
  };

  const getProgressBarGradient = (score) => {
    if (score === null || score === undefined) return "bg-gray-700";
    if (score >= 90) return "bg-gradient-to-r from-emerald-600 to-teal-400";
    if (score >= 75) return "bg-gradient-to-r from-blue-600 to-cyan-400";
    if (score >= 60) return "bg-gradient-to-r from-amber-600 to-yellow-400";
    if (score >= 40) return "bg-gradient-to-r from-orange-600 to-amber-500";
    return "bg-gradient-to-r from-rose-600 to-pink-500";
  };

  const dimensionsList = readiness?.dimensions ? Object.values(readiness.dimensions) : [];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 p-4 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>👋 Welcome{userProfile?.name ? `, ${userProfile.name}` : ""}!</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your placement milestones, active target alignment, and real-time readiness score.
          </p>
        </div>

        {hasTarget && (
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#161616] border border-gray-800 px-3.5 py-1.5 rounded-lg text-xs">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">Target:</span>
            <span className="font-semibold text-white">
              {userProfile.targetCompany || "Any"} — {userProfile.targetJobRole || "Developer"}
            </span>
          </div>
        )}
      </div>

      {/* Active Target Banner */}
      {hasTarget ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#161618] to-indigo-950/50 border border-purple-800/50 p-5 md:p-6 shadow-xl shadow-purple-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    Active Career Target
                  </span>
                  {isFullTarget ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Target Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-medium">
                      Partially Configured
                    </span>
                  )}
                </div>

                <div className="text-lg md:text-xl font-bold text-white flex flex-wrap items-center gap-2">
                  {userProfile.targetCompany ? (
                    <span className="inline-flex items-center gap-1.5 text-white">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      {userProfile.targetCompany}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm font-normal italic">No company selected</span>
                  )}

                  <span className="text-purple-400 font-normal">—</span>

                  {userProfile.targetJobRole ? (
                    <span className="inline-flex items-center gap-1.5 text-purple-200">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      {userProfile.targetJobRole}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm font-normal italic">No role selected</span>
                  )}
                </div>

                {userProfile.targetCompanyNormalized && userProfile.targetRoleNormalized && (
                  <p className="text-xs text-gray-400 font-mono pt-0.5">
                    Target Identifier: <span className="text-purple-300">{userProfile.targetCompanyNormalized}</span> /{" "}
                    <span className="text-indigo-300">{userProfile.targetRoleNormalized}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <Link
                to="/app/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-md shadow-purple-950/40"
              >
                <span>Update Target</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#141414] border border-dashed border-gray-800 p-5 md:p-6 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-800/80 border border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-base">No Target Selected</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 font-medium">
                    Not Set
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Choose a target company and job role in your profile to unlock customized placement readiness scoring.
                </p>
              </div>
            </div>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-md shadow-purple-950/40"
            >
              <span>Choose Target</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* FEATURE #3: OVERALL PLACEMENT READINESS SCORE SURFACE */}
      {!readiness || !readiness.hasSufficientData ? (
        /* Empty / Incomplete State */
        <div className="rounded-2xl bg-gradient-to-br from-[#18181b] to-[#121214] border border-gray-800 p-6 md:p-8 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400 shrink-0">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                    Placement Readiness Estimate
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 font-medium">
                    Insufficient Data
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Not enough data yet — Complete your profile and choose target
                </h2>
                <p className="text-sm text-gray-400 max-w-2xl">
                  To compute your dynamic 7-dimension placement readiness score, we need your academic background (CGPA) and career target.
                </p>
              </div>
            </div>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-950/50 shrink-0"
            >
              <span>Complete Profile & Target</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Real Dynamic Placement Readiness Engine Card */
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161618] via-[#121214] to-[#1a1622] border border-gray-800 p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Score Left Column */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    PLACEMENT READINESS ESTIMATE
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(
                      readiness.overallStatus?.key,
                      readiness.overallStatus?.label
                    )}`}
                  >
                    {readiness.overallStatus?.label || "Developing"}
                  </span>
                  {readiness.explainability?.isReNormalized && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60 font-medium">
                      Re-Normalized ({readiness.activeWeightCoverage}% Active)
                    </span>
                  )}
                </div>

                {/* Main Score Number */}
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
                    {readiness.overallScore !== null ? readiness.overallScore : "—"}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-500">/ 100</div>

                  <div className="hidden sm:flex flex-col text-xs text-gray-400 pl-4 border-l border-gray-800 space-y-0.5">
                    <div>
                      Status: <strong className="text-white">{readiness.overallStatus?.label}</strong>
                    </div>
                    <div>
                      Target: <strong className="text-purple-300">{readiness.targetScore}</strong> | Gap:{" "}
                      <strong className={readiness.overallGap > 0 ? "text-amber-400" : "text-emerald-400"}>
                        {readiness.overallGap} pts
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Score Summary Subtitle */}
                <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
                  {readiness.overallStatus?.description ||
                    `Calculated for ${readiness.targetCompany} — ${readiness.targetJobRole}.`}
                </p>
              </div>

              {/* Score Benchmark Metrics Pill on Right */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 bg-[#18181c] border border-gray-800/90 p-4 rounded-xl shrink-0">
                <div className="flex items-center justify-between gap-6 text-xs">
                  <span className="text-gray-400">Current Score:</span>
                  <span className={`font-bold text-base ${getScoreColor(readiness.overallScore)}`}>
                    {readiness.overallScore} / 100
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6 text-xs border-t border-gray-800 pt-2">
                  <span className="text-gray-400">Target Benchmark:</span>
                  <span className="font-bold text-base text-purple-300">{readiness.targetScore} / 100</span>
                </div>
                <div className="flex items-center justify-between gap-6 text-xs border-t border-gray-800 pt-2">
                  <span className="text-gray-400">Readiness Gap:</span>
                  <span
                    className={`font-bold text-base ${
                      readiness.overallGap > 0 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {readiness.overallGap > 0 ? `-${readiness.overallGap} pts` : "Target Met 🎉"}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Progress Bar & Gauge */}
            <div className="space-y-2 pt-2 border-t border-gray-800/80">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Current Readiness ({readiness.overallScore}%)</span>
                <span className="text-purple-300 font-medium">Target ({readiness.targetScore}%)</span>
              </div>
              <div className="relative w-full bg-gray-800/80 rounded-full h-3.5 overflow-hidden p-0.5">
                {/* Target marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-purple-400 z-10 shadow-[0_0_8px_#a855f7]"
                  style={{ left: `${readiness.targetScore}%` }}
                  title={`Target: ${readiness.targetScore}%`}
                />
                {/* Current Score Fill */}
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getProgressBarGradient(
                    readiness.overallScore
                  )}`}
                  style={{ width: `${Math.min(100, Math.max(0, readiness.overallScore || 0))}%` }}
                />
              </div>
            </div>

            {/* Footer / Explainability Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400 pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Dynamic engine excludes unstarted categories from denominator to avoid artificial penalties.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowExplainModal(!showExplainModal)}
                className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline underline-offset-4 self-start sm:self-auto"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How is this calculated?</span>
              </button>
            </div>
          </div>

          {/* Explainability Accordion / Panel */}
          {showExplainModal && (
            <div className="rounded-2xl bg-[#141416] border border-purple-800/50 p-6 shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">How Placement Readiness is Calculated</h3>
                    <p className="text-xs text-gray-400">
                      Transparent, fair, and dynamically re-normalized scoring formula
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExplainModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mathematical Formula Box */}
              <div className="bg-[#1c1c20] rounded-xl p-4 border border-gray-800 space-y-2 font-mono text-xs text-gray-300">
                <div className="text-purple-400 font-bold">RE-NORMALIZED WEIGHTED AVERAGE FORMULA:</div>
                <div className="bg-black/50 p-2.5 rounded text-indigo-300 text-center font-bold text-sm overflow-x-auto">
                  Weighted Score = Σ(availableCategoryScore × categoryWeight) / Σ(availableCategoryWeights)
                </div>
                <p className="text-gray-400 font-sans text-xs pt-1">
                  {readiness.explainability?.explanation}
                </p>
              </div>

              {/* Breakdown Dimension Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-2.5 px-3">Dimension</th>
                      <th className="py-2.5 px-3">Canonical Weight</th>
                      <th className="py-2.5 px-3">Status / Availability</th>
                      <th className="py-2.5 px-3">Raw Score</th>
                      <th className="py-2.5 px-3">Effective Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {dimensionsList.map((dim) => {
                      const Icon = DIMENSION_ICONS[dim.id] || Layers;
                      const isAvailable = dim.dataAvailability === "available";
                      return (
                        <tr key={dim.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-purple-400" />
                            <span>{dim.fullName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-300 font-mono">
                            {dim.canonicalWeightPercent}%
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                isAvailable
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : "bg-gray-800 text-gray-400 border border-gray-700"
                              }`}
                            >
                              {isAvailable ? "Available" : "Not Started / Pending"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold font-mono">
                            {dim.score !== null ? (
                              <span className={getScoreColor(dim.score)}>{dim.score} / 100</span>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-purple-300">
                            {dim.effectiveWeightPercent > 0
                              ? `${dim.effectiveWeightPercent}%`
                              : "Excluded (Pending)"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Biggest Gaps & Next Focus (Top 3 Weaknesses) */}
          {readiness.topGaps && readiness.topGaps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-bold text-white">🎯 Biggest Gaps & Next Focus</h2>
                </div>
                <span className="text-xs text-gray-400">Top 3 priority action items</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {readiness.topGaps.map((gapItem, idx) => {
                  const Icon = DIMENSION_ICONS[gapItem.id] || Target;
                  const isAvailable = gapItem.dataAvailability === "available";
                  return (
                    <div
                      key={gapItem.id || idx}
                      className="bg-[#141416] border border-gray-800/90 hover:border-purple-800/60 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-purple-400">
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                              {gapItem.name}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                            {gapItem.weightPercent}% Weight
                          </span>
                        </div>

                        <h3 className="font-semibold text-white text-sm">{gapItem.fullName}</h3>

                        <p className="text-xs text-gray-400 leading-relaxed">
                          {gapItem.recommendation}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-gray-800/60">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-gray-500">Target Score:</span>
                          <span className="text-purple-300 font-bold">{gapItem.requiredScore} / 100</span>
                        </div>

                        <Link
                          to={gapItem.actionLink || "/app/profile"}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <span>{gapItem.actionLabel || "Take Action"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7-Dimension Readiness Breakdown Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">📊 7-Dimension Readiness Breakdown</h2>
              </div>
              <span className="text-xs text-gray-400">Canonical 100% Framework</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dimensionsList.map((dim) => {
                const Icon = DIMENSION_ICONS[dim.id] || Layers;
                const isAvailable = dim.dataAvailability === "available";

                return (
                  <div
                    key={dim.id}
                    className="bg-[#141416] border border-gray-800/80 hover:border-gray-700 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Icon, Name, Weight Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#1e1e24] border border-gray-800 flex items-center justify-center text-purple-400">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">{dim.name}</h3>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {dim.canonicalWeightPercent}% weight
                            </span>
                          </div>
                        </div>

                        {/* Availability Pill */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isAvailable
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}
                        >
                          {isAvailable ? "Available" : "Not Started"}
                        </span>
                      </div>

                      {/* Score Value Display */}
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-gray-400">Score:</span>
                          <span className="text-lg font-bold font-mono">
                            {dim.score !== null ? (
                              <span className={getScoreColor(dim.score)}>{dim.score} / 100</span>
                            ) : (
                              <span className="text-gray-500 text-sm">Pending</span>
                            )}
                          </span>
                        </div>

                        {/* Mini progress bar */}
                        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAvailable ? getProgressBarGradient(dim.score) : "bg-gray-700"
                            }`}
                            style={{ width: `${dim.score || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Benchmark & Gap Info */}
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                        <span>Target: {dim.requiredScore}</span>
                        {dim.gap !== null ? (
                          <span className={dim.gap > 0 ? "text-amber-400" : "text-emerald-400"}>
                            Gap: {dim.gap > 0 ? `-${dim.gap}` : "0"} pts
                          </span>
                        ) : (
                          <span className="text-gray-500">Gap: —</span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                        {dim.notes || dim.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={dim.actionLink || "/app/profile"}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#1c1c20] hover:bg-purple-600/20 text-gray-300 hover:text-purple-300 border border-gray-800 hover:border-purple-600/40 text-xs font-medium transition-all"
                    >
                      <span>{dim.actionLabel}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <StatCard title="Interviews Given" value="5" subtitle="AI Mock Sessions" />
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
          subtitle="7-Dimension Framework"
        />
      </div>

      {/* AI Mock Interview & Calendar Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Interview */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-xl shadow-md col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🤖 AI Mock Interview</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Target Aligned
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Practice realistic placement interviews tailored to {userProfile?.targetCompany || "company"} and{" "}
            {userProfile?.targetJobRole || "role"} expectations.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/app/interview"
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-block"
            >
              Start Mock Interview
            </Link>
            <span className="text-xs text-gray-500">
              Last score: <strong className="text-purple-400">74%</strong>
            </span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-xl shadow-md space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🗓️ Placement Deadlines</span>
          </h2>
          <p className="text-xs text-gray-400">
            Keep track of campus drive deadlines, online assessments, and interview slots.
          </p>
          <div className="p-3 bg-[#1c1c1c] rounded-lg border border-gray-800 text-xs text-gray-400">
            No upcoming assessment deadlines scheduled for this week.
          </div>
        </div>
      </div>

      {/* Courses & Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Course Recommendations */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-xl shadow-md col-span-1 md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📚 Recommended Preparation Modules</span>
          </h2>
          <ul className="space-y-3">
            {[
              { title: "DSA Mastery (Dynamic Programming & Trees)", tag: "High Priority (25%)" },
              { title: "System Design & Scalable Architectures", tag: "Core Skills (20%)" },
              { title: "Company-Specific Technical Assessment Prep", tag: "Target Aligned" },
              { title: "Behavioral & HR Mock Interview Bootcamp", tag: "Communication" },
            ].map((course, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-gray-800/60 text-sm"
              >
                <div>
                  <span className="font-medium text-gray-200">{course.title}</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {course.tag}
                  </span>
                </div>
                <button className="text-xs bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-1.5 rounded-md transition-colors cursor-pointer">
                  Enroll
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Todo List */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>✅ Preparation Checklist</span>
          </h2>
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-center gap-2.5 p-2 rounded bg-[#1a1a1a] border border-gray-800/60">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Complete Candidate Profile & Target</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded bg-[#1a1a1a] border border-gray-800/60">
              <span className="text-purple-400 font-bold">○</span>
              <span>Upload Resume for AI ATS Scoring</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded bg-[#1a1a1a] border border-gray-800/60">
              <span className="text-purple-400 font-bold">○</span>
              <span>Practice 2 Medium Company LeetCode Problems</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded bg-[#1a1a1a] border border-gray-800/60">
              <span className="text-purple-400 font-bold">○</span>
              <span>Attempt 1 Full Mock AI Interview</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-[#141414] border border-gray-800/80 p-5 rounded-xl shadow-md space-y-1">
      <h3 className="text-xs font-medium text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-[11px] text-purple-400">{subtitle}</p>}
    </div>
  );
}