import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
  semesterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  sgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: null,
  },
  credits: {
    type: Number,
    default: 20,
  },
  backlogs: {
    type: Number,
    default: 0,
  },
  totalSubjects: {
    type: Number,
    default: 6,
  },
  passedSubjects: {
    type: Number,
    default: 6,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const academicProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    college: {
      type: String,
      trim: true,
      default: "",
    },
    degree: {
      type: String,
      trim: true,
      default: "B.Tech",
    },
    branch: {
      type: String,
      trim: true,
      default: "Computer Science & Engineering",
    },
    graduationYear: {
      type: Number,
      default: 2026,
    },
    currentSemester: {
      type: Number,
      default: 6,
    },
    totalSemesters: {
      type: Number,
      default: 8,
    },
    currentCgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0,
    },
    targetCgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.5,
    },
    tenthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    twelfthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    diplomaPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    activeBacklogs: {
      type: Number,
      default: 0,
    },
    historyOfBacklogs: {
      type: Number,
      default: 0,
    },
    semesters: [semesterSchema],
  },
  {
    timestamps: true,
  }
);

const AcademicProfile = mongoose.model("AcademicProfile", academicProfileSchema);
export default AcademicProfile;
