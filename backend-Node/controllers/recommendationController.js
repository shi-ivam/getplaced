import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  getNextRecommendedActions,
  completeRecommendationTask,
} from "../services/recommendationService.js";

// @desc    Get high-impact recommended actions ("What Should I Do Next?")
// @route   GET /api/recommendations/next-actions
// @access  Private
export const getNextActions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const data = await getNextRecommendedActions(user);
  res.json(data);
});

// @desc    Complete a recommended task
// @route   POST /api/recommendations/complete-task
// @access  Private
export const completeActionTask = asyncHandler(async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) {
    res.status(400);
    throw new Error("taskId is required");
  }

  const result = await completeRecommendationTask(req.user._id, taskId);
  res.json(result);
});
