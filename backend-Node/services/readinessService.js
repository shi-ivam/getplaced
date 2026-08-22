import mongoose from "mongoose";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import GitHubProfile from "../models/githubProfileModel.js";
import { calculateLeetCodeDsaScore } from "./leetcodeService.js";
import { calculateGitHubProjectScore } from "./githubService.js";
import { analyzeDsaProficiency } from "./dsaAnalysisService.js";
import {
  READINESS_WEIGHTS,
  STATUS_LEVELS,
  DIMENSION_METADATA,
  getStatusFromScore,
  getCompanyTargetBenchmark,
} from "../config/readinessWeights.js";

/**
 * Calculate overall placement readiness score and dimension breakdown for a user.
 * Follows re-normalized weighting without penalizing or fabricating unstarted modules.
 *
 * @param {Object} user - User mongoose document or plain object
 * @returns {Promise<Object>} Readiness assessment object
 */
export const calculatePlacementReadiness = async (user) => {
  if (!user) {
    return buildEmptyReadinessResponse("User profile is required to calculate readiness.");
  }

  const targetCompany = user.targetCompany?.trim() || "";
  const targetJobRole = user.targetJobRole?.trim() || "";
  const targetCompanyNormalized =
    user.targetCompanyNormalized || normalizeIdentifier(targetCompany);
  const targetRoleNormalized =
    user.targetRoleNormalized || normalizeIdentifier(targetJobRole);

  const hasTarget = Boolean(targetCompany || targetJobRole);
  const hasAcademicBaseline =
    user.cgpa !== null && user.cgpa !== undefined && !isNaN(Number(user.cgpa));

  // If user lacks baseline data (no target and no academic baseline)
  if (!hasTarget && !hasAcademicBaseline) {
    return buildEmptyReadinessResponse(
      "Not enough data yet — Complete your profile and choose target"
    );
  }

  // Attempt to load specific company requirement profile if configured
  let companyRequirement = null;
  if (targetCompanyNormalized && targetRoleNormalized && mongoose.connection?.readyState === 1) {
    try {
      companyRequirement = await CompanyRequirement.findOne({
        companyNormalized: targetCompanyNormalized,
        roleNormalized: targetRoleNormalized,
      }).lean();
    } catch (err) {
      console.warn("Could not query CompanyRequirement in readinessService:", err.message);
    }
  }

  // Attempt to load LeetCode & GitHub profiles if connected
  let leetcodeProfile = null;
  let githubProfile = null;
  const userId = user._id || user.id;
  if (userId && mongoose.connection?.readyState === 1) {
    try {
      [leetcodeProfile, githubProfile] = await Promise.all([
        LeetCodeProfile.findOne({ userId }).lean(),
        GitHubProfile.findOne({ userId }).lean(),
      ]);
    } catch (err) {
      console.warn("Could not query connected profiles in readinessService:", err.message);
    }
  }

  // Target overall benchmark based on company tier or custom requirement
  const targetBenchmarkScore = getCompanyTargetBenchmark(targetCompany);

  // Initialize dimensions container
  const dimensions = {};

  // 1. Academics Dimension (Weight: 10%)
  dimensions.academics = evaluateAcademicsDimension(user, companyRequirement);

  // 2. Skills Dimension (Weight: 20%)
  dimensions.skills = evaluateSkillsDimension(user, companyRequirement);

  // 3. Resume Dimension (Weight: 15%)
  dimensions.resume = evaluateResumeDimension(user);

  // 4. DSA Dimension (Weight: 25%)
  dimensions.dsa = evaluateDsaDimension(user, companyRequirement, leetcodeProfile);

  // 5. Projects Dimension (Weight: 15%)
  dimensions.projects = evaluateProjectsDimension(user, githubProfile);

  // 6. Communication Dimension (Weight: 7.5%)
  dimensions.communication = evaluateCommunicationDimension(user);

  // 7. Interview Dimension (Weight: 7.5%)
  dimensions.interview = evaluateInterviewDimension(user);

  // Re-Normalized Weighting Engine
  // Weighted Score = Σ(availableCategoryScore × categoryWeight) / Σ(availableCategoryWeights)
  let totalWeightedScore = 0;
  let totalAvailableWeight = 0;
  const activeDimensions = [];
  const pendingDimensions = [];

  for (const [key, meta] of Object.entries(DIMENSION_METADATA)) {
    const dim = dimensions[key];
    const canonicalWeight = meta.weight;

    if (dim.dataAvailability === "available" && dim.score !== null) {
      totalWeightedScore += dim.score * canonicalWeight;
      totalAvailableWeight += canonicalWeight;
      activeDimensions.push(key);
    } else {
      pendingDimensions.push(key);
    }
  }

  // Calculate overall score (0-100) or null if no categories have data
  const overallScore =
    totalAvailableWeight > 0
      ? Math.round(totalWeightedScore / totalAvailableWeight)
      : null;

  const overallStatus = getStatusFromScore(overallScore);
  const overallGap =
    overallScore !== null ? Math.max(0, targetBenchmarkScore - overallScore) : null;

  // Calculate effective normalized weights and attach metadata
  for (const [key, meta] of Object.entries(DIMENSION_METADATA)) {
    const dim = dimensions[key];
    const canonicalWeight = meta.weight;

    dim.id = key;
    dim.name = meta.name;
    dim.fullName = meta.fullName;
    dim.description = meta.description;
    dim.actionLink = meta.actionLink;
    dim.actionLabel = meta.actionLabel;
    dim.canonicalWeight = canonicalWeight;
    dim.canonicalWeightPercent = meta.weightPercent;
    dim.effectiveWeightPercent =
      totalAvailableWeight > 0 && dim.dataAvailability === "available"
        ? Math.round((canonicalWeight / totalAvailableWeight) * 1000) / 10
        : 0;
  }

  // Compute Top 3 Weakness / Gap Areas for Next Focus
  const topGaps = computeTopGaps(dimensions, targetBenchmarkScore);

  // Compute Active Weight Coverage percentage
  const activeWeightCoveragePercent = Math.round(totalAvailableWeight * 1000) / 10;

  return {
    hasSufficientData: true,
    overallScore,
    overallStatus,
    targetScore: targetBenchmarkScore,
    overallGap,
    statusLevelLabel: overallStatus.label,
    activeWeightCoverage: activeWeightCoveragePercent,
    targetCompany: targetCompany || "Not Selected",
    targetJobRole: targetJobRole || "Not Selected",
    targetCompanyNormalized,
    targetRoleNormalized,
    leetcodeProfile: leetcodeProfile
      ? {
          username: leetcodeProfile.username,
          totalSolved: leetcodeProfile.totalSolved,
          easySolved: leetcodeProfile.easySolved,
          mediumSolved: leetcodeProfile.mediumSolved,
          hardSolved: leetcodeProfile.hardSolved,
          ranking: leetcodeProfile.ranking,
          acceptanceRate: leetcodeProfile.acceptanceRate,
        }
      : null,
    githubProfile: githubProfile
      ? {
          username: githubProfile.username,
          name: githubProfile.name || "",
          avatarUrl: githubProfile.avatarUrl || "",
          profileUrl: githubProfile.profileUrl || `https://github.com/${githubProfile.username}`,
          publicReposCount: githubProfile.publicReposCount || (githubProfile.repositories?.length ?? 0),
          originalReposCount: githubProfile.originalReposCount || 0,
          totalStars: githubProfile.totalStars || 0,
          totalForks: githubProfile.totalForks || 0,
          projectScore:
            githubProfile.projectScore !== undefined && githubProfile.projectScore !== null
              ? githubProfile.projectScore
              : calculateGitHubProjectScore(githubProfile),
          topLanguage: githubProfile.languages?.[0]?.languageName || null,
        }
      : null,
    dimensions,
    topGaps,
    explainability: {
      formula: "Σ(availableCategoryScore × categoryWeight) / Σ(availableCategoryWeights)",
      activeDimensionsCount: activeDimensions.length,
      totalDimensionsCount: Object.keys(DIMENSION_METADATA).length,
      activeDimensions,
      pendingDimensions,
      activeWeightCoveragePercent,
      isReNormalized: activeDimensions.length < Object.keys(DIMENSION_METADATA).length,
      explanation:
        activeDimensions.length === Object.keys(DIMENSION_METADATA).length
          ? "All 7 dimensions are fully active. Your overall readiness score represents your complete placement profile."
          : `Score is calculated using dynamic re-normalization across ${activeDimensions.length} of 7 active dimensions (${activeWeightCoveragePercent}% framework coverage). Unstarted dimensions are excluded from the denominator so you are never penalized for pending assessments.`,
    },
    message: null,
  };
};

