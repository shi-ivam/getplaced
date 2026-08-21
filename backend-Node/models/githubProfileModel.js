import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
  {
    githubId: {
      type: Number,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    htmlUrl: {
      type: String,
      required: true,
      trim: true,
    },
    homepage: {
      type: String,
      default: "",
      trim: true,
    },
    language: {
      type: String,
      default: "",
      trim: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    watchers: {
      type: Number,
      default: 0,
    },
    openIssues: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number,
      default: 0,
    },
    isFork: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
    pushedAt: {
      type: Date,
      default: null,
    },
    defaultBranch: {
      type: String,
      default: "main",
    },
    hasLiveDemo: {
      type: Boolean,
      default: false,
    },
    liveDemoUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const languageStatSchema = new mongoose.Schema(
  {
    languageName: {
      type: String,
      default: "",
    },
    repoCount: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const githubProfileSchema = new mongoose.Schema(
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
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    blog: {
      type: String,
      default: "",
      trim: true,
    },
    publicReposCount: {
      type: Number,
      default: 0,
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    totalStars: {
      type: Number,
      default: 0,
    },
    totalForks: {
      type: Number,
      default: 0,
    },
    originalReposCount: {
      type: Number,
      default: 0,
    },
    forkedReposCount: {
      type: Number,
      default: 0,
    },
    projectScore: {
      type: Number,
      default: 0,
    },
    repositories: {
      type: [repositorySchema],
      default: [],
    },
    languages: {
      type: [languageStatSchema],
      default: [],
    },
    topRepositories: {
      type: [repositorySchema],
      default: [],
    },
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

const GitHubProfile = mongoose.model("GitHubProfile", githubProfileSchema);

export default GitHubProfile;
export { GitHubProfile };
