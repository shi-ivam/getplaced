import axios from "axios";
import GitHubProfile from "../models/githubProfileModel.js";

/**
 * Extracts and cleans a GitHub username from a raw input string or profile URL.
 * Supports:
 * - "username"
 * - "@username"
 * - "https://github.com/username"
 * - "https://github.com/username/"
 * - "https://github.com/username?tab=repositories"
 * - "http://github.com/username"
 * - "github.com/username"
 *
 * @param {string} input - Raw input string or URL
 * @returns {string} Cleaned username or empty string
 */
export const extractGitHubUsername = (input) => {
  if (!input || typeof input !== "string") return "";

  let trimmed = input.trim();

  // Strip query parameters and hashes
  trimmed = trimmed.replace(/[?#].*$/, "").replace(/\/+$/, "");

  // Match github.com/username pattern
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].trim();
  }

  // Strip leading @
  if (trimmed.startsWith("@")) {
    trimmed = trimmed.slice(1);
  }

  // Generic URL fallback
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        return parts[0].trim();
      }
    } catch {
      // Ignore URL parse error
    }
  }

  // Validate GitHub username pattern (alphanumeric and single hyphens, 1-39 chars)
  const cleanMatch = trimmed.match(/^[a-zA-Z0-9_\-]+$/);
  if (cleanMatch) {
    return cleanMatch[0].trim();
  }

  return trimmed.split("/").filter(Boolean).pop()?.trim() || trimmed;
};

/**
 * Calculates project dimension placement score (0-100) based on repository count,
 * star & fork engagement, language diversity, and project completeness.
 *
 * @param {Object} profile - GitHub profile document or extracted stats object
 * @returns {number} Score from 0 to 100
 */
export const calculateGitHubProjectScore = (profile) => {
  if (!profile) return 0;

  const originalCount = Number(profile.originalReposCount) || 0;
  const totalStars = Number(profile.totalStars) || 0;
  const totalForks = Number(profile.totalForks) || 0;
  const languages = Array.isArray(profile.languages) ? profile.languages : [];
  const repos = Array.isArray(profile.repositories) ? profile.repositories : [];

  // 1. Original Repositories & Portfolio Depth (Max: 35 pts)
  let repoBreadthScore = 0;
  if (originalCount >= 5) {
    repoBreadthScore = 35;
  } else if (originalCount === 4) {
    repoBreadthScore = 30;
  } else if (originalCount === 3) {
    repoBreadthScore = 25;
  } else if (originalCount === 2) {
    repoBreadthScore = 20;
  } else if (originalCount === 1) {
    repoBreadthScore = 12;
  } else if (Number(profile.publicReposCount) > 0) {
    repoBreadthScore = 6;
  }

  // 2. External Validation & Engagement (Stars & Forks) (Max: 25 pts)
  const starPoints = Math.min(20, totalStars * 2);
  const forkPoints = Math.min(5, totalForks * 1.5);
  const engagementScore = Math.min(25, starPoints + forkPoints);

  // 3. Language & Technology Stack Diversity (Max: 20 pts)
  const distinctLanguagesCount = languages.filter(
    (l) => l.languageName && l.languageName !== "Unknown"
  ).length;

  let languageScore = 0;
  if (distinctLanguagesCount >= 3) {
    languageScore = 20;
  } else if (distinctLanguagesCount === 2) {
    languageScore = 14;
  } else if (distinctLanguagesCount === 1) {
    languageScore = 8;
  }

  // 4. Completeness, Live Demos & Documentation (Max: 20 pts)
  let liveDemoCount = 0;
  let wellDocumentedCount = 0;

  for (const repo of repos) {
    if (repo.hasLiveDemo || (repo.homepage && repo.homepage.startsWith("http"))) {
      liveDemoCount++;
    }
    const hasDescription = Boolean(repo.description && repo.description.trim().length > 10);
    const hasTopics = Array.isArray(repo.topics) && repo.topics.length > 0;
    if (hasDescription || hasTopics) {
      wellDocumentedCount++;
    }
  }

  const liveDemoPoints = Math.min(12, liveDemoCount * 6);
  const docPoints = Math.min(8, wellDocumentedCount * 2);
  const completenessScore = Math.min(20, liveDemoPoints + docPoints);

  const totalScore = repoBreadthScore + engagementScore + languageScore + completenessScore;
  return Math.min(100, Math.max(0, Math.round(totalScore)));
};

