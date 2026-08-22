import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Award,
  Medal,
  Crown,
  Sparkles,
  Shield,
  Code2,
  Terminal,
  Cpu,
  FileCheck,
  FileText,
  GraduationCap,
  Flame,
  Zap,
  Users,
  CheckCircle2,
  Lock,
  Gift,
  Check,
  TrendingUp,
  Target,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import CaideButton from "@/components/caide/CaideButton";
import CaideBadge from "@/components/caide/CaideBadge";
import CaideCard from "@/components/caide/CaideCard";

const ICON_MAP = {
  Shield,
  Award,
  Medal,
  Crown,
  Sparkles,
  Code2,
  Terminal,
  Cpu,
  FileCheck,
  FileText,
  GraduationCap,
  Flame,
  Zap,
  Users,
};

const TIER_THEMES = {
  Bronze: "coral",
  Silver: "light-yellow",
  Gold: "yellow",
  Platinum: "mint",
  Diamond: "light-purple",
};

export default function Milestones() {
  const containerRef = useRef(null);
  const [milestonesData, setMilestonesData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [recentlyClaimed, setRecentlyClaimed] = useState({});

  const fetchMilestones = async () => {
    try {
      const res = await axios.get(`${NODE_API_URL}/api/milestones`, {
        withCredentials: true,
      });
      if (res.data) {
        setMilestonesData(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch milestones, using defaults:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  useGSAP(
    () => {
      if (!loading && containerRef.current) {
        gsap.fromTo(
          containerRef.current.querySelectorAll(".gsap-fade-item"),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.07,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: containerRef, dependencies: [loading] }
  );

  const handleClaimReward = async (e, milestoneId) => {
    e.stopPropagation();
    setClaimingId(milestoneId);
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/milestones/claim/${milestoneId}`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        setRecentlyClaimed((prev) => ({ ...prev, [milestoneId]: true }));
        fetchMilestones();
      }
    } catch (err) {
      console.error("Could not claim milestone:", err);
    } finally {
      setClaimingId(null);
    }
  };

  const unlocked = milestonesData?.unlockedMilestones || [];
  const inProgress = milestonesData?.inProgressMilestones || [];
  const allMilestones = [...unlocked, ...inProgress];

  const filteredMilestones = allMilestones.filter((m) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "unlocked") return m.isUnlocked;
    if (activeCategory === "inProgress") return !m.isUnlocked;
    return m.category === activeCategory;
  });

  const currentTier = milestonesData?.currentTier || "Unassessed";
  const totalXp = milestonesData?.totalXp || 0;

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#FEF9CF] u-background-grid-yellow text-[#0D0431] font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]">
      <div ref={containerRef} className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* ── Editorial Header ── */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-[#0D0431]">
          <div className="space-y-3 max-w-3xl">
            <CaideBadge theme="yellow">
              <Award className="w-3.5 h-3.5 mr-1" />
              Verified Competency Badges
            </CaideBadge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight text-[#0D0431] leading-tight">
              Readiness Milestones & Skill Accreditations
            </h1>
            <p className="text-sm md:text-base text-[#0D0431]/80 max-w-3xl leading-relaxed">
              Objective proof-of-work achievements spanning Algorithmic Mastery, System Architecture, Resume Benchmarks, and Practice Consistency.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] text-xs flex items-center gap-2 shadow-[3px_3px_0_0_#0D0431]">
              <Sparkles className="w-4 h-4 text-[#0D0431]" />
              <span className="text-[#0D0431] font-heading font-black">Accumulated XP:</span>
              <span className="text-[#0D0431] font-heading font-black text-sm">{totalXp} XP</span>
            </div>
          </div>
        </header>

        {/* ── Sub-nav Quick Links ── */}
        <nav className="gsap-fade-item flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { to: "/app/milestones", label: "Milestones & Badges", icon: Award, active: true },
            { to: "/app/progress", label: "Progress Velocity", icon: TrendingUp, active: false },
            { to: "/app/roadmap", label: "Placement Roadmap", icon: Target, active: false },
            { to: "/app/academics", label: "Academics Transcript", icon: GraduationCap, active: false },
            { to: "/app/coding", label: "Coding Arena", icon: Code2, active: false },
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

        {/* ── Candidate Tier Progression Track ── */}
        <CaideCard
          theme="white"
          shadow="default"
          className="gsap-fade-item p-6 md:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0431]">
            <div>
              <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]/75 block mb-1">
                Candidate Certification Standing
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-[#0D0431] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
                  <Crown className="w-6 h-6" />
                </div>
                <span>{currentTier} Candidate Standing</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#0D0431]/75 font-mono font-bold">Milestone Completion Ratio</span>
              <div className="text-2xl font-heading font-black text-[#0D0431] mt-0.5">
                {milestonesData?.unlockedCount || 0} / {milestonesData?.totalMilestonesCount || 0}{" "}
                Badges ({milestonesData?.completionRatePct || 0}%)
              </div>
            </div>
          </div>

          {/* Tier Step Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((tier, idx) => {
              const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
              const currentIdx = tiers.indexOf(currentTier);
              const isPassed = idx <= currentIdx;
              const isCurrent = tier === currentTier;

              return (
                <div
                  key={tier}
                  className={`p-4 rounded-2xl border-2 border-[#0D0431] text-center transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-[#FEDF6A] text-[#0D0431] font-heading font-black shadow-[4px_4px_0_0_#0D0431] scale-[1.03]"
                      : isPassed
                      ? "bg-[#E4FFDA] text-[#0D0431] font-heading font-bold shadow-[2px_2px_0_0_#0D0431]"
                      : "bg-[#FEF9CF]/40 border-[#0D0431]/40 text-[#0D0431]/50 opacity-70"
                  }`}
                >
                  <div className="text-sm font-heading font-black tracking-tight">{tier}</div>
                  <div className="text-[11px] font-mono font-bold mt-1 text-[#0D0431]/80">
                    {idx === 0
                      ? "0 - 39%"
                      : idx === 1
                      ? "40 - 59%"
                      : idx === 2
                      ? "60 - 74%"
                      : idx === 3
                      ? "75 - 89%"
                      : "90%+"}
                  </div>
                </div>
              );
            })}
          </div>
        </CaideCard>

        {/* ── Filter Navigation Bar ── */}
        <div className="gsap-fade-item flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { key: "all", label: "All Accreditations" },
            { key: "unlocked", label: "Unlocked" },
            { key: "inProgress", label: "In Progress" },
            { key: "tier", label: "Tier Milestones" },
            { key: "dsa", label: "DSA Competency" },
            { key: "resume", label: "ATS Resume" },
            { key: "academics", label: "Academics" },
            { key: "streak", label: "Consistency" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] cursor-pointer ${
                activeCategory === tab.key
                  ? "bg-[#0D0431] text-white"
                  : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] hover:-translate-y-0.5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Badges Gallery Grid ── */}
        <section className="gsap-fade-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMilestones.map((item) => {
            const IconComp = ICON_MAP[item.icon] || Award;
            const tierTheme = TIER_THEMES[item.tier] || "yellow";
            const isClaimed = item.isClaimed || recentlyClaimed[item.id];

            return (
              <CaideCard
                key={item.id}
                theme={item.isUnlocked ? "white" : "light-yellow"}
                shadow="default"
                hoverEffect={item.isUnlocked}
                className={`p-6 flex flex-col justify-between ${
                  item.isUnlocked ? "" : "opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431] shrink-0">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <CaideBadge theme={tierTheme} size="sm">
                      {item.tier}
                    </CaideBadge>
                  </div>

                  <h3 className="text-base font-heading font-black text-[#0D0431] mb-1.5 flex items-center gap-2 tracking-tight">
                    {item.title}
                    {item.isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0D0431] shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#0D0431]/60 shrink-0" />
                    )}
                  </h3>

                  <p className="text-xs text-[#0D0431]/80 leading-relaxed mb-6 font-sans">
                    {item.description}
                  </p>
                </div>

                {/* Progress or Claim Action Footer */}
                <div className="pt-4 border-t-2 border-[#0D0431]/15">
                  {item.isUnlocked ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-heading font-black text-[#0D0431]">
                        +{item.xp} XP
                      </div>

                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D0431] bg-[#E4FFDA] px-3.5 py-1.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                          <Check className="w-3.5 h-3.5" /> Reward Claimed
                        </span>
                      ) : (
                        <CaideButton
                          variant="stacked-yellow"
                          size="sm"
                          icon={false}
                          disabled={claimingId === item.id}
                          onClick={(e) => handleClaimReward(e, item.id)}
                        >
                          <span className="flex items-center gap-1 font-bold text-xs text-[#0D0431]">
                            <Gift className="w-3.5 h-3.5" />
                            {claimingId === item.id ? "Claiming..." : "Claim Reward"}
                          </span>
                        </CaideButton>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#0D0431] font-mono font-bold">
                        <span>Readiness Goal</span>
                        <span className="font-heading font-black">{item.progressPct}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-3 overflow-hidden border-2 border-[#0D0431] shadow-[1px_1px_0_0_#0D0431]">
                        <div
                          className="bg-[#FEDF6A] h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CaideCard>
            );
          })}
        </section>
      </div>
    </main>
  );
}
