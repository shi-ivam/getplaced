import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
  HelpCircle,
  Clock,
  Building,
  User,
  ShieldCheck,
  BarChart2,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Sliders,
  Check
} from "lucide-react";
import { PY_API_URL } from "@/config/api";
import { getInterviewMentorCopy } from "@/utils/dynamicCopy";

const TARGET_COMPANIES = [
  "Google",
  "Amazon",
  "Meta",
  "Microsoft",
  "Netflix",
  "Uber",
  "Stripe",
  "Apple",
  "General Tech"
];

const TARGET_ROLES = [
  "Full Stack Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Software Development Engineer (SDE-1)",
  "Systems & Cloud Engineer",
  "Engineering Manager"
];

export default function MockInterview() {
  // Navigation: 'lobby' | 'room' | 'report'
  const [phase, setPhase] = useState("lobby");

  // Setup Config
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [selectedRole, setSelectedRole] = useState("Full Stack Engineer");
  const [interviewType, setInterviewType] = useState("Mixed"); // 'HR', 'Technical', 'Behavioral', 'Mixed', 'System Design'
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

  // Telemetry indicators
  const [postureStatus, setPostureStatus] = useState("Optimal Posture");
  const [eyeContactScore, setEyeContactScore] = useState(94);

  // Live Feedback & Error State
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState(null);
  const [showLiveModelAnswer, setShowLiveModelAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [evalError, setEvalError] = useState("");
  const [reportError, setReportError] = useState("");

  const interviewMentor = React.useMemo(() => {
    return getInterviewMentorCopy({
      companyName: selectedCompany,
      interviewType,
      targetRole: selectedRole,
    });
  }, [selectedCompany, interviewType, selectedRole]);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const synthRef = useRef(null);

  // GSAP Animations on phase change
  useGSAP(
    () => {
      gsap.from(".gsap-fade-in", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out"
      });
    },
    { dependencies: [phase, currentIndex, liveFeedback], scope: containerRef }
  );

  // Initialize Speech Synthesis and Media Streams
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer((prev) => {
          return transcript.trim() ? transcript : prev;
        });
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        setIsRecordingAudio(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // WebCam setup when entering 'room'
  useEffect(() => {
    let stream = null;
    if (phase === "room" && cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn("Camera permission not granted or unavailable:", err);
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [phase, cameraActive]);

  // Handle Question Timer & Telemetry
  useEffect(() => {
    if (phase === "room" && !evaluatingAnswer) {
      setTimeRemaining(120);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (questions[currentIndex] && !audioMuted) {
        speakQuestion(questions[currentIndex].question);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentIndex, questions, audioMuted]);

  const speakQuestion = (text) => {
    if (!synthRef.current || audioMuted) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setInterviewerSpeaking(true);
    utterance.onend = () => setInterviewerSpeaking(false);
    utterance.onerror = () => setInterviewerSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const handleStartInterview = async () => {
    setEvaluatingAnswer(true);
    try {
      const res = await axios.post(`${PY_API_URL}/api/interview/generate-questions`, {
        company: selectedCompany,
        role: selectedRole,
        interview_type: interviewType,
        difficulty: difficulty,
        count: questionCount
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
      alert("Web Speech API is not supported in this browser. Please type your answer.");
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
        audio_duration_seconds: 120 - timeRemaining
      });

      const evaluation = res.data;
      const answeredItem = {
        questionId: qObj.id,
        question: qObj.question,
        category: qObj.category,
        answer: currentAnswer,
        score: evaluation.score,
        technical_depth_score: evaluation.technical_depth_score,
        communication: evaluation.communication,
        star_compliance: evaluation.star_compliance,
        strengths: evaluation.strengths,
        areas_for_improvement: evaluation.areas_for_improvement,
        suggested_better_answer: evaluation.suggested_better_answer,
        follow_up_question: evaluation.follow_up_question
      };

      const updatedHistory = [...answersHistory, answeredItem];
      setAnswersHistory(updatedHistory);
      setLiveFeedback(answeredItem);
    } catch (e) {
      console.error("Failed to evaluate answer:", e);
      setEvalError(e.response?.data?.detail || "Answer evaluation failed. Please verify AI backend connection and retry.");
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    setLiveFeedback(null);
    setEvalError("");
    setShowHint(false);
    setCurrentAnswer("");

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      generateFinalReport();
    }
  };

  const generateFinalReport = async () => {
    setEvaluatingAnswer(true);
    setReportError("");
    try {
      const res = await axios.post(`${PY_API_URL}/api/interview/session-report`, {
        company: selectedCompany,
        role: selectedRole,
        interview_type: interviewType,
        answers: answersHistory
      });
      setSessionReport(res.data);
      setPhase("report");
    } catch (e) {
      console.error("Failed to generate session report:", e);
      setReportError(e.response?.data?.detail || "Session report generation failed. Please verify connection and retry.");
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleDownloadReportPDF = () => {
    if (!sessionReport) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    let y = 40;
    const margin = 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text("getPlaced Mock Interview Executive Assessment", margin, y);
    y += 24;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 90, 90);
    doc.text(
      `Company: ${selectedCompany} | Role: ${selectedRole} | Round: ${interviewType} | Date: ${new Date().toLocaleDateString()}`,
      margin,
      y
    );
    y += 28;

    doc.setFillColor(245, 245, 247);
    doc.roundedRect(margin, y, 515, 60, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text(
      `Overall Score: ${sessionReport.overall_score}/100 — Verdict: ${sessionReport.recommendation}`,
      margin + 16,
      y + 24
    );

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    doc.text(
      doc.splitTextToSize(sessionReport.hiring_verdict_summary || "", 480),
      margin + 16,
      y + 44
    );
    y += 80;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text("Competency Breakdown", margin, y);
    y += 16;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    if (sessionReport.radar_scores) {
      Object.entries(sessionReport.radar_scores).forEach(([comp, sc]) => {
        doc.text(`${comp}: ${sc}%`, margin + 12, y);
        y += 14;
      });
    }
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Question Transcripts and Evaluations", margin, y);
    y += 18;

    answersHistory.forEach((ans, i) => {
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(`Question ${i + 1}: ${ans.question}`, margin + 12, y, { maxWidth: 485 });
      y += 18;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text(
        `Score: ${ans.score}/100 | Answer: "${ans.answer.slice(0, 140)}..."`,
        margin + 12,
        y,
        { maxWidth: 485 }
      );
      y += 24;
    });

    doc.save(`Interview_Assessment_${selectedCompany}_${selectedRole.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <main
      ref={containerRef}
      className="overflow-x-hidden w-full max-w-full bg-[#08090c] text-neutral-100 min-h-screen font-sans selection:bg-neutral-800 selection:text-neutral-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* PHASE 1: LOBBY & SETUP */}
        {phase === "lobby" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Attention / Cinematic Wide Hero */}
            <div className="text-center space-y-4 gsap-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/90 text-xs font-mono text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Simulation & Telemetry
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight max-w-5xl mx-auto leading-tight">
                {interviewMentor.heading}
              </h1>
              <p className="text-sm md:text-base text-neutral-400 max-w-3xl mx-auto leading-relaxed">
                {interviewMentor.subtitle}
              </p>
            </div>

              {/* Interview Pillar Navigation Tabs Below Title */}
              <nav className="flex items-center justify-center gap-2 overflow-x-auto pb-1 font-mono text-xs border-b border-neutral-800 pb-4">
                <Link
                  to="/app/interview"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-white text-black font-semibold shadow-sm"
                >
                  <BrainCog className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mock Interview</span>
                </Link>
                <Link
                  to="/app/hr-prep"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
                >
                  <Building className="w-3.5 h-3.5 text-neutral-400" />
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

            {/* Interest / Dense Gapless Bento Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 grid-flow-dense gsap-fade-in">
              {/* Target Company Card */}
              <div className="col-span-12 md:col-span-6 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6 space-y-3">
                <label className="text-xs uppercase tracking-wider font-mono text-neutral-400 flex items-center gap-2">
                  <Building className="w-4 h-4 text-neutral-300" />
                  Target Enterprise
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-neutral-500 transition"
                >
                  {TARGET_COMPANIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-500">
                  Calibrates evaluation criteria to target standards.
                </p>
              </div>

              {/* Target Role Card */}
              <div className="col-span-12 md:col-span-6 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6 space-y-3">
                <label className="text-xs uppercase tracking-wider font-mono text-neutral-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-300" />
                  Target Engineering Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-neutral-500 transition"
                >
                  {TARGET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-500">
                  Adjusts technical depth and domain expectations.
                </p>
              </div>

              {/* Round Type Card */}
              <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6 space-y-3">
                <label className="text-xs uppercase tracking-wider font-mono text-neutral-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-neutral-300" />
                  Interview Round Track
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-neutral-500 transition"
                >
                  <option value="Mixed">Mixed (System Architecture + Behavioral)</option>
                  <option value="HR">Behavioral & Leadership Principles (STAR)</option>
                  <option value="Technical">Technical Execution & Concepts</option>
                  <option value="System Design">System Design & Trade-offs</option>
                </select>
              </div>

              {/* Difficulty & Question Count */}
              <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-mono text-neutral-400 block mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3.5 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-neutral-500 transition"
                    >
                      <option value="Easy">Standard</option>
                      <option value="Medium">Intermediate</option>
                      <option value="Hard">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-mono text-neutral-400 block mb-2">
                      Question Count
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full px-3.5 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-neutral-500 transition"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={4}>4 Questions</option>
                      <option value={6}>6 Questions</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action / High Contrast Enter Button */}
              <div className="col-span-12 pt-2">
                <button
                  onClick={handleStartInterview}
                  disabled={evaluatingAnswer}
                  className="w-full py-4 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 active:scale-[0.99] transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {evaluatingAnswer
                    ? "Preparing Session..."
                    : "Start Mock Session"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: LIVE SIMULATED INTERVIEW ROOM */}
        {phase === "room" && questions.length > 0 && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Top Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 px-5 py-3 rounded-2xl gsap-fade-in">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-white">
                  {selectedCompany} • {selectedRole}
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-full font-mono">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    {Math.floor(timeRemaining / 60)}:
                    {(timeRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                <button
                  onClick={() => setAudioMuted(!audioMuted)}
                  className={`p-2 rounded-xl border transition ${
                    audioMuted
                      ? "bg-red-950/40 border-red-900 text-red-400"
                      : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white"
                  }`}
                  title={audioMuted ? "Unmute Interviewer Voice" : "Mute Interviewer Voice"}
                >
                  {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2-Column Split: AI Interviewer (Left) & Candidate Feed (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 grid-flow-dense">
              {/* LEFT: AI INTERVIEWER TERMINAL */}
              <div className="col-span-12 lg:col-span-6 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 gsap-fade-in">
                <div className="space-y-4">
                  {/* Interviewer State Header */}
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-mono text-xs font-bold">
                        AI
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Interviewer
                        </h3>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {interviewerSpeaking
                            ? "Speaking..."
                            : "Listening..."}
                        </span>
                      </div>
                    </div>

                    {interviewerSpeaking && (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-neutral-400 rounded-full animate-bounce" />
                        <span className="w-1 h-5 bg-neutral-200 rounded-full animate-bounce delay-100" />
                        <span className="w-1 h-2 bg-neutral-500 rounded-full animate-bounce delay-200" />
                      </div>
                    )}
                  </div>

                  {/* Question Container */}
                  <div className="bg-neutral-950 border border-neutral-800/90 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-mono uppercase tracking-wider">
                        {questions[currentIndex]?.category || "Technical & Behavioral"}
                      </span>
                      <span className="text-neutral-500 font-mono">
                        Level: {questions[currentIndex]?.difficulty || difficulty}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                      "{questions[currentIndex]?.question}"
                    </h2>

                    {questions[currentIndex]?.what_to_look_for && (
                      <div className="text-xs text-neutral-400 border-t border-neutral-900 pt-2.5 space-y-1">
                        <span className="text-neutral-300 font-semibold block">
                          Evaluation Criteria:
                        </span>
                        <p className="text-neutral-400">
                          {questions[currentIndex]?.what_to_look_for}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progressive Hint */}
                  {showHint && questions[currentIndex]?.star_tips && (
                    <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 space-y-1 gsap-fade-in">
                      <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                        STAR Guidance:
                      </span>
                      <p className="text-neutral-400 leading-relaxed font-mono text-[11px]">
                        {questions[currentIndex]?.star_tips}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                  <button
                    onClick={() => speakQuestion(questions[currentIndex]?.question)}
                    className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Replay Prompt
                  </button>

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {showHint ? "Hide Strategy Hint" : "Reveal Strategy Hint"}
                  </button>
                </div>
              </div>

              {/* RIGHT: CANDIDATE VIDEO FEED & TRANSCRIPTION WORKSPACE */}
              <div className="col-span-12 lg:col-span-6 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 gsap-fade-in">
                {/* Webcam Panel with HUD */}
                <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 aspect-video flex items-center justify-center">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-600 space-y-2">
                      <User className="w-10 h-10" />
                      <span className="text-xs font-mono">Video Stream Standby</span>
                    </div>
                  )}

                  {/* Telemetry HUD */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[11px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {postureStatus}
                    </span>
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[11px] font-mono text-neutral-300 border border-neutral-700">
                      Gaze Alignment: {eyeContactScore}%
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className="p-2 bg-black/70 hover:bg-black/90 backdrop-blur-md rounded-xl text-neutral-300 hover:text-white transition border border-neutral-800"
                    >
                      {cameraActive ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <VideoOff className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Candidate Response Workspace */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider font-mono text-neutral-400 flex items-center gap-2">
                      <span>Your Response</span>
                      {isRecordingAudio && (
                        <span className="text-[11px] text-red-400 animate-pulse font-mono">
                          Transcribing audio...
                        </span>
                      )}
                    </label>

                    <button
                      onClick={handleToggleAudioRecording}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                        isRecordingAudio
                          ? "bg-red-600 hover:bg-red-500 text-white"
                          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
                      }`}
                    >
                      {isRecordingAudio ? (
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
                    rows={4}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Speak or type your STAR response..."
                    className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition resize-none leading-relaxed"
                  />

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluatingAnswer || !currentAnswer.trim()}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      evaluatingAnswer || !currentAnswer.trim()
                        ? "bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800"
                        : "bg-white hover:bg-neutral-200 text-neutral-950 shadow-lg active:scale-[0.99]"
                    }`}
                  >
                    {evaluatingAnswer ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Evaluating response...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Submit Answer
                      </>
                    )}
                  </button>

                  {evalError && (
                    <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center justify-between gap-3 font-mono">
                      <span>{evalError}</span>
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg font-mono text-xs font-bold shrink-0 transition"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LIVE EVALUATION POPUP MODAL */}
            {liveFeedback && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto gsap-fade-in">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-white font-mono font-bold text-sm">
                        {liveFeedback.score}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Evaluation Feedback</h3>
                        <span className="text-xs text-neutral-400 font-mono">
                          Score: {liveFeedback.score}/100
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 text-xs rounded-full bg-neutral-950 text-neutral-300 border border-neutral-800 font-mono">
                      STAR: {liveFeedback.star_compliance?.score || 70}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Strengths & Areas to Improve */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Strengths
                        </span>
                        <ul className="text-xs text-neutral-300 space-y-0.5">
                          {liveFeedback.strengths?.slice(0, 3).map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
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
                          {liveFeedback.areas_for_improvement?.slice(0, 3).map((a, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-500">•</span>
                              <span className="line-clamp-2">{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Key Recommendation */}
                    <div className="p-3 bg-neutral-950/90 border border-neutral-800/80 rounded-xl flex items-start gap-2.5 text-xs text-neutral-300">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-neutral-200 block text-[11px] uppercase tracking-wider font-mono">
                          Key Recommendation:
                        </span>
                        <p className="text-neutral-300">
                          {liveFeedback.one_tip ||
                            liveFeedback.key_takeaway ||
                            "Anchor your answer in quantifiable metrics and end with the organizational impact."}
                        </p>
                      </div>
                    </div>

                    {/* Follow-up Question Probe */}
                    {liveFeedback.follow_up_question && (
                      <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-0.5">
                        <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                          <BrainCog className="w-3.5 h-3.5 text-neutral-400" />
                          Interviewer Follow-up:
                        </span>
                        <p className="text-xs text-neutral-300 italic">
                          "{liveFeedback.follow_up_question}"
                        </p>
                      </div>
                    )}

                    {/* Progressive Disclosure: Collapsible Model Answer */}
                    {liveFeedback.suggested_better_answer && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowLiveModelAnswer(!showLiveModelAnswer)}
                          className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{showLiveModelAnswer ? "Hide Model Answer" : "Show Model Answer"}</span>
                        </button>
                        {showLiveModelAnswer && (
                          <div className="mt-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                            <span className="text-xs font-semibold text-neutral-300">
                              Model Answer:
                            </span>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                              {liveFeedback.suggested_better_answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Modal Action */}
                  <div className="pt-3 border-t border-neutral-800 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <span>
                        {currentIndex + 1 < questions.length
                          ? "Next Question"
                          : "View Final Report"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {reportError && (
          <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-300 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono max-w-5xl mx-auto shadow-xl">
            <span>{reportError}</span>
            <button
              type="button"
              onClick={generateFinalReport}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl font-bold text-xs shrink-0 transition"
            >
              Retry Session Report Generation
            </button>
          </div>
        )}

        {/* PHASE 3: COMPREHENSIVE PERFORMANCE REPORT CARD */}
        {phase === "report" && sessionReport && (
          <div className="space-y-8 max-w-5xl mx-auto gsap-fade-in">
            {/* Header Verdict Card */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center shrink-0">
                    <span className="text-3xl font-black text-white leading-none font-mono">
                      {sessionReport.overall_score}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-1">/ 100</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl md:text-2xl font-bold text-white">
                        Interview Assessment Report
                      </h2>
                      <span className="px-3 py-0.5 text-xs font-bold rounded-full border bg-neutral-950 text-white border-neutral-700">
                        {sessionReport.recommendation}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-400 max-w-xl leading-relaxed">
                      {sessionReport.hiring_verdict_summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <button
                    onClick={handleDownloadReportPDF}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-200 text-neutral-950 rounded-xl text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => setPhase("lobby")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-medium border border-neutral-800 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start New Session
                  </button>
                </div>
              </div>

              {/* Competency Scores Bar Grid */}
              {sessionReport.radar_scores && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 border-t border-neutral-800">
                  {Object.entries(sessionReport.radar_scores).map(([comp, score]) => (
                    <div key={comp} className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-neutral-400 font-mono text-[11px]">{comp}</span>
                        <span className="font-bold text-white font-mono">{score}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-white transition-all duration-700"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strengths & Growth Areas Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 grid-flow-dense">
              <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Demonstrated Strengths
                </h3>
                <ul className="space-y-2">
                  {sessionReport.strengths?.map((s, idx) => (
                    <li key={idx} className="text-xs text-neutral-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {sessionReport.key_growth_areas?.map((g, idx) => (
                    <li key={idx} className="text-xs text-neutral-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question Transcript Breakdown */}
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-neutral-400" />
                Question Breakdown
              </h3>

              <div className="space-y-3">
                {answersHistory.map((ans, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950 border border-neutral-800/80 p-5 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded text-xs font-mono">
                          Item {idx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-white">{ans.question}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-white bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                        Score: {ans.score}/100
                      </span>
                    </div>

                    <div className="text-xs text-neutral-300 bg-neutral-900/50 p-3 rounded-lg border border-neutral-800/60 leading-relaxed">
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                        Candidate Response:
                      </span>
                      "{ans.answer}"
                    </div>

                    {ans.suggested_better_answer && (
                      <div className="text-xs text-neutral-400 bg-neutral-900/30 p-3 rounded-lg border border-neutral-800/40 leading-relaxed">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                          Suggested Model Answer:
                        </span>
                        "{ans.suggested_better_answer}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
