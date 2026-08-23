import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderGit2,
  GitFork,
  Star,
  Globe,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
  Cpu,
  Server,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Terminal,
  Activity,
  BookOpen,
  Check,
  ChevronRight,
  Play,
  Zap,
  TrendingUp,
  Sliders,
  Award,
  X,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";
import GpCard from "@/components/gp/GpCard";
import GpButton, { GpArrow } from "@/components/gp/GpButton";
import GitHubConnectCard from "@/components/github/GitHubConnectCard";
import { getDevMentorCopy } from "@/utils/dynamicCopy";

const DEV_LEARNING_TRACKS = [
  {
    id: "microservices",
    title: "Microservices Architecture & Resilience",
    category: "System Design",
    level: "Advanced",
    duration: "4.5 hrs",
    targetRoute: "/app/roadmap?track=system-design",
    topics: ["Event-Driven Architectures", "Circuit Breaker Pattern", "Kafka / RabbitMQ", "Service Mesh Basics"],
    description: "Design decoupled distributed systems with high availability, idempotent consumer APIs, and graceful degradation.",
  },
  {
    id: "docker-k8s",
    title: "Docker Containerization & Kubernetes Orchestration",
    category: "DevOps & Cloud",
    level: "Intermediate",
    duration: "3.5 hrs",
    targetRoute: "/app/roadmap?track=devops",
    topics: ["Multi-Stage Dockerfiles", "Pod Scheduling & Services", "Ingress & TLS", "Helm Charts"],
    description: "Package production services into lightweight containers and deploy scalable clusters on cloud infrastructure.",
  },
  {
    id: "caching-db",
    title: "High-Throughput Caching & Database Indexing",
    category: "Backend & Data",
    level: "Intermediate",
    duration: "3.0 hrs",
    targetRoute: "/app/roadmap?track=backend",
    topics: ["Redis Write-Through / Cache-Aside", "B-Tree vs Hash Indexing", "Query Execution Plans", "Connection Pooling"],
    description: "Eliminate API latency bottlenecks by optimizing PostgreSQL / MySQL schema indexes and distributed Redis memory tiers.",
  },
  {
    id: "security-auth",
    title: "Production Authentication, OAuth2 & Security",
    category: "Security",
    level: "Intermediate",
    duration: "2.5 hrs",
    targetRoute: "/app/roadmap?track=security",
    topics: ["JWT Refresh Rotation", "OAuth2 PKCE Flow", "CSRF & CORS Hardening", "Rate Limiting & WAF"],
    description: "Implement enterprise-grade authentication with cryptographically secure token lifecycles and OWASP top-10 defense.",
  },
  {
    id: "frontend-perf",
    title: "React Enterprise Architecture & Web Performance",
    category: "Frontend",
    level: "Advanced",
    duration: "3.8 hrs",
    targetRoute: "/app/roadmap?track=frontend",
    topics: ["Code Splitting & Lazy Loading", "Core Web Vitals (LCP, INP, CLS)", "Server-Side Rendering (SSR)", "State Architecture"],
    description: "Build zero-layout-shift UI experiences with minimal JavaScript bundle sizes and sub-100ms interaction latency.",
  },
  {
    id: "ci-cd",
    title: "Automated CI/CD Pipelines & Testing Automation",
    category: "DevOps",
    level: "Intermediate",
    duration: "2.0 hrs",
    targetRoute: "/app/roadmap?track=ci-cd",
    topics: ["GitHub Actions Workflows", "Automated Linting & Test Suites", "Staging Environments", "Semantic Versioning"],
    description: "Automate continuous testing, image building, and zero-downtime deployment pipelines triggered on main branch merges.",
  },
];

