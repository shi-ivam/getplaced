import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Clock,
  Zap,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
  Layers,
  HelpCircle,
  Activity,
  BarChart2
} from "lucide-react";
import { PY_API_URL } from "@/config/api";

const SAMPLE_RESPONSES = [
  {
    title: "Strong STAR Technical Benchmark",
    text: "In my previous project at Acme Tech, our backend service experienced severe latency degradation during peak traffic. As the lead backend engineer, my goal was to bring our P99 response time below 150 milliseconds. I architected a distributed Redis caching layer with optimistic locking and optimized the PostgreSQL indexing schema. Consequently, we reduced API response latency by 45% and scaled the platform to handle 20,000 concurrent requests with zero downtime."
  },
  {
    title: "Unstructured Benchmark with Fillers",
    text: "Um, so basically, like, I was working on this website project and, you know, we had some bugs with the server. I think my teammate and I tried to fix it, like, by changing some code. It was pretty difficult, but, you know, hopefully the users liked it and everything worked out in the end, sort of."
  }
];

export default function CommunicationLab() {
  const [inputText, setInputText] = useState(SAMPLE_RESPONSES[0].text);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // GSAP animation
  useGSAP(
    () => {
      gsap.from(".gsap-fade-in", {
        opacity: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out"
      });
    },
    { dependencies: [analysis], scope: containerRef }
  );

  // Set up Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
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
    const fillers = [
      "um",
      "uh",
      "like",
      "basically",
      "actually",
      "literally",
      "you know",
      "sort of",
      "kind of",
      "i mean",
      "so yeah"
    ];
    const regex = new RegExp(`\\b(${fillers.join("|")})\\b`, "gi");

    const parts = inputText.split(regex);
    return parts.map((part, i) => {
      const isFiller = fillers.includes(part.toLowerCase());
      if (isFiller) {
        return (
          <mark
            key={i}
            className="bg-neutral-800 text-white font-mono px-1 py-0.5 rounded border border-neutral-700 font-bold"
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <main
      ref={containerRef}
      className="overflow-x-hidden w-full max-w-full bg-[#08090c] text-neutral-100 min-h-screen font-sans selection:bg-neutral-800 selection:text-neutral-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Attention / Wide Cinematic Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/90 text-xs font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Speech Acoustics & Executive Articulation Engine
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight max-w-5xl mx-auto leading-tight">
            Verbal Precision & Executive Presence Diagnostics
          </h1>
          <p className="text-sm md:text-base text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Eliminate speech crutches, regulate words-per-minute pacing, verify STAR narrative density, and hone executive presence under pressure.
          </p>

          {/* Quick Benchmark Selectors */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {SAMPLE_RESPONSES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sample.text);
                  handleAnalyze(sample.text, 35);
                }}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-mono border border-neutral-800 transition"
              >
                Benchmark: {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Interest / Dense Gapless Bento Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 grid-flow-dense">
          {/* LEFT: SPEECH INPUT TERMINAL */}
          <div className="col-span-12 lg:col-span-5 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between gsap-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-neutral-300" />
                  Acoustic Input Terminal
                </h3>
                {isRecording && (
                  <span className="text-xs font-mono font-bold text-red-400 animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Recording ({audioDuration}s)
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleToggleRecord}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition font-mono ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
                      : "bg-white hover:bg-neutral-200 text-neutral-950 shadow-lg"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      Halt Voice Capture & Run Audit
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      Capture Live Voice Stream
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-mono text-neutral-400 block">
                  Raw Speech Transcript
                </label>
                <textarea
                  rows={8}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Speak via microphone or input speech transcript..."
                  className="w-full p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !inputText.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition mt-4 ${
                loading || !inputText.trim()
                  ? "bg-neutral-950 text-neutral-600 cursor-not-allowed border border-neutral-800"
                  : "bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              {loading
                ? "Synthesizing Speech Metrics..."
                : "Execute Articulation Audit"}
            </button>
          </div>

          {/* RIGHT: MULTI-DIMENSIONAL DIAGNOSTICS BENTO */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {analysis ? (
              <div className="space-y-6 gsap-fade-in">
                {/* Score Summary Banner */}
                <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 relative">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <path
                            className="text-neutral-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-white"
                            strokeDasharray={`${analysis.overall_communication_score}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-xl font-black text-white font-mono leading-none">
                            {analysis.overall_communication_score}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono mt-0.5">
                            / 100
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">
                          Composite Executive Articulation Score
                        </h3>
                        <p className="text-xs text-neutral-400">
                          Evaluated against semantic clarity, assertiveness tone, verbal crutch density, and STAR compliance.
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats Chips */}
                    <div className="flex flex-wrap gap-2">
                      <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-center min-w-[85px]">
                        <span className="text-[10px] font-mono text-neutral-400 block">
                          Crutches
                        </span>
                        <span className="text-sm font-mono font-bold text-white">
                          {analysis.filler_words?.total_count || 0}
                        </span>
                      </div>
                      <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-center min-w-[85px]">
                        <span className="text-[10px] font-mono text-neutral-400 block">
                          Pacing
                        </span>
                        <span className="text-sm font-mono font-bold text-white">
                          {analysis.pacing?.wpm || 135} WPM
                        </span>
                      </div>
                      <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-center min-w-[85px]">
                        <span className="text-[10px] font-mono text-neutral-400 block">
                          STAR Score
                        </span>
                        <span className="text-sm font-mono font-bold text-white">
                          {analysis.star_compliance?.score || 70}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlighted Filler Words Inspection Box */}
                <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h4 className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-neutral-400" />
                      Verbal Crutches & Pause Inspection
                    </h4>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300">
                      Density: {analysis.filler_words?.density_percent}% ({analysis.filler_words?.status})
                    </span>
                  </div>

                  <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl text-xs text-neutral-300 leading-relaxed max-h-36 overflow-y-auto font-mono">
                    {renderHighlightedTranscript()}
                  </div>

                  {analysis.filler_words?.total_count > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(analysis.filler_words?.breakdown || {}).map(
                        ([word, count]) => (
                          <span
                            key={word}
                            className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg text-xs font-mono"
                          >
                            "{word}": {count}x
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Zero verbal crutches detected. Optimal articulation precision.
                    </p>
                  )}
                </div>

                {/* 3-Pillar Breakdown: Clarity, Confidence, Pacing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-[11px] font-mono text-neutral-400">
                        Clarity & Structure
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {analysis.clarity?.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {analysis.clarity?.feedback}
                    </p>
                  </div>

                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-[11px] font-mono text-neutral-400">
                        Tone & Authority
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {analysis.confidence?.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {analysis.confidence?.feedback}
                    </p>
                  </div>

                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-[11px] font-mono text-neutral-400">
                        Cadence & WPM
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {analysis.pacing?.wpm} WPM
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {analysis.pacing?.feedback}
                    </p>
                  </div>
                </div>

                {/* Actionable Executive Coaching Recommendations */}
                {analysis.coaching_tips?.length > 0 && (
                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-3">
                    <h4 className="text-xs uppercase font-mono font-bold text-white tracking-wider flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-neutral-400" />
                      Actionable Executive Articulation Imperatives
                    </h4>
                    <ul className="space-y-2">
                      {analysis.coaching_tips.map((tip, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-neutral-400 flex items-start gap-2"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[400px]">
                <Volume2 className="w-8 h-8 text-neutral-500" />
                <h4 className="text-sm font-semibold text-white">
                  Awaiting Speech Input or Audio Feed
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm">
                  Click 'Capture Live Voice Stream' or load a benchmark response to synthesize real-time filler word telemetry, STAR evaluation, and pacing metrics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
