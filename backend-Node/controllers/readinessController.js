import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { calculatePlacementReadiness } from "../services/readinessService.js";

// @desc    Get overall placement readiness score & breakdown for authenticated user
// @route   GET /api/readiness
// @access  Private (Protected by JWT)
export const getPlacementReadiness = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  // Fetch full user record to ensure all current target & profile fields are present
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const readinessData = await calculatePlacementReadiness(user);

  res.status(200).json(readinessData);
});