/**
 * 1. Academics Dimension (Weight: 10%)
 */
const evaluateAcademicsDimension = (user, companyRequirement) => {
  const reqAcademicsScore = companyRequirement?.cgpaCutoff
    ? Math.round(companyRequirement.cgpaCutoff * 10)
    : 75;

  if (user.cgpa === null || user.cgpa === undefined || isNaN(Number(user.cgpa))) {
    return {
      score: null,
      status: "not_analyzed",
      statusLabel: "Not Analyzed",
      dataAvailability: "insufficient_data",
      requiredScore: reqAcademicsScore,
      gap: null,
      notes: "Add your CGPA in your profile to include academics in readiness calculations.",
    };
  }

  const cgpaNum = Math.min(10, Math.max(0, Number(user.cgpa)));
  let calculatedScore = cgpaNum * 10;

  const has10th =
    user.tenthPercentage !== null &&
    user.tenthPercentage !== undefined &&
    !isNaN(Number(user.tenthPercentage));
  const has12th =
    user.twelfthPercentage !== null &&
    user.twelfthPercentage !== undefined &&
    !isNaN(Number(user.twelfthPercentage));

  if (has10th && has12th) {
    calculatedScore =
      0.7 * (cgpaNum * 10) +
      0.15 * Number(user.tenthPercentage) +
      0.15 * Number(user.twelfthPercentage);
  } else if (has12th) {
    calculatedScore = 0.8 * (cgpaNum * 10) + 0.2 * Number(user.twelfthPercentage);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(calculatedScore)));
  const statusObj = getStatusFromScore(finalScore);
  const gap = Math.max(0, reqAcademicsScore - finalScore);

  return {
    score: finalScore,
    status: statusObj.key,
    statusLabel: statusObj.label,
    dataAvailability: "available",
    requiredScore: reqAcademicsScore,
    gap,
    notes: `Calculated from CGPA (${cgpaNum}/10)${has12th ? " and percentage benchmarks" : ""}.`,
  };
};

