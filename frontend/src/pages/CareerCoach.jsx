import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BrainCog,
  Sparkles,
  Send,
  Target,
  GraduationCap,
  Code2,
  FileText,
  ArrowRight,
  CheckCircle2,
  Layers,
  Crown,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

export default function CareerCoach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chips, setChips] = useState([]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim()) return;

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      { sender: "user", text, timestamp: new Date() },
    ]);
    setInputMessage("");
    setChips([]);

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/coach/message`,
        { message: text },
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
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BrainCog className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Career Coach & Onboarding</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Conversational strategist assisting you in calibrating dream goals, academic cutoffs, and skills
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181b] border border-gray-800 text-xs text-gray-300">
          <span className="text-purple-400 font-bold">Step {Math.min(4, onboardingStep)} of 4</span>
          <span className="text-gray-500">·</span>
          <span>
            {onboardingStep === 1
              ? "Dream Ambition"
              : onboardingStep === 2
              ? "Academics"
              : onboardingStep === 3
              ? "Tech Profiles"
              : "Placement Strategy"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chat Window */}
        <div className="lg:col-span-2 bg-[#18181b] border border-gray-800 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => {
              const isCoach = msg.sender === "coach";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${isCoach ? "items-start" : "items-end justify-end"}`}
                >
                  {isCoach && (
                    <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 text-xs font-bold">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                      isCoach
                        ? "bg-[#121214] border border-gray-800 text-gray-200"
                        : "bg-purple-600 text-white font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          {chips.length > 0 && (
            <div className="px-6 py-3 bg-[#141416] border-t border-gray-800/80 flex flex-wrap gap-2">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (chip.includes("Launch My Placement Roadmap")) {
                      navigate("/app/roadmap");
                    } else if (chip.includes("View Academic Eligibility")) {
                      navigate("/app/academics");
                    } else {
                      handleSendMessage(chip);
                    }
                  }}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 hover:border-purple-400 transition-all text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-[#121214] border-t border-gray-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Type your answer to your AI career coach..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-[#18181b] text-xs text-white px-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>

        {/* Right Col: Live Calibrated Profile Card */}
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Live Calibrated Profile</h3>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#121214] border border-gray-800/80">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  Target Company & Role
                </span>
                <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-400" />
                  {extractedProfile?.targetCompany || "Microsoft"} · {extractedProfile?.targetJobRole || "SDE-1"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-gray-800/80">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  Academic Baseline
                </span>
                <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  {extractedProfile?.cgpa || 8.5} CGPA ({extractedProfile?.degree || "B.Tech"}, {extractedProfile?.graduationYear || 2026})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-gray-800/80">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  Primary Skill Focus
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(extractedProfile?.primarySkills || ["DSA", "C++", "React", "System Design"]).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-gray-800/80">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  Target Strategy Timeline
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {extractedProfile?.targetTimelineWeeks || 8} Weeks Roadmap Track
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-2">
            <button
              type="button"
              onClick={() => navigate("/app/roadmap")}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              Open Personalized Roadmap <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/academics")}
              className="w-full py-2.5 rounded-xl bg-[#121214] hover:bg-[#18181b] border border-gray-800 text-gray-300 text-xs font-bold transition-all"
            >
              View Academic Eligibility Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
