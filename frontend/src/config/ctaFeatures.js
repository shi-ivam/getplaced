import {
  FileText,
  Code2,
  BrainCog,
  GraduationCap,
  Sparkles,
  Target,
  BarChart3,
  Briefcase,
  ShieldCheck,
  Terminal,
  Layers,
  Compass,
  CheckCircle2,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  BookOpen,
  Building2,
  FileCheck,
  Award,
  Flame,
  Bot,
  SlidersHorizontal,
} from "lucide-react";

/**
 * Top platform features from Features.md for the default/direct login view
 */
export const BEST_PLATFORM_FEATURES = [
  {
    id: "readiness",
    num: "01",
    title: "7-Dimension Placement Readiness Engine",
    tagline: "Dynamic 0-100% Score with Re-Normalized Weighting",
    desc: "Analyzes DSA, Technical Stack, GitHub Projects, Resume ATS, Academics, Communication, and Mock Interviews against Tier-1 company hiring bars.",
    icon: BarChart3,
    badge: "Core Brain",
    badgeTheme: "mint",
  },
  {
    id: "resume",
    num: "02",
    title: "AI Resume ATS Analyzer & 1-Click Action Center",
    tagline: "Google XYZ Formula Bullet Rewriting & PDF OCR",
    desc: "100-point ATS compliance scoring, automated skill gap extractor, and 1-click bullet point transformations (+6 pts gain).",
    icon: FileCheck,
    badge: "Recruiter Proof",
    badgeTheme: "yellow",
  },
  {
    id: "interview",
    num: "03",
    title: "Adaptive AI Mock Interview Simulator & Voice Telemetry",
    tagline: "Real-Time WPM Pacing, Filler Words & STAR Scoring",
    desc: "Multi-turn technical & behavioral rounds with speech analysis, STAR compliance detection, and post-session hiring scorecards.",
    icon: BrainCog,
    badge: "Biometric AI",
    badgeTheme: "coral",
  },
  {
    id: "sheets",
    num: "04",
    title: "28 Striver Curricula Hub (3,150 Problems & 2,088 Tutorials)",
    tagline: "Striver A2Z, Blind 75, SDE 180 & Offline Editorial Reader",
    desc: "Structured topic sheets with offline visual guides in C++, Java, and Python, embedded video lectures, and 1-click Monaco IDE launcher.",
    icon: Layers,
    badge: "28 Curricula",
    badgeTheme: "light-purple",
  },
  {
    id: "coding",
    num: "05",
    title: "Live Monaco Coding Workspace & Execution Sandbox",
    tagline: "Multi-Language Runner with AI Debugger & LeetCode Sync",
    desc: "Browser-based VS Code Monaco editor supporting Python 3, C++ 17, Java 21, and JS with sub-100ms execution and test validation.",
    icon: Terminal,
    badge: "Monaco Engine",
    badgeTheme: "yellow",
  },
  {
    id: "coach",
    num: "06",
    title: "getPlacedAI Autonomous Career Coach",
    tagline: "18-Tool Multi-Turn Gemini Agentic Engine",
    desc: "Autonomous AI advisor with 18 real callable tools to mutate database records, inspect gap benchmarks, and recalibrate preparation roadmaps.",
    icon: Bot,
    badge: "18 Tools",
    badgeTheme: "mint",
  },
  {
    id: "company_intel",
    num: "07",
    title: "500+ Company Recruiting Intelligence Dossiers",
    tagline: "Hiring Bars, CTC Packages, Formats & Question Archives",
    desc: "Dossiers covering round structures, cutoffs, compensation packages (Base, Bonus, Stocks), and recent candidate questions.",
    icon: Building2,
    badge: "500+ Dossiers",
    badgeTheme: "blue",
  },
  {
    id: "can_i_apply",
    num: "08",
    title: "Can I Apply? Shortlisting Probability & Cutoff Engine",
    tagline: "35+ Corporate CGPA Cutoffs & Backlog Safety Audits",
    desc: "Instant eligibility verification across 4 recruitment dimensions, identifying hard blockers before placement season starts.",
    icon: ShieldCheck,
    badge: "Safety Check",
    badgeTheme: "coral",
  },
  {
    id: "academics",
    num: "09",
    title: "VTOP University Academic Sync & Safe Bunks Calculator",
    tagline: "Encrypted Portal Sync & Attendance Debarment Warning",
    desc: "Reverse-engineered session sync for authoritative CGPA, attendance debarment warning (<75%), and mathematical safe bunks formula.",
    icon: GraduationCap,
    badge: "Live Portal Sync",
    badgeTheme: "light-purple",
  },
  {
    id: "roadmap",
    num: "10",
    title: "Placement Roadmap, Timeline Planner & Prestige Tiers",
    tagline: "4/8/12-Week Multi-Phase Sprints & iCal (.ics) Sync",
    desc: "Day-by-day customized preparation calendar with interactive task checklists, calendar sync, and bronze-to-diamond prestige tiers.",
    icon: Target,
    badge: "AI Roadmap",
    badgeTheme: "mint",
  },
];

