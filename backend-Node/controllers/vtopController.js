import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";
import {
  getOrCreateVtopProfile,
  computeVtopPlacementImpact,
  getVtopAuthProtocolSummary,
} from "../services/vtopService.js";
import {
  getLiveVtopCaptcha,
  authenticateAndScrapeVtop,
} from "../services/vtopLiveAuthService.js";

// @desc    Get user's synced VTOP profile and placement parameter impact
// @route   GET /api/vtop/profile
// @access  Private
export const getVtopProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const vtopProfile = await getOrCreateVtopProfile(userId);

  if (!vtopProfile) {
    return res.json({
      success: true,
      connected: false,
      message: "No connected VTOP profile found for this account.",
      vtop: null,
      placementImpact: null,
      protocol: getVtopAuthProtocolSummary(),
    });
  }

  const placementImpact = computeVtopPlacementImpact(vtopProfile);

  res.json({
    success: true,
    connected: true,
    vtop: vtopProfile,
    placementImpact,
    protocol: getVtopAuthProtocolSummary(),
  });
});

// @desc    Trigger VTOP sync using authentic credentials / StudentCC pipeline
// @route   POST /api/vtop/sync
// @access  Private
export const syncVtopProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { regNo, password, captchaStr, sessionId, semesterId } = req.body;

  if (!regNo || !password || !captchaStr) {
    res.status(400);
    throw new Error("Authentic VTOP credentials (regNo, password, captchaStr) are required.");
  }

  const result = await authenticateAndScrapeVtop(userId, {
    username: regNo,
    password,
    captchaStr: captchaStr.trim(),
    sessionId,
    semesterId,
  });

  if (!result.success) {
    res.status(401);
    throw new Error(result.error || "VTOP live authentication failed.");
  }

  const vtop = await VtopProfile.findOne({ userId });
  const placementImpact = computeVtopPlacementImpact(vtop);

  res.json({
    success: true,
    message: "VTOP academic profile, marksheet, and attendance synced successfully.",
    vtop,
    placementImpact,
    protocol: getVtopAuthProtocolSummary(),
  });
});

// @desc    Update specific course marks or attendance parameters manually
// @route   PUT /api/vtop/course-update
// @access  Private
export const updateCourseMarks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { courseCode, attended, total, marks, grade } = req.body;

  let vtop = await VtopProfile.findOne({ userId });
  if (!vtop) {
    return res.status(404).json({ message: "VTOP profile not found" });
  }

  // Find course in active semester
  const sem = vtop.semesters.find((s) => s.semesterId === vtop.activeSemesterId) || vtop.semesters[0];
  if (sem) {
    const course = sem.courses.find((c) => c.code === courseCode);
    if (course) {
      if (attended !== undefined) course.attendance.attended = attended;
      if (total !== undefined) course.attendance.total = total;
      if (attended !== undefined && total !== undefined && total > 0) {
        course.attendance.percentage = Number(((attended / total) * 100).toFixed(1));
        course.attendance.status =
          course.attendance.percentage < 75 ? "debarred" : course.attendance.percentage < 80 ? "warning" : "safe";
      }
      if (Array.isArray(marks)) {
        course.marks = marks;
        course.totalWeightedMark = marks.reduce((acc, m) => acc + (m.weightage || 0), 0);
      }
      if (grade) course.grade = grade;
    }
  }

  await vtop.save();
  const placementImpact = computeVtopPlacementImpact(vtop);

  res.json({
    success: true,
    message: "Course marks and attendance updated",
    vtop,
    placementImpact,
  });
});

// @desc    Get detailed placement impact analysis for VTOP credentials
// @route   GET /api/vtop/placement-impact
// @access  Private
export const getPlacementImpact = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const vtop = await getOrCreateVtopProfile(userId);
  if (!vtop) {
    return res.status(404).json({
      message: "No VTOP profile found. Please login to VTOP first.",
      placementImpact: null,
    });
  }
  const placementImpact = computeVtopPlacementImpact(vtop);

  res.json(placementImpact);
});

// @desc    Fetch fresh live captcha and session from VTOP portal
// @route   GET /api/vtop/live-captcha
// @access  Public / Optional Auth
export const getLiveCaptchaHandler = asyncHandler(async (req, res) => {
  let userId = req.user?._id?.toString();
  if (!userId && req.cookies?.jwt) {
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (_) {}
  }
  if (!userId) {
    userId = `anon_${Date.now()}`;
  }

  const { sessionId } = req.query;
  const result = await getLiveVtopCaptcha(userId, sessionId);
  if (!result.success && result.error) {
    return res.status(502).json(result);
  }
  res.json(result);
});

// @desc    Perform live login and scrape marksheet/GPA from VTOP portal
// @route   POST /api/vtop/live-login
// @access  Private
export const liveLoginHandler = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { username, password, captchaStr, sessionId, semesterId } = req.body;

  if (!username || !password || !captchaStr) {
    return res.status(400).json({
      success: false,
      error: "Registration number, password, and captcha are required.",
    });
  }

  const result = await authenticateAndScrapeVtop(userId, {
    username,
    password,
    captchaStr: captchaStr.trim(),
    sessionId,
    semesterId,
  });

  if (!result.success && result.error) {
    return res.status(401).json(result);
  }

  res.json(result);
});

// @desc    Get the technical login protocol breakdown
// @route   GET /api/vtop/auth-protocol
// @access  Public
export const getAuthProtocol = asyncHandler(async (req, res) => {
  res.json(getVtopAuthProtocolSummary());
});
