import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { getUserMilestones, claimMilestoneReward } from "../services/milestoneService.js";

// @desc    Get user readiness milestones, badges and unlocks
// @route   GET /api/milestones
// @access  Private
export const getMilestones = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const milestones = await getUserMilestones(req.user._id, user);
  res.json(milestones);
});

// @desc    Claim milestone achievement reward
// @route   POST /api/milestones/claim/:id
// @access  Private
export const claimMilestone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await claimMilestoneReward(req.user._id, id);
  res.json(result);
});
