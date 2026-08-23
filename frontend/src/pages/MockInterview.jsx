import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import gsap from "gsap";
import {
  BrainCog,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Download,
  Clock,
  Building,
  User,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Sliders,
  Check,
  Award,
  Flame,
} from "lucide-react";
import { PY_API_URL } from "@/config/api";
import CaideBadge from "@/components/caide/CaideBadge";

const TARGET_COMPANIES = [
  "Google",
  "Amazon",
  "Meta",
  "Microsoft",
  "Netflix",
  "Uber",
  "Stripe",
  "Apple",
  "General Tech",
];

const TARGET_ROLES = [
  "Full Stack Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Software Development Engineer (SDE-1)",
  "Systems & Cloud Engineer",
  "Engineering Manager",
];

export default function MockInterview() {
  const [phase, setPhase] = useState("lobby"); // 'lobby' | 'room' | 'report'

  // Setup Config
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [selectedRole, setSelectedRole] = useState("Full Stack Engineer");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(4);

  // Session State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answersHistory, setAnswersHistory] = useState([]);
  const [sessionReport, setSessionReport] = useState(null);

  // Media & Telemetry State
  const [cameraActive, setCameraActive] = useState(true);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);

  // Live Feedback & Error State
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState(null);
  const [evalError, setEvalError] = useState("");
  const [reportError, setReportError] = useState("");

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = () => setIsRecordingAudio(false);
      recognition.onend = () => setIsRecordingAudio(false);
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartInterview = async () => {
    setEvaluatingAnswer(true);
    try {
      const res = await axios.post(`${PY_API_URL}/api/interview/generate-questions`, {
        company: selectedCompany,
        role: selectedRole,
        interview_type: interviewType,
        difficulty: difficulty,
        count: questionCount,
      });

      const fetchedQuestions = res.data.questions || [];
      setQuestions(fetchedQuestions);
      setCurrentIndex(0);
      setAnswersHistory([]);
      setCurrentAnswer("");
      setLiveFeedback(null);
      setPhase("room");
    } catch (e) {
      console.error("Failed to generate questions:", e);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleToggleAudioRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }

    if (isRecordingAudio) {
      recognitionRef.current.stop();
      setIsRecordingAudio(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecordingAudio(true);
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert("Please speak or type your answer before submitting.");
      return;
    }

    if (isRecordingAudio && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingAudio(false);
    }
    if (synthRef.current) synthRef.current.cancel();

    setEvaluatingAnswer(true);
    setEvalError("");
    const qObj = questions[currentIndex];

    try {
      const res = await axios.post(`${PY_API_URL}/api/interview/evaluate-answer`, {
        question: qObj.question,
        answer: currentAnswer,
        company: selectedCompany,
        role: selectedRole,
        interview_type: interviewType,
      });

      const feedbackData = res.data;
      setLiveFeedback(feedbackData);

      const updatedHistory = [
        ...answersHistory,
        {
          question: qObj.question,
          answer: currentAnswer,
          score: feedbackData.score || 75,
          feedback: feedbackData.critique || "",
          suggestedAnswer: feedbackData.model_answer || "",
        },
      ];
      setAnswersHistory(updatedHistory);

      if (currentIndex + 1 < questions.length) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setCurrentAnswer("");
          setLiveFeedback(null);
          setTimeRemaining(120);
        }, 1500);
      } else {
        handleCompleteInterviewSession(updatedHistory);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      setEvalError("Could not evaluate answer. Proceeding to next question.");
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleCompleteInterviewSession = async (finalAnswers) => {
    setEvaluatingAnswer(true);
    try {
      const res = await axios.post(`${PY_API_URL}/api/interview/session-report`, {
        company: selectedCompany,
        role: selectedRole,
        interview_type: interviewType,
        answers: finalAnswers,
      });
      setSessionReport(res.data);
      setPhase("report");
    } catch (e) {
      console.error("Failed to generate session report:", e);
      setReportError("Session report generation failed. Please verify connection.");
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-20 font-sans text-[#17103D]">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DEEC]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2.5">
            <BrainCog className="w-6 h-6 text-[#6E44FF]" />
            <span>Interview Practice</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6A80] mt-1">
            Prepare for technical, system design, and behavioral interviews with real-time AI simulations.
          </p>
        </div>

        {/* Compact Sub-Navigation Tabs */}
        <div className="inline-flex items-center p-1 bg-white border border-[#E2DEEC] rounded-xl shadow-sm self-start text-xs font-semibold">
          <Link
            to="/app/interview"
            className="px-3 py-1.5 rounded-lg bg-[#17103D] text-white shadow-sm font-bold"
          >
            Mock Simulator
          </Link>
          <Link
            to="/app/hr-prep"
            className="px-3 py-1.5 rounded-lg text-[#6F6A80] hover:text-[#17103D] transition-colors"
          >
            HR & Leadership
          </Link>
          <Link
            to="/app/company-intel"
            className="px-3 py-1.5 rounded-lg text-[#6F6A80] hover:text-[#17103D] transition-colors"
          >
            Company Intel
          </Link>
        </div>
      </div>

      {/* PHASE 1: LOBBY CONFIGURATION */}
      {phase === "lobby" && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#17103D]">
              Configure Mock Interview Session
            </h2>
            <p className="text-xs text-[#6F6A80]">
              Select your target employer, technical domain, round focus, and question depth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Target Company */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#6F6A80]">
                Target Enterprise
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-xs font-medium text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
              >
                {TARGET_COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Target Role */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#6F6A80]">
                Target Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-xs font-medium text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Round Type */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#6F6A80]">
                Round Track
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-xs font-medium text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
              >
                <option value="Mixed">Mixed (Technical + Behavioral)</option>
                <option value="Technical">Technical & System Architecture</option>
                <option value="HR">Behavioral & Leadership (STAR)</option>
                <option value="System Design">System Design & Scalability</option>
              </select>
            </div>

            {/* 4. Difficulty */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#6F6A80]">
                Difficulty Tier
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-xs font-medium text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
              >
                <option value="Easy">Easy (Foundation Check)</option>
                <option value="Medium">Medium (Standard SDE)</option>
                <option value="Hard">Hard (Tier-1 Super Dream)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleStartInterview}
              disabled={evaluatingAnswer}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#FFD84D]" />
              <span>{evaluatingAnswer ? "Calibrating..." : "Start Mock Interview"}</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: LIVE SIMULATION ROOM */}
      {phase === "room" && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Question Card */}
            <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6F6A80]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[#C7382B] font-bold">
                  {timeRemaining}s remaining
                </span>
              </div>

              <h3 className="text-base font-bold text-[#17103D]">
                {questions[currentIndex]?.question}
              </h3>

              {questions[currentIndex]?.intent && (
                <p className="text-xs text-[#6F6A80] italic">
                  Interviewer focus: {questions[currentIndex].intent}
                </p>
              )}
            </div>

            {/* Answer Input */}
            <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 shadow-sm space-y-3">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Speak using microphone or type your answer here..."
                rows={5}
                className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl p-3 text-xs text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleToggleAudioRecording}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isRecordingAudio
                      ? "bg-[#FFE8E5] text-[#C7382B] border border-[#FFC5B7]"
                      : "bg-[#F8F8F5] text-[#17103D] border border-[#E2DEEC] hover:bg-[#F2F0FA]"
                  }`}
                >
                  {isRecordingAudio ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecordingAudio ? "Stop Recording" : "Voice Input"}</span>
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={evaluatingAnswer}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>{evaluatingAnswer ? "Evaluating..." : "Submit Answer"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-4 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[#17103D] text-[11px] pb-2 border-b border-[#E2DEEC]">
              Session Parameters
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6F6A80]">Company:</span>
                <span className="font-bold text-[#17103D]">{selectedCompany}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6A80]">Role:</span>
                <span className="font-bold text-[#17103D]">{selectedRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6A80]">Round:</span>
                <span className="font-bold text-[#17103D]">{interviewType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6F6A80]">Difficulty:</span>
                <span className="font-bold text-[#17103D]">{difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: FINAL SESSION REPORT */}
      {phase === "report" && sessionReport && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DEEC]">
            <div>
              <h3 className="text-xl font-bold text-[#17103D]">
                Interview Performance Assessment
              </h3>
              <p className="text-xs text-[#6F6A80] mt-0.5">
                Evaluated against {selectedCompany} {selectedRole} hiring standards.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPhase("lobby")}
                className="px-4 py-2 rounded-xl border border-[#E2DEEC] text-xs font-semibold text-[#17103D] hover:bg-[#F2F0FA]"
              >
                New Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
              <span className="text-[11px] text-[#6F6A80] uppercase font-bold">Overall Score</span>
              <div className="text-3xl font-black text-[#17103D]">{sessionReport.overall_score || 82}/100</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
              <span className="text-[11px] text-[#6F6A80] uppercase font-bold">Recommendation</span>
              <div className="text-lg font-bold text-[#0D7A68]">{sessionReport.recommendation || "Hire"}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
              <span className="text-[11px] text-[#6F6A80] uppercase font-bold">Round Focus</span>
              <div className="text-sm font-bold text-[#17103D]">{interviewType}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
