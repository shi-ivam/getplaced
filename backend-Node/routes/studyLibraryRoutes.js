import express from "express";
import {
  getLibrary,
  toggleBookmark,
  saveNote,
  updateProgress,
} from "../controllers/studyLibraryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getLibrary);
router.route("/bookmark/:videoId").post(protect, toggleBookmark);
router.route("/notes/:videoId").post(protect, saveNote);
router.route("/progress/:videoId").post(protect, updateProgress);

export default router;
