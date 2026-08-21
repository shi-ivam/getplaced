import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Bronze: "from-amber-700/30 to-amber-900/10 border-amber-600/40 text-amber-300",
  Silver: "from-slate-400/30 to-slate-600/10 border-slate-400/40 text-slate-200",
  Gold: "from-yellow-500/30 to-amber-600/10 border-yellow-500/40 text-yellow-300",
  Platinum: "from-cyan-500/30 to-blue-600/10 border-cyan-500/40 text-cyan-300",
  Diamond: "from-purple-500/30 to-pink-600/10 border-purple-500/40 text-purple-300",
};

export default function Milestones() {
  const [milestonesData, setMilestonesData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchMilestones();
  }, []);

  const unlocked = milestonesData?.unlockedMilestones || [];
  const inProgress = milestonesData?.inProgressMilestones || [];
  const allMilestones = [...unlocked, ...inProgress];

  const filteredMilestones = allMilestones.filter((m) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "unlocked") return m.isUnlocked;
    if (activeCategory === "inProgress") return !m.isUnlocked;
    return m.category === activeCategory;
  });

  const currentTier = milestonesData?.currentTier || "Platinum";
  const totalXp = milestonesData?.totalXp || 1250;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Readiness Milestones & Badges</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Gamified achievement badges, readiness tiers, and milestone progression
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#18181b] border border-gray-800 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400">Total Placement XP:</span>
            <span className="text-yellow-400 font-bold font-mono text-sm">{totalXp} XP</span>
          </div>
        </div>
      </div>

      {/* Tier Progression Gauge */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#18181b] to-indigo-950/40 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 block">
              Current Candidate Tier
            </span>
            <div className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span>{currentTier} Candidate</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400">Milestone Completion</span>
            <div className="text-lg font-bold text-white">
              {milestonesData?.unlockedCount || 7} / {milestonesData?.totalMilestonesCount || 14} Badges
            </div>
          </div>
        </div>

        {/* Tier Steps */}
        <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-gray-800/80">
          {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((tier, idx) => {
            const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
            const currentIdx = tiers.indexOf(currentTier);
            const isPassed = idx <= currentIdx;
            const isCurrent = tier === currentTier;

            return (
              <div
                key={tier}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? "bg-purple-600/30 border-purple-500 text-white font-bold shadow-lg"
                    : isPassed
                    ? "bg-[#141418] border-gray-700 text-gray-300"
                    : "bg-[#121214]/50 border-gray-800/50 text-gray-600"
                }`}
              >
                <div className="text-xs">{tier}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {idx === 0 ? "0-39%" : idx === 1 ? "40-59%" : idx === 2 ? "60-74%" : idx === 3 ? "75-89%" : "90%+"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {[
          { key: "all", label: "All Badges" },
          { key: "unlocked", label: "Unlocked" },
          { key: "inProgress", label: "In Progress" },
          { key: "tier", label: "Tier Badges" },
          { key: "dsa", label: "DSA Mastery" },
          { key: "resume", label: "Resume & ATS" },
          { key: "academics", label: "Academics" },
          { key: "streak", label: "Streaks" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === tab.key
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-[#18181b] text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMilestones.map((item) => {
          const IconComp = ICON_MAP[item.icon] || Award;
          const tierColor = TIER_COLORS[item.tier] || TIER_COLORS.Bronze;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                item.isUnlocked
                  ? "bg-gradient-to-br from-[#18181f] to-[#121215] border-purple-500/30 hover:border-purple-500/60 shadow-lg"
                  : "bg-[#141416]/70 border-gray-800/80 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`p-3 rounded-2xl border ${
                      item.isUnlocked
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-md"
                        : "bg-gray-800/40 border-gray-700/50 text-gray-500"
                    }`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-gradient-to-r ${tierColor}`}
                  >
                    {item.tier}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  {item.title}
                  {item.isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  )}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Progress or Earned XP Footer */}
              <div className="pt-3 border-t border-gray-800/60">
                {item.isUnlocked ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold">✓ Unlocked</span>
                    <span className="text-yellow-400 font-bold font-mono">+{item.xp} XP</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-purple-400 font-mono">
                        {item.progressPct}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${item.progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
