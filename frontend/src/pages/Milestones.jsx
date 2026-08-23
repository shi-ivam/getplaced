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
  Silver: "border-zinc-500/40 text-zinc-300 bg-zinc-800/40",
  Gold: "border-amber-500/40 text-amber-300 bg-amber-950/20",
  Platinum: "border-zinc-300/40 text-zinc-200 bg-zinc-800/40",
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
      <div ref={containerRef} className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Editorial Wide Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
          <div className="space-y-2 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Milestones & Accreditations
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Track verifiable progress across algorithmic mastery, system architecture, and career benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400 font-mono">Total XP:</span>
              <span className="text-amber-400 font-bold font-mono text-xs">{totalXp} XP</span>
            </div>
          </div>
        </header>

        {/* Candidate Tier Progression Track */}
        <section className="gsap-fade-item rounded-2xl bg-[#121215] border border-zinc-800 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 block mb-1">
                Certification Tier
              </span>
              <div className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>{currentTier} Tier</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-400 font-mono">Completion</span>
              <div className="text-base font-bold font-mono text-zinc-200 mt-0.5">
                {milestonesData?.unlockedCount || 0} / {milestonesData?.totalMilestonesCount || 0}{" "}
                ({milestonesData?.completionRatePct || 0}%)
              </div>
            </div>
          </div>

          {/* Tier Step Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-zinc-800">
            {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((tier, idx) => {
              const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
              const currentIdx = tiers.indexOf(currentTier);
              const isPassed = idx <= currentIdx;
              const isCurrent = tier === currentTier;

              return (
                <div
                  key={tier}
                  className={`p-3.5 rounded-xl border text-center transition-all duration-200 flex flex-col justify-between ${
                    isCurrent
                      ? "bg-zinc-100 text-zinc-950 font-bold border-zinc-100"
                      : isPassed
                      ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                      : "bg-zinc-950/60 border-zinc-900 text-zinc-600 opacity-60"
                  }`}
                >
                  <div className="text-xs font-semibold tracking-tight">{tier}</div>
                  <div
                    className={`text-[10px] font-mono mt-1 ${
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
        <div className="gsap-fade-item flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
          {[
            { key: "all", label: "All" },
            { key: "unlocked", label: "Unlocked" },
            { key: "inProgress", label: "In Progress" },
            { key: "tier", label: "Tier" },
            { key: "dsa", label: "DSA" },
            { key: "resume", label: "Resume" },
            { key: "academics", label: "Academics" },
            { key: "streak", label: "Consistency" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeCategory === tab.key
                  ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gapless Dense Badges Gallery Grid */}
        <section className="gsap-fade-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-flow-dense gap-3.5">
          {filteredMilestones.map((item) => {
            const IconComp = ICON_MAP[item.icon] || Award;
            const tierStyle = TIER_COLORS[item.tier] || TIER_COLORS.Bronze;
            const isClaimed = item.isClaimed || recentlyClaimed[item.id];

            return (
              <div
                key={item.id}
                className={`group rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                  item.isUnlocked
                    ? "bg-[#121215] border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-950/50 border-zinc-900 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`p-2.5 rounded-lg border ${
                        item.isUnlocked
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-600"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${tierStyle}`}
                    >
                      {item.tier}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-zinc-100 mb-1 flex items-center gap-1.5 tracking-tight group-hover:text-purple-300 transition-colors">
                    {item.title}
                    {item.isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-zinc-600 shrink-0" />
                    )}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 font-sans">
                    {item.description}
                  </p>
                </div>

                {/* Progress or Claim Action Footer */}
                <div className="pt-3 border-t border-zinc-800/80">
                  {item.isUnlocked ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-mono font-semibold text-amber-400">
                        +{item.xp} XP
                      </div>

                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                          <Check className="w-3 h-3 text-emerald-400" /> Claimed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleClaimReward(e, item.id)}
                          disabled={claimingId === item.id}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold font-mono text-zinc-950 bg-zinc-100 hover:bg-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Gift className="w-3 h-3 text-zinc-950" />
                          <span>{claimingId === item.id ? "Claiming..." : "Claim Reward"}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
                        <span>Goal Progress</span>
                        <span className="text-purple-400 font-semibold">{item.progressPct}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
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
