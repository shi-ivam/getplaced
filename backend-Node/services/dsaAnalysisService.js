import {
  DSA_CATEGORIES,
  DSA_TOPICS,
  TOPIC_BY_ID_MAP,
  LEETCODE_SLUG_TO_TOPICS_MAP,
  mapLeetCodeTagToTopics,
} from "../config/dsaTaxonomy.js";
import { getCompanyTier } from "./levelGapService.js";
import User from "../models/userModel.js";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";

/**
 * Calculates a non-linear topic proficiency level on a 0.0 to 10.0 scale.
 * 
 * Incorporates problem volume and candidate difficulty bias (Easy=1, Medium=2.5, Hard=5.0).
 *
 * @param {number} problemsSolved - Total topic problems solved
 * @param {number} diffWeight - Candidate difficulty distribution multiplier (normalized around ~1.0)
 * @returns {number|null} Level from 0.0 to 10.0, or null if 0 problems
 */
export const calculateTopicLevel = (problemsSolved, diffWeight = 1.0) => {
  const count = Number(problemsSolved) || 0;
  if (count <= 0) return null;

  // Scale problem volume by candidate's difficulty weight factor
  const effectiveCount = Math.max(0.5, count * Math.max(0.6, Math.min(2.2, diffWeight)));

  let rawLevel;
  if (effectiveCount <= 1) {
    rawLevel = 2.4;
  } else if (effectiveCount <= 2) {
    rawLevel = 3.4;
  } else if (effectiveCount < 6) {
    // 3 - 5 problems: 4.2 to 5.8
    rawLevel = 4.2 + (effectiveCount - 3) * 0.55;
  } else if (effectiveCount < 12) {
    // 6 - 11 problems: 6.0 to 7.6
    rawLevel = 6.0 + (effectiveCount - 6) * 0.28;
  } else if (effectiveCount < 24) {
    // 12 - 23 problems: 7.7 to 8.9
    rawLevel = 7.7 + (effectiveCount - 12) * 0.105;
  } else if (effectiveCount < 40) {
    // 24 - 39 problems: 9.0 to 9.7
    rawLevel = 9.0 + (effectiveCount - 24) * 0.045;
  } else {
    // 40+ problems: 9.7 to 10.0
    rawLevel = Math.min(10.0, 9.7 + (effectiveCount - 40) * 0.015);
  }

  return Math.min(10.0, Math.max(0.0, Math.round(rawLevel * 10) / 10));
};

/**
 * Calculates evidence confidence percentage (0% to 100%) based on problem volume density.
 *
 * Rules:
 * - 0 problems: 0%
 * - 1-2 problems: 20-35% (insufficient data / preliminary)
 * - 3-9 problems: 40-75% (available)
 * - 10+ problems: 80-95%+ (high confidence)
 *
 * @param {number} problemsSolved - Count of solved problems in this topic
 * @returns {number} Confidence percentage from 0 to 100
 */
export const calculateTopicConfidence = (problemsSolved) => {
  const count = Number(problemsSolved) || 0;
  if (count <= 0) return 0;
  if (count === 1) return 22;
  if (count === 2) return 35;
  if (count < 5) return Math.round(40 + (count - 2) * 6.5); // 3 -> 47%, 4 -> 53%
  if (count < 10) return Math.round(55 + (count - 4) * 4.2); // 5 -> 59%, 9 -> 76%
  if (count < 20) return Math.round(78 + (count - 10) * 1.6); // 10 -> 78%, 19 -> 92%
  return Math.min(98, Math.round(93 + Math.min(count - 20, 15) * 0.35));
};

/**
 * Calculates difficulty multiplier based on candidate's overall LeetCode problem difficulty mix.
 *
 * Weights:
 * - Easy: 1.0
 * - Medium: 2.5
 * - Hard: 5.0
 *
 * Baseline medium bar = 2.0
 *
 * @param {Object} leetcodeProfile - Synced LeetCode profile
 * @returns {number} Difficulty multiplier (~0.7 to ~1.8)
 */
export const calculateDifficultyMultiplier = (leetcodeProfile) => {
  if (!leetcodeProfile) return 1.0;

  const easy = Number(leetcodeProfile.easySolved ?? leetcodeProfile.problemsSolved?.easy ?? 0);
  const medium = Number(leetcodeProfile.mediumSolved ?? leetcodeProfile.problemsSolved?.medium ?? 0);
  const hard = Number(leetcodeProfile.hardSolved ?? leetcodeProfile.problemsSolved?.hard ?? 0);
  const total = easy + medium + hard;

  if (total <= 0) return 1.0;

  const weightedSum = easy * 1.0 + medium * 2.5 + hard * 5.0;
  const avgDifficultyWeight = weightedSum / total;

  // Normalize around 2.0 (Medium benchmark)
  return Math.max(0.6, Math.min(2.2, avgDifficultyWeight / 2.0));
};

