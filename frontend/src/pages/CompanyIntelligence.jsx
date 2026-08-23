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
  ArrowRight,
  ChevronRight,
  Globe,
  Zap,
} from "lucide-react";
import { PY_API_URL } from "@/config/api";

function FrequencyBadge({ value }) {
  const getStyle = (val) => {
    switch (val) {
      case "Very High":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "High":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Medium":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-800";
    }
  };

  return (
    <span
      className={`font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStyle(
        value
      )}`}
    >
      {value}
    </span>
  );
}

export default function CompanyIntelligence() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompany = searchParams.get("company") || "Google";

  const [searchQuery, setSearchQuery] = useState(initialCompany);
  const [companyIntel, setCompanyIntel] = useState(null);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchCompanyIntelligence(initialCompany);
    fetchFeaturedCompanies();
  }, []);

  const fetchFeaturedCompanies = async () => {
    try {
      const res = await axios.get(`${PY_API_URL}/api/company/featured`);
      if (res.data?.companies) setFeaturedCompanies(res.data.companies);
    } catch (e) {
      console.warn("Could not fetch featured companies:", e);
      setFeaturedCompanies([]);
    }
  };

  const fetchCompanyIntelligence = async (companyName) => {
    if (!companyName?.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${PY_API_URL}/api/company/intelligence`, {
        params: { company: companyName.trim() },
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
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" }
      );
    }
  }, [companyIntel, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) fetchCompanyIntelligence(searchQuery.trim());
  };

  const tabs = [
    { id: "all", label: "Full Dossier", icon: Layers },
    { id: "rounds", label: "Interview Rounds", icon: Clock },
    { id: "patterns", label: "DSA Matrix", icon: Code2 },
    { id: "culture", label: "Values & Behaviour", icon: Award },
    { id: "stack", label: "Tech Stack", icon: Cpu },
  ];

  return (
    <main
      ref={containerRef}
      className="overflow-x-hidden w-full max-w-full bg-[#09090b] text-zinc-100 min-h-screen font-sans selection:bg-zinc-800 selection:text-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight max-w-4xl mx-auto leading-tight">
            Engineering Hiring Dossiers
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Algorithmic pattern frequency, round structures, leadership standards, and production architectures.
          </p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center gap-2 overflow-x-auto pb-1 font-mono text-xs border-b border-zinc-800 pb-4">
          <Link
            to="/app/interview"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-[#121215] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          >
            <Brain className="w-3.5 h-3.5 text-zinc-400" />
            <span>Mock Interview</span>
          </Link>
          <Link
            to="/app/hr-prep"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-[#121215] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
          >
            <Award className="w-3.5 h-3.5 text-zinc-400" />
            <span>HR & Leadership</span>
          </Link>
          <Link
            to="/app/company-intel"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Intelligence</span>
          </Link>
        </nav>

        {/* Search & Curated Bar */}
        <section className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 md:p-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company — Stripe, Uber, Atlassian, Google..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              <span>{loading ? "Loading..." : "View Dossier"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {featuredCompanies.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Curated:
              </span>
              {featuredCompanies.map((comp) => {
                const slug = comp.slug || comp.name?.toLowerCase().replace(/\s+/g, "");
                const isSelected =
                  companyIntel?.slug === slug || companyIntel?.name?.toLowerCase().includes(slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => fetchCompanyIntelligence(comp.name)}
                    className={`text-[11px] font-mono px-3 py-1 rounded-full border transition cursor-pointer ${
                      isSelected
                        ? "bg-zinc-100 text-zinc-950 font-semibold border-zinc-100"
                        : "bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800"
                    }`}
                  >
                    {comp.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Dossier Content */}
        {companyIntel && (
          <section ref={contentRef} className="space-y-6">
            {/* Company Banner Hero */}
            <div className="bento-item bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
              {/* Identity Row */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-xl text-white font-mono shrink-0">
                    {companyIntel.name?.charAt(0) || "C"}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl md:text-2xl font-bold text-white">
                        {companyIntel.name}
                      </h2>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-950 text-zinc-400 border border-zinc-800">
                        {companyIntel.tier || "Tier-1 Tech"}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-400 flex flex-wrap items-center gap-2">
                      <span>{companyIntel.industry}</span>
                      <span className="text-zinc-600">•</span>
                      <span>HQ: {companyIntel.headquarters || "Global"}</span>
                      <span className="text-zinc-600">•</span>
                      <span>Founded {companyIntel.founded || "N/A"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate("/app/interview")}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold transition font-mono cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Mock Session</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/app/hr-prep")}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-medium border border-zinc-800 transition font-mono cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    <span>HR Prep</span>
                  </button>
                </div>
              </div>

              {/* 4 Snapshot Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-zinc-800">
                {[
                  {
                    tab: "all",
                    icon: Globe,
                    label: "Scale & Market",
                    title: companyIntel.industry || "Distributed Platforms",
                    body: "Distributed systems and platforms at enterprise & consumer scale.",
                  },
                  {
                    tab: "stack",
                    icon: Cpu,
                    label: "Architecture",
                    title: companyIntel.tech_stack?.languages?.slice(0, 2).join(", ") || "Go, Java, C++",
                    body: companyIntel.tech_stack?.frameworks?.slice(0, 3).join(" · ") || "Microservices, distributed caching, cloud infra.",
                  },
                  {
                    tab: "culture",
                    icon: Award,
                    label: "Culture & Values",
                    title: "Leadership Standards",
                    body: "STAR evaluation on ownership, customer obsession, and excellence.",
                  },
                  {
                    tab: "rounds",
                    icon: Clock,
                    label: "Hiring Process",
                    title: "Technical & System Rounds",
                    body: "Big-O complexity, modular design, and behavioral alignment.",
                  },
                ].map(({ tab, icon: Icon, label, title, body }) => (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-2 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-zinc-400" />
                        {label}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{title}</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{body}</p>
                  </div>
                ))}
              </div>

              {/* Culture Principle Highlight */}
              {companyIntel.culture_summary && (
                <div className="flex items-start gap-3 pt-5 border-t border-zinc-800">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      Engineering & Hiring Philosophy
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {companyIntel.culture_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Filter Strip */}
              <div className="flex items-center gap-2 pt-5 border-t border-zinc-800 overflow-x-auto">
                {tabs.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                          : "bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bento Grid Sections */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* INTERVIEW ROUNDS */}
              {(activeTab === "all" || activeTab === "rounds") && companyIntel.interview_rounds && (
                <div className="bento-item md:col-span-12 lg:col-span-8 bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Interview Round Structure</h3>
                        <p className="text-xs text-zinc-400">Format, focus areas, and passing criteria</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">
                      {companyIntel.interview_rounds.length} Stages
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {companyIntel.interview_rounds.map((round, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-semibold">
                            Stage {round.round || idx + 1}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {round.duration || "45–60 min"}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white">{round.title}</h4>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                              Format
                            </span>
                            <span className="text-zinc-300 font-medium">{round.format}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                              Focus Areas
                            </span>
                            <span className="text-zinc-400">{round.focus}</span>
                          </div>
                          {round.passing_criteria && (
                            <div className="pt-2 border-t border-zinc-900">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-1">
                                Passing Bar
                              </span>
                              <p className="text-zinc-300 text-[11px] leading-relaxed">
                                {round.passing_criteria}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <span className="text-xs font-mono text-zinc-500">
                      Standard: Optimal Big-O · Modular Architecture
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/app/interview")}
                      className="text-xs font-mono font-bold text-white hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Practice Rounds</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* BEHAVIORAL EVALUATION */}
              {(activeTab === "all" || activeTab === "culture") && companyIntel.behavioral_questions && (
                <div className="bento-item md:col-span-12 lg:col-span-4 bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-zinc-800">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Behavioral Evaluation</h3>
                        <p className="text-xs text-zinc-400">Scenario questions & framing</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {companyIntel.behavioral_questions.map((bq, idx) => (
                        <div key={idx} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                          <p className="text-xs font-semibold text-white italic leading-snug">
                            "{bq.question}"
                          </p>
                          <div className="pt-2 border-t border-zinc-900 space-y-0.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                              Strategic Framing
                            </span>
                            <p className="text-xs text-zinc-400 leading-relaxed">{bq.strategy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => navigate("/app/hr-prep")}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold font-mono transition cursor-pointer"
                    >
                      Practice Behavioral Questions
                    </button>
                  </div>
                </div>
              )}

              {/* DSA PATTERN MAP */}
              {(activeTab === "all" || activeTab === "patterns") && companyIntel.dsa_patterns && (
                <div className="bento-item md:col-span-12 lg:col-span-7 bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">DSA Pattern Frequency</h3>
                        <p className="text-xs text-zinc-400">Data structure & algorithm patterns tested</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {companyIntel.dsa_patterns.map((pat, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-mono text-xs font-bold text-white">{pat.pattern}</h4>
                          <FrequencyBadge value={pat.frequency} />
                        </div>
                        {pat.sample_problems?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {pat.sample_problems.map((prob, pIdx) => (
                              <Link
                                key={pIdx}
                                to="/app/coding"
                                className="font-mono text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition"
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

              {/* PRODUCTION TECH STACK */}
              {(activeTab === "all" || activeTab === "stack") && companyIntel.tech_stack && (
                <div className="bento-item md:col-span-12 lg:col-span-5 bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Production Tech Stack</h3>
                      <p className="text-xs text-zinc-400">Primary languages, frameworks & infra</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(companyIntel.tech_stack).map(([category, items]) => (
                      <div
                        key={category}
                        className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2"
                      >
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                          {category.replace(/_/g, " ")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(items) &&
                            items.map((tech, tIdx) => (
                              <span
                                key={tIdx}
                                className="font-mono text-[11px] text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CORE VALUES & PREP ROADMAP */}
              {(activeTab === "all" || activeTab === "culture") && (
                <div className="bento-item md:col-span-12 bg-[#121215] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Core Values & Preparation Milestones
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Principles evaluated during debrief and targeted preparation milestones
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/app/roadmap")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold font-mono transition cursor-pointer shrink-0"
                    >
                      <span>View Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Core Values */}
                    <div className="space-y-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Evaluated Values & Principles
                      </span>
                      <div className="space-y-2">
                        {companyIntel.core_values?.map((val, idx) => (
                          <div
                            key={idx}
                            className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 flex items-start gap-3"
                          >
                            <div className="font-mono w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed">{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prep Roadmap */}
                    <div className="space-y-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Actionable Preparation Milestones
                      </span>
                      <div className="space-y-2">
                        {companyIntel.preparation_roadmap?.map((step, idx) => (
                          <div
                            key={idx}
                            className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 flex items-start gap-3"
                          >
                            <div className="font-mono w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Highlights */}
                  {companyIntel.recent_highlights?.length > 0 && (
                    <div className="pt-6 border-t border-zinc-800 space-y-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Recent Engineering Initiatives
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {companyIntel.recent_highlights.map((h, idx) => (
                          <div
                            key={idx}
                            className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-zinc-400 leading-relaxed"
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
