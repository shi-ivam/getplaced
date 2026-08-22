import mongoose from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

const DsaProgress = mongoose.model("DsaProgress", dsaProgressSchema);
export default DsaProgress;
