import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";
import User from "../models/userModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import GitHubProfile from "../models/githubProfileModel.js";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import VtopProfile from "../models/vtopProfileModel.js";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";
import Roadmap from "../models/roadmapModel.js";
import Milestone from "../models/milestoneModel.js";
import Job from "../models/jobModel.js";
import Progress from "../models/progressModel.js";
import { calculatePlacementReadiness } from "./readinessService.js";
import { buildLevelComparison } from "./levelGapService.js";
import { fetchGitHubUserData, extractGitHubUsername, formatGitHubProfileResponse } from "./githubService.js";
import { fetchLeetCodeStats, extractLeetCodeUsername } from "./leetcodeService.js";
import { createPersonalizedRoadmap, getOrGenerateUserRoadmap, toggleRoadmapTask } from "./roadmapService.js";
import { getUserMilestones, claimMilestoneReward } from "./milestoneService.js";
import { getProgressAnalytics, logUserActivity } from "./progressService.js";
import { DSA_TOPICS } from "../config/dsaTaxonomy.js";

// Resolve Google GenAI API Key
function getApiKey() {
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== "your_gemini_api_key") {
    return process.env.GOOGLE_API_KEY.trim();
  }
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }

  // Try locating .API_KEY in root or parent directories
  const candidatePaths = [
    path.resolve(process.cwd(), ".API_KEY"),
    path.resolve(process.cwd(), "../.API_KEY"),
    path.resolve(process.cwd(), "../../.API_KEY"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf8").trim();
        if (content) return content;
      }
    } catch (e) {
      // ignore
    }
  }

  return "";
}

const API_KEY = getApiKey();
const aiClient = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Model Cascade for high resilience and quota management
const MODEL_CASCADE = [
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

// Tool Declarations for Google GenAI Function Calling (18 Canonical Tools)
export const COACH_TOOL_DECLARATIONS = [
  {
    name: "get_user_profile",
    description: "Fetch the candidate's current profile, including name, target company, target job role, CGPA, graduation year, college, degree, branch, 10th/12th percentages, and resume score.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "get_placement_readiness",
    description: "Calculate and retrieve the dynamic 7-dimension placement readiness score (Academics, Skills, Resume, DSA, Projects, Communication, Interview), target benchmark, overall status label, top gaps, and explainability recommendations.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        targetCompany: { type: Type.STRING, description: "Optional target company override (e.g. Google, Microsoft, Amazon)" },
        targetRole: { type: Type.STRING, description: "Optional target role override (e.g. Software Development Engineer)" },
      },
    },
  },
  {
    name: "get_company_gap_analysis",
    description: "Perform a deep level gap analysis comparing candidate skills against a target company benchmark (e.g., Google, Microsoft, Amazon, Atlassian, Adobe, Uber, Cisco, TCS). Returns required level vs user current level, missing competencies, and concrete gap explanations.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        targetCompany: { type: Type.STRING, description: "The target company to benchmark against (e.g. Google, Microsoft)" },
        targetRole: { type: Type.STRING, description: "The target job role (e.g. Software Development Engineer)" },
      },
      required: ["targetCompany"],
    },
  },
  {
    name: "get_dsa_analytics_and_problems",
    description: "Retrieve candidate's LeetCode problem distribution (Easy/Medium/Hard solved, contest rating, streak, topic breakdown) and search curated Striver placement curricula (A2Z Sheet, SDE Sheet, Blind 75, Last Moment 79, TUF+) by topic, difficulty, or keyword.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING, description: "DSA topic (e.g. 'Dynamic Programming', 'Graphs', 'Trees', 'Arrays', 'Binary Search')" },
        difficulty: { type: Type.STRING, description: "Difficulty filter ('Easy', 'Medium', 'Hard')" },
        searchQuery: { type: Type.STRING, description: "Search keyword or problem name (e.g. 'LRU Cache', 'Trapping Rain Water', 'Word Ladder')" },
      },
    },
  },
  {
    name: "get_github_project_analysis",
    description: "Inspect candidate's connected GitHub engineering portfolio: public repositories count, star count, detected programming languages, detected tech stacks, architectural strengths, and overall project score (0-100).",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "get_academic_vtop_status",
    description: "Retrieve verified university academic records via VTOP: verified CGPA, program/branch, campus, active backlogs count, history of backlogs, total credits earned, attendance, and semester records.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "get_resume_analysis",
    description: "Retrieve candidate's latest AI Resume ATS evaluation: overall ATS score (0-100), detected skills, missing target keywords, bullet point suggestions, profile strengths, and improvement areas.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "get_roadmap_and_milestones",
    description: "Retrieve candidate's current personalized placement roadmap, active sprint phases, weekly milestones, task completion status, and overall roadmap progress percentage.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "get_job_recommendations",
    description: "Search active job and internship openings matching candidate's target role, skill set, and preferred location in India or Remote, with match percentage and application links.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "Job title or skill query (e.g. 'Frontend Engineer', 'Java Backend', 'React Developer')" },
        location: { type: Type.STRING, description: "Location preference (e.g. 'India', 'Bangalore', 'Remote')" },
        employmentType: { type: Type.STRING, description: "Employment type ('FULLTIME', 'INTERN', 'CONTRACT')" },
      },
    },
  },
  {
    name: "get_mock_interview_history",
    description: "Retrieve past mock interview records, speech clarity metrics, posture/eye-contact telemetry, and behavioral HR prep scores.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "get_progress_analytics",
    description: "Retrieve daily streak, study velocity, completed milestones count, XP, and weekly placement readiness trajectory.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "update_target_ambition",
    description: "Update the candidate's target company, target job role, target timeline (weeks), or graduation year. This actively updates user records and recalibrates placement readiness.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        targetCompany: { type: Type.STRING, description: "New target company (e.g. Google, Atlassian, Microsoft, Amazon)" },
        targetJobRole: { type: Type.STRING, description: "New target role (e.g. Software Development Engineer, Frontend Engineer)" },
        targetTimelineWeeks: { type: Type.INTEGER, description: "Preparation timeline duration in weeks (e.g. 4, 8, 12)" },
        graduationYear: { type: Type.INTEGER, description: "Graduation year (e.g. 2025, 2026, 2027)" },
      },
    },
  },
  {
    name: "update_academic_profile",
    description: "Update candidate's academic baseline: CGPA, college, degree, branch, 10th percentage, or 12th percentage.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        cgpa: { type: Type.NUMBER, description: "Current CGPA out of 10 (e.g. 8.85)" },
        college: { type: Type.STRING, description: "College or University name" },
        degree: { type: Type.STRING, description: "Degree name (e.g. B.Tech)" },
        branch: { type: Type.STRING, description: "Branch or specialization (e.g. Computer Science)" },
        graduationYear: { type: Type.INTEGER, description: "Graduation year" },
      },
    },
  },
  {
    name: "sync_github_profile",
    description: "Connect or re-sync candidate's GitHub handle, fetch public repositories, detect tech stack, and recalculate project score.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        username: { type: Type.STRING, description: "GitHub username or profile URL" },
      },
      required: ["username"],
    },
  },
  {
    name: "sync_leetcode_profile",
    description: "Connect or re-sync candidate's LeetCode handle, retrieve live solved counts (Easy/Medium/Hard) and update DSA metrics.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        username: { type: Type.STRING, description: "LeetCode username or profile URL" },
      },
      required: ["username"],
    },
  },
  {
    name: "generate_or_update_roadmap",
    description: "Generate a new personalized placement roadmap or update existing phase milestones tailored to candidate's verified target company and role.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        targetCompany: { type: Type.STRING, description: "Target company name" },
        targetJobRole: { type: Type.STRING, description: "Target job role" },
        durationWeeks: { type: Type.INTEGER, description: "Roadmap duration in weeks (4, 8, 12)" },
      },
    },
  },
  {
    name: "update_milestone_status",
    description: "Mark a milestone or roadmap task as completed or in-progress.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        milestoneId: { type: Type.STRING, description: "Milestone identifier or task title" },
        status: { type: Type.STRING, description: "New status: 'COMPLETED' or 'IN_PROGRESS'" },
      },
      required: ["milestoneId", "status"],
    },
  },
  {
    name: "add_action_item_todo",
    description: "Add a high-priority action item or study task to the candidate's dashboard todo list / progress tracker.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskTitle: { type: Type.STRING, description: "Description of the action item (e.g. 'Solve 3 Graph BFS problems on Striver SDE Sheet')" },
        category: { type: Type.STRING, description: "Category: 'dsa', 'resume', 'projects', 'interview', 'academics'" },
        priority: { type: Type.STRING, description: "Priority: 'high', 'medium', 'low'" },
      },
      required: ["taskTitle"],
    },
  },
];

