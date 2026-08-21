import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  Sparkles,
  MapPin,
  Briefcase,
  Layers,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export const ROLE_OPTIONS = [
  { id: "ALL", label: "All Roles" },
  { id: "Software Engineer", label: "Software Engineer" },
  { id: "Frontend", label: "Frontend" },
  { id: "Backend", label: "Backend" },
  { id: "Full Stack", label: "Full Stack" },
  { id: "Data & AI", label: "Data & AI / ML" },
  { id: "DevOps & Cloud", label: "DevOps & Cloud" },
  { id: "Internship", label: "Internships" },
];

export const LOCATION_OPTIONS = [
  { id: "ALL", label: "All Locations" },
  { id: "Remote", label: "Remote Only" },
  { id: "Bengaluru", label: "Bengaluru" },
  { id: "Hyderabad", label: "Hyderabad" },
  { id: "Delhi NCR", label: "Delhi NCR / Noida / Gurugram" },
  { id: "Pune", label: "Pune" },
  { id: "Mumbai", label: "Mumbai" },
];

export const WORK_MODE_OPTIONS = [
  { id: "ALL", label: "All Modes" },
  { id: "Remote", label: "Remote" },
  { id: "Hybrid", label: "Hybrid" },
  { id: "On-site", label: "On-site" },
];

export const EXPERIENCE_OPTIONS = [
  { id: "ALL", label: "All Experience" },
  { id: "Internship", label: "Internship" },
  { id: "Entry Level", label: "Entry Level (0-2 yrs)" },
  { id: "1-3 years", label: "1-3 years" },
];

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended Fit" },
  { id: "match", label: "Highest Match %" },
  { id: "newest", label: "Recently Posted" },
  { id: "salary", label: "Highest Compensation" },
  { id: "experience", label: "Entry-Level Friendly" },
  { id: "company", label: "Company Name (A-Z)" },
];

export default function JobFiltersBar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  location,
  onLocationChange,
  workMode,
  onWorkModeChange,
  experience,
  onExperienceChange,
  sort,
  onSortChange,
  minSalary,
  onMinSalaryChange,
  onResetFilters,
  hasActiveFilters,
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search Input Bar + Quick Sort */}
      <div className="p-3 sm:p-4 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by job title, company name, skills (e.g. Java, React, Go), or city..."
              className="w-full pl-11 pr-10 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/80 transition-all font-sans"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-semibold py-3 pl-3.5 pr-8 rounded-2xl focus:outline-none focus:border-violet-500 transition-all cursor-pointer font-sans"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                    Sort: {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0"
              aria-label="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-facet Dropdown Row (Desktop & Expanded Mobile) */}
        <div
          className={`${
            showMobileFilters ? "flex" : "hidden sm:flex"
          } flex-wrap items-center gap-2.5 pt-3 border-t border-zinc-900`}
        >
          {/* Role Filter */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id} className="bg-zinc-900 text-white">
                  Role: {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-zinc-900 text-white">
                  Location: {loc.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Work Mode Filter */}
          <div className="relative">
            <select
              value={workMode}
              onChange={(e) => onWorkModeChange(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              {WORK_MODE_OPTIONS.map((wm) => (
                <option key={wm.id} value={wm.id} className="bg-zinc-900 text-white">
                  Mode: {wm.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Experience Filter */}
          <div className="relative">
            <select
              value={experience}
              onChange={(e) => onExperienceChange(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp.id} value={exp.id} className="bg-zinc-900 text-white">
                  Exp: {exp.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Min Salary Filter */}
          <div className="relative">
            <select
              value={minSalary}
              onChange={(e) => onMinSalaryChange(Number(e.target.value))}
              className="appearance-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              <option value={0} className="bg-zinc-900 text-white">Salary: Any</option>
              <option value={1000000} className="bg-zinc-900 text-white">Salary: ₹10L+ / yr</option>
              <option value={1800000} className="bg-zinc-900 text-white">Salary: ₹18L+ / yr</option>
              <option value={2400000} className="bg-zinc-900 text-white">Salary: ₹24L+ / yr</option>
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Pill */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-medium transition-all flex items-center gap-1.5 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
