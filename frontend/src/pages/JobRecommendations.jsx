import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  ExternalLink,
  Building2,
  Brain,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  TrendingUp,
  Bookmark,
  Layers,
  LayoutGrid,
  List,
  RotateCcw,
  Target,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Star,
  Compass,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import JobCard from "@/components/jobs/JobCard";
import JobDetailModal from "@/components/jobs/JobDetailModal";
import JobFiltersBar from "@/components/jobs/JobFiltersBar";

const CATEGORY_TABS = [
  { id: "all", label: "All Opportunities", icon: Compass },
  { id: "recommended", label: "Recommended For You", icon: Sparkles },
  { id: "best_fit", label: "Best Fit (80%+)", icon: CheckCircle2 },
  { id: "stretch", label: "Stretch Opportunities", icon: Flame },
  { id: "internships", label: "Internships", icon: Target },
  { id: "remote", label: "Remote Only", icon: MapPin },
  { id: "saved", label: "Saved Jobs", icon: Bookmark },
];

export default function JobRecommendations() {
  const navigate = useNavigate();

  // Primary data state
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [targetCompanyJobs, setTargetCompanyJobs] = useState([]);
  const [meta, setMeta] = useState({
    targetCompany: "",
    targetRole: "",
    savedCount: 0,
    userReadiness: 74,
  });

  // Filter & Control state
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [workMode, setWorkMode] = useState("ALL");
  const [experience, setExperience] = useState("ALL");
  const [minSalary, setMinSalary] = useState(0);
  const [sort, setSort] = useState("recommended");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  // Modal & Loading state
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const cardsGridRef = useRef(null);

  // Fetch jobs from backend with query parameters
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${NODE_API_URL}/api/jobs`, {
        params: {
          search: search || undefined,
          role: role !== "ALL" ? role : undefined,
          location: location !== "ALL" ? location : undefined,
          workMode: workMode !== "ALL" ? workMode : undefined,
          experience: experience !== "ALL" ? experience : undefined,
          minSalary: minSalary > 0 ? minSalary : undefined,
          sort,
          category: activeCategory,
        },
        withCredentials: true,
      });

      if (res.data?.success) {
        setJobs(res.data.jobs || []);
        setRecommendedJobs(res.data.recommendedJobs || []);
        setTargetCompanyJobs(res.data.targetCompanyJobs || []);
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      } else {
        setJobs(res.data?.jobs || []);
      }
    } catch (err) {
      console.warn("Could not fetch jobs from primary /api/jobs endpoint:", err.message);
      // Fallback attempt to /job-recommendations
      try {
        const fallbackRes = await axios.get(`${NODE_API_URL}/job-recommendations`, {
          params: { query: search || undefined },
          withCredentials: true,
        });
        const fallbackData = fallbackRes.data?.jobs || [];
        setJobs(fallbackData);
      } catch (fallbackErr) {
        setError("Unable to retrieve job opportunities right now. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced/Triggered fetch on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, role, location, workMode, experience, minSalary, sort, activeCategory]);

  // Toggle Save Job
  const handleToggleSave = async (jobToToggle) => {
    const targetId = jobToToggle.jobId || jobToToggle._id;

    // Optimistic UI Update
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if ((j.jobId || j._id) === targetId) {
          return { ...j, isSaved: !j.isSaved };
        }
        return j;
      })
    );

    setRecommendedJobs((prev) =>
      prev.map((j) => {
        if ((j.jobId || j._id) === targetId) {
          return { ...j, isSaved: !j.isSaved };
        }
        return j;
      })
    );

    if (selectedJob && (selectedJob.jobId || selectedJob._id) === targetId) {
      setSelectedJob((prev) => ({ ...prev, isSaved: !prev.isSaved }));
    }

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/jobs/saved/${targetId}`,
        {},
        { withCredentials: true }
      );
      if (res.data?.savedCount !== undefined) {
        setMeta((prev) => ({ ...prev, savedCount: res.data.savedCount }));
      }
    } catch (err) {
      console.warn("Save job request not persisted (guest mode or network error):", err.message);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setRole("ALL");
    setLocation("ALL");
    setWorkMode("ALL");
    setExperience("ALL");
    setMinSalary(0);
    setSort("recommended");
    setActiveCategory("all");
  };

  const hasActiveFilters =
    Boolean(search) ||
    role !== "ALL" ||
    location !== "ALL" ||
    workMode !== "ALL" ||
    experience !== "ALL" ||
    minSalary > 0 ||
    sort !== "recommended" ||
    activeCategory !== "all";

  // GSAP Entry Animation
  useGSAP(() => {
    if (cardsGridRef.current && jobs.length > 0 && !loading) {
      gsap.fromTo(
        cardsGridRef.current.querySelectorAll(".job-card"),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
      );
    }
  }, [jobs, loading, activeCategory]);

  return (
    <main
      className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#07080b] text-zinc-100 font-sans selection:bg-violet-600 selection:text-white"
      ref={containerRef}
    >
      {/* Ambient background wash */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-violet-950/25 via-purple-950/15 to-transparent blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[650px] h-[450px] bg-violet-900/10 blur-[170px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Bar / Sub-Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-950/70 border border-violet-700/50 flex items-center justify-center text-violet-400 shadow-lg shadow-violet-950/50">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest font-mono text-zinc-400 font-semibold">
                Opportunity Discovery Radar
              </div>
              <div className="text-base font-bold text-white tracking-tight">
                Jobs Marketplace & Career Matching
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/app/company-intel")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Company Intel</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/roadmap")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Placement Roadmap</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/interview")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/50 transition-all flex items-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Mock Interview</span>
            </button>
          </div>
        </header>

        {/* Hero Title & Telemetry Metrics Section */}
        <section className="space-y-6">
          <div className="max-w-4xl space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Find jobs that match your skills, experience and career goals.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Explore verified engineering opportunities calibrated against your target role, GitHub projects, and interview readiness.
            </p>
          </div>

          {/* Telemetry Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                Available Openings
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {jobs.length} Positions
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                Your Target Role
              </div>
              <div className="text-sm font-bold text-violet-400 mt-1 truncate">
                {meta.targetRole || "Software Development Engineer"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                Interview Readiness
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {meta.userReadiness || 74}% Benchmark
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                Saved Bookmarks
              </div>
              <div className="text-xl font-bold text-zinc-200 mt-1">
                {meta.savedCount || 0} Saved
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills Bar */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-950/60 font-bold"
                    : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
                {tab.id === "saved" && meta.savedCount > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white text-violet-950 font-bold" : "bg-zinc-800 text-violet-300"
                    }`}
                  >
                    {meta.savedCount}
                  </span>
                )}
              </button>
            );
          })}
        </section>

        {/* Multi-Facet Filter Command Suite */}
        <section>
          <JobFiltersBar
            search={search}
            onSearchChange={setSearch}
            role={role}
            onRoleChange={setRole}
            location={location}
            onLocationChange={setLocation}
            workMode={workMode}
            onWorkModeChange={setWorkMode}
            experience={experience}
            onExperienceChange={setExperience}
            minSalary={minSalary}
            onMinSalaryChange={setMinSalary}
            sort={sort}
            onSortChange={setSort}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </section>

        {/* Highlight Section: RECOMMENDED FOR YOU (Top 3 match cards) */}
        {activeCategory === "all" && !search && recommendedJobs.length > 0 && !loading && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Recommended For You
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Highest match score based on your target role ({meta.targetRole || "SDE"}) and skill profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedJobs.slice(0, 3).map((job, idx) => (
                <JobCard
                  key={job.jobId || idx}
                  job={job}
                  onSelect={setSelectedJob}
                  onToggleSave={handleToggleSave}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>
        )}

        {/* Target Company Openings Highlight (e.g. Microsoft / Google) */}
        {activeCategory === "all" && targetCompanyJobs.length > 0 && !search && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Target Company Openings: {meta.targetCompany || targetCompanyJobs[0]?.company}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Openings verified from your active target employer preference.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {targetCompanyJobs.slice(0, 3).map((job, idx) => (
                <JobCard
                  key={job.jobId || idx}
                  job={job}
                  onSelect={setSelectedJob}
                  onToggleSave={handleToggleSave}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>
        )}

        {/* All Matching Opportunities Section Header + View Switcher */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-zinc-900">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>All Opportunities</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {jobs.length} found
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activeCategory === "saved"
                  ? "Your saved bookmark list for active tracking and interview applications."
                  : "Explore and apply to curated tech roles across tier-1 and high-growth companies."}
              </p>
            </div>

            {/* View Mode Grid/List Toggle */}
            <div className="flex items-center gap-1 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Job Results: Loading Skeletons / Grid / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-zinc-950/60 border border-zinc-800/60 p-6 space-y-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900" />
                    <div className="space-y-2 flex-1">
                      <div className="w-24 h-3 bg-zinc-900 rounded" />
                      <div className="w-36 h-2.5 bg-zinc-900/80 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="w-full h-4 bg-zinc-900 rounded" />
                    <div className="w-3/4 h-3 bg-zinc-900/70 rounded" />
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900/40 space-y-2">
                    <div className="w-20 h-2.5 bg-zinc-800 rounded" />
                    <div className="w-full h-1.5 bg-zinc-800 rounded" />
                  </div>
                  <div className="flex gap-2 pt-3">
                    <div className="w-1/2 h-9 bg-zinc-900 rounded-xl" />
                    <div className="w-1/2 h-9 bg-zinc-900 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-20 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 text-center space-y-4 p-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Jobs Couldn't Be Refreshed Right Now</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">{error}</p>
              <button
                type="button"
                onClick={fetchJobs}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-950/50"
              >
                Try Again
              </button>
            </div>
          ) : jobs.length > 0 ? (
            <div
              ref={cardsGridRef}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-3"
              }
            >
              {jobs.map((job, idx) => (
                <JobCard
                  key={job.jobId || idx}
                  job={job}
                  onSelect={setSelectedJob}
                  onToggleSave={handleToggleSave}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 text-center space-y-4 p-8">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  No Matching Opportunities Right Now
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  We couldn't find any openings matching your exact filters. Try:
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs text-zinc-400">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                    • Expanding location filter
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                    • Removing experience restriction
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                    • Searching another tech stack
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition-all flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </section>

        {/* Detailed Job Slide-over Modal / Drawer */}
        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onToggleSave={handleToggleSave}
          />
        )}
      </div>
    </main>
  );
}