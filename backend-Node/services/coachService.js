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

export async function getOrCreateCoachSession(userId, user = null) {
  let session = await CoachConversation.findOne({ userId });

  if (!session) {
    const userName = user?.name || "";
    const initialTarget = user?.targetCompany || "";
    const initialRole = user?.targetJobRole || "";
    const initialCgpa = user?.cgpa ?? null;

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
          text: `Hey${userName ? ` ${userName}` : ""} 👋 I'm your GetPlaced Career Coach.\n\nI'll have a quick conversation with you to understand your goals and build your placement profile automatically.\n\nWhat target company and role are you aiming for?`,
          chips: [
            "Software Development Engineer",
            "Frontend Engineer",
            "Backend Engineer",
            "Full Stack Engineer",
            "Data / ML Engineer",
          ],
          timestamp: new Date(),
        },
      ],
    });
  }

  // Check if user already had connected profiles in DB
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
    if (existingVtop.campus) {
      session.extractedProfile.college = existingVtop.campus;
      session.collectedData.college = existingVtop.campus;
    }
    if (existingVtop.program) {
      session.extractedProfile.branch = existingVtop.program;
      session.collectedData.branch = existingVtop.program;
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
    if (!session.extractedProfile) session.extractedProfile = {};
    if (session.extractedProfile.resumeScore === undefined || session.extractedProfile.resumeScore === null) {
      session.extractedProfile.resumeScore = user.resumeScore ?? user.resumeAnalysis?.ats_score ?? null;
      session.extractedProfile.resumeText = user.resumeText || "";
      session.extractedProfile.resumeAnalysis = user.resumeAnalysis || null;
    }
  }

  return session;
}