export default function Development() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Tab State: 'overview' | 'projects' | 'technologies' | 'requirements' | 'deployment' | 'learning'
  const [activeTab, setActiveTab] = useState("overview");

  // Dynamic Learning Tracks Progress State
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem("getplaced_dev_completed_topics");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleTopicCompletion = (trackId, topic) => {
    setCompletedTopics((prev) => {
      const trackSet = new Set(prev[trackId] || []);
      if (trackSet.has(topic)) {
        trackSet.delete(topic);
      } else {
        trackSet.add(topic);
      }
      const updated = { ...prev, [trackId]: Array.from(trackSet) };
      try {
        localStorage.setItem("getplaced_dev_completed_topics", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const getTrackProgress = (track) => {
    const userTopics = completedTopics[track.id] || [];
    if (!track.topics || track.topics.length === 0) return 0;
    return Math.min(100, Math.round((userTopics.length / track.topics.length) * 100));
  };

  // Data State
  const [userProfile, setUserProfile] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingGithub, setSyncingGithub] = useState(false);

  // Deployment Tester State
  const [testUrl, setTestUrl] = useState("");
  const [testingUrl, setTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [selectedRepoModal, setSelectedRepoModal] = useState(null);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, githubRes, gapRes, readinessRes] = await Promise.allSettled([
        axios.get(`${NODE_API_URL}/api/users/profile`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/github/profile`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/gap-analysis`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/readiness`, { withCredentials: true }),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value?.data) {
        setUserProfile(profileRes.value.data);
      }
      if (githubRes.status === "fulfilled" && githubRes.value?.data?.connected) {
        setGithubProfile(githubRes.value.data.profile);
      } else {
        setGithubProfile(null);
      }
      if (gapRes.status === "fulfilled" && gapRes.value?.data) {
        setGapData(gapRes.value.data);
      }
      if (readinessRes.status === "fulfilled" && readinessRes.value?.data) {
        setReadiness(readinessRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load Development workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // GSAP animation on tab change
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".gsap-reveal"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }
      );
    }
  }, [activeTab, loading]);

  // Sync GitHub Trigger
  const handleRefreshGithub = async () => {
    setSyncingGithub(true);
    try {
      const res = await axios.post(`${NODE_API_URL}/api/github/sync`, {}, { withCredentials: true });
      if (res.data?.profile) {
        setGithubProfile(res.data.profile);
      }
      fetchData();
    } catch (err) {
      console.warn("GitHub sync failed:", err);
    } finally {
      setSyncingGithub(false);
    }
  };

  // Test Live URL
  const handleVerifyLiveUrl = async (e) => {
    if (e) e.preventDefault();
    if (!testUrl.trim()) return;

    setTestingUrl(true);
    setTestResult(null);
    try {
      const res = await axios.get(`${NODE_API_URL}/api/github/verify-live`, {
        params: { url: testUrl.trim() },
        withCredentials: true,
      });
      setTestResult(res.data);
    } catch (err) {
      setTestResult({
        isLive: false,
        statusCode: 0,
        responseTimeMs: null,
        message: err.response?.data?.message || "Failed to reach host or connection timed out.",
      });
    } finally {
      setTestingUrl(false);
    }
  };

  // Extract technologies and projects categories from gapData
  const technologiesCategory = useMemo(() => {
    return gapData?.categories?.find((c) => c.id === "technologies") || null;
  }, [gapData]);

  const projectsCategory = useMemo(() => {
    return gapData?.categories?.find((c) => c.id === "projects") || null;
  }, [gapData]);

  const projectScore =
    githubProfile?.projectScore ??
    readiness?.dimensions?.projects?.score ??
    (projectsCategory?.currentLevel ? Math.round(projectsCategory.currentLevel * 10) : null);

  const targetScore = readiness?.dimensions?.projects?.requiredScore ?? null;

  const devMentor = useMemo(() => {
    return getDevMentorCopy({
      projectScore,
      targetScore: targetScore || 70,
      repoCount: githubProfile?.publicReposCount || (githubProfile?.repositories ? githubProfile.repositories.length : 0),
      targetCompany: userProfile?.targetCompany,
      topFramework: githubProfile?.languages?.[0]?.languageName,
    });
  }, [projectScore, targetScore, githubProfile, userProfile]);

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#FEF9CF] u-background-grid-dark-2 text-[#0D0431] p-4 md:p-8 lg:p-10 font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]">
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-8">
        
        {/* Workspace Top Header */}
        <header className="gsap-reveal flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-2 border-[#0D0431] pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border-2 border-[#0D0431] text-[#0D0431] text-xs font-bold font-sans shadow-[2px_2px_0_0_#0D0431]">
              <FolderGit2 className="w-4 h-4 text-[#896EE2]" />
              <span>Engineering Portfolio & Deployments</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-[#0D0431] tracking-tight">
              {devMentor.heading}
            </h1>
            <p className="text-[#0D0431]/80 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              {devMentor.subtitle}
            </p>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {githubProfile ? (
              <button
                type="button"
                onClick={handleRefreshGithub}
                disabled={syncingGithub}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FEDF6A] border-2 border-[#0D0431] text-[#0D0431] text-xs font-bold font-mono transition-all shadow-[3px_3px_0_0_#0D0431] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingGithub ? "animate-spin text-[#896EE2]" : "text-[#0D0431]"}`} />
                <span>{syncingGithub ? "Syncing..." : `Sync @${githubProfile.username}`}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] border-2 border-[#0D0431] text-[#0D0431] text-xs font-heading font-bold shadow-[3px_3px_0_0_#0D0431] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Connect GitHub</span>
              </button>
            )}

            <GpButton
              variant="stacked-yellow"
              size="sm"
              to="/app/roadmap"
            >
              <span>View Tech Roadmap</span>
            </GpButton>
          </div>
        </header>

        {/* 6 Workspace Pillar Tabs */}
        <nav className="gsap-reveal flex items-center gap-2 overflow-x-auto pb-2 font-sans text-xs no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "projects", label: "Projects & Repositories", icon: FolderGit2 },
            { id: "technologies", label: "Technology Profile", icon: Cpu },
            { id: "requirements", label: "Requirements & Evidence", icon: ShieldCheck },
            { id: "deployment", label: "Live Deployments", icon: Globe },
            { id: "learning", label: "Engineering Learning", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all border-2 border-[#0D0431] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isActive
                    ? "bg-[#0D0431] text-white shadow-[3px_3px_0_0_#FEDF6A]"
                    : "bg-white hover:bg-[#FEF9CF] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FEDF6A]" : "text-[#896EE2]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Hero Banner */}
            <section className="gsap-reveal rounded-3xl bg-white border-2 border-[#0D0431] shadow-[6px_6px_0_0_#0D0431] p-6 md:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <GpBadge theme="mint">
                      <Sparkles className="w-3 h-3 text-[#0D0431]" />
                      Project Readiness
                    </GpBadge>
                    <GpBadge theme="yellow">
                      15% Weight
                    </GpBadge>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-heading font-black text-[#0D0431] tracking-tight">
                      {projectScore !== null ? projectScore : "Unassessed"}
                    </span>
                    {projectScore !== null && <span className="text-lg font-mono font-bold text-[#0D0431]/60">/ 100</span>}

                    <div className="hidden sm:flex flex-col text-xs text-[#0D0431]/80 pl-4 border-l-2 border-[#0D0431]/20 space-y-0.5 font-mono font-semibold">
                      <div>
                        Target Bar: <span className="text-[#0D0431] font-bold">{targetScore !== null ? `${targetScore} / 100` : "N/A"}</span>
                      </div>
                      <div>
                        Status:{" "}
                        <span className={projectScore !== null && targetScore !== null && projectScore >= targetScore ? "text-[#896EE2] font-bold" : "text-[#F85B52] font-bold"}>
                          {projectScore !== null && targetScore !== null
                            ? projectScore >= targetScore ? "Target Met" : `Gap: -${targetScore - projectScore} pts`
                            : "Unassessed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl p-4 max-w-xl text-xs text-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                    <Sparkles className="w-4 h-4 text-[#896EE2] shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium">{devMentor.mentorTip}</p>
                  </div>
                </div>

                {/* Score vs Target Box */}
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-1 gap-3 bg-[#FEF9CF] border-2 border-[#0D0431] p-4 rounded-2xl shrink-0 text-xs shadow-[4px_4px_0_0_#0D0431]">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6">
                    <span className="text-[#0D0431]/70 font-semibold text-[11px]">Portfolio Score</span>
                    <span className="font-heading font-black text-[#0D0431]">{projectScore !== null ? `${projectScore}%` : "Unassessed"}</span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6 border-l-2 lg:border-l-0 lg:border-t-2 border-[#0D0431]/20 pl-3 lg:pl-0 lg:pt-2">
                    <span className="text-[#0D0431]/70 font-semibold text-[11px]">Benchmark</span>
                    <span className="font-heading font-black text-[#0D0431]">{targetScore !== null ? `${targetScore}%` : "N/A"}</span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6 border-l-2 lg:border-l-0 lg:border-t-2 border-[#0D0431]/20 pl-3 lg:pl-0 lg:pt-2">
                    <span className="text-[#0D0431]/70 font-semibold text-[11px]">Status</span>
                    <span className="font-bold text-[#896EE2]">
                      {githubProfile ? "Verified Profile" : "Not Connected"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t-2 border-[#0D0431]/10">
                <div className="flex justify-between text-[11px] font-mono font-bold text-[#0D0431]/70">
                  <span>Current: {projectScore !== null ? `${projectScore}%` : "Unassessed"}</span>
                  <span>Target Benchmark: {targetScore !== null ? `${targetScore}%` : "N/A"}</span>
                </div>
                <div className="relative w-full bg-[#FEF9CF] border-2 border-[#0D0431] rounded-full h-3 overflow-hidden">
                  {targetScore !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-[#0D0431] z-10"
                      style={{ left: `${targetScore}%` }}
                      title={`Target Benchmark: ${targetScore}%`}
                    />
                  )}
                  <div
                    className="h-full rounded-full bg-[#896EE2] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, projectScore || 0))}%` }}
                  />
                </div>
              </div>
            </section>

            {/* 4 Bento Stat Cards */}
            <section className="gsap-reveal grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-1">
                <div className="flex items-center justify-between text-[#0D0431]">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider">Public Repos</span>
                  <FolderGit2 className="w-4 h-4 text-[#896EE2]" />
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431]">
                  {githubProfile?.publicReposCount || (githubProfile?.repositories ? githubProfile.repositories.length : 0)}
                </div>
                <p className="text-[11px] text-[#0D0431]/70 font-semibold">
                  {githubProfile?.originalReposCount || 0} original projects
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-1">
                <div className="flex items-center justify-between text-[#0D0431]">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider">Total Stars</span>
                  <Star className="w-4 h-4 text-[#0D0431]" />
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431]">
                  {githubProfile?.totalStars || 0}
                </div>
                <p className="text-[11px] text-[#0D0431]/70 font-semibold">Across public repositories</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-1">
                <div className="flex items-center justify-between text-[#0D0431]">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider">Downstream Forks</span>
                  <GitFork className="w-4 h-4 text-[#0D0431]" />
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431]">
                  {githubProfile?.totalForks || 0}
                </div>
                <p className="text-[11px] text-[#0D0431]/70 font-semibold">Downstream repositories</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#CDE1FF] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] space-y-1">
                <div className="flex items-center justify-between text-[#0D0431]">
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider">Top Tech Stack</span>
                  <Code2 className="w-4 h-4 text-[#0D0431]" />
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431] truncate">
                  {githubProfile?.languages?.[0]?.languageName || "TypeScript"}
                </div>
                <p className="text-[11px] text-[#0D0431]/70 font-semibold">
                  {githubProfile?.languages?.length || 5} active languages
                </p>
              </div>
            </section>

            {/* Featured Projects Highlight */}
            <section className="gsap-reveal space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#0D0431] fill-[#FEDF6A]" />
                  <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-[#0D0431]">
                    Featured Repositories
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  className="text-xs font-bold text-[#896EE2] hover:text-[#0D0431] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View all repositories</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {githubProfile?.topRepositories && githubProfile.topRepositories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {githubProfile.topRepositories.slice(0, 3).map((repo, idx) => (
                    <div
                      key={repo.githubId || idx}
                      className="bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-2xl p-5 space-y-3 flex flex-col justify-between transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-heading font-black text-xs text-[#0D0431] hover:text-[#896EE2] truncate transition-colors"
                          >
                            {repo.name}
                          </a>
                          <span className="font-mono font-bold text-xs flex items-center gap-1 px-2 py-0.5 bg-[#FEDF6A] text-[#0D0431] rounded-lg border border-[#0D0431] shrink-0">
                            <Star className="w-3 h-3 fill-current" />
                            {repo.stars || 0}
                          </span>
                        </div>
                        <p className="text-xs text-[#0D0431]/80 line-clamp-2 leading-relaxed font-medium">
                          {repo.description || "Production repository codebase."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono font-semibold pt-3 text-[#0D0431]/70 border-t-2 border-[#0D0431]/10">
                        <span>{repo.language || "TypeScript"}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRepoModal(repo)}
                            className="text-[#0D0431] font-bold hover:bg-[#FEF9CF] px-2 py-1 rounded-lg border border-[#0D0431] transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          {repo.hasLiveDemo && repo.liveDemoUrl ? (
                            <a
                              href={repo.liveDemoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#896EE2] font-bold hover:underline flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Live Demo</span>
                            </a>
                          ) : (
                            <a
                              href={repo.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0D0431] hover:text-[#896EE2] font-bold flex items-center gap-1"
                            >
                              <span>Code</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white border-2 border-dashed border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] text-center space-y-3">
                  <FolderGit2 className="w-8 h-8 text-[#0D0431] mx-auto" />
                  <p className="text-xs text-[#0D0431]/80 font-medium">
                    Connect your GitHub account to import and evaluate repositories.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("projects")}
                    className="px-5 py-2.5 bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] rounded-xl text-xs font-bold cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    Connect GitHub
                  </button>
                </div>
              )}
            </section>

            {/* Quick Action Matrix Grid */}
            <section className="gsap-reveal grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab("technologies")}
                className="bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-2xl p-5 space-y-3 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431]">
                      <Cpu className="w-4 h-4 text-[#0D0431]" />
                    </div>
                    <h4 className="text-xs font-heading font-bold text-[#0D0431] group-hover:text-[#896EE2]">
                      Technology Profile
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
                  Compare verified technical proficiency against {userProfile?.targetJobRole || "Software Engineer"} benchmark requirements.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("deployment")}
                className="bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-2xl p-5 space-y-3 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#D4FDF7] border-2 border-[#0D0431]">
                      <Globe className="w-4 h-4 text-[#0D0431]" />
                    </div>
                    <h4 className="text-xs font-heading font-bold text-[#0D0431] group-hover:text-[#896EE2]">
                      Live Deployments
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
                  Test deployed project endpoints, check HTTP response codes, and verify latency.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("learning")}
                className="bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-2xl p-5 space-y-3 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#E4CDFB] border-2 border-[#0D0431]">
                      <BookOpen className="w-4 h-4 text-[#0D0431]" />
                    </div>
                    <h4 className="text-xs font-heading font-bold text-[#0D0431] group-hover:text-[#896EE2]">
                      Engineering Learning
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0D0431] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
                  Curated learning tracks covering system design, containerization, caching, and CI/CD.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: PROJECTS & REPOSITORIES */}
        {activeTab === "projects" && (
          <section className="gsap-reveal space-y-6">
            <GitHubConnectCard onProfileUpdate={() => fetchData()} />
          </section>
        )}

        {/* TAB 3: TECHNOLOGY PROFILE */}
        {activeTab === "technologies" && (
          <section className="gsap-reveal space-y-6">
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl shadow-[6px_6px_0_0_#0D0431] p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0431]/10">
                <div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#896EE2]" />
                    <h3 className="text-lg font-heading font-black text-[#0D0431]">
                      Technology Proficiency
                    </h3>
                  </div>
                  <p className="text-xs text-[#0D0431]/80 font-medium mt-1">
                    Evaluated technical proficiency against {userProfile?.targetJobRole || "Software Engineer"} requirements.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  <span className="text-[#0D0431]/70">Benchmark Bar:</span>
                  <GpBadge theme="yellow">
                    {userProfile?.targetCompany || "Tier-1 Tech"}
                  </GpBadge>
                </div>
              </div>

              {technologiesCategory?.items && technologiesCategory.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {technologiesCategory.items.map((skill) => {
                    const hasCurrent = skill.currentLevel !== null && skill.currentLevel !== undefined;
                    const gap = skill.gap;
                    const isAboveOrMeets = gap !== null && gap >= 0;

                    return (
                      <div
                        key={skill.id}
                        className="bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-heading font-black text-xs text-[#0D0431]">{skill.name}</span>
                            <GpBadge
                              theme={skill.importance === "Required" ? "light-purple" : "mint"}
                              size="sm"
                            >
                              {skill.importance}
                            </GpBadge>
                          </div>

                          <div className="space-y-1 font-mono font-semibold">
                            <div className="flex items-center justify-between text-xs text-[#0D0431]">
                              <span>
                                Level:{" "}
                                <strong className="text-[#0D0431] font-heading font-black">
                                  {hasCurrent ? `${skill.currentLevel}/10` : "Unassessed"}
                                </strong>
                              </span>
                              <span>
                                Required: <strong className="font-heading font-black">{skill.requiredLevel}/10</strong>
                              </span>
                            </div>

                            <div className="w-full bg-white border border-[#0D0431] rounded-full h-2.5 overflow-hidden relative">
                              <div
                                className="absolute top-0 bottom-0 w-1 bg-[#0D0431] z-10"
                                style={{ left: `${(skill.requiredLevel / 10) * 100}%` }}
                              />
                              <div
                                className={`h-full rounded-full ${
                                  hasCurrent ? (isAboveOrMeets ? "bg-[#896EE2]" : "bg-[#FEDF6A]") : "bg-[#0D0431]/20"
                                }`}
                                style={{ width: `${((skill.currentLevel || 0) / 10) * 100}%` }}
                              />
                            </div>
                          </div>

                          {skill.evidence && skill.evidence.length > 0 && (
                            <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium pt-1">
                              {skill.evidence[0]}
                            </p>
                          )}
                        </div>

                        {skill.improvementSteps && skill.improvementSteps.length > 0 && (
                          <div className="text-xs text-[#0D0431] pt-3 border-t-2 border-[#0D0431]/10 font-sans">
                            <span className="text-[#896EE2] font-heading font-bold text-[10px] uppercase block mb-0.5">
                              Recommended Action
                            </span>
                            <p className="line-clamp-2 font-medium">{skill.improvementSteps[0]}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#0D0431]/70 font-mono">
                  Loading technology profile...
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 4: REQUIREMENTS & EVIDENCE */}
        {activeTab === "requirements" && (
          <section className="gsap-reveal space-y-6">
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl shadow-[6px_6px_0_0_#0D0431] p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0431]/10">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#896EE2]" />
                    <h3 className="text-lg font-heading font-black text-[#0D0431]">
                      Requirements & Evidence
                    </h3>
                  </div>
                  <p className="text-xs text-[#0D0431]/80 font-medium mt-1">
                    Verified evidence from repositories, commit history, and coursework.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <GpBadge theme="mint">
                    Verified Evidence
                  </GpBadge>
                </div>
              </div>

              {projectsCategory?.items && projectsCategory.items.length > 0 ? (
                <div className="space-y-4">
                  {projectsCategory.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-heading font-black text-sm text-[#0D0431]">{item.name}</h4>
                        <div className="flex items-center gap-3 text-xs font-mono font-bold">
                          <span className="text-[#0D0431]/70">
                            Current:{" "}
                            <strong className="text-[#0D0431]">
                              {item.currentLevel !== null ? `${item.currentLevel}/10` : "Pending"}
                            </strong>
                          </span>
                          <span className="text-[#0D0431]">
                            Required: <strong className="text-[#896EE2]">{item.requiredLevel}/10</strong>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs font-medium">
                        <div className="space-y-1.5 bg-white border-2 border-[#0D0431] rounded-xl p-3.5 shadow-[2px_2px_0_0_#0D0431]">
                          <span className="text-[10px] uppercase font-heading font-bold text-[#0D0431] block">
                            Recorded Evidence
                          </span>
                          <ul className="space-y-1 text-[#0D0431]">
                            {item.evidence?.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-[#896EE2] shrink-0 mt-0.5" />
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5 bg-white border-2 border-[#0D0431] rounded-xl p-3.5 shadow-[2px_2px_0_0_#0D0431]">
                          <span className="text-[10px] uppercase font-heading font-bold text-[#896EE2] block">
                            Recommended Actions
                          </span>
                          <ul className="space-y-1 text-[#0D0431]">
                            {item.improvementSteps?.map((step, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ChevronRight className="w-3.5 h-3.5 text-[#896EE2] shrink-0 mt-0.5" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#0D0431]/70 font-mono">
                  Loading requirements...
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 5: LIVE DEPLOYMENTS */}
        {activeTab === "deployment" && (
          <section className="gsap-reveal space-y-6">
            {/* Live URL Tester Tool */}
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl shadow-[6px_6px_0_0_#0D0431] p-6 md:p-8 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#896EE2]" />
                  <h3 className="text-lg font-heading font-black text-[#0D0431]">Live Deployment Health Probe</h3>
                </div>
                <p className="text-xs text-[#0D0431]/80 font-medium max-w-xl">
                  Verify endpoint availability, SSL status, and response latency across deployed URLs.
                </p>
              </div>

              <form onSubmit={handleVerifyLiveUrl} className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
                <input
                  type="url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://your-project-demo.vercel.app"
                  className="flex-1 px-4 py-3 bg-white border-2 border-[#0D0431] rounded-2xl text-xs sm:text-sm text-[#0D0431] placeholder-[#0D0431]/40 shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] font-mono font-medium"
                  required
                />
                <button
                  type="submit"
                  disabled={testingUrl || !testUrl.trim()}
                  className="px-6 py-3 bg-[#FEDF6A] hover:bg-[#FFE995] disabled:opacity-50 text-[#0D0431] border-2 border-[#0D0431] rounded-2xl text-xs font-heading font-black shadow-[3px_3px_0_0_#0D0431] transition-all shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  {testingUrl ? "Probing..." : "Verify Endpoint"}
                </button>
              </form>

              {testResult && (
                <div
                  className={`p-4 rounded-2xl border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-xs font-mono space-y-2 ${
                    testResult.isLive
                      ? "bg-[#D4FDF7] text-[#0D0431]"
                      : "bg-[#FFC5B7] text-[#0D0431]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {testResult.isLive ? <CheckCircle2 className="w-4 h-4 text-[#0D0431]" /> : <AlertCircle className="w-4 h-4 text-[#0D0431]" />}
                      {testResult.isLive ? "HTTP 200 OK — Endpoint Accessible" : "Unreachable / Host Failure"}
                    </span>
                    {testResult.responseTimeMs && (
                      <span className="font-black">Latency: {testResult.responseTimeMs}ms</span>
                    )}
                  </div>
                  <p className="font-sans text-xs font-medium text-[#0D0431]">{testResult.message}</p>
                </div>
              )}
            </div>

            {/* Repositories with Live Demos List */}
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl shadow-[6px_6px_0_0_#0D0431] p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0D0431]/10">
                <h4 className="text-xs uppercase font-heading font-bold text-[#0D0431] tracking-wider">
                  Detected Repository Deployments
                </h4>
                <GpBadge theme="yellow">
                  {githubProfile?.repositories?.filter((r) => r.hasLiveDemo).length || 0} Demos Detected
                </GpBadge>
              </div>

              {githubProfile?.repositories?.filter((r) => r.hasLiveDemo).length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {githubProfile.repositories
                    .filter((r) => r.hasLiveDemo)
                    .map((repo) => (
                      <div
                        key={repo.githubId}
                        className="bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-black text-xs text-[#0D0431]">{repo.name}</span>
                            <GpBadge theme="mint" size="sm">
                              Live
                            </GpBadge>
                          </div>
                          <p className="text-xs text-[#0D0431]/80 mt-1 line-clamp-2 font-medium">
                            {repo.description || "Production deployment."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t-2 border-[#0D0431]/10 text-xs font-mono font-bold">
                          <a
                            href={repo.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#896EE2] hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>{repo.liveDemoUrl.replace(/^https?:\/\//, "")}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setTestUrl(repo.liveDemoUrl);
                              handleVerifyLiveUrl();
                            }}
                            className="text-xs text-[#0D0431] hover:text-[#896EE2] underline cursor-pointer"
                          >
                            Test Probe
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#0D0431]/80 font-mono space-y-2">
                  <Globe className="w-8 h-8 text-[#0D0431] mx-auto" />
                  <p className="font-bold text-[#0D0431]">No repository descriptions contain live demo links yet.</p>
                  <p className="text-[11px] text-[#0D0431]/70">
                    Include preview URLs in your repository homepage field or README to auto-detect.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 6: ENGINEERING LEARNING */}
        {activeTab === "learning" && (
          <section className="gsap-reveal space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-heading font-black uppercase tracking-wider text-[#0D0431]">
                  Engineering System Tracks
                </h3>
                <p className="text-xs text-[#0D0431]/80 font-medium mt-0.5">
                  Curated modules for distributed systems, containerization, and infrastructure.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DEV_LEARNING_TRACKS.map((track) => {
                const progressVal = getTrackProgress(track);
                const userTopics = new Set(completedTopics[track.id] || []);

                return (
                  <div
                    key={track.id}
                    className="bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <GpBadge theme="light-purple" size="sm">
                          {track.category}
                        </GpBadge>
                        <span className="text-xs font-mono font-bold text-[#0D0431]/70">{track.duration}</span>
                      </div>

                      <h4 className="text-sm font-heading font-black text-[#0D0431] leading-snug">{track.title}</h4>
                      <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">{track.description}</p>

                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-heading font-bold uppercase text-[#0D0431]/70 tracking-wider">
                          Module Topics (Click to mark complete):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {track.topics.map((t, idx) => {
                            const isDone = userTopics.has(t);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => toggleTopicCompletion(track.id, t)}
                                title={isDone ? "Mark topic incomplete" : "Mark topic complete"}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border border-[#0D0431] transition-all flex items-center gap-1 cursor-pointer ${
                                  isDone
                                    ? "bg-[#D4FDF7] text-[#0D0431] shadow-[1px_1px_0_0_#0D0431]"
                                    : "bg-[#FEF9CF] text-[#0D0431] hover:bg-[#FFE995]"
                                }`}
                              >
                                {isDone && <Check className="w-2.5 h-2.5 text-[#0D0431] stroke-[3]" />}
                                <span>{t}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t-2 border-[#0D0431]/10">
                      <div className="flex justify-between text-xs font-mono font-bold text-[#0D0431]/70">
                        <span>Dynamic Progress</span>
                        <span className="text-[#896EE2] font-black">{progressVal}%</span>
                      </div>
                      <div className="w-full bg-[#FEF9CF] border border-[#0D0431] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#896EE2] transition-all duration-300"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                      <Link
                        to={track.targetRoute || "/app/roadmap"}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] text-xs font-heading font-black uppercase tracking-wide shadow-[2px_2px_0_0_#0D0431] transition-all mt-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <Play className="w-3 h-3 fill-current text-[#0D0431]" />
                        <span>Start Track</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>

      {/* Progressive Project Detail Modal */}
      {selectedRepoModal && (
        <div
          onClick={() => setSelectedRepoModal(null)}
          className="fixed inset-0 bg-[#0D0431]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#0D0431] rounded-3xl max-w-lg w-full shadow-[8px_8px_0_0_#0D0431] overflow-hidden text-[#0D0431] animate-in zoom-in-95 duration-200"
          >
            {/* Modal Titlebar */}
            <div className="px-6 py-4 bg-[#FEF9CF] border-b-2 border-[#0D0431] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#896EE2]" />
                  <h3 className="text-base font-heading font-black text-[#0D0431]">
                    {selectedRepoModal.name}
                  </h3>
                  {selectedRepoModal.isFork && (
                    <GpBadge theme="yellow" size="sm">
                      Fork
                    </GpBadge>
                  )}
                </div>
                <p className="text-xs text-[#0D0431]/80 font-medium">
                  {selectedRepoModal.description || "Production repository codebase."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRepoModal(null)}
                className="p-1.5 rounded-full border-2 border-[#0D0431] bg-white hover:bg-[#F85B52] hover:text-white transition-all shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Metrics Matrix */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono font-bold">
                <div className="p-3 bg-[#FEF9CF] rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] text-[#0D0431]/70 block font-heading uppercase">Language</span>
                  <span className="text-sm font-black text-[#0D0431]">{selectedRepoModal.language || "TypeScript"}</span>
                </div>
                <div className="p-3 bg-[#E4CDFB] rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] text-[#0D0431]/70 block font-heading uppercase">Stars</span>
                  <span className="text-sm font-black text-[#0D0431]">{selectedRepoModal.stars || 0}</span>
                </div>
                <div className="p-3 bg-[#D4FDF7] rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  <span className="text-[10px] text-[#0D0431]/70 block font-heading uppercase">Forks</span>
                  <span className="text-sm font-black text-[#0D0431]">{selectedRepoModal.forks || 0}</span>
                </div>
              </div>

              {/* Architecture Verdict */}
              <div className="p-4 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl space-y-1 text-xs shadow-[3px_3px_0_0_#0D0431]">
                <span className="text-[10px] font-heading font-black uppercase tracking-wider text-[#896EE2] block">
                  Repository Assessment
                </span>
                <p className="text-[#0D0431] font-medium leading-relaxed text-xs">
                  {selectedRepoModal.isFork
                    ? "Open-source contribution and upstream repository fork."
                    : (selectedRepoModal.stars > 5 || selectedRepoModal.hasLiveDemo)
                    ? "Production project with verified architectural complexity."
                    : "Application repository. Add a live deployment URL to demonstrate availability."}
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t-2 border-[#0D0431]/10 flex items-center justify-between gap-3">
                {selectedRepoModal.hasLiveDemo && selectedRepoModal.liveDemoUrl && (
                  <a
                    href={selectedRepoModal.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Open Live Demo</span>
                  </a>
                )}
                <a
                  href={selectedRepoModal.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-[#FEF9CF] border-2 border-[#0D0431] text-[#0D0431] text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>View on GitHub</span>
                  <ExternalLink className="w-3 h-3 text-[#0D0431]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
