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
  TrendingUp,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Compass,
} from "lucide-react";
import { PY_API_URL } from "@/config/api";
import GpCard from "@/components/gp/GpCard";
import GpBadge from "@/components/gp/GpBadge";
import GpButton from "@/components/gp/GpButton";
import GpToggle from "@/components/gp/GpToggle";

function FrequencyBadge({ value }) {
  const map = {
    "Very High": { bg: "bg-[#FFC5B7]", text: "text-[#0D0431]", border: "border-[#0D0431]" },
    "High":      { bg: "bg-[#FEDF6A]", text: "text-[#0D0431]", border: "border-[#0D0431]" },
    "Medium":    { bg: "bg-[#D4FDF7]", text: "text-[#0D0431]", border: "border-[#0D0431]" },
  };
  const s = map[value] || { bg: "bg-[#FEF9CF]", text: "text-[#0D0431]", border: "border-[#0D0431]" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border-2 shadow-[2px_2px_0_0_#0D0431] ${s.bg} ${s.text} ${s.border}`}
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
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [companyIntel, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) fetchCompanyIntelligence(searchQuery.trim());
  };

  const tabs = [
    { id: "all",      label: "Full Dossier",       icon: Layers  },
    { id: "rounds",   label: "Interview Rounds",    icon: Clock   },
    { id: "patterns", label: "DSA Matrix",          icon: Code2   },
    { id: "culture",  label: "Values & Behaviour",  icon: Award   },
    { id: "stack",    label: "Tech Stack",           icon: Cpu    },
  ];

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[#FEF9CF] u-background-grid-yellow text-[#0D0431] overflow-x-hidden w-full font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* ── Top Header Bar ── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#0D0431]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-center justify-center text-[#0D0431] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431]/70">
                Company Intelligence
              </div>
              <h2 className="text-base font-heading font-black text-[#0D0431]">
                Engineering Hiring Dossiers
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <GpButton
              variant="secondary"
              size="sm"
              icon={false}
              onClick={() => navigate("/app/interview")}
            >
              <span className="flex items-center gap-1.5 font-bold">
                <Brain className="w-4 h-4" /> Mock Interview
              </span>
            </GpButton>
            <GpButton
              variant="stacked-yellow"
              size="sm"
              icon={false}
              onClick={() => navigate("/app/coding")}
            >
              <span className="flex items-center gap-1.5 font-bold text-[#0D0431]">
                <Code2 className="w-4 h-4" /> Coding Arena
              </span>
            </GpButton>
          </div>
        </header>

        {/* ── Sub-nav Quick Links ── */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { to: "/app/interview",    label: "AI Mock Interview",   icon: Brain,      active: false },
            { to: "/app/hr-prep",      label: "HR & Leadership Prep", icon: Award,     active: false },
            { to: "/app/company-intel",label: "Company Intelligence", icon: Building2, active: true  },
            { to: "/app/can-i-apply",  label: "Can I Apply?",         icon: Sparkles,   active: false },
            { to: "/app/jobs",         label: "Job Recommendations",  icon: Briefcase,  active: false },
          ].map(({ to, label, icon: Icon, active }) => (
            <Link
              key={to}
              to={to}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold font-sans transition-all flex items-center gap-2 border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] ${
                active
                  ? "bg-[#0D0431] text-white"
                  : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] hover:-translate-y-0.5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* ── Hero Search Section ── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <GpBadge theme="light-purple">
              Verified Hiring Intelligence
            </GpBadge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-[#0D0431] tracking-tight leading-[1.1]">
              Technical Hiring Intelligence & Evaluation Standards
            </h1>
            <p className="text-sm sm:text-base text-[#0D0431]/80 font-sans leading-relaxed">
              Engineering dossiers covering algorithmic pattern frequency, system design expectations, culture evaluation, and production tech stacks.
            </p>
          </div>

          {/* Search Card */}
          <GpCard
            theme="white"
            shadow="lg"
            className="p-4 sm:p-5"
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0D0431]/60 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company — Google, Stripe, Uber, Microsoft, Notion, Amazon..."
                  className="w-full bg-white text-[#0D0431] placeholder-[#0D0431]/40 border-2 border-[#0D0431] rounded-xl pl-10 pr-4 py-2.5 text-sm font-sans font-medium shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] focus:shadow-[4px_4px_0_0_#0D0431] transition-all"
                />
              </div>
              <GpButton
                type="submit"
                variant="stacked-yellow"
                size="md"
                disabled={loading}
                icon={false}
                className="w-full sm:w-auto shrink-0"
              >
                <span className="flex items-center justify-center gap-2 font-bold text-[#0D0431]">
                  {loading ? "Loading..." : "View Dossier"} <ArrowRight className="w-4 h-4" />
                </span>
              </GpButton>
            </form>

            {featuredCompanies.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t-2 border-[#0D0431]/20">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431]/70 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#896EE2]" /> Curated:
                </span>
                {featuredCompanies.map((comp) => {
                  const slug = comp.slug || comp.name?.toLowerCase().replace(/\s+/g, "");
                  const isSelected =
                    companyIntel?.slug === slug ||
                    companyIntel?.name?.toLowerCase().includes(slug);
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => fetchCompanyIntelligence(comp.name)}
                      className={`px-3.5 py-1 rounded-full text-xs font-bold font-sans transition-all border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] cursor-pointer ${
                        isSelected
                          ? "bg-[#0D0431] text-white"
                          : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] hover:-translate-y-0.5"
                      }`}
                    >
                      {comp.name}
                    </button>
                  );
                })}
              </div>
            )}
          </GpCard>
        </section>

        {/* ── Dossier Content ── */}
        {companyIntel && (
          <section ref={contentRef} className="space-y-6">

            {/* Company Banner Bento Card with Pastel Accents */}
            <GpCard
              theme="white"
              shadow="lg"
              className="bento-item p-6 sm:p-8 space-y-6 overflow-hidden"
            >
              {/* Identity Row */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b-2 border-[#0D0431]">
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] flex items-center justify-center font-heading font-black text-2xl text-[#0D0431] shrink-0">
                    {companyIntel.name?.charAt(0) || "C"}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431]">
                        {companyIntel.name}
                      </h2>
                      <GpBadge theme="light-purple">
                        {companyIntel.tier || "Tier-1 Tech"}
                      </GpBadge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold text-[#0D0431]/70">
                      <span>{companyIntel.industry}</span>
                      <span>•</span>
                      <span>HQ: {companyIntel.headquarters || "Global"}</span>
                      <span>•</span>
                      <span>Founded {companyIntel.founded || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <GpButton
                    variant="stacked-yellow"
                    size="sm"
                    icon={false}
                    onClick={() => navigate("/app/interview")}
                  >
                    <span className="flex items-center gap-1.5 font-bold text-[#0D0431]">
                      <Brain className="w-4 h-4" /> Start Mock Session
                    </span>
                  </GpButton>
                  <GpButton
                    variant="secondary"
                    size="sm"
                    icon={false}
                    onClick={() => navigate("/app/hr-prep")}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Award className="w-4 h-4" /> HR Prep
                    </span>
                  </GpButton>
                </div>
              </div>

              {/* 4 Snapshot Dossier Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    tab: "all",
                    icon: Globe,
                    headerBg: "bg-[#FEDF6A]",
                    label: "Scale & Market",
                    meta: companyIntel.founded || "Global",
                    title: companyIntel.industry || "Cloud & Web Scale",
                    body: "Flagship distributed systems and digital platforms at enterprise and consumer scale.",
                    cta: "Explore Dossier",
                  },
                  {
                    tab: "stack",
                    icon: Cpu,
                    headerBg: "bg-[#D4FDF7]",
                    label: "Tech Architecture",
                    meta: "Production",
                    title: companyIntel.tech_stack?.languages?.slice(0, 3).join(", ") || "Go, Java, C++",
                    body: companyIntel.tech_stack?.frameworks?.slice(0, 3).join(" • ") || "Microservices, distributed caching, cloud infra.",
                    cta: "View Tech Stack",
                  },
                  {
                    tab: "culture",
                    icon: Award,
                    headerBg: "bg-[#E4CDFB]",
                    label: "Culture & Values",
                    meta: "Hiring Bar",
                    title: "Leadership Principles",
                    body: "STAR evaluation on ownership, customer obsession, and engineering excellence.",
                    cta: "Behavioral Standards",
                  },
                  {
                    tab: "rounds",
                    icon: Clock,
                    headerBg: "bg-[#CDE1FF]",
                    label: "Hiring Process",
                    meta: `${companyIntel.interview_rounds?.length || 4} Rounds`,
                    title: "OA → Tech → System → HR",
                    body: "Optimal Big-O problem solving, clean modular design, and behavioural alignment.",
                    cta: "Interview Rounds",
                  },
                ].map(({ tab, icon: Icon, headerBg, label, meta, title, body, cta }) => (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#0D0431] transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-[#0D0431] ${headerBg}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{label}</span>
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#0D0431]/60">
                          {meta}
                        </span>
                      </div>
                      <h3 className="font-heading font-black text-sm text-[#0D0431] line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-xs text-[#0D0431]/75 font-sans leading-relaxed line-clamp-2">
                        {body}
                      </p>
                    </div>

                    <div className="pt-2 border-t-2 border-[#0D0431]/10 flex items-center justify-between text-xs font-bold text-[#0D0431]">
                      <span>{cta}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Culture Thesis / Hiring Bar Callout */}
              {companyIntel.culture_summary && (
                <div className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-[#0D0431]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431] block mb-1">
                      Engineering & Hiring Principles
                    </span>
                    <p className="text-xs sm:text-sm text-[#0D0431]/80 leading-relaxed font-sans">
                      {companyIntel.culture_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Navigation Filter Strip */}
              <div className="flex items-center gap-2 pt-4 border-t-2 border-[#0D0431] overflow-x-auto no-scrollbar">
                {tabs.map(({ id, label, icon: Icon }) => {
                  const isSelected = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all border-2 border-[#0D0431] shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-[#0D0431] text-white shadow-[3px_3px_0_0_#FEDF6A]"
                          : "bg-white text-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </GpCard>

            {/* ── Bento Grid Detail Sections ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* 1. INTERVIEW ROUNDS */}
              {(activeTab === "all" || activeTab === "rounds") && companyIntel.interview_rounds && (
                <GpCard
                  theme="white"
                  shadow="lg"
                  className="bento-item md:col-span-12 lg:col-span-8 p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b-2 border-[#0D0431]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#CDE1FF] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base text-[#0D0431]">
                          Interview Round Structure
                        </h3>
                        <p className="text-xs text-[#0D0431]/70 font-semibold">
                          Format, focus areas, and passing criteria
                        </p>
                      </div>
                    </div>
                    <GpBadge theme="blue">
                      {companyIntel.interview_rounds.length} Stages
                    </GpBadge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {companyIntel.interview_rounds.map((round, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border-2 border-[#0D0431]">
                            Stage {round.round || idx + 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#0D0431]/70 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {round.duration || "45–60 min"}
                          </span>
                        </div>
                        <h4 className="font-heading font-black text-sm text-[#0D0431]">
                          {round.title}
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0D0431]/60 block">
                              Format
                            </span>
                            <span className="font-semibold text-[#0D0431]">{round.format}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0D0431]/60 block">
                              Focus Areas
                            </span>
                            <span className="text-[#0D0431]/80 leading-relaxed">{round.focus}</span>
                          </div>
                          {round.passing_criteria && (
                            <div className="pt-2 border-t-2 border-[#0D0431]/15">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0D0431] block mb-1">
                                Passing Bar
                              </span>
                              <p className="text-[11px] font-semibold text-[#0D0431] leading-relaxed bg-[#D4FDF7] p-2 rounded-xl border-2 border-[#0D0431]">
                                {round.passing_criteria}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t-2 border-[#0D0431]">
                    <span className="text-xs font-mono font-bold text-[#0D0431]/70">
                      Target Bar: Optimal Big-O • Clean Modular Architecture
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/app/interview")}
                      className="text-xs font-bold text-[#0D0431] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Practice Interview Simulation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </GpCard>
              )}

              {/* 2. BEHAVIORAL EVALUATION */}
              {(activeTab === "all" || activeTab === "culture") && companyIntel.behavioral_questions && (
                <GpCard
                  theme="white"
                  shadow="lg"
                  className="bento-item md:col-span-12 lg:col-span-4 p-6 sm:p-8 flex flex-col space-y-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0D0431]">
                    <div className="w-10 h-10 rounded-xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base text-[#0D0431]">
                        Behavioral Evaluation
                      </h3>
                      <p className="text-xs text-[#0D0431]/70 font-semibold">
                        Scenario questions and STAR framing
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {companyIntel.behavioral_questions.map((bq, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2"
                      >
                        <p className="text-xs font-bold text-[#0D0431] leading-relaxed italic">
                          "{bq.question}"
                        </p>
                        <div className="pt-2 border-t-2 border-[#0D0431]/15">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0D0431] block mb-1">
                            Strategic Framing
                          </span>
                          <p className="text-[11px] text-[#0D0431]/80 leading-relaxed">
                            {bq.strategy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t-2 border-[#0D0431]">
                    <GpButton
                      variant="stacked-yellow"
                      fullWidth
                      icon={false}
                      onClick={() => navigate("/app/hr-prep")}
                    >
                      <span className="font-bold text-[#0D0431]">
                        Practice Behavioral Questions
                      </span>
                    </GpButton>
                  </div>
                </GpCard>
              )}

              {/* 3. DSA PATTERN MATRIX */}
              {(activeTab === "all" || activeTab === "patterns") && companyIntel.dsa_patterns && (
                <GpCard
                  theme="white"
                  shadow="lg"
                  className="bento-item md:col-span-12 lg:col-span-7 p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b-2 border-[#0D0431]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base text-[#0D0431]">
                          DSA Pattern Frequency
                        </h3>
                        <p className="text-xs text-[#0D0431]/70 font-semibold">
                          Data structure & algorithm patterns tested in rounds
                        </p>
                      </div>
                    </div>
                    <GpBadge theme="yellow">
                      LeetCode Mapped
                    </GpBadge>
                  </div>

                  <div className="space-y-3.5">
                    {companyIntel.dsa_patterns.map((pat, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-heading font-black text-sm text-[#0D0431]">
                            {pat.pattern}
                          </h4>
                          <FrequencyBadge value={pat.frequency} />
                        </div>
                        {pat.sample_problems?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {pat.sample_problems.map((prob, pIdx) => (
                              <Link
                                key={pIdx}
                                to="/app/coding"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#0D0431] text-xs font-mono font-bold text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:bg-[#FEDF6A] hover:-translate-y-0.5 transition-all"
                              >
                                <span>{prob}</span>
                                <ExternalLink className="w-3 h-3 text-[#0D0431]/60" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GpCard>
              )}

              {/* 4. PRODUCTION TECH STACK */}
              {(activeTab === "all" || activeTab === "stack") && companyIntel.tech_stack && (
                <GpCard
                  theme="white"
                  shadow="lg"
                  className="bento-item md:col-span-12 lg:col-span-5 p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0D0431]">
                    <div className="w-10 h-10 rounded-xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base text-[#0D0431]">
                        Production Tech Stack
                      </h3>
                      <p className="text-xs text-[#0D0431]/70 font-semibold">
                        Primary languages, frameworks, and infrastructure
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {Object.entries(companyIntel.tech_stack).map(([category, items]) => (
                      <div
                        key={category}
                        className="p-3.5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] space-y-2"
                      >
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0D0431]/70 block">
                          {category.replace(/_/g, " ")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(items) &&
                            items.map((tech, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2.5 py-1 rounded-lg bg-white border-2 border-[#0D0431] text-xs font-mono font-bold text-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                              >
                                {tech}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </GpCard>
              )}

              {/* 5. CORE VALUES & PREPARATION ROADMAP */}
              {(activeTab === "all" || activeTab === "culture") && (
                <GpCard
                  theme="white"
                  shadow="lg"
                  className="bento-item md:col-span-12 p-6 sm:p-8 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0431]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base text-[#0D0431]">
                          Core Values & Preparation Milestones
                        </h3>
                        <p className="text-xs text-[#0D0431]/70 font-semibold">
                          Principles evaluated during debrief and preparation milestones
                        </p>
                      </div>
                    </div>
                    <GpButton
                      variant="stacked-yellow"
                      size="sm"
                      icon={false}
                      onClick={() => navigate("/app/roadmap")}
                    >
                      <span className="flex items-center gap-1.5 font-bold text-[#0D0431]">
                        View Roadmap <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </GpButton>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Core Values */}
                    <div className="space-y-3">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0D0431]/70 block">
                        Evaluated Values & Principles
                      </span>
                      <div className="space-y-2.5">
                        {companyIntel.core_values?.map((val, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-start gap-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#FEDF6A] border-2 border-[#0D0431] flex items-center justify-center font-heading font-black text-xs text-[#0D0431] shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs font-semibold text-[#0D0431] leading-relaxed">
                              {val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prep Roadmap */}
                    <div className="space-y-3">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0D0431]/70 block">
                        Actionable Preparation Milestones
                      </span>
                      <div className="space-y-2.5">
                        {companyIntel.preparation_roadmap?.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-[#D4FDF7] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-start gap-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-[#0D0431] flex items-center justify-center font-heading font-black text-xs text-[#0D0431] shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs font-semibold text-[#0D0431] leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Highlights */}
                  {companyIntel.recent_highlights?.length > 0 && (
                    <div className="pt-6 border-t-2 border-[#0D0431] space-y-3">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0D0431]/70 block">
                        Recent Engineering Initiatives
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {companyIntel.recent_highlights.map((h, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] text-xs font-medium text-[#0D0431] leading-relaxed"
                          >
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </GpCard>
              )}

            </div>
          </section>
        )}

      </div>
    </main>
  );
}
