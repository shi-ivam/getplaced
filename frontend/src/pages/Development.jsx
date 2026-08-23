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
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Check,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GitHubConnectCard from "@/components/github/GitHubConnectCard";
import { getDevMentorCopy } from "@/utils/dynamicCopy";

const DEV_LEARNING_TRACKS = [
  {
    id: "microservices",
    title: "Microservices Architecture & Resilience",
    category: "System Design",
    level: "Advanced",
    duration: "4.5 hrs",
    topics: ["Event-Driven Architectures", "Circuit Breaker Pattern", "Kafka / RabbitMQ", "Service Mesh Basics"],
    description: "Design decoupled distributed systems with high availability, idempotent consumer APIs, and graceful degradation.",
    progress: 75,
  },
  {
    id: "docker-k8s",
    title: "Docker Containerization & Kubernetes Orchestration",
    category: "DevOps & Cloud",
    level: "Intermediate",
    duration: "3.5 hrs",
    topics: ["Multi-Stage Dockerfiles", "Pod Scheduling & Services", "Ingress & TLS", "Helm Charts"],
    description: "Package production services into lightweight containers and deploy scalable clusters on cloud infrastructure.",
    progress: 90,
  },
  {
    id: "caching-db",
    title: "High-Throughput Caching & Database Indexing",
    category: "Backend & Data",
    level: "Intermediate",
    duration: "3.0 hrs",
    topics: ["Redis Write-Through / Cache-Aside", "B-Tree vs Hash Indexing", "Query Execution Plans", "Connection Pooling"],
    description: "Eliminate API latency bottlenecks by optimizing PostgreSQL / MySQL schema indexes and distributed Redis memory tiers.",
    progress: 60,
  },
  {
    id: "security-auth",
    title: "Production Authentication, OAuth2 & Security",
    category: "Security",
    level: "Intermediate",
    duration: "2.5 hrs",
    topics: ["JWT Refresh Rotation", "OAuth2 PKCE Flow", "CSRF & CORS Hardening", "Rate Limiting & WAF"],
    description: "Implement enterprise-grade authentication with cryptographically secure token lifecycles and OWASP top-10 defense.",
    progress: 40,
  },
  {
    id: "frontend-perf",
    title: "React Enterprise Architecture & Web Performance",
    category: "Frontend",
    level: "Advanced",
    duration: "3.8 hrs",
    topics: ["Code Splitting & Lazy Loading", "Core Web Vitals (LCP, INP, CLS)", "Server-Side Rendering (SSR)", "State Architecture"],
    description: "Build zero-layout-shift UI experiences with minimal JavaScript bundle sizes and sub-100ms interaction latency.",
    progress: 85,
  },
  {
    id: "ci-cd",
    title: "Automated CI/CD Pipelines & Testing Automation",
    category: "DevOps",
    level: "Intermediate",
    duration: "2.0 hrs",
    topics: ["GitHub Actions Workflows", "Automated Linting & Test Suites", "Staging Environments", "Semantic Versioning"],
    description: "Automate continuous testing, image building, and zero-downtime deployment pipelines triggered on main branch merges.",
    progress: 100,
  },
];

