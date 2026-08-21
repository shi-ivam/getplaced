import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import {
  queryJobs,
  getJobDetails,
  toggleUserSavedJob,
  seedJobsIfNeeded,
} from "../services/jobService.js";
import { calculatePlacementReadiness } from "../services/readinessService.js";

/**
 * Helper to optionally extract authenticated user from cookie or authorization header.
 */
const getOptionalUser = async (req) => {
  try {
    let token = req.cookies?.jwt;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_dev");
      if (decoded?.userId) {
        return await User.findById(decoded.userId).select("-password").lean();
      }
    }
  } catch (err) {
    // Non-blocking: guest or expired token
  }
  return req.user || null;
};

// @desc    Get all jobs with search, multi-facet filtering, sorting, and personalized match score
// @route   GET /api/jobs
// @access  Public / Authenticated
export const getJobsList = asyncHandler(async (req, res) => {
  const user = await getOptionalUser(req);
  let userReadiness = 74;

  if (user) {
    try {
      const readinessData = await calculatePlacementReadiness(user);
      if (readinessData?.overallScore) {
        userReadiness = readinessData.overallScore;
      }
    } catch (err) {
      console.warn("Could not calculate user readiness for jobs:", err.message);
    }
  }

  const results = await queryJobs(req.query, user, userReadiness);
  res.status(200).json(results);
});

// @desc    Get personalized job recommendations for candidate
// @route   GET /api/jobs/recommendations
// @access  Public / Authenticated
export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const user = await getOptionalUser(req);
  let userReadiness = 74;

  if (user) {
    try {
      const readinessData = await calculatePlacementReadiness(user);
      if (readinessData?.overallScore) {
        userReadiness = readinessData.overallScore;
      }
    } catch (err) {
      console.warn("Could not calculate user readiness for recommendations:", err.message);
    }
  }

  const results = await queryJobs({ ...req.query, sort: "match" }, user, userReadiness);
  res.status(200).json({
    success: true,
    recommendations: results.recommendedJobs,
    targetCompanyJobs: results.targetCompanyJobs,
    meta: results.meta,
  });
});

// @desc    Get single job by ID with full match fit analysis
// @route   GET /api/jobs/:id
// @access  Public / Authenticated
export const getJobById = asyncHandler(async (req, res) => {
  const user = await getOptionalUser(req);
  let userReadiness = 74;

  if (user) {
    try {
      const readinessData = await calculatePlacementReadiness(user);
      if (readinessData?.overallScore) {
        userReadiness = readinessData.overallScore;
      }
    } catch (err) {
      console.warn("Could not calculate user readiness for job detail:", err.message);
    }
  }

  const job = await getJobDetails(req.params.id, user, userReadiness);

  if (!job) {
    res.status(404);
    throw new Error("Job listing not found");
  }

  res.status(200).json({ success: true, job });
});

// @desc    Get all saved jobs for authenticated candidate
// @route   GET /api/jobs/saved
// @access  Private (JWT Protected)
export const getSavedJobs = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, please log in");
  }

  const user = await User.findById(req.user._id).select("-password").lean();
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  let userReadiness = 74;
  try {
    const readinessData = await calculatePlacementReadiness(user);
    if (readinessData?.overallScore) {
      userReadiness = readinessData.overallScore;
    }
  } catch (err) {
    console.warn("Could not calculate user readiness for saved jobs:", err.message);
  }

  const results = await queryJobs({ category: "saved" }, user, userReadiness);

  res.status(200).json({
    success: true,
    savedCount: results.total,
    jobs: results.jobs,
  });
});

// @desc    Toggle save/bookmark state for a job listing
// @route   POST /api/jobs/saved/:id
// @access  Private (JWT Protected)
export const toggleSavedJob = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Not authorized, please log in");
  }

  const result = await toggleUserSavedJob(req.user._id, req.params.id);
  res.status(200).json(result);
});

// @desc    Manually re-seed or initialize demo job dataset
// @route   POST /api/jobs/seed
// @access  Public
export const seedJobs = asyncHandler(async (req, res) => {
  const result = await seedJobsIfNeeded();
  res.status(200).json(result);
});
