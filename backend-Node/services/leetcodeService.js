import axios from "axios";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";

/**
 * Extracts and cleans a LeetCode username from a raw input string or profile URL.
 * Supports:
 * - "username"
 * - "https://leetcode.com/u/username/"
 * - "https://leetcode.com/u/username"
 * - "https://leetcode.com/username/"
 * - "https://leetcode.com/username"
 * - "@username"
 *
 * @param {string} input - Raw input string or URL
 * @returns {string} Cleaned username or empty string
 */
export const extractLeetCodeUsername = (input) => {
  if (!input || typeof input !== "string") return "";

  let trimmed = input.trim();

  // Strip query parameters and trailing slashes/hashes
  trimmed = trimmed.replace(/[?#].*$/, "").replace(/\/+$/, "");

  // If input contains leetcode.com or leetcode.cn URL pattern
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?leetcode\.(?:com|cn)\/(?:u\/)?([a-zA-Z0-9_\-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].trim();
  }

  // Strip leading @
  if (trimmed.startsWith("@")) {
    trimmed = trimmed.slice(1).trim();
  }

  // Handle generic URL format if passed without leetcode domain
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        if (parts[0] === "u" && parts.length > 1) {
          return parts[1].trim();
        }
        return parts[0].trim();
      }
    } catch {
      // Fallback
    }
  }

  // Validate standard username characters (letters, numbers, underscore, hyphen)
  const cleanMatch = trimmed.match(/^[a-zA-Z0-9_\-]+$/);
  if (cleanMatch) {
    return cleanMatch[0].trim();
  }

  return trimmed.split("/").filter(Boolean).pop()?.trim() || trimmed;
};

/**
 * LeetCode Public GraphQL query for fetching user profile, statistics, contest ranking, topics, and recent submissions.
 */
