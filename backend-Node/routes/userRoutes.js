import express from "express"
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/", registerUser)
router.post("/register", registerUser)
router.post("/signup", registerUser)
router.post("/auth", authUser)
router.post("/login", authUser)
router.post("/signin", authUser)
router.post("/logout", logoutUser)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)

router.get("/get" ,(req,res) =>{
  res.send("backend working")
})

router.get("/resume/latest", protect, (req, res) => {
  res.json({
    success: true,
    name: req.user.name,
    email: req.user.email,
    targetRole: req.user.targetJobRole || "Software Engineer Candidate",
    resumeScore: req.user.resumeScore ?? null,
    resumeText: req.user.resumeText || "",
    resumeAnalysis: req.user.resumeAnalysis || null,
    updatedAt: req.user.updatedAt,
  })
})

export default router
