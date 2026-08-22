import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
} from "lucide-react";
import { NODE_API_URL, PY_API_URL } from "@/config/api";

const STEPS_MAP = [
  { step: 1, label: "Target" },
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

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || sending) return;

    const trimmed = text.trim();

    if (trimmed.toLowerCase().includes("dashboard")) {
      handleFinalizeAndEnterDashboard();
      return;
    }
    if (trimmed.toLowerCase().includes("connect vtop") || trimmed.toLowerCase().includes("sync with vtop")) {
      handleOpenVtopModal();
      return;
    }
    if (trimmed.toLowerCase().includes("roadmap")) {
      handleApplyProfile();
      return;
    }
    if (trimmed.toLowerCase().includes("dossier")) {
      if (extractedProfile?.targetCompany) {
        navigate(`/app/company-intel?company=${encodeURIComponent(extractedProfile.targetCompany)}`);
      } else {
        navigate("/app/company-intel");
      }
      return;
    }

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
            className="h-full bg-gradient-to-r from-zinc-400 via-zinc-200 to-white transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              get<span className="text-zinc-400">Placed</span>
            </span>
            <span className="text-zinc-700">/</span>
            <span className="text-xs text-zinc-400 font-mono">Placement Setup</span>
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
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
              {progressPercent}% Complete
            </span>
            <button
              type="button"
              onClick={() => setShowSummaryDrawer(!showSummaryDrawer)}
              className="lg:hidden px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-900 transition-colors"
            >
              Profile Data
            </button>
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-900 transition-colors flex items-center gap-1.5 font-mono"
            >
              <Edit3 className="w-3 h-3" />
              <span className="hidden sm:inline">Edit Info</span>
            </button>
            <button
              type="button"
              onClick={handleFinalizeAndEnterDashboard}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONVERSATIONAL WORKSPACE */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Center: Clean Chat Feed (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Subtle status header */}
          <div className="px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-300 font-medium">Placement Advisor</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {profileCompletion}% complete
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {messages.map((msg, idx) => {
              const isCoach = msg.sender === "coach";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${isCoach ? "items-start" : "items-end justify-end"}`}
                >
                  {isCoach && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 text-[11px] font-mono font-semibold">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isCoach
                        ? "bg-zinc-900/60 border border-zinc-800/70 text-zinc-200"
                        : "bg-zinc-100 text-zinc-950 font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 text-[11px] font-mono font-semibold">
                  AI
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Analyzing response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick-Select Suggestion Chips */}
          {chips && chips.length > 0 && (
            <div className="px-5 py-2.5 bg-zinc-900/40 border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 hover:border-zinc-700 transition-colors text-left font-sans cursor-pointer"
                >
                  {chip}
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
            className="p-3.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your response or pick an option above..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sending}
              className="flex-1 bg-zinc-900/80 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 px-3.5 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Column: Quiet Profile Ledger (4 cols on lg) */}
        <aside
          className={`${
            showSummaryDrawer ? "block" : "hidden lg:block"
          } lg:col-span-4 space-y-4`}
        >
          <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-5 space-y-5">
            
            {/* Ledger Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div>
                <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Candidate Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 font-mono underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Target & Academic Records */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-zinc-500">Target Role</span>
                <span className="text-zinc-200 text-right font-medium truncate max-w-[160px]">
                  {extractedProfile?.targetCompany || extractedProfile?.targetJobRole
                    ? `${extractedProfile.targetCompany || ""}${extractedProfile.targetJobRole ? ` · ${extractedProfile.targetJobRole}` : ""}`
                    : "—"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-zinc-500">Academics</span>
                <span className="text-zinc-200 text-right font-medium">
                  {extractedProfile?.cgpa
                    ? `${extractedProfile.cgpa} CGPA${extractedProfile.graduationYear ? ` (${extractedProfile.graduationYear})` : ""}`
                    : "—"}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-zinc-500">Institution</span>
                <span className="text-zinc-200 text-right font-medium truncate max-w-[160px]">
                  {extractedProfile?.college || "—"}
                </span>
              </div>
            </div>

            {/* Evidence Connections */}
            <div className="pt-3 border-t border-zinc-800/60 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Evidence Accounts
              </span>

              {/* VTOP Academics */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs">
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
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors shrink-0"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs">
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
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* LeetCode */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs">
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
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* AI Resume ATS & Google XYZ Audit */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-zinc-200 block truncate font-medium">AI Resume ATS</span>
                    {connectedProfiles?.resume?.score || extractedProfile?.resumeScore ? (
                      <span className="text-[10px] text-purple-300 font-mono block truncate">
                        ATS: {connectedProfiles?.resume?.score || extractedProfile?.resumeScore}/100
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
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>{connectedProfiles?.resume?.score || extractedProfile?.resumeScore ? "Re-audit" : "Upload"}</span>
                </button>
              </div>
            </div>

            {/* Initial Readiness Snapshot (if available) */}
            {readinessSnapshot && (
              <div className="pt-3 border-t border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-500">Initial Score</span>
                  <span className="text-sm font-bold text-zinc-100">
                    {readinessSnapshot.overallScore} / 100
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-zinc-800/60 space-y-2">
              <button
                type="button"
                onClick={handleFinalizeAndEnterDashboard}
                disabled={applyingProfile}
                className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {applyingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Finalizing...</span>
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
                <span>View Tech Roadmap</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </aside>

      </main>

      {/* VTOP Connect Modal */}
      {showVtopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">Connect VTOP Portal</h3>
              </div>
              <button type="button" onClick={() => setShowVtopModal(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {vtopError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
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
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-zinc-500 font-mono uppercase"
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
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              {/* Captcha Image & Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-400 font-mono">
                    Security Captcha
                  </label>
                  <button
                    type="button"
                    onClick={() => fetchLiveVtopCaptcha(vtopSessionId)}
                    className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${vtopLoadingCaptcha ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {vtopCaptchaImage ? (
                    <img
                      src={vtopCaptchaImage}
                      alt="VTOP Captcha"
                      className="h-8 rounded bg-white px-2 py-0.5 object-contain border border-zinc-700"
                    />
                  ) : (
                    <div className="h-8 w-28 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                      {vtopLoadingCaptcha ? "Loading..." : "No Captcha"}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Enter Captcha"
                    value={vtopCaptchaText}
                    onChange={(e) => setVtopCaptchaText(e.target.value)}
                    className="flex-1 bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowVtopModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vtopLoading || !vtopUsername.trim()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 flex items-center gap-1.5"
                >
                  {vtopLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Fetch Academics</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GitHub Connect Modal */}
      {showGhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">Connect GitHub</h3>
              </div>
              <button type="button" onClick={() => setShowGhModal(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {ghError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{ghError}</span>
              </div>
            )}

            <form onSubmit={handleConnectGitHubDirect} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block">
                  GitHub Username
                </label>
                <input
                  type="text"
                  placeholder="Enter GitHub username"
                  value={ghInput}
                  onChange={(e) => setGhInput(e.target.value)}
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-zinc-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGhModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ghLoading || !ghInput.trim()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 flex items-center gap-1.5"
                >
                  {ghLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Sync Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LeetCode Connect Modal */}
      {showLcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">Connect LeetCode</h3>
              </div>
              <button type="button" onClick={() => setShowLcModal(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {lcError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{lcError}</span>
              </div>
            )}

            <form onSubmit={handleConnectLeetCodeDirect} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1 block">
                  LeetCode Username
                </label>
                <input
                  type="text"
                  placeholder="Enter LeetCode username"
                  value={lcInput}
                  onChange={(e) => setLcInput(e.target.value)}
                  className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-zinc-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLcModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lcLoading || !lcInput.trim()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 flex items-center gap-1.5"
                >
                  {lcLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Sync Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inferred Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">Edit Profile Information</h3>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdits} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-mono">Target Company</label>
                  <input
                    type="text"
                    value={editForm.targetCompany}
                    onChange={(e) => setEditForm({ ...editForm, targetCompany: e.target.value })}
                    className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700"
                    placeholder="Enter target company"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-mono">Target Role</label>
                  <input
                    type="text"
                    value={editForm.targetJobRole}
                    onChange={(e) => setEditForm({ ...editForm, targetJobRole: e.target.value })}
                    className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700"
                    placeholder="Enter target role"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-mono">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                    className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700"
                    placeholder="Enter CGPA"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-mono">Graduation Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={editForm.graduationYear}
                    onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
                    className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700"
                    placeholder="Enter graduation year"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-mono">College</label>
                  <input
                    type="text"
                    value={editForm.college}
                    onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                    className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block font-mono">Degree</label>
                  <input
                    type="text"
                    value={editForm.degree}
                    onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                    className="w-full bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded-xl border border-zinc-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Upload & AI Analysis Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Upload Resume for AI Audit</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">Google GENAI ATS & XYZ Metrics Auditor</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowResumeModal(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-800 hover:border-purple-500/60 rounded-xl p-6 text-center space-y-3 bg-zinc-950/50 transition-colors">
                <Upload className="w-8 h-8 text-purple-400 mx-auto animate-bounce" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Select PDF / DOCX Resume File</p>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Parsed with Google GENAI for real ATS score & bullet metrics</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setResumeFile(file);
                      handleUploadResumeDirect(file);
                    }
                  }}
                  disabled={resumeUploading}
                  className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-950 file:text-purple-300 hover:file:bg-purple-900 cursor-pointer"
                />
              </div>

              {resumeUploading && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-3 font-mono text-xs text-purple-300">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Analyzing with Google GENAI...</span>
                    <span className="text-[10px] text-purple-400">Extracting technical keywords, formatting structure & Google XYZ metrics</span>
                  </div>
                </div>
              )}

              {resumeError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 font-mono">
                  {resumeError}
                </div>
              )}

              {resumeSuccessData && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Google GENAI ATS Score</span>
                    <span className="text-base font-bold text-emerald-400">
                      {resumeSuccessData.ats_score} / 100 ({resumeSuccessData.score_tier})
                    </span>
                  </div>
                  {resumeSuccessData.matched_keywords?.length > 0 && (
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block mb-1">Matched Stack Keywords</span>
                      <div className="flex flex-wrap gap-1">
                        {resumeSuccessData.matched_keywords.slice(0, 6).map((k, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300">
                            {typeof k === "string" ? k : k.keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {resumeSuccessData.bullet_improvements?.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80">
                      <span className="text-[10px] text-purple-300 uppercase block">✓ Google XYZ Metrics Generated</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {resumeSuccessData.bullet_improvements[0]?.improved_xyz || "Bullet points converted to quantified Google XYZ format."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


