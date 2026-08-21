import mongoose from "mongoose";
import User from "../models/userModel.js";
import Progress from "../models/progressModel.js";
import Milestone from "../models/milestoneModel.js";
import Roadmap from "../models/roadmapModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import { calculatePlacementReadiness } from "./readinessService.js";

/**
 * Generate high-impact daily recommendations ("What Should I Do Next?").
 */
export async function getNextRecommendedActions(user) {
  const userId = user._id || user.id;

  // 1. Calculate readiness state & dimension gaps
  let readiness = null;
  try {
    readiness = await calculatePlacementReadiness(user);
  } catch (err) {
    console.warn("Could not compute readiness for recommendations:", err.message);
  }

  // 2. Load supporting profile data
  let [progress, academic, roadmap] = await Promise.all([
    Progress.findOne({ userId }).lean(),
    AcademicProfile.findOne({ userId }).lean(),
    Roadmap.findOne({ userId }).lean(),
  ]);

  const targetCompany = user.targetCompany || "Tier 1 Tech";
  const targetRole = user.targetJobRole || "Software Development Engineer";
  const recommendations = [];

  // Dimension Scores
  const dsaScore = readiness?.dimensions?.dsa?.score ?? 60;
  const projectsScore = readiness?.dimensions?.projects?.score ?? 55;
  const resumeScore = readiness?.dimensions?.resume?.score ?? 70;
  const academicsScore = readiness?.dimensions?.academics?.score ?? 80;
  const interviewScore = readiness?.dimensions?.interview?.score ?? 50;

  // A. DSA Weakness / High-Impact Recommendation
  if (dsaScore < 85) {
    recommendations.push({
      id: "rec-dsa-patterns",
      category: "dsa",
      categoryLabel: "DSA & Problem Solving",
      priority: dsaScore < 65 ? "CRITICAL" : "HIGH",
      title: "Solve 2 Medium Dynamic Programming Problems",
      description: `Boost your DSA Readiness from ${dsaScore}% to target 85%+. Focus on 0/1 Knapsack & Longest Common Subsequence patterns targeted by ${targetCompany}.`,
      estimatedMinutes: 45,
      impactReadinessBoost: "+3.5%",
      actionUrl: "/app/coding",
      actionLabel: "Launch Coding Arena",
      icon: "Code2",
      badgeColor: "purple",
      dueToday: true,
    });
  }

  // B. Resume ATS Optimization
  if (resumeScore < 85) {
    recommendations.push({
      id: "rec-resume-ats",
      category: "resume",
      categoryLabel: "Resume & ATS Optimization",
      priority: resumeScore < 70 ? "CRITICAL" : "HIGH",
      title: "Optimize Resume Keywords for " + targetRole,
      description: "Add quantifiable impact metrics (e.g. reduced latency by 35%) and verify 85%+ ATS keyword alignment.",
      estimatedMinutes: 20,
      impactReadinessBoost: "+4.0%",
      actionUrl: "/app/resume",
      actionLabel: "Analyze Resume with AI",
      icon: "FileText",
      badgeColor: "blue",
      dueToday: false,
    });
  }

  // C. Projects & GitHub Proof-of-Work
  if (projectsScore < 80) {
    recommendations.push({
      id: "rec-github-live-demo",
      category: "projects",
      categoryLabel: "Projects & System Architecture",
      priority: "HIGH",
      title: "Add Live Deployment URL & Architecture Diagram to GitHub",
      description: "Recruiters and hiring managers at product companies prioritize repositories with live deployed demos and system architecture explanations.",
      estimatedMinutes: 30,
      impactReadinessBoost: "+3.0%",
      actionUrl: "/app/profile",
      actionLabel: "Sync GitHub Profile",
      icon: "FolderGit2",
      badgeColor: "emerald",
      dueToday: false,
    });
  }

  // D. Academic Eligibility / Cutoff Guard
  if (academic && (academic.currentCgpa < (academic.targetCgpa || 8.5) || academic.activeBacklogs > 0)) {
    recommendations.push({
      id: "rec-academics-target",
      category: "academics",
      categoryLabel: "Academics & Eligibility",
      priority: academic.activeBacklogs > 0 ? "CRITICAL" : "MEDIUM",
      title: `Target ${academic.targetCgpa || 8.5} CGPA Academic Benchmark`,
      description: `Maintain target SGPA in current semester (${academic.currentSemester || 6}) to remain 100% eligible for ${targetCompany} campus placement rounds.`,
      estimatedMinutes: 15,
      impactReadinessBoost: "+2.0%",
      actionUrl: "/app/academics",
      actionLabel: "View Academic Calculator",
      icon: "GraduationCap",
      badgeColor: "amber",
      dueToday: false,
    });
  }

  // E. Video Learning / Skill Gap
  recommendations.push({
    id: "rec-study-system-design",
    category: "study",
    categoryLabel: "Study Library & Core CS",
    priority: "MEDIUM",
    title: "Watch: System Design Basics & Microservices Scalability",
    description: "Curated 28-min deep-dive on Caching, Load Balancing, and Database Sharding from our Study Library.",
    estimatedMinutes: 28,
    impactReadinessBoost: "+2.5%",
    actionUrl: "/app/library",
    actionLabel: "Open Video Lesson",
    icon: "PlayCircle",
    badgeColor: "red",
    dueToday: false,
  });

  // F. Mock Interview Sprint
  if (interviewScore < 75) {
    recommendations.push({
      id: "rec-mock-behavioral",
      category: "interview",
      categoryLabel: "Mock Interview & Behavioral",
      priority: "MEDIUM",
      title: "Practice STAR Method for Behavioral Questions",
      description: `Prepare 3 impactful project conflict and leadership stories aligned with ${targetCompany} leadership tenets.`,
      estimatedMinutes: 25,
      impactReadinessBoost: "+3.0%",
      actionUrl: "/app/interview",
      actionLabel: "Start Interview Prep",
      icon: "BrainCog",
      badgeColor: "indigo",
      dueToday: false,
    });
  }

  // G. Roadmap Active Milestone Task
  if (roadmap && roadmap.phases?.length) {
    const currentPhase = roadmap.phases[0];
    const currentWeek = currentPhase?.weeks?.[0];
    const pendingTask = currentWeek?.tasks?.find((t) => !t.completed);
    if (pendingTask) {
      recommendations.unshift({
        id: "rec-roadmap-task-" + pendingTask.id,
        category: "roadmap",
        categoryLabel: `Week ${currentWeek.weekNumber} Milestone`,
        priority: "CRITICAL",
        title: pendingTask.title,
        description: pendingTask.description || `Crucial step in your ${roadmap.timelineWeeks}-week roadmap for ${roadmap.targetCompany}.`,
        estimatedMinutes: pendingTask.estimatedMinutes || 40,
        impactReadinessBoost: `+${pendingTask.impactScore || 3}%`,
        actionUrl: pendingTask.actionUrl || "/app/roadmap",
        actionLabel: "Continue Roadmap",
        icon: "Target",
        badgeColor: "cyan",
        dueToday: true,
      });
    }
  }

  return {
    streakDays: progress?.dailyStreak || 3,
    todayCompletedCount: progress?.totalTasksCompleted || 0,
    dailyGoalCount: 3,
    overallReadiness: readiness?.overallScore || 72,
    targetCompany,
    targetRole,
    recommendations: recommendations.slice(0, 5),
  };
}

/**
 * Mark recommendation or daily task as completed.
 */
export async function completeRecommendationTask(userId, taskId) {
  let progress = await Progress.findOne({ userId });
  if (!progress) {
    progress = await Progress.create({
      userId,
      dailyStreak: 1,
      totalTasksCompleted: 0,
      totalProblemsSolved: 0,
    });
  }

  progress.totalTasksCompleted += 1;
  progress.activityLog.unshift({
    timestamp: new Date(),
    type: "roadmap_task",
    title: `Completed Daily Task: ${taskId}`,
    xp: 25,
    metadata: { taskId },
  });

  await progress.save();

  return {
    success: true,
    message: "Task marked as completed! +25 XP earned.",
    totalTasksCompleted: progress.totalTasksCompleted,
    streakDays: progress.dailyStreak,
  };
}
