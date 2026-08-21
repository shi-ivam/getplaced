import React, { useState, useEffect, useRef } from "react";
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
  Share2
} from "lucide-react";
import { leetcodeService } from "@/services/leetcodeService";

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
      colors: ["#a855f7", "#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
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
        all_passed: False,
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
          response: "⚠️ AI service is currently unavailable. Please check your GOOGLE_API_KEY configuration.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
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

  // Difficulty Styling
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "hard":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-[#0d0e12] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Setting up coding workspace & environment...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-[#0d0e12] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Problem Not Found</h2>
        <p className="text-sm text-gray-400 max-w-md">{error || "Could not locate this coding challenge."}</p>
        <Link
          to="/app/coding"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
        >
          Return to Problem Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#0d0e12] text-gray-200 flex flex-col overflow-hidden font-sans">
      {/* Top Workspace Header */}
      <header className="h-14 bg-[#14151a] border-b border-zinc-800/80 px-4 flex items-center justify-between shrink-0">
        {/* Left: Navigation & Problem Title */}
        <div className="flex items-center gap-3">
          <Link
            to="/app/coding"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-gray-400 hover:text-gray-200 border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Problem Set</span>
          </Link>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-400 font-semibold">{problem.question_id}.</span>
            <h1 className="text-sm md:text-base font-bold text-white truncate max-w-[200px] md:max-w-md">
              {problem.title}
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            {isSolved && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Solved</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Timer & Actions */}
        <div className="flex items-center gap-3">
          {/* Timer Widget */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-gray-300">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-gray-400 hover:text-gray-200 ml-1 cursor-pointer"
              title={isTimerRunning ? "Pause Timer" : "Start Timer"}
            >
              {isTimerRunning ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />}
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
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
            title="Next Random Problem"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#0d0e12]">
        {/* LEFT COLUMN: Problem Details, Editorial, AI Copilot, Submissions (5 cols) */}
        <div className="lg:col-span-5 border-r border-zinc-800/80 flex flex-col bg-[#111216] overflow-hidden">
          {/* Tab Navigation Header */}
          <div className="flex items-center border-b border-zinc-800/80 bg-[#14151a] px-2 pt-1.5 gap-1 shrink-0 overflow-x-auto">
            <button
              onClick={() => setLeftTab("description")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                leftTab === "description"
                  ? "border-purple-500 text-purple-400 bg-zinc-900/60 font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => {
                setLeftTab("editorial");
                handleLoadEditorial();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                leftTab === "editorial"
                  ? "border-purple-500 text-purple-400 bg-zinc-900/60 font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Editorial & Solution</span>
            </button>

            <button
              onClick={() => setLeftTab("ai")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                leftTab === "ai"
                  ? "border-purple-500 text-purple-400 bg-zinc-900/60 font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Copilot</span>
            </button>

            <button
              onClick={() => setLeftTab("submissions")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                leftTab === "submissions"
                  ? "border-purple-500 text-purple-400 bg-zinc-900/60 font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions ({submissionsHistory.length})</span>
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 text-sm text-gray-300 leading-relaxed scrollbar-thin">
            {/* TAB 1: Description */}
            {leftTab === "description" && (
              <div className="space-y-6">
                {/* Title & Metadata */}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {problem.question_id}. {problem.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>

                {/* Problem Description Body */}
                <div className="prose prose-invert max-w-none text-gray-300 space-y-4 text-sm font-normal">
                  <div className="whitespace-pre-wrap leading-relaxed bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/80">
                    {problem.problem_description}
                  </div>
                </div>

                {/* Sample Test Cases (Examples) */}
                {problem.sample_test_cases && problem.sample_test_cases.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Sample Test Cases
                    </h3>
                    <div className="space-y-3">
                      {problem.sample_test_cases.slice(0, 3).map((tc, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3.5 space-y-2 font-mono text-xs"
                        >
                          <div className="text-gray-400 text-[11px] font-sans font-semibold">
                            Example {idx + 1}:
                          </div>
                          <div>
                            <span className="text-purple-400 font-semibold">Input: </span>
                            <span className="text-gray-200">{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-semibold">Output: </span>
                            <span className="text-gray-200">{tc.output}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topic Tags */}
                {problem.tags && problem.tags.length > 0 && (
                  <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Topic Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-gray-300"
                        >
                          {tag}
                        </span>
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
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <span>Official Editorial & Solution</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete optimal algorithmic breakdown and reference Python implementation.
                  </p>
                </div>

                {loadingSolution ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-gray-400">Loading reference solution...</p>
                  </div>
                ) : solutionData ? (
                  <div className="space-y-4">
                    {/* Explanation */}
                    {solutionData.explanation && (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                        <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                          Algorithmic Approach
                        </div>
                        <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {solutionData.explanation}
                        </div>
                      </div>
                    )}

                    {/* Completion Code */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="font-semibold uppercase tracking-wider">Reference Solution (Python 3)</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(solutionData.completion);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                        </button>
                      </div>

                      <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                        {solutionData.completion}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleLoadEditorial}
                    className="w-full py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-semibold text-xs transition-colors"
                  >
                    Click to Reveal Editorial Solution
                  </button>
                )}
              </div>
            )}

            {/* TAB 3: AI Interviewer & Copilot */}
            {leftTab === "ai" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-bold text-white">Gemini AI DSA Mentor</h2>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Get progressive hints, time/space complexity analysis, or debug failing test cases without spoiling the solution.
                  </p>
                </div>

                {/* Quick AI Action Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAskAI("hint")}
                    disabled={aiLoading}
                    className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-purple-500/20 text-left transition-all hover:border-purple-500/50 group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1">
                      <Lightbulb className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>Progressive Hint</span>
                    </div>
                    <div className="text-[11px] text-gray-400">Get a gentle nudge toward the pattern</div>
                  </button>

                  <button
                    onClick={() => handleAskAI("explain")}
                    disabled={aiLoading}
                    className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-purple-500/20 text-left transition-all hover:border-purple-500/50 group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
                      <BookOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span>Explain Approach</span>
                    </div>
                    <div className="text-[11px] text-gray-400">Learn Big-O & optimal data structures</div>
                  </button>

                  <button
                    onClick={() => handleAskAI("debug")}
                    disabled={aiLoading}
                    className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-purple-500/20 text-left transition-all hover:border-purple-500/50 group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
                      <Bug className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span>Debug My Code</span>
                    </div>
                    <div className="text-[11px] text-gray-400">Diagnose bugs in your current code</div>
                  </button>

                  <button
                    onClick={() => handleAskAI("optimize")}
                    disabled={aiLoading}
                    className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-purple-500/20 text-left transition-all hover:border-purple-500/50 group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                      <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Optimize Code</span>
                    </div>
                    <div className="text-[11px] text-gray-400">Reduce time & space complexity</div>
                  </button>
                </div>

                {/* Custom AI Chat Input */}
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 focus-within:border-purple-500 transition-colors">
                  <input
                    type="text"
                    placeholder="Ask Gemini a specific question about your logic..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiPrompt.trim()) {
                        handleAskAI("custom", aiPrompt);
                      }
                    }}
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    onClick={() => aiPrompt.trim() && handleAskAI("custom", aiPrompt)}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* AI History Responses */}
                {aiLoading && (
                  <div className="p-6 rounded-xl bg-zinc-950 border border-purple-500/30 flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-purple-300 font-medium">Gemini is analyzing your code...</span>
                  </div>
                )}

                <div className="space-y-4">
                  {aiHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-md"
                    >
                      <div className="flex items-center justify-between text-xs text-purple-400 font-semibold">
                        <span className="capitalize">{item.type} Guidance</span>
                        <span className="text-[10px] text-gray-500 font-normal">AI Feedback</span>
                      </div>
                      <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
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
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  <span>Your Submissions</span>
                </h2>

                {submissionsHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 space-y-1">
                    <p>No submissions recorded for this problem yet.</p>
                    <p>Click "Submit" to run the full test suite and test your code.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {submissionsHistory.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold text-xs ${
                                sub.status === "Accepted"
                                  ? "text-emerald-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {new Date(sub.timestamp).toLocaleDateString()} {new Date(sub.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {sub.error && (
                            <p className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">{sub.error}</p>
                          )}
                        </div>

                        <div className="text-right font-mono text-xs text-gray-300">
                          <div>{sub.runtime_ms} ms</div>
                          {sub.beats_runtime_pct && (
                            <div className="text-[10px] text-emerald-400">Beats {sub.beats_runtime_pct}%</div>
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
        <div className="lg:col-span-7 flex flex-col bg-[#14151a] overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-10 border-b border-zinc-800 bg-[#17181f] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-gray-200">Python 3</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset to starter code */}
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-gray-300 transition-colors cursor-pointer"
                title="Reset Code Template"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Font size adjustment */}
              <div className="flex items-center gap-1 bg-zinc-800 rounded px-1.5 py-0.5 text-xs text-gray-400">
                <button
                  onClick={() => setFontSize((f) => Math.max(12, f - 1))}
                  className="hover:text-white px-1"
                >
                  A-
                </button>
                <span className="text-[10px]">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((f) => Math.min(20, f + 1))}
                  className="hover:text-white px-1"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: fontSize,
                fontFamily: "'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
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

          {/* Bottom Test / Console Panel */}
          {isConsoleOpen && (
            <div className="h-64 border-t border-zinc-800 bg-[#111216] flex flex-col shrink-0">
              {/* Console Navigation Header */}
              <div className="h-9 border-b border-zinc-800/80 bg-[#14151a] px-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBottomTab("testcases")}
                    className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                      bottomTab === "testcases"
                        ? "border-purple-500 text-purple-400 font-semibold"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Test Cases
                  </button>

                  <button
                    onClick={() => setBottomTab("testresult")}
                    className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                      bottomTab === "testresult"
                        ? "border-purple-500 text-purple-400 font-semibold"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Test Result
                  </button>

                  <button
                    onClick={() => setBottomTab("submission")}
                    className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                      bottomTab === "submission"
                        ? "border-purple-500 text-purple-400 font-semibold"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    Submission
                  </button>
                </div>

                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="text-gray-500 hover:text-gray-300 p-1"
                  title="Collapse Console"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Console Body */}
              <div className="flex-1 overflow-y-auto p-3.5 text-xs font-mono scrollbar-thin">
                {/* 1. Test Cases Tab */}
                {bottomTab === "testcases" && (
                  <div className="space-y-3">
                    {/* Case selection pills */}
                    <div className="flex items-center gap-1.5">
                      {problem.sample_test_cases?.slice(0, 4).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveTestCaseIndex(i)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                            activeTestCaseIndex === i
                              ? "bg-zinc-800 text-purple-400 font-bold border border-purple-500/30"
                              : "bg-zinc-950 text-gray-400 hover:text-gray-200 border border-zinc-800"
                          }`}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>

                    {problem.sample_test_cases && problem.sample_test_cases[activeTestCaseIndex] && (
                      <div className="space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <div>
                          <div className="text-[11px] text-gray-400 font-sans mb-1">Input:</div>
                          <div className="p-2 rounded bg-zinc-900 text-gray-200">
                            {problem.sample_test_cases[activeTestCaseIndex].input}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-gray-400 font-sans mb-1">Expected Output:</div>
                          <div className="p-2 rounded bg-zinc-900 text-emerald-400">
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
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="text-gray-400">Executing test cases in Python sandbox...</div>
                      </div>
                    ) : !runResult ? (
                      <div className="p-6 text-center text-gray-500">
                        Click "Run Code" to evaluate your solution against sample test cases.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Summary Banner */}
                        <div
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            runResult.all_passed
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold font-sans">
                            {runResult.all_passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{runResult.status}</span>
                          </div>
                          <div className="text-xs font-mono">
                            Passed {runResult.passed_count}/{runResult.total_count} ({runResult.total_time_ms} ms)
                          </div>
                        </div>

                        {/* Error info if any */}
                        {runResult.error && (
                          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs whitespace-pre-wrap">
                            {runResult.error}
                          </div>
                        )}

                        {/* Individual Test Cases Accordion */}
                        <div className="space-y-2">
                          {runResult.results?.map((res, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-sans font-bold text-gray-300">Case {res.case_index}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    res.passed
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-rose-500/20 text-rose-400"
                                  }`}
                                >
                                  {res.passed ? "Passed" : "Wrong Answer"}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs">
                                <div>
                                  <span className="text-gray-500">Input: </span>
                                  <span className="text-gray-300">{res.input}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Expected: </span>
                                  <span className="text-emerald-400">{res.expected}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Output: </span>
                                  <span className={res.passed ? "text-emerald-400" : "text-rose-400"}>
                                    {res.actual ?? "None / Error"}
                                  </span>
                                </div>
                                {res.stdout && (
                                  <div>
                                    <span className="text-gray-500">Stdout: </span>
                                    <span className="text-indigo-300">{res.stdout}</span>
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
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="text-gray-300 font-sans">Evaluating full test suite ({problem.total_test_cases || 50}+ test cases)...</div>
                      </div>
                    ) : !submissionResult ? (
                      <div className="p-6 text-center text-gray-500">
                        Click "Submit" to evaluate your solution against the complete test suite.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Accepted / Rejected Banner */}
                        <div
                          className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                            submissionResult.status === "Accepted"
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {submissionResult.status === "Accepted" ? (
                              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            ) : (
                              <XCircle className="w-8 h-8 text-rose-400" />
                            )}
                            <div>
                              <h3 className="text-base font-bold font-sans">
                                {submissionResult.status}
                              </h3>
                              <p className="text-xs text-gray-400 font-normal">
                                {submissionResult.status === "Accepted"
                                  ? `All ${submissionResult.passed_count}/${submissionResult.total_count} assertions passed successfully!`
                                  : "Some test assertions failed."}
                              </p>
                            </div>
                          </div>

                          {submissionResult.status === "Accepted" && (
                            <div className="flex items-center gap-4 text-xs font-mono">
                              <div className="p-2 rounded-lg bg-zinc-950/80 border border-emerald-500/20 text-center">
                                <div className="text-emerald-400 font-bold">{submissionResult.runtime_ms} ms</div>
                                <div className="text-[10px] text-gray-400 font-sans">Beats {submissionResult.beats_runtime_pct}%</div>
                              </div>

                              <div className="p-2 rounded-lg bg-zinc-950/80 border border-emerald-500/20 text-center">
                                <div className="text-emerald-400 font-bold">{submissionResult.memory_mb} MB</div>
                                <div className="text-[10px] text-gray-400 font-sans">Memory</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Error info if rejected */}
                        {submissionResult.error && (
                          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs whitespace-pre-wrap space-y-1">
                            <div className="font-bold font-sans">Assertion Failure / Traceback:</div>
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

          {/* Bottom Action Footer Bar */}
          <div className="h-12 border-t border-zinc-800 bg-[#14151a] px-4 flex items-center justify-between shrink-0">
            <div>
              {!isConsoleOpen && (
                <button
                  onClick={() => setIsConsoleOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-gray-300 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Open Console</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Run Code Button */}
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-200 text-xs font-semibold border border-zinc-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRunning ? "Running..." : "Run Code"}</span>
              </button>

              {/* Submit Button */}
              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