const LEETCODE_GRAPHQL_QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      profile {
        realName
        ranking
        userAvatar
        reputation
      }
      userCalendar {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      tagProblemCounts {
        advanced {
          tagName
          tagSlug
          problemsSolved
        }
        intermediate {
          tagName
          tagSlug
          problemsSolved
        }
        fundamental {
          tagName
          tagSlug
          problemsSolved
        }
      }
      languageProblemCount {
        languageName
        problemsSolved
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
      badge {
        name
      }
    }
    recentSubmissionList(username: $username, limit: 15) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
    recentAcSubmissionList(username: $username, limit: 15) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

/**
 * Fallback simplified GraphQL query in case contest or tag resolvers fail or time out
 */
const LEETCODE_CORE_GRAPHQL_QUERY = `
  query getUserProfileCore($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      profile {
        realName
        ranking
        userAvatar
        reputation
      }
      userCalendar {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      languageProblemCount {
        languageName
        problemsSolved
      }
    }
  }
`;

/**
 * Fetches public statistics from LeetCode GraphQL API for a given username.
 * Sanitizes and normalizes the payload into a structured snapshot.
 *
 * @param {string} rawUsername - Username or profile URL
 * @returns {Promise<Object>} Normalized LeetCode profile snapshot
 */
export const fetchLeetCodeStats = async (rawUsername) => {
  const cleanUsername = extractLeetCodeUsername(rawUsername);

  if (!cleanUsername) {
    const error = new Error("Please enter a valid LeetCode username or profile URL");
    error.statusCode = 400;
    throw error;
  }

  const requestHeaders = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Referer: "https://leetcode.com",
    Origin: "https://leetcode.com",
    Accept: "*/*",
  };

  let response;
  try {
    response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: LEETCODE_GRAPHQL_QUERY,
        variables: { username: cleanUsername },
      },
      {
        headers: requestHeaders,
        timeout: 12000,
      }
    );
  } catch (err) {
    if (err.response?.status === 429) {
      const rateLimitError = new Error(
        "LeetCode is temporarily limiting requests. We'll keep your last synced data and try again later."
      );
      rateLimitError.statusCode = 429;
      throw rateLimitError;
    }

    // Try fallback core query
    try {
      response = await axios.post(
        "https://leetcode.com/graphql",
        {
          query: LEETCODE_CORE_GRAPHQL_QUERY,
          variables: { username: cleanUsername },
        },
        {
          headers: requestHeaders,
          timeout: 10000,
        }
      );
    } catch (coreErr) {
      console.error("LeetCode GraphQL request failed:", coreErr.message || err.message);
      if (coreErr.response?.status === 429) {
        const rateLimitError = new Error(
          "LeetCode is temporarily limiting requests. We'll keep your last synced data and try again later."
        );
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
      const networkError = new Error(
        `LeetCode is temporarily unavailable (${coreErr.message || err.message || "Network timeout"}). Your previously synced data is still available.`
      );
      networkError.statusCode = 502;
      throw networkError;
    }
  }

  const data = response?.data?.data;
  const errors = response?.data?.errors;

  if (errors && (!data || !data.matchedUser)) {
    const errMsg = Array.isArray(errors) ? errors.map((e) => e.message).join("; ") : "LeetCode API Error";
    if (errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("does not exist")) {
      const notFoundError = new Error(
        `Couldn't find a LeetCode profile with username "${cleanUsername}". Please verify your username or public profile link.`
      );
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    const apiError = new Error(`LeetCode API service error: ${errMsg}`);
    apiError.statusCode = 502;
    throw apiError;
  }

  // If user is not found on LeetCode
  if (!data || !data.matchedUser) {
    const notFoundError = new Error(
      `Couldn't find a LeetCode profile with username "${cleanUsername}". Please verify your username or public profile link.`
    );
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  const matched = data.matchedUser;
  const acSubmissions = matched.submitStats?.acSubmissionNum || [];
  const totalSubmissions = matched.submitStats?.totalSubmissionNum || [];

  const totalSolved = acSubmissions.find((s) => s.difficulty === "All")?.count || 0;
  const easySolved = acSubmissions.find((s) => s.difficulty === "Easy")?.count || 0;
  const mediumSolved = acSubmissions.find((s) => s.difficulty === "Medium")?.count || 0;
  const hardSolved = acSubmissions.find((s) => s.difficulty === "Hard")?.count || 0;

  const totalAcSubmissionsCount =
    acSubmissions.find((s) => s.difficulty === "All")?.submissions || 0;
  const totalAllSubmissionsCount =
    totalSubmissions.find((s) => s.difficulty === "All")?.submissions || 0;

  const acceptanceRate =
    totalAllSubmissionsCount > 0
      ? Math.round((totalAcSubmissionsCount / totalAllSubmissionsCount) * 10000) / 100
      : 0;

  const rejectedSubmissions = Math.max(
    0,
    (Number(totalAllSubmissionsCount) || 0) - (Number(totalAcSubmissionsCount) || 0)
  );

  const efficiencyRatio =
    totalSolved > 0
      ? parseFloat((totalAllSubmissionsCount / totalSolved).toFixed(2))
      : null;

  const activeDays = Number(matched.userCalendar?.totalActiveDays) || 0;
  const streak = Number(matched.userCalendar?.streak) || 0;
  const submissionCalendar = matched.userCalendar?.submissionCalendar || "{}";

  const submissionStats = {
    acSubmissionNum: acSubmissions.map((s) => ({
      difficulty: s.difficulty || "",
      count: Number(s.count) || 0,
      submissions: Number(s.submissions) || 0,
    })),
    totalSubmissionNum: totalSubmissions.map((s) => ({
      difficulty: s.difficulty || "",
      count: Number(s.count) || 0,
      submissions: Number(s.submissions) || 0,
    })),
  };

  const totalQuestions =
    data.allQuestionsCount?.find((q) => q.difficulty === "All")?.count || 0;

  // Normalize topic tags
  const tagCounts = matched.tagProblemCounts || {};
  const allTags = [
    ...(tagCounts.fundamental || []),
    ...(tagCounts.intermediate || []),
    ...(tagCounts.advanced || []),
  ];

  const tagMap = new Map();
  for (const tag of allTags) {
    if (tag && tag.tagSlug) {
      const existing = tagMap.get(tag.tagSlug);
      const solved = Number(tag.problemsSolved) || 0;
      if (!existing || solved > existing.problemsSolved) {
        tagMap.set(tag.tagSlug, {
          tagName: tag.tagName || tag.tagSlug,
          tagSlug: tag.tagSlug,
          problemsSolved: solved,
        });
      }
    }
  }

  const topicTags = Array.from(tagMap.values()).sort(
    (a, b) => b.problemsSolved - a.problemsSolved
  );

  // Normalize languages
  const languages = (matched.languageProblemCount || [])
    .map((l) => ({
      languageName: l.languageName || "Unknown",
      problemsSolved: Number(l.problemsSolved) || 0,
    }))
    .sort((a, b) => b.problemsSolved - a.problemsSolved);

  // Dynamically identified primary language or null
  const primaryLanguage =
    languages.length > 0 && languages[0].problemsSolved > 0
      ? {
          name: languages[0].languageName,
          solved: languages[0].problemsSolved,
        }
      : null;

  // Normalize contest ranking (return null when unavailable, NOT fake 0)
  const contestData = data.userContestRanking;
  const contest = {
    rating:
      contestData && typeof contestData.rating === "number"
        ? Math.round(contestData.rating)
        : null,
    globalRank:
      contestData &&
      typeof contestData.globalRanking === "number" &&
      contestData.globalRanking > 0
        ? contestData.globalRanking
        : null,
    contestsAttended:
      contestData && typeof contestData.attendedContestsCount === "number"
        ? contestData.attendedContestsCount
        : null,
    totalParticipants:
      contestData && typeof contestData.totalParticipants === "number"
        ? contestData.totalParticipants
        : null,
    topPercentage:
      contestData && typeof contestData.topPercentage === "number"
        ? Math.round(contestData.topPercentage * 100) / 100
        : null,
    badge: contestData?.badge?.name || null,
  };

  // Normalize recent submissions (falling back to recentAcSubmissionList if needed)
  const rawRecentSubs =
    Array.isArray(data.recentSubmissionList) && data.recentSubmissionList.length > 0
      ? data.recentSubmissionList
      : Array.isArray(data.recentAcSubmissionList)
      ? data.recentAcSubmissionList
      : [];

  const recentSubmissions = rawRecentSubs.map((sub) => ({
    title: sub.title || "",
    titleSlug: sub.titleSlug || "",
    timestamp: String(sub.timestamp || ""),
    statusDisplay: sub.statusDisplay || "Accepted",
    lang: sub.lang || "",
  }));

  const ranking =
    matched.profile?.ranking !== undefined &&
    matched.profile?.ranking !== null &&
    Number(matched.profile.ranking) > 0 &&
    Number(matched.profile.ranking) < 5000000
      ? Number(matched.profile.ranking)
      : null;

  return {
    username: matched.username || cleanUsername,
    profileUrl: `https://leetcode.com/u/${matched.username || cleanUsername}/`,
    realName: matched.profile?.realName || "",
    ranking: ranking && ranking > 0 ? ranking : null,
    totalSolved: Number(totalSolved) || 0,
    easySolved: Number(easySolved) || 0,
    mediumSolved: Number(mediumSolved) || 0,
    hardSolved: Number(hardSolved) || 0,
    totalQuestions: Number(totalQuestions) || 0,
    acceptanceRate: Number(acceptanceRate) || 0,
    problemsSolved: {
      total: Number(totalSolved) || 0,
      easy: Number(easySolved) || 0,
      medium: Number(mediumSolved) || 0,
      hard: Number(hardSolved) || 0,
    },
    submissions: {
      total: Number(totalAllSubmissionsCount) || 0,
      accepted: Number(totalAcSubmissionsCount) || 0,
      rejected: Number(rejectedSubmissions) || 0,
      acceptanceRate: Number(acceptanceRate) || 0,
    },
    submissionStats,
    activeDays,
    streak,
    submissionCalendar,
    efficiencyRatio,
    contest,
    languages,
    primaryLanguage,
    topicTags,
    recentSubmissions,
    lastSyncedAt: new Date(),
    syncStatus: "synced",
    syncError: "",
  };
};

/**
 * Calculates algorithmic placement score (0-100) from LeetCode problem solving breakdown.
 * Formula:
 * - Easy: up to 25 pts (0.5 per problem, max 25)
 * - Medium: up to 55 pts (1.0 per problem, max 55)
 * - Hard: up to 20 pts (2.0 per problem, max 20)
 *
 * @param {Object} profile - LeetCodeProfile document or object
 * @returns {number} Score from 0 to 100
 */
export const calculateLeetCodeDsaScore = (profile) => {
  if (!profile) return 0;

  const easy = Number(profile.easySolved) || 0;
  const medium = Number(profile.mediumSolved) || 0;
  const hard = Number(profile.hardSolved) || 0;

  const easyScore = Math.min(25, easy * 0.5);
  const mediumScore = Math.min(55, medium * 1.0);
  const hardScore = Math.min(20, hard * 2.0);

  const totalScore = easyScore + mediumScore + hardScore;
  return Math.min(100, Math.max(0, Math.round(totalScore)));
};

/**
 * Calculates algorithmic placement level (0-10) from LeetCode profile.
 *
 * @param {Object} profile - LeetCodeProfile document or object
 * @returns {number} Level from 0.0 to 10.0
 */
export const calculateLeetCodeDsaLevel = (profile) => {
  const score = calculateLeetCodeDsaScore(profile);
  return Math.round((score / 10) * 10) / 10;
};

/**
 * Finds the number of problems solved in given topic slugs or keywords.
 *
 * @param {Object} profile - LeetCodeProfile object
 * @param {string[]} topicKeywords - Slugs or keywords (e.g. ['tree', 'binary-tree'])
 * @returns {number} Sum of problems solved
 */
export const getTopicProblemsSolved = (profile, topicKeywords = []) => {
  if (!profile || !Array.isArray(profile.topicTags) || profile.topicTags.length === 0) {
    return 0;
  }

  const lowerKeywords = topicKeywords.map((k) => k.toLowerCase());
  let count = 0;

  for (const tag of profile.topicTags) {
    const slug = (tag.tagSlug || "").toLowerCase();
    const name = (tag.tagName || "").toLowerCase();

    if (
      lowerKeywords.some(
        (kw) => slug.includes(kw) || name.includes(kw) || kw.includes(slug)
      )
    ) {
      count += Number(tag.problemsSolved) || 0;
    }
  }

  return count;
};

/**
 * Normalizes a LeetCodeProfile document into the standard API response structure.
 * Maintains backwards-compatible top-level keys and structured nested sub-objects.
 *
 * @param {Object} profile - LeetCodeProfile document or object
 * @returns {Object|null} Normalized response profile object
 */
/**
 * Classifies practice consistency archetype based on active days, streaks, and calendar activity.
 *
 * @param {number} activeDays - Total active days
 * @param {number} streak - Current streak
 * @param {number} totalSolved - Total solved count
 * @param {Object} calendarMap - Parsed submission calendar map (timestamp -> count)
 * @returns {Object} Archetype metadata { name, description, color, badge }
 */
export const classifyConsistencyArchetype = (
  activeDays = 0,
  streak = 0,
  totalSolved = 0,
  calendarMap = {}
) => {
  const days = Number(activeDays) || 0;
  const currentStreak = Number(streak) || 0;
  const solved = Number(totalSolved) || 0;

  // Count active days in the last 30 days if calendar data exists
  let recentActiveCount = 0;
  if (calendarMap && typeof calendarMap === "object" && !Array.isArray(calendarMap)) {
    const nowSec = Math.floor(Date.now() / 1000);
    const thirtyDaysSec = 30 * 24 * 60 * 60;
    for (const [timestamp, count] of Object.entries(calendarMap)) {
      const ts = Number(timestamp);
      if (ts && ts >= nowSec - thirtyDaysSec && Number(count) > 0) {
        recentActiveCount++;
      }
    }
  }

  if (currentStreak >= 14 || (days >= 90 && currentStreak >= 7) || recentActiveCount >= 22) {
    return {
      name: "Daily Practicer",
      description: "Consistent daily problem solver with sustained coding habits and strong algorithmic momentum.",
      color: "emerald",
      badge: "Daily Streak Master",
    };
  } else if (currentStreak >= 5 || days >= 30 || recentActiveCount >= 12) {
    return {
      name: "Regular Coder",
      description: "Frequent and dependable problem solving cadence with disciplined practice sessions.",
      color: "sky",
      badge: "Consistent Coder",
    };
  } else if (currentStreak >= 2 || days >= 10 || recentActiveCount >= 4) {
    return {
      name: "Moderate",
      description: "Steady episodic practice with good baseline momentum to transition into daily streaks.",
      color: "amber",
      badge: "Steady Learner",
    };
  } else if (days > 0 || solved > 0) {
    return {
      name: "Sporadic",
      description: "Occasional practice patterns; establishing a structured daily schedule will accelerate retention.",
      color: "orange",
      badge: "Emerging Coder",
    };
  } else {
    return {
      name: "Newcomer",
      description: "Beginning the algorithmic journey; solve daily challenges to unlock consistency badges.",
      color: "zinc",
      badge: "Explorer",
    };
  }
};

/**
 * Generates an in-depth submission and consistency analysis for an authenticated user's LeetCode profile.
 *
 * @param {string|mongoose.Types.ObjectId} userId - User ID
 * @returns {Promise<Object>} Structured submission analysis JSON
 */
export const getSubmissionAnalysis = async (userId) => {
  if (!userId) {
    const error = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }

  const profile = await LeetCodeProfile.findOne({ userId });

  if (!profile) {
    return {
      connected: false,
      message: "No connected LeetCode profile found for this account.",
      analysis: null,
    };
  }

  const total = Number(profile.problemsSolved?.total ?? profile.totalSolved ?? 0);
  const easy = Number(profile.problemsSolved?.easy ?? profile.easySolved ?? 0);
  const medium = Number(profile.problemsSolved?.medium ?? profile.mediumSolved ?? 0);
  const hard = Number(profile.problemsSolved?.hard ?? profile.hardSolved ?? 0);
  const totalQuestions = Number(profile.totalQuestions) || 4029;

  // Submissions extraction
  const acSubmissions = profile.submissionStats?.acSubmissionNum || [];
  const totalSubmissions = profile.submissionStats?.totalSubmissionNum || [];

  const getSubCount = (arr, diff, key) => {
    const entry = arr.find((s) => s.difficulty?.toLowerCase() === diff.toLowerCase());
    return Number(entry?.[key]) || 0;
  };

  const totalAllSubmissions =
    getSubCount(totalSubmissions, "All", "submissions") ||
    Number(profile.submissions?.total) ||
    0;
  const totalAcSubmissions =
    getSubCount(acSubmissions, "All", "submissions") ||
    Number(profile.submissions?.accepted) ||
    0;
  const totalRejectedSubmissions = Math.max(
    0,
    totalAllSubmissions - totalAcSubmissions
  );

  const overallAcceptanceRate =
    totalAllSubmissions > 0
      ? Math.round((totalAcSubmissions / totalAllSubmissions) * 10000) / 100
      : Number(profile.submissions?.acceptanceRate ?? profile.acceptanceRate ?? 0);

  const efficiencyRatio =
    total > 0
      ? Math.round((totalAllSubmissions / total) * 100) / 100
      : null;

  let efficiencyLabel = "N/A";
  let efficiencyDescription = "";
  if (efficiencyRatio !== null) {
    if (efficiencyRatio <= 1.8) {
      efficiencyLabel = "Exceptional Precision";
      efficiencyDescription = "High first-attempt accuracy, solving problems in under 1.8 submissions on average.";
    } else if (efficiencyRatio <= 2.8) {
      efficiencyLabel = "Strong & Balanced";
      efficiencyDescription = "Efficient iteration cycle with minimal debugging overhead.";
    } else if (efficiencyRatio <= 4.0) {
      efficiencyLabel = "Moderate Iteration";
      efficiencyDescription = "Solves problems with occasional re-submissions for edge cases.";
    } else {
      efficiencyLabel = "High Iteration";
      efficiencyDescription = "Extensive trial-and-error debugging; dry-running with edge cases will improve efficiency.";
    }
  }

  // Difficulty-level breakdown
  const easyAcSub = getSubCount(acSubmissions, "Easy", "submissions");
  const easyTotalSub = getSubCount(totalSubmissions, "Easy", "submissions");
  const easyAR =
    easyTotalSub > 0
      ? Math.round((easyAcSub / easyTotalSub) * 10000) / 100
      : null;
  const easyEfficiency =
    easy > 0 && easyTotalSub > 0
      ? Math.round((easyTotalSub / easy) * 100) / 100
      : null;

  const mediumAcSub = getSubCount(acSubmissions, "Medium", "submissions");
  const mediumTotalSub = getSubCount(totalSubmissions, "Medium", "submissions");
  const mediumAR =
    mediumTotalSub > 0
      ? Math.round((mediumAcSub / mediumTotalSub) * 10000) / 100
      : null;
  const mediumEfficiency =
    medium > 0 && mediumTotalSub > 0
      ? Math.round((mediumTotalSub / medium) * 100) / 100
      : null;

  const hardAcSub = getSubCount(acSubmissions, "Hard", "submissions");
  const hardTotalSub = getSubCount(totalSubmissions, "Hard", "submissions");
  const hardAR =
    hardTotalSub > 0
      ? Math.round((hardAcSub / hardTotalSub) * 10000) / 100
      : null;
  const hardEfficiency =
    hard > 0 && hardTotalSub > 0
      ? Math.round((hardTotalSub / hard) * 100) / 100
      : null;

  // Parse submission calendar
  let calendarMap = {};
  try {
    const parsed =
      typeof profile.submissionCalendar === "string"
        ? JSON.parse(profile.submissionCalendar || "{}")
        : profile.submissionCalendar;
    calendarMap =
      parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    calendarMap = {};
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const thirtyDaysSec = 30 * 24 * 60 * 60;
  let totalCalendarSubmissions = 0;
  let activeCalendarDaysCount = 0;
  let recent30DaysActiveDays = 0;
  let recent30DaysSubmissions = 0;
  let lastActiveTimestamp = null;

  const calendarEntries = Object.entries(calendarMap)
    .map(([tsStr, count]) => {
      const ts = Number(tsStr);
      const c = Number(count) || 0;
      return { timestamp: ts, count: c };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  for (const entry of calendarEntries) {
    if (entry.count > 0) {
      totalCalendarSubmissions += entry.count;
      activeCalendarDaysCount++;
      if (entry.timestamp >= nowSec - thirtyDaysSec) {
        recent30DaysActiveDays++;
        recent30DaysSubmissions += entry.count;
      }
      if (!lastActiveTimestamp || entry.timestamp > lastActiveTimestamp) {
        lastActiveTimestamp = entry.timestamp;
      }
    }
  }

  const activeDays = Number(profile.activeDays) || activeCalendarDaysCount;
  const streak = Number(profile.streak) || 0;
  const archetypeInfo = classifyConsistencyArchetype(activeDays, streak, total, calendarMap);

  // Recent Submissions Quality
  const recentSubmissions = Array.isArray(profile.recentSubmissions)
    ? profile.recentSubmissions
    : [];

  const verdictDistribution = {
    accepted: 0,
    wrongAnswer: 0,
    timeLimitExceeded: 0,
    runtimeError: 0,
    compileError: 0,
    memoryLimitExceeded: 0,
    other: 0,
  };

  const formattedRecent = recentSubmissions.map((sub) => {
    const status = (sub.statusDisplay || "").trim();
    const isAccepted = status.toLowerCase() === "accepted";

    if (isAccepted) {
      verdictDistribution.accepted++;
    } else if (status.toLowerCase().includes("wrong answer")) {
      verdictDistribution.wrongAnswer++;
    } else if (status.toLowerCase().includes("time limit")) {
      verdictDistribution.timeLimitExceeded++;
    } else if (status.toLowerCase().includes("runtime")) {
      verdictDistribution.runtimeError++;
    } else if (status.toLowerCase().includes("compile")) {
      verdictDistribution.compileError++;
    } else if (status.toLowerCase().includes("memory")) {
      verdictDistribution.memoryLimitExceeded++;
    } else {
      verdictDistribution.other++;
    }

    let dateFormatted = "";
    if (sub.timestamp) {
      const tsNum = Number(sub.timestamp);
      if (!isNaN(tsNum) && tsNum > 0) {
        const d = new Date(tsNum * 1000);
        dateFormatted = d.toISOString();
      }
    }

    return {
      title: sub.title || sub.titleSlug || "Problem",
      titleSlug: sub.titleSlug || "",
      timestamp: sub.timestamp || "",
      formattedDate: dateFormatted,
      statusDisplay: sub.statusDisplay || "Submitted",
      isAccepted,
      lang: sub.lang || "",
    };
  });

  const totalRecent = formattedRecent.length;
  const acceptedRecent = verdictDistribution.accepted;
  const recentPassRate =
    totalRecent > 0 ? Math.round((acceptedRecent / totalRecent) * 100) : 0;

  let qualityLevel = "No Data";
  let qualityComment = "No recent submission activity recorded.";
  if (totalRecent > 0) {
    if (recentPassRate >= 80) {
      qualityLevel = "Exceptional";
      qualityComment = "High first-try correctness on recent problem solving attempts.";
    } else if (recentPassRate >= 60) {
      qualityLevel = "Solid";
      qualityComment = "Good pass rate with quick resolution of edge cases.";
    } else if (recentPassRate >= 40) {
      qualityLevel = "Moderate";
      qualityComment = "Occasional failed attempts; dry-run logic before hitting submit.";
    } else {
      qualityLevel = "Needs Review";
      qualityComment = "High rejection rate in recent submissions; focus on edge cases and constraints.";
    }
  }

  // Languages distribution
  const languages = Array.isArray(profile.languages) ? profile.languages : [];
  const totalLangSolved = languages.reduce(
    (sum, l) => sum + (Number(l.problemsSolved) || 0),
    0
  );
  const languageDistribution = languages.map((l) => {
    const count = Number(l.problemsSolved) || 0;
    const isPrimary =
      profile.primaryLanguage?.name === l.languageName ||
      (languages[0]?.languageName === l.languageName && count > 0);
    return {
      languageName: l.languageName,
      problemsSolved: count,
      percentage: totalLangSolved > 0 ? Math.round((count / totalLangSolved) * 100) : 0,
      isPrimary: Boolean(isPrimary),
    };
  });

  // Dynamic actionable insights
  const insights = [];

  if (efficiencyRatio !== null) {
    if (efficiencyRatio <= 2.2) {
      insights.push(
        `High submission efficiency of ${efficiencyRatio} submissions/problem demonstrates thorough code planning before execution.`
      );
    } else {
      insights.push(
        `Average of ${efficiencyRatio} submissions per solved problem suggests testing custom edge cases locally before submission to raise first-attempt accuracy.`
      );
    }
  }

  if (mediumAR !== null && mediumTotalSub > 0) {
    insights.push(
      `Medium difficulty acceptance rate is ${mediumAR}% across ${mediumTotalSub} submissions (${medium} solved), which is a key placement benchmark.`
    );
  }

  if (streak > 0 || activeDays > 0) {
    insights.push(
      `Practice consistency: ${streak}-day active streak with ${activeDays} total active coding days (${archetypeInfo.name} archetype).`
    );
  }

  if (languageDistribution.length > 0) {
    const primary = languageDistribution[0];
    insights.push(
      `Primary implementation language is ${primary.languageName} (${primary.problemsSolved} problems solved, ${primary.percentage}% of total solved).`
    );
  }

  return {
    connected: true,
    analysis: {
      profile: {
        username: profile.username,
        realName: profile.realName || "",
        profileUrl: profile.profileUrl || `https://leetcode.com/u/${profile.username}/`,
        ranking: profile.ranking || null,
        lastSyncedAt: profile.lastSyncedAt || null,
      },
      overview: {
        totalSolved: total,
        totalQuestions,
        solvedPercentage:
          totalQuestions > 0
            ? Math.round((total / totalQuestions) * 10000) / 100
            : 0,
        totalSubmissions: totalAllSubmissions,
        acceptedSubmissions: totalAcSubmissions,
        rejectedSubmissions: totalRejectedSubmissions,
        overallAcceptanceRate,
        efficiencyRatio,
        efficiencyLabel,
        efficiencyDescription,
      },
      difficultyBreakdown: {
        easy: {
          difficulty: "Easy",
          solved: easy,
          acceptedSubmissions: easyAcSub,
          totalSubmissions: easyTotalSub,
          acceptanceRate: easyAR,
          efficiencyRatio: easyEfficiency,
        },
        medium: {
          difficulty: "Medium",
          solved: medium,
          acceptedSubmissions: mediumAcSub,
          totalSubmissions: mediumTotalSub,
          acceptanceRate: mediumAR,
          efficiencyRatio: mediumEfficiency,
        },
        hard: {
          difficulty: "Hard",
          solved: hard,
          acceptedSubmissions: hardAcSub,
          totalSubmissions: hardTotalSub,
          acceptanceRate: hardAR,
          efficiencyRatio: hardEfficiency,
        },
      },
      consistency: {
        activeDays,
        streak,
        archetype: archetypeInfo.name,
        archetypeDescription: archetypeInfo.description,
        archetypeBadge: archetypeInfo.badge,
        archetypeColor: archetypeInfo.color,
        activitySummary: {
          totalCalendarSubmissions,
          activeCalendarDaysCount,
          recent30DaysActiveDays,
          recent30DaysSubmissions,
          lastActiveDate: lastActiveTimestamp
            ? new Date(lastActiveTimestamp * 1000).toISOString()
            : null,
        },
        calendarMap,
      },
      recentSubmissionsAnalysis: {
        totalRecent,
        acceptedCount: acceptedRecent,
        rejectedCount: Math.max(0, totalRecent - acceptedRecent),
        passRate: recentPassRate,
        verdictDistribution,
        recentList: formattedRecent,
        qualityAssessment: {
          level: qualityLevel,
          comment: qualityComment,
        },
      },
      languageDistribution,
      insights,
    },
  };
};

/**
 * Normalizes a LeetCodeProfile document into the standard API response structure.
 * Maintains backwards-compatible top-level keys and structured nested sub-objects.
 *
 * @param {Object} profile - LeetCodeProfile document or object
 * @returns {Object|null} Normalized response profile object
 */
export const formatLeetCodeProfileResponse = (profile) => {
  if (!profile) return null;

  const doc = profile.toObject ? profile.toObject() : { ...profile };

  const isFailedUnsynced = doc.syncStatus === "failed" && !doc.lastSyncedAt;

  const total = isFailedUnsynced ? null : Number(doc.problemsSolved?.total ?? doc.totalSolved ?? 0);
  const easy = isFailedUnsynced ? null : Number(doc.problemsSolved?.easy ?? doc.easySolved ?? 0);
  const medium = isFailedUnsynced ? null : Number(doc.problemsSolved?.medium ?? doc.mediumSolved ?? 0);
  const hard = isFailedUnsynced ? null : Number(doc.problemsSolved?.hard ?? doc.hardSolved ?? 0);

  const problemsSolved = {
    total,
    easy,
    medium,
    hard,
  };

  const totalSub = isFailedUnsynced ? null : Number(doc.submissions?.total ?? (doc.totalSolved > 0 ? doc.totalSolved : 0));
  const acceptedSub = isFailedUnsynced ? null : Number(doc.submissions?.accepted ?? doc.totalSolved ?? 0);
  const rejectedSub = isFailedUnsynced ? null : Number(
    doc.submissions?.rejected ?? Math.max(0, (totalSub || 0) - (acceptedSub || 0))
  );
  const rate = isFailedUnsynced ? null : Number(doc.submissions?.acceptanceRate ?? doc.acceptanceRate ?? 0);

  const submissions = {
    total: totalSub,
    accepted: acceptedSub,
    rejected: rejectedSub,
    acceptanceRate: rate,
  };

  const languages = Array.isArray(doc.languages) ? doc.languages : [];
  const primaryLanguage =
    doc.primaryLanguage?.name
      ? {
          name: doc.primaryLanguage.name,
          solved: Number(doc.primaryLanguage.solved) || 0,
        }
      : languages.length > 0 && languages[0].problemsSolved > 0
      ? {
          name: languages[0].languageName,
          solved: Number(languages[0].problemsSolved) || 0,
        }
      : null;

  const contest = {
    rating: typeof doc.contest?.rating === "number" ? doc.contest.rating : null,
    globalRank: typeof doc.contest?.globalRank === "number" ? doc.contest.globalRank : null,
    contestsAttended:
      typeof doc.contest?.contestsAttended === "number" ? doc.contest.contestsAttended : null,
    totalParticipants:
      typeof doc.contest?.totalParticipants === "number" ? doc.contest.totalParticipants : null,
    topPercentage:
      typeof doc.contest?.topPercentage === "number" ? doc.contest.topPercentage : null,
    badge: doc.contest?.badge || null,
  };

  const submissionStats = doc.submissionStats || {
    acSubmissionNum: [],
    totalSubmissionNum: [],
  };

  const activeDays = isFailedUnsynced ? null : Number(doc.activeDays) || 0;
  const streak = isFailedUnsynced ? null : Number(doc.streak) || 0;
  const submissionCalendar =
    typeof doc.submissionCalendar === "string"
      ? doc.submissionCalendar
      : JSON.stringify(doc.submissionCalendar || {});
  const efficiencyRatio =
    !isFailedUnsynced && doc.efficiencyRatio !== undefined && doc.efficiencyRatio !== null
      ? Number(doc.efficiencyRatio)
      : null;

  let calendarMap = {};
  try {
    const parsed =
      typeof doc.submissionCalendar === "string"
        ? JSON.parse(doc.submissionCalendar || "{}")
        : doc.submissionCalendar;
    calendarMap =
      parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    calendarMap = {};
  }

  const archetypeInfo = classifyConsistencyArchetype(activeDays || 0, streak || 0, total || 0, calendarMap);

  const cleanRanking =
    typeof doc.ranking === "number" && doc.ranking > 0 && doc.ranking < 5000000
      ? doc.ranking
      : null;

  return {
    _id: doc._id,
    userId: doc.userId,
    username: doc.username || "",
    profileUrl:
      doc.profileUrl || (doc.username ? `https://leetcode.com/u/${doc.username}/` : ""),
    realName: doc.realName || "",
    ranking: cleanRanking,
    totalSolved: total,
    easySolved: easy,
    mediumSolved: medium,
    hardSolved: hard,
    totalQuestions: Number(doc.totalQuestions) || 0,
    acceptanceRate: rate,
    problemsSolved,
    submissions,
    submissionStats,
    activeDays,
    streak,
    submissionCalendar,
    efficiencyRatio,
    consistencyArchetype: archetypeInfo.name,
    languages,
    primaryLanguage,
    contest,
    topicTags: doc.topicTags || [],
    recentSubmissions: doc.recentSubmissions || [],
    lastSyncedAt: doc.lastSyncedAt || null,
    syncStatus: doc.syncStatus || "pending",
    syncError: doc.syncError || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};
