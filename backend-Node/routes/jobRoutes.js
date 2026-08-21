import express from "express";
import {
  getJobsList,
  getRecommendedJobs,
  getSavedJobs,
  toggleSavedJob,
  getJobById,
  seedJobs,
} from "../controllers/jobController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public / Semi-authenticated discovery routes
router.route("/").get(getJobsList);
router.route("/recommendations").get(getRecommendedJobs);
router.route("/seed").post(seedJobs);

// Protected saved jobs routes
router.route("/saved").get(protect, getSavedJobs);
router.route("/saved/:id").post(protect, toggleSavedJob);
router.route("/toggle-save/:id").post(protect, toggleSavedJob);

// Single job detail by ID (placed after static subroutes)
router.route("/:id").get(getJobById);

export default router;
