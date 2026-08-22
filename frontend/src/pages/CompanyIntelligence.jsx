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

/* ─── Design tokens ─── */
const T = {
  canvas: { background: "#FBFBFA", fontFamily: "'Helvetica Neue','Geist Sans',system-ui,sans-serif", color: "#111111", minHeight: "100vh" },
  heroBig: { fontFamily: "'Newsreader','Playfair Display','Instrument Serif',Georgia,serif", letterSpacing: "-0.03em", lineHeight: 1.1, color: "#111111" },
  mono: { fontFamily: "'Geist Mono','SF Mono','JetBrains Mono',monospace" },
  card: { border: "1px solid #EAEAEA", borderRadius: 12, background: "#FFFFFF" },
  cardSoft: { border: "1px solid #EAEAEA", borderRadius: 12, background: "#FBFBFA" },
  divider: { borderTop: "1px solid #EAEAEA" },
  btnPrimary: { background: "#FFFFFF", color: "#111111", borderRadius: 6, border: "1px solid #111111", cursor: "pointer", fontFamily: "'Helvetica Neue',system-ui,sans-serif", fontWeight: 600, transition: "background 150ms, border-color 150ms, transform 100ms", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
  btnGhost: { background: "#FFFFFF", color: "#111111", borderRadius: 6, border: "1px solid #EAEAEA", cursor: "pointer", fontFamily: "'Helvetica Neue',system-ui,sans-serif", fontWeight: 500, transition: "border-color 150ms, background 150ms, transform 100ms" },
  iconBox: { width: 32, height: 32, borderRadius: 8, border: "1px solid #EAEAEA", background: "#F7F6F3", display: "flex", alignItems: "center", justifyContent: "center", color: "#787774", flexShrink: 0 },
  tagDefault: { borderRadius: 9999, fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 12px", background: "#FFFFFF", color: "#787774", border: "1px solid #EAEAEA", fontWeight: 600, cursor: "pointer", transition: "all 150ms ease" },
  tagActive: { borderRadius: 9999, fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 12px", background: "#FFFFFF", color: "#111111", border: "1px solid #111111", fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
};

function FrequencyBadge({ value }) {
  const map = {
    "Very High": { bg: "#FDEBEC", color: "#9F2F2D", border: "#F5C6C7" },
    "High":      { bg: "#FBF3DB", color: "#956400", border: "#EDD98A" },
    "Medium":    { bg: "#EDF3EC", color: "#346538", border: "#BDD6BB" },
  };
  const s = map[value] || { bg: "#F3F3F2", color: "#787774", border: "#EAEAEA" };
  return (
    <span style={{ ...T.mono, background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 9999, fontSize: 10, fontWeight: 700, padding: "2px 10px", letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
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
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" }
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

  /* ── hover helpers for white buttons ── */
  const hoverWhitePrimary = (e) => { e.currentTarget.style.background = "#F5F5F4"; };
  const unhoverWhitePrimary = (e) => { e.currentTarget.style.background = "#FFFFFF"; };
  const hoverGhost = (e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.background = "#FAFAF9"; };
  const unhoverGhost = (e) => { e.currentTarget.style.borderColor = "#EAEAEA"; e.currentTarget.style.background = "#FFFFFF"; };
  const hoverCard = (e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; };
  const unhoverCard = (e) => { e.currentTarget.style.borderColor = "#EAEAEA"; e.currentTarget.style.boxShadow = "none"; };

  return (
    <main style={{ ...T.canvas, overflowX: "hidden", width: "100%" }} ref={containerRef}>
      {/* Ambient radial depth */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 900px 500px at 50% -5%, rgba(0,0,0,0.022) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6" style={T.divider}>
          <div className="flex items-center gap-3">
            <div style={{ ...T.iconBox, width: 40, height: 40 }}>
              <Building2 size={18} />
            </div>
            <div>
              <div style={{ ...T.mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#AAAAAA" }}>
                Company Intelligence
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>Engineering Hiring Dossiers</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate("/app/interview")}
              style={{ ...T.btnGhost, fontSize: 12, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}
              onMouseEnter={hoverGhost} onMouseLeave={unhoverGhost}>
              <Brain size={13} /> Mock Interview
            </button>
            <button type="button" onClick={() => navigate("/app/coding")}
              style={{ ...T.btnPrimary, fontSize: 12, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}
              onMouseEnter={hoverWhitePrimary} onMouseLeave={unhoverWhitePrimary}>
              <Code2 size={13} /> Problem Arena
            </button>
          </div>
        </header>

        {/* ── Sub-nav ── */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-4" style={T.divider}>
          {[
            { to: "/app/interview",    label: "AI Mock Interview",   icon: Brain,      active: false },
            { to: "/app/hr-prep",      label: "HR & Leadership Prep", icon: Award,     active: false },
            { to: "/app/company-intel",label: "Company Intelligence", icon: Building2, active: true  },
          ].map(({ to, label, icon: Icon, active }) => (
            <Link key={to} to={to} className="whitespace-nowrap"
              style={active
                ? { ...T.btnPrimary, fontSize: 11, padding: "6px 14px", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }
                : { ...T.btnGhost,   fontSize: 11, padding: "6px 14px", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon size={12} />{label}
            </Link>
          ))}
        </nav>

        {/* ── Hero ── */}
        <section className="space-y-6">
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ ...T.heroBig, fontSize: "clamp(1.9rem, 4vw, 2.9rem)", marginBottom: 16 }}>
              Technical Hiring Intelligence & Evaluation Standards
            </h1>
            <p style={{ fontSize: 15, color: "#787774", lineHeight: 1.65 }}>
              Engineering dossiers covering algorithmic pattern frequency, system design expectations, culture evaluation, and production tech stacks.
            </p>
          </div>

          {/* Search */}
          <div style={{ ...T.card, padding: 10 }}>
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div style={{ position: "relative", flex: 1, width: "100%" }}>
                <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#CCCCCC" }} />
                <input
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company — Stripe, Uber, Atlassian, Notion..."
                  style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 10, paddingBottom: 10, border: "1px solid #EAEAEA", borderRadius: 8, fontSize: 13, color: "#111111", background: "#FBFBFA", outline: "none", fontFamily: "'Helvetica Neue',system-ui,sans-serif", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "#111111")}
                  onBlur={(e)  => (e.target.style.borderColor = "#EAEAEA")}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{ ...T.btnPrimary, fontSize: 12, padding: "10px 22px", opacity: loading ? 0.5 : 1, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}
                className="w-full sm:w-auto justify-center"
                onMouseEnter={(e) => !loading && hoverWhitePrimary(e)}
                onMouseLeave={(e) => !loading && unhoverWhitePrimary(e)}>
                {loading ? "Loading..." : "View Dossier"} <ArrowRight size={13} />
              </button>
            </form>

            {featuredCompanies.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 px-1" style={T.divider}>
                <span style={{ ...T.mono, fontSize: 10, color: "#CCCCCC", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 4 }}>Curated:</span>
                {featuredCompanies.map((comp) => {
                  const slug = comp.slug || comp.name?.toLowerCase().replace(/\s+/g, "");
                  const sel = companyIntel?.slug === slug || companyIntel?.name?.toLowerCase().includes(slug);
                  return (
                    <button key={slug} type="button" onClick={() => fetchCompanyIntelligence(comp.name)}
                      style={sel ? T.tagActive : T.tagDefault}>
                      {comp.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Dossier ── */}
        {companyIntel && (
          <section ref={contentRef} className="space-y-5">

            {/* Company banner card */}
            <div className="bento-item" style={{ ...T.card, padding: "28px 32px" }}>

              {/* Identity row */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div className="flex items-start sm:items-center gap-5">
                  <div style={{ width: 56, height: 56, borderRadius: 10, border: "1px solid #EAEAEA", background: "#F3F3F2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#111111", flexShrink: 0, fontFamily: "'Newsreader',serif" }}>
                    {companyIntel.name?.charAt(0) || "C"}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 style={{ ...T.heroBig, fontSize: "1.55rem", margin: 0 }}>{companyIntel.name}</h2>
                      <span style={T.tagDefault}>{companyIntel.tier || "Tier-1 Tech"}</span>
                    </div>
                    <p style={{ ...T.mono, fontSize: 11, color: "#AAAAAA", display: "flex", flexWrap: "wrap", gap: "0 10px", margin: 0 }}>
                      <span>{companyIntel.industry}</span>
                      <span style={{ color: "#DDDDDD" }}>|</span>
                      <span>HQ: {companyIntel.headquarters || "Global"}</span>
                      <span style={{ color: "#DDDDDD" }}>|</span>
                      <span>Founded {companyIntel.founded || "N/A"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button type="button" onClick={() => navigate("/app/interview")}
                    style={{ ...T.btnPrimary, fontSize: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}
                    onMouseEnter={hoverWhitePrimary} onMouseLeave={unhoverWhitePrimary}>
                    <Brain size={13} /> Start Mock Session
                  </button>
                  <button type="button" onClick={() => navigate("/app/hr-prep")}
                    style={{ ...T.btnGhost, fontSize: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}
                    onMouseEnter={hoverGhost} onMouseLeave={unhoverGhost}>
                    <Award size={13} /> HR & Leadership Prep
                  </button>
                </div>
              </div>

              {/* 4 snapshot tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6" style={T.divider}>
                {[
                  { tab: "all",     icon: Globe,  accent: "#111111", label: "Products & Scale",   meta: companyIntel.founded || "Global",  title: companyIntel.industry || "Cloud & Web Scale", body: "Flagship distributed systems and digital platforms at enterprise and consumer scale.", cta: "Overview" },
                  { tab: "stack",   icon: Cpu,    accent: "#346538", label: "Tech Architecture",   meta: "Production", title: companyIntel.tech_stack?.languages?.slice(0,2).join(", ") || "Go, Java, C++", body: companyIntel.tech_stack?.frameworks?.slice(0,3).join(" · ") || "Microservices, distributed caching, cloud infra.", cta: "Tech Stack" },
                  { tab: "culture", icon: Award,  accent: "#956400", label: "Culture & Values",    meta: "Hiring Bar", title: "Leadership Principles", body: "STAR evaluation on ownership, customer obsession, and engineering excellence.", cta: "Behavioral Standards" },
                  { tab: "rounds",  icon: Clock,  accent: "#787774", label: "Hiring Process",      meta: `${companyIntel.interview_rounds?.length || 4} Rounds`, title: "OA → Technical → System → HR", body: "Optimal Big-O problem solving, clean modular design, behavioural alignment.", cta: "Interview Rounds" },
                ].map(({ tab, icon: Icon, accent, label, meta, title, body, cta }) => (
                  <div key={tab} onClick={() => setActiveTab(tab)}
                    style={{ ...T.cardSoft, padding: 16, cursor: "pointer", transition: "border-color 200ms,box-shadow 200ms" }}
                    className="space-y-2" onMouseEnter={hoverCard} onMouseLeave={unhoverCard}>
                    <div className="flex items-center justify-between">
                      <span style={{ ...T.mono, fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: accent, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon size={12} />{label}
                      </span>
                      <span style={{ ...T.mono, fontSize: 10, color: "#AAAAAA" }}>{meta}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>{title}</div>
                    <p style={{ fontSize: 11, color: "#787774", lineHeight: 1.6, margin: 0 }}>{body}</p>
                    <span style={{ ...T.mono, fontSize: 10, color: accent }}>{cta}</span>
                  </div>
                ))}
              </div>

              {/* Culture thesis */}
              {companyIntel.culture_summary && (
                <div className="flex items-start gap-3 mt-5 pt-5" style={T.divider}>
                  <Zap size={14} style={{ color: "#956400", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ ...T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#956400", fontWeight: 700, display: "block", marginBottom: 4 }}>
                      Engineering & Hiring Principles
                    </span>
                    <p style={{ fontSize: 12, color: "#555555", lineHeight: 1.7, margin: 0 }}>{companyIntel.culture_summary}</p>
                  </div>
                </div>
              )}

              {/* Tab filter strip */}
              <div className="flex items-center gap-1.5 mt-6 pt-5 overflow-x-auto" style={T.divider}>
                {tabs.map(({ id, label, icon: Icon }) => {
                  const on = activeTab === id;
                  return (
                    <button key={id} type="button" onClick={() => setActiveTab(id)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 6, fontSize: 11, fontWeight: on ? 700 : 500, border: on ? "1px solid #111111" : "1px solid #EAEAEA", background: "#FFFFFF", color: on ? "#111111" : "#787774", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 150ms ease", fontFamily: "'Helvetica Neue',system-ui,sans-serif", boxShadow: on ? "0 1px 2px rgba(0,0,0,0.04)" : "none" }}>
                      <Icon size={11} />{label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Bento grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* INTERVIEW ROUNDS */}
              {(activeTab === "all" || activeTab === "rounds") && companyIntel.interview_rounds && (
                <div className="bento-item md:col-span-12 lg:col-span-8" style={{ ...T.card, padding: "28px 32px" }}>
                  <div className="flex items-center justify-between pb-4 mb-4" style={T.divider}>
                    <div className="flex items-center gap-3">
                      <div style={T.iconBox}><Clock size={15} /></div>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111111", margin: 0 }}>Interview Round Structure</h3>
                        <p style={{ fontSize: 11, color: "#787774", margin: 0 }}>Format, focus areas, and passing criteria</p>
                      </div>
                    </div>
                    <span style={{ ...T.mono, fontSize: 11, color: "#AAAAAA" }}>{companyIntel.interview_rounds.length} Stages</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {companyIntel.interview_rounds.map((round, idx) => (
                      <div key={idx} style={{ ...T.cardSoft, padding: "18px 20px", transition: "border-color 200ms,box-shadow 200ms" }}
                        className="space-y-3" onMouseEnter={hoverCard} onMouseLeave={unhoverCard}>
                        <div className="flex items-center justify-between">
                          <span style={{ ...T.mono, fontSize: 10, letterSpacing: "0.06em", background: "#F3F3F2", border: "1px solid #EAEAEA", borderRadius: 4, padding: "2px 8px", color: "#555555", fontWeight: 700 }}>
                            Stage {round.round || idx + 1}
                          </span>
                          <span style={{ ...T.mono, fontSize: 10, color: "#AAAAAA", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={10} />{round.duration || "45–60 min"}
                          </span>
                        </div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111111", margin: 0 }}>{round.title}</h4>
                        <div className="space-y-2">
                          <div>
                            <span style={{ ...T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#AAAAAA", display: "block" }}>Format</span>
                            <span style={{ fontSize: 12, color: "#333333", fontWeight: 500 }}>{round.format}</span>
                          </div>
                          <div>
                            <span style={{ ...T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#AAAAAA", display: "block" }}>Focus Areas</span>
                            <span style={{ fontSize: 12, color: "#555555" }}>{round.focus}</span>
                          </div>
                          {round.passing_criteria && (
                            <div className="pt-2" style={T.divider}>
                              <span style={{ ...T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#AAAAAA", display: "block", marginBottom: 3 }}>Passing Bar</span>
                              <p style={{ fontSize: 11, color: "#346538", lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{round.passing_criteria}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4" style={T.divider}>
                    <span style={{ ...T.mono, fontSize: 11, color: "#AAAAAA" }}>Target: Optimal Big-O · Clean Modular Architecture</span>
                    <button type="button" onClick={() => navigate("/app/interview")}
                      style={{ ...T.mono, fontSize: 11, color: "#111111", fontWeight: 700, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      Practice Rounds <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* BEHAVIOURAL BAR */}
              {(activeTab === "all" || activeTab === "culture") && companyIntel.behavioral_questions && (
                <div className="bento-item md:col-span-12 lg:col-span-4 flex flex-col" style={{ ...T.card, padding: "28px 32px" }}>
                  <div className="flex items-center gap-3 pb-4 mb-4" style={T.divider}>
                    <div style={T.iconBox}><Brain size={15} /></div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111111", margin: 0 }}>Behavioral Evaluation</h3>
                      <p style={{ fontSize: 11, color: "#787774", margin: 0 }}>Scenario questions and evaluation framing</p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {companyIntel.behavioral_questions.map((bq, idx) => (
                      <div key={idx} style={{ ...T.cardSoft, padding: "14px 16px" }} className="space-y-2">
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#111111", lineHeight: 1.55, fontStyle: "italic", margin: 0 }}>"{bq.question}"</p>
                        <div className="pt-2" style={T.divider}>
                          <span style={{ ...T.mono, fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: "#956400", fontWeight: 700, display: "block", marginBottom: 3 }}>
                            Strategic Framing
                          </span>
                          <p style={{ fontSize: 11, color: "#787774", lineHeight: 1.6, margin: 0 }}>{bq.strategy}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 mt-4" style={T.divider}>
                    <button type="button" onClick={() => navigate("/app/hr-prep")}
                      style={{ ...T.btnPrimary, width: "100%", padding: 10, fontSize: 12, textAlign: "center" }}
                      onMouseEnter={hoverWhitePrimary} onMouseLeave={unhoverWhitePrimary}>
                      Practice Behavioral Questions
                    </button>
                  </div>
                </div>
              )}

              {/* DSA PATTERN MAP */}
              {(activeTab === "all" || activeTab === "patterns") && companyIntel.dsa_patterns && (
                <div className="bento-item md:col-span-12 lg:col-span-7" style={{ ...T.card, padding: "28px 32px" }}>
                  <div className="flex items-center justify-between pb-4 mb-4" style={T.divider}>
                    <div className="flex items-center gap-3">
                      <div style={T.iconBox}><Code2 size={15} /></div>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111111", margin: 0 }}>DSA Pattern Frequency</h3>
                        <p style={{ fontSize: 11, color: "#787774", margin: 0 }}>Data structure and algorithm patterns tested in rounds</p>
                      </div>
                    </div>
                    <span style={{ ...T.mono, fontSize: 11, color: "#AAAAAA" }}>LeetCode Mapped</span>
                  </div>

                  <div className="space-y-3">
                    {companyIntel.dsa_patterns.map((pat, idx) => (
                      <div key={idx} style={{ ...T.cardSoft, padding: "16px 18px" }} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 style={{ ...T.mono, fontSize: 12, fontWeight: 700, color: "#111111", margin: 0 }}>{pat.pattern}</h4>
                          <FrequencyBadge value={pat.frequency} />
                        </div>
                        {pat.sample_problems?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {pat.sample_problems.map((prob, pIdx) => (
                              <Link key={pIdx} to="/app/coding"
                                style={{ ...T.mono, fontSize: 11, color: "#333333", background: "#F3F3F2", border: "1px solid #EAEAEA", borderRadius: 5, padding: "4px 10px", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, transition: "border-color 150ms,background 150ms" }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.background = "#FFFFFF"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#EAEAEA"; e.currentTarget.style.background = "#F3F3F2"; }}>
                                {prob} <ExternalLink size={10} style={{ color: "#CCCCCC" }} />
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
                <div className="bento-item md:col-span-12 lg:col-span-5" style={{ ...T.card, padding: "28px 32px" }}>
                  <div className="flex items-center gap-3 pb-4 mb-4" style={T.divider}>
                    <div style={T.iconBox}><Cpu size={15} /></div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111111", margin: 0 }}>Production Tech Stack</h3>
                      <p style={{ fontSize: 11, color: "#787774", margin: 0 }}>Primary languages, frameworks, and infrastructure</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(companyIntel.tech_stack).map(([category, items]) => (
                      <div key={category} style={{ ...T.cardSoft, padding: "14px 16px" }} className="space-y-2">
                        <span style={{ ...T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#AAAAAA", display: "block" }}>
                          {category.replace(/_/g, " ")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(items) && items.map((tech, tIdx) => (
                            <span key={tIdx} style={{ ...T.mono, fontSize: 11, color: "#333333", background: "#F3F3F2", border: "1px solid #EAEAEA", borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CORE VALUES + PREP ROADMAP */}
              {(activeTab === "all" || activeTab === "culture") && (
                <div className="bento-item md:col-span-12" style={{ ...T.card, padding: "28px 32px" }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6" style={T.divider}>
                    <div className="flex items-center gap-3">
                      <div style={T.iconBox}><Award size={15} /></div>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111111", margin: 0 }}>Core Values & Preparation Milestones</h3>
                        <p style={{ fontSize: 11, color: "#787774", margin: 0 }}>Principles evaluated during debrief and preparation milestones</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => navigate("/app/roadmap")}
                      style={{ ...T.btnPrimary, fontSize: 12, padding: "8px 16px", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}
                      onMouseEnter={hoverWhitePrimary} onMouseLeave={unhoverWhitePrimary}>
                      View Roadmap <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Core values */}
                    <div className="space-y-3">
                      <span style={{ ...T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#AAAAAA", display: "block" }}>
                        Evaluated Values & Principles
                      </span>
                      <div className="space-y-2">
                        {companyIntel.core_values?.map((val, idx) => (
                          <div key={idx} style={{ ...T.cardSoft, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ ...T.mono, width: 22, height: 22, borderRadius: "50%", border: "1px solid #EAEAEA", background: "#F3F3F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#555555", flexShrink: 0, marginTop: 1 }}>
                              {idx + 1}
                            </div>
                            <p style={{ fontSize: 12, color: "#333333", lineHeight: 1.65, margin: 0 }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prep roadmap */}
                    <div className="space-y-3">
                      <span style={{ ...T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#AAAAAA", display: "block" }}>
                        Actionable Preparation Milestones
                      </span>
                      <div className="space-y-2">
                        {companyIntel.preparation_roadmap?.map((step, idx) => (
                          <div key={idx} style={{ ...T.cardSoft, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ ...T.mono, width: 22, height: 22, borderRadius: "50%", border: "1px solid #EAEAEA", background: "#EDF3EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#346538", flexShrink: 0, marginTop: 1 }}>
                              {idx + 1}
                            </div>
                            <p style={{ fontSize: 12, color: "#333333", lineHeight: 1.65, margin: 0 }}>{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent highlights */}
                  {companyIntel.recent_highlights?.length > 0 && (
                    <div className="pt-6 mt-6 space-y-3" style={T.divider}>
                      <span style={{ ...T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#AAAAAA", display: "block" }}>
                        Recent Engineering Initiatives
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {companyIntel.recent_highlights.map((h, idx) => (
                          <div key={idx} style={{ ...T.cardSoft, padding: "14px 16px", fontSize: 12, color: "#555555", lineHeight: 1.65 }}>
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
