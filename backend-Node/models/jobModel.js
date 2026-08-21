import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      index: true,
    },
    companyNormalized: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    companyLogo: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: "Bengaluru",
      trim: true,
      index: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site", "Flexible"],
      default: "Hybrid",
      index: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Internship", "Contract", "Part-time"],
      default: "Full-time",
      index: true,
    },
    experience: {
      type: String,
      default: "0-2 years",
    },
    experienceLevel: {
      type: String,
      enum: ["Internship", "Entry Level", "1-3 years", "Mid Level", "Senior"],
      default: "Entry Level",
      index: true,
    },
    minExperienceYears: {
      type: Number,
      default: 0,
    },
    maxExperienceYears: {
      type: Number,
      default: 2,
    },
    roleCategory: {
      type: String,
      enum: [
        "Software Engineer",
        "Frontend",
        "Backend",
        "Full Stack",
        "Data & AI",
        "DevOps & Cloud",
        "Mobile",
        "Internship",
      ],
      default: "Software Engineer",
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    education: {
      type: String,
      default: "Bachelor's degree in Computer Science, Engineering, or related technical field",
    },
    cgpaCutoff: {
      type: Number,
      default: 7.0,
    },
    salary: {
      type: String,
      default: "Competitive / Market Standard",
    },
    minSalary: {
      type: Number,
      default: null,
    },
    maxSalary: {
      type: Number,
      default: null,
    },
    salaryCurrency: {
      type: String,
      default: "INR",
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    applicationUrl: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      default: "Company Careers",
    },
    sourceType: {
      type: String,
      enum: ["DEMO", "OFFICIAL", "VERIFIED", "COMMUNITY"],
      default: "DEMO",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    companyDetails: {
      about: { type: String, default: "" },
      industry: { type: String, default: "Enterprise Software & Cloud Technology" },
      website: { type: String, default: "" },
      size: { type: String, default: "1,000+ employees" },
      headquarters: { type: String, default: "" },
      openPositionsCount: { type: Number, default: 5 },
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ company: 1, roleCategory: 1 });
jobSchema.index({ workMode: 1, employmentType: 1 });
jobSchema.index({ skills: 1 });

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job;
