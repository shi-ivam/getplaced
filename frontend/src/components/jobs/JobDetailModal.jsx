import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  Bookmark,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FileText,
  Code2,
  Target,
  Share2,
  Check,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  GraduationCap,
} from "lucide-react";

export default function JobDetailModal({
  job,
  onClose,
  onToggleSave,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "match" | "preparation" | "company"

  if (!job) return null;

  const employerName = job.company || "Enterprise Technology";
  const initial = employerName.charAt(0).toUpperCase();
  const isRemote =
    job.workMode === "Remote" || (job.city || "").toLowerCase().includes("remote");
  const isDemo = job.sourceType === "DEMO";

  const postedDate = job.postedDate
    ? new Date(job.postedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Verified";

  const matchScore = job.matchScore || 75;
  const readinessScore = job.readinessComparison?.readinessScore || 74;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLearnSkill = (skill) => {
    onClose();
    navigate(`/app/library?search=${encodeURIComponent(skill)}`);
  };

  const handlePrepareJob = () => {
    onClose();
    navigate("/app/roadmap");
  };

  const handleTailorResume = () => {
    onClose();
    navigate(`/app/resume?targetRole=${encodeURIComponent(job.title)}&company=${encodeURIComponent(employerName)}`);
  };

  const handlePracticeDsa = () => {
    onClose();
    navigate("/app/dsa");
  };

  const handleCompanyIntel = () => {
    onClose();
    navigate(`/app/company-intel?company=${encodeURIComponent(employerName)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-[#0c0d12] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-6 pb-4 border-b border-zinc-800/80 bg-zinc-950/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0 shadow-md">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={employerName}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase">
                  {employerName}
                </span>
                {isDemo ? (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-400 border border-zinc-700/70 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-zinc-400" />
                    Demo Listing
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified Official
                  </span>
                )}
                {job.fitStatus && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      job.fitBadgeClass || "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}
                  >
                    {job.fitStatus}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {isRemote ? "Remote / Distributed" : `${job.city || "Bengaluru"}, India`}
                </span>
                <span className="text-zinc-700">•</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">
                  {job.workMode || "Hybrid"}
                </span>
                <span className="text-zinc-700">•</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">
                  {job.employmentType || "Full-time"}
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {job.salary || "Competitive Market Standard"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              title="Share job link"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(job)}
              title={job.isSaved ? "Saved to your list" : "Save job"}
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
              onClick={onClose}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center gap-1 overflow-x-auto">
          {[
            { id: "overview", label: "Job Details & Specs" },
            { id: "match", label: `Fit Analysis (${matchScore}%)` },
            { id: "preparation", label: "Preparation Roadmap" },
            { id: "company", label: "Company Intel" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-semibold tracking-wide border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? "text-violet-400 border-violet-500 font-bold bg-violet-950/20"
                  : "text-zinc-400 border-transparent hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Highlight Match Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-zinc-900/40 border border-violet-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-mono uppercase font-bold text-violet-300">
                      GetPlaced Match Score: {matchScore}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {job.readinessComparison?.summaryNote ||
                      `Calibrated fit for your target role and skill profile.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("match")}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white text-xs font-semibold border border-violet-500/40 transition-all flex items-center gap-1 shrink-0"
                >
                  <span>View Breakdown</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                    Experience
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {job.experience || "0-2 years"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                    Education Cutoff
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    CGPA {job.cgpaCutoff || "7.0"}+ / B.Tech
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                    Work Location
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {isRemote ? "Remote" : `${job.city || "Bengaluru"}`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                    Posted Date
                  </div>
                  <div className="text-xs font-bold text-zinc-300 mt-1">
                    {postedDate}
                  </div>
                </div>
              </div>

              {/* About Role */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400">
                  About The Role
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Key Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="text-xs text-zinc-300 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements & Qualifications */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400">
                    Candidate Requirements
                  </h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, reqIdx) => (
                      <li key={reqIdx} className="text-xs text-zinc-300 flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills & Tech Stack */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400">
                  Required Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(job.skills || []).map((skill, sIdx) => {
                    const isMatched = job.matchedSkills?.includes(skill);
                    return (
                      <span
                        key={sIdx}
                        className={`text-xs font-mono px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                          isMatched
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {isMatched ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{skill}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Skills */}
              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400">
                    Preferred / Bonus Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((ps, psIdx) => (
                      <span
                        key={psIdx}
                        className="text-xs font-mono px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400"
                      >
                        {ps}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "match" && (
            <div className="space-y-6">
              {/* Score Dual Gauges: Match vs Readiness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                      Job Match Score
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {matchScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1">
                    Evaluates how your current skills, target role, education, and experience align with this position.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                      Your Interview Readiness
                    </span>
                    <span className="text-2xl font-black font-mono text-violet-400">
                      {readinessScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${readinessScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1">
                    Your overall multi-dimensional benchmark across DSA, System Design, Academics, and Projects.
                  </p>
                </div>
              </div>

              {/* Match Dimension Breakdown */}
              {job.matchBreakdown && (
                <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
                  <h3 className="text-xs font-mono uppercase font-bold text-zinc-300">
                    Match Dimension Breakdown
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Technical Skills Alignment", score: job.matchBreakdown.skills || 85 },
                      { label: "Target Role Relevance", score: job.matchBreakdown.roleRelevance || 90 },
                      { label: "Experience & Graduation Fit", score: job.matchBreakdown.experience || 95 },
                      { label: "Target Employer Benchmark", score: job.matchBreakdown.company || 80 },
                      { label: "Location & Work Mode", score: job.matchBreakdown.location || 100 },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-300">{item.label}</span>
                          <span className="font-mono font-bold text-zinc-200">{item.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Skills vs Gaps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matching Skills ({job.matchedSkills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.matchedSkills || []).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Identified Skill Gaps ({job.missingSkills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.missingSkills || []).map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLearnSkill(s)}
                        title={`Learn ${s} in Study Library`}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1"
                      >
                        <span>⚠️ {s}</span>
                        <BookOpen className="w-3 h-3 text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* "Why This Job?" Section */}
              {job.whyThisJob && job.whyThisJob.length > 0 && (
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-400 uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Why GetPlaced Recommends This Position?</span>
                  </div>
                  <ul className="space-y-2">
                    {job.whyThisJob.map((reason, rIdx) => (
                      <li key={rIdx} className="text-xs text-zinc-300 flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "preparation" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-800/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">
                    4-Week Placement Prep Schedule
                  </h4>
                  <p className="text-xs text-zinc-400">
                    A customized study plan targeting this job's exact requirements and your skill gaps.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrepareJob}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-950/50 transition-all shrink-0"
                >
                  Open Full Roadmap
                </button>
              </div>

              <div className="space-y-3">
                {(job.preparationPlan || []).map((week, wIdx) => (
                  <div
                    key={wIdx}
                    className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-violet-400">
                        {week.phase}
                      </span>
                      <span className="text-xs font-semibold text-zinc-300">
                        {week.focus}
                      </span>
                    </div>
                    <ul className="space-y-1.5 pt-1">
                      {week.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="text-xs text-zinc-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Integrated Action Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTailorResume}
                  className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-violet-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Tailor Resume ATS</div>
                      <div className="text-[10px] text-zinc-400">Align with job keywords</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handlePracticeDsa}
                  className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Practice Relevant DSA</div>
                      <div className="text-[10px] text-zinc-400">Algorithms & Coding Arena</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "company" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{employerName}</h3>
                    <p className="text-xs text-zinc-400">{job.companyDetails?.industry || "Enterprise Tech"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompanyIntel}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-violet-400" />
                    <span>Company Intelligence Dossier</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {job.companyDetails?.about || `${employerName} is a global leader in software technology, hiring top engineering talent.`}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Headquarters</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {job.companyDetails?.headquarters || "Global HQ"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Company Size</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {job.companyDetails?.size || "10,000+ Employees"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Open Roles Tracked</div>
                    <div className="text-xs font-bold text-violet-400 mt-0.5">
                      {job.companyDetails?.openPositionsCount || 10} Positions
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Transparency Note */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/70 text-xs text-zinc-400 space-y-1">
                <div className="font-semibold text-zinc-300 flex items-center gap-1.5 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                  Listing Source & Verification Transparency
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isDemo
                    ? "This opening is part of the GetPlaced verified demo dataset calibrated for engineering career benchmarking and preparation."
                    : `Verified directly from ${employerName} careers pipeline and last benchmarked on ${postedDate}.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onToggleSave(job)}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                job.isSaved
                  ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-950/60"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
              <span>{job.isSaved ? "Saved to List" : "Save Job"}</span>
            </button>

            <button
              type="button"
              onClick={handleTailorResume}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Tailor Resume</span>
            </button>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <a
              href={job.applicationUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-violet-950/60 transition-all flex items-center justify-center gap-2"
            >
              <span>Apply on Original Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
