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
          text: `👋 Hello ${userName}! I am your AI Career Coach & Placement Strategist. Let us construct your dream career profile and custom placement roadmap.\n\nFirst, what is your **primary dream company** and **target role**?`,
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

    replyText = `🎯 Excellent target! **${session.extractedProfile.targetCompany}** values solid algorithmic problem-solving and clean system fundamentals.\n\nNext, let us verify your **academic baseline**. What is your current college, degree, and current CGPA?`;
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

    replyText = `📚 Great! Academic score recorded: **${session.extractedProfile.cgpa || 8.5} CGPA**. This satisfies the academic cutoff for ${session.extractedProfile.targetCompany}!\n\nNow, let us sync your **coding profiles and tech skills**. Do you have LeetCode or GitHub handles, or key languages like C++, Java, Python, JavaScript?`;
    nextChips = [
      "LeetCode: tourist · C++, Python, DSA",
      "GitHub: octocat · React, Node.js, TypeScript",
      "Full Stack: React, Express, MongoDB, Java",
      "Primary: C++, DSA, OOPs, SQL",
    ];
  } else if (step === 3) {
    session.extractedProfile.primarySkills = ["Data Structures", "Algorithms", "C++", "JavaScript", "System Design"];
    nextStep = 4;

    replyText = `⚡ Awesome tech stack captured! You are building solid leverage for technical interview rounds.\n\nLastly, how many weeks do you have before your campus placement drive starts?`;
    nextChips = [
      "4 Weeks (Intensive Fast-Track Sprint)",
      "8 Weeks (Recommended Placement Master Plan)",
      "12 Weeks (Comprehensive Foundational Track)",
    ];
  } else if (step >= 4) {
    let weeks = 8;
    if (lower.includes("4")) weeks = 4;
    else if (lower.includes("12")) weeks = 12;
    session.extractedProfile.targetTimelineWeeks = weeks;

    session.isCompleted = true;
    nextStep = 5;

    replyText = `🎉 Congratulations! Your personalized profile and **${weeks}-week Placement Strategy** for **${session.extractedProfile.targetCompany}** have been synthesized!\n\nClick **"Launch My Placement Roadmap"** below to enter your customized dashboard.`;
    nextChips = [
      "🚀 Launch My Placement Roadmap",
      "📊 View Academic Eligibility Check",
      "⚡ Start 'What Should I Do Next?' Task",
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