/**
 * 2. Skills Dimension (Weight: 20%)
 */
const evaluateSkillsDimension = (user, companyRequirement) => {
  const reqSkillsScore = 80;

  if (!user.degree && !user.targetJobRole) {
    return {
      score: null,
      status: "not_analyzed",
      statusLabel: "Not Analyzed",
      dataAvailability: "insufficient_data",
      requiredScore: reqSkillsScore,
      gap: null,
      notes: "Specify your degree and target role in your profile to unlock skills alignment.",
    };
  }

  // Base score from degree foundation
  let baseScore = 70;
  const degree = (user.degree || "").toLowerCase();
  if (degree.includes("b.tech") || degree.includes("b.e.") || degree.includes("m.tech") || degree.includes("m.e.")) {
    baseScore = 78;
  } else if (degree.includes("mca")) {
    baseScore = 76;
  } else if (degree.includes("bca") || degree.includes("b.sc")) {
    baseScore = 72;
  }

  // Profile richness boosts
  if (user.college?.trim()) baseScore += 4;
  if (user.graduationYear) baseScore += 3;
  if (user.targetJobRole?.trim()) baseScore += 3;

  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore)));
  const statusObj = getStatusFromScore(finalScore);
  const gap = Math.max(0, reqSkillsScore - finalScore);

  return {
    score: finalScore,
    status: statusObj.key,
    statusLabel: statusObj.label,
    dataAvailability: "available",
    requiredScore: reqSkillsScore,
    gap,
    notes: `Domain readiness based on ${user.degree || "degree"} curriculum and target role alignment.`,
  };
};

