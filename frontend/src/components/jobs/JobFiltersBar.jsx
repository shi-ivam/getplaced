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
  LayoutGrid,
  List,
} from "lucide-react";
import GpBadge from "@/components/gp/GpBadge";

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
  viewMode = "grid",
  onViewModeChange = () => {},
  totalResults,
  onResetFilters,
  hasActiveFilters,
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="space-y-3">
      {/* Search Input Bar + Quick Sort + View Mode */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#0D0431]/60 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by job title, company name, skills (e.g. Java, React, Go), or city..."
              className="w-full pl-11 pr-10 py-3 bg-white border-2 border-[#0D0431] rounded-2xl text-xs sm:text-sm text-[#0D0431] placeholder-[#0D0431]/40 shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] focus:shadow-[4px_4px_0_0_#0D0431] transition-all font-sans font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#0D0431]/60 hover:text-[#0D0431] cursor-pointer"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown & View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white border-2 border-[#0D0431] text-[#0D0431] text-xs font-bold py-3 pl-3.5 pr-8 rounded-2xl shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] transition-all cursor-pointer font-sans"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white text-[#0D0431]">
                    Sort: {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#0D0431] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle Buttons (Grid vs List) */}
            <div className="hidden sm:flex items-center p-1 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] shrink-0">
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                aria-label="Grid View"
                title="Grid View"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#0D0431] text-white shadow-sm font-bold"
                    : "text-[#0D0431]/60 hover:text-[#0D0431] hover:bg-[#FEF9CF]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("list")}
                aria-label="List View"
                title="List View"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#0D0431] text-white shadow-sm font-bold"
                    : "text-[#0D0431]/60 hover:text-[#0D0431] hover:bg-[#FEF9CF]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden p-3 rounded-2xl bg-white border-2 border-[#0D0431] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center shrink-0 cursor-pointer"
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
          } flex-wrap items-center gap-2.5 pt-3 border-t-2 border-[#0D0431]/10`}
        >
          {/* Role Filter */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="appearance-none bg-white border-2 border-[#0D0431] hover:bg-[#FEF9CF] text-[#0D0431] text-xs font-bold py-2 pl-3 pr-7 rounded-xl shadow-[2px_2px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] transition-all cursor-pointer font-sans"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id} className="bg-white text-[#0D0431]">
                  Role: {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#0D0431] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="appearance-none bg-white border-2 border-[#0D0431] hover:bg-[#FEF9CF] text-[#0D0431] text-xs font-bold py-2 pl-3 pr-7 rounded-xl shadow-[2px_2px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] transition-all cursor-pointer font-sans"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-white text-[#0D0431]">
                  Location: {loc.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#0D0431] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Work Mode Filter */}
          <div className="relative">
            <select
              value={workMode}
              onChange={(e) => onWorkModeChange(e.target.value)}
              className="appearance-none bg-white border-2 border-[#0D0431] hover:bg-[#FEF9CF] text-[#0D0431] text-xs font-bold py-2 pl-3 pr-7 rounded-xl shadow-[2px_2px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] transition-all cursor-pointer font-sans"
            >
              {WORK_MODE_OPTIONS.map((wm) => (
                <option key={wm.id} value={wm.id} className="bg-white text-[#0D0431]">
                  Mode: {wm.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#0D0431] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Experience Filter */}
          <div className="relative">
            <select
              value={experience}
              onChange={(e) => onExperienceChange(e.target.value)}
              className="appearance-none bg-white border-2 border-[#0D0431] hover:bg-[#FEF9CF] text-[#0D0431] text-xs font-bold py-2 pl-3 pr-7 rounded-xl shadow-[2px_2px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] transition-all cursor-pointer font-sans"
            >
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp.id} value={exp.id} className="bg-white text-[#0D0431]">
                  Exp: {exp.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#0D0431] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Min Salary Filter */}
          <div className="relative">
            <select
              value={minSalary}
              onChange={(e) => onMinSalaryChange(Number(e.target.value))}
              className="appearance-none bg-white border-2 border-[#0D0431] hover:bg-[#FEF9CF] text-[#0D0431] text-xs font-bold py-2 pl-3 pr-7 rounded-xl shadow-[2px_2px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] transition-all cursor-pointer font-sans"
            >
              <option value={0} className="bg-white text-[#0D0431]">Salary: Any</option>
              <option value={1000000} className="bg-white text-[#0D0431]">Salary: ₹10L+ / yr</option>
              <option value={1800000} className="bg-white text-[#0D0431]">Salary: ₹18L+ / yr</option>
              <option value={2400000} className="bg-white text-[#0D0431]">Salary: ₹24L+ / yr</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#0D0431] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle (Visible in Mobile Expanded View) */}
          <div className="flex sm:hidden items-center p-1 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === "grid" ? "bg-[#0D0431] text-white" : "text-[#0D0431]/70"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === "list" ? "bg-[#0D0431] text-white" : "text-[#0D0431]/70"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Reset Filters Pill */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-1.5 rounded-xl bg-[#FFC5B7] hover:bg-[#F85B52] hover:text-white text-[#0D0431] border-2 border-[#0D0431] text-xs font-bold transition-all shadow-[2px_2px_0_0_#0D0431] flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Quick Skill Tags Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar text-xs">
          <span className="text-[10px] font-heading font-bold uppercase text-[#0D0431] tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#896EE2]" />
            Skills:
          </span>
          <button
            type="button"
            onClick={() => onSelectSkill("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all shrink-0 border-2 border-[#0D0431] cursor-pointer ${
              selectedSkill === "ALL"
                ? "bg-[#0D0431] text-white shadow-[2px_2px_0_0_#FEDF6A]"
                : "bg-white text-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
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
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all shrink-0 border-2 border-[#0D0431] cursor-pointer ${
                  isSelected
                    ? "bg-[#0D0431] text-white shadow-[2px_2px_0_0_#FEDF6A]"
                    : "bg-white text-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
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

