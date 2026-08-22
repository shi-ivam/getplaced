import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getLeetCodeProfile,
  connectLeetCodeProfile,
  syncLeetCodeProfile,
  disconnectLeetCodeProfile,
  getLeetCodeSubmissionAnalysis,
  getWorkspaceState,
  saveDraft,
  recordWorkspaceSubmission,
  markProblemAsSolved,
} from "../controllers/leetcodeController.js";

const router = express.Router();

router.route("/profile").get(protect, getLeetCodeProfile);
router.route("/connect").post(protect, connectLeetCodeProfile);
router.route("/sync").post(protect, syncLeetCodeProfile);
router.route("/disconnect").delete(protect, disconnectLeetCodeProfile);
router.route("/submissions-analysis").get(protect, getLeetCodeSubmissionAnalysis);
router.route("/submission-analysis").get(protect, getLeetCodeSubmissionAnalysis);

// Workspace storage & persistence routes
router.route("/workspace").get(protect, getWorkspaceState);
router.route("/draft").post(protect, saveDraft);
router.route("/submission").post(protect, recordWorkspaceSubmission);
router.route("/solved").post(protect, markProblemAsSolved);

export default router;
