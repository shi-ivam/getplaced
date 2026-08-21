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
    problemsSolved: {
      total: { type: Number, default: 0 },
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    submissions: {
      total: { type: Number, default: 0 },
      accepted: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
    },
    submissionStats: {
      acSubmissionNum: [
        {
          difficulty: { type: String, default: "" },
          count: { type: Number, default: 0 },
          submissions: { type: Number, default: 0 },
        },
      ],
      totalSubmissionNum: [
        {
          difficulty: { type: String, default: "" },
          count: { type: Number, default: 0 },
          submissions: { type: Number, default: 0 },
        },
      ],
    },
    activeDays: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    submissionCalendar: {
      type: String,
      default: "{}",
    },
    efficiencyRatio: {
      type: Number,
      default: null,
    },
    contest: {
      rating: { type: Number, default: null },
      globalRank: { type: Number, default: null },
      contestsAttended: { type: Number, default: null },
      totalParticipants: { type: Number, default: null },
      topPercentage: { type: Number, default: null },
      badge: { type: String, default: null },
    },
    languages: [
      {
        languageName: { type: String, default: "" },
        problemsSolved: { type: Number, default: 0 },
      },
    ],
    primaryLanguage: {
      name: { type: String, default: null },
      solved: { type: Number, default: null },
    },
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
