import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "coach"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  chips: {
    type: [String],
    default: [],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const coachConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    onboardingStep: {
      type: Number,
      default: 1, // 1: Ambition, 2: Academics, 3: GitHub, 4: LeetCode, 5: Skills & Self-Assessment, 6: Resume/LinkedIn/Review, 7: Final Report
    },
    onboardingStatus: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    profileCompletion: {
      type: Number,
      default: 0,
    },
    collectedData: {
      name: String,
      college: String,
      degree: String,
      branch: String,
      graduationYear: Number,
      cgpa: Number,
      tenthPercentage: Number,
      twelfthPercentage: Number,
      targetCompany: String,
      targetJobRole: String,
      locationPreference: String,
      careerGoals: String,
      targetTimelineWeeks: Number,
      interviewExperience: String,
      technicalConfidence: Number,
      communicationConfidence: Number,
      hrConfidence: Number,
    },
    connectedProfiles: {
      github: {
        connected: { type: Boolean, default: false },
        username: { type: String, default: "" },
        publicRepos: { type: Number, default: 0 },
        languages: [{ type: String }],
        topRepos: [{ type: String }],
        projectScore: { type: Number, default: null },
      },
      leetcode: {
        connected: { type: Boolean, default: false },
        username: { type: String, default: "" },
        totalSolved: { type: Number, default: 0 },
        easySolved: { type: Number, default: 0 },
        mediumSolved: { type: Number, default: 0 },
        hardSolved: { type: Number, default: 0 },
        primaryLanguage: { type: String, default: "" },
        ranking: { type: Number, default: null },
        streak: { type: Number, default: 0 },
      },
      vtop: {
        connected: { type: Boolean, default: false },
        regNo: { type: String, default: "" },
        cgpa: { type: Number, default: null },
        branch: { type: String, default: "" },
        college: { type: String, default: "" },
        activeBacklogs: { type: Number, default: 0 },
        historyOfBacklogs: { type: Number, default: 0 },
        creditsEarned: { type: Number, default: 0 },
        lastSyncedAt: { type: Date },
      },
      linkedin: {
        provided: { type: Boolean, default: false },
        url: { type: String, default: "" },
      },
      resume: {
        provided: { type: Boolean, default: false },
        filename: { type: String, default: "" },
        score: { type: Number, default: null },
        extractedSkills: [{ type: String }],
      },
    },
    discoveredProjects: [
      {
        name: String,
        description: String,
        language: String,
        stars: Number,
        topics: [String],
        isMain: { type: Boolean, default: false },
      },
    ],
    evidenceSkills: [
      {
        name: String,
        estimatedLevel: Number,
        requiredLevel: Number,
        gap: Number,
        confidence: Number,
        sources: [String],
        explanation: String,
        selfRating: Number,
      },
    ],
    readinessSnapshot: {
      overallScore: Number,
      targetBenchmark: Number,
      statusLabel: String,
      dimensions: mongoose.Schema.Types.Mixed,
      topGaps: mongoose.Schema.Types.Mixed,
    },
    extractedProfile: {
      targetCompany: String,
      targetJobRole: String,
      graduationYear: Number,
      college: String,
      degree: String,
      branch: String,
      cgpa: Number,
      tenthPercentage: Number,
      twelfthPercentage: Number,
      leetcodeUsername: String,
      githubUsername: String,
      primarySkills: [String],
      targetTimelineWeeks: Number,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const CoachConversation = mongoose.model("CoachConversation", coachConversationSchema);
export default CoachConversation;