/**
 * 3. Resume Dimension (Weight: 15%)
 */
const evaluateResumeDimension = (user) => {
  const reqScore = 85;

  // Check if user has uploaded/analyzed resume score
  if (user.resumeScore !== undefined && user.resumeScore !== null && !isNaN(Number(user.resumeScore))) {
    const score = Math.min(100, Math.max(0, Math.round(Number(user.resumeScore))));
    const statusObj = getStatusFromScore(score);
    return {
      score,
      status: statusObj.key,
      statusLabel: statusObj.label,
      dataAvailability: "available",
      requiredScore: reqScore,
      gap: Math.max(0, reqScore - score),
      notes: "Evaluated from latest AI Resume ATS score.",
    };
  }

  return {
    score: null,
    status: "not_analyzed",
    statusLabel: "Not Analyzed",
    dataAvailability: "not_started",
    requiredScore: reqScore,
    gap: null,
    notes: "Upload your resume in the AI Resume Analyzer to get ATS scoring and feedback.",
  };
};

/**
 * 4. DSA Dimension (Weight: 25%)
 */
const evaluateDsaDimension = (user, companyRequirement, leetcodeProfile = null) => {
  let reqScore = 85;
  const dsaLevel = companyRequirement?.dsaExpectation?.level;
  if (dsaLevel === "Hard" || dsaLevel === "Very Hard") {
    reqScore = 90;
  } else if (dsaLevel === "Easy") {
    reqScore = 70;
  }

  // Priority 1: Connected & Synced LeetCode Profile
  if (
    leetcodeProfile &&
    leetcodeProfile.syncStatus === "synced" &&
    (leetcodeProfile.totalSolved > 0 || leetcodeProfile.username)
  ) {
    const dsaAnalysis = analyzeDsaProficiency(user, leetcodeProfile, companyRequirement);
    const score = dsaAnalysis.summary.overallDsaScore ?? calculateLeetCodeDsaScore(leetcodeProfile);
    const finalScore = Math.min(100, Math.max(0, score));
    const statusObj = getStatusFromScore(finalScore);

    const strongestNames = dsaAnalysis.summary.strongestTopics.map((t) => t.name).join(", ");
    const weakestNames = dsaAnalysis.summary.weakestTopics.map((t) => t.name).join(", ");

    let noteText = `Synced from LeetCode (@${leetcodeProfile.username}): ${leetcodeProfile.totalSolved} solved (${leetcodeProfile.easySolved}E / ${leetcodeProfile.mediumSolved}M / ${leetcodeProfile.hardSolved}H)${leetcodeProfile.ranking ? ` · Global #${leetcodeProfile.ranking.toLocaleString()}` : ""}.`;
    if (strongestNames) {
      noteText += ` Strongest topics: ${strongestNames}.`;
    }
    if (weakestNames) {
      noteText += ` Focus areas: ${weakestNames}.`;
    }

    return {
      score: finalScore,
      status: statusObj.key,
      statusLabel: statusObj.label,
      dataAvailability: "available",
      requiredScore: reqScore,
      gap: Math.max(0, reqScore - finalScore),
      notes: noteText,
      source: "leetcode",
      overallDsaLevel: dsaAnalysis.summary.overallDsaLevel,
      topicsAnalyzedCount: dsaAnalysis.summary.topicsAnalyzedCount,
      strongestTopics: dsaAnalysis.summary.strongestTopics,
      weakestTopics: dsaAnalysis.summary.weakestTopics,
      largestGapTopic: dsaAnalysis.summary.largestGapTopic,
      leetcodeSummary: {
        username: leetcodeProfile.username,
        totalSolved: leetcodeProfile.totalSolved,
        easySolved: leetcodeProfile.easySolved,
        mediumSolved: leetcodeProfile.mediumSolved,
        hardSolved: leetcodeProfile.hardSolved,
        ranking: leetcodeProfile.ranking,
        acceptanceRate: leetcodeProfile.acceptanceRate,
      },
    };
  }

  // Priority 2: Stored/Curriculum DSA score
  if (user.dsaScore !== undefined && user.dsaScore !== null && !isNaN(Number(user.dsaScore))) {
    const score = Math.min(100, Math.max(0, Math.round(Number(user.dsaScore))));
    const statusObj = getStatusFromScore(score);
    return {
      score,
      status: statusObj.key,
      statusLabel: statusObj.label,
      dataAvailability: "available",
      requiredScore: reqScore,
      gap: Math.max(0, reqScore - score),
      notes: "Computed from completed DSA problem-solving modules.",
      source: "manual",
    };
  }

  return {
    score: null,
    status: "not_analyzed",
    statusLabel: "Not Analyzed",
    dataAvailability: "not_started",
    requiredScore: reqScore,
    gap: null,
    notes: "Connect your LeetCode account or solve curriculum problems to benchmark algorithmic readiness.",
    source: null,
  };
};

