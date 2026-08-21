import express from "express";
import {
  getAcademicProfile,
  updateAcademicProfile,
  calculateTargetCutoff,
  getCompanyEligibility,
} from "../controllers/academicController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/profile").get(protect, getAcademicProfile).put(protect, updateAcademicProfile);
router.route("/calculate-target").post(calculateTargetCutoff);
router.route("/eligibility").get(protect, getCompanyEligibility);

export default router;
