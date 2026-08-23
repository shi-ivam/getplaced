import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";

/**
 * Get VtopProfile for the user (returns null if unauthenticated / not synced).
 */
export async function getOrCreateVtopProfile(userId) {
  const vtop = await VtopProfile.findOne({ userId });
  return vtop || null;
}

/**
 * Compute detailed placement parameters & analytics based on VTOP data
 */
export function computeVtopPlacementImpact(vtopProfile) {
  if (!vtopProfile) return null;
  const cgpa =
    vtopProfile.currentCgpa !== null && vtopProfile.currentCgpa !== undefined && !isNaN(Number(vtopProfile.currentCgpa))
      ? Number(vtopProfile.currentCgpa)
      : null;
  const activeArrears = Number(vtopProfile.activeBacklogs) || 0;
  const historyArrears = Number(vtopProfile.historyOfBacklogs) || 0;
  const overallAttendance =
    vtopProfile.overallAttendancePercentage !== null &&
    vtopProfile.overallAttendancePercentage !== undefined &&
    !isNaN(Number(vtopProfile.overallAttendancePercentage))
      ? Number(vtopProfile.overallAttendancePercentage)
      : null;
  const creditsEarned = Number(vtopProfile.totalCreditsEarned) || 0;
  const creditsRequired = Number(vtopProfile.totalCreditsRequired) || 160;

  // Tier Eligibility
  const superDreamEligible = cgpa !== null && cgpa >= 9.0 && activeArrears === 0 && historyArrears === 0;
  const dreamEligible = cgpa !== null && cgpa >= 7.5 && activeArrears === 0 && historyArrears <= 1;
  const regularEligible = cgpa !== null && cgpa >= 6.0 && activeArrears <= 1;

  // Active courses analysis & debarment risk
  const currentSemester = vtopProfile.semesters?.find((s) => s.semesterId === vtopProfile.activeSemesterId) || vtopProfile.semesters?.[0];
  const activeCourses = currentSemester?.courses || [];

  const courseRiskList = activeCourses.map((c) => {
    const attended = Number(c.attendance?.attended) || 0;
    const total = Number(c.attendance?.total) || 0;
    const pct =
      c.attendance?.percentage !== null && c.attendance?.percentage !== undefined && !isNaN(Number(c.attendance?.percentage))
        ? Number(c.attendance.percentage)
        : total > 0
        ? Number(((attended / total) * 100).toFixed(1))
        : null;
    const isDebarred = pct !== null && pct < 75.0;
    const isWarning = pct !== null && pct >= 75.0 && pct < 80.0;

    // How many classes can be safely missed without dropping below 75%
    // (attended) / (total + x) >= 0.75  => attended >= 0.75*(total + x) => x <= (attended / 0.75) - total
    let safeBunks = Math.floor(attended / 0.75 - total);
    safeBunks = Math.max(0, safeBunks);

    // How many consecutive classes needed to get back to 75%
    // (attended + y) / (total + y) >= 0.75 => attended + y >= 0.75*total + 0.75*y => 0.25*y >= 0.75*total - attended
    // y = (3*total - 4*attended)
    let requiredToRecover = 0;
    if (pct !== null && pct < 75.0) {
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
      predictedGrade: c.grade || "",
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

  const coreCsGpa = coreCsCredits > 0 ? Number((coreCsPoints / coreCsCredits).toFixed(2)) : (cgpa ?? 0);

  // Overall Placement Academic Score (0 - 100)
  const effectiveCgpa = cgpa ?? 0;
  const effectiveAttendance = overallAttendance ?? 0;
  let placementAcademicScore = Math.round(
    (effectiveCgpa / 10) * 50 + // 50 pts for CGPA
      (activeArrears === 0 ? 25 : 0) + // 25 pts for zero backlogs
      (effectiveAttendance >= 85 ? 15 : effectiveAttendance >= 75 ? 10 : 0) + // 15 pts for attendance
      (coreCsGpa >= 8.5 ? 10 : 5) // 10 pts for Core CS
  );

  return {
    cgpa,
    targetGoal: 9.0,
    cgpaDeltaToSuperDream: cgpa !== null ? Number((9.0 - cgpa).toFixed(2)) : null,
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
