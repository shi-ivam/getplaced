import mongoose from "mongoose";

const leetcodeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    profileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    realName: {
      type: String,
      default: "",
      trim: true,
    },
    ranking: {
      type: Number,
      default: null,
    },
    totalSolved: {
      type: Number,
      default: 0,
    },
    easySolved: {
      type: Number,
      default: 0,
    },
    mediumSolved: {
      type: Number,
      default: 0,
    },
    hardSolved: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
    },
    languages: [
      {
        languageName: { type: String, default: "" },
        problemsSolved: { type: Number, default: 0 },
      },
    ],
    topicTags: [
      {
        tagName: { type: String, default: "" },
        tagSlug: { type: String, default: "" },
        problemsSolved: { type: Number, default: 0 },
      },
    ],
    recentSubmissions: [
      {
        title: { type: String, default: "" },
        titleSlug: { type: String, default: "" },
        timestamp: { type: String, default: "" },
        statusDisplay: { type: String, default: "" },
        lang: { type: String, default: "" },
      },
    ],
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    syncStatus: {
      type: String,
      enum: ["synced", "failed", "pending"],
      default: "pending",
    },
    syncError: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const LeetCodeProfile = mongoose.model("LeetCodeProfile", leetcodeProfileSchema);

export default LeetCodeProfile;
export { LeetCodeProfile };