/**
 * Derives required topic level benchmark based on target company, role, tier, and company requirements.
 *
 * @param {Object} topic - Canonical topic definition
 * @param {string} targetCompany - User target company
 * @param {string} targetJobRole - User target job role
 * @param {Object|null} companyRequirement - Company requirement document from DB
 * @returns {number|null} Target benchmark level (0.0 to 10.0) or null if no target
 */
export const getRequiredTopicLevel = (
  topic,
  targetCompany = "",
  targetJobRole = "",
  companyRequirement = null
) => {
  const hasTarget = Boolean(targetCompany?.trim() || targetJobRole?.trim());
  if (!hasTarget) {
    return null;
  }

  const tier = getCompanyTier(targetCompany);
  let baseRequired = topic.defaultRequiredLevel;

  // Tier 1 company boosts (FAANG / Top Tier)
  if (tier === "tier1") {
    if (["core", "trees", "graphs", "dynamic-programming"].includes(topic.categoryId)) {
      baseRequired = Math.min(10.0, baseRequired + 0.6);
    } else {
      baseRequired = Math.min(10.0, baseRequired + 0.4);
    }
  } else if (tier === "tier3") {
    // Tier 3 mass hiring / service firms
    if (["core", "searching"].includes(topic.categoryId)) {
      baseRequired = Math.max(6.0, baseRequired - 1.0);
    } else {
      baseRequired = Math.max(5.5, baseRequired - 1.5);
    }
  }

  // Company requirement database overrides
  if (companyRequirement?.dsaExpectation?.level) {
    const expectation = companyRequirement.dsaExpectation.level;
    if (expectation === "Very Hard") {
      baseRequired = Math.min(10.0, baseRequired + 1.0);
    } else if (expectation === "Hard") {
      baseRequired = Math.min(10.0, baseRequired + 0.5);
    } else if (expectation === "Easy") {
      baseRequired = Math.max(5.5, baseRequired - 1.0);
    }
  }

  return Math.round(baseRequired * 10) / 10;
};

/**
 * Builds explainable human-readable evidence points for a topic.
 *
 * @param {number} solvedCount - Total problems solved in topic
 * @param {number} easyEst - Estimated easy problems
 * @param {number} medEst - Estimated medium problems
 * @param {number} hardEst - Estimated hard problems
 * @param {Object} topic - Canonical topic definition
 * @param {string} dataAvailability - Availability status
 * @returns {string[]} Array of human-readable evidence bullets
 */
export const generateTopicEvidence = (
  solvedCount,
  easyEst,
  medEst,
  hardEst,
  topic,
  dataAvailability
) => {
  if (dataAvailability === "not_available" || solvedCount === 0) {
    return [
      `No problems recorded for ${topic.name} on connected LeetCode profile.`,
      `Recommended starting patterns: ${topic.recommendedPatterns.slice(0, 2).join(", ")}.`,
    ];
  }

  const evidence = [];

  // Problem volume bullet
  evidence.push(
    `${solvedCount} problem${solvedCount === 1 ? "" : "s"} solved in ${topic.name}.`
  );

  // Difficulty distribution bullet
  if (solvedCount >= 2) {
    const diffParts = [];
    if (hardEst > 0) diffParts.push(`${hardEst} Hard`);
    if (medEst > 0) diffParts.push(`${medEst} Medium`);
    if (easyEst > 0) diffParts.push(`${easyEst} Easy`);

    if (diffParts.length > 0) {
      evidence.push(`Estimated distribution: ${diffParts.join(", ")}.`);
    }
  }

  // Topic mastery depth
  if (solvedCount >= 15) {
    evidence.push(
      `Strong topic mastery with high pattern coverage across ${topic.category} implementations.`
    );
  } else if (solvedCount >= 8) {
    evidence.push(
      `Solid foundational grasp. Advance by solving 5+ more Medium/Hard ${topic.name} problems.`
    );
  } else if (dataAvailability === "insufficient_data") {
    evidence.push(
      `Preliminary estimate from ${solvedCount} problem${solvedCount === 1 ? "" : "s"}. Solve 3+ more to establish reliable proficiency confidence.`
    );
  }

  return evidence;
};

