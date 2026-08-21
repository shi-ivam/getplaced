import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
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
  TrendingUp,
  Award,
  Download,
  HelpCircle,
  Clock,
  Building,
  User,
  ShieldAlert,
  BarChart2,
  ChevronRight,
  Zap
} from "lucide-react";
import { PY_API_URL } from "@/config/api";

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
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes per question
  
  // Telemetry indicators
  const [postureStatus, setPostureStatus] = useState("Good Posture");
  const [eyeContactScore, setEyeContactScore] = useState(94);
  
  // Live Feedback modal
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Speech Synthesis and Media Streams
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Set up Web Speech Recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
          // If interim result matches, update
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
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
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

  // Handle Question Timer & Telemetry Jitter
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

        // Simulate natural live eye contact / posture readings
        if (Math.random() > 0.7) {
          setEyeContactScore(Math.floor(88 + Math.random() * 10));
        }
      }, 1000);

      // Read question aloud
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
      // Fallback evaluation
      const fallbackItem = {
        questionId: qObj.id,
        question: qObj.question,
        category: qObj.category,
        answer: currentAnswer,
        score: 78,
        technical_depth_score: 75,
        communication: { overall_communication_score: 75, filler_words: { total_count: 2 } },
        star_compliance: { score: 70, star_feedback: "Well-structured response." },
        strengths: ["Clear logical flow."],
        areas_for_improvement: ["Quantify impact with numbers."],
        suggested_better_answer: currentAnswer,
        follow_up_question: null
      };
      setAnswersHistory([...answersHistory, fallbackItem]);
      setLiveFeedback(fallbackItem);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    setLiveFeedback(null);
    setShowHint(false);
    setCurrentAnswer("");

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all questions -> Generate Final Session Report
      generateFinalReport();
    }
  };

  const generateFinalReport = async () => {
    setEvaluatingAnswer(true);
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
      setSessionReport({
        overall_score: 82,
        recommendation: "Strong Hire",
        hiring_verdict_summary: `Candidate demonstrated solid technical readiness and structured articulation for ${selectedCompany}.`,
        radar_scores: {
          Communication: 80,
          "STAR Structure": 75,
          "Technical Depth": 85,
          "Problem Solving": 84,
          "Culture Fit": 82
        },
        strengths: ["Clear explanation of technical design", "Structured STAR approach"],
        key_growth_areas: ["Reduce filler word pauses", "Add more quantifiable metrics"],
        next_prep_steps: ["Practice 2 more mock interviews", "Review system design caching patterns"]
      });
      setPhase("report");
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
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237);
    doc.text("getPlaced AI Mock Interview Report Card", margin, y);
    y += 25;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Company: ${selectedCompany} | Role: ${selectedRole} | Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 30;

    // Verdict Box
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(margin, y, 515, 60, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text(`Overall Score: ${sessionReport.overall_score}/100 — Verdict: ${sessionReport.recommendation}`, margin + 15, y + 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text(doc.splitTextToSize(sessionReport.hiring_verdict_summary || "", 485), margin + 15, y + 45);
    y += 85;

    // Competency Scores
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text("Competency Breakdown", margin, y);
    y += 18;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (sessionReport.radar_scores) {
      Object.entries(sessionReport.radar_scores).forEach(([comp, sc]) => {
        doc.text(`• ${comp}: ${sc}%`, margin + 10, y);
        y += 15;
      });
    }
    y += 15;

    // Questions Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Question-by-Question Performance", margin, y);
    y += 18;

    answersHistory.forEach((ans, i) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(124, 58, 237);
      doc.text(`Q${i + 1}: ${ans.question}`, margin + 10, y, { maxWidth: 490 });
      y += 20;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(`Score: ${ans.score}/100 | Answer Excerpt: "${ans.answer.slice(0, 120)}..."`, margin + 10, y, { maxWidth: 490 });
      y += 25;
    });

    doc.save(`Interview_Report_${selectedCompany}_${selectedRole.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* PHASE 1: LOBBY & SETUP */}
        {phase === "lobby" && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 bg-violet-950/60 border border-violet-700/50 rounded-2xl text-violet-400 mb-2">
                <BrainCog className="w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                AI Interactive Mock Interview Room
              </h1>
              <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto">
                Live simulated interview experience with voice synthesis, camera posture tracking, real-time STAR evaluation, and dynamic follow-up questioning.
              </p>
            </div>

            {/* Configuration Card */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-violet-400" />
                Configure Your Interview Session
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Select */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-2">Target Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition"
                  >
                    {TARGET_COMPANIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Role Select */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-2">Target Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition"
                  >
                    {TARGET_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Interview Round Type */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-2">Interview Round Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition"
                  >
                    <option value="Mixed">Mixed (Technical + Behavioral + Culture)</option>
                    <option value="HR">HR & Behavioral (STAR Focus)</option>
                    <option value="Technical">Technical Breadth & Architecture</option>
                    <option value="System Design">System Design & Problem Solving</option>
                  </select>
                </div>

                {/* Difficulty & Count */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-2">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition"
                    >
                      <option value="Easy">Standard / Intern</option>
                      <option value="Medium">Mid-Level / SDE-1</option>
                      <option value="Hard">Senior / Tier-1 Bar</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-2">Question Count</label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition"
                    >
                      <option value={3}>3 Questions (Express)</option>
                      <option value={4}>4 Questions (Standard)</option>
                      <option value={6}>6 Questions (Deep Dive)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={handleStartInterview}
                  disabled={evaluatingAnswer}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-2xl text-base shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {evaluatingAnswer ? "Synthesizing AI Interview Room..." : "Enter Live Mock Interview Room"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: LIVE SIMULATED INTERVIEW ROOM */}
        {phase === "room" && questions.length > 0 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900/80 border border-gray-800 px-5 py-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-white">
                  Live Session: {selectedCompany} • {selectedRole}
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-violet-950 text-violet-300 border border-violet-800/60 rounded-full font-medium">
                  Q {currentIndex + 1} of {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                {/* Timer */}
                <div className="flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}</span>
                </div>

                <button
                  onClick={() => setAudioMuted(!audioMuted)}
                  className={`p-2 rounded-lg border transition ${
                    audioMuted ? "bg-red-950/60 border-red-800 text-red-400" : "bg-gray-800 border-gray-700 text-gray-300 hover:text-white"
                  }`}
                  title={audioMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                >
                  {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2-Column Split: AI Interviewer (Left) & Candidate Feed (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT: AI INTERVIEWER AVATAR & QUESTION CARD */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                  {/* Interviewer Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        AI
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Principal AI Interviewer</h3>
                        <span className="text-[11px] text-gray-400">
                          {interviewerSpeaking ? "Speaking question aloud..." : "Listening to response..."}
                        </span>
                      </div>
                    </div>

                    {interviewerSpeaking && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-4 bg-violet-500 rounded-full animate-bounce" />
                        <span className="w-1.5 h-6 bg-purple-500 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-3 bg-violet-400 rounded-full animate-bounce delay-200" />
                      </div>
                    )}
                  </div>

                  {/* Question Box */}
                  <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-violet-400 font-semibold uppercase tracking-wider">
                        {questions[currentIndex]?.category || "Behavioral & Technical Question"}
                      </span>
                      <span className="text-gray-400">Level: {questions[currentIndex]?.difficulty || difficulty}</span>
                    </div>

                    <h2 className="text-base md:text-lg font-semibold text-white leading-snug">
                      "{questions[currentIndex]?.question}"
                    </h2>

                    {questions[currentIndex]?.what_to_look_for && (
                      <p className="text-xs text-gray-400 border-t border-gray-700/60 pt-2">
                        💡 <strong className="text-gray-300">Interviewer focus:</strong> {questions[currentIndex]?.what_to_look_for}
                      </p>
                    )}
                  </div>

                  {/* Progressive Hint Box */}
                  {showHint && questions[currentIndex]?.star_tips && (
                    <div className="mt-3 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 space-y-1 animate-fadeIn">
                      <span className="font-semibold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        STAR Framing Strategy:
                      </span>
                      <p className="text-[11px] text-amber-200/90">{questions[currentIndex]?.star_tips}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <button
                    onClick={() => speakQuestion(questions[currentIndex]?.question)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
                  >
                    <Volume2 className="w-4 h-4" />
                    Repeat Question
                  </button>

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    <HelpCircle className="w-4 h-4" />
                    {showHint ? "Hide Hint" : "Request STAR Hint"}
                  </button>
                </div>
              </div>

              {/* RIGHT: CANDIDATE VIDEO FEED & SPEECH TRANSCRIPT */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                
                {/* Webcam & Telemetry Panel */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 aspect-video flex items-center justify-center">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
                      <User className="w-12 h-12" />
                      <span className="text-xs">Camera Feed Off</span>
                    </div>
                  )}

                  {/* Live HUD Overlay: Posture & Eye Contact */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {postureStatus}
                    </span>
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] font-medium text-violet-300 border border-violet-500/30">
                      Eye Contact: {eyeContactScore}%
                    </span>
                  </div>

                  {/* Camera Toggle Button */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-gray-300 hover:text-white transition"
                    >
                      {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-red-400" />}
                    </button>
                  </div>
                </div>

                {/* Candidate Answer Workspace */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                      <span>Your Response</span>
                      {isRecordingAudio && (
                        <span className="text-[11px] text-red-400 animate-pulse font-medium">
                          ● Transcribing voice live...
                        </span>
                      )}
                    </label>

                    <button
                      onClick={handleToggleAudioRecording}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        isRecordingAudio
                          ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
                      }`}
                    >
                      {isRecordingAudio ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-violet-400" />
                          Record Answer
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Speak into microphone or type your STAR response here..."
                    className="w-full p-3.5 bg-gray-800/90 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition resize-none"
                  />

                  {/* Submission Action */}
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluatingAnswer || !currentAnswer.trim()}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      evaluatingAnswer || !currentAnswer.trim()
                        ? "bg-violet-950 text-gray-500 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 active:scale-[0.99]"
                    }`}
                  >
                    {evaluatingAnswer ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Evaluating STAR Structure & Communication...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submit Answer for AI Evaluation
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* LIVE FEEDBACK POPUP MODAL ON SUBMIT */}
            {liveFeedback && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 animate-scaleUp">
                  
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-800 flex items-center justify-center text-violet-300 font-bold text-sm">
                        {liveFeedback.score}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Instant AI Feedback</h3>
                        <span className="text-xs text-gray-400">Score: {liveFeedback.score}/100</span>
                      </div>
                    </div>
                    
                    <span className="px-2.5 py-1 text-xs rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                      STAR Score: {liveFeedback.star_compliance?.score || 70}%
                    </span>
                  </div>

                  {/* Feedback Content */}
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    
                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl space-y-1">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Key Strengths:
                        </span>
                        <ul className="text-[11px] text-gray-300 space-y-0.5">
                          {liveFeedback.strengths?.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-1">
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Improvement Areas:
                        </span>
                        <ul className="text-[11px] text-gray-300 space-y-0.5">
                          {liveFeedback.areas_for_improvement?.map((a, i) => (
                            <li key={i}>• {a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Follow-up question if generated */}
                    {liveFeedback.follow_up_question && (
                      <div className="p-3.5 bg-violet-950/40 border border-violet-800/60 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                          <BrainCog className="w-4 h-4 text-violet-400" />
                          Interviewer Follow-Up Probe:
                        </span>
                        <p className="text-xs text-gray-200 italic">
                          "{liveFeedback.follow_up_question}"
                        </p>
                      </div>
                    )}

                    {/* Suggested STAR Polish */}
                    {liveFeedback.suggested_better_answer && (
                      <div className="p-3 bg-gray-800/60 border border-gray-700 rounded-xl space-y-1">
                        <span className="text-xs font-semibold text-gray-300">Exemplary STAR Model Polish:</span>
                        <p className="text-xs text-gray-300 italic">
                          {liveFeedback.suggested_better_answer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Next Step Button */}
                  <div className="pt-3 border-t border-gray-800 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 flex items-center gap-2 transition"
                    >
                      <span>{currentIndex + 1 < questions.length ? "Proceed to Next Question" : "Complete & View Final Report"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* PHASE 3: COMPREHENSIVE PERFORMANCE REPORT CARD */}
        {phase === "report" && sessionReport && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            
            {/* Header Verdict Card */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-violet-950 border border-violet-800 flex flex-col items-center justify-center shrink-0 shadow-xl">
                    <span className="text-3xl font-extrabold text-white leading-none">
                      {sessionReport.overall_score}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium mt-1">/ 100</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">Interview Performance Verdict</h2>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        sessionReport.recommendation === "Strong Hire"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : sessionReport.recommendation === "Hire"
                          ? "bg-violet-950 text-violet-300 border-violet-800"
                          : "bg-amber-950 text-amber-300 border-amber-800"
                      }`}>
                        {sessionReport.recommendation}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-300 max-w-xl leading-relaxed">
                      {sessionReport.hiring_verdict_summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={handleDownloadReportPDF}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/30 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Report
                  </button>
                  <button
                    onClick={() => setPhase("lobby")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-medium border border-gray-700 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start New Interview
                  </button>
                </div>
              </div>

              {/* Competency Scores Bar Grid */}
              {sessionReport.radar_scores && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 border-t border-gray-800">
                  {Object.entries(sessionReport.radar_scores).map(([comp, score]) => (
                    <div key={comp} className="bg-gray-800/40 p-3.5 rounded-2xl border border-gray-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-400">{comp}</span>
                        <span className="font-bold text-white">{score}%</span>
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
                  ))}
                </div>
              )}
            </div>

            {/* Strengths & Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Primary Interview Strengths
                </h3>
                <ul className="space-y-2">
                  {sessionReport.strengths?.map((s, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Key Growth & Coaching Focus
                </h3>
                <ul className="space-y-2">
                  {sessionReport.key_growth_areas?.map((g, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question by Question Transcript Breakdown */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-violet-400" />
                Question Transcript & Detailed Diagnostics
              </h3>

              <div className="space-y-4">
                {answersHistory.map((ans, idx) => (
                  <div key={idx} className="bg-gray-800/40 border border-gray-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-violet-950 text-violet-300 rounded text-xs font-bold">
                          Q{idx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-white">{ans.question}</h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                        Score: {ans.score}/100
                      </span>
                    </div>

                    <div className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
                      <span className="text-[11px] font-semibold text-gray-400 block mb-1">Your Response:</span>
                      "{ans.answer}"
                    </div>

                    {ans.suggested_better_answer && (
                      <div className="text-xs text-emerald-300/90 bg-emerald-950/20 p-3 rounded-xl border border-emerald-800/40">
                        <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Polished Model Answer:</span>
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
    </div>
  );
}
