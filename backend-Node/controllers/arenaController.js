import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  getArenaLeaderboard,
  getUserSquad,
  postSquadMessage,
  joinSquadByCode,
  createSquad,
  enrollInChallenge,
  ACTIVE_WEEKLY_CHALLENGES,
} from "../services/arenaService.js";

// @desc    Get leaderboard rankings
// @route   GET /api/arena/leaderboard
// @access  Private
export const getLeaderboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { college } = req.query;
  const leaderboard = await getArenaLeaderboard(req.user._id, user, college);
  res.json(leaderboard);
});

// @desc    Get active weekly placement challenges
// @route   GET /api/arena/challenges
// @access  Private
export const getChallenges = asyncHandler(async (req, res) => {
  res.json({ challenges: ACTIVE_WEEKLY_CHALLENGES });
});

// @desc    Get user squad
// @route   GET /api/arena/squads/my-squad
// @access  Private
export const getMySquad = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const squad = await getUserSquad(req.user._id, user);
  res.json(squad);
});

// @desc    Create a new squad
// @route   POST /api/arena/squads/create
// @access  Private
export const createNewSquad = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, description, avatar, targetTier } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Squad name is required");
  }

  const squad = await createSquad(req.user._id, user?.name, {
    name,
    description,
    avatar,
    targetTier,
  });

  res.status(201).json(squad);
});

// @desc    Join squad by invite code
// @route   POST /api/arena/squads/join
// @access  Private
export const joinSquad = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { code } = req.body;

  if (!code) {
    res.status(400);
    throw new Error("Squad invite code is required");
  }

  const squad = await joinSquadByCode(req.user._id, user?.name, code);
  res.json(squad);
});

// @desc    Post message to squad cheer feed
// @route   POST /api/arena/squads/message
// @access  Private
export const postMessage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { text, type } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Message text is required");
  }

  const result = await postSquadMessage(req.user._id, user?.name, text, type);
  res.json(result);
});

// @desc    Enroll in active challenge
// @route   POST /api/arena/challenges/:id/enroll
// @access  Private
export const enrollChallenge = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { id } = req.params;
  const result = await enrollInChallenge(req.user._id, user, id);
  res.json(result);
});
