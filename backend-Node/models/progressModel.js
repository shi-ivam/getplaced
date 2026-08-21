import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  overallScore: {
    type: Number,
    required: true,
  },
  dsaScore: {
    type: Number,
    default: 0,
  },
  projectScore: {
    type: Number,
    default: 0,
  },
  resumeScore: {
    type: Number,
    default: 0,
  },
  academicsScore: {
    type: Number,
    default: 0,
  },
  communicationScore: {
    type: Number,
    default: 0,
  },
  interviewScore: {
    type: Number,
    default: 0,
  },
  problemsSolved: {
    type: Number,
    default: 0,
  },
  studyMinutes: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
});

const activityLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["dsa_solved", "study_session", "resume_analyzed", "mock_interview", "roadmap_task", "challenge_completed", "profile_updated"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 10,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    dailyStreak: {
      type: Number,
      default: 1,
    },
    longestStreak: {
      type: Number,
      default: 1,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    totalProblemsSolved: {
      type: Number,
      default: 0,
    },
    totalStudyMinutes: {
      type: Number,
      default: 0,
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
    weeklyVelocityPct: {
      type: Number,
      default: 0, // e.g. +4.5%
    },
    snapshots: [snapshotSchema],
    activityLog: [activityLogSchema],
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
