import axios from "axios";
import * as cheerio from "cheerio";
import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";
import { computeVtopPlacementImpact } from "./vtopService.js";

// Bypass self-signed / internal SSL certificate errors for VTOP
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const VTOP_BASE_URL = "https://vtopcc.vit.ac.in/vtop";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// In-memory session store for multi-step handshake (keyed by sessionId or userId)
const activeSessions = new Map();

/**
 * Creates an Axios client instance with cookie header tracker
 */
function createVtopClient(initialCookies = "") {
  let currentCookies = initialCookies;

  const instance = axios.create({
    baseURL: VTOP_BASE_URL,
    timeout: 15000,
    maxRedirects: 0, // Manual redirect handling to preserve updated Set-Cookie headers
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
    },
    validateStatus: () => true, // Don't throw on 3xx/4xx/5xx
  });

  instance.interceptors.request.use((config) => {
    if (currentCookies) {
      config.headers["Cookie"] = currentCookies;
    }
    return config;
  });

  instance.interceptors.response.use((res) => {
    const rawCookies = res.headers["set-cookie"];
    if (rawCookies && Array.isArray(rawCookies)) {
      const newParts = rawCookies.map((c) => c.split(";")[0]);
      // Merge cookies
      const cookieMap = new Map();
      if (currentCookies) {
        currentCookies.split(";").forEach((c) => {
          const [k, v] = c.trim().split("=");
          if (k) cookieMap.set(k, v);
        });
      }
      newParts.forEach((c) => {
        const [k, v] = c.trim().split("=");
        if (k) cookieMap.set(k, v);
      });
      currentCookies = Array.from(cookieMap.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    }
    return res;
  });

  return {
    client: instance,
    getCookies: () => currentCookies,
    setCookies: (c) => {
      currentCookies = c;
    },
  };
}

/**
 * Step 1: Initialize VTOP pre-login session and extract fresh captcha image + tokens
 */
