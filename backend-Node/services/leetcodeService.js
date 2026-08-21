import axios from "axios";

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

  // Strip query parameters and trailing slashes
  trimmed = trimmed.replace(/[?#].*$/, "").replace(/\/+$/, "");

  // If input contains leetcode.com URL pattern
  const urlMatch = trimmed.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_\-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].trim();
  }

  // Strip leading @
  if (trimmed.startsWith("@")) {
    trimmed = trimmed.slice(1);
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
 * LeetCode Public GraphQL query for fetching user profile, statistics, topics, and recent submissions.
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
    recentSubmissionList(username: $username, limit: 15) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
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
    const error = new Error("Invalid LeetCode username or URL format");
    error.statusCode = 400;
    throw error;
  }

  let response;
  try {
    response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: LEETCODE_GRAPHQL_QUERY,
        variables: { username: cleanUsername },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://leetcode.com",
        },
        timeout: 12000,
      }
    );
  } catch (err) {
    console.error("LeetCode GraphQL request failed:", err.message);
    const networkError = new Error(
      `Failed to connect to LeetCode API: ${err.message || "Network timeout"}`
    );
    networkError.statusCode = 502;
    throw networkError;
  }

  const data = response?.data?.data;

  // If user is not found on LeetCode
  if (!data || !data.matchedUser) {
    const notFoundError = new Error(
      `LeetCode user "${cleanUsername}" was not found. Please verify your username or public profile link.`
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

  // Normalize recent submissions
  const recentSubmissions = (data.recentSubmissionList || []).map((sub) => ({
    title: sub.title || "",
    titleSlug: sub.titleSlug || "",
    timestamp: String(sub.timestamp || ""),
    statusDisplay: sub.statusDisplay || "",
    lang: sub.lang || "",
  }));

  const ranking =
    matched.profile?.ranking !== undefined && matched.profile?.ranking !== null
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
    languages,
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
