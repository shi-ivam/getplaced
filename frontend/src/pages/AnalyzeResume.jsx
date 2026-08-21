import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Download,
  History,
  Edit3,
  Layers,
  Search,
  Plus,
  Trash2,
  TrendingUp,
  RefreshCw,
  Award,
  Zap,
  Briefcase,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { PY_API_URL } from "@/config/api";

const STORAGE_KEY = "getplaced_resume_versions";

const INITIAL_BUILDER_DATA = {
  personalInfo: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexrivera-dev",
    github: "github.com/alexrivera"
  },
  summary: "Results-driven Software Engineer with 2+ years of experience engineering scalable web applications and distributed backend microservices. Proven track record in optimizing API latency and driving cloud deployments.",
  experience: [
    {
      id: "exp-1",
      role: "Software Engineering Intern",
      company: "Acme Cloud Technologies",
      location: "San Francisco, CA",
      startDate: "Jun 2024",
      endDate: "Present",
      bullets: [
        "Architected 12+ RESTful microservices using Node.js & Redis, reducing P99 API response latency by 42% under peak 10k RPM load.",
        "Engineered responsive frontend dashboards using React and Tailwind CSS, increasing candidate onboarding completion by 28%."
      ]
    },
    {
      id: "exp-2",
      role: "Full Stack Developer",
      company: "Campus Tech Labs",
      location: "Boston, MA",
      startDate: "Jan 2023",
      endDate: "May 2024",
      bullets: [
        "Implemented automated CI/CD deployment pipelines using Docker and GitHub Actions, cutting staging deployment cycle time by 50%.",
        "Designed MongoDB indexing strategies and aggregation pipelines to process 500,000+ daily telemetry records."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Distributed Task Scheduler",
      techStack: "Go, Redis, Docker, gRPC",
      bullets: [
        "Engineered high-throughput job queue supporting 25,000 concurrent tasks with automated exponential backoff retries.",
        "Implemented Redis Raft distributed leader election protocol ensuring zero single-point-of-failure."
      ]
    },
    {
      id: "proj-2",
      name: "AI Placement Analytics Engine",
      techStack: "React, Python, FastAPI, Tailwind CSS",
      bullets: [
        "Developed full-stack interview intelligence platform analyzing candidate readiness across 7 core dimensions.",
        "Integrated OCR and semantic keyword extraction achieving 96% resume parsing accuracy."
      ]
    }
  ],
  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "Go", "Java", "SQL"],
    frameworks: ["React", "Node.js", "Express", "FastAPI", "Next.js", "Tailwind CSS"],
    toolsDatabases: ["PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "Git", "AWS"]
  },
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      institution: "Northeastern University",
      gradYear: "2025",
      gpa: "3.85 / 4.0"
    }
  ]
};

