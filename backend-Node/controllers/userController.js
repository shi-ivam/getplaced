import asyncHandler from "express-async-handler"
import User from "../models/userModel.js"
import AcademicProfile from "../models/academicProfileModel.js"
import generateToken from "../utils/generateToken.js"
import { normalizeIdentifier } from "../models/companyRequirementModel.js"
import {
  isSupportedCompany,
  normalizeCompanyName,
  isSupportedRole,
  normalizeRoleName,
  CURATED_COMPANY_NAMES,
} from "../data/curatedCompanies.js"

// @desc user token
// route /api/users/auth
// @method post
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error("Please provide email and password")
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    res.status(404)
    throw new Error("No account exists with this email")
  }

  if (await user.matchPassword(password)) {
    const token = generateToken(res, user._id)

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      onboardingCompleted: Boolean(user.onboardingCompleted),
      token,
    })
  } else {
    res.status(401)
    throw new Error("Email or password is incorrect")
  }
})

// @desc register user
// route /api/users
// @method post
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error("Please provide name, email, and password")
  }

  if (password.length < 6) {
    res.status(400)
    throw new Error("Password must be at least 6 characters long")
  }

  const normalizedEmail = email.trim().toLowerCase()
  const userExists = await User.findOne({ email: normalizedEmail })

  if (userExists) {
    res.status(400)
    throw new Error("An account already exists with this email")
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    onboardingCompleted: false,
  })

  if (!user) {
    res.status(400)
    throw new Error("Could not create account with the provided data")
  }

  const token = generateToken(res, user._id)

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    onboardingCompleted: false,
    token,
  })
})

// @desc logout user
// route /api/users/logout
// @method post
const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production"
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
  })
  res.status(200).json({ message: "User logged out" })
})

