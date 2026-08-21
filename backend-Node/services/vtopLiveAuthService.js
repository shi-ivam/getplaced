import axios from "axios";
import * as cheerio from "cheerio";
import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";
import { computeVtopPlacementImpact, generateDefaultVtopData } from "./vtopService.js";

// Bypass self-signed / internal SSL certificate errors for VTOP (matches StudentCC's onReceivedSslError handler.proceed())
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
    timeout: 12000,
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
    },
    validateStatus: () => true, // Don't throw on 3xx/4xx to handle redirects
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
        // Update session cookies and return refreshed captcha
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

    // Step 2: POST /vtop/prelogin/setup with student flag (same as StudentCC)
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
    let captchaSrc = doc2("#captchaBlock img").attr("src") || doc2("img.img-fluid").attr("src") || "";
    let loginCsrf = doc2('#vtopLoginForm input[name="_csrf"]').val() || doc2('input[name="_csrf"]').val() || stdCsrf;

    // If prelogin redirected or captcha in GET /login
    if (!captchaSrc) {
      const loginPageRes = await client.get("/login", {
        headers: { Referer: `${VTOP_BASE_URL}/login` },
      });
      const doc3 = cheerio.load(loginPageRes.data || "");
      captchaSrc = doc3("#captchaBlock img").attr("src") || doc3("img.img-fluid").attr("src") || "";
      loginCsrf = doc3('#vtopLoginForm input[name="_csrf"]').val() || doc3('input[name="_csrf"]').val() || loginCsrf;
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
    vtop = new VtopProfile(generateDefaultVtopData(userId, user));
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
        Referer: `${VTOP_BASE_URL}/login`,
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    const responseText = typeof loginRes.data === "string" ? loginRes.data : JSON.stringify(loginRes.data);
    const pageLower = responseText.toLowerCase();
    const doc = cheerio.load(responseText);

    // Check if authenticated
    const authorizedId = doc("#authorizedIDX").val() || doc('input[name="authorizedID"]').val();
    const isAuthorized =
      Boolean(authorizedId) ||
      responseText.includes("authorizedIDX") ||
      responseText.includes("doStudentMarkView") ||
      responseText.includes("logout");

    if (!isAuthorized) {
      // Determine exact error reason
      let errorMsg = "VTOP Login failed. Please verify credentials and captcha.";
      const alertText = doc(".alert, .text-danger, #errorMsg, span.text-danger").text().trim();

      if (pageLower.includes("invalid captcha")) {
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

      // Extract new dynamic captcha generated by VTOP after failed attempt
      let newCaptchaSrc = doc("#captchaBlock img").attr("src") || doc("img.img-fluid").attr("src") || "";
      const newCsrf = doc('#vtopLoginForm input[name="_csrf"]').val() || doc('input[name="_csrf"]').val() || csrf;

      // If response didn't include image directly, fetch new captcha on existing session
      if (!newCaptchaSrc || !newCaptchaSrc.startsWith("data:image")) {
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
      }

      // Update session for retry
      activeSessions.set(sessionId, {
        cookies: sessionWrapper.getCookies(),
        csrfToken: newCsrf,
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
    const updatedCsrf = doc('input[name="_csrf"]').val() || csrf;
    await harvestVtopLiveDetails(client, authorizedId || "AUTH_OK", updatedCsrf, vtop, semesterId);

    // Update profile with user-provided credentials
    vtop.regNo = username.toUpperCase();
    vtop.lastSyncedAt = new Date();
    vtop.syncStatus = "synced";
    if (semesterId) vtop.activeSemesterId = semesterId;

    await vtop.save();

    // Synchronize AcademicProfile and User
    await AcademicProfile.findOneAndUpdate(
      { userId },
      {
        currentCgpa: vtop.currentCgpa,
        activeBacklogs: vtop.activeBacklogs,
        historyOfBacklogs: vtop.historyOfBacklogs,
        college: "VIT Chennai",
        degree: "B.Tech",
        branch: "Computer Science & Engineering",
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
      message: `Successfully logged in to VTOP as ${username.toUpperCase()} and extracted live marksheet & GPA.`,
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
 * Harvest profile, grade history, timetable, attendance, and marksheet from VTOP
 */
async function harvestVtopLiveDetails(client, authorizedId, csrf, vtopDoc, semesterId) {
  try {
    const activeSem = semesterId || vtopDoc.activeSemesterId || "CH2024251";

    // 1. Grade History & CGPA
    const gradeHistoryRes = await client.post(
      "examinations/examGradeView/StudentGradeHistory",
      `verifyMenu=true&authorizedID=${authorizedId}&_csrf=${csrf}&nocache=${Date.now()}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (gradeHistoryRes.data) {
      const $ = cheerio.load(gradeHistoryRes.data);
      let extractedCgpa = null;
      let extractedCredits = null;

      $("table tr").each((_, row) => {
        const text = $(row).text().toLowerCase();
        if (text.includes("cgpa") && text.includes("earned")) {
          const cells = $(row).find("td");
          cells.each((idx, cell) => {
            const val = parseFloat($(cell).text().trim());
            if (!isNaN(val)) {
              if (val <= 10.0 && val >= 4.0 && !extractedCgpa) extractedCgpa = val;
              else if (val > 10.0 && !extractedCredits) extractedCredits = val;
            }
          });
        }
      });

      if (extractedCgpa) vtopDoc.currentCgpa = extractedCgpa;
      if (extractedCredits) vtopDoc.totalCreditsEarned = extractedCredits;
    }

    // 2. Attendance
    const attendanceRes = await client.post(
      "processViewStudentAttendance",
      `_csrf=${csrf}&semesterSubId=${activeSem}&authorizedID=${authorizedId}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
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