/**
 * Fetches public user profile and repositories from GitHub REST API v3.
 * Supports optional GITHUB_TOKEN environment variable for higher rate limits.
 *
 * @param {string} rawUsername - GitHub username or profile URL
 * @returns {Promise<Object>} Normalized GitHub profile snapshot ready for storage
 */
/**
 * Fallback parser that scrapes public GitHub profile and repository pages
 * when the official REST API rate limit is exceeded.
 *
 * @param {string} cleanUsername - Normalized GitHub username
 * @returns {Promise<Object>} Formatted profile data object
 */
export const scrapeGitHubUserDataFallback = async (cleanUsername) => {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  let mainRes;
  try {
    mainRes = await axios.get(`https://github.com/${encodeURIComponent(cleanUsername)}`, {
      headers,
      timeout: 12000,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      const notFoundError = new Error(
        `GitHub user "${cleanUsername}" was not found. Please verify your username or public profile link.`
      );
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    throw err;
  }

  const reposRes = await axios
    .get(`https://github.com/${encodeURIComponent(cleanUsername)}?tab=repositories`, {
      headers,
      timeout: 12000,
    })
    .catch(() => ({ data: "" }));

  const mainHtml = mainRes.data || "";
  const reposHtml = reposRes.data || "";

  // Extract Avatar
  const avatarMatch =
    mainHtml.match(/class="[^"]*avatar-user[^"]*"[^>]*src="([^"]+)"/i) ||
    mainHtml.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*avatar[^"]*"/i) ||
    mainHtml.match(/<img[^>]*class="[^"]*avatar[^"]*"[^>]*src="([^"]+)"/i);
  let avatarUrl = avatarMatch ? avatarMatch[1].replace(/&amp;/g, "&") : "";

  // Extract Name
  const nameMatch = mainHtml.match(/<span[^>]*class="[^"]*p-name[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  const name = nameMatch ? nameMatch[1].trim() : "";

  // Extract Bio
  const bioMatch =
    mainHtml.match(/<div[^>]*class="[^"]*p-note[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    mainHtml.match(/<div[^>]*class="[^"]*user-profile-bio[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const bio = bioMatch ? bioMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  // Extract Location & Company
  const locMatch =
    mainHtml.match(/itemprop="homeLocation"[^>]*>([\s\S]*?)<\/li>/i) ||
    mainHtml.match(/<span class="p-label">([\s\S]*?)<\/span>/i);
  const location = locMatch ? locMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  const compMatch = mainHtml.match(/itemprop="worksFor"[^>]*>([\s\S]*?)<\/li>/i);
  const company = compMatch ? compMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  // Extract Followers / Following
  let followers = 0;
  let following = 0;
  const followersMatch = mainHtml.match(
    /href="[^"]*tab=followers"[^>]*>[\s\S]*?<span[^>]*class="[^"]*text-bold[^"]*"[^>]*>([\s\S]*?)<\/span>/i
  );
  if (followersMatch) {
    const raw = followersMatch[1].trim().replace(/,/g, "");
    followers = raw.endsWith("k") ? Math.round(parseFloat(raw) * 1000) : parseInt(raw, 10) || 0;
  }
  const followingMatch = mainHtml.match(
    /href="[^"]*tab=following"[^>]*>[\s\S]*?<span[^>]*class="[^"]*text-bold[^"]*"[^>]*>([\s\S]*?)<\/span>/i
  );
  if (followingMatch) {
    const raw = followingMatch[1].trim().replace(/,/g, "");
    following = raw.endsWith("k") ? Math.round(parseFloat(raw) * 1000) : parseInt(raw, 10) || 0;
  }

  // Extract Repositories
  const repoBlocks = reposHtml.split(/<li[^>]*itemprop="owns"[^>]*>/i).slice(1);
  const repositories = [];
  const languageMap = new Map();
  let totalStars = 0;
  let totalForks = 0;
  let originalReposCount = 0;
  let forkedReposCount = 0;

  for (const block of repoBlocks) {
    const nameM =
      block.match(
        /itemprop="name codeRepository"[^>]*>[\s\S]*?<a[^>]*href="\/([^"/]+)\/([^"/]+)"[^>]*>([\s\S]*?)<\/a>/i
      ) || block.match(/<a[^>]*href="\/([^"/]+)\/([^"/]+)"[^>]*itemprop="name codeRepository"/i);
    if (!nameM) continue;
    const repoName = (nameM[3] || nameM[2]).replace(/<[^>]+>/g, "").trim();

    const descM = block.match(/itemprop="description"[^>]*>([\s\S]*?)<\/p>/i);
    const description = descM ? descM[1].replace(/<[^>]+>/g, "").trim() : "";

    const langM = block.match(/itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i);
    const language = langM ? langM[1].trim() : "";

    const starM = block.match(
      /href="\/[^"/]+\/[^"/]+\/stargazers"[^>]*>[\s\S]*?<\/svg>([\s\S]*?)<\/a>/i
    );
    let stars = 0;
    if (starM) {
      const raw = starM[1].replace(/<[^>]+>/g, "").trim().replace(/,/g, "");
      stars = raw.endsWith("k") ? Math.round(parseFloat(raw) * 1000) : parseInt(raw, 10) || 0;
    }

    const forkM = block.match(
      /href="\/[^"/]+\/[^"/]+\/forks"[^>]*>[\s\S]*?<\/svg>([\s\S]*?)<\/a>/i
    );
    let forks = 0;
    if (forkM) {
      const raw = forkM[1].replace(/<[^>]+>/g, "").trim().replace(/,/g, "");
      forks = raw.endsWith("k") ? Math.round(parseFloat(raw) * 1000) : parseInt(raw, 10) || 0;
    }

    const isFork = block.includes("forked from");
    if (isFork) forkedReposCount++;
    else originalReposCount++;

    totalStars += stars;
    totalForks += forks;
    if (language) {
      languageMap.set(language, (languageMap.get(language) || 0) + 1);
    }

    repositories.push({
      githubId: null,
      name: repoName,
      fullName: `${cleanUsername}/${repoName}`,
      description,
      htmlUrl: `https://github.com/${cleanUsername}/${repoName}`,
      homepage: "",
      language,
      topics: [],
      stars,
      forks,
      watchers: stars,
      openIssues: 0,
      size: 100,
      isFork,
      isArchived: false,
      createdAt: null,
      updatedAt: null,
      pushedAt: null,
      defaultBranch: "main",
      hasLiveDemo: false,
      liveDemoUrl: "",
    });
  }

  // Calculate language distribution
  const totalReposWithLanguage = Array.from(languageMap.values()).reduce((a, b) => a + b, 0);
  const languages = Array.from(languageMap.entries())
    .map(([languageName, repoCount]) => ({
      languageName,
      repoCount,
      percentage:
        totalReposWithLanguage > 0
          ? Math.round((repoCount / totalReposWithLanguage) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.repoCount - a.repoCount);

  // Top repositories
  const originalRepos = repositories.filter((r) => !r.isFork);
  const forkedRepos = repositories.filter((r) => r.isFork);
  originalRepos.sort((a, b) => b.stars - a.stars);
  forkedRepos.sort((a, b) => b.stars - a.stars);

  let topRepositories = originalRepos.slice(0, 6);
  if (topRepositories.length < 6 && forkedRepos.length > 0) {
    const remaining = 6 - topRepositories.length;
    topRepositories = topRepositories.concat(forkedRepos.slice(0, remaining));
  }

  const profileData = {
    username: cleanUsername,
    profileUrl: `https://github.com/${cleanUsername}`,
    avatarUrl,
    name,
    bio,
    company,
    location,
    blog: "",
    publicReposCount: repositories.length,
    followers,
    following,
    totalStars,
    totalForks,
    originalReposCount,
    forkedReposCount,
    repositories,
    languages,
    topRepositories,
    lastSyncedAt: new Date(),
    syncStatus: "synced",
    syncError: "",
  };

  profileData.projectScore = calculateGitHubProjectScore(profileData);
  return profileData;
};

/**
 * Fetches public user profile and repositories from GitHub REST API v3 with automatic
 * web scraper fallback if API rate limits are reached.
 * Supports optional GITHUB_TOKEN environment variable for higher rate limits.
 *
 * @param {string} rawUsername - GitHub username or profile URL
 * @returns {Promise<Object>} Normalized GitHub profile snapshot ready for storage
 */
export const fetchGitHubUserData = async (rawUsername) => {
  const cleanUsername = extractGitHubUsername(rawUsername);

  if (!cleanUsername) {
    const error = new Error("Invalid GitHub username or profile URL format");
    error.statusCode = 400;
    throw error;
  }

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "getPlaced-Platform-App/1.0",
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization =
      token.startsWith("Bearer ") || token.startsWith("token ")
        ? token
        : `Bearer ${token}`;
  }

  let userResponse;
  let reposResponse;

  try {
    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
        headers,
        timeout: 12000,
      }),
      axios.get(
        `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=updated`,
        {
          headers,
          timeout: 12000,
        }
      ),
    ]);

    userResponse = userRes.data;
    reposResponse = Array.isArray(reposRes.data) ? reposRes.data : [];
  } catch (err) {
    console.warn("GitHub REST API request failed:", err.message, "- trying fallback profile reader");

    if (err.response?.status === 404) {
      const notFoundError = new Error(
        `GitHub user "${cleanUsername}" was not found. Please verify your username or public profile link.`
      );
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    // If rate limited or restricted, fall back to public profile reader
    try {
      return await scrapeGitHubUserDataFallback(cleanUsername);
    } catch (fallbackErr) {
      if (fallbackErr.statusCode === 404) {
        throw fallbackErr;
      }
      if (err.response?.status === 403) {
        const rateLimitError = new Error(
          "GitHub API rate limit reached and fallback reader timed out. Please try again in a moment."
        );
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }

      const networkError = new Error(
        `Failed to connect to GitHub: ${err.message || "Network error"}`
      );
      networkError.statusCode = 502;
      throw networkError;
    }
  }

  const rawRepos = reposResponse;

  let totalStars = 0;
  let totalForks = 0;
  let originalReposCount = 0;
  let forkedReposCount = 0;
  const languageMap = new Map();

  const repositories = rawRepos.map((repo) => {
    const stars = Number(repo.stargazers_count) || 0;
    const forks = Number(repo.forks_count) || 0;
    const watchers = Number(repo.watchers_count) || 0;
    const openIssues = Number(repo.open_issues_count) || 0;
    const size = Number(repo.size) || 0;
    const isFork = Boolean(repo.fork);
    const isArchived = Boolean(repo.archived);
    const language = repo.language || "";

    totalStars += stars;
    totalForks += forks;
    if (isFork) {
      forkedReposCount++;
    } else {
      originalReposCount++;
    }

    if (language) {
      languageMap.set(language, (languageMap.get(language) || 0) + 1);
    }

    const homepage = (repo.homepage || "").trim();
    const hasLiveDemo = Boolean(
      homepage && (homepage.startsWith("http://") || homepage.startsWith("https://"))
    );

    return {
      githubId: repo.id || null,
      name: repo.name || "",
      fullName: repo.full_name || repo.name || "",
      description: repo.description || "",
      htmlUrl: repo.html_url || `https://github.com/${cleanUsername}/${repo.name}`,
      homepage,
      language,
      topics: Array.isArray(repo.topics) ? repo.topics : [],
      stars,
      forks,
      watchers,
      openIssues,
      size,
      isFork,
      isArchived,
      createdAt: repo.created_at ? new Date(repo.created_at) : null,
      updatedAt: repo.updated_at ? new Date(repo.updated_at) : null,
      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      defaultBranch: repo.default_branch || "main",
      hasLiveDemo,
      liveDemoUrl: hasLiveDemo ? homepage : "",
    };
  });

  // Calculate language frequency distribution
  const totalReposWithLanguage = Array.from(languageMap.values()).reduce((a, b) => a + b, 0);
  const languages = Array.from(languageMap.entries())
    .map(([languageName, repoCount]) => ({
      languageName,
      repoCount,
      percentage:
        totalReposWithLanguage > 0
          ? Math.round((repoCount / totalReposWithLanguage) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.repoCount - a.repoCount);

  // Identify top 6 featured repositories (prioritizing original projects with stars & activity)
  const originalRepos = repositories.filter((r) => !r.isFork);
  const forkedRepos = repositories.filter((r) => r.isFork);

  const sortRepoRank = (a, b) => {
    // 1. Stars count
    if (b.stars !== a.stars) return b.stars - a.stars;
    // 2. Has live demo
    if (b.hasLiveDemo !== a.hasLiveDemo) return b.hasLiveDemo ? 1 : -1;
    // 3. Recency of push
    const bPush = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
    const aPush = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
    if (bPush !== aPush) return bPush - aPush;
    // 4. Repo size
    return b.size - a.size;
  };

  originalRepos.sort(sortRepoRank);
  forkedRepos.sort(sortRepoRank);

  let topRepositories = originalRepos.slice(0, 6);
  if (topRepositories.length < 6 && forkedRepos.length > 0) {
    const remaining = 6 - topRepositories.length;
    topRepositories = topRepositories.concat(forkedRepos.slice(0, remaining));
  }

  const profileData = {
    username: userResponse.login || cleanUsername,
    profileUrl: userResponse.html_url || `https://github.com/${cleanUsername}`,
    avatarUrl: userResponse.avatar_url || "",
    name: userResponse.name || "",
    bio: userResponse.bio || "",
    company: userResponse.company || "",
    location: userResponse.location || "",
    blog: userResponse.blog || "",
    publicReposCount: Number(userResponse.public_repos) || repositories.length,
    followers: Number(userResponse.followers) || 0,
    following: Number(userResponse.following) || 0,
    totalStars,
    totalForks,
    originalReposCount,
    forkedReposCount,
    repositories,
    languages,
    topRepositories,
    lastSyncedAt: new Date(),
    syncStatus: "synced",
    syncError: "",
  };

  profileData.projectScore = calculateGitHubProjectScore(profileData);

  return profileData;
};

/**
 * Normalizes a GitHubProfile document or object into the standard API response structure.
 *
 * @param {Object} profile - GitHubProfile document or plain object
 * @returns {Object|null} Normalized response profile object
 */
export const formatGitHubProfileResponse = (profile) => {
  if (!profile) return null;

  const doc = profile.toObject ? profile.toObject() : { ...profile };

  const projectScore =
    doc.projectScore !== undefined && doc.projectScore !== null
      ? Number(doc.projectScore)
      : calculateGitHubProjectScore(doc);

  let scoreTier = "Developing";
  if (projectScore >= 85) scoreTier = "Exceptional";
  else if (projectScore >= 70) scoreTier = "Strong";
  else if (projectScore >= 50) scoreTier = "Solid";
  else if (projectScore >= 30) scoreTier = "Moderate";

  const languages = Array.isArray(doc.languages) ? doc.languages : [];
  const topLanguage = languages.length > 0 ? languages[0] : null;

  return {
    _id: doc._id,
    userId: doc.userId,
    username: doc.username || "",
    profileUrl: doc.profileUrl || (doc.username ? `https://github.com/${doc.username}` : ""),
    avatarUrl: doc.avatarUrl || "",
    name: doc.name || "",
    bio: doc.bio || "",
    company: doc.company || "",
    location: doc.location || "",
    blog: doc.blog || "",
    publicReposCount: Number(doc.publicReposCount) || (doc.repositories?.length ?? 0),
    followers: Number(doc.followers) || 0,
    following: Number(doc.following) || 0,
    totalStars: Number(doc.totalStars) || 0,
    totalForks: Number(doc.totalForks) || 0,
    originalReposCount: Number(doc.originalReposCount) || 0,
    forkedReposCount: Number(doc.forkedReposCount) || 0,
    projectScore,
    scoreTier,
    topLanguage,
    languages,
    topRepositories: doc.topRepositories || [],
    repositoriesCount: doc.repositories ? doc.repositories.length : 0,
    lastSyncedAt: doc.lastSyncedAt || null,
    syncStatus: doc.syncStatus || "pending",
    syncError: doc.syncError || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

/**
 * Pings and verifies if a project demo URL is active, reachable, and returns 2xx/3xx HTTP status.
 *
 * @param {string} rawUrl - Candidate project live URL
 * @returns {Promise<Object>} Verification status object with status code, latency, and accessibility
 */
export const verifyLiveUrl = async (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      isValid: false,
      url: "",
      isLive: false,
      statusCode: null,
      statusText: "Invalid URL",
      latencyMs: null,
      accessible: false,
    };
  }

  let formattedUrl = rawUrl.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const startTime = Date.now();
    const response = await axios.get(formattedUrl, {
      timeout: 8000,
      headers: {
        "User-Agent": "getPlaced-Project-Verifier/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      validateStatus: () => true,
      maxRedirects: 5,
    });
    const latencyMs = Date.now() - startTime;

    const statusCode = response.status;
    const isAccessible = statusCode >= 200 && statusCode < 400;

    return {
      isValid: true,
      url: formattedUrl,
      isLive: isAccessible,
      statusCode,
      statusText: response.statusText || (isAccessible ? "OK" : "HTTP Error"),
      latencyMs,
      accessible: isAccessible,
      contentType: response.headers?.["content-type"] || "",
      server: response.headers?.["server"] || "",
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      isValid: true,
      url: formattedUrl,
      isLive: false,
      statusCode: err.response?.status || null,
      statusText: err.message || "Connection Failed",
      latencyMs: null,
      accessible: false,
      error: err.message,
      checkedAt: new Date().toISOString(),
    };
  }
};