export default function Development() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Tab State: 'overview' | 'projects' | 'technologies' | 'requirements' | 'deployment' | 'learning'
  const [activeTab, setActiveTab] = useState("overview");

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
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 lg:p-10 font-sans selection:bg-zinc-800 selection:text-white">
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-8">
        
        {/* Workspace Top Header */}
        <header className="gsap-reveal flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
              {devMentor.heading}
            </h1>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl">
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium font-mono transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingGithub ? "animate-spin text-emerald-400" : "text-zinc-400"}`} />
                <span>{syncingGithub ? "Syncing..." : `Sync @${githubProfile.username}`}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Connect GitHub</span>
              </button>
            )}

            <Link
              to="/app/roadmap"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-colors font-sans"
            >
              <span>Tech Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </header>

        {/* Workspace Pillar Tabs */}
        <nav className="gsap-reveal flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "projects", label: "Projects & Repositories", icon: FolderGit2 },
            { id: "technologies", label: "Technology Profile", icon: Cpu },
            { id: "requirements", label: "Requirements & Evidence", icon: ShieldCheck },
            { id: "deployment", label: "Live Deployments", icon: Globe },
            { id: "learning", label: "Engineering Tracks", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                    : "bg-[#121215] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Hero Banner */}
            <section className="gsap-reveal rounded-2xl bg-[#121215] border border-zinc-800 p-6 md:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Project Readiness
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-bold font-mono text-zinc-100 tracking-tight">
                      {projectScore !== null ? projectScore : "Unassessed"}
                    </span>
                    {projectScore !== null && <span className="text-lg font-mono text-zinc-500">/ 100</span>}

                    <div className="hidden sm:flex flex-col text-xs text-zinc-400 pl-4 border-l border-zinc-800 space-y-0.5 font-mono">
                      <div>
                        Target Benchmark: <span className="text-zinc-200">{targetScore !== null ? `${targetScore} / 100` : "N/A"}</span>
                      </div>
                      <div>
                        Status:{" "}
                        <span className={projectScore !== null && targetScore !== null && projectScore >= targetScore ? "text-emerald-400" : "text-amber-400"}>
                          {projectScore !== null && targetScore !== null
                            ? projectScore >= targetScore ? "Target Met" : `Gap: -${targetScore - projectScore} pts`
                            : "Unassessed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 max-w-xl text-xs text-zinc-300">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-sans">{devMentor.mentorTip}</p>
                  </div>
                </div>

                {/* Score vs Target Box */}
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-1 gap-3 bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl shrink-0 text-xs font-mono">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6">
                    <span className="text-zinc-500 text-[11px]">Portfolio Score</span>
                    <span className="font-semibold text-emerald-400">{projectScore !== null ? `${projectScore}%` : "Unassessed"}</span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6 border-l lg:border-l-0 lg:border-t border-zinc-800 pl-3 lg:pl-0 lg:pt-2">
                    <span className="text-zinc-500 text-[11px]">Benchmark</span>
                    <span className="font-semibold text-zinc-300">{targetScore !== null ? `${targetScore}%` : "N/A"}</span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-6 border-l lg:border-l-0 lg:border-t border-zinc-800 pl-3 lg:pl-0 lg:pt-2">
                    <span className="text-zinc-500 text-[11px]">Status</span>
                    <span className="font-semibold text-zinc-200 font-sans">
                      {githubProfile ? "Verified Profile" : "Not Connected"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                  <span>Current: {projectScore !== null ? `${projectScore}%` : "Unassessed"}</span>
                  <span>Target Benchmark: {targetScore !== null ? `${targetScore}%` : "N/A"}</span>
                </div>
                <div className="relative w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  {targetScore !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 z-10"
                      style={{ left: `${targetScore}%` }}
                      title={`Target Benchmark: ${targetScore}%`}
                    />
                  )}
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, projectScore || 0))}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Bento Stat Cards */}
            <section className="gsap-reveal grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Public Repos</span>
                  <FolderGit2 className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-100">
                  {githubProfile?.publicReposCount || (githubProfile?.repositories ? githubProfile.repositories.length : 0)}
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {githubProfile?.originalReposCount || 0} original projects
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Total Stars</span>
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {githubProfile?.totalStars || 0}
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">Across repositories</p>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Forks</span>
                  <GitFork className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-200">
                  {githubProfile?.totalForks || 0}
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">Downstream forks</p>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition-colors space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Primary Language</span>
                  <Code2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-100 truncate">
                  {githubProfile?.languages?.[0]?.languageName || "TypeScript"}
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {githubProfile?.languages?.length || 0} active languages
                </p>
              </div>
            </section>

            {/* Featured Projects Highlight */}
            <section className="gsap-reveal space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                    Featured Repositories
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
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
                      className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-3 flex flex-col justify-between transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-xs text-zinc-200 hover:text-emerald-400 truncate font-mono"
                          >
                            {repo.name}
                          </a>
                          <span className="text-amber-400 font-mono text-[11px] flex items-center gap-0.5 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400/20" />
                            {repo.stars || 0}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {repo.description || "Production repository codebase."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono pt-2 text-zinc-500 border-t border-zinc-800">
                        <span>{repo.language || "TypeScript"}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRepoModal(repo)}
                            className="text-zinc-400 hover:text-emerald-400 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            [ Details ]
                          </button>
                          {repo.hasLiveDemo && repo.liveDemoUrl ? (
                            <a
                              href={repo.liveDemoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Live Demo</span>
                            </a>
                          ) : (
                            <a
                              href={repo.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-white flex items-center gap-1"
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
                <div className="p-8 rounded-xl bg-[#121215] border border-dashed border-zinc-800 text-center space-y-3">
                  <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400 font-mono">
                    Connect your GitHub account to import and evaluate repositories.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("projects")}
                    className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-semibold cursor-pointer"
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
                className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-3 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      Technology Profile
                    </h4>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Compare technical proficiency against {userProfile?.targetJobRole || "Software Engineer"} benchmark requirements.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("deployment")}
                className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-3 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-zinc-300" />
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      Live Deployments
                    </h4>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Probe deployed project endpoints, check HTTP status, and verify latency.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("learning")}
                className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-3 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      Engineering Tracks
                    </h4>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Structured modules covering system design, containerization, caching, and CI/CD.
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
            <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-zinc-100">
                      Technology Proficiency
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Evaluated technical proficiency against {userProfile?.targetJobRole || "Software Engineer"} requirements.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-500">Benchmark:</span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold">
                    {userProfile?.targetCompany || "Tier-1 Tech"}
                  </span>
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
                        className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-zinc-200">{skill.name}</span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                skill.importance === "Required"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  : "bg-zinc-900 text-zinc-400 border-zinc-800"
                              }`}
                            >
                              {skill.importance}
                            </span>
                          </div>

                          <div className="space-y-1 font-mono">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-zinc-500 text-[11px]">
                                Level:{" "}
                                <strong className="text-zinc-200">
                                  {hasCurrent ? `${skill.currentLevel}/10` : "Unassessed"}
                                </strong>
                              </span>
                              <span className="text-zinc-400 text-[11px]">
                                Required: <strong>{skill.requiredLevel}/10</strong>
                              </span>
                            </div>

                            <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden relative">
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 z-10"
                                style={{ left: `${(skill.requiredLevel / 10) * 100}%` }}
                              />
                              <div
                                className={`h-full rounded-full ${
                                  hasCurrent ? (isAboveOrMeets ? "bg-emerald-400" : "bg-amber-400") : "bg-zinc-800"
                                }`}
                                style={{ width: `${((skill.currentLevel || 0) / 10) * 100}%` }}
                              />
                            </div>
                          </div>

                          {skill.evidence && skill.evidence.length > 0 && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans pt-1">
                              {skill.evidence[0]}
                            </p>
                          )}
                        </div>

                        {skill.improvementSteps && skill.improvementSteps.length > 0 && (
                          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800 font-sans">
                            <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold block mb-0.5">
                              Recommended Action
                            </span>
                            <p className="line-clamp-2">{skill.improvementSteps[0]}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500 font-mono">
                  Loading technology profile...
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 4: REQUIREMENTS & EVIDENCE */}
        {activeTab === "requirements" && (
          <section className="gsap-reveal space-y-6">
            <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-zinc-100">
                    Requirements & Evidence
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Verified evidence from repositories, commit history, and coursework.
                </p>
              </div>

              {projectsCategory?.items && projectsCategory.items.length > 0 ? (
                <div className="space-y-4">
                  {projectsCategory.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-semibold text-sm text-zinc-100">{item.name}</h4>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-zinc-400">
                            Current:{" "}
                            <strong className="text-zinc-200">
                              {item.currentLevel !== null ? `${item.currentLevel}/10` : "Pending"}
                            </strong>
                          </span>
                          <span className="text-zinc-400">
                            Required: <strong className="text-emerald-400">{item.requiredLevel}/10</strong>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono font-bold text-zinc-500">
                            Recorded Evidence
                          </span>
                          <ul className="space-y-1 text-zinc-300">
                            {item.evidence?.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
                            Recommended Actions
                          </span>
                          <ul className="space-y-1 text-zinc-400">
                            {item.improvementSteps?.map((step, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
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
                <div className="p-8 text-center text-xs text-zinc-500 font-mono">
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
            <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-zinc-300" />
                  <h3 className="text-base font-bold text-zinc-100">Live Deployment Health Probe</h3>
                </div>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Verify endpoint availability, SSL status, and response latency across deployed URLs.
                </p>
              </div>

              <form onSubmit={handleVerifyLiveUrl} className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
                <input
                  type="url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://your-project-demo.vercel.app"
                  className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={testingUrl || !testUrl.trim()}
                  className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-50 rounded-xl text-xs font-semibold shadow transition-all shrink-0 cursor-pointer font-mono"
                >
                  {testingUrl ? "Probing..." : "Verify Endpoint"}
                </button>
              </form>

              {testResult && (
                <div
                  className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                    testResult.isLive
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {testResult.isLive ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                      {testResult.isLive ? "HTTP 200 OK — Endpoint Accessible" : "Unreachable / Host Failure"}
                    </span>
                    {testResult.responseTimeMs && (
                      <span className="text-zinc-400">Latency: {testResult.responseTimeMs}ms</span>
                    )}
                  </div>
                  <p className="text-zinc-400 font-sans text-xs">{testResult.message}</p>
                </div>
              )}
            </div>

            {/* Repositories with Live Demos List */}
            <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h4 className="text-xs uppercase font-mono font-bold text-zinc-300 tracking-wider">
                  Detected Deployments
                </h4>
                <span className="text-xs font-mono text-zinc-500">
                  {githubProfile?.repositories?.filter((r) => r.hasLiveDemo).length || 0} Demos Detected
                </span>
              </div>

              {githubProfile?.repositories?.filter((r) => r.hasLiveDemo).length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {githubProfile.repositories
                    .filter((r) => r.hasLiveDemo)
                    .map((repo) => (
                      <div
                        key={repo.githubId}
                        className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white font-mono">{repo.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Live
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                            {repo.description || "Production deployment."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-mono">
                          <a
                            href={repo.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-300 hover:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3 text-zinc-400" />
                            <span>{repo.liveDemoUrl.replace(/^https?:\/\//, "")}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setTestUrl(repo.liveDemoUrl);
                              handleVerifyLiveUrl();
                            }}
                            className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400 font-mono space-y-2">
                  <Globe className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p>No repository descriptions contain live demo links yet.</p>
                  <p className="text-zinc-500 text-[11px]">
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
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                  Engineering Tracks
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Curated modules for distributed systems, containerization, and infrastructure.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEV_LEARNING_TRACKS.map((track) => (
                <div
                  key={track.id}
                  className="bg-[#121215] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-4 flex flex-col justify-between transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-semibold">
                        {track.category}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">{track.duration}</span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-100 leading-snug">{track.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{track.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {track.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded text-[10px] font-mono border border-zinc-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-zinc-800">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                      <span>Progress</span>
                      <span className="text-emerald-400 font-semibold">{track.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${track.progress}%` }}
                      />
                    </div>
                    <Link
                      to="/app/dsa"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-colors font-mono mt-1"
                    >
                      <Play className="w-3 h-3 fill-current text-emerald-400" />
                      <span>Start Track</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Progressive Project Detail Modal */}
      {selectedRepoModal && (
        <div
          onClick={() => setSelectedRepoModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
          >
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white font-mono">
                    {selectedRepoModal.name}
                  </h3>
                  {selectedRepoModal.isFork && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                      Fork
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  {selectedRepoModal.description || "Production repository codebase."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRepoModal(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Language</span>
                <span className="font-bold text-zinc-200">{selectedRepoModal.language || "TypeScript"}</span>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Stars</span>
                <span className="font-bold text-amber-400">{selectedRepoModal.stars || 0}</span>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Forks</span>
                <span className="font-bold text-zinc-200">{selectedRepoModal.forks || 0}</span>
              </div>
            </div>

            {/* Architecture Verdict */}
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                Repository Assessment
              </span>
              <p className="text-zinc-300 font-sans leading-relaxed text-xs">
                {selectedRepoModal.isFork
                  ? "Open-source contribution and upstream repository fork."
                  : (selectedRepoModal.stars > 5 || selectedRepoModal.hasLiveDemo)
                  ? "Production project with verified architectural complexity."
                  : "Application repository. Add a live deployment URL to demonstrate availability."}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
              {selectedRepoModal.hasLiveDemo && selectedRepoModal.liveDemoUrl && (
                <a
                  href={selectedRepoModal.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open Live Demo</span>
                </a>
              )}
              <a
                href={selectedRepoModal.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
