import React, { useEffect, useState } from "react";
import { Sparkles, Mic, Eye, UserCheck, Activity, ArrowRight, ShieldCheck, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Blackhole from "../assets/blackhole.webm";

const telemetryStates = [
  { speech: "Clear & Articulate (98% Clarity)", eye: "Optimal Focus (100% Direct)", posture: "Upright & Poised", confidence: "High (Top 2% Candidate)" },
  { speech: "Pacing Balanced (140 wpm)", eye: "Natural Gaze (95% Active)", posture: "Relaxed Engagement", confidence: "Elevated (Senior Tier)" },
  { speech: "Technical Terms Precise", eye: "Steady Eye Contact", posture: "Professional Alignment", confidence: "Interview Ready" }
];

const Hero = () => {
  const navigate = useNavigate();
  const [telemetryIndex, setTelemetryIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % telemetryStates.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentFeedback = telemetryStates[telemetryIndex];

  return (
    <section id="hero" className="relative w-full pt-36 md:pt-48 pb-24 md:pb-36 overflow-hidden bg-[#05060d]">
      {/* Background Cinematic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          className="w-full h-full object-cover opacity-25 scale-105 filter saturate-150 blur-[2px]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={Blackhole} type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060d] via-transparent to-[#05060d]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Top Pill Chip */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs md:text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>AI Feedback Engine</span>
          </motion.div>

          {/* Main Editorial H1 */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white max-w-6xl tracking-tight leading-[1.06] mb-8"
          >
            Master Every Interview. <br className="hidden sm:inline" />
            Land Your Dream Role.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-xl md:text-2xl text-slate-300 max-w-3xl mb-12 font-normal leading-relaxed"
          >
            Real-time biometric interview assessment, AI resume ATS optimization, and structured DSA prep built to elevate candidates into top tier offers.
          </motion.p>

          {/* Dual High-Contrast CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-20 z-20"
          >
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-white text-slate-950 font-bold text-sm uppercase tracking-wider hover:bg-slate-200 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] shadow-[0_10px_35px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group"
            >
              <span>Get Placed Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => {
                const element = document.getElementById("features");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-slate-700/80 font-semibold text-sm hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
              <span>Explore Platform</span>
            </button>
          </motion.div>

          {/* Live AI Telemetry Mock Container */}
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-purple-500/30 via-slate-800/40 to-transparent shadow-[0_30px_90px_rgba(0,0,0,0.9)] relative"
          >
            <div className="rounded-[22px] overflow-hidden bg-[#0a0c16]/95 border border-white/10 backdrop-blur-2xl">
              
              {/* Header Bar */}
              <div className="px-6 py-4 bg-slate-950/60 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 tracking-wider">AI_MOCK_INTERVIEW_SESSION // LIVE_TELEMETRY</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE ASSESSMENT
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">
                
                {/* Left Stream View */}
                <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-black/60 border border-white/10 min-h-[300px] flex items-center justify-center group">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop"
                    alt="Interview Candidate Simulation"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white font-medium flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Candidate Stream // 1080p AI Mesh Enabled</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300 font-mono bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                    <span>Topic: System Design & Microservices</span>
                    <span className="text-purple-300 font-semibold">Latency: 14ms</span>
                  </div>
                </div>

                {/* Right Real-time Telemetry Panel */}
                <div className="flex flex-col justify-between space-y-3 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-purple-400" /> Neural Telemetry
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">FPS 60.0</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors">
                      <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Mic className="w-3.5 h-3.5 text-cyan-400 mr-1.5" /> Speech Articulation
                      </div>
                      <div className="text-xs font-semibold text-white font-mono">{currentFeedback.speech}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors">
                      <div className="flex items-center text-xs text-slate-400 mb-1">
                        <Eye className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Eye Tracking
                      </div>
                      <div className="text-xs font-semibold text-white font-mono">{currentFeedback.eye}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors">
                      <div className="flex items-center text-xs text-slate-400 mb-1">
                        <UserCheck className="w-3.5 h-3.5 text-purple-400 mr-1.5" /> Posture Alignment
                      </div>
                      <div className="text-xs font-semibold text-white font-mono">{currentFeedback.posture}</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30">
                    <div className="text-[11px] text-purple-300 font-medium uppercase tracking-wider mb-1">Overall Confidence Score</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">{currentFeedback.confidence}</div>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
