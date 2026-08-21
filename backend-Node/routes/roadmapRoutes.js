import express from "express";
import {
  getUserRoadmap,
  generateRoadmap,
  toggleTask,
} from "../controllers/roadmapController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getUserRoadmap);
router.route("/generate").post(protect, generateRoadmap);
router.route("/toggle-task").patch(protect, toggleTask);

export default router;
