import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Building,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ExternalLink,
  BrainCog,
  Code2,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
  Zap,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { PY_API_URL } from "@/config/api";

const FEATURED_COMPANIES_PRESET = [
  { name: "Google", slug: "google", tier: "Tier-1 / FAANG", industry: "Search / Cloud / AI", tag: "Googliness & Scalability" },
  { name: "Amazon", slug: "amazon", tier: "Tier-1 / FAANG", industry: "Cloud / E-Commerce", tag: "16 Leadership Principles" },
  { name: "Meta", slug: "meta", tier: "Tier-1 / FAANG", industry: "Social / AI / Infra", tag: "Move Fast & Scale" },
  { name: "Microsoft", slug: "microsoft", tier: "Tier-1 / Enterprise", industry: "Enterprise / Cloud / AI", tag: "Growth Mindset" },
  { name: "Netflix", slug: "netflix", tier: "Tier-1 / Streaming", industry: "Media / Cloud Arch", tag: "Freedom & Responsibility" },
  { name: "Uber", slug: "uber", tier: "Tier-1 / Logistics", industry: "Real-time Distributed", tag: "Geospatial & Low Latency" }
];

export default function CompanyIntelligence() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("Google");
  const [companyIntel, setCompanyIntel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("rounds"); // 'rounds' | 'patterns' | 'culture' | 'stack'

  useEffect(() => {
    fetchCompanyIntelligence("Google");
  }, []);

  const fetchCompanyIntelligence = async (companyName) => {
    if (!companyName.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${PY_API_URL}/api/company/intelligence`, {
        params: { company: companyName.trim() }
      });
      setCompanyIntel(res.data);
      setSearchQuery(res.data.name || companyName);
    } catch (e) {
      console.error("Failed to load company intelligence:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchCompanyIntelligence(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header & Search Bar */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex p-2.5 bg-violet-950/60 border border-violet-700/50 rounded-2xl text-violet-400">
                <Building className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Company Research & Interview Intelligence
              </h1>
              <p className="text-xs md:text-sm text-gray-400 max-w-2xl leading-relaxed">
                Explore round-by-round hiring bars, culture principles, commonly asked DSA patterns, and tech stacks for top global companies.
              </p>
            </div>

            {/* Custom Search Box */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any company (e.g. Stripe, Apple)..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 transition shrink-0"
              >
                {loading ? "Analyzing..." : "Explore"}
              </button>
            </form>
          </div>

          {/* Quick Select Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-gray-800">
            <span className="text-xs text-gray-400 font-semibold mr-1">Featured Profiles:</span>
            {FEATURED_COMPANIES_PRESET.map((comp) => (
              <button
                key={comp.slug}
                onClick={() => fetchCompanyIntelligence(comp.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  companyIntel?.slug === comp.slug || companyIntel?.name?.toLowerCase().includes(comp.slug)
                    ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30"
                    : "bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600 hover:text-white"
                }`}
              >
                {comp.name}
              </button>
            ))}
          </div>
        </div>

        {/* COMPANY DOSSIER VIEW */}
        {companyIntel && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Overview & Quick Metrics Banner */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-700 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shrink-0">
                    {companyIntel.name?.charAt(0) || "C"}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-2xl font-bold text-white">{companyIntel.name}</h2>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                        {companyIntel.tier || "Tier-1"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {companyIntel.industry} • HQ: {companyIntel.headquarters || "Global"} • Founded: {companyIntel.founded || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <button
                    onClick={() => navigate(`/app/interview`)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/30 transition"
                  >
                    <BrainCog className="w-4 h-4" />
                    Launch Mock Interview for {companyIntel.name}
                  </button>
                  <button
                    onClick={() => navigate(`/app/hr-prep`)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-medium transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    Practice HR Questions
                  </button>
                </div>
              </div>

              {/* Culture Headline */}
              {companyIntel.culture_summary && (
                <div className="p-4 bg-gray-800/50 border border-gray-700/80 rounded-2xl text-xs text-gray-300 leading-relaxed">
                  💡 <strong className="text-white">Hiring & Engineering Philosophy:</strong> {companyIntel.culture_summary}
                </div>
              )}

              {/* Tab Navigation for Company Dossier */}
              <div className="flex items-center gap-2 border-b border-gray-800 pb-1">
                {[
                  { id: "rounds", label: "Interview Rounds", icon: Clock },
                  { id: "patterns", label: "DSA & Problem Patterns", icon: Code2 },
                  { id: "culture", label: "Culture & Values", icon: Award },
                  { id: "stack", label: "Tech Stack & Architecture", icon: Cpu }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === t.id
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-PANEL 1: ROUND-BY-ROUND BREAKDOWN */}
            {activeTab === "rounds" && companyIntel.interview_rounds && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyIntel.interview_rounds.map((round, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-violet-950 text-violet-300 border border-violet-800/60 rounded-lg text-xs font-bold">
                          Round {round.round || idx + 1}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-violet-400" />
                          {round.duration || "45-60 mins"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">{round.title}</h3>

                      <div className="space-y-2 text-xs">
                        <p className="text-gray-300">
                          <strong className="text-gray-400">Format:</strong> {round.format}
                        </p>
                        <p className="text-gray-300">
                          <strong className="text-gray-400">Focus Topics:</strong> {round.focus}
                        </p>
                        {round.passing_criteria && (
                          <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300">
                            🎯 <strong className="text-emerald-400">Passing Bar:</strong> {round.passing_criteria}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-PANEL 2: DSA & CODING PATTERNS */}
            {activeTab === "patterns" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Algorithmic Patterns */}
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-violet-400" />
                      Frequently Asked Algorithmic Patterns
                    </h3>

                    <div className="space-y-3">
                      {companyIntel.dsa_patterns?.map((pat, idx) => (
                        <div key={idx} className="bg-gray-800/40 border border-gray-800 p-4 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{pat.pattern}</h4>
                            <span className="text-[10px] px-2 py-0.5 bg-violet-950 text-violet-300 rounded font-semibold border border-violet-800/60">
                              Frequency: {pat.frequency}
                            </span>
                          </div>

                          {pat.sample_problems && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {pat.sample_problems.map((prob, pIdx) => (
                                <Link
                                  key={pIdx}
                                  to={`/app/coding`}
                                  className="text-[11px] bg-gray-800 hover:bg-violet-900/50 text-gray-300 hover:text-violet-200 px-2.5 py-1 rounded-lg border border-gray-700 transition flex items-center gap-1"
                                >
                                  <span>{prob}</span>
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Company Behavioral Questions */}
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BrainCog className="w-4 h-4 text-violet-400" />
                      Signature Behavioral Questions
                    </h3>

                    <div className="space-y-3">
                      {companyIntel.behavioral_questions?.map((bq, idx) => (
                        <div key={idx} className="bg-gray-800/40 border border-gray-800 p-4 rounded-xl space-y-2">
                          <p className="text-xs font-bold text-white">"{bq.question}"</p>
                          <p className="text-[11px] text-gray-400 border-t border-gray-700/60 pt-2">
                            💡 <strong className="text-gray-300">Strategic Angle:</strong> {bq.strategy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUB-PANEL 3: CULTURE & VALUES */}
            {activeTab === "culture" && (
              <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-400" />
                  Core Values & Cultural Principles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {companyIntel.core_values?.map((val, idx) => (
                    <div key={idx} className="bg-gray-800/40 border border-gray-800 p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Principle {idx + 1}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Preparation Roadmap */}
                {companyIntel.preparation_roadmap && (
                  <div className="border-t border-gray-800 pt-5 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Targeted Preparation Roadmap for {companyIntel.name}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {companyIntel.preparation_roadmap.map((step, idx) => (
                        <div key={idx} className="p-3 bg-gray-800/40 border border-gray-800 rounded-xl text-xs text-gray-300 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-PANEL 4: TECH STACK & ARCHITECTURE */}
            {activeTab === "stack" && companyIntel.tech_stack && (
              <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-violet-400" />
                  Primary Production Tech Stack
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(companyIntel.tech_stack).map(([category, items]) => {
                    const label = category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <div key={category} className="bg-gray-800/40 border border-gray-800 p-4 rounded-xl space-y-2.5">
                        <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">{label}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(items) && items.map((tech, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-gray-800 border border-gray-700 text-violet-300 rounded-lg text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent News / Highlights */}
                {companyIntel.recent_highlights?.length > 0 && (
                  <div className="border-t border-gray-800 pt-5 space-y-3">
                    <h4 className="text-sm font-bold text-white">Recent Engineering Initiatives & Blog Highlights</h4>
                    <ul className="space-y-2">
                      {companyIntel.recent_highlights.map((h, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
