import mongoose from "mongoose";
import CoachConversation from "../models/coachConversationModel.js";
import User from "../models/userModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import GitHubProfile from "../models/githubProfileModel.js";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import VtopProfile from "../models/vtopProfileModel.js";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";
import { createPersonalizedRoadmap } from "./roadmapService.js";
import { calculatePlacementReadiness } from "./readinessService.js";
import { buildLevelComparison } from "./levelGapService.js";
import { fetchGitHubUserData, extractGitHubUsername, formatGitHubProfileResponse } from "./githubService.js";
import { authenticateAndScrapeVtop } from "./vtopLiveAuthService.js";
import { runGeminiCoachTurn } from "./geminiCoachEngine.js";
import {
  isSupportedCompany,
  normalizeCompanyName,
  normalizeRoleName,
  CURATED_COMPANIES,
  CURATED_COMPANY_NAMES,
} from "../data/curatedCompanies.js";

export function computeDynamicOnboardingState(session, user = null) {
  if (!session) return { onboardingStep: 1, profileCompletion: 15, isCompleted: false, onboardingStatus: "IN_PROGRESS" };

  if (session.isCompleted || session.onboardingStatus === "COMPLETED") {
    session.onboardingStep = 6;
    session.profileCompletion = 100;
    session.isCompleted = true;
    session.onboardingStatus = "COMPLETED";
    return {
      onboardingStep: 6,
      profileCompletion: 100,
      isCompleted: true,
      onboardingStatus: "COMPLETED",
    };
  }

  const collected = session.collectedData || {};
  const extracted = session.extractedProfile || {};
  const connected = session.connectedProfiles || {};

  const hasTarget = Boolean(
    (extracted.targetCompany && extracted.targetCompany.trim()) ||
    (extracted.targetJobRole && extracted.targetJobRole.trim()) ||
    (collected.targetCompany && collected.targetCompany.trim()) ||
    (collected.targetJobRole && collected.targetJobRole.trim()) ||
    (user?.targetCompany && user?.targetCompany.trim()) ||
    (user?.targetJobRole && user?.targetJobRole.trim())
  );

  const hasAcademics = Boolean(
    (extracted.cgpa !== null && extracted.cgpa !== undefined && extracted.cgpa !== "") ||
    (collected.cgpa !== null && collected.cgpa !== undefined && collected.cgpa !== "") ||
    connected.vtop?.connected ||
    (extracted.college && extracted.college.trim()) ||
    (collected.college && collected.college.trim()) ||
    user?.cgpa ||
    user?.college
  );

  const hasGithub = Boolean(
    connected.github?.connected ||
    (extracted.githubUsername && extracted.githubUsername.trim()) ||
    (collected.githubUsername && collected.githubUsername.trim())
  );

  const hasLeetcode = Boolean(
    connected.leetcode?.connected ||
    (extracted.leetcodeUsername && extracted.leetcodeUsername.trim()) ||
    (collected.leetcodeUsername && collected.leetcodeUsername.trim())
  );

  const hasSkillsOrResume = Boolean(
    connected.resume?.provided ||
    (extracted.resumeScore !== undefined && extracted.resumeScore !== null) ||
    (extracted.primarySkills && extracted.primarySkills.length > 0) ||
    (session.evidenceSkills && session.evidenceSkills.length > 0) ||
    (user?.resumeScore !== undefined && user?.resumeScore !== null)
  );

  // Dynamic step from candidate data completeness:
  // Step 1: Target Ambition
  // Step 2: Academics (Target completed -> at Step 2)
  // Step 3: GitHub Proof (Academics completed -> at Step 3)
  // Step 4: LeetCode DSA (GitHub completed -> at Step 4)
  // Step 5: Skills Calibration (LeetCode completed -> at Step 5)
  // Step 6: Report & Synthesis (Skills calibration completed -> Step 6)
  let calculatedStep = 1;
  if (hasTarget) calculatedStep = 2;
  if (hasTarget && hasAcademics) calculatedStep = 3;
  if (hasTarget && hasAcademics && hasGithub) calculatedStep = 4;
  if (hasTarget && hasAcademics && hasGithub && hasLeetcode) calculatedStep = 5;
  if (hasTarget && hasAcademics && hasGithub && hasLeetcode && hasSkillsOrResume) calculatedStep = 6;

  const finalStep = Math.max(session.onboardingStep || 1, calculatedStep);
  const isCompleted = finalStep >= 6;
  const onboardingStatus = isCompleted ? "COMPLETED" : "IN_PROGRESS";
  const profileCompletion = isCompleted
    ? 100
    : Math.min(95, Math.max(15, Math.round((finalStep / 6) * 100)));

  session.onboardingStep = finalStep;
  session.profileCompletion = profileCompletion;
  session.onboardingStatus = onboardingStatus;
  session.isCompleted = isCompleted;

  return { onboardingStep: finalStep, profileCompletion, isCompleted, onboardingStatus };
}

