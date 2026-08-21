import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Copy,
  Check,
  Download,
  History,
  Edit3,
  Search,
  Plus,
  Trash2,
  TrendingUp,
  RefreshCw,
  Award,
  Zap,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  SlidersHorizontal,
  X,
  FileCode
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
  summary: "Software Engineer with 2+ years designing resilient web platforms and microservices. Focused on low-latency APIs and cloud deployment workflows.",
  experience: [
    {
      id: "exp-1",
      role: "Software Engineering Intern",
      company: "Acme Cloud Technologies",
      location: "San Francisco, CA",
      startDate: "Jun 2024",
      endDate: "Present",
      bullets: [
        "Engineered 12 RESTful microservices with Node.js & Redis, reducing P99 latency by 42% at 10k RPM peak.",
        "Built dynamic onboarding dashboards using React and Tailwind CSS, increasing onboarding completion by 28%."
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
        "Created automated Docker CI/CD pipelines with GitHub Actions, reducing release cycle time by 50%.",
        "Optimized MongoDB aggregations and indexing to process 500k+ daily operational events."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Distributed Task Scheduler",
      techStack: "Go, Redis, Docker, gRPC",
      bullets: [
        "Constructed job queue handling 25k concurrent tasks with automated exponential backoff retries.",
        "Implemented Redis Raft leader election ensuring zero single-point failure."
      ]
    }
  ],
  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "Go", "SQL"],
    frameworks: ["React", "Node.js", "Express", "FastAPI", "Tailwind CSS"],
    toolsDatabases: ["PostgreSQL", "MongoDB", "Redis", "Docker", "Git", "AWS"]
  },
  education: [
    {
      id: "edu-1",
      degree: "B.S. Computer Science",
      institution: "Northeastern University",
      gradYear: "2025",
      gpa: "3.85 / 4.0"
    }
  ]
};

