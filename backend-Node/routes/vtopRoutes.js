import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getVtopProfile,
  syncVtopProfile,
  updateCourseMarks,
  getPlacementImpact,
  getAuthProtocol,
} from "../controllers/vtopController.js";

const router = express.Router();

router.get("/profile", protect, getVtopProfile);
router.post("/sync", protect, syncVtopProfile);
router.put("/course-update", protect, updateCourseMarks);
router.get("/placement-impact", protect, getPlacementImpact);
router.get("/auth-protocol", getAuthProtocol);

export default router;
