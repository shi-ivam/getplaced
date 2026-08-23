import mongoose from "mongoose";
import Roadmap from "../models/roadmapModel.js";
import User from "../models/userModel.js";
import Progress from "../models/progressModel.js";

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
 * Helper to build dynamic roadmap phases & weekly milestones for 4, 8, or 12 weeks.
 */
export async function createPersonalizedRoadmap(userId, targetCompany, targetRole, timelineWeeks = 8) {
  const parsedWeeks = Number(timelineWeeks) === 4 || Number(timelineWeeks) === 12 ? Number(timelineWeeks) : 8;

  let phases = [];

  if (parsedWeeks === 4) {
    phases = [
      {
        phaseNumber: 1,
        title: "Phase 1: Academic Cutoffs, ATS Resume & Core Patterns",
        description: "Verify academic eligibility, optimize ATS resume, and master high-frequency DSA patterns.",
        durationWeeks: 2,
        weeks: [
          {
            weekNumber: 1,
            title: "Profile Calibration & Resume Engineering",
            objective: "Optimize ATS resume with quantified bullet points and calibrate profile cutoffs.",
            isCurrent: true,
            tasks: [
              {
                id: "w1-t1",
                title: "Run AI Resume Analyzer for " + targetRole,
                description: "Upload resume PDF, review ATS score and implement suggested missing keywords.",
                type: "resume",
                estimatedMinutes: 25,
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/resume",
              },
              {
                id: "w1-t2",
                title: "Verify Academic Eligibility & Cutoffs",
                description: `Evaluate your CGPA against ${targetCompany} cutoffs and calculate target SGPA.`,
                type: "academics",
                estimatedMinutes: 20,
                completed: false,
                completedAt: null,
                impactScore: 2.5,
                actionUrl: "/app/academics",
              },
              {
                id: "w1-t3",
                title: "Connect LeetCode and GitHub Accounts",
                description: "Sync automated problem statistics and project activity directly to dashboard.",
                type: "dsa",
                estimatedMinutes: 15,
                completed: false,
                completedAt: null,
                impactScore: 3.0,
                actionUrl: "/app/profile",
              },
            ],
          },
          {
            weekNumber: 2,
            title: "Core High-Frequency DSA & System Fundamentals",
            objective: "Master Two Pointers, Sliding Window, Hashing, and core caching architectures.",
            isCurrent: false,
            tasks: [
              {
                id: "w2-t1",
                title: "Solve 5 Two Pointer & Sliding Window Problems",
                description: "Practice 3Sum, Container With Most Water, and Minimum Window Substring.",
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/coding",
              },
              {
                id: "w2-t2",
                title: "System Design Basics: Caching & Load Balancing",
                description: "Deep dive study module on Redis caching strategies and NGINX load balancing.",
                type: "core_cs",
                estimatedMinutes: 35,
                completed: false,
                completedAt: null,
                impactScore: 2.5,
                actionUrl: "/app/dsa",
              },
              {
                id: "w2-t3",
                title: "Polish Top GitHub Project README",
                description: "Add architecture flowchart, live demo URL, and API documentation.",
                type: "project",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 3.0,
                actionUrl: "/app/profile",
              },
            ],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Company Sprints, Story Vault & Live Mocks",
        description: `Simulate ${targetCompany} interview rounds and master behavioral STAR storytelling.`,
        durationWeeks: 2,
        weeks: [
          {
            weekNumber: 3,
            title: `${targetCompany} Targeted Problem Set & Trees/DP`,
            objective: "Solve company-tagged tree and DP problems under timed constraints.",
            isCurrent: false,
            tasks: [
              {
                id: "w3-t1",
                title: "Solve Binary Tree Traversal & Lowest Common Ancestor",
                description: `High-frequency tree problem often tested in ${targetCompany} Round 1.`,
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/coding",
              },
              {
                id: "w3-t2",
                title: "Draft 3 STAR Stories in Story Vault",
                description: "Author technical challenge, conflict resolution, and outage post-mortem stories.",
                type: "interview",
                estimatedMinutes: 35,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/hr-prep",
              },
            ],
          },
          {
            weekNumber: 4,
            title: "Final Placement Readiness Sprint & Executive Mock",
            objective: "Achieve 85%+ overall placement readiness score across all dimensions.",
            isCurrent: false,
            tasks: [
              {
                id: "w4-t1",
                title: "Participate in Placement Arena Timed Sprint",
                description: "Compete on the leaderboard with your squad peers under 45-minute timer.",
                type: "dsa",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 3.0,
                actionUrl: "/app/arena",
              },
              {
                id: "w4-t2",
                title: "Complete Full AI Mock Interview Session",
                description: "Comprehensive technical + system design + HR behavioral simulation.",
                type: "interview",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 4.5,
                actionUrl: "/app/interview",
              },
            ],
          },
        ],
      },
    ];
  } else if (parsedWeeks === 12) {
    phases = [
      {
        phaseNumber: 1,
        title: "Phase 1: Academic Clearance, ATS Resume & Core CS",
        description: "Zero-backlog verification, 85+ ATS resume optimization, and Operating Systems/DBMS fundamentals.",
        durationWeeks: 3,
        weeks: [
          {
            weekNumber: 1,
            title: "Profile Calibration & ATS Resume Engineering",
            objective: "Optimize ATS resume with quantified bullet points and verify CGPA eligibility.",
            isCurrent: true,
            tasks: [
              {
                id: "w1-t1",
                title: "Run AI Resume Analyzer for " + targetRole,
                description: "Upload resume PDF, review ATS score and implement suggested missing keywords.",
                type: "resume",
                estimatedMinutes: 25,
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/resume",
              },
              {
                id: "w1-t2",
                title: "Verify Academic Eligibility & Cutoffs",
                description: `Evaluate your CGPA against ${targetCompany} cutoffs and calculate target SGPA.`,
                type: "academics",
                estimatedMinutes: 20,
                completed: false,
                completedAt: null,
                impactScore: 2.5,
                actionUrl: "/app/academics",
              },
              {
                id: "w1-t3",
                title: "Connect LeetCode and GitHub Accounts",
                description: "Sync automated problem statistics and project activity directly to dashboard.",
                type: "dsa",
                estimatedMinutes: 15,
                completed: false,
                completedAt: null,
                impactScore: 3.0,
                actionUrl: "/app/profile",
              },
            ],
          },
          {
            weekNumber: 2,
            title: "Operating Systems & Concurrency Fundamentals",
            objective: "Master Process Scheduling, Threads, Mutexes, Deadlocks, and Memory Management.",
            isCurrent: false,
            tasks: [
              {
                id: "w2-t1",
                title: "Review Core OS Process Scheduling & Virtual Memory",
                description: "Prepare for online assessment technical MCQs and interview architecture rounds.",
                type: "core_cs",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 3.0,
                actionUrl: "/app/dsa",
              },
              {
                id: "w2-t2",
                title: "Solve 4 High-Frequency Hashing Problems",
                description: "Master HashMaps, Frequency Counters, and Subarray Sum Equals K.",
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/coding",
              },
            ],
          },
          {
            weekNumber: 3,
            title: "Database Management: SQL Indexing & ACID",
            objective: "Master B-Trees, transactions, isolation levels, and normalization.",
            isCurrent: false,
            tasks: [
              {
                id: "w3-t1",
                title: "Study Database Indexing & Query Execution Plans",
                description: "Understand B+ Tree index scans, composite indexes, and lock escalation.",
                type: "core_cs",
                estimatedMinutes: 40,
                completed: false,
                completedAt: null,
                impactScore: 3.0,
                actionUrl: "/app/dsa",
              },
              {
                id: "w3-t2",
                title: "Polish Top GitHub Project Architecture & README",
                description: "Add architecture diagrams, deployment URLs, and comprehensive API docs.",
                type: "project",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/profile",
              },
            ],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Core Data Structures, Trees & Linked Lists",
        description: "Master Linked Lists, Stacks, Queues, Binary Trees, and Recursion Backtracking.",
        durationWeeks: 3,
        weeks: [
          {
            weekNumber: 4,
            title: "Arrays, Two Pointers & Sliding Window",
            objective: "Master 2Sum, 3Sum, Trapping Rain Water, and Minimum Window Substring.",
            isCurrent: false,
            tasks: [
              {
                id: "w4-t1",
                title: "Solve 5 Classic Two Pointer & Sliding Window Problems",
                description: "Focus on in-place memory optimization and two-pointer bounds.",
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/coding",
              },
            ],
          },
          {
            weekNumber: 5,
            title: "Monotonic Stacks, Queues & Linked Lists",
            objective: "Master Next Greater Element, Daily Temperatures, and LRU Cache design.",
            isCurrent: false,
            tasks: [
              {
                id: "w5-t1",
                title: "Implement LRU Cache & Monotonic Stack Problems",
                description: "Frequently requested in Tier-1 technical coding rounds.",
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/coding",
              },
            ],
          },
          {
            weekNumber: 6,
            title: "Binary Trees, BSTs & Tree Traversals",
            objective: "Master Diameter of Tree, LCA, Path Sum III, and Tree Serialization.",
            isCurrent: false,
            tasks: [
              {
                id: "w6-t1",
                title: "Solve Lowest Common Ancestor & Binary Tree Max Path Sum",
                description: "Master recursive divide-and-conquer tree patterns.",
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/coding",
              },
            ],
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Phase 3: Dynamic Programming, Graphs & System Design",
        description: "Conquer 1D/2D DP, Graph Traversals, Shortest Paths, and Microservices Architecture.",
        durationWeeks: 3,
        weeks: [
          {
            weekNumber: 7,
            title: "Dynamic Programming (1D, 2D Grid & Subsequences)",
            objective: "Master Coin Change, Longest Increasing Subsequence, and Edit Distance.",
            isCurrent: false,
            tasks: [
              {
                id: "w7-t1",
                title: "Solve 4 Medium-Hard DP Problems",
                description: "State formulation, memoization table initialization, and space reduction.",
                type: "dsa",
                estimatedMinutes: 75,
                completed: false,
                completedAt: null,
                impactScore: 4.5,
                actionUrl: "/app/coding",
              },
            ],
          },
          {
            weekNumber: 8,
            title: "Graph Algorithms: BFS, DFS, Dijkstra & Topological Sort",
            objective: "Tackle Number of Islands, Course Schedule, and Alien Dictionary.",
            isCurrent: false,
            tasks: [
              {
                id: "w8-t1",
                title: "Solve Course Schedule & Network Delay Time",
                description: "Graph modeling, cycle detection, and shortest-path DAG algorithms.",
                type: "dsa",
                estimatedMinutes: 70,
                completed: false,
                completedAt: null,
                impactScore: 4.5,
                actionUrl: "/app/coding",
              },
            ],
          },
          {
            weekNumber: 9,
            title: "Large-Scale Distributed Systems & Microservices",
            objective: "Design scalable message queues, rate limiters, and distributed caches.",
            isCurrent: false,
            tasks: [
              {
                id: "w9-t1",
                title: "Design a Distributed Rate Limiter & URL Shortener",
                description: "Token bucket algorithm, Redis clusters, and consistency models.",
                type: "core_cs",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/development",
              },
            ],
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Phase 4: Company Sprints, Behavioral STAR Vault & Mocks",
        description: `Simulate ${targetCompany} interview rounds and master behavioral STAR storytelling.`,
        durationWeeks: 3,
        weeks: [
          {
            weekNumber: 10,
            title: `${targetCompany} Tagged Problems & Behavioral Leadership`,
            objective: "Solve high-frequency company problems and draft STAR project narratives.",
            isCurrent: false,
            tasks: [
              {
                id: "w10-t1",
                title: `Attempt 3 Timed Problems Tagged for ${targetCompany}`,
                description: "Build algorithmic speed and clean edge-case reasoning without hints.",
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/coding",
              },
              {
                id: "w10-t2",
                title: "Draft Master STAR Stories in HR Story Vault",
                description: "Prepare Situation, Task, Action, Result narratives for leadership principles.",
                type: "interview",
                estimatedMinutes: 40,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/hr-prep",
              },
            ],
          },
          {
            weekNumber: 11,
            title: "Placement Arena Speed Sprints & Peer Leaderboard",
            objective: "Compete in live timed coding sessions with peers.",
            isCurrent: false,
            tasks: [
              {
                id: "w11-t1",
                title: "Participate in Placement Arena Weekly Coding Sprint",
                description: "Solve problems against the clock on the squad leaderboard.",
                type: "dsa",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/arena",
              },
            ],
          },
          {
            weekNumber: 12,
            title: "Executive Mock Interview & Final Placement Clearance",
            objective: "Benchmark 88%+ readiness across all 7 placement dimensions.",
            isCurrent: false,
            tasks: [
              {
                id: "w12-t1",
                title: "Complete Final Full-Length AI Mock Interview",
                description: "Comprehensive technical + system design + HR behavioral round.",
                type: "interview",
                estimatedMinutes: 50,
                completed: false,
                completedAt: null,
                impactScore: 5.0,
                actionUrl: "/app/interview",
              },
            ],
          },
        ],
      },
    ];
  } else {
    // Default: 8 Weeks Plan
    phases = [
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
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/resume",
              },
              {
                id: "w1-t2",
                title: "Verify Academic Eligibility & Semester Cutoffs",
                description: `Evaluate your CGPA against ${targetCompany} cutoff and calculate target SGPA.`,
                type: "academics",
                estimatedMinutes: 20,
                completed: false,
                completedAt: null,
                impactScore: 2.5,
                actionUrl: "/app/academics",
              },
              {
                id: "w1-t3",
                title: "Connect LeetCode and GitHub Accounts",
                description: "Sync automated problem statistics and project activity directly to dashboard.",
                type: "dsa",
                estimatedMinutes: 15,
                completed: false,
                completedAt: null,
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
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/coding",
              },
              {
                id: "w2-t2",
                title: "System Design Basics: Caching & Load Balancing",
                description: "Deep dive study module on Redis & NGINX load balancing architectures.",
                type: "core_cs",
                estimatedMinutes: 35,
                completed: false,
                completedAt: null,
                impactScore: 2.5,
                actionUrl: "/app/dsa",
              },
              {
                id: "w2-t3",
                title: "Polish Top GitHub Project README",
                description: "Add architecture flowchart, live demo URL, and API documentation.",
                type: "project",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
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
                description: `Frequently asked in ${targetCompany} Technical Round 1.`,
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
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
                completedAt: null,
                impactScore: 2.0,
                actionUrl: "/app/dsa",
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
                completedAt: null,
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
                completedAt: null,
                impactScore: 2.5,
                actionUrl: "/app/dsa",
              },
            ],
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Phase 3: System Design & STAR Story Matrix",
        description: "Architect scalable backend services and craft behavioral leadership narratives.",
        durationWeeks: 2,
        weeks: [
          {
            weekNumber: 5,
            title: "System Architecture, Caching & API Design",
            objective: "Design resilient microservices with circuit breakers and optimistic locking.",
            isCurrent: false,
            tasks: [
              {
                id: "w5-t1",
                title: "Study Microservices Architecture & Resilience",
                description: "Learn circuit breakers, retry backoffs, and message queues in distributed systems.",
                type: "core_cs",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/development",
              },
              {
                id: "w5-t2",
                title: "Draft 3 STAR Stories in HR Story Vault",
                description: "Document core project technical trade-offs, incident post-mortems, and teamwork.",
                type: "interview",
                estimatedMinutes: 35,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/hr-prep",
              },
            ],
          },
          {
            weekNumber: 6,
            title: "Company-Specific Tagged Sprints",
            objective: `Solve top 10 tagged questions for ${targetCompany} under timed constraints.`,
            isCurrent: false,
            tasks: [
              {
                id: "w6-t1",
                title: `Attempt 3 Timed Problems Tagged for ${targetCompany}`,
                description: "Build speed and clean edge-case handling without IDE autocomplete.",
                type: "dsa",
                estimatedMinutes: 60,
                completed: false,
                completedAt: null,
                impactScore: 4.0,
                actionUrl: "/app/coding",
              },
              {
                id: "w6-t2",
                title: "Conduct Behavioral Mock Interview (STAR Method)",
                description: "Practice answering behavioral questions tailored to company leadership principles.",
                type: "interview",
                estimatedMinutes: 30,
                completed: false,
                completedAt: null,
                impactScore: 3.5,
                actionUrl: "/app/hr-prep",
              },
            ],
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Phase 4: Placement Arena Sprint & Final Mocks",
        description: `Final simulation rounds for ${targetCompany} with peer leaderboard benchmarking.`,
        durationWeeks: 2,
        weeks: [
          {
            weekNumber: 7,
            title: "Placement Arena Weekly Coding Sprint",
            objective: "Compete on the leaderboard with your squad peers under pressure.",
            isCurrent: false,
            tasks: [
              {
                id: "w7-t1",
                title: "Participate in Placement Arena Weekly Coding Sprint",
                description: "Compete on the leaderboard with your squad peers.",
                type: "dsa",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 3.0,
                actionUrl: "/app/arena",
              },
            ],
          },
          {
            weekNumber: 8,
            title: "Final Placement Readiness Sprint & Executive Mock",
            objective: "Achieve 88%+ overall placement readiness score across all 7 dimensions.",
            isCurrent: false,
            tasks: [
              {
                id: "w8-t1",
                title: "Complete Final Full-Length Mock Interview",
                description: "Comprehensive technical + system design + HR behavioral round.",
                type: "interview",
                estimatedMinutes: 45,
                completed: false,
                completedAt: null,
                impactScore: 4.5,
                actionUrl: "/app/interview",
              },
            ],
          },
        ],
      },
    ];
  }

  const totalTasks = phases.flatMap((p) => p.weeks.flatMap((w) => w.tasks));
  const completedTasks = totalTasks.filter((t) => t.completed);
  const overallProgress = Math.round((completedTasks.length / totalTasks.length) * 100);

  const newRoadmap = await Roadmap.findOneAndUpdate(
    { userId },
    {
      userId,
      targetCompany,
      targetRole,
      timelineWeeks: parsedWeeks,
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

  // Find and update user's Progress document
  try {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = await Progress.create({ userId });
    }

    if (foundTask.completed) {
      progress.totalTasksCompleted = (progress.totalTasksCompleted || 0) + 1;
      const xpEarned = Math.round((foundTask.impactScore || 3.0) * 10);
      progress.activityLog.unshift({
        timestamp: new Date(),
        type: "roadmap_task",
        title: `Completed Roadmap Task: ${foundTask.title}`,
        xp: xpEarned,
        metadata: { taskId: foundTask.id, taskType: foundTask.type, impactScore: foundTask.impactScore },
      });
      progress.lastActiveDate = new Date();
    } else {
      if (progress.totalTasksCompleted > 0) {
        progress.totalTasksCompleted -= 1;
      }
    }
    await progress.save();
  } catch (progErr) {
    console.warn("Could not sync roadmap task completion to Progress model:", progErr.message);
  }

  return {
    success: true,
    task: foundTask,
    overallProgress: roadmap.overallProgress,
  };
}
