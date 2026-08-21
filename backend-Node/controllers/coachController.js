import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  getOrCreateCoachSession,
  processCoachMessage,
  applyOnboardingToProfile,
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
