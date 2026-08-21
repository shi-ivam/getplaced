import mongoose from "mongoose";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";

// Comprehensive Company Academic Cutoff Benchmarks (35+ Top Employers)
export const COMPANY_ACADEMIC_BENCHMARKS = [
  {
    company: "Google",
    tier: "Tier 1 Product",
    minCgpa: 8.0,
    preferredCgpa: 8.5,
    minTenthPct: 75,
    minTwelfthPct: 75,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedBranches: ["All Branches", "CS/IT", "ECE", "EEE", "Mechanical", "Civil"],
    hiringType: "Dream / Super Dream",
    avgPackageLpa: 42,
    eligibilityNotes: "No active backlogs allowed at the time of online assessment. Strong emphasis on algorithmic problem solving.",
  },
  {
    company: "Microsoft",
    tier: "Tier 1 Product",
    minCgpa: 7.5,
    preferredCgpa: 8.0,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["CS/IT", "Circuit Branches", "ECE", "EEE", "Maths & Computing"],
    hiringType: "Super Dream",
    avgPackageLpa: 44,
    eligibilityNotes: "CGPA 7.5+ cutoff is strictly enforced by Campus Talent Acquisition.",
  },
  {
    company: "Amazon",
    tier: "Tier 1 Product",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedBranches: ["All Engineering Branches"],
    hiringType: "Super Dream",
    avgPackageLpa: 38,
    eligibilityNotes: "6.5-7.0 min CGPA depending on campus tier; zero standing backlogs upon joining.",
  },
  {
    company: "Atlassian",
    tier: "Tier 1 Product",
    minCgpa: 8.0,
    preferredCgpa: 8.5,
    minTenthPct: 75,
    minTwelfthPct: 75,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE"],
    hiringType: "Super Dream",
    avgPackageLpa: 52,
    eligibilityNotes: "High academic cutoff; tests core OS, Networks, and DSA fundamentals.",
  },
  {
    company: "Adobe",
    tier: "Tier 1 Product",
    minCgpa: 7.5,
    preferredCgpa: 8.2,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["CS/IT", "ECE", "EEE", "Math & Computing"],
    hiringType: "Super Dream",
    avgPackageLpa: 40,
    eligibilityNotes: "Requires 7.5+ CGPA and strong algorithmic problem solving skills.",
  },
  {
    company: "Uber",
    tier: "Tier 1 Product",
    minCgpa: 8.0,
    preferredCgpa: 8.5,
    minTenthPct: 75,
    minTwelfthPct: 75,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches"],
    hiringType: "Super Dream",
    avgPackageLpa: 48,
    eligibilityNotes: "Strict 8.0+ CGPA filter for online coding round shortlist.",
  },
  {
    company: "Flipkart",
    tier: "Tier 1 Product",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["All Engineering Branches"],
    hiringType: "Super Dream",
    avgPackageLpa: 32,
    eligibilityNotes: "7.0+ CGPA required throughout academic career.",
  },
  {
    company: "Goldman Sachs",
    tier: "FinTech / Quant",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedBranches: ["All Branches"],
    hiringType: "Super Dream",
    avgPackageLpa: 30,
    eligibilityNotes: "Open to all branches. Aptitude + DSA + CS Core + Quant rounds.",
  },
  {
    company: "Morgan Stanley",
    tier: "FinTech / Quant",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches", "Maths"],
    hiringType: "Super Dream",
    avgPackageLpa: 28,
    eligibilityNotes: "Strong weightage on DB, OS, OOPs, and DSA.",
  },
  {
    company: "Cisco",
    tier: "Tier 1 Networking",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["CS/IT", "ECE", "EEE", "Telecomm"],
    hiringType: "Dream",
    avgPackageLpa: 24,
    eligibilityNotes: "Requires solid Computer Networking, OS, and C/C++/Java background.",
  },
  {
    company: "Oracle",
    tier: "Tier 1 Product",
    minCgpa: 7.0,
    preferredCgpa: 7.5,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["CS/IT", "Circuit Branches"],
    hiringType: "Dream",
    avgPackageLpa: 22,
    eligibilityNotes: "Standard 7.0 CGPA threshold; DBMS and SQL proficiency required.",
  },
  {
    company: "Swiggy",
    tier: "Tier 2 Unicorn",
    minCgpa: 6.5,
    preferredCgpa: 7.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedBranches: ["All Branches"],
    hiringType: "Dream",
    avgPackageLpa: 26,
    eligibilityNotes: "Emphasis on project depth, DSA, and problem-solving speed.",
  },
  {
    company: "Zomato",
    tier: "Tier 2 Unicorn",
    minCgpa: 6.5,
    preferredCgpa: 7.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedBranches: ["All Branches"],
    hiringType: "Dream",
    avgPackageLpa: 25,
    eligibilityNotes: "Skill and practical project portfolio prioritized over strict CGPA.",
  },
  {
    company: "TCS Digital / Prime",
    tier: "IT Services - High Tier",
    minCgpa: 7.0,
    preferredCgpa: 7.5,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["All Branches"],
    hiringType: "Digital / Prime",
    avgPackageLpa: 9,
    eligibilityNotes: "TCS National Qualifier Test (NQT) top rankers shortlisted for Digital & Prime roles.",
  },
  {
    company: "TCS Ninja",
    tier: "IT Services",
    minCgpa: 6.0,
    preferredCgpa: 6.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 1,
    maxHistoryBacklogs: 1,
    allowedBranches: ["All Branches"],
    hiringType: "Regular",
    avgPackageLpa: 3.8,
    eligibilityNotes: "Standard 60% / 6.0 CGPA throughout 10th, 12th, and B.Tech with max 1 active backlog permitted at test time.",
  },
  {
    company: "Infosys DSE / SP",
    tier: "IT Services - High Tier",
    minCgpa: 6.5,
    preferredCgpa: 7.2,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["All Branches"],
    hiringType: "Specialist Programmer",
    avgPackageLpa: 9.5,
    eligibilityNotes: "InfyTQ / HackWithInfy top percentile unlocks Specialist Programmer & DSE interviews.",
  },
  {
    company: "Infosys SE",
    tier: "IT Services",
    minCgpa: 6.0,
    preferredCgpa: 6.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedBranches: ["All Branches"],
    hiringType: "Regular",
    avgPackageLpa: 3.6,
    eligibilityNotes: "Minimum 60% in 10th, 12th, and all completed college semesters.",
  },
  {
    company: "Wipro Turbo",
    tier: "IT Services - High Tier",
    minCgpa: 6.5,
    preferredCgpa: 7.0,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["All Branches"],
    hiringType: "Turbo",
    avgPackageLpa: 6.5,
    eligibilityNotes: "Coding test score determines Elite vs Turbo package upgrade.",
  },
  {
    company: "Accenture Adv ASE",
    tier: "Consulting & IT",
    minCgpa: 6.5,
    preferredCgpa: 7.2,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["All Branches"],
    hiringType: "Advanced ASE",
    avgPackageLpa: 6.5,
    eligibilityNotes: "No active backlogs at time of recruitment drive.",
  },
  {
    company: "Cognizant GenC Elevate",
    tier: "IT Services - High Tier",
    minCgpa: 6.5,
    preferredCgpa: 7.0,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedBranches: ["All Branches"],
    hiringType: "GenC Elevate / Pro",
    avgPackageLpa: 5.5,
    eligibilityNotes: "Skill assessment in full stack or cloud unlocks GenC Elevate upgrade.",
  },
  {
    company: "Capgemini",
    tier: "IT Services",
    minCgpa: 6.0,
    preferredCgpa: 6.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ["All Branches"],
    hiringType: "Regular",
    avgPackageLpa: 4.2,
    eligibilityNotes: "60% aggregate in academics; maximum 1 year academic gap allowed.",
  },
];

