import mongoose from "mongoose";

const codingSubmissionSchema = new mongoose.Schema(
  {
    id: { type: Number, default: () => Date.now() },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, required: true },
    runtime_ms: { type: Number },
    memory_mb: { type: Number },
    beats_runtime_pct: { type: Number },
    passed_count: { type: Number },
    total_count: { type: Number },
    error: { type: String },
  },
  { _id: false }
);

const solvedProblemSchema = new mongoose.Schema(
  {
    solvedAt: { type: Date, default: Date.now },
    runtimeMs: { type: Number },
    beatsPct: { type: Number },
    difficulty: { type: String },
    title: { type: String },
  },
  { _id: false }
);

const codingWorkspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    solvedProblems: {
      type: Map,
      of: solvedProblemSchema,
      default: {},
    },
    drafts: {
      type: Map,
      of: String,
      default: {},
    },
    submissions: {
      type: Map,
      of: [codingSubmissionSchema],
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const CodingWorkspace = mongoose.model("CodingWorkspace", codingWorkspaceSchema);
export default CodingWorkspace;
