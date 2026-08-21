import express from "express";
import {
  getNextActions,
  completeActionTask,
} from "../controllers/recommendationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/next-actions").get(protect, getNextActions);
router.route("/complete-task").post(protect, completeActionTask);

export default router;
