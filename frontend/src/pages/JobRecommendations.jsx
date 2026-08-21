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
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  TrendingUp,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

const EMPLOYMENT_FILTERS = [
  { id: "ALL", label: "All Types" },
  { id: "FULLTIME", label: "Full-Time" },
  { id: "INTERN", label: "Internship" }
];

const LOCATION_FILTERS = [
  { id: "ALL", label: "Global & India" },
  { id: "REMOTE", label: "Remote Only" },
  { id: "BENGALURU", label: "Bengaluru" },
  { id: "HYDERABAD", label: "Hyderabad" }
];

export default function JobRecommendations() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const cardsGridRef = useRef(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${NODE_API_URL}/job-recommendations`, {
        params: {
          query: search || "software engineer",
          ...(selectedType !== "ALL" ? { employment_type: selectedType } : {})
        }
      });
      const data = res.data?.jobs || [];
      setJobs(data);
      applyClientFilters(data, search, selectedType, selectedLocation);
    } catch (err) {
      console.warn("Error fetching jobs from primary endpoint:", err.message);
      setError("Unable to retrieve live openings. Displaying curated opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const applyClientFilters = (allJobs, queryText, typeFilter, locFilter) => {
    let result = [...allJobs];

    if (queryText && queryText.trim()) {
      const q = queryText.toLowerCase().trim();
      result = result.filter((job) => {
        const title = job.job_title?.toLowerCase() || "";
        const employer = job.employer_name?.toLowerCase() || "";
        const city = job.job_city?.toLowerCase() || "";
        const skills = (job.job_required_skills || []).join(" ").toLowerCase();
        return title.includes(q) || employer.includes(q) || city.includes(q) || skills.includes(q);
      });
    }

    if (typeFilter !== "ALL") {
      result = result.filter((job) => {
        const t = (job.job_employment_type || "").toUpperCase();
        return t === typeFilter;
      });
    }

    if (locFilter === "REMOTE") {
      result = result.filter((job) => job.job_is_remote || (job.job_city || "").toLowerCase().includes("remote"));
    } else if (locFilter !== "ALL") {
      result = result.filter((job) => (job.job_city || "").toLowerCase().includes(locFilter.toLowerCase()));
    }

    setFilteredJobs(result);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    applyClientFilters(jobs, val, selectedType, selectedLocation);
  };

  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    applyClientFilters(jobs, search, typeId, selectedLocation);
  };

  const handleLocationChange = (locId) => {
    setSelectedLocation(locId);
    applyClientFilters(jobs, search, selectedType, locId);
  };

  useGSAP(() => {
    if (cardsGridRef.current && filteredJobs.length > 0) {
      gsap.fromTo(
        cardsGridRef.current.querySelectorAll(".job-card"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power3.out" }
      );
    }
  }, [filteredJobs]);

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#07080b] text-zinc-100 font-sans selection:bg-violet-600 selection:text-white" ref={containerRef}>
      {/* Ambient background wash */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-violet-950/20 via-purple-950/10 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-violet-900/10 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-mono text-zinc-400">Opportunity Discovery Radar</div>
              <div className="text-sm font-semibold text-zinc-200">Curated Placement Pipeline</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/app/company-intel")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-violet-400" />
              Company Intel
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/interview")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/50 transition-all flex items-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5" />
              Practice Mock Interview
            </button>
          </div>
        </header>

        {/* Wide Header Section */}
        <section className="space-y-6">
          <div className="max-w-5xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Curated Engineering Openings and Verified Hiring Pipelines
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Targeted job opportunities calibrated for software engineering, frontend architecture, backend systems, and high-growth technology internships.
            </p>
          </div>

          {/* Telemetry Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">Active Positions</div>
              <div className="text-xl font-bold text-white mt-1">{filteredJobs.length} Verified</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">Tier-1 Employers</div>
              <div className="text-xl font-bold text-violet-400 mt-1">Google, MS, Uber, Amazon</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">Application Mode</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">Direct Portal Link</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">Match Calibration</div>
              <div className="text-xl font-bold text-zinc-300 mt-1">Algorithmic Fit Mapped</div>
            </div>
          </div>

          {/* Search and Multi-Filter Command Control */}
          <div className="p-4 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 shadow-2xl backdrop-blur-md space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Filter by role title, employer name, city, or required technologies (e.g. React, Go, Java)..."
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/80 transition-all font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-900">
              {/* Type Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Role Type:</span>
                {EMPLOYMENT_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleTypeChange(f.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                      selectedType === f.id
                        ? "bg-violet-950 text-violet-200 border-violet-600 font-semibold shadow-sm"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Location Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Location:</span>
                {LOCATION_FILTERS.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleLocationChange(loc.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                      selectedLocation === loc.id
                        ? "bg-zinc-800 text-white border-zinc-700 font-semibold"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gapless Bento Grid of Job Opportunities */}
        <section>
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-500 uppercase">Synchronizing hiring feeds...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div ref={cardsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense">
              {filteredJobs.map((job, idx) => {
                const employerName = job.employer_name || "Enterprise Tech";
                const initial = employerName.charAt(0);
                const isRemote = job.job_is_remote || (job.job_city || "").toLowerCase().includes("remote");
                const postedDate = job.job_posted_at_datetime_utc
                  ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Recently Posted";

                return (
                  <div
                    key={job.job_id || idx}
                    className="job-card group rounded-3xl bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-700 p-6 shadow-xl flex flex-col justify-between space-y-6 transition-all duration-300 backdrop-blur-md"
                  >
                    <div className="space-y-4">
                      {/* Employer & Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-base overflow-hidden shrink-0 group-hover:border-violet-500/50 transition-colors">
                            {job.employer_logo ? (
                              <img
                                src={job.employer_logo}
                                alt={employerName}
                                className="w-full h-full object-contain p-1.5"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xs font-mono font-bold text-zinc-400 tracking-wide uppercase">
                              {employerName}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                              <MapPin className="w-3 h-3 text-zinc-500" />
                              <span>{isRemote ? "Remote / Distributed" : `${job.job_city || "Bengaluru"}, ${job.job_country || "India"}`}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
                          {job.job_employment_type || "FULLTIME"}
                        </span>
                      </div>

                      {/* Job Title */}
                      <div>
                        <h2 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                          {job.job_title}
                        </h2>
                        {job.job_description && (
                          <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                            {job.job_description}
                          </p>
                        )}
                      </div>

                      {/* Skills Tags */}
                      {job.job_required_skills && job.job_required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.job_required_skills.slice(0, 4).map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-violet-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer & Actions */}
                    <div className="pt-4 border-t border-zinc-900 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          {postedDate}
                        </span>
                        {job.job_min_salary && (
                          <span className="text-emerald-400 font-semibold">
                            INR {(job.job_min_salary / 100000).toFixed(1)}L - {(job.job_max_salary / 100000).toFixed(1)}L
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={job.job_apply_link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold text-center tracking-wide uppercase shadow-md shadow-violet-950/60 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Apply</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          type="button"
                          onClick={() => navigate(`/app/company-intel?company=${encodeURIComponent(employerName)}`)}
                          className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1"
                        >
                          <span>Intel Dossier</span>
                          <ChevronRight className="w-3 h-3 text-zinc-500" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No Matching Openings Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No active roles match your search filters. Try clearing keywords or broadening the location filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedType("ALL");
                  setSelectedLocation("ALL");
                  applyClientFilters(jobs, "", "ALL", "ALL");
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}