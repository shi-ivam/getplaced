import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  getProgressAnalytics,
  logUserActivity,
} from "../services/progressService.js";

// @desc    Get progress tracking analytics and velocity
// @route   GET /api/progress/analytics
// @access  Private
export const getProgressData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const data = await getProgressAnalytics(req.user._id, user);
  res.json(data);
});

// @desc    Get progress history for multi-dimension trend graphs
// @route   GET /api/progress/history
// @access  Private
export const getProgressHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const data = await getProgressAnalytics(req.user._id, user);
  res.json({
    snapshots: data.snapshots,
    weeklyVelocityPct: data.weeklyVelocityPct,
    monthlyVelocityPct: data.monthlyVelocityPct,
  });
});

// @desc    Log a progress learning activity
// @route   POST /api/progress/log-activity
// @access  Private
export const logActivity = asyncHandler(async (req, res) => {
  const { type, title, xp, metadata, studyMinutes } = req.body;
  const result = await logUserActivity(req.user._id, {
    type,
    title,
    xp,
    metadata,
    studyMinutes,
  });
  res.json(result);
});