export async function processCoachMessage(userId, userMessage, user = null) {
  let session = await getOrCreateCoachSession(userId, user);

  session.messages.push({
    sender: "user",
    text: userMessage,
    timestamp: new Date(),
  });

  const step = session.onboardingStep;
  let replyText = "";
  let nextChips = [];
  let nextStep = step;
  const lower = userMessage.toLowerCase().trim();

  // Helper parser for company
  const parseCompany = (text) => {
    const l = text.toLowerCase();
    if (l.includes("google")) return "Google";
    if (l.includes("microsoft")) return "Microsoft";
    if (l.includes("amazon")) return "Amazon";
    if (l.includes("atlassian")) return "Atlassian";
    if (l.includes("tcs")) return "TCS";
    if (l.includes("adobe")) return "Adobe";
    if (l.includes("uber")) return "Uber";
    if (l.includes("flipkart")) return "Flipkart";
    if (l.includes("goldman")) return "Goldman Sachs";
    if (l.includes("cisco")) return "Cisco";
    return text.trim();
  };

  // Helper parser for role
  const parseRole = (text) => {
    const l = text.toLowerCase();
    if (l.includes("frontend") || l.includes("front end") || l.includes("front-end")) return "Frontend Engineer";
    if (l.includes("backend") || l.includes("back end") || l.includes("back-end")) return "Backend Engineer";
    if (l.includes("full stack") || l.includes("fullstack")) return "Full Stack Engineer";
    if (l.includes("devops") || l.includes("cloud")) return "Cloud / DevOps Engineer";
    if (l.includes("data") || l.includes("ai") || l.includes("ml")) return "Data / ML Engineer";
    return text.trim();
  };

  // Step 1: Target Ambition (Company & Role)
  if (step === 1) {
    if (lower.includes("haven't decided") || lower.includes("not decided") || lower.includes("not sure")) {
      session.extractedProfile.targetCompany = "";
      session.extractedProfile.targetJobRole = "";
      session.collectedData.targetCompany = "";
      session.collectedData.targetJobRole = "";
    } else {
      const company = parseCompany(userMessage);
      const role = parseRole(userMessage);
      session.extractedProfile.targetCompany = company;
      session.extractedProfile.targetJobRole = role;
      session.collectedData.targetCompany = company;
      session.collectedData.targetJobRole = role;
    }

    const targetAck = session.extractedProfile.targetCompany
      ? `Target recorded: ${session.extractedProfile.targetCompany}${session.extractedProfile.targetJobRole ? ` — ${session.extractedProfile.targetJobRole}` : ""}.`
      : `No problem! You can set your target company and role at any time.`;

    const isVtop = Boolean(session.connectedProfiles?.vtop?.connected);
    const isGh = Boolean(session.connectedProfiles?.github?.connected);
    const isLc = Boolean(session.connectedProfiles?.leetcode?.connected);

    if (isVtop) {
      const vtopAck = `Your academic record is verified via VTOP (${session.connectedProfiles.vtop.cgpa ? `${session.connectedProfiles.vtop.cgpa} CGPA` : "Verified"}).`;
      if (isGh && isLc) {
        replyText = `${targetAck}\n\n${vtopAck}\n\nYour GitHub (@${session.connectedProfiles.github.username}) and LeetCode (@${session.connectedProfiles.leetcode.username}) are already linked ✓.\n\nNext, what programming languages, frameworks, or developer tools do you use regularly?`;
        nextStep = 5;
        session.profileCompletion = 75;
        nextChips = ["Skip for now"];
      } else if (isGh) {
        replyText = `${targetAck}\n\n${vtopAck}\n\nYour GitHub is already linked (@${session.connectedProfiles.github.username} ✓).\n\nNow, let's sync your problem-solving record. What is your LeetCode username or profile URL?`;
        nextStep = 4;
        session.profileCompletion = 60;
        nextChips = ["Skip LeetCode for now"];
      } else {
        replyText = `${targetAck}\n\n${vtopAck}\n\nNow let's connect your engineering proof. What is your GitHub username or profile URL?`;
        nextStep = 3;
        session.profileCompletion = 40;
        nextChips = ["Skip GitHub for now"];
      }
    } else {
      replyText = `${targetAck}\n\nNext, let's record your academic details. What is your college, degree/branch, current CGPA, and graduation year? (Or connect your VTOP to auto-fill verified details).`;
      nextStep = 2;
      session.profileCompletion = 20;
      nextChips = [
        "Connect via VTOP",
        "Enter details manually",
      ];
    }
  }
  // Step 2: Academic Baseline
  else if (step === 2) {
    const cgpaMatch = userMessage.match(/(\d(?:\.\d+)?)\s*(?:cgpa|gpa)?/i);
    if (cgpaMatch && parseFloat(cgpaMatch[1]) <= 10) {
      const cgpa = parseFloat(cgpaMatch[1]);
      session.extractedProfile.cgpa = cgpa;
      session.collectedData.cgpa = cgpa;
    }

    const yearMatch = userMessage.match(/(202[3-9]|2030)/);
    if (yearMatch) {
      const gradYear = parseInt(yearMatch[1], 10);
      session.extractedProfile.graduationYear = gradYear;
      session.collectedData.graduationYear = gradYear;
    }

    if (lower.includes("vit")) {
      session.collectedData.college = "VIT Chennai";
      session.extractedProfile.college = "VIT Chennai";
    }
    if (lower.includes("b.tech") || lower.includes("btech")) {
      session.collectedData.degree = "B.Tech";
      session.extractedProfile.degree = "B.Tech";
    }
    if (lower.includes("cse") || lower.includes("computer science")) {
      session.collectedData.branch = "Computer Science & Engineering";
      session.extractedProfile.branch = "Computer Science & Engineering";
    }

    const isVtop = Boolean(session.connectedProfiles?.vtop?.connected);
    const verifiedTag = isVtop ? " [VTOP Verified ✓]" : "";
    const cgpaDisplay = session.collectedData.cgpa ? `${session.collectedData.cgpa} CGPA` : "details recorded";
    const degreeDisplay = session.collectedData.degree ? ` (${session.collectedData.degree}${session.collectedData.graduationYear ? `, ${session.collectedData.graduationYear}` : ""})` : "";
    const academicAck = `Academic record updated${verifiedTag}: ${cgpaDisplay}${degreeDisplay}.`;

    const isGh = Boolean(session.connectedProfiles?.github?.connected);
    const isLc = Boolean(session.connectedProfiles?.leetcode?.connected);

    if (isGh && isLc) {
      replyText = `${academicAck}\n\nYour GitHub (@${session.connectedProfiles.github.username}) and LeetCode (@${session.connectedProfiles.leetcode.username}) are already linked ✓.\n\nWhich programming languages, frameworks, or developer tools do you use regularly?`;
      nextStep = 5;
      session.profileCompletion = 75;
      nextChips = ["Skip for now"];
    } else if (isGh) {
      replyText = `${academicAck}\n\nYour GitHub is already linked (@${session.connectedProfiles.github.username} ✓).\n\nNow, let's sync your problem-solving record. What is your LeetCode username or profile URL?`;
      nextStep = 4;
      session.profileCompletion = 60;
      nextChips = ["Skip LeetCode for now"];
    } else {
      replyText = `${academicAck}\n\nNow let's connect your engineering proof. What is your GitHub username or profile URL?`;
      nextStep = 3;
      session.profileCompletion = 40;
      nextChips = ["Skip GitHub for now"];
    }
  }
  // Step 3: GitHub Integration
  else if (step === 3) {
    let ghAck = "";
    if (lower.includes("skip") || lower.includes("later") || lower.includes("don't have") || lower.includes("no")) {
      ghAck = `Understood. You can connect GitHub anytime from your profile ledger.`;
    } else {
      const cleanGh = extractGitHubUsername(userMessage);
      if (cleanGh) {
        try {
          const ghData = await fetchGitHubUserData(cleanGh);
          const ghProfile = await GitHubProfile.findOneAndUpdate(
            { userId },
            { ...ghData, userId },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );

          session.extractedProfile.githubUsername = cleanGh;
          session.connectedProfiles.github = {
            connected: true,
            username: cleanGh,
            publicRepos: ghProfile.publicReposCount || 0,
            languages: ghProfile.languages?.map((l) => l.languageName) || [],
            topRepos: ghProfile.topRepositories?.map((r) => r.name) || [],
            projectScore: ghProfile.projectScore ?? null,
          };

          if (ghProfile.repositories && ghProfile.repositories.length > 0) {
            session.discoveredProjects = ghProfile.repositories.slice(0, 5).map((r) => ({
              name: r.name,
              description: r.description || "",
              language: r.language || "",
              stars: r.stars || 0,
              topics: r.topics || [],
              isMain: r.stars > 0 || r.hasLiveUrl,
            }));
          }

          const topLangs = (ghProfile.languages || []).slice(0, 3).map((l) => l.languageName).join(", ");
          ghAck = `GitHub connected: @${cleanGh} ✓ Found ${ghProfile.publicReposCount || 0} repositories${topLangs ? ` (${topLangs})` : ""}.`;
        } catch (err) {
          console.warn("GitHub fetch error during onboarding:", err.message);
          ghAck = `Recorded GitHub username @${cleanGh}.`;
          session.extractedProfile.githubUsername = cleanGh;
        }
      } else {
        ghAck = `GitHub noted.`;
      }
    }

    const isLc = Boolean(session.connectedProfiles?.leetcode?.connected);
    if (isLc) {
      replyText = `${ghAck}\n\nYour LeetCode is already linked (@${session.connectedProfiles.leetcode.username} ✓ Solved ${session.connectedProfiles.leetcode.totalSolved || 0} problems).\n\nNext, what programming languages, frameworks, or developer tools do you use regularly?`;
      nextStep = 5;
      session.profileCompletion = 75;
      nextChips = ["Skip for now"];
    } else {
      replyText = `${ghAck}\n\nNow, let's check your DSA record. What is your LeetCode username or profile URL?`;
      nextStep = 4;
      session.profileCompletion = 60;
      nextChips = ["Skip LeetCode for now"];
    }
  }
  // Step 4: LeetCode Integration
  else if (step === 4) {
    let lcAck = "";
    if (lower.includes("skip") || lower.includes("later") || lower.includes("don't have") || lower.includes("no")) {
      lcAck = `Understood.`;
    } else {
      const cleanLc = extractLeetCodeUsername(userMessage);
      if (cleanLc) {
        try {
          const lcStats = await fetchLeetCodeStats(cleanLc);
          const lcProfile = await LeetCodeProfile.findOneAndUpdate(
            { userId },
            { ...lcStats, userId },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );

          session.extractedProfile.leetcodeUsername = cleanLc;
          session.connectedProfiles.leetcode = {
            connected: true,
            username: cleanLc,
            totalSolved: lcProfile.totalSolved || 0,
            easySolved: lcProfile.easySolved || 0,
            mediumSolved: lcProfile.mediumSolved || 0,
            hardSolved: lcProfile.hardSolved || 0,
            primaryLanguage: lcProfile.primaryLanguage || "",
            ranking: lcProfile.ranking ?? null,
            streak: lcProfile.streak || 0,
          };

          const solvedInfo = lcProfile.totalSolved
            ? `Solved ${lcProfile.totalSolved} problems (${lcProfile.easySolved || 0} Easy, ${lcProfile.mediumSolved || 0} Medium, ${lcProfile.hardSolved || 0} Hard)`
            : "Profile linked";

          lcAck = `LeetCode connected: @${cleanLc} ✓ ${solvedInfo}.`;
        } catch (err) {
          console.warn("LeetCode fetch error during onboarding:", err.message);
          lcAck = `Recorded LeetCode handle @${cleanLc}.`;
          session.extractedProfile.leetcodeUsername = cleanLc;
        }
      } else {
        lcAck = `LeetCode noted.`;
      }
    }

    replyText = `${lcAck}\n\nNext, what programming languages, frameworks, or developer tools do you use regularly?`;
    session.profileCompletion = 75;
    nextStep = 5;
    nextChips = [
      "Skip for now",
    ];
  }
  // Step 5: Technical Skills & Self-Assessment
  else if (step === 5) {
    const rawSkills = userMessage.split(/[,;\n•]+/).map((s) => s.trim()).filter(Boolean);
    const discoveredSkills = rawSkills.filter(
      (s) => !["skip", "later", "none", "no"].includes(s.toLowerCase())
    );

    session.extractedProfile.primarySkills = discoveredSkills;

    session.profileCompletion = 85;
    nextStep = 6;

    const skillsSummary = discoveredSkills.length > 0 ? `Captured competencies: ${discoveredSkills.join(", ")}.\n\n` : "";
    replyText = `${skillsSummary}How would you rate your technical confidence and interview readiness right now (Beginner, Intermediate, or Advanced)?`;
    nextChips = [
      "Beginner",
      "Intermediate",
      "Advanced",
    ];
  }
  // Step 6: Self-Assessment, Career Timeline & Synthesis
  else if (step === 6) {
    let conf = null;
    const numMatch = userMessage.match(/(\d(?:\.\d+)?)/);
    if (numMatch && parseFloat(numMatch[1]) <= 10) {
      conf = parseFloat(numMatch[1]);
    } else if (lower.includes("advanced") || lower.includes("expert")) {
      conf = 9;
    } else if (lower.includes("intermediate")) {
      conf = 6;
    } else if (lower.includes("beginner")) {
      conf = 3;
    }

    session.collectedData.technicalConfidence = conf;
    session.collectedData.communicationConfidence = conf;
    session.collectedData.hrConfidence = conf;

    let weeks = null;
    if (lower.includes("4")) weeks = 4;
    else if (lower.includes("8")) weeks = 8;
    else if (lower.includes("12")) weeks = 12;
    if (weeks) {
      session.extractedProfile.targetTimelineWeeks = weeks;
      session.collectedData.targetTimelineWeeks = weeks;
    }

    // Synthesize profile into database models
    await applyOnboardingToProfile(userId, session.extractedProfile);

    // Build real level comparison and readiness
    const updatedUser = await User.findById(userId);
    const [readinessData, gapData] = await Promise.all([
      calculatePlacementReadiness(updatedUser),
      (async () => {
        if (!session.extractedProfile.targetCompany && !session.extractedProfile.targetJobRole) {
          return { skills: [] };
        }
        const req = await CompanyRequirement.findOne({
          companyNormalized: normalizeIdentifier(session.extractedProfile.targetCompany),
          roleNormalized: normalizeIdentifier(session.extractedProfile.targetJobRole),
        }).lean();
        const lc = await LeetCodeProfile.findOne({ userId }).lean();
        return buildLevelComparison(updatedUser, req, lc);
      })(),
    ]);

    // Build evidence skills from verified gap data
    session.evidenceSkills = (gapData.skills || []).slice(0, 6).map((s) => ({
      name: s.skillName,
      estimatedLevel: s.currentLevel ?? 0,
      requiredLevel: s.requiredLevel ?? 0,
      gap: s.gap ?? 0,
      confidence: s.confidenceScore ?? 0,
      sources: s.sources || [],
      explanation: s.explanation || "",
      selfRating: conf,
    }));

    session.readinessSnapshot = {
      overallScore: readinessData.overallScore ?? 0,
      targetBenchmark: readinessData.targetBenchmark ?? 0,
      statusLabel: readinessData.statusLabel || "Profile Initialized",
      dimensions: readinessData.dimensions || {},
      topGaps: readinessData.topGaps || [],
    };

    session.isCompleted = true;
    session.onboardingStatus = "COMPLETED";
    session.profileCompletion = 100;
    nextStep = 7;

    const targetInfo = session.extractedProfile.targetCompany
      ? ` for ${session.extractedProfile.targetCompany}${session.extractedProfile.targetJobRole ? ` (${session.extractedProfile.targetJobRole})` : ""}`
      : "";

    const vtopStatus = session.connectedProfiles?.vtop?.connected ? `Connected (${session.connectedProfiles.vtop.regNo})` : "Not connected";
    const ghStatus = session.connectedProfiles?.github?.connected ? `Connected (@${session.connectedProfiles.github.username})` : "Not connected";
    const lcStatus = session.connectedProfiles?.leetcode?.connected ? `Connected (@${session.connectedProfiles.leetcode.username})` : "Not connected";

    replyText = `🎉 Profile Setup Complete!\n\nYour profile has been saved${targetInfo}:\n\n• Academic Status: ${session.extractedProfile.cgpa ? `${session.extractedProfile.cgpa} CGPA` : "Recorded"}\n• VTOP Integration: ${vtopStatus}\n• GitHub Proof: ${ghStatus}\n• LeetCode Proof: ${lcStatus}\n\nYou can view and refine your verified details or launch your personalized dashboard at any time.`;
    nextChips = [
      "Enter Dashboard →",
      "Launch Placement Roadmap",
    ];
  }
  // Step 7: Completed State
  else {
    replyText = `Your placement profile is active and synced. You can update any information from your Dashboard or Profile settings at any time.`;
    nextChips = ["Enter Dashboard →", "Launch Placement Roadmap"];
  }

  session.onboardingStep = nextStep;
  session.messages.push({
    sender: "coach",
    text: replyText,
    chips: nextChips,
    timestamp: new Date(),
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
    chips: nextChips,
    messages: session.messages,
  };
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
    if (profile.repositories && profile.repositories.length > 0) {
      session.discoveredProjects = profile.repositories.slice(0, 5).map((r) => ({
        name: r.name,
        description: r.description || "",
        language: r.language || "",
        stars: r.stars || 0,
        topics: r.topics || [],
        isMain: r.stars > 0 || r.hasLiveUrl,
      }));
    }
    session.extractedProfile.githubUsername = cleanUsername;

    const topLangs = (profile.languages || []).slice(0, 3).map((l) => l.languageName).join(", ");
    const ghAck = `GitHub connected: @${cleanUsername} ✓ Found ${profile.publicReposCount || 0} repositories${topLangs ? ` (${topLangs})` : ""}.`;

    const isLc = Boolean(session.connectedProfiles?.leetcode?.connected);

    // If user was on Step 3 (or earlier), adaptively advance
    if (session.onboardingStep <= 3) {
      if (isLc) {
        session.onboardingStep = 5;
        session.profileCompletion = Math.max(session.profileCompletion, 75);
        session.messages.push({
          sender: "coach",
          text: `${ghAck}\n\nYour LeetCode is already linked (@${session.connectedProfiles.leetcode.username} ✓).\n\nWhich programming languages, frameworks, or developer tools do you use regularly?`,
          chips: ["Skip for now"],
          timestamp: new Date(),
        });
      } else {
        session.onboardingStep = 4;
        session.profileCompletion = Math.max(session.profileCompletion, 60);
        session.messages.push({
          sender: "coach",
          text: `${ghAck}\n\nNow, let's sync your problem-solving record. What is your LeetCode username or profile URL?`,
          chips: ["Skip LeetCode for now"],
          timestamp: new Date(),
        });
      }
    } else {
      session.messages.push({
        sender: "coach",
        text: ghAck,
        chips: session.messages[session.messages.length - 1]?.chips || [],
        timestamp: new Date(),
      });
    }

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

    const solvedInfo = profile.totalSolved
      ? `Solved ${profile.totalSolved} problems (${profile.easySolved || 0} Easy, ${profile.mediumSolved || 0} Medium, ${profile.hardSolved || 0} Hard)`
      : "Profile linked";
    const lcAck = `LeetCode connected: @${cleanUsername} ✓ ${solvedInfo}.`;

    if (session.onboardingStep <= 4) {
      session.onboardingStep = 5;
      session.profileCompletion = Math.max(session.profileCompletion, 75);
      session.messages.push({
        sender: "coach",
        text: `${lcAck}\n\nNext, what programming languages, frameworks, or developer tools do you use regularly?`,
        chips: ["Skip for now"],
        timestamp: new Date(),
      });
    } else {
      session.messages.push({
        sender: "coach",
        text: lcAck,
        chips: session.messages[session.messages.length - 1]?.chips || [],
        timestamp: new Date(),
      });
    }

    await session.save();
  }

  return { success: true, profile: formatLeetCodeProfileResponse(profile), session };
}

