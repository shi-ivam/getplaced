import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "./Hero";
import FeaturesGrid from "./Feature";
import Footer from "./Footer";
import CaideMarquee from "../components/caide/CaideMarquee";
import CaideBadge from "../components/caide/CaideBadge";
import {
  ChevronDown,
  ArrowRight,
  Code2,
  FileText,
  BrainCog,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";

/**
 * 5-Step Placement Workflow Section
 */
function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Set Ambition & Profile",
      desc: "Select your dream employer (e.g. Microsoft, Google) and target role to calibrate your benchmark roadmap.",
      icon: Target,
    },
    {
      num: "02",
      title: "Master DSA Playlists",
      desc: "Solve structured topic sheets (Striver A2Z, Blind 75, SDE 180) with offline tutorials and Monaco IDE sandboxes.",
      icon: Code2,
    },
    {
      num: "03",
      title: "Optimize ATS Resume",
      desc: "Audit your resume against company screening algorithms and apply 1-click XYZ impact rewrites.",
      icon: FileText,
    },
    {
      num: "04",
      title: "Simulate Mock Interviews",
      desc: "Practice technical architecture and STAR behavioral questions with adaptive AI feedback.",
      icon: BrainCog,
    },
    {
      num: "05",
      title: "Apply with High Confidence",
      desc: "Match verified readiness against curated job openings and university eligibility criteria.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F8F8F5] text-[#17103D] border-t border-[#E2DEEC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <CaideBadge theme="light-purple" size="sm">
            Proven Strategy
          </CaideBadge>
          <h2 className="text-2xl sm:text-4xl font-heading font-black text-[#17103D] tracking-tight">
            How GetPlaced Works
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6A80] font-medium leading-relaxed">
            A structured 5-step methodology taking students from initial preparation to Tier-1 job offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#E2DEEC] shadow-sm flex flex-col justify-between space-y-3 hover:border-[#6E44FF] transition-all hover:-translate-y-0.5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#6E44FF] bg-[#EFEAFF] px-2 py-0.5 rounded-lg">
                      {s.num}
                    </span>
                    <Icon className="w-4 h-4 text-[#17103D]" />
                  </div>

                  <h3 className="text-sm font-bold text-[#17103D]">{s.title}</h3>
                  <p className="text-xs text-[#6F6A80] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Clean FAQ Section
 */
function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How does the AI Resume ATS Optimizer calculate its score?",
      a: "The optimizer parses your resume against specific company job descriptions and industry benchmarks. It scores keyword match density, XYZ formula quantification, and formatting readability out of 100.",
    },
    {
      q: "How is GetPlaced different from regular LeetCode or YouTube playlists?",
      a: "GetPlaced unifies all placement preparation dimensions in one workspace: 28 structured DSA sheets, AI resume ATS auditing, real-time mock interviews, and university VTOP cutoff intelligence.",
    },
    {
      q: "Can I practice coding problems directly in GetPlaced?",
      a: "Yes. Our Coding Workspace includes an integrated Monaco IDE with multi-language execution (Python, C++, Java, JS) and instant test-case validation.",
    },
    {
      q: "Is candidate data kept private and secure?",
      a: "Yes. Candidate resumes, performance metrics, and interview transcripts are encrypted and completely private. We never share student data with public models.",
    },
    {
      q: "How does VTOP Academic Sync work?",
      a: "VTOP sync authenticates directly with your university student portal using encrypted session tokens to reflect authoritative CGPA, attendance records, and placement eligibility.",
    },
  ];

  return (
    <section id="faqs" className="py-20 md:py-28 bg-white text-[#17103D] border-t border-[#E2DEEC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <CaideBadge theme="yellow" size="sm">
            Frequently Asked Questions
          </CaideBadge>
          <h2 className="text-2xl sm:text-4xl font-heading font-black text-[#17103D] tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6A80] font-medium">
            Common questions about preparing for placement season with GetPlaced.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#F8F8F5] border border-[#E2DEEC] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer font-bold text-sm sm:text-base text-[#17103D]"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`w-6 h-6 rounded-lg bg-white border border-[#E2DEEC] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-[#17103D]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#6F6A80] leading-relaxed border-t border-[#E2DEEC]/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Final Call-to-Action Banner
 */
function FinalCtaSection() {
  return (
    <section className="py-20 bg-[#17103D] text-white text-center relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#FFD84D] text-[#17103D] flex items-center justify-center font-black mx-auto shadow-sm">
          <Zap className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white leading-tight">
          Prepare smarter for your placement season.
        </h2>

        <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
          Join thousands of engineering students using GetPlaced to master DSA, polish resumes, and secure top offers.
        </p>

        <div className="pt-2">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FFD84D] hover:bg-[#FEDF6A] text-[#17103D] font-bold text-sm transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden w-full max-w-full bg-[#F8F8F5] text-[#17103D] min-h-screen font-sans">
      <Navbar />
      <Hero />
      <CaideMarquee />
      <FeaturesGrid />
      <WorkflowSection />
      <FaqSection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
}
