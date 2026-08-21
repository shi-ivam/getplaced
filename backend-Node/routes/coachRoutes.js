import express from "express";
import {
  getSession,
  sendMessage,
  applyProfile,
} from "../controllers/coachController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/session").get(protect, getSession);
router.route("/message").post(protect, sendMessage);
router.route("/apply-profile").post(protect, applyProfile);

export default router;
