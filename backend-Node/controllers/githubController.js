import asyncHandler from "express-async-handler";
import GitHubProfile from "../models/githubProfileModel.js";
import {
  fetchGitHubUserData,
  extractGitHubUsername,
  formatGitHubProfileResponse,
  verifyLiveUrl,
} from "../services/githubService.js";


/**
 * @desc    Get connected GitHub profile and statistics for authenticated user
 * @route   GET /api/github/profile
 * @access  Private
 */
export const getGitHubProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const profile = await GitHubProfile.findOne({ userId: req.user._id });

  if (!profile) {
    return res.status(200).json({
      connected: false,
      profile: null,
    });
  }

  res.status(200).json({
    connected: true,
    profile: formatGitHubProfileResponse(profile),
  });
});

/**
 * @desc    Connect a public GitHub profile using username or URL
 * @route   POST /api/github/connect
 * @access  Private
 */
export const connectGitHubProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const { username } = req.body;

  if (!username || typeof username !== "string" || !username.trim()) {
    res.status(400);
    throw new Error("GitHub username or profile URL is required");
  }

  const cleanUsername = extractGitHubUsername(username);
  if (!cleanUsername) {
    res.status(400);
    throw new Error("Invalid GitHub username or profile URL format");
  }

  try {
    const data = await fetchGitHubUserData(cleanUsername);

    const profile = await GitHubProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...data,
        userId: req.user._id,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `GitHub profile @${profile.username} connected successfully!`,
      connected: true,
      profile: formatGitHubProfileResponse(profile),
    });
  } catch (err) {
    console.error("Error connecting GitHub profile:", err.message);
    const statusCode = err.statusCode || (err.response?.status ? err.response.status : 400);
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500);
    throw new Error(err.message || "Failed to connect GitHub profile");
  }
});

/**
 * @desc    Re-sync latest public GitHub repositories and portfolio metrics
 * @route   POST /api/github/sync
 * @access  Private
 */
export const syncGitHubProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const existingProfile = await GitHubProfile.findOne({ userId: req.user._id });

  if (!existingProfile) {
    res.status(404);
    throw new Error("No connected GitHub profile found. Please connect your profile first.");
  }

  try {
    const data = await fetchGitHubUserData(existingProfile.username);

    existingProfile.profileUrl = data.profileUrl;
    existingProfile.avatarUrl = data.avatarUrl;
    existingProfile.name = data.name;
    existingProfile.bio = data.bio;
    existingProfile.company = data.company;
    existingProfile.location = data.location;
    existingProfile.blog = data.blog;
    existingProfile.publicReposCount = data.publicReposCount;
    existingProfile.followers = data.followers;
    existingProfile.following = data.following;
    existingProfile.totalStars = data.totalStars;
    existingProfile.totalForks = data.totalForks;
    existingProfile.originalReposCount = data.originalReposCount;
    existingProfile.forkedReposCount = data.forkedReposCount;
    existingProfile.projectScore = data.projectScore;
    existingProfile.repositories = data.repositories;
    existingProfile.languages = data.languages;
    existingProfile.topRepositories = data.topRepositories;
    existingProfile.lastSyncedAt = new Date();
    existingProfile.syncStatus = "synced";
    existingProfile.syncError = "";

    await existingProfile.save();

    res.status(200).json({
      success: true,
      message: `GitHub data for @${existingProfile.username} refreshed successfully!`,
      connected: true,
      profile: formatGitHubProfileResponse(existingProfile),
    });
  } catch (err) {
    console.error("Error syncing GitHub stats:", err.message);
    existingProfile.syncStatus = "failed";
    existingProfile.syncError = err.message || "Sync failed";
    await existingProfile.save();

    const statusCode = err.statusCode || (err.response?.status ? err.response.status : 502);
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 502);
    throw new Error(err.message || "Failed to refresh GitHub data");
  }
});

/**
 * @desc    Disconnect GitHub profile from account
 * @route   DELETE /api/github/disconnect
 * @access  Private
 */
export const disconnectGitHubProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const deleted = await GitHubProfile.findOneAndDelete({ userId: req.user._id });

  res.status(200).json({
    success: true,
    message: deleted
      ? `GitHub profile @${deleted.username} disconnected successfully`
      : "No GitHub profile was connected",
    connected: false,
  });
});

/**
 * @desc    Get filterable, searchable, and sortable repositories for connected user
 * @route   GET /api/github/repositories
 * @access  Private
 */
export const getGitHubRepositories = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const profile = await GitHubProfile.findOne({ userId: req.user._id });

  if (!profile || !profile.repositories) {
    return res.status(200).json({
      connected: Boolean(profile),
      repositories: [],
      totalCount: 0,
      filteredCount: 0,
      languages: [],
    });
  }

  const {
    language,
    type = "all", // 'all' | 'original' | 'fork'
    search = "",
    sort = "stars", // 'stars' | 'updated' | 'pushed' | 'name' | 'size'
    order = "desc", // 'desc' | 'asc'
  } = req.query;

  let repos = [...profile.repositories];

  // 1. Filter by language
  if (language && language !== "all") {
    repos = repos.filter(
      (r) => (r.language || "").toLowerCase() === String(language).toLowerCase()
    );
  }

  // 2. Filter by type
  if (type === "original") {
    repos = repos.filter((r) => !r.isFork);
  } else if (type === "fork") {
    repos = repos.filter((r) => r.isFork);
  }

  // 3. Search by name, description, or topics
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    repos = repos.filter((r) => {
      const nameMatch = (r.name || "").toLowerCase().includes(q);
      const descMatch = (r.description || "").toLowerCase().includes(q);
      const topicMatch = Array.isArray(r.topics) && r.topics.some((t) => t.toLowerCase().includes(q));
      return nameMatch || descMatch || topicMatch;
    });
  }

  // 4. Sort
  const multiplier = order === "asc" ? 1 : -1;
  repos.sort((a, b) => {
    if (sort === "stars") {
      return (a.stars - b.stars) * multiplier;
    }
    if (sort === "name") {
      return (a.name || "").localeCompare(b.name || "") * multiplier;
    }
    if (sort === "size") {
      return (a.size - b.size) * multiplier;
    }
    if (sort === "pushed") {
      const aTime = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
      const bTime = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
      return (aTime - bTime) * multiplier;
    }
    // Default: updated
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return (aTime - bTime) * multiplier;
  });

  res.status(200).json({
    connected: true,
    totalCount: profile.repositories.length,
    filteredCount: repos.length,
    languages: profile.languages || [],
    repositories: repos,
  });
});

/**
 * @desc    Verify if a repository live demo URL is accessible and responding
 * @route   GET /api/github/verify-live
 * @access  Private
 */
export const verifyProjectLiveUrl = asyncHandler(async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== "string" || !url.trim()) {
    res.status(400);
    throw new Error("URL query parameter is required for live verification");
  }

  const result = await verifyLiveUrl(url);

  res.status(200).json(result);
});