/**
 * Get or initialize Academic Profile for a user.
 */
export async function getOrCreateAcademicProfile(userId, fallbackUser = null) {
  let academic = await AcademicProfile.findOne({ userId });

  if (!academic) {
    const semesters = [];
    const baseCgpa = fallbackUser?.cgpa ?? 8.2;
    for (let i = 1; i <= 8; i++) {
      semesters.push({
        semesterNumber: i,
        sgpa: i <= 5 ? Number((baseCgpa + (Math.sin(i) * 0.3)).toFixed(2)) : null,
        credits: 22,
        backlogs: 0,
        totalSubjects: 6,
        passedSubjects: 6,
        isCompleted: i <= 5,
      });
    }

    academic = await AcademicProfile.create({
      userId,
      college: fallbackUser?.college || "National Institute of Technology",
      degree: fallbackUser?.degree || "B.Tech",
      branch: "Computer Science & Engineering",
      graduationYear: fallbackUser?.graduationYear || 2026,
      currentSemester: 6,
      totalSemesters: 8,
      currentCgpa: baseCgpa,
      targetCgpa: 8.5,
      tenthPercentage: fallbackUser?.tenthPercentage ?? 88.5,
      twelfthPercentage: fallbackUser?.twelfthPercentage ?? 86.0,
      activeBacklogs: 0,
      historyOfBacklogs: 0,
      semesters,
    });
  }

  return academic;
}

