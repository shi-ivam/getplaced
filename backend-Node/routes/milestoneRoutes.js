import express from "express";
import { getMilestones } from "../controllers/milestoneController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getMilestones);

export default router;
