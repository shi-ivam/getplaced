import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import GpBadge from "@/components/gp/GpBadge";
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
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialRole = searchParams.get("role") || "ALL";

  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [targetCompanyJobs, setTargetCompanyJobs] = useState([]);
  const [meta, setMeta] = useState({
    targetCompany: "",
    targetRole: "",
    savedCount: 0,
    userReadiness: null,
  });

  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole);
  const [location, setLocation] = useState("ALL");
  const [workMode, setWorkMode] = useState("ALL");
  const [experience, setExperience] = useState("ALL");
  const [selectedSkill, setSelectedSkill] = useState("ALL");
  const [minSalary, setMinSalary] = useState(0);
  const [sort, setSort] = useState("recommended");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const cardsGridRef = useRef(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role !== "ALL") params.set("role", role);
      if (location !== "ALL") params.set("location", location);
      if (workMode !== "ALL") params.set("workMode", workMode);
      if (experience !== "ALL") params.set("experience", experience);
      if (selectedSkill !== "ALL") {
        params.set("skills", selectedSkill);
        params.set("skill", selectedSkill);
      }
      if (minSalary > 0) params.set("minSalary", minSalary);
      if (sort) params.set("sort", sort);
      if (activeCategory !== "all") params.set("category", activeCategory);

      const res = await axios.get(`${NODE_API_URL}/api/jobs?${params.toString()}`, {
        withCredentials: true,
      });

      if (res.data?.success || res.data?.jobs || Array.isArray(res.data)) {
        const jobsList = res.data.jobs || (Array.isArray(res.data) ? res.data : []);
        setJobs(jobsList);
        setRecommendedJobs(res.data.recommendedJobs || jobsList.slice(0, 6));
        setTargetCompanyJobs(res.data.targetCompanyJobs || []);
        setMeta({
          targetCompany: res.data.meta?.targetCompany ?? res.data.targetCompany ?? "",
          targetRole: res.data.meta?.targetRole ?? res.data.targetRole ?? "",
          savedCount: res.data.meta?.savedCount ?? res.data.savedCount ?? 0,
          userReadiness: res.data.meta?.userReadiness ?? res.data.userReadiness ?? null,
        });
      }
    } catch (err) {
      console.warn("Could not fetch jobs from backend, using fallback:", err.message);
      setError("Failed to load jobs. Displaying cached opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, role, location, workMode, experience, selectedSkill, minSalary, sort, activeCategory]);

  const handleToggleSave = async (jobToToggle) => {
    const targetId = jobToToggle._id || jobToToggle.jobId || jobToToggle.id;
    const updatedIsSaved = !jobToToggle.isSaved;

    setJobs((prev) =>
      prev.map((j) => ((j._id || j.jobId || j.id) === targetId ? { ...j, isSaved: updatedIsSaved } : j))
    );

    if (selectedJob && (selectedJob._id || selectedJob.jobId || selectedJob.id) === targetId) {
      setSelectedJob((prev) => ({ ...prev, isSaved: updatedIsSaved }));
    }

    try {
      await axios.post(
        `${NODE_API_URL}/api/jobs/saved/${targetId}`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.warn("Save job note:", err.message);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setRole("ALL");
    setLocation("ALL");
    setWorkMode("ALL");
    setExperience("ALL");
    setSelectedSkill("ALL");
    setMinSalary(0);
    setSort("recommended");
    setActiveCategory("all");
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    Boolean(search) ||
    role !== "ALL" ||
    location !== "ALL" ||
    workMode !== "ALL" ||
    experience !== "ALL" ||
    selectedSkill !== "ALL" ||
    minSalary > 0 ||
    sort !== "recommended" ||
    activeCategory !== "all";

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DEEC]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#6E44FF]" />
            <span>Tech Jobs Market & Matching</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6A80] mt-1">
            Curated campus and off-campus tech openings scored against your verified candidate readiness.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/app/can-i-apply")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F2F0FA] text-[#17103D] border border-[#E2DEEC] transition-colors shadow-sm cursor-pointer"
          >
            Can I Apply?
          </button>
          <button
            type="button"
            onClick={() => navigate("/app/role-fit")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F2F0FA] text-[#17103D] border border-[#E2DEEC] transition-colors shadow-sm cursor-pointer"
          >
            Role Fit AI
          </button>
          <button
            type="button"
            onClick={() => navigate("/app/company-intel")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F2F0FA] text-[#17103D] border border-[#E2DEEC] transition-colors shadow-sm cursor-pointer"
          >
            Company Intel
          </button>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {CATEGORY_TABS.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
                isActive
                  ? "bg-[#17103D] text-white font-semibold shadow-sm"
                  : "bg-white text-[#6F6A80] hover:text-[#17103D] hover:bg-[#F2F0FA] border border-[#E2DEEC]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FFD84D]" : "text-[#6F6A80]"}`} />
              <span>{cat.label}</span>
              {cat.id === "saved" && meta.savedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EFEAFF] text-[#6E44FF] font-bold">
                  {meta.savedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
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
        selectedSkill={selectedSkill}
        onSelectSkill={setSelectedSkill}
        onSkillChange={setSelectedSkill}
        minSalary={minSalary}
        onMinSalaryChange={setMinSalary}
        sort={sort}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={jobs.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Jobs Grid / List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#6F6A80] bg-white rounded-2xl border border-[#E2DEEC]">
          Loading verified job opportunities...
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-[#E2DEEC]">
          <Briefcase className="w-8 h-8 text-[#6F6A80] mx-auto" />
          <h3 className="text-sm font-bold text-[#17103D]">No opportunities found</h3>
          <p className="text-xs text-[#6F6A80] max-w-sm mx-auto">
            Try adjusting your search criteria, role filter, or location preferences.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-[#17103D] text-white text-xs font-semibold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div
          ref={cardsGridRef}
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-3"
          }
        >
          {jobs.map((job) => (
            <JobCard
              key={job._id || job.jobId || job.id}
              job={job}
              viewMode={viewMode}
              onSelect={setSelectedJob}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
}
