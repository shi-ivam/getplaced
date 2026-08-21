import mongoose from "mongoose";

const roadmapTaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["dsa", "project", "resume", "academics", "interview", "core_cs", "system_design"],
    default: "dsa",
  },
  estimatedMinutes: {
    type: Number,
    default: 45,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  impactScore: {
    type: Number,
    default: 2.5, // e.g. +2.5% readiness
  },
  actionUrl: {
    type: String,
    default: "/app/coding",
  },
  resourceTitle: {
    type: String,
    default: "",
  },
});

const roadmapWeekSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  objective: {
    type: String,
    default: "",
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  tasks: [roadmapTaskSchema],
});

const roadmapPhaseSchema = new mongoose.Schema({
  phaseNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  durationWeeks: {
    type: Number,
    default: 2,
  },
  weeks: [roadmapWeekSchema],
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    targetCompany: {
      type: String,
      default: "Microsoft",
    },
    targetRole: {
      type: String,
      default: "Software Development Engineer",
    },
    timelineWeeks: {
      type: Number,
      default: 8,
    },
    currentWeek: {
      type: Number,
      default: 1,
    },
    overallProgress: {
      type: Number,
      default: 0,
    },
    phases: [roadmapPhaseSchema],
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export default Roadmap;
