import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      trim: true,
      default: "",
    },
    degree: {
      type: String,
      trim: true,
      default: "",
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    cgpa: {
      type: Number,
      default: null,
    },
    tenthPercentage: {
      type: Number,
      default: null,
    },
    twelfthPercentage: {
      type: Number,
      default: null,
    },
    branch: {
      type: String,
      trim: true,
      default: "",
    },
    activeBacklogs: {
      type: Number,
      default: 0,
    },
    historyOfBacklogs: {
      type: Number,
      default: 0,
    },
    targetJobRole: {
      type: String,
      trim: true,
      default: "",
    },
    targetRoleNormalized: {
      type: String,
      trim: true,
      default: "",
    },
    targetCompany: {
      type: String,
      trim: true,
      default: "",
    },
    targetCompanyNormalized: {
      type: String,
      trim: true,
      default: "",
    },
    locationPreference: {
      type: String,
      trim: true,
      default: "",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    savedJobs: [
      {
        type: String,
        trim: true,
      },
    ],
    resumeScore: {
      type: Number,
      default: null,
    },
    resumeText: {
      type: String,
      default: "",
    },
    resumeAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    resumeVersions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema)

export default User