export async function getOrCreateCoachSession(userId, user = null, options = {}) {
  const mode = options.mode || null;
  let session = await CoachConversation.findOne({ userId });

  const userName = user?.name || "";
  const initialTarget = user?.targetCompany || "";
  const initialRole = user?.targetJobRole || "";
  const initialCgpa = user?.cgpa ?? null;
  const isOnboarding = mode === "onboarding" || (!user?.onboardingCompleted && mode !== "coach");

  const buildOnboardingGreeting = () => ({
    sender: "coach",
    text: `Hey${userName ? ` ${userName}` : ""}! Welcome to **getPlaced** 👋 I'm your AI Career Coach.\n\nLet's calibrate your placement profile and baseline so I can build your personalized roadmap and readiness score.\n\n### Step 1: Target Ambition 🎯\n**What is your dream target company and role?**\n*(e.g., Google — SDE, Microsoft — Software Engineer, Amazon — SDE-1, Atlassian — Full Stack)*\n\nYou can pick one below, type your own target, or skip to start with a general top-tier tech track!`,
    chips: [
      "Google — SDE",
      "Microsoft — Software Engineer",
      "Amazon — SDE-1",
      "Atlassian — Full Stack",
      "Skip target setup (General SDE)",
    ],
    timestamp: new Date(),
    metadata: {
      isGreeting: true,
      isOnboarding: true,
      step: 1,
    },
  });

  const buildCoachGreeting = () => ({
    sender: "coach",
    text: `Hey${userName ? ` ${userName}` : ""}, I'm **getPlacedAI**, your placement coach.\n\nWhat are you working on today?`,
    chips: [
      "Audit my profile for Google",
      "What DSA problems should I solve today?",
      "How do I boost my ATS resume score?",
      "Set target to Microsoft SDE",
    ],
    timestamp: new Date(),
    metadata: {
      isGreeting: true,
      isOnboarding: false,
    },
  });

  if (!session) {
    try {
      session = await CoachConversation.create({
        userId,
        onboardingStep: 1,
        onboardingStatus: isOnboarding ? "IN_PROGRESS" : "COMPLETED",
        isCompleted: !isOnboarding,
        profileCompletion: isOnboarding ? 15 : 100,
        collectedData: {
          name: userName,
          college: user?.college || "",
          degree: user?.degree || "",
          branch: user?.branch || "",
          graduationYear: user?.graduationYear ?? null,
          cgpa: initialCgpa,
          tenthPercentage: user?.tenthPercentage ?? null,
          twelfthPercentage: user?.twelfthPercentage ?? null,
          targetCompany: initialTarget,
          targetJobRole: initialRole,
          targetTimelineWeeks: user?.targetTimelineWeeks ?? null,
        },
        extractedProfile: {
          targetCompany: initialTarget,
          targetJobRole: initialRole,
          graduationYear: user?.graduationYear ?? null,
          college: user?.college || "",
          degree: user?.degree || "",
          branch: user?.branch || "",
          cgpa: initialCgpa,
          tenthPercentage: user?.tenthPercentage ?? null,
          twelfthPercentage: user?.twelfthPercentage ?? null,
          leetcodeUsername: "",
          githubUsername: "",
          primarySkills: [],
          targetTimelineWeeks: user?.targetTimelineWeeks ?? null,
        },
        messages: [isOnboarding ? buildOnboardingGreeting() : buildCoachGreeting()],
      });
    } catch (err) {
      if (err.code === 11000) {
        session = await CoachConversation.findOne({ userId });
      } else {
        throw err;
      }
    }
  } else {
    // If session exists but user is in onboarding flow and session only had old generic message
    if (isOnboarding) {
      const hasOnlyGenericGreeting =
        !session.messages ||
        session.messages.length === 0 ||
        (session.messages.length === 1 &&
          (session.messages[0].text.includes("Chat reset") ||
            session.messages[0].text.includes("What are you working on today") ||
            session.messages[0].text.includes("What would you like to work on today")));

      if (hasOnlyGenericGreeting) {
        session.messages = [buildOnboardingGreeting()];
        session.onboardingStep = 1;
        session.onboardingStatus = "IN_PROGRESS";
        session.isCompleted = false;
        session.profileCompletion = 15;
        await session.save();
      }
    }
  }

  if (!session) {
    session = await CoachConversation.findOne({ userId });
  }

  if (!session.connectedProfiles) session.connectedProfiles = {};
  if (!session.extractedProfile) session.extractedProfile = {};
  if (!session.collectedData) session.collectedData = {};

  // Check if user already had connected profiles in DB and populate session
  const [existingGh, existingLc, existingVtop] = await Promise.all([
    GitHubProfile.findOne({ userId }),
    LeetCodeProfile.findOne({ userId }),
    VtopProfile.findOne({ userId }),
  ]);

  if (existingGh && !session.connectedProfiles?.github?.connected) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    session.connectedProfiles.github = {
      connected: true,
      username: existingGh.username,
      publicRepos: existingGh.publicReposCount || 0,
      languages: existingGh.languages?.map((l) => l.languageName) || [],
      topRepos: existingGh.topRepositories?.map((r) => r.name) || [],
      projectScore: existingGh.projectScore ?? null,
    };
    session.extractedProfile.githubUsername = existingGh.username;
  }

  if (existingLc && !session.connectedProfiles?.leetcode?.connected) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    session.connectedProfiles.leetcode = {
      connected: true,
      username: existingLc.username,
      totalSolved: existingLc.totalSolved || 0,
      easySolved: existingLc.easySolved || 0,
      mediumSolved: existingLc.mediumSolved || 0,
      hardSolved: existingLc.hardSolved || 0,
      primaryLanguage: existingLc.primaryLanguage || "",
      ranking: existingLc.ranking ?? null,
      streak: existingLc.streak || 0,
    };
    session.extractedProfile.leetcodeUsername = existingLc.username;
  }

  if (existingVtop && !session.connectedProfiles?.vtop?.connected) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    session.connectedProfiles.vtop = {
      connected: true,
      regNo: existingVtop.regNo || "",
      cgpa: existingVtop.currentCgpa ?? null,
      branch: existingVtop.program || "",
      college: existingVtop.campus || "",
      activeBacklogs: existingVtop.activeBacklogs || 0,
      historyOfBacklogs: existingVtop.historyOfBacklogs || 0,
      creditsEarned: existingVtop.totalCreditsEarned || 0,
      lastSyncedAt: existingVtop.lastSyncedAt || null,
      verified: Boolean(existingVtop.lastSyncedAt && existingVtop.currentCgpa !== null),
    };
    if (existingVtop.currentCgpa !== null && existingVtop.currentCgpa !== undefined) {
      session.extractedProfile.cgpa = existingVtop.currentCgpa;
      session.collectedData.cgpa = existingVtop.currentCgpa;
    }
  }

  if (user && (user.resumeScore !== undefined && user.resumeScore !== null || user.resumeAnalysis)) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    if (!session.connectedProfiles.resume || !session.connectedProfiles.resume.provided) {
      const matchedKeywords = (user.resumeAnalysis?.matched_keywords || []).map((k) =>
        typeof k === "string" ? k : k.keyword || ""
      );
      session.connectedProfiles.resume = {
        provided: true,
        filename: "resume.pdf",
        score: user.resumeScore ?? user.resumeAnalysis?.ats_score ?? null,
        extractedSkills: matchedKeywords,
        analysis: user.resumeAnalysis || null,
      };
    }
  }

  computeDynamicOnboardingState(session, user);
  if (session.isModified()) {
    await session.save();
  }

  return session;
}