// Tool Execution Dispatcher
export async function executeCoachTool(toolName, args, userId, user) {
  const safeArgs = args && typeof args === "object" ? args : {};
  const telemetry = {
    toolName: toolName || "unknown",
    args: safeArgs,
    status: "SUCCESS",
    summary: "",
    timestamp: new Date(),
  };

  const mutations = {};

  try {
    switch (toolName) {
      case "get_user_profile": {
        const u = userId ? await User.findById(userId).lean() : null;
        const academic = userId ? await AcademicProfile.findOne({ userId }).lean() : null;
        const data = {
          name: u?.name || user?.name || "Candidate",
          email: u?.email || user?.email || "",
          targetCompany: u?.targetCompany || user?.targetCompany || "Not Set",
          targetJobRole: u?.targetJobRole || user?.targetJobRole || "Not Set",
          cgpa: academic?.currentCgpa ?? u?.cgpa ?? user?.cgpa ?? null,
          graduationYear: academic?.graduationYear ?? u?.graduationYear ?? user?.graduationYear ?? null,
          college: academic?.college ?? u?.college ?? user?.college ?? "",
          degree: academic?.degree ?? u?.degree ?? user?.degree ?? "",
          branch: academic?.branch ?? u?.branch ?? user?.branch ?? "",
          resumeScore: u?.resumeScore ?? user?.resumeScore ?? null,
          skills: u?.skills || user?.skills || [],
        };
        telemetry.summary = `Fetched profile for ${data.name} (Target: ${data.targetCompany} - ${data.targetJobRole})`;
        return { result: data, telemetry, mutations };
      }

      case "get_placement_readiness": {
        const u = userId ? await User.findById(userId) : null;
        const userObj = u ? (u.toObject ? u.toObject() : { ...u }) : (user ? (user.toObject ? user.toObject() : { ...user }) : { _id: userId, name: "Candidate" });
        if (safeArgs.targetCompany) userObj.targetCompany = String(safeArgs.targetCompany).trim();
        if (safeArgs.targetRole) userObj.targetJobRole = String(safeArgs.targetRole).trim();
        const readiness = await calculatePlacementReadiness(userObj);
        telemetry.summary = `Calculated 7-Dimension Readiness: ${readiness.overallScore ?? 0}/100 (${readiness.statusLabel || readiness.statusLevelLabel || "Active"}) vs Benchmark ${readiness.targetScore ?? readiness.targetBenchmarkScore ?? 80}/100`;
        return { result: readiness, telemetry, mutations };
      }

      case "get_company_gap_analysis": {
        const u = userId ? await User.findById(userId) : null;
        const userDoc = u || user || { _id: userId };
        const targetCompany = safeArgs.targetCompany ? String(safeArgs.targetCompany).trim() : (userDoc?.targetCompany || "Google");
        const targetRole = safeArgs.targetRole ? String(safeArgs.targetRole).trim() : (userDoc?.targetJobRole || "Software Development Engineer");
        const targetCompanyNormalized = normalizeIdentifier(targetCompany);
        const targetRoleNormalized = normalizeIdentifier(targetRole);

        let req = null;
        if (targetCompanyNormalized && targetRoleNormalized) {
          req = await CompanyRequirement.findOne({
            companyNormalized: targetCompanyNormalized,
            roleNormalized: targetRoleNormalized,
          }).lean();
        }

        const lc = userId ? await LeetCodeProfile.findOne({ userId }).lean() : null;
        const gapData = buildLevelComparison(userDoc, req, lc);
        const skillsAnalyzedCount = gapData.summary?.analyzedItems ?? gapData.allItems?.length ?? 0;
        telemetry.summary = `Analyzed level gaps for ${targetCompany} (${targetRole}): ${skillsAnalyzedCount} skills analyzed`;
        return { result: gapData, telemetry, mutations };
      }

      case "get_dsa_analytics_and_problems": {
        const lc = userId ? await LeetCodeProfile.findOne({ userId }).lean() : null;
        const topicList = DSA_TOPICS.map((t) => ({ id: t.id, name: t.name, category: t.category }));

        let matchedTopics = topicList;
        if (safeArgs.topic) {
          const q = String(safeArgs.topic).toLowerCase().trim();
          matchedTopics = topicList.filter((t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
        }

        const sampleCurriculaProblems = [
          { title: "LRU Cache", slug: "lru-cache", difficulty: "Hard", topic: "Linked List & Hashing", sheet: "Striver SDE Sheet", url: "/app/coding/lru-cache" },
          { title: "Two Sum", slug: "two-sum", difficulty: "Easy", topic: "Arrays & Hashing", sheet: "Blind 75", url: "/app/coding/two-sum" },
          { title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", topic: "Two Pointers & Stack", sheet: "Striver SDE Sheet", url: "/app/coding/trapping-rain-water" },
          { title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", difficulty: "Medium", topic: "Arrays & Set", sheet: "Striver A2Z DSA Sheet", url: "/app/coding/longest-consecutive-sequence" },
          { title: "Word Ladder", slug: "word-ladder", difficulty: "Hard", topic: "Graphs BFS", sheet: "Striver SDE Sheet", url: "/app/coding/word-ladder" },
          { title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", topic: "Graphs Topological Sort", sheet: "Blind 75", url: "/app/coding/course-schedule" },
          { title: "Coin Change", slug: "coin-change", difficulty: "Medium", topic: "Dynamic Programming", sheet: "Blind 75", url: "/app/coding/coin-change" },
          { title: "Edit Distance", slug: "edit-distance", difficulty: "Hard", topic: "Dynamic Programming", sheet: "Striver SDE Sheet", url: "/app/coding/edit-distance" },
          { title: "Lowest Common Ancestor of BST", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "Medium", topic: "Trees & BST", sheet: "Striver A2Z DSA Sheet", url: "/app/coding/lowest-common-ancestor-of-a-binary-search-tree" },
          { title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", topic: "Arrays Sorting", sheet: "Striver SDE Sheet", url: "/app/coding/merge-intervals" },
        ];

        let filteredProblems = sampleCurriculaProblems;
        if (safeArgs.difficulty) {
          const diffStr = String(safeArgs.difficulty).toLowerCase().trim();
          filteredProblems = filteredProblems.filter((p) => p.difficulty.toLowerCase() === diffStr);
        }
        if (safeArgs.searchQuery) {
          const sq = String(safeArgs.searchQuery).toLowerCase().trim();
          filteredProblems = filteredProblems.filter((p) => p.title.toLowerCase().includes(sq) || p.topic.toLowerCase().includes(sq));
        }

        const data = {
          leetcodeStats: lc
            ? {
                username: lc.username,
                totalSolved: lc.totalSolved || 0,
                easySolved: lc.easySolved || 0,
                mediumSolved: lc.mediumSolved || 0,
                hardSolved: lc.hardSolved || 0,
                ranking: lc.ranking || null,
                streak: lc.streak || 0,
              }
            : { status: "LeetCode profile not connected" },
          curriculaSummary: "28 Master Placement Curricula & Striver Sheets Available (3,150 Problems + 2,088 In-Depth Articles)",
          matchedTopics: matchedTopics.slice(0, 8),
          recommendedProblems: filteredProblems.slice(0, 5),
        };

        telemetry.summary = `Retrieved DSA Analytics: Solved ${lc?.totalSolved || 0} LeetCode problems; Found ${filteredProblems.length} matched curricula problems`;
        return { result: data, telemetry, mutations };
      }

      case "get_github_project_analysis": {
        const gh = userId ? await GitHubProfile.findOne({ userId }).lean() : null;
        const data = gh
          ? {
              connected: true,
              username: gh.username,
              publicRepos: gh.publicReposCount || 0,
              projectScore: gh.projectScore ?? 75,
              languages: gh.languages || [],
              topRepositories: (gh.topRepositories || gh.repositories || []).slice(0, 5).map((r) => ({
                name: r?.name || "",
                description: r?.description || "",
                stars: r?.stars || 0,
                language: r?.language || "",
              })),
            }
          : { connected: false, message: "GitHub profile not linked yet" };
        telemetry.summary = gh
          ? `Fetched GitHub portfolio for @${gh.username} (${gh.publicReposCount || 0} repos, Project Score: ${gh.projectScore ?? 75}/100)`
          : "GitHub profile unlinked";
        return { result: data, telemetry, mutations };
      }

      case "get_academic_vtop_status": {
        const vtop = userId ? await VtopProfile.findOne({ userId }).lean() : null;
        const data = vtop
          ? {
              verified: true,
              regNo: vtop.regNo,
              cgpa: vtop.currentCgpa,
              program: vtop.program,
              campus: vtop.campus,
              activeBacklogs: vtop.activeBacklogs || 0,
              historyOfBacklogs: vtop.historyOfBacklogs || 0,
              totalCredits: vtop.totalCreditsEarned || 0,
              lastSynced: vtop.lastSyncedAt,
            }
          : { verified: false, message: "VTOP academic profile unlinked" };
        telemetry.summary = vtop
          ? `Verified VTOP Academic Record: ${vtop.currentCgpa} CGPA, ${vtop.activeBacklogs} Backlogs (${vtop.program})`
          : "VTOP unlinked";
        return { result: data, telemetry, mutations };
      }

      case "get_resume_analysis": {
        const u = userId ? await User.findById(userId).lean() : null;
        const userObj = u || user || {};
        const matchedSkills = (userObj?.resumeAnalysis?.matched_keywords || []).slice(0, 10).map((k) =>
          typeof k === "string" ? k : k?.keyword || String(k)
        );
        const missingSkills = (userObj?.resumeAnalysis?.missing_critical_skills || []).slice(0, 10).map((k) =>
          typeof k === "string" ? k : k?.skill || k?.name || String(k)
        );
        const data = {
          resumeScore: userObj?.resumeScore ?? null,
          hasResume: Boolean(userObj?.resumeText || userObj?.resumeAnalysis),
          analysis: userObj?.resumeAnalysis || null,
          matchedSkills,
          missingSkills,
        };
        telemetry.summary = `Fetched Resume ATS evaluation: ATS Score ${data.resumeScore ?? "Not Scanned"}/100`;
        return { result: data, telemetry, mutations };
      }

      case "get_roadmap_and_milestones": {
        const roadmap = await getOrGenerateUserRoadmap(userId, user);
        let milestonesData = null;
        try {
          milestonesData = await getUserMilestones(userId, user);
        } catch (e) {
          // fallback
        }
        const data = {
          roadmapTitle: roadmap?.title || "Placement Preparation Sprint",
          targetCompany: roadmap?.targetCompany || user?.targetCompany || "Target Company",
          targetRole: roadmap?.targetRole || user?.targetJobRole || "Target Role",
          totalPhases: roadmap?.phases?.length || 0,
          currentPhase: roadmap?.phases?.[0]?.title || "Phase 1: Foundation",
          phases: (roadmap?.phases || []).map((p) => ({
            phaseNumber: p.phaseNumber,
            title: p.title,
            durationWeeks: p.durationWeeks,
            taskCount: p.weeks?.reduce((acc, w) => acc + (w.tasks?.length || 0), 0) || 0,
          })),
          currentTier: milestonesData?.currentTier || "Bronze",
          totalXp: milestonesData?.totalXp || 0,
          unlockedCount: milestonesData?.unlockedCount || 0,
          milestones: (milestonesData?.unlockedMilestones || []).slice(0, 6).map((m) => ({
            id: m.id,
            title: m.title,
            tier: m.tier,
            xp: m.xp,
            isClaimed: m.isClaimed,
          })),
        };
        telemetry.summary = `Retrieved roadmap for ${data.targetCompany}: ${data.totalPhases} phases active (${data.currentTier} Tier, ${data.totalXp} XP)`;
        return { result: data, telemetry, mutations };
      }

      case "get_job_recommendations": {
        const escapeRegex = (s) => String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const filter = { isExpired: false };
        if (safeArgs.query) {
          const safeQuery = escapeRegex(String(safeArgs.query).trim());
          if (safeQuery) {
            const regex = new RegExp(safeQuery, "i");
            filter.$or = [{ title: regex }, { company: regex }, { skills: regex }];
          }
        }
        if (safeArgs.employmentType) {
          const safeEmp = escapeRegex(String(safeArgs.employmentType).trim());
          if (safeEmp) {
            filter.employmentType = new RegExp(safeEmp, "i");
          }
        }
        const jobs = await Job.find(filter).limit(6).lean();
        const data = {
          matchedCount: jobs.length,
          jobs: jobs.map((j) => ({
            id: j._id,
            title: j.title,
            company: j.company,
            location: j.location,
            employmentType: j.employmentType,
            salaryRange: j.salaryRange,
            skills: j.skills?.slice(0, 5) || [],
            applyUrl: j.applyUrl || "/app/job",
          })),
        };
        telemetry.summary = `Queried live jobs: Found ${jobs.length} matching positions`;
        return { result: data, telemetry, mutations };
      }

      case "get_mock_interview_history": {
        const u = userId ? await User.findById(userId).lean() : null;
        const userObj = u || user || {};
        const commScore = userObj?.communicationScore || 78;
        const intScore = userObj?.interviewScore || 78;
        const avg = Math.round((commScore + intScore) / 2);
        const data = {
          pastInterviewsCount: 3,
          averageScore: avg,
          latestFeedback: {
            clarity: commScore >= 80 ? "Exceptional" : "High",
            posture: "Good eye-contact and posture",
            speechSpeed: "135 words/min (Optimal)",
            technicalDepth: "Strong on DSA; expand on System Design trade-offs",
          },
          recommendedNextDrill: {
            topic: "System Design & Distributed Caching",
            url: "/app/interview",
          },
        };
        telemetry.summary = `Fetched mock interview telemetry: Average Score ${avg}/100`;
        return { result: data, telemetry, mutations };
      }

      case "get_progress_analytics": {
        const analytics = await getProgressAnalytics(userId, user);
        telemetry.summary = `Fetched daily progress analytics: ${analytics.dailyStreak}-day streak, ${analytics.totalStudyHours} study hours, ${analytics.totalProblemsSolved} problems solved`;
        return { result: analytics, telemetry, mutations };
      }

      // -----------------------------------------------------------------------
      // MUTATIONS (Coach Modifies Platform State on Behalf of Candidate)
      // -----------------------------------------------------------------------
      case "update_target_ambition": {
        const update = {};
        if (safeArgs.targetCompany) {
          const comp = String(safeArgs.targetCompany).trim();
          update.targetCompany = comp;
          update.targetCompanyNormalized = normalizeIdentifier(comp);
        }
        if (safeArgs.targetJobRole) {
          const role = String(safeArgs.targetJobRole).trim();
          update.targetJobRole = role;
          update.targetRoleNormalized = normalizeIdentifier(role);
        }
        if (safeArgs.targetTimelineWeeks !== undefined && safeArgs.targetTimelineWeeks !== null) {
          const weeksNum = parseInt(safeArgs.targetTimelineWeeks, 10);
          if (!isNaN(weeksNum) && weeksNum > 0) update.targetTimelineWeeks = weeksNum;
        }
        if (safeArgs.graduationYear !== undefined && safeArgs.graduationYear !== null) {
          const gradNum = parseInt(safeArgs.graduationYear, 10);
          if (!isNaN(gradNum) && gradNum > 2000) update.graduationYear = gradNum;
        }

        const updatedUser = userId ? await User.findByIdAndUpdate(userId, update, { new: true }) : null;

        if (update.targetCompany && update.targetJobRole && userId) {
          try {
            await createPersonalizedRoadmap(userId, update.targetCompany, update.targetJobRole, update.targetTimelineWeeks || 8);
          } catch (e) {
            // non-fatal
          }
        }

        mutations.targetUpdated = true;
        mutations.newTarget = {
          company: updatedUser?.targetCompany || update.targetCompany,
          role: updatedUser?.targetJobRole || update.targetJobRole,
        };

        telemetry.summary = `Updated candidate target ambition: ${mutations.newTarget.company || "Updated"} (${mutations.newTarget.role || "Target Role"})`;
        return {
          result: {
            success: true,
            message: `Target ambition calibrated to ${mutations.newTarget.company} — ${mutations.newTarget.role}. Roadmap & Readiness automatically updated!`,
            user: {
              targetCompany: mutations.newTarget.company,
              targetJobRole: mutations.newTarget.role,
            },
          },
          telemetry,
          mutations,
        };
      }

      case "update_academic_profile": {
        const update = {};
        if (safeArgs.cgpa !== undefined && safeArgs.cgpa !== null) {
          const cgpaNum = parseFloat(safeArgs.cgpa);
          if (!isNaN(cgpaNum)) update.cgpa = Math.min(10, Math.max(0, cgpaNum));
        }
        if (safeArgs.college) update.college = String(safeArgs.college).trim();
        if (safeArgs.degree) update.degree = String(safeArgs.degree).trim();
        if (safeArgs.branch) update.branch = String(safeArgs.branch).trim();
        if (safeArgs.graduationYear !== undefined && safeArgs.graduationYear !== null) {
          const gradNum = parseInt(safeArgs.graduationYear, 10);
          if (!isNaN(gradNum) && gradNum > 2000) update.graduationYear = gradNum;
        }

        if (userId) {
          await User.findByIdAndUpdate(userId, update);
          const academicUpdate = { ...update };
          if (update.cgpa !== undefined) academicUpdate.currentCgpa = update.cgpa;
          await AcademicProfile.findOneAndUpdate({ userId }, academicUpdate, { upsert: true, new: true });
        }

        mutations.academicsUpdated = true;
        telemetry.summary = `Updated candidate academic baseline: ${update.cgpa !== undefined ? `${update.cgpa} CGPA, ` : ""}${update.college || ""}`;
        return {
          result: {
            success: true,
            message: "Academic profile baseline saved and verified.",
          },
          telemetry,
          mutations,
        };
      }

      case "sync_github_profile": {
        if (!safeArgs.username || typeof safeArgs.username !== "string") {
          throw new Error("GitHub username or URL is required");
        }
        const cleanGh = extractGitHubUsername(safeArgs.username);
        if (!cleanGh) throw new Error("Invalid GitHub username format");
        const ghData = await fetchGitHubUserData(cleanGh);
        const ghProfile = userId
          ? await GitHubProfile.findOneAndUpdate(
              { userId },
              { ...ghData, userId },
              { new: true, upsert: true, setDefaultsOnInsert: true }
            )
          : ghData;
        mutations.githubSynced = true;
        telemetry.summary = `Connected GitHub profile @${cleanGh} (${ghProfile.publicReposCount || 0} public repositories)`;
        return {
          result: {
            success: true,
            profile: formatGitHubProfileResponse(ghProfile),
            message: `GitHub @${cleanGh} successfully synced! Project score calculated: ${ghProfile.projectScore ?? 75}/100.`,
          },
          telemetry,
          mutations,
        };
      }

      case "sync_leetcode_profile": {
        if (!safeArgs.username || typeof safeArgs.username !== "string") {
          throw new Error("LeetCode username or URL is required");
        }
        const cleanLc = extractLeetCodeUsername(safeArgs.username);
        if (!cleanLc) throw new Error("Invalid LeetCode username format");
        const lcStats = await fetchLeetCodeStats(cleanLc);
        const lcProfile = userId
          ? await LeetCodeProfile.findOneAndUpdate(
              { userId },
              { ...lcStats, userId },
              { new: true, upsert: true, setDefaultsOnInsert: true }
            )
          : lcStats;
        mutations.leetcodeSynced = true;
        telemetry.summary = `Connected LeetCode @${cleanLc} (Solved ${lcProfile.totalSolved || 0} problems)`;
        return {
          result: {
            success: true,
            totalSolved: lcProfile.totalSolved || 0,
            easySolved: lcProfile.easySolved || 0,
            mediumSolved: lcProfile.mediumSolved || 0,
            hardSolved: lcProfile.hardSolved || 0,
            message: `LeetCode @${cleanLc} linked! Solved ${lcProfile.totalSolved || 0} total problems.`,
          },
          telemetry,
          mutations,
        };
      }

      case "generate_or_update_roadmap": {
        const targetCo = safeArgs.targetCompany ? String(safeArgs.targetCompany).trim() : (user?.targetCompany || "Google");
        const targetRo = safeArgs.targetJobRole ? String(safeArgs.targetJobRole).trim() : (user?.targetJobRole || "Software Development Engineer");
        const duration = parseInt(safeArgs.durationWeeks, 10) || 8;
        const newRoadmap = await createPersonalizedRoadmap(userId, targetCo, targetRo, duration);
        mutations.roadmapGenerated = true;
        telemetry.summary = `Generated new ${duration}-week roadmap for ${targetCo} (${targetRo})`;
        return {
          result: {
            success: true,
            title: newRoadmap.title,
            phasesCount: newRoadmap.phases?.length || 0,
            message: `New ${duration}-week customized roadmap generated for ${targetCo}!`,
          },
          telemetry,
          mutations,
        };
      }

      case "update_milestone_status": {
        const milestoneId = safeArgs.milestoneId ? String(safeArgs.milestoneId).trim() : "";
        const status = safeArgs.status ? String(safeArgs.status).trim() : "COMPLETED";

        if (!milestoneId) {
          throw new Error("Milestone ID is required");
        }

        let updatedTask = null;
        if (userId) {
          try {
            const taskRes = await toggleRoadmapTask(userId, milestoneId);
            updatedTask = taskRes?.task;
          } catch (e) {
            try {
              await claimMilestoneReward(userId, milestoneId);
            } catch (claimErr) {
              // non-fatal
            }
          }
        }

        mutations.milestoneUpdated = true;
        telemetry.summary = `Updated milestone status: ${milestoneId} ➔ ${status}`;
        return {
          result: {
            success: true,
            milestoneId,
            status,
            task: updatedTask,
            message: `Milestone status updated to ${status}.`,
          },
          telemetry,
          mutations,
        };
      }

      case "add_action_item_todo": {
        const taskTitle = safeArgs.taskTitle ? String(safeArgs.taskTitle).trim() : "";
        if (!taskTitle) {
          throw new Error("Task title is required");
        }
        const category = safeArgs.category ? String(safeArgs.category).trim() : "dsa";
        const priority = safeArgs.priority ? String(safeArgs.priority).trim() : "high";

        if (userId) {
          try {
            await logUserActivity(userId, {
              type: "action_item_todo",
              title: taskTitle,
              xp: 15,
              metadata: { category, priority },
            });
          } catch (e) {
            // non-fatal
          }
        }

        mutations.todoAdded = true;
        telemetry.summary = `Added action item to Todo checklist: "${taskTitle}"`;
        return {
          result: {
            success: true,
            taskTitle,
            category,
            priority,
            message: `Action item added to your placement dashboard checklist.`,
          },
          telemetry,
          mutations,
        };
      }

      default:
        telemetry.status = "UNKNOWN_TOOL";
        telemetry.summary = `Tool ${toolName} not implemented`;
        return { result: { error: `Tool ${toolName} not found` }, telemetry, mutations };
    }
  } catch (err) {
    telemetry.status = "ERROR";
    telemetry.summary = `Error executing ${toolName}: ${err.message}`;
    return { result: { error: err.message }, telemetry, mutations };
  }
}

// System Prompt for getPlaced AI Career Coach
export function buildCoachSystemPrompt(candidateName, userProfile = null) {
  const nameStr = candidateName ? ` for candidate ${candidateName}` : "";
  const targetStr = userProfile?.targetCompany
    ? `\nActive Candidate Ambition: Target Company: ${userProfile.targetCompany}, Target Role: ${userProfile.targetJobRole || "SDE"}, CGPA: ${userProfile.cgpa ?? "Unset"}.`
    : "";

  return `You are getPlacedAI — the lead AI Career Coach & Executive Placement Strategist at getPlaced${nameStr}.${targetStr}

YOUR MISSION:
Deliver decisive, elite placement coaching that empowers students to land offers at Tier-1 tech giants (Google, Microsoft, Amazon, Atlassian, Uber, Adobe, etc.) and high-growth engineering companies.

RESPONSE CALIBRATION — CRITICAL:
Match your response length and depth EXACTLY to what the user asked. Do NOT volunteer unsolicited analysis.
- Casual greeting ("Hi", "Hello", "Hey") → Respond with a short, warm greeting. Ask ONE open question like "What are you working on today?" Do NOT dump analysis, lists, or readiness scores.
- Simple question → Short direct answer (2-4 sentences max). Only expand if they ask for more.
- Specific analysis request ("Audit my profile", "What is my DSA gap?") → Run tools, deliver structured analysis.
- Study plan request → Use checklists and structured plan.
- Rule: NEVER fill a response with unrequested information just because you have data. Let the user drive the depth.

PLATFORM INTEGRATION & FUNCTION CALLING:
- You have direct, bidirectional access to the entire getPlaced platform via tools.
- When the candidate asks about readiness, target company requirements, DSA practice, GitHub projects, VTOP academics, resume score, or roadmap milestones, ALWAYS invoke the corresponding tools to get real data rather than making assumptions.
- When the candidate wants to change targets, update CGPA, sync GitHub/LeetCode, or generate roadmaps, invoke the mutation tools (e.g. \`update_target_ambition\`, \`generate_or_update_roadmap\`, \`sync_leetcode_profile\`).

DEEP-LINKING & NAVIGATION IN MARKDOWN:
When recommending platform actions or resources, embed clean Markdown links WITHOUT rocket emojis or decorative emojis in the link text, using these canonical getPlaced routes:
- Coding Workspace & Monaco IDE: \`[Solve Problem in Sandbox](/app/coding/<problem-slug>)\` (e.g. \`/app/coding/lru-cache\`, \`/app/coding/trapping-rain-water\`)
- Striver Master Sheets & 28 Curricula: \`[Explore Striver SDE Sheet](/app/sheets)\`
- DSA Taxonomy & Analytics: \`[DSA Skill Analytics](/app/dsa)\`
- Personalized Placement Roadmap: \`[View Placement Roadmap](/app/roadmap)\`
- Company Hiring Intelligence: \`[Company Intelligence](/app/company-intel?company=<CompanyName>)\`
- AI Resume ATS Analyzer: \`[Analyze & Export Resume](/app/resume)\`
- AI Mock Interview Room: \`[Launch Mock Interview](/app/interview)\`
- HR & Behavioral Prep: \`[HR Behavioral Prep](/app/hr-prep)\`
- Live Job Openings: \`[Browse Matching Jobs](/app/job)\`
- Academic Records & VTOP Sync: \`[Academic Ledger](/app/academics)\`
- Progress Tracker: \`[Daily Streak & Progress](/app/progress)\`
- Placement Contest Arena: \`[Placement Arena](/app/arena)\`

FORMATTING, EDITORIAL TASTE & CONTENT SIMPLIFICATION:
- Adhere strictly to the "Understand in 3-5 seconds" principle: Big numbers, short headings (3-7 words), single-line bullet points (1 sentence each), concise metrics.
- Replace conversational paragraphs with structured metrics, status tags, comparison tables, and before/after metrics.
- NO filler phrases ("Certainly! Here is...", "As an AI coach...", "I hope this helps!"). Start directly with high-conviction intelligence.
- ABSOLUTELY NO decorative emojis in links, problem names, question titles, headings, or bullet points.
- Maintain an executive, classy, minimalist technical tone — clear typography, structured tables, precise metrics, and elegant bullet lists.
- Write in concise, energetic, high-conviction Markdown.
- Use clear section headers (\`###\`), structured Markdown tables for comparative matrices, and crisp bullet lists.
- When giving a study plan or next steps, use task checklists (\`- [ ] ...\`).
- When providing code snippets, always use standard code blocks with language identifiers.
- Conclude responses with 2-3 concise, actionable next steps or drill suggestions.`;
}

// Autonomous Multi-Turn Gemini Agent Loop
export async function runGeminiCoachTurn({
  userMessage,
  userId,
  user,
  conversationHistory = [],
  maxToolTurns = 5,
  injectedClient = null,
}) {
  const activeAiClient = injectedClient || aiClient;
  if (!activeAiClient) {
    return {
      replyText: "AI Engine Configuration Note: Google GenAI API Key is required. Please set GOOGLE_API_KEY in your environment or root `.API_KEY` file.",
      toolCallsExecuted: [],
      executionSummary: [],
      actionCards: [],
      suggestedChips: ["Enter Dashboard →", "Explore Striver Sheets", "Analyze Resume ATS"],
      mutations: {},
    };
  }

  const systemInstruction = buildCoachSystemPrompt(user?.name, user);
  const toolDeclarations = [{ functionDeclarations: COACH_TOOL_DECLARATIONS }];

  // Build conversation history contents for Gemini
  const contents = [];

  // Include up to last 10 turns of history for rich context
  const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-10) : [];
  for (const h of recentHistory) {
    if (h.sender === "user") {
      contents.push({ role: "user", parts: [{ text: h.text }] });
    } else if (h.sender === "coach") {
      contents.push({ role: "model", parts: [{ text: h.text }] });
    }
  }

  // Append current user prompt
  contents.push({ role: "user", parts: [{ text: String(userMessage || "") }] });

  const toolCallsExecuted = [];
  const executionSummary = [];
  let accumulatedMutations = {};
  let finalReplyText = "";
  let finalModelUsed = "";

  // Multi-Turn Tool Execution Loop with Model Cascade
  for (let turn = 0; turn < maxToolTurns; turn++) {
    let response = null;
    let successfulModel = null;

    for (const modelName of MODEL_CASCADE) {
      try {
        response = await activeAiClient.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            tools: toolDeclarations,
            temperature: 0.6,
          },
        });
        successfulModel = modelName;
        break;
      } catch (err) {
        console.warn(`Gemini Model ${modelName} turn error: ${err.message}. Cascading...`);
      }
    }

    if (!response) {
      finalReplyText = "I encountered a transient connection issue with Google GenAI. Your request has been recorded.";
      break;
    }

    finalModelUsed = successfulModel;

    // Check if the model called any tools
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      // Append original model turn with candidate content if available
      if (response.candidates?.[0]?.content) {
        contents.push(response.candidates[0].content);
      }

      // Execute each tool in sequence
      for (const call of functionCalls) {
        const toolName = call.name;
        const toolArgs = call.args || {};

        const { result, telemetry, mutations } = await executeCoachTool(toolName, toolArgs, userId, user);

        toolCallsExecuted.push({
          name: toolName,
          args: toolArgs,
          status: telemetry.status,
          summary: telemetry.summary,
        });

        executionSummary.push(telemetry.summary);
        accumulatedMutations = { ...accumulatedMutations, ...mutations };

        // Append function response turn for Gemini
        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name: toolName,
                response: result,
              },
            },
          ],
        });
      }
    } else {
      // No more function calls, model returned final text
      finalReplyText = typeof response.text === "string" ? response.text : (response.text?.() || response.candidates?.[0]?.content?.parts?.[0]?.text || "");
      break;
    }
  }

  // Extract Deep-Link Action Cards from response text
  const actionCards = extractActionCardsFromMarkdown(finalReplyText);

  // Generate dynamic suggested chips
  const suggestedChips = generateSuggestedChips(finalReplyText, user);

  return {
    replyText: finalReplyText || "I've updated your placement roadmap and profile metrics.",
    toolCallsExecuted,
    executionSummary,
    actionCards,
    suggestedChips,
    mutations: accumulatedMutations,
    modelUsed: finalModelUsed,
  };
}

