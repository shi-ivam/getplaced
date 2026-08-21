import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrainCog,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building,
  Target,
  Award,
  Layers,
  Mic,
  Square,
  ChevronRight,
  BookOpen,
  Zap,
  RotateCcw,
  Check,
  Copy
} from "lucide-react";
import { PY_API_URL } from "@/config/api";

const COMPANY_FILTERS = [
  "All Companies",
  "Google (Googliness)",
  "Amazon (16 LPs)",
  "Meta (Move Fast)",
  "Microsoft (Growth Mindset)",
  "Netflix (Freedom & Resp)",
  "Uber (Customer Obsessed)"
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
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const recognitionRef = React.useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
      const companyQuery = selectedCompany === "All Companies" ? "Top Tech" : selectedCompany.split(" ")[0];
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
    <div className="min-h-screen bg-[#0d0f12] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex p-2.5 bg-violet-950/60 border border-violet-700/50 rounded-2xl text-violet-400">
                <BrainCog className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                HR & Behavioral Interview Masterclass
              </h1>
              <p className="text-xs md:text-sm text-gray-400 max-w-2xl leading-relaxed">
                Master behavioral questions with company-aligned culture principles, STAR framework model answers, and real-time AI answer evaluation.
              </p>
            </div>

            {/* STAR Blueprint Pill */}
            <div className="bg-gray-800/80 border border-gray-700 p-4 rounded-2xl space-y-2 shrink-0 self-stretch md:self-auto">
              <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-violet-400" />
                The STAR Formula
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-1.5 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="font-bold text-violet-400 block">S (20%)</span>
                  <span className="text-gray-400">Situation</span>
                </div>
                <div className="p-1.5 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="font-bold text-violet-400 block">T (10%)</span>
                  <span className="text-gray-400">Task</span>
                </div>
                <div className="p-1.5 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="font-bold text-emerald-400 block">A (50%)</span>
                  <span className="text-gray-400">Action</span>
                </div>
                <div className="p-1.5 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="font-bold text-amber-400 block">R (20%)</span>
                  <span className="text-gray-400">Result</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 p-4 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3">
            {/* Company Select */}
            <div>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-violet-500"
              >
                {COMPANY_FILTERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-violet-500"
              >
                {CATEGORY_FILTERS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchQuestions}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-white transition px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Questions
          </button>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="bg-gray-900/70 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                    {q.category || "Behavioral"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full border border-gray-700">
                    {q.difficulty || "Medium"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  "{q.question}"
                </h3>

                {q.why_asked && (
                  <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-800 pt-2">
                    🎯 <strong className="text-gray-300">Why Interviewers Ask:</strong> {q.why_asked}
                  </p>
                )}

                {q.star_tips && (
                  <div className="p-3 bg-violet-950/30 border border-violet-800/40 rounded-xl text-xs text-violet-200">
                    💡 <strong className="text-violet-300">STAR Framing Tip:</strong> {q.star_tips}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-2">
                {q.sample_answer && (
                  <button
                    onClick={() => handleCopyModel(q.sample_answer, q.id || idx)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition border border-gray-700"
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Practice & Evaluate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PRACTICE & AI EVALUATION MODAL */}
        {activeQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-scaleUp">
              
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BrainCog className="w-4 h-4 text-violet-400" />
                  Interactive Practice Sandbox
                </h3>
                <button
                  onClick={() => setActiveQuestion(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Question Header */}
              <div className="p-4 bg-gray-800/60 border border-gray-700 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-violet-400">{activeQuestion.category}</span>
                <h4 className="text-sm font-semibold text-white leading-snug">"{activeQuestion.question}"</h4>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300">Your Response (Voice or Text)</label>
                  <button
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                      isRecording ? "bg-red-600 text-white animate-pulse" : "bg-gray-800 text-gray-300 hover:text-white"
                    }`}
                  >
                    {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5 text-violet-400" />}
                    {isRecording ? "Stop Recording" : "Voice Input"}
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={practiceAnswer}
                  onChange={(e) => setPracticeAnswer(e.target.value)}
                  placeholder="State your Situation, Task, Action, and measurable Result..."
                  className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                />

                <button
                  onClick={handleEvaluatePractice}
                  disabled={evaluating || !practiceAnswer.trim()}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    evaluating || !practiceAnswer.trim()
                      ? "bg-violet-950 text-gray-500 cursor-not-allowed"
                      : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                  }`}
                >
                  {evaluating ? "Evaluating STAR Structure with AI..." : "Evaluate Response with AI"}
                </button>
              </div>

              {/* Evaluation Results */}
              {evaluationResult && (
                <div className="space-y-4 pt-3 border-t border-gray-800 animate-fadeIn">
                  <div className="flex items-center justify-between bg-gray-800/60 p-3 rounded-xl">
                    <span className="text-xs font-semibold text-white">Evaluation Score:</span>
                    <span className="text-base font-extrabold text-violet-400">{evaluationResult.score} / 100</span>
                  </div>

                  {/* STAR Detection Badges */}
                  {evaluationResult.star_compliance && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-gray-300">STAR Components Detected:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["situation", "task", "action", "result"].map((k) => {
                          const detected = evaluationResult.star_compliance[`${k}_detected`];
                          return (
                            <div
                              key={k}
                              className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                                detected
                                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                                  : "bg-red-950/40 border-red-800 text-red-400"
                              }`}
                            >
                              {k.toUpperCase()}: {detected ? "✓ Detected" : "✕ Missing"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Polished Exemplary Answer */}
                  {evaluationResult.suggested_better_answer && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1">
                      <span className="text-xs font-bold text-emerald-400">Polished STAR Model Answer:</span>
                      <p className="text-xs text-gray-300 italic">{evaluationResult.suggested_better_answer}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