export async function processCoachMessage(userId, userMessage, user = null, options = {}) {
  const mode = options.mode || null;
  let session = await getOrCreateCoachSession(userId, user, { mode });

  const isOnboarding =
    mode === "onboarding" ||
    (!user?.onboardingCompleted && mode !== "coach") ||
    session.onboardingStatus === "IN_PROGRESS" ||
    session.isCompleted === false;

  const lowerMsg = (userMessage || "").toLowerCase().trim();
  const isSkipRequest =
    lowerMsg === "skip" ||
    lowerMsg.startsWith("skip ") ||
    lowerMsg.includes("skip this") ||
    lowerMsg.includes("skip for now") ||
    lowerMsg.includes("skip step") ||
    lowerMsg.includes("skip target") ||
    lowerMsg.includes("skip academic") ||
    lowerMsg.includes("skip github") ||
    lowerMsg.includes("skip leetcode") ||
    lowerMsg.includes("skip resume") ||
    lowerMsg.includes("skip all") ||
    lowerMsg.includes("skip to dashboard") ||
    lowerMsg.includes("i don't have") ||
    lowerMsg.includes("later");

  // 1. Record User Message
  session.messages.push({
    sender: "user",
    text: userMessage,
    timestamp: new Date(),
  });

  // 2. Run Autonomous Gemini Agentic Turn with Tool Calling
  const freshUser = await User.findById(userId);
  const geminiResult = await runGeminiCoachTurn({
    userMessage,
    userId,
    user: freshUser,
    conversationHistory: session.messages,
    maxToolTurns: 5,
    isOnboarding,
    onboardingStep: session.onboardingStep || 1,
    collectedData: session.collectedData,
    extractedProfile: session.extractedProfile,
    connectedProfiles: session.connectedProfiles,
  });

  const {
    replyText,
    toolCallsExecuted,
    executionSummary,
    actionCards,
    suggestedChips,
    mutations,
    modelUsed,
  } = geminiResult;

  // 3. Sync Any Mutations back to Session State
  if (mutations.targetUpdated && mutations.newTarget) {
    session.extractedProfile.targetCompany = mutations.newTarget.company || session.extractedProfile.targetCompany;
    session.extractedProfile.targetJobRole = mutations.newTarget.role || session.extractedProfile.targetJobRole;
    session.collectedData.targetCompany = mutations.newTarget.company || session.collectedData.targetCompany;
    session.collectedData.targetJobRole = mutations.newTarget.role || session.collectedData.targetJobRole;
  }

  // 4. Progress Onboarding Step if in Onboarding mode
  if (isOnboarding) {
    if (lowerMsg.includes("skip all") || lowerMsg.includes("skip to dashboard") || lowerMsg.includes("enter dashboard")) {
      session.onboardingStep = 6;
      session.onboardingStatus = "COMPLETED";
      session.isCompleted = true;
      session.profileCompletion = 100;
    } else if (isSkipRequest) {
      if (session.onboardingStep === 1) session.onboardingStep = 2;
      else if (session.onboardingStep === 2) session.onboardingStep = 3;
      else if (session.onboardingStep === 3) session.onboardingStep = 4;
      else if (session.onboardingStep === 4) session.onboardingStep = 5;
      else if (session.onboardingStep >= 5) {
        session.onboardingStep = 6;
        session.onboardingStatus = "COMPLETED";
        session.isCompleted = true;
        session.profileCompletion = 100;
      }
    } else {
      if (mutations.targetUpdated && session.onboardingStep <= 1) {
        session.onboardingStep = 2;
      }
      if (mutations.academicsUpdated && session.onboardingStep <= 2) {
        session.onboardingStep = 3;
      }
      if (mutations.githubSynced && session.onboardingStep <= 3) {
        session.onboardingStep = 4;
      }
      if (mutations.leetcodeSynced && session.onboardingStep <= 4) {
        session.onboardingStep = 5;
      }
      if (mutations.roadmapGenerated && session.onboardingStep >= 5) {
        session.onboardingStep = 6;
        session.onboardingStatus = "COMPLETED";
        session.isCompleted = true;
        session.profileCompletion = 100;
      }

      // Check reply text indicators for step progression
      const replyLower = (replyText || "").toLowerCase();
      if (replyLower.includes("step 2") || replyLower.includes("### step 2")) {
        session.onboardingStep = Math.max(session.onboardingStep, 2);
      }
      if (replyLower.includes("step 3") || replyLower.includes("### step 3")) {
        session.onboardingStep = Math.max(session.onboardingStep, 3);
      }
      if (replyLower.includes("step 4") || replyLower.includes("### step 4")) {
        session.onboardingStep = Math.max(session.onboardingStep, 4);
      }
      if (replyLower.includes("step 5") || replyLower.includes("### step 5")) {
        session.onboardingStep = Math.max(session.onboardingStep, 5);
      }
      if (replyLower.includes("step 6") || replyLower.includes("### step 6") || replyLower.includes("setup complete") || replyLower.includes("calibrated!")) {
        session.onboardingStep = 6;
        session.onboardingStatus = "COMPLETED";
        session.isCompleted = true;
        session.profileCompletion = 100;
      }
    }

    computeDynamicOnboardingState(session, freshUser);
  } else {
    computeDynamicOnboardingState(session, freshUser);
  }

  // Refresh Readiness Snapshot
  try {
    const updatedUser = await User.findById(userId);
    const readinessData = await calculatePlacementReadiness(updatedUser);
    session.readinessSnapshot = {
      overallScore: readinessData.overallScore ?? 0,
      targetBenchmark: readinessData.targetBenchmarkScore ?? readinessData.targetBenchmark ?? 80,
      statusLabel: readinessData.statusLabel || "Active",
      dimensions: readinessData.dimensions || {},
      topGaps: readinessData.topGaps || [],
    };
    if (!isOnboarding) {
      session.profileCompletion = Math.min(100, Math.max(session.profileCompletion, readinessData.overallScore ? 85 : 50));
    }
  } catch (err) {
    console.warn("Readiness snapshot refresh note:", err.message);
  }

  // 5. Record Coach Response Message
  session.messages.push({
    sender: "coach",
    text: replyText,
    chips: suggestedChips || [],
    timestamp: new Date(),
    metadata: {
      toolCalls: toolCallsExecuted || [],
      executionSummary: executionSummary || [],
      actionCards: actionCards || [],
      modelUsed: modelUsed || "getPlacedAI",
      isOnboarding,
      step: session.onboardingStep,
    },
  });

  await session.save();

  return {
    onboardingStep: session.onboardingStep,
    onboardingStatus: session.onboardingStatus,
    isCompleted: session.isCompleted,
    profileCompletion: session.profileCompletion,
    extractedProfile: session.extractedProfile,
    collectedData: session.collectedData,
    connectedProfiles: session.connectedProfiles,
    discoveredProjects: session.discoveredProjects,
    evidenceSkills: session.evidenceSkills,
    readinessSnapshot: session.readinessSnapshot,
    latestReply: replyText,
    chips: suggestedChips,
    toolCalls: toolCallsExecuted,
    actionCards,
    messages: session.messages,
  };
}

