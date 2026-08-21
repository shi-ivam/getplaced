import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalXp: {
      type: Number,
      default: 0,
    },
    currentTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
      default: "Bronze",
    },
    unlockedMilestoneIds: {
      type: [String],
      default: [],
    },
    claimedMilestoneIds: {
      type: [String],
      default: [],
    },
    achievements: [
      {
        id: String,
        title: String,
        description: String,
        category: String,
        tier: String,
        icon: String,
        unlockedAt: Date,
        xp: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Milestone = mongoose.model("Milestone", milestoneSchema);
export default Milestone;
