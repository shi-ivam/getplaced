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
      default: 1, // 1: Ambition, 2: Academics, 3: Skills/Coding, 4: Resume/Review, 5: Completed
    },
    isCompleted: {
      type: Boolean,
      default: false,
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
