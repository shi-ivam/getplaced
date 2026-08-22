import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  BrainCog,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building,
  Target,
  Layers,
  Mic,
  Square,
  ChevronRight,
  BookOpen,
  Zap,
  RotateCcw,
  Check,
  Copy,
  SlidersHorizontal,
  X
} from "lucide-react";
import { PY_API_URL } from "@/config/api";
import { getInterviewMentorCopy } from "@/utils/dynamicCopy";

const COMPANY_FILTERS = [
  "All Companies",
  "Google (Googliness & Innovation)",
  "Amazon (Leadership Principles)",
  "Meta (Move Fast & Impact)",
  "Microsoft (Growth Mindset)",
  "Netflix (Freedom & Responsibility)",
  "Uber (Customer Obsession)"
];

const CATEGORY_FILTERS = [
  "All Categories",
  "Conflict Resolution & Teamwork",
  "Technical Execution & Problem Solving",
  "Accountability & Growth Mindset",
  "Culture Fit & Motivation",
  "Navigating Ambiguity & Bias for Action"
];

export default function HRPrep() {
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active Practice Modal
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const containerRef = useRef(null);
  const recognitionRef = useRef(null);

  // GSAP animation
  useGSAP(
    () => {
      gsap.from(".gsap-bento-card", {
        opacity: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out"
      });
    },
    { dependencies: [questions, activeQuestion], scope: containerRef }
  );

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setPracticeAnswer(transcript);
        }
      };

      rec.onerror = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  // Fetch Questions
  useEffect(() => {
    fetchQuestions();
  }, [selectedCompany, selectedCategory]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const companyQuery =
        selectedCompany === "All Companies"
          ? "Top Tech"
          : selectedCompany.split(" ")[0];
      const res = await axios.post(`${PY_API_URL}/api/interview/generate-questions`, {
        company: companyQuery,
        role: "Software Engineer",
        interview_type: "HR",
        difficulty: "Medium",
        count: 6
      });
      setQuestions(res.data.questions || []);
    } catch (e) {
      console.error("Failed to load HR questions:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser. Please type your response.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn("Speech recognition start failed:", err);
      }
    }
  };

  const handleEvaluatePractice = async () => {
    if (!practiceAnswer.trim()) {
      alert("Please enter or record an answer to evaluate.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setEvaluating(true);
    try {
      const res = await axios.post(`${PY_API_URL}/api/interview/evaluate-answer`, {
        question: activeQuestion.question,
        answer: practiceAnswer,
        company: selectedCompany,
        interview_type: "behavioral"
      });
      setEvaluationResult(res.data);
    } catch (e) {
      console.error("Evaluation error:", e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleCopyModel = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main
      ref={containerRef}
      className="overflow-x-hidden w-full max-w-full bg-[#08090c] text-neutral-100 min-h-screen font-sans selection:bg-neutral-800 selection:text-neutral-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Attention / Wide Cinematic Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/90 text-xs font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Behavioral Strategy & Leadership Principles
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight max-w-5xl mx-auto leading-tight">
            Behavioral & Leadership Preparation
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Structured STAR response practice calibrated against company-specific leadership frameworks.
          </p>
        </div>

        {/* Interview Pillar Navigation Tabs Below Title */}
        <nav className="flex items-center justify-center gap-2 overflow-x-auto pb-1 font-mono text-xs border-b border-neutral-800 pb-4">
          <Link
            to="/app/interview"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          >
            <BrainCog className="w-3.5 h-3.5 text-neutral-400" />
            <span>Mock Interview</span>
          </Link>
          <Link
            to="/app/hr-prep"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-white text-black font-semibold shadow-sm"
          >
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>HR & Leadership Prep</span>
          </Link>
          <Link
            to="/app/company-intel"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
          >
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span>Company Intelligence</span>
          </Link>
        </nav>

        {/* Interest / Dense Bento Architecture (STAR Formula Card + Control Bar) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 grid-flow-dense">
          {/* STAR Framework Blueprint Pill */}
          <div className="col-span-12 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <h3 className="text-xs uppercase font-mono font-bold text-white tracking-wider">
                  STAR Response Framework
                </h3>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                Target allocation for behavioral answers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">Situation</span>
                  <span className="font-mono text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                    20% Weight
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Context, constraints, and project scope.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">Task</span>
                  <span className="font-mono text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                    10% Weight
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your specific responsibility and primary objective.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">Action</span>
                  <span className="font-mono text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                    50% Weight
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Technical decisions, trade-offs, and execution steps.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">Result</span>
                  <span className="font-mono text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                    20% Weight
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Quantifiable outcomes, metrics, and key learnings.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 p-3.5 rounded-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-neutral-500"
              >
                {COMPANY_FILTERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-neutral-500"
              >
                {CATEGORY_FILTERS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchQuestions}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 rounded-xl border border-neutral-800 transition font-mono"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Prompts
            </button>
          </div>
        </div>

        {/* Questions Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 grid-flow-dense">
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="gsap-bento-card bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    {q.category || "Behavioral Track"}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-950 text-neutral-400 rounded-full border border-neutral-800">
                    Level: {q.difficulty || "Medium"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  "{q.question}"
                </h3>

                {q.why_asked && (
                  <div className="text-xs text-neutral-400 border-t border-neutral-800/80 pt-3 space-y-1">
                    <span className="text-neutral-300 font-semibold block">
                      Evaluator Intent:
                    </span>
                    <p className="text-neutral-400 leading-relaxed">{q.why_asked}</p>
                  </div>
                )}

                {q.star_tips && (
                  <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs space-y-1">
                    <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                      STAR Strategy:
                    </span>
                    <p className="text-neutral-400 font-mono text-[11px] leading-relaxed">
                      {q.star_tips}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                {q.sample_answer && (
                  <button
                    onClick={() => handleCopyModel(q.sample_answer, q.id || idx)}
                    className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-800 px-3.5 py-2 rounded-xl transition border border-neutral-800 font-mono"
                  >
                    {copiedId === (q.id || idx) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Model Answer</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveQuestion(q);
                    setPracticeAnswer("");
                    setEvaluationResult(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 rounded-xl text-xs font-bold transition shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Practice Response
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PRACTICE & AI EVALUATION MODAL */}
        {activeQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[88vh] overflow-y-auto gsap-bento-card">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BrainCog className="w-4 h-4 text-neutral-400" />
                  Practice Response
                </h3>
                <button
                  onClick={() => setActiveQuestion(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Question Context */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold">
                  {activeQuestion.category}
                </span>
                <h4 className="text-sm font-semibold text-white leading-snug">
                  "{activeQuestion.question}"
                </h4>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider font-mono text-neutral-400">
                    Your Response
                  </label>
                  <button
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition font-mono ${
                      isRecording
                        ? "bg-red-600 text-white"
                        : "bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 text-neutral-300" />
                        Record Voice
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={practiceAnswer}
                  onChange={(e) => setPracticeAnswer(e.target.value)}
                  placeholder="Type or record your response (Situation, Task, Action, Result)..."
                  className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 resize-none leading-relaxed"
                />

                <button
                  onClick={handleEvaluatePractice}
                  disabled={evaluating || !practiceAnswer.trim()}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    evaluating || !practiceAnswer.trim()
                      ? "bg-neutral-950 text-neutral-600 cursor-not-allowed border border-neutral-800"
                      : "bg-white hover:bg-neutral-200 text-neutral-950 shadow-lg"
                  }`}
                >
                  {evaluating
                    ? "Evaluating..."
                    : "Evaluate Response"}
                </button>
              </div>

              {/* Evaluation Results */}
              {evaluationResult && (
                <div className="space-y-3.5 pt-3 border-t border-neutral-800 font-sans">
                  <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                    <span className="text-xs font-semibold text-neutral-300">
                      Overall Score:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-bold text-white">
                        {evaluationResult.score} / 100
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        evaluationResult.score >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : evaluationResult.score >= 60
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {evaluationResult.score >= 80 ? "Interview Ready" : evaluationResult.score >= 60 ? "Developing" : "Needs Practice"}
                      </span>
                    </div>
                  </div>

                  {/* STAR Detection Badges */}
                  {evaluationResult.star_compliance && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                        STAR Components:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["situation", "task", "action", "result"].map((k) => {
                          const detected =
                            evaluationResult.star_compliance[`${k}_detected`];
                          return (
                            <div
                              key={k}
                              className={`p-1.5 rounded-lg border text-center text-[11px] font-mono font-semibold ${
                                detected
                                  ? "bg-neutral-950 border-emerald-500/50 text-emerald-400"
                                  : "bg-neutral-950 border-rose-500/40 text-rose-400"
                              }`}
                            >
                              {k.toUpperCase()}: {detected ? "Verified" : "Missing"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Good & Improve Bento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Strengths
                      </span>
                      <ul className="text-xs text-neutral-300 space-y-0.5">
                        {(evaluationResult.strengths || [
                          "Structured technical articulation",
                          "Clear individual role identification",
                        ]).slice(0, 2).map((s, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-emerald-500">•</span>
                            <span className="line-clamp-2">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Areas to Improve
                      </span>
                      <ul className="text-xs text-neutral-300 space-y-0.5">
                        {(evaluationResult.areas_for_improvement || [
                          "Add quantifiable business or latency metrics",
                          "Elaborate on architectural trade-offs in Action phase",
                        ]).slice(0, 2).map((a, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-amber-500">•</span>
                            <span className="line-clamp-2">{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* One Tip */}
                  <div className="p-3 bg-neutral-950/90 border border-neutral-800/80 rounded-xl flex items-start gap-2 text-xs text-neutral-300">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-200 block text-[11px] uppercase tracking-wider font-mono">
                        Key Tip:
                      </span>
                      <p className="text-neutral-300">
                        {evaluationResult.one_tip ||
                          evaluationResult.key_takeaway ||
                          "Focus on the Action phase detailing your direct technical contribution and trade-offs."}
                      </p>
                    </div>
                  </div>

                  {/* Polished Exemplary Answer (Progressive Disclosure) */}
                  {evaluationResult.suggested_better_answer && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowModelAnswer(!showModelAnswer)}
                        className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showModelAnswer ? "Hide Model Answer" : "Show Model Answer"}</span>
                      </button>
                      {showModelAnswer && (
                        <div className="mt-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                          <span className="text-xs font-bold text-neutral-200 block">
                            Model Answer:
                          </span>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            {evaluationResult.suggested_better_answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
