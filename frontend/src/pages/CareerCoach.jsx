import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Check,
  Github,
  Code2,
  Loader2,
  X,
  Edit3,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  FileText,
  Upload,
  Sparkles,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Send,
  Target,
  Layers,
  Terminal,
  Activity,
} from "lucide-react";
import { NODE_API_URL, PY_API_URL } from "@/config/api";
import MarkdownRenderer from "@/components/coach/MarkdownRenderer";
import ToolExecutionAccordion from "@/components/coach/ToolExecutionAccordion";
import ActionCard from "@/components/coach/ActionCard";

const STEPS_MAP = [
  { step: 1, label: "Ambition" },
  { step: 2, label: "Academics" },
  { step: 3, label: "Resume" },
  { step: 4, label: "GitHub" },
  { step: 5, label: "LeetCode" },
  { step: 6, label: "Skills" },
  { step: 7, label: "Roadmap" },
];

export default function CareerCoach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chips, setChips] = useState([]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState({});
  const [collectedData, setCollectedData] = useState({});
  const [connectedProfiles, setConnectedProfiles] = useState({});
  const [discoveredProjects, setDiscoveredProjects] = useState([]);
  const [evidenceSkills, setEvidenceSkills] = useState([]);
  const [readinessSnapshot, setReadinessSnapshot] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [applyingProfile, setApplyingProfile] = useState(false);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState("chat");

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const recognitionRef = useRef(null);

  // Unmount cleanup for Voice & TTS
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Escape key to close any active modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowVtopModal(false);
        setShowGhModal(false);
        setShowLcModal(false);
        setShowResumeModal(false);
        setShowEditModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // VTOP connect states
  const [showVtopModal, setShowVtopModal] = useState(false);
  const [vtopUsername, setVtopUsername] = useState("");
  const [vtopPassword, setVtopPassword] = useState("");
  const [vtopCaptchaText, setVtopCaptchaText] = useState("");
  const [vtopCaptchaImage, setVtopCaptchaImage] = useState("");
  const [vtopSessionId, setVtopSessionId] = useState("");
  const [vtopLoading, setVtopLoading] = useState(false);
  const [vtopLoadingCaptcha, setVtopLoadingCaptcha] = useState(false);
  const [vtopError, setVtopError] = useState("");

  // Quick connect states
  const [showGhModal, setShowGhModal] = useState(false);
  const [ghInput, setGhInput] = useState("");
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");

  const [showLcModal, setShowLcModal] = useState(false);
  const [lcInput, setLcInput] = useState("");
  const [lcLoading, setLcLoading] = useState(false);
  const [lcError, setLcError] = useState("");

  // Resume upload states
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeSuccessData, setResumeSuccessData] = useState(null);

  // Edit Inferred Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    targetCompany: "",
    targetJobRole: "",
    cgpa: "",
    graduationYear: "",
    college: "",
    degree: "",
  });

  const chatScrollRef = useRef(null);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#10b981", "#06b6d4", "#6366f1", "#ffffff"],
      });
    } catch (e) {
      // non-fatal
    }
  };

  const handleUploadResumeDirect = async (fileToUpload) => {
    const file = fileToUpload || resumeFile;
    if (!file || resumeUploading) return;
    setResumeUploading(true);
    setResumeError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_description", extractedProfile?.targetJobRole || "");

      const pyRes = await axios.post(`${PY_API_URL}/api/resume/analyze-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const analysisResult = pyRes.data?.evaluation || pyRes.data?.data || pyRes.data;
      const extractedText = pyRes.data?.extracted_text || analysisResult?.extracted_text || "";

      const saveRes = await axios.post(
        `${NODE_API_URL}/api/coach/save-resume-analysis`,
        {
          resumeScore: analysisResult.ats_score,
          resumeText: extractedText,
          resumeAnalysis: analysisResult,
          filename: file.name,
        },
        { withCredentials: true }
      );

      if (saveRes.data) {
        syncSessionData(saveRes.data);
      }
      setResumeSuccessData(analysisResult);
      triggerCelebration();
    } catch (err) {
      console.error("Failed to upload/analyze resume:", err);
      setResumeError(err.response?.data?.detail || err.message || "Failed to analyze resume with Google GENAI");
    } finally {
      setResumeUploading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  const syncSessionData = (data) => {
    if (!data) return;
    setMessages(data.messages || []);
    setOnboardingStep(data.onboardingStep || 1);
    setIsCompleted(Boolean(data.isCompleted));
    setExtractedProfile(data.extractedProfile || {});
    setCollectedData(data.collectedData || {});
    setConnectedProfiles(data.connectedProfiles || {});
    setDiscoveredProjects(data.discoveredProjects || []);
    setEvidenceSkills(data.evidenceSkills || []);
    if (data.readinessSnapshot) setReadinessSnapshot(data.readinessSnapshot);
    if (data.profileCompletion !== undefined) setProfileCompletion(data.profileCompletion);

    if (data.chips && data.chips.length > 0) {
      setChips(data.chips);
    } else {
      const lastMsg = data.messages?.[data.messages.length - 1];
      if (lastMsg && lastMsg.chips) {
        setChips(lastMsg.chips);
      }
    }

    setEditForm({
      targetCompany: data.extractedProfile?.targetCompany || "",
      targetJobRole: data.extractedProfile?.targetJobRole || "",
      cgpa: data.extractedProfile?.cgpa ?? "",
      graduationYear: data.extractedProfile?.graduationYear ?? "",
      college: data.extractedProfile?.college || "",
      degree: data.extractedProfile?.degree || "",
    });
  };

  useEffect(() => {
    const initCoachSession = async () => {
      try {
        const res = await axios.get(`${NODE_API_URL}/api/coach/session`, {
          withCredentials: true,
        });
        if (res.data) {
          syncSessionData(res.data);
        }
      } catch (err) {
        console.warn("Could not init coach session from backend:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initCoachSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || "";
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Speech init error:", e.message);
      setIsListening(false);
    }
  };

  // Text-to-Speech (TTS)
  const handleSpeakText = (text, idx) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMsgIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*`_~-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgIdx(null);
    utterance.onerror = () => setSpeakingMsgIdx(null);

    setSpeakingMsgIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || sending) return;

    const trimmed = text.trim();

    const tempUserMsg = { sender: "user", text: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage("");
    setChips([]);
    setSending(true);

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/coach/message`,
        { message: trimmed },
        { withCredentials: true }
      );
      if (res.data) {
        syncSessionData(res.data);
      }
    } catch (err) {
      console.error("Could not send message to coach:", err);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to reset the getPlacedAI conversation?")) return;
    try {
      const res = await axios.post(`${NODE_API_URL}/api/coach/clear-chat`, {}, { withCredentials: true });
      if (res.data?.session) {
        syncSessionData(res.data.session);
      }
    } catch (err) {
      console.warn("Could not clear chat:", err.message);
    }
  };

  const handleConnectGitHubDirect = async (e) => {
    e?.preventDefault();
    if (!ghInput.trim() || ghLoading) return;
    setGhLoading(true);
    setGhError("");
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/coach/connect-github`,
        { username: ghInput.trim() },
        { withCredentials: true }
      );
      setShowGhModal(false);
      setGhInput("");
      if (res.data?.session) {
        syncSessionData(res.data.session);
      } else {
        const sessionRes = await axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true });
        if (sessionRes.data) syncSessionData(sessionRes.data);
      }
      triggerCelebration();
    } catch (err) {
      console.error("GitHub connect error:", err);
      setGhError(err.response?.data?.message || "Failed to retrieve GitHub profile.");
    } finally {
      setGhLoading(false);
    }
  };

  const handleConnectLeetCodeDirect = async (e) => {
    e?.preventDefault();
    if (!lcInput.trim() || lcLoading) return;
    setLcLoading(true);
    setLcError("");
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/coach/connect-leetcode`,
        { username: lcInput.trim() },
        { withCredentials: true }
      );
      setShowLcModal(false);
      setLcInput("");
      if (res.data?.session) {
        syncSessionData(res.data.session);
      } else {
        const sessionRes = await axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true });
        if (sessionRes.data) syncSessionData(sessionRes.data);
      }
      triggerCelebration();
    } catch (err) {
      console.error("LeetCode connect error:", err);
      setLcError(err.response?.data?.message || "Failed to retrieve LeetCode profile.");
    } finally {
      setLcLoading(false);
    }
  };

  const fetchLiveVtopCaptcha = async (currentSessionId = null) => {
    try {
      setVtopLoadingCaptcha(true);
      setVtopError("");
      setVtopCaptchaText("");
      const activeSess = currentSessionId || vtopSessionId;
      const url = activeSess
        ? `${NODE_API_URL}/api/vtop/live-captcha?sessionId=${encodeURIComponent(activeSess)}`
        : `${NODE_API_URL}/api/vtop/live-captcha`;

      const res = await axios.get(url, { withCredentials: true });
      if (res.data?.success && res.data.captchaImage) {
        setVtopCaptchaImage(res.data.captchaImage);
        setVtopSessionId(res.data.sessionId);
      } else {
        setVtopError(res.data?.error || "Could not fetch dynamic captcha from VTOP.");
      }
    } catch (err) {
      console.warn("Failed to fetch live captcha from VTOP:", err);
      setVtopError(err.response?.data?.error || "Could not load live captcha from VTOP portal.");
    } finally {
      setVtopLoadingCaptcha(false);
    }
  };

  const handleOpenVtopModal = () => {
    setShowVtopModal(true);
    setVtopError("");
    fetchLiveVtopCaptcha();
  };

  const handleConnectVtopDirect = async (e) => {
    e?.preventDefault();
    if (!vtopUsername.trim() || vtopLoading) return;
    setVtopLoading(true);
    setVtopError("");

    try {
      const payload = vtopPassword && vtopCaptchaText
        ? {
            username: vtopUsername.trim(),
            password: vtopPassword.trim(),
            captchaStr: vtopCaptchaText.trim(),
            sessionId: vtopSessionId,
          }
        : {
            regNo: vtopUsername.trim(),
          };

      const res = await axios.post(
        `${NODE_API_URL}/api/coach/connect-vtop`,
        payload,
        { withCredentials: true }
      );

      if (res.data?.success) {
        setShowVtopModal(false);
        setVtopPassword("");
        setVtopCaptchaText("");
        if (res.data?.session) {
          syncSessionData(res.data.session);
        } else {
          const sessionRes = await axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true });
          if (sessionRes.data) syncSessionData(sessionRes.data);
        }
        triggerCelebration();
      } else {
        setVtopError(res.data?.error || "VTOP sync failed. Please verify credentials.");
        if (res.data?.newCaptchaImage) {
          setVtopCaptchaImage(res.data.newCaptchaImage);
          if (res.data.sessionId) setVtopSessionId(res.data.sessionId);
        } else {
          fetchLiveVtopCaptcha(vtopSessionId);
        }
      }
    } catch (err) {
      console.error("VTOP connect error:", err);
      setVtopError(err.response?.data?.error || err.response?.data?.message || "Failed to authenticate with VTOP.");
      fetchLiveVtopCaptcha(vtopSessionId);
    } finally {
      setVtopLoading(false);
    }
  };

  const handleSaveProfileEdits = async (e) => {
    e?.preventDefault();
    setShowEditModal(false);
    const updated = {
      ...extractedProfile,
      ...editForm,
    };
    setExtractedProfile(updated);
    try {
      await axios.post(
        `${NODE_API_URL}/api/coach/apply-profile`,
        { extractedProfile: updated },
        { withCredentials: true }
      );
      const sessionRes = await axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true });
      if (sessionRes.data) syncSessionData(sessionRes.data);
      triggerCelebration();
    } catch (err) {
      console.error("Failed to save edited profile:", err);
    }
  };

  const handleApplyProfile = async () => {
    setApplyingProfile(true);
    try {
      await axios.post(
        `${NODE_API_URL}/api/coach/apply-profile`,
        { extractedProfile },
        { withCredentials: true }
      );
      navigate("/app/roadmap");
    } catch (err) {
      console.error("Failed to apply profile:", err);
      navigate("/app/roadmap");
    } finally {
      setApplyingProfile(false);
    }
  };

  const handleFinalizeAndEnterDashboard = async () => {
    setApplyingProfile(true);
    try {
      await axios.post(
        `${NODE_API_URL}/api/coach/apply-profile`,
        { extractedProfile },
        { withCredentials: true }
      );
      navigate("/app?onboarding=complete");
    } catch (err) {
      console.error("Failed to apply profile:", err);
      navigate("/app");
    } finally {
      setApplyingProfile(false);
    }
  };

  const isVtopConnected = Boolean(connectedProfiles?.vtop?.connected || extractedProfile?.vtopConnected);
  const isGhConnected = Boolean(connectedProfiles?.github?.connected);
  const isLcConnected = Boolean(connectedProfiles?.leetcode?.connected);

  const progressPercent = isCompleted
    ? 100
    : Math.min(100, Math.max(profileCompletion || 0, Math.round((onboardingStep / STEPS_MAP.length) * 100)));

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col justify-between">
      
      {/* 1. TOP EDITORIAL NAVIGATION BAR WITH PROGRESS BAR */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur sticky top-0 z-30 flex flex-col">
        {/* Top Progress Bar Strip */}
        <div className="w-full h-1 bg-zinc-900 overflow-hidden relative">
          <div
            className="h-full bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              get<span className="text-emerald-400">Placed</span>
            </span>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Career Coach</span>
            </div>
          </div>

          {/* Minimal Progress Sequence */}
          <nav aria-label="Onboarding Progress" className="hidden md:flex items-center gap-1.5">
            {STEPS_MAP.map((s, idx) => {
              const isPast = onboardingStep > s.step || isCompleted;
              const isCurrent = onboardingStep === s.step && !isCompleted;
              return (
                <div key={s.step} className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      isCurrent
                        ? "bg-zinc-100 text-zinc-950 font-semibold"
                        : isPast
                        ? "bg-zinc-900 text-zinc-300 border border-zinc-800"
                        : "text-zinc-600"
                    }`}
                  >
                    0{s.step} {s.label}
                  </span>
                  {idx < STEPS_MAP.length - 1 && <span className="text-zinc-800 text-[10px]">·</span>}
                </div>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleClearChat}
              title="Reset Conversation"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-900 transition-colors flex items-center gap-1 font-mono cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileActiveTab((prev) => (prev === "chat" ? "telemetry" : "chat"))}
              className="lg:hidden px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer font-mono flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{mobileActiveTab === "chat" ? "Profile" : "Chat"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-900 transition-colors flex items-center gap-1.5 font-mono cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Target</span>
            </button>

            <button
              type="button"
              onClick={handleFinalizeAndEnterDashboard}
              className="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1 cursor-pointer shrink-0 font-mono"
            >
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONVERSATIONAL WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col items-stretch gap-3">
        {/* Mobile View Switcher (Visible on < lg screens) */}
        <div className="lg:hidden flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => setMobileActiveTab("chat")}
            className={`flex-1 py-2 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActiveTab === "chat"
                ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Coach</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab("telemetry")}
            className={`flex-1 py-2 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActiveTab === "telemetry"
                ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Profile ({profileCompletion}%)</span>
          </button>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Full Interactive Chat Feed (8 cols on lg) */}
        <div className={`${mobileActiveTab === "chat" ? "flex" : "hidden lg:flex"} lg:col-span-8 flex-col h-[calc(100vh-160px)] min-h-[500px] bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm`}>
          
          {/* Subtle status header */}
          <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Career Coach</span>
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
              <span>Analysis Active</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">{profileCompletion}% complete</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 font-sans">
            {messages.map((msg, idx) => {
              const isCoach = msg.sender === "coach";
              const toolCalls = msg.metadata?.toolCalls || [];
              const actionCards = msg.metadata?.actionCards || [];
              const modelUsed = msg.metadata?.modelUsed || "";

              return (
                <div
                  key={idx}
                  className={`flex gap-3.5 ${isCoach ? "items-start" : "items-end justify-end"}`}
                >
                  {isCoach && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5 shadow-sm">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[90%] rounded-2xl px-5 py-4 ${
                      isCoach
                        ? "bg-zinc-900/50 border border-zinc-800/80 text-zinc-200 shadow-sm"
                        : "bg-zinc-100 text-zinc-950 font-medium"
                    }`}
                  >
                    {isCoach && toolCalls.length > 0 && (
                      <ToolExecutionAccordion toolCalls={toolCalls} modelUsed={modelUsed} />
                    )}

                    {isCoach ? (
                      <div>
                        <MarkdownRenderer content={msg.text} />

                        {actionCards && actionCards.length > 0 && (
                          <div className="mt-4 space-y-2 pt-3 border-t border-zinc-800/60">
                            {actionCards.map((card, cIdx) => (
                              <ActionCard key={cIdx} url={card.url} customTitle={card.label} />
                            ))}
                          </div>
                        )}

                        <div className="mt-3 pt-2 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSpeakText(msg.text, idx)}
                            className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            {speakingMsgIdx === idx ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-mono">Playing</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Speak</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line text-sm">{msg.text}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-400 flex items-center gap-2.5 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Analyzing context and preparing response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick-Select Suggestion Chips */}
          {chips && chips.length > 0 && (
            <div className="px-5 py-2.5 bg-zinc-950 border-t border-zinc-800/60 flex flex-wrap items-center gap-2">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="text-xs px-3 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors text-left font-sans cursor-pointer flex items-center gap-1.5"
                >
                  <span>{chip}</span>
                </button>
              ))}
            </div>
          )}

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2.5"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? "Listening..." : "Dictate via Microphone"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder="Ask about target requirements, benchmark gaps, preparation advice..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sending}
              className="flex-1 bg-zinc-900 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 px-3.5 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 transition-all font-sans"
            />

            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm font-mono"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Candidate Telemetry & Evidence Ledger (4 cols on lg) */}
        <aside
          className={`${
            mobileActiveTab === "telemetry" ? "block" : "hidden lg:block"
          } lg:col-span-4 space-y-4`}
        >
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-sm">
            
            {/* Ledger Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                  Candidate Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-[11px] text-zinc-400 hover:text-white font-mono underline cursor-pointer"
              >
                Edit Target
              </button>
            </div>

            {/* Target Ambition Badge */}
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500 uppercase tracking-wider">Target Benchmark</span>
                <span className="text-emerald-400 font-semibold">
                  {readinessSnapshot?.targetBenchmark || 80}/100 Goal
                </span>
              </div>
              <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {extractedProfile?.targetCompany || "Google"} · {extractedProfile?.targetJobRole || "Software Engineer"}
                </span>
              </div>
            </div>

            {/* Readiness Score Breakdown (if available) */}
            {readinessSnapshot && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-400">Readiness Score</span>
                  <span className="text-sm font-bold text-zinc-100">
                    {readinessSnapshot.overallScore} / 100
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(5, readinessSnapshot.overallScore || 0))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Status: {readinessSnapshot.statusLabel || "Active"}</span>
                  <span>Gap: {Math.max(0, (readinessSnapshot.targetBenchmark || 80) - (readinessSnapshot.overallScore || 0))} pts</span>
                </div>
              </div>
            )}

            {/* Evidence Connections */}
            <div className="pt-3 border-t border-zinc-800 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Connected Accounts
              </span>

              {/* VTOP Academics */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-zinc-300 block truncate">VTOP Academics</span>
                    {isVtopConnected && (
                      <span className="text-[10px] text-zinc-500 font-mono block truncate">
                        {connectedProfiles?.vtop?.cgpa || extractedProfile?.cgpa} CGPA · {connectedProfiles?.vtop?.regNo || extractedProfile?.vtopRegNo || "Verified"}
                      </span>
                    )}
                  </div>
                </div>
                {isVtopConnected ? (
                  <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenVtopModal}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors shrink-0 cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-300">GitHub</span>
                </div>
                {isGhConnected ? (
                  <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    @{connectedProfiles?.github?.username}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowGhModal(true)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* LeetCode */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-300">LeetCode</span>
                </div>
                {isLcConnected ? (
                  <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    @{connectedProfiles?.leetcode?.username}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLcModal(true)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* AI Resume ATS */}
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-zinc-200 block truncate font-medium">Resume ATS</span>
                      {connectedProfiles?.resume?.score || extractedProfile?.resumeScore ? (
                        <span className="text-[10px] text-zinc-400 font-mono block truncate">
                          ATS Score: {connectedProfiles?.resume?.score || extractedProfile?.resumeScore}/100
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono block truncate">
                          Not uploaded yet
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResumeModal(true)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{connectedProfiles?.resume?.score || extractedProfile?.resumeScore ? "Re-upload" : "Upload"}</span>
                  </button>
                </div>

                {(connectedProfiles?.resume?.score || extractedProfile?.resumeScore) && (
                  <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Analyzed
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/app/resume")}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Resume Details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <button
                type="button"
                onClick={handleFinalizeAndEnterDashboard}
                disabled={applyingProfile}
                className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {applyingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleApplyProfile}
                className="w-full py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Roadmap</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </aside>
        </div>
      </main>

      {/* VTOP Connect Modal */}
      {showVtopModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVtopModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">Connect VTOP</h3>
              </div>
              <button type="button" onClick={() => setShowVtopModal(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {vtopError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{vtopError}</span>
              </div>
            )}

            <form onSubmit={handleConnectVtopDirect} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="Enter Registration Number"
                  value={vtopUsername}
                  onChange={(e) => setVtopUsername(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block">
                  VTOP Password
                </label>
                <input
                  type="password"
                  placeholder="Enter VTOP password"
                  value={vtopPassword}
                  onChange={(e) => setVtopPassword(e.target.value)}
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-400 font-mono">
                    Captcha
                  </label>
                  <button
                    type="button"
                    onClick={() => fetchLiveVtopCaptcha()}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${vtopLoadingCaptcha ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {vtopCaptchaImage && (
                  <div className="mb-2 p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center">
                    <img
                      src={`data:image/png;base64,${vtopCaptchaImage}`}
                      alt="VTOP Captcha"
                      className="h-10 rounded object-contain"
                    />
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Enter captcha text"
                  value={vtopCaptchaText}
                  onChange={(e) => setVtopCaptchaText(e.target.value)}
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 font-mono uppercase"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVtopModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vtopLoading || !vtopUsername}
                  className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {vtopLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify VTOP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GitHub Connect Modal */}
      {showGhModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGhModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">Connect GitHub</h3>
              </div>
              <button type="button" onClick={() => setShowGhModal(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {ghError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{ghError}</span>
              </div>
            )}

            <form onSubmit={handleConnectGitHubDirect} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block">
                  GitHub Username or URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. torvalds or https://github.com/torvalds"
                  value={ghInput}
                  onChange={(e) => setGhInput(e.target.value)}
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGhModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ghLoading || !ghInput.trim()}
                  className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {ghLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Link GitHub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LeetCode Connect Modal */}
      {showLcModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLcModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">Connect LeetCode</h3>
              </div>
              <button type="button" onClick={() => setShowLcModal(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {lcError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{lcError}</span>
              </div>
            )}

            <form onSubmit={handleConnectLeetCodeDirect} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block">
                  LeetCode Username or URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. neetcode or https://leetcode.com/neetcode"
                  value={lcInput}
                  onChange={(e) => setLcInput(e.target.value)}
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLcModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lcLoading || !lcInput.trim()}
                  className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {lcLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Link LeetCode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      {showResumeModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResumeModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Upload Resume</h3>
              </div>
              <button type="button" onClick={() => setShowResumeModal(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {resumeError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{resumeError}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center p-6 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                <span className="text-xs text-zinc-300 font-medium font-mono">
                  {resumeFile ? resumeFile.name : "Select PDF Document (Max 10MB)"}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-1">
                  Evaluated for ATS keyword match and structure
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadResumeDirect()}
                  disabled={resumeUploading || !resumeFile}
                  className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {resumeUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Analyze Resume"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Inferred Profile Modal */}
      {showEditModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">Edit Target & Profile</h3>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdits} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Target Company</label>
                <input
                  type="text"
                  value={editForm.targetCompany}
                  onChange={(e) => setEditForm({ ...editForm, targetCompany: e.target.value })}
                  placeholder="e.g. Google, Microsoft, Amazon"
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Target Role</label>
                <input
                  type="text"
                  value={editForm.targetJobRole}
                  onChange={(e) => setEditForm({ ...editForm, targetJobRole: e.target.value })}
                  placeholder="e.g. Software Development Engineer"
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                    placeholder="e.g. 8.85"
                    className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={editForm.graduationYear}
                    onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
                    placeholder="e.g. 2026"
                    className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold font-mono cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

