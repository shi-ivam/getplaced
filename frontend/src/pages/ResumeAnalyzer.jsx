import React from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { FileCheck, Sparkles, CheckCircle2, TrendingUp, Zap, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <section id="resume" className="py-20 md:py-32 bg-[#05060d] text-white relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono uppercase tracking-widest">
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" /> ATS Radar Telemetry & Action Center
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white break-words">
            Resume Compatibility & Competency Analysis
          </h2>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed">
            Real-time keyword matching, semantic skill mapping, and interactive ATS recommendation engine.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left ATS Score Card (5 Cols) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#101322] to-[#080912] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col justify-between h-auto min-h-[420px]"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base truncate">{resumeData.name}</h3>
                    <p className="text-xs text-slate-400 truncate">{resumeData.role}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold shrink-0">
                  PASSED ATS
                </span>
              </div>

              {/* Massive Score Display */}
              <div className="text-center py-4 space-y-1">
                <div className="text-6xl sm:text-7xl font-black font-mono bg-gradient-to-r from-purple-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  {resumeData.atsScore}%
                </div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  ATS Placement Match vs Tier-1 Tech Benchmarks
                </p>
              </div>

              {/* Keywords Found Pills */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Verified Technical Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.keywordsFound.map((kw) => (
                    <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{kw}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10">
              <Link
                to="/resume"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/[0.05] hover:bg-white/10 border border-white/15 rounded-xl text-xs font-semibold text-white transition"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Launch Interactive Action Center
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
              </Link>
            </div>
          </motion.div>

          {/* Right Radar Chart Analysis (7 Cols) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 rounded-3xl bg-[#090b15] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col justify-between h-auto min-h-[420px]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Multi-Dimensional Competency Radar</span>
              </div>
              <span className="text-xs font-mono text-slate-400">BENCHMARK: FAANG SENIOR</span>
            </div>

            <div className="w-full h-[300px] sm:h-[340px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={resumeData.insights}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
                  <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.1)" />
                  <Radar name="Candidate Score" dataKey="score" stroke="#c084fc" fill="#a855f7" fillOpacity={0.45} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
              <span>Dynamic ATS Evaluation Engine</span>
              <span className="text-emerald-400 font-semibold">Ready for Actionable Fixes</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ResumeAnalyzer;
