import mongoose from "mongoose";

const squadMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["chat", "achievement", "cheer", "system"],
    default: "chat",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const squadMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["leader", "member"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  weeklyContribution: {
    type: Number,
    default: 0, // tasks or problems solved this week
  },
  readinessScore: {
    type: Number,
    default: 65,
  },
  streakDays: {
    type: Number,
    default: 1,
  },
});

const squadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "Competitive peer group preparing for top tech campus placements.",
    },
    avatar: {
      type: String,
      default: "",
    },
    targetTier: {
      type: String,
      default: "Tier 1 Product Companies",
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [squadMemberSchema],
    weeklyGoal: {
      title: {
        type: String,
        default: "Collective Target: 50 Problems Solved",
      },
      targetCount: {
        type: Number,
        default: 50,
      },
      currentCount: {
        type: Number,
        default: 0,
      },
      endsAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    },
    messages: [squadMessageSchema],
    aggregateReadiness: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Squad = mongoose.model("Squad", squadSchema);
export default Squad;