export async function connectVtopInCoach(userId, { username, password, captchaStr, sessionId, semesterId, regNo }) {
  let vtopProfile = null;

  if (username && password && captchaStr) {
    const liveResult = await authenticateAndScrapeVtop(userId, {
      username: username.trim(),
      password: password.trim(),
      captchaStr: captchaStr.trim(),
      sessionId,
      semesterId,
    });

    if (!liveResult.success) {
      return liveResult;
    }
    vtopProfile = liveResult.vtop;
  } else if (regNo || username) {
    const targetReg = (regNo || username).toUpperCase().trim();
    let vtop = await VtopProfile.findOne({ userId });
    if (!vtop) {
      vtop = new VtopProfile({
        userId,
        regNo: targetReg,
        syncStatus: "unverified",
        lastSyncedAt: new Date(),
      });
    } else {
      vtop.regNo = targetReg;
      vtop.lastSyncedAt = new Date();
    }
    await vtop.save();
    vtopProfile = vtop;
  } else {
    vtopProfile = await VtopProfile.findOne({ userId });
    if (!vtopProfile) {
      throw new Error("No VTOP credentials or profile provided");
    }
  }

  const session = await CoachConversation.findOne({ userId });
  if (session) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    session.connectedProfiles.vtop = {
      connected: true,
      regNo: vtopProfile.regNo || "",
      cgpa: vtopProfile.currentCgpa ?? null,
      branch: vtopProfile.program || "",
      college: vtopProfile.campus || "",
      activeBacklogs: vtopProfile.activeBacklogs || 0,
      historyOfBacklogs: vtopProfile.historyOfBacklogs || 0,
      creditsEarned: vtopProfile.totalCreditsEarned || 0,
      lastSyncedAt: vtopProfile.lastSyncedAt || new Date(),
    };
    if (vtopProfile.currentCgpa) {
      session.extractedProfile.cgpa = vtopProfile.currentCgpa;
      session.collectedData.cgpa = vtopProfile.currentCgpa;
    }
    if (vtopProfile.campus) {
      session.extractedProfile.college = vtopProfile.campus;
      session.collectedData.college = vtopProfile.campus;
    }
    if (vtopProfile.program) {
      session.extractedProfile.branch = vtopProfile.program;
      session.collectedData.branch = vtopProfile.program;
    }

    const vtopAck = `VTOP academic profile connected: ${vtopProfile.regNo}${vtopProfile.currentCgpa ? ` (${vtopProfile.currentCgpa} CGPA)` : ""}.`;
    const isGh = Boolean(session.connectedProfiles?.github?.connected);
    const isLc = Boolean(session.connectedProfiles?.leetcode?.connected);

    if (session.onboardingStep <= 2) {
      if (isGh && isLc) {
        session.onboardingStep = 5;
        session.profileCompletion = Math.max(session.profileCompletion, 75);
        session.messages.push({
          sender: "coach",
          text: `${vtopAck}\n\nYour GitHub (@${session.connectedProfiles.github.username}) and LeetCode (@${session.connectedProfiles.leetcode.username}) are already linked ✓.\n\nWhich programming languages, frameworks, or developer tools do you use regularly?`,
          chips: ["Skip for now"],
          timestamp: new Date(),
        });
      } else if (isGh) {
        session.onboardingStep = 4;
        session.profileCompletion = Math.max(session.profileCompletion, 60);
        session.messages.push({
          sender: "coach",
          text: `${vtopAck}\n\nYour GitHub is already linked (@${session.connectedProfiles.github.username} ✓).\n\nNow, let's sync your problem-solving record. What is your LeetCode username or profile URL?`,
          chips: ["Skip LeetCode for now"],
          timestamp: new Date(),
        });
      } else {
        session.onboardingStep = 3;
        session.profileCompletion = Math.max(session.profileCompletion, 40);
        session.messages.push({
          sender: "coach",
          text: `${vtopAck}\n\nNow let's connect your engineering proof. What is your GitHub username or profile URL?`,
          chips: ["Skip GitHub for now"],
          timestamp: new Date(),
        });
      }
    } else {
      session.messages.push({
        sender: "coach",
        text: vtopAck,
        chips: session.messages[session.messages.length - 1]?.chips || [],
        timestamp: new Date(),
      });
    }

    await session.save();
  }

  return {
    success: true,
    vtop: vtopProfile,
    session,
    message: `VTOP academic profile connected: ${vtopProfile.regNo}${vtopProfile.currentCgpa ? ` (${vtopProfile.currentCgpa} CGPA)` : ""}`,
  };
}

