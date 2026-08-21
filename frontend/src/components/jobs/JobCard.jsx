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

  const matchScore = job.matchScore || 75;

  // Match score color gradient
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 65) return "text-violet-400 border-violet-500/30 bg-violet-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  const getScoreBarGradient = (score) => {
    if (score >= 80) return "from-emerald-500 to-teal-400";
    if (score >= 65) return "from-violet-500 to-purple-400";
    return "from-amber-500 to-orange-400";
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onSelect(job)}
        className="group relative rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 p-5 shadow-lg hover:shadow-violet-950/20 transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Company Avatar */}
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-base overflow-hidden shrink-0 group-hover:border-violet-500/40 transition-colors">
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
              <span className="text-xs font-mono font-bold text-zinc-400 tracking-wide uppercase">
                {employerName}
              </span>
              {isDemo && (
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                  Demo Listing
                </span>
              )}
              {job.fitStatus && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    job.fitBadgeClass || "bg-zinc-800 text-zinc-300 border-zinc-700"
                  }`}
                >
                  {job.fitStatus}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors truncate">
              {job.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {isRemote ? "Remote" : `${job.city || "Bengaluru"}, India`}
              </span>
              <span className="text-zinc-600">•</span>
              <span>{job.workMode || "Hybrid"}</span>
              <span className="text-zinc-600">•</span>
              <span>{job.experience || "0-2 years"}</span>
              {job.salary && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {job.salary}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Match Score & Actions */}
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-900">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
              Profile Fit
            </div>
            <div
              className={`text-sm font-mono font-extrabold px-2.5 py-0.5 rounded-lg border inline-flex items-center gap-1 mt-0.5 ${getScoreColor(
                matchScore
              )}`}
            >
              <Sparkles className="w-3 h-3" />
              {matchScore}% Match
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
                  ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-950/60"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => onSelect(job)}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-950/50 flex items-center gap-1"
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
      className="job-card group relative rounded-3xl bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-700 p-6 shadow-xl hover:shadow-2xl hover:shadow-violet-950/20 flex flex-col justify-between space-y-5 transition-all duration-300 backdrop-blur-md cursor-pointer"
    >
      <div className="space-y-4">
        {/* Top Header: Company Info + Save Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-base overflow-hidden shrink-0 group-hover:border-violet-500/50 transition-colors">
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
                <h3 className="text-xs font-mono font-bold text-zinc-300 tracking-wide uppercase truncate">
                  {employerName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                <span className="truncate">
                  {isRemote
                    ? "Remote"
                    : `${job.city || "Bengaluru"}, ${job.country || "India"}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isDemo && (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-900/90 text-zinc-400 border border-zinc-800">
                Demo
              </span>
            )}
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
                  ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-950/60"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${job.isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Job Title & Badges */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors leading-snug line-clamp-2">
            {job.title}
          </h2>

          <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-zinc-400">
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              {job.employmentType || "Full-time"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              {job.workMode || "Hybrid"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              {job.experienceLevel || job.experience || "Entry Level"}
            </span>
          </div>
        </div>

        {/* Match Score Meter */}
        <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 uppercase font-semibold">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Your Match</span>
            </div>
            <div
              className={`text-xs font-mono font-bold px-2 py-0.2 rounded ${getScoreColor(
                matchScore
              )}`}
            >
              {matchScore}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getScoreBarGradient(
                matchScore
              )} transition-all duration-500`}
              style={{ width: `${Math.min(matchScore, 100)}%` }}
            />
          </div>

          {/* Missing Skills Warning */}
          {job.missingSkills && job.missingSkills.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 pt-0.5 truncate">
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
                      ? "bg-amber-500/5 text-amber-300/90 border-amber-500/20"
                      : "bg-violet-950/40 text-violet-300 border-violet-800/40"
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {job.skills.length > 4 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-4 border-t border-zinc-900 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-600" />
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
            className="py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold text-center tracking-wide uppercase shadow-md shadow-violet-950/60 transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Job</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={job.applicationUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