export const CTA_FEATURES = {
  general: {
    id: "general",
    key: "general",
    aliases: ["default", "platform", "dashboard", "overview", "app", "all", "features"],
    title: "The Complete Placement Operating System",
    eyebrow: "ALL-IN-ONE CAREER PLATFORM",
    badge: "Placement Cockpit",
    badgeTheme: "light-purple",
    tagline: "Everything You Need to Prepare for Placements — Unified in One Cockpit",
    description:
      "getPlaced synthesizes algorithmic problem solving, Monaco IDE execution, ATS resume intelligence, voice mock interviews, university academic sync (VTOP), and autonomous AI career coaching into a unified candidate readiness engine.",
    stats: [
      { value: "7", label: "Readiness Dimensions" },
      { value: "3,150+", label: "Targeted Problems (28 Sheets)" },
      { value: "18", label: "Autonomous AI Coach Tools" },
    ],
    targetPath: "/app",
    previewType: "general",
    highlights: [
      {
        title: "7-Dimension Placement Readiness Score",
        desc: "Dynamic re-normalized score (0-100%) synthesizing DSA, Resume ATS, Speech Telemetry, Projects, and Academics.",
        icon: BarChart3,
      },
      {
        title: "AI Resume ATS Analyzer & 1-Click Action Center",
        desc: "Instant parsing, keyword gap detection, and Google XYZ formula rewrites (Accomplished [X], measured by [Y], by doing [Z]).",
        icon: FileCheck,
      },
      {
        title: "Adaptive AI Mock Interview Simulator",
        desc: "Live technical & behavioral rounds with real-time speech telemetry (WPM, filler words) and STAR scoring.",
        icon: BrainCog,
      },
      {
        title: "28 Curated DSA Sheets & Monaco IDE",
        desc: "Striver A2Z, Blind 75, SDE 180, 2,088 offline tutorials, and multi-language compiler sandbox.",
        icon: Layers,
      },
      {
        title: "VTOP Academic Sync & Corporate Cutoffs",
        desc: "Authoritative university portal sync, attendance safe bunks calculator, and 35+ company cutoff rules.",
        icon: GraduationCap,
      },
    ],
  },

  resume: {
    id: "resume",
    key: "resume",
    aliases: ["ats", "ats-resume", "analyze-resume", "resume-optimizer", "resume-ats"],
    title: "AI Resume ATS Optimizer",
    eyebrow: "RECRUITER-ALIGNED INTELLIGENCE",
    badge: "100% Recruiter-Proof",
    badgeTheme: "mint",
    tagline: "Beat Automated Screening Algorithms with 1-Click XYZ Formula Rewrites",
    description:
      "Our AI Resume Engine parses your resume against specific company job descriptions and Tier-1 hiring benchmarks. It pinpoints missing keywords, evaluates metric density, and rewrites weak bullets into quantified impact achievements.",
    stats: [
      { value: "94%", label: "Average ATS Score Improvement" },
      { value: "1-Click", label: "XYZ Formula Bullet Rewriting" },
      { value: "100%", label: "Recruiter-Proof Formatting" },
    ],
    targetPath: "/app/resume",
    previewType: "resume",
    highlights: [
      {
        title: "100-Point Algorithmic ATS Scorer",
        desc: "Instant breakdown across impact quantification, technical skill matching, strong action verbs, and structural readability.",
        icon: FileCheck,
      },
      {
        title: "Google XYZ Formula Bullet Rewriting",
        desc: "Converts passive job duties into high-impact accomplishments: 'Accomplished [X], measured by [Y], by doing [Z]'.",
        icon: Sparkles,
      },
      {
        title: "Automated Keyword & Skill Gap Extractor",
        desc: "Identifies required tech stacks and high-frequency industry keywords missing from your candidate profile.",
        icon: Target,
      },
      {
        title: "Dual PDF & OCR Extraction Pipeline",
        desc: "Seamlessly parses multi-column and custom-formatted resumes using Tesseract OCR and Gemini 1.5 Flash reasoning.",
        icon: Zap,
      },
      {
        title: "Exportable Recruiter-Ready PDF Reports",
        desc: "Download comprehensive audit summaries and sanitized, high-conversion resume templates with 1 click.",
        icon: FileText,
      },
    ],
  },

  sheets: {
    id: "sheets",
    key: "sheets",
    aliases: ["dsa", "dsa-sheets", "playlists", "study-sheets", "curricula"],
    title: "28 Curated DSA Sheets & Practice Hub",
    eyebrow: "CURATED PROBLEM SHEETS",
    badge: "28 Master Sheets",
    badgeTheme: "light-purple",
    tagline: "Master Striver A2Z, Blind 75, SDE 180 & 3,150+ Structured Problems",
    description:
      "Structured topic-by-topic learning pathways containing 28 verified industry sheets, comprehensive solution architectures, and 2,088 offline editorial articles in C++, Java, and Python.",
    stats: [
      { value: "28", label: "Curated Sheets" },
      { value: "3,150+", label: "Targeted Problems" },
      { value: "2,088", label: "Editorial Guides" },
    ],
    targetPath: "/app/sheets",
    previewType: "sheets",
    highlights: [
      {
        title: "Top Playlists Included",
        desc: "Striver A2Z, Striver SDE Sheet, Blind 75, NeetCode 150, Love Babbar 450, Fraz SDE Sheet, and SDE 180.",
        icon: Layers,
      },
      {
        title: "Offline Editorial Readers",
        desc: "Read complete visual diagrams, complexity proofs, and verified clean code implementations in C++, Java, and Python.",
        icon: BookOpen,
      },
      {
        title: "Problem Checklists & Progress Sync",
        desc: "Track completed questions, bookmark tricky patterns, and synchronize problem readiness directly with your dashboard.",
        icon: CheckCircle2,
      },
      {
        title: "Company Tag Frequency",
        desc: "Filter problems by frequency at Microsoft, Google, Amazon, Uber, Atlassian, and top product companies.",
        icon: Target,
      },
    ],
  },

  coding: {
    id: "coding",
    key: "coding",
    aliases: ["arena", "ide", "coding-workspace", "problems", "sandbox"],
    title: "Monaco IDE Coding Sandbox",
    eyebrow: "INTEGRATED DEVELOPMENT ENVIRONMENT",
    badge: "Monaco Engine",
    badgeTheme: "yellow",
    tagline: "Multi-Language Execution, Custom Test Cases & Instant LeetCode Sync",
    description:
      "Practice coding directly in the browser with an industry-grade Monaco IDE editor. Supports Python 3, C++ 17, Java 21, and JavaScript with sub-100ms compilation and automated test evaluation.",
    stats: [
      { value: "4", label: "Supported Languages" },
      { value: "<100ms", label: "Execution Sandbox" },
      { value: "Live", label: "LeetCode Profile Sync" },
    ],
    targetPath: "/app/coding",
    previewType: "coding",
    highlights: [
      {
        title: "Full-Featured Monaco Editor",
        desc: "VS Code keybindings, intelligent code completion, syntax highlighting, and customizable editor settings.",
        icon: Terminal,
      },
      {
        title: "Multi-Language Sandboxed Runner",
        desc: "Compile and execute Python, C++, Java, and JavaScript against standard and edge test suites.",
        icon: Cpu,
      },
      {
        title: "Custom Test Case Playground",
        desc: "Add custom inputs, inspect memory footprints, and measure precise execution time.",
        icon: Zap,
      },
      {
        title: "LeetCode Submission Sync",
        desc: "Connect your LeetCode handle to automatically sync solved problems and maintain a single source of truth.",
        icon: CheckCircle2,
      },
    ],
  },

  interview: {
    id: "interview",
    key: "interview",
    aliases: ["mock-interview", "interviews", "simulation", "mock"],
    title: "Adaptive AI Mock Interview Simulator",
    eyebrow: "REAL-TIME BIOMETRIC SIMULATION",
    badge: "FAANG Simulation",
    badgeTheme: "coral",
    tagline: "Realistic Coding & Behavioral Rounds with Live Speech & Gaze Telemetry",
    description:
      "Simulate high-stakes coding, system design, and behavioral interviews with conversational AI interviewers that adapt dynamically to your answers and challenge your design trade-offs.",
    stats: [
      { value: "99.4%", label: "Speech & Audio Telemetry" },
      { value: "Real-time", label: "Filler Word & Pacing Tracking" },
      { value: "Full", label: "Post-Round Scorecard" },
    ],
    targetPath: "/app/interview",
    previewType: "interview",
    highlights: [
      {
        title: "Dynamic Technical & Behavioral Rounds",
        desc: "Adaptive questions tailored to your target company (Amazon Leadership, Google Architecture, Microsoft SDE).",
        icon: BrainCog,
      },
      {
        title: "Live Speech & Confidence Telemetry",
        desc: "Real-time tracking of words per minute (WPM), articulation tone, filler word density, and gaze focus.",
        icon: Sparkles,
      },
      {
        title: "Comprehensive Rubric Scorecards",
        desc: "Receive actionable breakdowns on algorithmic optimality, code clean-up, communication clarity, and STAR structure.",
        icon: BarChart3,
      },
      {
        title: "Audio & Video Replay Analysis",
        desc: "Review past session transcripts and AI improvement pointers to eliminate interview anxiety.",
        icon: Clock,
      },
    ],
  },

  hr_prep: {
    id: "hr_prep",
    key: "hr_prep",
    aliases: ["hr", "behavioral", "star", "star-prep"],
    title: "HR & Behavioral STAR Framework Coach",
    eyebrow: "BEHAVIORAL STORYTELLING",
    badge: "STAR Method Engine",
    badgeTheme: "lime",
    tagline: "Master Storytelling for Amazon Leadership Principles & FAANG Behavioral Rounds",
    description:
      "Structure your career stories using Situation, Task, Action, and Result frameworks. Our AI coach critiques your storytelling, strengthens leadership emphasis, and ensures impact-driven narratives.",
    stats: [
      { value: "50+", label: "Real FAANG Scenarios" },
      { value: "16", label: "Amazon Principles" },
      { value: "Instant", label: "Storytelling Feedback" },
    ],
    targetPath: "/app/hr-prep",
    previewType: "hr_prep",
    highlights: [
      {
        title: "STAR Story Builder",
        desc: "Craft structured narratives covering Situation, Task, Action, and measurable Result for common behavioral prompts.",
        icon: Sparkles,
      },
      {
        title: "Leadership Principles Coverage",
        desc: "Targeted practice for Customer Obsession, Ownership, Bias for Action, Dive Deep, and Disagree & Commit.",
        icon: Target,
      },
      {
        title: "AI Narrative Polish",
        desc: "Identifies weak or rambling answers and generates punchy, memorable alternatives.",
        icon: Zap,
      },
      {
        title: "Question Bank by Company",
        desc: "Access verified behavioral questions asked during recent rounds at Top Tier employers.",
        icon: Building2,
      },
    ],
  },

  company_intel: {
    id: "company_intel",
    key: "company_intel",
    aliases: ["intel", "company", "dossiers", "companies"],
    title: "Company Recruiting Intelligence",
    eyebrow: "HIRING BAR INTELLIGENCE",
    badge: "500+ Company Dossiers",
    badgeTheme: "blue",
    tagline: "Hiring Bars, Compensation Brackets, Interview Formats & Question Archives",
    description:
      "Get the insider edge on 500+ tech employers. Discover exact round structures, cutoff CGPAs, compensation bands, recent candidate questions, and key preparation focus areas.",
    stats: [
      { value: "500+", label: "Company Profiles" },
      { value: "Verified", label: "CTC Compensation Bands" },
      { value: "2026", label: "Recent Question Archives" },
    ],
    targetPath: "/app/company-intel",
    previewType: "company_intel",
    highlights: [
      {
        title: "Round-by-Round Breakdown",
        desc: "Know exactly what to expect in Online Assessments, Technical Round 1, Technical Round 2, and Bar Raiser rounds.",
        icon: BarChart3,
      },
      {
        title: "Recent Interview Question Bank",
        desc: "Search candidate-reported questions asked in the latest placement cycles with solution guides.",
        icon: BookOpen,
      },
      {
        title: "CTC & Package Breakdown",
        desc: "Transparent breakdown of Base Pay, Joining Bonus, Relocation, and Stock ESOP vesting schedules.",
        icon: Briefcase,
      },
      {
        title: "Campus Cutoff Criteria",
        desc: "Review past CGPA cutoffs, allowed backlogs, and eligible academic branches for each visiting company.",
        icon: GraduationCap,
      },
    ],
  },

  jobs: {
    id: "jobs",
    key: "jobs",
    aliases: ["job", "job-market", "openings", "careers"],
    title: "Curated Jobs Market & AI Match",
    eyebrow: "OPPORTUNITY MATCHING",
    badge: "Live Market Feed",
    badgeTheme: "mint",
    tagline: "Verified Tech Openings Matched Directly to Your Profile & Readiness Score",
    description:
      "Browse thousands of verified software engineering, DevOps, data science, and frontend openings aggregated in real time. Our match engine highlights roles where you have highest callback odds.",
    stats: [
      { value: "1,000+", label: "Active Tech Listings" },
      { value: "AI Match", label: "Readiness Compatibility" },
      { value: "1-Click", label: "Direct Recruiter Links" },
    ],
    targetPath: "/app/jobs",
    previewType: "jobs",
    highlights: [
      {
        title: "Readiness Match Scoring",
        desc: "Instantly see how well your verified skills, DSA score, and resume ATS score match each job posting.",
        icon: Target,
      },
      {
        title: "Smart Filtering",
        desc: "Filter by location, tech stack, minimum CTC, experience level, remote flexibility, and university tier.",
        icon: Zap,
      },
      {
        title: "Direct Application Links",
        desc: "Bypass spammy aggregators with direct company portal application URLs.",
        icon: ArrowRight,
      },
      {
        title: "Application Pipeline Tracker",
        desc: "Track status across Applied, Screening, Interviewing, and Offered stages in one dashboard.",
        icon: CheckCircle2,
      },
    ],
  },

  role_fit: {
    id: "role_fit",
    key: "role_fit",
    aliases: ["which-role-fits-me", "role", "career-fit"],
    title: "Role Fit AI & Career Alignment",
    eyebrow: "CAREER SPECIALIZATION",
    badge: "Role Fit Engine",
    badgeTheme: "yellow",
    tagline: "Discover Which Software Engineering Track Aligns with Your Strengths",
    description:
      "Evaluate your coding preferences, project portfolio, and technical aptitude to determine your optimal career path: Backend, Frontend, Full Stack, SRE/DevOps, ML/AI, or Data Engineering.",
    stats: [
      { value: "7", label: "Engineering Tracks" },
      { value: "Radar", label: "Competency Heatmap" },
      { value: "Custom", label: "Learning Roadmaps" },
    ],
    targetPath: "/app/role-fit",
    previewType: "role_fit",
    highlights: [
      {
        title: "Multi-Track Competency Assessment",
        desc: "Diagnostic assessment measuring aptitude across architecture, algorithms, UI engineering, and systems.",
        icon: Compass,
      },
      {
        title: "Skill Gap Heatmap",
        desc: "Identifies the exact remaining tools and concepts you need to learn to meet the hiring threshold.",
        icon: BarChart3,
      },
      {
        title: "Market Demand & Salary Insights",
        desc: "Compare junior starting salaries and hiring velocity across different engineering specializations.",
        icon: TrendingUp,
      },
    ],
  },

  can_i_apply: {
    id: "can_i_apply",
    key: "can_i_apply",
    aliases: ["eligibility", "cutoff", "apply-check"],
    title: "Placement Eligibility & Cutoff Engine",
    eyebrow: "ELIGIBILITY AUDITOR",
    badge: "Instant Verification",
    badgeTheme: "coral",
    tagline: "Verify Company CGPA, Standing Arrears & Branch Eligibility Criteria",
    description:
      "Avoid last-minute disqualifications. Check your eligibility against 50+ visiting recruiters before placement season begins, and calculate what CGPA you need to maintain.",
    stats: [
      { value: "50+", label: "Company Cutoff Rules" },
      { value: "0-Arrear", label: "Safety Verification" },
      { value: "Forecast", label: "Target CGPA Simulator" },
    ],
    targetPath: "/app/can-i-apply",
    previewType: "can_i_apply",
    highlights: [
      {
        title: "Instant Eligibility Matrix",
        desc: "Real-time green/red status across all visiting tier-1, dream, and super-dream employers.",
        icon: ShieldCheck,
      },
      {
        title: "Target CGPA Calculator",
        desc: "Calculate the exact semester GPA needed across remaining terms to breach cutoff thresholds.",
        icon: GraduationCap,
      },
      {
        title: "Branch & History of Arrears Audit",
        desc: "Filters out companies that have strict 10th/12th percentage bars or standing backlog restrictions.",
        icon: CheckCircle2,
      },
    ],
  },

  academics: {
    id: "academics",
    key: "academics",
    aliases: ["vtop", "vtop-sync", "academic-intel", "cgpa"],
    title: "VTOP Sync & Academic Intelligence",
    eyebrow: "ACADEMIC SYNCHRONIZATION",
    badge: "Encrypted VTOP Sync",
    badgeTheme: "light-purple",
    tagline: "Authoritative University Portal Integration for CGPA & Placement Standing",
    description:
      "Securely sync your university academic credentials to verify authoritative CGPA, attendance thresholds, standing backlogs, and placement band eligibility (Super Dream, Dream, Regular).",
    stats: [
      { value: "Direct", label: "Student Portal Sync" },
      { value: "Real-time", label: "Arrears & Credits Audit" },
      { value: "100%", label: "Encrypted Privacy" },
    ],
    targetPath: "/app/academics",
    previewType: "academics",
    highlights: [
      {
        title: "Encrypted Portal Sync",
        desc: "Connects with student portals using zero-knowledge encryption to retrieve official academic standing.",
        icon: ShieldCheck,
      },
      {
        title: "Placement Band Calculator",
        desc: "Classifies candidate tier across Super Dream (₹10+ LPA), Dream (₹6-10 LPA), and Open categories.",
        icon: Award,
      },
      {
        title: "Attendance & Arrears Monitoring",
        desc: "Flags attendance deficits or pending backlogs that could trigger placement cell disqualification.",
        icon: GraduationCap,
      },
    ],
  },

  roadmap: {
    id: "roadmap",
    key: "roadmap",
    aliases: ["milestones", "plan", "timeline", "calendar"],
    title: "Dynamic Career Roadmap & Milestones",
    eyebrow: "PLACEMENT STRATEGY",
    badge: "AI Placement Roadmap",
    badgeTheme: "mint",
    tagline: "Day-by-Day Preparation Plan Calibrated to Your Target Dream Employer",
    description:
      "Follow an adaptive day-by-day roadmap that balances DSA sheet milestones, resume updates, mock interview rounds, and application deadlines based on your target company and graduation timeline.",
    stats: [
      { value: "Day-by-Day", label: "Target Schedule" },
      { value: ".ics Sync", label: "Google / Apple Calendar" },
      { value: "Adaptive", label: "Milestone Engine" },
    ],
    targetPath: "/app/roadmap",
    previewType: "roadmap",
    highlights: [
      {
        title: "Personalized Daily Schedule",
        desc: "Curates specific problems, system design topics, and behavioral exercises for each preparation day.",
        icon: Clock,
      },
      {
        title: "Calendar Export & Sync",
        desc: "Export your complete preparation roadmap as an iCal (.ics) file for Google Calendar, Apple Calendar, or Outlook.",
        icon: BookOpen,
      },
      {
        title: "Milestone Achievements",
        desc: "Unlock milestone badges as you clear topic milestones, reach ATS targets, and complete mock rounds.",
        icon: Target,
      },
    ],
  },
};