export async function saveResumeAnalysisInCoach(userId, { resumeScore, resumeText, resumeAnalysis, filename }) {
  let session = await CoachConversation.findOne({ userId });
  const score = resumeScore !== undefined && resumeScore !== null ? Number(resumeScore) : (resumeAnalysis?.ats_score ?? null);

  await User.findByIdAndUpdate(userId, {
    resumeScore: score,
    resumeText: resumeText || resumeAnalysis?.extracted_text || "",
    resumeAnalysis: resumeAnalysis || null,
  });

  if (session) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    const matchedSkills = (resumeAnalysis?.matched_keywords || []).map((k) => (typeof k === "string" ? k : k.keyword || ""));

    session.connectedProfiles.resume = {
      provided: true,
      filename: filename || "resume.pdf",
      score: score,
      extractedSkills: matchedSkills,
      analysis: resumeAnalysis || null,
    };

    if (!session.extractedProfile) session.extractedProfile = {};
    session.extractedProfile.resumeScore = score;
    session.extractedProfile.resumeText = resumeText || "";
    session.extractedProfile.resumeAnalysis = resumeAnalysis || null;

    session.messages.push({
      sender: "coach",
      text: `📄 Resume Uploaded & Audited with Google GENAI!\n\n• ATS Format & Keywords Score: **${score ?? "N/A"}/100**\n• Top Matched Keywords: ${matchedSkills.slice(0, 6).join(", ") || "Technical stack parsed"}\n• Google XYZ Metrics: ${resumeAnalysis?.bullet_improvements?.length || 0} bullet optimizations generated.\n\nYour resume data is now linked to your multi-pillar placement audit.`,
      timestamp: new Date(),
    });

    session.profileCompletion = Math.min(100, Math.max(session.profileCompletion || 0, 75));
    await session.save();
  }

  const user = await User.findById(userId);
  return await getOrCreateCoachSession(userId, user);
}