export async function clearCoachChatHistory(userId, options = {}) {
  const mode = options.mode || null;
  let session = await CoachConversation.findOne({ userId });
  const user = await User.findById(userId);
  const userName = user?.name || "";
  const isOnboarding = mode === "onboarding" || (!user?.onboardingCompleted && mode !== "coach");

  if (!session) {
    session = await getOrCreateCoachSession(userId, user, { mode });
  }

  if (isOnboarding) {
    session.onboardingStep = 1;
    session.onboardingStatus = "IN_PROGRESS";
    session.isCompleted = false;
    session.profileCompletion = 15;
    if (session.extractedProfile) {
      session.extractedProfile.targetCompany = "";
      session.extractedProfile.targetJobRole = "";
    }
    if (session.collectedData) {
      session.collectedData.targetCompany = "";
      session.collectedData.targetJobRole = "";
    }
    session.messages = [
      {
        sender: "coach",
        text: `Hey${userName ? ` ${userName}` : ""}! Welcome to **getPlaced** 👋 I'm your AI Career Coach.\n\nLet's calibrate your placement profile and baseline so I can build your personalized roadmap and readiness score.\n\n### Step 1: Target Ambition 🎯\n**What is your dream target company and role?**\n*(e.g., Google — SDE, Microsoft — Software Engineer, Amazon — SDE-1, Atlassian — Full Stack)*\n\nYou can pick one below, type your own target, or skip to start with a general top-tier tech track!`,
        chips: [
          "Google — SDE",
          "Microsoft — Software Engineer",
          "Amazon — SDE-1",
          "Atlassian — Full Stack",
          "Skip target setup (General SDE)",
        ],
        timestamp: new Date(),
        metadata: { isGreeting: true, isOnboarding: true, step: 1 },
      },
    ];
  } else {
    session.messages = [
      {
        sender: "coach",
        text: `Hey${userName ? ` ${userName}` : ""}, I'm **getPlacedAI**, your placement coach.\n\nWhat are you working on today?`,
        chips: [
          "Audit my profile for my target company",
          "What DSA problems should I solve today?",
          "How do I boost my ATS resume score?",
          "Show my 8-week placement sprint",
        ],
        timestamp: new Date(),
        metadata: { isGreeting: true, isOnboarding: false },
      },
    ];
  }

  await session.save();
  return session;
}

