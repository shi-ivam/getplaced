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
  X,
  Plus,
} from "lucide-react";
import { NODE_API_URL, PY_API_URL } from "@/config/api";
import {
  POPULAR_COMPANIES,
  POPULAR_ROLES,
  evaluateApplicationReadiness,
} from "@/services/canIApplyService";
import CaideCard from "@/components/caide/CaideCard";
import CaideBadge from "@/components/caide/CaideBadge";
import CaideButton from "@/components/caide/CaideButton";

/**
 * Caide-themed Searchable Combobox with retro 2px border and hard drop shadow
 */
function CaideCombobox({
  id,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Select or type...",
  label,
  required = false,
  error,
  icon: Icon,
  quickSuggestions = [],
  customPromptPrefix = "Use",
  helperText,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSearchQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (searchQuery.trim() !== (value || "")) {
          if (!searchQuery.trim()) {
            onChange("");
          } else {
            onChange(searchQuery.trim());
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery, value, onChange]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const isExactMatch = options.some(
    (option) => option.toLowerCase() === searchQuery.toLowerCase().trim()
  );

  const showCustomOption = searchQuery.trim().length > 0 && !isExactMatch;
  const totalItemsCount = (showCustomOption ? 1 : 0) + filteredOptions.length;

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setSearchQuery(selectedValue);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (totalItemsCount || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + (totalItemsCount || 1)) % (totalItemsCount || 1)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showCustomOption && highlightedIndex === 0) {
        handleSelect(searchQuery.trim());
      } else {
        const optionIndex = showCustomOption
          ? highlightedIndex - 1
          : highlightedIndex;
        if (filteredOptions[optionIndex]) {
          handleSelect(filteredOptions[optionIndex]);
        } else if (searchQuery.trim()) {
          handleSelect(searchQuery.trim());
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-1.5 w-full" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="text-[#0D0431] text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            {Icon && <Icon className="w-4 h-4 text-[#0D0431]" />}
            <span>{label}</span>
            {required && <span className="text-[#F85B52]">*</span>}
          </label>
          {helperText && (
            <span className="text-[11px] text-[#0D0431]/70 font-mono font-medium">
              {helperText}
            </span>
          )}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0D0431]/60">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full h-11 pl-10 pr-14 rounded-xl bg-white border-2 border-[#0D0431] text-[#0D0431] text-sm font-sans font-bold placeholder-[#0D0431]/40 shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] focus:shadow-[4px_4px_0_0_#0D0431] transition-all ${
            error ? "border-[#F85B52]" : ""
          }`}
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#0D0431]/60 hover:text-[#0D0431] rounded-lg hover:bg-[#FEDF6A] transition-colors"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (!isOpen && inputRef.current) {
                inputRef.current.focus();
              }
            }}
            className="p-1.5 text-[#0D0431] rounded-lg hover:bg-[#FEDF6A] transition-colors cursor-pointer"
            tabIndex={-1}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1.5 w-full max-h-60 overflow-y-auto rounded-2xl bg-white border-2 border-[#0D0431] shadow-[6px_6px_0_0_#0D0431] py-1 text-sm font-sans">
            {/* Custom option prompt */}
            {showCustomOption && (
              <button
                type="button"
                onClick={() => handleSelect(searchQuery.trim())}
                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between border-b-2 border-[#0D0431] transition-colors ${
                  highlightedIndex === 0
                    ? "bg-[#FEDF6A] text-[#0D0431] font-bold"
                    : "hover:bg-[#FEF9CF] text-[#0D0431]"
                }`}
              >
                <div className="flex items-center gap-2 truncate font-medium">
                  <Plus className="w-4 h-4 text-[#0D0431] shrink-0" />
                  <span className="truncate">
                    {customPromptPrefix}{" "}
                    <strong className="text-[#0D0431] font-bold">
                      "{searchQuery.trim()}"
                    </strong>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E4CDFB] text-[#0D0431] border border-[#0D0431] uppercase font-mono font-bold tracking-wider shrink-0 ml-2">
                  Custom
                </span>
              </button>
            )}

            {/* Filtered suggestions */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => {
                const itemIndex = showCustomOption ? idx + 1 : idx;
                const isSelected =
                  value.toLowerCase() === option.toLowerCase();
                const isHighlighted = highlightedIndex === itemIndex;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors ${
                      isHighlighted
                        ? "bg-[#FEDF6A] text-[#0D0431] font-bold"
                        : isSelected
                        ? "bg-[#FEF9CF] text-[#0D0431] font-bold"
                        : "text-[#0D0431] hover:bg-[#FEF9CF]"
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0D0431] shrink-0 ml-2 font-bold" />
                    )}
                  </button>
                );
              })
            ) : !showCustomOption ? (
              <div className="px-3.5 py-3 text-center text-xs text-[#0D0431]/70 font-medium">
                No matching options found.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Quick suggestions pills */}
      {quickSuggestions && quickSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#0D0431]/70 font-mono font-bold mr-1">
            Popular:
          </span>
          {quickSuggestions.map((item) => {
            const isSelected = value.toLowerCase() === item.toLowerCase();
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleSelect(item)}
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-all border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] cursor-pointer ${
                  isSelected
                    ? "bg-[#0D0431] text-[#FEF9CF]"
                    : "bg-[#FEF9CF] hover:bg-[#FEDF6A] text-[#0D0431]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-[#F85B52] text-xs font-bold mt-1">{error}</p>
      )}
    </div>
  );
}