/**
 * Resolves a CTA key or alias to the canonical CTA feature definition.
 */
export function getCtaFeature(key) {
  if (!key) return CTA_FEATURES.general;
  const cleanKey = String(key).trim().toLowerCase();

  // Direct match
  if (CTA_FEATURES[cleanKey]) {
    return CTA_FEATURES[cleanKey];
  }

  // Alias lookup
  for (const feature of Object.values(CTA_FEATURES)) {
    if (feature.aliases && feature.aliases.includes(cleanKey)) {
      return feature;
    }
  }

  // Default to general/best features
  return CTA_FEATURES.general;
}

/**
 * List of primary features to display in the auth feature switcher tabs
 */
export const FEATURE_SWITCHER_TABS = [
  { id: "general", label: "⭐ Best Features", icon: Sparkles },
  { id: "resume", label: "ATS Resume", icon: FileText },
  { id: "sheets", label: "DSA Sheets (28)", icon: Layers },
  { id: "interview", label: "Mock Interviews", icon: BrainCog },
  { id: "coding", label: "Monaco IDE", icon: Terminal },
  { id: "company_intel", label: "Company Intel", icon: Building2 },
  { id: "academics", label: "VTOP Sync", icon: GraduationCap },
  { id: "roadmap", label: "AI Roadmap", icon: Target },
];
