import asyncHandler from "express-async-handler";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";
import {
  getOrCreateAcademicProfile,
  calculateTargetCgpaRequirement,
  evaluateAllCompaniesEligibility,
  COMPANY_ACADEMIC_BENCHMARKS,
} from "../services/academicService.js";

// @desc    Get user academic profile and semester details
// @route   GET /api/academics/profile
// @access  Private
export const getAcademicProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).lean();
  const academic = await getOrCreateAcademicProfile(userId, user);

  const targetCalc = calculateTargetCgpaRequirement(
    academic.currentCgpa,
    (academic.semesters || []).filter((s) => s.isCompleted).length || 0,
    academic.totalSemesters,
    academic.targetCgpa
  );

  res.json({
    academic,
    targetAnalysis: targetCalc,
  });
});

// @desc    Update user academic profile
// @route   PUT /api/academics/profile
// @access  Private
export const updateAcademicProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    college,
    degree,
    branch,
    graduationYear,
    currentSemester,
    totalSemesters,
    currentCgpa,
    targetCgpa,
    tenthPercentage,
    twelfthPercentage,
    diplomaPercentage,
    activeBacklogs,
    historyOfBacklogs,
    semesters,
  } = req.body;

  let academic = await AcademicProfile.findOne({ userId });

  if (!academic) {
    academic = new AcademicProfile({ userId });
  }

  if (college !== undefined) academic.college = college;
  if (degree !== undefined) academic.degree = degree;
  if (branch !== undefined) academic.branch = branch;
  if (graduationYear !== undefined) academic.graduationYear = graduationYear;
  if (currentSemester !== undefined) academic.currentSemester = currentSemester;
  if (totalSemesters !== undefined) academic.totalSemesters = totalSemesters;
  if (currentCgpa !== undefined) academic.currentCgpa = currentCgpa;
  if (targetCgpa !== undefined) academic.targetCgpa = targetCgpa;
  if (tenthPercentage !== undefined) academic.tenthPercentage = tenthPercentage;
  if (twelfthPercentage !== undefined) academic.twelfthPercentage = twelfthPercentage;
  if (diplomaPercentage !== undefined) academic.diplomaPercentage = diplomaPercentage;
  if (activeBacklogs !== undefined) academic.activeBacklogs = activeBacklogs;
  if (historyOfBacklogs !== undefined) academic.historyOfBacklogs = historyOfBacklogs;
  if (Array.isArray(semesters)) academic.semesters = semesters;

  await academic.save();

  // Also update User document's basic academic fields
  await User.findByIdAndUpdate(userId, {
    college: academic.college,
    degree: academic.degree,
    graduationYear: academic.graduationYear,
    cgpa: academic.currentCgpa,
    tenthPercentage: academic.tenthPercentage,
    twelfthPercentage: academic.twelfthPercentage,
  });

  const targetCalc = calculateTargetCgpaRequirement(
    academic.currentCgpa,
    (academic.semesters || []).filter((s) => s.isCompleted).length || 0,
    academic.totalSemesters,
    academic.targetCgpa
  );

  res.json({
    message: "Academic profile updated successfully",
    academic,
    targetAnalysis: targetCalc,
  });
});

// @desc    Calculate required SGPA for target CGPA
// @route   POST /api/academics/calculate-target
// @access  Public / Private
export const calculateTargetCutoff = asyncHandler(async (req, res) => {
  const { currentCgpa, completedSemesters, totalSemesters, targetCgpa } = req.body;

  const result = calculateTargetCgpaRequirement(
    currentCgpa,
    completedSemesters,
    totalSemesters,
    targetCgpa
  );

  res.json(result);
});

// @desc    Evaluate academic eligibility across all companies
// @route   GET /api/academics/eligibility
// @access  Private
export const getCompanyEligibility = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).lean();
  const academic = await getOrCreateAcademicProfile(userId, user);

  const { tier } = req.query;
  const evaluation = evaluateAllCompaniesEligibility(academic, tier);

  res.json(evaluation);
});
