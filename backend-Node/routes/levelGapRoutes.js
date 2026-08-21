import express from "express";
import { getGapAnalysis } from "../controllers/levelGapController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @route   GET /api/gap-analysis
// @desc    Get Current vs Required Level gap analysis
// @access  Private (JWT protected)
router.get("/", protect, getGapAnalysis);

export default router;
