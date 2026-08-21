import express from "express";
import {
  getProgressData,
  getProgressHistory,
  logActivity,
} from "../controllers/progressController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/analytics").get(protect, getProgressData);
router.route("/history").get(protect, getProgressHistory);
router.route("/log-activity").post(protect, logActivity);

export default router;
