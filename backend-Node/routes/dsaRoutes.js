import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getDsaTopicAnalysis,
  getDsaReadinessComparison,
} from "../controllers/dsaController.js";

const router = express.Router();

// Primary DSA topic proficiency analysis routes
router.route("/topics").get(protect, getDsaTopicAnalysis);
router.route("/analysis").get(protect, getDsaTopicAnalysis);

// DSA Readiness vs Target Company benchmark comparison route
router.route("/readiness-comparison").get(protect, getDsaReadinessComparison);

export default router;

