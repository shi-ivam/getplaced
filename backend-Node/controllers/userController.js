import asyncHandler from "express-async-handler"
import User from "../models/userModel.js"
import generateToken from "../utils/generateToken.js"
import { normalizeIdentifier } from "../models/companyRequirementModel.js"

// @desc user token
// route /api/users/auth
// @method post
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id)

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    })
  } else {
    res.status(401)
    throw new Error("Invalid email or password")
  }
})

// @desc register user
// route /api/users
// @method post
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error("User already exists")
  }

  const user = await User.create({
    name,
    email,
    password,
  })

  if (!user) {
    res.status(400)
    throw new Error("Invalid data")
  }

  generateToken(res, user._id)

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
  })
})

// @desc logout user
// route /api/users/logout
// @method post
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
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

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college || "",
      degree: user.degree || "",
      graduationYear: user.graduationYear ?? null,
      cgpa: user.cgpa ?? null,
      tenthPercentage: user.tenthPercentage ?? null,
      twelfthPercentage: user.twelfthPercentage ?? null,
      targetJobRole,
      targetRole: targetJobRole,
      targetRoleNormalized,
      targetCompany,
      targetCompanyNormalized,
      locationPreference: user.locationPreference || "",
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
    graduationYear,
    cgpa,
    tenthPercentage,
    twelfthPercentage,
    targetJobRole,
    targetRole,
    targetCompany,
    locationPreference,
    password,
  } = req.body

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

  const roleInput = targetJobRole !== undefined ? targetJobRole : targetRole
  if (roleInput !== undefined) {
    if (typeof roleInput !== "string" || !roleInput.trim()) {
      res.status(400)
      throw new Error("Target job role is required")
    }
    user.targetJobRole = roleInput.trim()
    user.targetRoleNormalized = normalizeIdentifier(roleInput)
  }

  if (targetCompany !== undefined) {
    if (typeof targetCompany !== "string" || !targetCompany.trim()) {
      res.status(400)
      throw new Error("Target company is required")
    }
    user.targetCompany = targetCompany.trim()
    user.targetCompanyNormalized = normalizeIdentifier(targetCompany)
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
    graduationYear: updatedUser.graduationYear ?? null,
    cgpa: updatedUser.cgpa ?? null,
    tenthPercentage: updatedUser.tenthPercentage ?? null,
    twelfthPercentage: updatedUser.twelfthPercentage ?? null,
    targetJobRole: finalJobRole,
    targetRole: finalJobRole,
    targetRoleNormalized: finalRoleNormalized,
    targetCompany: finalCompany,
    targetCompanyNormalized: finalCompanyNormalized,
    locationPreference: updatedUser.locationPreference || "",
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  })
})

export { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile }
