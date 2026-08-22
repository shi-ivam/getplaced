import React, { useState, useEffect } from "react";
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

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  const matchScore = job.matchScore != null ? job.matchScore : null;
  const readinessScore = job.readinessComparison?.readinessScore != null ? job.readinessComparison.readinessScore : null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLearnSkill = (skill) => {
    onClose();
    navigate(`/app/dsa?search=${encodeURIComponent(skill)}`);
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

  const handleCanIApply = () => {
    onClose();
    navigate(`/app/can-i-apply?company=${encodeURIComponent(employerName)}&role=${encodeURIComponent(job.title)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-[#11110F] border border-[#3A3831] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#FAF8F2] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-6 pb-4 border-b border-[#3A3831] bg-[#24231F] flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-[#11110F] border border-[#3A3831] flex items-center justify-center text-[#FAF8F2] font-bold text-xl overflow-hidden shrink-0 shadow-md">
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
                <span className="text-xs font-mono font-bold text-[#A8A59C] tracking-wider uppercase">
                  {employerName}
                </span>
                {isDemo ? (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#11110F] text-[#A8A59C] border border-[#3A3831] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#A8A59C]" />
                    Demo Listing
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#C7F36B]/10 text-[#C7F36B] border border-[#C7F36B]/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#C7F36B]" />
                    Verified Official
                  </span>
                )}
                {job.fitStatus && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      job.fitBadgeClass || "bg-[#11110F] text-[#FAF8F2] border-[#3A3831]"
                    }`}
                  >
                    {job.fitStatus}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#FAF8F2] tracking-tight leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#A8A59C] pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8C8980]" />
                  {isRemote ? "Remote / Distributed" : `${job.city || "Bengaluru"}, India`}
                </span>
                <span className="text-[#3A3831]">•</span>
                <span className="px-2 py-0.5 rounded bg-[#11110F] border border-[#3A3831] text-[#FAF8F2] text-[11px]">
                  {job.workMode || "Hybrid"}
                </span>
                <span className="text-[#3A3831]">•</span>
                <span className="px-2 py-0.5 rounded bg-[#11110F] border border-[#3A3831] text-[#FAF8F2] text-[11px]">
                  {job.employmentType || "Full-time"}
                </span>
                <span className="text-[#3A3831]">•</span>
                <span className="text-[#C7F36B] font-mono font-semibold">
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
              className="p-2.5 rounded-xl bg-[#11110F] hover:bg-[#1A1916] text-[#A8A59C] hover:text-[#FAF8F2] border border-[#3A3831] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#C7F36B]" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(job)}
              title={job.isSaved ? "Saved to your list" : "Save job"}
              className={`p-2.5 rounded-xl border transition-all ${
                job.isSaved
                  ? "bg-[#C7F36B] text-[#11110F] border-[#C7F36B] shadow-md shadow-[#C7F36B]/20 font-bold"
                  : "bg-[#11110F] hover:bg-[#1A1916] text-[#A8A59C] hover:text-[#FAF8F2] border-[#3A3831]"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#11110F] hover:bg-[#1A1916] text-[#A8A59C] hover:text-[#FAF8F2] border border-[#3A3831] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#3A3831] bg-[#24231F]/60 flex items-center gap-1 overflow-x-auto">
          {[
            { id: "overview", label: "Job Details & Specs" },
            { id: "match", label: `Fit Analysis (${matchScore != null ? `${matchScore}%` : "Unassessed"})` },
            { id: "preparation", label: "Preparation Roadmap" },
            { id: "company", label: "Company Intel" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-semibold tracking-wide border-b-2 transition-all shrink-0 ${
                activeTab === tab.id
                  ? "text-[#C7F36B] border-[#C7F36B] font-bold bg-[#C7F36B]/5"
                  : "text-[#A8A59C] border-transparent hover:text-[#FAF8F2]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#11110F]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Highlight Match Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#24231F] via-[#1A1916] to-[#24231F] border border-[#3A3831] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C7F36B]" />
                    <span className="text-xs font-mono uppercase font-bold text-[#C7F36B]">
                      GetPlaced Match Score: {matchScore != null ? `${matchScore}%` : "Unassessed"}
                    </span>
                  </div>
                  <p className="text-xs text-[#FAF8F2]">
                    {job.readinessComparison?.summaryNote ||
                      `Calibrated fit for your target role and skill profile.`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCanIApply}
                    className="px-3.5 py-1.5 rounded-xl bg-[#11110F] hover:bg-[#1A1916] border border-[#3A3831] hover:border-[#C7F36B]/40 text-[#FAF8F2] text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C7F36B]" />
                    <span>Can I Apply?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("match")}
                    className="px-3.5 py-1.5 rounded-xl bg-[#C7F36B] hover:bg-[#bbf055] text-[#11110F] text-xs font-bold transition-all flex items-center gap-1 shrink-0 shadow-md shadow-[#C7F36B]/20"
                  >
                    <span>View Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#24231F] border border-[#3A3831]">
                  <div className="text-[10px] font-mono text-[#8C8980] uppercase font-semibold">
                    Experience
                  </div>
                  <div className="text-xs font-bold text-[#FAF8F2] mt-1">
                    {job.experience || "0-2 years"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#24231F] border border-[#3A3831]">
                  <div className="text-[10px] font-mono text-[#8C8980] uppercase font-semibold">
                    Education Cutoff
                  </div>
                  <div className="text-xs font-bold text-[#FAF8F2] mt-1">
                    CGPA {job.cgpaCutoff || "7.0"}+ / B.Tech
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#24231F] border border-[#3A3831]">
                  <div className="text-[10px] font-mono text-[#8C8980] uppercase font-semibold">
                    Work Location
                  </div>
                  <div className="text-xs font-bold text-[#FAF8F2] mt-1 truncate">
                    {isRemote ? "Remote" : `${job.city || "Bengaluru"}`}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#24231F] border border-[#3A3831]">
                  <div className="text-[10px] font-mono text-[#8C8980] uppercase font-semibold">
                    Posted Date
                  </div>
                  <div className="text-xs font-bold text-[#FAF8F2] mt-1">
                    {postedDate}
                  </div>
                </div>
              </div>

              {/* About Role */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#A8A59C]">
                  About The Role
                </h3>
                <p className="text-sm text-[#FAF8F2] leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Key Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#A8A59C]">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="text-xs text-[#FAF8F2] flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B] mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements & Qualifications */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#A8A59C]">
                    Candidate Requirements
                  </h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, reqIdx) => (
                      <li key={reqIdx} className="text-xs text-[#FAF8F2] flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C7F36B] mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills & Tech Stack */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#A8A59C]">
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
                            ? "bg-[#C7F36B]/10 text-[#C7F36B] border-[#C7F36B]/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {isMatched ? (
                          <CheckCircle2 className="w-3 h-3 text-[#C7F36B]" />
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
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#A8A59C]">
                    Preferred / Bonus Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((ps, psIdx) => (
                      <span
                        key={psIdx}
                        className="text-xs font-mono px-2.5 py-1 rounded-xl bg-[#24231F] border border-[#3A3831] text-[#A8A59C]"
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
                <div className="p-5 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#A8A59C] font-bold">
                      Job Match Score
                    </span>
                    <span className="text-2xl font-black font-mono text-[#C7F36B]">
                      {matchScore != null ? `${matchScore}%` : "Unassessed"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#11110F] rounded-full overflow-hidden border border-[#3A3831]">
                    <div
                      className="h-full bg-[#C7F36B] rounded-full transition-all duration-500"
                      style={{ width: `${matchScore != null ? matchScore : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#A8A59C] pt-1">
                    Evaluates how your current skills, target role, education, and experience align with this position.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#A8A59C] font-bold">
                      Your Interview Readiness
                    </span>
                    <span className="text-2xl font-black font-mono text-sky-400">
                      {readinessScore != null ? `${readinessScore}%` : "Unassessed"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#11110F] rounded-full overflow-hidden border border-[#3A3831]">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all duration-500"
                      style={{ width: `${readinessScore != null ? readinessScore : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#A8A59C] pt-1">
                    Your overall multi-dimensional benchmark across DSA, System Design, Academics, and Projects.
                  </p>
                </div>
              </div>

              {/* Match Dimension Breakdown */}
              {job.matchBreakdown && (
                <div className="p-5 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-4">
                  <h3 className="text-xs font-mono uppercase font-bold text-[#FAF8F2]">
                    Match Dimension Breakdown
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Technical Skills Alignment", score: job.matchBreakdown.skills },
                      { label: "Target Role Relevance", score: job.matchBreakdown.roleRelevance },
                      { label: "Experience & Graduation Fit", score: job.matchBreakdown.experience },
                      { label: "Target Employer Benchmark", score: job.matchBreakdown.company },
                      { label: "Location & Work Mode", score: job.matchBreakdown.location },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#FAF8F2]">{item.label}</span>
                          <span className="font-mono font-bold text-[#C7F36B]">
                            {item.score != null ? `${item.score}%` : "Unassessed"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#11110F] rounded-full overflow-hidden border border-[#3A3831]/60">
                          <div
                            className="h-full bg-[#C7F36B] rounded-full"
                            style={{ width: `${item.score != null ? item.score : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Skills vs Gaps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#C7F36B] uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matching Skills ({job.matchedSkills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.matchedSkills || []).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#C7F36B]/10 text-[#C7F36B] border border-[#C7F36B]/30"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-3">
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
                        <span>{s}</span>
                        <BookOpen className="w-3 h-3 text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* "Why This Job?" Section */}
              {job.whyThisJob && job.whyThisJob.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C7F36B] uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Why GetPlaced Recommends This Position?</span>
                  </div>
                  <ul className="space-y-2">
                    {job.whyThisJob.map((reason, rIdx) => (
                      <li key={rIdx} className="text-xs text-[#FAF8F2] flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C7F36B] mt-0.5 shrink-0" />
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
              <div className="p-4 rounded-2xl bg-[#24231F] border border-[#3A3831] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#FAF8F2]">
                    4-Week Placement Prep Schedule
                  </h4>
                  <p className="text-xs text-[#A8A59C]">
                    A customized study plan targeting this job's exact requirements and your skill gaps.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrepareJob}
                  className="px-4 py-2 rounded-xl bg-[#C7F36B] hover:bg-[#bbf055] text-[#11110F] text-xs font-bold shadow-md shadow-[#C7F36B]/20 transition-all shrink-0"
                >
                  Open Full Roadmap
                </button>
              </div>

              <div className="space-y-3">
                {(job.preparationPlan || []).map((week, wIdx) => (
                  <div
                    key={wIdx}
                    className="p-4 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#C7F36B]">
                        {week.phase}
                      </span>
                      <span className="text-xs font-semibold text-[#FAF8F2]">
                        {week.focus}
                      </span>
                    </div>
                    <ul className="space-y-1.5 pt-1">
                      {week.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="text-xs text-[#A8A59C] flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8C8980] mt-1.5 shrink-0" />
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
                  className="p-3.5 rounded-xl bg-[#24231F] hover:bg-[#2e2d27] border border-[#3A3831] hover:border-[#C7F36B]/40 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#C7F36B]" />
                    <div>
                      <div className="text-xs font-bold text-[#FAF8F2]">Tailor Resume ATS</div>
                      <div className="text-[10px] text-[#A8A59C]">Align with job keywords</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C8980] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handlePracticeDsa}
                  className="p-3.5 rounded-xl bg-[#24231F] hover:bg-[#2e2d27] border border-[#3A3831] hover:border-[#C7F36B]/40 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-[#C7F36B]" />
                    <div>
                      <div className="text-xs font-bold text-[#FAF8F2]">Practice Relevant DSA</div>
                      <div className="text-[10px] text-[#A8A59C]">Algorithms & Coding Arena</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C8980] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "company" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#24231F] border border-[#3A3831] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#FAF8F2]">{employerName}</h3>
                    <p className="text-xs text-[#A8A59C]">{job.companyDetails?.industry || "Enterprise Tech"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompanyIntel}
                    className="px-3.5 py-1.5 rounded-xl bg-[#11110F] hover:bg-[#1A1916] text-[#FAF8F2] border border-[#3A3831] text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#C7F36B]" />
                    <span>Company Intelligence Dossier</span>
                  </button>
                </div>

                <p className="text-xs text-[#FAF8F2] leading-relaxed">
                  {job.companyDetails?.about || `${employerName} is a global leader in software technology, hiring top engineering talent.`}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#11110F] border border-[#3A3831]">
                    <div className="text-[10px] font-mono text-[#8C8980] uppercase">Headquarters</div>
                    <div className="text-xs font-bold text-[#FAF8F2] mt-0.5">
                      {job.companyDetails?.headquarters || "Global HQ"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11110F] border border-[#3A3831]">
                    <div className="text-[10px] font-mono text-[#8C8980] uppercase">Company Size</div>
                    <div className="text-xs font-bold text-[#FAF8F2] mt-0.5">
                      {job.companyDetails?.size || "10,000+ Employees"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11110F] border border-[#3A3831]">
                    <div className="text-[10px] font-mono text-[#8C8980] uppercase">Open Roles Tracked</div>
                    <div className="text-xs font-bold text-[#C7F36B] mt-0.5">
                      {job.companyDetails?.openPositionsCount || 10} Positions
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Transparency Note */}
              <div className="p-4 rounded-2xl bg-[#24231F]/50 border border-[#3A3831] text-xs text-[#A8A59C] space-y-1">
                <div className="font-semibold text-[#FAF8F2] flex items-center gap-1.5 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C7F36B]" />
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
        <div className="p-4 sm:p-6 border-t border-[#3A3831] bg-[#24231F] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onToggleSave(job)}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                job.isSaved
                  ? "bg-[#C7F36B] text-[#11110F] border-[#C7F36B] shadow-md shadow-[#C7F36B]/20 font-bold"
                  : "bg-[#11110F] hover:bg-[#1A1916] text-[#FAF8F2] border-[#3A3831]"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
              <span>{job.isSaved ? "Saved to List" : "Save Job"}</span>
            </button>

            <button
              type="button"
              onClick={handleTailorResume}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#11110F] hover:bg-[#1A1916] text-[#FAF8F2] border border-[#3A3831] text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#C7F36B]" />
              <span>Tailor Resume</span>
            </button>

            <button
              type="button"
              onClick={handleCanIApply}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#11110F] hover:bg-[#1A1916] text-[#FAF8F2] border border-[#3A3831] hover:border-[#C7F36B]/40 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#C7F36B]" />
              <span>Can I Apply?</span>
            </button>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <a
              href={job.applicationUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C7F36B] hover:bg-[#bbf055] text-[#11110F] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C7F36B]/20 transition-all flex items-center justify-center gap-2"
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
