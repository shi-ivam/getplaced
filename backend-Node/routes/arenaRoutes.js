import express from "express";
import {
  getLeaderboard,
  getChallenges,
  enrollChallenge,
  getMySquad,
  createNewSquad,
  joinSquad,
  postMessage,
} from "../controllers/arenaController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/leaderboard").get(protect, getLeaderboard);
router.route("/challenges").get(protect, getChallenges);
router.route("/challenges/:id/enroll").post(protect, enrollChallenge);
router.route("/challenges/:id/join").post(protect, enrollChallenge);
router.route("/squads/my-squad").get(protect, getMySquad);
router.route("/squads/create").post(protect, createNewSquad);
router.route("/squads/join").post(protect, joinSquad);
router.route("/squads/message").post(protect, postMessage);

export default router;