export async function getLiveVtopCaptcha(userId, existingSessionId = null) {
  // If an existing valid session is passed, attempt to refresh captcha using /get/new/captcha
  if (existingSessionId && activeSessions.has(existingSessionId)) {
    const session = activeSessions.get(existingSessionId);
    try {
      const sessionWrapper = createVtopClient(session.cookies);
      const client = sessionWrapper.client;

      const refreshRes = await client.get("/get/new/captcha", {
        headers: {
          Referer: `${VTOP_BASE_URL}/prelogin/setup`,
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const doc = cheerio.load(refreshRes.data || "");
      const captchaSrc = doc("#captchaBlock img").attr("src") || doc("img").attr("src") || "";

      if (captchaSrc && captchaSrc.startsWith("data:image")) {
        session.cookies = sessionWrapper.getCookies();
        activeSessions.set(existingSessionId, session);

        return {
          success: true,
          sessionId: existingSessionId,
          captchaImage: captchaSrc,
          csrfToken: session.csrfToken,
          portalConnected: true,
          portalUrl: `${VTOP_BASE_URL}/login`,
        };
      }
    } catch (err) {
      console.warn("Session-based captcha refresh failed, falling back to full handshake:", err.message);
    }
  }

  // Full handshake: GET /login -> POST /prelogin/setup
  const sessionWrapper = createVtopClient();
  const client = sessionWrapper.client;
  const sessionId = `vtop_sess_${userId}_${Date.now()}`;

  try {
    // Step 1: GET /vtop/login to obtain JSESSIONID and initial stdForm CSRF
    const initialRes = await client.get("/login");
    const doc1 = cheerio.load(initialRes.data || "");
    const stdCsrf = doc1('#stdForm input[name="_csrf"]').val() || doc1('input[name="_csrf"]').val() || "";

    // Step 2: POST /vtop/prelogin/setup with student flag
    const preloginPayload = new URLSearchParams({
      _csrf: stdCsrf,
      flag: "VTOP",
    }).toString();

    const preloginRes = await client.post("/prelogin/setup", preloginPayload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: `${VTOP_BASE_URL}/login`,
      },
    });

    const doc2 = cheerio.load(preloginRes.data || "");
    let captchaSrc =
      doc2("#captchaBlock img").attr("src") ||
      doc2("img[src^='data:image']").attr("src") ||
      doc2("img.img-fluid").attr("src") ||
      "";
    let loginCsrf = doc2('#vtopLoginForm input[name="_csrf"]').val() || doc2('input[name="_csrf"]').val() || stdCsrf;

    // Search any image with data:image in doc2
    if (!captchaSrc) {
      doc2("img").each((_, el) => {
        const src = doc2(el).attr("src");
        if (src && src.startsWith("data:image")) {
          captchaSrc = src;
        }
      });
    }

    // If prelogin did not return image directly, request /get/new/captcha
    if (!captchaSrc || !captchaSrc.startsWith("data:image")) {
      try {
        const newCapRes = await client.get("/get/new/captcha", {
          headers: {
            Referer: `${VTOP_BASE_URL}/prelogin/setup`,
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        const docCap = cheerio.load(newCapRes.data || "");
        captchaSrc = docCap("img").attr("src") || "";
      } catch (errCap) {
        console.warn("Direct /get/new/captcha fallback failed:", errCap.message);
      }
    }

    if (!captchaSrc || !captchaSrc.startsWith("data:image")) {
      throw new Error("Could not extract dynamic captcha from VTOP portal");
    }

    // Save session in memory for Step 2
    activeSessions.set(sessionId, {
      cookies: sessionWrapper.getCookies(),
      csrfToken: loginCsrf,
      userId,
      createdAt: Date.now(),
    });

    return {
      success: true,
      sessionId,
      captchaImage: captchaSrc,
      csrfToken: loginCsrf,
      portalConnected: true,
      portalUrl: `${VTOP_BASE_URL}/login`,
    };
  } catch (error) {
    console.warn("VTOP Live Captcha Handshake warning:", error.message);

    return {
      success: false,
      sessionId,
      captchaImage: "",
      portalConnected: false,
      error: "Could not establish connection to VTOP portal. Please verify network access.",
    };
  }
}

/**
 * Step 2: Authenticate using credentials + dynamic captcha and harvest transcript, marksheet, and attendance
 */
export async function authenticateAndScrapeVtop(userId, credentials) {
  const { username, password, captchaStr, sessionId, semesterId } = credentials;

  if (!captchaStr || !captchaStr.trim()) {
    return { success: false, error: "Please enter the captcha characters shown in the image." };
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return {
      success: false,
      error: "VTOP session expired. Please refresh the captcha and try again.",
    };
  }

  const user = await User.findById(userId);
  let vtop = await VtopProfile.findOne({ userId });
  if (!vtop) {
    vtop = new VtopProfile({
      userId,
      regNo: username.trim().toUpperCase(),
      studentName: user?.name || "",
      syncStatus: "in_progress",
      lastSyncedAt: new Date(),
    });
  }

  try {
    const sessionWrapper = createVtopClient(session.cookies);
    const client = sessionWrapper.client;
    const csrf = session.csrfToken;

    const loginPayload = new URLSearchParams({
      username: username.trim(),
      password: password.trim(),
      captchaStr: captchaStr.trim(),
      _csrf: csrf,
    }).toString();

    const loginRes = await client.post("/login", loginPayload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: `${VTOP_BASE_URL}/prelogin/setup`,
      },
    });

    let responseText = "";
    let isAuthorized = false;
    let authorizedId = null;
    let currentCsrf = csrf;

    console.log(`[VTOP Auth] POST /login status: ${loginRes.status}`);

    if (loginRes.status === 302 || loginRes.status === 301) {
      let location = loginRes.headers["location"] || loginRes.headers.location || "";
      console.log(`[VTOP Auth] Received redirect to: ${location}`);

      // If redirected back to login / open page / expired -> auth failed
      if (
        !location ||
        location.includes("/login") ||
        location.includes("/open/page") ||
        location.includes("/session/expired")
      ) {
        isAuthorized = false;
      } else {
        const origin = new URL(VTOP_BASE_URL).origin;
        let targetUrl = location;
        if (!targetUrl.startsWith("http")) {
          if (targetUrl.startsWith("/vtop")) {
            targetUrl = `${origin}${targetUrl}`;
          } else {
            targetUrl = `${origin}/vtop${targetUrl.startsWith("/") ? "" : "/"}${targetUrl}`;
          }
        }

        console.log(`[VTOP Auth] Cookies before fetching init/page: ${sessionWrapper.getCookies()}`);
        
        let currentPageRes = null;
        let currentUrl = targetUrl;
        for (let i = 0; i < 5; i++) {
          currentPageRes = await client.get(currentUrl, {
            headers: { Referer: `${VTOP_BASE_URL}/prelogin/setup` },
            maxRedirects: 0,
          });
          console.log(`[VTOP Auth] Hop ${i + 1}: ${currentUrl} -> Status: ${currentPageRes.status}`);
          if (currentPageRes.status === 302 || currentPageRes.status === 301) {
            const nextLoc = currentPageRes.headers["location"] || currentPageRes.headers.location;
            if (!nextLoc || nextLoc.includes("/login") || nextLoc.includes("/open/page") || nextLoc.includes("/session/expired")) {
              break;
            }
            const origin = new URL(VTOP_BASE_URL).origin;
            currentUrl = nextLoc.startsWith("http")
              ? nextLoc
              : `${origin}${nextLoc.startsWith("/") ? "" : "/"}${nextLoc}`;
          } else {
            break;
          }
        }

        responseText = typeof currentPageRes.data === "string" ? currentPageRes.data : JSON.stringify(currentPageRes.data);
        console.log(`[VTOP Auth] Final page body length: ${responseText.length}`);
        const docPage = cheerio.load(responseText);
        authorizedId = docPage("#authorizedIDX").val() || docPage('input[name="authorizedID"]').val();
        currentCsrf = docPage('input[name="_csrf"]').val() || currentCsrf;
        isAuthorized = Boolean(authorizedId) || responseText.includes("authorizedIDX") || responseText.includes("logout");
        console.log(`[VTOP Auth] After redirect: authorizedId=${authorizedId}, isAuthorized=${isAuthorized}`);
      }
    } else {
      responseText = typeof loginRes.data === "string" ? loginRes.data : JSON.stringify(loginRes.data);
      const docPage = cheerio.load(responseText);
      authorizedId = docPage("#authorizedIDX").val() || docPage('input[name="authorizedID"]').val();
      currentCsrf = docPage('input[name="_csrf"]').val() || currentCsrf;
      isAuthorized = Boolean(authorizedId) || responseText.includes("authorizedIDX") || responseText.includes("logout");
      console.log(`[VTOP Auth] Direct response: authorizedId=${authorizedId}, isAuthorized=${isAuthorized}`);
    }

    if (!isAuthorized) {
      const doc = cheerio.load(responseText || "");
      const pageLower = responseText.toLowerCase();

      // Determine error reason while ignoring static modal templates (Session Timed Out, Access Denied)
      let errorMsg = "VTOP Login failed. Please verify credentials and captcha.";
      
      // Extract alert/error text outside of static modals
      let alertText = "";
      doc(".alert:not(#sessionTimedOut .alert), #errorMsg, .has-error, #msgBoxInfoText").each((_, el) => {
        const t = doc(el).text().trim();
        if (t && !t.includes("Session Timed Out") && !t.includes("under Construction") && !t.includes("Access Denied")) {
          alertText = t;
        }
      });

      if (pageLower.includes("invalid captcha") || pageLower.includes("captcha mismatch") || pageLower.includes("enter the captcha")) {
        errorMsg = "Invalid Captcha entered. Please try again with the new captcha.";
      } else if (
        pageLower.includes("invalid user name") ||
        pageLower.includes("invalid login id") ||
        pageLower.includes("invalid password") ||
        pageLower.includes("user does not exist") ||
        pageLower.includes("invalid user") ||
        pageLower.includes("invalid credentials")
      ) {
        errorMsg = "Invalid VTOP Registration Number or Password.";
      } else if (pageLower.includes("account is locked") || pageLower.includes("locked")) {
        errorMsg = "Your VTOP account is locked. Please reset your password on the VTOP portal.";
      } else if (alertText) {
        errorMsg = alertText;
      }

      // Fetch a new captcha image on this session for immediate retry
      let newCaptchaSrc = "";
      try {
        const refreshRes = await client.get("/get/new/captcha", {
          headers: {
            Referer: `${VTOP_BASE_URL}/prelogin/setup`,
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        const rDoc = cheerio.load(refreshRes.data || "");
        newCaptchaSrc = rDoc("#captchaBlock img").attr("src") || rDoc("img").attr("src") || "";
      } catch (e) {
        console.warn("Could not fetch new captcha after failed login:", e.message);
      }

      activeSessions.set(sessionId, {
        cookies: sessionWrapper.getCookies(),
        csrfToken: currentCsrf || csrf,
        userId,
        createdAt: Date.now(),
      });

      return {
        success: false,
        error: errorMsg,
        newCaptchaImage: newCaptchaSrc,
        sessionId,
      };
    }

    // Successfully Authenticated!
    const effectiveAuthId = authorizedId || username.toUpperCase();
    await harvestVtopLiveDetails(client, effectiveAuthId, currentCsrf, vtop, semesterId);

    // Update profile with user-provided credentials
    vtop.regNo = effectiveAuthId;
    vtop.lastSyncedAt = new Date();
    vtop.syncStatus = "synced";
    if (semesterId) vtop.activeSemesterId = semesterId;

    await vtop.save();

    // Synchronize AcademicProfile and User
    await AcademicProfile.findOneAndUpdate(
      { userId },
      {
        currentCgpa: vtop.currentCgpa,
        activeBacklogs: vtop.activeBacklogs || 0,
        historyOfBacklogs: vtop.historyOfBacklogs || 0,
        college: vtop.campus || "VIT Chennai",
        degree: "B.Tech",
        branch: vtop.program || "",
      },
      { upsert: true }
    );

    await User.findByIdAndUpdate(userId, {
      regNo: vtop.regNo,
      cgpa: vtop.currentCgpa,
    });

    // Clean up session
    activeSessions.delete(sessionId);

    const placementImpact = computeVtopPlacementImpact(vtop);

    return {
      success: true,
      message: `Successfully logged in to VTOP as ${effectiveAuthId} and synced academic records (CGPA: ${vtop.currentCgpa}).`,
      vtop,
      placementImpact,
    };
  } catch (err) {
    console.error("VTOP Live login error:", err.message);
    return {
      success: false,
      error: err.message || "An unexpected error occurred during VTOP authentication.",
      sessionId,
    };
  }
}

/**
 * StudentCC Grade Points Mapping (from StudentCC/GPACourse.java)
 */
export function getGradePoints(grade) {
  switch (String(grade).toUpperCase().trim()) {
    case "S":
      return 10.0;
    case "A":
      return 9.0;
    case "B":
      return 8.0;
    case "C":
      return 7.0;
    case "D":
      return 6.0;
    case "E":
      return 5.0;
    case "F":
    case "N":
      return 0.0;
    default:
      return null; // For Pass/Audit courses like "P"
  }
}

/**
 * Calculate Semester-wise GPAs (SGPA) and progression using StudentCC formula:
 * SGPA = (Sum of GradePoints * Credits) / (Total Graded Credits)
 */
export function computeSemesterWiseGPA(gradeRecords) {
  const semMap = new Map();
  for (const c of gradeRecords) {
    const sem = c.semester || "Unknown";
    if (!semMap.has(sem)) semMap.set(sem, []);
    semMap.get(sem).push(c);
  }

  let cumTotalCredits = 0;
  let cumGradedCredits = 0;
  let cumGradePoints = 0;
  let cumEarnedCredits = 0;

  const semesters = [];

  for (const [semName, courses] of semMap.entries()) {
    let semTotalCredits = 0;
    let semGradedCredits = 0;
    let semGradePoints = 0;
    let semEarnedCredits = 0;

    for (const c of courses) {
      const cr = Number(c.credits) || 0;
      semTotalCredits += cr;
      const pts = getGradePoints(c.grade);

      if (c.grade !== "F" && c.grade !== "N") {
        semEarnedCredits += cr;
      }
      if (pts !== null) {
        semGradedCredits += cr;
        semGradePoints += pts * cr;
      }
    }

    const sgpa = semGradedCredits > 0 ? Number((semGradePoints / semGradedCredits).toFixed(2)) : 0;

    cumTotalCredits += semTotalCredits;
    cumGradedCredits += semGradedCredits;
    cumGradePoints += semGradePoints;
    cumEarnedCredits += semEarnedCredits;
    const runningCgpa = cumGradedCredits > 0 ? Number((cumGradePoints / cumGradedCredits).toFixed(2)) : 0;

    semesters.push({
      semesterId: semName,
      semesterName: semName,
      sgpa,
      runningCgpa,
      creditsEarned: semEarnedCredits,
      courses: courses.map((c) => ({
        code: c.courseCode,
        title: c.courseTitle,
        type: (c.courseType || "theory").toLowerCase().includes("lab") ? "lab" : "theory",
        credits: c.credits,
        grade: c.grade,
      })),
    });
  }

  return {
    semesters,
    cumulative: {
      totalRegisteredCredits: cumTotalCredits,
      totalEarnedCredits: cumEarnedCredits,
      totalGradedCredits: cumGradedCredits,
      totalGradePoints: Number(cumGradePoints.toFixed(2)),
      overallCgpa: cumGradedCredits > 0 ? Number((cumGradePoints / cumGradedCredits).toFixed(2)) : 0,
    },
  };
}

/**
 * Harvest profile, grade history, CGPA, credits, and attendance from VTOP
 */
async function harvestVtopLiveDetails(client, authorizedId, csrf, vtopDoc, semesterId) {
  try {
    const activeSem = semesterId || vtopDoc.activeSemesterId || "CH2024251";

    // 1. Grade History & CGPA
    const gradeHistoryRes = await client.post(
      "examinations/examGradeView/StudentGradeHistory",
      `verifyMenu=true&authorizedID=${authorizedId}&_csrf=${csrf}&nocache=${Date.now()}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
    );

    if (gradeHistoryRes.data) {
      const $ = cheerio.load(gradeHistoryRes.data);

      // Student info from top table
      $("table.customTable").first().find("tr.tableContent td").each((idx, el) => {
        const text = $(el).text().trim();
        if (idx === 1 && text) vtopDoc.studentName = text;
        else if (idx === 2 && text) vtopDoc.program = text;
        else if (idx === 8 && text) vtopDoc.school = text;
      });

      // CGPA Details Box
      let extractedCgpa = null;
      let extractedCredits = null;
      let extractedRegistered = null;
      let fGrades = 0;
      let nGrades = 0;

      $(".box-title").each((_, el) => {
        if ($(el).text().toLowerCase().includes("cgpa")) {
          const table = $(el).closest(".box").find("table");
          const headerCells = table.find("thead td, thead th").map((_, c) => $(c).text().trim().toLowerCase()).get();
          const dataCells = table.find("tbody tr").first().find("td").map((_, c) => $(c).text().trim()).get();

          headerCells.forEach((header, idx) => {
            const val = dataCells[idx];
            if (header.includes("cgpa")) extractedCgpa = parseFloat(val);
            else if (header.includes("credits earned")) extractedCredits = parseFloat(val);
            else if (header.includes("credits registered")) extractedRegistered = parseFloat(val);
            else if (header.includes("f grade")) fGrades = parseInt(val, 10) || 0;
            else if (header.includes("n grade")) nGrades = parseInt(val, 10) || 0;
          });
        }
      });

      if (extractedCgpa && !isNaN(extractedCgpa)) vtopDoc.currentCgpa = extractedCgpa;
      if (extractedCredits && !isNaN(extractedCredits)) vtopDoc.totalCreditsEarned = extractedCredits;
      if (extractedRegistered && !isNaN(extractedRegistered)) vtopDoc.totalCreditsRequired = Math.max(160, extractedRegistered);

      // Courses and Arrears History
      const gradeRecords = [];
      let activeArrears = 0;
      let historyArrears = fGrades + nGrades;

      $("table.customTable").eq(1).find("tr.tableContent").each((_, row) => {
        if ($(row).attr("id") && $(row).attr("id").startsWith("detailsView_")) return;
        const cells = $(row).find("td");
        if (cells.length >= 9) {
          const code = $(cells[1]).text().trim();
          const title = $(cells[2]).text().trim();
          const type = $(cells[3]).text().trim();
          const credits = parseFloat($(cells[4]).text().trim()) || 0;
          const grade = $(cells[5]).text().trim();
          const examMonth = $(cells[6]).text().trim();
          const isArrear = grade === "F" || grade === "N";

          if (code && title) {
            gradeRecords.push({
              courseCode: code,
              courseTitle: title,
              courseType: type || "",
              credits: credits || 0,
              grade: grade || "",
              semester: examMonth || "",
              isArrear,
            });
            if (isArrear) activeArrears++;
          }
        }
      });

      if (gradeRecords.length > 0) {
        vtopDoc.gradeHistory = gradeRecords;

        // Compute Semester-wise GPAs using StudentCC logic
        const semGPAData = computeSemesterWiseGPA(gradeRecords);
        if (semGPAData && semGPAData.semesters && semGPAData.semesters.length > 0) {
          vtopDoc.semesters = semGPAData.semesters;
        }
      }
      vtopDoc.activeBacklogs = activeArrears;
      vtopDoc.historyOfBacklogs = Math.max(historyArrears, activeArrears);
    }

    // 2. Attendance (if semester attendance is enabled)
    const attendanceRes = await client.post(
      "processViewStudentAttendance",
      `_csrf=${csrf}&semesterSubId=${activeSem}&authorizedID=${authorizedId}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
    );

    if (attendanceRes.data) {
      const $ = cheerio.load(attendanceRes.data);
      let totalAttended = 0;
      let totalConducted = 0;

      $("#getStudentDetails tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 6) {
          const attended = parseInt($(cells[3]).text().trim(), 10);
          const total = parseInt($(cells[4]).text().trim(), 10);
          if (!isNaN(attended) && !isNaN(total) && total > 0) {
            totalAttended += attended;
            totalConducted += total;
          }
        }
      });

      if (totalConducted > 0) {
        vtopDoc.totalClassesAttended = totalAttended;
        vtopDoc.totalClassesConducted = totalConducted;
        vtopDoc.overallAttendancePercentage = Number(((totalAttended / totalConducted) * 100).toFixed(1));
      }
    }
  } catch (err) {
    console.warn("harvestVtopLiveDetails partial warning:", err.message);
  }
}

