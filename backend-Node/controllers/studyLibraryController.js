import asyncHandler from "express-async-handler";
import {
  getStudyLibrary,
  toggleVideoBookmark,
  saveVideoNote,
  updateWatchProgress,
} from "../services/studyLibraryService.js";

// @desc    Get study library catalog and user state
// @route   GET /api/study-library
// @access  Private
export const getLibrary = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const data = await getStudyLibrary(req.user._id, category, search);
  res.json(data);
});

// @desc    Toggle bookmark on video
// @route   POST /api/study-library/bookmark/:videoId
// @access  Private
export const toggleBookmark = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const result = await toggleVideoBookmark(req.user._id, videoId);
  res.json(result);
});

// @desc    Save video study notes
// @route   POST /api/study-library/notes/:videoId
// @access  Private
export const saveNote = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { noteText } = req.body;
  const result = await saveVideoNote(req.user._id, videoId, noteText);
  res.json(result);
});

// @desc    Update watch progress
// @route   POST /api/study-library/progress/:videoId
// @access  Private
export const updateProgress = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { watchedSeconds, completed } = req.body;
  const result = await updateWatchProgress(req.user._id, videoId, watchedSeconds, completed);
  res.json(result);
});
