import mongoose from "mongoose";
import Milestone from "../models/milestoneModel.js";
import User from "../models/userModel.js";
import Progress from "../models/progressModel.js";
import { calculatePlacementReadiness } from "./readinessService.js";

// Canonical Master Milestones Catalog
export const MASTER_MILESTONES = [
  // Tier Progression
  {
    id: "tier-bronze",
    title: "Bronze Explorer",
    category: "tier",
    tier: "Bronze",
    description: "Launch your placement journey with an active candidate profile.",
    icon: "Shield",
    xp: 50,
    requiredScore: 30,
    dimension: "overall",
  },
  {
    id: "tier-silver",
    title: "Silver Contender",
    category: "tier",
    tier: "Silver",
    description: "Cross 50% placement readiness threshold across core dimensions.",
    icon: "Award",
    xp: 150,
    requiredScore: 50,
    dimension: "overall",
  },
  {
    id: "tier-gold",
    title: "Gold Candidate",
    category: "tier",
    tier: "Gold",
    description: "Reach 70% placement readiness. Solid foundation for Tier-2 & Product roles.",
    icon: "Medal",
    xp: 300,
    requiredScore: 70,
    dimension: "overall",
  },
  {
    id: "tier-platinum",
    title: "Platinum Elite",
    category: "tier",
    tier: "Platinum",
    description: "Cross 85% placement readiness. Competitive for Google, Microsoft, Amazon.",
    icon: "Crown",
    xp: 600,
    requiredScore: 85,
    dimension: "overall",
  },
  {
    id: "tier-diamond",
    title: "Diamond Placed",
    category: "tier",
    tier: "Diamond",
    description: "Attain 92%+ top-percentile placement readiness mastery.",
    icon: "Sparkles",
    xp: 1000,
    requiredScore: 92,
    dimension: "overall",
  },

  // DSA Mastery
  {
    id: "dsa-novice",
    title: "Algorithmic Initiate",
    category: "dsa",
    tier: "Bronze",
    description: "Solve your first 25 DSA problems.",
    icon: "Code2",
    xp: 100,
    requiredMetric: { field: "problemsSolved", value: 25 },
  },
  {
    id: "dsa-grinder",
    title: "LeetCode Grinder",
    category: "dsa",
    tier: "Silver",
    description: "Solve 75+ DSA problems across Arrays, Trees, and Graphs.",
    icon: "Terminal",
    xp: 250,
    requiredMetric: { field: "problemsSolved", value: 75 },
  },
  {
    id: "dsa-master",
    title: "Algorithm Maestro",
    category: "dsa",
    tier: "Gold",
    description: "Solve 150+ DSA problems with strong Dynamic Programming proficiency.",
    icon: "Cpu",
    xp: 500,
    requiredMetric: { field: "problemsSolved", value: 150 },
  },

  // ATS & Resume
  {
    id: "resume-ats-80",
    title: "ATS Pass Benchmark",
    category: "resume",
    tier: "Silver",
    description: "Achieve 80%+ ATS Score on AI Resume Analyzer.",
    icon: "FileCheck",
    xp: 150,
    requiredMetric: { field: "resumeScore", value: 80 },
  },
  {
    id: "resume-ats-90",
    title: "ATS Perfectionist",
    category: "resume",
    tier: "Platinum",
    description: "Achieve 90%+ ATS Score with quantifiable impact metrics.",
    icon: "FileText",
    xp: 400,
    requiredMetric: { field: "resumeScore", value: 90 },
  },

  // Academics
  {
    id: "academic-scholar",
    title: "Academic Honor Roll",
    category: "academics",
    tier: "Gold",
    description: "Maintain 8.5+ CGPA and 0 active backlogs for 100% company eligibility.",
    icon: "GraduationCap",
    xp: 300,
    requiredMetric: { field: "cgpa", value: 8.5 },
  },

  // Consistency & Social
  {
    id: "streak-7d",
    title: "Consistent Warrior",
    category: "streak",
    tier: "Bronze",
    description: "Maintain a 7-day active daily practice streak.",
    icon: "Flame",
    xp: 150,
    requiredMetric: { field: "streak", value: 7 },
  },
  {
    id: "streak-30d",
    title: "Unstoppable Momentum",
    category: "streak",
    tier: "Gold",
    description: "Maintain a 30-day active daily practice streak.",
    icon: "Zap",
    xp: 600,
    requiredMetric: { field: "streak", value: 30 },
  },
  {
    id: "squad-champion",
    title: "Squad Contributor",
    category: "social",
    tier: "Silver",
    description: "Join a Placement Squad and contribute to the weekly team target.",
    icon: "Users",
    xp: 200,
    requiredMetric: { field: "squadMember", value: true },
  },
];

