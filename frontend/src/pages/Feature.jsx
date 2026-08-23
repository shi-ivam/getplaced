import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, FileSearch, Code2, Sparkles, Target, BarChart3, Bot, Zap, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import axios from "axios";
import { NODE_API_URL } from "@/config/api";
import CaideBadge from "@/components/caide/CaideBadge";
import CaideCard from "@/components/caide/CaideCard";
import CaideButton from "@/components/caide/CaideButton";

const FeaturesGrid = () => {
  const [telemetryData, setTelemetryData] = useState({
    accuracy: "99.4%",
    pacingWpm: 142,
    tone: "Articulate",
    fillerWords: "0.2%",
    atsScore: 92,
    problemCount: 2800,
    readinessScore: 88,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const [readinessRes, dsaRes] = await Promise.allSettled([
          axios.get(`${NODE_API_URL}/api/readiness`, { withCredentials: true }),
          axios.get(`${NODE_API_URL}/api/dsa/topics`, { withCredentials: true }),
        ]);

        let calculatedAts = 92;
        let calculatedReadiness = 88;
        let pacing = 142;
        let tone = "Articulate";
        let totalProblems = 2800;

        if (readinessRes.status === "fulfilled" && readinessRes.value.data) {
          const data = readinessRes.value.data;
          if (data.breakdown?.resume?.score !== undefined) {
            calculatedAts = Math.round(data.breakdown.resume.score);
          }
          if (data.overallReadiness !== undefined) {
            calculatedReadiness = Math.round(data.overallReadiness);
          }
        }

        if (dsaRes.status === "fulfilled" && dsaRes.value.data) {
          const topics = Array.isArray(dsaRes.value.data) ? dsaRes.value.data : dsaRes.value.data.topics || [];
          if (topics.length > 0) {
            const sum = topics.reduce((acc, t) => acc + (t.problemCount || t.questionsCount || 100), 0);
            totalProblems = sum > 0 ? sum : 2800;
          }
        }

        if (isMounted) {
          setTelemetryData({
            accuracy: "99.4%",
            pacingWpm: pacing,
            tone: tone,
            fillerWords: "0.2%",
            atsScore: calculatedAts,
            problemCount: totalProblems,
            readinessScore: calculatedReadiness,
          });
        }
      } catch (err) {
        console.warn("Telemetry fetch error:", err);
      }
    };

    fetchTelemetry();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="features" className="py-24 md:py-32 bg-[#FEF9CF] u-background-grid-yellow text-[#0D0431] relative overflow-hidden border-b-2 border-[#0D0431]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <CaideBadge theme="light-purple">
            From Chaos to Offers
          </CaideBadge>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight max-w-4xl text-[#0D0431] mt-4">
            A Complete Career Intelligence Stack
          </h2>
          <p className="mt-4 text-[#0D0431]/80 text-base md:text-lg max-w-2xl font-sans">
            Traditional placement prep forces you to juggle 10 disjointed tools. getPlaced unifies mock interviews, ATS resume scoring, coding arenas, and live telemetry in one cohesive platform.
          </p>
        </div>

        {/* Caide-Style Comparison Section: Without vs With */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Without Card */}
          <CaideCard
            theme="white"
            shadow="lg"
            className="p-8 space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0D0431]">
              <div className="w-10 h-10 rounded-full bg-[#FFC5B7] border-2 border-[#0D0431] flex items-center justify-center font-bold text-sm">
                ✕
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-[#0D0431]">Without getPlaced</h3>
                <p className="text-xs text-[#0D0431]/70 font-medium">The old fragmented prep workflow</p>
              </div>
            </div>

            <ul className="space-y-4 text-sm font-semibold text-[#0D0431]/80">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#F85B52] shrink-0 mt-0.5" />
                <span>Juggling 6 different websites for problems, mock interviews, and resumes</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#F85B52] shrink-0 mt-0.5" />
                <span>Zero real-time feedback on filler words, speech speed, or body posture</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#F85B52] shrink-0 mt-0.5" />
                <span>Resumes silently rejected by automated ATS parsers without explanation</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#F85B52] shrink-0 mt-0.5" />
                <span>Hours lost wandering aimlessly across unorganized LeetCode problem lists</span>
              </li>
            </ul>
          </CaideCard>

          {/* With Card */}
          <CaideCard
            theme="light-green"
            shadow="lg"
            className="p-8 space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0D0431]">
              <div className="w-10 h-10 rounded-full bg-[#9BFFED] border-2 border-[#0D0431] flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-[#0D0431]">With getPlaced</h3>
                <p className="text-xs text-[#0D0431]/70 font-medium">AI-orchestrated placement success</p>
              </div>
            </div>

            <ul className="space-y-4 text-sm font-bold text-[#0D0431]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D0431] shrink-0 mt-0.5" />
                <span>Single unified cockpit for coding, system design, HR prep, and roadmaps</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D0431] shrink-0 mt-0.5" />
                <span>Live biometric telemetry tracking speech clarity, gaze focus, and posture</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D0431] shrink-0 mt-0.5" />
                <span>ATS scoring engine with automatic keyword extraction and formatting fixes</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0D0431] shrink-0 mt-0.5" />
                <span>Structured 28+ topic curated sheets with verified solution architectures</span>
              </li>
            </ul>
          </CaideCard>
        </div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Bento Card 1: Technical Interview Simulation (Span 2) */}
          <CaideCard
            theme="light-purple"
            shadow="lg"
            className="col-span-1 md:col-span-2 p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] mb-6 shadow-[3px_3px_0_0_#0D0431]">
                <Bot className="w-6 h-6 text-[#896EE2]" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-[#0D0431] mb-2">
                Technical Interview Simulation
              </h3>
              <p className="text-[#0D0431]/80 text-sm leading-relaxed mb-6 font-medium">
                Simulate high-stakes coding, architectural, and behavioral rounds with intelligent AI interviewers that challenge your assumptions in real time.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
              <div className="flex justify-between text-xs font-mono font-bold text-[#0D0431] mb-2">
                <span>AI_ASSESSMENT</span>
                <span className="text-[#896EE2]">{telemetryData.accuracy} ACCURACY</span>
              </div>
              <div className="h-3 w-full bg-[#E4CDFB] rounded-full border border-[#0D0431] overflow-hidden">
                <div className="h-full bg-[#896EE2] w-[94%] rounded-full" />
              </div>
            </div>
          </CaideCard>

          {/* Bento Card 2: ATS Resume Score (Span 2) */}
          <CaideCard
            theme="pale-lime"
            shadow="lg"
            className="col-span-1 md:col-span-2 p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] mb-6 shadow-[3px_3px_0_0_#0D0431]">
                <FileSearch className="w-6 h-6 text-[#0D0431]" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-[#0D0431] mb-2">
                ATS Resume Optimization
              </h3>
              <p className="text-[#0D0431]/80 text-sm leading-relaxed mb-6 font-medium">
                Instant parsing against real hiring rubrics. Discover missing tech stacks, verify action verbs, and format for maximum recruiter callback rates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border-2 border-[#0D0431] flex items-center justify-between shadow-[3px_3px_0_0_#0D0431]">
              <div className="font-heading font-bold text-xs text-[#0D0431] uppercase">Verified ATS Score</div>
              <div className="text-3xl font-heading font-black text-[#0D0431]">{telemetryData.atsScore}%</div>
            </div>
          </CaideCard>

          {/* Bento Card 3: 2800+ Question Arena */}
          <CaideCard
            theme="light-blue"
            shadow="default"
            className="col-span-1 md:col-span-1 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#0D0431] flex items-center justify-center mb-4 shadow-[2px_2px_0_0_#0D0431]">
                <Code2 className="w-5 h-5 text-[#63A0F8]" />
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0D0431] mb-1">
                2,800+ Problem Arena
              </h4>
              <p className="text-xs text-[#0D0431]/75 font-medium leading-relaxed">
                Monaco IDE sandbox with multi-language execution, custom test suites, and LeetCode sync.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-[#0D0431] flex items-center justify-between text-xs font-bold text-[#0D0431]">
              <span>Explore Arena</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CaideCard>

          {/* Bento Card 4: Company Dossiers */}
          <CaideCard
            theme="white"
            shadow="default"
            className="col-span-1 md:col-span-1 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] flex items-center justify-center mb-4 shadow-[2px_2px_0_0_#0D0431]">
                <BarChart3 className="w-5 h-5 text-[#0D0431]" />
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0D0431] mb-1">
                Company Intelligence
              </h4>
              <p className="text-xs text-[#0D0431]/75 font-medium leading-relaxed">
                Detailed breakdowns of hiring bars, CTC brackets, interview round formats, and recent candidate questions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-[#0D0431] flex items-center justify-between text-xs font-bold text-[#0D0431]">
              <span>View Intel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CaideCard>

          {/* Bento Card 5: Behavioral STAR Engine */}
          <CaideCard
            theme="light-green"
            shadow="default"
            className="col-span-1 md:col-span-1 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#0D0431] flex items-center justify-center mb-4 shadow-[2px_2px_0_0_#0D0431]">
                <Sparkles className="w-5 h-5 text-[#0D0431]" />
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0D0431] mb-1">
                HR & STAR Prep
              </h4>
              <p className="text-xs text-[#0D0431]/75 font-medium leading-relaxed">
                Structure storytelling with Situation, Task, Action, and Result frameworks analyzed by AI.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-[#0D0431] flex items-center justify-between text-xs font-bold text-[#0D0431]">
              <span>Practice STAR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CaideCard>

          {/* Bento Card 6: Readiness Score */}
          <CaideCard
            theme="white"
            shadow="default"
            className="col-span-1 md:col-span-1 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FFC5B7] border-2 border-[#0D0431] flex items-center justify-center mb-4 shadow-[2px_2px_0_0_#0D0431]">
                <Target className="w-5 h-5 text-[#0D0431]" />
              </div>
              <h4 className="font-heading font-bold text-lg text-[#0D0431] mb-1">
                Readiness Index ({telemetryData.readinessScore}/100)
              </h4>
              <p className="text-xs text-[#0D0431]/75 font-medium leading-relaxed">
                Dynamic telemetry score synthesizing DSA performance, speech confidence, and resume quality.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-[#0D0431] flex items-center justify-between text-xs font-bold text-[#0D0431]">
              <span>Score Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </CaideCard>

        </div>

      </div>
    </section>
  );
};

export default FeaturesGrid;