export default function AnalyzeResume() {
  const [activeTab, setActiveTab] = useState("analyzer"); // 'analyzer' | 'history' | 'builder'
  
  // Analyzer state
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [keywordFilter, setKeywordFilter] = useState("all");
  
  // Evaluation Result State
  const [evaluation, setEvaluation] = useState(null);

  // Version History State
  const [versions, setVersions] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareVersionA, setCompareVersionA] = useState(null);
  const [compareVersionB, setCompareVersionB] = useState(null);

  // Builder State
  const [builderData, setBuilderData] = useState(INITIAL_BUILDER_DATA);
  const [improvingBulletIndex, setImprovingBulletIndex] = useState(null);
  const [bulletImprovementModal, setBulletImprovementModal] = useState(null);
  const [isImprovingSection, setIsImprovingSection] = useState(false);

  // Load versions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setVersions(JSON.parse(saved));
      } else {
        // Seed an initial demo version for instant value
        const demoVersion = {
          id: "ver-demo-1",
          name: "V1 - Initial Draft Resume",
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          targetRole: "Full Stack Developer",
          targetCompany: "General Tech",
          atsScore: 68,
          tier: "Competitive",
          categoryScores: {
            formatting_structure: 75,
            keyword_relevance: 62,
            impact_metrics: 55,
            skills_alignment: 78,
            experience_relevance: 70
          },
          matchedCount: 8,
          missingCount: 6,
          summaryCritique: "Good technical foundation with standard project mentions. Lacks quantifiable metric impact."
        };
        setVersions([demoVersion]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([demoVersion]));
      }
    } catch (e) {
      console.error("Failed to load versions from localStorage:", e);
    }
  }, []);

  const saveEvaluationToHistory = (evalData, customName = null) => {
    try {
      const newVersion = {
        id: `ver-${Date.now()}`,
        name: customName || `Version ${versions.length + 1} (${targetRole || "Tech Resume"})`,
        timestamp: new Date().toISOString(),
        targetRole: targetRole || "Software Engineer",
        targetCompany: jobDescription ? "Target JD" : "General Tech",
        atsScore: evalData.ats_score || 75,
        tier: evalData.score_tier || "Strong",
        categoryScores: evalData.category_scores || {},
        matchedCount: evalData.matched_keywords?.length || 0,
        missingCount: evalData.missing_keywords?.length || 0,
        summaryCritique: evalData.summary_critique || "",
        fullEvaluation: evalData
      };
      const updated = [newVersion, ...versions];
      setVersions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save version to history:", e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file && !rawText.trim()) {
      setError("Please upload a PDF resume or paste resume text to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setEvaluation(null);

    try {
      let evalData = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("job_description", jobDescription);
        formData.append("target_role", targetRole);

        const res = await axios.post(`${PY_API_URL}/api/resume/analyze-upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        evalData = res.data.evaluation;
      } else {
        const res = await axios.post(`${PY_API_URL}/api/resume/analyze-text`, {
          resume_text: rawText,
          job_description: jobDescription,
          target_role: targetRole
        });
        evalData = res.data.evaluation;
      }

      setEvaluation(evalData);
      saveEvaluationToHistory(evalData, file ? `${file.name.replace(".pdf", "")} (Analyzed)` : null);
    } catch (err) {
      console.error("Resume analysis error:", err);
      // Fallback direct legacy request if modern route has network error
      try {
        const legacyRes = await axios.post(`${PY_API_URL}/analyze-resume/`, {
          file: file
        });
        if (legacyRes.data?.data) {
          setEvaluation(legacyRes.data.data);
          saveEvaluationToHistory(legacyRes.data.data);
        } else {
          setError("Analysis completed with basic summary. Please check your network or API keys.");
        }
      } catch (fallbackErr) {
        setError(err.response?.data?.detail || "Failed to analyze resume. Please verify API connections.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBullet = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadReport = () => {
    if (!evaluation) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const marginLeft = 40;
    let yPos = 50;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237); // Violet
    doc.text("getPlaced ATS Resume Intelligence Report", marginLeft, yPos);
    yPos += 25;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Target Role: ${targetRole || "Software Engineer"}`, marginLeft, yPos);
    yPos += 30;

    // Score Banner
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(marginLeft, yPos, 515, 60, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text(`Overall ATS Score: ${evaluation.ats_score}/100 (${evaluation.score_tier || "Strong"})`, marginLeft + 15, yPos + 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    const summaryLines = doc.splitTextToSize(evaluation.summary_critique || "", 485);
    doc.text(summaryLines, marginLeft + 15, yPos + 45);
    yPos += 80;

    // Category Breakdown
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text("Category Breakdown", marginLeft, yPos);
    yPos += 18;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const cats = evaluation.category_scores || {};
    Object.entries(cats).forEach(([key, val]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      doc.text(`• ${label}: ${val}%`, marginLeft + 10, yPos);
      yPos += 14;
    });
    yPos += 15;

    // Matched & Missing Keywords
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Keyword Alignment", marginLeft, yPos);
    yPos += 18;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const matchedStr = (evaluation.matched_keywords || []).map((k) => k.keyword).join(", ");
    const missingStr = (evaluation.missing_keywords || []).map((k) => k.keyword).join(", ");
    
    doc.text(`Matched (${evaluation.matched_keywords?.length || 0}): ${matchedStr || "None detected"}`, marginLeft + 10, yPos, { maxWidth: 490 });
    yPos += 30;
    doc.text(`Missing (${evaluation.missing_keywords?.length || 0}): ${missingStr || "None"}`, marginLeft + 10, yPos, { maxWidth: 490 });
    yPos += 35;

    // Bullet Improvements
    if (evaluation.bullet_improvements?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Recommended XYZ Bullet Rewrites", marginLeft, yPos);
      yPos += 18;

      evaluation.bullet_improvements.slice(0, 2).forEach((b) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(185, 28, 28);
        doc.text(`Before: ${b.original}`, marginLeft + 10, yPos, { maxWidth: 490 });
        yPos += 20;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 101, 52);
        doc.text(`After (XYZ): ${b.improved_xyz}`, marginLeft + 10, yPos, { maxWidth: 490 });
        yPos += 30;
      });
    }

    doc.save(`Resume_ATS_Report_${targetRole.replace(/\s+/g, "_")}.pdf`);
  };

  // AI Bullet Improvement Handler for Builder
  const handleAIImproveBullet = async (bulletText, expIndex, bulletIndex) => {
    setImprovingBulletIndex(`${expIndex}-${bulletIndex}`);
    try {
      const res = await axios.post(`${PY_API_URL}/api/resume/improve-bullet`, {
        bullet: bulletText,
        target_role: targetRole,
        keywords: ["REST APIs", "Scalability", "Optimization", "Latency"]
      });
      setBulletImprovementModal({
        expIndex,
        bulletIndex,
        original: bulletText,
        data: res.data
      });
    } catch (e) {
      console.error("Failed to improve bullet with AI:", e);
    } finally {
      setImprovingBulletIndex(null);
    }
  };

  const applyImprovedBullet = (newBullet) => {
    if (!bulletImprovementModal) return;
    const { expIndex, bulletIndex } = bulletImprovementModal;
    const updated = { ...builderData };
    updated.experience[expIndex].bullets[bulletIndex] = newBullet;
    setBuilderData(updated);
    setBulletImprovementModal(null);
  };

  // AI Summary Optimizer
  const handleAISummaryOptimize = async () => {
    setIsImprovingSection(true);
    try {
      const res = await axios.post(`${PY_API_URL}/api/resume/optimize-section`, {
        section_type: "Professional Summary",
        content: builderData.summary,
        target_role: targetRole,
        job_description: jobDescription
      });
      if (res.data?.optimized_content) {
        setBuilderData({ ...builderData, summary: res.data.optimized_content });
      }
    } catch (e) {
      console.error("Failed to optimize summary:", e);
    } finally {
      setIsImprovingSection(false);
    }
  };

  // Export Builder Resume
  const handleExportBuilderJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(builderData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Resume_${builderData.personalInfo.fullName.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-950/60 border border-violet-700/50 rounded-xl text-violet-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Resume Intelligence Suite
                </h1>
                <p className="text-sm text-gray-400">
                  ATS evaluation, Google XYZ bullet rewriting, version tracking, and interactive resume optimization.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center bg-gray-900/80 border border-gray-800 p-1.5 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab("analyzer")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "analyzer"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              ATS Analyzer
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <History className="w-4 h-4" />
              Version History ({versions.length})
            </button>
            <button
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "builder"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Interactive Builder
            </button>
          </div>
        </div>

        {/* TAB 1: ATS ANALYZER */}
        {activeTab === "analyzer" && (
          <div className="space-y-6">
            {/* Input Form Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-gray-900/70 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-violet-400" />
                  Upload or Paste Resume
                </h2>

                {/* Target Role & Preset */}
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">Target Job Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer, SDE-1"
                    className="w-full px-3.5 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* PDF File Upload Zone */}
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">Resume File (PDF)</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-violet-500 rounded-xl p-5 bg-gray-800/40 cursor-pointer transition">
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-300">
                      {file ? file.name : "Click to select PDF resume"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Supports OCR for scanned documents</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Or Raw Text Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-400">Or Paste Plain Text</label>
                    {rawText && (
                      <button
                        onClick={() => setRawText("")}
                        className="text-xs text-gray-500 hover:text-red-400"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => {
                      setRawText(e.target.value);
                      if (file) setFile(null);
                    }}
                    placeholder="Paste resume markdown or plain text here..."
                    className="w-full px-3.5 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-violet-500 transition resize-none"
                  />
                </div>

                {/* Optional Job Description */}
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">
                    Target Job Description (Optional for keyword matching)
                  </label>
                  <textarea
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste target job posting description..."
                    className="w-full px-3.5 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-violet-500 transition resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    loading
                      ? "bg-violet-800/60 text-gray-300 cursor-not-allowed"
                      : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 active:scale-[0.99]"
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing with AI Engine...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Evaluate ATS Readiness
                    </>
                  )}
                </button>
              </div>

              {/* Evaluation Output Panel */}
              <div className="lg:col-span-2 space-y-6">
                {evaluation ? (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Top ATS Score Summary Card */}
                    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                          {/* Radial Gauge */}
                          <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-800"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={
                                  evaluation.ats_score >= 85
                                    ? "text-emerald-500"
                                    : evaluation.ats_score >= 70
                                    ? "text-violet-500"
                                    : "text-amber-500"
                                }
                                strokeDasharray={`${evaluation.ats_score}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-2xl font-bold text-white leading-none">
                                {evaluation.ats_score}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium mt-0.5">/ 100</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-white">ATS Placement Score</h3>
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                                evaluation.ats_score >= 85
                                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                  : evaluation.ats_score >= 70
                                  ? "bg-violet-950/80 text-violet-300 border-violet-800"
                                  : "bg-amber-950/80 text-amber-300 border-amber-800"
                              }`}>
                                {evaluation.score_tier || "Evaluated"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 max-w-lg leading-relaxed">
                              {evaluation.summary_critique}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <button
                            onClick={handleDownloadReport}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-medium border border-gray-700 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download PDF Report
                          </button>
                        </div>
                      </div>

                      {/* 5-Category Breakdown Progress Bars */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-gray-800/80">
                        {evaluation.category_scores && Object.entries(evaluation.category_scores).map(([catKey, score]) => {
                          const label = catKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                          return (
                            <div key={catKey} className="bg-gray-800/40 p-3 rounded-xl border border-gray-800">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-gray-400 truncate">{label}</span>
                                <span className="font-semibold text-white">{score}%</span>
                              </div>
                              <div className="w-full bg-gray-700/60 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    score >= 80 ? "bg-emerald-500" : score >= 65 ? "bg-violet-500" : "bg-amber-500"
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Keywords Section: Matched vs Missing */}
                    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                          <Award className="w-4 h-4 text-violet-400" />
                          Keyword Match Breakdown
                        </h3>
                        <div className="flex items-center gap-1 bg-gray-800/80 p-1 rounded-lg text-xs">
                          <button
                            onClick={() => setKeywordFilter("all")}
                            className={`px-2.5 py-1 rounded-md transition ${keywordFilter === "all" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
                          >
                            All ({ (evaluation.matched_keywords?.length || 0) + (evaluation.missing_keywords?.length || 0) })
                          </button>
                          <button
                            onClick={() => setKeywordFilter("matched")}
                            className={`px-2.5 py-1 rounded-md transition ${keywordFilter === "matched" ? "bg-emerald-700 text-white" : "text-gray-400 hover:text-white"}`}
                          >
                            Matched ({ evaluation.matched_keywords?.length || 0 })
                          </button>
                          <button
                            onClick={() => setKeywordFilter("missing")}
                            className={`px-2.5 py-1 rounded-md transition ${keywordFilter === "missing" ? "bg-amber-700 text-white" : "text-gray-400 hover:text-white"}`}
                          >
                            Missing ({ evaluation.missing_keywords?.length || 0 })
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(keywordFilter === "all" || keywordFilter === "matched") && evaluation.matched_keywords?.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-emerald-400 block mb-2">✅ Matched Keywords in Resume:</span>
                            <div className="flex flex-wrap gap-2">
                              {evaluation.matched_keywords.map((k, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {k.keyword}
                                  {k.category && <span className="text-[10px] text-emerald-500">({k.category})</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {(keywordFilter === "all" || keywordFilter === "missing") && evaluation.missing_keywords?.length > 0 && (
                          <div className="pt-2">
                            <span className="text-xs font-semibold text-amber-400 block mb-2">⚠️ Missing Critical Skills / Keywords:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {evaluation.missing_keywords.map((k, i) => (
                                <div
                                  key={i}
                                  className="p-2.5 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-start gap-2 text-xs"
                                >
                                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-amber-200">{k.keyword}</span>
                                      <span className="px-1.5 py-0.2 text-[10px] bg-amber-900/60 text-amber-300 rounded">
                                        {k.importance || "High"}
                                      </span>
                                    </div>
                                    {k.reason && <p className="text-[11px] text-gray-400 mt-0.5">{k.reason}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Google XYZ Bullet Point Rewrites */}
                    {evaluation.bullet_improvements?.length > 0 && (
                      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-400" />
                              Actionable Google XYZ Bullet Rewrites
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Formula: Accomplished [X], as measured by [Y], by doing [Z].
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {evaluation.bullet_improvements.map((item, i) => (
                            <div
                              key={i}
                              className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-4 space-y-3"
                            >
                              {/* Original */}
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                                  Original Weak Bullet:
                                </span>
                                <p className="text-xs text-gray-400 italic pl-3 border-l-2 border-rose-500/50">
                                  "{item.original}"
                                </p>
                              </div>

                              {/* Improved */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                    Optimized High-Impact (XYZ):
                                  </span>
                                  <button
                                    onClick={() => handleCopyBullet(item.improved_xyz, i)}
                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 px-2 py-1 rounded transition"
                                  >
                                    {copiedIndex === i ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <p className="text-xs text-white font-medium pl-3 border-l-2 border-emerald-500 bg-emerald-950/20 py-2 rounded-r-lg">
                                  {item.improved_xyz}
                                </p>
                              </div>

                              {/* Metric & Action Verb metadata */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {item.metric_added && (
                                  <span className="text-[11px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-2 py-0.5 rounded">
                                    📈 Metric: {item.metric_added}
                                  </span>
                                )}
                                {item.action_verb_used && (
                                  <span className="text-[11px] bg-violet-950/60 border border-violet-800/60 text-violet-300 px-2 py-0.5 rounded">
                                    ⚡ Verb: {item.action_verb_used}
                                  </span>
                                )}
                                {item.explanation && (
                                  <span className="text-[11px] text-gray-400">
                                    {item.explanation}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable Next Steps */}
                    {evaluation.actionable_recommendations?.length > 0 && (
                      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-3">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Recommended Next Steps to Reach 90+
                        </h3>
                        <ul className="space-y-2">
                          {evaluation.actionable_recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                              <ChevronRight className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                ) : (
                  /* Empty state placeholder */
                  <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[420px]">
                    <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center text-violet-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h3 className="text-lg font-semibold text-white">Ready for Deep ATS Analysis</h3>
                      <p className="text-xs text-gray-400">
                        Upload your PDF resume on the left to receive instant ATS scoring, keyword match evaluation, Google XYZ bullet improvements, and actionable steps.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESUME VERSION TRACKING & DIFFING */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-violet-400" />
                    Resume Version History & Score Diffing
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Track the iterative progress of your resume scores across drafts and target companies.
                  </p>
                </div>

                {versions.length >= 2 && (
                  <button
                    onClick={() => {
                      setCompareVersionA(versions[1]);
                      setCompareVersionB(versions[0]);
                      setCompareModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/30 transition"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Compare Versions (Score Diff)
                  </button>
                )}
              </div>

              {/* Version Timeline Table */}
              <div className="space-y-3">
                {versions.map((ver, idx) => (
                  <div
                    key={ver.id || idx}
                    className="bg-gray-800/40 border border-gray-800 hover:border-gray-700 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-950/60 border border-violet-800/50 flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-violet-300 leading-none">{ver.atsScore}</span>
                        <span className="text-[9px] text-gray-400">Score</span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{ver.name}</h4>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full border ${
                            ver.atsScore >= 85
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : "bg-violet-950 text-violet-300 border-violet-800"
                          }`}>
                            {ver.tier || "Evaluated"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Target: <span className="text-gray-300">{ver.targetRole}</span> • {new Date(ver.timestamp).toLocaleDateString()} at {new Date(ver.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {ver.fullEvaluation && (
                        <button
                          onClick={() => {
                            setEvaluation(ver.fullEvaluation);
                            setActiveTab("analyzer");
                          }}
                          className="px-3 py-1.5 bg-gray-700/60 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition"
                        >
                          View Report
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCompareVersionA(ver);
                          setCompareVersionB(versions[0]);
                          setCompareModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-violet-950/60 hover:bg-violet-900 border border-violet-700/50 text-violet-300 rounded-lg text-xs font-medium transition"
                      >
                        Diff vs Latest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE RESUME BUILDER & OPTIMIZER */}
        {activeTab === "builder" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-violet-400" />
                    Interactive Resume Builder & AI Optimizer
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Live resume workspace with in-line Google XYZ bullet point enhancer, AI summary polish, and export.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBuilderJSON}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export JSON
                  </button>
                  <button
                    onClick={() => {
                      // Send formatted builder data to analyzer
                      let compiledText = `${builderData.personalInfo.fullName}\n${builderData.summary}\n\nExperience:\n`;
                      builderData.experience.forEach((exp) => {
                        compiledText += `${exp.role} at ${exp.company}\n`;
                        exp.bullets.forEach((b) => (compiledText += `• ${b}\n`));
                      });
                      setRawText(compiledText);
                      setActiveTab("analyzer");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/30 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Evaluate in ATS Engine
                  </button>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={builderData.personalInfo.fullName}
                    onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...builderData.personalInfo, fullName: e.target.value } })}
                    placeholder="Full Name"
                    className="px-3.5 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                  <input
                    type="email"
                    value={builderData.personalInfo.email}
                    onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...builderData.personalInfo, email: e.target.value } })}
                    placeholder="Email"
                    className="px-3.5 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                  <input
                    type="text"
                    value={builderData.personalInfo.linkedin}
                    onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...builderData.personalInfo, linkedin: e.target.value } })}
                    placeholder="LinkedIn Profile"
                    className="px-3.5 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Professional Summary with AI Optimizer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300">Professional Summary</h3>
                  <button
                    onClick={handleAISummaryOptimize}
                    disabled={isImprovingSection}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-950/50 border border-violet-800/60 px-3 py-1 rounded-lg transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isImprovingSection ? "Polishing with AI..." : "AI Summary Polish"}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={builderData.summary}
                  onChange={(e) => setBuilderData({ ...builderData, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Work Experience Section with In-line AI Bullet Enhancer */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300">Work Experience & Achievements</h3>
                  <button
                    onClick={() => {
                      const newExp = {
                        id: `exp-${Date.now()}`,
                        role: "New Role",
                        company: "Company Name",
                        location: "City, State",
                        startDate: "2024",
                        endDate: "Present",
                        bullets: ["Engineered scalable service improving metrics by 20%."]
                      };
                      setBuilderData({ ...builderData, experience: [...builderData.experience, newExp] });
                    }}
                    className="flex items-center gap-1 text-xs text-gray-300 hover:text-white bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Experience
                  </button>
                </div>

                <div className="space-y-4">
                  {builderData.experience.map((exp, expIdx) => (
                    <div key={exp.id || expIdx} className="bg-gray-800/40 border border-gray-800 p-4 rounded-xl space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = { ...builderData };
                            updated.experience[expIdx].role = e.target.value;
                            setBuilderData(updated);
                          }}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-violet-500"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = { ...builderData };
                            updated.experience[expIdx].company = e.target.value;
                            setBuilderData(updated);
                          }}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs font-medium text-gray-300 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      {/* Bullets List */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-semibold text-gray-400 block">Bullet Points:</span>
                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => {
                                const updated = { ...builderData };
                                updated.experience[expIdx].bullets[bIdx] = e.target.value;
                                setBuilderData(updated);
                              }}
                              className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-violet-500"
                            />
                            <button
                              onClick={() => handleAIImproveBullet(bullet, expIdx, bIdx)}
                              disabled={improvingBulletIndex === `${expIdx}-${bIdx}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-950/60 hover:bg-violet-900 border border-violet-700/60 text-violet-300 rounded-lg text-xs font-medium shrink-0 transition"
                            >
                              <Sparkles className="w-3 h-3" />
                              {improvingBulletIndex === `${expIdx}-${bIdx}` ? "..." : "AI Improve (XYZ)"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL 1: Compare Versions / Score Diffing */}
        {compareModalOpen && compareVersionA && compareVersionB && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                  Resume Version Comparison & Score Diff
                </h3>
                <button
                  onClick={() => setCompareModalOpen(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Version A */}
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/60 space-y-2">
                  <span className="text-xs text-gray-400">Baseline Version</span>
                  <h4 className="text-sm font-semibold text-white truncate">{compareVersionA.name}</h4>
                  <div className="text-2xl font-bold text-violet-400">{compareVersionA.atsScore} / 100</div>
                  <span className="text-[11px] text-gray-400 block">{new Date(compareVersionA.timestamp).toLocaleDateString()}</span>
                </div>

                {/* Version B */}
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/60 space-y-2">
                  <span className="text-xs text-gray-400">Current / Target Version</span>
                  <h4 className="text-sm font-semibold text-white truncate">{compareVersionB.name}</h4>
                  <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                    {compareVersionB.atsScore} / 100
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      compareVersionB.atsScore >= compareVersionA.atsScore
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}>
                      {compareVersionB.atsScore >= compareVersionA.atsScore ? "+" : ""}
                      {compareVersionB.atsScore - compareVersionA.atsScore} pts
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 block">{new Date(compareVersionB.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Category Diffs */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-300">Category Improvements:</span>
                {compareVersionB.categoryScores && Object.keys(compareVersionB.categoryScores).map((key) => {
                  const valA = compareVersionA.categoryScores?.[key] || 0;
                  const valB = compareVersionB.categoryScores?.[key] || 0;
                  const diff = valB - valA;
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-gray-800">
                      <span className="text-gray-400">{label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">{valA}% → <strong className="text-white">{valB}%</strong></span>
                        <span className={`font-semibold ${diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {diff >= 0 ? `+${diff}%` : `${diff}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setCompareModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-medium transition"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: In-line Bullet Improvement Options */}
        {bulletImprovementModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full p-6 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Select Google XYZ Rewrite
                </h3>
                <button
                  onClick={() => setBulletImprovementModal(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-xs text-gray-400">Primary High-Impact Version:</span>
                <div
                  onClick={() => applyImprovedBullet(bulletImprovementModal.data.improved_xyz)}
                  className="p-3 bg-emerald-950/30 border border-emerald-800/60 hover:border-emerald-500 rounded-xl cursor-pointer transition text-xs text-emerald-200 font-medium"
                >
                  {bulletImprovementModal.data.improved_xyz}
                </div>

                {bulletImprovementModal.data.alternative_versions?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs text-gray-400">Alternative Angles:</span>
                    {bulletImprovementModal.data.alternative_versions.map((alt, idx) => (
                      <div
                        key={idx}
                        onClick={() => applyImprovedBullet(alt)}
                        className="p-3 bg-gray-800/60 border border-gray-700 hover:border-violet-500 rounded-xl cursor-pointer transition text-xs text-gray-300"
                      >
                        {alt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setBulletImprovementModal(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
