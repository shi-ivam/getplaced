import mongoose from "mongoose";
import Roadmap from "../models/roadmapModel.js";
import User from "../models/userModel.js";
import { calculatePlacementReadiness } from "./readinessService.js";

/**
 * Generate customized 4/8/12-week roadmap based on target company & role.
 */
export async function getOrGenerateUserRoadmap(userId, user = null, requestedWeeks = 8) {
  let roadmap = await Roadmap.findOne({ userId });

  const targetCompany = user?.targetCompany || "Microsoft";
  const targetRole = user?.targetJobRole || "Software Development Engineer";

  if (!roadmap) {
    roadmap = await createPersonalizedRoadmap(userId, targetCompany, targetRole, requestedWeeks);
  }

  return roadmap;
}

/**
 * Helper to build rich roadmap phases & weekly milestones.
 */
export async function createPersonalizedRoadmap(userId, targetCompany, targetRole, timelineWeeks = 8) {
  const isTier1 = ["Google", "Microsoft", "Amazon", "Atlassian", "Adobe", "Uber", "Flipkart"].some((c) =>
    targetCompany.toLowerCase().includes(c.toLowerCase())
  );

  const phases = [
    {
      phaseNumber: 1,
      title: "Phase 1: Academic Clearance & ATS Resume Baseline",
      description: "Establish zero-backlog eligibility and craft a high-conversion 85+ ATS resume.",
      durationWeeks: 2,
      weeks: [
        {
          weekNumber: 1,
          title: "Profile Calibration & Resume Engineering",
          objective: "Optimize ATS resume with quantified bullet points and check academic cutoffs.",
          isCurrent: true,
          tasks: [
            {
              id: "w1-t1",
              title: "Run AI Resume Analyzer for " + targetRole,
              description: "Upload resume PDF, review ATS score and implement suggested missing keywords.",
              type: "resume",
              estimatedMinutes: 25,
              completed: true,
              completedAt: new Date(Date.now() - 2 * 86400000),
              impactScore: 4.0,
              actionUrl: "/app/resume",
            },
            {
              id: "w1-t2",
              title: "Verify Academic Eligibility & Semester Cutoffs",
              description: `Evaluate your CGPA against ${targetCompany} cutoff and calculate target SGPA.`,
              type: "academics",
              estimatedMinutes: 20,
              completed: true,
              completedAt: new Date(Date.now() - 1 * 86400000),
              impactScore: 2.5,
              actionUrl: "/app/academics",
            },
            {
              id: "w1-t3",
              title: "Connect LeetCode and GitHub Accounts",
              description: "Sync automated problem statistics and project activity directly to dashboard.",
              type: "dsa",
              estimatedMinutes: 15,
              completed: true,
              completedAt: new Date(),
              impactScore: 3.0,
              actionUrl: "/app/profile",
            },
          ],
        },
        {
          weekNumber: 2,
          title: "Core Data Structures & Algorithm Foundations",
          objective: "Master high-frequency Two Pointers, Sliding Window, and Hashing patterns.",
          isCurrent: false,
          tasks: [
            {
              id: "w2-t1",
              title: "Solve 5 Two Pointer & Sliding Window Problems",
              description: "Practice 3Sum, Container With Most Water, and Minimum Window Substring.",
              type: "dsa",
              estimatedMinutes: 60,
              completed: false,
              impactScore: 3.5,
              actionUrl: "/app/coding",
            },
            {
              id: "w2-t2",
              title: "Watch System Design Basics: Caching & Load Balancing",
              description: "Deep dive video lecture from YouTube Study Library on Redis & NGINX.",
              type: "core_cs",
              estimatedMinutes: 35,
              completed: false,
              impactScore: 2.5,
              actionUrl: "/app/library",
            },
            {
              id: "w2-t3",
              title: "Polish Top GitHub Project README",
              description: "Add architecture flowchart, live demo URL, and API documentation.",
              type: "project",
              estimatedMinutes: 45,
              completed: false,
              impactScore: 3.0,
              actionUrl: "/app/profile",
            },
          ],
        },
      ],
    },
    {
      phaseNumber: 2,
      title: "Phase 2: High-Frequency Algorithmic Patterns & Trees",
      description: "Conquer Binary Trees, BSTs, Heaps, and Recursion Backtracking.",
      durationWeeks: 2,
      weeks: [
        {
          weekNumber: 3,
          title: "Binary Trees, BFS & DFS Traversal Mastery",
          objective: "Master LCA, Diameter, Level Order, and Tree Serialization.",
          isCurrent: false,
          tasks: [
            {
              id: "w3-t1",
              title: "Solve Lowest Common Ancestor & Binary Tree Max Path Sum",
              description: "Frequently asked in Amazon and Microsoft Technical Round 1.",
              type: "dsa",
              estimatedMinutes: 60,
              completed: false,
              impactScore: 4.0,
              actionUrl: "/app/coding",
            },
            {
              id: "w3-t2",
              title: "Operating Systems: Process Scheduling & Deadlocks",
              description: "Review OS core questions for online assessment technical MCQs.",
              type: "core_cs",
              estimatedMinutes: 30,
              completed: false,
              impactScore: 2.0,
              actionUrl: "/app/library",
            },
          ],
        },
        {
          weekNumber: 4,
          title: "Dynamic Programming & Graph Algorithms",
          objective: "Tackle 0/1 Knapsack, Longest Common Subsequence, and Dijkstra shortest path.",
          isCurrent: false,
          tasks: [
            {
              id: "w4-t1",
              title: "Solve 4 Medium DP Problems (1D & 2D Grid DP)",
              description: "Climbing Stairs, Coin Change, House Robber, and Unique Paths.",
              type: "dsa",
              estimatedMinutes: 75,
              completed: false,
              impactScore: 4.5,
              actionUrl: "/app/coding",
            },
            {
              id: "w4-t2",
              title: "Database Management: SQL Indexing & Normalization",
              description: "Master B-Trees, ACID transactions, and query optimization.",
              type: "core_cs",
              estimatedMinutes: 30,
              completed: false,
              impactScore: 2.5,
              actionUrl: "/app/library",
            },
          ],
        },
      ],
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Company-Specific Sprints & Mock Interviews",
      description: `Simulate ${targetCompany} technical interview rounds and behavioral STAR method.`,
      durationWeeks: 2,
      weeks: [
        {
          weekNumber: 5,
          title: `${targetCompany} Targeted Problem Set & Speed Runs`,
          objective: "Solve top 10 tagged questions under timed 30-minute constraints.",
          isCurrent: false,
          tasks: [
            {
              id: "w5-t1",
              title: `Attempt 3 Timed Problems Tagged for ${targetCompany}`,
              description: "Build speed and clean edge-case handling without IDE autocomplete.",
              type: "dsa",
              estimatedMinutes: 60,
              completed: false,
              impactScore: 4.0,
              actionUrl: "/app/coding",
            },
            {
              id: "w5-t2",
              title: "Conduct Behavioral Mock Interview (STAR Method)",
              description: "Practice answering: Tell me about a time you handled a tight deadline.",
              type: "interview",
              estimatedMinutes: 30,
              completed: false,
              impactScore: 3.5,
              actionUrl: "/app/interview",
            },
          ],
        },
        {
          weekNumber: 6,
          title: "Final Placement Readiness Sprint & Peer Challenge",
          objective: "Achieve 88%+ overall placement readiness score across all 7 dimensions.",
          isCurrent: false,
          tasks: [
            {
              id: "w6-t1",
              title: "Participate in Placement Arena Weekly Coding Sprint",
              description: "Compete on the leaderboard with your squad peers.",
              type: "dsa",
              estimatedMinutes: 45,
              completed: false,
              impactScore: 3.0,
              actionUrl: "/app/arena",
            },
            {
              id: "w6-t2",
              title: "Complete Final Full-Length Mock Interview",
              description: "Comprehensive technical + system design + HR behavioral round.",
              type: "interview",
              estimatedMinutes: 45,
              completed: false,
              impactScore: 4.5,
              actionUrl: "/app/interview",
            },
          ],
        },
      ],
    },
  ];

  const totalTasks = phases.flatMap((p) => p.weeks.flatMap((w) => w.tasks));
  const completedTasks = totalTasks.filter((t) => t.completed);
  const overallProgress = Math.round((completedTasks.length / totalTasks.length) * 100);

  const newRoadmap = await Roadmap.findOneAndUpdate(
    { userId },
    {
      userId,
      targetCompany,
      targetRole,
      timelineWeeks,
      currentWeek: 1,
      overallProgress,
      phases,
    },
    { upsert: true, new: true }
  );

  return newRoadmap;
}

/**
 * Toggle task completion on user roadmap.
 */
export async function toggleRoadmapTask(userId, taskId) {
  const roadmap = await Roadmap.findOne({ userId });
  if (!roadmap) {
    throw new Error("Roadmap not found for user.");
  }

  let foundTask = null;
  for (const phase of roadmap.phases) {
    for (const week of phase.weeks) {
      for (const task of week.tasks) {
        if (task.id === taskId) {
          task.completed = !task.completed;
          task.completedAt = task.completed ? new Date() : null;
          foundTask = task;
          break;
        }
      }
    }
  }

  if (!foundTask) {
    throw new Error("Task with ID " + taskId + " not found in roadmap.");
  }

  const allTasks = roadmap.phases.flatMap((p) => p.weeks.flatMap((w) => w.tasks));
  const completedCount = allTasks.filter((t) => t.completed).length;
  roadmap.overallProgress = Math.round((completedCount / allTasks.length) * 100);

  await roadmap.save();

  return {
    success: true,
    task: foundTask,
    overallProgress: roadmap.overallProgress,
  };
}
