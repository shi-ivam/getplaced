import asyncHandler from "express-async-handler";
import LeetCodeProfile from "../models/leetcodeProfileModel.js";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";
import DsaProgress from "../models/dsaProgressModel.js";
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

/**
 * @desc    Get user's persisted DSA learning progress (completed lectures & assignments)
 * @route   GET /api/dsa/progress
 * @access  Private
 */
export const getDsaProgress = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  let progress = await DsaProgress.findOne({ userId: req.user._id });
  if (!progress) {
    progress = await DsaProgress.create({
      userId: req.user._id,
      completedLectures: [],
      completedAssignments: [],
      watchProgress: {},
    });
  }

  const watchObj = progress.watchProgress
    ? Object.fromEntries(progress.watchProgress)
    : {};

  res.status(200).json({
    success: true,
    completedLectures: progress.completedLectures || [],
    completedAssignments: progress.completedAssignments || [],
    watchProgress: watchObj,
  });
});

/**
 * @desc    Update user's DSA learning progress (lecture complete, assignment toggle, watch progress)
 * @route   POST /api/dsa/progress
 * @access  Private
 */
export const updateDsaProgress = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const { lectureId, assignmentId, completed, progressRatio, type } = req.body;

  let progress = await DsaProgress.findOne({ userId: req.user._id });
  if (!progress) {
    progress = new DsaProgress({
      userId: req.user._id,
      completedLectures: [],
      completedAssignments: [],
      watchProgress: {},
    });
  }

  if (type === "lecture" || lectureId) {
    const id = lectureId || req.body.id;
    if (id) {
      const isCompleted = completed !== undefined ? Boolean(completed) : true;
      const idx = progress.completedLectures.indexOf(id);
      if (isCompleted && idx === -1) {
        progress.completedLectures.push(id);
      } else if (!isCompleted && idx !== -1) {
        progress.completedLectures.splice(idx, 1);
      }
      if (progressRatio !== undefined) {
        if (!progress.watchProgress) progress.watchProgress = new Map();
        progress.watchProgress.set(id, Number(progressRatio));
      }
    }
  }

  if (type === "assignment" || assignmentId) {
    const id = assignmentId || req.body.id;
    if (id) {
      const idx = progress.completedAssignments.indexOf(id);
      if (completed === false || (completed === undefined && idx !== -1)) {
        if (idx !== -1) progress.completedAssignments.splice(idx, 1);
      } else {
        if (idx === -1) progress.completedAssignments.push(id);
      }
    }
  }

  await progress.save();

  const watchObj = progress.watchProgress
    ? Object.fromEntries(progress.watchProgress)
    : {};

  res.status(200).json({
    success: true,
    completedLectures: progress.completedLectures,
    completedAssignments: progress.completedAssignments,
    watchProgress: watchObj,
  });
});