export async function getQuickSuggestionsForContext(userId, contextPath = "") {
  const user = userId ? await User.findById(userId).lean() : null;
  const target = user?.targetCompany || "Google";
  const path = typeof contextPath === "string" ? contextPath : "";

  if (path.includes("/app/coding")) {
    return [
      "Explain the optimal solution for this problem",
      "What are common edge cases to watch out for?",
      "How do I optimize space complexity?",
      "Give me a hint without revealing full code",
    ];
  }

  if (path.includes("/app/resume")) {
    return [
      `Audit my resume for ${target}`,
      "How do I quantify my bullet points?",
      "What critical keywords are missing from my resume?",
      "Generate a strong summary for my target role",
    ];
  }

  if (path.includes("/app/company-intel")) {
    return [
      `What is the interview format at ${target}?`,
      `What DSA topics are asked most frequently at ${target}?`,
      `What behavioral questions should I prepare for ${target}?`,
      `Compare my skills against ${target} benchmark`,
    ];
  }

  if (path.includes("/app/roadmap")) {
    return [
      "What should I focus on this week?",
      "How do I accelerate my placement timeline?",
      "Generate a 4-week sprint for my target company",
      "Which roadmap phase should I prioritize?",
    ];
  }

  return [
    `Audit my profile for ${target}`,
    "What 3 DSA problems should I solve today?",
    "What is my biggest skill gap right now?",
    "Show my 8-week placement sprint",
  ];
}

