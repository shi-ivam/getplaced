import asyncHandler from "express-async-handler";
import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";
import {
  getOrCreateVtopProfile,
  computeVtopPlacementImpact,
  getVtopAuthProtocolSummary,
  generateDefaultVtopData,
} from "../services/vtopService.js";

// @desc    Get user's synced VTOP profile and placement parameter impact
// @route   GET /api/vtop/profile
// @access  Private
export const getVtopProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).lean();
  const vtopProfile = await getOrCreateVtopProfile(userId, user);

  const placementImpact = computeVtopPlacementImpact(vtopProfile);

  res.json({
    success: true,
    vtop: vtopProfile,
    placementImpact,
    protocol: getVtopAuthProtocolSummary(),
  });
});

// @desc    Trigger VTOP sync / simulated scrape using StudentCC pipeline
// @route   POST /api/vtop/sync
// @access  Private
export const syncVtopProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { regNo, password, semesterId, simulationMode } = req.body;
  const user = await User.findById(userId);

  let vtop = await VtopProfile.findOne({ userId });

  if (!vtop) {
    vtop = new VtopProfile(generateDefaultVtopData(userId, user));
  }

  // Update timestamps and sync state
  vtop.lastSyncedAt = new Date();
  vtop.syncStatus = simulationMode ? "simulated" : "synced";

  if (regNo) vtop.regNo = regNo.toUpperCase();
  if (semesterId) vtop.activeSemesterId = semesterId;

  await vtop.save();

  // Also sync updated CGPA and backlogs to AcademicProfile to keep platform synchronized
  await AcademicProfile.findOneAndUpdate(
    { userId },
    {
      currentCgpa: vtop.currentCgpa,
      activeBacklogs: vtop.activeBacklogs,
      historyOfBacklogs: vtop.historyOfBacklogs,
      college: "VIT Chennai",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
    },
    { upsert: true }
  );

  await User.findByIdAndUpdate(userId, {
    cgpa: vtop.currentCgpa,
  });

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
  const vtop = await getOrCreateVtopProfile(userId, req.user);
  const placementImpact = computeVtopPlacementImpact(vtop);

  res.json(placementImpact);
});

// @desc    Get the technical login protocol breakdown
// @route   GET /api/vtop/auth-protocol
// @access  Public
export const getAuthProtocol = asyncHandler(async (req, res) => {
  res.json(getVtopAuthProtocolSummary());
});
