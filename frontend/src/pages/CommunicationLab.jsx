import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  Volume2,
  Clock,
  Zap,
  TrendingUp,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
  Layers,
  HelpCircle
} from "lucide-react";
import { PY_API_URL } from "@/config/api";

const SAMPLE_RESPONSES = [
  {
    title: "Strong STAR Technical Answer",
    text: "In my previous project at Acme Tech, our backend service experienced severe latency degradation during peak traffic. As the lead backend engineer, my goal was to bring our P99 response time below 150 milliseconds. I architected a distributed Redis caching layer with optimistic locking and optimized the PostgreSQL indexing schema. Consequently, we reduced API response latency by 45% and scaled the platform to handle 20,000 concurrent requests with zero downtime."
  },
  {
    title: "Weak Unstructured Answer with Fillers",
    text: "Um, so basically, like, I was working on this website project and, you know, we had some bugs with the server. I think my teammate and I tried to fix it, like, by changing some code. It was pretty difficult, but, you know, hopefully the users liked it and everything worked out in the end, sort of."
  }
];

export default function CommunicationLab() {
  const [inputText, setInputText] = useState(SAMPLE_RESPONSES[0].text);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Set up Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputText((prev) => (isRecording ? transcript : prev));
        }
      };

      rec.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    // Run initial evaluation on mount
    handleAnalyze(SAMPLE_RESPONSES[0].text, 35);

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser. Please type or paste your speech text.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      try {
        setInputText("");
        setAudioDuration(0);
        recognitionRef.current.start();
        setIsRecording(true);
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
          setAudioDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
      } catch (err) {
        console.warn("Could not start recording:", err);
      }
    }
  };

  const handleAnalyze = async (textToAnalyze = inputText, duration = audioDuration) => {
    const target = textToAnalyze || inputText;
    if (!target.trim()) {
      alert("Please enter or record speech before analyzing.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    setLoading(true);
    try {
      const res = await axios.post(`${PY_API_URL}/api/communication/analyze`, {
        text: target,
        audio_duration_seconds: duration > 0 ? duration : null,
        target_context: "Technical / Behavioral Interview"
      });
      setAnalysis(res.data);
    } catch (e) {
      console.error("Communication analysis failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Highlight filler words in text
  const renderHighlightedTranscript = () => {
    if (!inputText) return null;
    const fillers = ["um", "uh", "like", "basically", "actually", "literally", "you know", "sort of", "kind of", "i mean", "so yeah"];
    const regex = new RegExp(`\\b(${fillers.join("|")})\\b`, "gi");

    const parts = inputText.split(regex);
    return parts.map((part, i) => {
      const isFiller = fillers.includes(part.toLowerCase());
      if (isFiller) {
        return (
          <mark key={i} className="bg-amber-500/30 text-amber-300 px-1 py-0.5 rounded font-semibold border border-amber-500/50">
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex p-2.5 bg-violet-950/60 border border-violet-700/50 rounded-2xl text-violet-400">
                <Volume2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Communication & Articulation Lab
              </h1>
              <p className="text-xs md:text-sm text-gray-400 max-w-2xl leading-relaxed">
                Analyze speech pace, eliminate filler words ("um", "like", "basically"), enforce STAR narrative compliance, and build executive presence.
              </p>
            </div>

            {/* Quick Sample Selector */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {SAMPLE_RESPONSES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(sample.text);
                    handleAnalyze(sample.text, 35);
                  }}
                  className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-medium border border-gray-700 transition"
                >
                  Load {sample.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Split: Input & Recording (Left) & Diagnostics Dashboard (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: RECORDING & TEXT WORKSPACE */}
          <div className="lg:col-span-1 bg-gray-900/70 border border-gray-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-violet-400" />
                  Speech / Text Input
                </h3>
                {isRecording && (
                  <span className="text-xs font-semibold text-red-400 animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Recording ({audioDuration}s)
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleToggleRecord}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 animate-pulse"
                      : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                  }`}
                >
                  {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                  {isRecording ? "Stop & Evaluate" : "Record Live Voice"}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Speech Transcript or Text Response</label>
                <textarea
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Speak into microphone or type speech here..."
                  className="w-full p-3.5 bg-gray-800/90 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !inputText.trim()}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition mt-4 ${
                loading || !inputText.trim()
                  ? "bg-violet-950 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
              }`}
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              {loading ? "Analyzing Communication..." : "Run Articulation Audit"}
            </button>
          </div>

          {/* RIGHT: DIAGNOSTICS & TELEMETRY DASHBOARD */}
          <div className="lg:col-span-2 space-y-6">
            {analysis ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Score Summary Banner */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={
                              analysis.overall_communication_score >= 80
                                ? "text-emerald-500"
                                : analysis.overall_communication_score >= 65
                                ? "text-violet-500"
                                : "text-amber-500"
                            }
                            strokeDasharray={`${analysis.overall_communication_score}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-xl font-bold text-white leading-none">
                            {analysis.overall_communication_score}
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium">/ 100</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">Overall Communication Score</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Evaluated across clarity, confidence tone, verbal crutch density, and STAR alignment.
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats Chips */}
                    <div className="flex flex-wrap gap-2">
                      <div className="p-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-center min-w-[90px]">
                        <span className="text-[10px] text-gray-400 block">Fillers Found</span>
                        <span className="text-sm font-bold text-amber-400">{analysis.filler_words?.total_count || 0}</span>
                      </div>
                      <div className="p-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-center min-w-[90px]">
                        <span className="text-[10px] text-gray-400 block">Pacing (WPM)</span>
                        <span className="text-sm font-bold text-violet-300">{analysis.pacing?.wpm || 135}</span>
                      </div>
                      <div className="p-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-center min-w-[90px]">
                        <span className="text-[10px] text-gray-400 block">STAR Score</span>
                        <span className="text-sm font-bold text-emerald-400">{analysis.star_compliance?.score || 70}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlighted Filler Words Inspection Box */}
                <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Verbal Crutches & Filler Word Inspector
                    </h4>
                    <span className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800 px-2.5 py-0.5 rounded-full font-medium">
                      Density: {analysis.filler_words?.density_percent}% ({analysis.filler_words?.status})
                    </span>
                  </div>

                  <div className="p-4 bg-gray-800/50 border border-gray-700/60 rounded-xl text-xs text-gray-200 leading-relaxed max-h-40 overflow-y-auto">
                    {renderHighlightedTranscript()}
                  </div>

                  {analysis.filler_words?.total_count > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(analysis.filler_words?.breakdown || {}).map(([word, count]) => (
                        <span key={word} className="px-2.5 py-1 bg-amber-950/50 border border-amber-800/60 text-amber-300 rounded-lg text-xs font-medium">
                          "{word}": {count}x
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Zero verbal crutches detected! Exceptional speaking precision.
                    </p>
                  )}
                </div>

                {/* 3-Pillar Breakdown: Clarity, Confidence, Pacing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Clarity */}
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">Clarity & Structure</span>
                      <span className="text-sm font-bold text-violet-400">{analysis.clarity?.score}%</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {analysis.clarity?.feedback}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">Confidence & Tone</span>
                      <span className="text-sm font-bold text-emerald-400">{analysis.confidence?.score}%</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {analysis.confidence?.feedback}
                    </p>
                  </div>

                  {/* Pacing */}
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">Pacing (WPM)</span>
                      <span className="text-sm font-bold text-blue-400">{analysis.pacing?.wpm} WPM</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {analysis.pacing?.feedback}
                    </p>
                  </div>

                </div>

                {/* Executive Coaching Recommendations */}
                {analysis.coaching_tips?.length > 0 && (
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-400" />
                      Actionable Executive Presence Coaching
                    </h4>
                    <ul className="space-y-2">
                      {analysis.coaching_tips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[400px]">
                <Volume2 className="w-8 h-8 text-violet-400" />
                <h4 className="text-base font-semibold text-white">Record or Paste Your Speech</h4>
                <p className="text-xs text-gray-400 max-w-sm">
                  Click 'Record Live Voice' or paste an interview response to receive real-time filler word analysis, STAR evaluation, and pacing metrics.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