export async function applyOnboardingToProfile(userId, extracted) {
  if (!extracted) return;

  const targetJobRole = extracted.targetJobRole || "";
  const targetCompany = extracted.targetCompany || "";

  const userUpdate = {
    onboardingCompleted: true,
  };

  if (targetCompany) {
    const normComp = isSupportedCompany(targetCompany)
      ? normalizeCompanyName(targetCompany)
      : "Google";
    userUpdate.targetCompany = normComp;
    userUpdate.targetCompanyNormalized = normalizeIdentifier(normComp);

    const normRole = normalizeRoleName(targetJobRole, normComp);
    userUpdate.targetJobRole = normRole;
    userUpdate.targetRoleNormalized = normalizeIdentifier(normRole);
  } else if (targetJobRole) {
    const normRole = normalizeRoleName(targetJobRole, "Google");
    userUpdate.targetJobRole = normRole;
    userUpdate.targetRoleNormalized = normalizeIdentifier(normRole);
  }
  if (extracted.graduationYear) userUpdate.graduationYear = extracted.graduationYear;
  if (extracted.college) userUpdate.college = extracted.college;
  if (extracted.degree) userUpdate.degree = extracted.degree;
  if (extracted.cgpa) userUpdate.cgpa = extracted.cgpa;
  if (extracted.tenthPercentage) userUpdate.tenthPercentage = extracted.tenthPercentage;
  if (extracted.twelfthPercentage) userUpdate.twelfthPercentage = extracted.twelfthPercentage;
  if (extracted.resumeScore !== undefined && extracted.resumeScore !== null) {
    userUpdate.resumeScore = extracted.resumeScore;
  }
  if (extracted.resumeText) userUpdate.resumeText = extracted.resumeText;
  if (extracted.resumeAnalysis) userUpdate.resumeAnalysis = extracted.resumeAnalysis;

  await User.findByIdAndUpdate(userId, userUpdate);

  let academic = await AcademicProfile.findOne({ userId });
  if (academic) {
    if (extracted.cgpa) academic.currentCgpa = extracted.cgpa;
    if (extracted.college) academic.college = extracted.college;
    if (extracted.degree) academic.degree = extracted.degree;
    if (extracted.branch) academic.branch = extracted.branch;
    if (extracted.graduationYear) academic.graduationYear = extracted.graduationYear;
    if (extracted.tenthPercentage) academic.tenthPercentage = extracted.tenthPercentage;
    if (extracted.twelfthPercentage) academic.twelfthPercentage = extracted.twelfthPercentage;
    await academic.save();
  } else {
    await AcademicProfile.create({
      userId,
      college: extracted.college || "",
      degree: extracted.degree || "",
      branch: extracted.branch || "",
      graduationYear: extracted.graduationYear ?? null,
      currentCgpa: extracted.cgpa ?? null,
      tenthPercentage: extracted.tenthPercentage ?? null,
      twelfthPercentage: extracted.twelfthPercentage ?? null,
    });
  }

  if (targetCompany && targetJobRole) {
    try {
      await createPersonalizedRoadmap(
        userId,
        targetCompany,
        targetJobRole,
        extracted.targetTimelineWeeks || 8
      );
    } catch (err) {
      console.warn("Roadmap generation note:", err.message);
    }
  }

  await CoachConversation.findOneAndUpdate(
    { userId },
    { isCompleted: true, onboardingStatus: "COMPLETED", onboardingStep: 6, profileCompletion: 100 }
  );

  return {
    success: true,
    message: "Profile and academic baseline calibrated.",
    onboardingStep: 6,
    profileCompletion: 100,
  };
}

