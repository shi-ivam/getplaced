import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import { buildLevelComparison } from "../services/levelGapService.js";
import mongoose from "mongoose";

// @desc    Get Current Level vs Required Level gap analysis for authenticated candidate
// @route   GET /api/gap-analysis
// @access  Private (Protected by JWT)
export const getGapAnalysis = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const targetCompany = user.targetCompany?.trim() || "";
  const targetJobRole = user.targetJobRole?.trim() || "";
  const targetCompanyNormalized =
    user.targetCompanyNormalized || normalizeIdentifier(targetCompany);
  const targetRoleNormalized =
    user.targetRoleNormalized || normalizeIdentifier(targetJobRole);

  // Attempt to load custom CompanyRequirement if one exists for the active target
  let companyRequirement = null;
  if (targetCompanyNormalized && targetRoleNormalized && mongoose.connection?.readyState === 1) {
    try {
      companyRequirement = await CompanyRequirement.findOne({
        companyNormalized: targetCompanyNormalized,
        roleNormalized: targetRoleNormalized,
      }).lean();
    } catch (err) {
      console.warn("Could not query CompanyRequirement in levelGapController:", err.message);
    }
  }

  // Attempt to load LeetCode profile if connected
  let leetcodeProfile = null;
  if (mongoose.connection?.readyState === 1) {
    try {
      leetcodeProfile = await LeetCodeProfile.findOne({ userId: req.user._id }).lean();
    } catch (err) {
      console.warn("Could not query LeetCodeProfile in levelGapController:", err.message);
    }
  }

  const comparisonData = buildLevelComparison(user, companyRequirement, leetcodeProfile);

  res.status(200).json(comparisonData);
});