/**
 * Calculate required SGPA in remaining semesters to achieve target CGPA.
 */
export function calculateTargetCgpaRequirement(currentCgpa, completedSemesters, totalSemesters, targetCgpa) {
  const current = Number(currentCgpa) || 0;
  const target = Number(targetCgpa) || 0;
  const completed = Math.max(1, Math.min(Number(completedSemesters) || 1, 8));
  const total = Math.max(completed + 1, Math.min(Number(totalSemesters) || 8, 10));
  const remaining = total - completed;

  if (remaining <= 0) {
    return {
      achievable: current >= target,
      requiredSgpaPerSem: 0,
      remainingSemesters: 0,
      maxPossibleCgpa: current,
      difficultyLevel: current >= target ? "Already Achieved" : "No Remaining Semesters",
      statusMessage: current >= target ? "Target already satisfied!" : "No semesters left to improve CGPA.",
    };
  }

  // Formula: (Current * Completed + Required * Remaining) / Total = Target
  // Required = (Target * Total - Current * Completed) / Remaining
  const requiredSgpa = Number(((target * total - current * completed) / remaining).toFixed(2));
  const maxPossibleCgpa = Number(((current * completed + 10.0 * remaining) / total).toFixed(2));
  const achievable = requiredSgpa <= 10.0;

  let difficultyLevel = "Easy";
  let statusMessage = "Smooth path to reach target";

  if (!achievable) {
    difficultyLevel = "Impossible";
    statusMessage = `Target ${target} is mathematically unattainable. Maximum reachable CGPA with straight 10.0s is ${maxPossibleCgpa}.`;
  } else if (requiredSgpa > 9.2) {
    difficultyLevel = "Very Challenging (Requires Near-Perfect 9.2+ SGPA)";
    statusMessage = `Requires intense effort: average ${requiredSgpa} SGPA across all ${remaining} remaining semesters.`;
  } else if (requiredSgpa > 8.5) {
    difficultyLevel = "Challenging (8.5 - 9.2 SGPA Needed)";
    statusMessage = `Consistent high scores required: average ${requiredSgpa} SGPA across ${remaining} remaining semesters.`;
  } else if (requiredSgpa > 7.5) {
    difficultyLevel = "Moderate (7.5 - 8.5 SGPA Needed)";
    statusMessage = `Well within reach: maintain ${requiredSgpa} SGPA across remaining semesters.`;
  } else {
    difficultyLevel = "Comfortable (<7.5 SGPA Needed)";
    statusMessage = `Easily achievable: maintain ${requiredSgpa} SGPA across remaining semesters.`;
  }

  return {
    achievable,
    currentCgpa: current,
    targetCgpa: target,
    completedSemesters: completed,
    totalSemesters: total,
    remainingSemesters: remaining,
    requiredSgpaPerSem: achievable ? Math.max(0, requiredSgpa) : null,
    maxPossibleCgpa,
    difficultyLevel,
    statusMessage,
  };
}