/**
 * 5. Projects Dimension (Weight: 15%)
 */
const evaluateProjectsDimension = (user, githubProfile = null) => {
  const reqScore = 75;

  // Priority 1: Connected & Synced GitHub Profile
  if (
    githubProfile &&
    githubProfile.syncStatus === "synced" &&
    (githubProfile.originalReposCount > 0 || githubProfile.publicReposCount > 0 || githubProfile.username)
  ) {
    const rawScore =
      githubProfile.projectScore !== undefined && githubProfile.projectScore !== null
        ? Number(githubProfile.projectScore)
        : calculateGitHubProjectScore(githubProfile);

    const score = Math.min(100, Math.max(0, rawScore));
    const statusObj = getStatusFromScore(score);
    const topLanguage = githubProfile.languages?.[0]?.languageName || "Full-stack";

    let noteText = `Synced from GitHub (@${githubProfile.username}): ${githubProfile.originalReposCount || 0} original repos, ${githubProfile.totalStars || 0} stars, ${githubProfile.totalForks || 0} forks across ${githubProfile.publicReposCount || 0} public projects. Primary stack: ${topLanguage}.`;

    return {
      score,
      status: statusObj.key,
      statusLabel: statusObj.label,
      dataAvailability: "available",
      requiredScore: reqScore,
      gap: Math.max(0, reqScore - score),
      notes: noteText,
      source: "github",
      githubSummary: {
        username: githubProfile.username,
        name: githubProfile.name || "",
        avatarUrl: githubProfile.avatarUrl || "",
        profileUrl: githubProfile.profileUrl || `https://github.com/${githubProfile.username}`,
        publicReposCount: githubProfile.publicReposCount || (githubProfile.repositories?.length ?? 0),
        originalReposCount: githubProfile.originalReposCount || 0,
        forkedReposCount: githubProfile.forkedReposCount || 0,
        totalStars: githubProfile.totalStars || 0,
        totalForks: githubProfile.totalForks || 0,
        projectScore: score,
        topLanguages: (githubProfile.languages || []).slice(0, 4),
        featuredProjects: (githubProfile.topRepositories || []).slice(0, 3).map((r) => ({
          name: r.name,
          htmlUrl: r.htmlUrl,
          stars: r.stars,
          language: r.language,
          hasLiveDemo: r.hasLiveDemo,
          liveDemoUrl: r.liveDemoUrl,
        })),
      },
    };
  }

  // Priority 2: Stored manual projectsScore
  if (user.projectsScore !== undefined && user.projectsScore !== null && !isNaN(Number(user.projectsScore))) {
    const score = Math.min(100, Math.max(0, Math.round(Number(user.projectsScore))));
    const statusObj = getStatusFromScore(score);
    return {
      score,
      status: statusObj.key,
      statusLabel: statusObj.label,
      dataAvailability: "available",
      requiredScore: reqScore,
      gap: Math.max(0, reqScore - score),
      notes: "Evaluated from practical project portfolio and manual assessment.",
      source: "manual",
    };
  }

  return {
    score: null,
    status: "not_analyzed",
    statusLabel: "Not Analyzed",
    dataAvailability: "not_started",
    requiredScore: reqScore,
    gap: null,
    notes: "Connect your GitHub account in your Profile to evaluate real-world engineering portfolio and project depth.",
    source: null,
  };
};

