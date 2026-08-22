import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

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

const TIER_COLORS = {
  Bronze: "border-amber-700/40 text-amber-300 bg-amber-950/20",
  Silver: "border-zinc-400/40 text-zinc-300 bg-zinc-800/30",
  Gold: "border-yellow-500/40 text-yellow-300 bg-yellow-950/20",
  Platinum: "border-cyan-500/40 text-cyan-300 bg-cyan-950/20",
  Diamond: "border-purple-500/40 text-purple-300 bg-purple-950/20",
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
      if (!loading) {
        gsap.fromTo(
          ".gsap-fade-item",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
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
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-white">
      <div ref={containerRef} className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        {/* Editorial Wide Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono uppercase tracking-widest">
              <Award className="w-3.5 h-3.5" />
              Verified Competency Badges
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Readiness Milestones & Skill Accreditations
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Objective proof-of-work achievements spanning Algorithmic Mastery, System Architecture, Resume Benchmarks, and Practice Consistency.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs flex items-center gap-2 shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-zinc-400 font-mono">Accumulated XP:</span>
              <span className="text-yellow-300 font-bold font-mono text-sm">{totalXp} XP</span>
            </div>
          </div>
        </header>

        {/* Candidate Tier Progression Track */}
        <section className="gsap-fade-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 block mb-1">
                Candidate Certification Standing
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <Crown className="w-7 h-7 text-yellow-400" />
                <span>{currentTier} Candidate Standing</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-400 font-mono">Milestone Completion Ratio</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                {milestonesData?.unlockedCount || 0} / {milestonesData?.totalMilestonesCount || 0}{" "}
                Badges ({milestonesData?.completionRatePct || 0}%)
              </div>
            </div>
          </div>

          {/* Tier Step Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-white/5">
            {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((tier, idx) => {
              const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
              const currentIdx = tiers.indexOf(currentTier);
              const isPassed = idx <= currentIdx;
              const isCurrent = tier === currentTier;

              return (
                <div
                  key={tier}
                  className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col justify-between ${
                    isCurrent
                      ? "bg-white text-zinc-950 font-bold border-white shadow-xl scale-[1.02]"
                      : isPassed
                      ? "bg-zinc-950/80 border-white/15 text-zinc-200"
                      : "bg-zinc-950/40 border-white/5 text-zinc-600 opacity-60"
                  }`}
                >
                  <div className="text-sm font-semibold tracking-tight">{tier}</div>
                  <div
                    className={`text-[11px] font-mono mt-1 ${
                      isCurrent ? "text-zinc-700" : "text-zinc-500"
                    }`}
                  >
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
        </section>

        {/* Filter Navigation Bar */}
        <div className="gsap-fade-item flex items-center gap-1.5 overflow-x-auto pb-1">
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
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeCategory === tab.key
                  ? "bg-white text-zinc-950 font-semibold shadow-md"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gapless Dense Badges Gallery Grid */}
        <section className="gsap-fade-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-flow-dense gap-4">
          {filteredMilestones.map((item) => {
            const IconComp = ICON_MAP[item.icon] || Award;
            const tierStyle = TIER_COLORS[item.tier] || TIER_COLORS.Bronze;
            const isClaimed = item.isClaimed || recentlyClaimed[item.id];

            return (
              <div
                key={item.id}
                className={`group rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between ${
                  item.isUnlocked
                    ? "bg-zinc-900/70 border-white/10 hover:border-purple-500/40 hover:bg-zinc-900/90 shadow-xl"
                    : "bg-zinc-950/50 border-white/5 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        item.isUnlocked
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-md group-hover:scale-105 transition-transform duration-300"
                          : "bg-zinc-900 border-white/5 text-zinc-600"
                      }`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${tierStyle}`}
                    >
                      {item.tier}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2 tracking-tight group-hover:text-purple-300 transition-colors">
                    {item.title}
                    {item.isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    )}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Progress or Claim Action Footer */}
                <div className="pt-4 border-t border-white/5">
                  {item.isUnlocked ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-mono font-bold text-yellow-400">
                        +{item.xp} XP
                      </div>

                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-white/5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Reward Claimed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleClaimReward(e, item.id)}
                          disabled={claimingId === item.id}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5 text-purple-600" />
                          {claimingId === item.id ? "Claiming..." : "Claim XP Reward"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
                        <span>Readiness Goal</span>
                        <span className="text-purple-400 font-semibold">{item.progressPct}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
