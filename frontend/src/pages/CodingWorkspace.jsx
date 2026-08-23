import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  FileText,
  BookOpen,
  History,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Lightbulb,
  Bug,
  Brain,
  Zap,
  Copy,
  Check,
  Code2,
  Layers,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Maximize2,
  Minimize2,
  Share2,
} from "lucide-react";
import { leetcodeService } from "@/services/leetcodeService";
import MarkdownRenderer from "@/components/coach/MarkdownRenderer";
import GpCard from "@/components/gp/GpCard";
import GpBadge from "@/components/gp/GpBadge";
import GpButton from "@/components/gp/GpButton";
import GpToggle from "@/components/gp/GpToggle";

export default function CodingWorkspace() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Problem State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor State
  const [code, setCode] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [copiedCode, setCopiedCode] = useState(false);

  // Workspace Tabs
  const [leftTab, setLeftTab] = useState("description"); // "description", "editorial", "ai", "submissions"
  const [bottomTab, setBottomTab] = useState("testcases"); // "testcases", "testresult", "submission"
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);

  // Execution States
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionsHistory, setSubmissionsHistory] = useState([]);
  const [isSolved, setIsSolved] = useState(false);

  // Editorial & Solution State
  const [solutionData, setSolutionData] = useState(null);
  const [loadingSolution, setLoadingSolution] = useState(false);

  // AI Assistant State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Layout State
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Load problem details
  useEffect(() => {
    if (!slug) return;
    let isCancelled = false;

    async function loadProblem() {
      setLoading(true);
      setError(null);
      setRunResult(null);
      setSubmissionResult(null);
      setSolutionData(null);
      setAiHistory([]);
      setTimerSeconds(0);
      setIsTimerRunning(true);

      try {
        const prob = await leetcodeService.getProblem(slug);
        if (!isCancelled) {
          setProblem(prob);
          
          // Load saved draft or starter code
          const saved = leetcodeService.getSavedCode(slug, prob.starter_code);
          setCode(saved);

          // Check solved status & history
          setIsSolved(leetcodeService.isProblemSolved(slug));
          setSubmissionsHistory(leetcodeService.getSubmissions(slug));
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.response?.data?.detail || "Failed to load problem. Please try again.");
          console.error(err);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadProblem();
    return () => {
      isCancelled = true;
    };
  }, [slug]);

  // Auto-save code draft
  useEffect(() => {
    if (slug && code) {
      leetcodeService.saveCode(slug, code);
    }
  }, [slug, code]);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#896EE2", "#9BFFED", "#FEDF6A", "#F85B52", "#63A0F8"],
    });
  };

  // Handle Run Code
  const handleRunCode = async () => {
    if (!problem || isRunning) return;
    setIsRunning(true);
    setBottomTab("testresult");
    setIsConsoleOpen(true);

    try {
      const res = await leetcodeService.runCode(problem.task_id, code);
      setRunResult(res);
    } catch (err) {
      setRunResult({
        status: "Error",
        all_passed: false,
        passed_count: 0,
        total_count: problem.sample_test_cases?.length || 0,
        error: err.response?.data?.detail || err.message,
        results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handle Submit Code
  const handleSubmitCode = async () => {
    if (!problem || isSubmitting) return;
    setIsSubmitting(true);
    setBottomTab("submission");
    setIsConsoleOpen(true);

    try {
      const res = await leetcodeService.submitCode(problem.task_id, code);
      setSubmissionResult(res);

      // Record submission
      leetcodeService.recordSubmission(problem.task_id, res);
      setSubmissionsHistory(leetcodeService.getSubmissions(problem.task_id));

      if (res.status === "Accepted") {
        setIsSolved(true);
        leetcodeService.markProblemSolved(problem.task_id, {
          runtime_ms: res.runtime_ms,
          beats_runtime_pct: res.beats_runtime_pct,
          difficulty: problem.difficulty,
          title: problem.title,
        });
        triggerConfetti();
      }
    } catch (err) {
      setSubmissionResult({
        status: "Internal Error",
        error: err.response?.data?.detail || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset to starter code
  const handleResetCode = () => {
    if (problem && window.confirm("Reset code to starter template? Your current edits will be discarded.")) {
      setCode(problem.starter_code);
    }
  };

  // Handle AI Guidance Request
  const handleAskAI = async (queryType, customText = null) => {
    if (!problem || aiLoading) return;
    setLeftTab("ai");
    setAiLoading(true);

    const promptText = customText || aiPrompt;
    try {
      const errContext = runResult?.error || submissionResult?.error;
      const res = await leetcodeService.askAIAssist(
        problem.task_id,
        code,
        queryType,
        errContext
      );

      setAiHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: queryType,
          question: promptText || `Requested ${queryType.toUpperCase()} guidance`,
          response: res.response,
        },
      ]);
      setAiPrompt("");
    } catch (err) {
      setAiHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "error",
          question: promptText,
          response: "AI service is currently unavailable. Please check your GOOGLE_API_KEY configuration.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Clean Editorial Explanation text
  const cleanExplanationText = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/```[\s\S]*?```/g, "").trim();
    cleaned = cleaned.replace(/(?:Here'?s?|Below is)\s+the\s+(?:Python\s+)?(?:implementation|code|solution|approach)[:.\s]*$/i, "").trim();
    cleaned = cleaned.replace(/(?:Here'?s?|Below is)\s+the\s+(?:Python\s+)?(?:implementation|code|solution|approach)[:.\s]*\n/gi, "\n").trim();
    cleaned = cleaned.replace(/^(?:###?\s*(?:Explanation|Approach|Solution|Implementation)[:\s]*)/i, "").trim();
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
    if (cleaned.length > 10) {
      return cleaned;
    }
    return "Refer to the optimal step-by-step implementation in the reference code below.";
  };

  // Handle Load Editorial
  const handleLoadEditorial = async () => {
    if (solutionData || loadingSolution) return;
    setLoadingSolution(true);
    try {
      const sol = await leetcodeService.getSolution(slug);
      setSolutionData(sol);
    } catch (err) {
      console.error("Failed to load editorial:", err);
    } finally {
      setLoadingSolution(false);
    }
  };

  const getDifficultyBadgeTheme = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "mint";
      case "medium":
        return "yellow";
      case "hard":
        return "coral";
      default:
        return "light-purple";
    }
  };

  if (loading) {
    return (
      <div className="h-screen min-h-screen bg-[#FEF9CF] u-background-grid-yellow flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#0D0431] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold text-[#0D0431]">Loading workspace...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-screen min-h-screen bg-[#FEF9CF] u-background-grid-yellow flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FFC5B7] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-black text-[#0D0431]">Problem Not Found</h2>
        <p className="text-xs sm:text-sm text-[#0D0431]/80 max-w-md font-medium">{error || "Could not locate problem."}</p>
        <GpButton
          to="/app/coding"
          variant="stacked-yellow"
          icon={false}
        >
          <span className="font-bold text-[#0D0431]">Return to Problem Set</span>
        </GpButton>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen bg-[#FEF9CF] text-[#0D0431] flex flex-col overflow-hidden font-sans">
      
      {/* ── Top Workspace Header ── */}
      <header className="h-14 bg-[#FEF9CF] border-b-2 border-[#0D0431] px-4 flex items-center justify-between shrink-0 shadow-[0_2px_0_0_#0D0431] z-20">
        {/* Left: Navigation & Problem Title */}
        <div className="flex items-center gap-3">
          <Link
            to="/app/coding"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEDF6A] text-xs font-bold text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-sans">Problem Set</span>
          </Link>

          <div className="h-5 w-[2px] bg-[#0D0431]/20 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-[#0D0431]/70">{problem.question_id}.</span>
            <h1 className="text-sm md:text-base font-heading font-black text-[#0D0431] truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {problem.title}
            </h1>
            <GpBadge
              theme={getDifficultyBadgeTheme(problem.difficulty)}
              size="sm"
            >
              {problem.difficulty}
            </GpBadge>
            {isSolved && (
              <GpBadge
                theme="mint"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#346538]" /> Solved
              </GpBadge>
            )}
          </div>
        </div>

        {/* Right: Timer & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Timer Widget */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-[#0D0431] text-xs font-mono font-bold text-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
            <Clock className="w-3.5 h-3.5 text-[#0D0431]/70" />
            <span>{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-[#0D0431] hover:text-[#896EE2] ml-0.5 cursor-pointer"
              title={isTimerRunning ? "Pause Timer" : "Start Timer"}
            >
              {isTimerRunning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4 text-[#346538]" />}
            </button>
          </div>

          {/* Quick Random Problem */}
          <button
            onClick={async () => {
              try {
                const res = await leetcodeService.getRandomProblem();
                if (res?.task_id) navigate(`/app/coding/${res.task_id}`);
              } catch (e) {
                console.error(e);
              }
            }}
            className="p-2 rounded-xl bg-white hover:bg-[#FEDF6A] border-2 border-[#0D0431] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            title="Next Random Problem"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main Workspace Split Grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#FEF9CF]/30">
        
        {/* LEFT COLUMN: Problem Details, Editorial, AI Mentor, Submissions (5 cols) */}
        <div className="lg:col-span-5 border-r-2 border-[#0D0431] flex flex-col bg-white overflow-hidden shadow-sm">
          
          {/* Tab Navigation Header with GetPlaced Pill segmented styles */}
          <div className="flex items-center border-b-2 border-[#0D0431] bg-[#FEF9CF] px-3 py-2 gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
            {[
              { id: "description", label: "Description", icon: FileText },
              { id: "editorial", label: "Editorial", icon: Lightbulb, onSelect: handleLoadEditorial },
              { id: "ai", label: "DSA Mentor", icon: Brain },
              { id: "submissions", label: `Submissions (${submissionsHistory.length})`, icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = leftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setLeftTab(tab.id);
                    if (tab.onSelect) tab.onSelect();
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-sans transition-all border-2 border-[#0D0431] shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#0D0431] text-white shadow-[2px_2px_0_0_#FEDF6A]"
                      : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] shadow-[2px_2px_0_0_#0D0431]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm text-[#0D0431] leading-relaxed scrollbar-thin">
            
            {/* TAB 1: Description */}
            {leftTab === "description" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-[#0D0431]">
                    {problem.question_id}. {problem.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2.5">
                    <GpBadge
                      theme={getDifficultyBadgeTheme(problem.difficulty)}
                      size="sm"
                    >
                      {problem.difficulty}
                    </GpBadge>
                    {isSolved && (
                      <GpBadge theme="mint" size="sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#346538]" /> Solved
                      </GpBadge>
                    )}
                  </div>
                </div>

                {/* Problem Description Body */}
                <div className="prose max-w-none text-[#0D0431] space-y-4 text-xs sm:text-sm font-normal leading-relaxed">
                  <div className="whitespace-pre-wrap leading-relaxed text-[#0D0431]/90 font-sans">
                    {problem.problem_description}
                  </div>
                </div>

                {/* Sample Test Cases (Examples) */}
                {problem.sample_test_cases && problem.sample_test_cases.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D0431]/70">
                      Sample Test Cases
                    </h3>
                    <div className="space-y-3">
                      {problem.sample_test_cases.slice(0, 3).map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2 font-mono text-xs"
                        >
                          <div className="text-[11px] font-sans font-bold text-[#0D0431] flex items-center justify-between">
                            <span>Example {idx + 1}</span>
                          </div>
                          <div>
                            <span className="text-[#0D0431]/60 font-bold">Input: </span>
                            <span className="text-[#0D0431] font-bold">{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-[#0D0431]/60 font-bold">Output: </span>
                            <span className="text-[#346538] font-bold">{tc.output}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topic Tags */}
                {problem.tags && problem.tags.length > 0 && (
                  <div className="pt-4 border-t-2 border-[#0D0431]/20 space-y-2">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D0431]/70 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Topic Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.map((tag) => (
                        <GpBadge
                          key={tag}
                          theme="light-purple"
                          size="sm"
                        >
                          {tag}
                        </GpBadge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Editorial & Solution */}
            {leftTab === "editorial" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-heading font-black text-[#0D0431] flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#896EE2]" />
                    <span>Editorial & Solution</span>
                  </h2>
                  <p className="text-xs text-[#0D0431]/70 mt-1 font-medium">
                    Algorithmic approach breakdown and reference Python implementation.
                  </p>
                </div>

                {loadingSolution ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-6 h-6 border-3 border-[#0D0431] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-mono font-bold text-[#0D0431]">Loading reference solution...</p>
                  </div>
                ) : solutionData ? (
                  <div className="space-y-6">
                    {/* Explanation */}
                    {solutionData.explanation && (
                      <div className="space-y-2 p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                        <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D0431] mb-2">
                          Algorithmic Approach
                        </div>
                        <div className="text-xs text-[#0D0431] leading-relaxed">
                          <MarkdownRenderer content={cleanExplanationText(solutionData.explanation)} />
                        </div>
                      </div>
                    )}

                    {/* Completion Code */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0D0431]">
                        <span className="uppercase tracking-wider">Reference Solution (Python 3)</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(solutionData.completion);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-[#346538]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                        </button>
                      </div>

                      <pre className="p-4 rounded-2xl bg-[#0D0431] border-2 border-[#0D0431] font-mono text-xs text-[#9BFFED] overflow-x-auto shadow-[4px_4px_0_0_#0D0431]">
                        {solutionData.completion}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <GpButton
                    onClick={handleLoadEditorial}
                    variant="stacked-yellow"
                    fullWidth
                    icon={false}
                  >
                    <span className="font-bold text-[#0D0431]">Reveal Editorial Solution</span>
                  </GpButton>
                )}
              </div>
            )}

            {/* TAB 3: Problem-Solving Mentor */}
            {leftTab === "ai" && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#896EE2]" />
                    <h2 className="text-lg font-heading font-black text-[#0D0431]">Algorithmic Mentor</h2>
                  </div>
                  <p className="text-xs text-[#0D0431]/70 mt-1 font-medium">
                    Targeted hints, complexity analysis, and logic verification without revealing the full answer.
                  </p>
                </div>

                {/* Quick AI Action Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleAskAI("hint")}
                    disabled={aiLoading}
                    className="p-3 rounded-2xl bg-[#FEF9CF] hover:bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-left transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-[#0D0431] font-bold text-xs mb-0.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Hint</span>
                    </div>
                    <div className="text-[10px] text-[#0D0431]/70 font-semibold">Identify key pattern</div>
                  </button>

                  <button
                    onClick={() => handleAskAI("explain")}
                    disabled={aiLoading}
                    className="p-3 rounded-2xl bg-[#FEF9CF] hover:bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-left transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-[#0D0431] font-bold text-xs mb-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Approach</span>
                    </div>
                    <div className="text-[10px] text-[#0D0431]/70 font-semibold">Optimal data structure</div>
                  </button>

                  <button
                    onClick={() => handleAskAI("debug")}
                    disabled={aiLoading}
                    className="p-3 rounded-2xl bg-[#FEF9CF] hover:bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-left transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-[#0D0431] font-bold text-xs mb-0.5">
                      <Bug className="w-3.5 h-3.5" />
                      <span>Debug</span>
                    </div>
                    <div className="text-[10px] text-[#0D0431]/70 font-semibold">Isolate logic bugs</div>
                  </button>

                  <button
                    onClick={() => handleAskAI("optimize")}
                    disabled={aiLoading}
                    className="p-3 rounded-2xl bg-[#FEF9CF] hover:bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-left transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-[#0D0431] font-bold text-xs mb-0.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Optimize</span>
                    </div>
                    <div className="text-[10px] text-[#0D0431]/70 font-semibold">Time & space bounds</div>
                  </button>
                </div>

                {/* Custom AI Chat Input */}
                <div className="flex items-center gap-2 bg-white border-2 border-[#0D0431] rounded-2xl p-1.5 shadow-[3px_3px_0_0_#0D0431]">
                  <input
                    type="text"
                    placeholder="Ask a question about your code logic..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiPrompt.trim()) {
                        handleAskAI("custom", aiPrompt);
                      }
                    }}
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#0D0431] placeholder-[#0D0431]/40 font-sans font-medium focus:outline-none"
                  />
                  <button
                    onClick={() => aiPrompt.trim() && handleAskAI("custom", aiPrompt)}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="p-2 rounded-xl bg-[#0D0431] hover:bg-[#896EE2] text-white disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* AI History Responses */}
                {aiLoading && (
                  <div className="py-4 flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#0D0431]">
                    <div className="w-4 h-4 border-2 border-[#0D0431] border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing code...</span>
                  </div>
                )}

                <div className="space-y-3">
                  {aiHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#0D0431]">
                        <span className="capitalize">{item.type} Guidance</span>
                        <span className="text-[10px] text-[#0D0431]/60 font-mono">Feedback</span>
                      </div>
                      <div className="text-xs text-[#0D0431] whitespace-pre-wrap leading-relaxed font-sans">
                        {item.response}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Submissions History */}
            {leftTab === "submissions" && (
              <div className="space-y-4">
                <h2 className="text-lg font-heading font-black text-[#0D0431] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#896EE2]" />
                  <span>Your Submissions</span>
                </h2>

                {submissionsHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#0D0431]/60 space-y-1 font-medium">
                    <p>No submissions recorded for this problem yet.</p>
                    <p>Click "Submit" to evaluate against the full test suite.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissionsHistory.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-xs ${
                                sub.status === "Accepted"
                                  ? "text-[#346538] bg-[#D4FDF7] px-2 py-0.5 rounded-md border border-[#0D0431]"
                                  : "text-[#9F2F2D] bg-[#FFC5B7] px-2 py-0.5 rounded-md border border-[#0D0431]"
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-[10px] text-[#0D0431]/60 font-mono font-bold">
                              {new Date(sub.timestamp).toLocaleDateString()} {new Date(sub.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {sub.error && (
                            <p className="text-[11px] text-[#F85B52] font-mono line-clamp-1 max-w-xs">{sub.error}</p>
                          )}
                        </div>

                        <div className="text-right font-mono text-xs font-bold text-[#0D0431]">
                          <div>{sub.runtime_ms} ms</div>
                          {sub.beats_runtime_pct && (
                            <div className="text-[10px] text-[#346538]">Beats {sub.beats_runtime_pct}%</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Monaco Code Editor & Test Runner Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#FEF9CF]/20 overflow-hidden">
          
          {/* Editor Header Bar */}
          <div className="h-11 border-b-2 border-[#0D0431] bg-[#FEF9CF] px-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#0D0431]" />
              <GpBadge theme="yellow" size="sm">
                Python 3
              </GpBadge>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset to starter code */}
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#FFC5B7] text-xs font-bold text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                title="Reset Code Template"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Font size adjustment */}
              <div className="flex items-center gap-1 bg-white border-2 border-[#0D0431] rounded-lg px-2 py-0.5 text-xs text-[#0D0431] font-mono font-bold shadow-[2px_2px_0_0_#0D0431]">
                <button
                  onClick={() => setFontSize((f) => Math.max(12, f - 1))}
                  className="hover:text-[#896EE2] px-1 cursor-pointer"
                >
                  A-
                </button>
                <span className="text-[10px]">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((f) => Math.min(20, f + 1))}
                  className="hover:text-[#896EE2] px-1 cursor-pointer"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor Container with 2px #0D0431 border & retro shadow */}
          <div className="flex-1 relative overflow-hidden m-2.5 rounded-2xl border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] bg-[#1e1e1e]">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: fontSize,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 4,
                lineNumbers: "on",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                cursorBlinking: "smooth",
                padding: { top: 14, bottom: 14 },
              }}
            />
          </div>

          {/* Bottom Test / Console Panel */}
          {isConsoleOpen && (
            <div className="h-64 sm:h-72 border-t-2 border-[#0D0431] bg-[#0D0431] flex flex-col shrink-0">
              
              {/* Console Navigation Header */}
              <div className="h-10 border-b-2 border-[#0D0431] bg-[#FEF9CF] px-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "testcases", label: "Test Cases" },
                    { id: "testresult", label: "Test Result" },
                    { id: "submission", label: "Submission" },
                  ].map((tab) => {
                    const isSelected = bottomTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setBottomTab(tab.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold font-sans transition-all border-2 border-[#0D0431] cursor-pointer ${
                          isSelected
                            ? "bg-[#0D0431] text-white shadow-[2px_2px_0_0_#FEDF6A]"
                            : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] shadow-[1px_1px_0_0_#0D0431]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="text-[#0D0431] hover:bg-[#FEDF6A] p-1.5 rounded-lg border-2 border-[#0D0431] bg-white shadow-[1px_1px_0_0_#0D0431] cursor-pointer"
                  title="Collapse Console"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Console Body: dark #0D0431 background with #FEF9CF / #9BFFED text */}
              <div className="flex-1 overflow-y-auto p-4 text-xs font-mono text-[#FEF9CF] scrollbar-thin">
                
                {/* 1. Test Cases Tab */}
                {bottomTab === "testcases" && (
                  <div className="space-y-3">
                    {/* Case selection pills */}
                    <div className="flex items-center gap-2">
                      {problem.sample_test_cases?.slice(0, 4).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveTestCaseIndex(i)}
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border-2 cursor-pointer ${
                            activeTestCaseIndex === i
                              ? "bg-[#FEDF6A] text-[#0D0431] border-[#0D0431] shadow-[2px_2px_0_0_#896EE2]"
                              : "bg-[#140742] text-[#FEF9CF] border-[#896EE2]/40 hover:bg-[#896EE2]/30"
                          }`}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>

                    {problem.sample_test_cases && problem.sample_test_cases[activeTestCaseIndex] && (
                      <div className="space-y-2.5 bg-[#140742] p-3.5 rounded-xl border border-[#896EE2]/40">
                        <div>
                          <div className="text-[11px] text-[#FEF9CF]/70 font-sans font-bold mb-1">Input:</div>
                          <div className="p-2.5 rounded-lg bg-[#0D0431] text-[#9BFFED] border border-[#896EE2]/30">
                            {problem.sample_test_cases[activeTestCaseIndex].input}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#FEF9CF]/70 font-sans font-bold mb-1">Expected Output:</div>
                          <div className="p-2.5 rounded-lg bg-[#0D0431] text-[#FEDF6A] border border-[#896EE2]/30 font-bold">
                            {problem.sample_test_cases[activeTestCaseIndex].output}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Test Result Tab */}
                {bottomTab === "testresult" && (
                  <div>
                    {isRunning ? (
                      <div className="p-6 text-center space-y-2">
                        <div className="w-6 h-6 border-3 border-[#FEDF6A] border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="text-[#FEF9CF] font-mono">Running test cases...</div>
                      </div>
                    ) : !runResult ? (
                      <div className="p-6 text-center text-[#FEF9CF]/60 font-mono">
                        Run code to evaluate against sample test cases.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Summary Banner */}
                        <div
                          className={`p-3 rounded-xl border-2 flex items-center justify-between ${
                            runResult.all_passed
                              ? "bg-[#9BFFED]/15 border-[#9BFFED] text-[#9BFFED]"
                              : "bg-[#F85B52]/20 border-[#F85B52] text-[#FFC5B7]"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold font-sans">
                            {runResult.all_passed ? <CheckCircle2 className="w-5 h-5 text-[#9BFFED]" /> : <XCircle className="w-5 h-5 text-[#F85B52]" />}
                            <span>{runResult.status}</span>
                          </div>
                          <div className="text-xs font-mono font-bold">
                            Passed {runResult.passed_count}/{runResult.total_count} ({runResult.total_time_ms} ms)
                          </div>
                        </div>

                        {/* Error info if any */}
                        {runResult.error && (
                          <div className="p-3 rounded-xl bg-[#F85B52]/20 border border-[#F85B52]/50 text-[#FFC5B7] text-xs whitespace-pre-wrap font-mono">
                            {runResult.error}
                          </div>
                        )}

                        {/* Individual Test Cases Accordion */}
                        <div className="space-y-2">
                          {runResult.results?.map((res, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-[#140742] border border-[#896EE2]/40 space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="font-sans text-[#FEF9CF]">Case {res.case_index}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    res.passed
                                      ? "bg-[#9BFFED]/20 text-[#9BFFED]"
                                      : "bg-[#F85B52]/20 text-[#FFC5B7]"
                                  }`}
                                >
                                  {res.passed ? "Passed" : "Wrong Answer"}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs">
                                <div>
                                  <span className="text-[#FEF9CF]/60">Input: </span>
                                  <span className="text-[#FEF9CF]">{res.input}</span>
                                </div>
                                <div>
                                  <span className="text-[#FEF9CF]/60">Expected: </span>
                                  <span className="text-[#FEDF6A]">{res.expected}</span>
                                </div>
                                <div>
                                  <span className="text-[#FEF9CF]/60">Output: </span>
                                  <span className={res.passed ? "text-[#9BFFED]" : "text-[#FFC5B7]"}>
                                    {res.actual ?? "None / Error"}
                                  </span>
                                </div>
                                {res.stdout && (
                                  <div>
                                    <span className="text-[#FEF9CF]/60">Stdout: </span>
                                    <span className="text-[#FEF9CF]">{res.stdout}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Submission Tab */}
                {bottomTab === "submission" && (
                  <div>
                    {isSubmitting ? (
                      <div className="p-6 text-center space-y-2">
                        <div className="w-6 h-6 border-3 border-[#FEDF6A] border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="text-[#FEF9CF] font-mono">Running full test suite...</div>
                      </div>
                    ) : !submissionResult ? (
                      <div className="p-6 text-center text-[#FEF9CF]/60 font-mono">
                        Submit code to evaluate against hidden test cases.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Accepted / Rejected Banner */}
                        <div
                          className={`p-4 rounded-xl border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                            submissionResult.status === "Accepted"
                              ? "bg-[#9BFFED]/15 border-[#9BFFED] text-[#9BFFED]"
                              : "bg-[#F85B52]/20 border-[#F85B52] text-[#FFC5B7]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {submissionResult.status === "Accepted" ? (
                              <CheckCircle2 className="w-6 h-6 text-[#9BFFED] shrink-0" />
                            ) : (
                              <XCircle className="w-6 h-6 text-[#F85B52] shrink-0" />
                            )}
                            <div>
                              <h3 className="text-sm font-heading font-black">
                                {submissionResult.status}
                              </h3>
                              <p className="text-xs text-[#FEF9CF]/80 font-normal">
                                {submissionResult.status === "Accepted"
                                  ? `Passed ${submissionResult.passed_count}/${submissionResult.total_count} test cases.`
                                  : "Some test cases failed."}
                              </p>
                            </div>
                          </div>

                          {submissionResult.status === "Accepted" && (
                            <div className="flex items-center gap-3 text-xs font-mono">
                              <div className="p-2.5 rounded-xl bg-[#0D0431] border border-[#9BFFED]/40 text-center">
                                <div className="text-[#9BFFED] font-bold">{submissionResult.runtime_ms} ms</div>
                                <div className="text-[10px] text-[#FEF9CF]/70 font-sans">Beats {submissionResult.beats_runtime_pct}%</div>
                              </div>

                              <div className="p-2.5 rounded-xl bg-[#0D0431] border border-[#9BFFED]/40 text-center">
                                <div className="text-[#9BFFED] font-bold">{submissionResult.memory_mb} MB</div>
                                <div className="text-[10px] text-[#FEF9CF]/70 font-sans">Memory</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Error info if rejected */}
                        {submissionResult.error && (
                          <div className="p-4 rounded-xl bg-[#F85B52]/20 border border-[#F85B52]/50 text-[#FFC5B7] text-xs whitespace-pre-wrap font-mono space-y-1">
                            <div className="font-bold font-sans">Failure Output:</div>
                            <div>{submissionResult.error}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Bottom Action Footer Bar ── */}
          <div className="h-14 border-t-2 border-[#0D0431] bg-[#FEF9CF] px-4 flex items-center justify-between shrink-0 shadow-[0_-2px_0_0_#0D0431] z-20">
            <div>
              {!isConsoleOpen && (
                <GpButton
                  variant="secondary"
                  size="sm"
                  icon={false}
                  onClick={() => setIsConsoleOpen(true)}
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5" /> Open Console
                  </span>
                </GpButton>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Run Code Button */}
              <GpButton
                variant="secondary"
                size="md"
                icon={false}
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Play className="w-4 h-4 text-[#FEDF6A]" />
                  <span>{isRunning ? "Running..." : "Run Code"}</span>
                </span>
              </GpButton>

              {/* Submit Button */}
              <GpButton
                variant="stacked-yellow"
                size="md"
                icon={false}
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
              >
                <span className="flex items-center gap-1.5 font-bold text-[#0D0431]">
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
                </span>
              </GpButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