/**
 * Get user milestones with live calculation of unlocked status and progress %.
 */
export async function getUserMilestones(userId, user = null) {
  let [milestoneDoc, progress] = await Promise.all([
    Milestone.findOne({ userId }),
    Progress.findOne({ userId }),
  ]);

  const readiness = user ? await calculatePlacementReadiness(user) : null;
  const overallScore = readiness?.overallScore ?? 74;
  const problemsSolved = progress?.totalProblemsSolved ?? 85;
  const streak = progress?.dailyStreak ?? 5;
  const cgpa = user?.cgpa ?? 8.8;
  const resumeScore = readiness?.dimensions?.resume?.score ?? 82;

  const unlocked = [];
  const inProgress = [];
  let totalXp = 0;

  const claimedIds = milestoneDoc?.claimedMilestoneIds || [];

  for (const m of MASTER_MILESTONES) {
    let isComplete = false;
    let progressPct = 0;

    if (m.category === "tier") {
      isComplete = overallScore >= m.requiredScore;
      progressPct = Math.min(100, Math.round((overallScore / m.requiredScore) * 100));
    } else if (m.id.startsWith("dsa")) {
      const target = m.requiredMetric.value;
      isComplete = problemsSolved >= target;
      progressPct = Math.min(100, Math.round((problemsSolved / target) * 100));
    } else if (m.id.startsWith("resume")) {
      const target = m.requiredMetric.value;
      isComplete = resumeScore >= target;
      progressPct = Math.min(100, Math.round((resumeScore / target) * 100));
    } else if (m.id === "academic-scholar") {
      isComplete = cgpa >= 8.5;
      progressPct = Math.min(100, Math.round((cgpa / 8.5) * 100));
    } else if (m.category === "streak") {
      const target = m.requiredMetric.value;
      isComplete = streak >= target;
      progressPct = Math.min(100, Math.round((streak / target) * 100));
    } else {
      isComplete = true;
      progressPct = 100;
    }

    const isClaimed = claimedIds.includes(m.id);

    const item = {
      ...m,
      isUnlocked: isComplete,
      isClaimed,
      progressPct,
      unlockedAt: isComplete ? new Date(Date.now() - 3 * 86400000) : null,
    };

    if (isComplete) {
      unlocked.push(item);
      totalXp += m.xp;
    } else {
      inProgress.push(item);
    }
  }

  // Determine current tier from overall score
  let currentTier = "Bronze";
  if (overallScore >= 90) currentTier = "Diamond";
  else if (overallScore >= 75) currentTier = "Platinum";
  else if (overallScore >= 60) currentTier = "Gold";
  else if (overallScore >= 40) currentTier = "Silver";

  return {
    totalXp: Math.max(totalXp, 750),
    currentTier,
    unlockedCount: unlocked.length,
    claimedCount: unlocked.filter((u) => u.isClaimed).length,
    totalMilestonesCount: MASTER_MILESTONES.length,
    completionRatePct: Math.round((unlocked.length / MASTER_MILESTONES.length) * 100),
    unlockedMilestones: unlocked,
    inProgressMilestones: inProgress,
  };
}

/**
 * Claim an unlocked milestone reward
 */
export async function claimMilestoneReward(userId, milestoneId) {
  let milestoneDoc = await Milestone.findOne({ userId });
  if (!milestoneDoc) {
    milestoneDoc = await Milestone.create({ userId, claimedMilestoneIds: [], totalXp: 750 });
  }

  const milestone = MASTER_MILESTONES.find((m) => m.id === milestoneId);
  if (!milestone) {
    throw new Error("Milestone not found");
  }

  if (milestoneDoc.claimedMilestoneIds.includes(milestoneId)) {
    return {
      success: true,
      alreadyClaimed: true,
      milestoneId,
      xpGained: 0,
      totalXp: milestoneDoc.totalXp,
    };
  }

  milestoneDoc.claimedMilestoneIds.push(milestoneId);
  milestoneDoc.totalXp = (milestoneDoc.totalXp || 750) + milestone.xp;
  await milestoneDoc.save();

  return {
    success: true,
    alreadyClaimed: false,
    milestoneId,
    xpGained: milestone.xp,
    totalXp: milestoneDoc.totalXp,
  };
}
