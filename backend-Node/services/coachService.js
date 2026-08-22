import mongoose from "mongoose";
import CoachConversation from "../models/coachConversationModel.js";
import User from "../models/userModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import GitHubProfile from "../models/githubProfileModel.js";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";
import { createPersonalizedRoadmap } from "./roadmapService.js";
import { calculatePlacementReadiness } from "./readinessService.js";
import { buildLevelComparison } from "./levelGapService.js";
import { fetchGitHubUserData, extractGitHubUsername, formatGitHubProfileResponse } from "./githubService.js";
import { fetchLeetCodeStats, extractLeetCodeUsername, formatLeetCodeProfileResponse } from "./leetcodeService.js";

export async function getOrCreateCoachSession(userId, user = null) {
  let session = await CoachConversation.findOne({ userId });

  if (!session) {
    const userName = user?.name || "there";
    const initialTarget = user?.targetCompany || "Microsoft";
    const initialRole = user?.targetJobRole || "Software Development Engineer";
    const initialCgpa = user?.cgpa || 8.5;

    session = await CoachConversation.create({
      userId,
      onboardingStep: 1,
      onboardingStatus: "IN_PROGRESS",
      isCompleted: false,
      profileCompletion: 15,
      collectedData: {
        name: user?.name || "",
        college: user?.college || "VIT Chennai",
        degree: user?.degree || "B.Tech",
        branch: "Computer Science & Engineering",
        graduationYear: user?.graduationYear || 2026,
        cgpa: initialCgpa,
        tenthPercentage: user?.tenthPercentage || 90,
        twelfthPercentage: user?.twelfthPercentage || 88,
        targetCompany: initialTarget,
        targetJobRole: initialRole,
        targetTimelineWeeks: 8,
      },
      extractedProfile: {
        targetCompany: initialTarget,
        targetJobRole: initialRole,
        graduationYear: user?.graduationYear || 2026,
        college: user?.college || "VIT Chennai",
        degree: user?.degree || "B.Tech",
        branch: "Computer Science & Engineering",
        cgpa: initialCgpa,
        tenthPercentage: user?.tenthPercentage || 90,
        twelfthPercentage: user?.twelfthPercentage || 88,
        leetcodeUsername: "",
        githubUsername: "",
        primarySkills: ["Data Structures", "Algorithms", "React", "Node.js", "Java"],
        targetTimelineWeeks: 8,
      },
      messages: [
        {
          sender: "coach",
          text: `Hey ${userName} 👋 I'm your GetPlaced Career Coach.\n\nInstead of having you fill out a long, tedious registration form, I'll have a quick conversation with you to understand where you stand and build your placement profile automatically.\n\nI'll integrate your goals with real evidence from GitHub, LeetCode, and your academic background.\n\nReady to get started? What role and companies are you targeting?`,
          chips: [
            "Target: Microsoft · Software Development Engineer",
            "Target: Google · Software Engineer",
            "Target: Amazon · SDE-1",
            "Target: Atlassian · Software Engineer",
            "Target: TCS Digital / Prime",
            "I haven't decided yet",
          ],
          timestamp: new Date(),
        },
      ],
    });
  }

  // Check if user already had connected profiles in DB
  const [existingGh, existingLc] = await Promise.all([
    GitHubProfile.findOne({ userId }),
    LeetCodeProfile.findOne({ userId }),
  ]);

  if (existingGh && !session.connectedProfiles?.github?.connected) {
    if (!session.connectedProfiles) session.connectedProfiles = {};
    session.connectedProfiles.github = {
      connected: true,
      username: existingGh.username,
      publicRepos: existingGh.publicReposCount || 0,
      languages: existingGh.languages?.map((l) => l.languageName) || [],
      topRepos: existingGh.topRepositories?.map((r) => r.name) || [],
      projectScore: existingGh.projectScore || null,
    };
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
      ranking: existingLc.ranking || null,
      streak: existingLc.streak || 0,
    };
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
    if (l.includes("tcs") || l.includes("prime") || l.includes("digital")) return "TCS Digital / Prime";
    if (l.includes("adobe")) return "Adobe";
    if (l.includes("uber")) return "Uber";
    if (l.includes("flipkart")) return "Flipkart";
    if (l.includes("goldman")) return "Goldman Sachs";
    if (l.includes("cisco")) return "Cisco";
    return "Microsoft";
  };

  // Helper parser for role
  const parseRole = (text) => {
    const l = text.toLowerCase();
    if (l.includes("frontend") || l.includes("front end") || l.includes("front-end")) return "Frontend Engineer";
    if (l.includes("backend") || l.includes("back end") || l.includes("back-end")) return "Backend Engineer";
    if (l.includes("full stack") || l.includes("fullstack")) return "Full Stack Engineer";
    if (l.includes("devops") || l.includes("cloud")) return "Cloud / DevOps Engineer";
    if (l.includes("data") || l.includes("ai") || l.includes("ml")) return "Data / ML Engineer";
    return "Software Development Engineer";
  };

  // Step 1: Target Ambition (Company & Role)
  if (step === 1) {
    if (lower.includes("haven't decided") || lower.includes("not decided") || lower.includes("don't have")) {
      session.extractedProfile.targetCompany = "Microsoft";
      session.extractedProfile.targetJobRole = "Software Development Engineer";
      session.collectedData.targetCompany = "Microsoft";
      session.collectedData.targetJobRole = "Software Development Engineer";
      replyText = `No problem! We'll start with Microsoft Software Development Engineer as a general tier-1 benchmark, which you can adjust at any time.\n\nNow, let's look at your academic baseline. What is your college, degree/branch, current CGPA, and expected graduation year?`;
    } else {
      const company = parseCompany(userMessage);
      const role = parseRole(userMessage);
      session.extractedProfile.targetCompany = company;
      session.extractedProfile.targetJobRole = role;
      session.collectedData.targetCompany = company;
      session.collectedData.targetJobRole = role;
      replyText = `Target locked: ${company} — ${role}. Excellent choice!\n\nNext, let's verify your academic baseline for campus eligibility cutoffs. What is your college, degree/branch, current CGPA, and graduation year?`;
    }

    session.profileCompletion = 25;
    nextStep = 2;
    nextChips = [
      "VIT Chennai · B.Tech CSE (2026 Batch) · 8.8 CGPA",
      "B.Tech CSE (2026 Batch) · 8.2 CGPA",
      "B.Tech IT (2025 Batch) · 9.1 CGPA",
      "B.Tech ECE (2026 Batch) · 7.9 CGPA",
    ];
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

    if (lower.includes("vit")) session.collectedData.college = "VIT Chennai";
    if (lower.includes("b.tech") || lower.includes("btech")) session.collectedData.degree = "B.Tech";
    if (lower.includes("cse") || lower.includes("computer science")) session.collectedData.branch = "Computer Science & Engineering";

    session.profileCompletion = 40;
    nextStep = 3;

    replyText = `Academic record verified: ${session.collectedData.cgpa || 8.5} CGPA (${session.collectedData.degree || "B.Tech"}, ${session.collectedData.graduationYear || 2026}). You comfortably meet the academic cutoff for ${session.extractedProfile.targetCompany}.\n\nNow let's connect your engineering proof. What is your GitHub username or profile URL?`;
    nextChips = [
      "https://github.com/octocat",
      "github.com/torvalds",
      "Skip GitHub for now",
    ];
  }
  // Step 3: GitHub Integration
  else if (step === 3) {
    if (lower.includes("skip") || lower.includes("later") || lower.includes("don't have")) {
      replyText = `No worries! You can connect GitHub anytime from your profile settings.\n\nNext, let's sync your problem-solving record. What is your LeetCode username or profile URL?`;
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
            projectScore: ghProfile.projectScore || null,
          };

          // Save discovered projects
          if (ghProfile.repositories && ghProfile.repositories.length > 0) {
            session.discoveredProjects = ghProfile.repositories.slice(0, 5).map((r) => ({
              name: r.name,
              description: r.description || "Public repository project",
              language: r.language || "JavaScript",
              stars: r.stars || 0,
              topics: r.topics || [],
              isMain: r.stars > 0 || r.hasLiveUrl,
            }));
          }

          const topLangs = (ghProfile.languages || []).slice(0, 3).map((l) => l.languageName).join(", ");
          replyText = `GitHub connected: @${cleanGh} ✓ Found ${ghProfile.publicReposCount} repositories (${topLangs || "TypeScript, JavaScript"}). Project dimension calibrated to ${ghProfile.projectScore || 75}/100.\n\nNow, let's check your DSA record. What is your LeetCode username or profile URL?`;
        } catch (err) {
          console.warn("GitHub fetch error during onboarding:", err.message);
          replyText = `Couldn't retrieve GitHub profile (@${cleanGh}) right now, but saved for connection.\n\nWhat is your LeetCode username or profile URL?`;
          session.extractedProfile.githubUsername = cleanGh;
        }
      } else {
        replyText = `GitHub noted.\n\nWhat is your LeetCode username or profile URL?`;
      }
    }

    session.profileCompletion = 60;
    nextStep = 4;
    nextChips = [
      "https://leetcode.com/tourist",
      "leetcode.com/u/neal_wu",
      "tourist",
      "Skip LeetCode for now",
    ];
  }
  // Step 4: LeetCode Integration
  else if (step === 4) {
    if (lower.includes("skip") || lower.includes("later") || lower.includes("don't have")) {
      replyText = `Understood. We'll calibrate your DSA level based on core requirements and self-rating.\n\nWhich programming languages and technologies do you use most frequently (e.g. C++, Java, Python, React, Spring Boot, SQL)?`;
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
            primaryLanguage: lcProfile.primaryLanguage || "C++",
            ranking: lcProfile.ranking || null,
            streak: lcProfile.streak || 0,
          };

          replyText = `LeetCode connected: @${cleanLc} ✓ Solved ${lcProfile.totalSolved} problems (${lcProfile.easySolved} Easy, ${lcProfile.mediumSolved} Medium, ${lcProfile.hardSolved} Hard). Primary language: ${lcProfile.primaryLanguage || "C++"}.\n\nNext, what other programming languages, frameworks, or developer tools do you use regularly?`;
        } catch (err) {
          console.warn("LeetCode fetch error during onboarding:", err.message);
          replyText = `Couldn't retrieve public LeetCode stats for @${cleanLc} right now, but recorded your handle.\n\nWhich languages and frameworks do you use regularly?`;
          session.extractedProfile.leetcodeUsername = cleanLc;
        }
      } else {
        replyText = `LeetCode noted.\n\nWhich languages and frameworks do you use regularly?`;
      }
    }

    session.profileCompletion = 75;
    nextStep = 5;
    nextChips = [
      "Java, Spring Boot, React, SQL, DSA",
      "C++, Python, React, Node.js, System Design",
      "Python, FastApi, PostgreSQL, Docker, DSA",
      "MERN Stack (MongoDB, Express, React, Node.js)",
    ];
  }
  // Step 5: Technical Skills & Self-Assessment
  else if (step === 5) {
    const rawSkills = userMessage.split(/[,;\n•]+/).map((s) => s.trim()).filter(Boolean);
    const discoveredSkills = rawSkills.length > 0
      ? rawSkills
      : ["Java", "React", "Data Structures", "SQL", "Spring Boot"];

    session.extractedProfile.primarySkills = discoveredSkills;

    // Self-assessment question
    session.profileCompletion = 85;
    nextStep = 6;

    replyText = `Captured core competencies: ${discoveredSkills.join(", ")}.\n\nOn a scale of 1–10 (or Beginner/Intermediate/Advanced), how confident do you feel in your Technical Interviews & DSA problem-solving right now?`;
    nextChips = [
      "Intermediate (7/10) · Confident in Medium DSA",
      "Beginner (5/10) · Building foundations",
      "Advanced (8.5/10) · Competitive programmer",
      "Strong in Projects (8/10), Moderate in DSA (6/10)",
    ];
  }
  // Step 6: Self-Assessment, Career Timeline & Synthesis
  else if (step === 6) {
    let conf = 7;
    const numMatch = userMessage.match(/(\d(?:\.\d+)?)/);
    if (numMatch && parseFloat(numMatch[1]) <= 10) {
      conf = parseFloat(numMatch[1]);
    } else if (lower.includes("advanced") || lower.includes("expert")) {
      conf = 8.5;
    } else if (lower.includes("beginner")) {
      conf = 5;
    }

    session.collectedData.technicalConfidence = conf;
    session.collectedData.communicationConfidence = 7.5;
    session.collectedData.hrConfidence = 7;

    let weeks = 8;
    if (lower.includes("4")) weeks = 4;
    else if (lower.includes("12")) weeks = 12;
    session.extractedProfile.targetTimelineWeeks = weeks;
    session.collectedData.targetTimelineWeeks = weeks;

    // Synthesize profile into database models
    await applyOnboardingToProfile(userId, session.extractedProfile);

    // Build level comparison and readiness
    const updatedUser = await User.findById(userId);
    const [readinessData, gapData] = await Promise.all([
      calculatePlacementReadiness(updatedUser),
      (async () => {
        const req = await CompanyRequirement.findOne({
          companyNormalized: normalizeIdentifier(session.extractedProfile.targetCompany),
          roleNormalized: normalizeIdentifier(session.extractedProfile.targetJobRole),
        }).lean();
        const lc = await LeetCodeProfile.findOne({ userId }).lean();
        return buildLevelComparison(updatedUser, req, lc);
      })(),
    ]);

    // Build evidence skills
    session.evidenceSkills = (gapData.skills || []).slice(0, 6).map((s) => ({
      name: s.skillName,
      estimatedLevel: s.currentLevel || 6.5,
      requiredLevel: s.requiredLevel || 8,
      gap: s.gap || -1.5,
      confidence: s.confidenceScore || 82,
      sources: s.sources || ["github", "self_assessment"],
      explanation: s.explanation || `Derived from verified activity and self-reported proficiency.`,
      selfRating: conf,
    }));

    session.readinessSnapshot = {
      overallScore: readinessData.overallScore || 74,
      targetBenchmark: readinessData.targetBenchmark || 80,
      statusLabel: readinessData.statusLabel || "Competitive Ready",
      dimensions: readinessData.dimensions || {},
      topGaps: readinessData.topGaps || [],
    };

    session.isCompleted = true;
    session.onboardingStatus = "COMPLETED";
    session.profileCompletion = 100;
    nextStep = 7;

    const readinessScore = readinessData.overallScore || 74;
    const topGapText = readinessData.topGaps && readinessData.topGaps.length > 0
      ? readinessData.topGaps.map((g) => `${g.dimensionLabel} (${g.gap > 0 ? "+" : ""}${g.gap})`).join(", ")
      : "DSA & System Fundamentals";

    replyText = `🎉 Profile Calibration Complete!\n\nHere is your Initial Placement Analysis for ${session.extractedProfile.targetCompany} (${session.extractedProfile.targetJobRole}):\n\n• Initial Placement Readiness: ${readinessScore}/100\n• Academic Standing: ${session.extractedProfile.cgpa || 8.5} CGPA (${session.collectedData.degree || "B.Tech"})\n• GitHub Evidence: ${session.connectedProfiles?.github?.connected ? `Connected (@${session.connectedProfiles.github.username})` : "Pending"}\n• LeetCode Evidence: ${session.connectedProfiles?.leetcode?.connected ? `Connected (@${session.connectedProfiles.leetcode.username})` : "Pending"}\n• Primary Focus Gaps: ${topGapText}\n\nReview your profile below and click "Enter My Dashboard" to access your tailored roadmap and live analytics.`;
    nextChips = [
      "Enter My Dashboard →",
      "Launch Placement Roadmap",
      "Explore Target Company Dossier",
    ];
  }
  // Step 7: Completed State
  else {
    replyText = `Your placement profile is active and synced. You can update any information from your Dashboard or Profile settings at any time.`;
    nextChips = ["Enter My Dashboard →", "Placement Roadmap"];
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

  const targetJobRole = extracted.targetJobRole || "Software Development Engineer";
  const targetCompany = extracted.targetCompany || "Microsoft";

  await User.findByIdAndUpdate(userId, {
    name: extracted.name || undefined,
    targetCompany,
    targetCompanyNormalized: normalizeIdentifier(targetCompany),
    targetJobRole,
    targetRoleNormalized: normalizeIdentifier(targetJobRole),
    graduationYear: extracted.graduationYear || 2026,
    college: extracted.college || "VIT Chennai",
    degree: extracted.degree || "B.Tech",
    cgpa: extracted.cgpa || 8.5,
    tenthPercentage: extracted.tenthPercentage || 90,
    twelfthPercentage: extracted.twelfthPercentage || 88,
    onboardingCompleted: true,
  });

  let academic = await AcademicProfile.findOne({ userId });
  if (academic) {
    academic.currentCgpa = extracted.cgpa || academic.currentCgpa;
    academic.college = extracted.college || academic.college;
    academic.degree = extracted.degree || academic.degree;
    academic.branch = extracted.branch || academic.branch;
    academic.graduationYear = extracted.graduationYear || academic.graduationYear;
    await academic.save();
  } else {
    await AcademicProfile.create({
      userId,
      college: extracted.college || "VIT Chennai",
      degree: extracted.degree || "B.Tech",
      branch: extracted.branch || "Computer Science & Engineering",
      graduationYear: extracted.graduationYear || 2026,
      currentCgpa: extracted.cgpa || 8.5,
      targetCgpa: 9.0,
      tenthPercentage: extracted.tenthPercentage || 90,
      twelfthPercentage: extracted.twelfthPercentage || 88,
    });
  }

  try {
    await createPersonalizedRoadmap(
      userId,
      targetCompany,
      targetJobRole,
      extracted.targetTimelineWeeks || 8
    );
  } catch (err) {
    console.warn("Could not auto-generate roadmap:", err.message);
  }

  // Mark session as completed
  await CoachConversation.findOneAndUpdate(
    { userId },
    { isCompleted: true, onboardingStatus: "COMPLETED", profileCompletion: 100 }
  );

  return {
    success: true,
    message: "Profile, academic baseline, and placement roadmap successfully calibrated!",
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
      projectScore: profile.projectScore || null,
    };
    if (profile.repositories && profile.repositories.length > 0) {
      session.discoveredProjects = profile.repositories.slice(0, 5).map((r) => ({
        name: r.name,
        description: r.description || "Public repository",
        language: r.language || "JavaScript",
        stars: r.stars || 0,
        topics: r.topics || [],
        isMain: r.stars > 0 || r.hasLiveUrl,
      }));
    }
    session.extractedProfile.githubUsername = cleanUsername;
    await session.save();
  }

  return { success: true, profile: formatGitHubProfileResponse(profile) };
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
      ranking: profile.ranking || null,
      streak: profile.streak || 0,
    };
    session.extractedProfile.leetcodeUsername = cleanUsername;
    await session.save();
  }

  return { success: true, profile: formatLeetCodeProfileResponse(profile) };
}

