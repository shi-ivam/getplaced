import asyncHandler from "express-async-handler";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import CodingWorkspace from "../models/codingWorkspaceModel.js";
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

/**
 * @desc    Get user's coding workspace state (solved problems, drafts, submissions)
 * @route   GET /api/leetcode/workspace
 * @access  Private
 */
export const getWorkspaceState = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  let ws = await CodingWorkspace.findOne({ userId: req.user._id });
  if (!ws) {
    ws = await CodingWorkspace.create({
      userId: req.user._id,
      solvedProblems: {},
      drafts: {},
      submissions: {},
    });
  }

  res.status(200).json({
    success: true,
    solvedProblems: ws.solvedProblems ? Object.fromEntries(ws.solvedProblems) : {},
    drafts: ws.drafts ? Object.fromEntries(ws.drafts) : {},
    submissions: ws.submissions ? Object.fromEntries(ws.submissions) : {},
  });
});

/**
 * @desc    Save problem code draft in workspace
 * @route   POST /api/leetcode/draft
 * @access  Private
 */
export const saveDraft = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const { slug, code } = req.body;
  if (!slug) {
    res.status(400);
    throw new Error("Problem slug is required");
  }

  let ws = await CodingWorkspace.findOne({ userId: req.user._id });
  if (!ws) {
    ws = new CodingWorkspace({ userId: req.user._id, solvedProblems: {}, drafts: {}, submissions: {} });
  }

  if (!ws.drafts) ws.drafts = new Map();
  ws.drafts.set(slug, code || "");
  await ws.save();

  res.status(200).json({ success: true, slug, code });
});

/**
 * @desc    Record problem submission in workspace
 * @route   POST /api/leetcode/submission
 * @access  Private
 */
export const recordWorkspaceSubmission = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const { slug, subData } = req.body;
  if (!slug || !subData) {
    res.status(400);
    throw new Error("Slug and submission data are required");
  }

  let ws = await CodingWorkspace.findOne({ userId: req.user._id });
  if (!ws) {
    ws = new CodingWorkspace({ userId: req.user._id, solvedProblems: {}, drafts: {}, submissions: {} });
  }

  if (!ws.submissions) ws.submissions = new Map();
  const currentList = ws.submissions.get(slug) || [];
  const newSubmission = {
    id: Date.now(),
    timestamp: new Date(),
    status: subData.status || "Evaluated",
    runtime_ms: subData.runtime_ms,
    memory_mb: subData.memory_mb,
    beats_runtime_pct: subData.beats_runtime_pct,
    passed_count: subData.passed_count,
    total_count: subData.total_count,
    error: subData.error,
  };

  const updatedList = [newSubmission, ...currentList].slice(0, 30);
  ws.submissions.set(slug, updatedList);
  await ws.save();

  res.status(200).json({ success: true, slug, submissions: updatedList });
});

/**
 * @desc    Mark problem as solved in workspace
 * @route   POST /api/leetcode/solved
 * @access  Private
 */
export const markProblemAsSolved = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const { slug, details } = req.body;
  if (!slug) {
    res.status(400);
    throw new Error("Slug is required");
  }

  let ws = await CodingWorkspace.findOne({ userId: req.user._id });
  if (!ws) {
    ws = new CodingWorkspace({ userId: req.user._id, solvedProblems: {}, drafts: {}, submissions: {} });
  }

  if (!ws.solvedProblems) ws.solvedProblems = new Map();
  ws.solvedProblems.set(slug, {
    solvedAt: new Date(),
    runtimeMs: details?.runtime_ms || details?.runtimeMs,
    beatsPct: details?.beats_runtime_pct || details?.beatsPct,
    difficulty: details?.difficulty || "",
    title: details?.title || "",
  });

  await ws.save();

  res.status(200).json({
    success: true,
    slug,
    solvedProblems: Object.fromEntries(ws.solvedProblems),
  });
});
