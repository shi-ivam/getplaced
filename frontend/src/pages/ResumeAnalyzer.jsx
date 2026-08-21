import React from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { FileCheck, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";

const resumeData = {
  name: "Richard Gomez",
  role: "Senior Software Engineer Candidate",
  atsScore: 92,
  insights: [
    { skill: "System Design", score: 92 },
    { skill: "Data Structures", score: 88 },
    { skill: "React & Frontend", score: 95 },
    { skill: "Cloud Architecture", score: 84 },
    { skill: "Behavioral Articulation", score: 90 },
  ],
  keywordsFound: ["Distributed Systems", "TypeScript", "GraphQL", "Docker", "CI/CD", "AWS Lambda"],
};

const ResumeAnalyzer = () => {
  return (
    <section id="resume" className="py-24 md:py-36 bg-[#05060d] text-white relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-4">
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" /> ATS Radar Telemetry
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl text-white">
            Resume Compatibility & Competency Analysis
          </h2>
          <p className="mt-4 text-slate-400 text-base md:text-lg max-w-2xl">
            Real-time keyword matching, semantic skill mapping, and industry benchmark scoring.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left ATS Score Card (5 Cols) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#101322] to-[#080912] p-8 border border-white/10 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{resumeData.name}</h3>
                    <p className="text-xs text-slate-400">{resumeData.role}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">
                  PASSED ATS
                </span>
              </div>

              {/* Massive Score Display */}
              <div className="text-center py-6">
                <div className="text-6xl md:text-7xl font-black font-mono bg-gradient-to-r from-purple-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {resumeData.atsScore}%
                </div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  ATS Match Score vs Tier-1 Tech Profiles
                </p>
              </div>

              {/* Keywords Found Pills */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Verified Technical Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.keywordsFound.map((kw) => (
                    <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Radar Chart Analysis (7 Cols) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 rounded-3xl bg-[#090b15] p-8 border border-white/10 shadow-2xl flex flex-col justify-between min-h-[420px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Multi-Dimensional Competency Radar</span>
              </div>
              <span className="text-xs font-mono text-slate-400">BENCHMARK: FAANG SENIOR</span>
            </div>

            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={resumeData.insights}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
                  <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.1)" />
                  <Radar name="Candidate Score" dataKey="score" stroke="#c084fc" fill="#a855f7" fillOpacity={0.45} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ResumeAnalyzer;
