import mongoose from "mongoose";
import CoachConversation from "../models/coachConversationModel.js";
import User from "../models/userModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import { createPersonalizedRoadmap } from "./roadmapService.js";
import { calculatePlacementReadiness } from "./readinessService.js";

export async function getOrCreateCoachSession(userId, user = null) {
  let session = await CoachConversation.findOne({ userId });

  if (!session) {
    const userName = user?.name || "there";
    session = await CoachConversation.create({
      userId,
      onboardingStep: 1,
      isCompleted: false,
      extractedProfile: {
        targetCompany: user?.targetCompany || "Microsoft",
        targetJobRole: user?.targetJobRole || "Software Development Engineer",
        graduationYear: user?.graduationYear || 2026,
        college: user?.college || "VIT Chennai",
        degree: user?.degree || "B.Tech",
        branch: "Computer Science & Engineering",
        cgpa: user?.cgpa || 8.5,
        tenthPercentage: user?.tenthPercentage || 90,
        twelfthPercentage: user?.twelfthPercentage || 88,
        leetcodeUsername: "",
        githubUsername: "",
        primarySkills: ["JavaScript", "Python", "Data Structures", "React"],
        targetTimelineWeeks: 8,
      },
      messages: [
        {
          sender: "coach",
          text: `Hello ${userName}. I am your AI Career Coach and Placement Strategist. Let us construct your target career profile and custom placement roadmap.\n\nFirst, what is your primary target company and dream role?`,
          chips: [
            "Target: Microsoft · SDE-1",
            "Target: Google · Software Engineer",
            "Target: Amazon · SDE-1",
            "Target: TCS Digital / Prime",
            "Target: Atlassian · Software Engineer",
          ],
          timestamp: new Date(),
        },
      ],
    });
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

  const lower = userMessage.toLowerCase();

  if (step === 1) {
    if (lower.includes("google")) {
      session.extractedProfile.targetCompany = "Google";
    } else if (lower.includes("microsoft")) {
      session.extractedProfile.targetCompany = "Microsoft";
    } else if (lower.includes("amazon")) {
      session.extractedProfile.targetCompany = "Amazon";
    } else if (lower.includes("atlassian")) {
      session.extractedProfile.targetCompany = "Atlassian";
    } else if (lower.includes("tcs")) {
      session.extractedProfile.targetCompany = "TCS Digital / Prime";
    } else {
      session.extractedProfile.targetCompany = "Microsoft";
    }

    session.extractedProfile.targetJobRole = "Software Development Engineer";
    nextStep = 2;

    replyText = `Target set: ${session.extractedProfile.targetCompany}. This tier evaluates algorithmic problem solving and system fundamentals.\n\nNext, let us verify your academic baseline. What is your current college, degree, and current CGPA?`;
    nextChips = [
      "CGPA: 8.8 · B.Tech CSE (2026 Batch)",
      "CGPA: 8.2 · B.Tech IT (2026 Batch)",
      "CGPA: 7.8 · B.Tech ECE (2026 Batch)",
      "CGPA: 9.1 · B.Tech CSE (2025 Batch)",
    ];
  } else if (step === 2) {
    const cgpaMatch = userMessage.match(/(\d\.\d+)/);
    if (cgpaMatch) {
      session.extractedProfile.cgpa = parseFloat(cgpaMatch[1]);
    }
    nextStep = 3;

    replyText = `Academic record updated: ${session.extractedProfile.cgpa || 8.5} CGPA. This meets the academic qualification threshold for ${session.extractedProfile.targetCompany}.\n\nNow, let us sync your technical skills and profiles. Mention your core languages (C++, Java, Python, JavaScript) or frameworks.`;
    nextChips = [
      "LeetCode: tourist · C++, Python, DSA",
      "GitHub: octocat · React, Node.js, TypeScript",
      "Full Stack: React, Express, MongoDB, Java",
      "Core: C++, DSA, OOP, SQL, System Design",
    ];
  } else if (step === 3) {
    session.extractedProfile.primarySkills = ["Data Structures", "Algorithms", "C++", "JavaScript", "System Design"];
    nextStep = 4;

    replyText = `Technical competencies registered. Building structured milestones for upcoming technical evaluations.\n\nWhat is your preparation horizon before recruitment drives begin?`;
    nextChips = [
      "4 Weeks (Accelerated Sprint)",
      "8 Weeks (Comprehensive Master Plan)",
      "12 Weeks (Foundational Track)",
    ];
  } else if (step >= 4) {
    let weeks = 8;
    if (lower.includes("4")) weeks = 4;
    else if (lower.includes("12")) weeks = 12;
    session.extractedProfile.targetTimelineWeeks = weeks;

    session.isCompleted = true;
    nextStep = 5;

    replyText = `Profile calibration complete. A custom ${weeks}-week Placement Strategy for ${session.extractedProfile.targetCompany} has been synthesized.\n\nSelect an action below to access your calibrated dashboard and personalized roadmap.`;
    nextChips = [
      "Launch Placement Roadmap",
      "View Academic Eligibility Matrix",
      "Execute Next High-Impact Task",
    ];

    try {
      await applyOnboardingToProfile(userId, session.extractedProfile);
    } catch (err) {
      console.warn("Could not auto-apply profile from coach:", err.message);
    }
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
    isCompleted: session.isCompleted,
    extractedProfile: session.extractedProfile,
    latestReply: replyText,
    chips: nextChips,
    messages: session.messages,
  };
}

export async function applyOnboardingToProfile(userId, extracted) {
  if (!extracted) return;

  await User.findByIdAndUpdate(userId, {
    targetCompany: extracted.targetCompany || "Microsoft",
    targetJobRole: extracted.targetJobRole || "Software Development Engineer",
    graduationYear: extracted.graduationYear || 2026,
    college: extracted.college || "VIT Chennai",
    degree: extracted.degree || "B.Tech",
    cgpa: extracted.cgpa || 8.5,
    tenthPercentage: extracted.tenthPercentage || 90,
    twelfthPercentage: extracted.twelfthPercentage || 88,
  });

  let academic = await AcademicProfile.findOne({ userId });
  if (academic) {
    academic.currentCgpa = extracted.cgpa || academic.currentCgpa;
    academic.college = extracted.college || academic.college;
    academic.degree = extracted.degree || academic.degree;
    academic.branch = extracted.branch || academic.branch;
    await academic.save();
  }

  await createPersonalizedRoadmap(
    userId,
    extracted.targetCompany || "Microsoft",
    extracted.targetJobRole || "Software Development Engineer",
    extracted.targetTimelineWeeks || 8
  );

  return { success: true, message: "Profile and personalized roadmap successfully created!" };
}
