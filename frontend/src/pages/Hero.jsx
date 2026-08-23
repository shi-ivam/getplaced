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
    speech: "Pacing: 140 wpm · Clarity: 98%",
    eye: "Gaze Focus: 98%",
    posture: "Aligned",
    confidence: "Score: 94/100",
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

    // Dynamic Nodes for Facial Mesh & Telemetry rendering
    const nodes = Array.from({ length: 24 }, () => ({
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      radius: Math.random() * 2 + 1.5,
    }));

    const render = (now) => {
      frameCount++;
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
          speech: `Pacing: ${wpm} wpm · Clarity: 98%`,
          eye: `Gaze Focus: ${gazeFocus}%`,
          posture: "Aligned",
          confidence: "Score: 94/100",
          resolution: `${window.innerWidth}x${window.innerHeight}`,
          latency: `${Math.round(10 + Math.random() * 4)}ms`,
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render minimalist grid telemetry mesh
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
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

      // Draw biometric face outline & landmark mesh
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 10;
      const headRadius = Math.min(canvas.width, canvas.height) * 0.28;

      // Head outline pulse
      ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, headRadius * 0.75, headRadius, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Eye landmarks
      const eyeOffset = headRadius * 0.3;
      const eyeY = centerY - headRadius * 0.2;
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(centerX - eyeOffset, eyeY, 3.5, 0, Math.PI * 2);
      ctx.arc(centerX + eyeOffset, eyeY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth waveform
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
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

        ctx.fillStyle = "rgba(16, 185, 129, 0.65)";
        ctx.beginPath();
        ctx.arc(px, py, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Node connections
      ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
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
    <section id="hero" className="relative w-full pt-32 md:pt-44 pb-20 md:pb-28 overflow-hidden bg-[#09090b]">
      {/* Subtle Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          className="w-full h-full object-cover opacity-10 scale-105 filter saturate-100 blur-[3px]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={Blackhole} type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-[#09090b]/95 to-[#09090b]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Top Pill Chip */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Interview Telemetry</span>
          </motion.div>

          {/* Main Editorial H1 */}
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold text-white max-w-4xl tracking-tight leading-[1.08] mb-6"
          >
            Structured Technical Interview & Placement Platform
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 font-normal leading-relaxed"
          >
            Biometric interview simulations, ATS resume benchmarking, and structured milestones for technical hiring rounds.
          </motion.p>

          {/* Dual High-Contrast CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3.5 mb-16 z-20"
          >
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs uppercase tracking-wider hover:bg-white transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-zinc-950" />
            </button>
            
            <button
              onClick={() => {
                const element = document.getElementById("features");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-xs hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
              <span>Explore Features</span>
            </button>
          </motion.div>

          {/* Live Telemetry Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-1 shadow-2xl relative"
          >
            <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80">
              
              {/* Header Bar */}
              <div className="px-5 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 tracking-wider">
                    INTERVIEW_TELEMETRY
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-zinc-500" /> {telemetry.resolution}
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    FPS: {telemetry.fps}
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 md:p-6">
                
                {/* Left Live Telemetry Canvas View */}
                <div className="md:col-span-2 relative rounded-xl overflow-hidden bg-zinc-900/30 border border-zinc-800/80 min-h-[280px] flex items-center justify-center">
                  <canvas ref={canvasRef} className="w-full h-full block min-h-[280px]" />
                  
                  <div className="absolute top-3 left-3 bg-zinc-950/90 px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] text-zinc-300 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Biometric Landmark Mesh</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono bg-zinc-950/90 px-3 py-2 rounded-lg border border-zinc-800">
                    <span>Topic: System Design & APIs</span>
                    <span className="text-emerald-400 font-medium">Latency: {telemetry.latency}</span>
                  </div>
                </div>

                {/* Right Real-time Telemetry Panel */}
                <div className="flex flex-col justify-between space-y-2.5 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> Live Metrics
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{telemetry.renderTimeMs}ms/frame</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                      <div className="flex items-center text-[11px] text-zinc-400 mb-0.5">
                        <Mic className="w-3 h-3 text-emerald-400 mr-1.5" /> Speech Analysis
                      </div>
                      <div className="text-xs font-mono text-zinc-200">{telemetry.speech}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                      <div className="flex items-center text-[11px] text-zinc-400 mb-0.5">
                        <Eye className="w-3 h-3 text-emerald-400 mr-1.5" /> Attention Tracking
                      </div>
                      <div className="text-xs font-mono text-zinc-200">{telemetry.eye}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                      <div className="flex items-center text-[11px] text-zinc-400 mb-0.5">
                        <UserCheck className="w-3 h-3 text-emerald-400 mr-1.5" /> Posture Alignment
                      </div>
                      <div className="text-xs font-mono text-zinc-200">{telemetry.posture}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider mb-0.5">Readiness Score</div>
                    <div className="text-sm font-bold text-white font-mono">{telemetry.confidence}</div>
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
