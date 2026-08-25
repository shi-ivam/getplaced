import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";
import { getStudyMaterialUrl } from "./vtopStudyMaterialService.js";

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
  const cgpa = typeof vtopProfile.currentCgpa === "number" ? vtopProfile.currentCgpa : null;
  const activeArrears = Number(vtopProfile.activeBacklogs) || 0;
  const historyArrears = Number(vtopProfile.historyOfBacklogs) || 0;
  const overallAttendance = typeof vtopProfile.overallAttendancePercentage === "number" ? vtopProfile.overallAttendancePercentage : null;
  const creditsEarned = typeof vtopProfile.totalCreditsEarned === "number" ? vtopProfile.totalCreditsEarned : null;
  const creditsRequired = typeof vtopProfile.totalCreditsRequired === "number" ? vtopProfile.totalCreditsRequired : null;

  // Tier Eligibility based on actual numbers
  const superDreamEligible = cgpa !== null ? (cgpa >= 9.0 && activeArrears === 0 && historyArrears === 0) : false;
  const dreamEligible = cgpa !== null ? (cgpa >= 7.5 && activeArrears === 0 && historyArrears <= 1) : false;
  const regularEligible = cgpa !== null ? (cgpa >= 6.0 && activeArrears <= 1) : false;

  // Active courses analysis & debarment risk
  const currentSemester = vtopProfile.semesters?.find((s) => s.semesterId === vtopProfile.activeSemesterId) || vtopProfile.semesters?.[0];
  const activeCourses = currentSemester?.courses || [];

  const courseRiskList = activeCourses.map((c) => {
    const attended = c.attendance?.attended;
    const total = c.attendance?.total;
    const pct = c.attendance?.percentage !== null && c.attendance?.percentage !== undefined
      ? c.attendance.percentage
      : total && total > 0 && attended !== null
      ? Number(((attended / total) * 100).toFixed(1))
      : null;

    const isDebarred = pct !== null ? pct < 75.0 : false;
    const isWarning = pct !== null ? pct >= 75.0 && pct < 80.0 : false;

    // How many classes can be safely missed without dropping below 75%
    let safeBunks = 0;
    if (attended !== null && total !== null && total > 0) {
      safeBunks = Math.max(0, Math.floor(attended / 0.75 - total));
    }

    // How many consecutive classes needed to get back to 75%
    let requiredToRecover = 0;
    if (pct !== null && pct < 75.0 && attended !== null && total !== null) {
      requiredToRecover = Math.max(0, Math.ceil(3 * total - 4 * attended));
    }

    return {
      code: c.code,
      title: c.title,
      type: c.type,
      credits: c.credits,
      slot: c.slot,
      venue: c.venue,
      roomNumber: c.roomNumber,
      block: c.block,
      faculty: c.faculty,
      attendancePct: pct,
      attended,
      total,
      absent: total !== null && attended !== null ? total - attended : null,
      isDebarred,
      isWarning,
      safeBunks,
      requiredToRecover,
      currentMarksTotal: c.totalWeightedMark,
      maxWeightedTotal: c.maxWeightedTotal,
      grade: c.grade || null,
      studyMaterialUrl: c.studyMaterialUrl || getStudyMaterialUrl(c.code, c.title),
    };
  });

  const debarredCourses = courseRiskList.filter((c) => c.isDebarred);
  const warningCourses = courseRiskList.filter((c) => c.isWarning);

  // Core CS Subjects Marks Calculation
  const coreCsCodes = ["CSE1001", "CSE1002", "CSE2003", "CSE2004", "CSE2005", "CSE3001", "CSE3002", "BCSE202L", "BCSE302L", "BCSE303L", "BCSE308L"];
  const coreGrades = (vtopProfile.gradeHistory || []).filter((g) => coreCsCodes.includes(g.courseCode));
  const gradePointMap = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0, N: 0 };

  let coreCsPoints = 0;
  let coreCsCredits = 0;
  coreGrades.forEach((g) => {
    const pts = gradePointMap[g.grade] ?? null;
    if (pts !== null && g.credits) {
      coreCsPoints += pts * g.credits;
      coreCsCredits += g.credits;
    }
  });

  const coreCsGpa = coreCsCredits > 0 ? Number((coreCsPoints / coreCsCredits).toFixed(2)) : cgpa;

  // Placement Academic Score (0 - 100)
  let placementAcademicScore = null;
  if (cgpa !== null) {
    placementAcademicScore = Math.round(
      (cgpa / 10) * 50 +
        (activeArrears === 0 ? 25 : 0) +
        (overallAttendance !== null && overallAttendance >= 85 ? 15 : overallAttendance !== null && overallAttendance >= 75 ? 10 : 0) +
        (coreCsGpa !== null && coreCsGpa >= 8.5 ? 10 : 5)
    );
  }

  return {
    cgpa,
    targetGoal: 9.0,
    cgpaDeltaToSuperDream: cgpa !== null ? Number((9.0 - cgpa).toFixed(2)) : null,
    activeArrears,
    historyArrears,
    overallAttendance,
    creditsEarned,
    creditsRequired,
    creditsRemaining: creditsRequired !== null && creditsEarned !== null ? Math.max(0, creditsRequired - creditsEarned) : null,
    creditCompletionPct: creditsRequired && creditsEarned ? Math.round((creditsEarned / creditsRequired) * 100) : null,
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
 * Technical documentation of the reverse-engineered login process
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
          "Extracts Base64 image. In StudentCC, ML Kit Vision + Contrast/Grayscale filtering attempts OCR recognition before fallback to user entry.",
      },
      {
        step: 3,
        title: "Credential Authentication",
        endpoint: "POST /vtop/login",
        payload: {
          username: "<RegNo>",
          password: "<Password>",
          captchaStr: "<SolvedCaptcha>",
        },
        validation: "Checks HTML for `authorizedIDX`. If missing, parses exact error: Invalid Captcha, Invalid Credentials, Account Locked, Max Attempts Reached.",
      },
      {
        step: 4,
        title: "Security Token Extraction",
        params: ["authorizedIDX", "_csrf", "winImage"],
        purpose: "Extracts session credentials embedded in the authenticated DOM outline for subsequent AJAX calls.",
      },
      {
        step: 5,
        title: "Semester Discovery & Profile Details",
        endpoints: [
          "POST academics/common/StudentTimeTableChn",
          "POST studentsRecord/StudentProfileAllView",
          "POST examinations/examGradeView/StudentGradeHistory",
        ],
        extractedFields: ["Semester List & IDs", "Personal Profile", "Cumulative CGPA", "Earned Credits", "Arrears Record"],
      },
      {
        step: 6,
        title: "Course Schedule, Attendance, Marks & Exam Harvesting",
        endpoints: [
          "POST processViewTimeTable (Courses, LTPJC, Venue, Faculty)",
          "POST processViewStudentAttendance (Attended, Total, Percentage, Safe Bunks)",
          "POST examinations/doStudentMarkView (CAT 1/2, DA 1/2, FAT, Class Average, Weightages)",
          "POST examinations/examGradeView/doStudentGradeView (Letter Grades & SGPA)",
          "POST examinations/doSearchExamScheduleForStudent (FAT Dates, Times, Venues, Seat Locations)",
          "POST academics/common/StudentAttendanceODStatus (Real OD Applications & Hours)",
        ],
        purpose: "Extracts course-level academic transcripts, assessment breakdowns, and debarment flags with strict slot-to-course relationship verification.",
      },
    ],
  };
}
