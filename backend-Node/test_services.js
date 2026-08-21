import assert from "node:assert/strict";
import {
  extractGitHubUsername,
  calculateGitHubProjectScore,
  formatGitHubProfileResponse,
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

  // 3. LeetCode Service Tests
  console.log("\n[3] LeetCode Service Tests");

  await test("extractLeetCodeUsername extracts username cleanly", () => {
    assert.equal(extractLeetCodeUsername("john_doe"), "john_doe");
    assert.equal(extractLeetCodeUsername("@john_doe"), "john_doe");
    assert.equal(extractLeetCodeUsername("https://leetcode.com/u/john_doe"), "john_doe");
    assert.equal(extractLeetCodeUsername("https://leetcode.com/john_doe/"), "john_doe");
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
    const archetype = classifyConsistencyArchetype(15, 45, 120, 2);
    assert.ok(archetype.name);
    assert.ok(archetype.badge);
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

  console.log("\n==========================================");
  console.log(`ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log("==========================================\n");
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
