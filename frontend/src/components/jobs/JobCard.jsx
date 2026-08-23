import React from "react";
import {
  MapPin,
  Clock,
  ExternalLink,
  Bookmark,
  Building2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import GpBadge from "@/components/gp/GpBadge";

export default function JobCard({
  job = {},
  onSelect,
  onToggleSave,
  onLearnSkill,
  viewMode = "grid",
}) {
  const employerName = job.company || job.employer_name || "Technology Company";
  const title = job.title || job.job_title || "Software Engineer";
  const companyLogo = job.companyLogo || job.employer_logo || "";
  const initial = employerName.charAt(0).toUpperCase();
  const city = job.city || job.job_city || job.location || "Bengaluru";
  const isRemote =
    job.workMode === "Remote" ||
    job.job_is_remote === true ||
    (city || "").toLowerCase().includes("remote");

  const postedDate =
    job.postedDate || job.job_posted_at_datetime_utc
      ? new Date(job.postedDate || job.job_posted_at_datetime_utc).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Recently";

  const rawSkills = job.skills || job.job_required_skills || [];
  const skillsList = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string"
    ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const salary =
    job.salary ||
    (job.minSalary && job.maxSalary
      ? `₹${Number(job.minSalary).toLocaleString()} - ₹${Number(job.maxSalary).toLocaleString()}`
      : "Competitive CTC");

  const employmentType = job.employmentType || job.job_employment_type || "Full-time";
  const matchScore = job.matchScore != null ? job.matchScore : null;

  const getScoreBadgeTheme = (score) => {
    if (score == null) return "yellow";
    if (score >= 80) return "mint";
    if (score >= 65) return "blue";
    return "yellow";
  };

  // LIST VIEW
  if (viewMode === "list") {
    return (
      <div
        onClick={() => onSelect(job)}
        className="group relative rounded-2xl bg-white border border-[#E2DEEC] hover:border-[#C8C3D8] shadow-sm hover:shadow-md hover:-translate-y-0.5 p-4 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] flex items-center justify-center font-bold text-sm text-[#17103D] shrink-0">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={employerName}
                className="w-full h-full object-contain p-1 rounded-xl"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-[#17103D] group-hover:text-[#6E44FF] transition-colors truncate">
                {title}
              </h3>
              {matchScore != null && (
                <GpBadge theme={getScoreBadgeTheme(matchScore)} size="sm">
                  {matchScore}% Match
                </GpBadge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6F6A80] flex-wrap">
              <span className="font-semibold text-[#17103D]">{employerName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {city}
              </span>
              <span>•</span>
              <span className="font-mono">{salary}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job);
            }}
            className="p-2 rounded-xl border border-[#E2DEEC] hover:bg-[#F8F8F5] text-[#6F6A80] hover:text-[#17103D] transition-colors"
          >
            <Bookmark className={`w-3.5 h-3.5 ${job.isSaved ? "fill-[#6E44FF] text-[#6E44FF]" : ""}`} />
          </button>

          <button
            onClick={() => onSelect(job)}
            className="px-3.5 py-1.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div
      onClick={() => onSelect(job)}
      className="group relative rounded-2xl bg-white border border-[#E2DEEC] hover:border-[#C8C3D8] shadow-sm hover:shadow-md hover:-translate-y-0.5 p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] flex items-center justify-center font-bold text-sm text-[#17103D] shrink-0">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={employerName}
                  className="w-full h-full object-contain p-1 rounded-xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-[#17103D] truncate">{employerName}</div>
              <div className="text-[11px] text-[#6F6A80] flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{city}</span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job);
            }}
            className="p-1.5 rounded-lg border border-[#E2DEEC] hover:bg-[#F8F8F5] text-[#6F6A80] hover:text-[#17103D] transition-colors"
          >
            <Bookmark className={`w-3.5 h-3.5 ${job.isSaved ? "fill-[#6E44FF] text-[#6E44FF]" : ""}`} />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#17103D] group-hover:text-[#6E44FF] transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-[#6F6A80] line-clamp-2 leading-relaxed">
            {job.description || "Exciting opportunity to build scalable systems with modern technologies."}
          </p>
        </div>

        {/* Skills Tag Pills */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skillsList.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-[#F8F8F5] border border-[#E2DEEC] text-[#6F6A80]"
              >
                {skill}
              </span>
            ))}
            {skillsList.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-lg text-[#6F6A80]">
                +{skillsList.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta & Score */}
      <div className="pt-3 border-t border-[#E2DEEC] flex items-center justify-between text-xs">
        <div>
          <span className="font-mono font-bold text-[#17103D] block text-xs">
            {salary}
          </span>
          <span className="text-[10px] text-[#6F6A80]">{employmentType}</span>
        </div>

        {matchScore != null ? (
          <GpBadge theme={getScoreBadgeTheme(matchScore)} size="sm">
            {matchScore}% Match
          </GpBadge>
        ) : (
          <span className="text-xs font-semibold text-[#6E44FF] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
}
