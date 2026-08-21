import asyncHandler from "express-async-handler";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import {
  fetchLeetCodeStats,
  extractLeetCodeUsername,
  formatLeetCodeProfileResponse,
  getSubmissionAnalysis,
} from "../services/leetcodeService.js";

/**
 * @desc    Get connected LeetCode profile and statistics for authenticated user
 * @route   GET /api/leetcode/profile
 * @access  Private
 */
export const getLeetCodeProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const profile = await LeetCodeProfile.findOne({ userId: req.user._id });

  if (!profile) {
    return res.status(200).json({
      connected: false,
      profile: null,
    });
  }

  res.status(200).json({
    connected: true,
    profile: formatLeetCodeProfileResponse(profile),
  });
});

/**
 * @desc    Connect a public LeetCode profile using username or URL
 * @route   POST /api/leetcode/connect
 * @access  Private
 */
export const connectLeetCodeProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const { username } = req.body;

  if (!username || typeof username !== "string" || !username.trim()) {
    res.status(400);
    throw new Error("LeetCode username or profile URL is required");
  }

  const cleanUsername = extractLeetCodeUsername(username);
  if (!cleanUsername) {
    res.status(400);
    throw new Error("Invalid LeetCode username or URL format");
  }

  try {
    const stats = await fetchLeetCodeStats(cleanUsername);

    const profile = await LeetCodeProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...stats,
        userId: req.user._id,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `LeetCode profile @${profile.username} connected successfully!`,
      connected: true,
      profile: formatLeetCodeProfileResponse(profile),
    });
  } catch (err) {
    console.error("Error connecting LeetCode profile:", err.message);
    const statusCode = err.statusCode || (err.response?.status ? err.response.status : 400);
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500);
    throw new Error(err.message || "Failed to connect LeetCode profile");
  }
});

/**
 * @desc    Re-sync latest public LeetCode statistics
 * @route   POST /api/leetcode/sync
 * @access  Private
 */
export const syncLeetCodeProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const existingProfile = await LeetCodeProfile.findOne({ userId: req.user._id });

  if (!existingProfile) {
    res.status(404);
    throw new Error("No connected LeetCode profile found. Please connect your profile first.");
  }

  try {
    const stats = await fetchLeetCodeStats(existingProfile.username);

    existingProfile.profileUrl = stats.profileUrl;
    existingProfile.realName = stats.realName;
    existingProfile.ranking = stats.ranking;
    existingProfile.totalSolved = stats.totalSolved;
    existingProfile.easySolved = stats.easySolved;
    existingProfile.mediumSolved = stats.mediumSolved;
    existingProfile.hardSolved = stats.hardSolved;
    existingProfile.totalQuestions = stats.totalQuestions;
    existingProfile.acceptanceRate = stats.acceptanceRate;
    existingProfile.problemsSolved = stats.problemsSolved;
    existingProfile.submissions = stats.submissions;
    existingProfile.submissionStats = stats.submissionStats;
    existingProfile.activeDays = stats.activeDays;
    existingProfile.streak = stats.streak;
    existingProfile.submissionCalendar = stats.submissionCalendar;
    existingProfile.efficiencyRatio = stats.efficiencyRatio;
    existingProfile.contest = stats.contest;
    existingProfile.languages = stats.languages;
    existingProfile.primaryLanguage = stats.primaryLanguage;
    existingProfile.topicTags = stats.topicTags;
    existingProfile.recentSubmissions = stats.recentSubmissions;
    existingProfile.lastSyncedAt = new Date();
    existingProfile.syncStatus = "synced";
    existingProfile.syncError = "";

    await existingProfile.save();

    res.status(200).json({
      success: true,
      message: `LeetCode stats for @${existingProfile.username} refreshed successfully!`,
      connected: true,
      profile: formatLeetCodeProfileResponse(existingProfile),
    });
  } catch (err) {
    console.error("Error syncing LeetCode stats:", err.message);
    existingProfile.syncStatus = "failed";
    existingProfile.syncError = err.message || "Sync failed";
    await existingProfile.save();

    const statusCode = err.statusCode || (err.response?.status ? err.response.status : 502);
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 502);
    throw new Error(err.message || "Failed to refresh LeetCode statistics");
  }
});

/**
 * @desc    Get detailed submission and consistency analysis for authenticated user
 * @route   GET /api/leetcode/submissions-analysis
 * @access  Private
 */
export const getLeetCodeSubmissionAnalysis = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const analysis = await getSubmissionAnalysis(req.user._id);

  res.status(200).json(analysis);
});

/**
 * @desc    Disconnect LeetCode profile from account
 * @route   DELETE /api/leetcode/disconnect
 * @access  Private
 */
export const disconnectLeetCodeProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const deleted = await LeetCodeProfile.findOneAndDelete({ userId: req.user._id });

  res.status(200).json({
    success: true,
    message: deleted
      ? `LeetCode profile @${deleted.username} disconnected successfully`
      : "No LeetCode profile was connected",
    connected: false,
  });
});