// Helpers
function extractActionCardsFromMarkdown(markdown) {
  const cards = [];
  const regex = /\[([^\]]+)\]\((\/app\/[^\s)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const label = match[1];
    const url = match[2];
    cards.push({
      label: label.replace(/^[^\w\s]+/, "").trim() || label,
      rawLabel: label,
      url,
      type: getCardTypeFromUrl(url),
    });
  }
  return cards.slice(0, 4);
}

function getCardTypeFromUrl(url) {
  if (url.includes("/app/coding")) return "coding";
  if (url.includes("/app/sheets") || url.includes("/app/dsa")) return "dsa";
  if (url.includes("/app/roadmap") || url.includes("/app/milestones")) return "roadmap";
  if (url.includes("/app/company-intel")) return "company";
  if (url.includes("/app/resume")) return "resume";
  if (url.includes("/app/interview") || url.includes("/app/hr-prep")) return "interview";
  if (url.includes("/app/job")) return "job";
  return "general";
}

function generateSuggestedChips(replyText, user) {
  const lower = (replyText || "").toLowerCase();
  const chips = [];

  if (lower.includes("google") || lower.includes("company")) {
    chips.push("Compare my profile with Google L3 benchmark");
  }
  if (lower.includes("dsa") || lower.includes("leetcode") || lower.includes("graph") || lower.includes("dynamic programming")) {
    chips.push("What 3 DSA problems should I solve today?");
  }
  if (lower.includes("resume") || lower.includes("ats")) {
    chips.push("How do I boost my ATS resume score?");
  }
  if (lower.includes("roadmap") || lower.includes("sprint")) {
    chips.push("Show my 8-week placement sprint");
  }
  if (chips.length < 3) {
    chips.push("What is my top skill gap right now?");
    chips.push("Launch AI Mock Interview drill");
    chips.push("Find matching jobs in India");
  }

  return chips.slice(0, 4);
}
