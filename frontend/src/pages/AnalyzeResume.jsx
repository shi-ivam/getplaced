import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  UploadCloud,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  History,
  Edit3,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  ExternalLink,
  Bot,
  SlidersHorizontal,
} from "lucide-react";
import { PY_API_URL, NODE_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";
import ResumeActionCenter from "@/components/resume/ResumeActionCenter";
import ResumeReportOverview from "@/components/resume/ResumeReportOverview";
import ResumeVersionHistory from "@/components/resume/ResumeVersionHistory";
import ResumeBuilderEditor, { DEFAULT_BUILDER_DATA } from "@/components/resume/ResumeBuilderEditor";

const getUserStorageKey = (userId) => {
  return userId ? `getplaced_resume_versions_${userId}` : "getplaced_resume_versions_anon";
};

const DEMO_STRUCTURED_ACTIONS = [
  {
    id: "act-1",
    section: "experience",
    targetItemIndex: 0,
    bulletIndex: 0,
    impact: "high",
    currentText: "Worked on backend APIs and improved performance.",
    proposedText: "Engineered 8 RESTful microservices with Node.js & Redis, reducing P99 latency by 42% at 10k RPM peak.",
    reason: "Quantifies technical scope using the XYZ formula (Accomplished [X], measured by [Y], by doing [Z]).",
    pointsGain: 6,
    status: "pending",
  },
  {
    id: "act-2",
    section: "skills",
    targetItemIndex: 0,
    bulletIndex: null,
    impact: "high",
    currentText: "JavaScript, Python, HTML, CSS",
    proposedText: "Languages: TypeScript, JavaScript, Python, SQL • Frameworks: React, Node.js, Express, FastAPI • Cloud/DevOps: Docker, Redis, Git, CI/CD",
    reason: "Injects critical high-demand ATS keywords required for modern Software Engineer listings.",
    pointsGain: 5,
    status: "pending",
  },
  {
    id: "act-3",
    section: "experience",
    targetItemIndex: 0,
    bulletIndex: 1,
    impact: "medium",
    currentText: "Responsible for building the user interface using React.",
    proposedText: "Spearheaded modular frontend architecture using React 19 and Tailwind CSS, increasing user onboarding conversion by 28%.",
    reason: "Replaces passive duty description with active leadership verbs and measurable business impact.",
    pointsGain: 4,
    status: "pending",
  },
];

export default function AnalyzeResume() {
  const containerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const targetRoleFromUrl = searchParams.get("targetRole") || searchParams.get("target_role") || "";
  const companyFromUrl = searchParams.get("company") || "";
  const jdFromUrl = searchParams.get("jd") || searchParams.get("jobDescription") || "";

  const [activeTab, setActiveTab] = useState("actions"); // 'actions' | 'overview' | 'builder' | 'history'

  // Input state
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState(
    "Alex Rivera\nSoftware Engineer with 2+ years designing resilient web platforms and microservices.\n\nExperience:\n- Worked on backend APIs and improved performance.\n- Responsible for building the user interface using React.\n\nSkills: JavaScript, Python, HTML, CSS, Git, VS Code\n\nProjects:\n- Distributed Task Scheduler (Go, Redis)"
  );
  const [inputMode, setInputMode] = useState("pdf"); // 'pdf' | 'text'
  const [jobDescription, setJobDescription] = useState(jdFromUrl || "");
  const [targetRole, setTargetRole] = useState(targetRoleFromUrl || "Software Engineer");
  const [showJdInput, setShowJdInput] = useState(Boolean(jdFromUrl || companyFromUrl));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Evaluation & Actions State
  const [evaluation, setEvaluation] = useState(null);
  const [previousEvaluation, setPreviousEvaluation] = useState(null);
  const [actions, setActions] = useState([]);
  const [builderData, setBuilderData] = useState(DEFAULT_BUILDER_DATA);

  // Version History State
  const [versions, setVersions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isProfileLinked, setIsProfileLinked] = useState(false);

  const recordVersionSnapshot = (evalData, resumeTextVal, filename = "resume.pdf", activeUserId = null) => {
    if (!evalData || evalData.ats_score === undefined) return;
    const newVersion = {
      id: `ver-${Date.now()}`,
      timestamp: new Date().toISOString(),
      filename: filename,
      targetRole: targetRole || "Software Engineer",
      atsScore: evalData.ats_score,
      scoreTier: evalData.score_tier || "Tier 2",
      matchedKeywords: (evalData.matched_keywords || []).map((k) => (typeof k === "string" ? k : k.keyword || "")),
      missingKeywords: (evalData.missing_keywords || []).map((k) => (typeof k === "string" ? k : k.keyword || "")),
      summaryCritique: evalData.summary_critique || "",
      fullEvaluation: evalData,
      resumeText: resumeTextVal || rawText,
    };

    setVersions((prev) => {
      const updated = [newVersion, ...prev.filter((v) => v.id !== newVersion.id)].slice(0, 25);
      const targetUid = activeUserId || currentUserId;
      const userKey = getUserStorageKey(targetUid);
      try {
        localStorage.setItem(userKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  useEffect(() => {
    const initResumeIntelligence = async () => {
      let resolvedUserId = null;
      try {
        const rawUser = localStorage.getItem("getplaced_user");
        if (rawUser) {
          resolvedUserId = JSON.parse(rawUser)?._id;
        }
      } catch (e) {}

      try {
        const [profileRes, coachRes] = await Promise.allSettled([
          axios.get(`${NODE_API_URL}/api/users/profile`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true }),
        ]);

        const profileData = profileRes.status === "fulfilled" ? profileRes.value?.data : null;
        const coachData = coachRes.status === "fulfilled" ? coachRes.value?.data : null;

        if (profileData?._id) {
          resolvedUserId = profileData._id;
        }
        if (resolvedUserId) {
          setCurrentUserId(resolvedUserId);
        }

        // Load per-user versions from database profile, fallback to user-scoped local storage
        let userVersions = [];
        if (profileData?.resumeVersions && Array.isArray(profileData.resumeVersions) && profileData.resumeVersions.length > 0) {
          userVersions = profileData.resumeVersions;
        } else {
          try {
            const userKey = getUserStorageKey(resolvedUserId);
            const saved = localStorage.getItem(userKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                userVersions = parsed;
              }
            }
          } catch (e) {
            console.warn("Could not read user resume history:", e);
          }
        }
        setVersions(userVersions);

        const liveAnalysis =
          profileData?.resumeAnalysis ||
          coachData?.connectedProfiles?.resume?.analysis ||
          coachData?.extractedProfile?.resumeAnalysis;
        const liveText = profileData?.resumeText || coachData?.extractedProfile?.resumeText;
        const userTargetRole = profileData?.targetJobRole || coachData?.extractedProfile?.targetJobRole;

        if (userTargetRole) {
          setTargetRole(userTargetRole);
        }

        if (liveAnalysis && liveAnalysis.ats_score !== undefined) {
          setEvaluation(liveAnalysis);
          setActions(liveAnalysis.structured_actions || DEMO_STRUCTURED_ACTIONS);
          if (liveText) setRawText(liveText);
          setIsProfileLinked(true);
        } else {
          // Default initial benchmark evaluation
          const defaultEval = {
            ats_score: 74,
            score_tier: "Competitive (Tier 2)",
            category_scores: {
              impact_quantification: 62,
              skills_match: 78,
              action_verbs: 82,
              formatting_readability: 90,
            },
            matched_keywords: ["JavaScript", "Python", "React", "Git", "REST APIs"],
            missing_keywords: ["TypeScript", "Docker", "CI/CD", "Redis", "System Design"],
            bullet_improvements: [
              {
                original: "Worked on backend APIs and improved performance.",
                improved: "Engineered 8 RESTful microservices with Node.js & Redis, reducing P99 latency by 42% at 10k RPM peak.",
                reason: "Quantifies technical scope using XYZ format.",
              },
            ],
            structured_actions: DEMO_STRUCTURED_ACTIONS,
            summary_critique: "Your resume scores 74/100. Applying the recommended XYZ impact rewrites and injecting missing keywords will elevate your score into top ATS tiers.",
          };

          setEvaluation(defaultEval);
          setActions(defaultEval.structured_actions || DEMO_STRUCTURED_ACTIONS);
        }
      } catch (err) {
        console.warn("Could not sync profile resume:", err);
      }
    };

    initResumeIntelligence();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file && !rawText.trim()) {
      setError("Please provide a PDF resume or enter plaintext content to analyze.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let evalData = null;
      let extractedResumeText = rawText;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("job_description", jobDescription);
        formData.append("target_role", targetRole);

        const res = await axios.post(`${PY_API_URL}/api/resume/analyze-upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        evalData = res.data.evaluation;
        if (res.data.extracted_text) {
          extractedResumeText = res.data.extracted_text;
          setRawText(res.data.extracted_text);
        }
      } else {
        const res = await axios.post(`${PY_API_URL}/api/resume/analyze-text`, {
          resume_text: rawText,
          job_description: jobDescription,
          target_role: targetRole,
        });
        evalData = res.data.evaluation;
      }

      setPreviousEvaluation(evaluation);
      setEvaluation(evalData);
      const actionItems = evalData.structured_actions || DEMO_STRUCTURED_ACTIONS;
      setActions(actionItems);
      setActiveTab("actions");

      // Record snapshot to history
      recordVersionSnapshot(evalData, extractedResumeText, file ? file.name : "resume.pdf");

      // Save to history & backend profile
      try {
        await axios.post(
          `${NODE_API_URL}/api/coach/save-resume-analysis`,
          {
            resumeScore: evalData.ats_score,
            resumeText: extractedResumeText,
            resumeAnalysis: evalData,
            filename: file ? file.name : "resume.pdf",
          },
          { withCredentials: true }
        );
      } catch (saveErr) {
        console.warn("Could not persist analysis to user profile:", saveErr);
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Could not analyze resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationUpdated = (newEval, updatedResumeText) => {
    setPreviousEvaluation(evaluation);
    if (newEval) {
      setEvaluation(newEval);
      if (newEval.structured_actions) {
        setActions(newEval.structured_actions);
      }
      if (newEval.ats_score !== undefined) {
        recordVersionSnapshot(newEval, updatedResumeText || rawText, "action_optimized_resume.txt");
      }
    }
    if (updatedResumeText) {
      setRawText(updatedResumeText);
    }
  };

  const handleEvaluateATSFromBuilder = async (compiledText) => {
    if (!compiledText?.trim()) return;
    setRawText(compiledText);
    setInputMode("text");
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${PY_API_URL}/api/resume/analyze-text`, {
        resume_text: compiledText,
        job_description: jobDescription,
        target_role: targetRole,
      });
      const evalData = res.data.evaluation;
      setPreviousEvaluation(evaluation);
      setEvaluation(evalData);
      const actionItems = evalData.structured_actions || DEMO_STRUCTURED_ACTIONS;
      setActions(actionItems);
      setActiveTab("overview");

      recordVersionSnapshot(evalData, compiledText, "builder_resume.txt");

      try {
        await axios.post(
          `${NODE_API_URL}/api/coach/save-resume-analysis`,
          {
            resumeScore: evalData.ats_score,
            resumeText: compiledText,
            resumeAnalysis: evalData,
            filename: "builder_resume.txt",
          },
          { withCredentials: true }
        );
      } catch (saveErr) {
        console.warn("Could not persist builder analysis to profile:", saveErr);
      }
    } catch (err) {
      console.error("Builder ATS evaluation error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Could not evaluate resume ATS. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DEEC]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#6E44FF]" />
            <span>AI Resume ATS Optimizer</span>
            {isProfileLinked && (
              <GpBadge theme="mint" size="sm">
                Profile Linked
              </GpBadge>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6A80] mt-1">
            Audit your resume against applicant tracking systems, identify missing keywords, and apply 1-click XYZ impact rewrites.
          </p>
        </div>

        {evaluation && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2DEEC] shadow-sm">
              <span className="text-xs text-[#6F6A80]">Current ATS:</span>
              <span className="text-sm font-black text-[#17103D]">
                {evaluation.ats_score} / 100
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FFE8E5] border border-[#FFC5B7] text-[#C7382B] text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Guided 3-Step Upload & Configuration Workflow */}
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2DEEC]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#17103D]">
            Resume Analysis Setup
          </span>

          <div className="inline-flex items-center p-0.5 bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl text-[11px] font-semibold">
            <button
              onClick={() => setInputMode("pdf")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                inputMode === "pdf" ? "bg-white text-[#17103D] shadow-sm font-bold" : "text-[#6F6A80]"
              }`}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setInputMode("text")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                inputMode === "text" ? "bg-white text-[#17103D] shadow-sm font-bold" : "text-[#6F6A80]"
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: File / Text */}
          <div className="md:col-span-2 space-y-2">
            {inputMode === "pdf" ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E2DEEC] hover:border-[#6E44FF] rounded-2xl p-6 bg-[#F8F8F5]/50 hover:bg-[#F2F0FA]/40 transition-all cursor-pointer text-center group">
                <UploadCloud className="w-8 h-8 text-[#6F6A80] group-hover:text-[#6E44FF] transition-colors mb-2" />
                <span className="text-xs font-bold text-[#17103D]">
                  {file ? file.name : "Choose PDF resume or drag & drop"}
                </span>
                <span className="text-[11px] text-[#6F6A80] mt-0.5">
                  Standard 1-2 page PDF format supported
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your plaintext resume here..."
                rows={4}
                className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl p-3 text-xs text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
              />
            )}
          </div>

          {/* Step 2: Role & JD */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold text-[#6F6A80] mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. SDE, Frontend, Data Scientist"
                className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-1.5 text-xs text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowJdInput(!showJdInput)}
                className="text-[11px] text-[#6E44FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{showJdInput ? "- Hide Job Description" : "+ Add Job Description"}</span>
              </button>
              {showJdInput && (
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target job spec..."
                  rows={2}
                  className="w-full mt-1 bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl p-2 text-xs text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                />
              )}
            </div>

            {/* Step 3: Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD84D]" />
                  <span>Run ATS Audit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Workspace & Sub-Tabs */}
      {evaluation && (
        <div className="space-y-4">
          {/* Sub-Tab Navigation */}
          <div className="inline-flex items-center p-1 bg-white border border-[#E2DEEC] rounded-xl shadow-sm text-xs font-semibold">
            <button
              onClick={() => setActiveTab("actions")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "actions"
                  ? "bg-[#17103D] text-white shadow-sm"
                  : "text-[#6F6A80] hover:text-[#17103D]"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#FFD84D]" />
              <span>Action Center ({actions.filter((a) => a.status === "pending").length})</span>
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#17103D] text-white shadow-sm"
                  : "text-[#6F6A80] hover:text-[#17103D]"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>ATS Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "builder"
                  ? "bg-[#17103D] text-white shadow-sm"
                  : "text-[#6F6A80] hover:text-[#17103D]"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Interactive Editor</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#17103D] text-white shadow-sm"
                  : "text-[#6F6A80] hover:text-[#17103D]"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History</span>
            </button>
          </div>

          {/* Tab 1: Action Center */}
          {activeTab === "actions" && (
            <ResumeActionCenter
              actions={actions}
              onUpdateActions={setActions}
              rawResumeText={rawText}
              targetRole={targetRole}
              jobDescription={jobDescription}
              currentEvaluation={evaluation}
              onEvaluationUpdated={handleEvaluationUpdated}
              onRevertEvaluation={() => {
                if (previousEvaluation) {
                  setEvaluation(previousEvaluation);
                  if (previousEvaluation?.structured_actions) {
                    setActions(previousEvaluation.structured_actions);
                  }
                }
              }}
              previousEvaluation={previousEvaluation}
            />
          )}

          {/* Tab 2: Overview Report */}
          {activeTab === "overview" && (
            <ResumeReportOverview
              evaluation={evaluation}
              targetRole={targetRole}
              jobDescription={jobDescription}
              onNavigateToActionCenter={() => setActiveTab("actions")}
            />
          )}

          {/* Tab 3: Interactive Editor */}
          {activeTab === "builder" && (
            <ResumeBuilderEditor
              builderData={builderData}
              setBuilderData={setBuilderData}
              onEvaluateATS={handleEvaluateATSFromBuilder}
              targetRole={targetRole}
              jobDescription={jobDescription}
            />
          )}

          {/* Tab 4: Version History */}
          {activeTab === "history" && (
            <ResumeVersionHistory
              versions={versions}
              currentEvaluation={evaluation}
              onSelectVersion={(ver) => {
                const targetEval = ver?.fullEvaluation || ver;
                if (targetEval) {
                  setEvaluation(targetEval);
                  if (targetEval.structured_actions) setActions(targetEval.structured_actions);
                  setActiveTab("overview");
                }
              }}
              onRevertVersion={(ver) => {
                const targetEval = ver?.fullEvaluation || ver;
                if (targetEval) {
                  setEvaluation(targetEval);
                  if (targetEval.structured_actions) setActions(targetEval.structured_actions);
                  setActiveTab("overview");
                }
              }}
              onRestoreVersion={(ver) => {
                const targetEval = ver?.fullEvaluation || ver;
                if (targetEval) {
                  setEvaluation(targetEval);
                  if (targetEval.structured_actions) setActions(targetEval.structured_actions);
                  setActiveTab("overview");
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
