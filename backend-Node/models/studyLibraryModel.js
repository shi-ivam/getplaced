import mongoose from "mongoose";

const studyNoteSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },
  noteText: {
    type: String,
    default: "",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const watchProgressSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },
  watchedSeconds: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
  },
});

const studyLibrarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    bookmarkedVideoIds: {
      type: [String],
      default: [],
    },
    notes: [studyNoteSchema],
    progress: [watchProgressSchema],
  },
  {
    timestamps: true,
  }
);

const StudyLibrary = mongoose.model("StudyLibrary", studyLibrarySchema);
export default StudyLibrary;
