import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Building2,
  Search,
  Clock,
  ExternalLink,
  Brain,
  Code2,
  Award,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Terminal,
  Globe,
  Database,
  Server,
  Zap
} from "lucide-react";
import { PY_API_URL } from "@/config/api";

const FEATURED_COMPANIES_PRESET = [
  { name: "Google", slug: "google", tier: "Tier-1 Big Tech", industry: "Search / Cloud / AI", tag: "Googliness & Scalability" },
  { name: "Amazon", slug: "amazon", tier: "Tier-1 Big Tech", industry: "Cloud / E-Commerce", tag: "16 Leadership Principles" },
  { name: "Meta", slug: "meta", tier: "Tier-1 Big Tech", industry: "Social / AI / Systems", tag: "Move Fast & High Agency" },
  { name: "Microsoft", slug: "microsoft", tier: "Tier-1 Big Tech", industry: "Enterprise / Cloud", tag: "Growth Mindset" },
  { name: "Netflix", slug: "netflix", tier: "Tier-1 Streaming", industry: "Media / Distributed", tag: "Freedom & Responsibility" },
  { name: "Uber", slug: "uber", tier: "Tier-1 Real-time", industry: "Logistics / Dispatch", tag: "Geospatial & Low Latency" }
];

export default function CompanyIntelligence() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompany = searchParams.get("company") || "Google";

  const [searchQuery, setSearchQuery] = useState(initialCompany);
  const [companyIntel, setCompanyIntel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'rounds' | 'patterns' | 'culture' | 'stack'
  
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchCompanyIntelligence(initialCompany);
  }, []);

  const fetchCompanyIntelligence = async (companyName) => {
    if (!companyName || !companyName.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${PY_API_URL}/api/company/intelligence`, {
        params: { company: companyName.trim() }
      });
      setCompanyIntel(res.data);
      setSearchQuery(res.data.name || companyName);
      setSearchParams({ company: companyName.trim() }, { replace: true });
    } catch (e) {
      console.error("Failed to load company intelligence:", e);
    } finally {
      setLoading(false);
    }
  };

  useGSAP(() => {
    if (contentRef.current && companyIntel) {
      gsap.fromTo(
        contentRef.current.querySelectorAll(".bento-item"),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }
      );
    }
  }, [companyIntel, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchCompanyIntelligence(searchQuery.trim());
    }
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#07080b] text-zinc-100 font-sans selection:bg-violet-600 selection:text-white" ref={containerRef}>
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-violet-950/20 via-purple-950/10 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-violet-900/10 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        {/* Header Navigation Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-mono text-zinc-400">Enterprise Intelligence</div>
              <div className="text-sm font-semibold text-zinc-200">Engineering Hiring Dossiers</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/interview")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-2"
            >
              <Brain className="w-3.5 h-3.5 text-violet-400" />
              <span>Launch Mock Interview</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/coding")}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/50 transition-all flex items-center gap-2"
            >
              <Code2 className="w-3.5 h-3.5" />
              Problem Arena
            </button>
          </div>
        </header>

        {/* Interview Pillar Navigation Tabs Below Title */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs border-b border-zinc-900 pb-4">
          <Link
            to="/app/interview"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          >
            <Brain className="w-3.5 h-3.5 text-zinc-400" />
            <span>AI Mock Interview</span>
          </Link>
          <Link
            to="/app/hr-prep"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          >
            <Award className="w-3.5 h-3.5 text-zinc-400" />
            <span>HR & Leadership Prep</span>
          </Link>
          <Link
            to="/app/communication"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          >
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>Communication Lab</span>
          </Link>
          <Link
            to="/app/company-intel"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-white text-black font-semibold shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-violet-600" />
            <span>Company Intelligence</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <section className="space-y-6">
          <div className="max-w-5xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Technical Hiring Intelligence and Round-by-Round Calibration
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Exhaustive engineering dossiers, algorithmic frequency distributions, system design expectations, and cultural evaluation bars for tier-one technology companies.
            </p>
          </div>

          {/* Search & Fast Switch Command Bar */}
          <div className="p-2 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md shadow-2xl">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any company (e.g. Stripe, Uber, Atlassian, Google, Apple)..."
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900/90 border border-zinc-800/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/80 transition-all font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-lg shadow-violet-950/60 transition-all shrink-0 flex items-center justify-center gap-2"
              >
                {loading ? "Calibrating..." : "Analyze Dossier"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Profile Selectors */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-900 px-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase mr-1">Curated Profiles:</span>
              {FEATURED_COMPANIES_PRESET.map((comp) => {
                const isSelected =
                  companyIntel?.slug === comp.slug ||
                  companyIntel?.name?.toLowerCase().includes(comp.slug);
                return (
                  <button
                    key={comp.slug}
                    type="button"
                    onClick={() => fetchCompanyIntelligence(comp.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-violet-950/90 text-violet-200 border-violet-600 shadow-sm shadow-violet-900/30 font-semibold"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {comp.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dynamic Company Dossier */}
        {companyIntel && (
          <section ref={contentRef} className="space-y-8">
            {/* Dossier Header Banner */}
            <div className="bento-item rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start sm:items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-900 border border-violet-400/30 flex items-center justify-center text-white font-black text-2xl shadow-xl shrink-0">
                    {companyIntel.name?.charAt(0) || "C"}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {companyIntel.name}
                      </h2>
                      <span className="px-3 py-1 text-[11px] font-mono font-semibold rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/60">
                        {companyIntel.tier || "Tier-1 Tech"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                      <span>{companyIntel.industry}</span>
                      <span className="text-zinc-700">|</span>
                      <span>HQ: {companyIntel.headquarters || "Global"}</span>
                      <span className="text-zinc-700">|</span>
                      <span>Founded: {companyIntel.founded || "N/A"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/app/interview`)}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-violet-950/50 transition-all flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Launch {companyIntel.name} Mock Session
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/hr-prep`)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all flex items-center gap-2"
                  >
                    <Award className="w-4 h-4 text-violet-400" />
                    HR & Culture Calibration
                  </button>
                </div>
              </div>

              {/* Culture & Hiring Philosophy Thesis */}
              {companyIntel.culture_summary && (
                <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                  <span className="text-xs uppercase font-mono font-bold text-violet-400 block mb-1">
                    Hiring & Engineering Philosophy
                  </span>
                  {companyIntel.culture_summary}
                </div>
              )}

              {/* Dossier Filter Controls */}
              <div className="flex items-center gap-2 mt-6 pt-5 border-t border-zinc-900 overflow-x-auto pb-1">
                {[
                  { id: "all", label: "Full Dossier View", icon: Layers },
                  { id: "rounds", label: "Interview Rounds", icon: Clock },
                  { id: "patterns", label: "DSA & Problem Matrix", icon: Code2 },
                  { id: "culture", label: "Values & Behavioral Strategy", icon: Award },
                  { id: "stack", label: "Production Tech Stack", icon: Cpu }
                ].map((t) => {
                  const isActive = activeTab === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                        isActive
                          ? "bg-zinc-800 text-white border border-zinc-700 font-semibold"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-violet-400" : "text-zinc-500"}`} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GAPLESS BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 grid-flow-dense">
              
              {/* SECTION: ROUND-BY-ROUND INTERVIEW ARCHITECTURE */}
              {(activeTab === "all" || activeTab === "rounds") && companyIntel.interview_rounds && (
                <div className="bento-item md:col-span-12 lg:col-span-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight">
                            Round-by-Round Interview Architecture
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Sequence, format, focus areas, and passing bars
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {companyIntel.interview_rounds.length} Evaluation Stages
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {companyIntel.interview_rounds.map((round, idx) => (
                        <div
                          key={idx}
                          className="group rounded-2xl bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700 p-5 space-y-3 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-[11px] font-mono font-semibold">
                              Stage {round.round || idx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-violet-400" />
                              {round.duration || "45-60 mins"}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                            {round.title}
                          </h4>

                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-zinc-500 font-mono text-[10px] uppercase block">Format</span>
                              <span className="text-zinc-300 font-medium">{round.format}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 font-mono text-[10px] uppercase block">Focus Areas</span>
                              <span className="text-zinc-400">{round.focus}</span>
                            </div>
                            {round.passing_criteria && (
                              <div className="pt-2 border-t border-zinc-800/80">
                                <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-0.5">Passing Bar</span>
                                <p className="text-[11px] text-emerald-400 font-medium leading-relaxed">
                                  {round.passing_criteria}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>Target Bar: Optimal Big-O + Clean Modular Architecture</span>
                    <button
                      type="button"
                      onClick={() => navigate("/app/interview")}
                      className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1"
                    >
                      Simulate Full Pipeline <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: SIGNATURE BEHAVIORAL & STRATEGY */}
              {(activeTab === "all" || activeTab === "culture") && companyIntel.behavioral_questions && (
                <div className="bento-item md:col-span-12 lg:col-span-4 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
                      <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Signature Behavioral Bar
                        </h3>
                        <p className="text-xs text-zinc-400">
                          High-stakes scenarios & strategic answers
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {companyIntel.behavioral_questions.map((bq, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-zinc-900/60 border border-zinc-800/70 p-4 space-y-2.5 text-xs"
                        >
                          <p className="font-semibold text-zinc-200 leading-snug">
                            "{bq.question}"
                          </p>
                          <div className="pt-2 border-t border-zinc-800/80">
                            <span className="text-[10px] font-mono uppercase text-violet-400 block mb-0.5">
                              Strategic Framing Angle
                            </span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              {bq.strategy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => navigate("/app/hr-prep")}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all text-center"
                    >
                      Open Full Behavioral Studio
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: ALGORITHMIC PATTERNS & DIRECT CODING LINKS */}
              {(activeTab === "all" || activeTab === "patterns") && companyIntel.dsa_patterns && (
                <div className="bento-item md:col-span-12 lg:col-span-7 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Algorithmic Pattern Frequency Map
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Data structures and algorithms rigorously tested
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      LeetCode Mapped
                    </span>
                  </div>

                  <div className="space-y-3">
                    {companyIntel.dsa_patterns.map((pat, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-zinc-900/60 border border-zinc-800/70 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white font-mono">
                            {pat.pattern}
                          </h4>
                          <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-md border ${
                            pat.frequency === "Very High"
                              ? "bg-rose-950/60 text-rose-300 border-rose-800/60"
                              : pat.frequency === "High"
                              ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                              : "bg-zinc-800 text-zinc-300 border-zinc-700/60"
                          }`}>
                            {pat.frequency} Frequency
                          </span>
                        </div>

                        {pat.sample_problems && pat.sample_problems.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {pat.sample_problems.map((prob, pIdx) => (
                              <Link
                                key={pIdx}
                                to="/app/coding"
                                className="text-[11px] font-medium bg-zinc-950/80 hover:bg-violet-950/80 text-zinc-300 hover:text-violet-200 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-violet-700/60 transition-all flex items-center gap-1.5"
                              >
                                <span>{prob}</span>
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PRODUCTION TECH STACK */}
              {(activeTab === "all" || activeTab === "stack") && companyIntel.tech_stack && (
                <div className="bento-item md:col-span-12 lg:col-span-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
                    <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Production Stack & Architecture
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Primary frameworks and distributed systems
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(companyIntel.tech_stack).map(([category, items]) => {
                      const label = category.replace(/_/g, " ").toUpperCase();
                      return (
                        <div
                          key={category}
                          className="rounded-2xl bg-zinc-900/60 border border-zinc-800/70 p-4 space-y-2"
                        >
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                            {label}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(items) && items.map((tech, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] font-mono font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION: CORE VALUES & PREPARATION ROADMAP */}
              {(activeTab === "all" || activeTab === "culture") && (
                <div className="bento-item md:col-span-12 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-zinc-900">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Core Values and Strategic Preparation Roadmap
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Principles expected at interview debriefs and actionable prep steps
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/app/roadmap")}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      Open Personalized Roadmap <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Core Values */}
                    <div className="space-y-3">
                      <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                        Evaluated Values & Principles
                      </span>
                      <div className="space-y-2.5">
                        {companyIntel.core_values?.map((val, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/70 p-4 flex items-start gap-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-violet-950 border border-violet-800/60 text-violet-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              {val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prep Roadmap Steps */}
                    <div className="space-y-3">
                      <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                        Actionable Preparation Milestones
                      </span>
                      <div className="space-y-2.5">
                        {companyIntel.preparation_roadmap?.map((step, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl bg-zinc-900/60 border border-zinc-800/70 p-4 flex items-start gap-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Highlights / Recent News */}
                  {companyIntel.recent_highlights && companyIntel.recent_highlights.length > 0 && (
                    <div className="pt-4 border-t border-zinc-900 space-y-2">
                      <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                        Recent Engineering Initiatives & System Migrations
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {companyIntel.recent_highlights.map((h, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-300 leading-relaxed"
                          >
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </section>
        )}

      </div>
    </main>
  );
}

