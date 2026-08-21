import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getLeetCodeProfile,
  connectLeetCodeProfile,
  syncLeetCodeProfile,
  disconnectLeetCodeProfile,
} from "../controllers/leetcodeController.js";

const router = express.Router();

router.route("/profile").get(protect, getLeetCodeProfile);
router.route("/connect").post(protect, connectLeetCodeProfile);
router.route("/sync").post(protect, syncLeetCodeProfile);
router.route("/disconnect").delete(protect, disconnectLeetCodeProfile);

export default router;
