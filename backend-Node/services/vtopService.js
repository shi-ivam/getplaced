import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";

/**
 * Generate default seed VTOP dataset matching VIT Chennai curriculum and StudentCC schema
 */
export function generateDefaultVtopData(userId, user = null) {
  const studentName = user?.name || "Shivam Kumar";
  const userCgpa = user?.cgpa || 8.74;

  const currentSemesterCourses = [
    {
      code: "CSE2005",
      title: "Operating Systems",
      type: "embedded",
      credits: 4,
      slot: "A1+TA1",
      venue: "AB3-402",
      faculty: "Dr. K. Ramanathan (SCOPE)",
      attendance: {
        attended: 37,
        total: 40,
        percentage: 92.5,
        status: "safe",
      },
      marks: [
        { title: "CAT 1", score: 45.0, maxScore: 50, weightage: 13.5, maxWeightage: 15, average: 36.5, status: "Present" },
        { title: "CAT 2", score: 46.5, maxScore: 50, weightage: 13.95, maxWeightage: 15, average: 38.0, status: "Present" },
        { title: "Digital Assignment 1", score: 10.0, maxScore: 10, weightage: 10.0, maxWeightage: 10, average: 8.5, status: "Submitted" },
        { title: "Digital Assignment 2", score: 9.5, maxScore: 10, weightage: 9.5, maxWeightage: 10, average: 8.2, status: "Submitted" },
        { title: "Lab Continuous Assessment", score: 48.0, maxScore: 50, weightage: 14.4, maxWeightage: 15, average: 41.0, status: "Completed" },
        { title: "FAT / Final Exam (Estimated)", score: 86.0, maxScore: 100, weightage: 30.1, maxWeightage: 35, average: 68.5, status: "Projected" },
      ],
      totalWeightedMark: 91.45,
      maxWeightedTotal: 100,
      grade: "S",
    },
    {
      code: "CSE2004",
      title: "Database Management Systems",
      type: "embedded",
      credits: 4,
      slot: "B1+TB1",
      venue: "AB3-305",
      faculty: "Prof. Priya S. (SCOPE)",
      attendance: {
        attended: 35,
        total: 38,
        percentage: 92.1,
        status: "safe",
      },
      marks: [
        { title: "CAT 1", score: 44.0, maxScore: 50, weightage: 13.2, maxWeightage: 15, average: 35.8, status: "Present" },
        { title: "CAT 2", score: 45.0, maxScore: 50, weightage: 13.5, maxWeightage: 15, average: 37.1, status: "Present" },
        { title: "DA 1 / SQL Queries", score: 10.0, maxScore: 10, weightage: 10.0, maxWeightage: 10, average: 8.7, status: "Submitted" },
        { title: "DA 2 / Normalization", score: 9.0, maxScore: 10, weightage: 9.0, maxWeightage: 10, average: 8.0, status: "Submitted" },
        { title: "Lab Project & Viva", score: 47.0, maxScore: 50, weightage: 14.1, maxWeightage: 15, average: 40.5, status: "Completed" },
        { title: "FAT / Final Exam (Estimated)", score: 84.0, maxScore: 100, weightage: 29.4, maxWeightage: 35, average: 69.0, status: "Projected" },
      ],
      totalWeightedMark: 89.2,
      maxWeightedTotal: 100,
      grade: "A",
    },
    {
      code: "CSE3001",
      title: "Computer Networks",
      type: "theory",
      credits: 3,
      slot: "C1+TC1",
      venue: "AB3-201",
      faculty: "Dr. M. Senthil Kumar (SCOPE)",
      attendance: {
        attended: 30,
        total: 34,
        percentage: 88.2,
        status: "safe",
      },
      marks: [
        { title: "CAT 1", score: 43.5, maxScore: 50, weightage: 13.05, maxWeightage: 15, average: 34.2, status: "Present" },
        { title: "CAT 2", score: 44.0, maxScore: 50, weightage: 13.2, maxWeightage: 15, average: 36.0, status: "Present" },
        { title: "Quiz 1 (Packet Tracer)", score: 9.0, maxScore: 10, weightage: 9.0, maxWeightage: 10, average: 7.9, status: "Submitted" },
        { title: "DA 1 (Socket Programming)", score: 10.0, maxScore: 10, weightage: 10.0, maxWeightage: 10, average: 8.4, status: "Submitted" },
        { title: "FAT / Final Exam (Estimated)", score: 82.0, maxScore: 100, weightage: 41.0, maxWeightage: 50, average: 65.0, status: "Projected" },
      ],
      totalWeightedMark: 86.25,
      maxWeightedTotal: 100,
      grade: "A",
    },
    {
      code: "CSE3002",
      title: "Design & Analysis of Algorithms",
      type: "embedded",
      credits: 4,
      slot: "D1+TD1",
      venue: "AB1-502",
      faculty: "Dr. Ananya Mukherjee (SCOPE)",
      attendance: {
        attended: 38,
        total: 40,
        percentage: 95.0,
        status: "safe",
      },
      marks: [
        { title: "CAT 1", score: 48.0, maxScore: 50, weightage: 14.4, maxWeightage: 15, average: 33.0, status: "Present" },
        { title: "CAT 2", score: 49.0, maxScore: 50, weightage: 14.7, maxWeightage: 15, average: 34.5, status: "Present" },
        { title: "DA 1 / Dynamic Programming", score: 10.0, maxScore: 10, weightage: 10.0, maxWeightage: 10, average: 8.0, status: "Submitted" },
        { title: "DA 2 / Graph Optimization", score: 10.0, maxScore: 10, weightage: 10.0, maxWeightage: 10, average: 8.2, status: "Submitted" },
        { title: "Lab Problem Solving", score: 49.0, maxScore: 50, weightage: 14.7, maxWeightage: 15, average: 39.0, status: "Completed" },
        { title: "FAT / Final Exam (Estimated)", score: 92.0, maxScore: 100, weightage: 32.2, maxWeightage: 35, average: 66.0, status: "Projected" },
      ],
      totalWeightedMark: 96.0,
      maxWeightedTotal: 100,
      grade: "S",
    },
    {
      code: "CSE3501",
      title: "Information Security & Cryptography",
      type: "theory",
      credits: 3,
      slot: "E1+TE1",
      venue: "AB3-108",
      faculty: "Prof. Rajesh Kannan",
      attendance: {
        attended: 25,
        total: 32,
        percentage: 78.1,
        status: "warning", // Close to 75% cutoff threshold
      },
      marks: [
        { title: "CAT 1", score: 40.0, maxScore: 50, weightage: 12.0, maxWeightage: 15, average: 34.0, status: "Present" },
        { title: "CAT 2", score: 41.5, maxScore: 50, weightage: 12.45, maxWeightage: 15, average: 35.5, status: "Present" },
        { title: "DA 1 / RSA Implementation", score: 8.5, maxScore: 10, weightage: 8.5, maxWeightage: 10, average: 7.8, status: "Submitted" },
        { title: "DA 2 / SHA & AES Crypto", score: 9.0, maxScore: 10, weightage: 9.0, maxWeightage: 10, average: 8.0, status: "Submitted" },
        { title: "FAT / Final Exam (Estimated)", score: 79.0, maxScore: 100, weightage: 39.5, maxWeightage: 50, average: 64.0, status: "Projected" },
      ],
      totalWeightedMark: 81.45,
      maxWeightedTotal: 100,
      grade: "A",
    },
    {
      code: "STS3001",
      title: "Soft Skills & Placement Readiness",
      type: "lab",
      credits: 1,
      slot: "L31+L32",
      venue: "Language Lab 1",
      faculty: "CDC Placement Trainer",
      attendance: {
        attended: 14,
        total: 15,
        percentage: 93.3,
        status: "safe",
      },
      marks: [
        { title: "Aptitude Mock 1", score: 45.0, maxScore: 50, weightage: 22.5, maxWeightage: 25, average: 35.0, status: "Completed" },
        { title: "Technical Mock Test", score: 48.0, maxScore: 50, weightage: 24.0, maxWeightage: 25, average: 36.5, status: "Completed" },
        { title: "GD & Communication Round", score: 46.0, maxScore: 50, weightage: 46.0, maxWeightage: 50, average: 38.0, status: "Completed" },
      ],
      totalWeightedMark: 92.5,
      maxWeightedTotal: 100,
      grade: "S",
    },
  ];

  const pastSemesters = [
    {
      semesterId: "CH2024251",
      semesterName: "Fall Semester 2024-25 (Current)",
      sgpa: 9.05,
      creditsEarned: 19,
      courses: currentSemesterCourses,
    },
    {
      semesterId: "CH2023245",
      semesterName: "Winter Semester 2023-24",
      sgpa: 8.84,
      creditsEarned: 22,
      courses: [],
    },
    {
      semesterId: "CH2023241",
      semesterName: "Fall Semester 2023-24",
      sgpa: 8.68,
      creditsEarned: 23,
      courses: [],
    },
    {
      semesterId: "CH2022235",
      semesterName: "Winter Semester 2022-23",
      sgpa: 8.55,
      creditsEarned: 22,
      courses: [],
    },
    {
      semesterId: "CH2022231",
      semesterName: "Fall Semester 2022-23",
      sgpa: 8.60,
      creditsEarned: 20,
      courses: [],
    },
  ];

  const gradeHistory = [
    { courseCode: "CSE1001", courseTitle: "Problem Solving and Programming (C/C++)", courseType: "Embedded", credits: 4, grade: "S", semester: "Fall 2022-23", isArrear: false },
    { courseCode: "MAT1011", courseTitle: "Calculus for Engineers", courseType: "Theory", credits: 4, grade: "A", semester: "Fall 2022-23", isArrear: false },
    { courseCode: "PHY1701", courseTitle: "Engineering Physics & Lab", courseType: "Embedded", credits: 4, grade: "A", semester: "Fall 2022-23", isArrear: false },
    { courseCode: "ENG1901", courseTitle: "Technical English Communication", courseType: "Theory", credits: 2, grade: "S", semester: "Fall 2022-23", isArrear: false },
    { courseCode: "CSE1002", courseTitle: "Object Oriented Programming (Java)", courseType: "Embedded", credits: 4, grade: "S", semester: "Winter 2022-23", isArrear: false },
    { courseCode: "MAT2001", courseTitle: "Statistics for Engineers", courseType: "Theory", credits: 4, grade: "A", semester: "Winter 2022-23", isArrear: false },
    { courseCode: "CSE2001", courseTitle: "Computer Organization and Architecture", courseType: "Theory", credits: 3, grade: "B", semester: "Winter 2022-23", isArrear: false },
    { courseCode: "CSE2003", courseTitle: "Data Structures and Algorithms", courseType: "Embedded", credits: 4, grade: "S", semester: "Fall 2023-24", isArrear: false },
    { courseCode: "MAT3004", courseTitle: "Discrete Mathematics & Graph Theory", courseType: "Theory", credits: 4, grade: "A", semester: "Fall 2023-24", isArrear: false },
    { courseCode: "CSE2002", courseTitle: "Theory of Computation & Automata", courseType: "Theory", credits: 3, grade: "A", semester: "Fall 2023-24", isArrear: false },
    { courseCode: "CSE2006", courseTitle: "Microprocessors & Interfacing", courseType: "Embedded", credits: 4, grade: "B", semester: "Winter 2023-24", isArrear: false },
    { courseCode: "CSE3003", courseTitle: "Software Engineering & Agile", courseType: "Theory", credits: 3, grade: "A", semester: "Winter 2023-24", isArrear: false },
    { courseCode: "CSE3006", courseTitle: "Artificial Intelligence & Expert Systems", courseType: "Embedded", credits: 4, grade: "S", semester: "Winter 2023-24", isArrear: false },
  ];

  return {
    userId,
    regNo: user?.regNo || "22BCE1042",
    studentName,
    campus: "VIT Chennai (vtopcc.vit.ac.in)",
    program: "B.Tech Computer Science and Engineering",
    school: "School of Computer Science and Engineering (SCOPE)",
    currentCgpa: userCgpa,
    totalCreditsEarned: 118,
    totalCreditsRequired: 160,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    overallAttendancePercentage: 89.2,
    totalClassesAttended: 342,
    totalClassesConducted: 384,
    feeDuesStatus: false,
    proctorName: "Dr. S. Venkatesh (Associate Prof, SCOPE)",
    proctorEmail: "venkatesh.s@vit.ac.in",
    lastSyncedAt: new Date(),
    syncStatus: "synced",
    activeSemesterId: "CH2024251",
    availableSemesters: [
      { id: "CH2024251", name: "Fall Semester 2024-25" },
      { id: "CH2023245", name: "Winter Semester 2023-24" },
      { id: "CH2023241", name: "Fall Semester 2023-24" },
      { id: "CH2022235", name: "Winter Semester 2022-23" },
      { id: "CH2022231", name: "Fall Semester 2022-23" },
    ],
    semesters: pastSemesters,
    gradeHistory,
  };
}

