import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Briefcase,
  ExternalLink,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  Code2,
  FileText,
  BrainCog,
  GraduationCap,
  FolderGit2,
  TrendingUp,
  BookOpen,
  Compass,
  Check,
  Flame,
  Search,
  RefreshCw,
  Award,
  Clock,
  HelpCircle,
  Sliders,
  Globe,
  Database,
  ArrowUpRight,
} from "lucide-react";
import { NODE_API_URL, PY_API_URL } from "@/config/api";
import SearchableCombobox from "@/components/ui/SearchableCombobox";
import {
  POPULAR_COMPANIES,
  POPULAR_ROLES,
  evaluateApplicationReadiness,
} from "@/services/canIApplyService";

export default function CanIApply() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameter initializers
  const queryCompany = searchParams.get("company") || "";
  const queryRole = searchParams.get("role") || "";

  // Component State
  const [selectedCompany, setSelectedCompany] = useState(queryCompany || "Microsoft");
  const [selectedRole, setSelectedRole] = useState(
    queryRole || "Software Development Engineer (SDE 1)"
  );

  const [userProfile, setUserProfile] = useState(null);
  const [academicProfile, setAcademicProfile] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const [marketplaceJobs, setMarketplaceJobs] = useState([]);
  const [companyIntel, setCompanyIntel] = useState(null);

  const [loading, setLoading] = useState(true);
  const [expandedDimension, setExpandedDimension] = useState("eligibility"); // 'eligibility' | 'technical' | 'profile' | 'interview' | 'all'
  const [showOpeningsDrawer, setShowOpeningsDrawer] = useState(false);

  const containerRef = useRef(null);
  const resultsRef = useRef(null);

  // Fetch all user baseline profiles on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [
          profileRes,
          academicRes,
          readinessRes,
          githubRes,
          jobsRes,
        ] = await Promise.allSettled([
          axios.get(`${NODE_API_URL}/api/users/profile`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/academics/profile`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/readiness`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/github/profile`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/jobs`, { withCredentials: true }),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value?.data) {
          const u = profileRes.value.data;
          setUserProfile(u);
          // If no company was specified in query, set to user's saved target company
          if (!queryCompany && u.targetCompany) {
            setSelectedCompany(u.targetCompany);
          }
          if (!queryRole && u.targetJobRole) {
            setSelectedRole(u.targetJobRole);
          }
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

        if (jobsRes.status === "fulfilled" && jobsRes.value?.data?.jobs) {
          setMarketplaceJobs(jobsRes.value.data.jobs);
        }
      } catch (err) {
        console.warn("Could not retrieve all candidate profiles for Can I Apply evaluation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch Company Intelligence when company selection changes
  useEffect(() => {
    if (!selectedCompany) return;
    const fetchCompanyData = async () => {
      try {
        const res = await axios.get(`${PY_API_URL}/api/company/intelligence`, {
          params: { company: selectedCompany.trim() },
        });
        if (res.data) {
          setCompanyIntel(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch company intelligence for Can I Apply:", err?.message);
        setCompanyIntel(null);
      }
    };

    fetchCompanyData();
  }, [selectedCompany]);

  // Sync state with URL params
  const handleCompanyChange = (newCompany) => {
    setSelectedCompany(newCompany);
    setSearchParams(
      {
        company: newCompany,
        role: selectedRole,
      },
      { replace: true }
    );
  };

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    setSearchParams(
      {
        company: selectedCompany,
        role: newRole,
      },
      { replace: true }
    );
  };

  // Run the 4-dimension application readiness engine
  const evaluation = useMemo(() => {
    return evaluateApplicationReadiness({
      targetCompany: selectedCompany,
      targetRole: selectedRole,
      userProfile,
      academicProfile,
      readinessData,
      githubProfile,
      companyIntelligence: companyIntel,
    });
  }, [
    selectedCompany,
    selectedRole,
    userProfile,
    academicProfile,
    readinessData,
    githubProfile,
    companyIntel,
  ]);

  // Filter open jobs in GetPlaced Jobs marketplace for selected employer
  const matchingMarketplaceJobs = useMemo(() => {
    if (!marketplaceJobs || marketplaceJobs.length === 0 || !selectedCompany) return [];
    const searchTarget = selectedCompany.toLowerCase().trim();
    return marketplaceJobs.filter((j) => {
      const comp = (j.company || "").toLowerCase();
      const compNorm = (j.companyNormalized || "").toLowerCase();
      return (
        comp.includes(searchTarget) ||
        searchTarget.includes(comp) ||
        compNorm.includes(searchTarget)
      );
    });
  }, [marketplaceJobs, selectedCompany]);

  // GSAP animations on update
  useGSAP(() => {
    if (resultsRef.current && !loading) {
      gsap.fromTo(
        resultsRef.current.querySelectorAll(".eval-card"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [selectedCompany, selectedRole, loading]);

  const { decision, dimensions, topCriticalRisks, coveredStrengths, benchmark } = evaluation;

  return (
    <main
      className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#11110F] text-[#FAF8F2] font-sans selection:bg-[#C7F36B] selection:text-[#11110F]"
      ref={containerRef}
    >
      {/* Ambient Lighting Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[950px] h-[450px] bg-gradient-to-b from-[#C7F36B]/6 via-[#24231F]/30 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-[#C7F36B]/3 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TOP NAVIGATION HEADER */}
        {/* ========================================================================= */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#3A3831]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#24231F] border border-[#3A3831] flex items-center justify-center text-[#C7F36B] shadow-lg shadow-black/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest font-mono text-[#A8A59C] font-semibold flex items-center gap-2">
                <span>Application Readiness Engine</span>
                <span className="px-2 py-0.2 rounded-full bg-[#C7F36B]/10 text-[#C7F36B] text-[10px] font-bold border border-[#C7F36B]/20">
                  Pre-Apply Audit
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-[#FAF8F2] tracking-tight">
                "Can I Apply?" Readiness Check
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/app/company-intel?company=" + encodeURIComponent(selectedCompany))}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#24231F] hover:bg-[#2e2d27] text-[#FAF8F2] border border-[#3A3831] transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-[#C7F36B]" />
              <span>{selectedCompany} Intel</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/job?search=" + encodeURIComponent(selectedCompany))}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#24231F] hover:bg-[#2e2d27] text-[#FAF8F2] border border-[#3A3831] transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#C7F36B]" />
              <span>Jobs Marketplace</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/interview")}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C7F36B] hover:bg-[#bbf055] text-[#11110F] shadow-lg shadow-[#C7F36B]/20 transition-all flex items-center gap-1.5"
            >
              <BrainCog className="w-3.5 h-3.5" />
              <span>Mock Interview</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* HERO TITLE & TARGET COMPANY / ROLE SELECTOR BAR */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="max-w-4xl space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FAF8F2] tracking-tight leading-[1.1]">
              Know before you apply: cutoffs, skills, and interview readiness.
            </h1>
            <p className="text-sm sm:text-base text-[#A8A59C] leading-relaxed">
              Real-time audit across 4 distinct dimensions: Academic Cutoffs, DSA & Technical Depth, GitHub & ATS Profile, and Behavioral Interview bar.
            </p>
          </div>

          {/* Target Selector Command Suite */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#24231F] border border-[#3A3831] shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3A3831]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C7F36B]" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#FAF8F2]">
                  Target Company & Role Calibration
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#8C8980]">
                Calibrated against verified engineering hiring bars
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Company Selector */}
              <div>
                <SearchableCombobox
                  id="target-company-select"
                  name="targetCompany"
                  label="Target Company"
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  options={POPULAR_COMPANIES}
                  placeholder="Select or type company (e.g. Google, Microsoft, Uber)..."
                  icon={Building2}
                  quickSuggestions={["Microsoft", "Google", "Amazon", "Uber", "Atlassian", "Stripe", "Razorpay"]}
                  customPromptPrefix="Evaluate for"
                  helperText="Switch to any company to recalculate"
                />
              </div>

              {/* Target Role Selector */}
              <div>
                <SearchableCombobox
                  id="target-role-select"
                  name="targetRole"
                  label="Target Job Role"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  options={POPULAR_ROLES}
                  placeholder="Select or type role (e.g. SDE 1, Frontend, Backend)..."
                  icon={Briefcase}
                  quickSuggestions={[
                    "Software Development Engineer (SDE 1)",
                    "Backend Infrastructure Engineer",
                    "Frontend Platform Engineer",
                  ]}
                  customPromptPrefix="Calibrate for"
                  helperText="Adjusts DSA and stack weights"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXECUTIVE DECISION HERO BANNER (READY / ALMOST READY / BLOCKER) */}
        {/* ========================================================================= */}
        <section ref={resultsRef} className="space-y-6">
          <div
            className={`eval-card rounded-3xl border p-6 sm:p-8 relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
              decision.state === "READY"
                ? "bg-gradient-to-br from-[#1b2b18] via-[#24231F] to-[#1a2416] border-[#C7F36B]/40 shadow-xl shadow-[#C7F36B]/5"
                : decision.state === "ALMOST_READY"
                ? "bg-gradient-to-br from-[#2d2817] via-[#24231F] to-[#1f1c14] border-amber-500/40 shadow-xl shadow-amber-500/5"
                : "bg-gradient-to-br from-[#30181b] via-[#24231F] to-[#201416] border-rose-500/40 shadow-xl shadow-rose-500/5"
            }`}
          >
            {/* Ambient Badge Glow */}
            <div
              className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
                decision.state === "READY"
                  ? "bg-[#C7F36B]/10"
                  : decision.state === "ALMOST_READY"
                  ? "bg-amber-500/10"
                  : "bg-rose-500/10"
              }`}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide uppercase border ${decision.badgeBg}`}
                  >
                    {decision.state === "READY" && <CheckCircle2 className="w-4 h-4" />}
                    {decision.state === "ALMOST_READY" && <AlertTriangle className="w-4 h-4" />}
                    {(decision.state === "NOT_READY" || decision.state === "HARD_BLOCKER") && (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>{decision.title}</span>
                  </span>

                  <span className="text-xs font-mono text-[#A8A59C]">
                    Calibrated for <strong className="text-[#FAF8F2]">{benchmark.name}</strong> • {selectedRole}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#FAF8F2] tracking-tight">
                  {decision.subtitle}
                </h2>

                <p className="text-xs sm:text-sm text-[#A8A59C] leading-relaxed">
                  {decision.state === "HARD_BLOCKER"
                    ? `You currently have strict eligibility constraints (e.g. CGPA < ${benchmark.minCgpa} or standing backlogs). Address eligibility requirements before submitting official applications.`
                    : decision.state === "READY"
                    ? `Your composite readiness score meets ${benchmark.name}'s hiring standard across DSA, Projects, ATS Resume, and Behavioral interview dimensions.`
                    : decision.state === "ALMOST_READY"
                    ? `You meet academic eligibility and have strong baseline skills, but 3 targeted risk areas should be resolved to maximize your interview conversion rate.`
                    : `Your baseline score is currently developing. Follow the prioritized fix triggers below to build your foundation before applying.`}
                </p>
              </div>

              {/* Composite Readiness Gauge Card */}
              <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 w-full sm:w-auto">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#11110F]/80 border border-[#3A3831] w-full sm:w-64 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8C8980] uppercase font-bold">
                      Composite Readiness
                    </span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        decision.state === "READY"
                          ? "text-[#C7F36B]"
                          : decision.state === "ALMOST_READY"
                          ? "text-amber-300"
                          : "text-rose-400"
                      }`}
                    >
                      {decision.compositeScore}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#24231F] rounded-full overflow-hidden border border-[#3A3831]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        decision.state === "READY"
                          ? "bg-[#C7F36B]"
                          : decision.state === "ALMOST_READY"
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, decision.compositeScore))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A59C]">
                    <span>Target Bar: {benchmark.targetDsaScore}%</span>
                    <span>
                      {decision.compositeScore >= benchmark.targetDsaScore
                        ? "Bar Met (+0)"
                        : `-${benchmark.targetDsaScore - decision.compositeScore} pts`}
                    </span>
                  </div>
                </div>

                {/* Quick Real Jobs Shortcut Trigger */}
                {matchingMarketplaceJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowOpeningsDrawer(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#24231F] hover:bg-[#2e2d27] border border-[#3A3831] text-xs font-semibold text-[#FAF8F2] flex items-center justify-center gap-2 transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#C7F36B]" />
                    <span>View {matchingMarketplaceJobs.length} Live Openings</span>
                    <ArrowRight className="w-3 h-3 text-[#A8A59C]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4 DISTINCT, UNMIXED EVALUATION DIMENSIONS (PROGRESSIVE CARDS) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* DIMENSION 1: ELIGIBILITY CHECK */}
            <div
              onClick={() => setExpandedDimension(expandedDimension === "eligibility" ? "all" : "eligibility")}
              className={`eval-card p-5 rounded-3xl bg-[#24231F] border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                expandedDimension === "eligibility" || expandedDimension === "all"
                  ? "border-[#C7F36B]/60 shadow-lg shadow-black/40"
                  : "border-[#3A3831] hover:border-[#3A3831]/80"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#11110F] border border-[#3A3831] text-[#C7F36B] group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      dimensions.eligibility.isPassed
                        ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                        : dimensions.eligibility.hasBlocker
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {dimensions.eligibility.status}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#8C8980] font-bold">
                    Dimension 1
                  </div>
                  <h3 className="text-base font-bold text-[#FAF8F2] tracking-tight group-hover:text-[#C7F36B] transition-colors">
                    Eligibility Check
                  </h3>
                </div>

                <div className="text-xs text-[#A8A59C] space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Cutoff:</span>
                    <span className="text-[#FAF8F2] font-semibold">{benchmark.minCgpa} CGPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your CGPA:</span>
                    <span
                      className={`font-bold ${
                        (academicProfile?.currentCgpa || userProfile?.cgpa || 8.0) >= benchmark.minCgpa
                          ? "text-[#C7F36B]"
                          : "text-rose-400"
                      }`}
                    >
                      {(academicProfile?.currentCgpa || userProfile?.cgpa || 8.0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backlogs:</span>
                    <span className="text-[#FAF8F2]">
                      {academicProfile?.activeBacklogs || userProfile?.activeBacklogs || 0} (Max {benchmark.maxActiveBacklogs})
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#3A3831] flex items-center justify-between text-[11px] font-mono text-[#C7F36B]">
                <span>{expandedDimension === "eligibility" ? "Hide Checklist" : "Expand Checklist"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedDimension === "eligibility" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* DIMENSION 2: TECHNICAL READINESS % */}
            <div
              onClick={() => setExpandedDimension(expandedDimension === "technical" ? "all" : "technical")}
              className={`eval-card p-5 rounded-3xl bg-[#24231F] border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                expandedDimension === "technical" || expandedDimension === "all"
                  ? "border-[#C7F36B]/60 shadow-lg shadow-black/40"
                  : "border-[#3A3831] hover:border-[#3A3831]/80"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#11110F] border border-[#3A3831] text-[#C7F36B] group-hover:scale-105 transition-transform">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      dimensions.technical.isPassed
                        ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {dimensions.technical.score}% Readiness
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#8C8980] font-bold">
                    Dimension 2
                  </div>
                  <h3 className="text-base font-bold text-[#FAF8F2] tracking-tight group-hover:text-[#C7F36B] transition-colors">
                    Technical Readiness
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-1.5 bg-[#11110F] rounded-full overflow-hidden border border-[#3A3831]">
                    <div
                      className="h-full bg-[#C7F36B] rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, dimensions.technical.score))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#A8A59C] line-clamp-2">
                    DSA Patterns ({benchmark.dsaKeyTopics[0]}), Core CS & Concurrency.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#3A3831] flex items-center justify-between text-[11px] font-mono text-[#C7F36B]">
                <span>{expandedDimension === "technical" ? "Hide Checklist" : "Expand Checklist"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedDimension === "technical" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* DIMENSION 3: PROFILE READINESS % */}
            <div
              onClick={() => setExpandedDimension(expandedDimension === "profile" ? "all" : "profile")}
              className={`eval-card p-5 rounded-3xl bg-[#24231F] border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                expandedDimension === "profile" || expandedDimension === "all"
                  ? "border-[#C7F36B]/60 shadow-lg shadow-black/40"
                  : "border-[#3A3831] hover:border-[#3A3831]/80"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#11110F] border border-[#3A3831] text-[#C7F36B] group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      dimensions.profile.isPassed
                        ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {dimensions.profile.score}% Readiness
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#8C8980] font-bold">
                    Dimension 3
                  </div>
                  <h3 className="text-base font-bold text-[#FAF8F2] tracking-tight group-hover:text-[#C7F36B] transition-colors">
                    Profile & Resume
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-1.5 bg-[#11110F] rounded-full overflow-hidden border border-[#3A3831]">
                    <div
                      className="h-full bg-sky-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, dimensions.profile.score))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#A8A59C] line-clamp-2">
                    GitHub Codebase Depth, Resume ATS Score & Google XYZ Bullets.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#3A3831] flex items-center justify-between text-[11px] font-mono text-[#C7F36B]">
                <span>{expandedDimension === "profile" ? "Hide Checklist" : "Expand Checklist"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedDimension === "profile" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* DIMENSION 4: INTERVIEW READINESS % */}
            <div
              onClick={() => setExpandedDimension(expandedDimension === "interview" ? "all" : "interview")}
              className={`eval-card p-5 rounded-3xl bg-[#24231F] border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                expandedDimension === "interview" || expandedDimension === "all"
                  ? "border-[#C7F36B]/60 shadow-lg shadow-black/40"
                  : "border-[#3A3831] hover:border-[#3A3831]/80"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#11110F] border border-[#3A3831] text-[#C7F36B] group-hover:scale-105 transition-transform">
                    <BrainCog className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      dimensions.interview.isPassed
                        ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {dimensions.interview.score}% Readiness
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#8C8980] font-bold">
                    Dimension 4
                  </div>
                  <h3 className="text-base font-bold text-[#FAF8F2] tracking-tight group-hover:text-[#C7F36B] transition-colors">
                    Interview & Soft Skills
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-1.5 bg-[#11110F] rounded-full overflow-hidden border border-[#3A3831]">
                    <div
                      className="h-full bg-purple-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, dimensions.interview.score))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#A8A59C] line-clamp-2">
                    Speech Clarity, STAR Behavioral & {benchmark.name} Values.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#3A3831] flex items-center justify-between text-[11px] font-mono text-[#C7F36B]">
                <span>{expandedDimension === "interview" ? "Hide Checklist" : "Expand Checklist"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedDimension === "interview" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* PROGRESSIVE DISCLOSURE: EXPANDABLE REQUIREMENT CHECKLISTS */}
          {/* ========================================================================= */}
          <div className="eval-card p-6 sm:p-8 rounded-3xl bg-[#24231F] border border-[#3A3831] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#3A3831]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#11110F] border border-[#3A3831] text-[#C7F36B]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FAF8F2] tracking-tight">
                    Comprehensive Requirement Breakdown
                  </h3>
                  <p className="text-xs text-[#A8A59C]">
                    Detailed verification criteria calibrated against {benchmark.name}'s official hiring bar
                  </p>
                </div>
              </div>

              {/* Dimension Switch Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-[#11110F] p-1 rounded-2xl border border-[#3A3831]">
                {[
                  { id: "eligibility", label: "Eligibility", icon: GraduationCap },
                  { id: "technical", label: "Technical DSA", icon: Code2 },
                  { id: "profile", label: "Profile & ATS", icon: FileText },
                  { id: "interview", label: "Behavioral & Mock", icon: BrainCog },
                  { id: "all", label: "View All", icon: Layers },
                ].map((tab) => {
                  const isActive = expandedDimension === tab.id;
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setExpandedDimension(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#C7F36B] text-[#11110F] font-bold shadow-md shadow-[#C7F36B]/20"
                          : "text-[#A8A59C] hover:text-[#FAF8F2] hover:bg-[#24231F]"
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-[#11110F]" : "text-[#8C8980]"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB CONTENT: 1. ELIGIBILITY */}
            {(expandedDimension === "eligibility" || expandedDimension === "all") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#C7F36B] tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>Dimension 1: Academic & Recruitment Eligibility Criteria</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      dimensions.eligibility.isPassed
                        ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {dimensions.eligibility.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {dimensions.eligibility.checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        item.isPassed
                          ? "bg-[#11110F]/60 border-[#3A3831]"
                          : item.isBlocker
                          ? "bg-rose-950/20 border-rose-800/40"
                          : "bg-amber-950/20 border-amber-800/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-[#FAF8F2]">{item.label}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                            item.isPassed
                              ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                              : item.isBlocker
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {item.statusText}
                        </span>
                      </div>

                      <div className="text-xs text-[#A8A59C] space-y-0.5 font-mono">
                        <div>Required: <span className="text-[#FAF8F2]">{item.required}</span></div>
                        <div>Your Profile: <span className="text-[#FAF8F2] font-semibold">{item.actual}</span></div>
                      </div>

                      <p className="text-[11px] text-[#8C8980] pt-1 leading-relaxed">{item.detail}</p>

                      {!item.isPassed && item.fixAction && (
                        <div className="pt-2">
                          <Link
                            to={item.fixAction.url}
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#C7F36B] hover:underline"
                          >
                            <span>{item.fixAction.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. TECHNICAL DSA & SYSTEM DESIGN */}
            {(expandedDimension === "technical" || expandedDimension === "all") && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#C7F36B] tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" />
                    <span>Dimension 2: Algorithmic & Computer Science Calibration</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#A8A59C]">
                    Benchmarked Score: {dimensions.technical.score}% / {benchmark.targetDsaScore}%
                  </span>
                </div>

                <div className="space-y-3">
                  {dimensions.technical.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#11110F]/60 border border-[#3A3831] space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#FAF8F2]">{item.label}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.2 rounded border ${
                              item.isPassed
                                ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {item.isPassed ? "Benchmarked ✓" : `-${item.gap} pts Deficit`}
                          </span>
                        </div>
                        <p className="text-xs text-[#A8A59C]">{item.detail}</p>
                        <div className="text-[11px] font-mono text-[#8C8980]">{item.targetText}</div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold font-mono text-[#FAF8F2]">
                            {item.currentScore}%
                          </div>
                          <div className="text-[10px] font-mono text-[#8C8980]">Current</div>
                        </div>

                        <Link
                          to={item.fixLink}
                          className="px-3 py-1.5 rounded-xl bg-[#24231F] hover:bg-[#2e2d27] border border-[#3A3831] hover:border-[#C7F36B]/40 text-xs font-semibold text-[#FAF8F2] flex items-center gap-1.5 transition-all"
                        >
                          <span>{item.fixLabel}</span>
                          <ArrowRight className="w-3 h-3 text-[#C7F36B]" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. PROFILE & RESUME ATS */}
            {(expandedDimension === "profile" || expandedDimension === "all") && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#C7F36B] tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Dimension 3: GitHub Engineering Depth & ATS Screening</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#A8A59C]">
                    Benchmarked Score: {dimensions.profile.score}% / {benchmark.targetProjectScore}%
                  </span>
                </div>

                <div className="space-y-3">
                  {dimensions.profile.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#11110F]/60 border border-[#3A3831] space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#FAF8F2]">{item.label}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.2 rounded border ${
                              item.isPassed
                                ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {item.isPassed ? "Benchmarked ✓" : `-${item.gap} pts Deficit`}
                          </span>
                        </div>
                        <p className="text-xs text-[#A8A59C]">{item.detail}</p>
                        <div className="text-[11px] font-mono text-[#8C8980]">{item.targetText}</div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold font-mono text-[#FAF8F2]">
                            {item.currentScore}%
                          </div>
                          <div className="text-[10px] font-mono text-[#8C8980]">Current</div>
                        </div>

                        <Link
                          to={item.fixLink}
                          className="px-3 py-1.5 rounded-xl bg-[#24231F] hover:bg-[#2e2d27] border border-[#3A3831] hover:border-[#C7F36B]/40 text-xs font-semibold text-[#FAF8F2] flex items-center gap-1.5 transition-all"
                        >
                          <span>{item.fixLabel}</span>
                          <ArrowRight className="w-3 h-3 text-[#C7F36B]" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. BEHAVIORAL & INTERVIEW */}
            {(expandedDimension === "interview" || expandedDimension === "all") && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#C7F36B] tracking-wider flex items-center gap-1.5">
                    <BrainCog className="w-4 h-4" />
                    <span>Dimension 4: Communication & Leadership Principles ({benchmark.behavioralPillars[0]})</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#A8A59C]">
                    Benchmarked Score: {dimensions.interview.score}% / {benchmark.targetBehavioralScore}%
                  </span>
                </div>

                <div className="space-y-3">
                  {dimensions.interview.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#11110F]/60 border border-[#3A3831] space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#FAF8F2]">{item.label}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.2 rounded border ${
                              item.isPassed
                                ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {item.isPassed ? "Benchmarked ✓" : `-${item.gap} pts Deficit`}
                          </span>
                        </div>
                        <p className="text-xs text-[#A8A59C]">{item.detail}</p>
                        <div className="text-[11px] font-mono text-[#8C8980]">{item.targetText}</div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold font-mono text-[#FAF8F2]">
                            {item.currentScore}%
                          </div>
                          <div className="text-[10px] font-mono text-[#8C8980]">Current</div>
                        </div>

                        <Link
                          to={item.fixLink}
                          className="px-3 py-1.5 rounded-xl bg-[#24231F] hover:bg-[#2e2d27] border border-[#3A3831] hover:border-[#C7F36B]/40 text-xs font-semibold text-[#FAF8F2] flex items-center gap-1.5 transition-all"
                        >
                          <span>{item.fixLabel}</span>
                          <ArrowRight className="w-3 h-3 text-[#C7F36B]" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* TOP 3 CRITICAL RISKS / GAPS & "FIX FIRST" ACTION TRIGGERS */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-semibold text-[#FAF8F2] uppercase tracking-widest font-mono">
                  Top Priority Risks to Fix Before Applying
                </h3>
              </div>
              <span className="text-[11px] text-[#8C8980] font-mono">
                Direct closure actions targeting {benchmark.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCriticalRisks.map((gap, gIdx) => (
                <div
                  key={gap.id || gIdx}
                  className="eval-card p-5 rounded-3xl bg-[#24231F] border border-[#3A3831] hover:border-[#3A3831]/80 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#8C8980] font-bold">
                        {gap.pillar}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          gap.color === "rose"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : gap.color === "amber"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                        }`}
                      >
                        {gap.impact}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#FAF8F2] tracking-tight group-hover:text-[#C7F36B] transition-colors">
                      {gap.title}
                    </h4>

                    <p className="text-xs text-[#A8A59C] leading-relaxed">
                      {gap.description}
                    </p>
                  </div>

                  <Link
                    to={gap.actionUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#11110F] hover:bg-[#1A1916] border border-[#3A3831] hover:border-[#C7F36B]/50 text-xs font-bold text-[#FAF8F2] hover:text-[#C7F36B] transition-all flex items-center justify-between font-mono"
                  >
                    <span>{gap.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* POSITIVE REINFORCEMENT: "WHAT IS ALREADY COVERED?" */}
          {/* ========================================================================= */}
          {coveredStrengths.length > 0 && (
            <div className="eval-card p-6 sm:p-8 rounded-3xl bg-[#24231F]/90 border border-[#3A3831] space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#3A3831]">
                <CheckCircle2 className="w-4 h-4 text-[#C7F36B]" />
                <h3 className="text-xs font-mono uppercase font-bold text-[#C7F36B] tracking-wider">
                  What is already covered? (Your Competitive Strengths)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {coveredStrengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#11110F]/60 border border-[#3A3831] space-y-1"
                  >
                    <div className="text-xs font-bold text-[#FAF8F2] flex items-center gap-1.5">
                      <span className="text-[#C7F36B] font-bold">✓</span>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[#A8A59C] leading-relaxed font-mono">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* REAL JOB LINK INTEGRATION & OFFICIAL CAREERS ACTION */}
          {/* ========================================================================= */}
          <div className="eval-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#24231F] via-[#1b1a17] to-[#24231F] border border-[#3A3831] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C7F36B]" />
                  <span className="text-xs font-mono uppercase font-bold text-[#FAF8F2]">
                    Verified Openings & Official Careers Pipeline
                  </span>
                </div>
                <p className="text-xs text-[#A8A59C]">
                  Direct access to real opportunities at {benchmark.name} — no fake application submissions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {matchingMarketplaceJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowOpeningsDrawer(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#24231F] hover:bg-[#2e2d27] border border-[#3A3831] text-xs font-bold text-[#FAF8F2] transition-all flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#C7F36B]" />
                    <span>View {matchingMarketplaceJobs.length} In GetPlaced Marketplace</span>
                  </button>
                )}

                <a
                  href={benchmark.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#bbf055] text-[#11110F] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C7F36B]/20 transition-all flex items-center gap-2"
                >
                  <span>Apply on Official Careers</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* If open jobs exist in GetPlaced Jobs marketplace, display interactive mini cards */}
            {matchingMarketplaceJobs.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[#3A3831]">
                <span className="text-[11px] font-mono uppercase text-[#8C8980] font-bold block">
                  Active Verified Openings in GetPlaced Jobs Database ({matchingMarketplaceJobs.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matchingMarketplaceJobs.slice(0, 3).map((job, idx) => (
                    <div
                      key={job.jobId || idx}
                      className="p-4 rounded-2xl bg-[#11110F] border border-[#3A3831] hover:border-[#C7F36B]/40 transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8980]">
                          <span>{job.workMode || "Hybrid"}</span>
                          <span className="text-[#C7F36B]">{job.salary || "Competitive"}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#FAF8F2] line-clamp-1 mt-1">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-[#A8A59C] line-clamp-2 mt-0.5">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#3A3831]/60 text-[10px] font-mono">
                        <span className="text-[#8C8980]">Min CGPA: {job.cgpaCutoff || benchmark.minCgpa}</span>
                        <Link
                          to={`/app/job?search=${encodeURIComponent(job.company)}`}
                          className="text-[#C7F36B] hover:underline flex items-center gap-1 font-bold"
                        >
                          <span>Open Listing</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </section>

      </div>

      {/* ========================================================================= */}
      {/* OPENINGS SLIDE-OVER DRAWER MODAL */}
      {/* ========================================================================= */}
      {showOpeningsDrawer && (
        <div
          onClick={() => setShowOpeningsDrawer(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#11110F] border border-[#3A3831] rounded-3xl max-w-2xl w-full max-h-[85vh] p-6 space-y-4 shadow-2xl flex flex-col overflow-hidden text-[#FAF8F2]"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#3A3831]">
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase text-[#C7F36B] font-bold">
                  GetPlaced Jobs Radar
                </div>
                <h3 className="text-lg font-bold text-[#FAF8F2]">
                  Available Positions at {benchmark.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOpeningsDrawer(false)}
                className="p-1.5 rounded-lg text-[#A8A59C] hover:text-[#FAF8F2] hover:bg-[#24231F] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {matchingMarketplaceJobs.map((job, idx) => (
                <div
                  key={job.jobId || idx}
                  className="p-4 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#FAF8F2]">{job.title}</h4>
                      <p className="text-xs text-[#A8A59C] font-mono">
                        {job.location} • {job.workMode || "Hybrid"} • {job.experience || "0-2 years"}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#C7F36B] shrink-0">
                      {job.salary}
                    </span>
                  </div>

                  <p className="text-xs text-[#A8A59C] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#3A3831] text-xs font-mono">
                    <span className="text-[11px] text-[#8C8980]">
                      Cutoff: {job.cgpaCutoff || benchmark.minCgpa} CGPA
                    </span>
                    <a
                      href={job.applicationUrl || benchmark.careersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-[#C7F36B] text-[#11110F] font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#3A3831] flex justify-between items-center text-xs text-[#8C8980] font-mono">
              <span>All listings sourced and verified from official career feeds.</span>
              <button
                type="button"
                onClick={() => {
                  setShowOpeningsDrawer(false);
                  navigate(`/app/job?search=${encodeURIComponent(benchmark.name)}`);
                }}
                className="text-[#C7F36B] hover:underline font-bold"
              >
                Open in Jobs Center &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
