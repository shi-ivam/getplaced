import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Code2,
  FileText,
  BrainCog,
  GraduationCap,
  ShieldCheck,
  Check,
} from "lucide-react";
import { getCtaFeature } from "@/config/ctaFeatures";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

/**
 * Clean Homepage-Styled ATS Resume Preview Card (No Useless Chips)
 */
function HomepageAtsResumePreview() {
  return (
    <div className="rounded-2xl bg-white border border-[#E2DEEC] p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2DEEC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF6D6] text-[#9E6700] flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#17103D]">Resume ATS Audit</div>
            <div className="text-xs text-[#6F6A80]">Software Engineering Benchmark</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-heading font-black text-[#17103D] leading-none">
            92<span className="text-sm font-sans text-[#6F6A80] font-normal">/100</span>
          </div>
          <div className="text-xs font-semibold text-[#0D7A68]">Score Passed</div>
        </div>
      </div>

      {/* XYZ Transformation Box */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#9E6700]">
          1-Click Google XYZ Formula Transformation (+6 pts)
        </div>
        <div className="p-3.5 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1.5 text-xs leading-relaxed">
          <div className="text-[#6F6A80] line-through text-[11px]">
            Worked on backend APIs and improved performance.
          </div>
          <div className="text-[#17103D] font-medium text-xs">
            <span className="font-bold text-[#0D7A68]">Engineered 8 REST microservices</span> in Node.js & Redis, reducing P99 latency by 42% at 10k RPM peak.
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-2 pt-1">
        {["TypeScript", "Distributed Systems", "Docker", "PostgreSQL", "System Design"].map((kw) => (
          <span
            key={kw}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#F8F8F5] text-[#17103D] border border-[#E2DEEC] flex items-center gap-1 font-medium"
          >
            <Check className="w-3 h-3 text-[#0D7A68]" />
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Clean Homepage-Styled DSA Sheets Preview Card (No Useless Chips)
 */
function HomepageDsaSheetsPreview() {
  return (
    <div className="rounded-2xl bg-white border border-[#E2DEEC] p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2DEEC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center font-bold shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#17103D]">28 Curated Study Sheets</div>
            <div className="text-xs text-[#6F6A80]">3,150+ Structured Problems</div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {[
          { title: "Striver A2Z DSA Course", count: "455 problems" },
          { title: "Blind 75 Curated LeetCode", count: "75 problems" },
          { title: "SDE Sheet (Top 180)", count: "180 problems" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC]"
          >
            <span className="font-semibold text-[#17103D]">{item.title}</span>
            <span className="text-xs text-[#6F6A80] font-mono">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Clean Homepage-Styled Mock Interview Preview Card (No Useless Chips)
 */
function HomepageInterviewPreview() {
  return (
    <div className="rounded-2xl bg-white border border-[#E2DEEC] p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2DEEC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE8E5] text-[#C7382B] flex items-center justify-center font-bold shrink-0">
            <BrainCog className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#17103D]">Adaptive AI Mock Interview</div>
            <div className="text-xs text-[#6F6A80]">Real-Time Speech & Technical Round</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
          <div className="text-xs text-[#6F6A80] font-medium">Speech Pacing</div>
          <div className="text-xl font-heading font-black text-[#17103D]">142 WPM</div>
          <div className="text-xs text-[#0D7A68] font-medium">Optimal rhythm • Calm</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
          <div className="text-xs text-[#6F6A80] font-medium">Filler Words</div>
          <div className="text-xl font-heading font-black text-[#17103D]">0.2%</div>
          <div className="text-xs text-[#0D7A68] font-medium">High articulation</div>
        </div>
      </div>
    </div>
  );
}

/**
 * SplitAuthLayout component
 */
export default function SplitAuthLayout({ mode = "login" }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const ctaParam = searchParams.get("cta") || searchParams.get("feature") || "general";
  const [selectedCta, setSelectedCta] = useState(ctaParam);

  useEffect(() => {
    if (ctaParam) {
      setSelectedCta(ctaParam);
    }
  }, [ctaParam]);

  const isGeneralOverview = selectedCta === "general" || selectedCta === "default";
  const feature = getCtaFeature(selectedCta);

  const isRegister = mode === "register";

  return (
    <div className="min-h-screen w-full bg-[#F8F8F5] text-[#17103D] flex flex-col lg:flex-row overflow-x-hidden font-sans selection:bg-[#FFD84D] selection:text-[#17103D]">
      {/* ========================================================================= */}
      {/* LEFT PANEL: Clean Feature Showcase (50% on Desktop, 2nd on Mobile)        */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#F8F8F5] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-t lg:border-t-0 lg:border-r border-[#E2DEEC] overflow-y-auto order-2 lg:order-1">
        <div className="space-y-8 w-full max-w-xl mx-auto">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-9 h-9 rounded-xl bg-[#FFD84D] text-[#17103D] flex items-center justify-center font-heading font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                GP
              </div>
              <span className="text-xl font-heading font-black text-[#17103D] tracking-tight">
                Get<span className="text-[#6E44FF]">Placed</span>
              </span>
            </Link>

            <Link
              to="/"
              className="text-xs sm:text-sm font-semibold text-[#6F6A80] hover:text-[#17103D] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2DEEC] hover:bg-[#F2F0FA] shadow-sm"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Headline & Description */}
          <div className="space-y-3.5">
            <h1 className="text-3xl sm:text-4xl lg:text-[38px] font-heading font-black text-[#17103D] tracking-tight leading-[1.18]">
              {isGeneralOverview
                ? "Everything you need to prepare for placements."
                : feature.title}
            </h1>
            <p className="text-sm sm:text-base text-[#6F6A80] leading-relaxed font-medium">
              {isGeneralOverview
                ? "Build coding skills, optimize your resume ATS score, simulate real interview rounds, and track university eligibility — in one unified workspace."
                : feature.description}
            </p>
          </div>

          {/* 4 Clean Feature Cards (Overview) or Dedicated Contextual Preview */}
          {isGeneralOverview ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2DEEC] shadow-sm space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF6D6] text-[#9E6700] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#17103D]">
                  Resume ATS Optimizer
                </div>
                <p className="text-xs text-[#6F6A80] leading-relaxed">
                  1-click Google XYZ formula bullet rewrites and keyword gap audits.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2DEEC] shadow-sm space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#17103D]">
                  DSA Sheets (28 Playlists)
                </div>
                <p className="text-xs text-[#6F6A80] leading-relaxed">
                  3,150+ problems from Striver A2Z, Blind 75, and SDE 180.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2DEEC] shadow-sm space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFE8E5] text-[#C7382B] flex items-center justify-center shrink-0">
                  <BrainCog className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#17103D]">
                  Adaptive AI Interviews
                </div>
                <p className="text-xs text-[#6F6A80] leading-relaxed">
                  Real-time speech pacing (WPM), filler words, and STAR scoring.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2DEEC] shadow-sm space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D8FAF4] text-[#0D7A68] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#17103D]">
                  VTOP Academic Sync
                </div>
                <p className="text-xs text-[#6F6A80] leading-relaxed">
                  Official CGPA sync, safe bunks formula, and attendance alerts.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {feature.previewType === "resume" && <HomepageAtsResumePreview />}
              {feature.previewType === "sheets" && <HomepageDsaSheetsPreview />}
              {feature.previewType === "interview" && <HomepageInterviewPreview />}
              {!["resume", "sheets", "interview"].includes(feature.previewType) && (
                <HomepageAtsResumePreview />
              )}
            </div>
          )}
        </div>

        {/* Bottom Assurance */}
        <div className="pt-8 border-t border-[#E2DEEC] flex items-center text-xs text-[#6F6A80] w-full max-w-xl mx-auto font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0D7A68]" />
            Private & secure student workspace
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Minimal Auth Form (50% on Desktop, 1st on Mobile)            */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen bg-white text-[#17103D] flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 overflow-y-auto order-1 lg:order-2">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Top Brand Header */}
          <div className="flex lg:hidden items-center justify-between pb-3 border-b border-[#E2DEEC]">
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-8 h-8 rounded-xl bg-[#FFD84D] text-[#17103D] flex items-center justify-center font-heading font-black text-sm shadow-sm">
                GP
              </div>
              <span className="text-lg font-heading font-black text-[#17103D] tracking-tight">
                Get<span className="text-[#6E44FF]">Placed</span>
              </span>
            </Link>

            <Link
              to="/"
              className="text-xs font-semibold text-[#6F6A80] hover:text-[#17103D] transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] shadow-sm"
            >
              <span>Home</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] w-full text-xs font-medium">
            <Link
              to={`/login${location.search}`}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                !isRegister
                  ? "bg-[#17103D] text-white font-bold shadow-sm"
                  : "text-[#6F6A80] hover:text-[#17103D]"
              }`}
            >
              Sign In
            </Link>
            <Link
              to={`/register${location.search}`}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                isRegister
                  ? "bg-[#17103D] text-white font-bold shadow-sm"
                  : "text-[#6F6A80] hover:text-[#17103D]"
              }`}
            >
              Create Account
            </Link>
          </div>

          {/* Form Header Label */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight">
              {isRegister ? "Create Account" : "Sign In"}
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6A80] font-medium">
              {isRegister
                ? "Enter your details to create your candidate account."
                : "Enter your credentials to access your placement cockpit."}
            </p>
          </div>

          {/* Active Auth Form */}
          {isRegister ? <RegisterForm /> : <LoginForm />}

          {/* Minimal Terms Note */}
          <div className="text-center text-xs text-[#6F6A80]">
            Your privacy is protected. View{" "}
            <Link to="/privacy" className="underline font-semibold hover:text-[#17103D]">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
