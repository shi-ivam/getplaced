import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  getOrCreateCoachSession,
  processCoachMessage,
  applyOnboardingToProfile,
  connectGitHubInCoach,
  connectLeetCodeInCoach,
  connectVtopInCoach,
} from "../services/coachService.js";

// @desc    Get current AI career coach onboarding session
// @route   GET /api/coach/session
// @access  Private
export const getSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const session = await getOrCreateCoachSession(req.user._id, user);
  res.json(session);
});

// @desc    Send message to AI career coach
// @route   POST /api/coach/message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const result = await processCoachMessage(req.user._id, message, user);
  res.json(result);
});

// @desc    Apply onboarding extracted profile
// @route   POST /api/coach/apply-profile
// @access  Private
export const applyProfile = asyncHandler(async (req, res) => {
  const { extractedProfile } = req.body;
  const result = await applyOnboardingToProfile(req.user._id, extractedProfile);
  res.json(result);
});

// @desc    Direct connect GitHub profile during coach session
// @route   POST /api/coach/connect-github
// @access  Private
export const connectGitHub = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    res.status(400);
    throw new Error("GitHub username or URL is required");
  }
  const result = await connectGitHubInCoach(req.user._id, username);
  res.json(result);
});

// @desc    Direct connect LeetCode profile during coach session
// @route   POST /api/coach/connect-leetcode
// @access  Private
export const connectLeetCode = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    res.status(400);
    throw new Error("LeetCode username or URL is required");
  }
  const result = await connectLeetCodeInCoach(req.user._id, username);
  res.json(result);
});

// @desc    Direct connect VTOP academic profile during coach session
// @route   POST /api/coach/connect-vtop
// @access  Private
export const connectVtop = asyncHandler(async (req, res) => {
  const { username, password, captchaStr, sessionId, semesterId, regNo } = req.body;
  const result = await connectVtopInCoach(req.user._id, {
    username,
    password,
    captchaStr,
    sessionId,
    semesterId,
    regNo,
  });
  res.json(result);
});