/**
 * Evaluates full DSA topic-level proficiency analysis for a user.
 *
 * @param {Object} user - User document
 * @param {Object|null} leetcodeProfile - Synced LeetCode profile document
 * @param {Object|null} companyRequirement - Target company requirement document
 * @returns {Object} Comprehensive normalized DSA topic proficiency analysis
 */
export const analyzeDsaProficiency = (
  user,
  leetcodeProfile = null,
  companyRequirement = null
) => {
  const targetCompany = user?.targetCompany?.trim() || "";
  const targetJobRole = user?.targetJobRole?.trim() || "";
  const hasTarget = Boolean(targetCompany || targetJobRole);

  const isConnected = Boolean(
    leetcodeProfile &&
      leetcodeProfile.syncStatus === "synced" &&
      (leetcodeProfile.totalSolved > 0 || leetcodeProfile.username)
  );

  const diffMultiplier = isConnected
    ? calculateDifficultyMultiplier(leetcodeProfile)
    : 1.0;

  const totalProfileSolved = isConnected
    ? Number(leetcodeProfile.totalSolved ?? leetcodeProfile.problemsSolved?.total ?? 0)
    : 0;
  const easyProfileSolved = isConnected
    ? Number(leetcodeProfile.easySolved ?? leetcodeProfile.problemsSolved?.easy ?? 0)
    : 0;
  const medProfileSolved = isConnected
    ? Number(leetcodeProfile.mediumSolved ?? leetcodeProfile.problemsSolved?.medium ?? 0)
    : 0;
  const hardProfileSolved = isConnected
    ? Number(leetcodeProfile.hardSolved ?? leetcodeProfile.problemsSolved?.hard ?? 0)
    : 0;

  // Build lookup of LeetCode tag problem counts
  const tagCountMap = new Map();
  if (isConnected && Array.isArray(leetcodeProfile.topicTags)) {
    for (const tag of leetcodeProfile.topicTags) {
      if (tag?.tagSlug) {
        const slug = tag.tagSlug.toLowerCase().trim();
        const solved = Number(tag.problemsSolved) || 0;
        tagCountMap.set(slug, solved);
      }
    }
  }

  // Analyze each topic in the taxonomy
  const analyzedTopics = DSA_TOPICS.map((topic) => {
    // Determine problems solved for this topic from matching LeetCode slugs
    let solvedCount = 0;
    if (isConnected) {
      const slugCounts = topic.leetcodeSlugs.map((slug) => tagCountMap.get(slug.toLowerCase()) || 0);
      solvedCount = Math.max(0, ...slugCounts);
    }

    // Determine data availability
    let dataAvailability = "not_available";
    if (solvedCount === 0) {
      dataAvailability = "not_available";
    } else if (solvedCount <= 2) {
      dataAvailability = "insufficient_data";
    } else {
      dataAvailability = "available";
    }

    // Calculate current level (0.0 to 10.0)
    const currentLevel = calculateTopicLevel(solvedCount, diffMultiplier);

    // Calculate confidence (0% to 100%)
    const confidence = calculateTopicConfidence(solvedCount);

    // Estimate problem difficulty breakdown
    const easyRatio = totalProfileSolved > 0 ? easyProfileSolved / totalProfileSolved : 0.35;
    const medRatio = totalProfileSolved > 0 ? medProfileSolved / totalProfileSolved : 0.50;
    const easyEst = solvedCount > 0 ? Math.round(solvedCount * easyRatio) : 0;
    const medEst = solvedCount > 0 ? Math.round(solvedCount * medRatio) : 0;
    const hardEst = solvedCount > 0 ? Math.max(0, solvedCount - easyEst - medEst) : 0;

    // Determine required level from target
    const requiredLevel = getRequiredTopicLevel(
      topic,
      targetCompany,
      targetJobRole,
      companyRequirement
    );

    // Calculate gap: gap = currentLevel - requiredLevel
    let gap = null;
    let status = "not_analyzed";
    let statusLabel = "Not Analyzed";

    if (currentLevel !== null && requiredLevel !== null) {
      gap = Math.round((currentLevel - requiredLevel) * 10) / 10;
      if (gap > 0) {
        status = "above_requirement";
        statusLabel = "Above Bar";
      } else if (gap === 0) {
        status = "meets_requirement";
        statusLabel = "Meets Bar";
      } else if (gap > -2.0) {
        status = "needs_improvement";
        statusLabel = "Needs Improvement";
      } else {
        status = "major_gap";
        statusLabel = "Major Gap";
      }
    } else if (currentLevel !== null && requiredLevel === null) {
      status = "assessed_no_target";
      statusLabel = "Assessed";
    } else if (dataAvailability === "insufficient_data") {
      status = "insufficient_data";
      statusLabel = "Needs More Data";
    }

    // Generate explainable evidence
    const evidence = generateTopicEvidence(
      solvedCount,
      easyEst,
      medEst,
      hardEst,
      topic,
      dataAvailability
    );

    return {
      id: topic.id,
      name: topic.name,
      category: topic.category,
      categoryId: topic.categoryId,
      description: topic.description,
      importance: topic.importance,
      recommendedPatterns: topic.recommendedPatterns,
      problemsSolved: {
        total: solvedCount,
        easy: easyEst,
        medium: medEst,
        hard: hardEst,
      },
      currentLevel,
      requiredLevel,
      gap,
      status,
      statusLabel,
      confidence,
      dataAvailability,
      evidence,
      actionLink: isConnected ? "/app/interview" : "/app/profile",
      actionLabel: isConnected ? `Practice ${topic.name}` : "Connect LeetCode",
    };
  });

  // Calculate Summary Metrics
  const activeTopics = analyzedTopics.filter((t) => t.dataAvailability === "available");
  const assessedTopics = analyzedTopics.filter((t) => t.currentLevel !== null);

  // Overall DSA Level (0.0 to 10.0)
  let overallDsaLevel = null;
  let overallDsaScore = null;

  if (isConnected && totalProfileSolved > 0) {
    // Weighted aggregate of active topics and overall LeetCode score
    const sumActiveLevels = assessedTopics.reduce((acc, t) => acc + (t.currentLevel || 0), 0);
    const avgAssessed = assessedTopics.length > 0 ? sumActiveLevels / assessedTopics.length : 0;

    // Factor in total solved volume and difficulty
    const easyPts = Math.min(25, easyProfileSolved * 0.5);
    const medPts = Math.min(55, medProfileSolved * 1.0);
    const hardPts = Math.min(20, hardProfileSolved * 2.0);
    const volumeScore = Math.min(100, easyPts + medPts + hardPts);

    const blendedScore = assessedTopics.length >= 5
      ? Math.round(0.6 * volumeScore + 0.4 * (avgAssessed * 10))
      : volumeScore;

    overallDsaScore = Math.min(100, Math.max(0, blendedScore));
    overallDsaLevel = Math.round((overallDsaScore / 10) * 10) / 10;
  } else if (user?.dsaScore !== undefined && user?.dsaScore !== null && !isNaN(Number(user.dsaScore))) {
    overallDsaScore = Math.min(100, Math.max(0, Math.round(Number(user.dsaScore))));
    overallDsaLevel = Math.round((overallDsaScore / 10) * 10) / 10;
  }

  // Strongest Topics: Top 3 by currentLevel descending with solved problems
  const strongestTopics = [...assessedTopics]
    .sort((a, b) => (b.currentLevel || 0) - (a.currentLevel || 0) || b.problemsSolved.total - a.problemsSolved.total)
    .slice(0, 3);

  // Weakest Topics: Top 3 prioritized by most negative gap, or lowest score if no target
  const weakestTopics = [...analyzedTopics]
    .filter((t) => t.requiredLevel !== null || t.currentLevel !== null)
    .sort((a, b) => {
      // Prioritize negative gaps (largest deficit first)
      if (a.gap !== null && b.gap !== null) {
        return a.gap - b.gap;
      }
      if (a.gap !== null) return -1;
      if (b.gap !== null) return 1;
      return (a.currentLevel || 0) - (b.currentLevel || 0);
    })
    .slice(0, 3);

  // Single Largest Gap Topic
  const largestGapTopic =
    weakestTopics.length > 0 && weakestTopics[0].gap !== null && weakestTopics[0].gap < 0
      ? weakestTopics[0]
      : weakestTopics[0] || null;

  // Category Breakdown Aggregation
  const categoryBreakdown = DSA_CATEGORIES.map((cat) => {
    const catTopics = analyzedTopics.filter((t) => t.categoryId === cat.id);
    const catAssessed = catTopics.filter((t) => t.currentLevel !== null);
    const avgLevel =
      catAssessed.length > 0
        ? Math.round((catAssessed.reduce((acc, t) => acc + t.currentLevel, 0) / catAssessed.length) * 10) / 10
        : null;

    const totalSolvedInCat = catTopics.reduce((acc, t) => acc + t.problemsSolved.total, 0);

    return {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      topicsCount: catTopics.length,
      assessedTopicsCount: catAssessed.length,
      averageLevel: avgLevel,
      totalProblemsSolved: totalSolvedInCat,
      status: avgLevel !== null ? (avgLevel >= 7.5 ? "proficient" : "developing") : "pending",
    };
  });

  return {
    analysisVersion: "1.0",
    lastAnalyzedAt: new Date().toISOString(),
    isConnected,
    hasTarget,
    targetCompany: targetCompany || "Not Selected",
    targetJobRole: targetJobRole || "Not Selected",
    leetcodeUser: isConnected
      ? {
          username: leetcodeProfile.username,
          profileUrl: leetcodeProfile.profileUrl,
          ranking: leetcodeProfile.ranking,
          totalSolved: totalProfileSolved,
          easySolved: easyProfileSolved,
          mediumSolved: medProfileSolved,
          hardSolved: hardProfileSolved,
          acceptanceRate: leetcodeProfile.acceptanceRate,
          lastSyncedAt: leetcodeProfile.lastSyncedAt,
        }
      : null,
    summary: {
      overallDsaLevel,
      overallDsaScore,
      topicsAnalyzedCount: assessedTopics.length,
      activeTopicsCount: activeTopics.length,
      totalTopicsCount: DSA_TOPICS.length,
      coveragePercent: Math.round((assessedTopics.length / DSA_TOPICS.length) * 100),
      strongestTopics: strongestTopics.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        currentLevel: t.currentLevel,
        problemsSolved: t.problemsSolved.total,
        confidence: t.confidence,
      })),
      weakestTopics: weakestTopics.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        currentLevel: t.currentLevel,
        requiredLevel: t.requiredLevel,
        gap: t.gap,
        status: t.status,
        statusLabel: t.statusLabel,
      })),
      largestGapTopic: largestGapTopic
        ? {
            id: largestGapTopic.id,
            name: largestGapTopic.name,
            category: largestGapTopic.category,
            currentLevel: largestGapTopic.currentLevel,
            requiredLevel: largestGapTopic.requiredLevel,
            gap: largestGapTopic.gap,
            status: largestGapTopic.status,
          }
        : null,
    },
    categories: categoryBreakdown,
    topics: analyzedTopics,
  };
};

