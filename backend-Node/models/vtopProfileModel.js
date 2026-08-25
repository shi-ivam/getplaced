import mongoose from "mongoose";

const markItemSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "CAT 1", "CAT 2", "DA 1", "DA 2", "FAT"
  assessmentType: { type: String, default: "" },
  score: { type: Number, default: null },
  maxScore: { type: Number, default: null },
  weightage: { type: Number, default: null },
  maxWeightage: { type: Number, default: null },
  average: { type: Number, default: null },
  status: { type: String, default: null },
});

const vtopCourseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, default: "" }, // "theory", "lab", "project", "embedded"
  credits: { type: Number, default: null },
  ltpjc: {
    l: { type: Number, default: null },
    t: { type: Number, default: null },
    p: { type: Number, default: null },
    j: { type: Number, default: null },
    c: { type: Number, default: null },
  },
  slot: { type: String, default: "" },
  slots: [{ type: String }],
  venue: { type: String, default: "" },
  roomNumber: { type: String, default: "" },
  block: { type: String, default: "" },
  faculty: { type: String, default: "" },
  facultyEmail: { type: String, default: "" },
  facultyCabin: { type: String, default: "" },
  attendance: {
    attended: { type: Number, default: null },
    total: { type: Number, default: null },
    absent: { type: Number, default: null },
    percentage: { type: Number, default: null },
    status: { type: String, enum: ["safe", "warning", "debarred", "not_recorded"], default: "not_recorded" },
    safeBunks: { type: Number, default: null },
    requiredToRecover: { type: Number, default: null },
  },
  marks: [markItemSchema],
  cumulativeMarks: {
    theoryTotal: { type: Number, default: null },
    theoryMax: { type: Number, default: null },
    labTotal: { type: Number, default: null },
    labMax: { type: Number, default: null },
    projectTotal: { type: Number, default: null },
    projectMax: { type: Number, default: null },
    grandTotal: { type: Number, default: null },
    grandMax: { type: Number, default: null },
  },
  totalWeightedMark: { type: Number, default: null },
  maxWeightedTotal: { type: Number, default: null },
  grade: { type: String, default: "" },
  gradePoint: { type: Number, default: null },
  studyMaterialUrl: { type: String, default: "" },
});

const vtopSemesterSchema = new mongoose.Schema({
  semesterId: { type: String, required: true },
  semesterName: { type: String, required: true },
  sgpa: { type: Number, default: null },
  runningCgpa: { type: Number, default: null },
  creditsEarned: { type: Number, default: null },
  courses: [vtopCourseSchema],
});

const vtopGradeRecordSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseTitle: { type: String, required: true },
  courseType: { type: String, default: "" },
  credits: { type: Number, default: null },
  grade: { type: String, required: true },
  gradePoint: { type: Number, default: null },
  semester: { type: String, default: "" },
  isArrear: { type: Boolean, default: false },
});

const vtopExamSchema = new mongoose.Schema({
  id: { type: Number },
  examType: { type: String, default: "" },
  title: { type: String, default: "" },
  courseCode: { type: String, default: "" },
  courseTitle: { type: String, default: "" },
  slot: { type: String, default: "" },
  date: { type: String, default: null },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
  venue: { type: String, default: null },
  roomNumber: { type: String, default: null },
  block: { type: String, default: null },
  seatLocation: { type: String, default: null },
  seatNumber: { type: Number, default: null },
});

const vtopOnDutyApplicationSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  date: { type: String, default: "" },
  hours: { type: Number, default: null },
  status: { type: String, default: "" },
  type: { type: String, default: "" },
  approvedBy: { type: String, default: "" },
});

const vtopLeaveApplicationSchema = new mongoose.Schema({
  leaveType: { type: String, default: "" },
  fromDate: { type: String, default: "" },
  toDate: { type: String, default: "" },
  reason: { type: String, default: "" },
  status: { type: String, default: "" },
  place: { type: String, default: "" },
});

const vtopReceiptSchema = new mongoose.Schema({
  number: { type: Number },
  amount: { type: Number, default: null },
  date: { type: String, default: "" },
});

const vtopTimetableSlotSchema = new mongoose.Schema({
  startTime: { type: String, default: "" },
  endTime: { type: String, default: "" },
  sunday: { type: String, default: null },
  monday: { type: String, default: null },
  tuesday: { type: String, default: null },
  wednesday: { type: String, default: null },
  thursday: { type: String, default: null },
  friday: { type: String, default: null },
  saturday: { type: String, default: null },
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
    // Student Identity (populated strictly from VTOPCC response)
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
    branch: {
      type: String,
      default: "",
    },
    school: {
      type: String,
      default: "",
    },
    academicYear: {
      type: String,
      default: "",
    },
    currentSemester: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },

    // Staff Details
    proctor: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      mobile: { type: String, default: "" },
      cabin: { type: String, default: "" },
      department: { type: String, default: "" },
    },
    dean: {
      name: { type: String, default: "" },
      school: { type: String, default: "" },
    },
    hod: {
      name: { type: String, default: "" },
      department: { type: String, default: "" },
    },

    // Academic Scores & Progress (populated strictly from VTOPCC)
    currentCgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    totalCreditsEarned: {
      type: Number,
      default: null,
    },
    totalCreditsRequired: {
      type: Number,
      default: null,
    },
    totalCreditsRegistered: {
      type: Number,
      default: null,
    },
    activeBacklogs: {
      type: Number,
      default: null,
    },
    historyOfBacklogs: {
      type: Number,
      default: null,
    },

    // Attendance
    overallAttendancePercentage: {
      type: Number,
      default: null,
    },
    totalClassesAttended: {
      type: Number,
      default: null,
    },
    totalClassesConducted: {
      type: Number,
      default: null,
    },

    // Fee Dues
    feeDuesStatus: {
      type: Boolean,
      default: null,
    },
    paymentReceipts: [vtopReceiptSchema],

    // On-Duty (OD) & Leave
    onDuty: {
      totalHours: { type: Number, default: null },
      approvedHours: { type: Number, default: null },
      pendingHours: { type: Number, default: null },
      rejectedHours: { type: Number, default: null },
      applications: [vtopOnDutyApplicationSchema],
    },
    leave: {
      applications: [vtopLeaveApplicationSchema],
    },

    // Examination Schedule
    exams: [vtopExamSchema],

    // Timetable Matrix
    timetable: {
      theory: [vtopTimetableSlotSchema],
      lab: [vtopTimetableSlotSchema],
    },

    // Semester Matrix & Grade History
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

    // Synchronization status
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    syncStatus: {
      type: String,
      enum: ["synced", "pending", "disconnected", "error"],
      default: "disconnected",
    },
  },
  {
    timestamps: true,
  }
);

const VtopProfile = mongoose.model("VtopProfile", vtopProfileSchema);
export default VtopProfile;
