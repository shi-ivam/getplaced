import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { getUserMilestones } from "../services/milestoneService.js";

// @desc    Get user readiness milestones, badges and unlocks
// @route   GET /api/milestones
// @access  Private
export const getMilestones = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const milestones = await getUserMilestones(req.user._id, user);
  res.json(milestones);
});
