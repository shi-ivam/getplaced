import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  getOrCreateCoachSession,
  processCoachMessage,
  applyOnboardingToProfile,
  connectGitHubInCoach,
  connectLeetCodeInCoach,
  connectVtopInCoach,
  saveResumeAnalysisInCoach,
  clearCoachChatHistory,
  getQuickSuggestionsForContext,
} from "../services/coachService.js";

// @desc    Get current AI career coach session
// @route   GET /api/coach/session
// @access  Private
export const getSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const mode = req.query.mode || (req.query.context === "onboarding" ? "onboarding" : null);
  const session = await getOrCreateCoachSession(req.user._id, user, { mode });
  res.json(session);
});

// @desc    Send message to AI career coach (Autonomous Gemini Function Calling)
// @route   POST /api/coach/message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { message, mode } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const result = await processCoachMessage(req.user._id, message, user, { mode });
  res.json(result);
});

// @desc    Clear / Reset coach chat history
// @route   POST /api/coach/clear-chat
// @access  Private
export const clearChat = asyncHandler(async (req, res) => {
  const mode = req.body.mode || req.query.mode;
  const session = await clearCoachChatHistory(req.user._id, { mode });
  res.json({ success: true, message: "Chat history cleared", session });
});

// @desc    Get context-aware quick suggestion chips for active surface
// @route   GET /api/coach/quick-suggestions
// @access  Private
export const getQuickSuggestions = asyncHandler(async (req, res) => {
  const contextPath = req.query.path || "";
  const suggestions = await getQuickSuggestionsForContext(req.user._id, contextPath);
  res.json({ suggestions });
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

// @desc    Save AI Resume Analysis into coach session & user profile
// @route   POST /api/coach/save-resume-analysis
// @access  Private
export const saveResumeAnalysis = asyncHandler(async (req, res) => {
  const { resumeScore, resumeText, resumeAnalysis, filename } = req.body;
  const result = await saveResumeAnalysisInCoach(req.user._id, {
    resumeScore,
    resumeText,
    resumeAnalysis,
    filename,
  });
  res.json(result);
});
