import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Mic,
  MicOff,
  Trash2,
  Bot,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import MarkdownRenderer from "./MarkdownRenderer";
import ToolExecutionAccordion from "./ToolExecutionAccordion";
import ActionCard from "./ActionCard";

const CONTEXT_PROMPTS = {
  "/app/vtop": [
    "Which subjects have attendance warnings?",
    "Am I placement eligible for Tier-1 Super Dream?",
    "Explain my standing arrears",
  ],
  "/app/academics": [
    "How much SGPA do I need for 9.0 CGPA?",
    "Which company cutoffs do I qualify for?",
    "Calculate required marks for remaining semesters",
  ],
  "/app/resume": [
    "Which resume issue should I fix first?",
    "Give me XYZ bullet point rewrites",
    "What keywords am I missing?",
  ],
  "/app/sheets": [
    "What should I solve today?",
    "Explain Binary Search patterns",
    "Which sheet is best for SDE interviews?",
  ],
  "/app/coding": [
    "Give me a hint for this problem",
    "What is the time complexity bottleneck?",
    "Explain edge cases for this DSA problem",
  ],
  "/app/interview": [
    "Start a mock interview session",
    "Explain the STAR behavioral framework",
    "How do I answer 'Tell me about yourself'?",
  ],
  "/app/jobs": [
    "Which jobs have the highest match score?",
    "What skills should I learn for Microsoft SDE?",
    "Show remote opportunities",
  ],
};

export default function GlobalCoachSidekick() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [chips, setChips] = useState([]);

  const drawerRef = useRef(null);
  const chatScrollRef = useRef(null);

  const isDedicatedCoachPage =
    location.pathname.includes("/app/coach") || location.pathname.includes("/onboarding");

  // Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        // Only close if target is not the trigger button
        const triggerBtn = document.getElementById("global-ai-coach-trigger");
        if (triggerBtn && triggerBtn.contains(e.target)) return;
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key to Close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Contextual chips when route changes
  useEffect(() => {
    const defaultChips = CONTEXT_PROMPTS[location.pathname] || [
      "Audit my placement readiness",
      "What should I focus on today?",
      "How to improve my ATS score?",
    ];
    setChips(defaultChips);
  }, [location.pathname]);

  // Load session history when opened
  useEffect(() => {
    if (!isOpen || isDedicatedCoachPage) return;

    const loadSession = async () => {
      setLoadingHistory(true);
      try {
        const [sessionRes, suggRes] = await Promise.allSettled([
          axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true }),
          axios.get(
            `${NODE_API_URL}/api/coach/quick-suggestions?path=${encodeURIComponent(
              location.pathname
            )}`,
            { withCredentials: true }
          ),
        ]);

        if (sessionRes.status === "fulfilled" && sessionRes.value.data?.messages) {
          setMessages(sessionRes.value.data.messages);
        }
        if (suggRes.status === "fulfilled" && suggRes.value.data?.suggestions) {
          setChips(suggRes.value.data.suggestions);
        }
      } catch (err) {
        console.warn("Could not load coach session:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadSession();
  }, [isOpen, location.pathname, isDedicatedCoachPage]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || inputMessage).trim();
    if (!messageText || sending) return;

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setSending(true);

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/coach/chat`,
        {
          message: messageText,
          path: location.pathname,
        },
        { withCredentials: true }
      );

      if (res.data) {
        const assistantMessage = {
          role: "assistant",
          content: res.data.reply || res.data.text || "I have analyzed your request.",
          toolExecutions: res.data.toolExecutions || [],
          actionCard: res.data.actionCard || null,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (res.data.chips) {
          setChips(res.data.chips);
        }
      }
    } catch (err) {
      console.error("Error communicating with AI coach:", err);
      const errorReply = {
        role: "assistant",
        content: "I encountered an issue processing your query. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await axios.post(
        `${NODE_API_URL}/api/coach/clear-session`,
        {},
        { withCredentials: true }
      );
      setMessages([]);
    } catch (err) {
      console.warn("Could not clear session:", err);
      setMessages([]);
    }
  };

  if (isDedicatedCoachPage) return null;

  return (
    <>
      {/* Subtle Backdrop on Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#17103D]/20 backdrop-blur-[2px] sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Trigger Button (Bottom-Right Dock) */}
      {!isOpen && (
        <button
          id="global-ai-coach-trigger"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#17103D] hover:bg-[#24195A] text-[#FFD84D] shadow-[0_4px_16px_rgba(23,16,61,0.25)] border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
          title="Open AI Career Coach (Click to toggle)"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#0D7A68] border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Floating Assistant Drawer */}
      {isOpen && (
        <div
          ref={drawerRef}
          className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-2xl shadow-[0_16px_40px_rgba(23,16,61,0.2)] border border-[#E2DEEC] flex flex-col h-[85vh] sm:h-[530px] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#17103D] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#FFD84D]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="leading-none">
                <span className="font-heading font-bold text-xs">AI Career Coach</span>
                <span className="text-[10px] text-white/70 block mt-0.5">Context Active</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[#F8F8F5]"
          >
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-[#6F6A80] gap-2 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-[#6E44FF]" />
                <span>Loading conversation...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-[#6F6A80]">
                <div className="w-10 h-10 rounded-full bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center mx-auto">
                  <Bot className="w-5 h-5" />
                </div>
                <p className="font-bold text-[#17103D] text-xs">How can I assist your placement prep?</p>
                <p className="text-[11px] leading-relaxed max-w-[260px] mx-auto text-[#6F6A80]">
                  Ask me to audit your resume, explain DSA patterns, verify cutoff eligibility, or prepare interview answers.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === "user";

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs ${
                        isUser
                          ? "bg-[#17103D] text-white font-medium rounded-br-sm shadow-sm"
                          : "bg-[#F5F3FA] text-[#17103D] border border-[#E2DEEC] rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="space-y-2">
                          <MarkdownRenderer content={msg.content} />
                          {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                            <ToolExecutionAccordion executions={msg.toolExecutions} />
                          )}
                          {msg.actionCard && (
                            <ActionCard action={msg.actionCard} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F5F3FA] border border-[#E2DEEC] text-[11px] text-[#17103D] font-medium w-max">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6E44FF]" />
                <span>Coach is thinking...</span>
              </div>
            )}
          </div>

          {/* Context Suggestions */}
          {chips && chips.length > 0 && (
            <div className="px-3 py-2 border-t border-[#E2DEEC] bg-white flex items-center gap-1.5 overflow-x-auto shrink-0">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip)}
                  disabled={sending}
                  className="px-2.5 py-1 rounded-full bg-[#F2F0FA] hover:bg-[#EFEAFF] text-[#17103D] text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer border border-[#E2DEEC]"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-[#E2DEEC] bg-white flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask career coach..."
              disabled={sending}
              className="flex-1 bg-white border border-[#E2DEEC] rounded-xl px-3 py-2 text-xs text-[#17103D] placeholder-[#77718A] focus:outline-none focus:border-[#6E44FF] focus:ring-1 focus:ring-[#6E44FF]/20"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="p-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
