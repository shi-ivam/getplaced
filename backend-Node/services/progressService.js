import mongoose from "mongoose";
import Progress from "../models/progressModel.js";
import User from "../models/userModel.js";
import { calculatePlacementReadiness } from "./readinessService.js";

/**
 * Generate progress snapshots and calculate velocity metrics.
 */
export async function getProgressAnalytics(userId, user = null) {
  let progress = await Progress.findOne({ userId });

  if (!progress) {
    progress = await Progress.create({
      userId,
      dailyStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date(),
      totalProblemsSolved: 0,
      totalStudyMinutes: 0,
      totalTasksCompleted: 0,
      weeklyVelocityPct: 0,
      snapshots: [],
      activityLog: [],
    });
  }

  // Calculate real velocity between last 2 snapshots
  const snaps = progress.snapshots || [];
  let velocity7d = 0;
  let velocity30d = 0;

  if (snaps.length >= 2) {
    const latest = snaps[snaps.length - 1].overallScore;
    const prev = snaps[snaps.length - 2].overallScore;
    velocity7d = Number((latest - prev).toFixed(1));
  }

  const latestScore = snaps.length > 0 ? snaps[snaps.length - 1].overallScore : null;
  const targetScore = 85;
  const gap = latestScore !== null ? Math.max(0, targetScore - latestScore) : null;
  const weeksToTarget = (velocity7d > 0 && gap !== null) ? Math.ceil(gap / (velocity7d * 1.5)) : null;

  return {
    dailyStreak: progress.dailyStreak || 0,
    longestStreak: progress.longestStreak || 0,
    totalProblemsSolved: progress.totalProblemsSolved || 0,
    totalStudyMinutes: progress.totalStudyMinutes || 0,
    totalStudyHours: Number(((progress.totalStudyMinutes || 0) / 60).toFixed(1)),
    totalTasksCompleted: progress.totalTasksCompleted || 0,
    weeklyVelocityPct: velocity7d,
    monthlyVelocityPct: velocity30d,
    latestScore,
    targetScore,
    projectedWeeksToPlacementReady: weeksToTarget,
    snapshots: snaps,
    activityLog: (progress.activityLog || []).slice(0, 10),
  };
}

/**
 * Log activity and update user stats & XP.
 */
export async function logUserActivity(userId, activityData) {
  let progress = await Progress.findOne({ userId });
  if (!progress) {
    progress = await Progress.create({ userId });
  }

  const xp = activityData.xp || 15;
  progress.activityLog.unshift({
    timestamp: new Date(),
    type: activityData.type || "study_session",
    title: activityData.title || "Completed Learning Activity",
    xp,
    metadata: activityData.metadata || {},
  });

  if (activityData.type === "dsa_solved") {
    progress.totalProblemsSolved += 1;
  }
  if (activityData.studyMinutes) {
    progress.totalStudyMinutes += activityData.studyMinutes;
  }

  await progress.save();
  return { success: true, xpEarned: xp, totalProblems: progress.totalProblemsSolved };
}
