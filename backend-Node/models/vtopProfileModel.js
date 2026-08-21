import mongoose from "mongoose";

const markItemSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "CAT 1", "CAT 2", "DA 1", "DA 2", "FAT"
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: null },
  weightage: { type: Number, default: 0 },
  maxWeightage: { type: Number, default: null },
  average: { type: Number, default: null },
  status: { type: String, default: "Present" }, // "Present", "Submitted", "Completed"
});

const vtopCourseSchema = new mongoose.Schema({
  code: { type: String, required: true }, // e.g. "CSE2005"
  title: { type: String, required: true }, // e.g. "Operating Systems"
  type: { type: String, enum: ["theory", "lab", "project", "embedded"], default: "theory" },
  credits: { type: Number, default: 4 },
  slot: { type: String, default: "A1" }, // e.g. "A1+TA1", "L45+L46"
  venue: { type: String, default: "AB3-402" },
  faculty: { type: String, default: "Dr. K. Ramanathan" },
  attendance: {
    attended: { type: Number, default: 36 },
    total: { type: Number, default: 40 },
    percentage: { type: Number, default: 90 },
    status: { type: String, enum: ["safe", "warning", "debarred"], default: "safe" },
  },
  marks: [markItemSchema],
  totalWeightedMark: { type: Number, default: 85.5 },
  maxWeightedTotal: { type: Number, default: 100 },
  grade: { type: String, default: "A" }, // "S", "A", "B", "C", "D", "E", "F", "N"
});

const vtopSemesterSchema = new mongoose.Schema({
  semesterId: { type: String, required: true }, // e.g. "CH2024251"
  semesterName: { type: String, required: true }, // e.g. "Fall Semester 2024-25"
  sgpa: { type: Number, default: null },
  creditsEarned: { type: Number, default: 21 },
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
      default: "22BCE1042",
    },
    studentName: {
      type: String,
      trim: true,
      default: "Student",
    },
    campus: {
      type: String,
      default: "VIT Chennai (vtopcc.vit.ac.in)",
    },
    program: {
      type: String,
      default: "B.Tech Computer Science and Engineering",
    },
    school: {
      type: String,
      default: "School of Computer Science and Engineering (SCOPE)",
    },
    currentCgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.74,
    },
    totalCreditsEarned: {
      type: Number,
      default: 118,
    },
    totalCreditsRequired: {
      type: Number,
      default: 160,
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
      default: 89.2,
    },
    totalClassesAttended: {
      type: Number,
      default: 342,
    },
    totalClassesConducted: {
      type: Number,
      default: 384,
    },
    feeDuesStatus: {
      type: Boolean,
      default: false, // false = no dues, clear
    },
    proctorName: {
      type: String,
      default: "Dr. S. Venkatesh (SCOPE)",
    },
    proctorEmail: {
      type: String,
      default: "proctor.scope@vit.ac.in",
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    syncStatus: {
      type: String,
      enum: ["synced", "pending", "simulated", "disconnected"],
      default: "synced",
    },
    activeSemesterId: {
      type: String,
      default: "CH2024251",
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