export async function connectGitHubInCoach(userId, username) {
  const cleanUsername = extractGitHubUsername(username);
  if (!cleanUsername) throw new Error("Invalid GitHub username or URL format");

  const data = await fetchGitHubUserData(cleanUsername);
  const profile = await GitHubProfile.findOneAndUpdate(
    { userId },
    { ...data, userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const session = await CoachConversation.findOne({ userId });
  if (session) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    session.connectedProfiles.github = {
      connected: true,
      username: cleanUsername,
      publicRepos: profile.publicReposCount || 0,
      languages: profile.languages?.map((l) => l.languageName) || [],
      topRepos: profile.topRepositories?.map((r) => r.name) || [],
      projectScore: profile.projectScore ?? null,
    };
    session.extractedProfile.githubUsername = cleanUsername;
    computeDynamicOnboardingState(session);
    await session.save();
  }

  return {
    success: true,
    profile: formatGitHubProfileResponse(profile),
    session,
    onboardingStep: session?.onboardingStep || 4,
    profileCompletion: session?.profileCompletion || 67,
  };
}

export async function connectLeetCodeInCoach(userId, username) {
  const cleanUsername = extractLeetCodeUsername(username);
  if (!cleanUsername) throw new Error("Invalid LeetCode username or URL format");

  const stats = await fetchLeetCodeStats(cleanUsername);
  const profile = await LeetCodeProfile.findOneAndUpdate(
    { userId },
    { ...stats, userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const session = await CoachConversation.findOne({ userId });
  if (session) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    session.connectedProfiles.leetcode = {
      connected: true,
      username: cleanUsername,
      totalSolved: profile.totalSolved || 0,
      easySolved: profile.easySolved || 0,
      mediumSolved: profile.mediumSolved || 0,
      hardSolved: profile.hardSolved || 0,
      primaryLanguage: profile.primaryLanguage || "",
      ranking: profile.ranking ?? null,
      streak: profile.streak || 0,
    };
    session.extractedProfile.leetcodeUsername = cleanUsername;
    computeDynamicOnboardingState(session);
    await session.save();
  }

  return {
    success: true,
    profile: formatLeetCodeProfileResponse(profile),
    session,
    onboardingStep: session?.onboardingStep || 5,
    profileCompletion: session?.profileCompletion || 83,
  };
}

export async function connectVtopInCoach(userId, params = {}) {
  const { username, password, captchaStr, sessionId, semesterId, regNo } = params || {};
  let vtopResult;
  if (password && captchaStr && sessionId) {
    vtopResult = await authenticateAndScrapeVtop({
      userId,
      username,
      password,
      captchaStr,
      sessionId,
      semesterId,
    });
  } else if (regNo || username) {
    const rawRegNo = (regNo || username).toUpperCase().trim();
    const existing = await VtopProfile.findOne({
      $or: [{ userId }, { regNo: rawRegNo }],
    });
    if (existing) {
      existing.userId = userId;
      // If profile had fake unverified 8.85 CGPA / 142 credits fallback, clear it
      if (!existing.lastSyncedAt && existing.currentCgpa === 8.85 && existing.totalCreditsEarned === 142) {
        existing.currentCgpa = null;
        existing.totalCreditsEarned = 0;
      }
      await existing.save();
      const isVerified = Boolean(existing.lastSyncedAt && existing.currentCgpa !== null);
      vtopResult = {
        success: true,
        profile: existing,
        verified: isVerified,
        message: isVerified
          ? "VTOP profile linked"
          : "VTOP Registration Number linked (Unverified — enter CGPA manually or verify with VTOP credentials)",
      };
    } else {
      const created = await VtopProfile.create({
        userId,
        regNo: rawRegNo,
        campus: "",
        program: "",
        currentCgpa: null,
        totalCreditsEarned: 0,
        activeBacklogs: 0,
        historyOfBacklogs: 0,
        lastSyncedAt: null,
      });
      vtopResult = {
        success: true,
        profile: created,
        verified: false,
        message: "VTOP Registration Number linked. Unverified profile state — please input CGPA manually or verify with VTOP credentials for exact calibration.",
      };
    }
  } else {
    throw new Error("Please provide VTOP credentials or Registration Number to link academic profile");
  }

  const session = await CoachConversation.findOne({ userId });
  if (session && vtopResult?.profile) {
    const prof = vtopResult.profile;
    if (!session.connectedProfiles) session.connectedProfiles = {};
    session.connectedProfiles.vtop = {
      connected: true,
      regNo: prof.regNo || "",
      cgpa: prof.currentCgpa ?? null,
      branch: prof.program || "",
      college: prof.campus || "",
      activeBacklogs: prof.activeBacklogs || 0,
      historyOfBacklogs: prof.historyOfBacklogs || 0,
      creditsEarned: prof.totalCreditsEarned || 0,
      lastSyncedAt: prof.lastSyncedAt || null,
      verified: Boolean(vtopResult.verified ?? (prof.lastSyncedAt && prof.currentCgpa !== null)),
    };
    if (prof.currentCgpa !== null && prof.currentCgpa !== undefined) {
      session.extractedProfile.cgpa = prof.currentCgpa;
      session.collectedData.cgpa = prof.currentCgpa;
    }
    computeDynamicOnboardingState(session);
    await session.save();
  }

  return {
    success: true,
    ...vtopResult,
    session,
    onboardingStep: session?.onboardingStep || 3,
    profileCompletion: session?.profileCompletion || 50,
  };
}

export async function saveResumeAnalysisInCoach(userId, { resumeScore, resumeText, resumeAnalysis, filename }) {
  const user = await User.findById(userId);
  const scoreVal = resumeScore !== undefined && resumeScore !== null ? Number(resumeScore) : (resumeAnalysis?.ats_score ?? 70);

  const newVersion = {
    id: `ver-${Date.now()}`,
    timestamp: new Date().toISOString(),
    filename: filename || "resume.pdf",
    targetRole: resumeAnalysis?.target_role || user?.targetJobRole || "Software Engineer",
    atsScore: scoreVal,
    scoreTier: resumeAnalysis?.score_tier || "Tier 2",
    matchedKeywords: (resumeAnalysis?.matched_keywords || []).map((k) =>
      typeof k === "string" ? k : k.keyword || ""
    ),
    missingKeywords: (resumeAnalysis?.missing_keywords || []).map((k) =>
      typeof k === "string" ? k : k.keyword || ""
    ),
    summaryCritique: resumeAnalysis?.summary_critique || "",
    fullEvaluation: resumeAnalysis,
  };

  const existingVersions = Array.isArray(user?.resumeVersions) ? user.resumeVersions : [];
  const updatedVersions = [newVersion, ...existingVersions.filter((v) => v?.id !== newVersion.id)].slice(0, 25);

  await User.findByIdAndUpdate(userId, {
    resumeScore: scoreVal,
    resumeText,
    resumeAnalysis,
    resumeVersions: updatedVersions,
  });

  const session = await CoachConversation.findOne({ userId });
  if (session) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    const matchedKeywords = (resumeAnalysis?.matched_keywords || []).map((k) =>
      typeof k === "string" ? k : k.keyword || ""
    );
    session.connectedProfiles.resume = {
      provided: true,
      filename: filename || "resume.pdf",
      score: scoreVal,
      extractedSkills: matchedKeywords,
      analysis: resumeAnalysis,
    };
    session.extractedProfile.resumeScore = scoreVal;
    session.extractedProfile.resumeText = resumeText;
    session.extractedProfile.resumeAnalysis = resumeAnalysis;
    computeDynamicOnboardingState(session);
    await session.save();
  }

  return session;
}