export default function CanIApply() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Query parameter initializers
  const queryCompany = searchParams.get("company") || "";
  const queryRole = searchParams.get("role") || "";

  // Component State
  const [selectedCompany, setSelectedCompany] = useState(
    queryCompany || "Microsoft"
  );
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
          axios.get(`${NODE_API_URL}/api/users/profile`, {
            withCredentials: true,
          }),
          axios.get(`${NODE_API_URL}/api/academics/profile`, {
            withCredentials: true,
          }),
          axios.get(`${NODE_API_URL}/api/readiness`, {
            withCredentials: true,
          }),
          axios.get(`${NODE_API_URL}/api/github/profile`, {
            withCredentials: true,
          }),
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

        if (
          academicRes.status === "fulfilled" &&
          academicRes.value?.data?.academic
        ) {
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
        console.warn(
          "Could not retrieve all candidate profiles for Can I Apply evaluation:",
          err
        );
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
        console.warn(
          "Could not fetch company intelligence for Can I Apply:",
          err?.message
        );
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
    if (!marketplaceJobs || marketplaceJobs.length === 0 || !selectedCompany)
      return [];
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

  const {
    decision,
    dimensions,
    topCriticalRisks,
    coveredStrengths,
    benchmark,
  } = evaluation;

  return (
    <div
      className="space-y-6 pb-20 font-sans text-[#17103D]"
      ref={containerRef}
    >
      {/* ========================================================================= */}
      {/* TOP NAVIGATION HEADER */}
      {/* ========================================================================= */}
      <div className="pb-4 border-b border-[#E2DEEC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17103D] text-[#FFD84D] flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-heading font-black text-[#17103D] tracking-tight">
                  Can I Apply?
                </h1>
                <CaideBadge theme="mint" size="sm">
                  Placement Eligibility Engine
                </CaideBadge>
              </div>
              <p className="text-xs text-[#6F6A80] font-medium">
                Simulate your actual shortlisting probability against 35+ verified company recruitment rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => navigate("/app/role-fit")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2F0FA] text-[#17103D] border border-[#E2DEEC] font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Role Fit AI
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/academics")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2F0FA] text-[#17103D] border border-[#E2DEEC] font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Academics
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/jobs")}
              className="px-3.5 py-1.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white font-bold transition-all shadow-sm cursor-pointer"
            >
              Jobs Market
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO TITLE & TARGET COMPANY / ROLE SELECTOR BAR */}
      {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="max-w-4xl space-y-2">
            <CaideBadge theme="mint" size="md">
              Eligibility & Hiring Bar Engine
            </CaideBadge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-[#0D0431] tracking-tight leading-[1.1]">
              Know before you apply: cutoffs, skills, and interview readiness.
            </h1>
            <p className="text-sm sm:text-base text-[#0D0431]/80 font-medium leading-relaxed">
              Real-time audit across 4 distinct dimensions: Academic Cutoffs, DSA & Technical Depth, GitHub & ATS Profile, and Behavioral Interview bar.
            </p>
          </div>

          {/* Target Selector Command Suite */}
          <CaideCard
            theme="white"
            shadow="lg"
            className="p-5 sm:p-6 rounded-3xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0D0431]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0D0431]" />
                <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                  Target Company & Role Calibration
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#0D0431]/70 font-bold">
                Calibrated against verified engineering hiring bars
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Company Selector */}
              <div>
                <CaideCombobox
                  id="target-company-select"
                  name="targetCompany"
                  label="Target Company"
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  options={POPULAR_COMPANIES}
                  placeholder="Select or type company (e.g. Google, Microsoft, Uber)..."
                  icon={Building2}
                  quickSuggestions={[
                    "Microsoft",
                    "Google",
                    "Amazon",
                    "Uber",
                    "Atlassian",
                    "Stripe",
                    "Razorpay",
                  ]}
                  customPromptPrefix="Evaluate for"
                  helperText="Switch to any company to recalculate"
                />
              </div>

              {/* Target Role Selector */}
              <div>
                <CaideCombobox
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
          </CaideCard>
        </section>

        {/* ========================================================================= */}
        {/* EXECUTIVE DECISION HERO BANNER (READY / ALMOST READY / BLOCKER) */}
        {/* ========================================================================= */}
        <section ref={resultsRef} className="space-y-6">
          <CaideCard
            theme={
              decision.state === "READY"
                ? "light-green"
                : decision.state === "ALMOST_READY"
                ? "light-yellow"
                : "white"
            }
            shadow="lg"
            className={`eval-card p-6 sm:p-8 rounded-3xl relative overflow-hidden ${
              decision.state === "NOT_READY" || decision.state === "HARD_BLOCKER"
                ? "bg-[#FFC5B7]"
                : ""
            }`}
          >
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <CaideBadge
                    theme={
                      decision.state === "READY"
                        ? "mint"
                        : decision.state === "ALMOST_READY"
                        ? "yellow"
                        : "coral"
                    }
                    size="md"
                  >
                    <span className="flex items-center gap-1.5 font-heading font-black">
                      {decision.state === "READY" && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {decision.state === "ALMOST_READY" && (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      {(decision.state === "NOT_READY" ||
                        decision.state === "HARD_BLOCKER") && (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{decision.title}</span>
                    </span>
                  </CaideBadge>

                  <span className="text-xs font-mono font-bold text-[#0D0431]/80 bg-white px-3 py-1 rounded-full border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                    Calibrated for <strong className="text-[#0D0431] font-heading font-black">{benchmark.name}</strong> • {selectedRole}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431] tracking-tight">
                  {decision.subtitle}
                </h2>

                <p className="text-xs sm:text-sm text-[#0D0431]/85 font-medium leading-relaxed">
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
                <CaideCard
                  theme="white"
                  shadow="default"
                  className="p-5 rounded-2xl w-full sm:w-64 space-y-2 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#0D0431]/70 uppercase font-bold">
                      Composite Readiness
                    </span>
                    <span className="text-3xl font-heading font-black text-[#0D0431]">
                      {decision.compositeScore}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        decision.state === "READY"
                          ? "bg-[#D4FDF7]"
                          : decision.state === "ALMOST_READY"
                          ? "bg-[#FEDF6A]"
                          : "bg-[#FFC5B7]"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(5, decision.compositeScore)
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#0D0431]/80">
                    <span>Target Bar: {benchmark.targetDsaScore}%</span>
                    <span>
                      {decision.compositeScore >= benchmark.targetDsaScore
                        ? "Bar Met (+0)"
                        : `-${benchmark.targetDsaScore - decision.compositeScore} pts`}
                    </span>
                  </div>
                </CaideCard>

                {/* Quick Real Jobs Shortcut Trigger */}
                {matchingMarketplaceJobs.length > 0 && (
                  <CaideButton
                    onClick={() => setShowOpeningsDrawer(true)}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={true}
                  >
                    View {matchingMarketplaceJobs.length} Live Openings
                  </CaideButton>
                )}
              </div>
            </div>
          </CaideCard>

          {/* ========================================================================= */}
          {/* 4 DISTINCT, UNMIXED EVALUATION DIMENSIONS (PROGRESSIVE CARDS) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* DIMENSION 1: ELIGIBILITY CHECK */}
            <CaideCard
              theme="light-yellow"
              shadow="default"
              hoverEffect
              onClick={() =>
                setExpandedDimension(
                  expandedDimension === "eligibility" ? "all" : "eligibility"
                )
              }
              className={`eval-card p-5 rounded-3xl cursor-pointer flex flex-col justify-between space-y-4 group ${
                expandedDimension === "eligibility" ||
                expandedDimension === "all"
                  ? "ring-4 ring-[#0D0431]"
                  : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431] group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <CaideBadge
                    theme={
                      dimensions.eligibility.isPassed
                        ? "mint"
                        : dimensions.eligibility.hasBlocker
                        ? "coral"
                        : "yellow"
                    }
                    size="sm"
                  >
                    {dimensions.eligibility.status}
                  </CaideBadge>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#0D0431]/70 font-bold">
                    Dimension 1
                  </div>
                  <h3 className="text-base font-heading font-black text-[#0D0431] tracking-tight">
                    Eligibility Check
                  </h3>
                </div>

                <div className="text-xs text-[#0D0431]/80 space-y-1 font-mono font-bold">
                  <div className="flex justify-between">
                    <span>Cutoff:</span>
                    <span className="text-[#0D0431]">{benchmark.minCgpa} CGPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your CGPA:</span>
                    <span
                      className={`font-black ${
                        (academicProfile?.currentCgpa ||
                          userProfile?.cgpa ||
                          8.0) >= benchmark.minCgpa
                          ? "text-[#0D0431]"
                          : "text-[#F85B52]"
                      }`}
                    >
                      {(
                        academicProfile?.currentCgpa ||
                        userProfile?.cgpa ||
                        8.0
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backlogs:</span>
                    <span className="text-[#0D0431]">
                      {academicProfile?.activeBacklogs ||
                        userProfile?.activeBacklogs ||
                        0}{" "}
                      (Max {benchmark.maxActiveBacklogs})
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#0D0431] flex items-center justify-between text-[11px] font-mono font-bold text-[#0D0431]">
                <span>
                  {expandedDimension === "eligibility"
                    ? "Hide Checklist"
                    : "Expand Checklist"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedDimension === "eligibility" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CaideCard>

            {/* DIMENSION 2: TECHNICAL READINESS % */}
            <CaideCard
              theme="light-purple"
              shadow="default"
              hoverEffect
              onClick={() =>
                setExpandedDimension(
                  expandedDimension === "technical" ? "all" : "technical"
                )
              }
              className={`eval-card p-5 rounded-3xl cursor-pointer flex flex-col justify-between space-y-4 group ${
                expandedDimension === "technical" ||
                expandedDimension === "all"
                  ? "ring-4 ring-[#0D0431]"
                  : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431] group-hover:scale-105 transition-transform">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <CaideBadge
                    theme={
                      dimensions.technical.isPassed
                        ? "mint"
                        : "yellow"
                    }
                    size="sm"
                  >
                    {dimensions.technical.score}% Readiness
                  </CaideBadge>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#0D0431]/70 font-bold">
                    Dimension 2
                  </div>
                  <h3 className="text-base font-heading font-black text-[#0D0431] tracking-tight">
                    Technical Readiness
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                    <div
                      className="h-full bg-[#FEDF6A] rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(5, dimensions.technical.score)
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-[#0D0431]/80 font-medium line-clamp-2">
                    DSA Patterns ({benchmark.dsaKeyTopics[0]}), Core CS & Concurrency.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#0D0431] flex items-center justify-between text-[11px] font-mono font-bold text-[#0D0431]">
                <span>
                  {expandedDimension === "technical"
                    ? "Hide Checklist"
                    : "Expand Checklist"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedDimension === "technical" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CaideCard>

            {/* DIMENSION 3: PROFILE READINESS % */}
            <CaideCard
              theme="light-blue"
              shadow="default"
              hoverEffect
              onClick={() =>
                setExpandedDimension(
                  expandedDimension === "profile" ? "all" : "profile"
                )
              }
              className={`eval-card p-5 rounded-3xl cursor-pointer flex flex-col justify-between space-y-4 group ${
                expandedDimension === "profile" ||
                expandedDimension === "all"
                  ? "ring-4 ring-[#0D0431]"
                  : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431] group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <CaideBadge
                    theme={
                      dimensions.profile.isPassed
                        ? "mint"
                        : "yellow"
                    }
                    size="sm"
                  >
                    {dimensions.profile.score}% Readiness
                  </CaideBadge>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#0D0431]/70 font-bold">
                    Dimension 3
                  </div>
                  <h3 className="text-base font-heading font-black text-[#0D0431] tracking-tight">
                    Profile & Resume
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                    <div
                      className="h-full bg-[#E4CDFB] rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(5, dimensions.profile.score)
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-[#0D0431]/80 font-medium line-clamp-2">
                    GitHub Codebase Depth, Resume ATS Score & Google XYZ Bullets.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#0D0431] flex items-center justify-between text-[11px] font-mono font-bold text-[#0D0431]">
                <span>
                  {expandedDimension === "profile"
                    ? "Hide Checklist"
                    : "Expand Checklist"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedDimension === "profile" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CaideCard>

            {/* DIMENSION 4: INTERVIEW READINESS % */}
            <CaideCard
              theme="pale-lime"
              shadow="default"
              hoverEffect
              onClick={() =>
                setExpandedDimension(
                  expandedDimension === "interview" ? "all" : "interview"
                )
              }
              className={`eval-card p-5 rounded-3xl cursor-pointer flex flex-col justify-between space-y-4 group ${
                expandedDimension === "interview" ||
                expandedDimension === "all"
                  ? "ring-4 ring-[#0D0431]"
                  : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431] group-hover:scale-105 transition-transform">
                    <BrainCog className="w-5 h-5" />
                  </div>
                  <CaideBadge
                    theme={
                      dimensions.interview.isPassed
                        ? "mint"
                        : "yellow"
                    }
                    size="sm"
                  >
                    {dimensions.interview.score}% Readiness
                  </CaideBadge>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase text-[#0D0431]/70 font-bold">
                    Dimension 4
                  </div>
                  <h3 className="text-base font-heading font-black text-[#0D0431] tracking-tight">
                    Interview & Soft Skills
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                    <div
                      className="h-full bg-[#D4FDF7] rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(5, dimensions.interview.score)
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-[#0D0431]/80 font-medium line-clamp-2">
                    Speech Clarity, STAR Behavioral & {benchmark.name} Values.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#0D0431] flex items-center justify-between text-[11px] font-mono font-bold text-[#0D0431]">
                <span>
                  {expandedDimension === "interview"
                    ? "Hide Checklist"
                    : "Expand Checklist"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedDimension === "interview" ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CaideCard>
          </div>

          {/* ========================================================================= */}
          {/* PROGRESSIVE DISCLOSURE: EXPANDABLE REQUIREMENT CHECKLISTS */}
          {/* ========================================================================= */}
          <CaideCard
            theme="white"
            shadow="lg"
            className="eval-card p-6 sm:p-8 rounded-3xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0431]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-black text-[#0D0431] tracking-tight">
                    Comprehensive Requirement Breakdown
                  </h3>
                  <p className="text-xs text-[#0D0431]/80 font-medium">
                    Detailed verification criteria calibrated against {benchmark.name}'s official hiring bar
                  </p>
                </div>
              </div>

              {/* Dimension Switch Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  {
                    id: "eligibility",
                    label: "Eligibility",
                    icon: GraduationCap,
                  },
                  { id: "technical", label: "Technical DSA", icon: Code2 },
                  { id: "profile", label: "Profile & ATS", icon: FileText },
                  {
                    id: "interview",
                    label: "Behavioral & Mock",
                    icon: BrainCog,
                  },
                  { id: "all", label: "View All", icon: Layers },
                ].map((tab) => {
                  const isActive = expandedDimension === tab.id;
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setExpandedDimension(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] cursor-pointer ${
                        isActive
                          ? "bg-[#0D0431] text-[#FEF9CF]"
                          : "bg-[#FEF9CF] text-[#0D0431] hover:bg-[#FEDF6A]"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB CONTENT: 1. ELIGIBILITY */}
            {(expandedDimension === "eligibility" ||
              expandedDimension === "all") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black uppercase text-[#0D0431] tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>Dimension 1: Academic & Recruitment Eligibility Criteria</span>
                  </span>
                  <CaideBadge
                    theme={dimensions.eligibility.isPassed ? "mint" : "coral"}
                    size="sm"
                  >
                    {dimensions.eligibility.status}
                  </CaideBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {dimensions.eligibility.checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] transition-all space-y-2 ${
                        item.isPassed
                          ? "bg-[#D4FDF7]"
                          : item.isBlocker
                          ? "bg-[#FFC5B7]"
                          : "bg-[#FEDF6A]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-heading font-black text-[#0D0431]">
                          {item.label}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#0D0431] shrink-0 bg-white text-[#0D0431]`}
                        >
                          {item.statusText}
                        </span>
                      </div>

                      <div className="text-xs text-[#0D0431] space-y-0.5 font-mono font-bold">
                        <div>
                          Required: <span className="underline">{item.required}</span>
                        </div>
                        <div>
                          Your Profile:{" "}
                          <span className="underline font-black">{item.actual}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#0D0431]/80 font-medium pt-1 leading-relaxed">
                        {item.detail}
                      </p>

                      {!item.isPassed && item.fixAction && (
                        <div className="pt-2">
                          <Link
                            to={item.fixAction.url}
                            className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-[#0D0431] hover:underline"
                          >
                            <span>{item.fixAction.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. TECHNICAL DSA & SYSTEM DESIGN */}
            {(expandedDimension === "technical" ||
              expandedDimension === "all") && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black uppercase text-[#0D0431] tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" />
                    <span>Dimension 2: Algorithmic & Computer Science Calibration</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#0D0431]">
                    Benchmarked: {dimensions.technical.score}% / {benchmark.targetDsaScore}%
                  </span>
                </div>

                <div className="space-y-3">
                  {dimensions.technical.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-heading font-bold text-[#0D0431]">
                            {item.label}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#0D0431] ${
                              item.isPassed
                                ? "bg-[#D4FDF7] text-[#0D0431]"
                                : "bg-[#FFC5B7] text-[#0D0431]"
                            }`}
                          >
                            {item.isPassed
                              ? "Benchmarked"
                              : `-${item.gap} pts Deficit`}
                          </span>
                        </div>
                        <p className="text-xs text-[#0D0431]/80 font-medium">
                          {item.detail}
                        </p>
                        <div className="text-[11px] font-mono font-bold text-[#0D0431]/70">
                          {item.targetText}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-base font-heading font-black text-[#0D0431]">
                            {item.currentScore}%
                          </div>
                          <div className="text-[10px] font-mono font-bold text-[#0D0431]/70">
                            Current
                          </div>
                        </div>

                        <CaideButton
                          to={item.fixLink}
                          variant="secondary"
                          size="sm"
                          icon={true}
                        >
                          {item.fixLabel}
                        </CaideButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. PROFILE & RESUME ATS */}
            {(expandedDimension === "profile" ||
              expandedDimension === "all") && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black uppercase text-[#0D0431] tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>
                      Dimension 3: Resume ATS, Projects & Online Presence ({benchmark.primaryLanguage})
                    </span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#0D0431]">
                    Benchmarked: {dimensions.profile.score}% / {benchmark.targetResumeScore}%
                  </span>
                </div>

                <div className="space-y-3">
                  {dimensions.profile.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-heading font-bold text-[#0D0431]">
                            {item.label}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#0D0431] ${
                              item.isPassed
                                ? "bg-[#D4FDF7] text-[#0D0431]"
                                : "bg-[#FFC5B7] text-[#0D0431]"
                            }`}
                          >
                            {item.isPassed
                              ? "Benchmarked"
                              : `-${item.gap} pts Deficit`}
                          </span>
                        </div>
                        <p className="text-xs text-[#0D0431]/80 font-medium">
                          {item.detail}
                        </p>
                        <div className="text-[11px] font-mono font-bold text-[#0D0431]/70">
                          {item.targetText}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-base font-heading font-black text-[#0D0431]">
                            {item.currentScore}%
                          </div>
                          <div className="text-[10px] font-mono font-bold text-[#0D0431]/70">
                            Current
                          </div>
                        </div>

                        <CaideButton
                          to={item.fixLink}
                          variant="secondary"
                          size="sm"
                          icon={true}
                        >
                          {item.fixLabel}
                        </CaideButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. BEHAVIORAL & INTERVIEW */}
            {(expandedDimension === "interview" ||
              expandedDimension === "all") && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black uppercase text-[#0D0431] tracking-wider flex items-center gap-1.5">
                    <BrainCog className="w-4 h-4" />
                    <span>
                      Dimension 4: Communication & Leadership Principles ({benchmark.behavioralPillars[0]})
                    </span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#0D0431]">
                    Benchmarked: {dimensions.interview.score}% / {benchmark.targetBehavioralScore}%
                  </span>
                </div>

                <div className="space-y-3">
                  {dimensions.interview.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-heading font-bold text-[#0D0431]">
                            {item.label}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#0D0431] ${
                              item.isPassed
                                ? "bg-[#D4FDF7] text-[#0D0431]"
                                : "bg-[#FFC5B7] text-[#0D0431]"
                            }`}
                          >
                            {item.isPassed
                              ? "Benchmarked"
                              : `-${item.gap} pts Deficit`}
                          </span>
                        </div>
                        <p className="text-xs text-[#0D0431]/80 font-medium">
                          {item.detail}
                        </p>
                        <div className="text-[11px] font-mono font-bold text-[#0D0431]/70">
                          {item.targetText}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-base font-heading font-black text-[#0D0431]">
                            {item.currentScore}%
                          </div>
                          <div className="text-[10px] font-mono font-bold text-[#0D0431]/70">
                            Current
                          </div>
                        </div>

                        <CaideButton
                          to={item.fixLink}
                          variant="secondary"
                          size="sm"
                          icon={true}
                        >
                          {item.fixLabel}
                        </CaideButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CaideCard>

          {/* ========================================================================= */}
          {/* TOP 3 CRITICAL RISKS / GAPS & "FIX FIRST" ACTION TRIGGERS */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#F85B52]" />
                <h3 className="text-base font-heading font-black text-[#0D0431] uppercase tracking-wider">
                  Top Priority Risks to Fix Before Applying
                </h3>
              </div>
              <CaideBadge theme="coral" size="sm">
                Direct closure actions targeting {benchmark.name}
              </CaideBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCriticalRisks.map((gap, gIdx) => (
                <CaideCard
                  key={gap.id || gIdx}
                  theme="white"
                  shadow="default"
                  hoverEffect
                  className="eval-card p-5 rounded-3xl flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#0D0431]/70 font-bold">
                        {gap.pillar}
                      </span>
                      <CaideBadge
                        theme={
                          gap.color === "rose"
                            ? "coral"
                            : gap.color === "amber"
                            ? "yellow"
                            : "mint"
                        }
                        size="sm"
                      >
                        {gap.impact}
                      </CaideBadge>
                    </div>

                    <h4 className="text-sm font-heading font-bold text-[#0D0431] tracking-tight">
                      {gap.title}
                    </h4>

                    <p className="text-xs text-[#0D0431]/80 font-medium leading-relaxed">
                      {gap.description}
                    </p>
                  </div>

                  <CaideButton
                    to={gap.actionUrl}
                    variant="stacked-yellow"
                    size="sm"
                    fullWidth
                    icon={true}
                  >
                    {gap.actionLabel}
                  </CaideButton>
                </CaideCard>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* POSITIVE REINFORCEMENT: "WHAT IS ALREADY COVERED?" */}
          {/* ========================================================================= */}
          {coveredStrengths.length > 0 && (
            <CaideCard
              theme="light-green"
              shadow="default"
              className="eval-card p-6 sm:p-8 rounded-3xl space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[#0D0431]">
                <CheckCircle2 className="w-5 h-5 text-[#0D0431]" />
                <h3 className="text-xs font-heading font-black uppercase text-[#0D0431] tracking-wider">
                  What is already covered? (Your Competitive Strengths)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                {coveredStrengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] space-y-1"
                  >
                    <div className="text-xs font-heading font-bold text-[#0D0431] flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-[#D4FDF7] border border-[#0D0431] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#0D0431]" />
                      </div>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-[#0D0431]/80 font-mono font-medium leading-relaxed pl-6">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </CaideCard>
          )}

          {/* ========================================================================= */}
          {/* REAL JOB LINK INTEGRATION & OFFICIAL CAREERS ACTION */}
          {/* ========================================================================= */}
          <CaideCard
            theme="light-purple"
            shadow="lg"
            className="eval-card p-6 sm:p-8 rounded-3xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0D0431]" />
                  <span className="text-base font-heading font-black text-[#0D0431]">
                    Verified Openings & Official Careers Pipeline
                  </span>
                </div>
                <p className="text-xs text-[#0D0431]/80 font-medium">
                  Direct access to real opportunities at {benchmark.name} — no fake application submissions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {matchingMarketplaceJobs.length > 0 && (
                  <CaideButton
                    onClick={() => setShowOpeningsDrawer(true)}
                    variant="secondary"
                    size="sm"
                    icon={false}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>
                        View {matchingMarketplaceJobs.length} In Marketplace
                      </span>
                    </span>
                  </CaideButton>
                )}

                <CaideButton
                  href={benchmark.careersUrl}
                  variant="stacked-yellow"
                  size="sm"
                  icon={true}
                >
                  Apply on Official Careers
                </CaideButton>
              </div>
            </div>

            {/* If open jobs exist in GetPlaced Jobs marketplace, display interactive mini cards */}
            {matchingMarketplaceJobs.length > 0 && (
              <div className="space-y-3 pt-3 border-t-2 border-[#0D0431]">
                <span className="text-[11px] font-mono uppercase text-[#0D0431] font-bold block">
                  Active Verified Openings in GetPlaced Jobs Database ({matchingMarketplaceJobs.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matchingMarketplaceJobs.slice(0, 3).map((job, idx) => (
                    <div
                      key={job.jobId || idx}
                      className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:-translate-y-0.5 transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#0D0431]">
                          <span>{job.workMode || "Hybrid"}</span>
                          <span className="bg-[#FEDF6A] px-2 py-0.5 rounded-full border border-[#0D0431]">
                            {job.salary || "Competitive"}
                          </span>
                        </div>
                        <h4 className="text-xs font-heading font-black text-[#0D0431] line-clamp-1 mt-1.5">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-[#0D0431]/80 font-medium line-clamp-2 mt-0.5">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t-2 border-[#0D0431] text-[10px] font-mono font-bold">
                        <span className="text-[#0D0431]/80">
                          Min CGPA: {job.cgpaCutoff || benchmark.minCgpa}
                        </span>
                        <Link
                          to={`/app/job?search=${encodeURIComponent(job.company)}`}
                          className="text-[#0D0431] hover:underline flex items-center gap-1 font-bold"
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
          </CaideCard>
        </section>

      {/* ========================================================================= */}
      {/* OPENINGS SLIDE-OVER DRAWER MODAL */}
      {/* ========================================================================= */}
      {showOpeningsDrawer && (
        <div
          onClick={() => setShowOpeningsDrawer(false)}
          className="fixed inset-0 z-50 bg-[#0D0431]/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-3xl max-w-2xl w-full max-h-[85vh] p-6 space-y-4 shadow-[8px_8px_0_0_#0D0431] flex flex-col overflow-hidden text-[#0D0431]"
          >
            <div className="flex items-start justify-between pb-3 border-b-2 border-[#0D0431] bg-[#FEDF6A] -mx-6 -mt-6 p-6">
              <div className="space-y-1">
                <CaideBadge theme="dark" size="sm">
                  GetPlaced Jobs Radar
                </CaideBadge>
                <h3 className="text-xl font-heading font-black text-[#0D0431]">
                  Available Positions at {benchmark.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOpeningsDrawer(false)}
                className="w-8 h-8 rounded-full border-2 border-[#0D0431] bg-white hover:bg-[#FFC5B7] text-[#0D0431] flex items-center justify-center shadow-[2px_2px_0_0_#0D0431] transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-2">
              {matchingMarketplaceJobs.map((job, idx) => (
                <div
                  key={job.jobId || idx}
                  className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-heading font-black text-[#0D0431]">
                        {job.title}
                      </h4>
                      <p className="text-xs text-[#0D0431]/80 font-mono font-medium">
                        {job.location} • {job.workMode || "Hybrid"} • {job.experience || "0-2 years"}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-[#FEDF6A] px-2.5 py-0.5 rounded-full border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] shrink-0">
                      {job.salary}
                    </span>
                  </div>

                  <p className="text-xs text-[#0D0431]/80 font-medium line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t-2 border-[#0D0431] text-xs font-mono">
                    <span className="text-[11px] font-bold text-[#0D0431]/80">
                      Cutoff: {job.cgpaCutoff || benchmark.minCgpa} CGPA
                    </span>
                    <CaideButton
                      href={job.applicationUrl || benchmark.careersUrl}
                      variant="stacked-yellow"
                      size="sm"
                      icon={true}
                    >
                      Apply on Official Portal
                    </CaideButton>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t-2 border-[#0D0431] flex justify-between items-center text-xs text-[#0D0431] font-mono font-bold">
              <span>All listings sourced and verified from official career feeds.</span>
              <button
                type="button"
                onClick={() => {
                  setShowOpeningsDrawer(false);
                  navigate(`/app/job?search=${encodeURIComponent(benchmark.name)}`);
                }}
                className="text-[#0D0431] hover:underline font-bold"
              >
                Open in Jobs Center &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
