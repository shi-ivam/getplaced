import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Brain,
  Send,
  Target,
  GraduationCap,
  Code2,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Terminal,
  Clock,
  Compass,
  Briefcase,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Github,
  Award,
  BarChart3,
  Check,
  AlertCircle,
  ExternalLink,
  Edit3,
  Loader2,
  X,
  FileText,
  Share2,
  Zap,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

const STEPS_MAP = [
  { step: 1, label: "Target Ambition", desc: "Company & role target" },
  { step: 2, label: "Academics", desc: "CGPA & graduation year" },
  { step: 3, label: "GitHub Proof", desc: "Public repos & projects" },
  { step: 4, label: "LeetCode DSA", desc: "Problem counts & topics" },
  { step: 5, label: "Skills Calibration", desc: "Stack & self-assessment" },
  { step: 6, label: "Report & Synthesis", desc: "Readiness score & roadmap" },
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
  const [profileCompletion, setProfileCompletion] = useState(15);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [applyingProfile, setApplyingProfile] = useState(false);

  // Quick connect states
  const [showGhModal, setShowGhModal] = useState(false);
  const [ghInput, setGhInput] = useState("");
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");

  const [showLcModal, setShowLcModal] = useState(false);
  const [lcInput, setLcInput] = useState("");
  const [lcLoading, setLcLoading] = useState(false);
  const [lcError, setLcError] = useState("");

  // Edit Inferred Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    targetCompany: "",
    targetJobRole: "",
    cgpa: 8.5,
    graduationYear: 2026,
    college: "",
    degree: "B.Tech",
  });

  const containerRef = useRef(null);
  const chatScrollRef = useRef(null);
  const profileCardRef = useRef(null);

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
    if (data.profileCompletion) setProfileCompletion(data.profileCompletion);
    
    // Set chips from latest message or session
    if (data.chips && data.chips.length > 0) {
      setChips(data.chips);
    } else {
      const lastMsg = data.messages?.[data.messages.length - 1];
      if (lastMsg && lastMsg.chips) {
        setChips(lastMsg.chips);
      }
    }

    setEditForm({
      targetCompany: data.extractedProfile?.targetCompany || "Microsoft",
      targetJobRole: data.extractedProfile?.targetJobRole || "Software Development Engineer",
      cgpa: data.extractedProfile?.cgpa || 8.5,
      graduationYear: data.extractedProfile?.graduationYear || 2026,
      college: data.extractedProfile?.college || "VIT Chennai",
      degree: data.extractedProfile?.degree || "B.Tech",
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

  useGSAP(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".bento-card"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || sending) return;

    const trimmed = text.trim();

    // Check for special action triggers from chips
    if (trimmed.toLowerCase().includes("dashboard")) {
      handleFinalizeAndEnterDashboard();
      return;
    }
    if (trimmed.toLowerCase().includes("roadmap")) {
      handleApplyProfile();
      return;
    }
    if (trimmed.toLowerCase().includes("dossier")) {
      navigate(`/app/company-intel?company=${extractedProfile?.targetCompany || "Microsoft"}`);
      return;
    }

    // Optimistic user message insertion
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
      // Refresh session
      const sessionRes = await axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true });
      if (sessionRes.data) syncSessionData(sessionRes.data);
      // Post an automatic message in chat
      handleSendMessage(`Connected GitHub @${res.data?.profile?.username || ghInput.trim()}`);
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
      // Refresh session
      const sessionRes = await axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true });
      if (sessionRes.data) syncSessionData(sessionRes.data);
      // Post an automatic message in chat
      handleSendMessage(`Connected LeetCode @${res.data?.profile?.username || lcInput.trim()}`);
    } catch (err) {
      console.error("LeetCode connect error:", err);
      setLcError(err.response?.data?.message || "Failed to retrieve LeetCode profile.");
    } finally {
      setLcLoading(false);
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

  const isGhConnected = Boolean(connectedProfiles?.github?.connected);
  const isLcConnected = Boolean(connectedProfiles?.leetcode?.connected);

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#07080b] text-zinc-100 font-sans selection:bg-violet-600 selection:text-white" ref={containerRef}>
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-violet-950/20 via-purple-950/10 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[400px] bg-violet-900/10 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-mono text-zinc-400">GetPlaced AI Career Coach</div>
              <div className="text-sm font-semibold text-zinc-200">Conversational Onboarding & Evidence Intelligence</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-violet-400" />
              Review / Edit Inferred
            </button>
            <button
              type="button"
              onClick={handleFinalizeAndEnterDashboard}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/60 transition-all flex items-center gap-1.5"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Stepper Progress Architecture */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AI Career Coach & Profile Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Conversational calibration building an evidence-based placement profile with live GitHub & LeetCode integration.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2 rounded-2xl shrink-0">
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">Profile Built</span>
                <span className="text-xs font-bold text-violet-300">{profileCompletion}% Complete</span>
              </div>
              <div className="w-20 bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {STEPS_MAP.map((s) => {
              const isPast = onboardingStep > s.step || isCompleted;
              const isCurrent = onboardingStep === s.step && !isCompleted;
              return (
                <div
                  key={s.step}
                  className={`rounded-2xl p-3 border transition-all ${
                    isCurrent
                      ? "bg-violet-950/40 border-violet-600 text-white shadow-md shadow-violet-950/50"
                      : isPast
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                      : "bg-zinc-950/40 border-zinc-900 text-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                      Phase 0{s.step}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
                  </div>
                  <div className="text-xs font-bold truncate">{s.label}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{s.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bento Grid: Chat Terminal & Profile HUD */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 grid-flow-dense">
          
          {/* Main Chat Terminal (7 cols) */}
          <div className="bento-card lg:col-span-7 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 shadow-2xl flex flex-col h-[720px] overflow-hidden backdrop-blur-md">
            
            {/* Terminal Header Bar */}
            <div className="px-6 py-3.5 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  career-coach://onboarding/{extractedProfile?.targetCompany?.toLowerCase() || "target"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>AI Coach Active</span>
              </div>
            </div>

            {/* Conversation Messages Stream */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
              {messages.map((msg, idx) => {
                const isCoach = msg.sender === "coach";
                return (
                  <div
                    key={idx}
                    className={`flex gap-3.5 ${isCoach ? "items-start" : "items-end justify-end"}`}
                  >
                    {isCoach && (
                      <div className="w-8 h-8 rounded-xl bg-violet-950 border border-violet-700/60 text-violet-300 flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                        AI
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isCoach
                          ? "bg-zinc-900/90 border border-zinc-800/90 text-zinc-200"
                          : "bg-violet-600 text-white font-medium shadow-md shadow-violet-950/60"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex items-start gap-3.5 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-violet-950 border border-violet-700/60 text-violet-300 flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                    AI
                  </div>
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-zinc-400 font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                    <span>Analyzing profile evidence and synthesizing guidance...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Suggestion Chips */}
            {chips && chips.length > 0 && (
              <div className="px-6 py-3 bg-zinc-900/40 border-t border-zinc-900/90 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Quick Select:</span>
                {chips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-violet-950/80 text-zinc-300 hover:text-violet-200 border border-zinc-800 hover:border-violet-700/60 transition-all text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Command Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 bg-zinc-950 border-t border-zinc-900 flex items-center gap-3"
            >
              <div className="relative flex-1">
                <Terminal className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Answer your coach or provide targets, handles, questions..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending}
                  className="w-full bg-zinc-900/90 text-xs sm:text-sm text-white pl-11 pr-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-violet-500/80 transition-all font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-violet-950/60 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right Column: Live Calibrated Profile HUD & Evidence Cards (5 cols) */}
          <div ref={profileCardRef} className="bento-card lg:col-span-5 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 sm:p-6 shadow-2xl space-y-5 flex flex-col justify-between backdrop-blur-md overflow-y-auto max-h-[720px]">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Live Placement Intelligence
                    </h3>
                    <p className="text-[11px] text-zinc-400">Evidence telemetry</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="text-[11px] font-mono text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit Inferred
                </button>
              </div>

              {/* Target & Academics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Target Role</span>
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>{extractedProfile?.targetCompany || "Microsoft"}</span>
                    <span className="text-zinc-500">/</span>
                    <span className="text-zinc-300 font-medium">{extractedProfile?.targetJobRole || "SDE"}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Academic Cutoff</span>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{extractedProfile?.cgpa || 8.5} CGPA</span>
                    <span className="text-zinc-400 font-normal">({extractedProfile?.degree || "B.Tech"} {extractedProfile?.graduationYear || 2026})</span>
                  </div>
                </div>
              </div>

              {/* Direct Profile Connect Cards */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Evidence Sources</span>
                
                {/* GitHub Connect Card */}
                <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-200">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>GitHub</span>
                        {isGhConnected ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                            @{connectedProfiles?.github?.username}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500">Not Connected</span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {isGhConnected
                          ? `${connectedProfiles?.github?.publicRepos || 0} Repos · Project Score: ${connectedProfiles?.github?.projectScore || 75}/100`
                          : "Extract repos, languages & project evidence"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowGhModal(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isGhConnected
                        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        : "bg-violet-600 hover:bg-violet-500 text-white"
                    }`}
                  >
                    {isGhConnected ? "Sync" : "Connect"}
                  </button>
                </div>

                {/* LeetCode Connect Card */}
                <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-950/50 border border-amber-800/30 flex items-center justify-center text-amber-400">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>LeetCode</span>
                        {isLcConnected ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                            @{connectedProfiles?.leetcode?.username}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500">Not Connected</span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {isLcConnected
                          ? `${connectedProfiles?.leetcode?.totalSolved || 0} Solved (${connectedProfiles?.leetcode?.mediumSolved || 0} Med, ${connectedProfiles?.leetcode?.hardSolved || 0} Hard)`
                          : "Extract DSA problem counts & active streaks"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLcModal(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isLcConnected
                        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        : "bg-amber-600 hover:bg-amber-500 text-white"
                    }`}
                  >
                    {isLcConnected ? "Sync" : "Connect"}
                  </button>
                </div>
              </div>

              {/* Discovered Projects or Evidence Skills */}
              {discoveredProjects && discoveredProjects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Discovered Projects ({discoveredProjects.length})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {discoveredProjects.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs flex items-center justify-between">
                        <div className="truncate">
                          <div className="font-bold text-zinc-200 truncate">{p.name}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{p.language} · {p.description}</div>
                        </div>
                        {p.isMain && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/60 shrink-0">
                            Key Project
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Placement Readiness Snapshot */}
              {readinessSnapshot && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-950/40 via-zinc-900/60 to-zinc-950 border border-violet-700/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Initial Readiness</span>
                      <div className="text-xl font-black text-white">{readinessSnapshot.overallScore}/100</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-violet-950 text-violet-300 border border-violet-800/60">
                      {readinessSnapshot.statusLabel || "Ready for Sprint"}
                    </span>
                  </div>

                  {readinessSnapshot.dimensions && (
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                      {Object.entries(readinessSnapshot.dimensions).slice(0, 4).map(([dim, dObj]) => (
                        <div key={dim} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/70 border border-zinc-800/60">
                          <span className="text-zinc-400 capitalize">{dim}:</span>
                          <span className="font-bold text-violet-300">{dObj.score !== null ? `${dObj.score}%` : "Pending"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct Action Triggers */}
            <div className="pt-3 border-t border-zinc-900 space-y-2">
              <button
                type="button"
                onClick={handleFinalizeAndEnterDashboard}
                disabled={applyingProfile}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-violet-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {applyingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    <span>Calibrating Master Plan...</span>
                  </>
                ) : (
                  <>
                    <span>Enter My Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleApplyProfile}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-violet-400" />
                <span>Launch Placement Roadmap</span>
              </button>
            </div>

          </div>

        </section>
      </div>

      {/* GitHub Connect Modal */}
      {showGhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-white">
                  <Github className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Connect GitHub Profile</h3>
              </div>
              <button type="button" onClick={() => setShowGhModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {ghError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{ghError}</span>
              </div>
            )}

            <form onSubmit={handleConnectGitHubDirect} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1.5 block">
                  GitHub Username or Profile URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. torvalds or https://github.com/octocat"
                  value={ghInput}
                  onChange={(e) => setGhInput(e.target.value)}
                  className="w-full bg-zinc-950 text-sm text-white px-4 py-3 rounded-xl border border-zinc-700 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGhModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ghLoading || !ghInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-2"
                >
                  {ghLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Connect & Analyze</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LeetCode Connect Modal */}
      {showLcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Connect LeetCode Profile</h3>
              </div>
              <button type="button" onClick={() => setShowLcModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {lcError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{lcError}</span>
              </div>
            )}

            <form onSubmit={handleConnectLeetCodeDirect} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-mono mb-1.5 block">
                  LeetCode Username or Profile URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. tourist or leetcode.com/u/username"
                  value={lcInput}
                  onChange={(e) => setLcInput(e.target.value)}
                  className="w-full bg-zinc-950 text-sm text-white px-4 py-3 rounded-xl border border-zinc-700 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLcModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lcLoading || !lcInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
                >
                  {lcLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Connect & Sync</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inferred Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Review & Edit Inferred Profile</h3>
                  <p className="text-[11px] text-zinc-400">Correct any details before final synchronization</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdits} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Target Company</label>
                  <input
                    type="text"
                    value={editForm.targetCompany}
                    onChange={(e) => setEditForm({ ...editForm, targetCompany: e.target.value })}
                    className="w-full bg-zinc-950 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-zinc-700"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Target Job Role</label>
                  <input
                    type="text"
                    value={editForm.targetJobRole}
                    onChange={(e) => setEditForm({ ...editForm, targetJobRole: e.target.value })}
                    className="w-full bg-zinc-950 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm({ ...editForm, cgpa: parseFloat(e.target.value) || 8.5 })}
                    className="w-full bg-zinc-950 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-zinc-700"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Graduation Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={editForm.graduationYear}
                    onChange={(e) => setEditForm({ ...editForm, graduationYear: parseInt(e.target.value, 10) || 2026 })}
                    className="w-full bg-zinc-950 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">College / University</label>
                  <input
                    type="text"
                    value={editForm.college}
                    onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                    className="w-full bg-zinc-950 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Degree</label>
                  <input
                    type="text"
                    value={editForm.degree}
                    onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                    className="w-full bg-zinc-950 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-zinc-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Looks Good & Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}


