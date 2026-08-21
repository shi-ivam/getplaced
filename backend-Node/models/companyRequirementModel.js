import mongoose from "mongoose"

export const normalizeIdentifier = (str) => {
  if (!str || typeof str !== "string") return ""
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const companyRequirementSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    companyNormalized: {
      type: String,
      required: [true, "Normalized company identifier is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    roleTitle: {
      type: String,
      required: [true, "Role title is required"],
      trim: true,
    },
    roleNormalized: {
      type: String,
      required: [true, "Normalized role identifier is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    dsaExpectation: {
      level: {
        type: String,
        enum: ["None", "Easy", "Medium", "Hard", "Very Hard"],
        default: "Medium",
      },
      minProblemsSolved: {
        type: Number,
        default: 0,
      },
      topics: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    technicalSkills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        requiredLevel: {
          type: Number,
          min: 1,
          max: 5,
          default: 3,
        },
        importance: {
          type: String,
          enum: ["Required", "Preferred", "Optional"],
          default: "Required",
        },
      },
    ],
    cgpaCutoff: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    sourceMetadata: {
      sourceUrl: {
        type: String,
        trim: true,
        default: "",
      },
      sourceType: {
        type: String,
        enum: ["Official", "Community", "Recruiter", "AI-Inferred", "Other"],
        default: "Community",
      },
      lastVerifiedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for querying specific company and role requirement profiles
companyRequirementSchema.index({ companyNormalized: 1, roleNormalized: 1 })

companyRequirementSchema.pre("validate", function (next) {
  if (this.companyName && !this.companyNormalized) {
    this.companyNormalized = normalizeIdentifier(this.companyName)
  }
  if (this.roleTitle && !this.roleNormalized) {
    this.roleNormalized = normalizeIdentifier(this.roleTitle)
  }
  next()
})

const CompanyRequirement = mongoose.model("CompanyRequirement", companyRequirementSchema)

export default CompanyRequirement
