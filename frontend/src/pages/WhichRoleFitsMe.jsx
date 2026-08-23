import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import {
  Compass,
  Sparkles,
  Target,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Check,
  Layers,
  Code2,
  FileText,
  BrainCog,
  GraduationCap,
  FolderGit2,
  TrendingUp,
  Sliders,
  Search,
  RefreshCw,
  Award,
  ShieldCheck,
  AlertCircle,
  Loader2,
  HelpCircle,
  X,
  ExternalLink,
  Zap,
  BarChart3,
  GitFork,
  Globe,
  Star,
  Columns,
  ListFilter,
  CheckSquare,
  Square,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import {
  getCanonicalRoles,
  evaluateRoleFit,
  adoptTargetRole,
} from "@/services/roleFitService";

export default function WhichRoleFitsMe() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected query params / deep link
  const initialInspectSlug = searchParams.get("inspect") || "";

  // Data fetching state
  const [userProfile, setUserProfile] = useState(null);
  const [academicProfile, setAcademicProfile] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const [leetcodeProfile, setLeetCodeProfile] = useState(null);
  const [marketplaceJobs, setMarketplaceJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI Interactive state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectedRole, setInspectedRole] = useState(null);
  const [compareList, setCompareList] = useState([]); // array of role ids (up to 3)
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [inspectedTab, setInspectedTab] = useState("evidence"); // 'evidence' | 'bridge' | 'jobs'

  // Adoption modal state
  const [confirmAdoptRole, setConfirmAdoptRole] = useState(null);
  const [isAdopting, setIsAdopting] = useState(false);
  const [adoptSuccessMessage, setAdoptSuccessMessage] = useState("");

  const containerRef = useRef(null);

  // Fetch all candidate baseline profile data on mount
  const fetchCandidateData = async () => {
    setLoading(true);
    try {
      const [
        profileRes,
        academicRes,
        readinessRes,
        githubRes,
        leetcodeRes,
        jobsRes,
      ] = await Promise.allSettled([
        axios.get(`${NODE_API_URL}/api/users/profile`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/academics/profile`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/readiness`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/github/profile`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/leetcode/profile`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/jobs`, { withCredentials: true }),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value?.data) {
        setUserProfile(profileRes.value.data);
      }
      if (academicRes.status === "fulfilled" && academicRes.value?.data?.academic) {
        setAcademicProfile(academicRes.value.data.academic);
      }
      if (readinessRes.status === "fulfilled" && readinessRes.value?.data) {
        setReadinessData(readinessRes.value.data);
      }
      if (githubRes.status === "fulfilled" && githubRes.value?.data?.profile) {
        setGithubProfile(githubRes.value.data.profile);
      }
      if (leetcodeRes.status === "fulfilled" && leetcodeRes.value?.data?.profile) {
        setLeetCodeProfile(leetcodeRes.value.data.profile);
      }
      if (jobsRes.status === "fulfilled" && jobsRes.value?.data?.jobs) {
        setMarketplaceJobs(jobsRes.value.data.jobs);
      }
    } catch (err) {
      console.error("Failed to load candidate profile for role fit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, []);

  // Compute evaluation
  const evaluation = useMemo(() => {
    return evaluateRoleFit({
      userProfile,
      academicProfile,
      readinessData,
      githubProfile,
      leetcodeProfile,
      marketplaceJobs,
    });
  }, [
    userProfile,
    academicProfile,
    readinessData,
    githubProfile,
    leetcodeProfile,
    marketplaceJobs,
  ]);

  // Set initial inspected role if requested in query param
  useEffect(() => {
    if (initialInspectSlug && evaluation.evaluatedRoles.length > 0) {
      const match = evaluation.evaluatedRoles.find(
        (r) => r.id === initialInspectSlug || r.title.toLowerCase().includes(initialInspectSlug.toLowerCase())
      );
      if (match) setInspectedRole(match);
    }
  }, [initialInspectSlug, evaluation.evaluatedRoles]);

  // GSAP animation
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".gsap-fade-in"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading, activeCategoryFilter, isCompareMode]);

  // Handle Target Role Adoption
  const handleExecuteAdoption = async () => {
    if (!confirmAdoptRole) return;
    setIsAdopting(true);
    setAdoptSuccessMessage("");
    try {
      const updated = await adoptTargetRole(confirmAdoptRole.title);
      setUserProfile((prev) => ({
        ...prev,
        targetJobRole: updated.targetJobRole,
        targetRole: updated.targetJobRole,
      }));
      setAdoptSuccessMessage(`Successfully set "${confirmAdoptRole.title}" as your platform target career role!`);
      setTimeout(() => {
        setConfirmAdoptRole(null);
        setAdoptSuccessMessage("");
      }, 1500);
    } catch (err) {
      console.error("Failed to update target role:", err);
      alert(err.response?.data?.message || "Failed to update target role. Please try again.");
    } finally {
      setIsAdopting(false);
    }
  };

  // Toggle role in comparison list
  const toggleRoleCompare = (roleId) => {
    setCompareList((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 roles side-by-side.");
        return prev;
      }
      return [...prev, roleId];
    });
  };

  // Filter roles
  const filteredRoles = useMemo(() => {
    return evaluation.evaluatedRoles.filter((role) => {
      const matchesCategory =
        activeCategoryFilter === "all" ||
        role.category.toLowerCase().includes(activeCategoryFilter.toLowerCase()) ||
        role.id.includes(activeCategoryFilter);

      const matchesSearch =
        !searchQuery ||
        role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.coreRequiredSkills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [evaluation.evaluatedRoles, activeCategoryFilter, searchQuery]);

  const topRole = evaluation.topRole;
  const comparedRoles = useMemo(() => {
    return evaluation.evaluatedRoles.filter((r) => compareList.includes(r.id));
  }, [evaluation.evaluatedRoles, compareList]);

  const categories = [
    { id: "all", label: "All Roles" },
    { id: "web", label: "Web & Full Stack" },
    { id: "systems", label: "Core & SDE" },
    { id: "cloud", label: "DevOps & Cloud" },
    { id: "data", label: "Data & AI" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "security", label: "Cyber Security" },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#11110F] text-[#F5F5F0] font-sans pb-24 selection:bg-purple-500/20 selection:text-purple-200"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TELEMETRY SUMMARY */}
      {/* ========================================================================= */}
      <div className="border-b border-[#2E2C26] bg-[#161513]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Which Role Fits Me?
                  </h1>
                </div>
                <p className="text-xs text-[#A8A69E]">
                  Transparent role discovery aligning your GitHub repos, LeetCode patterns, verified skills & resume keywords.
                </p>
              </div>
            </div>

            {/* Candidate Evidence Telemetry Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-[#24231F] border border-[#3A3831] flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-zinc-400 font-mono text-[11px]">LeetCode:</span>
                <span className="font-semibold text-white">
                  {evaluation.candidateSummary.leetcodeSolved} Solved
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-[#24231F] border border-[#3A3831] flex items-center gap-2">
                <FolderGit2 className="w-3.5 h-3.5 text-zinc-300" />
                <span className="text-zinc-400 font-mono text-[11px]">GitHub:</span>
                <span className="font-semibold text-white">
                  {evaluation.candidateSummary.githubReposCount} Repos
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-[#24231F] border border-[#3A3831] flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-zinc-400 font-mono text-[11px]">Skills:</span>
                <span className="font-semibold text-white">
                  {evaluation.candidateSummary.totalSkillsCount} Verified
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-[#24231F] border border-[#3A3831] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-zinc-400 font-mono text-[11px]">Resume ATS:</span>
                <span className="font-semibold text-white">
                  {evaluation.candidateSummary.resumeScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ========================================================================= */}
        {/* 2. LOW-DATA WARNING / COMPLETION CALLOUT */}
        {/* ========================================================================= */}
        {evaluation.hasLowData && (
          <div className="gsap-fade-in p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-200">
                  Sparse Profile Data Detected
                </h4>
                <p className="text-xs text-amber-200/80">
                  Connect your GitHub repositories, LeetCode profile, and add self-assessed skills to get accurate evidence matching.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/app/profile"
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs hover:bg-amber-300 transition-colors"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. HERO: TOP MATCH SPOTLIGHT CARD */}
        {/* ========================================================================= */}
        {topRole && (
          <section className="gsap-fade-in relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1B17] via-[#24231F] to-[#161513] border border-white/10 p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 font-bold text-xs shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    TOP CAREER FIT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 font-mono text-xs border border-white/[0.08]">
                    {topRole.category}
                  </span>
                  {topRole.isCurrentTarget && (
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 font-mono text-xs border border-purple-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Current Platform Target
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {topRole.title}
                  </h2>
                  <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed">
                    {topRole.summary}
                  </p>
                </div>

                {/* Evidence highlights */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Strongest Evidence Signals
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topRole.strongMatchingEvidence.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-zinc-200 bg-[#161513]/70 px-3 py-1.5 rounded-lg border border-white/[0.04]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compensation & Industry Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Briefcase className="w-4 h-4 text-zinc-400" />
                    <span>Average Package:</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {topRole.avgCompensation.inrRange}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    <span>Hiring:</span>
                    <span className="text-zinc-200 font-medium">
                      {topRole.topHiringCompanies.slice(0, 4).join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Big Score Gauge & Action CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 bg-[#161513]/90 border border-[#3A3831] p-6 rounded-2xl shrink-0 min-w-[260px] text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-400 flex flex-col items-center justify-center bg-[#11110F]">
                    <span className="text-3xl font-black text-white font-mono leading-none">
                      {topRole.matchScore}%
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mt-1">
                      Match
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white">
                    {topRole.matchGrade}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Calculated from 5 verified evidence tiers
                  </p>
                </div>

                <div className="flex flex-col w-full gap-2 pt-2">
                  <button
                    onClick={() => setInspectedRole(topRole)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Inspect Deep Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {!topRole.isCurrentTarget ? (
                    <button
                      onClick={() => setConfirmAdoptRole(topRole)}
                      className="w-full py-2 px-3 rounded-xl bg-[#24231F] text-zinc-300 hover:text-white hover:bg-[#2E2C26] border border-[#3A3831] font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Target className="w-3.5 h-3.5 text-purple-400" />
                      <span>Make This My Target</span>
                    </button>
                  ) : (
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1 py-1.5">
                      <Check className="w-3.5 h-3.5" /> Active Platform Target
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 4. CONTROLS, SEARCH, AND MODE SELECTORS */}
        {/* ========================================================================= */}
        <section className="gsap-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#181714] border border-[#2E2C26]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-[#24231F]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Actions: Search & Compare Mode Trigger */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roles or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11110F] border border-[#3A3831] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (compareList.length < 2 && !isCompareMode) {
                  // Pre-select top 2 roles if none selected
                  const defaultSelected = evaluation.evaluatedRoles.slice(0, 2).map((r) => r.id);
                  setCompareList(defaultSelected);
                }
                setIsCompareMode(!isCompareMode);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                isCompareMode
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                  : "bg-[#24231F] text-zinc-300 border-[#3A3831] hover:text-white hover:bg-[#2E2C26]"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isCompareMode ? "Exit Comparison" : "Compare Roles"}</span>
              {compareList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold font-mono">
                  {compareList.length}
                </span>
              )}
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE ROLE COMPARISON MODE (SIDE-BY-SIDE MATRIX) */}
        {/* ========================================================================= */}
        {isCompareMode ? (
          <section className="gsap-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Columns className="w-5 h-5 text-purple-400" />
                  Side-by-Side Role Alignment Matrix
                </h3>
                <p className="text-xs text-zinc-400">
                  Comparing {comparedRoles.length} target career tracks across hiring bars, skill gaps, compensation & readiness.
                </p>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Select 2 or 3 roles to compare
              </div>
            </div>

            {comparedRoles.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#181714] border border-[#2E2C26] text-center text-zinc-400 text-xs">
                No roles selected for comparison. Pick 2-3 roles from the grid below.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#2E2C26] bg-[#161513]">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#2E2C26] bg-[#1C1B17]">
                      <th className="p-4 text-xs font-mono font-semibold text-zinc-400 w-1/4">
                        DIMENSION / CRITERIA
                      </th>
                      {comparedRoles.map((role) => (
                        <th key={role.id} className="p-4 text-xs text-white font-bold w-1/3 border-l border-[#2E2C26]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{role.title}</span>
                            <button
                              onClick={() => toggleRoleCompare(role.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Remove from comparison"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {role.matchScore}% Match
                            </span>
                            {role.isCurrentTarget && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                Current Target
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2E2C26] text-xs">
                    {/* Overall Match Score */}
                    <tr className="hover:bg-white/[0.01]">
                      <td className="p-4 font-medium text-zinc-400 font-mono">
                        Composite Match Score
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l border-[#2E2C26]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                              <div
                                className="bg-emerald-400 h-full rounded-full transition-all"
                                style={{ width: `${role.matchScore}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-white text-sm">
                              {role.matchScore}%
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500">{role.matchGrade}</span>
                        </td>
                      ))}
                    </tr>

                    {/* Verified Strengths / Evidence */}
                    <tr className="hover:bg-white/[0.01]">
                      <td className="p-4 font-medium text-zinc-400 font-mono">
                        Strongest Matching Signals
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l border-[#2E2C26] space-y-1.5">
                          {role.strongMatchingEvidence.map((ev, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-zinc-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{ev}</span>
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>

                    {/* Skill Gaps */}
                    <tr className="hover:bg-white/[0.01]">
                      <td className="p-4 font-medium text-zinc-400 font-mono">
                        Critical Skill Gaps
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l border-[#2E2C26] space-y-1.5">
                          {role.missingSkills.length > 0 ? (
                            role.missingSkills.map((gap, i) => (
                              <div key={i} className="flex items-center justify-between text-zinc-300 bg-[#24231F] px-2.5 py-1 rounded-md border border-white/[0.04]">
                                <span>{gap.skill}</span>
                                <span className="text-[10px] font-mono text-amber-400 font-bold">
                                  {gap.priority}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              All core benchmark skills verified
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* LeetCode & Problem Solving Bar */}
                    <tr className="hover:bg-white/[0.01]">
                      <td className="p-4 font-medium text-zinc-400 font-mono">
                        DSA & Algorithmic Bar
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l border-[#2E2C26]">
                          <div className="font-semibold text-white">
                            {role.targetDsaSolvedCount}+ Target Solved
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            Focus: {role.idealCoursework[0] || "Advanced Algorithms"}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Average Compensation */}
                    <tr className="hover:bg-white/[0.01]">
                      <td className="p-4 font-medium text-zinc-400 font-mono">
                        Compensation Benchmark
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l border-[#2E2C26]">
                          <div className="font-mono font-bold text-emerald-400 text-sm">
                            {role.avgCompensation.inrRange}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Entry: {role.avgCompensation.entryLevel} • Senior: {role.avgCompensation.seniorLevel}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Top Hiring Companies */}
                    <tr className="hover:bg-white/[0.01]">
                      <td className="p-4 font-medium text-zinc-400 font-mono">
                        Top Hiring Employers
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l border-[#2E2C26] text-zinc-300">
                          {role.topHiringCompanies.slice(0, 5).join(" • ")}
                        </td>
                      ))}
                    </tr>

                    {/* Actions */}
                    <tr>
                      <td className="p-4 font-medium text-zinc-400 font-mono">
                        Target Adoption & Actions
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l border-[#2E2C26] space-y-2">
                          <button
                            onClick={() => setInspectedRole(role)}
                            className="w-full py-1.5 px-3 rounded-lg bg-[#24231F] text-zinc-200 hover:text-white border border-[#3A3831] font-medium text-xs transition-colors cursor-pointer"
                          >
                            Inspect Full Evidence
                          </button>
                          {!role.isCurrentTarget ? (
                            <button
                              onClick={() => setConfirmAdoptRole(role)}
                              className="w-full py-1.5 px-3 rounded-lg bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Target className="w-3.5 h-3.5" />
                              <span>Make This Target</span>
                            </button>
                          ) : (
                            <div className="text-[11px] font-mono text-emerald-400 text-center flex items-center justify-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              Active Target
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {/* ========================================================================= */}
        {/* 6. RANKED BEST ROLE MATCHES GRID (ALL 9 ROLES) */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 6. RANKED BEST ROLE MATCHES GRID */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Ranked Role Matches
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Sorted by Multi-Evidence Percentage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoles.map((role, index) => {
              const isTop = index === 0 && activeCategoryFilter === "all" && !searchQuery;
              const isCheckedForCompare = compareList.includes(role.id);

              return (
                <div
                  key={role.id}
                  className={`gsap-fade-in group relative rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between border ${
                    isTop
                      ? "bg-gradient-to-b from-[#1F1E1A] to-[#161513] border-white/20 shadow-lg"
                      : "bg-[#181714] border-[#2E2C26] hover:border-[#3A3831] hover:bg-[#1C1B17]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-zinc-500">
                          #{index + 1}
                        </span>
                        {isTop && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-bold text-[10px]">
                            Top Match
                          </span>
                        )}

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                          {role.category}
                        </span>
                      </div>

                      {/* Compare Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRoleCompare(role.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isCheckedForCompare
                            ? "bg-purple-500 text-white border-purple-500"
                            : "bg-[#24231F] text-zinc-400 border-[#3A3831] hover:text-white"
                        }`}
                        title={isCheckedForCompare ? "Remove from comparison" : "Add to comparison"}
                      >
                        {isCheckedForCompare ? (
                          <CheckSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                          {role.title}
                        </h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-mono font-black text-white">
                            {role.matchScore}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {role.summary}
                      </p>
                    </div>

                    {/* Match Score Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-500">Alignment Bar</span>
                        <span className="text-emerald-400 font-semibold">{role.matchGrade}</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${role.matchScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Matching Evidence */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        Key Alignment Signals
                      </span>
                      <div className="space-y-1">
                        {role.strongMatchingEvidence.slice(0, 2).map((ev, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs text-zinc-300 truncate"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gaps Preview */}
                    {role.missingSkills.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                          Priority Gaps ({role.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.missingSkills.slice(0, 3).map((gap, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            >
                              {gap.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Package and hiring companies */}
                    <div className="pt-2 border-t border-[#2E2C26] flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono text-[11px]">
                        Avg: <span className="text-emerald-400 font-semibold">{role.avgCompensation.inrRange}</span>
                      </span>
                      <span className="text-zinc-500 text-[11px] truncate max-w-[140px]">
                        {role.topHiringCompanies.slice(0, 2).join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 mt-3 border-t border-[#2E2C26] flex items-center gap-2">
                    <button
                      onClick={() => setInspectedRole(role)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#24231F] text-zinc-200 hover:text-white hover:bg-[#2E2C26] border border-[#3A3831] font-medium text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {!role.isCurrentTarget ? (
                      <button
                        onClick={() => setConfirmAdoptRole(role)}
                        className="py-2 px-3 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                        title="Make this your platform target role"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Set Target</span>
                      </button>
                    ) : (
                      <div className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 text-[11px] font-mono border border-purple-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Target
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 7. DEEP ROLE INSPECTION MODAL / DRAWER */}
      {/* ========================================================================= */}
      {inspectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#161513] border border-[#3A3831] shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2E2C26] bg-[#1C1B17] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-bold text-xs">
                    {inspectedRole.matchScore}% Match
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 font-mono text-xs">
                    {inspectedRole.category}
                  </span>
                  {inspectedRole.isCurrentTarget && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono">
                      Current Target
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  {inspectedRole.title}
                </h2>
                <p className="text-xs text-zinc-400 max-w-2xl">
                  {inspectedRole.summary}
                </p>
              </div>

              <button
                onClick={() => setInspectedRole(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#2E2C26] bg-[#161513]">
              <button
                onClick={() => setInspectedTab("evidence")}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  inspectedTab === "evidence"
                    ? "border-purple-400 text-purple-300"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Evidence & Alignment
              </button>
              <button
                onClick={() => setInspectedTab("bridge")}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  inspectedTab === "bridge"
                    ? "border-purple-400 text-purple-300"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Actionable Skill Bridge
              </button>
              <button
                onClick={() => setInspectedTab("jobs")}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  inspectedTab === "jobs"
                    ? "border-purple-400 text-purple-300"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Hiring Loops & Open Positions
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
              {inspectedTab === "evidence" && (
                <div className="space-y-6">
                  {/* Dimension score gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 rounded-xl bg-[#24231F] border border-[#3A3831] text-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Skills (28%)</span>
                      <div className="text-lg font-bold text-white font-mono mt-0.5">
                        {inspectedRole.dimensionScores.skills}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#24231F] border border-[#3A3831] text-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">GitHub (24%)</span>
                      <div className="text-lg font-bold text-white font-mono mt-0.5">
                        {inspectedRole.dimensionScores.github}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#24231F] border border-[#3A3831] text-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">LeetCode (20%)</span>
                      <div className="text-lg font-bold text-white font-mono mt-0.5">
                        {inspectedRole.dimensionScores.dsa}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#24231F] border border-[#3A3831] text-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Resume ATS (16%)</span>
                      <div className="text-lg font-bold text-white font-mono mt-0.5">
                        {inspectedRole.dimensionScores.resume}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#24231F] border border-[#3A3831] text-center">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Academics (12%)</span>
                      <div className="text-lg font-bold text-white font-mono mt-0.5">
                        {inspectedRole.dimensionScores.academics}%
                      </div>
                    </div>
                  </div>

                  {/* You Have vs You Need */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* You Have */}
                    <div className="p-4 rounded-2xl bg-[#1C1B17] border border-emerald-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>You Have (Verified Evidence)</span>
                      </div>
                      <div className="space-y-2">
                        {inspectedRole.strongMatchingEvidence.map((ev, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs text-zinc-200 bg-[#24231F] p-2 rounded-lg"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* You Need */}
                    <div className="p-4 rounded-2xl bg-[#1C1B17] border border-amber-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs font-mono uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>You Need (Gaps to Close)</span>
                      </div>
                      <div className="space-y-2">
                        {inspectedRole.missingSkills.length > 0 ? (
                          inspectedRole.missingSkills.map((gap, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-xs text-zinc-200 bg-[#24231F] p-2 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>{gap.skill}</span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                                {gap.priority} Priority
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-zinc-400 p-2">
                            All core requirements are already matched in your profile.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Key Responsibilities */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Role Responsibilities in Industry
                    </h4>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {inspectedRole.keyResponsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 font-bold">›</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {inspectedTab === "bridge" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Actionable Roadmap to 95%+ Fit
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Complete these platform preparation modules to bridge your skill gaps for {inspectedRole.title}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      to="/app/dsa"
                      className="p-4 rounded-xl bg-[#24231F] border border-[#3A3831] hover:border-purple-500/50 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-semibold text-xs">
                          <Code2 className="w-4 h-4 text-purple-400" />
                          <span>DSA Problem Solving Arena</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Target {inspectedRole.targetDsaSolvedCount}+ LeetCode pattern questions required by {inspectedRole.shortTitle} hiring bars.
                      </p>
                    </Link>

                    <Link
                      to="/app/coding"
                      className="p-4 rounded-xl bg-[#24231F] border border-[#3A3831] hover:border-purple-500/50 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-semibold text-xs">
                          <Layers className="w-4 h-4 text-zinc-300" />
                          <span>CS Core & Machine Coding</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Practice Low Level Design, SQL indexes, and concurrency for technical machine rounds.
                      </p>
                    </Link>

                    <Link
                      to="/app/roadmap"
                      className="p-4 rounded-xl bg-[#24231F] border border-[#3A3831] hover:border-purple-500/50 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-semibold text-xs">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span>Placement Milestone Roadmap</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Follow a week-by-week curriculum tailored for {inspectedRole.title} specifications.
                      </p>
                    </Link>

                    <Link
                      to="/app/resume"
                      className="p-4 rounded-xl bg-[#24231F] border border-[#3A3831] hover:border-purple-500/50 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-semibold text-xs">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span>Resume Keyword Optimizer</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Inject Google XYZ impact bullets and verified technical keywords for {inspectedRole.title}.
                      </p>
                    </Link>
                  </div>
                </div>
              )}

              {inspectedTab === "jobs" && (
                <div className="space-y-4">
                  {/* Hiring loop breakdown */}
                  <div className="p-4 rounded-2xl bg-[#1C1B17] border border-[#3A3831] space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Standard Hiring Loop Structure
                    </h4>
                    <div className="space-y-1.5">
                      {inspectedRole.hiringBars.map((bar, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                          <span className="w-5 h-5 rounded-full bg-[#24231F] text-purple-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-white/[0.04]">
                            {i + 1}
                          </span>
                          <span>{bar}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matched marketplace jobs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Live Matching Openings
                    </h4>
                    {inspectedRole.matchedJobs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {inspectedRole.matchedJobs.map((job) => (
                          <div
                            key={job._id || job.id}
                            className="p-3.5 rounded-xl bg-[#24231F] border border-[#3A3831] flex flex-col justify-between space-y-2"
                          >
                            <div>
                              <div className="text-xs font-bold text-white">{job.title}</div>
                              <div className="text-[11px] text-purple-300 font-medium">
                                {job.company || "Leading Employer"} • {job.location || "Remote / Hybrid"}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/[0.04]">
                              <span className="text-zinc-400 font-mono">{job.salary || "Competitive"}</span>
                              <Link
                                to={`/app/can-i-apply?company=${encodeURIComponent(job.company || "")}&role=${encodeURIComponent(job.title || "")}`}
                                className="text-purple-300 hover:underline font-semibold flex items-center gap-1"
                              >
                                Can I Apply?
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#1C1B17] border border-[#2E2C26] text-zinc-400 text-xs">
                        Browse all openings in the Job Matching arena.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-[#2E2C26] bg-[#1C1B17] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-zinc-400">
                Avg Compensation:{" "}
                <span className="text-emerald-400 font-mono font-bold">
                  {inspectedRole.avgCompensation.inrRange}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setInspectedRole(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#24231F] text-zinc-300 hover:text-white border border-[#3A3831] text-xs font-medium cursor-pointer"
                >
                  Close
                </button>

                {!inspectedRole.isCurrentTarget ? (
                  <button
                    onClick={() => {
                      setConfirmAdoptRole(inspectedRole);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Target className="w-4 h-4" />
                    <span>Make This My Target Career Role</span>
                  </button>
                ) : (
                  <div className="px-3 py-2 rounded-xl bg-purple-500/15 text-purple-300 text-xs font-mono border border-purple-500/30 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Current Target Role
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SAFE TARGET ROLE ADOPTION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {confirmAdoptRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#181714] border border-[#3A3831] p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Target Career Goal
                </h3>
                <p className="text-xs text-zinc-400">
                  Update your platform ambition
                </p>
              </div>
            </div>

            {adoptSuccessMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{adoptSuccessMessage}</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-zinc-300 bg-[#24231F] p-4 rounded-2xl border border-white/[0.04]">
                <p>
                  Set <strong className="text-white">"{confirmAdoptRole.title}"</strong> as your primary target career role?
                </p>
                <ul className="space-y-1 text-zinc-400 text-[11px] list-disc list-inside">
                  <li>Calculates gap benchmarks against {confirmAdoptRole.title} standards</li>
                  <li>Calibrates your personalized 8-week placement roadmap</li>
                  <li>Reranks job recommendations matching this specialization</li>
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isAdopting}
                onClick={() => setConfirmAdoptRole(null)}
                className="flex-1 py-2 px-4 rounded-xl bg-[#24231F] text-zinc-300 hover:text-white border border-[#3A3831] text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isAdopting}
                onClick={handleExecuteAdoption}
                className="flex-1 py-2 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isAdopting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Set Target</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
