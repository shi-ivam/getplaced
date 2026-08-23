import React, { useState, useEffect, useRef, useMemo } from "react";
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
  BarChart2,
  Layers,
  Sliders,
  Activity,
  Zap,
  Target,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Award,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { PY_API_URL } from "@/config/api";
import { getInterviewMentorCopy } from "@/utils/dynamicCopy";
import GpBadge from "@/components/gp/GpBadge";
import GpButton from "@/components/gp/GpButton";
import GpCard from "@/components/gp/GpCard";

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
  // Navigation: 'lobby' | 'room' | 'report'
  const [phase, setPhase] = useState("lobby");

  // Setup Config
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [selectedRole, setSelectedRole] = useState("Full Stack Engineer");
  const [interviewType, setInterviewType] = useState("Mixed"); // 'Mixed', 'HR', 'Technical', 'System Design'
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
  const [copiedAnswerIndex, setCopiedAnswerIndex] = useState(null);

  const interviewMentor = useMemo(() => {
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
  const mediaStreamRef = useRef(null);

  // GSAP Animations on phase change
  useGSAP(
    () => {
      gsap.from(".gsap-fade-in", {
        opacity: 0,
        y: 18,
        duration: 0.45,
        stagger: 0.06,
        ease: "power2.out",
      });
    },
    { dependencies: [phase, currentIndex, liveFeedback], scope: containerRef }
  );

  // Initialize Speech Synthesis and Speech Recognition
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

      recognition.onend = () => {
        setIsRecordingAudio(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // WebCam stream management
  useEffect(() => {
    if (phase === "room" && cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          mediaStreamRef.current = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn("Camera permission not granted or unavailable:", err);
          setCameraActive(false);
        });
    } else if (!cameraActive && mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [phase, cameraActive]);

  // Handle Question Timer & Telemetry
  useEffect(() => {
    if (phase === "room" && !evaluatingAnswer && !liveFeedback) {
      setTimeRemaining(120);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Speak question when loaded
      if (questions[currentIndex] && !audioMuted) {
        speakQuestion(questions[currentIndex].question);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentIndex, questions, audioMuted, evaluatingAnswer, liveFeedback]);

  // Eye contact score subtle simulation
  useEffect(() => {
    if (phase === "room") {
      const interval = setInterval(() => {
        setEyeContactScore(Math.floor(91 + Math.random() * 6));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [phase]);

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
    setEvalError("");
    setReportError("");
    try {
      const res = await axios.post(`${PY_API_URL}/api/interview/generate-questions`, {
        company: selectedCompany,
        role: selectedRole,
        interview_type: interviewType,
        difficulty: difficulty,
        count: questionCount,
      });

      const fetchedQuestions = res.data.questions || [];
      if (fetchedQuestions.length === 0) {
        throw new Error("No questions returned by the simulation engine.");
      }
      setQuestions(fetchedQuestions);
      setCurrentIndex(0);
      setAnswersHistory([]);
      setCurrentAnswer("");
      setLiveFeedback(null);
      setShowLiveModelAnswer(false);
      setShowHint(false);
      setPhase("room");
    } catch (e) {
      console.error("Failed to generate questions:", e);
      setEvalError(e.response?.data?.detail || "Question generation failed. Please check backend connection.");
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
      const durationSeconds = Math.max(10, 120 - timeRemaining);
      const res = await axios.post(`${PY_API_URL}/api/interview/evaluate-answer`, {
        question: qObj.question,
        answer: currentAnswer,
        company: selectedCompany,
        role: selectedRole,
        interview_type: interviewType,
        audio_duration_seconds: durationSeconds,
      });

      const evaluation = res.data;
      const answeredItem = {
        questionId: qObj.id || currentIndex + 1,
        question: qObj.question,
        category: qObj.category || "General Engineering",
        answer: currentAnswer,
        score: evaluation.score || 75,
        technical_depth_score: evaluation.technical_depth_score || 75,
        overall_verdict: evaluation.overall_verdict || (evaluation.score >= 80 ? "Strong" : evaluation.score >= 60 ? "Passable" : "Needs Improvement"),
        communication: evaluation.communication || {},
        star_compliance: evaluation.star_compliance || evaluation.communication?.star_compliance || {},
        strengths: evaluation.strengths || [],
        areas_for_improvement: evaluation.areas_for_improvement || [],
        suggested_better_answer: evaluation.suggested_better_answer || evaluation.communication?.polished_version || "",
        follow_up_question: evaluation.follow_up_question || "",
      };

      const updatedHistory = [...answersHistory, answeredItem];
      setAnswersHistory(updatedHistory);
      setLiveFeedback(answeredItem);
      setShowLiveModelAnswer(false);
    } catch (e) {
      console.error("Failed to evaluate answer:", e);
      setEvalError(
        e.response?.data?.detail || "Answer evaluation failed. Please verify AI backend connection and retry."
      );
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    setLiveFeedback(null);
    setEvalError("");
    setShowHint(false);
    setShowLiveModelAnswer(false);
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
        answers: answersHistory,
      });
      setSessionReport(res.data);
      setPhase("report");
    } catch (e) {
      console.error("Failed to generate session report:", e);
      setReportError(
        e.response?.data?.detail || "Session report generation failed. Please verify connection and retry."
      );
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswerIndex(index);
    setTimeout(() => setCopiedAnswerIndex(null), 2000);
  };

  const handleDownloadReportPDF = () => {
    if (!sessionReport) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxContentWidth = pageWidth - margin * 2;
    let y = 40;

    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    // Header Banner
    doc.setFillColor(13, 4, 49); // #0D0431
    doc.roundedRect(margin, y, maxContentWidth, 64, 6, 6, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(254, 223, 106); // #FEDF6A
    doc.text("GetPlaced AI Mock Interview Assessment", margin + 16, y + 26);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text(
      `Enterprise: ${selectedCompany}   |   Role: ${selectedRole}   |   Round: ${interviewType}   |   Date: ${new Date().toLocaleDateString()}`,
      margin + 16,
      y + 48
    );
    y += 80;

    // Verdict Card
    doc.setFillColor(248, 248, 245);
    doc.setDrawColor(13, 4, 49);
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, maxContentWidth, 68, 6, 6, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(13, 4, 49);
    doc.text(
      `Overall Score: ${sessionReport.overall_score || 80}/100   —   Hiring Verdict: ${sessionReport.recommendation || "Hire"}`,
      margin + 16,
      y + 24
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 80);
    const verdictLines = doc.splitTextToSize(sessionReport.hiring_verdict_summary || "", maxContentWidth - 32);
    doc.text(verdictLines, margin + 16, y + 42);
    y += 82;

    // 5-Axis Competency Breakdown
    checkPageBreak(130);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(13, 4, 49);
    doc.text("5-Axis Competency Assessment", margin, y);
    y += 18;

    if (sessionReport.radar_scores) {
      const radarEntries = Object.entries(sessionReport.radar_scores);
      radarEntries.forEach(([comp, score]) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(13, 4, 49);
        doc.text(`${comp}:`, margin + 10, y);

        doc.setFont("helvetica", "normal");
        doc.text(`${score}%`, margin + 140, y);

        // Progress bar
        doc.setFillColor(226, 222, 236);
        doc.roundedRect(margin + 180, y - 8, 200, 8, 3, 3, "F");
        doc.setFillColor(13, 4, 49);
        doc.roundedRect(margin + 180, y - 8, (200 * Math.min(100, Math.max(0, score))) / 100, 8, 3, 3, "F");

        y += 16;
      });
    }
    y += 12;

    // Strengths & Growth Areas
    checkPageBreak(140);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(13, 4, 49);
    doc.text("Demonstrated Strengths:", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    (sessionReport.strengths || []).forEach((s) => {
      const lines = doc.splitTextToSize(`•  ${s}`, maxContentWidth - 20);
      checkPageBreak(lines.length * 12 + 4);
      doc.text(lines, margin + 10, y);
      y += lines.length * 12 + 4;
    });
    y += 8;

    checkPageBreak(140);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(13, 4, 49);
    doc.text("Key Growth Areas & Next Prep Steps:", margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    (sessionReport.key_growth_areas || []).forEach((g) => {
      const lines = doc.splitTextToSize(`•  ${g}`, maxContentWidth - 20);
      checkPageBreak(lines.length * 12 + 4);
      doc.text(lines, margin + 10, y);
      y += lines.length * 12 + 4;
    });
    y += 14;

    // Question-by-Question Transcript Breakdown
    checkPageBreak(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(13, 4, 49);
    doc.text("Question-by-Question Transcripts & Evaluations", margin, y);
    y += 18;

    answersHistory.forEach((ans, i) => {
      checkPageBreak(120);
      doc.setFillColor(242, 240, 250);
      doc.roundedRect(margin, y, maxContentWidth, 24, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(13, 4, 49);
      doc.text(`Question ${i + 1}: ${ans.category ? `[${ans.category}] ` : ""}${ans.question}`, margin + 10, y + 16, {
        maxWidth: maxContentWidth - 100,
      });
      doc.text(`Score: ${ans.score}/100`, maxContentWidth + margin - 75, y + 16);
      y += 32;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text("Candidate Answer:", margin + 10, y);
      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 30, 30);
      const ansLines = doc.splitTextToSize(`"${ans.answer}"`, maxContentWidth - 20);
      checkPageBreak(ansLines.length * 11 + 10);
      doc.text(ansLines, margin + 10, y);
      y += ansLines.length * 11 + 10;

      if (ans.suggested_better_answer) {
        checkPageBreak(60);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(100, 60, 180);
        doc.text("Suggested Model Answer:", margin + 10, y);
        y += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);
        const modelLines = doc.splitTextToSize(`"${ans.suggested_better_answer}"`, maxContentWidth - 20);
        checkPageBreak(modelLines.length * 11 + 14);
        doc.text(modelLines, margin + 10, y);
        y += modelLines.length * 11 + 14;
      }
      y += 8;
    });

    doc.save(`GetPlaced_Interview_Assessment_${selectedCompany}_${selectedRole.replace(/\s+/g, "_")}.pdf`);
  };

  const wordCount = useMemo(() => {
    return currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  }, [currentAnswer]);

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[#FEF9CF] u-background-grid-yellow text-[#0D0431] overflow-x-hidden w-full font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* TOP HERO SECTION */}
        <div className="text-center space-y-4">
          <GpBadge theme="light-purple" dot={true}>
            AI Video Mock Interview Simulator
          </GpBadge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-[#0D0431] tracking-tight max-w-5xl mx-auto leading-tight">
            {interviewMentor.heading}
          </h1>
          <p className="text-sm md:text-base text-[#0D0431]/80 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
            {interviewMentor.subtitle}
          </p>
        </div>

        {/* GLOBAL SUB-NAVIGATION BAR */}
        <nav className="flex items-center justify-center gap-3 overflow-x-auto pb-2 font-sans text-xs">
          <Link
            to="/app/interview"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap bg-[#0D0431] text-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] transition-all"
          >
            <BrainCog className="w-4 h-4 text-[#FEDF6A]" />
            <span>Mock Interview Simulator</span>
          </Link>
          <Link
            to="/app/hr-prep"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap bg-white text-[#0D0431] hover:bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] transition-all"
          >
            <Building className="w-4 h-4 text-[#896EE2]" />
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

        {/* PHASE 1: LOBBY & CONFIGURATION */}
        {phase === "lobby" && (
          <div className="space-y-8 max-w-4xl mx-auto gsap-fade-in">
            {/* Configuration Box */}
            <div className="bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="space-y-1 pb-4 border-b-2 border-[#0D0431]">
                <h2 className="text-xl font-heading font-black text-[#0D0431]">
                  Configure Simulation Chamber
                </h2>
                <p className="text-xs sm:text-sm text-[#0D0431]/70">
                  Select employer benchmarks, technical domain depth, round focus, and question count.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                {/* 1. Target Enterprise */}
                <div className="space-y-2 bg-[#FEF9CF]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl p-4">
                  <label className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#896EE2]" />
                    Target Enterprise
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full bg-white border-2 border-[#0D0431] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  >
                    {TARGET_COMPANIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#0D0431]/70 font-medium">
                    Calibrates evaluation criteria to target hiring bars.
                  </p>
                </div>

                {/* 2. Target Role */}
                <div className="space-y-2 bg-[#FEF9CF]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl p-4">
                  <label className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#896EE2]" />
                    Target Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-white border-2 border-[#0D0431] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  >
                    {TARGET_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#0D0431]/70 font-medium">
                    Adjusts technical depth and domain expectations.
                  </p>
                </div>

                {/* 3. Round Track */}
                <div className="space-y-2 bg-[#FEF9CF]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl p-4">
                  <label className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#896EE2]" />
                    Round Track
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full bg-white border-2 border-[#0D0431] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  >
                    <option value="Mixed">Mixed (Architecture + Behavioral)</option>
                    <option value="HR">Behavioral & Leadership (STAR)</option>
                    <option value="Technical">Technical Execution & Concepts</option>
                    <option value="System Design">System Design & Scalability</option>
                  </select>
                  <p className="text-[11px] text-[#0D0431]/70 font-medium">
                    Sets question distribution and rubric focus.
                  </p>
                </div>

                {/* 4. Difficulty */}
                <div className="space-y-2 bg-[#FEF9CF]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl p-4">
                  <label className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#896EE2]" />
                    Difficulty Tier
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white border-2 border-[#0D0431] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  >
                    <option value="Easy">Easy (Foundation Check)</option>
                    <option value="Medium">Medium (Standard SDE)</option>
                    <option value="Hard">Hard (Tier-1 Super Dream)</option>
                  </select>
                  <p className="text-[11px] text-[#0D0431]/70 font-medium">
                    Adjusts algorithmic & architectural complexity.
                  </p>
                </div>

                {/* 5. Question Count */}
                <div className="space-y-2 bg-[#FEF9CF]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl p-4 sm:col-span-2 lg:col-span-2">
                  <label className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#896EE2]" />
                    Questions in Session
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { count: 3, label: "3 Questions", duration: "~6 mins" },
                      { count: 4, label: "4 Questions", duration: "~10 mins" },
                      { count: 6, label: "6 Questions", duration: "~15 mins" },
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setQuestionCount(item.count)}
                        className={`p-2.5 rounded-xl border-2 font-sans transition-all text-center cursor-pointer ${
                          questionCount === item.count
                            ? "bg-[#FEDF6A] text-[#0D0431] border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] font-bold"
                            : "bg-white text-[#0D0431]/70 border-[#0D0431] hover:bg-[#FEF9CF]"
                        }`}
                      >
                        <div className="text-xs font-heading font-black">{item.label}</div>
                        <div className="text-[10px] opacity-75 font-mono">{item.duration}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Mentor Guidance Tip */}
              <div className="bg-[#E4CDFB]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-[#896EE2] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider block">
                    Mentor Strategy Note:
                  </span>
                  <p className="text-xs sm:text-sm text-[#0D0431]/80 leading-relaxed font-medium">
                    {interviewMentor.mentorTip}
                  </p>
                </div>
              </div>

              {evalError && (
                <div className="p-4 bg-[#FFE8E5] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl text-xs text-[#C7382B] font-bold flex items-center justify-between gap-3 font-mono">
                  <span>{evalError}</span>
                  <button
                    type="button"
                    onClick={handleStartInterview}
                    className="px-3 py-1.5 bg-[#C7382B] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Start Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={evaluatingAnswer}
                  className="w-full py-4 bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] font-heading font-black text-base rounded-2xl border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[2px_2px_0_0_#0D0431] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 fill-current text-[#0D0431]" />
                  <span>
                    {evaluatingAnswer
                      ? "Calibrating Simulation Chamber..."
                      : `Start Live Mock Interview (${questionCount} Questions)`}
                  </span>
                </button>
              </div>
            </div>

            {/* Simulation Highlights Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                  <Video className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-heading font-black text-[#0D0431]">
                  Live Video & Telemetry
                </h3>
                <p className="text-xs text-[#0D0431]/75 leading-relaxed">
                  Real-time posture and gaze alignment indicators while you articulate engineering concepts.
                </p>
              </div>

              <div className="bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-heading font-black text-[#0D0431]">
                  Multi-Axis AI Grading
                </h3>
                <p className="text-xs text-[#0D0431]/75 leading-relaxed">
                  Instant STAR compliance, technical depth verification, filler word metrics, and follow-up probes.
                </p>
              </div>

              <div className="bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] rounded-2xl p-5 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-heading font-black text-[#0D0431]">
                  Executive Report & PDF
                </h3>
                <p className="text-xs text-[#0D0431]/75 leading-relaxed">
                  Comprehensive 5-axis competency score card with itemized transcripts ready to export.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: LIVE SIMULATED INTERVIEW ROOM */}
        {phase === "room" && questions.length > 0 && (
          <div className="space-y-6 max-w-6xl mx-auto gsap-fade-in">
            {/* Top Status & Cockpit Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] px-6 py-4 rounded-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#0D7A68] animate-pulse" />
                <span className="font-heading font-black text-sm text-[#0D0431]">
                  {selectedCompany} • {selectedRole}
                </span>
                <GpBadge theme="light-purple">{interviewType} Track</GpBadge>
                <span className="px-3 py-1 bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] rounded-full text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                {/* Timer Pill */}
                <div
                  className={`px-3.5 py-1.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center gap-2 font-bold ${
                    timeRemaining < 30
                      ? "bg-[#FFE8E5] text-[#C7382B] animate-pulse"
                      : "bg-[#FEF9CF] text-[#0D0431]"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {Math.floor(timeRemaining / 60)}:
                    {(timeRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                {/* TTS Mute Toggle */}
                <button
                  type="button"
                  onClick={() => setAudioMuted(!audioMuted)}
                  className={`p-2 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer ${
                    audioMuted
                      ? "bg-[#FFE8E5] text-[#C7382B]"
                      : "bg-white hover:bg-[#FEF9CF] text-[#0D0431]"
                  }`}
                  title={audioMuted ? "Unmute Interviewer Voice" : "Mute Interviewer Voice"}
                >
                  {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Exit Session Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to exit this mock interview session?")) {
                      setPhase("lobby");
                    }
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-[#FFE8E5] text-[#C7382B] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* 2-Column Split: AI Interviewer (Left) & Candidate Stream (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: AI INTERVIEWER TERMINAL */}
              <div className="col-span-12 lg:col-span-6 bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] rounded-3xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  {/* Interviewer State Header */}
                  <div className="flex items-center justify-between border-b-2 border-[#0D0431] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center font-heading font-black text-xs text-[#0D0431]">
                        AI
                      </div>
                      <div>
                        <h3 className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider">
                          AI Lead Interviewer
                        </h3>
                        <span className="text-[11px] text-[#0D0431]/70 font-mono font-bold">
                          {interviewerSpeaking ? "Speaking Prompt..." : "Awaiting Candidate Response..."}
                        </span>
                      </div>
                    </div>

                    {interviewerSpeaking && (
                      <div className="flex items-center gap-1 bg-[#D4FDF7] border-2 border-[#0D0431] px-2.5 py-1 rounded-full shadow-[2px_2px_0_0_#0D0431]">
                        <span className="w-1 h-3 bg-[#0D0431] rounded-full animate-bounce" />
                        <span className="w-1 h-5 bg-[#0D0431] rounded-full animate-bounce delay-100" />
                        <span className="w-1 h-2 bg-[#0D0431] rounded-full animate-bounce delay-200" />
                      </div>
                    )}
                  </div>

                  {/* Question Container */}
                  <div className="bg-[#FEF9CF]/50 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431] bg-[#FEDF6A] px-2.5 py-0.5 rounded-full border-2 border-[#0D0431]">
                        {questions[currentIndex]?.category || "Engineering Focus"}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#0D0431]/70">
                        Tier: {questions[currentIndex]?.difficulty || difficulty}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-heading font-black text-[#0D0431] leading-snug">
                      "{questions[currentIndex]?.question}"
                    </h2>

                    {(questions[currentIndex]?.what_to_look_for || questions[currentIndex]?.why_asked) && (
                      <div className="text-xs text-[#0D0431]/80 border-t-2 border-[#0D0431]/20 pt-3 space-y-1">
                        <span className="text-xs font-heading font-black text-[#0D0431] block uppercase tracking-wider">
                          Interviewer Evaluation Criteria:
                        </span>
                        <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans">
                          {questions[currentIndex]?.what_to_look_for || questions[currentIndex]?.why_asked}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Strategy Hint Accordion */}
                  {showHint && questions[currentIndex]?.star_tips && (
                    <div className="p-4 bg-[#E4CDFB]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl text-xs text-[#0D0431] space-y-1.5 gsap-fade-in">
                      <span className="font-heading font-black text-[#0D0431] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <HelpCircle className="w-4 h-4 text-[#896EE2]" />
                        STAR Guidance Tip:
                      </span>
                      <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                        {questions[currentIndex]?.star_tips}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-[#0D0431] text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => speakQuestion(questions[currentIndex]?.question)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-xl font-bold transition-all cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#896EE2]" />
                    Replay Prompt
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-xl font-bold transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#896EE2]" />
                    {showHint ? "Hide Hint" : "Reveal Strategy Hint"}
                  </button>
                </div>
              </div>

              {/* RIGHT: CANDIDATE VIDEO FEED & TRANSCRIPTION WORKSPACE */}
              <div className="col-span-12 lg:col-span-6 bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] rounded-3xl p-6 flex flex-col justify-between space-y-5">
                {/* Webcam Panel with HUD */}
                <div className="relative rounded-2xl overflow-hidden bg-[#0D0431] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] aspect-video flex items-center justify-center">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/60 space-y-2">
                      <User className="w-12 h-12 text-[#FEDF6A]" />
                      <span className="text-xs font-mono font-bold text-white/80">
                        Camera Stream Standby
                      </span>
                    </div>
                  )}

                  {/* Telemetry HUD Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#0D0431]/80 backdrop-blur-md rounded-lg text-[11px] font-mono font-bold text-[#D4FDF7] border border-[#D4FDF7]/40 flex items-center gap-1.5 shadow">
                      <span className="w-2 h-2 rounded-full bg-[#0D7A68] animate-pulse" />
                      {postureStatus}
                    </span>
                    <span className="px-2.5 py-1 bg-[#0D0431]/80 backdrop-blur-md rounded-lg text-[11px] font-mono font-bold text-[#FEDF6A] border border-[#FEDF6A]/40 shadow">
                      Gaze: {eyeContactScore}%
                    </span>
                  </div>

                  {/* Camera Toggle Button */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      type="button"
                      onClick={() => setCameraActive(!cameraActive)}
                      className="p-2 bg-[#0D0431]/80 hover:bg-[#0D0431] backdrop-blur-md rounded-xl text-white transition border border-white/20 shadow cursor-pointer"
                      title={cameraActive ? "Turn Camera Off" : "Turn Camera On"}
                    >
                      {cameraActive ? (
                        <Video className="w-4 h-4 text-white" />
                      ) : (
                        <VideoOff className="w-4 h-4 text-[#FFC5B7]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Candidate Response Workspace */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-2 uppercase tracking-wider">
                      <span>Candidate Response</span>
                      {isRecordingAudio && (
                        <span className="text-[11px] text-[#C7382B] animate-pulse font-mono font-bold">
                          Transcribing Voice...
                        </span>
                      )}
                    </label>

                    <button
                      type="button"
                      onClick={handleToggleAudioRecording}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer ${
                        isRecordingAudio
                          ? "bg-[#FFE8E5] text-[#C7382B] animate-pulse"
                          : "bg-[#FEF9CF] hover:bg-[#FEDF6A] text-[#0D0431]"
                      }`}
                    >
                      {isRecordingAudio ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-[#0D0431]" />
                          Record Voice
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Speak using microphone or type your response here using the STAR method (Situation, Task, Action, Result)..."
                    className="w-full p-3.5 bg-[#F8F8F5] border-2 border-[#0D0431] rounded-2xl text-xs sm:text-sm text-[#0D0431] placeholder-[#6F6A80] focus:outline-none focus:bg-white focus:shadow-[2px_2px_0_0_#0D0431] transition-all resize-none leading-relaxed font-sans"
                  />

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#0D0431]/70 px-1">
                    <span>{wordCount} words drafted</span>
                    <span>Aim for 120-180 words for structured impact</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={evaluatingAnswer || !currentAnswer.trim()}
                    className={`w-full py-3.5 rounded-2xl font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:shadow-[1px_1px_0_0_#0D0431] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer ${
                      evaluatingAnswer || !currentAnswer.trim()
                        ? "bg-[#E2DEEC] text-[#6F6A80] cursor-not-allowed border-[#0D0431]"
                        : "bg-[#0D0431] hover:bg-[#17103D] text-white"
                    }`}
                  >
                    {evaluatingAnswer ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-[#FEDF6A]" />
                        <span>Evaluating Technical & STAR Depth...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#FEDF6A]" />
                        <span>Submit Answer for Evaluation</span>
                      </>
                    )}
                  </button>

                  {evalError && (
                    <div className="p-3.5 bg-[#FFE8E5] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl text-xs text-[#C7382B] flex items-center justify-between gap-3 font-mono font-bold">
                      <span>{evalError}</span>
                      <button
                        type="button"
                        onClick={handleSubmitAnswer}
                        className="px-3 py-1.5 bg-[#C7382B] text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
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
              <div className="fixed inset-0 bg-[#0D0431]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border-3 border-[#0D0431] shadow-[8px_8px_0_0_#0D0431] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[88vh] overflow-y-auto gsap-fade-in">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b-2 border-[#0D0431] pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex flex-col items-center justify-center text-[#0D0431] font-mono font-black text-base shrink-0">
                        <span>{liveFeedback.score}</span>
                        <span className="text-[9px] leading-none opacity-70">/100</span>
                      </div>
                      <div>
                        <h3 className="text-base font-heading font-black text-[#0D0431]">
                          Question Evaluation Feedback
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono font-bold text-[#0D0431]/70">
                            Verdict:
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border-2 border-[#0D0431] ${
                              liveFeedback.overall_verdict === "Strong"
                                ? "bg-[#D4FDF7] text-[#0D0431]"
                                : liveFeedback.overall_verdict === "Passable"
                                ? "bg-[#FEDF6A] text-[#0D0431]"
                                : "bg-[#FFC5B7] text-[#0D0431]"
                            }`}
                          >
                            {liveFeedback.overall_verdict}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs rounded-full bg-[#E4CDFB] text-[#0D0431] border-2 border-[#0D0431] font-mono font-bold shadow-[2px_2px_0_0_#0D0431]">
                        STAR: {liveFeedback.star_compliance?.score || 75}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* STAR Compliance Checklist */}
                    <div className="bg-[#FEF9CF]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl p-3.5 space-y-2">
                      <span className="text-[11px] font-heading font-black uppercase tracking-wider text-[#0D0431] block">
                        STAR Framework Compliance:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        {[
                          { key: "situation_detected", label: "Situation" },
                          { key: "task_detected", label: "Task" },
                          { key: "action_detected", label: "Action" },
                          { key: "result_detected", label: "Result" },
                        ].map((pillar) => {
                          const detected = liveFeedback.star_compliance?.[pillar.key];
                          return (
                            <div
                              key={pillar.key}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 border-[#0D0431] text-[11px] font-bold ${
                                detected
                                  ? "bg-[#D4FDF7] text-[#0D0431]"
                                  : "bg-[#FFE8E5] text-[#C7382B]"
                              }`}
                            >
                              {detected ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D7A68]" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-[#C7382B]" />
                              )}
                              <span>{pillar.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Strengths & Areas to Improve Bento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-3.5 bg-[#D4FDF7]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl space-y-1.5">
                        <span className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-[#0D7A68]" />
                          Demonstrated Strengths
                        </span>
                        <ul className="text-xs text-[#0D0431]/80 space-y-1 font-sans">
                          {liveFeedback.strengths?.slice(0, 3).map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#0D7A68] font-bold">•</span>
                              <span className="leading-snug">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 bg-[#FFE8E5]/60 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl space-y-1.5">
                        <span className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4 text-[#C7382B]" />
                          Areas for Growth
                        </span>
                        <ul className="text-xs text-[#0D0431]/80 space-y-1 font-sans">
                          {liveFeedback.areas_for_improvement?.slice(0, 3).map((a, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#C7382B] font-bold">•</span>
                              <span className="leading-snug">{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Dynamic Follow-up Challenge Question */}
                    {liveFeedback.follow_up_question && (
                      <div className="p-3.5 bg-[#FEDF6A]/40 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl space-y-1">
                        <span className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5 uppercase tracking-wider">
                          <BrainCog className="w-4 h-4 text-[#896EE2]" />
                          Interviewer Follow-up Probe:
                        </span>
                        <p className="text-xs text-[#0D0431] italic font-serif">
                          "{liveFeedback.follow_up_question}"
                        </p>
                      </div>
                    )}

                    {/* Collapsible Model Answer */}
                    {liveFeedback.suggested_better_answer && (
                      <div className="pt-1 space-y-2">
                        <button
                          type="button"
                          onClick={() => setShowLiveModelAnswer(!showLiveModelAnswer)}
                          className="text-xs font-heading font-black text-[#896EE2] hover:text-[#0D0431] flex items-center gap-1 cursor-pointer underline"
                        >
                          <span>
                            {showLiveModelAnswer
                              ? "Hide Exemplary Model Answer"
                              : "Show Exemplary Model Answer"}
                          </span>
                          {showLiveModelAnswer ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {showLiveModelAnswer && (
                          <div className="p-4 bg-[#F8F8F5] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] rounded-2xl space-y-1.5 gsap-fade-in">
                            <span className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider">
                              Exemplary STAR Model Answer:
                            </span>
                            <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans">
                              {liveFeedback.suggested_better_answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-4 border-t-2 border-[#0D0431] flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] rounded-2xl text-xs sm:text-sm font-heading font-black border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:shadow-[1px_1px_0_0_#0D0431] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <span>
                        {currentIndex + 1 < questions.length
                          ? "Next Question"
                          : "Complete Session & Generate Report"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {reportError && (
          <div className="p-4 bg-[#FFE8E5] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] rounded-2xl text-xs text-[#C7382B] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono font-bold max-w-5xl mx-auto">
            <span>{reportError}</span>
            <button
              type="button"
              onClick={generateFinalReport}
              className="px-4 py-2 bg-[#C7382B] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
            >
              Retry Session Report Generation
            </button>
          </div>
        )}

        {/* PHASE 3: COMPREHENSIVE PERFORMANCE REPORT CARD */}
        {phase === "report" && sessionReport && (
          <div className="space-y-8 max-w-6xl mx-auto gsap-fade-in">
            {/* Header Verdict Bento Card */}
            <div className="bg-white border-2 border-[#0D0431] shadow-[6px_6px_0_0_#0D0431] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-22 h-22 rounded-3xl bg-[#FEDF6A] border-3 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] flex flex-col items-center justify-center shrink-0">
                    <span className="text-3xl font-heading font-black text-[#0D0431] leading-none">
                      {sessionReport.overall_score || 82}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#0D0431]/70 mt-1">
                      / 100
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-heading font-black text-[#0D0431]">
                        Interview Assessment Report
                      </h2>
                      <span
                        className={`px-3.5 py-1 text-xs font-heading font-black rounded-full border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] uppercase tracking-wider ${
                          (sessionReport.recommendation || "").toLowerCase().includes("hire") &&
                          !(sessionReport.recommendation || "").toLowerCase().includes("no")
                            ? "bg-[#D4FDF7] text-[#0D0431]"
                            : "bg-[#FFC5B7] text-[#0D0431]"
                        }`}
                      >
                        {sessionReport.recommendation || "Hire"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#0D0431]/80 max-w-xl leading-relaxed font-sans font-medium">
                      {sessionReport.hiring_verdict_summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadReportPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0D0431] hover:bg-[#17103D] text-white rounded-xl text-xs font-heading font-bold border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:shadow-[1px_1px_0_0_#0D0431] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#FEDF6A]" />
                    Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase("lobby")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#FEF9CF] text-[#0D0431] rounded-xl text-xs font-heading font-bold border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] hover:shadow-[1px_1px_0_0_#0D0431] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start New Session
                  </button>
                </div>
              </div>

              {/* 5-Axis Competency Scores Bar Grid */}
              {sessionReport.radar_scores && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 border-t-2 border-[#0D0431]">
                  {Object.entries(sessionReport.radar_scores).map(([comp, score]) => (
                    <div
                      key={comp}
                      className="bg-[#FEF9CF]/60 p-4 rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-[11px] text-[#0D0431]">{comp}</span>
                        <span className="text-[#0D0431]">{score}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2.5 border border-[#0D0431] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0D0431] transition-all duration-700"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strengths & Growth Areas & Next Steps Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Demonstrated Strengths */}
              <div className="bg-[#D4FDF7]/50 border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] rounded-3xl p-6 space-y-3">
                <h3 className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D7A68]" />
                  Demonstrated Strengths
                </h3>
                <ul className="space-y-2 text-xs font-sans text-[#0D0431]/80">
                  {sessionReport.strengths?.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A68] mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-[#FFE8E5]/70 border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] rounded-3xl p-6 space-y-3">
                <h3 className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#C7382B]" />
                  Key Growth Areas
                </h3>
                <ul className="space-y-2 text-xs font-sans text-[#0D0431]/80">
                  {sessionReport.key_growth_areas?.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C7382B] mt-1.5 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Preparation Steps */}
              <div className="bg-[#E4CDFB]/40 border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] rounded-3xl p-6 space-y-3">
                <h3 className="text-xs font-heading font-black text-[#0D0431] uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#896EE2]" />
                  Next Preparation Steps
                </h3>
                <ul className="space-y-2 text-xs font-sans text-[#0D0431]/80">
                  {(sessionReport.next_prep_steps || [
                    "Practice structuring answers into concise 90-second blocks.",
                    "Quantify system scale, throughput, and business metrics.",
                    "Review top employer principles in the Company Frameworks tab.",
                  ]).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#896EE2] mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question-by-Question Transcript Breakdown */}
            <div className="bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0D0431]">
                <h3 className="text-sm sm:text-base font-heading font-black text-[#0D0431] uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#896EE2]" />
                  Question Transcript & Model Answer Breakdown
                </h3>
                <span className="text-xs font-mono font-bold text-[#0D0431]/70">
                  {answersHistory.length} Items Evaluated
                </span>
              </div>

              <div className="space-y-4">
                {answersHistory.map((ans, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FEF9CF]/40 border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] p-5 sm:p-6 rounded-2xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] rounded-full text-xs font-mono font-bold shadow-[1px_1px_0_0_#0D0431]">
                          Item {idx + 1}
                        </span>
                        <h4 className="text-sm font-heading font-black text-[#0D0431]">
                          {ans.question}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#0D0431] bg-white px-3 py-1 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] self-start sm:self-auto">
                        Score: {ans.score}/100
                      </span>
                    </div>

                    <div className="bg-white border-2 border-[#0D0431] p-4 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0D0431]/70 block">
                        Candidate Response:
                      </span>
                      <p className="text-xs text-[#0D0431] leading-relaxed font-sans">
                        "{ans.answer}"
                      </p>
                    </div>

                    {ans.suggested_better_answer && (
                      <div className="bg-[#E4CDFB]/30 border-2 border-[#0D0431] p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0D0431] block">
                            Suggested Exemplary Model Answer:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(ans.suggested_better_answer, idx)}
                            className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#896EE2] hover:text-[#0D0431] cursor-pointer"
                          >
                            {copiedAnswerIndex === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#0D7A68]" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-[#0D0431]/90 leading-relaxed font-sans">
                          "{ans.suggested_better_answer}"
                        </p>
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
