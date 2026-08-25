import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getVtopProfile,
  syncVtopProfile,
  setActiveSemester,
  getSemesterData,
  updateCourseMarks,
  getPlacementImpact,
  getAuthProtocol,
  getLiveCaptchaHandler,
  liveLoginHandler,
} from "../controllers/vtopController.js";

const router = express.Router();

router.get("/profile", protect, getVtopProfile);
router.post("/sync", protect, syncVtopProfile);
router.put("/active-semester", protect, setActiveSemester);
router.get("/semesters/:semesterId", protect, getSemesterData);
router.get("/live-captcha", getLiveCaptchaHandler);
router.post("/live-login", protect, liveLoginHandler);
router.put("/course-update", protect, updateCourseMarks);
router.get("/placement-impact", protect, getPlacementImpact);
router.get("/auth-protocol", getAuthProtocol);

export default router;
