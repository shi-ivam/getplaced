import React, { useState, useEffect, useCallback } from "react";
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
  ChevronDown,
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
  Plus,
  Trash2,
  Trophy,
  Activity,
} from "lucide-react";
import { leetcodeService } from "@/services/leetcodeService";
import MarkdownRenderer from "@/components/coach/MarkdownRenderer";
import GpCard from "@/components/gp/GpCard";
import GpBadge from "@/components/gp/GpBadge";
import GpButton from "@/components/gp/GpButton";

const AI_THINKING_STATEMENTS = [
  "Tracing time & space complexity bounds...",
  "Analyzing data structures & edge cases...",
  "Formulating algorithmic strategy & intuition...",
  "Synthesizing step-by-step logic breakdown...",
  "Verifying optimal asymptotic constraints...",
  "Drafting personalized mentor guidance...",
];

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
  const [copiedInput, setCopiedInput] = useState(false);

  // Workspace Navigation Tabs
  const [leftTab, setLeftTab] = useState("description"); // "description" | "editorial" | "ai" | "submissions"
  const [bottomTab, setBottomTab] = useState("testcases"); // "testcases" | "testresult" | "submission"

  // Test Cases State
  const [customTestCases, setCustomTestCases] = useState([]);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [activeResultCaseIndex, setActiveResultCaseIndex] = useState(0);

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
  const [thinkingIndex, setThinkingIndex] = useState(0);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Console State: "default" | "expanded" | "collapsed"
  const [consoleState, setConsoleState] = useState("default");

  // Rotating thinking statements interval
  useEffect(() => {
    let interval = null;
    if (aiLoading) {
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % AI_THINKING_STATEMENTS.length);
      }, 1600);
    } else {
      setThinkingIndex(0);
    }
    return () => clearInterval(interval);
  }, [aiLoading]);

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
      setActiveTestCaseIndex(0);
      setActiveResultCaseIndex(0);

      try {
        const prob = await leetcodeService.getProblem(slug);
        if (!isCancelled) {
          setProblem(prob);

          // Initialize testcases
          if (prob.sample_test_cases && prob.sample_test_cases.length > 0) {
            setCustomTestCases(
              prob.sample_test_cases.map((tc) => ({
                input: tc.input || "",
                output: tc.output || "",
                isCustom: false,
              }))
            );
          } else {
            setCustomTestCases([{ input: "", output: "", isCustom: false }]);
          }

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
  const handleRunCode = useCallback(async () => {
    if (!problem || isRunning) return;
    setIsRunning(true);
    setBottomTab("testresult");
    if (consoleState === "collapsed") setConsoleState("default");

    try {
      const casesToSend = customTestCases.map((tc) => ({
        input: tc.input,
        output: tc.output,
      }));
      const res = await leetcodeService.runCode(problem.task_id, code, casesToSend);
      setRunResult(res);
      setActiveResultCaseIndex(0);
    } catch (err) {
      setRunResult({
        status: "Error",
        all_passed: false,
        passed_count: 0,
        total_count: customTestCases.length || 0,
        error: err.response?.data?.detail || err.message,
        results: [],
      });
    } finally {
      setIsRunning(false);
    }
  }, [problem, isRunning, code, customTestCases, consoleState]);

  // Handle Submit Code
  const handleSubmitCode = useCallback(async () => {
    if (!problem || isSubmitting) return;
    setIsSubmitting(true);
    setBottomTab("submission");
    if (consoleState === "collapsed") setConsoleState("default");

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
  }, [problem, isSubmitting, code, consoleState]);

  // Global Keyboard Shortcuts (⌘+Enter for Run, ⌘+Shift+Enter for Submit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitCode();
        } else {
          handleRunCode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode, handleSubmitCode]);

  // Handle Reset to starter code
  const handleResetCode = () => {
    if (problem && window.confirm("Reset code to starter template? Your current edits will be discarded.")) {
      setCode(problem.starter_code);
    }
  };

  // Custom Test Case Management
  const handleAddCustomTestCase = () => {
    const newIndex = customTestCases.length;
    const newCase = {
      input: customTestCases[0]?.input || "",
      output: customTestCases[0]?.output || "",
      isCustom: true,
    };
    setCustomTestCases((prev) => [...prev, newCase]);
    setActiveTestCaseIndex(newIndex);
  };

  const handleDeleteTestCase = (idx) => {
    if (customTestCases.length <= 1) return;
    setCustomTestCases((prev) => prev.filter((_, i) => i !== idx));
    setActiveTestCaseIndex((prev) => Math.max(0, prev >= idx ? prev - 1 : prev));
  };

  const handleUpdateTestCaseInput = (idx, value) => {
    setCustomTestCases((prev) =>
      prev.map((tc, i) => (i === idx ? { ...tc, input: value } : tc))
    );
  };

  const handleResetTestCases = () => {
    if (problem?.sample_test_cases) {
      setCustomTestCases(
        problem.sample_test_cases.map((tc) => ({
          input: tc.input || "",
          output: tc.output || "",
          isCustom: false,
        }))
      );
      setActiveTestCaseIndex(0);
    }
  };

  // Handle AI Guidance Request (Real-time Streaming)
  const handleAskAI = async (queryType, customText = null) => {
    if (!problem || aiLoading) return;
    setLeftTab("ai");
    setAiLoading(true);

    const promptText = customText || aiPrompt;
    const errContext = runResult?.error || submissionResult?.error;
    const currentId = Date.now();

    // Initialize streaming item at top of history
    setAiHistory((prev) => [
      {
        id: currentId,
        type: queryType,
        question: promptText || `Requested ${queryType.toUpperCase()} guidance`,
        response: "",
        isStreaming: true,
      },
      ...prev,
    ]);
    setAiPrompt("");

    try {
      await leetcodeService.streamAIAssist(
        problem.task_id,
        code,
        queryType,
        errContext,
        {
          onChunk: (chunk) => {
            setAiHistory((prev) =>
              prev.map((item) =>
                item.id === currentId
                  ? { ...item, response: item.response + chunk }
                  : item
              )
            );
          },
          onDone: () => {
            setAiHistory((prev) =>
              prev.map((item) =>
                item.id === currentId ? { ...item, isStreaming: false } : item
              )
            );
            setAiLoading(false);
          },
          onError: (err) => {
            console.error("AI Streaming error:", err);
            setAiHistory((prev) =>
              prev.map((item) =>
                item.id === currentId
                  ? {
                      ...item,
                      isStreaming: false,
                      response:
                        item.response ||
                        "AI mentor guidance is currently unavailable. Please check backend configuration.",
                    }
                  : item
              )
            );
            setAiLoading(false);
          },
        }
      );
    } catch (err) {
      console.error("AI Invocation error:", err);
      setAiHistory((prev) =>
        prev.map((item) =>
          item.id === currentId
            ? {
                ...item,
                isStreaming: false,
                response:
                  item.response ||
                  "AI mentor guidance is currently unavailable. Please check backend configuration.",
              }
            : item
        )
      );
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
    if (cleaned.length > 10) return cleaned;
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
      <div className="h-full w-full bg-[#FEF9CF] u-background-grid-yellow flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#0D0431] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold text-[#0D0431]">Loading workspace...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-full w-full bg-[#FEF9CF] u-background-grid-yellow flex flex-col items-center justify-center p-6 text-center space-y-4">
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
    <div className="h-full w-full max-h-full max-w-full flex flex-col overflow-hidden bg-[#FEF9CF] text-[#0D0431] font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]">
      
      {/* ── Top Workspace Header ── */}
      <header className="h-14 bg-[#FEF9CF] border-b-2 border-[#0D0431] px-4 flex items-center justify-between shrink-0 shadow-[0_2px_0_0_#0D0431] z-20 min-w-0">
        {/* Left: Navigation & Problem Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/app/coding"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEDF6A] text-xs font-bold text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-sans">Problem Set</span>
          </Link>

          <div className="h-5 w-[2px] bg-[#0D0431]/20 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-xs font-bold text-[#0D0431]/70 shrink-0">{problem.question_id}.</span>
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

        {/* Right: Timer, Random Problem, & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0 min-w-0 w-full bg-[#FEF9CF]/30">
        
        {/* ── LEFT COLUMN: Problem Details, Editorial, AI Mentor, Submissions (5 cols) ── */}
        <div className="lg:col-span-5 border-r-2 border-[#0D0431] flex flex-col bg-white overflow-hidden min-w-0 min-h-0 shadow-sm">
          
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
                      <Lightbulb className="w-3.5 h-3.5 text-[#896EE2]" />
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
                      <BookOpen className="w-3.5 h-3.5 text-[#896EE2]" />
                      <span>Approach</span>
                    </div>
                    <div className="text-[10px] text-[#0D0431]/70 font-semibold">Optimal structure</div>
                  </button>

                  <button
                    onClick={() => handleAskAI("debug")}
                    disabled={aiLoading}
                    className="p-3 rounded-2xl bg-[#FEF9CF] hover:bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-left transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-[#0D0431] font-bold text-xs mb-0.5">
                      <Bug className="w-3.5 h-3.5 text-[#F85B52]" />
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
                      <Zap className="w-3.5 h-3.5 text-[#346538]" />
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

                <div className="space-y-3">
                  {aiHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#0D0431] pb-1.5 border-b border-[#0D0431]/15">
                        <span className="capitalize font-heading font-black flex items-center gap-2">
                          <span>{item.type} Guidance</span>
                          {item.isStreaming && (
                            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#0D0431] bg-[#FEDF6A] px-2 py-0.5 rounded-full border border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0D0431] animate-ping" />
                              Streaming...
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-[#0D0431]/60 font-mono">Feedback</span>
                      </div>

                      {item.isStreaming && !item.response ? (
                        <div className="py-2.5 flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-[#0D0431] border-t-transparent rounded-full animate-spin shrink-0" />
                          <div className="space-y-0.5 min-w-0">
                            <div className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#0D0431]" />
                              <span>DSA Mentor Thinking...</span>
                            </div>
                            <p className="text-[11px] font-mono text-[#0D0431]/75 truncate transition-all duration-300">
                              {AI_THINKING_STATEMENTS[thinkingIndex]}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#0D0431] leading-relaxed font-sans">
                          <MarkdownRenderer content={item.response} />
                          {item.isStreaming && (
                            <span className="inline-block w-1.5 h-3.5 bg-[#0D0431] animate-pulse align-middle ml-1 rounded-sm" />
                          )}
                        </div>
                      )}
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

        {/* ── RIGHT COLUMN: Monaco Code Editor & Retro Console (7 cols) ── */}
        <div className="lg:col-span-7 flex flex-col bg-[#FEF9CF]/20 overflow-hidden min-w-0 min-h-0">
          
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
                  title="Decrease Font Size"
                >
                  A-
                </button>
                <span className="text-[10px]">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((f) => Math.min(20, f + 1))}
                  className="hover:text-[#896EE2] px-1 cursor-pointer"
                  title="Increase Font Size"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor Container with 2px #0D0431 border & retro shadow */}
          <div className="flex-1 relative overflow-hidden m-2 rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] bg-[#1e1e1e] min-h-[160px] min-w-0">
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
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ── CLEAN RETRO TESTCASES / RESULTS / SUBMISSION CONSOLE ── */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {consoleState !== "collapsed" && (
            <div
              className={`border-t-2 border-[#0D0431] bg-[#FEF9CF] flex flex-col shrink-0 transition-all duration-150 ${
                consoleState === "expanded" ? "h-96 sm:h-[420px]" : "h-64 sm:h-72"
              }`}
            >
              {/* Console Navigation Header */}
              <div className="h-10 border-b-2 border-[#0D0431] bg-[#FEF9CF] px-3 flex items-center justify-between shrink-0">
                
                {/* Left: Tab Switchers */}
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "testcases", label: "Test Cases", count: customTestCases.length },
                    { id: "testresult", label: "Test Result", status: runResult ? (runResult.all_passed ? "passed" : "failed") : null },
                    { id: "submission", label: "Submission", status: submissionResult ? (submissionResult.status === "Accepted" ? "passed" : "failed") : null },
                  ].map((tab) => {
                    const isSelected = bottomTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setBottomTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-sans transition-all border-2 border-[#0D0431] cursor-pointer ${
                          isSelected
                            ? "bg-[#0D0431] text-white shadow-[2px_2px_0_0_#FEDF6A]"
                            : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] shadow-[1px_1px_0_0_#0D0431]"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${isSelected ? "bg-[#FEDF6A] text-[#0D0431]" : "bg-[#FEF9CF] text-[#0D0431] border border-[#0D0431]/40"}`}>
                            {tab.count}
                          </span>
                        )}
                        {tab.status === "passed" && (
                          <span className="w-2 h-2 rounded-full bg-[#346538]" />
                        )}
                        {tab.status === "failed" && (
                          <span className="w-2 h-2 rounded-full bg-[#F85B52]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right: Expand / Collapse Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setConsoleState((prev) => (prev === "expanded" ? "default" : "expanded"))
                    }
                    className="p-1 rounded-lg border-2 border-[#0D0431] bg-white hover:bg-[#FEDF6A] text-[#0D0431] shadow-[1px_1px_0_0_#0D0431] transition-all cursor-pointer"
                    title={consoleState === "expanded" ? "Restore Height" : "Maximize Console"}
                  >
                    {consoleState === "expanded" ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setConsoleState("collapsed")}
                    className="p-1 rounded-lg border-2 border-[#0D0431] bg-white hover:bg-[#FEDF6A] text-[#0D0431] shadow-[1px_1px_0_0_#0D0431] transition-all cursor-pointer"
                    title="Collapse Console"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Console Body: Warm #FEF9CF retro theme with #0D0431 text */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 text-xs font-mono text-[#0D0431] scrollbar-thin bg-[#FEF9CF]">
                
                {/* ══════════════════════════════════════════════════ */}
                {/* TAB 1: TEST CASES (INTERACTIVE & CUSTOMIZABLE) */}
                {/* ══════════════════════════════════════════════════ */}
                {bottomTab === "testcases" && (
                  <div className="space-y-3">
                    
                    {/* Case selection pills */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {customTestCases.map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTestCaseIndex(idx)}
                            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border-2 cursor-pointer flex items-center gap-1.5 ${
                              activeTestCaseIndex === idx
                                ? "bg-[#0D0431] text-white border-[#0D0431] shadow-[2px_2px_0_0_#FEDF6A]"
                                : "bg-white text-[#0D0431] border-[#0D0431] hover:bg-[#FEDF6A] shadow-[1px_1px_0_0_#0D0431]"
                            }`}
                          >
                            <span>Case {idx + 1}</span>
                            {tc.isCustom && <span className="text-[10px] font-sans opacity-70">(custom)</span>}
                          </button>
                        ))}

                        {/* Add Case Button */}
                        {customTestCases.length < 6 && (
                          <button
                            onClick={handleAddCustomTestCase}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white hover:bg-[#FEDF6A] text-[#0D0431] border-2 border-dashed border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] transition-all cursor-pointer"
                            title="Add Custom Test Case"
                          >
                            <Plus className="w-3 h-3" />
                            <span className="text-[11px] font-sans">Add Case</span>
                          </button>
                        )}
                      </div>

                      {/* Reset / Actions */}
                      <div className="flex items-center gap-2">
                        {customTestCases[activeTestCaseIndex]?.isCustom && (
                          <button
                            onClick={() => handleDeleteTestCase(activeTestCaseIndex)}
                            className="flex items-center gap-1 text-[11px] font-sans font-bold text-[#9F2F2D] hover:text-[#7F2321] px-2 py-0.5 rounded-lg bg-[#FFC5B7] border border-[#0D0431] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                        <button
                          onClick={handleResetTestCases}
                          className="text-[11px] font-sans font-bold text-[#0D0431]/70 hover:text-[#0D0431] transition-colors cursor-pointer underline"
                        >
                          Reset Cases
                        </button>
                      </div>
                    </div>

                    {/* Active Test Case Input & Expected Output Card */}
                    {customTestCases[activeTestCaseIndex] && (
                      <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[#0D0431]/80 font-sans font-bold mb-1.5">
                            <span>Input: <span className="text-[#0D0431]/60 font-normal">(editable Python arguments)</span></span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(customTestCases[activeTestCaseIndex].input);
                                setCopiedInput(true);
                                setTimeout(() => setCopiedInput(false), 2000);
                              }}
                              className="text-[10px] text-[#0D0431]/70 hover:text-[#0D0431] flex items-center gap-1 cursor-pointer font-sans font-bold"
                            >
                              {copiedInput ? <Check className="w-3 h-3 text-[#346538]" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedInput ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={customTestCases[activeTestCaseIndex].input}
                            onChange={(e) =>
                              handleUpdateTestCaseInput(activeTestCaseIndex, e.target.value)
                            }
                            placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
                            className="w-full p-2.5 rounded-xl bg-[#FEF9CF]/60 text-[#0D0431] border-2 border-[#0D0431] font-mono text-xs font-bold focus:outline-none focus:bg-white resize-y scrollbar-thin shadow-[2px_2px_0_0_#0D0431]"
                          />
                        </div>

                        {customTestCases[activeTestCaseIndex].output && (
                          <div>
                            <div className="text-[11px] text-[#0D0431]/80 font-sans font-bold mb-1.5">Expected Output:</div>
                            <div className="p-2.5 rounded-xl bg-[#FEF9CF]/60 text-[#346538] border-2 border-[#0D0431] font-bold font-mono text-xs shadow-[2px_2px_0_0_#0D0431]">
                              {customTestCases[activeTestCaseIndex].output}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-[11px] text-[#0D0431]/70 font-mono flex items-center gap-1.5 pt-0.5">
                      <Terminal className="w-3.5 h-3.5 text-[#0D0431]" />
                      <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#0D0431] text-[#0D0431] font-bold shadow-[1px_1px_0_0_#0D0431]">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#0D0431] text-[#0D0431] font-bold shadow-[1px_1px_0_0_#0D0431]">Enter</kbd> to run test cases.</span>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB 2: TEST RESULTS (RUN CODE OUTPUT) */}
                {/* ══════════════════════════════════════════════════ */}
                {bottomTab === "testresult" && (
                  <div>
                    {isRunning ? (
                      <div className="p-6 text-center space-y-2 bg-white rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                        <div className="w-6 h-6 border-3 border-[#0D0431] border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="text-[#0D0431] font-mono font-bold">Running test cases in sandbox...</div>
                      </div>
                    ) : !runResult ? (
                      <div className="p-6 text-center text-[#0D0431]/60 font-mono space-y-1 bg-white rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                        <Terminal className="w-6 h-6 mx-auto text-[#0D0431]/50" />
                        <p className="font-bold text-[#0D0431]">No execution results yet.</p>
                        <p className="text-[11px]">Click "Run Code" or press ⌘+Enter to evaluate against sample cases.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        
                        {/* Summary Banner */}
                        <div
                          className={`p-3.5 rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-center justify-between ${
                            runResult.all_passed
                              ? "bg-[#D4FDF7] text-[#346538]"
                              : "bg-[#FFC5B7] text-[#9F2F2D]"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold font-sans">
                            {runResult.all_passed ? <CheckCircle2 className="w-5 h-5 text-[#346538]" /> : <XCircle className="w-5 h-5 text-[#9F2F2D]" />}
                            <span className="text-sm font-black">{runResult.all_passed ? "All Tests Passed" : runResult.status || "Wrong Answer"}</span>
                          </div>
                          <div className="text-xs font-mono font-bold">
                            Passed {runResult.passed_count}/{runResult.total_count} ({runResult.total_time_ms} ms)
                          </div>
                        </div>

                        {/* Error info if any */}
                        {runResult.error && (
                          <div className="p-3.5 rounded-2xl bg-[#FFC5B7] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-[#9F2F2D] text-xs whitespace-pre-wrap font-mono space-y-2">
                            <div className="flex items-center justify-between font-sans font-bold text-[#0D0431]">
                              <span>Runtime / Syntax Error:</span>
                              <button
                                onClick={() => handleAskAI("debug", runResult.error)}
                                className="flex items-center gap-1 text-[11px] bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] px-2 py-0.5 rounded-lg font-bold cursor-pointer"
                              >
                                <Bug className="w-3 h-3" />
                                <span>Debug with Mentor</span>
                              </button>
                            </div>
                            <div className="text-[11px] leading-relaxed font-bold">{runResult.error}</div>
                          </div>
                        )}

                        {/* Individual Test Cases Selector & Detail */}
                        {runResult.results && runResult.results.length > 0 && (
                          <div className="space-y-3">
                            {/* Case selector pills */}
                            <div className="flex items-center gap-2 overflow-x-auto">
                              {runResult.results.map((res, i) => (
                                <button
                                  key={i}
                                  onClick={() => setActiveResultCaseIndex(i)}
                                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border-2 border-[#0D0431] cursor-pointer flex items-center gap-1.5 ${
                                    activeResultCaseIndex === i
                                      ? "bg-[#0D0431] text-white shadow-[2px_2px_0_0_#FEDF6A]"
                                      : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] shadow-[1px_1px_0_0_#0D0431]"
                                  }`}
                                >
                                  <span>Case {res.case_index || i + 1}</span>
                                  {res.passed ? (
                                    <Check className="w-3 h-3 text-[#346538]" />
                                  ) : (
                                    <XCircle className="w-3 h-3 text-[#9F2F2D]" />
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Active result case details card */}
                            {runResult.results[activeResultCaseIndex] && (
                              <div className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2.5">
                                <div className="flex items-center justify-between text-xs font-bold pb-1 border-b border-[#0D0431]/20">
                                  <span className="font-heading font-black text-[#0D0431]">
                                    Case {runResult.results[activeResultCaseIndex].case_index} Details
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#0D0431] ${
                                      runResult.results[activeResultCaseIndex].passed
                                        ? "bg-[#D4FDF7] text-[#346538]"
                                        : "bg-[#FFC5B7] text-[#9F2F2D]"
                                    }`}
                                  >
                                    {runResult.results[activeResultCaseIndex].passed ? "Passed" : "Wrong Answer"}
                                  </span>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                  <div>
                                    <div className="text-[11px] font-sans font-bold text-[#0D0431]/70 mb-0.5">Input:</div>
                                    <div className="p-2 rounded-xl bg-[#FEF9CF]/60 text-[#0D0431] border-2 border-[#0D0431] font-bold shadow-[2px_2px_0_0_#0D0431]">
                                      {runResult.results[activeResultCaseIndex].input}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-sans font-bold text-[#0D0431]/70 mb-0.5">Your Output:</div>
                                    <div className={`p-2 rounded-xl border-2 border-[#0D0431] font-bold shadow-[2px_2px_0_0_#0D0431] ${
                                      runResult.results[activeResultCaseIndex].passed
                                        ? "bg-[#D4FDF7] text-[#346538]"
                                        : "bg-[#FFC5B7] text-[#9F2F2D]"
                                    }`}>
                                      {runResult.results[activeResultCaseIndex].actual ?? "None / Error"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-sans font-bold text-[#0D0431]/70 mb-0.5">Expected:</div>
                                    <div className="p-2 rounded-xl bg-[#FEF9CF]/60 text-[#346538] border-2 border-[#0D0431] font-bold shadow-[2px_2px_0_0_#0D0431]">
                                      {runResult.results[activeResultCaseIndex].expected}
                                    </div>
                                  </div>
                                  {runResult.results[activeResultCaseIndex].stdout && (
                                    <div>
                                      <div className="text-[11px] font-sans font-bold text-[#0D0431]/70 mb-0.5">Stdout:</div>
                                      <div className="p-2 rounded-xl bg-white text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                                        {runResult.results[activeResultCaseIndex].stdout}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB 3: SUBMISSION (FULL TEST SUITE) */}
                {/* ══════════════════════════════════════════════════ */}
                {bottomTab === "submission" && (
                  <div>
                    {isSubmitting ? (
                      <div className="p-6 text-center space-y-2 bg-white rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                        <div className="w-6 h-6 border-3 border-[#0D0431] border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="text-[#0D0431] font-mono font-bold">Running full test suite...</div>
                      </div>
                    ) : !submissionResult ? (
                      <div className="p-6 text-center text-[#0D0431]/60 font-mono space-y-1 bg-white rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                        <Send className="w-6 h-6 mx-auto text-[#0D0431]/50" />
                        <p className="font-bold text-[#0D0431]">Ready to submit your solution.</p>
                        <p className="text-[11px]">Click "Submit" or press ⌘+Shift+Enter to evaluate against all hidden test cases.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        
                        {/* Accepted / Rejected Banner */}
                        <div
                          className={`p-4 rounded-2xl border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                            submissionResult.status === "Accepted"
                              ? "bg-[#D4FDF7] text-[#346538]"
                              : "bg-[#FFC5B7] text-[#9F2F2D]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {submissionResult.status === "Accepted" ? (
                              <CheckCircle2 className="w-6 h-6 text-[#346538] shrink-0" />
                            ) : (
                              <XCircle className="w-6 h-6 text-[#9F2F2D] shrink-0" />
                            )}
                            <div>
                              <h3 className="text-base font-heading font-black">
                                {submissionResult.status}
                              </h3>
                              <p className="text-xs text-[#0D0431]/80 font-normal font-sans">
                                {submissionResult.status === "Accepted"
                                  ? `Passed ${submissionResult.passed_count || "all"} test cases successfully.`
                                  : "Some test cases failed."}
                              </p>
                            </div>
                          </div>

                          {submissionResult.status === "Accepted" && (
                            <div className="flex items-center gap-3 text-xs font-mono font-bold text-[#0D0431]">
                              <div className="p-2.5 rounded-xl bg-white border-2 border-[#0D0431] text-center shadow-[2px_2px_0_0_#0D0431]">
                                <div className="text-[#346538] font-bold">{submissionResult.runtime_ms} ms</div>
                                <div className="text-[10px] text-[#0D0431]/70 font-sans">Beats {submissionResult.beats_runtime_pct || "84.5"}%</div>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white border-2 border-[#0D0431] text-center shadow-[2px_2px_0_0_#0D0431]">
                                <div className="text-[#0D0431] font-bold">{submissionResult.memory_mb || "16.4"} MB</div>
                                <div className="text-[10px] text-[#0D0431]/70 font-sans">Beats {submissionResult.beats_memory_pct || "72.1"}%</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Error info if rejected */}
                        {submissionResult.error && (
                          <div className="p-4 rounded-2xl bg-[#FFC5B7] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-[#9F2F2D] text-xs whitespace-pre-wrap font-mono space-y-2">
                            <div className="flex items-center justify-between font-bold font-sans text-[#0D0431]">
                              <span>Failure Diagnostics:</span>
                              <button
                                onClick={() => handleAskAI("debug", submissionResult.error)}
                                className="flex items-center gap-1 text-[11px] bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] px-2 py-0.5 rounded-lg cursor-pointer"
                              >
                                <Bug className="w-3 h-3" />
                                <span>Debug with Mentor</span>
                              </button>
                            </div>
                            <div className="font-bold">{submissionResult.error}</div>
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
              {consoleState === "collapsed" && (
                <GpButton
                  variant="secondary"
                  size="sm"
                  icon={false}
                  onClick={() => setConsoleState("default")}
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3.5 h-3.5" /> Open Console
                  </span>
                </GpButton>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Keyboard Shortcuts Hint */}
              <span className="text-[11px] text-[#0D0431]/70 hidden md:inline-flex items-center gap-1 font-mono font-bold mr-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#0D0431] text-[#0D0431]">⌘↵</kbd> Run
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#0D0431] text-[#0D0431] ml-1">⌘⇧↵</kbd> Submit
              </span>

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
