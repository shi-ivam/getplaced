import mongoose from "mongoose";

const sheetProblemProgressSchema = new mongoose.Schema(
  {
    sheetId: {
      type: String,
      default: "",
    },
    problemId: {
      type: String,
      required: true,
    },
    problemName: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      default: "",
    },
    solved: {
      type: Boolean,
      default: false,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    solvedAt: {
      type: Date,
      default: null,
    },
    bookmarkedAt: {
      type: Date,
      default: null,
    },
    leetcodeSlug: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const dsaProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    completedLectures: {
      type: [String],
      default: [],
    },
    completedAssignments: {
      type: [String],
      default: [],
    },
    watchProgress: {
      type: Map,
      of: Number,
      default: {},
    },
    sheetProgress: {
      type: [sheetProblemProgressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const DsaProgress = mongoose.model("DsaProgress", dsaProgressSchema);
export default DsaProgress;
