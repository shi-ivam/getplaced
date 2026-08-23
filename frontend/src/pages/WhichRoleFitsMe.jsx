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
  Flame,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import {
  getCanonicalRoles,
  evaluateRoleFit,
  adoptTargetRole,
} from "@/services/roleFitService";
import GpCard from "@/components/gp/GpCard";
import GpBadge from "@/components/gp/GpBadge";
import GpButton from "@/components/gp/GpButton";

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
        (r) =>
          r.id === initialInspectSlug ||
          r.title.toLowerCase().includes(initialInspectSlug.toLowerCase())
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
      setAdoptSuccessMessage(
        `Successfully set "${confirmAdoptRole.title}" as your platform target career role!`
      );
      setTimeout(() => {
        setConfirmAdoptRole(null);
        setAdoptSuccessMessage("");
      }, 1500);
    } catch (err) {
      console.error("Failed to update target role:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update target role. Please try again."
      );
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
        role.coreRequiredSkills.some((s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesSearch;
    });
  }, [evaluation.evaluatedRoles, activeCategoryFilter, searchQuery]);

  const topRole = evaluation.topRole;
  const comparedRoles = useMemo(() => {
    return evaluation.evaluatedRoles.filter((r) => compareList.includes(r.id));
  }, [evaluation.evaluatedRoles, compareList]);

  const categories = [
    { id: "all", label: "All 9 Roles" },
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
      className="space-y-6 pb-20 font-sans text-[#17103D]"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TELEMETRY SUMMARY */}
      {/* ========================================================================= */}
      <div className="pb-4 border-b border-[#E2DEEC]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17103D] text-[#FFD84D] flex items-center justify-center shrink-0 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2">
                  Which Role Fits Me?
                </h1>
                <GpBadge theme="light-purple" size="sm">
                  Multi-Evidence AI
                </GpBadge>
              </div>
              <p className="text-xs text-[#6F6A80] font-medium font-sans">
                Transparent role discovery aligning your GitHub repos, LeetCode patterns, verified skills & resume keywords.
              </p>
            </div>
          </div>

          {/* Candidate Evidence Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2DEEC] shadow-sm flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-[#6E44FF]" />
              <span className="text-[#6F6A80] text-[11px] font-medium">LeetCode:</span>
              <span className="font-bold text-[#17103D]">
                {evaluation.candidateSummary.leetcodeSolved} Solved
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2DEEC] shadow-sm flex items-center gap-2">
              <FolderGit2 className="w-3.5 h-3.5 text-[#1D58B5]" />
              <span className="text-[#6F6A80] text-[11px] font-medium">GitHub:</span>
              <span className="font-bold text-[#17103D]">
                {evaluation.candidateSummary.githubReposCount} Repos
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2DEEC] shadow-sm flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#0D7A68]" />
              <span className="text-[#6F6A80] text-[11px] font-medium">Skills:</span>
              <span className="font-bold text-[#17103D]">
                {evaluation.candidateSummary.totalSkillsCount} Verified
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2DEEC] shadow-sm flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#6E44FF]" />
              <span className="text-[#6F6A80] text-[11px] font-medium">Resume ATS:</span>
              <span className="font-bold text-[#17103D]">
                {evaluation.candidateSummary.resumeScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* 2. LOW-DATA WARNING / COMPLETION CALLOUT */}
        {/* ========================================================================= */}
        {evaluation.hasLowData && (
          <GpCard
            theme="light-yellow"
            shadow="default"
            className="gsap-fade-in p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#0D0431]" />
              </div>
              <div>
                <h4 className="text-sm font-heading font-black text-[#0D0431]">
                  Sparse Profile Data Detected
                </h4>
                <p className="text-xs text-[#0D0431]/80 font-medium">
                  Connect your GitHub repositories, LeetCode profile, and add self-assessed skills to get 100% accurate evidence matching without estimated fallbacks.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <GpButton
                to="/app/profile"
                variant="stacked-yellow"
                size="sm"
                icon={true}
              >
                Complete Profile
              </GpButton>
            </div>
          </GpCard>
        )}

        {/* ========================================================================= */}
        {/* 3. HERO: TOP MATCH SPOTLIGHT CARD */}
        {/* ========================================================================= */}
        {topRole && (
          <GpCard
            theme="light-purple"
            shadow="lg"
            className="gsap-fade-in p-6 sm:p-8 rounded-3xl relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <GpBadge theme="yellow" size="md">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      TOP CAREER FIT
                    </span>
                  </GpBadge>

                  <span className="px-3 py-0.5 rounded-full bg-white text-[#0D0431] font-mono text-xs font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    {topRole.category}
                  </span>

                  {topRole.isCurrentTarget && (
                    <GpBadge theme="mint" size="md">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Current Platform Target
                      </span>
                    </GpBadge>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl sm:text-4xl font-heading font-black text-[#0D0431] tracking-tight">
                    {topRole.title}
                  </h2>
                  <p className="text-sm text-[#0D0431]/85 font-medium mt-1.5 leading-relaxed">
                    {topRole.summary}
                  </p>
                </div>

                {/* Evidence highlights */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#0D0431]/70 font-bold">
                    Strongest Evidence Signals
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topRole.strongMatchingEvidence.slice(0, 4).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-bold text-[#0D0431] bg-white px-3 py-2 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                      >
                        <div className="w-4 h-4 rounded-md bg-[#D4FDF7] border border-[#0D0431] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-[#0D0431]" />
                        </div>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compensation & Industry Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs pt-2">
                  <div className="flex items-center gap-1.5 bg-[#FEF9CF] px-3 py-1.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431]">
                    <Briefcase className="w-3.5 h-3.5 text-[#0D0431]" />
                    <span className="font-medium">Avg Package:</span>
                    <span className="font-heading font-black text-[#0D0431]">
                      {topRole.avgCompensation.inrRange}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431]">
                    <Building2 className="w-3.5 h-3.5 text-[#0D0431]" />
                    <span className="font-medium">Hiring:</span>
                    <span className="font-bold text-[#0D0431]">
                      {topRole.topHiringCompanies.slice(0, 4).join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Big Score Gauge & Action CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] p-6 rounded-3xl shrink-0 min-w-[260px] text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-[#0D0431] bg-[#FEDF6A] shadow-[3px_3px_0_0_#0D0431] flex flex-col items-center justify-center">
                    <span className="text-3xl font-heading font-black text-[#0D0431] leading-none">
                      {topRole.matchScore}%
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#0D0431] uppercase tracking-wider mt-1">
                      Match
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#0D0431] bg-[#FEF9CF] px-3 py-1 rounded-full border-2 border-[#0D0431]">
                    {topRole.matchGrade}
                  </div>
                  <p className="text-[11px] text-[#0D0431]/70 font-medium">
                    Calculated from 5 verified evidence tiers
                  </p>
                </div>

                <div className="flex flex-col w-full gap-2.5 pt-1">
                  <GpButton
                    onClick={() => setInspectedRole(topRole)}
                    variant="stacked-yellow"
                    size="sm"
                    fullWidth
                    icon={true}
                  >
                    Inspect Deep Evidence
                  </GpButton>

                  {!topRole.isCurrentTarget ? (
                    <GpButton
                      onClick={() => setConfirmAdoptRole(topRole)}
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon={false}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#0D0431]" />
                        <span>Make This My Target</span>
                      </span>
                    </GpButton>
                  ) : (
                    <div className="text-[11px] font-mono font-bold text-[#0D0431] bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-xl flex items-center justify-center gap-1 py-1.5">
                      <Check className="w-3.5 h-3.5" /> Active Platform Target
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GpCard>
        )}

        {/* ========================================================================= */}
        {/* 4. CONTROLS, SEARCH, AND MODE SELECTORS */}
        {/* ========================================================================= */}
        <GpCard
          theme="white"
          shadow="default"
          className="gsap-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl"
        >
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] cursor-pointer ${
                    isActive
                      ? "bg-[#0D0431] text-[#FEF9CF]"
                      : "bg-[#FEF9CF] text-[#0D0431] hover:bg-[#FEDF6A] hover:-translate-y-0.5"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right Actions: Search & Compare Mode Trigger */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-[#0D0431]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search roles or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-[#0D0431] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0D0431] font-bold placeholder-[#0D0431]/40 shadow-[2px_2px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0D0431]/60 hover:text-[#0D0431]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <GpButton
              onClick={() => {
                if (compareList.length < 2 && !isCompareMode) {
                  // Pre-select top 2 roles if none selected
                  const defaultSelected = evaluation.evaluatedRoles
                    .slice(0, 2)
                    .map((r) => r.id);
                  setCompareList(defaultSelected);
                }
                setIsCompareMode(!isCompareMode);
              }}
              variant={isCompareMode ? "stacked-yellow" : "secondary"}
              size="sm"
              icon={false}
            >
              <span className="flex items-center gap-1.5 font-bold">
                <Columns className="w-3.5 h-3.5" />
                <span>{isCompareMode ? "Exit Compare" : "Compare Roles"}</span>
                {compareList.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#0D0431] text-[#FEF9CF] text-[10px] flex items-center justify-center font-bold font-mono">
                    {compareList.length}
                  </span>
                )}
              </span>
            </GpButton>
          </div>
        </GpCard>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE ROLE COMPARISON MODE (SIDE-BY-SIDE MATRIX) */}
        {/* ========================================================================= */}
        {isCompareMode ? (
          <section className="gsap-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-heading font-black text-[#0D0431] flex items-center gap-2">
                  <Columns className="w-5 h-5 text-[#0D0431]" />
                  Side-by-Side Role Alignment Matrix
                </h3>
                <p className="text-xs text-[#0D0431]/80 font-medium">
                  Comparing {comparedRoles.length} target career tracks across hiring bars, skill gaps, compensation & readiness.
                </p>
              </div>
              <div className="text-xs text-[#0D0431] font-mono font-bold bg-[#FEDF6A] px-3 py-1 rounded-full border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                Select 2 or 3 roles to compare
              </div>
            </div>

            {comparedRoles.length === 0 ? (
              <GpCard
                theme="white"
                shadow="default"
                className="p-8 rounded-2xl text-center text-[#0D0431]/70 font-bold text-xs"
              >
                No roles selected for comparison. Pick 2-3 roles from the grid below.
              </GpCard>
            ) : (
              <GpCard
                theme="white"
                shadow="lg"
                className="overflow-x-auto rounded-3xl p-0"
              >
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b-2 border-[#0D0431] bg-[#FEF9CF]">
                      <th className="p-4 text-xs font-heading font-black text-[#0D0431] w-1/4 uppercase tracking-wider">
                        Dimension / Criteria
                      </th>
                      {comparedRoles.map((role) => (
                        <th
                          key={role.id}
                          className="p-4 text-xs text-[#0D0431] font-bold w-1/3 border-l-2 border-[#0D0431] bg-[#FEDF6A]/40"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-heading font-black">{role.title}</span>
                            <button
                              onClick={() => toggleRoleCompare(role.id)}
                              className="w-6 h-6 rounded-full bg-white border-2 border-[#0D0431] text-[#0D0431] hover:bg-[#FFC5B7] flex items-center justify-center cursor-pointer shadow-[1px_1px_0_0_#0D0431]"
                              title="Remove from comparison"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-heading font-black px-2.5 py-0.5 rounded-full bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                              {role.matchScore}% Match
                            </span>
                            {role.isCurrentTarget && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E4CDFB] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                                Current Target
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#0D0431] text-xs">
                    {/* Overall Match Score */}
                    <tr className="hover:bg-[#FEF9CF]/40">
                      <td className="p-4 font-bold text-[#0D0431] font-heading">
                        Composite Match Score
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l-2 border-[#0D0431]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white rounded-full h-3 overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                              <div
                                className="bg-[#FEDF6A] h-full rounded-full transition-all"
                                style={{ width: `${role.matchScore}%` }}
                              />
                            </div>
                            <span className="font-heading font-black text-[#0D0431] text-base">
                              {role.matchScore}%
                            </span>
                          </div>
                          <span className="text-[11px] text-[#0D0431]/70 font-bold mt-1 inline-block">
                            {role.matchGrade}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Verified Strengths / Evidence */}
                    <tr className="hover:bg-[#FEF9CF]/40">
                      <td className="p-4 font-bold text-[#0D0431] font-heading">
                        Strongest Matching Signals
                      </td>
                      {comparedRoles.map((role) => (
                        <td
                          key={role.id}
                          className="p-4 border-l-2 border-[#0D0431] space-y-1.5"
                        >
                          {role.strongMatchingEvidence.map((ev, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-1.5 text-[#0D0431] font-medium bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] p-1.5 rounded-xl text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0D0431] shrink-0 mt-0.5" />
                              <span className="leading-tight">{ev}</span>
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>

                    {/* Skill Gaps */}
                    <tr className="hover:bg-[#FEF9CF]/40">
                      <td className="p-4 font-bold text-[#0D0431] font-heading">
                        Critical Skill Gaps
                      </td>
                      {comparedRoles.map((role) => (
                        <td
                          key={role.id}
                          className="p-4 border-l-2 border-[#0D0431] space-y-1.5"
                        >
                          {role.missingSkills.length > 0 ? (
                            role.missingSkills.map((gap, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between text-[#0D0431] bg-[#FFC5B7] px-2.5 py-1 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] font-bold"
                              >
                                <span>{gap.skill}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#0D0431] border border-[#0D0431]">
                                  {gap.priority}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[#0D0431] text-[11px] font-bold bg-[#D4FDF7] px-3 py-1.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              All core benchmark skills verified
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* LeetCode & Problem Solving Bar */}
                    <tr className="hover:bg-[#FEF9CF]/40">
                      <td className="p-4 font-bold text-[#0D0431] font-heading">
                        DSA & Algorithmic Bar
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l-2 border-[#0D0431]">
                          <div className="font-heading font-black text-[#0D0431] text-sm">
                            {role.targetDsaSolvedCount}+ Target Solved
                          </div>
                          <div className="text-[11px] text-[#0D0431]/80 mt-0.5 font-medium">
                            Focus: {role.idealCoursework[0] || "Advanced Algorithms"}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Average Compensation */}
                    <tr className="hover:bg-[#FEF9CF]/40">
                      <td className="p-4 font-bold text-[#0D0431] font-heading">
                        Compensation Benchmark
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l-2 border-[#0D0431]">
                          <div className="font-heading font-black text-[#0D0431] text-base">
                            {role.avgCompensation.inrRange}
                          </div>
                          <div className="text-[10px] text-[#0D0431]/70 font-medium">
                            Entry: {role.avgCompensation.entryLevel} • Senior: {role.avgCompensation.seniorLevel}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Top Hiring Companies */}
                    <tr className="hover:bg-[#FEF9CF]/40">
                      <td className="p-4 font-bold text-[#0D0431] font-heading">
                        Top Hiring Employers
                      </td>
                      {comparedRoles.map((role) => (
                        <td key={role.id} className="p-4 border-l-2 border-[#0D0431] text-[#0D0431] font-bold">
                          {role.topHiringCompanies.slice(0, 5).join(" • ")}
                        </td>
                      ))}
                    </tr>

                    {/* Actions */}
                    <tr>
                      <td className="p-4 font-bold text-[#0D0431] font-heading">
                        Target Adoption & Actions
                      </td>
                      {comparedRoles.map((role) => (
                        <td
                          key={role.id}
                          className="p-4 border-l-2 border-[#0D0431] space-y-2"
                        >
                          <GpButton
                            onClick={() => setInspectedRole(role)}
                            variant="secondary"
                            size="sm"
                            fullWidth
                            icon={false}
                          >
                            Inspect Full Evidence
                          </GpButton>
                          {!role.isCurrentTarget ? (
                            <GpButton
                              onClick={() => setConfirmAdoptRole(role)}
                              variant="stacked-yellow"
                              size="sm"
                              fullWidth
                              icon={false}
                            >
                              <span className="flex items-center justify-center gap-1.5">
                                <Target className="w-3.5 h-3.5" />
                                <span>Make This Target</span>
                              </span>
                            </GpButton>
                          ) : (
                            <div className="text-[11px] font-mono font-bold text-[#0D0431] bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-xl text-center flex items-center justify-center gap-1 py-1.5">
                              <Check className="w-3.5 h-3.5" />
                              Active Target
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </GpCard>
            )}
          </section>
        ) : null}

        {/* ========================================================================= */}
        {/* 6. RANKED BEST ROLE MATCHES GRID (ALL 9 ROLES) */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0D0431]" />
              <h3 className="text-lg sm:text-xl font-heading font-black text-[#0D0431] tracking-tight">
                Ranked Best Role Matches ({filteredRoles.length})
              </h3>
            </div>
            <GpBadge theme="light-purple" size="sm">
              Sorted by Multi-Evidence %
            </GpBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoles.map((role, index) => {
              const isTop =
                index === 0 && activeCategoryFilter === "all" && !searchQuery;
              const isCheckedForCompare = compareList.includes(role.id);

              const cardTheme = isTop
                ? "light-yellow"
                : index === 1
                ? "light-purple"
                : index === 2
                ? "light-green"
                : "white";

              return (
                <GpCard
                  key={role.id}
                  theme={cardTheme}
                  shadow="default"
                  hoverEffect
                  className="gsap-fade-in p-5 rounded-3xl flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-black text-xs text-[#0D0431] bg-white px-2 py-0.5 rounded-md border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                          #{index + 1}
                        </span>
                        {isTop ? (
                          <GpBadge theme="yellow" size="sm">
                            Top Match
                          </GpBadge>
                        ) : index === 1 ? (
                          <GpBadge theme="light-purple" size="sm">
                            Rank 2
                          </GpBadge>
                        ) : index === 2 ? (
                          <GpBadge theme="mint" size="sm">
                            Rank 3
                          </GpBadge>
                        ) : null}

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#0D0431] border-2 border-[#0D0431]">
                          {role.category}
                        </span>
                      </div>

                      {/* Compare Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRoleCompare(role.id);
                        }}
                        className={`p-1.5 rounded-xl border-2 border-[#0D0431] transition-all cursor-pointer shadow-[2px_2px_0_0_#0D0431] ${
                          isCheckedForCompare
                            ? "bg-[#0D0431] text-[#FEF9CF]"
                            : "bg-white text-[#0D0431] hover:bg-[#FEDF6A]"
                        }`}
                        title={
                          isCheckedForCompare
                            ? "Remove from comparison"
                            : "Add to comparison"
                        }
                      >
                        {isCheckedForCompare ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-heading font-black text-[#0D0431]">
                          {role.title}
                        </h4>
                        <span className="text-2xl font-heading font-black text-[#0D0431]">
                          {role.matchScore}%
                        </span>
                      </div>
                      <p className="text-xs text-[#0D0431]/80 font-medium mt-1 line-clamp-2 leading-relaxed">
                        {role.summary}
                      </p>
                    </div>

                    {/* Match Score Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                        <span className="text-[#0D0431]/70">Alignment Bar</span>
                        <span className="text-[#0D0431] font-heading">{role.matchGrade}</span>
                      </div>
                      <div className="w-full bg-white h-2 rounded-full overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                        <div
                          className="bg-[#FEDF6A] h-full rounded-full transition-all duration-500"
                          style={{ width: `${role.matchScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Matching Evidence */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#0D0431]/70 font-bold">
                        Key Alignment Signals
                      </span>
                      <div className="space-y-1">
                        {role.strongMatchingEvidence.slice(0, 2).map((ev, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#0D0431] bg-white px-2.5 py-1.5 rounded-xl border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] truncate"
                          >
                            <div className="w-3.5 h-3.5 rounded-md bg-[#D4FDF7] border border-[#0D0431] flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 text-[#0D0431]" />
                            </div>
                            <span className="truncate">{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gaps Preview */}
                    {role.missingSkills.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#0D0431]/70 font-bold">
                          Priority Gaps ({role.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.missingSkills.slice(0, 3).map((gap, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]"
                            >
                              {gap.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Package and hiring companies */}
                    <div className="pt-2 border-t-2 border-[#0D0431] flex items-center justify-between text-xs">
                      <span className="text-[#0D0431] font-mono text-[11px] font-bold">
                        Avg: <span className="font-heading font-black">{role.avgCompensation.inrRange}</span>
                      </span>
                      <span className="text-[#0D0431]/80 font-bold text-[11px] truncate max-w-[140px]">
                        {role.topHiringCompanies.slice(0, 2).join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 mt-3 border-t-2 border-[#0D0431] flex items-center gap-2">
                    <GpButton
                      onClick={() => setInspectedRole(role)}
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon={true}
                    >
                      Inspect Details
                    </GpButton>

                    {!role.isCurrentTarget ? (
                      <GpButton
                        onClick={() => setConfirmAdoptRole(role)}
                        variant="stacked-yellow"
                        size="sm"
                        icon={false}
                      >
                        <span className="flex items-center gap-1 font-bold">
                          <Target className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Target</span>
                        </span>
                      </GpButton>
                    ) : (
                      <div className="px-3 py-1.5 rounded-xl bg-[#D4FDF7] text-[#0D0431] text-[11px] font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" /> Target
                      </div>
                    )}
                  </div>
                </GpCard>
              );
            })}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 7. DEEP ROLE INSPECTION MODAL / DRAWER */}
      {/* ========================================================================= */}
      {inspectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0431]/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[8px_8px_0_0_#0D0431] overflow-hidden my-8 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-[#0D0431] bg-[#FEDF6A] flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <GpBadge theme="dark" size="sm">
                    {inspectedRole.matchScore}% Match
                  </GpBadge>
                  <span className="px-3 py-0.5 rounded-full bg-white text-[#0D0431] font-mono text-xs font-bold border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                    {inspectedRole.category}
                  </span>
                  {inspectedRole.isCurrentTarget && (
                    <GpBadge theme="mint" size="sm">
                      Current Target
                    </GpBadge>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431]">
                  {inspectedRole.title}
                </h2>
                <p className="text-xs text-[#0D0431]/85 font-medium max-w-2xl">
                  {inspectedRole.summary}
                </p>
              </div>

              <button
                onClick={() => setInspectedRole(null)}
                className="w-8 h-8 rounded-full border-2 border-[#0D0431] bg-white hover:bg-[#FFC5B7] text-[#0D0431] flex items-center justify-center shadow-[2px_2px_0_0_#0D0431] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b-2 border-[#0D0431] bg-[#FEF9CF]">
              {[
                { id: "evidence", label: "Evidence & Alignment" },
                { id: "bridge", label: "Actionable Skill Bridge" },
                {
                  id: "jobs",
                  label: `Hiring Loops & Open Positions (${inspectedRole.matchedJobs.length})`,
                },
              ].map((tab) => {
                const isActive = inspectedTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInspectedTab(tab.id)}
                    className={`pb-3 px-3.5 text-xs font-heading font-bold border-b-4 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#0D0431] text-[#0D0431]"
                        : "border-transparent text-[#0D0431]/60 hover:text-[#0D0431]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto bg-[#FEF9CF]">
              {inspectedTab === "evidence" && (
                <div className="space-y-6">
                  {/* Dimension score gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-center">
                      <span className="text-[10px] font-mono text-[#0D0431] uppercase font-bold">
                        Skills (28%)
                      </span>
                      <div className="text-xl font-heading font-black text-[#0D0431] mt-0.5">
                        {inspectedRole.dimensionScores.skills}%
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#CDE1FF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-center">
                      <span className="text-[10px] font-mono text-[#0D0431] uppercase font-bold">
                        GitHub (24%)
                      </span>
                      <div className="text-xl font-heading font-black text-[#0D0431] mt-0.5">
                        {inspectedRole.dimensionScores.github}%
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-center">
                      <span className="text-[10px] font-mono text-[#0D0431] uppercase font-bold">
                        LeetCode (20%)
                      </span>
                      <div className="text-xl font-heading font-black text-[#0D0431] mt-0.5">
                        {inspectedRole.dimensionScores.dsa}%
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-center">
                      <span className="text-[10px] font-mono text-[#0D0431] uppercase font-bold">
                        Resume ATS (16%)
                      </span>
                      <div className="text-xl font-heading font-black text-[#0D0431] mt-0.5">
                        {inspectedRole.dimensionScores.resume}%
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FFC5B7] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-center">
                      <span className="text-[10px] font-mono text-[#0D0431] uppercase font-bold">
                        Academics (12%)
                      </span>
                      <div className="text-xl font-heading font-black text-[#0D0431] mt-0.5">
                        {inspectedRole.dimensionScores.academics}%
                      </div>
                    </div>
                  </div>

                  {/* You Have vs You Need */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* You Have */}
                    <div className="p-5 rounded-3xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
                      <div className="flex items-center gap-2 text-[#0D0431] font-heading font-black text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>You Have (Verified Evidence)</span>
                      </div>
                      <div className="space-y-2">
                        {inspectedRole.strongMatchingEvidence.map((ev, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs font-bold text-[#0D0431] bg-white p-2.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                          >
                            <Check className="w-3.5 h-3.5 text-[#0D0431] mt-0.5 shrink-0" />
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* You Need */}
                    <div className="p-5 rounded-3xl bg-[#FFC5B7] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
                      <div className="flex items-center gap-2 text-[#0D0431] font-heading font-black text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>You Need (Gaps to Close)</span>
                      </div>
                      <div className="space-y-2">
                        {inspectedRole.missingSkills.length > 0 ? (
                          inspectedRole.missingSkills.map((gap, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-xs font-bold text-[#0D0431] bg-white p-2.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#F85B52]" />
                                <span>{gap.skill}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEDF6A] text-[#0D0431] border border-[#0D0431]">
                                {gap.priority} Priority
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-[#0D0431] font-bold p-3 bg-white rounded-xl border-2 border-[#0D0431]">
                            All core requirements are already matched in your profile.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Key Responsibilities */}
                  <div className="space-y-2 bg-white p-5 rounded-3xl border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431]">
                    <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                      Role Responsibilities in Industry
                    </h4>
                    <ul className="space-y-2 text-xs font-medium text-[#0D0431]">
                      {inspectedRole.keyResponsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#0D0431] font-bold">›</span>
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
                    <h4 className="text-base font-heading font-black text-[#0D0431]">
                      Actionable Roadmap to 95%+ Fit
                    </h4>
                    <p className="text-xs text-[#0D0431]/80 font-medium">
                      Complete these platform preparation modules to bridge your skill gaps for {inspectedRole.title}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Link
                      to="/app/dsa"
                      className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:-translate-y-0.5 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#0D0431] font-heading font-bold text-xs">
                          <div className="p-1 rounded-md bg-[#FEDF6A] border border-[#0D0431]">
                            <Code2 className="w-4 h-4 text-[#0D0431]" />
                          </div>
                          <span>DSA Problem Solving Arena</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-[#0D0431]/80 font-medium">
                        Target {inspectedRole.targetDsaSolvedCount}+ LeetCode pattern questions required by {inspectedRole.shortTitle} hiring bars.
                      </p>
                    </Link>

                    <Link
                      to="/app/coding"
                      className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:-translate-y-0.5 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#0D0431] font-heading font-bold text-xs">
                          <div className="p-1 rounded-md bg-[#CDE1FF] border border-[#0D0431]">
                            <Layers className="w-4 h-4 text-[#0D0431]" />
                          </div>
                          <span>CS Core & Machine Coding</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-[#0D0431]/80 font-medium">
                        Practice Low Level Design, SQL indexes, and concurrency for technical machine rounds.
                      </p>
                    </Link>

                    <Link
                      to="/app/roadmap"
                      className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:-translate-y-0.5 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#0D0431] font-heading font-bold text-xs">
                          <div className="p-1 rounded-md bg-[#E4CDFB] border border-[#0D0431]">
                            <Target className="w-4 h-4 text-[#0D0431]" />
                          </div>
                          <span>Placement Milestone Roadmap</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-[#0D0431]/80 font-medium">
                        Follow a week-by-week curriculum tailored for {inspectedRole.title} specifications.
                      </p>
                    </Link>

                    <Link
                      to="/app/resume"
                      className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:-translate-y-0.5 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#0D0431] font-heading font-bold text-xs">
                          <div className="p-1 rounded-md bg-[#D4FDF7] border border-[#0D0431]">
                            <FileText className="w-4 h-4 text-[#0D0431]" />
                          </div>
                          <span>Resume Keyword Optimizer</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-[#0D0431]/80 font-medium">
                        Inject Google XYZ impact bullets and verified technical keywords for {inspectedRole.title}.
                      </p>
                    </Link>
                  </div>
                </div>
              )}

              {inspectedTab === "jobs" && (
                <div className="space-y-4">
                  {/* Hiring loop breakdown */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
                    <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                      Standard Hiring Loop Structure
                    </h4>
                    <div className="space-y-2">
                      {inspectedRole.hiringBars.map((bar, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 text-xs font-bold text-[#0D0431] bg-[#FEF9CF] p-2.5 rounded-xl border-2 border-[#0D0431]"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#FEDF6A] text-[#0D0431] font-heading font-black text-xs flex items-center justify-center shrink-0 border-2 border-[#0D0431]">
                            {i + 1}
                          </span>
                          <span>{bar}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matched marketplace jobs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                      Live Matching Openings ({inspectedRole.matchedJobs.length})
                    </h4>
                    {inspectedRole.matchedJobs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {inspectedRole.matchedJobs.map((job) => (
                          <div
                            key={job._id || job.id}
                            className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex flex-col justify-between space-y-2"
                          >
                            <div>
                              <div className="text-xs font-heading font-black text-[#0D0431]">
                                {job.title}
                              </div>
                              <div className="text-[11px] text-[#0D0431]/80 font-bold">
                                {job.company || "Leading Employer"} • {job.location || "Remote / Hybrid"}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-2 border-t-2 border-[#0D0431]">
                              <span className="text-[#0D0431] font-mono font-bold">
                                {job.salary || "Competitive"}
                              </span>
                              <Link
                                to={`/app/can-i-apply?company=${encodeURIComponent(
                                  job.company || ""
                                )}&role=${encodeURIComponent(job.title || "")}`}
                                className="text-[#0D0431] hover:underline font-heading font-bold flex items-center gap-1"
                              >
                                Can I Apply?
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] text-[#0D0431]/70 font-bold text-xs text-center">
                        Browse all openings in the Job Matching arena.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t-2 border-[#0D0431] bg-[#FEDF6A] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#0D0431] font-bold">
                Avg Compensation:{" "}
                <span className="font-heading font-black text-sm text-[#0D0431]">
                  {inspectedRole.avgCompensation.inrRange}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <GpButton
                  onClick={() => setInspectedRole(null)}
                  variant="secondary"
                  size="sm"
                >
                  Close
                </GpButton>

                {!inspectedRole.isCurrentTarget ? (
                  <GpButton
                    onClick={() => {
                      setConfirmAdoptRole(inspectedRole);
                    }}
                    variant="stacked-coral"
                    size="sm"
                    icon={false}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Target className="w-4 h-4" />
                      <span>Make This My Target Career Role</span>
                    </span>
                  </GpButton>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-[#D4FDF7] text-[#0D0431] text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center gap-1.5">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0431]/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#FEF9CF] border-2 border-[#0D0431] p-6 shadow-[8px_8px_0_0_#0D0431] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FEDF6A] text-[#0D0431] flex items-center justify-center shrink-0 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-heading font-black text-[#0D0431]">
                  Confirm Target Career Goal
                </h3>
                <p className="text-xs text-[#0D0431]/70 font-medium">
                  Update your platform ambition
                </p>
              </div>
            </div>

            {adoptSuccessMessage ? (
              <div className="p-4 rounded-2xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0D0431]" />
                <span>{adoptSuccessMessage}</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-[#0D0431] bg-white p-4 rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] font-medium">
                <p>
                  Set <strong className="font-heading font-black text-[#0D0431]">"{confirmAdoptRole.title}"</strong> as your primary target career role?
                </p>
                <ul className="space-y-1 text-[#0D0431]/80 text-[11px] list-disc list-inside">
                  <li>Calculates gap benchmarks against {confirmAdoptRole.title} standards</li>
                  <li>Calibrates your personalized 8-week placement roadmap</li>
                  <li>Reranks job recommendations matching this specialization</li>
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <GpButton
                disabled={isAdopting}
                onClick={() => setConfirmAdoptRole(null)}
                variant="secondary"
                size="sm"
                fullWidth
              >
                Cancel
              </GpButton>
              <GpButton
                disabled={isAdopting}
                onClick={handleExecuteAdoption}
                variant="stacked-yellow"
                size="sm"
                fullWidth
                icon={false}
              >
                {isAdopting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Set Target</span>
                  </span>
                )}
              </GpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
