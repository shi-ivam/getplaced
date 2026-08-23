import mongoose from "mongoose";

const markItemSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "CAT 1", "CAT 2", "DA 1", "DA 2", "FAT"
  assessmentType: { type: String, default: "" },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: null },
  weightage: { type: Number, default: 0 },
  maxWeightage: { type: Number, default: null },
  average: { type: Number, default: null },
  status: { type: String, default: "Present" }, // "Present", "Submitted", "Completed"
});

const vtopCourseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, default: "theory" },
  credits: { type: Number, default: 0 },
  slot: { type: String, default: "" },
  venue: { type: String, default: "" },
  faculty: { type: String, default: "" },
  attendance: {
    attended: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: { type: String, enum: ["safe", "warning", "debarred"], default: "safe" },
  },
  marks: [markItemSchema],
  totalWeightedMark: { type: Number, default: 0 },
  maxWeightedTotal: { type: Number, default: 100 },
  grade: { type: String, default: "" },
});

const vtopSemesterSchema = new mongoose.Schema({
  semesterId: { type: String, required: true },
  semesterName: { type: String, required: true },
  sgpa: { type: Number, default: null },
  creditsEarned: { type: Number, default: 0 },
  courses: [vtopCourseSchema],
});

const vtopGradeRecordSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseTitle: { type: String, required: true },
  courseType: { type: String, default: "Theory" },
  credits: { type: Number, default: 4 },
  grade: { type: String, required: true }, // S, A, B, C, D, E, F, N
  semester: { type: String, default: "Winter 2023-24" },
  isArrear: { type: Boolean, default: false },
});

const vtopProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    regNo: {
      type: String,
      trim: true,
      default: "",
    },
    studentName: {
      type: String,
      trim: true,
      default: "",
    },
    campus: {
      type: String,
      default: "",
    },
    program: {
      type: String,
      default: "",
    },
    school: {
      type: String,
      default: "",
    },
    currentCgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    totalCreditsEarned: {
      type: Number,
      default: 0,
    },
    totalCreditsRequired: {
      type: Number,
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
    overallAttendancePercentage: {
      type: Number,
      default: null,
    },
    totalClassesAttended: {
      type: Number,
      default: 0,
    },
    totalClassesConducted: {
      type: Number,
      default: 0,
    },
    feeDuesStatus: {
      type: Boolean,
      default: false, // false = no dues, clear
    },
    proctorName: {
      type: String,
      default: "",
    },
    proctorEmail: {
      type: String,
      default: "",
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    syncStatus: {
      type: String,
      enum: ["synced", "pending", "simulated", "disconnected"],
      default: "pending",
    },
    activeSemesterId: {
      type: String,
      default: "",
    },
    availableSemesters: [
      {
        id: String,
        name: String,
      },
    ],
    semesters: [vtopSemesterSchema],
    gradeHistory: [vtopGradeRecordSchema],
  },
  {
    timestamps: true,
  }
);

const VtopProfile = mongoose.model("VtopProfile", vtopProfileSchema);
export default VtopProfile;