/**
 * Get or initialize VtopProfile for the user.
 */
export async function getOrCreateVtopProfile(userId, fallbackUser = null) {
  let vtop = await VtopProfile.findOne({ userId });

  if (!vtop) {
    const defaultData = generateDefaultVtopData(userId, fallbackUser);
    vtop = await VtopProfile.create(defaultData);
  }

  return vtop;
}

/**
 * Compute detailed placement parameters & analytics based on VTOP data
 */
export function computeVtopPlacementImpact(vtopProfile) {
  const cgpa = Number(vtopProfile.currentCgpa) || 8.0;
  const activeArrears = Number(vtopProfile.activeBacklogs) || 0;
  const historyArrears = Number(vtopProfile.historyOfBacklogs) || 0;
  const overallAttendance = Number(vtopProfile.overallAttendancePercentage) || 85.0;
  const creditsEarned = Number(vtopProfile.totalCreditsEarned) || 118;
  const creditsRequired = Number(vtopProfile.totalCreditsRequired) || 160;

  // Tier Eligibility
  const superDreamEligible = cgpa >= 9.0 && activeArrears === 0 && historyArrears === 0;
  const dreamEligible = cgpa >= 7.5 && activeArrears === 0 && historyArrears <= 1;
  const regularEligible = cgpa >= 6.0 && activeArrears <= 1;

  // Active courses analysis & debarment risk
  const currentSemester = vtopProfile.semesters?.find((s) => s.semesterId === vtopProfile.activeSemesterId) || vtopProfile.semesters?.[0];
  const activeCourses = currentSemester?.courses || [];

  const courseRiskList = activeCourses.map((c) => {
    const attended = c.attendance?.attended || 0;
    const total = c.attendance?.total || 0;
    const pct = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;
    const isDebarred = pct < 75.0;
    const isWarning = pct >= 75.0 && pct < 80.0;

    // How many classes can be safely missed without dropping below 75%
    // (attended) / (total + x) >= 0.75  => attended >= 0.75*(total + x) => x <= (attended / 0.75) - total
    let safeBunks = Math.floor(attended / 0.75 - total);
    safeBunks = Math.max(0, safeBunks);

    // How many consecutive classes needed to get back to 75%
    // (attended + y) / (total + y) >= 0.75 => attended + y >= 0.75*total + 0.75*y => 0.25*y >= 0.75*total - attended
    // y = (3*total - 4*attended)
    let requiredToRecover = 0;
    if (pct < 75.0) {
      requiredToRecover = Math.max(0, Math.ceil(3 * total - 4 * attended));
    }

    return {
      code: c.code,
      title: c.title,
      type: c.type,
      credits: c.credits,
      slot: c.slot,
      faculty: c.faculty,
      attendancePct: pct,
      attended,
      total,
      isDebarred,
      isWarning,
      safeBunks,
      requiredToRecover,
      currentMarksTotal: c.totalWeightedMark || 0,
      predictedGrade: c.grade || "A",
    };
  });

  const debarredCourses = courseRiskList.filter((c) => c.isDebarred);
  const warningCourses = courseRiskList.filter((c) => c.isWarning);

  // Core CS Subjects Marks Calculation
  const coreCsCodes = ["CSE1001", "CSE1002", "CSE2003", "CSE2004", "CSE2005", "CSE3001", "CSE3002"];
  const coreGrades = (vtopProfile.gradeHistory || []).filter((g) => coreCsCodes.includes(g.courseCode));
  const gradePointMap = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0, N: 0 };

  let coreCsPoints = 0;
  let coreCsCredits = 0;
  coreGrades.forEach((g) => {
    const pts = gradePointMap[g.grade] ?? 8;
    coreCsPoints += pts * g.credits;
    coreCsCredits += g.credits;
  });

  const coreCsGpa = coreCsCredits > 0 ? Number((coreCsPoints / coreCsCredits).toFixed(2)) : cgpa;

  // Overall Placement Academic Score (0 - 100)
  let placementAcademicScore = Math.round(
    (cgpa / 10) * 50 + // 50 pts for CGPA
      (activeArrears === 0 ? 25 : 0) + // 25 pts for zero backlogs
      (overallAttendance >= 85 ? 15 : overallAttendance >= 75 ? 10 : 0) + // 15 pts for attendance
      (coreCsGpa >= 8.5 ? 10 : 5) // 10 pts for Core CS
  );

  return {
    cgpa,
    targetGoal: 9.0,
    cgpaDeltaToSuperDream: Number((9.0 - cgpa).toFixed(2)),
    activeArrears,
    historyArrears,
    overallAttendance,
    creditsEarned,
    creditsRequired,
    creditsRemaining: Math.max(0, creditsRequired - creditsEarned),
    creditCompletionPct: Math.round((creditsEarned / creditsRequired) * 100),
    feeDuesStatus: vtopProfile.feeDuesStatus,
    superDreamEligible,
    dreamEligible,
    regularEligible,
    coreCsGpa,
    placementAcademicScore,
    debarredCount: debarredCourses.length,
    warningCount: warningCourses.length,
    debarredCourses,
    warningCourses,
    courseRiskList,
    loginProtocolSpecs: getVtopAuthProtocolSummary(),
  };
}

