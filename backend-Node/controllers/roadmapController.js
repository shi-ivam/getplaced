import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  getOrGenerateUserRoadmap,
  createPersonalizedRoadmap,
  toggleRoadmapTask,
} from "../services/roadmapService.js";

// @desc    Get personalized placement roadmap
// @route   GET /api/roadmap
// @access  Private
export const getUserRoadmap = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const roadmap = await getOrGenerateUserRoadmap(req.user._id, user);
  res.json(roadmap);
});

// @desc    Generate / customize placement roadmap
// @route   POST /api/roadmap/generate
// @access  Private
export const generateRoadmap = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { targetCompany, targetRole, timelineWeeks } = req.body;

  const roadmap = await createPersonalizedRoadmap(
    req.user._id,
    targetCompany || user?.targetCompany || "Microsoft",
    targetRole || user?.targetJobRole || "Software Development Engineer",
    timelineWeeks ? Number(timelineWeeks) : 8
  );

  res.json(roadmap);
});

// @desc    Toggle task completion
// @route   PATCH /api/roadmap/toggle-task
// @access  Private
export const toggleTask = asyncHandler(async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) {
    res.status(400);
    throw new Error("taskId is required");
  }

  const result = await toggleRoadmapTask(req.user._id, taskId);
  res.json(result);
});
