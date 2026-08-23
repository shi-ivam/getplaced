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
import GpBadge from "@/components/gp/GpBadge";
import GpButton, { GpArrow } from "@/components/gp/GpButton";

import { formatJobSalary } from "./JobCard";

export default function JobDetailModal({
  job,
  onClose,
  onToggleSave,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "match" | "preparation" | "company"
  const [hasImgError, setHasImgError] = useState(false);

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

  useEffect(() => {
    setHasImgError(false);
  }, [job?.companyLogo, job?.employer_logo]);

  if (!job) return null;

  const employerName = job.company || job.employer_name || "Enterprise Technology";
  const title = job.title || job.job_title || "Software Engineer";
  const companyLogo = job.companyLogo || job.employer_logo || "";
  const initial = (employerName.charAt(0) || "C").toUpperCase();
  const city = job.city || job.job_city || job.location || "Bengaluru";
  const isRemote =
    job.workMode === "Remote" ||
    job.job_is_remote === true ||
    (city || "").toLowerCase().includes("remote");
  const workMode = isRemote ? "Remote" : (job.workMode || "Hybrid");
  const employmentType = job.employmentType || job.job_employment_type || "Full-time";
  const isDemo = job.sourceType === "DEMO";

  const applyUrl =
    job.applicationUrl ||
    job.applyUrl ||
    job.job_apply_link ||
    job.job_google_link ||
    "#";

  const rawSkills = job.skills || job.job_required_skills || [];
  const skillsList = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string"
    ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawPrefSkills = job.preferredSkills || [];
  const preferredSkillsList = Array.isArray(rawPrefSkills)
    ? rawPrefSkills
    : typeof rawPrefSkills === "string"
    ? rawPrefSkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const responsibilities =
    job.responsibilities || job.job_highlights?.Responsibilities || [];
  const requirements =
    job.requirements || job.job_highlights?.Qualifications || [];

  const salary = formatJobSalary(job);

  const postedDate = job.postedDate || job.job_posted_at_datetime_utc
    ? new Date(job.postedDate || job.job_posted_at_datetime_utc).toLocaleDateString("en-US", {
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
    navigate(`/app/resume?targetRole=${encodeURIComponent(title)}&company=${encodeURIComponent(employerName)}`);
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
    navigate(`/app/can-i-apply?company=${encodeURIComponent(employerName)}&role=${encodeURIComponent(title)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0D0431]/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white border-2 border-[#0D0431] rounded-3xl shadow-[8px_8px_0_0_#0D0431] flex flex-col overflow-hidden text-[#0D0431] font-sans animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon / Titlebar */}
        <div className="p-6 pb-4 border-b-2 border-[#0D0431] bg-[#FEF9CF] flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-center justify-center font-heading font-black text-xl text-[#0D0431] overflow-hidden shrink-0">
              {!hasImgError && companyLogo ? (
                <img
                  src={companyLogo}
                  alt={employerName}
                  className="w-full h-full object-contain p-2 bg-white"
                  onError={() => setHasImgError(true)}
                />
              ) : (
                <span className="font-heading font-black text-2xl text-[#0D0431]">{initial}</span>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0D0431]/80 tracking-wider uppercase">
                  {employerName}
                </span>
                {isDemo ? (
                  <GpBadge theme="light-purple" size="sm">
                    Demo Listing
                  </GpBadge>
                ) : (
                  <GpBadge theme="mint" size="sm">
                    <ShieldCheck className="w-3 h-3 mr-0.5" />
                    Verified Official
                  </GpBadge>
                )}
                {job.fitStatus && (
                  <GpBadge theme="yellow" size="sm">
                    {job.fitStatus}
                  </GpBadge>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-heading font-black text-[#0D0431] tracking-tight leading-tight">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#0D0431]/70 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0D0431]" />
                  {isRemote ? "Remote / Distributed" : `${city}, India`}
                </span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#0D0431] text-[11px] font-bold">
                  {workMode}
                </span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#0D0431] text-[11px] font-bold">
                  {employmentType}
                </span>
                <span>•</span>
                <span className="font-heading font-black text-xs text-[#0D0431] px-2.5 py-0.5 rounded-lg bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  {salary}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              title="Share job link"
              className="p-2.5 rounded-xl bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#896EE2]" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(job)}
              title={job.isSaved ? "Saved to your list" : "Save job"}
              className={`p-2.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer ${
                job.isSaved
                  ? "bg-[#FEDF6A] text-[#0D0431]"
                  : "bg-white hover:bg-[#FEF9CF] text-[#0D0431]"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white hover:bg-[#F85B52] hover:text-white text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b-2 border-[#0D0431] bg-white flex items-center gap-2 overflow-x-auto pt-2">
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
              className={`px-4 py-2.5 text-xs font-bold tracking-wide rounded-t-xl transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#FEDF6A] text-[#0D0431] border-2 border-b-0 border-[#0D0431] shadow-none"
                  : "text-[#0D0431]/70 hover:text-[#0D0431] hover:bg-[#FEF9CF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Highlight Match Bar */}
              <div className="p-4 rounded-2xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0D0431]" />
                    <span className="text-xs font-heading font-black text-[#0D0431] uppercase">
                      GetPlaced Match Score: {matchScore != null ? `${matchScore}%` : "Unassessed"}
                    </span>
                  </div>
                  <p className="text-xs text-[#0D0431]/80 font-medium">
                    {job.readinessComparison?.summaryNote ||
                      `Calibrated fit for your target role and skill profile.`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCanIApply}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FEF9CF] border-2 border-[#0D0431] text-[#0D0431] text-xs font-bold shadow-[2px_2px_0_0_#0D0431] transition-all flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0D0431]" />
                    <span>Can I Apply?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("match")}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] text-xs font-bold transition-all flex items-center gap-1 shrink-0 shadow-[2px_2px_0_0_#0D0431] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <span>View Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                  <div className="text-[10px] font-heading font-bold text-[#0D0431]/70 uppercase">
                    Experience
                  </div>
                  <div className="text-xs font-bold text-[#0D0431] mt-1">
                    {job.experience || "0-2 years"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                  <div className="text-[10px] font-heading font-bold text-[#0D0431]/70 uppercase">
                    Education Cutoff
                  </div>
                  <div className="text-xs font-bold text-[#0D0431] mt-1">
                    CGPA {job.cgpaCutoff || "7.0"}+ / B.Tech
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                  <div className="text-[10px] font-heading font-bold text-[#0D0431]/70 uppercase">
                    Work Location
                  </div>
                  <div className="text-xs font-bold text-[#0D0431] mt-1 truncate">
                    {isRemote ? "Remote" : `${city}`}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                  <div className="text-[10px] font-heading font-bold text-[#0D0431]/70 uppercase">
                    Posted Date
                  </div>
                  <div className="text-xs font-bold text-[#0D0431] mt-1">
                    {postedDate}
                  </div>
                </div>
              </div>

              {/* About Role */}
              <div className="space-y-2">
                <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                  About The Role
                </h3>
                <p className="text-sm text-[#0D0431]/90 leading-relaxed whitespace-pre-line font-medium">
                  {job.description || "Exciting opportunity to build scalable systems with modern technologies."}
                </p>
              </div>

              {/* Key Responsibilities */}
              {responsibilities && responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="text-xs text-[#0D0431] flex items-start gap-2.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#896EE2] border border-[#0D0431] mt-1 shrink-0" />
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements & Qualifications */}
              {requirements && requirements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                    Candidate Requirements
                  </h3>
                  <ul className="space-y-2">
                    {requirements.map((req, reqIdx) => (
                      <li key={reqIdx} className="text-xs text-[#0D0431] flex items-start gap-2.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D0431] mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills & Tech Stack */}
              {skillsList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                    Required Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill, sIdx) => {
                      const isMatched = job.matchedSkills?.includes(skill);
                      return (
                        <span
                          key={sIdx}
                          className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center gap-1.5 ${
                            isMatched
                              ? "bg-[#E4CDFB] text-[#0D0431]"
                              : "bg-[#FFC5B7] text-[#0D0431]"
                          }`}
                        >
                          {isMatched ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0D0431]" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#0D0431]" />
                          )}
                          <span>{skill}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preferred Skills */}
              {preferredSkillsList.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                    Preferred / Bonus Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preferredSkillsList.map((ps, psIdx) => (
                      <span
                        key={psIdx}
                        className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431]"
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
                <div className="p-5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold uppercase text-[#0D0431]">
                      Job Match Score
                    </span>
                    <span className="text-2xl font-heading font-black text-[#0D0431]">
                      {matchScore != null ? `${matchScore}%` : "Unassessed"}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden border-2 border-[#0D0431]">
                    <div
                      className="h-full bg-[#896EE2] transition-all duration-500"
                      style={{ width: `${matchScore != null ? matchScore : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#0D0431]/70 font-medium pt-1">
                    Evaluates how your current skills, target role, education, and experience align with this position.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#CDE1FF] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold uppercase text-[#0D0431]">
                      Your Interview Readiness
                    </span>
                    <span className="text-2xl font-heading font-black text-[#0D0431]">
                      {readinessScore != null ? `${readinessScore}%` : "Unassessed"}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden border-2 border-[#0D0431]">
                    <div
                      className="h-full bg-[#63A0F8] transition-all duration-500"
                      style={{ width: `${readinessScore != null ? readinessScore : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#0D0431]/70 font-medium pt-1">
                    Your overall multi-dimensional benchmark across DSA, System Design, Academics, and Projects.
                  </p>
                </div>
              </div>

              {/* Match Dimension Breakdown */}
              {job.matchBreakdown && (
                <div className="p-5 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-4">
                  <h3 className="text-xs font-heading font-black uppercase text-[#0D0431]">
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
                          <span className="text-[#0D0431] font-semibold">{item.label}</span>
                          <span className="font-heading font-black text-[#0D0431]">
                            {item.score != null ? `${item.score}%` : "Unassessed"}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#FEF9CF] rounded-full overflow-hidden border-2 border-[#0D0431]">
                          <div
                            className="h-full bg-[#896EE2]"
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
                <div className="p-4 rounded-2xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-heading font-black text-[#0D0431] uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matching Skills ({job.matchedSkills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.matchedSkills || []).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-[#0D0431]" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFC5B7] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-heading font-black text-[#0D0431] uppercase">
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
                        className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <span>{s}</span>
                        <BookOpen className="w-3 h-3 text-[#0D0431]" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* "Why This Job?" Section */}
              {job.whyThisJob && job.whyThisJob.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-heading font-black text-[#0D0431] uppercase">
                    <Sparkles className="w-4 h-4 text-[#896EE2]" />
                    <span>Why GetPlaced Recommends This Position?</span>
                  </div>
                  <ul className="space-y-2">
                    {job.whyThisJob.map((reason, rIdx) => (
                      <li key={rIdx} className="text-xs text-[#0D0431] font-medium flex items-start gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D0431] mt-0.5 shrink-0" />
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
              <div className="p-5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-heading font-black text-[#0D0431]">
                    4-Week Placement Prep Schedule
                  </h4>
                  <p className="text-xs text-[#0D0431]/80 font-medium">
                    A customized study plan targeting this job's exact requirements and your skill gaps.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrepareJob}
                  className="px-4 py-2 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] text-xs font-bold shadow-[2px_2px_0_0_#0D0431] transition-all shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  Open Full Roadmap
                </button>
              </div>

              <div className="space-y-3">
                {(job.preparationPlan || []).map((week, wIdx) => (
                  <div
                    key={wIdx}
                    className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#896EE2]">
                        {week.phase}
                      </span>
                      <span className="text-xs font-heading font-black text-[#0D0431]">
                        {week.focus}
                      </span>
                    </div>
                    <ul className="space-y-1.5 pt-1">
                      {week.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="text-xs text-[#0D0431]/80 font-medium flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0D0431] mt-1.5 shrink-0" />
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
                  className="p-4 rounded-2xl bg-[#E4CDFB] hover:bg-[#d6baf5] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-left transition-all group flex items-center justify-between cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#0D0431]" />
                    <div>
                      <div className="text-xs font-heading font-black text-[#0D0431]">Tailor Resume ATS</div>
                      <div className="text-[10px] text-[#0D0431]/70 font-semibold">Align with job keywords</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handlePracticeDsa}
                  className="p-4 rounded-2xl bg-[#D4FDF7] hover:bg-[#c2fbf3] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-left transition-all group flex items-center justify-between cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-[#0D0431]" />
                    <div>
                      <div className="text-xs font-heading font-black text-[#0D0431]">Practice Relevant DSA</div>
                      <div className="text-[10px] text-[#0D0431]/70 font-semibold">Algorithms & Coding Arena</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "company" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#CDE1FF] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-heading font-black text-[#0D0431]">{employerName}</h3>
                    <p className="text-xs font-bold text-[#0D0431]/70">{job.companyDetails?.industry || "Enterprise Tech"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompanyIntel}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] text-xs font-bold shadow-[2px_2px_0_0_#0D0431] transition-all flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#0D0431]" />
                    <span>Company Dossier</span>
                  </button>
                </div>

                <p className="text-xs text-[#0D0431]/90 font-medium leading-relaxed">
                  {job.companyDetails?.about || `${employerName} is a global leader in software technology, hiring top engineering talent.`}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <div className="text-[10px] font-heading font-bold text-[#0D0431]/70 uppercase">Headquarters</div>
                    <div className="text-xs font-bold text-[#0D0431] mt-0.5">
                      {job.companyDetails?.headquarters || "Global HQ"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <div className="text-[10px] font-heading font-bold text-[#0D0431]/70 uppercase">Company Size</div>
                    <div className="text-xs font-bold text-[#0D0431] mt-0.5">
                      {job.companyDetails?.size || "10,000+ Employees"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <div className="text-[10px] font-heading font-bold text-[#0D0431]/70 uppercase">Open Roles Tracked</div>
                    <div className="text-xs font-heading font-black text-[#0D0431] mt-0.5">
                      {job.companyDetails?.openPositionsCount || 10} Positions
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Transparency Note */}
              <div className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-xs text-[#0D0431] space-y-1">
                <div className="font-heading font-bold text-[#0D0431] flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0D0431]" />
                  Listing Source & Verification Transparency
                </div>
                <p className="text-[11px] font-medium text-[#0D0431]/80 leading-relaxed">
                  {isDemo
                    ? "This opening is part of the GetPlaced verified demo dataset calibrated for engineering career benchmarking and preparation."
                    : `Verified directly from ${employerName} careers pipeline and last benchmarked on ${postedDate}.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-6 border-t-2 border-[#0D0431] bg-[#FEF9CF] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onToggleSave(job)}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border-2 border-[#0D0431] text-xs font-bold transition-all shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                job.isSaved
                  ? "bg-[#FEDF6A] text-[#0D0431]"
                  : "bg-white hover:bg-[#FEF9CF] text-[#0D0431]"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? "fill-current" : ""}`} />
              <span>{job.isSaved ? "Saved to List" : "Save Job"}</span>
            </button>

            <button
              type="button"
              onClick={handleTailorResume}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] text-xs font-bold transition-all shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <FileText className="w-4 h-4 text-[#0D0431]" />
              <span>Tailor Resume</span>
            </button>

            <button
              type="button"
              onClick={handleCanIApply}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] text-xs font-bold transition-all shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#0D0431]" />
              <span>Can I Apply?</span>
            </button>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <a
              href={applyUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] text-xs font-heading font-black uppercase tracking-wider shadow-[4px_4px_0_0_#0D0431] transition-all flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#0D0431]"
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

