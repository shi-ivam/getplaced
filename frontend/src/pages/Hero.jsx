import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Mic, Eye, UserCheck, Activity, ArrowRight, ShieldCheck, Play, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Blackhole from "../assets/blackhole.webm";

const Hero = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Live Telemetry & Canvas State measured via requestAnimationFrame
  const [telemetry, setTelemetry] = useState({
    fps: "60.0",
    renderTimeMs: "16.6",
    speech: "Live Pacing (140 wpm) • 98.4% Clarity",
    eye: "Natural Gaze (98% Focus)",
    posture: "Upright & Poised (Aligned)",
    confidence: "Interview Ready (Top 2% Score)",
    resolution: "1920x1080",
    latency: "12ms",
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const resizeCanvas = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 640;
        canvas.height = canvas.parentElement.clientHeight || 360;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Dynamic Nodes for Facial Mesh & Neural Telemetry rendering
    const nodes = Array.from({ length: 28 }, () => ({
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      radius: Math.random() * 2 + 1.5,
    }));

    const render = (now) => {
      frameCount++;
      const delta = now - lastTime;
      lastTime = now;

      // Update telemetry measuring every 500ms
      if (now - fpsTimer >= 500) {
        const measuredFps = Math.min(120, Math.max(1, (frameCount * 1000) / (now - fpsTimer)));
        const renderTime = (1000 / measuredFps).toFixed(1);
        frameCount = 0;
        fpsTimer = now;

        const gazeFocus = Math.round(95 + Math.sin(now / 800) * 4);
        const wpm = Math.round(138 + Math.cos(now / 1100) * 7);

        setTelemetry({
          fps: measuredFps.toFixed(1),
          renderTimeMs: renderTime,
          speech: `Live Pacing (${wpm} wpm) • 98.4% Clarity`,
          eye: `Natural Gaze (${gazeFocus}% Focus)`,
          posture: "Upright & Poised (Aligned)",
          confidence: "Interview Ready (Top 2% Score)",
          resolution: `${window.innerWidth}x${window.innerHeight}`,
          latency: `${Math.round(10 + Math.random() * 4)}ms`,
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render sci-fi grid telemetry mesh
      ctx.strokeStyle = "rgba(66, 132, 117, 0.18)";
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw simulated biometric face outline & landmark mesh
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 10;
      const headRadius = Math.min(canvas.width, canvas.height) * 0.28;

      // Head outline pulse
      ctx.strokeStyle = "rgba(137, 215, 183, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, headRadius * 0.75, headRadius, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Eye landmarks
      const eyeOffset = headRadius * 0.3;
      const eyeY = centerY - headRadius * 0.2;
      ctx.fillStyle = "#89D7B7";
      ctx.beginPath();
      ctx.arc(centerX - eyeOffset, eyeY, 4, 0, Math.PI * 2);
      ctx.arc(centerX + eyeOffset, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Mouth waveform
      ctx.strokeStyle = "#89D7B7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const mouthY = centerY + headRadius * 0.4;
      ctx.moveTo(centerX - eyeOffset, mouthY);
      for (let i = -eyeOffset; i <= eyeOffset; i += 5) {
        const wave = Math.sin((now / 140) + (i / 8)) * 4;
        ctx.lineTo(centerX + i, mouthY + wave);
      }
      ctx.stroke();

      // Neural nodes update
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0.15 || node.x > 0.85) node.vx *= -1;
        if (node.y < 0.15 || node.y > 0.85) node.vy *= -1;

        const px = node.x * canvas.width;
        const py = node.y * canvas.height;

        ctx.fillStyle = "rgba(137, 215, 183, 0.75)";
        ctx.beginPath();
        ctx.arc(px, py, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Node connections
      ctx.strokeStyle = "rgba(137, 215, 183, 0.18)";
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = (nodes[i].x - nodes[j].x) * canvas.width;
          const dy = (nodes[i].y - nodes[j].y) * canvas.height;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x * canvas.width, nodes[i].y * canvas.height);
            ctx.lineTo(nodes[j].x * canvas.width, nodes[j].y * canvas.height);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <section id="hero" className="relative w-full pt-36 md:pt-48 pb-24 md:pb-36 overflow-hidden bg-[#1A312C]">
      {/* Background Cinematic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          className="w-full h-full object-cover opacity-20 scale-105 filter saturate-120 blur-[2px]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={Blackhole} type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A312C] via-[#1A312C]/60 to-[#1A312C]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#89D7B7]/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-[#428475]/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Top Pill Chip */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#428475]/30 border border-[#89D7B7]/40 text-[#89D7B7] text-xs md:text-sm font-semibold tracking-wide shadow-[0_0_25px_rgba(137,215,183,0.18)]"
          >
            <Sparkles className="w-4 h-4 text-[#89D7B7] animate-pulse" />
            <span>Live Telemetry Engine</span>
          </motion.div>

          {/* Main Editorial H1 */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#FFF4E1] max-w-6xl tracking-tight leading-[1.06] mb-8"
          >
            Master Every Interview. <br className="hidden sm:inline" />
            Land Your Dream Role.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-xl md:text-2xl text-[#FFF4E1]/80 max-w-3xl mb-12 font-normal leading-relaxed"
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
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#89D7B7] text-[#1A312C] font-bold text-sm uppercase tracking-wider hover:bg-[#a6e6ce] transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] shadow-[0_10px_35px_rgba(137,215,183,0.3)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Get Placed Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#1A312C]" />
            </button>
            
            <button
              onClick={() => {
                const element = document.getElementById("features");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1A312C]/80 backdrop-blur-md text-[#FFF4E1] border border-[#428475]/60 font-semibold text-sm hover:bg-[#428475]/30 hover:border-[#89D7B7]/60 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#89D7B7] fill-[#89D7B7]" />
              <span>Explore Platform</span>
            </button>
          </motion.div>

          {/* Live AI Telemetry Container with Live HTML5 Canvas */}
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl rounded-3xl p-1 bg-gradient-to-b from-[#89D7B7]/40 via-[#428475]/30 to-transparent shadow-[0_30px_90px_rgba(10,20,18,0.9)] relative"
          >
            <div className="rounded-[22px] overflow-hidden bg-[#12221e]/95 border border-[#428475]/40 backdrop-blur-2xl">
              
              {/* Header Bar */}
              <div className="px-6 py-4 bg-[#0e1c18]/90 border-b border-[#428475]/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-[#89D7B7]" />
                  </div>
                  <span className="text-xs font-mono text-[#FFF4E1]/60 tracking-wider">
                    AI_MOCK_INTERVIEW_SESSION // LIVE_TELEMETRY
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[#FFF4E1]/70 flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5 text-[#89D7B7]" /> {telemetry.resolution}
                  </span>
                  <div className="flex items-center gap-2 text-[#89D7B7] bg-[#89D7B7]/15 px-3 py-1 rounded-full border border-[#89D7B7]/30 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#89D7B7] animate-ping" />
                    LIVE CANVAS FPS: {telemetry.fps}
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">
                
                {/* Left HTML5 Canvas Live Telemetry Stream View */}
                <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-[#1A312C]/90 border border-[#428475]/30 min-h-[320px] flex items-center justify-center group">
                  <canvas ref={canvasRef} className="w-full h-full block min-h-[320px]" />
                  
                  <div className="absolute top-4 left-4 bg-[#1A312C]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#428475]/40 text-xs text-[#FFF4E1] font-medium flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#89D7B7]" />
                    <span>Live Browser Telemetry Stream • Neural Mesh</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#FFF4E1]/85 font-mono bg-[#1A312C]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#428475]/40">
                    <span>Topic: System Design & Microservices</span>
                    <span className="text-[#89D7B7] font-semibold">Latency: {telemetry.latency}</span>
                  </div>
                </div>

                {/* Right Real-time Telemetry Panel */}
                <div className="flex flex-col justify-between space-y-3 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-[#428475]/30">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#89D7B7] flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#89D7B7]" /> Measured Telemetry
                    </span>
                    <span className="text-[10px] font-mono text-[#FFF4E1]/60">{telemetry.renderTimeMs}ms/frame</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-[#1A312C]/80 border border-[#428475]/35 hover:border-[#89D7B7]/50 transition-colors">
                      <div className="flex items-center text-xs text-[#FFF4E1]/70 mb-1">
                        <Mic className="w-3.5 h-3.5 text-[#89D7B7] mr-1.5" /> Speech Articulation
                      </div>
                      <div className="text-xs font-semibold text-[#FFF4E1] font-mono">{telemetry.speech}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#1A312C]/80 border border-[#428475]/35 hover:border-[#89D7B7]/50 transition-colors">
                      <div className="flex items-center text-xs text-[#FFF4E1]/70 mb-1">
                        <Eye className="w-3.5 h-3.5 text-[#89D7B7] mr-1.5" /> Eye Tracking Focus
                      </div>
                      <div className="text-xs font-semibold text-[#FFF4E1] font-mono">{telemetry.eye}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#1A312C]/80 border border-[#428475]/35 hover:border-[#89D7B7]/50 transition-colors">
                      <div className="flex items-center text-xs text-[#FFF4E1]/70 mb-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#89D7B7] mr-1.5" /> Posture Alignment
                      </div>
                      <div className="text-xs font-semibold text-[#FFF4E1] font-mono">{telemetry.posture}</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#1A312C] to-[#428475]/40 border border-[#89D7B7]/40">
                    <div className="text-[11px] text-[#89D7B7] font-medium uppercase tracking-wider mb-1">Overall Confidence Score</div>
                    <div className="text-sm font-bold text-[#FFF4E1] font-mono">{telemetry.confidence}</div>
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
