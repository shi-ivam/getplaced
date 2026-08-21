import express from "express";
import { getPlacementReadiness } from "../controllers/readinessController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @route GET /api/readiness
// Protected with JWT auth middleware
router.get("/", protect, getPlacementReadiness);

export default router;