// @desc get user profile
// route /api/users/profile
// @method get
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")

  if (user) {
    const targetJobRole = user.targetJobRole || ""
    const targetCompany = user.targetCompany || ""
    const targetRoleNormalized = user.targetRoleNormalized || normalizeIdentifier(targetJobRole)
    const targetCompanyNormalized = user.targetCompanyNormalized || normalizeIdentifier(targetCompany)

    const academic = await AcademicProfile.findOne({ userId: user._id })

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college || academic?.college || "",
      degree: user.degree || academic?.degree || "",
      branch: user.branch || academic?.branch || "",
      graduationYear: user.graduationYear ?? academic?.graduationYear ?? null,
      cgpa: user.cgpa ?? academic?.currentCgpa ?? null,
      tenthPercentage: user.tenthPercentage ?? academic?.tenthPercentage ?? null,
      twelfthPercentage: user.twelfthPercentage ?? academic?.twelfthPercentage ?? null,
      activeBacklogs: user.activeBacklogs ?? academic?.activeBacklogs ?? 0,
      historyOfBacklogs: user.historyOfBacklogs ?? academic?.historyOfBacklogs ?? 0,
      targetJobRole,
      targetRole: targetJobRole,
      targetRoleNormalized,
      targetCompany,
      targetCompanyNormalized,
      locationPreference: user.locationPreference || "",
      onboardingCompleted: Boolean(user.onboardingCompleted),
      resumeScore: user.resumeScore ?? null,
      resumeText: user.resumeText || "",
      resumeAnalysis: user.resumeAnalysis || null,
      resumeVersions: user.resumeVersions || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc update user profile
// route /api/users/profile
// @method put
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  const {
    name,
    email,
    college,
    degree,
    branch,
    graduationYear,
    cgpa,
    tenthPercentage,
    twelfthPercentage,
    activeBacklogs,
    historyOfBacklogs,
    targetJobRole,
    targetRole,
    targetCompany,
    locationPreference,
    onboardingCompleted,
    resumeScore,
    resumeText,
    resumeAnalysis,
    resumeVersions,
    password,
  } = req.body

  if (resumeScore !== undefined) {
    user.resumeScore = resumeScore !== null && !isNaN(Number(resumeScore)) ? Number(resumeScore) : null
  }

  if (resumeText !== undefined) {
    user.resumeText = typeof resumeText === "string" ? resumeText : ""
  }

  if (resumeAnalysis !== undefined) {
    user.resumeAnalysis = resumeAnalysis
  }

  if (resumeVersions !== undefined && Array.isArray(resumeVersions)) {
    user.resumeVersions = resumeVersions
  }

  if (onboardingCompleted !== undefined) {
    user.onboardingCompleted = Boolean(onboardingCompleted)
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      res.status(400)
      throw new Error("Name is required")
    }
    user.name = name.trim()
  }

  if (college !== undefined) {
    if (typeof college !== "string" || !college.trim()) {
      res.status(400)
      throw new Error("College is required")
    }
    user.college = college.trim()
  }

  if (degree !== undefined) {
    if (typeof degree !== "string" || !degree.trim()) {
      res.status(400)
      throw new Error("Degree is required")
    }
    user.degree = degree.trim()
  }

  if (branch !== undefined) {
    user.branch = typeof branch === "string" ? branch.trim() : ""
  }

  if (graduationYear !== undefined && graduationYear !== null && graduationYear !== "") {
    const parsedGradYear = Number(graduationYear)
    if (isNaN(parsedGradYear) || parsedGradYear < 1950 || parsedGradYear > 2100) {
      res.status(400)
      throw new Error("Graduation year must be a valid year")
    }
    user.graduationYear = parsedGradYear
  }

  if (cgpa !== undefined && cgpa !== null && cgpa !== "") {
    const parsedCgpa = Number(cgpa)
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      res.status(400)
      throw new Error("CGPA must be between 0 and 10")
    }
    user.cgpa = parsedCgpa
  }

  if (tenthPercentage !== undefined && tenthPercentage !== null && tenthPercentage !== "") {
    const parsed10th = Number(tenthPercentage)
    if (isNaN(parsed10th) || parsed10th < 0 || parsed10th > 100) {
      res.status(400)
      throw new Error("10th percentage must be between 0 and 100")
    }
    user.tenthPercentage = parsed10th
  } else if (tenthPercentage === null || tenthPercentage === "") {
    user.tenthPercentage = null
  }

  if (twelfthPercentage !== undefined && twelfthPercentage !== null && twelfthPercentage !== "") {
    const parsed12th = Number(twelfthPercentage)
    if (isNaN(parsed12th) || parsed12th < 0 || parsed12th > 100) {
      res.status(400)
      throw new Error("12th percentage must be between 0 and 100")
    }
    user.twelfthPercentage = parsed12th
  } else if (twelfthPercentage === null || twelfthPercentage === "") {
    user.twelfthPercentage = null
  }

  if (activeBacklogs !== undefined && activeBacklogs !== null && activeBacklogs !== "") {
    const parsedActiveBacklogs = Number(activeBacklogs)
    if (!isNaN(parsedActiveBacklogs) && parsedActiveBacklogs >= 0) {
      user.activeBacklogs = parsedActiveBacklogs
    }
  }

  if (historyOfBacklogs !== undefined && historyOfBacklogs !== null && historyOfBacklogs !== "") {
    const parsedHistoryBacklogs = Number(historyOfBacklogs)
    if (!isNaN(parsedHistoryBacklogs) && parsedHistoryBacklogs >= 0) {
      user.historyOfBacklogs = parsedHistoryBacklogs
    }
  }

  const roleInput = targetJobRole !== undefined ? targetJobRole : targetRole
  if (targetCompany !== undefined) {
    if (typeof targetCompany !== "string" || !targetCompany.trim()) {
      res.status(400)
      throw new Error("Target company is required")
    }
    const cleanComp = targetCompany.trim()
    const normComp = isSupportedCompany(cleanComp) ? normalizeCompanyName(cleanComp) : "Google"
    user.targetCompany = normComp
    user.targetCompanyNormalized = normalizeIdentifier(normComp)

    if (roleInput !== undefined && typeof roleInput === "string" && roleInput.trim()) {
      const normRole = normalizeRoleName(roleInput.trim(), normComp)
      user.targetJobRole = normRole
      user.targetRoleNormalized = normalizeIdentifier(normRole)
    }
  } else if (roleInput !== undefined) {
    if (typeof roleInput !== "string" || !roleInput.trim()) {
      res.status(400)
      throw new Error("Target job role is required")
    }
    const normRole = normalizeRoleName(roleInput.trim(), user.targetCompany || "Google")
    user.targetJobRole = normRole
    user.targetRoleNormalized = normalizeIdentifier(normRole)
  }

  if (locationPreference !== undefined) {
    user.locationPreference = typeof locationPreference === "string" ? locationPreference.trim() : ""
  }

  if (email) {
    user.email = email.trim().toLowerCase()
  }

  if (password) {
    user.password = password
  }

  const updatedUser = await user.save()

  // Simultaneously synchronize AcademicProfile collection
  let academic = await AcademicProfile.findOne({ userId: updatedUser._id })
  if (!academic) {
    academic = new AcademicProfile({ userId: updatedUser._id })
  }

  if (updatedUser.college !== undefined) academic.college = updatedUser.college
  if (updatedUser.degree !== undefined) academic.degree = updatedUser.degree
  if (updatedUser.branch !== undefined) academic.branch = updatedUser.branch
  if (updatedUser.graduationYear !== undefined) academic.graduationYear = updatedUser.graduationYear
  if (updatedUser.cgpa !== undefined) academic.currentCgpa = updatedUser.cgpa
  if (updatedUser.tenthPercentage !== undefined) academic.tenthPercentage = updatedUser.tenthPercentage
  if (updatedUser.twelfthPercentage !== undefined) academic.twelfthPercentage = updatedUser.twelfthPercentage
  if (updatedUser.activeBacklogs !== undefined) academic.activeBacklogs = updatedUser.activeBacklogs
  if (updatedUser.historyOfBacklogs !== undefined) academic.historyOfBacklogs = updatedUser.historyOfBacklogs

  await academic.save()

  const finalJobRole = updatedUser.targetJobRole || ""
  const finalCompany = updatedUser.targetCompany || ""
  const finalRoleNormalized = updatedUser.targetRoleNormalized || normalizeIdentifier(finalJobRole)
  const finalCompanyNormalized = updatedUser.targetCompanyNormalized || normalizeIdentifier(finalCompany)

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    college: updatedUser.college || "",
    degree: updatedUser.degree || "",
    branch: updatedUser.branch || "",
    graduationYear: updatedUser.graduationYear ?? null,
    cgpa: updatedUser.cgpa ?? null,
    tenthPercentage: updatedUser.tenthPercentage ?? null,
    twelfthPercentage: updatedUser.twelfthPercentage ?? null,
    activeBacklogs: updatedUser.activeBacklogs ?? 0,
    historyOfBacklogs: updatedUser.historyOfBacklogs ?? 0,
    targetJobRole: finalJobRole,
    targetRole: finalJobRole,
    targetRoleNormalized: finalRoleNormalized,
    targetCompany: finalCompany,
    targetCompanyNormalized: finalCompanyNormalized,
    locationPreference: updatedUser.locationPreference || "",
    onboardingCompleted: Boolean(updatedUser.onboardingCompleted),
    resumeScore: updatedUser.resumeScore ?? null,
    resumeText: updatedUser.resumeText || "",
    resumeAnalysis: updatedUser.resumeAnalysis || null,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  })
})

