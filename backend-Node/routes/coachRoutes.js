import express from "express";
import {
  getSession,
  sendMessage,
  applyProfile,
  connectGitHub,
  connectLeetCode,
  connectVtop,
  saveResumeAnalysis,
} from "../controllers/coachController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/session").get(protect, getSession);
router.route("/message").post(protect, sendMessage);
router.route("/apply-profile").post(protect, applyProfile);
router.route("/connect-github").post(protect, connectGitHub);
router.route("/connect-leetcode").post(protect, connectLeetCode);
router.route("/connect-vtop").post(protect, connectVtop);
router.route("/save-resume-analysis").post(protect, saveResumeAnalysis);

export default router;

