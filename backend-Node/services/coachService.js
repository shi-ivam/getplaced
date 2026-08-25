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
import { fetchLeetCodeStats, extractLeetCodeUsername, formatLeetCodeProfileResponse } from "./leetcodeService.js";
import { authenticateAndScrapeVtop } from "./vtopLiveAuthService.js";
import { runGeminiCoachTurn } from "./geminiCoachEngine.js";

export async function getOrCreateCoachSession(userId, user = null) {
  let session = await CoachConversation.findOne({ userId });

  if (!session) {
    const userName = user?.name || "";
    const initialTarget = user?.targetCompany || "";
    const initialRole = user?.targetJobRole || "";
    const initialCgpa = user?.cgpa ?? null;

    try {
      session = await CoachConversation.create({
        userId,
        onboardingStep: 1,
        onboardingStatus: "IN_PROGRESS",
        isCompleted: false,
        profileCompletion: 0,
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
        messages: [
          {
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
            },
          },
        ],
      });
    } catch (err) {
      if (err.code === 11000) {
        session = await CoachConversation.findOne({ userId });
      } else {
        throw err;
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
      lastSyncedAt: existingVtop.lastSyncedAt || new Date(),
    };
    if (existingVtop.currentCgpa) {
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

  return session;
}

export async function processCoachMessage(userId, userMessage, user = null) {
  let session = await getOrCreateCoachSession(userId, user);

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
    session.profileCompletion = Math.min(100, Math.max(session.profileCompletion, readinessData.overallScore ? 85 : 50));
  } catch (err) {
    console.warn("Readiness snapshot refresh note:", err.message);
  }

  // 4. Record Coach Response Message
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

export async function clearCoachChatHistory(userId) {
  let session = await CoachConversation.findOne({ userId });
  const user = await User.findById(userId);
  const userName = user?.name || "";

  if (!session) {
    session = await getOrCreateCoachSession(userId, user);
  }

  session.messages = [
    {
      sender: "coach",
      text: `Chat reset. Hey${userName ? ` ${userName}` : ""}, I'm **getPlacedAI**. What would you like to work on?`,
      chips: [
        "Audit my profile for Google",
        "What DSA problems should I solve today?",
        "How do I boost my ATS resume score?",
        "Show my 8-week placement sprint",
      ],
      timestamp: new Date(),
      metadata: { isGreeting: true },
    },
  ];
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

  if (extracted.name) userUpdate.name = extracted.name;
  if (targetCompany) {
    userUpdate.targetCompany = targetCompany;
    userUpdate.targetCompanyNormalized = normalizeIdentifier(targetCompany);
  }
  if (targetJobRole) {
    userUpdate.targetJobRole = targetJobRole;
    userUpdate.targetRoleNormalized = normalizeIdentifier(targetJobRole);
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
    { isCompleted: true, onboardingStatus: "COMPLETED", profileCompletion: 100 }
  );

  return {
    success: true,
    message: "Profile and academic baseline calibrated.",
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
    await session.save();
  }

  return { success: true, profile: formatGitHubProfileResponse(profile), session };
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
    await session.save();
  }

  return { success: true, profile: formatLeetCodeProfileResponse(profile), session };
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
      await existing.save();
      vtopResult = { success: true, profile: existing, message: "VTOP profile linked" };
    } else {
      const created = await VtopProfile.create({
        userId,
        regNo: rawRegNo,
        campus: "VIT Chennai",
        program: "",
        currentCgpa: null,
        totalCreditsEarned: null,
        activeBacklogs: 0,
        historyOfBacklogs: 0,
        syncStatus: "pending",
        lastSyncedAt: new Date(),
      });
      vtopResult = { success: true, profile: created, message: "VTOP academic profile linked (pending live sync)" };
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
      regNo: prof.regNo,
      cgpa: prof.currentCgpa,
      branch: prof.program,
      college: prof.campus,
      activeBacklogs: prof.activeBacklogs || 0,
      historyOfBacklogs: prof.historyOfBacklogs || 0,
      creditsEarned: prof.totalCreditsEarned || 0,
      lastSyncedAt: prof.lastSyncedAt || new Date(),
    };
    if (prof.currentCgpa) {
      session.extractedProfile.cgpa = prof.currentCgpa;
      session.collectedData.cgpa = prof.currentCgpa;
    }
    await session.save();
  }

  return { success: true, ...vtopResult, session };
}

export async function saveResumeAnalysisInCoach(userId, { resumeScore, resumeText, resumeAnalysis, filename }) {
  await User.findByIdAndUpdate(userId, {
    resumeScore,
    resumeText,
    resumeAnalysis,
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
      score: resumeScore,
      extractedSkills: matchedKeywords,
      analysis: resumeAnalysis,
    };
    session.extractedProfile.resumeScore = resumeScore;
    session.extractedProfile.resumeText = resumeText;
    session.extractedProfile.resumeAnalysis = resumeAnalysis;
    await session.save();
  }

  return session;
}
