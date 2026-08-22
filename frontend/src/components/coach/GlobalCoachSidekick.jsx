import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Maximize2,
  Minimize2,
  Bot,
  User as UserIcon,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import MarkdownRenderer from "./MarkdownRenderer";
import ToolExecutionAccordion from "./ToolExecutionAccordion";
import ActionCard from "./ActionCard";

export default function GlobalCoachSidekick() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [chips, setChips] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);

  const chatScrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const popupRef = useRef(null);
  const headerRef = useRef(null);
  const inputRef = useRef(null);
  const triggerBtnRef = useRef(null);
  const backdropRef = useRef(null);

  // If candidate is already on dedicated /app/coach page, don't show floating sidekick to avoid redundancy
  const isDedicatedCoachPage = location.pathname.includes("/app/coach") || location.pathname.includes("/onboarding");

  // GSAP Smooth Bottom Slide-Up & Background Blur Reveal Animation
  useEffect(() => {
    if (isOpen && popupRef.current) {
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0, backdropFilter: "blur(0px)", webkitBackdropFilter: "blur(0px)" },
          { opacity: 1, backdropFilter: "blur(12px)", webkitBackdropFilter: "blur(12px)", duration: 0.38, ease: "power2.out" }
        );
      }

      gsap.fromTo(
        popupRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  // Fetch session history & contextual chips on open
  useEffect(() => {
    if (!isOpen || isDedicatedCoachPage) return;

    const loadSession = async () => {
      setLoadingHistory(true);
      try {
        const [sessionRes, suggRes] = await Promise.all([
          axios.get(`${NODE_API_URL}/api/coach/session`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/coach/quick-suggestions?path=${encodeURIComponent(location.pathname)}`, {
            withCredentials: true,
          }),
        ]);

        if (sessionRes.data?.messages) {
          setMessages(sessionRes.data.messages);
        }
        if (suggRes.data?.suggestions) {
          setChips(suggRes.data.suggestions);
        } else if (sessionRes.data?.chips) {
          setChips(sessionRes.data.chips);
        }
      } catch (err) {
        console.warn("Could not load coach sidekick session:", err.message);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadSession();
  }, [isOpen, location.pathname, isDedicatedCoachPage]);

  // Unmount cleanup for TTS & Speech Recognition
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

  const handleClose = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setSpeakingMsgIdx(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);

    if (backdropRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        backdropFilter: "blur(0px)",
        webkitBackdropFilter: "blur(0px)",
        duration: 0.28,
        ease: "power2.inOut",
      });
    }

    if (popupRef.current) {
      gsap.to(popupRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.28,
        ease: "power2.inOut",
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (!isDedicatedCoachPage) {
          e.preventDefault();
          setIsOpen((prev) => {
            const next = !prev;
            if (!next) {
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                try {
                  window.speechSynthesis.cancel();
                } catch (err) {}
              }
              setSpeakingMsgIdx(null);
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch (err) {}
              }
              setIsListening(false);
            }
            return next;
          });
        }
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDedicatedCoachPage, isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, sending, isOpen]);

  // Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {}
      }
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
        console.warn("Speech recognition error:", e?.error || e);
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
    // Strip markdown formatting and symbols for cleaner speech synthesis
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

      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
      if (res.data?.chips) {
        setChips(res.data.chips);
      }
    } catch (err) {
      console.error("Could not send message to coach:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "coach",
          text: "I encountered an error connecting with the platform. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to reset the AI Career Coach conversation?")) return;
    try {
      const res = await axios.post(`${NODE_API_URL}/api/coach/clear-chat`, {}, { withCredentials: true });
      if (res.data?.session?.messages) {
        setMessages(res.data.session.messages);
        setChips(res.data.session.messages[0]?.chips || []);
      }
    } catch (err) {
      console.warn("Could not clear chat:", err.message);
    }
  };

  if (isDedicatedCoachPage) return null;

  return (
    <>
      {/* 1. FLOATING AMBIENT BUTTON (BOTTOM MIDDLE) */}
      {!isOpen && (
        <div
          ref={triggerBtnRef}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 z-50 flex items-center gap-2 group"
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 text-zinc-100 hover:text-white font-medium text-xs shadow-xl hover:bg-zinc-800 transition-all duration-200 cursor-pointer border border-zinc-700 backdrop-blur-md font-mono"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            </div>
            <span className="font-semibold tracking-tight font-sans">Career Coach</span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
              Cmd+K
            </span>
          </button>
        </div>
      )}

      {/* 2. FULLSCREEN BACKDROP OVERLAY */}
      {isOpen && (
        <div
          ref={backdropRef}
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-black/60 cursor-pointer"
          title="Click backdrop to dismiss"
        />
      )}

      {/* 3. ASSISTANT POPUP DRAWER */}
      {isOpen && (
        <div
          ref={popupRef}
          className={`fixed z-50 transition-[width,height] duration-300 ease-out flex flex-col bg-[#0c0c0e] border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden ${
            isExpanded
              ? "bottom-3 left-3 right-3 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-[960px] md:w-[1120px] lg:w-[1240px] max-w-[96vw] h-[calc(100dvh-1.5rem)] sm:h-[88vh] max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh]"
              : "bottom-3 left-3 right-3 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-[760px] md:w-[840px] lg:w-[920px] max-w-[94vw] h-[calc(100dvh-1.5rem)] sm:h-[680px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div
            ref={headerRef}
            className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-semibold text-zinc-100">Career Coach</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  Surface: {location.pathname.replace("/app/", "") || "Overview"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Reset Chat"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer hidden sm:inline-flex"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleClose}
                title="Close (Esc)"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs sm:text-sm scrollbar-thin">
            {loadingHistory && (
              <div className="flex items-center justify-center py-10 text-zinc-500 gap-2 font-mono text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Loading coach...</span>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isCoach = msg.sender === "coach";
              const toolCalls = msg.metadata?.toolCalls || [];
              const actionCards = msg.metadata?.actionCards || [];
              const modelUsed = msg.metadata?.modelUsed || "";

              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isCoach ? "items-start" : "items-end justify-end"}`}
                >
                  {isCoach && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[92%] sm:max-w-[88%] rounded-2xl px-4 py-3.5 ${
                      isCoach
                        ? "bg-zinc-900/60 border border-zinc-800 text-zinc-200 shadow-sm"
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
                          <div className="mt-3 space-y-2 pt-2 border-t border-zinc-800/60">
                            {actionCards.map((card, cIdx) => (
                              <ActionCard key={cIdx} url={card.url} customTitle={card.label} />
                            ))}
                          </div>
                        )}

                        <div className="mt-2.5 pt-1.5 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSpeakText(msg.text, idx)}
                            className="flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            {speakingMsgIdx === idx ? (
                              <>
                                <VolumeX className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-mono">Playing</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Speak</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line text-xs sm:text-sm">{msg.text}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-400 flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Processing response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick-Select Suggestion Chips */}
          {chips && chips.length > 0 && (
            <div className="px-3.5 py-2 bg-zinc-950 border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors font-sans cursor-pointer text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Box */}
          <form
            ref={inputRef}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2 shrink-0"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? "Listening..." : "Dictate via Microphone"}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about requirements, roadmap, gaps..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all font-sans"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
