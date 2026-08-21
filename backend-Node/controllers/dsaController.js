import asyncHandler from "express-async-handler";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";
import {
  analyzeDsaProficiency,
  getDsaCompanyComparison,
} from "../services/dsaAnalysisService.js";

/**
 * @desc    Get comprehensive topic-level DSA proficiency analysis for the authenticated user
 * @route   GET /api/dsa/topics
 * @route   GET /api/dsa/analysis
 * @access  Private
 */
export const getDsaTopicAnalysis = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const user = req.user;

  // Query connected LeetCode profile if any
  let leetcodeProfile = null;
  try {
    leetcodeProfile = await LeetCodeProfile.findOne({ userId: user._id });
  } catch (err) {
    console.warn("Could not query LeetCodeProfile in getDsaTopicAnalysis:", err.message);
  }

  // Query specific company requirement profile if target company & role are set
  let companyRequirement = null;
  const targetCompany = user.targetCompany?.trim();
  const targetJobRole = user.targetJobRole?.trim();

  if (targetCompany && targetJobRole) {
    const compNorm = user.targetCompanyNormalized || normalizeIdentifier(targetCompany);
    const roleNorm = user.targetRoleNormalized || normalizeIdentifier(targetJobRole);

    try {
      companyRequirement = await CompanyRequirement.findOne({
        companyNormalized: compNorm,
        roleNormalized: roleNorm,
      }).lean();
    } catch (err) {
      console.warn("Could not query CompanyRequirement in getDsaTopicAnalysis:", err.message);
    }
  }

  const analysis = analyzeDsaProficiency(user, leetcodeProfile, companyRequirement);

  res.status(200).json(analysis);
});

/**
 * @desc    Get DSA readiness comparison vs target company benchmarks for the authenticated user
 * @route   GET /api/dsa/readiness-comparison
 * @access  Private
 */
export const getDsaReadinessComparison = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const comparison = await getDsaCompanyComparison(req.user._id);

  res.status(200).json(comparison);
});

