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
} from "lucide-react";

export default function JobCard({
  job,
  onSelect,
  onToggleSave,
  onLearnSkill,
  viewMode = "grid",
}) {
  const employerName = job.company || "Technology Company";
  const initial = employerName.charAt(0).toUpperCase();
  const isRemote =
    job.workMode === "Remote" || (job.city || "").toLowerCase().includes("remote");
  const isDemo = job.sourceType === "DEMO";

  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Recently";

  const matchScore = job.matchScore != null ? job.matchScore : null;

  // Match score styling
  const getScoreColor = (score) => {
    if (score == null) return "text-[#A8A59C] border-[#3A3831] bg-[#1A1916]";
    if (score >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 65) return "text-purple-300 border-purple-500/30 bg-purple-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  const getScoreBarGradient = (score) => {
    if (score == null) return "from-zinc-600 to-zinc-700";
    if (score >= 80) return "from-emerald-400 to-emerald-500";
    if (score >= 65) return "from-purple-400 to-purple-500";
    return "from-amber-400 to-amber-500";
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onSelect(job)}
        className="group relative rounded-2xl bg-[#24231F] border border-[#3A3831] hover:border-purple-500/40 p-5 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Company Avatar */}
          <div className="w-12 h-12 rounded-xl bg-[#11110F] border border-[#3A3831] flex items-center justify-center text-[#FAF8F2] font-bold text-base overflow-hidden shrink-0 group-hover:border-purple-500/40 transition-colors">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
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

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#A8A59C] tracking-wide uppercase">
                {employerName}
              </span>
              {job.fitStatus && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    job.fitBadgeClass || "bg-[#1A1916] text-[#FAF8F2] border-[#3A3831]"
                  }`}
                >
                  {job.fitStatus}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-[#FAF8F2] group-hover:text-purple-300 transition-colors truncate">
              {job.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#A8A59C] pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8C8980]" />
                {isRemote ? "Remote" : `${job.city || "Bengaluru"}, India`}
              </span>
              <span className="text-[#3A3831]">•</span>
              <span>{job.workMode || "Hybrid"}</span>
              <span className="text-[#3A3831]">•</span>
              <span>{job.experience || "0-2 years"}</span>
              {job.salary && (
                <>
                  <span className="text-[#3A3831]">•</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {job.salary}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Match Score & Actions */}
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#3A3831]">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-[#8C8980] font-semibold">
              Profile Fit
            </div>
            <div
              className={`text-sm font-mono font-extrabold px-2.5 py-0.5 rounded-lg border inline-flex items-center gap-1 mt-0.5 ${getScoreColor(
                matchScore
              )}`}
            >
              <Sparkles className="w-3 h-3" />
              {matchScore != null ? `${matchScore}% Match` : "Unassessed Fit"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job);
              }}
              aria-label={job.isSaved ? "Unsave Job" : "Save Job"}
              className={`p-2.5 rounded-xl border transition-all ${
                job.isSaved
                  ? "bg-purple-500 text-white border-purple-500 font-bold"
                  : "bg-[#11110F] hover:bg-[#1A1916] text-[#A8A59C] hover:text-[#FAF8F2] border-[#3A3831]"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => onSelect(job)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all shadow-md flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid / Bento Card Layout (Standard)
  return (
    <div
      onClick={() => onSelect(job)}
      className="job-card group relative rounded-3xl bg-[#24231F] border border-[#3A3831] hover:border-purple-500/40 p-6 shadow-xl hover:shadow-2xl flex flex-col justify-between space-y-5 transition-all duration-300 backdrop-blur-md cursor-pointer"
    >
      <div className="space-y-4">
        {/* Top Header: Company Info + Save Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#11110F] border border-[#3A3831] flex items-center justify-center text-[#FAF8F2] font-bold text-base overflow-hidden shrink-0 group-hover:border-purple-500/40 transition-colors">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
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

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-mono font-bold text-[#A8A59C] tracking-wide uppercase truncate">
                  {employerName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8C8980] mt-0.5">
                <MapPin className="w-3 h-3 text-[#8C8980] shrink-0" />
                <span className="truncate">
                  {isRemote
                    ? "Remote"
                    : `${job.city || "Bengaluru"}, ${job.country || "India"}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job);
              }}
              title={job.isSaved ? "Saved to your list" : "Save Job"}
              aria-label={job.isSaved ? "Saved to your list" : "Save Job"}
              className={`p-2 rounded-xl border transition-all ${
                job.isSaved
                  ? "bg-purple-500 text-white border-purple-500 font-bold"
                  : "bg-[#11110F] hover:bg-[#1A1916] text-[#A8A59C] hover:text-[#FAF8F2] border-[#3A3831]"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${job.isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Job Title & Badges */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#FAF8F2] group-hover:text-purple-300 transition-colors leading-snug line-clamp-2">
            {job.title}
          </h2>

          <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-[#A8A59C]">
            <span className="px-2 py-0.5 rounded-md bg-[#11110F] border border-[#3A3831] text-[#FAF8F2]">
              {job.employmentType || "Full-time"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#11110F] border border-[#3A3831] text-[#FAF8F2]">
              {job.workMode || "Hybrid"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#11110F] border border-[#3A3831] text-[#FAF8F2]">
              {job.experienceLevel || job.experience || "Entry Level"}
            </span>
          </div>
        </div>

        {/* Match Score Meter */}
        <div className="p-3.5 rounded-2xl bg-[#11110F] border border-[#3A3831] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#A8A59C] uppercase font-semibold">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Your Match</span>
            </div>
            <div
              className={`text-xs font-mono font-bold px-2 py-0.2 rounded ${getScoreColor(
                matchScore
              )}`}
            >
              {matchScore != null ? `${matchScore}%` : "Unassessed"}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#1A1916] rounded-full overflow-hidden border border-[#3A3831]/50">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getScoreBarGradient(
                matchScore
              )} transition-all duration-500`}
              style={{ width: `${matchScore != null ? Math.min(matchScore, 100) : 0}%` }}
            />
          </div>

          {/* Missing Skills Warning */}
          {job.missingSkills && job.missingSkills.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 pt-0.5 truncate">
              <AlertTriangle className="w-3 h-3 shrink-0 text-amber-400" />
              <span className="truncate">
                Gap: {job.missingSkills.slice(0, 2).join(", ")}
                {job.missingSkills.length > 2 ? ` +${job.missingSkills.length - 2}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Tech Stack Pills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.skills.slice(0, 4).map((skill, sIdx) => {
              const isMissing = job.missingSkills?.includes(skill);
              return (
                <span
                  key={sIdx}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    isMissing
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {job.skills.length > 4 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#11110F] border border-[#3A3831] text-[#8C8980]">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-4 border-t border-[#3A3831] space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8980]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#8C8980]" />
            {postedDate}
          </span>
          {job.salary && (
            <span className="text-emerald-400 font-semibold truncate max-w-[170px] text-right">
              {job.salary}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelect(job)}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold text-center tracking-wide uppercase shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Job</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={job.applicationUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2.5 px-3 rounded-xl bg-[#11110F] hover:bg-[#1A1916] text-[#FAF8F2] border border-[#3A3831] hover:border-[#4A473F] text-xs font-semibold text-center transition-all flex items-center justify-center gap-1"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3 text-[#8C8980]" />
          </a>
        </div>
      </div>
    </div>
  );
}