export default function AnalyzeResume() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("analyzer"); // 'analyzer' | 'history' | 'builder'
  
  // Analyzer state
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [inputMode, setInputMode] = useState("pdf"); // 'pdf' | 'text'
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [showJdInput, setShowJdInput] = useState(false);
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
  const [improvingBulletKey, setImprovingBulletKey] = useState(null);
  const [bulletImprovementModal, setBulletImprovementModal] = useState(null);
  const [isImprovingSection, setIsImprovingSection] = useState(false);

  // GSAP Smooth Tab & Results Entrance
  useGSAP(() => {
    gsap.fromTo(
      ".tab-content-panel",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, { dependencies: [activeTab, evaluation], scope: containerRef });

  // Load versions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setVersions(JSON.parse(saved));
      } else {
        const demoVersion = {
          id: "ver-demo-1",
          name: "V1 Benchmark Candidate Draft",
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          targetRole: "Full Stack Developer",
          targetCompany: "General Tech",
          atsScore: 72,
          tier: "Competitive",
          categoryScores: {
            formatting_structure: 78,
            keyword_relevance: 68,
            impact_metrics: 62,
            skills_alignment: 80,
            experience_relevance: 72
          },
          matchedCount: 9,
          missingCount: 4,
          summaryCritique: "Solid foundational competencies. Requires higher concentration of quantified impact metrics."
        };
        setVersions([demoVersion]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([demoVersion]));
      }
    } catch (e) {
      console.error("Failed to load versions from storage:", e);
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
      setError("Provide a PDF resume or text payload to analyze.");
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
      saveEvaluationToHistory(evalData, file ? `${file.name.replace(".pdf", "")}` : null);
    } catch (err) {
      console.error("Resume analysis error:", err);
      try {
        const legacyRes = await axios.post(`${PY_API_URL}/analyze-resume/`, {
          file: file
        });
        if (legacyRes.data?.data) {
          setEvaluation(legacyRes.data.data);
          saveEvaluationToHistory(legacyRes.data.data);
        } else {
          setError("Analysis engine returned minimal output. Verify network connectivity.");
        }
      } catch (fallbackErr) {
        setError(err.response?.data?.detail || "Analysis request failed. Verify backend services.");
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
    const marginLeft = 45;
    let yPos = 55;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(17, 24, 39);
    doc.text("Resume ATS Audit Report", marginLeft, yPos);
    yPos += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated ${new Date().toLocaleDateString()} | Target: ${targetRole || "Software Engineer"}`, marginLeft, yPos);
    yPos += 30;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginLeft, yPos, 505, 55, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text(`ATS Score: ${evaluation.ats_score}/100 (${evaluation.score_tier || "Standard"})`, marginLeft + 16, yPos + 22);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(evaluation.summary_critique || "", 475);
    doc.text(summaryLines, marginLeft + 16, yPos + 40);
    yPos += 75;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Category Metrics", marginLeft, yPos);
    yPos += 18;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    const cats = evaluation.category_scores || {};
    Object.entries(cats).forEach(([key, val]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      doc.text(`${label}: ${val}%`, marginLeft + 8, yPos);
      yPos += 14;
    });
    yPos += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Keyword Alignment", marginLeft, yPos);
    yPos += 18;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    const matchedStr = (evaluation.matched_keywords || []).map((k) => k.keyword).join(", ");
    const missingStr = (evaluation.missing_keywords || []).map((k) => k.keyword).join(", ");

    doc.text(`Matched (${evaluation.matched_keywords?.length || 0}): ${matchedStr || "None"}`, marginLeft + 8, yPos, { maxWidth: 490 });
    yPos += 26;
    doc.text(`Missing (${evaluation.missing_keywords?.length || 0}): ${missingStr || "None"}`, marginLeft + 8, yPos, { maxWidth: 490 });
    yPos += 30;

    if (evaluation.bullet_improvements?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Google XYZ Bullet Optimizations", marginLeft, yPos);
      yPos += 18;

      evaluation.bullet_improvements.slice(0, 3).forEach((b) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(156, 163, 175);
        doc.text(`Original: ${b.original}`, marginLeft + 8, yPos, { maxWidth: 490 });
        yPos += 18;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text(`Optimized: ${b.improved_xyz}`, marginLeft + 8, yPos, { maxWidth: 490 });
        yPos += 26;
      });
    }

    doc.save(`ATS_Report_${(targetRole || "Candidate").replace(/\s+/g, "_")}.pdf`);
  };

  const handleAIImproveBullet = async (bulletText, expIndex, bulletIndex) => {
    const key = `${expIndex}-${bulletIndex}`;
    setImprovingBulletKey(key);
    try {
      const res = await axios.post(`${PY_API_URL}/api/resume/improve-bullet`, {
        bullet: bulletText,
        target_role: targetRole,
        keywords: ["Architecture", "Scalability", "Optimization", "Latency"]
      });
      setBulletImprovementModal({
        expIndex,
        bulletIndex,
        original: bulletText,
        data: res.data
      });
    } catch (e) {
      console.error("AI bullet improvement error:", e);
    } finally {
      setImprovingBulletKey(null);
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
      console.error("AI summary optimization error:", e);
    } finally {
      setIsImprovingSection(false);
    }
  };

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
    <main ref={containerRef} className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#07080c] text-neutral-200">
      
      {/* Ambient Lighting Backdrops */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-violet-600/10 via-emerald-500/5 to-transparent blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
        
        {/* Minimal Navigation & Title Strip */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.07] pb-7">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase">Intelligence Matrix</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Resume Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-normal">
              ATS algorithmic scoring, Google XYZ bullet formulation, and version diffing.
            </p>
          </div>

          {/* Minimal Floating Segmented Pill */}
          <nav className="inline-flex p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl backdrop-blur-md shadow-2xl">
            <button
              onClick={() => setActiveTab("analyzer")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === "analyzer"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ATS Analyzer
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History ({versions.length})
            </button>
            <button
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === "builder"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Builder
            </button>
          </nav>
        </header>

        {/* TAB 1: ATS ANALYZER */}
        {activeTab === "analyzer" && (
          <div className="tab-content-panel space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Control Card (4 cols) */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono text-[11px]">
                    Input Payload
                  </h2>
                  <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.05]">
                    <button
                      onClick={() => setInputMode("pdf")}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                        inputMode === "pdf" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => setInputMode("text")}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                        inputMode === "text" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      Text
                    </button>
                  </div>
                </div>

                {/* Target Role Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.09] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition font-sans"
                  />
                </div>

                {/* Input Modes: PDF vs Text */}
                {inputMode === "pdf" ? (
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Resume File
                    </label>
                    <label className="group flex flex-col items-center justify-center border border-dashed border-white/15 hover:border-white/40 rounded-xl p-6 bg-black/20 cursor-pointer transition text-center relative overflow-hidden">
                      <UploadCloud className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors mb-2" />
                      <span className="text-xs font-medium text-neutral-200 truncate max-w-full px-2">
                        {file ? file.name : "Select or drop PDF resume"}
                      </span>
                      <span className="text-[10px] text-neutral-500 mt-1 font-mono">
                        Vector parsing & OCR enabled
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {file && (
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                        <span className="truncate">Selected: {file.name}</span>
                        <button
                          onClick={() => setFile(null)}
                          className="text-neutral-400 hover:text-rose-400 transition"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                        Raw Resume Text
                      </label>
                      {rawText && (
                        <button
                          onClick={() => setRawText("")}
                          className="text-[10px] text-neutral-400 hover:text-rose-400"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={5}
                      value={rawText}
                      onChange={(e) => {
                        setRawText(e.target.value);
                        if (file) setFile(null);
                      }}
                      placeholder="Paste markdown or plain text resume content..."
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.09] rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white/30 transition resize-none font-mono text-[11px]"
                    />
                  </div>
                )}

                {/* Collapsible Target JD Input */}
                <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setShowJdInput(!showJdInput)}
                    className="flex items-center justify-between w-full text-[11px] text-neutral-400 hover:text-neutral-200 font-mono uppercase"
                  >
                    <span>Target Job Description</span>
                    <span className="text-xs">{showJdInput ? "-" : "+"}</span>
                  </button>
                  {showJdInput && (
                    <textarea
                      rows={4}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste target job spec to align semantic keyword matching..."
                      className="w-full px-3.5 py-2 bg-black/40 border border-white/[0.09] rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white/30 transition resize-none font-sans"
                    />
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all duration-200 ${
                    loading
                      ? "bg-white/10 text-neutral-400 cursor-not-allowed"
                      : "bg-white text-black hover:bg-neutral-200 active:scale-[0.99] shadow-lg shadow-white/5 font-semibold"
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Evaluating ATS Vectors...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Run ATS Readiness Analysis
                    </>
                  )}
                </button>
              </div>

              {/* Right Output Deck (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {evaluation ? (
                  <div className="space-y-6">
                    
                    {/* Score Overview Card */}
                    <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          {/* Radial Gauge */}
                          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-white/[0.06]"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={
                                  evaluation.ats_score >= 80
                                    ? "text-emerald-400"
                                    : evaluation.ats_score >= 65
                                    ? "text-violet-400"
                                    : "text-amber-400"
                                }
                                strokeDasharray={`${evaluation.ats_score}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                              <span className="text-2xl font-semibold tracking-tight text-white leading-none">
                                {evaluation.ats_score}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-400 mt-0.5">/ 100</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-white">ATS Placement Index</h3>
                              <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md border ${
                                evaluation.ats_score >= 80
                                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                  : evaluation.ats_score >= 65
                                  ? "bg-violet-500/10 text-violet-300 border-violet-500/30"
                                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              }`}>
                                {evaluation.score_tier || "Evaluated"}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
                              {evaluation.summary_critique}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadReport}
                          className="self-start sm:self-center shrink-0 flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-xs font-medium text-neutral-200 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export PDF Report
                        </button>
                      </div>

                      {/* Gapless Category Breakdown Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-7 pt-6 border-t border-white/[0.06] grid-flow-dense">
                        {evaluation.category_scores &&
                          Object.entries(evaluation.category_scores).map(([catKey, score]) => {
                            const label = catKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                            return (
                              <div key={catKey} className="bg-black/30 p-3 rounded-xl border border-white/[0.05]">
                                <div className="flex items-center justify-between text-[11px] mb-1.5">
                                  <span className="text-neutral-400 truncate">{label}</span>
                                  <span className="font-mono text-white font-medium">{score}%</span>
                                </div>
                                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      score >= 80 ? "bg-emerald-400" : score >= 65 ? "bg-violet-400" : "bg-amber-400"
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
                    <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-4 backdrop-blur-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-neutral-400" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
                            Keyword Alignment Matrix
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06] self-start sm:self-auto">
                          <button
                            onClick={() => setKeywordFilter("all")}
                            className={`px-2.5 py-1 rounded text-[11px] transition ${
                              keywordFilter === "all" ? "bg-white/10 text-white font-medium" : "text-neutral-400 hover:text-neutral-200"
                            }`}
                          >
                            All ({ (evaluation.matched_keywords?.length || 0) + (evaluation.missing_keywords?.length || 0) })
                          </button>
                          <button
                            onClick={() => setKeywordFilter("matched")}
                            className={`px-2.5 py-1 rounded text-[11px] transition ${
                              keywordFilter === "matched" ? "bg-emerald-500/20 text-emerald-300 font-medium" : "text-neutral-400 hover:text-neutral-200"
                            }`}
                          >
                            Matched ({ evaluation.matched_keywords?.length || 0 })
                          </button>
                          <button
                            onClick={() => setKeywordFilter("missing")}
                            className={`px-2.5 py-1 rounded text-[11px] transition ${
                              keywordFilter === "missing" ? "bg-amber-500/20 text-amber-300 font-medium" : "text-neutral-400 hover:text-neutral-200"
                            }`}
                          >
                            Missing ({ evaluation.missing_keywords?.length || 0 })
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 pt-1">
                        {(keywordFilter === "all" || keywordFilter === "matched") && evaluation.matched_keywords?.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                              Verified Skills & Keywords
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {evaluation.matched_keywords.map((k, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                >
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  {k.keyword}
                                  {k.category && <span className="text-[10px] text-emerald-400/60 font-mono">({k.category})</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {(keywordFilter === "all" || keywordFilter === "missing") && evaluation.missing_keywords?.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                              Target Skill Gaps
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {evaluation.missing_keywords.map((k, i) => (
                                <div
                                  key={i}
                                  className="p-3 bg-black/40 border border-amber-500/20 rounded-xl space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-amber-200">{k.keyword}</span>
                                    <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                                      {k.importance || "Required"}
                                    </span>
                                  </div>
                                  {k.reason && (
                                    <p className="text-[11px] text-neutral-400 leading-normal">{k.reason}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Google XYZ Bullet Point Rewrites */}
                    {evaluation.bullet_improvements?.length > 0 && (
                      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              Actionable Google XYZ Bullet Optimizations
                            </h3>
                            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                              Formula: Accomplished [X], as measured by [Y], by doing [Z]
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3.5">
                          {evaluation.bullet_improvements.map((item, i) => (
                            <div
                              key={i}
                              className="bg-black/40 border border-white/[0.07] rounded-xl p-4 space-y-3"
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400">
                                  Current Formulation
                                </span>
                                <p className="text-xs text-neutral-400 italic pl-3 border-l border-rose-500/40">
                                  "{item.original}"
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400">
                                    Optimized High-Impact XYZ
                                  </span>
                                  <button
                                    onClick={() => handleCopyBullet(item.improved_xyz, i)}
                                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2 py-1 rounded transition font-mono"
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
                                <p className="text-xs text-white font-medium pl-3 border-l border-emerald-400 bg-emerald-500/[0.04] py-2 rounded-r-lg">
                                  {item.improved_xyz}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {item.metric_added && (
                                  <span className="text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-emerald-300 px-2 py-0.5 rounded">
                                    Metric: {item.metric_added}
                                  </span>
                                )}
                                {item.action_verb_used && (
                                  <span className="text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-violet-300 px-2 py-0.5 rounded">
                                    Verb: {item.action_verb_used}
                                  </span>
                                )}
                                {item.explanation && (
                                  <span className="text-[11px] text-neutral-400">
                                    {item.explanation}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable Recommendations */}
                    {evaluation.actionable_recommendations?.length > 0 && (
                      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-3 backdrop-blur-xl">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Recommended Next Actions
                        </h3>
                        <ul className="space-y-2">
                          {evaluation.actionable_recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                ) : (
                  /* Empty state placeholder */
                  <div className="bg-white/[0.01] border border-dashed border-white/[0.1] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[420px]">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-neutral-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h3 className="text-base font-semibold text-white">Awaiting Input Payload</h3>
                      <p className="text-xs text-neutral-400 font-normal">
                        Submit a resume file or plaintext on the left to trigger full ATS evaluation, keyword matching, and Google XYZ suggestions.
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
          <div className="tab-content-panel space-y-6">
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-7 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                    <History className="w-4 h-4 text-neutral-400" />
                    Version Timeline & Score Trajectory
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Iterative progression of ATS scoring and category improvements across revisions.
                  </p>
                </div>

                {versions.length >= 2 && (
                  <button
                    onClick={() => {
                      setCompareVersionA(versions[1]);
                      setCompareVersionB(versions[0]);
                      setCompareModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white text-black font-semibold rounded-xl text-xs shadow-sm hover:bg-neutral-200 transition"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Score Diff (Latest vs Prior)
                  </button>
                )}
              </div>

              {/* Version List */}
              <div className="space-y-3">
                {versions.map((ver, idx) => (
                  <div
                    key={ver.id || idx}
                    className="bg-black/30 border border-white/[0.06] hover:border-white/[0.15] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white font-mono leading-none">{ver.atsScore}</span>
                        <span className="text-[8px] font-mono text-neutral-400 uppercase mt-0.5">Score</span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white">{ver.name}</h4>
                          <span className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded border ${
                            ver.atsScore >= 80
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : "bg-white/[0.04] text-neutral-300 border-white/[0.08]"
                          }`}>
                            {ver.tier || "Evaluated"}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Target: <span className="text-neutral-300">{ver.targetRole}</span> • {new Date(ver.timestamp).toLocaleDateString()}
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
                          className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 rounded-lg text-xs font-medium transition"
                        >
                          Load in Analyzer
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCompareVersionA(ver);
                          setCompareVersionB(versions[0]);
                          setCompareModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-white rounded-lg text-xs font-medium transition"
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
          <div className="tab-content-panel space-y-6">
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-7 backdrop-blur-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-neutral-400" />
                    Interactive Resume Builder & AI Polish
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Direct resume authoring with in-line Google XYZ bullet enhancers and ATS export.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={handleExportBuilderJSON}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 border border-white/[0.08] rounded-xl text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export JSON
                  </button>
                  <button
                    onClick={() => {
                      let compiledText = `${builderData.personalInfo.fullName}\n${builderData.summary}\n\nExperience:\n`;
                      builderData.experience.forEach((exp) => {
                        compiledText += `${exp.role} at ${exp.company}\n`;
                        exp.bullets.forEach((b) => (compiledText += `• ${b}\n`));
                      });
                      setRawText(compiledText);
                      setInputMode("text");
                      setActiveTab("analyzer");
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-black font-semibold rounded-xl text-xs shadow-sm hover:bg-neutral-200 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Evaluate in ATS Engine
                  </button>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Personal Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={builderData.personalInfo.fullName}
                    onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...builderData.personalInfo, fullName: e.target.value } })}
                    placeholder="Full Name"
                    className="px-3.5 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-white/30"
                  />
                  <input
                    type="email"
                    value={builderData.personalInfo.email}
                    onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...builderData.personalInfo, email: e.target.value } })}
                    placeholder="Email"
                    className="px-3.5 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-white/30"
                  />
                  <input
                    type="text"
                    value={builderData.personalInfo.linkedin}
                    onChange={(e) => setBuilderData({ ...builderData, personalInfo: { ...builderData.personalInfo, linkedin: e.target.value } })}
                    placeholder="LinkedIn Handle or URL"
                    className="px-3.5 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Professional Summary with AI Optimizer */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    Professional Summary
                  </span>
                  <button
                    onClick={handleAISummaryOptimize}
                    disabled={isImprovingSection}
                    className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 rounded-lg transition font-mono"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {isImprovingSection ? "Optimizing..." : "AI Polish"}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={builderData.summary}
                  onChange={(e) => setBuilderData({ ...builderData, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-white/30 resize-none font-sans"
                />
              </div>

              {/* Work Experience Section with In-line AI Bullet Enhancer */}
              <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    Work Experience & Impact Bullets
                  </span>
                  <button
                    onClick={() => {
                      const newExp = {
                        id: `exp-${Date.now()}`,
                        role: "Software Engineer",
                        company: "Tech Enterprise",
                        location: "Remote",
                        startDate: "2024",
                        endDate: "Present",
                        bullets: ["Engineered scalable backend service improving response time by 25%."]
                      };
                      setBuilderData({ ...builderData, experience: [...builderData.experience, newExp] });
                    }}
                    className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.08] transition"
                  >
                    <Plus className="w-3 h-3" />
                    Add Role
                  </button>
                </div>

                <div className="space-y-4">
                  {builderData.experience.map((exp, expIdx) => (
                    <div key={exp.id || expIdx} className="bg-black/30 border border-white/[0.06] p-4 rounded-xl space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = { ...builderData };
                            updated.experience[expIdx].role = e.target.value;
                            setBuilderData(updated);
                          }}
                          placeholder="Role / Title"
                          className="px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs font-medium text-white focus:outline-none focus:border-white/30"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = { ...builderData };
                            updated.experience[expIdx].company = e.target.value;
                            setBuilderData(updated);
                          }}
                          placeholder="Organization"
                          className="px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs font-medium text-neutral-300 focus:outline-none focus:border-white/30"
                        />
                      </div>

                      {/* Bullets List */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                          Impact Bullet Points:
                        </span>
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
                              className="flex-1 px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-white/30"
                            />
                            <button
                              onClick={() => handleAIImproveBullet(bullet, expIdx, bIdx)}
                              disabled={improvingBulletKey === `${expIdx}-${bIdx}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-200 rounded-lg text-[11px] font-medium shrink-0 transition font-mono"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                              {improvingBulletKey === `${expIdx}-${bIdx}` ? "..." : "AI Improve (XYZ)"}
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

      </div>

      {/* MODAL 1: Compare Versions / Score Diffing */}
      {compareModalOpen && compareVersionA && compareVersionB && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0d13] border border-white/[0.12] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-400" />
                Score Trajectory Diff
              </h3>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400">Baseline</span>
                <h4 className="text-xs font-semibold text-white truncate">{compareVersionA.name}</h4>
                <div className="text-2xl font-bold font-mono text-neutral-200">{compareVersionA.atsScore}</div>
              </div>

              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400">Target Revision</span>
                <h4 className="text-xs font-semibold text-white truncate">{compareVersionB.name}</h4>
                <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center gap-2">
                  {compareVersionB.atsScore}
                  <span className={`text-[11px] font-sans px-2 py-0.5 rounded-full ${
                    compareVersionB.atsScore >= compareVersionA.atsScore
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                  }`}>
                    {compareVersionB.atsScore >= compareVersionA.atsScore ? "+" : ""}
                    {compareVersionB.atsScore - compareVersionA.atsScore} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Category Diffs */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                Category Deltas:
              </span>
              {compareVersionB.categoryScores && Object.keys(compareVersionB.categoryScores).map((key) => {
                const valA = compareVersionA.categoryScores?.[key] || 0;
                const valB = compareVersionB.categoryScores?.[key] || 0;
                const diff = valB - valA;
                const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={key} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.04]">
                    <span className="text-neutral-400">{label}</span>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-neutral-400">{valA}% → <strong className="text-white">{valB}%</strong></span>
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
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-white rounded-xl text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: In-line Bullet Improvement Options */}
      {bulletImprovementModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0d13] border border-white/[0.12] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Select Google XYZ Rewrite
              </h3>
              <button
                onClick={() => setBulletImprovementModal(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block">
                Primary High-Impact Formulation:
              </span>
              <div
                onClick={() => applyImprovedBullet(bulletImprovementModal.data.improved_xyz)}
                className="p-3.5 bg-emerald-500/[0.06] border border-emerald-500/30 hover:border-emerald-400 rounded-xl cursor-pointer transition text-xs text-emerald-200 font-medium"
              >
                {bulletImprovementModal.data.improved_xyz}
              </div>

              {bulletImprovementModal.data.alternative_versions?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                    Alternative Angle Options:
                  </span>
                  {bulletImprovementModal.data.alternative_versions.map((alt, idx) => (
                    <div
                      key={idx}
                      onClick={() => applyImprovedBullet(alt)}
                      className="p-3 bg-black/40 border border-white/[0.08] hover:border-white/30 rounded-xl cursor-pointer transition text-xs text-neutral-300"
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
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 rounded-xl text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
