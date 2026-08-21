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
  ShieldCheck
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

const STEPS_MAP = [
  { step: 1, label: "Target Ambition", desc: "Company and role selection" },
  { step: 2, label: "Academic Baseline", desc: "CGPA and eligibility cutoffs" },
  { step: 3, label: "Technical Competencies", desc: "Core languages and frameworks" },
  { step: 4, label: "Placement Master Plan", desc: "Sprint timeline and roadmap synthesis" }
];

export default function CareerCoach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chips, setChips] = useState([]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [applyingProfile, setApplyingProfile] = useState(false);

  const containerRef = useRef(null);
  const chatScrollRef = useRef(null);
  const profileCardRef = useRef(null);

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const initCoachSession = async () => {
      try {
        const res = await axios.get(`${NODE_API_URL}/api/coach/session`, {
          withCredentials: true,
        });
        if (res.data) {
          setMessages(res.data.messages || []);
          setOnboardingStep(res.data.onboardingStep || 1);
          setIsCompleted(res.data.isCompleted || false);
          setExtractedProfile(res.data.extractedProfile || {});
          const lastMsg = res.data.messages?.[res.data.messages.length - 1];
          if (lastMsg && lastMsg.chips) {
            setChips(lastMsg.chips);
          }
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

    // Optimistic user message insertion
    const tempUserMsg = { sender: "user", text: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage("");
    setChips([]);
    setSending(true);

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/coach/message`,
        { message: text.trim() },
        { withCredentials: true }
      );
      if (res.data) {
        setMessages(res.data.messages || []);
        setOnboardingStep(res.data.onboardingStep || 1);
        setIsCompleted(res.data.isCompleted || false);
        setExtractedProfile(res.data.extractedProfile || {});
        setChips(res.data.chips || []);
      }
    } catch (err) {
      console.error("Could not send message to coach:", err);
    } finally {
      setSending(false);
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

  const currentStepInfo = STEPS_MAP.find((s) => s.step === Math.min(4, onboardingStep)) || STEPS_MAP[0];

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#07080b] text-zinc-100 font-sans selection:bg-violet-600 selection:text-white" ref={containerRef}>
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-violet-950/20 via-purple-950/10 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[400px] bg-violet-900/10 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-mono text-zinc-400">Career Intelligence Console</div>
              <div className="text-sm font-semibold text-zinc-200">Autonomous Strategic Coach</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/app/roadmap")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-violet-400" />
              Placement Roadmap
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/academics")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
              Academic Check
            </button>
          </div>
        </header>

        {/* Wide Header & Status */}
        <section className="space-y-6">
          <div className="max-w-5xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Autonomous Career Calibration and Placement Strategy Engine
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Interactive conversational calibration analyzing your target tech tier, academic baseline cutoffs, technical competencies, and sprint velocity to synthesize an executable placement master plan.
            </p>
          </div>

          {/* Stepper Progress Architecture */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STEPS_MAP.map((s) => {
              const isPast = onboardingStep > s.step || isCompleted;
              const isCurrent = onboardingStep === s.step && !isCompleted;
              return (
                <div
                  key={s.step}
                  className={`rounded-2xl p-4 border transition-all ${
                    isCurrent
                      ? "bg-violet-950/40 border-violet-600 text-white shadow-lg shadow-violet-950/50"
                      : isPast
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                      : "bg-zinc-950/40 border-zinc-900 text-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                      Phase 0{s.step}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
                  </div>
                  <div className="text-xs font-bold truncate">{s.label}</div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">{s.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bento Grid: Chat Terminal & Profile HUD */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 grid-flow-dense">
          
          {/* Main Chat Terminal (8 cols) */}
          <div className="bento-card lg:col-span-8 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 shadow-2xl flex flex-col h-[700px] overflow-hidden backdrop-blur-md">
            
            {/* Terminal Header Bar */}
            <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  career-coach-session://{extractedProfile?.targetCompany?.toLowerCase() || "calibrator"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>Active Link</span>
              </div>
            </div>

            {/* Conversation Messages Stream */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
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
                      className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isCoach
                          ? "bg-zinc-900/80 border border-zinc-800 text-zinc-200"
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
                    <span>Calibrating response and computing profile vector...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Suggestion Chips */}
            {chips && chips.length > 0 && (
              <div className="px-6 py-3.5 bg-zinc-900/30 border-t border-zinc-900/90 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Suggested Inputs:</span>
                {chips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (chip.toLowerCase().includes("roadmap")) {
                        handleApplyProfile();
                      } else if (chip.toLowerCase().includes("eligibility")) {
                        navigate("/app/academics");
                      } else {
                        handleSendMessage(chip);
                      }
                    }}
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
                  placeholder="Enter your response to calibrate goals, tech stacks, or questions..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending}
                  className="w-full bg-zinc-900/90 text-xs sm:text-sm text-white pl-11 pr-4 py-3.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-violet-500/80 transition-all font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={sending || !inputMessage.trim()}
                className="px-5 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-violet-950/60 transition-all flex items-center gap-2 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right Column: Live Calibrated Profile HUD (4 cols) */}
          <div ref={profileCardRef} className="bento-card lg:col-span-4 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-6 sm:p-7 shadow-2xl space-y-6 flex flex-col justify-between backdrop-blur-md">
            
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Live Calibrated Profile
                    </h3>
                    <p className="text-[11px] text-zinc-400">Dynamic system telemetry</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/60">
                  Phase {Math.min(4, onboardingStep)}/4
                </span>
              </div>

              {/* Profile Fields Matrix */}
              <div className="space-y-3">
                {/* Target Company & Role */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Target Enterprise & Role
                  </span>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                    <span>{extractedProfile?.targetCompany || "Microsoft"}</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-zinc-300 text-xs font-medium">
                      {extractedProfile?.targetJobRole || "Software Engineer"}
                    </span>
                  </div>
                </div>

                {/* Academic Baseline */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Academic Qualification Metric
                  </span>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{extractedProfile?.cgpa || 8.5} CGPA</span>
                    <span className="text-zinc-400 text-xs font-normal">
                      ({extractedProfile?.degree || "B.Tech"}, {extractedProfile?.graduationYear || 2026})
                    </span>
                  </div>
                </div>

                {/* Technical Stack Tags */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Calibrated Technical Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(extractedProfile?.primarySkills || ["C++", "DSA", "System Design", "JavaScript", "SQL"]).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-violet-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strategy Horizon */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Preparation Horizon & Velocity
                  </span>
                  <div className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <span>{extractedProfile?.targetTimelineWeeks || 8} Weeks Track</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Action Triggers */}
            <div className="pt-4 border-t border-zinc-900 space-y-2.5">
              <button
                type="button"
                onClick={handleApplyProfile}
                disabled={applyingProfile}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-wide uppercase shadow-lg shadow-violet-950/60 transition-all flex items-center justify-center gap-2"
              >
                <span>{applyingProfile ? "Synthesizing Roadmap..." : "Launch Personalized Roadmap"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/app/company-intel?company=" + (extractedProfile?.targetCompany || "Google"))}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>View {extractedProfile?.targetCompany || "Target"} Dossier</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>

          </div>

        </section>
      </div>
    </main>
  );
}

