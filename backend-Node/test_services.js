import assert from "node:assert/strict";
import mongoose from "mongoose";
import {
  extractGitHubUsername,
  calculateGitHubProjectScore,
  formatGitHubProfileResponse,
  verifyLiveUrl,
} from "./services/githubService.js";

import {
  calculateTopicLevel,
  calculateTopicConfidence,
  calculateDifficultyMultiplier,
  getRequiredTopicLevel,
  getCompanyDsaBenchmarks,
  calculateDsaCompanyComparison,
  analyzeDsaProficiency,
} from "./services/dsaAnalysisService.js";
import {
  extractLeetCodeUsername,
  calculateLeetCodeDsaScore,
  calculateLeetCodeDsaLevel,
  getTopicProblemsSolved,
  classifyConsistencyArchetype,
  formatLeetCodeProfileResponse,
} from "./services/leetcodeService.js";
import {
  calculateGap,
  getStatusFromGap,
  getCompanyTier,
  buildLevelComparison,
} from "./services/levelGapService.js";
import {
  calculatePlacementReadiness,
} from "./services/readinessService.js";
import {
  READINESS_WEIGHTS,
  getStatusFromScore,
  getCompanyTargetBenchmark,
} from "./config/readinessWeights.js";
import { DSA_TOPICS, DSA_CATEGORIES } from "./config/dsaTaxonomy.js";
import DsaProgress from "./models/dsaProgressModel.js";

// Group C Services Imports
import {
  calculateTargetCgpaRequirement,
  evaluateAllCompaniesEligibility,
  COMPANY_ACADEMIC_BENCHMARKS,
} from "./services/academicService.js";
import { CURATED_STUDY_VIDEOS } from "./services/studyLibraryService.js";
import { MASTER_MILESTONES, checkAndAwardMilestones } from "./services/milestoneService.js";
import { getProgressAnalytics, logUserActivity } from "./services/progressService.js";
import { getNextRecommendedActions } from "./services/recommendationService.js";
import { ACTIVE_WEEKLY_CHALLENGES, getArenaLeaderboard } from "./services/arenaService.js";
import { queryJobs, normalizeRapidApiJob, calculateJobMatch } from "./services/jobService.js";

console.log("==========================================");
console.log("RUNNING GETPLACED BACKEND TEST SUITE");
console.log("==========================================");

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