/**
 * Resolves expected DSA problem count benchmarks and target readiness score for a target company and role.
 *
 * Tier 1 (FAANG+ / Top Tech): Easy: 100, Medium: 200, Hard: 50, Total: 350, Required DSA Readiness: 85%
 * Tier 2 (Product / High Growth): Easy: 80, Medium: 120, Hard: 20, Total: 220, Required DSA Readiness: 75%
 * Tier 3 / Service (IT Services / Mass): Easy: 60, Medium: 40, Hard: 5, Total: 105, Required DSA Readiness: 60%
 * Fallback (General / Unlisted): Easy: 70, Medium: 100, Hard: 15, Total: 185, Required DSA Readiness: 70%
 *
 * @param {string} companyName - Target company name
 * @param {string} jobRole - Target job role
 * @param {Object|null} companyRequirement - Company requirement document from DB
 * @returns {Object} Tier benchmarks
 */
export const getCompanyDsaBenchmarks = (
  companyName = "",
  jobRole = "",
  companyRequirement = null
) => {
  const hasTarget = Boolean(companyName?.trim() || jobRole?.trim());
  const hasTargetCompany = Boolean(companyName?.trim());
  const tier = hasTargetCompany ? getCompanyTier(companyName) : "unlisted";

  let benchmarks = {
    tier: "general",
    tierLabel: "General Tech Benchmark",
    easy: 70,
    medium: 100,
    hard: 15,
    total: 185,
    requiredReadiness: 70,
  };

  if (tier === "tier1") {
    benchmarks = {
      tier: "tier1",
      tierLabel: "Tier 1 (FAANG+ & Top Tier Tech)",
      easy: 100,
      medium: 200,
      hard: 50,
      total: 350,
      requiredReadiness: 85,
    };
  } else if (tier === "tier2") {
    benchmarks = {
      tier: "tier2",
      tierLabel: "Tier 2 (Product & High-Growth Unicorns)",
      easy: 80,
      medium: 120,
      hard: 20,
      total: 220,
      requiredReadiness: 75,
    };
  } else if (tier === "tier3") {
    benchmarks = {
      tier: "tier3",
      tierLabel: "Tier 3 (IT Services & Enterprise)",
      easy: 60,
      medium: 40,
      hard: 5,
      total: 105,
      requiredReadiness: 60,
    };
  }

  // Database override from CompanyRequirement if exists
  if (companyRequirement?.dsaExpectation) {
    const expectationLevel = companyRequirement.dsaExpectation.level;
    if (expectationLevel === "Very Hard") {
      benchmarks.easy = Math.max(benchmarks.easy, 100);
      benchmarks.medium = Math.max(benchmarks.medium, 220);
      benchmarks.hard = Math.max(benchmarks.hard, 60);
      benchmarks.total = benchmarks.easy + benchmarks.medium + benchmarks.hard;
      benchmarks.requiredReadiness = 90;
    } else if (expectationLevel === "Hard") {
      benchmarks.easy = Math.max(benchmarks.easy, 100);
      benchmarks.medium = Math.max(benchmarks.medium, 200);
      benchmarks.hard = Math.max(benchmarks.hard, 50);
      benchmarks.total = benchmarks.easy + benchmarks.medium + benchmarks.hard;
      benchmarks.requiredReadiness = 85;
    } else if (expectationLevel === "Medium") {
      benchmarks.easy = Math.max(benchmarks.easy, 80);
      benchmarks.medium = Math.max(benchmarks.medium, 120);
      benchmarks.hard = Math.max(benchmarks.hard, 20);
      benchmarks.total = benchmarks.easy + benchmarks.medium + benchmarks.hard;
      benchmarks.requiredReadiness = 75;
    } else if (expectationLevel === "Easy") {
      benchmarks.easy = 60;
      benchmarks.medium = 40;
      benchmarks.hard = 5;
      benchmarks.total = 105;
      benchmarks.requiredReadiness = 60;
    }

    if (companyRequirement.dsaExpectation.minProblemsSolved > 0) {
      benchmarks.total = Math.max(
        benchmarks.total,
        companyRequirement.dsaExpectation.minProblemsSolved
      );
    }
  }

  if (!hasTarget) {
    benchmarks.tierLabel = "General Industry Benchmark (No Target Set)";
  }

  return benchmarks;
};