/**
 * 6. Communication Dimension (Weight: 7.5%)
 */
const evaluateCommunicationDimension = (user) => {
  const reqScore = 75;

  if (user.communicationScore !== undefined && user.communicationScore !== null && !isNaN(Number(user.communicationScore))) {
    const score = Math.min(100, Math.max(0, Math.round(Number(user.communicationScore))));
    const statusObj = getStatusFromScore(score);
    return {
      score,
      status: statusObj.key,
      statusLabel: statusObj.label,
      dataAvailability: "available",
      requiredScore: reqScore,
      gap: Math.max(0, reqScore - score),
      notes: "Scored from speech clarity and articulation in AI mock interviews.",
    };
  }

  return {
    score: null,
    status: "not_analyzed",
    statusLabel: "Not Analyzed",
    dataAvailability: "not_started",
    requiredScore: reqScore,
    gap: null,
    notes: "Attempt an AI Mock Interview session to benchmark spoken communication.",
  };
};

/**
 * 7. Interview Dimension (Weight: 7.5%)
 */
const evaluateInterviewDimension = (user) => {
  const reqScore = 80;

  if (user.interviewScore !== undefined && user.interviewScore !== null && !isNaN(Number(user.interviewScore))) {
    const score = Math.min(100, Math.max(0, Math.round(Number(user.interviewScore))));
    const statusObj = getStatusFromScore(score);
    return {
      score,
      status: statusObj.key,
      statusLabel: statusObj.label,
      dataAvailability: "available",
      requiredScore: reqScore,
      gap: Math.max(0, reqScore - score),
      notes: "Scored from latest full technical & behavioral mock interview.",
    };
  }

  return {
    score: null,
    status: "not_analyzed",
    statusLabel: "Not Analyzed",
    dataAvailability: "not_started",
    requiredScore: reqScore,
    gap: null,
    notes: "Complete a full AI mock interview to measure live interview simulation score.",
  };
};

/**
 * Finds top 3 weakness areas / highest impact action items
 */
const computeTopGaps = (dimensions, targetBenchmarkScore) => {
  const gapItems = [];

  for (const [key, meta] of Object.entries(DIMENSION_METADATA)) {
    const dim = dimensions[key];

    if (dim.dataAvailability === "available" && dim.score !== null) {
      const gap = Math.max(0, dim.requiredScore - dim.score);
      if (gap > 0) {
        gapItems.push({
          id: key,
          name: meta.name,
          fullName: meta.fullName,
          score: dim.score,
          requiredScore: dim.requiredScore,
          gap,
          weightPercent: meta.weightPercent,
          dataAvailability: "available",
          status: dim.status,
          statusLabel: dim.statusLabel,
          actionLink: meta.actionLink,
          actionLabel: meta.actionLabel,
          priorityScore: gap * (meta.weight / 0.25),
          recommendation: `Improve ${meta.name} by ${gap} pts to meet the ${dim.requiredScore} target benchmark.`,
        });
      }
    } else {
      // Missing high-impact dimensions
      gapItems.push({
        id: key,
        name: meta.name,
        fullName: meta.fullName,
        score: null,
        requiredScore: dim.requiredScore,
        gap: dim.requiredScore,
        weightPercent: meta.weightPercent,
        dataAvailability: dim.dataAvailability,
        status: "not_analyzed",
        statusLabel: "Not Started",
        actionLink: meta.actionLink,
        actionLabel: meta.actionLabel,
        priorityScore: meta.weightPercent * 1.5,
        recommendation: `Unlock ${meta.fullName} (${meta.weightPercent}% weight) by completing this assessment.`,
      });
    }
  }

  // Sort by highest priority / impact
  gapItems.sort((a, b) => b.priorityScore - a.priorityScore);

  return gapItems.slice(0, 3);
};

