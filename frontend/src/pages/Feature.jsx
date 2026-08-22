import React from "react";
import { motion } from "framer-motion";
import { Cpu, FileSearch, Code2, Sparkles, Target, BarChart3, Bot, Zap } from "lucide-react";

const FeaturesGrid = () => {
  return (
    <section id="features" className="py-24 md:py-36 bg-[#1A312C] text-[#FFF4E1] relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#428475]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#428475]/25 border border-[#89D7B7]/30 text-[#89D7B7] text-xs font-mono uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5 text-[#89D7B7]" /> Platform Architecture
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl text-[#FFF4E1]">
            Engineering Precision for Placement Excellence
          </h2>
        </div>

        {/* Gapless Bento Grid with grid-flow-dense */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-flow-dense">
          
          {/* Bento Card 1: AI Interview Mesh (Col 2, Row 2) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 group relative rounded-3xl bg-gradient-to-b from-[#1E3A34] to-[#12221e] p-8 border border-[#428475]/40 overflow-hidden flex flex-col justify-between shadow-2xl hover:border-[#89D7B7]/60 transition-colors"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#89D7B7]/12 rounded-full blur-[90px] group-hover:bg-[#89D7B7]/20 transition-all pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#89D7B7]/15 border border-[#89D7B7]/30 flex items-center justify-center text-[#89D7B7] mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#FFF4E1] mb-3 tracking-tight">
                Neural AI Interview Simulation
              </h3>
              <p className="text-[#FFF4E1]/75 text-sm md:text-base leading-relaxed mb-6">
                Engineered with real-time biometric feedback analyzing voice pitch, eye tracking, posture, and technical clarity during live mock sessions.
              </p>
            </div>

            {/* Micro Graphic Component */}
            <div className="rounded-2xl bg-[#1A312C]/90 border border-[#428475]/35 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-mono text-[#FFF4E1]/70 mb-3">
                <span>SPEECH_ANALYSIS_ENGINE</span>
                <span className="text-[#89D7B7] font-semibold">99.4% ACCURACY</span>
              </div>
              <div className="h-2 w-full bg-[#12221e] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1A312C] via-[#428475] to-[#89D7B7] w-[92%] rounded-full animate-pulse" />
              </div>
              <div className="mt-3 flex justify-between text-[11px] text-[#FFF4E1]/65 font-mono">
                <span>Pacing: 142 wpm</span>
                <span>Tone: Confident</span>
                <span>Filler Words: 0%</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: ATS Resume Radar (Col 2, Row 1) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 group relative rounded-3xl bg-[#152824] p-8 border border-[#428475]/35 overflow-hidden flex flex-col justify-between shadow-xl hover:border-[#89D7B7]/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#428475]/30 border border-[#89D7B7]/30 flex items-center justify-center text-[#89D7B7] mb-4 group-hover:scale-110 transition-transform">
                  <FileSearch className="w-6 h-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[#FFF4E1] mb-2 tracking-tight">
                  ATS Resume Optimization Radar
                </h3>
                <p className="text-[#FFF4E1]/75 text-sm leading-relaxed max-w-md">
                  Parse, score, and reconstruct your resume against top tech company job descriptions to pass enterprise ATS screeners.
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end justify-center">
                <div className="text-3xl font-mono font-black text-[#89D7B7]">86%</div>
                <div className="text-[10px] text-[#FFF4E1]/60 font-mono">MATCH SCORE</div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 3: DSA LeetCode Arena (Col 1, Row 1) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 group relative rounded-3xl bg-[#152824] p-6 border border-[#428475]/35 overflow-hidden flex flex-col justify-between shadow-xl hover:border-[#89D7B7]/50 transition-colors"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#89D7B7]/20 border border-[#89D7B7]/30 flex items-center justify-center text-[#89D7B7] mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#FFF4E1] mb-1.5 tracking-tight">
                2,800+ LeetCode Arena
              </h3>
              <p className="text-[#FFF4E1]/75 text-xs leading-relaxed">
                Full-scale coding environment with live Python test sandbox, Monaco IDE, and Gemini AI hints.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#428475]/25 flex items-center justify-between text-xs text-[#89D7B7]">
              <span className="font-semibold">Explore Arena</span>
              <Zap className="w-3.5 h-3.5 text-[#89D7B7]" />
            </div>
          </motion.div>

          {/* Bento Card 4: Analytics Dashboard (Col 1, Row 1) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 group relative rounded-3xl bg-[#152824] p-6 border border-[#428475]/35 overflow-hidden flex flex-col justify-between shadow-xl hover:border-[#89D7B7]/50 transition-colors"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#428475]/30 border border-[#89D7B7]/30 flex items-center justify-center text-[#89D7B7] mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#FFF4E1] mb-1.5 tracking-tight">
                Readiness Analytics
              </h3>
              <p className="text-[#FFF4E1]/75 text-xs leading-relaxed">
                Track behavioral, technical, and communication scores across your preparation lifecycle.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