/**
 * Calculates difficulty gap, readiness comparison, and actionable recommendations against target company benchmarks.
 *
 * @param {Object} user - User document
 * @param {Object|null} leetcodeProfile - Synced LeetCode profile document
 * @param {Object|null} companyRequirement - Company requirement document from DB
 * @returns {Object} Structured comparison analysis payload
 */
export const calculateDsaCompanyComparison = (
  user,
  leetcodeProfile = null,
  companyRequirement = null
) => {
  const targetCompany = user?.targetCompany?.trim() || "";
  const targetJobRole = user?.targetJobRole?.trim() || "";
  const hasTarget = Boolean(targetCompany || targetJobRole);

  const isConnected = Boolean(
    leetcodeProfile &&
      leetcodeProfile.syncStatus === "synced" &&
      (leetcodeProfile.totalSolved > 0 || leetcodeProfile.username)
  );

  const benchmark = getCompanyDsaBenchmarks(
    targetCompany,
    targetJobRole,
    companyRequirement
  );

  const userEasy = isConnected
    ? Number(leetcodeProfile.easySolved ?? leetcodeProfile.problemsSolved?.easy ?? 0)
    : 0;
  const userMedium = isConnected
    ? Number(leetcodeProfile.mediumSolved ?? leetcodeProfile.problemsSolved?.medium ?? 0)
    : 0;
  const userHard = isConnected
    ? Number(leetcodeProfile.hardSolved ?? leetcodeProfile.problemsSolved?.hard ?? 0)
    : 0;
  const userTotal = isConnected
    ? Number(leetcodeProfile.totalSolved ?? (userEasy + userMedium + userHard))
    : 0;

  const formatGap = (val) => {
    if (val > 0) return `+${val}`;
    if (val < 0) return `${val}`;
    return "0";
  };

  const getDifficultyStatus = (userVal, reqVal) => {
    return userVal >= reqVal ? "meets_requirement" : "needs_improvement";
  };

  const getDifficultyStatusLabel = (userVal, reqVal) => {
    return userVal >= reqVal ? "Meets Requirement" : "Needs Improvement";
  };

  const getDifficultyColor = (userVal, reqVal) => {
    if (userVal >= reqVal) return "emerald";
    if (userVal >= reqVal * 0.7) return "amber";
    return "rose";
  };

  const difficulties = [
    {
      key: "easy",
      difficulty: "Easy",
      userValue: userEasy,
      requiredValue: benchmark.easy,
      gap: userEasy - benchmark.easy,
      gapFormatted: formatGap(userEasy - benchmark.easy),
      status: getDifficultyStatus(userEasy, benchmark.easy),
      statusLabel: getDifficultyStatusLabel(userEasy, benchmark.easy),
      percentage: Math.min(100, Math.round((userEasy / Math.max(1, benchmark.easy)) * 100)),
      color: getDifficultyColor(userEasy, benchmark.easy),
      description: "Foundational data structures, array scanning, string manipulation, and basic hash table lookups.",
    },
    {
      key: "medium",
      difficulty: "Medium",
      userValue: userMedium,
      requiredValue: benchmark.medium,
      gap: userMedium - benchmark.medium,
      gapFormatted: formatGap(userMedium - benchmark.medium),
      status: getDifficultyStatus(userMedium, benchmark.medium),
      statusLabel: getDifficultyStatusLabel(userMedium, benchmark.medium),
      percentage: Math.min(100, Math.round((userMedium / Math.max(1, benchmark.medium)) * 100)),
      color: getDifficultyColor(userMedium, benchmark.medium),
      description: "Core technical interview difficulty: Trees, Graphs, DP, Binary Search, Sliding Window, and Backtracking.",
    },
    {
      key: "hard",
      difficulty: "Hard",
      userValue: userHard,
      requiredValue: benchmark.hard,
      gap: userHard - benchmark.hard,
      gapFormatted: formatGap(userHard - benchmark.hard),
      status: getDifficultyStatus(userHard, benchmark.hard),
      statusLabel: getDifficultyStatusLabel(userHard, benchmark.hard),
      percentage: Math.min(100, Math.round((userHard / Math.max(1, benchmark.hard)) * 100)),
      color: getDifficultyColor(userHard, benchmark.hard),
      description: "Advanced algorithmic challenges, complex dynamic programming, Segment Trees, and graph network flow.",
    },
  ];

  const totalComparison = {
    userTotal,
    requiredTotal: benchmark.total,
    gap: userTotal - benchmark.total,
    gapFormatted: formatGap(userTotal - benchmark.total),
    status: getDifficultyStatus(userTotal, benchmark.total),
    statusLabel: getDifficultyStatusLabel(userTotal, benchmark.total),
    percentage: Math.min(100, Math.round((userTotal / Math.max(1, benchmark.total)) * 100)),
  };

  // Evaluate full DSA topic analysis to derive current DSA readiness %
  const fullTopicAnalysis = analyzeDsaProficiency(
    user,
    leetcodeProfile,
    companyRequirement
  );

  const currentReadiness =
    fullTopicAnalysis.summary.overallDsaScore !== null &&
    fullTopicAnalysis.summary.overallDsaScore !== undefined
      ? fullTopicAnalysis.summary.overallDsaScore
      : (user?.dsaScore !== undefined && user?.dsaScore !== null && !isNaN(Number(user.dsaScore))
          ? Math.min(100, Math.max(0, Math.round(Number(user.dsaScore))))
          : 0);

  const requiredReadiness = benchmark.requiredReadiness;
  const netGap = currentReadiness - requiredReadiness;
  const improvementNeeded = Math.max(0, requiredReadiness - currentReadiness);

  let readinessStatus = "needs_improvement";
  let readinessStatusLabel = "Needs Improvement";
  if (currentReadiness > requiredReadiness) {
    readinessStatus = "above_requirement";
    readinessStatusLabel = "Above Target Bar";
  } else if (currentReadiness === requiredReadiness) {
    readinessStatus = "meets_requirement";
    readinessStatusLabel = "Meets Target Bar";
  }

  const targetCompanyName = targetCompany || "target company";
  let dynamicMessage = "";
  if (currentReadiness < requiredReadiness) {
    dynamicMessage = `You need approximately +${improvementNeeded}% improvement in DSA readiness to meet ${targetCompanyName}'s expectations.`;
  } else if (currentReadiness === requiredReadiness) {
    dynamicMessage = `You currently meet the expected DSA readiness level for ${targetCompanyName}.`;
  } else {
    dynamicMessage = `You are approximately ${Math.abs(netGap)}% above the expected DSA readiness level for ${targetCompanyName}.`;
  }

  // Actionable Roadmap Milestones
  const easyGap = userEasy - benchmark.easy;
  const mediumGap = userMedium - benchmark.medium;
  const hardGap = userHard - benchmark.hard;

  const milestones = [];
  if (mediumGap < 0) {
    milestones.push({
      id: "solve_medium",
      difficulty: "Medium",
      targetCount: Math.abs(mediumGap),
      title: `Solve ~${Math.abs(mediumGap)} More Medium Problems`,
      description: `Target high-frequency ${targetCompanyName} patterns: Dynamic Programming, Graph Traversals (BFS/DFS), and Tree Recursion.`,
      priority: "High",
      badgeColor: "amber",
    });
  }
  if (hardGap < 0) {
    milestones.push({
      id: "solve_hard",
      difficulty: "Hard",
      targetCount: Math.abs(hardGap),
      title: `Solve ~${Math.abs(hardGap)} More Hard Problems`,
      description: `Tackle advanced algorithms: 2D DP state compression, Segment Trees, and Trie/Graph shortest paths.`,
      priority: "Medium",
      badgeColor: "rose",
    });
  }
  if (easyGap < 0) {
    milestones.push({
      id: "solve_easy",
      difficulty: "Easy",
      targetCount: Math.abs(easyGap),
      title: `Solve ~${Math.abs(easyGap)} More Easy Problems`,
      description: `Solidify core programming syntax, two-pointer techniques, and constant-time hash map lookups.`,
      priority: "Low",
      badgeColor: "sky",
    });
  }
  if (milestones.length === 0) {
    milestones.push({
      id: "maintain_mastery",
      difficulty: "All",
      targetCount: 0,
      title: "Maintain Interview Readiness Cadence",
      description: `You have reached the problem volume benchmarks for ${targetCompanyName}. Practice 2-3 timed mock coding assessments weekly.`,
      priority: "Ongoing",
      badgeColor: "emerald",
    });
  }

  // Priority topic gaps (top 3 weakest or highest required)
  const priorityTopics = (fullTopicAnalysis.summary.weakestTopics || []).map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    currentLevel: t.currentLevel,
    requiredLevel: t.requiredLevel,
    gap: t.gap,
    status: t.status,
    statusLabel: t.statusLabel,
  }));

  const actionItems = [];
  if (mediumGap < 0) {
    actionItems.push(`Solve ~${Math.abs(mediumGap)} more Medium problems on LeetCode.`);
  }
  if (hardGap < 0) {
    actionItems.push(`Solve ~${Math.abs(hardGap)} more Hard problems for ${targetCompanyName} difficulty bar.`);
  }
  if (priorityTopics.length > 0) {
    actionItems.push(
      `Focus on priority topic gaps: ${priorityTopics.slice(0, 3).map((t) => t.name).join(", ")}.`
    );
  }
  actionItems.push("Practice writing clean code within 25-minute mock coding time limits.");

  return {
    targetCompany: targetCompany || "Not Selected",
    targetJobRole: targetJobRole || "Not Selected",
    hasTarget,
    tier: benchmark.tier,
    tierLabel: benchmark.tierLabel,
    isConnected,
    leetcodeUser: isConnected
      ? {
          username: leetcodeProfile.username,
          profileUrl: leetcodeProfile.profileUrl,
          ranking: leetcodeProfile.ranking,
          totalSolved: userTotal,
          easySolved: userEasy,
          mediumSolved: userMedium,
          hardSolved: userHard,
          acceptanceRate: leetcodeProfile.acceptanceRate,
          lastSyncedAt: leetcodeProfile.lastSyncedAt,
        }
      : null,
    overallReadiness: {
      currentReadiness,
      requiredReadiness,
      netGap,
      netGapFormatted: netGap > 0 ? `+${netGap}%` : `${netGap}%`,
      improvementNeeded,
      status: readinessStatus,
      statusLabel: readinessStatusLabel,
      dynamicMessage,
    },
    difficulties,
    totalComparison,
    roadmap: {
      milestones,
      priorityTopics,
      actionItems,
    },
    lastCalculatedAt: new Date().toISOString(),
  };
};

/**
 * Fetches user profile, LeetCode profile, and company requirements to compute DSA company comparison.
 *
 * @param {string|ObjectId} userId - User ID
 * @returns {Promise<Object>} Structured comparison analysis
 */
export const getDsaCompanyComparison = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  let leetcodeProfile = null;
  try {
    leetcodeProfile = await LeetCodeProfile.findOne({ userId });
  } catch (err) {
    console.warn("Could not query LeetCodeProfile in getDsaCompanyComparison:", err.message);
  }

  let companyRequirement = null;
  const targetCompany = user.targetCompany?.trim();
  const targetJobRole = user.targetJobRole?.trim();

  if (targetCompany && targetJobRole) {
    const compNorm = user.targetCompanyNormalized || normalizeIdentifier(targetCompany);
    const roleNorm = user.targetRoleNormalized || normalizeIdentifier(targetJobRole);

    try {
      companyRequirement = await CompanyRequirement.findOne({
        companyNormalized: compNorm,
        roleNormalized: roleNorm,
      }).lean();
    } catch (err) {
      console.warn("Could not query CompanyRequirement in getDsaCompanyComparison:", err.message);
    }
  }

  return calculateDsaCompanyComparison(user, leetcodeProfile, companyRequirement);
};

