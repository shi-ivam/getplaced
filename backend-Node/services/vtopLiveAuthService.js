import https from "https";
import axios from "axios";
import * as cheerio from "cheerio";
import VtopProfile from "../models/vtopProfileModel.js";
import AcademicProfile from "../models/academicProfileModel.js";
import User from "../models/userModel.js";
import { computeVtopPlacementImpact } from "./vtopService.js";
import { getStudyMaterialUrl } from "./vtopStudyMaterialService.js";

const VTOP_BASE_URL = "https://vtopcc.vit.ac.in/vtop";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const vtopHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const activeSessions = new Map();
const SESSION_TTL_MS = 15 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const sessionCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of activeSessions.entries()) {
    const sessionTime = session.updatedAt || session.createdAt || 0;
    if (now - sessionTime > SESSION_TTL_MS) {
      activeSessions.delete(sessionId);
    }
  }
}, CLEANUP_INTERVAL_MS);

if (sessionCleanupTimer.unref) {
  sessionCleanupTimer.unref();
}

function createVtopClient(initialCookies = "") {
  let currentCookies = initialCookies;

  const instance = axios.create({
    baseURL: VTOP_BASE_URL,
    timeout: 20000,
    maxRedirects: 0,
    httpsAgent: vtopHttpsAgent,
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
    },
    validateStatus: () => true,
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

export async function getLiveVtopCaptcha(userId, existingSessionId = null) {
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
        session.updatedAt = Date.now();
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
      console.warn("[VTOP Captcha] Session refresh failed, creating fresh handshake:", err.message);
    }
  }

  const sessionWrapper = createVtopClient();
  const client = sessionWrapper.client;
  const sessionId = `vtop_sess_${userId}_${Date.now()}`;

  try {
    const initialRes = await client.get("/login");
    const doc1 = cheerio.load(initialRes.data || "");
    const stdCsrf = doc1('#stdForm input[name="_csrf"]').val() || doc1('input[name="_csrf"]').val() || "";

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

    if (!captchaSrc) {
      doc2("img").each((_, el) => {
        const src = doc2(el).attr("src");
        if (src && src.startsWith("data:image")) {
          captchaSrc = src;
        }
      });
    }

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
        console.warn("[VTOP Captcha] Fallback /get/new/captcha failed:", errCap.message);
      }
    }

    if (!captchaSrc || !captchaSrc.startsWith("data:image")) {
      throw new Error("Could not extract dynamic captcha from VTOP portal.");
    }

    activeSessions.set(sessionId, {
      cookies: sessionWrapper.getCookies(),
      csrfToken: loginCsrf,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
    console.warn("[VTOP Captcha] Handshake failed:", error.message);
    return {
      success: false,
      sessionId,
      captchaImage: "",
      portalConnected: false,
      error: "Could not establish connection to VTOP portal. Please verify network access.",
    };
  }
}

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
      syncStatus: "pending",
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

    if (loginRes.status === 302 || loginRes.status === 301) {
      let location = loginRes.headers["location"] || loginRes.headers.location || "";
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

        let currentPageRes = null;
        let currentUrl = targetUrl;
        for (let i = 0; i < 5; i++) {
          currentPageRes = await client.get(currentUrl, {
            headers: { Referer: `${VTOP_BASE_URL}/prelogin/setup` },
            maxRedirects: 0,
          });
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

        responseText = typeof currentPageRes?.data === "string" ? currentPageRes.data : JSON.stringify(currentPageRes?.data || "");
        const docPage = cheerio.load(responseText);
        authorizedId = docPage("#authorizedIDX").val() || docPage('input[name="authorizedID"]').val();
        currentCsrf = docPage('input[name="_csrf"]').val() || currentCsrf;
        isAuthorized = Boolean(authorizedId) || responseText.includes("authorizedIDX") || responseText.includes("logout");
      }
    } else {
      responseText = typeof loginRes.data === "string" ? loginRes.data : JSON.stringify(loginRes.data);
      const docPage = cheerio.load(responseText);
      authorizedId = docPage("#authorizedIDX").val() || docPage('input[name="authorizedID"]').val();
      currentCsrf = docPage('input[name="_csrf"]').val() || currentCsrf;
      isAuthorized = Boolean(authorizedId) || responseText.includes("authorizedIDX") || responseText.includes("logout");
    }

    if (!isAuthorized) {
      const doc = cheerio.load(responseText || "");
      const pageLower = responseText.toLowerCase();

      let errorMsg = "VTOP Login failed. Please verify credentials and captcha.";
      let alertText = "";
      doc(".alert:not(#sessionTimedOut .alert), #errorMsg, .has-error, #msgBoxInfoText").each((_, el) => {
        const t = doc(el).text().trim();
        if (t && !t.includes("Session Timed Out") && !t.includes("under Construction") && !t.includes("Access Denied")) {
          alertText = t;
        }
      });

      if (
        pageLower.includes("invalid captcha") ||
        pageLower.includes("captcha mismatch") ||
        pageLower.includes("enter the captcha")
      ) {
        errorMsg = "Invalid Captcha entered. Please try again with the new captcha image.";
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
      } else if (pageLower.includes("maximum fail attempts") || pageLower.includes("max fail attempts")) {
        errorMsg = "Maximum login attempts reached. Please open VTOP in your browser to unlock/reset your account.";
      } else if (alertText) {
        errorMsg = alertText;
      }

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
        console.warn("[VTOP Auth] New captcha refresh warning:", e.message);
      }

      activeSessions.set(sessionId, {
        cookies: sessionWrapper.getCookies(),
        csrfToken: currentCsrf || csrf,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return {
        success: false,
        error: errorMsg,
        newCaptchaImage: newCaptchaSrc,
        sessionId,
      };
    }

    const effectiveAuthId = authorizedId || username.toUpperCase();
    console.log(`[VTOP Auth] Successfully authenticated user: ${effectiveAuthId}`);

    await harvestAllVtopData(client, effectiveAuthId, currentCsrf, vtop, semesterId);

    vtop.regNo = effectiveAuthId;
    vtop.lastSyncedAt = new Date();
    vtop.syncStatus = "synced";
    if (semesterId) vtop.activeSemesterId = semesterId;

    await vtop.save();

    await AcademicProfile.findOneAndUpdate(
      { userId },
      {
        currentCgpa: vtop.currentCgpa,
        activeBacklogs: vtop.activeBacklogs || 0,
        historyOfBacklogs: vtop.historyOfBacklogs || 0,
        college: vtop.campus || "",
        degree: vtop.program || "B.Tech",
        branch: vtop.branch || "",
      },
      { upsert: true }
    );

    if (vtop.currentCgpa !== null) {
      await User.findByIdAndUpdate(userId, {
        regNo: vtop.regNo,
        cgpa: vtop.currentCgpa,
      });
    }

    const userSessionKey = `user_session_${userId}`;
    activeSessions.set(userSessionKey, {
      cookies: sessionWrapper.getCookies(),
      csrfToken: currentCsrf || csrf,
      authorizedId: effectiveAuthId,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    activeSessions.delete(sessionId);

    const placementImpact = computeVtopPlacementImpact(vtop);

    return {
      success: true,
      message: `Successfully synchronized authoritative VTOP data for ${effectiveAuthId}.`,
      vtop,
      placementImpact,
    };
  } catch (err) {
    console.error("[VTOP Auth] Exception during live authentication:", err.message);
    return {
      success: false,
      error: err.message || "An unexpected error occurred during VTOP authentication.",
      sessionId,
    };
  }
}

export async function fetchSemesterDataFromVtop(userId, semesterId) {
  const vtop = await VtopProfile.findOne({ userId });
  if (!vtop) {
    return {
      success: false,
      error: "No connected VTOP profile found. Please authenticate with VTOP first.",
    };
  }

  const userSessionKey = `user_session_${userId}`;
  const session = activeSessions.get(userSessionKey);

  if (session && session.cookies && session.authorizedId) {
    try {
      const sessionWrapper = createVtopClient(session.cookies);
      const client = sessionWrapper.client;
      const csrf = session.csrfToken;
      const authorizedId = session.authorizedId;

      console.log(`[VTOP Live] Querying live VTOPCC for semester: ${semesterId}`);

      const timetableRes = await client.post(
        "processViewTimeTable",
        `_csrf=${csrf}&semesterSubId=${semesterId}&authorizedID=${authorizedId}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
      );

      const ttData = typeof timetableRes.data === "string" ? timetableRes.data : JSON.stringify(timetableRes.data || "");
      if (
        timetableRes.status === 302 ||
        ttData.includes("/login") ||
        ttData.includes("Session Timed Out") ||
        ttData.includes("Access Denied")
      ) {
        activeSessions.delete(userSessionKey);
        const savedSem = vtop.semesters?.find((s) => s.semesterId === semesterId || s.semesterName === semesterId);
        if (savedSem) {
          return {
            success: true,
            fromCache: true,
            semesterId: savedSem.semesterId,
            semesterName: savedSem.semesterName,
            sgpa: savedSem.sgpa,
            runningCgpa: savedSem.runningCgpa,
            creditsEarned: savedSem.creditsEarned,
            courses: savedSem.courses,
          };
        }
        return {
          success: false,
          sessionExpired: true,
          error: "VTOP session expired. Please re-authenticate with VTOP to fetch fresh records for this semester.",
        };
      }

      const $tt = cheerio.load(ttData);
      const enrolledCoursesList = [];
      const theoryCourses = new Map();
      const labCourses = new Map();
      const projectCourses = new Map();
      const theorySlots = new Map();
      const labSlots = new Map();
      const projectSlots = new Map();

      const detailsContainer = $tt("#studentDetailsList");
      if (detailsContainer.length > 0) {
        const table = detailsContainer.find("table").first();
        const headings = table.find("th").map((_, c) => $tt(c).text().trim().toLowerCase()).get();

        let courseIdx = -1, creditsIdx = -1, slotVenueIdx = -1, facultyIdx = -1;
        headings.forEach((h, i) => {
          if (h === "course" || h.includes("course title") || h.includes("course name")) courseIdx = i;
          else if (h === "l t p j c" || h.includes("ltpjc") || h.includes("credits")) creditsIdx = i;
          else if (h.includes("slot") || h.includes("venue")) slotVenueIdx = i;
          else if (h.includes("faculty")) facultyIdx = i;
        });

        const cells = table.find("td");
        const headingOffset = headings.length > 0 && headings[0].includes("invoice") ? -1 : 0;
        const cellOffset = cells.length > 0 && $tt(cells[0]).text().toLowerCase().includes("invoice") ? 1 : 0;
        const offset = headingOffset + cellOffset;

        let cIdx = courseIdx, crIdx = creditsIdx, svIdx = slotVenueIdx, fIdx = facultyIdx;

        while (cIdx >= 0 && crIdx >= 0 && svIdx >= 0 && fIdx >= 0 &&
               cIdx + offset < cells.length && crIdx + offset < cells.length &&
               svIdx + offset < cells.length && fIdx + offset < cells.length) {

          const rawCourse = $tt(cells[cIdx + offset]).text().replace(/\t/g, "").replace(/\n/g, " ").trim();
          const rawCourseType = rawCourse.split("(").slice(-1)[0]?.toLowerCase() || "";
          const rawCredits = $tt(cells[crIdx + offset]).text().replace(/\t/g, "").replace(/\n/g, " ").trim().split(" ");
          const rawSlotVenue = $tt(cells[svIdx + offset]).text().replace(/\t/g, "").replace(/\n/g, "").split("-");
          const rawFaculty = $tt(cells[fIdx + offset]).text().replace(/\t/g, "").replace(/\n/g, "").split("-");

          const code = rawCourse.split("-")[0]?.trim() || "";
          const title = rawCourse.split("-").slice(1).join("-").split("(")[0]?.trim() || "";

          let type = "theory";
          if (rawCourseType.includes("lab")) type = "lab";
          else if (rawCourseType.includes("project")) type = "project";
          else if (rawCourseType.includes("embed") || rawCourseType.includes("eth")) type = "embedded";

          const totalCredits = parseInt(rawCredits[rawCredits.length - 1], 10) || null;
          const slotsArray = rawSlotVenue[0] ? rawSlotVenue[0].trim().split("+") : [];
          const venue = rawSlotVenue.slice(1).join(" - ").trim() || "";
          const faculty = rawFaculty[0]?.trim() || "";

          if (code && code.length >= 4) {
            const courseId = enrolledCoursesList.length + 1;
            const courseObj = {
              id: courseId,
              code,
              title,
              type,
              credits: totalCredits,
              slot: slotsArray[0] || "",
              slots: slotsArray,
              venue,
              faculty,
              attendance: {
                attended: null,
                total: null,
                absent: null,
                percentage: null,
                status: "not_recorded",
                safeBunks: null,
                requiredToRecover: null,
              },
              marks: [],
              grade: "",
              gradePoint: null,
              studyMaterialUrl: getStudyMaterialUrl(code, title),
            };

            enrolledCoursesList.push(courseObj);

            if (type === "lab") {
              labCourses.set(courseId, courseObj);
              slotsArray.forEach((s) => labSlots.set(s.trim(), courseId));
            } else if (type === "project") {
              projectCourses.set(courseId, courseObj);
              slotsArray.forEach((s) => projectSlots.set(s.trim(), courseId));
            } else {
              theoryCourses.set(courseId, courseObj);
              slotsArray.forEach((s) => theorySlots.set(s.trim(), courseId));
            }
          }

          cIdx += headings.length + headingOffset;
          crIdx += headings.length + headingOffset;
          svIdx += headings.length + headingOffset;
          fIdx += headings.length + headingOffset;
        }
      }

      try {
        const attRes = await client.post(
          "processViewStudentAttendance",
          `_csrf=${csrf}&semesterSubId=${semesterId}&authorizedID=${authorizedId}`,
          { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
        );

        if (attRes.data) {
          const $att = cheerio.load(attRes.data);
          const attTable = $att("#getStudentDetails");

          if (attTable.length > 0) {
            const headings = attTable.find("th").map((_, c) => $att(c).text().trim().toLowerCase()).get();

            let courseTypeIdx = -1, slotIdx = -1, attendedIdx = -1, totalIdx = -1, pctIdx = -1;
            headings.forEach((h, i) => {
              if (h.includes("course") && h.includes("type")) courseTypeIdx = i;
              else if (h.includes("slot")) slotIdx = i;
              else if (h.includes("attended")) attendedIdx = i;
              else if (h.includes("total")) totalIdx = i;
              else if (h.includes("percentage") || h.includes("%")) pctIdx = i;
            });

            const cells = attTable.find("td");
            let ct = courseTypeIdx, sl = slotIdx, at = attendedIdx, to = totalIdx, pc = pctIdx;

            while (ct >= 0 && sl >= 0 && at >= 0 && to >= 0 &&
                   ct < cells.length && sl < cells.length && at < cells.length && to < cells.length) {

              const rawCourseType = $att(cells[ct]).text().trim().toLowerCase();
              const rawSlot = $att(cells[sl]).text().trim().split("+")[0]?.trim() || "";
              const attended = parseInt($att(cells[at]).text().trim(), 10) || 0;
              const total = parseInt($att(cells[to]).text().trim(), 10) || 0;
              let percentage = pc >= 0 && pc < cells.length ? parseInt($att(cells[pc]).text().trim(), 10) : null;

              if (percentage === null || isNaN(percentage)) {
                percentage = total > 0 ? Math.floor((attended * 100) / total) : 0;
              }

              const absent = Math.max(0, total - attended);
              const status = percentage < 75 ? "debarred" : percentage < 80 ? "warning" : "safe";
              const safeBunks = Math.max(0, Math.floor(attended / 0.75 - total));
              const requiredToRecover = percentage < 75 ? Math.max(0, Math.ceil(3 * total - 4 * attended)) : 0;

              let matchedCourse = null;
              if (rawCourseType.includes("lab")) {
                const cId = labSlots.get(rawSlot);
                matchedCourse = cId ? labCourses.get(cId) : null;
              } else if (rawCourseType.includes("project")) {
                const cId = projectSlots.get(rawSlot);
                matchedCourse = cId ? projectCourses.get(cId) : null;
              } else {
                const cId = theorySlots.get(rawSlot);
                matchedCourse = cId ? theoryCourses.get(cId) : null;
              }

              if (!matchedCourse) {
                matchedCourse = enrolledCoursesList.find((c) => c.slots?.includes(rawSlot) || c.slot === rawSlot);
              }

              if (matchedCourse) {
                matchedCourse.attendance = {
                  attended,
                  total,
                  absent,
                  percentage,
                  status,
                  safeBunks,
                  requiredToRecover,
                };
              }

              ct += headings.length;
              sl += headings.length;
              at += headings.length;
              to += headings.length;
              if (pc >= 0) pc += headings.length;
            }
          }
        }
      } catch (attErr) {
        console.warn("[VTOP Live] Attendance fetch warning:", attErr.message);
      }

      try {
        const gradeViewRes = await client.post(
          "examinations/examGradeView/doStudentGradeView",
          `semesterSubId=${semesterId}&authorizedID=${authorizedId}&_csrf=${csrf}`,
          { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
        );

        if (gradeViewRes.data && !gradeViewRes.data.toLowerCase().includes("no records")) {
          const $gr = cheerio.load(gradeViewRes.data);
          const table = $gr("table").first();

          if (table.length > 0) {
            const headings = table.find("th").map((_, c) => $gr(c).text().trim().toLowerCase()).get();
            let codeIdx = -1, gradeIdx = -1;
            headings.forEach((h, i) => {
              if (h.includes("code")) codeIdx = i;
              else if (h.includes("grade")) gradeIdx = i;
            });

            table.find("tr").slice(1).each((_, row) => {
              const cells = $gr(row).find("td");
              if (codeIdx >= 0 && gradeIdx >= 0 && cells.length > Math.max(codeIdx, gradeIdx)) {
                const code = $gr(cells[codeIdx]).text().trim().toUpperCase();
                const grade = $gr(cells[gradeIdx]).text().trim().toUpperCase();

                const course = enrolledCoursesList.find((c) => c.code === code);
                if (course) {
                  course.grade = grade;
                  course.gradePoint = getGradePoints(grade);
                }
              }
            });
          }
        }
      } catch (grErr) {
        console.warn("[VTOP Live] Grade view warning:", grErr.message);
      }

      const semNameMatch = vtop.availableSemesters?.find((s) => s.id === semesterId)?.name || semesterId;
      const semIdx = (vtop.semesters || []).findIndex((s) => s.semesterId === semesterId || s.semesterName === semesterId);

      const semObj = {
        semesterId,
        semesterName: semNameMatch,
        sgpa: null,
        runningCgpa: vtop.currentCgpa,
        creditsEarned: enrolledCoursesList.reduce((acc, c) => acc + (Number(c.credits) || 0), 0),
        courses: enrolledCoursesList,
      };

      if (semIdx >= 0) {
        vtop.semesters[semIdx] = semObj;
      } else {
        vtop.semesters.push(semObj);
      }

      vtop.activeSemesterId = semesterId;
      await vtop.save();

      session.cookies = sessionWrapper.getCookies();
      session.updatedAt = Date.now();
      activeSessions.set(userSessionKey, session);

      return {
        success: true,
        semesterId,
        semesterName: semNameMatch,
        courses: enrolledCoursesList,
        sgpa: semObj.sgpa,
        runningCgpa: semObj.runningCgpa,
        creditsEarned: semObj.creditsEarned,
      };
    } catch (err) {
      console.error("[VTOP Live] Exception querying semester:", err.message);
      const savedSem = vtop.semesters?.find((s) => s.semesterId === semesterId || s.semesterName === semesterId);
      if (savedSem) {
        return {
          success: true,
          fromCache: true,
          semesterId: savedSem.semesterId,
          semesterName: savedSem.semesterName,
          sgpa: savedSem.sgpa,
          runningCgpa: savedSem.runningCgpa,
          creditsEarned: savedSem.creditsEarned,
          courses: savedSem.courses,
        };
      }
      return {
        success: false,
        error: `Unable to fetch data from VTOPCC: ${err.message}`,
      };
    }
  }

  const savedSem = vtop.semesters?.find((s) => s.semesterId === semesterId || s.semesterName === semesterId);
  if (savedSem) {
    return {
      success: true,
      fromCache: true,
      semesterId: savedSem.semesterId,
      semesterName: savedSem.semesterName,
      sgpa: savedSem.sgpa,
      runningCgpa: savedSem.runningCgpa,
      creditsEarned: savedSem.creditsEarned,
      courses: savedSem.courses,
    };
  }

  return {
    success: false,
    sessionExpired: true,
    error: "VTOP session expired. Please authenticate with VTOP to fetch fresh records for this semester.",
  };
}

export function getGradePoints(grade) {
  if (!grade) return null;
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
      return null;
  }
}

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

    const sgpa = semGradedCredits > 0 ? Number((semGradePoints / semGradedCredits).toFixed(2)) : null;

    cumTotalCredits += semTotalCredits;
    cumGradedCredits += semGradedCredits;
    cumGradePoints += semGradePoints;
    cumEarnedCredits += semEarnedCredits;
    const runningCgpa = cumGradedCredits > 0 ? Number((cumGradePoints / cumGradedCredits).toFixed(2)) : null;

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
        gradePoint: getGradePoints(c.grade),
        studyMaterialUrl: getStudyMaterialUrl(c.courseCode, c.courseTitle),
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
      overallCgpa: cumGradedCredits > 0 ? Number((cumGradePoints / cumGradedCredits).toFixed(2)) : null,
    },
  };
}

function parseAvailableSemesters($) {
  const semesters = [];
  $("select[name='semesterSubId'] option, #semesterSubId option, select option").each((_, el) => {
    const val = $(el).val()?.trim();
    const text = $(el).text()?.trim();
    if (val && val !== "" && !val.toLowerCase().includes("select") && !val.toLowerCase().includes("choose")) {
      if (!semesters.some((s) => s.id === val)) {
        semesters.push({ id: val, name: text || val });
      }
    }
  });
  return semesters;
}

async function harvestAllVtopData(client, authorizedId, csrf, vtopDoc, requestedSemesterId) {
  try {
    let activeSem = requestedSemesterId || vtopDoc.activeSemesterId || "";

    try {
      const semRes = await client.post(
        "academics/common/StudentTimeTableChn",
        `_csrf=${csrf}&authorizedID=${authorizedId}&verifyMenu=true&nocache=${Date.now()}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
      );
      if (semRes.data) {
        const $sem = cheerio.load(semRes.data);
        const discovered = parseAvailableSemesters($sem);
        if (discovered.length > 0) {
          vtopDoc.availableSemesters = discovered;
          if (!activeSem) {
            activeSem = discovered[0].id;
          }
        }
      }
    } catch (e) {
      console.warn("[VTOP Harvest] Semester discovery warning:", e.message);
    }

    if (activeSem) {
      vtopDoc.activeSemesterId = activeSem;
    }

    try {
      const profileRes = await client.post(
        "studentsRecord/StudentProfileAllView",
        `verifyMenu=true&authorizedID=${authorizedId}&_csrf=${csrf}&nocache=${Date.now()}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
      );

      if (profileRes.data) {
        const $ = cheerio.load(profileRes.data);
        $("table td").each((idx, el) => {
          const key = $(el).text().trim().toLowerCase();
          const nextVal = $(el).next("td").text().trim();

          if (key.includes("student") && key.includes("name") && nextVal) {
            vtopDoc.studentName = nextVal;
          } else if (key.includes("reg") && key.includes("no") && nextVal) {
            vtopDoc.regNo = nextVal.toUpperCase();
          } else if (key.includes("programme") && nextVal) {
            vtopDoc.program = nextVal;
          } else if (key.includes("branch") && nextVal) {
            vtopDoc.branch = nextVal;
          } else if (key.includes("school") && nextVal) {
            vtopDoc.school = nextVal;
          } else if (key.includes("campus") && nextVal) {
            vtopDoc.campus = nextVal;
          } else if (key.includes("gender") && nextVal) {
            vtopDoc.gender = nextVal;
          } else if (key.includes("blood") && nextVal) {
            vtopDoc.bloodGroup = nextVal;
          } else if (key.includes("mobile") && nextVal) {
            vtopDoc.mobile = nextVal;
          } else if (key.includes("email") && nextVal) {
            vtopDoc.email = nextVal;
          } else if (key.includes("date of birth") || key.includes("dob")) {
            if (nextVal) vtopDoc.dob = nextVal;
          }
        });
      }
    } catch (e) {
      console.warn("[VTOP Harvest] Profile details fetch warning:", e.message);
    }

    let gradeRecords = [];
    try {
      const gradeHistRes = await client.post(
        "examinations/examGradeView/StudentGradeHistory",
        `verifyMenu=true&authorizedID=${authorizedId}&_csrf=${csrf}&nocache=${Date.now()}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
      );

      if (gradeHistRes.data) {
        const $ = cheerio.load(gradeHistRes.data);

        $("table.customTable").first().find("tr.tableContent td").each((idx, el) => {
          const text = $(el).text().trim();
          if (idx === 1 && text && !vtopDoc.studentName) vtopDoc.studentName = text;
          else if (idx === 2 && text && !vtopDoc.program) vtopDoc.program = text;
          else if (idx === 8 && text && !vtopDoc.school) vtopDoc.school = text;
        });

        $(".box-title, .panel-title, h4").each((_, el) => {
          if ($(el).text().toLowerCase().includes("cgpa") || $(el).text().toLowerCase().includes("grade")) {
            const table = $(el).closest(".box, .panel, div").find("table");
            const headerCells = table.find("thead td, thead th, tr").first().find("th, td").map((_, c) => $(c).text().trim().toLowerCase()).get();
            const dataRows = table.find("tbody tr");
            const targetRow = dataRows.length > 0 ? dataRows.first() : table.find("tr").eq(1);
            const dataCells = targetRow.find("td").map((_, c) => $(c).text().trim()).get();

            headerCells.forEach((header, idx) => {
              const val = dataCells[idx];
              if (!val) return;
              if (header.includes("cgpa")) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed)) vtopDoc.currentCgpa = parsed;
              } else if (header.includes("credits earned") || header.includes("earned credits")) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed)) vtopDoc.totalCreditsEarned = parsed;
              } else if (header.includes("credits registered") || header.includes("registered credits")) {
                const parsed = parseFloat(val);
                if (!isNaN(parsed)) {
                  vtopDoc.totalCreditsRegistered = parsed;
                }
              }
            });
          }
        });

        if (vtopDoc.currentCgpa === null) {
          $("table").each((_, table) => {
            const trs = $(table).find("tr");
            if (trs.length >= 2) {
              const firstRowText = trs.first().text().toLowerCase();
              if (firstRowText.includes("credits") && firstRowText.includes("cgpa")) {
                const headings = trs.first().find("td, th").map((_, c) => $(c).text().trim().toLowerCase()).get();
                const cells = trs.eq(1).find("td, th").map((_, c) => $(c).text().trim()).get();
                headings.forEach((h, i) => {
                  if (h.includes("cgpa") && cells[i]) {
                    const parsed = parseFloat(cells[i]);
                    if (!isNaN(parsed)) vtopDoc.currentCgpa = parsed;
                  }
                  if (h.includes("earned") && cells[i]) {
                    const parsed = parseFloat(cells[i]);
                    if (!isNaN(parsed)) vtopDoc.totalCreditsEarned = parsed;
                  }
                });
              }
            }
          });
        }

        let activeArrears = 0;
        let historyArrears = 0;

        $("table.customTable, table").each((_, table) => {
          $(table).find("tr.tableContent, tr").each((_, row) => {
            if ($(row).attr("id") && $(row).attr("id").startsWith("detailsView_")) return;
            const cells = $(row).find("td");
            if (cells.length >= 6) {
              const col1 = $(cells[1]).text().trim();
              const col2 = $(cells[2]).text().trim();

              if (col1 && col2 && col1.length >= 4 && /[A-Z]{3,4}\d{3,4}/.test(col1)) {
                const code = col1.toUpperCase();
                const title = col2;
                const type = $(cells[3]).text().trim();
                const credits = parseFloat($(cells[4]).text().trim()) || null;
                const grade = $(cells[5]).text().trim().toUpperCase();
                const examMonth = cells.length >= 7 ? $(cells[6]).text().trim() : "";
                const isArrear = grade === "F" || grade === "N";

                if (isArrear) {
                  activeArrears++;
                  historyArrears++;
                }

                gradeRecords.push({
                  courseCode: code,
                  courseTitle: title,
                  courseType: type || "Theory",
                  credits,
                  grade,
                  gradePoint: getGradePoints(grade),
                  semester: examMonth,
                  isArrear,
                });
              }
            }
          });
        });

        if (gradeRecords.length > 0) {
          vtopDoc.gradeHistory = gradeRecords;
          vtopDoc.activeBacklogs = activeArrears;
          vtopDoc.historyOfBacklogs = Math.max(historyArrears, activeArrears);
        }
      }
    } catch (e) {
      console.warn("[VTOP Harvest] Grade history fetch warning:", e.message);
    }

    const theoryCourses = new Map();
    const labCourses = new Map();
    const projectCourses = new Map();
    const theorySlots = new Map();
    const labSlots = new Map();
    const projectSlots = new Map();

    const enrolledCoursesList = [];

    try {
      const timetableRes = await client.post(
        "processViewTimeTable",
        `_csrf=${csrf}&semesterSubId=${activeSem}&authorizedID=${authorizedId}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
      );

      if (timetableRes.data) {
        const $ = cheerio.load(timetableRes.data);
        const detailsContainer = $("#studentDetailsList");

        if (detailsContainer.length > 0) {
          const table = detailsContainer.find("table").first();
          const headings = table.find("th").map((_, c) => $(c).text().trim().toLowerCase()).get();

          let courseIdx = -1, creditsIdx = -1, slotVenueIdx = -1, facultyIdx = -1;
          headings.forEach((h, i) => {
            if (h === "course" || h.includes("course title") || h.includes("course name")) courseIdx = i;
            else if (h === "l t p j c" || h.includes("ltpjc") || h.includes("credits")) creditsIdx = i;
            else if (h.includes("slot") || h.includes("venue")) slotVenueIdx = i;
            else if (h.includes("faculty")) facultyIdx = i;
          });

          const cells = table.find("td");
          const headingOffset = headings.length > 0 && headings[0].includes("invoice") ? -1 : 0;
          const cellOffset = cells.length > 0 && $(cells[0]).text().toLowerCase().includes("invoice") ? 1 : 0;
          const offset = headingOffset + cellOffset;

          let cIdx = courseIdx, crIdx = creditsIdx, svIdx = slotVenueIdx, fIdx = facultyIdx;

          while (cIdx >= 0 && crIdx >= 0 && svIdx >= 0 && fIdx >= 0 &&
                 cIdx + offset < cells.length && crIdx + offset < cells.length &&
                 svIdx + offset < cells.length && fIdx + offset < cells.length) {

            const rawCourse = $(cells[cIdx + offset]).text().replace(/\t/g, "").replace(/\n/g, " ").trim();
            const rawCourseType = rawCourse.split("(").slice(-1)[0]?.toLowerCase() || "";
            const rawCredits = $(cells[crIdx + offset]).text().replace(/\t/g, "").replace(/\n/g, " ").trim().split(" ");
            const rawSlotVenue = $(cells[svIdx + offset]).text().replace(/\t/g, "").replace(/\n/g, "").split("-");
            const rawFaculty = $(cells[fIdx + offset]).text().replace(/\t/g, "").replace(/\n/g, "").split("-");

            const code = rawCourse.split("-")[0]?.trim() || "";
            const title = rawCourse.split("-").slice(1).join("-").split("(")[0]?.trim() || "";

            let type = "theory";
            if (rawCourseType.includes("lab")) type = "lab";
            else if (rawCourseType.includes("project")) type = "project";
            else if (rawCourseType.includes("embed") || rawCourseType.includes("eth")) type = "embedded";

            const totalCredits = parseInt(rawCredits[rawCredits.length - 1], 10) || null;
            const slotsArray = rawSlotVenue[0] ? rawSlotVenue[0].trim().split("+") : [];
            const venue = rawSlotVenue.slice(1).join(" - ").trim() || "";
            const faculty = rawFaculty[0]?.trim() || "";

            if (code && code.length >= 4) {
              const courseId = enrolledCoursesList.length + 1;
              const courseObj = {
                id: courseId,
                code,
                title,
                type,
                credits: totalCredits,
                slot: slotsArray[0] || "",
                slots: slotsArray,
                venue,
                faculty,
                attendance: {
                  attended: null,
                  total: null,
                  absent: null,
                  percentage: null,
                  status: "not_recorded",
                  safeBunks: null,
                  requiredToRecover: null,
                },
                marks: [],
                grade: "",
                gradePoint: null,
                studyMaterialUrl: getStudyMaterialUrl(code, title),
              };

              enrolledCoursesList.push(courseObj);

              if (type === "lab") {
                labCourses.set(courseId, courseObj);
                slotsArray.forEach((s) => labSlots.set(s.trim(), courseId));
              } else if (type === "project") {
                projectCourses.set(courseId, courseObj);
                slotsArray.forEach((s) => projectSlots.set(s.trim(), courseId));
              } else {
                theoryCourses.set(courseId, courseObj);
                slotsArray.forEach((s) => theorySlots.set(s.trim(), courseId));
              }
            }

            cIdx += headings.length + headingOffset;
            crIdx += headings.length + headingOffset;
            svIdx += headings.length + headingOffset;
            fIdx += headings.length + headingOffset;
          }
        }
      }
    } catch (e) {
      console.warn("[VTOP Harvest] Timetable fetch warning:", e.message);
    }

    try {
      const attRes = await client.post(
        "processViewStudentAttendance",
        `_csrf=${csrf}&semesterSubId=${activeSem}&authorizedID=${authorizedId}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
      );

      if (attRes.data) {
        const $ = cheerio.load(attRes.data);
        const table = $("#getStudentDetails");

        if (table.length > 0) {
          const headings = table.find("th").map((_, c) => $(c).text().trim().toLowerCase()).get();

          let courseTypeIdx = -1, slotIdx = -1, attendedIdx = -1, totalIdx = -1, pctIdx = -1;
          headings.forEach((h, i) => {
            if (h.includes("course") && h.includes("type")) courseTypeIdx = i;
            else if (h.includes("slot")) slotIdx = i;
            else if (h.includes("attended")) attendedIdx = i;
            else if (h.includes("total")) totalIdx = i;
            else if (h.includes("percentage") || h.includes("%")) pctIdx = i;
          });

          const cells = table.find("td");
          let ct = courseTypeIdx, sl = slotIdx, at = attendedIdx, to = totalIdx, pc = pctIdx;

          let aggregateAttended = 0;
          let aggregateConducted = 0;

          while (ct >= 0 && sl >= 0 && at >= 0 && to >= 0 &&
                 ct < cells.length && sl < cells.length && at < cells.length && to < cells.length) {

            const rawCourseType = $(cells[ct]).text().trim().toLowerCase();
            const rawSlot = $(cells[sl]).text().trim().split("+")[0]?.trim() || "";
            const attended = parseInt($(cells[at]).text().trim(), 10) || 0;
            const total = parseInt($(cells[to]).text().trim(), 10) || 0;
            let percentage = pc >= 0 && pc < cells.length ? parseInt($(cells[pc]).text().trim(), 10) : null;

            if (percentage === null || isNaN(percentage)) {
              percentage = total > 0 ? Math.floor((attended * 100) / total) : 0;
            }

            const absent = Math.max(0, total - attended);
            const status = percentage < 75 ? "debarred" : percentage < 80 ? "warning" : "safe";
            const safeBunks = Math.max(0, Math.floor(attended / 0.75 - total));
            const requiredToRecover = percentage < 75 ? Math.max(0, Math.ceil(3 * total - 4 * attended)) : 0;

            aggregateAttended += attended;
            aggregateConducted += total;

            let matchedCourse = null;
            if (rawCourseType.includes("lab")) {
              const cId = labSlots.get(rawSlot);
              matchedCourse = cId ? labCourses.get(cId) : null;
            } else if (rawCourseType.includes("project")) {
              const cId = projectSlots.get(rawSlot);
              matchedCourse = cId ? projectCourses.get(cId) : null;
            } else {
              const cId = theorySlots.get(rawSlot);
              matchedCourse = cId ? theoryCourses.get(cId) : null;
            }

            if (!matchedCourse) {
              matchedCourse = enrolledCoursesList.find((c) => c.slots?.includes(rawSlot) || c.slot === rawSlot);
            }

            if (matchedCourse) {
              matchedCourse.attendance = {
                attended,
                total,
                absent,
                percentage,
                status,
                safeBunks,
                requiredToRecover,
              };
            }

            ct += headings.length;
            sl += headings.length;
            at += headings.length;
            to += headings.length;
            if (pc >= 0) pc += headings.length;
          }

          if (aggregateConducted > 0) {
            vtopDoc.totalClassesAttended = aggregateAttended;
            vtopDoc.totalClassesConducted = aggregateConducted;
            vtopDoc.overallAttendancePercentage = Math.floor((aggregateAttended * 100) / aggregateConducted);
          }
        }
      }
    } catch (e) {
      console.warn("[VTOP Harvest] Attendance fetch warning:", e.message);
    }

    try {
      const gradeViewRes = await client.post(
        "examinations/examGradeView/doStudentGradeView",
        `semesterSubId=${activeSem}&authorizedID=${authorizedId}&_csrf=${csrf}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
      );

      if (gradeViewRes.data && !gradeViewRes.data.toLowerCase().includes("no records")) {
        const $ = cheerio.load(gradeViewRes.data);
        const table = $("table").first();

        if (table.length > 0) {
          const headings = table.find("th").map((_, c) => $(c).text().trim().toLowerCase()).get();
          let codeIdx = -1, gradeIdx = -1;
          headings.forEach((h, i) => {
            if (h.includes("code")) codeIdx = i;
            else if (h.includes("grade")) gradeIdx = i;
          });

          table.find("tr").slice(1).each((_, row) => {
            const cells = $(row).find("td");
            if (codeIdx >= 0 && gradeIdx >= 0 && cells.length > Math.max(codeIdx, gradeIdx)) {
              const code = $(cells[codeIdx]).text().trim().toUpperCase();
              const grade = $(cells[gradeIdx]).text().trim().toUpperCase();

              const course = enrolledCoursesList.find((c) => c.code === code);
              if (course) {
                course.grade = grade;
                course.gradePoint = getGradePoints(grade);
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn("[VTOP Harvest] Semester grade view warning:", e.message);
    }

    try {
      const proctorRes = await client.post(
        "proctor/viewProctorDetails",
        `verifyMenu=true&authorizedID=${authorizedId}&_csrf=${csrf}&nocache=${Date.now()}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded", Referer: `${VTOP_BASE_URL}/init/page` } }
      );

      if (proctorRes.data) {
        const $ = cheerio.load(proctorRes.data);
        $("#showDetails td, table td").each((idx, el) => {
          const key = $(el).text().trim().toLowerCase();
          const nextVal = $(el).next("td").text().trim();
          if (key.includes("proctor") && key.includes("name") && nextVal) vtopDoc.proctor.name = nextVal;
          else if (key.includes("email") && nextVal) vtopDoc.proctor.email = nextVal;
          else if (key.includes("mobile") && nextVal) vtopDoc.proctor.mobile = nextVal;
          else if (key.includes("cabin") && nextVal) vtopDoc.proctor.cabin = nextVal;
          else if (key.includes("school") || key.includes("dept") && nextVal) vtopDoc.proctor.department = nextVal;
        });
      }
    } catch (e) {
      console.warn("[VTOP Harvest] Proctor details fetch warning:", e.message);
    }

    const semGPAData = computeSemesterWiseGPA(gradeRecords);
    const historicalSemesters = semGPAData?.semesters || [];

    const semNameMatch = vtopDoc.availableSemesters?.find((s) => s.id === activeSem)?.name || activeSem;

    if (enrolledCoursesList.length > 0) {
      const activeSemObj = {
        semesterId: activeSem,
        semesterName: semNameMatch,
        sgpa: null,
        runningCgpa: vtopDoc.currentCgpa,
        creditsEarned: enrolledCoursesList.reduce((acc, c) => acc + (Number(c.credits) || 0), 0),
        courses: enrolledCoursesList,
      };

      const existingIdx = historicalSemesters.findIndex((s) => s.semesterId === activeSem || s.semesterName === semNameMatch);
      if (existingIdx >= 0) {
        historicalSemesters[existingIdx].courses = enrolledCoursesList;
        vtopDoc.semesters = historicalSemesters;
      } else {
        vtopDoc.semesters = [activeSemObj, ...historicalSemesters];
      }
    } else if (historicalSemesters.length > 0) {
      vtopDoc.semesters = historicalSemesters;
    }

    if (!vtopDoc.availableSemesters || vtopDoc.availableSemesters.length === 0) {
      vtopDoc.availableSemesters = vtopDoc.semesters?.map((s) => ({
        id: s.semesterId,
        name: s.semesterName,
      })) || (activeSem ? [{ id: activeSem, name: semNameMatch }] : []);
    }
  } catch (err) {
    console.error("[VTOP Harvest] Critical harvest error:", err.message);
  }
}
