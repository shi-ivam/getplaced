import express from "express";
import { getMilestones, claimMilestone } from "../controllers/milestoneController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getMilestones);
router.route("/claim/:id").post(protect, claimMilestone);

export default router;