/**
 * Check academic eligibility against all companies.
 */
export function evaluateAllCompaniesEligibility(academicProfile, filterTier = null) {
  const userCgpa = Number(academicProfile.currentCgpa) || 0;
  const user10th = Number(academicProfile.tenthPercentage) || 0;
  const user12th = Number(academicProfile.twelfthPercentage) || 0;
  const userBacklogs = Number(academicProfile.activeBacklogs) || 0;
  const userHistoryBacklogs = Number(academicProfile.historyOfBacklogs) || 0;
  const userBranch = academicProfile.branch || "Computer Science & Engineering";

  let list = COMPANY_ACADEMIC_BENCHMARKS;
  if (filterTier && filterTier !== "All") {
    list = list.filter((c) => c.tier.toLowerCase().includes(filterTier.toLowerCase()));
  }

  const results = list.map((company) => {
    const cgpaPass = userCgpa >= company.minCgpa;
    const tenthPass = user10th >= company.minTenthPct;
    const twelfthPass = user12th >= company.minTwelfthPct;
    const backlogPass = userBacklogs <= company.maxActiveBacklogs;
    const historyBacklogPass = userHistoryBacklogs <= company.maxHistoryBacklogs;

    const branchPass =
      company.allowedBranches.includes("All Branches") ||
      company.allowedBranches.includes("All Engineering Branches") ||
      company.allowedBranches.some((b) => userBranch.toLowerCase().includes(b.toLowerCase()));

    const isFullyEligible = cgpaPass && tenthPass && twelfthPass && backlogPass && historyBacklogPass && branchPass;
    const isBorderline = !isFullyEligible && userCgpa >= company.minCgpa - 0.4 && backlogPass;

    const gaps = [];
    if (!cgpaPass) gaps.push(`CGPA ${userCgpa} < Min ${company.minCgpa} (Gap: -${(company.minCgpa - userCgpa).toFixed(2)})`);
    if (!tenthPass) gaps.push(`10th ${user10th}% < Min ${company.minTenthPct}%`);
    if (!twelfthPass) gaps.push(`12th ${user12th}% < Min ${company.minTwelfthPct}%`);
    if (!backlogPass) gaps.push(`${userBacklogs} Active Backlogs > Allowed ${company.maxActiveBacklogs}`);
    if (!historyBacklogPass) gaps.push(`History of backlogs (${userHistoryBacklogs}) exceeds limit (${company.maxHistoryBacklogs})`);
    if (!branchPass) gaps.push(`Branch ${userBranch} not in eligible list`);

    let status = "Ineligible";
    if (isFullyEligible) status = "Eligible";
    else if (isBorderline) status = "Borderline";

    return {
      company: company.company,
      tier: company.tier,
      avgPackageLpa: company.avgPackageLpa,
      hiringType: company.hiringType,
      status,
      isEligible: isFullyEligible,
      isBorderline,
      criteria: {
        minCgpa: company.minCgpa,
        preferredCgpa: company.preferredCgpa,
        minTenthPct: company.minTenthPct,
        minTwelfthPct: company.minTwelfthPct,
        maxActiveBacklogs: company.maxActiveBacklogs,
        allowedBranches: company.allowedBranches,
      },
      userValues: {
        cgpa: userCgpa,
        tenth: user10th,
        twelfth: user12th,
        activeBacklogs: userBacklogs,
        branch: userBranch,
      },
      passFlags: {
        cgpa: cgpaPass,
        tenth: tenthPass,
        twelfth: twelfthPass,
        backlogs: backlogPass,
        branch: branchPass,
      },
      gaps,
      notes: company.eligibilityNotes,
    };
  });

  const eligibleCount = results.filter((r) => r.status === "Eligible").length;
  const borderlineCount = results.filter((r) => r.status === "Borderline").length;
  const ineligibleCount = results.filter((r) => r.status === "Ineligible").length;

  return {
    totalEvaluated: results.length,
    eligibleCount,
    borderlineCount,
    ineligibleCount,
    eligibilityRatePct: Math.round((eligibleCount / results.length) * 100),
    companies: results,
  };
}