/**
 * Helper to build empty / incomplete readiness state
 */
const buildEmptyReadinessResponse = (message) => {
  const dimensions = {};
  for (const [key, meta] of Object.entries(DIMENSION_METADATA)) {
    dimensions[key] = {
      id: key,
      name: meta.name,
      fullName: meta.fullName,
      description: meta.description,
      actionLink: meta.actionLink,
      actionLabel: meta.actionLabel,
      canonicalWeight: meta.weight,
      canonicalWeightPercent: meta.weightPercent,
      effectiveWeightPercent: 0,
      score: null,
      status: "not_analyzed",
      statusLabel: "Not Analyzed",
      dataAvailability: "not_started",
      requiredScore: meta.defaultRequiredScore,
      gap: null,
      notes: meta.description,
    };
  }

  return {
    hasSufficientData: false,
    overallScore: null,
    overallStatus: getStatusFromScore(null),
    targetScore: 85,
    overallGap: null,
    statusLevelLabel: "Not Ready",
    activeWeightCoverage: 0,
    targetCompany: "Not Selected",
    targetJobRole: "Not Selected",
    targetCompanyNormalized: "",
    targetRoleNormalized: "",
    dimensions,
    topGaps: [
      {
        id: "profile",
        name: "Target Profile",
        fullName: "Target Company & Role",
        score: null,
        requiredScore: 85,
        gap: null,
        weightPercent: 100,
        dataAvailability: "insufficient_data",
        status: "not_analyzed",
        statusLabel: "Incomplete",
        actionLink: "/app/profile",
        actionLabel: "Set Target Profile",
        recommendation: "Choose your target company and job role to calculate personalized readiness.",
      },
      {
        id: "academics",
        name: "Academics",
        fullName: "Academic Profile",
        score: null,
        requiredScore: 75,
        gap: null,
        weightPercent: 10,
        dataAvailability: "insufficient_data",
        status: "not_analyzed",
        statusLabel: "Incomplete",
        actionLink: "/app/profile",
        actionLabel: "Enter CGPA",
        recommendation: "Add your CGPA in your profile to satisfy corporate academic cutoffs.",
      },
      {
        id: "resume",
        name: "Resume",
        fullName: "ATS Resume Strength",
        score: null,
        requiredScore: 85,
        gap: null,
        weightPercent: 15,
        dataAvailability: "not_started",
        status: "not_analyzed",
        statusLabel: "Not Started",
        actionLink: "/app/resume",
        actionLabel: "Analyze Resume",
        recommendation: "Upload and analyze your resume for ATS score benchmarks.",
      },
    ],
    explainability: {
      formula: "Σ(availableCategoryScore × categoryWeight) / Σ(availableCategoryWeights)",
      activeDimensionsCount: 0,
      totalDimensionsCount: 7,
      activeDimensions: [],
      pendingDimensions: Object.keys(DIMENSION_METADATA),
      activeWeightCoveragePercent: 0,
      isReNormalized: false,
      explanation:
        "Not enough baseline data to compute readiness. Complete your profile and choose your target company & role to begin tracking.",
    },
    message: message || "Not enough data yet — Complete your profile and choose target",
  };
};