// @desc get saved behavioral master stories
// route /api/users/behavioral-stories
// @method get
const getBehavioralStories = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("behavioralStories")
  res.status(200).json({
    success: true,
    stories: user?.behavioralStories || [],
  })
})

// @desc save or update a master behavioral story
// route /api/users/behavioral-stories
// @method post
const saveBehavioralStory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  const story = req.body
  if (!story || !story.title) {
    res.status(400)
    throw new Error("Story title is required")
  }

  const stories = Array.isArray(user.behavioralStories) ? [...user.behavioralStories] : []
  const existingIdx = stories.findIndex((s) => s.id === story.id)
  const updatedStory = {
    ...story,
    id: story.id || `story-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  }

  if (existingIdx >= 0) {
    stories[existingIdx] = updatedStory
  } else {
    stories.unshift(updatedStory)
  }

  user.behavioralStories = stories
  user.markModified("behavioralStories")
  await user.save()

  res.status(200).json({
    success: true,
    stories: user.behavioralStories,
    story: updatedStory,
  })
})

// @desc delete a master behavioral story
// route /api/users/behavioral-stories/:id
// @method delete
const deleteBehavioralStory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  const { id } = req.params
  const stories = Array.isArray(user.behavioralStories) ? user.behavioralStories : []
  user.behavioralStories = stories.filter((s) => s.id !== id)
  user.markModified("behavioralStories")
  await user.save()

  res.status(200).json({
    success: true,
    stories: user.behavioralStories,
  })
})

// @desc get behavioral question bookmarks
// route /api/users/behavioral-bookmarks
// @method get
const getBehavioralBookmarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("behavioralBookmarks")
  res.status(200).json({
    success: true,
    bookmarks: user?.behavioralBookmarks || [],
  })
})

// @desc toggle behavioral question bookmark
// route /api/users/behavioral-bookmarks
// @method post
const toggleBehavioralBookmark = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  const { questionId } = req.body
  if (questionId === undefined || questionId === null) {
    res.status(400)
    throw new Error("questionId is required")
  }

  const qIdStr = String(questionId)
  let bookmarks = Array.isArray(user.behavioralBookmarks) ? [...user.behavioralBookmarks] : []
  if (bookmarks.includes(qIdStr)) {
    bookmarks = bookmarks.filter((id) => id !== qIdStr)
  } else {
    bookmarks.push(qIdStr)
  }

  user.behavioralBookmarks = bookmarks
  user.markModified("behavioralBookmarks")
  await user.save()

  res.status(200).json({
    success: true,
    bookmarks: user.behavioralBookmarks,
  })
})

// @desc get behavioral practice history
// route /api/users/behavioral-practice
// @method get
const getBehavioralPractice = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("behavioralPracticeHistory")
  res.status(200).json({
    success: true,
    history: user?.behavioralPracticeHistory || {},
  })
})

// @desc record behavioral practice evaluation result
// route /api/users/behavioral-practice
// @method post
const recordBehavioralPractice = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  const { questionId, score, evaluation } = req.body
  if (questionId === undefined || questionId === null) {
    res.status(400)
    throw new Error("questionId is required")
  }

  const history = user.behavioralPracticeHistory && typeof user.behavioralPracticeHistory === "object"
    ? { ...user.behavioralPracticeHistory }
    : {}
  const qIdStr = String(questionId)
  history[qIdStr] = {
    score: score ?? 0,
    timestamp: new Date().toISOString(),
    evaluationSummary: {
      verdict: evaluation?.overall_verdict || (score >= 80 ? "Strong" : score >= 60 ? "Passable" : "Needs Improvement"),
      starScore: evaluation?.star_compliance?.score,
      commScore: evaluation?.communication?.overall_communication_score,
    },
  }

  user.behavioralPracticeHistory = history
  user.markModified("behavioralPracticeHistory")
  await user.save()

  res.status(200).json({
    success: true,
    history: user.behavioralPracticeHistory,
  })
})

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getBehavioralStories,
  saveBehavioralStory,
  deleteBehavioralStory,
  getBehavioralBookmarks,
  toggleBehavioralBookmark,
  getBehavioralPractice,
  recordBehavioralPractice,
}
