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
  Tag,
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

export const POPULAR_SKILL_TAGS = [
  "Java",
  "React",
  "Python",
  "Go",
  "TypeScript",
  "Node.js",
  "Spring Boot",
  "AWS",
  "Kafka",
  "SQL",
  "Docker",
  "Kubernetes",
  "C++",
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
  selectedSkill = "ALL",
  onSelectSkill = () => {},
  onResetFilters,
  hasActiveFilters,
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search Input Bar + Quick Sort */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#24231F] border border-[#3A3831] shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A8A59C] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by job title, company name, skills (e.g. Java, React, Go), or city..."
              className="w-full pl-11 pr-10 py-3 bg-[#11110F] border border-[#3A3831] rounded-2xl text-xs sm:text-sm text-[#FAF8F2] placeholder-[#8C8980] focus:outline-none focus:border-[#C7F36B] transition-all font-sans"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C8980] hover:text-[#FAF8F2]"
                aria-label="Clear Search"
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
                className="w-full sm:w-auto appearance-none bg-[#11110F] border border-[#3A3831] hover:border-[#4A473F] text-[#FAF8F2] text-xs font-semibold py-3 pl-3.5 pr-8 rounded-2xl focus:outline-none focus:border-[#C7F36B] transition-all cursor-pointer font-sans"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#11110F] text-[#FAF8F2]">
                    Sort: {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C8980] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden p-3 rounded-2xl bg-[#11110F] border border-[#3A3831] text-[#FAF8F2] flex items-center justify-center shrink-0"
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
          } flex-wrap items-center gap-2.5 pt-3 border-t border-[#3A3831]`}
        >
          {/* Role Filter */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="appearance-none bg-[#11110F] border border-[#3A3831] hover:border-[#4A473F] text-[#FAF8F2] text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-[#C7F36B] transition-all cursor-pointer"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#11110F] text-[#FAF8F2]">
                  Role: {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#8C8980] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="appearance-none bg-[#11110F] border border-[#3A3831] hover:border-[#4A473F] text-[#FAF8F2] text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-[#C7F36B] transition-all cursor-pointer"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-[#11110F] text-[#FAF8F2]">
                  Location: {loc.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#8C8980] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Work Mode Filter */}
          <div className="relative">
            <select
              value={workMode}
              onChange={(e) => onWorkModeChange(e.target.value)}
              className="appearance-none bg-[#11110F] border border-[#3A3831] hover:border-[#4A473F] text-[#FAF8F2] text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-[#C7F36B] transition-all cursor-pointer"
            >
              {WORK_MODE_OPTIONS.map((wm) => (
                <option key={wm.id} value={wm.id} className="bg-[#11110F] text-[#FAF8F2]">
                  Mode: {wm.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#8C8980] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Experience Filter */}
          <div className="relative">
            <select
              value={experience}
              onChange={(e) => onExperienceChange(e.target.value)}
              className="appearance-none bg-[#11110F] border border-[#3A3831] hover:border-[#4A473F] text-[#FAF8F2] text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-[#C7F36B] transition-all cursor-pointer"
            >
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp.id} value={exp.id} className="bg-[#11110F] text-[#FAF8F2]">
                  Exp: {exp.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#8C8980] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Min Salary Filter */}
          <div className="relative">
            <select
              value={minSalary}
              onChange={(e) => onMinSalaryChange(Number(e.target.value))}
              className="appearance-none bg-[#11110F] border border-[#3A3831] hover:border-[#4A473F] text-[#FAF8F2] text-xs font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-[#C7F36B] transition-all cursor-pointer"
            >
              <option value={0} className="bg-[#11110F] text-[#FAF8F2]">Salary: Any</option>
              <option value={1000000} className="bg-[#11110F] text-[#FAF8F2]">Salary: ₹10L+ / yr</option>
              <option value={1800000} className="bg-[#11110F] text-[#FAF8F2]">Salary: ₹18L+ / yr</option>
              <option value={2400000} className="bg-[#11110F] text-[#FAF8F2]">Salary: ₹24L+ / yr</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#8C8980] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Pill */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 rounded-xl bg-[#11110F] hover:bg-[#1A1916] text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-medium transition-all flex items-center gap-1.5 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Skill Tags Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar text-xs">
          <span className="text-[10px] font-mono uppercase text-[#8C8980] font-bold tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#C7F36B]" />
            Skills:
          </span>
          <button
            type="button"
            onClick={() => onSelectSkill("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 border ${
              selectedSkill === "ALL"
                ? "bg-[#C7F36B] text-[#11110F] border-[#C7F36B] font-bold"
                : "bg-[#11110F] text-[#A8A59C] border-[#3A3831] hover:text-[#FAF8F2] hover:border-[#4A473F]"
            }`}
          >
            All
          </button>
          {POPULAR_SKILL_TAGS.map((skill) => {
            const isSelected = selectedSkill === skill;
            return (
              <button
                key={skill}
                type="button"
                onClick={() => onSelectSkill(isSelected ? "ALL" : skill)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 border ${
                  isSelected
                    ? "bg-[#C7F36B] text-[#11110F] border-[#C7F36B] font-bold shadow-sm"
                    : "bg-[#11110F] text-[#A8A59C] border-[#3A3831] hover:text-[#FAF8F2] hover:border-[#4A473F]"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
