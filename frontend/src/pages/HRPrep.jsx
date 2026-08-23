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
  X,
  Award,
  Lightbulb,
} from "lucide-react";
import { PY_API_URL } from "@/config/api";
import { getInterviewMentorCopy } from "@/utils/dynamicCopy";
import GpBadge from "@/components/gp/GpBadge";
import GpCard from "@/components/gp/GpCard";
import GpButton from "@/components/gp/GpButton";
import GpModal from "@/components/gp/GpModal";

const COMPANY_FILTERS = [
  "All Companies",
  "Google (Googliness & Innovation)",
  "Amazon (Leadership Principles)",
  "Meta (Move Fast & Impact)",
  "Microsoft (Growth Mindset)",
  "Netflix (Freedom & Responsibility)",
  "Uber (Customer Obsession)",
];

const CATEGORY_FILTERS = [
  "All Categories",
  "Conflict Resolution & Teamwork",
  "Technical Execution & Problem Solving",
  "Accountability & Growth Mindset",
  "Culture Fit & Motivation",
  "Navigating Ambiguity & Bias for Action",
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
        y: 18,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
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
        count: 6,
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
        interview_type: "behavioral",
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
      className="overflow-x-hidden w-full max-w-full bg-[#FEF9CF] u-background-grid-dark-2 text-[#0D0431] min-h-screen font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Header Hero Section */}
        <div className="text-center space-y-4">
          <GpBadge theme="light-purple" dot={true}>
            Behavioral Strategy & Leadership Principles
          </GpBadge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-[#0D0431] tracking-tight max-w-5xl mx-auto leading-tight">
            Behavioral & Leadership Preparation
          </h1>
          <p className="text-sm md:text-base text-[#0D0431]/80 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
            Structured STAR response practice calibrated against company-specific leadership frameworks and cultural competencies.
          </p>
        </div>

        {/* Retro Interview Navigation Tabs */}
        <nav className="flex items-center justify-center gap-3 overflow-x-auto pb-2 font-sans text-xs">
          <Link
            to="/app/interview"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap bg-white text-[#0D0431] hover:bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] transition-all"
          >
            <BrainCog className="w-4 h-4 text-[#896EE2]" />
            <span>Mock Interview</span>
          </Link>
          <Link
            to="/app/hr-prep"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap bg-[#0D0431] text-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]"
          >
            <Building className="w-4 h-4 text-[#FEDF6A]" />
            <span>HR & Leadership Prep</span>
          </Link>
          <Link
            to="/app/company-intel"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap bg-white text-[#0D0431] hover:bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] transition-all"
          >
            <Layers className="w-4 h-4 text-[#896EE2]" />
            <span>Company Intelligence</span>
          </Link>
        </nav>

        {/* STAR Formula Blueprint Banner & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 grid-flow-dense">
          {/* STAR Framework Blueprint Bento Card */}
          <div className="col-span-12 bg-white border-2 border-[#0D0431] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0D0431] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#896EE2] border border-[#0D0431]" />
                <h3 className="font-heading font-black text-sm uppercase text-[#0D0431] tracking-wider">
                  STAR Response Framework Blueprint
                </h3>
              </div>
              <span className="text-xs text-[#0D0431] font-mono font-bold bg-[#FEF9CF] px-3 py-1 rounded-full border border-[#0D0431]">
                Target allocation for behavioral answers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Situation Card */}
              <div className="p-4 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-black text-xs text-[#0D0431]">Situation</span>
                  <span className="font-mono text-[11px] font-bold text-[#0D0431] bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                    20% Weight
                  </span>
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                  Context, system constraints, business stakes, and project scope.
                </p>
              </div>

              {/* Task Card */}
              <div className="p-4 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-black text-xs text-[#0D0431]">Task</span>
                  <span className="font-mono text-[11px] font-bold text-[#0D0431] bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                    10% Weight
                  </span>
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                  Your specific individual responsibility and primary objective.
                </p>
              </div>

              {/* Action Card */}
              <div className="p-4 bg-[#FEDF6A] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-black text-xs text-[#0D0431]">Action</span>
                  <span className="font-mono text-[11px] font-bold text-[#0D0431] bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                    50% Weight
                  </span>
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                  Technical decisions, trade-offs, architecture, and proactive execution steps.
                </p>
              </div>

              {/* Result Card */}
              <div className="p-4 bg-[#E4CDFB] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-black text-xs text-[#0D0431]">Result</span>
                  <span className="font-mono text-[11px] font-bold text-[#0D0431] bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                    20% Weight
                  </span>
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                  Quantifiable metrics, business outcomes, latency savings, and lessons.
                </p>
              </div>
            </div>
          </div>

          {/* Filter & Control Bar */}
          <div className="col-span-12 flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-[#0D0431] p-4 rounded-2xl shadow-[4px_4px_0_0_#0D0431]">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-4 py-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none transition-all cursor-pointer"
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
                className="px-4 py-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none transition-all cursor-pointer"
              >
                {CATEGORY_FILTERS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={fetchQuestions}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-[#0D0431] font-bold bg-[#FEDF6A] hover:bg-[#FFE995] px-4 py-2.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Prompts
            </button>
          </div>
        </div>

        {/* Questions Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 grid-flow-dense">
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="gsap-bento-card bg-white border-2 border-[#0D0431] hover:border-[#0D0431] rounded-3xl p-6 md:p-7 shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <GpBadge theme="light-purple" size="sm">
                    {q.category || "Behavioral Track"}
                  </GpBadge>
                  <GpBadge theme="yellow" size="sm">
                    Level: {q.difficulty || "Medium"}
                  </GpBadge>
                </div>

                <h3 className="text-base sm:text-lg font-heading font-bold text-[#0D0431] leading-snug">
                  "{q.question}"
                </h3>

                {q.why_asked && (
                  <div className="text-xs text-[#0D0431] bg-[#FEF9CF] border-2 border-[#0D0431] rounded-xl p-3.5 space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                    <span className="font-heading font-bold text-[#0D0431] block uppercase tracking-wider text-[10px]">
                      Evaluator Intent:
                    </span>
                    <p className="text-[#0D0431]/80 leading-relaxed font-sans font-medium">{q.why_asked}</p>
                  </div>
                )}

                {q.star_tips && (
                  <div className="p-3.5 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-xl text-xs space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                    <span className="font-heading font-bold text-[#0D0431] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#0D0431]" />
                      STAR Strategy:
                    </span>
                    <p className="text-[#0D0431]/80 font-mono text-[11px] leading-relaxed">
                      {q.star_tips}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t-2 border-[#0D0431] flex items-center justify-between gap-3 flex-wrap">
                {q.sample_answer ? (
                  <button
                    type="button"
                    onClick={() => handleCopyModel(q.sample_answer, q.id || idx)}
                    className="flex items-center gap-1.5 text-xs text-[#0D0431] bg-white hover:bg-[#FEF9CF] px-3.5 py-2 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all font-mono font-bold cursor-pointer"
                  >
                    {copiedId === (q.id || idx) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#0D0431]" />
                        <span className="text-[#0D0431]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#896EE2]" />
                        <span>Copy Model</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div />
                )}

                <GpButton
                  onClick={() => {
                    setActiveQuestion(q);
                    setPracticeAnswer("");
                    setEvaluationResult(null);
                  }}
                  variant="stacked-yellow"
                  size="sm"
                >
                  Practice Response
                </GpButton>
              </div>
            </div>
          ))}
        </div>

        {/* PRACTICE & AI EVALUATION MODAL */}
        {activeQuestion && (
          <GpModal
            isOpen={!!activeQuestion}
            onClose={() => setActiveQuestion(null)}
            title="Practice Behavioral Response"
            subtitle={activeQuestion.category}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-5">
              {/* Question Context */}
              <div className="p-4 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#0D0431] font-bold">
                  Target Competency: {activeQuestion.category}
                </span>
                <h4 className="text-sm md:text-base font-heading font-bold text-[#0D0431] leading-snug">
                  "{activeQuestion.question}"
                </h4>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-bold tracking-wider font-sans text-[#0D0431]">
                    Your Response
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer ${
                      isRecording
                        ? "bg-[#F85B52] text-white"
                        : "bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431]"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 text-[#0D0431]" />
                        Record Voice
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={practiceAnswer}
                  onChange={(e) => setPracticeAnswer(e.target.value)}
                  placeholder="Type or record your STAR response (Situation, Task, Action, Result)..."
                  className="w-full p-4 bg-white text-[#0D0431] placeholder-[#0D0431]/40 border-2 border-[#0D0431] rounded-xl text-sm font-sans font-medium shadow-[3px_3px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:shadow-[4px_4px_0_0_#0D0431] focus:outline-none transition-all resize-none leading-relaxed"
                />

                <GpButton
                  onClick={handleEvaluatePractice}
                  disabled={evaluating || !practiceAnswer.trim()}
                  variant="stacked"
                  size="md"
                  fullWidth
                >
                  {evaluating ? "Evaluating Answer..." : "Evaluate Response with AI"}
                </GpButton>
              </div>

              {/* Evaluation Results */}
              {evaluationResult && (
                <div className="space-y-4 pt-4 border-t-2 border-[#0D0431]">
                  <div className="flex items-center justify-between bg-[#FEDF6A] p-4 rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                    <span className="text-xs font-heading font-black text-[#0D0431]">
                      Overall Score:
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-heading font-black text-[#0D0431]">
                        {evaluationResult.score} / 100
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] ${
                          evaluationResult.score >= 80
                            ? "bg-[#D4FDF7] text-[#0D0431]"
                            : evaluationResult.score >= 60
                            ? "bg-[#FFE995] text-[#0D0431]"
                            : "bg-[#FFC5B7] text-[#0D0431]"
                        }`}
                      >
                        {evaluationResult.score >= 80
                          ? "Interview Ready"
                          : evaluationResult.score >= 60
                          ? "Developing"
                          : "Needs Practice"}
                      </span>
                    </div>
                  </div>

                  {/* STAR Detection Badges */}
                  {evaluationResult.star_compliance && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431] block">
                        STAR Framework Compliance:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {["situation", "task", "action", "result"].map((k) => {
                          const detected =
                            evaluationResult.star_compliance[`${k}_detected`];
                          return (
                            <div
                              key={k}
                              className={`p-2 rounded-xl border-2 border-[#0D0431] text-center text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431] ${
                                detected
                                  ? "bg-[#D4FDF7] text-[#0D0431]"
                                  : "bg-[#FFC5B7] text-[#0D0431]"
                              }`}
                            >
                              {k.toUpperCase()}: {detected ? "Verified" : "Missing"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Improvement Bento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-xl shadow-[3px_3px_0_0_#0D0431] space-y-1.5">
                      <span className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0D0431]" />
                        Strengths
                      </span>
                      <ul className="text-xs text-[#0D0431] space-y-1 font-medium">
                        {(
                          evaluationResult.strengths || [
                            "Structured technical articulation",
                            "Clear individual role identification",
                          ]
                        )
                          .slice(0, 2)
                          .map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#0D0431] font-bold">•</span>
                              <span className="line-clamp-2">{s}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-[#FFC5B7] border-2 border-[#0D0431] rounded-xl shadow-[3px_3px_0_0_#0D0431] space-y-1.5">
                      <span className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-[#0D0431]" />
                        Areas to Improve
                      </span>
                      <ul className="text-xs text-[#0D0431] space-y-1 font-medium">
                        {(
                          evaluationResult.areas_for_improvement || [
                            "Add quantifiable business or latency metrics",
                            "Elaborate on architectural trade-offs in Action phase",
                          ]
                        )
                          .slice(0, 2)
                          .map((a, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#0D0431] font-bold">•</span>
                              <span className="line-clamp-2">{a}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  {/* One Tip */}
                  <div className="p-4 bg-[#E4CDFB] border-2 border-[#0D0431] rounded-xl flex items-start gap-3 text-xs text-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                    <Sparkles className="w-5 h-5 text-[#0D0431] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-heading font-black text-[#0D0431] block text-[11px] uppercase tracking-wider mb-0.5">
                        Key Strategic Tip:
                      </span>
                      <p className="text-[#0D0431]/90 font-sans font-medium leading-relaxed">
                        {evaluationResult.one_tip ||
                          evaluationResult.key_takeaway ||
                          "Focus heavily on the Action phase detailing your direct technical contribution and trade-offs."}
                      </p>
                    </div>
                  </div>

                  {/* Polished Exemplary Answer (Progressive Disclosure) */}
                  {evaluationResult.suggested_better_answer && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowModelAnswer(!showModelAnswer)}
                        className="text-xs font-bold font-sans text-[#896EE2] hover:text-[#0D0431] flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showModelAnswer ? "Hide Model Answer" : "Show Model Answer"}</span>
                      </button>
                      {showModelAnswer && (
                        <div className="mt-2 p-4 bg-white border-2 border-[#0D0431] rounded-xl space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                          <span className="text-xs font-heading font-bold text-[#0D0431] block">
                            Model Answer:
                          </span>
                          <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                            {evaluationResult.suggested_better_answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </GpModal>
        )}
      </div>
    </main>
  );
}