async function runAllTests() {
  // 1. GitHub Service Tests
  console.log("\n[1] GitHub Service Tests");

  await test("extractGitHubUsername extracts username correctly from various formats", () => {
    assert.equal(extractGitHubUsername("octocat"), "octocat");
    assert.equal(extractGitHubUsername("@octocat"), "octocat");
    assert.equal(extractGitHubUsername("https://github.com/octocat"), "octocat");
    assert.equal(extractGitHubUsername("https://github.com/octocat/"), "octocat");
    assert.equal(extractGitHubUsername("https://github.com/octocat?tab=repositories"), "octocat");
    assert.equal(extractGitHubUsername("http://github.com/octocat"), "octocat");
    assert.equal(extractGitHubUsername(""), "");
  });

  await test("calculateGitHubProjectScore calculates realistic score", () => {
    const emptyScore = calculateGitHubProjectScore(null);
    assert.equal(emptyScore, 0);

    const activeProfile = {
      originalReposCount: 5,
      publicReposCount: 8,
      totalStars: 10,
      totalForks: 3,
      languages: [{ languageName: "JavaScript" }, { languageName: "Python" }, { languageName: "TypeScript" }],
      repositories: [
        { hasLiveDemo: true, description: "A cool project that does things", topics: ["react"] },
        { hasLiveDemo: true, description: "Another cool project", topics: ["node"] },
      ],
    };

    const score = calculateGitHubProjectScore(activeProfile);
    assert.ok(score >= 70, `Score should be >= 70, got ${score}`);
    assert.ok(score <= 100, `Score should be <= 100, got ${score}`);
  });

  await test("formatGitHubProfileResponse returns formatted response", () => {
    const profile = {
      username: "testuser",
      originalReposCount: 3,
      totalStars: 5,
      languages: [{ languageName: "JavaScript", repoCount: 3, percentage: 100 }],
      repositories: [],
      projectScore: 65,
    };
    const formatted = formatGitHubProfileResponse(profile);
    assert.equal(formatted.username, "testuser");
    assert.equal(formatted.scoreTier, "Solid");
    assert.equal(formatted.topLanguage.languageName, "JavaScript");
  });

  await test("verifyLiveUrl handles empty and malformed URLs gracefully", async () => {
    const emptyResult = await verifyLiveUrl("");
    assert.equal(emptyResult.isValid, false);
    assert.equal(emptyResult.isLive, false);

    const nullResult = await verifyLiveUrl(null);
    assert.equal(nullResult.isValid, false);
  });


  // 2. DSA Taxonomy and Analysis Tests
  console.log("\n[2] DSA Taxonomy & Analysis Service Tests");

  await test("DSA taxonomy contains categories and topics", () => {
    assert.ok(DSA_CATEGORIES.length >= 6, "Should have at least 6 categories");
    assert.ok(DSA_TOPICS.length >= 25, "Should have at least 25 canonical topics");
  });

  await test("calculateTopicLevel handles scale and edge cases", () => {
    assert.equal(calculateTopicLevel(0), null);
    assert.equal(calculateTopicLevel(-5), null);
    assert.ok(calculateTopicLevel(1) > 0);
    assert.ok(calculateTopicLevel(5) >= 5.0);
    assert.ok(calculateTopicLevel(20) >= 8.0);
    assert.ok(calculateTopicLevel(50) >= 9.5);
    assert.ok(calculateTopicLevel(100) <= 10.0);
  });

  await test("calculateTopicConfidence returns appropriate confidence %", () => {
    assert.equal(calculateTopicConfidence(0), 0);
    assert.equal(calculateTopicConfidence(1), 22);
    assert.equal(calculateTopicConfidence(2), 35);
    assert.ok(calculateTopicConfidence(5) >= 50);
    assert.ok(calculateTopicConfidence(15) >= 80);
  });

  await test("calculateDifficultyMultiplier calculates difficulty multiplier", () => {
    assert.equal(calculateDifficultyMultiplier(null), 1.0);
    const easyHeavy = { easySolved: 100, mediumSolved: 10, hardSolved: 0 };
    const hardHeavy = { easySolved: 10, mediumSolved: 50, hardSolved: 40 };
    const multEasy = calculateDifficultyMultiplier(easyHeavy);
    const multHard = calculateDifficultyMultiplier(hardHeavy);
    assert.ok(multEasy < multHard, `Easy multiplier (${multEasy}) should be less than Hard multiplier (${multHard})`);
  });

  await test("getCompanyDsaBenchmarks returns benchmarks for different tiers", () => {
    const tier1 = getCompanyDsaBenchmarks("Google", "SDE");
    const tier2 = getCompanyDsaBenchmarks("Swiggy", "SDE");
    const tier3 = getCompanyDsaBenchmarks("Infosys", "SE");

    assert.equal(tier1.tier, "tier1");
    assert.ok(tier1.total >= 300);
    assert.equal(tier2.tier, "tier2");
    assert.equal(tier3.tier, "tier3");
  });

  await test("analyzeDsaProficiency produces valid structure without errors", () => {
    const dummyUser = {
      _id: "user123",
      targetCompany: "Microsoft",
      targetJobRole: "Software Engineer",
      dsaScore: 75,
    };
    const dummyLeetCode = {
      username: "tourist",
      syncStatus: "synced",
      totalSolved: 250,
      easySolved: 80,
      mediumSolved: 130,
      hardSolved: 40,
      topicTags: [
        { tagSlug: "array", problemsSolved: 45 },
        { tagSlug: "dynamic-programming", problemsSolved: 25 },
        { tagSlug: "tree", problemsSolved: 20 },
      ],
    };

    const result = analyzeDsaProficiency(dummyUser, dummyLeetCode);
    assert.ok(result.isConnected);
    assert.equal(result.targetCompany, "Microsoft");
    assert.ok(result.summary.overallDsaLevel > 0);
    assert.ok(result.topics.length === DSA_TOPICS.length);
    assert.ok(result.categories.length === DSA_CATEGORIES.length);
  });

  await test("DsaProgress model schema supports sheetProgress items with solved and bookmark states", () => {
    const dummyProgress = new DsaProgress({
      userId: new mongoose.Types.ObjectId(),
      completedLectures: ["lec-1"],
      completedAssignments: ["assign-1"],
      sheetProgress: [
        {
          sheetId: "strivers-a2z-dsa-sheet",
          problemId: "two-sum",
          problemName: "Two Sum",
          difficulty: "Easy",
          solved: true,
          bookmarked: true,
          solvedAt: new Date(),
          bookmarkedAt: new Date(),
          leetcodeSlug: "two-sum",
        },
      ],
    });

    assert.equal(dummyProgress.sheetProgress.length, 1);
    assert.equal(dummyProgress.sheetProgress[0].problemId, "two-sum");
    assert.equal(dummyProgress.sheetProgress[0].solved, true);
    assert.equal(dummyProgress.sheetProgress[0].bookmarked, true);
    assert.equal(dummyProgress.sheetProgress[0].difficulty, "Easy");
  });

  // 3. LeetCode Service Tests
  console.log("\n[3] LeetCode Service Tests");

  await test("extractLeetCodeUsername extracts username cleanly from URLs, @ handles, and parameters", () => {
    assert.equal(extractLeetCodeUsername("john_doe"), "john_doe");
    assert.equal(extractLeetCodeUsername("@john_doe"), "john_doe");
    assert.equal(extractLeetCodeUsername("https://leetcode.com/u/john_doe"), "john_doe");
    assert.equal(extractLeetCodeUsername("https://leetcode.com/john_doe/"), "john_doe");
    assert.equal(extractLeetCodeUsername("http://leetcode.cn/u/john_doe/"), "john_doe");
    assert.equal(extractLeetCodeUsername("https://leetcode.com/u/john_doe?tab=overview#solutions"), "john_doe");
    assert.equal(extractLeetCodeUsername("   tourist   "), "tourist");
    assert.equal(extractLeetCodeUsername(""), "");
  });

  await test("calculateLeetCodeDsaScore computes balanced placement score", () => {
    const score = calculateLeetCodeDsaScore({
      easySolved: 50,
      mediumSolved: 100,
      hardSolved: 20,
      totalSolved: 170,
    });
    assert.ok(score >= 60 && score <= 100, `Expected score in 60-100 range, got ${score}`);
  });

  await test("calculateLeetCodeDsaLevel and getTopicProblemsSolved work correctly", () => {
    const profile = {
      easySolved: 50,
      mediumSolved: 100,
      hardSolved: 20,
      totalSolved: 170,
      topicTags: [
        { tagSlug: "dynamic-programming", problemsSolved: 25 },
        { tagSlug: "graph", problemsSolved: 15 },
      ],
    };
    const level = calculateLeetCodeDsaLevel(profile);
    assert.ok(level >= 6.0 && level <= 10.0, `Expected level >= 6.0, got ${level}`);

    const dpCount = getTopicProblemsSolved(profile, ["dynamic-programming", "dp"]);
    assert.equal(dpCount, 25);
  });

  await test("classifyConsistencyArchetype returns valid archetype", () => {
    const archetype = classifyConsistencyArchetype(15, 45, 120, {});
    assert.ok(archetype.name);
    assert.ok(archetype.badge);
  });

  await test("formatLeetCodeProfileResponse formats profile doc, computes dsaScore/level and preserves null contest fields", () => {
    const formatted = formatLeetCodeProfileResponse({
      username: "test_user",
      totalSolved: 150,
      easySolved: 60,
      mediumSolved: 70,
      hardSolved: 20,
      contest: { rating: null, globalRank: null },
      syncStatus: "synced",
    });
    assert.equal(formatted.username, "test_user");
    assert.equal(formatted.totalSolved, 150);
    assert.ok(formatted.dsaScore >= 80, `Expected dsaScore >= 80, got ${formatted.dsaScore}`);
    assert.ok(formatted.dsaLevel >= 8.0, `Expected dsaLevel >= 8.0, got ${formatted.dsaLevel}`);
    assert.equal(formatted.contest.rating, null);
    assert.equal(formatted.contest.globalRank, null);
  });

  // 4. Level Gap & Readiness Engine Tests
  console.log("\n[4] Level Gap & Readiness Engine Tests");

  await test("getCompanyTier identifies company tiers properly", () => {
    assert.equal(getCompanyTier("Google"), "tier1");
    assert.equal(getCompanyTier("Microsoft"), "tier1");
    assert.equal(getCompanyTier("Zomato"), "tier2");
    assert.equal(getCompanyTier("TCS"), "tier3");
    assert.equal(getCompanyTier("Infosys"), "tier3");
  });

  await test("calculateGap and getStatusFromGap evaluate correctly", () => {
    assert.equal(calculateGap(8.5, 7.0), 1.5);
    assert.equal(calculateGap(6.0, 8.0), -2.0);
    assert.equal(calculateGap(null, 8.0), null);

    assert.equal(getStatusFromGap(1.5).key, "above");
    assert.equal(getStatusFromGap(0.0).key, "meets");
    assert.equal(getStatusFromGap(-1.0).key, "needs_improvement");
    assert.equal(getStatusFromGap(null, "not_available").key, "not_analyzed");
  });

  await test("buildLevelComparison builds full comparison table", () => {
    const user = {
      targetCompany: "Amazon",
      targetJobRole: "Software Development Engineer",
      cgpa: 8.8,
      tenthPercentage: 90,
      twelfthPercentage: 88,
      dsaScore: 82,
      skillsScore: 78,
      projectsScore: 80,
    };

    const comparison = buildLevelComparison(user);
    assert.equal(comparison.targetCompany, "Amazon");
    assert.ok(comparison.allItems.length > 0);
    assert.ok(comparison.summary);
  });

  await test("calculatePlacementReadiness produces weighted readiness assessment", async () => {
    const user = {
      targetCompany: "Google",
      targetJobRole: "Software Engineer",
      cgpa: 8.5,
      dsaScore: 80,
      skillsScore: 75,
      projectsScore: 70,
      resumeScore: 85,
      communicationScore: 78,
      interviewScore: 82,
    };

    const result = await calculatePlacementReadiness(user);
    assert.ok(result.overallScore >= 0 && result.overallScore <= 100);
    assert.ok(Object.keys(result.dimensions).length >= 5);
    assert.equal(result.targetCompany, "Google");
  });

  // 5. Group C Feature Tests: Academics & Target Cutoff Engine (#28, #29)
  console.log("\n[5] Group C: Academics CGPA & Eligibility Engine Tests (#28, #29)");

  await test("calculateTargetCgpaRequirement computes required SGPA correctly", () => {
    // Current 7.8 over 5 semesters, target 8.5 over 8 semesters
    // (8.5 * 8 - 7.8 * 5) / 3 = (68.0 - 39.0) / 3 = 29.0 / 3 = 9.67
    const calc = calculateTargetCgpaRequirement(7.8, 5, 8, 8.5);
    assert.equal(calc.achievable, true);
    assert.equal(calc.remainingSemesters, 3);
    assert.equal(calc.requiredSgpaPerSem, 9.67);
    assert.ok(calc.maxPossibleCgpa >= 8.5);

    // Unattainable target (current 6.0 over 7 semesters, target 9.5 over 8)
    const impossibleCalc = calculateTargetCgpaRequirement(6.0, 7, 8, 9.5);
    assert.equal(impossibleCalc.achievable, false);
    assert.equal(impossibleCalc.difficultyLevel, "Impossible");

    // Boundary clamping: completed >= total (8/8) with target satisfied
    const completedAchieved = calculateTargetCgpaRequirement(8.5, 8, 8, 8.0);
    assert.equal(completedAchieved.remainingSemesters, 0);
    assert.equal(completedAchieved.achievable, true);
    assert.equal(completedAchieved.difficultyLevel, "Already Achieved");

    // Boundary clamping: completed >= total (8/8) with target not satisfied
    const completedNotAchieved = calculateTargetCgpaRequirement(7.5, 8, 8, 8.5);
    assert.equal(completedNotAchieved.remainingSemesters, 0);
    assert.equal(completedNotAchieved.achievable, false);
    assert.equal(completedNotAchieved.difficultyLevel, "No Remaining Semesters");
  });

  await test("evaluateAllCompaniesEligibility correctly filters 35+ companies", () => {
    const student = {
      currentCgpa: 8.2,
      tenthPercentage: 88,
      twelfthPercentage: 85,
      activeBacklogs: 0,
      historyOfBacklogs: 0,
      branch: "Computer Science & Engineering",
    };

    const evaluation = evaluateAllCompaniesEligibility(student);
    assert.ok(evaluation.totalEvaluated >= 15);
    assert.ok(evaluation.eligibleCount > 0);
    assert.ok(evaluation.eligibilityRatePct >= 50);

    const googleCheck = evaluation.companies.find((c) => c.company === "Google");
    assert.ok(googleCheck);
    assert.equal(googleCheck.status, "Eligible");
  });

  // 6. Group C Feature Tests: Study Library, Milestones & Arena (#33, #42, #43)
  console.log("\n[6] Group C: Study Library, Milestones & Arena Tests (#33, #42, #43)");

  await test("CURATED_STUDY_VIDEOS catalog has high-quality learning resources", () => {
    assert.ok(CURATED_STUDY_VIDEOS.length >= 10);
    const categories = new Set(CURATED_STUDY_VIDEOS.map((v) => v.category));
    assert.ok(categories.has("DSA"));
    assert.ok(categories.has("System Design"));
    assert.ok(categories.has("Core CS"));
  });

  await test("MASTER_MILESTONES catalog covers all readiness tiers and skills", () => {
    assert.ok(MASTER_MILESTONES.length >= 10);
    const tiers = MASTER_MILESTONES.filter((m) => m.category === "tier");
    assert.equal(tiers.length, 5); // Bronze, Silver, Gold, Platinum, Diamond
  });

  await test("ACTIVE_WEEKLY_CHALLENGES and Leaderboard data are populated", async () => {
    assert.ok(ACTIVE_WEEKLY_CHALLENGES.length >= 3);
    const leaderboard = await getArenaLeaderboard("user123");
    assert.ok(Array.isArray(leaderboard.topRankers));
  });

  await test("getNextRecommendedActions produces harmonized properties and streakDays", async () => {
    const dummyUser = {
      _id: new mongoose.Types.ObjectId(),
      targetCompany: "Microsoft",
      targetJobRole: "Software Engineer",
      cgpa: 8.5,
    };
    const result = await getNextRecommendedActions(dummyUser);
    assert.equal(typeof result.streakDays, "number");
    assert.ok(Array.isArray(result.recommendations));
    assert.ok(result.recommendations.length > 0);
    for (const rec of result.recommendations) {
      assert.ok(rec.categoryLabel, `rec ${rec.id} missing categoryLabel`);
      assert.ok(rec.badgeLabel, `rec ${rec.id} missing badgeLabel`);
      assert.ok(typeof rec.estimatedMinutes === "number", `rec ${rec.id} missing estimatedMinutes`);
      assert.ok(typeof rec.estimatedTime === "string", `rec ${rec.id} missing estimatedTime`);
    }
  });

  await test("checkAndAwardMilestones is exported and runs for users", async () => {
    assert.equal(typeof checkAndAwardMilestones, "function");
    const dummyUser = {
      _id: new mongoose.Types.ObjectId(),
      targetCompany: "Google",
      targetJobRole: "Software Engineer",
      cgpa: 8.8,
    };
    const milestonesData = await checkAndAwardMilestones(dummyUser._id.toString(), dummyUser);
    assert.ok(milestonesData);
    assert.equal(typeof milestonesData.totalXp, "number");
    assert.ok(milestonesData.totalMilestonesCount >= 10);
  });

  await test("getProgressAnalytics generates snapshots and computes overallScore", async () => {
    assert.equal(typeof getProgressAnalytics, "function");
    const dummyUser = {
      _id: new mongoose.Types.ObjectId(),
      targetCompany: "Microsoft",
      targetJobRole: "Software Engineer",
      cgpa: 8.5,
    };
    const analytics = await getProgressAnalytics(dummyUser._id.toString(), dummyUser);
    assert.ok(analytics);
    assert.equal(typeof analytics.overallScore, "number");
    assert.ok(Array.isArray(analytics.snapshots));
    assert.equal(typeof analytics.totalProblemsSolved, "number");
  });

  // 7. Group D Feature Tests: Jobs Market & RapidAPI Normalization (#72)
  console.log("\n[7] Group D: Jobs Market & RapidAPI Normalization Tests (#72)");

  await test("normalizeRapidApiJob accurately maps raw RapidAPI JSearch payloads", () => {
    const rawRapidJob = {
      job_id: "jsearch-123",
      job_title: "Senior Full Stack Engineer",
      employer_name: "Amazon",
      employer_logo: "https://example.com/amazon.png",
      job_city: "Bengaluru",
      job_country: "India",
      job_is_remote: false,
      job_employment_type: "FULLTIME",
      job_description: "Build high performance web applications using React, Node.js and AWS.",
      job_apply_link: "https://amazon.jobs/123",
      job_required_skills: ["React", "Node.js", "AWS", "TypeScript"],
      job_min_salary: 2000000,
      job_max_salary: 3500000,
      job_salary_currency: "INR",
    };

    const normalized = normalizeRapidApiJob(rawRapidJob);
    assert.equal(normalized.jobId, "jsearch-123");
    assert.equal(normalized.title, "Senior Full Stack Engineer");
    assert.equal(normalized.company, "Amazon");
    assert.equal(normalized.companyLogo, "https://example.com/amazon.png");
    assert.equal(normalized.workMode, "Hybrid");
    assert.equal(normalized.employmentType, "Full-time");
    assert.equal(normalized.applicationUrl, "https://amazon.jobs/123");
    assert.equal(normalized.applyUrl, "https://amazon.jobs/123");
    assert.deepEqual(normalized.skills, ["React", "Node.js", "AWS", "TypeScript"]);
    assert.equal(normalized.isVerified, true);
    assert.equal(normalized.isExpired, false);
  });

  await test("queryJobs applies combined filters (role, location, skills, search) properly", async () => {
    const resRoleInternship = await queryJobs({ role: "Internship" });
    assert.ok(resRoleInternship.success);
    assert.ok(resRoleInternship.jobs.length > 0);
    assert.ok(
      resRoleInternship.jobs.every(
        (j) => j.employmentType === "Internship" || j.roleCategory === "Internship"
      )
    );

    const resSkillSearch = await queryJobs({ skills: "React", search: "Engineer" });
    assert.ok(resSkillSearch.success);
    assert.ok(resSkillSearch.jobs.length > 0);
  });

  // 8. VTOP Integration & Study Material Service Tests
  console.log("\n[8] VTOP Integration & Study Material Service Tests");

  const { getGradePoints, computeSemesterWiseGPA } = await import("./services/vtopLiveAuthService.js");
  const { computeVtopPlacementImpact, getVtopAuthProtocolSummary } = await import("./services/vtopService.js");
  const { getStudyMaterialUrl } = await import("./services/vtopStudyMaterialService.js");

  await test("getGradePoints maps VIT grades accurately to 10-point scale", () => {
    assert.equal(getGradePoints("S"), 10.0);
    assert.equal(getGradePoints("A"), 9.0);
    assert.equal(getGradePoints("B"), 8.0);
    assert.equal(getGradePoints("C"), 7.0);
    assert.equal(getGradePoints("D"), 6.0);
    assert.equal(getGradePoints("E"), 5.0);
    assert.equal(getGradePoints("F"), 0.0);
    assert.equal(getGradePoints("N"), 0.0);
    assert.equal(getGradePoints("P"), null);
  });

  await test("computeSemesterWiseGPA groups courses and calculates SGPA and CGPA accurately", () => {
    const records = [
      { courseCode: "CSE1001", courseTitle: "Python", courseType: "Lab", credits: 4, grade: "S", semester: "Fall 2023" },
      { courseCode: "MAT1011", courseTitle: "Calculus", courseType: "Theory", credits: 4, grade: "A", semester: "Fall 2023" },
      { courseCode: "CSE2004", courseTitle: "DBMS", courseType: "Theory", credits: 4, grade: "A", semester: "Winter 2024" },
      { courseCode: "CSE2005", courseTitle: "OS", courseType: "Theory", credits: 4, grade: "B", semester: "Winter 2024" },
    ];

    const result = computeSemesterWiseGPA(records);
    assert.equal(result.semesters.length, 2);
    // Fall 2023: (10*4 + 9*4) / 8 = 76 / 8 = 9.5
    assert.equal(result.semesters[0].sgpa, 9.5);
    assert.equal(result.semesters[0].creditsEarned, 8);
    // Winter 2024: (9*4 + 8*4) / 8 = 68 / 8 = 8.5
    assert.equal(result.semesters[1].sgpa, 8.5);
    // Cumulative: (76 + 68) / 16 = 144 / 16 = 9.0
    assert.equal(result.cumulative.overallCgpa, 9.0);
    assert.equal(result.cumulative.totalEarnedCredits, 16);
  });

  await test("getStudyMaterialUrl routes subjects to exact vhelpcc.com study material pages", () => {
    assert.equal(getStudyMaterialUrl("CSE2004", "Database Management Systems"), "https://www.vhelpcc.com/study-material/dbms");
    assert.equal(getStudyMaterialUrl("CSE2005", "Operating Systems"), "https://www.vhelpcc.com/study-material/operating-systems");
    assert.equal(getStudyMaterialUrl("CSE3001", "Computer Networks"), "https://www.vhelpcc.com/study-material/computer-networks");
    assert.equal(getStudyMaterialUrl("CSE2003", "Data Structures and Algorithms"), "https://www.vhelpcc.com/study-material/data-structures-and-algorithms");
    assert.equal(getStudyMaterialUrl("CSE3002", "Theory of Computation"), "https://www.vhelpcc.com/study-material/theory-of-computation");
    assert.equal(getStudyMaterialUrl("BCSE302L", "Database Systems"), "https://www.vhelpcc.com/study-material/dbms");
  });

  await test("computeVtopPlacementImpact safely handles missing or non-synced profiles without mock assumptions", () => {
    assert.equal(computeVtopPlacementImpact(null), null);

    const emptyProfile = {
      currentCgpa: null,
      activeBacklogs: 0,
      historyOfBacklogs: 0,
      overallAttendancePercentage: null,
      totalCreditsEarned: null,
      totalCreditsRequired: null,
      semesters: [],
    };
    const impact = computeVtopPlacementImpact(emptyProfile);
    assert.equal(impact.cgpa, null);
    assert.equal(impact.overallAttendance, null);
    assert.equal(impact.superDreamEligible, false);
    assert.equal(impact.placementAcademicScore, null);
  });

  await test("getVtopAuthProtocolSummary returns multi-step technical workflow", () => {
    const summary = getVtopAuthProtocolSummary();
    assert.ok(summary.steps.length >= 6);
    assert.equal(summary.steps[0].endpoint, "POST /vtop/prelogin/setup");
  });

  console.log("\n==========================================");
  console.log(`ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log("==========================================\n");
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
