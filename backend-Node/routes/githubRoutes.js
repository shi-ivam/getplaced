import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getGitHubProfile,
  connectGitHubProfile,
  syncGitHubProfile,
  disconnectGitHubProfile,
  getGitHubRepositories,
  verifyProjectLiveUrl,
} from "../controllers/githubController.js";

const router = express.Router();

router.route("/profile").get(protect, getGitHubProfile);
router.route("/connect").post(protect, connectGitHubProfile);
router.route("/sync").post(protect, syncGitHubProfile);
router.route("/disconnect").delete(protect, disconnectGitHubProfile);
router.route("/repositories").get(protect, getGitHubRepositories);
router.route("/verify-live").get(protect, verifyProjectLiveUrl);

export default router;

