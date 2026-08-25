import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import { normalizeIdentifier } from "../models/companyRequirementModel.js";
import { getStudyMaterialUrl } from "../services/vtopStudyMaterialService.js";

dotenv.config();

const seedTestUser = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const testEmail = "test@example.com";
    const testPassword = "password123";

    // 1. User Account
    let user = await User.findOne({ email: testEmail });
    if (user) {
      console.log(`Updating existing test user: ${testEmail}...`);
      user.name = "Demo Candidate";
      user.password = testPassword;
      user.college = "VIT Chennai";
      user.degree = "B.Tech";
      user.graduationYear = 2026;
      user.cgpa = 8.85;
      user.tenthPercentage = 92.5;
      user.twelfthPercentage = 89.0;
      user.targetCompany = "Microsoft";
      user.targetCompanyNormalized = normalizeIdentifier("Microsoft");
      user.targetJobRole = "Software Development Engineer";
      user.targetRoleNormalized = normalizeIdentifier("Software Development Engineer");
      user.locationPreference = "Bangalore";
      await user.save();
    } else {
      console.log(`Creating new test user: ${testEmail}...`);
      user = await User.create({
        name: "Demo Candidate",
        email: testEmail,
        password: testPassword,
        college: "VIT Chennai",
        degree: "B.Tech",
        graduationYear: 2026,
        cgpa: 8.85,
        tenthPercentage: 92.5,
        twelfthPercentage: 89.0,
        targetCompany: "Microsoft",
        targetCompanyNormalized: normalizeIdentifier("Microsoft"),
        targetJobRole: "Software Development Engineer",
        targetRoleNormalized: normalizeIdentifier("Software Development Engineer"),
        locationPreference: "Bangalore",
      });
    }

    // 2. Academic Profile
    await AcademicProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        currentCgpa: 8.85,
        targetCgpa: 9.0,
        graduationYear: 2026,
        college: "VIT Chennai",
        degree: "B.Tech",
        branch: "Computer Science & Engineering",
        activeBacklogs: 0,
        historyOfBacklogs: 0,
      },
      { upsert: true }
    );

    // 3. Multi-Semester VTOP Data
    const semestersData = [
      {
        semesterId: "Semester 6",
        semesterName: "Semester 6 (Winter 2025-26)",
        sgpa: null,
        runningCgpa: 8.85,
        creditsEarned: 20,
        courses: [
          {
            code: "BCSE302L",
            title: "Database Management Systems",
            type: "theory",
            credits: 3,
            slot: "A1+TA1",
            venue: "AB3-304",
            faculty: "Dr. S. Anitha",
            attendance: { attended: 34, total: 38, absent: 4, percentage: 89.5, status: "safe", safeBunks: 7, requiredToRecover: 0 },
            marks: [
              { title: "CAT 1", score: 44, maxScore: 50, weightage: 13.2, maxWeightage: 15, average: 36.5, status: "Present" },
              { title: "CAT 2", score: 46, maxScore: 50, weightage: 13.8, maxWeightage: 15, average: 38.0, status: "Present" },
              { title: "Digital Assignment 1", score: 10, maxScore: 10, weightage: 10, maxWeightage: 10, average: 8.8, status: "Present" },
              { title: "Digital Assignment 2", score: 9.5, maxScore: 10, weightage: 9.5, maxWeightage: 10, average: 8.5, status: "Present" },
            ],
            totalWeightedMark: 46.5,
            maxWeightedTotal: 50,
            grade: "Pending",
            gradePoint: null,
            studyMaterialUrl: getStudyMaterialUrl("BCSE302L", "Database Management Systems"),
          },
          {
            code: "BCSE303L",
            title: "Operating Systems",
            type: "theory",
            credits: 3,
            slot: "B1+TB1",
            venue: "AB3-205",
            faculty: "Dr. M. Suresh",
            attendance: { attended: 30, total: 36, absent: 6, percentage: 83.3, status: "safe", safeBunks: 4, requiredToRecover: 0 },
            marks: [
              { title: "CAT 1", score: 41, maxScore: 50, weightage: 12.3, maxWeightage: 15, average: 34.2, status: "Present" },
              { title: "CAT 2", score: 43, maxScore: 50, weightage: 12.9, maxWeightage: 15, average: 35.8, status: "Present" },
              { title: "DA 1", score: 10, maxScore: 10, weightage: 10, maxWeightage: 10, average: 8.9, status: "Present" },
            ],
            totalWeightedMark: 35.2,
            maxWeightedTotal: 40,
            grade: "Pending",
            gradePoint: null,
            studyMaterialUrl: getStudyMaterialUrl("BCSE303L", "Operating Systems"),
          },
          {
            code: "BCSE308L",
            title: "Computer Networks",
            type: "theory",
            credits: 3,
            slot: "C1+TC1",
            venue: "AB3-108",
            faculty: "Dr. K. Rajesh",
            attendance: { attended: 26, total: 34, absent: 8, percentage: 76.5, status: "warning", safeBunks: 0, requiredToRecover: 0 },
            marks: [
              { title: "CAT 1", score: 38, maxScore: 50, weightage: 11.4, maxWeightage: 15, average: 32.0, status: "Present" },
              { title: "CAT 2", score: 40, maxScore: 50, weightage: 12.0, maxWeightage: 15, average: 33.5, status: "Present" },
            ],
            totalWeightedMark: 23.4,
            maxWeightedTotal: 30,
            grade: "Pending",
            gradePoint: null,
            studyMaterialUrl: getStudyMaterialUrl("BCSE308L", "Computer Networks"),
          },
          {
            code: "BCSE307L",
            title: "Software Engineering",
            type: "theory",
            credits: 3,
            slot: "D1+TD1",
            venue: "AB3-401",
            faculty: "Dr. P. Geetha",
            attendance: { attended: 36, total: 38, absent: 2, percentage: 94.7, status: "safe", safeBunks: 10, requiredToRecover: 0 },
            marks: [
              { title: "CAT 1", score: 47, maxScore: 50, weightage: 14.1, maxWeightage: 15, average: 39.0, status: "Present" },
              { title: "CAT 2", score: 48, maxScore: 50, weightage: 14.4, maxWeightage: 15, average: 40.2, status: "Present" },
            ],
            totalWeightedMark: 28.5,
            maxWeightedTotal: 30,
            grade: "Pending",
            gradePoint: null,
            studyMaterialUrl: getStudyMaterialUrl("BCSE307L", "Software Engineering"),
          },
          {
            code: "BCSE305L",
            title: "Compiler Design",
            type: "theory",
            credits: 3,
            slot: "E1+TE1",
            venue: "AB3-502",
            faculty: "Dr. N. Balaji",
            attendance: { attended: 22, total: 32, absent: 10, percentage: 68.8, status: "debarred", safeBunks: 0, requiredToRecover: 8 },
            marks: [
              { title: "CAT 1", score: 35, maxScore: 50, weightage: 10.5, maxWeightage: 15, average: 31.0, status: "Present" },
              { title: "CAT 2", score: 37, maxScore: 50, weightage: 11.1, maxWeightage: 15, average: 32.5, status: "Present" },
            ],
            totalWeightedMark: 21.6,
            maxWeightedTotal: 30,
            grade: "Pending",
            gradePoint: null,
            studyMaterialUrl: getStudyMaterialUrl("BCSE305L", "Compiler Design"),
          },
          {
            code: "BCSE309L",
            title: "Artificial Intelligence",
            type: "theory",
            credits: 3,
            slot: "F1+TF1",
            venue: "AB3-310",
            faculty: "Dr. T. Meena",
            attendance: { attended: 35, total: 36, absent: 1, percentage: 97.2, status: "safe", safeBunks: 10, requiredToRecover: 0 },
            marks: [
              { title: "CAT 1", score: 48, maxScore: 50, weightage: 14.4, maxWeightage: 15, average: 38.5, status: "Present" },
              { title: "CAT 2", score: 49, maxScore: 50, weightage: 14.7, maxWeightage: 15, average: 39.5, status: "Present" },
            ],
            totalWeightedMark: 29.1,
            maxWeightedTotal: 30,
            grade: "Pending",
            gradePoint: null,
            studyMaterialUrl: getStudyMaterialUrl("BCSE309L", "Artificial Intelligence"),
          },
          {
            code: "BCSE302P",
            title: "Database Management Systems Lab",
            type: "lab",
            credits: 1,
            slot: "L1+L2",
            venue: "Lab Complex 4",
            faculty: "Dr. S. Anitha",
            attendance: { attended: 14, total: 14, absent: 0, percentage: 100.0, status: "safe", safeBunks: 4, requiredToRecover: 0 },
            marks: [
              { title: "Continuous Assessment Lab", score: 48, maxScore: 50, weightage: 48, maxWeightage: 50, average: 42.0, status: "Present" },
            ],
            totalWeightedMark: 48.0,
            maxWeightedTotal: 50,
            grade: "Pending",
            gradePoint: null,
            studyMaterialUrl: getStudyMaterialUrl("BCSE302P", "Database Management Systems Lab"),
          },
          {
            code: "BCSE308P",
            title: "Computer Networks Lab",
            type: "lab",
            credits: 1,
            slot: "L3+L4",
            venue: "Lab Complex 2",
            faculty: "Dr. K. Rajesh",
            attendance: { attended: 13, total: 14, absent: 1, percentage: 92.9, status: "safe", safeBunks: 3, requiredToRecover: 0 },
            marks: [
              { title: "Continuous Assessment Lab", score: 46, maxScore: 50, weightage: 46, maxWeightage: 50, average: 41.5, status: "Present" },
            ],
            totalWeightedMark: 46.0,
            maxWeightedTotal: 50,
            grade: "Pending",
            gradePoint: null,
            studyMaterialUrl: getStudyMaterialUrl("BCSE308P", "Computer Networks Lab"),
          },
        ],
      },
      {
        semesterId: "Semester 5",
        semesterName: "Semester 5 (Fall 2025-26)",
        sgpa: 9.15,
        runningCgpa: 8.85,
        creditsEarned: 21,
        courses: [
          {
            code: "BCSE202L",
            title: "Data Structures and Algorithms",
            type: "theory",
            credits: 3,
            slot: "A1+TA1",
            venue: "AB2-201",
            faculty: "Dr. R. Kavitha",
            attendance: { attended: 36, total: 38, absent: 2, percentage: 94.7, status: "safe", safeBunks: 9, requiredToRecover: 0 },
            grade: "S",
            gradePoint: 10.0,
            studyMaterialUrl: getStudyMaterialUrl("BCSE202L", "Data Structures and Algorithms"),
          },
          {
            code: "BCSE205L",
            title: "Computer Architecture and Organization",
            type: "theory",
            credits: 3,
            slot: "B1+TB1",
            venue: "AB2-105",
            faculty: "Dr. V. Ramanathan",
            attendance: { attended: 32, total: 36, absent: 4, percentage: 88.9, status: "safe", safeBunks: 6, requiredToRecover: 0 },
            grade: "A",
            gradePoint: 9.0,
            studyMaterialUrl: getStudyMaterialUrl("BCSE205L", "Computer Architecture and Organization"),
          },
          {
            code: "BCSE204L",
            title: "Design and Analysis of Algorithms",
            type: "theory",
            credits: 4,
            slot: "C1+TC1",
            venue: "AB2-302",
            faculty: "Dr. N. Murugan",
            attendance: { attended: 42, total: 46, absent: 4, percentage: 91.3, status: "safe", safeBunks: 10, requiredToRecover: 0 },
            grade: "S",
            gradePoint: 10.0,
            studyMaterialUrl: getStudyMaterialUrl("BCSE204L", "Design and Analysis of Algorithms"),
          },
          {
            code: "BMAT201L",
            title: "Complex Variables and Linear Algebra",
            type: "theory",
            credits: 4,
            slot: "D1+TD1",
            venue: "MB-405",
            faculty: "Dr. S. Radha",
            attendance: { attended: 38, total: 44, absent: 6, percentage: 86.4, status: "safe", safeBunks: 6, requiredToRecover: 0 },
            grade: "A",
            gradePoint: 9.0,
            studyMaterialUrl: getStudyMaterialUrl("BMAT201L", "Complex Variables and Linear Algebra"),
          },
          {
            code: "BCSE202P",
            title: "Data Structures and Algorithms Lab",
            type: "lab",
            credits: 1,
            slot: "L5+L6",
            venue: "Lab Complex 1",
            faculty: "Dr. R. Kavitha",
            attendance: { attended: 14, total: 14, absent: 0, percentage: 100.0, status: "safe", safeBunks: 4, requiredToRecover: 0 },
            grade: "S",
            gradePoint: 10.0,
            studyMaterialUrl: getStudyMaterialUrl("BCSE202P", "Data Structures and Algorithms Lab"),
          },
        ],
      },
      {
        semesterId: "Semester 4",
        semesterName: "Semester 4 (Winter 2024-25)",
        sgpa: 8.75,
        runningCgpa: 8.72,
        creditsEarned: 22,
        courses: [
          {
            code: "BCSE201L",
            title: "Object Oriented Programming with Java",
            type: "theory",
            credits: 3,
            slot: "A2+TA2",
            venue: "AB1-204",
            faculty: "Dr. L. Priya",
            attendance: { attended: 35, total: 38, absent: 3, percentage: 92.1, status: "safe", safeBunks: 8, requiredToRecover: 0 },
            grade: "A",
            gradePoint: 9.0,
            studyMaterialUrl: getStudyMaterialUrl("BCSE201L", "Object Oriented Programming with Java"),
          },
          {
            code: "BMAT102L",
            title: "Differential Equations and Transforms",
            type: "theory",
            credits: 4,
            slot: "B2+TB2",
            venue: "MB-301",
            faculty: "Dr. K. Srinivasan",
            attendance: { attended: 40, total: 44, absent: 4, percentage: 90.9, status: "safe", safeBunks: 9, requiredToRecover: 0 },
            grade: "B",
            gradePoint: 8.0,
            studyMaterialUrl: getStudyMaterialUrl("BMAT102L", "Differential Equations and Transforms"),
          },
          {
            code: "BCSE102L",
            title: "Structured and Object-Oriented Problem Solving",
            type: "theory",
            credits: 3,
            slot: "C2+TC2",
            venue: "AB1-310",
            faculty: "Dr. P. Karthik",
            attendance: { attended: 33, total: 36, absent: 3, percentage: 91.7, status: "safe", safeBunks: 8, requiredToRecover: 0 },
            grade: "A",
            gradePoint: 9.0,
            studyMaterialUrl: getStudyMaterialUrl("BCSE102L", "Structured and Object-Oriented Problem Solving"),
          },
          {
            code: "BEEE102L",
            title: "Basic Electrical and Electronics Engineering",
            type: "theory",
            credits: 3,
            slot: "D2+TD2",
            venue: "TT-104",
            faculty: "Dr. M. Venkatesh",
            attendance: { attended: 30, total: 36, absent: 6, percentage: 83.3, status: "safe", safeBunks: 4, requiredToRecover: 0 },
            grade: "B",
            gradePoint: 8.0,
            studyMaterialUrl: getStudyMaterialUrl("BEEE102L", "Basic Electrical and Electronics Engineering"),
          },
        ],
      },
      {
        semesterId: "Semester 3",
        semesterName: "Semester 3 (Fall 2024-25)",
        sgpa: 8.6,
        runningCgpa: 8.7,
        creditsEarned: 20,
        courses: [
          {
            code: "BCSE101L",
            title: "Computer Programming: Python",
            type: "theory",
            credits: 3,
            slot: "A1+TA1",
            venue: "AB1-102",
            faculty: "Dr. V. Deepa",
            attendance: { attended: 36, total: 38, absent: 2, percentage: 94.7, status: "safe", safeBunks: 10, requiredToRecover: 0 },
            grade: "S",
            gradePoint: 10.0,
            studyMaterialUrl: getStudyMaterialUrl("BCSE101L", "Computer Programming: Python"),
          },
          {
            code: "BMAT101L",
            title: "Calculus",
            type: "theory",
            credits: 4,
            slot: "B1+TB1",
            venue: "MB-202",
            faculty: "Dr. A. Sundaram",
            attendance: { attended: 41, total: 46, absent: 5, percentage: 89.1, status: "safe", safeBunks: 8, requiredToRecover: 0 },
            grade: "A",
            gradePoint: 9.0,
            studyMaterialUrl: getStudyMaterialUrl("BMAT101L", "Calculus"),
          },
        ],
      },
      {
        semesterId: "Semester 2",
        semesterName: "Semester 2 (Winter 2023-24)",
        sgpa: 8.8,
        runningCgpa: 8.78,
        creditsEarned: 18,
        courses: [
          {
            code: "BPHY101L",
            title: "Engineering Physics",
            type: "theory",
            credits: 4,
            slot: "A2+TA2",
            venue: "MB-101",
            faculty: "Dr. T. Vijay",
            attendance: { attended: 42, total: 44, absent: 2, percentage: 95.5, status: "safe", safeBunks: 11, requiredToRecover: 0 },
            grade: "A",
            gradePoint: 9.0,
            studyMaterialUrl: getStudyMaterialUrl("BPHY101L", "Engineering Physics"),
          },
        ],
      },
      {
        semesterId: "Semester 1",
        semesterName: "Semester 1 (Fall 2023-24)",
        sgpa: 8.75,
        runningCgpa: 8.75,
        creditsEarned: 17,
        courses: [
          {
            code: "BCHY101L",
            title: "Engineering Chemistry",
            type: "theory",
            credits: 4,
            slot: "A1+TA1",
            venue: "MB-105",
            faculty: "Dr. N. Saravanan",
            attendance: { attended: 40, total: 42, absent: 2, percentage: 95.2, status: "safe", safeBunks: 10, requiredToRecover: 0 },
            grade: "A",
            gradePoint: 9.0,
            studyMaterialUrl: getStudyMaterialUrl("BCHY101L", "Engineering Chemistry"),
          },
        ],
      },
    ];

    const availableSemesters = [
      { id: "Semester 6", name: "Semester 6 (Winter 2025-26)" },
      { id: "Semester 5", name: "Semester 5 (Fall 2025-26)" },
      { id: "Semester 4", name: "Semester 4 (Winter 2024-25)" },
      { id: "Semester 3", name: "Semester 3 (Fall 2024-25)" },
      { id: "Semester 2", name: "Semester 2 (Winter 2023-24)" },
      { id: "Semester 1", name: "Semester 1 (Fall 2023-24)" },
    ];

    await VtopProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        regNo: "22BCE1024",
        studentName: "Demo Candidate",
        campus: "VIT Chennai",
        school: "School of Computer Science and Engineering (SCOPE)",
        program: "B.Tech",
        branch: "Computer Science & Engineering",
        academicYear: "2025 - 2026",
        currentSemester: "Semester 6",
        currentCgpa: 8.85,
        totalCreditsEarned: 118,
        totalCreditsRequired: 160,
        totalCreditsRegistered: 120,
        activeBacklogs: 0,
        historyOfBacklogs: 0,
        overallAttendancePercentage: 89.5,
        totalClassesAttended: 215,
        totalClassesConducted: 240,
        feeDuesStatus: false,
        proctor: {
          name: "Dr. K. Anbarasan",
          email: "anbarasan.k@vit.ac.in",
          mobile: "+91 98401 23456",
          cabin: "AB3-512",
          department: "Department of Computer Science",
        },
        dean: {
          name: "Dr. V. Jagadeesh",
          school: "SCOPE",
        },
        activeSemesterId: "Semester 6",
        availableSemesters,
        semesters: semestersData,
        lastSyncedAt: new Date(),
        syncStatus: "synced",
      },
      { upsert: true }
    );

    console.log("Multi-semester test user VTOP profile seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding test user:", error);
    process.exit(1);
  }
};

seedTestUser();
