import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Code2,
  FileText,
  BrainCog,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  Layers,
  ChevronRight,
} from "lucide-react";
import GpBadge from "@/components/gp/GpBadge";
import { getCtaHref } from "@/utils/authUtils";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-[#F8F8F5] text-[#17103D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Eyebrow Pill */}
          <Link
            to={getCtaHref("general", "register")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEAFF] hover:bg-[#E4CDFB] border border-[#E2DEEC] text-xs font-semibold text-[#6E44FF] shadow-sm transition-all hover:scale-102"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6E44FF]" />
            <span>PLACEMENT OPERATING SYSTEM</span>
            <ChevronRight className="w-3 h-3 text-[#6E44FF]" />
          </Link>

          {/* Main Editorial Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-black text-[#17103D] max-w-4xl tracking-tight leading-[1.12]">
            Everything you need to prepare for placements.
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#6F6A80] max-w-2xl font-medium leading-relaxed">
            Build coding skills, optimize your resume ATS score, simulate real interview rounds, and track university eligibility — in one unified workspace.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              to={getCtaHref("general", "register")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-sm font-bold transition-all shadow-[0_4px_14px_rgba(23,16,61,0.18)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Free Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F2F0FA] text-[#17103D] border border-[#E2DEEC] text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <span>Explore Platform</span>
            </a>
          </div>

          {/* 4 Core Pillars Credibility Chips (Clickable to specific CTAs) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 w-full max-w-3xl text-left">
            <Link
              to={getCtaHref("sheets", "login", "/app/sheets")}
              className="p-3 rounded-xl bg-white border border-[#E2DEEC] hover:border-[#6E44FF] shadow-sm flex items-center gap-2.5 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#17103D] truncate group-hover:text-[#6E44FF] transition-colors">
                DSA Playlists (28)
              </div>
            </Link>

            <Link
              to={getCtaHref("resume", "login", "/app/resume")}
              className="p-3 rounded-xl bg-white border border-[#E2DEEC] hover:border-[#9E6700] shadow-sm flex items-center gap-2.5 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FEF6D6] text-[#9E6700] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#17103D] truncate group-hover:text-[#9E6700] transition-colors">
                Resume ATS Optimizer
              </div>
            </Link>

            <Link
              to={getCtaHref("interview", "login", "/app/interview")}
              className="p-3 rounded-xl bg-white border border-[#E2DEEC] hover:border-[#C7382B] shadow-sm flex items-center gap-2.5 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FFE8E5] text-[#C7382B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BrainCog className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#17103D] truncate group-hover:text-[#C7382B] transition-colors">
                Mock Interviews
              </div>
            </Link>

            <Link
              to={getCtaHref("academics", "login", "/app/academics")}
              className="p-3 rounded-xl bg-white border border-[#E2DEEC] hover:border-[#0D7A68] shadow-sm flex items-center gap-2.5 transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#D8FAF4] text-[#0D7A68] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#17103D] truncate group-hover:text-[#0D7A68] transition-colors">
                Academic Intel
              </div>
            </Link>
          </div>

          {/* Modern Product Preview Card */}
          <div className="w-full max-w-4xl pt-6">
            <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 sm:p-7 shadow-[0_12px_40px_rgba(23,16,61,0.06)] text-left space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2DEEC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#FFE8E5] border border-[#FFC5B7]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEF6D6] border border-[#FFE995]" />
                  <div className="w-3 h-3 rounded-full bg-[#D8FAF4] border border-[#B7F4E8]" />
                  <span className="text-xs font-bold text-[#6F6A80] ml-2">
                    Candidate Dashboard • Microsoft SDE Track
                  </span>
                </div>
                <Link
                  to={getCtaHref("roadmap", "login", "/app/roadmap")}
                  className="hover:opacity-90 transition-opacity"
                >
                  <GpBadge theme="mint" size="sm">
                    84% Target Readiness
                  </GpBadge>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <Link
                  to={getCtaHref("coding", "login", "/app/coding")}
                  className="p-3.5 rounded-xl bg-[#F8F8F5] hover:bg-[#F2F0FA] border border-[#E2DEEC] space-y-1.5 transition-all block group"
                >
                  <div className="flex items-center justify-between text-[#6F6A80] font-semibold group-hover:text-[#17103D]">
                    <span>Coding & DSA</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-lg font-black text-[#17103D]">154 Solved</div>
                  <div className="w-full h-1.5 bg-[#E2DEEC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#6E44FF] w-[84%]" />
                  </div>
                </Link>

                <Link
                  to={getCtaHref("resume", "login", "/app/resume")}
                  className="p-3.5 rounded-xl bg-[#F8F8F5] hover:bg-[#D8FAF4]/40 border border-[#E2DEEC] space-y-1.5 transition-all block group"
                >
                  <div className="flex items-center justify-between text-[#6F6A80] font-semibold group-hover:text-[#0D7A68]">
                    <span>Resume ATS</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-lg font-black text-[#17103D]">88 / 100 Score</div>
                  <div className="w-full h-1.5 bg-[#E2DEEC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0D7A68] w-[88%]" />
                  </div>
                </Link>

                <Link
                  to={getCtaHref("academics", "login", "/app/academics")}
                  className="p-3.5 rounded-xl bg-[#F8F8F5] hover:bg-[#FEF6D6]/40 border border-[#E2DEEC] space-y-1.5 transition-all block group"
                >
                  <div className="flex items-center justify-between text-[#6F6A80] font-semibold group-hover:text-[#9E6700]">
                    <span>Academic Standing</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-lg font-black text-[#17103D]">8.84 CGPA • 0 Arrears</div>
                  <div className="w-full h-1.5 bg-[#E2DEEC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFD84D] w-[100%]" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
