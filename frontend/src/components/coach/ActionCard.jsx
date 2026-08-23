import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Terminal,
  Layers,
  Target,
  Building2,
  FileText,
  Mic,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Swords,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Award,
  BookOpen,
  Database,
  User,
  FolderGit2,
} from "lucide-react";

export function getActionCardMeta(url = "") {
  if (!url) {
    return {
      type: "general",
      category: "ACTION",
      title: "Explore Platform Surface",
      description: "Navigate to this section to view details and update progress.",
      icon: Sparkles,
      badgeClass: "bg-[#F2F0FA] text-[#6F6A80] border-[#E2DEEC]",
      accentBorder: "hover:border-[#6E44FF]/40",
      btnText: "Open Surface",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 1. Coding Workspace & Problem Sandbox
  if (url.includes("/app/coding") || url.includes("/app/problems")) {
    const slug = (
      url.split("/app/coding/")[1] ||
      url.split("/app/problems/")[1] ||
      ""
    )
      .split("?")[0]
      .replace(/\/$/, "");

    const formattedTitle = slug
      ? `Solve: ${slug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")}`
      : "Coding Sandbox";

    return {
      type: "coding",
      category: "CODING",
      title: formattedTitle,
      description: slug
        ? `Open problem #${slug} in the code editor with automated testcase runner.`
        : "Interactive coding editor with multi-language testcase runner.",
      icon: Terminal,
      badgeClass: "bg-[#D8FAF4] text-[#0D7A68] border-[#0D7A68]/25",
      accentBorder: "hover:border-[#0D7A68]/40",
      btnText: slug ? "Open Problem" : "Launch Editor",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 2. DSA Sheets & Curricula
  if (url.includes("/app/sheets") || url.includes("/app/dsa")) {
    return {
      type: "dsa",
      category: "STUDY PLAN",
      title: "DSA Curricula & Problem Sheets",
      description: "Curated problem lists and topic tutorials with progress tracking.",
      icon: Layers,
      badgeClass: "bg-[#EFEAFF] text-[#6E44FF] border-[#6E44FF]/25",
      accentBorder: "hover:border-[#6E44FF]/40",
      btnText: "View Curricula",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 3. Roadmap & Sprints
  if (url.includes("/app/roadmap")) {
    return {
      type: "roadmap",
      category: "ROADMAP",
      title: "Placement Roadmap",
      description: "Milestone sprints, weekly objectives, and study schedules.",
      icon: Target,
      badgeClass: "bg-[#EFEAFF] text-[#6E44FF] border-[#6E44FF]/25",
      accentBorder: "hover:border-[#6E44FF]/40",
      btnText: "View Roadmap",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 4. Milestones & Badges
  if (url.includes("/app/milestones")) {
    return {
      type: "milestones",
      category: "MILESTONES",
      title: "Placement Milestones",
      description: "Track completion milestones and preparation velocity.",
      icon: Award,
      badgeClass: "bg-[#FEF6D6] text-[#9E6700] border-[#9E6700]/25",
      accentBorder: "hover:border-[#9E6700]/40",
      btnText: "View Milestones",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 5. Progress Tracker & Readiness
  if (url.includes("/app/progress")) {
    return {
      type: "progress",
      category: "PROGRESS",
      title: "Readiness Tracker",
      description: "Track readiness score, velocity, and preparation metrics.",
      icon: TrendingUp,
      badgeClass: "bg-[#D8FAF4] text-[#0D7A68] border-[#0D7A68]/25",
      accentBorder: "hover:border-[#0D7A68]/40",
      btnText: "View Progress",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 6. Company Hiring Intelligence
  if (url.includes("/app/company-intel")) {
    return {
      type: "company",
      category: "COMPANY INTEL",
      title: "Company Hiring Intelligence",
      description: "Interview formats, topic distributions, and benchmark scores.",
      icon: Building2,
      badgeClass: "bg-[#E3EEFF] text-[#1D58B5] border-[#1D58B5]/25",
      accentBorder: "hover:border-[#1D58B5]/40",
      btnText: "View Intel",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 7. Resume ATS Scanner
  if (url.includes("/app/resume")) {
    return {
      type: "resume",
      category: "RESUME ATS",
      title: "Resume ATS Scanner",
      description: "Upload resume PDF to inspect ATS score and keyword matching.",
      icon: FileText,
      badgeClass: "bg-[#EFEAFF] text-[#6E44FF] border-[#6E44FF]/25",
      accentBorder: "hover:border-[#6E44FF]/40",
      btnText: "Scan Resume",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 8. HR & Behavioral Prep
  if (url.includes("/app/hr-prep")) {
    return {
      type: "hr",
      category: "BEHAVIORAL",
      title: "Behavioral & HR Preparation",
      description: "STAR method responses and leadership behavioral questions.",
      icon: BookOpen,
      badgeClass: "bg-[#FEF6D6] text-[#9E6700] border-[#9E6700]/25",
      accentBorder: "hover:border-[#9E6700]/40",
      btnText: "Start Prep",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 10. AI Mock Interview
  if (url.includes("/app/interview")) {
    return {
      type: "interview",
      category: "MOCK INTERVIEW",
      title: "Mock Interview Simulator",
      description: "Simulated technical and behavioral practice with feedback.",
      icon: Mic,
      badgeClass: "bg-[#FFE8E5] text-[#C7382B] border-[#C7382B]/25",
      accentBorder: "hover:border-[#C7382B]/40",
      btnText: "Start Interview",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 11. Matching Tech Jobs
  if (url.includes("/app/job") || url.includes("/app/jobs")) {
    return {
      type: "job",
      category: "JOB MATCHING",
      title: "Matching Tech Jobs",
      description: "Software engineering openings matching your skill profile.",
      icon: Briefcase,
      badgeClass: "bg-[#E3EEFF] text-[#1D58B5] border-[#1D58B5]/25",
      accentBorder: "hover:border-[#1D58B5]/40",
      btnText: "Browse Jobs",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 12. VTOP Portal Sync
  if (url.includes("/app/vtop")) {
    return {
      type: "vtop",
      category: "VTOP SYNC",
      title: "University VTOP Sync",
      description: "Sync university attendance, CGPA history, and grade records.",
      icon: Database,
      badgeClass: "bg-[#F2F0FA] text-[#17103D] border-[#E2DEEC]",
      accentBorder: "hover:border-[#17103D]/40",
      btnText: "Sync VTOP",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 13. Academic Ledger & Eligibility
  if (url.includes("/app/academics")) {
    return {
      type: "academics",
      category: "ACADEMICS",
      title: "Academic Ledger",
      description: "Verify university CGPA cutoffs, credits, and eligibility status.",
      icon: GraduationCap,
      badgeClass: "bg-[#F2F0FA] text-[#17103D] border-[#E2DEEC]",
      accentBorder: "hover:border-[#17103D]/40",
      btnText: "View Academics",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 14. Placement Arena Contests
  if (url.includes("/app/arena")) {
    return {
      type: "arena",
      category: "ARENA",
      title: "Coding Arena Contests",
      description: "Practice contests with timed evaluations and scoring.",
      icon: Swords,
      badgeClass: "bg-[#FEF6D6] text-[#9E6700] border-[#9E6700]/25",
      accentBorder: "hover:border-[#9E6700]/40",
      btnText: "Enter Arena",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 15. Candidate Profile
  if (url.includes("/app/profile")) {
    return {
      type: "profile",
      category: "PROFILE",
      title: "Candidate Profile",
      description: "Manage targets, connected profiles, and academic details.",
      icon: User,
      badgeClass: "bg-[#F2F0FA] text-[#17103D] border-[#E2DEEC]",
      accentBorder: "hover:border-[#17103D]/40",
      btnText: "Manage Profile",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 16. Development & Fullstack Projects
  if (url.includes("/app/development")) {
    return {
      type: "development",
      category: "PROJECTS",
      title: "Development Projects",
      description: "Full-stack project specifications and architecture assignments.",
      icon: FolderGit2,
      badgeClass: "bg-[#EFEAFF] text-[#6E44FF] border-[#6E44FF]/25",
      accentBorder: "hover:border-[#6E44FF]/40",
      btnText: "View Projects",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // 17. Dedicated AI Career Coach Studio
  if (url.includes("/app/coach") || url.includes("/onboarding")) {
    return {
      type: "coach",
      category: "CAREER COACH",
      title: "Career Coach Studio",
      description: "Interactive placement advisory, benchmark evaluation, and gap analysis.",
      icon: Sparkles,
      badgeClass: "bg-[#D8FAF4] text-[#0D7A68] border-[#0D7A68]/25",
      accentBorder: "hover:border-[#0D7A68]/40",
      btnText: "Open Coach",
      btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
    };
  }

  // Fallback General Surface
  return {
    type: "general",
    category: "ACTION",
    title: "Explore Platform Surface",
    description: "Navigate to this section to view details and update progress.",
    icon: Sparkles,
    badgeClass: "bg-[#F2F0FA] text-[#6F6A80] border-[#E2DEEC]",
    accentBorder: "hover:border-[#6E44FF]/40",
    btnText: "Open Surface",
    btnClass: "bg-[#17103D] hover:bg-[#24195A] text-white font-semibold",
  };
}

export default function ActionCard({
  url = "",
  customTitle,
  customDescription,
  action,
  onAction = () => {},
}) {
  const navigate = useNavigate();
  const targetUrl = url || action?.url || "";
  const title = customTitle || action?.label || action?.title;
  const description = customDescription || action?.description;

  const meta = getActionCardMeta(targetUrl);
  const Icon = meta.icon;
  const isInternal = targetUrl.startsWith("/app") || (targetUrl.startsWith("/") && !targetUrl.startsWith("//"));

  const handleClick = (e) => {
    e.preventDefault();
    if (!targetUrl) return;
    onAction?.();
    if (isInternal) {
      navigate(targetUrl);
    } else {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`my-2.5 p-3.5 rounded-2xl bg-white border border-[#E2DEEC] ${meta.accentBorder} hover:shadow-[0_6px_20px_rgba(23,16,61,0.06)] transition-all duration-200 cursor-pointer group shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none focus:outline-none focus:ring-2 focus:ring-[#6E44FF]/20`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#EFEAFF] border border-[#E2DEEC] flex items-center justify-center shrink-0 text-[#6E44FF] group-hover:scale-105 transition-transform">
          <Icon className="w-4 h-4 text-[#6E44FF]" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase tracking-wider font-bold ${meta.badgeClass}`}>
              {meta.category}
            </span>
          </div>
          <h4 className="text-xs font-heading font-bold text-[#17103D] tracking-tight group-hover:text-[#6E44FF] transition-colors truncate">
            {title || meta.title}
          </h4>
          <p className="text-[11px] text-[#6F6A80] leading-relaxed max-w-xl break-words line-clamp-2 sm:line-clamp-none font-sans font-medium">
            {description || meta.description}
          </p>
        </div>
      </div>

      <div className="shrink-0 w-full sm:w-auto flex justify-end">
        <button
          type="button"
          onClick={handleClick}
          className={`w-full sm:w-auto text-xs px-3.5 py-1.5 rounded-xl font-medium font-sans flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${meta.btnClass}`}
        >
          <span>{meta.btnText}</span>
          {isInternal ? (
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ExternalLink className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