/**
 * Return technical documentation of the reverse-engineered login process
 * extracted from Salmanmalvasi/StudentCC.
 */
export function getVtopAuthProtocolSummary() {
  return {
    portalUrl: "https://vtopcc.vit.ac.in/vtop",
    loginMechanism: "Multi-step Form Session Auth with OCR Captcha Handling",
    steps: [
      {
        step: 1,
        title: "Session Pre-Login Setup",
        endpoint: "POST /vtop/prelogin/setup",
        payload: "Serialized #stdForm",
        purpose: "Initializes JSESSIONID cookie, token handshakes, and loads the dynamic login screen.",
      },
      {
        step: 2,
        title: "Captcha Acquisition & OCR Preprocessing",
        endpoint: "DOM / In-page Base64 Image: $('#captchaBlock img')",
        purpose:
          "Extracts Base64 image. In StudentCC, ML Kit Vision + Contrast/Grayscale filtering attempts 4 OCR recognition passes before fallback to user dialog.",
      },
      {
        step: 3,
        title: "Credential Authentication",
        endpoint: "POST /vtop/login",
        payload: {
          username: "<RegNo/EmployeeID>",
          password: "<Password>",
          captchaStr: "<SolvedCaptcha>",
          gResponse: "<TokenIfReCaptcha>",
        },
        validation: "Checks HTML for presence of `authorizedIDX`. If missing, inspects error strings: Invalid Captcha, Account Locked, Max Failed Attempts.",
      },
      {
        step: 4,
        title: "Security Token Extraction",
        params: ["authorizedIDX", "_csrf", "winImage"],
        purpose: "Extracts session credentials embedded in the authenticated DOM outline for subsequent AJAX calls.",
      },
      {
        step: 5,
        title: "Semester Discovery & Grade History",
        endpoints: [
          "POST academics/common/StudentTimeTableChn",
          "POST examinations/examGradeView/StudentGradeHistory",
        ],
        extractedFields: ["Semester List & IDs", "Cumulative CGPA", "Earned Credits", "Arrears Record"],
      },
      {
        step: 6,
        title: "Marksheet & Attendance Harvesting",
        endpoints: [
          "POST processViewTimeTable (Courses & Faculty)",
          "POST processViewStudentAttendance (Attended/Total/Percentage)",
          "POST examinations/doStudentMarkView (CAT1, CAT2, DA1/2, FAT Weightages)",
          "POST examinations/examGradeView/doStudentGradeView (Letter Grades & SGPA)",
        ],
        purpose: "Extracts course-level academic transcripts, assessment breakdowns, and debarment flags.",
      },
    ],
  };
}
